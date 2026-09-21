# General — "Unsure or general concern"

Pulled live from `assessment_def:asm_1767129718791_zj1t8hx3c` on 2026-08-05, **content-corrected
2026-08-07**. Question count is now **24**, all 24 real and scored/risk-relevant — not 27, and not
the 24-that-was-actually-27-minus-a-stale-cache from 2026-08-06.

## ✅ Fixed 2026-08-07: 3 dead placeholder questions removed, live-confirmed via screenshot

`gen-q2`/`gen-q3`/`gen-q4` ("How would you rate your overall physical health?" / "...overall mental
health?" / "I feel optimistic about my future") were shown to every real user (`required: true`, no
skip) despite being **known, documented dead weight since 2026-08-06** —
`assessment-section-presets.ts`'s own comment says they were placeholder stand-ins for what became
`gen-dep-q1`/`gen-dep-q2`, and were never removed once the real replacements were added. Caught when
a user screenshotted them live in production. Removed from `questions[]` on both `assessment_def:`
and the `assessment:` mirror; the stale `daily_content` builder cache (a separate bug fixed earlier
the same day — see `PENDING.md`) was cleared again since this edit changed `questions[]` again.

This was found by systematically checking every assessment's live `questions[]` against every
question id referenced by its own scoring preset in `assessment-section-presets.ts` — any question
present in the data but referenced by no section and no risk indicator is either intentionally
unscored-but-real (verified case by case) or dead weight. The same pass found and fixed the same
issue in Burnout and Stress — see those docs.

## Meta

| Field | Value |
|---|---|
| id | `asm_1767129718791_zj1t8hx3c` |
| slug | `unsure-or-general-concern` |
| category | `general` |
| duration | 3 (minutes, as authored) |
| featured | false |
| question count | **24** (real, scored/risk-relevant items only, as of 2026-08-07) |

## Description

> A quick, holistic snapshot combining anxiety, depression, well-being, resilience, and self-efficacy.

## Scoring — as stored vs. as scored

- `scoring.ranges`: **null**. Per-instrument spec says `Overall Score: NIL` — this is intentional
  for General, not a gap.
- `resultCategories` (admin-authored, never read by the player): 3 identical placeholder entries,
  `{min:0, max:10, label:"New Category", description:""}` — never actually configured. Irrelevant
  now that scoring runs through `assessment-section-presets.ts` (`GENERAL_SECTIONS`), which
  overrides this at score time regardless of what's stored on the definition.
- **Actual scoring**: 5 sections (Anxiety, Depression, Wellbeing, Self-efficacy, Resilience), no
  overall total — see `src/lib/assessment-section-presets.ts`.

## Questions, in order

| # | id | Text | Options | Section |
|---|---|---|---|---|
| 1 | `gen-q1` | Feeling nervous, anxious or on edge | 1 Not at all · 2 Several days · 3 More than half the days · 4 Nearly every day | Anxiety |
| ~~2~~ | ~~`gen-q2`~~ | ~~How would you rate your overall physical health?~~ | — | **removed 2026-08-07 — dead placeholder, see above** |
| ~~3~~ | ~~`gen-q3`~~ | ~~How would you rate your overall mental health?~~ | — | **removed 2026-08-07 — dead placeholder, see above** |
| ~~4~~ | ~~`gen-q4`~~ | ~~I feel optimistic about my future~~ | — | **removed 2026-08-07 — dead placeholder, see above** |
| 5 | `block-1773736126142` | Thoughts that you would be better off dead or of hurting yourself in some way | (same 4-point scale) | Risk indicator only — never folded into a section score |
| 6 | `block-1773736128273` | I have felt cheerful in good spirits | 1 At no time … 6 All of the time (6-pt) | Wellbeing (WHO-5) |
| 7 | `block-1773736130158` | I have felt calm and relaxed | (6-pt) | Wellbeing |
| 8 | `block-1773736132052` | I have felt active and vigorous | (6-pt) | Wellbeing |
| 9 | `block-1773736134105` | I woke up feeling fresh and rested | (6-pt) | Wellbeing |
| 10 | `block-1773736136122` | My daily life has been filled with things that interest me | (6-pt) | Wellbeing |
| 11 | `block-1773736138170` | I am able to achieve most of the goals that I have set for myself | 1 Strongly disagree … 5 Strongly agree (5-pt) | Self-efficacy |
| 12 | `block-1773736140137` | When facing difficult tasks, I am certain that I will accomplish them | (5-pt) | Self-efficacy |
| 13 | `block-1773736142436` | In general, I think that I can obtain outcomes that are important to me | (5-pt) | Self-efficacy |
| 14 | `block-1773736145417` | I believe I can succeed at almost any endeavour to which I set my mind | (5-pt) | Self-efficacy |
| 15 | `block-1773736147587` | I will be able to successfully overcome many challenges | (5-pt) | Self-efficacy |
| 16 | `block-1773736149658` | I am confident that I can perform effectively on many different tasks | (5-pt) | Self-efficacy |
| 17 | `block-1773736151870` | Compared to other people, I can do most tasks very well | (5-pt) | Self-efficacy |
| 18 | `block-1773736154075` | Even when things are tough, I can perform quite well | (5-pt) | Self-efficacy |
| 19 | `block-1773736156172` | I tend to bounce back quickly after hard times | (5-pt) | Resilience |
| 20 | `block-1773736158289` | I have a hard time making it through stressful events | (5-pt) | Resilience — **reverse-scored** |
| 21 | `block-1773736161020` | It does not take me long to recover from a stressful event | (5-pt) | Resilience |
| 22 | `block-1773736163250` | It is hard for me to snap back when something hard happens | (5-pt) | Resilience — **reverse-scored** |
| 23 | `block-1773736165457` | I usually come through difficult times with little trouble | (5-pt) | Resilience |
| 24 | `block-1773736175000` | I tend to take a long time to get over set-backs in my life | (5-pt) | Resilience — **reverse-scored** |
| 25 | `gen-anxiety-q2` | Not being able to stop or control worrying | 1 Not at all · 2 Several days · 3 More than half the days · 4 Nearly every day | Anxiety (added 2026-08-06, copied verbatim from `anxiety-q2`) |
| 26 | `gen-dep-q1` | Little interest or pleasure in doing things | (same 4-point scale) | Depression (added 2026-08-06, copied verbatim from `dep-q1`) |
| 27 | `gen-dep-q2` | Feeling down, depressed, or hopeless | (same 4-point scale) | Depression (added 2026-08-06, copied verbatim from `dep-q2`) |

## Verification notes

1. ~~Depression section is empty.~~ **Fixed 2026-08-06** — `gen-dep-q1`/`gen-dep-q2` added (items
   26–27 above). q2/q3/q4 ("rate your mental health", "I feel optimistic") remain correctly excluded
   — they were never PHQ-2 items, just unscored filler.
2. ~~Anxiety section has 1 of 2 expected items.~~ **Fixed 2026-08-06** — `gen-anxiety-q2` added
   (item 25 above). GAD-2 in General is now a complete 2-item screen.
3. **How it was fixed**: no new authoring — the content already existed verbatim in the standalone
   Anxiety/Depression assessments (`anxiety-q2`, `dep-q1`, `dep-q2`). Copied into this assessment's
   `questions` array under new ids (`gen-anxiety-q2`, `gen-dep-q1`, `gen-dep-q2`, appended rather
   than inserted in the middle, so existing question ids/positions are untouched), and wired into
   `GENERAL_SECTIONS.sections[anxiety|depression].questionIds` in
   `src/lib/assessment-section-presets.ts`.
4. **Reverse-scored resilience items are working as intended** — verified in code with 35 passing
   assertions (see `src/app/lib/assessment-sections.ts`). Listed here so a future content edit doesn't
   accidentally "fix" the wording of items 20/22/24 to read positively, which would silently break
   the reversal.
5. q2/q3/q4 are permanently unscored under the current section design. If they should form their
   own section rather than being dropped, that's a product decision, not a bug — flagged in
   `PENDING.md`.
