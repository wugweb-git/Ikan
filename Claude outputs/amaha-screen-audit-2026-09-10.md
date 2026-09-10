# Amaha screen audit — 15 screens, mapped to the iKan blocks model

Source: `screens/1000233654–678.png`. Read 2026-09-10.
Model as it stands after `659168ad`: **17 block types · 30 activities · 10 interactions · 7 labels · 7 policy fields** (17 = 16 + the media type ruled out of `lesson`, unnamed).

Verdicts: **HAVE** — maps with nothing lost · **PARTIAL** — maps but drops something the screen does · **MISSING** — nothing in the model holds it.

**Rollup: 3 HAVE · 5 PARTIAL · 7 MISSING.** The MISSING column is not seven small features — five of the seven are the same structural absence, named in §A.

---

## §A The absence that produces most of the misses

Four exercises here — Anger Thermometer, Trigger Ranking, Gratitude Jar, Negative Thinking Styles — run one shape:

**Capture → Review → Interpret → Ledger**

| phase | what it is | screens |
|---|---|---|
| Capture | one question per screen, NEXT | 655 · 656 · 657 · 660–662 · 676 · 678 |
| Review | read-back of everything entered, **EDIT \| SAVE** | 658 · 664 · 677 |
| Interpret | a section the **app** generated from the answers | 658 *What you should do* · 664 *This is anger due to…* |
| Ledger | dated pages, reopenable, **+ ADD NEW** | 659 · 665 |

We store **one value per block per day** under `responseKeyOf(block)`. This is **N dated entries per instrument, independent of any day** — Negative Thinking Styles holds three pages from 05:48, 05:49 and 08:12 on one morning.

**An instrument is not a block.** A day should *reference* one; the instrument owns its own ledger. Until that exists, screens 658, 659, 664, 665 and 677 have no home, and five of the seven MISSING verdicts below collapse into this one line.

---

## Screen-by-screen

### 654 · "Select 1 activity that you will carry out to get moving"

8 options, one selected (full-bleed orange row + check), last row **Add my own** with a live underline.

| | |
|---|---|
| maps to | `exercise` · `single-select` · `choose` · `layout: list` · `cardinality: one` |
| verdict | **PARTIAL** |

**Usage.** Committing to one behavioural activation task. The selection is a promise, not an answer — which is why it feeds a goal, not a score.

**Why partial.** *Add my own* changes the output from `option_id` to `option_id \| free_text`. Our distinguishing test says the shape of the value decides the activity, so this is not a display flag. `allow_other` on `scale_ref` **is a migration, not a re-point** — say that before someone ships it as a boolean.

**Critique.** Full-bleed orange on the selected row is the strongest emphasis on the screen and it lands on a low-stakes pick. It also puts white text on orange at a contrast the rest of the list doesn't use — the list reads as seven neutral rows and one alarm. A tick and a tinted row would carry it.

**Do.** Add `allow_other` to scale rows, plan it as a shape migration, and drop the fill to a tint.

---

### 655 · Anger Thermometer — "Write about the situation that made you angry"

Collapsible question header (chevron), **horizontally scrolling prompt chips** — *Where were you?* · *What were you doing?* · *How di…* — then a full textarea. `?` in the header.

| | |
|---|---|
| maps to | `journal` · `text` · `share` · requires `prompt` |
| verdict | **PARTIAL** |

**Usage.** Situation capture for a CBT log. The chips are scaffolding for a blank box, not options — nothing is selectable.

**Why partial.** Our `prompt` is **singular**. This needs `prompts[]`. Small field, disproportionate value: an empty textarea is the highest-abandonment element in any CBT app, and three concrete questions is the cheapest known fix for it.

**Critique.** The third chip is clipped mid-word with no affordance that the row scrolls — on a first run the user does not know a third prompt exists. Either wrap to two lines or leave a half-chip gutter that reads as scrollable. The collapse chevron is correct and under-used: with the keyboard up it is what keeps NEXT reachable.

**Do.** `prompts[]` on `journal`/`text`. Wrap the chips. Keep the collapse as a `layout` value.

---

### 656 · Anger Thermometer — slider at 0

Face illustration above · slider · **numeric ruler 0–9** · band label **"Calm"** · divider · nothing below.

| | |
|---|---|
| maps to | `exercise` · `slider` · `rate` · requires `min` · `max` · `step` |
| verdict | **PARTIAL** |

**Why partial.** Two things the model can't carry:

1. **The band label is data, not decoration.** *Calm* at 0, *Slightly Annoyed* at 3 — and screen 658's *What you should do* is generated from that band. A slider needs a **band map** (value → label → advice) the way options need `scale_ref`.
2. **`display` has no value for this composition.** Ours is `emoji \| nps \| dropdown \| image`; this is ruler + face + band label. Compare 660–662, where the identical activity renders bare.

Renderer for `slider` is still **owed**.

**Critique.** A 0–9 scale where 0 is the resting state means the control opens at the far-left extreme and the thumb has nowhere to sit *before* an answer. There is no null state — the screen is already asserting *Calm* before the user has said anything, and that answer will be recorded if they just press NEXT. For an anger log that is a silent false negative.

**Do.** Band map on the scale. A `display` value for the ruler build. And a null state before first touch.

---

### 657 · Anger Thermometer — slider at 3, follow-up appears

Same, plus a new instruction **"Mark all that applicable to you now."** and four checkboxes below the divider — *Increase in heart rate · Rolling of eyes · Stamping your feet · Can't concentrate on your task*.

| | |
|---|---|
| maps to | `exercise` · `slider` + `exercise` · `multi-select` in one step |
| verdict | **MISSING** |

**Why missing.** The checkbox list **does not exist at 0**. That is conditional visibility — a rule between two blocks in the same step, keyed off the first block's value. **We have this nowhere.** Not a label (it isn't drawing), not a policy (it isn't a type guarantee), not an activity. It is a new kind of thing: an authored rule on a block that reads another block's answer.

After the instrument itself, this is the largest gap in this set.

**Critique.** Good clinical design — symptom checklists are only meaningful once arousal is non-zero, and hiding it at 0 stops the user pattern-matching their way into symptoms they don't have. But the reveal has no motion and no anchor, so on a phone the list appears below the fold and the user may never see it.

**Do.** Specify `visible_when: { key, op, value }` on a block. Scroll-to-reveal on first appearance.

---

### 658 · Anger Thermometer — review

Three labelled cards: **Your Situation** (the text) · **Your anger temperature** (3 · Slightly Annoyed · the two ticked signs) · **What you should do** (two bullets of advice). **EDIT \| SAVE**.

| | |
|---|---|
| maps to | nothing |
| verdict | **MISSING** — §A |

**Why missing, precisely.** Our nearest is `table-review` — *read your own series back* — which reads **one** block's answers as a grid. This composes **four heterogeneous blocks** into one card stack, and adds a section neither the user nor the author wrote: *What you should do* is **generated from the band**.

So this is two missing things stacked: a **composite review** and an **interpretation**.

And **EDIT is not `navigationBack`.** Back-navigation revises an answer in sequence, and our policy turns it off on every scored type. This reopens a committed draft from a review with everything loaded. Different thing, needs its own word.

**Critique.** The cards are right — labelled, tinted headers, one concern each. Two problems: *What you should do* is cut off mid-list by the button bar, so the most valuable card is the one the user sees least; and **SAVE and EDIT are equal weight**, which is wrong when SAVE is the outcome and EDIT is the exception.

**Do.** Ledger/instrument spec. Composite review as a block. `interpretation` as a band-driven content field. Demote EDIT to a text button.

---

### 659 · Anger Thermometer — ledger

**Page 1 — 10 September, 08:14 AM** card holding 3 · Slightly Annoyed · the text · **More Details… >**. Then **+ ADD NEW**. **DONE**.

| | |
|---|---|
| maps to | nothing |
| verdict | **MISSING** — §A |

**Why missing.** This is the instrument's own history, addressable and reopenable, with no relationship to a programme day. Our `completedDays[day].responses[identity]` cannot express it: it is keyed by day, holds one value per key, and has no notion of a second run.

**Critique.** *Page 1* is the wrong noun — the user filled in a worksheet, not a page, and after twenty entries *Page 17* tells them nothing. Date and band are what they will scan by. Also: one entry and the screen is 80% empty with `+ ADD NEW` floating mid-void; the empty and near-empty states need designing, not inheriting.

**Do.** Instrument ledger. Label entries by date + band, not index.

---

### 660 · 661 · 662 · Trigger rating — bare sliders

*"You have recently joined a new job and a co-worker disrespects you"* → slider, value in the thumb, orange fill. Three screens, one per trigger.

| | |
|---|---|
| maps to | `exercise` · `slider` · `rate` · `min` · `max` · `step` |
| verdict | **HAVE** |

The one clean map in the set. Renderer **owed**, nothing else missing.

**Critique.** The slider sits at the vertical centre of an otherwise empty screen, ~1000px below the question — thumb and prompt cannot be read together, and on a tall phone the eye has to travel the whole viewport per item. Three near-identical screens in a row with no progress indicator gives no sense of how many are left. And unlike 656 there is **no band label**, so 7 means nothing: the same product teaches the user that a number carries a word, then withholds it.

**Do.** Nothing for the model. For ours: pull the control under the prompt, show *2 of 3*, and label the bands.

---

### 663 · "We've ranked your triggers! Click on each to learn more about them."

Two rows, **empty orange radio circles**, **no primary button**.

| | |
|---|---|
| maps to | nothing cleanly |
| verdict | **MISSING** |

**Why missing.** Two distinct absences:

1. **The app ranked, not the user.** Our `ranking` activity is `rate · order` — *the user* sequences items. This is a **computed result presented for exploration**. A displayed ordering derived from prior answers is output, not input, and we have no way to author it.
2. **There is no NEXT.** Progression is gated on **visiting both rows**. That is `completion: all-visited` — which proves the `completion` policy I scoped to media generalises to lists.

**Critique.** The circles are the bug. They are drawn as radio buttons — the universal signal for *pick one* — but they are read receipts. A user who taps one and sees a detail screen has no idea both must be visited, and returns to two identical empty circles. Use a check that fills on visit, and say so: *Open each to continue*. The copy is also wrong twice: an exclamation mark on an anger worksheet, and *Click* on a touchscreen.

**Do.** `completion: all-visited`. A way to author a computed ordering. And never render a progress marker as a choice control.

---

### 664 · "This is anger due to a threat to your self-esteem"

The selected trigger highlighted orange with a check, then explanatory body, then **Other threats to your self esteem** and more body. **EDIT \| NEXT**.

| | |
|---|---|
| maps to | `lesson` · `read` · `observe` — but the body is selected by a prior answer |
| verdict | **PARTIAL** |

**Why partial.** The block renders fine. What we cannot express is that **which** body renders is chosen by what the user picked on 663. We have `source_key` on exactly one activity — `table-review` — to read another block's answer. Content branching on a response is not in the model.

Note this is `read`, so it stays `lesson` under the duration test — no clock, no media.

**Critique.** *self esteem* in the sub-head, *self-esteem* in the title. Same screen. And EDIT next to NEXT on a page the user cannot edit — there is no input here — so it must mean *go back and change the trigger*, which is not what the word says.

**Do.** Generalise `source_key` to content selection. Fix the label.

---

### 665 · Negative Thinking Styles — ledger

**Page 1** (green) · **Page 2** (pink) · **Page 3** (blue), each dated; Page 3 expanded with • Catastrophising • Always Being Right + **More details… >**. **START NEW**.

| | |
|---|---|
| maps to | nothing |
| verdict | **MISSING** — §A |

Same absence as 659, and it is the clearer proof: **three entries, same instrument, same morning** — 05:48, 05:49, 08:12.

**Critique.** **The colours are meaningless.** Green, pink, blue on three entries of one instrument by one user with no severity difference between them. In a clinical history, colour that carries no meaning teaches the user to read meaning that is not there — and green/pink in a mental-health list reads as good/bad whether you intended it or not. This is the worst decision in the fifteen screens. Also *START NEW* here and *+ ADD NEW* on 659 for the same action.

**Do.** One colour, or colour by band. One verb across both ledgers.

---

### 676 · Gratitude Jar — capture

*"Fill in your gratitude jar by noting down your positive experiences"*. Lines: `nznzh` · `why` · an active empty *Write what makes you grateful*. `?` and **⋮**. NEXT.

| | |
|---|---|
| maps to | nothing |
| verdict | **MISSING** |

**Why missing.** Type a line, a new empty line appears. Output is **`string[]`**.

- `text` → one string
- `multi-select` → `option_id[]`
- `structured-list` → fixed authored items, ticked
- `input-table` → fixed columns

**Nothing we have produces an unbounded list of the user's own strings** — and gratitude lists, thought records, values lists and goal lists are all this one shape. This is the most reusable missing activity in the set.

Interaction is `share`. Candidate name: `list-entry`.

**Critique.** No affordance says the list grows — no `+`, no counter, no hint. The user learns it by accident on their first Enter. And there is no delete: an entry typed by mistake (`nznzh`) is permanent from this screen. A ⋮ menu appears here and on 677 but on no other screen in the flow.

**Do.** New activity producing `string[]`, with `min`/`max` and per-row delete.

---

### 677 · Your Gratitude Jar — review

Title · description · **Your gratitude moments** · the two entries. **EDIT \| NEXT**. ⋮

| | |
|---|---|
| maps to | nothing |
| verdict | **MISSING** — §A |

The simplest review in the set: one block read back, no interpretation. It is what `table-review` would be if `table-review` were not table-shaped.

**Critique.** Third review layout in fifteen screens — tinted cards on 658, highlighted chip and prose on 664, section label and rules here. Nobody named the pattern, so it was rebuilt three times. That is the same failure as the two players and the two reminder screens: **this whole app is the argument for our vocabulary.**

**Do.** One review renderer, driven by which blocks it reads back.

---

### 678 · "From this list, select the cognitive signs you have experienced"

Five checkboxes, three checked (checked = bold + dark, unchecked = grey). Includes **"Thoughts of hurting someone"** — checked, and NEXT proceeds.

| | |
|---|---|
| maps to | `exercise` · `multi-select` · `choose` · requires `scale_ref` |
| verdict | **HAVE** — with a defect that corrects our own spec |

**The correction.** §10.1 as filed puts `risk: surface` on `assessment · check-in · journal · reflection`, and reads `is_risk_indicator` **per question**. This screen is an `exercise · multi-select`, and the risk lives on **one option**, not the question.

**`is_risk_indicator` has to attach to a catalog option — a `scale_ref` row — or every checklist in the app has the hole Amaha has here.** §10.1 needs amending before it is built.

**Critique.** Amaha ticks *thoughts of hurting someone* and moves on. Whatever the intent, that is the failure our `support` block exists to prevent. Separately: bold-on-select is a poor state signal — weight is the least perceptible of the encodings and it makes the unchecked rows read as disabled.

**Do.** Amend §10.1 to option-level risk. Use fill, not weight, for selected state.

---

## What to build, in order

| | | why here |
|---|---|---|
| 1 | **Amend §10.1** — risk on options, not only questions | Corrects a spec already filed. Cheap. Safety. |
| 2 | **`list-entry`** — an activity producing `string[]` | Self-contained, no schema fight, unblocks four content shapes |
| 3 | **`prompts[]`** on `journal`/`text` | One field, fixes the blank box |
| 4 | **Band map** on sliders (value → label → advice) | Data the interpretation phase depends on |
| 5 | **`visible_when`** — conditional visibility between blocks | Structural, but scoped to a step |
| 6 | **`completion: all-visited`** on lists | Generalises the media policy already proposed |
| 7 | **The instrument** — capture/review/interpret/ledger, dated entries, referenced by days | The big one. Everything in §A waits on it. |
| 8 | `allow_other` on scale rows | Output-shape migration; sequence it with a retype |

**1–4 are additive and break nothing. 5 and 6 are new authored rules. 7 is a data-model change and 8 is a migration — those two are the only irreversible items here.**

Unchanged and still first, independent of all of it: **36 live blocks missing a required `scale_ref`.**
