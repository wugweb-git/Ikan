# iKan PWA - Known Issues & Tech Debt

> **Last updated**: March 17, 2026
> **Audience**: All developers
> **Purpose**: Track known issues, technical debt, and planned cleanup work

---

## Recently Fixed (Session 13)

### Metadata Consolidation — "Meta Manager" Rename & Mood Types Unified
**Status**: DONE
- Renamed "Categories" → "Meta Manager" in the admin sidebar (route ID stays `categories` for backward compat)
- Removed standalone "Mood Types" sidebar entry; AdminMoodManager is now embedded inline when the "Mood Types" tab is selected in the Meta Manager (uses `embedded` prop to hide its own AdminHeader)
- Added two new metadata types: `mood_type` (8 seed items) and `ema_category` (11 seed items for Check-in Categories like Mood, Energy, Stress, Sleep, etc.)
- Updated `useMetadata` hook with `moodTypes` and `emaCategories` buckets
- Server sync endpoint (`POST /categories/sync`) now supports `updateExisting: true` flag — when set, updates icon/color/description on existing items instead of skipping them entirely. This fixes the "all items showing Tag icon" issue for items created before icon fields were added.
- Total metadata types: 16 (was 14)
- Icon rendering uses type-specific fallbacks: `getIconComponent(item.icon, activeTab)` falls back to the type's default icon before defaulting to Tag

### Hardcoded-to-Metadata Migrations — Complete
**Status**: DONE
All three remaining hardcoded dropdown arrays now consume `useMetadata()` from KV, with inline fallbacks while metadata is loading:
- **AdminCheckinTemplateBuilder**: `EMA_CATEGORIES` → `useMetadata().emaCategories` (passed as `emaCategoryLabels` prop to `StepEditorCard`). `BLOCK_TYPES` kept local (maps step types to React icon components — UI concern, not data).
- **EquipProgramWizard**: `defaultCategoryOptions` and `difficultyOptions` → `useMetadata().categories` and `useMetadata().difficultyLevels`. Removed the old `loadCategories` manual API call and `categoryOptions` state; both now derived from the cached metadata hook.
- **AdminAssessmentManager**: `filterTypes` (Assessment/Quiz/Survey/Checklist) → `useMetadata().assessmentTypes`. Also now uses `useMetadata().categories` for the category filter before falling back to the manual API call.

---

## Still Remaining

### `/join/professional` Direct URL in Figma Preview
**Status**: KNOWN LIMITATION
The Figma Make preview iframe serves a 404 for direct sub-path navigation (e.g. `/join/professional`). This is a hosting environment limitation — the SPA fallback only works on the production Vercel deployment. Use the "Preview Form" button inside Admin → Consultants to view the form within the app.

---

## Recently Fixed (Session 12)

### Admin UI Animation Removal — Complete
**Status**: FIXED
Stripped all `motion/react` (Framer Motion) and CSS animation references from admin UI components to improve loading performance:
- **AdminCheckinTemplateBuilder.tsx**: Replaced 13 `motion.*` / `AnimatePresence` JSX references with plain `<div>`, `<span>`, and CSS transitions. The motion import had already been removed in Session 11 but the JSX references remained, causing a compile failure. Now compiles cleanly.
- **AdminWidget.tsx**: Removed `hover:scale-105` transition from the admin FAB button.
- **AdminErrorState.tsx**: Removed `animate-pulse` from the `AdminSkeleton` loader.
- Previously completed in Session 11: `AnimatePresence` removed from App.tsx route wrapper, CSS transitions removed from `AdminDashboard.tsx` and `AdminPageLayout.tsx`, `motion/react` fully removed from `AdminCheckinScalesManager.tsx` and `AdminHeroBannerManager.tsx`.
- **Note**: User-facing components intentionally retain motion animations (UX requirement).

### Media Manager Route Mismatch — Fixed
**Status**: FIXED
The `AdminMediaManager` was completely non-functional because the `api-client.ts` routes didn't match the server endpoints:
- `GET /admin/media/files` → fixed to `GET /media`
- `DELETE /admin/media/files/:id` → fixed to `DELETE /media/:id`
- `POST /admin/media/upload` → fixed to `POST /upload`

---

## Recently Fixed (Session 11)

### Admin UI Scroll Performance
**Status**: FIXED
The admin dashboard was hanging on scroll due to: (1) `backdrop-blur-md` + `opacity: 0.95` on the sticky header forced expensive re-compositing every scroll frame — replaced with a solid background; (2) the resize handler fired synchronously on every pixel — now throttled with `requestAnimationFrame`; (3) the sidebar had a permanent CSS transition even on desktop — now only applies during mobile slide-over; (4) the `SuspenseScreen` wrapper was re-created inside `renderContent()` every render, causing Suspense boundary remounts — moved to a stable module-level component.

### Notification Bell Button
**Status**: FIXED
The bell button `onClick` handler was present but: (1) the badge `<span>` overlay could intercept pointer events — added `pointer-events-none`; (2) clicking didn't scroll to top, so the Communication view appeared unchanged — added `window.scrollTo(0, 0)`; (3) added `title="Notifications"` for accessibility.

### Page Manager Validation Error
**Status**: FIXED
The "Validation Error" / "Please fix the errors" toast was too vague — users couldn't tell which fields were missing. Now the toast explicitly lists the invalid fields (e.g. "Please fix: Page Name, URL Slug, Content (min 10 chars)").

---

## Recently Fixed (Session 10)

### Direct URL Navigation — Cold Load 404 Fix
**Status**: FIXED
`currentRoute` was initialized as `DEFAULT_PUBLIC_ROUTE` (`/`) on every cold load, ignoring `window.location.pathname`. This meant any direct URL navigation (e.g. `https://ikan.health/join/professional`) would render the Homepage instead of the target page, producing a 404 on Vercel because the SPA never matched the correct route. Fixed by initializing `currentRoute` from `window.location.pathname` via a lazy initializer in `useState`. This also fixes direct navigation to all other routes (`/about`, `/assessment`, `/consultation`, `/admin`, etc.).

### Session 8 Items Still Pending Deployment
**Status**: PENDING DEPLOYMENT
iKAN Score 5-bug-fix and MoodJournal chunk-loading defenses remain code-verified but untested against a live server. Awaiting deployment.

---

## Recently Fixed (Session 9)

### Professional Application Link — Production URL Hardcoding
**Status**: FIXED
`AdminConsultationManager.tsx` used `window.location.origin` for the consultant onboarding link, which resolved to the Figma preview domain in sandboxed environments. Changed to the hardcoded production URL `https://ikan.health/join/professional`.

### Shared Clipboard Utility — Sandboxed iframe Support
**Status**: FIXED
Created `/lib/clipboard.ts` with `copyToClipboard()` that tries the legacy `textarea + execCommand('copy')` fallback first (works in sandboxed iframes where the Clipboard API is blocked by permissions policy), then falls back to `navigator.clipboard.writeText`. All 4 clipboard call sites (`AdminConsultationManager`, `AdminMediaManager`, `ConsultantDetail`, `ResourceDetail`) updated to use this utility.

---

## Recently Fixed (Session 8)

### iKAN Score System — End-to-End Code Verification
**Status**: VERIFIED (code review, all wiring confirmed)
Full code audit of the iKAN Score pipeline from server to UI:
- `ikan-score-routes.ts`: Registered in `index.tsx` via `registerIkanScoreRoutes(app, requireAuth)`. All 5 Session 7 bug fixes (enrollment prefix normalization, `KNOWN_MAX_SCORES` lookup, WHO-5 non-inversion, assessment name resolution, journal prefix trailing colon) verified in place.
- `api-client.ts`: `getIkanScore()` → `GET /user/ikan-score` and `getIkanScoreHistory()` → `GET /user/ikan-score/history` both use authenticated requests.
- `useIkanScore.ts`: Hook fetches via `apiClient.getIkanScore()`, exposes `data`, `loading`, `error`, `refetch`. Network errors now suppressed (warn not error).
- `IkanScoreCard.tsx`: Renders 4 states — skeleton (loading), error card, no-data card with ghost ring, and live score card with animated ring, trend chip, data source pills, and CTA. All states verified.
- `kv_dual_write.ts`: Used by all server routes including iKAN score. Import chain verified.
- **Note**: Live server testing still pending deployment. Code review confirms correctness.

### MoodJournal Chunk-Loading Defenses — Code Verification
**Status**: VERIFIED (code review, all 3 layers confirmed)
Full audit of the chunk-loading defense stack:
1. **`lazyRetry()`** (`/lib/lazy-with-retry.ts`): All 19 lazy-loaded screens in `App.tsx` wrapped with `lazyRetry()`. Detects `ChunkLoadError`, `Loading chunk`, `Failed to fetch dynamically imported module`, and `Importing a module script failed`. Retries 3 times with exponential backoff (1s → 2s → 4s).
2. **`ChunkErrorBoundary`** (`/components/ChunkErrorBoundary.tsx`): Wraps MoodJournal in `App.tsx` with `ErrorBoundary > ChunkErrorBoundary > Suspense`. Shows friendly WifiOff card with "Tap to retry" button. Non-chunk errors re-thrown to parent `ErrorBoundary` via `throw error` in `getDerivedStateFromError`.
3. **Chunk preloading**: `preloadMoodJournal()` fires on `onTouchStart` and `onMouseEnter` of the Journal tab in `BottomNavBarMobile`. Uses one-shot guard (`_moodJournalPreloaded`) to avoid redundant fetches.

### ProfileOverview Component — Cleanup Complete
**Status**: FIXED
Removed the now-empty `ProfileOverview` component (which had its content removed in a prior edit). Deleted `/components/blocks/ProfileOverview.tsx` and removed its import + usage from `/components/screens/Account.tsx`. The Account profile page now renders `AccountDetailsSection` directly without an empty wrapper card.

### Network Error Suppression — Global Cleanup
**Status**: FIXED
`TypeError: Failed to fetch` network errors were logging as `console.error` in 3 places, creating noisy red console output when the server is temporarily unreachable:
1. `api-client.ts` line 145: Now detects `TypeError` + "failed to fetch" and logs as `console.warn` instead of `console.error`.
2. `GoogleFitContext.tsx` line 139: Added network error detection to the existing 401/404/AbortError suppression filter.
3. `useIkanScore.ts` line 34: Added same network error suppression pattern.

---

## Recently Fixed (Session 7)

### iKAN Score Calculation System — End-to-End Verification
**Status**: FIXED (5 bugs found and resolved)
Full code audit of `ikan-score-routes.ts`, `useIkanScore.ts`, and `IkanScoreCard.tsx`. Bugs found and fixed:
1. **Enrollment prefix mismatch**: Score route queried `enrollment:${userId}:` but index.tsx stores enrollments at `user_enrollment:${userId}:` with different field names (`currentDay` vs `current_day_number`, `programId` vs `equip_id`). Fixed: now queries BOTH prefixes, deduplicates by program ID, and normalizes field names.
2. **Journal prefix missing trailing colon**: `journal_by_user:${userId}` could theoretically match other users whose UUID starts with the same prefix. Fixed: `journal_by_user:${userId}:`.
3. **`max_score` fallback to 100**: When `max_score` is null/missing on assessment results, the fallback of 100 is wrong for clinical instruments (PHQ-9 max=27, GAD-7 max=21). Fixed: added `KNOWN_MAX_SCORES` lookup table for 12+ standard assessments, plus inference from scoring ranges.
4. **WHO-5 inversion bug**: All assessments were treated as "higher = more distress" but WHO-5 is "higher = better wellness". Fixed: added `HIGHER_IS_BETTER` set to correctly handle positive-direction assessments.
5. **Assessment name resolution**: Stored results have no `assessment_name` field, falling back to raw IDs like "phq9". Fixed: added `resolveAssessmentName()` that looks up `assessment_def:` titles from KV with prettified ID fallback.
Also improved: trend indicator now shows "±0 this month" with stable message when data exists but no change, instead of hiding the indicator entirely. Error responses now include error details for debugging. Added `ikan_score:` prefix to KV audit registry.

### MoodJournal Dynamic Import — Defensive Measures
**Status**: FIXED (3 defensive measures implemented)
Implemented all three planned defensive measures:
1. **`lazyRetry()` utility** (`/lib/lazy-with-retry.ts`): Wraps dynamic imports with 3 retries + exponential back-off (1s → 2s → 4s), specifically detecting `ChunkLoadError` and `Failed to fetch dynamically imported module`. Applied to ALL lazy-loaded screens, not just MoodJournal.
2. **`ChunkErrorBoundary` component** (`/components/ChunkErrorBoundary.tsx`): Catches only chunk-load errors and shows a friendly "Couldn't load Mood Journal" card with WifiOff icon, explanatory text, and "Tap to retry" button. Non-chunk errors re-throw to the parent `ErrorBoundary`.
3. **Chunk preloading**: `preloadMoodJournal()` in `/lib/lazy-with-retry.ts` fires on `touchstart`/`mouseenter` of the Journal tab in `BottomNavBarMobile`, warming the browser cache before navigation.

---

## Recently Fixed (Session 6)

### Image Compression / WebP Tool
**Status**: FIXED
Created `/lib/image-compress.ts` — client-side utility that resizes images exceeding 2048px on longest side and converts to WebP (JPEG fallback for older browsers) at 0.82 quality. Integrated into `/components/ui/image-upload.tsx`'s `uploadFile` function. Compression runs automatically before every upload; if compressed size exceeds original, the original is sent unchanged. Console logs compression ratio for debugging.

### Real Notification Badge Counts
**Status**: FIXED
Added `GET /badge-counts` server endpoint (authenticated) that returns badge counts by route:
- `/mood-journal`: 1 if no journal entry logged today
- `/equip`: count of active enrollments with uncompleted current-day progress
- `/consultation`: count of upcoming scheduled bookings
Created `useNotificationBadges` hook that polls every 60s and wired it into `App.tsx` → `BottomNavBarMobile`. Badges are non-critical — failures are silently swallowed.

### Activity Logging System
**Status**: FIXED
`logActivity()` in `api-client.ts` was a console-only no-op. Now fires to `POST /activity-log` (authenticated) which stores records in KV under `activity_log:` prefix. Added `GET /admin/activity-logs` endpoint for the admin System Logs module (returns last 200 entries sorted by date). Both endpoints are non-critical — errors don't break calling code.

### Admin UI Consistency Pass
**Status**: FIXED
Verified all 13 admin modules (8 Content Management + 5 Configuration) use `AdminHeader` with title + description, no back button rendered. All modules have proper loading states (either `AdminLoading` or custom `Skeleton`), empty states (either `AdminEmptyState`, custom `EmptyState`, or `AdminDataTable`'s built-in "No results"), and error states. Cleaned up stale `onBack` prop passed to `AdminHeader` in `AdminKVAudit`. Marked `onBack` as `@deprecated` in `AdminHeader` interface. Breadcrumb navigation (using `onBack` for "Admin" click) remains functional and correct.

### Mobile Experience Audit
**Status**: FIXED
Audited remaining screens: Account settings (proper mobile layout with overflow-y-auto, bottom nav clearance), EquipDetail (MobileHeader, full-width sections, loading/empty states), AssessmentFlow (fixed inset-0 full-screen overlay, proper error states), WellnessTimeline (max-w-3xl with proper padding and pb-28 for nav clearance). Admin dashboard uses overflow-x-hidden at layout level to prevent horizontal scrolling. All screens have proper mobile touch targets and spacing.

### `is_admin` Cache Cleanup on Sign-Out
**Status**: FIXED
Added `localStorage.removeItem` for the `ikan_is_admin_${userId}` key during `signOut()` to prevent stale admin status from persisting when a different user signs in on the same device. Also added `is_admin` cache reads to both `recoverSession` user construction paths (refreshed session and valid existing session).

---

## Recently Fixed (Session 5)

### Dead `createDefaultCMSContent` Function Body Removal
**Status**: FIXED
The function declaration was removed in a prior session but ~900 lines of orphaned HTML template literal content remained in `/supabase/functions/server/index.tsx`. Removed all orphaned page sections (about, privacy, terms, faq, contact, return-policy, cancellation-policy, sitemap, homepage-hero, homepage-assessment, homepage-mission, homepage-testimonial, homepage-benefits, homepage-faq, homepage-newsletter, homepage-equip-intro). Only the cleanup comment and the `// Newsletter signup is handled by newsletter-routes.ts` marker remain.

### `quickUser` Missing `is_admin` — Timing Fix
**Status**: FIXED
The `quickUser` object constructed during auth initialization, auth state changes, sign-in, and OAuth popup flows did not include `is_admin`, so the Admin Console link in SideNav and the AdminWidget floating button wouldn't appear until the full profile fetch completed (~1-2s delay). Fix: `is_admin` is now cached in `localStorage` (keyed by user ID) whenever a full profile loads, and all `quickUser` constructions read from this cache. On first-ever login, the admin link still waits for the profile fetch, but on all subsequent page loads it appears instantly.

---

## Recently Fixed (Session 4)

### EquipProgramCompletion — Dead Navigation Buttons
**Status**: FIXED
`EquipProgramCompletion` accepted `onContinue` and `onBackToDashboard` props but App.tsx only passed `onNavigate`. All "Back to Dashboard" and "Explore More Programs" buttons were non-functional (clicked but did nothing). Added `onNavigate` to the props interface and derived `handleContinue` → `/equip` and `handleBackToDashboard` → `/dashboard` from it as fallbacks.

### Reassessment Triggers — Crash on Missing assessment_id
**Status**: FIXED
`reassessment-triggers.ts` called `a.assessment_id.startsWith('checkin_')` without null-checking `assessment_id`. If any assessment record in KV lacked this field, the entire reassessment check silently failed (caught by try/catch, returning `shouldTrigger: false`). Added `a.assessment_id &&` guard to both filter calls (lines 34 and 81).

### Hardcoded Notification Badges Removed
**Status**: FIXED
`App.tsx` passed `notificationBadges={{ '/mood-journal': 2, '/assessment': 1 }}` to `BottomNavBarMobile` — hardcoded fake counts violating the no-hardcoded-defaults rule. Changed to `notificationBadges={{}}` (empty object). Real badge counts should be wired to actual unread/pending data from KV when implemented.

---

## Recently Fixed (Session 3)

### Equip Prefix Unification
**Status**: FIXED
`EquipService` (program-service.ts) now dual-writes to both `equip:` and `equip_program:` prefixes on create and update, and cleans both on delete. The public `/equip-programs` endpoint merges both prefixes and deduplicates. Existing data under either prefix is now correctly served.

### Admin Top Nav Bar
**Status**: FIXED
- **User info**: Was hardcoded "Admin User / Super Admin". Now shows real user name from `useAuth()` and avatar if available.
- **Search**: Was non-functional. Now searches all 22 admin sections by label and keywords, with a dropdown that navigates directly.
- **Bell icon**: Visual only (notification count from `useNotifications()` context was already wired).

### Payment Gateway — Real Razorpay Integration
**Status**: FIXED
- `/admin/payment/test` was a placeholder returning a fake success message. Now creates a real Razorpay order via `api.razorpay.com/v1/orders` using the saved config + `RAZORPAY_KEY_SECRET` env var.
- Added `/payment/create-order` (authenticated) for user-facing payments — creates real Razorpay orders.
- Added `/payment/verify` (authenticated) — verifies Razorpay payment signatures using HMAC SHA256 and updates transaction status in KV.
- Test transactions are now stored in KV under `transaction:*` and appear in the admin transactions table.

### Booking Modal — No More Hardcoded Time Slots
**Status**: FIXED
The `BookingModal` previously used hardcoded `defaultTimeSlots` (9:00 AM, 10:00 AM, etc.) and the booking just logged to console. Now:
- Date picker with 7-day view and week navigation
- Time slots generated dynamically (9AM–7PM, 30min intervals)
- Session mode selector with pricing from consultant data
- Bookings saved to KV via `POST /bookings` (new endpoint)
- User bookings retrievable via `GET /bookings`
- Mobile-optimized bottom sheet layout with safe area padding

### Consultation Page — Mobile UX & Data Fixes
**Status**: FIXED
- Main content had `px-[0px]` giving zero horizontal padding on mobile — now uses proper `16px` padding with 80px bottom for nav clearance
- Price filter was excluding consultants without pricing data even at default range — fixed to include them
- BookingModal now receives `consultantId`, `sessionModes`, and `pricing` from the actual consultant data

### Dashboard Assessment History — Orphan Validation
**Status**: FIXED
Assessment scores displayed on the dashboard are now cross-referenced against existing assessment definitions fetched from `/assessments`. Results for deleted/non-existent assessment definitions are filtered out, preventing orphaned scores from displaying.

### Consultant Detail — Mobile Booking Flow
**Status**: FIXED
- Mobile "Book Appointment" button now opens the new `BookingModal` (date/time picker + session mode selector) instead of the old Dialog that required pre-selecting date/time from empty availability data
- Fixed `Math.min(...Object.values(pricing))` crash when all pricing values are 0 or undefined — now safely returns '—'
- Fixed mobile bottom bar padding to use `env(safe-area-inset-bottom)` for notch devices
- Desktop still uses the sidebar `BookingPanel` with availability data from KV

### Wellness Timeline — Program Names
**Status**: FIXED
Enrollments on the timeline previously showed raw `equip_id` as the detail text. Now fetches the actual program title via `getEquipProgram()` and shows "Enrolled in [Program Name]" / "Completed [Program Name]".

### Check-in Template Builder — Seed Function Removed
**Status**: FIXED
Removed `handleSeedDefault()` function and its two UI buttons ("Seed Default" / "Reset to Default"). Per project rules: no seed functions, ever. The empty state now shows a "Create Template" button pointing to `handleNewTemplate`.

### Consultation Sort Dropdown — Mobile Overflow
**Status**: FIXED
Sort dropdown was 120px wide on mobile, competing with search bar and filter button for horizontal space. Now 44px on mobile (icon-only trigger), full width on desktop.

### ConsultantCard — Touch Target Fix
**Status**: FIXED
"Book" button was 32px height (below 44px accessibility minimum). Increased to 36px with minWidth 44px and updated to use `--color-primary-default` instead of `--grey-9`.

### Equip Program Block Editor — Crash Fix (Stability)
**Status**: FIXED
The Equip Program Wizard crashed continuously when editing blocks. Three root causes identified and fixed:
1. **DndProvider double-mounting**: Steps 2 (Onboarding) and 3 (Daily Builder) each wrapped their content in a separate `<DndProvider backend={HTML5Backend}>`. Switching between these steps without full unmount caused "Cannot have two HTML5 backends at the same time" crash. **Fix**: Moved `DndProvider` to wrap the entire `EquipProgramWizard` component, so only one backend instance ever exists.
2. **Stale closure in `onProgramChange`**: Both step 2 and step 3 used `setFormData({ ...formData, ...updates })` which captures `formData` from the render closure. During rapid edits (typing in block fields), each keystroke used stale state, causing data loss and potential corruption. **Fix**: Changed to functional setState `setFormData(prev => ({ ...prev, ...updates }))` which always uses the latest state.
3. **RichTextEditor ref lifecycle**: The `isInitialized` ref wasn't properly reset on unmount, causing stale content when switching between blocks. **Fix**: Added cleanup effect to reset `isInitialized` on unmount, and added `lastValueRef` tracking to prevent unnecessary re-syncs.

### API Client — Seed Function Cleanup
**Status**: FIXED
Removed `seedDefaultCheckinTemplate()` from `api-client.ts` — the corresponding UI buttons were already removed from AdminCheckinTemplateBuilder.

### Consultation — Expertise Categories Now Data-Driven
**Status**: FIXED
The `expertiseCategories` array in `Consultation.tsx` was fully hardcoded (36 items). Now derived from real consultant data: `Array.from(new Set(consultants.flatMap(c => c.expertises)))`. Falls back to the static list only when no consultants are loaded yet. The filter now shows only expertise categories that actually match existing consultants.

### AdminCommunication Placeholder Check
**Status**: VERIFIED OK
All "placeholder" references in `AdminCommunication.tsx` and `AdminCommunicationAPI.tsx` are legitimate HTML `placeholder` attributes on form inputs (e.g., `placeholder="iKan Health"`) — not fake data or seed content. No changes needed.

---

## Recently Fixed (Session 2)