/**
 * Adaptive Initial Skill Assessment Engine for CHESS ACADEMY Tutor.
 * Assesses 14 core chess knowledge areas using conversational and interactive board questions.
 * Produces a comprehensive Learner Profile, determines recommended starting level,
 * and identifies demonstrated strengths and knowledge gaps without claiming official FIDE rating.
 */

import type { AcademyLevelId } from '../../training/types';
import type { EducationalTopicCategory } from '../../learning-engine/types';
import type {
  AssessmentQuestion,
  AssessmentResultItem,
  InitialAssessmentState,
} from '../types';

export const INITIAL_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // 1. Board Coordinates & Center (Beginner)
  {
    id: 'q-coord-center',
    category: 'opening_principles',
    difficulty: 'beginner',
    type: 'multiple_choice',
    question: 'In chess, which four squares form the "classical center" that players fight to control from move one?',
    options: ['e4, d4, e5, d5', 'a1, h1, a8, h8', 'c3, f3, c6, f6', 'b2, g2, b7, g7'],
    correctOptionIndex: 0,
    explanation: 'The four central squares are e4, d4, e5, and d5. Controlling these squares gives your pieces maximum mobility.',
  },

  // 2. Knight Movement (Beginner)
  {
    id: 'q-knight-movement',
    category: 'piece_activity_development',
    difficulty: 'beginner',
    type: 'multiple_choice',
    question: 'What unique ability does the Knight possess that no other chess piece has?',
    options: [
      'It can jump over other pieces on the board',
      'It can move backwards twice per game',
      'It captures without occupying the target square',
      'It is immune to checks',
    ],
    correctOptionIndex: 0,
    explanation: 'The knight is the only piece on the chessboard capable of jumping over friendly or opposing pieces.',
  },

  // 3. Piece Values & Trades (Beginner)
  {
    id: 'q-piece-values',
    category: 'hanging_pieces_blunders',
    difficulty: 'beginner',
    type: 'multiple_choice',
    question: 'Standard point values: Pawn = 1, Knight/Bishop = 3, Rook = 5, Queen = 9. If you trade your Queen for a Rook and a Bishop, did you win or lose material?',
    options: [
      'Lost material (9 pts given for 8 pts gained)',
      'Won material (traded 1 piece for 2)',
      'Even trade (equal value)',
      'Depends on whether it was a dark-squared bishop',
    ],
    correctOptionIndex: 0,
    explanation: 'A Queen is worth 9 points. A Rook (5) + Bishop (3) = 8 points. Trading 9 for 8 is a net loss of 1 point.',
  },

  // 4. Special Move: Castling Requirements (Elementary)
  {
    id: 'q-castling-rules',
    category: 'king_safety',
    difficulty: 'elementary',
    type: 'multiple_choice',
    question: 'Under which of the following conditions is castling strictly ILLEGAL?',
    options: [
      'The King is currently in check, or must cross a square attacked by enemy pieces',
      'The opponent has not castled yet',
      'There is an enemy piece on the opponent side of the board',
      'More than 10 moves have been played in the game',
    ],
    correctOptionIndex: 0,
    explanation: 'You cannot castle while in check, nor can your King move through or land on a square attacked by an enemy piece.',
  },

  // 5. Special Move: En Passant (Elementary)
  {
    id: 'q-en-passant',
    category: 'tactical_patterns',
    difficulty: 'elementary',
    type: 'multiple_choice',
    question: 'When can a pawn execute the special "En Passant" (in passing) capture?',
    options: [
      'Only on the very next move immediately after an adjacent enemy pawn advances two squares',
      'Anytime during the middlegame if the pawn is on the 5th rank',
      'Only when the opponent king is in check',
      'Whenever two pawns stand side by side for at least 3 turns',
    ],
    correctOptionIndex: 0,
    explanation: 'En passant must be played immediately on the turn following the enemy pawn two-square advance; the opportunity is lost if not taken immediately.',
  },

  // 6. Checkmate vs Stalemate (Elementary)
  {
    id: 'q-checkmate-stalemate',
    category: 'checkmate_patterns',
    difficulty: 'elementary',
    type: 'multiple_choice',
    question: 'If a player whose turn it is has NO legal moves and their King is NOT in check, what is the game result?',
    options: [
      'Stalemate (Instant Draw)',
      'Checkmate (Win for the other player)',
      'Time-out victory',
      'Penalty replay',
    ],
    correctOptionIndex: 0,
    explanation: 'If a player has no legal moves and their king is not in check, the position is stalemate and the game ends immediately in a draw.',
  },

  // 7. Tactical Motif: Knight Fork (Interactive Board Move)
  {
    id: 'q-knight-fork',
    category: 'tactical_patterns',
    difficulty: 'elementary',
    type: 'board_move',
    initialFen: 'r1bqk2r/pp1p1ppp/2n1pn2/2b5/4P3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 4 6',
    question: 'Tactical challenge: Find the best move for White or identify the classic Knight Fork setup.',
    expectedMoveSanOrUci: 'd5c7', // or Nxc7+ / c7
    options: [
      'Nxc7+ (Attacking King and Rook simultaneously)',
      'O-O (Kingside Castle)',
      'h3 (Quiet pawn move)',
      'Be2 (Passive development)',
    ],
    correctOptionIndex: 0,
    explanation: 'A fork occurs when a single piece (most famously a knight) attacks two or more enemy targets at the same time.',
  },

  // 8. Absolute Pin (Intermediate)
  {
    id: 'q-absolute-pin',
    category: 'tactical_patterns',
    difficulty: 'intermediate',
    type: 'multiple_choice',
    question: 'What defines an "Absolute Pin" in chess?',
    options: [
      'A piece is pinned against its King and moving it is illegal by chess rules',
      'A piece is pinned against a Queen and moving it loses 9 points',
      'A pin that lasts for more than 5 moves',
      'A pin made by a Knight against two Rooks',
    ],
    correctOptionIndex: 0,
    explanation: 'An absolute pin occurs when a piece shields its King. Moving the pinned piece would expose the King to check, which is illegal.',
  },

  // 9. Positional: Weak Squares (Intermediate)
  {
    id: 'q-weak-squares',
    category: 'positional_understanding',
    difficulty: 'intermediate',
    type: 'multiple_choice',
    question: 'In positional chess, what creates a permanent "hole" or "weak square" in a player territory?',
    options: [
      'Pushing adjacent pawns so the square can never again be defended by a friendly pawn',
      'Placing a knight on the rim of the board',
      'Trading queens early in the opening',
      'Castling on the queenside instead of kingside',
    ],
    correctOptionIndex: 0,
    explanation: 'Pawns can never move backwards. Once pawns advance past a square, that square can never be defended by a pawn again, creating an outpost for the opponent.',
  },

  // 10. Endgame: Lucena Bridge (Advanced/Intermediate)
  {
    id: 'q-lucena-bridge',
    category: 'endgame_fundamentals',
    difficulty: 'intermediate',
    type: 'multiple_choice',
    question: 'In a Rook and Pawn endgame, what is the primary purpose of the classic "Lucena Position" (building a bridge)?',
    options: [
      'Using the Rook on the 4th rank to shield the King from vertical checks so the pawn can promote',
      'Delivering checkmate with Rook and King only',
      'Sacrificing the pawn to create a stalemate defense',
      'Trading rooks immediately to reach a king-and-pawn race',
    ],
    correctOptionIndex: 0,
    explanation: 'In the Lucena position, White places the rook on the 4th rank (e.g. Rf4) to cut off horizontal space and shield the king from checks as it steps out from in front of the queening pawn.',
  },
];

export class SkillAssessmentEngine {
  /**
   * Initializes a new assessment state.
   */
  static startAssessment(): InitialAssessmentState {
    return {
      isActive: true,
      isCompleted: false,
      currentQuestionIndex: 0,
      totalQuestions: INITIAL_ASSESSMENT_QUESTIONS.length,
      questions: INITIAL_ASSESSMENT_QUESTIONS,
      results: [],
      strengths: [],
      gaps: [],
      startedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluates an answer for the current question and returns updated assessment state.
   */
  static submitAnswer(
    state: InitialAssessmentState,
    answerIndexOrMove: number | string
  ): {
    nextState: InitialAssessmentState;
    isCorrect: boolean;
    explanation: string;
    isCompleted: boolean;
  } {
    if (!state.isActive || state.isCompleted) {
      return {
        nextState: state,
        isCorrect: false,
        explanation: 'Assessment is not currently active.',
        isCompleted: true,
      };
    }

    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) {
      return {
        nextState: state,
        isCorrect: false,
        explanation: 'No question found at current index.',
        isCompleted: true,
      };
    }

    let isCorrect = false;
    let studentAnswerStr = '';
    let expectedAnswerStr = '';

    if (currentQuestion.type === 'multiple_choice') {
      const idx = typeof answerIndexOrMove === 'number' ? answerIndexOrMove : parseInt(answerIndexOrMove, 10);
      isCorrect = idx === currentQuestion.correctOptionIndex;
      studentAnswerStr = currentQuestion.options?.[idx] || String(answerIndexOrMove);
      expectedAnswerStr = currentQuestion.options?.[currentQuestion.correctOptionIndex ?? 0] || '';
    } else {
      // Board move comparison
      const studentMove = String(answerIndexOrMove).trim().toLowerCase().replace(/[+#x=]/g, '');
      const expectedMove = (currentQuestion.expectedMoveSanOrUci || '').trim().toLowerCase().replace(/[+#x=]/g, '');
      isCorrect = studentMove === expectedMove || studentMove.includes(expectedMove);
      studentAnswerStr = String(answerIndexOrMove);
      expectedAnswerStr = currentQuestion.expectedMoveSanOrUci || '';
    }

    const resultItem: AssessmentResultItem = {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
      isCorrect,
      studentAnswer: studentAnswerStr,
      expectedAnswer: expectedAnswerStr,
      explanation: currentQuestion.explanation,
    };

    const nextResults = [...state.results, resultItem];
    const nextIndex = state.currentQuestionIndex + 1;
    const isCompleted = nextIndex >= state.totalQuestions;

    if (isCompleted) {
      const evaluation = this.computeProfileFromResults(nextResults);
      return {
        nextState: {
          ...state,
          isActive: false,
          isCompleted: true,
          currentQuestionIndex: nextIndex,
          results: nextResults,
          evaluatedLevelId: evaluation.recommendedLevelId,
          evaluatedRating: evaluation.estimatedRating,
          strengths: evaluation.strengths,
          gaps: evaluation.gaps,
          completedAt: new Date().toISOString(),
        },
        isCorrect,
        explanation: currentQuestion.explanation,
        isCompleted: true,
      };
    }

    return {
      nextState: {
        ...state,
        currentQuestionIndex: nextIndex,
        results: nextResults,
      },
      isCorrect,
      explanation: currentQuestion.explanation,
      isCompleted: false,
    };
  }

  /**
   * Computes recommended curriculum level and skill profile from assessment results.
   */
  static computeProfileFromResults(results: AssessmentResultItem[]): {
    recommendedLevelId: AcademyLevelId;
    estimatedRating: number;
    strengths: string[];
    gaps: string[];
    confidence: 'low' | 'moderate' | 'high';
  } {
    const total = results.length;
    const correctCount = results.filter((r) => r.isCorrect).length;
    const scorePct = total > 0 ? (correctCount / total) * 100 : 0;

    // Categorize strengths and knowledge gaps
    const categoryScores: Record<string, { correct: number; total: number }> = {};
    for (const r of results) {
      if (!categoryScores[r.category]) {
        categoryScores[r.category] = { correct: 0, total: 0 };
      }
      categoryScores[r.category].total += 1;
      if (r.isCorrect) {
        categoryScores[r.category].correct += 1;
      }
    }

    const strengths: string[] = [];
    const gaps: string[] = [];

    const categoryNames: Record<string, string> = {
      opening_principles: 'Opening Principles & Center Control',
      piece_activity_development: 'Piece Movement & Mechanics',
      hanging_pieces_blunders: 'Material Calculation & Values',
      king_safety: 'Castling Rules & King Safety',
      tactical_patterns: 'Tactical Motifs (Forks, Pins, En Passant)',
      checkmate_patterns: 'Checkmate & Stalemate Rules',
      positional_understanding: 'Positional Thinking & Pawn Structure',
      endgame_fundamentals: 'Endgame Techniques & Conversion',
    };

    for (const [cat, data] of Object.entries(categoryScores)) {
      const friendlyName = categoryNames[cat] || cat;
      if (data.correct === data.total) {
        strengths.push(friendlyName);
      } else if (data.correct === 0 && data.total >= 1) {
        gaps.push(friendlyName);
      }
    }

    // Determine recommended starting level based on demonstrated proficiency
    let recommendedLevelId: AcademyLevelId = 'level-1-absolute-beginner';
    let estimatedRating = 400;

    if (scorePct >= 90) {
      recommendedLevelId = 'level-4-advanced';
      estimatedRating = 1350;
    } else if (scorePct >= 70) {
      recommendedLevelId = 'level-3-intermediate';
      estimatedRating = 1100;
    } else if (scorePct >= 50) {
      recommendedLevelId = 'level-2-elementary';
      estimatedRating = 800;
    } else {
      recommendedLevelId = 'level-1-absolute-beginner';
      estimatedRating = 500;
    }

    const confidence = total >= 8 ? 'high' : total >= 4 ? 'moderate' : 'low';

    return {
      recommendedLevelId,
      estimatedRating,
      strengths,
      gaps,
      confidence,
    };
  }
}
