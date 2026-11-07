import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
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
  getEncryptionKey,
  encrypt,
  decrypt,
  FALLBACK_DEV_SEED,
  hasDecryptionErrorFlag,
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

test('Production encryption enforcement: missing secret fails closed', () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origSecret = process.env.CONFIG_ENCRYPTION_SECRET;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.CONFIG_ENCRYPTION_SECRET;

    // Must throw in production when CONFIG_ENCRYPTION_SECRET is missing
    assert.throws(
      () => getEncryptionKey(),
      /Production environment requires an externally supplied CONFIG_ENCRYPTION_SECRET/
    );

    // Save must fail closed
    assert.throws(
      () => saveServerConfig({ apiKey: 'test-key' }),
      /Production environment requires an externally supplied CONFIG_ENCRYPTION_SECRET/
    );
  } finally {
    process.env.NODE_ENV = origNodeEnv;
    if (origSecret !== undefined) {
      process.env.CONFIG_ENCRYPTION_SECRET = origSecret;
    } else {
      delete process.env.CONFIG_ENCRYPTION_SECRET;
    }
  }
});

test('Production encryption enforcement: default fallback seed is forbidden in production', () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origSecret = process.env.CONFIG_ENCRYPTION_SECRET;

  try {
    process.env.NODE_ENV = 'production';
    process.env.CONFIG_ENCRYPTION_SECRET = FALLBACK_DEV_SEED;

    assert.throws(
      () => getEncryptionKey(),
      /Hardcoded fallback seed is forbidden in production/
    );
  } finally {
    process.env.NODE_ENV = origNodeEnv;
    if (origSecret !== undefined) {
      process.env.CONFIG_ENCRYPTION_SECRET = origSecret;
    } else {
      delete process.env.CONFIG_ENCRYPTION_SECRET;
    }
  }
});

test('Production encryption enforcement: valid externally supplied secret succeeds in production', () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origSecret = process.env.CONFIG_ENCRYPTION_SECRET;

  try {
    process.env.NODE_ENV = 'production';
    process.env.CONFIG_ENCRYPTION_SECRET = 'strong-production-vault-secret-9988112233';

    const key = getEncryptionKey();
    assert.ok(Buffer.isBuffer(key));
    assert.equal(key.length, 32);

    const encrypted = encrypt('sensitive-gemini-credentials');
    const decrypted = decrypt(encrypted);
    assert.equal(decrypted, 'sensitive-gemini-credentials');
  } finally {
    process.env.NODE_ENV = origNodeEnv;
    if (origSecret !== undefined) {
      process.env.CONFIG_ENCRYPTION_SECRET = origSecret;
    } else {
      delete process.env.CONFIG_ENCRYPTION_SECRET;
    }
  }
});

test('AES-256-GCM authentication failure on tampered tag or content', () => {
  const payload = 'secret-data-payload';
  const encrypted = encrypt(payload);

  // Tamper with the content
  const tamperedContent = {
    ...encrypted,
    content: encrypted.content.slice(0, -2) + (encrypted.content.endsWith('aa') ? 'bb' : 'aa'),
  };

  assert.throws(
    () => decrypt(tamperedContent),
    /Unsupported state or unable to authenticate data/
  );

  // Tamper with auth tag
  const tamperedTag = {
    ...encrypted,
    tag: '00000000000000000000000000000000',
  };

  assert.throws(
    () => decrypt(tamperedTag),
    /Unsupported state or unable to authenticate data/
  );
});

test('Safeguard against overwriting: undecryptable existing config prevents silent overwriting', () => {
  resetConfigForTest();

  const configPath = path.resolve(process.cwd(), 'data', 'provider_config.enc');
  // Write a corrupted/undecryptable file
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ iv: '1234', tag: '5678', content: '9abc' }), 'utf8');

  // Attempting to load fails safe and flags decryption error
  const loaded = loadServerConfig();
  assert.deepEqual(loaded, {});
  assert.equal(hasDecryptionErrorFlag(), true);

  // Attempting to save config now must refuse to overwrite the on-disk file
  assert.throws(
    () => saveServerConfig({ apiKey: 'new-key' }),
    /Refusing to overwrite existing encrypted configuration/
  );

  resetConfigForTest();
});

test('Development behavior: allows fallback seed when secret is omitted', () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origSecret = process.env.CONFIG_ENCRYPTION_SECRET;

  try {
    process.env.NODE_ENV = 'development';
    delete process.env.CONFIG_ENCRYPTION_SECRET;

    const key = getEncryptionKey();
    assert.ok(Buffer.isBuffer(key));
    assert.equal(key.length, 32);

    const encrypted = encrypt('dev-test');
    assert.equal(decrypt(encrypted), 'dev-test');
  } finally {
    process.env.NODE_ENV = origNodeEnv;
    if (origSecret !== undefined) {
      process.env.CONFIG_ENCRYPTION_SECRET = origSecret;
    } else {
      delete process.env.CONFIG_ENCRYPTION_SECRET;
    }
  }
});
