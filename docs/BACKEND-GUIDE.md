# iKan Health — Backend Guide & API Reference

> **Route table last verified 2026-08; regenerate from `src/supabase/functions/server/*-routes.ts` before relying on it.**
>
> **Last updated**: July 2026
> **Audience**: Backend and full-stack developers
> **Base URL**: `https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9`

For deploy instructions see `BUILD.md`. For the nested backend CLAUDE.md see `src/supabase/functions/server/CLAUDE.md`.

---

## Overview

All API routes run inside one Deno/Hono function: **`make-server-cc205da9`**. Source files are in `src/supabase/functions/server/` (one `*-routes.ts` module per area). `index.tsx` is the entry point; it imports and mounts every route module.

Auth: `Authorization: Bearer <jwt>`. Use user JWT for authenticated routes; Supabase anon key for public routes (`verify_jwt: true` is set globally on the function — all requests must carry a valid JWT).

---

## Auth middleware

```
requireAuth   →  validates user JWT; sets c.get('user')
requireAdmin  →  same + checks user KV profile for is_admin: true
```

---

## Error format

```json
{ "error": "Human-readable message" }
```

HTTP codes: `400` bad request · `401` unauthorized · `403` forbidden · `404` not found · `409` conflict · `499` client disconnected · `500` server error

---

## Route reference

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Server health. Returns `{ status, timestamp, version }` |

---

### Auth & signup

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | None | Create user account (triggers native Supabase confirmation email) |

Sign-in and sign-out are handled **client-side** via `supabase.auth.signInWithPassword()` / `signOut()`.

---

### User profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/profile` | requireAuth | Get current user profile |
| PUT | `/users/profile` | requireAuth | Update profile (name, phone, bio, preferences, notification_settings, privacy_settings) |
| PUT | `/users/password` | requireAuth | Change password |
| POST | `/users/email/request-change` | requireAuth | Request email change |
| POST | `/users/email/verify-change` | None | Verify email change token |
| POST | `/users/avatar/upload` | requireAuth | Upload avatar (multipart/form-data) |
| POST | `/users/export-data` | requireAuth | GDPR data export |
| DELETE | `/users/me` | requireAuth | Delete account + all data |
| GET | `/users/payments` | requireAuth | Payment history |
| POST | `/users/payments` | requireAuth | Record payment |

---

### Assessments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/assessments` | None | List all assessments (merges KV + defaults) |
| GET | `/api/assessments/:id` | None | Get by ID or slug (`assessment_def:` → `assessment_slug:` fallback) |
| POST | `/api/assessments` | requireAuth | Create |
| PUT | `/api/assessments/:id` | requireAuth | Update |
| DELETE | `/api/assessments/:id` | requireAuth | Delete |
| POST | `/assessments/:id/responses` | requireAuth | Submit responses |
| GET | `/assessments/responses/user` | requireAuth | All user responses |

---

### Equip programs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/equip/programs` | None | List programs |
| GET | `/equip/programs/:id` | None | Get program by ID or slug |
| POST | `/equip/purchase/:equipId` | requireAuth | Purchase & enroll |
| POST | `/equip/programs` | requireAuth | Create program (admin) |

The per-day / per-block REST routes (`/equip/programs/:id/days`, `/equip/days/:dayId/blocks`, `/equip/blocks/:blockId`) were removed on 2026-08-06; `day:`/`block:` KV rows are dead and nothing reads them.

---

### CMS pages

**Removed** (PR #14). The `/cms/pages` routes no longer exist; site page copy lives in `src/site/lib/cms-defaults.ts`.

---

### Mood journal

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/journal/entries` | requireAuth | Create entry |
| GET | `/journal/entries` | requireAuth | List entries (supports `startDate`, `endDate`, `limit`) |
| GET | `/journal/entries/:date` | requireAuth | Get entry for date |

---

### Check-in scales

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/scales/moods` | None | Mood scale emoji set |
| GET | `/scales/energy` | None | Energy scale |
| GET | `/scales/stress` | None | Stress scale |
| GET | `/scales/sleep` | None | Sleep scale |
| GET | `/scales/pain` | None | Pain scale |

---

### Health Connect / Google Fit

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health-connect/status` | requireAuth | Connection status |
| GET | `/health-connect/data` | requireAuth | Latest health data |
| POST | `/health-connect/connect` | requireAuth | Register connection |
| POST | `/health-connect/data` | requireAuth | Push health data |
| POST | `/health-connect/disconnect` | requireAuth | Unlink |
| POST | `/health-connect/manual-entry` | requireAuth | Manual data entry |

---

### Progress

Progress tracking, day completion, streak management — `progress-routes.ts`.

---

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/settings` | requireAdmin | Site settings |
| PUT | `/admin/settings` | requireAdmin | Update settings |
| GET | `/admin/users` | requireAdmin | List users |
| GET | `/admin/payment/config` | requireAdmin | Payment gateway config |
| POST | `/admin/payment/config` | requireAdmin | Save gateway config |
| GET | `/admin/payment/transactions` | requireAdmin | Transactions |
| POST | `/admin/equip/cleanup-zombies` | requireAdmin | Remove orphaned equip KV entries |

---

### Other modules

| Module | Routes for |
|--------|-----------|
| `newsletter-routes.ts` | Newsletter subscriptions |
| `contact-routes.ts` | Contact form submissions |
| `brevo-routes.ts` | Transactional email (Brevo) |
| `corporate-routes.ts` | Corporate wellness programs |
| `checkin-template-routes.ts` | Check-in template CRUD |
| `kv-audit-routes.ts` | KV store browsing / debugging |
| `recommendation-routes.ts` | Personalised recommendations |
| `reminder-routes.ts` | Push reminder management |
| `resource-routes.ts` | Library resources |
| `ikan-score-routes.ts` | iKan wellness score |

---

## Making API calls (frontend)

```typescript
// Authenticated — via ApiClient (preferred)
import { apiClient } from '../../shared/api';  // src/shared/api.ts — adjust the relative path
const data = await apiClient.get('/users/profile');
await apiClient.post('/health-connect/data', payload);

// Public — anon key is the bearer token
const ANON = 'eyJhbGc...';  // publicAnonKey from src/shared/config/supabase-info.tsx
const res = await fetch(`${BASE_URL}/api/assessments`, {
  headers: { Authorization: `Bearer ${ANON}` },
});
```
