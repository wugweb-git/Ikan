# Unburn — "Burnout Reset"

Pulled live from `equip:416feb50-e73f-4898-a996-f8a4695a708e` on 2026-08-06. **Note:**
`EquipService.getEquip()`'s missing-slug-fallback bug (fixed 2026-08-06, see `docs/PENDING.md`) meant
any equip could in principle have progress silently miskeyed under its slug instead of its real id
when started via a `/equip/<slug>` URL — confirmed hitting Sleep Tight twice; no evidence found of
it affecting this program specifically, but the fix now covers all equips going forward.

## Meta

| Field | Value |
|---|---|
| id | `416feb50-e73f-4898-a996-f8a4695a708e` |
| slug | `burnout-reset` |
| title | Unburn |
| subtitle | Transform your life with daily practice. |
| category | `burnout` |
| difficulty | `intermediate` |
| duration_days (stored) | **35** |
| duration_weeks (stored) | **4** |
| tags | `burnout`, `stress`, `work`, `resilience` |
| is_paid | `false` |
| price / currency | 499 / INR (unused while `is_paid=false`) |
| published | `true` |
| featured | `false` |
| can_repeat | `true` |
| created_at | 2026-01-04T10:33:46.662Z |
| updated_at | 2026-07-21T13:57:43.560Z |
| image_url / cover_image | `https://images.unsplash.com/photo-1758876022104-368b0f3fb6c9?w=800` |
| thumbnail | Supabase Storage signed URL (`make-cc205da9-images/assessments/1767525779578-fxn595n.webp`), expires 1799061779 (epoch) |
| content field in use | `daily_content` (array, 30 entries). `days` = empty array. `week_structure` = empty array. |

## Description

> A comprehensive 30-day program to understand, manage, and recover from burnout.

Note: the description says **30-day**, the stored `duration_days` says **35**, `duration_weeks` says **4** (=28 days), and the actual authored content (below) runs from Day 0 (onboarding) through Day 30 with **Day 28 missing entirely**. Four different numbers for "how long is this program" appear across one record — see Verification notes.

## Landing-page tile content (`metadata`)

| Field | Content |
|---|---|
| `tile1_content` | Don't let burnout drain your spark. With our Bite-sized daily steps reclaim your energy and peace of mind in 35 days. |
| `tile2_content` | Daily micro-lessons (5-10 minutes)<br>Evidence-based CBT techniques<br>Progress tracking & insights<br>Practical and useful tips |
| `tile3_content` | Complete your daily lessons at your own pace<br>Track your patterns and progress<br>Practice new techniques each day<br>Review your insights and adjust your plan |
| `tile4_content` | Restored Mental & Physical Energy. Overcome chronic exhaustion and feel genuinely recharged<br>Clear Mental Boundaries. Protect your mental bandwidth and stop taking stress home<br>Sustainable Work Habits. Create a pace of life you can maintain without burning out<br>Renewed Passion & Focus. Feel engaged, present, and motivated in your day-to-day |
| `eligibility_intro` | Daily micro-lessons (5-10 minutes) |
| `eligibility_point_1` | Evidence-based CBT techniques |
| `eligibility_point_2` | Progress tracking & insights |
| `eligibility_point_3` | Real world ways to challenge burnout   *(trailing double space, as stored)* |
| `eligibility_point_4` | No pills |

`tile1_content` repeats the "35 days" figure from `duration_days`, consistent with each other but inconsistent with the "30-day program" description and the real 30-entry content array.

## Onboarding — two competing definitions

This equip carries **two separate onboarding definitions that disagree with each other**, and only one of them is actually shown to users.

### A. `onboarding` field — the one the app actually renders

`EquipProgramOnboarding.tsx` reads `program.onboarding.questions` exclusively (confirmed in `src/product/app/programs/EquipProgramOnboarding.tsx`, e.g. `const onboarding = program?.onboarding;` / `questions: onboarding.questions`). This is what a real user seeking to enroll in "Unburn" is shown, stored verbatim:

- **title**: "Program Setup"
- **description**: "Please answer a few questions to personalize your experience."
- **is_required_before_start**: `true`
- **version**: `1.0.0`

| # | id | Text | Type | Required | Options |
|---|---|---|---|---|---|
| 1 | `q-experience` | "How would you describe your current experience with this topic?" | single-choice | true | New to this / Some experience / Experienced |
| 2 | `q-goals` | "What do you hope to achieve with this program?" | long_text | false | — |
| 3 | `q-commitment` | "How committed are you to completing this program?" | scale (1–10) | true | min label "Not very committed", max label "Very committed" |

This copy is **generic template language** — "this topic," "this program" — with no reference to burnout, work, or Unburn anywhere. It reads as never-customized default onboarding copy.

### B. `onboarding_questions` field — burnout-specific copy, but not shown to users

The top-level `onboarding_questions` array holds real, burnout-specific authored questions, verbatim:

| # | id | Question | Type | Options | Notes |
|---|---|---|---|---|---|
| 1 | `a4299fad-7e64-4aca-b01d-0e3d88637f13` | "Welcome" — helper text: "Before we begin, we'd like to know a little about you. This helps us tailor the program better." | single_select | **none** (`options: []`) | `required: true`, `allow_skip: false` |
| 2 | `04b02b86-9793-47ae-9a3f-be93e09e41e2` | "Occupation" | single_select | Employed / Self-employed / Student / Homemaker / Between jobs / Retired | required |
| 3 | `aaaa7945-e087-445c-861f-02f6c8e92f34` | "Therapy History" | single_select | Yes / No / I'd prefer not to answer | required |
| 4 | `a1aeed6a-1364-428b-b0c3-baf6f457088e` | "Conditions" | single_select | Yes / No / I'd prefer not to answer | required |
| 5 | `fb631f22-c9d7-449a-a877-14a7af7b1b1e` | "Conditions Detail" | single_select | **none** (`options: []`) | `required: true`, `allow_skip: false` |

Per `EquipProgramWizard.tsx` (admin authoring UI), this field is explicitly **legacy** — comments there ("Fallback: create Day 0 from legacy onboarding_questions", "Keep onboarding_questions in payload for legacy safety") show it is only used to backfill a "Day 0" content block set in the admin wizard, not rendered directly to end users. It is, in fact, exactly reproduced as Day 0 of `daily_content` (see below), where the actual runtime rendering happens through the exercise engine rather than the onboarding screen.

Two of these five questions (`Welcome`, `Conditions Detail`) are typed `single_select`, `required: true`, `allow_skip: false`, but ship with an **empty options array** — if this path were ever rendered as a real select control, it would be impossible to satisfy without a code-level fallback.

## Day-by-day content (`daily_content`, authoritative — 30 entries)

`daily_content` has 30 entries. Its `day` numbers run **0, 1, 2, … 27, 29, 30** — **day 28 does not exist in the array**, a straight gap, not an off-by-one artifact (day 27 is "Just Do It!" and day 29 is titled "Just Do It! (Continued)", i.e., the program's own internal numbering skipped from 27 to 29). This means the real content spans Day 0 (onboarding) + 29 practice days, topping out at "Day 30" — not 35, and not a clean 4×7=28.

Below, each day's title/description and every block's type, title, and full instructional/reflection copy are reproduced verbatim (HTML formatting stripped for readability; wording unchanged). No block contains embedded media/base64 — all `image_url` references are external Unsplash/Supabase URLs, and `exerciseConfig` (question prompts, options, table columns) is included wherever a block's `content` was empty and the actual user-facing prompt text lived in `exerciseConfig` instead.

---

### Day 0 — "Onboarding" (`dayType: learning`, description: "Setup Phase.")

*(This is the legacy `onboarding_questions` content, restated as Day-0 activities — see note above.)*

1. **lesson — "Welcome"**: "Before we begin, we'd like to know a little about you. This helps us tailor the program better."
2. **quiz — "Occupation"**: prompt "What do you do for a living?" — options: Employed, Self-employed, Student, Homemaker, Between jobs, Retired (single-select, card UI)
3. **quiz — "Therapy History"**: prompt "Have you ever taken therapy before?" — options: Yes, No, I'd prefer not to answer (single-select)
4. **quiz — "Conditions"**: prompt "Do you have any pre-existing conditions?" — options: Yes, No, I'd prefer not to answer (single-select)
5. **reflection — "Conditions Detail"**: prompt "If yes, what?" — conditional on `pre_existing_conditions == Yes` (no options; free text)

### Day 1 — "Burnout Snapshot" (description: "Understanding My Workplace.")

1. **lesson — "Welcome"**: "Welcome to Unburn! It's great to see you here. I am S. Let me share my story with you. A few years ago, I experienced a major burnout. It was an unpleasant ordeal, and I truly suffered because of it. The worst part, I didn't even know what it was! Hence, this module. Here, we will help you understand burnout, its causes, and develop tools to manage it. Don't worry—I've got your back!"
2. **checklist — "Indicators"**: prompt "Which of these feel true for you?" (multi-select, card UI) — options: It is stressful; It is hectic; I like it; I don't enjoy it as much as I was before; I have drifted away from my colleagues; I am exhausted all the time; I have supportive colleagues; I've experienced communication challenges with my manager; My work is dull; My work is overwhelming; I have been so productive over the past few days; I am so looking forward to be at work today; My performance at work has been sub-par; There is so much to do but nothing is ever done!; I feel energized every morning; I want to continue at my current position; I can't work here anymore; I am lazy; I wish I could just sleep the whole day; I am lucky to have the manager that i have; I desperately need a vacation; I got appreciated today for the work i have been putting in!
3. **conclude — "Conclusion"**: "Good job, I think this will give an idea to you about how your workplace seems like to you. But don't worry! While not everything is your hand, you can still develop resilience against burnout, and we have your back. See you tomorrow!"

### Day 2 — "Thoughts vs Feelings" (description: "Identification.")

1. **lesson — "Thoughts and Feelings"**: "In the coming exercise, we will be talking about thoughts and feelings. Before we proceed, let's quickly understand what they are, how they are related, and what the difference between them is. A thought is basically an internal dialogue that you have with yourself. Imagine you are standing in a queue at the post office, and you say to yourself in your mind, 'Oh God, the line is so long! I hope my turn comes up before the employees go on a lunch break.' Or you are going to meet your friends after a long time, and you think, 'I am going to have such a good time!' Similarly, when you are about to enter the exam hall, the thought that enters your mind might be, 'What if I forget everything and am unable to write my answers properly?' This internal dialogue arises as a response to a particular situation. Now, what about your feelings? A feeling is something that you experience as a result of a particular situation or the thought that has entered your mind in response to that situation. For example:: You might feel bored or anxious while waiting in the post office queue. You feel happy and excited when you are about to meet your friend."
2. **lesson — "Small Task"**: "To wrap this up, we have a small task for you. There are two corresponding sentences for each situation, out of which one is a thought and the other is a feeling. You have to identify which is which. We have done the first one for you. Frequent power cuts in your city… — 'They make me furious!' FEELING / 'They make things really inconvenient and difficult for a lot of us.' THOUGHT." Attached quiz prompt: "It makes me furious!" → Thought / Feeling (single-select).
3. **exercise**: prompt "This is inconvenient and difficult." → Thought / Feeling (single-select)
4. **exercise — comparison-matrix**: "The last cricket match you watched…" rows: "I was so excited and happy that our team won!" / "We won the tournament after a really long time. The spinners played really well!" — columns: Thought, Feeling
5. **exercise — comparison-matrix**: "A friend of yours finally bagged their dream job…" rows: "It is so great! They had worked so hard for this job. I am sure they will excel and thrive in the role." / "I am so happy for them!"
6. **exercise — comparison-matrix**: "When you are about to deliver a presentation to your class" rows: "I am definitely going to mess this up. I wish I had worked on my presentation instead of playing counterstrike with my friends" / "I am so scared and nervous"
7. **exercise — comparison-matrix**: "Tell me about the time when you went to a relatives wedding reception" rows: "Why is everyone teasing me about getting married? I am so not ready for this." / "This is getting really annoying now."
8. **conclude — "Conclusion"**: "Now that we have an idea about thoughts and feelings, let's continue tomorrow with some techniques to help us develop immunity towards burnout!"

### Day 3 — "Tracking Thoughts And Feelings." (description: same as title)

1. **reflection — "Welcome Back!"**: "When your mind is clouded by burnout, it's easy to get lost in a cycle of overwhelming. Tracking and logging your thoughts is the first step in transitioning from being overwhelmed by them to actively managing them. So let's take some time and track some thoughts and feelings that we get throughout a day. To guide you, here are some examples." — followed by a worked example table (Date and Time / Event / Thoughts / Feelings): "5th July, 9:00:00 AM — Traffic jam during commute — 'This is so frustrating.' — Irritated" and "5th July, 5:30 PM — Work deadline approaching — 'I won't finish on time.' — Anxious." Exercise config key `tf_log`, prompt "Track thoughts and feelings today," columns Date & Time / Event / Thoughts / Feelings.
2. **exercise — "Thought Log"**: empty content; input-table, columns Date and Time / Event / Thoughts / Feelings, rows addable.
3. **conclude — "Conclusion"**: "Good Job! Now we know to a fair extent how thoughts and feelings play out in our daily life. Made some observations? Hold on to those. We shall discuss them in the coming days!"

### Day 4 — "Thought Log" (description: "Observing Patterns.")

1. **lesson — "The Impact of Burnout"**: contains an empty `<h3>` heading artifact, then: "Burnout drains your passion and turns workplace friendships into resentment. When you become cynical about the things you once loved, it's time to step back and observe. Track your mental state before, during, and after work. Focus on three areas: **Thoughts:** Your internal dialogue (e.g., "This meeting is never-ending"). **Feelings:** Your actual emotions (e.g., Boredom, irritation). **Triggers:** Specific events that cause these reactions. Observe how these internal states manifest in your behavior and log it in order to to identify patterns and regain clarity." *(note: "in order to to identify" — doubled "to" typo, as stored)* — followed by a worked example table (Date and Time / Event / Thoughts / Feelings / Response): "5th July, 4:00:00 PM — Work deadline approaching — 'I won't finish on time.' — Anxious — Stayed up late working." and "6th July, 8:30 AM — Traffic jam during commute — 'This is so frustrating.' — Irritated — Listened to calming music."
2. **exercise — "Thought Log"**: empty content; input-table, columns Date and Time / Event / Thoughts / Feelings / Response.
3. **conclude — "Conclusion"**: "Good work. For the next 3 days, we shall only be working on logging our thoughts. See you tomorrow."

### Day 5 — "Thought Log (Continued)" (description: "Observing Patterns.")

1. **lesson — "Welcome Back!"**: contains an empty `<h3>` heading artifact, then: "Let's continue logging our thoughts."
2. **exercise — "Thought Log"**: empty content; same input-table as Day 4.
3. **conclude — "Conclusion"**: "Great! We'll resume tomorrow."

### Day 6 — "Thought Log (Continued)" (description: "Observing Patterns.")

Identical structure/content to Day 5: "Let's continue logging our thoughts." → Thought Log input-table → "Great! We'll resume tomorrow."

### Day 7 — "Thought Log (Continued)" (description: "Observing Patterns.")

1. **lesson — "Welcome Back!"**: "Let's continue logging our thoughts." (same empty `<h3>` artifact)
2. **exercise — "Thought Log"**: same input-table.
3. **conclude — "Conclusion"**: "Now that we have some insights about our real attitude towards works and our real stressors, we'll explore some activities that will help us improve our relationship with our workplace."

### Day 8 — "Observation – Day 2" (description: "Repeat Observation.")

1. **lesson — "Welcome Back!"**: "A few years ago, I hit a wall. I was pursuing my interests but overcommitted by juggling research, management, content, and admin along with roles that didn't even matter to me. I worked harder to force results, but my returns stayed stagnant. Eventually, I realized the effort wasn't worth the cost. I was lucky enough to switch fields, but many aren't. Whether you're a student, professional, or caregiver, you must optimize your effort. Ensure the returns actually match what you're putting in. If the output plateaus, working "harder" isn't the answer, alignment is." (exercise config attached here is a leftover matrix key `tf_behavior_log_d5` — see Verification notes)
2. **lesson — "Efforts And Rewards"**: "Generally speaking, burnout stems from an imbalance between the efforts we put in on a day-to-day basis and the rewards we receive. It's a case of effort-versus-rewards imbalance. This disparity is exacerbated by unyielding stress. Our efforts can encompass a wide range of tasks from caring for an ailing family member to tackling a challenging and intensive course as a student to working in a demanding professional environment with low tangible rewards. Speaking of rewards, these are the outcomes we receive for our efforts. For instance, a family member recovering well, achieving good grades in a course, or receiving due credit and recognition at work."
3. **lesson — "Understanding The Balance"**: "Your task for today is rather basic. Below is a table of efforts and rewards as a working professional. What I would like you to do, is to tell me if you feel they are in balance or not." — worked example table (Effort / Return): Preparing for a presentation → Successful delivery of the presentation; Working on a report → Timely recognition by the manager; Attending an event → Networking and making contacts; Volunteering to help a colleague in some admin tasks → *(blank)*; Member of the POSH Committee → *(blank)*; Participating in company events → *(blank)*.
4. **exercise — "Understanding The Balance"**: prompt "Are the efforts and returns in balance?" — Yes / No (single-select)
5. **conclude — "Conclusion"**: "Now over the next few days, we will explore our efforts and rewards more and put them in context of our experiences."

### Day 9 — "Efforts And Rewards " (description: "Pause and Breathe.", title has a trailing space as stored)

1. **lesson — "Welcome Back!"**: "Before we delve deeper in efforts and rewards, we'd like to know in general how were your thoughts over the past few days?"
2. **exercise — "Thoughts"**: prompt "How your overall thoughts and feelings were over the past two days?" — Positive / Negative / Neutral (single-select)
3. **lesson — "The Why"**: "Your task is simple: in the table provided below, note down all the efforts you're putting in, be it personal, academic, career-related, or anything else. Next, record the rewards you receive for each specific effort. Then, describe the general outcome of the effort, not necessarily tied to successful completion. Lastly, explain the 'why.' Why you chose a particular task in the first place and what drove you to undertake that specific effort."
4. **exercise — "The Why"**: empty content; input-table, columns Effort / Reward Expected / General Outcome / The 'why'.
5. **conclude — "Conclusion"**: "For the next two days, this is all we'd like you to do."

### Day 10 — "Efforts And Rewards  (Continued)" (description: "Pause and Breathe.", double space in title as stored)

1. **lesson — "Welcome Back!"**: "Let's pick up from where we left yeterday." *(typo: "yeterday")*
2. **exercise — "The Why"**: same input-table as Day 9.
3. **conclude — "Conclusion"**: "We'll continue this tomorrow."

### Day 11 — "Efforts And Rewards  (Continued)" (description: "Pause and Breathe.")

1. **lesson — "Welcome Back!"**: "Let's pick up from where we left yeterday." *(same typo repeated)*
2. **exercise — "The Why"**: same input-table.
3. **conclude — "Conclusion"**: "Well done, tomorrow we shall work on the next steps."

### Day 12 — "Anatomy of Burnout" (description: "Demands vs Resources.")

1. **lesson — "Anatomy"**: "Welcome back! Continuing from our last exercise about efforts and outcomes, I'd like you to revisit something you've probably done before but may have lost sight of. Your task is to write down your personal goals, both long-term and short-term. When we experience burnout, we often lose focus on our long-term goals and the values that define us."
2. **lesson — "Anatomy Continued"**: "Once you've documented your goals, take a moment to describe what realistic success looks like for each one. For instance, if your goal is to become a successful surgeon, your realistic description of success might involve gaining admission to a top medicine program in the country and securing a well-paid job after completing your MD and specialty training. On the other hand, if your goal is to help your mother successfully recover from an illness, your realistic definition of success would be to see her in good health once again. Make sure you are noting only your absolute necessicities and only the tasks that align with your personal and professional goals, both long and short term" *(typo: "necessicities")*
3. **exercise — "Goals And Success "**: key `demands_resources`, prompt "List your current demands and resources." — input-table, columns "My Goals and My Absolute Requirements" / "My Measures of Success"
4. **conclude — "Conclusion"**: "We shall continue this tomorrow."

### Day 13 — "Anatomy of Burnout (Copy)" (description: "Demands vs Resources.")

The `(Copy)` suffix on the title looks like an unedited leftover from duplicating Day 12 in the admin authoring tool.

1. **lesson — "Welcome Back!"**: "Let's continue yesterday's work."
2. **exercise — "Goals And Success "**: same input-table as Day 12.
3. **conclude — "Conclusion"**: "That's All. See you tomorrow."

### Day 14 — "Goals And Necessities" (description: empty string)

1. **lesson — "Goal Necessity Alignment"**: "Success isn't about doing everything; it's about doing the right things. Stripping away the non-essentials now prevents burnout later and keeps your momentum high. That's why it is very important your goals aligns with how you measure success. Now, keeping that in mind, let's revisit the table you filled out a couple of days ago. Take a good look at the given table and select only those tasks that align with your goals and absolute necessities." (exercise config attached to this block: key `er_balance`, prompt "Are your efforts and rewards in balance?" Yes/No — a prompt that doesn't match the lesson text above it; see Verification notes)
2. **exercise — "Goal Necessity Alignment"**: key `er_reflection`, prompt "Why do you feel this way?" — input-table, columns Effort / Reward Expected / General Outcome / The "why" / "Aligns with my goals and necessities(Yes/No)"
3. **conclude — "Conclusion"**: "So today's task was simple, yet vital. It will help us when we start working on reducing unnecessary workload tomorrow."

### Day 15 — "Reducing Workload" (description: "Structured Table.")

1. **lesson — "Managing Workplad"** *(typo in block title, corrected in the very next block)*: "When recovering from burnout, it's common to overcompensate by increasing your workload or clinging to unrewarding tasks. To break this cycle, you must realistically reevaluate your responsibilities by recognizing your human limits, leaning on your team for support, and prioritizing truly urgent tasks. Focusing only on what is essential protects your energy and ensures your efforts actually move the needle." (exercise config: key `effort_map`, matrix columns Effort / Expected Reward / Outcome / Why I Do This — no matching prompt text visible in the lesson)
2. **lesson — "Managing Workload"**: "Let's illustrate this with an example. Imagine you have a list of tasks: 1). Analyze a dataset for a meeting scheduled the same day. 2). Write a report due in a few weeks. 3). Attend a specific meeting. 4). Conduct data collection. 5). Create a presentation. To manage these tasks effectively: 1). Start with what's due earliest (in this case, the data analysis). 2). Delegate tasks that don't require your direct intervention (have a co-worker handle data collection). 3). Postpone non-urgent tasks (schedule report writing for later). 4). If a task is large, break it down into smaller parts and either tackle it yourself or seek assistance (ask someone to help you design and grammar-check the presentation)."
3. **checklist — "Reducing Workload"**: multi-select — options: I can delegate some tasks; I can organise my schedule to prioritise the urgent tasks; I can outright refuse the tasks allotted to me a while back; I can take a sick-leave; I dont need anyone, I can do it all on my own; I can cut out the absolute non-essential tasks
4. **conclude — "Conclusion"**: "Great! We will work more on this tomorrow onwards."

### Day 16 — "Reducing Weight." (description: "Outcome Check.")

*(The program calls this phase "Reducing Weight" — i.e., workload weight — not a body-weight reference; flagged only because the phrase reads ambiguously out of context.)*

1. **lesson — "Welcome Back!"**: "Many times, we take on tasks that aren't necessarily required of us. We do this, perhaps, because we believe they'll benefit us in some way, even though subconsciously we know they won't. For instance, we might handle work tasks that fall outside our official job responsibilities (KRAs) or volunteer for college activities that don't truly benefit us and only add unnecessary stress. Additionally, we sometimes take on tasks because we trust ourselves to complete them successfully, but in doing so, we're unfair to both ourselves and our colleagues."
2. **lesson — "Reducing Weight"**: "For the next activity, I'd like you to eliminate all tasks that aren't necessary for you—those that don't align with your goals or absolute necessities. Today and tomorrow, focus on how you can get rid of these tasks. Consider keywords like postponement, pulling out, and delegating. When we meet the day after tomorrow, ensure you've shed at least some of the deadweight tasks." (exercise config: key `ideal_realistic`, matrix columns Goal / Ideal Outcome / Realistic Outcome)
3. **exercise — "Reducing Weight"**: input-table, columns "Effort(only essential ones)" / Reward Expected / General Outcome / The "why" / "Aligns with my goals and necessities(Yes/No)" / "How I will get rid of them"
4. **conclude — "Conclusion"**: "Great, we'll meet again tomorrow."

### Day 17 — "Reducing Weight. (Continued)" (description: "Outcome Check.")

1. **lesson — "Welcome Back!"**: "Let's continue where we left."
2. **exercise — "Reducing Weight"**: input-table, columns "Effort(only essential ones)" / Reward Expected / General Outcome / the "why" / "How I will get rid of them" *(one column fewer than Day 16's version — the goals/necessities alignment column is dropped)*
3. **conclude — "Conclusion"**: "We tackled an important component of our journey here- shedding unnecessary workload. We will look at other techniques that will help us deal with our burnout better. So stay tuned!"

### Day 18 — "Journalling" (description: "Effort & Reward.")

1. **lesson — "Welcome Back!"**: "For today and the next two days, we want you to do nothing but maintain a worry log. It may sound daunting but it is very easy. Think of this as a safe space and just jot down all your worries. Nothing will be recorded here and the whatever you write will be deleted within a day." *(See Verification notes — this is a factual claim about data retention made directly to the user.)*
2. **exercise — "Emptying the mind."**: key `er_control`, input-table, single column "What's worrying you? "
3. **conclude — "Conclusion"**: "Hope you were able to fill in the boxes with some content. Let's keep doing this for a couple of days."

### Day 19 — "Journalling (Continued)" (description: "Effort & Reward.")

1. **lesson — "Welcome Back!"**: "Let's continue."
2. **exercise — "Emptying the mind."**: same worry-log input-table.
3. **conclude — "Conclusion"**: "We'll continue this tomorrow."

### Day 20 — "Journalling (ontinued)" (description: "Effort & Reward.", **typo in the day title itself — missing "C"**)

1. **lesson — "Welcome Back!"**: "Let's continue."
2. **exercise — "Emptying the mind."**: same worry-log input-table.
3. **conclude — "Conclusion"**: "Now that we have figured out this technique, when we meet next, we will work on understanding other factors that keep us awake." *(This line implies the worry-log exercise is about sleep/insomnia, which was never stated in Days 18–20's actual copy — reads as copied from a different, sleep-focused program. See Verification notes.)*

### Day 21 — "Positive Capturing" (description: "Necessities.")

1. **lesson — "Positive Capturing"**: "When we are stressed, we lose the vision of things that are going well in our lives, our small wins and something good that happened to us. Let's recall them and widen our perspective which stress has narrowed. Luckily, it isn't very difficult doing that. Today and over the next two days, we will be focusing doing just that with these simple exercises."
2. **exercise — "Good Things."**: prompt "List down 3 good things which happened to you today." — input-table, column "Good Things That Happened Today."
3. **exercise — "There's Always Room"**: prompt "3 things that could have been better." — input-table, column "3 things that could have been better."
4. **exercise — "For tomorrow"**: prompt "Things that I will achieve tomorrow" — input-table, column "Things that I will achieve tomorrow"
5. **exercise — "Practicing Thankfulness"**: prompt "In the table provided below, write down at least three things you're grateful for" — input-table, column "I am Thankful about"
6. **conclude — "Conclusion"**: "We'll continue this tomorrow."

### Day 22 — "Positive Capturing (Continued)" (description: "Necessities.")

Same four exercises repeated verbatim (Good Things / There's Always Room / For tomorrow / Practicing Thankfulness), preceded by lesson "Welcome Back!": "Let's continue yesterday's tasks" and closed with conclude: "We'll begin the next chapter tomorrow."

### Day 23 — "Perfectionism" (description: empty string)

1. **lesson — "Perfectionism."**: "Perfectionism is the need to be perfect or appear perfect. While perfectionism has both positive and negative aspects, it can lead to academic success, effective management, and excellence in the workplace. However, there are harmful consequences associated with excessive fixation on perfection. It can result in low self-esteem, procrastination, depression, and an overwhelming sense of pressure."
2. **lesson — "Perfectionsim"** *(typo in block title)*: "Perfectionism is highly stressful, and living in a perpetual cycle of stress without relief can lead to burnout. While it's acceptable to set high expectations for yourself, it's essential to avoid falling into low productivity or excessive self-criticism. Knowing when to strive for perfection and when to let go is crucial. If we set standards that are impossible to meet in a real-world context. For instance, aiming for the perfect assignment in its initial draft becomes challenging to get it. This situation may lead to burnout. Alternatively, merely planning for that flawless draft without taking action can keep us stuck in the planning and preparation stage." *(Note: "If we set standards that are impossible to meet in a real-world context." is a sentence fragment as stored — no main clause follows it before the next sentence starts.)*
3. **checklist — "Perfectionism In Daily Life."**: multi-select — options: It is good to be a perfectionist some of the time; Being self-critical is a part and parcel of a healthy working style; Sometimes it is good to just start and learn in the process; Perfectionism always leads to procrastrination *(typo: "procrastrination")*; Only perfectionists are hard workers
4. **conclude — "Conclusion"**: "Great job! Let's explore more tomorrow!"

### Day 24 — "Understanding Perfectionism" (description: "Goal Alignment.")

1. **reflection — "Understanding Perfectionism"**: "Let's explore perfectionism. Perfectionism often leads to stress and procrastination, directly contributing to workplace burnout. It impacts our decision-making and productivity, narrowing our perspective. Nothing ever seems good enough. We become fixated on getting things right from the start, without realizing that perfection is a result of a learning curve, one that involves creating many iterations and incorporating feedback. In this module, we'll focus on managing perfectionism. For this exercise, I'll present you with some scenarios, and you'll need to describe what the perfect outcome would look like." — worked example table (Situation / Perfect Outcome): "I have to write a document for the marketing team" → "The document is grammatically excellent, extremely clear and the marketing team has no queries about it."
2. **exercise — "Situations And Outcomes"**: input-table, columns Situation / Perfect Outcome; pre-seeded situation rows: "I have to write a document for the marketing team"; "The document is grammatically excellent, extremely clear and the marketing team has no queries about it."; "I have to make a presentation for the half yearly meeting"; "I have to produce content for social media"; "I have to work on a customer acquisition plan"; "I am in charge of producing marketing strategy for this product" *(note: the first two "rows" duplicate the situation/outcome pair already shown as the worked example above, rather than being distinct new rows — see Verification notes)*
3. **conclude — "Conclusion"**: "Now that we have an idea of what we desire, tomorrow, let's see what we actually get."

### Day 25 — "Bringing In Realism" (description: "Closure.")

1. **lesson — "Bringing In Realism"**: "Now that we have understood what perfectionism looks like, Let us approach the outcome more realistically. Things will NEVER go like how we picture them. In the table from last time, try putting in a realistic outcome which is in contrast to the perfect outcome. For example if the perfect outcome is that a document for the marketing team is perfectly understandable for the marketing team, then the realistic scenario will be that they have some questions about it and there will be some typos." — worked example table (Situation / Perfect Outcome / Realistic Outcome): "I have to write a document for the marketing team" → "The document is grammatically excellent, extremely clear and the marketing team has no queries about it." → "The document had some grammatical errors. The marketing team had a few questions about the document."
2. **exercise — "Bringing In Realism"**: key `burnout_recalibration`, input-table, columns Situation / Perfect Outcome / Realistic Outcome; pre-seeded rows: "I have to make a presentation for the half yearly meeting"; "I have to produce content for social media"; "I have to work on a customer acquisition plan"; "I am in charge of producing marketing strategy for this product"
3. **conclude — "Conclusion"**: "Good job! Now that we have some realistic outcomes in mind, let's see tomorrow how we negotiate with our inner perfectionist."

### Day 26 — "Challenging Perfectionism" (description: empty string)

1. **lesson — "Challenging Perfectionism"**: "Here, let us discuss what will be a realistic outcome of the task and how we can realistically achieve it. But at least we start and not just plan about getting the perfect outcome. To do that, we focus on getting things imperfect (or realistic) in the first go and then improving on it as we proceed. Remember the tagline of Nike? Just Do It!" — worked example table (Situation / Perfect Outcome / Realistic Outcome / Realistic Goal I will like to set / Steps I can take towards achieving that goal): "I have to write a document for the marketing team" → "The document is grammatically excellent, extremely clear and the marketing team has no queries about it." → "The document had some grammatical errors. The marketing team had a few questions about these." → "The document's first iteration gets some feedback which is worked upon swiftly" → "Create the first draft, double check it, Send it for feedback. Work on the feedback and get approval"
2. **exercise — "Challenging Perfectionism"**: input-table, columns Situation / Perfect Outcome / Realistic Outcome / Realistic Goal I will like to set / Steps I can take towards achieving that goal; pre-seeded situations: the marketing-document one plus "I have to make a presentation for the half yearly meeting"; "I have to produce content for social media"; "I have to work on a customer acquisition plan"; "I am in charge of producing marketing strategy for this product"
3. **conclude — "Conclusion"**: "Try filling in this table with some real world scenario that you are facing. This table will be available for you to use freely."

### Day 27 — "Just Do It!" (description: empty string)

1. **lesson — "Just Do It"**: "For the next three days, we would like you to pick one task to focus on and close it. Do one each day. Burnout and procrastination are closely related, and as we deal with procrastination, we can also reduce the symptoms of burnout. You can achieve this with a simple framework, that will help you tackle the task you pick" *(Note: says "next three days" but — per the day-28 gap noted above — only Day 27, Day 29, and Day 30 actually exist to carry this out, i.e. exactly three days by count, though the numbering skips 28.)*
2. **reflection — "Just Do It"**: a fill-in structured task-planning table — "Task I will take up today" / "My Task Timeline" with columns Time slot / Part of the task / "Dependencies, if any (if i need support from someone to complete this task)" — all cells blank (template for the user to fill in).
3. **conclude — "Conclusion"**: "Now, that we have understood how to overcome the procrastination which may result due to burnout, let's move ahead tomorrow with a comprehensive, yet a realistic combo of techniques."

### [Day 28 — missing]

No entry with `day = 28` exists anywhere in the `daily_content` array. The program's own copy ("For the next three days...") and day-29's title ("Just Do It! (Continued)") both imply day 28 should exist between day 27 and day 29. See Verification notes.

### Day 29 — "Just Do It! (Continued)" (description: empty string)

1. **lesson — "Welcome Back!"**: "Let's continue with yesterday's task."
2. **reflection — "Just Do It"**: identical blank task-planning table to Day 27.
3. **conclude — "Conclusion"**: "We'll resume tomorrow."

### Day 30 — "Just Do It! (Continued)" (description: empty string)

1. **lesson — "Welcome Back!"**: "Let's continue with yesterday's task."
2. **reflection — "Just Do It"**: identical blank task-planning table again.
3. **conclude — "Conclusion"**: "Great job! We now know what to do whenever we feel our workplace is turning sour, and we are feeling burnt out! Whenever you feel burnt out in the future, you can visit this programme anytime, and take a stock of all the things you practiced. All the frameworks will be avails for you forever, we'd like to encourage you to use them as frequently as possible. Burnout causing you to unnecessary stress and insomnia? Do refer to our sleeplessness and stress-buster module on the I-Kan site!" *(typo: "avails" for "available")*

---

## Real usage data (live, as of 2026-08-06)

### Enrollments

`enrollment:` records key their equip reference under `programId` (camelCase — note this is the opposite convention from `progress:` records below, which use `equip_id`; both live in the same KV store).

**6 enrollment records found, all belonging to a single user** (`d5003e00-7ddc-4f1a-8658-8dd43a20674f`):

| enrollmentId (suffix) | startDate | status | currentDay | completedDays | programTitle (as stored) |
|---|---|---|---|---|---|
| …-1773360689139 | 2026-03-13T00:11:29Z | active | 1 | 0 | Burnout Reset |
| …-1773360690408 | 2026-03-13T00:11:30Z | active | 1 | 0 | Burnout Reset |
| …-1773361593799 | 2026-03-13T00:26:33Z | active | 1 | 0 | Burnout Reset |
| …-1773361594296 | 2026-03-13T00:26:34Z | active | 1 | 0 | Burnout Reset |
| …-1773643192222 | 2026-03-16T06:39:52Z | active | 1 | 0 | Burnout Reset |
| …-1776952064836 | 2026-04-23T13:47:44Z | active | 1 | 0 | Unburn |

`user_enrollments` (Postgres migration table) count for `programId = 416feb50-...`: **6** — matches the KV count exactly, no migration drift.

**Migration/data table cross-check**: `user_program_progress` count for `equip_id = 416feb50-...`: **4** — matches the KV `progress:` count exactly, no drift.

### Progress

`progress:` records key their equip reference under `equip_id` (snake_case).

**4 records found**, all for the same single user, all `completed: true`:

| key suffix | day_number | completed_at | block_responses |
|---|---|---|---|
| `...:1` | 1 | 2026-04-23T13:48:01.873Z | `{"8dd83cfa-...": ["I am exhausted all the time"]}` |
| `...:2` | 2 | 2026-03-13T00:11:52.274Z | `{}` |
| `...:3` | 3 | 2026-03-13T00:11:58.187Z | `{}` |
| `...:4` | 4 | 2026-03-13T00:12:07.019Z | `{}` |

All four `day_number`s (1–4) fall inside the program's real 1–30 content range — no orphan/out-of-range day numbers found. Note days 2–4 were "completed" within ~15 seconds of each other on 2026-03-13, and day 1 was completed over a month later (2026-04-23) with actual free-text block content — consistent with test/QA clicking rather than a real user pacing through the program day by day.

### Recommendation rules

Six admin-authored severity rules route to this equip (`recommendation_rule:` records with `equip_id = 416feb50-...`):

| assessment_category | min_severity | priority | rationale |
|---|---|---|---|
| Stress | high | 10 | High stress requires workload & cognition recalibration |
| Sleep | high | 7 | Chronic sleep issues often tie to burnout |
| Depression | high | 10 | High emotional exhaustion |
| Burnout | moderate | 10 | Core burnout intervention |
| Anxiety | high | 9 | Prolonged anxiety often coexists with exhaustion & overload |
| Burnout | high | 10 | Exhaustion + disengagement need structured recovery |

Two separate rules both target `Burnout` category at priority 10 — one gated at `moderate` severity ("Core burnout intervention"), one at `high` ("Exhaustion + disengagement need structured recovery"). Functionally the `moderate` rule already covers the `high` case (assuming severity gating is "at least this severe"), so the `high` rule is likely redundant, not a conflict — but worth a maintainer's eye.

## Verification notes

1. 🔴 **Four disagreeing "how long is this program" numbers on one record.** `duration_days` = 35, `duration_weeks` = 4 (= 28 days), the stored `description` says "A comprehensive **30-day** program," and `tile1_content` repeats "35 days." The actual authored content (`daily_content`) runs Day 0 (onboarding) through Day 30 — 29 real practice days, not 28, 30, or 35. None of the four numbers on the record agree with each other or with the real content length.

2. 🔴 **Day 28 is missing from `daily_content` — a genuine content gap, not a numbering artifact.** The array has 30 entries with `day` values 0, 1, 2, … 27, 29, 30 (28 skipped entirely). This isn't cosmetic: Day 27's own copy says "For the next **three** days, we would like you to pick one task to focus on and close it," and Day 29 is literally titled "Just Do It! **(Continued)**" — both phrasings assume an unbroken day 27→28→29 sequence. A user reaching day 28 in-app would either see nothing or skip straight from day 27 to a day 29 that reads like it continues a day that never loaded.

3. 🟡 **Two onboarding definitions exist and disagree; only the unused one is customized.** The `onboarding` field (rendered live by `EquipProgramOnboarding.tsx`) is generic, uncustomized template copy ("this topic," "this program" — no mention of burnout or Unburn). The `onboarding_questions` field has real burnout-specific questions (Occupation, Therapy History, Conditions) but is marked "legacy" in the admin wizard code and is only used to backfill a Day-0 content block, not shown as the actual onboarding screen. **Net effect: every real "Unburn" enrollee currently sees the generic placeholder onboarding, not the burnout-specific one that was clearly authored for this program.**

4. 🟡 **Two onboarding questions are `required: true` + `allow_skip: false` with zero options.** In `onboarding_questions`: "Welcome" and "Conditions Detail" are typed `single_select`, required, non-skippable, but `options: []`. If this field were ever wired up as the live onboarding path (which it currently isn't, per note 3), these two questions would block completion entirely.

5. 🟡 **Six enrollment records, one user, all still `status: active`, `currentDay: 1`, `completedDays: []` — while `progress:` records for that same user show 4 days actually completed.** The enrollment's own progress tracking (`currentDay`, `completedDays`) never advanced past its initial value even though the separate `progress:` KV prefix recorded days 1–4 as completed. Either enrollment progress is never written back after day completion, or these enrollments and the progress records are simply unlinked in the write path. Either way, an admin looking only at `enrollment:` records would see six "just started, day 1" enrollments and have no visibility into the fact that one of them actually has 4 completed days recorded elsewhere.

6. 🟡 **No organic usage yet.** All enrollment and progress data belongs to a single `userId` (`d5003e00-7ddc-4f1a-8658-8dd43a20674f`), with five of six enrollments created within a 15-minute window on one day and clustered completion timestamps — consistent with QA/test clicking, not real end users. Treat "Unburn" as unlaunched from a usage-data standpoint despite `published: true`.

7. 🟡 **A data-retention promise made directly to the user may not be accurate.** Day 18's lesson tells the user: "Nothing will be recorded here and the whatever you write will be deleted within a day," referring to the worry-log exercise. This equip has no visible mechanism (in this record) that auto-deletes `progress:` block responses after 24 hours — block responses for this equip are, in fact, stored indefinitely in the same `progress:` KV records and dual-written to `user_program_progress` per the migration in progress. This claim should be verified against actual data-retention behavior before it's left standing in front of users; if untrue, it's a user-trust and possibly compliance issue, not just a copy nit.

8. 🟡 **Day 20's conclusion refers to sleep/insomnia content that the day's own copy never introduced.** "Now that we have figured out this technique, when we meet next, we will work on understanding other factors that **keep us awake**" — but Days 18–20 are a plain "worry log" journaling exercise with no framing about sleep anywhere in their own lesson text. Reads like copy carried over from a different (sleep-focused) program and not adjusted for Unburn.

9. ⚪ Minor copy/typo issues, left in place verbatim above but flagged here for cleanup: "Anatomy of Burnout **(Copy)**" (Day 13 title — looks like an unrenamed duplicate from the admin authoring tool); "Journalling **(ontinued)**" (Day 20 title, missing "C"); "Managing **Workplad**" (Day 15, block 1 title, corrected in block 2 of the same day); "**Perfectionsim**" (Day 23, block 2 title); "left where we **yeterday**" (Days 10 and 11, repeated); "necessi**cities**" (Day 12); "procrast**r**ation" (Day 23 checklist option); "will be **avails** for you forever" (Day 30 closing message); a doubled word "in order **to to** identify patterns" (Day 4).

10. ⚪ Several blocks carry an `exerciseConfig` prompt/key that doesn't match the adjacent lesson text — e.g. Day 8's opening lesson block carries exercise config key `tf_behavior_log_d5` (a thought/feeling log config) even though the lesson is about effort/reward, not thoughts and feelings; Day 14's opening lesson carries a `Yes/No` "are efforts and rewards in balance" prompt bolted onto goal-alignment copy; Day 15's first block carries a `matrix` exercise config with no corresponding prompt text in the lesson. These look like configs left over from copy-pasting a similar block as a starting point and not fully re-pointed at the new lesson's actual question.

11. ⚪ Day 24's "Situations And Outcomes" exercise pre-seeds its input-table rows with the same situation/outcome pair already shown as the day's own worked example ("I have to write a document for the marketing team" / "The document is grammatically excellent…"), rather than starting the user on a fresh, unsolved row — minor UX redundancy, not a data-integrity issue.

12. ⚪ No `checkin_scale:` or dedicated `checkInConfig` field exists on this equip record at all (top-level key enumeration confirmed only: `id, days, slug, tags, price, title, is_paid, category, currency, featured, metadata, subtitle, image_url, published, thumbnail, can_repeat, created_at, difficulty, onboarding, updated_at, cover_image, description, daily_content, duration_days, duration_weeks, week_structure, onboarding_questions`). If check-in prompts exist for this program, they live only inline as `exerciseConfig` on individual blocks, not as a separate structured config block.
