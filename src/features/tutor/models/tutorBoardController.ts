/**
 * Pure board action controller using chess.js.
 * Validates and executes board manipulation actions dispatched by the AI Tutor,
 * maintains state synchronization, enforces chess rules, and manages demonstration vs practice modes.
 */

import { Chess, type Square } from 'chess.js';
import type {
  TutorBoardAction,
  TutorBoardState,
  TutorMode,
} from '../types';

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const INITIAL_TUTOR_BOARD_STATE: TutorBoardState = {
  fen: STARTING_FEN,
  mode: 'free_play',
  boardOrientation: 'white',
  selectedSquare: null,
  legalMovesForSelected: [],
  lastMove: null,
  isCheck: false,
  customHighlights: {},
  customArrows: [],
  moveHistory: [],
  activeExercise: null,
  activeLesson: null,
};

export class TutorBoardController {
  /**
   * Validates if a square string is a valid algebraic chess coordinate (a1..h8).
   */
  static isValidSquare(sq: string): sq is Square {
    return /^[a-h][1-8]$/i.test(sq);
  }

  /**
   * Validates FEN string using chess.js.
   */
  static isValidFen(fen: string): boolean {
    if (!fen || typeof fen !== 'string') return false;
    try {
      const chess = new Chess(fen);
      return chess.fen() !== '';
    } catch {
      return false;
    }
  }

  /**
   * Applies a single validated AI board action to the current state.
   */
  static applyAction(
    currentState: TutorBoardState,
    action: TutorBoardAction
  ): { nextState: TutorBoardState; error?: string } {
    switch (action.type) {
      case 'set_position': {
        if (!this.isValidFen(action.fen)) {
          return {
            nextState: currentState,
            error: `Invalid FEN position provided: ${action.fen}`,
          };
        }
        const chess = new Chess(action.fen);
        return {
          nextState: {
            ...currentState,
            fen: chess.fen(),
            isCheck: chess.inCheck(),
            lastMove: null,
            selectedSquare: null,
            legalMovesForSelected: [],
            customHighlights: {},
            customArrows: [],
            moveHistory: [],
          },
        };
      }

      case 'move_piece': {
        const chess = new Chess(currentState.fen);
        const from = action.from.toLowerCase() as Square;
        const to = action.to.toLowerCase() as Square;

        if (!this.isValidSquare(from) || !this.isValidSquare(to)) {
          return {
            nextState: currentState,
            error: `Invalid squares for move: ${action.from} -> ${action.to}`,
          };
        }

        try {
          const moveRes = chess.move({
            from,
            to,
            promotion: action.promotion,
          });

          if (!moveRes) {
            return {
              nextState: currentState,
              error: `Illegal move requested: ${action.from} to ${action.to}`,
            };
          }

          return {
            nextState: {
              ...currentState,
              fen: chess.fen(),
              isCheck: chess.inCheck(),
              lastMove: { from, to },
              selectedSquare: null,
              legalMovesForSelected: [],
              moveHistory: [
                ...currentState.moveHistory,
                { from, to, san: moveRes.san },
              ],
            },
          };
        } catch (err) {
          return {
            nextState: currentState,
            error: `Failed to execute move ${action.from}->${action.to}: ${err instanceof Error ? err.message : String(err)}`,
          };
        }
      }

      case 'highlight_square': {
        const sq = action.square.toLowerCase();
        if (!this.isValidSquare(sq)) {
          return { nextState: currentState, error: `Invalid square: ${action.square}` };
        }
        const color = action.color || 'rgba(214, 179, 106, 0.45)';
        return {
          nextState: {
            ...currentState,
            customHighlights: {
              ...currentState.customHighlights,
              [sq]: {
                backgroundColor: color,
                boxShadow: `inset 0 0 0 2px ${color}`,
              },
            },
          },
        };
      }

      case 'highlight_squares': {
        const newHighlights = { ...currentState.customHighlights };
        const color = action.color || 'rgba(214, 179, 106, 0.45)';
        for (const sqRaw of action.squares) {
          const sq = sqRaw.toLowerCase();
          if (this.isValidSquare(sq)) {
            newHighlights[sq] = {
              backgroundColor: color,
              boxShadow: `inset 0 0 0 2px ${color}`,
            };
          }
        }
        return {
          nextState: {
            ...currentState,
            customHighlights: newHighlights,
          },
        };
      }

      case 'show_legal_moves': {
        const sq = action.square.toLowerCase() as Square;
        if (!this.isValidSquare(sq)) {
          return { nextState: currentState, error: `Invalid square: ${action.square}` };
        }
        const chess = new Chess(currentState.fen);
        const legalMoves = chess.moves({ square: sq, verbose: true }).map((m) => m.to);
        return {
          nextState: {
            ...currentState,
            selectedSquare: sq,
            legalMovesForSelected: legalMoves,
          },
        };
      }

      case 'clear_highlights': {
        return {
          nextState: {
            ...currentState,
            customHighlights: {},
            selectedSquare: null,
            legalMovesForSelected: [],
          },
        };
      }

      case 'show_arrow': {
        const from = action.from.toLowerCase() as Square;
        const to = action.to.toLowerCase() as Square;
        if (!this.isValidSquare(from) || !this.isValidSquare(to)) {
          return { nextState: currentState, error: `Invalid arrow coordinates: ${action.from}->${action.to}` };
        }
        const color = action.color || 'rgb(214, 179, 106)';
        return {
          nextState: {
            ...currentState,
            customArrows: [...currentState.customArrows, [from, to, color]],
          },
        };
      }

      case 'clear_arrows': {
        return {
          nextState: {
            ...currentState,
            customArrows: [],
          },
        };
      }

      case 'flip_board': {
        const newOrientation =
          action.orientation || (currentState.boardOrientation === 'white' ? 'black' : 'white');
        return {
          nextState: {
            ...currentState,
            boardOrientation: newOrientation,
          },
        };
      }

      case 'reset_board': {
        return {
          nextState: {
            ...currentState,
            fen: STARTING_FEN,
            boardOrientation: 'white',
            selectedSquare: null,
            legalMovesForSelected: [],
            lastMove: null,
            isCheck: false,
            customHighlights: {},
            customArrows: [],
            moveHistory: [],
            activeExercise: null,
            mode: 'free_play',
          },
        };
      }

      case 'request_student_move': {
        return {
          nextState: {
            ...currentState,
            mode: 'practice',
            selectedSquare: null,
            legalMovesForSelected: [],
          },
        };
      }

      case 'start_position_exercise': {
        if (!this.isValidFen(action.initialFen)) {
          return { nextState: currentState, error: 'Invalid exercise FEN' };
        }
        const chess = new Chess(action.initialFen);
        return {
          nextState: {
            ...currentState,
            fen: chess.fen(),
            isCheck: chess.inCheck(),
            mode: 'practice',
            lastMove: null,
            customHighlights: {},
            customArrows: [],
            selectedSquare: null,
            legalMovesForSelected: [],
            activeExercise: {
              id: `ex-${Date.now()}`,
              initialFen: chess.fen(),
              objective: action.objective,
              targetMoves: [action.targetMove],
              opponentReply: action.opponentReply
                ? {
                    from: action.opponentReply.slice(0, 2),
                    to: action.opponentReply.slice(2, 4),
                    san: action.opponentReply,
                  }
                : undefined,
              completed: false,
              attempts: 0,
            },
          },
        };
      }

      case 'end_position_exercise': {
        return {
          nextState: {
            ...currentState,
            mode: 'free_play',
            activeExercise: null,
          },
        };
      }

      case 'show_solution': {
        // If an active exercise is present with targetMove, demonstrate the target move
        if (currentState.activeExercise && currentState.activeExercise.targetMoves.length > 0) {
          const target = currentState.activeExercise.targetMoves[0];
          const chess = new Chess(currentState.fen);
          try {
            const moveRes = chess.move(target);
            if (moveRes) {
              return {
                nextState: {
                  ...currentState,
                  fen: chess.fen(),
                  isCheck: chess.inCheck(),
                  lastMove: { from: moveRes.from, to: moveRes.to },
                  customHighlights: {
                    [moveRes.from]: { backgroundColor: 'rgba(52, 211, 153, 0.35)' },
                    [moveRes.to]: { backgroundColor: 'rgba(52, 211, 153, 0.45)' },
                  },
                },
              };
            }
          } catch {
            // continue
          }
        }
        return { nextState: currentState };
      }

      default:
        return { nextState: currentState };
    }
  }

  /**
   * Sequentially applies multiple board actions.
   */
  static applyActions(
    initialState: TutorBoardState,
    actions: TutorBoardAction[]
  ): { finalState: TutorBoardState; errors: string[] } {
    let state = initialState;
    const errors: string[] = [];

    for (const action of actions) {
      const res = this.applyAction(state, action);
      if (res.error) {
        errors.push(res.error);
      }
      state = res.nextState;
    }

    return { finalState: state, errors };
  }

  /**
   * Handles a student's attempted move on the board during practice or free play.
   */
  static handleStudentMove(
    currentState: TutorBoardState,
    from: string,
    to: string,
    promotion?: 'q' | 'r' | 'b' | 'n'
  ): {
    nextState: TutorBoardState;
    isValid: boolean;
    isCorrect?: boolean;
    isExerciseCompleted?: boolean;
    feedback?: string;
    playedSan?: string;
  } {
    const chess = new Chess(currentState.fen);
    const fromSq = from.toLowerCase() as Square;
    const toSq = to.toLowerCase() as Square;

    let moveRes;
    try {
      moveRes = chess.move({ from: fromSq, to: toSq, promotion: promotion || 'q' });
    } catch {
      return {
        nextState: currentState,
        isValid: false,
        feedback: 'That move is not legal in this position.',
      };
    }

    if (!moveRes) {
      return {
        nextState: currentState,
        isValid: false,
        feedback: 'Illegal move.',
      };
    }

    const playedSan = moveRes.san;
    const playedUci = `${from}${to}${moveRes.promotion || ''}`.toLowerCase();

    // Check if active exercise is being practiced
    if (currentState.activeExercise && !currentState.activeExercise.completed) {
      const exercise = currentState.activeExercise;
      const targetMatches = exercise.targetMoves.some((target) => {
        const normTarget = target.trim().replace(/[+#x=]/g, '').toLowerCase();
        const normPlayed = playedSan.replace(/[+#x=]/g, '').toLowerCase();
        return (
          playedUci === target.toLowerCase() ||
          playedSan === target ||
          normPlayed === normTarget
        );
      });

      if (targetMatches) {
        // Correct move!
        let nextFen = chess.fen();
        let lastMove = { from: fromSq, to: toSq };
        const moveHistory = [
          ...currentState.moveHistory,
          { from: fromSq, to: toSq, san: playedSan },
        ];

        // If opponent auto-reply is defined, play it
        if (exercise.opponentReply) {
          try {
            const oppMove = chess.move(exercise.opponentReply.san);
            if (oppMove) {
              nextFen = chess.fen();
              lastMove = { from: oppMove.from, to: oppMove.to };
              moveHistory.push({ from: oppMove.from, to: oppMove.to, san: oppMove.san });
            }
          } catch {
            // continue
          }
        }

        return {
          nextState: {
            ...currentState,
            fen: nextFen,
            isCheck: chess.inCheck(),
            lastMove,
            selectedSquare: null,
            legalMovesForSelected: [],
            customHighlights: {
              [fromSq]: { backgroundColor: 'rgba(52, 211, 153, 0.35)' },
              [toSq]: { backgroundColor: 'rgba(52, 211, 153, 0.45)' },
            },
            moveHistory,
            activeExercise: {
              ...exercise,
              completed: true,
              attempts: exercise.attempts + 1,
            },
          },
          isValid: true,
          isCorrect: true,
          isExerciseCompleted: true,
          feedback: 'Excellent move! Exactly right.',
          playedSan,
        };
      } else {
        // Incorrect move for this exercise
        return {
          nextState: {
            ...currentState,
            activeExercise: {
              ...exercise,
              attempts: exercise.attempts + 1,
            },
            customHighlights: {
              [fromSq]: { backgroundColor: 'rgba(239, 68, 68, 0.35)' },
              [toSq]: { backgroundColor: 'rgba(239, 68, 68, 0.45)' },
            },
          },
          isValid: true,
          isCorrect: false,
          isExerciseCompleted: false,
          feedback: 'That is a legal move, but not the best solution for this exercise. Try again or ask for a hint!',
          playedSan,
        };
      }
    }

    // Standard free-play move
    return {
      nextState: {
        ...currentState,
        fen: chess.fen(),
        isCheck: chess.inCheck(),
        lastMove: { from: fromSq, to: toSq },
        selectedSquare: null,
        legalMovesForSelected: [],
        customHighlights: {},
        moveHistory: [
          ...currentState.moveHistory,
          { from: fromSq, to: toSq, san: playedSan },
        ],
      },
      isValid: true,
      playedSan,
    };
  }

  /**
   * Sets interaction mode (demonstration, practice, assessment, free_play).
   */
  static setMode(currentState: TutorBoardState, mode: TutorMode): TutorBoardState {
    return {
      ...currentState,
      mode,
      selectedSquare: null,
      legalMovesForSelected: [],
    };
  }
}
