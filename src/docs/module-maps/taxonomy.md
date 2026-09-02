# One primitive, four vocabularies, and a table that renders as a textarea

*Cross-module · standardisation pass · live database 2026-09-02*

Every content item in this product — an assessment question, an equip exercise, a mood check-in step — is the same object. Four separate vocabularies describe it, none of them agrees with the others, and the disagreement is not cosmetic: eight authored tables are rendering as free-text boxes right now because a subtype nobody declared falls through a switch statement to its default case. This is the reconciliation, term by term, with the exact edit list.

`db **jpfvoevxegnknxoqmwye** | branch **equip-carry-forward** @ **4423f72f** | 21 vocabularies · **498 live blocks** | read-only · **no writes made**`

Three of the six block-related vocabularies diverge from live content **in both directions at once** — terms in use that the catalog does not declare, and terms declared that nothing has ever used. One vocabulary is declared, complete, and carried by zero of 406 equip blocks. One is declared with eleven terms and one is in use. Everything below is a comparison of two lists that have never been put side by side.

## Contents

- **01** The four vocabularies that describe one thing
- **02** block_type — reconciled
- **03** exercise_subtype — and the render bug
- **04** interaction_type — the tier nobody writes
- **05** day_config_type — 11 declared, 1 used
- **06** Check-in scales — the model that works
- **07** The proposal — one vocabulary
- **08** The edit list
- **09** Sequencing

## 01 · The four vocabularies that describe one thing
*21 catalog types · 6 relevant*

The metadata catalog holds **21 vocabularies** under a single `category:` prefix — one editor, one hook, one shape. That is the best-designed system in this codebase and the only one with a single representation of itself. The problem is not the catalog. It is that six of its vocabularies describe the block primitive, and the block primitive is written by four different code paths that each know about a different subset.

- **Catalog vocabularies: 21** — one prefix, one editor
- **Describing a block: 6** — type · subtype · interaction · day type · check-in type · scoring method
- **Live content blocks: 498** — 406 equip · 92 assessment
- **Vocabularies that match the data: 2** — of the 6

*Every vocabulary that touches a block, against 498 live blocks and 97 days*

| Vocabulary | Declared | In use | Used but undeclared | Declared but unused | Verdict |
|---|---|---|---|---|---|
| **block_type** | 7 | 7 | 1 — `quiz` | 1 — `sleep-diary` | diverges both ways |
| **exercise_subtype** | 11 | 11 | **5** | **5** | diverges both ways · **causes a render bug** |
| **interaction_type** | 12 | **1** | 0 | 11 | written on 53 of 498 blocks |
| **day_config_type** | 11 | 3 | 1 — `lesson`, a *block* type | **9** | effectively unused |
| **checkin_block_type** | 7 | 3 | 3 — casing only | 4 | kebab declared, snake_case stored |
| **scoring_method** | 4 | 2 | 0 | 2 | clean |
| **For contrast — the two vocabularies set from a catalog-backed dropdown** | | | | | |
| category | 19 | 11 | 0 | 8 | zero strays |
| difficulty_level | 3 | 2 | 0 | 1 | zero strays |

> **[CRITICAL] A block's identity is written by four code paths and each knows a different vocabulary.**
>
> The naming of the five undeclared subtypes is the giveaway: `row_list` and `text_list` are snake_case where every catalog term is kebab-case. **They were typed into a field, not chosen from a list** — and they did not come from the editor, because the editor's own fallback list does not contain them either.

## 02 · block_type — reconciled
*498 blocks*

*Catalog term against live usage, both modules*

| Term | Declared | Equip | Assessments | Total | Action |
|---|---|---|---|---|---|
| **exercise** | yes | 143 | 92 | 235 | keep |
| **lesson** | yes | 131 | 0 | 131 | keep |
| **conclude** | yes | 84 | 0 | 84 | keep — but see §05, it is doing a day's job |
| **reflection** | yes | 25 | 0 | 25 | keep |
| **quiz** | NO | 12 | 0 | 12 | **ADD to catalog** — 4 programs use it |
| **checklist** | yes | 8 | 0 | 8 | keep |
| **journal** | yes | 3 | 0 | 3 | keep |
| **sleep-diary** | yes | 0 | 0 | 0 | **RETIRE** — it is an `exercise · input-table`, not a type |

> **[WARNING] `sleep-diary` is a content pattern that got promoted to a type.**
>
> It describes exactly what Sleep Tight's 126 `exercise · input-table` blocks are. Declaring it as a block type puts a specific program's content into the product's primitive vocabulary — the same category error as `conclude`, which is a day-position concept, and `lesson`, which is being used as a day type on four days. Retire it and let subtype carry the meaning.

> **[CRITICAL] Assessments use exactly one of the seven block types.**
>
> All 92 assessment items are `exercise`. Every distinction that matters to an assessment — is it a GAD-7 item, is it scored, which scale does it use — is carried in `exerciseConfig`, not in the type. This is worth stating because it means **block_type is an equip vocabulary that assessments happen to touch**, and a shared vocabulary that only one module varies is a vocabulary that has not yet been designed for sharing.

## 03 · exercise_subtype — and the render bug
*the one that costs users something*

*11 declared, 11 in use, and only 6 in both lists*

| Term | Declared | Equip | Assessments | resolveInteraction() → | Action |
|---|---|---|---|---|---|
| **In both lists — 6 terms, 336 blocks** | | | | | |
| input-table | yes | 127 | 0 | input-table | keep |
| mcq | yes | 3 | 53 | select-one | keep |
| single-select | yes | 15 | 39 | select-one | keep |
| multi-select | yes | 17 | 0 | select-many | keep |
| comparison-matrix | yes | 9 | 0 | input-table | keep |
| structured-list | yes | 4 | 0 | check | keep |
| **In use, never declared — 5 terms, 12 blocks, all falling through to the default case** | | | | | |
| **matrix** | NO | 8 | 0 | **write** wrong | **ALIAS → comparison-matrix** |
| **scale** | NO | 1 | 0 | **write** wrong | **ALIAS → rating-scale** |
| **number** | NO | 1 | 0 | write | ADD, or alias → a real numeric subtype |
| **row_list** | NO | 1 | 0 | write | **ALIAS → structured-list** |
| **text_list** | NO | 1 | 0 | write | **ALIAS → structured-list** |
| **Declared, never used — 5 terms, and all five are in the editor's fallback list** | | | | | |
| table | yes | 0 | 0 | track-table | keep — the only route to `track-table` |
| rating-scale | yes | 0 | 0 | rate | keep — `scale` should alias to it |
| clinical-instrument | yes | 0 | 0 | clinical | **keep and start using** — all 92 assessment items are this |
| upload | yes | 0 | 0 | upload | keep |
| ephemeral-journal | yes | 0 | 0 | write / select-one | keep |

> **[CRITICAL] Eight authored tables are rendering as free-text boxes. Verified, not inferred.**
>
> `resolveInteraction()` in `equip-admin-types.ts` switches on `exerciseConfig.subtype`. `matrix` matches no case, so it reaches:
>
> ```
> default:
>   // Exercise with options but no subtype → select-one
>   if (exerciseConfig?.options && exerciseConfig.options.length > 0) return 'select-one';
>   return 'write';
> ```
>
> Live data for all 8 `matrix` blocks — 4 on `lesson`, 4 on `reflection`, across 2 programs:
>
> The same path catches the one `quiz · scale` block, which should be `rate` and renders as a textarea instead. **Nine blocks, two programs, live.** Nothing logs it, because the default case is a legitimate branch — this is the module's silent-fallback pattern producing a visible defect rather than a hidden one.
>
> **The fix is three lines in a switch statement**, and it is the single highest-value change in this entire standardisation pass.

> **[WARNING] The alias problem is already acknowledged in the code and half-solved.**
>
> `resolveInteraction()` already accepts snake_case aliases for three terms — `comparison_matrix`, `rating_scale`, `clinical_instrument` — plus `likert`, which appears in no vocabulary at all. So a previous author hit exactly this problem and solved it by adding cases. That is a **fifth** vocabulary, living in a switch statement, and it is the one the renderer actually obeys.
>
> Adding `matrix`, `scale`, `row_list` and `text_list` as cases fixes today. Making the catalog carry an `aliases[]` field fixes the pattern.

> **[NOTE] `clinical-instrument` is declared, unused, and describes 92 blocks exactly.**
>
> Every assessment item is a clinical instrument item, and every one is stored as a bare `exercise` with `mcq` or `single-select`. The term exists, maps to a dedicated `clinical` interaction, and has never been applied. Using it would let the renderer, the scoring engine and any future export distinguish a GAD-7 item from a program worksheet **from the data alone** — which is precisely the distinction the assessments module currently reconstructs from a code file keyed by slug.

## 04 · interaction_type — the tier nobody writes
*12 declared · 1 in use*

The block model has four declared tiers: **type → subtype → interaction → render**. Tier 3 is the one the renderer actually uses, and it is absent from 445 of 498 blocks.

- **Declared terms: 12** — check · clinical · complete · input-table · rate · read · select-many · select-one · track-table · upload · watch · write
- **Blocks carrying one: 53** — of 498 — all assessments
- **Distinct values in use: 1** — `select-one`
- **Equip blocks carrying one: 0** — of 406

> **[CRITICAL] The tier the renderer obeys is the tier nothing writes.**
>
> `resolveInteraction()` opens with `if (activity.interaction) return activity.interaction;` — so an explicit interaction wins outright. 53 assessment blocks have one; nothing else does. Every other block's interaction is **derived at read time** by a switch over type and subtype, which is why §03's undeclared subtypes cause a render bug at all.
>
> This is the same shape as the assessments module's scoring: a correct, complete mechanism that runs on a field nobody populates. **Persisting `interaction` at authoring time is what makes the derivation — and its default case — unnecessary.**

> **[WARNING] The admin panel already says this is the plan.**
>
> `AdminBlockTypeViewer.tsx` line 403, verbatim: *"Every block is an interaction. The `interaction` field on Activity replaces the split between `type` + `exerciseConfig.subtype`. Old programs are auto-mapped via `resolveInteraction()`."*
>
> So the intended end state is written down, in the product, on a screen an admin can read. The migration it describes — auto-map the old, write the new — has been half-done for the 53 assessment blocks and not started for the 406 equip ones. **This standardisation is not a new direction; it is finishing a stated one.**

## 05 · day_config_type — 11 declared, 1 used
*97 equip days · 7 assessment days*

*Every declared day type against every day in the product*

| Term | Declared | Equip days | Assessment days | Note |
|---|---|---|---|---|
| learning | yes | 93 | 0 | the only declared term in real use |
| assessment | yes | 0 | 3 | correct |
| **lesson** | NO — it is a block type | 4 | 4 | **validateBlockForDayType() finds no preset and returns {allowed:true} immediately** |
| tracker | yes | 0 | 0 | Sleep Tight has 13 days that are unambiguously this |
| reflection | yes | 0 | 0 | Productivity Reset is half reflections |
| onboarding | yes | 0 | 0 | every program's day 0 is this |
| check-in · practice · quiz · rest · workshop · assessment-lite | yes | 0 | 0 | never assigned to anything |

> **[CRITICAL] Day types and block types are being used interchangeably, in both directions.**
>
> `lesson` — a block type — is set as a *day* type on 8 days. `conclude` — a day-position concept — is set as a *block* type on 84 blocks. Neither is a typo; each is a real concept expressed at the wrong level, and both survive because nothing validates either.
>
> The consequence is concrete: `validateBlockForDayType()` short-circuits on the 8 `lesson` days, so the blocked-list check that runs everywhere else does not run there. And the check it would have run is itself disabled — the allow-list rejection in `day-presets.ts` is commented out. **The guardrail is off, and on 8 days it is also unreachable.**

## 06 · Check-in scales — the model that works
*5 scales · 1 special case*

The mood journal is the only place in this product where a scale is **a record referenced by a step** rather than a list copied inline. It is the reference implementation for everything §07 proposes, and it is worth seeing exactly what it does and where it stops short.

*checkin_scale: — 5 rows, referenced by scale_key from the template's steps*

| Scale | Stored at | Options | Referenced by | Reached via |
|---|---|---|---|---|
| **energy** | checkin_scale:energy | 5 | step "energy" | getScaleByKey() |
| **stress** | checkin_scale:stress | 5 | step "stress" | getScaleByKey() |
| **context_tags** | checkin_scale:context_tags | 6+ | step "tags" | getScaleByKey() |
| **sleep** | checkin_scale:sleep | 5 | — nothing | — |
| **pain** | checkin_scale:pain | 5 | — nothing | — |
| **mood** | **mood:{id}** — a different prefix | 5 | step "mood" — **required, first** | **a hardcoded branch** |

> **[CRITICAL] The primary scale is the one that isn't in the scale store.**
>
> The daily check-in's first and only required step declares `scale_key: "mood"`. There is no `checkin_scale:mood` record and `scales-routes.ts` declares no such key — a comment there says so explicitly: *"Moods use individual KV keys `mood:{id}` (same as AdminMoodManager). No separate KV_KEY_MOODS."*
>
> So `MoodJournal.tsx` line 438 branches around it:
>
> ```
> const scaleOptions = step.scale_key === 'mood'
>   ? moodOptions.map(...)          // read from the mood:* prefix
>   : getScaleByKey(step.scale_key || '');
> ```
>
> Four scales go through one resolver. The fifth — the one the product is named after — needs a string comparison against a literal. It works, and it is the exact shape of every problem in this document: **a general mechanism with one thing carved out of it**, which is where the next divergence will start.

> **[WARNING] The step types are snake_case; the catalog declares kebab-case.**
>
> Template steps use `emoji_scale`, `free_text`, `multi_select`. The `checkin_block_type` vocabulary declares `emoji-scale`, `free-text`, `multi-select`, plus `single-choice`, `slider`, `yes-no` and `context-tags`, none of which is used. Same three concepts, two spellings, nothing joining them — so the catalog cannot be used to validate a template today even though it describes it correctly.

> **[OK] Two unused scales are the argument for the whole model.**
>
> `sleep` and `pain` are fully authored, five options each, with values and severities — and no template step references them. That is not a bug; it is **the shared-scale model working as designed**: a scale exists independently of any instrument that uses it, and a new template can pick it up without re-authoring. Sleep Tight's 126 input-tables and the assessments module's 27 duplicated PHQ/GAD scales are both re-authoring what this store already knows how to hold once.

## 07 · The proposal — one vocabulary
*design*

> **[NOTE] Three rules, and everything below follows from them.**
>
> **1. Interaction is the primitive.** The admin panel already says so. Persist it at authoring time; keep `resolveInteraction()` only as a read-time migration for existing rows. — **2. Type is editorial, subtype is structural.** The data already treats them as independent axes — `multi-select` appears under four different types. Stop pretending type constrains subtype. — **3. Every vocabulary carries its aliases.** Five spellings already exist in a switch statement. Put them in the catalog where the editor, the renderer and a migration can all see them.

*[diagram]* **The change is where the mapping lives, not what it says.** The mapping from subtype to interaction is correct today; it just runs at read time, in code, with a default case that produces a plausible wrong answer. Persisting the result at authoring time turns a silent fallback into a stored fact.

### The canonical block vocabulary

*After reconciliation — 8 types, 12 subtypes, 12 interactions, aliases carried on the term*

| Tier | Terms | Change from today |
|---|---|---|
| **block_type** — editorial | exercise · lesson · conclude · reflection · **quiz** · checklist · journal − sleep-diary | +1 add, −1 retire |
| **exercise_subtype** — structural | input-table · comparison-matrix alias: matrix, comparison_matrix · mcq · single-select · multi-select · structured-list alias: row_list, text_list · table · rating-scale alias: scale, rating_scale, likert · clinical-instrument alias: clinical_instrument · upload · ephemeral-journal · **number** | +1 add, 7 aliases, 0 retire |
| **interaction_type** — the primitive | unchanged — 12 terms, already correct | 0 — start *writing* it |
| **day_config_type** | unchanged — 11 terms, already correct | 0 — start *using* it; retire `lesson` as a day type |
| **checkin_block_type** | emoji-scale alias: emoji_scale · free-text alias: free_text · multi-select alias: multi_select · single-choice · slider · yes-no · context-tags | 3 aliases |

> **[CRITICAL] Nothing here retires a term that has content behind it.**
>
> One retirement — `sleep-diary` — and it has zero blocks. Every other change is an addition or an alias, so no existing content becomes invalid and no migration is required to make the catalog true. **The reconciliation is non-destructive by construction**, which is what makes it safe to do before the deploy questions are settled.

## 08 · The edit list
*hand this to the implementer*

### A · Code — the render bug, first and alone

> **[DONE 2026-09-02]** Items 1 and 2 are shipped. **The scope here was wrong: 57 blocks were
> affected, not 9** — none of the 58 rows carrying these subtypes has `options`, so every one hit
> `return 'write'`. `ExerciseConfig.subtype` was widened to the 6 terms live content actually uses;
> `'rating-scale'` and `'clinical-instrument'` were already unreachable `TS2678` cases sitting in the
> switch doing nothing. Typecheck **220 → 216**. `number` (1 block) is deliberately left unmapped —
> there is no numeric interaction, and the new warning now surfaces it instead of hiding it.

| # | Change | Where | Effect |
|---|---|---|---|
| 1 | **Add four cases to `resolveInteraction()`:** `matrix` → `input-table` (beside `comparison-matrix`), `scale` → `rate` (beside `rating-scale`), `row_list` and `text_list` → `check` (beside `structured-list`). | lib/equip-admin-types.ts ~73 | **9 blocks stop rendering as textareas.** User-visible, two programs, no data change |
| 2 | **Make the default case loud.** An unmapped subtype should `console.warn` with the subtype and block id before falling back. | lib/equip-admin-types.ts ~100 | The next undeclared term shows up in a log instead of in a user's face |

### B · Catalog — data only, no deploy needed

| # | Change | Rows | Note |
|---|---|---|---|
| 3 | **Add `block_type · quiz`** | +1 | 12 blocks across all 4 programs already use it |
| 4 | **Add `exercise_subtype · number`** | +1 | 1 block |
| 5 | **Retire `block_type · sleep-diary`** | −1 | Zero blocks. It is an `exercise · input-table` |
| 6 | **Add an `aliases[]` field to the catalog term shape**, and populate the 10 aliases in §07 | 10 | Schema addition on `category:`. Backward compatible — absent means none |

### C · Content — data only, and it unlocks the charts

| # | Change | Rows | Note |
|---|---|---|---|
| 7 | **Normalise the 12 undeclared subtype values** to their canonical spellings once the aliases exist | 12 | Optional if item 1 ships — the aliases make it cosmetic |
| 8 | **Set `dayType` on the 8 `lesson` days** to a real day type | 8 | Restores `validateBlockForDayType()` on those days |
| 9 | **Assign real day types to the 97 equip days** — `onboarding` for day 0, `tracker` for Sleep Tight 18–30, `reflection` where it applies | 97 | Nine of eleven declared terms have never been used. This is why day structure leaked into block types |
| 10 | **Add `exerciseConfig.key` to the 98 keyless input-tables** | 98 | **Prerequisite for any cross-day chart.** Without it, day 3's "hours slept" and day 17's are unrelated keys |
| 11 | **Set `exercise_subtype: clinical-instrument` on the 92 assessment items** | 92 | Makes "this is a clinical item" a data fact instead of a slug lookup in a code file |

### D · The structural change — after A, B and C

| # | Change | Where | Note |
|---|---|---|---|
| 12 | **Persist `interaction` at authoring time.** `BlockEditor` writes it; `resolveInteraction()` stays only as read-time migration for rows without one | BlockEditor.tsx · BlockRenderer.tsx | Removes the default case from the live path. The admin panel already documents this as the intent |
| 13 | **Backfill `interaction` on the 445 blocks that lack one**, using the corrected resolver | data | One-time. After this the resolver is dead code |
| 14 | **Unify the check-in step-type spelling** — accept both, write kebab | checkin-template-routes.ts · MoodJournal.tsx | Lets `checkin_block_type` validate a template |
| 15 | **Move the mood scale into `checkin_scale:mood`** and delete the hardcoded branch | scales-routes.ts · MoodJournal.tsx ~438 | Five scales, one resolver, no special case |
| 16 | **Delete the fallback lists in `BlockEditor.tsx`** (lines 38 and 53) and show an error state when the catalog fails to load | BlockEditor.tsx | Today a metadata failure silently offers a different vocabulary and the admin cannot tell |

> **[WARNING] Items 3–11 are database writes and the deploy hold's no-write rule covers them.**
>
> None of them requires a deploy, and none is destructive except item 5, which removes a term with zero content behind it. They are listed as a batch so they can be run as one reviewed migration when the hold allows — not as eleven separate decisions.

## 09 · Sequencing
*what unblocks what*

| Order | Do | Why here | Blocked by |
|---|---|---|---|
| 1 | **Item 1** — the four resolver cases | It is a live user-visible defect, it is three lines, and it depends on nothing | nothing |
| 2 | **Item 2** — make the default loud | Same file, same commit. Stops the next one being silent | nothing |
| 3 | **Items 3–6** — catalog reconciliation | Non-destructive. Makes the catalog true, which every later item depends on | the write hold |
| 4 | **Item 16** — delete the editor fallback lists | Only safe *after* the catalog is true; before that the fallback is load-bearing | items 3–6 |
| 5 | **Items 8–9** — real day types | Restores the day-level guardrail and stops structure leaking into block types | items 3–6 |
| 6 | **Item 10** — response keys on the input-tables | Prerequisite for every cumulative view anyone will ask for | the write hold |
| 7 | **Items 12–13** — persist interaction | The structural change. Do it once the vocabulary it writes is stable | items 1–6 |
| 8 | **Items 14–15** — check-in unification | Independent of the block work; group with the mood module pass | nothing |

> **[NOTE] What this pass changes about the module surveys.**
>
> Three findings in the module artifacts are corrected by what was learned here, and they are corrected in the direction of *less* blame on the architecture:

> **[CRITICAL] And one finding this pass makes worse, not better.**
>
> The nine mis-rendering blocks were not visible in any of the five module surveys, because each of them looked at one module's data. It took putting the catalog, the content and the resolver switch on the same page to see it. **That is the argument for the single source of truth**, and it is worth noting that the first thing it found is a defect that has been live in two published programs for months.

---

**Method.** Catalog terms read from `kv_store_cc205da9` where `key LIKE 'category:%'`, grouped by `value->>'type'`, on 2026-09-02. Live usage from a walk of `daily_content[].activities[]` across all `equip:` and `assessment_def:` records — 498 blocks, 104 days. The render-bug claim was verified by reading `resolveInteraction()` in `lib/equip-admin-types.ts` and then checking, per block, whether the fields its default case tests (`exerciseConfig.options`, an explicit `interaction`) are present: 0 of 8 `matrix` blocks have either, and 8 of 8 have `columns`. Code read at `4423f72f`. **No database writes were made and nothing was deployed.**

**Corrections to earlier notes in this session.** The tree is at `4423f72f`, in sync with origin as of 2026-09-02 11:22 IST — **not** `d2ac376c` with 7 commits unpushed. That stamp is wrong on all five module artifacts and is being corrected.

**Not established.** Which code path wrote the five undeclared subtypes — they appear in neither the editor's catalog-backed dropdown nor its fallback list, so a third writer exists and has not been found.
