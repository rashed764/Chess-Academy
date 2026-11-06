import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface ServerAIConfig {
  apiKey?: string;
  activeModelId?: string;
  updatedAt?: string;
}

export interface ConfigStatusResponse {
  configured: boolean;
  maskedKey: string;
  activeModelId: string;
  isCustomKey: boolean;
  updatedAt?: string;
}

const CONFIG_DIR = path.resolve(process.cwd(), 'data');
const CONFIG_FILE_PATH = path.join(CONFIG_DIR, 'provider_config.enc');
const DEFAULT_MODEL = 'gemini-3.8-flash';

// Derive a 32-byte key for AES-256-GCM using scrypt
const SECRET_SEED = process.env.CONFIG_ENCRYPTION_SECRET || 'chess-academy-gemini-provider-secret-v1';
const SALT = 'chess-academy-salt-2026';
const ENCRYPTION_KEY = crypto.scryptSync(SECRET_SEED, SALT, 32);

let memoryConfigCache: ServerAIConfig | null = null;

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
  }
}

function encrypt(text: string): { iv: string; tag: string; content: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return {
    iv: iv.toString('hex'),
    tag,
    content: encrypted,
  };
}

function decrypt(encryptedData: { iv: string; tag: string; content: string }): string {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ENCRYPTION_KEY,
    Buffer.from(encryptedData.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
  let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Reads and decrypts stored server configuration from disk, updating cache.
 * Safely handles missing, corrupted, or invalid encryption key payloads.
 */
export function loadServerConfig(): ServerAIConfig {
  if (memoryConfigCache) {
    return memoryConfigCache;
  }

  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      memoryConfigCache = {};
      return memoryConfigCache;
    }

    const fileContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    const encryptedData = JSON.parse(fileContent);
    const decryptedText = decrypt(encryptedData);
    const parsed: ServerAIConfig = JSON.parse(decryptedText);
    memoryConfigCache = parsed;
    return parsed;
  } catch (err) {
    console.error('[ConfigManager] Failed to read or decrypt server config (corrupted or invalid key), falling back safely:', err);
    memoryConfigCache = {};
    return memoryConfigCache;
  }
}

/**
 * Encrypts and persists configuration to disk atomically with restrictive mode permissions (0o600).
 */
export function saveServerConfig(config: ServerAIConfig): void {
  try {
    ensureDirectoryExists(CONFIG_DIR);
    const payload = JSON.stringify(config);
    const encrypted = encrypt(payload);
    
    // Atomic file write using temporary file and atomic rename
    const tempFilePath = path.join(CONFIG_DIR, `.provider_config_${Date.now()}.tmp`);
    fs.writeFileSync(tempFilePath, JSON.stringify(encrypted, null, 2), { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(tempFilePath, CONFIG_FILE_PATH);
    
    // Enforce permissions on final file
    try {
      fs.chmodSync(CONFIG_FILE_PATH, 0o600);
    } catch {
      // Ignore chmod on platform/filesystems that do not support POSIX permissions
    }
    
    memoryConfigCache = { ...config };
  } catch (err) {
    console.error('Failed to save encrypted server config:', err);
    throw new Error('Failed to persist configuration securely');
  }
}

/**
 * Returns active API key (from encrypted storage or process.env.GEMINI_API_KEY).
 */
export function getRawApiKey(): string {
  const config = loadServerConfig();
  if (config.apiKey && config.apiKey.trim() !== '') {
    return config.apiKey.trim();
  }
  return process.env.GEMINI_API_KEY?.trim() || '';
}

/**
 * Returns masked version of the key for UI status display. Never exposes raw key.
 */
export function getMaskedApiKey(): string {
  const rawKey = getRawApiKey();
  if (!rawKey) return '';
  if (rawKey.length <= 8) return '••••••••';
  const lastFour = rawKey.slice(-4);
  return `••••••••••••${lastFour}`;
}

/**
 * Returns the currently active model ID.
 */
export function getActiveModelId(): string {
  const config = loadServerConfig();
  return config.activeModelId || DEFAULT_MODEL;
}

/**
 * Saves a new API key to encrypted storage.
 */
export function setApiKey(apiKey: string): void {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('API Key cannot be empty');
  }
  const current = loadServerConfig();
  saveServerConfig({
    ...current,
    apiKey: cleanKey,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Removes custom API key from encrypted storage.
 */
export function removeApiKey(): void {
  const current = loadServerConfig();
  const updated: ServerAIConfig = { ...current, updatedAt: new Date().toISOString() };
  delete updated.apiKey;
  saveServerConfig(updated);
}

/**
 * Persists selected active model ID.
 */
export function setActiveModelId(modelId: string): void {
  const cleanModel = modelId.trim();
  if (!cleanModel) {
    throw new Error('Model ID cannot be empty');
  }
  const current = loadServerConfig();
  saveServerConfig({
    ...current,
    activeModelId: cleanModel,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Returns status overview object.
 */
export function getConfigStatus(): ConfigStatusResponse {
  const config = loadServerConfig();
  const rawKey = getRawApiKey();
  const isCustomKey = Boolean(config.apiKey && config.apiKey.trim() !== '');
  return {
    configured: Boolean(rawKey && rawKey.trim() !== ''),
    maskedKey: getMaskedApiKey(),
    activeModelId: getActiveModelId(),
    isCustomKey,
    updatedAt: config.updatedAt,
  };
}

/**
 * For testing purposes: resets memory cache and deletes test file.
 */
export function resetConfigForTest(): void {
  memoryConfigCache = null;
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    try {
      fs.unlinkSync(CONFIG_FILE_PATH);
    } catch {
      // Ignore cleanup error
    }
  }
}
