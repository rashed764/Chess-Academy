import type { AssessmentReport } from '../types';

export const TEST_ARENA_STORAGE_KEY = 'chess_academy_test_reports_v1';
export const TEST_ARENA_ACTIVE_KEY = 'chess_academy_active_assessment_v1';

export class TestArenaStorage {
  /**
   * Retrieves all completed or saved assessment reports from local storage.
   * Gracefully handles corrupted JSON by resetting safely.
   */
  static getReports(): AssessmentReport[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(TEST_ARENA_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.warn('[TestArenaStorage] Corrupted reports in localStorage, recovering safely:', err);
      return [];
    }
  }

  /**
   * Saves or updates an assessment report in localStorage without duplicates.
   */
  static saveReport(report: AssessmentReport): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const current = this.getReports();
      const existingIndex = current.findIndex((r) => r.id === report.id);

      let updated: AssessmentReport[];
      if (existingIndex >= 0) {
        updated = [...current];
        updated[existingIndex] = report;
      } else {
        updated = [report, ...current];
      }

      window.localStorage.setItem(TEST_ARENA_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('[TestArenaStorage] Failed to save assessment report:', err);
    }
  }

  /**
   * Retrieves a single report by ID.
   */
  static getReportById(id: string): AssessmentReport | null {
    const reports = this.getReports();
    return reports.find((r) => r.id === id) || null;
  }

  /**
   * Deletes a report by ID.
   */
  static deleteReport(id: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const reports = this.getReports().filter((r) => r.id !== id);
      window.localStorage.setItem(TEST_ARENA_STORAGE_KEY, JSON.stringify(reports));
    } catch (err) {
      console.error('[TestArenaStorage] Failed to delete report:', err);
    }
  }

  /**
   * Retrieves any active, in-progress assessment (e.g. 5-Game battery across sessions).
   */
  static getActiveAssessment(): AssessmentReport | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const raw = window.localStorage.getItem(TEST_ARENA_ACTIVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[TestArenaStorage] Corrupted active assessment, clearing:', err);
      this.clearActiveAssessment();
      return null;
    }
  }

  /**
   * Saves or updates current in-progress assessment.
   */
  static saveActiveAssessment(assessment: AssessmentReport): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(TEST_ARENA_ACTIVE_KEY, JSON.stringify(assessment));
    } catch (err) {
      console.error('[TestArenaStorage] Failed to save active assessment:', err);
    }
  }

  /**
   * Clears the active in-progress assessment.
   */
  static clearActiveAssessment(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(TEST_ARENA_ACTIVE_KEY);
    } catch (err) {
      // Ignore cleanup error
    }
  }
}
