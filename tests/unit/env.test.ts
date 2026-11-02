import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAppEnv } from '../../src/utils/env';
import { getSupabaseClient, isSupabaseReady, getSupabaseConnectionStatus } from '../../src/services/supabase/client';

test('loadAppEnv provides safe defaults without credentials', () => {
  const env = loadAppEnv({});

  assert.equal(env.appEnv, 'development', 'VITE_APP_ENV must default to development');
  assert.equal(env.enableAnalytics, false, 'VITE_ENABLE_ANALYTICS must default to false');
  assert.equal(env.supabase.isConfigured, false, 'Supabase must be unconfigured when credentials omitted');
  assert.equal(env.supabase.url, undefined, 'Supabase URL must be undefined when omitted');
  assert.equal(env.supabase.anonKey, undefined, 'Supabase anonKey must be undefined when omitted');
});

test('loadAppEnv handles empty or partial Supabase credentials safely', () => {
  // Empty strings
  const envEmpty = loadAppEnv({
    VITE_SUPABASE_URL: '',
    VITE_SUPABASE_ANON_KEY: '',
    VITE_APP_ENV: '',
    VITE_ENABLE_ANALYTICS: '',
  });
  assert.equal(envEmpty.appEnv, 'development');
  assert.equal(envEmpty.enableAnalytics, false);
  assert.equal(envEmpty.supabase.isConfigured, false);
  assert.equal(envEmpty.supabase.url, undefined);

  // Partial / malformed URL or short key
  const envPartial = loadAppEnv({
    VITE_SUPABASE_URL: 'invalid-url',
    VITE_SUPABASE_ANON_KEY: 'short-key',
  });
  assert.equal(envPartial.supabase.isConfigured, false);
});

test('getSupabaseClient safely returns null without throwing when unconfigured', () => {
  const client = getSupabaseClient();
  assert.equal(client, null, 'Client must be null when credentials are not configured');
  assert.equal(isSupabaseReady(), false);

  const status = getSupabaseConnectionStatus();
  assert.equal(status.isConfigured, false);
  assert.match(status.statusText, /Local preview mode/i);
});

test('loadAppEnv correctly parses valid custom environments', () => {
  const custom = loadAppEnv({
    VITE_APP_ENV: 'production',
    VITE_ENABLE_ANALYTICS: 'true',
    VITE_SUPABASE_URL: 'https://xyzcompany.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummyPayloadLongEnoughToValidate',
  });

  assert.equal(custom.appEnv, 'production');
  assert.equal(custom.enableAnalytics, true);
  assert.equal(custom.supabase.isConfigured, true);
  assert.equal(custom.supabase.url, 'https://xyzcompany.supabase.co');
});
