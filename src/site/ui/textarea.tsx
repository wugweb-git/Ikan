import * as React from "react";

import { cn } from "./utils";

// Filter out Figma inspector internal props (_fg*) to prevent React DOM warnings
function filterFigmaProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {};
  for (const key in props) {
    if (!key.startsWith('_fg')) {
      filtered[key] = props[key];
    }
  }
  return filtered;
}

function Textarea({ className, style, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none placeholder:text-muted-foreground focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full px-3 py-2 transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{
        minHeight: 'var(--ikan-component-input-height)',
        borderRadius: 'var(--ikan-component-border-radius)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-regular)',
        backgroundColor: 'white',
        border: '1.5px solid #D1D5DB',
        color: 'var(--color-text-primary)',
        ...style
      }}
      {...filterFigmaProps(props)}
    />
  );
}

export { Textarea };