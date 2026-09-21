# Assessment instruments, as they actually exist

*Module 1 of 5 · single source of truth · surveyed 2026-09-02 · **status refreshed same day***

Seven instruments, 92 items, 12 option scales, 70 real completions — plus the schema of each instrument, the payload a result emits, the four engines that read it, every fallback the chain takes when something is missing, and a 16-table relational target for Supabase. Read directly from the database and checked line by line against the scoring code, the engines and the original product spec. Nothing here was changed.

`db **jpfvoevxegnknxoqmwye** | surveyed at **d2ac376c** | now **340de905** · **17 commits later** | in sync with origin`

This page was surveyed against `d2ac376c`. The tree is now `340de905` — **17 commits later** — and a great deal has landed since, including work derived from this page's own change brief. Rather than silently rewrite the findings, the status of every one is recorded below and the sections themselves are left as the survey found them. **Read the survey as "how it got this way", and this block as "where it stands".**

## 00 · What has changed since this survey
*verified against code and live data*

- **Change-brief items closed: 13** — of 31
- **Content bugs remaining live: 0** — every hit is now inside a backup row
- **Results with a breakdown: 0** — of 95 — the code is fixed, nothing has run it
- **Completions since 2026-09-01: 0** — 13:04 is still the latest

### Closed — verified in code

*Each checked directly, not inferred from a commit message*

| Was | Now | Where |
|---|---|---|
| **§01's headline: the preset never runs.** `mappedAssessment` never copied `slug`, so `SECTION_PRESETS[undefined]` = `{}` | **Fixed properly.** `slug: fetchedAssessment.slug` is in the mapping. A `slugify(title)` guard sits behind it | AssessmentFlow.tsx:599 |
| The result record stored only `asm_…`, so no engine lookup could resolve | **`slug` is now persisted on the result** | assessment-routes.ts:108 |
| `KNOWN_MAX_SCORES` keyed on `phq9`/`gad7` against a stored `asm_…` id — never matched | **`candidateKeys()`** tries slug, assessment_slug, assessment_id and assessmentId, lower-cased | ikan-score-routes.ts:51 |
| **The wellness score inverted General** — 19 of 24 higher-is-better items read as distress inside 40% of the composite | **Fixed, and better than this page proposed.** A result carrying `section_scores` now computes wellness *per section* and never reaches the whole-assessment flag at all. The comment says so: *"General is handled correctly without a whole-assessment flag… Still do not add General to it"* | ikan-score-routes.ts:66–105 |
| `max_score` computed from `opt.value` on options that are all plain strings → always 0 | Gone. No `opt.value ?? opt.score` remains in the scoring path | 3 files |
| Out-of-range score returned `ranges[0]` — the mildest band | Gone. No `ranges[0]` in the flow | AssessmentFlow.tsx |
| `syncNow` called `saveQueue(failed)` against a stale snapshot, erasing anything queued during the sync | Re-reads at write time. The old behaviour is documented in a comment at the fix site | useOfflineSync.ts:232 |
| `getAssessment` returned a 24-hour cached copy on any error and Publish PUT it back | Fixed | 563510d3 |
| **The risk indicator did nothing.** `riskIndicatorQuestionIds` was declared and read by nothing — the most clinically urgent question in the product had no effect | **Any non-zero answer now offers the crisis panel**, alongside the result, never instead of it. Scoring and saving continue unchanged | AssessmentFlow.tsx:319 |
| Crisis support could not be opened — `showCrisisSupport` had no call sites, and the numbers were US | Reachable and localised to India | 1d5b0ab3 |
| **9 orphan rows** in `assessment_response_by_user:` — 105 index rows against 95 results | **95 and 95.** Exact match | live data |
| `"Pooo"` · `"auti fill "` · chat paste artefacts · `"Sleep DIary"` | **All gone from live records.** Every remaining match is inside a backup row — including a new `backup_pre_content_fixes_2026-09-02` | live data |
| 7 commits unpushed, origin 3 weeks stale | `equip-carry-forward` in sync with origin at `340de905` | git |

> **[WARNING] The code is fixed and the data has not yet felt it.**
>
> **0 of 95 stored results carry a `slug`, and 0 carry `section_scores`** — because the latest completion in the database is still `2026-09-01T13:04`. Nothing has run the corrected path.
>
> So `SectionReportCard` still has not rendered, the history chart still plots raw scores across unstable maxima, and the wellness score's new per-section path has no result to use it on. **The first real completion after this is the test** — and it is worth doing deliberately rather than waiting for one.

### Still open

| # | Open | Kind |
|---|---|---|
| 1 | **Depression has no risk indicator.** `riskIndicatorQuestionIds` is declared on `GENERAL_SECTIONS` and nowhere else — so the instrument named *Feeling depressed and hopeless* does not flag. And its item 9, `dep-q9`, is the softened *"Feeling that life is meaningless"* rewrite of PHQ-9's self-harm item. **It under-detects and it does not flag; those compound** | safety |
| 2 | **The risk check fires at submit, not at answer.** Someone endorsing item 9 at question 6 of 24 answers eighteen more before anything appears. *Alongside the result* and *at the moment of the answer* are not in conflict — offer at both | safety |
| 3 | **The 70 historical results.** Re-score from stored responses, or stamp a `provenance` and exclude from trends? Balance's three cannot be re-scored honestly either way — its items changed with no versioning | decision |
| 4 | **13 `progress:` rows still carry the developer instruction** — *"Show all activities from day 17 and 18…"* — as stored user *answers* from Sleep Tight days 18–30. The content is fixed; these are historical responses to it | data |
| 5 | `correctAnswer` / `allCorrect` authored and never rendered — quiz blocks grade nothing | bug |
| 6 | Two `GET /admin/categories` handlers; the second never executes | bug |
| 7 | The clinical decisions: `dep-q9` wording · Burnout's duplicate item · Burnout's and General's stored bands · NGSE/BRS 8/6 vs the spec's 7/7 · BAT-23 or accept 22 · equip check-ins sharing the assessment prefix | decision |

> **[NOTE] What this changes about how to read the rest of the page.**
>
> Sections **01**, **10**, **11**, **12** and **13** describe a chain that no longer breaks where they say it breaks. They remain accurate as an account of *how the module reached this state* and of the mechanisms involved — the fallback ladders, the silent defaults, the two representations — all of which still exist. Sections **02**–**09** (the instruments, the content, the schemas, the admin fields, the taxonomy) are unaffected and current. Section **17**'s target schema is unaffected: none of the fixes above changes the storage model.

## Contents

- **00** What has changed since this survey
- **01** Module flow, end to end
- **02** The item model
- **03** The twelve option scales
- **04** The seven instruments
- **05** Per-assessment schema
- **06** Block mapping per assessment
- **07** The content, item by item
- **08** What the admin panel feeds
- **09** Taxonomy & metadata dependencies
- **10** Spec vs code vs live
- **11** Result output schema
- **12** Engine communication
- **13** Errors and fallbacks
- **14** What the database actually holds
- **15** Display surfaces
- **16** Code surface — every file
- **17** Target schema — relational
- **18** Standing open
- **19** Change brief
- **20** Beyond bug-fixing — what to build

## 01 · Module flow
*author → play → score → store → consume*

*[diagram]* **Everything downstream of stage 5 consumes a flat sum.** The corrected result — scoped, reversed, banded, sectioned — is computed, shown once on the completion screen, and discarded.

> **[CRITICAL] Stage 5 never runs. One missing field.**
>
> `AssessmentFlow.tsx:532` builds the assessment object field by field and never copies `slug`; the interface at line 33 doesn't declare one. `SECTION_PRESETS[undefined]` → `{}` → `sectioned: false` → both the preset override and the breakdown are skipped, for every assessment, since the code shipped.

> **[WARNING] Stage 1 is still destructive in production.**
>
> The deployed wizard hardcodes `weights: []` on load and writes items back with no `scoring` key. The hardened version sits unpushed in `5d60a9b3`. The 2026-09-01 repair is protected only by nobody opening the editor.

## 02 · The item model — every question is one shape
*92 items · 1 block family*

- **Items: 92** — across 7 instruments
- **With an option list: 92** — 100% — no free text, no slider, no numeric input
- **Question types in use: 1** — single-choice, of 7 declared
- **Distinct option scales: 12** — 4-pt · 5-pt · 6-pt

This is the fact the whole taxonomy hangs on. **There is no flat scale system and no free-form input anywhere in this module.** Every one of the 92 items presents a fixed, ordered list of options, and the score is the weight of whichever option was chosen. Three of the seven declared question types are unreachable in the wizard; the other four are reachable and unused. Live, one value: `single-choice`.

So the block-type mapping is not a per-item judgement — it is one rule, and everything else is the option set:

*The mapping, stated once*

| Layer | Value | Varies by item? |
|---|---|---|
| **Block type** | exercise | no — all 92 |
| **Subtype** | mcq 54 blocks single-select 38 blocks | only by edit history, not by meaning |
| **Interaction** | select-one | no — the resolver maps both subtypes to it |
| **Option scale** | one of 12 | yes — this is the only real variable |
| **Weights** | 0-based by option position | derived from the scale, not the item |

> **[WARNING] `mcq` versus `single-select` carries no meaning.**
>
> Both resolve to `select-one`. The split is an artefact: the three assessments re-saved through the wizard (Burnout, Stress, General) came out as `mcq` with an explicit `interaction`; the four never re-saved stayed `single-select` with `interaction` unset. **Same question, same rendering, two labels, decided by whether someone opened the editor.** A standardised taxonomy should collapse these — or define the difference (scored vs unscored) and apply it consistently.

> **[NOTE] Which is why the scale, not the block, is the thing to model.**
>
> If every item is a select-one block, then an item is fully described by **its prompt plus its option scale**. The scale carries the labels, the order, the weights and the severity — exactly what a `checkin_scale:` record already carries for the Mood Journal. Assessments and check-ins are the same object with different vocabularies, and today the assessment side inlines its vocabulary into every single item.
>
> When other block types do arrive — a slider, a clinical grid, a free-text reflection — they extend this cleanly: the block gains a subtype and a config, and the scale stays where it is. Nothing about the scoring model has to change.

## 03 · The twelve option scales
*92 items · 12 scales · 1 duplicated 27×*

*Every distinct option set in the assessment bank, by usage*

| Proposed key | Pts | Options as stored | Items | Used by |
|---|---|---|---|---|
| freq-4pt-phq | 4 | 1 Not at all · 2 Several days · 3 More than half the days · 4 Nearly every day | **27** | Depression · Anxiety · General |
| freq-5pt-bat | 5 | 1 - Never · 2 - Rarely · 3 - Sometimes · 4 - Often · 5 - Always | 23 | Burnout |
| freq-5pt-often | 5 | 1 Never · 2 Rarely · 3 Sometimes · 4 Often · 5 Very Often | 8 | Balance |
| agree-5pt-a | 5 | 1 Strongly disagree · 2 Disagree · **3 Neither agree nor disagree** · 4 Agree · 5 Strongly agree | 8 | General (NGSE) |
| freq-5pt-pss | 5 | **0 - Never** · 1 - Almost Never · 2 - Sometimes · 3 - Fairly Often · 4 - Very Often | 7 | Stress |
| agree-5pt-b | 5 | 1 Strongly disagree · 2 Disagree · **3 Neutral** · 4 Agree · 5 Strongly agree | 6 | General (BRS) |
| time-6pt-who5 | 6 | 1 At no time · 2 Some of the time · 3 Less than half the time · 4 More than half the time · 5 Most of the time · 6 All of the time | 5 | General (WHO-5) |
| impact-5pt | 5 | 1 Not at all · 2 A little · 3 Somewhat · 4 Much · 5 Very Much | 3 | Sleep |
| sleep-latency-5pt | 5 | 1 0-15 minutes · 2 16-30 · 3 31-45 · 4 46-60 · 5 Over 60 minutes | 2 | Sleep |
| sleep-nights-5pt | 5 | 1 0-1 · 2 2 · 3 3 · 4 4 · 5 5-7 | 1 | Sleep |
| sleep-quality-5pt | 5 | 1 Very Good · 2 Good · 3 Average · **4 Pooo** · 5 Very Poor | 1 | Sleep |
| sleep-chronicity-5pt | 5 | 1 <1 month · 2 1–2 months · 3 3–6 months · 4 7–12 months · 5 More than 1 year | 1 | Sleep |

> **[CRITICAL] The PHQ/GAD scale is written out 27 times.**
>
> The same four options — the standard two-week frequency scale used by PHQ-9, GAD-7, PHQ-2 and GAD-2 — are stored inline on 27 separate items across three assessments. There is no shared record. Correcting a label, adding a translation, or changing a weight means editing 27 places and hoping none is missed. The Mood Journal solved this years' worth of items ago: `checkin_scale:energy` is one record referenced by a template step.

> **[CRITICAL] General uses two 5-point agreement scales that differ by one word.**
>
> NGSE's items say **"Neither agree nor disagree"**; BRS's say **"Neutral"**. Same instrument family, same assessment, same screen, two vocabularies. Neither is wrong — but they are two scales in the database where the user experiences one, and any tooling that groups by option set sees them as unrelated.

> **[WARNING] The scales carry their display numbering inside the label.**
>
> Every option begins with its own position — `"1 Not at all"`, `"2 Several days"` — and Stress alone is 0-indexed, `"0 - Never"`. The digit is display text that the renderer strips; the scored value is the array index. So Stress's labels happen to match its weights and every other assessment's are off by one, which is harmless today and is exactly the kind of coincidence that stops being harmless when someone reads a label as authoritative.
>
> A scale record separates the two properly: a `position`, a `label`, an optional `display_prefix`, and a `weight` that is not inferred from any of them.

> **[WARNING] And the typo is in a scale, not an item.**
>
> `"4 Pooo"` sits in Sleep's quality scale. Because that scale is used by exactly one item it looks like an item-level typo — but under a shared-scale model it is a one-row fix that would propagate everywhere the scale is used. Four of Sleep's five scales are used once each; they are genuinely per-item, and a good model has to allow that without forcing it.

## 04 · The seven instruments
*live counts*

*All items are single-choice; all options are plain strings; all weights are 0-based by position*

| Instrument | Category | Items | Scale | Flat max | Preset scores | Preset max | Stored bands | Results |
|---|---|---|---|---|---|---|---|---|
| **Feeling worried and stressed** — PSS-style | stress | 7 | 5-pt | 28 | 7 | 28 | 0–28 exact | 38 |
| **Struggling with quality sleep** — ISI themes | sleep | 8 | 5-pt | 32 | 8 | 32 | 0–32 exact | 9 |
| **Unsure or general concern** — GAD-2 · PHQ-2 · WHO-5 · NGSE · BRS | general | 24 | 4/5/6-pt | 96 | 23 + 1 risk | no overall | 3× New Category 0–10 | 8 |
| **Feeling overwhelmed and anxious** — GAD-7 + PHQ-2 | anxiety | 10 | 4-pt | 30 | 7 | 21 | 0–21 matches preset | 5 |
| **Feeling drained and burned out** — BAT | burnout | 23 | 5-pt | 92 | 22 | 1–5 mean | 0–40 matches neither | 5 |
| **Struggling to balance life** — mixed-direction | balance | 8 | 5-pt | 32 | 8 · 5 reversed | 32 | 0–32 exact | 3 |
| **Feeling depressed and hopeless** — PHQ-9 + GAD-2 | depression | 12 | 4-pt | 36 | 9 | 27 | 0–27 matches preset | 2 |

> **[OK] What is currently clean**
>
> All 92 questions carry a `scoring` map; **zero** option/key mismatches, so the adapter's trusted-map lookup cannot silently zero an option. All 7 `assessment:` mirrors match their definitions item for item. All 7 slug indices resolve. `scoring.ranges` is populated on all 7. And every `daily_content` block now carries weights — the 2026-09-01 repair has held.

## 05 · Per-assessment schema
*one envelope · seven scoring specs*

Every assessment in the bank is the **same record shape**. What actually differs between the seven is not structure — it is the scoring spec, and the scoring spec is the one part that does not live in the database at all. This section separates the two: the envelope every instrument shares, then the seven specs that make them different instruments.

### The envelope — identical for all seven

*assessment_def:{id} — the stored record, grouped by what the field is for*

| Field | Type | Present | Read by the player | Note |
|---|---|---|---|---|
| **Identity — 8 fields** | | | | |
| id | text | 7/7 | yes | `asm_<epoch_ms>_<rand9>`. This is what a **result** stores |
| slug | text | 7/7 | dropped | The scoring key. Not copied into the player's assessment object — **this single omission is why no preset runs** |
| title · description · subtitle | text | 7/7 | yes | Header copy on the flow screen |
| category | text | 7/7 | display | Free string, not a catalog reference — see §09 |
| assessment_type · difficulty · duration_minutes | text · text · int | 7/7 | display | Chips on the landing card |
| **The instrument — 2 fields, one of them a duplicate of the other** | | | | |
| questions[] | jsonb array | 7/7 | yes | The live item set. 92 items across the seven |
| daily_content[] | jsonb array | 7/7 | never | The same 92 items rebuilt as blocks by the wizard. Written on every save, read by nothing — see §06 |
| **Scoring — 2 fields, neither authoritative** | | | | |
| scoring | jsonb · null | 0/7 | fallback only | **Null on all seven.** When null the player fabricates a single 0–100 "Completed" band |
| resultCategories[] | jsonb array | 7/7 | never | What the admin wizard's band editor writes. Nothing reads it. The bands users see come from `assessment-section-presets.ts` |
| sections[] | — | 0/7 | would win if present | The per-assessment override the presets file was written to seed. Never authored on any record |
| **Landing page — 21 fields, 26 values byte-identical across all seven (§08)** | | | | |
| section1_* · section2_* · hero_* · notes[] · metadata{} | mixed | 7/7 | landing only | Marketing copy sharing a table with clinical content |

> **[CRITICAL] The envelope has no version field.**
>
> There is nothing on the record that says which item set or which band table a given result was scored against. Balance's questions were replaced wholesale in August; the three Balance results that predate that change sit in the same table as the ones after it, indistinguishable, and cannot be re-interpreted. Every schema below therefore has to be read as **the current schema** — there is no way to recover any earlier one.

### The seven scoring specs

These are the real per-assessment schemas. All seven live in `assessment-section-presets.ts`, keyed by `slug` — and are reachable only through the key the player never supplies.

*SECTION_PRESETS — what each instrument's spec declares*

| Slug | Shape | Sections | Scored items | Calc | Reversal | Offset / × | Range | Bands |
|---|---|---|---|---|---|---|---|---|
| unsure-or-general-concern | **bundle** | 5 | 23 of 24 | sum ×4 · mean | 3 items (BRS) | +1 · ×4 | per section | 4 tables |
| feeling-drained-and-burned-out | **bundle** | 4 | 22 of 23 | mean | none | +1 | 1–5 | 1 shared |
| feeling-overwhelmed-and-anxious | flat | 0 | 7 of 10 | sum | none | — | 0–21 | 4 |
| feeling-depressed-and-hopeless | flat | 0 | 9 of 12 | sum | none | — | 0–27 | 5 |
| feeling-worried-and-stressed | flat | 0 | 7 of 7 | sum | none | — | 0–28 | 3 |
| struggling-with-quality-sleep | flat | 0 | 8 of 8 | sum | none | — | 0–32 | 2 |
| struggling-to-balance-life | flat | 0 | 8 of 8 | sum | **5 items** | — | 0–32 | 3 |

### General — five independent scales, no overall

### unsure-or-general-concern
*GAD-2 · PHQ-2 · WHO-5 · NGSE · BRS · 24 items · 8 results — hasOverallScore: **false***

| Section | Instrument | Items | Calc | Direction | Range | Bands |
|---|---|---|---|---|---|---|
| **Anxiety** | GAD-2 | 2 | sum | higher = distress | 0–6 | 0–2 Minimal · 3–6 Elevated |
| **Depression** | PHQ-2 | 2 | sum | higher = distress | 0–6 | 0–2 Minimal · 3–6 Elevated |
| **Wellbeing** | WHO-5 | 5 | sum × 4 | **higher = better** | 0–100 | 0–28 Poor · 29–50 Below average · 51–100 Good |
| **Self-efficacy** | NGSE | 8 | sum | **higher = better** | 0–32 | no bands declared |
| **Resilience** | BRS | 6 | mean, offset +1 | **higher = better** | 1–5 | 1–2.99 Low · 3–4.3 Normal · 4.31–5 High |
| **Risk indicator** | PHQ-9 item 9 | 1 | flag, never summed | — | — | block-1773736126142 — "better off dead" |

**Unscored: **3** — gen-q2 physical health, gen-q3 mental health, gen-q4 optimism · Overall score: **none, by design** · Stored bands say **New Category 0–10**, three times**

> **[WARNING] Three of General's five scales run the opposite way to the total the database stores.**
>
> Wellbeing, self-efficacy and resilience are all **higher-is-better**. The spec is explicit that General has no overall score. But the result record has only a `score` column, so the player stores a flat sum of all 24 items anyway — and every consumer downstream (§12) reads that number as distress and inverts it. A respondent who is thriving on WHO-5, NGSE and BRS produces a *high* flat sum, which the wellness engine converts to a *low* wellness score. This is the most consequential direction error in the module and it is invisible in the data, because the number is well-formed.

### Burnout — four sub-scales plus an overall

### feeling-drained-and-burned-out
*BAT-23 · 23 items · 5 results — hasOverallScore: **true***

All four sections: **calc mean · offset +1 · higher = distress** · bands **1–2.58 Low · 2.59–3.01 At risk · 3.02–5 High**

| Section | Items in spec | BAT-23 defines | Grouping basis |
|---|---|---|---|
| **Exhaustion** | 6 | 8 | content, not the spec's positional range |
| **Mental distancing** | 6 | 5 | burnout-q2 and q4 sit inside the spec's Exhaustion range but ask distancing questions |
| **Cognitive impairment** | 5 | 5 | matches |
| **Emotional impairment** | 5 | 5 | matches |
| **Overall burnout risk** | 22 | 23 | mean across all core items |

**Unscored: **1** · Stored bands: **0–40** — matches neither the 1–5 mean nor the 0–92 flat sum · Stored `max_score` across 5 results: **100 / 88 / 92** · max_score**

### The five flat instruments

*overallCalc only — zero named sections, so no report card renders even when the preset does run*

| Slug | Scored item ids | Excluded | Bands as specified |
|---|---|---|---|
| feeling-overwhelmed-and-anxious — **GAD-7** | anxiety-q1 … anxiety-q7 | q8 impairment add-on · q9–q10 embedded PHQ-2 | 0–4 Minimal · 5–9 Mild · 10–14 Moderate · 15–21 Severe |
| feeling-depressed-and-hopeless — **PHQ-9** | dep-q1 … dep-q9 | q10 impairment add-on · q11–q12 embedded GAD-2 | 0–4 Minimal · 5–9 Mild · 10–14 Moderate · 15–19 Mod. severe · 20–27 Severe |
| feeling-worried-and-stressed — **PSS-style** | stress-q4 … stress-q10 | none — all 7 scored | 0–7 Low · 8–18 Moderate · 19–28 High |
| struggling-with-quality-sleep — **ISI themes** | sleep-q1 … sleep-q8 | none — all 8 scored | 0–16 Healthy · 17–32 Poor stored copy has these swapped |
| struggling-to-balance-life — **custom** | bal-q1 … bal-q8 — reverse: bal-q1, q3, q4, q5, q7 | none — all 8 scored | 0–10 Balanced · 11–19 Strained · 20–32 Imbalanced |

> **[CRITICAL] The item ids are three incompatible naming schemes, and one of them is a timestamp.**
>
> The specs address items by three different id conventions in the same file: readable per-instrument prefixes (`anxiety-q1`, `dep-q9`, `bal-q7`), a General-specific prefix (`gen-dep-q1`), and raw wizard-generated timestamps (`block-1773736126142`). Nineteen of General's 24 items and 16 of Burnout's 23 are addressed only by timestamp. That is stable — the ids do not change — but it means the risk-indicator item, the one that flags a suicidality response, is identified in code by a millisecond value with a comment next to it. If that block is ever re-created through the wizard it gets a new timestamp and the risk flag silently stops firing.

## 06 · Block mapping per assessment
*92 blocks*

Every assessment carries a parallel `daily_content` array — one day, one block per question — produced by the wizard's `convertQuestionsToDay()` adapter. It is what the admin editor renders. The block shapes it produced are not uniform, and the differences are a fingerprint of which records were edited when.

*daily_content — day type, block shape and scoring, per assessment*

| Assessment | dayType | Block type | Subtype | interaction field | Blocks | Scored |
|---|---|---|---|---|---|---|
| **Feeling worried and stressed** | assessment | exercise | mcq | select-one | 7 | 7 |
| **Unsure or general concern** | assessment | exercise | mcq | select-one | 24 | 24 |
| **Feeling drained and burned out** | assessment | exercise | mcq ×22 — **single-select ×1** | select-one ×22 — **(unset) ×1** | 23 | 23 |
| **Feeling depressed and hopeless** | **lesson** | exercise | single-select | (unset) | 12 | 12 |
| **Feeling overwhelmed and anxious** | **lesson** | exercise | single-select | (unset) | 10 | 10 |
| **Struggling to balance life** | **lesson** | exercise | single-select | (unset) | 8 | 8 |
| **Struggling with quality sleep** | **lesson** | exercise | single-select | (unset) | 8 | 8 |

> **[CRITICAL] The block shape identifies exactly which records went through the wizard.**
>
> Three assessments carry `dayType: "assessment"`, subtype `mcq` and an explicit `interaction: "select-one"`: **Burnout, Stress and General**. Those are the same three whose `daily_content` weights were wiped by the lossy editor and had to be rebuilt by the 2026-09-01 repair. The other four carry `dayType: "lesson"`, subtype `single-select` and no `interaction` — they were seeded and never re-saved.
>
> **`lesson` is not a day type.** It is a *block* type. It matches no entry in `DAY_TYPE_PRESETS`, so `validateBlockForDayType()` returns `{allowed:true}` immediately on those four assessments, skipping even the blocked-list check that still runs elsewhere.

> **[CRITICAL] Burnout's odd block is the orphaned item.**
>
> Twenty-two of Burnout's blocks are `mcq` / `select-one`. Exactly one — `block-1786630300605-1-iuvmg4`, *"I feel a strong aversion towards my job"* — is `single-select` with no interaction. That is independent confirmation it was authored outside the wizard round-trip that shaped the other 22, and it is the same item `BURNOUT_SECTIONS` does not reference. Shown to every user, scored by nothing.

> **[WARNING] Six Anxiety blocks carry a `maxScore` one higher than they can reach.**
>
> Anxiety's items have 4 options and weights `[0,1,2,3]` — a true per-item max of 3. Six of the ten blocks store `scoring.maxScore: 4`; the other four correctly store 3. Nothing reads `maxScore` at score time — the player sums weights — so this changes no result today. It means any builder or tool that trusts the field computes Anxiety's ceiling as 36 instead of 30. Every other assessment is internally consistent.

The shared taxonomy behind these shapes is covered in the Blocks survey; the relevant fact here is that **assessments and equip programs use the same editor and the same block vocabulary** — Assessment imports `DayEditor` (`src/admin/blocks/DayComposer.tsx`, was `EquipDailyEditor`) directly and bridges through `convertQuestionsToDay()`. That reuse is the system working. The divergence above is what happens when only some records pass through it.

## 07 · The content, item by item
*92 items*

Every question as it is stored today, with its option scale and whether the preset counts it. Items marked unscored are rendered to the user and excluded from the score — in most cases correctly, following the published instrument.

### 
*stress · asm_1767129926263_ru3v6dozh — 7 items · all scored · max 28*

**Scale (all items):** 0 - Never · 1 - Almost Never · 2 - Sometimes · 3 - Fairly Often · 4 - Very Often → weights 0–4

| Id | Item | Block |
|---|---|---|
| stress-q4 | How often has stress affected your sleep? | exercise · mcq — select-one |
| stress-q5 | How often has stress affected your focus? | exercise · mcq — select-one |
| stress-q6 | How often have you felt physically tense? | exercise · mcq — select-one |
| stress-q7 | How often have you felt rushed or pressured? | exercise · mcq — select-one |
| stress-q8 | How often have you worried excessively? | exercise · mcq — select-one |
| stress-q9 | How often have you felt emotionally drained? | exercise · mcq — select-one |
| stress-q10 | How often has stress interfered with daily life? | exercise · mcq — select-one |

****Bands** Low 0–7 · Moderate 8–18 · High 19–28 · **Note** ids start at q4 — q1–q3 were truncated fragments, deleted 2026-08-07, never renumbered**

### 
*sleep · asm_1767130007889_mewy939gi — 8 items · all scored · max 32*

**Scales vary per item** — 5 options each, weights 0–4. Best answer always scores 0, so a **low** total means good sleep.

| Id | Item | Options | Block |
|---|---|---|---|
| sleep-q1 | How long does it take you to fall asleep? | 0-15 / 16-30 / 31-45 / 46-60 / Over 60 min | exercise · single-select — **(unset)** |
| sleep-q2 | …if you then wake up during the night … how long are you awake for in total? | same 5 durations | exercise · single-select — **(unset)** |
| sleep-q3 | How many nights a week do you have sleep troubles? | 0-1 / 2 / 3 / 4 / 5-7 | exercise · single-select — **(unset)** |
| sleep-q4 | How would you rate the quality of your sleep? | Very Good / Good / Average / **Pooo** / Very Poor | exercise · single-select — **(unset)** |
| sleep-q5 | Affected your mood, energy, or relationships? | Not at all → Very Much | exercise · single-select — **(unset)** |
| sleep-q6 | Affected your concentration, productivity, or ability to stay awake? | Not at all → Very Much | exercise · single-select — **(unset)** |
| sleep-q7 | Troubled you in general? | Not at all → Very Much | exercise · single-select — **(unset)** |
| sleep-q8 | How often does poor sleep affect your energy? | <1 month → More than 1 year | exercise · single-select — **(unset)** |

****Bands** Healthy 0–16 · Poor 17–32 · the "Pooo" typo is still live — the doc records it as fixed 2026-08-06; it is not**

### 
*GAD-7 · PHQ-2 · asm_1767129765741_wse9aeprv — 10 items · 7 scored · max 21 of 30*

**Scale (all items):** 1 Not at all · 2 Several days · 3 More than half the days · 4 Nearly every day → weights 0–3

| Id | Item | Instrument | Scored | Block |
|---|---|---|---|---|
| anxiety-q1 | Feeling nervous, anxious, or on edge | GAD-7 · 1 | yes | exercise · single-select — **(unset)** |
| anxiety-q2 | Not being able to stop or control worrying | GAD-7 · 2 | yes | exercise · single-select — **(unset)** |
| anxiety-q3 | Worrying too much about different things | GAD-7 · 3 | yes | exercise · single-select — **(unset)** |
| anxiety-q4 | Trouble relaxing | GAD-7 · 4 | yes | exercise · single-select — **(unset)** |
| anxiety-q5 | Being so restless it's hard to sit still | GAD-7 · 5 | yes | exercise · single-select — **(unset)** |
| anxiety-q6 | Becoming easily annoyed or irritable | GAD-7 · 6 | yes | exercise · single-select — **(unset)** |
| anxiety-q7 | Feeling afraid as if something awful might happen | GAD-7 · 7 | yes | exercise · single-select — **(unset)** |
| block-…754599 | How difficult have the above problems made it for you to do your work, take care of things at home, or get along with other people? | impairment add-on | unscored | exercise · single-select — **(unset)** |
| block-…757396 | Little interest or pleasure in doing things | PHQ-2 · 1 | unscored | exercise · single-select — **(unset)** |
| block-…760521 | Feeling down, depressed or hopeless | PHQ-2 · 2 | unscored | exercise · single-select — **(unset)** |

****Bands** Minimal 0–4 · Mild 5–9 · Moderate 10–14 · Severe 15–21 · **Stored results** all carry max_score **30**, not 21 — the flat sum, not GAD-7**

### 
*PHQ-9 · GAD-2 · asm_1767129862254_frzeigbdb — 12 items · 9 scored · max 27 of 36*

**Scale (all items):** 1 Not at all · 2 Several days · 3 More than half the days · 4 Nearly every day → weights 0–3

| Id | Item | Instrument | Scored | Block |
|---|---|---|---|---|
| dep-q1 | Little interest or pleasure in doing things | PHQ-9 · 1 | yes | exercise · single-select — **(unset)** |
| dep-q2 | Feeling down, depressed, or hopeless | PHQ-9 · 2 | yes | exercise · single-select — **(unset)** |
| dep-q3 | Trouble falling or staying asleep | PHQ-9 · 3 | yes | exercise · single-select — **(unset)** |
| dep-q4 | Feeling tired or having little energy | PHQ-9 · 4 | yes | exercise · single-select — **(unset)** |
| dep-q5 | Poor appetite or overeating | PHQ-9 · 5 | yes | exercise · single-select — **(unset)** |
| dep-q6 | Feeling bad about yourself | PHQ-9 · 6 | yes | exercise · single-select — **(unset)** |
| dep-q7 | Trouble concentrating | PHQ-9 · 7 | yes | exercise · single-select — **(unset)** |
| dep-q8 | Moving or speaking slowly / restlessness | PHQ-9 · 8 | yes | exercise · single-select — **(unset)** |
| dep-q9 | Feeling that life is meaningless | PHQ-9 · 9 — **reworded** | yes | exercise · single-select — **(unset)** |
| block-…917458 | How difficult have the above problems made it… | impairment add-on | unscored | exercise · single-select — **(unset)** |
| block-…919689 | Feeling nervous, anxious or on edge | GAD-2 · 1 | unscored | exercise · single-select — **(unset)** |
| block-…921875 | Not being able to stop or control worrying | GAD-2 · 2 | unscored | exercise · single-select — **(unset)** |

****Bands** Minimal 0–4 · Mild 5–9 · Moderate 10–14 · Mod. severe 15–19 · Severe 20–27 · dep-q9 replaces PHQ-9's suicidal-ideation wording — open clinical question**

### 
*mixed-direction · asm_1767130043662_wc4qpivfl — 8 items · 5 reversed · max 32*

**Scale (all items):** 1 Never · 2 Rarely · 3 Sometimes · 4 Often · 5 Very Often → weights 0–4. Positively-worded items are reversed so the total reads as strain.

| Id | Item | Wording | Reversed | Block |
|---|---|---|---|---|
| bal-q1 | I feel I have enough time for myself | positive | yes | exercise · single-select — **(unset)** |
| bal-q2 | My work drains most of my energy | negative | no | exercise · single-select — **(unset)** |
| bal-q3 | I can disconnect from work after hours | positive | yes | exercise · single-select — **(unset)** |
| bal-q4 | I feel supported at work or home | positive | yes | exercise · single-select — **(unset)** |
| bal-q5 | My responsibilities feel manageable | positive | yes | exercise · single-select — **(unset)** |
| bal-q6 | I feel guilty when I take breaks | negative | no | exercise · single-select — **(unset)** |
| bal-q7 | I have time for relationships | positive | yes | exercise · single-select — **(unset)** |
| bal-q8 | I feel constantly "on" | negative | no | exercise · single-select — **(unset)** |

****Bands** Balanced 0–10 · Strained 11–19 · Imbalanced 20–32 · the reversal has never been applied to a stored result — it lives only in the preset**

### 
*BAT · asm_1767129964930_bv8cqgm16 — 23 items live · 22 mapped · 1–5 means*

**Scale (all items):** 1 - Never · 2 - Rarely · 3 - Sometimes · 4 - Often · 5 - Always → weights 0–4, **offset +1** at score time to express the BAT 1–5 mean.

| Id | Item | Block |
|---|---|---|
| burnout-q5 | I feel mentally drained | exercise · mcq — select-one |
| burnout-q6 | I feel physically tired | exercise · mcq — select-one |
| burnout-q7 | I feel unmotivated | exercise · mcq — select-one |
| burnout-q8 | I feel overwhelmed by workload | exercise · mcq — select-one |
| burnout-q9 | I feel under-appreciated | exercise · mcq — select-one |
| burnout-q10 | I feel I need a long break | exercise · mcq — select-one |

| Id | Item | Block |
|---|---|---|
| burnout-q2 | I feel detached from my work | exercise · mcq — select-one |
| burnout-q4 | I feel cynical about responsibilities | exercise · mcq — select-one |
| block-…436410 | At work, I do not think much about what I am doing, and I function on autopilot | exercise · mcq — select-one |
| block-…438342 | **Identical text to the row above.** The preset expects this id to be "I feel a strong aversion towards my job" — its stored text is a copy of the autopilot item, so autopilot is counted twice. | exercise · mcq — select-one |
| block-…440488 | I feel indifferent about my job | exercise · mcq — select-one |
| block-…442601 | I'm cynical about what my work means to others | exercise · mcq — select-one |

| Id | Item | Block |
|---|---|---|
| block-…444594 | At work, I have trouble staying focused | exercise · mcq — select-one |
| block-…446622 | At work I struggle to think clearly | exercise · mcq — select-one |
| block-…448735 | I'm forgetful and distracted at work | exercise · mcq — select-one |
| block-…450593 | When I'm working, I have trouble concentrating | exercise · mcq — select-one |
| block-…452581 | I make mistakes in my work because I have my mind on other things | exercise · mcq — select-one |

| Id | Item | Block |
|---|---|---|
| block-…454685 | At work, I feel unable to control my emotion | exercise · mcq — select-one |
| block-…456837 | I do not recognize myself in the way I react emotionally at work | exercise · mcq — select-one |
| block-…459006 | During my work I become irritable when things don't go my way | exercise · mcq — select-one |
| block-…461022 | I get upset or sad at work without knowing why | exercise · mcq — select-one |
| block-…058231 | At work I may overreact unintentionally | exercise · mcq — select-one |

| Id | Item | Block |
|---|---|---|
| block-1786630300605-1-iuvmg4 | **I feel a strong aversion towards my job.** Authored later under a new id instead of repairing `block-…438342`. `BURNOUT_SECTIONS` does not reference it, and its block shape differs from the other 22. | exercise · single-select — **(unset)** |

****Risk bands** (1–5 mean) Low ≤2.58 · At risk 2.59–3.01 · High ≥3.02 · **Stored bands** 0–12 / 13–25 / 26–40 — a flat scale matching neither the 92-point sum nor the 1–5 mean**

### 
*GAD-2 · PHQ-2 · WHO-5 · NGSE · BRS · asm_1767129718791_zj1t8hx3c — 24 items · 5 scales · no overall score*

**Four different option scales.** GAD-2/PHQ-2 and the risk item use a 4-pt frequency scale (0–3); WHO-5 uses a 6-pt time scale (0–5); NGSE and BRS use 5-pt agreement scales (0–4).

| Id | Item | Block |
|---|---|---|
| gen-q1 | Feeling nervous, anxious or on edge | exercise · mcq — select-one |
| gen-anxiety-q2 | Not being able to stop or control worrying | exercise · mcq — select-one |

| Id | Item | Block |
|---|---|---|
| gen-dep-q1 | Little interest or pleasure in doing things | exercise · mcq — select-one |
| gen-dep-q2 | Feeling down, depressed, or hopeless | exercise · mcq — select-one |

| Id | Item | Block |
|---|---|---|
| block-…128273 | I have felt cheerful in good spirits | exercise · mcq — select-one |
| block-…130158 | I have felt calm and relaxed | exercise · mcq — select-one |
| block-…132052 | I have felt active and vigorous | exercise · mcq — select-one |
| block-…134105 | I woke up feeling fresh and rested | exercise · mcq — select-one |
| block-…136122 | My daily life has been filled with things that interest me | exercise · mcq — select-one |

| Id | Item | Block |
|---|---|---|
| block-…138170 | I am able to achieve most of the goals that I have set for myself | exercise · mcq — select-one |
| block-…140137 | When facing difficult tasks, I am certain that I will accomplish them | exercise · mcq — select-one |
| block-…142436 | In general, I think that I can obtain outcomes that are important to me | exercise · mcq — select-one |
| block-…145417 | I believe I can succeed at almost any endeavour to which I set my mind | exercise · mcq — select-one |
| block-…147587 | I will be able to successfully overcome many challenges | exercise · mcq — select-one |
| block-…149658 | I am confident that I can perform effectively on many different tasks | exercise · mcq — select-one |
| block-…151870 | Compared to other people, I can do most tasks very well | exercise · mcq — select-one |
| block-…154075 | Even when things are tough, I can perform quite well spec assigns this item to Resilience | exercise · mcq — select-one |

| Id | Item | Reversed | Block |
|---|---|---|---|
| block-…156172 | I tend to bounce back quickly after hard times | no | exercise · mcq — select-one |
| block-…158289 | I have a hard time making it through stressful events | yes | exercise · mcq — select-one |
| block-…161020 | It does not take me long to recover from a stressful event | no | exercise · mcq — select-one |
| block-…163250 | It is hard for me to snap back when something hard happens | yes | exercise · mcq — select-one |
| block-…165457 | I usually come through difficult times with little trouble | no | exercise · mcq — select-one |
| block-…175000 | I tend to take a long time to get over set-backs in my life | yes | exercise · mcq — select-one |

| Id | Item | Block |
|---|---|---|
| block-…126142 | Thoughts that you would be better off dead or of hurting yourself in some way | exercise · mcq — select-one |

****Overall score** NIL by design — five independent scales, no meaningful total · stored bands are three identical "New Category" 0–10 placeholders against a 96-point flat scale**

## 08 · What the admin panel feeds
*48 fields · 4 steps*

- **Top-level fields: 48** — per assessment_def record
- **Landing-page copy: 21** — + a 7-key metadata object
- **Byte-identical on all 7: 26** — boilerplate never customised
- **Empty on all 7: 6** — authored fields holding nothing
- **Authored, read by nothing: 3** — main_title · main_content · video_caption

### The four wizard steps

| Step | Fields written | Reaches scoring? |
|---|---|---|
| **1 · Basic Info** | title · description · category · difficulty · duration · filter_type · thumbnail · is_premium · price · published | no |
| **2 · Landing Page** | about_* · main_* · highlights* · notes* · section1_* … section4_* · hero_image · cta_button_* · video_caption · metadata.tile1–5 · metadata.important_note_1–2 | no |
| **3 · Questions** | daily_content[] ⇄ questions[] (text · type · options · required · timeLimit · scoring) | yes — and lossy in production |
| **4 · Scoring & Results** | scoringMethod · resultCategories · scoring_profile_id | partly — see below |

The Scoring step is the one that looks like it governs scoring and mostly doesn't. **resultCategories** is written by the admin and never read by the player; the backend derives `scoring.ranges` from it on save, and that is what the player reads. **scoring_profile_id** is `null` on all seven and there are zero `scoring-profile:` records. And none of it decides the scoped item sets, the reversals or the section structure — those live only in `assessment-section-presets.ts`, which has no admin surface at all.

### Every field, with its live state

*All 48 top-level fields plus the metadata object — distinct values across the 7 assessments*

| Field | Live value / state | Rendered by |
|---|---|---|
| **Identity & configuration — 9 fields** | | |
| title · slug · description | Unique per assessment | Detail · list · flow |
| id · assessment_id | Identical to each other on all 7 | every lookup |
| category | 7 distinct — anxiety, depression, stress, sleep, balance, burnout, general | rules · recommendation |
| difficulty | "beginner" on all 7 | Detail (bento grid) |
| duration | 3 · 4 · 10 minutes | Detail — but the copy says 5 |
| filter_type | "standard" on all 7 — **not a filter_type value** | nothing |
| **Publication — 4 fields** | | |
| published · published_at | true on all 7 | list filter |
| featured | false on all 7 — no assessment is ever featured | list |
| is_premium | present on 1 of 7 (false) | — |
| **Media — 4 fields** | | |
| hero_image · thumbnail | Unique per assessment — Unsplash + signed Storage URLs | Detail · list |
| about_image · section2_image | "" on all 7 | Detail (empty) |
| **Landing copy — 21 fields** | | |
| about_title · about_content | "" on all 7 | Detail (empty section) |
| main_title | "Why take this *{category}* assessment?" — unique per assessment | **nothing** |
| main_content | Identical array on all 7 — "Understand your symptoms", "Get personalized insights", … | **nothing** |
| highlights · notes | [] on all 7 | Detail — heading with no items |
| highlights_title · notes_title | "Assessment Highlights" / "Things to keep in mind" — identical, over empty lists | Detail |
| section1_title · _eligibility_title · _who_title | "How it works" / "What to expect:" / "Who can take this?" — identical on all 7 | Detail bento |
| section1_eligibility_points | Identical on all 7: *Answer honestly · Takes about 5 minutes · Instant results* | Detail bento |
| section1_who_content | Identical: *"This assessment is designed for adults 18+."* | Detail bento |
| section2_title | "What is this assessment?" — identical | Detail bento |
| section2_content | Real copy on 6; Balance holds **"auti fill "** | Detail bento |
| section2_bullets | Unique on 6; **empty on Balance** | Detail bento |
| section3_title · _subtitle · _content | Titles identical; `content` is `[]` on all 7 | Detail — empty section |
| section4_notes_title · section4_notes | Title identical; notes present on 6, **empty on Balance** | Detail bento |
| cta_button_text · cta_button_link | "Take Assessment" on all 7; link `""` on all 7 | Detail |
| video_caption | "" on all 7 | **nothing** |
| **metadata object — 7 keys** | | |
| tile1–tile5_content | Rich HTML, ~4.8–5.1 KB per assessment | Assessments list cards |
| important_note_1 · _2 | Present on 6; **absent on Balance** | Detail bento |
| **Content & scoring — 5 fields** | | |
| questions[] | 92 items across 7 · all `single-choice` · all carry a scoring map | the player |
| daily_content[] | 1 day each · 92 blocks · all scored | the admin editor |
| scoring.ranges | Populated on all 7 (was null on some before the repair) | the player's interpretation |
| resultCategories | Authored; the backend derives `scoring.ranges` from it | nothing directly |
| scoringMethod | "sum" ×6 · "custom" ×1 (General) | the admin form only |

> **[CRITICAL] The landing pages are one template with the nouns swapped.**
>
> **Twenty-six of the 48 fields are byte-identical across all seven assessments.** Every section heading, every eligibility point, the who-can-take-this line, the CTA, the difficulty, the main content list. Six more are empty strings on all seven. Two sections — Highlights and Things to keep in mind — render a heading over an empty array, and a third, "What you'll see," has an empty `content` array on every assessment.
>
> Two of those identical values are wrong for at least some assessments. The eligibility list says **"Takes about 5 minutes"** on all seven, while `duration` is 3, 4 or 10. And `section1_who_content` says **"designed for adults 18+"** on all seven — the only age statement anywhere in the product, sitting in a field with no gate behind it.

> **[CRITICAL] All seven metadata tiles carry chat-UI paste artefacts.**
>
> Every `tile1_content` begins:
>
> ```
> <p data-start="303" data-end="338"><strong data-start="303" data-end="313">Title:</strong> What is this assessment?</p>
> ```
>
> The `data-start`/`data-end` attributes are emitted by an LLM chat interface's copy button; they appear in all seven records, ~5 KB of markup each, ~34 KB total. The literal word **"Title:"** is also in the body — the prompt label was pasted in alongside the answer. This content renders on the public assessment cards.

> **[WARNING] Balance is the incomplete one.**
>
> Alone among the seven it has `section2_content` set to **"auti fill "**, an empty `section2_bullets`, an empty `section4_notes`, and no `important_note_1` or `important_note_2` keys at all. Its landing page renders four sections with headings and no content.

## 09 · Taxonomy & metadata dependencies
*5 catalog types · 3 block vocabularies*

The assessment module draws five vocabularies from the shared `category:` catalog. Two are stored on the record, two feed the engines downstream, and one is being written into the wrong field.

| Metadata type | Rows | Consumed by | Stored on the record as | State |
|---|---|---|---|---|
| category | 19 | AssessmentEditPageWizard · UnifiedBasicInfoForm · AdminAssessmentManager | category | 7 of 19 used, all valid |
| difficulty_level | 3 | UnifiedBasicInfoForm · wizard | difficulty | all 7 are "beginner" |
| assessment_type | 3 | UnifiedBasicInfoForm · AdminAssessmentManager | **filter_type** | written into the wrong field |
| scoring_method | 4 | AdminScoringEngine · wizard | scoringMethod | valid values, read by nothing at score time |
| severity_level | 7 | AdminScoringEngine · RecommendationRulesManager | — not stored on assessments | 7 values · consumers use 3–4 |

> **[CRITICAL] `filter_type` holds an `assessment_type` value on all seven.**
>
> The catalog's `filter_type` vocabulary is `article · audio · course · exercise · guide · podcast · tool · video · workbook` — content formats for the resource library. Its `assessment_type` vocabulary is `clinical · self-reflection · standard`. Every assessment record stores `filter_type: "standard"` — a value that exists only in the other vocabulary.
>
> Nothing reads the field, so nothing breaks today. But it means **no assessment carries a real assessment type**, and any future filter on `filter_type` would match nothing.

> **[WARNING] Severity is three overlapping vocabularies before scoring even starts.**
>
> The catalog holds seven values (`minimal · low · mild · moderate · moderately-severe · high · severe`). The 18 Rule Engine rules use three of them. `severityFromScore()` in the recommendation service emits four — a different four. And the presets' own band labels are a fourth set again (*Minimal, Mild, Moderate, Moderately severe, Severe* for PHQ-9; *Low/Moderate/High Stress* for Stress; *Balanced/Strained/Imbalanced* for Balance). Nothing joins any of them.

Two more catalog types reach assessments indirectly, through the shared block editor: `block_type` (7 rows) and `exercise_subtype` (11 rows) populate the pickers the wizard renders when it converts questions into blocks — see the next section for what actually lands.

## 10 · Spec vs code vs live
*three sources of truth*

The product spec, `assessment-section-presets.ts`, and the database each describe how these instruments score. They agree on five of seven. The two multi-scale instruments diverge — and in both cases the code deviates from the spec **deliberately**, because the spec numbers items by position and position is not stable.

### General questionnaire

| Section | Spec | Code preset | Live | Reading | Block |
|---|---|---|---|---|---|
| **Anxiety** | q1–2 | gen-q1 · gen-anxiety-q2 | 2 items · max 6 | Spec's q2 was *"rate your overall physical health"* — not GAD-2. Deleted 2026-08-07. | exercise · mcq — select-one |
| **Depression** | q3–4 | gen-dep-q1 · gen-dep-q2 | 2 items · max 6 | Spec's q3–4 were *"rate your mental health"* and *"I feel optimistic"* — neither is PHQ-2. Both deleted. | exercise · mcq — select-one |
| **Wellbeing** | q6–10 × 4 | 5 WHO-5 ids · sum · ×4 | raw 25 → 100 | Agreement across all three. | exercise · mcq — select-one |
| **Self-efficacy** | q11–17 · 7 items | 8 NGSE ids | 8 items · max 32 | NGSE is a published 8-item scale. Code follows the instrument. | exercise · mcq — select-one |
| **Resilience** | q18–24 · 7 items | 6 BRS ids · 3 reversed | 6 items | BRS is 6 items. The spec's split at 17/18 pulls NGSE's 8th item into Resilience. | exercise · mcq — select-one |
| **Overall** | NIL | hasOverallScore: false | — | Agreement. | exercise · mcq — select-one |

Two things the spec doesn't mention and the instruments require: the BRS **reverses** three negatively-worded items — without it the halves cancel and every respondent lands mid-scale — and it is reported as a 1–5 mean. The code does both. The spec is silent, not contradictory.

### Burnout

| Section | Spec | Code preset | Live | Reading | Block |
|---|---|---|---|---|---|
| **Exhaustion** | q1–8 ÷ 8 | 6 ids · mean | 6 items exist | Only six exhaustion-content items are in the bank. Reaching BAT-23 means authoring two, not renumbering. | exercise · mcq — select-one |
| **Mental distancing** | q9–13 ÷ 5 | 6 ids · mean | 6 mapped · 1 duplicate | Autopilot counted twice; aversion never counted. | exercise · mcq — select-one |
| **Cognitive impairment** | q14–18 ÷ 5 | 5 ids · mean | 5 items | Agreement. | exercise · mcq — select-one |
| **Emotional impairment** | q19–23 ÷ 5 | 5 ids · mean | 5 items | Agreement. | exercise · mcq — select-one |
| **Overall** | all ÷ 23 | mean of 22 | 23 items | Off by one, for the duplicate/orphan reason above. | exercise · mcq — select-one |

The spec is BAT-23 exactly: 8 + 5 + 5 + 5. The bank holds 23 items but distributed 6 + 6 + 5 + 5, because the preset grouped them by what each question *asks* rather than by stored position. The spec's positional numbering assumes `burnout-q2` and `burnout-q4` — "detached from my work", "cynical about responsibilities" — are Exhaustion items. By content they are Mental distancing.

## 11 · Result output schema
*what a completion emits*

A finished assessment produces exactly one payload, which the server fans out to three keys. Everything any other part of the product knows about a user's mental health comes from this object. It is worth reading closely, because **the two fields that carry the interpretation are the two that are empty.**

### The client payload

`api-client.saveAssessmentResponse()` — eight arguments, POSTed to `/user/assessments`.

*What AssessmentFlow.tsx sends on submit*

| Field | Type | Source | Live state |
|---|---|---|---|
| assessmentId | text | the `asm_…` id, **not the slug** | opaque downstream |
| responses | object | questionId → selected option string | populated |
| status | text | always `'completed'` | 95/95 completed |
| score | int | preset overall if it ran, else flat sum of all items | always the flat sum |
| maxScore | int · null | computed at submit time | **49 of 95** results have none |
| interpretation | text | band label + description | from the fabricated 0–100 band |
| severityHint | text · undefined | optional | rarely set |
| sectionScores | object · undefined | `sectionScores.sectioned ? … : undefined` | **0 of 95** — never once populated |

### The stored record

`assessment-routes.ts` adds four fields and writes the object to three keys.

> **[NOTE] **
>
> ```
> assessment_result:{userId}:{uuid}              ← the record            95 rows
> assessment_result:{userId}:{assessmentId}:latest ← full copy, overwritten  42 rows
> assessment_response_by_user:{userId}:{uuid}    ← {response_id, assessment_id, date}  105 rows
> 
> {
>   id, user_id, assessment_id,
>   score, max_score,            // max_score: null on 49
>   status, interpretation, responses, severity_hint,
>   section_scores,              // data.sectionScores ?? null  → null on 95 of 95
>   completed_at                 // set unconditionally, even for a non-completed status
> }
> ```

- **Result keys: 137** — 95 records + 42 `:latest` duplicates
- **With section breakdown: 0** — of 95 — the field exists and is always null
- **Missing max_score: 49** — 52% — every consumer guesses
- **Orphan index rows: 9** — 105 index rows point at 95 results

> **[CRITICAL] Three writes, no transaction, no foreign key.**
>
> The record, the `:latest` pointer and the index row are three independent `kv.set` calls. Nine index rows already reference results that do not exist. The `:latest` copy is a **full duplicate of the record**, not a pointer, so a result now exists twice with no mechanism keeping the two in step — the same "two representations, one live" pattern that runs through every module in this system.

### What the record does not carry

- **The slug.** Stored `assessment_id` is `asm_1767129926263_ru3v6dozh`. Every scoring and recommendation lookup downstream is keyed on the slug or on a clinical shortname. None of them match — see §12.
- **A version.** Nothing records which item set or band table produced the score. Balance changed under its own results.
- **Per-item weights.** `responses` stores the chosen option *string*. The weight was the array index at scoring time; if an option list is reordered, every historical response silently re-values.
- **The direction.** Nothing on the record says whether a high score is good or bad. Four separate consumers each decide independently, and they do not agree (§12).
- **The breakdown.** `section_scores` is the field designed to carry it. It has never been non-null.

> **[WARNING] max_score is not stable within a single instrument.**
>
> Stress alone has stored three different maxima across its 38 results — **100, 28 and 40**. Burnout has stored **100, 88 and 92**. The number is computed fresh at submit time by whichever fallback happened to fire, so `score / max_score` — the percentage every downstream consumer uses to pick a severity — is not comparable between two results of the same assessment taken a month apart.

## 12 · Engine communication — who reads a result
*4 engines · 3 lookup keys · 0 matches*

A result is the most widely consumed object in the system. Four engines and two screens read it, and **every one of them reads the flat `score` and `max_score`** — because that is all that gets stored. What follows is each handoff, the key it looks up on, and whether that key can ever match.

*[diagram]* **The denominator decides the recommendation.** Because the result carries no slug and no version, every consumer re-derives the maximum from its own ladder, and the ladder's second rung — computing the max from the definition's options — always returns 0, because options are plain strings and the code reads `opt.value ?? opt.score ?? 0`.

### The four engines

*Each engine's lookup key against what a result actually carries*

| Engine | File | Reads | Keys on | Can match? |
|---|---|---|---|---|
| **iKan Wellness Score** — assessments = 40% | ikan-score-routes.ts | score · max_score — latest per assessment_id | KNOWN_MAX_SCORES[id] — HIGHER_IS_BETTER.has(id) — keys: phq9, gad7, who5, burnout… | never — id is `asm_…` |
| **Recommendation engine** — frontend | recommendation-engine.ts | score · max_score | slug.includes('sleep' / 'stress' / 'anxiety' / 'burnout') | never — falls to admin rules or nothing |
| **Recommendation engine** — backend | recommendation-service.ts | score · max_score — assessment_def.category | assessment category, case-insensitive | yes — the one lookup that works |
| **Scoring engine** | via scoring_profile_id | would take a profile id | `scoringProfileId` argument | never passed · zero profiles exist |

> **[CRITICAL] Every result-keyed lookup in the system is keyed on something the result does not store.**
>
> A result stores `assessment_id = "asm_1767129926263_ru3v6dozh"`. The wellness engine looks for `"phq9"`. The recommendation engine looks for a slug containing `"stress"`. The scoring presets are keyed `"feeling-worried-and-stressed"`. These are four names for one instrument and no two of them are the same name. Adding `slug` to the stored result — one field — is what makes three of these four lookups resolvable at all.

### The iKan wellness score, in full

The composite is the single largest consumer of assessment data and the only place a result reaches a number the user sees on the dashboard every day.

*ikan-score-routes.ts — weights redistribute over whichever components have data*

| Component | Base weight | Derived from | Direction handling |
|---|---|---|---|
| **Assessments** | 40 | latest result per assessment type, mean of per-assessment wellness | **100 − (score ÷ max × 100)** for everything not in `HIGHER_IS_BETTER` — and nothing ever is |
| **Programs** | 25 | active / completed / average progress | higher = better |
| **Mood** | 20 | rating wellness + consistency | 1–5 or 1–10 auto-detected |
| **Engagement** | 15 | distinct active days in the last 30 | higher = better |

> **[CRITICAL] The wellness score inverts General, and General is a wellbeing instrument.**
>
> `HIGHER_IS_BETTER` contains exactly `who5` and `who-5`. General's stored id is `asm_1767129718791_zj1t8hx3c`, so the set never matches and the engine applies the standard inversion: **a higher General score becomes a lower wellness score.** But 19 of General's 24 items — WHO-5 wellbeing, NGSE self-efficacy, BRS resilience — score higher when the respondent is doing *better*. The 8 General results in the database are contributing to the wellness composite with the sign flipped.
>
> Two more consequences of the same set being empty: `KNOWN_MAX_SCORES` never resolves either, so a General result with no stored `max_score` falls all the way to the hardcoded **100** — and General's flat max is 96, so a near-maximum answer set reads as 96% distress.

> **[WARNING] The same computation exists in four places with four different fallback ladders.**
>
> `AssessmentFlow` computes a max at submit time. `Dashboard` rebuilds one from the definitions list. `WellnessTimeline` rebuilds another from the same list with its own final fallback of 100. `ikan-score-routes` has a five-rung ladder on the server. All four are trying to answer "what was this out of", none of them can read it off the record, and they disagree. **This is one derived value that belongs in one place** — stored on the result at write time, or computed from a versioned scoring spec.

### What assessments depend on

| Dependency | Module | Nature | State |
|---|---|---|---|
| **The shared block editor** | blocks | The wizard imports `DayEditor` (was `EquipDailyEditor`) and bridges through `convertQuestionsToDay()` | correct reuse |
| **The player and renderer** | blocks | `ProgramPlayer` → `BlockRenderer`, the same chain equip uses | shared end to end |
| **Metadata catalog** | meta | 5 vocabularies — see §09 | 1 written into the wrong field |
| **Scoring engine** | engines | `scoring_profile_id` on the record; `getSeverityFromProfile()` at score time | null on all 7 · zero profiles exist |
| **Equip check-ins** | equip | Writes into `assessment_result:` with synthetic `checkin_*` ids | 25 rows · all score 0 · no definition to resolve |
| **Reassessment triggers** | mood | Reads `completed_at` and mood ratings to prompt a re-test | blind to legacy-schema journal entries |

> **[WARNING] Equip check-ins share the assessment result table and pollute every consumer that does not filter them.**
>
> 25 of the 95 stored results are check-ins written by the equip player under ids like `checkin_equip-sleep-tight-v1_day_7`. All score 0, all have no `max_score`, and none resolve to an assessment definition. Dashboard and the wellness engine each carry their own hand-written filter to exclude them; the filters are not identical. **Two different kinds of thing are sharing one key prefix** — the same defect as §11's `:latest` duplication, one level up.

## 13 · Errors and fallbacks
*16 silent defaults*

Almost nothing in this chain fails loudly. At every stage where a value could be missing there is a default, and most of them produce a plausible number rather than an error. This is the list of what happens instead of breaking — in order of how far the wrong value travels.

*Every fallback in the assessment path, with what it substitutes and what that costs*

| # | Where | Condition | Fallback | Cost | Block |
|---|---|---|---|---|---|
| Load — the definition | exercise · mcq — select-one | — | — | — | — |
| 1 | api-client · getAssessment | Any fetch error | Returns a **24-hour offline cache** copy; rethrows only if no cache exists | The admin editor loads a stale record and PUTs it back on Publish — one admin's day of edits overwritten by another's cache | exercise · mcq — select-one |
| 2 | AssessmentFlow · mappedAssessment | `fetchedAssessment.scoring` absent | `{type:'sum', ranges:[{min:0,max:100,label:'Completed'}]}` | This is where the **max_score 100** values in stored history came from | exercise · mcq — select-one |
| 3 | AssessmentFlow · mappedAssessment | always | `slug` is not copied — the field isn't on the interface | **The preset never resolves.** Every downstream consequence in this module | exercise · mcq — select-one |
| Adapt — questions into blocks | exercise · mcq — select-one | — | — | — | — |
| 4 | assessment-adapter | An option string isn't a key in `q.scoring` | `q.scoring?.[opt] \\|\\| 0` — the option scores **zero** | Silent. A user answering "nearly every day" throughout could score 0 and be told "minimal symptoms". Currently safe: zero mismatches live | exercise · mcq — select-one |
| 5 | assessment-adapter | Option objects carry no numeric `value` | Array index becomes the weight | Correct today only because every stored map is 0-based by position | exercise · mcq — select-one |
| 6 | assessment-adapter | An mcq or multi-select has no options | Subtype silently switches to `ephemeral-journal` — a text box | A scored question becomes an unscored free-text field, with a console warning | exercise · mcq — select-one |
| 7 | resolveInteraction | Unknown subtype | Default branch: `select-one` if options exist, else `write` | Nothing errors; the block renders as whatever the fallback picks | exercise · mcq — select-one |
| Score | exercise · mcq — select-one | — | — | — | — |
| 8 | AssessmentFlow · maxScore | `computedMaxScore === 0` — which is **always**, because it only reads `opt.value` on object options and every option is a string | `ranges[last].max`, then a literal `21` | The stored denominator is a band ceiling, not a real maximum. Source of the 40s and 100s in history | exercise · mcq — select-one |
| 9 | AssessmentFlow · interpretation | No band contains the score | `ranges[0]`, then a literal `{label:'Complete'}` | An out-of-range score silently reports the *first* band — for most instruments, the mildest one | exercise · mcq — select-one |
| 10 | assessment-sections · bandFor | Score above the last band's max | Clamps to the last band | Deliberate and reasonable — but it means Burnout's 0–40 bands silently absorb every score from 41 to 92 | exercise · mcq — select-one |
| 11 | computeSectionScores | No sections and no `overallCalc` (i.e. fallback 3 fired) | Returns `{sectioned:false}`; a console warning added later | The whole preset layer is skipped, and the console warning only exists in the unpushed build | exercise · mcq — select-one |
| 12 | scoreOne | Some items unanswered | Max computed over **all declared** questions, not answered ones | Correct by design — a partial answer scores against the full scale rather than flattering itself | exercise · mcq — select-one |
| Save | exercise · mcq — select-one | — | — | — | — |
| 13 | assessment-routes | `data.sectionScores` undefined | `section_scores: null` | 95 of 95 results. The history screen's report card has nothing to render, forever | exercise · mcq — select-one |
| 14 | useOfflineSync | Offline at completion | Queued — and the sync path destructures a fixed field list, historically dropping `maxScore` and `sectionScores` | Fixed locally, unpushed. The equivalent bug for mood check-ins is still present | exercise · mcq — select-one |
| 15 | useOfflineSync · syncNow | A new item is queued while a sync is running | `saveQueue(failed)` replaces the queue wholesale | A user finishing an assessment during a sync loses it silently. Items past MAX_RETRIES are dropped with a console warning | exercise · mcq — select-one |
| Read back | exercise · mcq — select-one | — | — | — | — |
| 16 | assessment-routes · history | `max_score` missing on a stored result | Recomputes from questions — but only reads `opt.value` on object options, so it resolves to 0 and is not applied | The repair path has the same blind spot as fallback 8 | exercise · mcq — select-one |
| 17 | Dashboard | No max_score resolvable | `\\|\\| r.score \\|\\| 1` — uses the score as its own denominator | Produces 100% rather than an inflated percentage. A console warning fires | exercise · mcq — select-one |
| 18 | AssessmentDetail | Fields missing on the record | `questions?.length \\|\\| 10` · `duration \\|\\| 5` · `difficulty \\|\\| 'Beginner'` | A malformed record still renders a plausible-looking landing page | exercise · mcq — select-one |
| 19 | useMetadata | The catalog fetch throws | Returns `EMPTY_BUCKET` — every vocabulary an empty array | The wizard's category, difficulty and scoring-method dropdowns render **empty**, with no error state | exercise · mcq — select-one |

> **[CRITICAL] The pattern: every fallback returns a plausible number.**
>
> None of these throw. A missing scoring map scores 0. A missing maximum becomes a band ceiling, or 21, or the score itself. An out-of-range score reports the mildest band. A missing preset produces a flat sum that looks like a real result. A missing catalog produces empty dropdowns rather than an error.
>
> That is why the module's central defect — the preset never running — survived from the day it shipped through every completion in the database without anyone noticing. There was never a moment where something looked wrong.

> **[WARNING] Two fallbacks have the same blind spot.**
>
> Both the client's `computedMaxScore` (fallback 8) and the server's history repair (fallback 16) compute a maximum by reading `opt.value` on each option — and every option in this database is a plain string. Both therefore compute **zero** and fall through. The correct maximum is trivially available from the `scoring` map that now exists on all 92 questions; neither path looks at it.

## 14 · What the database actually holds
*5 users · Jan–Sep 2026*

- **Keys under the prefix: 137** — 95 records + 42 `:latest` full duplicates
- **Real completions: 70** — resolve to one of the seven definitions
- **Equip check-ins: 25** — synthetic `checkin_*` ids · every one scores 0
- **With a populated breakdown: 0** — of 95 — `section_scores` null on every row

*Every distinct max_score value stored per instrument — 95 records, :latest duplicates excluded*

| Instrument | Results | Score range | max_score values stored | Preset max | Block |
|---|---|---|---|---|---|
| Feeling worried and stressed | 38 | 0 – 30 | none · 100 · 28 · 40 | 28 | exercise · mcq — select-one |
| Equip check-ins | 25 | 0 – 0 | none | — | exercise · mcq — select-one |
| Struggling with quality sleep | 9 | 0 – 25 | none · 100 · 32 | 32 | exercise · mcq — select-one |
| Unsure or general concern | 8 | 0 – 52 | none · 100 · 96 | no overall | exercise · mcq — select-one |
| Feeling drained and burned out | 5 | 16 – 60 | none · 100 · 88 · 92 | 1–5 mean | exercise · mcq — select-one |
| Feeling overwhelmed and anxious | 5 | 7 – 25 | none · 30 | 21 | exercise · mcq — select-one |
| Struggling to balance life | 3 | 12 – 18 | none · 100 · 32 | 32 | exercise · mcq — select-one |
| Feeling depressed and hopeless | 2 | 10 – 14 | 100 · 36 | 27 | exercise · mcq — select-one |

Three and four denominators for one instrument. The **100** values come from the definition-loader fallback — results saved before `scoring.ranges` was backfilled, when the default `{min:0,max:100}` range stood in. The **40** on Stress is its pre-2026-08-06 band ceiling. Only the last value in each row is today's real maximum, and **49 of the 95 rows carry no maximum at all**. Any percentage, trend or comparison drawn across a user's history is comparing different scales — including the wellness score's assessment lane, which is 40% of the composite.

One stored Stress score is **30** against a true maximum of 28, so at least one result predates the current weights. Burnout's **88** and **92** (22 × 4 and 23 × 4) are consistent with a manual re-score during the 2026-09-01 repair — but no code path I read produces them, and I have not confirmed that.

> **[WARNING] Sample sizes are small enough that this is a design question, not a statistics question.**
>
> Five users produced 70 real completions, 38 of them on one instrument. Depression has two results and Balance three. Nothing here supports a claim about user outcomes, and nothing on this page tries to make one. What the data does establish, and establishes conclusively, is **structural**: the breakdown field has never once been populated, the denominator is unstable within every instrument that has more than two results, and two different kinds of object share one key prefix.

## 15 · Display surfaces — dashboard, history, cumulative
*survey · design deferred*

Six surfaces show assessment output to a user. This section records what each one renders today and from which field, so the display design can be settled later against a known baseline rather than a guess. **Two gaps are structural rather than cosmetic** and are flagged at the end: there is no partial-completion record, and the one component built to show a breakdown can never receive one.

*Every surface that renders assessment data*

| Surface | File | Shows | Reads | State |
|---|---|---|---|---|
| **Results screen** — immediately after finishing | AssessmentResults.tsx | Single score ring, band label, interpretation, recommendation card | in-memory result + `sessionStorage.lastAssessmentResults` | band comes from the fabricated 0–100 range |
| **Section report card** — inside results and history | blocks/SectionReportCard.tsx | Per-scale breakdown — the General and Burnout sub-scale view | sectionScores.sectioned && sections.length ≥ 2 | has never rendered |
| **Dashboard — severity tile** | Dashboard.tsx | "Looking good" / "Needs attention" / "Let's talk about it" + colour | engineResult.severity from the latest non-zero result | 3 tiers from score ÷ guessed max |
| **Dashboard — history list** | Dashboard.tsx | Last 5, each a mini ring with `pct`, name, date, `score/maxScore`, severity pill | latest result per assessment type | pct = 0 when max is unresolved |
| **Assessment history detail** | AssessmentHistoryDetail.tsx | Attempt list, recharts line of raw score over attempts, 2-point trend, HTML export | all results for one assessment_id | plots raw score across changing maxima |
| **iKan score card + timeline** | IkanScoreCard.tsx · WellnessTimeline.tsx | 0–100 ring, ±N this month, component pills; timeline merges assessments, mood, programs, check-ins | ikan_score:{user}:{date} snapshots — **73 stored** | assessment component carries the sign error of §12 |

### Cumulative views — what exists

There are three cumulative mechanisms today, at three different grains, and they do not share a definition of "progress".

- **Per assessment: line chart** — raw score by attempt, in AssessmentHistoryDetail. Trend = latest vs previous, two points only
- **Across assessments: 73** — daily `ikan_score` snapshots — the only true longitudinal series in the product
- **Mixed activity: timeline** — WellnessTimeline interleaves assessments, mood, programs, check-ins as events, not as a series

> **[WARNING] The per-assessment chart plots a number whose scale changes underneath it.**
>
> The line chart uses raw `score`, not a percentage. Stress results carry maxima of 100, 28 and 40 (§11), so a flat line on that chart can represent a user getting materially better or materially worse. Plotting percentage instead would not fix it — the denominator is the thing that moved. Any cumulative view is only as trustworthy as the stored maximum, which is the argument for fixing §11 before designing §15.

### Partial completion — the gap

> **[CRITICAL] There is no in-progress record. "Half an assessment done" cannot be displayed because it is never written.**
>
> The `Assessments` screen has a fully built `'in-progress'` status branch in two places, with its own card treatment. Nothing ever puts a result into that state: `AssessmentFlow` posts once, on submit, always with `status: 'completed'`, and the server stamps `completed_at` unconditionally. All 95 stored results read `completed`. Answers live only in React state until submit — close the tab at question 6 of 24 and everything is gone.
>
> What the display work needs first, in order: **(1)** a draft record written on each answer or on a debounce, keyed per user per assessment version, holding the partial `responses` map and a cursor; **(2)** a real status enum (`draft · in_progress · completed · abandoned`) with `completed_at` set only on completion; **(3)** a resume entry point on the assessment card, which already has its UI. The target schema in §17 provides for this — `assessment_result.status` and a nullable `completed_at` — but it is a behaviour change in the player, not just a column.

> **[CRITICAL] SectionReportCard is finished, correct, and unreachable.**
>
> The component that shows General's five scales and Burnout's four sub-scales exists and is wired into both the results screen and the history detail. Its render gate is `sectionScores.sectioned && sections.length >= 2`. `section_scores` is null on all 95 stored results and `undefined` on every live submit, so the gate has never opened. **This is the clearest single measure of what the missing `slug` costs**: a built feature, a designed screen, and no user has ever seen it.

## 16 · Code surface — every file
*22 files · ~11,400 lines*

Everything that touches an assessment, with what it does and whether it holds logic that ought to be data.

| File | Lines | Role | Note |
|---|---|---|---|
| **Authoring** | | | |
| screens/AssessmentEditPageWizard.tsx | 922 | The 4-step editor; `convertQuestionsToDay()` and `persistWizard()` | lossy in production |
| screens/AdminAssessmentManager.tsx | 334 | Admin list, create, delete | — |
| admin/UnifiedBasicInfoForm.tsx | 235 | Step 1 fields; reads category, difficulty, assessment_type | shared with equip |
| admin/blocks/DayComposer.tsx — was screens/EquipDailyEditor.tsx (967) | 48 | Step 3 — exports `DayEditor`, a thin adapter over `admin/builder/content/ContentScreen.tsx` (634). **Borrowed from the block system**, not an assessment component | shared |
| admin/builder/editor/BlockEditorPane.tsx + BlockFieldSections.tsx — was screens/EquipBlockEditor.tsx (836) | 237 + 510 | Per-block editing inside step 3 | shared |
| **Discovery** | | | |
| screens/Assessments.tsx | 862 | Public list; maps `metadata.tile1–5` onto cards | — |
| screens/AssessmentDetail.tsx | 351 | Public detail page | reads 4 of the 21 landing groups |
| blocks/AssessmentBentoGrid.tsx | 366 | Renders section1–4 and the two important notes | — |
| blocks/AssessmentBlock.tsx · AssessmentHero.tsx | 201 · 6 | Related-assessment rail; hero | — |
| **Delivery & scoring** | | | |
| screens/AssessmentFlow.tsx | 660 | Loads, maps, adapts, hosts the player, scores, saves | the missing slug is here, line 532 |
| player/ProgramPlayer.tsx | 627 | Step navigation; computes `totalScore` as a flat sum | shared with equip |
| player/BlockRenderer.tsx | 999 | Draws each block; switches on `interaction` | shared with equip |
| app/lib/assessment-adapter.ts | 137 | Legacy `questions[]` → `Activity[]` for the player | the `\\|\\| 0` weight fallback lives here |
| lib/assessment-section-presets.ts | 398 | **The scoring authority.** All 7 instruments' scoped item sets, reversals, offsets and bands | content living as code · no admin path |
| app/lib/assessment-sections.ts | 346 | Pure scoring engine — `computeSectionScores`, `resolveAnswerValue`, banding | dependency-free and testable |
| **Results & history** | | | |
| screens/AssessmentResults.tsx | 436 | Score ring, interpretation, recommendation card | gates the report card on `sections.length >= 2` |
| screens/AssessmentHistoryDetail.tsx | 772 | Past results; reads `section_scores ?? sectionScores` | renders nothing — no result has a breakdown |
| blocks/SectionReportCard.tsx | 184 | The per-scale breakdown; second gate at `sections.length === 0` | — |
| **Transport, cache, catalog** | | | |
| shared/api.ts | 1389 | `getAssessment`, `getAssessments`, result save | 24-hour offline cache fallback |
| shared/hooks/useOfflineSync.ts | 251 | Queue, retry, `cacheForOffline` (24 h TTL) | wholesale queue replacement on sync |
| shared/hooks/useMetadata.ts | 242 | All 21 catalog vocabularies | returns empty buckets on failure |
| app/lib/slug.ts | 30 | `slugify`, `assessmentUrl` | the title-fallback depends on it |
| **Server** | | | |
| server/assessment-routes.ts | 212 | Result save and history; derives `scoring.ranges` | `section_scores: data.sectionScores ?? null` |
| server/admin-routes.ts | 1579 | Assessment CRUD, scoring profiles, categories | — |
| server/index.tsx | 4956 | `/api/assessments` list and by-id | — |
| **Downstream** | | | |
| shared/engine/recommendation-engine.ts | 570 | `evaluateAssessment()` — severity, messaging, targeting | hardcoded messaging, no override path |
| server/recommendation-service.ts | 179 | `severityFromScore()` from score ÷ max_score | consumes the unstable denominator |
| server/ikan-score-routes.ts | 445 | Wellness score — assessments lane, 40% | own `KNOWN_MAX_SCORES` table |
| app/lib/reassessment-triggers.ts | 126 | When to prompt a re-test | — |

> **[WARNING] Five of the twenty-two are shared with equip, not owned by assessments.**
>
> `DayEditor` (was `EquipDailyEditor`), the block editor (was `EquipBlockEditor`), `ProgramPlayer`, `BlockRenderer` and `UnifiedBasicInfoForm` are the block system. That is the reuse working — but it means **any change to the block editor changes how assessments are authored**, and the 2026-09-01 scoring wipe reached assessments through exactly that shared path.

## 17 · Target schema — relational, on Supabase
*proposal · nothing migrated*

> **[NOTE] This section is a proposal. Everything above it is description.**
>
> The module lives today in `kv_store_cc205da9` — one table, `key text primary key, value jsonb`, no foreign keys anywhere in the database, RLS enabled with zero policies. Every defect in §10 through §15 is a defect a relational schema makes structurally impossible rather than merely discouraged. What follows is that schema: **16 tables in four groups**, each design decision traceable to a specific finding above. No table has been created and no record changed.

### Six rules the survey earns

- **One representation per fact.** Items exist twice today — `questions[]` and `daily_content[]` — with a lossy converter between them on every save (§07). One `block` table, no mirror.
- **Options are records, not strings.** A weight is a column, never an array index. This is what kills the `\\|\\| 0` silent zero and the reorder hazard in one move.
- **Version anything a result depends on.** Balance's items changed under its own results. Content and scoring get immutable versions; a result names the version it was scored against.
- **Scoring is data.** `assessment-section-presets.ts` is 398 lines of clinical content with no admin path and one key — `slug` — that the player never supplies. Rows, not a file.
- **A result stores what was computed.** Sections, bands and risk flags are persisted, not recomputed by four consumers with four fallback ladders (§12).
- **Page content is not the instrument.** 21 of 48 fields are landing copy, 26 values byte-identical across all seven (§08). Its own table, its own lifecycle.

*[diagram]* **Four groups, one direction of dependency.** Scales are shared and referenced by blocks. Content and scoring are versioned independently — an instrument's items can be corrected without invalidating its band table, and vice versa. A result names both versions plus the `scale_option` row for each answer, so it stays interpretable forever. Two further tables sit outside this core and are listed below: `assessment_page`, which takes the landing copy off the clinical record, and `catalog_term` — the existing metadata catalog, which becomes a real foreign key on `assessment.category_id` rather than a free string.

### Group 1 — Scales

*Solves: the PHQ/GAD scale duplicated 27×, the "Pooo" typo, index-as-weight, the two agreement scales differing by one word (§03)*

| Table | Columns | Keys & constraints | Rows at migration |
|---|---|---|---|
| **scale** | id · key · label · point_count · direction_hint · is_shared · created_at | PK id · UNIQUE key | 12 |
| **scale_option** | id · scale_id · position · label · display_prefix · **weight** · created_at | FK scale_id → scale · UNIQUE(scale_id, position) · weight NOT NULL | 58 |

**Why this is first.** `weight` as a column rather than an array index removes three defects at once: the `q.scoring?.[opt] \\|\\| 0` silent zero in `assessment-adapter.ts`, the reorder hazard on historical responses, and the coincidence that Stress's 0-indexed labels happen to match its weights while every other assessment's are off by one. `display_prefix` separates the digit users see from the value the engine uses.

### Group 2 — Content

*Solves: the questions/daily_content double representation, the un-rescoreable Balance results, category as a free string (§07, §09)*

| Table | Columns | Keys & constraints | Rows at migration |
|---|---|---|---|
| **assessment** | id · **slug** · title · subtitle · description · category_id · type_id · difficulty_id · duration_minutes · published · featured · current_version_id · current_spec_id | PK id · **UNIQUE slug** · FK category_id → catalog_term | 7 |
| **assessment_version** | id · assessment_id · v · label · published_at · **frozen** · created_by | FK assessment_id · UNIQUE(assessment_id, v) · frozen rows reject UPDATE by trigger | 7 |
| **block** | id · version_id · position · block_type · block_subtype · interaction · prompt · help_text · scale_id · required · is_scored | FK version_id · FK scale_id → scale · UNIQUE(version_id, position) | 92 |
| **block_option_override** | id · block_id · scale_option_id · label_override | FK block_id · FK scale_option_id | 0 today |

**One item table, and it is a block table.** This is the point at which "a check-in scale is a type of block" stops being an architectural position and becomes the schema: an assessment item and an equip check-in item are the same row shape in the same table, differing only in `block_type` and which version owns them. It also means the `convertQuestionsToDay()` bridge — the largest single source of data damage in this module — has nothing left to convert.

**`is_scored` is a column, not a code constant.** Today the exclusion of GAD-7's impairment item and the embedded PHQ-2 lives only in a `questionIds` array in a TypeScript file. As a column it is visible to the admin, visible in a query, and travels with the version.

### Group 3 — Scoring

*Solves: SECTION_PRESETS reachable only by a key the player drops, resultCategories written and never read, no admin path to clinical bands (§10, §05)*

| Table | Columns | Keys & constraints | Rows at migration |
|---|---|---|---|
| **scoring_spec** | id · assessment_id · v · has_overall · overall_label · overall_calc · overall_direction · overall_offset · overall_multiplier · frozen | FK assessment_id · UNIQUE(assessment_id, v) | 7 |
| **scoring_section** | id · spec_id · key · label · instrument · position · calc · **direction** · offset · multiplier · expected_items | FK spec_id · UNIQUE(spec_id, key) · calc ∈ (sum, average) · direction ∈ (higher_is_distress, higher_is_better) | 9 |
| **scoring_section_block** | id · section_id · block_id · **reversed** · weight_multiplier | FK section_id · FK block_id · UNIQUE(section_id, block_id) | 76 |
| **scoring_band** | id · spec_id · section_id NULL · min · max · label · description · severity_id | FK spec_id · FK section_id · FK severity_id → catalog_term · CHECK min ≤ max · EXCLUDE overlapping ranges per scope | 28 |
| **risk_indicator** | id · spec_id · block_id · threshold_weight · label · action | FK spec_id · FK block_id | 1 |

**The risk indicator becomes a foreign key.** Today the suicidality flag is identified by the string `'block-1773736126142'` in a TypeScript array, with a comment explaining what it means. As `risk_indicator.block_id` it cannot be silently detached by re-creating the item, and it is the one row in this whole schema that most needs that guarantee.

**`direction` is stored per section, and General is the reason.** Three of General's five scales are higher-is-better, and nothing on the current record says so — which is why the wellness engine inverts them (§12). Making direction a column means a consumer can no longer guess it.

**An EXCLUDE constraint on band ranges** is what makes the Sleep label inversion and the Stress 26–40 unreachable band impossible to author, rather than merely wrong.

### Group 4 — Results

*Solves: null section_scores on 95 of 95, max_score missing on 49, three unsynchronised writes, 9 orphan index rows, no partial state (§11, §15)*

| Table | Columns | Keys & constraints | Rows at migration |
|---|---|---|---|
| **assessment_result** | id · user_id · assessment_id · **version_id** · **spec_id** · **slug** · status · score · max_score · band_id · started_at · completed_at NULL · source | FK user_id → auth.users · FK version_id · FK spec_id · status ∈ (draft, in_progress, completed, abandoned) · CHECK completed_at IS NOT NULL = (status = 'completed') | 70 |
| **result_response** | id · result_id · block_id · **scale_option_id** · free_text · answered_at | FK result_id ON DELETE CASCADE · FK block_id · **FK scale_option_id → scale_option** · UNIQUE(result_id, block_id) | ~1,100 |
| **result_section_score** | id · result_id · section_id · raw · scaled · band_id · item_count · missing_count | FK result_id CASCADE · FK section_id · FK band_id · UNIQUE(result_id, section_id) | 0 → populated on first scored submit |
| **result_risk_flag** | id · result_id · indicator_id · raised · option_weight · acknowledged_at | FK result_id CASCADE · FK indicator_id | 0 |

> **[NOTE] Four columns on `assessment_result` close four separate open defects.**
>
> `slug` — three of the four engine lookups in §12 become resolvable. `version_id` — a Balance result taken before the item change is still interpretable, because the items it was scored against still exist. `spec_id` — `max_score` stops being guessed, because it is derivable from the spec rather than from a five-rung fallback ladder in four different files. `status` with a nullable `completed_at` — the in-progress branch the Assessments screen already renders finally has something to render.
>
> And `result_response.scale_option_id` as a real foreign key is the single highest-leverage line in the schema: it makes the `\\|\\| 0` silent zero unrepresentable. A response either points at a real option with a real weight, or the insert fails.

### Group 5 — Page content

*Solves: 21 of 48 fields being marketing copy on the clinical record, 26 values byte-identical across all seven (§08)*

| Table | Columns | Keys & constraints | Rows |
|---|---|---|---|
| **assessment_page** | id · assessment_id · hero_* · section1_* · section2_* · notes · media · locale · updated_at | FK assessment_id · UNIQUE(assessment_id, locale) | 7 |
| **assessment_page_default** | key · value — the 26 shared strings, referenced not copied | PK key | 26 |

### Row-level security

*The KV table has RLS enabled and zero policies — every read goes through the service key*

| Table group | Read | Write |
|---|---|---|
| scale · assessment · assessment_version · block · scoring_* | `published = true` to authenticated | admin role only |
| assessment_result · result_* | `user_id = auth.uid()` | `user_id = auth.uid()`, insert only; `completed` rows immutable by trigger |
| result_risk_flag | owner + clinical role | system only |

### Migration shape

| # | Step | Reversible | Blocks on |
|---|---|---|---|
| 1 | Create all 16 tables + constraints. Nothing reads them yet | yes | — |
| 2 | Backfill `scale` / `scale_option` from the 12 distinct option sets in §03 | yes | — |
| 3 | Backfill `assessment`, `assessment_version` v1, `block` from `questions[]`. Discard `daily_content[]` | yes | 2 |
| 4 | Transcribe `assessment-section-presets.ts` into `scoring_spec` v1 and children — this is the file becoming data | yes | 3 |
| 5 | Backfill the 70 real results. `version_id` = v1 for all, with a `provenance` note: pre-migration results were not versioned and Balance's three cannot be trusted | lossy by nature | 4 |
| 6 | Dual-write from the edge function; verify parity on live traffic | yes | 5 |
| 7 | Cut reads over. Retire the `:latest` duplicate and the `assessment_response_by_user` index — both become queries | one-way | 6 |
| 8 | Move the 25 equip check-ins out of `assessment_result` into their own table | yes | 7 |

> **[WARNING] Step 5 is where the honest loss is recorded.**
>
> 70 existing results cannot be assigned a real version, because no version was ever recorded. Backfilling them all as v1 is a claim that the current items produced them, and for Balance that claim is false. The migration should mark them, not launder them — a `provenance` column reading `pre_migration_unversioned` keeps the history visible and keeps any future trend chart from silently comparing across a content change.

## 18 · Standing open
*no fixes applied*

- **The preset never runs.** `slug` is not copied into `mappedAssessment`, so no scoped scoring, no reversal, no corrected band and no section breakdown has ever been stored — for any assessment, since the code shipped.
- **The live admin editor still wipes scoring.** Production runs the pre-repair wizard. The hardened version sits unpushed in `5d60a9b3`.
- **Burnout's mental-distancing section double-counts.** `block-…438342` holds a copy of the autopilot item's text; the real aversion item lives under an id the preset doesn't know, and its block shape differs from every other item in the assessment.
- **Burnout's stored bands (0–40) fit nothing** — not the 92-point flat sum, not the 1–5 mean — and the band clamp silently absorbs every score above 40.
- **General has no real bands** — three identical `New Category` 0–10 placeholders against a 96-point scale.
- **Four assessments carry `dayType: "lesson"`**, which is a block type, not a day type. Block validation short-circuits entirely on those records.
- **Six Anxiety blocks store `maxScore: 4`** against 4 options and a real per-item max of 3.
- **`filter_type` holds an `assessment_type` value on all seven.** No assessment carries a real assessment type.
- **26 of 48 landing fields are byte-identical across all seven**, six are empty on all seven, and three (`main_title`, `main_content`, `video_caption`) are authored and read by nothing.
- **Every metadata tile carries LLM chat paste artefacts** — `data-start`/`data-end` attributes and the literal label "Title:" — ~34 KB across the seven, rendering on public cards.
- **Balance's landing page is unfinished** — `section2_content` is **"auti fill "**, and its bullets, notes and both important notes are missing.
- **The eligibility copy says "Takes about 5 minutes" on all seven**, while `duration` is 3, 4 or 10.
- **"Designed for adults 18+" is the only age statement in the product**, and it sits in a landing-page string with no gate behind it.
- **Self-efficacy / resilience boundary.** Spec says 7/7 at q17/q18; the published NGSE and BRS say 8/6. The code follows the instruments; the spec has not been updated.
- **BAT-23 or 22.** Reaching the spec needs two genuine Exhaustion items authored.
- **dep-q9 rewording.** *"Feeling that life is meaningless"* stands in for PHQ-9's suicidal-ideation item. It will under-detect. Whether that was a deliberate safety decision has never been confirmed.
- **sleep-q4's "Pooo" typo is still live.** The assessment doc records it as fixed on 2026-08-06. The database says otherwise.
- **`max_score` is not stable within an instrument** — up to three different denominators per assessment across stored history.
- **Equip check-ins write 25 zero-scored results** into the same prefix as real assessments, with no definition to resolve against.
- **Every result-keyed engine lookup is keyed on a name the result does not store.** A result carries `assessment_id = asm_…`; the wellness engine looks up `phq9`, the recommendation engine looks for a slug containing `stress`, the presets are keyed on the full slug. Four names for one instrument, no two the same.
- **The wellness score inverts General.** `HIGHER_IS_BETTER` holds only `who5`/`who-5` and never matches, so 19 of General's 24 higher-is-better items are being read as distress inside 40% of the composite.
- **An unresolved maximum falls to a hardcoded 100** on the server, because the rung above it reads `opt.value` on options that are plain strings and always returns 0. General's real flat max is 96.
- **Four separate implementations of "what was this out of"** — client, dashboard, timeline, server — each with its own fallback ladder, and they disagree.
- **49 of 95 stored results have no `max_score` at all.**
- **Nine orphan index rows** in `assessment_response_by_user:` point at results that do not exist. Three writes, no transaction, no foreign key.
- **The `:latest` key is a full duplicate of the record, not a pointer** — 42 of them, with nothing keeping the two copies in step.
- **There is no in-progress record.** The Assessments screen renders an `'in-progress'` state that nothing can ever write. Answers live only in React state until submit.
- **`SectionReportCard` is built, wired into two screens, and has never rendered** — its gate is `section_scores`, which is null on all 95 rows.
- **Three independent scoring implementations** — the adapter's weights map, `ProgramPlayer.totalScore`, and `assessment-sections.optionValue()` — agree only because every option is currently a plain string and every weight map is 0-based by position.
- **Nineteen fallbacks, none of which throw.** Every one substitutes a plausible value, which is why the central defect has survived every completion in the database unnoticed.

## 19 · Change brief
*hand this to the implementer*

> **[NOTE] How to read this section.**
>
> Everything above is survey. This is the work order derived from it — ordered by dependency, with the file or record to touch, what to do, and what it costs to get wrong. **Nothing here has been done.** Items marked decision need an answer from the product owner before the code change is meaningful.

### Do first — these block everything downstream

| # | Change | Where | Why it is first |
|---|---|---|---|
| 1 | **Copy `slug` into `mappedAssessment`** and add it to the `Assessment` interface. Keep the `\\|\\| slugify(title)` fallback as a guard, don't rely on it. | AssessmentFlow.tsx — ~line 33 (interface) and ~line 532 (mapping) | One line. Until it lands, no scoped scoring, no reversal, no corrected band and no section breakdown is ever stored — for any assessment. §05, §10, §15. |
| 2 | **Store `slug` on the result record.** Add it to the `saveAssessmentResponse` payload and to the object `assessment-routes.ts` persists. | api-client.ts ~844 — assessment-routes.ts ~99 | Three of the four engine lookups in §12 key on slug or a clinical shortname; a result carries only the `asm_…` id, so none of them can match. This is item 1's counterpart on the write side. |
| 3 | **Deploy the unpushed wizard hardening.** 7 commits are ahead of origin, including `5d60a9b3` (option normalisation both sides, weights carried forward, `weights.length === options.length` guard). | deploy `d2ac376c` | Production still runs the editor that wipes scoring on save. The 2026-09-01 repair is currently protected only by nobody opening the editor. |
| 4 | **Verify the repair has held** before and after deploying. Something reverted repair 2 once, between 05:58 and 10:05 on 2026-09-01, and the cause was never found. | read-only SQL | If it can revert once it can revert again, and item 3 changes the write path. |

### Scoring and engine correctness — after items 1 and 2

| # | Change | Where | Note |
|---|---|---|---|
| 5 | **Compute the maximum from the `scoring` map**, not from `opt.value`. The client's `computedMaxScore`, the server's history repair and `ikan-score-routes.resolveMaxScore` all read `opt.value ?? opt.score ?? 0` on options that are plain strings, so all three resolve to 0 and fall through. | AssessmentFlow.tsx — assessment-routes.ts — ikan-score-routes.ts ~86 | Direct cause of three different `max_score` values per instrument (§11), which drives severity, which drives the recommended program. |
| 6 | **Fix the wellness score's direction handling.** `HIGHER_IS_BETTER` contains only `who5`/`who-5` and is matched against the stored `asm_…` id, so it never fires. General is 19/24 higher-is-better items and is being inverted. | ikan-score-routes.ts ~27 | Read direction from the scoring spec, not a hardcoded set. Interim after item 2: key the set on slug. **8 General results are contributing to the composite with the sign flipped.** |
| 7 | **Rekey `KNOWN_MAX_SCORES`.** Its keys are clinical shortnames (`phq9`, `gad7`); results store `asm_…` ids. No entry has ever matched, so an unresolved max falls to the hardcoded **100**. | ikan-score-routes.ts ~11 | General's flat max is 96, so a near-maximum answer set currently reads as 96% distress. |
| 8 | **Collapse the four max-score ladders into one.** `AssessmentFlow`, `Dashboard`, `WellnessTimeline` and `ikan-score-routes` each re-derive it differently. | 4 files | One derived value, computed once at write time from a versioned spec. §12. |
| 9 | **Don't report `ranges[0]` for an out-of-range score.** The interpretation fallback silently returns the first band, which for most instruments is the mildest. | AssessmentFlow.tsx ~241 | Prefer clamping to the nearest band, or surfacing that the score exceeded the configured scale. |
| 10 | **Stop replacing the sync queue wholesale.** `syncNow` snapshots the queue, awaits per item, then calls `saveQueue(failed)` — erasing anything queued during the sync. | useOfflineSync.ts ~208–225 | A user finishing an assessment while a sync runs loses it silently. |
| 11 | **Give the metadata failure an error state.** `useMetadata` returns empty buckets on a throw, so the wizard's dropdowns render empty with no indication anything failed. | useMetadata.ts ~176 | An admin can save an assessment with no category because the list looked empty. |
| 12 | **Guard the stale-cache write-back.** `getAssessment` silently returns a 24-hour cached copy on any error, and Publish PUTs that object back. | api-client.ts ~883 — AssessmentEditPageWizard.tsx | Admin B with a stale cache clicking Publish overwrites admin A's edits. |

### Data corrections — small, contained, verifiable

| # | Change | Record | Note |
|---|---|---|---|
| 13 | **Resolve Burnout's duplicate.** Either restore `block-…438342`'s text to *"I feel a strong aversion towards my job"* and delete `block-1786630300605-1-iuvmg4`, **or** delete `438342` and add the new id to `BURNOUT_SECTIONS`. | assessment_def: + assessment: mirror — assessment-section-presets.ts | Today autopilot is counted twice and aversion is shown but never scored. The first option keeps the id the preset already knows. |
| 14 | **Set `scoring.maxScore` to 3** on the 6 Anxiety blocks that hold 4. | assessment_def: daily_content | Changes no score today, but any tool that trusts the field computes Anxiety's ceiling as 36 instead of 30. |
| 15 | **Fix "Pooo" → "Poor"** on `sleep-q4` option 4, in both prefixes. | assessment_def: + assessment: | Recorded as fixed on 2026-08-06. It is not. |
| 16 | **Replace Burnout's stored bands.** 0–12 / 13–25 / 26–40 match neither the 92-point flat sum nor the 1–5 BAT mean; the clamp absorbs every score from 41 to 92 into "High Burnout Risk". | assessment_def: resultCategories | Decide whether the stored bands describe the flat sum or are removed in favour of the preset's means. |
| 17 | **Remove or author General's three placeholder bands** (`New Category`, 0–10, ×3, against a 96-point scale). | assessment_def: resultCategories | General has no meaningful overall by design, so removal is defensible — but the flat-sum path currently reads these. |
| 18 | **Move `"standard"` out of `filter_type`** into a real `assessment_type` field on all 7. | assessment_def: | No assessment currently carries a real assessment type. §09. |
| 19 | **Finish Balance's landing page.** `section2_content` is literally `"auti fill "`; bullets, notes and both important notes are empty or absent. | assessment_def: | Live on a public page. |
| 20 | **Strip chat-UI paste artefacts** from all 7 `metadata.tile1–5_content` values — the `data-start`/`data-end` attributes and the literal label `"Title:"`. | assessment_def: metadata | ~34 KB of markup across the seven, rendering on public cards. |
| 21 | **Reconcile the eligibility copy with `duration`.** All 7 say "Takes about 5 minutes"; the field says 3, 4 or 10. | assessment_def: section1_eligibility_points | Either make the copy per-assessment or make it generic. |
| 22 | **Clean up the 9 orphan index rows** in `assessment_response_by_user:` that point at results which do not exist. | read then delete | Symptom of three unsynchronised writes with no transaction. §11. |

### Decisions needed — code can't proceed without an answer

| # | Question | Options | Consequence |
|---|---|---|---|
| 23 | **The 70 existing real results** — re-score from stored responses, or mark as pre-breakdown? | Re-score against the presets · stamp `provenance` and exclude from trends | Until decided, the history report card renders nothing even after item 1 ships. Balance's three cannot be re-scored honestly either way. |
| 24 | **General: NGSE/BRS at 8/6, or the spec's 7/7?** | Keep 8/6 and correct the spec · change the code to 7/7 | Changes every Self-efficacy and Resilience score. The published instruments say 8 and 6. |
| 25 | **Burnout: reach BAT-23, or accept 22?** | Author 2 genuine Exhaustion items · accept 22 and document that scores aren't BAT-comparable | The bank has only six exhaustion-content items; renumbering cannot fix it. |
| 26 | **`dep-q9` wording.** *"Feeling that life is meaningless"* stands in for PHQ-9's suicidal-ideation item. | Restore the standard wording with a crisis-resource trigger · keep the softened version deliberately | The current item will under-detect. Whether the rewrite was a deliberate safety decision has never been confirmed. **Clinical review, not a code change.** |
| 27 | **Does General get an overall score at all?** The spec says no; the record has only a `score` column, so a flat sum of five differently-directed scales is stored anyway and consumed as distress. | Store null and teach consumers to handle it · store a defined composite with an explicit direction | Blocks item 6. §05. |
| 28 | **Equip check-ins in `assessment_result:`** — 25 zero-scored rows with synthetic ids in the same prefix as real results. | Move to their own prefix · give them a definition · leave and keep exempting them | Every orphan check and every history query carries a hand-written exemption, and the exemptions are not identical. |

### Deferred by decision — partial state and display

| # | Work | Depends on | Note |
|---|---|---|---|
| 29 | **Write a draft record so partial completion exists.** Status enum (`draft · in_progress · completed · abandoned`), nullable `completed_at`, a stored `responses` map and a cursor. | §17 schema · player change | The Assessments screen already has a full `'in-progress'` branch that nothing can reach. Answers currently live only in React state — closing the tab at question 6 of 24 loses everything. |
| 30 | **Design the cumulative views.** Three mechanisms exist at three grains and share no definition of progress. | items 5, 8 | Deliberately deferred. Not worth designing on top of a maximum that changes per result — the per-assessment chart currently plots raw score across a moving scale. |
| 31 | **Nothing needed for the section report card.** It is built, wired into two screens, and gated on `section_scores`. | item 1 | It starts rendering the day item 1 ships. No design work required. |

### Then — the schema

Items 1–22 make the current model correct. §17 proposes what replaces it: 16 relational tables on Supabase — one item set stored as blocks, weights on the option row, versioned content and versioned scoring, and results stamped with both. That is a migration with its own design pass, and it should not start until the decisions in 23–28 are answered, because **the migration has to encode them**. Re-scoring the existing results (item 23) is the same job as writing the v1 scoring spec.

> **[CRITICAL] Two ordering constraints worth stating plainly.**
>
> **Items 1 and 2 before anything in the scoring section**, and **item 3 before any admin touches the editor**. Deploying the wizard fix without the slug fixes means correctly-preserved scoring that still never reaches a stored result, and still never reaches an engine. Re-scoring history without them means backfilling data the next completion won't match.

## 20 · Beyond bug-fixing — what to build
*proposal · ranked*

§19 is repair. This is the shorter list of things that would make the module **better** rather than correct — and two of them are already half-built in the database, which is why they lead.

### 1 · Give Depression a risk indicator

> **[CRITICAL] The instrument most likely to surface risk is the one that does not flag.**
>
> `riskIndicatorQuestionIds` is declared on `GENERAL_SECTIONS` and nowhere else. `DEPRESSION_SCORING`, `ANXIETY_SCORING` and the rest have none. So the General questionnaire — 8 stored results — offers the crisis panel, and *Feeling depressed and hopeless* does not.
>
> Compounding it: `dep-q9` is *"Feeling that life is meaningless"*, a softened rewrite of PHQ-9's self-harm item. **It under-detects, and it does not flag.** Two lines of config, plus the wording decision you already hold. Worth also checking whether Anxiety's embedded PHQ-2 (`anxiety-q9` / `q10`) deserves one.

### 2 · Two-stage screening — both halves already exist

> **[NOTE] You have a GAD-2 and a PHQ-2 sitting inside General, copied verbatim from the full instruments.**
>
> `assessment-section-presets.ts` states it outright: `gen-anxiety-q2`, `gen-dep-q1` and `gen-dep-q2` were *copied in verbatim* from the standalone Anxiety and Depression instruments — which hold the full GAD-7 and PHQ-9.
>
> That is the standard two-step screen, in your database, unwired. A positive **GAD-2** routes to the full **GAD-7**; a positive **PHQ-2** to **PHQ-9**. It shortens the funnel for most users, follows clinical convention, and gives General a reason to exist other than being a 24-item wall. **No new content required** — only routing.

### 3 · Partial save and resume

Twenty-four items live in React state. Close the tab at question 6 and everything is gone. The `Assessments` screen already renders an `'in-progress'` card that **nothing can write**, in two places. This is the single largest completion-rate lever available, and the UI half is done.

What it needs: a draft record keyed per user per assessment version, holding the partial `responses` map and a cursor; a real status enum (`draft · in_progress · completed · abandoned`) with `completed_at` set only on completion; and a resume entry point on the card that already exists.

### 4 · The section breakdown — nearly free

> **[NOTE] Built, wired into two screens, and one completion away.**
>
> `SectionReportCard` renders General's five scales and Burnout's four sub-scales. It is imported by the results screen *and* the history screen. Its gate is `sectionScores.sectioned && sections.length >= 2`, and `section_scores` is null on all 95 results — **because no assessment has been completed since the slug fix landed.**
>
> Nothing needs designing. One deliberate completion of General or Burnout on the fixed code is the whole task, and it doubles as the verification that §00's fixes actually work end to end.

### 5 · Trend against last attempt

`AssessmentHistoryDetail` already draws a recharts line — of **raw score**, across maxima that vary within a single instrument (Stress has stored 100, 28 and 40). Now that the denominator is stable, plot percentage or band and the chart becomes true rather than decorative. Two-point trend (`getTrend`) can become a real series.

### 6 · Re-assessment cadence

`lastCompletedDate` is computed and displayed on every assessment card. Nothing ever prompts a re-take. A screening instrument's entire value is repeat measurement, and the live distribution is exactly what that absence produces: **70 completions across 5 users, 38 of them on one instrument** — people who took something once.

### 7 · Result → professional

There are **12 `professional:` records** and nothing routes a high-severity result to booking one. Severity is already computed at submit. If consultations are the revenue path, this is the missing join — and it is a routing rule, not a feature.

### 8 · Norms

"Your score is 12" carries no information for a user. *"12 — moderate. Most people completing this score 8"* does. You do not have the sample for your own norms, but published norms exist for GAD-7, PHQ-9, WHO-5, PSS and the BRS, and the bands are already keyed to those instruments.

> **[WARNING] A constraint, not a task: localisation is a clinical problem here.**
>
> The catalog declares **12 languages** and every instrument is English-only. For validated instruments that is not a translation job — GAD-7 and PHQ-9 have *officially validated* translations, and an unvalidated rendering invalidates the scoring and the bands with it. Worth knowing before anyone scopes localisation as a content task.

> **[CRITICAL] And one thing to argue against: do not add instruments yet.**
>
> Seven is more than enough for five users. Every additional instrument multiplies the scoring, banding, routing and translation work that this module is currently trying to centralise, and none of the seven you have is yet fully wired end to end.

> **[NOTE] If two things get done after §19.**
>
> **Item 1**, because a screener that does not flag on its depression instrument is a safety gap, not a backlog item. And **item 4**, because it is already built, costs one deliberate completion, and proves the whole §00 fix chain works — which nothing has yet.

---

**Status refresh, 2026-09-02.** §00 was added after the survey and every claim in it was checked directly — the code at `340de905` and the live database, not commit messages. Where a fix landed, the section it contradicts is left as written rather than silently edited, so the survey stays readable as an account of how the module reached this state. §20 was added from a separate discussion and is proposal, not survey.

**Method.** Every count, item, option, band, field value and block shape comes from read-only SQL against `kv_store_cc205da9` on 2026-09-02, including a field-by-field distinct-value scan across all seven records to establish which landing copy is shared. Cross-checked against `assessment-section-presets.ts`, `assessment-sections.ts`, `assessment-adapter.ts`, `recommendation-engine.ts`, `ikan-score-routes.ts`, `AssessmentFlow.tsx`, `AssessmentResults.tsx`, `AssessmentHistoryDetail.tsx`, `Dashboard.tsx`, `WellnessTimeline.tsx`, `IkanScoreCard.tsx`, `AssessmentEditPageWizard.tsx`, `ProgramPlayer.tsx`, `useMetadata.ts`, `useOfflineSync.ts`, `api-client.ts` and `assessment-routes.ts` in the local working tree at `d2ac376c` (survey) and `340de905` (refresh). Field-consumer claims are repo-wide greps, not inference from names. No writes were made and nothing was deployed.

**A correction to the earlier version of this page.** It reported **137 stored results**. 137 is the number of *keys* under the `assessment_result:` prefix: **95 records plus 42 `:latest` duplicates**. Of the 95, **70** are real assessment completions and **25** are equip check-ins. Every count on this page now uses 95 / 70 / 25.

**Where this disagrees with the repo docs, this page is the later reading.** `docs/assessments/burnout.md` states 22 items; the database holds 23. `sleep.md` records the "Pooo" typo as fixed; it is not. The assessments README still carries the pre-2026-08-07 counts of 27 / 10 / 23.

**Not verified.** The provenance of Burnout's stored `max_score` values 88 and 92. Whether the 2026-09-01 scoring repair has held since — something reverted part of it once already, between 05:58 and 10:05 that day, and the cause was never found.
