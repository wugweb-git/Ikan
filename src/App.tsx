import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTokens } from './lib/react-tokens';
import { useIsMobile } from './hooks/useIsMobile';
import { useMobileOptimizations, useMobileViewport, useMobileKeyboard } from './hooks/useMobileOptimizations';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { JourneyProvider } from './contexts/JourneyContext';
import { TopNavBar } from './components/navigation/TopNavBar';
import { BottomNavBarMobile } from './components/navigation/BottomNavBarMobile';
import { PublicNavBar } from './components/navigation/PublicNavBar';
import { PublicBottomNavMobile } from './components/navigation/PublicBottomNavMobile';
import { RouteGuard } from './components/RouteGuard';
import { isPublicRoute, requiresAuth, DEFAULT_PUBLIC_ROUTE, DEFAULT_PRIVATE_ROUTE, routes } from './lib/route-config';

import { PushPermissionPrompt, usePushPermissionPrompt } from './components/notifications/PushPermissionPrompt';
import { Toaster } from './components/ui/sonner';
import { cn } from './components/ui/utils';
import { apiClient } from './lib/api-client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { logger } from './lib/logger';
import { Heart } from 'lucide-react';
import { LogoIcon } from './components/Logo';
import { Dashboard } from './components/screens/Dashboard';
import { Assessments } from './components/screens/Assessments';
import { EquipPrograms } from './components/screens/EquipPrograms';
import { Consultation } from './components/screens/Consultation';
import { ConsultantDetail } from './components/screens/ConsultantDetail';
import { Library } from './components/screens/Library';
import { Account } from './components/screens/Account';
import { AboutUs } from './components/screens/AboutUs';
import { FAQ } from './components/screens/FAQ';
import { PrivacyPolicy } from './components/screens/PrivacyPolicy';
import { TermsOfUse } from './components/screens/TermsOfUse';
import { ContactUs } from './components/screens/ContactUs';
import { ReturnPolicy } from './components/screens/ReturnPolicy';
import { CancellationPolicy } from './components/screens/CancellationPolicy';
import { Sitemap } from './components/screens/Sitemap';
import { MoodJournal } from './components/screens/MoodJournal';
import { ResourceDetail } from './components/screens/ResourceDetail';
import { PaymentHistory } from './components/screens/PaymentHistory';
import { AssessmentLandingNew } from './components/screens/AssessmentLandingNew';
import { AdminResourceManager } from './components/screens/AdminResourceManager';
import { AdminDashboard } from './components/screens/AdminDashboard';
import { AdminWidget } from './components/admin/AdminWidget';
import { UIKitShowcase } from './components/screens/UIKitShowcase';
import { UIKitShowcasePage } from './components/screens/UIKitShowcasePage';
import { EquipOnboardingDemo } from './components/screens/EquipOnboardingDemo';
import { NotFound } from './components/screens/NotFound';

import { AssessmentFlow } from './components/screens/AssessmentFlow';
import { AssessmentResults } from './components/screens/AssessmentResults';
import { AssessmentDetail } from './components/screens/AssessmentDetail';
import { EquipDetail } from './components/screens/EquipDetail';
import { EquipOnboarding } from './components/screens/EquipProgramOnboarding';
import { EquipProgramFlow } from './components/screens/EquipProgramFlow';
import { EquipProgramCompletion } from './components/screens/EquipProgramCompletion';
import { ProgramView } from './components/screens/ProgramView';
import { Homepage } from './components/screens/Homepage';
import { RouteTestScreen } from './components/screens/RouteTestScreen';
import { PrivateRouteTest } from './components/screens/PrivateRouteTest';
import { WizardTestScreen } from './components/screens/WizardTestScreen';
import { GoogleFitProvider } from './components/integrations/GoogleFitContext';
import { Footer } from './components/Footer';

// Import the AuthForm component that was referenced but not imported
import { AuthForm } from './components/AuthForm';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SecurityProvider } from './components/security/SecurityProvider';
import { CrisisSupport, useCrisisSupport } from './components/safety/CrisisSupport';
import { SafePerformanceMonitor } from './components/monitoring/SafePerformanceMonitor';
import LoginScreen from './components/LoginScreen';
import { AdminLoginScreen } from './components/admin/AdminLoginScreen';

function AppContent() {
  // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
  const { user, loading, isInitialized } = useAuth();
  const { showToast } = useNotifications();
  const { shouldShowPrompt } = usePushPermissionPrompt();
  const { isVisible: isCrisisVisible, triggerReason, showCrisisSupport, hideCrisisSupport } = useCrisisSupport();
  const isMobile = useIsMobile();
  const { triggerHapticFeedback, connectionType, useSwipeGestures } = useMobileOptimizations();
  const { keyboardOpen } = useMobileKeyboard();
  
  // Initialize mobile viewport optimization (this is a hook)
  useMobileViewport();
  
  // All state hooks
  const [emergencyRender, setEmergencyRender] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(DEFAULT_PUBLIC_ROUTE);
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [appReady, setAppReady] = useState(false);
  const [forceReady, setForceReady] = useState(false);
  const [resourceDetailId, setResourceDetailId] = useState<string | null>(null);
  const [consultantId, setConsultantId] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [routeHistory, setRouteHistory] = useState<string[]>([DEFAULT_PUBLIC_ROUTE]);

  // All utility functions (non-hook)
  const getOfflineMode = () => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('ikan-offline-mode') === 'true';
    } catch {
      return false;
    }
  };

  const setOfflineMode = (value: boolean) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ikan-offline-mode', value.toString());
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  const clearAuthState = async () => {
    try {
      logger.log('🧹 Clearing corrupted auth state...');
      await apiClient.signOut();
      if (typeof window !== 'undefined') {
        const authKeys = Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('auth') || key.includes('session')
        );
        authKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            logger.warn('Error clearing localStorage key:', key, error);
          }
        });
      }
      logger.log('✅ Auth state cleared');
    } catch (error) {
      logger.warn('Error clearing auth state:', error);
    }
  };

  const handleSignIn = () => {
    setCurrentRoute('/login');
  };

  // ALL CALLBACK HOOKS - CALLED CONSISTENTLY ON EVERY RENDER
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobile || window.scrollY > 0) return;
    setTouchStartY(e.touches[0].clientY);
  }, [isMobile]);

  const handleTouchMove = useCallback((e: TouchEvent) => {  
    if (!isMobile || window.scrollY > 0 || touchStartY === 0) return;
    
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY;
    const maxDistance = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ikan-pull-refresh-max-distance')) || 150;
    const triggerDistance = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ikan-pull-refresh-trigger-distance')) || 80;
    
    if (distance > 0 && distance < maxDistance) {
      setPullDistance(distance);
      if (distance > triggerDistance) {
        document.documentElement.style.setProperty('--pull-refresh-progress', '1');
      } else {
        document.documentElement.style.setProperty('--pull-refresh-progress', (distance / triggerDistance).toString());
      }
    }
  }, [isMobile, touchStartY]);

  const handleTouchEnd = useCallback(async () => {
    const triggerDistance = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ikan-pull-refresh-trigger-distance')) || 80;
    
    if (!isMobile || pullDistance < triggerDistance) {
      setPullDistance(0);
      setTouchStartY(0);
      document.documentElement.style.removeProperty('--pull-refresh-progress');
      return;
    }

    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('success', 'Refreshed', 'Content updated successfully');
      const currentUrl = window.location.href;
      window.location.href = currentUrl;
    } catch (error) {
      logger.warn('Refresh failed:', error);
      showToast('info', 'Already up to date', 'Your content is current');
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setTouchStartY(0);
      document.documentElement.style.removeProperty('--pull-refresh-progress');
    }
  }, [isMobile, pullDistance, showToast]);

  const getTransitionDirection = useCallback((newRoute: string, oldRoute: string) => {
    const routeOrder = [
      '/', '/about', '/login', '/dashboard', '/mood-journal', 
      '/assessment', '/assessment-landing', '/assessment-detail', '/assessment-flow', '/assessment-results',
      '/equip', '/equip-programs-landing', '/equip-detail', '/equip-program-onboarding', '/equip-program-flow', '/equip-program-completion',
      '/consultation', '/consultation-detail', '/resource', '/resource-detail', '/account'
    ];
    
    const newIndex = routeOrder.indexOf(newRoute);
    const oldIndex = routeOrder.indexOf(oldRoute);
    const isBackNavigation = routeHistory.length > 1 && routeHistory[routeHistory.length - 2] === newRoute;
    
    if (isBackNavigation) return 'backward';
    if (newIndex > oldIndex) return 'forward';
    if (newIndex < oldIndex) return 'backward';
    return 'none';
  }, [routeHistory]);

  const handleNavigate = useCallback((route: string, resourceId?: string) => {
    try {
      logger.log('Navigating to:', route, resourceId ? `with resource: ${resourceId}` : '');
      
      setPreviousRoute(currentRoute);
      
      if (isMobile) {
        triggerHapticFeedback('light');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Parse the route to separate path and query params
      // This is critical for routes with params like /equip-detail?id=123
      const [path, search] = route.split('?');
      
      const validRoutes = [
        '/', '/dashboard', '/mood-journal', '/assessment', '/assessment-landing', '/assessment-detail', '/assessment-flow', '/assessment-results',
        '/equip', '/equip-programs-landing', '/equip-detail', '/equip-program-onboarding', '/equip-program-flow', '/equip-program-completion',
        '/consultation', '/consultation-detail', '/resource', '/resource-detail', '/account', 
        '/about', '/faq', '/privacy', '/privacy-policy', '/terms', '/contact', '/return-policy', '/cancellation-policy', '/sitemap', '/login', '/route-test', '/private-route-test', '/wizard-test',
        '/admin', '/admin/login', '/admin/resources', '/admin/equip', '/admin/users', '/admin/consultants', '/admin/assessments', '/admin/analytics', '/admin/settings', '/admin/pages', '/admin/media', '/admin/crud'
      ];
      
      // Handle consultant detail route pattern
      if (path.startsWith('/consultation/')) {
        const id = path.split('/consultation/')[1];
        setConsultantId(id);
        setCurrentRoute('/consultation-detail');
        setRouteHistory(prev => [...prev, '/consultation-detail']);
        
        // Update URL
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
      
      setRouteHistory(prev => {
        const newHistory = [...prev, path];
        return newHistory.slice(-10);
      });
      
      setCurrentRoute(path);
      
      // Update Browser URL so getQueryParams works
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', route);
      }

      if (path === '/resource-detail' && resourceId) {
        setResourceDetailId(resourceId);
        // Ensure URL reflects the ID if not already there
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
  }, [isMobile, user, triggerHapticFeedback, currentRoute]);

  // ALL useEffect HOOKS - CALLED CONSISTENTLY ON EVERY RENDER
  
  // Auth state changes effect
  useEffect(() => {
    if (isInitialized) {
      // Only redirect logged-in users away from the home page (/) - allow access to other public routes
      if (user && currentRoute === '/') {
        setCurrentRoute(DEFAULT_PRIVATE_ROUTE);
      } 
      // REMOVED: Aggressive redirect for unauthenticated users. 
      // RouteGuard handles this by showing the LoginScreen in-place.
      // This prevents race conditions where a user signs in, navigates to /dashboard, 
      // but the user state update lags slightly behind, causing a bounce back to /.
      /* else if (!user && requiresAuth(currentRoute)) {
        setCurrentRoute(DEFAULT_PUBLIC_ROUTE);
      } */
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
          logger.log('💡 PWA install prompt available');
        });
      }

      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection && connection.effectiveType && connection.effectiveType.includes('2g')) {
          logger.log('📱 Slow connection detected - enabling performance mode');
          document.documentElement.classList.add('slow-connection');
        }
      }
    }
  }, [isMobile]);

  // Mobile touch listeners effect
  useEffect(() => {
    if (!isMobile) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // App initialization effect
  useEffect(() => {
    logger.log('🚀 iKan app starting - immediate mode...');
    
    setAppReady(true);
    setForceReady(true);
    // Don't immediately set offline mode to false - let error handlers manage it
    
    // Global fetch wrapper to catch all network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorString = errorMessage.toLowerCase();
        
        // Check if this is a network-related error
        if (errorString.includes('failed to fetch') || 
            errorString.includes('network error') ||
            errorString.includes('connection refused') ||
            error.name === 'TypeError') {
          logger.log('🌐 Global fetch error intercepted - enabling offline mode:', errorMessage);
          setOfflineMode(true);
          
          // Show user-friendly notification
          if (showToast) {
            showToast('info', 'Working offline', 'Some features may be limited until connection is restored');
          }
        }
        
        // Re-throw error for proper handling
        throw error;
      }
    };
    
    // Cleanup function to restore original fetch
    const restoreFetch = () => {
      window.fetch = originalFetch;
    };
    
    logger.log('✨ App ready immediately!');
    
    // Enhanced global error handler - prevent app crashes
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason) || 'Unknown error';
      const errorString = errorMessage.toLowerCase();
      
      // Always prevent crashes and handle gracefully
      event.preventDefault();
      
      // Comprehensive list of patterns that should trigger offline mode
      const networkErrorPatterns = [
        'failed to fetch',
        'typeerror: failed to fetch',
        'network error',
        'network request failed',
        'connection refused',
        'no internet',
        'cors',
        'net::err_',
        'fetch failed',
        'connection timeout',
        'request timeout',
        'server timeout',
        'load failed'
      ];
      
      // Patterns for CMS/background errors that are normal
      const backgroundErrorPatterns = [
        'getpage',
        'cms content loading failed', 
        'response timed out',
        'message getpage',
        'timed out after',
        '30000ms',
        'cms_timeout',
        'cms page',
        'page fetch',
        'content fetch',
        'id: 3',
        'page content',
        'content sync',
        'cms sync',
        'background sync',
        'auto-refresh',
        'polling failed',
        'background fetch'
      ];
      
      // Check for network errors and enable offline mode
      const isNetworkError = networkErrorPatterns.some(pattern => errorString.includes(pattern));
      const isBackgroundError = backgroundErrorPatterns.some(pattern => errorString.includes(pattern));
      
      if (isNetworkError) {
        console.log('🌐 Network connectivity issue detected - switching to offline mode:', errorMessage);
        setOfflineMode(true);
        // Show user-friendly message instead of error
        if (showToast) {
          showToast('info', 'Working offline', 'Some features may be limited until connection is restored');
        }
        return;
      }
      
      if (isBackgroundError) {
        console.log('🔧 Background/CMS operation failed gracefully (normal):', errorMessage);
        return;
      }
      
      // For any other errors, log them but don't crash
      console.log('🔧 Unhandled promise rejection caught and handled:', errorMessage);
    };
    
    // Enhanced window error handler
    const handleWindowError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.message || 'Unknown error';
      const errorString = errorMessage.toLowerCase();
      
      // Always prevent default and handle gracefully
      event.preventDefault();
      
      // Check for network-related window errors
      const networkErrorPatterns = [
        'failed to fetch',
        'network error',
        'connection refused',
        'cors',
        'net::err_'
      ];
      
      const isNetworkError = networkErrorPatterns.some(pattern => errorString.includes(pattern));
      
      if (isNetworkError) {
        console.log('🌐 Network error in window handler - enabling offline mode:', errorMessage);
        setOfflineMode(true);
        return false;
      }
      
      // All other errors are handled gracefully
      console.log('🔧 Window error handled gracefully:', errorMessage);
      return false;
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleWindowError);
    
    // Additional handler for message-based errors
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        const message = event.data;
        if (message.error || message.timeout || (message.type && message.type.includes('timeout'))) {
          console.log('🔧 Message-based error handled gracefully:', message);
          event.preventDefault?.();
          event.stopPropagation?.();
          return false;
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Console error override to suppress specific error types
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args) => {
      const errorStr = args.join(' ').toLowerCase();
      
      // Comprehensive CMS and timeout error suppression
      const suppressedPatterns = [
        'getpage',
        'message getpage',
        'id: 3',
        'timed out after',
        'response timed out',
        '30000ms',
        'cms_timeout',
        'cms content loading',
        'page fetch',
        'content fetch',
        'background sync',
        'auto-refresh',
        'polling failed'
      ];
      
      const shouldSuppress = suppressedPatterns.some(pattern => errorStr.includes(pattern));
      
      if (shouldSuppress || (errorStr.includes('message') && errorStr.includes('timeout'))) {
        console.log('🔧 Console error suppressed (CMS timeout):', ...args);
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const warnStr = args.join(' ').toLowerCase();
      
      // Also suppress warnings for the same patterns
      const suppressedPatterns = [
        'getpage',
        'message getpage',
        'id: 3',
        'timed out after',
        'response timed out',
        '30000ms',
        'cms_timeout',
        'cms content loading'
      ];
      
      const shouldSuppress = suppressedPatterns.some(pattern => warnStr.includes(pattern));
      
      if (shouldSuppress) {
        console.log('🔧 Console warning suppressed (CMS timeout):', ...args);
        return;
      }
      originalConsoleWarn.apply(console, args);
    };
    
    // Optional background health check - don't block app startup
    setTimeout(() => {
      // Wrap all background operations in comprehensive error handling
      Promise.resolve()
        .then(() => apiClient.healthCheck())
        .then(async () => {
          console.log('✅ Server available');
          setOfflineMode(false);
        })
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(`📦 Using offline mode due to health check failure: ${errorMessage}`);
          setOfflineMode(true);
          
          // Additional handling for specific fetch failures
          if (errorMessage.toLowerCase().includes('failed to fetch') || error.name === 'TypeError') {
            console.log('🌐 Network connectivity issue detected - running in offline mode');
          }
        });
    }, 2000);
    
    console.log('✨ App ready!');
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('message', handleMessage);
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      restoreFetch(); // Restore original fetch
    };
  }, []);

  // Emergency fallback effect
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.log('🚨 EMERGENCY: App stuck loading - forcing immediate render');
      setEmergencyRender(true);
      setAppReady(true);
      setForceReady(true);
    }, 5000);

    if (isInitialized || emergencyRender) {
      clearTimeout(emergencyTimeout);
    }

    return () => clearTimeout(emergencyTimeout);
  }, [isInitialized, emergencyRender]);

  // Render function
  const renderScreen = () => {
    // Safe rendering with proper error handling
    try {
      // Add additional protection against route-related errors
      if (!currentRoute || typeof currentRoute !== 'string') {
        console.log('🔧 Invalid route detected, falling back to default');
        setCurrentRoute(user ? DEFAULT_PRIVATE_ROUTE : DEFAULT_PUBLIC_ROUTE);
        return null;
      }

      // Helper to extract query parameters
      const getQueryParams = () => {
        if (typeof window === 'undefined') return {};
        const search = window.location.search;
        return Object.fromEntries(new URLSearchParams(search));
      };
      
      const queryParams = getQueryParams();

      // Check for Admin Routes first
      if (currentRoute.startsWith('/admin')) {
        // Special case for login
        if (currentRoute === '/admin/login') {
            return (
              <ErrorBoundary>
                <AdminLoginScreen 
                    onNavigate={handleNavigate} 
                    onLoginSuccess={() => handleNavigate('/admin')} 
                />
              </ErrorBoundary>
            );
        }

        // Auth Check for Admin
        if (!user) {
            handleNavigate('/admin/login');
            return null;
        }

        const adminPath = currentRoute.replace('/admin/', '');
        const view = currentRoute === '/admin' ? 'dashboard' : adminPath;
        
        return (
          <ErrorBoundary>
            <AdminDashboard onNavigate={handleNavigate} initialView={view} />
          </ErrorBoundary>
        );
      }

      switch (currentRoute) {
        case '/':
          return <Homepage onNavigate={handleNavigate} onGetStarted={handleSignIn} />;
        case '/dashboard':
          return <Dashboard onNavigate={handleNavigate} />;
        case '/assessment':
          return <Assessments onNavigate={handleNavigate} />;
        case '/assessment-landing':
          return <AssessmentLandingNew onNavigate={handleNavigate} />;
        case '/assessment-detail':
          return <AssessmentDetail assessmentId={queryParams.id || queryParams.type} onNavigate={handleNavigate} />;
        case '/assessment-flow':
          return <AssessmentFlow assessmentId={queryParams.id || queryParams.type} onNavigate={handleNavigate} />;
        case '/assessment-results':
          return <AssessmentResults onNavigate={handleNavigate} />;
        case '/equip':
          return <EquipPrograms onNavigate={handleNavigate} />;
        case '/equip-programs-landing':
          return <EquipPrograms onNavigate={handleNavigate} />;
        case '/equip-detail':
          return <EquipDetail equipId={queryParams.id} onNavigate={handleNavigate} />;
        case '/equip-program-onboarding':
          return <EquipOnboarding programId={queryParams.id} onNavigate={handleNavigate} />;
        case '/equip-program-flow':
          return <EquipProgramFlow programId={queryParams.id} onNavigate={handleNavigate} />;
        case '/equip-program-completion':
          return <EquipProgramCompletion onNavigate={handleNavigate} />;
        case '/consultation':
          return <Consultation onNavigate={handleNavigate} />;
        case '/consultation-detail':
          return <ConsultantDetail onNavigate={handleNavigate} consultantId={consultantId || queryParams.id} />;
        case '/resource':
          return <Library onNavigate={handleNavigate} />;
        case '/resource-detail':
          return <ResourceDetail onNavigate={handleNavigate} resourceId={resourceDetailId || queryParams.id} />;
        case '/account':
          return <Account onNavigate={handleNavigate} />;
        case '/mood-journal':
          return <MoodJournal onNavigate={handleNavigate} />;
        case '/about':
          return <AboutUs onNavigate={handleNavigate} />;
        case '/faq':
          return <FAQ onNavigate={handleNavigate} />;
        case '/privacy':
        case '/privacy-policy':
          return <PrivacyPolicy onNavigate={handleNavigate} />;
        case '/terms':
          return <TermsOfUse onNavigate={handleNavigate} />;
        case '/contact':
          return <ContactUs onNavigate={handleNavigate} />;
        case '/return-policy':
          return <ReturnPolicy onNavigate={handleNavigate} />;
        case '/cancellation-policy':
          return <CancellationPolicy onNavigate={handleNavigate} />;
        case '/sitemap':
          return <Sitemap onNavigate={handleNavigate} />;
        case '/login':
          return <LoginScreen onNavigate={handleNavigate} onSuccess={() => handleNavigate('/dashboard')} />;
        case '/route-test':
          return <RouteTestScreen onNavigate={handleNavigate} />;
        case '/private-route-test':
          return <PrivateRouteTest onNavigate={handleNavigate} />;
        case '/wizard-test':
          return <WizardTestScreen onNavigate={handleNavigate} />;
        case '/uikit':
          return <UIKitShowcase onNavigate={handleNavigate} />;
        case '/uikit-page':
          return <UIKitShowcasePage onNavigate={handleNavigate} />;
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

  return (
    <div className={cn(
      "flex flex-col min-h-[100dvh] bg-background font-sans antialiased text-foreground",
      currentRoute === '/login' ? "h-[100dvh] overflow-hidden" : ""
    )}>
      {/* Top Navigation */}
      {!isMobile && currentRoute !== '/login' && !currentRoute.startsWith('/admin') && (
        <div className="sticky top-0 z-40 w-full bg-white border-b border-border-light">
          {user && currentRoute !== '/' ? (
            <TopNavBar currentRoute={currentRoute} onNavigate={handleNavigate} />
          ) : (
            <PublicNavBar currentRoute={currentRoute} onNavigate={handleNavigate} onSignIn={handleSignIn} />
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <div className={cn(
          "w-full h-full",
          // Add padding for mobile bottom nav if visible
          // Using 96px (pb-24) to ensure content clears the floating bottom nav
          isMobile && showPrivateNav ? "pb-24" : ""
        )}>
          <RouteGuard currentRoute={currentRoute} onNavigate={handleNavigate}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentRoute}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
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
        // Removed richColors to align with design system (cleaner look)
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
  // Initialize iKan design tokens
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
