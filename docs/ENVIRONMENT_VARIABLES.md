# CHESS ACADEMY — Environment Variables Reference

This document provides a comprehensive guide to all configuration and environment variables used by Chess Academy.

---

## 1. Environment Variable Summary

| Variable Name | Exposure | Required in Prod? | Required in Dev? | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Server | **Yes** (`production`) | Optional (`development`) | Runtime environment mode. Controls error verbosity, Vite middleware vs static dist serving, and encryption enforcement. |
| `PORT` | Server | Optional | Optional | Server port. In container environments where `PORT=8080` is reserved for Nginx, `server.ts` cleanly binds to port 3000. |
| `APP_PORT` | Server | Optional | Optional | Explicit application port override (e.g. `3000`). |
| `CONFIG_ENCRYPTION_SECRET` | Server-Only Secret | **Yes** (in production) | Optional (dev seed used) | 32+ character secret used to derive the AES-256-GCM encryption key for `data/provider_config.enc`. Fails closed if missing in production. |
| `GEMINI_API_KEY` | Server-Only Secret | Optional | Optional | Google Gemini API key for server-side AI Coach features. Can also be configured dynamically in the Settings UI. |
| `VITE_APP_ENV` | Client (Browser) | Optional | Optional | Defaults to `'development'`. Set to `'production'` in production builds. |
| `VITE_ENABLE_ANALYTICS` | Client (Browser) | Optional | Optional | Defaults strictly to `false`. Set to `'true'` only when external analytics integration is configured. |
| `VITE_SUPABASE_URL` | Client (Browser) | Optional | Optional | Public HTTPS URL for your Supabase project (e.g., `https://xyzcompany.supabase.co`). When omitted, app runs in local offline mode. |
| `VITE_SUPABASE_ANON_KEY` | Client (Browser) | Optional | Optional | Public anonymous JWT key (`anon` key) for Supabase client initialization. When omitted, app runs in local offline mode. |
| `DISABLE_HMR` | Dev Server | Optional | Optional | When set to `'true'`, disables Vite file watchers and WebSocket HMR in AI Studio container environments. |

---

## 2. Security Boundaries & Golden Rules

1. **Never Expose Server Secrets to the Client**:
   - Variables prefixed with `VITE_` are embedded into client JavaScript bundles by Vite at build time.
   - `GEMINI_API_KEY` and `CONFIG_ENCRYPTION_SECRET` MUST NEVER be prefixed with `VITE_`.
   - The Supabase Service Role Key (`service_role`) MUST NEVER be added to `.env` or client bundles.

2. **Purely Optional Cloud Credentials**:
   - The absence of `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` will NEVER cause application crashes or startup errors.
   - The system detects unconfigured credentials and seamlessly activates local-first browser storage mode.

3. **Production Encryption Secret Requirements**:
   - In production (`NODE_ENV=production`), `CONFIG_ENCRYPTION_SECRET` is strictly required.
   - Using the hardcoded development seed `chess-academy-gemini-provider-secret-v1` in production is rejected by `getEncryptionKey()`, throwing a fatal error to prevent insecure credential storage.

---

## 3. Example Configuration File (`.env.example`)

```bash
# Server-Side Encryption Secret (Required in production)
CONFIG_ENCRYPTION_SECRET=

# Server-Side Google Gemini API Key (Optional; can be set via Settings UI)
GEMINI_API_KEY=

# Client Application Mode ('development' | 'production')
VITE_APP_ENV=development

# Telemetry / Analytics toggle (default: false)
VITE_ENABLE_ANALYTICS=false

# Supabase Cloud Project URL (Optional)
VITE_SUPABASE_URL=

# Supabase Anonymous Client Key (Optional)
VITE_SUPABASE_ANON_KEY=
```
