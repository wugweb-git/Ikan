# Assessment content & scoring audit

One file per live assessment, pulled directly from `assessment_def:*` in Supabase on 2026-08-05.
Each file lists: metadata, tile/landing copy, every question with its exact options in order,
the scoring configuration as actually stored, and a **Verification notes** section flagging
anything that doesn't add up — mismatched max scores, dead-end result bands, mixed-direction
scales, typos, content gaps.

**Use this to verify content, not to re-derive it from code.** Everything here is a literal
read of what's live; if you change a question, option, or scoring band in admin, re-run the
audit query (see bottom of this file) rather than hand-editing these docs — they'll drift.

## Assessments

| File | Title | Category | Questions | Status |
|---|---|---|---|---|
| [`general.md`](general.md) | Unsure or general concern | general | 24 | ⚠️ Sectioned (Depression section empty, Anxiety section 1/2 items) |
| [`anxiety.md`](anxiety.md) | Feeling overwhelmed and anxious | anxiety | 10 | ⚠️ Result bands are a single dead-end range |
| [`depression.md`](depression.md) | Feeling depressed and hopeless | depression | 12 | ⚠️ Result bands are a single dead-end range |
| [`stress.md`](stress.md) | Feeling worried and stressed | stress | 7 | 🔴 Max-score mismatch (bands go to 40, actual max is 28) |
| [`burnout.md`](burnout.md) | Feeling drained and burned out | burnout | 22 | ⚠️ Sectioned (see notes on item-count vs BAT-23) |
| [`sleep.md`](sleep.md) | Struggling with quality sleep | sleep | 8 | 🟡 Typo in option text; only 2 result bands |
| [`balance.md`](balance.md) | Struggling to balance life | balance | 8 | 🔴 Mixed-direction scale, no reversal — currently mis-scores balanced respondents |

## Cross-cutting findings (apply to more than one assessment)

1. **`scoring.ranges` is `null` on all 7 live records.** The player (`AssessmentFlow.tsx`) reads
   `assessment.scoring.ranges` to find an interpretation band; since it's null everywhere, every
   assessment except General/Burnout (which the sections feature overrides client-side) falls
   through to the hardcoded generic fallback: `{label: 'Complete', interpretation: 'Assessment
   completed.'}`. **In practice, no assessment today shows a real severity result to the user**
   except through the new sectioned report card.
2. **`resultCategories` (the field the admin wizard actually writes) is authored but never read**
   by anything — this is the same dead-field bug noted in `PENDING.md`. The bands documented in
   each file below are what's *stored*, not what a user currently *sees*.
3. **GAD-2 and PHQ-2 content already exists in the bank** — just not attached to General.
   The two PHQ-2 items live at the end of the Anxiety assessment (`block-1773677757396`,
   `block-1773677760521`); the second GAD-2 item and the standard PHQ-2 items also appear inside
   Depression (`block-1773729919689`, `block-1773729921875`). This corrects an earlier
   `PENDING.md` note that claimed these items didn't exist anywhere — they exist, just need to be
   copied into General's own question array with new ids for General's sections to be complete.

## Re-running this audit

```sql
SELECT value->>'title', value->>'slug', jsonb_array_length(value->'questions') AS n_questions,
       value->'scoring' AS scoring, value->'resultCategories' AS result_categories
FROM kv_store_cc205da9 WHERE key LIKE 'assessment_def:%' ORDER BY key;
```
