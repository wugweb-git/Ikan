# Changelog — iKan Health

All notable changes to the iKAN Health platform are documented in this file.

---

## [2026-11-24] — Alert emails live in Supabase; WordPress sync check

### Added
- **Branded alert emails (ikan2)**: `ikan2-alerts` edge function renders an iKAN-branded HTML email for five kinds (pilot lead, contact, partner application, newsletter, new user) and sends it through the ikanhealth.in mailbox (Hostinger SMTP). `AFTER INSERT` triggers on `ikan2_contact_messages`, `ikan2_newsletter_subscribers`, `ikan2_partner_applications` and `auth.users` post to it with the `x-cron-secret` header. Partner alerts omit verification answers. Recipients come from the `ALERT_TO` Supabase secret.

### Found (no code change here)
- The WordPress interim sync reads Supabase with the public anon key by default, which cannot read the three form tables (insert-only or no policies). It works only if `IKAN_SUPABASE_SERVICE_KEY` is set on Hostinger. Possible duplicate notifications with Fluent Forms / FluentCRM. See PENDING.md.

---

## [2026-11-23] — Canonical Clinical Assessment Naming, SCF Member Profile Mapping, and Resources Sync

### Added
- **Canonical Clinical Assessment Tagging & Naming (`class-ikan-interim-sync.php`)**:
  - Mapped raw concern slugs to standardized clinical instrument names, acronyms, and scoring matrix specs:
    - `feeling-depressed-and-hopeless` ➔ `PHQ-9` (Depression & Low Mood)
    - `feeling-worried-and-stressed` ➔ `GAD-7` (Anxiety & Worry)
    - `feeling-overwhelmed-and-anxious` ➔ `PSS-10` (Perceived Stress)
    - `feeling-drained-and-burned-out` ➔ `BAT-23` (Burnout Assessment Tool)
    - `struggling-with-quality-sleep` ➔ `SCI` (Sleep Condition Indicator)
    - `struggling-to-balance-life` ➔ `WHO-5` (Work-Life Well-being)
    - `unsure-or-general-concern` ➔ `General-Concern` (Composite Screening)
  - Generated clean clinical subscriber tags in FluentCRM formatted as `assess:{$CODE}:{$SEVERITY}` (e.g. `assess:PHQ-9:Normal`, `assess:GAD-7:Normal`).
  - Added `cleanup_legacy_fluentcrm_tags()` automatically purging old ugly slug tags (`assess:feeling-...`, `assess:struggling-...`) from `wp_fc_tags` and `wp_fc_subscriber_pivot`.
- **Secure Custom Fields (SCF) Clinical Field Group on `wp_users` (`class-ikan-scf-fields.php`)**:
  - Registered `group_ikan_member_clinical` with 15 clinical fields across Equip program pacing, clinical assessments & scoring matrices, longitudinal wellness, and high-risk flags.
  - Automatically populated user meta on `wp_users` on member login / sync (`latest_assessment`, `assessment_id`, `assessment_result_id`, `latest_score`, `latest_severity`, `scoring_matrix`, `current_program`, `program_id`, `program_current_day`, `program_status`, `last_active_at`, `last_journal_date`, `wellness_index_score`).
- **Clinical Admin Visual Reference Hub (`class-ikan-clinical-admin.php`)**:
  - Established locked clinical architecture: assessment instruments, Equip programs, and mood journals are immutable and cannot be edited in WP-Admin.
  - WP-Admin provides a read-only visual reference for clinicians under **iKAN Clinical** (`wp-admin/admin.php?page=ikan-clinical`).
  - Bundled verbatim clinical questions, scoring cutoffs, and 4 complete Equip curricula in JSON (`assets/data/clinical-instruments.json` & `equip-curriculum/`).
- **Custom Destination MySQL Tables (`class-ikan-db-schema.php`)**:
  - Created 4 custom destination tables: `wp_ikan_assessment_results`, `wp_ikan_program_progress`, `wp_ikan_journals`, `wp_ikan_wellness_scores`.
- **Event-Driven Login Sync Worker (`class-ikan-interim-sync.php`)**:
  - Replaced recurring hourly cron with event-driven `wp_login` hook (`on_user_login`) queueing asynchronous Action Scheduler jobs (`as_enqueue_async_action`).
  - Added REST endpoint `POST /wp-json/ikan/v1/sync/trigger` for client/PWA login sync.
- **Resources Catalog, Tags, Labels & Authors Synchronization**:
  - Enriched all 28 resources in `assets/resources.json` with verified authors (e.g. `Dr. Divya Jain, Ph.D. & iKAN Clinical Team`, `Vedanshu & NHS Every Mind Matters`, `Kartik & iKAN Research Team`), 4–6 topical & clinical `tags`, badge `labels`, `medium`, duration in `minutes`, and linked clinical assessments/programs.
  - Ingested all tags, labels, and authors into WordPress database posts via `ingest_resources.php`.
  - Exposed complete `tags`, `labels`, and `author` in `/wp-json/ikan/v1/resources` and `/wp-json/ikan/v1/resources/<slug>`.
  - Updated `resources.php` to display author bylines, duration badges, interactive `#tag` pills, and real-time instant search across tags and authors.

---

## [2026-11-23] — Action Scheduler Autonomous Interim Sync Worker (Part 1 Ingestion)

### Added
- **Autonomous Interim DB Sync Worker (`class-ikan-interim-sync.php`)**:
  - Implemented background sync worker powered by WordPress **Action Scheduler** (`ikan_sync_interim_buffer` in group `ikan-sync`).
  - Schedules hourly autonomous synchronization of Part 1 datasets from the Interim DB (Supabase) without consuming AI agent tokens:
    - Newsletter Subscribers → FluentCRM `wp_fc_subscribers` (list: *Newsletter Subscribers*).
    - Contact Form Messages → Fluent Forms Form ID 1 (`wp_fluentform_submissions`).
    - Partner Inquiries → Fluent Forms Form ID 4 (`wp_fluentform_submissions`).
    - Member Profile Basics → `wp_users` and `wp_usermeta` demographics (`phone`, `city`, `gender`, `dob`).
  - Added WP-CLI command `wp ikan-sync` for on-demand manual execution and validation.
  - Verified live on Hostinger: Action Scheduler task ID `1893` registered as recurring background action; manual verification executed in 1.1s.

---

## [2026-11-22] — Storybook Design System Re-Sync & Lint Ratchets Tightened

### Added
- **Storybook Design System Sync (`ikan2` -> `ikan`)**:
  - Rebuilt static Storybook bundle from `ikan2/.design-sync/sb-config` to include newly added component stories (`Kit/ExternalLink`, `Kit/ErrorState`) and latest M3 styling / typography scale updates.
  - Synced bundle to `src/product/site/themes/demo/assets/storybook/` for production deployment at `https://ikanhealth.in/storybook/`.

### Fixed
- **Code Quality Baselines Tightened**:
  - Lowered `scripts/baselines/rawhex` from `497` down to `351`.
  - Lowered `scripts/baselines/a11y` from `40` down to `20`.
  - Verified zero regressions across all ratchet tests: `lint:ratchet` (395), `contrast:ratchet` (5), `lint:rawhex` (351), `lint:a11y` (20), `lint:boundary` (0), `lint:scriptpaths` (17), `typecheck-ratchet` (102), and 149 passing unit tests.

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
