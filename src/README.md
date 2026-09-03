# iKan Mental Health PWA

A comprehensive, multi-tenant mental wellness Progressive Web App built with React 18, TypeScript, Tailwind CSS v4, and Supabase.

### 🌟 Current State
- ✅ Wired up LearningDiary.tsx
- ✅ Migrated fully to Tailwind v4 @theme directives (globals.css)
- ✅ Removed dead tailwind.config.ts and legacy PostCSS references
- ✅ Cleaned up references in docs and tsconfig
- 🔜 Next up: consultation listing flow, mood journal emoji scales, and notification template editor CRUD

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

See [Getting Started](docs/GETTING-STARTED.md) for full setup instructions.

---

## Documentation

| Document | Description |
|----------|------------|
| [Architecture](docs/ARCHITECTURE.md) | Tech stack, three-tier architecture, data flow, auth, routing, PWA |
| [Getting Started](docs/GETTING-STARTED.md) | Prerequisites, setup, environment config, available scripts |
| [Project Structure](docs/PROJECT-STRUCTURE.md) | Complete directory layout with every component, hook, and module |
| [Backend Guide](docs/BACKEND-GUIDE.md) | Hono server, KV store, auth middleware, route modules, debugging, full route-by-route API reference |
| [Contributing](docs/CONTRIBUTING.md) | Code conventions, branch strategy, auth patterns, pre-push checklist |
| [Deployment](docs/DEPLOYMENT.md) | Vercel + Supabase deployment, CI/CD pipeline, rollback, monitoring |
| [Changelog](../CHANGELOG.md) | Dated record of what shipped |
| [Pending](../PENDING.md) | Outstanding work, known defects, items blocked on you |
| [Design System](guidelines/Guidelines.md) | Colors, typography, spacing, component guidelines, accessibility |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Radix UI |
| Animation | Motion (motion/react) |
| Backend | Supabase Edge Functions (Deno + Hono) |
| Database | Supabase Postgres (KV store pattern) |
| Auth | Supabase Auth (email/password + social login) |
| Storage | Supabase Storage (private buckets) |
| Deployment | Vercel (frontend) + Supabase (backend) |
| CI/CD | GitHub Actions |

---

## Key Features

- **Assessments** - Mental health screening tools. GAD-7 and the GAD-2/PHQ-2 screens are used unmodified; the depression assessment is PHQ-9-*derived* — its item 9 carries softened wording, so its cut-offs are not validated thresholds. See `src/docs/assessments/depression.md`.
- **Equip Programs** - Structured multi-day wellness programs with progress tracking
- **Mood Journal** - Daily mood logging with emotion tracking
- **Resource Library** - Curated mental health articles and resources
- **Consultation** - Professional consultant directory with booking
- **Admin Panel** - Full CMS, user management, analytics, and system monitoring
- **PWA** - Installable, offline-capable, push notifications
- **RBAC** - Role-based access control (user/admin)

---

## Project Structure (Summary)

```
/App.tsx                    # Entry point (manual routing, providers)
/components/                # All React components
  /screens/                 # Full-page screen components
  /admin/                   # Admin panel components
  /blocks/                  # Reusable content blocks
  /navigation/              # Navigation components
  /ui/                      # Base UI primitives (Radix)
/contexts/                  # Auth, Notification, Payment, Journey
/hooks/                     # Custom React hooks
/lib/                       # API client, types, configs, utilities
/supabase/functions/server/ # Hono backend (route modules + services)
/styles/                    # Global CSS + design tokens
/docs/                      # Developer documentation
```

---

## Development

```bash
npm run dev              # Start dev server
npm run type-check       # TypeScript strict mode check
npm run lint             # ESLint (zero-warning policy)
npm run build            # Production build
npm run supabase:deploy  # Deploy edge function
npm run supabase:logs    # View server logs
```

---

## License

MIT