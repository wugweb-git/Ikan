# Sleep Tight — 31-day sleep programme

Pulled live from `equip:68970d31-0ff3-4d73-b137-80e98228d399` on 2026-08-06. **`EquipService.getEquip()`'s
missing-slug-fallback bug fixed 2026-08-06** — this equip's real UUID id is what's actually stored
here, but any user who started the program via its `/equip/sleep-tight` slug URL had their
progress silently miskeyed under the raw slug string instead. Two separate users hit this
(discovered in two passes); both were migrated by hand. The underlying code bug is now fixed, so
this should not recur for future enrollments. See `PENDING.md` and the stability audit artifact's
§04 for the full root-cause writeup.

## Meta

| Field | Value |
|---|---|
| id | `68970d31-0ff3-4d73-b137-80e98228d399` |
| slug | `sleep-tight` |
| category | `sleep` |
| difficulty | `beginner` |
| duration_days | `31` |
| duration_weeks | `5` |
| is_paid | `false` |
| price / currency | `499` / `INR` (dead value while `is_paid` is false) |
| published | `true` |
| featured | `false` |
| can_repeat | `true` |
| tags | `sleep`, `cbt-i`, `insomnia`, `rest` |
| created_at | `2026-01-04T11:08:19.513Z` |
| updated_at | `2026-07-21T13:41:38.170Z` |
| published_at | `2026-03-18T10:26:10.414Z` |
| image_url / cover_image | Unsplash stock photo (`photo-1531353826977-0941b4779a1c`) |
| thumbnail | signed Supabase Storage URL (`make-cc205da9-images/assessments/1767525926677-8tjhdzj.webp`, expires 2026 — token embeds an exp claim, not reproduced here) |
| checkInConfig | `{"enabled": false, "triggerDays": [7, 14, 30], "triggerOnLastDay": true}` |

**Content field used:** `daily_content` (array, 31 entries, day numbers `0`–`30`). `days` and `week_structure` are both present on the record but are empty arrays (`[]`) — legacy/unused fields, consistent with the prior audit note in this repo's instructions.

## Description (landing page)

> A gentle, guided program to help you understand and improve your sleep. There's nothing to "fix" immediately.
> We'll start by noticing patterns and building consistency.

**Subtitle:** "Transform your life with daily practice." — a generic, non-sleep-specific line (see Verification notes).

## Landing page tiles (`metadata`)

| Tile | Content (verbatim) |
|---|---|
| tile1_content | "Having trouble sleeping? I-Kan's Sleep Tight module is here. We know quality sleep is essential for your well-being. Over the next 31 days, we'll work together to address your sleep troubles and help you achieve restful nights, improving your health, focus, and mood." |
| tile2_content | "Daily micro-lessons (5-10 minutes)\nEvidence-based CBT techniques\nProgress tracking & insights\nPersonalized sleep plan" |
| tile3_content | "Complete your daily lessons at your own pace\nTrack your sleep patterns and progress\nPractice new techniques each day\nReview your insights and adjust your plan" |
| tile4_content | "Better Sleep Quality. Fall asleep faster and wake up refreshed\nReduced Sleep Anxiety. Stop worrying about sleep and feel more in control\nSustainable Habits. Build routines that last beyond the program\nImproved Daily Energy. Feel more alert and energized during the day" |
| eligibility_intro | "Daily micro-lessons (5-10 minutes)" |
| eligibility_point_1 | "Evidence-based CBT techniques" |
| eligibility_point_2 | "Progress tracking & insights" |
| eligibility_point_3 | "Personalized sleep plan" |
| eligibility_point_4 | "No pills" |

(See Verification notes — the "eligibility" fields are a duplicate of tile2_content, not real eligibility criteria.)

## Onboarding

Two separate onboarding structures exist on this record:

**1. `onboarding` (object) — generic template, not sleep-specific.** Title "Program Setup", version `1.0.0`, `is_required_before_start: true`. Questions verbatim:

| id | Text | Type | Options |
|---|---|---|---|
| `q-experience` | "How would you describe your current experience with this topic?" | single-choice | New to this / Some experience / Experienced |
| `q-goals` | "What do you hope to achieve with this program?" | long_text | — |
| `q-commitment` | "How committed are you to completing this program?" | scale (1–10) | min label "Not very committed", max label "Very committed" |

This reads as an unedited generic template ("this topic", "this program") — see Verification notes.

**2. `onboarding_questions` (array) — the real, sleep-specific onboarding, also duplicated as Day 0's activities** (see below). Verbatim:

| id | Question | Type | Options (as stored here) | Required | Helper text |
|---|---|---|---|---|---|
| `5ba5e146-…` | "Welcome to Sleep Tight" | single_select | `[]` | true | "Sleep impacts mood, focus, immunity, and emotional resilience. Over the next days, we'll gently rebuild your relationship with sleep." |
| `3a07e6d2-…` | "Primary Sleep Concern" | single_select | Difficulty falling asleep / Waking up during the night / Waking too early / Poor sleep quality / Irregular sleep schedule | true | — |
| `7cf00114-…` | "Sleep Duration" | single_select | `[]` | true | — |
| `364fe411-…` | "Feeling" | single_select | `[]` | true | — |
| `7f243617-…` | "Commitment" | single_select | "I'm willing to try small sleep changes daily" | true | — |

Three of the five (`Welcome to Sleep Tight`, `Sleep Duration`, `Feeling`) show `options: []` in this top-level array despite `required: true` and `allow_skip: false`. The actual runtime versions of these same questions (Day 0 activities below) **do** carry full option sets and scale constraints — this top-level array appears to be a stale mirror, not what's rendered. See Verification notes.

## Day-by-day content (`daily_content`, 31 entries)

Program day numbering runs `0`–`30` (31 calendar days total). Day 0 is an onboarding/intake day; `progress:` records key completion as day `1`–`30` (see Usage data below), so Day 0 is handled outside the day-completion tracker.

### Day 0 — "Onboarding" (`Welcome to Sleep Tight.`)
5 activities, all `required: true`, mirroring `onboarding_questions` above but with full option data:

1. **Welcome to Sleep Tight** (lesson) — "Sleep impacts mood, focus, immunity, and emotional resilience. Over the next days, we'll gently rebuild your relationship with sleep."
2. **Primary Sleep Concern** (quiz, key `sleep_primary_issue`) — prompt "What troubles your sleep the most right now?" — options: Difficulty falling asleep / Waking up during the night / Waking too early / Poor sleep quality / Irregular sleep schedule (single-select, card UI).
3. **Sleep Duration** (quiz, key `avg_sleep_hours`) — prompt "On average, how many hours do you sleep?" — scale 3–9.
4. **Feeling** (reflection, key `sleep_feel_note`) — prompt "How does this amount of sleep usually feel for you?"
5. **Commitment** (checklist, key `commitment_ack`) — prompt "Commitment" — option "I'm willing to try small sleep changes daily" (multi-select).

### Day 1 — "Understanding Your Sleep" (`Observing without fixing.`)
3 activities:
1. **Understanding Sleep** (lesson) — "A sleep diary is a log which helps you in understanding your sleep patterns, habits and quality in order to support you in your quest to sleep better. Through out the duration of the program, you would be required to fill the sleep diary, in fact for the next 6 days, that is all we would like you to do."
2. **Sleep Diary** (exercise, key `sleep_quality_day1`) — 10-row input table: "What time did you get in bed?", "Did you struggle to fall asleep?", "What time did you try to go to sleep?", "How long did it take you to fall asleep?", "How many times did you wake up, not counting the final time you woke up?", "In total, how long were you up?", "What time did you finally wake up?", "What time did you get out of bed?", "On a scale of 1 to 5, how would you rate the quality of your sleep?", "Did anything interfere with your sleep?"
3. **Reflection** (reflection, key `sleep_reflection`) — "That will be all for today, we shall resume tomorrow. Thank you." / prompt "Anything that stood out?"

### Days 2–7 — "Understanding Your Sleep (Continued)" (`Observing without fixing.`) — **byte-identical across all 6 days**
3 activities, same content every day:
1. **Understanding Sleep** (lesson) — "Welcome back, let's continue with the sleep diary."
2. **Sleep Diary** (exercise, key `sleep_quality_day1` — same key reused every day) — the same 10-row diary table as Day 1, pasted as a large (~16.9 KB) Google-Docs-formatted HTML table rather than clean structured data — "Please fill this up, you don't have to fill the exact time, close approximations will suffice," followed by the same 10 diary questions and a 1–5 "Very Poor…Very Good" quality scale.
3. **Conclusion** (conclude, key `sleep_conclusion`) — "That will be all for today, we shall resume tomorrow. Thank you." / prompt "Anything that stood out?"

### Day 8 — "Thoughts and Feelings"
5 activities:
1. **Welcome Back!** (lesson) — "Welcome back. Today we'll begin exploring the connection between thoughts, feelings emotions and sleep. Before we do that, please take a few minutes and fill the sleep diary."
2. **Sleep Diary** (exercise) — same diary table, structured (not the pasted-HTML version), **no `key` field on this day's exerciseConfig** (inconsistent with the days around it).
3. **Thoughts and Feelings.** (lesson) — "Your thoughts, feeling and emotions have a direct connection with your sleep. Negative thoughts tense you up, increase alertness thereby delaying the onset of sleep. Conversely positive thoughts and emotions calm your brain fostering better and a more restful sleep. This activity acts as a mental mirror, helping you bridge the gap between your sleep quality and your emotional well-being. It highlights the "feedback loop" where your nightly mindset dictates your rest, and your rest shapes your morning outlook. By labeling these thoughts, you can identify patterns and better understand what your mind and body need to stay balanced."
4. **Mental Mirror** (checklist, key `sleep_mental_mirror`) — multi-select of 14 emoji-tagged feeling statements: "🍉My mind replays every mistake I've made", "📞I feel my loneliness during the night", "😊 I wake up refreshed and ready for the day", "💭 My dreams were vivid, and I woke up with a smile", "💤 Last night's sleep was soothing and uninterrupted", "🤸 I struggle to fall asleep, tossing and turning", "😨 Worries keep my mind active", "🕜 Ticking of the clock irritates me as I lie awake", "💢 I woke up groggy and in a foul mood", "🔋 I am well rested and full of energy", "😪 I am still so tired", "😩Why can't I ever fall asleep?", "🫂My body thanks me.", "💪I'm ready for anything."
5. **Conclusion** (conclude) — "Thanks for the insights on your sleep! We shall meet tomorrow and explore more."

### Day 9 — "Thoughts and Feelings (Continued)" (12 activities — the largest day in the program)
1. **Welcome Back!** (lesson) — "Welcome back. Before we continue exploring thoughts and feelings, please fill the sleep diary." (paraphrased length; full text begins "Welcome back.")
2. **Sleep Diary** (exercise) — diary table, no content text.
3. **Thoughts and Feelings.** (lesson) — explains the difference between a thought and a feeling using a post-office-queue example: "Imagine you are standing in a queue at the post office, and you say to yourself in your mind, 'Oh God, the line is so long! I hope my turn comes up before the employees go on a lunch break.' Or you are going to meet your friends after a long time, and you think, 'I am going to have such a good time!' that's a thought… A feeling is something that you experience as a result of a particular situation… a thought is usually a sentence, while a feeling can be expressed as a single word."
4. **Small Task!** (lesson) — "To wrap this up, we have a small task for you. There are two corresponding sentences for each situation, out of which one is a thought and the other is a feeling. You have to identify which is which. We have done the first one for you: 'Frequent power cuts in your city…' — 'They make me furious!' (FEELING); 'They make things really inconvenient and difficult for a lot of us.' (THOUGHT)"
5–9. **Five "Small Task!" comparison-matrix exercises** (only the first carries a `key`, `sleep_small_task`; the other four have no key), each a thought/feeling pair to sort:
   - "Your schooldays…" — "I had such a good time there with my friends. I miss those days!" / "It makes me nostalgic."
   - "The last cricket match you watched…" — "I was so excited and happy that our team won!" / "We won the tournament after a really long time. The spinners played really well!"
   - "A friend of yours finally bagged their dream job…" — "It is so great! They had worked so hard for this job. I am sure they will excel and thrive in the role." / "I am so happy for them!"
   - "When you are about to deliver a presentation to your class" — "I am definitely going to mess this up. I wish I had worked on my presentation instead of playing counterstrike with my friends" / "I am so scared and nervous"
   - "Tell me about the time when you went to a relatives wedding reception" — "Why is everyone teasing me about getting married? I am so not ready for this." / "This is getting really annoying now."
10. **Tracking Thoughts** (lesson) — "We've talked about the relationship between thoughts, feelings and sleep. Let's delve deeper into it. Around 3 hours before bed and 1 hour after it, note your thoughts and feelings and also how you responded to them like the examples in the table below," with a worked example row ("9:00 PM / home office setup, a late evening emergency call with the team / This is ridiculous! Why do they expect us to work till this hour! / angry, irritated / Worrying about work" and a second row for "7:00 AM / Making tea / I did not get enough sleep! / Tired, worried / Making strong tea to get fresh").
11. **Thought Tracking** (exercise) — open input table, columns Time / Situation / Thoughts / Feelings / Response, rows addable.
12. **Conclusion** (conclude) — "That's all for today. Now let's get to work by tracking our thoughts and feelings. We will meet tomorrow and find out what's stopping us from sleeping well."

### Day 10 — "Thoughts and Feelings (Continued)"
5 activities: Welcome Back! ("Before we continue exploring…"); Sleep Diary; **Digging deeper into thoughts and feelings** (lesson) — "Good job with yesterday's tracking exercise! Today we dig deeper into the same sheet. Take a look at your thoughts and feelings, and let us know if you feel they affected your sleep…"; **Identifying Disruptions** (exercise, key `sleep_identifying_disruptions`) — input table, columns Time / Situation / Thoughts / Feelings / Response / "Did it affect my sleep (Yes/No)"; **Conclusion** — "So today was short, sweet but extremely vital. When you selected a thought as yes, you were able to triangulate the things that affected your sleep. Tomorrow onwards, we will work on ways to manage those thoughts. So stay tuned!"

### Day 11 — "Emptying the mind."
5 activities: Welcome Back! ("Before we proceed, please take a few minutes and fill the sleep diary."); Sleep Diary; **Digging deeper into thoughts and feelings** (lesson, 6.2 KB, journaling-focused — includes a "thought dump" exercise: "open your journal, and note down every single thought that exists in your mind… set a timer for 5 minutes and write everything that comes to your mind. Once you are done, you need not visit your writings."); **Emptying The Mind** (exercise, key `sleep_emptying_mind`) — input table, columns Date / "What Happened"; **Conclusion** — "So! How did you like the task?… when we meet next, we will work on understanding other factors that keep us awake."

### Days 12–15 — "Distractions and control" (`Small habits.`)
Four distinct days (not duplicated), 6–7 activities each:
- **Day 12**: Welcome Back!; Sleep Diary; **Understanding Distractions** (lesson) — "Inadequate sleep can be due to two reasons- Poor sleep quality or Difficulty falling asleep. In each case, distractions… play a major role… Some distractors are in our control, and some aren't. Things not in our control- dogs barking outside, snoring of the other person in the room, temperature… Things in our control- Our mobile usage, our bedtime, our thoughts"; **Let's Check.** (checklist, key `sleep_lets_check`) — prompt "Which of these did you follow last night?" — options: Room is too hot / The pillow is too hard / The room is too bright / I overate during dinner / I had a coffee right before going to bed / The light is on / Too many thoughts in my mind / The mattress is nice and comfortable / The bedsheet is nice and soft / Dogs are barking on the street outside / Others; **Analysing Disruptions** (exercise); **Conclude.** — "Great! We have identified things that damage our sleep quality. Tomorrow, we will work on ways to reduce these distractors. Stay tuned!."
- **Day 13**: Welcome Back!; Sleep Diary; **Ideation** (lesson) — brainstorming intro with a mobile-usage example; **Some simple rules before you begin.** (reflection, key `sleep_simple_rules`) — "1. There are no right or wrong ideas 2. Do not be critical of any idea while writing 3. Write down every idea. be as visual as possible 4. Build-down on another idea 5. stay focussed on the topic 6. abide by the time limit — Are you ready to start brainstorming?"; **Ideating Solutions** (lesson) — worked example table (Doomscrolling on instagram → uninstalling Instagram each night / Keeping my phone away / Using low brightness and night mode / Going off Instagram completely); **Ideating Solutions.** (exercise) — input table, columns Disturbance / "Ways to reduce"; **Conclude.** — "Keep your creative juices running! We'll do this again to tomorrow."
- **Day 14**: Welcome Back!; Sleep Diary; **Ideating Solutions.** (exercise, carried over from Day 13); **Conclude.** — "Phew! Let's take some rest. We will work tomorrow to come up with a practical and doable solutions."
- **Day 15**: Welcome Back!; Sleep Diary; **Reducing Disruptions** (lesson, 12.8 KB — the longest single lesson in the program) — extends the Day 13 table with Pros / Cons / "Balanced Solution" columns and a worked example; **Reducing Disruptions** (exercise, same column set); **Conclude.** — "Now that you have developed skills to clear your mind and think through the options, let's move on to how bedtime rituals help with sleep."

### Days 16–18 — "Bedtime Rituals"
- **Day 16**: Welcome Back!; Sleep Diary; **Developing Rituals** (lesson) — full case for a wind-down ritual ("bedtime routine is all about winding down… breathing exercises, journaling, reading a book, or taking a bath"); **Countdown to a better sleep** (checklist) — 14 options: Drinking turmeric milk, Skincare, Reading a book, Meditation, Praying, Listening to music, Oiling your hair, Washing your feet, Dimming the lights, Putting on an incense stick, Journalling, Taking a bath, Massaging your hands and feet, Other (free text); **Learning to relax** (lesson) — recommends "No Caffeine 4 hours before sleep / No exercise 3 hours before sleep / Lights dulled or switched off 30 mins before sleep / No Mobile usage 30 minutes before bedtime"; **Learning to Relax** (exercise) — input table "Things That Relax Me"; **Conclude.** — "Great work, we shall continue this tomorrow."
- **Day 17**: Welcome Back!; Sleep Diary; **Forming Habits** (lesson) — introduces habit-formation and consistency; **Forming Habits** (lesson, second block, same title) — introduces "piggybacking" habit-stacking technique, asks the user to list daily activities from waking to bedtime; **Forming Habits** (journal-type activity, no content/exerciseConfig); **My list of activities that I already do** (lesson) — example table (Waiting for the pressure cooker's whistle → True; Taking a bath → False); **My list of activities that I already do** (exercise) — input table, columns Activity / "I can use a device during this activity(True/False)"; **Conclude.** — "Good work identifying the activities. Tomorrow we'll work on inculcating habits for better sleep."
- **Day 18**: Welcome Back!; Sleep Diary; **Shortlisting activities** (lesson) — example "Habit I want to inculcate: Reading a chapter from a book everyday before bed"; **Shortlisting activities** (exercise) — input table; **Habit Tracking** (lesson) — 7-day habit-stacking instructions ("pick one of the activities that you already do daily… immediately after clearing up the dinner table, you will have to start and finish a new habit activity… Let's meet again in seven days."); **Tracking** (exercise, `structured-list`) — **`listItems`: ["Show all activities from day 17 and 18 and get the user to tick them off. "]** (see Verification notes — this is a literal internal build instruction, not user-facing copy); **Conclusion** — "Now that we have been able to develop a sleep ritual for ourselves, let's give them a try.."

### Days 19–25 — "Tracking Patterns" (`Noticing patterns.`) — **byte-identical across all 7 days** (day 19 has slightly fuller intro text; days 20–25 are identical to each other)
4 activities per day:
1. **Welcome Back!** (lesson) — Day 19: "For today and the next 6 days, all we would like for you to do is to fill the sleep diary and keep track of the activities and habits you have shortlisted." Days 20–25: "Let's continue with the sleep diary and tracking."
2. **Sleep Diary** (exercise) — the standard 10-row diary table.
3. **Tracking** (exercise) — input table whose sole column header is the literal text **"Show all activities from day 17 and 18 and get the user to tick them off."** (repeated every day in this block — a build-spec instruction rendered as production UI copy).
4. **Conclusion** (conclude) — "That will be all for today, we shall resume tomorrow. Thank you."

### Day 26 — "Rituals in Action" (`Noticing patterns.`)
6 activities: **Welcome Back!** (lesson) — "Now we've reached the most challenging part of our module: adhering to what we've practiced and turning it into a habit. What we would like you to do is consistently track your sleep, your habits and activities and keep a log of thoughts."; **Sleep Diary**; **Tracking** (same "Show all activities…" placeholder column); **Emptying the Mind** (exercise, columns Date / "What Happened"); **Identifying Disruptions** (exercise, columns Time / Situation / Thoughts / Feelings / Response / "Did it affect my sleep (Yes/No)"); **Conclusion** — "Good Job with today! Let's continue it for the next few days…"

### Days 27–30 — "Rituals in Action (Continued)" — **byte-identical across all 4 days**
Same 6 activities as Day 26, with the opening lesson shortened to "Let's continue what we did yesterday." Day 30's Conclusion is the program's closing message: **"Well! This is the end of your programme. These simple tricks can help us sleep better and deal with our sleeplessness. Do continue with the trackers and slep diary. They are always there at your service! In case you feel that your stress is contributing to your sleeplessness, We would recommend you subscribe to our stressbuster programme."** (note the "slep diary" typo — verbatim as stored).

## Usage data (live enrollees)

### Enrollments (KV `enrollment:` records, keyed by `programId`)

**24 enrollment records** found for this equip in KV. Postgres shadow table `user_enrollments` (`data->>'programId'`) also returns **24** — no migration drift.

| userId | # enrollments | Notes |
|---|---|---|
| `d5003e00-7ddc-4f1a-8658-8dd43a20674f` | 13 | Multiple same-day, same-second re-enrollments (e.g. 3 enrollments within 2 seconds on 2026-03-17T16:23:47–49) |
| `1893b1e5-649a-43c9-ad5e-18796b08050e` | 4 | — |
| `7b0b9f70-80e3-4cb5-87ec-cd74a08971db` | 3 | — |
| `a5149dea-e6b7-4137-8af0-b31352859f90` | 2 | — |
| `88809419-ddd2-4922-85bc-6986d117a0ec` | 1 | `programTitle: "Sleep Tight (9-day)"` — a different cached title than the other 23 records ("Sleep Tight"), against the *same* `programId`. See Verification notes. |

Every one of the 24 enrollment records has `status: "active"`, `currentDay: 1`, and `completedDays: []` — including the user (`d5003e00…`) who has 30 real per-day completions in `progress:` records (below). The enrollment record's own progress fields are never updated after creation.

### Progress (KV `progress:` records, keyed by `equip_id`)

**31 progress records** found: 30 for user `d5003e00-7ddc-4f1a-8658-8dd43a20674f` (day_number 1 through 30, complete coverage of the entire program) and 1 for user `1893b1e5-649a-43c9-ad5e-18796b08050e` (day_number 1 only). Postgres shadow table `user_program_progress` also returns **31** — no migration drift.

All `day_number` values fall inside the program's real 1–30 completion range (Day 0 onboarding isn't tracked here) — no orphaned/out-of-range day numbers found.

The 30-day run for `d5003e00…` was completed in **under 14 minutes** (`2026-04-23T13:22:52Z` → `13:36:04Z`), with block responses like `"vrv"`, `"evev"`, `"dfb"`, `"."` — this is unambiguously synthetic/QA test-account traffic, not a genuine 31-day program completion. It should not be read as evidence of real user engagement with the program.

## Verification notes

1. 🔴 **A build-spec instruction is stored — and rendered — as live user-facing copy.** The `Tracking` exercise's `exerciseConfig.columns` (and, on Day 18, `listItems`) literally contains the text **"Show all activities from day 17 and 18 and get the user to tick them off."** — clearly a note from whoever built the block, addressed to a developer/CMS, never replaced with real copy. It appears across Day 18 and every day in the Days 19–30 block (12 program-days), and a real completion record (`progress:…:21`) shows a user's actual answer keyed under that exact string, confirming it renders to end users rather than sitting inert in unused config.

2. 🟡 **Large chunks of the program are duplicated filler, not new content.** Three separate stretches are byte-for-byte identical across multiple days: Days 2–7 (6 days, "Understanding Your Sleep (Continued)"), Days 20–25 (6 days, "Tracking Patterns"), and Days 27–30 (4 days, "Rituals in Action (Continued)"). That's 16 of the program's 31 days carrying no unique instructional content beyond "fill the sleep diary" — worth knowing before treating "31 days of content" as 31 days of distinct material.

3. 🟡 **`onboarding_questions` (top-level array) is a stale duplicate of Day 0's real activities, and is missing data the live version has.** Three of its five questions ("Welcome to Sleep Tight", "Sleep Duration", "Feeling") show `options: []` despite being `required: true` with `allow_skip: false` — if anything actually renders straight from this array, users would hit a required single-select question with zero selectable options. The Day 0 activities in `daily_content` carry the real, fully-populated versions of the same five questions (full option lists, scale ranges, prompts). If both are read anywhere in the codebase, they will disagree.

4. 🟡 **The `onboarding` object (singular) is an unedited generic template**, not specific to sleep at all ("How would you describe your current experience with this topic?", "What do you hope to achieve with this program?"). It coexists with the real sleep-specific `onboarding_questions` array and Day 0 activities — unclear whether it's dead weight or actually surfaces somewhere in the product before the real onboarding.

5. 🟡 **Landing-page "eligibility" copy is a duplicate of the feature-tile copy, not real eligibility criteria.** `metadata.eligibility_intro` and `eligibility_point_1`–`3` are word-for-word identical to the four lines of `metadata.tile2_content` ("Daily micro-lessons…", "Evidence-based CBT techniques…", etc.) — copy-pasted rather than authored. `eligibility_point_4` ("No pills") looks like a fragment of a sentence that was never finished (e.g. "No pills required").

6. 🟢 The landing-page `subtitle` — "Transform your life with daily practice." — is generic boilerplate with no mention of sleep; likely an un-customized template default that shipped to production (`published: true`).

7. 🟢 **Cosmetic typo, `"Sleep DIary"`** (capital I) in the activity title for Days 12–17 (6 days, spanning the "Distractions and control" and first two "Bedtime Rituals" days). Every other day in the program spells it correctly ("Sleep Diary").

8. 🟢 **Closing message typo**: Day 30's final Conclusion reads "Do continue with the trackers and **slep** diary" (verbatim, missing an "e").

9. 🟢 `checkInConfig.enabled` is `false` even though `triggerDays: [7, 14, 30]` and `triggerOnLastDay: true` are fully configured — the milestone check-in feature for this program is wired up but switched off. If the product team believes check-ins are firing at day 7/14/30, they currently are not.

10. 🟢 One enrollment record (`88809419-ddd2-4922-85bc-6986d117a0ec`) carries `programTitle: "Sleep Tight (9-day)"` against the same `programId` as the 23 other records titled plainly "Sleep Tight" — a cached title from what looks like an earlier, shorter version of this program that was never updated after the program was extended to 31 days. `programTitle` is a point-in-time snapshot on the enrollment record, not a live join, so this is expected drift rather than a bug — but it does mean historical enrollment titles can't be trusted as a description of the program's current length.

11. 🟢 Enrollment records (`enrollment:` prefix) never reflect actual progress — every one of the 24 records has `currentDay: 1` and `completedDays: []` regardless of how much of the program the user actually completed (one user has all 30 days recorded as complete in `progress:` records while their enrollment record still shows day 1, zero completed days). Anything reading enrollment records alone for completion state will be wrong; the `progress:` records are the actual source of truth for day-level completion.

12. 🟢 No migration drift found: both `enrollment:`→`user_enrollments` (24 = 24) and `progress:`→`user_program_progress` (31 = 31) shadow-table counts match their KV source exactly for this equip.

13. 🟢 The apparent full 30-day completion by user `d5003e00-7ddc-4f1a-8658-8dd43a20674f` is synthetic test data (all 30 days completed in under 14 minutes, single-character/gibberish responses) — do not cite it as evidence of genuine user engagement with this program.
