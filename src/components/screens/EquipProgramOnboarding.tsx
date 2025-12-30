import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { ArrowLeft, CheckCircle, Info, Lock, ChevronRight, X } from 'lucide-react';
import { cn } from '../ui/utils';
import { getEquipProgramContent, getStoredProgram, EquipProgramDetails } from '../../lib/equip-program-content';
import { apiClient } from '../../lib/api-client';
import { useNotifications } from '../../contexts/NotificationContext';
import { OnboardingData } from '../../lib/equip-types';
import { OnboardingQuestionSet, OnboardingQuestion } from '../../lib/equip-onboarding-types';

// Fallback empty question set to avoid hardcoded file dependency
const EMPTY_ONBOARDING: OnboardingQuestionSet = {
  id: 'fallback',
  equip_id: 'default',
  title: 'Program Setup',
  description: 'Setup your program',
  is_required_before_start: true,
  version: '1.0.0',
  sections: [],
  questions: []
};

interface EquipOnboardingProps {
  programId?: string;
  onComplete?: (data?: any) => void;
  onBack?: () => void;
}

export function EquipOnboarding({ programId: propProgramId, onComplete, onBack }: EquipOnboardingProps) {
  const isMobile = useIsMobile();
  const [programContent, setProgramContent] = useState<EquipProgramDetails | null>(null);
  const [programId, setProgramId] = useState<string>(propProgramId || 'sleep-tight-9');
  
  // State
  const [questionSet, setQuestionSet] = useState<OnboardingQuestionSet>(EMPTY_ONBOARDING);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 = Intro Screen
  const [showValidationHint, setShowValidationHint] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { addNotification, showToast } = useNotifications();

  // Load Program
  useEffect(() => {
    let id = propProgramId;
    
    if (!id) {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      const storedProgram = getStoredProgram();
      id = urlId || storedProgram?.slug || 'sleep-tight-9';
    }
    
    setProgramId(id);

    if (id) {
      const content = getEquipProgramContent(id);
      if (content) setProgramContent(content);
    }
  }, [propProgramId]);

  // Filter Visible Questions
  const visibleQuestions = questionSet.questions
    .sort((a, b) => a.order - b.order)
    .filter(q => {
      if (!q.conditional_logic) return true;
      const { trigger_question_id, condition, value } = q.conditional_logic;
      const triggerValue = answers[trigger_question_id];
      switch (condition) {
        case 'equals': return triggerValue === value;
        case 'contains': return Array.isArray(triggerValue) && triggerValue.includes(value);
        case 'not_equals': return triggerValue !== value;
        default: return true;
      }
    });

  const currentQuestion = currentQuestionIndex >= 0 ? visibleQuestions[currentQuestionIndex] : null;
  const totalQuestions = visibleQuestions.length;

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setShowValidationHint(false); // Clear hint on interaction
  };

  const handleMultiSelectChange = (questionId: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      const newValues = checked 
        ? [...current, value]
        : current.filter((v: string) => v !== value);
      return { ...prev, [questionId]: newValues };
    });
    setShowValidationHint(false);
  };

  const validateCurrent = () => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;
    
    const val = answers[currentQuestion.id];
    if (val === undefined || val === '' || val === null) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  };

  const handleNext = async () => {
    if (currentQuestionIndex === -1) {
      // Move from Intro to Q1
      setCurrentQuestionIndex(0);
      return;
    }

    if (!validateCurrent()) {
      setShowValidationHint(true);
      return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowValidationHint(false);
      window.scrollTo(0, 0);
    } else {
      await submitOnboarding();
    }
  };

  const handleSkip = () => {
    handleAnswerChange(currentQuestion!.id, null);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      submitOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    } else if (currentQuestionIndex === 0) {
      setCurrentQuestionIndex(-1); // Back to Intro
    } else {
      onBack?.();
    }
  };

  const submitOnboarding = async () => {
    setIsEnrolling(true);
    try {
      const storedProgram = getStoredProgram();
      const slug = programId || storedProgram?.slug || 'sleep-tight-9';
      
      // Legacy mapping
      const legacyData: OnboardingData = {
        personalInfo: { name: 'Equip User', preferredName: '', age: '', pronouns: '' },
        programGoals: { what: 'Not specified', why: '', when: '', expectations: '' },
        currentState: { primaryConcern: 'Sleep', severityLevel: 5, previousExperience: answers['q-therapy-history'] || '', currentSupport: [] },
        preferences: { reminderTime: '09:00', communicationStyle: 'balanced', privacyLevel: 'medium' },
        consent: { dataProcessing: true, communications: true, research: false }
      };

      // Use correct API method
      const enrollmentData = {
        programId: slug,
        onboardingData: {
            answers,
            legacyMapping: legacyData
        }
      };
      
      const response = await apiClient.createEquipEnrollment(enrollmentData);
      
      if (response?.enrollment) {
        localStorage.setItem('ikan-current-enrollment', response.enrollment.enrollmentId);
        localStorage.setItem('ikan-equip-onboarding-answers', JSON.stringify(answers));
        
        onComplete?.(answers);
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Enrollment Failed', 'Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const renderInput = (q: OnboardingQuestion) => {
    switch (q.input_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            className="h-14 text-lg"
            placeholder="Type your answer..."
          />
        );
      case 'single_select':
        return (
          <RadioGroup value={answers[q.id] || ''} onValueChange={(v) => handleAnswerChange(q.id, v)} className="space-y-3">
            {q.options?.map((opt) => (
              <div key={opt.id} className="relative">
                <RadioGroupItem value={opt.value} id={`${q.id}-${opt.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`${q.id}-${opt.id}`}
                  className="flex items-center p-4 rounded-xl border border-gray-200 cursor-pointer transition-all hover:bg-gray-50 peer-data-[state=checked]:border-[var(--color-primary-default)] peer-data-[state=checked]:bg-[var(--color-primary-light)] peer-data-[state=checked]:text-[var(--color-primary-dark)]"
                >
                  <span className="text-base font-medium">{opt.label}</span>
                </Label>
              </div>
            ))}
            {q.allow_prefer_not_to_say && (
              <div className="relative mt-4">
                <RadioGroupItem value="prefer_not_to_say" id="pnts" className="peer sr-only" />
                <Label htmlFor="pnts" className="block text-center text-sm text-gray-500 cursor-pointer hover:text-gray-800 peer-data-[state=checked]:font-medium peer-data-[state=checked]:text-[var(--color-primary-default)]">
                  Prefer not to answer
                </Label>
              </div>
            )}
          </RadioGroup>
        );
      case 'multi_select':
        const vals = answers[q.id] || [];
        return (
          <div className="space-y-3">
            {q.options?.map((opt) => (
              <div key={opt.id} className="relative">
                <Checkbox
                  id={`${q.id}-${opt.id}`}
                  checked={vals.includes(opt.value)}
                  onCheckedChange={(c) => handleMultiSelectChange(q.id, opt.value, !!c)}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`${q.id}-${opt.id}`}
                  className={cn(
                    "flex items-center p-4 rounded-xl border border-gray-200 cursor-pointer transition-all hover:bg-gray-50",
                    vals.includes(opt.value) ? "border-[var(--color-primary-default)] bg-[var(--color-primary-light)]" : ""
                  )}
                >
                  <span className={cn("text-base font-medium", vals.includes(opt.value) ? "text-[var(--color-primary-dark)]" : "")}>
                    {opt.label}
                  </span>
                  {vals.includes(opt.value) && <CheckCircle size={18} className="ml-auto text-[var(--color-primary-default)]" />}
                </Label>
              </div>
            ))}
          </div>
        );
      case 'textarea':
        return <Textarea value={answers[q.id] || ''} onChange={e => handleAnswerChange(q.id, e.target.value)} rows={5} className="text-lg p-4" />;
      default: return null;
    }
  };

  // 1. INTRO VIEW
  if (currentQuestionIndex === -1) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col">
        <header className="px-6 py-4 flex justify-between items-center">
          <span className="font-medium text-gray-900">{programContent?.title || 'Program Setup'}</span>
          <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500"><X size={20} /></Button>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
            <Info size={32} />
          </div>
          <h1 className="text-2xl font-semibold mb-4 text-gray-900">Before we begin...</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We'd like to know a little about you. This helps us personalize your experience and ensure this program is the right fit.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-12 bg-gray-50 py-2 px-4 rounded-full">
            <Lock size={12} />
            Your responses are private and secure.
          </div>
          <Button onClick={handleNext} className="w-full h-14 text-lg bg-[var(--color-primary-default)] text-white rounded-xl shadow-lg shadow-blue-500/20">
            Get Started
          </Button>
        </main>
      </div>
    );
  }

  // 2. QUESTION VIEW
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col transition-colors duration-500">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handlePrevious} className="p-0 hover:bg-transparent text-gray-400 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Button>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          Step {currentQuestionIndex + 1} of {totalQuestions}
        </span>
        <div className="w-5" /> {/* Spacer */}
      </header>

      {/* Progress Line */}
      <div className="h-1 bg-gray-100 w-full">
        <div 
          className="h-full bg-[var(--color-primary-default)] transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col p-6 max-w-lg mx-auto w-full">
        <div className="flex-1 flex flex-col justify-center">
          {currentQuestion && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 leading-tight">
                {currentQuestion.question_text}
              </h2>
              
              {currentQuestion.helper_text && (
                <p className="text-gray-500 mb-8 text-base">
                  {currentQuestion.helper_text}
                </p>
              )}

              <div className="space-y-6">
                {renderInput(currentQuestion)}
              </div>

              {/* Validation Hint (The "Gentle Nudge") */}
              {showValidationHint && (
                <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg flex items-center gap-2 animate-pulse">
                  <Info size={16} />
                  Please answer this question to continue.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 space-y-3">
          <Button 
            onClick={handleNext}
            disabled={isEnrolling}
            className="w-full h-14 text-lg rounded-xl flex items-center justify-center gap-2 bg-[var(--color-primary-default)] text-white shadow-md hover:shadow-lg transition-all"
          >
            {isEnrolling ? (
              'Setting up...'
            ) : (
              <>
                {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Continue'}
                <ChevronRight size={20} />
              </>
            )}
          </Button>

          {!currentQuestion?.required && !isEnrolling && (
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="w-full text-gray-400 hover:text-gray-600 hover:bg-transparent h-auto py-2 text-sm font-normal"
            >
              Skip for now
            </Button>
          )}
          
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <Lock size={10} />
              Private & Secure
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
