# One primitive, three builders, five vocabularies

*Module 1 companion · block & builder architecture · live read 2026-09-02*

Everything a user reads, answers, rates or writes in this app is the same object — an `Activity`, called a Block in the admin. This is what that object is, who authors it, what draws it, which parts of the system are quietly refusing to use it — and, at the end, what 406 live blocks actually contain versus what the taxonomy says they may.

`db **jpfvoevxegnknxoqmwye** | branch **equip-carry-forward** @ **d2ac376c** | sources **block-architecture.md** · **builder-editor-architecture.md**`

A Scale is an ordered set of options with labels, emoji, values and severities. That is exactly what a Block's `exerciseConfig.options` is. Five of Check-in's six step types already map one-to-one onto existing block subtypes, and the sixth is a two-option MCQ. The only thing separating them is that they were built at different times and given different prefixes — **not** that they are different kinds of thing. Everything below is read with that as the frame.

## 01 · What a Block is: four tiers that resolve into each other
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

## 02 · Check-in scales, read as Blocks
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

Every `scale_key` resolves. `sleep` and `pain` are authored, clean, and used by no template — the daily check-in never asks for them, which is why `pain_level`, `pain_impact` and `sleep_quality` are null on every journal entry.

> **[CRITICAL] The string formats don't even agree with each other.**
>
> The builder's hardcoded list uses underscores — `emoji_scale`, `free_text`, `single_choice`, `yes_no`. The `checkin_block_type` records that mirror it use hyphens — `emoji-scale`, `free-text`, `single-choice`, `yes-no` — because the Metadata Catalog slugifies its own labels. Pointing one at the other needs a normalisation pass, not a one-line swap. And `context-tags` exists in the catalog as a seventh type while the builder treats it as a special case of `multi_select`.

## 03 · Three builders, one of which is real
*and two outliers*

The first pass at this concluded there were three independent builders, by checking whether each wizard calls the metadata hook itself. That test can't see one wizard *rendering another's component* — which is exactly what happens.

| Feature | What it actually renders | Taxonomy | Verdict |
|---|---|---|---|
| **Equip** | EquipDailyEditor + EquipBlockEditor | native — this *is* the shared system | the system |
| **Assessment** | the same EquipDailyEditor, imported directly, via a convertQuestionsToDay() adapter | same as Equip | correct reuse |
| **Check-in** | AdminCheckinTemplateBuilder — imports neither | own hardcoded 6-value array | the outlier |
| **Milestone check-in** | ProgramCheckIn.tsx — no builder at all | 4 hardcoded questions, no store | no authoring surface |

So the count isn't three builders — it is **one shared block editor, correctly reused by two of three features, and one that isn't using it.** Assessment reusing Equip's editor is the system working. Check-in not doing the same is the actual problem, and the honest answer to "will a fourth feature invent a fourth builder" is: only if it ignores what Assessment already demonstrates.

The pipeline runs further than the editor. `ProgramPlayer.tsx` is imported by every flow that plays a program back — the equip wizard, the program flow, onboarding, and `AssessmentFlow` — which confirms Assessment shares the chain end to end, not just at authoring time. Author → store → deliver → render is one system: **Builder is the whole chain, not the editing screen.**

> **[WARNING] ProgramCheckIn is more disconnected than the Check-in builder ever was.**
>
> Triggered on program day 7, 14, 30 or the last day by `equip.checkInConfig`, it asks four fully hardcoded questions — perceived change, confidence, continuation intent, feedback — with zero store involvement, zero Block or Scale reuse, and no admin surface whatsoever. Its own type carries a commented-out `customQuestions // (future)` field that was never built.
>
> An earlier version of the docs claimed `checkInConfig` links to `checkin_template:` through a `scale_key`. It does not. `checkInConfig` carries only `enabled · triggerDays · triggerOnLastDay · customTitle`, and `scale_key` appears nowhere but on template steps. The two systems share a name and nothing else — a third same-named thing that gets conflated with the other two every time someone says "check-in".

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
| block_type | 7 | EquipBlockEditor · EquipDailyEditor · AdminBlockTypeViewer | real |
| exercise_subtype | 11 | EquipBlockEditor · AdminBlockTypeViewer | real |
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

## 05 · Day presets, and the guardrail that doesn't run
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

## 07 · What else a Block carries
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

## 08 · Standing open
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

---

**Method.** Vocabulary counts, scale contents and the check-in template are read-only SQL against `kv_store_cc205da9` on 2026-09-02. Consumer claims are a grep for each destructured bucket name across `components/`, `hooks/` and `lib/` — not inferred from file names. Schema, resolver, presets and renderer read directly from `equip-admin-types.ts`, `day-presets.ts`, `BlockRenderer.tsx`, `AdminCheckinTemplateBuilder.tsx` and `MoodJournal.tsx` at `d2ac376c`. No writes were made.

**Two counts differ from earlier readings.** `metadata-catalog.md` records `interaction_type` as polluted with 6 mistyped rows, for 18 total; live it holds exactly 12, matching the code union — that contamination has been cleared. And the 2026-09-01 content map reports 223 blocks across the four programs; walking `daily_content[].activities[]` today returns **406** — Sleep Tight 155, Stress Buster 116, Unburn 111, Productivity Reset 24. I have not reconciled the two methods, so treat 406 as "what this query counts", not as a correction.
