# CLAUDE.md — iKan Health repo instructions

This file is read by AI coding assistants. It documents the conventions, architecture decisions, and sharp edges that aren't obvious from reading the code.

---

## Stack (current)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 18.3.1 / TS 5 |
| Styling | Tailwind CSS v4 + Radix UI | 4.1.12 |
| Animation | Framer Motion | 12.x |
| Build | Vite | 6.3.5 |
| Backend | Supabase Edge Function (Deno + Hono) | single function |
| Database | Supabase Postgres KV table | `kv_store_cc205da9` |
| Auth | Supabase Auth | v2, email confirmation ON |
| Deployment | Vercel (frontend) + Supabase (backend) | |

---

## Critical: production branch is NOT main

**The live site deploys from branch `equip-carry-forward`.** `main` has diverged and is not used for production. Never tell the user to push to `main` expecting a production deploy.

### Deploy method — Vercel CLI only

Git-pushed builds auto-cancel at the project level. The only working deploy path is:

```bash
cd /Users/abcom/Documents/GitHub/ikan
npx vercel@latest deploy --prod --yes
```

`.vercel/` is gitignored and holds the local project link. The team is `wugweb` (team ID `team_8QvHezSgBzUD4STdma9lk5UF`).

---

## Backend — single monolithic edge function

All API routes live in one Deno/Hono function: **`make-server-cc205da9`**.

- Source: `src/supabase/functions/server/` (25 `.ts` files)
- Entry point: `index.tsx` in that directory
- Routes: admin, assessment, brevo, checkin-template, contact, corporate, equip, health-connect, hero-banner, ikan-score, kv-audit, mood, newsletter, progress, recommendation, reminder, resource, scales (25 files total)
- Auth: `verify_jwt: true`. Routes use `requireAuth` (user JWT) or `requireAdmin` (admin JWT) middleware.
- Deploy: see `BUILD.md` — requires a staging directory trick because the Supabase CLI needs a project directory, not a subdirectory.

**Do not redeploy the edge function without smoke-testing** `/health`, assessments, equip, and scales endpoints afterwards. A bad deploy silently breaks the entire API.

---

## KV store model

Everything lives in one Postgres table `kv_store_cc205da9` with RLS enabled and **no policies** (service-role-only access via the edge function). Key prefixes:

| Prefix | Content |
|--------|---------|
| `assessment_def:{id}` | Assessment definition JSON |
| `assessment_slug:{slug}` | → assessment id (slug index) |
| `equip:{id}` | Equip program metadata |
| `equip_slug:{slug}` | → equip id (slug index) |
| `day:{id}` | Program day |
| `idx_equip_days:{equipId}` | List of day IDs for a program |
| `idx_day_blocks:{dayId}` | List of block IDs for a day |
| `block:{id}` | Individual content block |
| `cms_page:{pageId}` | CMS page content (overrides code defaults) |
| `settings:site` | Global site settings (phone, email, etc.) |
| `checkin_scale:{key}` | Custom check-in scale (emoji set + labels) |
| `mood:{userId}:{date}` | Mood journal entry |
| `hc_data:{userId}` | Health Connect / Google Fit data |
| `user:{userId}` | User profile KV record |

---

## CMS content architecture

`usePageContent` (`src/hooks/usePageContent.ts`) fetches from `/cms/pages/{pageId}` with stale-while-revalidate. The code defaults in `src/utils/cms-defaults.ts` render immediately; live KV data overrides them.

**When changing any CMS-backed content (contact info, crisis resources, team copy, etc.) you must update BOTH:**
1. The default in `src/utils/cms-defaults.ts`
2. The live record in Supabase KV (via edge function admin endpoint or SQL) so production overrides don't hide your change.

---

## Slug URL system

`src/lib/slug.ts` exports `slugify()`, `assessmentUrl()`, `equipUrl()`. Routes `/assessment/<slug>` and `/equip/<slug>` are handled in `App.tsx` at three sync points: initial `useState`, `handleNavigate`, and `popstate`. The backend resolves both id and slug via a fallback lookup.

---

## Auth

- Email confirmation is ON. New users get a Supabase native confirmation email.
- `/reset-password` route exists (`src/components/screens/ResetPassword.tsx`).
- Auto-create-on-failed-login has been **removed** from `AuthContext.tsx`.
- Leaked-password protection is enabled.
- Supabase OAuth provider: Google (for Google Fit linking via `linkIdentity`).

---

## Don'ts

- **Don't push to `main` expecting a production deploy.** Use the Vercel CLI.
- **Don't blindly bump major dependency versions.** React 18→19, Vite 6→8, Tailwind 4→next, etc. are breaking changes that need a dedicated session with full test coverage.
- **Don't enable `email_confirm: false` in the edge function signup path.** That backdoor was removed in Batch 4. Users must verify their email.
- **Don't add `EXECUTE` grants on `kv_store_row_count()` or `rls_auto_enable()` to `anon`/`authenticated`/`PUBLIC`.** These SECURITY DEFINER functions are locked down intentionally.
- **Don't delete `wrappers_fdw_stats`** — it's extension-owned. It shows as a `rls_disabled_in_public` ERROR in the security advisor; RLS **can** be enabled on it, but only from the Supabase dashboard ("Resolve issue"), because the table is owned by `supabase_admin` and `ALTER TABLE` from a migration fails with `42501: must be owner of table`.
- **Don't purge KV by prefix without checking `KV_SCHEMA`** (`server/kv-audit-routes.ts`). Reverse-index keys (`assessment_slug:`, `equip_slug:`, `page_slug:`, `idx_*`) look like orphans but are load-bearing — purging `assessment_slug:` once broke every `/assessment/<slug>` URL site-wide. The purge endpoint now refuses protected prefixes and requires `force` for registered ones. **Any new KV prefix must be added to `KV_SCHEMA`**, or the auditor will report it as uncategorized.
- **Don't store secrets in code.** `SUPABASE_SERVICE_ROLE_KEY` lives only in Vercel env + the edge function runtime. The anon key in `src/lib/supabase-client.ts` is public by design.

---

## Key file map

| What | Where |
|------|-------|
| App shell + routing | `src/App.tsx` |
| Auth context | `src/contexts/AuthContext.tsx` |
| API client | `src/lib/api-client.ts` |
| Supabase client | `src/lib/supabase-client.ts` |
| CMS defaults | `src/utils/cms-defaults.ts` |
| Slug helpers | `src/lib/slug.ts` |
| Health Connect / Google Fit | `src/components/integrations/GoogleFitContext.tsx`, `src/lib/google-fit.ts` |
| Design system tokens | `src/styles/globals.css` |
| Edge function entry | `src/supabase/functions/server/index.tsx` |
| Brand docs | `BRAND.md` |
| Build/deploy steps | `BUILD.md` |
| Architecture deep-dive | `DESIGN.md` |
| Stale docs archive | `src/docs/archive/` |
