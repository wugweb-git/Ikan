# Changelog — iKan Health

Dated record of what shipped and why. See `GOVERNANCE.md` for the rule that keeps this updated, and
`PENDING.md` for what's still open. Reverse chronological.

Entries before 2026-08-05 are reconstructed from `src/docs/KNOWN-ISSUES.md` (now retired — its
Sessions 1–13 log became this file) and are dated by commit history where available, otherwise left
undated under their original session number.

---

## 2026-08-05

**Sectioned assessment scoring (General & Burnout report cards).** Both assessments bundle several
independent clinical instruments; a single total score across GAD-2, WHO-5, self-efficacy and
resilience mixes scales with different ranges and opposite directions and is not a meaningful
number. Added `computeSectionScores()` (pure, unit-tested — 35 assertions including hand-worked
WHO-5=100, GAD-2=6, BAT-mean=5.0 cases), threaded `section_scores` through persistence and the
sessionStorage hydration path, and a new `SectionReportCard` UI showing per-scale rows with
direction-aware severity colouring (a high WHO-5 is good news; a high GAD-2 is not — colouring by
raw percentage would invert the positively-worded scales). Sections reference questions by ID, not
position — the original spec's positional ranges (q1–2, q3–4, etc.) did not match the actual
question order. Two content gaps remain open (Depression/PHQ-2 has no mapped questions; Anxiety/GAD-2
has 1 of 2 items) — see `PENDING.md`. Fixed a latent bug found along the way: both offline-queue
payloads dropped `maxScore` on sync, corrupting the iKAN score's fallback path.

**KV orphan detection rebuilt; cascading deletes added.** The orphan auditor was wrong in both
directions: it reported 328 real `day:`/`block:` records as orphaned (checking for `idx_*` index
keys that never existed in this database) while under-reporting real user-data orphans 19→1
(checking stale `user:{uid}` KV records instead of `auth.users`). Replaced with a declarative
`RELATIONS` table that joins on the actual value fields records carry. Equip deletion now cascades
to its day/block/progress/enrollment descendants instead of leaving them behind — the main source of
the orphan accumulation this was built to catch. Removed the `resource:` → `library:resource:`
mirror (written by delete only, so it always held stale pre-edit snapshots) and fixed
`professional:`/`consultant:` update+delete to find legacy `consultant:`-only records that were
previously visible but uneditable. Added a "Schema & Relations" view to the KV Audit admin screen,
surfacing an endpoint (`GET /admin/kv-schema`) that existed server-side with zero callers.

**Enrollment read bug and stuck day-advancement fixed.** `GET /user/enrollments` returned `[]` for
every user because it prefix-scanned a key shape that was never written — real enrollment records
use `enrollment:{enrollmentId}`, not `enrollment:{userId}:{equipId}`. This predates the session
(introduced 2025-12-30) and was unrelated to any KV purge. `completeDay`/`saveBlockResponse` had the
identical bug, so every enrollment's `current_day_number` was stuck at 1 regardless of actual
progress. Both fixed by locating the real record and writing back to its own key.

**Production domain restored.** `ikanhealth.in`'s nameservers had drifted to a third-party parking
service, serving a generic host placeholder instead of the app — unrelated to any code change.
Diagnosed via Vercel's domain inspection and fixed with the exact A-records Vercel specified
(including for `staging.`/`sandbox.` subdomains, which were already attached to the project and
just needed DNS).

## Session 13 (undated)

Renamed "Categories" → "Meta Manager" in the admin sidebar (route ID kept as `categories` for
backward compatibility). Removed the standalone "Mood Types" sidebar entry — `AdminMoodManager` is
now embedded inline under the Meta Manager's "Mood Types" tab. Added `mood_type` (8 seed items) and
`ema_category` (11 seed items) metadata types, bringing the total to 16. `POST /categories/sync` now
supports `updateExisting: true` to refresh icon/color/description on existing items rather than
skipping them. Migrated the last three hardcoded dropdown arrays
(`AdminCheckinTemplateBuilder`'s `EMA_CATEGORIES`, `EquipProgramWizard`'s category/difficulty
options, `AdminAssessmentManager`'s filter types) onto `useMetadata()`.

## Session 12 (undated)

Removed all `motion/react` and CSS animation references from admin UI components
(`AdminCheckinTemplateBuilder`, `AdminWidget`, `AdminErrorState`) to improve admin load performance.
User-facing components intentionally keep their animations. Fixed `AdminMediaManager` being
completely non-functional — its `api-client.ts` routes didn't match the deployed server endpoints
(`/admin/media/files` → `/media`, etc.).

## Session 11 (undated)

Fixed admin dashboard scroll hangs: a `backdrop-blur` + opacity sticky header forced expensive
recompositing on every frame, a resize handler fired synchronously per pixel instead of throttled,
and a `SuspenseScreen` wrapper was being recreated every render. Fixed the notification bell's
pointer-events and missing scroll-to-top. Made the Page Manager's validation error list the specific
invalid fields instead of a generic message.

## Session 10 (undated)

Fixed cold-load 404s on direct URL navigation (e.g. opening `https://ikanhealth.in/join/professional`
directly) — `currentRoute` was always initialized to `/` regardless of the actual URL, so the SPA
served the homepage instead of matching the route. Fixed by reading `window.location.pathname` in
the initial state.

## Session 9 (undated)

Fixed the professional-application link using `window.location.origin`, which resolved to whatever
preview domain the admin happened to be on rather than the production URL. Added a shared clipboard
utility with a legacy `execCommand` fallback for sandboxed iframes where the Clipboard API is
blocked.

## Session 8 (undated)

Full code audit of the iKAN Score pipeline end to end (server route → api-client → hook → card
component) — no defects found, all Session 7 fixes confirmed in place. Verified all three layers of
the MoodJournal chunk-loading defense (retry-with-backoff, a dedicated error boundary, preload on
touch/hover).

## Session 7 (undated)

Five bugs found and fixed in iKAN Score calculation: (1) the score route queried the wrong
enrollment prefix and field names; (2) `journal_by_user:{userId}` without a trailing colon could
theoretically prefix-match a different user's UUID; (3) a hardcoded `max_score` fallback of 100 was
wrong for clinical instruments with different real maximums (PHQ-9=27, GAD-7=21, etc.) — added a
lookup table; (4) WHO-5 was scored as "higher = distress" like every other instrument, when it's the
opposite; (5) assessment names fell back to raw IDs like `phq9` with no lookup to the real title.

## Session 6 (undated)

Added client-side image compression (resize + WebP conversion) before upload. Replaced the
console-only `logActivity()` no-op with a real endpoint persisting to `activity_log:` in KV. Fixed
`Math.min(...Object.values(pricing))` crashing when all consultant pricing values were 0 or
undefined.

## Session 5 (undated)

Removed ~900 lines of orphaned HTML template-literal content left behind after a prior function
removal. Fixed `is_admin` not appearing on the quick-auth object during the ~1-2s window before the
full profile fetch completed, by caching it in `localStorage`.

## Session 4 (undated)

Fixed dead "Back to Dashboard" / "Explore More Programs" buttons on program completion (props were
accepted but the parent never passed the corresponding navigation prop). Fixed a crash in
reassessment-trigger logic when `assessment_id` was missing on a record. Removed hardcoded fake
notification badge counts.

## Session 3 (undated)

Unified the equip/program KV prefix split — programs were being written to `equip:` in some paths
and `equip_program:` in others, with the public endpoint only reading one. Replaced hardcoded
Razorpay test-mode payment responses with real order creation and signature verification. Replaced
hardcoded booking time slots with a real date picker and server-persisted bookings. Fixed the
Equip Program Wizard crashing continuously due to (1) two `DndProvider` instances mounting
simultaneously across wizard steps, (2) a stale-closure bug in rapid-edit state updates, and (3) a
rich-text editor ref not resetting between blocks. Made the consultation page's expertise-category
filter data-driven instead of a hardcoded 36-item list.
