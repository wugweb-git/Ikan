import React, { useState, useEffect, useCallback, lazy, Suspense, startTransition } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useTokens } from './product/app/shell/react-tokens';
import { crossHostSignInUrl } from './product/app/shell/app-host';
import { useIsMobile } from './admin/ui/hooks/useIsMobile';
import { useMobileOptimizations, useMobileViewport, useMobileKeyboard } from './product/app/shell/useMobileOptimizations';
import { AuthProvider, useAuth } from './shared/state/AuthContext';
import { NotificationProvider, useNotifications } from './shared/state/NotificationContext';
import { PaymentProvider } from './product/app/shell/PaymentContext';
import { JourneyProvider } from './product/app/shell/JourneyContext';
import { Navigation } from './product/app/shell/navigation/Navigation';
import { BottomNavBarMobile } from './product/app/shell/navigation/BottomNavBarMobile';
import { PublicBottomNavMobile } from './product/site/ui/PublicBottomNavMobile';
import { useIsCompactNav } from './product/site/ui/hooks/useIsMobile';
import { RouteGuard } from './product/app/shell/RouteGuard';
import { DEFAULT_PUBLIC_ROUTE, DEFAULT_PRIVATE_ROUTE } from './product/app/ui/route-config';
import { MobileOnboarding } from './product/app/onboarding/MobileOnboarding';
import { VerifyEmail } from './product/app/onboarding/VerifyEmail';
import { GetStarted } from './product/app/onboarding/GetStarted';

import { PushPermissionPrompt, usePushPermissionPrompt } from './product/app/notifications/PushPermissionPrompt';
import { Toaster } from './product/app/ui/sonner';
import { cn } from './product/app/ui/utils';
import { logger } from './product/app/shell/logger';
import { setupGlobalErrorHandlers } from './product/app/shell/error-handlers';
import { LoadingSpinner } from './product/app/ui/LoadingSpinner';
import { useNotificationBadges } from './product/app/shell/useNotificationBadges';
import { lazyRetry } from './product/app/shell/lazy-with-retry';
import { equipSubPage } from './product/app/ui/slug';

// ── DIAGNOSTIC: Global error handler fires before React mounts ──
// This ensures ANY crash (module eval, React mount, etc.) shows something.
if (typeof window !== 'undefined') {
  const showFatalError = (msg: string, source?: string) => {
    // Only inject once
    if (document.getElementById('ikan-fatal-error')) return;
    const el = document.createElement('div');
    el.id = 'ikan-fatal-error';
    el.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#F5F5F5;font-family:system-ui,sans-serif;padding:24px;';
    // Build the overlay with DOM APIs + textContent: `msg` and `source` come
    // from arbitrary error events and must never be parsed as HTML.
    const box = document.createElement('div');
    box.style.cssText = 'max-width:480px;text-align:center;';
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size:48px;margin-bottom:16px;';
    icon.textContent = '⚠️';
    const h2 = document.createElement('h2');
    h2.style.cssText = 'font-size:20px;font-weight:500;color:#151515;margin:0 0 12px;';
    h2.textContent = 'Something went wrong';
    const p = document.createElement('p');
    p.style.cssText = 'font-size:14px;color:#717182;line-height:1.5;margin:0 0 16px;';
    p.textContent = msg;
    box.append(icon, h2, p);
    if (source) {
      const src = document.createElement('p');
      src.style.cssText = 'font-size:12px;color:#999;word-break:break-all;margin:0 0 16px;';
      src.textContent = source;
      box.appendChild(src);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.cssText = 'padding:10px 24px;background:#2A2A2A;color:#fff;border:none;border-radius:12px;font-size:14px;cursor:pointer;';
    btn.textContent = 'Reload App';
    btn.addEventListener('click', () => location.reload());
    const hint = document.createElement('p');
    hint.style.cssText = 'font-size:12px;color:#717182;margin:16px 0 0;';
    hint.textContent = 'If this keeps happening, try clearing your browser cache.';
    box.append(btn, hint);
    el.appendChild(box);
    (document.getElementById('root') || document.body).appendChild(el);
  };

  window.addEventListener('error', (e) => {
    console.error('[iKan Fatal]', e.message, e.filename, e.lineno);
    // Only show for fatal errors that prevent rendering (give React 3s to mount)
    setTimeout(() => {
      const root = document.getElementById('root');
      if (root && root.children.length === 0) {
        showFatalError(e.message || 'The app failed to load.', e.filename ? `${e.filename}:${e.lineno}` : undefined);
      }
    }, 3000);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('[iKan Fatal Promise]', e.reason);
  });
}

// --- ALL screens are now lazy-loaded to prevent module-level crashes ---
// Previously eagerly loaded screens moved to lazy:
const Dashboard = lazy(() => lazyRetry(() => import('./product/app/dashboard/Dashboard').then(m => ({ default: m.Dashboard })), 'Dashboard'));
const Homepage = lazy(() => lazyRetry(() => import('./product/site/pages/Homepage').then(m => ({ default: m.Homepage })), 'Homepage'));
const NotFound = lazy(() => lazyRetry(() => import('./product/site/pages/NotFound').then(m => ({ default: m.NotFound })), 'NotFound'));
const LoginScreen = lazy(() => lazyRetry(() => import('./product/app/shell/LoginScreen').then(m => ({ default: m.default || m.LoginScreen })), 'LoginScreen'));
const ResetPassword = lazy(() => lazyRetry(() => import('./product/app/account/ResetPassword').then(m => ({ default: m.default || m.ResetPassword })), 'ResetPassword'));
// Onboarding flow screens are imported eagerly (not lazy): they are small, sit
// at the entry of the app, and lazy-loading them deadlocks the AnimatePresence
// `mode="wait"` transition when entering an unloaded chunk.

// --- Lazy loaded screens (split by category) ---

// Assessment screens
/* Static catalogue pages (2026-09-21): ikanhealth.in serves these from a
   build-time snapshot for everyone; account actions link out to the member app
   (APP_ORIGIN). The app screens of the same names stay in product/app/screens,
   unrouted. */
const Assessments = lazy(() => lazyRetry(() => import('./product/site/pages/Assessments').then(m => ({ default: m.Assessments })), 'Assessments'));
const AssessmentDetail = lazy(() => lazyRetry(() => import('./product/site/pages/AssessmentDetail').then(m => ({ default: m.AssessmentDetail })), 'AssessmentDetail'));
const AssessmentFlow = lazy(() => lazyRetry(() => import('./product/app/assessments/AssessmentFlow').then(m => ({ default: m.AssessmentFlow })), 'AssessmentFlow'));
const AssessmentResults = lazy(() => lazyRetry(() => import('./product/app/assessments/AssessmentResults').then(m => ({ default: m.AssessmentResults })), 'AssessmentResults'));
const AssessmentHistoryDetail = lazy(() => lazyRetry(() => import('./product/app/assessments/AssessmentHistoryDetail').then(m => ({ default: m.AssessmentHistoryDetail })), 'AssessmentHistoryDetail'));

// Equip screens
const EquipPrograms = lazy(() => lazyRetry(() => import('./product/site/pages/EquipPrograms').then(m => ({ default: m.EquipPrograms })), 'EquipPrograms'));
const EquipDetail = lazy(() => lazyRetry(() => import('./product/site/pages/EquipDetail').then(m => ({ default: m.EquipDetail })), 'EquipDetail'));
const EquipOnboarding = lazy(() => lazyRetry(() => import('./product/app/programs/EquipProgramOnboarding').then(m => ({ default: m.EquipOnboarding })), 'EquipOnboarding'));
const EquipProgramFlow = lazy(() => lazyRetry(() => import('./product/app/programs/EquipProgramFlow').then(m => ({ default: m.EquipProgramFlow })), 'EquipProgramFlow'));
const EquipProgramCompletion = lazy(() => lazyRetry(() => import('./product/app/programs/EquipProgramCompletion').then(m => ({ default: m.EquipProgramCompletion })), 'EquipProgramCompletion'));

// User screens
const Consultation = lazy(() => lazyRetry(() => import('./product/site/pages/Consultation').then(m => ({ default: m.Consultation })), 'Consultation'));
const Library = lazy(() => lazyRetry(() => import('./product/site/pages/Resources').then(m => ({ default: m.Resources })), 'Resources'));
const Account = lazy(() => lazyRetry(() => import('./product/app/account/Account').then(m => ({ default: m.Account })), 'Account'));
const MoodJournal = lazy(() => lazyRetry(() => import('./product/app/journal/MoodJournal').then(m => ({ default: m.MoodJournal })), 'MoodJournal'));
const ResourceDetail = lazy(() => lazyRetry(() => import('./product/site/pages/ResourceDetail').then(m => ({ default: m.ResourceDetail })), 'ResourceDetail'));
const ProfessionalApplication = lazy(() => lazyRetry(() => import('./product/site/pages/ProfessionalApplication').then(m => ({ default: m.ProfessionalApplication })), 'ProfessionalApplication'));
const WellnessTimeline = lazy(() => lazyRetry(() => import('./product/app/journal/WellnessTimeline').then(m => ({ default: m.WellnessTimeline })), 'WellnessTimeline'));
const LearningDiary = lazy(() => lazyRetry(() => import('./product/app/journal/LearningDiary').then(m => ({ default: m.LearningDiary })), 'LearningDiary'));

// Static/legal pages
const AboutUs = lazy(() => lazyRetry(() => import('./product/site/pages/AboutUs').then(m => ({ default: m.AboutUs })), 'AboutUs'));
const Services = lazy(() => lazyRetry(() => import('./product/site/pages/Services').then(m => ({ default: m.Services })), 'Services'));
const FAQ = lazy(() => lazyRetry(() => import('./product/site/pages/FAQ').then(m => ({ default: m.FAQ })), 'FAQ'));
const PrivacyPolicy = lazy(() => lazyRetry(() => import('./product/site/pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })), 'PrivacyPolicy'));
const TermsOfUse = lazy(() => lazyRetry(() => import('./product/site/pages/TermsOfUse').then(m => ({ default: m.TermsOfUse })), 'TermsOfUse'));
const ContactUs = lazy(() => lazyRetry(() => import('./product/site/pages/ContactUs').then(m => ({ default: m.ContactUs })), 'ContactUs'));
const ReturnPolicy = lazy(() => lazyRetry(() => import('./product/site/pages/ReturnPolicy').then(m => ({ default: m.ReturnPolicy })), 'ReturnPolicy'));
const CancellationPolicy = lazy(() => lazyRetry(() => import('./product/site/pages/CancellationPolicy').then(m => ({ default: m.CancellationPolicy })), 'CancellationPolicy'));

// Admin screens
const AdminDashboard = lazy(() => lazyRetry(() => import('./admin/shell/AdminDashboard').then(m => ({ default: m.AdminDashboard })), 'AdminDashboard'));
const AdminLoginScreen = lazy(() => lazyRetry(() => import('./admin/shell/AdminLoginScreen').then(m => ({ default: m.AdminLoginScreen })), 'AdminLoginScreen'));
const AdminGate = lazy(() => lazyRetry(() => import('./admin/shell/AdminGate').then(m => ({ default: m.AdminGate })), 'AdminGate'));

// --- Eagerly loaded non-screen components ---
import { AdminWidget } from './admin/shell/AdminWidget';
import { ADMIN_ROUTE_PATHS } from './admin/shell/sections';
import { GoogleFitProvider } from './product/app/integrations/GoogleFitContext';
import { Footer } from './product/site/ui/Footer';

import { ErrorBoundary } from './product/app/ui/ErrorBoundary';
import { ChunkErrorBoundary } from './product/app/shell/ChunkErrorBoundary';
import { SecurityProvider } from './product/app/shell/SecurityProvider';
import { usePublicSettings } from './admin/ui/hooks/usePublicSettings';
import { CrisisSupport, useCrisisSupport } from './product/app/safety/CrisisSupport';
import { SafePerformanceMonitor } from './product/app/shell/SafePerformanceMonitor';
import { SkipToMainContent, useReducedMotion } from './product/app/ui/accessibility-helpers';
import { OfflineBanner } from './product/app/shell/OfflineBanner';
import { useOfflineSync } from './shared/api/useOfflineSync';
import { installBlocksFallbackReporter } from './product/app/shell/block-fallback-reporter';
import { usePullToRefresh } from './product/app/shell/usePullToRefresh';
import { hasCompletedFirstRun } from './product/app/shell/first-run';

/** Marketing-site routes (the pages under product/site/pages). */
const SITE_FOOTER_ROUTES = new Set([
  '/', '/about', '/service', '/services', '/faq', '/contact',
  '/privacy', '/privacy-policy', '/terms', '/return-policy', '/cancellation-policy',
  '/assessment', '/assessment-detail',
  '/equip', '/equip-detail',
  '/consultation', '/join/professional',
  '/resource', '/resource-detail',
]);

// --- Suspense fallback ---
// Uses a delayed render so fast-loading chunks don't flash a spinner
function LazyFallback() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300); // 300ms grace period
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return <LoadingSpinner fullScreen message="Loading..." />;
}

/**
 * Shown to non-admins while Maintenance Mode is on.
 * Deliberately plain: no data fetching, no auth dependency, nothing that can
 * fail while the site is meant to be down.
 */
function MaintenanceScreen({ siteName }: { siteName?: string }) {
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div style={{ maxWidth: '32rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          {siteName || 'iKAN'} is down for maintenance
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-base)',
            lineHeight: 1.6,
            color: 'var(--color-text-muted)',
            margin: '12px 0 0',
          }}
        >
          We are making some improvements and will be back shortly. Thank you for
          your patience.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            margin: '24px 0 0',
          }}
        >
          If you need urgent mental health support right now, call{' '}
          <a href="tel:14416" style={{ color: 'var(--color-primary-default)', fontWeight: 500 }}>
            Tele-MANAS 14416
          </a>{' '}
          — free, 24/7.
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
  const { user, isInitialized, verifiedIsAdmin } = useAuth();
  const { settings: publicSettings } = usePublicSettings();
  const { showToast } = useNotifications();
  const { shouldShowPrompt } = usePushPermissionPrompt();
  const { isVisible: isCrisisVisible, triggerReason, hideCrisisSupport } = useCrisisSupport();
  const isMobile = useIsMobile();
  /* The public bar swaps to its compact form at 1024, not 768: the menu is six
     links and the capsule cannot hold them below that. See useIsCompactNav. */
  const isCompactNav = useIsCompactNav();
  const { triggerHapticFeedback } = useMobileOptimizations();
  useMobileKeyboard();
  useMobileViewport();
  
  const prefersReducedMotion = useReducedMotion();
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();
  const notificationBadges = useNotificationBadges();
  
  // Pull-to-refresh (extracted hook)
  const handlePullRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast('success', 'Refreshed', 'Content updated successfully');
    // Trigger a soft re-render instead of full page reload which destroys iframe
    window.dispatchEvent(new CustomEvent('ikan-refresh'));
  }, [showToast]);
  
  usePullToRefresh({ enabled: isMobile, onRefresh: handlePullRefresh });
  
  // All state hooks
  const [emergencyRender, setEmergencyRender] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(() => {
    // Read the initial route from the URL so direct navigation (e.g. /join/professional) works
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      // Slug detail routes map to the existing detail screens
      if (path.startsWith('/assessment/') && path !== '/assessment/') return '/assessment-detail';
      /* A programme's own pages live under it — /equip/<slug>/result and
         /equip/<slug>/diary. Checked BEFORE the bare slug, or `sleep-tight/diary`
         would be read as a slug. */
      {
        const sub = equipSubPage(path);
        if (sub?.page === 'result') return '/equip-program-completion';
        if (sub?.page === 'diary') return '/learning-diary';
        if (sub) return '/equip-detail';
      }
      if (path && path !== '/') return path;
    }
    return DEFAULT_PUBLIC_ROUTE;
  });
  const [resourceDetailId, setResourceDetailId] = useState<string | null>(null);
  // Slug captured from /assessment/<slug> and /equip/<slug> URLs (back-compat: ?id= still works)
  const [assessmentSlug, setAssessmentSlug] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.startsWith('/assessment/') && p !== '/assessment/') return p.split('/assessment/')[1];
    }
    return null;
  });
  const [equipSlug, setEquipSlug] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return equipSubPage(window.location.pathname)?.slug ?? null;
    return null;
  });

  const handleSignIn = () => {
    // On the marketing host, sign-in happens on the app host — see app-host.ts.
    const crossHost = crossHostSignInUrl(window.location.hostname);
    if (crossHost) {
      window.location.assign(crossHost);
      return;
    }
    startTransition(() => setCurrentRoute('/login'));
  };

  // A direct visit or bookmark to ikanhealth.in/login bypasses both handlers
  // above, so catch it once on load. replace(), not assign(): the marketing
  // /login URL should not sit in history for Back to bounce into again.
  useEffect(() => {
    if (window.location.pathname !== '/login') return;
    const crossHost = crossHostSignInUrl(window.location.hostname);
    if (crossHost) window.location.replace(crossHost + window.location.search);
  }, []);

  const handleNavigate = useCallback((route: string, resourceId?: string) => {
    try {
      logger.log('Navigating to:', route, resourceId ? `with resource: ${resourceId}` : '');
      
      if (isMobile) {
        triggerHapticFeedback('light');
      }
      // Every navigation starts at the top, on every surface.
      scrollPageToTop();
      
      const [path, search] = route.split('?');

      // Any route into /login from the marketing host leaves for the app host,
      // so onboarding and password-reset flows land there too, not only the
      // header button.
      if (path === '/login') {
        const crossHost = crossHostSignInUrl(window.location.hostname);
        if (crossHost) {
          window.location.assign(crossHost + (search ? `?${search}` : ''));
          return;
        }
      }
      
      const validRoutes = [
        '/', '/dashboard', '/mood-journal', '/assessment', '/assessment-detail', '/assessment-flow', '/assessment-results', '/assessment-history-detail',
        '/equip', '/equip-detail', '/equip-program-onboarding', '/equip-program-flow', '/equip-program-completion',
        '/consultation', '/resource', '/resource-detail', '/account', 
        '/about', '/service', '/services', '/faq', '/privacy', '/privacy-policy', '/terms', '/contact', '/return-policy', '/cancellation-policy', '/login', '/reset-password',
        ...ADMIN_ROUTE_PATHS, // every admin section, from admin/shell/sections.ts
        '/join/professional',
        '/timeline',
        '/learning-diary',
        '/onboarding', '/verify-email', '/get-started'
      ];
      
      // Slug detail routes: /assessment/<slug> and /equip/<slug>
      if (path.startsWith('/assessment/') && path !== '/assessment/') {
        const slug = path.split('/assessment/')[1];
        setAssessmentSlug(slug);
        startTransition(() => setCurrentRoute('/assessment-detail'));
        if (typeof window !== 'undefined') window.history.pushState({}, '', route);
        return;
      }
      {
        const sub = equipSubPage(path);
        if (sub) {
          setEquipSlug(sub.slug);
          startTransition(() => setCurrentRoute(
            sub.page === 'result' ? '/equip-program-completion'
            : sub.page === 'diary' ? '/learning-diary'
            : '/equip-detail',
          ));
          if (typeof window !== 'undefined') window.history.pushState({}, '', route);
          return;
        }
      }
      // Any other navigation clears stale detail slugs so legacy ?id= links resolve correctly
      setAssessmentSlug(null);
      setEquipSlug(null);
      
      if (!validRoutes.includes(path)) {
        // Allow CMS page routes (e.g. /page/some-slug) through
        if (path.startsWith('/page/')) {
          // CMS page — let it pass through to the switch
        } else {
          logger.warn('Invalid route:', path, 'redirecting to appropriate default');
          const defaultRoute = user ? DEFAULT_PRIVATE_ROUTE : DEFAULT_PUBLIC_ROUTE;
          startTransition(() => setCurrentRoute(defaultRoute));
          setResourceDetailId(null);
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', defaultRoute);
          }
          return;
        }
      }
      
      // setRouteHistory(prev => {
      //   const newHistory = [...prev, path];
      //   return newHistory.slice(-10);
      // });
      
      startTransition(() => setCurrentRoute(path));

      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', route);
      }

      if (path === '/resource-detail' && resourceId) {
        setResourceDetailId(resourceId);
        if (!search && typeof window !== 'undefined') {
           const newUrl = `/resource-detail?id=${resourceId}`;
           window.history.pushState({}, '', newUrl);
        }
      } else {
        setResourceDetailId(null);
      }
    } catch (error) {
      logger.error('Navigation error:', error);
      startTransition(() => setCurrentRoute('/dashboard'));
      setResourceDetailId(null);
    }
  }, [isMobile, user, triggerHapticFeedback]);

  // ALL useEffect HOOKS - CALLED CONSISTENTLY ON EVERY RENDER
  
  // Auth state changes + first-run gate
  useEffect(() => {
    if (!isInitialized) return;
    if (user && currentRoute === '/') {
      // First sign-in on this device sees the getting-started screen once.
      const target = hasCompletedFirstRun() ? DEFAULT_PRIVATE_ROUTE : '/get-started';
      startTransition(() => setCurrentRoute(target));
      if (typeof window !== 'undefined') window.history.replaceState({}, '', target);
    }
    /* The mobile splash that used to live at /welcome is gone. It was the member
       app's first-run screen, and the member app is iKAN 2 now — on a static
       marketing site it sent a first-time visitor to an onboarding dead end
       instead of the homepage. */
  }, [user, isInitialized, currentRoute, isMobile]);

  // Mobile viewport optimization effect
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined') {
      // Zoom is enabled in index.html and stays enabled. The viewport meta is not
      // rewritten here any more: the previous focusin/focusout handlers set
      // user-scalable=no while any input was focused, which is a WCAG 1.4.4 failure
      // exactly when a user filling a form is most likely to need to zoom. The iOS
      // auto-zoom-on-focus that hack was working around is prevented properly by the
      // 16px font-size floor on form controls in globals.css.

      if ('serviceWorker' in navigator && 'PushManager' in window) {
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          logger.log('PWA install prompt available');
        });
      }

      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection && connection.effectiveType && connection.effectiveType.includes('2g')) {
          logger.log('Slow connection detected - enabling performance mode');
          document.documentElement.classList.add('slow-connection');
        }
      }
    }
  }, [isMobile]);

  // App initialization effect — delegates to extracted error-handlers utility
  useEffect(() => {
    logger.log('iKan app starting...');
    
    const cleanup = setupGlobalErrorHandlers({ showToast });
    
    logger.log('App ready!');
    return cleanup;
  }, []);

  // Emergency fallback effect — only needed if auth initialization hangs
  useEffect(() => {
    if (isInitialized || emergencyRender) return; // Already initialized, skip

    const emergencyTimeout = setTimeout(() => {
      console.log('EMERGENCY: Auth init timed out after 5s - forcing render');
      setEmergencyRender(true);
    }, 5000);

    return () => clearTimeout(emergencyTimeout);
  }, [isInitialized, emergencyRender]);

  // Popstate handler for browser back/forward button support
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/assessment/') && path !== '/assessment/') {
        setAssessmentSlug(path.split('/assessment/')[1]);
        startTransition(() => setCurrentRoute('/assessment-detail'));
      } else if (equipSubPage(path)) {
        setEquipSlug(equipSubPage(path)!.slug);
        startTransition(() => setCurrentRoute('/equip-detail'));
      } else {
        setAssessmentSlug(null);
        setEquipSlug(null);
        startTransition(() => setCurrentRoute(path || DEFAULT_PUBLIC_ROUTE));
      }
      scrollPageToTop();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Focus management on route changes (accessibility)
  useEffect(() => {
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.focus({ preventScroll: true });
    }
  }, [currentRoute]);

  // Fix invalid route state (moved out of render to avoid setState-during-render)
  useEffect(() => {
    if (!currentRoute || typeof currentRoute !== 'string') {
      const defaultRoute = user ? DEFAULT_PRIVATE_ROUTE : DEFAULT_PUBLIC_ROUTE;
      startTransition(() => setCurrentRoute(defaultRoute));
    }
  }, [currentRoute, user]);

  // Redirect unauthenticated users from admin routes (moved out of render)
  useEffect(() => {
    if (currentRoute.startsWith('/admin') && currentRoute !== '/admin/login' && !user && isInitialized) {
      startTransition(() => setCurrentRoute('/admin/login'));
    }
  }, [currentRoute, user, isInitialized]);

  // Render function
  const renderScreen = () => {
    // Define withSuspense OUTSIDE try/catch so the catch block can use it
    /**
     * Every lazy route, wrapped once.
     *
     * `ChunkErrorBoundary` used to be applied to `/mood-journal` alone, so a
     * chunk-load failure on any of the other ~30 lazy routes fell through to
     * the generic crash screen — the same failure, with worse copy and no way
     * back. There is nothing about the mood journal that makes it more prone
     * to this; it was simply the route where somebody hit it first.
     *
     * The boundary rethrows anything that is not a chunk error, so the outer
     * ErrorBoundary still handles real crashes.
     */
    const withSuspense = (component: React.ReactNode, chunkName?: string) => (
      <ErrorBoundary>
        <ChunkErrorBoundary chunkName={chunkName}>
          <Suspense fallback={<LazyFallback />}>{component}</Suspense>
        </ChunkErrorBoundary>
      </ErrorBoundary>
    );

    try {
      if (!currentRoute || typeof currentRoute !== 'string') {
        console.log('Invalid route detected, falling back to default');
        // Don't setState during render — return a safe fallback and fix route via effect
        return null;
      }

      const getQueryParams = () => {
        if (typeof window === 'undefined') return {};
        const search = window.location.search;
        return Object.fromEntries(new URLSearchParams(search));
      };
      
      const queryParams = getQueryParams();

      // Check for Admin Routes first
      if (currentRoute.startsWith('/admin')) {
        if (currentRoute === '/admin/login') {
            return (
              <ErrorBoundary>
                <Suspense fallback={<LazyFallback />}>
                  <AdminLoginScreen 
                      onNavigate={handleNavigate} 
                      onLoginSuccess={() => handleNavigate('/admin')} 
                  />
                </Suspense>
              </ErrorBoundary>
            );
        }

        if (!user) {
            // Don't call handleNavigate during render — return login screen directly
            return (
              <ErrorBoundary>
                <Suspense fallback={<LazyFallback />}>
                  <AdminLoginScreen 
                      onNavigate={handleNavigate} 
                      onLoginSuccess={() => handleNavigate('/admin')} 
                  />
                </Suspense>
              </ErrorBoundary>
            );
        }

        const adminPath = currentRoute.replace('/admin/', '');
        // '/admin' (bare) and '/admin/reporting' both resolve to the landing view —
        // bare kept as a working alias so existing bookmarks/links don't break.
        const view = (currentRoute === '/admin' || currentRoute === '/admin/reporting') ? 'dashboard' : adminPath;
        
        // Signed in is not enough: AdminGate renders the console only once the
        // server-loaded profile says is_admin === true (never the cached
        // localStorage hint), and shows "Not authorised" otherwise.
        return (
          <ErrorBoundary>
            <Suspense fallback={<LazyFallback />}>
              <AdminGate onNavigate={handleNavigate}>
                <AdminDashboard onNavigate={handleNavigate} initialView={view} />
              </AdminGate>
            </Suspense>
          </ErrorBoundary>
        );
      }

      // Wrap lazy-loaded components in Suspense
      // (withSuspense is defined above the try block so catch can also use it)

      switch (currentRoute) {
        case '/':
          return withSuspense(<Homepage onNavigate={handleNavigate} onGetStarted={handleSignIn} />);
        case '/dashboard':
          return withSuspense(<Dashboard onNavigate={handleNavigate} />);
        case '/assessment':
          return withSuspense(<Assessments onNavigate={handleNavigate} />);
        case '/assessment-detail':
          return withSuspense(<AssessmentDetail assessmentId={assessmentSlug || queryParams.id || queryParams.type} onNavigate={handleNavigate} />);
        case '/assessment-flow':
          return withSuspense(<AssessmentFlow assessmentId={queryParams.id || queryParams.type} onNavigate={handleNavigate} />);
        case '/assessment-results':
          return withSuspense(<AssessmentResults resultId={queryParams.id} onNavigate={handleNavigate} />);
        case '/assessment-history-detail':
          return withSuspense(<AssessmentHistoryDetail onNavigate={handleNavigate} />);
        case '/equip':
          return withSuspense(<EquipPrograms onNavigate={handleNavigate} />);
        case '/equip-detail':
          return withSuspense(<EquipDetail equipId={equipSlug || queryParams.id} onNavigate={handleNavigate} />);
        case '/equip-program-onboarding':
          return withSuspense(<EquipOnboarding programId={queryParams.id} onNavigate={handleNavigate} />);
        case '/equip-program-flow':
          return withSuspense(<EquipProgramFlow programId={queryParams.id} onNavigate={handleNavigate} />);
        case '/equip-program-completion':
          return withSuspense(<EquipProgramCompletion programId={equipSlug || queryParams.id} onNavigate={handleNavigate} />);
        case '/consultation':
          return withSuspense(<Consultation onNavigate={handleNavigate} />);
        case '/resource':
          return withSuspense(<Library onNavigate={handleNavigate} />);
        case '/resource-detail':
          return withSuspense(<ResourceDetail onNavigate={handleNavigate} resourceId={resourceDetailId || queryParams.id} />);
        case '/account':
          return withSuspense(<Account onNavigate={handleNavigate} />);
        case '/mood-journal':
          return withSuspense(<MoodJournal onNavigate={handleNavigate} />, 'Mood Journal');
        case '/about':
          return withSuspense(<AboutUs onNavigate={handleNavigate} />);
        case '/service':
        case '/services':
          return withSuspense(<Services onNavigate={handleNavigate} />);
        case '/faq':
          return withSuspense(<FAQ onNavigate={handleNavigate} />);
        case '/privacy':
        case '/privacy-policy':
          return withSuspense(<PrivacyPolicy onNavigate={handleNavigate} />);
        case '/terms':
          return withSuspense(<TermsOfUse onNavigate={handleNavigate} />);
        case '/contact':
          return withSuspense(<ContactUs onNavigate={handleNavigate} />);
        case '/return-policy':
          return withSuspense(<ReturnPolicy onNavigate={handleNavigate} />);
        case '/cancellation-policy':
          return withSuspense(<CancellationPolicy onNavigate={handleNavigate} />);
        case '/onboarding':
          return withSuspense(<MobileOnboarding onNavigate={handleNavigate} />);
        case '/verify-email':
          return withSuspense(<VerifyEmail onNavigate={handleNavigate} email={queryParams.email} />);
        case '/get-started':
          return withSuspense(<GetStarted onNavigate={handleNavigate} />);
        case '/login':
          return withSuspense(<LoginScreen onNavigate={handleNavigate} onSuccess={() => handleNavigate(hasCompletedFirstRun() ? '/dashboard' : '/get-started')} />);
        case '/reset-password':
          return withSuspense(<ResetPassword onNavigate={handleNavigate} />);
        case '/join/professional':
          return withSuspense(<ProfessionalApplication onNavigate={handleNavigate} />);
        case '/timeline':
          return withSuspense(<WellnessTimeline onNavigate={handleNavigate} />);
        case '/learning-diary':
          return withSuspense(<LearningDiary equipId={equipSlug || queryParams.id} onNavigate={handleNavigate} />);
        default:
          return withSuspense(<NotFound onNavigate={handleNavigate} />);
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      return withSuspense(<Dashboard onNavigate={handleNavigate} />);
    }
  };

  const isOnboardingFlow = currentRoute === '/onboarding' || currentRoute === '/verify-email' || currentRoute === '/get-started';
  const showPublicNav = (!user || currentRoute === '/') && currentRoute !== '/login' && !currentRoute.startsWith('/admin') && !isOnboardingFlow;
  const showPrivateNav = !!user &&
    currentRoute !== '/' &&
    currentRoute !== '/login' &&
    !currentRoute.startsWith('/admin') &&
    !currentRoute.startsWith('/assessment-flow') &&
    !currentRoute.startsWith('/equip-program-flow') &&
    !currentRoute.startsWith('/equip-program-onboarding') &&
    !isOnboardingFlow;
  // The site footer shows on every marketing-site route and on no member or
  // admin route (App.tsx serves both from one bundle).
  const shouldShowFooter = SITE_FOOTER_ROUTES.has(currentRoute) || currentRoute.startsWith('/page/');

  const isFullScreenFlow = currentRoute.startsWith('/assessment-flow') ||
                           currentRoute.startsWith('/equip-program-flow') ||
                           currentRoute.startsWith('/equip-program-onboarding') ||
                           currentRoute.startsWith('/equip-program-completion') ||
                           currentRoute.startsWith('/join/') ||
                           isOnboardingFlow;

  const isHeroRoute = shouldShowFooter || 
                      currentRoute === '/' || 
                      currentRoute === '/login' ||
                      currentRoute === '/assessment' ||
                      currentRoute === '/equip' ||
                      currentRoute === '/resource' ||
                      currentRoute === '/consultation' ||
                      currentRoute === '/consultation-detail' ||
                      currentRoute === '/equip-programs-landing' ||
                      currentRoute === '/assessment-landing' ||
                      isFullScreenFlow;

  // Maintenance mode. The admin Feature Toggles wrote `maintenanceMode` to
  // settings:site and NOTHING read it — an admin could flip "Temporarily
  // disable site access", see it save, and the site stayed fully up. Admins are
  // exempt so whoever enabled it can still reach the admin panel to turn it off,
  // and /admin stays reachable so they are never locked out by their own toggle.
  //
  // This is a front-of-house gate, not a security control: the API stays open
  // and anyone can still call it directly. It is what the toggle's own
  // description promises, and no more.
  const inMaintenance =
    publicSettings?.maintenanceMode === true &&
    verifiedIsAdmin !== true &&
    !currentRoute.startsWith('/admin');

  if (inMaintenance) {
    return <MaintenanceScreen siteName={publicSettings?.siteName} />;
  }

  return (
    <div className={cn(
      "flex flex-col min-h-[100dvh] bg-background font-sans antialiased text-foreground",
      currentRoute === '/login' ? "h-[100dvh] md:overflow-hidden overflow-y-auto" : ""
    )}>
      {/* Accessibility: Skip to main content link */}
      <SkipToMainContent />

      {/* Offline Status Banner */}
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onSyncNow={syncNow}
      />

      {/* Top Navigation - Floating Capsule (Desktop only) */}
      {!isCompactNav && !isFullScreenFlow && currentRoute !== '/login' && !currentRoute.startsWith('/admin') && (
        <Navigation 
          user={user} 
          onNavigate={handleNavigate} 
          currentRoute={currentRoute}
        />
      )}

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn("flex-1 w-full relative outline-none p-[0px]", 
          !isHeroRoute && !currentRoute.startsWith('/admin') && !isMobile && "pt-[100px]")}
        role="main"
        aria-label="Page content"
      >
        <div className={cn(
          "w-full h-full",
          isMobile && showPrivateNav ? "pb-24" : ""
        )}>
          <RouteGuard currentRoute={currentRoute} onNavigate={handleNavigate}>
            {currentRoute.startsWith('/admin') ? (
              // Admin routes: NO animation wrapper — render directly for speed
              <div className="w-full h-full">
                {renderScreen()}
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentRoute}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  {renderScreen()}
                </motion.div>
              </AnimatePresence>
            )}
          </RouteGuard>
        </div>
      </main>

      {/* Footer for Public Pages */}
      {shouldShowFooter && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Mobile Navigation - Public Top, Private Bottom */}
      {isCompactNav && showPublicNav && (
        <PublicBottomNavMobile 
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          className=""
        />
      )}
      
      {/* Private Mobile Bottom Navigation */}
      {isMobile && showPrivateNav && (
        <BottomNavBarMobile 
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          notificationBadges={notificationBadges}
        />
      )}

      {/* Push Permission Prompt */}
      {shouldShowPrompt && (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto">
            <PushPermissionPrompt
              onGrant={() => {
                showToast('success', 'Notifications enabled!', 'You\'ll receive helpful reminders and updates.');
              }}
              onDeny={() => {
                showToast('info', 'No problem', 'You can enable notifications anytime in settings.');
              }}
            />
          </div>
        </div>
      )}

      {/* Crisis Support Modal */}
      <CrisisSupport 
        isVisible={isCrisisVisible} 
        onClose={hideCrisisSupport}
        triggerReason={triggerReason}
      />

      {/* Safe Performance Monitoring */}
      <SafePerformanceMonitor />

      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        expand={false}
        closeButton
        toastOptions={{
          style: {
            borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-family-base)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: 'var(--text-sm)',
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-default)',
          },
          className: 'ikan-toast'
        }}
      />
      
      {/* Admin Widget */}
      <AdminWidget onNavigate={handleNavigate} />
    </div>
  );
}

// Wire block fallback telemetry to its sink, once, at module load. Before this
// every `warnFallback` — an undeclared subtype in live content, a day whose type
// matches no preset and so skips ALL validation — went to console.warn and
// nowhere else, visible only to a developer with devtools open on that exact tab.
installBlocksFallbackReporter();


/**
 * Put the next page at its top.
 *
 * `window.scrollTo` alone does nothing here: the app scrolls in an INNER
 * container, not the document, so every existing call was a no-op and a
 * visitor clicking a footer link landed halfway down the next page. This
 * resets the document AND whichever ancestor is actually doing the scrolling.
 */
function scrollPageToTop() {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0 });
  const main = document.getElementById('main-content');
  let el: HTMLElement | null = main;
  while (el) {
    const overflow = getComputedStyle(el).overflowY;
    if ((overflow === 'auto' || overflow === 'scroll') && el.scrollHeight > el.clientHeight) {
      el.scrollTop = 0;
      return;
    }
    el = el.parentElement;
  }
}

export default function App() {
  useTokens();

  return (
    <ErrorBoundary>
      {/* Honour the OS "reduce motion" setting across every framer-motion
          animation in the app. The CSS `prefers-reduced-motion` block in
          globals.css only reaches CSS transitions — it has no effect on
          framer-motion, which animates via JS. One wrapper covers the lot;
          without it, users who asked the system for less motion still got all
          of it. */}
      <MotionConfig reducedMotion="user">
      <AuthProvider>
        <NotificationProvider>
          <PaymentProvider>
            <JourneyProvider>
              <GoogleFitProvider>
                <SecurityProvider>
                  <AppContent />
                  <Analytics />
                  <SpeedInsights />
                </SecurityProvider>
              </GoogleFitProvider>
            </JourneyProvider>
          </PaymentProvider>
        </NotificationProvider>
      </AuthProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}