# Review of my own answer — loopholes, issues, open questions

**Date:** 2026-09-11
**Reviewing:** `ikan-instrument-model-answer.md`
**Verdict:** the Instrument / Revision / Projection split holds. The type system does not — it has two types that are the same type, one that may not be an instrument at all, and a count I have now been wrong about twice. There is also one contradiction I introduced myself and shipped.

Ordered by severity.

---

## A. Contradictions that break the build

### A1. The 48-hour retention promise kills two of my own projections

I specified `retention: 48h` on the thought dump (#6), and I also specified that #6 is projected in `review` mode on Day 10 and Day 14.

Both are taken from the source, and the source contradicts itself. Day 4's copy promises *"we won't record your responses, and they will be deleted within 48 hours."* `Data i09` then appears three times — Day 4, Day 10, Day 14.

**If the promise is honoured, Day 10 and Day 14 review an empty sheet.** Six days have passed.

This is not a model bug, it is a content bug I should have caught and instead encoded. Someone has to choose: either the dump is ephemeral and Days 10/14 must not project it, or it persists and the copy is making a promise the product breaks. The second option is the worse one — a stated deletion promise that does not hold is a trust and possibly a compliance problem, not a UX wrinkle.

**Severity: high. Unresolvable without a decision.**

### A2. Day 18 asks for a count and collects booleans

The copy says *"enter the number of times you were able to carry out the activity."* The table collects one boolean per weekday per habit. The 50% threshold in the copy (*"if it was more than 50% of the days…"*) is then computed from those booleans.

So the instrument is boolean-per-day, the copy asks for a count, and the actual judgment is a derived percentage. Three different things. I recorded the table shape and ignored the copy.

**Severity: medium. Content/spec mismatch, easily fixed once someone decides which is authoritative.**

### A3. The registry is built on a document I reported as superseded

I established that the real protocol is 35 days and the 18-day document is a partial build — then built the entire instrument registry's "Appears" column on that same 18-day document. Every `D2 / D3 / D10 / D14` reference maps to a truncated draft.

If the 35-day protocol is real, those day numbers are provisional at best. I flagged the contradiction in §0.1 and then wrote the rest of the document as if it did not exist.

**Severity: high. The model's structure survives; its day-mapping may not.**

---

## B. Flaws in the type system — mine, not the source's

### B1. `list` and `log` are the same type

I defined `log` as *append-only, timestamped, unbounded* and `list` as *flat rows, user-extended, optionally seeded*. Distractors (#8) is append-only and user-extended. Thought record (#4) is seeded and user-extended.

The only real difference is how many days project it in `collect` mode — once, or many times. **That is a property of the projection, not of the instrument.** I encoded a usage pattern as a type.

### B2. `checklist` is a `list` with a boolean column

Bedtime ritual (#11): r1 is a list, r2 adds `done:bool`. Distractors (#8): r1 is a list, r2 adds `in_my_control:bool`. Identical mechanic. One I called a revision of a list; the other I made its own type.

**B1 and B2 together mean the ten types should be closer to seven.** Which matters, because I presented the count as a line to hold.

### B3. I have now been wrong about the type count twice

Nine, then ten when `scale` appeared, and now arguably seven once B1 and B2 collapse. The number has moved in both directions on the same evidence.

**The count is not a finding.** The types are a working vocabulary, and I should stop presenting their cardinality as if it were a result.

### B4. `matrix` (#19) may not be an instrument at all

If adherence is logged daily through the rehearsal window — which the window's whole purpose implies — then Day 18's habit × weekday grid is **derivable from #11**, and making it an instrument asks the user to re-enter data the system already holds.

The source is genuinely ambiguous. I picked "instrument" without justifying it.

### B5. Derived fields, as I defined them, cannot support the thing I said they support

I wrote that derived fields are *"expressions over its own fields"* — a per-row computation. Sleep Efficiency is per-night, so that works.

**Sleep Compression is not.** It is a decision made from *average* efficiency across a rolling window of nights. That is an aggregate across rows, which my definition excludes. Two levels are needed — row-derived and window-derived — and I only specified one, while claiming compression was covered.

### B6. `summarise` writes nothing, but Sleep Compression produces a prescription

I defined `summarise` as read-only aggregation. Sleep Compression outputs a *new prescribed time-in-bed window* that the user then follows, and that later days must read.

So either `summarise` writes, or there is a missing concept — a derived value that is computed once, persisted, and becomes an input to a subsequent day. **I have no slot for it.**

---

## C. Things I asserted without warrant

### C1. Day 7 as "a second collect session" is a charitable reading

Day 7's table is byte-identical to Day 6's, including the seeded example. I read that as two deliberate collection sessions, consistent with the divergent-thinking argument.

It is equally consistent with an unedited copy-paste that nobody differentiated. The instructional copy differs (*"let's continue our brainstorming"*), which leans my way — but the seeded content being identical leans the other. I presented one reading as settled.

### C2. "Every close names tomorrow" is stated as universal and is not

Day 18 has no tomorrow — it routes to the Stressbuster programme instead. The last day of a rehearsal window has no distinct tomorrow either. The rule needs an exit case; as written, validation would reject the final day of every program.

### C3. Instruments 15–19 are inferred from table shape alone

Wake ritual, successes, energisers, bed-separation ideas, adherence matrix — all from Days 14 and 18, the thinnest-authored part of the file. I typed them from column layout. None has stated intent behind it. I said this once in the limits section and then used them in the registry as if they were equally solid.

---

## D. Unanswered questions — real gaps, not quibbles

### D1. Instrument identity across programs

I wrote that instruments *"survive the program's end"* and left ownership at *"program-scoped is the floor; user-scoped is the intent."* That is a dodge, and it is the question that decides the storage model:

- A user runs Sleeplessness twice — one thought record or two?
- Stressbuster also wants a thought record — same instrument or a new one?
- If the same, who owns the schema when two programs revise it differently?

Unanswerable from the content. Needs a product decision before anything is built.

### D2. Missed days

Sequential unlock is specified. The rehearsal window collects daily. Neither document says what a gap does:

- Does Day 13 unlock if Day 12 was skipped?
- Does the diary carry a null row, or no row?
- Is Sleep Efficiency averaged over calendar days or over entries?

That last one is load-bearing — it changes the compression prescription. I did not address any of it.

### D3. Time arithmetic crosses midnight

The diary mixes clock times (*what time did you get in bed*) with durations (*how long did it take to fall asleep*), and the metrics subtract across them.

In bed 23:30, out of bed 07:00. Naive `duration(#8, #1)` gives **−16.5 hours**. Every metric downstream inherits it.

This is a *second* arithmetic landmine, independent of the inverted Time Asleep formula I already flagged. Neither document mentions date handling, timezones, or the night-spans-two-dates problem at all.

### D4. Join cardinality is undefined

Piggybacking pairs an activity with a habit. Target habits (#13) has 5 rows. The pairing table has exactly 1. Is it 1:1, or one activity carrying several habits, or several activities each carrying one?

The copy says *"pick one of the activities… start and finish a new habit activity"* — singular, suggesting 1:1 for the first week. But then the habit list has five entries and Day 18 tracks four habits. **The numbers do not reconcile.**

### D5. How drills relate to the existing assessment engine

A `drill` is explicitly non-scoring. iKan already has a scoring engine and scored assessment instruments. I never said whether a drill is a degenerate assessment, a separate concept, or something the assessment engine should refuse to touch.

Given there is already a Scoring Engine spec in play, this is an integration question I ducked entirely.

### D6. Content edits mid-flight

Revisions handle schema growth at authoring time. Neither document nor my model says what happens when Kartik edits Day 3's copy or an instrument's seed rows **while users are on Day 7**.

Do in-flight users see the change? Are revisions pinned per enrolment? This is ordinary CMS-versus-running-cohort tension and I left it untouched.

### D7. Still unanswered from before

Does `review` permit editing a past entry, or is it read-only? Neither document answers it. If entries stay editable, `extend` already covers the case and `review` collapses into it — which would be a third reduction in the type/mode vocabulary.

---

## E. What survives review

Not everything is holed. These held up:

- **Instrument / Revision / Projection.** The three-way split is the load-bearing idea and nothing in the review threatens it. Every collapse above (B1, B2, D7) makes it *simpler*, not wrong.
- **Instruments are program-scoped, not day-scoped.** Confirmed twice over — comment [k], comment [l], and the Day 18 promise that trackers outlive the program.
- **The revision rules** (add-only, enum widening counts, null-but-retroactively-fillable, constraints are revisions). Directly evidenced, and D3-judging-D2's-rows can't work any other way.
- **The evaluation-suppression and time-box constraints.** Derived from the therapy, not from taste, and both are violable today.
- **The two arithmetic bugs** (inverted Time Asleep, blank metric #4) are real regardless of anything above.
- **The sleep diary being absent** is the largest gap in the program and is not in dispute.

---

## F. What I would fix first

1. **A1** — the retention contradiction. It is a trust problem, not a modelling one, and it needs a human decision today.
2. **D3 + the inverted formula** — the metrics are arithmetically broken in two independent ways, and Sleep Compression rests on them.
3. **B5/B6** — row-derived vs window-derived, and where a persisted prescription lives. Without these, compression cannot be built at all.
4. **A3** — reconcile 18 versus 35 days before anyone treats the day-mapping as real.
5. **D1** — instrument identity across programs. Cheapest to decide now, most expensive to retrofit.

Everything in B1–B3 is vocabulary tidying and can wait; it makes the model smaller, and nothing downstream breaks by deferring it.
