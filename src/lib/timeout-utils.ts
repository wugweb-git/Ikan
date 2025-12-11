// Utility functions for handling timeouts and preventing hanging operations

export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 10000,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    })
  ]);
}

export function withTimeoutAndFallback<T>(
  promise: Promise<T>,
  fallback: T,
  timeoutMs: number = 10000
): Promise<T> {
  return withTimeout(promise, timeoutMs).catch(() => {
    console.log('🔧 Operation timed out, using fallback value');
    return fallback;
  });
}

export function suppressTimeoutErrors<T>(
  promise: Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  return promise.catch((error) => {
    const errorMessage = error?.message || String(error);
    const errorString = errorMessage.toLowerCase();
    
    // Suppress timeout-related errors
    if (errorString.includes('timeout') || 
        errorString.includes('timed out') ||
        errorString.includes('getpage') ||
        errorString.includes('response timed out')) {
      console.log('🔧 Timeout error suppressed:', errorMessage);
      return fallback;
    }
    
    // Re-throw non-timeout errors
    throw error;
  });
}

export function createTimeoutSafeOperation<T extends (...args: any[]) => any>(
  operation: T,
  timeoutMs: number = 10000
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = operation(...args);
      
      if (result instanceof Promise) {
        return suppressTimeoutErrors(withTimeout(result, timeoutMs));
      }
      
      return result;
    } catch (error) {
      console.log('🔧 Operation error suppressed:', error);
      return undefined;
    }
  }) as T;
}