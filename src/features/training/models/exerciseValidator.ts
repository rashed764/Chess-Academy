/**
 * Pure chess exercise validator using chess.js.
 * Handles single-move solutions, multi-move branches with opponent auto-replies,
 * alternative acceptable solutions, UCI/SAN format tolerance, and deterministic feedback messages.
 */

import { Chess, type Move, type Square } from 'chess.js';
import type { ChessColor, MoveRecord, PieceSymbol } from '../../../types/chess';
import type { ChessExercise } from '../types';

export interface OpponentReplyDetails {
  from: string;
  to: string;
  san: string;
  uci: string;
}

export interface MoveAttemptResult {
  isValidMove: boolean;
  isCorrectMove: boolean;
  isExerciseComplete: boolean;
  sanPlayed: string;
  uciPlayed: string;
  nextFen: string;
  fenBefore: string;
  playerMoveRecord?: MoveRecord;
  opponentReply?: OpponentReplyDetails;
  opponentMoveRecord?: MoveRecord;
  opponentReplySan?: string; // backwards compatibility
  feedbackMessage: string;
  currentStepIndex: number;
}

/**
 * Attempts to play a move string on the provided Chess instance,
 * resolving SAN or UCI coordinate representations safely.
 */
function playSanOrUci(chess: Chess, moveStr: string): Move | null {
  const trimmed = moveStr.trim();
  if (!trimmed) return null;

  // Normalize castling with zeros (0-0, 0-0-0) to standard SAN (O-O, O-O-O)
  const normalizedCastling = trimmed.replace(/^0-0-0$/i, 'O-O-O').replace(/^0-0$/i, 'O-O');

  // 1. Direct SAN attempt
  try {
    const res = chess.move(normalizedCastling);
    if (res) return res;
  } catch {
    // continue
  }

  // 2. UCI coordinate format (e.g. e2e4, e7e8q, e1g1)
  if (/^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(trimmed)) {
    const from = trimmed.slice(0, 2) as Square;
    const to = trimmed.slice(2, 4) as Square;
    const promotion = trimmed.length === 5 ? (trimmed[4].toLowerCase() as 'q' | 'r' | 'b' | 'n') : undefined;
    try {
      return chess.move({ from, to, promotion });
    } catch {
      // continue
    }
  }

  // 3. Fallback: inspect verbose legal moves for check/capture/promotion notation tolerance
  try {
    const legalMoves = chess.moves({ verbose: true });
    const normTarget = normalizedCastling.replace(/[+#x=]/g, '').toLowerCase();
    for (const m of legalMoves) {
      const normSan = m.san.replace(/[+#x=]/g, '').toLowerCase();
      const uci = `${m.from}${m.to}${m.promotion || ''}`.toLowerCase();
      if (normSan === normTarget || uci === trimmed.toLowerCase()) {
        return chess.move(m.san);
      }
    }
  } catch {
    // continue
  }

  return null;
}

/**
 * Checks whether an executed legal move matches the target move specification
 * in either SAN, normalized SAN, or UCI format.
 */
function doesMoveMatchTarget(
  moveRes: { san: string; from: string; to: string; promotion?: string },
  target: string
): boolean {
  const trimmed = target.trim();
  const playedUci = `${moveRes.from}${moveRes.to}${moveRes.promotion || ''}`.toLowerCase();
  const targetUci = trimmed.toLowerCase();

  // 1. Direct UCI match (e.g. "d5c7", "e7e8q", "e1g1")
  if (playedUci === targetUci) {
    return true;
  }

  // 2. Exact SAN match (with castling zeros tolerance)
  const normTargetCastling = trimmed.replace(/^0-0-0$/i, 'O-O-O').replace(/^0-0$/i, 'O-O');
  if (moveRes.san === normTargetCastling) {
    return true;
  }

  // 3. Normalized SAN (stripping trailing check/mate symbols only)
  const normPlayed = moveRes.san.replace(/[+#]+$/, '');
  const normTarget = normTargetCastling.replace(/[+#]+$/, '');
  if (normPlayed === normTarget) {
    return true;
  }

  // 4. Capture notation tolerance where unambiguous (e.g. Nc7+ vs Nxc7+)
  const stripCapture = (s: string) => s.replace(/x/g, '').replace(/[+#]+$/, '');
  if (stripCapture(moveRes.san) === stripCapture(normTargetCastling)) {
    return true;
  }

  // 5. Promotion notation tolerance (e.g. e8=Q vs e8Q)
  const stripPromo = (s: string) => s.replace(/=/g, '').replace(/[+#]+$/, '');
  if (stripPromo(moveRes.san) === stripPromo(normTargetCastling)) {
    return true;
  }

  return false;
}

export class ExerciseValidator {
  /**
   * Validates a user's move attempt on the current board position.
   */
  static evaluateUserMove(
    exercise: ChessExercise,
    currentFen: string,
    currentStepIndex: number,
    from: string,
    to: string,
    promotionPiece?: 'q' | 'r' | 'b' | 'n'
  ): MoveAttemptResult {
    const chess = new Chess();

    try {
      chess.load(currentFen);
    } catch {
      return {
        isValidMove: false,
        isCorrectMove: false,
        isExerciseComplete: false,
        sanPlayed: '',
        uciPlayed: `${from}${to}${promotionPiece || ''}`,
        nextFen: currentFen,
        fenBefore: currentFen,
        feedbackMessage: 'Invalid position state. Resetting exercise position.',
        currentStepIndex,
      };
    }

    // 1. Authoritative chess.js legality check
    let moveRes: Move | null = null;
    try {
      moveRes = chess.move({
        from: from as Square,
        to: to as Square,
        promotion: promotionPiece,
      });
    } catch {
      moveRes = null;
    }

    const uciPlayed = `${from}${to}${promotionPiece || ''}`;

    if (!moveRes) {
      return {
        isValidMove: false,
        isCorrectMove: false,
        isExerciseComplete: false,
        sanPlayed: '',
        uciPlayed,
        nextFen: currentFen,
        fenBefore: currentFen,
        feedbackMessage: 'Illegal move according to chess rules. Please choose a legal move.',
        currentStepIndex,
      };
    }

    const sanPlayed = moveRes.san;
    const playerFenAfter = chess.fen();
    const currentStep = exercise.steps[currentStepIndex];

    const playerMoveRecord: MoveRecord = {
      san: moveRes.san,
      from: moveRes.from,
      to: moveRes.to,
      uci: uciPlayed,
      piece: moveRes.piece as PieceSymbol,
      color: moveRes.color as ChessColor,
      captured: moveRes.captured as PieceSymbol | undefined,
      promotion: moveRes.promotion as PieceSymbol | undefined,
      fenBefore: currentFen,
      fenAfter: playerFenAfter,
      ply: currentStepIndex * 2 + 1,
    };

    if (!currentStep) {
      return {
        isValidMove: true,
        isCorrectMove: false,
        isExerciseComplete: true,
        sanPlayed,
        uciPlayed,
        nextFen: playerFenAfter,
        fenBefore: currentFen,
        playerMoveRecord,
        feedbackMessage: 'Exercise already completed.',
        currentStepIndex,
      };
    }

    // 2. Position-aware correctness check against step target or alternative solutions
    const isMatchPrimary = doesMoveMatchTarget(moveRes, currentStep.playerMoveSan);

    let isMatchAlternative = false;
    if (currentStepIndex === 0 && exercise.alternativeSolutionsSan) {
      isMatchAlternative = exercise.alternativeSolutionsSan.some((alt) =>
        doesMoveMatchTarget(moveRes, alt)
      );
    }

    const isCorrect = isMatchPrimary || isMatchAlternative;

    if (!isCorrect) {
      return {
        isValidMove: true,
        isCorrectMove: false,
        isExerciseComplete: false,
        sanPlayed,
        uciPlayed,
        nextFen: currentFen, // Do not advance FEN on incorrect move
        fenBefore: currentFen,
        playerMoveRecord,
        feedbackMessage: `The move ${sanPlayed} is legal, but does not satisfy the exercise objective. Try again!`,
        currentStepIndex,
      };
    }

    // User move was correct!
    let updatedFen = playerFenAfter;
    const hasMoreSteps = currentStepIndex < exercise.steps.length - 1;

    // 3. Handle opponent auto-reply if this is a multi-step puzzle
    let opponentReply: OpponentReplyDetails | undefined;
    let opponentMoveRecord: MoveRecord | undefined;
    let opponentReplySan: string | undefined;

    if (currentStep.opponentReplySan && hasMoreSteps) {
      const oppFenBefore = playerFenAfter;
      const replyRes = playSanOrUci(chess, currentStep.opponentReplySan);
      if (replyRes) {
        const oppFenAfter = chess.fen();
        const opponentUci = `${replyRes.from}${replyRes.to}${replyRes.promotion || ''}`;
        opponentReply = {
          from: replyRes.from,
          to: replyRes.to,
          san: replyRes.san,
          uci: opponentUci,
        };
        opponentMoveRecord = {
          san: replyRes.san,
          from: replyRes.from,
          to: replyRes.to,
          uci: opponentUci,
          piece: replyRes.piece as PieceSymbol,
          color: replyRes.color as ChessColor,
          captured: replyRes.captured as PieceSymbol | undefined,
          promotion: replyRes.promotion as PieceSymbol | undefined,
          fenBefore: oppFenBefore,
          fenAfter: oppFenAfter,
          ply: currentStepIndex * 2 + 2,
        };
        opponentReplySan = replyRes.san;
        updatedFen = oppFenAfter;
      }
    }

    const isExerciseComplete = !hasMoreSteps;
    const nextStepIndex = isExerciseComplete ? currentStepIndex : currentStepIndex + 1;

    return {
      isValidMove: true,
      isCorrectMove: true,
      isExerciseComplete,
      sanPlayed,
      uciPlayed,
      nextFen: updatedFen,
      fenBefore: currentFen,
      playerMoveRecord,
      opponentReply,
      opponentMoveRecord,
      opponentReplySan,
      feedbackMessage: isExerciseComplete
        ? currentStep.explanation || exercise.explanation || 'Exercise completed with excellence!'
        : currentStep.explanation || `Correct move! Opponent played ${opponentReplySan || ''}. Find the next move!`,
      currentStepIndex: nextStepIndex,
    };
  }

  /**
   * Returns all legal destination squares for a selected piece in the given FEN.
   */
  static getLegalMovesForSquare(fen: string, square: Square): string[] {
    try {
      const chess = new Chess(fen);
      const moves = chess.moves({ square, verbose: true });
      return moves.map((m) => m.to);
    } catch {
      return [];
    }
  }

  /**
   * Verifies that a FEN string and move sequence are completely valid.
   * Supports both SAN and UCI notations for player and opponent moves.
   */
  static verifyExerciseData(exercise: ChessExercise): {
    isValid: boolean;
    error?: string;
  } {
    const chess = new Chess();
    try {
      chess.load(exercise.initialFen);
    } catch (err) {
      return {
        isValid: false,
        error: `Invalid initial FEN: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    if (chess.turn() !== exercise.playerSide) {
      return {
        isValid: false,
        error: `Active turn mismatch: FEN says ${chess.turn()} but exercise says ${exercise.playerSide}`,
      };
    }

    for (let i = 0; i < exercise.steps.length; i++) {
      const step = exercise.steps[i];
      const playerMove = playSanOrUci(chess, step.playerMoveSan);
      if (!playerMove) {
        return {
          isValid: false,
          error: `Step ${i}: Illegal player move '${step.playerMoveSan}'`,
        };
      }

      if (step.opponentReplySan) {
        const opponentMove = playSanOrUci(chess, step.opponentReplySan);
        if (!opponentMove) {
          return {
            isValid: false,
            error: `Step ${i}: Illegal opponent move '${step.opponentReplySan}'`,
          };
        }
      }
    }

    return { isValid: true };
  }
}

