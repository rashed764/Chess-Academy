/**
 * Cloud Synchronization Service for Chess Academy
 *
 * Provides bidirectional, deterministic synchronization between
 * local-first storage (localStorage) and Supabase tables:
 * - user_academy_progress
 * - user_lesson_progress
 * - user_activity_history
 * - test_arena_reports
 * - profiles
 * - learner_profiles
 *
 * Core Guarantees:
 * 1. Offline-first: Full local functionality works without network or cloud credentials.
 * 2. Non-destructive: Local progress is never wiped on sync failure or network disconnection.
 * 3. Deterministic conflict resolution:
 *    - Lesson completions: Union of completed IDs.
 *    - Exercise attempts: Higher count preserved.
 *    - Activity history: Deduplicated by unique ID.
 *    - Arena reports: Deduplicated by report ID, preferring completed state.
 *    - Settings: Last-write-wins based on updated_at timestamp.
 *    - Learner profile: Recomputed from merged progress + assessment evidence.
 */

import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseReady } from './client';
import { ProgressStorage, INITIAL_PROGRESS_STATE } from '../../features/training/models/progressStorage';
import { TestArenaStorage } from '../../features/test-arena/models/storage';
import { LearningEngineStorage } from '../../features/learning-engine/models/storage';
import { LearningEngineService } from '../../features/learning-engine/learningEngineService';
import { useAppStore } from '../../stores/useAppStore';
import type {
  AcademyProgressState,
  ActivityHistoryItem,
  LessonProgressRecord,
} from '../../features/training/types';
import type { AssessmentReport } from '../../features/test-arena/types';
import type { UserLearningProfile } from '../../types/user';

export const SYNCED_USER_STORAGE_KEY = 'chess_academy_synced_user_id';
export type SyncStatus = 'local_only' | 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  errorMessage: string | null;
}

type SyncListener = (state: SyncState) => void;

class CloudSyncService {
  private status: SyncStatus = 'idle';
  private lastSyncedAt: string | null = null;
  private errorMessage: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private isSyncInProgress = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.status === 'offline') {
          this.updateState({ status: 'idle', errorMessage: null });
        }
      });

      window.addEventListener('offline', () => {
        this.updateState({ status: 'offline', errorMessage: 'Network is offline' });
      });
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): SyncState {
    if (!isSupabaseReady()) {
      return {
        status: 'local_only',
        lastSyncedAt: this.lastSyncedAt,
        errorMessage: null,
      };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        status: 'offline',
        lastSyncedAt: this.lastSyncedAt,
        errorMessage: 'Network connection unavailable',
      };
    }

    return {
      status: this.status,
      lastSyncedAt: this.lastSyncedAt,
      errorMessage: this.errorMessage,
    };
  }

  private updateState(partial: Partial<SyncState>): void {
    if (partial.status !== undefined) this.status = partial.status;
    if (partial.lastSyncedAt !== undefined) this.lastSyncedAt = partial.lastSyncedAt;
    if (partial.errorMessage !== undefined) this.errorMessage = partial.errorMessage;

    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        console.error('[CloudSyncService] Error in listener:', e);
      }
    });
  }

  /**
   * Deterministically merges local and cloud academy progress.
   */
  public mergeAcademyProgress(
    local: AcademyProgressState,
    cloud: any
  ): AcademyProgressState {
    if (!cloud) return local;

    const completedLessonIds = Array.from(
      new Set([...local.completedLessonIds, ...(cloud.completed_lesson_ids || [])])
    );
    const completedModuleIds = Array.from(
      new Set([...local.completedModuleIds, ...(cloud.completed_module_ids || [])])
    );
    const unlockedLevelIds = Array.from(
      new Set([...local.unlockedLevelIds, ...(cloud.unlocked_level_ids || ['level-1-absolute-beginner'])])
    );

    const totalExerciseAttempts = Math.max(
      local.totalExerciseAttempts || 0,
      cloud.total_exercise_attempts || 0
    );
    const correctExerciseAttempts = Math.max(
      local.correctExerciseAttempts || 0,
      cloud.correct_exercise_attempts || 0
    );
    const incorrectExerciseAttempts = Math.max(
      local.incorrectExerciseAttempts || 0,
      cloud.incorrect_exercise_attempts || 0
    );

    const localTime = new Date(local.lastActiveAt || 0).getTime();
    const cloudTime = new Date(cloud.last_active_at || 0).getTime();

    // If local has 0 completed lessons & attempts and cloud has progress, cloud is the authoritative restore source
    const isLocalFreshOrEmpty = (local.completedLessonIds?.length || 0) === 0 && (local.totalExerciseAttempts || 0) === 0;
    const isCloudAhead = (cloud.completed_lesson_ids?.length || 0) > 0 || (cloud.total_exercise_attempts || 0) > 0;
    const useCloudAsActive = (isLocalFreshOrEmpty && isCloudAhead) || cloudTime > localTime;

    const lastActiveAt = useCloudAsActive ? (cloud.last_active_at || local.lastActiveAt) : local.lastActiveAt;
    const currentLevelId = useCloudAsActive
      ? (cloud.current_level_id || local.currentLevelId)
      : local.currentLevelId;

    return {
      ...local,
      currentLevelId,
      completedLessonIds,
      completedModuleIds,
      unlockedLevelIds,
      totalExerciseAttempts,
      correctExerciseAttempts,
      incorrectExerciseAttempts,
      lastActiveAt,
    };
  }

  /**
   * Deterministically merges lesson progress map.
   */
  public mergeLessonProgressRecords(
    localProgressMap: Record<string, LessonProgressRecord>,
    cloudRows: any[]
  ): Record<string, LessonProgressRecord> {
    const merged: Record<string, LessonProgressRecord> = { ...localProgressMap };

    for (const row of cloudRows) {
      const lessonId = row.lesson_id || row.lessonId;
      if (!lessonId) continue;

      const localRec = merged[lessonId];
      if (!localRec) {
        merged[lessonId] = {
          lessonId,
          moduleId: row.module_id || row.moduleId || '',
          levelId: row.level_id || row.levelId,
          completed: Boolean(row.completed),
          completedAt: row.completed_at || row.completedAt,
          readingDone: Boolean(row.reading_done ?? row.readingDone),
          exercisePassed: Boolean(row.exercise_passed ?? row.exercisePassed),
          attemptsCount: row.attempts_count || row.attemptsCount || 0,
          bestAttemptsCount: row.best_attempts_count || row.bestAttemptsCount || 1,
        };
      } else {
        const completed = localRec.completed || Boolean(row.completed);
        const exercisePassed = localRec.exercisePassed || Boolean(row.exercise_passed ?? row.exercisePassed);
        const readingDone = localRec.readingDone || Boolean(row.reading_done ?? row.readingDone);
        const attemptsCount = Math.max(localRec.attemptsCount || 0, row.attempts_count || row.attemptsCount || 0);

        merged[lessonId] = {
          ...localRec,
          completed,
          completedAt: localRec.completedAt || row.completed_at || row.completedAt,
          exercisePassed,
          readingDone,
          attemptsCount,
        };
      }
    }

    return merged;
  }

  /**
   * Deterministically merges activity history items by ID, capped at 50 most recent.
   */
  public mergeActivityHistory(
    localItems: ActivityHistoryItem[],
    cloudRows: any[]
  ): ActivityHistoryItem[] {
    const map = new Map<string, ActivityHistoryItem>();

    for (const item of localItems) {
      if (item.id) map.set(item.id, item);
    }

    for (const row of cloudRows) {
      if (row.id && !map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          timestamp: row.timestamp || new Date().toISOString(),
          type: row.type || 'lesson_completed',
          levelId: row.level_id || row.levelId,
          lessonId: row.lesson_id || row.lessonId,
          lessonTitle: row.lesson_title || row.lessonTitle,
          details: row.details,
        });
      }
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return merged.slice(0, 50);
  }

  /**
   * Deterministically merges Test Arena reports by report ID.
   */
  public mergeArenaReports(
    localReports: AssessmentReport[],
    cloudRows: any[]
  ): AssessmentReport[] {
    const map = new Map<string, AssessmentReport>();

    for (const rep of localReports) {
      if (rep.id) map.set(rep.id, rep);
    }

    for (const row of cloudRows) {
      const id = row.id;
      if (!id) continue;

      const cloudReport: AssessmentReport = {
        id,
        formatId: row.format_id || row.formatId,
        formatName: row.format_name || row.formatName,
        status: row.status,
        totalGamesScheduled: row.total_games_scheduled || row.totalGamesScheduled || 1,
        gamesCompleted: row.games_completed || row.gamesCompleted || 0,
        overallResults: row.overall_results || row.overallResults || {},
        games: row.games || [],
        createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        completedAt: row.completed_at || row.completedAt || null,
      };

      const existing = map.get(id);
      if (!existing) {
        map.set(id, cloudReport);
      } else {
        // If one is completed and one in progress, completed wins
        if (cloudReport.status === 'completed' && existing.status !== 'completed') {
          map.set(id, cloudReport);
        } else if (existing.status === 'completed' && cloudReport.status !== 'completed') {
          // Keep local completed
        } else {
          // Both same status; compare completedAt or createdAt
          const exTime = new Date(existing.completedAt || existing.createdAt).getTime();
          const clTime = new Date(cloudReport.completedAt || cloudReport.createdAt).getTime();
          if (clTime > exTime) {
            map.set(id, cloudReport);
          }
        }
      }
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged;
  }

  /**
   * Performs full synchronization cycle for authenticated user.
   */
  public async syncAll(user: User): Promise<boolean> {
    if (!isSupabaseReady()) {
      this.updateState({ status: 'local_only', errorMessage: null });
      return false;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateState({ status: 'offline', errorMessage: 'Network connection unavailable' });
      return false;
    }

    if (this.isSyncInProgress) {
      return false;
    }

    const client = getSupabaseClient();
    if (!client) {
      this.updateState({ status: 'local_only', errorMessage: null });
      return false;
    }

    this.isSyncInProgress = true;
    this.updateState({ status: 'syncing', errorMessage: null });

    try {
      const userId = user.id;

      // Account switching isolation: verify if user changed on this client
      if (typeof window !== 'undefined' && window.localStorage) {
        const previousUserId = window.localStorage.getItem(SYNCED_USER_STORAGE_KEY);
        if (previousUserId && previousUserId !== userId) {
          // Different user logged in: reset local caches to ensure total cross-account isolation
          ProgressStorage.saveProgress({ ...INITIAL_PROGRESS_STATE });
          LearningEngineStorage.clearProfile();
        }
        window.localStorage.setItem(SYNCED_USER_STORAGE_KEY, userId);
      }

      // 1. Fetch Cloud Data in parallel
      const [
        progressRes,
        lessonProgressRes,
        activityRes,
        arenaRes,
        profileRes,
      ] = await Promise.all([
        client.from('user_academy_progress').select('*').eq('user_id', userId).maybeSingle(),
        client.from('user_lesson_progress').select('*').eq('user_id', userId),
        client.from('user_activity_history').select('*').eq('user_id', userId).limit(50),
        client.from('test_arena_reports').select('*').eq('user_id', userId),
        client.from('profiles').select('*').eq('id', userId).maybeSingle(),
      ]);

      // 2. Load Local Data
      const localProgress = ProgressStorage.loadProgress();
      const localArenaReports = TestArenaStorage.getReports();
      const localAppProfile = useAppStore.getState().currentProfile;

      // 3. Deterministic Merge of Academy Progress & Lessons
      let mergedProgress = this.mergeAcademyProgress(localProgress, progressRes.data);
      const mergedLessonRecords = this.mergeLessonProgressRecords(
        mergedProgress.lessonProgress,
        lessonProgressRes.data || []
      );
      const mergedActivityHistory = this.mergeActivityHistory(
        mergedProgress.activityHistory,
        activityRes.data || []
      );

      mergedProgress = {
        ...mergedProgress,
        lessonProgress: mergedLessonRecords,
        activityHistory: mergedActivityHistory,
      };

      // 4. Deterministic Merge of Test Arena Reports
      const mergedArenaReports = this.mergeArenaReports(
        localArenaReports,
        arenaRes.data || []
      );

      // 5. Persist merged datasets to Local Storage first (local-first safety)
      ProgressStorage.saveProgress(mergedProgress);
      for (const rep of mergedArenaReports) {
        TestArenaStorage.saveReport(rep);
      }

      // 6. Recompute Learner Performance Profile on-device using merged data
      const recomputedLearnerProfile = LearningEngineService.computeProfile(
        mergedProgress,
        mergedArenaReports
      );
      LearningEngineStorage.saveProfile(recomputedLearnerProfile);

      // 7. Deterministic Merge of User Profile and Settings
      let mergedUserLearningProfile: UserLearningProfile = { ...localAppProfile };
      const cloudProfile = profileRes.data as any;
      if (cloudProfile) {
        const cloudUpdatedAt = new Date(cloudProfile.updated_at || cloudProfile.updatedAt || 0).getTime();
        const localUpdatedAt = new Date(localAppProfile.updatedAt || 0).getTime();

        if (cloudUpdatedAt > localUpdatedAt) {
          // Cloud is newer: update local app settings
          mergedUserLearningProfile = {
            ...localAppProfile,
            id: userId,
            email: user.email || localAppProfile.email,
            displayName: cloudProfile.display_name || cloudProfile.displayName || localAppProfile.displayName,
            settings: {
              ...localAppProfile.settings,
              ...(cloudProfile.settings || {}),
            },
            ratings: {
              ...localAppProfile.ratings,
              ...(cloudProfile.ratings || {}),
            },
            updatedAt: new Date().toISOString(),
          };
          useAppStore.setState({ currentProfile: mergedUserLearningProfile });
        }
      }

      // 8. Upsert Merged State Back to Cloud
      const nowIso = new Date().toISOString();

      // Upsert Academy Progress
      await client.from('user_academy_progress').upsert({
        user_id: userId,
        current_level_id: mergedProgress.currentLevelId,
        completed_lesson_ids: mergedProgress.completedLessonIds,
        completed_module_ids: mergedProgress.completedModuleIds,
        unlocked_level_ids: mergedProgress.unlockedLevelIds,
        total_exercise_attempts: mergedProgress.totalExerciseAttempts,
        correct_exercise_attempts: mergedProgress.correctExerciseAttempts,
        incorrect_exercise_attempts: mergedProgress.incorrectExerciseAttempts,
        last_active_at: mergedProgress.lastActiveAt,
        updated_at: nowIso,
      } as any);

      // Upsert Lesson Progress records
      const lessonProgressEntries = Object.values(mergedLessonRecords);
      if (lessonProgressEntries.length > 0) {
        const lessonRows = lessonProgressEntries.map((rec) => ({
          user_id: userId,
          lesson_id: rec.lessonId,
          module_id: rec.moduleId,
          level_id: rec.levelId,
          completed: rec.completed,
          completed_at: rec.completedAt || null,
          reading_done: rec.readingDone,
          exercise_passed: rec.exercisePassed,
          attempts_count: rec.attemptsCount,
          best_attempts_count: rec.bestAttemptsCount,
          updated_at: nowIso,
        }));
        await client.from('user_lesson_progress').upsert(lessonRows as any);
      }

      // Upsert Activity History items
      if (mergedActivityHistory.length > 0) {
        const activityRows = mergedActivityHistory.map((act) => ({
          id: act.id,
          user_id: userId,
          timestamp: act.timestamp,
          type: act.type,
          level_id: act.levelId || null,
          lesson_id: act.lessonId || null,
          lesson_title: act.lessonTitle || null,
          details: act.details || null,
        }));
        await client.from('user_activity_history').upsert(activityRows as any);
      }

      // Upsert Test Arena Reports
      if (mergedArenaReports.length > 0) {
        const arenaRows = mergedArenaReports.map((rep) => ({
          id: rep.id,
          user_id: userId,
          format_id: rep.formatId,
          format_name: rep.formatName,
          status: rep.status,
          total_games_scheduled: rep.totalGamesScheduled,
          games_completed: rep.gamesCompleted,
          overall_results: rep.overallResults,
          games: rep.games,
          created_at: rep.createdAt,
          completed_at: rep.completedAt || null,
        }));
        await client.from('test_arena_reports').upsert(arenaRows as any);
      }

      // Upsert Learner Performance Profile
      await client.from('learner_profiles').upsert({
        user_id: userId,
        version: recomputedLearnerProfile.version,
        total_evidence_points: recomputedLearnerProfile.totalEvidencePoints,
        has_sufficient_data: recomputedLearnerProfile.hasSufficientData,
        active_plan: recomputedLearnerProfile.activePlan,
        recommendations: recomputedLearnerProfile.recommendations,
        strengths: recomputedLearnerProfile.strengths,
        weaknesses: recomputedLearnerProfile.weaknesses,
        insufficient_evidence_areas: recomputedLearnerProfile.insufficientEvidenceAreas,
        topic_metrics: recomputedLearnerProfile.topicMetrics,
        last_calculated_at: recomputedLearnerProfile.lastCalculatedAt,
        updated_at: nowIso,
      } as any);

      // Upsert User Profile
      await client.from('profiles').upsert({
        id: userId,
        email: user.email || 'user@chessacademy.internal',
        display_name: mergedUserLearningProfile.displayName,
        username: mergedUserLearningProfile.displayName,
        settings: mergedUserLearningProfile.settings,
        ratings: mergedUserLearningProfile.ratings,
        skill_level_tier: mergedUserLearningProfile.skillLevelTier,
        updated_at: nowIso,
        last_synced_at: nowIso,
      } as any);

      this.updateState({
        status: 'synced',
        lastSyncedAt: nowIso,
        errorMessage: null,
      });

      return true;
    } catch (err) {
      console.error('[CloudSyncService] Sync cycle encountered error:', err);
      this.updateState({
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Sync cycle failed',
      });
      return false;
    } finally {
      this.isSyncInProgress = false;
    }
  }
}

export const cloudSyncService = new CloudSyncService();
