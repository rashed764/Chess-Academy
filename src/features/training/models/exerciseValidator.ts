/**
 * Pure chess exercise validator using chess.js.
 * Handles single-move solutions, multi-move branches with opponent auto-replies,
 * alternative acceptable solutions, and deterministic feedback messages.
 */

import { Chess, type Square } from 'chess.js';
import type { ChessExercise } from '../types';

export interface MoveAttemptResult {
  isValidMove: boolean;
  isCorrectMove: boolean;
  isExerciseComplete: boolean;
  sanPlayed: string;
  nextFen: string;
  opponentReplySan?: string;
  feedbackMessage: string;
  currentStepIndex: number;
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
        nextFen: currentFen,
        feedbackMessage: 'Invalid position state. Resetting exercise position.',
        currentStepIndex,
      };
    }

    // 1. Authoritative chess.js legality check
    let moveRes;
    try {
      moveRes = chess.move({
        from: from as Square,
        to: to as Square,
        promotion: promotionPiece,
      });
    } catch {
      // Illegal move syntax or illegal target
      moveRes = null;
    }

    if (!moveRes) {
      return {
        isValidMove: false,
        isCorrectMove: false,
        isExerciseComplete: false,
        sanPlayed: '',
        nextFen: currentFen,
        feedbackMessage: 'Illegal move according to chess rules. Please choose a legal move.',
        currentStepIndex,
      };
    }

    const sanPlayed = moveRes.san;
    const currentStep = exercise.steps[currentStepIndex];

    if (!currentStep) {
      return {
        isValidMove: true,
        isCorrectMove: false,
        isExerciseComplete: true,
        sanPlayed,
        nextFen: chess.fen(),
        feedbackMessage: 'Exercise already completed.',
        currentStepIndex,
      };
    }

    // 2. Check correctness against step expectations or alternative solutions
    const cleanSan = (s: string) => s.replace(/[+#x=]/g, '').trim();
    const normalizedPlayed = sanPlayed.replace(/[+#]$/, '');
    const expectedNormalized = currentStep.playerMoveSan.replace(/[+#]$/, '');

    const isMatchPrimary =
      sanPlayed === currentStep.playerMoveSan ||
      normalizedPlayed === expectedNormalized ||
      cleanSan(sanPlayed) === cleanSan(currentStep.playerMoveSan);

    // Check alternative solutions on step 0 if configured
    let isMatchAlternative = false;
    if (currentStepIndex === 0 && exercise.alternativeSolutionsSan) {
      isMatchAlternative = exercise.alternativeSolutionsSan.some(
        (alt) =>
          alt === sanPlayed ||
          alt.replace(/[+#]$/, '') === normalizedPlayed ||
          cleanSan(alt) === cleanSan(sanPlayed)
      );
    }

    const isCorrect = isMatchPrimary || isMatchAlternative;

    if (!isCorrect) {
      return {
        isValidMove: true,
        isCorrectMove: false,
        isExerciseComplete: false,
        sanPlayed,
        nextFen: currentFen, // Don't advance fen on incorrect move
        feedbackMessage: `The move ${sanPlayed} is legal, but does not satisfy the exercise objective. Try again!`,
        currentStepIndex,
      };
    }

    // User move was correct!
    let updatedFen = chess.fen();
    const hasMoreSteps = currentStepIndex < exercise.steps.length - 1;

    // 3. Handle opponent auto-reply if this is a multi-step puzzle
    let opponentReplySan: string | undefined;

    if (currentStep.opponentReplySan && hasMoreSteps) {
      try {
        const replyRes = chess.move(currentStep.opponentReplySan);
        if (replyRes) {
          opponentReplySan = replyRes.san;
          updatedFen = chess.fen();
        }
      } catch {
        // Fallback: Opponent move could not be made
      }
    }

    const isExerciseComplete = !hasMoreSteps;
    const nextStepIndex = isExerciseComplete ? currentStepIndex : currentStepIndex + 1;

    return {
      isValidMove: true,
      isCorrectMove: true,
      isExerciseComplete,
      sanPlayed,
      nextFen: updatedFen,
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
      try {
        const playerMove = chess.move(step.playerMoveSan);
        if (!playerMove) {
          return {
            isValid: false,
            error: `Step ${i}: Illegal player move '${step.playerMoveSan}'`,
          };
        }
      } catch (err) {
        return {
          isValid: false,
          error: `Step ${i}: Player move failed '${step.playerMoveSan}' (${err instanceof Error ? err.message : String(err)})`,
        };
      }

      if (step.opponentReplySan) {
        try {
          const opponentMove = chess.move(step.opponentReplySan);
          if (!opponentMove) {
            return {
              isValid: false,
              error: `Step ${i}: Illegal opponent move '${step.opponentReplySan}'`,
            };
          }
        } catch (err) {
          return {
            isValid: false,
            error: `Step ${i}: Opponent move failed '${step.opponentReplySan}' (${err instanceof Error ? err.message : String(err)})`,
          };
        }
      }
    }

    return { isValid: true };
  }
}
