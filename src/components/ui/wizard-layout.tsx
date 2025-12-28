import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { WizardStepper, WizardStep } from './wizard-stepper';

interface WizardLayoutProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext?: () => void | Promise<void>;
  onPrevious?: () => void;
  onFinish?: () => void | Promise<void>;
  children: React.ReactNode;
  allowSkip?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
  finishButtonText?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
}

export function WizardLayout({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onFinish,
  children,
  allowSkip = false,
  nextButtonText = 'Continue',
  previousButtonText = 'Back',
  finishButtonText = 'Complete',
  isNextDisabled = false,
  isLoading = false
}: WizardLayoutProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    if (isLastStep && onFinish) {
      await onFinish();
    } else if (onNext) {
      await onNext();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Stepper Header */}
      <div 
        className="border-b"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-default)',
          paddingTop: 'var(--spacing-8)',
          paddingBottom: 'var(--spacing-6)'
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <WizardStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepChange}
            allowSkip={allowSkip}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>

      {/* Footer Navigation */}
      <div
        className="border-t"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-default)',
          padding: 'var(--spacing-4) var(--spacing-6)'
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep || isLoading}
            style={{
              height: '44px',
              borderRadius: 'var(--radius-md)',
              gap: 'var(--spacing-2)',
              paddingLeft: 'var(--spacing-4)',
              paddingRight: 'var(--spacing-5)',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: '15px'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            {previousButtonText}
          </Button>

          <div 
            style={{
              fontSize: '14px',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-muted)'
            }}
          >
            Step {currentStep + 1} of {steps.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={isNextDisabled || isLoading}
            style={{
              height: '44px',
              borderRadius: 'var(--radius-md)',
              gap: 'var(--spacing-2)',
              paddingLeft: 'var(--spacing-5)',
              paddingRight: 'var(--spacing-4)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'white',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: '15px'
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4" />
                Saving...
              </>
            ) : (
              <>
                {isLastStep ? finishButtonText : nextButtonText}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
