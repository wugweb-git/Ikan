# Sleep — "Struggling with quality sleep"

> **Scoring bands/values in this file predate the 2026-09-02/03 rescale — current scoring: [`INSTRUMENTS.md`](INSTRUMENTS.md).**

Pulled live from `assessment_def:asm_1767130007889_mewy939gi` on 2026-08-05. **Inverted labels and
the "Pooo" typo fixed 2026-08-06** — see below.

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

## Scoring — as of 2026-08-06

- Sums all 8 items via `SLEEP_SCORING` in `assessment-section-presets.ts`; max (32) was already
  correct and is unchanged.
- **Labels were inverted and are now corrected**: every item scores worst-answer=4, best-answer=0
  (verified directly against live options), so a *low* total means *good* sleep. The stored bands
  had `Poor Sleep` on the low-score (good) band and `Healthy Sleep` on the high-score (bad) band —
  exactly backwards. Now `Healthy Sleep 0–16`, `Poor Sleep 17–32` — numeric ranges unchanged, labels
  swapped to match reality.
- `sleep-q4` option 4 typo ("Pooo" → "Poor") fixed directly in KV, both `assessment_def:` and
  `assessment:` mirrors.
- `resultCategories` and `scoring.ranges` (KV) rewritten to the corrected labels.
- Single-score assessment, not in the sections/report-card system by design.

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

1. ~~Typo: `sleep-q4` option 4 reads "Pooo".~~ **Fixed 2026-08-06.**
2. ~~Result labels inverted.~~ **Fixed 2026-08-06** — see Scoring above. This was found during the
   fix pass, not the original 2026-08-05 audit — the original note below (max score correct) was
   right, but didn't catch that the labels on that correct scale were backwards.
3. **Question 2's wording is fragmentary** ("…if you then wake up during the night … how long are
   you awake for in total?") — reads like it's missing a lead-in clause, possibly truncated during
   editing. Worth a copy pass. Still open — content issue, not scoring.
4. Content maps reasonably to Insomnia Severity Index (ISI) themes (sleep-onset latency,
   wake-after-sleep-onset, dissatisfaction, daytime impact, distress, duration of the problem) —
   good instrument design overall.
5. Only 2 result bands (no "moderate" middle ground) — a binary Poor/Healthy split is coarser than
   the content deserves given 8 well-differentiated questions; consider a 3-band split matching
   ISI convention (none/subthreshold/moderate/severe) if finer feedback is wanted. Still open — a
   content decision, not a bug.
