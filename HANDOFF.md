# iKan — handoff brief for Claude Code (local)

**Revision 2026-09-15.** The CMS Pages + Hero Banner unmap (old Workstream B) is DONE and merged (PRs #13/#14/#15). What remains is the **codebase separation (A)** and the **edge-function `_shared/` dedup (C)**. Do C first — it's smaller, independent, and fixes a live security drift.

Path: `/Users/abcom/Documents/GitHub/ikan`. Branch base: `equip-carry-forward` (the real trunk — what Vercel deploys; NOT `main`, which is 3 months stale).

Paste everything below this line into Claude Code.

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

## Workstream A — codebase separation (~250 files)

**Precondition:** cut a FRESH branch from `equip-carry-forward` at the deployed commit, AFTER the pending deployment lands. Steps 2–4 each leave the tree briefly non-building — run them back-to-back on the same branch, do not deploy between.

### Target tree
```
src/
  admin/     screens(20) · components(29) · builder(19) · blocks/ · ui(27) · types/
  product/
    site/    Homepage + homepage/(8) · AboutUs · FAQ · ContactUs · CmsPageRenderer
             Sitemap · NotFound · Privacy/Terms/Cancellation/ReturnPolicy · ProfessionalApplication · Footer
    app/     20 screens + navigation/ player/ payments/ notifications/ safety/ integrations/
             + blocks/BlockRenderer
    ui/      tokens/ · primitives/(~60) · blocks/(20, was page-blocks)
    shell/   App · RouteGuard · LoginScreen · AuthForm · ErrorBoundary · ChunkErrorBoundary
             OfflineBanner · LoadingSpinner · Logo · Icon
  shared/    blocks/(19) · engine/ · api-client · api-types · supabase-client · validation · logger
```

### Order
1. **Delete corporate** — `components/CorporateProgramCard.tsx`, `screens/account/Corporate.tsx`, `server/corporate-routes.ts`, its `registerCorporateRoutes` call in `index.tsx`, and the dead `corporate_user` fields (hardcoded false everywhere).
2. **`git mv` only** — pure relocation, one commit, no logic change:
   - `lib/blocks/` (19 files, 6 `.test.ts`) → `shared/blocks/`
   - `page-blocks/` → `product/ui/blocks/` (kills the `blocks/` vs `page-blocks/` alias collision)
   - `EquipAdminDashboard.tsx` → admin (misfiled — imports `AdminStatusBadge`, `equip-admin-types`)
   - `equip-admin-types.ts` → `admin/types/`
   - `BlockGallery`, `BlockTypeViewer`, `DayComposer` → `admin/blocks/`; `BlockRenderer` → `product/app/blocks/`
3. **Fix imports** — mechanical, driven by the typecheck ratchet. `lib/blocks` → `shared/blocks` catches all 26 importers on the path string.
4. **Fork `ui/`** — copy the 16 shared primitives into `admin/ui/`, trim admin to its 27, relocate the 11 misfiled admin components: `admin-action-bar`, `wizard-layout`, `wizard-stepper`, `rich-text-editor`, `unsaved-changes-dialog`, `image-upload`, `file-upload`, `empty-state`, `error-state`, `form-field-error`, `tag-input`.
5. **Lint boundary LAST** — `no-restricted-imports` in the existing `eslint.config.js`, ratcheted: `admin/` ⇄ `product/` blocked both ways; both may import `shared/`; inside `product/`, site↔app free. Only `BlockRenderer` should legitimately cross — it won't, it's in `product/`.

---

## Also outstanding (stale refs the B PRs left behind — small, do anytime)
- `kv-audit-routes.ts:199` hero_banner entry names deleted owner `hero-banner-routes.ts` → mark orphaned (KV rows stay).
- `AboutUs.tsx:55` stale `getHeroBanner` comment → remove.
- Docs `ARCHITECTURE.md`, `PROJECT-STRUCTURE.md`, `systems/repo-hygiene-audit.md` still describe `usePageContent` as live → correct.
- Confirm `api-client` no longer exports `getHeroBanner`/`updateHeroBanner`/`resetHeroBanner`.
- Two dead admin orphans (0 importers): `AdminBackupManager`, `AdminCRUDTesting` — per the standing rule, WIRE don't delete; flag for Vedanshu's decision.
