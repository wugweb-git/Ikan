import React from 'react';
import { WizardConfig, WizardState } from './types';
import { useWizard } from './useWizard';
import { WizardStep } from './WizardStep';
import { WizardControls } from './WizardControls';
import { WizardProgress } from './WizardProgress';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { cn } from '../ui/utils';
import { motion, AnimatePresence } from 'motion/react';

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
  const showChrome = !isIntro && !isOutro;

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

  return (
    <div className={cn("min-h-screen bg-[var(--color-bg-page)] flex flex-col", className)}>
      {/* Header */}
      <header className="px-[var(--spacing-4)] py-[var(--spacing-4)] flex items-center justify-between sticky top-0 bg-[var(--color-bg-page)]/95 backdrop-blur-sm z-10">
        {showChrome && (
          <>
            <div className="flex-1 flex justify-start">
               {/* Back button logic handled in Controls generally, but sometimes we want a top-left back */}
            </div>
            
            <div className="flex-1 flex justify-center">
              {config.showProgress && (
                <WizardProgress 
                   currentStep={currentStepIndex} 
                   totalSteps={totalSteps} 
                   type={config.progressType || 'dots'} 
                   className={config.progressType === 'dots' ? "" : "w-32"}
                />
              )}
            </div>
          </>
        )}
        
        <div className="flex-1 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={saveAndExit} 
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-[var(--spacing-2)]"
          >
            <X size={24} />
          </Button>
        </div>
      </header>
      
      {/* Progress Bar (Line) if configured */}
      {showChrome && config.progressType === 'bar' && (
        <WizardProgress currentStep={currentStepIndex} totalSteps={totalSteps} type="bar" />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-[var(--spacing-4)] pb-[var(--spacing-4)] w-full max-w-2xl mx-auto">
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <AnimatePresence mode="wait">
             <WizardStep 
               key={currentStep.id}
               step={currentStep}
               answers={answers}
               onAnswerChange={(id, val) => {
                   setAnswer(id, val);
               }}
               onAutoAdvance={handleAutoAdvance}
             />
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <WizardControls 
          onNext={goToNext}
          onBack={goToPrevious}
          onSkip={handleSkip}
          isFirst={currentStepIndex === 0}
          isLast={currentStepIndex === totalSteps - 1}
          isSubmitting={isSubmitting}
          nextLabel={currentStep.nextLabel}
          backLabel={currentStep.backLabel}
        />
        
        {/* Soft Reset Debug/Feature (only if enabled) */}
        {currentStep.rules?.resettable && (
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