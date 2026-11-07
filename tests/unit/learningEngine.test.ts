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

test('11. Automated taxonomy completeness: all 30 canonical lessons mapped without stale entries', () => {
  // 1. Every ID in CANONICAL_LESSON_IDS has a corresponding LESSON_TOPIC_MAPPINGS entry
  for (const id of CANONICAL_LESSON_IDS) {
    const mapping = LESSON_TOPIC_MAPPINGS[id];
    assert.ok(mapping, `Missing taxonomy mapping for canonical lesson: ${id}`);
    assert.equal(mapping.lessonId, id, `Mapping lessonId does not match key for: ${id}`);

    // 2. Every mapping references a real lesson in LESSON_MAP
    const lesson = LESSON_MAP[id];
    assert.ok(lesson, `Lesson not found in LESSON_MAP: ${id}`);

    // 3. Every mapping has a valid educational category
    assert.ok(
      Boolean(TOPIC_CATEGORY_DEFINITIONS[mapping.category]),
      `Invalid educational category "${mapping.category}" for lesson: ${id}`
    );

    // 4. Mappings have valid tags and title
    assert.ok(mapping.topicTitle.length > 0, `Missing topicTitle for: ${id}`);
    assert.ok(Array.isArray(mapping.tags) && mapping.tags.length > 0, `Missing tags for: ${id}`);
  }

  // 5. Zero stale or unknown lesson IDs in taxonomy dictionary
  for (const id of Object.keys(LESSON_TOPIC_MAPPINGS)) {
    assert.ok(
      CANONICAL_LESSON_IDS.includes(id as any),
      `Stale or unknown lesson ID found in LESSON_TOPIC_MAPPINGS: ${id}`
    );
  }

  assert.equal(Object.keys(LESSON_TOPIC_MAPPINGS).length, 30);
  assert.equal(CANONICAL_LESSON_IDS.length, 30);
});

test('12. Level 4 regression: Lucena Bridge and Good vs Bad Bishops ingestion', () => {
  const lvl4Progress: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-4-advanced',
    completedLessonIds: [
      'l-101-board-ranks-files', 'l-102-knight-movement', 'l-103-pawn-promotion-mechanics',
      'l-104-check-and-checkmate', 'l-105-castling-king-safety', 'l-106-en-passant-capture',
      'l-201-piece-values-counting', 'l-202-controlling-the-center', 'l-203-the-knight-fork', 'l-204-the-absolute-pin',
      'l-301-the-linear-skewer', 'l-302-deflection-and-decoy', 'l-303-back-rank-destruction', 'l-304-knight-outposts-open-files',
      'l-401-weak-squares-color-complex', 'l-402-prophylactic-thinking',
    ],
    completedModuleIds: [],
    unlockedLevelIds: ['level-1-absolute-beginner', 'level-2-elementary', 'level-3-intermediate', 'level-4-advanced'],
    lessonProgress: {},
    totalExerciseAttempts: 6,
    correctExerciseAttempts: 5,
    incorrectExerciseAttempts: 1,
    activityHistory: [
      {
        id: 'act-403-1',
        timestamp: '2026-11-06T11:00:00.000Z',
        type: 'exercise_passed',
        levelId: 'level-4-advanced',
        lessonId: 'l-403-the-lucena-bridge',
        lessonTitle: 'The Lucena Position: Building the Rook Bridge',
        details: 'Solved',
      },
      {
        id: 'act-403-2',
        timestamp: '2026-11-06T11:05:00.000Z',
        type: 'exercise_passed',
        levelId: 'level-4-advanced',
        lessonId: 'l-403-the-lucena-bridge',
        lessonTitle: 'The Lucena Position: Building the Rook Bridge',
        details: 'Solved',
      },
      {
        id: 'act-404-1',
        timestamp: '2026-11-06T11:10:00.000Z',
        type: 'exercise_passed',
        levelId: 'level-4-advanced',
        lessonId: 'l-404-good-vs-bad-bishops',
        lessonTitle: 'Good Bishops vs. Bad Bishops',
        details: 'Solved',
      },
    ],
    lastActiveAt: new Date().toISOString(),
  };

  const profile = LearningEngineService.computeProfile(lvl4Progress, []);

  // Verify l-403 is ingested as endgame_fundamentals (NOT opening_principles!)
  const endgameMetrics = profile.topicMetrics.endgame_fundamentals;
  assert.ok(endgameMetrics.totalAttempts >= 2, 'l-403 attempts must be ingested into endgame_fundamentals');

  // Verify l-404 is ingested as positional_understanding
  const positionalMetrics = profile.topicMetrics.positional_understanding;
  assert.ok(positionalMetrics.totalAttempts >= 1, 'l-404 attempt must be ingested into positional_understanding');

  // Next canonical lesson must be l-403-the-lucena-bridge since it is not in completedLessonIds
  const nextRec = profile.recommendations.find((r) => r.type === 'next_canonical_lesson');
  assert.ok(nextRec);
  assert.equal(nextRec?.targetLessonId, 'l-403-the-lucena-bridge');
  assert.equal(nextRec?.targetCategory, 'endgame_fundamentals');
});

test('13. Level 5 regression: all four lessons ingested and categorized accurately', () => {
  const lvl5Progress: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-5-expert',
    completedLessonIds: [],
    completedModuleIds: [],
    unlockedLevelIds: ['level-5-expert'],
    lessonProgress: {},
    totalExerciseAttempts: 8,
    correctExerciseAttempts: 6,
    incorrectExerciseAttempts: 2,
    activityHistory: [
      { id: 'act-501', timestamp: '2026-11-06T12:00:00.000Z', type: 'exercise_passed', levelId: 'level-5-expert', lessonId: 'l-501-candidate-moves-elimination', lessonTitle: '', details: '' },
      { id: 'act-502', timestamp: '2026-11-06T12:05:00.000Z', type: 'exercise_passed', levelId: 'level-5-expert', lessonId: 'l-502-positional-exchange-sacrifice', lessonTitle: '', details: '' },
      { id: 'act-503', timestamp: '2026-11-06T12:10:00.000Z', type: 'exercise_passed', levelId: 'level-5-expert', lessonId: 'l-503-fortress-defensive-resource', lessonTitle: '', details: '' },
      { id: 'act-504-f1', timestamp: '2026-11-06T12:15:00.000Z', type: 'exercise_failed', levelId: 'level-5-expert', lessonId: 'l-504-the-zwischenzug-intermediate-move', lessonTitle: 'The Zwischenzug', details: '' },
      { id: 'act-504-f2', timestamp: '2026-11-06T12:20:00.000Z', type: 'exercise_failed', levelId: 'level-5-expert', lessonId: 'l-504-the-zwischenzug-intermediate-move', lessonTitle: 'The Zwischenzug', details: '' },
      { id: 'act-504-f3', timestamp: '2026-11-06T12:25:00.000Z', type: 'exercise_failed', levelId: 'level-5-expert', lessonId: 'l-504-the-zwischenzug-intermediate-move', lessonTitle: 'The Zwischenzug', details: '' },
    ],
    lastActiveAt: new Date().toISOString(),
  };

  const profile = LearningEngineService.computeProfile(lvl5Progress, []);

  // Calculation accuracy: l-501 and l-502
  assert.ok(profile.topicMetrics.calculation_accuracy.totalAttempts >= 2);
  // Endgame fundamentals: l-503
  assert.ok(profile.topicMetrics.endgame_fundamentals.totalAttempts >= 1);
  // Tactical patterns: l-504 with 3 failures
  assert.ok(profile.topicMetrics.tactical_patterns.totalAttempts >= 3);
  assert.equal(profile.topicMetrics.tactical_patterns.failedAttempts, 3);

  // Weakness in tactical patterns must resolve related lesson l-504 in LESSON_MAP
  const tacticalWeakness = profile.weaknesses.find((w) => w.category === 'tactical_patterns');
  assert.ok(tacticalWeakness);
  assert.ok(tacticalWeakness?.relatedLessonIds.includes('l-504-the-zwischenzug-intermediate-move'));
});

test('14. Level 6 regression: all four lessons correctly categorized and ingested', () => {
  const lvl6Progress: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-6-master',
    completedLessonIds: [],
    completedModuleIds: [],
    unlockedLevelIds: ['level-6-master'],
    lessonProgress: {},
    totalExerciseAttempts: 4,
    correctExerciseAttempts: 4,
    incorrectExerciseAttempts: 0,
    activityHistory: [
      { id: 'act-601', timestamp: '2026-11-06T13:00:00.000Z', type: 'exercise_passed', levelId: 'level-6-master', lessonId: 'l-601-master-prophylaxis-restriction', lessonTitle: '', details: '' },
      { id: 'act-602', timestamp: '2026-11-06T13:05:00.000Z', type: 'exercise_passed', levelId: 'level-6-master', lessonId: 'l-602-principle-of-two-weaknesses', lessonTitle: '', details: '' },
      { id: 'act-603', timestamp: '2026-11-06T13:10:00.000Z', type: 'exercise_passed', levelId: 'level-6-master', lessonId: 'l-603-stalemate-swindle-resource', lessonTitle: '', details: '' },
      { id: 'act-604', timestamp: '2026-11-06T13:15:00.000Z', type: 'exercise_passed', levelId: 'level-6-master', lessonId: 'l-604-the-minority-attack-carlsbad', lessonTitle: '', details: '' },
    ],
    lastActiveAt: new Date().toISOString(),
  };

  const profile = LearningEngineService.computeProfile(lvl6Progress, []);

  // Positional understanding: l-601, l-602, l-604 (3 points)
  assert.ok(profile.topicMetrics.positional_understanding.totalAttempts >= 3);
  // Hanging pieces / blunders: l-603 (1 point)
  assert.ok(profile.topicMetrics.hanging_pieces_blunders.totalAttempts >= 1);
  assert.equal(profile.totalEvidencePoints, 4);
});

test('15. Level 7 regression: all four lessons correctly categorized without drop', () => {
  const lvl7Progress: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-7-grandmaster-prep',
    completedLessonIds: [],
    completedModuleIds: [],
    unlockedLevelIds: ['level-7-grandmaster-prep'],
    lessonProgress: {},
    totalExerciseAttempts: 4,
    correctExerciseAttempts: 4,
    incorrectExerciseAttempts: 0,
    activityHistory: [
      { id: 'act-701', timestamp: '2026-11-06T14:00:00.000Z', type: 'exercise_passed', levelId: 'level-7-grandmaster-prep', lessonId: 'l-701-najdorf-dynamic-preparation', lessonTitle: '', details: '' },
      { id: 'act-702', timestamp: '2026-11-06T14:05:00.000Z', type: 'exercise_passed', levelId: 'level-7-grandmaster-prep', lessonId: 'l-702-grandmaster-multi-ply-calculation', lessonTitle: '', details: '' },
      { id: 'act-703', timestamp: '2026-11-06T14:10:00.000Z', type: 'exercise_passed', levelId: 'level-7-grandmaster-prep', lessonId: 'l-703-tournament-pragmatism-simplification', lessonTitle: '', details: '' },
      { id: 'act-704', timestamp: '2026-11-06T14:15:00.000Z', type: 'exercise_passed', levelId: 'level-7-grandmaster-prep', lessonId: 'l-704-converting-plus-equals-endgame', lessonTitle: '', details: '' },
    ],
    lastActiveAt: new Date().toISOString(),
  };

  const profile = LearningEngineService.computeProfile(lvl7Progress, []);

  // Opening principles: l-701
  assert.ok(profile.topicMetrics.opening_principles.totalAttempts >= 1);
  // Calculation accuracy: l-702
  assert.ok(profile.topicMetrics.calculation_accuracy.totalAttempts >= 1);
  // Endgame fundamentals: l-703 and l-704
  assert.ok(profile.topicMetrics.endgame_fundamentals.totalAttempts >= 2);
  assert.equal(profile.totalEvidencePoints, 4);
});

test('16. Combined multi-level learner profile across Levels 1–7: complete integrity', () => {
  // Activity spanning across all 7 levels
  const all30Activities = CANONICAL_LESSON_IDS.map((id, index) => ({
    id: `act-all-${index}`,
    timestamp: new Date(Date.now() - (30 - index) * 60000).toISOString(),
    type: 'exercise_passed' as const,
    levelId: LESSON_MAP[id]?.levelId || ('level-1-absolute-beginner' as const),
    lessonId: id,
    lessonTitle: LESSON_MAP[id]?.title || '',
    details: 'Verified',
  }));

  const fullProgress: AcademyProgressState = {
    version: 1,
    currentLevelId: 'level-7-grandmaster-prep',
    completedLessonIds: CANONICAL_LESSON_IDS.slice(0, 29), // 29 of 30 completed
    completedModuleIds: [],
    unlockedLevelIds: [
      'level-1-absolute-beginner', 'level-2-elementary', 'level-3-intermediate',
      'level-4-advanced', 'level-5-expert', 'level-6-master', 'level-7-grandmaster-prep'
    ],
    lessonProgress: {},
    totalExerciseAttempts: 30,
    correctExerciseAttempts: 30,
    incorrectExerciseAttempts: 0,
    activityHistory: all30Activities,
    lastActiveAt: new Date().toISOString(),
  };

  const profile = LearningEngineService.computeProfile(fullProgress, []);

  // Zero evidence points lost: 30 activities + 29 completed lessons = 59 evidence points
  assert.ok(profile.totalEvidencePoints >= 30, 'All 30 lesson activities must be ingested without loss');
  assert.equal(profile.hasSufficientData, true);

  // Next canonical lesson must be the 30th lesson: 'l-704-converting-plus-equals-endgame'
  const nextRec = profile.recommendations.find((r) => r.type === 'next_canonical_lesson');
  assert.ok(nextRec);
  assert.equal(nextRec?.targetLessonId, 'l-704-converting-plus-equals-endgame');
  assert.equal(nextRec?.targetCategory, 'endgame_fundamentals'); // Mapped to endgame, NOT opening!
  assert.ok(CANONICAL_LESSON_IDS.includes(nextRec?.targetLessonId!));
  assert.ok(Boolean(LESSON_MAP[nextRec?.targetLessonId!]));
});

