// iKan Journey System - Complete user journey management with JSON specification compliance

// Core Components
export { JourneyManager, QuickJourneyStart } from './JourneyManager';

// Context
export { JourneyProvider, useJourney } from '../../contexts/JourneyContext';
export type { JourneyStep, JourneyFlow, JourneyState } from '../../contexts/JourneyContext';

// Journey configuration and utilities
export const JOURNEY_FLOWS = {
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
} as const;

// Phase 2 deferred features from JSON specification
export const PHASE_2_DEFERRED = [
  'CommunityFeatures',
  'AdvancedBilling',
  'LiveConsults',
  'BookmarkProgress'
] as const;

// Journey step metadata
export interface StepMetadata {
  name: string;
  description: string;
  icon: string;
  estimatedTime?: string;
  requirements?: string[];
}

export const STEP_METADATA: { [K in JourneyStep]: StepMetadata } = {
  OnboardingIntro: {
    name: 'Welcome & Introduction',
    description: 'Get familiar with iKan and set up your profile',
    icon: 'heart',
    estimatedTime: '2 minutes'
  },
  AssessmentLanding: {
    name: 'Assessment Overview',
    description: 'Learn about mental health assessments and their benefits',
    icon: 'clipboard',
    estimatedTime: '1 minute'
  },
  CompleteAssessment: {
    name: 'Take Assessment',
    description: 'Complete your first mental health assessment',
    icon: 'fileText',
    estimatedTime: '5-10 minutes'
  },
  DashboardHome: {
    name: 'Dashboard',
    description: 'Explore your personalized mental health dashboard',
    icon: 'home',
    estimatedTime: '2 minutes'
  },
  Login: {
    name: 'Sign In',
    description: 'Access your account and continue your journey',
    icon: 'logIn',
    estimatedTime: '30 seconds'
  },
  ContinueEquip: {
    name: 'Continue Program',
    description: 'Resume your active mental health program',
    icon: 'play',
    estimatedTime: '10-20 minutes'
  },
  JournalEntry: {
    name: 'Daily Journal',
    description: 'Record your daily mood and reflections',
    icon: 'bookOpen',
    estimatedTime: '3-5 minutes'
  },
  EquipPreview: {
    name: 'Program Preview',
    description: 'Review program details and benefits',
    icon: 'eye',
    estimatedTime: '3 minutes'
  },
  Payment: {
    name: 'Secure Payment',
    description: 'Complete your program purchase securely',
    icon: 'creditCard',
    estimatedTime: '2 minutes'
  },
  EquipProgramAccess: {
    name: 'Program Access',
    description: 'Access your purchased mental health program',
    icon: 'unlock',
    estimatedTime: '1 minute'
  },
  ReminderSetup: {
    name: 'Setup Reminders',
    description: 'Configure notifications and reminders',
    icon: 'bell',
    estimatedTime: '2 minutes'
  }
};

// Journey utility functions
export function getJourneySteps(flow: keyof typeof JOURNEY_FLOWS) {
  return JOURNEY_FLOWS[flow] || [];
}

export function calculateJourneyDuration(flow: keyof typeof JOURNEY_FLOWS): string {
  const steps = getJourneySteps(flow);
  const totalMinutes = steps.reduce((total, step) => {
    const metadata = STEP_METADATA[step as JourneyStep];
    if (metadata.estimatedTime) {
      const match = metadata.estimatedTime.match(/(\d+)(?:-(\d+))?\s*minutes?/);
      if (match) {
        const min = parseInt(match[1]);
        const max = match[2] ? parseInt(match[2]) : min;
        return total + Math.round((min + max) / 2);
      }
    }
    return total + 2; // Default 2 minutes if not specified
  }, 0);

  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
}

export function getStepMetadata(step: JourneyStep): StepMetadata {
  return STEP_METADATA[step];
}

export function isPhase2Feature(feature: string): boolean {
  return PHASE_2_DEFERRED.includes(feature as any);
}

// Journey analytics helpers
export interface JourneyAnalytics {
  flow: keyof typeof JOURNEY_FLOWS;
  startedAt: string;
  completedAt?: string;
  currentStep: JourneyStep;
  completedSteps: JourneyStep[];
  abandonedAt?: string;
  totalDuration?: number;
  stepDurations: { [step: string]: number };
}

export function createJourneyAnalytics(
  flow: keyof typeof JOURNEY_FLOWS,
  currentStep: JourneyStep,
  completedSteps: JourneyStep[],
  startedAt: string
): JourneyAnalytics {
  return {
    flow,
    startedAt,
    currentStep,
    completedSteps,
    stepDurations: {}
  };
}

export function calculateCompletionRate(
  completedSteps: JourneyStep[],
  totalSteps: JourneyStep[]
): number {
  if (totalSteps.length === 0) return 0;
  return Math.round((completedSteps.length / totalSteps.length) * 100);
}

// Journey state management helpers
export function saveJourneyProgress(userId: string, journeyState: any) {
  try {
    const key = `ikan-journey-${userId}`;
    localStorage.setItem(key, JSON.stringify({
      ...journeyState,
      lastUpdated: new Date().toISOString()
    }));
    console.log('📍 Journey progress saved');
  } catch (error) {
    console.warn('Failed to save journey progress:', error);
  }
}

export function loadJourneyProgress(userId: string): any | null {
  try {
    const key = `ikan-journey-${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('📍 Journey progress loaded');
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to load journey progress:', error);
  }
  return null;
}

export function clearJourneyProgress(userId: string) {
  try {
    const key = `ikan-journey-${userId}`;
    localStorage.removeItem(key);
    console.log('🗑️ Journey progress cleared');
  } catch (error) {
    console.warn('Failed to clear journey progress:', error);
  }
}

// Journey validation
export function validateJourneyState(journeyState: any): boolean {
  if (!journeyState) return false;
  
  // Check required fields
  if (!journeyState.currentFlow || !journeyState.currentStep) return false;
  
  // Validate flow exists
  if (!JOURNEY_FLOWS[journeyState.currentFlow as keyof typeof JOURNEY_FLOWS]) return false;
  
  // Validate step exists in flow
  const flowSteps = JOURNEY_FLOWS[journeyState.currentFlow as keyof typeof JOURNEY_FLOWS];
  if (!flowSteps.includes(journeyState.currentStep)) return false;
  
  return true;
}

// Journey constants from JSON specification
export const JOURNEY_CONSTANTS = {
  STATUS: 'locked', // JSON spec: journeys.status
  PHASE_1_FLOWS: ['new_user', 'returning_user', 'equip_purchase'],
  DEFERRED_FEATURES: PHASE_2_DEFERRED,
  DEFAULT_STEP_DURATION: 120000, // 2 minutes in milliseconds
  MAX_JOURNEY_DURATION: 86400000 // 24 hours in milliseconds
} as const;

export default {
  JOURNEY_FLOWS,
  STEP_METADATA,
  PHASE_2_DEFERRED,
  JOURNEY_CONSTANTS
};