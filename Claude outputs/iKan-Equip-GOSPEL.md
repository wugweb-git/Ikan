# iKan Equip — the model

**Version:** 4.0 · 2026-09-11
**Status:** single source of truth.

**Changes in v4**
- **§16 — the complete content inventory.** Every option list, seed row, rule set and matrix from the source, attached to the unit that uses it. This is the permanent fix for content being lost in restructuring; nothing authored now lives only in the original file.
- **§17 — a proposed 35-unit programme structure.** Marked throughout for what is authored, what is proposed, and what needs a clinical decision I cannot make.

**Changes in v3**
- **Unit 0 restored in full** — About, What to expect, Who can participate, Things to note, the disclaimer, both onboarding tables, and the schedule table. Nothing original is deleted from here on; original structures are preserved verbatim even when superseded.
- **"Day" retired.** The programme is self-paced; no calendar is mapped. See §2.
- **Cohorts and groups added** (§11).
- **Block types reconciled against the live catalog** — 17 roles with live usage counts, read from the two artifacts (§10).
- Rule adopted: **never delete an original section.** Supersede in place, keep the original alongside.

**Built from:** `Equip: Sleeplessness 1` · `Equip: Sleeplessness 2` · the *iKan Block Screens* artifact (live block catalog, `kv_store_cc205da9`) · the *iKan Equip Programs* survey (live DB @ 2026-09-02).

---

# 1. The sources

**Sleeplessness 1 is the program document** — 11 units authored inside an 18-unit shell, mid-authoring, with the content team's margin notes left in. Six units carry Google Docs' placeholder string under headings reading `Title` / `Task Title` / `Exercise:`. Those are unwritten, not deliberately blank.

**Sleeplessness 2 is two documents stapled together.** Its prose (§1–§8) is a generated PRD naming the product *"RestfulMind Journey"*, a name appearing nowhere else; its user stories and limitations are the generic set any PRD generator emits, and carry almost no weight here. Its **three unlabelled tables at the end are real clinical material** — the CBT-I component map, the Daily Sleep Diary, and the sleep metrics — pasted under bare headings and never written up. The *Sleep Compression* heading has no table under it.

**The live database is a third source and it disagrees with both.** Sleep Tight is authored as **31 units (0–30) with 155 blocks**, not 18. Across four programs there are 97 authored units and 406 blocks.

## 1.1 Three lengths, reconciled

| Source | Says | Reading |
|---|---|---|
| Sleeplessness 1 | 18 days | An early partial draft |
| Live DB `duration_days` | 31, units 0–30 | What is actually authored today |
| Live DB `duration_weeks` | 5 → 35 | The intended length |
| Sleeplessness 2 component map | 7 prep + 28 = 35 | The intended length, clinically justified |

**35 is the target and it is corroborated twice** — `duration_weeks: 5` and the component map agree. 31 is authored. The gap is four units, not the six the 18-day document implies.

---

# 2. Vocabulary

**The programme is self-paced. No calendar is mapped.** The source itself wanted this and could not do it — *"This is an 18 day programme. As much as we would have liked to make it self-paced, we would suggest you give some time to the activities daily."* That wish is now the rule.

| Term | Means | Replaces |
|---|---|---|
| **Unit** | One sitting's worth of the programme. The thing a user completes before the next one opens. | "Day" |
| **Unit 0** | Front matter and onboarding. Every live program already has one. | "Day 0" |
| **Beat** | An ordered part within a unit — `teach`, `rehearse`, `work`, `close`. | — |
| **Block** | One rendered screen. Carries a **role** and an **interaction**. | — |
| **Instrument** | The persistent thing a user fills, across units. | — |
| **Cohort** | A set of users who started together. Does not impose a calendar. | — |

"Day" survives only where it is quoted from a source or already stored in the database. `Unit` is not `Step` (used inside a block, *"Step 1 of 3"*), not `Session` (a block role — guided audio), and not `Stage` (explicitly rejected in the block model).

---

# 3. Unit 0 — front matter and onboarding

**Preserved verbatim from the source.** This was dropped in v2 in error.

## 3.1 Programme card

> **Equip : Sleep Tight**

**About** — *"Having trouble sleeping? I-Kan's Sleep Tight module is here. We know quality sleep is essential for your well-being. Over the next 18 days, we'll work together to address your sleep troubles and help you achieve restful nights, improving your health, focus, and mood."*

**What to expect** — *"We're tackling sleep in two steps. First, you'll work with cool tricks for better sleep and calming your mind. Then, we'll build a personalized sleep schedule and practice those techniques. Think of it like training your brain for sleep, just like those meds do, but naturally. We're ditching the pills and going for good habits!"*

**Who can participate** — *"Ready to ditch sleepless nights? Adults aiming for better sleep, join us! If you're managing other mental health stuff, just check with your doc first."*

The "18 days" and "over the next 18 days" strings are content and are **Kartik's to change**, not mine. They are wrong under §1.1 and under §2 — flagged, not edited.

## 3.2 Things to note — the disclaimer

Three bullets, verbatim:

1. *"This is an 18 day programme. As much as we would have liked to make it self-paced, we would suggest you give some time to the activities daily, before going to bed or after waking up. Consistency is the key here."*
2. *"IKan Equip is a self help tool which is all about developing skills to deal with distresses. We do not claim to cure mental health distress."*
3. *"In case you do feel overwhelmed with your distresses, we would strongly suggest you speak with a mental health professional."* — carries margin comment [a]

Bullet 1 is now contradicted by the self-paced decision and needs rewriting by Kartik. Bullets 2 and 3 are the **non-clinical disclaimer** and must survive any restructure — they are the programme's safety statement, and the PRD's limitations section independently insists on the same thing.

Bullet 3 pairs with the **Support** block role (§10), which already exists as a proposed type carrying Tele-MANAS 14416, AASRA, Vandrevala and 112. The disclaimer says "speak with a professional"; the Support block is where that becomes reachable. **They should be wired to each other.**

## 3.3 Onboarding intake — `Data i01`

The source holds **two versions of this table**. Both preserved.

**Version A** (8 rows, first in document order):

| Prompt | Options |
|---|---|
| *(5 blank rows)* | marked *"Already in Log In Details (No)"* |
| What do you do for a living? | Employed · Self-employed · Homemaker · **Between jobs** · Student · Retired |
| Have you ever taken therapy before? | Yes · No · I'd prefer not to answer · *+ "If yes, what for?"* |
| Do you have any pre-existing conditions? | Yes · No · I'd prefer not to answer · *+ "If yes, what?"* |

**Version B** (9 rows, second in document order — the fuller one):

| Prompt | Options / note |
|---|---|
| Let's get to know each other, tell us your name. | *Already in Log In Details* |
| Tell us your gender. | — |
| When were you born? | — |
| What number can we call you on? We promise to not spam you. | — |
| What's your email id? We'll keep our word and won't spam you. | — |
| What do you do for a living? | Employed · Self-employed · Homemaker · **Unemployed** · Student · Retired |
| Have you ever taken therapy before? | Yes · No · I'd prefer not to answer · *+ "If yes, what for?"* |
| Do you have any pre-existing conditions? | Yes · No · I'd prefer not to answer · *+ "If yes, what?"* |

**The two versions differ in one option: "Between jobs" (A) vs "Unemployed" (B).** A content call, and A is the kinder phrasing. Version B is otherwise a superset — it names the five identity fields A leaves blank.

Three mechanics fall out and are carried into the model:

- **Account-prefilled fields.** Name, phone and email are marked *already in Log In Details*. They are shown, not re-asked.
- **Conditional follow-ups.** "If yes, what for?" is a free-text field that appears only on `Yes`.
- **A refusal option.** *"I'd prefer not to answer"* is a first-class third choice on both sensitive questions, not an empty submit. This is a design decision worth keeping and generalising.

Live, onboarding is **5 questions** on each of the three published programmes and 3 on Productivity Reset. The survey records that the programme envelope carries **two onboarding representations side by side** — an `onboarding` object and a flat `onboarding_questions` array — and that its **5 consent fields are authored and enforced nowhere.**

## 3.4 The schedule table

Preserved verbatim. Column 4 is labelled `Qualifier` and holds durations — see §12.

| Time | Title | Description | Qualifier |
|---|---|---|---|
| Day 1 | Let's Start | We are eased into the module, looking into the outcomes of our sleep issues. | 10 min |
| Day 2 | Understanding your thought patterns | We explore how our thoughts and feelings are impacted by each other | 50 min |
| Day 3 | Digging deeper into thoughts and feelings | Observe and understand how your thoughts and feelings throughout the day also impact your sleep. | 30 min |
| Day 4 | Journalling to clear mind | Clients are introduced on techniques to help them to put down their thoughts. | 30 min |
| Day 5 | Distractions and Control | Clients evaluate distractions based on internal and external and those in and out of their control | 30 min |
| Day 6 | Ideation | Clients learn brainstorming techniques to come up with solutions | 30 min |
| Day 7 | Ideation-Day 2 | Clients learn brainstorming techniques to come up with solutions | 30 min |
| Day 8 | Part of the solution | Clients come up with a doable solution to their sleep distractions based on their realities | 30 min |
| Day 9 | Bedtime Rituals | Clients will be introduced to bedtime rituals, and learn how to turn them into habits | 30 min |
| Day 10 | Rituals in action | Clients will develop their own bedtime routine- a way to induce sleepiness, and formulate it into a plan to be followed | 30 min |
| Day 10-Day 17 | Practicing Rituals | Clients use the techniques learnt to develop an ideal pre-sleep and sleep schedule. They also monitor their sleep and moods | 30 min |
| Day 18 | Conclusion | A graduation of sorts. Clients evaluate their performance make a commitment to a healthy sleep cycle in the future. | 30 min |

Note row 11 — `Day 10-Day 17` is one schedule row covering eight units. That is the rehearsal window (§5.1), and it is why six units in the body read as unwritten.

---

# 4. What the program does

The units are not a playlist of lessons. They are **one funnel with three deliberate returns**, and the returns are the therapy. The user's own data is the material being worked; each phase hands the next an artifact the user made themselves.

## 4.1 The clinical arc

| Phase | What it does to the user |
|---|---|
| **Elicit** | Surface the complaint at zero friction — pick statements that sound like you. No teaching yet. |
| **Discriminate** | Install one distinction (a thought is a sentence, a feeling is a word). Rehearse it on neutral material. Then apply it to your own night. |
| **Instrument** | Open a thought record the user keeps filling. |
| **Re-lens** | **Return to that sheet and add a judgment column** — did this affect my sleep. |
| **Release** | A pressure valve — a timed thought dump, explicitly not kept. |
| **Classify** | Install a second distinction (in my control / not). Rehearse. Apply to your own list. |
| **Diverge** | Brainstorm under enforced rules: no criticism, timer on, quantity over quality. Spread over two units, deliberately. |
| **Converge** | Return to the ideas sheet, add Pros / Cons / Balanced Solution. |
| **Install** | Rituals, then **piggybacking** — stack the new habit onto something already done daily. |
| **Rehearse** | Run the instruments, unchanged, sitting after sitting. |
| **Wake** | Stimulus control — the bed is for sleep only, with an accommodation branch for small homes. |
| **Graduate** | Self-score against a stated threshold, keep the instruments, route onward. |

**The order is a dependency graph.** You cannot converge before you diverge, classify distractors before listing them, or judge a thought's effect on sleep before recording the thought.

Strip the sleep content and the shape generalises — `Elicit → Discriminate* → Instrument → Re-lens* → Diverge → Converge → Install → Rehearse → Graduate`, the starred phases being loop bodies. Sleeplessness runs Discriminate twice and Re-lens three times. The final unit routes outward, recommending the Stressbuster programme, so programmes form a graph.

## 4.2 The four teaching mechanics

**Teach on neutral ground, then turn it on yourself.** Thought-vs-feeling is taught using a post office queue and a cricket match; distractor-spotting is tested on a generic list that deliberately includes non-distractors (*"the mattress is nice and comfortable"*). Only after the concept is rehearsed on someone else's material does the user apply it to their own night. The rehearsal step is explicitly non-scoring — *"all should come in as a right answer."*

**The seed row is a teaching device.** *"We have done the first one for you."* · *"Some ideas in the example might sound a bit unconventional, but we did not ignore them, we noted them regardless."* The second is not sample data — it is **permission**, delivered as data, widening what the user believes is an acceptable answer. Generic placeholder styling destroys it.

**Time-boxing is the intervention.** Five minutes for the thought dump, three for the ideation sprint. Unbounded, a thought dump becomes rumination and a brainstorm becomes evaluation.

**Divergent and convergent thinking are separated.** Two units of *"do not be critical of any idea while writing"*, then one unit of pros, cons and a balanced solution. A tool that helpfully collapses these onto one screen deletes the mechanism.

## 4.3 The central idea — the artifact accumulates

```
thought record        5 columns
  + "did it affect my sleep"      6 columns   ← same sheet, new lens
  carried into rehearsal, seeds still visible

distractors           free list
  + "in my control"               classified  ← same list, new lens

ideas                 generate
  more ideas                      generate    ← same sheet, second session
  + pros / cons / balanced        evaluate    ← same sheet, new lens
```

And two lists the user built separately are **joined**: *activities I already do* × *habits I want*.

The closing line of the final unit states the architecture outright: *"Do continue with the trackers and assessments. They are always there at your service!"*

> The program does not own the user's data. The program is a scaffold for installing instruments into the user's life, then getting out of the way.

**The live database confirms this is the binding constraint.** `exerciseConfig.key` names the answer; **98 of 406 blocks carry one, 308 do not**, and most input-tables — the blocks that most need it — have none. Where the key is absent the answer files under the block id, and a block id is unique per unit. The survey's own words: a thirty-unit diary produces thirty keys that nothing can join, and **every cumulative view in the product is blocked behind this one field.**

---

# 5. The 35-unit structure

| Component | Prep | Delivery | Total | Authored today |
|---|---|---|---|---|
| Sleep Diary | 1 | 6 | 7 | **Nothing in the program document.** A `Sleep Diary` block role exists live with **30 blocks**. |
| Thoughts — cognitive restructuring | 1 | 3 | 4 | Complete and strong |
| Sleep Compression | 1 | 6 | 7 | Named three times, specified nowhere |
| Stimulus Control | 1 | 4 | 5 | Content exists, mis-mapped — see below |
| Sleep Habits | 1 | 2 | 3 | Complete |
| Relaxation | 1 | overlaps Sleep Habits | 1 | Complete |
| Follow Up | 1 | 7 | 8 | Thin — one unit authored of eight |
| **Total** | **7** | **28** | **35** | **31 authored live** |

**The units mapped to Stimulus Control are not stimulus control.** The component map assigns it to the distractor/ideation/solution stretch, which is problem-solving. The genuine stimulus-control teaching — *"our bed is a space that we must limit only to our sleep"* — is the "Leaving the Bed" unit. Fix: that stretch is a **problem-solving** strand in its own right; Stimulus Control takes its own prep unit plus four delivery units, seeded by the Leaving the Bed content.

## 5.1 The rehearsal window

A **rehearsal window** is a run of units with a default projection set — the diary, the thought record, the thought dump, the bedtime ritual and the mood log, collected each sitting, unchanged. An authored unit inside the window overrides the default for that unit.

No repeat primitive is needed. The live DB proves the point negatively: a `repeat` field (`ActivityRepeat`) was **built for exactly this and is used by zero of 406 blocks**, while **16 units duplicate their content by hand.**

---

# 6. The model

> **Instrument** — a named, typed thing the user fills. Stable identity. Scoped to the **user**, not the unit and not the programme. Survives the programme's end.
>
> **Revision** — a versioned schema of one instrument. Adding a field, widening an enum, or adding a constraint mints a revision. Prior rows survive and stay addressable.
>
> **Projection** — a unit placing an instrument on screen in one **mode**: `collect` · `extend` · `review` · `summarise`.

## 6.1 Role and interaction are orthogonal

The live data settles an argument the block model has been having with itself. `multi-select` appears under **checklist**, **lesson**, **quiz** and **reflection**. `input-table` appears under **exercise** and **lesson**. `matrix` under **lesson** and **reflection**.

> **The interaction describes what the user does. The role describes why the block is there.** Two orthogonal fields, not one taxonomy.

Today neither is modelled cleanly: **0 of 406 blocks carry `interaction`** (assessments carry it on 53 of 92), and `subtype` never appears at block level — it hides inside `exerciseConfig.subtype` on 187.

## 6.2 Instrument identity across programmes

Instruments are **user-scoped with a shared key**. A programme declares the keys it uses and the minimum revision it needs; it does not own them.

- A user runs Sleep Tight twice → **one** thought record. The second enrolment appends.
- Stress Buster also wants a thought record → **the same instrument**, if it declares the same key.
- Schema is owned by the instrument, never by the programme. A programme may require revision ≥ N; it may not fork the instrument to get its own shape.
- Rows collected across sittings **dedupe** on the instrument's declared identity columns.

## 6.3 Instrument types

A working vocabulary, not a closed set.

| Type | Shape |
|---|---|
| `record` | **The workhorse.** Rows the user adds. Typed columns, optional seed rows, optional derived columns, optional constraints. A fixed row set makes it a matrix; a boolean column makes it a checklist; neither is a separate type. |
| `nested_record` | Parent rows each holding a child collection, with a child cap. |
| `join` | Two records paired row-wise into a new record with its own identity. |
| `option_pool` | Authored options, select one or many, optional free-text "other", optional per-option glyph, optional refusal option. |
| `drill` | A sequence of prompts each with options. **Non-scoring by definition.** First item's answer revealed as a worked example. |
| `scale` | Ordinal, labelled, carrying a numeric value used in computation. |
| `form` | Typed fields filled once, some account-prefilled, with conditional follow-ups. |

**`scale` already exists in the catalog and is orphaned.** `checkin_scale:` records carry `value`, `severity`, `order` and `is_active` per option — a real scale model, built for the mood journal, **referenced by 0 of 406 equip blocks.** Wiring equip to it is cheaper than building anything.

## 6.4 Derived values — three levels

| Level | Scope | Example |
|---|---|---|
| `row_derived` | expression over one row's own fields | Sleep Efficiency for one night |
| `window_derived` | aggregate across a rolling set of rows | mean Sleep Efficiency over the last 7 **entries** |
| `prescription` | a `window_derived` value computed once, **persisted, and read by later units as an input** | the restricted time-in-bed window Sleep Compression sets |

Sleep Compression needs all three. A model with only row-level derivation cannot express it — which is why it has been named three times and built zero times.

Windows count **entries, not calendar days** (§6.7).

## 6.5 Revision rules

1. A revision **adds**. It never removes and never retypes.
2. **Widening an enum is a revision.** The thought record's judgment column is `{yes,no}` when introduced and `{yes,no,na}` later. Earlier rows have no `na` and must not be coerced.
3. New fields on existing rows are **null, not backfilled — but retroactively fillable.** The whole Re-lens phase is judging yesterday's rows. Never fork.
4. Revisions are ordered. A unit reads the instrument at its latest revision as of that unit.
5. **Adding a constraint is a revision** — the ten-ways-per-disturbance cap is one.
6. **Content edits pin per enrolment; schema additions go live.** An add-only schema change reaches in-flight users immediately. A copy or seed-row edit does **not** retroactively alter a unit the user has already completed.

## 6.6 Composition

**Assembly** — several instruments on one screen, independent. "My Routine" is three instruments shown together. No relationship; three projections.

**Join** — two instruments paired row-wise into a new instrument *with its own identity*, because the user's commitment lives in it. **1:1, one active pair at a time**, a new pair each cycle. The source sets the cadence: *"continue practicing it for another week and then add another daily habit."* The target-habit list is a backlog; the adherence grid accumulates pairs that have gone live.

## 6.7 Units advance on completion, not on calendar

There is no "skipped unit". If a user does not complete a unit, the same block and activity type **continues or repeats** until it is done.

- Unit N+1 opens when Unit N completes.
- The diary carries **no row** for a sitting with no entry. It does not carry a null.
- `window_derived` values average over **entries**. Sleep Efficiency over "the last 7" means the last seven diary entries.

That last point is load-bearing for Sleep Compression — averaging over calendar days would let absence depress the figure and tighten the restriction on someone who simply did not sit down that day.

## 6.8 Projection modes

| Mode | Writes | Shows prior | Notes |
|---|---|---|---|
| `collect` | new rows | seeds only | the default |
| `extend` | new rows + fields added this revision | yes, editable | the Re-lens phase |
| `review` | nothing | yes, **read-only** | editable only within the sitting it was entered |
| `summarise` | a `prescription`, where defined | aggregated | trend charts, adherence, Sleep Compression |

**`review` is a requested capability, not an observed one.** Every rehearsal-unit table in the source is empty-with-seeds — those are `collect`. What asks for `review` is the margin comment *"he cannot go back to asses a sheet"*. It stays in the model because the request is real; nothing in the authored content demonstrates it yet.

## 6.9 Projection properties

| Property | Where it comes from |
|---|---|
| `time_box` | 5 min thought dump, 3 min ideation. **Hard stop.** |
| `evaluation_allowed: false` | the Diverge units. No pros/cons affordance may render. |
| `scoring: none` | all drills, always |
| `seed_rows` | authored content, **visually distinct from user rows** — the source asks for exactly this: *"which part is pre filled and what need to be filled. highlght bgray."* |
| `child_cap` | ten ways per disturbance |
| `retention` | 48 hours on the thought dump, **promised to the user in copy** |
| `completion` | per-unit, distinct from whether instruments were filled |
| `reminder_binding` | ritual reminders derive their schedule from the ritual instrument's own contents |
| `refusal_allowed` | *"I'd prefer not to answer"* as a first-class option on sensitive questions |

---

# 7. The instruments

**Bold** = longitudinal, touched in more than one unit. Six of twenty, and they carry the programme.

| # | Instrument | Type | Notes |
|---|---|---|---|
| 0 | **Sleep diary** | `record` + derived | 10 fields, 5 derived metrics (§8). No copy in the programme document; **30 live blocks exist** in the DB. |
| 1 | Intake | `form` | §3.3. Account-prefilled fields, conditional follow-ups, refusal option. |
| 2 | Sleep statements | `option_pool` | 14 options with glyphs. Needs a 15th and an "other" box. |
| 3 | Thought/feeling drill | `drill` | 6 prompts, item 1 answer-revealed |
| 4 | **Thought record** | `record` | r1 five columns · r2 +`affected_sleep{yes,no}` · r3 enum → `{yes,no,na}` |
| 5 | Journal-entry drill | `drill` | every answer correct by design |
| 6 | **Thought dump** | `record` | `retention: 48h`. Re-collected each time, never reviewed. |
| 7 | Distractor drill | `drill` | contains deliberate non-distractors; multi-select |
| 8 | **Distractors** | `record` | r1 free list · r2 +`in_my_control:bool` |
| 9 | **Ideation** | `nested_record` | r1 collect · r2 collect again · r3 +`pros`,`cons` per child, +`balanced_solution` per parent · cap 10 |
| 10 | Ritual options | `option_pool` | 13 options |
| 11 | **Bedtime ritual** | `record` | r1 list · r2 +`done:bool`; 4 seeded rows |
| 12 | Daily activities | `record` | `activity:text` + `device_possible:bool` |
| 13 | Target habits | `record` | a backlog; one goes live per cycle |
| 14 | Piggyback pair | `join(12,13)` | 1:1, one active pair at a time |
| 15 | Wake ritual | `record` + time | mirror of #11 |
| 16 | Successes | `record` | |
| 17 | Energisers | `record` | |
| 18 | Bed-separation ideas | `record` | |
| 19 | Habit adherence | `record`, fixed rows | habit × weekday booleans, seeded from #11's logged adherence so the user confirms rather than re-enters. The 50% threshold is `window_derived`. |
| 20 | Mood log | `scale` | 1–5 on waking. Should reference the orphaned `checkin_scale:` records. |

**The thought dump is never reviewed.** Every instance in the source is an empty table — it is re-collected each time, which is what the technique requires (*"once you are done, you need not visit your writings"*). The 48-hour deletion promise therefore holds with no contradiction, and any later projection must be `collect`.

**The images** — all four — are decorative third-party stock illustrations carrying no content. They belong to the unit, not to any instrument. **Licensing is unchecked.**

---

# 8. The sleep diary and its metrics

Two of the seven clinical components run entirely through this instrument, and **the programme document never introduces it.** The block role exists live with 30 blocks, which means it is being authored ad hoc, unit by unit, with no shared column model — the survey notes **145 blocks carry `columns`, none of them declared anywhere and none reusable**, and names this exact instrument as the consequence: *Sleep Diary can appear on 30 days and produce 30 unrelated answer sets.*

**Specified fields** (Sleeplessness 2): time got in bed · struggled to fall asleep · time tried to sleep · time to fall asleep · number of awakenings · total time awake · time finally woke · **time got out of bed** · sleep quality (Very Poor → Very Good) · **anything that interfered**.

**The live block has only 8 of these** — *time got out of bed* and *anything interfered* are missing, and quality is asked as *"On a scale of 1 to 5"* rather than the labelled scale. **`time got out of bed` is used by two of the five metrics**, so the live diary cannot compute them.

| # | Metric | As written | Corrected |
|---|---|---|---|
| 1 | Sleep Window | duration(#8, #1) | correct |
| 2 | Time Awake | #4 + #6 + duration(#8, #7) | correct |
| 3 | Time Asleep | `Time Awake − Sleep Window` | **`Sleep Window − Time Awake`** |
| 4 | Time in bed before sleeping | *(blank)* | **`#3 − #1`** |
| 5 | Sleep Efficiency | time asleep / sleep window × 100 | correct, inherits #3's error |

As written, #3 returns a negative number for every user and #5 divides by it. Sleep Efficiency is what Sleep Compression keys off — one inverted subtraction takes out two of the seven clinical components.

**The night crosses midnight.** In bed 23:30, out of bed 07:00 — naive `duration(#8, #1)` gives **−16.5 hours**. Clock fields must resolve against the **sleep night**, not the calendar day: a time earlier than the in-bed time belongs to the following date.

**Sleep Compression is unspecified** and depends on every fix above.

---

# 9. The unit

| Beat | Carries | Optional |
|---|---|---|
| `teach` | prose, images | yes |
| `rehearse` | a `drill`, non-scoring | yes |
| `work` | a projection of an instrument in a mode | **no** — a unit without one is not a unit |
| `close` | prose naming what the next unit does | no, except terminal units |

The observed grammar is `Lesson? → Task? → Exercise+ → Conclude`, but one unit has no Lesson and another inverts Task and Exercise twice. As beats, that unit is simply `teach · work · teach · work · work · close`.

**Every authored `close` names what comes next.** The six stub units are the only ones that do not, which is exactly what makes them read as unfinished. Terminal units are the exception — the last one routes to another programme.

---

# 10. Block types — the live catalog

Seventeen roles, with live usage from `kv_store_cc205da9`.

| Role | Interaction · verb | Live |
|---|---|---|
| Onboarding | single-select · choose | 8 |
| Lesson | read · observe | 119 |
| Learning | single-select · choose | 9 |
| Exercise | multi-select · choose | 49 |
| Journal | text · share | 8 |
| Checklist | structured-list · confirm | 7 |
| Workshop | input-table · share | 5 |
| Tracker | input-table · share | 82 |
| Sleep Diary | input-table · share | 30 |
| Reflection | text · share | 8 |
| Conclude | complete · observe · confirm | 95 |
| Quiz | mcq · choose | **0** |
| Practice | 10 activities permitted | **0** |
| Assessment | clinical-instrument · choose · rate | 92 items |
| Check-In | rating-scale · rate · emoji | own renderer |
| Session | listen · observe · measure | proposed |
| Support | crisis-contact · observe · reach | proposed |

## 10.1 How roles map to instruments

| Role | Instrument type | Note |
|---|---|---|
| Lesson, Conclude | *(none)* | `teach` and `close` beats — prose, no instrument |
| Onboarding | `form` | |
| Learning, Quiz | `drill` | **Quiz has 0 live blocks** and declares itself scored; the live scored-drill work is being done under Learning, which is non-scoring. |
| Exercise | `option_pool` | multi-select |
| Checklist | `record` + boolean | |
| Journal, Reflection | `record`, free text | |
| Workshop, Tracker, Sleep Diary | `record` / `nested_record` | **117 of the live blocks are these three.** The whole instrument argument lives here. |
| Check-In | `scale` | already has its own renderer and an orphaned `checkin_scale:` catalog |
| Session | *(none)* | proposed — guided audio, `teach` beat with a completion gate |
| Support | *(none)* | proposed — not a beat; reachable from anywhere. Wire to the §3.2 disclaimer. |
| Assessment | *(separate module)* | drills never touch it, in either direction |

**Practice declares itself for data-capture that saves on exit and has zero live blocks** — the 82 Tracker and 30 Sleep Diary blocks are doing that work under other roles. Practice is either the home for rehearsal-window projections or it should be retired.

---

# 11. Cohorts and groups

Self-paced and cohort-based are not in tension, because a cohort here is **a membership fact, not a schedule.**

| Concept | Is | Is not |
|---|---|---|
| **Cohort** | A set of users who started the same programme around the same time. Used for comparison, reporting, and shared facilitation. | A calendar. It never gates a unit. |
| **Group** | A set of users who can see something of each other — a facilitator's caseload, a corporate batch, a support circle. | A content variant. |

Rules that keep this from breaking the model:

1. **Progression stays per-user.** Unit N+1 opens when *that user* completes Unit N. A cohort never unlocks or withholds content.
2. **Instruments stay user-scoped.** A cohort may aggregate derived values across its members; it never shares rows. The thought dump's 48-hour retention and the journal's privacy promise apply unchanged inside a cohort.
3. **Aggregation is `summarise` at cohort scope.** Mean Sleep Efficiency across a cohort is the same mechanic as across a user's own entries, one level up. No new concept.
4. **A facilitator sees what the group's consent says they see** — and note that today the programme's **5 consent fields are authored and enforced nowhere.** Cohorts make that gap material rather than theoretical: the moment a second human can see a user's rows, unenforced consent is a live problem, not a tidy-up.

---

# 12. Corrections to the source

Structural only. No content written, no line of Kartik's copy changed.

| Defect | Correction |
|---|---|
| Day 4 has no heading; its content sits under Day 3 | Split at *"Day 4: Journaling"* — the string already sits inside Day 3's Conclude. Everything after it is that unit. |
| `Caffine` vs `Caffeine` across two units | One instrument. Once rows key to the instrument rather than matching by string the typo stops mattering structurally. Fix the spelling anyway. |
| The "Leaving Sleep" heading swallowed its opening paragraph | Heading is the title; the rest is body. |
| That unit has no `close` | Structurally missing. Kartik's to write. |
| It renders the wake-up table twice | Delete the duplicate. |
| Schedule column labelled `Qualifier` holds durations | Rename `duration_minutes`. Nothing in either document uses "qualifier" for anything else. |
| Final unit's copy asks for *"the number of times"*; the table collects booleans per weekday | The booleans are right; the count and the 50% threshold are `window_derived` from them. The copy is loose. |
| Intake option: "Between jobs" vs "Unemployed" | Two versions of the same table. Content call — "Between jobs" is the kinder phrasing. |
| Front matter says "18 day programme", twice | Wrong under §1.1 and §2. **Content — Kartik's to change, not mine.** |
| Six units unwritten | Content. No model fills them. |
| Live sleep-diary block missing 2 of 10 fields | Two metrics cannot be computed without `time got out of bed`. |

---

# 13. Decisions locked

| # | Question | Decision |
|---|---|---|
| 1 | Thought-dump retention vs later projections | **No conflict.** Re-collected, never reviewed. 48-hour deletion is binding on the store. |
| 2 | Does `review` allow editing a past entry? | **No**, except within the sitting it was entered. Rows dedupe across sittings. |
| 3 | Instrument identity across programmes | **User-scoped, shared key.** Programmes declare keys and a minimum revision; they never own or fork. |
| 4 | How long is the programme? | **35 units** — corroborated by `duration_weeks: 5` and the component map. 31 authored; the gap is four. |
| 5 | Join cardinality | **1:1, one active pair at a time**, new pair per cycle. |
| 6 | Is the adherence matrix an instrument? | **Yes** — seeded from logged adherence so the user confirms rather than re-enters. |
| 7 | Missed units | **No such thing.** Units advance on completion. Windows count entries. |
| 8 | Do drills touch the scoring engine? | **No**, in either direction. |
| 9 | Content edits mid-flight | **Schema additions live, content edits pinned per enrolment.** |
| 10 | Stimulus Control mapping | **Map was wrong.** That stretch is problem-solving; Stimulus Control gets its own prep + 4 units from the Leaving the Bed content. |
| 11 | Unit of progression | **"Unit", self-paced.** "Day" retired except in quotations and stored data. |
| 12 | Cohorts | **Membership, never schedule.** Progression per-user; instruments user-scoped; aggregation is `summarise` one level up. |

---

# 14. The plan

Five stages. Each one is finishable and leaves the system better than it found it, so the sequence can stop at any stage without stranding work.

### Stage 1 — Prove the model on one programme, on paper

Write the complete 35-unit Sleep Tight spec in this vocabulary: every unit, its beats, its block roles, its instrument projections and modes. Where content exists, map it. Where it does not — four units of Follow Up, the Sleep Diary strand, Sleep Compression — mark the hole and name who fills it.

*Ends when:* one programme is fully specified and every hole has an owner. Nothing is built.

### Stage 2 — Land the key

`exerciseConfig.key` is the single highest-leverage field in the system: 98 of 406 blocks carry one, and the survey's judgment is that every cumulative view is blocked behind it. Backfill keys across the 117 Workshop / Tracker / Sleep Diary blocks so repeated instruments join.

This is pure data work, needs no new UI, and unblocks `review`, `summarise`, the trackers, and the Day-18 style summaries simultaneously.

*Ends when:* every longitudinal instrument has one key across all its appearances.

### Stage 3 — Declare the column model

145 blocks carry `columns`; none is declared anywhere. Lift column sets out of blocks into named instrument schemas with revisions. Wire `scale` blocks to the orphaned `checkin_scale:` catalog while in there.

*Ends when:* two units asking for the same thing reference one schema, and changing a column is one edit.

### Stage 4 — Build `review` and `summarise`

The two missing projection modes. `review` answers the oldest open complaint in the margin. `summarise` unlocks trend charts, the adherence threshold, and — with the §8 arithmetic fixed — Sleep Compression.

*Ends when:* a user can open a sheet they filled earlier, and a chart can be drawn from an instrument without bespoke code.

### Stage 5 — Author the gaps, then generalise

Write the missing units with Kartik. Then test the model against a structurally different programme — Stress Buster or Unburn — and see what breaks. That is the only honest way to find out whether any of this generalises.

*Ends when:* Sleep Tight is complete at 35 units and a second programme has been expressed in the same vocabulary without new primitives.

### Not in the plan, deliberately

Screens and flows. Those are yours. This spec stops at mechanics, constraints and data shape.

---

# 15. Known weak points

Fixable, acknowledged, not blocking.

- **The model has been validated against one programme.** Stress Buster and Unburn are untouched. Stage 5 is where this stops being a guess.
- **The type vocabulary is not closed and its size is not a finding.** `drill` may be an `option_pool` with a scoring flag; `join` may be a `record` with reference columns. Both defensible.
- **`review` has no worked example in the content.** It exists because a margin comment asked for it.
- **Instruments 15–19** are typed from table shape alone, in the thinnest-authored part of the file. **Instruments 0 and 20** have no programme copy.
- **Two consecutive ideation units are byte-identical in the source**, seeds included. Read as two deliberate sessions, which the instructional copy supports. Equally consistent with an unedited copy-paste.
- **Follow Up has seven delivery units budgeted and one authored.**
- **Sleep Compression cannot be built yet.**
- **Consent is authored and enforced nowhere** — tolerable today, not once cohorts exist (§11).
- **The live DB has problems this document does not solve**: every programme stored twice with a frozen unreachable copy, enrolment and progress permanently disagreeing, three duration fields per programme. They are in the survey, they are real, and they are adjacent to this work rather than part of it.

---

# 16. Content inventory

Everything authored in the source, preserved. Nothing here is mine. Where a defect is visible it is noted but **not corrected in the content** — that is Kartik's.

## 16.1 Elicit — sleep statements (instrument #2, `option_pool`, multi-select)

Fourteen options. The pool deliberately mixes positive and negative statements, so selecting is itself a disclosure.

🍉 My mind replays every mistake I've made · 📞 I feel my loneliness during the night · 😊 I wake up refreshed and ready for the day · 💭 My dreams were vivid, and I woke up with a smile · 💤 Last night's sleep was soothing and uninterrupted · 🤸 I struggle to fall asleep, tossing and turning · 😨 Worries keep my mind active · 🕜 Ticking of the clock irritates me as I lie awake · 💢 I woke up groggy and in a foul mood · 🔋 I am well rested and full of energy · 😪 I am still so tired · 😩 Why can't I ever fall asleep? · 🫂 My body thanks me. · 💪 I'm ready for anything.

*Margin:* make it fifteen, and add an "other" box.

## 16.2 Thought/feeling drill (instrument #3, `drill`, 6 prompts, non-scoring)

Six situations, each with one thought and one feeling. **Item 1 is answer-revealed** — the labels `FEELING` and `THOUGHT` are printed on it and on no other.

| Prompt | Pair |
|---|---|
| Tell me about the issue of power cuts in your city… | "It makes me furious!" `FEELING` · "It makes things really inconvenient and difficult for a lot of us." `THOUGHT` |
| Tell me about your schooldays… | "I had such a good time there with my friends. I miss those days!" · "It makes me nostalgic." |
| Tell me about the last cricket match you watched… | "I was so excited and happy that our team won!" · "We won the tournament after a really long time. The spinners played really well!" |
| A friend of yours finally bagged their dream job… | "It is so great! They had worked so hard for this job. I am sure they will excel and thrive in the role." · "I am so happy for them!" |
| Tell me about the time when you gave a presentation in front of your class | "I am definitely going to mess this up. I wish I had worked on my presentation instead of playing counterstrike with my friends" · "I am so scared and nervous" |
| Tell me about the time when you went to a relatives wedding reception | "Why is everyone teasing me about getting married? I am so not ready for this." · "This is getting really annoying now." |

## 16.3 Thought record (instrument #4, `record`) — seed rows

Two seeded rows, carried unchanged through every appearance.

| Time | Situation | Thoughts | Feelings | Response | Affected sleep |
|---|---|---|---|---|---|
| 9:00 PM | home office setup, a late evening emergency call with the team | This is ridiculous! Why do they expect us to work till this hour! | angry, irritated | Worrying about work | yes |
| 7:00 AM | Making tea | I did not get enough sleep! | Tired, worried | Making strong tea to get fresh | no → **NA** later |

The second row's judgment changes from `no` to `NA` when the enum widens — the same seed, re-answered under the new option.

## 16.4 Journal-entry drill (instrument #5, `drill`, 4 options, all correct)

Four candidate journal entries. *Margin:* **"all should come in as a right answer."**

1. "Today was one of those days—the kind that leaves you drained, questioning your choices…"
2. "Today was relentless—a missed alarm, chaotic commute, and a malfunctioning coffee machine…"
3. "Today was bad. Everything was bad. I hope tomorrow will be good"
4. "I had a great day today! I am so excited for tomorrow!"

The point is that a terse entry and a florid one are equally valid. A scored version of this block teaches the opposite of what it intends.

## 16.5 Distractor drill (instrument #7, `option_pool`, multi-select)

Ten items. **Three are not distractors** — the comfortable mattress, the soft bedsheet, and arguably the barking dogs are there to be discriminated, not selected.

Room is too hot · The pillow is too hard · The room is too bright · I overate during dinner · I had a coffee right before going to bed · The light is on · Too many thoughts in my mind · The mattress is nice and comfortable · The bedsheet is nice and soft · Dogs are barking on the street outside

*Margin:* needs checkboxes.

## 16.6 Distractors (instrument #8, `record`) — seed rows

Two seeds, deliberately one of each class: **Scrolling on social media** (in control) · **Weather** (not in control).

## 16.7 Brainstorming rules (`teach` beat, verbatim)

1. There are no right or wrong ideas
2. Do not be critical of any idea while writing
3. Write down every idea. be as visual as possible
4. Build-down on another idea
5. stay focussed on the topic
6. abide by the time limit

Closing line: *"Are you ready to start brainstorming?"*

Rules 2 and 6 are the `evaluation_allowed: false` and `time_box` properties in §6.9, stated to the user in their own words.

## 16.8 Ideation (instrument #9, `nested_record`) — seed

One parent with four children, which is what establishes the shape:

**Doomscrolling on instagram** → uninstalling Instagram each night · Keeping my phone away · Using low brightness and night mode · Going off instagram completely

*Margin:* cap at ten ways per disturbance.

## 16.9 Ideation, converged (revision r3) — seed

Pros and cons attach **per way**; the balanced solution attaches **per parent** — only the first row carries one.

| Way | Pros | Cons |
|---|---|---|
| uninstalling Instagram each night | a major distraction will be reduced | its a unnecessary hassle |
| Keeping my phone away | will prevent usage of other distractions as well! | i put my alarms on my phone |
| Using low brightness and night mode | will be better on the eyes as bright lights also make going to sleep difficult | the distraction still persists though |
| Going off instagram completely | that will be a major distraction reduced and i need to reduce social media usage and presence | sounds a bit extreme. I use it for staying in touch with friends and a lot of good content! |

**Balanced Solution** (parent-level): *"Maybe I will get an alarm clock and keep the phone away at night"*

## 16.10 Ritual options (instrument #10, `option_pool`)

Thirteen: Drinking turmeric milk · Skincare · Reading a book · Meditation · Praying · Listening to music · Oiling your hair · Washing your feet · Dimming the lights · Putting on an incense stick · Journalling · Taking a bath · Massaging your hands and feet

## 16.11 Bedtime ritual (instrument #11, `record`) — seed rows

Four seeded, described in copy as *"some essential points from our end to ensure good sleep quality"*:

No Caffeine 4 hours before sleep · No exercise 3 hours before sleep · Lights dulled or switched off 30 mins before sleep · No Mobile usage 30 minutes before bedtime

**Defect:** the later appearances carry only three of the four — *No Mobile usage* is dropped, and *Caffeine* is spelled `Caffine` in one of them. One instrument, three spellings of its seed set.

## 16.12 Wake ritual (instrument #15, `record` + time) — seed rows

Header field: **My Wake-up Time**. Then six seeded habits under *"My wake time habits"*:

No cellphone time for 15 mins after waking · Standing and stretching · Washing face · Getting sunlight or fresh air · Making bed · Drink a glass of water

Plus five empty rows for the user.

## 16.13 Bed separation (instrument #18, `record`) — seed

One seed: *"I can use 2 completely different sheets"*

The `teach` beat around it gives the accommodation branch for small homes — different sides of the bed, different sheet textures and colours, a floor cushion with the bed foot as a table, a desk with the bed as a chair.

## 16.14 Habit adherence (instrument #19, `record`, fixed rows) — structure

**Two grids stacked**, not one.

Grid A — a Day 1–7 boolean strip, unlabelled.

Grid B — four habits × seven weekdays:

| Habit | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
|---|---|---|---|---|---|---|---|
| Sleep Hygeine *(sic)* | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Bedtime Ritual | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Journalling | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Wake-up Ritual | — | — | — | ☐ | ☐ | ☐ | ☐ |

**The Wake-up Ritual row starts on Thursday, not Monday** — three cells are blank rather than false. That is not a defect: the wake ritual is introduced later than the other three, so it has fewer days available. It means **a habit carries its own start point**, and the 50% threshold must be computed against days-available, not against seven. Worth stating because a naive implementation marks every user as failing that row.

Also: `Sleep Hygeine` is misspelled, and the two stacked grids have no stated relationship.

## 16.15 Closing lines (`close` beats, verbatim)

Each names what comes next. Kept because they are the clearest evidence of the contract in §9.

- *"Thanks for the insights on your sleep! We shall meet tomorrow and explore more."*
- *"That's all for today. Now let's get to work by tracking our thoughts and feelings. We will meet tomorrow and find out what's stopping us from sleeping well."*
- *"So today was short, sweet but extremely vital. When you selected a thought as yes, you were able to triangulate the things that affected your sleep. Tomorrow onwards, we will work on ways to manage those thoughts."*
- *"So! How did you like the task? … when we meet next, we will work on understanding other factors that keep us awake."*
- *"Great! We have identified things that damage our sleep quality. Tomorrow, we will work on ways to reduce these distractors."*
- *"Keep your creative juices running! We have one more day to go."*
- *"Phew! Those were A LOT of ideas! Now take some rest. We will work tomorrow to come up with a more practical and doable solution."*
- *"Now that you have developed skills to clear your mind and think through the options, let's move on to how bedtime rituals help with sleep."*
- *"Now that we have been able to develop a sleep ritual for ourselves, let's give them a try."*
- *"Good Job with today! Let's continue it for the next few days..."*
- Final: *"Well! This is the end of your programme… Do continue with the trackers and assessments. They are always there at your service! In case you feel that your stress is contributing to your sleeplessness, We would recommend you subscribe to our stressbuster programme."*

Every one of these says "tomorrow" or "day". **Under §2 they all need rewriting to a self-paced voice** — the single largest copy consequence of retiring the calendar, and it is Kartik's, not mine.

---

# 17. Proposed programme structure — 35 units

A proposal, not a decision. `✅ authored` · `◐ partial` · `⬜ gap` · `⚕ needs a clinical call`

## 17.1 How it is built

Three layers run at once, which is why a flat list of 35 never reconciled:

1. **The spine** — the unit's own teaching and work. One component owns it.
2. **The standing set** — instruments collected every sitting once introduced, whatever the spine is doing. This is how Sleep Diary and Sleep Compression occupy "days" in the component map without owning units.
3. **Rehearsal windows** — stretches where the spine is empty and the standing set *is* the unit.

## 17.2 The standing set

| Instrument | Enters at | Collected |
|---|---|---|
| #0 Sleep diary | U2 | every sitting thereafter |
| #20 Mood log | U2 | every sitting thereafter |
| #4 Thought record | U4 | every sitting from U4 |
| #6 Thought dump | U6 | every sitting from U6, always `collect`, 48h retention |
| #11 Bedtime ritual | U12 | every sitting from U12 |
| #15 Wake ritual | U21 | every sitting from U21 |

That is the answer to *"can we provide a sleep tracker throughout the programme?"* — it is not a unit, it is a standing set member.

## 17.3 The spine

| Unit | Title | Component | Beats | State |
|---|---|---|---|---|
| **0** | Welcome to Sleep Tight | — | teach · work(#1 `form`) | ✅ §3 |
| **1** | Let's Begin | — | work(#2 `collect`) · close | ✅ |
| **2** | Your sleep, measured | Sleep Diary *prep* | teach · work(#0 `collect`) · close | ⬜ |
| **3** | Reading your own nights | Sleep Diary | teach · work(#0) · close | ⬜ ⚕ |
| **4** | Thoughts and feelings | Thoughts *prep* | teach · rehearse(#3) · work(#4 `collect`) · close | ✅ |
| **5** | Digging deeper | Thoughts | work(#4 `extend` +affected_sleep) · close | ✅ |
| **6** | Journalling to clear the mind | Thoughts | teach · rehearse(#5) · work(#6 `collect`, 5-min box) · close | ✅ |
| **7** | What the record is telling you | Thoughts | work(#4 `review`) · close | ⬜ |
| **8** | Distractions and control | Stimulus Control *prep* | teach · rehearse(#7) · work(#8 `collect` → `extend` +in_my_control) · close | ✅ |
| **9** | Ideation | *problem-solving* | teach(rules §16.7) · work(#9 `collect`, 3-min box, no evaluation) · close | ✅ |
| **10** | Ideation, continued | *problem-solving* | work(#9 `collect`, no evaluation) · close | ✅ |
| **11** | Part of the solution | *problem-solving* | work(#9 `extend` +pros/cons/balanced) · close | ✅ |
| **12** | Bedtime rituals | Sleep Habits *prep* + Relaxation | teach · work(#10, #11 `collect`) · close | ✅ |
| **13** | Forming habits — piggybacking | Sleep Habits | teach · work(#12, #13 `collect`; #14 `join`) · close | ✅ |
| **14** | Rituals in action | Sleep Habits | work(standing set) · close | ✅ |
| **15–20** | *Rehearsal window* | Sleep Compression | work(standing set) · close | ◐ ⚕ |
| **21** | Leaving sleep | Stimulus Control | teach · work(#16, #17, #15 `collect`) · close | ✅ |
| **22** | Leaving the bed | Stimulus Control | teach · work(#18 `collect`) · close | ✅ |
| **23** | Your bed, your room | Stimulus Control | teach · work(#18 `extend`) · close | ⬜ |
| **24–32** | *Rehearsal window* | Follow Up | work(standing set) · close | ⬜ ⚕ |
| **33** | How did I do? | Follow Up | work(#19 `summarise`-seeded) · close | ✅ |
| **34** | Conclusion | Follow Up | teach · work(commitment) · close · route onward | ✅ |

## 17.4 Tally against the clinical budget

| Component | Budget | Proposed | Note |
|---|---|---|---|
| Sleep Diary | 7 | 2 spine + standing from U2 | The other 5 are exposure, not units |
| Thoughts | 4 | 4 (U4–U7) | matches |
| Sleep Compression | 7 | 6 (U15–U20) + prep inside U2 | ⚕ prep may need its own unit |
| Stimulus Control | 5 | 4 (U8, U21–23) | one short |
| Sleep Habits | 3 | 3 (U12–14) | matches |
| Relaxation | 1 | overlaps U12 | matches the map's "overlap" |
| Follow Up | 8 | 10 (U24–34, minus overlap) | over budget; U24–32 is the softest part of this proposal |

The tally does not land exactly, and forcing it to would be false precision. The two components whose allocation is genuinely uncertain are the two with no authored content.

## 17.5 What this proposal adds that was not in the source

Four new units, all gaps:

- **U2 · Your sleep, measured** — the diary has to be taught before it can be a standing instrument. Nothing in the source introduces it.
- **U3 · Reading your own nights** — the first `summarise`: show the user their own Sleep Window and Efficiency. ⚕ This is where Sleep Compression's threshold gets explained, and I cannot set that threshold.
- **U7 · What the record is telling you** — the first `review`, and the direct answer to *"he cannot go back to asses a sheet."* Fits naturally after three sittings of thought records.
- **U23 · Your bed, your room** — Stimulus Control is budgeted 5 units and the source authors roughly 2. This is the gap, not a new idea.

## 17.6 What I could not decide

- **⚕ The Sleep Compression algorithm and its threshold.** U15–U20 is a compression strand with no specified mechanism. Standard practice restricts time in bed until efficiency clears a threshold, but the number and the titration rule are clinical and are not in either document.
- **⚕ U24–U32, nine units of Follow Up** with one authored between them. Whether that is nine units of rehearsal, or fewer units with a longer standing-set stretch, is a programme decision.
- **⚕ Whether U3 belongs that early.** Showing a user their sleep efficiency in the first week may be discouraging before any technique has landed. Clinical call.
- **The 18-day copy.** Every `close` says "tomorrow", the front matter says "18 day programme" twice, and the schedule table is written in days. All of it needs a self-paced rewrite, and none of it is mine.

## 17.7 Two things this structure fixes for free

**The rehearsal windows stop being mysterious.** U15–20 and U24–32 have no spine, and that is not a content gap — the standing set is the unit. The source's single schedule row reading `Day 10-Day 17 | Practicing Rituals` was describing exactly this and had no way to say so.

**The programme stops needing sixteen hand-duplicated units.** The live database carries 16 units that duplicate their content by hand because `repeat` was never wired. Under the standing set, those sixteen are one declaration.
