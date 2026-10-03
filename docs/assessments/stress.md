# Stress — "Feeling worried and stressed"

> **Scoring bands/values in this file predate the 2026-09-02/03 rescale — current scoring: [`INSTRUMENTS.md`](INSTRUMENTS.md).**

Pulled live from `assessment_def:asm_1767129926263_ru3v6dozh` on 2026-08-05, **content-corrected
2026-08-07**. Max-score mismatch fixed 2026-08-06 (see Scoring below). The 3 broken, truncated
questions (`stress-q1`–`q3`) that used to be shown before the real 7 have been **removed** — see
below. Question count is now **7**, matching the scored items exactly. 38 real completions exist
for this assessment, the most of any of the 7 — meaning every one of those users saw 3 broken
questions before this fix.

## ✅ Fixed 2026-08-07: `stress-q1`–`q3` removed (truncated, unrecoverable text)

Found via the same systematic check as General/Burnout. Unlike Burnout's single placeholder, these
3 were truncated **mid-sentence** (`"How often have you felt "`, `"How often have you"`, `"How
often have you f"`) — there was no way to recover or guess the intended real question with
confidence (multiple equally-plausible completions), so authoring replacement text wasn't a
responsible option. Removed from `questions[]` on both `assessment_def:` and the `assessment:`
mirror; the stale `daily_content` builder cache was cleared so the admin builder regenerates
correctly from the corrected 7.

## Meta

| Field | Value |
|---|---|
| id | `asm_1767129926263_ru3v6dozh` |
| slug | `feeling-worried-and-stressed` |
| category | `stress` |
| duration | 4 |
| question count | **7** (real, scored items only, as of 2026-08-07) |

## Description

> Gauge how overwhelmed or in control you've felt over the last month to understand your stress
> levels.

## Scoring — as of 2026-08-06

- Sums all 7 items via `STRESS_SCORING` in `assessment-section-presets.ts` — same items as before,
  no scope issue here (unlike Anxiety/Depression).
- Bands rebalanced to the real 0–28 ceiling: `Low Stress 0–7`, `Moderate Stress 8–18`,
  `High Stress 19–28` (previously 0–10 / 11–25 / 26–40, with the top of "High Stress" — 29–40 —
  mathematically unreachable).
- `resultCategories` and `scoring.ranges` (KV) rewritten to the corrected bands, same descriptions.
- Single-score assessment, not in the sections/report-card system by design.

## Questions, in order

All 7 use the same 5-point scale, options `0 - Never · 1 - Almost Never · 2 - Sometimes ·
3 - Fairly Often · 4 - Very Often`. `stress-q1`–`q3` (truncated, unscored) removed 2026-08-07 — see
above; ids below keep their original `qN` numbers rather than being renumbered, to match what's
still in the live KV record.

| # | id | Text | Scored? |
|---|---|---|---|
| 4 | `stress-q4` | How often has stress affected your sleep? | Yes |
| 5 | `stress-q5` | How often has stress affected your focus? | Yes |
| 6 | `stress-q6` | How often have you felt physically tense? | Yes |
| 7 | `stress-q7` | How often have you felt rushed or pressured? | Yes |
| 8 | `stress-q8` | How often have you worried excessively? | Yes |
| 9 | `stress-q9` | How often have you felt emotionally drained? | Yes |
| 10 | `stress-q10` | How often has stress interfered with daily life? | Yes |

## Verification notes

1. ~~Max-score mismatch.~~ **Fixed 2026-08-06** — see Scoring above.
2. ✅ **Fixed 2026-08-07: `stress-q1`–`stress-q3` (broken, truncated text) removed.** Confirmed live
   in `AssessmentFlow.tsx`'s `normalizeAssessment()`: it maps over every entry in
   `assessment.questions` with no filtering by scoring relevance, so these 3 rendered in the player
   exactly as stored, for all 38 real completions to date. `STRESS_SCORING`'s `questionIds` already
   correctly excluded them from scoring. Deleted rather than authored-around — the truncated
   fragments didn't clearly imply one specific intended completion.
3. Options use a proper 0-indexed scale (`0 - Never` … `4 - Very Often`) — unlike most other
   assessments in this bank, which display `1 …` but still score from index 0. This one's display
   text and scored value actually agree, which is good, but means it's the odd one out stylistically.
