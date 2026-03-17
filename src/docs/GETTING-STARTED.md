# iKan PWA - Getting Started

> **Last updated**: March 17, 2026
> **Audience**: New developers joining the project

---

## Prerequisites

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| Node.js | 18.0.0 | `node -v` |
| npm | 9.x | `npm -v` |
| Supabase CLI | Latest | `supabase --version` |
| Git | Any recent | `git --version` |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ikan-mental-health-pwa.git
cd ikan-mental-health-pwa

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# App runs at http://localhost:3000
```

> **Note**: The app reads Supabase credentials from `/utils/supabase/info.tsx` (hardcoded project ID and anon key). There is no `.env` file for Supabase config.

---

## Environment Setup

### Supabase Connection

The Supabase project ID and anon key are committed in `/utils/supabase/info.tsx`. This is intentional - the anon key is safe for public use (it's a public API key, not the service role key).

### Backend (Edge Functions)

The Hono server runs as a Supabase Edge Function. To deploy:

```bash
# Deploy the edge function
npm run supabase:deploy
# OR
supabase functions deploy server --no-verify-jwt

# Check server health
npm run health:check
```

### Environment Secrets (Server-Side)

These are configured in the Supabase dashboard under Edge Function secrets:

| Secret | Purpose |
|--------|---------|
| `SUPABASE_URL` | Auto-injected by Supabase |
| `SUPABASE_ANON_KEY` | Auto-injected by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected by Supabase |
| `SUPABASE_DB_URL` | Direct database connection |
| `RAZORPAY_KEY_SECRET` | Payment gateway |
| `GOOGLE_FIT_CLIENT_ID` | Google Fit integration |
| `BREVO_API_KEY` | Transactional email (Brevo/Sendinblue) |

---

## Available Scripts

### Development

| Command | Description |
|---------|------------|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | TypeScript type checking only (no emit) |

### Supabase

| Command | Description |
|---------|------------|
| `npm run supabase:start` | Start local Supabase stack |
| `npm run supabase:stop` | Stop local Supabase stack |
| `npm run supabase:deploy` | Deploy edge function to remote |
| `npm run supabase:logs` | View edge function logs |

### Quality

| Command | Description |
|---------|------------|
| `npm run lint` | ESLint with zero-warning policy |
| `npm run type-check` | TypeScript strict mode check |
| `npm run audit:accessibility` | Run accessibility audit script |
| `npm run audit:imports` | Check for unused imports |

### Deployment

| Command | Description |
|---------|------------|
| `npm run deploy` | Build + deploy edge function |
| `npm run setup:complete` | Full setup: install, deploy backend, seed data |

---

## Project Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript config (strict mode, `noUnusedLocals: true`) |
| `tsconfig.node.json` | TypeScript config for Node.js tooling |
| `vite.config.ts` | Vite + PWA + path aliases |
| `postcss.config.js` | PostCSS for Tailwind |
| `vercel.json` | Vercel deployment + headers + rewrites |
| `supabase/config.toml` | Supabase project configuration |
| `lighthouserc.json` | Lighthouse CI thresholds |
| `netlify.toml` | Netlify config (alternative deployment) |

---

## Path Aliases

Configured in both `tsconfig.json` and `vite.config.ts`:

| Alias | Maps To |
|-------|---------|
| `@/*` | `./*` (project root) |
| `@components/*` | `./components/*` |
| `@lib/*` | `./lib/*` |
| `@utils/*` | `./utils/*` |
| `@contexts/*` | `./contexts/*` |
| `@hooks/*` | `./hooks/*` |

---

## First Steps for New Developers

1. **Read the architecture docs**: Start with `docs/ARCHITECTURE.md` to understand the full system
2. **Review the design system**: Read `/guidelines/Guidelines.md` for UI/UX rules
3. **Explore the route config**: Check `/lib/route-config.ts` to see all available screens
4. **Run the app**: `npm run dev` and click through the public and authenticated flows
5. **Check the admin panel**: Sign in as an admin user and explore `/admin`
6. **Read the contributing guide**: See `docs/CONTRIBUTING.md` before making changes