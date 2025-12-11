/**
 * Custom hook to ensure proper cleanup in useEffect
 * Helps prevent memory leaks by tracking mounted state
 */

import { useEffect, useRef } from 'react';

export function useCleanupEffect(
  effect: (cleanup: CleanupRegistry) => void | (() => void),
  deps: React.DependencyList
) {
  const isMountedRef = useRef(true);
  const cleanupFnsRef = useRef<Set<() => void>>(new Set());

  useEffect(() => {
    isMountedRef.current = true;
    cleanupFnsRef.current.clear();

    const cleanup: CleanupRegistry = {
      addTimeout: (id: NodeJS.Timeout) => {
        cleanupFnsRef.current.add(() => clearTimeout(id));
        return id;
      },
      addInterval: (id: NodeJS.Timeout) => {
        cleanupFnsRef.current.add(() => clearInterval(id));
        return id;
      },
      addListener: (target: EventTarget, event: string, handler: EventListener) => {
        target.addEventListener(event, handler);
        cleanupFnsRef.current.add(() => target.removeEventListener(event, handler));
      },
      addCleanup: (fn: () => void) => {
        cleanupFnsRef.current.add(fn);
      },
      isMounted: () => isMountedRef.current
    };

    const userCleanup = effect(cleanup);

    return () => {
      isMountedRef.current = false;
      
      // Run all registered cleanups
      cleanupFnsRef.current.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
      
      // Run user-provided cleanup if any
      if (typeof userCleanup === 'function') {
        try {
          userCleanup();
        } catch (error) {
          console.error('User cleanup error:', error);
        }
      }
    };
  }, deps);
}

export interface CleanupRegistry {
  addTimeout: (id: NodeJS.Timeout) => NodeJS.Timeout;
  addInterval: (id: NodeJS.Timeout) => NodeJS.Timeout;
  addListener: (target: EventTarget, event: string, handler: EventListener) => void;
  addCleanup: (fn: () => void) => void;
  isMounted: () => boolean;
}

/**
 * Hook to check if component is still mounted
 */
export function useIsMounted() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return () => isMountedRef.current;
}
