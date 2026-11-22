# AGENTS.md — iKan Health

This repo's agent rules live in [`CLAUDE.md`](CLAUDE.md). Read it first, then
[`docs/GOVERNANCE.md`](docs/GOVERNANCE.md), [`docs/PENDING.md`](docs/PENDING.md),
[`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md) and [`docs/SESSIONS.md`](docs/SESSIONS.md).

The hardest rules:

1. **Production branch is `wordpress`**, which is also the GitHub default.
2. **Deploy only via `bash scripts/deploy-prod.sh`** — runs `scripts/deploy-guard.sh` and syncs theme & assets to Hostinger production.
3. **Backend services are managed in WordPress (FluentCRM, Fluent Forms, Rank Math)** — the member PWA app and its Supabase functions live in `ikan2`.
