# Balance — "Struggling to balance life"

Pulled live from `assessment_def:asm_1767130043662_wc4qpivfl` on 2026-08-05.

## Meta

| Field | Value |
|---|---|
| id | `asm_1767130043662_wc4qpivfl` |
| slug | `struggling-to-balance-life` |
| category | `balance` |
| duration | 10 |
| question count | 8 |

## Description

> Pinpoint workplace stressors like workload, support, and control that may be disrupting
> work-life balance.

## Scoring — as stored

- `scoring.ranges`: **null**.
- `resultCategories`: 3 bands — `Balanced 0–12`, `Strained 13–24`, `Imbalanced 25–40`.
- Not sectioned; falls through to the generic completion message in the player today.

## Questions, in order

All 8 use the same 5-point scale: `1 Never · 2 Rarely · 3 Sometimes · 4 Often · 5 Very Often`.

| # | id | Text | Direction |
|---|---|---|---|
| 1 | `bal-q1` | I feel I have enough time for myself | Positive — high = good |
| 2 | `bal-q2` | My work drains most of my energy | Negative — high = bad |
| 3 | `bal-q3` | I can disconnect from work after hours | Positive — high = good |
| 4 | `bal-q4` | I feel supported at work or home | Positive — high = good |
| 5 | `bal-q5` | My responsibilities feel manageable | Positive — high = good |
| 6 | `bal-q6` | I feel guilty when I take breaks | Negative — high = bad |
| 7 | `bal-q7` | I have time for relationships | Positive — high = good |
| 8 | `bal-q8` | I feel constantly "on" | Negative — high = bad |

## Verification notes

1. 🔴 **Mixed-direction scale scored with no reversal — this currently mis-scores anyone who isn't
   at an extreme.** 5 of the 8 items are positively worded (a *high* answer means things are
   *good* — "I feel supported," "I have time for relationships"), while 3 are negatively worded (a
   *high* answer means things are *bad* — "My work drains most of my energy," "I feel constantly
   on"). Nothing in the current pipeline reverses the 3 negative items before summing.

   Concretely: a genuinely well-balanced person answers "Very Often" (5) to the 5 positive items
   and "Never" (1) to the 3 negative items. Raw sum: `5×5 + 3×1 = 28` — squarely inside the
   "Imbalanced" band (25–40), the *opposite* of the truth. Someone who is actually struggling
   (low on positives, high on negatives) scores `5×1 + 3×5 = 20` — "Strained," milder than the
   well-balanced person's result. **The instrument's total score is currently inverted for anyone
   who answers consistently.**

   Fix: apply the same reversal pattern already built and verified for the Brief Resilience Scale
   in General (`reverseQuestionIds` in `assessment-sections.ts`) to `bal-q2`, `bal-q6`, `bal-q8`
   before this assessment can be trusted — either by adding this assessment to the sections system,
   or by reversing those three items' stored values directly if it stays a flat-sum assessment.

2. 🔴 **Max-score mismatch, same class of bug as Stress.** 8 questions × max option value 4
   (0-indexed) = **32** is the real ceiling. `resultCategories` sets "Imbalanced" at 25–40 — scores
   above 32 can never occur. Rebalance to a 0–32 scale once issue 1 is fixed (the correct bands
   depend on the corrected, reversed scoring).
3. Because of issue 1, **do not trust any historical results from this assessment** without
   re-deriving them from raw responses using corrected reversal — the stored `score`/`severity_hint`
   on past completions reflect the same inverted logic.
