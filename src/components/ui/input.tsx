import * as React from "react";
import { cn } from "./utils";

export interface InputProps extends React.ComponentProps<"input"> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, startIcon, endIcon, ...props }, ref) => {
    const hasIcon = startIcon || endIcon;
    
    // Base input classes
    const inputClasses = cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full min-w-0 px-3 py-1 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        hasIcon && "border-0 focus-visible:ring-0 shadow-none bg-transparent h-full px-0", 
        className
    );
    
    if (hasIcon) {
       return (
         <div 
            className={cn(
              "flex items-center gap-2 px-3 transition-colors focus-within:ring-ring/50 focus-within:ring-[3px]",
               // Apply border class if it was passed in props, otherwise default border
               className?.includes("border-") ? "" : "border"
            )}
            style={{
                height: 'var(--ikan-component-input-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                backgroundColor: 'var(--color-bg-input)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)',
                ...style
            }}
         >
            {startIcon && <div className="text-[var(--color-text-muted)] flex-shrink-0">{startIcon}</div>}
            <input
               type={type}
               className="w-full h-full bg-transparent border-none outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
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
        className={inputClasses}
        style={{
          height: 'var(--ikan-component-input-height)',
          borderRadius: 'var(--ikan-component-border-radius)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-regular)',
          minHeight: 'var(--ikan-component-input-height)',
          backgroundColor: 'var(--color-bg-input)',
          border: '1px solid var(--color-border-default)',
          color: 'var(--color-text-primary)',
          ...style
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };