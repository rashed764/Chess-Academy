/**
 * Global application store using Zustand.
 * Manages layout responsiveness, sidebar state, audio preferences, and user session context.
 */

import { create } from 'zustand';
import type { BoardCustomizationSettings, UserLearningProfile } from '../types/user';

export const DEFAULT_USER_SETTINGS: BoardCustomizationSettings = {
  boardTheme: 'carbon_obsidian',
  pieceStyle: 'staunton',
  soundEnabled: true,
  soundVolume: 0.8,
  showLegalMoves: true,
  showCoordinates: true,
  autoQueenOnPromotion: true,
  highlightLastMove: true,
  evaluationBarVisible: true,
};

export const DEFAULT_GUEST_PROFILE: UserLearningProfile = {
  id: 'guest-candidate',
  email: 'guest@chessacademy.internal',
  displayName: 'Academy Candidate',
  ratings: {
    bullet: 1200,
    blitz: 1250,
    rapid: 1300,
    classical: 1350,
    tactics: 1280,
    endgame: 1190,
    masteryScore: 42,
  },
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrawn: 0,
    currentStreakDays: 1,
    bestStreakDays: 1,
    puzzlesSolved: 0,
    puzzlesSuccessRate: 0,
    trainingHoursTotal: 0,
    lastActiveAt: new Date().toISOString(),
  },
  settings: DEFAULT_USER_SETTINGS,
  preferredCoachPersonality: 'grandmaster',
  skillLevelTier: 'intermediate',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface AppState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  currentProfile: UserLearningProfile;
  activeNotification: string | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  updateSettings: (newSettings: Partial<BoardCustomizationSettings>) => void;
  setNotification: (message: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  currentProfile: DEFAULT_GUEST_PROFILE,
  activeNotification: null,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
  setSidebarCollapsed: (isCollapsed: boolean) => set({ isSidebarCollapsed: isCollapsed }),
  updateSettings: (newSettings) =>
    set((state) => ({
      currentProfile: {
        ...state.currentProfile,
        settings: { ...state.currentProfile.settings, ...newSettings },
      },
    })),
  setNotification: (message) => set({ activeNotification: message }),
}));
