# CHESS ACADEMY — Production Deployment & Operations Guide

## 1. System Architecture Overview

Chess Academy is engineered as a production-grade, full-stack chess educational platform:
- **Frontend**: React 19 Single Page Application (SPA) bundled via Vite with route-level code splitting and manual vendor chunking.
- **Backend**: Node.js 22 Express server (`server.ts`) providing secure server-side AI Coach APIs (`/api/coach/*`), dynamic model discovery, AES-256-GCM encrypted credential storage, token-bucket rate limiting, and static SPA serving in production mode.
- **Local Engine**: Stockfish 10 WASM running in an isolated browser Web Worker, providing authoritative chess truth (evaluations, mate scores, move legality) without placing heavy calculation loads on the server.
- **Cloud Database & Auth**: Supabase PostgreSQL featuring 100% Row Level Security (RLS) and bidirectional deterministic synchronization.
- **Local-First Resilience**: All features (Quick Match, Training Academy, Test Arena, Personalized Learning Engine) operate offline with zero external cloud dependencies required.

---

## 2. Infrastructure & Hosting Selection

### Recommended Hosting Providers
- **Google Cloud Run (Recommended)**: Containerized deployment using standard Node.js 22 runtime. Automatically scales with traffic while maintaining proxy headers and environment boundaries.
- **Render / Railway / Fly.io / AWS ECS**: Fully compatible with the long-running Express server and ephemeral or attached persistent volume storage for `/data/provider_config.enc`.

### Architecture Compatibility Note on Serverless Hosts (e.g. Vercel)
The current architecture utilizes an Express backend (`server.ts`) that serves both the compiled frontend assets (`dist/`) and authenticated server-side API proxy endpoints. While the frontend can be deployed as a static site to Vercel/Netlify, the full-stack features (AI Coach proxy, encrypted API key persistence, token bucket rate limiter) require a persistent Node.js runtime or adaptation into serverless functions (`/api/[...route]`). For zero-refactor production deployment, a Node.js container or PaaS host is the recommended deployment target.

---

## 3. Production Build & Execution

### Prerequisites
- Node.js 22.x LTS
- npm 10.x or higher

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Build Production Frontend Assets
```bash
npm run build
```
This compiles the TypeScript code, executes Vite asset optimization, generates code-split chunks in `dist/`, and validates chunk budgets.

### Step 3: Launch Production Server
```bash
npm start
```
By default, this executes `node server.ts` (with `--import tsx` bootstrapping) or `tsx server.ts`.

---

## 4. Port & Network Configuration

- **Default Port**: Port `3000` (`0.0.0.0:3000`).
- **Container Port Isolation**: In Cloud Run or Nginx environments where `PORT=8080` is assigned to the reverse proxy, `server.ts` automatically ignores `8080` and binds to internal application port `3000` to prevent `EADDRINUSE` port collision.
- **Custom Ports**: Pass `--port <PORT>` CLI flag or set `APP_PORT=<PORT>`.
- **Reverse Proxy Support**: Express enables `app.set('trust proxy', 1)` to correctly inspect client IPs from `X-Forwarded-For` headers behind load balancers.
- **Payload Limits**: Strict `200kb` request body limit to prevent memory exhaustion and denial-of-service vectors.
- **Rate Limiting**: Built-in token bucket limiter allowing 60 requests/minute per client IP with burst capacity of 60.

---

## 5. Stockfish WASM & Static Assets

Stockfish assets are located in the `public/stockfish/` directory:
- `stockfish.js` (JavaScript engine loader)
- `stockfish.wasm` (Compiled WebAssembly engine, 546 KB)
- `stockfish.wasm.js` (WebAssembly wrapper)

In production, Express serves these files directly from `dist/stockfish/` or `public/stockfish/` with standard MIME types (`application/wasm`, `text/javascript`).

---

## 6. Supabase Database Deployment

When connecting a live Supabase project, execute the PostgreSQL migrations in sequential order using the Supabase SQL Editor or Supabase CLI:

1. **Migration 1 (`supabase/migrations/00001_initial_schema.sql`)**:
   - Creates `profiles`, `games`, `lesson_progress`, `arena_evaluations`.
   - Enables Row Level Security on all initial tables.
2. **Migration 2 (`supabase/migrations/00002_cloud_synchronization.sql`)**:
   - Extends `profiles` with board and acoustic preferences.
   - Creates `user_academy_progress`, `user_lesson_progress`, `user_activity_history`, `test_arena_reports`, `learner_profiles`.
   - Enforces 100% RLS on all user data tables with `auth.uid() = user_id` (or `id`) across SELECT, INSERT, UPDATE, and DELETE.
   - Applies foreign key cascades to `auth.users(id) ON DELETE CASCADE`.
   - Creates performance B-tree indexes on all query paths.

---

## 7. Gemini Provider & Key Security

- **Server-Only Containment**: `GEMINI_API_KEY` is loaded strictly on the Node.js backend and is never bundled in frontend code or transmitted to the browser.
- **Encrypted Storage (`data/provider_config.enc`)**: When custom API keys are saved through the Settings UI, they are stored on disk using AES-256-GCM authenticated encryption.
- **Production Secret Requirement**: In `NODE_ENV=production`, `CONFIG_ENCRYPTION_SECRET` MUST be set to a strong external secret (min 32 characters). The fallback development seed is strictly forbidden in production and will fail closed on startup to protect user credentials.
- **Key Masking**: Keys are rendered in masked format (`••••••••••••1234`) in status endpoints.

---

## 8. Health Checks & Monitoring

- **Health Endpoint**: `GET /api/health`
  - Response: `{"status": "ok", "time": "2026-11-07T..."}` (HTTP 200)
- **AI Provider Status**: `GET /api/coach/config`
  - Returns configuration status and masked key without sensitive payload.

---

## 9. Troubleshooting & Common Operational Errors

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `EADDRINUSE 0.0.0.0:8080` | Port collision with outer proxy | Resolved in `server.ts` via `resolvePort()`. Ensure app runs on port 3000. |
| `FATAL: Production environment requires an externally supplied CONFIG_ENCRYPTION_SECRET` | Missing encryption key in production | Set `CONFIG_ENCRYPTION_SECRET` in environment variables. |
| `Refusing to overwrite existing encrypted configuration` | Data file decryption mismatch | Secret key changed. Restore original `CONFIG_ENCRYPTION_SECRET` or clear `data/provider_config.enc`. |
| Supabase `401 Unauthorized` | Missing or invalid Supabase keys | Application automatically falls back to local-first mode. Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |
| 429 Too Many Requests | Rate limit exceeded | Token bucket replenishes 1 token per second up to 60 tokens. |
