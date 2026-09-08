# Concurrent session protocol

Two Claude sessions share this working tree and this Supabase project. They are
not isolated by git — one tree, one index, one stash. This file is the ownership
boundary. Read it before writing anything.

Measured 2026-09-08: the two workstreams are 93% disjoint. Two files and one KV
prefix overlap. Everything below exists to protect those three seams.

## Ownership

| | BLOCKS session | ASSESSMENT session |
|---|---|---|
| files | `src/lib/blocks/**`, `src/components/blocks/**`, `src/components/player/**`, `src/docs/module-maps/blocks.md` | `src/components/screens/Assessment*.tsx`, `src/components/screens/Equip{Detail,Programs}.tsx`, `src/components/page-blocks/**`, `src/lib/equip-meta*` |
| KV prefixes | `equip:` `equip_program:` `equip_slug:` `equip_program_by_slug:` `blocks_fallback:` | `assessment_def:` `assessment_slug:` `assessment_draft:` `assessment_response:` `assessment_response_by_user:` `assessment_result:` |
| `category:` rows | `cat-block_type-*` `cat-interaction_type-*` `cat-exercise_subtype-*` `cat-day_config_type-*` `cat-checkin_block_type-*` | `cat-assessment_type-*` `cat-scoring_method-*` `cat-severity_level-*` `cat-ema_category-*` |

Anything not listed is unowned. Claim it in this file before writing it.

## The three seams

**1 · `src/components/screens/AssessmentFlow.tsx`** — assessment-owned. Blocks
touched it only for a repo-wide sweep (the `signOut` scope fix reached every call
site). That is the only legitimate reason to cross.

**2 · `src/lib/equip-meta.ts`** — assessment-owned. Blocks edited it on 09-08 to
narrow two `as any` casts that had pushed lint above baseline. **That was the
violation.** Do not edit another session's file to fix a shared counter. Raise it
and let the owner fix it.

**3 · `.lint-baseline`** — a single mutable number both sessions ratchet. It will
conflict. Until it is split per-directory, only the BLOCKS session lowers it;
the ASSESSMENT session reports a rise rather than editing the file.

## Rules

**Never run bare `git add -A` or `git add .`.** Stage explicit paths, always. On
2026-09-08 a broad `git add -A` swept five of the assessment session's in-flight
files into a blocks commit (`667cba1e`), filed under a message describing
something else. Nothing was lost and the history was not rewritten — rewriting
pushed history is worse than the mislabelling — but the commit is wrong and it
happened two hours after this file was written. This rule was the gap: the stash
hazard was covered, the staging hazard was not.

**Never run bare `git stash`.** It takes the other session's uncommitted work with
it. Always scope it:

```
git stash push -- <your owned paths>
```

This is the single sharpest edge in a shared tree, and the one that loses work
silently.

**Never leave your work dirty.** Commit or scoped-stash before going idle. A file
sitting modified in a shared tree is one careless command from gone.

**Cross-boundary edits** are permitted only for genuine repo-wide sweeps (an auth
scope change, a dependency bump). They commit alone, carry no unrelated work, and
name the sweep in the commit message.

**Before any KV write:** take a fresh backup, state the prefix in the commit
message, and confirm the prefix is yours. Both sessions replay migrations against
production — each verifies its own change, finds it correct, and neither sees the
other's overwrite. Git isolation does nothing about this.

**Dual-write discipline is unchanged.** `equip:` and `equip_program:` are written
together, replayed independently, never copied. `program-service.ts:40,88` does
this on every save; a direct SQL migration is the one path that bypasses it.

**Deploys are serial.** An edge function deploy replaces the whole function. If
the other session has uncommitted server changes, your deploy ships them. Check
`git status` on `src/supabase/functions/**` before deploying.

## When they must overlap

Serialize. Say so, finish, hand over. There is no mechanism here that makes two
agents writing one file safe, and a worktree would not help — the connected
folder is a single mount, and the real exposure is the shared database, not the
shared index.
