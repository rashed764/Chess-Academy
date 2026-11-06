# Task 06 — Dynamic Gemini Provider Configuration & AI Model Management

Comprehensive architectural blueprint and implementation plan for extending Chess Academy's Task 06 AI Coach with dynamic Gemini API provider configuration, encrypted server-side credential storage, dynamic model discovery, and settings interface.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the key implementation decisions during Turn 1 clarification questions:

- **Confirmed Decision 1 (Storage Location & Security)**: Encrypted server configuration file located in the application data directory (`/app/applet/data/provider_config.enc`), using Node.js native `crypto` AES-256-GCM encryption with server-managed key derivation. Raw API keys will **never** be sent to the browser or stored unencrypted.
- **Confirmed Decision 2 (Model Filtering & UI Display)**: Filter dynamically fetched Gemini models from `ai.models.list()` for text generation capability (`generateContent`). Display friendly display names alongside model IDs in the dropdown selection (e.g. `Gemini 3.8 Flash (gemini-3.8-flash)`).

---

## 1. Overview & Core Concept

### What It Does
Provides full administrator and user control over the AI Coach backend by adding a dedicated **AI Provider Configuration** section within the existing `/settings` interface. Users can inspect provider status, set or update their custom Gemini API Key, mask and remove stored credentials, test live connection status, discover available text models dynamically via the official `@google/genai` SDK, and select an active model that immediately updates all AI Coach features (Progressive Hints, Position Explanations, Move Explanations, and Conversational Dialogue).

### Target Audience & Value
Chess Academy students and instructors who wish to select specific Gemini model tiers (e.g. standard `gemini-3.8-flash` vs high-reasoning `gemini-4-argon`) or provide their own API credentials while maintaining full local fallback and engine-authoritative analysis when unconfigured or offline.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Navigating to AI Provider Settings**: User opens Settings (`/settings`). A new luxury dark card "AI Provider Configuration" is presented beneath sound and theme preferences.
2. **Key Entry & Masked Display**: User enters a Gemini API key. The input supports password masking with a toggle eye icon. Clicking **Save Credentials** encrypts and persists the key server-side. Once saved, the UI updates to show status `Configured` with a masked view (`••••••••••••1234`).
3. **Connection Testing**: Clicking **Test Connection** sends a backend validation probe. The UI presents an immediate status badge: green checkmark `Connected` with response latency or red badge `Invalid Key / Service Error` with user-friendly error guidance.
4. **Dynamic Model Selection**: User clicks **Refresh Models** or selects from the dropdown list. The dropdown displays friendly names and model IDs fetched from Google's API (e.g. `Gemini 3.8 Flash (gemini-3.8-flash)`, `Gemini 4 Argon (gemini-4-argon)`). Choosing a model updates the active selection instantly across all 4 coach operations without restarting the server.
5. **Credential Removal & Reset**: Clicking **Remove Key** prompts a confirmation badge, clears server storage, and seamlessly reverts the AI Coach to local deterministic Stockfish fallback mode.

### Visual Identity & Theme
- **Theme Consistency**: Seamlessly matches Chess Academy's rich dark chess master aesthetic (`bg-zinc-950`, `border-zinc-800`, `zinc-900/50` backdrop blur, emerald/amber status accents).
- **Typography & Inputs**: Monospace font for key masking (`font-mono`), polished focus rings (`focus:ring-2 focus:ring-emerald-500/50`), clear action buttons with subtle loading spinners (`Lucide-react` icons: `Key`, `RefreshCw`, `CheckCircle2`, `XCircle`, `Eye`, `EyeOff`, `Trash2`, `Cpu`).

---

## 3. Key Product Decisions & Trade-Offs

- **Encrypted Server-Side Storage (`crypto` AES-256-GCM)**
  - *Chosen Approach*: Server writes encrypted payload to `/app/applet/data/provider_config.enc` using a machine-derived secret key.
  - *Why*: Eliminates client-side key leakage, protects against filesystem inspection, and persists settings across server restarts.
  - *Alternatives Considered*: Browser `localStorage` (rejected: exposes key to client JS and XSS), unencrypted `.json` (rejected: insecure).

- **Centralized Model Resolution in `geminiClient.ts`**
  - *Chosen Approach*: Replace hardcoded `COACH_MODEL = 'gemini-3.8-flash'` with dynamic resolution function `getActiveModel()`, reading from server config with default fallback to `gemini-3.8-flash`.
  - *Why*: Guarantees all 4 coach operations (Hints, Position, Move, Chat) automatically use the user-selected model without code duplication.

- **Hybrid Truth Guardrails Preserved**
  - *Chosen Approach*: Stockfish WASM + `chess.js` remain the single source of truth for move evaluations, evaluation scores, mate counts, and legal moves. Gemini only formats natural language coaching explanations.
  - *Why*: Guarantees chess accuracy regardless of which Gemini model is selected or if AI generation fails.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CHESS ACADEMY CLIENT                          │
│                                                                        │
│  ┌────────────────────────┐         ┌───────────────────────────────┐  │
│  │     SettingsPage UI    │         │          CoachPanel           │  │
│  │ (AI Provider Section)  │         │  (Hints / Explain / Chat)     │  │
│  └───────────┬────────────┘         └───────────────┬───────────────┘  │
└──────────────┼──────────────────────────────────────┼──────────────────┘
               │ HTTP REST (/api/coach/config/*)     │ HTTP REST (/api/coach/*)
┌──────────────▼──────────────────────────────────────▼──────────────────┐
│                          EXPRESS BACKEND ENGINE                        │
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │      coachRouter      │────────────>│        coachService        │  │
│  │ (/api/coach/config)   │             │   (Hints, Position, Chat)  │  │
│  └───────────┬───────────┘             └─────────────┬──────────────┘  │
│              │                                       │                 │
│              ▼                                       ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     geminiClient & configManager                 │  │
│  │  - AES-256 Encrypted Storage: /app/applet/data/provider_config.enc│  │
│  │  - Active Model Resolver: getActiveModel()                       │  │
│  │  - Key Masking & Gemini SDK Instance Factory                     │  │
│  └───────────────────────────┬──────────────────────────────────────┘  │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │ SDK Calls (ai.models.list / generateContent)
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       GOOGLE GEMINI API ENDPOINT                       │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & File Blueprint
1. **Server Storage Module (`src/server/configManager.ts`)**:
   - AES-256-GCM cipher read/write helper managing `/app/applet/data/provider_config.enc`.
   - In-memory configuration cache (`apiKey`, `activeModelId`, `updatedAt`).
   - Exported methods: `getConfig()`, `saveApiKey(key)`, `removeApiKey()`, `setActiveModel(modelId)`, `getMaskedKey()`.

2. **Gemini Client Integration (`src/server/geminiClient.ts`)**:
   - Updates `getGeminiClient()` to read active API key from `configManager` (falling back to `process.env.GEMINI_API_KEY`).
   - Updates `getActiveModel()` to return configured model ID (defaulting to `'gemini-3.8-flash'`).
   - Implements `listAvailableModels()` using `ai.models.list()`, filtering models where `supportedActions` / `supportedGenerationMethods` includes `generateContent`.

3. **Express Config Router (`src/server/coachRouter.ts`)**:
   - `GET /api/coach/config`: returns `{ configured: boolean, maskedKey: string, activeModelId: string }`.
   - `POST /api/coach/config/key`: validates key format, persists to encrypted storage, returns status.
   - `DELETE /api/coach/config/key`: removes key and encrypted storage file.
   - `POST /api/coach/config/test`: executes lightweight `ai.models.list()` or test probe with the key.
   - `GET /api/coach/config/models`: lists filtered models with friendly names and IDs.
   - `POST /api/coach/config/model`: saves selected `activeModelId`.

4. **Frontend API & State Integration**:
   - Update `src/services/ai/coachClient.ts` with config helper methods (`fetchAIConfig`, `saveAIKey`, `removeAIKey`, `testAIConnection`, `fetchAIModels`, `setActiveAIModel`).
   - Update `src/features/settings/SettingsPage.tsx` with high-fidelity AI Provider Configuration card.

5. **Automated Unit Tests**:
   - `tests/unit/configManager.test.ts`: Test encryption, decryption, key masking, persistence, and invalid key handling.
   - Extend `tests/unit/coach.test.ts`: Verify model selection propagation across hint generation, position explanation, and fallback logic.

---

## 5. Implementation Sequence

1. **Step 1**: Create `src/server/configManager.ts` with AES-256 encryption and storage file management.
2. **Step 2**: Refactor `src/server/geminiClient.ts` to utilize dynamic key lookup and model listing.
3. **Step 3**: Add API endpoints to `src/server/coachRouter.ts` for config status, key management, test connection, model listing, and model selection.
4. **Step 4**: Update `src/server/coachService.ts` to consume `getActiveModel()` for all 4 AI coach functions.
5. **Step 5**: Extend `src/services/ai/coachClient.ts` with client-side API methods.
6. **Step 6**: Build AI Provider Configuration UI component in `src/features/settings/SettingsPage.tsx`.
7. **Step 7**: Write comprehensive unit tests in `tests/unit/configManager.test.ts` and verify existing test suite (`npm test`).
8. **Step 8**: Validate syntax and linting (`tsc --noEmit`, `npm run lint`) and verify server execution.
