import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateFen,
  validateHintStage,
  validateText,
  validateMoveInPosition,
} from '../../src/server/validators';
import {
  classifyMoveQuality,
  generateLocalFallbackHint,
} from '../../src/server/coachService';
import { createRateLimiter } from '../../src/server/rateLimiter';

test('validateFen correctly validates standard chess FENs and rejects malformed strings', () => {
  // Valid starting FEN
  const validStart = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  assert.equal(validStart.valid, true);
  assert.equal(typeof validStart.data, 'string');

  // Valid middle game FEN
  const validMid = validateFen('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4');
  assert.equal(validMid.valid, true);

  // Invalid: missing fields
  const invalid1 = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
  assert.equal(invalid1.valid, false);
  assert.match(invalid1.error || '', /Invalid FEN/);

  // Invalid: gibberish
  const invalid2 = validateFen('not-a-fen');
  assert.equal(invalid2.valid, false);

  // Invalid: empty or non-string
  assert.equal(validateFen('').valid, false);
  assert.equal(validateFen(null).valid, false);
  assert.equal(validateFen(12345).valid, false);
});

test('validateHintStage validates only stages 1, 2, and 3', () => {
  assert.equal(validateHintStage(1).valid, true);
  assert.equal(validateHintStage('1').valid, true);
  assert.equal(validateHintStage(2).valid, true);
  assert.equal(validateHintStage('2').valid, true);
  assert.equal(validateHintStage(3).valid, true);
  assert.equal(validateHintStage('3').valid, true);

  assert.equal(validateHintStage(0).valid, false);
  assert.equal(validateHintStage(4).valid, false);
  assert.equal(validateHintStage('stage1').valid, false);
  assert.equal(validateHintStage(null).valid, false);
});

test('validateText bounds string length and handles invalid types', () => {
  assert.equal(validateText('Tactics', 'field', 10).valid, true);
  assert.equal(validateText('This is way too long text', 'field', 10).valid, false);
  assert.equal(validateText(123, 'field').valid, false);
});

test('validateMoveInPosition validates legal SAN and UCI moves against position', () => {
  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  // Legal SAN
  const e4San = validateMoveInPosition(startFen, 'e4');
  assert.equal(e4San.valid, true);
  assert.equal(e4San.data?.san, 'e4');
  assert.equal(e4San.data?.uci, 'e2e4');

  // Legal UCI
  const nf3Uci = validateMoveInPosition(startFen, 'g1f3');
  assert.equal(nf3Uci.valid, true);
  assert.equal(nf3Uci.data?.san, 'Nf3');

  // Illegal move (pawn can't jump to e5 on turn 1)
  const illegal = validateMoveInPosition(startFen, 'e5');
  assert.equal(illegal.valid, false);
  assert.match(illegal.error || '', /is not legal/);

  // Wrong turn move (Black moving on White's turn)
  const wrongTurn = validateMoveInPosition(startFen, 'e7e5');
  assert.equal(wrongTurn.valid, false);
});

test('classifyMoveQuality correctly maps centipawn diffs to chess classifications', () => {
  // Best move flag
  assert.equal(classifyMoveQuality(100, 100, 'w', true).quality, 'best');
  assert.equal(classifyMoveQuality(100, 100, 'w', true, true).quality, 'brilliant');

  // White mover: scoreBefore = +150, scoreAfter = +145 (diff = 5 cp -> best)
  assert.equal(classifyMoveQuality(150, 145, 'w', false).quality, 'best');

  // White mover: scoreBefore = +150, scoreAfter = +125 (diff = 25 cp -> good)
  assert.equal(classifyMoveQuality(150, 125, 'w', false).quality, 'good');

  // White mover: scoreBefore = +150, scoreAfter = +80 (diff = 70 cp -> inaccuracy)
  assert.equal(classifyMoveQuality(150, 80, 'w', false).quality, 'inaccuracy');

  // White mover: scoreBefore = +150, scoreAfter = 0 (diff = 150 cp -> mistake)
  assert.equal(classifyMoveQuality(150, 0, 'w', false).quality, 'mistake');

  // White mover: scoreBefore = +150, scoreAfter = -100 (diff = 250 cp -> blunder)
  assert.equal(classifyMoveQuality(150, -100, 'w', false).quality, 'blunder');

  // Black mover perspective:
  // Before: +50 (White +0.5, Black -0.5)
  // After: +200 (White +2.0, Black -2.0) -> Black lost 150 centipawns -> mistake
  assert.equal(classifyMoveQuality(50, 200, 'b', false).quality, 'mistake');

  // Incomplete evaluations -> unclassified (never fabricates numbers)
  assert.equal(classifyMoveQuality(undefined, 100, 'w').quality, 'unclassified');
  assert.equal(classifyMoveQuality(100, undefined, 'w').quality, 'unclassified');
});

test('generateLocalFallbackHint provides progressive pedagogical stages without spoiling', () => {
  const h1 = generateLocalFallbackHint(1, 'Find checkmate in 2', 'Re8#', 'fork');
  assert.equal(h1.stage, 1);
  assert.equal(h1.source, 'local_fallback');
  assert.match(h1.hint, /Look closely/);
  // Stage 1 does not leak the exact checkmate move
  assert.equal(h1.hint.includes('Re8#'), false);

  const h2 = generateLocalFallbackHint(2, 'Find checkmate in 2', 'Re8#', 'fork');
  assert.equal(h2.stage, 2);
  assert.match(h2.hint, /tactical motif/i);
  assert.equal(h2.hint.includes('Re8#'), false);

  const h3 = generateLocalFallbackHint(3, 'Find checkmate in 2', 'Re8#', 'back_rank');
  assert.equal(h3.stage, 3);
  assert.match(h3.hint, /forcing candidate moves/i);
});

test('Rate limiter permits requests within capacity and blocks on exhaustion', () => {
  const limiter = createRateLimiter(2, 0.0001); // 2 tokens max, very slow refill

  let allowedCount = 0;
  let rejectedCount = 0;

  const req = { ip: '127.0.0.1', socket: {} } as any;
  const res = {
    status: (code: number) => ({
      json: () => {
        if (code === 429) rejectedCount++;
      },
    }),
  } as any;
  const next = () => {
    allowedCount++;
  };

  limiter(req, res, next); // 1st call: OK
  limiter(req, res, next); // 2nd call: OK
  limiter(req, res, next); // 3rd call: 429 Too Many Requests

  assert.equal(allowedCount, 2);
  assert.equal(rejectedCount, 1);
});
