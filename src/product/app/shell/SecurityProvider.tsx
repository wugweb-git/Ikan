import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../../shared/state/AuthContext';
import { useNotifications } from '../../../shared/state/NotificationContext';

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
  let verifiedIsAdmin: boolean | null = null;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
    signOut = authContext.signOut;
    verifiedIsAdmin = authContext.verifiedIsAdmin;
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

  /**
   * Admins are exempt from the idle sign-out.
   *
   * The 30-minute rule exists for the patient-facing app, where a session left
   * open on a shared or borrowed device exposes someone's mental-health data.
   * That reasoning does not carry to the CMS: an author reading a long day of
   * content, or waiting on a deploy, is not idle in any meaningful sense, and
   * being signed out mid-edit loses work. Until 2026-09-08 this fired for
   * everyone, and because `signOut()` defaulted to GLOBAL scope it revoked the
   * admin's session on every other device at the same time — one forgotten tab
   * logged you out everywhere, and the tab you were working in then got
   * `session_not_found` for a token that had not expired.
   *
   * The patient-facing timeout is unchanged.
   */
  // Server-verified admin only, not the cached localStorage hint.
  const exemptFromIdleSignOut = verifiedIsAdmin === true;

  /**
   * Security events are recorded in the console and nowhere else.
   *
   * Until 2026-10-07 this POSTed every event to `/security/events` on the edge
   * function. Two reasons it is gone, and the second is the serious one:
   *
   *   The site is becoming static marketing pages, and a public page posting
   *   telemetry to a function nobody reads is cost and attack surface for no
   *   return.
   *
   *   The CSP-violation listener that fed it reported `blockedURI` verbatim.
   *   The policy blocks some of this site's own analytics, so what it was
   *   actually recording — on the server, under the signed-in user's id — was
   *   a copy of every blocked Google Analytics hit, query string and all.
   *   That is session and behavioural data collected as a side effect of a
   *   security log. The listener is removed, not merely unwired: the fix for
   *   analytics being blocked is the `connect-src` allowance in `vercel.json`,
   *   not a second copy of the traffic.
   *
   * The signature is kept so the callers below and `useSecurity`'s contract do
   * not change, and because an idle sign-out worth logging is worth seeing in
   * a console when someone is debugging one.
   */
  const logSecurityEvent = (event: string, details?: any) => {
    console.info('[security]', event, {
      userId: user?.id || 'anonymous',
      ...(details || {}),
    });
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
    if (!user || !lastActivity || exemptFromIdleSignOut) return;

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
  }, [user, lastActivity, sessionTimeoutWarning, signOut, showToast, exemptFromIdleSignOut]);

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