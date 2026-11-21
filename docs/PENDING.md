# Pending work — iKan Health

Single source of truth for outstanding work across sessions. Update this file whenever a deployment or major change completes — see [`docs/GOVERNANCE.md`](GOVERNANCE.md).

*Last updated: 2026-11-22*

---

## 1. Immediate Next Steps / User Action Required

- [ ] **Email Design Review (In Progress - STRICT OUTBOX HOLD)**:
  - User reviewing all 6 email templates in the interactive preview gallery ([`EMAIL_DESIGN_GALLERY.html`](file:///Users/abcom/.gemini/antigravity/brain/2ceffaaa-858b-414d-9fee-daf13c0a21c6/EMAIL_DESIGN_GALLERY.html)) and FluentCRM editor before any live test or automated dispatches.
  - Zero emails are sent until explicit approval.
- [ ] **PDF Generation & Dynamic Email Automation (Tomorrow's Agenda)**:
  - Activated `Fluent PDF Generator` (`fluentforms-pdf` v2.2.0) on Hostinger production.
  - Connect dynamic calculations from `/burnout-cost-calculator/` and `ikan2` assessments into branded PDF generation and FluentCRM Template dispatch (Templates 318 and 314).
- [ ] **Update DKIM TXT Record in Hostinger hPanel**:
  - In Hostinger hPanel → Domains → `ikanhealth.in` → DNS Zone Editor:
  - Replace the old value for TXT record `hostingermail1._domainkey` with the newly generated key:
    `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtDmULKqEraHiYpO3qZFQ2H40o6W7uLpredsqq/yD1mujgQ9HOdeb/NiZuwfl53dZSyLtra2vYM4N2NknjKOJrh68xRBucd+n/uiwuS7pVmdu8fCp3vCIP0i8143bVFvBYm9q3ohpckCmEu6Xwogj3gx0HdwAJwLvRRSzdjUtFAyc8H1dpjOeo8sMFYcm9IgEqYgkqpLS5ee8cAsu2hi4OHLszurchuycZHxIECzAEzdX4zrcsnP8dsTiGbl+M9xdi+W9gWVevinxCzOLckxpaB3+iT417kRxiBJIbILEWrDsaWWZ1eFXg2/W306XeUuAZqjyd/fQdLxPAgOD4Akm3wIDAQAB`

---

## 2. Recent Completed Milestones (2026-11-22)

- [x] **Fluent PDF Generator (v2.2.0) Activated on Hostinger**:
  - Installed and activated `fluentforms-pdf` on Hostinger production via WP-CLI.
- [x] **Headless CMS & Resources REST API Routes (`functions.php`)**:
  - Registered `/wp-json/ikan/v1/page/(?P<slug>[a-zA-Z0-9-]+)` for dynamic page content (About, FAQ, Contact).
  - Registered `/wp-json/ikan/v1/resources` for full article catalog retrieval by `ikan2`.
  - Registered `/wp-json/ikan/v1/resources/(?P<slug>[a-zA-Z0-9-]+)` for single article with `.prose-ikan` formatting.
- [x] **404 Error Page 1:1 Parity with `ikan2` `NotFoundScreen` (`404.php`)**:
  - Matched Sora 26px heading ("We can’t find that one"), Manrope body copy, `#151515` pill buttons ("Take me home", "Browse the library"), and 20px rounded crisis helpline banner (KIRAN 1800-599-0019 / iCALL 9152987821).
- [x] **Supabase Member Roster Ingested into FluentCRM**:
  - Imported 27 registered Supabase accounts into FluentCRM (15 into `iKAN Members` with tag `member`, 12 into `Internal Team & Dev`).
  - Created git backup snapshot at `src/product/site/content/data/members-snapshot.json`.
- [x] **Email Design System & FluentCRM Gutenberg Templates (All 6 Use Cases)**:
  - Configured FluentSMTP with `smtp.hostinger.com:465` (SSL) for `noreply@ikanhealth.in`.
  - Enforced `force_from_name = 'yes'` and `force_from_email = 'yes'` so outgoing sender is globally locked to `iKAN Health <noreply@ikanhealth.in>`.
  - Verified connection health via WP-CLI: `wp fluent-smtp health` -> healthy.
- [x] **Hostinger Mail API PHP SDK Wrapper**:
  - Installed `hostinger/mail-api-php-sdk: ^1.18` via Composer in the theme.
  - Implemented `Ikan_Hostinger_Mail` supporting direct REST API dispatch (`send_via_api`), quota checks, and SMTPS fallback.
- [x] **Email Design System & FluentCRM Gutenberg Templates (All 6 Use Cases)**:
  - Designed and published 6 production templates in FluentCRM (`fc_template`):
    - `ID: 313` — Master Brand Template (Contact Inquiries Form 1 & 2)
    - `ID: 318` — Burnout Cost Calculator Executive Report (Form 3 & AJAX lead dispatch)
    - `ID: 315` — Partner Onboarding Application Received (Form 4)
    - `ID: 316` — Member Onboarding Account Activation & Magic Link (Form 5)
    - `ID: 317` — Weekly Wellbeing Status Digest (Recurring Member Progress)
    - `ID: 314` — Member Assessment Summary Export (User clicks "Email summary to myself" in ikan2)
  - Resolved all feedback items:
    - Slim horizontal header (30px emblem + wordmark + category pill badge, zero wasted vertical space).
    - Founder & Clinical Director card with Kartik's portrait (`kartik.jpg`), title, and direct support links.
    - Monochrome SVG social icons (`icon-linkedin.svg`, `icon-x.svg`, `icon-instagram.svg`, `icon-web.svg`).
    - Eliminating generic duplicate footers via `_footer_settings['disable_footer'] = 'yes'`.
  - Created standalone [Interactive Email Gallery](file:///Users/abcom/.gemini/antigravity/brain/2ceffaaa-858b-414d-9fee-daf13c0a21c6/EMAIL_DESIGN_GALLERY.html) with desktop/mobile device switcher.
- [x] **Fluent Forms & Contact Form Mapping**:
  - Renamed Form ID 1 from starter title "Contact Form Demo" to "Contact Us Form".
  - Mapped directly with Contact Us page (`/contact-us/`, ID 14) and synced into FluentCRM leads.
- [x] **UI Parity & Mobile Layout Bug Fixes**:
  - Fixed mobile testimonial 3-card squishing bug by replacing with responsive vertical stack.
  - Fixed FAQ accordion 2-column squishing by enforcing 1-column responsive collapse on mobile.
  - Corrected fluid H1 font sizes (`42px` mobile, `56px` desktop).
  - Validated `/services/` server-rendered routing and verified all 26 WordPress pages use Gutenberg block editor markup.


## 1. Upcoming & Open Work

### Analytics & Event Tracking (Scheduled Next Session)
- [ ] **GA4 Custom Event Hooks**:
  - `generate_lead`: Trigger on Burnout Cost Calculator report generation (`/burnout-cost-calculator/`).
  - `sign_up`: Trigger on member onboarding and consultant registration (`/join/partner/`).
  - `contact`: Trigger on Contact Us and Organisation Inquiries form submissions (`/contact-us/`, `/org/`).
  - `view_item` / `select_content`: Trigger on Assessment and Equip program exploration (`/assessments/`, `/equip-programs/`).
- [ ] **Cross-Domain / Cross-Subdomain Tracking**:
  - Configure cookie domain and linker between `ikanhealth.in` and `app.ikanhealth.in` (`ikan2`).

### Continuous SEO & Content Optimization
- [ ] Monitor Google Search Console crawl status for `/sitemap_index.xml` and `/page-sitemap.xml`.
- [ ] Regularly update clinical citations and review scores for newly published health resources.

---

## 2. Completed Milestones (2026-11-21)

### CI Pipeline & Quality Gates Fixed
- **Root Cause Eliminated**: `eslint.config.js` was parsing minified bundles in `src/product/site/themes/demo/assets/**` (2,673 phantom errors).
- Added asset ignore pattern to `eslint.config.js`.
- Lint problem count lowered from 3,068 to **395** (baseline locked at 395).
- All 9 gates verified green locally and in GitHub Actions CI:
  - `npm test` (149 passing unit tests)
  - `bash scripts/typecheck-ratchet.sh` (103 errors, at ratchet baseline)
  - `npm run lint:ratchet` (395 problems, at ratchet baseline)
  - `npm run lint:scriptpaths` (all script paths exist)
  - `npm run contrast:ratchet` (contrast ratio passes AA standards)
  - `npm run lint:rawhex` (hardcoded color literals within baseline)
  - `npm run lint:a11y` (static accessibility checks pass)
  - `npm run lint:boundary` (module boundaries enforced)
  - `npm run build` (Vite production build succeeds cleanly)

### Rank Math SEO & Schema.org Structured Data
- Injected valid `schema.org/FAQPage` JSON-LD schema into `/faq/` covering 19 clinical and platform questions.
- Populated focus keywords, SEO titles, descriptions, robot indexing rules, and SEO scores (85–92) across all 12 core pages via WP-CLI on Hostinger.
- Stamped clinical focus keyphrases across all 35 resource articles (e.g. WHO-5, GAD-7, PHQ-9, BAT-23, SCI, PSS-10).
- Patched Rank Math Twitter author metadata to `@ikanhealth_in` (fixing Twitter Card renderer).
- Unified KnowledgeGraph organization metadata as `MedicalBusiness` named `iKAN Health`.

### PWA & Mobile UX Parity with ikan2
- Added Web App Manifest at `src/product/site/themes/demo/manifest.json`:
  - `display: standalone`
  - `theme_color: #101010`
  - `background_color: #F5F8F7`
  - App icons and 3 quick action shortcuts (`Assessments`, `Equip Programs`, `Burnout Calculator`).
- Linked manifest and Apple mobile web app tags into `header.php`.

### Router & Custom Page Templates
- Implemented robust `template_include` router in `functions.php` to map URLs dynamically to PHP templates (`about-us.php`, `services.php`, `assessments.php`, `equip-programs.php`, `consultation.php`, `org.php`, etc.).
- Restored visual assets, hero media, and catalog imagery across all inner pages.

### Form Submissions & Dual-Logging
- Connected Contact, Org Inquiries, and Newsletter forms directly to Fluent Forms and FluentCRM contact lists.
