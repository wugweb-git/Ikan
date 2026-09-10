# iKan — Blocks Module

**The single reference. Supersedes `activities.md` and `vocabulary.md`.**
Revised 2026-09-10.

> **Status.** The model is settled. The catalog is mid-migration — §26 landed in `f1600b1b`, the two block-type retirements in `1b22ceaa`. Live counts in §11 are read from `/admin/block-type-viewer`, not from memory.

**15 block types · 29 activities · 9 interactions · 7 labels · 6 policy fields.**

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

## 2 · Interactions — 9

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

`observe` is the interaction of every teaching block — `lesson`, `learning`, and the reading half of everything else.

**`submit` is defined by the ownership transfer**, which is what makes it specific rather than generic. Choosing an option or writing a sentence creates a value in place and transfers nothing. Handing over a file, or a recording just made, moves an artefact out of the user's possession into the app's.

### Why these are not each other

| | |
|---|---|
| `choose` vs `confirm` | *Which of these describes me* is choosing. *I did this* is confirming — it reports an action taken, not an answer given |
| `locate` vs `choose` | The app does not own the option set. A date, a time and a place are real-world coordinates, not a list somebody authored |
| `measure` vs `share` | The user brackets a span; the **app** produces the value. In `share` the user produces it |
| `confirm` covers assent | `agree` was retired into `confirm`. Assent is affirming. `consent` stays a separate **activity** because it produces the statement text as shown |

---

## 3 · Activities — 29

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

### The six that carry two interactions

| activity | why |
|---|---|
| `paced-breathing` | Follow the pacer (`observe`) for a bracketed span (`measure`) |
| `complete` | Read the closing card (`observe`), acknowledge the day is done (`confirm`) |
| `table-review` | Read your own series back (`observe`), affirm it is right (`confirm`) |
| `boolean` | `choose` when it answers a question, `confirm` when it reports what you did |
| `clinical-instrument` | `choose` an option that carries a score — the choosing is also a `rate` |
| `ranking` | Judge each item's value (`rate`) to sequence them (`order`) |

**Totals.** Response-producing: **23 of 29**. Scale-backed: **5** — `mcq`, `single-select`, `multi-select`, `rating-scale`, `clinical-instrument`. `slider` and `boolean` are deliberately not scale-backed; that is the point of separating them.

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

## 5 · Block types — 15

Policy columns: `auto` = autoAdvance · `back` = navigationBack · `score` = scoringEnabled · `exit` = saveOnExit · `toggle` = saveOnToggle.

| type | about | use | activities | steps | policy | rules |
|---|---|---|---|---|---|---|
| `lesson` | Formatted content the user reads, hears or watches. No answer | Teaching — the passage before the exercise that applies it. **118 live** | read · listen · view · paced-breathing | allowed | auto ✗ · back ✓ | produces no response |
| `exercise` | The interactive block — everything filled in, picked, ranked or handed over | Any question producing an answer. **187 live.** The workhorse | mcq · single-select · multi-select · boolean · rating-scale · slider · input-table · check-grid · structured-list · number · timer · date · time · date-time · location · ranking · upload | allowed | auto ✗ · back ✓ · toggle ✓ | requires an activity · requires `key` · scale-backed needs `scale_ref` |
| `journal` | Free-text writing against a prompt | When the value is the writing, not a scoreable answer. **17 live** | text · short-text · ephemeral-journal · record | allowed | auto ✗ · back ✓ · exit ✓ | requires `prompt` · requires `key` |
| `checklist` | A list of items ticked off | Confirming actions taken, not capturing data | structured-list | allowed | auto ✗ · back ✓ · toggle ✓ | requires `items` · requires `key` |
| `reflection` | A closing prompt asking the user to look back | End of a session, when a considered answer beats a quick one | mcq · single-select · rating-scale · text · ephemeral-journal · record | not allowed | auto ✗ · back ✗ | — |
| `conclude` | The day's closing card | Always last. **85 live** | complete | not allowed | auto ✗ · back ✓ | **last block on a day** · produces no response |
| `quiz` | Scored knowledge check | Comprehension after teaching. Forward-only so an answer cannot be revised | mcq · single-select · multi-select · boolean · rating-scale | not allowed, 1 per step | auto ✓ · back ✗ · **score ✓** | ⚠ keep to 5–10 questions |
| `sleep-diary` | A day-by-day grid filled in nightly | Where the **series** is the clinical value, not any one night | input-table · date · time · date-time · table-review | not allowed | auto ✗ · back ✓ · toggle ✓ | requires `columns` · requires `key` · `table-review` requires `source_key` |
| `onboarding` | Day 0, before the programme starts | Consent, orientation, and the profile questions that shape everything after | mcq · single-select · multi-select · boolean · text · short-text · date · consent | allowed, 1 per step | auto ✓ · back ✗ · score ✗ | ⚠ runs once, before day 1 |
| `assessment` | Scored baseline using validated clinical instruments | Severity at intake — PHQ/GAD shape. Forward-only so a baseline cannot be revised | mcq · single-select · clinical-instrument | not allowed, 1 per step | auto ✓ · back ✗ · **score ✓** | ⚠ the only type that may hold a `clinical-instrument` |
| `learning` | Concept introduction | The teaching day — a lesson plus at least one interaction to check it landed | mcq · single-select | allowed, **required**, 1 step per lesson | auto ✗ · back ✓ | ⚠ must include ≥1 interaction |
| `practice` | Applying a concept to the user's own situation | Data-capture days. Saves on exit because the user is mid-writing | multi-select · input-table · structured-list · number · timer · text · short-text · record · location · upload · paced-breathing | allowed | auto ✗ · back ✓ · **exit ✓** | ⚠ state whether responses are stored or private |
| `workshop` | Multi-step structured thinking | Ideation done in stages — where blocks must be grouped, not scrolled | multi-select · input-table · text · ephemeral-journal · ranking · upload | allowed, **required**, max 3 | auto ✗ · back ✓ | ✕ no StepGroups · ✕ >3 per group · ✕ mixed intent in one group |
| `tracker` | The same instrument, repeated daily | Habits and streaks. Should stay identical day to day so the series is comparable | check-grid · input-table · structured-list · rating-scale · slider · boolean · number · timer | not allowed | auto ✗ · **toggle ✓** | ⚠ should stay identical across days |
| `check-in` | A one-to-three question daily pulse | Mood sampling. Under two minutes, forward-only, no scoring | mcq · single-select · multi-select · boolean · rating-scale · slider · text · short-text | not allowed, 1 per step | auto ✓ · back ✗ · score ✗ · **exit ✓** | ⚠ under 2 min |

### Retired

| retired | why | where the work goes |
|---|---|---|
| `rest` | The only row with an empty activities list. A block type that permits nothing is not a block type — it is a day with no task wearing one | One `lesson · read` (the gentle prompt) plus one `conclude · complete`. Retire **inside the §19 day-type removal** |
| `assessment-lite` | Differed from `assessment` on four things, three of them policy flags. The one substantive difference — `clinical-instrument` — is what earns `assessment` its place, not the absence of scoring | `check-in` for a short forward-only pulse, `reflection` for a looking-back prompt. **Per block; no safe blanket default** |
| `comparison-matrix` *(activity)* | Identical to `input-table` — same interaction, same `columns`, same cell map | `input-table` with fixed rows |

**`conclude` stays**, and retiring `rest` *depends* on it: `conclude` is what closes the rest day.

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
| step rules | `allowed` · `required` · max per group · one per step |

### Risk — the sixth field, and it is missing

`AssessmentFlow.tsx` reads `q.is_risk_indicator === true` per question and fires a crisis pathway **once per run**. That is policy behaviour, authored on content.

**It is currently disabled sitewide** — `CRISIS_ON_ANSWER_ENABLED` is off, with the comment that re-offering the panel on every later answer was worse than not offering it at all.

So `is_risk_indicator` is authored and does nothing. It needs to become a real policy field — which type may carry risk indicators, and what fires when one trips — or be removed. **See §13.**

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

**10 interactions and modes**, of which two are layouts on renderers that already exist and are therefore cheap.

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
| **Crisis pathway** | `is_risk_indicator` is authored per question and disabled sitewide. Make it a real policy field, or remove it. **It is not vocabulary** — a crisis panel is not something a user does, and as an activity an author could put one in a checklist |
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
9. **Decide the crisis pathway.**

**Steps 1–5 are safe. Steps 6 and 7 change stored data and are the only irreversible ones here.**
