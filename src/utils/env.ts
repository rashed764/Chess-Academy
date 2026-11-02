/**
 * Centralized environment variable management with safe validation.
 *
 * Rules:
 * - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are purely OPTIONAL.
 * - Missing Supabase credentials NEVER prevent application startup or preview.
 * - VITE_ENABLE_ANALYTICS strictly defaults to false.
 * - VITE_APP_ENV strictly defaults to 'development'.
 * - Never returns dummy/mock credentials or pretends a connection exists.
 */

export interface AppEnvConfig {
  appUrl: string;
  appEnv: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
  enableAnalytics: boolean;
  supabase: {
    url?: string;
    anonKey?: string;
    isConfigured: boolean;
  };
  ai: {
    isServerSideGeminiAvailable: boolean;
  };
}

function resolveEnvValue(key: string, customEnv?: Record<string, string | undefined>): string {
  if (customEnv && key in customEnv) {
    return customEnv[key] ?? '';
  }
  // Vite client-side environment
  if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
    return (import.meta.env[key] as string) || '';
  }
  // Node / test environment fallback
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key] || '';
  }
  return '';
}

export function loadAppEnv(customEnv?: Record<string, string | undefined>): AppEnvConfig {
  const rawUrl = resolveEnvValue('VITE_SUPABASE_URL', customEnv).trim();
  const rawAnonKey = resolveEnvValue('VITE_SUPABASE_ANON_KEY', customEnv).trim();
  const rawAppEnv = resolveEnvValue('VITE_APP_ENV', customEnv) || resolveEnvValue('NODE_ENV', customEnv);
  const rawAnalytics = resolveEnvValue('VITE_ENABLE_ANALYTICS', customEnv);

  // VITE_APP_ENV must default to development
  const appEnv: AppEnvConfig['appEnv'] = 
    rawAppEnv === 'production' ? 'production' :
    rawAppEnv === 'test' ? 'test' : 'development';

  // VITE_ENABLE_ANALYTICS must default to false
  const enableAnalytics = rawAnalytics.toLowerCase() === 'true';

  // Supabase credentials are purely optional
  const hasValidUrl = rawUrl.length > 0 && (rawUrl.startsWith('https://') || rawUrl.startsWith('http://localhost'));
  const hasValidKey = rawAnonKey.length > 20;
  const isSupabaseConfigured = hasValidUrl && hasValidKey;

  const appUrl = resolveEnvValue('APP_URL', customEnv).trim() || 'http://localhost:3000';

  return {
    appUrl,
    appEnv,
    isDevelopment: appEnv === 'development',
    isProduction: appEnv === 'production',
    enableAnalytics,
    supabase: {
      url: isSupabaseConfigured ? rawUrl : undefined,
      anonKey: isSupabaseConfigured ? rawAnonKey : undefined,
      isConfigured: isSupabaseConfigured,
    },
    ai: {
      isServerSideGeminiAvailable: true,
    },
  };
}

export const env = loadAppEnv();
