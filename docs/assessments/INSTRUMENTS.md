<!-- SOURCE OF TRUTH — do not edit by hand without re-reading the database. -->

> **Canonical as of 2026-09-03.**
> This file supersedes the per-assessment docs in this folder (`anxiety.md`, `balance.md`,
> `burnout.md`, `depression.md`, `general.md`, `sleep.md`, `stress.md`) and the
> *iKan Assessment Instruments* artifact. Where any of those disagree with this file,
> this file is the later reading and was taken from the live store.
>
> Mirrored to Notion at *iKan — Assessment Instruments (live spec)* in the iKan wiki.
> If the two ever disagree, re-read the database rather than picking one.

# iKan — the seven assessments

Read from `kv_store_cc205da9` (project `jpfvoevxegnknxoqmwye`) on 2026-09-03. Every id, item text, option weight, score mapping and band boundary below came from a query against the live store.

7 assessments · 92 items · 89 scored · 17 scores · 11 profiles · 34 bands.

## How to read the tables

- **Option Scale** names the scale; the scales are defined above each table.
- **scored by (band)** names the score entry that consumes the item, and in brackets the profile whose bands it is banded against.
- **Band rule** is stated below each table. All bands are half-open `[min, max)` except the last, which is closed.

## The stored result record

```
assessment_result:{userId}:{uuid}                  the record
assessment_result:{userId}:{assessmentId}:latest   full copy, overwritten
assessment_response_by_user:{userId}:{uuid}        index row

{
  id, user_id, assessment_id, slug,
  record_type,          // 'assessment_result' | 'program_checkin'
  score, max_score,     // nullable; the legacy overall, not always meaningful
  scores[],             // per score entry: id, value, band, severity_ref
  section_scores,       // the breakdown the report card renders
  interpretation,       // legacy label — 89 of 104 are placeholders
  scoring_provenance,   // state, profile_id, scale, note
  responses, completed_at
}
```

---

# 1 · Feeling depressed and hopeless

`feeling-depressed-and-hopeless` · `asm_1767129862254_frzeigbdb` · category `depression` · 12 items · PHQ-9 + embedded GAD-2

**Scale A (4-pt frequency, 0–3):** `1 Not at all` (0) · `2 Several days` (1) · `3 More than half the days` (2) · `4 Nearly every day` (3)

| id | item | Option Scale | scored by (band) |
|---|---|---|---|
| `depression-q1` | Little interest or pleasure in doing things | A | `phq9-total` (`phq9`) |
| `depression-q2` | Feeling down, depressed, or hopeless | A | `phq9-total` (`phq9`) |
| `depression-q3` | Trouble falling or staying asleep | A | `phq9-total` (`phq9`) |
| `depression-q4` | Feeling tired or having little energy | A | `phq9-total` (`phq9`) |
| `depression-q5` | Poor appetite or overeating | A | `phq9-total` (`phq9`) |
| `depression-q6` | Feeling bad about yourself | A | `phq9-total` (`phq9`) |
| `depression-q7` | Trouble concentrating | A | `phq9-total` (`phq9`) |
| `depression-q8` | Moving or speaking slowly / restlessness | A | `phq9-total` (`phq9`) |
| `depression-q9` | Feeling that life is meaningless | A | `phq9-total` (`phq9`) |
| `depression-q10` | How difficult have the above problems made it for you to do your work, take care of things at home, or get along with other people? | A | — not scored |
| `depression-q11` | Feeling nervous, anxious or on edge | A | `gad2-total` (`gad2-screen`) |
| `depression-q12` | Not being able to stop or control worrying | A | `gad2-total` (`gad2-screen`) |

### Band rule used

**`phq9-total` — profile `phq9`.** `sum` of the 9 item weights (0–3 each). Range **0–27**. Direction: higher is distress. Missing: `invalidate`, all 9 required.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Minimal | `0 ≤ x < 5` | minimal | success |
| Mild | `5 ≤ x < 10` | mild | warning |
| Moderate | `10 ≤ x < 15` | moderate | warning |
| Moderately severe | `15 ≤ x < 20` | moderately-severe | warning |
| Severe | `20 ≤ x ≤ 27` | severe | error |

**`gad2-total` — profile `gad2-screen`.** `sum` of 2 items. Range **0–6**. Higher is distress. Missing: `invalidate`, both required.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Negative screen | `0 ≤ x < 3` | minimal | success |
| Positive screen | `3 ≤ x ≤ 6` | moderate | warning |

---

# 2 · Feeling overwhelmed and anxious

`feeling-overwhelmed-and-anxious` · `asm_1767129765741_wse9aeprv` · category `anxiety` · 10 items · GAD-7 + embedded PHQ-2

**Scale A (4-pt frequency, 0–3):** `1 Not at all` (0) · `2 Several days` (1) · `3 More than half the days` (2) · `4 Nearly every day` (3)

| id | item | Option Scale | scored by (band) |
|---|---|---|---|
| `anxiety-q1` | Feeling nervous, anxious, or on edge | A | `gad7-total` (`gad7`) |
| `anxiety-q2` | Not being able to stop or control worrying | A | `gad7-total` (`gad7`) |
| `anxiety-q3` | Worrying too much about different things | A | `gad7-total` (`gad7`) |
| `anxiety-q4` | Trouble relaxing | A | `gad7-total` (`gad7`) |
| `anxiety-q5` | Being so restless it's hard to sit still | A | `gad7-total` (`gad7`) |
| `anxiety-q6` | Becoming easily annoyed or irritable | A | `gad7-total` (`gad7`) |
| `anxiety-q7` | Feeling afraid as if something awful might happen | A | `gad7-total` (`gad7`) |
| `anxiety-q8` | How difficult have the above problems made it for you to do your work, take care of things at home, or get along with other people? | A | — not scored |
| `anxiety-q9` | Little interest or pleasure in doing things | A | `phq2-total` (`phq2-screen`) |
| `anxiety-q10` | Feeling down, depressed or hopeless | A | `phq2-total` (`phq2-screen`) |

### Band rule used

**`gad7-total` — profile `gad7`.** `sum` of the 7 GAD-7 items (0–3 each). Range **0–21**. Higher is distress. Missing: `invalidate`, all 7 required.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Minimal | `0 ≤ x < 5` | minimal | success |
| Mild | `5 ≤ x < 10` | mild | warning |
| Moderate | `10 ≤ x < 15` | moderate | warning |
| Severe | `15 ≤ x ≤ 21` | severe | error |

**`phq2-total` — profile `phq2-screen`.** `sum` of 2 items. Range **0–6**. Higher is distress. Missing: `invalidate`, both required.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Negative screen | `0 ≤ x < 3` | minimal | success |
| Positive screen | `3 ≤ x ≤ 6` | moderate | warning |

---

# 3 · Feeling worried and stressed

`feeling-worried-and-stressed` · `asm_1767129926263_ru3v6dozh` · category `stress` · 7 items · PSS-style

**Scale B (5-pt frequency, 0–4):** `0 - Never` (0) · `1 - Almost Never` (1) · `2 - Sometimes` (2) · `3 - Fairly Often` (3) · `4 - Very Often` (4)

| id | item | Option Scale | scored by (band) |
|---|---|---|---|
| `stress-q1` | How often has stress affected your sleep? | B | `stress-total` (`stress-severity`) |
| `stress-q2` | How often has stress affected your focus? | B | `stress-total` (`stress-severity`) |
| `stress-q3` | How often have you felt physically tense? | B | `stress-total` (`stress-severity`) |
| `stress-q4` | How often have you felt rushed or pressured? | B | `stress-total` (`stress-severity`) |
| `stress-q5` | How often have you worried excessively? | B | `stress-total` (`stress-severity`) |
| `stress-q6` | How often have you felt emotionally drained? | B | `stress-total` (`stress-severity`) |
| `stress-q7` | How often has stress interfered with daily life? | B | `stress-total` (`stress-severity`) |

### Band rule used

**`stress-total` — profile `stress-severity`.** `sum` of all 7 items (0–4 each). Range **0–28**. Higher is distress. Missing: `invalidate`, all 7 required.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Low Stress | `0 ≤ x < 8` | minimal | success |
| Moderate Stress | `8 ≤ x < 19` | moderate | warning |
| High Stress | `19 ≤ x ≤ 28` | moderately-severe | error |

---

# 4 · Struggling with quality sleep

`struggling-with-quality-sleep` · `asm_1767130007889_mewy939gi` · category `sleep` · 8 items · ISI themes

Five scales, all weighted **1–5**, which is why the floor is 8 and not 0.

- **C1 latency:** `1 0-15 minutes` (1) · `2 16-30 minutes` (2) · `3 31-45 minutes` (3) · `4 46-60 minutes` (4) · `5 Over 60 minutes` (5)
- **C2 nights:** `1 0-1` (1) · `2 2` (2) · `3 3` (3) · `4 4` (4) · `5 5-7` (5)
- **C3 quality:** `1 Very Good` (1) · `2 Good` (2) · `3 Average` (3) · `4 Poor` (4) · `5 Very Poor` (5)
- **C4 impact:** `1 Not at all` (1) · `2 A little` (2) · `3 Somewhat` (3) · `4 Much` (4) · `5 Very Much` (5)
- **C5 chronicity:** `1 I don't have a problem/less than 1 month` (1) · `2 1 – 2 months` (2) · `3 3 – 6 months` (3) · `4 7 – 12 months` (4) · `5 More than 1 year` (5)

| id | item | Option Scale | scored by (band) |
|---|---|---|---|
| `sleep-q1` | How long does it take you to fall asleep? | C1 | `sleep-total` (`sleep-severity`) |
| `sleep-q2` | …if you then wake up during the night … how long are you awake for in total? (add all the times you woke up) | C1 | `sleep-total` (`sleep-severity`) |
| `sleep-q3` | How many nights a week do you have sleep troubles? | C2 | `sleep-total` (`sleep-severity`) |
| `sleep-q4` | How would you rate the quality of your sleep? | C3 | `sleep-total` (`sleep-severity`) |
| `sleep-q5` | Affected your mood, energy, or relationships? | C4 | `sleep-total` (`sleep-severity`) |
| `sleep-q6` | Affected your concentration, productivity, or ability to stay awake? | C4 | `sleep-total` (`sleep-severity`) |
| `sleep-q7` | Troubled you in general? | C4 | `sleep-total` (`sleep-severity`) |
| `sleep-q8` | How often does poor sleep affect your energy? | C5 | `sleep-total` (`sleep-severity`) |

### Band rule used

**`sleep-total` — profile `sleep-severity`.** `sum` of all 8 items (1–5 each). Range **8–40**. Higher is distress. Missing: `invalidate`, all 8 required.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Healthy Sleep | `8 ≤ x < 25` | minimal | success |
| Poor Sleep | `25 ≤ x < 33` | moderate | warning |
| Very Poor Sleep | `33 ≤ x ≤ 40` | severe | error |

---

# 5 · Struggling to balance life

`struggling-to-balance-life` · `asm_1767130043662_wc4qpivfl` · category `balance` · 8 items · custom, mixed-direction wording

**Scale D (5-pt frequency, 1–5):** `1 Never` (1) · `2 Rarely` (2) · `3 Sometimes` (3) · `4 Often` (4) · `5 Very Often` (5)

| id | item | Option Scale | scored by (band) |
|---|---|---|---|
| `balance-q1` | I feel I have enough time for myself | D | `balance-total` (`balance-severity`) · reversed |
| `balance-q2` | My work drains most of my energy | D | `balance-total` (`balance-severity`) |
| `balance-q3` | I can disconnect from work after hours | D | `balance-total` (`balance-severity`) · reversed |
| `balance-q4` | I feel supported at work or home | D | `balance-total` (`balance-severity`) · reversed |
| `balance-q5` | My responsibilities feel manageable | D | `balance-total` (`balance-severity`) · reversed |
| `balance-q6` | I feel guilty when I take breaks | D | `balance-total` (`balance-severity`) |
| `balance-q7` | I have time for relationships | D | `balance-total` (`balance-severity`) · reversed |
| `balance-q8` | I feel constantly "on" | D | `balance-total` (`balance-severity`) |

### Band rule used

**`balance-total` — profile `balance-severity`.** `sum` of all 8 items (1–5 each), with the five positively-worded items reversed so a good answer contributes low strain. Range **8–40**. Higher is distress. Missing: `invalidate`, all 8 required.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Balanced | `8 ≤ x < 19` | minimal | success |
| Strained | `19 ≤ x < 28` | mild | warning |
| Imbalanced | `28 ≤ x ≤ 40` | moderate | error |

---

# 6 · Feeling drained and burned out

`feeling-drained-and-burned-out` · `asm_1767129964930_bv8cqgm16` · category `burnout` · 23 items · BAT-23

**Scale E (5-pt frequency, 1–5):** `1 - Never` (1) · `2 - Rarely` (2) · `3 - Sometimes` (3) · `4 - Often` (4) · `5 - Always` (5)

Burnout is the only assessment whose `options` are stored as plain strings, with weights held only in the item's `scoring` map. The other six store `{text, value}` objects.

Every item feeds its sub-scale **and** `bat-overall`. All five scores band against the same profile.

| id | item | Option Scale | scored by (band) |
|---|---|---|---|
| `burnout-q1` | I feel detached from my work | E | `bat-exhaustion` + `bat-overall` (`bat-mean`) |
| `burnout-q2` | I feel cynical about responsibilities | E | `bat-exhaustion` + `bat-overall` (`bat-mean`) |
| `burnout-q3` | I feel mentally drained | E | `bat-exhaustion` + `bat-overall` (`bat-mean`) |
| `burnout-q4` | I feel physically tired | E | `bat-exhaustion` + `bat-overall` (`bat-mean`) |
| `burnout-q5` | I feel unmotivated | E | `bat-exhaustion` + `bat-overall` (`bat-mean`) |
| `burnout-q6` | I feel overwhelmed by workload | E | `bat-exhaustion` + `bat-overall` (`bat-mean`) |
| `burnout-q7` | I feel under-appreciated | E | `bat-exhaustion` + `bat-overall` (`bat-mean`) |
| `burnout-q8` | I feel I need a long break | E | `bat-exhaustion` + `bat-overall` (`bat-mean`) |
| `burnout-q9` | I struggle to find any enthusiasm for my work | E | `bat-mental-distance` + `bat-overall` (`bat-mean`) |
| `burnout-q10` | At work, I do not think much about what I am doing, and I function on autopilot | E | `bat-mental-distance` + `bat-overall` (`bat-mean`) |
| `burnout-q11` | I feel a strong aversion towards my job | E | `bat-mental-distance` + `bat-overall` (`bat-mean`) |
| `burnout-q12` | I feel indifferent about my job | E | `bat-mental-distance` + `bat-overall` (`bat-mean`) |
| `burnout-q13` | I'm cynical about what my work means to others | E | `bat-mental-distance` + `bat-overall` (`bat-mean`) |
| `burnout-q14` | At work, I have trouble staying focused | E | `bat-cognitive` + `bat-overall` (`bat-mean`) |
| `burnout-q15` | At work I struggle to think clearly | E | `bat-cognitive` + `bat-overall` (`bat-mean`) |
| `burnout-q16` | I'm forgetful and distracted at work | E | `bat-cognitive` + `bat-overall` (`bat-mean`) |
| `burnout-q17` | When I'm working, I have trouble concentrating | E | `bat-cognitive` + `bat-overall` (`bat-mean`) |
| `burnout-q18` | I make mistakes in my work because I have my mind on other things | E | `bat-cognitive` + `bat-overall` (`bat-mean`) |
| `burnout-q19` | At work, I feel unable to control my emotion | E | `bat-emotional` + `bat-overall` (`bat-mean`) |
| `burnout-q20` | I do not recognize myself in the way I react emotionally at work | E | `bat-emotional` + `bat-overall` (`bat-mean`) |
| `burnout-q21` | During my work I become irritable when things don't go my way | E | `bat-emotional` + `bat-overall` (`bat-mean`) |
| `burnout-q22` | I get upset or sad at work without knowing why | E | `bat-emotional` + `bat-overall` (`bat-mean`) |
| `burnout-q23` | At work I may overreact unintentionally | E | `bat-emotional` + `bat-overall` (`bat-mean`) |

### Band rule used

All five scores use profile **`bat-mean`**: `mean` of that score's items. Because every score is a mean, the range is **1–5** whatever the item count, which is what lets one band table serve all five. Missing: `prorate`, `min_answered: 1` — the only profile that tolerates a partial answer set.

| Score | Items | Count |
|---|---|---|
| `bat-exhaustion` | `burnout-q1` … `q8` | 8 |
| `bat-mental-distance` | `burnout-q9` … `q13` | 5 |
| `bat-cognitive` | `burnout-q14` … `q18` | 5 |
| `bat-emotional` | `burnout-q19` … `q23` | 5 |
| `bat-overall` | all | 23 |

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Low | `1 ≤ x < 3` | minimal | success |
| Normal | `3 ≤ x < 4.31` | mild | warning |
| High | `4.31 ≤ x ≤ 5` | moderately-severe | error |

The 4.31 cut-off is a BAT norm, and it is why the bands must be half-open: a mean of 4.305 has to land somewhere.

Stored Burnout results carry `score: 60, max_score: 115` — a raw sum. Banding 60 against a 1–5 table places it nowhere. The mean is stored at `section_scores.overall.value`; both halves of the app band the computed value.

---

# 7 · Unsure or general concern

`unsure-or-general-concern` · `asm_1767129718791_zj1t8hx3c` · category `general` · 24 items · GAD-2 · PHQ-2 · WHO-5 · NGSE · BRS

Five independent scales. **No overall score, by design.**

- **A (4-pt frequency, 0–3):** `1 Not at all` (0) · `2 Several days` (1) · `3 More than half the days` (2) · `4 Nearly every day` (3)
- **F (6-pt time, 0–5):** `1 At no time` (0) · `2 Some of the time` (1) · `3 Less than half the time` (2) · `4 More than half the time` (3) · `5 Most of the time` (4) · `6 All of the time` (5)
- **G1 (5-pt agreement, 1–5):** `1 Strongly disagree` (1) · `2 Disagree` (2) · `3 Neither agree nor disagree` (3) · `4 Agree` (4) · `5 Strongly agree` (5)
- **G2 (5-pt agreement, 1–5):** `1 Strongly disagree` (1) · `2 Disagree` (2) · `3 Neutral` (3) · `4 Agree` (4) · `5 Strongly agree` (5)

G1 and G2 are the same scale differing by one word. Same screen, same respondent, two vocabularies.

| id | item | Option Scale | scored by (band) |
|---|---|---|---|
| `general-q1` | Feeling nervous, anxious or on edge | A | `gen-anxiety` (`gad2-screen`) |
| `general-q2` | Not being able to stop or control worrying | A | `gen-anxiety` (`gad2-screen`) |
| `general-q3` | Little interest or pleasure in doing things | A | `gen-depression` (`phq2-screen`) |
| `general-q4` | Feeling down, depressed, or hopeless | A | `gen-depression` (`phq2-screen`) |
| `general-q5` | Thoughts that you would be better off dead or of hurting yourself in some way | A | — not scored · **risk indicator**, flagged on answer |
| `general-q6` | I have felt cheerful in good spirits. | F | `gen-wellbeing` (`who5`) |
| `general-q7` | I have felt calm and relaxed. | F | `gen-wellbeing` (`who5`) |
| `general-q8` | I have felt active and vigorous | F | `gen-wellbeing` (`who5`) |
| `general-q9` | I woke up feeling fresh and rested | F | `gen-wellbeing` (`who5`) |
| `general-q10` | My daily life has been filled with things that interest me | F | `gen-wellbeing` (`who5`) |
| `general-q11` | I am able to achieve most of the goals that I have set for myself. | G1 | `gen-self-efficacy` (`ngse`) |
| `general-q12` | When facing difficult tasks, I am certain that I will accomplish them. | G1 | `gen-self-efficacy` (`ngse`) |
| `general-q13` | In general, I think that I can obtain outcomes that are important to me. | G1 | `gen-self-efficacy` (`ngse`) |
| `general-q14` | I believe I can succeed at almost any endeavour to which I set my mind. | G1 | `gen-self-efficacy` (`ngse`) |
| `general-q15` | I will be able to successfully overcome many challenges. | G1 | `gen-self-efficacy` (`ngse`) |
| `general-q16` | I am confident that I can perform effectively on many different tasks. | G1 | `gen-self-efficacy` (`ngse`) |
| `general-q17` | Compared to other people, I can do most tasks very well. | G1 | `gen-self-efficacy` (`ngse`) |
| `general-q18` | Even when things are tough, I can perform quite well. | G1 | `gen-resilience` (`brs`) |
| `general-q19` | I tend to bounce back quickly after hard times | G2 | `gen-resilience` (`brs`) |
| `general-q20` | I have a hard time making it through stressful events | G2 | `gen-resilience` (`brs`) · reversed |
| `general-q21` | It does not take me long to recover from a stressful event | G2 | `gen-resilience` (`brs`) |
| `general-q22` | It is hard for me to snap back when something hard happens | G2 | `gen-resilience` (`brs`) · reversed |
| `general-q23` | I usually come through difficult times with little trouble | G2 | `gen-resilience` (`brs`) |
| `general-q24` | I tend to take a long time to get over set-backs in my life | G2 | `gen-resilience` (`brs`) · reversed |

`general-q18` uses scale G1 but is scored by resilience, not self-efficacy — the scale boundary and the score boundary do not line up.

### Band rule used

**`gen-anxiety` — profile `gad2-screen`.** `sum` of 2 items. Range **0–6**. Higher is distress.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Negative screen | `0 ≤ x < 3` | minimal | success |
| Positive screen | `3 ≤ x ≤ 6` | moderate | warning |

**`gen-depression` — profile `phq2-screen`.** `sum` of 2 items. Range **0–6**. Higher is distress.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Negative screen | `0 ≤ x < 3` | minimal | success |
| Positive screen | `3 ≤ x ≤ 6` | moderate | warning |

**`gen-wellbeing` — profile `who5`.** `sum_times_k` with **k = 4**: sum the 5 items (0–5 each, raw 0–25) then multiply by 4. Range **0–100**. **Higher is better.** Missing: `invalidate`, all 5 required.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Poor | `0 ≤ x < 29` | moderately-severe | error |
| Below average | `29 ≤ x < 51` | mild | warning |
| Good | `51 ≤ x ≤ 100` | minimal | success |

**`gen-self-efficacy` — profile `ngse`.** `sum` of 7 items (1–5 each). Range **7–35**. **Higher is better.** Missing: `invalidate`, all 7 required.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Low | `7 ≤ x < 21` | moderate | error |
| Normal | `21 ≤ x < 30` | mild | warning |
| High | `30 ≤ x ≤ 35` | minimal | success |

**`gen-resilience` — profile `brs`.** `sum` of 7 items (1–5 each), three reversed. Range **7–35**. **Higher is better.** Missing: `invalidate`, all 7 required.

| Band | Interval | severity_ref | tone |
|---|---|---|---|
| Low | `7 ≤ x < 21` | moderate | error |
| Normal | `21 ≤ x < 30` | mild | warning |
| High | `30 ≤ x ≤ 35` | minimal | success |

On the three higher-is-better profiles the severity ramp runs **opposite to band order** — the lowest band carries the worst severity. That is what `direction: higher_is_better` means. No consumer may infer severity from the number.

---

# Appendix — the eleven profiles

| Profile | Calc | Direction | Range | Bands | Missing | Used by |
|---|---|---|---|---|---|---|
| `phq9` | sum | distress | 0–27 | 5 | invalidate, 9 | Depression |
| `gad7` | sum | distress | 0–21 | 4 | invalidate, 7 | Anxiety |
| `gad2-screen` | sum | distress | 0–6 | 2 | invalidate, 2 | Depression, General |
| `phq2-screen` | sum | distress | 0–6 | 2 | invalidate, 2 | Anxiety, General |
| `stress-severity` | sum | distress | 0–28 | 3 | invalidate, 7 | Stress |
| `sleep-severity` | sum | distress | 8–40 | 3 | invalidate, 8 | Sleep |
| `balance-severity` | sum | distress | 8–40 | 3 | invalidate, 8 | Balance |
| `bat-mean` | mean | distress | 1–5 | 3 | prorate, 1 | Burnout ×5 |
| `who5` | sum_times_k (k=4) | better | 0–100 | 3 | invalidate, 5 | General |
| `ngse` | sum | better | 7–35 | 3 | invalidate, 7 | General |
| `brs` | sum | better | 7–35 | 3 | invalidate, 7 | General |

Every band carries both a `severity_ref` and a `tone`. Coverage is complete on all eleven: no achievable score falls outside a band, no two bands overlap.

**Unscored items:** `depression-q10` and `anxiety-q8` are impairment add-ons, asked and not summed per the published instruments. `general-q5` is the risk indicator, flagged on answer and never summed.
