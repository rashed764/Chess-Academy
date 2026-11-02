import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Swords,
  GraduationCap,
  Trophy,
  Search,
  BookOpen,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Crown,
  User,
  X,
} from 'lucide-react';
import { MAIN_NAVIGATION, SECONDARY_NAVIGATION, type NavigationItem } from '../../constants/routes';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../utils/cn';
import { playChessClick } from '../../utils/sound';

const NAV_ICONS: Record<string, React.ElementType> = {
  home: Compass,
  'quick-match': Swords,
  training: GraduationCap,
  'test-arena': Trophy,
  openings: BookOpen,
  analysis: Search,
  progress: TrendingUp,
  profile: User,
  settings: Settings,
};

export const Sidebar: React.FC = () => {
  const {
    isSidebarOpen,
    isSidebarCollapsed,
    setSidebarOpen,
    setSidebarCollapsed,
    currentProfile,
  } = useAppStore();

  const toggleCollapsed = () => {
    playChessClick(currentProfile.settings.soundEnabled);
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNavClick = () => {
    playChessClick(currentProfile.settings.soundEnabled);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        aria-label="Academy Navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-[#10121B] border-r border-[#242938] transition-all duration-300 ease-in-out md:static shrink-0 select-none',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#242938]">
          <NavLink
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 overflow-hidden group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D6B36A] rounded-lg p-1"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#171A24] border border-[#D6B36A]/40 text-[#D6B36A] shadow-inner shadow-[#D6B36A]/10 group-hover:border-[#D6B36A] transition-colors shrink-0">
              <Crown className="w-5 h-5" aria-hidden="true" />
            </div>

            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-wider text-[#F4F4F5] uppercase font-cinzel truncate">
                  Chess Academy
                </span>
                <span className="text-[10px] text-[#9297A5] tracking-widest uppercase">
                  Grandmaster Club
                </span>
              </div>
            )}
          </NavLink>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation sidebar"
            className="p-1.5 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] md:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Label: Salon & Disciplines */}
        {!isSidebarCollapsed && (
          <div className="px-5 pt-4 pb-1">
            <span className="text-[10px] font-semibold tracking-wider text-[#9297A5]/70 uppercase">
              Chess Salon
            </span>
          </div>
        )}

        {/* Primary Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {MAIN_NAVIGATION.map((item: NavigationItem) => {
            const Icon = NAV_ICONS[item.id] || Compass;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={handleNavClick}
                title={isSidebarCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-[#171A24] text-[#D6B36A] border border-[#D6B36A]/25 shadow-xs'
                      : 'text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24]/60 border border-transparent'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-[#D6B36A]' : 'text-[#9297A5] group-hover:text-[#F4F4F5]'
                      )}
                      aria-hidden="true"
                    />

                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 tracking-wide">{item.name}</span>
                    )}

                    {isActive && (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#D6B36A] rounded-r-full"
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Subtle Hairline Divider between Primary & Secondary */}
          <div className="pt-3 pb-2">
            <div className="h-px bg-[#242938]" />
          </div>

          {!isSidebarCollapsed && (
            <div className="px-2 pb-1">
              <span className="text-[10px] font-semibold tracking-wider text-[#9297A5]/70 uppercase">
                Account
              </span>
            </div>
          )}

          {SECONDARY_NAVIGATION.map((item: NavigationItem) => {
            const Icon = NAV_ICONS[item.id] || Settings;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={handleNavClick}
                title={isSidebarCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-[#171A24] text-[#D6B36A] border border-[#D6B36A]/25'
                      : 'text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24]/60 border border-transparent'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-[#D6B36A]' : 'text-[#9297A5] group-hover:text-[#F4F4F5]'
                      )}
                      aria-hidden="true"
                    />

                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 tracking-wide">{item.name}</span>
                    )}

                    {isActive && (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#D6B36A] rounded-r-full"
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Mini Bar */}
        <div className="p-3 border-t border-[#242938] bg-[#0B0D14]/60">
          <NavLink
            to="/profile"
            onClick={handleNavClick}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#171A24] transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#171A24] border border-[#D6B36A]/50 flex items-center justify-center text-[#D6B36A] text-xs font-bold shrink-0">
              {currentProfile.displayName.slice(0, 2).toUpperCase()}
            </div>

            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-[#F4F4F5] truncate group-hover:text-[#D6B36A] transition-colors font-cinzel">
                  {currentProfile.displayName}
                </span>
                <span className="text-[10px] text-[#9297A5] truncate font-mono">
                  ELO {currentProfile.ratings.rapid} · {currentProfile.skillLevelTier}
                </span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden md:flex items-center justify-end p-2 border-t border-[#242938]">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isSidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
            className="p-1.5 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors cursor-pointer"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
