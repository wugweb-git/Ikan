import React, { useState } from 'react';
import { ChevronRight, Edit2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface OnboardingData {
  name?: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  priorTherapy?: 'yes' | 'no' | 'prefer-not-to-answer';
  therapyReasons?: string[];
  hasConditions?: 'yes' | 'no' | 'prefer-not-to-answer';
  conditionsDetails?: string;
  consent?: boolean;
}

interface EquipOnboardingProps {
  programId: string;
  programTitle?: string;
  userEmail?: string;
  userPhone?: string;
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

export function EquipOnboarding({
  programId,
  programTitle = 'Sleep Program',
  userEmail,
  userPhone,
  onComplete,
  onSkip
}: EquipOnboardingProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    email: userEmail,
    phone: userPhone
  });
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const goNext = () => {
    setDirection(1);
    setCurrentScreen(prev => Math.min(prev + 1, screens.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentScreen(prev => Math.max(prev - 1, 0));
  };

  const skipScreen = () => {
    goNext();
  };

  const handleComplete = () => {
    if (!data.consent) {
      toast.error('Please review and accept to continue');
      return;
    }
    onComplete(data);
    toast.success('Profile complete! Starting your journey...');
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const screens = [
    // SCREEN 0: Gentle Entry
    <GentleEntryScreen key="entry" onStart={goNext} onSkip={onSkip} />,
    
    // SCREEN 1: Name
    <NameScreen 
      key="name"
      value={data.name}
      onChange={(name) => updateData({ name })}
      onNext={goNext}
      onSkip={skipScreen}
    />,
    
    // SCREEN 2: Gender
    <GenderScreen
      key="gender"
      value={data.gender}
      onChange={(gender) => updateData({ gender })}
      onNext={goNext}
      onSkip={skipScreen}
    />,
    
    // SCREEN 3: Date of Birth
    <DateOfBirthScreen
      key="dob"
      value={data.dateOfBirth}
      onChange={(dateOfBirth) => updateData({ dateOfBirth })}
      onNext={goNext}
      onSkip={skipScreen}
    />,
    
    // SCREEN 4: Contact Info (Pre-filled)
    <ContactInfoScreen
      key="contact"
      email={data.email}
      phone={data.phone}
      onEdit={() => {/* Could open edit modal */}}
      onNext={goNext}
    />,
    
    // SCREEN 5: Occupation
    <OccupationScreen
      key="occupation"
      value={data.occupation}
      onChange={(occupation) => updateData({ occupation })}
      onNext={goNext}
      onSkip={skipScreen}
    />,
    
    // SCREEN 6: Prior Therapy
    <PriorTherapyScreen
      key="therapy"
      priorTherapy={data.priorTherapy}
      therapyReasons={data.therapyReasons}
      onUpdate={(updates) => updateData(updates)}
      onNext={goNext}
      onSkip={skipScreen}
    />,
    
    // SCREEN 7: Pre-existing Conditions
    <ConditionsScreen
      key="conditions"
      hasConditions={data.hasConditions}
      details={data.conditionsDetails}
      onUpdate={(updates) => updateData(updates)}
      onNext={goNext}
      onSkip={skipScreen}
    />,
    
    // SCREEN 8: Review
    <ReviewScreen
      key="review"
      data={data}
      onEdit={(screen) => setCurrentScreen(screen)}
      onNext={goNext}
    />,
    
    // SCREEN 9: Consent
    <ConsentScreen
      key="consent"
      value={data.consent}
      onChange={(consent) => updateData({ consent })}
      onNext={goNext}
    />,
    
    // SCREEN 10: Complete
    <CompleteScreen
      key="complete"
      onComplete={handleComplete}
      onExplore={() => onSkip?.()}
    />
  ];

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)'
      }}
    >
      {/* Progress Bar */}
      {currentScreen > 0 && currentScreen < screens.length - 1 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          <div 
            className="h-1 transition-all duration-300"
            style={{
              width: `${(currentScreen / (screens.length - 1)) * 100}%`,
              backgroundColor: 'var(--color-primary-default)'
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentScreen}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              {screens[currentScreen]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Back Button (if not first screen) */}
      {currentScreen > 0 && currentScreen < screens.length - 1 && (
        <div className="fixed bottom-0 left-0 p-4">
          <Button
            variant="ghost"
            onClick={goBack}
            style={{
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-regular)'
            }}
          >
            ← Back
          </Button>
        </div>
      )}
    </div>
  );
}

// SCREEN 0: Gentle Entry
function GentleEntryScreen({ onStart, onSkip }: { onStart: () => void; onSkip?: () => void }) {
  return (
    <div className="text-center space-y-8">
      {/* Calm Illustration */}
      <div 
        className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-accent-default)' }}
      >
        <span style={{ fontSize: '64px' }}>🌙</span>
      </div>

      {/* Copy */}
      <div className="space-y-3">
        <h1 
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          Let's get to know you
        </h1>
        <p 
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          At your pace. You can skip anything.
        </p>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onStart}
          className="w-full"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-text-inverse)',
            fontWeight: 'var(--font-weight-medium)',
            height: '48px'
          }}
        >
          Start
        </Button>
        
        {onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className="w-full"
            style={{
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-regular)'
            }}
          >
            Skip for now
          </Button>
        )}
      </div>
    </div>
  );
}

// SCREEN 1: Name
function NameScreen({ 
  value, 
  onChange, 
  onNext, 
  onSkip 
}: { 
  value?: string; 
  onChange: (val: string) => void; 
  onNext: () => void; 
  onSkip: () => void; 
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          What should we call you?
        </h2>
      </div>

      <div className="space-y-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your name"
          className="text-base"
          style={{
            height: '48px',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)'
          }}
        />
        <p 
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-regular)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          You can use a nickname if you prefer
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onNext}
          className="w-full"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-text-inverse)',
            fontWeight: 'var(--font-weight-medium)',
            height: '48px'
          }}
        >
          Continue
        </Button>
        
        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full"
          style={{
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-regular)'
          }}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}

// SCREEN 2: Gender
function GenderScreen({ 
  value, 
  onChange, 
  onNext, 
  onSkip 
}: { 
  value?: string; 
  onChange: (val: string) => void; 
  onNext: () => void; 
  onSkip: () => void; 
}) {
  const options = [
    { value: 'woman', label: 'Woman' },
    { value: 'man', label: 'Man' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'another', label: 'Another identity' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  return (
    <div className="space-y-8">
      <h2 
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        How do you describe your gender?
      </h2>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="w-full text-left p-4 rounded-lg transition-all"
            style={{
              backgroundColor: value === option.value 
                ? 'var(--color-primary-default)' 
                : 'var(--color-bg-card)',
              color: value === option.value 
                ? 'var(--color-text-inverse)' 
                : 'var(--color-text-primary)',
              border: value === option.value 
                ? 'none' 
                : '1px solid var(--color-border-default)',
              fontWeight: 'var(--font-weight-regular)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            <div className="flex items-center justify-between">
              <span>{option.label}</span>
              {value === option.value && <Check size={20} />}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <Button
          onClick={onNext}
          disabled={!value}
          className="w-full"
          style={{
            backgroundColor: value ? 'var(--color-primary-default)' : 'var(--color-accent-default)',
            color: 'var(--color-text-inverse)',
            fontWeight: 'var(--font-weight-medium)',
            height: '48px',
            opacity: value ? 1 : 0.5
          }}
        >
          Continue
        </Button>
        
        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full"
          style={{
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-regular)'
          }}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}

// SCREEN 3: Date of Birth
function DateOfBirthScreen({ 
  value, 
  onChange, 
  onNext, 
  onSkip 
}: { 
  value?: string; 
  onChange: (val: string) => void; 
  onNext: () => void; 
  onSkip: () => void; 
}) {
  return (
    <div className="space-y-8">
      <h2 
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        When were you born?
      </h2>

      <div className="space-y-2">
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="text-base"
          style={{
            height: '48px',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)'
          }}
        />
        <p 
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-regular)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          This helps us tailor exercises to you.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onNext}
          className="w-full"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-text-inverse)',
            fontWeight: 'var(--font-weight-medium)',
            height: '48px'
          }}
        >
          Continue
        </Button>
        
        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full"
          style={{
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-regular)'
          }}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}

// SCREEN 4: Contact Info (Pre-filled)
function ContactInfoScreen({ 
  email, 
  phone, 
  onEdit, 
  onNext 
}: { 
  email?: string; 
  phone?: string; 
  onEdit: () => void; 
  onNext: () => void; 
}) {
  return (
    <div className="space-y-8">
      <h2 
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        Your contact details
      </h2>

      <Card>
        <CardContent className="p-4 space-y-3">
          {email && (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '20px' }}>📧</span>
              <div className="flex-1">
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 'var(--font-weight-regular)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  Email
                </p>
                <p 
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 'var(--font-weight-regular)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {email}
                </p>
              </div>
            </div>
          )}
          
          {phone && (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '20px' }}>📱</span>
              <div className="flex-1">
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 'var(--font-weight-regular)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  Phone
                </p>
                <p 
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 'var(--font-weight-regular)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {phone}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onEdit}
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-primary-default)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-base)',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            Edit details
          </button>
        </CardContent>
      </Card>

      <Button
        onClick={onNext}
        className="w-full"
        style={{
          backgroundColor: 'var(--color-primary-default)',
          color: 'var(--color-text-inverse)',
          fontWeight: 'var(--font-weight-medium)',
          height: '48px'
        }}
      >
        Continue
      </Button>
    </div>
  );
}

// SCREEN 5: Occupation
function OccupationScreen({ 
  value, 
  onChange, 
  onNext, 
  onSkip 
}: { 
  value?: string; 
  onChange: (val: string) => void; 
  onNext: () => void; 
  onSkip: () => void; 
}) {
  const options = [
    { value: 'employed', label: 'Employed' },
    { value: 'self-employed', label: 'Self-employed' },
    { value: 'homemaker', label: 'Homemaker' },
    { value: 'student', label: 'Student' },
    { value: 'between-jobs', label: 'Between jobs' },
    { value: 'retired', label: 'Retired' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  return (
    <div className="space-y-8">
      <h2 
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        What best describes your current situation?
      </h2>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="w-full text-left p-4 rounded-lg transition-all"
            style={{
              backgroundColor: value === option.value 
                ? 'var(--color-primary-default)' 
                : 'var(--color-bg-card)',
              color: value === option.value 
                ? 'var(--color-text-inverse)' 
                : 'var(--color-text-primary)',
              border: value === option.value 
                ? 'none' 
                : '1px solid var(--color-border-default)',
              fontWeight: 'var(--font-weight-regular)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            <div className="flex items-center justify-between">
              <span>{option.label}</span>
              {value === option.value && <Check size={20} />}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <Button
          onClick={onNext}
          disabled={!value}
          className="w-full"
          style={{
            backgroundColor: value ? 'var(--color-primary-default)' : 'var(--color-accent-default)',
            color: 'var(--color-text-inverse)',
            fontWeight: 'var(--font-weight-medium)',
            height: '48px',
            opacity: value ? 1 : 0.5
          }}
        >
          Continue
        </Button>
        
        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full"
          style={{
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-regular)'
          }}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}

// SCREEN 6: Prior Therapy
function PriorTherapyScreen({ 
  priorTherapy,
  therapyReasons,
  onUpdate, 
  onNext, 
  onSkip 
}: { 
  priorTherapy?: 'yes' | 'no' | 'prefer-not-to-answer';
  therapyReasons?: string[];
  onUpdate: (updates: Partial<OnboardingData>) => void; 
  onNext: () => void; 
  onSkip: () => void; 
}) {
  const reasonOptions = [
    'Anxiety',
    'Stress',
    'Low mood',
    'Relationships',
    'Work',
    'Sleep',
    'Something else'
  ];

  const toggleReason = (reason: string) => {
    const current = therapyReasons || [];
    if (current.includes(reason)) {
      onUpdate({ therapyReasons: current.filter(r => r !== reason) });
    } else {
      onUpdate({ therapyReasons: [...current, reason] });
    }
  };

  return (
    <div className="space-y-8">
      <h2 
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        Have you ever spoken to a therapist before?
      </h2>

      <div className="space-y-3">
        {[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'prefer-not-to-answer', label: 'Prefer not to answer' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => onUpdate({ priorTherapy: option.value as any })}
            className="w-full text-left p-4 rounded-lg transition-all"
            style={{
              backgroundColor: priorTherapy === option.value 
                ? 'var(--color-primary-default)' 
                : 'var(--color-bg-card)',
              color: priorTherapy === option.value 
                ? 'var(--color-text-inverse)' 
                : 'var(--color-text-primary)',
              border: priorTherapy === option.value 
                ? 'none' 
                : '1px solid var(--color-border-default)',
              fontWeight: 'var(--font-weight-regular)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            <div className="flex items-center justify-between">
              <span>{option.label}</span>
              {priorTherapy === option.value && <Check size={20} />}
            </div>
          </button>
        ))}
      </div>

      {/* Conditional Follow-up */}
      {priorTherapy === 'yes' && (
        <div className="space-y-4 pt-4">
          <p 
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-regular)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            If you're comfortable sharing, what was it for?
          </p>
          
          <div className="flex flex-wrap gap-2">
            {reasonOptions.map((reason) => (
              <button
                key={reason}
                onClick={() => toggleReason(reason)}
                className="px-4 py-2 rounded-full transition-all"
                style={{
                  backgroundColor: therapyReasons?.includes(reason)
                    ? 'var(--color-primary-default)'
                    : 'var(--color-bg-card)',
                  color: therapyReasons?.includes(reason)
                    ? 'var(--color-text-inverse)'
                    : 'var(--color-text-primary)',
                  border: therapyReasons?.includes(reason)
                    ? 'none'
                    : '1px solid var(--color-border-default)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-regular)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={onNext}
          disabled={!priorTherapy}
          className="w-full"
          style={{
            backgroundColor: priorTherapy ? 'var(--color-primary-default)' : 'var(--color-accent-default)',
            color: 'var(--color-text-inverse)',
            fontWeight: 'var(--font-weight-medium)',
            height: '48px',
            opacity: priorTherapy ? 1 : 0.5
          }}
        >
          Continue
        </Button>
        
        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full"
          style={{
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-regular)'
          }}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}

// SCREEN 7: Conditions
function ConditionsScreen({ 
  hasConditions,
  details,
  onUpdate, 
  onNext, 
  onSkip 
}: { 
  hasConditions?: 'yes' | 'no' | 'prefer-not-to-answer';
  details?: string;
  onUpdate: (updates: Partial<OnboardingData>) => void; 
  onNext: () => void; 
  onSkip: () => void; 
}) {
  return (
    <div className="space-y-8">
      <h2 
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        Are there any conditions you'd like us to be aware of?
      </h2>

      <div className="space-y-3">
        {[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'prefer-not-to-answer', label: 'Prefer not to answer' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => onUpdate({ hasConditions: option.value as any })}
            className="w-full text-left p-4 rounded-lg transition-all"
            style={{
              backgroundColor: hasConditions === option.value 
                ? 'var(--color-primary-default)' 
                : 'var(--color-bg-card)',
              color: hasConditions === option.value 
                ? 'var(--color-text-inverse)' 
                : 'var(--color-text-primary)',
              border: hasConditions === option.value 
                ? 'none' 
                : '1px solid var(--color-border-default)',
              fontWeight: 'var(--font-weight-regular)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            <div className="flex items-center justify-between">
              <span>{option.label}</span>
              {hasConditions === option.value && <Check size={20} />}
            </div>
          </button>
        ))}
      </div>

      {/* Conditional Text Input */}
      {hasConditions === 'yes' && (
        <div className="space-y-2 pt-4">
          <p 
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-regular)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            If you'd like, you can tell us more.
          </p>
          
          <textarea
            value={details || ''}
            onChange={(e) => onUpdate({ conditionsDetails: e.target.value })}
            placeholder="(optional)"
            rows={4}
            className="w-full p-3 rounded-lg resize-none"
            style={{
              backgroundColor: 'var(--color-bg-input)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-regular)',
              fontFamily: 'var(--font-family-base)',
              borderRadius: 'var(--radius-md)'
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={onNext}
          disabled={!hasConditions}
          className="w-full"
          style={{
            backgroundColor: hasConditions ? 'var(--color-primary-default)' : 'var(--color-accent-default)',
            color: 'var(--color-text-inverse)',
            fontWeight: 'var(--font-weight-medium)',
            height: '48px',
            opacity: hasConditions ? 1 : 0.5
          }}
        >
          Continue
        </Button>
        
        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full"
          style={{
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-regular)'
          }}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}

// SCREEN 8: Review
function ReviewScreen({ 
  data, 
  onEdit, 
  onNext 
}: { 
  data: OnboardingData; 
  onEdit: (screen: number) => void; 
  onNext: () => void; 
}) {
  const reviewItems = [
    { label: 'Name', value: data.name || 'Not provided', screen: 1 },
    { label: 'Gender', value: data.gender ? data.gender.replace(/-/g, ' ') : 'Not provided', screen: 2 },
    { label: 'Date of Birth', value: data.dateOfBirth || 'Not provided', screen: 3 },
    { label: 'Occupation', value: data.occupation ? data.occupation.replace(/-/g, ' ') : 'Not provided', screen: 5 },
    { label: 'Prior Therapy', value: data.priorTherapy || 'Not provided', screen: 6 }
  ];

  return (
    <div className="space-y-8">
      <h2 
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        Here's what we have so far
      </h2>

      <div className="space-y-3">
        {reviewItems.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p 
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      fontWeight: 'var(--font-weight-regular)',
                      fontFamily: 'var(--font-family-base)',
                      marginBottom: 'var(--spacing-1)'
                    }}
                  >
                    {item.label}
                  </p>
                  <p 
                    style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 'var(--font-weight-regular)',
                      fontFamily: 'var(--font-family-base)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {item.value}
                  </p>
                </div>
                <button
                  onClick={() => onEdit(item.screen)}
                  className="p-2"
                  style={{
                    color: 'var(--color-primary-default)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={18} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={onNext}
        className="w-full"
        style={{
          backgroundColor: 'var(--color-primary-default)',
          color: 'var(--color-text-inverse)',
          fontWeight: 'var(--font-weight-medium)',
          height: '48px'
        }}
      >
        Continue
      </Button>
    </div>
  );
}

// SCREEN 9: Consent
function ConsentScreen({ 
  value, 
  onChange, 
  onNext 
}: { 
  value?: boolean; 
  onChange: (val: boolean) => void; 
  onNext: () => void; 
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          Before we begin
        </h2>
        
        <Card>
          <CardContent className="p-4 space-y-3">
            <p 
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-primary)',
                fontWeight: 'var(--font-weight-regular)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: '1.6'
              }}
            >
              This app offers self-help CBT tools. It does not replace professional care.
            </p>
            
            <p 
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                fontWeight: 'var(--font-weight-regular)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: '1.5'
              }}
            >
              If you're experiencing a mental health crisis or need immediate support, please contact a mental health professional or emergency services.
            </p>
          </CardContent>
        </Card>

        <button
          onClick={() => onChange(!value)}
          className="flex items-start gap-3 w-full text-left p-4"
        >
          <div 
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: value ? 'var(--color-primary-default)' : 'transparent',
              border: value ? 'none' : '2px solid var(--color-border-default)'
            }}
          >
            {value && <Check size={16} style={{ color: 'var(--color-text-inverse)' }} />}
          </div>
          <span 
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              fontWeight: 'var(--font-weight-regular)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            I understand and agree
          </span>
        </button>
      </div>

      <Button
        onClick={onNext}
        disabled={!value}
        className="w-full"
        style={{
          backgroundColor: value ? 'var(--color-primary-default)' : 'var(--color-accent-default)',
          color: 'var(--color-text-inverse)',
          fontWeight: 'var(--font-weight-medium)',
          height: '48px',
          opacity: value ? 1 : 0.5
        }}
      >
        Continue
      </Button>
    </div>
  );
}

// SCREEN 10: Complete
function CompleteScreen({ 
  onComplete, 
  onExplore 
}: { 
  onComplete: () => void; 
  onExplore: () => void; 
}) {
  return (
    <div className="text-center space-y-8">
      {/* Success Icon */}
      <div 
        className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-accent-default)' }}
      >
        <span style={{ fontSize: '64px' }}>✨</span>
      </div>

      {/* Copy */}
      <div className="space-y-3">
        <h1 
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          Thanks for sharing
        </h1>
        <p 
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          We'll go at your pace.
        </p>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onComplete}
          className="w-full"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-text-inverse)',
            fontWeight: 'var(--font-weight-medium)',
            height: '48px'
          }}
        >
          Start first check-in
        </Button>
        
        <Button
          variant="ghost"
          onClick={onExplore}
          className="w-full"
          style={{
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-regular)'
          }}
        >
          Explore app
        </Button>
      </div>
    </div>
  );
}
