# CLAUDE.md — Edge function (backend) instructions

This nested CLAUDE.md covers the backend-specific conventions for `src/supabase/functions/server/`. The root `/CLAUDE.md` covers the full repo context.

---

## Function identity

- **Name**: `make-server-cc205da9`
- **Runtime**: Deno (Supabase Edge Functions)
- **Framework**: Hono
- **Entry point**: `index.tsx` (this directory)
- **Source files**: 33 `.ts`/`.tsx` files — all compiled and deployed as one unit

18 of those files are `*-routes.ts` route modules, imported into `index.tsx`; the rest are shared
services/types/middleware. There is no separate function per route; everything is one deployed
function.

---

## Auth middleware

```
requireAuth   →  validates user JWT, sets c.get('user')
requireAdmin  →  validates admin JWT (separate issuer/claim), sets c.get('admin')
```

Public routes (content, assessments, equip programs, CMS pages) use neither. Health Connect, mood, progress, and profile routes use `requireAuth`. Admin CRUD routes use `requireAdmin`.

`verify_jwt: true` is set globally on the function — the Supabase gateway rejects requests with no or invalid JWT before they reach Hono. Public routes work because the **anon key** is also a valid JWT.

---

## KV access pattern

All routes use the singleton `kv` instance from `content-service.ts`. Helpers:

- `kv.get(key)` — parsed JSON or null
- `kv.set(key, value)` — upsert
- `kv.del(key)` — delete
- `kv.getByPrefix(prefix)` — returns `{ key, value }[]` (full table scan — use sparingly)

The backing table is `kv_store_cc205da9` in Supabase Postgres. RLS is enabled with no policies — only the service-role key (available inside the edge function via `SUPABASE_SERVICE_ROLE_KEY`) can read/write.

---

## How to deploy

**Run `bash scripts/deploy-edge.sh` from the repo root.** It refuses unless you are on
`equip-carry-forward`, level with origin, with a clean server directory and green CI; it downloads
the live function first so rollback restores what was actually running; and it smoke-tests before
and after. The frontend and this function deploy independently — on 2026-09-15 the function was
found five days stale, still serving routes for two features the frontend had removed.

The manual steps below are what the script does, kept for recovery when the script is the problem.
The Supabase CLI requires a project directory with `supabase/functions/<name>/` layout. Since our source lives in `src/supabase/functions/server/`, use this staging approach:

```bash
# 1. Create staging dir
mkdir -p /tmp/ikan-fn/supabase/functions/make-server-cc205da9

# 2. Copy source files
cp src/supabase/functions/server/* /tmp/ikan-fn/supabase/functions/make-server-cc205da9/

# 3. Write config.toml pointing at the entry file
cat > /tmp/ikan-fn/supabase/config.toml << 'EOF'
[functions.make-server-cc205da9]
entrypoint = "./functions/make-server-cc205da9/index.tsx"
verify_jwt = true
EOF

# 4. Deploy
cd /tmp/ikan-fn
supabase functions deploy make-server-cc205da9 \
  --project-ref jpfvoevxegnknxoqmwye \
  --use-api

# 5. Smoke test
curl https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9/health
```

After deploy always smoke-test at minimum: `/health`, `/assessments`, `/equip/programs`, `/scales/moods`.

---

## Route file conventions

- File name matches the domain: `assessment-routes.ts`, `equip-routes.ts`, etc.
- Each file exports an `app` (Hono sub-application) that is mounted in `index.tsx`.
- Slug resolution: both `assessment-routes.ts` and `equip-routes.ts` support id-or-slug lookup — try `{entity}_def:{id}` first, fall back to `{entity}_slug:{id}` → id lookup.

---

## Adding a new route

1. Create `my-domain-routes.ts` with a `new Hono()` app.
2. Register routes on it.
3. Import and `.route('/my-domain', myDomainApp)` in `index.tsx`.
4. Add KV key prefix docs to root `CLAUDE.md`.
5. Deploy and smoke-test.

---

## Shared types

`shared-types.ts` contains the TypeScript interfaces used across multiple route files. Do not duplicate types — import from there.
