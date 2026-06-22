# iKan Health — Design & Architecture Notes

Living document for cross-cutting product/engineering decisions. Stack: Vite + React + TS,
Supabase (Hono edge functions + a single `kv_store_cc205da9` key/value table), Vercel.

## Content model

Most public content is dynamic, read from the Supabase KV store via the edge function
`make-server-cc205da9`. Code-side defaults in `src/utils/cms-defaults.ts` are shown
immediately (stale-while-revalidate via `usePageContent`) and overridden by saved CMS records.

Key prefixes:
- `assessment_def:<id>` / `equip:<id>` — full records.
- `assessment_slug:<slug>` / `equip_slug:<slug>` — slug → id indexes.
- `cms_page:<pageId>` — editable page content. `settings:site` — global site settings.
- `mood:*`, `checkin_scale:*` — mood/check-in tracker scales (backend-synced).

## URLs / routing

Routing is custom and client-side (`src/App.tsx`): it matches `window.location.pathname`
against a route table and a few path patterns. Detail pages use readable slugs:

- `/assessment/<slug>` and `/equip/<slug>` are parsed in three places that must stay in sync:
  the initial `useState`, `handleNavigate`, and the `popstate` handler. Each maps to the
  existing `/assessment-detail` / `/equip-detail` screen and passes the slug as the id.
- Legacy `?id=<id>` URLs still resolve (backend tries id, then slug; assessment detail also
  has a client-side list fallback for resilience during deploys).
- Build links with the helpers in `src/lib/slug.ts` (`assessmentUrl`, `equipUrl`).

## Images / banners

Hero/banner images come from record fields. Two historical data hazards:
- Assessments referenced the discontinued `source.unsplash.com` (replaced with `images.unsplash.com`).
- Equip cover images were Supabase Storage **signed URLs** that expire — prefer the public
  `image_url`; `EquipDetail` skips `/object/sign/` URLs, and `SectionHero` has an `onError`
  fallback so a banner always renders. Store **public** URLs going forward.

## SEO

- `useSeo` (`src/hooks/useSeo.ts`) sets title/description/canonical/OpenGraph/Twitter + JSON-LD
  per page. Used on assessment & equip detail; extend to other pages as needed.
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt` are static; update the sitemap
  when assessment/equip slugs change.
- Google Analytics gtag lives in the active root `index.html` (not the legacy `src/index.html`).
- Limitation: this is a client-rendered SPA. Googlebot renders JS, but non-JS social scrapers
  see only the static `index.html` tags. Prerendering/SSR is a future improvement for richer
  link previews.

## Footer / hero layout

`shouldShowFooter` in `src/App.tsx` controls both the footer and (via `isHeroRoute`) whether a
page gets the desktop top offset. Detail routes are included so the hero sits flush to the top
and the footer renders.

## Known content gaps

Some equip bento sub-blocks (right-column items, "how it works" subtitle/footer) have no CMS
data and fall back to generic defaults — populate them from the admin to make them program-specific.
