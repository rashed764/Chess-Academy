/**
 * Supabase client initialization with strict boundary checks.
 *
 * Guarantees:
 * 1. Missing credentials NEVER throw or crash the app.
 * 2. Returns null when credentials are omitted (e.g. during preview/development).
 * 3. Never connects with mock or simulated credentials.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../utils/env';
import type { DatabaseSchema } from './types';

let supabaseClientInstance: SupabaseClient<DatabaseSchema> | null = null;

/**
 * Returns an initialized Supabase client if valid credentials are provided in the environment.
 * Returns null if Supabase has not yet been provisioned or credentials are omitted.
 */
export function getSupabaseClient(): SupabaseClient<DatabaseSchema> | null {
  if (!env.supabase.isConfigured || !env.supabase.url || !env.supabase.anonKey) {
    return null;
  }

  if (!supabaseClientInstance) {
    try {
      supabaseClientInstance = createClient<DatabaseSchema>(
        env.supabase.url,
        env.supabase.anonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        }
      );
    } catch {
      // In case of unexpected initialization issue, safeguard the app
      supabaseClientInstance = null;
    }
  }

  return supabaseClientInstance;
}

export function isSupabaseReady(): boolean {
  return env.supabase.isConfigured && Boolean(getSupabaseClient());
}

export function getSupabaseConnectionStatus(): {
  isConfigured: boolean;
  statusText: string;
} {
  if (isSupabaseReady()) {
    return {
      isConfigured: true,
      statusText: 'Connected to Supabase project',
    };
  }
  return {
    isConfigured: false,
    statusText: 'Cloud persistence unconfigured (Local preview mode)',
  };
}
