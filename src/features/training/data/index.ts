import { ACADEMY_LEVELS, ACADEMY_LEVEL_MAP } from './levels';
import {
  CURRICULUM_MODULES,
  TRAINING_LESSONS,
  LESSON_MAP,
  MODULE_MAP,
} from './curriculumData';
import type { AcademyLevelId, AcademyLevel, CurriculumModule, TrainingLesson } from '../types';

export * from './levels';
export * from './curriculumData';

export function getLevelById(levelId: AcademyLevelId): AcademyLevel | undefined {
  return ACADEMY_LEVEL_MAP[levelId];
}

export function getModulesByLevelId(levelId: AcademyLevelId): CurriculumModule[] {
  return CURRICULUM_MODULES.filter((m) => m.levelId === levelId).sort(
    (a, b) => a.order - b.order
  );
}

export function getLessonsByModuleId(moduleId: string): TrainingLesson[] {
  return TRAINING_LESSONS.filter((l) => l.moduleId === moduleId).sort(
    (a, b) => a.order - b.order
  );
}

export function getLessonById(lessonId: string): TrainingLesson | undefined {
  return LESSON_MAP[lessonId];
}

export function getNextLesson(currentLessonId: string): TrainingLesson | null {
  const currentIndex = TRAINING_LESSONS.findIndex((l) => l.id === currentLessonId);
  if (currentIndex === -1 || currentIndex >= TRAINING_LESSONS.length - 1) {
    return null;
  }
  return TRAINING_LESSONS[currentIndex + 1];
}

export function getPreviousLesson(currentLessonId: string): TrainingLesson | null {
  const currentIndex = TRAINING_LESSONS.findIndex((l) => l.id === currentLessonId);
  if (currentIndex <= 0) {
    return null;
  }
  return TRAINING_LESSONS[currentIndex - 1];
}

export function getTotalCurriculumCounts(): {
  totalLevels: number;
  totalModules: number;
  totalLessons: number;
} {
  return {
    totalLevels: ACADEMY_LEVELS.length,
    totalModules: CURRICULUM_MODULES.length,
    totalLessons: TRAINING_LESSONS.length,
  };
}
