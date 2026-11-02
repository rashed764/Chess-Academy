/**
 * Production chess engine adapter connecting the UI/features to the real Stockfish WASM engine.
 * Implements IChessEngineAdapter with dedicated Web Worker execution and graceful fallbacks.
 */

import type { EngineEvaluation } from '../../types/chess';
import { StockfishEngine } from './engine/StockfishEngine';
import type { EngineSearchOptions, EngineStatus, IChessEngineAdapter } from './types';

export class StockfishChessEngineAdapter implements IChessEngineAdapter {
  private engine: StockfishEngine;

  constructor() {
    this.engine = new StockfishEngine();
  }

  get engineName(): string {
    return this.engine.engineName;
  }

  get status(): EngineStatus {
    return this.engine.status;
  }

  async init(): Promise<void> {
    await this.engine.init();
  }

  async isReady(): Promise<boolean> {
    return this.engine.isReady();
  }

  async setPosition(fen: string, movesUci?: string[]): Promise<void> {
    await this.engine.setPosition(fen, movesUci);
  }

  async evaluatePosition(fen: string, options?: EngineSearchOptions): Promise<EngineEvaluation> {
    return this.engine.evaluatePosition(fen, options);
  }

  async findBestMove(fen: string, options?: EngineSearchOptions): Promise<string> {
    return this.engine.findBestMove(fen, options);
  }

  async stopSearch(): Promise<void> {
    await this.engine.stopSearch();
  }

  async setSkillLevel(level: number): Promise<void> {
    await this.engine.setSkillLevel(level);
  }

  terminate(): void {
    this.engine.terminate();
  }

  onEvaluationUpdate(callback: (evaluation: EngineEvaluation) => void): void {
    this.engine.onEvaluationUpdate(callback);
  }
}

/**
 * Fallback adapter preserved for unconfigured environments or strict unit tests.
 */
export class UnconfiguredChessEngineAdapter implements IChessEngineAdapter {
  readonly engineName = 'Stockfish WASM (Unconfigured)';
  private _status: EngineStatus = 'uninitialized';

  get status(): EngineStatus {
    return this._status;
  }

  async init(): Promise<void> {
    this._status = 'uninitialized';
  }

  async isReady(): Promise<boolean> {
    return false;
  }

  async setPosition(_fen: string, _movesUci?: string[]): Promise<void> {
    throw new Error('Stockfish engine is uninitialized.');
  }

  async evaluatePosition(_fen: string, _options?: EngineSearchOptions): Promise<EngineEvaluation> {
    throw new Error('Stockfish evaluation requires engine initialization.');
  }

  async findBestMove(_fen: string, _options?: EngineSearchOptions): Promise<string> {
    throw new Error('Stockfish best-move calculation requires engine initialization.');
  }

  async stopSearch(): Promise<void> {
    // No-op
  }

  async setSkillLevel(_level: number): Promise<void> {
    // No-op
  }

  terminate(): void {
    this._status = 'terminated';
  }
}

let activeEngineInstance: IChessEngineAdapter | null = null;

export function getChessEngine(): IChessEngineAdapter {
  if (!activeEngineInstance) {
    activeEngineInstance = new StockfishChessEngineAdapter();
  }
  return activeEngineInstance;
}

export function registerChessEngineAdapter(adapter: IChessEngineAdapter): void {
  activeEngineInstance = adapter;
}
