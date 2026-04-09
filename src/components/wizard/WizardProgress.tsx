import { cn } from '../ui/utils';
import { motion } from 'framer-motion';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  type?: 'bar' | 'dots' | 'count';
  className?: string;
}

export function WizardProgress({ currentStep, totalSteps, type = 'bar', className }: WizardProgressProps) {
  const progress = Math.min(100, Math.round(((currentStep + 1) / totalSteps) * 100));

  if (type === 'dots') {
    return (
      <div className={cn("flex justify-center gap-[var(--spacing-2)] h-1.5", className)}>
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "rounded-[var(--radius-pill)] transition-all duration-300 ease-out",
              idx === currentStep ? "w-8 bg-[var(--color-primary-default)]" : 
              idx < currentStep ? "w-1.5 bg-[var(--color-primary-default)]/40" : 
              "w-1.5 bg-[var(--color-bg-muted)]"
            )}
          />
        ))}
      </div>
    );
  }

  if (type === 'count') {
     return (
        <div className={cn("text-[var(--color-text-muted)] uppercase tracking-widest text-center", className)}>
           Step {currentStep + 1} of {totalSteps}
        </div>
     );
  }

  // Default: Bar
  return (
    <div className={cn("h-1 bg-[var(--color-bg-muted)] w-full", className)}>
      <motion.div
        className="h-full bg-[var(--color-primary-default)]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}