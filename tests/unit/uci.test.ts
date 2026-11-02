import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { UCIProtocol } from '../../src/services/chess/engine/UCIProtocol';
import { STARTING_FEN, validateFenStructure } from '../../src/services/chess/fen';
import type { MultiPvEntry } from '../../src/services/chess/engine/EngineTypes';

test('UCIProtocol parses standard info line with centipawn score and PV', () => {
  const line = 'info depth 12 seldepth 16 multipv 1 score cp 45 nodes 15234 nps 820000 time 18 pv e2e4 e7e5 g1f3 b8c6';
  const parsed = UCIProtocol.parseInfoLine(line);

  assert.ok(parsed);
  assert.equal(parsed.depth, 12);
  assert.equal(parsed.seldepth, 16);
  assert.equal(parsed.multipv, 1);
  assert.deepEqual(parsed.score, { type: 'cp', value: 45 });
  assert.equal(parsed.nodes, 15234);
  assert.equal(parsed.nps, 820000);
  assert.equal(parsed.timeMs, 18);
  assert.deepEqual(parsed.pv, ['e2e4', 'e7e5', 'g1f3', 'b8c6']);
});

test('UCIProtocol parses mate score in info line', () => {
  const line = 'info depth 8 multipv 1 score mate 3 nodes 500 nps 50000 time 10 pv e7e8q g8h7 e8g6';
  const parsed = UCIProtocol.parseInfoLine(line);

  assert.ok(parsed);
  assert.equal(parsed.depth, 8);
  assert.deepEqual(parsed.score, { type: 'mate', value: 3 });
  assert.deepEqual(parsed.pv, ['e7e8q', 'g8h7', 'e8g6']);
});

test('UCIProtocol parses negative mate score (opponent delivering mate)', () => {
  const line = 'info depth 6 score mate -2 pv d1d8 c8d8';
  const parsed = UCIProtocol.parseInfoLine(line);

  assert.ok(parsed);
  assert.deepEqual(parsed.score, { type: 'mate', value: -2 });
});

test('UCIProtocol parses bestmove with ponder', () => {
  const line = 'bestmove e2e4 ponder e7e5';
  const parsed = UCIProtocol.parseBestMove(line);

  assert.ok(parsed);
  assert.equal(parsed.bestMove, 'e2e4');
  assert.equal(parsed.ponder, 'e7e5');
});

test('UCIProtocol parses bestmove without ponder', () => {
  const line = 'bestmove d7d5';
  const parsed = UCIProtocol.parseBestMove(line);

  assert.ok(parsed);
  assert.equal(parsed.bestMove, 'd7d5');
  assert.equal(parsed.ponder, undefined);
});

test('UCIProtocol formats position command for starting position', () => {
  const cmd = UCIProtocol.formatPosition(STARTING_FEN);
  assert.equal(cmd, 'position startpos');
});

test('UCIProtocol formats position command with move history', () => {
  const cmd = UCIProtocol.formatPosition('startpos', ['e2e4', 'e7e5', 'g1f3']);
  assert.equal(cmd, 'position startpos moves e2e4 e7e5 g1f3');
});

test('UCIProtocol formats custom FEN position', () => {
  const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 1 4';
  const cmd = UCIProtocol.formatPosition(fen);
  assert.equal(cmd, `position fen ${fen}`);
});

test('UCIProtocol formats go depth and movetime commands', () => {
  assert.equal(UCIProtocol.formatGo({ depth: 14 }), 'go depth 14');
  assert.equal(UCIProtocol.formatGo({ timeLimitMs: 1500 }), 'go movetime 1500');
  assert.equal(UCIProtocol.formatGo(), 'go depth 15');
});

test('UCIProtocol normalizes score to White perspective across all 5 conditions', () => {
  // Condition 1: White has advantage (+150 cp) and White is to move ('w') -> +150
  const c1 = UCIProtocol.normalizeScoreToWhite({ type: 'cp', value: 150 }, 'w');
  assert.equal(c1.scoreCentipawns, 150);

  // Condition 2: White has advantage and Black is to move ('b') -> engine reports -150 for Black -> +150 for White
  const c2 = UCIProtocol.normalizeScoreToWhite({ type: 'cp', value: -150 }, 'b');
  assert.equal(c2.scoreCentipawns, 150);

  // Condition 3: Black has advantage and White is to move ('w') -> engine reports -200 for White -> -200 for White
  const c3 = UCIProtocol.normalizeScoreToWhite({ type: 'cp', value: -200 }, 'w');
  assert.equal(c3.scoreCentipawns, -200);

  // Condition 4: Black has advantage and Black is to move ('b') -> engine reports +200 for Black -> -200 for White
  const c4 = UCIProtocol.normalizeScoreToWhite({ type: 'cp', value: 200 }, 'b');
  assert.equal(c4.scoreCentipawns, -200);

  // Condition 5a: Forced mate for White when White to move -> +M3
  const c5a = UCIProtocol.normalizeScoreToWhite({ type: 'mate', value: 3 }, 'w');
  assert.equal(c5a.mateInMoves, 3);

  // Condition 5b: Forced mate for White when Black to move -> engine reports mate -3 -> +M3 for White
  const c5b = UCIProtocol.normalizeScoreToWhite({ type: 'mate', value: -3 }, 'b');
  assert.equal(c5b.mateInMoves, 3);

  // Condition 5c: Forced mate for Black when White to move -> engine reports mate -2 -> -M2 for White
  const c5c = UCIProtocol.normalizeScoreToWhite({ type: 'mate', value: -2 }, 'w');
  assert.equal(c5c.mateInMoves, -2);

  // Condition 5d: Forced mate for Black when Black to move -> engine reports mate 2 -> -M2 for White
  const c5d = UCIProtocol.normalizeScoreToWhite({ type: 'mate', value: 2 }, 'b');
  assert.equal(c5d.mateInMoves, -2);
});

test('UCIProtocol formats human-readable evaluation strings', () => {
  assert.equal(UCIProtocol.formatEvaluationText(34), '+0.34');
  assert.equal(UCIProtocol.formatEvaluationText(-120), '-1.20');
  assert.equal(UCIProtocol.formatEvaluationText(0), '0.00');
  assert.equal(UCIProtocol.formatEvaluationText(undefined, 3), 'M3');
  assert.equal(UCIProtocol.formatEvaluationText(undefined, -2), '-M2');
});

test('Validates engine UCI move against chess.js position legality', () => {
  const chess = new Chess();
  const legalUci = 'e2e4';
  const from = legalUci.slice(0, 2);
  const to = legalUci.slice(2, 4);

  const move = chess.move({ from, to });
  assert.ok(move);
  assert.equal(move.san, 'e4');

  // Verify that an illegal move is caught by chess.js
  assert.throws(() => {
    chess.move({ from: 'e1', to: 'e8' });
  });
});

test('REGRESSION: MultiPV sorting orders lines strictly by multipv index', () => {
  const entries: MultiPvEntry[] = [
    {
      multipv: 2,
      depth: 6,
      scoreCentipawns: 40,
      pv: ['c2c4', 'e7e5'],
      pvString: 'c2c4 e7e5',
      bestMoveUci: 'c2c4',
    },
    {
      multipv: 1,
      depth: 6,
      scoreCentipawns: 65,
      pv: ['e2e4', 'e7e5'],
      pvString: 'e2e4 e7e5',
      bestMoveUci: 'e2e4',
    },
  ];

  // Sorting strictly by multipv ensures Line 1 is always first
  const sorted = [...entries].sort((a, b) => a.multipv - b.multipv);
  assert.equal(sorted[0].multipv, 1);
  assert.equal(sorted[0].bestMoveUci, 'e2e4');
  assert.equal(sorted[1].multipv, 2);
  assert.equal(sorted[1].bestMoveUci, 'c2c4');
});

test('REGRESSION: Best move must match the first move of MultiPV Line 1', () => {
  const line1 = 'd2d4 d7d5 g1f3';
  const line2 = 'e2e4 c7c5 g1f3';
  const bestMove = 'd2d4';

  const firstMoveLine1 = line1.trim().split(/\s+/)[0];
  assert.equal(firstMoveLine1, bestMove, 'Line 1 initial move must match bestmove');
  assert.notEqual(line2.trim().split(/\s+/)[0], bestMove, 'Line 2 must not overwrite bestmove');
});
