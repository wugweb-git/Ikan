import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Icon } from '../Icon';
import { useJourney, type JourneyFlow, type JourneyStep } from '../../contexts/JourneyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';

interface JourneyManagerProps {
  onNavigate?: (route: string) => void;
  className?: string;
}

export function JourneyManager({ onNavigate, className }: JourneyManagerProps) {
  const { user } = useAuth();
  const { showToast, addNotification } = useNotifications();
  const { 
    journeyState, 
    startJourney, 
    nextStep, 
    previousStep,
    jumpToStep,
    completeJourney,
    getProgress,
    getNextStep,
    getPreviousStep,
    canAccessStep
  } = useJourney();

  // Auto-detect appropriate journey for user
  useEffect(() => {
    if (user && !journeyState.currentFlow) {
      const isNewUser = isFirstTimeUser(user);
      const hasActivePrograms = hasUserActivePrograms(user);
      
      if (isNewUser) {
        console.log('🆕 Starting new user journey');
        startJourney('new_user', { userId: user.id, isFirstTime: true });
        showToast('info', 'Welcome to iKan!', 'Let\'s get started with your mental health journey.');
      } else if (hasActivePrograms) {
        console.log('🔄 Starting returning user journey');
        startJourney('returning_user', { userId: user.id, hasPrograms: true });
      }
    }
  }, [user, journeyState.currentFlow, startJourney, showToast]);

  // Helper functions to detect user state
  const isFirstTimeUser = (user: any): boolean => {
    // Check if user has completed onboarding
    try {
      const onboardingComplete = localStorage.getItem(`ikan-onboarding-${user.id}`);
      return !onboardingComplete;
    } catch {
      return true;
    }
  };

  const hasUserActivePrograms = (user: any): boolean => {
    // Check if user has active program purchases
    try {
      const purchases = localStorage.getItem(`ikan-purchases-${user.id}`);
      return purchases && JSON.parse(purchases).length > 0;
    } catch {
      return false;
    }
  };

  const getJourneyDescription = (flow: JourneyFlow): string => {
    switch (flow) {
      case 'new_user':
        return 'Complete your onboarding and take your first assessment';
      case 'returning_user':
        return 'Continue with your programs and daily activities';
      case 'equip_purchase':
        return 'Purchase and set up your mental health program';
      default:
        return '';
    }
  };

  const getStepDisplayName = (step: JourneyStep): string => {
    const stepNames: { [K in JourneyStep]: string } = {
      OnboardingIntro: 'Welcome & Introduction',
      AssessmentLanding: 'Assessment Overview',
      CompleteAssessment: 'Take Assessment',
      DashboardHome: 'Dashboard',
      Login: 'Sign In',
      ContinueEquip: 'Continue Program',
      JournalEntry: 'Daily Journal',
      EquipPreview: 'Program Preview',
      Payment: 'Secure Payment',
      EquipProgramAccess: 'Program Access',
      ReminderSetup: 'Setup Reminders'
    };
    return stepNames[step] || step;
  };

  const getStepIcon = (step: JourneyStep): string => {
    const stepIcons: { [K in JourneyStep]: string } = {
      OnboardingIntro: 'heart',
      AssessmentLanding: 'clipboard',
      CompleteAssessment: 'fileText',
      DashboardHome: 'home',
      Login: 'logIn',
      ContinueEquip: 'play',
      JournalEntry: 'bookOpen',
      EquipPreview: 'eye',
      Payment: 'creditCard',
      EquipProgramAccess: 'unlock',
      ReminderSetup: 'bell'
    };
    return stepIcons[step] || 'circle';
  };

  const handleStepAction = (step: JourneyStep) => {
    if (!canAccessStep(step)) {
      showToast('warning', 'Step Not Available', 'Complete previous steps first.');
      return;
    }

    jumpToStep(step);

    // Navigate to appropriate route based on step
    const stepRoutes: { [K in JourneyStep]?: string } = {
      OnboardingIntro: '/dashboard',
      AssessmentLanding: '/assessments',
      CompleteAssessment: '/assessments',
      DashboardHome: '/dashboard',
      ContinueEquip: '/equip-programs',
      JournalEntry: '/dashboard',
      EquipPreview: '/equip-programs',
      EquipProgramAccess: '/equip-programs'
    };

    const route = stepRoutes[step];
    if (route && onNavigate) {
      onNavigate(route);
    }
  };

  const handleNextStep = () => {
    const next = getNextStep();
    if (next) {
      nextStep();
      
      // Add progress notification
      addNotification({
        type: 'success',
        title: 'Step Completed!',
        message: `Moving on to: ${getStepDisplayName(next)}`,
      });
    } else {
      // Journey complete
      completeJourney();
      showToast('success', 'Journey Complete!', 'Great job completing your journey.');
    }
  };

  const handleStartPurchaseJourney = (programId: string) => {
    console.log('🛒 Starting purchase journey for program:', programId);
    startJourney('equip_purchase', { programId, startedAt: new Date().toISOString() });
  };

  if (!journeyState.currentFlow) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Icon name="compass" size={32} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>
          No active journey. Start exploring iKan at your own pace!
        </p>
        
        <div className="flex justify-center gap-3 mt-4">
          <Button 
            variant="outline" 
            onClick={() => startJourney('new_user')}
            className="gap-2"
          >
            <Icon name="user" size={16} />
            Start Fresh
          </Button>
          <Button 
            onClick={() => onNavigate?.('/dashboard')}
            className="gap-2"
          >
            <Icon name="home" size={16} />
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const progress = getProgress();
  const nextStep_val = getNextStep();
  const prevStep = getPreviousStep();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="compass" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Your Journey
          </CardTitle>
          <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
            {journeyState.currentFlow.replace('_', ' ')}
          </Badge>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
          {getJourneyDescription(journeyState.currentFlow)}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Progress
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Step */}
        {journeyState.currentStep && (
          <div>
            <h3 
              style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-2)'
              }}
            >
              Current Step
            </h3>
            <div 
              className="p-4 rounded-lg border-2 border-primary"
              style={{ 
                backgroundColor: 'var(--color-bg-muted)',
                borderColor: 'var(--color-primary-default)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary-default)' }}
                >
                  <Icon 
                    name={getStepIcon(journeyState.currentStep) as any} 
                    size={18}
                    style={{ color: 'var(--color-primary-on)' }}
                  />
                </div>
                <div className="flex-1">
                  <div 
                    style={{ 
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {getStepDisplayName(journeyState.currentStep)}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {canAccessStep(journeyState.currentStep) ? 'Ready to continue' : 'Complete previous steps first'}
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleStepAction(journeyState.currentStep!)}
                  disabled={!canAccessStep(journeyState.currentStep)}
                  className="gap-2"
                >
                  <Icon name="play" size={14} />
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Journey Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={!prevStep}
            className="gap-2"
          >
            <Icon name="arrowLeft" size={14} />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                completeJourney();
                onNavigate?.('/dashboard');
              }}
              className="gap-2"
            >
              <Icon name="x" size={14} />
              Skip Journey
            </Button>

            <Button
              onClick={handleNextStep}
              disabled={!nextStep_val}
              className="gap-2"
            >
              <Icon name="arrowRight" size={14} />
              {nextStep_val ? 'Next Step' : 'Complete'}
            </Button>
          </div>
        </div>

        {/* Journey Data Debug (Development) */}
        {process.env.NODE_ENV === 'development' && journeyState.flowData && (
          <details className="mt-4">
            <summary 
              className="cursor-pointer text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Journey Data (Debug)
            </summary>
            <pre 
              className="mt-2 p-2 rounded text-xs overflow-auto"
              style={{ 
                backgroundColor: 'var(--color-bg-muted)',
                fontFamily: 'monospace'
              }}
            >
              {JSON.stringify(journeyState.flowData, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

// Utility component for quick journey starting
interface QuickJourneyStartProps {
  onJourneyStart?: (flow: JourneyFlow) => void;
  className?: string;
}

export function QuickJourneyStart({ onJourneyStart, className }: QuickJourneyStartProps) {
  const { startJourney } = useJourney();

  const journeyOptions = [
    {
      flow: 'new_user' as JourneyFlow,
      title: 'New User Journey',
      description: 'Complete onboarding and first assessment',
      icon: 'userPlus',
      color: 'var(--color-status-info)'
    },
    {
      flow: 'returning_user' as JourneyFlow,
      title: 'Returning User',
      description: 'Continue with daily activities',
      icon: 'refreshCw',
      color: 'var(--color-status-success)'
    },
    {
      flow: 'equip_purchase' as JourneyFlow,
      title: 'Purchase Program',
      description: 'Buy and set up a mental health program',
      icon: 'creditCard',
      color: 'var(--color-primary-default)'
    }
  ];

  const handleStartJourney = (flow: JourneyFlow) => {
    startJourney(flow);
    onJourneyStart?.(flow);
  };

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {journeyOptions.map((option) => (
        <Card 
          key={option.flow}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStartJourney(option.flow)}
        >
          <CardContent className="p-4 text-center">
            <Icon 
              name={option.icon as any} 
              size={32} 
              className="mx-auto mb-3"
              style={{ color: option.color }}
            />
            <h3 
              style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-1)'
              }}
            >
              {option.title}
            </h3>
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-md)'
            }}>
              {option.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}