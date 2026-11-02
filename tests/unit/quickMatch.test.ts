import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import {
  createChessClock,
  startChessClock,
  tickChessClock,
  commitChessMove,
  stopChessClock,
  getDisplayTimeMs,
  formatClockDisplay,
} from '../../src/features/quick-match/models/clock';
import {
  QUICK_MATCH_TIME_CONTROLS,
  validateCustomTimeControl,
} from '../../src/features/quick-match/models/timeControls';
import {
  DIFFICULTY_PRESETS,
  calculateEngineSearchBudget,
} from '../../src/features/quick-match/models/difficulty';

test('ChessClock: creates initial state with exact millisecond allocations', () => {
  const clock = createChessClock(10, 5);
  assert.equal(clock.whiteRemainingMs, 600000);
  assert.equal(clock.blackRemainingMs, 600000);
  assert.equal(clock.initialMs, 600000);
  assert.equal(clock.incrementMs, 5000);
  assert.equal(clock.activeSide, null);
  assert.equal(clock.isExpired, false);
});

test('ChessClock: starts clock and deducts elapsed time accurately without drift', () => {
  const t0 = 1000000;
  let clock = createChessClock(3, 2);
  clock = startChessClock(clock, 'w', t0);

  assert.equal(clock.activeSide, 'w');
  assert.equal(clock.lastTimestamp, t0);

  // Advance by 1500ms
  const t1 = t0 + 1500;
  clock = tickChessClock(clock, t1);
  const displayWhite = getDisplayTimeMs(clock, 'w', t1);
  assert.equal(displayWhite, 180000 - 1500);

  // Black display time should remain untouched
  const displayBlack = getDisplayTimeMs(clock, 'b', t1);
  assert.equal(displayBlack, 180000);
});

test('ChessClock: committing move adds increment and hands over to opponent', () => {
  const t0 = 1000000;
  let clock = createChessClock(3, 2);
  clock = startChessClock(clock, 'w', t0);

  // White moves after 4000ms
  const t1 = t0 + 4000;
  clock = commitChessMove(clock, 'w', 'b', t1);

  // White remaining should be: 180000 - 4000 + 2000 = 178000ms
  assert.equal(clock.whiteRemainingMs, 178000);
  assert.equal(clock.activeSide, 'b');
  assert.equal(clock.lastTimestamp, t1);

  // Black moves after 3000ms
  const t2 = t1 + 3000;
  clock = commitChessMove(clock, 'b', 'w', t2);

  // Black remaining should be: 180000 - 3000 + 2000 = 179000ms
  assert.equal(clock.blackRemainingMs, 179000);
  assert.equal(clock.activeSide, 'w');
});

test('ChessClock: detects timeout when player runs out of time', () => {
  const t0 = 1000000;
  let clock = createChessClock(1, 0); // 60,000ms
  clock = startChessClock(clock, 'w', t0);

  // Advance past 60,000ms
  const t1 = t0 + 60050;
  clock = tickChessClock(clock, t1);

  assert.equal(clock.isExpired, true);
  assert.equal(clock.expiredSide, 'w');
  assert.equal(clock.whiteRemainingMs, 0);
  assert.equal(clock.activeSide, null);
});

test('ChessClock: stopChessClock preserves current remaining balances', () => {
  const t0 = 1000000;
  let clock = createChessClock(5, 0);
  clock = startChessClock(clock, 'b', t0);

  const t1 = t0 + 12000;
  clock = stopChessClock(clock, t1);

  assert.equal(clock.activeSide, null);
  assert.equal(clock.blackRemainingMs, 300000 - 12000);
  assert.equal(clock.whiteRemainingMs, 300000);
});

test('ChessClock: formatClockDisplay adheres to standard and tenths under 10s', () => {
  // Over 1 minute
  assert.equal(formatClockDisplay(10 * 60 * 1000), '10:00');
  assert.equal(formatClockDisplay(3 * 60 * 1000 + 45 * 1000), '03:45');

  // Between 10s and 60s
  assert.equal(formatClockDisplay(45 * 1000), '00:45');
  assert.equal(formatClockDisplay(10 * 1000), '00:10');

  // Under 10s shows tenths
  assert.equal(formatClockDisplay(9450), '00:09.4');
  assert.equal(formatClockDisplay(3210), '00:03.2');
  assert.equal(formatClockDisplay(800), '00:00.8');
  assert.equal(formatClockDisplay(0), '00:00.0');
  assert.equal(formatClockDisplay(-500), '00:00.0');
});

test('TimeControls: presets contain all 9 required configurations', () => {
  const required = [
    'BULLET_1_0',
    'BULLET_2_1',
    'BLITZ_3_0',
    'BLITZ_3_2',
    'BLITZ_5_0',
    'BLITZ_5_3',
    'RAPID_10_0',
    'RAPID_15_10',
    'CLASSICAL_30_0',
  ];

  for (const id of required) {
    assert.ok(QUICK_MATCH_TIME_CONTROLS[id as keyof typeof QUICK_MATCH_TIME_CONTROLS]);
    const tc = QUICK_MATCH_TIME_CONTROLS[id as keyof typeof QUICK_MATCH_TIME_CONTROLS];
    assert.ok(tc.initialMinutes > 0);
    assert.ok(tc.incrementSeconds >= 0);
  }
});

test('TimeControls: custom time control validation enforces limits', () => {
  assert.equal(validateCustomTimeControl(10, 5).isValid, true);
  assert.equal(validateCustomTimeControl(0, 5).isValid, false);
  assert.equal(validateCustomTimeControl(-5, 0).isValid, false);
  assert.equal(validateCustomTimeControl(181, 0).isValid, false);
  assert.equal(validateCustomTimeControl(10, -1).isValid, false);
  assert.equal(validateCustomTimeControl(10, 61).isValid, false);
});

test('Difficulty: presets span 6 calibrated tiers and skill level 1 to 20', () => {
  const tiers = ['beginner', 'casual', 'intermediate', 'advanced', 'expert', 'maximum'] as const;
  for (const tier of tiers) {
    const p = DIFFICULTY_PRESETS[tier];
    assert.ok(p);
    assert.ok(p.skillLevel >= 1 && p.skillLevel <= 20);
    assert.ok(p.defaultDepth >= 4);
    assert.ok(p.timeRatio > 0);
  }

  assert.equal(DIFFICULTY_PRESETS.beginner.skillLevel, 1);
  assert.equal(DIFFICULTY_PRESETS.maximum.skillLevel, 20);
});

test('Difficulty: calculateEngineSearchBudget scales under time pressure', () => {
  const diff = DIFFICULTY_PRESETS.intermediate;

  // Normal time: 5 minutes remaining
  const normalBudget = calculateEngineSearchBudget(diff, 300000, 3000);
  assert.ok(normalBudget.timeLimitMs <= diff.maxTimeMs);
  assert.ok(normalBudget.timeLimitMs >= 100);

  // Severe time pressure: less than 2000ms
  const scramBudget = calculateEngineSearchBudget(diff, 1000, 0);
  assert.ok(scramBudget.timeLimitMs <= 200, 'Search time must drop under severe scramble');
  assert.ok(scramBudget.depth <= 4);
});

test('Chess Rules: detects checkmate with chess.js', () => {
  // Scholar's Mate: 1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#
  const chess = new Chess();
  chess.move('e4');
  chess.move('e5');
  chess.move('Qh5');
  chess.move('Nc6');
  chess.move('Bc4');
  chess.move('Nf6');
  chess.move('Qxf7#');

  assert.equal(chess.isCheckmate(), true);
  assert.equal(chess.turn(), 'b');
  assert.equal(chess.isGameOver(), true);
});

test('Chess Rules: detects stalemate with chess.js', () => {
  // Stalemate position: k7/2Q5/2K5/8/8/8/8/8 b - - 0 1
  const fen = 'k7/2Q5/2K5/8/8/8/8/8 b - - 0 1';
  const chess = new Chess(fen);
  assert.equal(chess.isStalemate(), true);
  assert.equal(chess.isGameOver(), true);
  assert.equal(chess.isCheck(), false);
});

test('Chess Rules: pawn promotion generates proper legal piece options', () => {
  // White pawn on a7 ready to promote on a8
  const fen = '8/P7/8/8/8/4k3/8/4K3 w - - 0 1';
  const chess = new Chess(fen);

  const moves = chess.moves({ square: 'a7', verbose: true });
  const promotions = moves.map((m) => m.promotion).filter(Boolean);
  assert.deepEqual(promotions.sort(), ['b', 'n', 'q', 'r']);

  // Move promoting to Queen
  const moveRes = chess.move({ from: 'a7', to: 'a8', promotion: 'q' });
  assert.ok(moveRes);
  assert.equal(moveRes.promotion, 'q');
  assert.equal(chess.get('a8')?.type, 'q');
});
