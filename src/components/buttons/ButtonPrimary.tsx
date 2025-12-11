import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { useCleanupEffect } from '../../hooks/useCleanupEffect';

interface ButtonPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  leadingIcon?: string;
  trailingIcon?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function ButtonPrimary({ 
  children, 
  loading = false,
  success = false,
  error = false, 
  leadingIcon, 
  trailingIcon,
  size = 'md',
  fullWidth = false,
  disabled,
  className,
  onClick,
  ...props 
}: ButtonPrimaryProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const isDisabled = disabled || loading;

  // Handle success/error state changes with cleanup
  useCleanupEffect((cleanup) => {
    if (success && !showSuccess) {
      setShowSuccess(true);
      cleanup.addTimeout(setTimeout(() => {
        if (cleanup.isMounted()) {
          setShowSuccess(false);
        }
      }, 2000));
    }
  }, [success, showSuccess]);

  useCleanupEffect((cleanup) => {
    if (error && !showError) {
      setShowError(true);
      cleanup.addTimeout(setTimeout(() => {
        if (cleanup.isMounted()) {
          setShowError(false);
        }
      }, 2000));
    }
  }, [error, showError]);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    onClick?.(e);
  };

  const getButtonColor = () => {
    if (showSuccess) return 'var(--color-status-success)';
    if (showError) return 'var(--color-status-danger)';
    if (isDisabled) return 'var(--color-neutral-400)';
    return 'var(--color-primary-default)';
  };

  const getCurrentIcon = () => {
    if (showSuccess) return 'check';
    if (showError) return 'x';
    if (loading) return null;
    return leadingIcon;
  };

  return (
    <motion.button
      {...props}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-medium overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "touch-manipulation select-none",
        fullWidth && "w-full",
        sizeClasses[size],
        className
      )}
      style={{
        color: 'var(--color-primary-on)',
        borderRadius: 'var(--ikan-component-border-radius)',
        minWidth: fullWidth ? '100%' : 'var(--constraint-component-min)',
        maxWidth: fullWidth ? '100%' : 'var(--constraint-component-max)',
        fontSize: size === 'sm' ? 'var(--text-sm)' : size === 'lg' ? 'var(--text-lg)' : 'var(--text-base)',
        fontWeight: 'var(--font-weight-medium)',
        height: 'var(--ikan-component-button-height)',
        ringColor: 'var(--color-primary-default)',
        ringOpacity: 0.3,
        border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer'
      }}
      initial={false}
      animate={{
        backgroundColor: getButtonColor(),
        scale: isPressed ? 0.98 : 1,
        y: isPressed ? 1 : 0
      }}
      whileHover={!isDisabled ? {
        y: -1,
        boxShadow: 'var(--shadow-md)',
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!isDisabled ? {
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {}}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.15
      }}
    >
      {/* Ripple effect overlay */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        initial={false}
        animate={isPressed ? {
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
          scale: [1, 1.5]
        } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Loading spinner */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="rounded-full h-4 w-4 border-b-2"
              style={{ borderColor: 'var(--color-primary-on)' }}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Leading icon with smooth transitions */}
      <AnimatePresence mode="wait">
        {getCurrentIcon() && !loading && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Icon 
              name={getCurrentIcon()!} 
              size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
              variant="roundedOutline"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Button text with fade animations */}
      <motion.span 
        className="text-center"
        initial={false}
        animate={{
          opacity: loading ? 0.7 : 1,
          x: loading ? 10 : 0
        }}
        transition={{ duration: 0.2 }}
      >
        {showSuccess ? 'Success!' : showError ? 'Error' : children}
      </motion.span>
      
      {/* Trailing icon */}
      <AnimatePresence>
        {trailingIcon && !loading && !showSuccess && !showError && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Icon 
              name={trailingIcon} 
              size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
              variant="roundedOutline"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disabled state overlay */}
      {isDisabled && (
        <motion.div
          className="absolute inset-0 rounded pointer-events-none"
          initial={false}
          animate={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
          style={{
            borderRadius: 'var(--ikan-component-border-radius)'
          }}
        />
      )}
    </motion.button>
  );
}