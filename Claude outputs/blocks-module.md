# iKan — Blocks Module

**The single reference. Supersedes `activities.md` and `vocabulary.md`.**
Revised 2026-09-10.

> **Status.** The model is settled. The catalog is mid-migration — §26 landed in `f1600b1b`, the two block-type retirements in `1b22ceaa`. Live counts in §10 are read from `/admin/block-type-viewer`, not from memory.

**17 block types · 31 activities · 10 interactions · 7 labels · 9 policy fields.**

**93 permitted (block type × activity) pairs. 36 of them have no renderer.**

> **Ruled 2026-09-10 — nothing below is "proposed" any more.** Media is not `lesson` (§5.1) · the 12 missing renderers are scheduled (§5.2) · `risk` is a real policy field and the crisis flag is switched on (§6) · one flat list of 17 types, no nesting, ever (§7) · aliases classified and counted against live data (§7) · the completion card **is** a `conclude` block (§9) · the crisis **modal goes** — one renderer, one entry point (§9.1) · the instrument is being built (§9.2) · all eight missing fields are in (§9.3).
>
> The retained-duplicates section is gone. The fact survives as one line in §7; the argument for it did not need three paragraphs.

---

## 1 · The five things, and how they differ

| | what it is | who sets it | example |
|---|---|---|---|
| **Block type** | What the block *is for*, and what it guarantees | The author, per block | `exercise` |
| **Activity** | The set of events a user performs **in order to communicate** | The author, per block | `rating-scale` |
| **Interaction** | The **gesture** — cognitive, not physical. *How will I respond to this?* | Derived from the activity | `rate` |
| **Label** | Device-bound. How it is drawn, never what it is | The author, optionally | `display: emoji` |
| **Policy** | What the block type **guarantees** about behaviour | The block type, not the author | `scoring ✓` |

Two lines carry most of the model:

**An activity is a set of gestures, not one.** `input-table` is many tellings. `multi-select` is many choosings. `timer` is start, wait, stop — a set of events whose product is a duration.

**The human side is activity, interaction and presentation. The device side is touchpoint and layout.** A tap is a touchpoint, not an interaction. Because the vocabulary sits entirely on the human side, **the catalog never changes for a new platform** — only layout and touchpoint do.

### The distinguishing test

> An activity is distinguished by **what it produces** — the shape of the value *and* how the value was obtained. Presentation alone is a display variant.

A measured 4:32 is different evidence from a typed "about five minutes". Recorded-in-session audio is different evidence from a file picked off a phone. Tapping a face instead of a number is **not** — the user is still tapping an option on a scale.

**Where the test is overruled, it is overruled deliberately** — see §6.

---

## 2 · Interactions — 10

Each names what the user is **communicating**, not how they touch the screen.

| interaction | the user is | activities |
|---|---|---|
| `observe` | taking content in — reading, listening, watching | 6 |
| `choose` | picking from what the app offers | 5 |
| `share` | giving their own words or figures | 5 |
| `locate` | naming a real-world point — when, where | 4 |
| `confirm` | affirming — that something happened, or that they agree | 5 |
| `rate` | placing a value on a range | 3 |
| `order` | putting things in sequence | 1 |
| `measure` | bracketing a span the app times | 2 |
| `submit` | **transferring ownership** of an artefact | 2 |
| `reach` | **contacting a human outside the app** | 1 |

`observe` is the interaction of every teaching block — `lesson`, `learning`, and the reading half of everything else.

**`submit` is defined by the ownership transfer**, which is what makes it specific rather than generic. Choosing an option or writing a sentence creates a value in place and transfers nothing. Handing over a file, or a recording just made, moves an artefact out of the user's possession into the app's.

**`reach` is the only interaction whose destination is not iKan.** Every other gesture ends in a stored value. This one ends in a phone ringing somewhere else. It was added because the crisis panel had nowhere else to sit — see §9.1.

### Why these are not each other

| | |
|---|---|
| `choose` vs `confirm` | *Which of these describes me* is choosing. *I did this* is confirming — it reports an action taken, not an answer given |
| `locate` vs `choose` | The app does not own the option set. A date, a time and a place are real-world coordinates, not a list somebody authored |
| `measure` vs `share` | The user brackets a span; the **app** produces the value. In `share` the user produces it |
| `confirm` covers assent | `agree` was retired into `confirm`. Assent is affirming. `consent` stays a separate **activity** because it produces the statement text as shown |
| `reach` vs `submit` | Both hand something over. `submit` hands an artefact to **the app**; `reach` hands the user to **a person**. Nothing is stored but the fact that they went |
| `reach` vs `confirm` | Tapping *Call 14416* is not affirming that something happened. It is the thing happening |

---

## 3 · Activities — 31

### `observe` — no stored response

| activity | requires | produces | renderer |
|---|---|---|---|
| `read` | `content` | — | built |
| `listen` | `media_ref` | — | see §13 |
| `view` | `media_ref` | — | built |
| `complete` | `content` | — | built |
| `table-review` | `source_key` | — | **owed** |
| `paced-breathing` | `pattern` · `cycles` | — | **owed** |

`read` requires `content`. §6.2 of the Notion spec recorded `—`, which is wrong: a `read` block with no content renders an empty card. **Corrected.**

`view` covers watching. There is no separate `watch`.

### `choose`

| activity | requires | produces | renderer |
|---|---|---|---|
| `mcq` | `scale_ref` | `option_id` | built |
| `single-select` | `scale_ref` | `option_id` | built |
| `multi-select` | `scale_ref` | `option_id[]` | built |
| `boolean` | `prompt` · labels | `bool` | **owed** |
| `clinical-instrument` | `scale_ref` · `instrument_ref` | `option_id` | built |

`boolean` is an alias into `mcq` today, so a yes/no is stored as an `option_id` against a two-option scale. Wrong shape, unqueryable as a boolean.

### `share`

| activity | requires | produces | renderer |
|---|---|---|---|
| `text` | `prompt` · `persist` · `length` · `format` | `text` | built |
| `short-text` | `prompt` | `text` | built |
| `ephemeral-journal` | `prompt` | `text` | built |
| `number` | `prompt` | `number` | built |
| `input-table` | `columns` | cell map | built |

`input-table` is the same act, many times, arranged as a grid. **136 live blocks** — a third of everything.

### `share` — added 2026-09-10

| activity | interaction | requires | produces | renderer |
|---|---|---|---|---|
| `list-entry` | share | `prompt` · `min` · `max` | **`string[]`** | **owed** |

**Ruled in.** Type a line, a new empty line appears. Nothing in the catalog produces an unbounded list of the user's own strings — `text` gives one string, `multi-select` gives `option_id[]`, `structured-list` gives fixed authored items ticked, `input-table` gives fixed columns. Gratitude jars, thought records, values lists and goal lists are all this one shape, which makes it the most reusable missing activity found so far.

### `locate`

| activity | requires | produces | renderer |
|---|---|---|---|
| `date` | `prompt` | `date` | see §13 |
| `time` | `prompt` | `time` | **owed** |
| `date-time` | `prompt` | `datetime` | **owed** |
| `location` | `prompt` · `precision` | `place` | **owed** |

`time` is **not expressible at all today** — bedtime and wake time are free text in the sleep diary, which is why sleep duration cannot be computed.

### `confirm`

| activity | requires | produces | renderer |
|---|---|---|---|
| `structured-list` | `items` | `item_id[]` | built |
| `check-grid` | `columns` · `rows` | boolean map | **layout owed** |
| `consent` | `statement` · `required` | `bool` + timestamp + statement as shown | **owed** |

`consent` produces the statement text **exactly as shown**. A stored `true` with no record of what was agreed is worthless in an audit.

### `rate` · `order` · `measure` · `submit`

| activity | interaction | requires | produces | renderer |
|---|---|---|---|---|
| `rating-scale` | rate | `scale_ref` | `option_id` | built |
| `slider` | rate | `min` · `max` · `step` | `number` | **owed** |
| `ranking` | rate · order | `items` | `item_id[]` ordered | see §13 |
| `timer` | measure | `mode` · `target` | `duration` | **owed** |
| `upload` | submit | `accepted_types` · `source: pick` | `file_ref` | built |
| `record` | submit | `prompt` · `max_duration` · `source: capture` | `audio_ref` | **owed** |

`slider` and `rating-scale` are the same gesture at two ranges — a five-point scale offers steps the app owns, a slider a continuum it does not. Different outputs, so two activities.

`timer` is the definition working literally: start, wait, stop, product is a duration. **Not `number` with a stopwatch skin** — a measured duration and a typed one are different evidence.

### `reach`

| activity | interaction | requires | produces | renderer |
|---|---|---|---|---|
| `crisis-contact` | observe · reach | `contacts_ref` | `{ route, at }` — which route was taken, or `dismissed` | **built as a modal, not as a block** — see §9.1 |

It stores no answer. It stores that the user was offered help and what they did with the offer, which is the only thing worth knowing afterwards and the only thing that can be audited. `contacts_ref` points at a catalog set the way `scale_ref` does; today the four numbers are hardcoded in `CrisisSupport.tsx` and cannot be regionalised.

### The seven that carry two interactions

| activity | why |
|---|---|
| `paced-breathing` | Follow the pacer (`observe`) for a bracketed span (`measure`) |
| `complete` | Read the closing card (`observe`), acknowledge the day is done (`confirm`) |
| `table-review` | Read your own series back (`observe`), affirm it is right (`confirm`) |
| `boolean` | `choose` when it answers a question, `confirm` when it reports what you did |
| `clinical-instrument` | `choose` an option that carries a score — the choosing is also a `rate` |
| `ranking` | Judge each item's value (`rate`) to sequence them (`order`) |
| `crisis-contact` | Read what is on offer (`observe`), take one of the routes (`reach`) |

**Totals.** Response-producing: **24 of 30**. Scale-backed: **5** — `mcq`, `single-select`, `multi-select`, `rating-scale`, `clinical-instrument`. `slider` and `boolean` are deliberately not scale-backed; that is the point of separating them.

---

## 4 · Labels — 7

Device-bound. They change how something is drawn, never what it is.

| label | values | applies to |
|---|---|---|
| `layout` | `single` · `list` · `grid` | any activity. **`grid` degrades to `list` on a narrow screen** — same activity, same interaction, same stored answer |
| `display` | `emoji` · `nps` · `dropdown` · `image` | every `choose` activity and `rating-scale`. **`image` works on all of them** |
| `format` | `email` · `phone` · `url` | `text` |
| `cardinality` | `one` · `many` | `choose` activities |
| `source` | `pick` · `capture` | `submit` activities |
| `persist` · `length` | — | `share` activities |
| `mode` | `up` · `down` | `timer` |

### Things that are labels, not activities

Each was asked for by name. Each produces data an existing activity already produces, with the same provenance.

| asked for | is | mechanism |
|---|---|---|
| emoji check-in | `rating-scale` | `display: emoji` |
| NPS | `rating-scale`, 1–5 | `display: nps` |
| dropdown | `single-select` | `display: dropdown` |
| picture choice | `single-select` / `multi-select` | `display: image` |
| email · phone · URL | `text` | `format:` |
| rank 1–5 | **ambiguous** | Five items in order is `ranking`. Scoring one thing 1 to 5 is `rating-scale` |

**`display: image` is a label, but it is not free.** Options come from `scale_ref`, so the **catalog scale rows need an `image` field** before it has anything to display. That schema change is the real cost.

---

## 5 · Block types — 17

Policy columns: `auto` = autoAdvance · `back` = navigationBack · `score` = scoringEnabled · `exit` = saveOnExit · `toggle` = saveOnToggle.

| type | about | use | activities | steps | policy | rules |
|---|---|---|---|---|---|---|
| `lesson` | Formatted content the user **reads**. No clock, no answer | Teaching — the passage before the exercise that applies it. **119 live.** 27 carry an `image_url`; **none is video or audio** | read | allowed | auto ✗ · back ✓ | produces no response |
| `session` | A single timed media practice — audio, video, or a pacer | The practice itself, not the teaching about it. A 13-minute guided imagery. **0 live as a type** | listen · view · paced-breathing | not allowed | auto ✗ · back ✓ · **transport** · **completion** | requires `media_ref` · one activity, no steps · **produces a response** — see §5.1 |
| `exercise` | The interactive block — everything filled in, picked, ranked or handed over | Any question producing an answer. **49 live.** The workhorse | mcq · single-select · multi-select · boolean · rating-scale · slider · input-table · check-grid · structured-list · **list-entry** · number · timer · date · time · date-time · location · ranking · upload | allowed | auto ✗ · back ✓ · toggle ✓ | requires an activity · requires `key` · scale-backed needs `scale_ref` |
| `journal` | Free-text writing against a prompt | When the value is the writing, not a scoreable answer. **8 live** | text · short-text · ephemeral-journal · **list-entry** · record | allowed | auto ✗ · back ✓ · exit ✓ | requires `prompt` · requires `key` |
| `checklist` | A list of items ticked off | Confirming actions taken, not capturing data | structured-list | allowed | auto ✗ · back ✓ · toggle ✓ | requires `items` · requires `key` |
| `reflection` | A closing prompt asking the user to look back | End of a session, when a considered answer beats a quick one | mcq · single-select · rating-scale · text · ephemeral-journal · record | not allowed | auto ✗ · back ✗ | — |
| `conclude` | The day's closing card | Always last. **95 live** | complete | not allowed | auto ✗ · back ✓ | **last block on a day** · produces no response |
| `quiz` | Scored knowledge check | Comprehension after teaching. Forward-only so an answer cannot be revised | mcq · single-select · multi-select · boolean · rating-scale | not allowed, 1 per step | auto ✓ · back ✗ · **score ✓** | ⚠ keep to 5–10 questions |
| `sleep-diary` | A day-by-day grid filled in nightly | Where the **series** is the clinical value, not any one night | input-table · date · time · date-time · table-review | not allowed | auto ✗ · back ✓ · toggle ✓ | requires `columns` · requires `key` · `table-review` requires `source_key` |
| `onboarding` | Day 0, before the programme starts | Consent, orientation, and the profile questions that shape everything after | mcq · single-select · multi-select · boolean · text · short-text · date · consent | allowed, 1 per step | auto ✓ · back ✗ · score ✗ | ⚠ runs once, before day 1 |
| `assessment` | Scored baseline using validated clinical instruments | Severity at intake — PHQ/GAD shape. Forward-only so a baseline cannot be revised | mcq · single-select · clinical-instrument | not allowed, 1 per step | auto ✓ · back ✗ · **score ✓** | ⚠ the only type that may hold a `clinical-instrument` |
| `learning` | Concept introduction | The teaching day — a lesson plus at least one interaction to check it landed | mcq · single-select | allowed, **required**, 1 step per lesson | auto ✗ · back ✓ | ⚠ must include ≥1 interaction |
| `practice` | Applying a concept to the user's own situation | Data-capture days. Saves on exit because the user is mid-writing | multi-select · input-table · structured-list · **list-entry** · number · timer · text · short-text · record · location · upload | allowed | auto ✗ · back ✓ · **exit ✓** | ⚠ state whether responses are stored or private |
| `workshop` | Multi-step structured thinking | Ideation done in stages — where blocks must be grouped, not scrolled | multi-select · input-table · text · ephemeral-journal · **list-entry** · ranking · upload | allowed, **required**, max 3 | auto ✗ · back ✓ | ✕ no StepGroups · ✕ >3 per group · ✕ mixed intent in one group |
| `tracker` | The same instrument, repeated daily | Habits and streaks. Should stay identical day to day so the series is comparable | check-grid · input-table · structured-list · rating-scale · slider · boolean · number · timer | not allowed | auto ✗ · **toggle ✓** | ⚠ should stay identical across days |
| `support` | A routing card. Names what is on offer and hands the user to a person | Authored at the end of a module on a heavy topic, and fired by policy when a risk indicator trips. **0 live** — it exists today as a modal, not a block | crisis-contact | not allowed | auto ✗ · back ✓ · score ✗ · **risk: surface** | requires `contacts_ref` · always dismissible · never counts toward day completion · **may not be the last block** — `conclude` still closes the day |
| `check-in` | A one-to-three question daily pulse | Mood sampling. Under two minutes, forward-only, no scoring | mcq · single-select · multi-select · boolean · rating-scale · slider · text · short-text | not allowed, 1 per step | auto ✓ · back ✗ · score ✗ · **exit ✓** | ⚠ under 2 min |

### Retired

| retired | why | where the work goes |
|---|---|---|
| `rest` | The only row with an empty activities list. A block type that permits nothing is not a block type — it is a day with no task wearing one | One `lesson · read` (the gentle prompt) plus one `conclude · complete`. Retire **inside the §19 day-type removal** |
| `assessment-lite` | Differed from `assessment` on four things, three of them policy flags. The one substantive difference — `clinical-instrument` — is what earns `assessment` its place, not the absence of scoring | `check-in` for a short forward-only pulse, `reflection` for a looking-back prompt. **Per block; no safe blanket default** |
| `comparison-matrix` *(activity)* | Identical to `input-table` — same interaction, same `columns`, same cell map | `input-table` with fixed rows |

**`conclude` stays**, and retiring `rest` *depends* on it: `conclude` is what closes the rest day.

### 5.1 · `session` — the ruling, and what it costs

**Ruled 2026-09-10: media is not `lesson`.** The test that follows is sharper than anything proposed before it:

> **If it has a duration, it is not a lesson.** `lesson` is content with no clock.

| | |
|---|---|
| `lesson` | keeps `read`. Loses `listen` · `view` · `paced-breathing` |
| `session` | takes all three, plus `transport`, `completion` and a response key |
| `practice` | loses `paced-breathing` — a pacer has a clock, so it goes with the rest |
| count | 16 → **17**. Back to 16 if `sleep-diary` retires as §15 proposes |

**It resolves a contradiction the model already had.** §5 says `lesson` produces no response; a media block that resumes at 2:19 has state, and state needs a response key. Cutting media out lets `lesson` keep *no response* honestly and gives `session` the key that resume, furthest-point and completion threshold all need:

```
{ position, furthest, completed }
```

**Counted 2026-09-10 — the retype set is zero.** Of 119 live `lesson` blocks, **27 carry an `image_url` and not one is video or audio**: no `.mp4`, no `.webm`, no YouTube, no Vimeo. A still image has no clock, so under the duration test all 27 stay `lesson`.

> **`session` is purely additive. There is no migration.** The type can be introduced, its renderers built and its policy fields wired without touching a single stored block. That moves it from a risky retype to one of the safest items in §15.

**Two things still open.** The **name** — `session` also means a therapy appointment, which this product will eventually have; `guided` and `player` are unoverloaded alternatives. And whether a 40-second explainer video inside a teaching day is a `session` or a `lesson`: by the duration test it is a `session`, which means teaching days carry two block types where they carried one, and the builder has to make that obvious or authors will get it wrong.

---

### 5.2 · The matrix, and one hole it exposed

The model is not 17 screens. It is **93 permitted (block type × activity) pairs**, and rendering every one is what found this:

> **`list-entry` was declared in §3 and permitted by no block type.** An orphan activity — authorable nowhere. Fixed above by adding it to `exercise`, `journal`, `practice` and `workshop`, the four types whose use cases are the reason it was proposed.

**Every activity must appear in at least one type's permitted list.** Nothing enforced that, and nothing will until `validateDay` reads the permitted lists off the catalog rather than out of this document.

| | |
|---|---|
| Pairs | **93** |
| Types carrying the most | `exercise` **18** · `practice` **11** · `tracker` **8** · `onboarding` **8** · `check-in` **8** |
| Types carrying one | `lesson` · `checklist` · `conclude` · `support` |
| **Pairs whose activity has no renderer** | **36 of 93** |

**36 of 93 pairs cannot be drawn today.** A block carrying one of those activities falls to `default: renderLesson()` and draws reading content. That is the true size of §13 — four times what "ten activities owed" sounded like.

**Ruled 2026-09-10: close it.** The 12 missing renderers, in build order, with the pairs each one unblocks:

| # | activity | unblocks | why here |
|---|---|---|---|
| 1 | `table-review` | 1 pair — `sleep-diary` | `read` arranged as a grid. Cheapest on the list and the highest value: a series nobody sees is a series nobody benefits from |
| 2 | `slider` | 4 — `exercise` · `tracker` · `check-in` | Needs the band map with it (§9.3). Without the band a number means nothing |
| 3 | `boolean` | 5 — `exercise` · `quiz` · `onboarding` · `tracker` · `check-in` | Most pairs unblocked per line of code in the whole list |
| 4 | `check-grid` | 2 — `exercise` · `tracker` | Renderer exists; what is owed is the `layout` degrade |
| 5 | `list-entry` | 4 — `exercise` · `journal` · `practice` · `workshop` | The `string[]` shape nothing else produces |
| 6 | `date` · `time` · `date-time` | 6 — `exercise` · `onboarding` · `sleep-diary` | One control, three configs. Ship together |
| 7 | `timer` | 3 — `exercise` · `practice` · `tracker` | Produces a measured duration, not a typed one |
| 8 | `paced-breathing` | 1 — `session` | Pattern + cycles. Settle the pattern set first (§13) |
| 9 | `consent` | 1 — `onboarding` | Stores the statement as shown. Blocks nothing else, but it is the first thing a user meets |
| 10 | `record` | 3 — `journal` · `reflection` · `practice` | Answer retention before it is built (§13) |
| 11 | `location` | 2 — `exercise` · `practice` | Answer precision before it is built (§13) |
| 12 | `crisis-contact` | 1 — `support` | The component exists; what is owed is the block wrapper and `contacts_ref` (§9.1) |

**`listen` is already built** (`renderListen`, line 420) — the viewer marking it *Wired, unused* was right and §6.0 of the Notion spec was wrong. That resolves the contradiction flagged in §13.

**1–5 are 16 of the 36 pairs and need no decision.** Start there.

---

## 6 · Policy — what a block type guarantees

Policy is **not** authored per block. It belongs to the type, which is the whole reason types exist.

| field | what it controls |
|---|---|
| `autoAdvance` | The player moves on without a tap |
| `navigationBack` | Whether an answer can be revised after seeing the next question. **Off on every scored type** |
| `scoringEnabled` | Whether responses roll into a score. `assessment` and `quiz` only |
| `saveOnExit` | Writes when the user leaves mid-block. For types where they are mid-writing |
| `saveOnToggle` | Writes on every tap. For grids and checklists |
| `risk` | Whether the type honours `is_risk_indicator`, and what fires when one trips. `none` · `surface` · `gate` |
| `transport` | **Ruled in.** What the user may do to the playhead. `free` · `forward-locked` · `none`. Without it, scrub-to-end is a hole in any gate that waits on a `session` |
| `completion` | **Ruled in.** What counts as done. `any` · `threshold(N%)` · `full` · `all-visited`. Not media-only — a list whose rows must each be opened is `all-visited` |
| step rules | `allowed` · `required` · max per group · one per step |

### `risk` — ruled 2026-09-10, and switched on

`AssessmentFlow.tsx` reads `q.is_risk_indicator === true` per question and fires a crisis pathway **once per run**. That is policy behaviour, authored on content, honoured by one screen.

`CRISIS_ON_ANSWER_ENABLED` has been off sitewide, with the comment that re-offering the panel on every later answer was worse than not offering it at all — so `is_risk_indicator` sat authored on live content doing nothing.

> **Ruled: `risk` is a real policy field, and the flag is switched on.** The once-per-run rule that caused the flag to be disabled is the field's own guarantee, enforced for every type at once rather than per screen. Turning it on without `risk` reintroduces the original bug; turning it on **with** `risk` is the fix. Ship them in one deploy — never the flag alone.

`risk` closes that. It is a **type** guarantee; the flag itself is authored on content — the two meet here, which is the whole shape of policy.

> **Corrected 2026-09-10.** This section first said the flag is authored *per question*. That is wrong. In the competitor audit, screen 678 is an `exercise · multi-select` where **one option** — *"Thoughts of hurting someone"* — is the risk, and the flow proceeds. **`is_risk_indicator` must attach to a catalog option, a `scale_ref` row, not only to a question**, or every checklist in the app has that hole. Amend before building step 9b.

| value | what it means | carried by |
|---|---|---|
| `none` | The type may not carry risk indicators. An author who sets one on this type gets a validation error, not silence | every type not listed below |
| `surface` | A tripped indicator surfaces `support` **once per run**, non-blocking. The run continues | `assessment` · `check-in` · `journal` · `reflection` |
| `gate` | Surfaces `support` and the run does not continue until acknowledged | **nothing.** Named so the field has a top end, and so nobody invents a fourth value later |

**State, plainly:** only `assessment` reads the flag today. `journal` and `reflection` need a text scan that does not exist, so they carry `risk: surface` in the declaration and honour nothing until that scan ships. `check-in` needs only the option-level read below.

**Enabling order — three steps, in this order, and the flag is last:**

1. `contacts_ref` as a catalog set, replacing the four hardcoded numbers.
2. `risk` on the type, option-level `is_risk_indicator`, once-per-run enforced centrally, `support` authorable as a block.
3. **Then** `CRISIS_ON_ANSWER_ENABLED = true`.

**Once per run is the rule, not an implementation detail.** It is the reason the flag was switched off. It belongs in policy where it is enforced for every type at once, not in a per-screen ref.

---

## 7 · Limits and rules

| rule | statement |
|---|---|
| **Response identity** | `activityConfig.key`, falling back to `block.id`. Read via `responseKeyOf(block)`. Every response-producing activity needs one, or the answer is unreachable |
| **One flat list** | **Ruled.** A block type cannot hold another block type. There is one flat list of **17** — no stages, no day config, no second class, ever. Behaviour is expressed by **policy** on the type (`autoAdvance`, step rules, `transport`, and the rest), never by nesting one type inside another |
| **Three duplicate activities are retained** | `mcq` ≡ `single-select`; `short-text` ≡ `ephemeral-journal` ≡ `text`. Retained by ruling. The cost is permanently split data and two picker entries doing one job. Nothing renders wrong |
| **Every activity must be permitted somewhere** | An activity in no type's permitted list is authorable nowhere. `list-entry` was in that state until §5.2. `validateDay` must read the permitted lists off the catalog and fail a build that orphans one |
| **Storage shape** | `completedDays[day].responses[identity]` — day first, identity second, so N days give N answers |
| **Catalog id freeze** | An id is minted once and never regenerated. An id keeping a retired name is the freeze working, not a defect. Proven on `watch → view`: the row is still `cat-interaction_type-watch` |
| **A block type cannot hold another block type** | There is one flat list of 15. No stages, no day config, no second class |
| **A day does not carry a type** | Templates seed a day's blocks and policy; they never constrain it afterwards. §19 removes the last of it |
| **Aliases are code, not catalog** | 55 legacy terms normalise **before** the resolver. Never counted in any vocabulary total |
| **Dual-write** | `equip:` (admin) and `equip_program:` (user-facing) are written together and replayed independently, never copied. `equip_program_by_slug:` is a stale mirror, deliberately untouched |
| **Proof of neutrality** | Every data change is verified against a fresh backup: activity buckets identical, resolved-interaction distribution unchanged, **both prefixes** |
| **Never bare `git add`** | Stage explicit paths. On 2026-09-08 a broad `git add -A` swept another session's in-flight files into a blocks commit |

### Aliases — ruled 2026-09-10, classified and ordered

**An alias that changes the output shape is a migration. An alias that keeps it is a re-point.**

| alias | today | after | risk |
|---|---|---|---|
| `slider` | → `rating-scale` | **remove** | **migration** — renders as a rating scale today and saves `option_id`; as an activity it needs `min`/`max`/`step` those blocks lack, and saves a `number`. **History is lost, not converted** |
| `boolean` · `yes_no` | → `mcq` | **remove** | **migration** — `option_id` becomes `bool` |
| `emoji_scale` | → `rating-scale` | keep | care needed — must also set `display: emoji` or the intent is silently lost |
| `single_choice` · `mcq_single` | → `mcq` | unchanged | none |
| `free_text` · `journal` · `long_text` | → `ephemeral-journal` | unchanged | none |
| `matrix` · `comparison_matrix` | → `comparison-matrix` | → `input-table` | re-point |

**Counted 2026-09-10, read-only, against `kv_store_cc205da9`.** All 420 live equip blocks:

| stored spelling | live | verdict |
|---|---|---|
| `matrix` | **8** — 5 `exercise`, 3 `tracker` | **re-point.** Declared nowhere; reaches the resolver's default case. Same columns, same cell map, same output → `input-table`. Do it now |
| `scale` | **1** — `exercise` | **migration.** Stored as `scale` with `constraints: {min:3, max:9}` and no `scale_ref`. It is already a `slider` in everything but name → `slider`, and the constraint pair becomes `min`/`max`/`step` |
| `number` | **1** — `exercise` | **re-point.** `number` is a declared activity. The block is correct and the term simply predates the catalog |
| `slider` · `boolean` · `yes_no` · `emoji_scale` | **0** | **nothing to migrate.** The two rows above them in this table describe a risk that does not exist in live data. They are re-points on an empty set — remove the aliases and move on |
| `single_choice` · `mcq_single` · `free_text` · `long_text` · `comparison_matrix` | **0** | remove |

**The whole alias question is 10 blocks, and 9 of them are re-points.**

**And one violation the same count exposed:** `checklist` permits `structured-list` only, and **6 live blocks are `checklist × multi-select`** against 1 correct one. Either the permitted list is wrong or the blocks are. Retyping them to `exercise` keeps the render identical; leaving them means the permitted list is decoration.

> **Ruled: do it now.** One migration (`scale` → `slider`, a single block), nine re-points, and every remaining alias deleted from `resolveInteraction()` so the fifth vocabulary living in that switch stops existing.

**One thing this does not cover.** `activity` is **null on all 420 blocks** — the §26 vocabulary is not written to a single one. The aliases above are `subtype` spellings, not activity spellings. Re-pointing them is worth doing and is **not** the backfill; the backfill is still owed and is the larger job.

---

## 8 · Use cases — which type, and why

| the author wants to | type | not |
|---|---|---|
| Teach something | `lesson` | `learning` — that is a whole day, not a block |
| Ask one question that produces an answer | `exercise` | `quiz` unless it is scored |
| Score comprehension | `quiz` | `exercise` — scoring is a type guarantee, not a toggle |
| Establish clinical severity | `assessment` | anything else. It is the only type that may hold a `clinical-instrument` |
| Sample mood daily, briefly | `check-in` | `tracker` — that is the heavy series |
| Track the same instrument daily | `tracker` | `sleep-diary`, which is a `tracker` with fixed columns (§14) |
| Ask for considered writing | `journal` | `reflection` unless it is looking back |
| Close a session by looking back | `reflection` | `conclude` — that ends the day, it does not ask |
| End the day | `conclude` | anything. It is always last |
| Group thinking into stages | `workshop` | `practice` — that is capture, not staging |
| Capture the user's own situation | `practice` | `exercise` — that is one question, this is a day |
| Take consent | `onboarding` | anywhere else, until §15 rules otherwise |

### `sleep-diary` · `tracker` · `reflection` — the confusion, named

**One question separates them: does the value live in the series, or in the single answer?**

| | value lives in | repeats | comparable |
|---|---|---|---|
| `tracker` | the series | daily | yes — that is the point |
| `sleep-diary` | the series | nightly | yes |
| `check-in` | the series, lightly | daily | yes |
| `reflection` | **the single answer** | no | no |

Delete one reflection and you lose one answer. Delete one day from a tracker and you damage the trend.

Second axis, weight: **heavy series (`tracker`) · light series (`check-in`) · single answer (`reflection`)**.

### Is it a label? — no. Answered 2026-09-10

The question that separates `sleep-diary`, `tracker` and `reflection` is *does the value live in the series, or in the single answer* — and that is **not** a label.

A label is device-bound: it changes how something is drawn and never what it is. `grid → list` is a label because the stored answer is byte-identical either way.

*The value lives in the series* changes three things a label cannot touch:

| | |
|---|---|
| **The block repeats** | It appears on many days under one stable identity — a `repeat` rule, not a drawing |
| **It must not change between days** | An author editing the columns on day 9 breaks days 1–8. That is a guarantee the type makes |
| **The read-back is part of the instrument** | `table-review` reads the series. On a single-answer block there is nothing to read back |

All three are **policy**. So the axis is:

- **`tracker`** — the series is the value. Repeats, identical daily, `saveOnToggle`, carries `table-review`.
- **`reflection`** — the single answer is the value. Does not repeat, back-navigation off, one considered answer at the end of a session.
- **`sleep-diary`** — a `tracker` whose columns happen to be sleep questions. **Content wearing a block type**, which is the same smell as `mcq` beside `single-select`, one level up.

**`sleep-diary` is `tracker` with fixed columns.** Same instrument daily, series is the value, `saveOnToggle`, no step groups, built on `input-table`. The only structural difference is `table-review`, which `tracker` should have anyway. It is a content instance wearing a block type — the same smell as `mcq` beside `single-select`, one level up. **Proposed retirement in §15.**

---

## 9 · The completion card is a block — ruled 2026-09-10

The card at the end of every day is drawn by `ProgramPlayer.tsx` after the last block: no id, no activity, no interaction, no response identity. An author cannot edit, reorder or remove it.

> **Ruled: it is a `conclude` block and nothing else.** There is no separate ending, no player-owned card, no third thing between the block list and the screen. The player renders the day's blocks; the last one happens to be a `conclude`.

It is currently assembled from three sources, and each one is replaced:

| part | source today | dynamic? | **replaced by** |
|---|---|---|---|
| Title | `dayConfig.completionTitle` in `day-layout.ts`, **keyed by day type** | By type only, never by author | `block.title` |
| Body | Hardcoded literal, `ProgramPlayer.tsx:423` | **No.** One string for every type | `block.content` |
| Button | `program.daily_content.length === 1 ? 'View Results' : 'Continue Journey'` | **On programme length** | the day's own CTA, the same rule every other block uses |

**Then delete `completionTitle` from `day-layout.ts`** — it goes with the day types under §19, and the file still carries the retired `assessment-lite` and `rest` keys.

Three defects follow:

1. **The body lies on half the types.** *"Your results are ready"* renders on a `tracker` and a `reflection`, which produce no results.
2. **It ignores the map built for it.** `DAY_TYPE_LAYOUTS` defines `primaryButtonText: { last, otherwise }` per type — Done/Next, Complete/Continue, Save, Complete Reflection — and the completion button reads none of it.
3. **`day-layout.ts` is keyed by day type, which §19 removes**, and still contains `assessment-lite` and `rest`, both retired in `1b22ceaa`.

**The mapping is already in the vocabulary:** `conclude` · `complete` · `observe · confirm` · `layout: single` · requires `content` · produces nothing. The screen does by hardcode what a block does by data — and then draws a second, unauthored ending on top of the **95 `conclude` blocks that already exist**.

**The snag, and its fix:** some days have no `conclude` authored, which is what the hardcode covers. `validateDay` requires one on every published day, and the composer appends a default when an author adds a day. §5 already says *last block on a day* — that rule simply has to be enforced instead of worked around.

**One live block to fix while in there:** *"Do continue with the trackers and slep diary"* — Sleep Tight day 30, the final screen of a 30-day programme.

---

## 9.1 · Crisis support — in the vocabulary, and switched on

**It was in this document and not in the vocabulary. That is fixed here.** The objection was that a crisis panel is not something a user *does*, so as an activity an author could drop one into a checklist. The objection was wrong about the first half and right about the second: the user does do something — they place a call — and the way to stop it appearing in a checklist is **policy and type rules**, not omission from the catalog.

So it enters as three things, not one:

| layer | what | where |
|---|---|---|
| interaction | `reach` — contacting a human outside the app | §2 |
| activity | `crisis-contact` — `observe · reach`, requires `contacts_ref`, produces `{ route, at }` | §3 |
| block type | `support` — never scored, never blocking, always dismissible, `risk: surface` | §5 |

### One renderer, one entry point

`CrisisSupportProps.triggerReason` is `'keywords' | 'user_request' | 'assessment_score'`. Only two of those are ever a block:

| trigger | becomes |
|---|---|
| `assessment_score` | policy — `risk: surface` fires the `support` block once per run |
| authored | an ordinary `support` block placed by the author at the end of a heavy module |
| `keywords` | policy — same firing, once a text scan exists. **It does not today** |
| `user_request` | a `support` block opened as a route, from the header |

> **Ruled 2026-09-10: the modal goes.** I argued it should stay for `user_request` because that entry is a navigation action rather than part of a day. Overruled, and the ruling is better: a second component drawing the same four numbers is a second place for them to drift, a second thing to regionalise, and a second surface where nothing about the offer is recorded.

**One renderer, one entry point.** `CrisisSupport.tsx` becomes the `crisis-contact` renderer and nothing else. `triggerReason` stops being a prop and becomes the block's own provenance — `{ route, at, trigger }` — so *how the offer arrived* is stored alongside *what the user did with it*.

**What that costs, stated:** the header action needs a route that mounts a standalone `support` block outside any day, and it must not write into `completedDays`. That is the one piece of real work the ruling adds, and it is what makes the offer auditable from the header as well as from inside a programme.

### What this buys, stated plainly

1. **The offer is auditable.** `{ route, at }` under a response key answers *was help offered, and did they take it* — today nothing is written at all.
2. **The numbers can be regionalised.** 14416, 9152987821, 9820466726 and 112 are hardcoded in `CrisisSupport.tsx`. `contacts_ref` makes them a catalog set, like every option list already is.
3. **`once per run` moves to policy**, which is why the flag was disabled. Fix it there and it is fixed for every type.

### The rules that stop the abuse the objection worried about

- `support` permits exactly one activity, `crisis-contact`, and `crisis-contact` is permitted on no other type.
- `support` may not be the last block on a day. `conclude` still closes.
- `support` never counts toward day completion and never scores. A user who dismisses it has completed the day.
- `support` is always dismissible. There is no authored variant that traps someone.

**Still open, and it is a judgement call, not a build question:** whether a `support` block authored inline should be visible in the day's progress count before it fires. Showing it warns; hiding it surprises. Not decided.

---

## 9.2 · The instrument — ruled 2026-09-10, and it is a data-model change

Four competitor exercises audited on 2026-09-10 run one shape:

**Capture → Review → Interpret → Ledger**

| phase | what | our nearest |
|---|---|---|
| Capture | one question per screen | a step. **have** |
| Review | read-back of everything entered, **EDIT \| SAVE** | `table-review` reads *one* block as a grid. **too narrow** |
| Interpret | a section the **app** generated from the answers | **nothing** |
| Ledger | dated entries, reopenable, *Add new* | **nothing** |

We store **one value per block per day** under `responseKeyOf(block)`. That shape holds N dated entries per instrument, independent of any day — one competitor worksheet held three entries from 05:48, 05:49 and 08:12 on one morning.

**An instrument is not a block.** A day *references* one; the instrument owns its own ledger. This is the only item in this document that changes the storage model, and it is the reason five of the seven audit misses collapse into one line.

> **Ruled: build it.** Not "proposed". Everything in capture → review → interpret → ledger waits on this, and without it four of the app's most valuable exercise shapes cannot exist at all.

**The shape, minimally:**

```
instrument:{id}          definition — blocks, review spec, interpretation bands
instrument_entry:{id}:{userId}:{n}   one dated run
                         { startedAt, completedAt, responses, interpretation }
```

A day carries `instrument_ref` instead of a copy of the blocks. `completedDays[day]` records *which entry* was created, not the answers — the answers live with the instrument, where the second and third runs can find them.

**Three rules that fall out of it, and they are not optional:**

| | |
|---|---|
| An entry is immutable once completed | Editing history is how a clinical log stops being evidence. Corrections create a new entry that references the old one |
| The instrument's blocks may change; entries keep the version they were captured under | Otherwise adding a column on day 40 rewrites what someone answered on day 3 |
| `EDIT` on a review reopens the **draft**, never a completed entry | This is the word that is not `navigationBack`, and it applies only before completion |

**Two corollaries, both cheap to state and easy to get wrong:**

- **EDIT is not `navigationBack`.** Back-navigation revises an answer in sequence and is off on every scored type. Reopening a committed draft from a review with every answer loaded is a different act and needs its own word.
- **`interpretation` is authored content selected by a band, not free prose.** *What you should do* comes out of the slider band. That makes the band map (§9.3) load-bearing, not cosmetic.

## 9.3 · Fields the audit found missing — ruled 2026-09-10

| field | on | what it does | why nothing existing covers it |
|---|---|---|---|
| `prompts[]` | `journal` · `text` | scrolling scaffold chips above the box — *Where were you? · What were you doing?* | our `prompt` is singular. An empty textarea is the highest-abandonment element in the flow |
| band map | `slider` · `rating-scale` | value → label → advice. *Calm* at 0, *Slightly Annoyed* at 3 | `scale_ref` maps options; a continuum has none. And §9.2's interpretation reads the band |
| `visible_when` | any block | `{ key, op, value }` — the symptom checklist does not exist until the slider leaves 0 | a rule between two blocks in a step. Not a label, not a policy, not an activity |
| `about` | any block | optional supporting content behind a persistent affordance, non-blocking. Their label for it — *How will this help me?* — is better than ours | nothing. And it generalises past media: every exercise could answer *why am I doing this* without spending a step |
| `revisit_when` | any block | authored re-entry condition — *when you find it hard to fall asleep* | nothing. It is what turns a finished programme into a library navigable by symptom |
| `allow_other` | `scale_ref` | *Add my own* as the last row of a select | output becomes `option_id \| free_text`. **By our own distinguishing test that is a shape change — a migration, not a flag.** Say so before someone ships it as a boolean |
| computed ordering | display | *"We've ranked your triggers"* — the app ranked, not the user | `ranking` is `rate · order`, the **user** sequencing. A displayed ordering derived from prior answers is output, not input |
| content branching | display | which explanation renders is chosen by a prior pick | `source_key` exists on `table-review` only |

**All eight are ruled in.** Sequenced by what they block:

| | field | with |
|---|---|---|
| 1 | **band map** | ships **with** `slider` (§5.2 item 2). A slider without bands stores a number nobody can read, and §9.2's interpretation phase reads the band |
| 2 | `prompts[]` | standalone, one field, fixes the blank box |
| 3 | `about` | standalone. Labelled *How will this help me?*, not a `?` icon — that glyph now means `support` |
| 4 | `revisit_when` | standalone. What turns a finished programme into a library navigable by symptom |
| 5 | `visible_when` | scoped to a step; needs `validateDay` to reject a reference to a key outside the step |
| 6 | `allow_other` | **shape migration.** Sequence with a retype, never alone |
| 7 | computed ordering | needs §9.2 first — a displayed ordering derived from prior answers is the interpretation phase |
| 8 | content branching | generalise `source_key` past `table-review` |

**Not carried forward:** a `commitment` block type for user-set cadence and reminders. Proposed off an earlier screen set, never ruled, so it is named here and not counted.

---

## 9.4 · Content defects — fixed in live data 2026-09-10

Backed up to `backup_pre_content_fix_2026_09_10` (17 rows) before any write. Both `equip:` and `equip_program:` updated together.

| | was | now |
|---|---|---|
| **Risk flag on the wrong item** | `depression-q9` — *"Thoughts that you would be better off dead…"* — **unset**, while `depression-q10`, a functional-difficulty question, was **set** | q9 **set**, q10 **cleared**. `general-q5` was already correct. **This had to land before §15 item 19**, or the flag switches on pointing at the wrong question |
| **"slep diary"** | Final screen of Sleep Tight, day 30 | corrected, both prefixes |
| **Icon collisions** | `lesson`/`learning` both `book-open`; `conclude`/`onboarding` both `flag` | `learning` → `graduation-cap`, `onboarding` → `door-open`. `lesson` keeps `book-open`, `conclude` keeps `flag` |

**Three remain open, because each needs a content decision rather than a fix:**

| | |
|---|---|
| **Placeholder options shipped** | Unburn day 27 — a `checklist` whose three options are **"item 1", "item 2", "item 3"**; Productivity Reset day 3 — "item 4", "item 5". Day 27 of a 30-day programme. **Nobody can invent the intended items** |
| **Test blocks in a published programme** | Productivity Reset **day 8** — `testaxasx` (subtitle `"d "`, body `zdxzdc`), `New Lessonxdsz` (body `xghfdx`), and a conclude titled "New Activity" (body `xdz`). The first is an `onboarding` block on **day 8**, which that type forbids outright. Deleting live content needs saying so |
| **Sleep Diary typing** | Ten clinical rows — four clock times, a count, a duration and a 1–5 rating — all captured as free text, so the series can never be charted. Fixing it means typed columns, which is §15 item 15's shape, not a content edit |

---

## 10 · Live state — read from the viewer, 2026-09-09

| | |
|---|---|
| Live blocks | **420** |
| Declaring a `key` | **222** — so **198 do not** |
| Distinct keys | **104** · 35 used more than once, across 153 blocks |
| Declaring `repeat` | **4** |
| Block types in use | **11 of 17** |
| Interactions ever used | **9 of 17** |
| Legacy terms | **55** |
| Day integrity | 0 days hold no blocks · 0 carry a repeated block id |

| interaction | live | note |
|---|---|---|
| `input-table` | **144** | the workhorse |
| `read` | 118 | |
| `complete` | 95 | |
| `select-one` | 18 | **all 18 incomplete — missing `scale_ref`** |
| `select-many` | 17 | **all 17 incomplete — missing `scale_ref`** |
| `write` | 17 | 1 missing `prompt` |
| `check` | 6 · `rate` 1 · `number` 1 | the `rate` block is **missing `scale_ref`** |
| everything else | **0** | wired, never used |

### The largest live defect, and it is not vocabulary

**36 live blocks are missing a required `scale_ref`** — every `select-one`, every `select-many`, and the single `rate` block. **Every option-based question in the app is incomplete.**

It is a **content** defect. Nothing in this document caused it and nothing in this document blocks it. **Fix it first.**

---

## 11 · Copy rules

Words are design material. Each element does exactly one job.

| rule | |
|---|---|
| **Name things as the user understands them** | *Log your mood*, not *create a check-in entry*. A user manages notifications, not webhook config |
| **A control says what happens** | The button that says *Publish* produces a toast that says *Published*. An action keeps its name through the whole flow |
| **Active voice, sentence case, no filler** | *Save changes*, not *Submit* |
| **Errors explain what went wrong and how to fix it** | No apology, never vague. *A part-finished instrument is not clinically scoreable* beats *Something went wrong* |
| **Empty states are an invitation to act**, not a mood | An empty screen says what to do next |
| **Every figure carries its comparison** | `6h 42m` → *48 minutes above your average*. A number with nothing to compare it to says nothing |
| **Never push a number** | *Your score dropped to 54* arrives with no action attached, and lands hardest on the worst day |
| **Never punish a lapse** | *You broke an 11-day run* is a punishment notification in a burnout product. *19 of 30 days, your longest run was 11 — it is still yours* is the same data |
| **Say what a permission will do** | *One notification a day, only if you have not checked in by 21:00. Nothing else* |
| **Show the working on an inference** | *From 19 check-ins and 19 sleep entries.* An insight that will not show its working is a horoscope |

---

## 12 · UI rules

These are module-wide, and the audit on 2026-09-09 found live violations of four of them.

| rule | |
|---|---|
| **Touch targets ≥ 44px** | The iKan component standard is **48px** for buttons, 16px radius. An audit found targets at 34, 38 and 16px |
| **Contrast AA at every size** | `--ikan-brand-teal-dark` on `--ikan-brand-teal-bg` measures **4.46:1** — fails at 12px, which is exactly what pills use. `--color-status-info` on its wash measures **3.84:1**. Both need an on-wash variant, as `globals.css` already does for muted text and the status colours |
| **Weights 400 and 500 only** | Public UI. Semibold and bold are admin-only. Hierarchy comes from size, colour and space |
| **No component may scroll the page sideways** | Wide content scrolls inside its own container |
| **`layout: grid` degrades to `list`** | Same activity, same interaction, same stored answer. 136 `input-table` blocks get a mobile form out of the axis being named correctly |
| **Visible keyboard focus, reduced motion respected** | Every interactive element |
| **Tokens, never literals** | Every colour, radius, weight and size from `globals.css`. A hardcoded hex is a bug |
| **Re-resolve the ink inside a themed scope** | A token redefined on a container does not reach text that inherited `color` from `body`. This shipped as an unreadable dark mode |
| **Stale data must not look like fresh data** | *Synced 20m ago* and *last synced 6 days ago* rendering identically is a defect. Say what the staleness cost |

---

## 13 · Renderers owed

**11 interactions and modes**, of which two are layouts on renderers that already exist and are therefore cheap.

`crisis-contact` is the eleventh and is a special case: the renderer **exists** as `CrisisSupport.tsx` and is fully built. What is owed is not a renderer but a wrapper — the same component reached as a block, with an id, a response key and `contacts_ref` instead of four hardcoded numbers.

**Build order.** `table-review` first — it is `read` arranged as a grid, the cheapest item on the list and the highest value, because a series nobody ever sees is a series nobody benefits from. Then `layout` properly, including the mobile degrade. Then `paced-breathing` · `timer` · `boolean` · `slider`. Then `time` · `date-time` · `location` · `record` · `consent`.

**Resolved 2026-09-10.** The viewer was right and §6.0 of the Notion spec was wrong: `renderListen` exists at line 420, and `renderRank`, `renderPickDate` and `renderReviewTable` were all added in the same pass. What is actually owed is the **12 renderers in §5.2**, which unblock 36 of the 93 pairs. That list supersedes this one.

---

## 14 · Open — decisions, not code

| | |
|---|---|
| `paced-breathing` pattern | Free-form seconds, or a fixed set (4-7-8, box, coherent). Free-form is more flexible and easier to get clinically wrong |
| `text` default `persist` | `true` or `false`. **0 live blocks** carry `ephemeral-journal` today, so the default is free to choose — but it must be chosen before the first one is authored, not after |
| `location` precision | Coarse or exact coordinates. Health-adjacent personal data — changes storage, retention and the privacy copy, not just the picker |
| `record` retention | Audio is the largest thing this app would hold. Answered before it is built |
| `record` and `timer` at all | Both kept on provenance, not shape. Reject provenance and they collapse into `upload` and `number` **together — one decision, not two** |
| `consent` scope | Onboarding only, or any block type? A consent record that can appear anywhere is harder to audit |
| **`sleep-diary`** | Retire into `tracker` with the sleep columns as a template? **Check first whether anything branches on `type === 'sleep-diary'`** in scoring, reporting or the recommendation engine. If it does, this is a refactor, not a retype |
| **Crisis pathway** | **Closed 2026-09-10.** Vocabulary (`reach` · `crisis-contact` · `support`), policy (`risk`, ruled on), one renderer, one entry point, flag switched on last. See §6 and §9.1. Only one thing stays open: whether an authored `support` block shows in the day's progress count before it fires |
| `complete` vs `read` | `complete` could be `read` plus a last-block policy on `conclude`. Retained by decision; reopenable |
| `slider` as a name | A device word. It survives because a continuum the app does not own is genuinely different from `rating-scale`. Accepted as a primitive borrowing |

---

## 15 · Order

One list. Counted against live data 2026-09-10, read-only. Nothing here rests on an uncounted assumption.

**S** safe, additive, breaks nothing · **D** changes stored data — prove against a fresh backup, both prefixes · **U** changes what a user sees at their worst moment: stage it and watch.

| # | | what | why here |
|---|---|---|---|
| 1 | **S** | **`scale_ref` on every option-bearing block** | It is on **0 of 420**. Not "36 missing" — the field does not exist in live content, so every `mcq`, `single-select`, `multi-select` and `rating-scale` is incomplete. **First in wall-clock terms, and blocked by nothing** |
| 2 | **S** | **`key` on the 198 blocks without one** | Their answers land under generated block ids and are unreachable by name |
| 3 | **S** | **Additive schema** | The 7 labels on `activityConfig`; `image` on catalog scale options; `icon` on every activity row; `read.requires` corrected to `content` |
| 4 | **S** | **Add the catalog rows** for activities declared but unauthorable until their renderers exist | The way owed activities are already handled |
| 5 | **S** | **The 12 renderers, in the §5.2 order** | Items 1–5 of that list are 16 of the 36 blocked pairs and need no further decision |
| 6 | **S** | **The additive fields** — band map (ships with `slider`), `prompts[]`, `about`, `revisit_when` | None break anything |
| 7 | **S** | **`visible_when`** and **`completion`** | New authored rules, scoped to a step |
| 8 | **S** | **`session`** — split media out of `lesson` | **Counted: the retype set is 0.** 27 lesson blocks carry an image, none carries video or audio. Purely additive |
| 9 | **D** | **The activity backfill** | `activity` is **null on all 420 blocks**. The §26 vocabulary is not written to a single one; `subtype` and `interaction` are what is stored. The largest single job in this document, and everything that reads an activity depends on it |
| 10 | **D** | **Re-point 9 alias blocks, migrate 1** | `matrix` ×8 → `input-table` · `number` ×1 unchanged · `scale` ×1 → `slider`. Then delete every alias case from `resolveInteraction()` |
| 11 | **D** | **Retype the 6 `checklist × multi-select` blocks** | Either they become `exercise`, or the permitted list is decoration |
| 12 | **D** | **Rename** `table` → `check-grid` | In place, id frozen |
| 13 | **D** | **The completion card becomes a `conclude` block** | `validateDay` requires one per day; `completionTitle` leaves `day-layout.ts` with the day types under §19 |
| 14 | **D** | **Retire the duplicates and `sleep-diary`** | `rest` goes inside the §19 day-type removal |
| 15 | **D** | **The instrument** (§9.2) | A storage change. Everything in capture → review → interpret → ledger waits on it |
| 16 | **D** | **`allow_other`** | An output-shape migration. Sequence with a retype, never alone |
| 17 | **U** | **`contacts_ref` as a catalog set**, replacing the four hardcoded numbers | Standalone, breaks nothing. First of the three |
| 18 | **U** | **`risk` on the type · option-level `is_risk_indicator` · once-per-run enforced centrally · `support` authorable · the modal deleted** | The fix |
| 19 | **U** | **`CRISIS_ON_ANSWER_ENABLED = true`** | **Last.** The flag alone reintroduces the bug that caused it to be switched off |

**Nothing in 1–8 can lose data. 9–16 can, and each needs a fresh backup and a proof against both prefixes. 17–19 ship together, in that order, staged and watched.**
