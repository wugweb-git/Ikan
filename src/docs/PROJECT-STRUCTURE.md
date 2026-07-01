# iKan Health — Project Structure

> **Last updated**: July 2026
> **Audience**: All developers

---

## Root

```
/
├── CLAUDE.md              # AI/developer quick-reference
├── BRAND.md               # Voice, tone, crisis resources, email conventions
├── BUILD.md               # Build, deploy, migration commands
├── DESIGN.md              # Architecture decisions, slug system, KV model
├── README.md              # Public-facing project overview
├── index.html             # HTML shell (GA tag, OG/Twitter meta)
├── package.json
├── vite.config.ts
├── vercel.json            # SPA rewrites, security headers
├── tsconfig.json
├── .vercel/               # Vercel project link (gitignored)
├── supabase/              # Supabase migrations
│   └── migrations/
├── public/                # Static assets served at root
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── llms.txt
│   ├── security.txt
│   ├── ai-context.txt
│   ├── .well-known/security.txt
│   └── team/              # Founder headshots (kartik, vedanshu, vaibhav, amitabh, divyanshu, sachin)
└── src/                   # All source code
```

---

## `src/`

```
src/
├── App.tsx                # Single routing hub — maintains currentRoute, handles navigation
├── main.tsx               # React entry point
├── index.css              # Tailwind base import
├── components/            # React components (see below)
├── contexts/              # React context providers (Auth, Notifications, PWA)
├── hooks/                 # Custom hooks (usePageContent, useSeo, useHealthData, …)
├── lib/                   # Utilities and services
├── utils/                 # Small helpers + cms-defaults.ts
├── styles/                # globals.css (design tokens, component defaults)
├── guidelines/            # Design system doc (Guidelines.md)
├── docs/                  # Developer docs (this folder)
├── supabase/functions/server/  # Edge function source (25 route modules)
├── assets/                # Bundled images/fonts
├── imports/               # Figma-generated SVG components
└── services/              # API service layer (thin wrappers around apiClient)
```

---

## `src/components/`

### Root-level loose files (not yet reorganised — see DESIGN.md)

`AuthForm.tsx`, `CalendarStrip.tsx`, `ChunkErrorBoundary.tsx`, `CorporateProgramCard.tsx`, `DashboardActionBlocks.tsx`, `ErrorBoundary.tsx`, `Footer.tsx`, `HelloWidget.tsx`, `Icon.tsx`, `IkanScoreCard.tsx`, `LoadingSpinner.tsx`, `LoginScreen.tsx`, `Logo.tsx`, `OfflineBanner.tsx`, `ProgramProgressTracker.tsx`, `RecommendationCards.tsx`, `RouteGuard.tsx`

### Subdirectories

| Folder | Contents |
|--------|---------|
| `admin/` | Admin panel components (RBAC-gated) |
| `assessments/` | Assessment-specific components (ReassessmentPrompt) |
| `blocks/` | Reusable content blocks (SectionHero, BookingModal, NewsletterBlock, BentoGrids, …) |
| `equip/` | Equip program-specific UI (ProgramCheckIn) |
| `figma/` | Figma-generated components (ImageWithFallback) |
| `integrations/` | Health Connect / Google Fit context + ActivityCard |
| `monitoring/` | SafePerformanceMonitor |
| `navigation/` | Nav bar, tab bar |
| `notifications/` | PushPermissionPrompt |
| `organisms/` | AssessmentQuestion (compound input component) |
| `payments/` | Razorpay / payment UI |
| `player/` | BlockRenderer (lesson, exercise, clinical blocks), ProgramPlayer |
| `safety/` | CrisisSupport panel |
| `screens/` | Full-page screen components (Dashboard, AboutUs, ContactUs, AssessmentDetail, EquipDetail, ResetPassword, …) |
| `ui/` | Radix-based primitives (Button, Input, Card, Dialog, Select, …) |

---

## `src/lib/`

| File | Purpose |
|------|---------|
| `api-client.ts` | Authenticated fetch wrapper for the edge function |
| `supabase-client.ts` | Supabase JS client singleton |
| `slug.ts` | `slugify()`, `assessmentUrl()`, `equipUrl()` |
| `google-fit.ts` | Google Fit REST API aggregation |
| `health-connect-bridge.ts` | Android TWA native data bridge |
| `emoji-utils.ts` | Emoji scale loading and helpers |
| `constants/` | Content constants (NEWSLETTER_CONTENT, etc.) |

---

## `src/supabase/functions/server/`

25 `.ts`/`.tsx` files making up the single edge function. See `src/supabase/functions/server/CLAUDE.md` for the full guide and deploy steps.

Key files: `index.tsx` (entry), `program-service.ts` (equip/day/block CRUD), `content-service.ts` (KV wrapper), `shared-types.ts` (shared TypeScript types).
