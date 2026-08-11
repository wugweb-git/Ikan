# Pending work — iKan Health

Single source of truth for outstanding work across sessions. Update this file whenever you deploy
something that changes what's here — see `GOVERNANCE.md` for the rule.

*Last updated: 2026-08-07, after fixing a real production bug (General assessment's admin builder
was 3 questions behind what live users saw, root-caused to a stale `daily_content` cache) and finding
the admin notification bell is unwired from real data. See `CHANGELOG.md` for full detail. All work
through this point is committed and pushed to `origin/equip-carry-forward`.*

---

## A. Blocked on you (external — cannot be done from code)

- **`wrappers_fdw_stats` RLS** → Supabase dashboard → Security Advisor → **"Resolve issue"** button.
  `ALTER TABLE` fails with `42501: must be owner of table` (owner is `supabase_admin`) — confirmed
  empirically, this is not fixable via migration. This is the sole cause of the recurring "Critical
  issue" emails (Jul 20 / Jul 26 / Aug 3 are the same weekly digest re-reporting one finding, not
  three escalating ones).
- **Leaked-password protection** → Supabase → Auth → Providers → enable HaveIBeenPwned check.
- **Burnout has 22 items; BAT-23 defines 23.** Still undecided — author the missing item, or treat 22
  as intentional (current code treats 22 as complete and correct). Not blocking anything.
- **Wellness score (iKAN) aggregation logic** — the per-assessment scoring fixed this session (see
  "Verified fixed" below) is upstream of it, not it. Revisiting how the overall iKAN wellness score
  is computed from per-assessment results is **explicitly deferred to a later session** (confirmed
  2026-08-06) — don't start on it opportunistically.
- 🟡 **Scoring Engine is empty, not broken.** `select count(*) from kv where key like
  'scoring-profile:%'` = 0, no assessment has a `scoring_profile_id` set. The
  `AdminScoringEngine.tsx` CRUD and `getSeverityFromProfile` evaluation code are correctly wired
  end-to-end; nobody has ever authored a profile. This is why the per-assessment bands had to be
  hand-written into `assessment-section-presets.ts` as code instead of living in a scoring profile —
  there's currently no content-authored path for them. Not a code fix — needs someone to actually
  use the screen, or a decision to retire it.
- **Enrollment/progress reconciliation and rule-engine schema mismatch, equip day/block dead API,
  and duplicate category CRUD — all fixed 2026-08-06.** See "Verified fixed" below for detail on
  each; this section previously described them as open.
- 🟡 **Check-in has no "Builder" of its own — by design, per this session's direction — but hasn't
  been migrated to Blocks yet.** `AdminCheckinTemplateBuilder.tsx` still runs its own hardcoded
  6-value step-type list (underscore format, e.g. `emoji_scale`), disconnected from the
  `block_type`/`exercise_subtype` taxonomy Equip and Assessment already share. Its own KV mirror
  (`checkin_block_type`, 7 records, hyphen format, e.g. `emoji-scale`) has zero real readers.
  Migrating Check-in onto Blocks needs a value-format normalization pass (underscore → hyphen), not
  just a pointer swap. See `src/docs/systems/block-architecture.md`.
- 🟡 **`interaction_type` and `day_config_type` Metadata Catalog types are decorative** — read only
  by `AdminBlockTypeViewer.tsx` (a real, accurate, read-only reference screen), never by an
  authoring or rendering path. `day_config_type`'s 11 KV values disagree three ways with code (the
  `dayType` TS union declares 7; `day-presets.ts` actually defines 9); 4 of the 11 exist in no code
  path at all. Not a data-loss risk — no record references a missing type — but the Metadata
  Catalog UI offers an admin options that silently do nothing. See `block-architecture.md`.
- **`ProgramCheckIn.tsx` (the milestone check-in, day 7/14/30) has no admin authoring surface at
  all** — 4 fully hardcoded questions, a commented-out `customQuestions // (future)` field that was
  never built. Distinct from the Mood Journal's daily check-in (`checkin_template:`) despite the
  similar name — confirmed while correcting a wrong claim that conflated the two (see "Verified
  fixed" below). Not a bug, a real feature gap — flagging for whoever next touches program
  check-ins.
- **`Dashboard.tsx` fetches the backend recommendation and never renders it.** `recData`
  (`apiClient.getRecommendations()`, line 222-224) and its follow-up `topRecDetails`
  (`getEquipProgram(recData[0].equip_id)`, line 247-251) are fetched, stored in state
  (`setRecommendations`, line 254), and cached to `localStorage` (line 355) — but neither
  identifier appears anywhere in the JSX/render tree (`grep -n "topRecDetails\|recommendations\b"`
  confirms zero render-path hits). The card that's actually shown
  (`Dashboard.tsx:566-653`, `RecommendationCards` + severity card) reads `engineResult`, computed
  separately by re-running the frontend `evaluateAssessment()` per historical result (lines 325,
  339-347). **The fix**: either wire `RecommendationCards` to read from `recData`/`topRecDetails`
  instead of re-running `evaluateAssessment()`, or stop fetching `GET /recommendations` in
  `Dashboard.tsx` entirely if the frontend engine's richer output (messaging/secondary
  actions/severity bands) is what should stay canonical. Not fixed this pass (documentation-only
  turn, by explicit decision) — see `src/docs/systems/recommendation-frontend-vs-backend.md`.
- ~~`AdminBlockTypeViewer.tsx`'s URL and nav entry disagreed~~ **fixed 2026-08-06** —
  `'/admin/block-type-viewer'` added to `validRoutes` (`App.tsx:230`). The sidebar click still
  doesn't call `pushState` to update the address bar to match (a smaller, cosmetic gap, not fixed) —
  but the URL itself now works consistently whether reached by direct load or in-app navigation.

## B. Verify on production (needs a human pass, not more code)

Section-scoring UI (`65cef6ba`, deployed) could not be visually verified — the local preview
tooling's shell fails at initialization in this environment, unrelated to the app config. Please
take one **General** and one **Burnout** assessment on production and confirm:
- General shows 5 section rows, no overall total, Depression reads "No questions mapped yet."
- Burnout shows 4 sections + an overall risk band.
- A high WHO-5/resilience score renders as good (green) — colour must be direction-aware, not just
  by raw percentage.

## C. Known data/schema defects — diagnosed, not yet fixed

| Defect | Evidence |
|---|---|
| ~~`category:` CRUD triplicated~~ **fixed 2026-08-06** | Confirmed: `index.tsx`'s `/categories` POST/PUT/DELETE trio was live, correct, and reachable by nothing (`api-client.ts` only ever calls `/admin/categories`). Removed the dead trio; ported its one real advantage — the resource-in-use delete guard — into `admin-routes.ts`'s `DELETE /admin/categories/:id`, which previously deleted unconditionally. `GET /categories` and `POST /categories/sync` are real, still-used endpoints and were left alone. |
| `PUT /settings` overwrites, `PUT /admin/settings` merges | Calling the wrong one silently wipes unlisted fields. Same key (`settings:site`), two different write semantics. |
| `mood:` prefix collision | Mood *types* are written by both `scales-routes.ts` and a third CRUD block in `index.tsx`; per-user mood *logs* are written by `mood-routes.ts` under the same prefix. A separate `mood_type:` prefix also exists. Three writers, two data shapes, one namespace. Not yet audited to the same depth as assessments/equips — see the recommended next scope below. |
| `recommendation_rules` (no colon) singleton | Only ever written by backup/restore; vestigial, predates the real `recommendation_rule:{id}` design. |
| 3 of 7 equips lack `equip_program:` user copy | May not surface to users. Run `POST /admin/kv-audit/sync-prefixes`. |
| ~~Equip day/block REST API~~ **dead surface removed 2026-08-06** | `equip-routes.ts`'s day/block CRUD routes (`POST/PUT /equip/programs/:id/days`, `/equip/days/:id`, `/equip/days/:id/blocks`, `/equip/blocks/:id`) were live, correct, and never called by the frontend — the real editor (`EquipDailyEditor.tsx`) saves the whole program as one inline `daily_content` array. Routes removed; `EquipDayService`/`EquipBlockService` themselves are untouched since `deleteEquip`'s cascade cleanup still calls `deleteDay`/`deleteBlock`. The underlying 105 `day:` + 223 `block:` legacy KV records are unaffected by this — still correctly linked, still unreferenced by any index, still under snapshot pending a purge decision. |
| CMS page CRUD doesn't maintain `page_slug:` | `page_slug:` data was rebuilt this session (7 keys, 0 dangling) but the *save path* still doesn't write it — it will drift again on the next page edit. Same fix pattern already applied to assessments (`admin-routes.ts` ~159–227) needs porting to page CRUD. |
| `equip_slug:` — 1 missing | Not actually a bug: that equip has an empty `slug` field. Needs a slug set in admin, then the index follows automatically. |
| ~~`EquipService.getEquip(id)` has no slug fallback~~ **fixed 2026-08-06** | Unlike `getEquipBySlug()` and every read-path endpoint, `getEquip()` was a plain `kv.get('equip:'+id)`. Confirmed hitting a **second** user's data this session (`a5149dea-...`, 3 `progress:` rows keyed `sleep-tight` instead of the real UUID, found during a deep post-cleanup orphan sweep) — the "cleaned up this session" note about the first user's 7 records was true but didn't fix the underlying code, so it recurred. Fixed by making `getEquip()` fall back to `getEquipBySlug()` on a miss. The 3 newly-found orphaned rows were migrated (single-statement key/field update, not insert+delete) in both KV and the `user_program_progress` Postgres shadow table. |
| ~~`activity:daily:{date}` unregistered in `KV_SCHEMA`~~ **fixed 2026-08-06** | Live, real merge target of `POST /admin/purge-activity-keys`, missing from the registry — found while building `schema-relations.md`'s full prefix-footprint cross-check. Registered (`orphanRisk: low`); deployed. Its lack of a size cap (unlike `user_activity:`, which is capped) is **not** fixed — one live key already held 1,357 events (~300KB) and grows unbounded on every purge run. Needs a retention decision (cap? roll off after N days? archive?), not a one-line patch. |
| ~~`checkInConfig`/`scale_key` documented as linked~~ **corrected 2026-08-06** | `mood-checkin.md` and the artifact's §04 equip diagram wrongly claimed an equip's `checkInConfig` links to `checkin_template:` via a `scale_key` field. Repo-wide `grep` for `scale_key` confirmed it exists only on `checkin_template:` steps, never on an equip record. `checkInConfig` actually triggers `ProgramCheckIn.tsx` — see §A above. Docs and artifact corrected; nothing to deploy, this was a documentation error, not a code bug. |
| ~~5 of 7 ghost `user:` KV rows~~ **deleted 2026-08-06** | `user:` KV vs. `auth.users` live check: 13 rows, 6 real, 7 ghost. 5 had zero downstream references (2 plain orphans + 3 keyed by email instead of UUID, a distinct key-shape bug) — deleted via a single `DELETE ... WHERE key IN (...)`, verified against `progress:`/`journal_by_user:`/`enrollment:`/`assessment_result:`/`ikan_score:` first. See `schema-relations.md`. |
| **2 ghost `user:` rows NOT deleted — need a product decision** | `user:00000000-0000-0000-0000-00000000a001` has 7 real `journal_by_user:` entries attached; `user:107e08ee-d7cc-4535-8c4a-49dad0c3c89b` has a live `enrollment:` + `ikan_score:` record. Neither is a plain orphan — deleting the profile row wouldn't remove the attached data, and whether that data should be purged, reassigned, or kept (e.g. for compliance after an account deletion) is a decision, not a cleanup. See `schema-relations.md`. |
| **"25 route modules" stale count** | **Fixed 2026-08-06** — corrected to 33 files / 18 route modules in `CLAUDE.md`, `README.md`, `src/docs/BACKEND-GUIDE.md`, `src/docs/PROJECT-STRUCTURE.md`, `src/docs/ARCHITECTURE.md`. See `repo-hygiene-audit.md`. |
| ~~`activity_log: → user:` had no `RELATIONS` entry~~ **fixed 2026-08-06** | Added as the 7th declared relation in `kv-audit-routes.ts` (field `user_id`/`userId`). Live data was already clean (584 rows, 0 orphaned against real `auth.users`) — this closes the coverage gap so future orphans in this relation get caught automatically. |
| **Admin KV Audit dashboard showed stale numbers (594 "Uncategorized Keys", 94 "Schema & Relations") — traced to deployed-function drift, redeployed** | User flagged this directly. Simulated the exact `classifyKey()` logic server-side against live data: only **1** key is genuinely uncategorized (not ~595), and `KV_SCHEMA.length` in source is **96** (not 94). Both dashboard numbers are computed live at request time (`uncategorizedCount: uncategorizedKeys.length`, `totalPrefixes: KV_SCHEMA.length` — not hardcoded, not a frontend cache), so the mismatch meant the *deployed* function was behind the current source. **Fixed**: redeployed `make-server-cc205da9` this pass. Reload the KV Audit admin page to confirm it now shows ~96 prefixes / ~1 uncategorized key — if it still doesn't after a hard refresh, that's a second, deeper bug worth a live follow-up with real admin auth (which this investigation didn't have access to). |
| ~~"Multi-Tenant Prefix Sync" tile's count wrong, harmful sync target~~ **fixed 2026-08-06** | `AdminKVAudit.tsx`: renamed to "Admin/User Prefix Sync" (the "multi-tenant" label was a misnomer — this is a single-tenant app's admin-write/user-read split, not multiple customer orgs); count now derived from the real `equip:`/`equip_program:` and `assessment_def:`/`assessment:` record-count gap (`schema.liveCounts`) instead of the unrelated critical-growth-warnings count. The `resource: → library:resource:` sync target was checked against the backend `POST /admin/kv-audit/sync-prefixes` route — already correctly removed there (with its own explanatory comment); only the frontend tile's description text still listed it, now removed too. Whether to eliminate the write/read split entirely (read `equip:`/`assessment_def:` directly) instead of maintaining a sync tool remains a larger, undecided architectural question — not this pass's scope. |

- **Two parallel CMS page systems coexist**: legacy `cms_page:{slug}` (7 pages) and newer
  `page:page_...` records (via `AdminPageManager.tsx`), both live for the same logical pages (e.g.
  FAQ has both). Confirmed via a live content match — both FAQ records had identical stale crisis-line
  text before this session's fix (now fixed in both, but nothing keeps them in sync going forward).
  Same shape as the `equip:`/`equip_program:` split. Which one `usePageContent()` actually resolves to
  determines whether editing one in the admin UI has any visible effect — not investigated, not fixed.
- **Sleep Tight has 16 of 31 duplicated-filler days; Burnout Reset has a "(Copy)"-titled day and
  repeated exercise text** — flagged in `src/docs/equips/sleep-tight.md` and `burnout-reset.md`
  respectively, never fixed. Content decisions (what the real day content should say), not mechanical
  fixes — see `repo-hygiene-audit.md`'s "recurring/extra equip content" section for the full list.

- ~~"Connect Google"/"Connect LinkedIn" buttons performed no real OAuth~~ **UI removed 2026-08-07**
  — `account/Integration.tsx`'s "Connected Accounts" card deleted. Found while removing it: the
  handler tried real Supabase `linkIdentity()` first and only faked success on failure, silently
  masking real OAuth errors — worse than pure decoration. Backend routes/KV fields left in place,
  unused, ready for a real implementation later. **Real OAuth wiring itself is still not built** —
  needs actual Google/LinkedIn provider credentials, out of scope for a code fix. See
  `user-accounts.md` (§18).
- ~~Two-Factor Authentication toggle had zero login-time enforcement~~ **UI removed 2026-08-07** —
  `account/Security.tsx`'s toggle (state, handler, row) deleted; the live admin account had this set
  to `true` with no real protection behind it. **Real TOTP 2FA is still not built** — needs a
  verification-code library and login-flow UI, out of scope for a code fix. See `user-accounts.md`
  (§18).
- **Admin Panel cleanup, per direct request**: "System Health" (a raw KV CRUD-testing tool, not
  actually a health dashboard — the label was misleading), "Backups" (real, functional
  checkpoint/restore — removed from nav per instruction, not because it was broken; underlying
  `AdminBackupManager.tsx`/backend routes/KV data all untouched, easily re-added), and the standalone
  "Analytics" page (redundant with the same component already embedded on the Reporting landing page)
  all removed from `AdminDashboard.tsx`'s nav + routing. The landing view (`'dashboard'`) renamed to
  "Reporting" in the UI (URL unchanged, still `/admin`) to stop colliding with the user-facing
  "Dashboard" name.
- **Admin URL routing gap — fixed for every section.** Every admin sidebar item now updates the
  browser URL on click (`onNavigate('/admin/{id}')`, matching the pattern already used for
  `/admin/block-type-viewer`) and has a matching `validRoutes` entry, so every admin section is now
  directly bookmarkable/linkable, not just the ones that happened to have both pieces wired
  already. Previously only about half of ~20 admin sections had a working direct URL. Landing view's
  URL is now `/admin/reporting` (bare `/admin` kept working as an alias).
- **Hero Banners merged under Pages, per direct request.** `AdminHeroBannerManager` is no longer a
  standalone `/admin/hero-banner` screen — it's a tab inside `AdminPageManager` (`/admin/pages`),
  since a hero banner is page-level content. KV models stay separate (`page:`/`cms_page:` vs
  `hero_banner:`) — a navigation merge, not a data-model merge. Confirmed at the bundler level: no
  separate JS chunk for the hero banner manager anymore.
- **Full public/auth/private/admin URL map written** — new `src/docs/systems/url-map.md`.
  `public/sitemap.xml` and the HTML `/sitemap` page both gained the routes that were missing
  (`/join/professional`, `/sitemap` itself, `/dashboard`, `/timeline`, `/learning-diary`).
  `/dashboard/<username>` is **not implemented** — there's no `username`/handle field in the `user:`
  schema to build it on; needs that field added first, noted for the future taxonomy work.

- ~~General assessment: admin builder showed 24 questions, live players saw 27~~ **fixed 2026-08-07**
  — confirmed via screenshot from production. `AssessmentEditPageWizard.tsx` prefers a cached
  `daily_content` snapshot over regenerating from `questions[]` (`AssessmentEditPageWizard.tsx:291`,
  `if (!data.daily_content && ...)`), so when this session's earlier GAD-2/PHQ-2 fix edited
  `questions[]` directly via SQL (not through the builder), the cached `daily_content` — generated
  before that fix, frozen at 24 items — silently fell out of sync. The live player
  (`AssessmentFlow.tsx`) only ever reads `questions[]`, confirmed by grep (zero `daily_content`
  references) — so real users always saw the correct 27, only the admin builder was blind to the
  last 3. **Checked all 7 assessments — only General was affected** (the only one whose `questions[]`
  length changed via direct SQL this session; the other 6 have matching counts). Fixed by clearing
  the stale `daily_content` field on both `assessment_def:asm_1767129718791_zj1t8hx3c` and its
  `assessment:` mirror — the app's own existing logic regenerates it correctly from `questions[]`
  the next time an admin opens the builder, no code change needed for this instance.
- 🟡 **The underlying pattern that caused the above is still live — will recur on the next direct-SQL
  edit to any assessment's `questions[]`.** `AssessmentEditPageWizard.tsx:291`'s "only regenerate
  `daily_content` if absent" logic has no staleness detection — any future edit to `questions[]`
  outside the builder (SQL, a migration script, etc.) will silently desync the two again with no
  warning to the admin. A real fix needs either: comparing `questions[]`'s content hash against what
  `daily_content` was generated from and warning/re-deriving on mismatch, or a decision to make one
  of the two fields authoritative and stop maintaining both. Not fixed this pass — a real
  architecture decision, not a one-line patch.
- 🟡 **Admin panel notification bell is not wired to real data.** `NotificationContext.tsx`'s
  `unreadCount` is computed only from a client-side, in-session `notifications` array — `grep`
  confirms `setNotifications` is never called from any API fetch, only from local push/dismiss
  actions (toasts). The real `admin_notification:` KV prefix (registered, real backend write paths
  exist) is never fetched into this context. Same shape as §18's session-tracking half-built
  feature — the write-side may exist, the read/display-side was never wired in. Not fixed this pass.

## D. Migration — user data out of the KV blob into real tables

**Done:** Phase 1 (5 tables + RLS + backfill, verified by impersonation test) and Phase 2 (journal
dual-write, both write paths covered, 25/25 converged, `useOfflineSync` maxScore bug fixed as a
byproduct).

**Not started:** Phase 3 (cut journal reads over to the table — the dual-read/self-heal groundwork
already exists in `mood-routes.ts`) and Phase 4 (repeat dual-write for the remaining four entities:
`user_enrollments`, `user_program_progress`, `user_assessment_results`, `user_ikan_scores`).

## E. Deferred (no urgency)

- Folder reorg for `src/components/` (flatten/organize by domain) — cosmetic, not blocking anything.
- Media migration to Vercel Blob object storage.
- Rotate `BLOB_READ_WRITE_TOKEN` (was pasted in a chat transcript at some point — treat as
  compromised even though nothing currently depends on it being secret).
- `staging.ikanhealth.in` / `sandbox.ikanhealth.in` — **DNS is done** (A records added, per the domain
  fix this session), confirm both resolve and serve the right Vercel deployment target.

---

## Verified fixed this session (for reference — don't re-investigate these)

- **Orphan detection was wrong in both directions.** It reported 328 real `day:`/`block:` records as
  orphaned (checked for `idx_*` index keys that never existed) while under-reporting real user-data
  orphans 19→1 (checked stale `user:{uid}` KV records instead of `auth.users`). Both fixed in
  `7d604fce` — detector now joins on the actual value fields records carry.
- **Cascading deletes.** Deleting an equip now removes its day/block/progress/enrollment descendants
  instead of leaving them behind (the main source of the orphan accumulation above).
- **`resource:` → `library:resource:` mirror removed.** It was written by delete only, so it always
  held pre-edit snapshots; the sole reader already fell back to `resource:` directly.
- **`professional:`/`consultant:` update+delete gap fixed.** Legacy `consultant:`-only records were
  publicly visible but uneditable and undeletable.
- **Admin Schema & Relations view** added to `AdminKVAudit.tsx` — `GET /admin/kv-schema` existed
  server-side with zero callers; now surfaces live per-relation dangling counts and unregistered
  prefixes in the UI.
- **Enrollment read bug** (`9217213f`) — `GET /user/enrollments` returned `[]` for every user because
  it prefix-scanned a key shape (`enrollment:{userId}:{equipId}`) that was never written; the real
  records use `enrollment:{enrollmentId}`. Predates this session (introduced 2025-12-30), unrelated
  to any purge.
- **Day-advancement bug** (`f6818260`) — same root cause as above; `completeDay`/`saveBlockResponse`
  wrote to the unused key shape, so `current_day_number` was stuck at 1 for every enrollment.
- **Sectioned assessment scoring** shipped for General and Burnout — see §A/§B above for what's still
  open on the content side.
- **Full assessment content audit** — one file per assessment under `src/docs/assessments/`, pulled
  live from the DB. Found the Balance direction bug, the Stress/Balance max-mismatch, the Sleep typo,
  and confirmed `scoring.ranges`/`resultCategories` were dead across the board. This doubles as the
  reusable verification artifact for future content edits — re-run the query at the bottom of
  `src/docs/assessments/README.md` rather than re-auditing from scratch.
- **All 5 previously-unscored assessments (Anxiety, Depression, Stress, Sleep, Balance) now produce a
  real result.** New `overallCalc` presets added in `assessment-section-presets.ts`
  (`ANXIETY_SCORING`/`DEPRESSION_SCORING`/`STRESS_SCORING`/`SLEEP_SCORING`/`BALANCE_SCORING`),
  verified against 19 hand-computed test cases before shipping:
  - GAD-7/PHQ-9 now score only their real 7/9 clinical items (previously would have summed every
    question on the page, including embedded cross-screens — max 21/27, not 30/36).
  - Balance's mixed-direction scale (5 positive + 3 negative items) is now reversed correctly — a
    genuinely well-balanced person scores near 0 ("Balanced"), not near-max ("Imbalanced").
  - Stress and Balance bands corrected to their true achievable max (28 and 32, not the stored 40).
  - Sleep's stored result labels were discovered to be inverted ("Poor"/"Healthy" swapped relative to
    which end of the scale is actually good) — corrected; the numeric ranges were already right.
  - `AssessmentFlow.tsx` now overrides `score`/`maxScore`/`interpretation` with the corrected preset
    values (and re-derives severity for the recommendation engine) whenever an assessment declares an
    overall but fewer than 2 named sections; `AssessmentResults.tsx`'s report-card threshold moved to
    `sections.length >= 2` so only General/Burnout render the multi-scale card, and the other 5 use
    the existing single-ring UI with the now-correct numbers.
  - `admin-routes.ts` now derives `scoring.ranges` from `resultCategories` on every assessment
    create/update, so this specific dead-field bug can't recur for content authored from here on —
    though profile-based scoring (see the Scoring Engine note above) is still the more correct home
    for it long-term.
  - Sleep's `sleep-q4` option-4 typo ("Pooo" → "Poor") fixed directly in KV (both `assessment_def:`
    and `assessment:` mirrors).
  - General's Anxiety/Depression sections are now fully populated: `gen-anxiety-q2`, `gen-dep-q1`,
    `gen-dep-q2` copied in verbatim from the standalone Anxiety/Depression assessments (no new
    authoring), appended to General's question bank, and wired into `GENERAL_SECTIONS`.
- **Recommendation engine's hardcoded slug bug fixed.** The no-admin-rule fallback used bare category
  tokens (`'stress'`, `'burnout'`) as if they were real equip slugs — the real slugs are
  `stress-buster`/`burnout-reset`; only `sleep-tight` was ever correct. Added
  `resolveProgramSlug()`/`PROGRAM_SLUG_ALIASES` and applied it everywhere a program id is resolved
  (primary recommendation and secondary "related programs"), instead of patching each literal.
- **Rule engine's `loadedFromBackend: true` false positive fixed.** `loadEngineConfig()` was
  reporting success whenever the KV scan returned any rows, even though none of the 18 real rows have
  ever had the `.severity`/`.message`/`.severity_bands`/`.overlap_map`/`.escalation_rules` fields it
  looks for — so it silently no-op'd every time while claiming otherwise. Now tracks whether anything
  was actually applied and logs honestly either way. Per-category equip targeting
  (`loadAdminRules`/`findMatchingAdminRules`) was already correct and is untouched.
- **Enrollment day-advancement fixed for users with multiple enrollment records.**
  `findEnrollmentAnyStatus` picked the first array match from an unordered `getByPrefix('enrollment:')`
  scan — harmless for a user with one enrollment, but users routinely accumulate several (re-enrollment,
  double-submits; confirmed on Sleep Tight, Unburn, and Stress Buster in this session's equip audits).
  `completeDay`'s advancement could silently write to a stale duplicate while the record the user
  actually sees stayed on `currentDay: 1` forever, even though the underlying `progress:` records were
  correct. Now prefers active status, then most-recently-touched, mirroring the dedup logic
  `getUserEnrollments` already used for display.
- **Edge function + frontend redeployed** to ship all of the above — smoke-tested `/health`,
  `/assessments`, `/equip/programs`, `/scales/moods`, `/categories` (200s, correct payload sizes) and
  confirmed the removed day/block routes now 404.
- **All 7 assessment `.md` docs + README rewritten to match current state**, and the live KV
  `resultCategories`/`scoring.ranges` on the 5 flat-corrected assessments (Anxiety, Depression,
  Stress, Sleep, Balance) were backfilled directly to match the corrected code-side presets — the
  admin-routes.ts derivation (`C3` above) only fires on a new save, so without this backfill the raw
  KV records would have kept showing the old wrong bands to anyone reading them directly (admin
  screens, this audit) even though the player itself was already fixed via the code preset.
- 🔴 **Two live content bugs found 2026-08-06 by re-verifying doc question counts against the DB —
  neither fixed.** Both the original 2026-08-05 audit and the 2026-08-06 scoring fixes checked only
  the *scored* subset of each assessment's questions, never the doc's stated question count against
  `jsonb_array_length(value->'questions')`. That gap hid two real bugs through two review passes:
  - **Stress**: `stress-q1`–`stress-q3` have broken, truncated text (`"How often have you felt "`,
    `"How often have you"`, `"How often have you f"`) and are shown to every user as the first 3
    questions, before the real 7 scored ones. Not excluded from *display*, only from scoring.
  - **Burnout**: `burnout-q1`'s stored text is the literal placeholder `"test"`, shown as the very
    first question. Not excluded from display, only from scoring.
  Both need a product decision, not a code fix: author real replacement text (unknown for Stress's
  fragments) or delete the 4 records outright. Full detail in `stress.md`/`burnout.md`.
- ✅ **Mood Journal, Check-in Scales, and Check-in Builder — audited AND fixed 2026-08-06.**
  `AdminMoodManager.tsx` called `/moods` (`mood-routes.ts`, backed by `mood_type:` — 0 records,
  always falling back to a hardcoded, wrong mood set) while the real app read from `/scales/moods`
  (`mood:`, 5 real records) via a completely different path. Fixed: added a "Mood" tab to
  `AdminCheckinScalesManager.tsx` (pointed at `/scales/moods`, the real endpoint), deleted
  `AdminMoodManager.tsx`, removed the dead `/moods` handlers from `mood-routes.ts`, removed
  `mood_type` from `metadata-seed.ts` (renamed `metadata-catalog.ts` the same day — see below).
  **Also found while fixing**: `index.tsx` had its own 3rd/4th duplicate set of `/moods` routes
  (some already partially deduped by an earlier pass per an in-code comment) — all correctly used
  `mood:`, so no data bug, just dead code from Hono's first-match routing; removed the dead
  POST/PUT/DELETE block. Edge function + frontend redeployed and smoke-tested. Everything else
  checked clean — 5 `checkin_scale:` records, 1 `checkin_template:` record, no orphaned `scale_key`
  refs. Two minor open items found and left unfixed (product/data-quality calls, not urgent):
  `freehand_text_content` on journal entries is sometimes a number instead of a string; one journal
  entry has an `extra_responses` key that doesn't map to any current template step. Full detail
  with every record's content: `src/docs/systems/mood-checkin.md`.
- **`metadata-seed.ts` renamed to `metadata-catalog.ts` 2026-08-06** — "seed" implied something
  automatic; it isn't (confirmed: only runs when an admin clicks "Sync All" in
  `AdminCategoryManager.tsx` and confirms a dialog — nothing on page load/app start/build).
  `SEED_DATA` renamed to `METADATA_CATALOG_ITEMS` for the same reason. Functionally unchanged
  besides the `mood_type` removal above.
- ✅ **Blank, live-and-broken duplicate equip deleted 2026-08-06.** `equip:73034a14-...` was an
  abandoned early duplicate of "Unburn" (created 2025-12-30, 4 days before the real one shipped) —
  every content field empty, `title`/`slug` both blanked at some point, but `published: true` and
  the public `/equip/programs` endpoint doesn't check for a non-empty title/slug — **this was
  actively serving a blank, unusable card on the live program list**, worse than the orphaned-index
  framing this file previously gave it. Confirmed 0 enrollments/progress in both KV and the Postgres
  shadow table before deleting both `equip:73034a14-...` and the stale
  `equip_slug:program-1767123350909` index key. Verified gone from `GET /equip/programs` after.
  Full detail: `src/docs/equips/_unnamed-73034a14.md`.
- ✅ **Metadata Catalog audited AND fixed 2026-08-06** (all 21 admin-configurable taxonomy types —
  content type, block type, consultant type, assessment type, etc. — the same system `mood_type`
  turned out to be a broken outlier in). No type had zero records this time, but two real bugs were
  found and fixed:
  - **22 legacy `category:` records with no `type` field** were silently polluting the Topic
    Categories dropdown for ~9 real consumers including public `Library.tsx` — because
    `useMetadata.ts`'s bucket-mapper falls back to the `categories` bucket for anything with an
    unrecognized `type`. 15 of the 22 shared a slug with a real, correctly-typed record, and since
    the KV fetch has no `ORDER BY` anywhere in the chain, which duplicate "won" client-side dedup
    was non-deterministic — the same category could render with its intended icon/color or a flat
    grey duplicate depending on scan order, with no code change and no admin action. Fixed: 21 of
    the 22 were pure duplicates of already-correct typed records (deleted); the 1 genuinely unique
    record (`content_type:mood`, no real duplicate existed) was retyped and kept, not deleted.
  - **6 `interaction_type` records were mistyped duplicates of 6 `checkin_block_type` records** —
    inflating `AdminBlockTypeViewer.tsx`'s interaction-type dropdown from 12 real options to 18.
    Fixed: the 6 mistyped duplicates deleted; correct originals already existed under the right type.
  - **Postscript, found while fixing**: 8 more `category:cat-mood_type-*` records turned up —
    orphaned leftovers from a "Sync All Metadata" run at some point before `mood_type` was retired
    from the catalog this session (see the mood/check-in fix above). Deleted, and the last residual
    `mood_type`/`moodTypes` wiring in `useMetadata.ts` removed too (confirmed zero consumers
    anywhere in the codebase before removing).
  - **Two lower-severity items left open, not fixed** (product decisions, not bugs with an obvious
    correct answer): `media_type` (5/5 records, correctly synced, correct write=read path) has zero
    real consumers anywhere — the admin tab edits real data nothing displays. `checkin_block_type`
    (7/7, same story) is the same shape — the real check-in builder UI uses a hardcoded array with
    differently-formatted (underscore vs. hyphenated) values instead of reading this KV data at all.
    Both are "decorative" in the same sense `mood_type` was, just without the write silently failing
    — the write succeeds, nothing reads it. Needs a decision: wire up a real consumer, or remove the
    tabs.
  - **17 of 21 types checked out fully clean** — correct write=read path (confirmed by reading the
    actual route handlers on all 21, not assumed), a real frontend consumer confirmed by grep+read
    for every one, no same-type duplicate slugs, no placeholder/test content, no orphaned
    `resource → category` references. Full detail with the per-type table and ER diagram:
    `src/docs/systems/metadata-catalog.md`.
- **Remaining 3 equips audited 2026-08-06** (`src/docs/equips/{productivity-reset,cognitive-behavioral-therapy,mindfulness-meditation}.md`), completing all 7 (was 3/7):
  - **Productivity Reset**: content itself is clean (no missing/duplicate days, no leaked build
    notes). But `published: false` despite real enrollment/completion activity against it, 4 of 8
    landing-page metadata fields are the literal placeholder string `"yes"`, `subtitle` is empty.
  - **CBT** (`equip:cbt-10week`) and **Mindfulness** (`equip:mindfulness-8week`) are both **empty
    pricing stubs** — 8 fields only (slug/price/title/currency/equip_id/description/duration_days/
    expires_in_days_after_payment), no `days`/`daily_content`/`week_structure`/onboarding/
    checkInConfig at all, confirmed via both the inline-array content model AND the legacy `day:`/
    `block:` KV records (0 of 105 reference either). Zero enrollments/progress for both — priced and
    slugged but never actually launched. Both predate the UUID-id convention (legacy string ids),
    both missing a `published` field entirely so the public catalog silently excludes them — a real
    content gap, not a routing/lookup bug (slug resolution and id-or-slug fallback both verified
    correct). Systemic pattern, not equip-specific: whoever builds these out should know they're
    starting from zero, not recovering lost content.
  - All 7 equip programs now have a full verbatim-content doc under `src/docs/equips/`.
- ✅ **CBT and Mindfulness deleted 2026-08-06** — both were empty pricing stubs (see above), confirmed
  zero enrollments/progress/day-content/recommendation-rule references before deleting
  `equip:cbt-10week`/`equip:mindfulness-8week` and their `equip_slug:` index entries. **4 real
  equips remain**: Sleep Tight, Unburn, Stress Buster, Productivity Reset. Docs kept as historical
  record with a "deleted" header, not removed.
- ✅ **Backend Recommendation Engine fixed 2026-08-06 — was completely broken since it was written.**
  `RecommendationService.getRecommendations()` (`GET /recommendations`, called live by
  `Dashboard.tsx` and `EquipProgramCompletion.tsx`) had three stacked bugs, any one of which alone
  would have broken it: (1) read `assessment_response_by_user:` — 97 real records, but
  `severity`/`interpretation` are `null` on every one; real scores live in `assessment_result:`
  instead. (2) Matched rules by looking up `rule.assessment_category` (e.g. "Anxiety") in a map
  keyed by the raw `assessment_id` (e.g. `asm_1767...`) — these can never be equal. (3) Read
  `equip.name`, a field that doesn't exist on real equip records (they use `title`). Net effect:
  this function has returned `[]` for every user, every time, since it was written — a live,
  shipped feature on two real screens that has never once shown a real recommendation. Initially
  mis-flagged as fully dead code (a grep glob missed `index.tsx`'s registration) — caught by testing
  the live endpoint (`401`, not `404`) before writing that up, corrected before it became a wrong
  claim. Fixed: now reads `assessment_result:`, resolves category via each result's
  `assessment_def.category` field (case-insensitive match against the rule's Title-Case category),
  computes a 4-tier severity from score percentage instead of trusting always-null fields, and reads
  `equip.title`. Deployed and smoke-tested at the infra level; full in-app confirmation needs a real
  user session since the endpoint requires real auth, not just the anon key — the one piece of this
  fix not independently confirmed by direct query. Full writeup:
  `src/docs/systems/recommendation-engine.md`. Kept as 3 separate docs per direction: Scoring Engine
  (`scoring-engine.md`, correctly wired, 0 profiles, reserved for the future iKan Score — not a
  bug), Rule Engine (`rule-engine.md`, 18 real rules — no rule targets Productivity Reset at all,
  and several category/severity combos have coverage gaps, both content decisions not bugs), and
  Recommendation Engine (`recommendation-engine.md`, the evaluation logic covering both the frontend
  and now-fixed backend implementations).
- ✅ **iKan Wellness Score audited and one bug fixed 2026-08-06.** Confirmed fully independent of
  Scoring Engine and Rule Engine — its own 4th scoring mechanism (`ikan-score-routes.ts`, a
  hardcoded `KNOWN_MAX_SCORES` clinical-instrument table that never matches this app's real
  assessment ids, harmless since stored `max_score` already works). **Fixed**: the Programs
  component (25% weight) queried `enrollment:{userId}:` (0 matches — real keys are opaque, not
  userId-prefixed) and `user_enrollment:{userId}:` (a narrower legacy mirror — 4 of 34 real
  enrollments for the one user checked). Fixed to full-scan `enrollment:` and filter by value,
  matching the pattern already proven correct in `progress-service.ts`. **Open, not fixed**:
  General's flat score sums higher-is-distress items (GAD-2/PHQ-2) together with higher-is-better
  items (WHO-5/self-efficacy/resilience) with no reversal, then the wellness formula inverts the
  whole mixed sum as if uniformly bad — needs section-aware scoring ported to this backend file, a
  design decision not made here. Full detail: `src/docs/systems/ikan-wellness-score.md`.
- **Builder/Editor architecture mapped 2026-08-06 — corrected same day: 1 shared builder reused
  correctly twice, 1 outlier, not 3 independent systems.** First pass checked whether each wizard
  calls `useMetadata()` directly and concluded 3 independent builders — missed that
  `AssessmentEditPageWizard.tsx` actually **imports and renders `EquipDailyEditor` directly**
  (`import { EquipDailyEditor as DailyBuilder }`, line 26/608), converting legacy `Question[]` to
  the shared `Block[]`/`daily_content` shape via `convertQuestionsToDay()`. Re-verified by reading
  the render tree, not just each file's imports, and corrected before it became a wrong claim sent
  to the user. **Corrected finding**: Equip and Assessment share one real editor
  (`EquipDailyEditor.tsx`/`EquipBlockEditor.tsx`); only Check-in
  (`AdminCheckinTemplateBuilder.tsx`) genuinely reinvents its own, confirmed by checking it does
  *not* import either Equip component. Concrete mapping done per direction: 4 of Check-in's 6
  hardcoded types (`single_choice`, `multi_select`, `emoji_scale`/`slider`, `free_text`) are the
  same concept as `exercise_subtype`/`interaction_type` values the shared editor already uses,
  just under a different string format; `yes_no` is a trivial 2-option `single_choice`; only
  `context_tags` is genuinely distinct (and already exists as clean data — see the Mood/Check-in
  doc). Not fixed — pointing Check-in's picker at the shared taxonomy (the same pattern Assessment
  already correctly follows) would also resolve the Metadata Catalog's Bug 4
  (`checkin_block_type` having zero real readers), but changes a live admin screen's behavior, so
  flagged for a decision rather than done unasked. Separately confirmed: Equip's own block palette
  is hardcoded to 4 types while its own `block_type` catalog has 7 (`Checklist`/`Reflection`/
  `Sleep Diary` exist as data with no way to add one via the UI) — this part of the original
  finding held up. Full detail: `src/docs/systems/builder-editor-architecture.md`.
- 🟡 **Confirmed: `user_enrollments`/`user_program_progress` are genuinely "shadow copy only," not
  live-syncing** — matches this file's own migration table, not a new bug. Found while sweeping for
  orphans against the final 4-equip list: 4 Postgres rows referenced equip slugs/ids already
  deleted from KV in an earlier cleanup this session. Checked `kv_dual_write.ts`'s `del()` — it
  correctly propagates deletes to its own generic `ikan_data_sync` mirror table, so that layer isn't
  the gap. `user_enrollments`/`user_program_progress` have **zero write call sites anywhere in the
  current codebase** — they were populated once by Phase 1's backfill and have had no live sync
  since, exactly as documented ("Shadow copy only" in this file's migration table, Phase 4 "repeat
  dual-write for the remaining four entities" still "Not started"). Deleted the 4 stale rows by
  hand; this will keep drifting until Phase 4 actually starts. Worth remembering when reading these
  two tables for anything: they reflect KV's state as of the last backfill, not live. GAD-2 and
    PHQ-2 in General are both complete 2-item screens now.
- **17-row historical orphan cleanup — partially successful, with a confirmed 3-row data loss.**
  Traced every dangling `progress`/`enrollment`/`assessment_result` row to a specific cause rather
  than bulk-deleting: 2 rows were dead progress against a never-existing `equip-burnout-recovery`
  slug (deleted, correct); 10 rows were dead/test `assessment_result` data (`dummy-assessment`,
  `assessment-comprehensive-v1`, one genuinely deleted assessment) with no slug match (deleted,
  correct). The remaining 7 rows (1 user, real Sleep Tight progress/enrollments miskeyed by the
  slug-routing bug) were meant to be **migrated** to the correct equip UUID via an insert-then-delete
  migration — the tool reported success, but verification showed the INSERT silently affected 0 rows
  while the DELETE (same WHERE clause) removed all 3 progress rows. **3 day-completion markers for
  that user are lost** (`completed:true`, day numbers, timestamps — `block_responses` content was
  likely empty but unverified). Checked both `backup_b7_pre_orphan_cleanup` and the earlier full-DB
  `backup_b6_pre_slugfix` snapshot — neither contains the missing rows, so this is not recoverable
  from existing backups. Root cause of the silent 0-row insert was not determined. No further data
  was fabricated to fill the gap. Single-row UPDATEs only (no more insert+delete migration patterns)
  for any future KV data-shape fixes.
- **Repo doc cleanup** — the 2 iKan-specific plan-mode scratch files (Batch 1–6, and this session's
  own working plan) were deleted from `~/.claude/plans/` now that their content is fully carried into
  this file / `CHANGELOG.md`. The 10 plan files belonging to other projects in that same directory
  were confirmed unrelated and left untouched.

## Prior-session context (Batch 1–6) — condensed

Batches 1–5 covered: content/UX fixes, equip/assessment detail page audit + slug URLs, auth hardening
+ domain sweep + Google Fit sync + edge-fn deploy + DB security, and a full infra/docs/security pass
(GitHub hygiene, Vercel analytics, docs overhaul, Supabase index cleanup — 294 dead indexes dropped).
All items from those batches are complete; see git history (`dc170740` and earlier) for detail if
needed.

Batch 6 (assessment slug breakage after a KV purge, deep Supabase audit) is **fully resolved** —
slug indexes rebuilt, purge tool hardened, icons fixed, error screen redesigned. The two items it
left open (CMS page CRUD slug maintenance, 3 equips missing user copies) are folded into §C above.
