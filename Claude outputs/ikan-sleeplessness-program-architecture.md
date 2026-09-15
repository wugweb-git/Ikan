# iKan — Sleep Tight: what the program actually is

**Date:** 2026-09-11
**Source:** `Equip: Sleeplessness 1`, unfiltered
**Supersedes:** the structural audit, which measured the container and missed the intervention.

---

## 0. The short version

This is a properly built CBT-I workbook. The 18 days are not 18 lessons — they are **one funnel with three deliberate returns**, and the returns are the therapy. The user's own data is the material being worked; each phase hands the next phase an artifact the user made themselves.

That is the structure worth extracting. Everything else in the doc is scaffolding around it.

---

## 1. The clinical spine

| Phase | Days | What it does to the user |
|---|---|---|
| **Elicit** | 1 | Surface the complaint with zero friction. No teaching, no typing — just pick statements that sound like you. |
| **Discriminate** | 2 | Install one distinction (a thought is a sentence, a feeling is a word). Rehearse it on neutral material. Only then apply it to your own night. |
| **Instrument** | 2–3 | Start a thought record. Then **come back to yesterday's sheet and add a judgment column** — did this affect my sleep. |
| **Release** | 4 | Give a pressure valve (timed thought dump) that is explicitly *not kept*. |
| **Classify** | 5 | Install a second distinction (in my control / not). Rehearse it. Apply it to your own list. |
| **Diverge** | 6–7 | Brainstorm under enforced rules: no criticism, timer on, quantity over quality. Two days, on purpose. |
| **Converge** | 8 | Return to the ideas sheet, add Pros / Cons / Balanced Solution. |
| **Install** | 9 | Rituals, then **piggybacking** — stack the new habit onto an activity you already do. |
| **Rehearse** | 10–17 | Run it. Same instruments, every day. |
| **Wake** | 14 | Stimulus control — the bed is for sleep only, with an accommodation branch for small homes. |
| **Graduate** | 18 | Score your own week at 50%, and keep the instruments. |

Read the column on the right and the sequencing is obvious: you cannot converge before you diverge, you cannot classify distractors before you have listed them, you cannot judge a thought's effect on sleep before you have recorded the thought. **The day order is a dependency graph, not a playlist.**

---

## 2. The four teaching mechanics, used repeatedly

These recur often enough to be the program's actual grammar — more so than Lesson/Task/Exercise/Conclude, which is just how they are laid out on the page.

### 2.1 Teach on neutral ground, then turn it on yourself

Day 2 teaches thought-vs-feeling using a post office queue and a cricket match. Day 5 tests distractor-spotting on a generic list. Only after the concept is rehearsed on someone else's material does the user apply it to their own night.

The rehearsal step is explicitly **non-scoring** — the doc annotates it: *"(note: all should come in as a right answer. no right or wrong answers for other lesson questions)"*. It is a mirror, not a quiz.

### 2.2 The seed row is a teaching device

*"We have done the first one for you."* · *"We have filled in a few examples."* · *"Some ideas in the example might sound a bit unconventional, but we did not ignore them, we noted them regardless."*

That last one is not sample data — it is **permission**, delivered as data. The example exists to widen what the user thinks is an acceptable answer. A generic "placeholder text" treatment destroys it.

### 2.3 Time-boxing is the intervention

5-minute thought dump. 3-minute ideation sprint. *"abide by the time limit."*

The timer is not UI garnish. Unbounded, a thought dump becomes rumination and a brainstorm becomes evaluation. The clock is what makes the exercise therapeutic rather than harmful.

### 2.4 Separation of divergent and convergent thinking

Days 6–7: *"There are no right or wrong ideas. Do not be critical of any idea while writing."*
Day 8: now add Pros, Cons, and a Balanced Solution.

Two days of generating before one day of judging, and the split is enforced by the calendar. **A tool that helpfully collapses these onto one screen deletes the mechanism.** This is the clearest example of the content encoding a constraint the system has to honour.

---

## 3. The central idea: the artifact accumulates

Three separate times, the user re-enters a sheet they already filled and works it further:

```
Day 2   thought record                      5 columns
Day 3   + "did it affect my sleep"          6 columns   ← same sheet, new lens
Day 10  read it back while practising
Day 14  read it back again

Day 5   list your distractors               free list
Day 5   + "in my control (true/false)"      classified  ← same list, new lens

Day 6   ideas                               generate
Day 7   more ideas                          generate    ← same sheet, second session
Day 8   + pros / cons / balanced solution   evaluate    ← same sheet, new lens
```

And on Day 9, two lists the user built separately get **joined**: *activities I already do* × *habits I want*, producing the piggyback pairing. The author flagged the difficulty in the margin: *"Issue while mapping to pre exiting lists."*

This is why the content team invented `Data i01`–`i12` with `+` suffixes and a `+` join operator. They were not inventing a data model for fun. **They were describing the only thing that makes the program work, in the only notation available to them.**

The closing line of Day 18 makes it explicit: *"Do continue with the trackers and assessments. They are always there at your service!"*

> The program does not own the user's data. The program is a scaffold for installing instruments into the user's permanent life, and then getting out of the way.

That single sentence is the answer to comment [l] (*"can we provide a sleep tracker throughout the programme?"*) and comment [k] (*"bhai he cannot go back to asses a sheet"*). Both are the same request: instruments outlive days.

---

## 4. The reusable program type this yields

Strip the sleep content and the shape that remains is general:

```
ELICIT       low-friction surfacing of the complaint          (non-scoring, pick-list)
  ↓
DISCRIMINATE teach a distinction → rehearse neutral → apply    (repeatable, n times)
  ↓
INSTRUMENT   open a longitudinal record the user keeps filling
  ↓
RE-LENS      return to that record, add a dimension            (repeatable, n times)
  ↓
DIVERGE      generate under no-criticism + time-box
  ↓
CONVERGE     evaluate the generated set, commit to one
  ↓
INSTALL      bind the commitment to an existing daily anchor
  ↓
REHEARSE     run the instruments, unchanged, for n days
  ↓
GRADUATE     self-score against a stated threshold, keep the instruments, route onward
```

`DISCRIMINATE` and `RE-LENS` are the loop bodies — a longer program runs them more times, not a different shape. Sleeplessness runs DISCRIMINATE twice (thought/feeling, control/no-control) and RE-LENS three times.

Day 18 also routes outward — *"we would recommend you subscribe to our stressbuster programme"* — so programs form a graph, with the edge conditional on what the user reported.

---

## 5. What the tooling must not break

These are constraints derived from the therapy, not from UI preference. Each one is currently violable.

1. **An instrument outlives the day that created it.** Scope it to the program (or the user), never to the day. Days project it.
2. **A projection has a mode** — collect, extend, review — and `review` must exist or Day 10 and Day 14 cannot be built at all.
3. **Schema extension must preserve prior rows.** Adding "did it affect my sleep" on Day 3 must not orphan Day 2's entries. The `+` generations are versions of one instrument, not new instruments.
4. **Two instruments must be joinable into one view** (piggybacking, and "My Routine" which is three at once).
5. **Some choice sets are non-scoring by design.** An MCQ that implies a correct answer breaks the rehearsal mechanic.
6. **Time-boxing is a property of the block**, and it must be able to hard-stop.
7. **Evaluation must be suppressible at collection time** — no pros/cons affordance may appear on Days 6–7.
8. **Retention is per-instrument and user-visible.** The journal states deletion within 48 hours as a promise in the copy; the store has to actually honour it, or the copy is a lie.
9. **Seed rows are content, authored per instrument**, and must be visually distinguishable from the user's own entries (the author asked for exactly this: *"which part is pre filled and what need to be filled. highlght bgray"*).
10. **Day order is a dependency graph.** Skipping Day 6 makes Day 8 meaningless. Whether the product enforces that is a product call — but the model has to be able to express it.

---

## 6. Where the source is incomplete

Unchanged from the first pass, and none of it undermines the above:

- 11 of 18 days authored. Days 11, 12, 13, 15, 16, 17 are Google Docs placeholder stubs (*"Conclude by summarizing key points…"*). Kartik has to write those regardless of architecture.
- Day 4's heading is missing; its content sits under Day 3.
- `Caffine` / `Caffeine` — one instrument, two spellings, would import as two.
- Day 14 has no Conclude, and repeats one table twice.
- The schedule's `Qualifier` column holds durations; the team flagged it and never resolved it.
- The 4 images are decorative third-party stock; licensing unchecked.

---

## 7. Honest limits

- **n = 1.** This arc is clearly deliberate, but one program cannot prove the type generalises. Stressbuster and one structurally different program would confirm or kill it. None were examined, per instruction.
- The `Data iNN` notation is inconsistent (`Data i05` vs `Datai05`). Its intent is legible; it is not machine-parseable as written.
- Phases 4 and 5 of the arc (REHEARSE, GRADUATE) rest on Days 10–18, which is exactly where the authoring is thinnest. The evidence for those two phases is weaker than for the first six.

---

## 8. Three questions that change the model

1. **Is Days 10–17 one instrument repeated eight times, or eight authored days?** The schedule says repeat phase; Day 14 is authored. This decides whether `REHEARSE` needs a repeat primitive or is just ordinary days.
2. **Does `review` permit editing a past entry, or is it read-only?** Comment [k] asks for access, not necessarily mutation. Changes the storage model.
3. **When an instrument is extended (`i04 → i04+`), is the new column retro-filled, left null, or does the instrument fork?** Day 3's copy assumes the user can look back at Day 2's rows and judge them — which means retro-fill on existing rows, not a fresh sheet.
