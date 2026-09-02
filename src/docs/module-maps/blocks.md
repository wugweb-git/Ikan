# One primitive, six vocabularies, and nine blocks that render wrong

*Module 4 of 5 · single source of truth · read-only survey · live database 2026-09-02*

Everything a user reads, answers, rates or writes in this app is the same object — an `Activity`, called a Block in the admin. This is what that object is, who authors it, what draws it, the six competing vocabularies that describe it, the reconciliation of every term against 498 live blocks, and the nine blocks that are rendering as free-text boxes today because of a subtype nobody declared.

`db **jpfvoevxegnknxoqmwye** | branch **equip-carry-forward** @ **4423f72f** | **498** live blocks · 406 equip · 92 assessments | read-only · **no writes made**`

Six vocabularies describe one object: `block_type`, `exercise_subtype`, `interaction_type`, the 23-string palette inside `day-presets.ts`, assessments’ own seven-value question union with its eleven-entry alias map, and check-in’s six snake_case step types. Only two of the six have real consumers. The one the renderer actually reads — `interaction` — is present on 53 of 498 blocks, so 445 go through a switch statement with a default case, and that default case is where the eight authored tables and one rating scale end up.

## Contents

- **01** Module flow, end to end
- **02** What a Block is — four tiers
- **03** What else a Block carries
- **04** Every vocabulary, and who reads it
- **05** Declared vs live — the reconciliation
- **06** What 406 live blocks contain
- **07** The resolver, and the nine it renders wrong
- **08** Check-in scales, read as Blocks
- **09** Three builders, one of which is real
- **10** Day presets, and the guardrail that doesn’t run
- **11** Errors and fallbacks
- **12** Code surface — every file
- **13** Target — one vocabulary
- **14** Standing open
- **15** Change brief

## 01 · Module flow, end to end
*author → store → resolve → render*

*[diagram]* **The solid path is the whole real system, and it is four stages long.** Two catalog vocabularies feed one editor, one store holds the block, one resolver derives its interaction at read time, one renderer draws it. Everything in the bottom band is a parallel vocabulary for the same primitive, built at a different time for a different consumer. Six vocabularies, one object.

> **[CRITICAL] Tier 3 is the one the renderer obeys, and it is the one nothing writes.**
>
> `resolveInteraction()` opens with `if (activity.interaction) return activity.interaction;` — an explicit interaction wins outright. **53 of 498 blocks have one**, all in assessments; zero of the 406 equip blocks do. Every other block's interaction is derived by a switch over type and subtype, which is why an undeclared subtype does not error — it reaches a default case and gets a plausible wrong answer.
>
> Persisting `interaction` at authoring time is what removes the derivation, the default case, and the whole class of defect in §07. **The admin panel already says this is the plan** — see §13.

## 02 · What a Block is: four tiers that resolve into each other
*type → subtype → interaction → render*

Nothing in this app renders off a block's `type` or `subtype` directly. Both collapse into a single `interaction` value, and the renderer switches on that alone. Front-end rendering is therefore tier 4 of the Block's own schema, not a separate concern — the builder and the player cannot be reasoned about independently.

*[diagram]* **The solid path is the whole real system.** Two stored vocabularies feed one editor, one resolver collapses them, one renderer draws them. Everything dashed either mirrors that path without being read, or reimplements it in parallel. The bottom lane is Check-in: its own type list, its own steps, its own renderer — and, on the far right, the one piece of it that is already the right shape.

*The four tiers, and whether the store backs each one*

| Tier | Answers | Lives in | Store-backed? |
|---|---|---|---|
| **1 · Type** | What kind of content is this? | Activity.type — 7 values | yes — block_type, 7 rows, real consumers |
| **2 · Subtype** | Within an exercise, what shape of answer? | exerciseConfig.subtype — 11 values | yes — exercise_subtype, 11 rows |
| **3 · Interaction** | How does a user answer this? | resolveInteraction() — 12 values | mirrored but never read |
| **4 · Render** | Which component draws it? | BlockRenderer switch — 12 cases | no — pure code |

## 03 · What else a Block carries
*beyond type and subtype*

The tiers describe what *kind* of block something is. A Block also carries cross-cutting features that apply regardless of type, and are as much its schema as the taxonomy is.

*Activity — every field, from equip-admin-types.ts*

| Field | What it does |
|---|---|
| id | Stable identity. Load-bearing for carry-forward, because `progress.block_responses` is keyed by it. |
| title · subtitle · content | Display text and rich-text body |
| type · interaction | Tiers 1 and 3. `interaction`, when set explicitly, short-circuits the resolver entirely. |
| exerciseConfig | Subtype-specific config — 20 optional fields, listed below |
| duration · required · order | Estimated minutes, blocks day completion, position within the day |
| image_url · data_id | Image or video attachment (YouTube / Vimeo / .mp4); optional external data reference |
| stepGroup | Wizard-flow grouping — blocks sharing a group id render as one navigable step. Governed per-day by the preset's stepGroupRules, and this enforcement is **real**: the editor hides the field when a preset disallows it. |
| autoAdvance | Whether completing this block advances automatically. Also preset-governed. |
| repeat | Carry-forward. See below. |

### ExerciseConfig — the 20 fields under a subtype

*Every optional field, grouped by which subtypes use it*

| Group | Fields |
|---|---|
| **Universal** | subtype · prompt · options · scoring |
| **Clinical instrument** | questions[] · scale[] — an array of {label, value} pairs, **the one place a Block already stores option values the way a Scale does** |
| **Tables & matrices** | columns · rows · tableColumns · tableRows · allow_add_rows · editable |
| **Quiz** | correctAnswer · allCorrect |
| **Lists & logs** | listItems · maxEntries · autoDelete · progressive |
| **Upload** | acceptedFileTypes · maxFileSize (default 10 MB) |

`TableColumn` carries its own four-value type union — `text · boolean · rtf · date` — which is arguably a sixth vocabulary, scoped to table cells.

### Carry-forward — a block on more than one day without duplicating it

Copy-pasting a block across days would mint new ids and fragment `progress.block_responses`, which is keyed by block id. `ActivityRepeat` lets one block with one stable id surface on many days instead. The code and the editor UI are both real — but **no stored block uses it** (see §06).

| Mode | Behaviour |
|---|---|
| simple_repeat | Prior days' entries shown read-only, one new entry per occurrence — a running mood log |
| column_addition | Prior columns stay read-only; new columns introduced on given days via `columnsByDay` — a habit tracker growing week over week |
| on_demand | Reachable any day from `onDemandFromDay` onward — a single evolving response |

Plus `everyDay` and an explicit `onDays` list; `repeatTargetDays()` resolves the actual day set at runtime.

> **[OK] Blocks structurally cannot orphan.**
>
> They are not a top-level prefix — they live embedded inside `equip:{id}.daily_content[].activities[]`, one JSON blob per program. There is no separate key for a reference to dangle from, so the relation registry correctly has no entry for them. Verified as exempt, not logged as a gap.

## 04 · Every vocabulary, and who actually reads it
*live counts*

- **Block types: 7** — real consumers
- **Exercise subtypes: 11** — 12 values in code
- **Interaction types: 12** — zero real readers
- **Check-in block types: 7** — zero readers anywhere
- **Day config types: 11** — 10 presets in code
- **Day presets: 10** — TS union still declares 7

*Consumer check — grep for the destructured bucket name across components, hooks and lib*

| Vocabulary | Rows | Read by | Status |
|---|---|---|---|
| block_type | 7 | BlockEditor · DayEditor · AdminBlockTypeViewer | real |
| exercise_subtype | 11 | BlockEditor · AdminBlockTypeViewer | real |
| ema_category | 11 | AdminCheckinTemplateBuilder | real |
| interaction_type | 12 | AdminBlockTypeViewer only — a read-only reference screen | decorative |
| day_config_type | 11 | AdminBlockTypeViewer only | decorative |
| checkin_block_type | 7 | **nothing** — not one component destructures the bucket | dead |
| media_type | 5 | **nothing** | dead |

`interaction_type`'s twelve rows mirror the `InteractionType` union exactly, value for value. Someone clearly intended them to drive `resolveInteraction()`. That function is a hardcoded `switch` and has never read them. `day_config_type` holds eleven values against ten real presets — `onboarding` exists in the catalog and in no code path at all, so an admin picking it silently gets nothing.

*The full type × subtype inventory, with the interaction each resolves to*

| Value | Tier | Use case | Interaction |
|---|---|---|---|
| lesson | type | Read educational content at your own pace | read |
| exercise | type | Container for any interactive question — behaviour comes from the subtype | varies |
| journal | type | Free-text entry | write |
| checklist | type | Toggle a list of items | check |
| reflection | type | Closure prompt — becomes select-one if options are present | write / select-one |
| conclude | type | Day-ending summary, always last on a day | complete |
| sleep-diary | type | Nightly tracker grid | track-table |
| mcq | subtype | Single-answer scored question | select-one |
| single-select | subtype | Pick one, unscored | select-one |
| multi-select | subtype | Pick several — Check-in's multi_select is this | select-many |
| table | subtype | Yes/No grid | track-table |
| input-table | subtype | Free data-entry grid | input-table |
| structured-list | subtype | Ordered list with per-item input | check |
| rating-scale | subtype | Numeric scale with labels — Check-in's emoji_scale and slider are this | rate |
| clinical-instrument | subtype | Validated multi-question scored instrument (GAD-7, PHQ-9 shape) | clinical |
| upload | subtype | File upload — available, used by no preset's defaults | upload |
| ephemeral-journal | subtype | Session-scoped journal — Check-in's free_text is this | write |
| comparison-matrix | subtype | Side-by-side table, Workshop days only | input-table |
| likert | code alias | Alternate name for rating-scale — not in the editor dropdown, no KV row | rate |

## 05 · Declared vs live — the reconciliation
*498 blocks · term by term*

§04 establishes which vocabularies have real consumers. This is the term-level comparison the catalog and the content have never been put through: **every declared term against every value in live data**, both directions, with a decision for each. Everything here is non-destructive — one retirement, and it has zero blocks behind it.

- **Live blocks: 498** — 406 equip · 92 assessments
- **In use, undeclared: 6** — 1 type · 5 subtypes
- **Declared, unused: 6** — 1 type · 5 subtypes
- **Rendering wrong today: 9** — see §07

### block_type — 7 declared, 7 in use, 6 in common

*Catalog term against live usage, both modules*

| Term | Declared | Equip | Assessments | Total | Decision |
|---|---|---|---|---|---|
| **exercise** | yes | 143 | 92 | 235 | keep |
| **lesson** | yes | 131 | 0 | 131 | keep |
| **conclude** | yes | 84 | 0 | 84 | keep — but it is a day-position concept wearing a block type (§10) |
| **reflection** | yes | 25 | 0 | 25 | keep |
| **quiz** | NO | 12 | 0 | 12 | **ADD** — all 4 programs use it |
| **checklist** | yes | 8 | 0 | 8 | keep |
| **journal** | yes | 3 | 0 | 3 | keep |
| **sleep-diary** | yes | 0 | 0 | 0 | **RETIRE** — it is an `exercise · input-table` |

`sleep-diary` describes exactly what Sleep Tight's 126 `exercise · input-table` blocks already are. Declaring it as a type puts one program's content pattern into the product's primitive vocabulary — the same category error as `conclude` and as `lesson` being used as a day type on eight days. Let subtype carry the meaning.

### exercise_subtype — 11 declared, 11 in use, 6 in common

*The widest divergence in the product, and the one that costs users something*

| Term | Declared | Equip | Assessments | Resolves to | Decision |
|---|---|---|---|---|---|
| **In both lists — 6 terms, 336 blocks** | | | | | |
| input-table | yes | 127 | 0 | input-table | keep |
| mcq | yes | 3 | 53 | select-one | keep |
| single-select | yes | 15 | 39 | select-one | keep |
| multi-select | yes | 17 | 0 | select-many | keep |
| comparison-matrix | yes | 9 | 0 | input-table | keep |
| structured-list | yes | 4 | 0 | check | keep |
| **In use, never declared — 5 terms, 12 blocks, every one hitting the default case** | | | | | |
| **matrix** | NO | 8 | 0 | **write** wrong | **ALIAS → comparison-matrix** |
| **scale** | NO | 1 | 0 | **write** wrong | **ALIAS → rating-scale** |
| **row_list** | NO | 1 | 0 | write | **ALIAS → structured-list** |
| **text_list** | NO | 1 | 0 | write | **ALIAS → structured-list** |
| **number** | NO | 1 | 0 | write | ADD, or alias to a numeric subtype |
| **Declared, never used — 5 terms, and all five sit in BlockEditor's fallback list** | | | | | |
| table | yes | 0 | 0 | track-table | keep — the only route to `track-table` |
| rating-scale | yes | 0 | 0 | rate | keep — `scale` should alias here |
| clinical-instrument | yes | 0 | 0 | clinical | **keep and start using** — all 92 assessment items are this |
| upload | yes | 0 | 0 | upload | keep |
| ephemeral-journal | yes | 0 | 0 | write / select-one | keep |

> **[CRITICAL] The five undeclared subtypes did not come from the editor.**
>
> This is the correction that narrows the problem. `BlockEditor.tsx` **does** read the catalog — `kvBlockTypes` and `kvExerciseSubtypes` from `useMetadata` — and only uses its hardcoded arrays at lines 38 and 53 when the catalog has not loaded. And those fallback arrays contain `table`, `rating-scale`, `clinical-instrument`, `upload` and `ephemeral-journal` — precisely the five declared-but-unused terms.
>
> So `matrix`, `scale`, `number`, `row_list` and `text_list` appear in **neither the dropdown nor the fallback**. They were written into the data by some path that is not this editor. The casing gives it away — `row_list` and `text_list` are snake_case where every catalog term and every fallback entry is kebab-case. **A third writer exists and has not been found.**

> **[WARNING] The alias problem is already half-solved, in the wrong place.**
>
> `resolveInteraction()` already accepts snake_case aliases for three terms — `comparison_matrix`, `rating_scale`, `clinical_instrument` — plus `likert`, which appears in no vocabulary at all. A previous author hit exactly this and solved it by adding switch cases. **That is a fifth vocabulary living in a function**, and it is the one the renderer actually obeys.
>
> Adding four more cases fixes today. Putting an `aliases[]` field on the catalog term fixes the pattern, and lets the editor, the renderer and a migration all read the same list.

> **[NOTE] `clinical-instrument` is declared, unused, and describes 92 blocks exactly.**
>
> Every assessment item is a clinical instrument item; every one is stored as a bare `exercise` with `mcq` or `single-select`. The term exists, maps to a dedicated `clinical` interaction, and has never been applied. Using it would let the renderer, the scoring engine and any export tell a GAD-7 item from a program worksheet **from the data alone** — which is exactly the distinction the assessments module currently rebuilds from a code file keyed by slug.

## 06 · What 406 live blocks actually contain
*declared vs stored*

The taxonomy above is what the system says a Block may be. This is what the four equip programs actually hold — and the two lists do not match.

- **Blocks stored: 406** — across 4 programs
- **With scoring enabled: 0** — not one, anywhere
- **Using carry-forward: 0** — the feature is built and unused
- **With an explicit interaction: 0** — every block goes through the resolver
- **Undeclared types in use: 1** — quiz
- **Undeclared subtypes in use: 5** — matrix · row_list · text_list · number · scale

*Every type × subtype combination stored today, with what the resolver makes of it*

| type | subtype | Blocks | Declared? | Resolves to |
|---|---|---|---|---|
| exercise | input-table | 126 | both | input-table |
| lesson | — | 118 | both | read |
| conclude | — | 84 | both | complete |
| reflection | — | 14 | both | write |
| exercise | comparison-matrix | 9 | both | input-table |
| checklist | multi-select | 8 | both | select-many not check |
| exercise | single-select | 7 | both | select-one |
| **quiz** | single-select | 6 | type undeclared | select-one |
| lesson | multi-select | 6 | both | select-many a lesson that answers |
| lesson | **matrix** | 4 | subtype undeclared | default branch |
| reflection | **matrix** | 4 | subtype undeclared | default branch |
| reflection | structured-list | 3 | both | check |
| journal | — | 3 | both | write |
| **quiz** | mcq | 3 | type undeclared | select-one |
| lesson | single-select | 2 | both | select-one |
| **quiz** | multi-select | 2 | type undeclared | select-many |
| reflection | **row_list** | 1 | subtype undeclared | default branch |
| **quiz** | **scale** | 1 | both undeclared | default branch |
| reflection | multi-select | 1 | both | select-many |
| reflection | **text_list** | 1 | subtype undeclared | default branch |
| exercise | structured-list | 1 | both | check |
| lesson | input-table | 1 | both | input-table |
| reflection | **number** | 1 | subtype undeclared | default branch |

> **[CRITICAL] `quiz` is a live block type that does not exist.**
>
> Twelve blocks carry `type: "quiz"`. It is not in the `Activity.type` union, not one of the seven `block_type` rows, and has no case in `resolveInteraction`'s direct-type switch. It survives only because those blocks also carry a subtype — and the resolver's first condition is `type === 'exercise' **\\\|\\\| subtype**`, so anything with a subtype takes the subtype path regardless of its type. `quiz` is a *day preset* name that got written into a block's type field.
>
> The same clause is why `lesson` + `multi-select` renders as a multi-select question rather than as reading content. Nine blocks are lessons that ask you something.

> **[CRITICAL] Five subtypes in the data exist in no vocabulary.**
>
> `matrix` (8 blocks), `row_list`, `text_list`, `number` and `scale` (1 each) appear in neither the `exercise_subtype` catalog nor the `ExerciseConfig.subtype` union. Each falls to `resolveInteraction`'s default branch, which returns `select-one` if the block has options and `write` if it doesn't. Nothing errors; the block just renders as whatever the fallback decides. `matrix` is almost certainly meant to be `comparison-matrix` or `input-table`, and `scale` to be `rating_scale` — but that is inference, not something the data states.

> **[WARNING] Carry-forward is built, wired into the editor, and used by nothing.**
>
> `ActivityRepeat`, its three modes and `repeatTargetDays()` are all real code, and the editor renders a Carry forward section. **Zero of 406 stored blocks carry a `repeat` field.** Sleep Tight's sixteen duplicated days are exactly what this feature exists to prevent, and they were authored by copy-paste instead.

## 07 · The resolver, and the nine blocks it renders wrong
*verified, not inferred*

§06 records that six values in the data reach `resolveInteraction()`'s default branch. This is what the default branch does with them, and what that means on screen. **It is the only user-visible defect in this survey that no single-module reading could have found.**

### The default branch

> **[NOTE] **
>
> ```
> // lib/equip-admin-types.ts ~100
> default:
>   // Exercise with options but no subtype → select-one
>   if (exerciseConfig?.options && exerciseConfig.options.length > 0) return 'select-one';
>   return 'write';
> ```

Two outcomes: a block with options becomes a single-select question; a block without options becomes `write` — a free-text box. Neither errors, neither logs. The branch is a legitimate case, which is why it has never been noticed.

### What the twelve affected blocks actually carry

*Per-block field check against exactly what the default branch tests*

| Subtype | Type | Blocks | Has `columns` | Has `options` | Explicit `interaction` | Resolves to | Should be |
|---|---|---|---|---|---|---|---|
| **matrix** | lesson | 4 | 4 / 4 | 0 / 4 | 0 / 4 | **write** | input-table |
| **matrix** | reflection | 4 | 4 / 4 | 0 / 4 | 0 / 4 | **write** | input-table |
| **scale** | quiz | 1 | 0 | 0 | 0 | **write** | rate |
| row_list | reflection | 1 | 0 | 0 | 0 | write | check |
| text_list | reflection | 1 | 0 | 0 | 0 | write | check |
| number | reflection | 1 | 0 | 0 | 0 | write | a numeric input |

> **[CRITICAL] Eight authored tables render as a single free-text box.**
>
> All eight `matrix` blocks carry `columns` — they are tables. None carries `options`, so the default branch's escape hatch misses. None carries an explicit `interaction`, so nothing overrides. They resolve to `write`, and **the columns the author defined are never drawn.** The user is shown a textarea.
>
> Live, in two published programs — Sleep Tight and Unburn — on `lesson` and `reflection` days. The one `quiz · scale` block takes the same path: it should be a rating scale and is a textarea.
>
> **Nine blocks. The fix is four cases in a switch statement, and it depends on nothing.**

> **[WARNING] The second-order problem: the branch cannot be told from a legitimate one.**
>
> `reflection` with no subtype resolves to `write` too, and correctly — that is what a reflection prompt is. So a log line at the point of render would not distinguish "this is a text block" from "this is a table I could not identify". The only place the difference is knowable is **at the default case, where the subtype string is still in hand.** Warning there, with the subtype and block id, is what turns the next undeclared term into a log entry instead of a broken screen.

> **[WARNING] And a related one the same clause causes: nine lessons that ask you a question.**
>
> The resolver's first condition is `if (type === 'exercise' \\|\\| subtype)` — so **any** block carrying a subtype takes the subtype path regardless of its type. That is why `lesson · multi-select` (6 blocks) and `lesson · single-select` (2) render as questions rather than as reading content, and why the undeclared `quiz` type works at all despite having no case anywhere.
>
> This is not obviously wrong — a lesson that ends in a question is a reasonable thing to author. But it is happening by accident of a boolean, not by design, and **type is being silently overruled on 21 blocks.**

## 08 · Check-in scales, read as Blocks
*6 step types · 6 mappings*

Every check-in step type already has a home in the Block taxonomy. Nothing needs inventing — the mapping below is drawn from the two vocabularies as they exist today, not proposed.

*Check-in step type → the Block it already is*

| Check-in step | Its option source | Block type | Subtype | Interaction |
|---|---|---|---|---|
| emoji_scale | checkin_scale:mood · energy · stress · sleep · pain | exercise | rating-scale | rate |
| slider | numeric min/max + labels | exercise | rating-scale | rate |
| single_choice | step.options | exercise | mcq / single-select | select-one |
| multi_select | checkin_scale:context_tags | exercise | multi-select | select-many |
| free_text | — | journal | ephemeral-journal | write |
| yes_no | two literals | exercise | mcq, 2 options | select-one |

> **[NOTE] A Scale is an option set. That is all a Block's options are.**
>
> The five `checkin_scale:` records are stored as bare JSON arrays — each element carrying `id · label · emoji · char · value · order · severity · is_active`. A Block's `exerciseConfig.options` is an array of the same kind of thing, only flatter: plain strings, with weights held alongside in a parallel map. **The Scale format is the richer one.** If anything, Blocks should adopt it rather than the reverse — options that carry their own value and severity are exactly what the assessment scoring layer keeps reconstructing by hand.
>
> The one apparent exception, `context_tags`, is not an exception: it is an 8-item option set with no values and no severity, which is precisely a `multi-select` exercise's options.

### The six vocabularies, live

*checkin_template:default-daily-checkin — the only template that has ever existed*

| # | Step | Type | Scale | Required |
|---|---|---|---|---|
| 1 | How are you feeling? | emoji_scale | mood | yes |
| 2 | What's your energy like? | emoji_scale | energy | no |
| 3 | Stress level? | emoji_scale | stress | no |
| 4 | Anything on your mind? | free_text | — | no |
| 5 | What shaped your day? | multi_select | context_tags | no |

Four of the five `scale_key` values resolve through `getScaleByKey()`. The fifth — `mood`, the required first step — has **no `checkin_scale:mood` record**: it is stored under the separate `mood:{id}` prefix and reached by a hardcoded branch at `MoodJournal.tsx:438`. `sleep` and `pain` are authored, clean, and used by no template — the daily check-in never asks for them, which is why `pain_level`, `pain_impact` and `sleep_quality` are null on every journal entry.

> **[CRITICAL] The string formats don't even agree with each other.**
>
> The builder's hardcoded list uses underscores — `emoji_scale`, `free_text`, `single_choice`, `yes_no`. The `checkin_block_type` records that mirror it use hyphens — `emoji-scale`, `free-text`, `single-choice`, `yes-no` — because the Metadata Catalog slugifies its own labels. Pointing one at the other needs a normalisation pass, not a one-line swap. And `context-tags` exists in the catalog as a seventh type while the builder treats it as a special case of `multi_select`.

## 09 · Three builders, one of which is real
*and two outliers*

The first pass at this concluded there were three independent builders, by checking whether each wizard calls the metadata hook itself. That test can't see one wizard *rendering another's component* — which is exactly what happens.

| Feature | What it actually renders | Taxonomy | Verdict |
|---|---|---|---|
| **Equip** | DayEditor + BlockEditor | native — this *is* the shared system | the system |
| **Assessment** | the same DayEditor, imported directly, via a convertQuestionsToDay() adapter | same as Equip | correct reuse |
| **Check-in** | AdminCheckinTemplateBuilder — imports neither | own hardcoded 6-value array | the outlier |
| **Milestone check-in** | ProgramCheckIn.tsx — no builder at all | 4 hardcoded questions, no store | no authoring surface |

So the count isn't three builders — it is **one shared block editor, correctly reused by two of three features, and one that isn't using it.** Assessment reusing Equip's editor is the system working. Check-in not doing the same is the actual problem, and the honest answer to "will a fourth feature invent a fourth builder" is: only if it ignores what Assessment already demonstrates.

The pipeline runs further than the editor. `ProgramPlayer.tsx` is imported by every flow that plays a program back — the equip wizard, the program flow, onboarding, and `AssessmentFlow` — which confirms Assessment shares the chain end to end, not just at authoring time. Author → store → deliver → render is one system: **Builder is the whole chain, not the editing screen.**

> **[WARNING] ProgramCheckIn is more disconnected than the Check-in builder ever was.**
>
> Triggered on program day 7, 14, 30 or the last day by `equip.checkInConfig`, it asks four fully hardcoded questions — perceived change, confidence, continuation intent, feedback — with zero store involvement, zero Block or Scale reuse, and no admin surface whatsoever. Its own type carries a commented-out `customQuestions // (future)` field that was never built.
>
> An earlier version of the docs claimed `checkInConfig` links to `checkin_template:` through a `scale_key`. It does not. `checkInConfig` carries only `enabled · triggerDays · triggerOnLastDay · customTitle`, and `scale_key` appears nowhere but on template steps. The two systems share a name and nothing else — a third same-named thing that gets conflated with the other two every time someone says "check-in".

## 10 · Day presets, and the guardrail that doesn't run
*10 presets · 4th vocabulary*

*DAY_TYPE_PRESETS — read from day-presets.ts, not from the stale 7-value TS union*

| Preset | Purpose | Auto-advance | Step groups | Blocked |
|---|---|---|---|---|
| **assessment** | Baseline measurement, severity scoring | yes, no back-nav | disallowed · one block per step | journal, table, checklist, rich_lesson |
| **assessment-lite** | Awareness / reflection, non-scored | yes, back-nav ok | allowed · max 2 per step | — |
| **learning** | Concept introduction | no | required · one step per lesson | — |
| **practice** | Data capture and application | no, save on exit | allowed, not required | — |
| **workshop** | Multi-step thinking | no | required · max 3 per step | — empty |
| **tracker** | Daily repetition, habits, streaks | no, save on toggle | disallowed | — |
| **reflection** | Closure and review | no | disallowed | — |
| **check-in** | Quick daily mood check, 1–3 questions | yes, save on exit | disallowed · one block per step | table, checklist, clinical |
| **rest** | No active tasks | no | disallowed | exercise, journal, checklist, table |
| **quiz** | Knowledge check with scoring | yes, no back-nav | disallowed · one block per step | — |

A `check-in` day preset already exists, with defaults, rules and a blocked list — which is a second, independent argument that check-in content was always meant to be Blocks. Nothing uses it: the Mood Journal's daily check-in runs off `checkin_template:`, not off a day.

> **[CRITICAL] The allow-list is computed and thrown away.**
>
> `validateBlockForDayType()` enforces `blockedComponents` and then builds `isAllowed` — and never uses it. The rejecting line is commented out, so `allowed: true` always wins.
>
> ```
> if (preset.blockedComponents.some(b => key.includes(b))) {
>   return { allowed: false, reason: ... };      // this DOES fire
> }
> const isAllowed = preset.allowedBlocks.some(...);   // computed…
> // if (!isAllowed) return { allowed: false, ... };   // ← commented out
> return { allowed: true };                       // always wins
> ```
>
> Workshop's blocked list is empty, so a Workshop day accepts any block at all, despite an `allowedBlocks` palette that clearly meant to restrict it to lesson, mcq_multi, rtf_list, table_input and comparison_matrix. This is a strong candidate for why mismatched content appears in the first place: the guardrail exists, is well designed, and does not run.

> **[WARNING] And it speaks a fourth vocabulary — 23 strings wide.**
>
> `allowedBlocks` and `blockedComponents` use strings that appear in no store and in no type union: `boolean · callout · checklist · clinical · comparison_matrix · date_time · exercise · journal · journal_short · lesson · likert · long_text · mcq_multi · mcq_single · media · rating_scale · rich_lesson · rtf_list · short_text · summary · table · table_input · table_review`. Some overlap the real names by coincidence; most don't. The bridge between them and the real `block_type`/`exercise_subtype` values is nine hardcoded `if` statements inside the validator, not a mapping table.

### The fifth vocabulary: assessment question types

Assessments do not store Blocks. They store legacy `questions[]`, and those carry their own `type` field with its own seven-value union — a fifth taxonomy, bridged to Blocks by `convertQuestionsToDay()` on load and rebuilt on save.

*LegacyQuestion.type — declared, emittable, and actually stored*

| Value | Maps to subtype | Can the wizard write it? | Live count |
|---|---|---|---|
| single-choice | mcq / single-select → select-one | yes — the fallback for everything | 92 |
| multiple-choice | multi-select → select-many | yes | 0 |
| scale | rating_scale → rate | yes | 0 |
| text | ephemeral-journal → write | yes | 0 |
| dropdown | — no case | no | 0 |
| mcq-icons | — no case | no | 0 |
| true-false | — no case | no | 0 |

Three of the seven are declared and unreachable — the save path collapses everything to four outputs and defaults to `single-choice`. On top of that sits an **eleven-entry alias map** (`multiple_choice · multiselect · single_choice · select · radio · mcq · rating · scale · text · input · textarea`) normalising inbound spellings down to those four, duplicated in both `AssessmentFlow` and the wizard. And live, all 92 questions are `single-choice` — one value of seven.

## 11 · Errors and fallbacks
*nothing in this chain fails loudly*

*Every default in the block author → store → resolve → render chain*

| Where | Fallback | Fires when | What you get |
|---|---|---|---|
| resolveInteraction() default | options ? 'select-one' : 'write' | subtype matches no case — **12 blocks** | A textarea where a table was authored. **9 blocks wrong today** (§07) |
| resolveInteraction() first condition | type === 'exercise' **\\|\\|** subtype | any block with a subtype — **21 blocks whose type is not exercise** | Type silently overruled. Lessons render as questions; the undeclared `quiz` type works |
| validateBlockForDayType() | return { allowed: true } | **always** — the rejecting line is commented out | Any block on any day. Workshop's blocked list is empty, so Workshop accepts everything |
| validateBlockForDayType() | no preset found → allowed | dayType matches no preset — **8 days** typed `lesson` | Even the blocked-list check is skipped on those days |
| BlockEditor.tsx ~38, ~53 | FALLBACK_EXERCISE_SUBTYPES · FALLBACK_BLOCK_TYPES | catalog not yet loaded, or the fetch failed | The admin is offered a **different vocabulary** and cannot tell. `useMetadata` returns empty buckets on a throw |
| block ordering | array position when `order` is absent | **160 of 406 equip blocks** | Stable until anything rewrites the array — and the editor rewrites the whole blob on every save |
| convertQuestionsToDay() | defaults to `single-choice` | any legacy question type the save path cannot emit — 3 of 7 declared | Three declared question types are unreachable. Live, all 92 are `single-choice` |
| assessment alias map | 11 inbound spellings → 4 outputs | every load and save | Works. Duplicated in `AssessmentFlow` and the wizard — two copies to keep in step |
| MoodJournal.tsx ~438 | step.scale_key === 'mood' ? moodOptions : getScaleByKey(...) | every render of the daily check-in | Four scales go through the resolver; the fifth needs a string comparison against a literal |
| block orphaning | — none possible | — | Blocks live embedded in the program blob, so there is no key for a reference to dangle from. **Exempt, not a gap** |

> **[CRITICAL] Four of these are the same bug at four levels.**
>
> An unknown subtype gets a plausible interaction. An unknown day type gets full permission. A failed catalog fetch gets a different vocabulary. A missing `order` gets array position. **In every case a missing value is replaced by a working one, and nothing records that a substitution happened.** That is why six undeclared terms, eight mistyped days and a commented-out guardrail have all coexisted in production without a single error.
>
> The cheapest structural fix is not to remove the fallbacks — several are load-bearing — but to make each one `console.warn` with the value it could not resolve. That turns four silent classes of defect into four searchable ones, and it is a handful of lines.

> **[WARNING] The one that is not a fallback but reads like one.**
>
> `validateBlockForDayType()` computes `isAllowed` and then does not use it — the rejecting line is commented out. That is not a default standing in for missing data; it is a **disabled guardrail**, and it is disabled in a way that leaves the computation in place so the code still looks like it validates. It is the single most misleading line in this module.

## 12 · Code surface — every file
*renamed 2026-09-02*

Everything that defines, authors, resolves or draws a block. The last column is the one to read: **most of this module's taxonomy lives in code that should be reading it from the catalog.**

*By layer. Names reflect the 2026-09-02 rename — see the note below*

| File | Lines | Role | Holds vocabulary that should be data? |
|---|---|---|---|
| **Definition** | | | |
| lib/equip-admin-types.ts | 301 | `Activity`, `ExerciseConfig`, `ActivityRepeat`, `InteractionType`, `resolveInteraction()`, `INTERACTION_META` | **Yes** — the resolver switch is the vocabulary the renderer obeys, plus 4 undeclared aliases |
| components/admin/day-presets.ts | 380 | 10 day presets, `validateBlockForDayType()` | **Yes** — the entire file, plus a 23-string palette vocabulary in no store and no union |
| lib/equip-types.ts | 481 | Program, day and block shapes | `DayContent.dayType` union still declares 7 against 10 real presets |
| **Authoring — shared by both modules** | | | |
| components/screens/BlockEditor.tsx — was BlockEditor | 837 | The block editor. Imported by the equip wizard, the day editor, `AdminBlockTypeViewer` and `AdminBlockFormTemplate` | Reads the catalog via `useMetadata`; two fallback arrays at lines 38 and 53 |
| components/screens/DayEditor.tsx — was DayEditor | 968 | The day editor. Imported by **both** wizards | Day-type list, block palette |
| components/admin/UnifiedBasicInfoForm.tsx | 235 | Shared basic-info form, both wizards | No — reads the catalog |
| components/screens/AssessmentEditPageWizard.tsx | 926 | Imports `DayEditor` and bridges via `convertQuestionsToDay()` | **Yes** — the 7-value legacy question union and an 11-entry alias map |
| components/admin/AdminCheckinTemplateBuilder.tsx | — | The check-in builder. Imports neither editor | **Yes** — its own hardcoded 6-value snake_case step list |
| **Runtime** | | | |
| components/player/BlockRenderer.tsx | 1,016 | Renders one block. The single render path for both modules | **Yes** — the 12-case interaction switch is tier 4 of the schema |
| components/player/ProgramPlayer.tsx | 627 | Day sequencing, completion, response collection | Its own `totalScore` — one of three scoring implementations |
| components/player/SectionReportCard.tsx — moved from blocks/ | 184 | Per-section assessment scores | No — but it has never rendered (assessments §15) |
| components/screens/MoodJournal.tsx | — | The check-in renderer — **a separate 6-case switch** | **Yes** — a parallel renderer for content that is already Blocks |
| **Inspection** | | | |
| components/admin/AdminBlockTypeViewer.tsx | 1,324 | Read-only reference screen. The **only** reader of `interaction_type` and `day_config_type` | Documents the intended end state at line 403 — see §13 |
| components/admin/AdminBlockFormTemplate.tsx | — | Renders `BlockEditor` for preview | — |

> **[NOTE] The block system is shared correctly. As of 2026-09-02 it is also named that way.**
>
> Verified by import graph, not by filename: `AssessmentEditPageWizard` imports `DayEditor` and `UnifiedBasicInfoForm` directly; `BlockEditor` is imported by four callers; `ProgramPlayer` → `BlockRenderer` serves both modules. **There is no duplicate assessment editor and no duplicate renderer.**
>
> Until today the names said otherwise, because equip was built first and the shared primitive kept its prefix. Two unrelated things were also both called "block": the content primitive, and `components/blocks/`, which held page-composition components — heroes, bento grids, resource cards. **The folder you would open looking for the block system was the one place it wasn't.** Commit `0340aa21` on `chore/centralise-block-naming`:
>
> ```
> BlockEditor.tsx -> BlockEditor.tsx          (+ exported symbol)
> DayEditor.tsx -> DayEditor.tsx            (+ exported symbol)
> components/blocks/   -> components/page-blocks/
> blocks/SectionReportCard.tsx -> player/SectionReportCard.tsx
> ```
>
> Renames and import rewrites only, no logic. All 1,334 relative imports re-resolve; the two that do not were already broken. **Not built** — `vite build` cannot run from the mounted filesystem, so a local `npm run build` is required before merge.

> **[WARNING] Six files hold a vocabulary. Two of them are the ones the system actually obeys.**
>
> `resolveInteraction()` decides what a block *is*; `BlockRenderer`'s switch decides what it *looks like*. Neither reads the catalog. The catalog's `interaction_type` rows mirror the `InteractionType` union value for value — someone intended them to drive exactly this — and are read only by a reference screen.

## 13 · Target — one vocabulary, interaction persisted
*proposal · nothing migrated*

> **[NOTE] This is not a new direction. It is a stated one, half-finished.**
>
> `AdminBlockTypeViewer.tsx` line 403, verbatim, on a screen an admin can open today:
>
> *"Every block is an **interaction**. The `interaction` field on Activity replaces the split between `type` + `exerciseConfig.subtype`. Old programs are auto-mapped via `resolveInteraction()`."*
>
> The migration it describes is done for the 53 assessment blocks that carry an explicit `interaction` and has not started for the 406 equip blocks that do not. Everything below finishes it.

### Three rules

- **Interaction is the primitive.** Persist it at authoring time. Keep `resolveInteraction()` only as a read-time migration for rows without one, then delete it.
- **Type is editorial, subtype is structural.** The data already treats them as independent — `multi-select` appears under four different types and `single-select` under three. Stop pretending type constrains subtype; the `\\|\\| subtype` clause already admits it doesn't.
- **Every term carries its aliases.** Five spellings already live in a switch statement. Put them on the catalog term where the editor, the renderer and a migration can all read one list.

*[diagram]* **The change is where the mapping lives, not what it says.** The subtype→interaction mapping is correct today; it just runs at read time, in code, with a default case that produces a plausible wrong answer. Persisting the result at authoring time turns a silent fallback into a stored fact — and makes the resolver dead code rather than a live dependency.

### The canonical vocabulary after reconciliation

*8 types, 12 subtypes, 12 interactions — one retirement, and it has zero blocks behind it*

| Tier | Terms | Change |
|---|---|---|
| **block_type** — editorial | exercise · lesson · conclude · reflection · **quiz** · checklist · journal − sleep-diary | +1 add · −1 retire |
| **exercise_subtype** — structural | input-table · comparison-matrix alias: matrix, comparison_matrix · mcq · single-select · multi-select · structured-list alias: row_list, text_list · table · rating-scale alias: scale, rating_scale, likert · clinical-instrument alias: clinical_instrument · upload · ephemeral-journal · **number** | +1 add · 8 aliases · 0 retire |
| **interaction_type** — the primitive | unchanged — 12 terms, already correct, already mirroring the union value for value | 0 — start *writing* it |
| **day_config_type** | unchanged — 11 terms, already correct | 0 — start *using* it. Retire `lesson` as a day type |
| **checkin_block_type** | emoji-scale alias: emoji_scale · free-text alias: free_text · multi-select alias: multi_select · single-choice · slider · yes-no · context-tags | 3 aliases — the underscore/hyphen split in §08 |
| **day-presets palette** | 23 strings in no store and no union, bridged by nine hardcoded `if`s inside the validator | **Map to the real terms, or delete** |
| **LegacyQuestion.type** | 7 declared, 4 emittable, 1 in use, plus an 11-entry alias map duplicated in two files | **Dies with `questions[]`** — assessments §17 |

> **[CRITICAL] Nothing here invalidates existing content.**
>
> One retirement, zero blocks behind it. Everything else is an addition or an alias. **The reconciliation is non-destructive by construction**, which is what makes it safe to do before the deploy and migration questions are settled — and why it belongs before, not after, the schema work in the assessments and equip artifacts.

> **[WARNING] What this does not solve.**
>
> The **third writer**. Five subtypes reached the data through a path that is not the editor's dropdown and not its fallback list (§05). Until that path is found, the catalog can be made true and go stale again the next time it runs. An `aliases[]` field limits the damage; it does not close the hole.

## 14 · Standing open
*no fixes applied*

- **Check-in is not using the Block system**, despite five of its six step types already existing as subtypes and the sixth being a two-option MCQ. Its builder imports neither Equip component, its steps never become an `Activity`, and its renderer is a separate six-case switch inside `MoodJournal.tsx`.
- **The two lists don't share a string format.** Underscores in the builder, hyphens in the catalog. Wiring them together needs a normalisation pass first.
- **Five vocabularies for one primitive** — block types, exercise subtypes, interaction types, `day-presets.ts`'s 23 palette names, and assessments' own 7-value question type union with its 11-entry alias map. Six if you count `TableColumn.type`.
- **The stored data uses names none of them declare.** `quiz` as a block type; `matrix`, `row_list`, `text_list`, `number` and `scale` as subtypes. All fall through to a default branch and render as whatever the fallback picks.
- **The `\\\|\\\| subtype`** clause in the resolver overrides type entirely. Any block carrying a subtype takes the subtype path no matter what its type says — which is why lessons render as questions and an undeclared `quiz` type works at all.
- **Carry-forward is used by zero of 406 blocks**, while Sleep Tight holds sixteen copy-pasted duplicate days — the exact problem it was built to solve.
- **Three of the catalog's types are decorative.** `interaction_type` and `day_config_type` are read only by a reference screen; `checkin_block_type` and `media_type` are read by nothing at all.
- **The allow-list guardrail is commented out.** Only the blocked list fires, and Workshop's is empty.
- **day_config_type carries an `onboarding` value with no code path.** Picking it in Meta Manager silently does nothing.
- **The `DayContent.dayType` TypeScript union still declares 7 types** against ten real presets. The presets are right; the union is stale.
- **ProgramCheckIn has no authoring surface at all** — four hardcoded questions, and a `customQuestions // (future)` field that was never built.
- **The `sleep` and `pain` scales are authored and unused.** No template asks for them, which is why those three fields are null on every journal entry.
- **A check-in day preset exists and nothing uses it.** The daily check-in runs off a template, not off a day.
- **Scales carry richer options than Blocks do** — value, severity, order, active flag per option, versus a plain string plus a parallel weight map. If the two merge, the Scale shape is the better target.

## 15 · Change brief
*hand this to the implementer*

> **[NOTE] How to read this section.**
>
> Everything above is survey. This is the work order derived from it, ordered by dependency. **Item 1 is a live user-visible defect, costs three lines, and depends on nothing** — start there. Items 3–11 are database writes and are batched deliberately so they run as one reviewed migration.

### Code — the render bug, first and alone

| # | Change | Where | Effect |
|---|---|---|---|
| 1 | **Add four cases to `resolveInteraction()`** — `matrix` → `input-table` beside `comparison-matrix`; `scale` → `rate` beside `rating-scale`; `row_list` and `text_list` → `check` beside `structured-list`. | lib/equip-admin-types.ts ~73 | **9 blocks stop rendering as textareas.** Two published programs. No data change |
| 2 | **Make the default case loud.** `console.warn` the subtype and block id before falling back. | lib/equip-admin-types.ts ~100 | The next undeclared term appears in a log instead of on a user's screen |
| 3 | **Restore the allow-list rejection** in `validateBlockForDayType()` — or delete `allowedBlocks` entirely. Today it is computed and thrown away, which makes the code look like it validates. | day-presets.ts | decision Enabling it will reject existing content. Audit first, then choose |
| 4 | **Give `useMetadata` an error state.** It returns empty buckets on a throw, so the editor silently offers its fallback vocabulary instead. | hooks/useMetadata.ts ~176 | An admin can author against the wrong term list and cannot tell |
| 5 | **Fix the stale `DayContent.dayType` union** — 7 declared against 10 real presets. | lib/equip-types.ts | The presets are right; the union is stale |
| 6 | **Run `npm run build` and merge `chore/centralise-block-naming`** (`0340aa21`). Renames only; not built here because `vite build` cannot run from the mounted filesystem. | local | Unblocks every later reference to the new names |

### Catalog — data only, non-destructive

| # | Change | Rows | Note |
|---|---|---|---|
| 7 | **Add `block_type · quiz`** | +1 | 12 blocks in all 4 programs already use it |
| 8 | **Add `exercise_subtype · number`** | +1 | 1 block |
| 9 | **Retire `block_type · sleep-diary`** | −1 | Zero blocks. It is an `exercise · input-table` |
| 10 | **Add an `aliases[]` field to the catalog term shape** and populate the 11 aliases in §13 | 11 | Backward compatible — absent means none. Lets the editor, the renderer and a migration read one list |
| 11 | **Delete the fallback arrays** at `BlockEditor.tsx` lines 38 and 53 | — | **Only after 7–10.** Until the catalog is true the fallback is load-bearing |

### Content — data only, and item 14 unlocks every chart

| # | Change | Rows | Note |
|---|---|---|---|
| 12 | **Set a real `dayType` on the 8 days typed `lesson`** | 8 | Restores `validateBlockForDayType()` on those days — it currently short-circuits |
| 13 | **Assign real day types across the 97 equip days** — `onboarding` for day 0, `tracker` for Sleep Tight 18–30, `reflection` where it applies | 97 | Nine of eleven declared day types have never been used, which is *why* day structure leaked into block types as 84 `conclude` blocks |
| 14 | **Add `exerciseConfig.key` to the 98 keyless input-tables** | 98 | **Prerequisite for any cross-day view.** `block_responses` is keyed by block id, so day 3's "hours slept" and day 17's are unrelated |
| 15 | **Set `exercise_subtype: clinical-instrument` on the 92 assessment items** | 92 | Makes "this is a clinical item" a data fact instead of a slug lookup in a code file |
| 16 | **Normalise the 12 undeclared subtype values** once aliases exist | 12 | Cosmetic if item 1 shipped — the aliases already resolve them |

### Structural — after everything above

| # | Change | Where | Note |
|---|---|---|---|
| 17 | **Persist `interaction` at authoring time.** `BlockEditor` writes it; the resolver stays only for rows without one | BlockEditor.tsx · BlockRenderer.tsx | Removes the default case from the live path. Already documented as the intent (§13) |
| 18 | **Backfill `interaction` on the 445 blocks without one**, using the corrected resolver | data | One-time. After this `resolveInteraction()` is dead code |
| 19 | **Move check-in onto Blocks.** Five of its six step types already exist as subtypes; the sixth is a two-option MCQ | AdminCheckinTemplateBuilder · MoodJournal | decision The biggest item here. Deletes a second builder and a second renderer |
| 20 | **Move the mood scale into `checkin_scale:mood`** and delete the hardcoded branch | scales-routes.ts · MoodJournal.tsx ~438 | Five scales, one resolver, no special case |
| 21 | **Give `ProgramCheckIn` an authoring surface**, or delete it | ProgramCheckIn.tsx | Four hardcoded questions, no store, a `customQuestions // (future)` that was never built — and it writes into `assessment_result:` |
| 22 | **Map or delete the 23-string day-presets palette** | day-presets.ts | Bridged to the real vocabulary by nine hardcoded `if`s. A mapping table or nothing |

> **[CRITICAL] One ordering constraint worth stating plainly.**
>
> **Item 1 before anything.** It is live, it is visible, and it is three lines. **Items 7–10 before item 11** — deleting the editor's fallback before the catalog is true swaps a wrong vocabulary for an empty one. **Item 12 before item 3** — restoring the allow-list while eight days still have an unrecognised type means those days skip validation anyway, so you would be enabling a guardrail that cannot reach the content most likely to fail it.

---

**Method.** Vocabulary counts, scale contents and the check-in template are read-only SQL against `kv_store_cc205da9` on 2026-09-02. Consumer claims are a grep for each destructured bucket name across `components/`, `hooks/` and `lib/` — not inferred from file names. Schema, resolver, presets and renderer read directly from `equip-admin-types.ts`, `day-presets.ts`, `BlockRenderer.tsx`, `AdminCheckinTemplateBuilder.tsx` and `MoodJournal.tsx` at `4423f72f`. No writes were made.

**The nine mis-rendering blocks (§07) were verified, not inferred.** After reading the default branch in `resolveInteraction()`, each affected block was checked for exactly the fields that branch tests: 0 of 8 `matrix` blocks carry `options` or an explicit `interaction`, and 8 of 8 carry `columns`.

**One earlier claim on this page is corrected.** It previously read "Every `scale_key` resolves" — the `mood` scale does not resolve through `getScaleByKey()`; it needs a hardcoded branch. And `BlockEditor` *does* read the catalog through `useMetadata`, with its hardcoded arrays as a load-time fallback only — so the five undeclared subtypes came from neither its dropdown nor its fallback, and a third writer has not been found.

**Two counts differ from earlier readings.** `metadata-catalog.md` records `interaction_type` as polluted with 6 mistyped rows, for 18 total; live it holds exactly 12, matching the code union — that contamination has been cleared. And the 2026-09-01 content map reports 223 blocks across the four programs; walking `daily_content[].activities[]` today returns **406** — Sleep Tight 155, Stress Buster 116, Unburn 111, Productivity Reset 24. I have not reconciled the two methods, so treat 406 as "what this query counts", not as a correction.
