# Sleep — "Struggling with quality sleep"

Pulled live from `assessment_def:asm_1767130007889_mewy939gi` on 2026-08-05.

## Meta

| Field | Value |
|---|---|
| id | `asm_1767130007889_mewy939gi` |
| slug | `struggling-with-quality-sleep` |
| category | `sleep` |
| duration | 10 |
| question count | 8 |

## Description

> An 8-question assessment to understand sleep quality, night-time patterns, and possible
> insomnia symptoms.

## Scoring — as stored

- `scoring.ranges`: **null**.
- `resultCategories`: 2 bands — `Poor Sleep 0–16`, `Healthy Sleep 17–32`. Max (32) correctly
  matches the actual achievable score (8 × max value 4 = 32) — this one's calibration is right.
- Not sectioned; falls through to the generic completion message in the player today.

## Questions, in order

| # | id | Text | Options |
|---|---|---|---|
| 1 | `sleep-q1` | How long does it take you to fall asleep? | 1 0-15 minutes · 2 16-30 minutes · 3 31-45 minutes · 4 46-60 minutes · 5 Over 60 minutes |
| 2 | `sleep-q2` | …if you then wake up during the night … how long are you awake for in total? (add all the times you woke up) | (same 5 options as above) |
| 3 | `sleep-q3` | How many nights a week do you have sleep troubles? | 1 0-1 · 2 2 · 3 3 · 4 4 · 5 5-7 |
| 4 | `sleep-q4` | How would you rate the quality of your sleep? | 1 Very Good · 2 Good · 3 Average · 4 **Pooo** · 5 Very Poor |
| 5 | `sleep-q5` | Affected your mood, energy, or relationships? | 1 Not at all · 2 A little · 3 Somewhat · 4 Much · 5 Very Much |
| 6 | `sleep-q6` | Affected your concentration, productivity, or ability to stay awake? | (same 5 options) |
| 7 | `sleep-q7` | Troubled you in general? | (same 5 options) |
| 8 | `sleep-q8` | How often does poor sleep affect your energy? | 1 I don't have a problem/less than 1 month · 2 1–2 months · 3 3–6 months · 4 7–12 months · 5 More than 1 year |

## Verification notes

1. 🟡 **Typo**: `sleep-q4` option 4 reads **"Pooo"** instead of "Poor". Cosmetic but user-visible —
   straightforward fix in admin.
2. **Question 2's wording is fragmentary** ("…if you then wake up during the night … how long are
   you awake for in total?") — reads like it's missing a lead-in clause, possibly truncated during
   editing. Worth a copy pass.
3. Content maps reasonably to Insomnia Severity Index (ISI) themes (sleep-onset latency,
   wake-after-sleep-onset, dissatisfaction, daytime impact, distress, duration of the problem) —
   good instrument design overall, and the only one of the 5 non-sectioned assessments where the
   stored max score is actually correct.
4. Only 2 result bands (no "moderate" middle ground) — a binary Poor/Healthy split is coarser than
   the content deserves given 8 well-differentiated questions; consider a 3-band split matching
   ISI convention (none/subthreshold/moderate/severe) if finer feedback is wanted.
