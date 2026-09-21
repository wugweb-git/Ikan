# iKan Health — Getting Started

> **Last updated**: July 2026
> **Audience**: New developers joining the project

---

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 20.x | `node -v` |
| npm | 10.x | `npm -v` |
| Supabase CLI | Latest | `supabase --version` |
| Vercel CLI | Latest | `npx vercel --version` |
| Git | Any recent | `git --version` |

---

## Quick start

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

The app connects to the **production Supabase project** even in dev (project `jpfvoevxegnknxoqmwye`, Mumbai). The anon key is committed in `src/shared/supabase.ts` — this is intentional (it's a public-facing key, not a secret).

---

## Branch model

**The live production site deploys from `equip-carry-forward`**, not `main`. `main` has diverged and is not used for production deploys. See `BUILD.md` for the deploy process.

---

## Key files to read first

1. `/CLAUDE.md` — AI and developer quick-reference for the whole repo
2. `src/App.tsx` — the single routing hub (no React Router)
3. `src/site/lib/cms-defaults.ts` — all CMS-backed content defaults
4. `src/supabase/functions/server/index.tsx` — edge function entry and route mounting
5. `BUILD.md` — how to build, deploy, and run migrations

---

## Admin access

The admin panel is gated by `is_admin: true` in the user's KV profile (`user:{userId}`). Set this in Supabase → Table Editor → `kv_store_cc205da9` to test admin flows locally.

---

## Useful local commands

```bash
npm run build      # TypeScript check + bundle (must pass before deploying)
npm run lint       # ESLint
npm run preview    # Serve dist/ locally
```

---

## Where things live

See `docs/PROJECT-STRUCTURE.md` for a full directory map and `docs/ARCHITECTURE.md` for the system design.
