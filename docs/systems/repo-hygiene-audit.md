# Repo hygiene audit — the folders you were suspicious of

Read-only investigation, 2026-08-06, on branch `equip-carry-forward` (the production branch — see
below for why this matters). Direct answers to each folder you flagged after browsing GitHub.

## 🔴 Read this first: you were looking at the wrong branch

**`github.com/wugweb-git/Ikan/tree/main` is not what's deployed.** Root `CLAUDE.md` already says
this ("production branch is NOT main"), and it bit this audit directly: two of the six things you
asked about (`src/config/`, `src/lib/sample-data/`) **don't exist at all** on `equip-carry-forward`
— both were already removed in an earlier commit (`f52edc8b`, "Update files from Figma Make", which
also deleted ~100 stray markdown audit/progress docs). If you browse GitHub for this repo again,
switch the branch selector to `equip-carry-forward` first — `main` has diverged and will keep
showing you things that either don't exist in production or exist differently there.

## `src/contexts/` — keep, all 4 files load-bearing

Your instinct ("we don't need it") doesn't hold for any of the 4 files:

| File | Used by |
|---|---|
| `AuthContext.tsx` | `useAuth()` — 30+ files, e.g. `RouteGuard.tsx`, `LoginScreen.tsx` |
| `NotificationContext.tsx` | `useNotifications()` — 40+ files, e.g. `Dashboard.tsx` |
| `PaymentContext.tsx` | `usePayment()` — `PaymentFlow.tsx:43`, `RazorpayPayment.tsx:41` |
| `JourneyContext.tsx` | `useJourney()` — `PaymentFlow.tsx:9,42` |

All four providers wrap the entire app in `App.tsx:785-799`. Removing any of them breaks auth,
toasts, or payments app-wide.

## `src/config/` — doesn't exist here; was thin scaffolding even on `main`

Not present on `equip-carry-forward` at all. On `main`, it held exactly 4 files as you suspected —
`flow.json`, `flow.ts`, `schema.json`, `schema.ts` — but even there, they were consumed by exactly
one dev-only page (`FlowSchemaShowcase.tsx`) that was itself never routed or imported anywhere else.
Nothing to clean up here; it's already gone.

## `src/assets/` — keep, 576KB / 10 files, all referenced

| Consumer | Assets |
|---|---|
| `MissionSection.tsx:7-14` | 7 logo images |
| `AssessmentSection.tsx:5` | 1 phone mockup |
| `AssessmentDetail.tsx:16` | 1 bento image |

These render on the live Homepage and assessment routes (`App.tsx:78,519`). Not dead weight — a
small, real, referenced asset folder.

## `src/imports/` — keep, Figma-scaffold naming but genuinely live

4 auto-generated SVG-path files (`svg-epzl744ze1.ts` and 3 siblings — typical Figma-to-code
scaffold naming, not hand-written). Consumed by `Logo.tsx`, `Footer.tsx`, `SideNavAccount.tsx` — all
rendered app-wide (every page has a logo and footer). The odd filenames are cosmetic; the code is
real.

## `src/lib/sample-data/` — doesn't exist here; was clean offline-fallback data on `main`

Not present on `equip-carry-forward`. On `main` it held 10 files (assessments/equip-programs/
journal-entries/professionals/resources/users, as JSON+TS pairs) used as offline fallback data. It
was removed on this branch with **no dangling imports found** — a clean removal, not a leftover.

## `src/docs/` and root docs — current and accurate, with two small findings

Everything this session has written (`src/docs/systems/*`, `src/docs/equips/*`) is current by
construction. Everything else — `src/docs/{ARCHITECTURE,BACKEND-GUIDE,CONTRIBUTING,DEPLOYMENT,
GETTING-STARTED,PROJECT-STRUCTURE}.md`, root `BUILD.md`/`DESIGN.md`/`BRAND.md`/`README.md` — was
independently audited and is genuinely current: every specific claim checked (branch model, deploy
steps, file paths, team photo filenames, contact emails) matches the live repo.

Two real findings, both small:

1. **"25 route modules" is wrong, repeated in 5 files.** `CLAUDE.md`, `README.md`,
   `src/docs/BACKEND-GUIDE.md`, `src/docs/PROJECT-STRUCTURE.md` (×2), `src/docs/ARCHITECTURE.md`
   (×2) all say 25. The real count is **33 files / 18 `*-routes.ts` route modules** in
   `src/supabase/functions/server/`. Even `CLAUDE.md` itself lists exactly 18 route names right next
   to the wrong "(25 files total)" label — an internal inconsistency in the most-trusted doc in the
   repo. **Fixed in this pass** — see below.
2. **`src/docs/archive/DIVERGENCE-MAP.md` lists the now-deleted `AdminMoodManager.tsx` as current.**
   It's an intentional point-in-time snapshot (dated 2026-06-16, framed as historical), so this is
   low-severity — but a reader skimming it today would think that file still exists. Not rewritten
   (it's an archive, meant to stay frozen); worth a one-line superseded-note if anyone revisits it.

### ✅ Fixed: the "25 route modules" count, corrected to 33 files / 18 route modules

Corrected in `CLAUDE.md`, `README.md`, `src/docs/BACKEND-GUIDE.md`, `src/docs/PROJECT-STRUCTURE.md`,
`src/docs/ARCHITECTURE.md` — a factual correction to already-trusted docs, not new audit content.

## ✅ Fixed: 3 confirmed-dead files removed, plus 2 real hardcoded-content bugs

**Dead code deleted this session** (each confirmed via a full-repo grep before removal, zero
remaining references):

| File | Why it was dead |
|---|---|
| `src/components/organisms/AssessmentQuestion.tsx` | Imported at `AssessmentFlow.tsx:6` but never rendered — `AssessmentFlow.tsx` actually renders `ProgramPlayer`. A leftover atomic-design scaffold. Import removed, file + now-empty `organisms/` directory deleted. |
| `src/services/programService.ts` | Placeholder Supabase credentials (`'https://your-supabase-url.supabase.co'`), zero importers anywhere, targets a `programs`/`sections`/`blocks` table schema the real KV-based backend doesn't use. An abandoned early scaffold. |
| `src/components/assessments/ReassessmentPrompt.tsx` | Rendered in `Dashboard.tsx` gated on `reassessment.reason === 'manual'` — but `checkReassessmentTriggers()` (`reassessment-triggers.ts`) only ever returns `'time'`/`'mood'`/`'program'`/`null`, never `'manual'`. Structurally unreachable — the real, working reassessment prompt was a separate inline block already in the same file (kept, untouched). Same "two representations, only one live" shape as several other bugs found this session. |

**Hardcoded-content bugs fixed** (code default + all live KV copies, in the same change):

- **Demo-credentials button shown unconditionally in production** — `AuthForm.tsx`'s "Use Demo
  Account" button rendered for every visitor with no environment gate. Checked whether the
  demo account is real first: `demo@ikanhealth.in` does **not** exist in `auth.users` — so this
  wasn't a live-account exposure, just a broken, unprofessional button for real visitors. Gated
  behind `import.meta.env.DEV`.
- **Stale US crisis-line numbers, in 3 separate places** — `cms-defaults.ts`'s FAQ default said
  "call 988"; the live `cms_page:faq` **and** a separate, byte-identical `page:page_...` FAQ record
  (see "two parallel CMS systems" below) had the same text; a `page:` **Terms** record separately
  had "988 Suicide & Crisis Lifeline / Text HOME to 741741 / Emergency: 911" — content that was
  never in sync with `cms-defaults.ts`'s own (correct) India numbers for `terms`. All 3 live records
  and the code default fixed to the same India numbers (KIRAN 1800-599-0019, iCALL 9152987821,
  Emergency 112) already used correctly elsewhere in the same file.

## ✅ Confirmed clean — no action needed

Answering the rest of this round's file-by-file questions directly:

- **`src/components/player/`** (`ProgramPlayer.tsx`, `BlockRenderer.tsx`) — the one real, live
  renderer. No old/hardcoded version found. See `builder-editor-architecture.md`'s new "Builder
  includes rendering" section.
- **`src/components/figma/ImageWithFallback.tsx`** — live, 9 real importers (Homepage sections, 3
  admin managers, Footer). The "figma" folder name is cosmetic scaffold naming; the component itself
  is genuinely used app-wide. Not a refactor/delete candidate.
- **`LearningDiary.tsx`** — fully functional and reachable: real route (`/learning-diary` in
  `validRoutes`), real API call (`GET /user/equip/{id}/diary`), a real entry point ("View Learning
  Diary" on `EquipProgramCompletion.tsx`), real nav-title support in `MobileHeader.tsx`. A genuine,
  working feature.
- **`src/components/payments/`** (`PaymentFlow.tsx`, `RazorpayPayment.tsx`) — real, production-grade
  Razorpay integration (real checkout script load, real `window.Razorpay()` call, real backend
  order/verify endpoints) — but genuinely unplugged from the live app: zero importers anywhere in
  `App.tsx`'s routes, and no currently-live equip has `is_paid:true`. **Different from the dead code
  above** — not abandoned scaffolding, real near-complete work for a paid-tier feature that hasn't
  launched. Kept as-is; needs a pricing-launch decision, not a delete.
- **`src/lib/content/`** — contains only `auth.ts` (already covered above), nothing else to audit.
- **`src/lib/constants/content.ts`** — legitimate, not redundant with the CMS system: it holds small
  static UI-label strings (button text, empty states, fallback images) used as component-level
  defaults, often alongside `usePageContent()` in the same file for different pieces of the same
  page (e.g. `AboutUs.tsx`, `Homepage.tsx`). No key overlap found with `cms-defaults.ts`.
- **`src/components/blocks/`** vs. **`src/components/screens/homepage/`** — not duplicative.
  `blocks/` (21 files) holds reusable per-entity components consumed across Assessment/Equip/
  Resource/Account detail pages (`AssessmentHero`, `EquipBlock`, `ResourceCard`,
  `AccountDetailsSection`, …). `homepage/` (8 files) holds one-off marketing sections used only once,
  on the homepage (`HeroSection`, `BenefitsSection`, `FAQSection`, …). Zero cross-imports between the
  two directories — different purpose, no overlap.
- **`AboutUs.tsx`** vs. **`Account.tsx`** — not "2 About pages." `AboutUs` is the company About page;
  `Account` is the user's account/profile screen. Unrelated screens that only share a similar-looking
  name. Nothing to consolidate.
- **Old `ikan.health` domain** — full-repo grep: the only 2 hits are inside `BRAND.md` itself, which
  is the doc instructing not to use it ("Never use `@ikan.health` — that domain is retired"). No
  live hardcoded reference found anywhere in actual code or content.
- **Docs location** — confirmed not gitignored; `src/docs/` is fully git-tracked (15+ files before
  this session's additions), safe to keep committing and sharing links from.

## 🟡 Found, not fixed: two parallel CMS page systems, confirmed with live duplicate content

Legacy `cms_page:{slug}` (7 pages) and newer `page:page_...` records (created via
`AdminPageManager.tsx`) exist **for the same logical pages simultaneously** — confirmed live: FAQ
has both `cms_page:faq` and `page:page_1767128558587_5ukbne9vt`, byte-identical content before this
session's crisis-number fix (both fixed now, in sync again — but only because this pass caught it
by hand, nothing keeps them in sync automatically going forward). This is the same architectural
shape as the `equip:`/`equip_program:` admin-write/user-read split (§12's "Admin/User Prefix Sync"),
just for CMS pages instead of programs. Which of the two a real page render actually uses
(`usePageContent()`'s resolution order) determines whether editing one or the other in the admin UI
has any visible effect — worth a dedicated look, not resolved this pass.

## "Recurring/extra equip & assessment content" — the direct answer

The user asked about this precisely; here's the distinction that matters:

**No duplicate records exist today.** Live re-check: `equip:` (4 rows) and `assessment_def:` (7
rows) — every title and slug is unique. The record-level duplicates found earlier this session (the
blank Unburn copy, CBT, Mindfulness) were already deleted (§04).

**But duplicate/repeated *content within* two programs was flagged in `src/docs/equips/*.md` and
never actually fixed** — still open:

| Program | Finding |
|---|---|
| Sleep Tight | 16 of 31 days are byte-identical duplicated filler (Days 2–7, 20–25, 27–30) |
| Sleep Tight | `onboarding_questions` duplicates Day 0's activities, with stale/broken options |
| Sleep Tight & Stress Buster | "Eligibility" copy duplicates `tile2_content` |
| Stress Buster | Duplicate enrollments from a double-submit (distinct from the already-fixed stale-duplicate advancement bug) |
| Burnout Reset | Day 13 titled "(Copy)"; repeated verbatim exercise text; duplicated situation/outcome rows |

These are **content decisions** — what should the real, non-duplicated day content actually say —
not mechanical fixes. Not touched this pass; flagging clearly rather than filling in placeholder
content nobody asked for.

## Verification notes

1. Every "used by X" claim above is a `grep` for the actual import path, not inferred from
   filenames.
2. The `main` vs. `equip-carry-forward` divergence was confirmed by checking both branches directly
   (`git show origin/main:src/config` vs. the checked-out working tree), not assumed from the
   folders' absence alone.
3. The "25 route modules" figure was corrected only after counting the real directory
   (`ls src/supabase/functions/server/*.ts src/supabase/functions/server/*.tsx | wc -l` → 33;
   `ls src/supabase/functions/server/*-routes.ts | wc -l` → 18).
