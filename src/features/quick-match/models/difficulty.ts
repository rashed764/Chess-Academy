/**
 * Stockfish engine difficulty calibrations and search budget calculator.
 */

import type { DifficultyConfig, DifficultyLevel } from '../types';

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyConfig> = {
  beginner: {
    id: 'beginner',
    name: 'Beginner',
    label: 'Club Novice',
    description: 'Forgiving play with occasional tactical oversights and relaxed calculation.',
    skillLevel: 1,
    defaultDepth: 4,
    timeRatio: 0.02,
    maxTimeMs: 600,
  },
  casual: {
    id: 'casual',
    name: 'Casual',
    label: 'Casual Player',
    description: 'Solid opening fundamentals with manageable middle-game pressure.',
    skillLevel: 5,
    defaultDepth: 6,
    timeRatio: 0.03,
    maxTimeMs: 900,
  },
  intermediate: {
    id: 'intermediate',
    name: 'Intermediate',
    label: 'Club Competitor',
    description: 'Consistent tactical vigilance, active piece play, and sensible plans.',
    skillLevel: 10,
    defaultDepth: 8,
    timeRatio: 0.04,
    maxTimeMs: 1400,
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced',
    label: 'Academy Expert',
    description: 'Deep combinational vision, stubborn defensive resilience, and sharp pawn play.',
    skillLevel: 14,
    defaultDepth: 12,
    timeRatio: 0.05,
    maxTimeMs: 2000,
  },
  expert: {
    id: 'expert',
    name: 'Expert',
    label: 'Master Candidate',
    description: 'Relentless positional squeeze, minimal inaccuracies, and precise endgame technique.',
    skillLevel: 18,
    defaultDepth: 15,
    timeRatio: 0.06,
    maxTimeMs: 2800,
  },
  maximum: {
    id: 'maximum',
    name: 'Maximum Strength',
    label: 'Full Grandmaster',
    description: 'Uncompromising tactical precision and deep multi-ply calculation without handicaps.',
    skillLevel: 20,
    defaultDepth: 18,
    timeRatio: 0.08,
    maxTimeMs: 3800,
  },
};

/**
 * Calculates a search time limit for Stockfish that respects both the selected difficulty
 * and the remaining game clock time, preventing the engine from flagging on its own time control.
 */
export function calculateEngineSearchBudget(
  difficulty: DifficultyConfig,
  engineRemainingMs: number,
  incrementMs: number
): { timeLimitMs: number; depth: number } {
  // If engine has less than 2 seconds, move swiftly
  if (engineRemainingMs < 2000) {
    return {
      timeLimitMs: Math.max(80, Math.floor(engineRemainingMs * 0.2)),
      depth: Math.min(difficulty.defaultDepth, 4),
    };
  }

  // Base allocation: fraction of remaining time plus fraction of increment
  const calculatedBudget = Math.floor(engineRemainingMs * difficulty.timeRatio + incrementMs * 0.7);

  // Clamp within safe operational bounds
  const clampedBudget = Math.max(100, Math.min(difficulty.maxTimeMs, calculatedBudget));

  return {
    timeLimitMs: clampedBudget,
    depth: difficulty.defaultDepth,
  };
}
