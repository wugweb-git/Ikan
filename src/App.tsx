import React, { useState, useEffect, useCallback, lazy, Suspense, useReducer } from 'react';
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

// --- Eagerly loaded core screens (always needed) ---
import { Dashboard } from './components/screens/Dashboard';
import { Homepage } from './components/screens/Homepage';
import { NotFound } from './components/screens/NotFound';
import LoginScreen from './components/LoginScreen';

// --- Lazy loaded screens (split by category) ---

// Assessment screens
const Assessments = lazy(() => import('./components/screens/Assessments').then(m => ({ default: m.Assessments })));
const AssessmentLandingNew = lazy(() => import('./components/screens/AssessmentLandingNew').then(m => ({ default: m.AssessmentLandingNew })));
const AssessmentDetail = lazy(() => import('./components/screens/AssessmentDetail').then(m => ({ default: m.AssessmentDetail })));
const AssessmentFlow = lazy(() => import('./components/screens/AssessmentFlow').then(m => ({ default: m.AssessmentFlow })));
const AssessmentResults = lazy(() => import('./components/screens/AssessmentResults').then(m => ({ default: m.AssessmentResults })));

// Equip screens
const EquipPrograms = lazy(() => import('./components/screens/EquipPrograms').then(m => ({ default: m.EquipPrograms })));
const EquipDetail = lazy(() => import('./components/screens/EquipDetail').then(m => ({ default: m.EquipDetail })));
const EquipOnboarding = lazy(() => import('./components/screens/EquipProgramOnboarding').then(m => ({ default: m.EquipOnboarding })));
const EquipProgramFlow = lazy(() => import('./components/screens/EquipProgramFlow').then(m => ({ default: m.EquipProgramFlow })));
const EquipProgramCompletion = lazy(() => import('./components/screens/EquipProgramCompletion').then(m => ({ default: m.EquipProgramCompletion })));

// User screens
const Consultation = lazy(() => import('./components/screens/Consultation').then(m => ({ default: m.Consultation })));
const ConsultantDetail = lazy(() => import('./components/screens/ConsultantDetail').then(m => ({ default: m.ConsultantDetail })));
const Library = lazy(() => import('./components/screens/Library').then(m => ({ default: m.Library })));
const Account = lazy(() => import('./components/screens/Account').then(m => ({ default: m.Account })));
const MoodJournal = lazy(() => import('./components/screens/MoodJournal').then(m => ({ default: m.MoodJournal })));
const ResourceDetail = lazy(() => import('./components/screens/ResourceDetail').then(m => ({ default: m.ResourceDetail })));
const ProfessionalApplication = lazy(() => import('./components/screens/ProfessionalApplication').then(m => ({ default: m.ProfessionalApplication })));

// Static/legal pages
const AboutUs = lazy(() => import('./components/screens/AboutUs').then(m => ({ default: m.AboutUs })));
const FAQ = lazy(() => import('./components/screens/FAQ').then(m => ({ default: m.FAQ })));
const PrivacyPolicy = lazy(() => import('./components/screens/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfUse = lazy(() => import('./components/screens/TermsOfUse').then(m => ({ default: m.TermsOfUse })));
const ContactUs = lazy(() => import('./components/screens/ContactUs').then(m => ({ default: m.ContactUs })));
const ReturnPolicy = lazy(() => import('./components/screens/ReturnPolicy').then(m => ({ default: m.ReturnPolicy })));
const CancellationPolicy = lazy(() => import('./components/screens/CancellationPolicy').then(m => ({ default: m.CancellationPolicy })));
const Sitemap = lazy(() => import('./components/screens/Sitemap').then(m => ({ default: m.Sitemap })));

// Admin screens
const AdminDashboard = lazy(() => import('./components/screens/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLoginScreen = lazy(() => import('./components/admin/AdminLoginScreen').then(m => ({ default: m.AdminLoginScreen })));

// Dev/internal screens
const UIKitShowcase = lazy(() => import('./components/screens/UIKitShowcase').then(m => ({ default: m.UIKitShowcase })));
const UIKitShowcasePage = lazy(() => import('./components/screens/UIKitShowcasePage').then(m => ({ default: m.UIKitShowcasePage })));
const RouteTestScreen = lazy(() => import('./components/screens/RouteTestScreen').then(m => ({ default: m.RouteTestScreen })));
const PrivateRouteTest = lazy(() => import('./components/screens/PrivateRouteTest').then(m => ({ default: m.PrivateRouteTest })));
const WizardTestScreen = lazy(() => import('./components/screens/WizardTestScreen').then(m => ({ default: m.WizardTestScreen })));

// --- Eagerly loaded non-screen components ---
import { AdminWidget } from './components/admin/AdminWidget';
import { GoogleFitProvider } from './components/integrations/GoogleFitContext';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SecurityProvider } from './components/security/SecurityProvider';
import { CrisisSupport, useCrisisSupport } from './components/safety/CrisisSupport';
import { SafePerformanceMonitor } from './components/monitoring/SafePerformanceMonitor';
import { SkipToMainContent, useReducedMotion } from './components/ui/accessibility-helpers';
import { OfflineBanner } from './components/OfflineBanner';
import { useOfflineSync } from './hooks/useOfflineSync';
import { usePullToRefresh } from './hooks/usePullToRefresh';

// --- Suspense fallback ---
function LazyFallback() {
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
  
  // Pull-to-refresh (extracted hook)
  const handlePullRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast('success', 'Refreshed', 'Content updated successfully');
    window.location.href = window.location.href;
  }, [showToast]);
  
  usePullToRefresh({ enabled: isMobile, onRefresh: handlePullRefresh });
  
  // All state hooks
  const [emergencyRender, setEmergencyRender] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(DEFAULT_PUBLIC_ROUTE);
  const [, forceRender] = useReducer((x: number) => x + 1, 0); // Triggers re-render on init/emergency
  const [resourceDetailId, setResourceDetailId] = useState<string | null>(null);
  const [consultantId, setConsultantId] = useState<string | null>(null);

  const handleSignIn = () => {
    setCurrentRoute('/login');
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
        '/', '/dashboard', '/mood-journal', '/assessment', '/assessment-landing', '/assessment-detail', '/assessment-flow', '/assessment-results',
        '/equip', '/equip-programs-landing', '/equip-detail', '/equip-program-onboarding', '/equip-program-flow', '/equip-program-completion',
        '/consultation', '/consultation-detail', '/resource', '/resource-detail', '/account', 
        '/about', '/faq', '/privacy', '/privacy-policy', '/terms', '/contact', '/return-policy', '/cancellation-policy', '/sitemap', '/login', '/route-test', '/private-route-test', '/wizard-test',
        '/admin', '/admin/login', '/admin/resources', '/admin/equip', '/admin/users', '/admin/consultants', '/admin/assessments', '/admin/analytics', '/admin/settings', '/admin/pages', '/admin/media', '/admin/crud',
        '/join/professional'
      ];
      
      // Handle consultant detail route pattern
      if (path.startsWith('/consultation/')) {
        const id = path.split('/consultation/')[1];
        setConsultantId(id);
        setCurrentRoute('/consultation-detail');
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', route);
        }
        return;
      }
      
      if (!validRoutes.includes(path)) {
        logger.warn('Invalid route:', path, 'redirecting to appropriate default');
        const defaultRoute = user ? DEFAULT_PRIVATE_ROUTE : DEFAULT_PUBLIC_ROUTE;
        setCurrentRoute(defaultRoute);
        setResourceDetailId(null);
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', defaultRoute);
        }
        return;
      }
      
      // setRouteHistory(prev => {
      //   const newHistory = [...prev, path];
      //   return newHistory.slice(-10);
      // });
      
      setCurrentRoute(path);
      
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
      setCurrentRoute('/dashboard');
      setResourceDetailId(null);
    }
  }, [isMobile, user, triggerHapticFeedback]);

  // ALL useEffect HOOKS - CALLED CONSISTENTLY ON EVERY RENDER
  
  // Auth state changes effect
  useEffect(() => {
    if (isInitialized) {
      if (user && currentRoute === '/') {
        setCurrentRoute(DEFAULT_PRIVATE_ROUTE);
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
    logger.log('iKan app starting - immediate mode...');
    forceRender();
    
    const cleanup = setupGlobalErrorHandlers({ showToast });
    
    logger.log('App ready!');
    return cleanup;
  }, []);

  // Emergency fallback effect
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.log('EMERGENCY: App stuck loading - forcing immediate render');
      setEmergencyRender(true);
      forceRender();
    }, 5000);

    if (isInitialized || emergencyRender) {
      clearTimeout(emergencyTimeout);
    }

    return () => clearTimeout(emergencyTimeout);
  }, [isInitialized, emergencyRender]);

  // Popstate handler for browser back/forward button support
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentRoute(path || DEFAULT_PUBLIC_ROUTE);
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

  // Render function
  const renderScreen = () => {
    try {
      if (!currentRoute || typeof currentRoute !== 'string') {
        console.log('Invalid route detected, falling back to default');
        setCurrentRoute(user ? DEFAULT_PRIVATE_ROUTE : DEFAULT_PUBLIC_ROUTE);
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
            handleNavigate('/admin/login');
            return null;
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
      const withSuspense = (component: React.ReactNode) => (
        <ErrorBoundary>
          <Suspense fallback={<LazyFallback />}>{component}</Suspense>
        </ErrorBoundary>
      );

      switch (currentRoute) {
        case '/':
          return <Homepage onNavigate={handleNavigate} onGetStarted={handleSignIn} />;
        case '/dashboard':
          return <Dashboard onNavigate={handleNavigate} />;
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
          return withSuspense(<EquipProgramCompletion onNavigate={handleNavigate} />);
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
          return withSuspense(<MoodJournal onNavigate={handleNavigate} />);
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
          return <LoginScreen onNavigate={handleNavigate} onSuccess={() => handleNavigate('/dashboard')} />;
        case '/route-test':
          return withSuspense(<RouteTestScreen onNavigate={handleNavigate} />);
        case '/private-route-test':
          return withSuspense(<PrivateRouteTest onNavigate={handleNavigate} />);
        case '/wizard-test':
          return withSuspense(<WizardTestScreen onNavigate={handleNavigate} />);
        case '/uikit':
          return withSuspense(<UIKitShowcase onNavigate={handleNavigate} />);
        case '/uikit-page':
          return withSuspense(<UIKitShowcasePage onNavigate={handleNavigate} />);
        case '/join/professional':
          return withSuspense(<ProfessionalApplication onNavigate={handleNavigate} />);
        default:
          return <NotFound onNavigate={handleNavigate} />;
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  const showPublicNav = (!user || currentRoute === '/') && currentRoute !== '/login' && !currentRoute.startsWith('/admin');
  const showPrivateNav = !!user && 
    currentRoute !== '/' && 
    currentRoute !== '/login' && 
    !currentRoute.startsWith('/admin') &&
    !currentRoute.startsWith('/assessment-flow') &&
    !currentRoute.startsWith('/equip-program-flow') &&
    !currentRoute.startsWith('/equip-program-onboarding') &&
    !currentRoute.startsWith('/uikit');
  const shouldShowFooter = currentRoute === '/' || 
                           currentRoute === '/about' || 
                           currentRoute === '/contact' || 
                           currentRoute === '/terms' || 
                           currentRoute === '/privacy' ||
                           currentRoute === '/privacy-policy' ||
                           currentRoute === '/return-policy' ||
                           currentRoute === '/cancellation-policy' ||
                           currentRoute === '/faq' ||
                           currentRoute === '/sitemap';

  const isFullScreenFlow = currentRoute.startsWith('/assessment-flow') ||
                           currentRoute.startsWith('/equip-program-flow') ||
                           currentRoute.startsWith('/equip-program-onboarding') ||
                           currentRoute.startsWith('/equip-program-completion') ||
                           currentRoute.startsWith('/join/');

  const isHeroRoute = shouldShowFooter || 
                      currentRoute === '/' || 
                      currentRoute === '/login' ||
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
      currentRoute === '/login' ? "h-[100dvh] overflow-hidden" : ""
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
          notificationBadges={{
            '/mood-journal': 2,
            '/assessment': 1
          }}
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