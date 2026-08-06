# iKan Health

[ikanhealth.in](https://ikanhealth.in) — an India-based mental wellness platform: self-guided
assessments, structured "Equip" programs, mood journaling, and professional consultations.

> **Production branch is `equip-carry-forward`, not `main`.** `main` has diverged and is not
> deployed anywhere. See [Deploying](#deploying) before pushing anything you expect to go live.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, Vite, Tailwind CSS v4 + Radix UI |
| Backend | Supabase Edge Function (Deno + Hono) — one function, 18 route modules (33 files total) |
| Database | Supabase Postgres — a KV table today, with 5 entities mid-migration to real tables |
| Auth | Supabase Auth v2, email confirmation on |
| Deployment | Vercel (frontend), Supabase CLI (edge function) |

Original design: [Figma](https://www.figma.com/design/7LUoUuChal8qFiK0ylVrcN/ikan).

## Running the code

```bash
npm i
npm run dev      # dev server
npm run build    # production bundle in dist/
```

## Architecture

**Single edge function, KV-modeled data.** All backend routes live in one deployed Supabase Edge
Function (`make-server-cc205da9`), source in `src/supabase/functions/server/`. Nearly everything is
stored in one Postgres table (`kv_store_cc205da9`) as prefixed key-value records — `equip:{id}`,
`assessment_def:{id}`, `journal:{id}`, and so on. See `CLAUDE.md` for the full prefix map and the
rules around adding a new one (there's a specific incident behind why that rule exists).

**User data is mid-migration to real tables.** Five entities (assessment results, enrollments,
program progress, journal entries, iKAN scores) are being moved out of the KV blob into typed
Postgres tables with row-level security. Journal is dual-writing today; KV remains the source of
truth until each entity's read path cuts over. Status: `PENDING.md` §D.

**Routing is client-side**, custom, in `src/App.tsx`. Public detail pages use human-readable slugs
resolved by the backend (with a client fallback): `/assessment/<slug>`, `/equip/<slug>` (legacy
`?id=` query params still work). Slug helpers: `src/lib/slug.ts`.

**Admin console** at `/admin` — content management (assessments, equip programs, resources,
consultants, media, CMS pages), a KV Audit screen (orphan detection, schema visibility, safe
purge tooling), and configuration (scales, scoring profiles, settings).

## Deploying

Git-pushed builds auto-cancel at the Vercel project level — pushing to GitHub does **not** deploy
the frontend. Deploy from a clean checkout of `equip-carry-forward`:

```bash
npx vercel@latest deploy --prod --yes
```

The edge function has no CI/CD either — see `src/supabase/functions/server/CLAUDE.md` for the
staging-directory deploy steps, and smoke-test `/health`, `/assessments`, `/equip/programs`,
`/scales/moods` immediately after.

## Documentation

| Doc | Covers |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Stack detail, KV prefix map, CMS content rules, explicit don'ts |
| [`GOVERNANCE.md`](GOVERNANCE.md) | Process rules — why they exist, what incident each one prevents |
| [`PENDING.md`](PENDING.md) | Outstanding work, known defects, items blocked on external action |
| [`CHANGELOG.md`](CHANGELOG.md) | Dated record of what shipped |
| [`BRAND.md`](BRAND.md) | Voice, identity, crisis-resource copy standard, domain/email conventions |
| [`BUILD.md`](BUILD.md) | Build/deploy reference, env vars, migrations |
| [`DESIGN.md`](DESIGN.md) | Architecture decisions |
| [`src/docs/`](src/docs/) | Architecture deep-dive, backend route reference, project structure, contributing |

## SEO

Per-page meta/OpenGraph/Twitter/canonical + JSON-LD via `useSeo` (`src/hooks/useSeo.ts`). Static
`public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`. Google Analytics loads from the shell
`index.html`.
