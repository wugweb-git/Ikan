# Stress — "Feeling worried and stressed"

Pulled live from `assessment_def:asm_1767129926263_ru3v6dozh` on 2026-08-05, **re-verified in full
2026-08-06**. Max-score mismatch fixed 2026-08-06 (see Scoring below). **The 2026-08-05 audit was
incomplete**: it only listed the 7 questions used in scoring and missed that the assessment
actually has 10 questions total — the other 3 (`stress-q1`–`q3`) are broken, truncated content
shown to every user before the real 7. Caught 2026-08-06 by re-verifying the doc's question count
against a fresh `jsonb_array_length` query rather than trusting the original table. Not yet fixed —
see Verification notes 2. 38 real completions exist for this assessment, the most of any of the 7.

## Meta

| Field | Value |
|---|---|
| id | `asm_1767129926263_ru3v6dozh` |
| slug | `feeling-worried-and-stressed` |
| category | `stress` |
| duration | 4 |
| question count | 10 (was documented as 7 until 2026-08-06 — see note 2) |

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

All 10 use the same 5-point scale, options `0 - Never · 1 - Almost Never · 2 - Sometimes ·
3 - Fairly Often · 4 - Very Often` (all 10 questions carry this exact 5-option set, including the
3 broken ones — verified, not assumed).

| # | id | Text | Scored? |
|---|---|---|---|
| 1 | `stress-q1` | 🔴 `"How often have you felt "` — **truncated, trailing space, sentence never finishes** | No |
| 2 | `stress-q2` | 🔴 `"How often have you"` — **truncated mid-sentence** | No |
| 3 | `stress-q3` | 🔴 `"How often have you f"` — **truncated mid-word** | No |
| 4 | `stress-q4` | How often has stress affected your sleep? | Yes |
| 5 | `stress-q5` | How often has stress affected your focus? | Yes |
| 6 | `stress-q6` | How often have you felt physically tense? | Yes |
| 7 | `stress-q7` | How often have you felt rushed or pressured? | Yes |
| 8 | `stress-q8` | How often have you worried excessively? | Yes |
| 9 | `stress-q9` | How often have you felt emotionally drained? | Yes |
| 10 | `stress-q10` | How often has stress interfered with daily life? | Yes |

## Verification notes

1. ~~Max-score mismatch.~~ **Fixed 2026-08-06** — see Scoring above.
2. 🔴 **`stress-q1`–`stress-q3` have broken, truncated text and are shown to every user before the
   real 7 questions — still open, not fixed.** Confirmed live in `AssessmentFlow.tsx`'s
   `normalizeAssessment()`: it maps over every entry in `assessment.questions` with no filtering by
   scoring relevance, so these 3 render in the player exactly as stored. `STRESS_SCORING`'s
   `questionIds` correctly excludes them from scoring (that part isn't broken), but nothing stops
   them from being *asked*. **The original 2026-08-05 audit's note here — "ids start at q4,
   possibly deleted" — was wrong**, written without checking the actual `questions` array length
   against the table below it; the ids aren't missing, the questions exist and are broken.
   Two ways to fix, a product decision not made here: author the real text (unknown — the sentence
   fragments don't clearly imply a specific completion, e.g. "How often have you felt overwhelmed?"
   is one guess among several equally plausible ones) and add them to `STRESS_SCORING` if they're
   meant to count, or delete the 3 records from the `questions` array entirely if they were leftover
   drafts (they're currently scored, functional dead weight even at their best).
3. Options use a proper 0-indexed scale (`0 - Never` … `4 - Very Often`) — unlike most other
   assessments in this bank, which display `1 …` but still score from index 0. This one's display
   text and scored value actually agree, which is good, but means it's the odd one out stylistically.
