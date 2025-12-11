import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { ArrowLeft, ArrowRight, User, Heart, Shield, CheckCircle } from 'lucide-react';
import { cn } from '../ui/utils';
import { getEquipProgramContent, getStoredProgram, EquipProgramDetails } from '../../lib/equip-program-content';

interface EquipProgramOnboardingProps {
  onComplete?: () => void;
  onBack?: () => void;
}

interface OnboardingData {
  personalInfo: {
    name: string;
    age: string;
    pronouns: string;
  };
  currentState: {
    primaryConcern: string;
    severityLevel: string;
    previousExperience: string;
    currentSupport: string[];
    goals: string;
  };
  preferences: {
    communicationStyle: string;
    reminderFrequency: string;
    privacyLevel: string;
  };
  consent: {
    dataProcessing: boolean;
    communications: boolean;
    research: boolean;
  };
}

const initialData: OnboardingData = {
  personalInfo: {
    name: '',
    age: '',
    pronouns: ''
  },
  currentState: {
    primaryConcern: '',
    severityLevel: '',
    previousExperience: '',
    currentSupport: [],
    goals: ''
  },
  preferences: {
    communicationStyle: '',
    reminderFrequency: '',
    privacyLevel: ''
  },
  consent: {
    dataProcessing: false,
    communications: false,
    research: false
  }
};

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Your Journey',
    description: 'Let\'s get to know you better to personalize your experience',
    icon: <Heart size={24} />
  },
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Help us understand who you are',
    icon: <User size={24} />
  },
  {
    id: 'assessment',
    title: 'Current State Assessment',
    description: 'Tell us about your current situation and goals',
    icon: <CheckCircle size={24} />
  },
  {
    id: 'preferences',
    title: 'Your Preferences',
    description: 'Customize how you\'d like to engage with the program',
    icon: <Shield size={24} />
  },
  {
    id: 'consent',
    title: 'Privacy & Consent',
    description: 'Review and agree to our data practices',
    icon: <Shield size={24} />
  }
];

export function EquipProgramOnboarding({ onComplete, onBack }: EquipProgramOnboardingProps) {
  const isMobile = useIsMobile();
  const [content, setContent] = useState<EquipProgramDetails | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);

  // Mobile-optimized viewport setup (removed body overflow restrictions for mobile scrolling)
  useEffect(() => {
    // Only apply minimal viewport optimizations, allow normal scrolling
    if (isMobile) {
      // Ensure proper mobile viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
        );
      }
      
      // Add mobile-specific CSS class for optimizations
      document.documentElement.classList.add('mobile-onboarding');
    }
    
    return () => {
      if (isMobile) {
        document.documentElement.classList.remove('mobile-onboarding');
      }
    };
  }, [isMobile]);

  // Load program content
  useEffect(() => {
    const storedProgram = getStoredProgram();
    
    if (storedProgram && storedProgram.slug) {
      const programContent = getEquipProgramContent(storedProgram.slug);
      
      if (programContent) {
        setContent(programContent);
      } else {
        // Use a default program content if specific content not found
        setContent({
          id: storedProgram.slug || 'default',
          title: 'Program Onboarding',
          slug: storedProgram.slug || 'default',
          overview: {
            title: 'Program Overview',
            description: 'Complete your onboarding to start this program.'
          },
          whatYoullGet: {
            title: 'What You\'ll Get',
            description: 'A structured program to support your mental health journey.'
          },
          programDetails: {
            duration: '6 weeks',
            accessPeriod: '6 months',
            modules: '5 modules'
          },
          structure: {
            title: 'Program Structure',
            weeks: [],
            moreCount: 0
          },
          pricing: {
            amount: 'Free',
            currency: 'USD',
            description: 'No cost'
          }
        });
      }
    } else {
      // Set a fallback content
      setContent({
        id: 'default',
        title: 'Program Onboarding',
        slug: 'default',
        overview: {
          title: 'Program Overview',
          description: 'Complete your onboarding to start this program.'
        },
        whatYoullGet: {
          title: 'What You\'ll Get',
          description: 'A structured program to support your mental health journey.'
        },
        programDetails: {
          duration: '6 weeks',
          accessPeriod: '6 months',
          modules: '5 modules'
        },
        structure: {
          title: 'Program Structure',
          weeks: [],
          moreCount: 0
        },
        pricing: {
          amount: 'Free',
          currency: 'USD',
          description: 'No cost'
        }
      });
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save onboarding data and complete
      localStorage.setItem('ikan-equip-onboarding-data', JSON.stringify(data));
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack?.();
    }
  };

  const updateData = (section: keyof OnboardingData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateSupportArray = (value: string, checked: boolean) => {
    setData(prev => ({
      ...prev,
      currentState: {
        ...prev.currentState,
        currentSupport: checked 
          ? [...prev.currentState.currentSupport, value]
          : prev.currentState.currentSupport.filter(item => item !== value)
      }
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return true; // Welcome step
      case 1: // Personal info
        return data.personalInfo.name.length > 0 && data.personalInfo.age.length > 0;
      case 2: // Assessment
        return data.currentState.primaryConcern.length > 0 && 
               data.currentState.severityLevel.length > 0 &&
               data.currentState.goals.length > 0;
      case 3: // Preferences
        return data.preferences.communicationStyle.length > 0 &&
               data.preferences.reminderFrequency.length > 0;
      case 4: // Consent
        return data.consent.dataProcessing && data.consent.communications;
      default: return true;
    }
  };

  if (!content) {
    return (
      <div className="h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ 
        backgroundColor: 'var(--color-bg-page)',
        paddingTop: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)',
        paddingRight: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)',
        paddingBottom: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)',
        paddingLeft: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)',
        maxWidth: isMobile ? '100%' : 'var(--constraint-content-max)',
        margin: isMobile ? '0' : '0 auto',
        // Mobile-friendly scrolling
        ...(isMobile && {
          minHeight: '100vh',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch'
        })
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 mb-6" style={{ 
        backgroundColor: isMobile ? 'transparent' : 'var(--color-bg-card)', 
        borderColor: isMobile ? 'transparent' : 'var(--color-border-default)',
        borderBottom: isMobile ? 'none' : '1px solid var(--color-border-default)'
      }}>
        <div className={isMobile ? '' : 'max-w-4xl mx-auto px-4 py-4'}>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="gap-2"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-normal)',
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            >
              <ArrowLeft size={16} />
              {currentStep === 0 ? 'Back' : 'Previous'}
            </Button>
            
            <div className="text-center">
              <h1 style={{ 
                fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                {content.title}
              </h1>
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)'
              }}>
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>

            <div className="w-16"></div> {/* Spacer for alignment */}
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className={cn(
                    "flex items-center justify-center rounded-full transition-colors",
                    isMobile ? "w-6 h-6" : "w-8 h-8",
                    index <= currentStep 
                      ? "text-white" 
                      : "bg-gray-200 text-gray-400"
                  )}
                  style={{
                    backgroundColor: index <= currentStep ? 'var(--color-primary-default)' : 'var(--color-bg-muted)'
                  }}>
                    {index < currentStep ? (
                      <CheckCircle size={isMobile ? 12 : 16} />
                    ) : (
                      <span style={{ fontSize: 'var(--text-xs)' }}>{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "h-0.5 transition-colors",
                      isMobile ? "w-4" : "w-8",
                      index < currentStep ? "" : "bg-gray-200"
                    )} 
                    style={{
                      backgroundColor: index < currentStep ? 'var(--color-primary-default)' : 'var(--color-bg-muted)'
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile-optimized scrolling */}
      <div 
        className="flex-1"
        style={{
          // Enable proper mobile scrolling
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          // Ensure content is accessible
          minHeight: isMobile ? '60vh' : 'auto'
        }}
      >
        <div 
          style={{
            maxWidth: isMobile ? '100%' : '600px',
            margin: '0 auto',
            padding: isMobile ? '0' : 'var(--spacing-4)'
          }}
        >
        <Card style={{
          backgroundColor: 'var(--color-bg-card)',
          border: isMobile ? 'none' : '1px solid var(--color-border-default)',
          borderRadius: isMobile ? 'var(--radius-lg)' : 'var(--radius-lg)',
          boxShadow: isMobile ? 'none' : 'var(--shadow-sm)'
        }}>
          <CardHeader className="text-center" style={{
            padding: isMobile ? 'var(--spacing-6) var(--spacing-4)' : 'var(--spacing-6)'
          }}>
            <div 
              className="mx-auto mb-4 rounded-full flex items-center justify-center" 
              style={{ 
                backgroundColor: 'var(--color-primary-default)',
                width: isMobile ? '48px' : '56px',
                height: isMobile ? '48px' : '56px'
              }}
            >
              <div style={{ color: 'var(--color-primary-on)' }}>
                {steps[currentStep].icon}
              </div>
            </div>
            <CardTitle style={{ 
              fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {steps[currentStep].title}
            </CardTitle>
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: 'var(--font-weight-normal)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-md)'
            }}>
              {steps[currentStep].description}
            </p>
          </CardHeader>
          <CardContent 
            className="space-y-6"
            style={{
              padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)'
            }}
          >
            {/* Welcome Step */}
            {currentStep === 0 && (
              <div className="text-center space-y-4">
                <div 
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <h3 style={{ 
                    fontSize: 'var(--text-lg)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-4)'
                  }}>
                    Welcome to {content.title}
                  </h3>
                  <p style={{ 
                    fontSize: 'var(--text-base)', 
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-lg)'
                  }}>
                    {content.overview.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4">
                    <div style={{ color: 'var(--color-status-info)', marginBottom: 'var(--spacing-2)' }}>
                      <CheckCircle size={32} className="mx-auto" />
                    </div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      Evidence-Based
                    </h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      Clinically proven techniques
                    </p>
                  </div>
                  <div className="p-4">
                    <div style={{ color: 'var(--color-status-success)', marginBottom: 'var(--spacing-2)' }}>
                      <Shield size={32} className="mx-auto" />
                    </div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      Secure & Private
                    </h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      Your data is protected
                    </p>
                  </div>
                  <div className="p-4">
                    <div style={{ color: 'var(--color-status-warning)', marginBottom: 'var(--spacing-2)' }}>
                      <Heart size={32} className="mx-auto" />
                    </div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      Personalized
                    </h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      Tailored to your needs
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information Step */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">What should we call you?</Label>
                  <Input
                    id="name"
                    value={data.personalInfo.name}
                    onChange={(e) => updateData('personalInfo', 'name', e.target.value)}
                    placeholder="Your preferred name"
                    style={{
                      height: 'var(--ikan-component-input-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontSize: '16px', // Prevents iOS zoom
                      fontWeight: 'var(--font-weight-regular)'
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age (optional)</Label>
                  <Input
                    id="age"
                    value={data.personalInfo.age}
                    onChange={(e) => updateData('personalInfo', 'age', e.target.value)}
                    placeholder="Your age"
                    style={{
                      height: 'var(--ikan-component-input-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontSize: '16px', // Prevents iOS zoom
                      fontWeight: 'var(--font-weight-regular)'
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="pronouns">Pronouns (optional)</Label>
                  <Input
                    id="pronouns"
                    value={data.personalInfo.pronouns}
                    onChange={(e) => updateData('personalInfo', 'pronouns', e.target.value)}
                    placeholder="e.g., they/them, she/her, he/him"
                    style={{
                      height: 'var(--ikan-component-input-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontSize: '16px', // Prevents iOS zoom
                      fontWeight: 'var(--font-weight-regular)'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Assessment Step */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-4)',
                    display: 'block'
                  }}>
                    What's your primary concern right now?
                  </Label>
                  <RadioGroup 
                    value={data.currentState.primaryConcern}
                    onValueChange={(value) => updateData('currentState', 'primaryConcern', value)}
                    className="space-y-0"
                  >
                    {[
                      { value: "work-stress", label: "Work-related stress", description: "Feeling overwhelmed by workplace demands and pressure" },
                      { value: "anxiety", label: "Anxiety and worry", description: "Persistent feelings of nervousness or excessive concern" },
                      { value: "low-mood", label: "Low mood or depression", description: "Feeling down, hopeless, or losing interest in activities" },
                      { value: "relationships", label: "Relationship issues", description: "Challenges with family, friends, or romantic relationships" },
                      { value: "life-changes", label: "Major life changes", description: "Adjusting to significant transitions or life events" }
                    ].map((option, index) => (
                      <div 
                        key={option.value}
                        className="flex items-start justify-between py-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                        style={{
                          borderBottom: index < 4 ? '1px solid var(--color-border-light)' : 'none',
                          paddingLeft: 'var(--spacing-4)',
                          paddingRight: 'var(--spacing-4)',
                          marginLeft: 'calc(-1 * var(--spacing-4))',
                          marginRight: 'calc(-1 * var(--spacing-4))',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        onClick={() => updateData('currentState', 'primaryConcern', option.value)}
                      >
                        <div className="flex-1 pr-4">
                          <Label 
                            htmlFor={option.value}
                            className="cursor-pointer block"
                            style={{ 
                              fontSize: 'var(--text-base)', 
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--color-text-primary)',
                              marginBottom: 'var(--spacing-1)',
                              lineHeight: 'var(--line-height-md)'
                            }}
                          >
                            {option.label}
                          </Label>
                          <p style={{ 
                            fontSize: 'var(--text-sm)', 
                            fontWeight: 'var(--font-weight-normal)',
                            color: 'var(--color-text-muted)',
                            lineHeight: 'var(--line-height-md)',
                            margin: 0
                          }}>
                            {option.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center">
                          <RadioGroupItem 
                            value={option.value} 
                            id={option.value}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: '2px solid var(--color-border-default)',
                              backgroundColor: data.currentState.primaryConcern === option.value 
                                ? 'var(--color-primary-default)' 
                                : 'transparent'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-4)',
                    display: 'block'
                  }}>
                    How would you rate the severity? (1-10)
                  </Label>
                  <RadioGroup 
                    value={data.currentState.severityLevel}
                    onValueChange={(value) => updateData('currentState', 'severityLevel', value)}
                    className="grid grid-cols-5 gap-2"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <div 
                        key={num} 
                        className="flex flex-col items-center space-y-2 cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                        style={{
                          border: data.currentState.severityLevel === num.toString() 
                            ? '2px solid var(--color-primary-default)' 
                            : '1px solid var(--color-border-light)',
                          backgroundColor: data.currentState.severityLevel === num.toString() 
                            ? 'var(--color-primary-default)10' 
                            : 'transparent'
                        }}
                        onClick={() => updateData('currentState', 'severityLevel', num.toString())}
                      >
                        <RadioGroupItem 
                          value={num.toString()} 
                          id={`severity-${num}`}
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: '2px solid var(--color-border-default)',
                            backgroundColor: data.currentState.severityLevel === num.toString() 
                              ? 'var(--color-primary-default)' 
                              : 'transparent'
                          }}
                        />
                        <Label 
                          htmlFor={`severity-${num}`}
                          className="cursor-pointer"
                          style={{ 
                            fontSize: 'var(--text-sm)', 
                            fontWeight: 'var(--font-weight-medium)',
                            color: data.currentState.severityLevel === num.toString() 
                              ? 'var(--color-primary-default)' 
                              : 'var(--color-text-primary)'
                          }}
                        >
                          {num}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-4)',
                    display: 'block'
                  }}>
                    What current support do you have? (Check all that apply)
                  </Label>
                  <div className="space-y-0">
                    {[
                      { value: 'Family support', description: 'Support from family members or relatives' },
                      { value: 'Friends support', description: 'Close friends who provide emotional support' },
                      { value: 'Professional therapy', description: 'Working with a licensed therapist or counselor' },
                      { value: 'Support groups', description: 'Participating in peer support or group therapy' },
                      { value: 'Medication', description: 'Prescribed medication for mental health' },
                      { value: 'Self-help resources', description: 'Books, apps, or online resources for self-care' },
                      { value: 'None currently', description: 'No formal support system in place right now' }
                    ].map((option, index) => (
                      <div 
                        key={option.value}
                        className="flex items-start justify-between py-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                        style={{
                          borderBottom: index < 6 ? '1px solid var(--color-border-light)' : 'none',
                          paddingLeft: 'var(--spacing-4)',
                          paddingRight: 'var(--spacing-4)',
                          marginLeft: 'calc(-1 * var(--spacing-4))',
                          marginRight: 'calc(-1 * var(--spacing-4))',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        onClick={() => updateSupportArray(option.value, !data.currentState.currentSupport.includes(option.value))}
                      >
                        <div className="flex-1 pr-4">
                          <Label 
                            htmlFor={option.value}
                            className="cursor-pointer block"
                            style={{ 
                              fontSize: 'var(--text-base)', 
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--color-text-primary)',
                              marginBottom: 'var(--spacing-1)',
                              lineHeight: 'var(--line-height-md)'
                            }}
                          >
                            {option.value}
                          </Label>
                          <p style={{ 
                            fontSize: 'var(--text-sm)', 
                            fontWeight: 'var(--font-weight-normal)',
                            color: 'var(--color-text-muted)',
                            lineHeight: 'var(--line-height-md)',
                            margin: 0
                          }}>
                            {option.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center">
                          <Checkbox
                            id={option.value}
                            checked={data.currentState.currentSupport.includes(option.value)}
                            onCheckedChange={(checked) => updateSupportArray(option.value, !!checked)}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: 'var(--radius-sm)',
                              border: '2px solid var(--color-border-default)',
                              backgroundColor: data.currentState.currentSupport.includes(option.value) 
                                ? 'var(--color-primary-default)' 
                                : 'transparent'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="goals">What are your goals for this program?</Label>
                  <Textarea
                    id="goals"
                    value={data.currentState.goals}
                    onChange={(e) => updateData('currentState', 'goals', e.target.value)}
                    placeholder="Tell us what you hope to achieve..."
                    rows={3}
                    style={{
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontSize: '16px', // Prevents iOS zoom
                      fontWeight: 'var(--font-weight-regular)',
                      minHeight: 'calc(var(--ikan-component-input-height) * 1.5)'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Preferences Step */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-4)',
                    display: 'block'
                  }}>
                    Communication style preference
                  </Label>
                  <RadioGroup 
                    value={data.preferences.communicationStyle}
                    onValueChange={(value) => updateData('preferences', 'communicationStyle', value)}
                    className="space-y-0"
                  >
                    {[
                      { value: "gentle", label: "Gentle and supportive", description: "Soft, encouraging guidance with empathy and understanding" },
                      { value: "direct", label: "Direct and practical", description: "Clear, straightforward advice with actionable steps" },
                      { value: "motivational", label: "Motivational and encouraging", description: "Uplifting, energizing approach to build confidence" }
                    ].map((option, index) => (
                      <div 
                        key={option.value}
                        className="flex items-start justify-between py-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                        style={{
                          borderBottom: index < 2 ? '1px solid var(--color-border-light)' : 'none',
                          paddingLeft: 'var(--spacing-4)',
                          paddingRight: 'var(--spacing-4)',
                          marginLeft: 'calc(-1 * var(--spacing-4))',
                          marginRight: 'calc(-1 * var(--spacing-4))',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        onClick={() => updateData('preferences', 'communicationStyle', option.value)}
                      >
                        <div className="flex-1 pr-4">
                          <Label 
                            htmlFor={option.value}
                            className="cursor-pointer block"
                            style={{ 
                              fontSize: 'var(--text-base)', 
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--color-text-primary)',
                              marginBottom: 'var(--spacing-1)',
                              lineHeight: 'var(--line-height-md)'
                            }}
                          >
                            {option.label}
                          </Label>
                          <p style={{ 
                            fontSize: 'var(--text-sm)', 
                            fontWeight: 'var(--font-weight-normal)',
                            color: 'var(--color-text-muted)',
                            lineHeight: 'var(--line-height-md)',
                            margin: 0
                          }}>
                            {option.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center">
                          <RadioGroupItem 
                            value={option.value} 
                            id={option.value}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: '2px solid var(--color-border-default)',
                              backgroundColor: data.preferences.communicationStyle === option.value 
                                ? 'var(--color-primary-default)' 
                                : 'transparent'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-4)',
                    display: 'block'
                  }}>
                    How often would you like reminders?
                  </Label>
                  <RadioGroup 
                    value={data.preferences.reminderFrequency}
                    onValueChange={(value) => updateData('preferences', 'reminderFrequency', value)}
                    className="space-y-0"
                  >
                    {[
                      { value: "daily", label: "Daily", description: "Get gentle daily reminders to check in with yourself" },
                      { value: "every-few-days", label: "Every few days", description: "Receive reminders 2-3 times per week" },
                      { value: "weekly", label: "Weekly", description: "Weekly check-ins to maintain your progress" },
                      { value: "minimal", label: "Minimal reminders", description: "Only occasional reminders when needed" }
                    ].map((option, index) => (
                      <div 
                        key={option.value}
                        className="flex items-start justify-between py-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                        style={{
                          borderBottom: index < 3 ? '1px solid var(--color-border-light)' : 'none',
                          paddingLeft: 'var(--spacing-4)',
                          paddingRight: 'var(--spacing-4)',
                          marginLeft: 'calc(-1 * var(--spacing-4))',
                          marginRight: 'calc(-1 * var(--spacing-4))',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        onClick={() => updateData('preferences', 'reminderFrequency', option.value)}
                      >
                        <div className="flex-1 pr-4">
                          <Label 
                            htmlFor={option.value}
                            className="cursor-pointer block"
                            style={{ 
                              fontSize: 'var(--text-base)', 
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--color-text-primary)',
                              marginBottom: 'var(--spacing-1)',
                              lineHeight: 'var(--line-height-md)'
                            }}
                          >
                            {option.label}
                          </Label>
                          <p style={{ 
                            fontSize: 'var(--text-sm)', 
                            fontWeight: 'var(--font-weight-normal)',
                            color: 'var(--color-text-muted)',
                            lineHeight: 'var(--line-height-md)',
                            margin: 0
                          }}>
                            {option.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center">
                          <RadioGroupItem 
                            value={option.value} 
                            id={option.value}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: '2px solid var(--color-border-default)',
                              backgroundColor: data.preferences.reminderFrequency === option.value 
                                ? 'var(--color-primary-default)' 
                                : 'transparent'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Consent Step */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <h3 style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-medium)',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    Your Privacy Matters
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    We take your privacy seriously. Please review and agree to our data practices.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="data-processing"
                      checked={data.consent.dataProcessing}
                      onCheckedChange={(checked) => updateData('consent', 'dataProcessing', !!checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="data-processing" className="font-medium">
                        Data Processing (Required)
                      </Label>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        I consent to the processing of my personal data to provide personalized program content and track my progress.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="communications"
                      checked={data.consent.communications}
                      onCheckedChange={(checked) => updateData('consent', 'communications', !!checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="communications" className="font-medium">
                        Communications (Required)
                      </Label>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        I agree to receive program-related communications, reminders, and updates via the app and email.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="research"
                      checked={data.consent.research}
                      onCheckedChange={(checked) => updateData('consent', 'research', !!checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="research" className="font-medium">
                        Research Participation (Optional)
                      </Label>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        I consent to anonymized data being used for research to improve mental health programs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={isMobile ? "space-y-3 pt-6" : "flex justify-between pt-6"}>
              <Button
                variant="outline"
                onClick={handlePrevious}
                className={isMobile ? "w-full gap-2 justify-center" : "gap-2"}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)'
                }}
              >
                <ArrowLeft size={16} />
                {currentStep === 0 ? 'Back' : 'Previous'}
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={isMobile ? "w-full gap-2 justify-center" : "gap-2"}
                style={{
                  backgroundColor: 'var(--semantic-button-primary-bg)',
                  color: 'var(--semantic-button-primary-fg)',
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  border: 'none',
                  opacity: !isStepValid() ? 0.5 : 1
                }}
              >
                {currentStep === steps.length - 1 ? 'Start Program' : 'Continue'}
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}