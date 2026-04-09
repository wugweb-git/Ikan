# iKan

iKan is a mental wellness product delivered as a Progressive Web App (PWA). It combines guided assessments, EQUIP program delivery, journaling, content resources, and an admin CMS for operations.

## Product Summary

- **User experiences**: onboarding, assessments, EQUIP program playback, mood journaling, learning diary, resource browsing, and consultation flows.
- **Admin experiences**: content/page management, assessments and EQUIP management, analytics, and operational tooling.
- **Architecture**: React + TypeScript frontend, Supabase-backed APIs/services, Vercel-hosted web app.

## Tech Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- Framer Motion
- Supabase

## Local Development

```bash
npm install
npm run dev
```

## Quality & Regression Guardrails

To prevent regressions such as broken responsive rendering or invalid deploy config:

```bash
npm run verify:config
npm run build
# or run both together:
npm run test:guardrails
```

`verify:config` checks:
- Tailwind Vite plugin import and registration in `vite.config.ts`
- JSON validity + SPA rewrite fallback in `vercel.json` and `src/vercel.json`

## Deployment Notes

- Frontend output directory: `dist`
- SPA fallback rewrite: `/(.*)` → `/index.html`

## Additional Docs

For deeper implementation details, see `src/README.md` and files under `src/docs/`.
