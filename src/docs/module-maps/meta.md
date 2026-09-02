# Twenty-one vocabularies, and the fields that were never built to hold them

*Module 5 of 5 · single source of truth · read-only survey · live database 2026-09-02*

Every dropdown in this app — topic categories, block types, therapy approaches, severity levels — comes from the same 190 rows under one prefix. It is the healthiest system in the survey: one editor, one hook, one route, zero duplicate slugs, write path equal to read path. It is also the one where **75 of its 264 terms describe a field that does not exist on any record.**

`db **jpfvoevxegnknxoqmwye** | branch **equip-carry-forward** @ **4423f72f** | 190 rows · 21 types · **0 untyped** | read-only · **no writes made**`

Six of twenty-one vocabularies are clean — every stored value is a declared term. Seven diverge in one direction or both. And **eight populate a field that is absent from every record they are meant to describe**: five of them the consultant directory, two of them feeding public filters. That gap is invisible to a consumer grep, because the code that reads a vocabulary and the record that should store it live in different places, and only one of them was ever written.

## Contents

- **01** One prefix, one hook, one editor
- **02** All twenty-one types
- **03** Three key shapes, one prefix
- **04** The full taxonomy audit
- **05** The field that isn’t there
- **06** The failure mode, still intact
- **07** Target — the catalog as a foreign key
- **08** Standing open
- **09** Change brief

## 01 · One prefix, one hook, one editor
*how it works*

*[diagram]* **Write path and read path are the same prefix for all 21 types** — confirmed by reading the actual route handlers, not inferred from names. That is what makes this system structurally different from the Mood Journal's dead-prefix bug: there is no second store to drift against. The risk here is ordering and fallthrough, not divergence.

One editor drives all of it — `AdminCategoryManager.tsx`, labelled **Meta Manager** in the sidebar — writing through `POST/PUT/DELETE /admin/categories`, all keyed `category:{id}`. The admin sees the 21 types organised into five domain groups; the code sees one flat prefix.

## 02 · All twenty-one types
*seed · live · who reads it*

> **[WARNING] Read the "Status" column here as *"has a real consumer in code"* — not as *"is used".***
>
> Five of the types marked **real** below — `consultant_type`, `therapeutic_approach`, `demographic_specialty`, `session_format` and `language` — populate a field that does not exist on a single record. The screens read the catalog and then match against nothing. **§04 and §05 are the audit this table cannot perform**, and they change the verdict on eight of these twenty-one rows.

- **Types: 21** — in 5 admin groups
- **Rows live: 190** — seed defines 187
- **Types matching seed exactly: 19** — both differences explained
- **Types with a real consumer: 17** — of 21
- **Read only by the viewer screen: 2** — decorative
- **Read by nothing: 2** — dead

*Grouped as the Meta Manager presents them*

| Type | Admin label | Seed | Live | Read by | Status |
|---|---|---|---|---|---|
| **Content & Topics — categories, types and formats for content across the platform** | | | | | |
| category | Topic Categories | 19 | 19 | **Library** (public) · Consultation · FAQ · 11 admin screens | real · most-consumed |
| content_type | Content Types | 7 | 8 | AdminResourceManager | real +1 retyped legacy row |
| filter_type | Content Formats | 9 | 9 | **Library** (public) · ResourceEditPage · AdminResourceManager | real, but wired to no resource field |
| media_type | Media Types | 5 | 5 | **nothing** | dead |
| **Programs & Blocks — block types, interactions, exercise subtypes, day configurations** | | | | | |
| block_type | Block Types | 7 | 7 | BlockEditor · DayEditor · viewer | real |
| interaction_type | Interaction Types | 12 | 12 | AdminBlockTypeViewer only | decorative |
| exercise_subtype | Exercise Subtypes | 11 | 11 | BlockEditor · viewer | real |
| day_config_type | Day Config Types | 11 | 11 | AdminBlockTypeViewer only | decorative |
| difficulty_level | Difficulty Levels | 3 | 3 | 5 authoring screens | real |
| **Assessments & Scoring — types, methods, severities, check-in categories** | | | | | |
| assessment_type | Assessment Types | 3 | 3 | AdminAssessmentManager · UnifiedBasicInfoForm | real |
| scoring_method | Scoring Methods | 4 | 4 | AdminScoringEngine · AssessmentEditPageWizard | feeds an engine with 0 profiles |
| severity_level | Severity Levels | 7 | 7 | AdminScoringEngine · RecommendationRulesManager | 7 values · consumers use 3–4 |
| ema_category | Check-in Categories | 11 | 11 | AdminCheckinTemplateBuilder | real |
| checkin_block_type | Check-in Block Types | 7 | 7 | **nothing** — the builder uses a hardcoded array | dead |
| **Consultants & Therapy — specialisations, approaches, formats** | | | | | |
| consultant_type | Consultant Types | 6 | 6 | **Consultation** (public) · 3 admin screens | real |
| therapeutic_approach | Therapeutic Approaches | 13 | 13 | 3 screens | real |
| demographic_specialty | Demographic Specialties | 11 | 11 | 3 screens | real |
| expertise_category | Issues Addressed | 21 | 21 | **Consultation** (public) · 2 screens | real · largest type |
| session_format | Session Formats | 4 | 4 | ConsultantEditPage only | real |
| language | Languages | 12 | 12 | **Consultation** (public) · 3 screens | real |
| **Users & Accounts** | | | | | |
| account_type | Account Types | 4 | 6 | AdminUserManager | real +2 admin-created |

> **[OK] Both differences between seed and live are legitimate.**
>
> `content_type` holds 8 against a seed of 7: the extra is `mood`, a pre-catalog record that was retyped rather than deleted during the cleanup — it still carries legacy `group`, `order` and `is_active` fields no other row has. `account_type` holds 6 against a seed of 4: `consultant` and `contributor` were created by an admin through the generic Add button. That is the catalog working as designed — the seed is a bootstrap, not an enforced enum.

> **[WARNING] Severity is a seven-value vocabulary that no consumer uses in full.**
>
> The type holds `minimal · low · mild · moderate · moderately-severe · high · severe`. The 18 Rule Engine rules use exactly three of them (`mild`, `moderate`, `high`), and the Recommendation Engine's own `severityFromScore()` emits four (`low`, `mild`, `moderate`, `high`) — a different four. The remaining values exist because clinical bands need them (PHQ-9 has "moderately severe"), but nothing joins the two ranges. Carrying this into the engines module: **the severity vocabulary, the rule severities and the computed severities are three overlapping sets, not one.**

## 03 · Three key shapes, one prefix
*190 rows*

| Key shape | Rows | Written by | Reachable by sync? |
|---|---|---|---|
| category:cat-{type}-{slug} | 184 | The catalog sync endpoint | yes — matched on type::slug |
| category:{uuid} | 5 | The Meta Manager's Add button | yes — carries type and slug |
| category:cat_{ts}_{rand} | 1 | Pre-catalog, 2025-12-30 | yes — since it was retyped |

The five UUID-keyed rows are worth naming individually, because they are the survivors of the cleanup rather than mistakes: `anxiety`, `depression` and `mental-health` as topic categories (created 2026-01-04, before the catalog convention existed), plus the two admin-created account types. The sync endpoint skipped creating `cat-category-anxiety` and its siblings precisely because a row with that `type::slug` already existed — which is the guard working correctly.

> **[WARNING] The sync endpoint can only see rows that already have both fields.**
>
> `POST /categories/sync` bulk-upserts the code seed, building its existing-item map with `if (e?.type && e?.slug)`. A row missing either is invisible to it — it will never be matched, deduped, retyped or cleaned. That is exactly why the 22 untyped legacy rows survived every "Sync All" run and had to be deleted by hand.
>
> Nothing in the system currently produces such a row: the Meta Manager requires a type, and sync always writes one. But the cleanup mechanism still cannot reach a row that arrives without one, by any other path.

## 04 · The full taxonomy audit — every term against live content
*21 vocabularies · 264 terms*

§02 asks **which code reads each vocabulary**. This asks a different and harder question: **which values are actually stored in the records these vocabularies are supposed to describe.** The two are not the same, and the gap between them is where the catalog's health actually lives. A vocabulary can have three real consumers in code and still describe nothing, because the field it populates was never written.

- **Vocabularies: 21** — 264 terms across 190 rows
- **With content to check: 16** — 5 have no records to compare against
- **Clean — every stored value declared: 6** — of the 16
- **Target field does not exist: 7** — the vocabulary describes nothing

### The audit

*Every vocabulary, the field it is meant to populate, and what that field actually holds*

| Vocabulary | Terms | Populates | Live values found | Verdict |
|---|---|---|---|---|
| **Clean — every stored value is a declared term** | | | | |
| **category** | 19 | equip · assessment · resource · rule | equip 4 · assessment 7 · resource 4 — **all declared** | clean · but see the casing note |
| **difficulty_level** | 3 | equip · assessment · resource | `beginner` ×17 · `intermediate` ×1 | clean · `advanced` unused |
| **filter_type** | 9 | resource.filter_type | `article` ×9 — declared | clean for resources · misused by assessments, below |
| **ema_category** | 11 | check-in template steps | read by the builder; no stored field to check | no divergence possible |
| **scoring_method** | 4 | scoring profile | **zero profiles exist** | nothing to describe |
| **assessment_type** | 3 | assessment.assessment_type | **null on all 7** — the value sits in `filter_type` | field empty, value misfiled |
| **Diverging — values in use the catalog does not declare, or vice versa** | | | | |
| **block_type** | 7 | block.type — 498 blocks | `quiz` ×12 undeclared · `sleep-diary` declared, unused | both directions — blocks §05 |
| **exercise_subtype** | 11 | exerciseConfig.subtype | **5 undeclared · 5 declared-unused**. 9 blocks render wrong | both directions — blocks §07 |
| **day_config_type** | 11 | day.dayType — 104 days | `learning` 93 · `assessment` 3 · `lesson` 8 **(a block type)** | 9 of 11 never used |
| **interaction_type** | 12 | block.interaction | `select-one` ×53 — **1 of 12, on 53 of 498 blocks** | the tier the renderer obeys |
| **checkin_block_type** | 7 | template step.type | `emoji_scale` · `free_text` · `multi_select` — **snake_case against 7 kebab-case terms** | 3 in use, 0 matching by string |
| **severity_level** | 7 | rule severity | rules store `**min_severity**`, not `severity_level`: `moderate` 8 · `mild` 5 · `high` 5 | wrong field name · 3 of 7 used |
| **expertise_category** | 21 | professional.specialties[] | free lowercase strings — `depression` ✓ `anxiety` ✓ `trauma` ✓, but `couples therapy` (space, not kebab), `communication` (declared as `communication-skills`), `bipolar` · `medication` · `family counseling` undeclared | 5 of 8 values don't match |
| **The target field does not exist on the record — §05** | | | | |
| **consultant_type** | 6 | professional.consultant_type | **field absent on all 12** | describes nothing |
| **session_format** | 4 | professional.session_format | **field absent** — records carry `availability` | describes nothing |
| **language** | 12 | professional.languages | **field absent on all 12** | describes nothing |
| **therapeutic_approach** | 13 | professional.approaches | **field absent** | describes nothing |
| **demographic_specialty** | 11 | professional.demographics | **field absent** | describes nothing |
| **account_type** | 6 | user.account_type | **field absent on all 8** — records carry `roles`, `is_admin`, `corporate_user` | describes nothing |
| **media_type** | 5 | media.media_type | **field absent** — records carry `fileType` holding MIME strings (`image/svg+xml`, `image/avif`) | describes nothing |
| **content_type** | 8 | resource.content_type | **field absent on all 9** | describes nothing |

> **[CRITICAL] Six of twenty-one vocabularies are clean. Eight describe a field that does not exist.**
>
> §02 lists `consultant_type`, `therapeutic_approach`, `demographic_specialty`, `session_format` and `language` as **real** — each has three or more screens reading it, and `consultant_type` and `language` feed the public Consultation page. That is all true and it is not the same as being used. Every one of those vocabularies populates a field that is absent from all twelve `professional:` records.
>
> The screens read the catalog, render a filter or a dropdown, and then match against nothing. **A vocabulary with real consumers and no stored values is a filter that always returns everything or nothing** — and that is a harder failure to notice than an empty dropdown, because the dropdown is full.

> **[WARNING] The Rule Engine's category values are Title-Case and the catalog's are lowercase.**
>
> 18 `recommendation_rule:` rows store `assessment_category` as `"Burnout"`, `"Anxiety"`, `"Stress"`, `"Balance"`, `"Depression"`, `"Sleep"`, `"General"`. The catalog declares `burnout`, `anxiety`, `stress` — lowercase, and the assessment records store them lowercase too.
>
> This works today only because the Rule Engine matches case-insensitively. It is the one place in the product where a case-insensitive comparison is **load-bearing** — remove it and every rule stops matching. Worth knowing before anyone tidies that comparison up.

> **[CRITICAL] Nine of twelve professionals are test data, which is why this went unnoticed.**
>
> `professional.specialty` reads `"Test Specialty"` on 9 of 12 records and is null on the other 3. The three real ones carry a `specialties[]` array of free lowercase strings. So the consultant vocabularies — 63 terms across five types, the largest single block of the catalog — describe a directory that is three-quarters placeholder.
>
> That is not an argument for deleting them. It is an argument for wiring them **before** the directory is populated, because the moment real consultants are added through a form backed by free-text fields, 63 curated terms become permanently decorative.

> **[WARNING] `assessment_type` and `filter_type` have swapped places.**
>
> All seven assessments store `filter_type: "standard"`. `standard` is a term in the `assessment_type` vocabulary, not the `filter_type` one — `filter_type` declares content formats (`article`, `video`, `podcast`…). Meanwhile `assessment.assessment_type` is null on all seven.
>
> So one vocabulary's value is stored in another vocabulary's field, and the correct field is empty. **No assessment carries a real assessment type**, and nothing has ever flagged it because neither field is validated against its catalog.

## 05 · The field that isn't there
*8 vocabularies · 75 terms*

Eight vocabularies populate a field that does not exist on any record. That is **75 of the catalog's 264 terms — 28% of it** — curated, grouped, labelled, iconed, and pointed at nothing. This is the catalog's real health problem, and §02's consumer grep cannot see it, because the code that reads a vocabulary and the record that should store it are in different places.

*The vocabulary, the field it needs, and what the record carries instead*

| Vocabulary | Terms | Record | Needs | Record actually carries |
|---|---|---|---|---|
| expertise_category | 21 | professional: ×12 | specialties[] as terms | free lowercase strings — 5 of 8 undeclared |
| therapeutic_approach | 13 | professional: ×12 | approaches[] | — nothing |
| language | 12 | professional: ×12 | languages[] | — nothing |
| demographic_specialty | 11 | professional: ×12 | demographics[] | — nothing |
| content_type | 8 | resource: ×9 | content_type | filter_type only |
| consultant_type | 6 | professional: ×12 | consultant_type | title · specialty · qualifications |
| account_type | 6 | user: ×8 | account_type | roles · is_admin · corporate_user |
| media_type | 5 | media: ×6 | media_type | fileType — raw MIME strings |
| session_format | 4 | professional: ×12 | session_formats[] | availability · available |

> **[CRITICAL] Five of the eight are the consultant directory, and they fail together.**
>
> `consultant_type`, `therapeutic_approach`, `demographic_specialty`, `session_format` and `language` — 46 terms — all point at `professional:`, and the professional record carries none of the five fields. Two of them (`consultant_type`, `language`) feed the **public** Consultation page's filters.
>
> So the public consultant filter renders a full set of options from a healthy catalog and filters a dataset that has no values to filter on. Whether it shows everything or nothing depends on how each filter handles a missing field — which is a per-screen accident, not a decision.

> **[WARNING] Three of the eight are the same mistake in three shapes.**
>
> Only the third is a data problem. The first two are a **mapping** problem, and both would be closed by naming the field after the vocabulary — which is what §07 proposes and what a foreign key would have forced.

> **[NOTE] This is the catalog's version of the pattern the whole survey keeps finding.**
>
> Every other module in this survey has **two representations of one entity, only one of them live**. The catalog is the one system with a single representation of itself — §06 is emphatic about that, and it holds.
>
> But it has the mirror-image problem: **a representation with nothing on the other end.** 75 terms describing fields that were never created. Not a divergence between two copies — a relation with one side missing. And it is invisible to every check the catalog runs on itself, because everything it can see is correct.

## 06 · The failure mode, still intact
*fixed data, unfixed shape*

Three independent behaviours compose into the bug that already happened once. Each is individually reasonable; together they make the public library's category list non-deterministic the moment two rows share a slug.

| # | Behaviour | Where | Still present? |
|---|---|---|---|
| 1 | A row with an unknown or absent `type` falls through an `else` into the **categories** bucket — not into an "unknown" bucket, and not dropped. | useMetadata.ts · TYPE_TO_BUCKET | yes |
| 2 | The fetch is a `.like()` scan with **no `.order()` clause anywhere in the chain**, so row order is Postgres physical order. | kv_store.tsx · getByPrefix | yes |
| 3 | De-duplication is **first wins** — `seen.has(item.value)`, keep the first, silently discard the rest. | useMetadata.ts · dedup() | yes |
| — | Rows that could collide | live data | zero, today |

When those 22 untyped rows existed, 15 of them shared a slug with a real category. Which version the public Library rendered — the coloured, iconed `Stress` or its flat grey twin — was decided by physical row order, with no code change and no admin action. Seven of them weren't topic categories at all (`assessment`, `equip`, `resource`, `mood`, `Article`, `Video`, `course`) and appeared in that dropdown regardless.

> **[OK] What is genuinely solid here, and worth not breaking.**
>
> Write path equals read path for all 21 types — the same prefix in both directions, verified by reading the handlers. There is no second store, no mirror, no dual-write, and therefore none of the divergence that defines every other module in this survey. Zero duplicate slugs within any type. Zero placeholder or test content. One editor, one hook, one route. **The catalog is the only system audited so far with exactly one representation of itself.**

> **[CRITICAL] One shadowed route remains.**
>
> There are two `GET /admin/categories` handlers — one in `admin-routes.ts`, one in `resource-routes.ts`. Hono matches the first registered, so the second never executes. Same data, harmless today; the 2026-09-01 audit's wider finding was that two such shadowed pairs elsewhere *weaken* the effective auth guard, so it is worth knowing which one is live before either is edited.

## 07 · Target — the catalog as a foreign key
*proposal · nothing migrated*

> **[NOTE] The catalog does not need rebuilding. It needs the other end of its relations.**
>
> One prefix, one hook, one editor, zero duplicate slugs, zero untyped rows, write path equal to read path. **This is the only system in the survey with exactly one representation of itself**, and nothing below changes its shape. What changes is that a stored value stops being a string that happens to match a term, and becomes a reference to one.

### Four rules

- **A term is referenced, not copied.** `category: "sleep"` is a string that happens to equal `cat-category-sleep`'s slug. Rename the term and nothing points back. `category_id` as a real foreign key is what makes the catalog authoritative rather than advisory.
- **Every term carries its aliases.** Eleven spellings already exist across a switch statement, a snake/kebab split and a Title-Case rule table. Put them on the term where the editor, the renderer, a validator and a migration can all read one list.
- **A vocabulary with no target field is a bug, not a backlog item.** Eight of them, 75 terms, 28% of the catalog. Either wire the field or retire the vocabulary — leaving it is what makes a full dropdown filter an empty dataset.
- **Validate on write.** Every divergence in §04 exists because a free string was accepted. One check at the write boundary is what stops the next one.

### The proposed shape

*Relational target, alongside the assessments and equip schemas*

| Table | Columns | Keys & constraints | Rows at migration |
|---|---|---|---|
| **vocabulary** | id · key · label · admin_group · description · position | PK id · UNIQUE key | 21 |
| **catalog_term** | id · vocabulary_id · slug · name · description · icon · color · position · **active** · created_at | FK vocabulary_id · **UNIQUE(vocabulary_id, slug)** — the constraint that makes the §06 failure mode impossible | 190 |
| **term_alias** | id · term_id · alias | FK term_id · UNIQUE(alias, vocabulary) via a partial index | 11 |

> **[CRITICAL] One constraint retires the entire §06 failure mode.**
>
> `UNIQUE(vocabulary_id, slug)` makes two rows with the same slug in the same vocabulary **unrepresentable**. That removes the need for the first-wins de-duplicator, removes the dependence on Postgres physical order, and removes the untyped-fallthrough entirely — a row cannot exist without a vocabulary, because `vocabulary_id` is NOT NULL. Three composing behaviours, closed by one line of DDL.
>
> It also closes the sync endpoint's blind spot: today `POST /categories/sync` builds its map with `if (e?.type && e?.slug)` and cannot see a row missing either, which is exactly the class of row it would need to clean. Under this schema such a row cannot be inserted.

### The other end — where each vocabulary becomes a foreign key

| Vocabulary | Becomes | On | Work |
|---|---|---|---|
| category · difficulty_level | category_id · difficulty_id | assessment · equip · resource | values already all valid — a straight join |
| block_type · exercise_subtype · interaction_type | block_type_id · subtype_id · interaction_id | block | after the blocks reconciliation — 2 adds, 1 retire, 11 aliases |
| day_config_type | day_type_id | day | 8 days need a real type first |
| severity_level | severity_id | scoring_band · recommendation_rule | rename `min_severity` → the FK; resolves the Title-Case rule values |
| assessment_type · filter_type | type_id · format_id | assessment · resource | **unswap them first** — §04 |
| consultant_type · therapeutic_approach · demographic_specialty · session_format · language | 5 join tables | professional | **the fields do not exist.** Create them, then backfill from `specialties[]` where a term or alias matches |
| media_type · content_type · account_type | media_type_id · content_type_id · account_type_id | media · resource · user | derive from `fileType`, from `filter_type`, and from `roles` |
| checkin_block_type | step_type_id | checkin_template step | accept both spellings, write kebab |
| scoring_method | calc | scoring_spec | already a column in the assessments target schema |
| ema_category | category_id | checkin_template step | — |

> **[WARNING] The consultant row is the one to decide on, not just schedule.**
>
> Five vocabularies, 46 terms, five fields that do not exist, and a directory where 9 of 12 records read `"Test Specialty"`. Wiring all five is real work against data that is three-quarters placeholder. **Retiring them until the directory is real is a defensible choice** — but it has to be a choice, because right now the public Consultation page renders filters built from them.

## 08 · Standing open
*no fixes applied*

- **Four of 21 types have no real consumer.** `media_type` and `checkin_block_type` are read by nothing at all; `interaction_type` and `day_config_type` are read only by a read-only reference screen. Each is a live admin tab where edits succeed, show a success toast, and change nothing.
- **The untyped fallthrough is intact.** A row without a recognised type still lands in the public categories bucket rather than being isolated or dropped.
- **The fetch has no ordering clause**, so which of two same-slug rows survives de-duplication is decided by Postgres physical order — nothing a code change controls.
- **The sync endpoint cannot reach a row missing a type or slug**, which is the exact class of row it would need to clean.
- **`filter_type` is wired to nothing on the resource record.** Nine format values — article, audio, course, exercise, guide, podcast, tool, video, workbook — with no `resource.filter_type` field to hold them. Every resource is implicitly an article.
- **`day_config_type` carries an `onboarding` value with no code path**, against 10 real presets — and the live equip content uses only two day types, one of which isn't a day type at all.
- **Severity is three overlapping vocabularies.** 7 catalog values, 3 used by rules, 4 emitted by the recommendation engine.
- **`scoring_method` feeds a Scoring Engine with zero profiles**, so its four values have never selected anything.
- **One legacy row still carries pre-catalog fields** — `content_type:mood`, with `group`, `order` and `is_active` that no other row has.
- **Two `GET /admin/categories` handlers exist**; one is shadowed and dead.

## 09 · Change brief
*hand this to the implementer*

> **[NOTE] How to read this section.**
>
> The catalog itself is healthy — nothing here is a repair to it. Every item is either **joining it to a record that ignores it**, or **closing the shape that let the 2026 pollution happen**. Items marked decision need an answer before the work is meaningful.

### A · Free — no schema, no deploy, closes real divergence

| # | Change | Rows | Why |
|---|---|---|---|
| 1 | **Unswap `assessment_type` and `filter_type`.** Move `"standard"` from `filter_type` into `assessment_type` on all 7 assessments. | 7 | Today no assessment carries an assessment type, and `filter_type` holds a value from the wrong vocabulary |
| 2 | **Add `block_type · quiz`, add `exercise_subtype · number`, retire `block_type · sleep-diary`** | +2 / −1 | Blocks §05. Non-destructive — the retirement has zero blocks |
| 3 | **Add an `aliases[]` field to the term shape** and populate the 11 known aliases | 11 | Absent means none, so it is backward compatible. Lets the editor, renderer, validator and migration read one list |
| 4 | **Clean the one legacy row** — `content_type:mood` still carries `group`, `order` and `is_active` that no other row has | 1 | Last survivor of the pre-catalog era |

### B · Code — small, and each closes a class of defect

| # | Change | Where | Effect |
|---|---|---|---|
| 5 | **Stop the untyped fallthrough.** A row with an unrecognised or absent `type` falls into the **public categories** bucket. Route it to an `unknown` bucket and log it. | useMetadata.ts · TYPE_TO_BUCKET | The single behaviour that turned 22 legacy rows into a public-facing bug |
| 6 | **Add an `.order()` clause** to the prefix fetch — by `key` is enough | kv_store.tsx · getByPrefix | De-duplication is first-wins over Postgres physical order. Ordering makes the outcome deterministic even when it is wrong |
| 7 | **Make de-duplication loud.** `dedup()` silently discards. Warn with the vocabulary and slug. | useMetadata.ts · dedup() | A collision becomes a log line instead of a coin flip |
| 8 | **Give `useMetadata` an error state.** It returns empty buckets on a throw, so editors silently fall back to their own hardcoded lists. | useMetadata.ts ~176 | An admin authors against the wrong vocabulary and cannot tell |
| 9 | **Delete the shadowed `GET /admin/categories`.** Two handlers exist; Hono matches the first registered | admin-routes.ts · resource-routes.ts | Harmless today. The 2026-09-01 audit found shadowed pairs elsewhere that weaken the auth guard |
| 10 | **Fix the sync endpoint's blind spot** — `if (e?.type && e?.slug)` means a row missing either is invisible to the cleanup that exists to remove it | POST /categories/sync | Nothing produces such a row today. Nothing prevents one either |

### C · The eight vocabularies with no target field

| # | Question | Options | Consequence |
|---|---|---|---|
| 11 | **The consultant directory — wire five vocabularies or retire them?** 46 terms, five absent fields, and 9 of 12 records read `"Test Specialty"` | Add the five fields and backfill · retire until the directory is real | decision Two of the five feed **public** Consultation filters today, which render options against a dataset with no values |
| 12 | **`media_type`** — derive from `fileType`'s MIME string, or retire? | One mapping function · retire | 6 records. A line of code either way |
| 13 | **`account_type`** — the concept exists as `roles` / `is_admin` / `corporate_user` | Join to the existing fields · retire the vocabulary | Not a data problem — a naming one. The record already knows the answer |
| 14 | **`content_type`** — 8 terms, absent on all 9 resources, which carry `filter_type` instead | Add the field · fold into `filter_type` | Depends on item 1 — the two vocabularies are already confused elsewhere |
| 15 | **`checkin_block_type`** — 7 kebab-case terms against 3 snake_case step types | Accept both, write kebab | Lets the catalog validate a check-in template, which it currently cannot |
| 16 | **`severity_level`** — rules store `min_severity`, the engine emits a different four, the catalog declares seven | One vocabulary, one field name | Three overlapping sets. Belongs with the engines module |

### D · Then — the schema

Items 1–10 make the catalog true and its failure mode inert. §07 proposes what replaces the prefix: three tables, and `UNIQUE(vocabulary_id, slug)` — the one constraint that makes the entire §06 failure mode unrepresentable rather than merely unlikely. That migration should not start until 11–16 are answered, because **each answer decides whether a vocabulary gets a foreign key or a retirement.**

> **[CRITICAL] One ordering constraint.**
>
> **Item 1 before item 14** — deciding what `content_type` is for is impossible while `filter_type` is holding an `assessment_type` value. **Items 2–3 before the blocks work** — the blocks change brief's editor cleanup is only safe once the catalog is true.

---

**Method.** Per-type counts, slug lists, duplicate checks and key-shape splits come from read-only SQL against `kv_store_cc205da9` on 2026-09-02. Seed counts parsed directly from the `METADATA_CATALOG_ITEMS` array in `metadata-catalog.ts`. Consumer claims are a grep for each of the 21 destructured bucket names across `components/` and `lib/`, excluding the hook that defines them. Route, bucket-map, ordering and de-duplication behaviour read from `index.tsx`, `admin-routes.ts`, `kv_store.tsx` and `useMetadata.ts` at `4423f72f`. No writes were made.

**The §04 audit is a second, independent read.** For each vocabulary, every record type it is meant to describe was scanned for the field it should populate and for the values that field holds — `professional:` ×12, `resource:` ×9, `user:` ×8, `media:` ×6, `recommendation_rule:` ×18, `equip:` ×4, `assessment_def:` ×7, `journal:` ×32, and all 498 content blocks. A vocabulary is marked "describes nothing" only where the field is absent from **every** record of that type, checked by key enumeration rather than by a null test.

**Where this differs from the repo docs.** `metadata-catalog.md` records 225 rows — 203 typed plus 22 untyped — and `interaction_type` polluted to 18 with 6 mistyped rows. Live: **190 rows, zero untyped, `interaction_type` at exactly 12.** All 28 problem rows have been removed since that doc was written. The doc's Bug 1 and Bug 2 are closed; its Bug 3 and Bug 4 (the two dead types) are open, and `block-architecture.md`'s reclassification of `interaction_type` and `day_config_type` as also decorative holds.
