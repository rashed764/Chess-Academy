import type { ChessGameMetadata } from '../../types/chess';
import type { ArenaEvaluationReport, UserLessonProgress } from '../../types/curriculum';
import type { UserLearningProfile } from '../../types/user';
import type { LessonProgressRecord, ActivityHistoryItem } from '../../features/training/types';
import type { AssessmentReport } from '../../features/test-arena/types';
import type { LearnerPerformanceProfile } from '../../features/learning-engine/types';

export interface DatabaseSchema {
  public: {
    Tables: {
      profiles: {
        Row: UserLearningProfile & { lastSyncedAt?: string };
        Insert: Partial<UserLearningProfile> & { id: string; email: string };
        Update: Partial<UserLearningProfile> & { lastSyncedAt?: string };
      };
      games: {
        Row: ChessGameMetadata;
        Insert: Omit<ChessGameMetadata, 'createdAt' | 'updatedAt'> & {
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Partial<ChessGameMetadata>;
      };
      lesson_progress: {
        Row: UserLessonProgress & { userId: string };
        Insert: UserLessonProgress & { userId: string };
        Update: Partial<UserLessonProgress>;
      };
      arena_evaluations: {
        Row: ArenaEvaluationReport & { userId: string };
        Insert: ArenaEvaluationReport & { userId: string };
        Update: Partial<ArenaEvaluationReport>;
      };
      user_academy_progress: {
        Row: {
          user_id: string;
          current_level_id: string;
          completed_lesson_ids: string[];
          completed_module_ids: string[];
          unlocked_level_ids: string[];
          total_exercise_attempts: number;
          correct_exercise_attempts: number;
          incorrect_exercise_attempts: number;
          last_active_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_level_id?: string;
          completed_lesson_ids?: string[];
          completed_module_ids?: string[];
          unlocked_level_ids?: string[];
          total_exercise_attempts?: number;
          correct_exercise_attempts?: number;
          incorrect_exercise_attempts?: number;
          last_active_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          current_level_id: string;
          completed_lesson_ids: string[];
          completed_module_ids: string[];
          unlocked_level_ids: string[];
          total_exercise_attempts: number;
          correct_exercise_attempts: number;
          incorrect_exercise_attempts: number;
          last_active_at: string;
          updated_at: string;
        }>;
      };
      user_lesson_progress: {
        Row: LessonProgressRecord & { id: string; user_id: string; updated_at: string };
        Insert: Omit<LessonProgressRecord, 'id'> & { id?: string; user_id: string; updated_at?: string };
        Update: Partial<LessonProgressRecord & { updated_at?: string }>;
      };
      user_activity_history: {
        Row: ActivityHistoryItem & { user_id: string };
        Insert: ActivityHistoryItem & { user_id: string };
        Update: Partial<ActivityHistoryItem>;
      };
      test_arena_reports: {
        Row: {
          id: string;
          user_id: string;
          format_id: string;
          format_name: string;
          status: string;
          total_games_scheduled: number;
          games_completed: number;
          overall_results: any;
          games: any;
          created_at: string;
          completed_at?: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          format_id: string;
          format_name: string;
          status?: string;
          total_games_scheduled?: number;
          games_completed?: number;
          overall_results: any;
          games: any;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<{
          format_id: string;
          format_name: string;
          status: string;
          total_games_scheduled: number;
          games_completed: number;
          overall_results: any;
          games: any;
          completed_at?: string | null;
        }>;
      };
      learner_profiles: {
        Row: {
          user_id: string;
          version: number;
          total_evidence_points: number;
          has_sufficient_data: boolean;
          active_plan: any;
          recommendations: any;
          strengths: any;
          weaknesses: any;
          insufficient_evidence_areas: string[];
          topic_metrics: any;
          last_calculated_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          version?: number;
          total_evidence_points?: number;
          has_sufficient_data?: boolean;
          active_plan?: any;
          recommendations?: any;
          strengths?: any;
          weaknesses?: any;
          insufficient_evidence_areas?: string[];
          topic_metrics?: any;
          last_calculated_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          version: number;
          total_evidence_points: number;
          has_sufficient_data: boolean;
          active_plan: any;
          recommendations: any;
          strengths: any;
          weaknesses: any;
          insufficient_evidence_areas: string[];
          topic_metrics: any;
          last_calculated_at: string;
          updated_at: string;
        }>;
      };
    };
  };
}

export interface ISupabaseService {
  readonly isConnected: boolean;
  getProfile(userId: string): Promise<UserLearningProfile | null>;
  saveGame(game: ChessGameMetadata): Promise<string>;
  getGamesForUser(userId: string): Promise<ChessGameMetadata[]>;
  recordLessonProgress(userId: string, progress: UserLessonProgress): Promise<void>;
}
