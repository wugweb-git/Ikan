# iKan — module map log

Markdown mirrors of the five module survey artifacts. These are the **working log**: the artifacts are the browsable version, these are the greppable one, and they are what the mapping work reads from.

Generated 2026-09-02 from read-only SQL against `kv_store_cc205da9` (project `jpfvoevxegnknxoqmwye`) and the local working tree at `equip-carry-forward @ 4423f72f`. **No writes were made and nothing was deployed.**

> **Stamp correction, 2026-09-02.** The module artifacts were written against `d2ac376c` and state "7 commits unpushed". The tree has since moved to **`4423f72f`**, pushed to origin at 11:22 IST, **12 commits** ahead of `d2ac376c`. The assessments module's central defect — the preset never running — is **closed on that HEAD** by a `slugify(title)` fallback at `AssessmentFlow.tsx:289`; `mappedAssessment` still does not copy `slug`, so renaming any assessment title silently re-breaks it.

| File | Module | Artifact | State |
|---|---|---|---|
| `assessments.md` | 1 · Assessments | [iKan Assessment Instruments](https://claude.ai/code/artifact/23700259-b08e-4e64-935a-1a53a9e1b458) | 19 sections — full pass complete |
| `equip.md` | 2 · Equip programs | [iKan Equip Programs](https://claude.ai/code/artifact/f79384a2-adce-4011-8c7f-2dbb00831e6d) | survey pass |
| `mood.md` | 3 · Mood journal | [iKan Mood Journal](https://claude.ai/code/artifact/89c27b61-925d-4acc-9ea8-cdb4feee8895) | survey pass |
| `blocks.md` | 4 · Block system | [iKan Blocks & Builders](https://claude.ai/code/artifact/1070a012-f399-46f6-9782-e40d8373f43f) | **15 sections — full pass + block taxonomy reconciliation** |
| `blocks-dependency-map.md` | 4 · Block system | — | **Traced 2026-09-04** — every producer and reader of block shape, and which prefix each writes. Read before any rename or migration |
| `blocks-response-identity.md` | 4 · Block system | — | **Specification, 2026-09-04** — what identifies a response today, why a 31-day diary produces 98 unrelated facts, and what to add. Nothing built |
| `meta.md` | 5 · Metadata catalog | [iKan Metadata Catalog](https://claude.ai/code/artifact/21991ea3-abc9-40a2-85b6-17f1bed76618) | **9 sections — full 21-vocabulary audit** |
| — | 6 · Engines | not started | scoring · rule · recommendation · wellness score |

## The section template

Module 1 established the structure the others are being brought up to:

1. Module flow, end to end
2. The item model — what one unit of content actually is
3. The shared vocabularies (scales, block types)
4. Inventory
5. Per-entity schema
6. Block mapping
7. Content, item by item
8. What the admin panel feeds
9. Taxonomy & metadata dependencies
10. Spec vs code vs live
11. Output schema — what the module emits
12. Engine communication — who reads that output, on which key
13. Errors and fallbacks
14. What the database actually holds
15. Display surfaces
16. Code surface — every file
17. Target schema — relational, on Supabase
18. Standing open
19. Change brief

## Where taxonomy lives

One vocabulary, two owners, no overlap:

- **Blocks & Builders** owns the block half — the six competing vocabularies for the block primitive, the resolver, the 23-string day-presets palette, assessments' legacy question types, and the term-by-term reconciliation against 498 live blocks.
- **Metadata Catalog** owns the registry — all 21 vocabularies, their consumers, and the audit of every term against the records it is meant to describe.

The standalone taxonomy artifact that briefly existed has been folded into both and deleted.

## The pattern that runs through all five

**Two representations of one entity, only one of them live.** It appears in every module surveyed:

- **Assessments** — `questions[]` and `daily_content[]`, with a lossy converter between them on every save. Plus `assessment_result:{uuid}` and a full `:latest` duplicate.
- **Equip** — 223 frozen `block:` rows and 406 embedded `daily_content` blocks. Two copies, different counts.
- **Mood** — two entry schemas, one legacy, both live.
- **Blocks** — a declared taxonomy in code and an undeclared one in the data (`quiz` plus 5 undeclared subtypes).
- **Metadata catalog** — the **only** system with a single representation of itself, and the only one with no data bugs. That is the argument for the whole exercise.

## Standing constraints

- **DEPLOY HOLD active.** No `vercel deploy`, no push to `equip-carry-forward`, no edge-function redeploy.
- **No database writes.** Read-only SQL only.
- Survey first; amendments only after the full picture is in.
- **A check-in scale is a type of block.** Carried through every module map.
