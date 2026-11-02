/**
 * Dedicated Stockfish Web Worker engine manager.
 * Manages engine lifecycle, UCI synchronization, request versioning, MultiPV aggregation, and evaluation streaming.
 */

import { Chess } from 'chess.js';
import type { EngineEvaluation } from '../../../types/chess';
import { parseFen, validateFenStructure } from '../fen';
import type { EngineSearchOptions, EngineStatus } from '../types';
import type {
  EngineEventCallback,
  EngineMoveRequest,
  EngineSearchRequest,
  MultiPvEntry,
  UCIInfoParsed,
} from './EngineTypes';
import { UCIProtocol } from './UCIProtocol';

export class StockfishEngine {
  private worker: Worker | null = null;
  private _status: EngineStatus = 'uninitialized';
  private _isReady = false;
  private _skillLevel = 10;
  private _activeRequestId = 0;

  // Active in-flight requests
  private _currentSearchRequest: EngineSearchRequest | null = null;
  private _currentMoveRequest: EngineMoveRequest | null = null;

  // Global listener for continuous evaluation updates
  private _evaluationCallback: EngineEventCallback | null = null;

  // Multi-PV structured map for the active search: multipv index (1-based) -> MultiPvEntry
  private _multiPvMap: Map<number, MultiPvEntry> = new Map();

  // Ready-waiter queue for UCI synchronization
  private _readyResolvers: Array<() => void> = [];

  readonly engineName = 'Stockfish 10 WASM (Multi-Variant)';

  get status(): EngineStatus {
    return this._status;
  }

  get skillLevel(): number {
    return this._skillLevel;
  }

  /**
   * Initializes the Web Worker and performs the UCI handshake (uci -> uciok -> isready -> readyok).
   */
  async init(): Promise<void> {
    if (this._status === 'ready' && this.worker) {
      return;
    }

    // Clean up any stale worker if re-initializing from terminated/error
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        // Safe cleanup
      }
      this.worker = null;
    }

    if (typeof Worker === 'undefined') {
      this._status = 'error';
      throw new Error('Web Workers are not supported in this runtime environment.');
    }

    this._status = 'loading';

    try {
      const wasmSupported =
        typeof WebAssembly === 'object' &&
        typeof WebAssembly.validate === 'function' &&
        WebAssembly.validate(new Uint8Array([0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]));

      const workerPath = wasmSupported ? '/stockfish/stockfish.wasm.js' : '/stockfish/stockfish.js';
      this.worker = new Worker(workerPath);

      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);

      // Perform handshake
      await this.sendCommandAndWaitFor('uci', 'uciok', 6000);
      await this.sendCommandAndWaitFor('isready', 'readyok', 4000);

      // Set initial defaults
      this.postCommand(`setoption name Skill Level value ${this._skillLevel}`);
      this.postCommand('ucinewgame');
      await this.sendCommandAndWaitFor('isready', 'readyok', 4000);

      this._status = 'ready';
      this._isReady = true;
    } catch (err) {
      this._status = 'error';
      this._isReady = false;
      this.terminate();
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  async isReady(): Promise<boolean> {
    if (!this.worker || this._status === 'terminated' || this._status === 'error') {
      return false;
    }

    if (this._isReady && this._status === 'ready') {
      return true;
    }

    try {
      await this.sendCommandAndWaitFor('isready', 'readyok', 3000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sets the active board position in the engine.
   */
  async setPosition(fen: string, movesUci?: string[]): Promise<void> {
    this.ensureReady();

    // Validate position with chess.js
    const chess = new Chess();
    if (fen && fen !== 'startpos') {
      try {
        chess.load(fen);
      } catch (e) {
        throw new Error(`Invalid FEN position: ${fen} (${e instanceof Error ? e.message : String(e)})`);
      }
    }

    const cmd = UCIProtocol.formatPosition(fen, movesUci);
    this.postCommand(cmd);
  }

  /**
   * Evaluates a chess position to a specified depth or time limit.
   */
  async evaluatePosition(fen: string, options?: EngineSearchOptions): Promise<EngineEvaluation> {
    this.ensureReady();

    // Validate structural and semantic legality
    const fenValidation = validateFenStructure(fen);
    if (!fenValidation.isValid) {
      throw new Error(`Invalid FEN: ${fenValidation.error}`);
    }

    const chess = new Chess();
    try {
      chess.load(fen);
    } catch (err) {
      throw new Error(`Chess.js rejected position: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Stop any ongoing search and cancel stale requests
    await this.stopSearch();

    const requestId = ++this._activeRequestId;
    this._multiPvMap.clear();

    return new Promise<EngineEvaluation>((resolve, reject) => {
      this._currentSearchRequest = {
        id: requestId,
        fen,
        options: options || {},
        resolve,
        reject,
        latestEvaluation: {
          depth: 0,
          pvLines: [],
        },
      };

      this._status = 'thinking';

      // Set MultiPV if requested
      const multiPv = options?.multiPv && options.multiPv > 1 ? options.multiPv : 1;
      this.postCommand(`setoption name MultiPV value ${multiPv}`);

      // Apply skill level if configured
      if (options?.skillLevel !== undefined) {
        this.setSkillLevel(options.skillLevel);
      }

      this.postCommand(UCIProtocol.formatPosition(fen));
      this.postCommand(UCIProtocol.formatGo(options));
    });
  }

  /**
   * Finds the single best move in UCI format (e.g. "e2e4", "g8f6", "e7e8q") for a position.
   */
  async findBestMove(fen: string, options?: EngineSearchOptions): Promise<string> {
    this.ensureReady();

    const chess = new Chess();
    try {
      chess.load(fen);
    } catch (err) {
      throw new Error(`Cannot calculate move for invalid position: ${err instanceof Error ? err.message : String(err)}`);
    }

    await this.stopSearch();

    const requestId = ++this._activeRequestId;

    return new Promise<string>((resolve, reject) => {
      this._currentMoveRequest = {
        id: requestId,
        fen,
        options: options || {},
        resolve,
        reject,
      };

      this._status = 'thinking';

      if (options?.skillLevel !== undefined) {
        this.setSkillLevel(options.skillLevel);
      }

      this.postCommand(UCIProtocol.formatPosition(fen));
      this.postCommand(UCIProtocol.formatGo(options));
    });
  }

  /**
   * Halts any active engine search.
   */
  async stopSearch(): Promise<void> {
    if (this._status !== 'thinking') {
      return;
    }

    this.postCommand('stop');

    // Allow engine to acknowledge stop and emit bestmove
    await new Promise((r) => setTimeout(r, 60));

    if (this._status === 'thinking') {
      this._status = 'ready';
    }
  }

  /**
   * Configures engine skill level (0 = Novice club, 20 = Maximum strength).
   */
  async setSkillLevel(level: number): Promise<void> {
    const clamped = Math.max(0, Math.min(20, Math.floor(level)));
    this._skillLevel = clamped;
    this.postCommand(`setoption name Skill Level value ${clamped}`);
  }

  /**
   * Registers a listener for real-time evaluation updates.
   */
  onEvaluationUpdate(callback: EngineEventCallback): void {
    this._evaluationCallback = callback;
  }

  /**
   * Terminates the worker and frees resources.
   */
  terminate(): void {
    if (this.worker) {
      try {
        this.postCommand('quit');
        this.worker.terminate();
      } catch {
        // Safe cleanup
      }
      this.worker = null;
    }

    this._status = 'terminated';
    this._isReady = false;

    if (this._currentSearchRequest) {
      this._currentSearchRequest.reject(new Error('Engine terminated during active search.'));
      this._currentSearchRequest = null;
    }

    if (this._currentMoveRequest) {
      this._currentMoveRequest.reject(new Error('Engine terminated during move calculation.'));
      this._currentMoveRequest = null;
    }
  }

  // --- Internal Message Handlers ---

  private postCommand(cmd: string): void {
    if (!this.worker) return;
    this.worker.postMessage(cmd);
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const raw = typeof event.data === 'string' ? event.data.trim() : '';
    if (!raw) return;

    // Check readyok resolvers
    if (raw === 'readyok') {
      while (this._readyResolvers.length > 0) {
        const res = this._readyResolvers.shift();
        res?.();
      }
    }

    // Handle search "info ..." messages
    if (raw.startsWith('info ') && this._currentSearchRequest) {
      const parsed = UCIProtocol.parseInfoLine(raw);
      if (parsed) {
        this.processSearchInfo(parsed);
      }
      return;
    }

    // Handle "bestmove ..." message
    if (raw.startsWith('bestmove ')) {
      const parsed = UCIProtocol.parseBestMove(raw);
      if (parsed) {
        this.processBestMove(parsed.bestMove);
      }
      return;
    }
  }

  private handleWorkerError(event: ErrorEvent): void {
    console.error('[StockfishEngine] Worker encountered error:', event.message);
    this._status = 'error';

    if (this._currentSearchRequest) {
      this._currentSearchRequest.reject(new Error(`Engine error: ${event.message}`));
      this._currentSearchRequest = null;
    }

    if (this._currentMoveRequest) {
      this._currentMoveRequest.reject(new Error(`Engine error: ${event.message}`));
      this._currentMoveRequest = null;
    }
  }

  private processSearchInfo(parsed: UCIInfoParsed): void {
    const req = this._currentSearchRequest;
    if (!req) return;

    const activeColor = parseFen(req.fen)?.activeColor ?? 'w';
    const multipvIndex = parsed.multipv ?? 1;

    const normalizedScores = parsed.score
      ? UCIProtocol.normalizeScoreToWhite(parsed.score, activeColor)
      : {};

    // Store structured multi-PV entry
    if (parsed.pv && parsed.pv.length > 0) {
      const firstMove = parsed.pv[0];
      let sanMove: string | undefined;
      try {
        const chess = new Chess(req.fen);
        const from = firstMove.slice(0, 2);
        const to = firstMove.slice(2, 4);
        const promotion = firstMove.slice(4, 5) || undefined;
        const moveRes = chess.move({ from, to, promotion });
        if (moveRes) sanMove = moveRes.san;
      } catch {
        // Fallback
      }

      const entry: MultiPvEntry = {
        multipv: multipvIndex,
        depth: parsed.depth ?? 0,
        scoreCentipawns: normalizedScores.scoreCentipawns,
        mateInMoves: normalizedScores.mateInMoves,
        nodes: parsed.nodes,
        nps: parsed.nps,
        timeMs: parsed.timeMs,
        pv: parsed.pv,
        pvString: parsed.pv.join(' '),
        bestMoveUci: firstMove,
        bestMoveSan: sanMove,
      };

      this._multiPvMap.set(multipvIndex, entry);
    }

    // Sort all PV lines numerically by multipv index (1, 2, 3...)
    const sortedEntries = Array.from(this._multiPvMap.values()).sort(
      (a, b) => a.multipv - b.multipv
    );

    // Primary evaluation is exclusively drawn from MultiPV 1
    const primaryEntry = sortedEntries.find((e) => e.multipv === 1) || sortedEntries[0];

    const evaluation: EngineEvaluation = {
      depth: (multipvIndex === 1 ? parsed.depth : primaryEntry?.depth) ?? req.latestEvaluation?.depth ?? 0,
      nodesVisited: parsed.nodes ?? req.latestEvaluation?.nodesVisited,
      pvLines: sortedEntries.map((e) => e.pvString),
    };

    if (multipvIndex === 1 && parsed.score) {
      evaluation.scoreCentipawns = normalizedScores.scoreCentipawns;
      evaluation.mateInMoves = normalizedScores.mateInMoves;
    } else if (primaryEntry) {
      evaluation.scoreCentipawns = primaryEntry.scoreCentipawns ?? req.latestEvaluation?.scoreCentipawns;
      evaluation.mateInMoves = primaryEntry.mateInMoves ?? req.latestEvaluation?.mateInMoves;
    }

    if (multipvIndex === 1 && parsed.pv && parsed.pv.length > 0) {
      evaluation.principalVariation = parsed.pv;
      evaluation.bestMoveUci = parsed.pv[0];
      if (primaryEntry?.bestMoveSan) {
        evaluation.bestMoveSan = primaryEntry.bestMoveSan;
      }
    } else if (primaryEntry) {
      evaluation.principalVariation = primaryEntry.pv;
      evaluation.bestMoveUci = primaryEntry.bestMoveUci;
      evaluation.bestMoveSan = primaryEntry.bestMoveSan;
    }

    req.latestEvaluation = evaluation;

    // Stream update to caller and global listener
    if (this._evaluationCallback) {
      this._evaluationCallback(evaluation);
    }
  }

  private processBestMove(bestMoveUci: string): void {
    this._status = 'ready';

    // Handle search evaluation resolution
    if (this._currentSearchRequest) {
      const req = this._currentSearchRequest;
      this._currentSearchRequest = null;

      const finalEval: EngineEvaluation = req.latestEvaluation || { depth: 0, pvLines: [] };

      // Engine's bestmove is the definitive best move for this position
      if (bestMoveUci && bestMoveUci !== '(none)') {
        finalEval.bestMoveUci = bestMoveUci;

        try {
          const chess = new Chess(req.fen);
          const from = bestMoveUci.slice(0, 2);
          const to = bestMoveUci.slice(2, 4);
          const promotion = bestMoveUci.slice(4, 5) || undefined;
          const moveRes = chess.move({ from, to, promotion });
          if (moveRes) {
            finalEval.bestMoveSan = moveRes.san;
          }
        } catch {
          // Fallback: SAN conversion failed
        }

        // Consistency verification: Ensure PV Line 1 begins with bestMoveUci
        if (finalEval.pvLines && finalEval.pvLines.length > 0) {
          const line1Tokens = finalEval.pvLines[0].trim().split(/\s+/);
          if (line1Tokens[0] !== bestMoveUci) {
            // Find if bestmove is in another PV line or align Line 1
            const matchingIdx = finalEval.pvLines.findIndex((l) =>
              l.trim().startsWith(bestMoveUci)
            );
            if (matchingIdx > 0) {
              // Swap so Line 1 always corresponds to bestmove
              const temp = finalEval.pvLines[0];
              finalEval.pvLines[0] = finalEval.pvLines[matchingIdx];
              finalEval.pvLines[matchingIdx] = temp;
            } else {
              // Prepend or align Line 1
              finalEval.pvLines[0] = `${bestMoveUci} ${line1Tokens.slice(1).join(' ')}`.trim();
            }
          }
        }
      }

      req.resolve(finalEval);
    }

    // Handle findBestMove resolution
    if (this._currentMoveRequest) {
      const req = this._currentMoveRequest;
      this._currentMoveRequest = null;

      // Validate legality with chess.js before returning
      const chess = new Chess(req.fen);
      let isValidMove = false;

      if (bestMoveUci && bestMoveUci !== '(none)') {
        try {
          const from = bestMoveUci.slice(0, 2);
          const to = bestMoveUci.slice(2, 4);
          const promotion = bestMoveUci.slice(4, 5) || undefined;
          const res = chess.move({ from, to, promotion });
          if (res) {
            isValidMove = true;
          }
        } catch {
          isValidMove = false;
        }
      }

      if (!isValidMove && chess.moves().length > 0) {
        req.reject(new Error(`Stockfish produced an illegal or unparseable move: '${bestMoveUci}'`));
      } else {
        req.resolve(bestMoveUci);
      }
    }
  }

  private async sendCommandAndWaitFor(cmd: string, expectedLine: string, timeoutMs: number): Promise<void> {
    if (!this.worker) {
      throw new Error('Worker is not instantiated.');
    }

    const currentWorker = this.worker;

    return new Promise<void>((resolve, reject) => {
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          reject(new Error(`Timeout (${timeoutMs}ms) waiting for '${expectedLine}' after command '${cmd}'.`));
        }
      }, timeoutMs);

      const messageListener = (event: MessageEvent) => {
        const text = typeof event.data === 'string' ? event.data.trim() : '';
        if (text === expectedLine || text.startsWith(expectedLine)) {
          if (!settled) {
            settled = true;
            cleanup();
            resolve();
          }
        }
      };

      const cleanup = () => {
        clearTimeout(timer);
        currentWorker.removeEventListener('message', messageListener);
      };

      currentWorker.addEventListener('message', messageListener);
      this.postCommand(cmd);
    });
  }

  private ensureReady(): void {
    if (this._status === 'uninitialized') {
      throw new Error('Stockfish engine has not been initialized. Call init() first.');
    }
    if (this._status === 'terminated') {
      throw new Error('Stockfish engine has been terminated.');
    }
    if (this._status === 'error') {
      throw new Error('Stockfish engine is in an error state.');
    }
  }
}
