/**
 * Pure, deterministic UCI protocol parser and command builder.
 * Decoupled from Web Worker or DOM APIs for comprehensive unit testability.
 */

import type { EngineSearchOptions } from '../types';
import type { UCIBestMoveParsed, UCIInfoParsed, UCIScore } from './EngineTypes';

export class UCIProtocol {
  /**
   * Formats a "position" UCI command from starting position or custom FEN,
   * optionally appending a move history.
   */
  static formatPosition(fen?: string, movesUci?: string[]): string {
    const isStartPos = !fen || fen === 'startpos' || fen.startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq');
    let cmd = isStartPos ? 'position startpos' : `position fen ${fen.trim()}`;

    if (movesUci && movesUci.length > 0) {
      cmd += ` moves ${movesUci.join(' ')}`;
    }

    return cmd;
  }

  /**
   * Formats a "go" UCI search command based on search parameters.
   */
  static formatGo(options?: EngineSearchOptions): string {
    const parts: string[] = ['go'];

    if (options?.timeLimitMs && options.timeLimitMs > 0) {
      parts.push(`movetime ${Math.max(50, Math.floor(options.timeLimitMs))}`);
    } else if (options?.depth && options.depth > 0) {
      parts.push(`depth ${Math.min(50, Math.max(1, Math.floor(options.depth)))}`);
    } else {
      // Sensible default depth for quick response
      parts.push('depth 15');
    }

    return parts.join(' ');
  }

  /**
   * Parses an "info ..." response line from Stockfish.
   * Example: "info depth 12 seldepth 16 multipv 1 score cp 34 nodes 15234 nps 820000 time 18 pv e2e4 e7e5 g1f3"
   */
  static parseInfoLine(line: string): UCIInfoParsed | null {
    if (!line.startsWith('info ')) {
      return null;
    }

    const tokens = line.trim().split(/\s+/);
    const parsed: UCIInfoParsed = {
      rawLine: line,
    };

    let i = 1;
    while (i < tokens.length) {
      const token = tokens[i];

      if (token === 'depth' && i + 1 < tokens.length) {
        parsed.depth = parseInt(tokens[i + 1], 10);
        i += 2;
      } else if (token === 'seldepth' && i + 1 < tokens.length) {
        parsed.seldepth = parseInt(tokens[i + 1], 10);
        i += 2;
      } else if (token === 'multipv' && i + 1 < tokens.length) {
        parsed.multipv = parseInt(tokens[i + 1], 10);
        i += 2;
      } else if (token === 'score' && i + 2 < tokens.length) {
        const scoreType = tokens[i + 1];
        const val = parseInt(tokens[i + 2], 10);
        if (scoreType === 'cp') {
          parsed.score = { type: 'cp', value: val };
        } else if (scoreType === 'mate') {
          parsed.score = { type: 'mate', value: val };
        }
        i += 3;
      } else if (token === 'nodes' && i + 1 < tokens.length) {
        parsed.nodes = parseInt(tokens[i + 1], 10);
        i += 2;
      } else if (token === 'nps' && i + 1 < tokens.length) {
        parsed.nps = parseInt(tokens[i + 1], 10);
        i += 2;
      } else if (token === 'time' && i + 1 < tokens.length) {
        parsed.timeMs = parseInt(tokens[i + 1], 10);
        i += 2;
      } else if (token === 'pv') {
        // All remaining tokens belong to principal variation
        parsed.pv = tokens.slice(i + 1);
        break;
      } else {
        i += 1;
      }
    }

    return parsed;
  }

  /**
   * Parses a "bestmove ..." response line from Stockfish.
   * Example: "bestmove e2e4 ponder e7e5" or "bestmove (none)"
   */
  static parseBestMove(line: string): UCIBestMoveParsed | null {
    if (!line.startsWith('bestmove ')) {
      return null;
    }

    const tokens = line.trim().split(/\s+/);
    const bestMove = tokens[1] || '';

    let ponder: string | undefined;
    const ponderIdx = tokens.indexOf('ponder');
    if (ponderIdx !== -1 && ponderIdx + 1 < tokens.length) {
      ponder = tokens[ponderIdx + 1];
    }

    return {
      bestMove,
      ponder,
      rawLine: line,
    };
  }

  /**
   * Normalizes an engine score (which is relative to the active player) to White's perspective.
   * Standard convention: positive = White advantage, negative = Black advantage.
   */
  static normalizeScoreToWhite(score: UCIScore, activeColor: 'w' | 'b'): {
    scoreCentipawns?: number;
    mateInMoves?: number;
  } {
    const sign = activeColor === 'b' ? -1 : 1;

    if (score.type === 'cp') {
      return { scoreCentipawns: score.value * sign };
    }

    if (score.type === 'mate') {
      return { mateInMoves: score.value * sign };
    }

    return {};
  }

  /**
   * Formats an evaluation into human-readable notation (e.g. "+0.34", "-1.50", "M3", "-M2").
   */
  static formatEvaluationText(scoreCentipawns?: number, mateInMoves?: number): string {
    if (mateInMoves !== undefined && mateInMoves !== null) {
      return mateInMoves > 0 ? `M${mateInMoves}` : `-M${Math.abs(mateInMoves)}`;
    }

    if (scoreCentipawns !== undefined && scoreCentipawns !== null) {
      const pawns = scoreCentipawns / 100;
      const formatted = pawns.toFixed(2);
      return pawns > 0 ? `+${formatted}` : formatted;
    }

    return '0.00';
  }
}
