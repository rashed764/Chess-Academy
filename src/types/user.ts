/**
 * User learning profile, rating progression, and personal preferences.
 */

export interface ChessRatingProfile {
  bullet: number;
  blitz: number;
  rapid: number;
  classical: number;
  tactics: number;
  endgame: number;
  masteryScore: number;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  currentStreakDays: number;
  bestStreakDays: number;
  puzzlesSolved: number;
  puzzlesSuccessRate: number;
  trainingHoursTotal: number;
  lastActiveAt: string;
}

export interface BoardCustomizationSettings {
  boardTheme: 'dark_wood' | 'slate_classic' | 'emerald_luxury' | 'carbon_obsidian';
  pieceStyle: 'staunton' | 'neo' | 'alpha' | 'cardinal';
  soundEnabled: boolean;
  soundVolume: number;
  showLegalMoves: boolean;
  showCoordinates: boolean;
  autoQueenOnPromotion: boolean;
  highlightLastMove: boolean;
  evaluationBarVisible: boolean;
}

export interface UserLearningProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  ratings: ChessRatingProfile;
  stats: UserStats;
  settings: BoardCustomizationSettings;
  preferredCoachPersonality: 'grandmaster' | 'patient_tutor' | 'tactician';
  skillLevelTier: 'beginner' | 'intermediate' | 'advanced' | 'master_candidate';
  createdAt: string;
  updatedAt: string;
}
