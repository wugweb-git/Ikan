import React, { useState, useEffect, useCallback, lazy, Suspense, startTransition } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useTokens } from './lib/react-tokens';
import { useIsMobile } from './hooks/useIsMobile';
import { useMobileOptimizations, useMobileViewport, useMobileKeyboard } from './hooks/useMobileOptimizations';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { JourneyProvider } from './contexts/JourneyContext';
import { Navigation } from './components/navigation/Navigation';
import { BottomNavBarMobile } from './components/navigation/BottomNavBarMobile';
import { PublicBottomNavMobile } from './components/navigation/PublicBottomNavMobile';
import { RouteGuard } from './components/RouteGuard';
import { DEFAULT_PUBLIC_ROUTE, DEFAULT_PRIVATE_ROUTE } from './lib/route-config';

import { PushPermissionPrompt, usePushPermissionPrompt } from './components/notifications/PushPermissionPrompt';
import { Toaster } from './components/ui/sonner';
import { cn } from './components/ui/utils';
import { logger } from './lib/logger';
import { setupGlobalErrorHandlers } from './lib/error-handlers';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useNotificationBadges } from './hooks/useNotificationBadges';
import { lazyRetry } from './lib/lazy-with-retry';
import { equipSubPage } from './lib/slug';

// ── DIAGNOSTIC: Global error handler fires before React mounts ──
// This ensures ANY crash (module eval, React mount, etc.) shows something.
if (typeof window !== 'undefined') {
  const showFatalError = (msg: string, source?: string) => {
    // Only inject once
    if (document.getElementById('ikan-fatal-error')) return;
    const el = document.createElement('div');
    el.id = 'ikan-fatal-error';
    el.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#F5F5F5;font-family:system-ui,sans-serif;padding:24px;';
    el.innerHTML = `
      <div style="max-width:480px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
        <h2 style="font-size:20px;font-weight:500;color:#151515;margin:0 0 12px;">Something went wrong</h2>
        <p style="font-size:14px;color:#717182;line-height:1.5;margin:0 0 16px;">${msg}</p>
        ${source ? `<p style="font-size:12px;color:#999;word-break:break-all;margin:0 0 16px;">${source}</p>` : ''}
        <button onclick="location.reload()" style="padding:10px 24px;background:#2A2A2A;color:#fff;border:none;border-radius:12px;font-size:14px;cursor:pointer;">Reload App</button>
        <p style="font-size:12px;color:#717182;margin:16px 0 0;">If this keeps happening, try clearing your browser cache.</p>
      </div>
    `;
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
const Dashboard = lazy(() => lazyRetry(() => import('./components/screens/Dashboard').then(m => ({ default: m.Dashboard })), 'Dashboard'));
const Homepage = lazy(() => lazyRetry(() => import('./components/screens/Homepage').then(m => ({ default: m.Homepage })), 'Homepage'));
const NotFound = lazy(() => lazyRetry(() => import('./components/screens/NotFound').then(m => ({ default: m.NotFound })), 'NotFound'));
const LoginScreen = lazy(() => lazyRetry(() => import('./components/LoginScreen').then(m => ({ default: m.default || m.LoginScreen })), 'LoginScreen'));
const ResetPassword = lazy(() => lazyRetry(() => import('./components/screens/ResetPassword').then(m => ({ default: m.default || m.ResetPassword })), 'ResetPassword'));

// --- Lazy loaded screens (split by category) ---

// Assessment screens
const Assessments = lazy(() => lazyRetry(() => import('./components/screens/Assessments').then(m => ({ default: m.Assessments })), 'Assessments'));
const AssessmentDetail = lazy(() => lazyRetry(() => import('./components/screens/AssessmentDetail').then(m => ({ default: m.AssessmentDetail })), 'AssessmentDetail'));
const AssessmentFlow = lazy(() => lazyRetry(() => import('./components/screens/AssessmentFlow').then(m => ({ default: m.AssessmentFlow })), 'AssessmentFlow'));
const AssessmentResults = lazy(() => lazyRetry(() => import('./components/screens/AssessmentResults').then(m => ({ default: m.AssessmentResults })), 'AssessmentResults'));
const AssessmentHistoryDetail = lazy(() => lazyRetry(() => import('./components/screens/AssessmentHistoryDetail').then(m => ({ default: m.AssessmentHistoryDetail })), 'AssessmentHistoryDetail'));

// Equip screens
const EquipPrograms = lazy(() => lazyRetry(() => import('./components/screens/EquipPrograms').then(m => ({ default: m.EquipPrograms })), 'EquipPrograms'));
const EquipDetail = lazy(() => lazyRetry(() => import('./components/screens/EquipDetail').then(m => ({ default: m.EquipDetail })), 'EquipDetail'));
const EquipOnboarding = lazy(() => lazyRetry(() => import('./components/screens/EquipProgramOnboarding').then(m => ({ default: m.EquipOnboarding })), 'EquipOnboarding'));
const EquipProgramFlow = lazy(() => lazyRetry(() => import('./components/screens/EquipProgramFlow').then(m => ({ default: m.EquipProgramFlow })), 'EquipProgramFlow'));
const EquipProgramCompletion = lazy(() => lazyRetry(() => import('./components/screens/EquipProgramCompletion').then(m => ({ default: m.EquipProgramCompletion })), 'EquipProgramCompletion'));

// User screens
const Consultation = lazy(() => lazyRetry(() => import('./components/screens/Consultation').then(m => ({ default: m.Consultation })), 'Consultation'));
const ConsultantDetail = lazy(() => lazyRetry(() => import('./components/screens/ConsultantDetail').then(m => ({ default: m.ConsultantDetail })), 'ConsultantDetail'));
const Library = lazy(() => lazyRetry(() => import('./components/screens/Library').then(m => ({ default: m.Library })), 'Library'));
const Account = lazy(() => lazyRetry(() => import('./components/screens/Account').then(m => ({ default: m.Account })), 'Account'));
const MoodJournal = lazy(() => lazyRetry(() => import('./components/screens/MoodJournal').then(m => ({ default: m.MoodJournal })), 'MoodJournal'));
const ResourceDetail = lazy(() => lazyRetry(() => import('./components/screens/ResourceDetail').then(m => ({ default: m.ResourceDetail })), 'ResourceDetail'));
const ProfessionalApplication = lazy(() => lazyRetry(() => import('./components/screens/ProfessionalApplication').then(m => ({ default: m.ProfessionalApplication })), 'ProfessionalApplication'));
const WellnessTimeline = lazy(() => lazyRetry(() => import('./components/screens/WellnessTimeline').then(m => ({ default: m.WellnessTimeline })), 'WellnessTimeline'));
const LearningDiary = lazy(() => lazyRetry(() => import('./components/screens/LearningDiary').then(m => ({ default: m.LearningDiary })), 'LearningDiary'));

// Static/legal pages
const AboutUs = lazy(() => lazyRetry(() => import('./components/screens/AboutUs').then(m => ({ default: m.AboutUs })), 'AboutUs'));
const FAQ = lazy(() => lazyRetry(() => import('./components/screens/FAQ').then(m => ({ default: m.FAQ })), 'FAQ'));
const PrivacyPolicy = lazy(() => lazyRetry(() => import('./components/screens/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })), 'PrivacyPolicy'));
const TermsOfUse = lazy(() => lazyRetry(() => import('./components/screens/TermsOfUse').then(m => ({ default: m.TermsOfUse })), 'TermsOfUse'));
const ContactUs = lazy(() => lazyRetry(() => import('./components/screens/ContactUs').then(m => ({ default: m.ContactUs })), 'ContactUs'));
const ReturnPolicy = lazy(() => lazyRetry(() => import('./components/screens/ReturnPolicy').then(m => ({ default: m.ReturnPolicy })), 'ReturnPolicy'));
const CancellationPolicy = lazy(() => lazyRetry(() => import('./components/screens/CancellationPolicy').then(m => ({ default: m.CancellationPolicy })), 'CancellationPolicy'));
const Sitemap = lazy(() => lazyRetry(() => import('./components/screens/Sitemap').then(m => ({ default: m.Sitemap })), 'Sitemap'));
const CmsPageRenderer = lazy(() => lazyRetry(() => import('./components/screens/CmsPageRenderer').then(m => ({ default: m.CmsPageRenderer })), 'CmsPageRenderer'));

// Admin screens
const AdminDashboard = lazy(() => lazyRetry(() => import('./components/screens/AdminDashboard').then(m => ({ default: m.AdminDashboard })), 'AdminDashboard'));
const AdminLoginScreen = lazy(() => lazyRetry(() => import('./components/admin/AdminLoginScreen').then(m => ({ default: m.AdminLoginScreen })), 'AdminLoginScreen'));

// --- Eagerly loaded non-screen components ---
import { AdminWidget } from './components/admin/AdminWidget';
import { GoogleFitProvider } from './components/integrations/GoogleFitContext';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { SecurityProvider } from './components/security/SecurityProvider';
import { usePublicSettings } from './hooks/usePublicSettings';
import { CrisisSupport, useCrisisSupport } from './components/safety/CrisisSupport';
import { SafePerformanceMonitor } from './components/monitoring/SafePerformanceMonitor';
import { SkipToMainContent, useReducedMotion } from './components/ui/accessibility-helpers';
import { OfflineBanner } from './components/OfflineBanner';
import { useOfflineSync } from './hooks/useOfflineSync';
import { installBlocksFallbackReporter } from './lib/blocks/block-fallback-reporter';
import { usePullToRefresh } from './hooks/usePullToRefresh';

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
          {siteName || 'iKan'} is down for maintenance
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
  const { user, isInitialized } = useAuth();
  const { settings: publicSettings } = usePublicSettings();
  const { showToast } = useNotifications();
  const { shouldShowPrompt } = usePushPermissionPrompt();
  const { isVisible: isCrisisVisible, triggerReason, hideCrisisSupport } = useCrisisSupport();
  const isMobile = useIsMobile();
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
      // Handle /consultation/:id pattern — extract to /consultation-detail
      if (path.startsWith('/consultation/') && path !== '/consultation/') {
        return '/consultation-detail';
      }
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
  const [consultantId, setConsultantId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/consultation/') && path !== '/consultation/') {
        return path.split('/consultation/')[1];
      }
    }
    return null;
  });
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
    startTransition(() => setCurrentRoute('/login'));
  };

  const handleNavigate = useCallback((route: string, resourceId?: string) => {
    try {
      logger.log('Navigating to:', route, resourceId ? `with resource: ${resourceId}` : '');
      
      if (isMobile) {
        triggerHapticFeedback('light');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      const [path, search] = route.split('?');
      
      const validRoutes = [
        '/', '/dashboard', '/mood-journal', '/assessment', '/assessment-landing', '/assessment-detail', '/assessment-flow', '/assessment-results', '/assessment-history-detail',
        '/equip', '/equip-programs-landing', '/equip-detail', '/equip-program-onboarding', '/equip-program-flow', '/equip-program-completion',
        '/consultation', '/consultation-detail', '/resource', '/resource-detail', '/account', 
        '/about', '/faq', '/privacy', '/privacy-policy', '/terms', '/contact', '/return-policy', '/cancellation-policy', '/sitemap', '/login', '/reset-password',
        '/admin', '/admin/reporting', '/admin/login', '/admin/resources', '/admin/equip', '/admin/equip-analytics', '/admin/users', '/admin/consultants', '/admin/assessments', '/admin/settings', '/admin/pages', '/admin/media', '/admin/contact-newsletter', '/admin/block-type-viewer',
        '/admin/categories', '/admin/checkin-scales', '/admin/recommendations', '/admin/communication', '/admin/payment-gateway', '/admin/kv-audit', '/admin/checkin-builder', '/admin/scoring-engine',
        '/join/professional',
        '/timeline',
        '/learning-diary'
      ];
      
      // Handle consultant detail route pattern
      if (path.startsWith('/consultation/')) {
        const id = path.split('/consultation/')[1];
        setConsultantId(id);
        startTransition(() => setCurrentRoute('/consultation-detail'));
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', route);
        }
        return;
      }

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
  
  // Auth state changes effect
  useEffect(() => {
    if (isInitialized) {
      if (user && currentRoute === '/') {
        startTransition(() => setCurrentRoute(DEFAULT_PRIVATE_ROUTE));
      } 
    }
  }, [user, isInitialized, currentRoute]);

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
      // Handle /consultation/:id pattern on back/forward
      if (path.startsWith('/consultation/') && path !== '/consultation/') {
        const id = path.split('/consultation/')[1];
        setConsultantId(id);
        startTransition(() => setCurrentRoute('/consultation-detail'));
      } else if (path.startsWith('/assessment/') && path !== '/assessment/') {
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
      window.scrollTo({ top: 0 });
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
        
        return (
          <ErrorBoundary>
            <Suspense fallback={<LazyFallback />}>
              <AdminDashboard onNavigate={handleNavigate} initialView={view} />
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
        case '/assessment-landing':
          /**
           * Same screen as `/assessment-detail`, same params.
           *
           * `AssessmentLandingNew` used to render here: a static object with
           * a hardcoded anxiety title, `'5 minutes'`, `'10 questions'` and an
           * instruction promising "You can pause and resume the assessment
           * later" at a time when no draft could be saved at all. It took no
           * id, so it could never show any assessment but the one typed into
           * it. Nothing in the app linked to this route; it stays mapped only
           * so an existing bookmark still lands somewhere real.
           */
          return withSuspense(<AssessmentDetail assessmentId={assessmentSlug || queryParams.id || queryParams.type} onNavigate={handleNavigate} />);
        case '/assessment-detail':
          return withSuspense(<AssessmentDetail assessmentId={assessmentSlug || queryParams.id || queryParams.type} onNavigate={handleNavigate} />);
        case '/assessment-flow':
          return withSuspense(<AssessmentFlow assessmentId={queryParams.id || queryParams.type} onNavigate={handleNavigate} />);
        case '/assessment-results':
          return withSuspense(<AssessmentResults resultId={queryParams.id} onNavigate={handleNavigate} />);
        case '/assessment-history-detail':
          return withSuspense(<AssessmentHistoryDetail onNavigate={handleNavigate} />);
        case '/equip':
        case '/equip-programs-landing':
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
        case '/consultation-detail':
          return withSuspense(<ConsultantDetail onNavigate={handleNavigate} consultantId={consultantId || queryParams.id} />);
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
        case '/sitemap':
          return withSuspense(<Sitemap onNavigate={handleNavigate} />);
        case '/login':
          return withSuspense(<LoginScreen onNavigate={handleNavigate} onSuccess={() => handleNavigate('/dashboard')} />);
        case '/reset-password':
          return withSuspense(<ResetPassword onNavigate={handleNavigate} />);
        case '/join/professional':
          return withSuspense(<ProfessionalApplication onNavigate={handleNavigate} />);
        case '/timeline':
          return withSuspense(<WellnessTimeline onNavigate={handleNavigate} />);
        case '/learning-diary':
          return withSuspense(<LearningDiary equipId={equipSlug || queryParams.id} onNavigate={handleNavigate} />);
        default: {
          // Try CMS page rendering for /page/:slug routes
          if (currentRoute.startsWith('/page/')) {
            const slug = currentRoute.replace('/page/', '');
            if (slug) {
              return withSuspense(<CmsPageRenderer slug={slug} onNavigate={handleNavigate} />);
            }
          }
          return withSuspense(<NotFound onNavigate={handleNavigate} />);
        }
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      return withSuspense(<Dashboard onNavigate={handleNavigate} />);
    }
  };

  const showPublicNav = (!user || currentRoute === '/') && currentRoute !== '/login' && !currentRoute.startsWith('/admin');
  const showPrivateNav = !!user && 
    currentRoute !== '/' && 
    currentRoute !== '/login' && 
    !currentRoute.startsWith('/admin') &&
    !currentRoute.startsWith('/assessment-flow') &&
    !currentRoute.startsWith('/equip-program-flow') &&
    !currentRoute.startsWith('/equip-program-onboarding');
  const shouldShowFooter = currentRoute === '/' ||
                           currentRoute === '/about' ||
                           currentRoute === '/contact' ||
                           currentRoute === '/terms' ||
                           currentRoute === '/privacy' ||
                           currentRoute === '/privacy-policy' ||
                           currentRoute === '/return-policy' ||
                           currentRoute === '/cancellation-policy' ||
                           currentRoute === '/faq' ||
                           currentRoute === '/sitemap' ||
                           currentRoute === '/resource' ||
                           currentRoute === '/assessment-detail' ||
                           currentRoute === '/equip-detail' ||
                           currentRoute.startsWith('/page/');

  const isFullScreenFlow = currentRoute.startsWith('/assessment-flow') ||
                           currentRoute.startsWith('/equip-program-flow') ||
                           currentRoute.startsWith('/equip-program-onboarding') ||
                           currentRoute.startsWith('/equip-program-completion') ||
                           currentRoute.startsWith('/join/');

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
    !user?.is_admin &&
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
      {!isMobile && !isFullScreenFlow && currentRoute !== '/login' && !currentRoute.startsWith('/admin') && (
        <Navigation 
          user={user} 
          onNavigate={handleNavigate} 
          onGetStarted={handleSignIn}
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
      {isMobile && showPublicNav && (
        <PublicBottomNavMobile 
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onSignIn={handleSignIn}
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