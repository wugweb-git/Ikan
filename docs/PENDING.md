# Pending work — iKan Health

Single source of truth for outstanding work across sessions. Update this file whenever you deploy
something that changes what's here — see `docs/GOVERNANCE.md` for the rule.

*Last updated: 2026-09-21 — restructured to hold **only open work**. Every closed item, the
"Verified fixed" section, the Batch 1–6 summary and the eleven dated session-closeout / module-pass /
Phase A blocks moved verbatim to `docs/CHANGELOG.md` § "History moved from PENDING.md (2026-09-21)".
Open items found inside those blocks were extracted into the sections below, each tagged with the
block it came from. `HANDOFF.md`, `docs/archive/MASTER-PENDING-2026-09-01.md`,
`docs/archive/HANDOFF-2026-09-01.md` and `docs/archive/ci-lint-ratchet-plan.md` were folded in
here or into `docs/CHANGELOG.md` and deleted.*

---

## Blocks module — pending, as of 2026-09-08

The blocks module is **not closeable yet**, and the gap is narrow. Everything below is either a
decision only the owner can make, or a build that has no content to justify it yet.

### Content decisions — the module cannot close without these

| | |
|---|---|
| ~~122 keyless blocks~~ | **DONE 2026-09-08.** Zero keyless blocks remain: 440 keyed across both prefixes, 111 distinct keys per programme, derived from each block's own title and stamped `key_source`. One collision handled — `tracking` in sleep-tight carried two different activities under one title, so those keys carry the activity too. Backup `backup_pre_key_backfill_2026_09_08` |
| **35 blocks with no `scale_ref`** | Every scale-backed block inlines its options. Reported, but **not actionable until scale-by-reference is built** — no block has ever referenced a shared scale |
| ~~13 days with no closing block~~ | **DONE 2026-09-08** for the 9 that are day 1+. Every one now ends with exactly one `conclude`, and it is last. Content is a marked placeholder — the close needs the day's own words. **The 4 remaining are Day 0 onboarding**, left deliberately: an onboarding day ends by starting the programme, and its last control already reads "Start Programme". Say if it should carry one anyway. Backup `backup_pre_conclude_fill_2026_09_08` |
| **`practice` still has no content** | `reflection` (8) and `learning` (9) were assigned 2026-09-08 by structural rule, each stamped `mapped_from`: reflection is the last block that WRITES on a day, before the closing card; learning is a single-choice check immediately after a lesson. Both match their reference descriptions. **`practice` has no structural rule** — its permitted activities are a strict subset of `exercise`'s, so nothing distinguishes the two without reading the wording. **`quiz` and `rest` cannot be assigned at all** — 0 blocks carry any scoring marker, and `rest` declares `activities: []`. Backup `backup_pre_type_assign_2026_09_08` |

### Open modelling question — raised 2026-09-08, undecided

**If `view` is an interaction, is `video-player` the activity? If `listen` is an interaction, is
`audio-player` the activity? If `read` is an interaction, are `long-form-text` and `pdf` the
activity types?**

The observation behind it is real and measurable. Every other activity is **many-to-one** with its
interaction — `mcq` and `single-select` both draw `select-one`; `input-table` and
`comparison-matrix` both draw `input-table`; `ephemeral-journal` and `short-text` both draw
`write`. The four passive ones are **one-to-one with identical names** (`read`→`read`,
`listen`→`listen`, `view`→`view`, `complete`→`complete`), which means one of the two carries no
information.

What deciding it would buy, concretely: **`read` cannot currently distinguish prose from a PDF**,
and `view` cannot distinguish an uploaded file from an embed. Naming the activity after the
artefact rather than the act would make both authorable without adding an interaction.

Not urgent, and not a bug. It is a vocabulary change touching the seed, the resolver table and 236
live blocks, and nothing is broken while it is undecided.

### Builds with no content to justify them yet

- **Scale by reference** — the `scale_ref` warning is unactionable until this exists. The
  duplication it would end is real and measured: the PHQ/GAD scale is inlined 27 times in
  assessments and per-block in equip.
- **`column_addition` and `on_demand`** — recycling modes. **Zero of 407 blocks declare `repeat`**,
  so there is no content to exercise either. What actually expresses repetition here is a shared
  response key: 14 keys across 51 blocks, which arrived by copy-paste rather than by design.
- **Content pointing at catalog ids** — blocks store the slug (`type: "tracker"`), not the id. The
  ids are frozen and tested, so this can land any time; it buys nothing until something renames a
  type, and it is a 407-block migration across two prefixes.

- **The 12 `quiz` blocks are probably mistyped** (from Bug-brief pass, 2026-09-02). They are intake
  questions — Occupation, Therapy History, Pre-existing Conditions, Sleep Duration, Expectations;
  8 of 12 sit on day 0 — not knowledge checks, and `8633b97d` legitimised `quiz` in the catalog on
  the strength of their count. Needs a retype decision.
- **Catalog `aliases[]` field** (from Session closeout, 2026-09-02). Alias spellings
  (`matrix`→`comparison-matrix`, `scale`→`rating-scale`, `row_list`/`text_list`→`structured-list`)
  are resolved in code but not declared in the catalog; the fix is an `aliases[]` field on the term
  shape plus a reader change. Re-verify first — the 2026-09-04 catalog work may have superseded it.
- **Equip block palette vs the `block_type` catalog** (from Verified fixed, 2026-08-06): the palette
  was hardcoded to 4 types while the catalog held 7. Re-check against the current picker.

---

## A. Blocked on you (external — cannot be done from code)

- **`wrappers_fdw_stats` RLS** → Supabase dashboard → Security Advisor → **"Resolve issue"** button.
  `ALTER TABLE` fails with `42501: must be owner of table` (owner is `supabase_admin`) — confirmed
  empirically, this is not fixable via migration. This is the sole cause of the recurring "Critical
  issue" emails (Jul 20 / Jul 26 / Aug 3 are the same weekly digest re-reporting one finding, not
  three escalating ones).
- **Leaked-password protection** → Supabase → Auth → Providers → enable HaveIBeenPwned check.
- **Wellness score (iKAN) aggregation logic** — the per-assessment scoring fixed this session (see
  "Verified fixed", now in `docs/CHANGELOG.md`) is upstream of it, not it. Revisiting how the overall iKAN wellness score
  is computed from per-assessment results is **explicitly deferred to a later session** (confirmed
  2026-08-06) — don't start on it opportunistically.
- 🟡 **Check-in has no "Builder" of its own — by design, per this session's direction — but hasn't
  been migrated to Blocks yet.** `AdminCheckinTemplateBuilder.tsx` still runs its own hardcoded
  6-value step-type list (underscore format, e.g. `emoji_scale`), disconnected from the
  `block_type`/`exercise_subtype` taxonomy Equip and Assessment already share. Its own KV mirror
  (`checkin_block_type`, 7 records, hyphen format, e.g. `emoji-scale`) has zero real readers.
  Migrating Check-in onto Blocks needs a value-format normalization pass (underscore → hyphen), not
  just a pointer swap. See `docs/systems/block-architecture.md`.
- 🟡 **`interaction_type` and `day_config_type` Metadata Catalog types are decorative** — read only
  by `AdminBlockTypeViewer.tsx` (a real, accurate, read-only reference screen), never by an
  authoring or rendering path. `day_config_type`'s 11 KV values disagree three ways with code (the
  `dayType` TS union declares 7; `day-presets.ts` actually defines 9); 4 of the 11 exist in no code
  path at all. Not a data-loss risk — no record references a missing type — but the Metadata
  Catalog UI offers an admin options that silently do nothing. See `block-architecture.md`.
- **`ProgramCheckIn.tsx` (the milestone check-in, day 7/14/30) has no admin authoring surface at
  all** — 4 fully hardcoded questions, a commented-out `customQuestions // (future)` field that was
  never built. Distinct from the Mood Journal's daily check-in (`checkin_template:`) despite the
  similar name — confirmed while correcting a wrong claim that conflated the two (see "Verified
  fixed", now in `docs/CHANGELOG.md`). Not a bug, a real feature gap — flagging for whoever next touches program
  check-ins.
- **`Dashboard.tsx` fetches the backend recommendation and never renders it.** `recData`
  (`apiClient.getRecommendations()`, line 222-224) and its follow-up `topRecDetails`
  (`getEquipProgram(recData[0].equip_id)`, line 247-251) are fetched, stored in state
  (`setRecommendations`, line 254), and cached to `localStorage` (line 355) — but neither
  identifier appears anywhere in the JSX/render tree (`grep -n "topRecDetails\|recommendations\b"`
  confirms zero render-path hits). The card that's actually shown
  (`Dashboard.tsx:566-653`, `RecommendationCards` + severity card) reads `engineResult`, computed
  separately by re-running the frontend `evaluateAssessment()` per historical result (lines 325,
  339-347). **The fix**: either wire `RecommendationCards` to read from `recData`/`topRecDetails`
  instead of re-running `evaluateAssessment()`, or stop fetching `GET /recommendations` in
  `Dashboard.tsx` entirely if the frontend engine's richer output (messaging/secondary
  actions/severity bands) is what should stay canonical. Not fixed this pass (documentation-only
  turn, by explicit decision) — see `docs/systems/recommendation-frontend-vs-backend.md`.
- **`kv-audit-routes.ts:199` — the `hero_banner` registry entry names a deleted owner**
  (`hero-banner-routes.ts`, removed with the Hero Banner feature). Mark it orphaned; the KV rows
  stay. It is an edge-function change, so it **needs Vedanshu's go-ahead** (Supabase changes are
  out of scope for the restructure). (from HANDOFF.md, 2026-09-15)
- **Still on the account holder** (from Session closeout, 2026-09-02): delete two artifacts (no
  delete action in tooling) · **rotate the SMTP password** — `settings:site.smtpPassword` was
  publicly readable through `GET /settings` until the S4 fix; the code no longer leaks it but the
  credential is unchanged, so treat it as compromised (also MASTER-PENDING §1, 2026-09-01) ·
  **legal read of the privacy copy** — the replacement wording in `cms-defaults.ts` is written to be
  defensible, not cited.
- **Owner numbers for assessment `duration`** (from Session closeout — conversion-surface pass,
  2026-09-03): were Sleep and Balance at 10 minutes (8 reflective items, 75s each) deliberate, and
  what should General be at 24 questions? `durationLooksImplausible()` fires on Sleep and Balance,
  not on General, and its threshold was deliberately not tuned to change that.
- **Content, on Kartik** (from Module closeout — Assessments, and Session closeout —
  recommendations, 2026-09-08): interpretation sentences beyond the seven shipped · stress-chart
  messaging — all 41 stress results are `pre-spec`, so the owner's stress chart is empty; decide
  what the screen says in its place (from Phase A, 2026-09-08) · article tagging — `depression`,
  `anxiety`, `burnout`, `balance` have no article, so their Related articles row renders nothing
  (self-service: tag an article with the assessment category; a blog label that is not a category
  needs one line in `BLOG_CATEGORY_TO_ASSESSMENT`, `resource-presentation.ts`) · the GAD-7 article
  (*"Beyond the 'Worry Loop'"*) is tagged `sleep` while its title names the anxiety instrument.
- **Rule coverage** (same blocks): `Productivity Reset` is targeted by no rule and can never be
  recommended; Balance and General can reach severities above their highest rule's gate, so their
  top bands recommend nothing.
- **Website content W1–W4** (from Final deployment, 2026-09-03): the `/assessment` hero photograph,
  the shared General/Balance stock image, Burnout's silhouette, the seven identical "Completed"
  badges.
- **B7 consultants — blocked on real records** (from Session closeout, 2026-09-08): 5 `consultant:`
  rows on placeholder UUIDs; 9 of 12 `professional:` rows are "Dr. Test Professional 1/2/3"
  tripled. Needs real records before the slot or the picker is worth building.
- **D3 — 40 `program_checkin` rows share the `assessment_result:` prefix** (from Final deployment,
  2026-09-03). `record_type` separates them cleanly; moving them is a data migration and an owner
  call.
- **The 105 `day:` and 223 `block:` dead rows** (from Session closeout, 2026-09-02). Nothing reads
  them (`equip-routes.ts:210-214`); deleting 328 rows is destructive and this repo has a history of
  false-orphan reports, so it wants an explicit decision.
- **Decorative catalog tabs** (from Verified fixed, 2026-08-06): `media_type` and
  `checkin_block_type` are edited in admin and read by nothing. Wire a consumer or remove the tabs.
- **Compliance decisions** (from MASTER-PENDING §3, 2026-09-01 — not re-verified since): C2
  `backup_erased_user_bb1c02a9` retained 19 records for a user erased on request · C7 DOB is
  collected with no age gate or parental-consent flow · C8 breach notification is required if S1/S4
  was exploited, and there are no access logs to rule it out · C9 no retention policy beyond
  activity logs (assessments, journals, backup blobs).
- **Standing owner decision — crisis flag** (from Phase A, 2026-09-08; kept here so it stays
  visible): `depression-q10` carries `is_risk_indicator`, so "Somewhat difficult" opens the crisis
  panel, while `depression-q9` — the identical sentence to the flagged `general-q5` — is not
  flagged. Deliberate and confirmed twice. Do not "fix" it without asking.

## B. Verify on production (needs a human pass, not more code)

Section-scoring UI (`65cef6ba`, deployed) could not be visually verified — the local preview
tooling's shell fails at initialization in this environment, unrelated to the app config. Please
take one **General** and one **Burnout** assessment on production and confirm:
- General shows 5 section rows, no overall total, Depression reads "No questions mapped yet."
- Burnout shows 4 sections + an overall risk band.
- A high WHO-5/resilience score renders as good (green) — colour must be direction-aware, not just
  by raw percentage.

Also needs a human pass:
- **Complete one General assessment on production** and confirm `section_scores` and `slug` write
  non-null (from Session closeout and Bug-brief pass, 2026-09-02). It is the end-to-end proof for
  B6, and the 137-result section-score backfill sits behind it.
- **Scoring-guardrail pass** (from Session closeout — B1/B5/C1/D3, 2026-09-03): Burnout and General
  end-to-end runs; `GET /user/assessments/results/:id`; `invalid_reason` on a deliberately
  incomplete run; profile validation refusing a gapped band set; the locked/DELETE refusals;
  Guardrail 11 (renaming a question id a saved score references). This is also how §C1's live
  status gets confirmed.

## C. Known data/schema defects — diagnosed, not yet fixed

| Defect | Evidence |
|---|---|
| `PUT /settings` overwrites, `PUT /admin/settings` merges | Calling the wrong one silently wipes unlisted fields. Same key (`settings:site`), two different write semantics. |
| `mood:` prefix collision | Mood *types* are written by both `scales-routes.ts` and a third CRUD block in `index.tsx`; per-user mood *logs* are written by `mood-routes.ts` under the same prefix. A separate `mood_type:` prefix also exists. Three writers, two data shapes, one namespace. Not yet audited to the same depth as assessments/equips — see the recommended next scope below. |
| `recommendation_rules` (no colon) singleton | Only ever written by backup/restore; vestigial, predates the real `recommendation_rule:{id}` design. |
| 3 of 7 equips lack `equip_program:` user copy | May not surface to users. Run `POST /admin/kv-audit/sync-prefixes`. |
| `equip_slug:` — 1 missing | Not actually a bug: that equip has an empty `slug` field. Needs a slug set in admin, then the index follows automatically. |
| ~~`activity:daily:{date}` unregistered in `KV_SCHEMA`~~ **fixed 2026-08-06** | Live, real merge target of `POST /admin/purge-activity-keys`, missing from the registry — found while building `schema-relations.md`'s full prefix-footprint cross-check. Registered (`orphanRisk: low`); deployed. Its lack of a size cap (unlike `user_activity:`, which is capped) is **not** fixed — one live key already held 1,357 events (~300KB) and grows unbounded on every purge run. Needs a retention decision (cap? roll off after N days? archive?), not a one-line patch. |
| **2 ghost `user:` rows NOT deleted — need a product decision** | `user:00000000-0000-0000-0000-00000000a001` has 7 real `journal_by_user:` entries attached; `user:107e08ee-d7cc-4535-8c4a-49dad0c3c89b` has a live `enrollment:` + `ikan_score:` record. Neither is a plain orphan — deleting the profile row wouldn't remove the attached data, and whether that data should be purged, reassigned, or kept (e.g. for compliance after an account deletion) is a decision, not a cleanup. See `schema-relations.md`. |
| **Admin KV Audit dashboard showed stale numbers (594 "Uncategorized Keys", 94 "Schema & Relations") — traced to deployed-function drift, redeployed** | User flagged this directly. Simulated the exact `classifyKey()` logic server-side against live data: only **1** key is genuinely uncategorized (not ~595), and `KV_SCHEMA.length` in source is **96** (not 94). Both dashboard numbers are computed live at request time (`uncategorizedCount: uncategorizedKeys.length`, `totalPrefixes: KV_SCHEMA.length` — not hardcoded, not a frontend cache), so the mismatch meant the *deployed* function was behind the current source. **Fixed**: redeployed `make-server-cc205da9` this pass. Reload the KV Audit admin page to confirm it now shows ~96 prefixes / ~1 uncategorized key — if it still doesn't after a hard refresh, that's a second, deeper bug worth a live follow-up with real admin auth (which this investigation didn't have access to). |
| ~~"Multi-Tenant Prefix Sync" tile's count wrong, harmful sync target~~ **fixed 2026-08-06** | `AdminKVAudit.tsx`: renamed to "Admin/User Prefix Sync" (the "multi-tenant" label was a misnomer — this is a single-tenant app's admin-write/user-read split, not multiple customer orgs); count now derived from the real `equip:`/`equip_program:` and `assessment_def:`/`assessment:` record-count gap (`schema.liveCounts`) instead of the unrelated critical-growth-warnings count. The `resource: → library:resource:` sync target was checked against the backend `POST /admin/kv-audit/sync-prefixes` route — already correctly removed there (with its own explanatory comment); only the frontend tile's description text still listed it, now removed too. Whether to eliminate the write/read split entirely (read `equip:`/`assessment_def:` directly) instead of maintaining a sync tool remains a larger, undecided architectural question — not this pass's scope. |

- **Sleep Tight has 16 of 31 duplicated-filler days; Burnout Reset has a "(Copy)"-titled day and
  repeated exercise text** — flagged in `docs/equips/sleep-tight.md` and `burnout-reset.md`
  respectively, never fixed. Content decisions (what the real day content should say), not mechanical
  fixes — see `repo-hygiene-audit.md`'s "recurring/extra equip content" section for the full list.

- **Real Google/LinkedIn OAuth is not built** — the fake "Connect" UI was removed 2026-08-07; backend
  routes/KV fields are left unused. Needs provider credentials. See `user-accounts.md` (§18).
- **Real TOTP 2FA is not built** — the unenforced toggle was removed 2026-08-07. Needs a
  verification-code library and login-flow UI. See `user-accounts.md` (§18).
- **`/dashboard/<username>` is not implemented** — there is no `username`/handle field in the
  `user:` schema to build it on. (Full URL map: `docs/systems/url-map.md`.)
- 🟡 **("The above" = General's admin builder showing 24 of 27 questions, fixed 2026-08-07 — now in
  `docs/CHANGELOG.md`. Partly addressed 2026-09-01 in `5d60a9b3`: the wizard now reconciles
  `daily_content` against `questions[]` id-by-id on load; re-check whether a text-only edit still
  desyncs.)** **The underlying pattern that caused the above is still live — will recur on the next direct-SQL
  edit to any assessment's `questions[]`.** `AssessmentEditPageWizard.tsx:291`'s "only regenerate
  `daily_content` if absent" logic has no staleness detection — any future edit to `questions[]`
  outside the builder (SQL, a migration script, etc.) will silently desync the two again with no
  warning to the admin. A real fix needs either: comparing `questions[]`'s content hash against what
  `daily_content` was generated from and warning/re-deriving on mismatch, or a decision to make one
  of the two fields authoritative and stop maintaining both. Not fixed this pass — a real
  architecture decision, not a one-line patch.
- 🟡 **Admin panel notification bell is not wired to real data.** `NotificationContext.tsx`'s
  `unreadCount` is computed only from a client-side, in-session `notifications` array — `grep`
  confirms `setNotifications` is never called from any API fetch, only from local push/dismiss
  actions (toasts). The real `admin_notification:` KV prefix (registered, real backend write paths
  exist) is never fetched into this context. Same shape as §18's session-tracking half-built
  feature — the write-side may exist, the read/display-side was never wired in. Not fixed this pass.
- **`src/product/site/pages/AboutUs.tsx:55` — stale comment** describing the removed
  `getHeroBanner('about')` override. Remove it. (`getHeroBanner`/`updateHeroBanner`/
  `resetHeroBanner` are no longer exported from `src/shared/api/api.ts` — confirmed 2026-09-21.)
  (from HANDOFF.md, 2026-09-15)
- **`src/App.tsx` still lets `/page/<slug>` routes through** (~L371-373, ~L731), commented "CMS
  page", though `CmsPageRenderer` and the Page Manager were removed. Dead route handling — remove,
  or send `/page/*` to not-found.
- **Assessment layer — code, unblocked** (from the 2026-09-03 closeouts and the 2026-09-08
  recommendations closeout):
  - **R1** — the `?id=` results route falls back to the sessionStorage blob without checking that
    blob's id against the requested one, so a failed fetch can render a *different* result.
  - **S3 → D5/H8** — the history endpoint returns one key shape but the Dashboard and the history
    screen still walk a three-key ladder (`max_score`/`maxScore`/`max`). Normalise server-side,
    delete both ladders.
  - **Audit #1 / D11 / F10** — one exported `Assessment` type. Three interfaces exist and
    `AssessmentFlow` holds 17 `as any`; the repeated field drops (`slug`, `maxScore`,
    `sectionScores`, `engineResult`) trace to each layer redeclaring its own shape.
  - **Server `shared-types.ts`** still exports a third, four-term `SeverityLevel` typing
    `min_severity`.
  - **D10** — results render in place, so chrome is suppressed by route name.
  - **A3** — removing the invented `min: 0, max: 5` seed band needs `ScoringBand.min/max` optional:
    **28 new type errors** across `scoring-engine`, `AdminScoringEngine`, `AssessmentScoresEditor`,
    each a real decision about unbounded edges. Its own change. **A4–A7** admin items remain (the
    list named `AdminCheckinScalesManager`'s seventh severity vocabulary and no monotonic-ramp
    validation).
  - **Stored-result gaps** (from B-tier / result-presentation / Final deployment, 2026-09-03):
    D1 98 of 104 carry no `engine_result`, so `?id=` cannot rebuild a recommendation for them (by
    design it renders nothing) · D2 93 carry no `section_scores` · 0 of 104 carried `severity_ref`
    · 6 results carry no `scoring_provenance` stamp — the only loose end of the 104.
  - **Three dead exports** — `getSeverity` (`recommendation-engine.ts`), `computeSectionScores`
    (`assessment-sections.ts`), the `formatters` object (`utils.ts`). All contain the floor-blind
    percentage; deleting them removes the last copies.
  - **`Consultation.tsx` has no floor** — it loads no scoring profile, so its percentage falls back
    to `value / max` and overstates the 1-5 instruments by ~10 points.
  - **`DayEditor`'s `block.duration || 5`** — same invented-default defect, in the equip blocks
    module (from conversion-surface pass, 2026-09-03).
  - **Burnout-aware authoring guard not written** (from Assessment module pass W1, 2026-09-08):
    Burnout's options are bare strings with values in the per-question `scoring` map, so the guard
    must validate the *derived* scale (option value → question map → index) or Burnout fails a
    guard it actually passes.
  - **W4 swap not done** (same pass): the EquipBlock card on the results page needs a rendered
    before/after, because its section has its own eyebrow and the results-screen style is frozen.
    **W5–W7** of that pass (recommendations firing, Rules Engine fields, results UI) were not
    started — likely superseded by the Module closeout's Phase B; re-verify before picking up.
- **Frontend, held** (from Module closeout — Assessments, 2026-09-08): **2d navigation anchors** —
  held because `Navigation.tsx` is used by `App.tsx` and 10+ screens; report before starting ·
  **#9 srcset site-wide** — queued · **#12 / #14** — merge plans owed for the two heroes and the
  three resource-card implementations; no code.
- **Journal data quality** (from Verified fixed, 2026-08-06): `freehand_text_content` is sometimes
  a number instead of a string; one entry has an `extra_responses` key matching no current template
  step. See `docs/systems/mood-checkin.md`.

### Audit residue from MASTER-PENDING-2026-09-01 — not re-verified since

Carried from `docs/archive/MASTER-PENDING-2026-09-01.md` (deleted 2026-09-21; file:line detail in
`docs/systems/full-audit-2026-09-01.md`). Line numbers are 2026-09-01's. Server-side items could
not be re-checked in this pass — confirm each before acting.

- **Authorization gaps S5–S11, S13:** `POST /upload/refresh-url` (no auth; mints a 7-day signed URL
  for any private-bucket path) · `POST /upload/professional-file` (no auth, no MIME allowlist,
  caller-controlled path segments) · `POST /brevo/send/email|sms|whatsapp` (`requireAuth` only;
  recipient, HTML and sender from the body) · payments forgeable (`POST /users/payments` accepts
  `status:'completed'`; `/equip/purchase/:id` writes one with no gateway) · `GET
  /admin/activity-logs` (`requireAuth`, no admin check) · two unauthenticated KV writes, one into a
  caller-supplied `user_id` · `POST /analytics/engagement` and `POST /user-activity/mark-read`
  unauthenticated. CMS-page and hero-banner writes were also on the list; both features are gone —
  confirm their routes are gone from the edge function too.
- **`PUT /users/password` does not change the real Supabase login password** (live bug), and would
  write an unsalted SHA-256 hash (dormant — 0 profiles carried one).
- **Erasure incomplete:** delete reconstructs `journal_by_user:${userId}:${date}` while writes use
  `…:${date}:${id}`, so index rows survive. Never deleted: the `user_journal_entries` mirror,
  `health:*`, `hc_status|hc_data|hc_history:*`, `booking:*`, `assessment_result:*`, uploaded
  storage objects.
- **`GET /equip/programs/:equipId`** has neither auth nor a published filter; unpublished
  programmes are hidden client-side only.
- **Admin editor stale-cache write:** `AssessmentEditPageWizard` loads through a 24-hour offline
  cache fallback and can PUT it back over the server.
- **Offline queue:** `syncNow` overwrote the queue wholesale, erasing anything queued during a sync.
  A dead-letter key now exists for exhausted retries — re-check the overwrite.
- **Dead code:** 14 shadowed Hono routes, two of which weaken the guard (`GET /admin/users` falls
  back to `requireAuth`+inline; `/admin/categories` loses its `ensureAdmin` wrapper) · all 5
  corporate routes unreachable (`corporate-routes.ts:11` prepends the basePath twice; corporate is
  out of scope for the restructure) · `checkRateLimit`, `trackSession`, `logAudit`,
  `trackFailedLogin`, `createSecurityAlert`, `apiLogger` have no call sites (`session:`,
  `rate-limit:`, `api-log:`, `alert:` all 0 rows) · `accessibility-helpers.tsx` (`FocusTrap`,
  `LiveRegion`, `ScreenReaderOnly`, `KeyboardNavigable`) had zero usages — now `src/product/app/ui/`,
  imported by `App.tsx`; re-check which exports are used.
- **Accessibility tokens:** focus ring 1.73:1 across 12 primitives (needs 3:1) · text-muted passing
  only on white · every border token ≤1.41:1, so an off switch has no perceivable boundary ·
  `ui/alert` success 2.07:1, warning 1.78:1. Tokens have changed since (`--color-text-muted` is now
  `#6B6B7B`) and a contrast ratchet runs in CI — re-measure. The `checklist` exercise had no input
  element, so keyboard and screen-reader users could not complete it — re-check `BlockRenderer`.
- **Burnout item text:** 8 of 23 items carried literal escaped quote marks visible to users
  (cosmetic; Phase A rewrote Burnout text 2026-09-08 — re-check).

## D. Migration — user data out of the KV blob into real tables

**Done:** Phase 1 (5 tables + RLS + backfill, verified by impersonation test) and Phase 2 (journal
dual-write, both write paths covered, 25/25 converged, `useOfflineSync` maxScore bug fixed as a
byproduct).

**Not started:** Phase 3 (cut journal reads over to the table — the dual-read/self-heal groundwork
already exists in `mood-routes.ts`) and Phase 4 (repeat dual-write for the remaining four entities:
`user_enrollments`, `user_program_progress`, `user_assessment_results`, `user_ikan_scores`).

## C0. Answers are stored as display text — rewording an option orphans history

`assessment_result.responses` stores the option's **label**, not its value or a stable option id.
Reword an option and every stored answer to it detaches silently: the response key still resolves
to a live question, so nothing errors and nothing is reported.

Measured on Stress while authoring its spec: `"3 - Often"` (43 answers) and `"1 - Rarely"` (29)
matched no current option — they had been reworded to `"3 - Fairly Often"` and
`"1 - Almost Never"`. Exact-text matching recovered 10 of 38 results; a leading-digit fallback
recovered 27, and 73 individual answers were recovered that way.

Balance is worse and shows the limit: its answers come from **two different instruments** — a
former 0-4 *agreement* scale (`"0 - Strongly Disagree"`…) replaced by a 1-5 *frequency* scale
(`"1 Never"`…). `"2 - Neutral"` and `"2 Rarely"` share a digit and mean nothing alike, so the
fallback would have produced a plausible wrong number. Balance was re-scored on exact match only:
1 of 3 results survived.

**That fallback is a recovery, not a fix, and it is not generally safe** — it works only where the
leading digit equals the declared option value, which is true for Stress (0-based, 0-4) and not
guaranteed elsewhere. Five assessments are still to be authored; each will hit this.

The fix: store `{option_id | value, label}` on write, and resolve by value with the label kept
only for display. Until then, every option rewording is a silent data loss event, and
`scoring_provenance.answers_recovered_by_leading_digit` records where the fallback was relied on.

---

## C1. Scoring guardrails written behind the deploy hold — hold lifted 2026-09-03, re-verify which parts are live

These were written while the 2026-09-01 deploy hold was active. The hold has since been lifted: the
edge function was redeployed 2026-09-03 (see "Session closeout — 2026-09-03 (B1 / B5 / C1 / D3)"
and "Final deployment — 2026-09-03", now in `docs/CHANGELOG.md`), and `CLAUDE.md` describes Guardrail 11
as enforced. Whether each server-side refusal below is live has **not** been re-verified item by
item — confirm with the §B scoring-guardrail pass before counting any of them as a guardrail.

1. `scoring-validation.ts` + `POST /admin/scoring-profiles` — schema validation, server-owned
   `version`, refusal to edit a `locked` profile.
2. `DELETE /admin/scoring-profiles/:id` — refusal while an assessment still references it.
3. `POST /user/assessments` — persists `engine_result` and `result_version`.
4. `GET /user/assessments/results/:id` — backs the linkable `/assessment-results?id=` route.
   Until this ships the route finds nothing and falls back to sessionStorage.
6. **Guardrail 11 — question-id immutability.** `validateQuestionIdImmutability` on both write
   paths, 409 with the blocking score names. Blocks renaming or deleting an id a saved score
   references, reusing a retired id, duplicate ids, and a score pointing at an unknown question.
   Allows text/options/`scale_ref` edits, flag toggles and reordering. Retire-don't-delete is the
   escape hatch: drop the id from every score and list it in `retired_question_ids`, which the
   server then only ever appends to. **The `POST` path previously never read the existing record
   at all**, so a POST carrying an existing id bypassed every check — it now reads and validates.

7. **`GET /scoring-profiles` (requireAuth).** New read-only route. `/admin/scoring-profiles` is
   `requireAdmin`, but `AssessmentFlow` calls `loadScoringProfiles()` for every user taking an
   assessment — so a non-admin got a 403, the profile cache stayed null, no clinical severity was
   resolved, and **no recommendation rule could match for anyone but an admin**. The engine now
   tries the read route first and falls back to the admin one. Until this ships, the Step 3 join
   works only for admins.

---

Deploy per `docs/BUILD.md`, then smoke-test `/health`, `/assessments`, `/equip/programs`,
`/scales/moods` **plus** the two new endpoints above.

---

## C2. Frontend typecheck debt — baseline 159, and that is a baseline not a clean bill

`npm run typecheck` is ratcheted against `scripts/baselines/typecheck` = **159** (2026-09-21). It read 208
when this section was written (211 before 2026-09-02; defining the missing `SeedItem` interface in
`metadata-catalog.ts` cleared 3), 183 on 2026-09-08, and was raised to 177 on
`restructure/codebase-separation` only for per-file-verified UI-split duplicates. Every one
predated the scoring-engine work.

**This number is dangerous precisely because it is stable.** "Unchanged, before and after"
is the right thing to verify when making a change, but if 159 is the figure everyone works
against, nobody will ever notice the 160th. A new error introduced by a future change is
invisible against this floor.

1. ~~**Ratchet it.**~~ **Done.** `scripts/typecheck-ratchet.sh` and `scripts/lint-ratchet.sh`
   (`npm run lint:ratchet`, `scripts/baselines/lint` = 861) both run in CI, alongside the contrast,
   raw-hex, static-a11y and surface-boundary ratchets. Lower a baseline whenever problems clear;
   never raise it silently.
2. **Drain the obvious clusters.** They are not scattered — `WizardField.tsx` alone
   accounted for 8 (`Cannot find name 'Button'` — a missing import), `metadata-catalog.ts`
   had 3, and `logger.ts` had 2 (`ImportMeta.env`, a missing `vite/client` type reference).
   Paths predate the 2026-09-21 restructure — re-measure before starting.
3. **Lint warnings left by the 2026-09-08 assessments work** (from Module closeout — Assessments,
   2026-09-08): an unused `ContentImage` import and an unused `programMeta` in
   `AssessmentResults.tsx`, `useState<any[]>` for `recommended`/`articles`, and an unused
   `backgroundAlt` on `SectionHero`. `scripts/baselines/lint` was raised 905 → 911 at the time, against the
   ratchet's own rule, so 911 was never a historic floor. Re-check — some may be cleared.

Note also that **`tsconfig.json` excludes `supabase`**, so none of the edge-function
code is typechecked at all. `scoring-validation.ts` and the `admin-routes.ts` scoring
changes are covered only by the scratch harness and by review — see §C1.

---

## E. Deferred (no urgency)

- ~~Folder reorg for `src/components/` (flatten/organize by domain)~~ — superseded by the codebase
  separation (§F); `src/components/` no longer exists.
- Media migration to Vercel Blob object storage.
- Rotate `BLOB_READ_WRITE_TOKEN` (was pasted in a chat transcript at some point — treat as
  compromised even though nothing currently depends on it being secret).
- `staging.ikanhealth.in` / `sandbox.ikanhealth.in` — **DNS is done** (A records added, per the domain
  fix this session), confirm both resolve and serve the right Vercel deployment target.
- **Workstream C — edge-function `_shared/` dedup** (from HANDOFF.md; descoped from the restructure
  by Vedanshu 2026-09-21 — no Supabase changes). The defects it would fix are still real: the edge
  deploy flat-copies `server/` only (switch to `cp -r` with a `supabase/functions/_shared/` dir);
  `server/validation.tsx` has drifted from the client copy, and `sanitizeString` is the XSS escape
  so it must be single-sourced; the scoring vocabulary (`SEVERITY_LEVELS`, `RESPONSE_TIERS`,
  `DEFAULT_TIER_MAP`) was duplicated in `server/scoring-validation.ts`, whose comment claims a guard
  `scratchpad/verify-scoring.ts` that does not exist — write it or drop the claim;
  `server/shared-types.ts`'s header says "copied from lib/cms-types.ts and lib/program-types.ts",
  both deleted. A Vite client importing `_shared/*.ts` needs `allowImportingTsExtensions` or an
  alias. Verify with `deno check` + tests locally — staging shares the one Supabase, so an edge
  deploy hits prod.
- **Backup-key date format is inconsistent** (from conversion-surface pass, 2026-09-03):
  `..._2026_09_03` vs `...-2026-09-03`, so a pattern search for a day's backups misses some. Pick
  one next time a backup is cut.

## F. Codebase separation (`restructure/codebase-separation`) — remaining

From `HANDOFF.md` (deleted 2026-09-21). Stages 1–4, the boundary fixes (crossings 5 → 0) and the UI
split are done on the branch — see git log (`84300a1a` … `ce452cf4`, then the move/dedupe commits
through `bf1f67d3`). Standing rules for this branch: no database change (KV or Postgres) without
asking Vedanshu — read-only SQL is fine; no commit or push without asking; do not change
content/copy; corporate code and routes and any Supabase change are out of scope.

- **Bring in app's NEW UI** (from Vedanshu's other repo — which repo is TBD) to replace `app/ui/`.
  The typecheck/lint/raw-hex/a11y baselines were raised only for per-file-verified duplicates and
  should fall as each surface's UI is replaced.
- **Push the branch; Vercel preview last** — blocked by the project's verified-commits requirement
  (commits are unsigned).
- **Staging:** Vedanshu binds `staging.ikanhealth.in` → this branch in the Vercel dashboard;
  `sandbox.ikanhealth.in` stays on `equip-carry-forward` as the prod-mirror. Verify each slice on
  staging before merging to ecf; prod goes through `scripts/deploy-prod.sh`, staging through
  Vercel's git integration, never the scripts.
- **After merge, remove the branch from `vercel.json` → `git.deploymentEnabled`** (it is there now).
- **`shared/` is not yet self-contained:** `shared/engine/{scoring,recommendation}-engine.ts` and
  `admin/ui/lib/validation-core.test.ts` import `supabase/functions/server/*` modules. Resolving it
  is Workstream C (§E).
- **Confirm with Vedanshu:** `AdminBackupManager` and `AdminCRUDTesting` were deleted in
  `bf1f67d3` ("delete 30 files nothing imports"), but HANDOFF had flagged them "wire, don't delete —
  Vedanshu's decision". Restore from git if he wanted them wired.
- **Docs describing `usePageContent` as live** (`ARCHITECTURE.md`, `PROJECT-STRUCTURE.md`,
  `systems/repo-hygiene-audit.md`) — being corrected in the concurrent docs pass; confirm.
