import React from 'react';
import { ChevronLeft, ChevronRight, X, Save, Eye, Trash2, ArrowRight, Check } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { WizardStepper, WizardStep } from './wizard-stepper';
import { cn } from './utils';

export interface WizardLayoutProps {
  // Header
  title?: string;
  status?: 'draft' | 'published';
  onExit?: () => void;
  onSaveDraft?: () => void;
  onPreview?: () => void;
  headerActions?: React.ReactNode;

  // Stepper
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  allowSkip?: boolean;

  // Content
  children: React.ReactNode;
  stepTitle?: string;
  stepDescription?: string;
  secondaryContent?: React.ReactNode;

  // Footer
  onNext?: () => void | Promise<void>;
  onPrevious?: () => void;
  onFinish?: () => void | Promise<void>;
  nextButtonText?: string;
  previousButtonText?: string;
  finishButtonText?: string;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
  isLoading?: boolean;
  validationHint?: string;
  
  // Custom Footer Actions (replaces default footer content if provided, or appends)
  footerLeftContent?: React.ReactNode;
  footerRightContent?: React.ReactNode;
  fullWidth?: boolean; // NEW: Allow full width content
}

export function WizardLayout({
  title = 'Untitled Program',
  status = 'draft',
  onExit,
  onSaveDraft,
  onPreview,
  headerActions,
  steps,
  currentStep,
  onStepChange,
  allowSkip = false,
  children,
  stepTitle,
  stepDescription,
  secondaryContent,
  onNext,
  onPrevious,
  onFinish,
  nextButtonText = 'Continue',
  previousButtonText = 'Back',
  finishButtonText = 'Complete',
  isNextDisabled = false,
  isPreviousDisabled = false,
  isLoading = false,
  validationHint,
  footerLeftContent,
  footerRightContent,
  fullWidth = false
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
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      {/* REDESIGNED STICKY HEADER - Multi-row layout */}
      <header 
        className="sticky top-0 bg-white border-b border-gray-200 z-20 shadow-sm flex-shrink-0"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Row 1: Title + Action Buttons */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-gray-100">
          {/* Left: Title + Badge + Back Button */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 
                className="truncate max-w-[300px]" 
                style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: 500,
                  color: 'var(--color-text-primary)'
                }}
              >
                {title}
              </h1>
              <Badge 
                variant={status === 'published' ? 'default' : 'secondary'}
                className={cn(
                  "text-[10px] px-2 py-0.5 h-auto rounded-md", 
                  status === 'published' ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                )}
                style={{ fontWeight: 500 }}
              >
                {status === 'published' ? 'Published' : 'Draft'}
              </Badge>
            </div>
            
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                disabled={isPreviousDisabled || isLoading}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}
              >
                <ChevronLeft size={14} />
                <span className="text-xs">{previousButtonText}</span>
              </button>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Custom Footer Left Content (e.g., Delete) */}
            {footerLeftContent}
            
            {/* Custom Footer Right Content (e.g., Save Draft, Publish) */}
            {footerRightContent}
            
            {/* Continue/Finish Button */}
            <Button
              onClick={handleNext}
              disabled={isNextDisabled || isLoading}
              className={cn(
                "gap-1.5 transition-all duration-200 h-8 px-4 rounded-lg text-xs",
                isLoading ? "opacity-80" : ""
              )}
              style={{
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-text-inverse)',
                fontWeight: 500
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-white/30 border-t-white w-3.5 h-3.5" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLastStep ? finishButtonText : nextButtonText}</span>
                  {!isLastStep && <ArrowRight size={14} />}
                  {isLastStep && <Check size={14} />}
                </>
              )}
            </Button>
            
            {onExit && (
              <button 
                onClick={onExit} 
                className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-100 ml-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Stepper */}
        <div className="px-6 py-3 bg-gray-50/50">
          <div className="max-w-3xl mx-auto">
            <WizardStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={onStepChange}
              allowSkip={allowSkip}
            />
          </div>
        </div>
      </header>

      {/* Main Container - Fixed height with overflow */}
      <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        
        {/* PRIMARY WORK AREA */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className={cn(
            "px-6 py-8",
            fullWidth ? "max-w-full" : "max-w-4xl"
          )}>
            
            {/* Step Header */}
            {(stepTitle || stepDescription) && (
              <div className="mb-8">
                <h2 
                  className="mb-2"
                  style={{ 
                    fontSize: 'var(--text-2xl)', 
                    fontWeight: 500,
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {stepTitle || steps[currentStep]?.title}
                </h2>
                {stepDescription && (
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-muted)'
                  }}>
                    {stepDescription}
                  </p>
                )}
              </div>
            )}

            {/* Content */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>

        {/* SECONDARY PANEL (Right Sidebar) */}
        {secondaryContent && (
          <aside className="hidden xl:block w-[360px] border-l border-gray-200 bg-white overflow-y-auto shadow-sm">
            <div className="p-8 sticky top-0">
              <h3 
                className="uppercase tracking-wider mb-6 flex items-center gap-2"
                style={{ 
                  fontSize: 'var(--text-xs)', 
                  fontWeight: 500,
                  color: 'var(--color-text-muted)'
                }}
              >
                <Eye size={12} /> Guide & Preview
              </h3>
              <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text-muted)' }}>
                {secondaryContent}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}