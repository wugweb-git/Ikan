# Changelog — iKan Health

All notable changes to the iKAN Health platform are documented in this file.

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
