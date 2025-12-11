import { useEffect } from 'react';

// Simplified, safe performance monitor without environment variable dependencies
export function SafePerformanceMonitor() {
  useEffect(() => {
    // Only enable performance monitoring in development (localhost)
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';

    if (!isDev) {
      return; // Skip performance monitoring in production to avoid errors
    }

    console.log('🔍 Performance monitoring enabled for development');

    // Simple navigation timing check
    const checkPerformance = () => {
      try {
        if ('performance' in window && performance.navigation) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.navigationStart;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
            
            if (loadTime > 0) {
              console.log('📊 Page Load Time: ' + Math.round(loadTime) + 'ms');
            }
            if (domContentLoaded > 0) {
              console.log('📊 DOM Content Loaded: ' + Math.round(domContentLoaded) + 'ms');
            }
          }
        }
      } catch (error) {
        // Silently ignore performance API errors
        console.log('📊 Performance API not available');
      }
    };

    // Check performance after page load
    if (document.readyState === 'complete') {
      setTimeout(checkPerformance, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkPerformance, 1000);
      });
    }

    // Simple memory monitoring if available
    const checkMemory = () => {
      try {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          if (memory) {
            const used = Math.round(memory.usedJSHeapSize / 1048576);
            console.log('🧠 Memory usage: ' + used + 'MB');
          }
        }
      } catch (error) {
        // Silently ignore memory API errors
      }
    };

    // Check memory once after load
    setTimeout(checkMemory, 3000);

  }, []);

  return null; // This component doesn't render anything
}

// Simple performance tracking utility
export function trackPerformance(name: string, value: number) {
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';

  if (isDev) {
    console.log('📈 ' + name + ': ' + Math.round(value) + 'ms');
  }
}

export default SafePerformanceMonitor;