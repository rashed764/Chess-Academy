import { Chess } from 'chess.js';
import type { MoveQuality } from '../../../types/ai';
import type { ChessColor } from '../../../types/chess';
import type { GamePhase } from '../types';

export interface MoveAnalysisEvaluation {
  evalLossCp?: number;
  quality: MoveQuality;
  boundaryRule: string;
  isMateBlunder?: boolean;
}

/**
 * Converts White-positive score and mate metrics into mover perspective.
 * Positive = mover advantage, Negative = mover disadvantage.
 */
export function convertToMoverPerspective(
  cp?: number,
  mate?: number,
  moverColor: ChessColor = 'w'
): { moverCp?: number; moverMate?: number } {
  const moverMate = mate !== undefined && mate !== null
    ? (moverColor === 'w' ? mate : -mate)
    : undefined;

  const moverCp = cp !== undefined && cp !== null
    ? (moverColor === 'w' ? cp : -cp)
    : undefined;

  return { moverCp, moverMate };
}

/**
 * Evaluates move quality and centipawn loss from mover's perspective with explicit mate-score transition handling.
 *
 * Exact Educational Boundary Thresholds (mover perspective):
 * - 'best':        evalLoss <= 10 cp (or matches engine best move, or preserves/delivers forced mate)
 * - 'good':        10 cp < evalLoss <= 30 cp
 * - 'inaccuracy':  30 cp < evalLoss <= 90 cp
 * - 'mistake':     90 cp < evalLoss <= 200 cp
 * - 'blunder':     evalLoss > 200 cp (or blunders into forced mate / forfeits existing forced mate)
 * - 'brilliant':   sound tactical sacrifice maintaining decisive mover advantage (scoreAfterForMover >= 150 cp or mate)
 * - 'unclassified': missing evaluations or insufficient search depth (< 6 ply)
 */
export function evaluateMoveQuality(
  scoreBeforeWhiteCp?: number,
  scoreAfterWhiteCp?: number,
  moverColor: ChessColor = 'w',
  isBestMove: boolean = false,
  isSacrifice: boolean = false,
  options?: {
    mateBefore?: number;
    mateAfter?: number;
    depthBefore?: number;
    depthAfter?: number;
  }
): MoveAnalysisEvaluation {
  // 1. Verify minimum search depth (6 ply)
  if (options?.depthBefore !== undefined && options.depthBefore < 6) {
    return {
      quality: 'unclassified',
      boundaryRule: `Insufficient engine depth before move (${options.depthBefore} < 6 ply)`,
    };
  }
  if (options?.depthAfter !== undefined && options.depthAfter < 6) {
    return {
      quality: 'unclassified',
      boundaryRule: `Insufficient engine depth after move (${options.depthAfter} < 6 ply)`,
    };
  }

  const { moverCp: beforeMoverCp, moverMate: beforeMoverMate } =
    convertToMoverPerspective(scoreBeforeWhiteCp, options?.mateBefore, moverColor);

  const { moverCp: afterMoverCp, moverMate: afterMoverMate } =
    convertToMoverPerspective(scoreAfterWhiteCp, options?.mateAfter, moverColor);

  // 2. Explicit Mate-Score Transitions (No raw subtraction)
  // Case A: Mover had a forced mate (beforeMoverMate > 0)
  if (beforeMoverMate !== undefined && beforeMoverMate > 0) {
    if (afterMoverMate !== undefined && afterMoverMate > 0) {
      // Forced mate maintained or delivered
      return {
        evalLossCp: 0,
        quality: 'best',
        boundaryRule: 'Forced mate sequence preserved or shortened',
      };
    }
    // Player lost forced mate!
    return {
      quality: 'blunder',
      isMateBlunder: true,
      boundaryRule: 'Forfeited forced mate advantage',
    };
  }

  // Case B: Mover blundered into being mated (afterMoverMate < 0 while before was not being mated in 1-2)
  if (afterMoverMate !== undefined && afterMoverMate < 0) {
    if (beforeMoverMate === undefined || beforeMoverMate >= 0) {
      return {
        quality: 'blunder',
        isMateBlunder: true,
        boundaryRule: 'Allowed forced mate against mover',
      };
    }
  }

  // 3. Check for missing evaluations
  if (beforeMoverCp === undefined || afterMoverCp === undefined) {
    if (isBestMove) {
      return {
        evalLossCp: 0,
        quality: 'best',
        boundaryRule: 'Matched engine best move (numerical eval pending)',
      };
    }
    return {
      quality: 'unclassified',
      boundaryRule: 'Missing engine evaluation',
    };
  }

  // 4. Brilliant move criteria
  // Requires: isBestMove + isSacrifice + decisive advantage maintained (>= 150 cp or mate)
  if (isBestMove && isSacrifice) {
    if (afterMoverCp >= 150 || (afterMoverMate !== undefined && afterMoverMate > 0)) {
      return {
        evalLossCp: 0,
        quality: 'brilliant',
        boundaryRule: 'Brilliant: sound sacrifice maintaining decisive advantage (>= +1.5 pawns or mate)',
      };
    }
    return {
      evalLossCp: 0,
      quality: 'best',
      boundaryRule: 'Best move (sacrifice lacked decisive advantage)',
    };
  }

  if (isBestMove) {
    return {
      evalLossCp: 0,
      quality: 'best',
      boundaryRule: 'Matched engine recommendation (evalLoss = 0 cp)',
    };
  }

  // 5. Standard centipawn loss calculation
  // evalLoss = beforeMover - afterMover (positive when position worsened for mover)
  const loss = beforeMoverCp - afterMoverCp;
  const evalLossCp = Math.max(0, loss);

  if (evalLossCp <= 10) {
    return {
      evalLossCp,
      quality: 'best',
      boundaryRule: 'evalLoss <= 10 cp (Best)',
    };
  }
  if (evalLossCp <= 30) {
    return {
      evalLossCp,
      quality: 'good',
      boundaryRule: '10 cp < evalLoss <= 30 cp (Good)',
    };
  }
  if (evalLossCp <= 90) {
    return {
      evalLossCp,
      quality: 'inaccuracy',
      boundaryRule: '30 cp < evalLoss <= 90 cp (Inaccuracy)',
    };
  }
  if (evalLossCp <= 200) {
    return {
      evalLossCp,
      quality: 'mistake',
      boundaryRule: '90 cp < evalLoss <= 200 cp (Mistake)',
    };
  }
  return {
    evalLossCp,
    quality: 'blunder',
    boundaryRule: 'evalLoss > 200 cp (Blunder)',
  };
}

/**
 * Classifies chess game phase (Opening, Middlegame, Endgame) using position-based material inspection.
 *
 * Rules:
 * - Endgame: When both sides have no queens, OR total non-pawn material (Q=9, R=5, B=3, N=3) is <= 13 per side.
 * - Opening: When ply <= 20 and development is incomplete (major pieces remain, queens on board).
 * - Middlegame: All developed positions with tactical / positional combat between Opening and Endgame.
 */
export function classifyGamePhase(fen: string, ply: number): GamePhase {
  try {
    const chess = new Chess(fen);
    const board = chess.board();

    let whiteNonPawnMaterial = 0;
    let blackNonPawnMaterial = 0;
    let whiteHasQueen = false;
    let blackHasQueen = false;

    const pieceValues: Record<string, number> = {
      q: 9,
      r: 5,
      b: 3,
      n: 3,
    };

    for (const row of board) {
      for (const square of row) {
        if (!square) continue;
        const val = pieceValues[square.type.toLowerCase()] || 0;
        if (square.color === 'w') {
          whiteNonPawnMaterial += val;
          if (square.type === 'q') whiteHasQueen = true;
        } else {
          blackNonPawnMaterial += val;
          if (square.type === 'q') blackHasQueen = true;
        }
      }
    }

    // Endgame criteria: Queens traded off OR non-pawn material depleted <= 13 points each side
    if ((!whiteHasQueen && !blackHasQueen) || (whiteNonPawnMaterial <= 13 && blackNonPawnMaterial <= 13)) {
      return 'endgame';
    }

    // Opening criteria: First 20 plies (10 moves) before significant piece liquidation
    if (ply <= 20 && whiteNonPawnMaterial >= 20 && blackNonPawnMaterial >= 20) {
      return 'opening';
    }

    return 'middlegame';
  } catch {
    return ply <= 20 ? 'opening' : ply >= 60 ? 'endgame' : 'middlegame';
  }
}

/**
 * Custom educational accuracy heuristic:
 * accuracy = 100 * exp(-0.004 * ACPL)
 *
 * Note: This is an educational accuracy estimation heuristic, NOT an official FIDE formula.
 * Yields ~96% for ACPL 10, ~85% for ACPL 40, ~67% for ACPL 100, ~45% for ACPL 200.
 */
export function calculateAccuracyFromAcpl(acpl: number): number {
  if (isNaN(acpl) || acpl < 0) return 100;
  const raw = 100 * Math.exp(-0.004 * acpl);
  return Math.min(100, Math.max(0, Math.round(raw * 10) / 10));
}
