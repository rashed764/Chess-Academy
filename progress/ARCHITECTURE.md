# CHESS ACADEMY — Architecture & Technical Specifications

## 1. System Overview & Core Philosophy

CHESS ACADEMY is built as a high-performance, modular chess education platform inspired by prestigious grandmaster salons and luxury chess clubs.

Core Architectural Tenets:
1. **Chess-First Aesthetic Poise**: Minimal, spacious, dark-mode elegance. Eradicates corporate SaaS clutter, neon glows, and candy pills in favor of noble typography (`Cinzel` + `Plus Jakarta Sans`) and gold accents (`#D6B36A`).
2. **Decoupled Engine Intelligence**: Local chess computations (rules, move validation, evaluation) remain strictly separated from presentation and remote AI services. The engine runs in a dedicated browser Web Worker.
3. **Provider-Agnostic Cloud AI**: Cloud LLM coaching operates through an adapter interface (`IAIProviderAdapter`), ensuring switching providers requires zero changes to UI or engine layers.
4. **Optional Cloud Configuration**: All cloud variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are purely optional. The app starts and runs in local preview mode without requiring external credentials.
5. **State Separation**:
   - **Local Component State**: Ephemeral UI toggles, input focus, hover coordinates.
   - **Global Application State (Zustand)**: Sidebar open/collapsed state, audio preferences, active user profile.
   - **Server Cache (TanStack Query)**: Network queries, curriculum fetching, leaderboards.

---

## 2. Directory Layout

```
src/
├── app/                  # Application root wrappers & providers (QueryClient, ErrorBoundary)
├── components/
│   ├── common/           # Generic primitives (Button, Badge, Spinner, EmptyState, ErrorState)
│   ├── layout/           # Global shell (Sidebar, TopNavbar, AppLayout)
│   └── ui/               # Base styled components (Card, CardHeader, CardTitle, etc.)
├── features/             # Domain-specific route pages & architectural views
│   ├── dashboard/        # Premium Chess Club Dashboard (Hero, 3 Disciplines, Salon Log)
│   ├── quick-match/      # Stockfish unassisted matchmaker & time control selector
│   │   ├── components/   # ChessboardView, MoveHistoryList, PlayerClockCard, PromotionModal, etc.
│   │   ├── hooks/        # useChessClock, useQuickMatchSession
│   │   ├── models/       # clock.ts, difficulty.ts, timeControls.ts
│   │   └── types.ts
│   ├── training/         # 7-Level grandmaster curriculum & interactive exercise academy
│   │   ├── components/   # LevelSelector, LevelProgressBanner, LessonCard, ModuleAccordion,
│   │   │                 # ExerciseBoard, ExerciseFeedback, LearningHistoryView, LessonRoom, CurriculumOverview
│   │   ├── data/         # levels.ts, curriculumData.ts, index.ts
│   │   ├── hooks/        # useTrainingProgress, useExerciseSession
│   │   ├── models/       # exerciseValidator.ts, unlockEngine.ts, progressStorage.ts
│   │   └── types.ts
│   ├── test-arena/       # Diagnostic test arena assessment formats & protocols
│   ├── openings/         # Classical ECO opening reference library
│   ├── analysis/         # Chess study sanctum with live Stockfish WASM calculation
│   ├── progress/         # Personal rating trajectory & honors journal
│   ├── profile/          # Member credentials & title aspirations
│   ├── settings/         # Acoustic feedback, board visual assists & AI Provider Configuration
│   └── not-found/        # 404 route fallback
├── hooks/                # Custom React hooks (useMediaQuery, etc.)
├── server/               # Express backend server routes, config manager & AI services
│   ├── configManager.ts  # Encrypted server storage for API key and active model ID
│   ├── geminiClient.ts   # Dynamic GoogleGenAI client factory & SDK model listing
│   ├── coachRouter.ts    # API endpoints (/api/coach/* and /api/coach/config/*)
│   ├── coachService.ts   # Move quality classification, progressive hints & explanations
│   ├── rateLimiter.ts    # Token bucket rate limiting middleware
│   └── validators.ts    # FEN, move legality & position consistency validators
├── services/
│   ├── ai/               # Provider-independent AI coaching adapters & contracts
│   ├── chess/            # UCI engine adapter, FEN parser, rule utilities
│   │   ├── engine/       # Dedicated Stockfish engine worker & UCI protocol implementation
│   │   │   ├── EngineTypes.ts
│   │   │   ├── UCIProtocol.ts
│   │   │   └── StockfishEngine.ts
│   │   ├── adapter.ts    # IChessEngineAdapter implementations
│   │   ├── fen.ts        # FEN parser & validator
│   │   └── types.ts      # Engine interfaces
│   └── supabase/         # Safe client factory & database schema types
```

---

## 3. High-Precision Chess Clock Model

- Timestamp-based elapsed time calculation avoiding JS interval drift.
- Pre-allocated millisecond budgets for 9 standard time control presets (Bullet 1+0 to Classical 30+0).
- Handover and increment addition executed atomically on move completion.

---

## 4. Canonical Curriculum Architecture

- 7 canonical levels from Absolute Beginner to Grandmaster Preparation with 30 exercises.
- `CANONICAL_LESSON_IDS` array defines exact linear ordering.
- Exercise attempts recorded in `useExerciseSession` without duplication.

---

## 5. AI Coach Intelligence Architecture (TASK 06)

1. **Hybrid Architecture & Trust Boundary Principle**:
   - **Local Stockfish WASM + Headless chess.js = Chess Truth**: Engine calculations, numerical centipawn evaluations, forced mate detection, and move legality are authoritative.
   - **Data Provenance**: Stockfish runs strictly in the client's browser Web Worker (`client_stockfish_wasm`). The server does not falsely claim to execute Stockfish independently. Any engine data received from the browser is treated as untrusted client data and tagged with `provenance: 'client_stockfish_wasm'`.
   - **Server-Side Validation**: Every FEN is validated with `chess.js`, move legality in the position is strictly verified, position consistency (`fenBefore` + `move` == `fenAfter`) is checked, and any client-supplied Principal Variations (PV) are replayed on a headless board. If illegal moves are present in the PV, `pvVerification` is set to `false`.
   - **Google GenAI (Gemini) = Educational Explanation**: Generates pedagogical commentary, strategic advice, and progressive hints. The LLM never creates numerical evaluations or authoritative best moves.

2. **Server-Side Security, Hardening & Rate Limiting (`src/server/`)**:
   - Express server (`server.ts`) hosting API routes at `/api/coach`.
   - `trust proxy: 1` enabled for accurate client IP identification behind reverse proxies (`X-Forwarded-For`).
   - Request body limit capped at `200kb` to protect against payload flooding DoS attacks.
   - Per-IP in-memory token bucket rate limiter (60 requests/minute, burst capacity 60).
   - `GEMINI_API_KEY` is loaded strictly on the server and is never sent to the browser or bundled in client code.
   - Strict input validation via `src/server/validators.ts`.
   - Bounded 10-second client timeout guard (`withTimeout`) passing `AbortSignal`.

3. **Encrypted Server Storage & AI Model Discovery (`src/server/configManager.ts`)**:
   - Stores custom API keys and selected model IDs in `/app/applet/data/provider_config.enc` using Node.js `crypto` AES-256-GCM encryption.
   - Masked key rendering (`••••••••••••1234`) ensures raw API keys are never returned in status endpoints or UI responses.
   - Dynamic SDK Model Discovery: `listAvailableModels()` fetches available models via `@google/genai` `ai.models.list()`, filtering for text generation (`generateContent`).
   - Centralized Model Propagation: All 4 coach operations (Hints, Position Explanation, Move Explanation, Dialogue Chat) dynamically resolve the active model via `getActiveModel()`.

4. **Progressive Hint Engine (`generateCoachHint`)**:
   - Three pedagogical hint stages (Stage 1: Direction/Nudge, Stage 2: Tactical Motif, Stage 3: Concrete Idea).
   - Prompt injection resistance: System instructions, chess position data, and user messages are cleanly separated.
   - Non-interference: Hints do NOT increment exercise attempt counters, penalize success rates, or auto-solve puzzles.

5. **Move Quality Classification Matrix (`classifyMoveQuality`)**:
   - Exact Educational Centipawn Loss Thresholds (`best` <= 10 cp, `good` <= 30 cp, `inaccuracy` <= 90 cp, `mistake` <= 200 cp, `blunder` > 200 cp, `brilliant` for sound sacrifices with mover advantage >= +150 cp, `unclassified` for missing evals or depth < 6 ply).

---

---

## 6. Test Arena Architecture & Performance Diagnostics (TASK 07)

1. **Unbiased Assessment Isolation Boundary**:
   - The interactive match arena (`ArenaMatchView`) enforces strict cognitive isolation: AI Coach panel, progressive hints, move recommendations, live evaluation bar, and quality badges are completely suppressed.
   - Operates with local `Stockfish WASM` (`getChessEngine()`) running at calibrated difficulty levels (1–20).
   - High-precision timestamp drift-free clock (`useChessClock`) managing 15+10, 10+0, and 5+0 time controls with increment addition.

2. **Standardized Assessment Protocols**:
   - `Single-Match Diagnostic`: 15+10 classical rapid encounter (`RAPID_15_10`), 1 game, configurable Stockfish difficulty, White/Black/Random color choice.
   - `Five-Game Mastery Battery`: 10+0 rapid encounter (`RAPID_10_0`), 5 consecutive games with alternating colors, session-to-session persistence.
   - `Tactical Speed Assessment`: 5+0 blitz encounter (`BLITZ_5_0`), 1 game testing candidate move generation under severe clock pressure.

3. **Post-Game Client-Side Analysis Engine (`src/features/test-arena/models/analysisEngine.ts`)**:
   - Positional evaluations generated at depth 8+ with client-side Stockfish WASM upon game conclusion.
   - **Mover Perspective Conversion**:
     All centipawn evaluations are converted to mover perspective:
     `evalLossCp = mover === 'w' ? scoreBeforeWhiteCp - scoreAfterWhiteCp : scoreAfterWhiteCp - scoreBeforeWhiteCp`.
   - **Mate Transitions**:
     Safe non-numeric calculations prevent integer overflow on forced mate sequences.
   - **Move Classification Matrix**:
     - `brilliant`: Sacrifice yielding substantial advantage (`scoreAfter >= 200`, `evalLossCp <= 10`).
     - `best`: Engine top choice or `evalLossCp <= 10`.
     - `good`: `evalLossCp <= 35`.
     - `inaccuracy`: `evalLossCp <= 90`.
     - `mistake`: `evalLossCp <= 200`.
     - `blunder`: `evalLossCp > 200`.
     - `unclassified`: Depth < 6 ply.

4. **Performance Metrics & Diagnostic Reporting (`src/features/test-arena/models/metrics.ts`)**:
   - **Average Centipawn Loss (ACPL)**: Sum of centipawn losses divided by player moves count.
   - **Accuracy Formula**: Custom bounded educational heuristic:
     `Accuracy = Math.round(Math.min(100, Math.max(0, 100 * Math.exp(-0.004 * ACPL))))`.
   - **Game Phase Detection**: Opening (ply <= 20 and material >= 62), Middlegame (material > 26), Endgame (material <= 26 or queens absent with minor pieces).
   - **Interactive Game Replay**: Move-by-move replay board previewing each evaluated position and alternative engine lines.
   - **Estimated Skill Range**: Experimental engine-relative educational indicator with explicit disclaimer stating it is NOT an official FIDE rating.

5. **Persistence Schema (`TestArenaStorage`)**:
   - `chess_academy_test_reports_v1`: Array of completed `AssessmentReport` objects.
   - `chess_academy_active_assessment_v1`: Currently active multi-game battery for resume capability.
   - Protected against JSON corruption with automatic recovery.

---

---

## 7. Personalized Learning Engine Architecture (TASK 08)

1. **Evidence Ingestion & Normalization (`EvidenceCollector`)**:
   - Sources: Training Academy interactive exercise attempts (`exercise_passed`, `exercise_failed`), lesson completions, and Test Arena diagnostic assessment matches (`AssessmentReport`).
   - Normalizes evidence points with weights (1.0 for training exercises, 1.5–2.0 for engine-evaluated games/moves).
   - Authoritative chess truth remains anchored in local Stockfish WASM and chess.js; the learning engine evaluates pedagogical patterns without altering engine assessments.
   - Idempotent ingestion prevents duplicate points across storage reloads.

2. **Educational Topic Taxonomy (`topicTaxonomy.ts`)**:
   - Maps all 30 canonical curriculum lessons (`CANONICAL_LESSON_IDS`) with 100% bidirectional synchronization to 10 standardized educational categories:
     - `tactical_patterns`
     - `hanging_pieces_blunders`
     - `checkmate_patterns`
     - `king_safety`
     - `opening_principles`
     - `piece_activity_development`
     - `positional_understanding`
     - `endgame_fundamentals`
     - `calculation_accuracy`
     - `time_management`
   - Automated completeness tests verify zero unmapped, zero stale, and 100% valid dictionary entries against `curriculumData.ts`.

3. **Conservative Performance & Weakness Analysis (`PerformanceAnalyzer`)**:
   - Minimum sample thresholds enforce confidence tiers (`insufficient`, `low`, `moderate`, `high`).
   - **No Weakness on Isolated Errors**: A single mistake or exercise failure is never flagged as a weakness (requires $\ge 2$ verified failures).
   - Severity classification: `potential`, `confirmed`, `repeated`.
   - Mastery states: `insufficient_data`, `developing`, `competent`, `proficient`, `mastered`.
   - Recent trend analysis (`improving`, `regressing`, `stable`) comparing recent 4 samples against earlier history.

4. **Recommendation & Adaptive Sequencing (`RecommendationEngine`)**:
   - Prioritized recommendation generation:
     - Highest Priority: Targeted weakness review of completed lessons or unlocked remedial exercises.
     - Natural Progression: Next unlocked canonical lesson adhering to `CANONICAL_LESSON_IDS`.
     - Diagnostic Checks: Prompting unassisted Test Arena matches when training volume is high but assessment data is missing.
   - Zero Prerequisite Bypass: All recommendations strictly validate against `UnlockEngine.isLessonUnlocked()`.

5. **Persistence Schema (`LearningEngineStorage`)**:
   - Profile persisted locally under `chess_academy_learner_profile_v1`.
   - Safely recovers from malformed or missing JSON by recalculating from source records.

---

## 8. Backend & Cloud Synchronization Architecture (TASK 09)

1. **Authentication Architecture (`src/services/supabase/authService.ts`)**:
   - Supabase Auth SDK integration supporting user registration, email/password login, logout, and session restoration.
   - Non-crashing boundary check: If `!isSupabaseReady()`, returns clean typed error responses without throwing.
   - Reactive event listener `onAuthStateChange` synchronizes app session on sign-in and token refreshes.

2. **Database Security & Row Level Security (RLS) (`supabase/migrations/00002_cloud_synchronization.sql`)**:
   - 100% of user data tables declare `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`:
     - `profiles`: user metadata, board preferences, rating snapshots.
     - `user_academy_progress`: academy levels, completed lessons, exercise attempt counts.
     - `user_lesson_progress`: granular per-lesson state and attempt tallies.
     - `user_activity_history`: activity log items.
     - `test_arena_reports`: complete diagnostic match reports with JSONB results.
     - `learner_profiles`: cached personalized learning profiles.
   - Every table enforces strict user isolation via `auth.uid() = user_id` (or `id`) policies.
   - Cascade deletion: `REFERENCES auth.users(id) ON DELETE CASCADE`.

3. **Deterministic Bidirectional Synchronization Engine (`src/services/supabase/syncService.ts`)**:
   - **Local-First Precedence**: All gameplay, lessons, and tests are saved to `localStorage` immediately. Local data is never wiped or corrupted by network failures.
   - **Deterministic Conflict Resolution Rules**:
     - Completed lessons & modules: Set union (`Array.from(new Set([...local, ...cloud]))`).
     - Exercise attempts: Preserves higher verified count (`Math.max(local, cloud)`).
     - Activity history: Deduplicated by unique `id`, reverse-chronologically sorted, capped at 50 items locally.
     - Test Arena reports: Deduplicated by report `id`, favors `completed` assessments over `in_progress`.
     - Settings & Profile: Last-write-wins based on `updatedAt` / `lastActiveAt`.
     - Learner Profile: Deterministically recomputed on-device via `LearningEngineService.computeProfile()` from merged data and upserted back to cloud.
   - **Offline Handling**: Monitored via `window` online/offline events and `navigator.onLine`. Sync transitions to `'offline'` and pauses gracefully.

4. **Secret Security Boundary**:
   - Gemini API keys and `CONFIG_ENCRYPTION_SECRET` stay on the Node/Express server in `data/provider_config.enc` using AES-256-GCM.
   - Secrets are never persisted to Supabase tables or exposed to client-side scripts.

## 9. Master Task Roadmap Sequence

1. **TASK 01 — Foundation & Project Setup** (COMPLETED)
2. **TASK 02 — Premium UI & Dashboard** (COMPLETED)
3. **TASK 03 — Chess Engine Integration** (COMPLETED)
4. **TASK 04 — Quick Match** (COMPLETED)
5. **TASK 05 — Training Academy** (COMPLETED)
6. **TASK 06 — AI Coach Intelligence** (COMPLETED)
7. **TASK 07 — Test Arena** (COMPLETED)
8. **TASK 08 — Personalized Learning Engine** (COMPLETED)
9. **TASK 09 — Backend & Cloud Synchronization** (COMPLETED)
10. **TASK 10 — Testing & Production** (COMPLETED)

---

## 10. Production Readiness, Bundle Optimization & Security Hardening (TASK 10)

1. **Port Resolution & Container Topology**:
   - Container environments (such as Google Cloud Run) inject `PORT=8080` for Nginx reverse proxy.
   - The application backend (`server.ts`) implements `resolvePort(args, env)`:
     - Strict priority: CLI argument `--port` / `-p` > `APP_PORT` > default `3000`.
     - Explicitly ignores Nginx `PORT=8080` to prevent `EADDRINUSE` port collisions.
   - Development Vite middleware disables WebSocket HMR (`hmr: false`) to avoid port 24678 collisions in containerized sandboxes.
   - `server.ts` execution is guarded with `isMainScript` check (`process.argv[1].endsWith('server.ts')`), allowing helper functions to be imported safely in test runners without triggering server startup.

2. **Bundle Optimization & Route-Level Code Splitting**:
   - Initial monolithic bundle was **1,415 kB**, triggering Rollup chunk size warnings.
   - Code splitting implemented across all 10 feature routes via dynamic `React.lazy()` imports in `src/routes/routes.config.tsx`:
     - `DashboardPage`, `QuickMatchPage`, `TrainingPage`, `LessonRoom`, `TestArenaPage`, `OpeningsPage`, `AnalysisPage`, `ProgressPage`, `ProfilePage`, `SettingsPage`.
   - Global `<Suspense>` wrapper in `src/components/layout/AppLayout.tsx` renders a branded `<LoadingSpinner size="lg" label="Entering Academy Hall..." />`.
   - Function-based `manualChunks(id)` in `vite.config.ts` partitions vendor packages into:
     - `vendor-react`: `react`, `react-dom`, `react-router-dom`
     - `vendor-chess`: `chess.js`, `react-chessboard`
     - `vendor-supabase`: `@supabase/supabase-js`
     - `vendor-state`: `zustand`, `@tanstack/react-query`
   - Initial entry bundle reduced to **180.15 kB (gzip: 50.81 kB)** — an **87% size reduction**.

3. **Production Security Review**:
   - **Secrets Boundary**: `GEMINI_API_KEY` and `CONFIG_ENCRYPTION_SECRET` reside strictly on the server and are never bundled or transmitted to the client.
   - **Storage Encryption**: Custom API keys stored on server filesystem in `data/provider_config.enc` are encrypted with AES-256-GCM authenticated encryption.
   - **Database Security**: 100% of Supabase tables have PostgreSQL Row Level Security (RLS) enabled with strict `auth.uid() = user_id` (or `id`) access policies.
   - **Rate Limiting**: In-memory token bucket rate limiter strictly caps `/api/coach/*` requests to 60 req/min per IP.
   - **Package Vulnerabilities**: `npm audit` confirms **0 vulnerabilities** across all 212 packages.

4. **Production Documentation Suite**:
   - `docs/PRODUCTION_DEPLOYMENT.md`: Hosting architecture, build commands, port resolution, Stockfish WASM serving, and Supabase migrations.
   - `docs/ENVIRONMENT_VARIABLES.md`: Client vs server variable matrix, `VITE_` rules, required secrets, and fallback modes.
   - `docs/VERIFICATION_GUIDE.md`: Step-by-step procedures for automated testing, static analysis, build verification, security audit, and user journeys A–G.

