import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';

interface EmojiOption {
  id: string;
  label: string;
  char: string;
  value: number;
}

interface EmojiWidgetProps {
  moodValue?: number;
  onMoodChange?: (value: number) => void;
  animation?: 'bounce' | 'pulse' | 'wiggle' | 'none';
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EMOJI_OPTIONS: EmojiOption[] = [
  { id: 'awful', label: 'Awful', char: '😫', value: 1 },
  { id: 'bad', label: 'Bad', char: '😕', value: 2 },
  { id: 'meh', label: 'Meh', char: '😐', value: 3 },
  { id: 'good', label: 'Good', char: '🙂', value: 4 },
  { id: 'great', label: 'Great', char: '😄', value: 5 }
];

export function EmojiWidget({ 
  moodValue, 
  onMoodChange, 
  animation = 'bounce',
  disabled = false,
  className,
  size = 'md'
}: EmojiWidgetProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [selectedValue, setSelectedValue] = useState<number | null>(moodValue || null);

  // Sync internal state with props
  useEffect(() => {
    setSelectedValue(moodValue || null);
  }, [moodValue]);

  const sizeStyles = {
    sm: 'text-2xl p-2',
    md: 'text-3xl p-3', 
    lg: 'text-4xl p-4'
  };

  const getAnimationClass = (isSelected: boolean, isHovered: boolean) => {
    if (disabled || animation === 'none') return '';
    
    // Check for reduced motion preference - safe for SSR
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return isSelected || isHovered ? 'animate-fade-in' : '';
    }
    
    if (isSelected || isHovered) {
      switch (animation) {
        case 'bounce': return 'animate-bounce';
        case 'pulse': return 'animate-pulse';
        case 'wiggle': return 'animate-wiggle';
        default: return '';
      }
    }
    return '';
  };

  const handleEmojiClick = (value: number) => {
    if (disabled) return;
    
    setSelectedValue(value);
    onMoodChange?.(value);
  };

  return (
    <div 
      className={cn("flex items-center justify-center gap-2", className)}
      role="radiogroup"
      aria-label="Mood selection"
      style={{ gap: 'var(--spacing-2)' }}
    >
      {EMOJI_OPTIONS.map((emoji) => {
        const isSelected = selectedValue === emoji.value;
        const isHovered = hoveredValue === emoji.value;
        
        return (
          <motion.button
            key={emoji.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${emoji.label} mood`}
            disabled={disabled}
            className={cn(
              "relative rounded-full transition-all duration-200 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "hover:scale-110 active:scale-95",
              sizeStyles[size],
              isSelected && "ring-2",
              disabled && "opacity-50 cursor-not-allowed",
              getAnimationClass(isSelected, isHovered)
            )}
            style={{
              borderRadius: 'var(--radius-pill)',
              backgroundColor: isSelected ? 'var(--color-primary-default)' : 'transparent',
              color: isSelected ? 'var(--color-primary-on)' : 'var(--color-text-primary)',
              borderColor: isSelected ? 'var(--color-primary-default)' : 'transparent',
              ringColor: 'var(--color-primary-default)',
              transform: isHovered && !disabled ? 'scale(1.1)' : 'scale(1)'
            }}
            onMouseEnter={() => !disabled && setHoveredValue(emoji.value)}
            onMouseLeave={() => setHoveredValue(null)}
            onClick={() => handleEmojiClick(emoji.value)}
            whileHover={!disabled ? { scale: 1.1 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          >
            <span role="img" aria-hidden="true">
              {emoji.char}
            </span>
            
            {/* Selection overlay */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    opacity: 0.1,
                    borderRadius: 'var(--radius-pill)'
                  }}
                />
              )}
            </AnimatePresence>
            
            {/* Ripple effect */}
            {isHovered && !disabled && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0.35 }}
                animate={{ scale: 1.6, opacity: 0 }}
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: 'var(--color-primary-default)',
                  borderRadius: 'var(--radius-pill)'
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default EmojiWidget;