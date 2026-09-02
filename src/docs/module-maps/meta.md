# Twenty-one vocabularies behind one prefix

*Module 5 · read-only survey · live database 2026-09-02*

Every dropdown in this app — topic categories, block types, therapy approaches, severity levels — comes from the same 190 rows under `category:`, separated only by a `type` field. This is the healthiest system in the survey so far. It is also the one whose failure mode has already happened once and is still possible.

`db **jpfvoevxegnknxoqmwye** | branch **equip-carry-forward** @ **d2ac376c** | 190 rows · 21 types · **0 untyped** | seed 187 · live 190`

`metadata-catalog.md` records 225 rows: 203 typed plus 22 untyped legacy records that silently polluted the public Topic Categories dropdown, and 6 rows mistyped into `interaction_type`. **All 28 are gone.** Live: 190 rows, every one typed, zero duplicate slugs within any type, live counts matching the code seed on 19 of 21 types with both differences explained.

What has not changed is the shape underneath. A record with an unrecognised `type` — or none — still falls through into the categories bucket. The fetch still issues a `LIKE` scan with no `ORDER BY` anywhere in the chain, and the de-duplicator still keeps whichever copy arrives first. Today that decides nothing, because nothing collides. The next collision it decides at random.

## 01 · One prefix, one hook, one editor
*how it works*

*[diagram]* **Write path and read path are the same prefix for all 21 types** — confirmed by reading the actual route handlers, not inferred from names. That is what makes this system structurally different from the Mood Journal's dead-prefix bug: there is no second store to drift against. The risk here is ordering and fallthrough, not divergence.

One editor drives all of it — `AdminCategoryManager.tsx`, labelled **Meta Manager** in the sidebar — writing through `POST/PUT/DELETE /admin/categories`, all keyed `category:{id}`. The admin sees the 21 types organised into five domain groups; the code sees one flat prefix.

## 02 · All twenty-one types
*seed · live · who reads it*

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
| block_type | Block Types | 7 | 7 | EquipBlockEditor · EquipDailyEditor · viewer | real |
| interaction_type | Interaction Types | 12 | 12 | AdminBlockTypeViewer only | decorative |
| exercise_subtype | Exercise Subtypes | 11 | 11 | EquipBlockEditor · viewer | real |
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

## 04 · The failure mode, still intact
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

## 05 · Standing open
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

---

**Method.** Per-type counts, slug lists, duplicate checks and key-shape splits come from read-only SQL against `kv_store_cc205da9` on 2026-09-02. Seed counts parsed directly from the `METADATA_CATALOG_ITEMS` array in `metadata-catalog.ts`. Consumer claims are a grep for each of the 21 destructured bucket names across `components/` and `lib/`, excluding the hook that defines them. Route, bucket-map, ordering and de-duplication behaviour read from `index.tsx`, `admin-routes.ts`, `kv_store.tsx` and `useMetadata.ts` at `d2ac376c`. No writes were made.

**Where this differs from the repo docs.** `metadata-catalog.md` records 225 rows — 203 typed plus 22 untyped — and `interaction_type` polluted to 18 with 6 mistyped rows. Live: **190 rows, zero untyped, `interaction_type` at exactly 12.** All 28 problem rows have been removed since that doc was written. The doc's Bug 1 and Bug 2 are closed; its Bug 3 and Bug 4 (the two dead types) are open, and `block-architecture.md`'s reclassification of `interaction_type` and `day_config_type` as also decorative holds.
