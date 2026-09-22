# iKan Health — Project Structure

> **Last updated**: 2026-09-21 (codebase separation, branch `restructure/codebase-separation`)
> **Audience**: All developers

The frontend is split into three **surfaces** that never share UI — `admin/`, and the two
product surfaces `product/app/` and `product/site/` — plus one **non-UI** layer they all import. The split is enforced by a lint boundary
(`eslint.config.js`, counted by `npm run lint:boundary` in CI).

---

## Root

```
/
├── CLAUDE.md · AGENTS.md    # AI/developer rules (read every session)
├── README.md
├── index.html               # the only Vite entry (GA tag, OG/Twitter meta)
├── vite.config.ts · tsconfig.json · eslint.config.js · package.json
├── vercel.json              # SPA rewrites, headers, git deploy branches
├── scripts/                 # ratchets + guarded deploy scripts; baselines/ holds each ratchet's number
├── public/                  # static files served at /
├── docs/                    # all other documentation: PENDING, CHANGELOG, SESSIONS, BUILD, BRAND, GOVERNANCE, architecture… (archive/ = superseded)
├── dev/                     # dev-only harness pages (vite dev → /dev/<name>.html); not built
└── src/
```

## src/

Every surface is organised **by feature**: each feature folder holds its screens,
components, hooks and helpers together. `shell/` is the frame (routing, login,
navigation); `ui/` is the surface's own design system, including its stylesheet.

```
src/
├── App.tsx                # composition root — routes admin, app and site
├── main.tsx               # entry; loads product/site/ui/styles/index.css
│
├── admin/                 # STAFF surface — ikanhealth.in/admin, server-verified admins only
│   ├── shell/             # AdminDashboard (frame + router), AdminGate, login, header, SideNav,
│   │                      #   sections.ts = the ONE list of admin sections (nav, search, routes)
│   ├── ui/                # primitives · kit/ (DataTable, Empty/Error/Loading states,
│   │                      #   ConfirmDialog, EntityEditPage, LandingCopyForm, FormField…) ·
│   │                      #   hooks/ (useAdminResource, useUnsavedChanges…) · lib/ · styles/
│   ├── block-builder/     # programme builder (+ model/ = the block model, DayComposer)
│   ├── block-types/ · programs/ · assessments/ · recommendations/ · check-ins/ · catalog/
│   ├── resources/ · media/ · consultations/ · users/ · communication/ · analytics/
│   ├── payments/ · settings/ · system/ (KV audit; backup + CRUD tools kept unwired)
│   └── engines/           # scoring + recommendation engines (admin's copy)
│
├── product/
│   ├── site/              # MARKETING + policy — static pages for ikanhealth.in
│   │   ├── pages/         # homepage/ sections, About, FAQ, Contact, LegalPage (4 policies),
│   │   │                  #   Sitemap, static Assessments/Equip/Consultation, NotFound
│   │   ├── ui/            # Footer, public nav, PageHero, Container, SiteLink, primitives,
│   │   │                  #   blocks/, hooks/, lib/ (sanitize), styles/ (product stylesheet)
│   │   └── content/       # cms-defaults.ts (page copy) · nav.ts (every nav list) ·
│   │                      #   site-settings.ts · catalog.ts + data/ (frozen public catalogue,
│   │                      #   refreshed by scripts/snapshot-site-data.mjs) · app-origin.ts · assets/
│   └── app/               # MEMBER app (legacy — members use app.ikanhealth.in; cleanup deferred)
│       ├── shell/         # route guard, login, error boundary, offline, security, navigation/
│       ├── ui/            # app's own UI (primitives, blocks/, svg/, hooks/, lib/)
│       ├── dashboard/ · assessments/ · programs/ (player + BlockRenderer + block-model/)
│       ├── journal/ · resources/ · consultations/ · account/ · onboarding/
│       └── payments/ · integrations/ · notifications/ · safety/ · engines/
│
├── shared/                # ONLY runtime singletons — must exist once
│   ├── api/               # api.ts (apiClient), api-types, supabase.ts, supabase-info,
│   │                      #   user-storage, and api's two helpers
│   └── state/             # AuthContext, NotificationContext
│
└── supabase/functions/server/   # the edge function (Deno/Hono) — deployed separately
```

## The boundary rules

| from | may import | may NOT import |
|---|---|---|
| `admin/` | itself, `shared/` | `product/` — except `product/app/programs/BlockRenderer` and `product/app/programs/ProgramPlayer`, allowed by name so admin previews match what members see |
| `product/app/` | itself, `shared/` | `admin/`, `product/site/` |
| `product/site/` | itself, `shared/` | `admin/`, `product/app/` |
| `shared/` | itself | any surface |

`App.tsx` is exempt: it is the composition root that mounts all three.

**No UI or styles are shared.** admin/ and product/site each own their stylesheet; `shared/` holds no UI. Anything two surfaces need that is not a runtime singleton is copied into each. Where two surfaces need the same primitive, each holds its
own copy (`admin/ui/button.tsx`, `product/app/ui/button.tsx`, `product/site/ui/button.tsx`).
They may drift — that is the point.
