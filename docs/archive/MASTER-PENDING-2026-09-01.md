# Master pending — iKan Health

**Compiled:** 2026-09-01
**Sources merged:** `PENDING.md` (49 KB), `CHANGELOG.md` (47 KB), `GOVERNANCE.md`, `AGENTS.md`/`CLAUDE.md`, `src/docs/systems/*` (16 docs), `src/docs/assessments/*` (8), `src/docs/equips/*` (7), the 2026-09-01 full audit, live Supabase state, and live Vercel deployment state.

> ## 🛑 DEPLOY HOLD — active
> **Do not push to Vercel until Vedanshu says otherwise.** No `vercel deploy`, no push to `equip-carry-forward`, no edge-function redeploy. Set 2026-09-01, stays until explicitly lifted.
>
> **Two exceptions, both safe and both urgent — neither ships code:** rotate the SMTP password (§1), and run the scoring repair SQL (§2.5).

> ## ⚠️ Fixed ≠ live — read this before trusting any status below
> **Updated 2026-09-01 16:xx.** The seven items below are now **committed** — five commits on
> `equip-carry-forward`, `5d60a9b3` through `8e05bbfb` — and **still not pushed and not deployed.**
> Production continues to serve `7c21cd02` from 2026-08-07 with every one of those holes open.
> Committed is not shipped; nothing on this list is live except the database repair.
>
> **Two corrections to the row below, both from live data:**
>
> 1. **The backup named below does not exist.** `backup_pre_scoring_repair_2026-09-01` is absent
>    from `information_schema.tables`. The only snapshot in the database is
>    `kv_backup_scoring_20260901` (14 rows, 128 kB), taken at 10:05 — *after* repair 1 and
>    *before* repair 2 was re-applied. It is not a pre-everything backup.
> 2. **Repair 2 had been reverted and was re-applied.** At 10:05 Burnout, Stress and General still
>    held `weights: []` (22, 7 and 24 activities empty, plus one Burnout activity with no weights
>    key). Re-running it changed exactly those 6 records. Repair 1, by contrast, was already in
>    place — a snapshot-vs-current diff returns `questions_identical = true` on all 14 records.
>
> **And a correction to §2.6 made in error, now withdrawn:** an earlier pass reported
> `section_scores` as "present on 10 of 133, not zero". That counted *key presence*. The value is
> `null` in all ten. **Populated breakdowns: zero.** §2.6 as originally written is correct.
>
> | Item | State | Verified |
> |---|---|---|
> | S1 signup password reset | Fixed — returns 409, never touches the account | ✅ |
> | S2 `make-admin` routes | Fixed — both deleted | ✅ |
> | S3 hardcoded super-admin | Fixed — removed from middleware; demotion guard now protects the *last remaining admin* rather than one named address | ✅ |
> | S4 public SMTP password | Fixed — 44-field allowlist, no `smtp*` | ✅ |
> | S12 `set-admin` bootstrap | Fixed — `requireAdmin` unconditional | ✅ |
> | P1 fake delete/export | Fixed — paths corrected, failures surface | ✅ |
> | D1 editor wipes scoring | Fixed — all three guards: shared `normalizeOptions` on load *and* save, `weights.length === options.length`, id-by-id cache reconciliation | ✅ |
> | Scoring data repair | **LIVE in production** — 92/92 questions. Backup is `kv_backup_scoring_20260901`, not the name previously given here — see the corrections above | ✅ |
| Section preset lookup | Fixed — resolves by `slug \|\| slugify(title)` and warns when no preset resolves. **Not verified at runtime** | ⚠️ |
>
> S3's fix is better than what this document originally proposed. It kept the guard and changed what it protects, preserving the "don't lock everyone out" property that simply deleting the check would have discarded.
>
> **Still completely unauthenticated:** `POST /upload/refresh-url`, `POST /upload/professional-file`, `POST /analytics/engagement`, `POST /user-activity/mark-read`. Still under-guarded: `/admin/activity-logs`, hero-banner writes, CMS writes, the Brevo relay, the forgeable payment routes.
>
> **Not blocked by the deploy hold and still not done: rotate the SMTP password.** The code no longer leaks it; the credential that was public is unchanged.

> ## This is the single backlog
> The **iKan Master Pending** artifact and this file are the same thing at different fidelity — the artifact is the browsable version, this is the repo copy. The former "Remediation Board" was renamed into it; there is no separate board.
>
> The **iKan Data Schema & Integrity Map** artifact is the companion *reference*: what each of the fifteen systems is and how it connects, reconstructed from `src/docs/` after the original artifact was deleted. Issues live here; architecture lives there.

---

## 0. Where things actually stand

**Stack:** Vite + React 18 + TypeScript, Tailwind v4, Supabase (Postgres 17 + edge functions + storage), Vercel, Razorpay, Brevo.

**Git:** branch `equip-carry-forward` @ `8e05bbfb` — **5 commits ahead of origin, none pushed.**
(`5d60a9b3` security + privacy + editor guards + section scores in history · `ffd0005c` four stale
equip docs removed · `6fcb496e` tsconfig made loadable so `tsc` can run · `0f306a97` section preset
slug fallback · `8e05bbfb` this doc and the audit docs tracked.)

**Deployment [VERIFIED via Vercel API]:** production is serving `7c21cd02` from **2026-08-07**. Three commits have never reached production:

| Commit | Date | What it carries | Deploy state |
|---|---|---|---|
| `1b4e3dd5` | 08-11 | docs; General builder-sync fix; notification-bell finding | CANCELED (preview, `target: null`) |
| `dad71778` | 08-12 | removes 7 dead placeholder questions | CANCELED |
| `f2ef3f20` | 08-12 | stops double-JSON-encoding `activity_log:`/corporate KV writes | CANCELED |

All three built as previews and were cancelled; none targeted production. **Production has been frozen for 25 days.**

**Uncommitted on disk (Aug 16, never committed):**

| File | What it is |
|---|---|
| `src/components/screens/AssessmentEditPageWizard.tsx` | The scoring round-trip fix — right direction, **not safe to ship as-is** (§2.3) |
| `src/hooks/useOfflineSync.ts` | Forwards `maxScore`/`sectionScores` — **correct and complete** |
| `AGENTS.md` | untracked |
| `src/docs/systems/assessment-scoring-corruption-2026-08-16.md` | untracked |

**Live data:** 2,001 KV rows. 133 assessment results (5 users, through 2026-08-31 — actively in use), 32 journal entries, 70 iKan scores, 724 activity logs, 51 payments, 8 user profiles (3 admin).

---

## 1. Security — blocks everything else

Full detail: `src/docs/systems/full-audit-2026-09-01.md`. Summary of what must be fixed first.

| # | Issue | Location | State |
|---|---|---|---|
| **S1** | `POST /auth/signup` resets any existing account's password (public route, service-role key) | `index.tsx:323` | **VERIFIED** |
| **S2** | `POST /admin/debug/make-admin` promotes the caller — `requireAuth` only | `admin-routes.ts:58` | **VERIFIED** |
| **S3** | `admin@wugweb.com` hardcoded super-admin; middleware auto-creates the admin profile | `index.tsx:206` | **VERIFIED** |
| **S4** | `GET /settings` is public and unfiltered; `settings:site` holds a populated 16-char `smtpPassword`, `smtpUser`, `smtpHost` | `index.tsx:3232` | **VERIFIED live** |
| **S5** | `POST /upload/refresh-url` — no auth; mints a 7-day signed URL for any path in the private uploads bucket | `index.tsx:4788` | read |
| **S6** | `POST /upload/professional-file` — no auth, no MIME allowlist, attacker-controlled path segments | `index.tsx:4759` | read |
| **S7** | `POST /brevo/send/email\|sms\|whatsapp` — `requireAuth` only; recipient, HTML **and sender** from the body | `brevo-routes.ts:149,216,260` | read |
| **S8** | Payment forgeable — `POST /users/payments` accepts `status:'completed'`; `/equip/purchase/:id` writes one with no gateway | `index.tsx:1127,1172` | read |
| **S9** | CMS pages POST/PUT/DELETE — `requireAuth`, no admin check; PUT creates on an arbitrary id | `index.tsx:2105-2225` | read |
| **S10** | `GET /admin/activity-logs` — `requireAuth`, no admin check | `index.tsx:2263` | read |
| **S11** | `PUT /hero-banners/:pageKey` — `requireAuth`, no admin check → homepage CTA is a phishing funnel | `hero-banner-routes.ts:96` | read |
| **S12** | `POST /admin/set-admin/:userId` — bootstrap check passes when zero admins exist | `index.tsx:1550` | read |
| **S13** | Two unauthenticated KV writes, one into a caller-supplied `user_id` | `index.tsx:2339,2396` | read |

**S1+S2+S3 chain to anonymous → super-admin in two requests.** That is the gate on everything below.

**Actions beyond code:** rotate the SMTP password (assume compromised). Enable leaked-password protection (Supabase → Auth → Providers) — already in `PENDING.md` §A.

**Correction to the 2026-09-01 audit:** that doc offered `ALTER TABLE public.wrappers_fdw_stats ENABLE ROW LEVEL SECURITY;`. **That will fail** — `PENDING.md` §A records it empirically as `42501: must be owner of table` (owner is `supabase_admin`). Use the Supabase dashboard → Security Advisor → "Resolve issue" button instead. This is the sole cause of the recurring weekly "Critical issue" emails.

---

## 2. Assessment scoring — the live data problem

### 2.1 Scoring is missing across the board [VERIFIED live]

| Assessment | Questions | `questions[].scoring` | `daily_content` weights |
|---|---|---|---|
| Depressed and hopeless | 12 | 0 | 12/12 ✅ |
| Overwhelmed and anxious | 10 | 0 | 10/10 ✅ |
| Balance | 8 | 0 | 8/8 ✅ |
| Sleep | 8 | 0 | 8/8 ✅ |
| **Burned out** | 23 | 0 | **0/23** ❌ |
| **Worried and stressed** | 7 | 0 | **0/7** ❌ |
| **Unsure / general** | 24 | 0 | **0/24** ❌ |

`questions[].scoring` is absent on **all 92 questions**; 54 have no weights anywhere. Scoring currently works only because `assessment-adapter.ts:57-64` falls back to option index, which happens to match the documented convention.

**Count corrections — the corruption doc contradicts itself.** `assessment-scoring-corruption-2026-08-16.md` states 105 questions in its prose, but **its own per-assessment table sums to 92** (12+10+8+8+23+7+24) — and 92 is what production holds today. The 105 is not explained by the placeholder removals either: the pre-removal total was 98. Treat 105 as unexplained and 92 as the fact. That doc also reports **132** assessment results; production now holds **133**.

### 2.2 Burnout 22 vs 23 — resolved [NEW, VERIFIED]

`PENDING.md` §A has carried this as an open decision: *"Burnout has 22 real items; BAT-23 defines 23. Author a genuine 23rd item, or treat 22 as intentional."*

**Neither.** I pulled all 23 item texts. **Items 9 and 10 are the same question:**

```
 9: "At work, I do not think much about what I am doing, and I function on autopilot"
10:  At work, I do not think much about what I am doing, and I function on autopilot
```

23 rows, **22 unique items**. `PENDING.md`'s "22 real items" was right; the 23rd is a duplicate, not a gap. **The fix is deleting one row, not authoring new clinical content.**

Consequence: every Burnout result in the live data was scored against a duplicated item, inflating the total by up to one item's weight. 133 assessment results exist — determine how many are Burnout before deciding whether to rescore.

Also: `dad71778`'s message claims Burnout went 23 → 22. Live is 23. General (27→24) and Stress (10→7) both match. **Burnout's removal did not land, or landed as 24→23.** Reconcile before trusting the commit log.

Cosmetic, same pass: 8 of 23 items carry literal escaped quote marks in the stored text (items 9, 13, 14, 18, 19, 20 …), the rest don't. Users see the quotes.

### 2.3 Do not ship the wizard fix as-is

The uncommitted `AssessmentEditPageWizard.tsx` starts writing `questions[].scoring`. That **flips the player from the index fallback to a trusted map** (`assessment-adapter.ts:73-76`, `q.scoring?.[opt] || 0`). Any key that doesn't match an option string silently becomes **0**.

Required before it ships:

1. Hoist the option normaliser from `convertQuestionsToDay` (`:36-42`) into the save path (`:359-366`) — currently object-shaped options stringify to the single key `"[object Object]"`.
2. Guard `weights.length === options.length`. The current `weights.length > 0` passes on `"0,1"` typed for a 5-option question and zero-scores options 3–5.
3. Reconcile `daily_content` against `questions[]` on load (`:311`) — right now it regenerates only when *entirely absent*, so any external edit to `questions[]` is reverted on the next autosave.

**Same warning applies to the pending DB repair SQL.** It keys `scoring` off `jsonb_array_elements_text(q->'options')`. Verify every stored option is a plain string first — if any is an object, that UPDATE zeroes out whole instruments and a user answering "nearly every day" throughout scores 0 → "minimal symptoms."

### 2.4 The root cause, and the two repair statements

`AssessmentEditPageWizard.tsx` — the live admin editor — round-trips every question through the Block/`daily_content` shape:

- **Load** (`convertQuestionsToDay`): any legacy type not exactly `multiple-choice` / `scale` / `text` defaulted to `subtype: 'mcq'`, and hardcoded `scoring: { enabled: true, weights: [] }` regardless of the question's real scoring.
- **Save** (`persistWizard`): wrote questions back as `{id, text, type, options, required, timeLimit}` — **no `scoring` key at all** — and collapsed the type into four buckets via the coarse `interaction` value instead of the finer `subtype`.

Opening and saving any question silently wiped its scoring and flattened its type. This is also what "the CRUD function is broken" meant: per-question CRUD was replaced by this converter at some point — the file's own comment reads `LEGACY QUESTION FUNCTIONS REMOVED`, and `git log` on it shows only auto-generated *"Update files from Figma Make"* commits. No fix commit had ever touched it, despite backend scoring being fixed elsewhere.

**Why the reconstruction is safe.** Each weight derives from the option's own 0-based position, cross-checked against three verification docs written earlier and independently:

- `stress.md` — "Options use a proper 0-indexed scale (`0 - Never` … `4 - Very Often`)".
- `burnout.md` — options 1–5 scored 0–4 by array index, **+1 offset applied downstream** by `BURNOUT_SECTIONS`' `offset: 1`, not baked into the raw weight. Do not add the offset in the repair.
- `general.md` — reverse-scored resilience items are reversed at *section* level via `reverseQuestionIds`, not per-question. General mixes 4-, 5- and 6-point scales; because reconstruction is per-question, that does not matter.

Depression's surviving `daily_content` weights `[0,1,2,3]` match this convention exactly, confirming it end to end. No external backup was needed.

### 2.5 The repair SQL — validated, never run

A dry-run `SELECT` confirmed the reconstruction reproduces Depression's known-good scoring exactly. The `UPDATE` was **blocked twice by a safety classifier** as a direct production-data write, so it must be run by a person in the Supabase SQL editor for project `jpfvoevxegnknxoqmwye`. **Take a manual dashboard backup first** — this is an UPDATE across every assessment record.

**1 — rebuild `questions[].scoring` on all 7 assessments and their `assessment:` mirrors:**

```sql
UPDATE kv_store_cc205da9 k
SET value = jsonb_set(
  k.value,
  '{questions}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN jsonb_typeof(q->'options') = 'array' AND jsonb_array_length(q->'options') > 0
        THEN q || jsonb_build_object(
          'scoring',
          (
            SELECT jsonb_object_agg(opt.value, opt.ordinality - 1)
            FROM jsonb_array_elements_text(q->'options') WITH ORDINALITY AS opt(value, ordinality)
          )
        )
        ELSE q
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(k.value->'questions') WITH ORDINALITY AS t(q, ord)
  )
)
WHERE (k.key LIKE 'assessment_def:%')
   OR (k.key LIKE 'assessment:%'
       AND k.key NOT LIKE 'assessment_def:%'
       AND k.key NOT LIKE 'assessment_result:%'
       AND k.key NOT LIKE 'assessment_slug:%'
       AND k.key NOT LIKE 'assessment_response_by_user:%');
```

**2 — rebuild `daily_content` weights for Burnout / Stress / General only:**

```sql
UPDATE kv_store_cc205da9 k
SET value = jsonb_set(
  k.value,
  '{daily_content,0,activities}',
  (
    SELECT jsonb_agg(
      a || jsonb_build_object(
        'exerciseConfig',
        (a->'exerciseConfig') || jsonb_build_object(
          'scoring', jsonb_build_object(
            'enabled', true,
            'weights', (
              SELECT jsonb_agg(gs)
              FROM generate_series(0, jsonb_array_length(a->'exerciseConfig'->'options') - 1) AS gs
            ),
            'maxScore', jsonb_array_length(a->'exerciseConfig'->'options') - 1
          )
        )
      )
      ORDER BY ord
    )
    FROM jsonb_array_elements(k.value->'daily_content'->0->'activities') WITH ORDINALITY AS t(a, ord)
  )
)
WHERE k.value->>'title' IN ('Feeling worried and stressed','Feeling drained and burned out','Unsure or general concern')
  AND (k.key LIKE 'assessment_def:%' OR (k.key LIKE 'assessment:%' AND k.key NOT LIKE 'assessment_def:%'));
```

**Order matters:** run the repair *before* committing the editor fix, and verify option shapes before either — see the §1.4 warning about the adapter's `|| 0`.

### 2.6 Score breakdown does not survive into history

`section_scores` is null on every `assessment_result:` — **all 133, verified 2026-09-01, not merely sampled.** Two separate causes were originally identified; a third, and the real one, has since been found.

- **`useOfflineSync.ts`** destructured six of eight fields and silently dropped `maxScore` and `sectionScores` on every response synced through the queue. **Fixed and committed** (`5d60a9b3`).
- **`AssessmentHistoryDetail.tsx`** had **zero references** to `section_scores` / `sectionScores`, and its `AssessmentAttempt` type did not declare the field. **Fixed and committed** (`5d60a9b3`) — it now renders `SectionReportCard` behind the same `sections.length >= 2` gate as `AssessmentResults`. **It displays nothing today**, because no stored result has a populated breakdown.
- **[NEW, and the actual cause] The preset lookup misses, so nothing is ever sent to save.** `f132be3a` ("persist section_scores end-to-end") is an ancestor of production `7c21cd02`, so the write path has been live since 2026-08-07 — and the data shows it firing: **exactly 10 results exist after 2026-08-07 and all 10 carry the `section_scores` key; the 123 older ones have no key at all.** The key appears precisely when the code went live. Every value is `null`, and the backend writes `data.sectionScores ?? null`, so the client is sending nothing — meaning `sectionScores.sectioned` is false, meaning `SECTION_PRESETS[assessment.slug]` misses. Two candidates were ruled out live: stored slugs match the preset keys exactly, and stored response keys match their definitions' question ids exactly (`gen-q1`, `burnout-q2`, …). What remains is an absent `slug` on the assessment object in that scope. `0f306a97` resolves the preset by `slug || slugify(title)` and warns loudly naming any key that fails to resolve. **Not verified at runtime** — the preview server cannot start on this machine.

**This reorders the work.** Backfilling the 133 historical results is not the blocker people assumed; *saving a breakdown at all* is. Until a newly-completed assessment writes a populated `section_scores`, the history UI has nothing to show and a backfill has no live counterpart to validate against. Deploy, take one General assessment, and check whether the new warning fires — that is the next step, not the backfill.

### 2.7 Balance scoring is still mathematically wrong

From `58f2a2ef`: Balance mixes 5 positively-worded and 3 negatively-worded items and sums them with **no reversal applied**. A well-balanced person scores 28/32 — inside the "Imbalanced" band. Carried forward; not fixed.

---

## 3. Compliance

| # | Requirement | Status | Evidence |
|---|---|---|---|
| C1 | Right to erasure (DPDP §12 / GDPR 17) | **FAIL** | `Privacy.tsx:100` calls `/user/delete-account`; the real route is `DELETE /users/me`. `.catch(() => null)` swallows the 404 and the toast claims success |
| C2 | Erasure completes | **FAIL** | `backup_erased_user_bb1c02a9` retains **19 records** for a user erased *on request* |
| C3 | Access / portability (DPDP §11) | **FAIL** | `Privacy.tsx:86` calls `/user/export`; real route is `POST /users/export-data`. Even that queries prefix `journal:${userId}:`, which nothing writes — journals always return empty |
| C4 | Reasonable security safeguards (DPDP §8(5)) | **FAIL** | §1 |
| C5 | Specific, revocable consent (DPDP §6) | **FAIL** | The Privacy "Usage Analytics" toggle is read nowhere; `ResourceDetail.tsx:651` fires engagement events unconditionally |
| C6 | Accurate representations | **FAIL** | "All responses are encrypted" (`Assessments.tsx:573`), "All user data is encrypted" (`FAQ.tsx:139`), "All activities are logged" (`AdminLoginScreen.tsx`) — while assessment content sits in plaintext `localStorage` and the audit trail has 6 rows |
| C7 | Children's data (DPDP §9) | **GAP** | DOB is collected; no age gate, no parental-consent flow. Product decision |
| C8 | Breach notification (DPDP §8(6)) | **ACTION** | If S1/S4 was exploited, notification is required. There are no access logs to rule it out |
| C9 | Retention limitation | **GAP** | One constant exists (activity logs, `index.tsx:3370`). Nothing for assessments, journals, or the 5 backup blobs |

Also blocking full erasure: `index.tsx:1041` reconstructs delete keys as `journal_by_user:${userId}:${date}` while `mood-routes.ts:131` writes `…:${date}:${id}` — index rows survive. Never deleted at all: the `user_journal_entries` mirror table, `health:*`, `hc_status|hc_data|hc_history:*`, `booking:*`, `assessment_result:*`, uploaded storage objects.

---

## 4. Accessibility

Full detail in the audit. Five token-level changes carry most of the value:

1. `<MotionConfig reducedMotion="user">` at the app root — fixes **171** framer-motion sites. The CSS `prefers-reduced-motion` block does not reach framer-motion.
2. `--ring: #2A2A2A`, drop `/50` — the focus ring is **1.73:1** across 12 primitives (needs 3:1).
3. `--color-text-muted` `#717182` → `~#5F5F6E` — passes only on pure white today; **899 call sites**.
4. Add `--color-border-control: #767676` — every border token is ≤1.41:1; an **off** switch has no perceivable boundary.
5. `ui/alert.tsx` — success **2.07:1**, warning **1.78:1**. Every success and warning alert is unreadable.

**Safety-critical, above the rest:** `showCrisisSupport` is destructured out at `App.tsx:147` and never called. `detectCrisisKeywords` (`SecurityProvider.tsx:232`) has zero call sites. **The crisis modal cannot be opened by any input method.** If it could, the 988 Lifeline renders at **1.92:1** — and the numbers are US (988, 741121) on an India-facing product. The only working crisis path is the static iCALL number in `ContactUs.tsx:96`. Product decision: wire it up and localise, or delete it.

**Assessment flow specifically:** the `checklist` question type (`BlockRenderer.tsx:337-372`) has **no input element** — a styled `<div onClick>` and an orphaned `htmlFor` pointing at a nonexistent id. Keyboard and screen-reader users cannot complete a checklist exercise.

---

## 5. Data-integrity bugs

- **`useOfflineSync.ts:57`** — offline mood sync drops every custom check-in template answer. Same bug the uncommitted change fixed one case below, left in place. One line.
- **`useOfflineSync.ts:208-225`** — `syncNow` overwrites the queue wholesale; anything queued during a sync is erased silently. Items past `MAX_RETRIES` are dropped with a `console.warn`.
- **`AssessmentEditPageWizard.tsx:308,408`** — the admin editor loads through a 24-hour offline cache fallback and can PUT it back over the server. Two admins + one flaky connection = a day of edits gone.
- **`EquipDetail.tsx:159`** — unpublished programs are hidden client-side only; `GET /equip/programs/:equipId` has neither auth nor a published filter.
- **`AuthContext.tsx:414`** — sign-out clears one localStorage key. The mood journal (with free-text notes), cached assessments, the unsynced queue and `sessionStorage.lastAssessmentResults` all survive, **not namespaced by user** — shared-device leak.
- **`SecurityProvider.tsx:63`** — security events POST to `/api/security-log`; `vercel.json` rewrites `/(.*)` → `/index.html`, so every POST returns 200 HTML and nothing is recorded.
- **`AdminSettingsManager.tsx:735`** — all five Feature Toggles are inert. **"Maintenance Mode" will not take the site down.**

---

## 6. Carried forward from PENDING.md (still open)

**Blocked on a human:**
- `wrappers_fdw_stats` RLS → Supabase dashboard button (not SQL — see §1).
- Leaked-password protection → Supabase Auth → Providers.
- iKAN wellness-score aggregation — explicitly deferred, don't start opportunistically.
- Scoring Engine is **empty, not broken** — 0 `scoring-profile:` rows, no assessment has `scoring_profile_id`. Needs someone to use the screen or a decision to retire it.
- `ProgramCheckIn.tsx` (day 7/14/30 milestone) has no admin authoring surface — 4 hardcoded questions.
- 2 ghost `user:` rows not deleted — one has 7 `journal_by_user:` entries, one has a live enrollment + iKan score. Purge / reassign / keep-for-compliance is a decision.

**Needs production verification (§B):** section-scoring UI (`65cef6ba`) was never visually confirmed. Take one General and one Burnout on production. **Blocked by the deploy hold** — and note production is on `7c21cd02`, so what's live may not be what §B describes.

**Known defects, diagnosed not fixed:**
- `PUT /settings` overwrites while `PUT /admin/settings` merges — same key, two semantics.
- `mood:` prefix collision — three writers, two shapes, one namespace.
- CMS page CRUD doesn't maintain `page_slug:` — will drift again on the next page edit.
- Two parallel CMS page systems (`cms_page:{slug}` and `page:page_…`) both live for the same logical pages, nothing keeps them in sync.
- `activity:daily:{date}` has no size cap; one key already held 1,357 events (~300 KB) and grows on every purge run.
- 3 of 7 equips lack an `equip_program:` user copy → run `POST /admin/kv-audit/sync-prefixes`.
- Sleep Tight has 16 of 31 duplicated filler days; Burnout Reset has a "(Copy)"-titled day.
- `Dashboard.tsx` fetches `GET /recommendations` and never renders it — either wire `RecommendationCards` to it or stop fetching.
- Check-in not migrated to Blocks; needs an underscore → hyphen normalisation pass.
- `interaction_type` / `day_config_type` metadata types are decorative; `day_config_type`'s 11 KV values disagree three ways with code.

**Stale numbers to correct in PENDING.md:** `activity_log:` is now **724 rows**, not 604 (the 604 figure was accurate on 2026-08-12; it has grown since). Burnout is 23 rows / 22 unique — see §2.2.

---

## 7. Dead code to delete

- 14 shadowed routes (Hono first-match). Two *weaken* the guard: `GET /admin/users` falls back from `requireAdmin` to `requireAuth`+inline; `/admin/categories` loses its `ensureAdmin` wrapper.
- All 5 corporate routes are **unreachable** — `corporate-routes.ts:11` prepends `/make-server-cc205da9` to a Hono app that already has that basePath. Ironically the best authorization code in the repo.
- `src/components/admin/AdminAssessmentEditor.tsx` — 34-line stub, never imported, all four CRUD bodies empty. A hazard for anyone grepping for the assessment editor.
- `useOfflineSync.ts:69-81` — `block_response` and `day_complete` cases are never queued. Equip progress is simply lost offline.
- `ui/accessibility-helpers.tsx` — `FocusTrap`, `LiveRegion`, `ScreenReaderOnly`, `KeyboardNavigable` all have **zero** usages.
- `checkRateLimit`, `trackSession`, `logAudit`, `trackFailedLogin`, `createSecurityAlert`, `apiLogger` — no call sites outside their own files. `session:`, `rate-limit:`, `api-log:`, `alert:` are all 0 rows [VERIFIED].

---

## 8. Closed — do not re-investigate

Each was reported or suspected, then checked properly and found not to be a problem. Recorded so the next session does not spend time on it again.

- **Orphaned assessment results — zero, not many.** 132 records checked live; 40 do not resolve to a current definition, and all 40 carry synthetic `checkin_*` ids that `CLAUDE.md` documents as legitimately having no target. **True orphans: 0.** Every declared relation in the registry also re-ran at zero.
- **Unsalted password hashing is dormant.** The SHA-256 helper is real and `PUT /users/password` would write it, but 0 of 8 profiles carry a hash. A landmine to remove, not an incident. *(The same route not calling Supabase to change the real login password is a live bug and stays open.)*
- **Authentication itself is sound.** Both middlewares verify the JWT against a service-role client and reject properly. No header trust, no anon fallback. Every security finding here is authorization, not authentication.
- **The bundled Supabase key is the anon key.** Decoded and confirmed; it belongs in the bundle. No service-role key or other secret in the frontend source.
- **No IDOR in the user-facing surface.** Every `/user/*` handler derives its subject from the session. The only `:userId` routes are admin ones, and those check the flag.

---

## 9. Order of work

Everything below is code and review only, except steps 2 and 3 — neither ships code, and neither is blocked by the hold.

1. **S1, S2, S3** — delete `/admin/debug/*`, return 409 on "already registered", remove `SUPER_ADMIN_EMAIL` and the auto-repair. *Gates everything below.*
2. **S4** — **rotate the SMTP password now**, then filter `GET /settings`.
3. **§2.5** — verify option shapes, back up from the dashboard, run both repair statements in the SQL editor. Before the editor fix, not after.
4. **C1, C3** — fix the two endpoint paths and stop swallowing errors, or remove the buttons.
5. **§4 crisis path** — product decision: wire it up and localise, or delete it.
6. **§2.2** — delete the duplicate Burnout item; decide whether to rescore existing Burnout results.
7. **§2.3** — add the normaliser, the length guard and the cache reconciliation, then commit both uncommitted files.
8. **§2.6** — wire `section_scores` into `AssessmentHistoryDetail.tsx`.
9. **S5–S13** — remaining authorization gaps.
10. **§4** five token changes.
11. **C2, C9** — finish the erasure; write a retention policy.
12. **§5, §7** — offline sync, stale-cache writes, sign-out cleanup; then the dead code and the corporate double-prefix.
13. **When the hold lifts:** ship everything together with `npx vercel@latest deploy --prod --yes` from a machine with Vercel auth — a git push only produces another cancelled build, and an assistant sandbox has no token (`vercel whoami` returns "Logged out"). Then run §B production verification, and only then consider backfilling section scores on the 133 historical results.

---

## 10. Provenance

**[VERIFIED]** in this session, against code and/or live systems: S1–S4; the §2.1 scoring table; the §2.2 Burnout duplicate; the 92-question count; deployment state via the Vercel API; `session:`/`rate-limit:`/`api-log:`/`alert:` = 0 rows; `password_hash` on 0 of 8 profiles (so the unsalted-SHA-256 issue is **dormant**, not a live breach); `settings:site` containing a populated `smtpPassword`; the erased-user backup retaining 19 records.

**[read]** everything else — from source reading, not runtime confirmation.

**Not done, deliberately:** no live endpoint was called; no writes to Supabase; no deploy; no git commit or push; secret values were never selected (the SMTP password was confirmed by length and non-emptiness only).

---

# Closeout pass — 2026-09-02

Five database items were authorised (`kv_backup_closeout_20260902`, 136 rows). Two were applied,
two turned out to be non-findings, and one is now **blocked on a source document** because the
prescribed fix would have destroyed live clinical content. Every claim below was checked against a
live record before acting, per `GOVERNANCE.md`.

## Applied

| # | Change | Evidence |
|---|---|---|
| C-2 | **General's placeholder bands removed.** `scoring.ranges` set `null` on `assessment_def:` and `assessment:` per `general.md:41-44` ("Overall Score: NIL"). 24 questions intact on both. | verified post-write |
| C-3 | **Privacy overclaims corrected in both places.** `cms_page:privacy` was published and overriding the code default. | all three strings now absent from KV and from `cms-defaults.ts` |

Three claims were removed, not one: *"End-to-end encryption for all sensitive data transmission and
storage"*, *"multi-factor authentication for all team members"*, and *"Third-party security audits and
compliance with healthcare data standards"*. **The C6 correction had only ever landed on the two FAQ
answers (`cms-defaults.ts:806,991`); the privacy page's own security block at line 135 still carried the
original wording.** The replacement text is not from a source document — it is written to be defensible
rather than accurate-by-citation, and **should get a legal read** before it is treated as final.

## Non-findings — no write made

**C-4 is wrong on both halves.**

- *"10 more `day:` rows than embedded `daily_content`"* — there is nothing to compare against. All four
  equip records carry `days: []`; days live only as standalone rows. The counts reconcile exactly:
  8 + 33 + 33 + 31 = **105**, matching the 105 `day:` rows. Zero rows have a missing or dangling
  `equip_id`. This is the same class of error as the 328-false-orphan and `resource → category`
  incidents: a relation checked against the wrong entity.
- *"`dayType` null on all 105"* — the key is absent from all 105 rows in **both** spellings
  (`dayType` and `day_type`), so nothing was nulled out. `progress-service.ts:399` already reads
  `day.dayType || day.day_type || 'learning'`. Assigning real day types is still worthwhile
  (`blocks.md` (formerly `taxonomy.md`, folded in 2a7f9c9f) items 8–9) but it is a content-quality improvement, not a defect.

## Blocked — and the approved fix was unsafe

**C-1 / §2.2 Burnout must not be actioned as written.** The plan, this document, `burnout.md:5,25`
and `PENDING.md` §A all prescribe deleting one of items 9/10 as a duplicate. Deleting a row would
**destroy a real BAT item** and drop Mental Distancing from 5 scored items to 4.

The two ids are referenced in `assessment-section-presets.ts:174-175` as *different* items. Three
sources disagree about which text belongs to which id:

| Source | `block-…36410` | `block-…38342` |
|---|---|---|
| `assessment-section-presets.ts` | autopilot | "strong aversion towards my job" |
| live `questions[]` | autopilot | **autopilot** ← the corruption |
| live `daily_content` | "I struggle to find any enthusiasm for my work" | autopilot |

Every other Mental Distancing item holds its own distinct text, so exactly one field is corrupt —
but no two sources agree on its correct value. **Resolving this needs the BAT-23 instrument, not a
judgement call**; picking a winner would mean authoring clinical content. Max score stays 92, not 88.

## Also fixed this pass — the block render bug

`blocks.md` (formerly `taxonomy.md`, folded in 2a7f9c9f) item 1 flagged four authored subtypes falling through `resolveInteraction()` to a
free-text box. **[CORRECTED 2026-09-02] The doc said 9; I said 57; the true live figure is 12.** I counted the
standalone `block:` rows — which are **dead**. `equip-routes.ts:210-214` records that the
`day:`/`block:` REST surface was removed 2026-08-06, that the editor has always saved the whole
tree as one inline `daily_content` array, and that these rows are "orphan day:/block: records
nobody reads". `ProgramPlayer.tsx:172` reads only `program.daily_content`, and `api-client.ts`
has no day/block routes. Live undeclared subtypes, from `daily_content`:

| subtype | live blocks | dead `block:` rows | now maps to |
|---|---|---|---|
| `matrix` | **8** | 21 | `input-table` |
| `text_list` | **1** | 21 | `check` |
| `scale` | **1** | 14 | `rate` |
| `row_list` | **1** | 1 | `check` |
| `number` | **1** | 1 | *left unmapped — no numeric interaction exists; the new warning surfaces it* |

**11 live blocks fixed**, not 57. The fix itself is still correct — the resolver maps whatever
flows through it — but its scope was overstated by 5x, by me, in the direction of false
importance. The original "9" was closer than my correction.

`ExerciseConfig.subtype` declared 12 terms and live content uses 6 it had never heard of. `'rating-scale'`
and `'clinical-instrument'` were **already** unreachable `TS2678` cases before this change — two of the
long-standing 220 errors were this same bug, sitting in the switch doing nothing. The union now matches
live content, and the default case logs the subtype and block id instead of silently degrading.

Typecheck **220 → 216**. Build passes.

> **Note on the numbers in this file.** Two counts corrected today: this pass found 137 results where
> §2.6 says 133, and the block bug is 11 live blocks where `blocks.md` (formerly `taxonomy.md`, folded in 2a7f9c9f) says 9. Both earlier figures were
> honest counts taken at an earlier date against a smaller dataset — but re-count before acting on any
> figure here rather than quoting it.

---

> **This file stops here.** A further pass the same day — two handoffs plus a 20-item bug brief
> — shipped the block census baseline, the catalog reconciliation, and 17 code and data fixes
> (`9251d21a` … `a33ebb4d`). It is recorded in **`PENDING.md` § "Bug-brief pass — 2026-09-02"**,
> not here, because that is the file kept current per deploy. Do not treat the sections above as
> the live backlog.
