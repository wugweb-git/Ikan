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


## Branch & Vercel Deploy Hygiene

## Branch Cleanup (GitHub + Vercel)

If old Codex branches are still showing broken previews, remove them after merge:

```bash
# delete remote branch
git push origin --delete codex/fix-issues-after-last-update
git push origin --delete codex/fix-issues-after-last-update-a5deuo

# prune local stale refs
git fetch --prune
```

In Vercel Project Settings, disable stale branch deployments or narrow preview branches to active patterns only.


To avoid "one branch deploys clean, another is messy":
- Keep `vercel.json` and `src/vercel.json` identical in every PR.
- Rebase feature branches on latest `main` before opening PR (avoid stale merge commits with old config).
- Require `npm run verify:config && npm run build` to pass before merge.
- Promote only the latest successful preview from the branch tip commit.

## Deployment Notes

- Frontend output directory: `dist`
- SPA fallback rewrite: `/(.*)` → `/index.html`

## Additional Docs

For deeper implementation details, see `src/README.md` and files under `src/docs/`.
