# iKan Health — Project Structure

> **Last updated**: 2026-09-21 (codebase separation, branch `restructure/codebase-separation`)
> **Audience**: All developers

The frontend is split into three **surfaces** that never share UI, plus one
**non-UI** layer they all import. The split is enforced by a lint boundary
(`eslint.config.js`, counted by `npm run lint:boundary` in CI).

---

## Root

```
/
├── CLAUDE.md · AGENTS.md    # AI/developer rules (read every session)
├── README.md · CHANGELOG.md · PENDING.md · GOVERNANCE.md
├── BRAND.md · BUILD.md · DESIGN.md
├── SESSIONS.md · HANDOFF.md # concurrent-session protocol, current brief
├── index.html               # the only Vite entry (GA tag, OG/Twitter meta)
├── vite.config.ts · tsconfig.json · eslint.config.js · package.json
├── vercel.json              # SPA rewrites, headers, git deploy branches
├── .*-baseline              # ratchet baselines (typecheck, lint, contrast, raw-hex, a11y, boundary)
├── scripts/                 # ratchets + guarded deploy scripts
├── public/                  # static files served at /
├── docs/                    # all documentation (archive/ = superseded)
├── dev/                     # dev-only harness pages (vite dev → /dev/<name>.html); not built
└── src/
```

## src/

```
src/
├── App.tsx                # composition root — routes admin, app and site
├── main.tsx · index.css   # entry; index.css pulls in styles/globals.css
├── styles/globals.css     # design tokens, loaded once for every surface
│
├── admin/                 # STAFF surface
│   ├── screens/           # admin + editor screens
│   ├── components/        # admin widgets (tables, forms, SideNav, …)
│   ├── builder/           # program builder
│   ├── blocks/            # block gallery / type viewer / day composer
│   ├── ui/                # the old component library — admin's own copy
│   ├── hooks/ · lib/      # admin-only hooks and helpers
│
├── app/                   # MEMBER product
│   ├── screens/           # member screens (+ account/, onboarding/)
│   ├── features/          # player, payments, notifications, safety,
│   │                      #   integrations, widgets, assessment
│   ├── blocks/            # BlockRenderer
│   ├── ui/                # app's own UI (primitives, blocks/, svg/)
│   ├── shell/             # route guard, login, error boundary, offline,
│   │                      #   security, member navigation, app contexts
│   ├── hooks/ · lib/ · assets/
│
├── site/                  # MARKETING + policy
│   ├── pages/             # pages + homepage/ sections
│   ├── ui/                # site's own UI (Footer, public nav, primitives, blocks/)
│   ├── hooks/ · lib/ · assets/   # lib/cms-defaults.ts = all site page copy
│
├── shared/                # NON-UI contract every surface imports
│   ├── api-client.ts · api-types.ts · supabase-client.ts · validation.ts · logger.ts
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
| `admin/` | itself, `shared/` | `app/`, `site/` — except `app/blocks/BlockRenderer` and `app/features/player/ProgramPlayer`, allowed by name so admin previews match what members see |
| `app/` | itself, `shared/` | `admin/`, `site/` |
| `site/` | itself, `shared/` | `admin/`, `app/` |
| `shared/` | itself | any surface |

`App.tsx` is exempt: it is the composition root that mounts all three.

**No UI is shared.** Where two surfaces need the same primitive, each holds its
own copy (`admin/ui/button.tsx`, `app/ui/button.tsx`, `site/ui/button.tsx`).
They may drift — that is the point.
