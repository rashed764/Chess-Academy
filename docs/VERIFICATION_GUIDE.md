# CHESS ACADEMY — Verification & Quality Assurance Guide

This guide describes the complete, reproducible verification procedure for auditing Chess Academy before and after deployment.

---

## 1. Automated Test Execution

### 1.1 Unit & Integration Test Suite
Execute the entire test suite using Node.js built-in test runner:
```bash
npm test
```
**Expected Outcome**:
- 17 test files executed.
- 145/145 tests pass (100% pass rate).
- Total duration: ~4–5 seconds.

### 1.2 TypeScript Static Type Checking
Verify all interfaces, components, and service layers:
```bash
npm run lint
```
**Expected Outcome**:
- `tsc --noEmit` exits with code 0 and zero errors or warnings.

### 1.3 Production Build Verification
Test Vite production bundling and asset emission:
```bash
npm run build
```
**Expected Outcome**:
- Rolldown / Vite build completes with zero errors.
- Code-split route chunks generated under `dist/assets/`.
- Total initial JS payload is < 200 KB (gzipped ~50 KB).

### 1.4 Dependency Security Audit
Verify zero known vulnerabilities in third-party packages:
```bash
npm audit
```
**Expected Outcome**:
- `found 0 vulnerabilities`.

---

## 2. End-to-End User Journey Verification

### Journey A: Quick Match (Direct Engine Duel)
1. Navigate to `/quick-match`.
2. Select a time control preset (e.g. 10+0 Rapid) and difficulty tier (Intermediate).
3. Click **Commence Match**.
4. Play 1. e4 (drag-and-drop or click-to-move).
5. Verify:
   - Move indicator dots and sound effects fire.
   - Move history logs "1. e4".
   - Stockfish WASM engine responds with an unassisted legal counter-move within search budget.
   - Clocks decrement without interval drift.

### Journey B: Training Academy & Pedagogical Unlocking
1. Navigate to `/training`.
2. Verify Level 1 ("Absolute Beginner") is active with 6 canonical lessons, and Levels 2–7 are locked.
3. Open Lesson 1 ("The Chessboard, Coordinates, Ranks & Files").
4. Complete study reading, then proceed to the interactive exercise.
5. Attempt an illegal move -> verify error notification and attempt recording without state corruption.
6. Play the correct move -> verify completion banner and progress journal update.
7. Return to `/training` and verify progress increment.

### Journey C: AI Coach Intelligence
1. Navigate to `/settings`.
2. Verify AI Provider Configuration displays masked key (`••••••••••••UR6Q`) and dynamic model selector.
3. Click **Test Connection** -> verify connection probe success.
4. Navigate to `/analysis` or any training lesson.
5. Request a progressive hint (Stage 1 -> Stage 2 -> Stage 3).
6. Verify hints are pedagogical and engine-grounded without overriding Stockfish numerical truth.

### Journey D: Test Arena Assessment
1. Navigate to `/test-arena`.
2. Choose **Single-Match Diagnostic** (15+10) or **5-Game Mastery Battery**.
3. Click **Begin Assessment**.
4. Verify cognitive isolation: zero AI hints, zero evaluation bar, zero quality badges during active play.
5. Complete the game (by checkmate, resignation, or draw).
6. Verify post-game analysis generates:
   - Average Centipawn Loss (ACPL).
   - Custom bounded accuracy percentage.
   - Game phase breakdown (Opening, Middlegame, Endgame).
   - Interactive replay board with engine alternative moves.
   - Explicit disclaimer that the estimated skill range is NOT an official FIDE rating.

### Journey E: Personalized Learning Engine
1. Navigate to `/progress`.
2. Verify **Verified Educational Performance** section displays all 10 educational categories.
3. Verify strengths are detected only with verified samples, and single errors are never flagged as permanent weaknesses.
4. Verify `/training` displays adaptive recommendation cards pointing to unlocked canonical lessons.

### Journey F: Cloud Account & Security Isolation
1. Open the **Sign In** modal from the top navbar.
2. Verify luxury dark modal renders with Sign In / Register tabs and clear local preview notice.
3. Verify password visibility toggle and form validation.
4. Close modal or click "Continue as Guest" -> verify immediate return to local-first mode.

### Journey G: Offline & Corrupted Storage Recovery
1. Set network to offline (`navigator.onLine = false`).
2. Play Quick Match games or complete Training Academy exercises.
3. Verify state saves immediately to browser `localStorage`.
4. Inject corrupted JSON into localStorage key `chess_academy_training_progress_v1`.
5. Reload page -> verify app automatically recovers to safe default state without crashing.

---

## 3. Responsive Viewport Verification Matrix

| Viewport | Dimensions | Target Device | Verification Criteria |
| :--- | :--- | :--- | :--- |
| Desktop | 1440 × 900 | Standard Desktop Monitor | Full sidebar, hero artwork, dual-column cards, zero horizontal scroll. |
| Laptop | 1280 × 800 | MacBook / Laptop | Compact sidebar, balanced margins, readable typography. |
| Tablet | 768 × 1024 | iPad / Tablet Portrait | Collapsed icon navigation, single-column reflow, touch-friendly hit areas. |
| Mobile | 390 × 844 | Modern Smartphone (iPhone) | Mobile hamburger header, full-width touch cards, zero horizontal overflow. |
| Mobile Landscape | 844 × 390 | Smartphone Landscape | Compact navbar, scrollable viewport, unclipped chessboards. |
