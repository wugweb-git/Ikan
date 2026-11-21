# Pending work — iKan Health

Single source of truth for outstanding work across sessions. Update this file whenever a deployment or major change completes — see [`docs/GOVERNANCE.md`](GOVERNANCE.md).

*Last updated: 2026-11-22*

---

## 1. Immediate Next Steps / User Action Required

- [ ] **Set Outgoing Mail Password**:
  - The SMTP plugin is configured for `smtp.hostinger.com:465` (SSL) with username `noreply@ikanhealth.in`.
  - Enter the mailbox password in **wp-admin → Settings → SMTP** (or via WP-CLI: `printf '%s' "PASSWORD" | wp smtp settings set password=-`).
  - Run verification test: `wp ikan-mail test <email>`.
- [ ] **Update DKIM TXT Record in Hostinger hPanel**:
  - In Hostinger hPanel → Domains → `ikanhealth.in` → DNS Zone Editor:
  - Replace the old value for TXT record `hostingermail1._domainkey` with the newly generated key:
    `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtDmULKqEraHiYpO3qZFQ2H40o6W7uLpredsqq/yD1mujgQ9HOdeb/NiZuwfl53dZSyLtra2vYM4N2NknjKOJrh68xRBucd+n/uiwuS7pVmdu8fCp3vCIP0i8143bVFvBYm9q3ohpckCmEu6Xwogj3gx0HdwAJwLvRRSzdjUtFAyc8H1dpjOeo8sMFYcm9IgEqYgkqpLS5ee8cAsu2hi4OHLszurchuycZHxIECzAEzdX4zrcsnP8dsTiGbl+M9xdi+W9gWVevinxCzOLckxpaB3+iT417kRxiBJIbILEWrDsaWWZ1eFXg2/W306XeUuAZqjyd/fQdLxPAgOD4Akm3wIDAQAB`

---

## 2. Recent Completed Milestones (2026-11-22)

- [x] **Hostinger Mail API PHP SDK & High-Stability SMTP**:
  - Installed `hostinger/mail-api-php-sdk: ^1.18` via Composer in the theme and verified autoloading.
  - Implemented `Ikan_Hostinger_Mail` wrapper (`includes/class-hostinger-mail.php`) supporting REST API SDK client and SMTPS on Port 465.
  - Enforced `noreply@ikanhealth.in` as default from address across all WordPress and FluentCRM transactional emails.
  - Built custom WP-CLI diagnostics command: `wp ikan-mail [status|test <email>]`.
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
