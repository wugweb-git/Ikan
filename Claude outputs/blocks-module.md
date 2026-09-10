# iKan — Blocks Module

Reference. Tables only. Every figure counted against `kv_store_cc205da9` on 2026-09-10, read-only.

**17 block types · 31 activities · 10 interactions · 7 labels · 9 policy fields · 93 permitted pairs.**

| axis | what it is | set by |
|---|---|---|
| **Block type** | What the block is for, and what it guarantees | Author, per block |
| **Activity** | The events a user performs in order to communicate | Author, per block |
| **Interaction** | The gesture. Cognitive, not physical | Derived from the activity |
| **Label** | Device-bound. How it is drawn, never what it is | Author, optional |
| **Policy** | What the type guarantees | The type. Never authored |

**Distinguishing test.** An activity is distinguished by what it produces — the shape of the value *and* how it was obtained. Presentation alone is a label.

---

## 1 · Interactions — 10

| interaction | the user is | activities |
|---|---|---|
| `observe` | taking content in | 6 |
| `choose` | picking from what the app offers | 5 |
| `share` | giving their own words or figures | 6 |
| `locate` | naming a real-world point | 4 |
| `confirm` | affirming | 5 |
| `rate` | placing a value on a range | 3 |
| `order` | putting things in sequence | 1 |
| `measure` | bracketing a span the app times | 2 |
| `submit` | transferring ownership of an artefact | 2 |
| `reach` | contacting a human outside the app | 1 |

| distinction | |
|---|---|
| `choose` vs `confirm` | *Which describes me* is choosing. *I did this* is confirming |
| `locate` vs `choose` | The app does not own the option set |
| `measure` vs `share` | The app produces the value; in `share` the user does |
| `reach` vs `submit` | `submit` hands an artefact to the app; `reach` hands the user to a person |

---

## 2 · Activities — 31

| activity | interaction | requires | produces | labels | renderer |
|---|---|---|---|---|---|
| `read` | observe | `content` | — | layout | built |
| `listen` | observe | `media_ref` | — | — | built |
| `view` | observe | `media_ref` | — | — | built |
| `complete` | observe · confirm | `content` | — | layout | built |
| `table-review` | observe · confirm | `source_key` | — | layout | **owed 1** |
| `paced-breathing` | observe · measure | `in` · `hold` · `out` · `cycles` (free-form seconds) | duration | — | **owed 8** |
| `mcq` | choose | `scale_ref` | `option_id` | display · cardinality | built |
| `single-select` | choose | `scale_ref` | `option_id` | display · cardinality | built |
| `multi-select` | choose | `scale_ref` | `option_id[]` | display · cardinality | built |
| `boolean` | choose · confirm | `prompt` · labels | `bool` | — | **owed 3** |
| `clinical-instrument` | choose · rate | `scale_ref` · `instrument_ref` | `option_id` | display | built |
| `text` | share | `prompt` · `persist` (default **true**) · `length` | `text` | format · persist · length | built |
| `short-text` | share | `prompt` | `text` | format · length | built |
| `ephemeral-journal` | share | `prompt` | `text` | persist: false | built |
| `number` | share | `prompt` | `number` | length | built |
| `input-table` | share | `columns` | cell map | layout | built |
| `list-entry` | share | `prompt` · `min` · `max` | `string[]` | layout | **owed 5** |
| `date` | locate | `prompt` | `date` | — | **owed 6** |
| `time` | locate | `prompt` | `time` | — | **owed 6** |
| `date-time` | locate | `prompt` | `datetime` | — | **owed 6** |
| `location` | locate | `prompt` · `precision` | `place` | precision | **owed 11** |
| `structured-list` | confirm | `items` | `item_id[]` | layout | built |
| `check-grid` | confirm | `columns` · `rows` | boolean map | layout | **owed 4** |
| `consent` | confirm | `statement` · `required` | `bool` + stamp + statement as shown | — | **owed 9** |
| `rating-scale` | rate | `scale_ref` | `option_id` | display | built |
| `slider` | rate | `min` · `max` · `step` · band map | `number` | — | **owed 2** |
| `ranking` | rate · order | `items` | `item_id[]` ordered | layout | built |
| `timer` | measure | `mode` · `target` | duration | mode | **owed 7** |
| `upload` | submit | `accepted_types` | `file_ref` | source: pick | built |
| `record` | submit | `prompt` · `max_duration` | `audio_ref` | source: capture | **owed 10** |
| `crisis-contact` | observe · reach | `contacts_ref` | `{ route, at, trigger }` | layout | **owed 12** |

**Response-producing: 24 of 31. Scale-backed: 5** — `mcq`, `single-select`, `multi-select`, `rating-scale`, `clinical-instrument`.

**Retained duplicates, by ruling:** `mcq` ≡ `single-select`; `short-text` ≡ `ephemeral-journal` ≡ `text`. Cost is permanently split data. Nothing renders wrong.

---

## 3 · Labels — 7

| label | values | applies to |
|---|---|---|
| `layout` | `single` · `list` · `grid` | any activity. `grid` degrades to `list` on a narrow screen |
| `display` | `emoji` · `nps` · `dropdown` · `image` | every `choose` activity and `rating-scale` |
| `format` | `email` · `phone` · `url` | `text` · `short-text` |
| `cardinality` | `one` · `many` | `choose` activities |
| `source` | `pick` · `capture` | `submit` activities |
| `persist` · `length` | — | `share` activities |
| `mode` | `up` · `down` | `timer` |

**Not labels:** anything that changes the stored value, the repeat behaviour, or what the type guarantees. See §7.

---

## 4 · Block types — 17

| type | activities | steps | policy | rules | live |
|---|---|---|---|---|---|
| `lesson` | read | allowed | auto ✗ · back ✓ | no response | **119** |
| `session` | listen · view · paced-breathing | none | transport · completion · back ✓ | requires `media_ref` · produces `{position, furthest, completed}` | 0 |
| `exercise` | mcq · single-select · multi-select · boolean · rating-scale · slider · input-table · check-grid · structured-list · list-entry · number · timer · date · time · date-time · location · ranking · upload | allowed | auto ✗ · back ✓ · toggle ✓ | requires activity · requires `key` · scale-backed needs `scale_ref` | **49** |
| `journal` | text · short-text · ephemeral-journal · list-entry · record | allowed | exit ✓ · back ✓ | requires `prompt` · `key` | **14** |
| `checklist` | structured-list | allowed | toggle ✓ · back ✓ | requires `items` · `key` | **1** |
| `reflection` | mcq · single-select · rating-scale · text · ephemeral-journal · record | none | back ✗ | — | **8** |
| `conclude` | complete | none | back ✓ | **last block on a day** · no response | **95** |
| `quiz` | mcq · single-select · multi-select · boolean · rating-scale | 1 per step | auto ✓ · back ✗ · **score ✓** | 5–10 questions | 0 |
| `sleep-diary` | input-table · date · time · date-time · table-review | none | toggle ✓ · back ✓ | requires `columns` · `key` | **30** |
| `onboarding` | mcq · single-select · multi-select · boolean · text · short-text · date · consent | 1 per step | auto ✓ · back ✗ · score ✗ | runs once, before day 1 | **8** |
| `assessment` | mcq · single-select · clinical-instrument | 1 per step | auto ✓ · back ✗ · **score ✓** · **risk: surface** | only type that may hold `clinical-instrument` | 92 items |
| `learning` | mcq · single-select | required | auto ✗ · back ✓ | ≥1 interaction | **9** |
| `practice` | multi-select · input-table · structured-list · list-entry · number · timer · text · short-text · record · location · upload | allowed | auto ✗ · back ✓ · **exit ✓** | state whether stored or private | 0 |
| `workshop` | multi-select · input-table · text · ephemeral-journal · list-entry · ranking · upload | required, max 3 | auto ✗ · back ✓ | no nested step groups | **5** |
| `tracker` | check-grid · input-table · structured-list · rating-scale · slider · boolean · number · timer | none | auto ✗ · **toggle ✓** | identical across days | **82** |
| `check-in` | mcq · single-select · multi-select · boolean · rating-scale · slider · text · short-text | 1 per step | auto ✓ · back ✗ · score ✗ · exit ✓ | under 2 min | own store |
| `support` | crisis-contact | none | never scored · always dismissible · **risk: surface** | may not be last on a day · never counts toward completion | 0 |

### Retired

| retired | into |
|---|---|
| `rest` | one `lesson · read` + one `conclude · complete`, inside the §19 day-type removal |
| `assessment-lite` | `check-in` or `reflection`, per block |
| `comparison-matrix` *(activity)* | `input-table` with fixed rows |

### `session` — ruled 2026-09-10

**If it has a duration, it is not a lesson.** `lesson` keeps `read`. `listen`, `view` and `paced-breathing` move to `session`; `practice` loses `paced-breathing`.

| | |
|---|---|
| Retype set | **0.** Of 119 live `lesson` blocks, 27 carry an `image_url` and **none is video or audio**. A still image has no clock |
| Consequence | **Purely additive. No migration.** |
| Resolves | `lesson` keeps *no response* honestly; `session` takes the key resume needs |
| Name | **`session`, ruled.** The therapy-appointment collision is accepted and disambiguated on the appointment side |
| Short media | **Duration test wins, ruled.** Any clock is a `session`, however short. A 40-second explainer in a teaching day is a `session`, so teaching days carry two block types and the builder must make that obvious |

---

## 5 · The matrix — 93 pairs

| type | n | activities (\* renderer owed) |
|---|---|---|
| `exercise` | 18 | boolean\* · check-grid\* · date\* · date-time\* · input-table · list-entry\* · location\* · mcq · multi-select · number · ranking · rating-scale · single-select · slider\* · structured-list · time\* · timer\* · upload |
| `practice` | 11 | input-table · list-entry\* · location\* · multi-select · number · record\* · short-text · structured-list · text · timer\* · upload |
| `check-in` | 8 | boolean\* · mcq · multi-select · rating-scale · short-text · single-select · slider\* · text |
| `onboarding` | 8 | boolean\* · consent\* · date\* · mcq · multi-select · short-text · single-select · text |
| `tracker` | 8 | boolean\* · check-grid\* · input-table · number · rating-scale · slider\* · structured-list · timer\* |
| `workshop` | 7 | ephemeral-journal · input-table · list-entry\* · multi-select · ranking · text · upload |
| `reflection` | 6 | ephemeral-journal · mcq · rating-scale · record\* · single-select · text |
| `quiz` | 5 | boolean\* · mcq · multi-select · rating-scale · single-select |
| `sleep-diary` | 5 | date\* · date-time\* · input-table · table-review\* · time\* |
| `journal` | 5 | ephemeral-journal · list-entry\* · record\* · short-text · text |
| `assessment` | 3 | clinical-instrument · mcq · single-select |
| `session` | 3 | listen · paced-breathing\* · view |
| `learning` | 2 | mcq · single-select |
| `lesson` · `checklist` · `conclude` · `support` | 1 each | read · structured-list · complete · crisis-contact\* |

**33 of 93 pairs have an activity with no renderer** — those blocks fall to `default: renderLesson()` and draw reading content.

**Rule:** every activity must appear in at least one type's permitted list. `list-entry` was in no list until 2026-09-10. `validateDay` must read the permitted lists off the catalog and fail a build that orphans one.

---

## 6 · Policy — 9 fields

| field | controls |
|---|---|
| `autoAdvance` | The player moves on without a tap |
| `navigationBack` | Whether an answer can be revised. Off on every scored type |
| `scoringEnabled` | `assessment` and `quiz` only |
| `saveOnExit` | Writes when the user leaves mid-block |
| `saveOnToggle` | Writes on every tap |
| step rules | `allowed` · `required` · max per group · one per step |
| `risk` | `none` · `surface` · `gate` |
| `transport` | `free` · `forward-locked` · `none` |
| `completion` | `any` · `threshold(N%)` · `full` · `all-visited` |

### `risk` — ruled on 2026-09-10

| value | means | carried by |
|---|---|---|
| `none` | The type may not carry risk indicators. Authoring one is a validation error | every other type |
| `surface` | A tripped indicator surfaces `support` **once per run**, non-blocking | `assessment` · `check-in` · `journal` · `reflection` |
| `gate` | Surfaces `support`; the run does not continue until acknowledged | nothing. Named so the field has a top end |

**`is_risk_indicator` attaches to a catalog option — a `scale_ref` row — not only to a question.** A risk in one option of a `multi-select` is invisible to a question-level flag.

**Once-per-run is the field's guarantee, enforced centrally.** That rule is why `CRISIS_ON_ANSWER_ENABLED` was switched off. Ship the field and the flag together; never the flag alone.

**State:** only `assessment` reads the flag today. `journal` and `reflection` need a text scan that does not exist.

---

## 7 · Rules

| rule | |
|---|---|
| **One flat list** | A block type cannot hold another block type. 17 types, no stages, no day config, no second class. Behaviour is policy, never nesting |
| **Response identity** | `activityConfig.key`, falling back to `block.id`, via `responseKeyOf(block)`. Every response-producing activity needs one |
| **Catalog id freeze** | An id is minted once, never regenerated. An id keeping a retired name is the freeze working |
| **Dual write** | `equip:` and `equip_program:` always together. `equip_program_by_slug:` is a deliberately stale mirror |
| **Every activity permitted somewhere** | See §5 |
| **Aliases are code, not catalog** | They normalise before the resolver and are never counted in a vocabulary total |
| **A label never changes the stored value** | If it does, it is an activity or a policy field |
| **An alias that changes output shape is a migration; one that keeps it is a re-point** | See below |

### Aliases — counted 2026-09-10

| stored | live | verdict |
|---|---|---|
| `matrix` | **8** — 5 `exercise`, 3 `tracker` | **re-point** → `input-table` |
| `scale` | **1** | **migration** → `slider`; `constraints {min,max}` becomes `min`/`max`/`step` |
| `number` | **1** | unchanged — declared activity, term predates the catalog |
| `slider` · `boolean` · `yes_no` · `emoji_scale` · `single_choice` · `mcq_single` · `free_text` · `long_text` · `comparison_matrix` | **0** | nothing to migrate. Delete the aliases |

**10 blocks total, 9 re-points.** Then delete every alias case from `resolveInteraction()`.

**Separate and larger:** `activity` is **null on all 420 blocks**. These are `subtype` spellings. The activity backfill is still owed.

---

## 8 · Use cases

| want | type | why |
|---|---|---|
| Teach something | `lesson` | no clock, no answer |
| A timed audio, video or pacer | `session` | it has a clock |
| Check the teaching landed | `learning` | requires ≥1 interaction |
| Score comprehension | `quiz` | forward-only, scored |
| Score severity at intake | `assessment` | only type holding `clinical-instrument` |
| Any single question with an answer | `exercise` | the workhorse |
| Free writing against a prompt | `journal` | saves on exit |
| A closing prompt | `reflection` | no steps, back off |
| Tick actions taken | `checklist` | `structured-list` only |
| Multi-step thinking | `workshop` | step groups required, max 3 |
| The same instrument daily | `tracker` | series is the value |
| A one-to-three question pulse | `check-in` | under 2 min, own store |
| Day 0 | `onboarding` | runs once |
| Close a day | `conclude` | always last |
| Route someone to a person | `support` | never scored, always dismissible |

### `sleep-diary` vs `tracker` vs `reflection` — and it is **not** a label

| | |
|---|---|
| Question | Does the value live in the **series**, or in the **single answer**? |
| Why not a label | It changes three things a label cannot touch: the block **repeats** under one identity; it **must not change between days** (editing columns on day 9 breaks days 1–8); the **read-back is part of the instrument** |
| Verdict | All three are **policy** |
| `tracker` | The series is the value |
| `reflection` | The single answer is the value |
| `sleep-diary` | A `tracker` whose columns happen to be sleep questions. **Content wearing a block type** |

---

## 9 · The completion card is a block

**Ruled: it is a `conclude` block and nothing else.** No player-owned card, no third thing between the block list and the screen.

| part | source today | replaced by |
|---|---|---|
| Title | `dayConfig.completionTitle`, keyed by day type | `block.title` |
| Body | hardcoded literal, `ProgramPlayer.tsx:423` | `block.content` |
| Button | `daily_content.length === 1 ? 'View Results' : 'Continue Journey'` | the day's own CTA |

Then delete `completionTitle` from `day-layout.ts` with the day types. `validateDay` requires one `conclude` per published day; the composer appends a default.

**95 `conclude` blocks already exist.** The player draws a second, unauthored ending on top of them.

### 9.1 · Crisis support

| layer | name | detail |
|---|---|---|
| interaction | `reach` | contacting a human outside the app |
| activity | `crisis-contact` | `observe · reach`, requires `contacts_ref`, produces `{ route, at, trigger }` |
| block type | `support` | never scored, never blocking, always dismissible, may not close a day |
| policy | `risk` | §6 |

**Ruled: the modal goes. One renderer, one entry point.**

| trigger | becomes |
|---|---|
| `assessment_score` | policy — `risk: surface` fires `support` once per run |
| authored | an ordinary `support` block |
| `keywords` | policy, same firing — once a text scan exists. It does not today |
| `user_request` | a `support` block opened as a route from the header |

`CrisisSupport.tsx` becomes the `crisis-contact` renderer and nothing else. `triggerReason` stops being a prop and becomes the block's provenance. The header route mounts a standalone `support` block outside any day and must not write into `completedDays`.

**Numbers 14416 · 9820466726 · 9152987821 · 112 are hardcoded in the component.** `contacts_ref` makes them a catalog set.

### 9.2 · The instrument — ruled, and it is a data-model change

| phase | what | our nearest |
|---|---|---|
| Capture | one question per screen | a step. have |
| Review | read-back of everything entered, EDIT \| SAVE | `table-review` reads one block. too narrow |
| Interpret | a section the app generated from the answers | nothing |
| Ledger | dated entries, reopenable | nothing |

**An instrument is not a block.** A day references one; the instrument owns its ledger.

```
instrument:{id}                       definition — blocks, review spec, bands
instrument_entry:{id}:{userId}:{n}    one dated run
```

| rule | |
|---|---|
| An entry is immutable once completed | Corrections create a new entry referencing the old |
| Entries keep the definition version they were captured under | Adding a column on day 40 must not rewrite day 3 |
| `EDIT` reopens the **draft**, never a completed entry | This is the word that is not `navigationBack` |

### 9.3 · Fields — all ruled in

| # | field | on | note |
|---|---|---|---|
| 1 | band map | `slider` · `rating-scale` | value → label → advice. **Ships with `slider`.** The interpretation phase reads it |
| 2 | `prompts[]` | `journal` · `text` | scaffold chips above the box. Our `prompt` is singular |
| 3 | `about` | any block | labelled *How will this help me?*, not a `?` — that glyph now means `support` |
| 4 | `revisit_when` | any block | authored re-entry condition |
| 5 | `visible_when` | any block | `{ key, op, value }`. `validateDay` rejects a key outside the step |
| 6 | `allow_other` | `scale_ref` | output becomes `option_id \| free_text`. **Shape migration, not a flag** |
| 7 | computed ordering | display | needs 9.2 first |
| 8 | content branching | display | generalise `source_key` past `table-review` |

**Not carried:** a `commitment` block type. Proposed, never ruled, not counted.

### 9.4 · Content defects

**Fixed 2026-09-10.** Backups: `backup_pre_content_fix_2026_09_10`, `backup_pre_placeholder_fix_2026_09_10`. Both prefixes written.

| | was | now |
|---|---|---|
| Risk flag | `depression-q9` (self-harm) **unset**; `depression-q10` (difficulty) **set** | q9 set, q10 cleared. Had to land before the flag goes on |
| Typo | "slep diary", Sleep Tight day 30 | corrected |
| Icon collisions | `lesson`/`learning` = `book-open`; `conclude`/`onboarding` = `flag` | `learning` → `graduation-cap`, `onboarding` → `door-open` |
| Placeholder options | 6 blocks with `"item 1"` … `"item 5"` — Unburn 27, 29, 30; Productivity Reset 1, 3 | converted to `journal · text`. **All 6 were `checklist × multi-select`, so the permitted-list violation cleared with them.** 420 blocks before and after |

**Open, by ruling:**

| | ruling |
|---|---|
| Day-8 test blocks in Productivity Reset — `testaxasx`, `New Lessonxdsz`, conclude body `xdz`, and an `onboarding` block on day 8 | leave, log only |
| Sleep Diary — 10 clinical rows as free text, series cannot be charted | schedule with the instrument, §11 item 15 |

---

## 10 · Live state

| | |
|---|---|
| Live blocks | **420** across 4 programmes |
| Declaring a `key` | **222** — 198 do not |
| Declaring `activity` | **0** |
| Declaring `scale_ref` | **0** |
| Declaring `repeat` | 4 |
| Block types in use | 11 of 17 |
| Blocks carrying media | 27, all images — 0 video, 0 audio |

| type | live | type | live |
|---|---|---|---|
| `lesson` | 119 | `learning` | 9 |
| `conclude` | 95 | `reflection` | 8 |
| `tracker` | 82 | `onboarding` | 8 |
| `exercise` | 49 | `workshop` | 5 |
| `sleep-diary` | 30 | `checklist` | 1 |
| `journal` | 14 | | |

| subtype | live |
|---|---|
| `input-table` | 136 |
| `multi-select` | 17 |
| `single-select` | 15 |
| `matrix` | 8 |
| `mcq` | 3 |
| `structured-list` · `number` · `scale` | 1 each |
| none | 238 |

---

## 11 · Order

**S** safe, additive · **D** changes stored data — fresh backup, proof against both prefixes · **U** changes what a user sees at their worst moment.

| # | | what | note |
|---|---|---|---|
| 1 | S | `scale_ref` on every option-bearing block | On **0 of 420**. Blocked by nothing. First |
| 2 | S | `key` on the 198 without one | Answers land under generated ids |
| 3 | S | Additive schema | 7 labels on `activityConfig`; `image` on scale options; `icon` on activity rows; `read.requires` → `content` |
| 4 | S | Catalog rows for declared-unauthorable activities | |
| 5 | S | **The 12 renderers** | Order in §2. Builds 1–5 unblock 16 of the 33 pairs and need no decision |
| 6 | S | Additive fields | band map (with `slider`), `prompts[]`, `about`, `revisit_when` |
| 7 | S | `visible_when` · `completion` | New authored rules, scoped to a step |
| 8 | S | `session` | Retype set is **0**. Purely additive |
| 9 | D | **The activity backfill** | `activity` null on all 420. Largest single job |
| 10 | D | Re-point 9 alias blocks, migrate 1 | Then delete every alias case from `resolveInteraction()` |
| 11 | ~~D~~ | ~~Retype `checklist × multi-select`~~ | **Done.** Cleared with the placeholder fix, §9.4 |
| 12 | D | Rename `table` → `check-grid` | In place, id frozen |
| 13 | D | Completion card becomes a `conclude` block | `validateDay` requires one per day; `completionTitle` leaves `day-layout.ts` |
| 14 | D | Retire the duplicates and `sleep-diary` | `rest` inside the §19 day-type removal |
| 15 | D | **The instrument** | Storage change. Everything in capture → review → interpret → ledger waits |
| 16 | D | `allow_other` | Shape migration. Sequence with a retype |
| 17 | U | `contacts_ref` as a catalog set | Standalone. First of the three |
| 18 | U | `risk` on the type · option-level flag · once-per-run central · `support` authorable · modal deleted | The fix |
| 19 | U | `CRISIS_ON_ANSWER_ENABLED = true` | **Last** |

**1–8 cannot lose data. 9–16 can. 17–19 ship together, in that order.**

---

## 12 · Copy rules

| rule | |
|---|---|
| Name things as the user understands them | *Log your mood*, not *create a check-in entry* |
| A control says what happens | *Publish* → toast *Published*. The name survives the whole flow |
| Active voice, sentence case, no filler | *Save changes*, not *Submit* |
| Errors say what went wrong and how to fix it | No apology, never vague |
| Empty states are an invitation to act | Not a mood |
| Every figure carries its comparison | `6h 42m` → *48 minutes above your average* |
| Never push a number | *Your score dropped to 54* lands hardest on the worst day |
| Never punish a lapse | *19 of 30 days, your longest run was 11 — it is still yours* |
| Say what a permission will do | *One notification a day, only if you have not checked in by 21:00* |
| Show the working on an inference | *From 19 check-ins and 19 sleep entries* |

---

## 13 · UI rules

| rule | |
|---|---|
| Touch targets ≥ 44px | iKan standard is **48px**, 16px radius. Audit found 34, 38 and 16px |
| Contrast AA at every size | `--ikan-brand-teal-dark` on its wash is **4.46:1** — fails at 12px, which is what pills use. `--color-status-info` on its wash is **3.84:1**. Both need an on-wash variant |
| Weights 400 and 500 only | Public UI. Hierarchy from size, colour and space |
| No component scrolls the page sideways | Wide content scrolls inside its own container |
| `layout: grid` degrades to `list` | Same stored answer. 136 `input-table` blocks get a mobile form free |
| Visible keyboard focus, reduced motion respected | Every interactive element |
| Tokens, never literals | A hardcoded hex is a bug |
| Re-resolve ink inside a themed scope | A token redefined on a container does not reach text that inherited `color` from `body`. This shipped as an unreadable dark mode |
| Stale data must not look like fresh data | Say what the staleness cost |

---

## 14 · Open

### Closed 2026-09-10

| | ruling |
|---|---|
| `session` name | **`session`.** Collision with therapy appointments accepted, disambiguated on that side |
| Short media | **Duration test wins.** Any clock is a `session`. Teaching days carry two block types; the builder must make that obvious |
| `paced-breathing` pattern | **Free-form seconds** — `in` · `hold` · `out` · `cycles`. **Guardrail required, since free-form is the clinically riskier choice: cap `hold` and warn above it.** Set the cap before renderer 8 ships |
| `text` default `persist` | **`true`.** Writing is kept unless the author opts into ephemeral. Matches every live journal block |

### Still open

| | question | blocks |
|---|---|---|
| 1 | **`location` precision** — coarse or exact? Changes storage, retention and privacy copy | renderer 11 |
| 2 | **`record` retention** — audio is the largest thing this app would hold | renderer 10 |
| 3 | **`consent` scope** — onboarding only, or any type? | renderer 9 |
| 4 | **Retire `sleep-diary` into `tracker`?** Check first whether anything branches on `type === 'sleep-diary'` in scoring, reporting or the recommendation engine. If it does, refactor not retype | §11 item 14 |
| 5 | **Does an authored `support` block appear in the day's progress count before it fires?** Showing warns; hiding surprises | §11 item 18 |
| 6 | **`record` and `timer` at all** — both kept on provenance, not shape. Reject provenance and they collapse into `upload` and `number`. One decision, not two | renderers 7, 10 |
