-- ==============================================================================
-- CHESS ACADEMY — Cloud Synchronization & Hardened Security Migration
-- Task 09: Extends schema for full local-first cloud synchronization.
-- Includes: User Academy Progress, Lesson Progress, Activity History,
-- Test Arena Reports, and Cached Learner Profiles with strict 100% RLS.
-- ==============================================================================

-- 1. Extend profiles with full board customization and timestamp columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sound_volume NUMERIC(3,2) NOT NULL DEFAULT 0.80,
  ADD COLUMN IF NOT EXISTS show_legal_moves BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_coordinates BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_queen_on_promotion BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS highlight_last_move BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS evaluation_bar_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Strengthen profiles RLS (INSERT, UPDATE WITH CHECK, DELETE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can delete own profile'
  ) THEN
    CREATE POLICY "Users can delete own profile"
      ON public.profiles FOR DELETE
      USING (auth.uid() IS NOT NULL AND auth.uid() = id);
  END IF;
END $$;

-- 2. User Academy Overall Progress Table
CREATE TABLE IF NOT EXISTS public.user_academy_progress (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_level_id TEXT NOT NULL DEFAULT 'level-1-absolute-beginner',
  completed_lesson_ids TEXT[] NOT NULL DEFAULT '{}',
  completed_module_ids TEXT[] NOT NULL DEFAULT '{}',
  unlocked_level_ids TEXT[] NOT NULL DEFAULT '{"level-1-absolute-beginner"}',
  total_exercise_attempts INTEGER NOT NULL DEFAULT 0,
  correct_exercise_attempts INTEGER NOT NULL DEFAULT 0,
  incorrect_exercise_attempts INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_academy_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own academy progress"
  ON public.user_academy_progress FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own academy progress"
  ON public.user_academy_progress FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own academy progress"
  ON public.user_academy_progress FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete own academy progress"
  ON public.user_academy_progress FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 3. Detailed User Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  module_id TEXT NOT NULL DEFAULT '',
  level_id TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  reading_done BOOLEAN NOT NULL DEFAULT false,
  exercise_passed BOOLEAN NOT NULL DEFAULT false,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  best_attempts_count INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);

ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lesson progress"
  ON public.user_lesson_progress FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress"
  ON public.user_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
  ON public.user_lesson_progress FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete own lesson progress"
  ON public.user_lesson_progress FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 4. User Training Activity History Table
CREATE TABLE IF NOT EXISTS public.user_activity_history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  type TEXT NOT NULL,
  level_id TEXT NOT NULL DEFAULT '',
  lesson_id TEXT NOT NULL DEFAULT '',
  lesson_title TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_user_activity_history_user_id ON public.user_activity_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_history_timestamp ON public.user_activity_history(timestamp DESC);

ALTER TABLE public.user_activity_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity history"
  ON public.user_activity_history FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own activity history"
  ON public.user_activity_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own activity history"
  ON public.user_activity_history FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete own activity history"
  ON public.user_activity_history FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 5. Test Arena Assessment Reports Table
CREATE TABLE IF NOT EXISTS public.test_arena_reports (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  format_id TEXT NOT NULL,
  format_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  total_games_scheduled INTEGER NOT NULL DEFAULT 1,
  games_completed INTEGER NOT NULL DEFAULT 1,
  overall_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  games JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_test_arena_reports_user_id ON public.test_arena_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_test_arena_reports_created_at ON public.test_arena_reports(created_at DESC);

ALTER TABLE public.test_arena_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own arena reports"
  ON public.test_arena_reports FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own arena reports"
  ON public.test_arena_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own arena reports"
  ON public.test_arena_reports FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete own arena reports"
  ON public.test_arena_reports FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 6. Cached Learner Performance Profiles Table
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  total_evidence_points INTEGER NOT NULL DEFAULT 0,
  has_sufficient_data BOOLEAN NOT NULL DEFAULT false,
  active_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  insufficient_evidence_areas TEXT[] NOT NULL DEFAULT '{}',
  topic_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learner profile"
  ON public.learner_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own learner profile"
  ON public.learner_profiles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own learner profile"
  ON public.learner_profiles FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete own learner profile"
  ON public.learner_profiles FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 7. Strengthen initial schema tables (games, lesson_progress, arena_evaluations)
DO $$
BEGIN
  -- games
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'games' AND policyname = 'Users can update own games'
  ) THEN
    CREATE POLICY "Users can update own games"
      ON public.games FOR UPDATE
      USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
      WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'games' AND policyname = 'Users can delete own games'
  ) THEN
    CREATE POLICY "Users can delete own games"
      ON public.games FOR DELETE
      USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;

  -- arena_evaluations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'arena_evaluations' AND policyname = 'Users can insert own evaluations'
  ) THEN
    CREATE POLICY "Users can insert own evaluations"
      ON public.arena_evaluations FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'arena_evaluations' AND policyname = 'Users can update own evaluations'
  ) THEN
    CREATE POLICY "Users can update own evaluations"
      ON public.arena_evaluations FOR UPDATE
      USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
      WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'arena_evaluations' AND policyname = 'Users can delete own evaluations'
  ) THEN
    CREATE POLICY "Users can delete own evaluations"
      ON public.arena_evaluations FOR DELETE
      USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;
END $$;
