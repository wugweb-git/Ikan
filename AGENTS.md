# AGENTS.md — iKan Health

This repo's agent rules live in [`CLAUDE.md`](CLAUDE.md). Read it first, then
[`docs/GOVERNANCE.md`](docs/GOVERNANCE.md), [`docs/PENDING.md`](docs/PENDING.md),
[`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md) and [`docs/SESSIONS.md`](docs/SESSIONS.md).

The three hardest rules:

1. **Production branch is `equip-carry-forward`, not `main`.**
2. **Deploy only via `bash scripts/deploy-prod.sh` (frontend) and `bash scripts/deploy-edge.sh`
   (edge function)** — both run `scripts/deploy-guard.sh`. Never run the Vercel or Supabase CLI directly.
3. **Don't change Supabase data or edge functions without asking first.**
