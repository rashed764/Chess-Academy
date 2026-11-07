import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Eye, EyeOff, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { playChessClick } from '../../../utils/sound';
import { useAppStore } from '../../../stores/useAppStore';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, signIn, signUp, isConfigured } = useAuth();
  const { currentProfile } = useAppStore();
  const soundEnabled = currentProfile.settings.soundEnabled;

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync mode with context when modal opens
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    playChessClick(soundEnabled);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signIn({ email: email.trim(), password });
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to sign in. Please verify your credentials.');
        } else {
          closeAuthModal();
        }
      } else {
        const res = await signUp({
          email: email.trim(),
          password,
          username: username.trim() || undefined,
        });
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to create account. Please try again.');
        } else {
          closeAuthModal();
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    playChessClick(soundEnabled, 0.4);
    closeAuthModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md bg-[#10121B] border border-[#242938] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#242938] bg-[#171A24]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#D6B36A]/10 border border-[#D6B36A]/30 flex items-center justify-center text-[#D6B36A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold text-[#F4F4F5] font-cinzel">
                {mode === 'signin' ? 'Sign In to Academy' : 'Join Chess Academy'}
              </h2>
              <p className="text-[11px] text-[#9297A5]">
                {mode === 'signin'
                  ? 'Access your cloud-synced training, tests, and insights.'
                  : 'Synchronize your chess trajectory across any device.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close authentication modal"
            className="p-1.5 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#242938] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unconfigured Alert Banner */}
        {!isConfigured && (
          <div className="p-4 mx-5 mt-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-200">Local Preview Mode</p>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                Supabase credentials are not configured in this environment. Your training progress, arena assessments, and settings are securely stored locally on this browser.
              </p>
            </div>
          </div>
        )}

        {/* Mode Toggle Tabs */}
        <div className="flex border-b border-[#242938] px-5 pt-3">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 pb-3 text-xs font-semibold tracking-wider transition-colors border-b-2 ${
              mode === 'signin'
                ? 'border-[#D6B36A] text-[#D6B36A]'
                : 'border-transparent text-[#9297A5] hover:text-[#F4F4F5]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 pb-3 text-xs font-semibold tracking-wider transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-[#D6B36A] text-[#D6B36A]'
                : 'border-transparent text-[#9297A5] hover:text-[#F4F4F5]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label htmlFor="auth-username" className="text-xs font-semibold text-[#F4F4F5] flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#D6B36A]" />
                Display Name / Candidate Handle
              </label>
              <input
                id="auth-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Candidate Grandmaster"
                className="w-full bg-[#171A24] border border-[#242938] focus:border-[#D6B36A] rounded-lg px-3 py-2 text-xs text-[#F4F4F5] placeholder-[#636878] outline-none transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="auth-email" className="text-xs font-semibold text-[#F4F4F5] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#D6B36A]" />
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@chessacademy.internal"
              className="w-full bg-[#171A24] border border-[#242938] focus:border-[#D6B36A] rounded-lg px-3 py-2 text-xs text-[#F4F4F5] placeholder-[#636878] outline-none transition-colors font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="text-xs font-semibold text-[#F4F4F5] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#D6B36A]" />
                Password
              </span>
              <span className="text-[10px] text-[#9297A5]">Min 6 characters</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#171A24] border border-[#242938] focus:border-[#D6B36A] rounded-lg px-3 py-2 pr-10 text-xs text-[#F4F4F5] placeholder-[#636878] outline-none transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 text-[#9297A5] hover:text-[#F4F4F5] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isConfigured}
            className="w-full py-2.5 px-4 rounded-lg bg-[#D6B36A] hover:bg-[#c4a159] disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>{mode === 'signin' ? 'Sign In' : 'Create Academy Account'}</span>
            )}
          </button>

          {/* Guest fallback option */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs text-[#9297A5] hover:text-[#F4F4F5] transition-colors underline"
            >
              Continue as Guest (Local Offline Mode)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
