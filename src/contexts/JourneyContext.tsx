import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Journey types from JSON specification
export type JourneyStep = 
  | 'OnboardingIntro'
  | 'AssessmentLanding'
  | 'CompleteAssessment'
  | 'DashboardHome'
  | 'Login'
  | 'ContinueEquip'
  | 'JournalEntry'
  | 'EquipPreview'
  | 'Payment'
  | 'EquipProgramAccess'
  | 'ReminderSetup';

export type JourneyFlow = 'new_user' | 'returning_user' | 'equip_purchase';

export interface JourneyState {
  currentFlow: JourneyFlow | null;
  currentStep: JourneyStep | null;
  completedSteps: JourneyStep[];
  flowData?: Record<string, any>;
}

interface JourneyContextType {
  // Current journey state
  journeyState: JourneyState;
  
  // Journey management
  startJourney: (flow: JourneyFlow, initialData?: Record<string, any>) => void;
  nextStep: (stepData?: Record<string, any>) => void;
  previousStep: () => void;
  jumpToStep: (step: JourneyStep) => void;
  completeJourney: () => void;
  
  // Journey helpers
  isStepCompleted: (step: JourneyStep) => boolean;
  getCurrentStepIndex: () => number;
  getNextStep: () => JourneyStep | null;
  getPreviousStep: () => JourneyStep | null;
  getProgress: () => number;
  
  // Flow helpers
  canAccessStep: (step: JourneyStep) => boolean;
  getRequiredSteps: (flow: JourneyFlow) => JourneyStep[];
}

// JSON spec journey flows
const journeyFlows: Record<JourneyFlow, JourneyStep[]> = {
  new_user: [
    'OnboardingIntro',
    'AssessmentLanding',
    'CompleteAssessment',
    'DashboardHome'
  ],
  returning_user: [
    'Login',
    'DashboardHome',
    'ContinueEquip',
    'JournalEntry'
  ],
  equip_purchase: [
    'EquipPreview',
    'Payment',
    'EquipProgramAccess',
    'ReminderSetup'
  ]
};

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}

interface JourneyProviderProps {
  children: React.ReactNode;
}

export function JourneyProvider({ children }: JourneyProviderProps) {
  const { user } = useAuth();
  
  const [journeyState, setJourneyState] = useState<JourneyState>({
    currentFlow: null,
    currentStep: null,
    completedSteps: [],
    flowData: {}
  });

  // Load saved journey state on mount
  useEffect(() => {
    loadJourneyState();
  }, [user]);

  // Save journey state whenever it changes
  useEffect(() => {
    saveJourneyState();
  }, [journeyState]);

  const loadJourneyState = () => {
    try {
      const saved = localStorage.getItem(`ikan-journey-${user?.id || 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setJourneyState(parsed);
        console.log('📍 Loaded journey state:', parsed);
      }
    } catch (error) {
      console.warn('Failed to load journey state:', error);
    }
  };

  const saveJourneyState = () => {
    try {
      if (journeyState.currentFlow) {
        localStorage.setItem(
          `ikan-journey-${user?.id || 'guest'}`, 
          JSON.stringify(journeyState)
        );
      }
    } catch (error) {
      console.warn('Failed to save journey state:', error);
    }
  };

  const startJourney = useCallback((flow: JourneyFlow, initialData?: Record<string, any>) => {
    console.log('🚀 Starting journey:', flow, initialData);
    
    const steps = journeyFlows[flow];
    if (!steps || steps.length === 0) {
      console.error('Invalid journey flow:', flow);
      return;
    }

    setJourneyState({
      currentFlow: flow,
      currentStep: steps[0],
      completedSteps: [],
      flowData: initialData || {}
    });
  }, []);

  const nextStep = useCallback((stepData?: Record<string, any>) => {
    setJourneyState(prev => {
      if (!prev.currentFlow || !prev.currentStep) {
        return prev;
      }

      const steps = journeyFlows[prev.currentFlow];
      const currentIndex = steps.indexOf(prev.currentStep);
      
      if (currentIndex === -1) {
        console.error('Current step not found in flow:', prev.currentStep);
        return prev;
      }

      // Mark current step as completed
      const newCompletedSteps = prev.completedSteps.includes(prev.currentStep)
        ? prev.completedSteps
        : [...prev.completedSteps, prev.currentStep];

      // Move to next step
      const nextIndex = currentIndex + 1;
      const nextStep = nextIndex < steps.length ? steps[nextIndex] : null;

      console.log('➡️ Moving to next step:', nextStep);

      return {
        ...prev,
        currentStep: nextStep,
        completedSteps: newCompletedSteps,
        flowData: { ...prev.flowData, ...stepData }
      };
    });
  }, []);

  const previousStep = useCallback(() => {
    setJourneyState(prev => {
      if (!prev.currentFlow || !prev.currentStep) {
        return prev;
      }

      const steps = journeyFlows[prev.currentFlow];
      const currentIndex = steps.indexOf(prev.currentStep);
      
      if (currentIndex <= 0) {
        console.log('Already at first step');
        return prev;
      }

      const previousStep = steps[currentIndex - 1];
      console.log('⬅️ Moving to previous step:', previousStep);

      return {
        ...prev,
        currentStep: previousStep
      };
    });
  }, []);

  const jumpToStep = useCallback((step: JourneyStep) => {
    setJourneyState(prev => {
      if (!prev.currentFlow) {
        console.error('No active journey flow');
        return prev;
      }

      const steps = journeyFlows[prev.currentFlow];
      if (!steps.includes(step)) {
        console.error('Step not in current flow:', step);
        return prev;
      }

      console.log('🎯 Jumping to step:', step);

      return {
        ...prev,
        currentStep: step
      };
    });
  }, []);

  const completeJourney = useCallback(() => {
    console.log('🎉 Journey completed:', journeyState.currentFlow);
    
    setJourneyState(prev => ({
      ...prev,
      completedSteps: prev.currentStep && !prev.completedSteps.includes(prev.currentStep)
        ? [...prev.completedSteps, prev.currentStep]
        : prev.completedSteps
    }));

    // Clear saved journey state
    try {
      localStorage.removeItem(`ikan-journey-${user?.id || 'guest'}`);
    } catch (error) {
      console.warn('Failed to clear journey state:', error);
    }
  }, [journeyState.currentFlow, journeyState.currentStep, user]);

  const isStepCompleted = useCallback((step: JourneyStep): boolean => {
    return journeyState.completedSteps.includes(step);
  }, [journeyState.completedSteps]);

  const getCurrentStepIndex = useCallback((): number => {
    if (!journeyState.currentFlow || !journeyState.currentStep) {
      return -1;
    }
    
    const steps = journeyFlows[journeyState.currentFlow];
    return steps.indexOf(journeyState.currentStep);
  }, [journeyState.currentFlow, journeyState.currentStep]);

  const getNextStep = useCallback((): JourneyStep | null => {
    if (!journeyState.currentFlow || !journeyState.currentStep) {
      return null;
    }

    const steps = journeyFlows[journeyState.currentFlow];
    const currentIndex = steps.indexOf(journeyState.currentStep);
    
    return currentIndex !== -1 && currentIndex < steps.length - 1 
      ? steps[currentIndex + 1] 
      : null;
  }, [journeyState.currentFlow, journeyState.currentStep]);

  const getPreviousStep = useCallback((): JourneyStep | null => {
    if (!journeyState.currentFlow || !journeyState.currentStep) {
      return null;
    }

    const steps = journeyFlows[journeyState.currentFlow];
    const currentIndex = steps.indexOf(journeyState.currentStep);
    
    return currentIndex > 0 ? steps[currentIndex - 1] : null;
  }, [journeyState.currentFlow, journeyState.currentStep]);

  const getProgress = useCallback((): number => {
    if (!journeyState.currentFlow) {
      return 0;
    }

    const steps = journeyFlows[journeyState.currentFlow];
    const completed = journeyState.completedSteps.length;
    
    return Math.round((completed / steps.length) * 100);
  }, [journeyState.currentFlow, journeyState.completedSteps]);

  const canAccessStep = useCallback((step: JourneyStep): boolean => {
    if (!journeyState.currentFlow) {
      return false;
    }

    const steps = journeyFlows[journeyState.currentFlow];
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex === -1) {
      return false;
    }

    // Can access if it's the current step or a completed step
    if (step === journeyState.currentStep || isStepCompleted(step)) {
      return true;
    }

    // Can access if all previous steps are completed
    const previousSteps = steps.slice(0, stepIndex);
    return previousSteps.every(prevStep => isStepCompleted(prevStep));
  }, [journeyState.currentFlow, journeyState.currentStep, isStepCompleted]);

  const getRequiredSteps = useCallback((flow: JourneyFlow): JourneyStep[] => {
    return journeyFlows[flow] || [];
  }, []);

  const contextValue: JourneyContextType = {
    journeyState,
    
    startJourney,
    nextStep,
    previousStep,
    jumpToStep,
    completeJourney,
    
    isStepCompleted,
    getCurrentStepIndex,
    getNextStep,
    getPreviousStep,
    getProgress,
    
    canAccessStep,
    getRequiredSteps
  };

  return (
    <JourneyContext.Provider value={contextValue}>
      {children}
    </JourneyContext.Provider>
  );
}