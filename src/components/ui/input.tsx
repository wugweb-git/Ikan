import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 border px-3 py-1 bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      style={{
        height: 'var(--ikan-component-input-height)',
        borderRadius: 'var(--ikan-component-border-radius)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-regular)',
        minHeight: 'var(--ikan-component-input-height)',
        ...style
      }}
      {...props}
    />
  );
}

export { Input };
