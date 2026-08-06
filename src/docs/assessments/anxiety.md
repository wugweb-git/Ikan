# Anxiety — "Feeling overwhelmed and anxious"

Pulled live from `assessment_def:asm_1767129765741_wse9aeprv` on 2026-08-05. **Scoring fixed
2026-08-06** — see below; this file originally documented the pre-fix bug.

## Meta

| Field | Value |
|---|---|
| id | `asm_1767129765741_wse9aeprv` |
| slug | `feeling-overwhelmed-and-anxious` |
| category | `anxiety` |
| duration | 4 |
| question count | 10 |

## Description

> Measure how often anxiety symptoms have affected you over the last two weeks to better
> understand your current stress response.

## Scoring — as of 2026-08-06

- Scoped correctly to the 7 real GAD-7 items only (`anxiety-q1`..`anxiety-q7`) via
  `ANXIETY_SCORING` in `assessment-section-presets.ts` — item 8 (functional impairment) and items
  9–10 (embedded PHQ-2) are excluded from the score, confirming the max is the standard clinical 21,
  not 24.
- Real bands, standard GAD-7 cutoffs: `0–4 Minimal`, `5–9 Mild`, `10–14 Moderate`, `15–21 Severe`.
- `resultCategories` (KV) and `scoring.ranges` (KV) were both rewritten to match the bands above —
  previously `resultCategories` held one placeholder band (`"Scoring Range", 0–21`, no description)
  and `scoring.ranges` was null. Both are now populated and consistent with the code-side preset.
- Still not in the sections/report-card system — this is a single-score assessment by design (one
  instrument, one result), rendered via the normal single-ring result screen, not
  `SectionReportCard`.

## Questions, in order

All options are the same 4-point scale unless noted: `1 Not at all · 2 Several days · 3 More than
half the days · 4 Nearly every day`.

| # | id | Text | Instrument |
|---|---|---|---|
| 1 | `anxiety-q1` | Feeling nervous, anxious, or on edge | GAD-7 item 1 |
| 2 | `anxiety-q2` | Not being able to stop or control worrying | GAD-7 item 2 |
| 3 | `anxiety-q3` | Worrying too much about different things | GAD-7 item 3 |
| 4 | `anxiety-q4` | Trouble relaxing | GAD-7 item 4 |
| 5 | `anxiety-q5` | Being so restless it's hard to sit still | GAD-7 item 5 |
| 6 | `anxiety-q6` | Becoming easily annoyed or irritable | GAD-7 item 6 |
| 7 | `anxiety-q7` | Feeling afraid as if something awful might happen | GAD-7 item 7 |
| 8 | `block-1773677754599` | How difficult have the above problems made it for you to do your work, take care of things at home, or get along with other people? | GAD-7 functional-impairment add-on |
| 9 | `block-1773677757396` | Little interest or pleasure in doing things | PHQ-2 item 1 (embedded screen) |
| 10 | `block-1773677760521` | Feeling down, depressed or hopeless | PHQ-2 item 2 (embedded screen) |

## Verification notes

1. **This is a genuine, correctly-formed GAD-7** (items 1–7) plus its standard functional-
   impairment question (item 8), with PHQ-2 embedded as a secondary screen (items 9–10) — a
   legitimate clinical pattern (catching co-occurring depression during an anxiety screen).
2. ~~Single-band result categories mean this assessment currently gives no real feedback.~~
   **Fixed 2026-08-06** — see Scoring above.
3. Confirmed: item 8 (impairment) and items 9–10 (embedded PHQ-2) are excluded from scoring by
   `questionIds` scoping — the max is the clinical 21, not 24. Verified via test before shipping.
4. Items 9–10 (PHQ-2) were the exact content General's Depression section needed —
   **copied into General as `gen-dep-q1`/`gen-dep-q2` 2026-08-06** (new ids, same text); General's
   Depression section is now complete. See [`general.md`](general.md).
