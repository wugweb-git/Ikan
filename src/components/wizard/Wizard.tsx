import React from 'react';
import { WizardConfig, WizardState } from './types';
import { useWizard } from './useWizard';
import { WizardStep } from './WizardStep';
import { WizardControls } from './WizardControls';
import { WizardProgress } from './WizardProgress';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { cn } from '../ui/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface WizardProps {
  config: WizardConfig;
  initialData?: Record<string, any>;
  initialStepIndex?: number;
  onStepChange?: (state: WizardState) => void;
  onComplete?: (results: Record<string, any>) => void;
  onSave?: (state: WizardState) => void;
  onExit?: () => void;
  className?: string;
}

export function Wizard({
  config,
  initialData,
  context = {}, // Default to empty object
  initialStepIndex,
  onStepChange,
  onComplete,
  onSave,
  onExit,
  className
}: WizardProps) {
  // Debug log to prove unified engine is active
  React.useEffect(() => {
     console.log(`🧙 Unified Wizard Engine Active: ${config.id} (Mode: ${config.mode})`);
  }, [config.id, config.mode]);

  const {
    state,
    currentStep,
    totalSteps,
    goToNext,
    goToPrevious,
    setAnswer,
    setAnswers,
    resetStep,
    saveAndExit
  } = useWizard({
    config,
    initialData,
    initialStepIndex,
    onStepChange,
    onComplete,
    onSave,
    onExit
  });

  const { currentStepIndex, answers, isSubmitting } = state;

  // Determine if we should show standard chrome
  const isIntro = currentStep.type === 'intro';
  const isOutro = currentStep.type === 'outro';
  // Chrome (Header/Progress) should be hidden on Intro/Outro in 'centered' mode, 
  // but maybe visible in 'standard' mode depending on preference.
  // For unification, let's say 'centered' mode hides chrome on intro/outro.
  const showChrome = config.layout === 'centered' ? (!isIntro && !isOutro) : true;

  const handleSkip = currentStep.skippable || currentStep.rules?.skippable
    ? () => {
        // Just proceed without validation
        goToNext(); 
      }
    : undefined;

  // Auto-advance logic wrapper
  const handleAutoAdvance = () => {
      // Only auto-advance if it's the only field, or configured to do so
      // For now, if auto-advance is triggered, we just try to go next
      // But we should check if there are other required fields that are empty
      // Simplest logic: Try goNext(), if it fails (due to validation), it fails silently or shows error
      goToNext();
  };

  const layoutClasses = config.layout === 'centered' 
    ? "items-center justify-start max-w-[1280px] mx-auto pt-[112px] pb-32" 
    : "max-w-2xl mx-auto pt-[var(--spacing-8)]";

  return (
    <div className={cn("min-h-screen bg-[var(--color-bg-page)] flex flex-col transition-colors duration-500", className)}>
      {/* Header */}
      {showChrome && (
        <header className={cn(
          "px-[var(--spacing-4)] py-[var(--spacing-4)] flex items-center justify-between sticky top-0 z-10 transition-all",
          config.layout === 'centered' ? "fixed top-0 left-0 right-0 bg-transparent" : "bg-[var(--color-bg-page)]/95 backdrop-blur-sm"
        )}>
          {/* Progress Bar for Centered Layout */}
          {config.layout === 'centered' && config.progressType === 'bar' && (
             <motion.div 
               className="fixed top-0 left-0 right-0 h-1 bg-[var(--color-primary-default)] z-[60]"
               initial={{ scaleX: 0 }}
               animate={{ scaleX: (currentStepIndex + 1) / totalSteps }}
               transition={{ duration: 0.3, ease: 'easeOut' }}
               style={{ transformOrigin: 'left' }}
             />
          )}

          <div className="flex-1 flex justify-start">
             {/* Back button logic handled in Controls generally, but sometimes we want a top-left back */}
          </div>
          
          <div className="flex-1 flex justify-center">
            {config.showProgress && config.layout !== 'centered' && (
              <WizardProgress 
                 currentStep={currentStepIndex} 
                 totalSteps={totalSteps} 
                 type={config.progressType || 'dots'} 
                 className={config.progressType === 'dots' ? "" : "w-32"}
              />
            )}
          </div>
          
          <div className="flex-1 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={saveAndExit} 
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-[var(--spacing-2)] rounded-full hover:bg-[var(--color-bg-muted)]"
            >
              <X size={24} />
            </Button>
          </div>
        </header>
      )}
      
      {/* Progress Bar (Line) for Standard Layout */}
      {showChrome && config.layout !== 'centered' && config.progressType === 'bar' && (
        <WizardProgress currentStep={currentStepIndex} totalSteps={totalSteps} type="bar" />
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col px-[var(--spacing-4)] w-full",
        layoutClasses
      )}>
        <div className="flex-1 flex flex-col justify-start min-h-0 w-full max-w-[1280px]">
          <AnimatePresence mode="wait">
             <WizardStep 
               key={currentStep.id}
               step={currentStep}
               answers={answers}
               context={context} // Pass context for substitution
               mode={config.mode} // Pass mode for defaults
               onAnswerChange={(id, val) => {
                   setAnswer(id, val);
               }}
               onAutoAdvance={handleAutoAdvance}
               // Pass layout prop to step for specific styling (like huge intro text)
               layout={config.layout || 'standard'}
               onNext={goToNext} // Intro/Outro buttons need this
             />
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        {!isIntro && !isOutro && (
            config.layout === 'centered' ? (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border-default)] py-6 z-50">
                    <div className="max-w-[1280px] mx-auto px-10 w-full">
                        <WizardControls 
                          onNext={goToNext}
                          onBack={goToPrevious}
                          onSkip={handleSkip}
                          isFirst={currentStepIndex === 0}
                          isLast={currentStepIndex === totalSteps - 1}
                          isSubmitting={isSubmitting}
                          nextLabel={currentStep.nextLabel}
                          backLabel={currentStep.backLabel}
                          className="mt-0"
                        />
                    </div>
                </div>
            ) : (
                <WizardControls 
                  onNext={goToNext}
                  onBack={goToPrevious}
                  onSkip={handleSkip}
                  isFirst={currentStepIndex === 0}
                  isLast={currentStepIndex === totalSteps - 1}
                  isSubmitting={isSubmitting}
                  nextLabel={currentStep.nextLabel}
                  backLabel={currentStep.backLabel}
                  className=""
                />
            )
        )}
        
        {/* Soft Reset Debug/Feature (only if enabled) */}
        {currentStep.rules?.resettable && !isIntro && !isOutro && config.layout !== 'centered' && (
            <div className="mt-[var(--spacing-4)] text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetStep} 
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                    Reset this step
                </Button>
            </div>
        )}
      </main>
    </div>
  );
}