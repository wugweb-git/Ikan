# iKan PWA - Project Structure

> **Last updated**: March 12, 2026
> **Audience**: All developers

---

## Root Directory

```
/
+-- App.tsx                          # Main entry point (manual routing, providers)
+-- index.html                       # HTML shell
+-- package.json                     # Dependencies and scripts
+-- tsconfig.json                    # TypeScript config (strict, noUnusedLocals)
+-- vite.config.ts                   # Vite + PWA + path aliases + chunk splitting
+-- vercel.json                      # Vercel deployment, headers, SPA rewrites
+-- supabase/                        # Supabase config + Edge Functions
+-- styles/                          # Global CSS + design tokens
+-- components/                      # All React components
+-- contexts/                        # React context providers
+-- hooks/                           # Custom React hooks
+-- lib/                             # Utilities, types, configs, services
+-- utils/                           # Utility helpers
+-- docs/                            # Developer documentation (this folder)
+-- guidelines/                      # Design system guidelines
+-- imports/                         # Figma-imported components and SVGs
+-- public/                          # Static assets (PWA icons, manifest)
+-- scripts/                         # Dev tooling scripts
+-- workflows/                       # GitHub Actions CI/CD
```

---

## `/components/` - React Components

### `/components/admin/` - Admin Panel Components

| File | Description |
|------|------------|
| `AdminWidget.tsx` | Floating admin button (RBAC-gated, only visible to `is_admin` users) |
| `AdminLoginScreen.tsx` | Admin authentication screen |
| `AdminHeader.tsx` | Admin panel header with navigation |
| `AdminPageLayout.tsx` | Shared layout wrapper for admin screens |
| `AdminDataTable.tsx` | Reusable data table with mobile card-view fallback |
| `AdminFormField.tsx` | Reusable form field component |
| `AdminStatusBadge.tsx` | Status indicator badges |
| `AdminLoading.tsx` | Loading state for admin panels |
| `AdminEmptyState.tsx` | Empty state display |
| `AdminSection.tsx` | Collapsible section wrapper |
| `AdminCommunicationAPI.tsx` | Brevo email integration management |
| `AdminCheckinScalesManager.tsx` | Check-in scale template CRUD |
| `AdminPaymentGateway.tsx` | Razorpay payment configuration |
| `AdminSystemLogs.tsx` | System log viewer |
| `AdminCommunication.tsx` | Communication/newsletter management |
| `AdminContactSubmissions.tsx` | Contact form submissions viewer |
| `AdminHeroBannerManager.tsx` | Hero banner CMS |
| `AdminKVAudit.tsx` | KV store debugging tool |
| `AdminMoodManager.tsx` | Mood data management |
| `AdminSecurity.tsx` | Security settings and audit logs |
| `AdminCategoryManager.tsx` | Resource category management |
| `AdminBackupManager.tsx` | Data backup/restore |
| `AdminCRUDTesting.tsx` | Database CRUD testing tool |
| `BookingCalendar.tsx` | Consultation booking calendar |
| `UnifiedBasicInfoForm.tsx` | Shared form for basic entity info |

#### `/components/admin/assessments/` - Assessment admin data
#### `/components/admin/programs/` - Program content presets (burnout, stress, sleep, etc.)
#### `/components/admin/recommendations/` - Recommendation rules engine

### `/components/screens/` - Full Page Screens

| File | Description |
|------|------------|
| **Core User** | |
| `Dashboard.tsx` | Authenticated user dashboard |
| `Homepage.tsx` | Public landing page |
| `Account.tsx` | User account settings |
| `MoodJournal.tsx` | Daily mood tracking |
| `Library.tsx` | Resource library browser |
| **Assessment Flow** | |
| `Assessments.tsx` | Assessment listing page |
| `AssessmentLandingNew.tsx` | Individual assessment landing |
| `AssessmentDetail.tsx` | Assessment detail/info page |
| `AssessmentFlow.tsx` | Assessment questionnaire flow |
| `AssessmentResults.tsx` | Results display with recommendations |
| **Equip Programs** | |
| `EquipPrograms.tsx` | Program listing page |
| `EquipDetail.tsx` | Program detail/info page |
| `EquipProgramOnboarding.tsx` | Program enrollment flow |
| `EquipProgramFlow.tsx` | Daily program activities |
| `EquipProgramCompletion.tsx` | Program completion screen |
| **Consultation** | |
| `Consultation.tsx` | Consultant listing |
| `ConsultantDetail.tsx` | Individual consultant profile |
| `ProfessionalApplication.tsx` | Professional signup form |
| **Admin Screens** | |
| `AdminDashboard.tsx` | Main admin panel (tab-based) |
| `AdminResourceManager.tsx` | Resource CRUD |
| `AdminEquipProgramManager.tsx` | Program CRUD |
| `AdminAssessmentManager.tsx` | Assessment CRUD |
| `AdminUserManager.tsx` | User management |
| `AdminConsultationManager.tsx` | Consultation management |
| `AdminSettingsManager.tsx` | Site settings |
| `AdminPageManager.tsx` | CMS page management |
| `AdminMediaManager.tsx` | Media asset management |
| `AdminDashboardAnalytics.tsx` | Analytics dashboard |
| `AdminEquipAnalytics.tsx` | Equip program analytics |
| `AdminUserDataManager.tsx` | User data export/management |
| **Static/Legal** | |
| `AboutUs.tsx`, `FAQ.tsx`, `PrivacyPolicy.tsx`, `TermsOfUse.tsx`, `ContactUs.tsx`, `ReturnPolicy.tsx`, `CancellationPolicy.tsx`, `Sitemap.tsx` | |
| **Dev Tools** | |
| `UIKitShowcase.tsx` | Design system component showcase |
| `RouteTestScreen.tsx` | Route testing dashboard |
| `WizardTestScreen.tsx` | Wizard component testing |

### `/components/blocks/` - Reusable Content Blocks

Shared UI sections used across multiple screens (heroes, cards, bento grids, newsletter blocks, etc.)

### `/components/navigation/` - Navigation Components

| File | Description |
|------|------------|
| `Navigation.tsx` | Main navigation orchestrator |
| `DesktopTopNav.tsx` | Desktop top navigation bar |
| `BottomNavBarMobile.tsx` | Authenticated mobile bottom nav |
| `PublicBottomNavMobile.tsx` | Public/unauthenticated mobile bottom nav |
| `PublicNavBar.tsx` | Public top navigation |
| `MobileHeader.tsx` | Mobile screen header |
| `Breadcrumbs.tsx` | Breadcrumb navigation |
| `SideNav.tsx` | Desktop side navigation |
| `SideNavAccount.tsx` | Account section side nav |
| `SearchBar.tsx` | Global search |
| `Pagination.tsx` | Pagination controls |

### `/components/ui/` - Base UI Primitives

Radix UI-based primitives (shadcn/ui pattern): `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `select.tsx`, `tabs.tsx`, `badge.tsx`, etc.

> **Note**: Many UI primitives use `filterFigmaProps` to strip Figma-specific props. Ten components have this applied.

### `/components/wizard/` - Wizard/Multi-Step Form System

Reusable multi-step form system: `Wizard.tsx`, `WizardStep.tsx`, `WizardControls.tsx`, `WizardField.tsx`, `WizardProgress.tsx`, `TypeformWizard.tsx`

### Other Component Directories

| Directory | Description |
|-----------|------------|
| `/components/safety/` | Crisis support modal and resources |
| `/components/payments/` | Razorpay payment flow |
| `/components/integrations/` | Google Fit integration |
| `/components/player/` | Program content player (block renderer) |
| `/components/equip/` | Program check-in components |
| `/components/assessments/` | Reassessment prompt |
| `/components/notifications/` | Push notification permission prompt |
| `/components/monitoring/` | Performance monitoring |
| `/components/security/` | Security provider wrapper |
| `/components/organisms/` | Complex organisms (assessment question) |
| `/components/uikit/` | UIKit showcase sections |

---

## `/contexts/` - React Context Providers

| File | Description |
|------|------------|
| `AuthContext.tsx` | Authentication state, sign in/out, profile management |
| `NotificationContext.tsx` | Toast notifications and push permissions |
| `PaymentContext.tsx` | Payment flow state (Razorpay) |
| `JourneyContext.tsx` | User journey tracking state |

---

## `/hooks/` - Custom React Hooks

| Hook | Description |
|------|------------|
| `useAuthGuard.ts` | Route protection based on auth state |
| `useIsMobile.ts` | Mobile viewport detection |
| `useMobileOptimizations.ts` | Haptic feedback, viewport, keyboard handling |
| `useOfflineSync.ts` | Offline data caching and sync |
| `usePullToRefresh.ts` | Pull-to-refresh gesture handler |
| `usePageContent.ts` | CMS page content fetching |
| `useFormValidation.ts` | Form validation utilities |
| `useKeyboardShortcuts.ts` | Keyboard shortcut registration |
| `useUnsavedChanges.ts` | Unsaved changes warning |
| `useCleanupEffect.ts` | Effect cleanup utilities |

---

## `/lib/` - Libraries, Types, and Configuration

| File | Description |
|------|------------|
| `api-client.ts` | `ApiClient` singleton - all HTTP requests to the server |
| `api-types.ts` | TypeScript interfaces for API data shapes |
| `supabase-client.ts` | Singleton Supabase client (frontend) |
| `route-config.ts` | Route definitions (public/private, metadata) |
| `navigation.ts` | Navigation menu configuration |
| `react-tokens.ts` | Design tokens as JS/React values |
| `design-tokens.ts` | Design token utilities |
| `constants.ts` | App-wide constants |
| `validation.ts` | Client-side validation helpers |
| `logger.ts` | Structured logging utility |
| `error-handlers.ts` | Global error handler setup |
| `icon-config.ts` / `icon-mapping.ts` | Icon system configuration |
| `assessment-adapter.ts` | Assessment data transformation |
| `recommendation-engine.ts` | Client-side recommendation logic |
| `equip-types.ts` / `equip-admin-types.ts` | Equip program type definitions |
| `equip-program-content.ts` | Program content helpers |
| `emoji-utils.ts` | Emoji rendering utilities |
| `date-utils.ts` | Date formatting helpers |
| `health-connect-bridge.ts` | Google Fit / Health Connect bridge |
| `offline-fallbacks.ts` | Offline content fallbacks |

---

## `/supabase/functions/server/` - Backend (Hono Server)

| File | Description |
|------|------------|
| `index.tsx` | Main Hono server entry point (CORS, auth middleware, route registration) |
| `kv_store.tsx` | KV store interface (DO NOT EDIT - autogenerated) |
| **Route Modules** | |
| `admin-routes.ts` | Admin CRUD operations (settings, users, debug) |
| `assessment-routes.ts` | Assessment definitions + default assessments |
| `resource-routes.ts` | Resource/library CRUD |
| `equip-routes.ts` | Equip program CRUD |
| `mood-routes.ts` | Mood journal entries |
| `contact-routes.ts` | Contact form submissions |
| `newsletter-routes.ts` | Newsletter subscriptions |
| `scales-routes.ts` | Check-in scale templates |
| `hero-banner-routes.ts` | Hero banner management |
| `corporate-routes.ts` | Corporate program management |
| `brevo-routes.ts` | Brevo email API routes |
| `health-connect-routes.ts` | Google Fit data sync |
| `progress-routes.ts` | Program progress tracking |
| `recommendation-routes.ts` | Recommendation engine routes |
| `checkin-template-routes.ts` | Check-in template management |
| `kv-audit-routes.ts` | KV store audit/debug routes |
| **Services** | |
| `program-service.ts` | Equip program business logic |
| `progress-service.ts` | Progress tracking business logic |
| `recommendation-service.ts` | Recommendation algorithm |
| `content-service.ts` | Content management business logic |
| `brevo-helpers.ts` | Brevo API helper functions |
| `default-assessments.ts` | Hardcoded default assessment definitions |
| **Utilities** | |
| `validation.tsx` | Server-side validation and password hashing |
| `security.tsx` | Session management, audit logs, security alerts |
| `logging.tsx` | API request logging |
| `system-logger.tsx` | System-level logging |
| `performance.tsx` | Performance metrics collection |
| `shared-types.ts` | Shared TypeScript types (server-side) |

---

## `/public/` - Static Assets

PWA icons, manifest, service worker, and screenshots for app store listing.

---

## `/workflows/` - GitHub Actions

| File | Description |
|------|------------|
| `ci.yml` | CI pipeline: lint, type-check, build (Node 18 + 20) |
| `production-deploy.yml` | Full deployment: security scan, quality checks, accessibility, mental health compliance, staging, production |
