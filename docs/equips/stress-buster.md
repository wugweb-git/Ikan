# Stress Buster

Pulled live from `equip:9117b308-ff8a-4613-90ef-007841ef0b79` on 2026-08-06. **Note:**
`EquipService.getEquip()`'s missing-slug-fallback bug (fixed 2026-08-06, see `docs/PENDING.md`) meant
any equip could in principle have progress silently miskeyed under its slug instead of its real id
when started via a `/equip/<slug>` URL — confirmed hitting Sleep Tight twice; no evidence found of
it affecting this program specifically, but the fix now covers all equips going forward. Separate
from the migration drift/duplicate-enrollment issues already documented below, which are unrelated.

## Meta

| Field | Value |
|---|---|
| id | `9117b308-ff8a-4613-90ef-007841ef0b79` |
| slug | `stress-buster` |
| title | Stress Buster |
| subtitle | *(empty string)* |
| category | `stress` |
| difficulty | `beginner` |
| duration_days | `30` |
| duration_weeks | `4` |
| is_paid / price / currency | `false` / `0` / `INR` |
| published / featured / can_repeat | `true` / `false` / `true` |
| tags | `stress`, `resilience`, `mindfulness`, `cbt` |
| created_at | 2026-01-04T10:31:54.434Z |
| updated_at | 2026-07-21T13:57:48.407Z |
| image_url / cover_image | same Unsplash URL (`photo-1758876201548-ade1eff8b169`) |
| thumbnail | Supabase Storage signed URL (`assessments/1767522974909-3m9s93q.jpeg`), expires 1799058975 (epoch) |
| content field in use | `daily_content` (28 entries) — top-level `days` is present but an **empty array**; `week_structure` is present but an **empty array**. Confirms this equip does *not* follow the `days`/`week_structure` shape used elsewhere; `daily_content` is authoritative. |
| checkInConfig | **absent** — not a key on this record at all (top-level key list has no `checkInConfig`) |

## Description

> A 30-day guided program to understand, manage, and reduce everyday stress.

## Landing-page tile copy (`metadata`)

| Tile | Content |
|---|---|
| tile1_content | Don't let stress get the better of you. Understanding and learning to manage your stress has never been easier. Simple modules over the next 30 days will teach you how. |
| tile2_content | Daily micro-lessons (5-10 minutes)<br>Evidence-based CBT techniques<br>Progress tracking & insights<br>Practical and useful tips |
| tile3_content | Complete your daily lessons at your own pace<br>Track your patterns and progress<br>Practice new techniques each day<br>Review your insights and adjust your plan |
| tile4_content | Lower daily stress. Stay calm under pressure and regain control over your life<br>Reduced Mental Overwhelm. Clear mental clutter and stop feeling constantly overloaded<br>Sustainable Habits. Build routines that last beyond the program<br>Improved Daily Energy. Feel more alert and energized during the day |
| eligibility_intro | Daily micro-lessons (5-10 minutes) |
| eligibility_point_1 | Evidence-based CBT techniques |
| eligibility_point_2 | Progress tracking & insights |
| eligibility_point_3 | Practical stress management  *(trailing space in source)* |
| eligibility_point_4 | No pills |

Note: `eligibility_intro`/`eligibility_point_1`/`eligibility_point_2` are verbatim duplicates of `tile2_content`'s three bullet lines — this "eligibility" block reads as copy-pasted filler rather than actual eligibility criteria (nothing here describes who is or isn't eligible).

## Onboarding — two representations on record

**1. Top-level `onboarding` object** — generic scaffold, title "Program Setup", 3 questions:
1. `q-experience` (single-choice): "How would you describe your current experience with this topic?" — options: New to this (`beginner`) / Some experience (`intermediate`) / Experienced (`advanced`)
2. `q-goals` (long_text): "What do you hope to achieve with this program?"
3. `q-commitment` (scale, 1–10): "How committed are you to completing this program?" — min label "Not very committed", max label "Very committed"

This block reads as **unedited boilerplate** — "this topic" is generic placeholder language never filled in with "stress," and nothing in the actual Day 0 flow (below) matches these three questions. It appears to be dead/unused scaffold left over from equip creation, not the real onboarding experience.

**2. `onboarding_questions` array** (equip-specific, and this is what actually renders as Day 0's activities):

| id | question | type | options |
|---|---|---|---|
| `9d8828ff-…` | Welcome | `single_select` | *(none)* |
| `e9683792-…` | Occupation | `single_select` | Employed, Self-employed, Student, Homemaker, Between jobs, Retired |
| `957f9f9d-…` | Therapy History | `single_select` | Yes, No, I'd prefer not to answer |
| `9ef38b34-…` | Pre-existing Conditions | `single_select` | Yes, No, I'd prefer not to answer |
| `7369cb96-…` | Condition Details | `single_select` | *(none)* |

All rows: `required: true`, `allow_skip: false`, `privacy_level: general`, `storage_scope: equip-only`, `editable_later: true`, `allow_prefer_not_to_answer: false`.

Two of these five are typed `single_select` with a **zero-length options array**: "Welcome" (which is actually an informational intro card, not a question — it manifests in Day 0 as a `type: "lesson"` activity, not a quiz) and "Condition Details" (which manifests in Day 0 as a `type: "reflection"` free-text prompt, "If yes, please specify"). The catalog entry's declared type doesn't match how the item actually behaves in Day 0 — a `single_select` with no options can't render a real select control.

## Daily content — `daily_content`, 28 entries, `day` 0–27

All days: `dayType: "learning"`. Every activity has `duration: 5`, `required: true`, `autoAdvance: false` unless noted. HTML/Google-Docs export markup (fonts, spans, inline styles) has been stripped for readability below; wording is reproduced verbatim.

### Day 0 — Onboarding
*Description: "Getting to know you."*

1. **lesson — Welcome**: "Before we begin, we'd like to know a little about you. Your responses help personalize your experience."
2. **quiz — Occupation** (`key: occupation`, subtype `single-select`, uiHints `cards`): "What do you do for a living?" — Employed / Self-employed / Student / Homemaker / Between jobs / Retired
3. **quiz — Therapy History** (`key: therapy_history`, subtype `single-select`): "Have you ever taken therapy before?" — Yes / No / I'd prefer not to answer
4. **quiz — Pre-existing Conditions** (`key: pre_existing_conditions`, subtype `mcq`): "Do you have any pre-existing conditions?" — Yes / No / I'd prefer not to answer
5. **reflection — Condition Details** (`key: condition_details`, rule `dependsOn: pre_existing_conditions == Yes`): "If yes, please specify"

### Day 1 — Taking Stock
*Description: "How have you been?"*

1. **lesson — How have you been?**: content is effectively empty (`<p><br></p>` — a blank line, no actual copy).
2. **exercise — Recent Stressors** (`key: recent_stressors`, columns: "What stressed you out?", input-table, add-rows allowed): "What has been stressing you recently?"
3. **conclude — Conclusion**: "That's it for today, we'll meet tomorrow for more."

### Day 2 — Stress Manifestations
*Description: "How does it show up?"*

1. **lesson — Welcome Back!** (embeds `exerciseConfig key: stress_manifestations`, multi-select, uiHints cards): "Today we'll take a look at how stress manisfests itself." *(sic: "manisfests")* — "How does stress show up for you?" — I am more irritable / I clench my jaw / I have trouble sleeping / I procrastinate / I forget things / I feel restless
2. **lesson — How Stress Manifests**: "Now the thing with stress is, sometimes it helps you. That stress to meet a deadline? Or the stress of an upcoming test? Maybe that is what's motivating you to work hard, or improvise smart ways to reach your goals. Maybe you will take lessons and HOWEVER! When stress persists, even after the episode that generated that stress is long over, or the episode itself continues for a long time, then it's a problem. This stress is not good. It harms you, both mentally and physically. Mentally, you are more anxious, always on your toes. Sometimes it manifests in your behaviour- you are more irritable, forgetful and so on. Physical manifestations of stress include insomnia, loss of appetite, gastric issues and so on. Basically your fight or flight mechanisms are on an overdrive."
   *(Note the sentence "Maybe you will take lessons and HOWEVER!" — this reads as truncated mid-thought; a clause appears to have been deleted during editing, leaving a dangling "and" before "HOWEVER!".)*
3. **checklist — Stress and you.** (multi-select): I am more irritable / I hyperventilate / I clench my jaw / I bite my lips / I bite my nails or cuticles (skin around my fingernails) / I speak fast / I am unable to sleep / I sweat a lot / I eat a lot / I don't eat / I feel puckish / I get the loosies / My digestive system goes into a shutdown / I forget things / I start ignoring people / I am unable to do a task / I procrastinate on tasks/assignments/studying / **Let users add more**
4. **lesson — Conclusion.**: "That's all for today. Think more about how your stress manifests. Tomorrow, we shall discuss more about your stress."

### Day 3 — Before Stress
*Description: "Remembering your relaxed self."*

1. **lesson — Pre stress** (`key: pre_stress_self`): "Okay, so your stress does manifest in different forms. As a reminder of your stressors and your resting relaxed state, we would like you to fill in certain things which stress you out in general. E.g. A particular subject at school or college, health of a loved one, behaviour of a colleague at work and so on…" — prompt: "How are you when you're relaxed?"
2. **exercise — General Stress** (`key: relax_methods`, columns: "Things which stress me out"): prompt "What helps you relax?"
3. **exercise — Relaxed state** (columns: "How I relax."): no prompt set.
4. **conclude — Conclusion**: "The purpose of the above exercises? It helps you to understand your stress- your stressors, symptoms of when you are under stress, and to ground back to realise when you were stressed the least. This will help you with future activities, and journalling in general."

### Day 4 — Stress Patterns

1. **journal — My Stress Patterns** (`key: stress_my_patterns`): "Let's pick up from where we left yesterday. We'd like you to delve deeper in to your observations from yesterday. In the next few pages, we'll ask you to fill some stuff related to your stress, Fill in as much as you want. Just take a pause after this sentence to gather your thoughts and write away. Take some time to think about it today, and try getting back to it tomorrow as well." — prompt: "Do you notice any recurring stress patterns?"
2. **exercise — Work and Personal Life** (columns: "What's bugging you?")
3. **exercise — Stressful Activities** (columns: "Activities y=stressing you out?" *— sic, stray "y=" typo*)
4. **exercise — Joy** (columns: "What brings you joy?")
5. **conclude — Conclusion**: "This should be enough for today. We'll repeat this tomorrow."

### Day 5 — Stress Patterns (Continued)

Repeats Day 4's four exercises verbatim (Work and Personal Life / Stressful Activities / Joy), with a new opener:
1. **journal — Welcome Back!** (`key: stress_welcome_back`): "Let's continue yesterday's exercise." — prompt reused verbatim from Day 4: "Do you notice any recurring stress patterns?"
5. **conclude — Conclusion**: "This should be enough for today. We'll repeat this tomorrow." *(same text as Day 4's conclusion — but Day 6 is not a repeat, it moves on to mindfulness; this conclusion line was not updated for the topic change.)*

### Day 6 — Relaxation and Mindfulness
*Description: "Continuing observations."*

1. **lesson — What is mindfulness?** (`exerciseConfig key: stress_what_is_mindfulness`, prompt reused verbatim again: "Do you notice any recurring stress patterns?" — unrelated to this lesson's actual mindfulness content): "Mindfulness is, simply put, being in the present, spatially and temporally. Being "mindful" of your surroundings. When you are in the present, it takes your mind off the thoughts that might stress you out and deal with things at hand more efficiently, without worries of the future or wallowing of the past. Let's try a simple trick for mindfulness. Stop whatever you are doing, take a deep breath. Notice any 5 colours around you and say them out loud. Don't overthink the shade, just blurt out whatever colour that comes to your mind. Now, you will need to close your eyes. But before that, note and say out loud 4 sounds around you, 3 smells that you can perceive and 2 sensations that you can feel."
2. **conclude — Conclusion**: "Good Job! It really does help you anchor to your surroundings, no? Try this multiple times today. We will learn to practice similar mindfulness exercises over the course of your journey with us."

### Day 7 — Anatomy of Stress
*Subtitle: "Understand what causes stress"*

1. **lesson — Welcome Back!**: "Today we'll be looking in to the anatomy of stress, exactly what causes it."
2. **lesson — Anatomy of Stress**: "While some stress is normal, excessive stress is usually when our demands and resources are imbalanced. What are demands and resources? Demands, as the name suggests, are the different requirements from you throughout a time period. An assignment at work, a particularly difficult topic at school or college, an elderly family member or a child to take care of, expectations from family and so on. Resources are the things that make you feel good, and help you relax and rejuvenate. They may be your pay and gains at work, happy time spent with family and friends, some time to relax by yourself, good performance at place of education, to name a few."
3. **exercise — Demand and Resources** (columns: Demand / Resources): "Can you think of some more Demands and Resources?"
4. **conclude — Conclusion**: "Well done, we'll continue tomorrow."

### Day 8 — Anatomy of Stress (Continued)
*Subtitle: "Understand what causes stress"*

1. **lesson — Welcome Back!**: "Let's continue."
2. **lesson — Anatomy of Stress**: "Stress occurs when your demands outweigh your resources. Take some time to think about it. You can access this sheet today and tomorrow. Fill it over the two days. We will continue after that. Don't spend more than 20 minutes on this per day. Let's list some of your demands." — followed by an embedded worked example table, one cell: "Near continuous work deadlines"
3. **exercise — Your Demands** (columns: "Your Demands"): "Can you think of some more Demands and Resources?"
4. **lesson — Your Resources**: "Now let's have a look at your recourses, like this your resources:" *(sic: "recourses")* — followed by an embedded worked example table, one cell: "Supportive manager and colleagues, adequate compensation at work"
5. **exercise — Your Resources** (columns: "Your Resources")
6. **conclude — Conclusion**: "We will repeat this tomorrow."

### Day 9 — Anatomy of Stress (Continued)
*Subtitle: "Understand what causes stress"*

1. **lesson — Welcome Back!**: "Let's continue where we left yesterday."
2. **exercise — Your Demands** (columns: "Your Demands")
3. **exercise — Your Resources** (columns: "Your Resources")
4. **conclude — Conclusion**: "That's all. We'll learn balancing demands and resources tomorrow."

### Day 10 — Demands & Resources
*Description: "Get an idea of what demands and resources are"*

1. **lesson — Balancing demands and resources** (`key: demands_resources`, subtype `matrix`, columns: "Demands (Drains)" / "Resources (Energy)"): "Now that you have your demands and resources in front of you, you can start working on ways to reduce your demands (in your control) and increasing your resources. You can reduce your demands by ways like delegating your tasks, asking for more flexible deadlines, outsourcing some of the activities like hiring a help for some housework and so on." — prompt: "List your current demands and resources."
2. **exercise — Reducing Demand** (columns: "Ways to reduce demand", prompt empty)
3. **lesson — Increasing resources**: "You can increase your resources by using ways like spending more time with family or friends, taking time off, having some down time at work, and so on."
4. **exercise — Increasing resources** (columns: "Ways to increase resources" — this one has no `allow_add_rows` flag, unlike the sibling exercises)
5. **conclude — Conclusion**: "Well done. Tomorrow onwards we'll work on the link between stress and thoughts."

### Day 11 — Thoughts and patters.
*(sic — title typo, "patters" for "patterns". Description: "Introduction."*)*

1. **lesson — Thoughts and Feelings**: "Let's take a more structured approach to look at, and challenge your thought patterns. Before that, we must understand what thoughts are- A thought is basically an internal dialogue that you have with yourself. Imagine you are standing in a queue at the post office, and you say to yourself in your mind, 'Oh God, the line is so long! I hope my turn comes up before the employees go on a lunch break.' Or you are going to meet your friends after a long time, and you think, 'I am going to have such a good time!' that's a thought. A feeling is something that you experience as a result of a particular situation or the thought that has entered your mind in response to that situation. For example- You feel bored or anxious while waiting in the post office queue. You feel happy and excited when you are about to meet your friend. Another way- a thought is usually a sentence, while a feeling can be expressed as a single word. Thoughts and feelings can impact each other. A more negative thought will result in negative feelings, while negative feelings, in return, will cause more negative thoughts. Now read the sentences below carefully and mark the ones that are thoughts and the ones that are feelings."
2. **exercise** (single-select, Thought/Feeling): "We won the cricket tournament after a really long time. The spinners played really well"
3. **exercise** (single-select): "I am furious about the power cuts."
4. **exercise** (single-select): "She won a well deserved award for her performance."
5. **exercise** (single-select): "I am so happy for him!"
6. **conclude — Conclusion**: "That's all for today. See you tomorrow."

### Day 12 — Thought Log
*Description: "Journaling thoughts."*

1. **lesson — Welcome Back!** (`key: tf_event`, prompt "What happened?"): "Now that we have a basic understanding between your thoughts and feelings, let us record them. Focus on the events that stress you out, but don't ignore some good things as well. For the next 3 days' this is all we'd like you to do. We have filled one as an example." — followed by a worked example table: *What happened:* "I have a self-set deadline for a side project approaching for this task but I have other bigger assignments at work and they are taking a lot of my time" / *Thoughts that came to my mind:* "If I miss this deadline, it will delay my project and will cause me to lose confidence in myself. My partners will also judge me and it might cause problems later on" / *How it made me feel:* "Stressed, Anxious"
2. **exercise — Thought Log** (`key: tf_thoughts`, columns: What happened: / Thoughts that came to my mind: / How it made me feel:): "Thoughts that came to your mind"
3. **conclude — Conclusion** (`key: tf_feelings`, prompt "How it made you feel"): "Thanks for keeping a log, we will do this again tomorrow."

### Days 13–15 — Thought Log (Continued) ×3
*Description: "Journaling thoughts." (all three)*

Identical 3-activity structure each day (Welcome Back! → Thought Log table → Conclusion), same `tf_event`/`tf_thoughts`/`tf_feelings` keys and columns as Day 12. Day 13/14 opener: "Let's continue logging our thoughts." Day 13/14 conclusion: "Thanks for keeping a log, we will do this again tomorrow." Day 15 conclusion instead: "Let's pause the logging for now. We'll begin the next chapter tomorrow."

### Day 16 — Reasoning With Thoughts
*Description: "Cognitive distortions."*

1. **lesson — Welcome Back!**: "Now that we have explored our thoughts, we shall focus on challenging them to get a grip on our stress."
2. **lesson — Challenge Them**: "Sometimes, our stress is our creation. Our thoughts create scenarios, which may not always be true or magnified, but still gives us stress. For example, when we procrastinate, it most definitely stresses us out, and it is about us having an unreasonable fear relating to the task, for example how we might not fare well on the task, or exaggerating the magnitude of the task. Similarly, about people and certain situations too, these distortions in our thought patterns cause us stress. Therefore, it is vital for us to challenge these thought patterns and reason with these. It is simple actually, just that it requires some effort from our end. Let's try it once."
3. **lesson — Reasoning with thoughts.**: recaps the Day 12 worked example table, then: "Now in order to challenge these, we need to ask ourselves some questions like..."
4. **lesson — Perspective Filters**: "Am I overreacting? Is this really that big a deal? Will it be as important to me in a few months or a few years?"
5. **lesson — Bias Detectors**: "Am I arriving at conclusions based on opinions, isolated experiences and not relying as much on facts? Am I overgeneralizing?"
6. **lesson — Mind Reading**: "Am I assuming others to have certain feelings and beliefs? Am I assuming how others will react? Am I reading their minds?"
7. **lesson — Spectrum Checks**: "Am I viewing things in black and white? Am I judging things as bad or good without considering that things mostly lie between the two?"
8. **lesson — Step Back**: "Let me step back and judge if this thought is as truthful and accurate as I thought it to be initially."
9. **lesson — Master Key**: "Is there any evidence to show that my thoughts might not entirely true?" *(sic — grammatically missing "be": "might not entirely true")*
10. **lesson — Self Compassion**: "What will I tell my best friend or a loved one if they had this thought?"
11. **conclude — Conclusion**: "All you need is to take some time with yourself and think about these questions. Tomorrow we shall put this in practice."

### Day 17 — Challenging thoughts
*Description: "Tools to challenge."*

1. **lesson — Welcome Back!** (`key: thought_challenge`, multi-select): "Yesterday, we asked ourselves some questions about out own thoughts." *(sic — "out own thoughts")* "Sometimes it is important to have the talk with our own thoughts. Let's get to putting them in practice." — "Which of these questions help challenge a stressful thought?" — Am I overreacting? / Am I assuming the worst? / Is this thought fact or opinion? / Would I say this to a friend?
2. **lesson — From The Thought Log**: recaps the worked example, now extended with three new columns (I understand that: / My alternate thoughts: / How they make me feel now:), filled in for the same example ("This is a self-set deadline; my work is also important. …" / "Let me inform my partners first, and also propose more realistic timelines. …" / "Hopeful, relived, determined." *sic "relived" for "relieved"*), ending "Let's try doing that for the thoughts you logged."
3. **exercise — Challenging Thoughts** (6 columns: the same What happened:/Thoughts/Feeling triplet plus I understand that:/My alternate thoughts:/How they make me feel now:)
4. **conclude — Conclusion**: "Great job! Now, let's continue this for the next 4 days. We want to perfect this skill!"

### Days 18–21 — Challenging thoughts (Continued) ×4

Same 3-part structure (thought_challenge quiz → 6-column Challenging Thoughts table → conclusion) repeated with identical quiz text each day. Conclusions: Day 18/19/20 = "We'll continue this tomorrow."; Day 21 = "Well done. Now that we've learnt to question our thoughts, we'll learn to empty our mind."

### Day 22 — Journalling
*Description: "New perspective."*

1. **reflection — Welcome Back!** (`key: original_thought`, prompt "Stressful thought"): "For today and the next two days, we want you to do nothing but maintain a worry log. It may sound daunting but it is very easy. Think of this as a safe space and just jot down all your worries. **Nothing will be recorded here and the whatever you write will be deleted within a day.**" *(sic: "and the whatever you write")*
2. **exercise — Emptying the mind.** (`key: alternate_thought`, columns: "What's worrying you? ")
3. **conclude — Conclusion**: "Hope you were able to fill in the boxes with some content. Let's keep doing this for a couple of days."

### Days 23–24 — Journalling (Continued) ×2
*Description: "New perspective." (both)*

Same worry-log structure as Day 22 verbatim. Day 23 conclusion: "Great! Let's do this again tomorrow." Day 24 conclusion: "That's it, you can return and log your worries anytime you'd like to."

### Day 25 — Positive Capturing
*Description: "Gratitude."*

1. **lesson — Positive Capturing**: "When we are stressed, we lose the vision of things that are going well in our lives, our small wins and something good that happened to us. Let's recall them and widen our perspective which stress has narrowed. Luckily, it isn't very difficult doing that. Today and over the next two days, we will be focusing doing just that with these simple exercises." *(sic — "focusing doing", missing "on")*
2. **exercise — Good Things.** (columns: "Good Things That Happened Today."): "List down 3 good things which happened to you today."
3. **exercise — There's Always Room** (columns: "3 things that could have been better."): "3 things that could have been better."
4. **exercise — For tomorrow** (columns: "Things that I will achieve tomorrow"): "Things that I will achieve tomorrow"
5. **conclude — Conclusion**: "We'll continue this tomorrow."

### Days 26–27 — Positive Capturing (Continued) ×2
*Description: "Gratitude." (both)*

Same 3-exercise structure as Day 25 (Good Things / There's Always Room / For tomorrow), same prompts/columns.

Day 26 conclusion: "We'll continue this tomorrow."

Day 27 (final authored day) conclusion: **"Good Job! In the past 27, we learnt several techniques to tame our stress. We have listed them below for you. Whenever you feel stressed, or feel your stress is getting out of control, you can always login at I-Kan; Equip and access any of these activities."** — the sentence "In the past 27" is missing "days," and, more importantly, the promised technique summary ("We have listed them below for you") **is not present anywhere in the stored content** — the block ends right after that sentence with no list.

## Real usage data

### Enrollments (KV `enrollment:` keyed by `programId`)

10 KV enrollment records match this equip, across 3 distinct users:

| enrollmentId (suffix = epoch ms) | userId | status | startDate | currentDay | completedDays |
|---|---|---|---|---|---|
| …-1773360496526 | d5003e00-… | active | 2026-03-13T00:08:16Z | 1 | 0 |
| …-1773360497531 | d5003e00-… | active | 2026-03-13T00:08:17Z | 1 | 0 |
| …-1773360842533 | d5003e00-… | active | 2026-03-13T00:14:02Z | 1 | 0 |
| …-1773391424822 | d5003e00-… | active | 2026-03-13T08:43:44Z | 1 | 0 |
| …-1773391425461 | d5003e00-… | active | 2026-03-13T08:43:45Z | 1 | 0 |
| …-1776951683707 | d5003e00-… | active | 2026-04-23T13:41:23Z | 1 | 0 |
| …-1773683237490 | 107e08ee-… | active | 2026-03-16T17:47:17Z | 1 | 0 |
| …-1773382967409 | 88809419-… | active | 2026-03-13T06:22:47Z | 1 | 0 |
| …-1773382967780 | 88809419-… | active | 2026-03-13T06:22:47Z | 1 | 0 |
| …-1773634271864 | 88809419-… | active | 2026-03-16T04:11:11Z | 1 | 0 |

Every single enrollment row has `status: active`, `currentDay: 1`, and `completedDays: []` — including the ones for `d5003e00-…` who (per the `progress:` records below) actually completed 30 days. **The enrollment record's own progress tracking is never updated** — a completely separate write path (`progress:{userId}:{equipId}:{day}`) is the one actually recording completions, and nothing syncs that back into `completedDays`/`currentDay` on the enrollment. If any UI reads "days completed" off the enrollment record rather than the progress records, it will show 0/1 for users who are actually well into or finished with the program.

Several duplicate enrollments were created for the same user within about a second of each other (`88809419` at `…967409`/`…967780`, `d5003e00` at `…424822`/`…425461`) — looks like a double-submit on the enroll action rather than deliberate re-enrollment.

**Migration drift**: `user_enrollments` (Postgres) has **9** rows matching `data->>'programId' = '9117b308-…'`, vs **10** in KV. One enrollment record present in KV was not carried into the shadow table.

### Progress (KV `progress:` keyed by `equip_id`)

**32** progress records, matching the Postgres `user_program_progress` count of **32** exactly — no drift here.

- User `d5003e00-…`: 30 records, `day_number` 1 through **30**, all `completed: true`.
- User `88809419-…`: 2 records, `day_number` 1–2, `completed: true`.

**Orphan/bug**: the authored content (`daily_content`) only goes up to `day: 27` (28 entries counting Day 0's onboarding). User `d5003e00-…` has `completed: true` progress rows for `day_number` **28, 29, and 30** — three days beyond any real authored content. Either the player lets users "complete" days that don't exist in `daily_content`, or these rows are test artifacts from manually driving the API past the real day range. Several of this user's early responses are also clearly test data (`"fvfv"`, `"gvhj"`, `"klnj"`, etc.), consistent with dev/QA testing rather than real usage — worth keeping in mind when interpreting these as "real" completions.

### Recommendation rules (`recommendation_rule:` targeting this equip_id)

8 rules route into Stress Buster:

| assessment_category | min_severity | priority | rationale |
|---|---|---|---|
| Stress | mild | 10 | Direct stress coping and grounding techniques |
| Anxiety | moderate | 9 | Thought & feeling regulation reduces anxious loops |
| Anxiety | mild | 8 | Early stress regulation helps prevent anxiety escalation |
| Sleep | moderate | 8 | Stress is a major sleep disruptor |
| General | mild | 8 | Broad grounding & awareness |
| Balance | moderate | 8 | Work–life recalibration |
| Burnout | mild | 7 | Stress skills help early burnout |
| Balance | mild | 6 | Awareness of overload |

## Verification notes

1. 🔴 **Day 27's closing summary promises content that isn't there.** The final lesson says "We have listed them below for you" (referring to the techniques learned over the program) but no list follows — the activity's `content` field ends immediately after that sentence. Anyone completing the full 27-day arc gets a broken payoff at the very end.

2. 🔴 **The worry-log privacy claim on Days 22–24 doesn't match how the data is actually stored.** The Day 22 "Welcome Back!" copy tells users: *"Nothing will be recorded here and the whatever you write will be deleted within a day."* But this activity (`type: reflection`, id `69f4ed34-…`, exercise key `original_thought`) uses the same generic `block_responses` storage as every other activity in the program — there is nothing in the `progress:` record shape that special-cases this activity for non-persistence or scheduled deletion. If that's true in the actual backend logic (not just this data audit), the app is making an explicit privacy/retention promise to users about sensitive "worry" content that isn't backed by any corresponding deletion mechanism. Worth a code check against the equip-routes/progress-save path before this ships to more users.

3. 🟡 **`duration_days: 30` doesn't match anything else on the record.** `daily_content` has 28 entries (`day` 0–27); Day 0 is onboarding, leaving 27 real content days; `duration_weeks: 4` (=28 days) doesn't match either. None of `30`, `28`, or `27` agree. `progress:` records going up to `day_number: 30` (see note 4) suggest whatever gates "day N" in the player currently trusts `duration_days`, not the actual length of `daily_content` — meaning the last 2–3 "days" a user can page through have no authored content behind them.

4. 🟡 **Progress records exist for days 28–30, past the last authored day (27).** See Usage data above. Either the player doesn't hard-stop at the real end of content, or these are test-generated rows; either way it's a mismatch between the content model and what the progress table will accept.

5. 🟡 **Enrollment records never reflect actual progress.** All 10 KV enrollment rows show `currentDay: 1` / `completedDays: []` regardless of how far the user actually got (one user has 30 completed `progress:` rows behind an enrollment that still claims day 1, zero completed days). This mirrors the `programId` (enrollment) vs `equip_id` (progress) field-name asymmetry already called out in CLAUDE.md — the two systems don't just use different key names, they don't cross-reference each other's state at all.

6. 🟡 **Migration drift on enrollments.** KV has 10 `enrollment:` rows for this equip; `user_enrollments` (Postgres shadow table) has 9. One row didn't make it across. (Progress migrated cleanly: 32 in both.)

7. 🟡 **Two disconnected onboarding definitions.** The top-level `onboarding` object (generic "Program Setup" boilerplate — "How would you describe your current experience with this topic?") does not match the `onboarding_questions` array that actually drives Day 0's activities. The first looks like unedited scaffold left over from equip creation and should probably be removed or reconciled so it doesn't mislead anyone reading the raw record.

8. 🟡 **`onboarding_questions` catalog entries don't match their real behavior.** "Welcome" and "Condition Details" are both typed `single_select` with an empty `options: []` in the catalog, but in the actual Day 0 content they render as a `lesson` (plain info card) and a `reflection` (free-text prompt) respectively — neither is a real select control. The catalog's declared shape and the actual activity type have drifted apart.

9. ⚪ Minor content bugs worth a copy pass, not urgent:
   - Day 2's "Stress and you." checklist includes the literal option **"Let users add more"** — reads like a developer instruction accidentally shipped as a user-facing answer choice.
   - Day 2's lesson text has a dangling clause: "Maybe you will take lessons and HOWEVER!" — looks like an edit left a sentence half-deleted.
   - Day 3: the "General Stress" exercise's column header ("Things which stress me out") doesn't match its own prompt ("What helps you relax?"), while the very next exercise ("Relaxed state," no prompt) has the column that should have gone with the relaxation prompt ("How I relax."). The two exercises' column labels appear to have been swapped.
   - Days 5 and 6 reuse the Day 4 prompt "Do you notice any recurring stress patterns?" verbatim even though Day 6's actual lesson is about mindfulness, not stress patterns — leftover copy-paste from cloning the day template.
   - Typos/grammar: "manisfests" (Day 2), "y=stressing" (Day 4 column header), "patters" (Day 11 title, should be "patterns"), "out own thoughts" (Day 17, should be "our own thoughts"), "might not entirely true" (Day 16, missing "be"), "recourses" (Day 8, should be "resources"), "relived" (Day 17, should be "relieved"), "focusing doing" (Day 25, missing "on"), "In the past 27" (Day 27, missing "days").
   - Subtype vocabulary is inconsistent: Day 0's "Pre-existing Conditions" uses `subtype: "mcq"` while every other single-answer question in the program uses `subtype: "single-select"` for the same shape of options.
