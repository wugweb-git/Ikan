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
