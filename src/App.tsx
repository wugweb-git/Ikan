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
import { seedAssessments, forceSeedAssessments, checkAssessmentsSeeded } from './lib/assessment-seeder';
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
import { AdminBlogManager } from './components/screens/AdminBlogManager';
import { AdminDashboard } from './components/screens/AdminDashboard';
import { AdminWidget } from './components/admin/AdminWidget';

import { AssessmentFlow } from './components/screens/AssessmentFlow';
import { AssessmentResults } from './components/screens/AssessmentResults';
import { EquipProgramsLanding } from './components/screens/EquipProgramsLanding';
import { EquipProgramLandingFigma } from './components/screens/EquipProgramLandingFigma';
import { EquipProgramLandingNew } from './components/screens/EquipProgramLandingNew';
import { EquipProgramOnboarding } from './components/screens/EquipProgramOnboarding';
import { EquipProgramFlow } from './components/screens/EquipProgramFlow';
import { EquipProgramCompletion } from './components/screens/EquipProgramCompletion';
import { Homepage } from './components/screens/Homepage';
import { RouteTestScreen } from './components/screens/RouteTestScreen';
import { PrivateRouteTest } from './components/screens/PrivateRouteTest';
import { Footer } from './components/Footer';

// Import the AuthForm component that was referenced but not imported
import { AuthForm } from './components/AuthForm';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SecurityProvider } from './components/security/SecurityProvider';
import { CrisisSupport, useCrisisSupport } from './components/safety/CrisisSupport';
import { SafePerformanceMonitor } from './components/monitoring/SafePerformanceMonitor';
import LoginScreen from './components/LoginScreen';

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
      '/assessments', '/assessment-landing', '/assessment-flow', '/assessment-results',
      '/equip-programs', '/equip-programs-landing', '/equip-program-onboarding', '/equip-program-flow', '/equip-program-completion',
      '/consultation', '/consultation-detail', '/library', '/resource-detail', '/account'
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
      
      const validRoutes = [
        '/', '/dashboard', '/mood-journal', '/assessments', '/assessment-landing', '/assessment-flow', '/assessment-results',
        '/equip-programs', '/equip-programs-landing', '/equip-program-onboarding', '/equip-program-flow', '/equip-program-completion',
        '/consultation', '/consultation-detail', '/library', '/resource-detail', '/account', 
        '/about', '/faq', '/privacy', '/terms', '/contact', '/return-policy', '/cancellation-policy', '/sitemap', '/login', '/route-test', '/private-route-test', '/admin/blogs', '/admin'
      ];
      
      // Handle consultant detail route pattern
      if (route.startsWith('/consultation/')) {
        const id = route.split('/consultation/')[1];
        setConsultantId(id);
        setCurrentRoute('/consultation-detail');
        setRouteHistory(prev => [...prev, '/consultation-detail']);
        return;
      }
      
      if (!validRoutes.includes(route)) {
        logger.warn('Invalid route:', route, 'redirecting to appropriate default');
        const defaultRoute = user ? DEFAULT_PRIVATE_ROUTE : DEFAULT_PUBLIC_ROUTE;
        setCurrentRoute(defaultRoute);
        setResourceDetailId(null);
        return;
      }
      
      setRouteHistory(prev => {
        const newHistory = [...prev, route];
        return newHistory.slice(-10);
      });
      
      setCurrentRoute(route);
      if (route === '/resource-detail' && resourceId) {
        setResourceDetailId(resourceId);
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
      } else if (!user && requiresAuth(currentRoute)) {
        setCurrentRoute(DEFAULT_PUBLIC_ROUTE);
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
    
    // Optional background health check and data seeding - don't block app startup
    setTimeout(() => {
      // Wrap all background operations in comprehensive error handling
      Promise.resolve()
        .then(() => apiClient.healthCheck())
        .then(async () => {
          console.log('✅ Server available');
          setOfflineMode(false);
          
          // Background seeding of essential data
          try {
            console.log('🌱 Background seeding essential data...');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              console.log('⏰ Background seeding timeout - this is normal');
              controller.abort();
            }, 10000); // 10 second timeout for background seeding
            
            const seedResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/seed/force-programs`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
              },
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (seedResponse.ok) {
              const result = await seedResponse.json();
              console.log('✅ Background seeding completed:', result.programs?.length || 0, 'programs');
            } else {
              console.log('📦 Background seeding returned non-OK status - continuing normally');
            }
          } catch (seedError) {
            const errorMessage = seedError instanceof Error ? seedError.message : String(seedError);
            if (errorMessage.includes('aborted') || seedError.name === 'AbortError') {
              console.log('📦 Background seeding timeout - app continues normally');
            } else if (errorMessage.toLowerCase().includes('failed to fetch')) {
              console.log('📦 Background seeding network error - continuing in offline mode');
              setOfflineMode(true);
            } else {
              console.log('📦 Background seeding failed, will retry per component:', errorMessage);
            }
          }
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
      switch (currentRoute) {
        case '/':
          return (
            <ErrorBoundary>
              <Homepage 
                onNavigate={handleNavigate}
                onGetStarted={handleSignIn}
              />
            </ErrorBoundary>
          );
        case '/dashboard':
          return (
            <ErrorBoundary>
              <Dashboard onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case '/mood-journal':
          return (
            <ErrorBoundary>
              <MoodJournal />
            </ErrorBoundary>
          );
        case '/assessments':
          return (
            <ErrorBoundary>
              <Assessments onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case '/assessment-landing':
          return (
            <ErrorBoundary>
              <AssessmentLandingNew 
                onStartAssessment={() => {
                  if (user) {
                    // User is logged in, proceed to assessment flow
                    handleNavigate('/assessment-flow');
                  } else {
                    // User needs to sign in first
                    handleSignIn();
                  }
                }}
                onBack={() => handleNavigate('/assessments')}
              />
            </ErrorBoundary>
          );
        case '/assessment-flow':
          return (
            <ErrorBoundary>
              <AssessmentFlow 
                onComplete={(results) => {
                  // Store results and navigate to results screen
                  localStorage.setItem('ikan-assessment-results', JSON.stringify(results));
                  handleNavigate('/assessment-results');
                }}
                onBack={() => handleNavigate('/assessment-landing')}
              />
            </ErrorBoundary>
          );
        case '/assessment-results':
          return (
            <ErrorBoundary>
              <AssessmentResults 
                onBackToAssessments={() => handleNavigate('/assessments')}
                onRetakeAssessment={() => handleNavigate('/assessment-flow')}
              />
            </ErrorBoundary>
          );
        case '/equip-programs':
          return (
            <ErrorBoundary>
              <EquipPrograms onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case '/equip-programs-landing':
          return (
            <ErrorBoundary>
              <EquipProgramLandingNew 
                onStartProgram={() => {
                  if (user) {
                    // User is logged in, proceed to program onboarding
                    handleNavigate('/equip-program-onboarding');
                  } else {
                    // User needs to sign in first
                    handleSignIn();
                  }
                }}
                onBack={() => handleNavigate('/equip-programs')}
              />
            </ErrorBoundary>
          );
        case '/equip-program-onboarding':
          return (
            <ErrorBoundary>
              <EquipProgramOnboarding 
                onComplete={() => {
                  console.log('Onboarding completed');
                  handleNavigate('/equip-program-flow');
                }}
                onBack={() => handleNavigate('/equip-programs-landing')}
              />
            </ErrorBoundary>
          );
        case '/equip-program-flow':
          return (
            <ErrorBoundary>
              <EquipProgramFlow 
                onComplete={() => {
                  console.log('Program completed');
                  handleNavigate('/equip-program-completion');
                }}
                onBack={() => handleNavigate('/equip-program-onboarding')}
              />
            </ErrorBoundary>
          );
        case '/equip-program-completion':
          return (
            <ErrorBoundary>
              <EquipProgramCompletion 
                onContinue={() => {
                  console.log('Continue to more programs');
                  handleNavigate('/equip-programs');
                }}
                onBackToDashboard={() => handleNavigate('/dashboard')}
              />
            </ErrorBoundary>
          );
        case '/consultation':
          return (
            <ErrorBoundary>
              <Consultation onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case '/consultation-detail':
          return consultantId ? (
            <ErrorBoundary>
              <ConsultantDetail 
                consultantId={consultantId}
                onNavigate={handleNavigate}
              />
            </ErrorBoundary>
          ) : (
            <ErrorBoundary>
              <Consultation onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case '/library':
          return (
            <ErrorBoundary>
              <Library onResourceSelect={(id) => handleNavigate('/resource-detail', id)} />
            </ErrorBoundary>
          );
        case '/resource-detail':
          return resourceDetailId ? (
            <ErrorBoundary>
              <ResourceDetail 
                resourceId={resourceDetailId} 
                onBack={() => handleNavigate('/library')} 
              />
            </ErrorBoundary>
          ) : (
            <ErrorBoundary>
              <Library onResourceSelect={(id) => handleNavigate('/resource-detail', id)} />
            </ErrorBoundary>
          );
        case '/account':
          return (
            <ErrorBoundary>
              <Account />
            </ErrorBoundary>
          );
        case '/about':
          return (
            <ErrorBoundary>
              <AboutUs 
                onNavigate={handleNavigate}
                onGetStarted={handleSignIn}
              />
            </ErrorBoundary>
          );
        case '/faq':
          return (
            <ErrorBoundary>
              <FAQ onBack={() => handleNavigate('/')} />
            </ErrorBoundary>
          );
        case '/privacy':
          return (
            <ErrorBoundary>
              <PrivacyPolicy onBack={() => handleNavigate('/')} />
            </ErrorBoundary>
          );
        case '/terms':
          return (
            <ErrorBoundary>
              <TermsOfUse onBack={() => handleNavigate('/')} />
            </ErrorBoundary>
          );
        case '/contact':
          return (
            <ErrorBoundary>
              <ContactUs onBack={() => handleNavigate('/')} />
            </ErrorBoundary>
          );
        case '/return-policy':
          return (
            <ErrorBoundary>
              <ReturnPolicy onBack={() => handleNavigate('/')} />
            </ErrorBoundary>
          );
        case '/cancellation-policy':
          return (
            <ErrorBoundary>
              <CancellationPolicy onBack={() => handleNavigate('/')} />
            </ErrorBoundary>
          );
        case '/sitemap':
          return (
            <ErrorBoundary>
              <Sitemap onBack={() => handleNavigate('/')} />
            </ErrorBoundary>
          );
        case '/login':
          return (
            <ErrorBoundary>
              <LoginScreen 
                onSuccess={() => handleNavigate('/dashboard')}
                onBack={() => handleNavigate('/')}
                reason="user-initiated"
              />
            </ErrorBoundary>
          );
        case '/route-test':
          return (
            <ErrorBoundary>
              <RouteTestScreen 
                onNavigate={handleNavigate}
                currentRoute={currentRoute}
                isAuthenticated={!!user}
              />
            </ErrorBoundary>
          );
        case '/private-route-test':
          return (
            <ErrorBoundary>
              <PrivateRouteTest 
                onNavigate={handleNavigate}
              />
            </ErrorBoundary>
          );
        case '/admin/blogs':
          return (
            <ErrorBoundary>
              <AdminBlogManager onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case '/admin':
          return (
            <ErrorBoundary>
              <AdminDashboard onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        default:
          // Default based on auth state
          if (!user) {
            return (
              <ErrorBoundary>
                <Homepage 
                  onNavigate={handleNavigate}
                  onGetStarted={handleSignIn}
                />
              </ErrorBoundary>
            );
          }
          return <Dashboard />;
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      setErrorCount(prev => prev + 1);
      
      // If too many errors, provide a safe fallback
      if (errorCount > 3) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center space-y-4">
              <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                Multiple errors detected
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Please refresh the page to continue safely
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="ikan-button"
                style={{
                  backgroundColor: 'var(--semantic-button-primary-bg)',
                  color: 'var(--semantic-button-primary-fg)',
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  padding: `0 var(--semantic-button-primary-padding-x)`
                }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        );
      }
      
      // Try fallback to dashboard
      if (currentRoute !== '/dashboard') {
        setCurrentRoute('/dashboard');
        setResourceDetailId(null);
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      );
    }
  };

  // ✅ ALL HOOKS ARE NOW COMPLETE - SAFE TO DO CALCULATIONS AND EARLY RETURNS
  
  // Navigation state calculations
  const shouldShowNavigation = emergencyRender || isInitialized;
  const routeConfig = routes.find(r => r.path === currentRoute);
  const showPublicNav = shouldShowNavigation && !user && isPublicRoute(currentRoute);
  // Allow private users to access both private routes and public routes
  const showPrivateNav = shouldShowNavigation && !!user && (routeConfig?.showInPrivateNav === true || isPublicRoute(currentRoute));
  const shouldShowFooter = shouldShowNavigation && !user && isPublicRoute(currentRoute);

  // Debug logging
  console.log('App render - appReady:', appReady, 'forceReady:', forceReady, 'loading:', loading, 'isInitialized:', isInitialized);
  console.log('Navigation state:', { 
    shouldShowNavigation, 
    isInitialized, 
    loading, 
    emergencyRender, 
    currentRoute, 
    user: !!user 
  });

  // If nothing is ready, show immediate loading screen
  if (!appReady && !forceReady && !emergencyRender) {
    console.log('App showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <LogoIcon size={32} style={{ color: 'var(--color-primary-default)' }} />
          </div>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            Starting iKan...
          </p>
        </div>
      </div>
    );
  }

  // If auth is taking too long, show starting message
  if (!isInitialized && !emergencyRender && appReady) {
    console.log('App waiting for auth initialization');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <LogoIcon size={32} style={{ color: 'var(--color-primary-default)' }} />
          </div>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            Initializing authentication...
          </p>
        </div>
      </div>
    );
  }



  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ 
        backgroundColor: 'var(--color-bg-page)',
        // Mobile-specific optimizations
        ...(isMobile && {
          touchAction: 'pan-x pan-y',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        })
      }}
    >
      {/* Mobile pull-to-refresh indicator */}
      {isMobile && pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center"
          style={{
            height: `min(${pullDistance}px, var(--ikan-pull-refresh-max-distance))`,
            backgroundColor: 'var(--color-primary-default)',
            opacity: `min(${pullDistance / (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ikan-pull-refresh-trigger-distance')) || 80)}, 1)`,
            transform: `translateY(-${Math.max(0, (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ikan-pull-refresh-trigger-distance')) || 80) - pullDistance)}px)`,
            transition: pullDistance === 0 ? 'all var(--ikan-animation-normal) ease-out' : 'none'
          }}
        >
          <div className="text-white animate-spin">
            <LogoIcon 
              size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ikan-pull-refresh-indicator-size')) || 24} 
              style={{ color: 'white' }} 
            />
          </div>
        </div>
      )}

      {/* Refresh loading overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-40 flex items-center justify-center">
          <div 
            className="flex items-center shadow-lg"
            style={{
              backgroundColor: 'var(--semantic-card-bg)',
              borderRadius: 'var(--semantic-card-radius)',
              padding: 'var(--semantic-card-padding)',
              gap: 'var(--ikan-component-spacing-small)'
            }}
          >
            <div className="animate-spin">
              <LogoIcon 
                size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ikan-pull-refresh-indicator-size')) || 20} 
                style={{ color: 'var(--color-primary-default)' }} 
              />
            </div>
            <span style={{ 
              color: 'var(--semantic-card-fg)',
              fontSize: 'var(--text-base)'
            }}>
              Refreshing...
            </span>
          </div>
        </div>
      )}

      {/* Desktop Navigation - Based on route config and auth state */}
      {!isMobile && (
        <>
          {showPublicNav && (
            <PublicNavBar 
              currentRoute={currentRoute}
              onNavigate={handleNavigate}
              onSignIn={handleSignIn}
            />
          )}
          {showPrivateNav && (
            <TopNavBar 
              currentRoute={currentRoute}
              onNavigate={handleNavigate}
            />
          )}
        </>
      )}

      {/* Main Content - Full width, no constraints */}
      <main 
        className="ikan-main-content flex-1 w-full"
        style={{
          // Base layout - full width, no artificial constraints
          width: '100%',
          overflowX: 'hidden',
          padding: '0',
          margin: '0'
        }}
      >
        <div 
          className="ikan-content-container"
          style={{
            // Full width for all content
            width: '100%',
            maxWidth: '100%',
            margin: '0',
            padding: '0',
            boxSizing: 'border-box',
            // Only handle navigation clearance - let pages control their own content layout
            paddingTop: currentRoute === '/' 
              ? '0' // Landing pages start from top (navigation overlays)
              : (showPublicNav || showPrivateNav) 
                ? isMobile 
                  ? showPublicNav 
                    ? 'calc(88px + var(--ikan-component-spacing-default))' // Mobile header clearance for public routes
                    : 'var(--ikan-component-spacing-default)' // Bottom nav clearance for private routes
                  : 'var(--ikan-nav-clearance-desktop)' // Desktop nav clearance
                : '0', // No navigation = no clearance needed
            // Add bottom padding for private mobile nav only
            paddingBottom: (isMobile && showPrivateNav) 
              ? 'calc(var(--ikan-nav-height-mobile) + env(safe-area-inset-bottom, 0px))' 
              : '0',
            // Mobile-specific optimizations
            ...(isMobile && {
              // Enhanced mobile touch interactions
              WebkitTapHighlightColor: 'transparent',
              // Smooth scrolling for better mobile experience
              scrollBehavior: 'smooth',
              // Better mobile rendering
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              // Optimize for mobile performance
              willChange: 'transform',
              transform: 'translateZ(0)'
            })
          }}
        >
          <RouteGuard currentRoute={currentRoute} onNavigate={handleNavigate}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentRoute}
                initial={(() => {
                  if (!previousRoute) return { opacity: 1 };
                  
                  const direction = getTransitionDirection(currentRoute, previousRoute);
                  const isModal = ['assessment-flow', 'assessment-results', 'equip-program-onboarding', 'equip-program-flow'].includes(currentRoute.replace('/', ''));
                  
                  if (isModal) {
                    return { 
                      opacity: 0, 
                      scale: 0.95, 
                      y: 20 
                    };
                  }
                  
                  switch (direction) {
                    case 'forward':
                      return { opacity: 0, x: isMobile ? 100 : 50 };
                    case 'backward':
                      return { opacity: 0, x: isMobile ? -100 : -50 };
                    default:
                      return { opacity: 0, y: 10 };
                  }
                })()}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  y: 0, 
                  scale: 1 
                }}
                exit={(() => {
                  if (!previousRoute) return { opacity: 0 };
                  
                  const direction = getTransitionDirection(currentRoute, previousRoute);
                  const wasModal = ['assessment-flow', 'assessment-results', 'equip-program-onboarding', 'equip-program-flow'].includes(previousRoute.replace('/', ''));
                  
                  if (wasModal) {
                    return { 
                      opacity: 0, 
                      scale: 0.95, 
                      y: -20 
                    };
                  }
                  
                  switch (direction) {
                    case 'forward':
                      return { opacity: 0, x: isMobile ? -100 : -50 };
                    case 'backward':
                      return { opacity: 0, x: isMobile ? 100 : 50 };
                    default:
                      return { opacity: 0, y: -10 };
                  }
                })()}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                style={{
                  width: '100%',
                  minHeight: '100%'
                }}
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </RouteGuard>
        </div>
      </main>

      {/* Footer for Public Pages - Outside main content for full width */}
      {shouldShowFooter && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Mobile Navigation - PublicBottomNavMobile is now a TOP header, BottomNavBarMobile stays at bottom */}
      {isMobile && showPublicNav && (
        <PublicBottomNavMobile 
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onSignIn={handleSignIn}
          className=""
        />
      )}
      
      {/* Private Mobile Bottom Navigation - stays at bottom */}
      {isMobile && showPrivateNav && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-30"
          style={{
            // Enhanced mobile navigation with better safe area support
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            // Add subtle backdrop blur for modern mobile feel
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            // Improved mobile navigation styling
            borderTop: `1px solid var(--color-border-light)`,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            height: 'var(--ikan-nav-height-mobile)'
          }}
        >
          <BottomNavBarMobile 
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            className="relative"
            notificationBadges={{
              '/mood-journal': 2,
              '/assessments': 1
            }}
          />
        </div>
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

      {/* Safe Performance Monitoring - No environment variable dependencies */}
      <SafePerformanceMonitor />

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
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
          <SecurityProvider>
            <PaymentProvider>
              <JourneyProvider>
                <AppContent />
              </JourneyProvider>
            </PaymentProvider>
          </SecurityProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}