import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseAuthService } from '../../src/services/supabase/authService';
import { isSupabaseReady, getSupabaseConnectionStatus } from '../../src/services/supabase/client';

test('SupabaseAuthService: unconfigured environment handling is safe and non-crashing', async () => {
  // When credentials are not configured (like in standard unit test runner)
  const isReady = isSupabaseReady();
  const status = getSupabaseConnectionStatus();

  assert.equal(typeof isReady, 'boolean');
  assert.equal(typeof status.statusText, 'string');

  if (!isReady) {
    // Sign up returns error object without throwing
    const signUpRes = await SupabaseAuthService.signUp({
      email: 'test@example.com',
      password: 'password123',
    });
    assert.equal(signUpRes.user, null);
    assert.equal(signUpRes.session, null);
    assert.ok(signUpRes.error instanceof Error);
    assert.match(signUpRes.error.message, /not configured/i);

    // Sign in returns error object without throwing
    const signInRes = await SupabaseAuthService.signIn({
      email: 'test@example.com',
      password: 'password123',
    });
    assert.equal(signInRes.user, null);
    assert.equal(signInRes.session, null);
    assert.ok(signInRes.error instanceof Error);

    // Sign out succeeds safely
    const signOutRes = await SupabaseAuthService.signOut();
    assert.equal(signOutRes.error, null);

    // Get session returns null session without throwing
    const sessionRes = await SupabaseAuthService.getSession();
    assert.equal(sessionRes.session, null);
    assert.equal(sessionRes.error, null);

    // Get user returns null without throwing
    const user = await SupabaseAuthService.getCurrentUser();
    assert.equal(user, null);

    // Reset password returns error without throwing
    const resetRes = await SupabaseAuthService.resetPassword('test@example.com');
    assert.ok(resetRes.error instanceof Error);

    // Auth state listener returns unsubscribe cleanly
    const sub = SupabaseAuthService.onAuthStateChange(() => {});
    assert.equal(typeof sub.unsubscribe, 'function');
    sub.unsubscribe();
  }
});
