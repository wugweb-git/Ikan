# iKan Health — Contributing Guide

> **Last updated**: July 2026
> **Audience**: All contributors

---

## Branch model

```
equip-carry-forward   ← PRODUCTION (deploys to ikanhealth.in)
main                  ← diverged; not used for production deploys
feature/<name>        ← branch from equip-carry-forward
fix/<name>            ← bug fixes
```

**Never deploy from `main`.** See `BUILD.md` → Vercel CLI for the correct deploy path.

---

## Workflow

1. Branch from `equip-carry-forward`
2. Make changes following the conventions below
3. `npm run build` must pass (TypeScript + Vite build)
4. `npm run lint` must pass
5. Open a PR targeting `equip-carry-forward`
6. Deploy to production with `npx vercel@latest deploy --prod --yes` after merge

---

## Code conventions

### TypeScript

- Strict mode enabled: `noUnusedLocals`, `noUnusedParameters`
- Prefix intentionally-unused params with `_` (e.g. `_event`)
- All props and API shapes must have TypeScript interfaces

### React components

- Functional components with hooks only
- `useCallback` / `useMemo` for expensive computations passed as props
- No class components

### Styling

- Tailwind CSS v4 utility classes for layout/spacing
- CSS custom properties (`var(--color-*)`, `var(--radius-*)`) for design tokens — never hardcode hex values in component files
- Tokens are defined in `src/styles/globals.css`

### Comments

- Write comments for **why**, not **what** — the code shows what, a comment explains a non-obvious constraint or workaround
- No commented-out code blocks in PRs

---

## CMS content changes

The app uses stale-while-revalidate CMS: `src/utils/cms-defaults.ts` provides instant defaults; live Supabase KV overrides them. When changing any CMS-backed text, phone number, or resource link, **update both**:

1. The default in `cms-defaults.ts`
2. The live Supabase KV record (via admin API or SQL)

Otherwise production will continue showing the old saved value even after a deploy.

---

## Brand standards

See `/BRAND.md` for voice/tone, email addresses, India crisis resources, and what language to avoid (e.g. "workout" → "activity").

---

## Security

- No secrets in code. Supabase service-role key stays in Vercel env and Supabase Edge Function secrets only.
- The anon key in `src/lib/supabase-client.ts` is intentionally public.
- Do not re-enable auto-create-on-failed-login in `AuthContext.tsx` — it was removed deliberately.
- SECURITY DEFINER functions in Postgres (`kv_store_row_count`, `rls_auto_enable`) are locked to service-role — do not grant EXECUTE to `anon`/`authenticated`/`PUBLIC`.
