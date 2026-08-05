# GOVERNANCE.md — iKan Health

Process rules for this repo. These exist because specific incidents happened without them — each
rule below traces to something that actually broke.

---

## 1. Every deploy updates the docs

When you ship a change (edge function deploy, frontend deploy, or a Supabase migration that
changes schema/data), update before you consider the work done:

- **`CHANGELOG.md`** — always. One entry, dated, describing what changed and why.
- **`PENDING.md`** — when the change closes or opens an item there. Don't let it silently drift out
  of sync with reality.
- **`CLAUDE.md`** — when the change affects an architectural fact stated there (a new KV prefix, a
  new table, a changed deploy step, a new "don't do X" rule).

A deploy without a changelog entry is not finished.

## 2. Every new KV prefix is registered in the same commit

**This is the rule that exists because of an actual incident.** In July 2026, an admin "purge
orphaned KV" run deleted all 7 `assessment_slug:*` keys and broke every `/assessment/<slug>` URL
site-wide. The cause: that prefix was never added to `KEY_REGISTRY` in
`src/supabase/functions/server/kv-audit-routes.ts`, so the orphan auditor classified it as
uncategorized junk and offered it for deletion.

If you add code that writes a new KV key prefix — anywhere, for any reason — add its
`KEY_REGISTRY` entry in the **same commit**. Not "later," not "in the next cleanup pass." The
registry entry is not documentation, it is the thing that keeps the purge tool from deleting your
data.

The same applies to any new reverse-index prefix (a `{thing}_slug:` or similar lookup key): the
entity's registry entry should declare it via `linkedPrefixes`, and the entity's create/update/delete
handlers must all maintain it. A slug index written by create but not cleaned up by delete, or
maintained by only one of two duplicate CRUD code paths, is exactly the kind of drift that produces
orphans — see `PENDING.md` §C for the current list of prefixes with this problem.

## 3. Relations are checked on value fields, not key structure

The corollary to the incident above, and a second mistake made independently in the same
investigation: this codebase's records relate to each other through fields **inside the value**
(`equip_id`, `category`, `assessment_id`), not through key naming conventions or separate index
tables that may or may not exist. Before writing an orphan check, a cascade-delete, or a migration
that assumes a parent/child relationship, verify the actual field name on a live record — don't
assume it matches what a similar-looking entity uses. (`resource.category` is a plain string, not
`category_id`; `day.equip_id` exists, but the `idx_equip_days:` index some code expected never did.)

## 4. Deploy facts, stated once

Repeated in several places historically; stated here as the authority:

- **Production branch is `equip-carry-forward`, not `main`.** `main` has diverged and is not
  deployed anywhere.
- **Git-pushed builds auto-cancel at the Vercel project level.** Pushing to GitHub does not deploy
  the frontend. The only reliable path is `npx vercel@latest deploy --prod --yes` from a clean
  checkout of the branch you want live.
- **The edge function has no CI/CD.** Deploy it manually via the staging-directory trick in
  `src/supabase/functions/server/CLAUDE.md`, and smoke-test `/health`, `/assessments`,
  `/equip/programs`, `/scales/moods` immediately after every deploy.
- Because of the above two facts, **"committed" does not mean "live."** Check `PENDING.md` and the
  actual Vercel/Supabase deployment state before assuming a fix is in production.

## 5. Don't purge KV without checking the registry and taking a snapshot

If you're using the KV Audit admin screen's purge tools (by-prefix or orphan cleanup): dry-run
first, always. If a prefix shows as "uncategorized," that is a signal to register it, not a green
light to delete it — an uncategorized prefix with live records is exactly the failure mode from
Rule 2. Take a fresh backup snapshot before any bulk delete that isn't purely additive.

## 6. Docs hygiene

- Don't create a new top-level `.md` file for a one-off note — it becomes stale and nobody deletes
  it. Use `PENDING.md` for open work, `CHANGELOG.md` for what shipped.
- When a doc becomes fully superseded (like `src/docs/KNOWN-ISSUES.md` → `CHANGELOG.md`), delete it
  in the same commit as the replacement, and grep for references to the old filename first.
