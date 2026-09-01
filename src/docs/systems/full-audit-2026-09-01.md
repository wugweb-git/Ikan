# Full audit — security, code, accessibility, compliance

**Date:** 2026-09-01
**Branch:** `equip-carry-forward` @ `f2ef3f20` (+ 2 uncommitted files)
**Database:** Supabase `Ikan - App` (`jpfvoevxegnknxoqmwye`, ap-south-1, ACTIVE_HEALTHY)
**Scope:** frontend, admin, backend edge function, live database
**Method:** static reading of ~104k lines + read-only SQL against production. Nothing was modified, deployed, or written. No live endpoint was called.

---

## Verdict

There is a **two-request path from anonymous to full admin** on a live database holding 133 mental-health assessment results, 32 journal entries and 724 activity records for real users. Separately, the **account-deletion and data-export buttons do nothing and report success**, and the **SMTP password is served to anyone who asks**.

The app should not take new users until §1 is fixed.

Below, **[VERIFIED]** means I confirmed it myself against the code and/or the live database in this session. **[READ]** means it comes from a source-reading pass I did not independently re-confirm.

---

## 1. Critical — fix before anything else

### 1.1 Anonymous → super-admin in two requests [VERIFIED]

Three defects that chain. Each is confirmed verbatim.

**(a) `POST /auth/signup` resets the password of any existing account.**
`src/supabase/functions/server/index.tsx:323`

```ts
// Handle "already registered" — update the existing user's password instead of failing.
// This keeps the prototype-friendly behavior where any email + password combination works.
if (error.message?.includes('already been registered')) {
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existingUser = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  await supabase.auth.admin.updateUserById(existingUser.id, { password, user_metadata: {...} });
```

Public route. No auth. Uses the service-role key. Anyone who knows an email address sets that account's password.

**(b) `POST /admin/debug/make-admin` promotes the caller.**
`src/supabase/functions/server/admin-routes.ts:58`

```ts
app.post("/admin/debug/make-admin", requireAuth, async (c) => {
  const user = c.get('user');
  const existing = await kv.get(`user:${user.id}`);
  const updated = { ...(existing || {}), id: user.id, email: user.email, is_admin: true, ... };
  await kv.set(`user:${user.id}`, updated);
```

`requireAuth` only. No admin check anywhere in the body. Any signed-up account promotes itself.

**(c) Hardcoded super-admin that repairs its own privileges.** `index.tsx:206` — `admin@wugweb.com` is treated as super-admin, and the middleware *creates* the admin profile if it is missing. `PUT /admin/users/:userId` (`index.tsx:1762`) refuses to demote it.

**Chain:** signup as `admin@wugweb.com` with a chosen password → (a) sets the password (or creates the account) → sign in → (c) grants super-admin on first request. Two requests. No prior access. (b) is a second, independent path from any account.

**What that reaches:** every user's journal entries and assessment results, payment records, full DB restore, `POST /admin/kv-audit/purge-prefix` (mass delete), SMTP and Razorpay config.

**Fix:** delete both `/admin/debug/*` routes; make the "already registered" branch return 409; remove `SUPER_ADMIN_EMAIL` and the auto-repair, grant admin out-of-band.

### 1.2 SMTP password is public [VERIFIED — live, not theoretical]

`index.tsx:3232`:

```ts
app.get("/settings", async (c) => {          // no middleware
  const settings = await kv.get('settings:site');
  return c.json({ settings: settings || {} });   // no field filtering
});
```

I checked the live row. `settings:site` **does contain a populated `smtpPassword`** (16 characters), alongside `smtpUser`, `smtpHost`, `smtpPort`, `smtpFromEmail`. All of it is returned to unauthenticated callers.

Also in that publicly-readable object: `customJs` and `customCss` (currently empty — if ever populated, `PUT /settings` becomes a stored-XSS vector), `googleAnalyticsId`, `facebookPixelId`.

**Fix:** allowlist the public fields; move credentials to `Deno.env` as `BREVO_API_KEY` already is. **Rotate the SMTP password** — assume it is compromised.

### 1.3 Account deletion and data export are fake [VERIFIED]

`src/components/screens/account/Privacy.tsx:86,100`:

```ts
const data = await apiClient.request('/user/export', { method: 'GET' }, true)
  .catch(() => ({ message: 'Export not yet available...' }));
showToast('success', 'Export Requested', ...);

await apiClient.request('/user/delete-account', { method: 'POST' }, true)
  .catch(() => null);
showToast('info', 'Account Deletion', 'Your account deletion request has been submitted.');
await signOut();
```

Neither path exists on the server. I grepped every route: the real ones are `POST /users/export-data` (`index.tsx:811`) and `DELETE /users/me` (`index.tsx:1025`). **The paths do not match.** Both `.catch()` handlers swallow the 404, the toast claims success, and the user is signed out.

The UI around it says *"Permanently delete your account and all data"*, *"This action cannot be undone"*, behind a type-`DELETE`-to-confirm. `FAQ.tsx:88` states deletion *"permanently removes all your data from our systems in compliance with privacy regulations."*

**This is a false compliance claim on a mental-health product.** See §5.

**Fix:** correct the two paths, remove the `.catch()` swallowing, and verify end-to-end. Until then, remove the buttons rather than leave them lying.

### 1.4 Assessment scoring is gone from the database [VERIFIED against live data]

Confirmed by direct SQL, not inference:

| Assessment | Questions | `questions[].scoring` | `daily_content` weights |
|---|---|---|---|
| Feeling depressed and hopeless | 12 | 0 | 12 / 12 ✅ |
| Feeling overwhelmed and anxious | 10 | 0 | 10 / 10 ✅ |
| Struggling to balance life | 8 | 0 | 8 / 8 ✅ |
| Struggling with quality sleep | 8 | 0 | 8 / 8 ✅ |
| **Feeling drained and burned out** | 23 | 0 | **0 / 23** ❌ |
| **Feeling worried and stressed** | 7 | 0 | **0 / 7** ❌ |
| **Unsure or general concern** | 24 | 0 | **0 / 24** ❌ |

`questions[].scoring` is absent on **all 92 questions**. Burnout, Stress and General — the three re-saved through the buggy wizard — have also lost their `daily_content` weights: **54 questions with no weights anywhere.**

Today the player falls back to option index (`src/lib/assessment-adapter.ts:57-64`), which happens to match the documented convention, so scores are *currently* plausible. That is luck, not design.

*Correction to the existing doc:* `src/docs/systems/assessment-scoring-corruption-2026-08-16.md` says 105 questions; the live count is **92**, because commit `dad71778` removed 7 dead placeholders. Reconcile before running the repair SQL.

**Warning on the pending repair.** The repair keys `scoring` off `jsonb_array_elements_text(q->'options')`. Writing `questions[].scoring` **flips the adapter from the index fallback to a trusted map** (`assessment-adapter.ts:73-76`, `q.scoring?.[opt] || 0`). Any key that does not match an option string silently resolves to **0**. If any stored option is an object rather than a plain string, the repair will zero out entire instruments — a user answering "nearly every day" throughout would score 0 and be told "minimal symptoms." **Verify option shapes before running it.**

---

## 2. High — backend authorization

All [READ] from a full route inventory (270 registrations); spot-checked.

| # | Issue | Location | Impact |
|---|---|---|---|
| 2.1 | `POST /upload/refresh-url` — **no auth**, mints a 7-day signed URL for any path the caller names | `index.tsx:4788` | Arbitrary read of practitioners' uploaded credential documents from a private bucket |
| 2.2 | `POST /upload/professional-file` — **no auth**, no MIME allowlist, attacker-controlled path segments | `index.tsx:4759` | Anyone fills the bucket with 10 MB files; hosts arbitrary content on your domain |
| 2.3 | `POST /brevo/send/email\|sms\|whatsapp` — `requireAuth` only; recipient, subject, HTML **and sender** from the request body | `brevo-routes.ts:149,216,260` | Any signed-up user sends phishing from your sender identity and burns SMS credit |
| 2.4 | Payment can be forged — `POST /users/payments` accepts `status:'completed'`; `POST /equip/purchase/:id` writes a completed payment with no gateway | `index.tsx:1127,1172` | Paid programs are free. The correct HMAC check at `index.tsx:2906` exists but nothing requires it |
| 2.5 | CMS pages — POST/PUT/DELETE are `requireAuth`, no admin check; PUT creates on an arbitrary id | `index.tsx:2105,2139,2200,2225` | Any user rewrites or deletes public site pages |
| 2.6 | `GET /admin/activity-logs` — `requireAuth`, no admin check | `index.tsx:2263` | Any user reads 724 activity rows across all users |
| 2.7 | `PUT /hero-banners/:pageKey` — `requireAuth`, no admin check | `hero-banner-routes.ts:96` | Any user rewrites the homepage hero and its CTA link → phishing funnel |
| 2.8 | `POST /admin/set-admin/:userId` — bootstrap check passes when zero admins exist | `index.tsx:1550` | Backdoor after a purge or partial restore; persistence tool after §1.1 |
| 2.9 | Two unauthenticated KV writes; one writes into a caller-supplied `user_id` | `index.tsx:2339,2396` | Anonymous pollution of any user's read history; unbounded array growth |

**Corrections I made to the automated findings:**

- **Password hashing is dormant, not live** [VERIFIED]. `validation.tsx:362` does implement unsalted SHA-256, and `PUT /users/password` would write it — but I queried the live DB: **0 of 8 user profiles carry a `password_hash`**. Nobody has used that endpoint. It is a landmine, not a breach. *However* — that same endpoint does not call `supabase.auth.admin.updateUserById`, so **changing your password does not change your login password**. That is a live correctness bug.
- **Authentication itself is sound.** `requireAuth`/`requireAdmin` both call `supabase.auth.getUser(token)` properly. No header-trust, no anon fallback, identity cannot be forged. Every failure above is *authorization*, not authentication.
- **No IDOR in the user-facing surface.** Every `/user/*` handler derives its subject from the session, never from a param.
- **Corporate routes are dead** — double-prefixed (`corporate-routes.ts:11` adds `/make-server-cc205da9` to a Hono instance that already has that basePath). All five corporate endpoints 404. Ironically they contain the best authorization code in the repo.
- **14 routes are shadowed dead code.** Two of them *weaken* the effective guard: `GET /admin/users` falls back from `requireAdmin` to `requireAuth`+inline check, and `/admin/categories` loses its `ensureAdmin` wrapper.

---

## 3. Database

[VERIFIED by direct query]

**RLS.** `kv_store_cc205da9` (2,001 rows — every piece of application data and all PHI) has RLS **enabled with zero policies**. That is fail-closed for direct PostgREST access, which is correct — but it means **the edge function's own authorization is the only access control on all health data**, and §1.1 breaks it. `wrappers_fdw_stats` has RLS **disabled** and is exposed to anon/authenticated; it holds no user data, but Supabase flags it ERROR:

```sql
ALTER TABLE public.wrappers_fdw_stats ENABLE ROW LEVEL SECURITY;
```

(Presented, not applied — enabling RLS without policies blocks all access. Your call.)

**Live data footprint:** 133 assessment results (5 subjects, 2026-01-01 → 2026-08-31 — actively in use), 32 journal entries, 70 iKan scores, 724 activity logs, 51 payment records, 8 user profiles (3 admins).

**The security dashboard is decorative** [VERIFIED]. `session:` = 0 rows, `rate-limit:` = 0, `api-log:` = 0, `alert:` = 0, `audit:` = 6. `checkRateLimit`, `trackSession`, `logAudit`, `trackFailedLogin` have **no call sites** outside `security.tsx`; `apiLogger` is never mounted. Consequence: **signup, file upload and the Brevo relay are completely unthrottled.** The admin Security tab renders empty and reads as assurance.

Even if wired up, `checkRateLimit` uses `setTimeout` for expiry (`security.tsx:224`) — in an edge isolate torn down after the response, that timer never fires.

**Leaked-password protection is disabled** in Supabase Auth. One toggle, worth taking.

---

## 4. Accessibility (WCAG 2.1 AA)

Full audit in the sub-report. Failing criteria: 1.1.1, 1.2.2, 1.3.1, 1.4.3, 1.4.11, 2.1.1, 2.2.2, 2.3.3, 2.4.7, 3.3.2, 4.1.2.

**Genuine credit first** — these are good and should not be regressed: skip link + `<main>` with route-change focus management (`App.tsx:422,650,672`); a 44px touch-target floor at `pointer:coarse` (`globals.css:646`); a correct global `:focus-visible` at 14.66:1 (`globals.css:630`); `BottomNavBarMobile.tsx` is exemplary; 31 of 71 `ui/` primitives are Radix-backed and inherit focus trap, Escape and ARIA for free; all 41 `<img>` have `alt`.

**The crisis-support path is the most serious finding.**

- `showCrisisSupport` is destructured out of `useCrisisSupport()` at `App.tsx:147` and **never called anywhere**. `isVisible` has no path to `true`. The crisis modal is mounted and unreachable by any input method.
- `detectCrisisKeywords` (`SecurityProvider.tsx:232`) — the function that would spot "suicide", "kill myself" in journal text — has **zero call sites**.
- If it were reachable: the two `priority: 'high'` entries are the 988 Lifeline and Crisis Text Line, rendered as `#EAB308` on white = **1.92:1** (needs 4.5:1). The only crisis button that passes contrast is 911.
- The hotlines are **US numbers (988, 741741)** in an India-facing product (₹ pricing, Razorpay/UPI, `support@ikanhealth.in`). The working crisis path — the iCALL number in `ContactUs.tsx:96` / `cms-defaults.ts:1006` — is separate and statically rendered.

**Triage this with the product owner before the security work.** Either wire it up and localise it, or delete it — a dormant crisis component reads as a safety control that exists.

**Five changes with app-wide reach, in order of leverage:**

1. `<MotionConfig reducedMotion="user">` at the app root — fixes **171** framer-motion sites at once. The existing CSS `prefers-reduced-motion` block does not reach framer-motion, which animates via inline styles.
2. `--ring: #2A2A2A`, drop the `/50` — the focus ring is currently **1.73:1** (needs 3:1) across 12 primitives.
3. `--color-text-muted: #717182` → `~#5F5F6E` — currently passes only on pure white; fails on the `#F5F5F5` page background, `#F3F3F5` inputs, `#F0F0F0` and `#E9EBEF`. **899 call sites** fixed by one token.
4. Add `--color-border-control: #767676` — every border token is ≤1.41:1, so an **off** switch has no perceivable boundary.
5. `ui/alert.tsx` — success is **2.07:1**, warning **1.78:1**. Every success and warning alert in the app is unreadable.

**Then the assessment flow itself:**

- `BlockRenderer.tsx:337-372` — the `checklist` question type has **no input element at all**. A styled `<div>` with `onClick`, and an orphaned `htmlFor` pointing at an id that does not exist. A keyboard or screen-reader user **cannot complete a checklist exercise**.
- `BlockRenderer.tsx:243,439` — answer radios are `peer sr-only` with a `peer-data-[state=checked]:` style and **no `peer-focus-visible:`**. Keyboard users cannot see which answer is focused.
- `BlockRenderer.tsx:392,397` — the free-text placeholder is **1.88:1**, the character counter **2.68:1**.
- `AssessmentResults.tsx` has zero live regions — completing an assessment announces nothing.

**Long tail:** 9 inline `outline: 'none'` (unoverridable — includes password reset and the whole account security panel), 62 unlabelled icon-only buttons, 63 clickable `<div>`s, 289 form controls with no programmatic label (210 relying on placeholder-as-label), 11 hand-rolled modals with no `role="dialog"`/Escape/focus trap.

`ui/accessibility-helpers.tsx` exports `FocusTrap`, `LiveRegion`, `ScreenReaderOnly` and `KeyboardNavigable` — **all four have zero usages.** Someone built the right primitives and nothing adopted them.

---

## 5. Compliance

India's **DPDP Act 2023** applies (India-facing, ₹/Razorpay). Mental-health records are also *sensitive personal data* under the **SPDI Rules 2011**. GDPR applies to any EU user.

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 5.1 | **Right to erasure** — DPDP §12, GDPR Art. 17 | **FAIL** | Deletion button calls a nonexistent endpoint and reports success (§1.3) [VERIFIED] |
| 5.2 | **Erasure actually completes** | **FAIL** | `backup_erased_user_bb1c02a9` retains **19 records** for a user whose account was erased *on request*. Reason field: *"Account deleted from auth.users; residual data erased on request"* [VERIFIED] |
| 5.3 | **Right to access / portability** — DPDP §11 | **FAIL** | Export button hits a nonexistent path. The real endpoint (`index.tsx:822`) queries `journal:${userId}:` — a prefix nothing writes — so journals return empty even when it works [VERIFIED path mismatch; READ prefix bug] |
| 5.4 | **Reasonable security safeguards** — DPDP §8(5) | **FAIL** | §1.1 account takeover; §1.2 public SMTP credentials; no rate limiting; no functioning audit trail |
| 5.5 | **Consent is specific and revocable** — DPDP §6 | **FAIL** | The Privacy "Usage Analytics" toggle writes `privacy_settings` and is read **nowhere**. Engagement events fire unconditionally (`ResourceDetail.tsx:651`). Same for `personalizedContent` and `researchParticipation` |
| 5.6 | **Accurate representations to users** | **FAIL** | "All responses are encrypted" (`Assessments.tsx:573`), "All user data is encrypted" (`FAQ.tsx:139`), "All activities are logged" (admin login) — while assessment content sits in plaintext `localStorage` indefinitely and the audit trail has 6 rows |
| 5.7 | **Children's data** — DPDP §9 (verifiable parental consent under 18) | **GAP** | DOB is collected, but I found no age gate and no parental-consent flow. Needs a product decision, not a code fix |
| 5.8 | **Breach notification** — DPDP §8(6) | **ACTION** | If §1.1 or §1.2 was exploited, notification to the Data Protection Board and affected users is required. There are no access logs to rule it out — that absence is itself the problem |
| 5.9 | **Retention limitation** | **GAP** | One retention constant exists (activity logs, `index.tsx:3370`). No policy for assessment results, journals, or the 5 backup blobs |

**Also relevant to 5.1:** account deletion (`index.tsx:1041`) reconstructs delete keys as `journal_by_user:${userId}:${date}` while `mood-routes.ts:131` writes `journal_by_user:${userId}:${date}:${id}`. Every check-in written through that path leaves its index row behind. Never deleted at all: the mirrored `user_journal_entries` table, `health:*`, `hc_status|hc_data|hc_history:*`, `booking:*`, `assessment_result:*`, and uploaded storage objects. [READ]

**Not currently a problem:** `googleAnalyticsId` and `facebookPixelId` are admin form fields only — I found no code that injects either script. If you wire them up, third-party trackers on mental-health pages need explicit consent first.

---

## 6. Data-integrity bugs (beyond §1.4)

[READ]

- **`useOfflineSync.ts:57`** — offline mood sync destructures 7 fixed keys and drops every custom check-in template answer. `MoodJournal.tsx:347` queues them; `api-client.ts:947` accepts them; the sync path does not pass them. **This is the same bug the uncommitted change just fixed one case below, left in place.** One-line fix.
- **`useOfflineSync.ts:208-225`** — `syncNow` snapshots the queue, awaits the network per item, then `saveQueue(failed)` **wholesale**. Anything queued during the sync is erased. A user finishing an assessment while a sync runs loses it silently. Items past `MAX_RETRIES` are dropped with only a `console.warn`.
- **`AssessmentEditPageWizard.tsx:308,408`** — the admin editor loads through `getAssessment`, which falls back to a **24-hour offline cache** on any error, silently. `handlePublishToggle` then PUTs that cached object back. Admin B with a stale cache clicking Publish overwrites admin A's day of edits.
- **`AssessmentEditPageWizard.tsx:311`** — `daily_content` is regenerated only when *entirely absent*, but `persistWizard` unconditionally rewrites `questions[]` from it. Any edit made to `questions[]` outside the wizard is reverted on the next autosave. `src/docs/assessments/stress.md:12` records a manual DB intervention that was needed for exactly this.
- **`AssessmentEditPageWizard.tsx:359-366`** — the save half does not apply the option-normalisation the load half added (`:36-42`). Object-shaped options stringify to the key `"[object Object]"`, collapsing every option onto one key. Combined with the adapter's `|| 0`, the question then scores 0 forever. Also `weights.length > 0` is a weak guard — typing `"0,1"` for a 5-option question passes and zero-scores options 3-5.

**On the uncommitted files:** `useOfflineSync.ts` (forwarding `maxScore`/`sectionScores`) is **correct and complete** — verified against `AssessmentFlow.tsx:366`, `api-client.ts:836` and `assessment-routes.ts:100`. `AssessmentEditPageWizard.tsx` is **right in direction, not sufficient, and adds risk** — see the §1.4 warning. Do not ship it without the normalisation fix and a `weights.length === options.length` guard.

---

## 7. Client-side trust

[READ]

- **`EquipDetail.tsx:159`** — unpublished programs are hidden by a *client-side* check, and `GET /equip/programs/:equipId` (`equip-routes.ts:69`) has **neither auth nor a published filter**. Unreleased content is readable by anyone who guesses an id.
- **`AuthContext.tsx:103`** — `is_admin` is seeded from `localStorage.getItem('ikan_is_admin_<uid>')`. Any user can set it in devtools. (The server ignores it, so this is UI-only — but `App.tsx:481` gates `/admin` on `!user`, not on `is_admin`, so any logged-in user gets the admin console shell.)
- **`AuthContext.tsx:414`** — sign-out removes exactly one localStorage key. Left on the device: the full mood journal with free-text notes, cached assessments, the unsynced queue, `dashboard_data_*`, and `sessionStorage.lastAssessmentResults` (full score, interpretation, every response). **Cache keys are not namespaced by user**, so on a shared device the next user can be served the previous user's journal from cache.
- **`SecurityProvider.tsx:63`** — security events POST to `/api/security-log`. There is no `api/` directory, and `vercel.json` rewrites `/(.*)` → `/index.html`, so every POST gets `200 text/html` and `.catch` never fires. Nothing is recorded.
- **`AdminSettingsManager.tsx:735`** — all five Feature Toggles are inert. `enableComments`, `enableAnalytics`, `enableNotifications` appear nowhere else in the codebase; `maintenanceMode` and `enableUserRegistration` are declared and never read. **An admin flipping "Maintenance Mode" during an incident will not take the site down.**
- **`utils/supabase/info.tsx`** — the bundled key is the `anon` key (JWT decoded, `role: anon`). Correct. No service-role key or other secret in the bundle.

---

## 8. Order of work

1. **§1.1** — delete `/admin/debug/*`, remove the signup password-reset branch, remove `SUPER_ADMIN_EMAIL`. Nothing else has a boundary until this is done.
2. **§1.2** — filter `GET /settings`. **Rotate the SMTP password.**
3. **§1.3** — fix or remove the deletion/export buttons. Live false compliance claim.
4. **§4 crisis path** — product decision: wire it up and localise, or delete it.
5. **§1.4** — verify option shapes, then run the repair. Do not ship the wizard change without the §6 guards.
6. **§2.1–2.5** — the unauthenticated upload/URL endpoints, the Brevo relay, payment forgery, CMS writes.
7. **§4 five token changes** — highest accessibility leverage per line changed.
8. **§5.2, §5.9** — finish the erasure of the already-erased user; write a retention policy.
9. **§6, §7** — offline sync, stale-cache writes, sign-out cleanup.
10. **Cleanup** — delete the 14 shadowed routes, fix the corporate double-prefix, remove the inert toggles and the dead `AdminAssessmentEditor.tsx` stub.

---

## 9. What I did not check

- **No live endpoint was called.** Every exploit above is from reading code. Confirming §1.1 would mean actually resetting a password or creating an admin; I did not.
- **No writes to the database.** Read-only SQL, and never selecting a secret value — the SMTP password was confirmed by length and non-emptiness only.
- **Rendered contrast** behind `backdrop-filter: blur()` (mobile nav, `IkanScoreCard` at 0.6 alpha) has no fixed ratio and must be measured in a browser.
- **Actual focus order, screen-reader behaviour, reflow (1.4.10), text spacing (1.4.12)** — need a browser and NVDA/VoiceOver.
- **Dark mode.** A complete `.dark` palette exists (`globals.css:441-510`) but nothing anywhere adds the `dark` class. If it is reachable, its `--border` is 1.38:1 and `--ring` 2.65:1.
- **CMS-authored HTML** injected via `dangerouslySetInnerHTML` (`BlockRenderer.tsx:200`) cannot be audited from source.
- **Deployment state.** I did not check what is actually live on Vercel versus what is in this branch.
