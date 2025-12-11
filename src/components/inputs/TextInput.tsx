import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { useCleanupEffect } from '../../hooks/useCleanupEffect';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  onIconClick?: () => void;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  success?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  loading?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  onIconClick,
  fullWidth = false,
  variant = 'default',
  success = false,
  showCharacterCount = false,
  maxLength,
  loading = false,
  disabled,
  readOnly,
  className,
  onFocus,
  onBlur,
  value,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasShakeError, setHasShakeError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasError = !!error;
  const characterCount = value?.toString().length || 0;

  // Handle error shake animation with cleanup
  useCleanupEffect((cleanup) => {
    if (hasError && !hasShakeError) {
      setHasShakeError(true);
      cleanup.addTimeout(setTimeout(() => {
        if (cleanup.isMounted()) {
          setHasShakeError(false);
        }
      }, 500));
    }
  }, [hasError, hasShakeError]);

  // Handle success state with cleanup
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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (hasError) return 'var(--color-status-danger)';
    if (showSuccess) return 'var(--color-status-success)';
    if (isFocused) return 'var(--color-primary-default)';
    return 'var(--color-border-default)';
  };

  const getBackgroundColor = () => {
    if (disabled) return 'var(--color-neutral-200)';
    if (readOnly) return 'var(--color-bg-muted)';
    if (variant === 'filled') return 'var(--color-bg-muted)';
    return 'var(--color-bg-input)';
  };

  return (
    <motion.div 
      className={cn(
        "space-y-2",
        fullWidth && "w-full",
        className
      )}
      style={{
        minWidth: fullWidth ? '100%' : 'var(--constraint-input-min)',
        maxWidth: fullWidth ? '100%' : 'var(--constraint-input-max)'
      }}
      initial={false}
      animate={hasShakeError ? {
        x: [-5, 5, -5, 5, 0],
        transition: { duration: 0.5, ease: "easeInOut" }
      } : {}}
    >
      {label && (
        <motion.label 
          className="block"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
          }}
          initial={false}
          animate={{
            color: hasError 
              ? 'var(--color-status-danger)' 
              : showSuccess 
                ? 'var(--color-status-success)' 
                : 'var(--color-text-primary)'
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      
      <motion.div 
        className="relative"
        initial={false}
        animate={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: getBorderColor(),
          borderRadius: 'var(--ikan-component-border-radius)',
          backgroundColor: getBackgroundColor()
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {leadingIcon && (
          <motion.div 
            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            initial={false}
            animate={{
              scale: isFocused ? 1.1 : 1,
              rotate: loading ? 360 : 0
            }}
            transition={{ 
              scale: { duration: 0.2 },
              rotate: { duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }
            }}
          >
            <Icon 
              name={loading ? 'loader-2' : leadingIcon}
              size={16}
              variant="outline"
              style={{ 
                color: hasError 
                  ? 'var(--color-status-danger)' 
                  : showSuccess 
                    ? 'var(--color-status-success)'
                    : isFocused 
                      ? 'var(--color-primary-default)' 
                      : 'var(--color-text-muted)',
                transition: 'color var(--ikan-animation-normal) ease'
              }}
            />
          </motion.div>
        )}
        
        <motion.input
          ref={ref}
          {...props}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full outline-none placeholder:text-muted-foreground",
            leadingIcon && "pl-10",
            trailingIcon && "pr-10",
            !leadingIcon && !trailingIcon && "px-3",
            disabled && "cursor-not-allowed",
            readOnly && "cursor-default"
          )}
          style={{
            backgroundColor: getBackgroundColor(),
            borderRadius: 'var(--ikan-component-border-radius)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)',
            color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            padding: (leadingIcon || trailingIcon) ? '12px 12px' : '12px',
            paddingLeft: leadingIcon ? '40px' : '12px',
            paddingRight: trailingIcon ? '40px' : '12px',
            height: 'var(--ikan-component-input-height)',
            border: 'none' // Remove default border, use motion border
          }}
          initial={false}
          animate={{
            borderColor: getBorderColor(),
            scale: isFocused ? 1.01 : 1,
            boxShadow: isFocused 
              ? `0 0 0 2px ${hasError ? 'var(--color-status-danger)' : showSuccess ? 'var(--color-status-success)' : 'var(--color-primary-default)'}20`
              : 'none'
          }}
          whileFocus={{
            scale: 1.01,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            duration: 0.2
          }}
        />
        
        <AnimatePresence>
          {(trailingIcon || showSuccess || hasError) && (
            <motion.div 
              className={cn(
                "absolute inset-y-0 right-0 pr-3 flex items-center",
                onIconClick && "cursor-pointer"
              )}
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              whileHover={onIconClick ? { scale: 1.1 } : {}}
              whileTap={onIconClick ? { scale: 0.95 } : {}}
            >
              <Icon 
                name={showSuccess ? 'check' : hasError ? 'alert-circle' : trailingIcon || ''}
                size={16}
                variant="outline"
                onClick={onIconClick}
                style={{ 
                  color: hasError 
                    ? 'var(--color-status-danger)' 
                    : showSuccess 
                      ? 'var(--color-status-success)'
                      : isFocused 
                        ? 'var(--color-primary-default)' 
                        : 'var(--color-text-muted)',
                  transition: 'color var(--ikan-animation-normal) ease'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {(error || helperText || (showCharacterCount && maxLength)) && (
          <motion.div 
            className="flex justify-between items-center"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <motion.div
              className="text-sm"
              style={{
                fontSize: 'var(--text-sm)',
              }}
              initial={false}
              animate={{
                color: error 
                  ? 'var(--color-status-danger)' 
                  : showSuccess 
                    ? 'var(--color-status-success)' 
                    : 'var(--color-text-muted)'
              }}
              transition={{ duration: 0.2 }}
            >
              {error || helperText}
            </motion.div>
            
            {showCharacterCount && maxLength && (
              <motion.div
                className="text-sm tabular-nums"
                style={{
                  fontSize: 'var(--text-xs)',
                }}
                initial={false}
                animate={{
                  color: characterCount > maxLength * 0.8 
                    ? characterCount >= maxLength 
                      ? 'var(--color-status-danger)'
                      : 'var(--color-status-warning)'
                    : 'var(--color-text-muted)',
                  scale: characterCount >= maxLength ? 1.05 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                {characterCount}/{maxLength}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});