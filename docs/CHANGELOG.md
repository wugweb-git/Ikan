# Changelog — iKan Health

All notable changes to the iKAN Health platform are documented in this file.

---

## [2026-11-22] — Production Audit, REST API Integration & 404 Parity

### Added
- **REST API Resource Endpoints**: Registered `/wp-json/ikan/v1/resources` (full catalog queryable by category) and `/wp-json/ikan/v1/resources/<slug>` (single article with full HTML and meta) in `src/product/site/themes/demo/functions.php` to enable headless consumption from `ikan2`.
- **Session Audit Report**: Compiled comprehensive audit report in `docs/PENDING.md` and session artifacts exposing placeholder state of PDF generation and dynamic email dispatch, establishing the `dompdf/dompdf` integration roadmap.

### Changed
- **404 StateScreen Parity**: Refactored `404.php` to 1:1 design and token parity with `ikan2` NotFoundScreen, applying Sora display typography, Manrope body copy, pill action buttons, and KIRAN / iCALL crisis helpline emergency banner.
- **Git Hygiene**: Updated `.gitignore` to ignore local PDF exports and markdown audit snapshots (`ikan-app-users-*`, `*.pdf`).

### Verified & Deployed
- **Guarded Production Deployment**: Executed `bash scripts/deploy-prod.sh` targeting Hostinger Cloud (`46.28.45.135`), verified Vite build, theme file rsync, LiteSpeed and CDN cache purges, and passing live HTTP 200 smoke tests across all core routes.
