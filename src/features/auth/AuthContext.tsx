import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { SupabaseAuthService, type SignInParams, type SignUpParams } from '../../services/supabase/authService';
import { cloudSyncService, type SyncStatus } from '../../services/supabase/syncService';
import { isSupabaseReady } from '../../services/supabase/client';
import { useAppStore } from '../../stores/useAppStore';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncError: string | null;
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  triggerSync: () => Promise<boolean>;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  authModalMode: 'signin' | 'signup';
}

const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local_only');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const isConfigured = isSupabaseReady();

  // Subscribe to sync service status changes
  useEffect(() => {
    const unsubscribeSync = cloudSyncService.subscribe((state) => {
      setSyncStatus(state.status);
      setLastSyncedAt(state.lastSyncedAt);
      setSyncError(state.errorMessage);
    });

    return () => {
      unsubscribeSync();
    };
  }, []);

  // Initialize Auth state & session restoration
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      setSyncStatus('local_only');
      return;
    }

    let isMounted = true;

    SupabaseAuthService.getSession().then(({ session: currentSession }) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);

      if (currentSession?.user) {
        // Automatically sync on initial session restore
        cloudSyncService.syncAll(currentSession.user).catch((err) => {
          console.warn('[AuthProvider] Initial session sync failed:', err);
        });
      }
    });

    const { unsubscribe } = SupabaseAuthService.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Update store profile display name if user metadata present
        const currentProfile = useAppStore.getState().currentProfile;
        const metaName = newSession.user.user_metadata?.display_name;
        if (metaName && metaName !== currentProfile.displayName) {
          useAppStore.setState({
            currentProfile: {
              ...currentProfile,
              id: newSession.user.id,
              email: newSession.user.email || currentProfile.email,
              displayName: metaName,
            },
          });
        }

        cloudSyncService.syncAll(newSession.user).catch((err) => {
          console.warn('[AuthProvider] Auth state sync failed:', err);
        });
      } else {
        // Logged out
        setSyncStatus(isSupabaseReady() ? 'idle' : 'local_only');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isConfigured]);

  const signIn = useCallback(
    async (params: SignInParams): Promise<{ success: boolean; error?: string }> => {
      const res = await SupabaseAuthService.signIn(params);
      if (res.error) {
        return { success: false, error: res.error.message };
      }
      if (res.user) {
        setUser(res.user);
        setSession(res.session);
        await cloudSyncService.syncAll(res.user);
      }
      return { success: true };
    },
    []
  );

  const signUp = useCallback(
    async (params: SignUpParams): Promise<{ success: boolean; error?: string }> => {
      const res = await SupabaseAuthService.signUp(params);
      if (res.error) {
        return { success: false, error: res.error.message };
      }
      if (res.user && res.session) {
        setUser(res.user);
        setSession(res.session);
        await cloudSyncService.syncAll(res.user);
      }
      return { success: true };
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    await SupabaseAuthService.signOut();
    setUser(null);
    setSession(null);
    setSyncStatus(isSupabaseReady() ? 'idle' : 'local_only');
  }, []);

  const triggerSync = useCallback(async (): Promise<boolean> => {
    if (!user) {
      return false;
    }
    return cloudSyncService.syncAll(user);
  }, [user]);

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const contextValue: AuthContextType = {
    user,
    session,
    isAuthenticated: Boolean(user),
    isLoading,
    isConfigured,
    syncStatus,
    lastSyncedAt,
    syncError,
    signIn,
    signUp,
    signOut,
    triggerSync,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalMode,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
