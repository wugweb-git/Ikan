import * as React from "react";
import { cn } from "./utils";

export interface InputProps extends React.ComponentProps<"input"> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, startIcon, endIcon, ...props }, ref) => {
    const hasIcon = startIcon || endIcon;
    
    // Common styles for both input types to ensure consistency
    const commonStyles = {
      height: 'var(--ikan-component-input-height)',
      borderRadius: 'var(--ikan-component-border-radius)',
      backgroundColor: 'var(--color-bg-input)',
      color: 'var(--color-text-primary)',
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--font-weight-regular)',
      ...style
    };

    // Remove border from inline style if it exists, to allow class overrides
    // We'll apply the default border via class 'border' or inline if not overridden
    const borderStyle = style?.border ? {} : { border: '1px solid var(--color-border-default)' };

    if (hasIcon) {
       return (
         <div 
            className={cn(
              "flex items-center gap-2 px-3 transition-colors focus-within:border-[#1A1A1A] focus-within:ring-0",
               // Only apply default border class if no border color class is provided
               // This prevents double borders if 'border' class was used with 'border-destructive'
               !className?.includes("border-") && "border",
               className
            )}
            style={{
                ...commonStyles,
                ...borderStyle,
                // Ensure the wrapper takes the width/height/background
            }}
         >
            {startIcon && <div className="text-[var(--color-text-muted)] flex-shrink-0">{startIcon}</div>}
            <input
               type={type}
               className="w-full h-full bg-transparent border-none outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:ring-0 shadow-none p-0 m-0"
               ref={ref}
               {...props}
            />
            {endIcon && <div className="text-[var(--color-text-muted)] flex-shrink-0">{endIcon}</div>}
         </div>
       )
    }

    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex w-full min-w-0 px-3 py-1 transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:ring-0 focus-visible:border-[#1A1A1A]",
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          // Apply default border class if not overridden
          !className?.includes("border-") && "border",
          className
        )}
        style={{
          ...commonStyles,
          ...borderStyle
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
