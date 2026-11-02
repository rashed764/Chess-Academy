# CHESS ACADEMY — Architecture & Technical Specifications

## 1. System Overview & Core Philosophy

CHESS ACADEMY is built as a high-performance, modular chess education platform inspired by prestigious grandmaster salons and luxury chess clubs.

Core Architectural Tenets:
1. **Chess-First Aesthetic Poise**: Minimal, spacious, dark-mode elegance. Eradicates corporate SaaS clutter, neon glows, and candy pills in favor of noble typography (`Cinzel` + `Plus Jakarta Sans`) and gold accents (`#D6B36A`).
2. **Decoupled Engine Intelligence**: Local chess computations (rules, move validation, evaluation) remain strictly separated from presentation and remote AI services.
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
│   ├── training/         # 4-Tier structured academy curriculum & lesson explorer
│   ├── test-arena/       # Diagnostic test arena assessment formats & protocols
│   ├── openings/         # Classical ECO opening reference library
│   ├── analysis/         # Chess study sanctum with FEN & multi-PV preview
│   ├── progress/         # Personal rating trajectory & honors journal
│   ├── profile/          # Member credentials & title aspirations
│   ├── settings/         # Acoustic feedback & board visual assists
│   └── not-found/        # 404 route fallback
├── hooks/                # Custom React hooks (useMediaQuery, etc.)
├── services/
│   ├── ai/               # Provider-independent AI coaching adapters & contracts
│   ├── chess/            # UCI engine adapter, FEN parser, rule utilities
│   └── supabase/         # Safe client factory & database schema types
├── stores/               # Zustand global state (useAppStore)
├── types/                # Domain TypeScript models (chess, user, ai, curriculum)
├── utils/                # Pure utilities (cn, env, formatters, sound)
├── constants/            # Route definitions, theme tokens, chess constants
└── routes/               # Centralized React Router configuration

supabase/
└── migrations/           # PostgreSQL DDL and Row Level Security policies

tests/
└── unit/                 # Pure logic tests executed with node:test & tsx
```

---

## 3. Navigation Architecture

- **Primary Navigation**:
  1. Home (`/`)
  2. Quick Match (`/quick-match`)
  3. Training Academy (`/training`)
  4. Test Arena (`/test-arena`)
  5. Opening Library (`/openings`)
  6. Game Analysis (`/analysis`)
  7. Progress (`/progress`)
- **Secondary Navigation**:
  - Profile (`/profile`)
  - Settings (`/settings`)

---

## 4. Master Task Roadmap Sequence

1. **TASK 01 — Foundation & Project Setup** (COMPLETED)
2. **TASK 02 — Premium UI & Dashboard** (COMPLETED)
3. **TASK 03 — Chess Engine Integration** (NEXT)
4. **TASK 04 — Quick Match**
5. **TASK 05 — Training Academy**
6. **TASK 06 — AI Coach Intelligence**
7. **TASK 07 — Test Arena**
8. **TASK 08 — Personalized Learning Engine**
9. **TASK 09 — Backend & Cloud Synchronization**
10. **TASK 10 — Testing & Production**
