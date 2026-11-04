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
│   ├── settings/         # Acoustic feedback & board visual assists
│   └── not-found/        # 404 route fallback
├── hooks/                # Custom React hooks (useMediaQuery, etc.)
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
├── stores/               # Zustand global state (useAppStore)
├── types/                # Domain TypeScript models (chess, user, ai, curriculum)
├── utils/                # Pure utilities (cn, env, formatters, sound)
├── constants/            # Route definitions, theme tokens, chess constants
└── routes/               # Centralized React Router configuration

public/
└── stockfish/            # Static Stockfish WASM distribution
    ├── stockfish.wasm    # 546KB WASM engine binary
    ├── stockfish.wasm.js # Web Worker WASM loader
    ├── stockfish.js      # asm.js fallback
    └── Copying.txt       # GNU GPL v3 license

supabase/
└── migrations/           # PostgreSQL DDL and Row Level Security policies

tests/
└── unit/                 # Pure logic tests executed with node:test & tsx
    ├── adapters.test.ts
    ├── curriculum.test.ts # Level validation, ExerciseValidator, UnlockEngine, ProgressStorage
    ├── env.test.ts
    ├── fen.test.ts
    ├── formatters.test.ts
    ├── quickMatch.test.ts
    ├── sound.test.ts
    └── uci.test.ts
```

---

## 3. Chess Engine Architecture & MultiPV Design

### Engine Specifications
- **Engine**: Stockfish WASM (compiled via Emscripten by Niklas Fiekas and official Stockfish contributors, package `stockfish.js@10.0.2`).
- **License**: GNU General Public License v3 (GPLv3).
- **Assets**: Single-threaded WASM (`stockfish.wasm`, 546KB) paired with `stockfish.wasm.js` loader; served statically from `public/stockfish/`.
- **Worker Execution**: Instantiated via dedicated `new Worker('/stockfish/stockfish.wasm.js')` so all intensive branch pruning, minimax evaluations, and hash lookups occur entirely off the main UI thread.

### MultiPV Aggregation & Consistency Guarantee
- **Segregation**: MultiPV auxiliary lines (`multipv 2`, `multipv 3`, etc.) are aggregated into `_multiPvMap` and sorted strictly by multipv index.
- **Top Move Protection**: `evaluation.depth`, `evaluation.scoreCentipawns`, `evaluation.mateInMoves`, and `evaluation.bestMoveUci` are strictly populated from `multipv === 1` and never overwritten by auxiliary lines.
- **Best Move Alignment**: The engine's final `bestmove` token is enforced as the authoritative move and guaranteed to match the leading move of Line 1.

---

## 4. Training Academy Architecture (Task 05)

### Curriculum Hierarchy
```
Level (7 levels: Absolute Beginner to Grandmaster Preparation)
 └── Module (14 pedagogical modules across levels)
      └── Lesson (Didactic lessons with conceptual foundation & key takeaways)
           └── Exercise (Interactive chess board challenge with chess.js validation)
```

### Models & Logic Separation
1. **`ExerciseValidator` (`src/features/training/models/exerciseValidator.ts`)**:
   - Pure, headless domain validator wrapping `chess.js`.
   - Validates legal moves against target solutions using position-aware legal move resolution (`playSanOrUci` and `doesMoveMatchTarget`).
   - Supports both SAN and UCI coordinate notation matched against verbose legal moves from `chess.js`.
   - Exposes `OpponentReplyDetails` (`from`, `to`, `san`, `uci`) on counter-moves for board square highlighting.
   - Generates typed `playerMoveRecord` and `opponentMoveRecord` with before/after FEN and move parameters.
   - Supports multi-move puzzles by progressing through steps, automatically executing opponent counter-moves, and validating the final refutation.
   - Allows acceptable alternative moves (`alternativeMoves`).
2. **`UnlockEngine` & Canonical Progression (`src/features/training/models/unlockEngine.ts`, `data/index.ts`)**:
   - Governs progression access rules.
   - Level 1 is unconditionally unlocked. Level N+1 requires completed lessons in Level N (`minCompletedLessonsRequired`).
   - Explicit `CANONICAL_LESSON_IDS` array (30 lessons in exact pedagogical order across 7 levels and 14 modules) guarantees deterministic, symmetrical `getNextLesson` and `getPreviousLesson` traversal.
   - Lessons within an unlocked level unlock sequentially (or remain accessible once completed).
3. **`ProgressStorage` (`src/features/training/models/progressStorage.ts`)**:
   - Manages LocalStorage synchronization (`chess_academy_training_progress_v1`).
   - Tracks both successful and failed exercise attempts (`totalExerciseAttempts`, `incorrectExerciseAttempts`).
   - Dynamically calculates accurate mathematical success rates (`(total - incorrect) / total * 100`).
   - Logs timestamped learning activities (`exercise_completed`, `exercise_failed`, `lesson_completed`) into an auditable activity history journal with idempotency protection against duplicate spam.
4. **Unified Type Contracts (`src/types/curriculum.ts` & `src/features/training/types.ts`)**:
   - `src/features/training/types.ts` is the single source of truth for curriculum, exercise, and progress data structures.
   - `src/types/curriculum.ts` serves as a clean re-export facade with downstream interfaces (`ArenaEvaluationReport`, `UserLessonProgress`) preventing circular dependencies or type duplication.
5. **Session State & Real-Time Move History (`src/features/training/hooks/useExerciseSession.ts`)**:
   - Maintains `moveHistorySan: string[]` and `moveHistory: MoveRecord[]` tracking every half-move in the exercise session.
   - Exposes `lastMove` containing player move or opponent reply coordinates `{ from, to }` for board square highlighting.
   - Notifies parent components via `onAttemptRecorded` callback with `ExerciseAttemptNotification` on every correct, incorrect, or illegal attempt.


---

## 5. AI Coach Intelligence Architecture (TASK 06)

1. **Hybrid Architecture Principle**:
   - **Stockfish WASM + chess.js = Chess Truth**: Engine calculations, numerical centipawn evaluations, forced mate detection, and move legality are strictly authoritative. The LLM never declares best moves or evaluations without Stockfish verification.
   - **Google GenAI (Gemini 3.8 Flash via `@google/genai`) = Educational Explanation**: Generates nuanced explanations, tactical breakdowns, and progressive hints.
2. **Server-Side Security & Rate Limiting (`src/server/`)**:
   - Express server (`server.ts`) hosting API routes at `/api/coach`.
   - `GEMINI_API_KEY` is loaded strictly on the server and is never sent to the browser or exposed in client bundles.
   - Per-IP in-memory token bucket rate limiter (60 requests/minute) protects against endpoint abuse.
   - Strict input validation via `src/server/validators.ts`: FEN validation using `chess.js`, move legality checking, hint stage restriction (1, 2, 3), and text length bounds.
3. **Progressive Hint Engine (`generateCoachHint`)**:
   - Three pedagogical hint stages:
     - **Stage 1 (Direction/Nudge)**: Points to relevant board sector or piece vulnerability without naming pieces or moves.
     - **Stage 2 (Tactical Motif)**: Explains the underlying tactical motif (pin, fork, skewer, deflection) and why it works.
     - **Stage 3 (Concrete Idea)**: Directs calculation to forcing candidate moves and key squares.
   - Protected against prompt injection by separating system instructions from untrusted user text.
   - Does NOT increment exercise attempt counters or auto-solve puzzles.
4. **Move Quality Classification (`classifyMoveQuality`)**:
   - Compares centipawn evaluations before and after moves from the active mover's perspective.
   - 7 canonical tiers: `brilliant` (sound tactical sacrifices), `best` (loss <= 10 cp or matches engine best move), `good` (loss <= 30 cp), `inaccuracy` (loss <= 90 cp), `mistake` (loss <= 200 cp), `blunder` (loss > 200 cp or mate blunder), and `unclassified` (when evaluation is pending).
5. **Deterministic Local Fallback**:
   - When offline or when `GEMINI_API_KEY` is unconfigured, all endpoints return high-quality deterministic responses derived genuinely from exercise data, tagged with `source: 'local_fallback'`.

---

## 6. Master Task Roadmap Sequence

1. **TASK 01 — Foundation & Project Setup** (COMPLETED)
2. **TASK 02 — Premium UI & Dashboard** (COMPLETED)
3. **TASK 03 — Chess Engine Integration** (COMPLETED)
4. **TASK 04 — Quick Match** (COMPLETED)
5. **TASK 05 — Training Academy** (COMPLETED)
6. **TASK 06 — AI Coach Intelligence** (COMPLETED)
7. **TASK 07 — Test Arena** (NEXT)
8. **TASK 08 — Personalized Learning Engine**
9. **TASK 09 — Backend & Cloud Synchronization**
10. **TASK 10 — Testing & Production**

