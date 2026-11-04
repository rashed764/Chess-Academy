/**
 * Pure progression and unlocking logic for Levels, Modules, and Lessons.
 */

import { ACADEMY_LEVEL_MAP } from '../data/levels';
import { LESSON_MAP, CURRICULUM_MODULES } from '../data/curriculumData';
import type { AcademyLevelId, AcademyProgressState, TrainingLesson } from '../types';

export class UnlockEngine {
  /**
   * Determines whether a level is currently unlocked based on user progress.
   * Level 1 is always unlocked.
   * Level N is unlocked if its prerequisite level has satisfied the minimum completed lessons requirement.
   */
  static isLevelUnlocked(levelId: AcademyLevelId, progress: AcademyProgressState): boolean {
    if (levelId === 'level-1-absolute-beginner') {
      return true;
    }

    const level = ACADEMY_LEVEL_MAP[levelId];
    if (!level) return false;

    if (!level.prerequisiteLevelId) {
      return true;
    }

    const prereqLevel = ACADEMY_LEVEL_MAP[level.prerequisiteLevelId];
    if (!prereqLevel) return false;

    // Count how many lessons in the prerequisite level are completed
    const prereqLessonIds = CURRICULUM_MODULES.filter(
      (m) => m.levelId === level.prerequisiteLevelId
    ).flatMap((m) => m.lessonIds);

    const completedInPrereq = prereqLessonIds.filter((id) =>
      progress.completedLessonIds.includes(id)
    ).length;

    const required = level.minCompletedLessonsRequired ?? Math.min(2, prereqLessonIds.length);
    return completedInPrereq >= required;
  }

  /**
   * Returns a human-friendly string explaining why a level is locked.
   */
  static getLevelLockReason(levelId: AcademyLevelId, progress: AcademyProgressState): string {
    const level = ACADEMY_LEVEL_MAP[levelId];
    if (!level || !level.prerequisiteLevelId) return '';

    const prereqLevel = ACADEMY_LEVEL_MAP[level.prerequisiteLevelId];
    const prereqLessonIds = CURRICULUM_MODULES.filter(
      (m) => m.levelId === level.prerequisiteLevelId
    ).flatMap((m) => m.lessonIds);

    const completed = prereqLessonIds.filter((id) =>
      progress.completedLessonIds.includes(id)
    ).length;

    const required = level.minCompletedLessonsRequired ?? 2;
    return `Complete at least ${required} lessons in ${prereqLevel?.title || 'previous level'} to unlock (Current: ${completed}/${required}).`;
  }

  /**
   * Checks if an individual lesson is unlocked.
   * A lesson is unlocked if its parent level is unlocked AND its prerequisite lesson (if any) is completed.
   */
  static isLessonUnlocked(lessonId: string, progress: AcademyProgressState): boolean {
    const lesson = LESSON_MAP[lessonId];
    if (!lesson) return false;

    // Check parent level
    if (!this.isLevelUnlocked(lesson.levelId, progress)) {
      return false;
    }

    // Check prerequisite lesson
    if (lesson.prerequisiteLessonId) {
      return progress.completedLessonIds.includes(lesson.prerequisiteLessonId);
    }

    return true;
  }

  /**
   * Returns the next recommended lesson for the learner.
   */
  static getNextRecommendedLesson(
    allLessons: TrainingLesson[],
    progress: AcademyProgressState
  ): TrainingLesson | null {
    for (const lesson of allLessons) {
      if (!progress.completedLessonIds.includes(lesson.id)) {
        if (this.isLessonUnlocked(lesson.id, progress)) {
          return lesson;
        }
      }
    }
    return allLessons[0] || null;
  }
}
