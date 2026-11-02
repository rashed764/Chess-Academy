/**
 * Core domain types for chess representations, game state, evaluation, and time controls.
 */

export type ChessColor = 'w' | 'b';
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type GameOutcomeReason =
  | 'checkmate'
  | 'stalemate'
  | 'insufficient_material'
  | 'threefold_repetition'
  | 'fifty_move_rule'
  | 'resignation'
  | 'timeout'
  | 'agreement'
  | 'abandoned';

export type GameWinner = 'white' | 'black' | 'draw' | null;

export interface TimeControl {
  initialSeconds: number;
  incrementSeconds: number;
  name: 'bullet' | 'blitz' | 'rapid' | 'classical' | 'custom' | 'unlimited';
}

export interface ChessPlayer {
  id: string;
  name: string;
  title?: 'GM' | 'IM' | 'FM' | 'CM' | 'NM' | null;
  rating?: number;
  isEngine: boolean;
  avatarUrl?: string;
}

export interface MoveRecord {
  san: string;
  from: string;
  to: string;
  piece: PieceSymbol;
  color: ChessColor;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  fenBefore: string;
  fenAfter: string;
  ply: number;
  spentTimeMs?: number;
  evaluation?: EngineEvaluation;
}

export interface EngineEvaluation {
  scoreCentipawns?: number;
  mateInMoves?: number;
  depth: number;
  bestMoveSan?: string;
  bestMoveUci?: string;
  principalVariation?: string[];
  nodesVisited?: number;
  pvLines?: string[];
}

export interface ChessGameMetadata {
  id: string;
  event: string;
  site: string;
  date: string;
  whitePlayer: ChessPlayer;
  blackPlayer: ChessPlayer;
  timeControl: TimeControl;
  initialFen: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  winner: GameWinner;
  terminationReason?: GameOutcomeReason;
  ecoCode?: string;
  openingName?: string;
  pgn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PositionAnalysis {
  fen: string;
  evaluation: EngineEvaluation;
  suggestedMoves: Array<{
    uci: string;
    san: string;
    score: number;
    explanation?: string;
  }>;
}
