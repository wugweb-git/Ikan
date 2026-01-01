
import React, { useState, useEffect, useCallback } from 'react';
import { WizardConfig, WizardState, WizardStepConfig } from './types';

interface UseWizardProps {
  config: WizardConfig;
  initialData?: Record<string, any>;
  initialStepIndex?: number;
  onStepChange?: (state: WizardState) => void;
  onComplete?: (results: Record<string, any>) => void;
  onSave?: (state: WizardState) => void;
  onExit?: () => void;
}

export function useWizard({
  config,
  initialData = {},
  initialStepIndex = 0,
  onStepChange,
  onComplete,
  onSave,
  onExit
}: UseWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [answers, setAnswers] = useState<Record<string, any>>(initialData);
  const [history, setHistory] = useState<number[]>([initialStepIndex]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const totalSteps = config.steps.length;
  const currentStep = config.steps[currentStepIndex];

  // Helper to check if a step should be skipped
  const shouldSkipStep = useCallback((step: WizardStepConfig, currentAnswers: Record<string, any>) => {
    if (!step.condition) return false;
    
    const { fieldId, value, operator = 'equals' } = step.condition;
    const answer = currentAnswers[fieldId];
    
    switch (operator) {
      case 'equals': return answer !== value;
      case 'not_equals': return answer === value;
      case 'contains': return Array.isArray(answer) ? !answer.includes(value) : answer !== value;
      default: return false;
    }
  }, []);

  const progress = Math.min(100, Math.round(((currentStepIndex + 1) / totalSteps) * 100));

  const getAnswer = useCallback((fieldId: string) => {
    return answers[fieldId];
  }, [answers]);

  const setAnswer = useCallback((fieldId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  const setMultipleAnswers = useCallback((values: Record<string, any>) => {
    setAnswers(prev => ({
      ...prev,
      ...values
    }));
  }, []);

  // Autosave effect
  useEffect(() => {
    if (onStepChange) {
      onStepChange({
        currentStepIndex,
        answers,
        completedSteps,
        history,
        isSubmitting,
        hasError: false
      });
    }
  }, [currentStepIndex, answers, completedSteps, history, isSubmitting, onStepChange]);

  const resetStep = useCallback(() => {
    if (!currentStep.fields) return;
    
    const resetValues: Record<string, any> = {};
    currentStep.fields.forEach(field => {
        resetValues[field.id] = undefined;
    });
    
    setAnswers(prev => ({
        ...prev,
        ...resetValues
    }));
  }, [currentStep, setAnswers]);

  const goToNext = useCallback(async () => {
    // Check required fields in current step
    const requiredFields = currentStep.fields?.filter(f => f.validation?.required && !f.hidden) || [];
    const missingFields = requiredFields.filter(f => {
      // Check visibility if dependsOn is present
      if (f.dependsOn) {
         const { fieldId, value, operator = 'equals' } = f.dependsOn;
         const dependentValue = answers[fieldId];
         let isVisible = false;
         
         switch (operator) {
           case 'equals': isVisible = dependentValue === value; break;
           case 'not_equals': isVisible = dependentValue !== value; break;
           case 'contains': isVisible = Array.isArray(dependentValue) && dependentValue.includes(value); break;
           default: isVisible = dependentValue === value;
         }
         
         if (!isVisible) return false; // Don't validate hidden fields
      }

      const val = answers[f.id];
      return val === undefined || val === '' || (Array.isArray(val) && val.length === 0);
    });

    if (missingFields.length > 0) {
      console.warn("Missing required fields:", missingFields.map(f => f.id));
      // In a real app we would set error state here
      return false; 
    }

    const nextIndex = currentStepIndex + 1;
    
    if (nextIndex >= totalSteps) {
      // Complete
      setIsSubmitting(true);
      if (onComplete) {
        await onComplete(answers);
      }
      setIsSubmitting(false);
    } else {
      // Find next valid step (skip logic)
      let targetIndex = nextIndex;
      while (targetIndex < totalSteps && shouldSkipStep(config.steps[targetIndex], answers)) {
        targetIndex++;
      }
      
      if (targetIndex >= totalSteps) {
         // If we skipped everything until the end, complete.
         setIsSubmitting(true);
         if (onComplete) {
           await onComplete(answers);
         }
         setIsSubmitting(false);
      } else {
        setHistory(prev => [...prev, targetIndex]);
        setCurrentStepIndex(targetIndex);
        setCompletedSteps(prev => [...prev, currentStep.id]);
        
        // Scroll to top
        window.scrollTo(0, 0);
      }
    }
    return true;
  }, [currentStep, currentStepIndex, totalSteps, answers, config.steps, shouldSkipStep, onComplete]);

  const goToPrevious = useCallback(() => {
    if (history.length <= 1) {
      if (onExit) onExit();
      return;
    }

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const prevIndex = newHistory[newHistory.length - 1];
    
    setHistory(newHistory);
    setCurrentStepIndex(prevIndex);
    window.scrollTo(0, 0);
  }, [history, onExit]);

  const saveAndExit = useCallback(() => {
    if (onSave) {
      onSave({
        currentStepIndex,
        answers,
        completedSteps,
        history,
        isSubmitting,
        hasError: false
      });
    }
    if (onExit) onExit();
  }, [onSave, onExit, currentStepIndex, answers, completedSteps, history, isSubmitting]);

  return {
    state: {
      currentStepIndex,
      answers,
      completedSteps,
      history,
      isSubmitting,
      hasError: false
    },
    currentStep,
    totalSteps,
    progress,
    getAnswer,
    setAnswer,
    setAnswers: setMultipleAnswers,
    resetStep,
    goToNext,
    goToPrevious,
    saveAndExit
  };
}
