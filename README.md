# iKan Health

[ikanhealth.in](https://ikanhealth.in) — an India-based mental wellness platform: self-guided
assessments, structured "Equip" programs, mood journaling, and professional consultations.

> **Production branch is `equip-carry-forward`, not `main`.** `main` has diverged and is not
> deployed anywhere. See [Deploying](#deploying) before pushing anything you expect to go live.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, Vite, Tailwind CSS v4 + Radix UI |
| Backend | Supabase Edge Function (Deno + Hono) — one function, split into route modules |
| Database | Supabase Postgres — a KV table today, with 5 entities mid-migration to real tables |
| Auth | Supabase Auth v2, email confirmation on |
| Deployment | Vercel (frontend), Supabase (edge function) — both via guarded scripts |

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
`?id=` query params still work). Slug helpers: `src/app/lib/slug.ts`.

**Code layout** is `src/{admin,app,site,shared}` — see
[`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md).

**Admin console** at `/admin` — content management (assessments, equip programs, resources,
consultants, media), a KV Audit screen (orphan detection, schema visibility, safe
purge tooling), and configuration (scales, scoring profiles, settings).

## Deploying

Git-pushed builds auto-cancel at the Vercel project level — pushing to GitHub does **not** deploy
the frontend. Deploy with the guarded scripts, never the Vercel or Supabase CLI directly:

```bash
bash scripts/deploy-prod.sh    # frontend (Vercel)
bash scripts/deploy-edge.sh    # edge function — whenever a change touches src/supabase/functions/server/
```

Both run `scripts/deploy-guard.sh` first, which refuses unless you are on `equip-carry-forward`,
level with origin, with a clean tree, and CI is green on that exact commit. CI
(`.github/workflows/ci.yml`) runs the tests, the typecheck/lint/contrast/raw-hex/a11y/boundary
ratchets and a build on every pull request and on pushes to `equip-carry-forward` / `main`. After an edge deploy, smoke-test `/health`, `/assessments`,
`/equip/programs`, `/scales/moods`. Full steps: [`BUILD.md`](BUILD.md).

## Documentation

| Doc | Covers |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Stack detail, KV prefix map, CMS content rules, explicit don'ts |
| [`GOVERNANCE.md`](GOVERNANCE.md) | Process rules — why they exist, what incident each one prevents |
| [`PENDING.md`](PENDING.md) | Outstanding work, known defects, items blocked on external action |
| [`CHANGELOG.md`](CHANGELOG.md) | Dated record of what shipped |
| [`BRAND.md`](BRAND.md) | Voice, identity, crisis-resource copy standard, domain/email conventions |
| [`BUILD.md`](BUILD.md) | Build/deploy reference, env vars, migrations |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Architecture decisions and deep-dive |
| [`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md) | Code layout — `src/{admin,app,site,shared}` and what goes where |
| [`docs/`](docs/) | Backend route reference, contributing, module maps |

## SEO

Meta/OpenGraph/Twitter/canonical + JSON-LD via `useSeo` (`src/app/hooks/useSeo.ts`), used on the
equip and assessment detail pages only (`EquipDetail.tsx`, `AssessmentDetail.tsx`). Static
`public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`. Google Analytics loads from the shell
`index.html`.

## Attributions

Includes components from [shadcn/ui](https://ui.shadcn.com/) used under the [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md), and photos from [Unsplash](https://unsplash.com) used under the [Unsplash license](https://unsplash.com/license).
