import React, { useState } from 'react';
import {
  Calendar,
  ArrowLeft,
  Trophy,
  Crown,
  Cloud,
  CloudOff,
  RefreshCw,
  LogIn,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { formatRelativeDate } from '../../utils/formatters';
import { playChessClick } from '../../utils/sound';
import { useAuth } from '../auth/AuthContext';
import { SyncStatusBadge } from '../auth/components/SyncStatusBadge';

export const ProfilePage: React.FC = () => {
  const { currentProfile } = useAppStore();
  const {
    user,
    isAuthenticated,
    signOut,
    openAuthModal,
    syncStatus,
    lastSyncedAt,
    triggerSync,
    isConfigured,
  } = useAuth();

  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSyncNow = async () => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }
    setIsManualSyncing(true);
    setSyncFeedback(null);
    try {
      const ok = await triggerSync();
      if (ok) {
        setSyncFeedback('Academy data synchronized with cloud successfully.');
      } else {
        setSyncFeedback('Synchronization was unable to complete. Check network.');
      }
    } finally {
      setIsManualSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleSignOut = async () => {
    playChessClick(currentProfile.settings.soundEnabled);
    await signOut();
  };

  const displayName = isAuthenticated
    ? user?.user_metadata?.display_name || user?.email?.split('@')[0] || currentProfile.displayName
    : currentProfile.displayName;

  const emailDisplay = isAuthenticated ? user?.email || currentProfile.email : currentProfile.email;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#242938] pb-6">
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            onClick={() => playChessClick(currentProfile.settings.soundEnabled)}
            className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h2 className="text-2xl font-bold text-[#F4F4F5] font-cinzel">
              Member Credentials
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Academy candidate profile, cloud synchronization, and title trajectory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SyncStatusBadge />
          <span className="text-xs text-[#D6B36A] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-[#D6B36A]/30 bg-[#D6B36A]/10 font-sans">
            {currentProfile.skillLevelTier}
          </span>
        </div>
      </div>

      {/* Member Card */}
      <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#1D2230] border-2 border-[#D6B36A] flex items-center justify-center text-2xl font-bold text-[#D6B36A] font-cinzel shadow-xl shadow-black/40 shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl font-bold text-[#F4F4F5] font-cinzel">
                {displayName}
              </h3>
              <span className="text-[11px] font-mono text-[#D6B36A] bg-[#10121B] px-2.5 py-0.5 rounded border border-[#242938]">
                {isAuthenticated ? `UID: ${user?.id.slice(0, 8)}...` : 'ID: GUEST-LOCAL-01'}
              </span>
            </div>

            <p className="text-xs text-[#9297A5] font-mono">{emailDisplay}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#9297A5] pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D6B36A]" />
                Enrolled {formatRelativeDate(currentProfile.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#D6B36A]" />
                Mastery Score: {currentProfile.ratings.masteryScore}/100
              </span>
              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#D6B36A]" />
                Aiming for: National Master (NM)
              </span>
            </div>
          </div>
        </div>

        {/* Rating Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#242938]">
          <div className="p-3.5 rounded-lg bg-[#10121B]/60 border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Rapid</span>
            <span className="text-xl font-bold text-[#F4F4F5] font-mono">{currentProfile.ratings.rapid}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#10121B]/60 border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Blitz</span>
            <span className="text-xl font-bold text-[#F4F4F5] font-mono">{currentProfile.ratings.blitz}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#10121B]/60 border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Tactics</span>
            <span className="text-xl font-bold text-[#D6B36A] font-mono">{currentProfile.ratings.tactics}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#10121B]/60 border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Endgame</span>
            <span className="text-xl font-bold text-[#D6B36A] font-mono">{currentProfile.ratings.endgame}</span>
          </div>
        </div>
      </div>

      {/* Cloud Synchronization & Account Management */}
      <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#242938]">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-[#D6B36A]" />
            <div>
              <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
                Cloud Synchronization & Cross-Device Persistence
              </h3>
              <p className="text-[11px] text-[#9297A5]">
                Seamlessly backup and synchronize your Academy curriculum progress, exercise attempts, and Test Arena evaluations.
              </p>
            </div>
          </div>
        </div>

        {syncFeedback && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Status Card */}
          <div className="p-4 rounded-xl bg-[#10121B]/60 border border-[#242938] space-y-3">
            <span className="text-xs font-semibold text-[#F4F4F5] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D6B36A]" />
              Authentication Status
            </span>

            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Authenticated Member ({user?.email})</span>
                </div>
                <p className="text-[11px] text-[#9297A5]">
                  Cross-device sync active. Changes are automatically synchronized with Supabase database.
                </p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Guest Mode (Local Persistence Only)</span>
                </div>
                <p className="text-[11px] text-[#9297A5]">
                  {isConfigured
                    ? 'Sign in or register an account to sync your curriculum progress and test reports to the cloud.'
                    : 'Running in local offline mode. Progress is preserved in your browser localStorage.'}
                </p>
                {isConfigured && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openAuthModal('signin')}
                      className="px-3 py-1.5 rounded-lg bg-[#D6B36A] hover:bg-[#c4a159] text-zinc-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('signup')}
                      className="px-3 py-1.5 rounded-lg bg-[#171A24] hover:bg-[#1f2433] border border-[#242938] text-[#F4F4F5] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sync Trigger Card */}
          <div className="p-4 rounded-xl bg-[#10121B]/60 border border-[#242938] space-y-3">
            <span className="text-xs font-semibold text-[#F4F4F5] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#D6B36A]" />
                Cloud State
              </span>
              <SyncStatusBadge />
            </span>

            <div className="space-y-2 text-xs text-[#9297A5]">
              <p className="text-[11px]">
                {lastSyncedAt
                  ? `Last verified sync: ${formatRelativeDate(lastSyncedAt)}`
                  : 'No cloud sync recorded for this session.'}
              </p>
              <div className="text-[11px] font-mono text-zinc-400 bg-[#171A24] p-2 rounded border border-[#242938] space-y-0.5">
                <div>Backend: {isConfigured ? 'Supabase Postgres (RLS Enforced)' : 'Unconfigured (Local)'}</div>
                <div>Isolation: Row Level Security (auth.uid = user_id)</div>
              </div>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isManualSyncing}
                  className="px-3 py-1.5 rounded-lg bg-[#171A24] hover:bg-[#202534] border border-[#242938] hover:border-[#D6B36A]/50 text-xs text-[#F4F4F5] font-semibold transition-colors flex items-center gap-2 cursor-pointer mt-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin text-[#D6B36A]' : ''}`} />
                  {isManualSyncing ? 'Synchronizing Data...' : 'Sync Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
