/**
 * Supabase service types and database schema interfaces for Chess Academy.
 */

import type { ChessGameMetadata } from '../../types/chess';
import type { ArenaEvaluationReport, UserLessonProgress } from '../../types/curriculum';
import type { UserLearningProfile } from '../../types/user';

export interface DatabaseSchema {
  public: {
    Tables: {
      profiles: {
        Row: UserLearningProfile;
        Insert: Partial<UserLearningProfile> & { id: string; email: string };
        Update: Partial<UserLearningProfile>;
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
