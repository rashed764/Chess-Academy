-- ==============================================================================
-- CHESS ACADEMY — Initial PostgreSQL / Supabase Migration
-- Schema for user profiles, games, lesson progress, and test arena evaluations.
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  rating_bullet INTEGER NOT NULL DEFAULT 1200,
  rating_blitz INTEGER NOT NULL DEFAULT 1200,
  rating_rapid INTEGER NOT NULL DEFAULT 1200,
  rating_classical INTEGER NOT NULL DEFAULT 1200,
  rating_tactics INTEGER NOT NULL DEFAULT 1200,
  rating_endgame INTEGER NOT NULL DEFAULT 1200,
  mastery_score INTEGER NOT NULL DEFAULT 0,
  skill_level_tier TEXT NOT NULL DEFAULT 'beginner',
  board_theme TEXT NOT NULL DEFAULT 'carbon_obsidian',
  piece_style TEXT NOT NULL DEFAULT 'staunton',
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Chess Games Table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL DEFAULT 'Academy Match',
  white_player JSONB NOT NULL,
  black_player JSONB NOT NULL,
  time_control JSONB NOT NULL,
  initial_fen TEXT NOT NULL,
  pgn TEXT,
  result TEXT NOT NULL,
  winner TEXT,
  termination_reason TEXT,
  eco_code TEXT,
  opening_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own games"
  ON public.games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  score_percentage INTEGER NOT NULL DEFAULT 0,
  attempts_count INTEGER NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their lesson progress"
  ON public.lesson_progress FOR ALL
  USING (auth.uid() = user_id);

-- 4. Arena Evaluations Table
CREATE TABLE IF NOT EXISTS public.arena_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_accuracy_percent NUMERIC(5,2) NOT NULL,
  estimated_performance_rating INTEGER NOT NULL,
  blunders_count INTEGER NOT NULL DEFAULT 0,
  mistakes_count INTEGER NOT NULL DEFAULT 0,
  inaccuracies_count INTEGER NOT NULL DEFAULT 0,
  key_takeaway_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.arena_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evaluations"
  ON public.arena_evaluations FOR SELECT
  USING (auth.uid() = user_id);
