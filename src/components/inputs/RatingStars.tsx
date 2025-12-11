import React, { useState } from 'react';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface RatingStarsProps {
  value?: number;
  onChange?: (rating: number) => void;
  max?: number;
  disabled?: boolean;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  allowHalf?: boolean;
  className?: string;
}

export function RatingStars({
  value = 0,
  onChange,
  max = 5,
  disabled = false,
  readonly = false,
  size = 'md',
  allowHalf = false,
  className
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [clickedRating, setClickedRating] = useState<number | null>(null);

  const isInteractive = !disabled && !readonly && onChange;
  
  const sizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const handleMouseEnter = (rating: number) => {
    if (!isInteractive) return;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (!isInteractive) return;
    setHoverRating(null);
  };

  const handleClick = (rating: number) => {
    if (!isInteractive) return;
    
    setClickedRating(rating);
    onChange?.(rating);
    
    // Add bounce animation
    setTimeout(() => setClickedRating(null), 150);
  };

  const getStarState = (index: number): 'empty' | 'partial' | 'full' => {
    const currentRating = hoverRating !== null ? hoverRating : value;
    const starValue = index + 1;
    
    if (allowHalf) {
      if (currentRating >= starValue) return 'full';
      if (currentRating >= starValue - 0.5) return 'partial';
      return 'empty';
    } else {
      return currentRating >= starValue ? 'full' : 'empty';
    }
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1",
        isInteractive && "cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: max }, (_, index) => {
        const starState = getStarState(index);
        const isClicked = clickedRating === index + 1;
        
        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            className={cn(
              "inline-flex items-center justify-center transition-all duration-200",
              isInteractive && "hover:scale-110 active:scale-95",
              isClicked && "animate-bounce",
              "focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-sm"
            )}
            style={{
              color: starState === 'full' ? 'var(--color-accent-default)' : 
                     starState === 'partial' ? 'var(--color-accent-default)' : 'var(--color-neutral-300)',
              ringColor: 'var(--color-accent-default)',
              ringOpacity: 0.3,
              minWidth: '24px',
              minHeight: '24px'
            }}
            onMouseEnter={() => handleMouseEnter(index + 1)}
            onClick={() => handleClick(index + 1)}
            aria-label={`Rate ${index + 1} out of ${max} stars`}
          >
            {starState === 'partial' ? (
              <div className="relative">
                <Icon 
                  name="star"
                  size={sizes[size]}
                  variant="outline"
                  style={{ color: 'var(--color-neutral-300)' }}
                />
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: '50%' }}
                >
                  <Icon 
                    name="star"
                    size={sizes[size]}
                    variant="filled"
                    style={{ color: 'var(--color-accent-default)' }}
                  />
                </div>
              </div>
            ) : (
              <Icon 
                name="star"
                size={sizes[size]}
                variant={starState === 'full' ? "filled" : "outline"}
                className={cn(
                  "transition-all duration-200",
                  isInteractive && starState === 'full' && "animate-scaleIn"
                )}
              />
            )}
          </button>
        );
      })}
      
      {/* Optional rating display */}
      {value > 0 && (
        <span 
          className="ml-2 animate-fadeIn"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          {allowHalf ? value.toFixed(1) : value.toFixed(0)}/{max}
        </span>
      )}
    </div>
  );
}