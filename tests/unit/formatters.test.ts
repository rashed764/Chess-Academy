import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRating,
  formatTimeSeconds,
  truncateText,
} from '../../src/utils/formatters';

test('formatRating handles ratings and unrated edge cases', () => {
  assert.equal(formatRating(1542.4), '1542');
  assert.equal(formatRating(2100), '2100');
  assert.equal(formatRating(null), 'Unrated');
  assert.equal(formatRating(undefined), 'Unrated');
  assert.equal(formatRating(NaN), 'Unrated');
});

test('formatTimeSeconds formats digital clock countdowns', () => {
  assert.equal(formatTimeSeconds(600), '10:00');
  assert.equal(formatTimeSeconds(185), '03:05');
  assert.equal(formatTimeSeconds(0), '00:00');
  assert.equal(formatTimeSeconds(-10), '00:00');
});

test('truncateText handles short and long strings', () => {
  assert.equal(truncateText('Short text', 20), 'Short text');
  assert.equal(truncateText('A very long description for a tactical motif', 12), 'A very long ...');
});
