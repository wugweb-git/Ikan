# iKan — Activity vocabulary

**Blocks module · proposed, revised 2026-09-09 (fifth pass)**

> **Proposed, not settled.** §6.2 of the live spec is still the running vocabulary — **20 activities · 17 interactions**. Nothing below is built and nothing is migrated until the live counts are taken.

**Proposed: 15 block types · 6 presentations · 23 activities · 9 interactions · 3 layouts.**

**Seven decisions sit inside the lists, marked `Decide`.** They are next to the thing they are about, not collected at the bottom.

---

## Definitions

| | |
|---|---|
| **Activity** | The set of events a user performs **in order to communicate**. Always produces something — communication *is* the production |
| **Interaction** | The **gesture** — cognitive, not physical. It sits between the person and their own head: *how will I respond to this?* |
| **Touchpoint** | **Device-bound.** A tap, a keystroke, a drag, a system sheet. Below the vocabulary, not part of it |
| **Layout** | How the activity is arranged — `single` · `list` · `grid` |
| **Presentation** | What the block shows when the user communicates nothing back. **Not an activity** |

An activity is a **set** of gestures, not one. `input-table` is many tellings. `multi-select` is many choosings. `timer` is start, wait, stop — a set of events whose product is a duration.

### The line the model is cut along

**Human side** — presentation · activity · interaction. What a person is being shown, what they are doing to communicate, and how they decide to respond.

**Device side** — touchpoint · layout. How the response is physically made, and how it is arranged on the screen in front of them.

The previous list — `tap` · `type` · `drag` · `pick` · `submit` — put four device-side terms on the human side. **`tap` is device-bound.** So is typing, so is dragging, so is a system sheet.

`submit` was the only one derived correctly, because it was defined by **ownership changing** — a decision, not a motion.

**What the split buys.** The same gesture reaches different touchpoints on different devices: `choose` is a tap on a phone, a click on the web, an arrow-and-enter on a keyboard, a word on a voice interface. Because the vocabulary sits on the human side, **the catalog never changes for a new platform** — only the touchpoint and layout layers do. Layout degrading `grid` to `list` on a phone is the same mechanism, already proven below.

---

## Presentations — 6

The block shows; the user communicates nothing back.

| presentation | requires | renderer |
|---|---|---|
| `read` | `content` | built · 118 live |
| `listen` | `media_ref` | see *unresolved* |
| `view` | `media_ref` | built · 0 live |
| `paced-breathing` **new** | `pattern` (in · hold · out · hold) · `cycles` | **owed** |
| `complete` | `content` | built · 94 live |
| `table-review` | `source_key` · `layout: grid` | **owed** |

**`read` requires `content`.** §6.2 records it as `—`, which is wrong: a `read` block with no content renders an empty card.

**`table-review` belongs here.** It reads a series back and takes nothing. Its renderer is the `read` renderer arranged as a grid — **the cheapest item on the list and the highest value**, because a series nobody sees is a series nobody benefits from.

> **Decide — `paced-breathing` `pattern`.** Free-form seconds, or a fixed set (4-7-8, box, coherent). Free-form is more flexible and easier to get clinically wrong.

---

## Interactions — 9 gestures

Each names what the user is **communicating**, not how they touch the screen.

| gesture | the user is | activities |
|---|---|---|
| `choose` | picking from what the app offers | 5 |
| `tell` | giving their own words or figures | 5 |
| `locate` | naming a real-world point — when, where | 4 |
| `mark` | recording what they did | 2 |
| `rate` | placing a value on a range | 2 |
| `submit` | **transferring ownership** of an artefact | 2 |
| `order` | putting things in sequence | 1 |
| `measure` | letting the app time a span they bracket | 1 |
| `agree` | assenting, on the record | 1 |

`choose` and `mark` look alike and are not. *Which of these describes me* is choosing. *I did this* is marking — it reports an action taken, not an answer given.

`locate` is separate from `choose` because **the app does not own the option set.** A date, a time and a place are real-world coordinates; the user is naming one, not selecting from a list somebody authored.

---

## Activities — 23

### `choose` — picking from what the app offers

| activity | layout | requires | produces | renderer |
|---|---|---|---|---|
| `mcq` | single | `scale_ref` | `option_id` | built |
| `single-select` | single | `scale_ref` | `option_id` | built · 18 live |
| `multi-select` | single | `scale_ref` | `option_id[]` | built · 17 live |
| `boolean` **new** | single | `prompt` · labels | `bool` | **owed** |
| `clinical-instrument` | list | `scale_ref` · `instrument_ref` | `option_id` | built · 0 live |

`boolean` is currently an alias into `mcq`, so a yes/no is stored as an `option_id` against a two-option scale — wrong shape, unqueryable as a boolean.

Picture choice is `single-select` with `display: image`. Dropdown is `display: dropdown`. Neither is a new activity.

### `tell` — the user's own words or figures

| activity | layout | requires | produces | renderer |
|---|---|---|---|---|
| `text` **new** | single | `prompt` · `persist` · `length` · `format` | `text` | built |
| `short-text` | single | `prompt` | `text` | built |
| `ephemeral-journal` | single | `prompt` | `text` | built |
| `number` | single | `prompt` | `number` | built · 1 live |
| `input-table` | **grid** | `columns` | cell map | built · **144 live** |

`input-table` is the same act, many times over, arranged as a grid. It is the largest thing in the app — **144 live blocks, more than a third of all 420.**

`text` carries `format: email \| phone \| url`, which covers the Typeform contact fields. Validation, not three more activities. `comparison-matrix` retires into `input-table`.

> **Decide — `text` default `persist`.** `true` or `false`. Some of the 17 live text blocks carry the ephemeral promise; the default has to preserve it.

### `locate` — a real-world point

| activity | layout | requires | produces | renderer |
|---|---|---|---|---|
| `date` **new** | single | `prompt` | `date` | see *unresolved* |
| `time` **new** | single | `prompt` | `time` | **owed** |
| `date-time` | single | `prompt` | `datetime` | **owed** |
| `location` **new** | single | `prompt` · `precision` | `place` | **owed** |

`time` is **not expressible at all today** — bedtime and wake time are free text in the sleep diary. `location` is missing entirely.

> **Decide — `location` precision.** Coarse (city, area) or exact coordinates. Health-adjacent personal data — the answer changes storage, retention and the privacy copy, not just the picker.

### `mark` — recording what they did

| activity | layout | requires | produces | renderer |
|---|---|---|---|---|
| `structured-list` | **list** | `items` | `item_id[]` | built · 6 live |
| `check-grid` *renamed from `table`* | **grid** | `columns` · `rows` | boolean map | **layout owed** |

Same act at two layouts, kept apart because one produces `item_id[]` and the other a boolean map.

### `rate` — a value on a range

| activity | layout | requires | produces | renderer |
|---|---|---|---|---|
| `rating-scale` | single | `scale_ref` | `option_id` | built · 1 live |
| `slider` **new** | single | `min` · `max` · `step` | `number` | **owed** |

Same gesture, different range. A five-point scale offers steps the app owns; a slider offers a continuum the app does not. That is why the outputs differ — `option_id` against `number` — and why they are two activities.

NPS is settled at **1–5**, so it is `rating-scale`. Emoji check-in is `rating-scale` with `display: emoji`.

### `submit` — ownership changes

| activity | layout | requires | produces | renderer |
|---|---|---|---|---|
| `upload` | single | `accepted_types` · `source: pick` | `file_ref` | built · 0 live |
| `record` **new** | single | `prompt` · `max_duration` · `source: capture` | `audio_ref` | **owed** |

**Defined by the ownership transfer, which is what makes it specific.** Choosing an option or writing a sentence creates a value in place and transfers nothing. Handing over a file, or a recording just made, moves an artefact out of the user's possession into the app's. True of these two and nothing else.

**`upload` already handles every media type** — `accepted_types` governs it per block. It was never image-only. The two stay separate activities because the evidence differs: a file chosen from a phone and audio recorded in session carry different permission and retention rules.

> **Decide — `record` retention.** Audio is the largest thing this app would hold. Answered before it is built, not after.

> **Decide — `record` at all.** Held on provenance. Reject provenance and `record` collapses into `upload` — **and `timer` collapses into `number` at the same time. One decision, not two.**

### `order` · `measure` · `agree`

| activity | gesture | layout | requires | produces | renderer |
|---|---|---|---|---|---|
| `ranking` | order | list | `items` | `item_id[]` ordered | see *unresolved* |
| `timer` **new** | measure | single | `mode` (up · down) · `target` · `prompt` | `duration` | **owed** |
| `consent` **new** | agree | single | `statement` · `required` | `bool` + timestamp + statement as shown | **owed** |

`timer` is the definition working literally — start, wait, stop, and the product is a duration. **Not `number` with a stopwatch skin:** a measured duration and a typed one are different evidence.

`consent` produces the statement text **exactly as shown**. A stored `true` with no record of what was agreed to is worthless in an audit — which is why assent is its own gesture and not a `choose`.

**`rank 1–5` is ambiguous.** Five items in order is `ranking` — `order`. Scoring one thing 1 to 5 is `rating-scale` — `rate`.

> **Decide — `consent` scope.** Onboarding only, or any block type? A consent record that can appear anywhere is harder to audit.

---

## Totals

| | |
|---|---|
| Presentations | **6** |
| Activities | **23** — `20 − 1 retired + 10 new − 6 moved to presentations` |
| Interactions | **9** gestures — `choose` · `tell` · `locate` · `mark` · `rate` · `submit` · `order` · `measure` · `agree` |
| Layouts | **3** — `single` · `list` · `grid` |
| Scale-backed | **5** — `mcq` · `single-select` · `multi-select` · `rating-scale` · `clinical-instrument` take options from the catalog. `slider` and `boolean` deliberately do not; that is the point of separating them |
| Renderers owed | **11** — `paced-breathing` · `table-review` · `boolean` · `slider` · `time` · `date-time` · `location` · `timer` · `consent` · `record` · the `check-grid` grid layout. **Two of them — `table-review` and `check-grid` — are layouts on renderers that already exist**, not new renderers. Three more are unresolved below |

**Unresolved, and it changes the build list:** the viewer marks only `review-table` as *No renderer yet*. `listen`, `rank` and `pick-date` read *Wired, unused*, which implies renderers exist. §6.0 says all four lack renderers. One of the two is wrong.

---

## What `layout` buys — grids on mobile, solved

Layout is a rendering property, orthogonal to activity and gesture. So a `grid` degrades to a `list` on a narrow screen **without touching the activity, the gesture, or the stored answer.**

| on a phone | becomes |
|---|---|
| `check-grid` · grid | the same taps, as a list |
| `input-table` · grid | the same typing, as a stack of labelled fields |
| `table-review` · grid | the same read-back, as stacked entries |

**144 live `input-table` blocks get a mobile form out of naming the axis correctly.** Nothing was designed for it.

What stays open is the author's side: whether they see the narrow result while building, and whether a block may refuse the degrade.

---

## Retained by decision — and what it costs

Three activities the audit found identical are kept.

| retained | identical to | what it costs |
|---|---|---|
| `mcq` | `single-select` — same interaction, same `scale_ref`, same `option_id` | The author picker offers two entries that do the same thing. Nothing distinguishes them at the point of choosing, so which one gets used is arbitrary and the split is permanent in the data |
| `short-text` | `ephemeral-journal` and `text` — all three are `write` · `prompt` · `text` | Three entries, one behaviour. Reporting across free-text answers has to know all three names forever |
| `ephemeral-journal` | as above | as above |

**The cost is author confusion and permanently split data, not breakage.** Nothing renders wrong; the resolver already sends all of these to the right interaction. Stated once, and dropped.

**The compensation is real, and it is not a consolation prize.** These three are exactly what makes the interaction layer collapse: **23 activities → 9 gestures**, carried by `choose` (5), `tell` (5), `locate` (4), `mark` (2), `rate` (2) and `submit` (2). `mcq` sits inside `choose`; `short-text` and `ephemeral-journal` sit inside `tell`. Retire them and two of the six collapses shrink. **The layer earns its keep because of this decision.**

If the split ever needs closing, the mechanism is a `display` or `length` hint on one canonical activity, not a retirement. That option stays available.

### Retired — 1 activity, 2 block types

| retire | into | evidence |
|---|---|---|
| `comparison-matrix` | `input-table` | Identical — `input-table` · `columns` · cell map. Fixed rows are a config |

`rest` and `assessment-lite` — see Block types below.

**Renamed — 1.** `table` → `check-grid`. In place; the catalog id is never re-minted.

`rating-scale` and `rate`, `ranking` and `rank`, `structured-list` and `check` are **not** duplicates of each other. One is the activity, the other is the interaction it resolves to. That is the layer, not a repetition.

---

## Not activities — display variants

Each produces data an existing activity already produces, with the same provenance. They belong in a `display` field on `activityConfig`.

| asked for | is | mechanism |
|---|---|---|
| emoji check-in | `rating-scale` | `display: emoji` |
| NPS | `rating-scale`, 1–5 | `display: nps` |
| dropdown | `single-select` | `display: dropdown` |
| **select image** / picture choice | `single-select` / `multi-select` | `display: image` |
| email · phone · URL | `text` | `format: email \| phone \| url` |
| rank 1–5 | **ambiguous** | Five items in order is `ranking`. Scoring one thing 1 to 5 is `rating-scale` |

**`select image` is a variant, but it is not free.** Options come from `scale_ref`, so the **catalog scale rows need an `image` field** before `display: image` has anything to display. That schema change is the real cost of the feature.

---

## Block types — 15

**`rest`** — retired. The only row with an empty activities list. A block type that permits nothing is not a block type; it is a day with no task wearing a block type's clothes, the last surviving fragment of day-typing. A rest day is one `lesson · read` (the gentle prompt) plus one `conclude · complete`. Retired **inside the §19 day-type removal**, not beside it.

**`assessment-lite`** — retired. With it gone, `assessment` keeps the guarantee that matters: scored, forward-only, and the only type that may hold a `clinical-instrument`. The type carries the guarantee; nothing has to be toggled. Unscored self-awareness work is covered twice already by `check-in` and `reflection`.

**`conclude` stays** — a real activity, 94 live `complete` blocks, a real policy. Retiring `rest` *depends* on keeping it.

Activities in **bold** are new. Retirements are mechanical; placements are judgement.

| block type | activities |
|---|---|
| `lesson` | read · listen · view · **paced-breathing** |
| `exercise` | mcq · single-select · multi-select · **boolean** · rating-scale · **slider** · input-table · check-grid · structured-list · number · **timer** · **date** · **time** · date-time · **location** · ranking · upload |
| `journal` | ephemeral-journal · short-text · **text** · **record** |
| `checklist` | structured-list |
| `reflection` | mcq · single-select · rating-scale · ephemeral-journal · **text** · **record** |
| `conclude` | complete |
| `quiz` | mcq · single-select · multi-select · **boolean** · rating-scale |
| `sleep-diary` | input-table · **date** · **time** · date-time · table-review |
| `onboarding` | mcq · single-select · multi-select · **boolean** · short-text · **text** · **date** · **consent** |
| `assessment` | mcq · single-select · clinical-instrument |
| `learning` | mcq · single-select |
| `practice` | multi-select · input-table · structured-list · number · **timer** · ephemeral-journal · short-text · **text** · **record** · **location** · upload · **paced-breathing** |
| `workshop` | multi-select · input-table · ephemeral-journal · **text** · ranking · upload |
| `tracker` | check-grid · input-table · structured-list · rating-scale · **slider** · **boolean** · number · **timer** |
| `check-in` | mcq · single-select · multi-select · **boolean** · rating-scale · **slider** · ephemeral-journal · short-text |
| ~~`rest`~~ ~~`assessment-lite`~~ | *retired* |

`time` is what finally makes bedtime and wake time real fields in the sleep diary instead of free text.

---

## Aliases — what breaks

**The rule: an alias that changes the output shape is a migration. An alias that keeps it is a re-point.**

| alias | today | after | risk |
|---|---|---|---|
| `slider` | → `rating-scale` | **remove** — `slider` is an activity | **migration** |
| `boolean` · `yes_no` | → `mcq` | **remove** — `boolean` is an activity | **migration** |
| `emoji_scale` | → `rating-scale` | keep, but set `display: emoji` on migration or the intent is silently lost | care needed |
| `single_choice` · `mcq_single` | → `mcq` | unchanged — `mcq` is retained | none |
| `free_text` · `journal` · `journal_short` · `long_text` | → `ephemeral-journal` | unchanged — `ephemeral-journal` is retained | none |
| `short_text` | → `short-text` | unchanged — `short-text` is retained | none |
| `matrix` · `comparison_matrix` | → `comparison-matrix` | → `input-table`, fixed rows | re-point |

Retaining `mcq`, `short-text` and `ephemeral-journal` means **four alias groups that would have needed re-pointing now need nothing at all.** That is a real reduction in migration surface — only `slider` and `boolean`/`yes_no` remain risky.

### Why those two are migrations

`slider` never reaches the resolver today — it is rewritten to `rating-scale` first. So a block stored as `activity: "slider"` behaves as a rating scale: renders `rate`, reads options from `scale_ref`, saves an `option_id`.

Promote it to a real activity and the same stored string means something else: render a continuous track, require `min`/`max`/`step`, save a `number`. Two breakages, both to blocks nobody touched:

- **Render** — those blocks carry `scale_ref` and no `min`/`max`/`step`. The new renderer has nothing to draw.
- **Data** — their saved answers are `option_id` values. A number field cannot read them. **User history is lost, not converted.**

`boolean` · `yes_no` → `mcq` is the same shape change: `option_id` becomes `bool`.

**It is a migration only if live blocks carry those spellings.** If zero blocks are spelled `slider`, `boolean` or `yes_no`, both are catalog edits and nothing moves. Nobody has counted. That is why counting is step 1.

---

## Open

Seven decisions now sit **inside the activity list**, marked **Decide** — `paced-breathing` pattern · `text` default `persist` · `location` precision · `timer` at all · `record` retention · `record` at all · `consent` scope. They belong next to the thing they are about.

What is left here is cross-cutting — it belongs to no single activity.

| | |
|---|---|
| **Grids on mobile** | **`layout` is the answer, and it fell out of the interaction rulings rather than being invented for this.** A grid is a layout, not an interaction, so `layout: grid` can degrade to `layout: list` on a narrow screen **without touching the activity, the interaction, or the stored answer**. `check-grid` becomes the same `mark` gesture as a list. `input-table` becomes the same `tell` gesture as a stack of labelled fields. 144 live `input-table` blocks — more than a third of all 420 — get a mobile form for free. What is still open is the **author's** side: whether they see the narrow result while building, and whether any block should be allowed to refuse the degrade |
| **`boolean` — `choose` or `mark`?** | Filed under `choose`: a yes/no answers a question the app asked. But *did you do it — yes/no* is `mark`. The gesture may depend on the block type rather than the activity, which nothing else in this model does. Flagged, not resolved |
| **`complete` vs `read`** | Both are presentations requiring `content`. `complete` could be `read` plus a last-block policy on `conclude`. Retained by decision; reopenable |
| **`slider` is a device word** | No activity should be named after a control. It survives only because what it produces — a continuum the app does not own — is genuinely different from `rating-scale`. The name should be revisited |

**Closed by the restructure:** the layer question — 23 activities → 9 gestures is a real collapse. The three table names, which no longer exist. `rate` vs `slide` — one gesture, two ranges. And **grids on mobile**, solved by `layout` being its own axis.

---

## `sleep-diary` · `tracker` · `reflection` — the confusion, named

The confusion is real and two of these three are genuinely hard to tell apart. The third is not — it is on a different axis entirely.

### One question separates them

**Does the value live in the series, or in the single answer?**

| | value lives in | repeats | comparable across days | live blocks |
|---|---|---|---|---|
| `tracker` | **the series** | every day | yes — that is the point | — |
| `sleep-diary` | **the series** | every night | yes | Sleep Diary appears 23 times, days 8–30 |
| `check-in` | **the series**, lightly | every day | yes | — |
| `reflection` | **the single answer** | no | no | — |

`reflection` is not in the same family. It is a one-off, end-of-session, looking-back prompt. Deleting one reflection loses one answer. Deleting one day from a tracker damages the trend — that is the whole difference.

The reason `reflection` *feels* adjacent is that it uses `rating-scale`, which is also what a check-in uses. The activity is shared; the intent is not.

### The second axis — weight

| | |
|---|---|
| `tracker` | the heavy series — a full instrument, a grid, several fields |
| `check-in` | the light series — 1 to 3 questions, under two minutes |
| `reflection` | not a series at all |

So: **heavy series · light series · single answer.** Three types, one sentence.

### `sleep-diary` is `tracker` with fixed columns

This is the honest finding and it is uncomfortable.

Compare them field by field. Both say *the same instrument, repeated daily, where the series is the clinical value*. Both `saveOnToggle`. Both forbid step groups. Both are built on `input-table`. The only structural difference is that `sleep-diary` lists `table-review` — the carry-forward read-back — and `tracker` does not.

**`sleep-diary` is a content instance wearing a block type.** It is the same smell as `mcq` beside `single-select`, one level up. A sleep diary is a tracker whose columns are bedtime, wake time and quality.

**Proposed:** retire `sleep-diary` into `tracker`, and keep the sleep columns as a **template** the author picks — not a type. Add `table-review` to `tracker`, where it belonged all along. Block types **15 → 14**.

**Not applied, and two things have to be checked first:**

1. **Does any code branch on `type === 'sleep-diary'`?** Scoring, reporting, or the recommendation engine may key off it. If they do, this is not a retype, it is a refactor.
2. **The count.** Sleep Diary appears 23 times across days 8–30 with 23 different ids. Those retype to `tracker`.

Clinically, a sleep diary is a named CBT-I instrument. That is an argument for keeping the **template** recognisable and named — it is not an argument for a separate block type, because a template can carry the name.

### Future use case — where each one goes

| | with the new activities |
|---|---|
| `tracker` | Gets substantially more interesting. `timer` captures how long something lasted, `location` captures where, `boolean` captures did-it-happen, `slider` captures intensity on a real range. A tracker stops being a grid of text and becomes a measured daily record |
| `sleep-diary` | `time` is the unlock. Bedtime and wake time are free text today. As a `tracker` template with two `time` columns and a `slider` for quality, it becomes queryable — sleep duration computed rather than typed |
| `reflection` | `record` is the unlock. A spoken reflection at the end of a hard session is easier than a typed one, and it is the input a distressed user can actually manage |
| `check-in` | `paced-breathing` before the questions, `slider` for intensity, `display: emoji` on the scale. It stays light |

`table-review` — a **presentation**, `read` arranged as a grid — closes the loop on all three series types: showing a user their own trend back to them. **Zero live blocks, no renderer.** It is the single highest-value unbuilt thing in this document and among the cheapest, because it is a layout on a renderer that already exists.

---

## Live state — read from the Block Type Viewer, 2026-09-09

Every number below is off the live admin page, not from memory. Anything not listed here is unverified and should be recounted before it is planned against.

| | |
|---|---|
| Live blocks | **420** |
| Blocks declaring a `key` | **222** — so **198 do not** |
| Distinct keys | **104** |
| Keys used more than once | **35 keys across 153 blocks** — a series the author declared |
| Blocks declaring `repeat` | **4** |
| Block types in use | **11 of 17** |
| Interactions ever used | **9 of 17** |
| Legacy → interaction terms | **55** |
| Day integrity | 0 days hold no blocks · 0 carry a repeated block id |

### Live blocks per interaction

| interaction | live | note |
|---|---|---|
| `input-table` | **144** | the workhorse |
| `read` | 118 | |
| `complete` | 94 | |
| `select-one` | 18 | **all 18 incomplete — missing `scale_ref`** |
| `select-many` | 17 | **all 17 incomplete — missing `scale_ref`** |
| `write` | 17 | 1 incomplete — missing `prompt` |
| `check` | 6 | |
| `rate` | 1 | **incomplete — missing `scale_ref`** |
| `number` | 1 | |
| `view` · `listen` · `rank` · `review-table` · `pick-date` · `track-table` · `clinical` · `upload` | **0** | wired, never used |

**36 live blocks are missing a required `scale_ref`** — every `select-one`, every `select-many`, and the single `rate` block. That is not a vocabulary problem and it is not caused by anything in this document. It is a live content defect and it is the largest one on the page.

### Corrections to earlier figures in this document's history

| was recorded as | actually |
|---|---|
| 407 live blocks | **420** |
| 98 blocks carry a key, 61 distinct, 14 shared across 51 | **222 carry a key, 104 distinct, 35 shared across 153** |
| 0 blocks declare `repeat` | **4** |
| 29 aliases | **55 legacy terms** |
| conclude — 85 live blocks | **94** |
| 107 of 144 input-tables have no key | **not derivable from the page.** 144 input-table blocks exist and 222 of 420 blocks carry a key, but the overlap is not shown. **Needs its own count** |

### Defect on the viewer itself

The stat tile reads **Activities 20 · 29 aliases** — correct. The tab beside it still reads **Activities (49)**. The 49 → 20 fix landed on the tile and not on the tab label. Both are stale under this document anyway; both need the same update.

---

## Order

1. **Count first.** Live blocks spelled `slider`, `boolean`, `yes_no`, `emoji_scale`; blocks carrying `comparison-matrix`; blocks typed `assessment-lite`; days typed `rest`. Nothing is decided without those numbers.
2. **`display` and `format` on `activityConfig`, and `image` on catalog scale options.** Additive, breaks nothing, unblocks every display variant including select-image.
3. **Rename `table` → `check-grid`.** In place, id frozen. **Correct `read`'s `requires` to `content`.**
4. **Add the 10 new catalog rows** — 9 activities (`boolean` · `slider` · `text` · `date` · `time` · `location` · `record` · `consent` · `timer`) and 1 presentation (`paced-breathing`) — declared but unauthorable until their renderers exist, exactly how the four owed activities are handled today. **Move `table-review` from activities to presentations** in the same edit.
5. **Retire `comparison-matrix`.** Retype its live blocks to `input-table`, then prove interaction-neutrality against a fresh backup, both `equip:` and `equip_program:`, the way the 58-block retype was proved.
6. **Retire the 2 block types.** `rest` inside the §19 day-type removal. `assessment-lite` retypes per block — short forward-only pulse to `check-in`, looking-back prompt to `reflection`. No safe blanket default, so step 1's count decides whether this is 5 decisions or 50.
7. **Renderers — 11**, in value order:
   - **`table-review` first.** A layout on the `read` renderer, which already exists — the cheapest thing on the list and the highest value, because it is what shows a user their own series back. It has spent this whole spec looking like a renderer nobody had time for.
   - Then **`layout` properly**, including the mobile degrade. The `check-grid` grid layout and the narrow-screen fallback for `input-table` come out of the same work, and **144 live blocks benefit**.
   - Then `paced-breathing` · `timer` · `boolean` · `slider`.
   - Then `time` · `date-time` · `location` · `record` · `consent`.
   - **Settle first whether `listen`, `ranking` and `date` actually lack renderers.** The viewer says *Wired, unused*; §6.0 says declared-without-renderer. One of the two is wrong, and it changes this list.
8. **The author's side of `layout`.** Whether an author sees the narrow result while building, and whether a block may refuse the degrade. Independent, and overdue.

Steps 1–4 are safe. **Steps 5 and 6 change stored data and are the only irreversible ones in this list.**
