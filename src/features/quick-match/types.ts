/**
 * Types and configurations for Quick Match gameplay.
 */

import type { ChessColor, PieceSymbol } from '../../types/chess';

export type DifficultyLevel =
  | 'beginner'
  | 'casual'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'maximum';

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  label: string;
  description: string;
  skillLevel: number; // 0 to 20 UCI Skill Level
  defaultDepth: number;
  timeRatio: number; // Fraction of remaining time allocated per move
  maxTimeMs: number; // Upper limit per search
}

export type TimeControlPresetId =
  | 'BULLET_1_0'
  | 'BULLET_2_1'
  | 'BLITZ_3_0'
  | 'BLITZ_3_2'
  | 'BLITZ_5_0'
  | 'BLITZ_5_3'
  | 'RAPID_10_0'
  | 'RAPID_15_10'
  | 'CLASSICAL_30_0'
  | 'CUSTOM';

export interface QuickMatchTimeControl {
  id: TimeControlPresetId;
  name: string;
  category: 'bullet' | 'blitz' | 'rapid' | 'classical' | 'custom';
  initialMinutes: number;
  incrementSeconds: number;
  label: string;
}

export type PlayerColorChoice = 'white' | 'black' | 'random';

export type MatchStatus = 'setup' | 'playing' | 'ended';

export type GameTerminationReason =
  | 'checkmate'
  | 'stalemate'
  | 'insufficient_material'
  | 'threefold_repetition'
  | 'fifty_move_rule'
  | 'timeout'
  | 'resignation';

export interface MoveRecordItem {
  ply: number;
  moveNumber: number;
  color: ChessColor;
  san: string;
  from: string;
  to: string;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  fenAfter: string;
  spentTimeMs?: number;
}

export interface CompletedMatchSummary {
  id: string;
  date: string;
  result: '1-0' | '0-1' | '1/2-1/2';
  winner: 'white' | 'black' | 'draw';
  playerSide: ChessColor;
  playerWon: boolean;
  playerLost: boolean;
  isDraw: boolean;
  terminationReason: GameTerminationReason;
  terminationDescription: string;
  timeControl: QuickMatchTimeControl;
  difficulty: DifficultyConfig;
  totalMoves: number;
  totalDurationSeconds: number;
  finalFen: string;
  pgn: string;
  history: MoveRecordItem[];
}
