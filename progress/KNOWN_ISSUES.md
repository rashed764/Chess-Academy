# Known Issues & Environmental Constraints

## Current Status (Task 09 Backend & Cloud Synchronization Completion)

| Area | Issue / Boundary | Severity | Mitigation / Resolution Plan |
| :--- | :--- | :--- | :--- |
| **Chess Engine Execution** | Stockfish WASM Web Worker integration | **RESOLVED in Task 03** | Dedicated Web Worker with UCI communication, MultiPV segregation, and score perspective normalization. |
| **MultiPV & BestMove Consistency** | Best move / Line 1 leading move agreement | **RESOLVED in Task 03 Audit** | MultiPV 1 strictly isolated from auxiliary lines; lines sorted numerically; Best Move guaranteed consistent with PV Line 1. |
| **Interactive Board Engine** | Quick Match interactive gameplay and clocks | **RESOLVED in Task 04** | Fully playable Quick Match against Stockfish WASM with drag-and-drop, click-to-move, pawn promotion, and precision clock. |
| **Training Academy Curriculum** | 7 levels, interactive exercises & progress tracking | **RESOLVED in Task 05** | 7-level curriculum with 14 modules, pure `chess.js` exercise validator, dual study/exercise lesson room, unlock engine, and local progress journal. |
| **Curriculum Traversal & Ordering** | Level leaps on navigation (`l-504`, `l-604`, `l-704`) | **RESOLVED in Task 05 Recovery** | Explicit `CANONICAL_LESSON_IDS` array guarantees deterministic, symmetrical forward/backward navigation across all 30 lessons. |
| **Exercise Attempt Accounting** | Failed attempts not recorded; success rate skew | **RESOLVED in Task 05 Recovery** | `useExerciseSession` notifies `onAttemptRecorded`; `incorrectExerciseAttempts` and real success rates tracked accurately. |
| **Opponent Move Highlighting** | Counter-moves had no coordinate exposure | **RESOLVED in Task 05 Recovery** | `MoveAttemptResult` exposes `opponentReplyDetails`; `ExerciseBoard` highlights opponent move squares. |
| **Curriculum Type Contracts** | Duplicated diverging interfaces | **RESOLVED in Task 05 Recovery** | `src/types/curriculum.ts` re-exports canonical types from `src/features/training/types.ts`. |
| **Position-Aware Move Matching** | Raw string stripping could misinterpret notations | **RESOLVED in Task 05 Recovery** | `playSanOrUci` and `doesMoveMatchTarget` resolve legal moves against `chess.moves({ verbose: true })`. |
| **Cloud AI Coaching** | Server-side Gemini API integration | **RESOLVED in Task 06** | Express backend `/api/coach` endpoints with Gemini models, rate limiting, FEN validation, 3-stage progressive hints, move classification, and deterministic fallback. |
| **AI Provider & Key Management** | Dynamic provider config & model selection | **RESOLVED in Task 06 Ext** | Encrypted server storage (`data/provider_config.enc`), AES-256-GCM encryption, key masking (`••••1234`), dynamic model discovery via `ai.models.list()`, centralized `getActiveModel()` lookup, and Settings UI. |
| **Test Arena Assessment Mode** | Unbiased evaluation, ACPL, and diagnostic reporting | **RESOLVED in Task 07** | Strict cognitive isolation boundary (zero hints/AI/eval bar during play), post-game Stockfish WASM evaluation at depth 8+, mover-perspective centipawn loss, custom bounded accuracy heuristic, phase breakdown, and local storage recovery. |
| **Personalized Learning Engine** | Evidence synthesis, weakness detection, adaptive recommendations | **RESOLVED in Task 08** | Ingestion of actual training attempts and arena diagnostics, 10 educational categories, conservative weakness thresholds (no weakness on single errors), canonical curriculum integrity, and local persistence. |
| **Curriculum Taxonomy Synchronization** | Divergent lesson IDs in `topicTaxonomy.ts` dropping Level 4–7 evidence | **RESOLVED in Task 08 Remediation** | Synchronized all 14 divergent lesson IDs in `LESSON_TOPIC_MAPPINGS` with `CANONICAL_LESSON_IDS`; added automated dictionary completeness assertions and multi-level ingestion regression tests. |
| **Supabase Cloud Synchronization & Auth** | Cross-device progress persistence and database security | **RESOLVED in Task 09** | Implemented `SupabaseAuthService` (sign-in/up/out/session restore), PostgreSQL migration `00002_cloud_synchronization.sql` with 100% RLS on user tables (`auth.uid() = user_id`), `CloudSyncService` deterministic bidirectional merge (union of lessons, max attempts, activity history deduplication, arena reports merge, on-device learner profile recomputation), TopNavbar/Profile/Settings UI integration, and `SyncStatusBadge`. |
| **In-Memory Rate Limiter Boundary** | Token bucket is in-memory per Node process. | Architectural Limitation | State resets on server restart and is not shared across multi-node clusters. Acceptable for single-instance applet. |
| **Container LLM Egress / Credentials** | External API egress or missing API key in container environment. | Environmental Boundary | Guarded with 10-second timeout and high-fidelity deterministic local fallback (`source: 'local_fallback'`). App remains 100% operational offline. |
| **Gemini AbortSignal SDK Semantics** | AbortSignal in @google/genai SDK is a client-only operation | Client SDK Boundary | Aborting client wait cancels server HTTP socket reading to prevent thread blocking, but does not guarantee remote Google service cancellation. Timed-out requests resolve immediately to deterministic fallback without retrying. |
| **Hot Module Replacement (HMR)** | HMR disabled by container policy (`DISABLE_HMR=true`). | Environment | Dev server restarted after code updates. |

---

## Technical Debt & Boundary Guardrails
- **Zero Pseudo-Technical Clutter**: UI remains strictly chess-first without artificial telemetry, mock compiler badges, or synthetic rating awards.
- **Accurate Chess Integrity**: No fabricated FIDE accreditation, master titles, or guaranteed progression promises. Stockfish WASM and chess.js are the sole authority for chess truth.
- **Local-First Cross-Device Parity**: All local features (Quick Match, Training Academy, Test Arena, AI Coach, Personalized Learning Engine) remain 100% functional without an account or when offline. Cloud sync activates seamlessly when credentials are configured.
- **Purely Optional Credentials**: No credentials required to preview or run the application. Deterministic local fallbacks provide full functionality even without custom credentials.
