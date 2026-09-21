# iKan Health — Deployment Guide

> **Last updated**: July 2026
> **Audience**: DevOps and lead developers

See `BUILD.md` in the repo root for the quick-reference commands. This document covers the full context.

---

## Production topology

| Component | Host | Branch / source |
|-----------|------|----------------|
| Frontend SPA | Vercel | `equip-carry-forward` |
| Edge function API | Supabase (ap-south-1 Mumbai) | `make-server-cc205da9` |
| Database | Supabase Postgres | `kv_store_cc205da9` |
| Auth | Supabase Auth | project `jpfvoevxegnknxoqmwye` |

---

## Frontend deploy (Vercel CLI)

**Git-pushed builds auto-cancel.** The project has git-triggered builds disabled at the project level. Always deploy via CLI:

```bash
npx vercel@latest deploy --prod --yes
```

This bypasses the git trigger, picks up the local `dist/` build, and pushes directly to production. Authentication is stored in `~/.vercel/auth.json` (already configured on the dev machine). The `.vercel/` project link is gitignored.

After deploy:
1. Visit https://ikanhealth.in
2. Check the homepage, a login flow, one assessment, one equip program detail
3. Verify Vercel Speed Insights is collecting (Vercel dashboard → Analytics)

---

## Edge function deploy (Supabase CLI)

All API routes live in one function. Source is `src/supabase/functions/server/`.

```bash
# Stage + deploy
mkdir -p /tmp/ikan-fn/supabase/functions/make-server-cc205da9
cp src/supabase/functions/server/* /tmp/ikan-fn/supabase/functions/make-server-cc205da9/
cat > /tmp/ikan-fn/supabase/config.toml << 'EOF'
[functions.make-server-cc205da9]
entrypoint = "./functions/make-server-cc205da9/index.tsx"
verify_jwt = true
EOF
cd /tmp/ikan-fn
supabase functions deploy make-server-cc205da9 \
  --project-ref jpfvoevxegnknxoqmwye \
  --use-api
```

Smoke-test after every edge function deploy:
```bash
curl https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9/health
curl https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9/equip/programs
```

---

## Database migrations

Migrations live in `supabase/migrations/`. Apply to production:

```bash
supabase db push --project-ref jpfvoevxegnknxoqmwye
```

Before running any destructive migration (DROP, ALTER, UPDATE across many rows), take a manual backup from the Supabase dashboard.

---

## Vercel project configuration

- **Team**: wugweb (`team_8QvHezSgBzUD4STdma9lk5UF`)
- **Project**: ikan
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **SPA rewrite**: all non-asset paths → `/index.html` (configured in `vercel.json`)

### Security headers (vercel.json)

`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy` — all set in `vercel.json`.

---

## Rollback

Vercel: Vercel dashboard → Deployments → click any prior deployment → Promote to Production.

Supabase edge function: redeploy the previous version from git (check out the prior commit, restage, redeploy).

---

## Monitoring

- **Runtime errors and logs**: Vercel MCP tools (`get_runtime_errors`, `get_runtime_logs`) or Vercel dashboard → Logs
- **Edge function logs**: Supabase dashboard → Edge Functions → Logs
- **Performance**: Vercel Speed Insights (auto-collected post-deploy)
- **DB health**: Supabase dashboard → Database → Query Performance
