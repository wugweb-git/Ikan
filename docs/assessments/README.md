# Assessment content & scoring audit

One file per live assessment, originally pulled directly from `assessment_def:*` in Supabase on
2026-08-05, **updated 2026-08-06 to reflect the scoring fixes shipped that day** — each file now
says explicitly what was fixed vs. what's still open, rather than presenting the original bugs as
current state. Each file lists: metadata, tile/landing copy, every question with its exact options
in order, the scoring configuration as actually stored, and a **Verification notes** section.

**Use this to verify content, not to re-derive it from code.** Everything here is a literal
read of what's live; if you change a question, option, or scoring band in admin, re-run the
audit query (see bottom of this file) rather than hand-editing these docs — they'll drift.

**Verification history, in the interest of not overclaiming accuracy again:** the 2026-08-05 audit
and the 2026-08-06 scoring-fix pass both verified `scoring.ranges`/`resultCategories` and the
*scored* subset of each assessment's questions, but neither checked the doc's question count
against the assessment's actual `questions` array length. That gap let two real, live content bugs
through undetected on two separate passes — Stress has 3 broken/truncated questions and Burnout has
1 placeholder ("test") question, both shown to real users, neither ever scored. Found 2026-08-06 by
re-running `jsonb_array_length(value->'questions')` for all 7 and diffing against each doc's stated
count — the mismatch (Stress: 10 vs. documented 7; Burnout: 23 vs. documented 22) is what surfaced
it. All 7 assessments' full question arrays (not just the scored subset) are now verified line by
line against their docs as of 2026-08-06. `scoring.ranges`/`resultCategories` remain correct and
in sync on all 7. The 2 content bugs found are documented in `stress.md`/`burnout.md` but **not
fixed** — fixing them means either authoring real replacement text (unknown, for Stress's truncated
sentences) or deleting the records, both product decisions, not made unilaterally here.

## Assessments

| File | Title | Category | Questions | Status |
|---|---|---|---|---|
| [`general.md`](general.md) | Unsure or general concern | general | 27 (was 24) | ✅ Sectioned; GAD-2/PHQ-2 gaps closed 2026-08-06 |
| [`anxiety.md`](anxiety.md) | Feeling overwhelmed and anxious | anxiety | 10 | ✅ Real GAD-7 bands, scoped to the 7 clinical items — fixed 2026-08-06 |
| [`depression.md`](depression.md) | Feeling depressed and hopeless | depression | 12 | ✅ PHQ-9-**derived** bands, scoped to the 9 items. Item 9 carries softened local wording, so the cut-offs are inherited, not validated. Do not describe as PHQ-9. |
| [`stress.md`](stress.md) | Feeling worried and stressed | stress | 10 (was documented as 7) | ✅ Max-score fixed. 🔴 3 broken/truncated questions shown to users, found 2026-08-06 during doc re-verification, not yet fixed |
| [`burnout.md`](burnout.md) | Feeling drained and burned out | burnout | 23 (was documented as 22) | ⚠️ Sectioned, scoring unaffected. 🔴 1 placeholder ("test") question shown to users, found 2026-08-06, not yet fixed |
| [`sleep.md`](sleep.md) | Struggling with quality sleep | sleep | 8 | ✅ Inverted labels + typo fixed 2026-08-06. Question 2's wording and 2-band granularity still open. |
| [`balance.md`](balance.md) | Struggling to balance life | balance | 8 | ✅ Reversal + max-score fixed 2026-08-06. 🔴 2 of 3 historical results reference a since-replaced question set — see note. |

Real completions per assessment as of the fix (excludes check-in/test data): General 4, Anxiety 4,
Depression 2, Stress 38, Burnout 3, Sleep 8, Balance 3 — 62 total. Full audit against these numbers:
see the [stability audit artifact](https://claude.ai/code/artifact/56265e75-b364-4179-b016-34b840825ae2).

## Cross-cutting findings — resolved 2026-08-06

1. ~~`scoring.ranges` is `null` on all 7 live records.~~ **Fixed.** `admin-routes.ts` now derives
   `scoring.ranges` from `resultCategories` on every create/update, and all 7 live records were
   backfilled directly so existing content didn't have to wait for a re-save to pick up the fix.
   Anxiety/Depression/Stress/Sleep/Balance additionally score through code-side presets in
   `assessment-section-presets.ts` regardless of what's in KV, so the player result was fixed even
   before the KV backfill — the backfill closes the gap for anyone reading the KV record directly
   (admin screens, this audit, future tooling).
2. ~~`resultCategories` is authored but never read.~~ **Still true by original design** (the player
   reads `scoring.ranges`, not `resultCategories` directly) but no longer *matters* — see #1. Both
   fields are now kept in sync.
3. ~~GAD-2 and PHQ-2 content already exists in the bank, just not attached to General.~~ **Fixed** —
   copied into General as `gen-anxiety-q2`/`gen-dep-q1`/`gen-dep-q2`, wired into `GENERAL_SECTIONS`.

## Re-running this audit

```sql
SELECT value->>'title', value->>'slug', jsonb_array_length(value->'questions') AS n_questions,
       value->'scoring' AS scoring, value->'resultCategories' AS result_categories
FROM kv_store_cc205da9 WHERE key LIKE 'assessment_def:%' ORDER BY key;
```
