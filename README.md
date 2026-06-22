
  # ikan

  iKan Health (ikanhealth.in) — an India-based mental wellness platform: self-guided
  assessments, structured "Equip" programs, mood journaling, and professional consultations.
  Built with Vite + React + TypeScript, backed by Supabase (Hono edge functions + KV store),
  deployed on Vercel. The original design is at https://www.figma.com/design/7LUoUuChal8qFiK0ylVrcN/ikan.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  Run `npm run build` to produce the production bundle in `dist/`.

  ## URLs / routing

  Routing is client-side (custom, in `src/App.tsx`). Public detail pages use human-readable
  slugs, resolved by the backend (and a client fallback) to the underlying record:

  - Assessments: `/assessment/<slug>` (legacy `/assessment-detail?id=<id>` still works)
  - Equip programs: `/equip/<slug>` (legacy `/equip-detail?id=<id>` still works)

  Slugs live on each record plus a `assessment_slug:<slug>` / `equip_slug:<slug>` KV index.
  Helpers: `src/lib/slug.ts`.

  ## SEO

  - Per-page meta/OpenGraph/Twitter/canonical + JSON-LD via the `useSeo` hook (`src/hooks/useSeo.ts`),
    used by `AssessmentDetail` and `EquipDetail`.
  - Static `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt`.
  - Google Analytics (gtag `G-ZD4D5LZBQG`) is loaded from the active shell `index.html`.

  See `DESIGN.md` for design/architecture decisions and `src/docs/` for deeper docs.
