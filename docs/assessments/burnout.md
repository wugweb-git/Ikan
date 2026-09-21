# Burnout — "Feeling drained and burned out"

Pulled live from `assessment_def:asm_1767129964930_bv8cqgm16` on 2026-08-05, **content-corrected
2026-08-07**. `burnout-q1` (literal placeholder text `"test"`, shown as the very first question to
every user) has been **removed** — see below. Question count is now 22, matching the 4 BAT
sections exactly.

## ✅ Fixed 2026-08-07: `burnout-q1` ("test") removed

Same fix pattern as General (§ that doc) — found via a systematic check of every assessment's live
`questions[]` against every id referenced by its own scoring preset. `burnout-q1` was referenced by
no section (confirmed in `assessment-section-presets.ts`), and its stored text was the literal word
`"test"` — no real content to preserve, so removed rather than authored-around. Removed from
`questions[]` on both `assessment_def:` and the `assessment:` mirror; the stale `daily_content`
builder cache was cleared so the admin builder regenerates correctly from the corrected 22.

## Meta

| Field | Value |
|---|---|
| id | `asm_1767129964930_bv8cqgm16` |
| slug | `feeling-drained-and-burned-out` |
| category | `burnout` |
| duration | 10 |
| question count | **22** (real, scored items only, as of 2026-08-07) |

## Description

> Identify emotional exhaustion and mental distance related to work stress as a first step toward
> recovery.

## Scoring — as stored vs. as scored

- `scoring.ranges`: **null**.
- `resultCategories` (dead field, never read by the player): 3 bands on a 0–40 sum scale — `Low
  Burnout Risk 0–12`, `Burnout Warning 13–25`, `High Burnout Risk 26–40`. **Not what actually
  scores this assessment** — see below.
- **Actual scoring**: 4 sections (Exhaustion, Mental distancing, Cognitive impairment, Emotional
  impairment) plus an overall risk index, all on a 1–5 mean — see
  `src/lib/assessment-section-presets.ts` (`BURNOUT_SECTIONS`). The stored `resultCategories` above
  is entirely superseded and can be ignored/removed.

## Questions, in order (grouped by section, not stored order)

All 22 questions use the same 5-point scale, options `1`–`5` (scored 0–4 by array index, +1 offset
applied during scoring to express the standard 1–5 BAT mean). `burnout-q1` (`"test"` placeholder,
unscored) removed 2026-08-07 — see above.

**Exhaustion**
| id | Text |
|---|---|
| `burnout-q5` | I feel mentally drained |
| `burnout-q6` | I feel physically tired |
| `burnout-q7` | I feel unmotivated |
| `burnout-q8` | I feel overwhelmed by workload |
| `burnout-q9` | I feel under-appreciated |
| `burnout-q10` | I feel I need a long break |

**Mental distancing**
| id | Text |
|---|---|
| `burnout-q2` | I feel detached from my work |
| `burnout-q4` | I feel cynical about responsibilities |
| `block-1773730436410` | "At work, I do not think much about what I am doing, and I function on autopilot" |
| `block-1773730438342` | "I feel a strong aversion towards my job" |
| `block-1773730440488` | I feel indifferent about my job |
| `block-1773730442601` | "I'm cynical about what my work means to others" |

**Cognitive impairment**
| id | Text |
|---|---|
| `block-1773730444594` | "At work, I have trouble staying focused" |
| `block-1773730446622` | At work I struggle to think clearly |
| `block-1773730448735` | I'm forgetful and distracted at work |
| `block-1773730450593` | "When I'm working, I have trouble concentrating" |
| `block-1773730452581` | "I make mistakes in my work because I have my mind on other things" |

**Emotional impairment**
| id | Text |
|---|---|
| `block-1773730454685` | "At work, I feel unable to control my emotion" |
| `block-1773730456837` | "I do not recognize myself in the way I react emotionally at work" |
| `block-1773730459006` | During my work I become irritable when things don't go my way |
| `block-1773730461022` | I get upset or sad at work without knowing why |
| `block-1773732058231` | At work I may overreact unintentionally |

## Verification notes

1. **Stored `resultCategories`/`scoring` bear no relationship to how this assessment is actually
   scored.** The sectioned system in `assessment-section-presets.ts` overrides both entirely at
   score time. This is fine functionally (verified: 35 passing scoring assertions), but the stored
   fields are misleading if anyone reads the assessment definition directly expecting them to be
   authoritative — worth either deleting the stale `resultCategories`/`scoring` from the KV record
   or annotating in admin that "Sections" governs this assessment instead.
2. **22 scored items, not the published BAT-23's 23.** BAT-23 defines 8 Exhaustion + 5 each for the
   other three. Here Exhaustion has 6 and Mental distancing has 6, grouped by what each question
   actually asks rather than forced into the published item counts. Means stay interpretable on
   their own terms, but scores are **not** strictly comparable to published BAT-23 norms. Separate
   from note 4 below — this is about the 22 *real* items, not the 23rd placeholder one.
3. No mixed-direction items detected in the 22 scored questions (unlike Balance, see
   [`balance.md`](balance.md)) — all worded in the same "more of this = worse" direction, so no
   reversal is needed and none is applied.
4. ✅ **Fixed 2026-08-07: `burnout-q1` (literal placeholder text "test") removed.** Same root cause
   as Stress's 3 broken questions: `AssessmentFlow.tsx`'s `normalizeAssessment()` renders every
   entry in `assessment.questions` regardless of whether `BURNOUT_SECTIONS` scores it, so a leftover
   test record from authoring was live in production. Deleted outright (no salvageable content) —
   see the fix note at the top of this doc.
