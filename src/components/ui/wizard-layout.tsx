import React from 'react';
import { ChevronLeft, ChevronRight, X, Save, Eye } from 'lucide-react';
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
  validationHint
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
    <div className="fixed inset-0 flex flex-col bg-[var(--color-bg-page)] z-50">
      {/* 1. GLOBAL HEADER (Sticky) */}
      <header 
        className="flex items-center justify-between px-6 h-[72px] bg-white border-b border-[var(--color-border-default)] shrink-0 z-20"
      >
        {/* Left: Program Name + Status */}
        <div className="flex items-center gap-4 w-1/4">
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-[var(--color-text-primary)] truncate max-w-[200px]">
              {title}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge 
                variant={status === 'published' ? 'default' : 'secondary'}
                className={cn(
                  "text-[10px] h-5 px-1.5", 
                  status === 'published' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                )}
              >
                {status === 'published' ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Center: Progress Indicator */}
        <div className="flex-1 flex justify-center max-w-2xl">
          <WizardStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepChange}
            allowSkip={allowSkip}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2 w-1/4">
          {headerActions ? headerActions : (
            <>
              {onPreview && (
                <Button variant="ghost" size="sm" onClick={onPreview} title="Preview">
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {onSaveDraft && (
                <Button variant="ghost" size="sm" onClick={onSaveDraft} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              )}
              {onExit && (
                <Button variant="ghost" size="sm" onClick={onExit} className="ml-2 text-gray-500 hover:text-red-600">
                  <X className="w-5 h-5" />
                </Button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 3. PRIMARY WORK AREA (65-70%) */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-page)] relative scroll-smooth">
          <div className="max-w-3xl mx-auto px-8 py-10 pb-32">
            
            {/* 2. STEP HEADER */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
                {stepTitle || steps[currentStep]?.title}
              </h2>
              <p className="text-[var(--color-text-muted)] text-base">
                {stepDescription || steps[currentStep]?.subtitle}
              </p>
            </div>

            {/* Work Area Content */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>

        {/* 4. SECONDARY PANEL (30-35%) - Hidden on mobile, collapsible on tablet */}
        {secondaryContent && (
          <aside className="hidden lg:block w-[350px] xl:w-[400px] border-l border-[var(--color-border-default)] bg-white overflow-y-auto">
            <div className="p-6 sticky top-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                Guide & Preview
              </h3>
              <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)]">
                {secondaryContent}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 5. FOOTER ACTION BAR (Sticky) */}
      <footer className="h-[80px] bg-white border-t border-[var(--color-border-default)] px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={isFirstStep || isPreviousDisabled || isLoading}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] pl-0 hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {previousButtonText}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {validationHint && isNextDisabled && (
            <span className="text-sm text-amber-600 hidden md:inline-block animate-pulse">
              {validationHint}
            </span>
          )}
          
          <Button
            onClick={handleNext}
            disabled={isNextDisabled || isLoading}
            className={cn(
              "min-w-[140px] gap-2 shadow-sm",
              isLoading ? "opacity-80" : ""
            )}
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4" />
                Processing...
              </>
            ) : (
              <>
                {isLastStep ? finishButtonText : nextButtonText}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
