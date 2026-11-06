/**
 * Local storage manager for Personalized Learning Engine profile and derived insights.
 * Safe fallback, migration handling, and non-destructive persistence.
 */

import type { LearnerPerformanceProfile } from '../types';

export const LEARNER_PROFILE_STORAGE_KEY = 'chess_academy_learner_profile_v1';
export const LEARNER_PROFILE_VERSION = 1;

export class LearningEngineStorage {
  /**
   * Retrieves stored learner profile from localStorage.
   * Gracefully handles corrupted JSON or missing schema.
   */
  static getProfile(): LearnerPerformanceProfile | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(LEARNER_PROFILE_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Partial<LearnerPerformanceProfile>;
      if (!parsed || typeof parsed !== 'object' || parsed.version !== LEARNER_PROFILE_VERSION) {
        return null;
      }

      return parsed as LearnerPerformanceProfile;
    } catch (err) {
      console.warn('[LearningEngineStorage] Corrupted profile JSON in localStorage, resetting safely:', err);
      return null;
    }
  }

  /**
   * Persists learner profile in localStorage.
   */
  static saveProfile(profile: LearnerPerformanceProfile): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(LEARNER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.error('[LearningEngineStorage] Failed to save profile to localStorage:', err);
    }
  }

  /**
   * Clears stored profile to allow complete recalculation.
   */
  static clearProfile(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(LEARNER_PROFILE_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
