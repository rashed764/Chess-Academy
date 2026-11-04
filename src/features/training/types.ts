/**
 * Comprehensive domain types for the CHESS ACADEMY 7-Level Curriculum.
 */

export type AcademyLevelId =
  | 'level-1-absolute-beginner'
  | 'level-2-elementary'
  | 'level-3-intermediate'
  | 'level-4-advanced'
  | 'level-5-expert'
  | 'level-6-master'
  | 'level-7-grandmaster-prep';

export type ExerciseType =
  | 'move_identification'
  | 'best_move'
  | 'tactical_puzzle'
  | 'checkmate'
  | 'endgame'
  | 'rule_based';

export type LessonDifficultyTier =
  | 'absolute-beginner'
  | 'elementary'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'master'
  | 'grandmaster-prep';

export interface AcademyLevel {
  id: AcademyLevelId;
  order: number;
  romanNumeral: string;
  title: string;
  subtitle: string;
  objective: string;
  targetRating: string;
  prerequisiteLevelId?: AcademyLevelId;
  minCompletedLessonsRequired?: number;
  moduleIds: string[];
}

export interface CurriculumModule {
  id: string;
  levelId: AcademyLevelId;
  order: number;
  title: string;
  description: string;
  iconName: string;
  lessonIds: string[];
}

export interface ExerciseStep {
  playerMoveSan: string;
  opponentReplySan?: string; // For multi-move exercises, auto-reply from opponent
  explanation?: string;
}

export interface ChessExercise {
  id: string;
  lessonId: string;
  title: string;
  instruction: string;
  exerciseType: ExerciseType;
  initialFen: string;
  playerSide: 'w' | 'b';
  // Array of steps. For single move: 1 step. For multi-move: multiple steps.
  steps: ExerciseStep[];
  // Optional acceptable alternative first moves in SAN
  alternativeSolutionsSan?: string[];
  hint: string;
  explanation: string;
  difficulty: LessonDifficultyTier;
}

export interface LessonContentSection {
  title: string;
  paragraphs: string[];
  diagramFen?: string;
  diagramCaption?: string;
  bulletPoints?: string[];
}

export interface TrainingLesson {
  id: string;
  moduleId: string;
  levelId: AcademyLevelId;
  order: number;
  title: string;
  learningObjective: string;
  difficulty: LessonDifficultyTier;
  estimatedMinutes: number;
  prerequisiteLessonId?: string;
  content: {
    introduction: string;
    sections: LessonContentSection[];
    keyTakeaways: string[];
  };
  exercise: ChessExercise;
  completionCriteria: {
    requiresExercisePassed: boolean;
    requiresReadingCompleted: boolean;
  };
}

export interface ExerciseAttempt {
  exerciseId: string;
  lessonId: string;
  attemptedAt: string;
  success: boolean;
  movesPlayedSan: string[];
  hintsUsedCount: number;
}

export interface LessonProgressRecord {
  lessonId: string;
  moduleId: string;
  levelId: AcademyLevelId;
  completed: boolean;
  completedAt?: string;
  readingDone: boolean;
  exercisePassed: boolean;
  attemptsCount: number;
  bestAttemptsCount: number;
}

export interface ActivityHistoryItem {
  id: string;
  timestamp: string;
  type: 'lesson_completed' | 'exercise_passed' | 'exercise_failed' | 'lesson_started';
  levelId: AcademyLevelId;
  lessonId: string;
  lessonTitle: string;
  details?: string;
}

export interface AcademyProgressState {
  version: number;
  currentLevelId: AcademyLevelId;
  currentLessonId?: string;
  completedLessonIds: string[];
  completedModuleIds: string[];
  unlockedLevelIds: AcademyLevelId[];
  lessonProgress: Record<string, LessonProgressRecord>;
  totalExerciseAttempts: number;
  correctExerciseAttempts: number;
  incorrectExerciseAttempts: number;
  activityHistory: ActivityHistoryItem[];
  lastActiveAt: string;
}
