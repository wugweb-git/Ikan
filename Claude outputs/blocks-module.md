# iKan — Blocks Module

**The single reference. Supersedes `activities.md` and `vocabulary.md`.**
Revised 2026-09-10.

> **Status.** The model is settled. The catalog is mid-migration — §26 landed in `f1600b1b`, the two block-type retirements in `1b22ceaa`. Live counts in §11 are read from `/admin/block-type-viewer`, not from memory.

**17 block types · 31 activities · 10 interactions · 7 labels · 9 policy fields.**

> **Ruled 2026-09-10.** Media is **not** `lesson`. The test is a clock: *if it has a duration, it is not a lesson.* `lesson` keeps `read`; `listen`, `view` and `paced-breathing` move to a new type — provisionally **`session`**, name not yet ruled. See §5.1.
>
> Everything marked **proposed** below came out of the 15-screen competitor audit (`amaha-screen-audit-2026-09-10.md`, commit `3b60bc76`) and is **not ruled**. It is written here so the model is one document, not two.

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

**`reach` is the only interaction whose destination is not iKan.** Every other gesture ends in a stored value. This one ends in a phone ringing somewhere else. It was added because the crisis panel had nowhere else to sit — see §10.1.

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
| `listen` | `media_ref` | — | see §14 |
| `view` | `media_ref` | — | built |
| `complete` | `content` | — | built |
| `table-review` | `source_key` | — | **owed** |
| `paced-breathing` | `pattern` · `cycles` | — | **owed** |

`read` requires `content`. §6.2 of the old spec recorded `—`, which is wrong: a `read` block with no content renders an empty card. **Corrected.**

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

`input-table` is the same act, many times, arranged as a grid. **144 live blocks** — more than a third of everything.

### `share` — proposed addition

| activity | interaction | requires | produces | renderer |
|---|---|---|---|---|
| `list-entry` | share | `prompt` · `min` · `max` | **`string[]`** | **owed** |

**Proposed.** Type a line, a new empty line appears. Nothing in the catalog produces an unbounded list of the user's own strings — `text` gives one string, `multi-select` gives `option_id[]`, `structured-list` gives fixed authored items ticked, `input-table` gives fixed columns. Gratitude jars, thought records, values lists and goal lists are all this one shape, which makes it the most reusable missing activity found so far.

### `locate`

| activity | requires | produces | renderer |
|---|---|---|---|
| `date` | `prompt` | `date` | see §14 |
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
| `ranking` | rate · order | `items` | `item_id[]` ordered | see §14 |
| `timer` | measure | `mode` · `target` | `duration` | **owed** |
| `upload` | submit | `accepted_types` · `source: pick` | `file_ref` | built |
| `record` | submit | `prompt` · `max_duration` · `source: capture` | `audio_ref` | **owed** |

`slider` and `rating-scale` are the same gesture at two ranges — a five-point scale offers steps the app owns, a slider a continuum it does not. Different outputs, so two activities.

`timer` is the definition working literally: start, wait, stop, product is a duration. **Not `number` with a stopwatch skin** — a measured duration and a typed one are different evidence.

### `reach`

| activity | interaction | requires | produces | renderer |
|---|---|---|---|---|
| `crisis-contact` | observe · reach | `contacts_ref` | `{ route, at }` — which route was taken, or `dismissed` | **built as a modal, not as a block** — see §10.1 |

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
| `lesson` | Formatted content the user **reads**. No clock, no answer | Teaching — the passage before the exercise that applies it. **118 live, an unknown share of which carry `media_ref` and must retype** | read | allowed | auto ✗ · back ✓ | produces no response |
| `session` | A single timed media practice — audio, video, or a pacer | The practice itself, not the teaching about it. A 13-minute guided imagery. **0 live as a type** | listen · view · paced-breathing | not allowed | auto ✗ · back ✓ · **transport** · **completion** | requires `media_ref` · one activity, no steps · **produces a response** — see §5.1 |
| `exercise` | The interactive block — everything filled in, picked, ranked or handed over | Any question producing an answer. **187 live.** The workhorse | mcq · single-select · multi-select · boolean · rating-scale · slider · input-table · check-grid · structured-list · **list-entry** · number · timer · date · time · date-time · location · ranking · upload | allowed | auto ✗ · back ✓ · toggle ✓ | requires an activity · requires `key` · scale-backed needs `scale_ref` |
| `journal` | Free-text writing against a prompt | When the value is the writing, not a scoreable answer. **17 live** | text · short-text · ephemeral-journal · **list-entry** · record | allowed | auto ✗ · back ✓ · exit ✓ | requires `prompt` · requires `key` |
| `checklist` | A list of items ticked off | Confirming actions taken, not capturing data | structured-list | allowed | auto ✗ · back ✓ · toggle ✓ | requires `items` · requires `key` |
| `reflection` | A closing prompt asking the user to look back | End of a session, when a considered answer beats a quick one | mcq · single-select · rating-scale · text · ephemeral-journal · record | not allowed | auto ✗ · back ✗ | — |
| `conclude` | The day's closing card | Always last. **85 live** | complete | not allowed | auto ✗ · back ✓ | **last block on a day** · produces no response |
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
| count | 16 → **17**. Back to 16 if `sleep-diary` retires as §16 proposes |

**It resolves a contradiction the model already had.** §5 says `lesson` produces no response; a media block that resumes at 2:19 has state, and state needs a response key. Cutting media out lets `lesson` keep *no response* honestly and gives `session` the key that resume, furthest-point and completion threshold all need:

```
{ position, furthest, completed }
```

**Unknown, and it is the retype set:** how many of the 118 live `lesson` blocks carry a `media_ref`. Not guessed here — it needs a count off live data, which is step 1 of §16 regardless.

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

Thirty-six of ninety-three pairs cannot be drawn by `BlockRenderer` today — a block carrying one of those activities falls to `default: renderLesson()` and draws reading content. That is the true size of §14, and it is four times what "ten activities owed" sounded like.

---

## 6 · Retained by decision — and what it costs

Three activities the audit found identical are kept.

| retained | identical to | cost |
|---|---|---|
| `mcq` | `single-select` — same interaction, same `scale_ref`, same `option_id` | Two picker entries doing the same thing. Which one an author uses is arbitrary, and the split is permanent in the data |
| `short-text` · `ephemeral-journal` | `text` — all three are `share` · `prompt` · `text` | Three entries, one behaviour. Free-text reporting must know all three names forever |

**The cost is author confusion and permanently split data, not breakage.** Nothing renders wrong.

**The compensation is not a consolation prize.** These three are what make the interaction layer collapse: **29 → 9**, carried by `observe` (6), `choose` (5), `share` (5), `confirm` (5), `locate` (4). Retire them and two of the collapses shrink. The layer earns its keep because of this decision.

**It also shrinks the migration.** Four alias groups now need nothing at all — only `slider` and `boolean`/`yes_no` remain risky.

---

## 7 · Policy — what a block type guarantees

Policy is **not** authored per block. It belongs to the type, which is the whole reason types exist.

| field | what it controls |
|---|---|
| `autoAdvance` | The player moves on without a tap |
| `navigationBack` | Whether an answer can be revised after seeing the next question. **Off on every scored type** |
| `scoringEnabled` | Whether responses roll into a score. `assessment` and `quiz` only |
| `saveOnExit` | Writes when the user leaves mid-block. For types where they are mid-writing |
| `saveOnToggle` | Writes on every tap. For grids and checklists |
| `risk` | Whether the type honours `is_risk_indicator`, and what fires when one trips. `none` · `surface` · `gate` |
| `transport` | **Proposed.** What the user may do to the playhead. `free` · `forward-locked` · `none`. Without it, scrub-to-end is a hole in any gate that waits on a `session` |
| `completion` | **Proposed.** What counts as done. `any` · `threshold(N%)` · `full` · `all-visited`. Not media-only — a list whose rows must each be opened is `all-visited` |
| step rules | `allowed` · `required` · max per group · one per step |

### `risk` — the seventh field, and it does not exist yet

`AssessmentFlow.tsx` reads `q.is_risk_indicator === true` per question and fires a crisis pathway **once per run**. That is policy behaviour, authored on content, honoured by one screen.

**It is currently disabled sitewide** — `CRISIS_ON_ANSWER_ENABLED` is off, with the comment that re-offering the panel on every later answer was worse than not offering it at all. So `is_risk_indicator` is authored on live content and does nothing.

`risk` closes that. It is a **type** guarantee; the flag itself is authored on content — the two meet here, which is the whole shape of policy.

> **Corrected 2026-09-10.** This section first said the flag is authored *per question*. That is wrong. In the competitor audit, screen 678 is an `exercise · multi-select` where **one option** — *"Thoughts of hurting someone"* — is the risk, and the flow proceeds. **`is_risk_indicator` must attach to a catalog option, a `scale_ref` row, not only to a question**, or every checklist in the app has that hole. Amend before building step 9b.

| value | what it means | carried by |
|---|---|---|
| `none` | The type may not carry risk indicators. An author who sets one on this type gets a validation error, not silence | every type not listed below |
| `surface` | A tripped indicator surfaces `support` **once per run**, non-blocking. The run continues | `assessment` · `check-in` · `journal` · `reflection` |
| `gate` | Surfaces `support` and the run does not continue until acknowledged | **nothing.** Named so the field has a top end, and so nobody invents a fourth value later |

**Honestly:** only `assessment` reads the flag today, and `journal` and `reflection` would need a text scan they do not have. Declaring the four is the target, not the state.

**Once per run is the rule, not an implementation detail.** It is the reason the flag was switched off. It belongs in policy where it is enforced for every type at once, not in a per-screen ref.

---

## 8 · Limits and rules

| rule | statement |
|---|---|
| **Response identity** | `activityConfig.key`, falling back to `block.id`. Read via `responseKeyOf(block)`. Every response-producing activity needs one, or the answer is unreachable |
| **Storage shape** | `completedDays[day].responses[identity]` — day first, identity second, so N days give N answers |
| **Catalog id freeze** | An id is minted once and never regenerated. An id keeping a retired name is the freeze working, not a defect. Proven on `watch → view`: the row is still `cat-interaction_type-watch` |
| **A block type cannot hold another block type** | There is one flat list of 15. No stages, no day config, no second class |
| **A day does not carry a type** | Templates seed a day's blocks and policy; they never constrain it afterwards. §19 removes the last of it |
| **Aliases are code, not catalog** | 55 legacy terms normalise **before** the resolver. Never counted in any vocabulary total |
| **Dual-write** | `equip:` (admin) and `equip_program:` (user-facing) are written together and replayed independently, never copied. `equip_program_by_slug:` is a stale mirror, deliberately untouched |
| **Proof of neutrality** | Every data change is verified against a fresh backup: activity buckets identical, resolved-interaction distribution unchanged, **both prefixes** |
| **Never bare `git add`** | Stage explicit paths. On 2026-09-08 a broad `git add -A` swept another session's in-flight files into a blocks commit |

### Alias migration risk

**An alias that changes the output shape is a migration. An alias that keeps it is a re-point.**

| alias | today | after | risk |
|---|---|---|---|
| `slider` | → `rating-scale` | **remove** | **migration** — renders as a rating scale today and saves `option_id`; as an activity it needs `min`/`max`/`step` those blocks lack, and saves a `number`. **History is lost, not converted** |
| `boolean` · `yes_no` | → `mcq` | **remove** | **migration** — `option_id` becomes `bool` |
| `emoji_scale` | → `rating-scale` | keep | care needed — must also set `display: emoji` or the intent is silently lost |
| `single_choice` · `mcq_single` | → `mcq` | unchanged | none |
| `free_text` · `journal` · `long_text` | → `ephemeral-journal` | unchanged | none |
| `matrix` · `comparison_matrix` | → `comparison-matrix` | → `input-table` | re-point |

**It is a migration only if live blocks carry those spellings.** Nobody has counted. That is why counting is step 1.

---

## 9 · Use cases — which type, and why

| the author wants to | type | not |
|---|---|---|
| Teach something | `lesson` | `learning` — that is a whole day, not a block |
| Ask one question that produces an answer | `exercise` | `quiz` unless it is scored |
| Score comprehension | `quiz` | `exercise` — scoring is a type guarantee, not a toggle |
| Establish clinical severity | `assessment` | anything else. It is the only type that may hold a `clinical-instrument` |
| Sample mood daily, briefly | `check-in` | `tracker` — that is the heavy series |
| Track the same instrument daily | `tracker` | `sleep-diary`, which is a `tracker` with fixed columns (§15) |
| Ask for considered writing | `journal` | `reflection` unless it is looking back |
| Close a session by looking back | `reflection` | `conclude` — that ends the day, it does not ask |
| End the day | `conclude` | anything. It is always last |
| Group thinking into stages | `workshop` | `practice` — that is capture, not staging |
| Capture the user's own situation | `practice` | `exercise` — that is one question, this is a day |
| Take consent | `onboarding` | anywhere else, until §16 rules otherwise |

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

**`sleep-diary` is `tracker` with fixed columns.** Same instrument daily, series is the value, `saveOnToggle`, no step groups, built on `input-table`. The only structural difference is `table-review`, which `tracker` should have anyway. It is a content instance wearing a block type — the same smell as `mcq` beside `single-select`, one level up. **Proposed retirement in §16.**

---

## 10 · Chrome that should be a block — the completion card

The card at the end of every day is **not a block.** `ProgramPlayer.tsx` renders it after the last block: no id, no activity, no interaction, no response identity. An author cannot edit, reorder or remove it.

Worse, it is assembled from three sources:

| part | source | dynamic? |
|---|---|---|
| Title | `dayConfig.completionTitle` in `day-layout.ts`, **keyed by day type** | By type only, never by author |
| Body | Hardcoded literal, `ProgramPlayer.tsx:423` | **No.** One string for every type |
| Button | `program.daily_content.length === 1 ? 'View Results' : 'Continue Journey'` | **On programme length** |

Three defects follow:

1. **The body lies on half the types.** *"Your results are ready"* renders on a `tracker` and a `reflection`, which produce no results.
2. **It ignores the map built for it.** `DAY_TYPE_LAYOUTS` defines `primaryButtonText: { last, otherwise }` per type — Done/Next, Complete/Continue, Save, Complete Reflection — and the completion button reads none of it.
3. **`day-layout.ts` is keyed by day type, which §19 removes**, and still contains `assessment-lite` and `rest`, both retired in `1b22ceaa`.

**Where it belongs:** `conclude` · `complete` · `observe · confirm` · `layout: single` · requires `content` · produces nothing. **It is already in the vocabulary.** The screen does by hardcode what a block does by data — and then draws a second, unauthored ending on top of the 85 `conclude` blocks that already exist.

**The snag, stated:** some days have no `conclude` authored, which is what the hardcode covers. Fix in the composer — append a default `conclude`, or have `validateDay` require one on published programmes. §5 already says *last block on a day*.

---

## 10.1 · Crisis support — now in the vocabulary

**It was in this document and not in the vocabulary. That is fixed here.** The objection was that a crisis panel is not something a user *does*, so as an activity an author could drop one into a checklist. The objection was wrong about the first half and right about the second: the user does do something — they place a call — and the way to stop it appearing in a checklist is **policy and type rules**, not omission from the catalog.

So it enters as three things, not one:

| layer | what | where |
|---|---|---|
| interaction | `reach` — contacting a human outside the app | §2 |
| activity | `crisis-contact` — `observe · reach`, requires `contacts_ref`, produces `{ route, at }` | §3 |
| block type | `support` — never scored, never blocking, always dismissible, `risk: surface` | §5 |

### Two entry points, one renderer

`CrisisSupportProps.triggerReason` is `'keywords' | 'user_request' | 'assessment_score'`. Only two of those are ever a block:

| trigger | becomes |
|---|---|
| `assessment_score` | policy — `risk: surface` fires the `support` block once per run |
| authored | an ordinary `support` block placed by the author at the end of a heavy module |
| `keywords` | policy — same firing, once a text scan exists. **It does not today** |
| `user_request` | **stays a modal.** It is a navigation action from the header, not part of any day. Same component, same numbers, no block |

**Do not claim the modal goes away.** It does not. What changes is that the two automatic cases and the authored case stop being a component the author cannot see, and become a block with an id, a response identity, and a place in the day.

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

## 10.2 · The instrument — proposed, and it is a data-model change

Four competitor exercises audited on 2026-09-10 run one shape:

**Capture → Review → Interpret → Ledger**

| phase | what | our nearest |
|---|---|---|
| Capture | one question per screen | a step. **have** |
| Review | read-back of everything entered, **EDIT \| SAVE** | `table-review` reads *one* block as a grid. **too narrow** |
| Interpret | a section the **app** generated from the answers | **nothing** |
| Ledger | dated entries, reopenable, *Add new* | **nothing** |

We store **one value per block per day** under `responseKeyOf(block)`. That shape holds N dated entries per instrument, independent of any day — one competitor worksheet held three entries from 05:48, 05:49 and 08:12 on one morning.

**An instrument is not a block.** A day should *reference* one; the instrument owns its own ledger. This is the only item in this document that changes the storage model, and it is the reason five of the seven audit misses collapse into one line.

**Two corollaries, both cheap to state and easy to get wrong:**

- **EDIT is not `navigationBack`.** Back-navigation revises an answer in sequence and is off on every scored type. Reopening a committed draft from a review with every answer loaded is a different act and needs its own word.
- **`interpretation` is authored content selected by a band, not free prose.** *What you should do* comes out of the slider band. That makes the band map (§10.3) load-bearing, not cosmetic.

## 10.3 · Fields the audit found missing — all proposed

| field | on | what it does | why nothing existing covers it |
|---|---|---|---|
| `prompts[]` | `journal` · `text` | scrolling scaffold chips above the box — *Where were you? · What were you doing?* | our `prompt` is singular. An empty textarea is the highest-abandonment element in the flow |
| band map | `slider` · `rating-scale` | value → label → advice. *Calm* at 0, *Slightly Annoyed* at 3 | `scale_ref` maps options; a continuum has none. And §10.2's interpretation reads the band |
| `visible_when` | any block | `{ key, op, value }` — the symptom checklist does not exist until the slider leaves 0 | a rule between two blocks in a step. Not a label, not a policy, not an activity |
| `about` | any block | optional supporting content behind a persistent affordance, non-blocking. Their label for it — *How will this help me?* — is better than ours | nothing. And it generalises past media: every exercise could answer *why am I doing this* without spending a step |
| `revisit_when` | any block | authored re-entry condition — *when you find it hard to fall asleep* | nothing. It is what turns a finished programme into a library navigable by symptom |
| `allow_other` | `scale_ref` | *Add my own* as the last row of a select | output becomes `option_id \| free_text`. **By our own distinguishing test that is a shape change — a migration, not a flag.** Say so before someone ships it as a boolean |
| computed ordering | display | *"We've ranked your triggers"* — the app ranked, not the user | `ranking` is `rate · order`, the **user** sequencing. A displayed ordering derived from prior answers is output, not input |
| content branching | display | which explanation renders is chosen by a prior pick | `source_key` exists on `table-review` only |

**Not carried forward:** a `commitment` block type for user-set cadence and reminders. It was proposed off an earlier screen set and has not been ruled, so it is named here and not counted.

---

## 11 · Live state — read from the viewer, 2026-09-09

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
| `complete` | 94 | |
| `select-one` | 18 | **all 18 incomplete — missing `scale_ref`** |
| `select-many` | 17 | **all 17 incomplete — missing `scale_ref`** |
| `write` | 17 | 1 missing `prompt` |
| `check` | 6 · `rate` 1 · `number` 1 | the `rate` block is **missing `scale_ref`** |
| everything else | **0** | wired, never used |

### The largest live defect, and it is not vocabulary

**36 live blocks are missing a required `scale_ref`** — every `select-one`, every `select-many`, and the single `rate` block. **Every option-based question in the app is incomplete.**

It is a **content** defect. Nothing in this document caused it and nothing in this document blocks it. **Fix it first.**

---

## 12 · Copy rules

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

## 13 · UI rules

These are module-wide, and the audit on 2026-09-09 found live violations of four of them.

| rule | |
|---|---|
| **Touch targets ≥ 44px** | The iKan component standard is **48px** for buttons, 16px radius. An audit found targets at 34, 38 and 16px |
| **Contrast AA at every size** | `--ikan-brand-teal-dark` on `--ikan-brand-teal-bg` measures **4.46:1** — fails at 12px, which is exactly what pills use. `--color-status-info` on its wash measures **3.84:1**. Both need an on-wash variant, as `globals.css` already does for muted text and the status colours |
| **Weights 400 and 500 only** | Public UI. Semibold and bold are admin-only. Hierarchy comes from size, colour and space |
| **No component may scroll the page sideways** | Wide content scrolls inside its own container |
| **`layout: grid` degrades to `list`** | Same activity, same interaction, same stored answer. 144 `input-table` blocks get a mobile form out of the axis being named correctly |
| **Visible keyboard focus, reduced motion respected** | Every interactive element |
| **Tokens, never literals** | Every colour, radius, weight and size from `globals.css`. A hardcoded hex is a bug |
| **Re-resolve the ink inside a themed scope** | A token redefined on a container does not reach text that inherited `color` from `body`. This shipped as an unreadable dark mode |
| **Stale data must not look like fresh data** | *Synced 20m ago* and *last synced 6 days ago* rendering identically is a defect. Say what the staleness cost |

---

## 14 · Renderers owed

**11 interactions and modes**, of which two are layouts on renderers that already exist and are therefore cheap.

`crisis-contact` is the eleventh and is a special case: the renderer **exists** as `CrisisSupport.tsx` and is fully built. What is owed is not a renderer but a wrapper — the same component reached as a block, with an id, a response key and `contacts_ref` instead of four hardcoded numbers.

**Build order.** `table-review` first — it is `read` arranged as a grid, the cheapest item on the list and the highest value, because a series nobody ever sees is a series nobody benefits from. Then `layout` properly, including the mobile degrade. Then `paced-breathing` · `timer` · `boolean` · `slider`. Then `time` · `date-time` · `location` · `record` · `consent`.

**Unresolved, and it changes this list:** the viewer marks only `review-table` as *No renderer yet*; `listen`, `rank` and `pick-date` read *Wired, unused*, implying renderers exist. The old §6.0 says all four lack them. **One of the two is wrong.**

---

## 15 · Open — decisions, not code

| | |
|---|---|
| `paced-breathing` pattern | Free-form seconds, or a fixed set (4-7-8, box, coherent). Free-form is more flexible and easier to get clinically wrong |
| `text` default `persist` | `true` or `false`. 17 live blocks carry the ephemeral promise; the default must preserve it |
| `location` precision | Coarse or exact coordinates. Health-adjacent personal data — changes storage, retention and the privacy copy, not just the picker |
| `record` retention | Audio is the largest thing this app would hold. Answered before it is built |
| `record` and `timer` at all | Both kept on provenance, not shape. Reject provenance and they collapse into `upload` and `number` **together — one decision, not two** |
| `consent` scope | Onboarding only, or any block type? A consent record that can appear anywhere is harder to audit |
| **`sleep-diary`** | Retire into `tracker` with the sleep columns as a template? **Check first whether anything branches on `type === 'sleep-diary'`** in scoring, reporting or the recommendation engine. If it does, this is a refactor, not a retype |
| **Crisis pathway** | **Resolved 2026-09-10 — see §10.1.** It is vocabulary: `reach` · `crisis-contact` · `support`, gated by the `risk` policy field. What stays open is narrower — whether an authored `support` block shows in the day's progress count before it fires |
| `complete` vs `read` | `complete` could be `read` plus a last-block policy on `conclude`. Retained by decision; reopenable |
| `slider` as a name | A device word. It survives because a continuum the app does not own is genuinely different from `rating-scale`. Accepted as a primitive borrowing |

---

## 16 · Order

1. **Count first.** Live blocks spelled `slider`, `boolean`, `yes_no`, `emoji_scale`; blocks carrying `comparison-matrix`; blocks typed `assessment-lite` and `sleep-diary`; days typed `rest`; the overlap between the 144 `input-table` blocks and the 198 with no key. **Nothing below starts without these.**
2. **Fix the 36 missing `scale_ref` blocks.** Content, not vocabulary. Independent of everything else. **First in wall-clock terms.**
3. **Additive schema.** `display`, `format` and the rest of the labels on `activityConfig`; `image` on catalog scale options; `icon` on every activity row; correct `read`'s `requires` to `content`. Breaks nothing.
4. **Rename** `table` → `check-grid`. In place, id frozen.
5. **Add the new catalog rows** declared but unauthorable until their renderers exist — the way the owed activities are already handled.
6. **Retire the duplicates and the two block types.** Retype live blocks, then prove interaction-neutrality against a fresh backup, both prefixes. `rest` goes inside the §19 day-type removal.
7. **Make the completion card a `conclude` block**, and delete `completionTitle` from `day-layout.ts` with the day types.
8. **Renderers**, in the §14 order.
8a. **`session`** — split media out of `lesson`, count the `media_ref` blocks first, then retype. Ruled, not yet scheduled.
8b. **The §10.3 additive fields** — `prompts[]`, band map, `about`, `revisit_when`. None of them break anything.
8c. **`visible_when`** and **`completion`** — new authored rules, scoped to a step.
8d. **The instrument** (§10.2). A storage change. Everything in capture/review/interpret/ledger waits on it.
8e. **`allow_other`** — an output-shape migration; sequence it with a retype, never alone.
9. **The crisis pathway.** Not a decision any more — a build, and it splits in three. **9a** `contacts_ref` as a catalog set, replacing the hardcoded numbers: standalone, breaks nothing, do it whenever. **9b** the `risk` policy field, which is what lets `CRISIS_ON_ANSWER_ENABLED` come back on, because once-per-run stops being per-screen. **9c** `support` as an authorable block. **9a and 9b are worth doing before 9c** — the flag is off in production today and that is the live gap, not the missing block.

**Steps 1–5 are safe. Steps 6 and 7 change stored data and are the only irreversible ones here.**
