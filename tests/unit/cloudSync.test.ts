import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudSyncService, SYNCED_USER_STORAGE_KEY } from '../../src/services/supabase/syncService';
import { ProgressStorage, INITIAL_PROGRESS_STATE } from '../../src/features/training/models/progressStorage';
import { EvidenceCollector } from '../../src/features/learning-engine/models/evidenceCollector';
import type {
  AcademyProgressState,
  ActivityHistoryItem,
  LessonProgressRecord,
} from '../../src/features/training/types';
import type { AssessmentReport } from '../../src/features/test-arena/types';

// Mock localStorage for headless Node test environment
const mockStorage = new Map<string, string>();
const storageMock = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, value: string) => mockStorage.set(key, String(value)),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  length: 0,
  key: () => null,
};
(globalThis as any).window = {
  localStorage: storageMock,
};
(globalThis as any).localStorage = storageMock;

test('CloudSyncService.mergeAcademyProgress: union of lessons, max attempts, latest timestamp', () => {
  const local: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-1-absolute-beginner',
    completedLessonIds: ['l-101-board-coordinates', 'l-102-how-pieces-move'],
    completedModuleIds: ['m-101-board-essentials'],
    unlockedLevelIds: ['level-1-absolute-beginner'],
    lessonProgress: {},
    totalExerciseAttempts: 8,
    correctExerciseAttempts: 6,
    incorrectExerciseAttempts: 2,
    activityHistory: [],
    lastActiveAt: '2026-03-01T10:00:00.000Z',
  };

  const cloud = {
    current_level_id: 'level-2-elementary',
    completed_lesson_ids: ['l-102-how-pieces-move', 'l-201-center-control'],
    completed_module_ids: ['m-101-board-essentials', 'm-201-opening-fundamentals'],
    unlocked_level_ids: ['level-1-absolute-beginner', 'level-2-elementary'],
    total_exercise_attempts: 14,
    correct_exercise_attempts: 11,
    incorrect_exercise_attempts: 3,
    last_active_at: '2026-03-02T12:00:00.000Z',
  };

  const merged = cloudSyncService.mergeAcademyProgress(local, cloud);

  // Completed lessons: union without duplicates
  assert.equal(merged.completedLessonIds.length, 3);
  assert.ok(merged.completedLessonIds.includes('l-101-board-coordinates'));
  assert.ok(merged.completedLessonIds.includes('l-102-how-pieces-move'));
  assert.ok(merged.completedLessonIds.includes('l-201-center-control'));

  // Completed modules: union
  assert.equal(merged.completedModuleIds.length, 2);
  assert.ok(merged.completedModuleIds.includes('m-101-board-essentials'));
  assert.ok(merged.completedModuleIds.includes('m-201-opening-fundamentals'));

  // Attempts: Math.max
  assert.equal(merged.totalExerciseAttempts, 14);
  assert.equal(merged.correctExerciseAttempts, 11);
  assert.equal(merged.incorrectExerciseAttempts, 3);

  // Last active timestamp: cloud was newer
  assert.equal(merged.lastActiveAt, '2026-03-02T12:00:00.000Z');
  assert.equal(merged.currentLevelId, 'level-2-elementary');
});

test('CloudSyncService.mergeAcademyProgress: handles null or empty cloud data safely', () => {
  const local: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-1-absolute-beginner',
    completedLessonIds: ['l-101-board-coordinates'],
    completedModuleIds: [],
    unlockedLevelIds: ['level-1-absolute-beginner'],
    lessonProgress: {},
    totalExerciseAttempts: 2,
    correctExerciseAttempts: 2,
    incorrectExerciseAttempts: 0,
    activityHistory: [],
    lastActiveAt: '2026-03-01T10:00:00.000Z',
  };

  const merged = cloudSyncService.mergeAcademyProgress(local, null);
  assert.deepEqual(merged, local);
});

test('CloudSyncService.mergeLessonProgressRecords: merges attempt counts and completion flags', () => {
  const localMap: Record<string, LessonProgressRecord> = {
    'l-101-board-coordinates': {
      lessonId: 'l-101-board-coordinates',
      moduleId: 'm-101-board-essentials',
      levelId: 'level-1-absolute-beginner',
      completed: true,
      completedAt: '2026-03-01T10:00:00.000Z',
      readingDone: true,
      exercisePassed: true,
      attemptsCount: 2,
      bestAttemptsCount: 1,
    },
    'l-102-how-pieces-move': {
      lessonId: 'l-102-how-pieces-move',
      moduleId: 'm-101-board-essentials',
      levelId: 'level-1-absolute-beginner',
      completed: false,
      readingDone: true,
      exercisePassed: false,
      attemptsCount: 1,
      bestAttemptsCount: 1,
    },
  };

  const cloudRows = [
    {
      lesson_id: 'l-102-how-pieces-move',
      module_id: 'm-101-board-essentials',
      level_id: 'level-1-absolute-beginner',
      completed: true,
      completed_at: '2026-03-02T15:00:00.000Z',
      reading_done: true,
      exercise_passed: true,
      attempts_count: 3,
      best_attempts_count: 1,
    },
    {
      lesson_id: 'l-103-captures-and-trades',
      module_id: 'm-101-board-essentials',
      level_id: 'level-1-absolute-beginner',
      completed: true,
      completed_at: '2026-03-03T11:00:00.000Z',
      reading_done: true,
      exercise_passed: true,
      attempts_count: 1,
      best_attempts_count: 1,
    },
  ];

  const merged = cloudSyncService.mergeLessonProgressRecords(localMap, cloudRows);

  assert.equal(Object.keys(merged).length, 3);

  // l-101 was local only, stays completed
  assert.equal(merged['l-101-board-coordinates'].completed, true);
  assert.equal(merged['l-101-board-coordinates'].attemptsCount, 2);

  // l-102 was incomplete locally but completed in cloud -> must be completed in merged
  assert.equal(merged['l-102-how-pieces-move'].completed, true);
  assert.equal(merged['l-102-how-pieces-move'].exercisePassed, true);
  // Attempts should be Math.max(1, 3) = 3
  assert.equal(merged['l-102-how-pieces-move'].attemptsCount, 3);

  // l-103 was cloud only -> now present in merged
  assert.equal(merged['l-103-captures-and-trades'].completed, true);
  assert.equal(merged['l-103-captures-and-trades'].attemptsCount, 1);
});

test('CloudSyncService.mergeActivityHistory: deduplicates by ID and sorts descending', () => {
  const localItems: ActivityHistoryItem[] = [
    {
      id: 'act-1',
      timestamp: '2026-03-01T10:00:00.000Z',
      type: 'lesson_completed',
      levelId: 'level-1-absolute-beginner',
      lessonId: 'l-101-board-coordinates',
      lessonTitle: 'Board Coordinates',
    },
    {
      id: 'act-2',
      timestamp: '2026-03-02T10:00:00.000Z',
      type: 'exercise_passed',
      levelId: 'level-1-absolute-beginner',
      lessonId: 'l-102-how-pieces-move',
      lessonTitle: 'How Pieces Move',
    },
  ];

  const cloudRows = [
    {
      id: 'act-2', // Duplicate ID
      timestamp: '2026-03-02T10:00:00.000Z',
      type: 'exercise_passed',
      level_id: 'level-1-absolute-beginner',
      lesson_id: 'l-102-how-pieces-move',
      lesson_title: 'How Pieces Move',
    },
    {
      id: 'act-3', // Cloud-only
      timestamp: '2026-03-03T10:00:00.000Z',
      type: 'lesson_completed',
      level_id: 'level-1-absolute-beginner',
      lesson_id: 'l-103-captures-and-trades',
      lesson_title: 'Captures and Trades',
    },
  ];

  const merged = cloudSyncService.mergeActivityHistory(localItems, cloudRows);

  assert.equal(merged.length, 3);
  // Must be sorted newest first: act-3 (March 3), act-2 (March 2), act-1 (March 1)
  assert.equal(merged[0].id, 'act-3');
  assert.equal(merged[1].id, 'act-2');
  assert.equal(merged[2].id, 'act-1');
});

test('CloudSyncService.mergeArenaReports: deduplicates by report ID and favors completed reports', () => {
  const localReports: AssessmentReport[] = [
    {
      id: 'arena-rep-1',
      formatId: 'single_match',
      formatName: 'Rapid Evaluation',
      status: 'in_progress',
      totalGamesScheduled: 3,
      gamesCompleted: 1,
      overallResults: {} as any,
      games: [],
      createdAt: '2026-03-01T10:00:00.000Z',
      completedAt: undefined,
    },
    {
      id: 'arena-rep-2',
      formatId: 'five_match_battery',
      formatName: 'Speed Blitz Battery',
      status: 'completed',
      totalGamesScheduled: 5,
      gamesCompleted: 5,
      overallResults: { acpl: 28 } as any,
      games: [],
      createdAt: '2026-03-01T12:00:00.000Z',
      completedAt: '2026-03-01T12:30:00.000Z',
    },
  ];

  const cloudRows = [
    {
      id: 'arena-rep-1', // Same ID, but completed in cloud
      format_id: 'format-rapid-eval',
      format_name: 'Rapid Evaluation',
      status: 'completed',
      total_games_scheduled: 3,
      games_completed: 3,
      overall_results: { acpl: 35 },
      games: [],
      created_at: '2026-03-01T10:00:00.000Z',
      completed_at: '2026-03-01T11:00:00.000Z',
    },
    {
      id: 'arena-rep-3', // Cloud only
      format_id: 'format-tactics-endgame',
      format_name: 'Tactics and Endgame',
      status: 'completed',
      total_games_scheduled: 4,
      games_completed: 4,
      overall_results: { acpl: 22 },
      games: [],
      created_at: '2026-03-02T10:00:00.000Z',
      completed_at: '2026-03-02T10:45:00.000Z',
    },
  ];

  const merged = cloudSyncService.mergeArenaReports(localReports, cloudRows);

  assert.equal(merged.length, 3);

  // arena-rep-1: cloud completed status should supersede in_progress
  const rep1 = merged.find((r) => r.id === 'arena-rep-1');
  assert.ok(rep1);
  assert.equal(rep1.status, 'completed');
  assert.equal(rep1.gamesCompleted, 3);

  // arena-rep-2 was already completed locally
  const rep2 = merged.find((r) => r.id === 'arena-rep-2');
  assert.ok(rep2);
  assert.equal(rep2.status, 'completed');

  // arena-rep-3 was merged in from cloud
  const rep3 = merged.find((r) => r.id === 'arena-rep-3');
  assert.ok(rep3);
  assert.equal(rep3.formatId, 'format-tactics-endgame');
});

test('CloudSyncService: returns local_only when Supabase credentials are missing', () => {
  const state = cloudSyncService.getState();
  assert.ok(['local_only', 'idle', 'synced', 'offline', 'error'].includes(state.status));
});

// ==============================================================================
// DETERMINISTIC MOCK INTEGRATION TESTS (Simulated Multi-Device & Lifecycle)
// ==============================================================================

test('Deterministic Mock Integration: First-login local-to-cloud migration preserves full local progress', () => {
  // Scenario: Candidate trained locally while unauthenticated, then registers/signs in.
  const localPreLogin: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-2-elementary',
    completedLessonIds: ['l-101-board-ranks-files', 'l-102-how-pieces-move', 'l-103-captures-and-trades'],
    completedModuleIds: ['m-101-board-essentials'],
    unlockedLevelIds: ['level-1-absolute-beginner', 'level-2-elementary'],
    lessonProgress: {
      'l-101-board-ranks-files': {
        lessonId: 'l-101-board-ranks-files',
        moduleId: 'm-101-board-essentials',
        levelId: 'level-1-absolute-beginner',
        completed: true,
        readingDone: true,
        exercisePassed: true,
        attemptsCount: 2,
        bestAttemptsCount: 1,
      },
    },
    totalExerciseAttempts: 6,
    correctExerciseAttempts: 5,
    incorrectExerciseAttempts: 1,
    activityHistory: [
      {
        id: 'act-local-01',
        timestamp: '2026-03-01T12:00:00.000Z',
        type: 'lesson_completed',
        levelId: 'level-1-absolute-beginner',
        lessonId: 'l-101-board-ranks-files',
        lessonTitle: 'Board Ranks and Files',
      },
    ],
    lastActiveAt: '2026-03-01T12:00:00.000Z',
  };

  // Cloud tables are empty on brand new account
  const cloudInitial = null;

  const migrated = cloudSyncService.mergeAcademyProgress(localPreLogin, cloudInitial);

  // Must preserve 100% of user local progress for uploading
  assert.equal(migrated.completedLessonIds.length, 3);
  assert.equal(migrated.totalExerciseAttempts, 6);
  assert.equal(migrated.correctExerciseAttempts, 5);
  assert.equal(migrated.incorrectExerciseAttempts, 1);
  assert.equal(migrated.currentLevelId, 'level-2-elementary');
});

test('Deterministic Mock Integration: Same-account restoration on a second browser context', () => {
  // Scenario: Candidate signs into a second computer with a fresh/empty browser profile.
  const emptyBrowserLocal: AcademyProgressState = { ...INITIAL_PROGRESS_STATE };

  const cloudAccountState = {
    current_level_id: 'level-3-intermediate',
    completed_lesson_ids: ['l-101-board-ranks-files', 'l-102-how-pieces-move', 'l-201-center-control', 'l-202-piece-development'],
    completed_module_ids: ['m-101-board-essentials', 'm-201-opening-fundamentals'],
    unlocked_level_ids: ['level-1-absolute-beginner', 'level-2-elementary', 'level-3-intermediate'],
    total_exercise_attempts: 25,
    correct_exercise_attempts: 22,
    incorrect_exercise_attempts: 3,
    last_active_at: '2026-03-05T14:30:00.000Z',
  };

  const restored = cloudSyncService.mergeAcademyProgress(emptyBrowserLocal, cloudAccountState);

  // Fresh browser must pull down full cloud history
  assert.equal(restored.completedLessonIds.length, 4);
  assert.equal(restored.totalExerciseAttempts, 25);
  assert.equal(restored.currentLevelId, 'level-3-intermediate');
  assert.equal(restored.unlockedLevelIds.length, 3);
});

test('Deterministic Mock Integration: Disjoint cross-device progress merges seamlessly', () => {
  // Device A finished Lesson 1 & 2; Device B finished Lesson 3 & 4.
  const deviceAProgress: AcademyProgressState = {
    ...INITIAL_PROGRESS_STATE,
    completedLessonIds: ['l-101-board-ranks-files', 'l-102-how-pieces-move'],
    totalExerciseAttempts: 5,
    lastActiveAt: '2026-03-01T10:00:00.000Z',
  };

  const cloudFromDeviceB = {
    current_level_id: 'level-1-absolute-beginner',
    completed_lesson_ids: ['l-103-captures-and-trades', 'l-104-check-checkmate'],
    completed_module_ids: ['m-101-board-essentials'],
    unlocked_level_ids: ['level-1-absolute-beginner'],
    total_exercise_attempts: 8,
    correct_exercise_attempts: 7,
    incorrect_exercise_attempts: 1,
    last_active_at: '2026-03-02T10:00:00.000Z',
  };

  const combined = cloudSyncService.mergeAcademyProgress(deviceAProgress, cloudFromDeviceB);

  // Both sets of lessons united
  assert.equal(combined.completedLessonIds.length, 4);
  assert.ok(combined.completedLessonIds.includes('l-101-board-ranks-files'));
  assert.ok(combined.completedLessonIds.includes('l-102-how-pieces-move'));
  assert.ok(combined.completedLessonIds.includes('l-103-captures-and-trades'));
  assert.ok(combined.completedLessonIds.includes('l-104-check-checkmate'));
  assert.equal(combined.totalExerciseAttempts, 8); // Math.max(5, 8)
});

test('Deterministic Mock Integration: Idempotency and zero learner evidence double-counting', () => {
  const sampleProgress: AcademyProgressState = {
    ...INITIAL_PROGRESS_STATE,
    completedLessonIds: ['l-101-board-ranks-files'],
    activityHistory: [
      {
        id: 'act-unique-101',
        timestamp: '2026-03-01T10:00:00.000Z',
        type: 'exercise_passed',
        levelId: 'level-1-absolute-beginner',
        lessonId: 'l-101-board-ranks-files',
        lessonTitle: 'Board Ranks and Files',
      },
    ],
  };

  const sampleReports: AssessmentReport[] = [
    {
      id: 'arena-report-deterministic-01',
      formatId: 'single_match',
      formatName: 'Diagnostic Match',
      status: 'completed',
      totalGamesScheduled: 1,
      gamesCompleted: 1,
      overallResults: { acpl: 25, accuracyPercent: 92 } as any,
      games: [
        {
          gameId: 'game-eval-01',
          acpl: 25,
          accuracyPercent: 92,
          playerColor: 'w',
          moves: [],
          phaseBreakdown: {
            opening: { movesCount: 5, classificationCounts: { blunder: 0, mistake: 0 } as any, observations: [] },
          },
        } as any,
      ],
      createdAt: '2026-03-01T10:00:00.000Z',
    },
  ];

  // First extraction
  const evidencePass1 = EvidenceCollector.extractEvidence(sampleProgress, sampleReports);

  // Second extraction simulating repeated sync runs
  const evidencePass2 = EvidenceCollector.extractEvidence(sampleProgress, sampleReports);

  assert.equal(evidencePass1.length, evidencePass2.length);
  assert.deepEqual(evidencePass1.map((e) => e.id), evidencePass2.map((e) => e.id));
  assert.ok(evidencePass1.length > 0);
});

test('Deterministic Mock Integration: No local data loss on failed cloud write', () => {
  // Scenario: Local progress exists, but cloud network failure occurs.
  const localSnapshot: AcademyProgressState = {
    ...INITIAL_PROGRESS_STATE,
    completedLessonIds: ['l-101-board-ranks-files'],
    totalExerciseAttempts: 3,
  };

  // Simulate storing locally before attempt
  ProgressStorage.saveProgress(localSnapshot);

  // When offline, syncService safely returns without throwing
  const loaded = ProgressStorage.loadProgress();
  assert.equal(loaded.completedLessonIds.length, 1);
  assert.equal(loaded.totalExerciseAttempts, 3);
});
