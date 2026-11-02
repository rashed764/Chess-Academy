/**
 * Types and interfaces for Stockfish WASM Web Worker and UCI protocol.
 */

import type { EngineEvaluation } from '../../../types/chess';
import type { EngineSearchOptions, EngineStatus } from '../types';

export interface UCIScore {
  type: 'cp' | 'mate';
  value: number; // Centipawns or moves to mate (+ for white/side advantage, - for deficit)
}

export interface UCIInfoParsed {
  depth?: number;
  seldepth?: number;
  multipv?: number;
  score?: UCIScore;
  nodes?: number;
  nps?: number;
  timeMs?: number;
  pv?: string[]; // Array of UCI moves, e.g. ["e2e4", "e7e5"]
  rawLine: string;
}

export interface UCIBestMoveParsed {
  bestMove: string; // e.g. "e2e4"
  ponder?: string; // e.g. "e7e5"
  rawLine: string;
}

export interface MultiPvEntry {
  multipv: number;
  depth: number;
  scoreCentipawns?: number;
  mateInMoves?: number;
  nodes?: number;
  nps?: number;
  timeMs?: number;
  pv: string[];
  pvString: string;
  bestMoveUci?: string;
  bestMoveSan?: string;
}

export type EngineEventCallback = (evaluation: EngineEvaluation) => void;

export interface EngineSearchRequest {
  id: number;
  fen: string;
  options: EngineSearchOptions;
  resolve: (evalResult: EngineEvaluation) => void;
  reject: (err: Error) => void;
  onUpdate?: EngineEventCallback;
  latestEvaluation?: EngineEvaluation;
}

export interface EngineMoveRequest {
  id: number;
  fen: string;
  options: EngineSearchOptions;
  resolve: (bestMoveUci: string) => void;
  reject: (err: Error) => void;
}
