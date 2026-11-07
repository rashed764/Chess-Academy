import test from 'node:test';
import assert from 'node:assert/strict';
import { AcademyOrchestrator } from '../../src/features/tutor/models/academyOrchestrator';
import { ProgressStorage } from '../../src/features/training/models/progressStorage';
import { CANONICAL_LESSON_IDS } from '../../src/features/training/data';
import type { AssessmentReport } from '../../src/features/test-arena/types';

test('AcademyOrchestrator: canStartLesson validates canonical lesson existence and unlocks', () => {
  // Non-existent lesson
  const nonExistent = AcademyOrchestrator.canStartLesson('fake-lesson-id');
  assert.equal(nonExistent.allowed, false);

  // Lesson 1 is always unlocked
  const lesson1 = AcademyOrchestrator.canStartLesson('l-101-board-ranks-files');
  assert.equal(lesson1.allowed, true);
});

test('AcademyOrchestrator: checkTestArenaEligibility requires baseline lesson experience', () => {
  const emptyProgress = ProgressStorage.loadProgress();
  const res1 = AcademyOrchestrator.checkTestArenaEligibility({
    ...emptyProgress,
    completedLessonIds: [],
  });
  assert.equal(res1.eligible, false);
  assert.equal(res1.requiredCount, 3);

  const res2 = AcademyOrchestrator.checkTestArenaEligibility({
    ...emptyProgress,
    completedLessonIds: ['l-101-board-ranks-files', 'l-102-knight-movement', 'l-103-pawn-promotion-mechanics'],
  });
  assert.equal(res2.eligible, true);
});

test('AcademyOrchestrator: analyzeTestReportAndRecommendLessons targets demonstrated weaknesses', () => {
  const sampleReport: AssessmentReport = {
    id: 'report-test-1',
    formatId: 'single_match',
    formatName: 'Single-Match Diagnostic',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status: 'completed',
    totalGamesScheduled: 1,
    gamesCompleted: 1,
    games: [],
    overallResults: {
      wins: 0,
      losses: 1,
      draws: 0,
      totalMoves: 35,
      playerMovesCount: 18,
      acpl: 110, // High ACPL -> calculation weakness
      accuracyPercent: 64,
      classificationCounts: {
        brilliant: 0,
        best: 10,
        good: 8,
        inaccuracy: 5,
        mistake: 4,
        blunder: 3, // Blunders present
        unclassified: 0,
      },
      bestMovesPercent: 55,
      phaseBreakdown: {
        opening: { movesCount: 10, acpl: 30, classificationCounts: { brilliant: 0, best: 5, good: 5, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
        middlegame: { movesCount: 15, acpl: 90, classificationCounts: { brilliant: 0, best: 3, good: 2, inaccuracy: 3, mistake: 4, blunder: 3, unclassified: 0 }, observations: [] },
        endgame: { movesCount: 10, acpl: 120, classificationCounts: { brilliant: 0, best: 2, good: 1, inaccuracy: 2, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
      },
      strengths: ['Opening development'],
      weaknesses: ['Tactical calculation'],
      tacticalObservations: [],
      timeObservations: [],
      recommendations: [],
      methodologyNote: 'Stockfish evaluation',
    },
  };

  const analysis = AcademyOrchestrator.analyzeTestReportAndRecommendLessons(sampleReport);
  assert.ok(analysis.targetWeaknesses.length >= 2);
  assert.ok(analysis.recommendedLessonIds.length >= 2);

  // Recommendations must adhere strictly to canonical lesson IDs
  for (const id of analysis.recommendedLessonIds) {
    assert.ok(CANONICAL_LESSON_IDS.includes(id));
  }
});
