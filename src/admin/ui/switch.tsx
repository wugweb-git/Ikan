import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "./utils"

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

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...filterFigmaProps(props)}
    ref={ref}
    style={{
      backgroundColor: props.checked ? 'var(--color-primary-default)' : 'var(--color-bg-input)',
      borderRadius: 'var(--radius-full, 9999px)',
      height: '20px',
      width: '36px',
      ...props.style
    }}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-full, 9999px)',
        height: '16px',
        width: '16px'
      }}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }