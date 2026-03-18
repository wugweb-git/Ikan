import React, { useState, useEffect, useCallback, lazy, Suspense, startTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

// --- Lazy loaded screens (split by category) ---

// Assessment screens
const Assessments = lazy(() => lazyRetry(() => import('./components/screens/Assessments').then(m => ({ default: m.Assessments })), 'Assessments'));
const AssessmentLandingNew = lazy(() => lazyRetry(() => import('./components/screens/AssessmentLandingNew').then(m => ({ default: m.AssessmentLandingNew })), 'AssessmentLandingNew'));
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
import { CrisisSupport, useCrisisSupport } from './components/safety/CrisisSupport';
import { SafePerformanceMonitor } from './components/monitoring/SafePerformanceMonitor';
import { SkipToMainContent, useReducedMotion } from './components/ui/accessibility-helpers';
import { OfflineBanner } from './components/OfflineBanner';
import { useOfflineSync } from './hooks/useOfflineSync';
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

function AppContent() {
  // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
  const { user, isInitialized } = useAuth();
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
        '/about', '/faq', '/privacy', '/privacy-policy', '/terms', '/contact', '/return-policy', '/cancellation-policy', '/sitemap', '/login',
        '/admin', '/admin/login', '/admin/resources', '/admin/equip', '/admin/users', '/admin/consultants', '/admin/assessments', '/admin/analytics', '/admin/settings', '/admin/pages', '/admin/media', '/admin/crud', '/admin/contact-newsletter',
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
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
        );
      }

      const addInputListeners = () => {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.addEventListener('focusin', () => {
            if (viewport) {
              viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
              );
            }
          });
          input.addEventListener('focusout', () => {
            if (viewport) {
              viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
              );
            }
          });
        });
      };

      setTimeout(addInputListeners, 100);

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
      } else {
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
    const withSuspense = (component: React.ReactNode) => (
      <ErrorBoundary>
        <Suspense fallback={<LazyFallback />}>{component}</Suspense>
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
        const view = currentRoute === '/admin' ? 'dashboard' : adminPath;
        
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
          return withSuspense(<AssessmentLandingNew onNavigate={handleNavigate} />);
        case '/assessment-detail':
          return withSuspense(<AssessmentDetail assessmentId={queryParams.id || queryParams.type} onNavigate={handleNavigate} />);
        case '/assessment-flow':
          return withSuspense(<AssessmentFlow assessmentId={queryParams.id || queryParams.type} onNavigate={handleNavigate} />);
        case '/assessment-results':
          return withSuspense(<AssessmentResults onNavigate={handleNavigate} />);
        case '/assessment-history-detail':
          return withSuspense(<AssessmentHistoryDetail onNavigate={handleNavigate} />);
        case '/equip':
        case '/equip-programs-landing':
          return withSuspense(<EquipPrograms onNavigate={handleNavigate} />);
        case '/equip-detail':
          return withSuspense(<EquipDetail equipId={queryParams.id} onNavigate={handleNavigate} />);
        case '/equip-program-onboarding':
          return withSuspense(<EquipOnboarding programId={queryParams.id} onNavigate={handleNavigate} />);
        case '/equip-program-flow':
          return withSuspense(<EquipProgramFlow programId={queryParams.id} onNavigate={handleNavigate} />);
        case '/equip-program-completion':
          return withSuspense(<EquipProgramCompletion programId={queryParams.id} onNavigate={handleNavigate} />);
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
          return (
            <ErrorBoundary>
              <ChunkErrorBoundary chunkName="Mood Journal" onRetry={() => handleNavigate('/mood-journal')}>
                <Suspense fallback={<LazyFallback />}>
                  <MoodJournal onNavigate={handleNavigate} />
                </Suspense>
              </ChunkErrorBoundary>
            </ErrorBoundary>
          );
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
        case '/join/professional':
          return withSuspense(<ProfessionalApplication onNavigate={handleNavigate} />);
        case '/timeline':
          return withSuspense(<WellnessTimeline onNavigate={handleNavigate} />);
        case '/learning-diary':
          return withSuspense(<LearningDiary equipId={queryParams.id} onNavigate={handleNavigate} />);
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

export default function App() {
  useTokens();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <PaymentProvider>
            <JourneyProvider>
              <GoogleFitProvider>
                <SecurityProvider>
                  <AppContent />
                </SecurityProvider>
              </GoogleFitProvider>
            </JourneyProvider>
          </PaymentProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}