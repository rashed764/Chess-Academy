# Known Issues & Environmental Constraints

## Current Status (Task 02 Completion)

| Area | Issue / Boundary | Severity | Mitigation / Resolution Plan |
| :--- | :--- | :--- | :--- |
| **Chess Engine Execution** | Stockfish WASM Web Worker is not yet active. | Low (Expected in Task 02) | `UnconfiguredChessEngineAdapter` provides typed UCI interface and throws clear pending errors. Scheduled for full implementation in **TASK 03: Chess Engine Integration**. |
| **Interactive Board Engine** | Chessground board interactive moves not yet wired. | Low (Expected in Task 02) | UI views provide tournament calibration, time control selection, and curriculum exploration without faking moves. Board mounting is scheduled for **TASK 03 & TASK 04**. |
| **Cloud AI Coaching** | Server-side Gemini API adapter unconfigured. | Low (Expected in Task 02) | `UnconfiguredAIAdapter` guards calls with explicit errors. Scheduled for **TASK 06: AI Coach Intelligence**. |
| **Supabase Cloud Sync** | Supabase project is not yet provisioned. | Low (Expected in Task 02) | Safe boundary check returns `null`. Works out-of-the-box in local preview mode. Scheduled for **TASK 09: Backend & Cloud Synchronization**. |
| **Hot Module Replacement (HMR)** | HMR disabled by container policy (`DISABLE_HMR=true`). | Environment | Dev server restarted after code updates. |

---

## Technical Debt & Boundary Guardrails
- **Zero Pseudo-Technical Clutter**: Dashboard is free of artificial system status badges, mock compiler tags, or telemetry tickers.
- **Strict Scope Separation**: All six module views provide rich, authentic chess club context and functional configuration without simulating fake gameplay or falsified engine evaluations.
- **Purely Optional Credentials**: No credentials required to preview or run the application.
