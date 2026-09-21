# URL Map — every route, public/auth/private/admin

Pulled from `src/App.tsx`'s `validRoutes` and routing dispatch, 2026-08-07. Direct answer to
"we need URL for all pages" — every route below is real and reachable; this doc exists so the next
person doesn't have to re-derive it from `App.tsx` by hand.

## How routing works here

Single-page app, client-side routed in `App.tsx` — no server-side router, no file-based routing.
`validRoutes` is the whitelist `handleNavigate()` checks before allowing an in-app link to change
the URL; a path not on the list gets redirected away. Slugs exist **only** for KV-driven content
(`/assessment/<slug>`, `/equip/<slug>`) where an admin can create/rename entities — auth screens and
other fixed application routes don't get slugs because there's nothing to author; that's the answer
to "why does `/login`/`/reset-password` stay the same" — those aren't content, they're fixed app
routes, and both already have their own real URLs (`/login`, `/reset-password` — "forgot password"
is the same screen as `/reset-password`, not a separate route with a different name).

## Public (unauthenticated, indexable — in `public/sitemap.xml`)

| URL | Screen | Notes |
|---|---|---|
| `/` | Homepage | |
| `/about` | AboutUs | |
| `/contact` | ContactUs | |
| `/assessment` | Assessments (landing) | |
| `/assessment/<slug>` | AssessmentDetail | 7 real slugs, KV-driven |
| `/equip` | EquipPrograms (landing) | |
| `/equip/<slug>` | EquipDetail | 4 real slugs, KV-driven |
| `/consultation` | Consultation (landing) | |
| `/resource` | Library | |
| `/join/professional` | ProfessionalApplication | Public "become a consultant" form — added to sitemap this pass |
| `/faq`, `/privacy` / `/privacy-policy`, `/terms`, `/contact`, `/return-policy`, `/cancellation-policy` | Legal/support pages | CMS-backed, see `repo-hygiene-audit.md`'s two-parallel-CMS-systems note |
| `/sitemap` | This HTML sitemap page | Added to `public/sitemap.xml` this pass |

**Not indexable, correctly excluded from the sitemap**: `/login`, `/reset-password` (transactional,
no SEO value), anything under Private/Admin below.

## Auth

| URL | Screen | Notes |
|---|---|---|
| `/login` | LoginScreen / AuthForm | Sign in and sign up both live here (tab/state switch, not separate URLs — same pattern as most auth screens) |
| `/reset-password` | ResetPassword | The "forgot password" flow — has its own real URL despite the different name |

## Private (requires a signed-in user)

| URL | Screen | Notes |
|---|---|---|
| `/dashboard` | Dashboard (user) | Landing page after login — has always had a real URL; not the same file as `AdminDashboard.tsx` |
| `/account` | Account | Profile/Security/Integration tabs — see `user-accounts.md` |
| `/mood-journal` | MoodJournal | |
| `/timeline` | Timeline | |
| `/learning-diary` | LearningDiary | Confirmed fully functional this session — see `repo-hygiene-audit.md` |
| `/assessment-flow`, `/assessment-results`, `/assessment-history-detail`, `/assessment-landing` | Assessment-taking flow | |
| `/equip-program-onboarding`, `/equip-program-flow`, `/equip-program-completion`, `/equip-programs-landing` | Equip program flow | |
| `/consultation-detail` | ConsultantDetail | Consultant id passed as component state, not a URL segment — no per-consultant slug exists yet |
| `/resource-detail` | ResourceDetail | Same pattern — resource id via state, not a URL segment |

**On `/dashboard/<username>`**: not implemented, and can't be added as-is — there's no `username`
field in the `user:` profile schema (`user-accounts.md` §18's live schema dump has `name`, `email`,
no handle/username). Adding a per-user dashboard URL needs a real username/handle system first
(uniqueness-checked, admin-editable) — noted for the future taxonomy work, not a same-pass fix.

## Admin (requires `is_admin`, gated behind `/admin/login`)

All fixed this pass — previously about half of these had no working direct URL (click-only, no
`validRoutes` entry). Every one below now updates the browser URL on click and loads correctly on a
fresh page visit.

| URL | Screen | Notes |
|---|---|---|
| `/admin/login` | Admin sign-in | |
| `/admin` (alias) / `/admin/reporting` | AdminDashboard, landing view | Renamed "Reporting" in the UI this pass — was previously "Dashboard", colliding with the user-facing `/dashboard` name. `/admin` kept working as an alias so old links don't break. |
| `/admin/users` | AdminUserManager | |
| `/admin/consultants` | AdminConsultationManager | |
| `/admin/resources` | AdminResourceManager | |
| `/admin/assessments` | AdminAssessmentManager | Confirmed KV-driven, not hardcoded |
| `/admin/equip` | EquipAdminDashboard | Confirmed KV-driven, not hardcoded |
| `/admin/equip-analytics` | AdminEquipAnalytics | Newly given a URL this pass |
| `/admin/media` | AdminMediaManager | |
| `/admin/categories` | AdminCategoryManager ("Meta Manager") | Newly given a URL this pass |
| `/admin/checkin-scales` | AdminCheckinScalesManager | Newly given a URL this pass |
| `/admin/checkin-builder` | AdminCheckinTemplateBuilder | Newly given a URL this pass |
| `/admin/recommendations` | RecommendationRulesManager ("Rules Engine") | Newly given a URL this pass |
| `/admin/scoring-engine` | AdminScoringEngine | Newly given a URL this pass |
| `/admin/block-type-viewer` | AdminBlockTypeViewer | Fixed in an earlier pass this session |
| `/admin/block-gallery` | AdminBlockGallery (`src/admin/blocks/BlockGallery.tsx`) | Added 2026-09-10 — every block type × activity pair, drawn by the real renderer |
| `/admin/settings` | AdminSettingsManager | |
| `/admin/communication` | AdminCommunication | Newly given a URL this pass |
| `/admin/contact-newsletter` | AdminContactSubmissions | |
| `/admin/payment-gateway` | AdminPaymentGateway | Newly given a URL this pass |
| `/admin/kv-audit` | AdminKVAudit | Newly given a URL this pass |

**Removed this pass** (see `repo-hygiene-audit.md`/`CHANGELOG.md` for why): `/admin/analytics`
(redundant, same component already embedded on Reporting), `/admin/crud` ("System Health" — actually
a raw KV CRUD-testing tool, mislabeled), `/admin/backup` (real functionality, removed from nav only
per direct instruction — not broken).

**Page Manager and Hero Banners — removed since (2026-09-21 note).** This pass folded
`AdminHeroBannerManager` into a tab of `AdminPageManager` at `/admin/pages`. Both are gone: the Page
Manager was removed in PR #14 (2026-09-10) and the dead `/admin/pages` route entry was dropped on
2026-09-15. Neither `/admin/pages` nor `/admin/hero-banner` resolves today; page copy lives in
`src/product/site/lib/cms-defaults.ts`.

## Still open

- `/join/professional` vs. a `/consultant/add|join|create`-style name — the current name is
  arguably correct (it's the *public applicant's* form, distinct from the admin's own
  `/admin/consultants` management screen), but flagging as a naming call worth a second look, not
  changed this pass — renaming a public, potentially-already-shared URL needs more certainty than a
  same-pass judgment call, and would need a redirect from the old path if changed later.
- `/consultation-detail` and `/resource-detail` still pass their target id via component
  state/props, not a URL path segment — no per-consultant or per-resource slug exists. Same
  "content needs a slug, fixed routes don't" boundary as everything else, just not built yet for
  these two entity types.
- Dynamic per-page URLs ("URLs will change as per page activity") — noted as a direction, not
  started; today's routes are all static path strings in `validRoutes`, not generated from live
  content beyond the slug-based assessment/equip detail pages that already exist.
