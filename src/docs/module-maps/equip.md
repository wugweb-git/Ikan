# Four programs, two copies of each, and a progress model that disagrees with itself

*Module 2 · read-only survey · live database 2026-09-02*

97 authored days and 406 blocks of real content, sitting alongside a second, frozen copy of the same programs that nothing can read or write any more. Plus the enrollment record that says no user has ever completed a day, and the progress records that say 83 have been.

`db **jpfvoevxegnknxoqmwye** | branch **equip-carry-forward** @ **d2ac376c** | 4 programs · **3 published** | 52 enrollments · 6 users`

Content is authored into an `equip.daily_content[]` blob — 97 days, 406 blocks. A separate `day:` / `block:` record set holds 105 days and 223 blocks for the same four programs. The REST surface that read and wrote those rows was deliberately removed, and both index prefixes it depended on are empty. So they are not a mirror, not a backup, and not stale-but-syncing — they are a frozen snapshot of a previous authoring model that no longer has a door.

## 01 · Where a program's content actually lives
*embedded vs record rows*

*[diagram]* **This is why block counts disagree between documents.** The 2026-09-01 content map reports 223 blocks with none scored; that is the frozen copy. Walking the embedded arrays gives 406 blocks, also none scored. Both readings are correct about their own copy. Only the embedded one is served.

*The same four programs, counted in both representations*

| Program | Embedded days | day: rows | Embedded blocks | block: rows | Divergence |
|---|---|---|---|---|---|
| Productivity Reset | 8 | 8 | 24 | 24 | in step |
| Sleep Tight | 31 | 33 | 155 | 79 | +2 days · −76 blocks |
| Stress Buster | 28 | 31 | 116 | 46 | +3 days · −70 blocks |
| Unburn | 30 | 33 | 111 | 74 | +3 days · −37 blocks |
| **Total** | **97** | **105** | **406** | **223** | — |

Only Productivity Reset — the one program that was never published and never edited after creation — matches across both. The three live programs each carry **more days in the frozen copy and far fewer blocks**, which is the signature of content having been added to the embedded blob after the record-row path stopped being written.

## 02 · The four programs
*as stored*

| Program | Slug | Category | Published | Paid | Price | Days | Blocks | Onboarding Qs | Milestone check-in |
|---|---|---|---|---|---|---|---|---|---|
| **Sleep Tight** | sleep-tight | sleep | yes | no | ₹499 dead value | 31 | 155 | 5 | enabled:false · days 7,14,30 |
| **Unburn** — titled "Unburn", slugged burnout-reset | burnout-reset | burnout | yes | no | ₹499 dead value | 30 | 111 | 5 | key absent |
| **Stress Buster** | stress-buster | stress | yes | no | 0 | 28 | 116 | 5 | key absent |
| **Productivity Reset** | productivity-reset | focus | no | yes | ₹50 | 8 | 24 | 3 | enabled:false · day 6 |

> **[WARNING] No program agrees with itself about how long it is.**
>
> Day 0 is onboarding in every program, so an *n*-day program correctly holds *n*+1 entries — which makes Productivity Reset the only one that adds up. Unburn's description says "30-day", its tile copy says 35 days, the field says 35, the weeks field implies 28, and the content runs 0–30 with day 28 simply missing. Four numbers, none of which is the answer.

Two programs carry `price: 499` with `is_paid: false` — inert, but the value is live in the record and one wrong toggle from being charged. Productivity Reset is the reverse: genuinely paid at ₹50 and unpublished, so nobody can reach it. And the payment integration it would need is real, complete Razorpay code with **zero importers** anywhere in the app.

## 03 · Day structure and repetition
*97 days*

- **Authored days: 97** — including 4 onboarding days
- **Distinct dayType values: 2** — of 10 available presets
- **Days duplicating another's content: 16** — by title + block text
- **Days carrying a build instruction: 13** — all Sleep Tight, days 18–30

### Sleep Tight — 31 days

### Unburn — 30 days, one gap

> **[CRITICAL] Two of ten day presets are used, and one of the two isn't a preset.**
>
> Every one of the 97 authored days carries a `dayType`, but only two distinct values appear: `learning` on 93 days, and `lesson` on 4 (all in Unburn). **`lesson` is not a day type** — it is a *block* type. It matches no entry in `DAY_TYPE_PRESETS`, so `validateBlockForDayType()` returns `{allowed:true}` immediately on those four days, skipping even the blocked-list check that does still run elsewhere.
>
> The presets built for this content — `practice`, `tracker`, `reflection`, `workshop`, `check-in`, `rest`, `quiz` — have never been assigned to a single day, despite the content clearly being tracker days and reflection days.

> **[CRITICAL] 13 days render an instruction to the developer as user-facing content.**
>
> Sleep Tight days 18 through 30 carry the string *"Show all activities from day 17 and 18 and get the user to tick them off."* — on day 18 as a `structured-list` item, and on days 19–30 as the **column header of an input table**. The user sees it as the label above the cells they're meant to fill in.
>
> The earlier doc recorded this as twelve days of duplicated filler. It is thirteen days, and it is not filler — it is a brief that was pasted into the content field and shipped. Sleep Tight was last updated 2026-08-31; this survived that edit.

Sixteen days across three programs hold block content byte-identical to another day in the same program — twelve in Sleep Tight, three in Stress Buster, one in Unburn. The naming makes the mechanism plain: `Tracking Patterns (Continued)` ×6, `Rituals in Action (Continued)` ×4, `Journalling (Continued)`, and one `Journalling (ontinued)` with the C missing. This is copy-paste authoring — and `ActivityRepeat`, the feature built specifically so a block can appear across days without being duplicated, is used by zero of the 406 blocks.

## 04 · Onboarding — a consent model nobody reads
*18 questions*

Each program opens with an onboarding set stored on the record: 5 questions for the three long programs, 3 for Productivity Reset. The schema behind them is the most carefully designed thing in this module.

*onboarding_questions[] — every field on every question*

| Field | Purpose | Read by the screen that collects the answer? |
|---|---|---|
| id · question · type · options · required · helper_text | The question itself | yes |
| privacy_level | How sensitive this answer is | no |
| storage_scope | Where the answer may be stored | no |
| editable_later | Whether the user may change it afterwards | no |
| allow_skip | Whether the question can be passed | no |
| allow_prefer_not_to_answer | Whether "prefer not to say" is offered | no |

> **[CRITICAL] Five consent fields are authored in the admin and enforced nowhere.**
>
> A repo-wide grep for each of those five names returns exactly two files: `EquipProgramWizard.tsx`, where an admin sets them, and `equip-admin-types.ts`, where they are declared. `EquipProgramOnboarding.tsx` — the screen that actually asks the questions and writes `onboardingData` onto the enrollment — reads none of them.
>
> This matters more than a dead field usually would, because of what the questions ask. Stress Buster and Unburn both open with **Occupation**, **Therapy History**, **Pre-existing Conditions** and **Condition Details**. Health and treatment history are being collected against a privacy model that exists only as decoration, and stored on the enrollment record in plain form.

## 05 · Two progress models, both live, permanently disagreeing
*52 vs 84*

- **enrollment: rows: 52** — 6 users · one per user+program
- **…with currentDay ≠ 1: 0** — every single one says day 1
- **…with any completedDays: 0** — the array is empty on all 52
- **progress: rows: 84** — one per user+program+day
- **…marked completed: 83** — with real block_responses

*The two records, side by side*

| — | enrollment:{enrollmentId} | progress:{…} |
|---|---|---|
| **Grain** | one per user + program | one per user + program + **day** |
| **Fields** | userId · programId · programTitle · status · currentDay · completedDays[] · progress · onboardingData · startDate | user_id · equip_id · day_number · completed · completed_at · last_updated · block_responses{} |
| **Field casing** | camelCase | snake_case |
| **Says about progress** | nobody has completed anything, ever | 83 days completed across 5 users |
| **Holds the answers** | onboarding only | **yes** — `block_responses`, keyed by block id, on all 84 |

`progress:` is the real record. `enrollment:` is written once at signup and never updated — which is why all 52 rows still read `currentDay: 1` with an empty `completedDays`. Anything reading enrollment alone for completion state is wrong by construction, and there is a third prefix, `user_enrollment:`, holding 10 rows as a narrower legacy mirror of the same thing.

> **[WARNING] `block_responses` stores two different shapes under the same key.**
>
> Values are keyed by block id, but a value is sometimes a plain string and sometimes an array of `{Question, Response}` objects — the question text copied in alongside the answer, so a table block's response carries its own labels. Nothing declares which shape a given block produces; a reader has to type-check per entry.
>
> Worth naming plainly: the responses that exist are test data. A representative Sleep Tight day-1 record answers all ten sleep-diary questions with the single character `"."`.

## 06 · Every prefix this module touches
*live counts*

| Prefix | Rows | What it holds | State |
|---|---|---|---|
| equip:{id} | 4 | The program, with all content embedded | canonical |
| equip_slug:{slug} | 4 | Reverse index for /equip/<slug> URLs | 1:1, purge-protected |
| equip_program:{id} | 4 | Admin-facing mirror | byte-identical to equip: on all 4 |
| equip_program_by_slug: | 4 | Mirror's slug index | in step |
| progress:{…} | 84 | Per-day completion and block responses | the real progress record |
| enrollment:{enrollmentId} | 52 | Signup record + onboarding answers | never updated after creation |
| user_enrollment:{…} | 10 | Narrower legacy mirror of enrollment | partial, stale |
| day:{id} | 105 | Days, from the removed REST model | frozen · unreachable |
| block:{id} | 223 | Blocks, from the removed REST model | frozen · unreachable |
| idx_equip_days: | 0 | Index the day model depended on | never written |
| idx_day_blocks: | 0 | Index the block model depended on | never written |
| week: | 0 | Weekly grouping | registered, unused |
| program-progress: | 0 | Hyphen-legacy progress mirror | empty — any row here is a regression |

Two shadow Postgres tables sit alongside these — `user_enrollments` and `user_program_progress` — each carrying a `kv_key` back-reference to its source row. Neither is a live read path; KV remains authoritative until an explicit cutover.

## 07 · Standing open
*no fixes applied*

- **Every program exists twice.** 105 `day:` and 223 `block:` rows hold a frozen, divergent copy of content that also lives embedded in the equip record. No route can read or write them; both indices they depend on are empty. They are neither backup nor mirror.
- **Enrollment never reflects progress.** All 52 rows read `currentDay: 1` with an empty `completedDays`, while 83 `progress:` rows record completed days. Anything reading enrollment for completion state is wrong.
- **A third enrollment shape exists** — `user_enrollment:`, 10 rows, a narrower legacy mirror that is itself stale.
- **Five consent fields per onboarding question are authored and enforced nowhere** — including on questions that ask for therapy history and pre-existing conditions.
- **13 Sleep Tight days show a build instruction to the user**, twelve of them as an input-table column header. Still live after the 2026-08-31 edit.
- **16 days duplicate another day's content**, while `ActivityRepeat` — built to prevent exactly that — is used by 0 of 406 blocks.
- **Unburn is missing day 28** and carries four different answers to how long it is.
- **Only two dayType values are in use, and one of them isn't a day type.** `lesson` matches no preset, so validation short-circuits on those four days. Seven presets have never been assigned to anything.
- **Two programs carry ₹499 with `is_paid: false`**; the one program that is genuinely paid is unpublished, and the Razorpay integration has zero importers.
- **Unburn's title and slug disagree** — titled "Unburn", reachable at `/equip/burnout-reset`. Not a bug, but every doc, rule and recommendation refers to it by one name or the other inconsistently.
- **`block_responses` holds two value shapes** under the same key type — a bare string, or an array of `{Question, Response}` pairs.
- **There is no organic usage.** 6 users, all internal, and stored responses like `"."` repeated through a ten-question sleep diary. Treat all four programs as unlaunched despite three being published.

---

**Method.** Every count comes from read-only SQL against `kv_store_cc205da9` on 2026-09-02: prefix counts, per-program day and block walks, an md5 of each day's block titles and content to detect duplication, and a field-level scan for placeholder and build-instruction strings. Route and service behaviour read from `equip-routes.ts`, `program-service.ts`, `progress-service.ts`, `ProgramPlayer.tsx` and `EquipProgramOnboarding.tsx` at `d2ac376c`. Consent-field consumers established by repo-wide grep. No writes were made.

**Where this differs from the repo docs.** `repo-hygiene-audit.md` records Sleep Tight as having 16 of 31 days byte-identical; the live figure is 12 days duplicating another day's content, and 13 carrying the build instruction. Enrollments are 52, not the 24 recorded earlier. The 2026-09-01 content map's 223 blocks is a correct count of the frozen `block:` copy, not of what the player serves.

**Not established.** Why the frozen copy holds more days but fewer blocks than the embedded one, and whether any of its content is material the embedded copy has since lost.
