import { useEffect, useState } from 'react';

// Hook to check for reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Utility to get appropriate animation class based on motion preference
export function getAnimationClass(
  normalAnimation: string, 
  reducedAnimation: string = 'animate-fade-in',
  prefersReducedMotion?: boolean
) {
  const shouldReduceMotion = prefersReducedMotion ?? 
    (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  
  return shouldReduceMotion ? reducedAnimation : normalAnimation;
}

// Component wrapper that respects motion preferences
interface MotionWrapperProps {
  children: React.ReactNode;
  animation?: 'bounce' | 'pulse' | 'wiggle' | 'scale' | 'slide';
  trigger?: boolean;
  className?: string;
}

export function MotionWrapper({ 
  children, 
  animation = 'bounce', 
  trigger = true,
  className = ''
}: MotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const getAnimationClass = () => {
    if (!trigger || prefersReducedMotion) {
      return 'animate-fade-in';
    }
    
    switch (animation) {
      case 'bounce': return 'animate-bounce';
      case 'pulse': return 'animate-pulse';
      case 'wiggle': return 'animate-wiggle';
      case 'scale': return 'animate-scale-in';
      case 'slide': return 'animate-slide-up';
      default: return 'animate-fade-in';
    }
  };

  return (
    <div className={`${getAnimationClass()} ${className}`}>
      {children}
    </div>
  );
}

export default { useReducedMotion, getAnimationClass, MotionWrapper };