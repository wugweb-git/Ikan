# CLAUDE.md — iKan Health repo instructions

This file is read by AI coding assistants. It documents the conventions, architecture decisions, and sharp edges that aren't obvious from reading the code.

**Also read:** [`GOVERNANCE.md`](GOVERNANCE.md) (process rules — each one traces to a real incident), [`PENDING.md`](PENDING.md) (outstanding work, updated per deploy), [`CHANGELOG.md`](CHANGELOG.md) (dated record of what shipped).

---

## Stack (current)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 18.3.1 / TS 5 |
| Styling | Tailwind CSS v4 + Radix UI | 4.1.12 |
| Animation | Framer Motion | 12.x |
| Build | Vite | 6.3.5 |
| Backend | Supabase Edge Function (Deno + Hono) | single function |
| Database | Supabase Postgres KV table | `kv_store_cc205da9` |
| Auth | Supabase Auth | v2, email confirmation ON |
| Deployment | Vercel (frontend) + Supabase (backend) | |

---

## Critical: production branch is NOT main

**The live site deploys from branch `equip-carry-forward`.** `main` has diverged and is not used for production. Never tell the user to push to `main` expecting a production deploy.

### Deploy method — Vercel CLI only

Git-pushed builds auto-cancel at the project level. The only working deploy path is:

```bash
cd /Users/abcom/Documents/GitHub/ikan
npx vercel@latest deploy --prod --yes
```

`.vercel/` is gitignored and holds the local project link. The team is `wugweb` (team ID `team_8QvHezSgBzUD4STdma9lk5UF`).

---

## Backend — single monolithic edge function

All API routes live in one Deno/Hono function: **`make-server-cc205da9`**.

- Source: `src/supabase/functions/server/` (33 `.ts`/`.tsx` files, 18 of them `*-routes.ts` route modules)
- Entry point: `index.tsx` in that directory
- Routes: admin, assessment, brevo, checkin-template, contact, corporate, equip, health-connect, hero-banner, ikan-score, kv-audit, mood, newsletter, progress, recommendation, reminder, resource, scales (18 route modules; 33 files total in the directory, including shared services/types/middleware)
- Auth: `verify_jwt: true`. Routes use `requireAuth` (user JWT) or `requireAdmin` (admin JWT) middleware.
- Deploy: see `BUILD.md` — requires a staging directory trick because the Supabase CLI needs a project directory, not a subdirectory.

**Do not redeploy the edge function without smoke-testing** `/health`, assessments, equip, and scales endpoints afterwards. A bad deploy silently breaks the entire API.

---

## KV store model

Everything lives in one Postgres table `kv_store_cc205da9` with RLS enabled and **no policies** (service-role-only access via the edge function).

**Records relate to each other through fields inside the value, not through key structure.** This has bitten the codebase twice: an orphan-detector once checked for `idx_equip_days:`/`idx_day_blocks:` index keys to validate day/block records — those index prefixes don't exist and never have, so 328 correctly-linked records were reported as orphaned while the actual `equip_id`/`equip_day_id` fields went unchecked. Separately, a `resource → category` relation check assumed a `category_id` field when every resource actually stores a plain `category` string. Before writing a relation check, a cascade, or a migration, read a live record and confirm the field name — don't assume it matches a similarly-named entity.

**And confirm which of two representations is live before counting anything.** Equip content
exists twice: the inline `daily_content` array on the `equip:` record, which is what
`ProgramPlayer` and the admin editor actually read, and the standalone `day:`/`block:` rows,
whose REST surface was removed 2026-08-06 (`equip-routes.ts:210-214`) and which nothing reads.
The two disagree — 406 live blocks vs 223 dead ones, with different subtype values. Counting the
dead set produced a published figure that was wrong by 5x. The live census lives in
`src/docs/module-maps/census/`; diff against it rather than writing a fresh count.

Key prefixes:

| Prefix | Content |
|--------|---------|
| `assessment_def:{id}` | Assessment definition JSON |
| `assessment:{id}` | **DEAD for reads — nothing in the product reads this.** A write-only mirror of `assessment_def:{id}`. See the note below before touching it |
| `assessment_slug:{slug}` | → assessment id (slug index) |
| `equip:{id}` | Equip program metadata **and the live content tree** — the whole day/block structure is one inline `daily_content` array on this record |
| `equip_slug:{slug}` | → equip id (slug index) |
| `day:{id}` | **DEAD — nothing reads these.** Legacy program day (105 rows). Related to its equip via an `equip_id` field, not a key convention |
| `block:{id}` | **DEAD — nothing reads these.** Legacy content block (223 rows). Related to its day via `equip_day_id` |
| `security_event:{YYYY-MM-DD}` | Day-bucketed security events, capped at 5000/day. Public write; identity comes from a verified token, never the request body |
| `cms_page:{pageId}` | CMS page content (overrides code defaults) |
| `settings:site` | Global site settings (phone, email, etc.) |
| `checkin_scale:{key}` | Custom check-in scale (emoji set + labels) |
| `mood:{moodId}` | Mood-scale definition (emoji, label, colour, order) — **global config, not user data**. Verified live 2026-09-01: 5 rows, none user-scoped. Journal entries live under `journal:` / `journal_by_user:`. |
| `hc_data:{userId}` | Health Connect / Google Fit data |
| `user:{userId}` | User profile KV record |

---

## Migration in progress: user data → real tables

User data is being moved out of the KV blob into real Postgres tables, one entity at a time: **shadow tables + RLS → dual-write → cut over reads → retire the KV prefix.** Row counts change as usage continues; see `PENDING.md` §D for current status, not this file.

| Table | Source prefix | Status |
|-------|---------------|--------|
| `user_journal_entries` | `journal:` | Dual-writing (both write paths covered); reads still KV |
| `user_enrollments` | `enrollment:` | Shadow copy only |
| `user_program_progress` | `progress:` | Shadow copy only |
| `user_assessment_results` | `assessment_result:` | Shadow copy only |
| `user_ikan_scores` | `ikan_score:` | Shadow copy only |

- **KV is still the source of truth for every entity.** The edge function's read path is unchanged until an entity explicitly cuts over.
- Every row keeps its original KV record verbatim in a `data jsonb` column, so the migration is lossless and reversible (`DROP TABLE` returns you to the previous state).
- All five have **RLS with `auth.uid() = user_id`** — verified by impersonation test: a user sees only their own rows, service role sees all. The edge function uses the service role and so bypasses RLS.
- `kv_key` on each row links back to the originating KV key.
- Helper casts `try_numeric()` / `try_timestamptz()` exist because KV is untyped; EXECUTE is revoked from `anon`/`authenticated`.
- **There are two incompatible enrollment shapes in KV**, both introduced the same day: `enrollment:{enrollmentId}` (the real one, used everywhere) and `enrollment:{userId}:{equipId}` (defined in `progress-service.ts` but never actually written). Code that reads/writes enrollments must resolve by scanning `enrollment:` and matching `userId`/`programId` fields — not by constructing the composite key.

### `assessment:` is the fifth two-representations-of-one-entity — and it is dead

Audited 2026-09-02. `assessment_def:` is canonical and is read in **15** places (the player via
`/assessments/:id`, recommendation-service, ikan-score, progress, admin, index). `assessment:` is
read in **2**, and both are inside the sync routines themselves, checking existence before copying.
**No product code reads it.**

The writes are not symmetric — three writers touch only one side:

| site | writes |
|---|---|
| `admin-routes.ts:182-183, 216-217` (assessment save) | both |
| `admin-routes.ts:711` (bulk import/restore) | `assessment_def:` **only** |
| `admin-routes.ts:1429`, `kv-audit-routes.ts:890` (sync) | `assessment:` **only** |

And both sync routines guard on `if (!existingAssessment)` — they create a *missing* mirror and
never refresh a *stale* one. A bulk import through line 711 desyncs the mirror permanently while
the sync reports nothing to do. It is a sync that cannot re-sync, which is exactly how `day:` /
`block:` died.

The two are byte-identical today only because the assessment save writes both.

**To retire it, the order matters:** remove the mirror writes → deploy the function → then delete
the 7 rows. Deleting first just means the next save recreates them.

### Severity vocabulary — two types, not one

`category:` rows of type `severity_level` hold **5 ordered clinical terms**: `minimal ·
mild · moderate · moderately-severe · severe`. `low` and `high` used to live here too;
they moved to a new `response_tier` type (`low · moderate · high`) on 2026-09-02. They were
never one scale — `minimal` and `low` shared a colour *and* an icon because they were one
tier under two names, and no row carried an `order`, so the seven-way ordering existed only
as `SEVERITY_ORDER` in `recommendation-engine.ts`, asserting things nobody decided.

- **Rules match on `severity_level`** via a `min_severity` threshold. `response_tier` is for
  coarse presentation branching (tone, copy) and is *not* on the rule-matching path.
- **The severity → tier map is data:** each `severity_level` row carries a `tier` field.
  Resolution order is profile `tier_map` → catalog row → `DEFAULT_TIER_MAP` (fallback only).
- A band's **`label` and `severity_ref` are different fields.** "Poor Sleep" is copy;
  `moderate` is what the system reasons on. Deriving one from the other is why
  `getSeverityFromProfile` lower-cases and hyphenates a label and hopes.
- **`assessment_result.severity_hint` has never held a severity** — it stores the band label
  (`Completed` ×82, null ×40, `Poor Sleep`, `New Category`…). Zero of 140 carry a severity term.

Backup: `backup_pre_vocab_split_2026-09-02` (209 rows).

### Scoring specs — Sleep is authored, the other six are not

Sleep (`struggling-with-quality-sleep`) is the first assessment with a v2 spec, done 2026-09-02.
Backup: `backup_pre_sleep_scale_2026-09-02` (17 rows).

- **Option values are declared, not inferred.** Each option is now `{text, value}` with values
  **1-5**. The labels always read "1 …" to "5 …" while the scored weight was the array index, so
  the option displayed as "1" scored 0. Declaring 1-5 makes the labels honest and removes the
  `offset` concept. Option `text` was left byte-identical so the stored responses still resolve.
- **The per-question `scoring` map was updated in the same write.** Two code paths read option
  weights (`assessment-sections.ts` by value, `AssessmentFlow.tsx:287` by the map); changing one
  without the other splits them silently.
- **Total moved 0-32 → 8-40**, so `scoring.ranges` was re-tiled in the same pass. Leaving the old
  0-16/17-32 bands would have banded an 8-40 score against a 0-32 scale.
- **Three bands, not two.** Sleep has two rules gated at `moderate` and `moderately-severe`; two
  bands cannot distinguish two thresholds, so the `moderately-severe` rule would be dead on
  arrival once the join is fixed. Now `Healthy Sleep` (minimal) · `Poor Sleep` (moderate) ·
  `Very Poor Sleep` (severe), tiling 8→25→33→40 half-open.

**`scoring_provenance` on a result** records how its score was produced:

| state | meaning |
|---|---|
| `rescored` | recomputed under the current spec; carries `profile_id` and `profile_version` |
| `pre-spec` | could not be re-scored honestly; original score untouched, `excluded_from_trends: true` |

Sleep: 7 unique results re-scored, 3 stamped `pre-spec`. Note the stored scores were **not all
produced the same way** — most shifted by exactly +8 as expected from 0-based → 1-based, but two
did not move at all, and one moved from "Poor Sleep" to "Healthy Sleep" as a genuine correction.

### Three ways a score has been computed — and how to tell which

Historical scores were **not all produced the same way**. Two writers are confirmed, split by
date, found by comparing stored Sleep scores against both readings of the same responses:

| completed | how the score was computed |
|---|---|
| up to ~2026-03-16 | **leading digit of the option label** (`"1 0-15 minutes"` → 1) |
| from ~2026-05-25 | **array index** (`"1 0-15 minutes"` → 0) |

This only matters where the two disagree, i.e. where option labels are **1-based**. Census of
the first option of every question:

| assessments | first option | base | ambiguous? |
|---|---|---|---|
| Depression, Burnout, Anxiety, Balance, Sleep, General | `1 Not at all`, `1 - Never`, `1 Never`, `1 0-1`, `1 At no time` | 1-based | **yes** |
| Stress | `0 - Never` | 0-based | no — both readings agree |

So six of seven carry the ambiguity. Do not assume an unchanged score means an unchanged
scoring path; check the date and the label base together.

### Answers are stored as display text, so rewording an option orphans history

`responses` stores the option's **label**, not its value or an option id. Rewording an option
therefore detaches every stored answer to it — silently, because the key still resolves.

Measured on Stress: `"3 - Often"` (43 answers) and `"1 - Rarely"` (29) match no current option;
the options had been reworded to `"3 - Fairly Often"` and `"1 - Almost Never"`. Exact-text
matching recovered only 10 of 38 results; falling back to the **leading digit** recovered 27.

That fallback is only safe where the leading digit equals the declared option value — true for
Stress (0-based, values 0-4). **It is not generally safe**, and it is a recovery, not a fix.

Balance proves the limit. Its stored answers come from **two different instruments**:

| stored answers | scale | values |
|---|---|---|
| `1 Never` · `2 Rarely` · `4 Often` · `5 Very Often` | frequency (current) | 1-5 |
| `0 - Strongly Disagree` … `4 - Strongly Agree` | **agreement** (former) | 0-4 |

The response scale was replaced, not reworded. `"2 - Neutral"` and `"2 Rarely"` share a leading
digit and mean nothing alike, and `"0 - Strongly Disagree"` has no digit match at all. Applying
the fallback here would have produced a plausible, wrong number — so Balance is re-scored on
**exact option-text match only**. Check which case you are in before reaching for the fallback.

The fix for all of it is to store the option's value or a stable option id alongside the label.

### The player scores from the spec, with a transitional fallback

`AssessmentFlow` computes from the assessment's own `scores[]` when the spec exists **and** its
profiles have loaded, via `buildScoringContext` → `computeScores` → `toSectionScoreResult`.
Otherwise it falls back to `SECTION_PRESETS`.

**The fallback is temporary.** It exists only because `GET /scoring-profiles` is not deployed, so
a non-admin cannot fetch profiles and would otherwise get no score at all. When that route is
live, delete the fallback branch, `assessment-section-presets.ts` and `assessment-sections.ts`
together — until then the code presets and the live specs are a seventh
two-representations-of-one-entity, kept in step **by hand** (both were edited together for
Burnout's 8/5/5/5 and General's 7/7). A spec whose profiles fail to load logs a warning naming the
assessment.

`computeScores` honours each profile's `missing` policy — `invalidate` produces no value and a
reason, `prorate` scales the answered items up, `zero` treats an unanswered item as zero — rather
than presenting a partial instrument as a complete one. `resolveAnswer` matches option **text**
only and has deliberately **no leading-digit fallback**: whether the digit equals the value
differs per assessment, and several carry answers from a replaced scale whose labels collide with
the current ones at a different value.

**Risk-indicator detection reads both sources** (a question's `is_risk_indicator` and the preset's
`riskIndicatorQuestionIds`) so it works on either path, and fires when the answer exceeds that
question's **own lowest option value**, not zero. Option values are no longer all 0-based: on a
1-5 scale `v > 0` is true for every possible answer, which would have fired the crisis panel on
"Never". `general-q5` is the only flagged question live, and its scale is 0-3.

### Question text is mutable — and now recorded

Guardrail 11 protects **identity**, not content. `burnout-q9`'s clobber passed every guard it
defines: the id survived, only the text changed. Nothing wrote down what a question used to say,
so recovering the original wording meant tracing six backups across two representations.

Each write path now diffs question text against the saved record and appends
`{from, to, at, by}` to that question's **`text_history`** (capped at 20, oldest dropped first;
the backups remain the long-tail record). It blocks nothing — text must stay editable — it makes
the change legible. Check `text_history` before reaching for a backup.

The three asymmetric `assessment:` writers, at current line numbers: **`admin-routes.ts:816`**
writes `assessment_def:` only (bulk import), **`admin-routes.ts:1534`** and
**`kv-audit-routes.ts:890`** write the mirror only (the syncs). Lines **264-265, 321-322, 364-365**
write both. All six must be dealt with when retiring the mirror.

### Guardrail 11 — question ids are immutable once scored

Once a **saved** scoring spec references a `question.id`, that id is fixed for the life of the
assessment. Content stays mutable; identity does not.

| allowed | blocked |
|---|---|
| edit question text · change options · change `scale_ref` · toggle `is_scored` / `is_risk_indicator` · **reorder** | rename a scored id · delete a scored question · reuse a retired id · duplicate ids · a score referencing an unknown question |

Reordering is allowed because after the 2026-09-02 rename an id is a name, not a slot.

Enforced at the **assessment save** — `POST` and `PUT /admin/assessments` — not the spec save,
because that is where an id can actually disappear. Returns **409** naming the blocking scores:

> `"burnout-q11" is referenced by score "Mental distance". Retire it instead, or remove it from
> those scores first.`

**Retire, don't delete.** Drop the id from every score and list it in `retired_question_ids`; the
server merges that into a ledger it only ever appends to, so the id can never be reused and the
stored responses keyed to it keep resolving. An assessment with no saved spec constrains nothing.

Note the `POST` path used never to read the existing record, so a POST carrying an existing id
overwrote it with no checks at all. It now reads and validates like `PUT`.

### Recommendation rules — the join, fixed 2026-09-03

Rules match on the **assessment's category slug**, which both sides genuinely hold:
`assessment_def.category` and `recommendation_rule.assessment_category` (`anxiety`, `burnout`, …).

Before this, `findMatchingAdminRules` compared a capitalised display word ("Anxiety") against a
lower-cased *assessment id* — and `AssessmentFlow` passed `assessment.id`, so the argument was an
`asm_…` string. **No rule had ever matched.** Every recommendation in the product came from a
hardcoded default keyed on a coarse tier. All 18 rules were normalised to the slug and given an
explicit `recommendation_type` (all `equip`; none carried one, so `loadAdminRules` had been
defaulting them silently). Backup: `backup_pre_rule_join_fix_2026-09-03`.

Three things were deleted rather than fixed:

- **The slug substring sniff** — `slug.includes('sleep')` → `'sleep-tight'`.
- **The fall-through** to `rule.recommend.equipIds[0]`. Between them, every user got a hardcoded
  programme dressed as a recommendation. **No matching rule now means no primary action.**
- **`SEVERITY_ORDER`**, the hand-written 7-term table. Threshold comparison uses `compareSeverity`
  on the 5-term clinical vocabulary; an unrecognised term on either side means *no match* (it
  previously defaulted both sides to `moderate`, so a typo'd threshold became a live one).

`evaluateAssessment` now takes an options object (`{slug, category, score, maxScore,
scoringProfileId}`) so a call site cannot silently omit the matching key. `EngineResult` carries
both `severity` (3-term response tier, for copy and tone) and `severityLevel` (5-term clinical,
what rules matched on).

Rule-authored copy (`title`, `body`, `cta`) renders nothing when empty rather than substituting a
slogan. The generic secondary labels — "Track your progress", "Reflect on your journey" — are
still hardcoded, because they come from `config.rules[tier].recommend.secondary` rather than from
a rule.

### Declaring option values: the instrument decides, not the label

Every question's option labels carry a leading digit, and that digit is **not** always the value.
The rule, applied per assessment:

| kind | who defines the value | examples |
|---|---|---|
| **Validated instrument** | the published scoring | GAD-7, PHQ-2/9, WHO-5, BAT — labels are display text |
| **Custom instrument** | the labels, since there are no external norms | Sleep, Stress, Balance |

Anxiety is the case that forces the distinction. Its labels read `1 Not at all` … `4 Nearly every
day`, but its live bands are the published GAD-7 cutoffs (0-4 / 5-9 / 10-14 / 15-21) which require
**0-3** per item. Declaring 1-4 would have made the total 7-28 and broken correspondence with the
literature. Sleep, by contrast, has no published norms, so its 1-based labels *are* the statement
of intent and 1-5 was correct there.

**This also means the leading-digit recovery fallback differs per assessment**, and getting it
wrong is silent:

| assessment | relationship | fallback |
|---|---|---|
| Stress | digit **=** value (0-based labels, 0-4) | safe |
| Anxiety | digit **− 1** = value (1-based labels, 0-3) | reusing Stress's rule inflates every score by 7 |
| Balance, Anxiety | answers exist from a *replaced* scale | no fallback is valid — exact match only |

### Scoring specs — all seven authored

Backups: `backup_pre_sleep_scale_2026-09-02` (17 rows), `backup_pre_stress_scale_2026-09-03` (45).

| | Sleep | Stress | Balance | Anxiety | Depression |
|---|---|---|---|---|---|
| declared values | 1-5 (was 0-4) | 0-4 (already agreed) | 1-5 | **0-3** | **0-3** |
| achievable | 0-32 → **8-40** | 0-28 | 0-32 → **8-40** | 0-21 | 0-27 |
| bands | 2 → **3** | 3 | 3, +8 | 4 | **5** |
| severity refs | minimal·moderate·severe | minimal·moderate·mod-severe | minimal·mild·moderate | minimal·mild·moderate·severe | all five |
| reversed items | — | — | **5 of 8** | — | — |
| scores | 1 | 1 | 1 | **2** (GAD-7 + PHQ-2) | **2** (PHQ-9-derived + GAD-2) |
| excluded items | — | — | — | `anxiety-q8` | `depression-q10` |
| re-scored | 7 | 27 (73 answers by digit) | 1 (exact only) | 4 (exact only) | 2 (exact only) |
| stamped `pre-spec` | 3 | 11 | 2 | 1 | 1 |

Burnout: 5 scores, 23/23 coverage, 1 re-scored (overall mean 3.61 → "Normal"), 4 stamped.

**Every assessment after Stress needed exact-text matching.** Balance, Anxiety and Burnout each
carry answers from a former 0-4 frequency scale. Burnout is the sharpest case: the old labels
*collide* with the current BAT ones at a different value — old `"3 - Often"` was 3, current
`"4 - Often"` is 4 — so a digit-based recovery would silently shift every such answer one point.

**The depression assessment is not PHQ-9 and must not be described as it.** Its item 9 carries
softened local wording in place of PHQ-9's validated item, so the 0-27 range and the 5/10/15/20
edges are PHQ-9-*derived*, not validated cut-offs. GAD-7 and the embedded GAD-2/PHQ-2 screens are
unmodified and may be named as such.

`depression-q9` ("Feeling that life is meaningless") stays **scored and unflagged** — decided
2026-09-03. The crisis pathway (`triggerCrisisSupport` in `AssessmentFlow.tsx`) therefore fires
only from General's `general-q5`.

**Burnout** — declared 1-5 (BAT published), five scores on `calc: 'mean'`, sub-scale values 1-5.
Allocation is **BAT-23 8/5/5/5, decided 2026-09-03**: Exhaustion q1-q8, Mental distance q9-q13,
Cognitive q14-q18, Emotional q19-q23, plus an overall mean across all 23. `burnout-q11` is now
scored (it previously belonged to no section). Every item feeds two scores — its sub-scale and the
overall — which the coverage meter treats as legal; coverage reads 23/23.

**`burnout-q9` was never a duplicate — restored 2026-09-03.** Its text in `questions[]` had been
overwritten with q10's autopilot wording; the original survived as the `title` on the same block
(`block-1773730436410`) in `daily_content`. It was briefly retired as a duplicate on the strength
of the matching text, then restored: text put back from `daily_content`, un-retired, returned to
`bat-mental-distance` and `bat-overall`. Burnout is **23 items at 8/5/5/5**.

**Do not de-duplicate two questions on matching text alone — check `daily_content` first.**
`questions[]` is canonical and player-facing, but it is the representation that was clobbered
here; the builder cache held the only surviving copy.

Three id schemes have used the string `burnout-q9`: pre-rename it was "I feel under-appreciated"
(now `burnout-q7`), post-rename it is this item, and an older `daily_content` snapshot binds it a
third way. **Any restore must state which scheme its source is in.**

The three stored answers for q9 were collected while the question displayed the *autopilot* text,
so they are excluded from scoring — the raw answers are retained on the record and the affected
results carry `answered: 22, expected: 23, complete: false` with a note. Backups:
`backup_pre_burnout_dedup_2026-09-03`, `backup_pre_burnout_q9_restore_2026-09-03`.

Note the bands did **not** need re-tiling. `calc` is `mean`, so the achievable range is 1-5
whatever the item count — removing an item moves the computed value, not the range.

Two things about Burnout are deliberate and look wrong:

- **q1 and q2 read as mental-distance items but sit in Exhaustion.** That is BAT-23's structure by
  published item order, chosen over the semantic grouping this file's header comment argues for.
  `BURNOUT_SECTIONS` and the live spec must be kept in step.
- **Its bands have decimal edges** (1-3, 3-4.31, 4.31-5 on a mean), so
  `projectBandsToClosedRanges` refuses and `scoring.ranges` is hand-written rather than derived.
  It is the one assessment where that list is not generated. The previous ranges banded a 0-40
  sum, which matched nothing on the record.

**General** — five independent scales, **no overall** ("Overall Score: NIL"). Per the source
scoring sheet: Anxiety q1-2, Depression q3-4, Wellbeing q6-10 ×4, **Self-efficacy q11-17,
Resilience q18-24** — a 7/7 split, not the published NGSE-8 / BRS-6 this file's header argues for.
Decided 2026-09-03 from the spec sheet; `GENERAL_SECTIONS` and the live record use the same split.
Both are sums, not means. `general-q5` is `is_scored: false` + `is_risk_indicator: true`.

Option values vary by scale on this one record: **q1-q10 are 0-based** (GAD-2/PHQ-2 0-3, WHO-5
0-5), **q11-q24 are 1-5**. Its `scoring.ranges` is now empty — it previously held three identical
"New Category" 0-10 placeholders — and results carry a `scores` array instead. The top-level
`score`/`max_score` on a General result are a **legacy mixed-scale sum and are not a General
result**; the provenance note on each re-scored row says so.

**`offset` no longer exists anywhere.** All 24 × 7 questions now carry explicit option values, so
`questions_without_declared_values` is 0 and the derived-scale save gate passes across the board.

Totals: **11 scoring profiles, 47 results re-scored, 26 stamped `pre-spec`.** Profiles are reused
across assessments — `gad2-screen` serves both Depression's embedded screen and General's anxiety
scale, `phq2-screen` likewise — which is what a profile never naming a question buys.

Anxiety is the first **multi-score** assessment: `gad7-total` over q1-q7 and `phq2-total` over
q9-q10, with `anxiety-q8` — the functional-impairment item, administered with the scale but never
summed into it — marked `is_scored: false` so it appears in the coverage meter's *excluded* list
rather than silently missing. Coverage reads 9 of 9.

Band → severity mapping is chosen so an assessment's **rules stay distinguishable**. Balance has
two rules gated at `mild` and `moderate`, so its middle band is `mild`: with
minimal/moderate/moderately-severe both rules would fire on exactly the same bands. Stress's top
band is `moderately-severe` rather than `severe` — a brief screener with no validated cutoffs,
and the response tier is `high` either way, so the choice is behaviourally neutral.

**Balance's reversal is the one that shipped backwards once.** The five *positively*-worded items
(q1, q3, q4, q5, q7) are reversed, not the three negative ones. The check: a consistently
well-balanced person — positives "Very Often", negatives "Never" — must score the **floor** (8,
"Balanced"). Reversing the negatives instead gives that same person 40, "Imbalanced", with
arithmetic that runs perfectly.

Sleep's option `text` was left byte-identical so stored responses still resolve. Stress's old
scores were computed over a **10-item** instrument against a band ceiling sized for 7 (a stored
score of 30 against a 28 max), so re-scoring corrects a live inconsistency rather than merely
restating it.

**`scoring.ranges` is generated, not maintained.** `deriveScoringRanges` in `admin-routes.ts`
projects `scores[].bands` down to the closed intervals the player still reads, via
`projectBandsToClosedRanges` in `scoring-validation.ts`. The conversion is the one rule every
legacy band set needs, since they were all authored closed:

    [a, b)  ->  [a, b-1]   every band except the last
    [a, b]  ->  [a, b]     the last keeps its ceiling

Decimal edges get **no** projection — a closed reader takes the first matching band, so a value
on a decimal boundary would resolve to the lower band, the opposite of half-open. The derivation
deletes itself when the player learns to read `scores[]`.

**`missing: { min_answered: n, on_missing: 'invalidate' }`** is deliberate on both. A short
instrument should not prorate. It does mean partial-save-and-resume produces an *invalid* result
rather than a partial one — chosen, not overlooked.

### Assessment question ids and the `_legacy:` response convention

Question ids were normalised to `<instrument>-q<n>` (n sequential in stored order) on
2026-09-02 — 77 of 92 renamed, backup in `backup_pre_id_rename_2026-09-02`. Every question
also carries `interaction: 'select-one'`. **Question ids are immutable once a scoring spec
references them.**

Stored results held answers keyed to *deleted* questions whose ids collided with the new
ones — 26 Stress results carried a historical `stress-q1`/`q2`/`q3` from questions removed
long ago, exactly the ids the rename was about to mint for old `stress-q4`/`q5`/`q6`. Those
orphans are preserved as **`_legacy:{old-id}`** inside the result's `responses` object
(271 keys across 105 rows). A key under `responses` is therefore either a live question id
or `_legacy:`-prefixed — never anything else. Scoring must ignore `_legacy:` keys.

Not every stored result can be re-scored: **50 of 73** have every live question id present
with a parseable value. The rest answer a retired generation of questions (`q-1767180…` ids,
multi-select arrays) or are partial. `assessment_response_by_user:` carries no question ids
at all — only `{date, response_id, assessment_id}` — so it needs no migration when ids change.

Known data notes: `assessment_result:` stores each result twice in KV (canonical `…:{resultId}` plus a `…:{assessmentId}:latest` copy) — the tables hold 93 de-duplicated logical results, no data lost. `assessment_id` has no FK because it legitimately holds synthetic check-in ids (`checkin_{equipId}_day_N`).

## CMS content architecture

`usePageContent` (`src/hooks/usePageContent.ts`) fetches from `/cms/pages/{pageId}` with stale-while-revalidate. The code defaults in `src/utils/cms-defaults.ts` render immediately; live KV data overrides them.

**When changing any CMS-backed content (contact info, crisis resources, team copy, etc.) you must update BOTH:**
1. The default in `src/utils/cms-defaults.ts`
2. The live record in Supabase KV (via edge function admin endpoint or SQL) so production overrides don't hide your change.

---

## Slug URL system

`src/lib/slug.ts` exports `slugify()`, `assessmentUrl()`, `equipUrl()`. Routes `/assessment/<slug>` and `/equip/<slug>` are handled in `App.tsx` at three sync points: initial `useState`, `handleNavigate`, and `popstate`. The backend resolves both id and slug via a fallback lookup.

---

## Auth

- Email confirmation is ON. New users get a Supabase native confirmation email.
- `/reset-password` route exists (`src/components/screens/ResetPassword.tsx`).
- Auto-create-on-failed-login has been **removed** from `AuthContext.tsx`.
- Leaked-password protection is **not** enabled yet — this needs to be turned on from the Supabase dashboard (Auth → Providers). See `PENDING.md` §A.
- Supabase OAuth provider: Google (for Google Fit linking via `linkIdentity`).

---

## Don'ts

- **Don't push to `main` expecting a production deploy.** Use the Vercel CLI.
- **Don't blindly bump major dependency versions.** React 18→19, Vite 6→8, Tailwind 4→next, etc. are breaking changes that need a dedicated session with full test coverage.
- **Don't enable `email_confirm: false` in the edge function signup path.** That backdoor was removed in Batch 4. Users must verify their email.
- **Don't add `EXECUTE` grants on `kv_store_row_count()` or `rls_auto_enable()` to `anon`/`authenticated`/`PUBLIC`.** These SECURITY DEFINER functions are locked down intentionally.
- **Don't delete `wrappers_fdw_stats`** — it's extension-owned. It shows as a `rls_disabled_in_public` ERROR in the security advisor; RLS **can** be enabled on it, but only from the Supabase dashboard ("Resolve issue"), because the table is owned by `supabase_admin` and `ALTER TABLE` from a migration fails with `42501: must be owner of table`.
- **Don't purge KV by prefix without checking `KEY_REGISTRY`** (`server/kv-audit-routes.ts`). Reverse-index keys (`assessment_slug:`, `equip_slug:`, `page_slug:`) look like orphans but are load-bearing — purging `assessment_slug:` once broke every `/assessment/<slug>` URL site-wide. The purge endpoint now refuses protected prefixes and requires `force` for registered ones. **Any new KV prefix must be added to `KEY_REGISTRY` in the same commit that introduces it** — see `GOVERNANCE.md` Rule 2 for why this is non-negotiable, not just tidy.
- **Don't store secrets in code.** `SUPABASE_SERVICE_ROLE_KEY` lives only in Vercel env + the edge function runtime. The anon key in `src/lib/supabase-client.ts` is public by design.

---

## Key file map

| What | Where |
|------|-------|
| App shell + routing | `src/App.tsx` |
| Auth context | `src/contexts/AuthContext.tsx` |
| API client | `src/lib/api-client.ts` |
| Supabase client | `src/lib/supabase-client.ts` |
| CMS defaults | `src/utils/cms-defaults.ts` |
| Slug helpers | `src/lib/slug.ts` |
| Health Connect / Google Fit | `src/components/integrations/GoogleFitContext.tsx`, `src/lib/google-fit.ts` |
| Design system tokens | `src/styles/globals.css` |
| Edge function entry | `src/supabase/functions/server/index.tsx` |
| Brand docs | `BRAND.md` |
| Build/deploy steps | `BUILD.md` |
| Architecture deep-dive | `DESIGN.md` |
| Stale docs archive | `src/docs/archive/` |
