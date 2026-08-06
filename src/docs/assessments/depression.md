# Depression — "Feeling depressed and hopeless"

Pulled live from `assessment_def:asm_1767129862254_frzeigbdb` on 2026-08-05. **Scoring fixed
2026-08-06** — see below. Note 1's clinical wording concern is still open.

## Meta

| Field | Value |
|---|---|
| id | `asm_1767129862254_frzeigbdb` |
| slug | `feeling-depressed-and-hopeless` |
| category | `depression` |
| duration | 3 |
| question count | 12 |

## Description

> Reflect on how frequently depressive symptoms have impacted your mood, energy, and daily
> functioning recently.

## Scoring — as of 2026-08-06

- Scoped correctly to the 9 real PHQ-9 items only (`dep-q1`..`dep-q9`) via `DEPRESSION_SCORING` in
  `assessment-section-presets.ts` — the impairment add-on and embedded GAD-2 items (10–12) are
  excluded, confirming the max is the standard clinical 27.
- Real bands, standard PHQ-9 cutoffs: `0–4 Minimal`, `5–9 Mild`, `10–14 Moderate`,
  `15–19 Moderately severe`, `20–27 Severe`.
- `resultCategories` and `scoring.ranges` (KV) rewritten to match — previously `resultCategories`
  held one placeholder band and `scoring.ranges` was null.
- Single-score assessment, not in the sections/report-card system by design.

## Questions, in order

All options are the same 4-point scale: `1 Not at all · 2 Several days · 3 More than half the
days · 4 Nearly every day`.

| # | id | Text | Instrument |
|---|---|---|---|
| 1 | `dep-q1` | Little interest or pleasure in doing things | PHQ-9 item 1 |
| 2 | `dep-q2` | Feeling down, depressed, or hopeless | PHQ-9 item 2 |
| 3 | `dep-q3` | Trouble falling or staying asleep | PHQ-9 item 3 |
| 4 | `dep-q4` | Feeling tired or having little energy | PHQ-9 item 4 |
| 5 | `dep-q5` | Poor appetite or overeating | PHQ-9 item 5 |
| 6 | `dep-q6` | Feeling bad about yourself | PHQ-9 item 6 |
| 7 | `dep-q7` | Trouble concentrating | PHQ-9 item 7 |
| 8 | `dep-q8` | Moving or speaking slowly / restlessness | PHQ-9 item 8 |
| 9 | `dep-q9` | Feeling that life is meaningless | PHQ-9 item 9, **reworded** |
| 10 | `block-1773729917458` | How difficult have the above problems made it for you to do your work, take care of things at home, or get along with other people? | PHQ-9 functional-impairment add-on |
| 11 | `block-1773729919689` | Feeling nervous, anxious or on edge | GAD-2 item 1 (embedded screen) |
| 12 | `block-1773729921875` | Not being able to stop or control worrying | GAD-2 item 2 (embedded screen) |

## Verification notes

1. **Item 9 is a softened rewrite of the standard PHQ-9 item 9**, which is normally
   *"Thoughts that you would be better off dead, or of hurting yourself in some way"* — the same
   wording used verbatim as the risk indicator in the General assessment (`block-1773736126142`).
   Here it's rephrased to "Feeling that life is meaningless," which is a materially different (and
   softer) question — it will under-detect actual suicidal ideation. **Confirm this rewording was a
   deliberate clinical/safety decision**, not an accidental content edit; if PHQ-9's exact wording
   is wanted for scoring validity, the real item plus a proper crisis-resource trigger (like
   General's separate risk indicator) should be used instead.
2. ~~Single-band result categories~~ **fixed 2026-08-06** — see Scoring above.
3. Item 12 (GAD-2's second item) was the exact content General's Anxiety section was missing —
   **copied into General as `gen-anxiety-q2` 2026-08-06** (new id, same text). General's Anxiety
   section is now complete. See [`general.md`](general.md).
4. This is a genuine, correctly-formed **PHQ-9** otherwise — 9 core items + impairment question,
   same embedded-cross-screen pattern as Anxiety's PHQ-2. Content quality is good; only the result
   bands and item 9's wording need attention.
