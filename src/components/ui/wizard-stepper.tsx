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
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 shrink-0",
                  isCompleted 
                    ? "bg-[#1A1A1A] border-[#1A1A1A] text-white" 
                    : isCurrent
                      ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                      : "border-[#D9D9D9] text-[#757575] bg-transparent group-hover:border-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>

              {/* Text Content */}
              <div className="hidden sm:flex flex-col items-start pt-1">
                <span className={cn(
                  "text-sm font-medium leading-none mb-1 transition-colors",
                  isCurrent ? "text-[#1A1A1A]" : "text-[#757575]"
                )}>
                  {step.title}
                </span>
                {step.metadata && (
                  <span className="text-[10px] text-[#9E9E9E] uppercase tracking-wide">
                    {step.metadata}
                  </span>
                )}
              </div>
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] bg-[#D9D9D9] min-w-[20px] hidden sm:block mx-4" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
