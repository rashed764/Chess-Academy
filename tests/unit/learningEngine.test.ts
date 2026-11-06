import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EvidenceCollector } from '../../src/features/learning-engine/models/evidenceCollector.js';
import { PerformanceAnalyzer } from '../../src/features/learning-engine/models/performanceAnalyzer.js';
import { RecommendationEngine } from '../../src/features/learning-engine/models/recommendationEngine.js';
import { LearningEngineService } from '../../src/features/learning-engine/learningEngineService.js';
import { TOPIC_CATEGORY_DEFINITIONS, LESSON_TOPIC_MAPPINGS } from '../../src/features/learning-engine/models/topicTaxonomy.js';
import { CANONICAL_LESSON_IDS } from '../../src/features/training/data/index.js';
import { LESSON_MAP } from '../../src/features/training/data/curriculumData.js';
import type { AcademyProgressState } from '../../src/features/training/types.js';
import type { AssessmentReport } from '../../src/features/test-arena/types.js';

test('1. Empty learner profile and insufficient evidence', () => {
  const profile = LearningEngineService.computeProfile(null, null);

  assert.equal(profile.hasSufficientData, false);
  assert.equal(profile.totalEvidencePoints, 0);
  assert.equal(profile.strengths.length, 0);
  assert.equal(profile.weaknesses.length, 0);
  assert.equal(profile.insufficientEvidenceAreas.length, 10);
  assert.equal(profile.activePlan.recommendedNextLessonId, 'l-101-board-ranks-files');
});

test('2. New learner with no assessment history generates natural canonical start', () => {
  const emptyProgress: AcademyProgressState = {
    version: 1,
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

  const profile = LearningEngineService.computeProfile(emptyProgress, []);

  assert.equal(profile.activePlan.recommendedNextLessonId, 'l-101-board-ranks-files');
  const nextRec = profile.recommendations.find((r) => r.type === 'next_canonical_lesson');
  assert.ok(nextRec);
  assert.equal(nextRec?.targetLessonId, 'l-101-board-ranks-files');
});

test('3. Training-only evidence calculates correct topic accuracy without hallucinations', () => {
  const trainingProgress: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-1-absolute-beginner',
    completedLessonIds: ['l-101-board-ranks-files', 'l-102-knight-movement'],
    completedModuleIds: [],
    unlockedLevelIds: ['level-1-absolute-beginner'],
    lessonProgress: {},
    totalExerciseAttempts: 5,
    correctExerciseAttempts: 4,
    incorrectExerciseAttempts: 1,
    activityHistory: [
      {
        id: 'act-1',
        timestamp: '2026-11-06T10:00:00.000Z',
        type: 'exercise_passed',
        levelId: 'level-1-absolute-beginner',
        lessonId: 'l-101-board-ranks-files',
        lessonTitle: 'Board Ranks and Files',
        details: 'Solved',
      },
      {
        id: 'act-2',
        timestamp: '2026-11-06T10:05:00.000Z',
        type: 'exercise_passed',
        levelId: 'level-1-absolute-beginner',
        lessonId: 'l-101-board-ranks-files',
        lessonTitle: 'Board Ranks and Files',
        details: 'Solved',
      },
      {
        id: 'act-3',
        timestamp: '2026-11-06T10:10:00.000Z',
        type: 'exercise_passed',
        levelId: 'level-1-absolute-beginner',
        lessonId: 'l-101-board-ranks-files',
        lessonTitle: 'Board Ranks and Files',
        details: 'Solved',
      },
    ],
    lastActiveAt: new Date().toISOString(),
  };

  const profile = LearningEngineService.computeProfile(trainingProgress, []);
  const openingMetrics = profile.topicMetrics.opening_principles;

  assert.ok(openingMetrics.totalAttempts >= 3);
  assert.equal(openingMetrics.failedAttempts, 0);
  assert.equal(openingMetrics.successRate, 100);
  assert.notEqual(openingMetrics.confidence, 'insufficient');
});

test('4. Test Arena-only evidence detects tactical blunders and ACPL', () => {
  const arenaReports: AssessmentReport[] = [
    {
      id: 'assessment-test-1',
      formatId: 'single_match',
      formatName: 'Single-Match Diagnostic',
      createdAt: '2026-11-06T12:00:00.000Z',
      status: 'completed',
      totalGamesScheduled: 1,
      gamesCompleted: 1,
      games: [
        {
          gameId: 'game-1',
          assessmentId: 'assessment-test-1',
          gameIndex: 0,
          playerColor: 'w',
          timeControl: { initialMinutes: 15, incrementSeconds: 10, label: '15+10' },
          opponentDifficulty: { id: 'intermediate', name: 'Intermediate', label: 'Club', description: '', skillLevel: 10, defaultDepth: 8, timeRatio: 0.04, maxTimeMs: 1400 },
          startedAt: '2026-11-06T12:00:00.000Z',
          completedAt: '2026-11-06T12:20:00.000Z',
          initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          finalFen: '8/8/8/8/8/8/8/8 w - - 0 1',
          terminationReason: 'checkmate',
          result: '0-1',
          winner: 'black',
          playerWon: false,
          playerLost: true,
          isDraw: false,
          totalDurationSeconds: 1200,
          analyzedMovesCount: 2,
          acpl: 150,
          accuracyPercent: 55,
          classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 2, unclassified: 0 },
          phaseBreakdown: {
            opening: { movesCount: 2, acpl: 150, classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 2, unclassified: 0 }, observations: [] },
            middlegame: { movesCount: 0, classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
            endgame: { movesCount: 0, classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
          },
          moves: [
            { ply: 1, moveNumber: 1, color: 'w', san: 'e4', from: 'e2', to: 'e4', piece: 'p', fenBefore: '', fenAfter: '', quality: 'blunder', evalLossCp: 250, phase: 'opening', provenance: 'client_stockfish_wasm' },
            { ply: 3, moveNumber: 2, color: 'w', san: 'f3', from: 'f2', to: 'f3', piece: 'p', fenBefore: '', fenAfter: '', quality: 'blunder', evalLossCp: 300, phase: 'opening', provenance: 'client_stockfish_wasm' },
          ],
        },
      ],
      overallResults: {} as any,
    },
  ];

  const profile = LearningEngineService.computeProfile(null, arenaReports);
  assert.ok(profile.totalEvidencePoints >= 2);
  const blunders = profile.topicMetrics.hanging_pieces_blunders;
  assert.ok(blunders.failedAttempts >= 2);
});

test('5. Single isolated mistake is NEVER flagged as a permanent weakness', () => {
  const singleErrorProgress: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-2-elementary',
    completedLessonIds: ['l-101-board-ranks-files', 'l-102-knight-movement', 'l-103-pawn-promotion-mechanics', 'l-104-check-and-checkmate'],
    completedModuleIds: [],
    unlockedLevelIds: ['level-1-absolute-beginner', 'level-2-elementary'],
    lessonProgress: {},
    totalExerciseAttempts: 8,
    correctExerciseAttempts: 7,
    incorrectExerciseAttempts: 1,
    activityHistory: [
      { id: 'act-1', timestamp: '2026-11-06T10:00:00.000Z', type: 'exercise_passed', levelId: 'level-2-elementary', lessonId: 'l-203-the-knight-fork', lessonTitle: 'The Knight Fork', details: '' },
      { id: 'act-2', timestamp: '2026-11-06T10:05:00.000Z', type: 'exercise_passed', levelId: 'level-2-elementary', lessonId: 'l-203-the-knight-fork', lessonTitle: 'The Knight Fork', details: '' },
      { id: 'act-3', timestamp: '2026-11-06T10:10:00.000Z', type: 'exercise_passed', levelId: 'level-2-elementary', lessonId: 'l-204-the-absolute-pin', lessonTitle: 'The Absolute Pin', details: '' },
      { id: 'act-4', timestamp: '2026-11-06T10:15:00.000Z', type: 'exercise_failed', levelId: 'level-2-elementary', lessonId: 'l-204-the-absolute-pin', lessonTitle: 'The Absolute Pin', details: '' },
    ],
    lastActiveAt: new Date().toISOString(),
  };

  const profile = LearningEngineService.computeProfile(singleErrorProgress, []);
  const tacticalWeakness = profile.weaknesses.find((w) => w.category === 'tactical_patterns');

  // Must NOT classify as weakness because only 1 error occurred (requires >= 2 errors)
  assert.equal(tacticalWeakness, undefined);
});

test('6. Repeated mistakes trigger verified weakness with remedy and review recommendation', () => {
  const repeatedErrorProgress: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-2-elementary',
    completedLessonIds: ['l-101-board-ranks-files', 'l-102-knight-movement', 'l-103-pawn-promotion-mechanics', 'l-104-check-and-checkmate', 'l-203-the-knight-fork'],
    completedModuleIds: [],
    unlockedLevelIds: ['level-1-absolute-beginner', 'level-2-elementary'],
    lessonProgress: {},
    totalExerciseAttempts: 8,
    correctExerciseAttempts: 4,
    incorrectExerciseAttempts: 4,
    activityHistory: [
      { id: 'act-1', timestamp: '2026-11-06T10:00:00.000Z', type: 'exercise_failed', levelId: 'level-2-elementary', lessonId: 'l-203-the-knight-fork', lessonTitle: 'The Knight Fork', details: '' },
      { id: 'act-2', timestamp: '2026-11-06T10:05:00.000Z', type: 'exercise_failed', levelId: 'level-2-elementary', lessonId: 'l-203-the-knight-fork', lessonTitle: 'The Knight Fork', details: '' },
      { id: 'act-3', timestamp: '2026-11-06T10:10:00.000Z', type: 'exercise_failed', levelId: 'level-2-elementary', lessonId: 'l-204-the-absolute-pin', lessonTitle: 'The Absolute Pin', details: '' },
      { id: 'act-4', timestamp: '2026-11-06T10:15:00.000Z', type: 'exercise_failed', levelId: 'level-2-elementary', lessonId: 'l-204-the-absolute-pin', lessonTitle: 'The Absolute Pin', details: '' },
    ],
    lastActiveAt: new Date().toISOString(),
  };

  const profile = LearningEngineService.computeProfile(repeatedErrorProgress, []);
  const tacticalWeakness = profile.weaknesses.find((w) => w.category === 'tactical_patterns');

  assert.ok(tacticalWeakness);
  assert.equal(tacticalWeakness?.severity, 'repeated');
  assert.equal(tacticalWeakness?.evidenceCount, 4);

  // Recommendations must contain a review or targeted remedy for this weakness
  const reviewRec = profile.recommendations.find(
    (r) => r.targetCategory === 'tactical_patterns' && (r.type === 'curriculum_revision' || r.type === 'targeted_weakness_remedy')
  );
  assert.ok(reviewRec);
});

test('7. Real lesson ID validation: all recommendations reference valid canonical lessons', () => {
  const profile = LearningEngineService.computeProfile(null, null);

  for (const rec of profile.recommendations) {
    if (rec.targetLessonId) {
      assert.ok(
        CANONICAL_LESSON_IDS.includes(rec.targetLessonId),
        `Recommendation generated non-canonical lesson ID: ${rec.targetLessonId}`
      );
      assert.ok(
        Boolean(LESSON_MAP[rec.targetLessonId]),
        `Recommendation lesson ID does not exist in LESSON_MAP: ${rec.targetLessonId}`
      );
    }
  }
});

test('8. Canonical curriculum ordering and unlocking: no prerequisite bypass', () => {
  // Level 1 complete (6 lessons), Level 2 unlocked but untouched
  const lvl1Complete: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-2-elementary',
    completedLessonIds: [
      'l-101-board-ranks-files',
      'l-102-knight-movement',
      'l-103-pawn-promotion-mechanics',
      'l-104-check-and-checkmate',
      'l-105-castling-king-safety',
      'l-106-en-passant-capture',
    ],
    completedModuleIds: ['mod-1-board-pieces', 'mod-2-rules-mechanics'],
    unlockedLevelIds: ['level-1-absolute-beginner', 'level-2-elementary'],
    lessonProgress: {},
    totalExerciseAttempts: 6,
    correctExerciseAttempts: 6,
    incorrectExerciseAttempts: 0,
    activityHistory: [],
    lastActiveAt: new Date().toISOString(),
  };

  const nextLesson = RecommendationEngine.findNextCanonicalLesson(lvl1Complete);
  // Next lesson must be the first lesson of Level 2 ('l-201-piece-values-counting')
  assert.equal(nextLesson?.id, 'l-201-piece-values-counting');
});

test('9. Idempotency: duplicate evidence ingestion produces identical evidence counts', () => {
  const progress: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-1-absolute-beginner',
    completedLessonIds: ['l-101-board-ranks-files'],
    completedModuleIds: [],
    unlockedLevelIds: ['level-1-absolute-beginner'],
    lessonProgress: {},
    totalExerciseAttempts: 2,
    correctExerciseAttempts: 2,
    incorrectExerciseAttempts: 0,
    activityHistory: [
      { id: 'dup-1', timestamp: '2026-11-06T10:00:00.000Z', type: 'exercise_passed', levelId: 'level-1-absolute-beginner', lessonId: 'l-101-board-ranks-files', lessonTitle: '', details: '' },
      { id: 'dup-1', timestamp: '2026-11-06T10:00:00.000Z', type: 'exercise_passed', levelId: 'level-1-absolute-beginner', lessonId: 'l-101-board-ranks-files', lessonTitle: '', details: '' },
    ],
    lastActiveAt: new Date().toISOString(),
  };

  const evidence = EvidenceCollector.extractEvidence(progress, []);
  const dupEntries = evidence.filter((e) => e.id === 'train-dup-1');
  assert.equal(dupEntries.length, 1);
});

test('10. TopicPerformanceMetrics recent trend calculation', () => {
  const points = [
    { id: 'p1', category: 'tactical_patterns' as const, isSuccess: false, weight: 1, timestamp: '2026-11-06T08:00:00.000Z', source: {} as any, context: {} },
    { id: 'p2', category: 'tactical_patterns' as const, isSuccess: false, weight: 1, timestamp: '2026-11-06T08:10:00.000Z', source: {} as any, context: {} },
    { id: 'p3', category: 'tactical_patterns' as const, isSuccess: true, weight: 1, timestamp: '2026-11-06T08:20:00.000Z', source: {} as any, context: {} },
    { id: 'p4', category: 'tactical_patterns' as const, isSuccess: true, weight: 1, timestamp: '2026-11-06T08:30:00.000Z', source: {} as any, context: {} },
    { id: 'p5', category: 'tactical_patterns' as const, isSuccess: true, weight: 1, timestamp: '2026-11-06T08:40:00.000Z', source: {} as any, context: {} },
    { id: 'p6', category: 'tactical_patterns' as const, isSuccess: true, weight: 1, timestamp: '2026-11-06T08:50:00.000Z', source: {} as any, context: {} },
  ];

  const metrics = PerformanceAnalyzer.analyzeTopicMetrics(points);
  assert.equal(metrics.tactical_patterns.recentTrend, 'improving');
});
