import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../Icon';

interface InteractiveIconProps {
  name: string;
  size?: number;
  variant?: 'outline' | 'filled' | 'roundedOutline' | 'roundedFilled' | 'default';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  bounce?: boolean;
  rotate?: boolean;
  scale?: boolean;
  glow?: boolean;
}

export function InteractiveIcon({
  name,
  size = 20,
  variant = 'outline',
  className = '',
  style = {},
  onClick,
  loading = false,
  success = false,
  error = false,
  bounce = false,
  rotate = false,
  scale = true,
  glow = false,
  ...props
}: InteractiveIconProps) {
  const getCurrentIcon = () => {
    if (loading) return 'loader-2';
    if (success) return 'check';
    if (error) return 'x';
    return name;
  };

  const getCurrentColor = () => {
    if (success) return 'var(--color-status-success)';
    if (error) return 'var(--color-status-danger)';
    return style.color || 'currentColor';
  };

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        ...style,
        color: getCurrentColor()
      }}
      onClick={onClick}
      initial={false}
      animate={{
        rotate: loading ? 360 : rotate ? [0, 5, -5, 0] : 0,
        y: bounce ? [0, -2, 0] : 0,
        scale: success || error ? [1, 1.2, 1] : 1,
        boxShadow: glow ? `0 0 20px ${getCurrentColor()}40` : 'none'
      }}
      transition={{
        rotate: {
          duration: loading ? 1 : 0.5,
          repeat: loading ? Infinity : rotate ? Infinity : 0,
          ease: loading ? "linear" : "easeInOut",
          repeatDelay: rotate ? 2 : 0
        },
        y: {
          duration: 0.6,
          repeat: bounce ? Infinity : 0,
          ease: "easeInOut"
        },
        scale: {
          duration: 0.3,
          ease: "easeOut"
        },
        boxShadow: {
          duration: 0.3
        }
      }}
      whileHover={onClick && scale ? {
        scale: 1.1,
        rotate: 5,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={onClick && scale ? {
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {}}
    >
      <Icon
        name={getCurrentIcon()}
        size={size}
        variant={variant}
        {...props}
      />
    </motion.div>
  );
}

export default InteractiveIcon;