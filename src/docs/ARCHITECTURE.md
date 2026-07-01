# iKan Health — Architecture Overview

> **Last updated**: July 2026
> **Audience**: All developers contributing to iKan

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | React 18.3.1, TS 5 |
| **Styling** | Tailwind CSS v4 + Radix UI | 4.1.12 |
| **Animation** | Framer Motion | 12.x |
| **Build** | Vite | 6.3.5 |
| **Backend** | Supabase Edge Functions (Deno + Hono) | single function |
| **Database** | Supabase Postgres (KV table) | `kv_store_cc205da9` |
| **Auth** | Supabase Auth | v2, email confirmation ON |
| **Deployment** | Vercel CLI (frontend) + Supabase CLI (backend) | |
| **Analytics** | Vercel Analytics + Speed Insights | |

---

## Three-Tier Architecture

```
Browser (React SPA / PWA)
    |
    |  HTTPS — Authorization: Bearer <jwt>
    v
Supabase Edge Function  (make-server-cc205da9)
  Deno runtime, Hono router, 25 route modules
    |
    |  Supabase client (service-role key)
    v
Supabase Postgres  (kv_store_cc205da9 table)
  key TEXT PK  |  value JSONB  |  RLS enabled, no public policies
```

---

## Frontend Architecture

### Manual routing (no React Router)

`src/App.tsx` is the single routing hub. It maintains `currentRoute` state and `handleNavigate()`. There is no `<Route>` or `<Link>` — every navigation is a function call.

- Slug-based routes `/assessment/<slug>` and `/equip/<slug>` are parsed in three places in `App.tsx`: initial `useState`, `handleNavigate`, and the `popstate` listener.
- Slug helpers: `src/lib/slug.ts` (`slugify`, `assessmentUrl`, `equipUrl`).

### Context providers (App.tsx order)

`ThemeProvider → AuthProvider → GoogleFitProvider → NotificationProvider → PWAProvider → (children)`

### CMS content architecture

`usePageContent` fetches from `/cms/pages/{pageId}` (stale-while-revalidate, 5-minute TTL). Code defaults in `src/utils/cms-defaults.ts` render immediately; live Supabase KV data overrides them. **Always update both** when changing CMS-backed content.

---

## Backend Architecture

One deployed Supabase Edge Function (`make-server-cc205da9`) handles all 25 route modules. See `src/supabase/functions/server/CLAUDE.md` for the full backend guide.

### KV key prefixes

| Prefix | Content |
|--------|---------|
| `assessment_def:{id}` | Assessment JSON |
| `assessment_slug:{slug}` | → assessment id |
| `equip:{id}` | Equip program metadata |
| `equip_slug:{slug}` | → equip id |
| `day:{id}` / `idx_equip_days:{equipId}` | Program days |
| `block:{id}` / `idx_day_blocks:{dayId}` | Content blocks |
| `cms_page:{pageId}` | CMS page content |
| `settings:site` | Global site settings |
| `checkin_scale:{key}` | Custom check-in scale |
| `mood:{userId}:{date}` | Mood journal entry |
| `hc_data:{userId}` | Health / Google Fit data |
| `user:{userId}` | User profile |

---

## Auth Architecture

- **Sign-up**: client-side `supabase.auth.signUp()` → Supabase sends a native confirmation email. Users must verify before accessing protected routes.
- **Sign-in**: standard Supabase email+password. Wrong password returns an error — no silent account creation.
- **Password reset**: `/reset-password` route (`src/components/screens/ResetPassword.tsx`) handles the `PASSWORD_RECOVERY` session event.
- **Google OAuth**: used for Google Fit linking via `supabase.auth.linkIdentity({ provider: 'google' })`. Supabase Auth has Google provider enabled.
- **Security**: leaked-password protection ON, manual linking ON, PKCE flow.

---

## Health Connect / Google Fit

`src/components/integrations/GoogleFitContext.tsx` provides `useHealthConnect()` and `useGoogleFit()`. Data flows into `/health-connect/data` on the edge function and is stored under `hc_data:{userId}`. Native Android Health Connect uses a TWA bridge; web Google Fit uses OAuth + the Fit REST API (`src/lib/google-fit.ts`).

---

## Design System

Tokens in `src/styles/globals.css`. Design guidelines in `src/guidelines/Guidelines.md`. Brand standards in `/BRAND.md`.
