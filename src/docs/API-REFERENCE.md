# iKan PWA - API Reference

> **Last updated**: March 12, 2026
> **Base URL**: `https://<projectId>.supabase.co/functions/v1/make-server-cc205da9`
> **Auth**: `Authorization: Bearer <jwt>` (user JWT or anon key for public endpoints)

---

## Health & Status

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | None | Server health check |

**Response**: `{ "status": "ok", "timestamp": "...", "version": "2.1" }`

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | None | Register new user |

### POST `/auth/signup`

**Body**: `{ "email", "password", "name", "phone?", "corporate_user?" }`

**Response**: `{ "user": { ... } }`

> Sign-in and sign-out are handled client-side via `supabase.auth.signInWithPassword()` and `supabase.auth.signOut()`.

---

## User Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/profile` | `requireAuth` | Get current user profile |
| `PUT` | `/users/profile` | `requireAuth` | Update profile (validated + sanitized) |
| `PUT` | `/users/password` | `requireAuth` | Change password |
| `POST` | `/users/email/request-change` | `requireAuth` | Request email change (sends verification) |
| `POST` | `/users/email/verify-change` | None | Verify email change token |
| `POST` | `/users/avatar` | `requireAuth` | Set avatar URL (JSON body) |
| `POST` | `/users/avatar/upload` | `requireAuth` | Upload avatar file (multipart/form-data) |
| `POST` | `/users/export-data` | `requireAuth` | Export all user data (GDPR) |
| `DELETE` | `/users/me` | `requireAuth` | Delete user account and all data |
| `GET` | `/users/payments` | `requireAuth` | Get user payment history |
| `POST` | `/users/payments` | `requireAuth` | Record a payment |

### PUT `/users/profile`

**Body** (all optional):
```json
{
  "name": "string",
  "phone": "string",
  "bio": "string",
  "dateOfBirth": "string",
  "gender": "string",
  "location": "string",
  "avatar_url": "string",
  "emergencyContactName": "string",
  "emergencyContactPhone": "string",
  "emergencyContactRelationship": "string",
  "preferences": { ... },
  "notification_settings": { ... },
  "privacy_settings": { ... },
  "security_settings": { ... }
}
```

---

## Social Account Connection

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/user/connect-social/:provider` | `requireAuth` | Connect Google/LinkedIn |
| `POST` | `/user/disconnect-social/:provider` | `requireAuth` | Disconnect Google/LinkedIn |

**Providers**: `google`, `linkedin`

---

## Assessments

### Public Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/assessments` | None | List all published assessments |
| `GET` | `/assessments/:assessmentId` | None | Get single assessment by ID or slug |

> **Note**: These inline routes in `index.tsx` read from `assessment:` KV prefix. The `assessment-routes.ts` module also registers similar routes reading from `assessment_def:` prefix + defaults. Hono first-match wins - see KNOWN-ISSUES.md.

### Authenticated Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/assessments` | `requireAuth` + admin check | Create assessment (dual-writes both prefixes) |
| `PUT` | `/assessments/:assessmentId` | `requireAuth` + admin check | Update assessment |
| `DELETE` | `/assessments/:assessmentId` | `requireAuth` + admin check | Delete assessment |
| `POST` | `/assessments/:assessmentId/responses` | `requireAuth` | Submit assessment responses |
| `GET` | `/assessments/responses/user` | `requireAuth` | Get all user's assessment responses |

### POST `/assessments/:assessmentId/responses`

**Body**:
```json
{
  "responses": { ... },
  "status": "completed",
  "score": 15,
  "interpretation": "...",
  "severity": "moderate"
}
```

---

## Assessment Routes (Module: `assessment-routes.ts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/assessments` | None | List assessments (merges KV + defaults) |
| `GET` | `/api/assessments/:id` | None | Get single assessment |
| `POST` | `/api/assessments` | `requireAuth` | Create assessment |
| `PUT` | `/api/assessments/:id` | `requireAuth` | Update assessment |
| `DELETE` | `/api/assessments/:id` | `requireAuth` | Delete assessment (dual-prefix) |

---

## Equip Programs

### Public Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/equip-programs` | None | List all published programs |
| `GET` | `/equip/:programId` | None | Get single program by ID or slug |

### Authenticated Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/equip/purchase/:equipId` | `requireAuth` | Purchase & enroll in program |

### Equip Routes (Module: `equip-routes.ts`)

Additional endpoints registered by the equip routes module for program content, blocks, days, and enrollment management.

---

## Mood Journal

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/journal/entries` | `requireAuth` | Create journal entry |
| `GET` | `/journal/entries` | `requireAuth` | List journal entries (supports `startDate`, `endDate`, `limit`) |
| `GET` | `/journal/entries/:date` | `requireAuth` | Get entry for specific date |

### Mood Routes (Module: `mood-routes.ts`)

Additional mood tracking endpoints registered by the mood routes module.

---

## Library Resources

### Public Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/library/resources` | None | List published resources (supports `category`, `limit`, `offset`) |
| `GET` | `/library/resources/:resourceId` | None | Get single resource by ID or slug |

### Admin Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/resources` | `requireAdmin` | List all resources (including unpublished) |
| `POST` | `/admin/resources` | `requireAdmin` | Create resource |
| `PUT` | `/admin/resources/:resourceId` | `requireAuth` + admin check | Update resource |
| `DELETE` | `/admin/resources/:resourceId` | `requireAuth` + admin check | Delete resource |

---

## Consultants

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/consultants` | None | List consultants (supports `category`, `expertise`, `sessionMode`) |
| `GET` | `/consultants/:id` | None | Get consultant by ID |

---

## Recommendations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/recommendations` | `requireAuth` | Get personalized recommendations |

---

## CMS Pages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/cms/pages/:slug` | None | Get published CMS page by slug |

**Known slugs**: `about`, `privacy`, `terms`, `faq`, `contact`, `return-policy`, `cancellation-policy`, `sitemap`, `homepage-hero`, `homepage-assessment`, `homepage-mission`, `homepage-benefits`, `homepage-faq`, `homepage-newsletter`, `homepage-equip-intro`

---

## Admin Routes (Module: `admin-routes.ts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/settings` | `requireAdmin` | Get site settings |
| `PUT` | `/admin/settings` | `requireAdmin` | Update site settings |
| `GET` | `/admin/debug/check-status` | `requireAuth` | Check user admin status |
| `POST` | `/admin/debug/make-admin` | `requireAuth` | Self-promote to admin (debug) |
| `GET` | `/admin/users` | `requireAuth` + admin check | List all users |
| `GET` | `/admin/payment/config` | `requireAdmin` | Get payment gateway configs |
| `POST` | `/admin/payment/config` | `requireAdmin` | Save payment gateway config |
| `GET` | `/admin/payment/transactions` | `requireAdmin` | List transactions |
| `POST` | `/admin/payment/test` | `requireAdmin` | Test payment gateway |

---

## Other Route Modules

### Progress (`progress-routes.ts`)
Program progress tracking, day completion, streak management.

### Newsletter (`newsletter-routes.ts`)
Newsletter subscription management (`requireAdmin` for admin operations).

### Contact (`contact-routes.ts`)
Contact form submission handling (`requireAdmin` for admin operations).

### Scales (`scales-routes.ts`)
Check-in scale templates (energy, stress, sleep, pain).

### Health Connect (`health-connect-routes.ts`)
Google Fit / Health Connect data synchronization.

### Brevo (`brevo-routes.ts`)
Transactional email sending via Brevo API.

### Corporate (`corporate-routes.ts`)
Corporate wellness program management.

### Hero Banner (`hero-banner-routes.ts`)
Hero banner CMS management.

### Check-in Templates (`checkin-template-routes.ts`)
Check-in template CRUD operations.

### KV Audit (`kv-audit-routes.ts`)
KV store browsing and debugging tools.

---

## Error Response Format

All error responses follow this pattern:

```json
{
  "error": "Human-readable error message with context"
}
```

HTTP status codes:
- `400` - Bad request / validation error
- `401` - Unauthorized (missing or invalid JWT)
- `403` - Forbidden (not admin)
- `404` - Resource not found
- `409` - Conflict (e.g., email already exists)
- `410` - Gone (e.g., expired token)
- `499` - Client disconnected (non-fatal)
- `500` - Internal server error

---

## Request Patterns

### Authenticated Request (Frontend)

```typescript
// Using ApiClient (recommended)
import { apiClient } from '../lib/api-client';
const data = await apiClient.get('/users/profile');

// Using raw fetch (admin components)
const { data } = await supabase.auth.getSession();
const token = data.session?.access_token;
const response = await fetch(`${API_BASE}/admin/settings`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### Public Request

```typescript
const response = await fetch(`${API_BASE}/assessments`, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`,
  },
});
```
