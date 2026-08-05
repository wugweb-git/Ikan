# Stress — "Feeling worried and stressed"

Pulled live from `assessment_def:asm_1767129926263_ru3v6dozh` on 2026-08-05.

## Meta

| Field | Value |
|---|---|
| id | `asm_1767129926263_ru3v6dozh` |
| slug | `feeling-worried-and-stressed` |
| category | `stress` |
| duration | 4 |
| question count | 7 |

## Description

> Gauge how overwhelmed or in control you've felt over the last month to understand your stress
> levels.

## Scoring — as stored

- `scoring.ranges`: **null**.
- `resultCategories`: 3 real bands — `Low Stress 0–10`, `Moderate Stress 11–25`, `High Stress
  26–40`, each with a real description. Best-authored of the non-sectioned assessments — but see
  the max-mismatch below.
- Not sectioned; falls through to the generic completion message in the player today, same as
  every other non-General/Burnout assessment.

## Questions, in order

All 7 use the same 5-point scale: `0 - Never · 1 - Almost Never · 2 - Sometimes · 3 - Fairly Often
· 4 - Very Often`.

| # | id | Text |
|---|---|---|
| 1 | `stress-q4` | How often has stress affected your sleep? |
| 2 | `stress-q5` | How often has stress affected your focus? |
| 3 | `stress-q6` | How often have you felt physically tense? |
| 4 | `stress-q7` | How often have you felt rushed or pressured? |
| 5 | `stress-q8` | How often have you worried excessively? |
| 6 | `stress-q9` | How often have you felt emotionally drained? |
| 7 | `stress-q10` | How often has stress interfered with daily life? |

## Verification notes

1. 🔴 **Max-score mismatch.** 7 questions × max option value 4 (0-indexed) = **28** is the highest
   score anyone can actually get. `resultCategories` defines "High Stress" as 26–40 — scores 29–40
   can never occur, and the practical ceiling of 28 sits deep inside the "High" band rather than at
   its top. Fix: either change the top band's max to 28 (`{min:26, max:28, label:"High Stress"}`),
   or rebalance all three bands proportionally to a 0–28 scale (e.g. 0–9 / 10–18 / 19–28).
2. **Question ids start at `stress-q4`, not `stress-q1`.** Items 1–3 are missing from the id
   sequence — either genuinely deleted at some point, or this instrument was only ever authored
   starting from item 4. Not necessarily a bug (the assessment works fine with 7 items as-is), but
   worth a sanity check with whoever originally authored it, since it suggests content may have
   been removed without the assessment being reviewed afterward.
3. Options use a proper 0-indexed scale (`0 - Never` … `4 - Very Often`) — unlike most other
   assessments in this bank, which display `1 …` but still score from index 0. This one's display
   text and scored value actually agree, which is good, but means it's the odd one out stylistically.
