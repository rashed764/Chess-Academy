import test from 'node:test';
import assert from 'node:assert/strict';
import { playChessClick, playChime } from '../../src/utils/sound';

test('playChessClick executes safely without throwing in headless environments', () => {
  assert.doesNotThrow(() => {
    playChessClick(false);
    playChessClick(true, 0.5);
  });
});

test('playChime executes safely without throwing in headless environments', () => {
  assert.doesNotThrow(() => {
    playChime(false);
    playChime(true, 0.5);
  });
});
