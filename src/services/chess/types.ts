/**
 * Service interfaces and options for UCI chess engines (Stockfish / Web Worker engine).
 */

import type { EngineEvaluation } from '../../types/chess';

export interface EngineSearchOptions {
  depth?: number;
  timeLimitMs?: number;
  multiPv?: number;
  skillLevel?: number; // 0 to 20
  threads?: number;
  hashSizeMb?: number;
}

export type EngineStatus = 'uninitialized' | 'loading' | 'ready' | 'thinking' | 'error' | 'terminated';

/**
 * Interface that all chess engine implementations (Stockfish WASM, Web Worker, or cloud fallback)
 * must implement.
 */
export interface IChessEngineAdapter {
  readonly engineName: string;
  readonly status: EngineStatus;

  init(): Promise<void>;
  isReady(): Promise<boolean>;
  setPosition(fen: string, movesUci?: string[]): Promise<void>;
  evaluatePosition(fen: string, options?: EngineSearchOptions): Promise<EngineEvaluation>;
  findBestMove(fen: string, options?: EngineSearchOptions): Promise<string>;
  stopSearch(): Promise<void>;
  setSkillLevel(level: number): Promise<void>;
  terminate(): void;
  onEvaluationUpdate?(callback: (evaluation: EngineEvaluation) => void): void;
}
