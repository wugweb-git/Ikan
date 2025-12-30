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
  footerRightContent
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
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* 1. TYPEFORM-STYLE HEADER */}
      <header 
        className="flex items-center justify-between px-6 h-[64px] bg-white border-b border-gray-100 sticky top-0 z-20"
      >
        {/* Left: Program Name */}
        <div className="flex items-center gap-3 w-[250px]">
          <h1 className="text-sm font-semibold text-gray-900 truncate">
            {title}
          </h1>
          <Badge 
            variant={status === 'published' ? 'default' : 'secondary'}
            className={cn(
              "text-[10px] px-1.5 py-0.5 h-auto font-medium rounded-md", 
              status === 'published' ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
            )}
          >
            {status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>

        {/* Center: Stepper */}
        <div className="flex-1 flex justify-center">
          <WizardStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepChange}
            allowSkip={allowSkip}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-4 w-[250px]">
          {onSaveDraft && (
            <button 
              onClick={onSaveDraft} 
              disabled={isLoading}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Save Draft</span>
            </button>
          )}
          
          <div className="h-4 w-px bg-gray-200 mx-1" />
          
          {onExit && (
            <button 
              onClick={onExit} 
              className="text-gray-400 hover:text-gray-900 transition-colors p-1"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden bg-gray-50/30">
        
        {/* 3. PRIMARY WORK AREA */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="max-w-5xl mx-auto px-8 py-12 pb-32">
            
            {/* Step Header */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                {stepTitle || steps[currentStep]?.title}
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed">
                {stepDescription || steps[currentStep]?.subtitle}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
              {children}
            </div>
          </div>
        </main>

        {/* 4. SECONDARY PANEL (Right Sidebar) */}
        {secondaryContent && (
          <aside className="hidden xl:block w-[360px] border-l border-gray-100 bg-white overflow-y-auto shadow-[rgba(0,0,0,0.03)_0px_0px_10px_0px_inset]">
            <div className="p-8 sticky top-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Eye size={12} /> Guide & Preview
              </h3>
              <div className="prose prose-sm max-w-none text-gray-600 prose-headings:text-gray-800 prose-strong:text-gray-900">
                {secondaryContent}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 5. FOOTER ACTION BAR */}
      <footer className="h-[80px] bg-white border-t border-gray-100 px-8 flex items-center justify-between shrink-0 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] sticky bottom-0">
        <div className="flex items-center gap-4">
          {/* Custom Left Content (e.g. Delete) */}
          {footerLeftContent}
          
          {!isFirstStep && (
            <button
              onClick={handlePrevious}
              disabled={isPreviousDisabled || isLoading}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
              {previousButtonText}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {validationHint && isNextDisabled && (
            <span className="text-sm text-amber-600 hidden md:inline-block animate-pulse font-medium bg-amber-50 px-3 py-1 rounded-full">
              {validationHint}
            </span>
          )}
          
          {/* Custom Right Content (e.g. Publish) */}
          {footerRightContent}

          <Button
            onClick={handleNext}
            disabled={isNextDisabled || isLoading}
            className={cn(
              "min-w-[120px] gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95",
              isLoading ? "opacity-80" : "",
              "bg-gray-900 hover:bg-black text-white rounded-lg h-12 px-6"
            )}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full border-2 border-white/30 border-t-white w-4 h-4" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="font-medium text-[15px]">{isLastStep ? finishButtonText : nextButtonText}</span>
                {!isLastStep && <ArrowRight size={16} />}
                {isLastStep && <Check size={16} />}
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}