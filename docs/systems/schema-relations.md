# Schema & Relations

Pulled live from Supabase project `jpfvoevxegnknxoqmwye`, most recently rehauled 2026-08-06. This
doc answers a different question than the other `systems/` docs — not "does feature X work," but
"how does anything in this database point at anything else, and how solid is that pointer." Every
number below comes from a live query run this session, not carried over from memory — re-run
specifically because "should be from live database" was explicit. This pass: re-ran all 6 declared
orphan checks (0 real orphans), ran a fresh ghost-user audit (7 found, 5 deleted, 2 flagged), and
checked an ad-hoc 7th relation (`activity_log: → user:`) the user asked about directly (0 orphans,
but no registry coverage for it).

## The registry: `KV_SCHEMA` + `RELATIONS`

Everything in `kv_store_cc205da9` is untyped JSON behind a single `key`/`value` column pair —
there's no foreign key, no schema enforcement, nothing stopping a typo'd field name from silently
breaking a lookup. The one thing standing in for a real schema is
`src/supabase/functions/server/kv-audit-routes.ts`, in two parts:

| Registry | Shape | Count | What it's for |
|---|---|---|---|
| `KV_SCHEMA` | `KVKeyDef[]` — `{ prefix, description, owner, consumers[], scoped, category, linkedPrefixes?, orphanRisk, notes? }` | **96 prefixes** | Every prefix this codebase is known to write. `classifyKey()` walks this list to label any live key; anything that matches nothing is "uncategorized" in the audit UI. |
| `RELATIONS` | `Relation[]` — `{ child, parent, fields[], label, parentMatchFields?, exempt? }` | **5 declared relations** | The parent-child links worth checking for orphans. Deliberately small — see "Tight vs. loose" below for why most relations in this app *aren't* here. |

This is what root `CLAUDE.md`'s "Don't purge KV by prefix without checking `KEY_REGISTRY`" rule
refers to — `KV_SCHEMA` is the registry, even though the variable isn't literally named
`KEY_REGISTRY`. **Any new prefix must be added here in the same commit that introduces it** — see
"Footprint audit" below for what happens when one isn't.

## Orphans — the 6 declared relations, checked fresh against live data (2026-08-06, re-run)

Ran the actual `RELATIONS`-driven check (the same join logic `/admin/kv-audit` runs) against every
row in `kv_store_cc205da9` live, not reused from earlier in the session:

| Relation | Orphans found |
|---|---|
| `day:` → `equip:` | **0** |
| `block:` → `day:` | **0** |
| `progress:` → `equip:` | **0** |
| `enrollment:` → `equip:` | **0** |
| `recommendation_rule:` → `equip:` | **0** |
| `resource:` → `category:` | **0** |
| `assessment_result:` → `assessment_def:` | **0 real** (40 raw misses, all correctly exempted — every one has `assessment_id` starting `checkin`, the synthetic check-in id shape; 0 hit the `assessment_deleted` exemption) |

**All 6 declared relations are clean, live.** This isn't the same as "no orphans exist anywhere" —
it's exactly and only what `RELATIONS` checks for; see "Known structural issues" below for
KV-shaped problems that live outside what any relation check catches (key-shape splits, hardcoded
content with no override path, silently-disabled enforcement).

## Ghost users — `user:` KV vs. real `auth.users`, live (2026-08-06)

| | Count |
|---|---|
| Total `user:` KV rows (before this pass) | 13 |
| Match a real `auth.users` id | 6 |
| **Ghost** (no matching real account) | 7 |

Not all 7 ghosts are the same kind of problem — read each one before acting, not just the count:

| Ghost key | Downstream data attached elsewhere | Action taken |
|---|---|---|
| `user:13175981-f9e7-429e-bedd-1efd1faa6f4a` | None (0 refs in progress/journal/enrollment/results/scores) | ✅ **Deleted** |
| `user:a0b6139e-dcf6-4c14-8e0c-5dfa3436de9b` | None | ✅ **Deleted** |
| `user:demo1@ikan.com` | None | ✅ **Deleted** — see key-shape note below |
| `user:demo2@ikan.com` | None | ✅ **Deleted** — see key-shape note below |
| `user:demo3@ikan.com` | None | ✅ **Deleted** — see key-shape note below |
| `user:00000000-0000-0000-0000-00000000a001` | **7 `journal_by_user:` entries** | 🟡 **Not deleted** — a synthetic/placeholder id with real journal content attached; deleting the profile row wouldn't remove the journal data, and whether that data should stay, move, or go needs a product decision, not a KV cleanup |
| `user:107e08ee-d7cc-4535-8c4a-49dad0c3c89b` | **1 `enrollment:` + 1 `ikan_score:`** | 🟡 **Not deleted** — the shape of a real former user (account since deleted from `auth.users`, e.g. account deletion) whose enrollment/score data was never cleaned up alongside it; also needs a decision (purge the orphaned downstream data too, or is this expected to persist post-deletion for compliance/audit reasons) |

**Fixed**: 5 of 7 ghost rows removed (single `DELETE ... WHERE key IN (...)` statement, verified
zero downstream references first — same discipline as every KV deletion this session).
**Found, not fixed**: `demo1/2/3@ikan.com` were a distinct bug from plain "ghost" — every other
`user:` record is keyed by UUID; these three were keyed by email, a key-shape inconsistency in the
same family as `enrollment:`'s two-shape problem, now moot since they're deleted, but worth naming
so a future demo-seeding script doesn't reintroduce the same shape. The 2 remaining ghosts are
flagged, not resolved — see "Known structural issues."

## Footprint audit: live prefixes vs. the registry (2026-08-06)

Grouped every live key in `kv_store_cc205da9` by its leading `prefix:` and checked each against
`KV_SCHEMA`.

| Result | Count | Detail |
|---|---|---|
| Live prefix, registered | 50 of 50 | Re-run fresh this turn (1,829 total rows across 50 distinct live prefixes) — every one matches a `KV_SCHEMA` entry, no new gaps since `activity:daily:` was registered |
| Registered, zero live rows | 46 | Reserved/future or fully-migrated prefixes (`week:`, `content:`, `dataset:`, `hc_data:`, `booking:`, `transaction:`, `hero_banner:`, `scoring-profile:`, `reminder:last:`, `idx_equip_days:`/`idx_day_blocks:` — see `equip-programs.md`, …). Registered-but-empty is not a bug; it's future-reserved or superseded. |

### 🔴 Found + fixed: `activity:daily:` was live and unregistered

`index.tsx`'s `POST /admin/purge-activity-keys` (a migration endpoint that folds legacy per-event
`activity:{timestamp}:{userId}` keys into capped daily buckets) writes `activity:daily:{date}` as
its merge target — a real, actively-used prefix. It was never added to `KV_SCHEMA`; only its
siblings `activity:read:` and `activity:user:` were registered. One live key
(`activity:daily:2025-12-29`) already held a 1,357-event, ~300KB array. Two things worth knowing
about it:

1. **Registered now** — added to `KV_SCHEMA` in this session with `orphanRisk: low` (it's a real,
   intentional merge target, not orphaned data).
2. **Unbounded growth, not fixed** — unlike `user_activity:{userId}` (capped at
   `USER_ACTIVITY_CAP` entries), `activity:daily:{date}` has no cap; each purge run appends without
   trimming. Not touched here — this is a capacity/retention design decision (add a cap? roll off
   after N days? archive to cold storage?), not a one-line correctness fix, so it's flagged rather
   than changed unasked, consistent with how this session has handled other design-level gaps.

Deployed (registry addition only, no route behavior changed) and smoke-tested `/health`,
`/assessments`, `/equip/programs`, `/scales/moods` — all responding as expected (`401` without a
JWT, matching `verify_jwt: true` at the gateway, not `404`/`500`).

## Parent → child: the 5 declared relations

These are the only relations `RELATIONS` actually checks for orphans. Each row below is
`child.field → parent.id` unless noted.

| Relation | Child field(s) | Resolves against | Notes |
|---|---|---|---|
| `day:` → `equip:` | `equip_id` / `equipId` | `equip:{id}` | Tight — see below |
| `block:` → `day:` | `equip_day_id` / `day_id` / `dayId` | `day:{id}` | Tight — see below |
| `progress:` → `equip:` | `equip_id` / `equipId` | `equip:{id}` | Loose — depends on `equip:` id staying stable; this is exactly what the `getEquip()` slug bug broke twice this session (§04) |
| `enrollment:` → `equip:` | `programId` / `equip_id` | `equip:{id}` | Loose — two incompatible `enrollment:` key shapes exist (see "Tight vs. loose") |
| `recommendation_rule:` → `equip:` | `equip_id` / `programId` | `equip:{id}` | Loose — rules reference equips by id in a free-text field, no reverse index |

Plus a 6th, non-id relation:

| Relation | Child field | Resolves against | Notes |
|---|---|---|---|
| `resource:` → `category:` | `category` / `category_id` / `categoryId` | `category.slug` **or** `category.name` (via `parentMatchFields`, not the category's key) | The one relation in the registry that matches a *value field* on the parent instead of its id — see "Side mapping" |

And one relation with a formal exemption function (not every unmatched child is an orphan):

```
assessment_result: → assessment_def:   field: assessment_id
  exempt when: id starts with "checkin" (synthetic check-in ids, e.g. checkin_{equipId}_day_N,
               have no assessment_def by design)
            OR value.assessment_deleted === true (kept as user history after admin deletion)
```

## Side mapping — relations that aren't parent/child at all

Not every dependency in this app is a KV foreign key. Some features need another feature's *data*
without being its child record. This is the shape the "Builder" conversation kept landing on:

| Consumer | Depends on | Relationship |
|---|---|---|
| `AssessmentEditPageWizard.tsx` | `src/admin/blocks/DayComposer.tsx` (`DayEditor`) — the shared block builder, formerly `EquipDailyEditor.tsx` / `EquipBlockEditor.tsx` | **Component reuse**, not a KV relation — Assessment literally renders Equip's editor via a `convertQuestionsToDay()` adapter (`builder-editor-architecture.md`) |
| Mood Journal (`mood:` entries) | `checkin_scale:` (Check-in Scales) | **Vocabulary reuse** — the mood entry UI is built from an admin-configured `checkin_scale:moods` record (emoji set + labels), not hardcoded (`mood-checkin.md`) |
| `resource:` | `category:` | **Value-matched, not id-matched** — `resource.category` holds a slug string (`"mental-health"`), checked against `category.slug`, never `category:{id}` directly |
| Recommendation Engine | `assessment_result:` + `recommendation_rule:` + `equip:` | **Read-only cross-system join** at evaluation time — no stored relation, computed fresh per request (`recommendation-engine.md`) |
| iKan Wellness Score | `assessment_result:` + `journal_by_user:` + `enrollment:` | **Read-only aggregation** across three unrelated systems' data, no write-side relation (`ikan-wellness-score.md`) |

**The pattern underneath all of this**: a "builder"-shaped screen (Equip's editor, Mood Journal's
entry form) doesn't hardcode its own answer types — it renders from a vocabulary table (Blocks =
`exercise_subtype`/`interaction_type` in the Metadata Catalog; Check-in Scales = `checkin_scale:`)
that an admin configures separately. **Check-in Scales and Blocks are the same *kind* of thing** —
both are "how does a user answer this" vocabularies consumed by a builder, just living under
different prefixes with different admin screens today, not because they're conceptually different,
but because they were built at different times without being unified. This is also exactly why
`AdminCheckinTemplateBuilder.tsx` (Check-in's own builder, the one outlier) reinvented a third
hardcoded type list instead of reading either one — see `builder-editor-architecture.md`'s
type-mapping table for the concrete overlap.

Seen from the "Builder as pivot" angle: **content (Equip days, Assessment questions, Check-in
steps, future feature types) flows into a builder, which ingests a vocabulary (Blocks / Check-in
Scales — same shape, two names), takes the resulting structure, and hands it to a delivery surface
(the program screen, the assessment flow, the mood entry form)**. The engines (Scoring, Rule,
Recommendation, iKan Score — §06-09) sit downstream of what the builder produced and delivered,
reading results and enrollments, never touching builder content directly. Programs, Assessments,
and Check-ins are three *offerings* built the same way in principle; today only two of the three
(Equip, Assessment) actually share the mechanism.

## Inventories — every registered prefix, by category, with registry risk

The user asked directly: do we show registry risk? Yes — `orphanRisk` (`none`/`low`/`medium`/`high`)
is a field `KV_SCHEMA` already carries per prefix; showing it here surfaces what's fragile without
needing to open the source file. Grouped by `KV_SCHEMA`'s own `category` field (96 registered
prefixes total):

| Category | Prefixes | Notable `orphanRisk: high` entries |
|---|---|---|
| `program` (Equip) | `equip:`, `equip_slug:`, `idx_equip_days:`, `day:`, `idx_day_blocks:`, `block:`, `week:`, `equip_program:`, `equip_program_by_slug:` | `idx_equip_days:`/`idx_day_blocks:` (don't exist, see `equip-programs.md`), `day:`/`block:` (legacy, unreferenced by any live API), `equip_program:`/`equip_program_by_slug:` (admin writes `equip:`, users read this — a split-write risk) |
| `assessment` | `assessment_def:`, `assessment_slug:`, `assessment:`, `assessment_result:`, `assessment-result:`, `assessment_response:`, `assessment_response_by_user:` | `assessment:` (user-facing mirror), `assessment-result:` (hyphen legacy, naming mismatch vs. the real underscore prefix) |
| `journal` | `journal:`, `journal_by_user:`, `mood:`, `mood_type:` | `mood:` was `high`-risk pre-fix (3-writer collision); now clean, see `mood-checkin.md` |
| `enrollment` | `enrollment:`, `user_enrollment:`, `progress:`, `program-progress:` | `enrollment:` and `program-progress:` (both — the two-shape problem and the hyphen-legacy mirror) |
| `activity` | `activity:read:`, `activity:user:`, `activity:daily:`, `activity_log:`, `user_activity:` | `activity:read:` (write-only, never cleaned), `activity_log:` (write-heavy, unbounded; **was double-JSON-encoded, fixed 2026-08-12 — see below**) |
| `content` / `resource` / `cms` | `content:`, `content_slug:`, `content_item:`, `resource:`, `resource_view:`, `library:resource:`, `page:`, `page_slug:`, `cms_page:` | `content_item:` (unknown owner), `library:resource:` (deprecated mirror — any key here is a regression) |
| `category` / `scoring` / `recommendation` | `category:`, `scoring-profile:`, `recommendation_rule:`, `recommendation_rules`, `ikan_score:` | none flagged high |
| `scales` (Check-in) | `checkin_scale:`, `checkin_template:`, `checkin_template_active:` | none flagged high |
| `professional` / `payment` / `corporate` | `consultant:`, `professional:`, `professional:pending-`, `professional_application:`, `payment:`, `transaction:`, `corporate_program:`, `user_employer:`, `corporate:` | none flagged high |
| `legacy` / `system` / `monitoring` / `security` | `tracker:`, `sys_backups`, `backup:`, `backup_`, `analytics:`, `api-log:`, `metrics:`, `session:`, `alert:`, `failed-login:`, `rate-limit:` | `tracker:` (unknown owner, only read by data export) |
| everything else (`user`, `audit`, `media`, `health`, `admin`, `settings`, `communication`, `newsletter`, `contact`, `booking`) | remaining ~30 prefixes | `email-change:` (should be cleaned up after approval/rejection) |

### 🔴 Found + fixed: `activity_log:` was double-JSON-encoded — the earlier "0 orphaned" check on it was vacuous

The first pass at checking `activity_log: → user:` (above, in an earlier revision of this doc)
reported "0 orphaned" — but that check never actually ran. Root cause: `index.tsx`'s
`POST /activity-log` handler called `kv.set(key, JSON.stringify(record))` — passing an
already-stringified value to a `set()` that itself upserts whatever value it's given straight into
a `jsonb` column (confirmed by reading both `kv.set()` implementations, `kv_store.tsx:30` and
`kv_dual_write.ts:159` — neither serializes; Supabase-js does that once, automatically, based on
the JS value's type). The result: every `activity_log:` row's `value` column held a **JSON string**,
not an object (`jsonb_typeof(value) = 'string'`, confirmed unique to this one prefix — `user:`,
`equip:`, `category:`, `journal:` all correctly show `'object'`). Plain field access
(`value['user_id']`) on a JS string returns `undefined`, not an error — so the orphan-check code,
and anything else reading these records via normal field access, silently found nothing to check
and reported clean by default, not by verification.

**Same bug, 2 more places**, found by grepping every `JSON.stringify(` immediately preceding a
`kv.set(` call repo-wide: `corporate-routes.ts:157` (`corporate_program:`) and
`corporate-routes.ts:189` (`user_employer:`). Both prefixes currently have **0 live rows** — the
corporate-enrollment feature has never actually been used in production — so this was a dormant
landmine, not live corruption, but it had no defensive read-side workaround at all (unlike
`activity_log:`'s `GET /admin/activity-logs`, which happened to add `typeof r === 'string' ?
JSON.parse(r) : r` as a defensive read fix without anyone diagnosing the write-side cause).

**Fixed 2026-08-12**: removed the redundant `JSON.stringify()` at all 3 call sites (`index.tsx:2255`,
`corporate-routes.ts:157`, `corporate-routes.ts:189`) — future writes now match every other prefix
in the codebase. The 604 existing `activity_log:` rows were migrated in place
(`update ... set value = (value #>> '{}')::jsonb where jsonb_typeof(value) = 'string'`), verified
after: all 604 now `jsonb_typeof = 'object'` with `action`/`user_id` readable directly. No
`corporate_program:`/`user_employer:` migration was needed (0 rows).

**Re-checked for real this time**: 604/604 `activity_log:` rows resolve to a real `auth.users` id —
**0 orphaned**, now an actual verified result, not a false-clean no-op. The `RELATIONS` entry added
earlier this session (`activity_log: → user:`, `kv-audit-routes.ts`) was inert until this fix and
will now function correctly on every future audit run without special-casing.

#### What's actually in `activity_log:` — the "~615 keys, why?" mapping

604 rows, only **2 distinct actions ever logged**: `login` (603) and `resource_view` (1) — this
prefix has never captured anything but sign-in events, despite `logActivity()` in `api-client.ts`
being a generic helper any screen could call.

| Who | Rows | % |
|---|---|---|
| `kartikchaturvedi0991@protonmail.com` | 313 | 52% |
| `admin@wugweb.com` | 273 | 45% |
| `kartikchaturvedi91@gmail.com` | 12 | 2% |
| `vedanshu.srivastava@gmail.com` | 6 | 1% |

**All 4 users are internal/team accounts — zero real end-users have ever triggered this prefix.**
The volume isn't hidden production traffic; it's this session's (and prior dev/QA sessions')
sign-in activity. 498 of the 604 rows (82%) landed on a single day, 2026-07-21 — consistent with
Supabase JS's `onAuthStateChange` firing a `SIGNED_IN` event on more than just a fresh login (tab
refresh/focus/multi-tab session restore can also fire it in some client versions/configs), logged
every time by `AuthContext.tsx:164`'s unconditional `apiClient.logActivity('login')` inside that
event handler. **Flagged, not changed**: de-duplicating repeated `SIGNED_IN` fires (e.g. only log
if the same user's last login-log is older than N minutes) would shrink this table's growth rate,
but it touches the auth event listener — a behavior change to core session handling, not a safe
mechanical fix, so it's left for a deliberate decision rather than patched under this pass.
`activity:daily:`'s existing `orphanRisk: low`/unbounded-growth note (above) already covers the
general "this prefix has no cap" pattern; the same applies here.

#### Re-confirmed, written up (not just answered in chat): `equip:`/`equip_program:`/`equip_slug:`/`category:` counts

| Prefix | Count | Why |
|---|---|---|
| `equip:` | 4 | Canonical program records — 1 per live Equip program |
| `equip_program:` | 4 | Admin-facing mirror, written alongside `equip:` — see the split-write risk noted in the inventory table above; **count matching `equip:` 1:1 is correct and expected**, not a duplication bug |
| `equip_slug:` | 4 | Reverse slug index, 1 per `equip:` record, purge-protected | 
| `category:` | 190 | Matches the documented live count elsewhere in this audit — no drift found |

All 4 numbers are correct 1:1:1:(expected) mirrors of the same 4 programs and the existing category
set — re-verified live against `kv_store_cc205da9` directly for this write-up, not carried forward
from an earlier answer.

## Tables & structures

| Structure | What it is | Relation to KV |
|---|---|---|
| `kv_store_cc205da9` | Single Postgres table, `key text primary key, value jsonb`. Source of truth for every entity in this app today. RLS enabled, no policies — service-role only. | — |
| `user_journal_entries` | Shadow Postgres table, dual-writing | `kv_key` column links back to the originating `journal:` key; `data jsonb` keeps the KV record verbatim |
| `user_enrollments` | Shadow Postgres table, shadow-copy only | `kv_key` → `enrollment:` |
| `user_program_progress` | Shadow Postgres table, shadow-copy only | `kv_key` → `progress:` |
| `user_assessment_results` | Shadow Postgres table, shadow-copy only | `kv_key` → `assessment_result:` |
| `user_ikan_scores` | Shadow Postgres table, shadow-copy only | `kv_key` → `ikan_score:` |

All five shadow tables carry `RLS` with `auth.uid() = user_id` (verified by impersonation test —
see root `CLAUDE.md`). The edge function uses the service role and bypasses RLS entirely, so this
protects only direct client-side Postgres access, not the API. None of the five is a live read path
yet — KV remains authoritative for all five entities until an explicit cutover (`docs/PENDING.md` §D).

## Relations that hold vs. relations with breaks (tight vs. loose)

**Relations that hold** — id-based, resolved by direct key construction, no ambiguity, verified this
session to hold with zero drift:

- `day.equip_id → equip:{id}` and `block.equip_day_id → day:{id}` — despite once being *reported*
  as orphaned (the `idx_equip_days:`/`idx_day_blocks:` index-key fallacy, since those index
  prefixes never existed), the underlying value-field relation itself is and was always tight.
- `equip:{id} ↔ equip_slug:{slug}` and `assessment_def:{id} ↔ assessment_slug:{slug}` — reverse
  slug indices, 1:1, purge-protected in `admin-routes.ts`'s purge endpoint specifically because
  they're load-bearing for every `/equip/<slug>` and `/assessment/<slug>` URL.
- Postgres shadow tables' `kv_key` column → originating KV key — a literal string back-reference,
  lossless by construction (`data jsonb` always holds the source record verbatim).

**Relations with breaks** — value-field matching with no referential integrity, the category that has
actually produced bugs this session:

- `enrollment: → equip:` — **two incompatible `enrollment:` key shapes exist**, both introduced the
  same day: `enrollment:{enrollmentId}` (real, used everywhere, 51 live rows) and
  `enrollment:{userId}:{equipId}` (defined in `progress-service.ts`, never actually written, 0
  rows). Code must resolve by scanning `enrollment:` and matching `userId`/`programId` fields, not
  by constructing the composite key — this is why the iKan Wellness Score's enrollment count was
  wrong until fixed this session (§09): it queried the wrong shape entirely.
- `progress:/enrollment: → equip:` via `equip_id` — this is a **string equality on a value that can
  become stale**, which is exactly the shape of bug the `getEquip()` slug fix (§04) closed: when a
  program's canonical id and its slug diverged, anything looking up `equip:{equip_id}` by the
  stored value silently 404'd instead of falling back to a slug match.
- `resource: → category:` via slug/name, not id — a resource that outlives a category rename (slug
  changes) silently orphans, with nothing in the registry catching it automatically; caught only by
  the audit's `parentMatchFields` mechanism re-indexing `category.slug`/`category.name` on every
  run rather than assuming stability.
- `assessment_result: → assessment_def:` via `assessment_id`, with two hand-written exemptions
  (`checkin_`-prefixed ids, `assessment_deleted` flag) — a relation that's *only* correct because
  someone remembered to encode the exceptions; a naive orphan check without the `exempt` function
  would falsely flag every check-in result and every intentionally-deleted-assessment's history.

**The dividing line isn't "how important is this relation" — it's "is the reference constructed
once and never re-derived, or does it have to be re-resolved against current data every time."**
Slug indices and shadow-table `kv_key` links are written once and never need re-resolution. Every
loose relation above involves a value that can drift after the reference was created (an equip's
canonical id, a category's slug, an enrollment's key shape) — which is also, not coincidentally,
the same list of things that produced real bugs this session.

## Known structural issues — one list, pulled from every doc this session

Not single-record bugs (those are 0, per the orphan check above) — patterns that make future
orphans/mismatches likely if untouched. Each links to its full write-up rather than repeating it:

| Issue | Where | Status |
|---|---|---|
| Two incompatible `enrollment:` key shapes coexist | `enrollment:{enrollmentId}` (real) vs. `enrollment:{userId}:{equipId}` (defined, never written) | Known, worked around by scan-and-match everywhere; not restructured |
| `day-presets.ts`'s block-palette enforcement is silently half-disabled | `blockedComponents` enforced, `allowedBlocks` computed then ignored (`validateBlockForDayType()`) | Found this turn — `block-architecture.md` |
| A 4th, ad-hoc block vocabulary (`mcq_single`, `boolean`, `table_input`, …) | `day-presets.ts`'s `allowedBlocks`/`blockedComponents`, bridged to `block_type`/`exercise_subtype` only by hardcoded string matching | Found this turn — `block-architecture.md` |
| 3 of 21 Metadata Catalog types are decorative | `interaction_type`, `checkin_block_type`, `day_config_type` — read only by `AdminBlockTypeViewer.tsx`'s reference screen | Found this turn — `block-architecture.md` |
| Check-in's step-type system is fully disconnected from Blocks | `AdminCheckinTemplateBuilder.tsx`'s own hardcoded list, different string format than its own KV mirror | `builder-editor-architecture.md`, restated `block-architecture.md` |
| Global recommendation severity/messaging content is permanently hardcoded | `DEFAULT_RECOMMENDATION_RULES`/`OVERLAP_MAP`/`ESCALATION_RULES` — no `recommendation_rule:` field has ever populated the override path | `recommendation-frontend-vs-backend.md`, `rule-engine.md` |
| `activity_log:`, `corporate_program:`, `user_employer:` were double-JSON-encoded at write time | `JSON.stringify()` passed into `kv.set()`, which serializes itself | **Fixed 2026-08-12** — 3 call sites corrected, 604 existing `activity_log:` rows migrated in place, above |
| `activity:daily:` has no size cap | Unlike `user_activity:`; unbounded growth per purge run | Registered, cap not added |
| 2 ghost `user:` rows have real data attached elsewhere | `00000000...a001` (7 journal entries), `107e08ee...` (enrollment + ikan_score) | Found this turn, above — needs a product decision |
| `Dashboard.tsx` fetches a backend result it never renders | `recData`/`topRecDetails`, dead in the render tree | `recommendation-frontend-vs-backend.md`, `docs/PENDING.md` |
| `/admin/block-type-viewer` missing from `validRoutes` | URL and sidebar nav disagree | `docs/PENDING.md` |
| Admin KV Audit dashboard showed stale numbers (deployed-vs-source drift) | User caught this directly; live-simulated `classifyKey()` gave 1 uncategorized key vs. dashboard's ~595, `KV_SCHEMA.length` 96 vs. dashboard's 94 | Redeployed `make-server-cc205da9` this pass — `docs/PENDING.md` |
| "Multi-Tenant Prefix Sync" tile's count is mislabeled; one sync target is harmful | Count is actually critical-growth-warning count, unrelated; `resource: → library:resource:` sync target contradicts the registry's own "deprecated, regression if populated" note | Found this turn, not fixed — `docs/PENDING.md` |

## Appendix: full audit history (from the published artifact)

Per request, the full content of the hosted artifact ("iKan — Data Schema & Integrity Map",
`https://claude.ai/code/artifact/56265e75-b364-4179-b016-34b840825ae2`) is summarized below so this
repo doc is a complete standalone reference, not just a pointer to a hosted page. This is a
condensed index of that artifact's 15 sections — the full tables/diagrams/mermaid for each live in
their own `systems/*.md` doc (linked per row) and in the artifact itself; reproduced here as prose
summary, not verbatim HTML, so this file stays a readable markdown document.

| § | Title | Headline |
|---|---|---|
| 01 | Assessment map | How an assessment gets saved and scored — no FK, every relationship hand-maintained by app code |
| 02 | Assessment audit | 62 real completions across 7 assessments; 2 content bugs found mid-session (Stress's 3 broken questions, Burnout's "test" placeholder), still open |
| 03 | Root-cause diagnosis | Every distinct bug this session traces to one shape: two representations of the same entity, only one live |
| 04 | Equip programs | 7 audited, 3 deleted (2 empty stubs + 1 live broken duplicate), 4 remain; `getEquip()` slug-fallback bug fixed (root cause of 2 users' orphaned progress) |
| 05 | Mood & Check-in | `AdminMoodManager.tsx` dead-prefix bug fixed; `checkInConfig`/`scale_key` claim corrected this pass — see `mood-checkin.md` |
| 06 | Scoring Engine | Correctly wired, 0 records — reserved for the future, never used — see `scoring-engine.md` |
| 07 | Rule Engine | 18 real rules, correctly wired for per-category targeting; global severity-band content gap — see `rule-engine.md` |
| 08 | Recommendation Engine | Backend was 3-stacked-bug broken since written, fixed; frontend vs. backend overlap detailed further this pass — see `recommendation-engine.md`, `recommendation-frontend-vs-backend.md` |
| 09 | iKan Wellness Score | Independent 4th scoring mechanism; enrollment-fetch bug fixed; General's mixed-direction score open — see `ikan-wellness-score.md` |
| 10 | Metadata Catalog | 21 types, 22 untyped + 6 mistyped + 8 orphaned records fixed; 3 (not 2) types now confirmed decorative — see `metadata-catalog.md`, `block-architecture.md` |
| 11 | Builder/Editor Architecture | 1 shared builder (Equip, correctly reused by Assessment) + 1 outlier (Check-in) — corrected from an initial "3 independent systems" misread — see `builder-editor-architecture.md` |
| 12 | Schema & Relations | This doc |
| 13 | Block | The 3-tier type/subtype → interaction → render model, full inventory, presets, cross-system map — see `block-architecture.md` |
| 14 | Frontend vs. backend recommendation | Not redundant, but `Dashboard.tsx` fetches a result it never renders — see `recommendation-frontend-vs-backend.md` |
| 15 | Resources | 9 real articles, clean — see `resources.md` |

## Verification notes

1. `KV_SCHEMA`/`RELATIONS` read directly from `kv-audit-routes.ts` (lines 33-199, 268-303 as of this
   write-up) — not reconstructed from memory or inferred from route file names.
2. The footprint audit queried `kv_store_cc205da9` directly (`GROUP BY` on the regex-extracted
   leading `prefix:` segment of every live key) and diffed against `KV_SCHEMA` programmatically —
   not sampled or estimated.
3. The one gap found (`activity:daily:`) was traced to its actual writer (`index.tsx`'s
   `purge-activity-keys` endpoint, lines ~3786-3897) before being registered, confirming it's a real
   merge target and not a stray/abandoned key.
4. "Relations that hold vs. relations with breaks" classifications are based on this session's own
   fix history (the `getEquip()` slug bug, the enrollment double-shape bug, the `resource`/`category`
   slug-match audit logic) — each break cited is one that was either the direct cause of a bug
   already fixed this session, or is structurally the same shape as one that was.
5. The ghost-user deletion (5 of 7 rows) was a single `DELETE ... WHERE key IN (...)` statement,
   run only after confirming zero downstream references across `progress:`, `journal_by_user:`,
   `enrollment:`, `assessment_result:`, and `ikan_score:` for each of the 5 — the 2 rows with real
   downstream references were deliberately excluded, not missed.
