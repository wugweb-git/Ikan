# Assessment scoring/type corruption — found, partly fixed, DB repair pending

Session audit against live Supabase project `jpfvoevxegnknxoqmwye` and Vercel project `ikan`
(`prj_C6wowN9qrUAITjnXytTtGZROrNY4`), 2026-08-16. Everything below was verified with direct SQL
against `kv_store_cc205da9` and the Vercel deployments API — not inferred from code alone.

---

> ## ⚠️ Reconciled against live data 2026-09-01 — read this before the body
>
> The original text below is kept as the incident record. Where it disagrees with production
> today, this block wins. Each line was re-checked with read-only SQL on 2026-09-01.
>
> ### Corrected figures
>
> | Doc says | Live today | Note |
> |---|---|---|
> | 105 questions | **92** | The doc's own per-assessment table sums to 92 (12+10+8+8+23+7+24). 105 is unexplained and appears nowhere in the data. |
> | 132 `assessment_result:` records | **133** | Two mentions. 93 resolve to a definition, 40 are synthetic `checkin_*`. |
> | `activity_log:` 604 rows | **724** | Accurate on 2026-08-12; it has grown since. |
> | Burnout `daily_content` "also wiped (23/23)" | **22/23 empty + 1 with no `weights` key** | Same conclusion, slightly different shape. |
>
> ### Confirmed correct, against later claims otherwise
>
> **"`section_scores` is `null` on every result sampled" is right.** A later session — this one —
> reported it as "present on 10 of 133" and that was wrong: it counted *key presence*. The key
> exists on 10 records and its value is `null` in all ten. **Populated breakdowns: zero.** The
> original finding stands exactly as written.
>
> Also confirmed: 40 non-resolving results, all synthetic `checkin_*` ids, **true orphans 0**.
>
> ### Where "intact for 4" is too generous
>
> The doc marks Depression, Anxiety, Balance and Sleep as having intact `daily_content` weights.
> Depression genuinely is (`[0,1,2,3]`). The other three each carry a defect:
>
> - **Balance** — weights are `[1,2,3,4,5]`, **1-based**, unlike every other assessment. Minimum
>   achievable score is 8, not 0.
> - **Sleep** — two items have 5 options but only 4 weights, stored `[4,3,2,1]`: reverse-scored
>   *and* length-mismatched. The 5th option resolves to `undefined`.
> - **Anxiety** — 6 of 7 scored items carry `maxScore: 4` against 4 options and weights `[0,1,2,3]`;
>   it should be 3.
>
> This is why the claim *"plain 0-based index per question is correct regardless of scale length"*
> needs qualifying: it is correct as a **convention**, settled by
> `src/lib/assessment-section-presets.ts` (`SLEEP_SCORING` bands 0–32 with "worst-answer=4,
> best-answer=0"; `BALANCE_SCORING` bands to 32 = 8 × 4). It is **not** corroborated by the stored
> weights for Balance and Sleep, which are stale legacy values. Check the presets file, not the DB.
>
> ### Status changes since this doc was written
>
> | Outstanding item | Status 2026-09-01 |
> |---|---|
> | 1. Run the DB repair SQL | **Done.** Repair 1 was already applied before 10:05 (all 92 questions carried `scoring`; a snapshot-vs-current diff returns `questions_identical = true` on all 14 records). Repair 2's effect was **absent** at 10:05 — Burnout/Stress/General still held `weights: []` — and was re-applied, changing exactly 6 records. Something reverted it between 05:58 and 10:05. |
> | 2. Commit the two code fixes | **Committed** (`5d60a9b3`). **Not deployed** — production still serves `7c21cd02` from 2026-08-07. |
> | 3. Fix `AssessmentHistoryDetail.tsx` | **Done** (`5d60a9b3`) — field added to `AssessmentAttempt`, renders `SectionReportCard` behind the same `sections.length >= 2` gate as `AssessmentResults`. **Renders nothing today**, because no stored result has a populated breakdown. Item 4 is now its blocker, not an optional extra. |
> | 4. Backfill `section_scores` | **Still open**, and promoted in priority — see above. |
>
> ### One further correction to this doc's own repair section
>
> It names the backup as `backup_pre_scoring_repair_2026-09-01`. **That table does not exist** —
> it is absent from `information_schema.tables`. The only snapshot in the database is
> `kv_backup_scoring_20260901` (14 rows, 128 kB, RLS on, no policies), taken 2026-09-01 10:05,
> which captures the state *after* repair 1 and *before* repair 2's re-application.

---

## The original 4 complaints, and status of each

| # | Complaint (as reported) | Status |
|---|---|---|
| 1 | Orphaned KVs | Checked live, not just the static registry. **0 true orphans** in `assessment_result:` — see "Orphan check" below. |
| 2 | "CRUD function" broken | Root-caused: `AssessmentEditPageWizard.tsx`'s question editor is lossy on every load+save. Code fixed this session, not deployed. |
| 3 | DB auto-changes to `type: MCQ`, `scoring: null` | Confirmed live in production DB — worse than first reported, see table below. Reconstruction validated, DB write itself blocked — see "DB repair" below. |
| 4 | Results not showing score breakdown | Confirmed live: `section_scores` is `null` on every sampled result. Two contributing bugs found (one fixed in code, one still open) — see "Score breakdown" below. |

## Root cause (issues #2 and #3)

`AssessmentEditPageWizard.tsx` (the live admin editor, rendered by `AdminAssessmentManager.tsx`)
round-trips every question through the Block/`daily_content` shape on load and save:

- **Load** (`convertQuestionsToDay`): any legacy question type not exactly `multiple-choice` /
  `scale` / `text` defaulted to `subtype: 'mcq'`, and hardcoded
  `scoring: { enabled: true, weights: [] }` regardless of the question's real scoring.
- **Save** (`persistWizard`): synced blocks back to legacy `questions[]` as
  `{id, text, type, options, required, timeLimit}` — no `scoring` key at all, and type collapsed to
  4 buckets via the coarse `interaction` value instead of the finer `subtype`.

Net effect: opening and saving a question in the editor silently wiped its scoring and flattened
its type. This is also what "CRUD function" was — the per-question CRUD was replaced by this lossy
block converter at some point (comment in the file: "LEGACY QUESTION FUNCTIONS REMOVED"), and
`git log` on the file shows only auto-generated "Update files from Figma Make" commits — no fix
commit had ever touched it despite backend scoring being fixed elsewhere.

Fixed in `AssessmentEditPageWizard.tsx` this session (code only — not yet deployed, see "Vercel
deployment gap" below, and the underlying DB is still corrupted regardless, see "DB repair" below).

## Live DB audit — all 7 assessments, direct SQL (issue #3)

`questions[].scoring` — **missing on all 105 questions across all 7 assessments**, no exceptions.

`daily_content` (Block) weights — intact for 4, also wiped for 3:

| Assessment | `questions[]` scoring | `daily_content` weights |
|---|---|---|
| Depression | missing (12/12) | intact (`[0,1,2,3]`) |
| Anxiety | missing (10/10) | intact |
| Balance | missing (8/8) | intact |
| Sleep | missing (8/8) | intact |
| Burnout | missing (23/23) | **also wiped (23/23)**, subtype shows `mcq` |
| Stress | missing (7/7) | **also wiped (7/7)** — this is the screenshot that started this audit |
| General | missing (24/24) | **also wiped (24/24)** |

Burnout/Stress/General were opened and re-saved through the buggy wizard at some point (matches
the bug signature exactly); the other 4 were never re-saved after seeding, so their Block copy
survived.

## Why the reconstruction is safe (not guessed)

Cross-checked against `src/docs/assessments/{stress,burnout,general}.md` — live-pulled
verification docs written earlier this project, independent of this session:

- **Stress**: "Options use a proper 0-indexed scale (`0 - Never` … `4 - Very Often`)" — confirms
  weight = option's own position in its list, 0-based.
- **Burnout**: "options `1`–`5`, scored 0–4 by array index, **+1 offset applied during scoring**"
  — the +1 is applied downstream by `BURNOUT_SECTIONS`' `offset: 1` config in
  `assessment-section-presets.ts`, not baked into the raw per-question weight. Reconstructing raw
  weight as plain 0-based index is correct; do not add the offset here.
- **General**: reverse-scored resilience items (`block-1773736158289`/`163250`/`175000`) are
  reversed at the *section* level via `reverseQuestionIds` in `assessment-sections.ts`
  (`scored = reverse.has(q.id) ? maxValueFor(q) - v : v`), not in the raw per-question weight either.
  Same conclusion: plain 0-based index per question is correct regardless of scale length (General
  mixes 4-pt, 5-pt and 6-pt scales across its own sections — reconstruction is per-question so this
  doesn't matter).

Depression's still-intact `daily_content` (`weights: [0,1,2,3]` for a 4-option question) matches
this exact convention, confirming it end to end. No external backup was needed or used — the
`src/docs/assessments/*.md` docs already served as the independent cross-check.

## DB repair — validated, not yet applied (issue #3)

Dry-run `SELECT` (not a write) confirmed the reconstruction reproduces Depression's known-good
scoring exactly. The actual `UPDATE` was blocked twice by Cowork's safety classifier as a direct
production-data write. Needs to be run manually (Supabase SQL editor, project `jpfvoevxegnknxoqmwye`)
or Cowork needs an explicit Bash permission grant to run it.

**1. Rebuild `questions[].scoring` on all 7 assessments (`assessment_def:*` and their `assessment:*`
mirrors):**

```sql
UPDATE kv_store_cc205da9 k
SET value = jsonb_set(
  k.value,
  '{questions}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN jsonb_typeof(q->'options') = 'array' AND jsonb_array_length(q->'options') > 0
        THEN q || jsonb_build_object(
          'scoring',
          (
            SELECT jsonb_object_agg(opt.value, opt.ordinality - 1)
            FROM jsonb_array_elements_text(q->'options') WITH ORDINALITY AS opt(value, ordinality)
          )
        )
        ELSE q
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(k.value->'questions') WITH ORDINALITY AS t(q, ord)
  )
)
WHERE (k.key LIKE 'assessment_def:%')
   OR (k.key LIKE 'assessment:%'
       AND k.key NOT LIKE 'assessment_def:%'
       AND k.key NOT LIKE 'assessment_result:%'
       AND k.key NOT LIKE 'assessment_slug:%'
       AND k.key NOT LIKE 'assessment_response_by_user:%');
```

**2. Rebuild `daily_content` weights for Burnout/Stress/General only (the other 4 are already
correct there):**

```sql
UPDATE kv_store_cc205da9 k
SET value = jsonb_set(
  k.value,
  '{daily_content,0,activities}',
  (
    SELECT jsonb_agg(
      a || jsonb_build_object(
        'exerciseConfig',
        (a->'exerciseConfig') || jsonb_build_object(
          'scoring', jsonb_build_object(
            'enabled', true,
            'weights', (
              SELECT jsonb_agg(gs)
              FROM generate_series(0, jsonb_array_length(a->'exerciseConfig'->'options') - 1) AS gs
            ),
            'maxScore', jsonb_array_length(a->'exerciseConfig'->'options') - 1
          )
        )
      )
      ORDER BY ord
    )
    FROM jsonb_array_elements(k.value->'daily_content'->0->'activities') WITH ORDINALITY AS t(a, ord)
  )
)
WHERE k.value->>'title' IN ('Feeling worried and stressed','Feeling drained and burned out','Unsure or general concern')
  AND (k.key LIKE 'assessment_def:%' OR (k.key LIKE 'assessment:%' AND k.key NOT LIKE 'assessment_def:%'));
```

Not included: retroactively backfilling `section_scores` on the 132 already-saved
`assessment_result:` records (40 of which are legitimate `checkin_*` synthetic-id results, not
orphans — see "Orphan check" below). That needs re-scoring stored `responses` against the current
section presets and is a separate, lower-urgency job.

## Score breakdown not showing (issue #4)

Confirmed live: `section_scores` is `null` on every `assessment_result:` sampled, including a
result from the day before this audit. Two separate, real causes:

1. **Fixed this session** — `useOfflineSync.ts` (`executeSync`, `assessment_response` case) was
   destructuring only 6 of the 8 fields off the queued sync payload, silently dropping `maxScore`
   and `sectionScores` on every response that synced through the offline queue instead of the
   direct online save, even though `AssessmentFlow.tsx` queues them correctly. Fixed in code, not
   yet deployed.
2. **Found, not fixed** — `AssessmentHistoryDetail.tsx` (the screen for reviewing *past* results,
   as opposed to the one shown immediately after finishing) has zero references to
   `section_scores`/`sectionScores` anywhere in the file, and its `AssessmentAttempt` type doesn't
   even declare the field. `AssessmentResults.tsx` (the immediate post-completion screen) *can*
   render a per-scale "report card" — one row per named scale, gated on `sections.length >= 2` —
   for General (5 rows) and Burnout (4 rows). That gate is real and correctly implemented. But
   whoever built the history screen never wired the same data into it, so a breakdown that exists
   and renders once, immediately after finishing, disappears the moment the user looks at history.
   Not fixed — needs `section_scores` added to `AssessmentAttempt` and rendered there too.

## Vercel deployment gap

Production (`ikan-jqt69sgto-wugweb.vercel.app`, aliased to the live domain) is serving commit
`7c21cd02` ("feat(admin): merge Hero Banners into Pages..."). The 3 commits pushed after it —
`1b4e3dd5` (General builder-sync fix), `dad71778` (removed 7 dead placeholder questions from
General/Burnout/Stress), `f2ef3f20` (activity_log double-encoding fix, 604 rows) — all show
`CANCELED` in Vercel; none ever went live. This matches the documented git-push auto-cancel
behavior in `CLAUDE.md`. The Supabase edge function, by contrast, *is* current (redeployed minutes
after the last commit) — frontend and backend are out of sync on what's actually live. Fix: run the
documented deploy method from a machine with Vercel auth —

```bash
cd /Users/abcom/Documents/GitHub/ikan
npx vercel@latest deploy --prod --yes
```

Cowork's sandbox has no Vercel auth token (`vercel whoami` returns "Logged out"), so this can't be
run from here; it needs to be run by someone logged in, or a token needs to be provided. The two
code fixes from this session (`AssessmentEditPageWizard.tsx`, `useOfflineSync.ts`) are also
uncommitted locally and would need to be committed and pushed before this deploy picks them up.

## Orphan check — corrected (issue #1)

Earlier in this session I said the KV orphan registry's numbers couldn't be trusted without a live
scan. With direct DB access that's no longer true. Real check, run live:

- 132 total `assessment_result:` records, 40 don't resolve to a current `assessment_def:`.
- All 40 have `assessment_id` values like `checkin_asm_..._day_N` — synthetic daily check-in IDs
  that `CLAUDE.md` already documents as legitimately having no FK target, not orphans.
- **True orphans: 0.**

## Outstanding, in priority order

1. Run the DB repair SQL above (issue #3 — the actual data fix).
2. Commit the two local code fixes and deploy via Vercel CLI (closes the deployment gap and ships
   both fixes).
3. Fix `AssessmentHistoryDetail.tsx` to display `section_scores` (issue #4, second half).
4. Optional: backfill `section_scores` on the 132 historical `assessment_result:` records.
