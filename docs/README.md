# src/docs — index

Everything under `docs/` in one place, so nothing from the 2026-08-06/07 data-integrity audit
gets lost or re-derived from scratch. This file is the shortcut — bookmark
`docs/README.md` (or the GitHub path
[`src/docs`](https://github.com/wugweb-git/Ikan/tree/equip-carry-forward/src/docs)) rather than
individual doc links, since new sections keep getting added here.

**Live hosted version of the same material** (interactive, with mermaid diagrams rendered): the
"iKan — Data Schema & Integrity Map" artifact —
`https://claude.ai/code/artifact/56265e75-b364-4179-b016-34b840825ae2`. The artifact and this folder
are kept in sync; if either seems to disagree, the one with the later timestamp is current — check
`git log` for this folder.

## `docs/systems/` — one doc per system, verified against live data

| Doc | Covers | Artifact § |
|---|---|---|
| [`mood-checkin.md`](systems/mood-checkin.md) | Mood Journal, Check-in Scales, Check-in Builder | §05 |
| [`scoring-engine.md`](systems/scoring-engine.md) | Per-assessment severity band profiles | §06 |
| [`rule-engine.md`](systems/rule-engine.md) | Category+severity → equip targeting rules | §07 |
| [`recommendation-engine.md`](systems/recommendation-engine.md) | Backend recommendation evaluation (the 3-bug fix) | §08 |
| [`ikan-wellness-score.md`](systems/ikan-wellness-score.md) | The composite wellness score + v2 proposal sketch | §09 |
| [`metadata-catalog.md`](systems/metadata-catalog.md) | The 21-type admin taxonomy system | §10 |
| [`builder-editor-architecture.md`](systems/builder-editor-architecture.md) | Equip/Assessment/Check-in builders + rendering tier | §11 |
| [`schema-relations.md`](systems/schema-relations.md) | The KV registry, relations, orphans, ghost users, footprint | §12 |
| [`block-architecture.md`](systems/block-architecture.md) | The Block content/interaction primitive, full taxonomy | §13 |
| [`recommendation-frontend-vs-backend.md`](systems/recommendation-frontend-vs-backend.md) | Is `evaluateAssessment()` still needed? | §14 |
| [`resources.md`](systems/resources.md) | The article/resource library | §15 |
| [`health-connect.md`](systems/health-connect.md) | Google Fit / Health Connect integration | §16 |
| [`repo-hygiene-audit.md`](systems/repo-hygiene-audit.md) | Suspect folders, dead code, CMS content bugs | §17 |
| [`user-accounts.md`](systems/user-accounts.md) | User/auth/profile system, incl. 2 fake-feature findings | §18 |

## `docs/equips/` — full verbatim content, all 7 equips ever audited

[`sleep-tight.md`](equips/sleep-tight.md), [`burnout-reset.md`](equips/burnout-reset.md),
[`stress-buster.md`](equips/stress-buster.md), [`productivity-reset.md`](equips/productivity-reset.md)
— the 4 that remain live. [`cognitive-behavioral-therapy.md`](equips/cognitive-behavioral-therapy.md),
[`mindfulness-meditation.md`](equips/mindfulness-meditation.md),
[`_unnamed-73034a14.md`](equips/_unnamed-73034a14.md) — the 3 since deleted, kept as historical
record (each marked "✅ Deleted" at the top).

## `docs/assessments/` — full content + scoring audit, all 7 assessments

[`README.md`](assessments/README.md) is the index for this folder — start there. Covers Anxiety,
Depression, Stress, Sleep, Balance, Burnout, General.

## Root-level guides (not re-audited each session — see each file's own "last updated")

[`ARCHITECTURE.md`](ARCHITECTURE.md), [`BACKEND-GUIDE.md`](BACKEND-GUIDE.md),
[`CONTRIBUTING.md`](CONTRIBUTING.md), [`DEPLOYMENT.md`](DEPLOYMENT.md),
[`GETTING-STARTED.md`](GETTING-STARTED.md), [`PROJECT-STRUCTURE.md`](PROJECT-STRUCTURE.md).

## `docs/archive/`

Point-in-time historical snapshots, intentionally frozen — not updated when the code changes.
`DIVERGENCE-MAP.md` is dated 2026-06-16 and predates several changes documented in `systems/`.

## Root-of-repo docs (outside `docs/`, same audit)

[`CLAUDE.md`](/CLAUDE.md), [`README.md`](/README.md), [`PENDING.md`](/PENDING.md) (what's still
open, kept current per fix), [`CHANGELOG.md`](/CHANGELOG.md) (dated record of what shipped),
[`GOVERNANCE.md`](/GOVERNANCE.md), [`BUILD.md`](/BUILD.md), [`DESIGN.md`](/DESIGN.md),
[`BRAND.md`](/BRAND.md).
