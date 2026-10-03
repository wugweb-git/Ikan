# iKan — Interactions and Activities

**Blocks module · the list · 2026-09-09**

An **activity** is the set of events a user performs in order to communicate.
An **interaction** is how they respond — cognitive, not device-bound.
**An activity carries one or more interactions.** It is a set of events, so it holds a set of responses.

Some activities produce nothing stored. They still carry an interaction — the user is still doing something.

Everything device-bound is a **label**: layout, display, format. A label never creates a new activity.

---

## Interactions — 9

| interaction | the user is |
|---|---|
| `observe` | taking content in — reading, listening, watching |
| `choose` | picking from what the app offers |
| `share` | giving their own words or figures |
| `locate` | naming a real-world point — when, where |
| `confirm` | affirming — that something happened, or that they agree |
| `rate` | placing a value on a range |
| `order` | putting things in sequence |
| `measure` | bracketing a span the app times |
| `submit` | handing over an artefact — ownership changes |

`observe` is the interaction of every teaching block — `lesson`, `learning`, and the reading half of everything else.

---

## Activities — 29

| activity | interactions | requires | produces | labels |
|---|---|---|---|---|
| `read` | observe | `content` | — | `layout` |
| `listen` | observe | `media_ref` | — | — |
| `view` | observe | `media_ref` | — | — |
| `table-review` | observe · confirm | `source_key` | — | `layout: grid` |
| `complete` | observe · confirm | `content` | — | — |
| `paced-breathing` | observe · measure | `pattern` · `cycles` | — | — |
| `mcq` | choose | `scale_ref` | `option_id` | `cardinality` · `display` |
| `single-select` | choose | `scale_ref` | `option_id` | `display` |
| `multi-select` | choose | `scale_ref` | `option_id[]` | `display` |
| `boolean` | choose · confirm | `prompt` · labels | `bool` | `display` |
| `clinical-instrument` | choose · rate | `scale_ref` · `instrument_ref` | `option_id` | `layout: list` |
| `rating-scale` | rate | `scale_ref` | `option_id` | `display` |
| `slider` | rate | `min` · `max` · `step` | `number` | — |
| `ranking` | rate · order | `items` | `item_id[]` ordered | `layout: list` |
| `structured-list` | confirm | `items` | `item_id[]` | `layout: list` |
| `check-grid` | confirm | `columns` · `rows` | boolean map | `layout: grid` |
| `consent` | confirm | `statement` · `required` | `bool` + timestamp + statement as shown | — |
| `text` | share | `prompt` | `text` | `persist` · `length` · `format` |
| `short-text` | share | `prompt` | `text` | — |
| `ephemeral-journal` | share | `prompt` | `text` | `persist: false` |
| `number` | share | `prompt` | `number` | — |
| `input-table` | share | `columns` | cell map | `layout: grid` |
| `date` | locate | `prompt` | `date` | — |
| `time` | locate | `prompt` | `time` | — |
| `date-time` | locate | `prompt` | `datetime` | — |
| `location` | locate | `prompt` · `precision` | `place` | — |
| `timer` | measure | `mode: up · down` · `target` | `duration` | — |
| `upload` | submit | `accepted_types` | `file_ref` | `source: pick` |
| `record` | submit | `prompt` · `max_duration` | `audio_ref` | `source: capture` |

### The six that carry two

| activity | why |
|---|---|
| `paced-breathing` | You follow the pacer (`observe`) for a bracketed span (`measure`). It is a stopwatch with something to watch |
| `complete` | You read the closing card (`observe`) and acknowledge the day is done (`confirm`) |
| `table-review` | You read your own series back (`observe`) and affirm it is right (`confirm`) |
| `boolean` | `choose` when it answers a question, `confirm` when it reports something you did |
| `clinical-instrument` | `choose` an option that carries a score — the choosing is also a `rate` |
| `ranking` | You judge each item's value (`rate`) in order to sequence them (`order`) |

`view` covers watching. There is no separate `watch`.

---

## Labels

Device-bound. They change how something is drawn, never what it is.

| label | values | applies to |
|---|---|---|
| `layout` | `single` · `list` · `grid` | any activity. **`grid` degrades to `list` on a narrow screen** — same activity, same interaction, same stored answer |
| `display` | `emoji` · `nps` · `dropdown` · `image` | every `choose` activity and `rating-scale`. **`image` works on all of them** — picture choice is a label, not an activity |
| `format` | `email` · `phone` · `url` | `text` |
| `cardinality` | `one` · `many` | `choose` activities |
| `source` | `pick` · `capture` | `submit` activities |
| `persist` · `length` | — | `share` activities |
| `mode` | `up` · `down` | `timer` |

---

## Counts

**9 interactions · 29 activities · 7 labels.**

Six activities produce nothing stored. They are not a separate class — they carry `observe`, and three of them carry a second interaction.

---

## Changed this pass

| | |
|---|---|
| `observe` | New. `read` · `listen` · `view` are one interaction, and it is the interaction of every teaching block type |
| Presentations | **Dissolved.** They were never interaction-less. One list now, not two |
| `agree` | **Merged into `confirm`.** Assent is affirming. `consent` stays a separate activity because it produces the statement text as shown, but at the interaction layer it is a `confirm` |
| `share` | Final name for giving your own words or figures. `tell` was vague; `state` collides with component state. **`share`** is what the user is actually doing |
| `confirm` vs `approve` | **`confirm` stands.** `approve` means granting sanction — it fits `consent` and does not fit *I did my bedtime routine*. `confirm` covers both: confirm you did it, confirm you agree, confirm the day is done, confirm the series is right |

---

## Names — closed

Every name is settled.

`slider` keeps its name. It borrows a primitive that sits under a component, and that is accepted. It stays a separate activity because a continuum the app does not own produces a `number`, where `rating-scale` produces an `option_id`.
