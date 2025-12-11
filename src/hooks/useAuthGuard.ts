import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook that provides authentication guards for components
 * Returns loading state until authentication is fully initialized
 */
export function useAuthGuard() {
  const { isAuthenticated, isInitialized, loading } = useAuth();
  const [canMakeApiCalls, setCanMakeApiCalls] = useState(false);

  useEffect(() => {
    // Only allow API calls when:
    // 1. Auth context is initialized
    // 2. Not currently loading
    // 3. Either authenticated OR auth check is complete (for public endpoints)
    const ready = isInitialized && !loading;
    setCanMakeApiCalls(ready);
    
    if (ready) {
      console.log('🔐 Auth guard ready - API calls allowed', { isAuthenticated, isInitialized });
    }
  }, [isAuthenticated, isInitialized, loading]);

  return {
    canMakeApiCalls,
    isAuthenticated,
    isInitialized,
    isLoading: loading
  };
}

/**
 * Hook that waits for authentication before executing a callback
 * Useful for components that need to make API calls on mount
 */
export function useWaitForAuth(callback: () => void | Promise<void>, deps: any[] = []) {
  const { canMakeApiCalls } = useAuthGuard();
  const [hasExecuted, setHasExecuted] = useState(false);

  useEffect(() => {
    if (canMakeApiCalls && !hasExecuted) {
      setHasExecuted(true);
      callback();
    }
  }, [canMakeApiCalls, hasExecuted, ...deps]);

  return { canMakeApiCalls, hasExecuted };
}