# iKan — The data model, answered

**Date:** 2026-09-11
**Sources:** `Equip: Sleeplessness 1` (the program, 5,526 words) + `Equip: Sleeplessness 2` (a PRD, 1,679 words)
**Answers:** §4 (the model), §5 (the twelve comments), §2 (defects, corrected), §3 (day grammar, normalised)

---

# PART 0 — What Sleeplessness 2 actually is

Read it before weighting it. The document is two things stapled together, and they are not equally reliable.

**The prose (§1–§8) is a generated PRD.** It calls the product *"RestfulMind Journey"* — a name that appears nowhere else in either file. The user stories, limitations and success metrics are the generic set any PRD generator produces. Useful as a checklist, near-zero as evidence of intent.

**The three unlabelled tables at the end are real clinical material**, and they are the most valuable thing in either document. They were pasted in under bare headings (*Daily Sleep Diary · Sleep Metrics · Sleep Compression*) and never written up. **The Sleep Compression heading has no table under it at all** — the technique is named three times across the file and never specified.

Everything below that leans on Sleeplessness 2 leans on those three tables, not on the prose.

## 0.1 The programme is 35 days, not 18

The CBT-I component map:

| Component | Prep | Days | Mapped to |
|---|---|---|---|
| Sleep Diary | 1 | 6 | every day, via the diary |
| Thoughts (cognitive restructuring) | 1 | 3 | Day 2, 3, 4 |
| Sleep Compression | 1 | 6 | via the diary |
| Stimulus Control | 1 | 4 | Day 5, 6, 7, 8 |
| Sleep Habits | 1 | 2 | Day 9, 10 |
| Relaxation | 1 | overlap | Day 9, 10 |
| Follow Up | 1 | 7 | — |
| **Total** | **7** | **28** | **35** |

So the authored 18-day document is a **partial build of a 35-day clinical protocol**. That reframes the six "unwritten" days entirely — they are not gaps in an 18-day program, they are the visible edge of a 35-day one that was never finished.

**Two components in that map do not match the authored content:**

- *Stimulus Control → Days 5–8.* In the authored program, Days 5–8 are distractors → ideation → solution. Actual stimulus control ("our bed is a space we must limit only to our sleep") is **Day 14**. The map and the content disagree.
- *Sleep Diary → every day.* **There is no sleep diary anywhere in the authored program.** Not one instrument. This is exactly what comment [l] asked for — *"can we provide a sleep tracker throughout the programme?"* — and the component map shows it was always meant to be the spine.

The diary is the missing backbone. Two of the seven clinical components (Sleep Diary, Sleep Compression) run entirely through it, and neither exists in the content.

## 0.2 The sleep metrics are specified, and one formula is wrong

| # | Metric | Calculation as written | Verdict |
|---|---|---|---|
| 1 | Sleep Window | duration between #8 and #1 | correct |
| 2 | Time Awake | #4 + #6 + duration between #8 and #7 | correct |
| 3 | Time Asleep | `Time Awake − Sleep Window` | **inverted — always negative** |
| 4 | Time in bed before sleeping | *(blank)* | **unspecified** |
| 5 | Sleep Efficiency | time asleep / sleep window × 100 | correct, and depends on #3 |

**#3 must be `Sleep Window − Time Awake`.** As written it yields a negative number for every user, and #5 divides by it, so Sleep Efficiency is wrong too. Sleep Efficiency is the value that drives Sleep Compression — the whole technique is "restrict time in bed until efficiency clears a threshold." One inverted subtraction takes out two of the seven clinical components.

#4 is trivially `#3 − #1` from the diary fields but is left blank; it should be stated rather than inferred.

---

# PART A — The answer to §4

## A1. Why the author's numbering cannot be used as written

`Data i01`–`i12` is the right *idea* and the wrong *artifact*.

**It contradicts itself.** The daily-activities table is labelled `Data i10 + i11+` in one place and `Data i11` in another, on the same day. `i11` denotes two different instruments.

**It misses revisions it did make.** The thought record's judgment column is `(Yes, No)` on Day 3 and `(Yes, No, NA)` on Days 10 and 14. The enum widened; no `i04++` was ever written. Silent schema drift inside a notation built to catch schema drift.

**It stops where authoring thins.** Days 14 and 18 introduce seven more instruments with no ids. The sleep diary — the spine, per §0.1 — has no id because it has no content.

Keep the concept. Discard the labels.

## A2. Three concepts, not one

> **Instrument** — a named, typed thing the user fills. Owned by the *program*, never by a day. Stable id. Survives the program's end.
>
> **Revision** — a versioned schema of one instrument. Adding a field, widening an enum, or adding a constraint mints a revision. Prior rows survive and stay addressable.
>
> **Projection** — a day placing an instrument on screen in one **mode**: `collect` · `extend` · `review` · `summarise`.

The author's `+` is a Revision. The author's `+` *between two ids* is a Projection over a join. One character, two operators — the third reason the notation broke.

## A3. Canonical instrument registry

20 instruments. The author numbered 12; 7 are unnumbered; 1 (the diary) exists only in the PRD.

| # | Instrument | Type | Author's id | Appears | Revisions |
|---|---|---|---|---|---|
| 0 | **Sleep diary** | `log` + derived | *(none — PRD only)* | **every day** | 10 fields, 5 derived metrics |
| 1 | Intake | `form` | i01 | start | — |
| 2 | Sleep statements | `option_pool` | i02 | D1 | — |
| 3 | Thought/feeling drill | `drill` | i03 | D2 | 6 prompts, item 1 answer-revealed |
| 4 | **Thought record** | `log` | i04, i04+ | D2, D3, D10, D14 | **r1** 5 cols · **r2** +`affected_sleep{yes,no}` · **r3** enum → `{yes,no,na}` |
| 5 | Journal-entry drill | `drill` | i08 | D4 | non-scoring, all answers correct |
| 6 | **Thought dump** | `log` | i09 | D4, D10, D14 | retention 48h |
| 7 | Distractor drill | `drill` | i05 | D5 | contains deliberate non-distractors |
| 8 | **Distractors** | `list` | i06, i06+ | D5 | **r1** free list · **r2** +`in_my_control:bool` |
| 9 | **Ideation** | `nested_list` | i07+/++/+++ | D6, D7, D8 | **r1** collect · **r2** collect again · **r3** +`pros`,`cons` per way, +`balanced_solution` per parent |
| 10 | Ritual options | `option_pool` | i10 | D9 | 13 options |
| 11 | **Bedtime ritual** | `checklist` | i11 | D9, D10, D14 | **r1** list only · **r2** +`done:bool` |
| 12 | Daily activities | `list` | *i11 / i10+i11+ (conflict)* | D9 | `activity:text` + `device_possible:bool` |
| 13 | Target habits | `list` | i12 | D9 | — |
| 14 | Piggyback pair | `join(12,13)` | i10+i11/i12 | D9 | — |
| 15 | Wake ritual | `checklist` + time | — | D14 | mirror of #11 |
| 16 | Successes | `list` | — | D14 | — |
| 17 | Energisers | `list` | — | D14 | — |
| 18 | Bed-separation ideas | `list` | — | D14 | — |
| 19 | Habit adherence | `matrix` | — | D18 | habit × weekday, boolean |
| 20 | Mood log | `scale` | *(none — PRD only)* | D10–17 | 1–5 on waking |

**Bold** = longitudinal. Six of twenty, and they carry the program.

## A4. The type system — ten types

I said nine last time and said that if a tenth appeared the closed set was wrong. A tenth appeared: the PRD's sleep-quality field (*Very Poor → Very Good*) and mood field (1–5) are **ordinal scales with a numeric value used in computation**, which `option_pool` does not model.

| Type | Shape | Instances |
|---|---|---|
| `form` | typed fields, some account-prefilled | 1 |
| `option_pool` | fixed options, multi-select, optional "other" | 2, 10 |
| `drill` | prompt → options, **non-scoring**, item 1 revealed | 3, 5, 7 |
| `log` | append-only rows, timestamped, unbounded | 0, 4, 6 |
| `list` | flat rows, user-extended, optionally seeded | 8, 12, 13, 16, 17, 18 |
| `nested_list` | parent → children, child cap | 9 |
| `checklist` | seeded rows + per-row boolean | 11, 15 |
| `matrix` | fixed rows × fixed columns of booleans | 19 |
| `join` | two instruments paired row-wise | 14 |
| `scale` | ordinal, labelled, numerically valued | 20, and one field of 0 |

**Derived fields are a property, not a type.** The five sleep metrics are computed columns on instrument #0 — expressions over its own fields. Any `log` may carry them. Getting this wrong (making "metrics" its own instrument) is how the sleep diary and the sleep metrics end up as two things that drift apart.

## A5. Revision rules

1. A revision **adds**; never removes, never retypes.
2. **Widening an enum is a revision.** `{yes,no}` → `{yes,no,na}` is r3 of #4, and it matters because r2 rows have no `na` and must not be coerced.
3. New fields on existing rows are **null, not backfilled — but retroactively fillable.** Day 3's entire exercise is judging Day 2's rows. Never fork.
4. Revisions are ordered and program-scoped. Day N reads the instrument at its latest revision as of Day N.
5. Adding a **constraint** is a revision — the 10-ways-per-disturbance cap is r2 of #9.

## A6. Composition rules

- **Assembly** — several instruments on one screen, independent. "My Routine" (D10, D14) is #11 + #6 + #4. No relationship; three projections.
- **Join** — two instruments paired row-wise into a new instrument *with its own identity*. Piggybacking (#14) pairs a daily activity with a target habit. It persists, because the user's commitment lives in it.

Rule: if the pairing carries meaning the user would lose, it is a join and gets an id. If it is only adjacency, it is an assembly and gets none.

## A7. Projection modes

| Mode | Writes | Shows prior | Used by |
|---|---|---|---|
| `collect` | new rows | no | D2 thought record, D6 ideation |
| `extend` | new rows + fields added this revision | yes, editable | D3 (+affected_sleep), D8 (+pros/cons) |
| `review` | nothing | yes, read-only | D10 / D14 "My Routine" |
| `summarise` | nothing | aggregated across rows | PRD §3.3 charts, D18 adherence |

`review` and `summarise` are the two that do not exist today. `review` is why Days 10 and 14 cannot be built. `summarise` is why the PRD's *"simple charts to show trends in sleep duration, quality and mood over time"* has nowhere to live — and it is the mode Sleep Compression needs, since compression is a decision made from a rolling window of Sleep Efficiency.

## A8. Block-level properties the content demands

Authored per projection, not global:

- `time_box` — 5 min (thought dump), 3 min (ideation). Hard stop.
- `evaluation_allowed: false` — Days 6–7. No pros/cons affordance may render.
- `scoring: none` — all three drills. #5 is annotated *"all should come in as a right answer."*
- `seed_rows` — authored content, visually distinct from user rows (*"highlght bgray"*).
- `child_cap` — 10 ways per disturbance.
- `retention` — 48 hours on the thought dump, **promised to the user in copy**, so the store must honour it or the copy is a lie.
- `unlock: sequential` — PRD §3.2, each day unlocked in order.
- `completion` — per-day "mark as complete" state, distinct from whether instruments were filled.
- `reminder_binding` — PRD §3.4 wants bedtime-ritual reminders, which means a schedule derived from instrument #11's own contents. An instrument can be a notification source.

---

# PART B — The twelve comments, answered

| # | Comment | Answer |
|---|---|---|
| a | *(assignment only)* | No action. |
| b | *bhar dena, export karunga for .xml* | Superseded. The A3 registry is the export contract; XML is just transport. |
| c | *What is a qualifier? How is it different from duration?* | **There is no qualifier.** The column holds durations and nothing else in either file uses the word. Rename `duration_minutes`, drop the concept. |
| d | *emojis* | A property of `option_pool` options — optional leading glyph. #2 uses it on all 14; nothing else does. Not a global text feature. |
| e | *make it 15. add box to add other____* | Two changes to #2: one more authored option (Kartik's), and `allow_other: true` on the type — available to #2 and #10 alike. |
| f | *images* | Decorative only; all 4 are stock illustrations carrying no content. They belong to the day, not to any instrument. Licensing unchecked. |
| g | *(assignment only)* | No action. |
| h | *need checkboxes here* | #7 is `option_pool`, multi-select by definition. Answered by the type. |
| i | *3 min countdown timer?* | `time_box: 180s` on the D6 projection. Not a convenience — an untimed brainstorm drifts into evaluation, which D8 owns. |
| j | *(assignment only)* | No action. |
| k | ***cannot go back to asses a sheet*** | **`review` mode.** Root cause is instruments being scoped to the day that created them. Scope to the program and it stops being a feature request. |
| l | *sleep tracker throughout the programme?* | **Instrument #0, and Sleeplessness 2 proves it was always the spine** — the component map runs Sleep Diary and Sleep Compression through it for the full 28 days. It was never written into the content. This is the single largest gap in the program. |

Nine of twelve are answered by the type system rather than by bespoke features. [k] and [l] are one bug seen twice.

---

# PART C — §2 defects, corrected

Structural corrections only. **No content written, no line of Kartik's copy touched.**

| Defect | Correction |
|---|---|
| Day 4 heading missing; content under Day 3 | Split at *"Day 4: Journaling"* — the string already sits inside Day 3's Conclude. What follows is Day 4 entire. |
| `Caffine` (D10) vs `Caffeine` (D14) | One instrument (#11). Text is not identity — once rows are keyed to the instrument the typo stops mattering structurally. Correct the spelling. |
| Day 14 H1 swallowed its opening paragraph | Heading is `Day 14: Leaving Sleep`; the rest is body. |
| Day 14 has no Conclude | Flagged for Kartik. Not mine to write. |
| Day 14 repeats the wake-up table | Delete the duplicate. #15 projects once. |
| `Qualifier` holds durations | Rename `duration_minutes`. |
| Day 12 placeholder twice | Moot — unwritten day. |
| **Sleep metric #3 inverted** | `Sleep Window − Time Awake`. Currently negative for every user, and #5 depends on it. |
| **Sleep metric #4 blank** | `#3 − #1` from the diary fields. State it. |
| **Sleep Compression never specified** | Named three times, defined nowhere. Needs its algorithm and its threshold before it can be built. |
| Stimulus Control mapped to D5–8 but authored on D14 | The component map is wrong, or the content is misplaced. One has to move; clinical call, not mine. |

## The Day 10–17 contradiction — resolved

Sleeplessness 2 settles it. §3.3 is titled *"Sleep & Mood Monitoring (Days 10-17)"* — the window is **logging**, not lessons.

Days 10–17 are a **rehearsal window**: instruments #0, #4, #6, #11 and #20 projected in `collect` every day, unchanged. Day 14 is an authored day that also sits inside the window and overrides the default for that day.

No repeat primitive needed. A window with a default projection set, and days that may override it.

---

# PART D — §3 day grammar, normalised

Observed: `Lesson? → Task? → Exercise+ → Conclude`, with Day 1 missing Lesson, Day 9 inverting Task/Exercise twice, Day 14 missing Conclude.

Normalised, a day is **an ordered list of beats**:

| Beat | Carries | Optional |
|---|---|---|
| `teach` | prose, images | yes |
| `rehearse` | a `drill`, non-scoring | yes |
| `work` | a projection of an instrument in a mode | **no** — a day without one is not a day |
| `close` | prose naming what the next day does | no |

Day 9 stops being an anomaly — it is `teach · work · teach · work · work · close`. Day 1 is `work · close`. Day 14's missing `close` becomes a validation error, not a stylistic wobble.

Keep one rule from the source: **every authored `close` names tomorrow.** The six stub days are the only ones that do not, which is exactly what makes them read as unfinished.

---

# Honest limits

- **Still n = 1.** Two documents, one program. Ten types and four modes cover it completely; whether they cover Stressbuster is untested, and per instruction I have not looked.
- **I was wrong to close the type set at nine.** The tenth (`scale`) arrived with the second document. Ten is where it stands today, not where it is proven to end.
- Sleeplessness 2's prose is generated boilerplate and I have given it almost no weight. If any of it reflects a real decision someone made, I have discounted that decision — worth a second read by whoever wrote it.
- Instruments 15–19 are inferred from table shape in the thinnest-authored section of the file. #0 and #20 exist only as PRD bullets and three pasted tables; neither has a single line of program copy.
- **The one question neither document answers:** does `review` permit editing a past entry? Comment [k] asks for access, not mutation. If entries stay editable on re-entry, `extend` already covers it and `review` collapses into it.
