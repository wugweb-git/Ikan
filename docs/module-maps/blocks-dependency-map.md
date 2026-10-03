<!-- SOURCE OF TRUTH — traced 2026-09-04. Re-trace before any rename or migration. -->

# Blocks — dependency map

> **The one question this file answers:** *what is the complete set of code paths that can
> produce a block?* The wizard's `FieldType` union was a third writer nobody knew about.
> Assume there is a fourth until this file says otherwise.

A **block** is an entry in `daily_content[].activities[]`, modelled by `interface Activity`
in `src/lib/equip-admin-types.ts:301`. **34 files** touch block concepts (a raw grep says
55; 21 are false positives — `Activity` from `lucide-react`, "activities" in marketing copy,
health-integration "activity").

---

## 1. Where blocks live — four prefixes, and which one users read

| prefix | records | blocks | written by | read by |
|---|---:|---:|---|---|
| `equip:` | 4 | 407 | `program-service.ts:39,87` · `admin-routes.ts:775` (restore) | admin / editor |
| `equip_program:` | 4 | 407 | `program-service.ts:40,88` | **the player** — `index.tsx:1203`, `ikan-score-routes.ts:331`, `reminder-routes.ts:149` |
| `equip_program_by_slug:` | 4 | 223 | Sync Prefixes only, **create-only** | `index.tsx:1206` — **metadata only, never `daily_content`** |
| `assessment_def:` | 7 | 92 | `AssessmentEditPageWizard.tsx:422` | assessment player |

**`program-service.ts:40,88` dual-writes `equip:` and `equip_program:` on every save.**
That is the invariant. **A direct SQL migration is the one path that bypasses it** — which is
how a retype landed on the admin copy only and was invisible to every user for an hour.

> **Rule:** any write to block content writes *both* live prefixes. Replay the transformation
> independently against each; never copy one to the other. Copying is how mirrors drift.

`equip_program_by_slug:` is an older, larger snapshot: it holds **8 tail days / 18 blocks that
exist in no other record**, and disagrees with live on `is_paid`, `price`, `published` and
burnout-reset's title. Its 149 schema-invalid blocks are unreachable **by construction** —
the single reader extracts `id`, `is_paid`, `price`, `title`, `currency` and never touches
`daily_content`. *That guarantee breaks the moment a caller reads content through it.*

---

## 2. Every path that can PRODUCE a block

### Server
| # | site | writes |
|---|---|---|
| W1 | `program-service.ts:39-41` `createEquip` | `equip:` + `equip_program:` + `equip_slug:` |
| W2 | `program-service.ts:87-88` `updateEquip` — **the main content save** | `equip:` + `equip_program:` |
| W3 | `equip-routes.ts:106-147` `POST /equip/programs` | both, plus legacy `day:`/`block:` |
| W4 | `equip-routes.ts:151-172` `PUT /equip/programs/:id` — whole blob verbatim | via W2 |
| W5 | `admin-routes.ts:775` restore-checkpoint | both *(was `equip:` only until 2026-09-04)* |
| W6 | `admin-routes.ts:1538` + `kv-audit-routes.ts:872` Sync Prefixes | `equip_program:` *(refresh since 2026-09-04)* |

### Frontend
| # | site | note |
|---|---|---|
| P1 | `day-presets.ts` `defaultBlocks` ×13 | preset seed content — new ids |
| P2 | `day-presets.ts:474` | block factory |
| P3 | `DayEditor.tsx` add/update/delete/reorder · repeat (**same ids**) · duplicate (**new ids**) | the editor |
| P4 | `BlockEditor.tsx` — 61 `exerciseConfig` refs | per-field editing |
| P5 | `EquipProgramWizard.tsx:277,328,424` `mapQuestionToBlock` | **Day-0 synthesis** |
| P6 | `EquipProgramWizard.tsx:315-343` `persistWizard` | the save reaching W3/W4 |
| P7 | `lib/block-normalise.ts` `normaliseBlock` | raw → `Activity`, **spread-first** |
| P8/P9 | `api-client.ts:435,453` | read-path mappers |
| P10 | `app/lib/assessment-adapter.ts` | assessment → programme, in-memory |
| P11/P12 | `AssessmentEditPageWizard.tsx:51,463` `convertQuestionsToDay` / `convertDayToQuestions` | **the round-trip that flattens 7 types to 4** |
| P13 | `progress-service.ts:377-391` | server today-view mapper, read-derived |

**There is no importer or seeder script.** `scripts/` holds only `typecheck-ratchet.sh`.

**The fourth writer, found:** `components/wizard/types.ts` `FieldType` — 13 values carrying
all five undeclared subtypes. **Deleted 2026-09-04.** It read content and never wrote it, so
it could not re-pollute the catalog.

---

## 3. Who READS block shape

**Render:** `BlockRenderer.tsx:46,932-980` (dispatch on `resolveInteraction`, `default`
warns) · `ProgramPlayer.tsx:209,261-286,316` (steps, carry-forward merge, auto-advance) ·
`EquipProgramFlow.tsx:287`.

**Resolve / validate:** `equip-admin-types.ts:142` `resolveInteraction` · `:104`
`normalizeSubtype` · `:331` `repeatTargetDays` · `day-presets.ts:447`
`validateBlockForDayType` — **zero production callers** · `content-hierarchy.ts:156`
`INTERACTION_REQUIREMENTS` — **imported by the test file only**.

**Map:** `api-client.ts:423-489` · `block-normalise.ts` · `progress-service.ts:286,364,410`.

**Count / report:** `progress-routes.ts:239` · `ikan-score-routes.ts:331` ·
`reminder-routes.ts:149` · `EquipProgramCompletion.tsx` · `ProgramProgressTracker.tsx:27` ·
`Dashboard.tsx:499` · `AdminEquipAnalytics.tsx:35`.

---

## 4. The shapes that bite

- **`activities` vs `blocks`.** Blob days carry `activities`; `blocks` is the retired
  `day:`/`block:` shape. Reading `.blocks` yields `[]` silently.
- **`daily_content[0]` is day 0.** Positional indexing by `dayNum - 1` is off by one on
  every programme. Look days up by `d.day`.
- **A fresh-object mapper is a field-dropper.** `api-client.ts` enumerated eleven fields and
  lost `interaction`, `repeat`, `subtitle`, `data_id` on every load. Spread first, normalise
  second.
- **`exerciseConfig.key`** is on 98 blocks, is **not declared on `ExerciseConfig`**, and is
  **read by nothing**. Answers file under block id.
- **A fallback that always fires is the path.** `index.tsx`'s id lookup never matched because
  the caller passes a slug.

---

## 5. Re-trace checklist

Before a rename or migration, re-run and reconcile against §2:

```
grep -rn "daily_content"                    # every producer and reader
grep -rn "\.activities\b"                   # the live block array
grep -rn "exerciseConfig"                   # the config bag
grep -rn "resolveInteraction("              # 21 call sites, 9 files
grep -rln "equip_program\|equip:"           # prefix writers
```

Then confirm the invariant: **does every content writer write both live prefixes?**
