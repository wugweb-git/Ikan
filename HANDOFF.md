# iKan — handoff brief for Claude Code (local)

**Revision 2026-09-15.** The CMS Pages + Hero Banner unmap (old Workstream B) is DONE and merged (PRs #13/#14/#15). What remains is the **codebase separation (A)** and the **edge-function `_shared/` dedup (C)**. ORDER (Vedanshu): do **A Stage 1 (site/ + app/) FIRST**. C is DEFERRED and must NOT ride the staging-verified flow — staging shares the one Supabase, so C's edge deploy hits prod. Do C last, verified locally (deno check + tests), deployed carefully.

Path: `/Users/abcom/Documents/GitHub/ikan`. Branch base: `equip-carry-forward` (the real trunk — what Vercel deploys; NOT `main`, which is 3 months stale).

Paste everything below this line into Claude Code.

---

## START HERE — 2026-09-21

Branch `restructure/codebase-separation` has been CREATED LOCALLY off `equip-carry-forward` (@ b6095adc), not checked out (the shared tree stays on ecf), NOT pushed. First actions, in order:

1. `git fetch origin` and verify the branch is level with current `origin/equip-carry-forward`; if origin moved, `git branch -f restructure/codebase-separation origin/equip-carry-forward` before starting. Claim files in `SESSIONS.md`.
2. Add the branch to `vercel.json` → `git.deploymentEnabled`: `{ "equip-carry-forward": true, "restructure/codebase-separation": true }`. Commit on the branch.
3. Push the branch → first deploy builds.
4. Tell Vedanshu to bind `staging.ikanhealth.in` → `restructure/codebase-separation` in the Vercel dashboard (Settings → Domains → edit git branch). One umbrella branch for the whole staged effort; staging follows it throughout. Leave `sandbox.ikanhealth.in` on ecf as the prod-mirror.
5. Then work the stages below, verifying each on `staging.ikanhealth.in` before merging that slice to ecf.

DB rule (standing): make NO changes to the database (Supabase KV or Postgres) without asking Vedanshu first. Read-only SQL is fine.

---

## Hard rules

1. Claim every file you touch in `SESSIONS.md` before writing — another session shares this tree. Never bare `git stash`, never bare `git add -A`.
2. Do not `git push` or `git commit` without asking Vedanshu first.
3. Every commit's Co-Authored-By line names Wugweb only: `Co-Authored-By: Wugweb <admin@wugweb.com>` — no other name/email.
4. Do NOT change any content/copy/wording. Structural + import moves only.
5. Cowork can't build this repo (Rollup/macOS). Run `npm test` + typecheck ratchet + `deno check` on the server dir + `npm run build` on the Mac before any commit.

---

## Workstream C — edge function `_shared/` (do FIRST, independent)

The edge function deploys by flat-copying `src/supabase/functions/server/` only, which forced duplicated modules. Fix the deploy, then collapse the dupes.

1. In `BUILD.md`, change the edge deploy from flat `cp` to `cp -r` with a `supabase/functions/_shared/` dir.
2. **validation** — move to `_shared/`, delete `server/validation.tsx`. It has DRIFTED from `lib/validation.ts`; `sanitizeString` is the XSS escape and must be single-sourced.
3. **scoring vocabulary** (`SEVERITY_LEVELS`, `RESPONSE_TIERS`, `DEFAULT_TIER_MAP`) — move to `_shared/`, delete the copy in `server/scoring-validation.ts`. The comment there claims a guard file `scratchpad/verify-scoring.ts` asserts they match — it DOES NOT EXIST. Write it or drop the claim.
4. **`server/shared-types.ts`** — its header says "copied from lib/cms-types.ts and lib/program-types.ts"; both were DELETED. Pick the canonical source, move to `_shared/`, fix the dangling header.

Client (Vite) importing `_shared/*.ts` needs `allowImportingTsExtensions` or an alias — handle it.
Verify: `npm test`, typecheck, `deno check` on server dir, build. Commit.

---

## Staging — verify before ecf (both workstreams share one branch)

Do all of this on ONE branch: `restructure/codebase-separation`, cut from `equip-carry-forward`. No separate `staging` git branch — this branch IS what staging points at.

Wiring (frontend, Workstream A):
1. In `vercel.json`, add the branch to git deploys so pushes build:
   `"git": { "deploymentEnabled": { "equip-carry-forward": true, "restructure/codebase-separation": true } }`
2. In the Vercel dashboard, alias `staging.ikanhealth.in` → this branch (branch-domain assignment). Vedanshu does this — dashboard config, not code.
3. Push → auto-deploys to `staging.ikanhealth.in`. QA there against the real backend.
4. Merge to `equip-carry-forward` → prod via `scripts/deploy-prod.sh`.
5. After merge, REMOVE the branch from `deploymentEnabled` in `vercel.json`.

Note: `deploy-prod.sh` + `deploy-guard.sh` are hardwired to `equip-carry-forward` only — staging goes through Vercel's git integration (steps 1–2), never the scripts.

Backend caveat: staging still hits the ONE Supabase project + ONE edge function — there is no staging Supabase. So:
- **A (frontend refactor)** — staging covers it fully; verify on `staging.ikanhealth.in`.
- **C (edge `_shared/`)** — staging does NOT isolate it; deploying the restructured edge function touches prod. Verify C with `deno check` + tests locally; deploy edge carefully, only after A's staging is green.

---

## Workstream A — codebase separation — STAGED (Vedanshu's order: site/ + app/ FIRST)

Do NOT do the ~250-file move in one PR. ONE umbrella branch `restructure/codebase-separation` for the whole effort (staging is bound to it). Stages are commits/slices ON that branch, each verified on staging, each merged to ecf as a slice when green — NOT a separate branch per stage. Only the LAST stage adds the lint boundary.

**Target tree (Vedanshu, 2026-09-21 — supersedes the `product/` layout):**
```
src/
  admin/     staff surface — the OLD component library is admin's now
    screens/ · components/ · builder/ · blocks/(components) · ui/ · types/
  app/       member product — the NEW UI (from Vedanshu's other repo, ported later)
    screens/ · features/ · blocks/(renderer) · ui/ · shell/
  site/      marketing + policy — its OWN ui
    pages/ · ui/
  shared/    NON-UI ONLY — the contract every surface imports
    blocks/(model) · engine/ · api-client · api-types · supabase-client · validation · logger
```

**Stage 1 — site + app. DONE `84300a1a` (local, not pushed).** `site/pages/` (11 pages + `pages/homepage/`), `site/ui/` (Footer, PublicNavBar, PublicBottomNavMobile), `app/screens/` (21 + account/ + onboarding/), `app/features/` (player, payments, notifications, safety, integrations), `app/shell/navigation/` (member nav). `Breadcrumbs`/`Pagination`/`SearchBar` stay in `components/navigation/` — site, app and admin all use them. `CmsPageRenderer` does not exist.

**Stage 2 — admin. DONE `62ee2d0b` (local, not pushed).** `admin/screens/` (18), `admin/components/` (was `components/admin`), `admin/builder/`, `admin/blocks/` (BlockGallery, BlockTypeViewer, DayComposer), `admin/ui/` (the 10 admin-only primitives). `BlockRenderer` → `app/blocks/`. `equip-admin-types.ts` no longer exists (folded into `lib/blocks`), so `admin/types/` is empty for now. `empty-state` stays shared — app's EquipDetail uses it. **2b DONE `ba0d9b99`:** the 20 `components/ui` primitives admin uses were COPIED into `admin/ui/` (decided: fork, not move); site/app keep `components/ui` until the new UI replaces it.

**Stage 3 — shared + shell. DONE `5bd61928` (local, not pushed).** `lib/blocks/` → `shared/blocks/`; `api-client`/`api-types`/`supabase-client`/`validation`/`logger` → `shared/`; `scoring-engine`/`scoring-context`/`recommendation-engine` → `shared/engine/`; `RouteGuard`/`ChunkErrorBoundary`/`OfflineBanner`/`LoginScreen`/`AuthForm` → `app/shell/`. Kept put on purpose: `App.tsx` stays at `src/` as the composition root — it routes admin + site + app, so inside `app/shell/` it would make app import admin. `ErrorBoundary`/`LoadingSpinner`/`Logo`/`Icon` and `page-blocks/` stay in `components/` — all three surfaces use them; they split with the UI work. `shared/` is not yet self-contained: `api-client` imports `hooks/useOfflineSync`, and `shared/blocks` + `validation` import server modules (Workstream C).

**Stage 4 — lint boundary. DONE `f5de4970` (local, not pushed).** `no-restricted-imports` blocks in `eslint.config.js`: admin ⇄ app ⇄ site blocked in every direction; `shared/` may not import any surface or `components/`. Warn-level for editors, counted by `scripts/boundary-ratchet.mjs` (`npm run lint:boundary`, CI step) against `.boundary-baseline` = 5. The 5, all into `app/`: `admin/blocks/BlockGallery` → `app/blocks/BlockRenderer` and `admin/screens/EquipProgramWizard` → `app/features/player/ProgramPlayer` (admin previews member rendering), `admin/screens/AdminDashboard` → `app/shell/navigation/SideNav`, `site/{pages/Sitemap,ui/Footer}` → `app/shell/navigation/NavBadge`. `.lint-baseline` 887 → 892 for those same 5 warnings.

**Boundary fixes. DONE `6ceefe12`.** Crossings 5 → 0: `NavBadge` → `site/ui/` (only site used it), `SideNav` → `admin/components/` (only AdminDashboard used it). Admin's two previews (`BlockRenderer`, `ProgramPlayer`) are allowed BY NAME in `eslint.config.js` — a copy would drift from what members see. `.boundary-baseline` = 0.

**UI split. DONE `91c48f61` (moves) + `ce452cf4` (copies).** `components/` is empty except `CorporateProgramCard.tsx`. Everything app or the root uses → `app/ui/` (page-blocks → `app/ui/blocks/`), `app/features/widgets/`, `app/features/assessment/`, `app/shell/`. The 27 never-imported primitives → `admin/ui/` (the old library is admin's). site/ and admin/ got their own copies of what they reach (23 + 8). Baselines raised only for per-file-verified duplicates: typecheck 177, lint 900, raw-hex 507, a11y 54 — they fall as each surface's UI is replaced.

**OUT OF SCOPE (Vedanshu, 2026-09-21):**
- Corporate deletion — leave all corporate code and routes alone.
- Any Supabase change — tables, KV, the edge function. The Supabase mapping stays shared by admin, app and site. This also takes **Workstream C** (edge `_shared/` dedup) off the list.

**Remaining:** bring in app's NEW UI (from Vedanshu's other repo — which repo is TBD) to replace `app/ui/`; push the branch; Vercel preview LAST (blocked by the project's verified-commits requirement — commits are unsigned).
---

## Also outstanding (stale refs the B PRs left behind — small, do anytime)
- `kv-audit-routes.ts:199` hero_banner entry names deleted owner `hero-banner-routes.ts` → mark orphaned (KV rows stay).
- `AboutUs.tsx:55` stale `getHeroBanner` comment → remove.
- Docs `ARCHITECTURE.md`, `PROJECT-STRUCTURE.md`, `systems/repo-hygiene-audit.md` still describe `usePageContent` as live → correct.
- Confirm `api-client` no longer exports `getHeroBanner`/`updateHeroBanner`/`resetHeroBanner`.
- Two dead admin orphans (0 importers): `AdminBackupManager`, `AdminCRUDTesting` — per the standing rule, WIRE don't delete; flag for Vedanshu's decision.
