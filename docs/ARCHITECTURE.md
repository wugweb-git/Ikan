# iKan Health — Architecture Overview

> **Last updated**: July 2026
> **Audience**: All developers contributing to iKan

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | React 18.3.1, TS 5 |
| **Styling** | Tailwind CSS v4 + Radix UI | 4.1.12 |
| **Animation** | Framer Motion | 12.x |
| **Build** | Vite | 6.3.5 |
| **Backend** | Supabase Edge Functions (Deno + Hono) | single function |
| **Database** | Supabase Postgres (KV table) | `kv_store_cc205da9` |
| **Auth** | Supabase Auth | v2, email confirmation ON |
| **Deployment** | Vercel CLI (frontend) + Supabase CLI (backend), via `scripts/deploy-prod.sh` / `scripts/deploy-edge.sh` — see `docs/BUILD.md` | |
| **Analytics** | Vercel Analytics + Speed Insights | |

---

## Three-Tier Architecture

```
Browser (React SPA / PWA)
    |
    |  HTTPS — Authorization: Bearer <jwt>
    v
Supabase Edge Function  (make-server-cc205da9)
  Deno runtime, Hono router, one *-routes.ts module per area
    |
    |  Supabase client (service-role key)
    v
Supabase Postgres  (kv_store_cc205da9 table)
  key TEXT PK  |  value JSONB  |  RLS enabled, no public policies
```

---

## Frontend Architecture

### Manual routing (no React Router)

`src/App.tsx` is the single routing hub. It maintains `currentRoute` state and `handleNavigate()`. There is no `<Route>` or `<Link>` — every navigation is a function call.

- Slug-based routes `/assessment/<slug>` and `/equip/<slug>` are parsed in three places in `App.tsx`: initial `useState`, `handleNavigate`, and the `popstate` listener.
- Slug helpers: `src/product/app/ui/slug.ts` (`slugify`, `assessmentUrl`, `equipUrl`) — always build links with these.
- Each slug route maps to the existing `/assessment-detail` / `/equip-detail` screen and passes the slug as the id.
- Legacy `?id=<id>` URLs still resolve (backend tries id, then slug; assessment detail also has a client-side list fallback for resilience during deploys).

### Footer / hero layout

`shouldShowFooter` in `src/App.tsx` controls both the footer and (via `isHeroRoute`) whether a page gets the desktop top offset. Detail routes are included so the hero sits flush to the top and the footer renders.

### Context providers (App.tsx order)

`AuthProvider → NotificationProvider → PaymentProvider → JourneyProvider → GoogleFitProvider → SecurityProvider → (children)`

### Content model

Site page copy is code-only: it lives in `src/product/site/content/cms-defaults.ts` and is not fetched. The marketing site makes no reads beyond the professional-application form's category list: its assessment, equip and consultant pages render the build-time snapshot (`content/catalog.ts`), and the footer's contact details come from `content/site-settings.ts` rather than `/settings`. Its other network calls are the contact form, newsletter and application submissions. The Page Manager, `usePageContent` and the `/cms/pages` routes were removed (PR #14); leftover `cms_page:`/`page:` KV rows are dead and nothing reads them. In the member app, assessments, equip programs, settings and check-in scales are still dynamic, read from the KV store via the edge function.

### Images / banners

Hero/banner images come from record fields. Two historical data hazards:
- Assessments referenced the discontinued `source.unsplash.com` (replaced with `images.unsplash.com`).
- Equip cover images were Supabase Storage **signed URLs** that expire — prefer the public `image_url`; `EquipDetail` skips `/object/sign/` URLs, and the hero (`SectionHero` in the app, `PageHero variant="split"` on the site) logs an image failure and shows a neutral plate rather than a stock photo. Store **public** URLs going forward.

Some equip bento sub-blocks (right-column items, "how it works" subtitle/footer) have no CMS data and fall back to generic defaults — populate them from the admin to make them program-specific.

### SEO

- `useSeo` (`src/product/site/ui/hooks/useSeo.ts`) sets title/description/canonical/OpenGraph/Twitter + JSON-LD per page. **Every public page calls it** as of 2026-10-03 — six did not, so their tab kept whatever title the previous route had set.
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt` are static. The sitemap lists **10 URLs**: the marketing pages only. Assessment and equip slug URLs were removed on 2026-10-03 when `/assessment`, `/equip`, `/resource` and `/consultation` began 301-ing to `app.ikanhealth.in`, so there are no slugs here to keep in step any more.
- Google Analytics gtag lives in the root `index.html` (the measurement id is hardcoded there).
- Limitation: this is a client-rendered SPA. Googlebot renders JS, but non-JS social scrapers see only the static `index.html` tags. Prerendering/SSR is a future improvement for richer link previews.

---

## Backend Architecture

One deployed Supabase Edge Function (`make-server-cc205da9`) handles every route module. See `src/supabase/functions/server/CLAUDE.md` for the full backend guide and `docs/BACKEND-GUIDE.md` for the route reference.

### KV key prefixes

The canonical key-prefix table (including which prefixes are dead) lives in [`CLAUDE.md` → KV store model](../CLAUDE.md#kv-store-model) — don't copy it here. Records relate through fields inside the value, not through key structure.

---

## Auth Architecture

- **Sign-up**: client-side `supabase.auth.signUp()` → Supabase sends a native confirmation email. Users must verify before accessing protected routes.
- **Sign-in**: standard Supabase email+password. Wrong password returns an error — no silent account creation.
- **Password reset**: `/reset-password` route (`src/product/app/account/ResetPassword.tsx`) handles the `PASSWORD_RECOVERY` session event.
- **Google OAuth**: used for Google Fit linking via `supabase.auth.linkIdentity({ provider: 'google' })`. Supabase Auth has Google provider enabled.
- **Security**: manual linking ON, PKCE flow. Leaked-password protection is **not** enabled.

---

## Health Connect / Google Fit

`src/product/app/integrations/GoogleFitContext.tsx` provides `useHealthConnect()` and `useGoogleFit()`. Data flows into `/health-connect/data` on the edge function and is stored under `hc_data:{userId}`. Native Android Health Connect uses a TWA bridge; web Google Fit uses OAuth + the Fit REST API (`src/product/app/integrations/google-fit.ts`).

---

## Design System

Tokens in `src/product/site/ui/styles/globals.css`. Brand standards in `/BRAND.md`. Code layout (`src/{admin,app,site,shared}`): `docs/PROJECT-STRUCTURE.md`.
