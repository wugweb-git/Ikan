# Productivity Reset — 7-day focus challenge

Pulled live from `equip:33eae2e2-e0e5-4e09-a423-5d450607bb75` on 2026-08-06. **Note:**
`EquipService.getEquip()`'s missing-slug-fallback bug (fixed 2026-08-06, see `PENDING.md`) meant
any equip could in principle have progress silently miskeyed under its slug instead of its real id
when started via a `/equip/<slug>` URL — confirmed hitting Sleep Tight twice; no evidence found of
it affecting this program specifically, but the fix now covers all equips going forward.

## Meta

| Field | Value |
|---|---|
| id | `33eae2e2-e0e5-4e09-a423-5d450607bb75` |
| slug | `productivity-reset` |
| category | `focus` |
| difficulty | `beginner` |
| duration_days | `7` |
| duration_weeks | `1` |
| is_paid | `true` |
| price / currency | `50` / `INR` |
| published | **`false`** |
| featured | `false` |
| can_repeat | `true` |
| tags | `productivity`, `focus`, `dopamine`, `planning` |
| created_at | `2026-01-04T10:37:36.427Z` |
| updated_at | `2026-07-21T13:44:51.357Z` |
| published_at | `null` |
| image_url / cover_image | Unsplash stock photo (`photo-1705417272217-490f4511abeb`) |
| thumbnail | signed Supabase Storage URL (`make-cc205da9-images/assessments/1767525959578-3r7lzcn.jpeg`, token embeds an exp claim, not reproduced here) |
| checkInConfig | `{"enabled": false, "triggerDays": [6], "triggerOnLastDay": true}` |

**Content field used:** `daily_content` (array, 8 entries, day numbers `0`–`7`). `days` and `week_structure` are both present on the record but are empty arrays (`[]`) — legacy/unused fields, same pattern as the sibling equips.

Unlike the three sibling equips already audited (all `published: true`), **this equip is unpublished** (`published: false`, `published_at: null`) — it is not live on the site despite carrying complete content and real (if synthetic-looking) enrollment/progress data. See Verification notes.

## Description (landing page)

> This 7-day challenge helps you reset focus, reduce procrastination, and rebuild productive momentum — without burnout.

**Subtitle:** empty string (`""`) — no subtitle set at all, unlike the sibling equips which at least had boilerplate text here.

## Landing page tiles (`metadata`)

| Tile | Content (verbatim) |
|---|---|
| tile2_content | `"yes"` |
| tile3_content | `"yes"` |
| tile4_content | `"yes"` |
| eligibility_intro | `""` |
| eligibility_point_1 | `""` |
| eligibility_point_2 | `"yes"` |
| eligibility_point_3 | `""` |
| eligibility_point_4 | `""` |

No `tile1_content` key exists on this record at all (the sibling equips all have one). See Verification notes — this is the placeholder/test-content bug this audit is specifically looking for: four of the eight metadata fields on this record literally contain the string `"yes"`, and the rest are empty.

## Onboarding

Two separate onboarding structures exist on this record, same dual-structure pattern as the sibling equips:

**1. `onboarding` (object) — generic template, not productivity-specific.** Title "Program Setup", version `1.0.0`, `is_required_before_start: true`. Questions verbatim:

| id | Text | Type | Options |
|---|---|---|---|
| `q-experience` | "How would you describe your current experience with this topic?" | single-choice | New to this / Some experience / Experienced |
| `q-goals` | "What do you hope to achieve with this program?" | long_text | — |
| `q-commitment` | "How committed are you to completing this program?" | scale (1–10) | min label "Not very committed", max label "Very committed" |

This is byte-identical boilerplate to the `onboarding` object found on `sleep-tight` — confirmed as an unedited shared template ("this topic", "this program"), not authored per-equip.

**2. `onboarding_questions` (array, 3 entries) — the real, productivity-specific onboarding, also duplicated as Day 0's activities.** Verbatim:

| id | Question | Type | Options (as stored here) | Required | Helper text |
|---|---|---|---|---|---|
| `68e1bb2e-…` | "Welcome" | single_select | `[]` | true | `<p>This 7-day challenge helps you reset focus, reduce procrastination, and rebuild productive momentum — without burnout.</p>` |
| `2e2622a1-…` | "Expectations" | single_select | Increase productivity / Overcome screen addiction / Develop a schedule / Overcome dopamine addiction / Overcome procrastination | true | — |
| `e65d0828-…` | "Weekly Intent" | single_select | `[]` | true | — |

Unlike the `sleep-tight` audit finding, this array is **not** missing data relative to Day 0: "Welcome" is a `lesson`-type block (no options needed) and "Weekly Intent" is a `reflection`-type block (free text, no options needed) in the real Day 0 activities too — the empty `options: []` here is consistent with those activity types, not a stale/incomplete mirror. "Expectations" carries the full 5-option list in both places, word-for-word identical.

## Day-by-day content (`daily_content`, 8 entries)

Program day numbering runs `0`–`7` (8 calendar entries). Day 0 is an onboarding/intake day; `progress:` records key completion as day `1`–`7` (see Usage data below), consistent with `duration_days: 7`. All 8 days are present, sequential, with no duplicates and no missing day numbers.

### Day 0 — "Onboarding" (`Expectation Setting.`)
3 activities, all `required: true`, mirroring `onboarding_questions` above with the full activity configs:
1. **Welcome** (lesson) — `<p>This 7-day challenge helps you reset focus, reduce procrastination, and rebuild productive momentum — without burnout.</p>`
2. **Expectations** (quiz, key `productivity_goals`) — prompt "What do you want to achieve by the end of this challenge?" — options: Increase productivity / Overcome screen addiction / Develop a schedule / Overcome dopamine addiction / Overcome procrastination (multi-select, card UI).
3. **Weekly Intent** (reflection, key `weekly_focus`) — prompt "What is ONE focus you want to prioritise this week?"

### Day 1 — "Awareness & Baseline" (`Where Is Your Time Going?`)
3 activities:
1. **Awareness** (lesson) — `<p>Before fixing productivity, we first observe where your attention and energy currently go.</p>`
2. **Screen Usage Tracker** (reflection, key `screen_usage_today`) — row-list prompt "Track your usage today", rows: Phone usage / App usage / TV / Streaming time.
3. **Weekly Activities List** (reflection, key `weekly_activities`) — text-list prompt "List activities you want to do this week" (max 10 items).

### Day 2 — "Planning & Eat the Frog" (`Plan Before You Act.`)
4 activities:
1. **Plan** (lesson) — `<p>Clarity reduces procrastination. Today you plan, prioritize, and act.</p>`
2. **Task Planning Matrix** (reflection, key `daily_tasks`) — matrix prompt "Plan today's tasks", columns: Task / Difficulty (Easy / Neutral / Hard) / Priority (⭐–⭐⭐⭐).
3. **Eat the Frog** (reflection, key `frog_task`) — prompt "Which task did you tackle first?"
4. **Reflection** (reflection, key `frog_reflection`) — prompt "How did it feel after completing it?"

### Day 3 — "Hermit Hour" (`Focus Time.`)
3 activities:
1. **Hermit Hour** (lesson) — `<p>Deep focus requires distance from distractions. Today, we practice intentional isolation.</p>`
2. **Focus Sessions** (reflection, key `focus_sessions`) — numeric prompt "How many 20-minute focus sessions did you complete?" (min 0, max 10).
3. **Distraction Control** (quiz, key `distraction_methods`) — multi-select prompt "What helped reduce distractions?" — options: Phone out of sight / Blocker apps / Silent notifications / Different workspace.

### Day 4 — "Mindfulness + Movement" (`Reset Your Mind & Body.`)
3 activities:
1. **Reset** (lesson) — `<p>Productivity improves when you step away and reset your nervous system.</p>`
2. **Mindfulness Check** (quiz, key `mindfulness_done`) — MCQ prompt "Did you take a 30-minute mindful break?" — options: Yes / No.
3. **Movement Log** (reflection, key `movement_activity`) — prompt "What physical activity did you do?"

### Day 5 — "Motivation Mapping" (`Understanding Motivation.`)
2 activities (the shortest day in the program):
1. **Motivation** (lesson) — `<p>Motivation depends on rewards, urgency, and perceived effort.</p>`
2. **Motivation Table** (reflection, key `motivation_map`) — matrix prompt "Map your procrastinated tasks", columns: Task / Roadblock / Reward / Urgency / Time Gap.

### Day 6 — "Perfecting Imperfection" (`Action beats perfection.`)
3 activities:
1. **Imperfection** (lesson) — `<p>Perfectionism delays progress. Action beats perfection.</p>`
2. **Perfectionism Check** (quiz, key `perfectionism_today`) — MCQ prompt "Did perfectionism slow you down today?" — options: Yes / No.
3. **Reflection** (reflection, key `imperfection_reflection`) — prompt "What did you do anyway, despite it not being perfect?"

### Day 7 — "Weekly Planning" (`Designing the Next Week.`)
3 activities:
1. **Planning** (lesson) — `<p>Structure creates freedom. Today, you plan the next week intentionally.</p>`
2. **Weekly Schedule** (reflection, key `weekly_schedule`) — prompt "Plan your next week (hour-level if possible)".
3. **Commitment** (reflection, key `weekly_commitment`) — prompt "One promise I make to myself next week".

No block on any day contains a large embedded media blob, placeholder text ("test", "TBD", "Lorem ipsum"), a truncated sentence, or duplicated day-to-day content — every one of the 7 program days is distinct instructional material (unlike `sleep-tight`, which had 16 of its 31 days as byte-identical filler).

## Usage data (live enrollees)

### Enrollments (KV `enrollment:` records, keyed by `programId`)

**10 enrollment records** found for this equip in KV. Postgres shadow table `user_enrollments` (`data->>'programId'`) also returns **10** — no migration drift.

| userId | # enrollments | Notes |
|---|---|---|
| `d5003e00-7ddc-4f1a-8658-8dd43a20674f` | 8 | Multiple same-second/near-same-second re-enrollments across two bursts (2026-03-13T00:12:48–49 and 00:33:27–28), plus two more at 02:02:23–24 |
| `7b0b9f70-80e3-4cb5-87ec-cd74a08971db` | 2 | Both within 1 second of each other (2026-03-13T02:25:13.593Z / .901Z) |

Every one of the 10 enrollment records has `status: "active"`, `currentDay: 1`, and `completedDays: []` — including both users, both of whom have full 7-day completion recorded in `progress:` (below). Same pattern as `sleep-tight`: the enrollment record's own progress fields are never updated after creation, so they cannot be used as a source of completion truth.

### Progress (KV `progress:` records, keyed by `equip_id`)

**14 progress records** found: 7 for `d5003e00-7ddc-4f1a-8658-8dd43a20674f` (day_number 1–7, complete coverage) and 7 for `7b0b9f70-80e3-4cb5-87ec-cd74a08971db` (day_number 1–7, also complete coverage). Postgres shadow table `user_program_progress` also returns **14** — no migration drift.

All `day_number` values fall inside the program's 1–7 range — no orphaned/out-of-range day numbers found.

Both users' full 7-day runs are unambiguously synthetic/QA traffic, not genuine engagement:
- `d5003e00…` completed all 7 days in **71 seconds** (`2026-03-13T02:02:36Z` → `02:03:47Z`).
- `7b0b9f70…` completed all 7 days in **62 seconds** (`2026-03-13T02:25:26Z` → `02:26:28Z`).
- Every single one of the 14 progress records has `block_responses: {}` — completely empty, not even placeholder/gibberish text. No real answer content was ever captured for this equip's activities by either test run.

That an equip with `published: false` has any enrollments and completions at all confirms these are QA/test-account runs exercising the unpublished program directly (likely via admin/staging access), not evidence of real user traffic.

### Recommendation rules

`select … from kv_store_cc205da9 where key like 'recommendation_rule:%' and value->>'equip_id' = '33eae2e2-e0e5-4e09-a423-5d450607bb75'` returns **zero rows**. Nothing in the recommendation engine currently routes to this equip.

## Verification notes

1. 🔴 **Four of the eight `metadata` landing-page fields literally contain the placeholder string `"yes"`, and the rest are empty strings.** `tile2_content`, `tile3_content`, `tile4_content`, and `eligibility_point_2` are all `"yes"`; `eligibility_intro`, `eligibility_point_1`, `eligibility_point_3`, `eligibility_point_4` are all `""`. There is no `tile1_content` key on the record at all. This is exactly the class of bug this audit was asked to look for — obviously-placeholder QA/test content that was never replaced with real copy, sitting on a record that otherwise looks structurally complete (full onboarding, full 7-day content).

2. 🔴 **This equip is unpublished** (`published: false`, `published_at: null`) despite having complete onboarding and day content and real enrollment/progress activity. If the product team believes "Productivity Reset" is live, it currently is not — and the presence of test enrollments/completions against an unpublished record suggests it was exercised through a non-production path (admin/staging), not by real users landing on the marketing page.

3. 🟡 **Landing-page `subtitle` is a bare empty string**, not even generic boilerplate (contrast with `sleep-tight`, which at least had a filled-in — if generic — subtitle). If the frontend renders subtitle unconditionally, this equip's card/header will show a blank line.

4. 🟡 **The `onboarding` object (singular) is the same unedited generic template found on `sleep-tight`**, word-for-word identical ("How would you describe your current experience with this topic?", "What do you hope to achieve with this program?"). Confirms this is a shared, never-customized default rather than an isolated one-off — worth checking whether every equip in the system carries this same dead/generic object.

5. 🟢 **All 14 progress records across both test users have completely empty `block_responses: {}`.** Unlike `sleep-tight`'s synthetic run (which at least had gibberish text like `"vrv"`, `"evev"`), this equip's test completions captured zero response data for any activity on any day — worth knowing if anyone tries to use these records as sample data for QA or demos.

6. 🟢 Both full-completion test runs happened at superhuman speed (71 seconds and 62 seconds for all 7 days respectively) — unambiguously synthetic/QA traffic, not evidence of genuine user engagement with this program.

7. 🟢 No migration drift found: both `enrollment:`→`user_enrollments` (10 = 10) and `progress:`→`user_program_progress` (14 = 14) shadow-table counts match their KV source exactly for this equip.

8. 🟢 `checkInConfig.enabled` is `false` even though `triggerDays: [6]` and `triggerOnLastDay: true` are configured — same dead-but-wired pattern as `sleep-tight`'s check-in config, just with a single trigger day instead of three.

9. 🟢 No content-integrity problems found in the day-by-day material itself: all 8 entries (Day 0–7) are present, sequential, non-duplicated, and free of placeholder/truncated/build-note text. `duration_days` (7), `duration_weeks` (1, i.e. 1×7=7), the day count (7 program days after Day 0), and the description's "7-day challenge" all agree — no duration mismatch, unlike some sibling equips.

10. 🟢 No recommendation rule in the system currently points at this equip (`recommendation_rule:` scan for `equip_id` = this id returns zero rows).
