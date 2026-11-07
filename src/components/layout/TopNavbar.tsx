import React from 'react';
import { Menu, Volume2, VolumeX, User as UserIcon, LogIn, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MAIN_NAVIGATION, SECONDARY_NAVIGATION } from '../../constants/routes';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick } from '../../utils/sound';
import { useAuth } from '../../features/auth/AuthContext';
import { SyncStatusBadge } from '../../features/auth/components/SyncStatusBadge';

export const TopNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar, currentProfile, updateSettings } = useAppStore();
  const { isAuthenticated, user, signOut, openAuthModal, isConfigured } = useAuth();

  const allNavs = [...MAIN_NAVIGATION, ...SECONDARY_NAVIGATION];
  const currentNav = allNavs.find((item) => item.path === location.pathname);
  const pageTitle = currentNav?.name || 'Chess Academy';

  const toggleSound = () => {
    const nextState = !currentProfile.settings.soundEnabled;
    updateSettings({ soundEnabled: nextState });
    if (nextState) {
      playChessClick(true, 0.7);
    }
  };

  const handleMobileMenu = () => {
    playChessClick(currentProfile.settings.soundEnabled);
    toggleSidebar();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-[#0B0D14]/95 backdrop-blur-md border-b border-[#242938]">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleMobileMenu}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-[#F4F4F5] tracking-wide font-cinzel">
            {pageTitle}
          </h1>
          {currentNav?.isPrimaryMode && (
            <span className="hidden sm:inline-block text-[10px] text-[#D6B36A] uppercase tracking-widest px-2 py-0.5 rounded border border-[#D6B36A]/30 bg-[#D6B36A]/10 font-sans">
              Academy Mode
            </span>
          )}
        </div>
      </div>

      {/* Right: Sync badge, Audio control, candidate credentials & Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Cloud Sync State Badge */}
        <div className="hidden sm:block">
          <SyncStatusBadge showButton />
        </div>

        {/* Sound toggle button */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={
            currentProfile.settings.soundEnabled
              ? 'Mute chess sound effects'
              : 'Enable chess sound effects'
          }
          className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors cursor-pointer"
          title={
            currentProfile.settings.soundEnabled ? 'Board audio active' : 'Board audio muted'
          }
        >
          {currentProfile.settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#D6B36A]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#9297A5]" />
          )}
        </button>

        {/* Member Rating Chip */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#242938]">
          <span className="text-xs text-[#9297A5] hidden md:inline">Rating</span>
          <span className="text-xs font-semibold text-[#D6B36A] font-mono bg-[#171A24] px-2.5 py-1 rounded border border-[#242938]">
            {currentProfile.ratings.rapid}
          </span>
        </div>

        {/* Account / Sign In Action */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-[#242938]">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#171A24] hover:bg-[#1f2433] border border-[#242938] text-xs text-[#F4F4F5] transition-colors cursor-pointer"
              title={`Logged in as ${user?.email}`}
            >
              <UserIcon className="w-3.5 h-3.5 text-[#D6B36A]" />
              <span className="hidden lg:inline text-[11px] font-mono max-w-[100px] truncate">
                {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D6B36A]/10 hover:bg-[#D6B36A]/20 border border-[#D6B36A]/30 text-xs text-[#D6B36A] font-semibold transition-colors cursor-pointer"
              title="Sign In or Register for Cloud Sync"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
