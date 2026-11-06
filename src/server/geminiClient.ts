import { GoogleGenAI } from '@google/genai';
import {
  getRawApiKey,
  getActiveModelId,
} from './configManager';

let cachedClientInstance: GoogleGenAI | null = null;
let lastUsedApiKey: string | null = null;

export interface DiscoveredModelInfo {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  supportedActions?: string[];
}

// Known default models fallback list if API discovery returns empty or during offline fallback
const FALLBACK_MODELS: DiscoveredModelInfo[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'models/gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash (Recommended)',
    description: 'Fast, highly capable model ideal for real-time chess coaching and hints.',
  },
  {
    id: 'gemini-4-argon',
    name: 'models/gemini-4-argon',
    displayName: 'Gemini 4 Argon (High Reasoning)',
    description: 'Advanced reasoning model for deep strategic breakdowns.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'models/gemini-3.1-flash-lite',
    displayName: 'Gemini 3.1 Flash Lite',
    description: 'Lightweight low-latency text model.',
  },
  {
    id: 'gemini-nano-banana-2.1',
    name: 'models/gemini-nano-banana-2.1',
    displayName: 'Gemini Nano Banana 2.1',
    description: 'Ultra-fast specialized generation model.',
  },
];

/**
 * Returns a configured GoogleGenAI instance or null if API key is not set.
 * Dynamically re-initializes if key changes. Enforces server-side use only.
 */
export function getGeminiClient(overrideApiKey?: string): GoogleGenAI | null {
  const apiKey = overrideApiKey || getRawApiKey();
  if (!apiKey || apiKey.trim() === '') {
    cachedClientInstance = null;
    lastUsedApiKey = null;
    return null;
  }

  // Re-instantiate if client was null or key has changed
  if (!cachedClientInstance || lastUsedApiKey !== apiKey) {
    cachedClientInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    lastUsedApiKey = apiKey;
  }

  return cachedClientInstance;
}

/**
 * Returns whether a Gemini API key is currently configured.
 */
export function isGeminiConfigured(): boolean {
  const key = getRawApiKey();
  return Boolean(key && key.trim() !== '');
}

/**
 * Returns active model ID configured by user (defaulting to gemini-3.8-flash).
 */
export function getActiveModel(): string {
  return getActiveModelId();
}

/**
 * Legacy export for backwards compatibility with tests and static references.
 */
export const COACH_MODEL = 'gemini-3.8-flash';

/**
 * Fetches available text generation models from Gemini API using ai.models.list().
 * Handles SDK Pager pagination and filters for models supporting generateContent.
 */
export async function listAvailableModels(overrideApiKey?: string): Promise<DiscoveredModelInfo[]> {
  const client = getGeminiClient(overrideApiKey);
  if (!client) {
    return FALLBACK_MODELS;
  }

  try {
    const modelsResponse = await client.models.list();
    const discovered: DiscoveredModelInfo[] = [];
    const items: Record<string, unknown>[] = [];

    // Support async iteration (SDK Pager), standard arrays, or paged objects
    if (modelsResponse && typeof modelsResponse === 'object' && Symbol.asyncIterator in modelsResponse) {
      for await (const pageItem of modelsResponse as unknown as AsyncIterable<Record<string, unknown>>) {
        items.push(pageItem);
      }
    } else if (Array.isArray(modelsResponse)) {
      items.push(...(modelsResponse as Record<string, unknown>[]));
    } else if (modelsResponse && Array.isArray((modelsResponse as unknown as { models?: unknown[] }).models)) {
      items.push(...((modelsResponse as unknown as { models: Record<string, unknown>[] }).models));
    }

    for (const item of items) {
      const name = String(item.name || item.id || '');
      const cleanId = name.replace(/^models\//, '');
      const displayName = String(item.displayName || cleanId);

      // Check for text generation capabilities
      const methods = Array.isArray(item.supportedGenerationMethods)
        ? (item.supportedGenerationMethods as string[])
        : Array.isArray(item.supportedActions)
        ? (item.supportedActions as string[])
        : ['generateContent'];

      const supportsText = methods.some((m) =>
        m.toLowerCase().includes('generatecontent')
      );

      // Skip non-text or prohibited models
      if (!supportsText) continue;
      if (cleanId.includes('embedding') || cleanId.includes('imagen') || cleanId.includes('veo')) continue;

      discovered.push({
        id: cleanId,
        name: name,
        displayName: `${displayName} (${cleanId})`,
        description: typeof item.description === 'string' ? item.description : undefined,
        supportedActions: methods,
      });
    }

    if (discovered.length === 0) {
      return FALLBACK_MODELS;
    }

    return discovered;
  } catch (err) {
    console.warn('Failed to list Gemini models dynamically, using fallback list:', err);
    return FALLBACK_MODELS;
  }
}
