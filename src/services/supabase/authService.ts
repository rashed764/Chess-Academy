/**
 * Supabase Authentication Service
 *
 * Provides typed auth methods with strict boundary handling:
 * - Registration with email/password
 * - Sign in with password
 * - Sign out
 * - Session restoration & state listeners
 * - Safe null/fallback behavior when Supabase is not configured (offline/local mode)
 */

import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseReady } from './client';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

export interface SignUpParams {
  email: string;
  password: string;
  username?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export class SupabaseAuthService {
  /**
   * Register a new user account with Supabase.
   */
  static async signUp({ email, password, username }: SignUpParams): Promise<AuthResponse> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        user: null,
        session: null,
        error: new Error('Cloud persistence is not configured. Running in offline/local mode.'),
      };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: username || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { user: null, session: null, error: new Error(error.message) };
      }

      // If user was created, initialize user profile in public.profiles if session exists
      if (data.user && data.session) {
        try {
          await client.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email || email,
            username: username || email.split('@')[0],
            display_name: username || email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any);
        } catch (profileErr) {
          console.warn('[SupabaseAuth] Could not initialize initial profile record:', profileErr);
        }
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: err instanceof Error ? err : new Error('An unexpected error occurred during sign up.'),
      };
    }
  }

  /**
   * Sign in existing user with email and password.
   */
  static async signIn({ email, password }: SignInParams): Promise<AuthResponse> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        user: null,
        session: null,
        error: new Error('Cloud persistence is not configured. Running in offline/local mode.'),
      };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error: new Error(error.message) };
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: err instanceof Error ? err : new Error('An unexpected error occurred during sign in.'),
      };
    }
  }

  /**
   * Sign out current user.
   */
  static async signOut(): Promise<{ error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { error: null };
    }

    try {
      const { error } = await client.auth.signOut();
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Failed to sign out.'),
      };
    }
  }

  /**
   * Get current active session.
   */
  static async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { session: null, error: null };
    }

    try {
      const { data, error } = await client.auth.getSession();
      if (error) {
        return { session: null, error: new Error(error.message) };
      }
      return { session: data.session, error: null };
    } catch (err) {
      return {
        session: null,
        error: err instanceof Error ? err : new Error('Failed to get session.'),
      };
    }
  }

  /**
   * Get current authenticated user.
   */
  static async getCurrentUser(): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client) {
      return null;
    }

    try {
      const { data } = await client.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  }

  /**
   * Listen for authentication state changes (sign in, sign out, token refresh).
   */
  static onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): { unsubscribe: () => void } {
    const client = getSupabaseClient();
    if (!client) {
      return { unsubscribe: () => {} };
    }

    const { data } = client.auth.onAuthStateChange(callback);
    return {
      unsubscribe: () => {
        data.subscription.unsubscribe();
      },
    };
  }

  /**
   * Send password reset email.
   */
  static async resetPassword(email: string): Promise<{ error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { error: new Error('Cloud persistence is not configured.') };
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Failed to send password reset email.'),
      };
    }
  }
}
