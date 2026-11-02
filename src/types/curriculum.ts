/**
 * Training curriculum, lesson progressions, and Test Arena evaluation reports.
 */

export type LessonDifficulty = 'novice' | 'intermediate' | 'advanced' | 'master';
export type LessonCategory = 'fundamentals' | 'tactics' | 'openings' | 'strategy' | 'endgames';

export interface CurriculumExercise {
  id: string;
  title: string;
  initialFen: string;
  solutionMovesSan: string[];
  explanation: string;
  hint: string;
  difficulty: LessonDifficulty;
  ratingValue: number;
}

export interface CurriculumLesson {
  id: string;
  moduleId: string;
  title: string;
  summary: string;
  category: LessonCategory;
  difficulty: LessonDifficulty;
  estimatedMinutes: number;
  exercises: CurriculumExercise[];
}

export interface UserLessonProgress {
  lessonId: string;
  completed: boolean;
  scorePercentage: number;
  attemptsCount: number;
  lastAttemptAt: string;
}

export interface ArenaEvaluationReport {
  id: string;
  gameId: string;
  overallAccuracyPercent: number;
  estimatedPerformanceRating: number;
  brilliantMovesCount: number;
  bestMovesCount: number;
  inaccuraciesCount: number;
  mistakesCount: number;
  blundersCount: number;
  openingPhaseScore: number;
  middleGamePhaseScore: number;
  endgamePhaseScore: number;
  keyTakeawaySummary: string;
  suggestedFocusLessons: string[];
  createdAt: string;
}
