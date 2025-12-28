import React from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';
import { cn } from './utils';

export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  status: 'completed' | 'current' | 'upcoming';
  metadata?: string; // "3 questions", "0 days"
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  allowSkip?: boolean;
}

export function WizardStepper({ steps, currentStep, onStepClick, allowSkip = false }: WizardStepperProps) {
  const handleStepClick = (index: number) => {
    if (!onStepClick) return;
    
    // Allow clicking on completed steps or current step, or any if skip allowed
    if (allowSkip || index <= currentStep || steps[index].status === 'completed') {
      onStepClick(index);
    }
  };

  return (
    <div className="flex items-center space-x-1 md:space-x-6 w-full max-w-3xl">
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed' || index < currentStep;
        const isCurrent = step.status === 'current' || index === currentStep;
        const isClickable = allowSkip || index <= currentStep || isCompleted;

        return (
          <React.Fragment key={step.id}>
            {/* Step Item */}
            <button
              onClick={() => handleStepClick(index)}
              disabled={!isClickable}
              className={cn(
                "group flex items-center gap-3 transition-all outline-none text-left",
                isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              )}
            >
              {/* Indicator Circle */}
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 shrink-0",
                  isCompleted 
                    ? "bg-[var(--color-primary-default)] border-[var(--color-primary-default)] text-white" 
                    : isCurrent
                      ? "border-[var(--color-primary-default)] border-2 text-[var(--color-primary-default)] bg-white"
                      : "border-gray-200 text-gray-400 bg-transparent group-hover:border-gray-300"
                )}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Text Content (Hidden on small mobile, visible on larger) */}
              <div className="hidden sm:flex flex-col">
                <span className={cn(
                  "text-sm font-medium leading-none mb-1 transition-colors",
                  isCurrent ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
                )}>
                  {step.title}
                </span>
                {step.metadata && (
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
                    {step.metadata}
                  </span>
                )}
              </div>
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-[1px] bg-gray-200 min-w-[10px] hidden sm:block" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
