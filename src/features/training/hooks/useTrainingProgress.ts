import { useEffect, useState, useMemo, useCallback } from 'react';
import { ProgressStorage, INITIAL_PROGRESS_STATE } from '../models/progressStorage';
import { UnlockEngine } from '../models/unlockEngine';
import { TRAINING_LESSONS } from '../data/curriculumData';
import type { AcademyLevelId, AcademyProgressState, TrainingLesson } from '../types';

export function useTrainingProgress() {
  const [progress, setProgress] = useState<AcademyProgressState>(() =>
    ProgressStorage.loadProgress()
  );

  // Sync state if storage was modified in another tab or component
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chess_academy_training_progress_v1') {
        setProgress(ProgressStorage.loadProgress());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const stats = useMemo(() => ProgressStorage.calculateStatistics(progress), [progress]);

  const isLevelUnlocked = useCallback(
    (levelId: AcademyLevelId) => UnlockEngine.isLevelUnlocked(levelId, progress),
    [progress]
  );

  const isLessonUnlocked = useCallback(
    (lessonId: string) => UnlockEngine.isLessonUnlocked(lessonId, progress),
    [progress]
  );

  const getLevelLockReason = useCallback(
    (levelId: AcademyLevelId) => UnlockEngine.getLevelLockReason(levelId, progress),
    [progress]
  );

  const setCurrentLevel = useCallback((levelId: AcademyLevelId) => {
    setProgress((prev) => {
      const next = { ...prev, currentLevelId: levelId, lastActiveAt: new Date().toISOString() };
      ProgressStorage.saveProgress(next);
      return next;
    });
  }, []);

  const recordLessonCompleted = useCallback(
    (lesson: TrainingLesson) => {
      setProgress((prev) =>
        ProgressStorage.recordLessonCompletion(
          prev,
          lesson.id,
          lesson.title,
          lesson.moduleId,
          lesson.levelId
        )
      );
    },
    []
  );

  const recordExerciseAttempt = useCallback(
    (lesson: TrainingLesson, success: boolean) => {
      setProgress((prev) =>
        ProgressStorage.recordExerciseAttempt(
          prev,
          lesson.id,
          lesson.title,
          lesson.levelId,
          success
        )
      );
    },
    []
  );

  const resetAllProgress = useCallback(() => {
    ProgressStorage.saveProgress(INITIAL_PROGRESS_STATE);
    setProgress({ ...INITIAL_PROGRESS_STATE });
  }, []);

  return {
    progress,
    stats,
    isLevelUnlocked,
    isLessonUnlocked,
    getLevelLockReason,
    setCurrentLevel,
    recordLessonCompleted,
    recordExerciseAttempt,
    resetAllProgress,
  };
}
