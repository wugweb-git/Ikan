# Changelog — iKan Health

All notable changes to the iKAN Health platform are documented in this file.

---

## [2026-11-22] — Production Default Branch Renamed to wordpress, Full Resources Revamp & CI Ratchet Fixes

### Added
- **Default Branch Transition to `wordpress`**: Designated `wordpress` as the GitHub default and primary production deployment branch. Updated `scripts/deploy-guard.sh` (`PROD_BRANCH="wordpress"`), `AGENTS.md`, `CLAUDE.md`, `GOVERNANCE.md`, and `SESSIONS.md`.
- **Full Clinical Resources Revamp (`resources.php` & `single.php`)**:
  - Implemented Schema.org structured data JSON-LD (`@type: Article / VideoObject / AudioObject` on single posts, `CollectionPage` / `ItemList` on archive).
  - Pinned responsive reading progress bar (`#reading-progress-bar`) at the top of the viewport.
  - Added clinical author byline and verification badge ("Medically Reviewed by Dr. Divya Jain, Ph.D. & iKAN Advisory Board").
  - Added metadata pills with Lucide icons (`BookOpen` / `Play` / `Headphones` for format, `Clock3` for duration, `CalendarDays` for date, `UserRound` for author).
  - Added interactive category & tags pills linking directly to search queries.
  - Implemented `SourceCard` displaying publisher attribution, licence, and language for NHS, NIMH, UCLA MARC, and WHO materials.
  - Integrated "Related in iKAN" section with Stacked Assessment cards (PHQ-9, GAD-7, PSS-10, BAT-23, WHO-5), Equip Program cards (Stress Buster, Unburn, Sleep Tight), and 1:1 Clinical Consultation cards.
  - Added "Keep Reading" recommendation section with 3 related cards from the same category.
  - Added responsive CSS styling in `style.css` for score tables (formatted into readable cards on mobile), CSS progress charts, and bibliography sources.

### Fixed
- **TypeScript Typecheck Ratchet (TS2339 in `src/shared/lib/logger.ts`)**: Safely typed `import.meta.env` with `CustomImportMeta` interface, lowering baseline from 103 down to 102.
- **ESLint No-Empty Error (`scripts/update-theme-manifest.mjs`)**: Fixed empty `catch {}` block statement with `catch { existing = null; }`.
- **Script Path Verification (`scripts/check-script-paths.mjs`)**: Ignored uncommitted Composer `vendor/` build artifacts from missing-source checks on clean CI checkouts.
- **GitHub Actions CI Gates**: All 9 gates verified passing 100% green across `wordpress` and `wordpress-dev`.

---

## [2026-11-22] — Wugweb Technologies Demo Credentials, Auth Direct Routing & Resource Metadata Enrichment

### Added
- **Direct Auth Routing (`/login`, `/signup`)**: Intercepted `/login` and `/signup` in `functions.php` to serve `template-auth.php` directly (HTTP 200 OK) with 2-step onboarding flow, tab switching, and Google/OTP alternative links.
- **Wugweb Demo Credentials Integration**: Configured 1-click evaluation credentials (`admin@wugweb.com` / `WugWeb123@`) across `/login`, `/signup`, `/org`, and the Org Portal (`OrgPortal.tsx`, `auth.tsx`).
- **Wugweb Technologies Rebrand**: Rebranded corporate portal demo organization to Wugweb Technologies (Vedanshu, Founder & CEO, Indiranagar, Bengaluru, India, `wugweb.com`).
- **Resource Clinical Schema & Rich Interactivity**: Enriched `resources.php` and `single.php` with `schema.org/CollectionPage` and `schema.org/Article` JSON-LD, dynamic reading progress bar, keep-reading recommendation engine, and metadata bridge (`assessment`, `assessment_role`, `programme`).

### Changed
- **Demo Authentication Handler**: Updated `ikan_handle_ajax_user_login()` in `functions.php` to authenticate `admin@wugweb.com` / `WugWeb123@` with auto-provisioning of `wugweb_demo` user session and auth cookies.
- **Org Portal Defaults**: Set default credentials and 1-click filler in `org.php` and `OrgPortal.tsx` to `admin@wugweb.com` / `WugWeb123@`.

---

## [2026-11-22] — Restoration of Org Portal, Professional Application, Onboarding Flow & H1 Typography

### Added
- **Organisation Portal Integration**: Restored and mounted authentic `src/product/org/OrgPortal.tsx` (with `Insights.tsx`, `People.tsx`, `Settings.tsx`, and `Join.tsx`) on `/org`, `/org/insights`, `/org/people`, `/org/settings`, and `/org/join`. Integrated interactive demo fallback (`demo-org`) in `api.ts` with department distributions, stress indicators, and strict k-anonymity suppression ($k \ge 5$).
- **Professional / Partner Application Restoration**: Reconnected authentic 11-step clinical application wizard (`src/product/site/pages/ProfessionalApplication.tsx`, 1,012 lines) on `/join/partner` and `/join/professional`, saving drafts to `localStorage` and submitting payloads to `${API}/public/partner-application` into Supabase table `public.ikan2_partner_applications`.
- **Onboarding Screens Restoration**: Restored `src/product/app/onboarding/` (`MobileOnboarding.tsx`, `GetStarted.tsx`, `VerifyEmail.tsx`, `WelcomeSplash.tsx`, `auth.ts`) and linked them into `App.tsx` routing.
- **Production Asset Distribution**: Updated `scripts/deploy-prod.sh` to rsync `dist/assets/` to Hostinger's `public_html/assets/` so all built Vite JS bundles and dynamic chunks are served in production.

### Fixed
- **H1 Heading Specificity**: Fixed CSS specificity override in `src/product/site/themes/demo/style.css` by wrapping heading defaults in `:where(h1, h2, h3, h4)` with zero specificity, preventing `.ikan2-theme h1` from shrinking and distorting desktop hero titles.
- **Vite Dynamic Loader**: Added `get_vite_entry_script()` helper to `functions.php` to automatically resolve current Vite entry bundle across templates.

## [2026-11-22] — Production Audit, REST API Integration & 404 Parity

### Added
- **REST API Resource Endpoints**: Registered `/wp-json/ikan/v1/resources` (full catalog queryable by category) and `/wp-json/ikan/v1/resources/<slug>` (single article with full HTML and meta) in `src/product/site/themes/demo/functions.php` to enable headless consumption from `ikan2`.
- **Session Audit Report**: Compiled comprehensive audit report in `docs/PENDING.md` and session artifacts exposing placeholder state of PDF generation and dynamic email dispatch, establishing the `dompdf/dompdf` integration roadmap.

### Changed
- **404 StateScreen Parity**: Refactored `404.php` to 1:1 design and token parity with `ikan2` NotFoundScreen, applying Sora display typography, Manrope body copy, pill action buttons, and KIRAN / iCALL crisis helpline emergency banner.
- **Git Hygiene**: Updated `.gitignore` to ignore local PDF exports and markdown audit snapshots (`ikan-app-users-*`, `*.pdf`).

### Verified & Deployed
- **Guarded Production Deployment**: Executed `bash scripts/deploy-prod.sh` targeting Hostinger Cloud (`46.28.45.135`), verified Vite build, theme file rsync, LiteSpeed and CDN cache purges, and passing live HTTP 200 smoke tests across all core routes.
