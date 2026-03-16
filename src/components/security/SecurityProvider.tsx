import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface SecurityContextType {
  isSecureConnection: boolean;
  lastActivity: Date | null;
  sessionTimeoutWarning: boolean;
  logSecurityEvent: (event: string, details?: any) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: React.ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  // Safely access auth and notification contexts with error handling
  let user, signOut, showToast;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
    signOut = authContext.signOut;
  } catch (error) {
    console.warn('SecurityProvider: AuthContext not available yet:', error);
    user = null;
    signOut = () => {};
  }
  
  try {
    const notificationContext = useNotifications();
    showToast = notificationContext.showToast;
  } catch (error) {
    console.warn('SecurityProvider: NotificationContext not available yet:', error);
    showToast = () => {};
  }
  const [isSecureConnection, setIsSecureConnection] = useState(true);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false);

  // Session timeout settings (30 minutes for mental health app)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  // Security event logging
  const logSecurityEvent = (event: string, details?: any) => {
    const timestamp = new Date().toISOString();
    const securityLog = {
      timestamp,
      event,
      userId: user?.id || 'anonymous',
      userAgent: navigator.userAgent,
      url: window.location.href,
      details: details || {}
    };

    // Log to console in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('🔒 Security Event:', securityLog);
    }

    // In production, send to monitoring service
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to your monitoring service (e.g., Sentry, LogRocket)
      try {
        // Example: Analytics or monitoring service
        fetch('/api/security-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(securityLog)
        }).catch(err => console.warn('Security logging failed:', err));
      } catch (error) {
        console.warn('Security logging error:', error);
      }
    }
  };

  // Check secure connection
  useEffect(() => {
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost';
    const isSecure = isHTTPS || isLocalhost;
    
    setIsSecureConnection(isSecure);
    
    if (!isSecure && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      logSecurityEvent('insecure_connection', { 
        protocol: window.location.protocol,
        hostname: window.location.hostname 
      });
      showToast('error', 'Insecure Connection', 'Please use HTTPS for secure access');
    }
  }, []);

  // Track user activity for session management
  useEffect(() => {
    if (!user) return;

    // Throttle activity updates to at most once every 60 seconds
    // to prevent constant re-renders from mousemove/scroll events
    let lastUpdateTime = Date.now();
    const THROTTLE_MS = 60_000; // 1 minute

    const updateActivity = () => {
      const now = Date.now();
      if (now - lastUpdateTime < THROTTLE_MS) return; // Skip if within throttle window
      lastUpdateTime = now;
      setLastActivity(new Date());
      setSessionTimeoutWarning(false);
    };

    // Track various user activities
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    // NOTE: Removed 'mousemove' — it fires too frequently and caused render storms
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Initial activity
    setLastActivity(new Date());

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [user]);

  // Session timeout management
  useEffect(() => {
    if (!user || !lastActivity) return;

    const checkSession = () => {
      const now = new Date();
      const timeSinceActivity = now.getTime() - lastActivity.getTime();
      
      if (timeSinceActivity >= SESSION_TIMEOUT) {
        logSecurityEvent('session_timeout', { 
          lastActivity: lastActivity.toISOString(),
          timeoutDuration: SESSION_TIMEOUT 
        });
        signOut();
        showToast('info', 'Session Expired', 'Please sign in again for your security');
      } else if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_TIME && !sessionTimeoutWarning) {
        setSessionTimeoutWarning(true);
        logSecurityEvent('session_timeout_warning', { 
          lastActivity: lastActivity.toISOString() 
        });
        showToast(
          'warning', 
          'Session Expiring', 
          'Your session will expire in 5 minutes. Please interact with the app to stay signed in.'
        );
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, lastActivity, sessionTimeoutWarning, signOut, showToast]);

  // Content Security Policy violation handler
  useEffect(() => {
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      logSecurityEvent('csp_violation', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy
      });
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);
    return () => document.removeEventListener('securitypolicyviolation', handleCSPViolation);
  }, []);

  // Monitor for unusual activity patterns
  useEffect(() => {
    if (!user) return;

    // Track rapid navigation (potential bot behavior)
    let navigationCount = 0;
    const navigationWindow = 10000; // 10 seconds

    const trackNavigation = () => {
      navigationCount++;
      
      setTimeout(() => {
        navigationCount--;
      }, navigationWindow);

      if (navigationCount > 20) { // More than 20 navigations in 10 seconds
        logSecurityEvent('suspicious_navigation', { 
          navigationCount,
          timeWindow: navigationWindow 
        });
      }
    };

    window.addEventListener('popstate', trackNavigation);
    return () => window.removeEventListener('popstate', trackNavigation);
  }, [user]);

  // Privacy-focused error boundary
  // NOTE: Removed duplicate unhandledrejection listener — already handled
  // by /lib/error-handlers.ts setupGlobalErrorHandlers()

  const value: SecurityContextType = {
    isSecureConnection,
    lastActivity,
    sessionTimeoutWarning,
    logSecurityEvent
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

// Crisis detection utility for mental health content
export function detectCrisisKeywords(text: string): boolean {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end it all', 'hurt myself', 'self harm',
    'want to die', 'better off dead', 'no point living', 'end my life'
  ];
  
  const normalizedText = text.toLowerCase();
  return crisisKeywords.some(keyword => normalizedText.includes(keyword));
}

// Safe content filtering for mental health app
export function sanitizeUserContent(content: string): string {
  // Remove potential XSS while preserving emotional expression
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}