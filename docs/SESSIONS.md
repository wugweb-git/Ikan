# Session Protocol & Development Guidelines — iKan Health

This document outlines the protocols, branch ownership, and operational practices for iKan development sessions.

---

## 1. Golden Rules

1. **Production Branch is `wordpress`**:
   - `wordpress` is the primary and default GitHub branch.
   - All production deployments must originate from `wordpress`.
2. **Guarded Deployment Only**:
   - **Never** deploy ad-hoc or run unverified manual rsync commands.
   - Run production deployments only via:
     ```bash
     bash scripts/deploy-prod.sh
     ```
   - This script runs local builds, executes `scripts/deploy-guard.sh` (ensuring clean working copy, branch parity with `origin/wordpress`, and CI green), syncs theme files to the Hostinger server, purges LiteSpeed & CDN caches, and verifies live HTTP 200 responses.
3. **Backend Service Ownership**:
   - Primary marketing and informational website backend runs on **WordPress** hosted on Hostinger (`ikanhealth.in`).
   - Member PWA application, progress tracking, and Supabase edge functions live in the `ikan2` repository (`app.ikanhealth.in`).

---

## 2. Branch Synchronization

To maintain developer ergonomics across workflows:
- Keep `wordpress` and `wordpress-dev` synchronized upon merging code.
- Always verify all CI checks locally prior to pushing:
  ```bash
  npm test && bash scripts/typecheck-ratchet.sh && npm run lint:ratchet && npm run build
  ```

---

## 3. Remote Hostinger Production Environment

- **Server IP**: `46.28.45.135`
- **SSH Port**: `65002`
- **User**: `u544169507`
- **Key Path**: `~/.ssh/hostinger_aw`
- **Document Root**: `/home/u544169507/domains/ikanhealth.in/public_html`
- **Theme Path**: `/home/u544169507/domains/ikanhealth.in/public_html/wp-content/themes/demo/`
- **WP-CLI Access**:
  ```bash
  ssh -p 65002 -i ~/.ssh/hostinger_aw u544169507@46.28.45.135 "cd /home/u544169507/domains/ikanhealth.in/public_html && wp <command>"
  ```

---

## 4. Demo Accounts & Evaluation Credentials

For interactive client presentations, stakeholder review, and end-to-end evaluation:
- **Organisation Portal & Member Demo**:
  - Email: `admin@wugweb.com`
  - Password: `WugWeb123@`
- **Supported Surfaces**:
  - `/login` and `/signup` (1-click fill button)
  - `/org` (Admin corporate dashboard demo with department stress levels & wellbeing benchmarks)
  - Live demo organization: **Wugweb Technologies** (Founder & CEO Vedanshu, Indiranagar, Bengaluru, India)

---

## 5. Clinical Data & Sync Architecture

1. **Locked Clinical Reference**:
   - Assessment instruments, scoring matrices, Equip curricula, and mood journal steps are **strictly locked and immutable**.
   - WordPress Admin provides a read-only visual reference for clinicians under **iKAN Clinical** (`wp-admin/admin.php?page=ikan-clinical`). There are no ad-hoc form builders or editable curriculum tables.
2. **Interim DB & State Authority**:
   - Members live in `ikan` (WordPress / FluentCRM).
   - `ikan2` (Supabase edge store) serves as the shock absorber / interim buffer.
   - Authoritative state is unmarshaled into 4 custom MySQL tables:
     - `wp_ikan_assessment_results`
     - `wp_ikan_program_progress`
     - `wp_ikan_journals`
     - `wp_ikan_wellness_scores`
3. **Canonical Assessment Mapping & Tagging**:
   - Slugs map to clinical codes:
     - `feeling-depressed-and-hopeless` ➔ `PHQ-9`
     - `feeling-worried-and-stressed` ➔ `GAD-7`
     - `feeling-overwhelmed-and-anxious` ➔ `PSS-10`
     - `feeling-drained-and-burned-out` ➔ `BAT-23`
     - `struggling-with-quality-sleep` ➔ `SCI`
     - `struggling-to-balance-life` ➔ `WHO-5`
     - `unsure-or-general-concern` ➔ `General-Concern`
   - FluentCRM tags format: `assess:{$CODE}:{$SEVERITY}` (e.g. `assess:PHQ-9:Normal`).
   - Legacy slug tags (`assess:feeling-...`, `assess:struggling-...`) are automatically purged by `cleanup_legacy_fluentcrm_tags()`.
4. **Secure Custom Fields (SCF) on `wp_users`**:
   - Clinical field group `group_ikan_member_clinical` registered on `wp_users` with 15 clinical fields across Equip pacing, assessments, scoring matrices, and wellness scores.
   - Automatically populated on member login / sync.
5. **Event-Driven Login Sync**:
   - Sync triggers on `wp_login` hook (`Ikan_Interim_Sync::on_user_login`) queueing asynchronous Action Scheduler background jobs, plus REST endpoint `POST /wp-json/ikan/v1/sync/trigger`.
6. **Resources Catalog & Synchronization**:
   - `assets/resources.json` contains full metadata (`tags`, `labels`, `author`, `medium`, `minutes`, `programme`, `assessment`).
   - Ingested into WordPress database posts via `wp eval-file wp-content/themes/demo/ingest_resources.php`.
   - Served to both WordPress and `ikan2` via REST route `/wp-json/ikan/v1/resources`.
