# Pending work — iKan Health

Single source of truth for outstanding work across sessions. Update this file whenever a deployment or major change completes — see [`docs/GOVERNANCE.md`](GOVERNANCE.md).

*Last updated: 2026-11-21*

---

## Recent Deployments & Completed Work (2026-11-21)
- [x] **WordPress Block Theme & Gutenberg Rules Mapping**:
  - Populated all 26 pages in WordPress (`https://ikanhealth.in/wp-admin/edit.php?post_type=page`) with authentic, fully compliant Gutenberg block markup (`core/heading`, `core/paragraph`, `core/group`, `core/columns`, `core/details`, `core/list`, `core/button`, `core/shortcode`).
  - Mapped and synchronized all Fluent Forms across pages: Form 1 (Contact & Org inquiries), Form 2 (Newsletter subscription), Form 3 (Burnout Cost Calculator report request), Form 4 (Partner & Provider onboarding), Form 5 (User registration).
  - Replaced default WordPress boilerplate on Privacy Policy (ID 3) with authentic iKAN Privacy Policy blocks.
  - Enabled Block Editor stylesheet support, font enqueues (`Sora`, `Manrope`), and design system variables for Gutenberg editing in `functions.php` and `style.css`.
  - Resolved mobile homepage responsive layout bugs (Reviews vertical stack with clean margin, FAQ 1-column on mobile, fluid responsive H1 heading clamp).

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
