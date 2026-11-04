/**
 * LocalStorage persistence and progress mathematical models for Training Academy.
 */

import { TRAINING_LESSONS } from '../data/curriculumData';
import { ACADEMY_LEVELS } from '../data/levels';
import type {
  AcademyLevelId,
  AcademyProgressState,
  ActivityHistoryItem,
  LessonProgressRecord,
} from '../types';

const STORAGE_KEY = 'chess_academy_training_progress_v1';
const CURRENT_VERSION = 1;

export const INITIAL_PROGRESS_STATE: AcademyProgressState = {
  version: CURRENT_VERSION,
  currentLevelId: 'level-1-absolute-beginner',
  completedLessonIds: [],
  completedModuleIds: [],
  unlockedLevelIds: ['level-1-absolute-beginner'],
  lessonProgress: {},
  totalExerciseAttempts: 0,
  correctExerciseAttempts: 0,
  incorrectExerciseAttempts: 0,
  activityHistory: [],
  lastActiveAt: new Date().toISOString(),
};

export class ProgressStorage {
  /**
   * Loads saved progress from localStorage with fallback to default state.
   */
  static loadProgress(): AcademyProgressState {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...INITIAL_PROGRESS_STATE };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...INITIAL_PROGRESS_STATE };
      }

      const parsed = JSON.parse(raw) as Partial<AcademyProgressState>;

      if (!parsed || typeof parsed !== 'object' || parsed.version !== CURRENT_VERSION) {
        return { ...INITIAL_PROGRESS_STATE };
      }

      // Safeguard arrays and maps
      return {
        version: CURRENT_VERSION,
        currentLevelId: parsed.currentLevelId || 'level-1-absolute-beginner',
        currentLessonId: parsed.currentLessonId,
        completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
        completedModuleIds: Array.isArray(parsed.completedModuleIds) ? parsed.completedModuleIds : [],
        unlockedLevelIds: Array.isArray(parsed.unlockedLevelIds) && parsed.unlockedLevelIds.length > 0
          ? parsed.unlockedLevelIds
          : ['level-1-absolute-beginner'],
        lessonProgress: parsed.lessonProgress && typeof parsed.lessonProgress === 'object'
          ? parsed.lessonProgress
          : {},
        totalExerciseAttempts: typeof parsed.totalExerciseAttempts === 'number' ? parsed.totalExerciseAttempts : 0,
        correctExerciseAttempts: typeof parsed.correctExerciseAttempts === 'number' ? parsed.correctExerciseAttempts : 0,
        incorrectExerciseAttempts: typeof parsed.incorrectExerciseAttempts === 'number' ? parsed.incorrectExerciseAttempts : 0,
        activityHistory: Array.isArray(parsed.activityHistory) ? parsed.activityHistory : [],
        lastActiveAt: parsed.lastActiveAt || new Date().toISOString(),
      };
    } catch {
      return { ...INITIAL_PROGRESS_STATE };
    }
  }

  /**
   * Persists progress state into localStorage.
   */
  static saveProgress(state: AcademyProgressState): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or restricted environment
    }
  }

  /**
   * Marks a lesson completed in the state and records activity log.
   */
  static recordLessonCompletion(
    prevState: AcademyProgressState,
    lessonId: string,
    lessonTitle: string,
    moduleId: string,
    levelId: AcademyLevelId
  ): AcademyProgressState {
    const isAlreadyCompleted = prevState.completedLessonIds.includes(lessonId);
    if (isAlreadyCompleted) {
      // Lesson already completed; preserve existing completion state and history without duplicates
      return prevState;
    }

    const updatedCompletedLessons = [...prevState.completedLessonIds, lessonId];

    const prevRecord: LessonProgressRecord = prevState.lessonProgress[lessonId] || {
      lessonId,
      moduleId,
      levelId,
      completed: false,
      readingDone: true,
      exercisePassed: true,
      attemptsCount: 1,
      bestAttemptsCount: 1,
    };

    const updatedRecord: LessonProgressRecord = {
      ...prevRecord,
      completed: true,
      completedAt: new Date().toISOString(),
      readingDone: true,
      exercisePassed: true,
    };

    const newHistoryItem: ActivityHistoryItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: 'lesson_completed',
      levelId,
      lessonId,
      lessonTitle,
      details: 'Completed reading and verified interactive exercise.',
    };

    const newState: AcademyProgressState = {
      ...prevState,
      completedLessonIds: updatedCompletedLessons,
      lessonProgress: {
        ...prevState.lessonProgress,
        [lessonId]: updatedRecord,
      },
      activityHistory: [newHistoryItem, ...prevState.activityHistory.slice(0, 49)], // Keep recent 50
      lastActiveAt: new Date().toISOString(),
    };

    this.saveProgress(newState);
    return newState;
  }

  /**
   * Records an exercise attempt (success or failure).
   */
  static recordExerciseAttempt(
    prevState: AcademyProgressState,
    lessonId: string,
    lessonTitle: string,
    levelId: AcademyLevelId,
    success: boolean
  ): AcademyProgressState {
    const total = prevState.totalExerciseAttempts + 1;
    const correct = success ? prevState.correctExerciseAttempts + 1 : prevState.correctExerciseAttempts;
    const incorrect = success ? prevState.incorrectExerciseAttempts : prevState.incorrectExerciseAttempts + 1;

    const prevRecord = prevState.lessonProgress[lessonId];
    const updatedRecord: LessonProgressRecord = {
      lessonId,
      moduleId: prevRecord?.moduleId || '',
      levelId,
      completed: prevRecord?.completed || false,
      completedAt: prevRecord?.completedAt,
      readingDone: prevRecord?.readingDone || false,
      exercisePassed: success || (prevRecord?.exercisePassed ?? false),
      attemptsCount: (prevRecord?.attemptsCount || 0) + 1,
      bestAttemptsCount: prevRecord?.bestAttemptsCount || 1,
    };

    const newHistoryItem: ActivityHistoryItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: success ? 'exercise_passed' : 'exercise_failed',
      levelId,
      lessonId,
      lessonTitle,
      details: success ? 'Solved interactive exercise on the board.' : 'Attempted exercise with incorrect move.',
    };

    const newState: AcademyProgressState = {
      ...prevState,
      totalExerciseAttempts: total,
      correctExerciseAttempts: correct,
      incorrectExerciseAttempts: incorrect,
      lessonProgress: {
        ...prevState.lessonProgress,
        [lessonId]: updatedRecord,
      },
      activityHistory: [newHistoryItem, ...prevState.activityHistory.slice(0, 49)],
      lastActiveAt: new Date().toISOString(),
    };

    this.saveProgress(newState);
    return newState;
  }

  /**
   * Calculates overall and level-specific statistics.
   */
  static calculateStatistics(state: AcademyProgressState): {
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    exerciseSuccessRate: number;
    totalAttempts: number;
    levelCompletionMap: Record<AcademyLevelId, { total: number; completed: number; percentage: number }>;
  } {
    const totalLessons = TRAINING_LESSONS.length;
    const completedLessons = state.completedLessonIds.length;
    const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const totalAttempts = state.totalExerciseAttempts;
    const exerciseSuccessRate = totalAttempts > 0
      ? Math.round((state.correctExerciseAttempts / totalAttempts) * 100)
      : 0;

    const levelCompletionMap = {} as Record<
      AcademyLevelId,
      { total: number; completed: number; percentage: number }
    >;

    for (const lvl of ACADEMY_LEVELS) {
      const lessonsInLvl = TRAINING_LESSONS.filter((l) => l.levelId === lvl.id);
      const completedInLvl = lessonsInLvl.filter((l) => state.completedLessonIds.includes(l.id)).length;
      const pct = lessonsInLvl.length > 0 ? Math.round((completedInLvl / lessonsInLvl.length) * 100) : 0;
      levelCompletionMap[lvl.id] = {
        total: lessonsInLvl.length,
        completed: completedInLvl,
        percentage: pct,
      };
    }

    return {
      totalLessons,
      completedLessons,
      completionPercentage,
      exerciseSuccessRate,
      totalAttempts,
      levelCompletionMap,
    };
  }
}
