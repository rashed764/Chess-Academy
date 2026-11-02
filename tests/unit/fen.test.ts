import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFenStructure, parseFen, STARTING_FEN } from '../../src/services/chess/fen';

test('validates standard starting position FEN', () => {
  const result = validateFenStructure(STARTING_FEN);
  assert.equal(result.isValid, true);
  assert.equal(result.error, undefined);

  const parsed = parseFen(STARTING_FEN);
  assert.ok(parsed !== null);
  assert.equal(parsed?.activeColor, 'w');
  assert.equal(parsed?.castlingAvailability, 'KQkq');
  assert.equal(parsed?.enPassantTarget, '-');
  assert.equal(parsed?.halfmoveClock, 0);
  assert.equal(parsed?.fullmoveNumber, 1);
});

test('rejects malformed FEN with invalid rank count', () => {
  const invalidFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP w KQkq - 0 1'; // Only 7 ranks
  const result = validateFenStructure(invalidFen);
  assert.equal(result.isValid, false);
  assert.ok(result.error?.includes('expected 8 ranks'));
});

test('rejects malformed FEN with invalid active color', () => {
  const invalidFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1';
  const result = validateFenStructure(invalidFen);
  assert.equal(result.isValid, false);
  assert.ok(result.error?.includes("expected 'w' or 'b'"));
});

test('rejects malformed FEN with invalid field count', () => {
  const invalidFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w';
  const result = validateFenStructure(invalidFen);
  assert.equal(result.isValid, false);
});
