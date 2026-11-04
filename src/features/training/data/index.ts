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

/**
 * Explicit canonical sequence of all 30 lessons across all 7 levels.
 * Ensures deterministic, pedagogically sequenced navigation regardless of array insertion.
 */
export const CANONICAL_LESSON_IDS: readonly string[] = [
  // Level 1: Absolute Beginner
  'l-101-board-ranks-files',
  'l-102-knight-movement',
  'l-103-pawn-promotion-mechanics',
  'l-104-check-and-checkmate',
  'l-105-castling-king-safety',
  'l-106-en-passant-capture',

  // Level 2: Elementary
  'l-201-piece-values-counting',
  'l-202-controlling-the-center',
  'l-203-the-knight-fork',
  'l-204-the-absolute-pin',

  // Level 3: Intermediate
  'l-301-the-linear-skewer',
  'l-302-deflection-and-decoy',
  'l-303-back-rank-destruction',
  'l-304-knight-outposts-open-files',

  // Level 4: Advanced
  'l-401-weak-squares-color-complex',
  'l-402-prophylactic-thinking',
  'l-403-the-lucena-bridge',
  'l-404-good-vs-bad-bishops',

  // Level 5: Expert
  'l-501-candidate-moves-elimination',
  'l-502-positional-exchange-sacrifice',
  'l-503-fortress-defensive-resource',
  'l-504-the-zwischenzug-intermediate-move',

  // Level 6: Master
  'l-601-master-prophylaxis-restriction',
  'l-602-principle-of-two-weaknesses',
  'l-603-stalemate-swindle-resource',
  'l-604-the-minority-attack-carlsbad',

  // Level 7: Grandmaster Preparation
  'l-701-najdorf-dynamic-preparation',
  'l-702-grandmaster-multi-ply-calculation',
  'l-703-tournament-pragmatism-simplification',
  'l-704-converting-plus-equals-endgame',
] as const;

export function getNextLesson(currentLessonId: string): TrainingLesson | null {
  const currentIndex = CANONICAL_LESSON_IDS.indexOf(currentLessonId);
  if (currentIndex === -1 || currentIndex >= CANONICAL_LESSON_IDS.length - 1) {
    return null;
  }
  const nextId = CANONICAL_LESSON_IDS[currentIndex + 1];
  return LESSON_MAP[nextId] ?? null;
}

export function getPreviousLesson(currentLessonId: string): TrainingLesson | null {
  const currentIndex = CANONICAL_LESSON_IDS.indexOf(currentLessonId);
  if (currentIndex <= 0) {
    return null;
  }
  const prevId = CANONICAL_LESSON_IDS[currentIndex - 1];
  return LESSON_MAP[prevId] ?? null;
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
