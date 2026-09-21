# BUILD.md — iKan Health build & deploy reference

---

## Prerequisites

```bash
node >= 20
npm >= 10
npx vercel@latest   # Vercel CLI (auto-installed on first use)
supabase            # Supabase CLI (brew install supabase/tap/supabase)
```

---

## npm scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Vite dev server on http://localhost:5173 |
| `npm run build` | TypeScript check + production bundle → `dist/` |
| `npm run preview` | Serve the `dist/` bundle locally |
| `npm run lint` | ESLint |

---

## Frontend deploy (Vercel)

**Critical:** git-push builds auto-cancel at the project level. The only working deploy path is the Vercel CLI.

```bash
# From repo root (must be authenticated — ~/.vercel/auth.json)
npx vercel@latest deploy --prod --yes
```

- Team: `wugweb` (`team_8QvHezSgBzUD4STdma9lk5UF`)
- Project: `ikan`
- Production branch: `equip-carry-forward` (NOT `main`)
- Build output: `dist/`

After deploy, visit https://ikanhealth.in and smoke-test: homepage, dashboard login, one assessment, one equip program detail page.

---

## Edge function deploy (Supabase)

All API routes live in one function: `make-server-cc205da9`. Source is in `src/supabase/functions/server/`.

**Use `bash scripts/deploy-edge.sh`.** It does everything below, behind the deploy guard, and also
downloads the live function before deploying so rollback restores what was really running. The
manual steps are kept for reference and for recovery when the script itself is the problem.

```bash
# 1. Stage files (CLI needs a project directory layout)
mkdir -p /tmp/ikan-fn/supabase/functions/make-server-cc205da9
cp src/supabase/functions/server/* /tmp/ikan-fn/supabase/functions/make-server-cc205da9/

# 2. Write config.toml
cat > /tmp/ikan-fn/supabase/config.toml << 'EOF'
[functions.make-server-cc205da9]
entrypoint = "./functions/make-server-cc205da9/index.tsx"
verify_jwt = true
EOF

# 3. Deploy
cd /tmp/ikan-fn
supabase functions deploy make-server-cc205da9 \
  --project-ref jpfvoevxegnknxoqmwye \
  --use-api

# 4. Smoke-test
curl https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9/health
```

After deploy always verify: `/health`, `/assessments`, `/equip/programs`, `/scales/moods`,
`/scoring-profiles`, `/user/assessments/results/:id`.

**Run the assessment checks as a NON-ADMIN.** `/scoring-profiles` exists because the admin-only
route cannot serve the player; an admin session passes even when the read route is broken, because
the admin route covers for it. That false green is the same shape as the slug bug that went
unnoticed for months. Specifically confirm, signed in as an ordinary user:

- a new completion writes `engine_result` onto the stored result
- `/assessment-results?id=<id>` loads from the record, not from sessionStorage
- a recommendation appears (proves the category join resolves a severity from a profile)

---

## Environment variables

### Vercel (frontend)
Set in Vercel dashboard under Project → Settings → Environment Variables:

| Key | Used by |
|-----|---------|
| `VITE_SUPABASE_URL` | `src/shared/supabase-client.ts` |
| `VITE_SUPABASE_ANON_KEY` | `src/shared/supabase-client.ts` |
| `VITE_GA_MEASUREMENT_ID` | `index.html` GA tag |

### Supabase edge function
Set in Supabase dashboard under Project → Edge Functions → Secrets:

| Key | Used by |
|-----|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | KV store writes (service role) |
| `BREVO_API_KEY` | Brevo transactional email |

**Never commit secrets to git.**

---

## Supabase DB migrations

The project uses Supabase migrations (`supabase/migrations/`). To apply a new migration:

```bash
supabase db push --project-ref jpfvoevxegnknxoqmwye
```

To create a new migration file:
```bash
supabase migration new <description>
# edit supabase/migrations/<timestamp>_<description>.sql
supabase db push --project-ref jpfvoevxegnknxoqmwye
```

---

## Vercel Analytics & Speed Insights

`@vercel/analytics` and `@vercel/speed-insights` are installed and mounted in `src/App.tsx`. They activate automatically once a deployment is live — no extra dashboard config needed beyond the default "enabled" state per Vercel project settings.
