# docs/ — index

Everything under `docs/` in one place, so nothing from the audits and module surveys gets lost or
re-derived from scratch. This file is the shortcut — bookmark `docs/README.md` (or the GitHub path
[`docs/`](https://github.com/wugweb-git/Ikan/tree/main/docs)) rather than individual doc links,
since new sections keep getting added here.

Most of what's here is a dated reading of the live database and the code at the time. Each doc says
when it was read; if a doc and the code disagree, the code (and `git log` for this folder) wins.

## Root-level guides (not re-audited each session — see each file's own "last updated")

| Doc | Covers |
|---|---|
| [`PROJECT-STRUCTURE.md`](PROJECT-STRUCTURE.md) | The three frontend surfaces, where every folder lives, and the import rules between them |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | How the app fits together, including the design system (was root `DESIGN.md`) |
| [`BACKEND-GUIDE.md`](BACKEND-GUIDE.md) | The Supabase edge function, routes and KV store |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Getting started (was `GETTING-STARTED.md`), branch model, workflow, code conventions |
| [`vocabulary.md`](vocabulary.md) | Blocks module — the list of interactions and activities (2026-09-09) |
| [`iKan-Equip-GOSPEL.md`](iKan-Equip-GOSPEL.md) | The Equip model, single source of truth (v4.0, 2026-09-11) |

Deployment moved into root [`docs/BUILD.md`](BUILD.md) (was `docs/DEPLOYMENT.md`).

## `docs/systems/` — one doc per system, verified against live data

| Doc | Covers |
|---|---|
| [`mood-checkin.md`](systems/mood-checkin.md) | Mood Journal, Check-in Scales, Check-in Builder |
| [`scoring-engine.md`](systems/scoring-engine.md) | Per-assessment severity band profiles |
| [`rule-engine.md`](systems/rule-engine.md) | Category+severity → equip targeting rules |
| [`recommendation-engine.md`](systems/recommendation-engine.md) | Backend recommendation evaluation (the 3-bug fix) |
| [`ikan-wellness-score.md`](systems/ikan-wellness-score.md) | The composite wellness score + v2 proposal sketch |
| [`metadata-catalog.md`](systems/metadata-catalog.md) | The 21-type admin taxonomy system |
| [`builder-editor-architecture.md`](systems/builder-editor-architecture.md) | Equip/Assessment/Check-in builders + rendering tier |
| [`schema-relations.md`](systems/schema-relations.md) | The KV registry, relations, orphans, ghost users, footprint |
| [`block-architecture.md`](systems/block-architecture.md) | The Block content/interaction primitive, full taxonomy |
| [`recommendation-frontend-vs-backend.md`](systems/recommendation-frontend-vs-backend.md) | Is `evaluateAssessment()` still needed? |
| [`resources.md`](systems/resources.md) | The article/resource library |
| [`health-connect.md`](systems/health-connect.md) | Google Fit / Health Connect integration |
| [`user-accounts.md`](systems/user-accounts.md) | User/auth/profile system, incl. 2 fake-feature findings |
| [`url-map.md`](systems/url-map.md) | Every route — public, auth, private, admin |

**Dated audits — history, not updated when the code changes** (notes are added, the body isn't
rewritten):

| Doc | Covers |
|---|---|
| [`repo-hygiene-audit.md`](systems/repo-hygiene-audit.md) | Suspect folders, dead code, CMS content bugs |
| [`assessment-scoring-corruption-2026-08-16.md`](systems/assessment-scoring-corruption-2026-08-16.md) | Assessment scoring/type corruption — found, partly fixed, DB repair pending at the time |
| [`full-audit-2026-09-01.md`](systems/full-audit-2026-09-01.md) | Security, code, accessibility, compliance — full audit of 2026-09-01 |

## `docs/module-maps/` — the 2026-09-02 module survey

Markdown mirrors of the module survey artifacts — the greppable working log. Start at
[`INDEX.md`](module-maps/INDEX.md).

| Doc | Covers |
|---|---|
| [`INDEX.md`](module-maps/INDEX.md) | The log: what was surveyed, against which commit, stamp corrections |
| [`assessments.md`](module-maps/assessments.md) | Module 1 — the seven instruments, their schema, engines and fallbacks |
| [`equip.md`](module-maps/equip.md) | Module 2 — the four programs, the frozen second copy, the progress model |
| [`mood.md`](module-maps/mood.md) | Module 3 — the daily check-in, its three stores and two schemas |
| [`blocks.md`](module-maps/blocks.md) | Module 4 — the Block primitive, its six vocabularies, the blocks that render wrong |
| [`meta.md`](module-maps/meta.md) | Module 5 — the 21 catalog vocabularies |
| [`blocks-dependency-map.md`](module-maps/blocks-dependency-map.md) | Every code path that can produce a block |
| [`blocks-response-identity.md`](module-maps/blocks-response-identity.md) | How a block's response is identified and kept |

[`census/`](module-maps/census/) holds the raw block census CSVs behind `blocks.md`
(`blocks-2026-09-02.csv`, `-post-vocab.csv`, `-post-content-fixes.csv`).

## `docs/assessments/` — full content + scoring audit, all 7 assessments

[`README.md`](assessments/README.md) is the index for this folder — start there. Covers Anxiety,
Depression, Stress, Sleep, Balance, Burnout, General. **Current scoring is
[`INSTRUMENTS.md`](assessments/INSTRUMENTS.md)** (canonical as of 2026-09-03); the per-assessment
files predate the 2026-09-02/03 rescale.

## `docs/equips/` — full verbatim content, the 4 live equips

[`sleep-tight.md`](equips/sleep-tight.md), [`burnout-reset.md`](equips/burnout-reset.md),
[`stress-buster.md`](equips/stress-buster.md), [`productivity-reset.md`](equips/productivity-reset.md).

## `docs/archive/`

Point-in-time historical snapshots, intentionally frozen — not updated when the code changes.
[`DIVERGENCE-MAP.md`](archive/DIVERGENCE-MAP.md) is dated 2026-06-16 (main vs. live, the
source-of-truth decision) and predates several changes documented in `systems/`.

## Root-of-repo docs (outside `docs/`)

- [`CLAUDE.md`](../CLAUDE.md) — agent rules; read first. [`AGENTS.md`](../AGENTS.md) is a pointer to it.
- [`README.md`](../README.md) — the repo front page.
- [`docs/BUILD.md`](BUILD.md) — build and deploy reference.
- [`docs/BRAND.md`](BRAND.md) — brand and content standards.
- [`docs/GOVERNANCE.md`](GOVERNANCE.md) — process rules, each traced to an incident.
- [`docs/PENDING.md`](PENDING.md) — what's still open, kept current per fix.
- [`docs/CHANGELOG.md`](CHANGELOG.md) — dated record of what shipped.
- [`docs/SESSIONS.md`](SESSIONS.md) — concurrent-session protocol: who owns which files and KV prefixes.
