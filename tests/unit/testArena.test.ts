import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertToMoverPerspective,
  evaluateMoveQuality,
  classifyGamePhase,
  calculateAccuracyFromAcpl,
} from '../../src/features/test-arena/models/analysisEngine';
import {
  calculatePhaseMetrics,
  calculateGameMetrics,
  aggregateAssessmentGames,
  estimateSkillRange,
} from '../../src/features/test-arena/models/metrics';
import { ARENA_ASSESSMENT_FORMATS } from '../../src/features/test-arena/models/formats';
import { TestArenaStorage, TEST_ARENA_STORAGE_KEY } from '../../src/features/test-arena/models/storage';
import type { AnalyzedMoveRecord, AssessmentGameRecord } from '../../src/features/test-arena/types';
import { DIFFICULTY_PRESETS } from '../../src/features/quick-match/models/difficulty';

test('convertToMoverPerspective inverts White-positive scores for Black', () => {
  // White to move: score remains unchanged
  const whiteRes = convertToMoverPerspective(150, 3, 'w');
  assert.equal(whiteRes.moverCp, 150);
  assert.equal(whiteRes.moverMate, 3);

  // Black to move: score inverted
  const blackRes = convertToMoverPerspective(-200, -2, 'b');
  assert.equal(blackRes.moverCp, 200); // Black has +200 advantage
  assert.equal(blackRes.moverMate, 2); // Black is mating in 2

  // Undefined handled safely
  const emptyRes = convertToMoverPerspective(undefined, undefined, 'b');
  assert.equal(emptyRes.moverCp, undefined);
  assert.equal(emptyRes.moverMate, undefined);
});

test('evaluateMoveQuality correctly calculates White and Black centipawn loss and tiers', () => {
  // White moves:
  // Best move (loss <= 10 cp)
  const wBest = evaluateMoveQuality(100, 95, 'w');
  assert.equal(wBest.quality, 'best');
  assert.equal(wBest.evalLossCp, 5);

  // Good move (10 < loss <= 30)
  const wGood = evaluateMoveQuality(100, 75, 'w');
  assert.equal(wGood.quality, 'good');
  assert.equal(wGood.evalLossCp, 25);

  // Inaccuracy (30 < loss <= 90)
  const wInacc = evaluateMoveQuality(100, 40, 'w');
  assert.equal(wInacc.quality, 'inaccuracy');
  assert.equal(wInacc.evalLossCp, 60);

  // Mistake (90 < loss <= 200)
  const wMistake = evaluateMoveQuality(100, -50, 'w');
  assert.equal(wMistake.quality, 'mistake');
  assert.equal(wMistake.evalLossCp, 150);

  // Blunder (loss > 200)
  const wBlunder = evaluateMoveQuality(100, -150, 'w');
  assert.equal(wBlunder.quality, 'blunder');
  assert.equal(wBlunder.evalLossCp, 250);

  // Black moves:
  // Before: White was -100 (Black was +100). After: White is -95 (Black is +95). Loss = 5 cp.
  const bBest = evaluateMoveQuality(-100, -95, 'b');
  assert.equal(bBest.quality, 'best');
  assert.equal(bBest.evalLossCp, 5);

  // Before: White was -100. After: White is +150 (Black lost 250 cp).
  const bBlunder = evaluateMoveQuality(-100, 150, 'b');
  assert.equal(bBlunder.quality, 'blunder');
  assert.equal(bBlunder.evalLossCp, 250);
});

test('evaluateMoveQuality handles mate transitions without numeric subtraction errors', () => {
  // Preserving forced mate sequence
  const matePreserved = evaluateMoveQuality(undefined, undefined, 'w', false, false, {
    mateBefore: 3,
    mateAfter: 2,
  });
  assert.equal(matePreserved.quality, 'best');
  assert.equal(matePreserved.evalLossCp, 0);

  // Forfeiting forced mate
  const mateLost = evaluateMoveQuality(undefined, 50, 'w', false, false, {
    mateBefore: 2,
  });
  assert.equal(mateLost.quality, 'blunder');
  assert.equal(mateLost.isMateBlunder, true);

  // Blundering into opponent forced mate
  const blunderedIntoMate = evaluateMoveQuality(100, undefined, 'w', false, false, {
    mateAfter: -1, // Opponent mates in 1
  });
  assert.equal(blunderedIntoMate.quality, 'blunder');
  assert.equal(blunderedIntoMate.isMateBlunder, true);
});

test('evaluateMoveQuality handles depth < 6 ply and brilliant moves', () => {
  // Insufficient depth
  const lowDepth = evaluateMoveQuality(100, 90, 'w', false, false, { depthBefore: 4 });
  assert.equal(lowDepth.quality, 'unclassified');

  // Brilliant move (sound sacrifice maintaining decisive advantage >= +150)
  const brilliantMove = evaluateMoveQuality(300, 200, 'w', true, true);
  assert.equal(brilliantMove.quality, 'brilliant');

  // Sacrifice without decisive advantage defaults conservatively to best
  const nonDecisiveSac = evaluateMoveQuality(50, 40, 'w', true, true);
  assert.equal(nonDecisiveSac.quality, 'best');
});

test('classifyGamePhase identifies opening, middlegame, and endgame positions', () => {
  // Starting position at ply 0
  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  assert.equal(classifyGamePhase(startFen, 2), 'opening');

  // Classic King and Pawn endgame (no queens or rooks)
  const pawnEndgameFen = '8/4k3/8/8/8/8/4K3/8 w - - 0 1';
  assert.equal(classifyGamePhase(pawnEndgameFen, 50), 'endgame');

  // Middlegame with queens and minor pieces at ply 26
  const middlegameFen = 'r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 4 8';
  assert.equal(classifyGamePhase(middlegameFen, 26), 'middlegame');
});

test('calculateAccuracyFromAcpl produces mathematically bounded percentages', () => {
  assert.equal(calculateAccuracyFromAcpl(0), 100);
  assert.equal(calculateAccuracyFromAcpl(-5), 100);

  const acc10 = calculateAccuracyFromAcpl(10);
  assert.equal(acc10 >= 95 && acc10 <= 97, true);

  const acc40 = calculateAccuracyFromAcpl(40);
  assert.equal(acc40 >= 84 && acc40 <= 86, true);

  const acc100 = calculateAccuracyFromAcpl(100);
  assert.equal(acc100 >= 66 && acc100 <= 68, true);

  const acc300 = calculateAccuracyFromAcpl(300);
  assert.equal(acc300 >= 29 && acc300 <= 32, true);
});

test('Arena formats adhere strictly to protocol specifications', () => {
  // Single-Match Diagnostic: 15+10, 1 game
  const single = ARENA_ASSESSMENT_FORMATS.single_match;
  assert.equal(single.timeControl.initialMinutes, 15);
  assert.equal(single.timeControl.incrementSeconds, 10);
  assert.equal(single.totalGames, 1);

  // 5-Game Mastery Battery: 10+0, 5 games, alternating color
  const battery = ARENA_ASSESSMENT_FORMATS.five_match_battery;
  assert.equal(battery.timeControl.initialMinutes, 10);
  assert.equal(battery.timeControl.incrementSeconds, 0);
  assert.equal(battery.totalGames, 5);
  assert.equal(battery.colorRule, 'alternating');

  // Tactical Speed Assessment: 5+0, 1 game
  const speed = ARENA_ASSESSMENT_FORMATS.tactical_speed;
  assert.equal(speed.timeControl.initialMinutes, 5);
  assert.equal(speed.timeControl.incrementSeconds, 0);
  assert.equal(speed.totalGames, 1);
});

test('aggregateAssessmentGames sums underlying moves without percentage distortion', () => {
  const dummyMove = (san: string, quality: any, loss: number): AnalyzedMoveRecord => ({
    ply: 1,
    moveNumber: 1,
    color: 'w',
    san,
    from: 'e2',
    to: 'e4',
    piece: 'p',
    fenBefore: '',
    fenAfter: '',
    quality,
    evalLossCp: loss,
    phase: 'opening',
    provenance: 'client_stockfish_wasm',
  });

  const game1: AssessmentGameRecord = {
    gameId: 'g1',
    assessmentId: 'a1',
    gameIndex: 0,
    playerColor: 'w',
    timeControl: { initialMinutes: 10, incrementSeconds: 0, label: '10+0' },
    opponentDifficulty: DIFFICULTY_PRESETS.intermediate,
    startedAt: '',
    completedAt: '',
    initialFen: '',
    finalFen: '',
    terminationReason: 'checkmate',
    result: '1-0',
    winner: 'white',
    playerWon: true,
    playerLost: false,
    isDraw: false,
    totalDurationSeconds: 120,
    moves: [
      dummyMove('e4', 'best', 0),
      dummyMove('Nf3', 'best', 0),
    ],
    analyzedMovesCount: 2,
    acpl: 0,
    accuracyPercent: 100,
    classificationCounts: { brilliant: 0, best: 2, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 },
    phaseBreakdown: {
      opening: { movesCount: 2, classificationCounts: { brilliant: 0, best: 2, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
      middlegame: { movesCount: 0, classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
      endgame: { movesCount: 0, classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
    },
  };

  const game2: AssessmentGameRecord = {
    gameId: 'g2',
    assessmentId: 'a1',
    gameIndex: 1,
    playerColor: 'w',
    timeControl: { initialMinutes: 10, incrementSeconds: 0, label: '10+0' },
    opponentDifficulty: DIFFICULTY_PRESETS.intermediate,
    startedAt: '',
    completedAt: '',
    initialFen: '',
    finalFen: '',
    terminationReason: 'checkmate',
    result: '0-1',
    winner: 'black',
    playerWon: false,
    playerLost: true,
    isDraw: false,
    totalDurationSeconds: 150,
    moves: [
      dummyMove('e4', 'best', 0),
      dummyMove('d4', 'blunder', 250),
    ],
    analyzedMovesCount: 2,
    acpl: 125,
    accuracyPercent: 60.7,
    classificationCounts: { brilliant: 0, best: 1, good: 0, inaccuracy: 0, mistake: 0, blunder: 1, unclassified: 0 },
    phaseBreakdown: {
      opening: { movesCount: 2, classificationCounts: { brilliant: 0, best: 1, good: 0, inaccuracy: 0, mistake: 0, blunder: 1, unclassified: 0 }, observations: [] },
      middlegame: { movesCount: 0, classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
      endgame: { movesCount: 0, classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
    },
  };

  const agg = aggregateAssessmentGames([game1, game2]);
  assert.equal(agg.wins, 1);
  assert.equal(agg.losses, 1);
  assert.equal(agg.draws, 0);
  assert.equal(agg.totalMoves, 4);
  assert.equal(agg.classificationCounts.best, 3);
  assert.equal(agg.classificationCounts.blunder, 1);
  // Total loss across 4 moves: 0 + 0 + 0 + 250 = 250 / 4 = 62.5 cp
  assert.equal(agg.acpl, 62.5);
  assert.equal(agg.accuracyPercent > 70 && agg.accuracyPercent < 85, true);
});

test('estimateSkillRange discloses educational nature and never claims official FIDE rating', () => {
  const estimate = estimateSkillRange(50, 85, 10);
  assert.equal(estimate.disclaimer.includes('NOT an official FIDE rating'), true);
  assert.equal(estimate.label.length > 0, true);
  assert.equal(estimate.rangeMin < estimate.rangeMax, true);
});

test('TestArenaStorage handles storage recovery without crashing', () => {
  // Verify in non-browser or mock environments
  const reports = TestArenaStorage.getReports();
  assert.equal(Array.isArray(reports), true);

  const active = TestArenaStorage.getActiveAssessment();
  assert.equal(active, null);
});
