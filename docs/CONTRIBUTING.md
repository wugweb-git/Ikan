# iKan Health — Contributing Guide

> **Last updated**: July 2026
> **Audience**: All contributors, including new developers joining the project

---

## Getting started

### Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 20.x | `node -v` |
| npm | 10.x | `npm -v` |
| Supabase CLI | Latest | `supabase --version` |
| Vercel CLI | Latest | `npx vercel --version` |
| Git | Any recent | `git --version` |

### Quick start

```bash
# 1. Clone
git clone https://github.com/wugweb-git/Ikan.git
cd Ikan

# 2. Install
npm install

# 3. Dev server
npm run dev
# → http://localhost:5173
```

The app connects to the **production Supabase project** even in dev (project `jpfvoevxegnknxoqmwye`, Mumbai). The project id and anon key are committed in `src/shared/api/supabase-info.tsx` — this is intentional (it's a public-facing key, not a secret). No `.env` / `VITE_*` setup is needed.

### Key files to read first

1. `/CLAUDE.md` — AI and developer quick-reference for the whole repo
2. `src/App.tsx` — the single routing hub (no React Router)
3. `src/product/site/content/cms-defaults.ts` — all site page copy
4. `src/supabase/functions/server/index.tsx` — edge function entry and route mounting
5. `docs/BUILD.md` — how to build and deploy

### Admin access

The admin panel is gated by `is_admin: true` in the user's KV profile (`user:{userId}`). Set this in Supabase → Table Editor → `kv_store_cc205da9` to test admin flows locally.

### Useful local commands

```bash
npm run typecheck      # tsc --noEmit (the build does NOT typecheck)
npm test               # unit tests
npm run lint           # ESLint
npm run lint:boundary  # surface-boundary ratchet (admin/app/site/shared imports)
npm run lint:design    # contrast + raw-hex + static a11y ratchets
npm run build          # vite build → dist/ (bundle only)
```

There is no `preview` script.

### Where things live

See `docs/PROJECT-STRUCTURE.md` for a full directory map (`src/{admin,app,site,shared}`) and `docs/ARCHITECTURE.md` for the system design.

---

## Branch model

```
main                  ← PRODUCTION (deploys to ikanhealth.in), and the GitHub default
feature/<name>        ← branch from main
fix/<name>            ← bug fixes
```

**The live production site deploys from `main`.** Pushing to it does not deploy; use the guarded scripts. See `docs/BUILD.md`.

---

## Workflow

1. Branch from `main`
2. Make changes following the conventions below
3. Run the gates locally: `npm test`, `npm run typecheck`, `npm run lint:ratchet`, `npm run lint:design`, `npm run lint:boundary`, `npm run build`. `npm run build` is `vite build` only — it does not typecheck
4. Open a PR targeting `main`; CI (`.github/workflows/ci.yml`) runs the same tests, ratchets and build and must be green
5. After merge, deploy with `bash scripts/deploy-prod.sh` (frontend) and, if the merge touched `src/supabase/functions/server/`, `bash scripts/deploy-edge.sh` (edge function). Both refuse to run unless you're on `main`, level with `origin`, clean, and CI is green

---

## Code conventions

### TypeScript

- Strict mode enabled: `noUnusedLocals`, `noUnusedParameters`
- Prefix intentionally-unused params with `_` (e.g. `_event`)
- All props and API shapes must have TypeScript interfaces

### React components

- Functional components with hooks only
- `useCallback` / `useMemo` for expensive computations passed as props
- No class components

### Styling

- Tailwind CSS v4 utility classes for layout/spacing
- CSS custom properties (`var(--color-*)`, `var(--radius-*)`) for design tokens — never hardcode hex values in component files
- Tokens are defined in `src/product/site/ui/styles/globals.css`

### Comments

- Write comments for **why**, not **what** — the code shows what, a comment explains a non-obvious constraint or workaround
- No commented-out code blocks in PRs

---

## Site copy changes

Site page copy (text, phone numbers, resource links) is code-only: edit `src/product/site/content/cms-defaults.ts` and deploy. There is no KV record to update — the Page Manager was removed (PR #14) and leftover `cms_page:`/`page:` rows are not read.

---

## Brand standards

See `/BRAND.md` for voice/tone, email addresses, India crisis resources, and what language to avoid (e.g. "workout" → "activity").

---

## Security

- No secrets in code. The Supabase service-role key lives only in Supabase Edge Function secrets (the frontend reads no env vars).
- The anon key in `src/shared/api/supabase-info.tsx` is intentionally public.
- Do not re-enable auto-create-on-failed-login in `AuthContext.tsx` — it was removed deliberately.
- SECURITY DEFINER functions in Postgres (`kv_store_row_count`, `rls_auto_enable`) are locked to service-role — do not grant EXECUTE to `anon`/`authenticated`/`PUBLIC`.
