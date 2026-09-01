# iKan — handoff brief for Claude Code (local)

**Revision 2 — 2026-09-01 06:05.** The scoring repair described in revision 1 has since been RUN and is complete. Two new issues came out of it. Read the changes at the top before working.

Paste everything below this line into Claude Code, running in `/Users/abcom/Documents/GitHub/ikan`.

---

You are picking up work on **iKan Health** (`/Users/abcom/Documents/GitHub/ikan`, branch `equip-carry-forward`). A full audit was completed on 2026-09-01 in a separate session, and the assessment-scoring database repair has already been applied. Read the context, then work the tasks in order.

## Hard rules — do not violate

1. **DEPLOY HOLD is active.** Do not run `vercel deploy`. Do not `git push`. Do not redeploy the Supabase edge function. Do not `git commit` without asking me first.
2. **Do not write to the database.** The one authorised repair is already done. Read-only SQL is fine.
3. Do not re-derive the audit. These already contain it:
   - `MASTER-PENDING-2026-09-01.md` (repo root) — the backlog and order of work
   - `src/docs/systems/full-audit-2026-09-01.md` — detailed findings
   - `src/docs/systems/assessment-scoring-corruption-2026-08-16.md` — the scoring incident (untracked; **now partly superseded, see below**)
4. When you disagree with those docs, say so and show evidence. Several of their numbers are already known wrong; see "Known-bad figures".

## ⚠️ The lesson that cost the most — read this before touching scoring

**`src/lib/assessment-section-presets.ts` is the source of truth for scoring conventions, not the weights stored in the database.**

During the repair I saw Sleep's stored builder weights were `[4,3,2,1,0]` and Balance's were `[1,2,3,4,5]`, concluded the ascending 0-based reconstruction was wrong for those two, and "corrected" them. That was wrong and had to be reverted. The presets file settles it explicitly:

- `SLEEP_SCORING` — bands 0–16 / 17–32, with the note *"Every item scores worst-answer=4, best-answer=0, verified directly against live options."* Sleep's first option is "0–15 minutes", the **best** answer, so the scale is **ascending**.
- `BALANCE_SCORING` — bands top out at 32 = 8 items × 4, so **0-based**.

The stored weights for those two are stale legacy values predating the 2026-08-06 scoring rewrite. **Check the presets file before trusting any stored weight.**

## State

- Branch `equip-carry-forward` @ `f2ef3f20`, in sync with origin.
- **Production is serving `7c21cd02` from 2026-08-07 — 25 days stale.** Git-triggered builds are disabled at the Vercel project level *by design*, so every push since produced a CANCELED preview. The only deploy path is `npx vercel@latest deploy --prod --yes`. Do not run it yet.
- The Supabase edge function IS current. Frontend and backend disagree about what is live.
- **Uncommitted, from 2026-08-16:** `AssessmentEditPageWizard.tsx`, `useOfflineSync.ts`. Untracked: `AGENTS.md`, the two audit docs, `src/tsconfig.check.json`.
- Supabase `jpfvoevxegnknxoqmwye`. 2,001 KV rows, 133 assessment results, 32 journal entries, 8 user profiles.

---

## Task 1 — establish what the build gate actually is

`package.json` has exactly two scripts: `dev` and `build`, and `build` is bare `vite build`.

- `CONTRIBUTING.md` step 4 says "`npm run lint` must pass". **That script does not exist.**
- `CONTRIBUTING.md` and `GETTING-STARTED.md` both call `npm run build` "TypeScript check + Vite build". **It is not.** Vite strips types with esbuild without checking them.

There has never been a type-check gate. That is a plausible mechanism for how `equip.name` (records use `title`) and a read of an always-null field both shipped.

```bash
npm run build          # passes today — confirmed 05:52
npx tsc --noEmit       # the check that has never run
```

Report the `tsc` output. Then propose (do not apply yet):

```json
"typecheck": "tsc --noEmit",
"build": "tsc --noEmit && vite build"
```

If there is a large pre-existing error backlog, do NOT fix it all — report the count, group it, and flag whether any errors land in the Task 3 files.

## Task 2 — ✅ DONE. Do not re-run.

The scoring repair was applied on 2026-09-01 at ~05:58. Both statements ran against `jpfvoevxegnknxoqmwye`.

| | |
|---|---|
| Backup | key `backup_pre_scoring_repair_2026-09-01` — 14 records, 252 kB, full pre-state |
| Repair 1 | `questions[].scoring` rebuilt on **92 of 92 questions**, 0 key/option length mismatches |
| Repair 2 | `daily_content` weights rebuilt for Burnout, Stress, General — 54 activities |

Preconditions verified live first: all 438 options are `jsonb` strings, no duplicate option text within any question. The reconstruction was dry-run against Depression's surviving `[0,1,2,3]` and reproduced it exactly.

Resulting per-assessment maxima, all matching what the presets expect: Depression 36 (27 scored), Anxiety 30 (21 scored), Stress 28, Balance 32, Sleep 32, Burnout 92 (+1 offset applied downstream), General 96.

**Verification you should do, read-only:** confirm the player still bands correctly by taking one Sleep and one Balance assessment against a local dev build. Sleep low total = good sleep. Balance max is 32, not 40.

## Task 3 — NEW, and it blocks admin editing of two assessments

The player now reads `questions[].scoring` and scores correctly. The admin builder reads `daily_content` weights, which for two assessments still disagree with the code:

| Assessment | Builder shows | Player uses | Delta |
|---|---|---|---|
| Struggling with quality sleep | `[4,3,2,1,0]` | `[0,1,2,3,4]` | **fully inverted**, 8 questions |
| Struggling to balance life | `[1,2,3,4,5]` | `[0,1,2,3,4]` | **off by one**, 8 questions |

**Anyone who opens Sleep or Balance in the admin editor and saves will push those wrong weights back over the correct ones.** That is the same round-trip that caused the original corruption.

Also pre-existing: Sleep questions 2 and 4 carry 4 weights for 5 options in the builder copy.

Two options — pick one and tell me which, do not just do it:

1. Align the stored `daily_content` weights for Sleep and Balance to ascending 0-based, matching the presets. Low risk, and it makes builder and player agree. This is what I would do.
2. Leave the data and make the wizard derive weights from the presets rather than trusting stored values. More correct long-term, larger change.

Either way, **do not let anyone edit Sleep or Balance in the admin UI until this is resolved.**

## Task 4 — harden the uncommitted editor fix, then commit

`AssessmentEditPageWizard.tsx` is a partial fix. It stops the bleeding but is not safe to ship as-is. Three changes needed before commit:

1. **Hoist the option normaliser.** `convertQuestionsToDay` (~line 36) normalises options to strings on load; `persistWizard` (~line 359) does not on save. Object-shaped options would stringify to the single key `"[object Object]"`. Make the round-trip symmetric with one shared helper. *(All current options are plain strings — verified — so this is a guard against future data, not a live bug.)*
2. **Guard the weights length.** `persistWizard` checks `weights.length > 0`. Typing `"0,1"` into `EquipBlockEditor`'s free-text weights field for a 5-option question passes that check and zero-scores options 3–5. Require `weights.length === options.length`, or leave `scoring` off and surface a validation error.
3. **Reconcile the builder cache.** Line ~311 regenerates `daily_content` only when it is *entirely absent*, while `persistWizard` unconditionally rewrites `questions[]` from it. Any edit made to `questions[]` outside the wizard is reverted on the next autosave — **including the repair that just ran**. On load, compare ids/length and regenerate, or surface a conflict, when they disagree. **This one now protects live repaired data, so it is the highest priority of the three.**

`useOfflineSync.ts` — the change in the working tree (forwarding `maxScore`/`sectionScores`) is correct and complete. But **the identical bug is still live one case above it**: the `mood_entry` case destructures 7 fixed keys and drops every custom check-in template answer. `MoodJournal.tsx:347` queues them and `api-client.ts:947` accepts them. One line:

```ts
const { date, mood, note, emotions, energy, stress, contextTags, ...extraFields } = item.payload;
await apiClient.createJournalEntry(date, mood, note, emotions, energy, stress, contextTags, extraFields);
```

## Task 5 — the security chain

Details and file:line in `MASTER-PENDING-2026-09-01.md` §1. In order:

1. `src/supabase/functions/server/admin-routes.ts:58` — delete `POST /admin/debug/make-admin`. Delete the shadowed duplicate at `index.tsx:1609` too.
2. `src/supabase/functions/server/index.tsx:323` — the "already been registered" branch calls `supabase.auth.admin.updateUserById` with the caller's password. Return 409 instead.
3. `src/supabase/functions/server/index.tsx:206` — remove `SUPER_ADMIN_EMAIL` and the middleware that auto-creates the admin profile.
4. `src/supabase/functions/server/index.tsx:1550` — `POST /admin/set-admin/:userId` passes when zero admins exist. Require `requireAdmin` unconditionally.
5. `src/supabase/functions/server/index.tsx:3232` — `GET /settings` is public and unfiltered, and `settings:site` holds a populated 16-char `smtpPassword`. Allowlist public fields. **Separately: rotate that password. Treat it as compromised.**

Write the code. Do not deploy it.

## Task 6 — the two fake privacy controls

`src/components/screens/account/Privacy.tsx:86,100` calls `/user/export` and `/user/delete-account`. Neither exists — the real ones are `POST /users/export-data` (`index.tsx:811`) and `DELETE /users/me` (`index.tsx:1025`). Both 404s are swallowed by `.catch()` and the toast reports success.

Fix the paths, remove the swallowing, surface real failures. Then verify the export end to end: it queries prefix `journal:${userId}:`, which nothing writes — journals return empty even when reached. The correct prefix used elsewhere is `journal_by_user:${userId}:`.

## Task 7 — section scores vanish in history

`AssessmentHistoryDetail.tsx` has **zero references** to `section_scores`/`sectionScores`, and its `AssessmentAttempt` type does not declare the field. `AssessmentResults.tsx` renders a per-scale report card correctly, gated on `sections.length >= 2`. So the breakdown exists once, immediately after finishing, and disappears when the user looks back.

Add the field to the type and render it. Note that 133 already-saved results carry no breakdown at all — backfilling those is a separate, later job.

## Known-bad figures — do not trust these

- `assessment-scoring-corruption-2026-08-16.md` says **105 questions**. Its own per-assessment table sums to **92**, and 92 is what production holds. 105 is unexplained.
- The same doc says **132** assessment results; production now holds **133**.
- The same doc's claim that "plain 0-based index per question is correct regardless of scale length" is true **only because the presets file says so** — Sleep's and Balance's stored weights actively contradict it. See the warning at the top.
- `PENDING.md` says `activity_log:` has **604** rows. It now has **724**.
- `PENDING.md` §A holds "Burnout has 22 real items vs BAT-23's 23" open as a decision. It is neither: **items 9 and 10 are the same question**, one quoted and one not. 23 rows, 22 unique. The fix is deleting a row, not authoring clinical content. Note this changes Burnout's max score, so do it before anyone relies on the 92 figure.
- `ARCHITECTURE.md` claims leaked-password protection is ON (disabled) and email confirmation is ON (signup passes `email_confirm: false`). It lists `idx_equip_days:` / `idx_day_blocks:` as key prefixes; those have never existed.
- `BACKEND-GUIDE.md`'s route table says `PUT /cms/pages/:slug` is `requireAdmin`. The live route is `:pageId` and `requireAuth` only. Regenerate that table from source.

## When you finish a task

Report what changed, what you verified it against, and what you did **not** verify. Do not mark something fixed because it compiles — that gate is meaningless here, see Task 1. If a fix needs a running app or a logged-in session to confirm, say so rather than assuming.
