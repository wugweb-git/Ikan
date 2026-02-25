import { useState, useCallback, useEffect } from 'react';

interface UsePullToRefreshOptions {
  enabled: boolean;
  onRefresh: () => Promise<void>;
}

export function usePullToRefresh({ enabled, onRefresh }: UsePullToRefreshOptions) {
  const [touchStartY, setTouchStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || window.scrollY > 0) return;
    setTouchStartY(e.touches[0].clientY);
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || window.scrollY > 0 || touchStartY === 0) return;

    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY;
    const maxDistance = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ikan-pull-refresh-max-distance')) || 150;
    const triggerDistance = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ikan-pull-refresh-trigger-distance')) || 80;

    if (distance > 0 && distance < maxDistance) {
      setPullDistance(distance);
      const progress = distance > triggerDistance ? '1' : (distance / triggerDistance).toString();
      document.documentElement.style.setProperty('--pull-refresh-progress', progress);
    }
  }, [enabled, touchStartY]);

  const handleTouchEnd = useCallback(async () => {
    const triggerDistance = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ikan-pull-refresh-trigger-distance')) || 80;

    if (!enabled || pullDistance < triggerDistance) {
      setPullDistance(0);
      setTouchStartY(0);
      document.documentElement.style.removeProperty('--pull-refresh-progress');
      return;
    }

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setTouchStartY(0);
      document.documentElement.style.removeProperty('--pull-refresh-progress');
    }
  }, [enabled, pullDistance, onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isRefreshing, pullDistance };
}
