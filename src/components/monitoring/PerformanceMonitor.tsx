import { useEffect } from 'react';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

class PerformanceTracker {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private isDevEnvironment(): boolean {
    // Simple hostname-based detection
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('dev') ||
           window.location.protocol === 'http:';
  }

  private isProdEnvironment(): boolean {
    return !this.isDevEnvironment();
  }

  private initializeObservers() {
    // Only initialize in development to prevent errors
    if (!this.isDevEnvironment()) {
      return;
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.reportMetric('fid', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsScore = 0;
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          });
          this.metrics.cls = clsScore;
          this.reportMetric('cls', clsScore);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // Navigation timing for TTFB and FCP
      this.observeNavigationTiming();
    }
  }

  private observeNavigationTiming() {
    // Wait for the page to load
    if (document.readyState === 'complete') {
      this.captureNavigationTiming();
    } else {
      window.addEventListener('load', () => {
        this.captureNavigationTiming();
      });
    }
  }

  private captureNavigationTiming() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // Time to First Byte
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.reportMetric('ttfb', this.metrics.ttfb);

        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
          this.reportMetric('fcp', fcpEntry.startTime);
        }
      }
    } catch (error) {
      console.warn('Navigation timing not available:', error);
    }
  }

  private reportMetric(name: string, value: number) {
    // Only log in development
    if (this.isDevEnvironment()) {
      console.log('📊 ' + name.toUpperCase() + ': ' + Math.round(value) + 'ms');
    }

    // Check against thresholds and warn if needed
    this.checkPerformanceThresholds(name, value);
  }

  private checkPerformanceThresholds(metric: string, value: number) {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (threshold) {
      let status = 'good';
      if (value > threshold.poor) {
        status = 'poor';
      } else if (value > threshold.good) {
        status = 'needs-improvement';
      }

      // Only warn in development for poor performance
      if (this.isDevEnvironment() && status === 'poor') {
        console.warn('⚠️ Poor ' + metric.toUpperCase() + ' performance: ' + Math.round(value) + 'ms (threshold: ' + threshold.good + 'ms)');
      }
    }
  }

  private sendToAnalytics(metric: string, value: number) {
    // Disabled to prevent errors in production
    return;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React component to integrate performance monitoring
export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';

    if (!isDev) {
      return;
    }

    const tracker = new PerformanceTracker();

    // Monitor bundle size
    const checkBundleSize = async () => {
      try {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const jsEntries = entries.filter(entry => 
          entry.name.includes('.js') && 
          entry.name.includes(window.location.origin)
        );
        
        let totalSize = 0;
        jsEntries.forEach(entry => {
          if (entry.transferSize) {
            totalSize += entry.transferSize;
          }
        });

        if (totalSize > 250000) { // 250KB threshold
          console.warn('⚠️ Large bundle size: ' + Math.round(totalSize / 1024) + 'KB');
        } else {
          console.log('📦 Bundle size: ' + Math.round(totalSize / 1024) + 'KB');
        }
      } catch (error) {
        console.warn('Bundle size check failed:', error);
      }
    };

    setTimeout(checkBundleSize, 2000);

    // Memory monitoring (if available)
    if ('memory' in performance) {
      const checkMemoryUsage = () => {
        const memory = (performance as any).memory;
        const used = Math.round(memory.usedJSHeapSize / 1048576); // MB
        const total = Math.round(memory.totalJSHeapSize / 1048576); // MB

        console.log('🧠 Memory usage: ' + used + 'MB / ' + total + 'MB');

        if (used > 100) { // 100MB threshold
          console.warn('⚠️ High memory usage: ' + used + 'MB');
        }
      };

      // Check memory every 30 seconds
      const memoryInterval = setInterval(checkMemoryUsage, 30000);
      
      return () => {
        tracker.cleanup();
        clearInterval(memoryInterval);
      };
    }

    return () => tracker.cleanup();
  }, []);

  return null; // This component doesn't render anything
}

// Utility to track custom performance metrics
export function trackCustomMetric(name: string, value: number, unit: string = 'ms') {
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';

  if (isDev) {
    console.log('📈 Custom Metric - ' + name + ': ' + value + unit);
  }
}

// Hook for component-level performance tracking
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame (16ms)
        console.warn('⚠️ Slow component render: ' + componentName + ' took ' + Math.round(renderTime) + 'ms');
      }
      
      trackCustomMetric('component_render_' + componentName, renderTime);
    };
  }, [componentName]);
}