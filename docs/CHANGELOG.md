# Changelog — iKan Health

All notable changes to the iKAN Health platform are documented in this file.

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
