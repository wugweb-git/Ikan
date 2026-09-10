# Concurrent session protocol

Two Claude sessions share this working tree and this Supabase project. They are
not isolated by git — one tree, one index, one stash. This file is the ownership
boundary. Read it before writing anything.

Measured 2026-09-08: the two workstreams are 93% disjoint. Two files and one KV
prefix overlap. Everything below exists to protect those three seams.

## Ownership

| | BLOCKS session | ASSESSMENT session |
|---|---|---|
| files | `src/lib/blocks/**`, `src/components/blocks/**`, `src/components/player/**`, `src/docs/module-maps/blocks.md` | `src/components/screens/Assessment*.tsx`, `src/components/screens/Equip{Detail,Programs}.tsx`, `src/components/page-blocks/**`, `src/lib/equip-meta*` |
| KV prefixes | `equip:` `equip_program:` `equip_slug:` `equip_program_by_slug:` `blocks_fallback:` | `assessment_def:` `assessment_slug:` `assessment_draft:` `assessment_response:` `assessment_response_by_user:` `assessment_result:` |
| `category:` rows | `cat-block_type-*` `cat-interaction_type-*` `cat-exercise_subtype-*` `cat-day_config_type-*` `cat-checkin_block_type-*` | `cat-assessment_type-*` `cat-scoring_method-*` `cat-severity_level-*` `cat-ema_category-*` |

Anything not listed is unowned. Claim it in this file before writing it.

## Claimed 2026-09-10 — SYSTEM MAP session (Cowork)

Claiming three unowned files for the design-system + accessibility fixes filed in
`Claude outputs/system-map-2026-09-10/`:

| file | change |
|---|---|
| `index.html` | load Inter 400/500/600/700; remove `user-scalable=no` |
| `src/App.tsx` | remove the focus/blur handlers that re-disable pinch zoom (lines ~398-416) |
| `src/styles/globals.css` | brand `-text` siblings (additive), 16px font-size floor on form controls |

### 2026-09-10 · second collision — contrast lint, and one finding handed over

Both sessions started a contrast lint within minutes of each other. **The blocks
session's `scripts/contrast-ratchet.mjs` wins** — it is curated, tested
(`src/lib/contrast.test.ts`), and already wired into `ci.yml`. The system-map
session's `scripts/lint-contrast.mjs` is dropped to `_to_delete/`; delete it.

`.contrast-baseline` was briefly set to `16` by the dropped script. **It is now
`5`, which is what `contrast-ratchet.mjs` actually measures.** Do not raise it.

**Two findings the surviving lint cannot see, handed to the blocks session:**

1. **`.dark` does not redefine `--color-text-primary`.** It redefines
   `--color-bg-page` and `--color-bg-card` (both to grey-10/grey-9) and
   `--color-text-muted`, but primary body text keeps `#151515`. In dark mode
   that is `#151515` on `#0D0D0D` — **1.06:1, invisible**. It has never rendered
   because nothing adds the `.dark` class, which is the only reason this has not
   been reported as a bug. Wiring a theme switch before fixing this ships an
   unreadable app.

2. **All six `-text` brand tokens fail on dark grounds** — 2.5:1 to 3.3:1. They
   were tuned for `--color-bg-card` and `--color-bg-page` in light and `.dark`
   does not redefine them.

Neither shows up in `contrast-ratchet.mjs` because it checks curated light-theme
pairs only. Adding a dark pass and an automatic rule for `*-text` tokens against
both grounds would catch both. That is the blocks session's file to change.

### 2026-09-10 · collision resolved in `globals.css`

Both sessions fixed the teal-on-wash contrast failure on the same day and landed
two tokens for one value:

| token | by | value |
|---|---|---|
| `--ikan-brand-teal-text` | system-map session, commit `46579165` | `#356B5A` |
| `--ikan-teal-on-wash` | blocks session, commit `2157e492` | `#356B5A` |

`--ikan-teal-on-wash` is now `var(--ikan-brand-teal-text)`. **Both names still
resolve, so no call site in either session's work breaks** — `AboutUs.tsx` points
at `-on-wash`, the other five hues use `-text`. The value is defined once.

This was a shared-file seam that `SESSIONS.md` did not cover: neither session was
wrong, and neither could have seen the other's token before it landed. If a third
token for the same job appears, alias it the same way rather than picking a winner
and rewriting call sites.

Not touched, deliberately:

- `src/components/page-blocks/**` — ASSESSMENT-owned. Holds six content-drop bugs
  (`section1`, `section3_content`, `tile4_content`, `tile5_content`, newsletter
  benefits, self-recommending related query). Raised, not fixed.
- **Weight tokens.** `--font-weight-semibold` and `--font-weight-bold` are both 500
  by an explicit in-file decision ("public UI must only use 400/500"). That is a
  design constraint, not a bug. Left alone.
- **Dark mode.** Nothing in `src/` ever adds the `.dark` class — no theme provider,
  no toggle, no `prefers-color-scheme`. Dark mode is unreachable, so the 43 dark
  tokens and every `.dark .component` override are dead code. Wiring it on would
  expose the 286 tokens with no dark value and look worse than light-only. Needs a
  decision, not a patch.
- **Radius scale rename** — 154+ call sites.


## Claimed 2026-09-10 — MOBILE AUDIT session

Taking `src/components/page-blocks/**` and the two detail screens for the six
content-drop bugs the SYSTEM MAP session raised and deliberately left
(`section1`, `section3_content`, `tile4_content`, `tile5_content`, the newsletter
benefits, the self-recommending related query). They are listed above as
ASSESSMENT-owned; the work order assigns them here and no assessment session is
active, so they are claimed rather than taken silently.

| file | change |
|---|---|
| `src/components/page-blocks/AssessmentBentoGrid.tsx` | render `section1`; "What it measures" over the bullets; `tile4_content` under "What you'll see"; `tile5_content` in Important |
| `src/components/page-blocks/EquipBentoGrid.tsx` | split newline-delimited tiles; outcome title/subtitle; "program includes" from `tile2_content` |
| `src/components/page-blocks/NewsletterBlock.tsx` | render all three benefits and the privacy line |
| `src/components/screens/EquipDetail.tsx` | hero image ladder; exclude self from related by id AND slug |
| `src/components/screens/AssessmentDetail.tsx` | hero image ladder; pass the two tile props |
| `src/lib/cms-content.ts` | new, unowned — the parsing, with tests |

Not touched, deliberately:

- `src/styles/globals.css`, `index.html`, `src/App.tsx` — claimed by the SYSTEM MAP
  session above. Dark mode, the weight tokens, the radius scale and the remaining
  contrast pairs are all in those files and wait for that session to hand over.
- `src/components/blocks/**`, `src/components/player/**` — BLOCKS-owned.

## The three seams

**1 · `src/components/screens/AssessmentFlow.tsx`** — assessment-owned. Blocks
touched it only for a repo-wide sweep (the `signOut` scope fix reached every call
site). That is the only legitimate reason to cross.

**2 · `src/lib/equip-meta.ts`** — assessment-owned. Blocks edited it on 09-08 to
narrow two `as any` casts that had pushed lint above baseline. **That was the
violation.** Do not edit another session's file to fix a shared counter. Raise it
and let the owner fix it.

**3 · `.lint-baseline`** — a single mutable number both sessions ratchet. It will
conflict. Until it is split per-directory, only the BLOCKS session lowers it;
the ASSESSMENT session reports a rise rather than editing the file.

## Rules

**Never run bare `git add -A` or `git add .`.** Stage explicit paths, always. On
2026-09-08 a broad `git add -A` swept five of the assessment session's in-flight
files into a blocks commit (`667cba1e`), filed under a message describing
something else. Nothing was lost and the history was not rewritten — rewriting
pushed history is worse than the mislabelling — but the commit is wrong and it
happened two hours after this file was written. This rule was the gap: the stash
hazard was covered, the staging hazard was not.

**Never run bare `git stash`.** It takes the other session's uncommitted work with
it. Always scope it:

```
git stash push -- <your owned paths>
```

This is the single sharpest edge in a shared tree, and the one that loses work
silently.

**Never leave your work dirty.** Commit or scoped-stash before going idle. A file
sitting modified in a shared tree is one careless command from gone.

**Cross-boundary edits** are permitted only for genuine repo-wide sweeps (an auth
scope change, a dependency bump). They commit alone, carry no unrelated work, and
name the sweep in the commit message.

**Before any KV write:** take a fresh backup, state the prefix in the commit
message, and confirm the prefix is yours. Both sessions replay migrations against
production — each verifies its own change, finds it correct, and neither sees the
other's overwrite. Git isolation does nothing about this.

**Dual-write discipline is unchanged.** `equip:` and `equip_program:` are written
together, replayed independently, never copied. `program-service.ts:40,88` does
this on every save; a direct SQL migration is the one path that bypasses it.

**Deploys are serial.** An edge function deploy replaces the whole function. If
the other session has uncommitted server changes, your deploy ships them. Check
`git status` on `src/supabase/functions/**` before deploying.

## When they must overlap

Serialize. Say so, finish, hand over. There is no mechanism here that makes two
agents writing one file safe, and a worktree would not help — the connected
folder is a single mount, and the real exposure is the shared database, not the
shared index.

### 2026-09-10 · a CI break this session made, and closed

`d1e81c62` put `contrast:ratchet` in package.json and `4e5bfef6` put a
"Contrast (ratchet)" step in `ci.yml`. Both point at
`scripts/contrast-ratchet.mjs`, which was still **untracked** — the blocks
session had written it but never committed it, and the note above ("already
wired into ci.yml") described the wiring, not the file. Locally every ratchet
ran green because the file was on disk. CI clones fresh, so the next push
would have failed on a missing module.

`2fd814b2` commits `scripts/contrast-ratchet.mjs` and `src/lib/contrast.test.ts`
verbatim — the blocks session's work, not edited. Every script and baseline
`ci.yml` reaches is now tracked; checked explicitly, not assumed.

**The general shape of the mistake, worth keeping:** wiring CI to a path is not
the same as putting the path in git, and a green local run cannot tell the
difference. Any commit that adds a CI step should check `git ls-files` for
everything that step executes.

## Claimed 2026-09-10 — HERO BANNER REMOVAL (branch `hero-banner-removal`)

Removing the Hero Banner feature entirely, per work order. Touches five screens
listed as ASSESSMENT-owned (`Assessments.tsx`, `Equip{Detail,Programs}.tsx` glob
covers `EquipPrograms.tsx`) — no assessment session active, claimed for this
narrow, mechanical edit only (delete the `heroBanner` state/fetch/conditional,
promote the existing fallback copy to the literal value; no other logic touched).

| file | change |
|---|---|
| `src/components/screens/{AboutUs,Assessments,EquipPrograms,Library,Consultation}.tsx` | remove `getHeroBanner` call, `heroBanner` state, and the `heroBanner?.x \|\|` conditionals on the hero render — fallback copy becomes the literal value, unchanged |
| `src/components/admin/AdminHeroBannerManager.tsx` | deleted |
| `src/components/screens/AdminPageManager.tsx` | remove the "Hero Banners" tab + import (file itself is deleted whole in the Page Manager work order, not yet landed) |
| `src/lib/api-client.ts` | remove `getHeroBanners`/`getHeroBanner`/`updateHeroBanner`/`resetHeroBanner` |
| `src/supabase/functions/server/index.tsx` | remove `registerHeroBannerRoutes` import + call |
| `src/supabase/functions/server/hero-banner-routes.ts` | deleted |

Not touched: `hero_banner:` KV rows (data cleanup is separate, per brief) and its
`KEY_REGISTRY` entry in `kv-audit-routes.ts` (still protects those rows from
purge). `/content` and `/admin/content` (resource/blog CMS) — different feature,
different KV prefix, untouched.

## Claimed 2026-09-10 — PAGE MANAGER UNWIRE (branch `page-manager-unwire`)

Unwiring every `usePageContent(pageId)` consumer to render its
`DEFAULT_CMS_CONTENT` entry directly, per work order Prompt 2. No wording
changed — `DEFAULT_CMS_CONTENT` already held the copy the hook's fallback was
returning; this makes it the source instead of a fallback. Zero live-fetch
dependency remains: pages render as static/hardcoded until a different CMS
replaces this layer, per the owner's standing instruction.

18 consumers (Homepage + 8 homepage/ sections including the inline
`homepage-equip-intro` call, the 4 legal pages, AboutUs/FAQ/ContactUs/
Sitemap/NotFound), all now import `DEFAULT_CMS_CONTENT` from
`utils/cms-defaults` instead of the hook. `account/Legal.tsx` checked — it
never imported `usePageContent`, nothing to unwire there.

Deleted `hooks/usePageContent.ts` (verified zero remaining call sites in `src/`
after all 18 edits). `utils/cms-defaults.ts` itself had no fetch path of its
own to remove — it was always a static object; the fetch lived entirely in the
now-deleted hook.

Not touched: `screens/AdminPageManager.tsx`, `PageEditPage.tsx`, the
`AdminDashboard` 'pages' tab/nav, or the backend `/cms/pages*` routes — that is
Prompt 3, sequenced after this lands (consumers must be gone before the module
they configure is deleted).
