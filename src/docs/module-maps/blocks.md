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
- **13** The block type, defined
- **14** The hierarchy
- **15** Creating something new — the flow
- **16** Stage presets — policy, not rendering
- **17** Standing open
- **18** Work plan — standardise & centralise

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

## 13 · The block type, defined
*proposal · two axes, not three*

> **[NOTE] A block is an **interaction** plus a **role**. Everything else is that interaction's config.**
>
> Today three fields try to say what a block is — `type`, `exerciseConfig.subtype`, `interaction` — and they overlap, so the resolver has to collapse two of them into the third at read time. The live data already shows they are not three axes: `multi-select` appears under **four** different types and `single-select` under **three**. Type does not constrain subtype and never has.

### What each field is actually doing

*The three current fields, sorted by what question they answer*

| Field | Answers | Live values | Verdict |
|---|---|---|---|
| type | **Two different questions at once** | exercise · checklist · journal shape — lesson · reflection · quiz · conclude purpose | Mixed. Split it |
| exerciseConfig.subtype | What shape is the answer? | mcq · single-select · multi-select · input-table · table · structured-list · rating-scale · comparison-matrix · clinical-instrument · upload · ephemeral-journal | Pure shape. **Duplicates interaction** |
| interaction | **What does the user do?** | read · watch · write · rate · select-one · select-many · check · input-table · track-table · clinical · upload · complete | **The primitive.** Already defined, already has labels, verbs and icons in `INTERACTION_META` |

**Subtype and interaction are the same axis at different resolutions.** Every subtype maps to exactly one interaction — that is what `resolveInteraction()` is. Keeping both means keeping a mapping function, and a mapping function needs a default case, and the default case is §07. Keep the finer one, drop the coarser.

**Type is two axes wearing one name.** `exercise`, `checklist` and `journal` describe the *shape* of the answer — which interaction already says, better. `lesson`, `reflection`, `quiz` and `conclude` describe *why the block is there* — which nothing else says, and which is genuinely useful.

### The definition

> **[NOTE] **
>
> ```
> Block {
>   id
>   interaction   // WHAT THE USER DOES — 12 values, from the catalog. Required.
>   role          // WHY IT IS HERE   — editorial. Optional; defaults from the stage preset.
>   prompt        // the question or the content
>   key           // WHERE THE ANSWER GOES — required for any interaction that produces one
>   scale_ref     // → catalog scale, for select-one / select-many / rate / clinical
>   config        // only the fields this interaction needs
>   position · required · duration · media_ref
> }
> ```

Two orthogonal axes instead of three overlapping ones, and every current oddity becomes legal and readable:

| Today, and why it looks wrong | Under this definition |
|---|---|
| lesson · multi-select — 6 blocks — "a lesson that asks a question" | role: lesson · interaction: select-many — a lesson that ends in a question. Legal, and now sayable |
| conclude — 84 blocks — a day-position concept as a block type | role: conclude · interaction: complete — its purpose is editorial; what the user does is acknowledge |
| quiz · scale — 1 block — both undeclared, renders as a textarea | role: quiz · interaction: rate + scale_ref — no resolution step, so nothing to get wrong |
| sleep-diary — declared as a type, 0 blocks | role: tracker · interaction: input-table — a content pattern, not a primitive |
| 92 assessment items as bare `exercise` | role: assessment · interaction: clinical + scale_ref — "this is a clinical item" becomes a data fact |

### The twelve interactions, and what each requires

This is the whole type system. `INTERACTION_META` already carries a label, verb, icon and description for all twelve — the vocabulary exists and is correct. What it lacks is a statement of what config each one needs, which is what makes an editor able to show only the right fields.

*interaction → required config → what the response looks like*

| Interaction | User | Requires | Optional | Response | Key needed? |
|---|---|---|---|---|---|
| **Passive — no response, completion only** | | | | | |
| **read** | reads | content | media_ref | — | no |
| **watch** | watches | media_ref | content | — | no |
| **complete** | acknowledges | content | — | — | no |
| **Scale-backed — the option set comes from the catalog, never inline** | | | | | |
| **select-one** | picks one | **scale_ref** | correct_option | option_id | **yes** |
| **select-many** | picks several | **scale_ref** | min · max | option_id[] | **yes** |
| **rate** | picks on a scale | **scale_ref** | display: emoji · slider · stars | option_id (carries value) | **yes** |
| **clinical** | answers a validated item | **scale_ref** · instrument_ref | reverse · section_ref | option_id | **yes** |
| **Structured — the block defines its own shape** | | | | | |
| **check** | ticks items | items[] | min_required | item_id[] | **yes** |
| **input-table** | fills a grid | columns[] · rows[] | allow_add_rows · column types | cell map | **yes** |
| **track-table** | ticks a grid | columns[] · rows[] | — | boolean map | **yes** |
| **write** | types | prompt | max_length · ephemeral | text | **yes** |
| **upload** | attaches a file | accepted_types | max_size | file_ref | **yes** |

> **[CRITICAL] Four interactions take a scale, and that one column is the largest single simplification available.**
>
> `select-one`, `select-many`, `rate` and `clinical` all need an ordered option set. Today: assessments inline the PHQ/GAD scale **27 separate times**, equip inlines its options per block, and check-in — alone — references `checkin_scale:*` by key. One `scale_ref` column collapses all three into the model check-in already uses. §14 and §16 build on it.

> **[WARNING] The `key` column is not optional, and it is the one thing missing everywhere.**
>
> Nine interactions produce a response. Every one of them needs a stable name for where that response goes — otherwise it is filed under a block id, and the same question on day 3 and day 17 becomes two unrelated facts. That is why 98 of Sleep Tight's input-tables cannot be charted, and why the 31-day sleep diary produces no diary.
>
> Check-in solved this: its steps carry `save_as`, which names a column on the journal entry (`mood_rating`, `energy`, `stress_level`). **Blocks should adopt `save_as`, not the reverse.** On the one thing that matters most for longitudinal data, the outlier is ahead of the system.

> **[WARNING] What this deletes.**
>
> **Six vocabularies become two:** `interaction` (12, closed, already correct) and `role` (editorial, open, catalog-backed).

## 14 · The hierarchy
*four levels · one shape for all three containers*

Equip has programs of days of blocks. Assessments have a flat question list. Check-in has a linear template of steps. **Those are the same structure at different depths**, and the reason there are three builders is that nobody ever wrote that down. This is the hierarchy that holds all three.

*[diagram]* **Four levels, and only the top two differ between features.** A collection is an equip program, an assessment instrument or a check-in template. A stage is a day, or the whole instrument, or the whole template. Steps and blocks are identical in all three. The scale sits outside the tree because it is shared — which is the point of it.

### The four levels

| Level | Is | Equip | Assessment | Check-in | Carries |
|---|---|---|---|---|---|
| **Collection** | The thing a user starts | a program | an instrument | a template | slug · title · category_id · published · **content_version** |
| **Stage** | One sitting | a day (×31) | the instrument (×1) | the template (×1) | position · **preset_id** · title · unlock rule |
| **Step** | One screen | a step group | a page of items | one question | position · nav policy from the preset |
| **Block** | One interaction | an activity | an item | a step body | interaction · role · **key** · config · **scale_ref** |
| **Scale** | A shared option set | referenced by any block whose interaction needs one — **outside the tree, in the catalog** | options: id · label · emoji · **value** · severity · order | — | — |

> **[CRITICAL] Step is the level that is already there and has never been named.**
>
> `stepGroup` exists on 27 blocks today and is governed per-day by the preset's `stepGroupRules` — and that enforcement is **real**, one of the few guardrails in this module that actually runs: the editor hides the field when a preset disallows it. It is a level of the hierarchy expressed as an optional string on a leaf.
>
> Promoting it to a real level is what lets check-in's linear template be the same structure as an equip day. A check-in is five steps of one block each; an equip workshop day is three steps of up to three blocks each. **Same tree, different preset.**

> **[WARNING] What the hierarchy makes visible that the current model hides.**

> **[NOTE] Where the four current storage models land.**

## 15 · Creating something new — the flow
*one flow · three entry points*

This is the answer to "why four builders". **There is one flow.** What differs between an equip program, an assessment and a check-in is three fields set at the top of it, and everything below those three fields is identical.

*[diagram]* **Steps 1–3 are the container; steps 4–5 are the block.** Only the entry row differs between features, and it differs in three fields: how many stages, which preset, and where answers go. Everything from step 1 down is the same screen, the same editor and the same storage.

### Creating a block — the flow that matters

*Step by step, with what changes from today*

| # | Author does | System does | Today |
|---|---|---|---|
| 1 | **Picks an interaction** — one list of 12, each with its verb and icon from `INTERACTION_META`: "Reads", "Selects", "Rates", "Tracks"… | Filters the list to what the stage preset allows | Picks a **type**, then a **subtype** — two lists, overlapping, and neither is what the renderer reads |
| 2 | Writes the prompt or content | — | same |
| 3 | **If the interaction is scale-backed: picks a scale from the catalog.** Or creates one, in the catalog, from here | Renders a live preview of the options with their values | **Types the options into the block.** This is why the PHQ/GAD scale exists 27 times |
| 4 | **Sets the response key.** Pre-filled from the prompt; editable | Checks it is unique within the collection | **Does not exist.** Answers file under block id — 98 input-tables have no key |
| 5 | Fills only the config this interaction needs — columns for a table, items for a checklist, accepted types for an upload | Shows nothing else | One `exerciseConfig` with 20 optional fields, most irrelevant to any given block |
| 6 | Optionally sets a **role** — lesson, practice, reflection, quiz, conclude | Defaults it from the stage preset | Conflated into `type` |
| 7 | Saves | **Validates against the preset and rejects loudly.** Writes `interaction` to the record | Validation returns `allowed: true` always — the rejecting line is commented out. Nothing writes `interaction` |

> **[CRITICAL] Steps 3, 4 and 7 do not exist today, and they are the three that matter.**
>
> **3 · scale by reference** ends the duplication — 27 copies of one scale in assessments, per-block options in equip. **4 · the response key** is what makes a 31-day sleep diary produce a diary instead of 98 unrelated answers. **7 · loud validation** is what stops the next undeclared value reaching production silently. Steps 1, 2, 5 and 6 are refinements of what the editor already does well.

### Creating a check-in, in full

Worth walking because it is the feature that has its own 1,290-line builder today, and under this flow it needs no code of its own at all.

| Author does | Produces |
|---|---|
| New collection · kind: check-in · answers → journal | 1 collection |
| One stage, preset `check-in` — which sets linear nav, one block per step, autoAdvance, save on exit | 1 stage |
| Step 1 · interaction **rate** · scale `mood` · key `mood_rating` · required | 1 step, 1 block |
| Step 2 · interaction **rate** · scale `energy` · key `energy` | 1 step, 1 block |
| Step 3 · interaction **rate** · scale `stress` · key `stress_level` | 1 step, 1 block |
| Step 4 · interaction **write** · key `freehand_text_content` | 1 step, 1 block |
| Step 5 · interaction **select-many** · scale `context_tags` · key `context_tags` | 1 step, 1 block |

That is the live template, reproduced exactly, using **three of the twelve interactions** and no new concepts. Its six step types map with nothing left over:

| Check-in step type | Interaction | Scale | Notes |
|---|---|---|---|
| emoji_scale | rate | from the catalog | display: emoji |
| slider | rate | from the catalog | display: slider — same interaction, different chrome |
| single_choice | select-one | from the catalog | — |
| multi_select | select-many | from the catalog | — |
| free_text | write | — | ephemeral flag if it should not persist |
| yes_no | select-one | a 2-option catalog scale | the only one that needs a scale created |

> **[NOTE] Check-in keeps its container editor. It loses its step editor and its scale editor.**
>
> A linear five-question flow is a genuinely different *container* from a 31-day program, and forcing it into a day grid would be a worse product. That part of `AdminCheckinTemplateBuilder` is right and should survive as a thin container editor.
>
> What should not survive is the other two-thirds: a second block editor with its own six-value type list, and a second scale creator (`createCustomScale`). Those are the parallel implementations. **1,290 lines today; a container editor over the shared block editor is a few hundred.**

> **[WARNING] And the honest counter-argument, stated once.**
>
> Check-in is not simply behind the block system. It is **ahead of it on two things**: `save_as` gives every answer a stable name, and `checkin_scale` options carry `value`, `severity`, `order` and `is_active` where a block's options are plain strings with weights in a parallel map.
>
> So the merge is not "absorb the outlier". It is **adopt the outlier's two good ideas, then delete its duplicated third**. If it were done the other way — check-in reshaped to today's block model — the product would lose its only working answer-key mechanism.

## 16 · Stage presets — policy, not rendering
*10 presets · what they should decide*

You asked whether presets are rendered. **They should not be.** A block renders the same way on a tracker day and a learning day — an input-table is an input-table. What a preset decides is **how the player behaves around the blocks**: what may be placed, how many fit on a screen, whether you can go back, and when the answer is saved. Policy, not rendering. Keeping that line clean is what makes one renderer able to serve every stage in the product.

*What a preset governs, and what it must not*

| — | Decides | Read by | Enforced today? |
|---|---|---|---|
| **Composition** | Which interactions may be placed on this stage | the editor, at author time | no — the rejecting line is commented out |
| **Grouping** | How many blocks fit in one step; whether steps are allowed at all | the editor | yes — the editor hides the field when disallowed |
| **Navigation** | autoAdvance · back-navigation · progress display | the player | partial — defaults only |
| **Persistence** | Save on toggle · on exit · on completion | the player | partial |
| **Rendering** | — **nothing.** A block looks the same on every stage | — | correctly not enforced |

### The ten presets, restated against interactions

The presets themselves are good — they were carefully designed and they describe real content shapes. The problem is that they speak a **23-string vocabulary that exists in no store and no type union**, bridged to the real names by nine hardcoded `if` statements inside the validator. Restated against the 12 interactions, they need no bridge.

*Preset → allowed interactions · nav · save · steps*

| Preset | For | Allows | Nav | Save | Steps |
|---|---|---|---|---|---|
| **onboarding** | Day 0 of every program | read · select-one · select-many · write | forward | on completion | 1 block |
| **learning** | Concept introduction — **93 of 97 days today** | read · watch · complete · select-one | free | on completion | 1 per lesson |
| **practice** | Applying a technique | write · input-table · check · select-many | free | on exit | free, ≤3 |
| **tracker** | Daily repetition — **Sleep Tight 18–30 should be this** | track-table · input-table · check · rate | free | **on toggle** | none |
| **reflection** | Closure — **half of Productivity Reset** | write · rate · select-one | free | on exit | none |
| **workshop** | Multi-step thinking | input-table · write · select-many · read | free | on exit | required, ≤3 |
| **quiz** | Knowledge check | select-one · select-many · rate | forward only | on completion | 1 block |
| **check-in** | The daily check-in — **and it already exists** | rate · select-one · select-many · write | forward, autoAdvance | on exit | 1 block |
| **assessment** | Scored instrument | **clinical** · select-one | forward, no back | on completion | 1 block |
| **assessment-lite** | Unscored self-reflection | select-one · rate · write | free | on completion | ≤2 |
| **rest** | No active task | read · complete | free | — | none |

> **[NOTE] A `check-in` preset already exists, fully specified, and nothing uses it.**
>
> It is in `DAY_TYPE_PRESETS` today with its own defaults, rules and blocked list — "quick daily mood check, 1–3 questions, autoAdvance, save on exit, one block per step". That is the daily check-in, described exactly. The Mood Journal runs off `checkin_template:` instead and has never touched it.
>
> **This is the strongest single piece of evidence that check-in content was always meant to be blocks on a stage.** Someone specified the preset for it and the feature was built beside it.

> **[CRITICAL] Nine of eleven presets have never been assigned, and that is why structure leaked into block types.**
>
> Live: `learning` on 93 days, `assessment` on 3, and `lesson` — a block type — on 8. `tracker`, `reflection`, `practice`, `rest`, `check-in`, `quiz`, `workshop`, `onboarding` and `assessment-lite`: zero.
>
> So the day-level vocabulary is complete and correct and unused, and meanwhile **84 blocks are typed `conclude`** — a day-position concept expressed at block level because the stage level was never used. The leak runs both ways at once, and §13's role field plus a real preset assignment closes both directions.

> **[WARNING] Turning composition enforcement back on will reject existing content. That is the decision, not the code.**
>
> `validateBlockForDayType()` computes `isAllowed` and discards it; only the blocked-list check fires, and Workshop's blocked list is empty so Workshop accepts anything. Restoring the rejection is one uncommented line — and the moment it runs, content that has been authored against no constraint for months starts failing.
>
> Order matters here: **assign real presets to the 97 days first** (§18 items), *then* audit what the allow-lists would reject, *then* enable. Enabling first, against 93 days all typed `learning` and 8 typed with a block type, would reject correct content and permit the eight days that skip validation entirely.

> **[WARNING] Where presets live.**
>
> Today: a 380-line TypeScript file, with a `day_config_type` catalog vocabulary beside it that is read only by a reference screen. Under this model a preset is **a catalog term plus four policy columns** — allowed interactions, nav, save, step rule — which makes it editable, visible in a query, and impossible to drift from the vocabulary that names it. The 23-string palette disappears with the file.

## 17 · Standing open
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

## 18 · Work plan — standardise and centralise
*7 phases · strangler, not rewrite*

> **[NOTE] The shape of this plan, and why it is shaped that way.**
>
> Every defect in §01–§12 reduces to one sentence: **a block's identity is derived at read time from fields that overlap, from vocabularies that disagree, inside a hierarchy that was never written down.** Fixing that incrementally deadlocks — validation waits on presets, presets wait on the vocabulary, the vocabulary waits on a writer that has not been found.
>
> So this is a **strangler**: build the new model alongside the old, migrate one collection at a time, delete nothing until its replacement is serving. It works here because the seam already exists in the code — `resolveInteraction()` opens with `if (activity.interaction) return activity.interaction`, so **a block written in the new shape is already understood by today's player.** No big-bang cutover is required.
>
> Phases are ordered by dependency, not by value. Each ends somewhere you could stop.

### Already landed — not in the plan

| Commit | What |
|---|---|
| 0340aa21 | **Naming and folders.** `BlockEditor`, `DayEditor`, `page-blocks/`, `SectionReportCard` moved to `player/`. Merged to `equip-carry-forward` and pushed |
| f06daef1 | **A `typecheck` script.** 216 pre-existing errors; 12 module-resolution errors, none from the rename |
| 16f8aefd | **The nine mis-rendering blocks.** Four resolver cases plus a warn on the default. §07's defect is closed in code |

### Does not wait for any of this

These are live defects with no dependency on the content model. Parking them behind a 2.0 is the most common way a 2.0 kills a product.

| Defect | Where | Why now |
|---|---|---|
| The wellness score inverts General | ikan-score-routes.ts | 19 of General's 24 items are higher-is-better, read as distress, inside 40% of the composite |
| `max_score` resolved four different ways | 4 files | It is the denominator that picks a severity, which picks a recommended program |
| Erasure, export, crisis support | server + safety | Compliance and safety. Unrelated to blocks entirely |
| Balance's landing copy reads `"auti fill "`; tile paste artefacts on all 7 | data | Live on public pages. 10 minutes |

### Phase 0 · Ground truth

**Nothing changes for a user. This is the phase that makes the rest safe, and it is the one most likely to be skipped.**

| # | Do | Why | Blocked by |
|---|---|---|---|
| 0.1 | **Build the fixture set.** One collection of each kind; **every one of the 12 interactions authored exactly once**; a rendered snapshot of each | There is **no test file, no test dependency and no CI** in this repo. "Migrate post testing" currently means "post looking at it". This is the safety net and it doubles as the spec — if all 12 render from fixtures, the model is right | — |
| 0.2 | **Find the third writer.** `matrix`, `scale`, `number`, `row_list`, `text_list` are in neither the editor's catalog dropdown nor its fallback array | Until it is found, the catalog can be made true and go stale again the next time that path runs. **Everything in Phase 1 is provisional without this** | — |
| 0.3 | **Survey the engines.** Scoring, rule, recommendation, wellness score — module 6, unsurveyed | They consume the content model, so this plan changes them. It is the only part whose size I cannot currently estimate | — |
| 0.4 | Run `npm run build` once and record the baseline error count | 216 typecheck errors exist. Without a baseline, nobody can tell whether a later change added one | — |

### Phase 1 · Make the catalog able to say what it means

The reason `interaction_type` and `day_config_type` are decorative is not neglect — **a catalog term is slug / name / icon, and neither of those vocabularies is a label. They are rules.** So the rules went into code and the rows became names for things defined elsewhere. This phase gives them somewhere to live.

| # | Do | Detail | Reversible |
|---|---|---|---|
| 1.1 | **Split the term model into four kinds** | **catalog_term** — identity: slug · name · icon · position · active · **aliases[]** — **scale_option** — + value · severity · emoji — **interaction_spec** — + requires_scale · produces · config_fields — **stage_preset** — + allowed_interactions[] · nav · save · step_rule | additive |
| 1.2 | **Reconcile the two block vocabularies** | ADD `block_type · quiz` (12 blocks use it) · ADD `exercise_subtype · number` · RETIRE `block_type · sleep-diary` (0 blocks — it is an `exercise · input-table`) | one retirement, empty |
| 1.3 | **Move the 11 aliases out of the switch statement** into `aliases[]` | matrix · comparison_matrix → comparison-matrix · scale · rating_scale · likert → rating-scale · row_list · text_list → structured-list · clinical_instrument → clinical-instrument · emoji_scale · free_text · multi_select → their kebab forms | yes |
| 1.4 | **Move `INTERACTION_META` into `interaction_spec` rows** | 12 rows. The labels, verbs and icons already exist and are correct — this adds what each interaction *requires* and *produces* (§13), which is what lets an editor show only the right fields | yes |
| 1.5 | **Move `DAY_TYPE_PRESETS` into `stage_preset` rows** | 11 rows, restated against interactions (§16). **Do not enable enforcement yet** — that is Phase 6 | yes |
| 1.6 | **Delete the editor's fallback arrays** (`BlockEditor.tsx` 38, 53) and give `useMetadata` an error state | Today a metadata failure silently offers a *different* vocabulary and the admin cannot tell. **Only safe after 1.2 — until the catalog is true the fallback is load-bearing** | after 1.2 |

**Phase 1 ends with:** the catalog able to express a rule, six vocabularies reconciled to two, and every alias in one readable place instead of a switch. Nothing has migrated and no user-visible behaviour has changed.

### Phase 2 · Make the block say what it is

The core change, and the one the seam was built for.

| # | Do | Detail | Risk |
|---|---|---|---|
| 2.1 | **Persist `interaction` at authoring time** | The editor writes one choice from 12 instead of type-then-subtype. The player already prefers it — 53 blocks prove the path works | low — additive field |
| 2.2 | **Backfill `interaction` on the 445 blocks without one** | Using the corrected resolver. Verify against the fixture snapshots from 0.1 — **this is what 0.1 exists for** | medium |
| 2.3 | **Add `role`** — the editorial half of `type` | lesson · practice · reflection · quiz · conclude · tracker · assessment. Defaults from the stage preset. Frees `type` to be deleted | low |
| 2.4 | **Add `key`, required for the 9 response-producing interactions** | **Backfill the 98 keyless input-tables first.** Without it, day 3's "hours slept" and day 17's are unrelated facts — which is why a 31-day sleep diary produces no diary | content work |
| 2.5 | **Move every option set into the catalog and reference it by `scale_ref`** | 12 assessment scales (one of them inlined **27 times**), 5 check-in scales, equip's per-block options. Adopt the **check-in shape** — options carrying value, severity, order, is_active — not the block shape | the largest single win |
| 2.6 | **Retire `subtype` and `resolveInteraction()`** | Only once 2.2 is complete and verified. The default case goes with it, and with it §07's whole class of defect | one-way |

**Phase 2 ends with:** a block that states its own identity, every answer with a stable name, and every option set stored once. **If you stopped here, the module would already be sound.**

### Phase 3 · The hierarchy

| # | Do | Detail | Risk |
|---|---|---|---|
| 3.1 | **Create collection / stage / step / block** alongside the existing store | Nothing deleted. §14 | additive |
| 3.2 | **Promote `stepGroup` to a real Step level** | It is already this — an optional string on a leaf, governed by preset rules that genuinely run. Promoting it is what lets a linear check-in and a workshop day be one structure | low |
| 3.3 | **Make `position` required** | 160 of 406 blocks have no `order` and are sequenced by array index — stable until the editor rewrites the blob, which it does on every save | low |
| 3.4 | **Migrate Productivity Reset first** | 24 blocks, unpublished, and it is the clean control sample — the only program whose day and block counts match the frozen copy exactly, because it was never edited after creation | zero user impact |
| 3.5 | Then Stress Buster, Unburn, Sleep Tight — one at a time, verified against fixtures between each | Sleep Tight last: 155 blocks, the most content and the most duplication | per-collection |
| 3.6 | **Migrate assessments — and delete `questions[]` and `convertQuestionsToDay()`** | An assessment becomes 1 collection, 1 stage, N steps. The converter exists solely to manufacture a stage that should be one row. **This kills the largest single source of data damage in the product** | touches scoring — needs 0.3 |

### Phase 4 · The three mechanisms

> **[CRITICAL] You already have templating. The data shows it did the wrong job.**
>
> `DayEditor.tsx:429` `handleDuplicateDay` copies a day, titles it `"(Copy)"`, and at line 438 **mints new block ids**. Live, six clusters — **22 days, 16 of them duplicates** — every one renamed from "(Copy)" to **"(Continued)"**, and every one a **consecutive run**: Sleep Tight 2–7 and 20–25 and 27–29, Stress Buster 13–14 and 18–20, Unburn 5–6.
>
> Consecutive runs named "Continued" are not sloppy copy-paste. They are *"this activity repeats daily for a week"* — which is `ActivityRepeat`'s exact purpose, and `ActivityRepeat` is used by **0 of 406 blocks**. The product shipped the wrong affordance prominently and the right one invisibly, and a user filling the sleep diary on days 20–25 produces six unrelated response sets.

*Three mechanisms, not interchangeable — and the plan is to make each reachable, not to add one*

| Mechanism | Relationship | Ids | Use when | Today |
|---|---|---|---|---|
| **Reference** — scale | one record, many blocks | shared | the options must stay identical everywhere | check-in only |
| **Repeat** — carry-forward | one block, many stages | **one id, one response thread** | a tracker recurring across days | built · 0 uses |
| **Template** — save & stamp | copy, then diverges | **new ids** | a starting point you will edit | exists as Duplicate Day |

| # | Do | Detail |
|---|---|---|
| 4.1 | **Make the editor offer both, named for what they do** | "Repeat this day" → carry-forward, same ids. "Duplicate as a copy" → new ids. Today only the second exists and it is labelled just "Duplicate" |
| 4.2 | **Convert the 16 duplicated days to carry-forward** | Six clusters. Response threads become continuous, which is what the authors were reaching for when they typed "(Continued)" |
| 4.3 | **Fix Sleep Tight 18–30** | Thirteen days render *"Show all activities from day 17 and 18 and get the user to tick them off"* — a brief to a developer, shipped as an input-table column header. It describes carry-forward. Implement it, delete the string |
| 4.4 | **Save-as-template at every level** | Collection, stage, step, block. One mechanism, four entry points — cheap once the hierarchy in Phase 3 exists |

### Phase 5 · Collapse the builders

| # | Do | Detail |
|---|---|---|
| 5.1 | **Check-in keeps its container editor, loses its step editor and its scale editor** | A linear five-question flow is a genuinely different *container* and forcing it into a day grid would be a worse product. But its six step types are **three interactions** (§15), and `createCustomScale` is a second scale model. **1,290 lines today → a few hundred** |
| 5.2 | **Move the mood scale into the catalog** | It lives under `mood:{id}` and needs a hardcoded branch at `MoodJournal.tsx:438`. Four scales go through one resolver; the fifth — the required, primary one — needs a string comparison against a literal |
| 5.3 | **ProgramCheckIn: give it an authoring surface, or delete it** | decision 345 lines, four questions hardcoded in JSX, no store, a `customQuestions // (future)` never built — and it writes into `assessment_result:` with a synthetic id and score 0. Those are the 25 rows polluting every assessment query. `checkInConfig` is `enabled: false` on the two programs that have it and absent on the other two, **so it should not be reachable and 25 rows exist** |

### Phase 6 · Turn the guardrails on

**Last, and the ordering here is the trap.** Enabling composition enforcement before presets are assigned rejects correct content while the eight mistyped days skip validation entirely.

| # | Do | Detail |
|---|---|---|
| 6.1 | **Set a real `dayType` on the 8 days typed `lesson`** | A block type used as a day type. `validateBlockForDayType()` finds no preset and returns `allowed: true` immediately, so those days skip even the blocked-list check |
| 6.2 | **Assign real presets across all 97 equip days** | `onboarding` for day 0, `tracker` for Sleep Tight 18–30, `reflection` where it applies. **Nine of eleven presets have never been used** — which is why 84 blocks are typed `conclude`, day structure leaking into block types |
| 6.3 | **Audit what the allow-lists would reject**, then decide per preset | Dry run first. Workshop's blocked list is empty, so Workshop currently accepts anything |
| 6.4 | **Uncomment the rejection** | One line. decision — it will start rejecting content authored against no constraint for months |
| 6.5 | **Delete the 23-string palette and the stale `dayType` union** | The palette is bridged to real names by nine hardcoded `if`s inside the validator. The union declares 7 day types against 11 real presets |

### What this deletes, in total

- **Vocabularies: 6 → 2** — `interaction` and `role`. The other four go
- **Storage models: 4 → 1** — one hierarchy, three containers over it
- **Block editors: 2 → 1** — ~900 lines out of the check-in builder
- **Scale models: 3 → 1** — 27 inline copies become one row

Also gone: `resolveInteraction()` and its default case · the `\\|\\| subtype` clause that overrules type on 21 blocks · `convertQuestionsToDay()` and the `daily_content` mirror · `LegacyQuestion.type` and its 11-entry alias map duplicated in two files · the `day-presets.ts` palette · check-in's six-value step array and `createCustomScale` · the hardcoded mood-scale branch.

> **[CRITICAL] Two constraints worth stating once.**
>
> **Phase 0 is not optional.** There is no test infrastructure in this repo at all — no test files, no test dependencies, no CI. Every later phase verifies against fixtures that do not exist yet. Skipping 0.1 makes 2.2 and 3.4 unverifiable, and those are the two migrations that touch real content.
>
> **Do not freeze 1.0 while this runs.** Twelve commits landed on this branch in a single day — security, compliance, accessibility, and §07's fix. Those are real, and the [does-not-wait](#nowait) list above is real. A 2.0 that stops them is worse than no 2.0.

> **[NOTE] The stopping points.**
>
> After **Phase 0** you have a spec and a safety net and have changed nothing. After **Phase 2** the module is sound — identity stated, keys stable, scales shared — with the old hierarchy still in place. After **Phase 3** the four storage models are one. Phases 4–6 are quality-of-life and enforcement, and each is independently deferrable.
>
> The decision point is after **3.4**, one migrated collection. At that point the cost is measured rather than estimated, and it is roughly a week in.

---

**Method.** Vocabulary counts, scale contents and the check-in template are read-only SQL against `kv_store_cc205da9` on 2026-09-02. Consumer claims are a grep for each destructured bucket name across `components/`, `hooks/` and `lib/` — not inferred from file names. Schema, resolver, presets and renderer read directly from `equip-admin-types.ts`, `day-presets.ts`, `BlockRenderer.tsx`, `AdminCheckinTemplateBuilder.tsx` and `MoodJournal.tsx` at `4423f72f`. No writes were made.

**The nine mis-rendering blocks (§07) were verified, not inferred.** After reading the default branch in `resolveInteraction()`, each affected block was checked for exactly the fields that branch tests: 0 of 8 `matrix` blocks carry `options` or an explicit `interaction`, and 8 of 8 carry `columns`.

**One earlier claim on this page is corrected.** It previously read "Every `scale_key` resolves" — the `mood` scale does not resolve through `getScaleByKey()`; it needs a hardcoded branch. And `BlockEditor` *does* read the catalog through `useMetadata`, with its hardcoded arrays as a load-time fallback only — so the five undeclared subtypes came from neither its dropdown nor its fallback, and a third writer has not been found.

**Two counts differ from earlier readings.** `metadata-catalog.md` records `interaction_type` as polluted with 6 mistyped rows, for 18 total; live it holds exactly 12, matching the code union — that contamination has been cleared. And the 2026-09-01 content map reports 223 blocks across the four programs; walking `daily_content[].activities[]` today returns **406** — Sleep Tight 155, Stress Buster 116, Unburn 111, Productivity Reset 24. I have not reconciled the two methods, so treat 406 as "what this query counts", not as a correction.
