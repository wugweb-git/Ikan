# Anxiety — "Feeling overwhelmed and anxious"

Pulled live from `assessment_def:asm_1767129765741_wse9aeprv` on 2026-08-05.

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

## Scoring — as stored

- `scoring.ranges`: **null**.
- `resultCategories`: **one single band** — `{min:0, max:21, label:"Scoring Range", description:""}`.
  This is not a real severity scale: every possible score from 0 to 21 produces the identical
  label. There is no low/moderate/high distinction authored at all.
- Not sectioned (no entry in `assessment-section-presets.ts`); scoring falls through to the
  generic "Assessment completed" interpretation regardless of the band above, since the player
  reads `scoring.ranges` (null), not `resultCategories`.

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
   legitimate clinical pattern (catching co-occurring depression during an anxiety screen). Content
   is sound; only the *result band* is broken.
2. **Single-band result categories mean this assessment currently gives no real feedback.** Fix:
   author real GAD-7 bands, e.g. 0–4 Minimal / 5–9 Mild / 10–14 Moderate / 15–21 Severe (standard
   GAD-7 cutoffs), and wire `resultCategories` → `scoring.ranges` so the player actually reads them
   — or add this to the sections system the way General/Burnout now work.
3. Max achievable score if all 8 core+impairment items scored 0–3: 8 × 3 = 24, not 21 as stored —
   worth confirming whether item 8 (impairment) should count toward the total at all under standard
   GAD-7 scoring (usually it does not; only items 1–7 sum to the clinical 0–21 range). If item 8 is
   excluded from scoring, 21 is correct and this is fine — flagging because the current `scoring`
   field is null and can't confirm which convention is intended.
4. Items 9–10 (PHQ-2) are the exact content General's Depression section needs — see
   [`general.md`](general.md) note 3.
