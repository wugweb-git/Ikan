import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ColorTransitionProps {
  colors: string[];
  duration?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Smooth color transitions for mood-based theming
export function MoodColorTransition({
  colors,
  duration = 10,
  children,
  className = '',
  style = {}
}: ColorTransitionProps) {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colors.length);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [colors.length, duration]);

  return (
    <motion.div
      className={className}
      style={style}
      animate={{
        backgroundColor: colors[currentColorIndex]
      }}
      transition={{
        duration: 2,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Time-based color transitions (morning/afternoon/evening)
export function TimeBasedColorTransition({
  children,
  className = '',
  style = {}
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [timeColor, setTimeColor] = useState('var(--color-bg-page)');

  useEffect(() => {
    const updateTimeColor = () => {
      const hour = new Date().getHours();
      
      if (hour >= 6 && hour < 12) {
        // Morning - warm light colors
        setTimeColor('linear-gradient(135deg, #FFF9E6 0%, #F5F5F5 100%)');
      } else if (hour >= 12 && hour < 17) {
        // Afternoon - bright neutral
        setTimeColor('linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)');
      } else if (hour >= 17 && hour < 20) {
        // Evening - warm golden
        setTimeColor('linear-gradient(135deg, #FFF4E6 0%, #F5F5F5 100%)');
      } else {
        // Night - cool darker tones
        setTimeColor('linear-gradient(135deg, #F0F0F2 0%, #F5F5F5 100%)');
      }
    };

    updateTimeColor();
    const interval = setInterval(updateTimeColor, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={className}
      style={style}
      animate={{
        background: timeColor
      }}
      transition={{
        duration: 5,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Gentle wave-like color animation for calming effect
export function CalmingWaveBackground({
  children,
  className = '',
  style = {}
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`relative ${className}`} style={style}>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, var(--color-bg-page) 0%, var(--color-bg-muted) 50%, var(--color-bg-page) 100%)',
          backgroundSize: '400% 400%'
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Seasonal color transitions
export function SeasonalColorTransition({
  children,
  className = '',
  style = {}
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [seasonColor, setSeasonColor] = useState('var(--color-bg-page)');

  useEffect(() => {
    const updateSeasonColor = () => {
      const month = new Date().getMonth();
      
      if (month >= 2 && month <= 4) {
        // Spring - fresh greens
        setSeasonColor('linear-gradient(135deg, #F8FFF8 0%, #F5F5F5 100%)');
      } else if (month >= 5 && month <= 7) {
        // Summer - bright and warm
        setSeasonColor('linear-gradient(135deg, #FFFEF8 0%, #F5F5F5 100%)');
      } else if (month >= 8 && month <= 10) {
        // Autumn - warm oranges and browns
        setSeasonColor('linear-gradient(135deg, #FFF8F0 0%, #F5F5F5 100%)');
      } else {
        // Winter - cool blues and grays
        setSeasonColor('linear-gradient(135deg, #F8F9FF 0%, #F5F5F5 100%)');
      }
    };

    updateSeasonColor();
  }, []);

  return (
    <motion.div
      className={className}
      style={style}
      animate={{
        background: seasonColor
      }}
      transition={{
        duration: 8,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Emotion-based color transitions for mental health context
export function EmotionColorTransition({
  emotion = 'neutral',
  children,
  className = '',
  style = {}
}: {
  emotion?: 'happy' | 'calm' | 'anxious' | 'sad' | 'energetic' | 'neutral';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const emotionColors = {
    happy: 'linear-gradient(135deg, #FFF9E6 0%, #F5F5F5 100%)',
    calm: 'linear-gradient(135deg, #F0F8FF 0%, #F5F5F5 100%)',
    anxious: 'linear-gradient(135deg, #FFF5F5 0%, #F5F5F5 100%)',
    sad: 'linear-gradient(135deg, #F5F5FF 0%, #F5F5F5 100%)',
    energetic: 'linear-gradient(135deg, #F8FFF8 0%, #F5F5F5 100%)',
    neutral: 'var(--color-bg-page)'
  };

  return (
    <motion.div
      className={className}
      style={style}
      animate={{
        background: emotionColors[emotion]
      }}
      transition={{
        duration: 3,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

export default {
  MoodColorTransition,
  TimeBasedColorTransition,
  CalmingWaveBackground,
  SeasonalColorTransition,
  EmotionColorTransition
};