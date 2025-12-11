import { useEffect, useCallback, useState } from 'react';
import { useIsMobile } from './useIsMobile';

interface MobileGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTab?: () => void;
}

export function useMobileOptimizations() {
  const isMobile = useIsMobile();
  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  
  // Detect connection type for performance optimizations
  useEffect(() => {
    if (!isMobile || typeof window === 'undefined') return;

    const connection = (navigator as any).connection;
    if (connection) {
      const updateConnectionInfo = () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setConnectionType('slow');
        } else {
          setConnectionType('fast');
        }
      };

      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);

      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, [isMobile]);

  // Add haptic feedback helper
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!isMobile || typeof window === 'undefined') return;

    // Haptic feedback for supported devices
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 25,
        heavy: 50
      };
      navigator.vibrate(patterns[type]);
    }

    // iOS haptic feedback (if available)
    if ('hapticFeedback' in window) {
      const patterns = {
        light: 'impactLight',
        medium: 'impactMedium', 
        heavy: 'impactHeavy'
      };
      (window as any).hapticFeedback(patterns[type]);
    }
  }, [isMobile]);

  // Swipe gesture detection
  const useSwipeGestures = useCallback((element: HTMLElement | null, handlers: MobileGestureHandlers) => {
    useEffect(() => {
      if (!isMobile || !element) return;

      let startX = 0;
      let startY = 0;
      let endX = 0;
      let endY = 0;
      let lastTap = 0;

      const minSwipeDistance = 50;
      const maxSwipeTime = 300;
      let startTime = 0;

      const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
      };

      const handleTouchEnd = (e: TouchEvent) => {
        const touch = e.changedTouches[0];
        endX = touch.clientX;
        endY = touch.clientY;
        const endTime = Date.now();

        // Double tap detection
        const currentTime = Date.now();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
          handlers.onDoubleTab?.();
          triggerHapticFeedback('medium');
        }
        lastTap = currentTime;

        // Swipe detection
        if (endTime - startTime > maxSwipeTime) return;

        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Determine swipe direction
        if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY) {
          if (deltaX > 0) {
            handlers.onSwipeRight?.();
          } else {
            handlers.onSwipeLeft?.();
          }
          triggerHapticFeedback('light');
        } else if (absDeltaY > minSwipeDistance && absDeltaY > absDeltaX) {
          if (deltaY > 0) {
            handlers.onSwipeDown?.();
          } else {
            handlers.onSwipeUp?.();
          }
          triggerHapticFeedback('light');
        }
      };

      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }, [element, handlers, isMobile, triggerHapticFeedback]);
  }, [isMobile, triggerHapticFeedback]);

  // Optimize images for mobile
  const optimizeImageLoading = useCallback(() => {
    if (!isMobile || typeof window === 'undefined') return;

    const images = document.querySelectorAll('img[data-mobile-optimize]');
    images.forEach((img) => {
      const imageElement = img as HTMLImageElement;
      
      // Add loading="lazy" for better performance
      if (!imageElement.loading) {
        imageElement.loading = 'lazy';
      }

      // Add mobile-specific image optimization
      if (connectionType === 'slow') {
        imageElement.style.filter = 'blur(1px)';
        imageElement.addEventListener('load', () => {
          imageElement.style.filter = 'none';
          imageElement.style.transition = 'filter 0.3s ease';
        });
      }
    });
  }, [isMobile, connectionType]);

  // Auto-optimize for mobile performance
  useEffect(() => {
    if (!isMobile) return;

    // Add mobile-specific body classes
    document.body.classList.add('mobile-optimized');
    
    if (connectionType === 'slow') {
      document.body.classList.add('slow-connection');
    }

    // Optimize images
    optimizeImageLoading();

    return () => {
      document.body.classList.remove('mobile-optimized', 'slow-connection');
    };
  }, [isMobile, connectionType, optimizeImageLoading]);

  return {
    isMobile,
    connectionType,
    triggerHapticFeedback,
    useSwipeGestures,
    optimizeImageLoading
  };
}

// Helper hook for mobile-specific viewport handling
export function useMobileViewport() {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!isMobile || typeof window === 'undefined') return;

    // Set mobile viewport height for consistent full-height layouts
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, [isMobile]);
}

// Helper hook for mobile keyboard handling
export function useMobileKeyboard() {
  const isMobile = useIsMobile();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!isMobile || typeof window === 'undefined') return;

    let initialViewportHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Assume keyboard is open if viewport shrunk by more than 150px
      if (heightDifference > 150) {
        setKeyboardOpen(true);
        document.body.classList.add('keyboard-open');
      } else {
        setKeyboardOpen(false);
        document.body.classList.remove('keyboard-open');
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('keyboard-open');
    };
  }, [isMobile]);

  return { keyboardOpen };
}