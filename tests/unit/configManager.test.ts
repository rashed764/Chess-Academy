import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadServerConfig,
  saveServerConfig,
  setApiKey,
  removeApiKey,
  getRawApiKey,
  getMaskedApiKey,
  getActiveModelId,
  setActiveModelId,
  getConfigStatus,
  resetConfigForTest,
} from '../../src/server/configManager';
import { getActiveModel, isGeminiConfigured } from '../../src/server/geminiClient';

test('configManager handles encrypted storage and key masking correctly', () => {
  resetConfigForTest();

  // Initially unconfigured or fallback
  const initialStatus = getConfigStatus();
  assert.equal(initialStatus.isCustomKey, false);
  assert.equal(initialStatus.activeModelId, 'gemini-3.8-flash');

  // Save a custom key
  const testKey = 'AIzaSyTestApiKey1234567890';
  setApiKey(testKey);

  // Verify raw key retrieval
  assert.equal(getRawApiKey(), testKey);
  assert.equal(isGeminiConfigured(), true);

  // Verify key masking (shows last 4 characters)
  const masked = getMaskedApiKey();
  assert.equal(masked.endsWith('7890'), true);
  assert.equal(masked.includes('••••'), true);

  // Verify config status
  const updatedStatus = getConfigStatus();
  assert.equal(updatedStatus.configured, true);
  assert.equal(updatedStatus.isCustomKey, true);
  assert.equal(updatedStatus.maskedKey, masked);

  // Remove key
  removeApiKey();
  const postRemoveStatus = getConfigStatus();
  assert.equal(postRemoveStatus.isCustomKey, false);

  resetConfigForTest();
});

test('configManager persists and updates active model ID', () => {
  resetConfigForTest();

  assert.equal(getActiveModelId(), 'gemini-3.8-flash');
  assert.equal(getActiveModel(), 'gemini-3.8-flash');

  // Set new active model
  setActiveModelId('gemini-4-argon');
  assert.equal(getActiveModelId(), 'gemini-4-argon');
  assert.equal(getActiveModel(), 'gemini-4-argon');

  const status = getConfigStatus();
  assert.equal(status.activeModelId, 'gemini-4-argon');

  resetConfigForTest();
});

test('configManager rejects invalid empty inputs', () => {
  assert.throws(() => setApiKey('   '), /cannot be empty/);
  assert.throws(() => setActiveModelId(''), /cannot be empty/);
});
