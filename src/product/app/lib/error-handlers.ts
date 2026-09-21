/**
 * Centralized error handling setup for iKan PWA.
 * Extracted from App.tsx to reduce main bundle complexity.
 */

import { logger } from '../shell/logger';
import { apiClient } from '../../../shared/api';

// --- Patterns ---

const NETWORK_ERROR_PATTERNS = [
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

const BACKGROUND_ERROR_PATTERNS = [
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

const CONSOLE_SUPPRESS_PATTERNS = [
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

// --- Helpers ---

function matchesPattern(str: string, patterns: string[]): boolean {
  return patterns.some(p => str.includes(p));
}

function setOfflineMode(value: boolean) {
  try {
    if (typeof window !== 'undefined') {
      // Written and never read: grep finds no consumer of this key anywhere in
      // the app. Kept because it costs nothing and is genuine diagnostic state
      // in devtools, but nothing renders from it — the offline banner reads
      // `navigator.onLine`. Do not add a reader without deciding how it clears.
      localStorage.setItem('ikan-offline-mode', value.toString());
    }
  } catch {
    // Ignore localStorage errors
  }
}

// --- Setup ---

interface ErrorHandlerCallbacks {
  showToast?: (type: string, title: string, message: string) => void;
}

/**
 * Sets up all global error handlers (fetch wrapper, unhandled rejection,
 * window error, message handler, console overrides) and schedules a
 * background health check.
 *
 * Returns a cleanup function that restores everything.
 */
export function setupGlobalErrorHandlers({ showToast }: ErrorHandlerCallbacks): () => void {
  // --- Fetch wrapper ---
  // Guard against stacking on hot-reload: only wrap if not already wrapped
  const alreadyWrapped = (window.fetch as any).__ikanWrapped;
  const originalFetch = alreadyWrapped ? (window.fetch as any).__originalFetch : window.fetch;

  if (!alreadyWrapped) {
    const wrappedFetch = async (...args: Parameters<typeof fetch>) => {
      try {
        return await originalFetch(...args);
      } catch (error: any) {
        const msg = error instanceof Error ? error.message : String(error);
        const lower = msg.toLowerCase();

        /**
         * `error.name === 'TypeError'` is gone from this test.
         *
         * Every aborted request, every CORS rejection and every chunk-load
         * failure is a TypeError, so this branch fired on things that had
         * nothing to do with connectivity — including the missing-chunk error
         * this app was showing on /mood-journal — and told the user they were
         * offline when they were not.
         *
         * The toast is gone too. `App.tsx` already renders `OfflineBanner`
         * from `navigator.onLine`, which is a real signal; this one guessed
         * from a message string and could not clear itself, so a single failed
         * request left "Working offline" standing over a working app.
         */
        if (
          lower.includes('failed to fetch') ||
          lower.includes('network error') ||
          lower.includes('connection refused')
        ) {
          logger.log('Global fetch error intercepted:', msg);
          setOfflineMode(true);
        }
        throw error;
      }
    };
    (wrappedFetch as any).__ikanWrapped = true;
    (wrappedFetch as any).__originalFetch = originalFetch;
    window.fetch = wrappedFetch;
  }

  // --- Unhandled rejection ---
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const msg = event.reason?.message || String(event.reason) || 'Unknown error';
    const lower = msg.toLowerCase();
    // NOTE: Do NOT call event.preventDefault() unconditionally — it hides errors from the console.

    if (matchesPattern(lower, NETWORK_ERROR_PATTERNS)) {
      event.preventDefault();
      console.log('Network connectivity issue:', msg);
      setOfflineMode(true);
      return;
    }
    if (matchesPattern(lower, BACKGROUND_ERROR_PATTERNS)) {
      event.preventDefault();
      console.log('Background/CMS operation failed gracefully (normal):', msg);
      return;
    }
    // Allow unknown rejections to propagate to console for debugging
    console.log('Unhandled promise rejection caught:', msg);
  };

  // --- Window error ---
  const handleWindowError = (event: ErrorEvent) => {
    const msg = event.message || event.error?.message || 'Unknown error';
    const lower = msg.toLowerCase();
    // NOTE: Do NOT call event.preventDefault() unconditionally — it hides errors from the console.

    if (matchesPattern(lower, NETWORK_ERROR_PATTERNS.slice(0, 5))) {
      event.preventDefault();
      console.log('Network error in window handler - enabling offline mode:', msg);
      setOfflineMode(true);
      return false;
    }
    // Allow unknown errors to propagate to console for debugging
    console.log('Window error caught (not suppressed):', msg);
    return true; // Let the browser's default error handling continue
  };

  // --- Message handler ---
  // Only handle messages from our own app origin — never interfere with
  // Figma's iframe messages or other third-party message channels.
  const handleMessage = (event: MessageEvent) => {
    // Skip messages from different origins (e.g. Figma's iframe communication)
    try {
      if (event.origin && event.origin !== window.location.origin) {
        return;
      }
    } catch {
      // If origin check fails, skip handling entirely
      return;
    }

    if (event.data && typeof event.data === 'object') {
      const data = event.data;
      if (data.error || data.timeout || (data.type && data.type.includes('timeout'))) {
        console.log('Message-based error handled gracefully:', data);
        // Don't call preventDefault/stopPropagation — it can break iframe messaging
        return;
      }
    }
  };

  // --- Console overrides ---
  // Guard against stacking: only wrap if not already wrapped
  const alreadyOverridden = (console.error as any).__ikanWrapped;
  const originalConsoleError = alreadyOverridden ? (console.error as any).__original : console.error;
  const originalConsoleWarn = alreadyOverridden ? (console.warn as any).__original : console.warn;

  if (!alreadyOverridden) {
    const wrappedError = (...args: any[]) => {
      const str = args.join(' ').toLowerCase();
      if (
        matchesPattern(str, CONSOLE_SUPPRESS_PATTERNS) ||
        (str.includes('message') && str.includes('timeout'))
      ) {
        console.log('Console error suppressed (CMS timeout):', ...args);
        return;
      }
      originalConsoleError.apply(console, args);
    };
    (wrappedError as any).__ikanWrapped = true;
    (wrappedError as any).__original = originalConsoleError;
    console.error = wrappedError;

    const wrappedWarn = (...args: any[]) => {
      const str = args.join(' ').toLowerCase();
      if (matchesPattern(str, CONSOLE_SUPPRESS_PATTERNS)) {
        console.log('Console warning suppressed (CMS timeout):', ...args);
        return;
      }
      originalConsoleWarn.apply(console, args);
    };
    (wrappedWarn as any).__ikanWrapped = true;
    (wrappedWarn as any).__original = originalConsoleWarn;
    console.warn = wrappedWarn;
  }

  // --- Register listeners ---
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  window.addEventListener('error', handleWindowError);
  window.addEventListener('message', handleMessage);

  // --- Background health check ---
  const healthCheckTimer = setTimeout(() => {
    Promise.resolve()
      .then(() => apiClient.healthCheck())
      .then(() => {
        console.log('Server available');
        setOfflineMode(false);
      })
      .catch((error: any) => {
        const msg = error instanceof Error ? error.message : String(error);
        console.log(`Using offline mode due to health check failure: ${msg}`);
        setOfflineMode(true);
      });
  }, 2000);

  // --- Cleanup ---
  return () => {
    clearTimeout(healthCheckTimer);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleWindowError);
    window.removeEventListener('message', handleMessage);
    // Restore originals
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    window.fetch = originalFetch;
  };
}