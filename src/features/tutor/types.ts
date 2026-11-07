/**
 * Core type definitions for the Autonomous AI-Powered Interactive Chess Tutor.
 */

import type { Square } from 'chess.js';
import type { AcademyLevelId, TrainingLesson } from '../training/types';
import type { EducationalTopicCategory } from '../learning-engine/types';

export type TutorMode = 'demonstration' | 'practice' | 'assessment' | 'free_play';

export interface BoardActionSummary {
  type: 'demonstration' | 'exercise' | 'position' | 'assessment' | 'orchestration';
  label: string;
  detail?: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  boardActionSummary?: BoardActionSummary[];
  suggestedReplies?: string[];
  source?: 'gemini' | 'local_fallback';
  meta?: {
    lessonId?: string;
    exerciseId?: string;
    assessmentStage?: number;
  };
}

export type TutorBoardActionType =
  | 'set_position'
  | 'move_piece'
  | 'highlight_square'
  | 'highlight_squares'
  | 'show_legal_moves'
  | 'clear_highlights'
  | 'show_arrow'
  | 'clear_arrows'
  | 'flip_board'
  | 'reset_board'
  | 'request_student_move'
  | 'show_solution'
  | 'start_position_exercise'
  | 'end_position_exercise';

export interface SetPositionAction {
  type: 'set_position';
  fen: string;
  description?: string;
}

export interface MovePieceAction {
  type: 'move_piece';
  from: string;
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
  explanation?: string;
}

export interface HighlightSquareAction {
  type: 'highlight_square';
  square: string;
  color?: string;
}

export interface HighlightSquaresAction {
  type: 'highlight_squares';
  squares: string[];
  color?: string;
}

export interface ShowLegalMovesAction {
  type: 'show_legal_moves';
  square: string;
}

export interface ClearHighlightsAction {
  type: 'clear_highlights';
}

export interface ShowArrowAction {
  type: 'show_arrow';
  from: string;
  to: string;
  color?: string;
}

export interface ClearArrowsAction {
  type: 'clear_arrows';
}

export interface FlipBoardAction {
  type: 'flip_board';
  orientation?: 'white' | 'black';
}

export interface ResetBoardAction {
  type: 'reset_board';
}

export interface RequestStudentMoveAction {
  type: 'request_student_move';
  expectedMoves?: string[];
  hint?: string;
  prompt?: string;
}

export interface ShowSolutionAction {
  type: 'show_solution';
  explanation?: string;
}

export interface StartPositionExerciseAction {
  type: 'start_position_exercise';
  initialFen: string;
  targetMove: string;
  opponentReply?: string;
  objective: string;
}

export interface EndPositionExerciseAction {
  type: 'end_position_exercise';
}

export type TutorBoardAction =
  | SetPositionAction
  | MovePieceAction
  | HighlightSquareAction
  | HighlightSquaresAction
  | ShowLegalMovesAction
  | ClearHighlightsAction
  | ShowArrowAction
  | ClearArrowsAction
  | FlipBoardAction
  | ResetBoardAction
  | RequestStudentMoveAction
  | ShowSolutionAction
  | StartPositionExerciseAction
  | EndPositionExerciseAction;

export type TutorOrchestratorActionType =
  | 'start_lesson'
  | 'complete_lesson'
  | 'recommend_next_lesson'
  | 'start_initial_assessment'
  | 'finish_initial_assessment'
  | 'prompt_test_arena'
  | 'generate_learning_plan';

export interface StartLessonOrchestratorAction {
  type: 'start_lesson';
  lessonId: string;
}

export interface CompleteLessonOrchestratorAction {
  type: 'complete_lesson';
  lessonId: string;
}

export interface RecommendNextLessonOrchestratorAction {
  type: 'recommend_next_lesson';
  lessonId: string;
  reason?: string;
}

export interface StartInitialAssessmentOrchestratorAction {
  type: 'start_initial_assessment';
  reset?: boolean;
}

export interface FinishInitialAssessmentOrchestratorAction {
  type: 'finish_initial_assessment';
  assessedLevelId: AcademyLevelId;
  estimatedRating?: number;
  strengths: string[];
  knowledgeGaps: string[];
  recommendedSequence: string[];
  confidence: 'low' | 'moderate' | 'high';
}

export interface PromptTestArenaOrchestratorAction {
  type: 'prompt_test_arena';
  reason: string;
  recommendedFormat?: 'single' | 'battery' | 'tactical';
}

export interface GenerateLearningPlanOrchestratorAction {
  type: 'generate_learning_plan';
  targetLevel: string;
}

export type TutorOrchestratorAction =
  | StartLessonOrchestratorAction
  | CompleteLessonOrchestratorAction
  | RecommendNextLessonOrchestratorAction
  | StartInitialAssessmentOrchestratorAction
  | FinishInitialAssessmentOrchestratorAction
  | PromptTestArenaOrchestratorAction
  | GenerateLearningPlanOrchestratorAction;

export interface TutorActiveExercise {
  id: string;
  initialFen: string;
  objective: string;
  targetMoves: string[];
  opponentReply?: {
    from: string;
    to: string;
    san: string;
  };
  completed: boolean;
  attempts: number;
}

export interface AssessmentQuestion {
  id: string;
  category: EducationalTopicCategory;
  question: string;
  type: 'multiple_choice' | 'board_move';
  options?: string[];
  correctOptionIndex?: number;
  initialFen?: string;
  expectedMoveSanOrUci?: string;
  explanation: string;
  difficulty: 'beginner' | 'elementary' | 'intermediate';
}

export interface AssessmentResultItem {
  questionId: string;
  category: EducationalTopicCategory;
  isCorrect: boolean;
  studentAnswer: string;
  expectedAnswer: string;
  explanation: string;
}

export interface InitialAssessmentState {
  isActive: boolean;
  isCompleted: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: AssessmentQuestion[];
  results: AssessmentResultItem[];
  evaluatedLevelId?: AcademyLevelId;
  evaluatedRating?: number;
  strengths: string[];
  gaps: string[];
  startedAt?: string;
  completedAt?: string;
}

export interface TutorBoardState {
  fen: string;
  mode: TutorMode;
  boardOrientation: 'white' | 'black';
  selectedSquare: Square | null;
  legalMovesForSelected: string[];
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  customHighlights: Record<string, { backgroundColor: string; boxShadow?: string }>;
  customArrows: Array<[Square, Square, string]>;
  moveHistory: Array<{ from: string; to: string; san: string }>;
  activeExercise: TutorActiveExercise | null;
  activeLesson: TrainingLesson | null;
}

export interface TutorTurnRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  boardState: {
    fen: string;
    mode: TutorMode;
    boardOrientation: 'white' | 'black';
    lastMove?: { from: string; to: string } | null;
    activeLessonId?: string;
    activeExerciseObjective?: string;
  };
  learnerContext: {
    currentLevelId: AcademyLevelId;
    completedLessonIds: string[];
    isAssessed: boolean;
    assessedLevelId?: AcademyLevelId;
    assessmentStage?: number;
    userName?: string;
  };
}

export interface TutorTurnResponse {
  message: string;
  boardActions: TutorBoardAction[];
  orchestratorActions: TutorOrchestratorAction[];
  suggestedReplies: string[];
  source: 'gemini' | 'local_fallback';
}
