import { Button } from '../ui/button';
import { ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

interface WizardControlsProps {
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  isFirst: boolean;
  isLast: boolean;
  canNext?: boolean; // If false, disable next
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  className?: string;
}

export function WizardControls({
  onNext,
  onBack,
  onSkip,
  isFirst,
  isLast,
  canNext = true,
  isSubmitting = false,
  nextLabel,
  backLabel,
  skipLabel,
  className
}: WizardControlsProps) {
  return (
    <div className={cn("mt-[var(--spacing-8)] space-y-[var(--spacing-3)]", className)}>
      <Button
        onClick={onNext}
        disabled={!canNext || isSubmitting}
        className={cn(
          "w-full min-h-[56px] rounded-[var(--radius-md)] flex items-center justify-center gap-[var(--spacing-2)]",
          "bg-[var(--color-primary-default)] text-[var(--color-primary-on)]",
          "hover:opacity-90 transition-all shadow-[var(--shadow-sm)]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Processing...
          </>
        ) : (
          <>
            {nextLabel || (isLast ? 'Complete' : 'Continue')}
            {!isLast && <ChevronRight size={20} />}
          </>
        )}
      </Button>

      <div className="flex justify-between items-center px-[var(--spacing-1)]">
        {!isFirst ? (
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isSubmitting}
            className={cn(
              "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
              "h-auto py-[var(--spacing-2)] px-0 min-h-[44px]"
            )}
          >
            <ArrowLeft size={16} className="mr-2" />
            {backLabel || 'Back'}
          </Button>
        ) : (
            // Spacer to keep layout balanced if Skip is present
            <div />
        )}

        {onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={isSubmitting}
            className={cn(
              "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
              "h-auto py-[var(--spacing-2)] px-0 min-h-[44px]"
            )}
          >
            {skipLabel || 'Skip for now'}
          </Button>
        )}
      </div>
    </div>
  );
}