import type { ChessColor, PieceSymbol } from '../../types/chess';
import type { MoveQuality } from '../../types/ai';
import type { DifficultyConfig } from '../quick-match/types';

export type AssessmentFormatId = 'single_match' | 'five_match_battery' | 'tactical_speed';
export type AssessmentStatus = 'setup' | 'in_progress' | 'completed' | 'abandoned';
export type GamePhase = 'opening' | 'middlegame' | 'endgame';

export interface AssessmentFormatConfig {
  id: AssessmentFormatId;
  name: string;
  tagline: string;
  description: string;
  timeControl: {
    initialMinutes: number;
    incrementSeconds: number;
    label: string;
  };
  totalGames: number;
  colorRule: 'choice' | 'alternating' | 'choice';
  purpose: string;
}

export interface AnalyzedMoveRecord {
  ply: number;
  moveNumber: number;
  color: ChessColor;
  san: string;
  from: string;
  to: string;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  fenBefore: string;
  fenAfter: string;
  spentTimeMs?: number;
  // Stockfish WASM Analysis Fields
  scoreBeforeWhiteCp?: number;
  scoreAfterWhiteCp?: number;
  mateBefore?: number;
  mateAfter?: number;
  evalLossCp?: number;
  quality: MoveQuality;
  bestMoveSan?: string;
  bestMoveUci?: string;
  analysisDepth?: number;
  phase: GamePhase;
  provenance: 'client_stockfish_wasm';
  boundaryRule?: string;
}

export interface PhaseMetrics {
  movesCount: number;
  acpl?: number;
  accuracyPercent?: number;
  classificationCounts: Record<MoveQuality, number>;
  observations: string[];
}

export interface AssessmentGameRecord {
  gameId: string;
  assessmentId: string;
  gameIndex: number; // 0-indexed
  playerColor: ChessColor;
  timeControl: {
    initialMinutes: number;
    incrementSeconds: number;
    label: string;
  };
  opponentDifficulty: DifficultyConfig;
  startedAt: string;
  completedAt: string;
  initialFen: string;
  finalFen: string;
  terminationReason: string;
  result: '1-0' | '0-1' | '1/2-1/2';
  winner: 'white' | 'black' | 'draw';
  playerWon: boolean;
  playerLost: boolean;
  isDraw: boolean;
  totalDurationSeconds: number;
  moves: AnalyzedMoveRecord[];
  analyzedMovesCount: number;
  acpl: number;
  accuracyPercent: number;
  classificationCounts: Record<MoveQuality, number>;
  phaseBreakdown: {
    opening: PhaseMetrics;
    middlegame: PhaseMetrics;
    endgame: PhaseMetrics;
  };
}

export interface EstimatedSkillRange {
  label: string;
  rangeMin: number;
  rangeMax: number;
  description: string;
  disclaimer: string;
}

export interface AssessmentReport {
  id: string;
  formatId: AssessmentFormatId;
  formatName: string;
  createdAt: string;
  completedAt?: string;
  status: AssessmentStatus;
  totalGamesScheduled: number;
  gamesCompleted: number;
  games: AssessmentGameRecord[];
  overallResults: {
    wins: number;
    losses: number;
    draws: number;
    totalMoves: number;
    playerMovesCount: number;
    acpl: number;
    accuracyPercent: number;
    classificationCounts: Record<MoveQuality, number>;
    bestMovesPercent: number;
    phaseBreakdown: {
      opening: PhaseMetrics;
      middlegame: PhaseMetrics;
      endgame: PhaseMetrics;
    };
    strengths: string[];
    weaknesses: string[];
    tacticalObservations: string[];
    timeObservations: string[];
    estimatedSkillRange?: EstimatedSkillRange;
    recommendations: string[];
    methodologyNote: string;
  };
}
