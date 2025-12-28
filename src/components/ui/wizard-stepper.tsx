import React from 'react';
import { Check } from 'lucide-react';
import { cn } from './utils';

export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  status: 'completed' | 'current' | 'upcoming';
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
    
    // Allow clicking on completed steps or current step
    if (allowSkip || index <= currentStep || steps[index].status === 'completed') {
      onStepClick(index);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-start justify-between relative px-4">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isClickable = allowSkip || index <= currentStep || isCompleted;

          return (
            <React.Fragment key={step.id}>
              {/* Step Container */}
              <div className="flex flex-col items-center relative" style={{ flex: 1, maxWidth: '200px' }}>
                {/* Step Circle */}
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "relative flex items-center justify-center rounded-full transition-all duration-300 shrink-0 z-10",
                    isClickable ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"
                  )}
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: isCompleted || isCurrent 
                      ? 'var(--color-primary-default)' 
                      : '#E9EBEF',
                    border: 'none',
                    boxShadow: isCurrent 
                      ? '0 0 0 3px rgba(42, 42, 42, 0.1)' 
                      : 'none'
                  }}
                >
                  {isCompleted ? (
                    <Check 
                      size={24} 
                      strokeWidth={2.5}
                      style={{ color: 'white' }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family-base)',
                        color: isCurrent ? 'white' : '#9CA3AF'
                      }}
                    >
                      {index + 1}
                    </span>
                  )}
                </button>

                {/* Step Label */}
                <div className="mt-3 text-center px-2">
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-base)',
                      color: isCurrent || isCompleted
                        ? 'var(--color-text-primary)' 
                        : 'var(--color-text-muted)',
                      marginBottom: '4px',
                      lineHeight: '1.4'
                    }}
                  >
                    {step.title}
                  </p>
                  {step.subtitle && (
                    <p
                      style={{
                        fontSize: '12px',
                        fontFamily: 'var(--font-family-base)',
                        fontWeight: 'var(--font-weight-regular)',
                        color: 'var(--color-text-muted)',
                        lineHeight: '1.3'
                      }}
                    >
                      {step.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className="flex items-center justify-center"
                  style={{
                    position: 'relative',
                    top: '24px',
                    flex: 1,
                    height: '2px',
                    marginLeft: '-16px',
                    marginRight: '-16px',
                    zIndex: 0
                  }}
                >
                  <div
                    className="transition-all duration-300"
                    style={{
                      width: '100%',
                      height: '2px',
                      backgroundColor: isCompleted 
                        ? 'var(--color-primary-default)' 
                        : '#E5E7EB',
                      borderRadius: '2px'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}