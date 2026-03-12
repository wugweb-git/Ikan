# iKan PWA - Deployment Guide

> **Last updated**: March 12, 2026
> **Audience**: DevOps and lead developers

---

## Deployment Architecture

```
GitHub Repository
    |
    +-- Push to main
    |       |
    |       +-- GitHub Actions CI/CD
    |       |       |
    |       |       +-- Security scan (npm audit, sensitive file check)
    |       |       +-- Quality checks (TypeScript, lint, build, bundle size)
    |       |       +-- Accessibility test (Lighthouse CI)
    |       |       +-- Mental health compliance (crisis support, privacy)
    |       |       |
    |       |       +-- Deploy to Staging --> Manual approval --> Deploy to Production
    |       |
    |       +-- Vercel (auto-deploy frontend)
    |
    +-- Manual: supabase functions deploy server --no-verify-jwt
            |
            +-- Supabase Edge Functions (backend)
```

---

## Frontend Deployment (Vercel)

### Automatic

Vercel auto-deploys on push to `main`. Configuration is in `/vercel.json`:

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Framework**: Vite
- **SPA rewrites**: All non-asset routes rewrite to `/index.html`

### Security Headers (Vercel)

Applied via `vercel.json`:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` |

### Caching Strategy

| Asset | Cache Policy |
|-------|-------------|
| `/assets/*` | `public, max-age=31536000, immutable` (1 year, Vite hashes filenames) |
| `/sw.js` | `no-cache, no-store, must-revalidate` |
| `/manifest.json` | `no-cache` |

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

---

## Backend Deployment (Supabase Edge Functions)

### Deploy Command

```bash
# Deploy the server edge function
supabase functions deploy server --no-verify-jwt

# Or via npm script
npm run supabase:deploy
```

> **`--no-verify-jwt`**: Required because the Hono server handles its own JWT verification via `requireAuth`/`requireAdmin` middleware. Supabase's built-in JWT verification would double-check and potentially conflict.

### Post-Deploy Verification

```bash
# Health check
curl https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9/health

# Expected response:
# {"status":"ok","timestamp":"2026-03-12T...","version":"2.1"}
```

### Viewing Logs

```bash
# Tail logs
supabase functions logs server --tail

# Or via npm script
npm run supabase:logs
```

---

## Environment Configuration

### Frontend

No environment variables needed. The app reads Supabase credentials from `/utils/supabase/info.tsx` (committed to repo). The anon key is public-safe.

### Backend (Edge Function Secrets)

Configured in Supabase Dashboard > Edge Functions > Secrets:

| Secret | Required | Description |
|--------|----------|------------|
| `SUPABASE_URL` | Auto | Injected by Supabase |
| `SUPABASE_ANON_KEY` | Auto | Injected by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto | Injected by Supabase |
| `SUPABASE_DB_URL` | Auto | Direct DB connection string |
| `RAZORPAY_KEY_SECRET` | Manual | Razorpay payment gateway secret |
| `GOOGLE_FIT_CLIENT_ID` | Manual | Google Fit OAuth client ID |
| `BREVO_API_KEY` | Manual | Brevo transactional email API key |

### GitHub Actions Secrets

For CI/CD, configure these in GitHub > Settings > Secrets:

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel deployment (if using GitHub Actions deploy) |
| `ORG_ID` | Vercel organization ID |
| `PROJECT_ID` | Vercel project ID |

---

## CI/CD Pipeline

### `ci.yml` - Basic CI

Runs on pushes to `main` and `develop`, and on PRs to `main`:

1. **Test** (matrix: Node 18 + 20): install, lint, type-check, build
2. **Deploy** (main only): build for production

### `production-deploy.yml` - Full Production Pipeline

Runs on pushes to `main`:

1. **Security scan**: `npm audit`, check for `.env` files, check for leaked service keys
2. **Quality checks**: TypeScript, lint, build, bundle size (<5MB check)
3. **Accessibility test**: Lighthouse CI audit
4. **Mental health compliance**: Verify crisis hotline (988), privacy policy presence
5. **Deploy staging**: Build with staging config, deploy
6. **Deploy production**: Manual approval required, final security check, deploy
7. **Performance check**: Post-deploy performance audit

---

## Bundle Optimization

Vite is configured with manual chunk splitting in `vite.config.ts`:

| Chunk | Contents |
|-------|---------|
| `vendor` | React, React DOM |
| `ui` | Radix UI (Dialog, Popover, Tabs) |
| `supabase` | Supabase JS client |
| `icons` | Lucide React |
| `motion` | Motion library |

### Monitoring Bundle Size

```bash
# Build and check
npm run build
du -sh dist/

# Bundle size is checked in CI (warning at >5MB)
```

---

## PWA Updates

The service worker uses `autoUpdate` strategy via `vite-plugin-pwa`:

- New versions are detected automatically
- Users get the update on next page load
- Service worker file (`sw.js`) is served with `no-cache` headers

### Cache Strategy

| Resource | Strategy | TTL |
|----------|----------|-----|
| API calls | NetworkFirst | 24 hours |
| Supabase Storage images | CacheFirst | 30 days |
| Static assets (JS/CSS) | Precache (Workbox) | Until next build |

---

## Rollback Procedure

### Frontend (Vercel)

1. Go to Vercel Dashboard > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"

### Backend (Supabase Edge Function)

Supabase doesn't have built-in rollback. To rollback:

1. `git checkout <last-good-commit>`
2. `supabase functions deploy server --no-verify-jwt`
3. Verify with health check

### Data (KV Store)

- Admin panel has a Backup Manager (`/admin` > Backup tab)
- KV store operations are immediate (no transactions)
- Consider exporting data before major changes

---

## Monitoring

### Available Tools

| Tool | Access |
|------|--------|
| Vercel Analytics | Vercel Dashboard |
| Supabase Logs | `supabase functions logs server` |
| Admin System Logs | `/admin` > System Logs tab |
| Admin Performance | `/admin` > Analytics tab |
| Lighthouse CI | Automated in CI pipeline |

### Key Health Indicators

- `/health` endpoint returns 200 with `{"status":"ok"}`
- No 5xx errors in Supabase function logs
- Bundle size stays under 5MB
- Lighthouse PWA score > 90
