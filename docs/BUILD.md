# BUILD.md — iKan Health build & deploy reference

---

## Production topology

| Component | Host | Branch / source |
|-----------|------|----------------|
| Frontend SPA | Vercel | `equip-carry-forward` |
| Edge function API | Supabase (ap-south-1 Mumbai) | `make-server-cc205da9` |
| Database | Supabase Postgres | `kv_store_cc205da9` |
| Auth | Supabase Auth | project `jpfvoevxegnknxoqmwye` |

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
| `npm run build` | Production bundle → `dist/` (`vite build` only — **not** a typecheck) |
| `npm run typecheck` | `tsc --noEmit` — separate from the build |
| `npm test` | Unit tests (`node --test`) |
| `npm run lint` | ESLint |
| `npm run lint:ratchet` / `lint:design` / `lint:boundary` | The ratchets CI runs (see below) |

There is no `preview` script.

---

## CI

`.github/workflows/ci.yml` runs on every push/PR: tests, then the typecheck, lint, contrast,
raw-hex, static a11y and surface-boundary ratchets, then `npm run build`. A green build alone
proves nothing about types — CI is the gate. The deploy scripts refuse to run unless CI is green.

---

## Deploy guard

Both deploy scripts source `scripts/deploy-guard.sh`, which refuses to deploy unless you are on
`equip-carry-forward`, level with `origin`, with a clean tree, and CI is green for that commit.

---

## Frontend deploy (Vercel)

**Critical:** git-push builds auto-cancel at the project level. The only working deploy path is the Vercel CLI.

**Use `bash scripts/deploy-prod.sh`.** It runs the guard, builds locally, runs
`npx vercel@latest deploy --prod --yes`, then tracks that deployment by its own URL until it is
Ready — the CLI prints a URL and exits 0 even for a failed build, so don't trust it on its own.
Authentication is stored in `~/.vercel/auth.json`; the `.vercel/` project link is gitignored.

- Team: `wugweb` (`team_8QvHezSgBzUD4STdma9lk5UF`)
- Project: `ikan`
- Production branch: `equip-carry-forward` (NOT `main`)
- Build output: `dist/`

After deploy, visit https://ikanhealth.in and smoke-test: homepage, dashboard login, one assessment,
one equip program detail page. Check Speed Insights is collecting (Vercel dashboard → Analytics).

### Vercel project configuration

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **SPA rewrite**: all non-asset paths → `/index.html` (configured in `vercel.json`)
- **Security headers** (`vercel.json`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`,
  `Content-Security-Policy`.

#### Strict-Transport-Security

`max-age=63072000; includeSubDomains` (two years). Every host we serve (`ikanhealth.in`,
`app.ikanhealth.in`, Vercel previews) is HTTPS-only. `preload` is deliberately **not** set — it is
a hard-to-reverse commitment for the whole domain; add it only once every subdomain is confirmed
HTTPS.

#### Content-Security-Policy

JSON has no comments, so the reasoning for each directive lives here. Origins were derived from
`index.html` and a grep of `src/` for external script/style/img/connect/frame usage. **If you add a
third-party script, API, embed or font, add its origin here and in `vercel.json` in the same
change** — otherwise it works in `npm run dev` (no CSP) and silently breaks in production.
The CSP is only applied by Vercel; `vite dev`/`vite preview` do not send it.

| Directive | Value | Why |
|---|---|---|
| `default-src` | `'self'` | Deny by default. |
| `script-src` | `'self'`, `'sha256-2+mVc3…LxU='`, `www.googletagmanager.com`, `checkout.razorpay.com`, `*.razorpay.com`, `va.vercel-scripts.com` | App bundle; the inline gtag bootstrap in `index.html` (by hash — **editing that inline script changes the hash**: recompute with `python3 -c "import re,hashlib,base64;s=open('index.html').read();b=re.search(r'<script>(.*?)</script>',s,re.S).group(1);print(base64.b64encode(hashlib.sha256(b.encode()).digest()).decode())"`); GA4 loader; Razorpay Checkout (`loadRazorpayScript`, `EquipProgramOnboarding`); Vercel Analytics/Speed Insights (served same-origin under `/_vercel/*` in production, from `va.vercel-scripts.com` otherwise). No `'unsafe-inline'`, no `'unsafe-eval'` — the build output contains no `eval`/`new Function` (lodash's `Function("return this")` fallback is never reached in a browser). |
| `style-src` | `'self' 'unsafe-inline'`, `fonts.googleapis.com` | Inline `style=` attributes and injected `<style>` are used throughout; Google Fonts CSS. |
| `font-src` | `'self' data:`, `fonts.gstatic.com` | Google Fonts files. |
| `img-src` | `'self' data: blob: https:` | CMS/admin-authored images can come from any HTTPS host (Unsplash, Supabase Storage signed/public URLs, pasted links); `blob:` for upload/crop previews; GA pixels. |
| `media-src` | `'self' blob: https:` | Native `<video>` blocks with admin-supplied `.mp4`/`.webm` URLs. |
| `connect-src` | `'self'`, `https://jpfvoevxegnknxoqmwye.supabase.co`, `wss://jpfvoevxegnknxoqmwye.supabase.co`, GA (`www.googletagmanager.com`, `*.google-analytics.com`, `*.analytics.google.com`), Razorpay (`api.`, `lumberjack.`, `*.razorpay.com`), `www.googleapis.com`, `nominatim.openstreetmap.org`, `ipapi.co`, `api.open-meteo.com`, `va.vercel-scripts.com`, `vitals.vercel-insights.com` | Edge function API, auth, storage and realtime (wss); analytics beacons; Razorpay Checkout; Google Fit (`integrations/google-fit.ts`); the dashboard Hello widget's reverse-geocode / IP-location / weather lookups (`dashboard/HelloWidget.tsx`); Vercel vitals. |
| `frame-src` | Razorpay (`api.`, `checkout.`, `*.razorpay.com`), `www.youtube.com`, `youtube.com`, `www.youtube-nocookie.com`, `player.vimeo.com` | Checkout iframe; video embeds in program blocks (`BlockRenderer`) and consultant intros (`ConsultantDetail`). Same-origin `about:blank` frames (admin email preview) need no entry. |
| `worker-src` | `'self' blob:` | Service worker / any bundled worker. |
| `manifest-src` | `'self'` | PWA manifest. |
| `object-src` | `'none'` | No plugins. |
| `base-uri` | `'self'` | Blocks `<base>` hijacking. |
| `form-action` | `'self'` | No cross-origin form posts (OAuth uses redirects, not forms). |
| `frame-ancestors` | `'none'` | Same as `X-Frame-Options: DENY`. |
| `upgrade-insecure-requests` | — | Any stray `http:` subresource is fetched over HTTPS. |

After changing the CSP, deploy a preview and check the browser console for `Refused to …`
violations on: homepage, sign-in, dashboard (Hello widget), one assessment, one equip program with
a video block, a Razorpay checkout, and the admin console.

---

## Edge function deploy (Supabase)

All API routes live in one function: `make-server-cc205da9`. Source is in `src/supabase/functions/server/`.
The frontend and the function deploy separately and nothing ties them together — run this whenever a
merge touches `src/supabase/functions/server/`.

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

## Rollback

- **Vercel**: Vercel dashboard → Deployments → click any prior deployment → Promote to Production.
- **Supabase edge function**: `deploy-edge.sh` downloads the live function before deploying and prints
  the exact rollback command (redeploy that downloaded copy) if any smoke result changed. Without that
  copy, redeploy from git (check out the prior commit, restage, redeploy) — but the live function need
  not match any commit, so prefer the downloaded copy.

---

## Monitoring

- **Runtime errors and logs**: Vercel MCP tools (`get_runtime_errors`, `get_runtime_logs`) or Vercel dashboard → Logs
- **Edge function logs**: Supabase dashboard → Edge Functions → Logs
- **Performance**: Vercel Speed Insights (auto-collected post-deploy)
- **DB health**: Supabase dashboard → Database → Query Performance

---

## Configuration & secrets

### Frontend
The app reads **no `VITE_*` env vars** — nothing needs setting in the Vercel dashboard.

- Supabase project id and anon key: `src/shared/config/supabase-info.tsx` (the anon key is public by design).
- Google Analytics measurement id: hardcoded in the gtag snippet in the root `index.html`.

### Supabase edge function
Set in Supabase dashboard under Project → Edge Functions → Secrets:

| Key | Used by |
|-----|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | KV store writes (service role) |
| `BREVO_API_KEY` | Brevo transactional email |

**Never commit secrets to git.**

---

## Database changes

There is no `supabase/migrations/` directory in this repo, so `supabase db push` / `supabase migration new`
do not apply — schema changes are not tracked as migration files here. Before running anything destructive (DROP, ALTER, UPDATE across many rows), take a
manual backup from the Supabase dashboard.

---

## Vercel Analytics & Speed Insights

`@vercel/analytics` and `@vercel/speed-insights` are installed and mounted in `src/App.tsx`. They activate automatically once a deployment is live — no extra dashboard config needed beyond the default "enabled" state per Vercel project settings.
