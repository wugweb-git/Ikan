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

```
src/
├── App.tsx                # composition root — routes admin, app and site
├── main.tsx               # entry; loads product/styles/index.css
│
├── admin/                 # STAFF surface
│   ├── screens/           # admin + editor screens
│   ├── components/        # admin widgets (tables, forms, SideNav, …)
│   ├── builder/           # program builder
│   ├── blocks/            # block gallery / type viewer / day composer
│   ├── ui/                # the old component library — admin's own copy
│   ├── hooks/ · lib/      # admin-only hooks and helpers
│   ├── styles/            # admin's own stylesheet (Tailwind entry + tokens), loaded with the admin chunk
│
├── product/
│   ├── styles/            # product's stylesheet (Tailwind entry + tokens), loaded by main.tsx
│   ├── app/               # MEMBER product
│   │   ├── screens/           # member screens (+ account/, onboarding/)
│   │   ├── features/          # player, payments, notifications, safety,
│   │   │                      #   integrations, widgets, assessment
│   │   ├── blocks/            # BlockRenderer
│   │   ├── ui/                # app's own UI (primitives, blocks/, svg/)
│   │   ├── shell/             # route guard, login, error boundary, offline,
│   │   │                      #   security, member navigation, app contexts
│   │   ├── hooks/ · lib/ · assets/
│
│   ├── site/              # MARKETING + policy — static pages
│   │   ├── pages/             # pages + homepage/ sections; LegalPage renders the 4 policies
│   │   ├── ui/                # site's own UI (Footer, public nav, PageHero, Container,
│   │   │                      #   SiteLink, primitives, blocks/, hooks/, lib/, styles/)
│   │   ├── content/           # cms-defaults.ts = page copy · nav.ts = every nav list ·
│   │   │                      #   site-settings.ts = footer facts · catalog.ts + data/ = snapshot
│
├── shared/                # NON-UI contract every surface imports
│   ├── api.ts · api-types.ts · supabase.ts · validation.ts · logger.ts
│   ├── blocks/            # block model (+ tests)
│   ├── engine/            # scoring + recommendation engines
│   ├── contexts/          # AuthContext, NotificationContext (one session source)
│   ├── hooks/             # useIsMobile, useMetadata, useOfflineSync, usePublicSettings
│   ├── lib/               # cross-surface helpers (metadata catalog, icons, tokens, …)
│   └── config/            # supabase-info
│
└── supabase/functions/server/   # the edge function (Deno/Hono) — deployed separately
```

## The boundary rules

| from | may import | may NOT import |
|---|---|---|
| `admin/` | itself, `shared/` | `product/` — except `product/app/blocks/BlockRenderer` and `product/app/features/player/ProgramPlayer`, allowed by name so admin previews match what members see |
| `product/app/` | itself, `shared/` | `admin/`, `product/site/` |
| `product/site/` | itself, `shared/` | `admin/`, `product/app/` |
| `shared/` | itself | any surface |

`App.tsx` is exempt: it is the composition root that mounts all three.

**No UI or styles are shared.** admin/ and product/ each own their stylesheet. Where two surfaces need the same primitive, each holds its
own copy (`admin/ui/button.tsx`, `product/app/ui/button.tsx`, `product/site/ui/button.tsx`).
They may drift — that is the point.
