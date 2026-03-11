import { cn } from './utils';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Stepper({ 
  steps, 
  currentStep, 
  onStepClick,
  orientation = 'horizontal',
  className 
}: StepperProps) {
  return (
    <div 
      className={cn(
        orientation === 'horizontal' ? 'flex items-center' : 'flex flex-col',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && index < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div 
              className={cn(
                "flex items-center gap-3",
                orientation === 'vertical' && "pb-8"
              )}
            >
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center justify-center rounded-full transition-all",
                  isClickable && "cursor-pointer hover:scale-110"
                )}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: isCompleted || isCurrent 
                    ? 'var(--color-primary-default)' 
                    : 'var(--color-bg-muted)',
                  color: isCompleted || isCurrent 
                    ? 'var(--color-primary-on)' 
                    : 'var(--color-text-muted)',
                  borderRadius: 'var(--radius-full, 9999px)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {isCompleted ? (
                  <Check size={16} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Step Label */}
              <div className={cn(orientation === 'horizontal' && 'hidden md:block')}>
                <div 
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: isCurrent 
                      ? 'var(--color-text-primary)' 
                      : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {step.label}
                  {step.optional && (
                    <span 
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        marginLeft: 'var(--spacing-1)'
                      }}
                    >
                      (optional)
                    </span>
                  )}
                </div>
                {step.description && (
                  <div 
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      marginTop: 'var(--spacing-1)',
                      fontFamily: 'var(--font-family-base)'
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  orientation === 'horizontal' ? 'flex-1 h-0.5 mx-4' : 'w-0.5 h-8 ml-4 -mt-8 mb-0'
                )}
                style={{
                  backgroundColor: index < currentStep 
                    ? 'var(--color-primary-default)' 
                    : 'var(--color-border-default)'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Stepper;