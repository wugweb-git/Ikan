# iKan — Sleeplessness source doc: structural analysis

**Date:** 2026-09-11
**Source:** `Equip: Sleeplessness 1` — unfiltered Google Docs HTML export
**Size:** 5,526 words · 26 tables · 4 images · 12 open editorial comments

> Nothing here was cross-referenced against existing programs in the DB. Per instruction, any resemblance to a program already in the database was ignored by design.
>
> Scope: audit of mechanics and constraints. Screen and flow design is not covered.

---

## 1. What the document actually is

Not a finished program. An **11-day authored program inside an 18-day declared shell**, still mid-authoring, with the content team's working notes left in.

| | |
|---|---|
| Declared length | 18 days (schedule table) |
| Actually authored | Days 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 18 |
| Unwritten stubs | Days 11, 12, 13, 15, 16, 17 |
| Open editorial comments | 12, all unresolved |

The six stub days carry Google Docs' literal placeholder string — *"Conclude by summarizing key points and expressing final thoughts or appreciation."* — under headings reading `Title` / `Task Title` / `Exercise:`. Day 12 carries it twice. These are unwritten, not intentionally blank.

The schedule table partially explains them: one row reads `Day 10-Day 17 | Practicing Rituals`, i.e. an eight-day repeat phase covered by a single schedule entry. But Day 14 *is* separately authored with unique content inside that window, so "repeat the same thing for 8 days" is not the real intent either. **The schedule and the body disagree, and neither is authoritative.**

---

## 2. Defects found in the source

Content-side, and they matter because they are exactly what a naive import would encode as truth.

- **Day 4 has no heading.** Its content (Journaling / emptying the mind) sits under Day 3's H1. The schedule confirms Day 4 exists as "Journalling to clear mind". A structural parse sees a two-lesson Day 3 and no Day 4.
- **`Caffine` vs `Caffeine`.** The same routine instrument is spelled differently on Day 10 and Day 14. Keyed off text, that is two instruments instead of one.
- **Day 14's H1 swallowed its body text** — the heading runs on into the first paragraph.
- **Day 14 has no Conclude.** The only authored day missing the closing beat.
- **Day 14 renders the same wake-up-time table twice.**
- **The schedule's 4th column is labelled `Qualifier` but contains durations** (10 min / 50 min / 30 min). The team already caught this — comment [c]: *"What is a qualifier? How is it different from duration?"* — and never resolved it.
- **Day 1 has no Lesson**, only Exercise → Conclude. Day 9 inverts the order (Exercise → Task, twice). So the day grammar below is a strong convention, not an invariant.

---

## 3. The day grammar

Across authored days the sequence is consistent enough to be a real type:

```
Lesson (prose, optional)
  → Task (check-for-understanding)
    → Exercise (the instrument the user fills)
      → Conclude (prose, forward-pointing)
```

Conclude is never generic in authored days — each one explicitly names what tomorrow does. That is a real content contract, not filler, and it is what the six stub days are missing.

---

## 4. The finding that matters: the team already invented a data model

The document carries a hand-rolled data-identity notation throughout, written inline by the content team. This is the most valuable thing in the file.

### Stable identities

Twelve data objects, `Data i01` through `Data i12`, assigned to instruments rather than to days or screens.

### Generation suffixes — the same instrument, extended later

| Identity | Where it appears | What changes |
|---|---|---|
| `i04` → `i04+` | Day 2 → Days 3, 10, 14 | 5 columns become 6 (adds *Did it affect my sleep*) |
| `i06` → `i06+` | Day 5 | free list gains an *In My control* column |
| `i07+` → `i07++` → `i07+++` | Days 6 → 7 → 8 | ideation, more ideation, then Pros / Cons / Balanced Solution |

### A composition operator

`Data i10 + i11+` appears on Days 9, 10 and 14 — one view built from two instruments joined. Also written: `Data i10+i11/ i12`, annotated by the author *"Issue while mapping to pre exiting lists"*, and elsewhere the open question *"is Datai10 and i11 linked?"*

### Inline type and behaviour annotations

Scattered through the prose: `MCQ`, `Select one`, *"which part is pre filled and what need to be filled"*, *"need to lock a X number of ways per disturbance — we can have 10"*, *"user to enter pros and cons via RTF??— yes"*.

**Read plainly:** the content team needed instrument identity, schema versioning, composition, prefill and per-instrument constraints, could not express them in the tooling, and so wrote them as annotations in a Google Doc.

---

## 5. The twelve open comments are a requirements backlog

Every unresolved comment is a missing capability, not a copy edit.

| Comment | Reads as |
|---|---|
| [e] *make it 15. add box to add other_______* | option list needs a free-text "other" escape |
| [h] *need checkboxes here* | multi-select missing |
| [i] *can we have a 3 min countdown timer added here?* | timed activity missing |
| [k] ***bhai he cannot go back to asses a sheet*** | **no read-back of a previously filled instrument** |
| [l] *can we provide a sleep tracker throughout the programme?* | **program-scoped instrument, not day-scoped** |
| [c] *What is a qualifier? How is it different from duration?* | schedule schema is ambiguous to its own authors |
| [b] *bhar dena, export karunga for .xml* | an export/import path was always assumed |
| [d], [f] *emojis*, *images* | asset handling |

**[k] and [l] are the same architectural gap seen from two directions.**

---

## 6. Instrument reuse, measured

20 distinct table schemas across 26 instances. The reuse is where the model lives.

- **Thought record** (`i04`) — 4 appearances, 2 shapes, days apart
- **Journal / Date + What happened** (`i09`) — 3 appearances, identical, Days 4, 10, 14
- **Ideation grid** (`i07`) — Days 6 and 7 are byte-identical tables; Day 8 extends it
- **Routine checklist** (`i10+i11`) — Days 9, 10, 14, gaining a boolean column after Day 9
- **"My Routine"** on Days 10 and 14 is not new content at all — it is three earlier instruments shown together

Day 18's closing table is a different shape again: a 4-habit × 7-weekday boolean matrix, plus a Day 1–7 boolean strip.

---

## 7. Interaction inventory demanded by this one program

Prose · decorative image · single-select · multi-select with "other" · typed editable grid (text / time / boolean columns) · grid with seeded example rows · grid with a row cap · boolean checklist · habit × weekday matrix · countdown timer · **read-back of a prior instrument** · **program-long persistent tracker** · typed intake form with account-prefilled fields.

Thirteen, from a single program that is only two-thirds written.

---

## 8. The structural conclusion

The document separates two things that the current block model treats as one.

> **An instrument** — persistent, typed, program-scoped, stable identity, owns its data and schema over time.
>
> **A block** — a day-scoped *projection* of an instrument, in a mode: `collect`, `extend`, or `review`.

Every symptom above collapses into that one distinction:

- Days 6 and 7 stop being duplicate blocks and become two `collect` sessions against one instrument.
- `i04 → i04+` stops being a second table and becomes a schema `extend`.
- "My Routine" stops being content and becomes a `review` projection over three instruments.
- Comment [k] is answered by `review` mode existing at all.
- Comment [l] is answered by instruments being program-scoped rather than owned by the day that first shows them.

This is consistent with the existing rule that response identity is `activityConfig.key` and that shared keys — not `repeat` — declare a series. What this document adds is that keys also need **versioning** (`+` generations) and **composition** (`i10 + i11`), neither of which the key alone currently expresses.

---

## 9. Honest limits of this analysis

- **n = 1.** One program, two-thirds authored. Strong evidence, not proof the model generalises. Before it is called a fix for *all* Equip and Blocks issues it has to be tested against at least two more programs of a different shape — and per instruction, none were examined.
- The `Data i01–i12` notation is informal and inconsistent (`Data i05` vs `Datai05`, `i07+` vs `Datai07+`). Its *intent* is legible; it is not a spec and cannot be parsed reliably as one.
- The 4 images are third-party stock illustrations, decorative, carrying no content. Licensing needs checking separately if they ship.
- The source is mid-authoring. Six days of content have to be written regardless of what the model does — no architecture fills them in.

---

## 10. Open questions

1. Is the Day 10–17 window a genuine repeat phase (one instrument, eight `collect` sessions) or eight distinct authored days? The schedule and the body currently disagree, and this decides whether the model needs a repeat primitive at all.
2. `Qualifier` vs duration — the schedule column needs one meaning before it is imported anywhere.
3. Does `review` mode allow editing a past entry, or is it read-only? Comment [k] asks for access, not necessarily for mutation, and the answer changes the storage model.
