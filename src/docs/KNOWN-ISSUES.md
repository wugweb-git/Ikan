# iKan PWA - Known Issues & Tech Debt

> **Last updated**: March 12, 2026
> **Audience**: All developers
> **Purpose**: Track known issues, technical debt, and planned cleanup work

---

## Active Issues

### 1. Assessment Route Duplication (Medium Priority)

**Status**: Mostly fixed, dead code cleanup pending

Assessment routes are registered in TWO places:

- **`assessment-routes.ts`** (active) - Reads from `assessment_def:` KV prefix, merges with `DEFAULT_ASSESSMENTS` from `default-assessments.ts`
- **`index.tsx` lines ~1227-1280** (dead code) - Reads from the `assessment:` KV prefix

Hono uses first-registered-match routing, so `assessment-routes.ts` wins. The inline routes in `index.tsx` are effectively dead code.

**Fix applied**: Delete now uses tombstones (`deleted: true`) for default assessments so they don't reappear from the hardcoded array. Non-default assessments are still hard-deleted.

**TODO**: Remove the dead inline assessment routes from `index.tsx`.

---

### 2. Inconsistent Auth Headers in Non-Admin Components (Low Priority)

**Status**: Identified, not yet fixed

Six non-admin components still use `publicAnonKey` in their fetch headers instead of the user's actual JWT:

| Component | File |
|-----------|------|
| AssessmentDetail | `/components/screens/AssessmentDetail.tsx` |
| AssessmentFlow | `/components/screens/AssessmentFlow.tsx` |
| EquipDetail | `/components/screens/EquipDetail.tsx` |
| EquipProgramOnboarding | `/components/screens/EquipProgramOnboarding.tsx` |
| ProfessionalApplication | `/components/screens/ProfessionalApplication.tsx` |
| image-upload | `/components/ui/image-upload.tsx` |

**Fix pattern**: Replace direct `fetch` calls with `apiClient` methods, or add the `getAuthHeaders()` helper.

---

### 3. Equip Program Dual-Prefix System (Medium Priority)

**Status**: Partial fix applied

Two different KV prefix systems exist for Equip programs:
- **`equip:`** — Used by `EquipService` (program-service.ts) and admin CRUD via equip-routes.ts
- **`equip_program:`** — Used by the public listing route in index.tsx

**Fix applied**: Delete now cleans up both prefixes. A "Sync Prefixes" tool was added to the KV Audit admin panel to bulk-sync `equip:` → `equip_program:` records.

**TODO**: Unify to a single prefix or ensure all create/update routes dual-write.

---

## Resolved Issues (March 12, 2026 Session)

### Super Admin Protection (Fixed)
- `admin@wugweb.com` is now the system super admin (top of chain)
- Auto-repaired in `requireAdmin` middleware if KV flag is missing
- Cannot be demoted via admin user management routes
- `is_super_admin: true` flag set on their KV profile

### Assessment Deletion (DEFAULT_ASSESSMENTS Reappearing) (Fixed)
- **Root cause**: Hard-deleting from KV caused hardcoded `DEFAULT_ASSESSMENTS` to reappear on next list
- **Fix**: Default assessments are now tombstoned (`deleted: true`) instead of hard-deleted, which the list filter respects

### Resource Deletion (Dual-Prefix Cleanup) (Fixed)
- **Root cause**: `admin-routes.ts` DELETE only cleaned `resource:` prefix, missing `library:resource:`
- **Fix**: DELETE now cleans both `resource:${id}` and `library:resource:${id}`

### Equip Program Deletion (Dual-Prefix Cleanup) (Fixed)
- **Root cause**: `equip-routes.ts` DELETE only cleaned `equip:` prefix via EquipService, missing `equip_program:`
- **Fix**: DELETE now also cleans `equip_program:${id}` and `equip_program_by_slug:${slug}`

### Corporate Routes Admin Check (Fixed)
- **Root cause**: `corporate-routes.ts` used wrong KV prefix `profile:${user.id}` instead of `user:${user.id}`
- **Fix**: Updated both occurrences to use `user:${user.id}`

### Analytics Mock Data (Fixed)
- **Root cause**: Admin analytics endpoint returned `Math.random()` values for views and activity
- **Fix**: Now returns real data from KV (journal entries for activity chart, 0 for views since no tracking exists)

### AdminPaymentGateway TypeScript Violations (Fixed)
- Removed unused imports: `resolveStatusVariant`, `AdminLoading`

### Previous Session Fixes
- CORS `allowMethods` missing `"PATCH"` — now included
- Five admin components using `publicAnonKey` instead of JWT — all fixed with `getAuthHeaders()`
- Assessment deletion KV prefix mismatch — dual-delete from both prefixes
- `AdminWidget` RBAC — only renders for `is_admin: true` users

---

## New Components Added

### `AdminErrorState` (`/components/admin/AdminErrorState.tsx`)
Standardized error state for admin panels. Use instead of falling back to mock/demo data.
- Shows muted grey container with error icon, message, and optional retry button
- Also exports `AdminSkeleton` for loading states

---

## Hardcoded Data Inventory

| Location | What | Status |
|----------|------|--------|
| `default-assessments.ts` | PHQ-9, GAD-7 assessment definitions | Intentional — provides baseline assessments. Tombstone mechanism prevents deleted defaults from reappearing |
| `admin-routes.ts` media upload | `placehold.co` mock URL for uploaded media | Known limitation — Supabase Storage not wired into admin-routes. Use index.tsx avatar upload route as reference |
| `admin-routes.ts` analytics | Activity chart, resource views | **Fixed** — now uses real journal entry data |
| `index.tsx` CMS defaults | Default page content for about, privacy, terms, etc. | Intentional — fallback content when CMS pages haven't been created yet |
| Various admin components | Hardcoded onboarding questions | Intentional — default templates |

---

## Technical Debt

### Architecture

| Item | Priority | Description |
|------|----------|------------|
| Dead assessment routes in `index.tsx` | Medium | ~150 lines of unreachable code (lines 1227-1412) |
| Dead resource routes in `index.tsx` | Medium | Duplicated by admin-routes.ts (lines 1677-1840) |
| Dead equip listing routes in `index.tsx` | Medium | `GET /equip-programs` reads wrong prefix |
| Manual routing in `App.tsx` | Low | Large switch/conditional block |
| `App.tsx` size | Low | Entry point is large |

### Code Quality

| Item | Priority | Description |
|------|----------|------------|
| Inconsistent error handling | Medium | Some components use try/catch, some don't |
| Mixed fetch patterns | Medium | Some use `apiClient`, others use raw `fetch` |
| Console.log usage | Low | Some files use `console.log` instead of `logger` |

### Testing

| Item | Priority | Description |
|------|----------|------------|
| No unit tests | High | No test files exist |
| No integration tests | High | API endpoints have no automated tests |

---

## Security Considerations

| Item | Status | Description |
|------|--------|------------|
| Super admin protection | OK | `admin@wugweb.com` cannot be demoted |
| Service role key isolation | OK | Only used server-side |
| JWT validation | OK | All protected routes validate JWT |
| CORS | Acceptable | Wide-open `origin: "*"` with JWT auth |
| Input sanitization | Partial | Server has `sanitizeProfileUpdate` but not all endpoints sanitize |
| Rate limiting | Missing | No rate limiting on API endpoints |
| Content Security Policy | Partial | Headers set in Vercel but no strict CSP |
