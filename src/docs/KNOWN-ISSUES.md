# iKan PWA - Known Issues & Tech Debt

> **Last updated**: March 12, 2026
> **Audience**: All developers
> **Purpose**: Track known issues, technical debt, and planned cleanup work

---

## Active Issues

### 1. Assessment Route Duplication (Medium Priority)

**Status**: Workaround in place, cleanup pending

Assessment routes are registered in TWO places:

- **`assessment-routes.ts`** (active) - Reads from `assessment_def:` KV prefix, merges with `DEFAULT_ASSESSMENTS` from `default-assessments.ts`
- **`index.tsx` lines ~1227-1280** (dead code) - Reads from the `assessment:` KV prefix

Hono uses first-registered-match routing, so `assessment-routes.ts` wins. The inline routes in `index.tsx` are effectively dead code.

**Workaround**: Create/update operations dual-write to both `assessment_def:` and `assessment:` prefixes. Delete operations hard-delete from both prefixes in `admin-routes.ts`.

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

These currently work because they hit `requireAuth` routes (not `requireAdmin`), and the anon key + session cookie may satisfy auth in some cases. However, this is fragile and should be migrated to use the proper JWT pattern.

**Fix pattern**: Replace direct `fetch` calls with `apiClient` methods, or add the `getAuthHeaders()` helper.

---

### 3. Potential TypeScript Strict Mode Violations (High Priority)

**Status**: Build not verified after recent changes

Recent changes to five admin components (`AdminCommunicationAPI.tsx`, `AdminCheckinScalesManager.tsx`, `AdminPaymentGateway.tsx`, `AdminSystemLogs.tsx`, `AdminConsultationManager.tsx`) may have introduced or exposed unused imports under `noUnusedLocals: true`.

Known suspects:
- `AdminLoading` import in `AdminPaymentGateway.tsx`
- `resolveStatusVariant` import in `AdminPaymentGateway.tsx`

**Action**: Run `npm run type-check` and fix all errors before deploying.

---

## Resolved Issues (Recent)

### CORS Missing PATCH Method (Fixed March 2026)

The `allowMethods` in `index.tsx` was missing `"PATCH"`, causing PATCH preflight requests to fail. Now includes all methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.

### Admin Components Using Anon Key (Fixed March 2026)

Five admin components were using `Bearer ${publicAnonKey}` instead of the user's JWT, causing all `requireAdmin` requests to 401. All five now use an async `getAuthHeaders()` helper that fetches the real token from `supabase.auth.getSession()`.

### Assessment Deletion KV Prefix Mismatch (Fixed)

Assessment deletion was only removing from one KV prefix. Now dual-deletes from both `assessment_def:` and `assessment:` prefixes.

### Admin Widget RBAC (Fixed)

`AdminWidget` floating button now only renders for users with `is_admin: true` in their KV profile.

---

## Technical Debt

### Architecture

| Item | Priority | Description |
|------|----------|------------|
| Dead assessment routes in `index.tsx` | Medium | ~50 lines of unreachable code |
| Manual routing in `App.tsx` | Low | Large switch/conditional block; consider react-router if complexity grows |
| `App.tsx` size | Low | Entry point is large; consider extracting route rendering into a separate component |

### Code Quality

| Item | Priority | Description |
|------|----------|------------|
| Inconsistent error handling | Medium | Some components use try/catch, some don't; some log errors, some don't |
| Mixed fetch patterns | Medium | Some components use `apiClient`, others use raw `fetch` |
| Console.log usage | Low | Some files still use `console.log` instead of `logger` |
| Commented-out code | Low | Various files have commented-out sections (e.g., `setRouteHistory` in `App.tsx`) |

### Testing

| Item | Priority | Description |
|------|----------|------------|
| No unit tests | High | No test files exist; testing infrastructure needs setup |
| No integration tests | High | API endpoints have no automated tests |
| Dev test screens | Low | `RouteTestScreen`, `WizardTestScreen`, `UIKitShowcase` are dev-only; consider dev-only build flag |

### Performance

| Item | Priority | Description |
|------|----------|------------|
| Lazy loading granularity | Low | Most screens are lazy-loaded, but some imports could be further split |
| Image optimization | Low | Not all images use WebP with fallbacks |

---

## Security Considerations

| Item | Status | Description |
|------|--------|------------|
| Service role key isolation | OK | Only used server-side in edge functions |
| JWT validation | OK | All protected routes validate JWT via middleware |
| CORS | Acceptable | Wide-open `origin: "*"` is standard for JWT-authenticated SPAs |
| Input sanitization | Partial | Server has `sanitizeProfileUpdate` but not all endpoints sanitize |
| Rate limiting | Missing | No rate limiting on API endpoints |
| Content Security Policy | Partial | Headers set in Vercel but no strict CSP |
