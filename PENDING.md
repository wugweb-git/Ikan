# Pending work — iKan Health

Single source of truth for outstanding work across sessions. Update this file whenever you deploy
something that changes what's here — see `GOVERNANCE.md` for the rule.

*Last updated: 2026-08-05, after commit `65cef6ba`.*

---

## A. Blocked on you (external — cannot be done from code)

- **`wrappers_fdw_stats` RLS** → Supabase dashboard → Security Advisor → **"Resolve issue"** button.
  `ALTER TABLE` fails with `42501: must be owner of table` (owner is `supabase_admin`) — confirmed
  empirically, this is not fixable via migration. This is the sole cause of the recurring "Critical
  issue" emails (Jul 20 / Jul 26 / Aug 3 are the same weekly digest re-reporting one finding, not
  three escalating ones).
- **Leaked-password protection** → Supabase → Auth → Providers → enable HaveIBeenPwned check.
- **Assessment content gaps** (blocks sectioned scoring from being fully correct):
  - Depression (PHQ-2) has **zero** mapped questions in the General assessment — the original spec's
    q3–q4 are "rate your mental health" / "I feel optimistic," neither a real PHQ-2 item. Need the
    two actual PHQ-2 items authored: *little interest or pleasure in doing things* and *feeling down,
    depressed, or hopeless*.
  - Anxiety (GAD-2) has only 1 of 2 items — missing *not being able to stop or control worrying*.
  - Burnout has 22 items; BAT-23 defines 23. Confirm whether to author the missing item or treat 22
    as intentional (current code treats 22 as complete and correct).
  - Decide whether `gen-q2`/`gen-q3`/`gen-q4` (physical health, mental health, optimism — currently
    unscored, belong to no section) should form their own section or stay excluded.

## B. Verify on production (needs a human pass, not more code)

Section-scoring UI (`65cef6ba`, deployed) could not be visually verified — the local preview
tooling's shell fails at initialization in this environment, unrelated to the app config. Please
take one **General** and one **Burnout** assessment on production and confirm:
- General shows 5 section rows, no overall total, Depression reads "No questions mapped yet."
- Burnout shows 4 sections + an overall risk band.
- A high WHO-5/resilience score renders as good (green) — colour must be direction-aware, not just
  by raw percentage.

## C. Known data/schema defects — diagnosed, not yet fixed

| Defect | Evidence |
|---|---|
| `category:` CRUD triplicated | `admin-routes.ts` + **two** near-identical blocks in `index.tsx` (~3242 and ~4352); the second is almost certainly dead/shadowed by Hono route-registration order — confirm and remove |
| `PUT /settings` overwrites, `PUT /admin/settings` merges | Calling the wrong one silently wipes unlisted fields. Same key (`settings:site`), two different write semantics. |
| `mood:` prefix collision | Mood *types* are written by both `scales-routes.ts` and a third CRUD block in `index.tsx`; per-user mood *logs* are written by `mood-routes.ts` under the same prefix. A separate `mood_type:` prefix also exists. Three writers, two data shapes, one namespace. |
| `recommendation_rules` (no colon) singleton | Only ever written by backup/restore; vestigial, predates the real `recommendation_rule:{id}` design. |
| 3 of 7 equips lack `equip_program:` user copy | May not surface to users. Run `POST /admin/kv-audit/sync-prefixes`. |
| 105 `day:` + 223 `block:` legacy records | Correctly linked (0 dangling, verified via `equip_id`/`equip_day_id`), but unreferenced by any index — the `idx_equip_days:`/`idx_day_blocks:` prefixes they were meant to populate don't exist and never have. Review under snapshot; do **not** purge without deciding whether to retire them. |
| CMS page CRUD doesn't maintain `page_slug:` | `page_slug:` data was rebuilt this session (7 keys, 0 dangling) but the *save path* still doesn't write it — it will drift again on the next page edit. Same fix pattern already applied to assessments (`admin-routes.ts` ~159–227) needs porting to page CRUD. |
| `equip_slug:` — 1 missing | Not actually a bug: that equip has an empty `slug` field. Needs a slug set in admin, then the index follows automatically. |

## D. Migration — user data out of the KV blob into real tables

**Done:** Phase 1 (5 tables + RLS + backfill, verified by impersonation test) and Phase 2 (journal
dual-write, both write paths covered, 25/25 converged, `useOfflineSync` maxScore bug fixed as a
byproduct).

**Not started:** Phase 3 (cut journal reads over to the table — the dual-read/self-heal groundwork
already exists in `mood-routes.ts`) and Phase 4 (repeat dual-write for the remaining four entities:
`user_enrollments`, `user_program_progress`, `user_assessment_results`, `user_ikan_scores`).

## E. Deferred (no urgency)

- Folder reorg for `src/components/` (flatten/organize by domain) — cosmetic, not blocking anything.
- Media migration to Vercel Blob object storage.
- Rotate `BLOB_READ_WRITE_TOKEN` (was pasted in a chat transcript at some point — treat as
  compromised even though nothing currently depends on it being secret).
- `staging.ikanhealth.in` / `sandbox.ikanhealth.in` — **DNS is done** (A records added, per the domain
  fix this session), confirm both resolve and serve the right Vercel deployment target.

---

## Verified fixed this session (for reference — don't re-investigate these)

- **Orphan detection was wrong in both directions.** It reported 328 real `day:`/`block:` records as
  orphaned (checked for `idx_*` index keys that never existed) while under-reporting real user-data
  orphans 19→1 (checked stale `user:{uid}` KV records instead of `auth.users`). Both fixed in
  `7d604fce` — detector now joins on the actual value fields records carry.
- **Cascading deletes.** Deleting an equip now removes its day/block/progress/enrollment descendants
  instead of leaving them behind (the main source of the orphan accumulation above).
- **`resource:` → `library:resource:` mirror removed.** It was written by delete only, so it always
  held pre-edit snapshots; the sole reader already fell back to `resource:` directly.
- **`professional:`/`consultant:` update+delete gap fixed.** Legacy `consultant:`-only records were
  publicly visible but uneditable and undeletable.
- **Admin Schema & Relations view** added to `AdminKVAudit.tsx` — `GET /admin/kv-schema` existed
  server-side with zero callers; now surfaces live per-relation dangling counts and unregistered
  prefixes in the UI.
- **Enrollment read bug** (`9217213f`) — `GET /user/enrollments` returned `[]` for every user because
  it prefix-scanned a key shape (`enrollment:{userId}:{equipId}`) that was never written; the real
  records use `enrollment:{enrollmentId}`. Predates this session (introduced 2025-12-30), unrelated
  to any purge.
- **Day-advancement bug** (`f6818260`) — same root cause as above; `completeDay`/`saveBlockResponse`
  wrote to the unused key shape, so `current_day_number` was stuck at 1 for every enrollment.
- **Sectioned assessment scoring** shipped for General and Burnout — see §A/§B above for what's still
  open on the content side.

## Prior-session context (Batch 1–6) — condensed

Batches 1–5 covered: content/UX fixes, equip/assessment detail page audit + slug URLs, auth hardening
+ domain sweep + Google Fit sync + edge-fn deploy + DB security, and a full infra/docs/security pass
(GitHub hygiene, Vercel analytics, docs overhaul, Supabase index cleanup — 294 dead indexes dropped).
All items from those batches are complete; see git history (`dc170740` and earlier) for detail if
needed.

Batch 6 (assessment slug breakage after a KV purge, deep Supabase audit) is **fully resolved** —
slug indexes rebuilt, purge tool hardened, icons fixed, error screen redesigned. The two items it
left open (CMS page CRUD slug maintenance, 3 equips missing user copies) are folded into §C above.
