# Known Issues & Environmental Constraints

## Current Status (Task 04 Completion & Verification Audit)

| Area | Issue / Boundary | Severity | Mitigation / Resolution Plan |
| :--- | :--- | :--- | :--- |
| **Chess Engine Execution** | Stockfish WASM Web Worker integration | **RESOLVED in Task 03** | Dedicated Web Worker with UCI communication, MultiPV segregation, and score perspective normalization. |
| **MultiPV & BestMove Consistency** | Best move / Line 1 leading move agreement | **RESOLVED in Task 03 Audit** | MultiPV 1 strictly isolated from auxiliary lines; lines sorted numerically; Best Move guaranteed consistent with PV Line 1. |
| **Interactive Board Engine** | Quick Match interactive gameplay and clocks | **RESOLVED in Task 04** | Fully playable Quick Match against Stockfish WASM with drag-and-drop, click-to-move, pawn promotion, and precision clock. |
| **Cloud AI Coaching** | Server-side Gemini API adapter unconfigured. | Low (Expected in Task 04) | `UnconfiguredAIAdapter` guards calls with explicit errors. Scheduled for **TASK 06: AI Coach Intelligence**. |
| **Supabase Cloud Sync** | Supabase project is not yet provisioned. | Low (Expected in Task 04) | Safe boundary check returns `null`. Works out-of-the-box in local preview mode. Scheduled for **TASK 09: Backend & Cloud Synchronization**. |
| **Hot Module Replacement (HMR)** | HMR disabled by container policy (`DISABLE_HMR=true`). | Environment | Dev server restarted after code updates. |

---

## Technical Debt & Boundary Guardrails
- **Zero Pseudo-Technical Clutter**: Dashboard remains free of artificial system status badges, mock compiler tags, or telemetry tickers.
- **Strict Scope Separation**: Only Task 01–04 scope implemented; no premature lesson or coach logic added.
- **Purely Optional Credentials**: No credentials required to preview or run the application.
