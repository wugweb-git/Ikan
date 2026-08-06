# Balance — "Struggling to balance life"

Pulled live from `assessment_def:asm_1767130043662_wc4qpivfl` on 2026-08-05. **Reversal and
max-score bugs fixed 2026-08-06** — see below. Also found: 2 of 3 real historical results were
recorded against a 10-question version of this assessment that no longer exists (see note 4) — a
separate, unrelated data-integrity issue.

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

## Scoring — as of 2026-08-06

- `BALANCE_SCORING` in `assessment-section-presets.ts` reverses the 5 positively-worded items
  (`bal-q1`, `bal-q3`, `bal-q4`, `bal-q5`, `bal-q7`) before summing, so a well-balanced response now
  correctly lands near 0, not near the max.
- Bands rebalanced to the real 0–32 ceiling: `Balanced 0–10`, `Strained 11–19`,
  `Imbalanced 20–32` (previously 0–12 / 13–24 / 25–40, with 25–40 partly unreachable at a true max
  of 32).
- `resultCategories` and `scoring.ranges` (KV) rewritten to the corrected bands.
- Single-score assessment, not in the sections/report-card system by design.
- One real historical result (of 3) uses this current 8-question scale and was re-scored for
  comparison: stored `13/32` ("Strained", no reversal applied) → corrected `19/32` ("Strained" —
  same label this time, but the underlying score moved 46%). See note 4 for the other two results,
  which can't be re-scored at all.

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

1. ~~Mixed-direction scale scored with no reversal.~~ **Fixed 2026-08-06.** 5 of the 8 items are
   positively worded (a *high* answer means things are *good*), 3 are negatively worded. Verified
   before shipping: a well-balanced response (max on positives, min on negatives) scored 28/32 under
   the old logic — squarely "Imbalanced," the opposite of true. `reverseQuestionIds` now reverses the
   5 positive items (`bal-q1`, `bal-q3`, `bal-q4`, `bal-q5`, `bal-q7`) — reversing the positives
   rather than the 3 negatives was the correct direction, confirmed by testing both ways: reversing
   the negatives instead makes the total read "how balanced" (higher = better), which contradicts
   every other assessment's higher-is-worse convention and the band labels below it.
2. ~~Max-score mismatch.~~ **Fixed 2026-08-06** — see Scoring above.
3. ~~Do not trust historical results.~~ **Superseded by note 4** — one of the three real results
   uses the current question set and has been re-scored (see Scoring above); the other two turned
   out to be un-rescoreable for an unrelated reason.
4. 🔴 **New finding (2026-08-06): 2 of 3 real historical results reference a question set that no
   longer exists.** Their stored responses use ids `bal-q1`–`bal-q10` plus `bal-intro`, with
   agree/disagree options ("1 - Disagree", "0 - Strongly Disagree") — not the current 8-item
   frequency scale ("1 Never" … "5 Very Often"). At some point Balance's questions were replaced
   wholesale with no versioning and no migration of already-collected responses. These two results
   (raw scores 18/100 and 12/null) cannot be meaningfully reinterpreted against today's bands —
   the content the math was based on is gone. This is a distinct problem from the reversal bug
   above: even a mathematically perfect scorer can't recover a result whose underlying instrument
   was silently swapped out from under it. No action taken on these two records; flagging for
   awareness rather than attempting a fix that would have to guess at intent.
