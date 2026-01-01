import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, X } from 'lucide-react';
import { cn } from '../ui/utils';

interface TypeformOption {
  id: string;
  label: string;
  value: any;
  description?: string;
}

interface TypeformQuestion {
  id: string;
  text: string;
  type: 'single_select' | 'multi_select' | 'text' | 'long_text' | 'scale';
  options?: TypeformOption[];
  placeholder?: string;
  required?: boolean;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min?: string; max?: string };
}

interface TypeformStep {
  id: string;
  type: 'intro' | 'question' | 'outro';
  title: string;
  description?: string;
  question?: TypeformQuestion;
}

interface TypeformWizardProps {
  steps: TypeformStep[];
  onComplete: (answers: Record<string, any>) => void;
  onExit?: () => void;
}

export function TypeformWizard({ steps, onComplete, onExit }: TypeformWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState(1);

  const currentStep = steps[currentIndex];
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const handleAnswer = (questionId: string, value: any, autoAdvance = true) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (autoAdvance && currentStep.question?.type === 'single_select') {
      // Auto-advance after 400ms for smooth UX
      setTimeout(() => {
        goNext();
      }, 400);
    }
  };

  const goNext = () => {
    if (currentIndex < steps.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(answers);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep.type === 'intro') {
      goNext();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      {/* Progress Bar - FIXED z-index and visibility */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[var(--color-primary-default)] z-[60]"
        style={{ 
          width: `${progress}%`,
          transformOrigin: 'left'
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />

      {/* Exit Button */}
      {onExit && (
        <button
          onClick={onExit}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      )}

      {/* Main Content */}
      <div className="h-full flex items-center justify-center p-4 md:p-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ 
              opacity: 0,
              x: direction > 0 ? 40 : -40,
              scale: 0.98
            }}
            animate={{ 
              opacity: 1,
              x: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0,
              x: direction > 0 ? -40 : 40,
              scale: 0.98
            }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="w-full max-w-2xl mx-auto"
          >
            {currentStep.type === 'intro' && (
              <IntroStep 
                step={currentStep} 
                onNext={goNext}
              />
            )}

            {currentStep.type === 'question' && currentStep.question && (
              <QuestionStep
                step={currentStep}
                question={currentStep.question}
                value={answers[currentStep.question.id]}
                onChange={(value) => handleAnswer(currentStep.question!.id, value, currentStep.question?.type === 'single_select')}
                onNext={goNext}
                onPrev={goPrev}
                canGoBack={currentIndex > 0}
              />
            )}

            {currentStep.type === 'outro' && (
              <OutroStep 
                step={currentStep}
                onComplete={() => {
                  console.log('🎉 Outro "View Results" clicked, submitting answers:', answers);
                  onComplete(answers);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Hint */}
      {currentStep.type !== 'question' && (
        <div className="fixed bottom-8 left-0 right-0 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-400"
          >
            Press <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-mono text-xs">Enter</kbd> or click to continue
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INTRO STEP
// ============================================================================

function IntroStep({ step, onNext }: { step: TypeformStep; onNext: () => void }) {
  return (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-primary-default)]/10 mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      >
        <div className="text-4xl">✨</div>
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-medium text-[var(--color-text-primary)] tracking-tight">
        {step.title}
      </h1>

      {step.description && (
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-xl mx-auto">
          {step.description}
        </p>
      )}

      <motion.button
        onClick={onNext}
        className="mt-8 group inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-primary-default)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-primary-default)]/90 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="font-medium">Let's get started</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );
}

// ============================================================================
// QUESTION STEP
// ============================================================================

function QuestionStep({ 
  step, 
  question, 
  value, 
  onChange, 
  onNext, 
  onPrev,
  canGoBack 
}: { 
  step: TypeformStep; 
  question: TypeformQuestion;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
}) {
  const isAnswered = value !== undefined && value !== null && value !== '';
  
  return (
    <div className="space-y-8">
      {/* Question Header */}
      <div className="space-y-3">
        <motion.div 
          className="flex items-center gap-2 text-sm text-gray-400 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary-default)] text-white text-xs">
            {step.id.replace(/\D/g, '') || '1'}
          </span>
          <ArrowRight size={12} />
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-medium text-[var(--color-text-primary)] tracking-tight">
          {question.text}
        </h2>

        {question.required && (
          <p className="text-sm text-gray-400">* Required</p>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.type === 'single_select' && question.options && (
          <SingleSelectField options={question.options} value={value} onChange={onChange} />
        )}

        {question.type === 'multi_select' && question.options && (
          <MultiSelectField options={question.options} value={value} onChange={onChange} />
        )}

        {question.type === 'text' && (
          <TextInput value={value} onChange={onChange} placeholder={question.placeholder} />
        )}

        {question.type === 'long_text' && (
          <TextArea value={value} onChange={onChange} placeholder={question.placeholder} />
        )}

        {question.type === 'scale' && (
          <ScaleField 
            min={question.scaleMin || 0}
            max={question.scaleMax || 10}
            labels={question.scaleLabels}
            value={value}
            onChange={onChange}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-4">
        {canGoBack && (
          <button
            onClick={onPrev}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
        )}

        {question.type !== 'single_select' && (
          <motion.button
            onClick={onNext}
            disabled={question.required && !isAnswered}
            className={cn(
              "ml-auto px-8 py-3 rounded-[var(--radius-md)] font-medium transition-all",
              isAnswered || !question.required
                ? "bg-[var(--color-primary-default)] text-white hover:bg-[var(--color-primary-default)]/90"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
            whileHover={isAnswered || !question.required ? { scale: 1.02 } : {}}
            whileTap={isAnswered || !question.required ? { scale: 0.98 } : {}}
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// FIELD COMPONENTS
// ============================================================================

function SingleSelectField({ options, value, onChange }: { 
  options: TypeformOption[]; 
  value: any; 
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = value?.toString() === option.value?.toString();
        
        return (
          <motion.button
            key={option.id}
            onClick={() => onChange(option.value)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "group relative w-full text-left p-6 rounded-[var(--radius-lg)] border-2 transition-all",
              "min-h-[72px] flex items-center gap-4",
              isSelected 
                ? "border-[var(--color-primary-default)] bg-[var(--color-primary-default)]/5 shadow-md" 
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            )}
          >
            {/* Letter Label */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
              isSelected 
                ? "bg-[var(--color-primary-default)] text-white"
                : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
            )}>
              {String.fromCharCode(65 + index)}
            </div>

            {/* Label */}
            <div className="flex-1">
              <div className={cn(
                "font-medium transition-colors",
                isSelected ? "text-[var(--color-primary-default)]" : "text-gray-900"
              )}>
                {option.label}
              </div>
              {option.description && (
                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
              )}
            </div>

            {/* Checkmark */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="flex-shrink-0"
              >
                <Check size={20} className="text-[var(--color-primary-default)]" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

function MultiSelectField({ options, value, onChange }: { 
  options: TypeformOption[]; 
  value: any; 
  onChange: (value: any) => void;
}) {
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (optionValue: any) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter(v => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option.value);
        
        return (
          <motion.button
            key={option.id}
            onClick={() => handleToggle(option.value)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "group relative w-full text-left p-6 rounded-[var(--radius-lg)] border-2 transition-all",
              "min-h-[72px] flex items-center gap-4",
              isSelected 
                ? "border-[var(--color-primary-default)] bg-[var(--color-primary-default)]/5 shadow-md" 
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            )}
          >
            {/* Checkbox */}
            <div className={cn(
              "flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
              isSelected 
                ? "bg-[var(--color-primary-default)] border-[var(--color-primary-default)]"
                : "bg-white border-gray-300"
            )}>
              {isSelected && <Check size={16} className="text-white" />}
            </div>

            {/* Label */}
            <div className="flex-1">
              <div className={cn(
                "font-medium transition-colors",
                isSelected ? "text-[var(--color-primary-default)]" : "text-gray-900"
              )}>
                {option.label}
              </div>
              {option.description && (
                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function ScaleField({ min, max, labels, value, onChange }: {
  min: number;
  max: number;
  labels?: { min?: string; max?: string };
  value: any;
  onChange: (value: any) => void;
}) {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-3">
        {numbers.map((num, index) => {
          const isSelected = value === num;
          
          return (
            <motion.button
              key={num}
              onClick={() => {
                onChange(num);
                setTimeout(() => {
                  // Auto-advance could go here if needed
                }, 300);
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-full font-medium transition-all",
                isSelected
                  ? "bg-[var(--color-primary-default)] text-white shadow-lg scale-110"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {num}
            </motion.button>
          );
        })}
      </div>

      {labels && (
        <div className="flex justify-between text-sm text-gray-500 px-2">
          <span>{labels.min || min}</span>
          <span>{labels.max || max}</span>
        </div>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
}) {
  return (
    <motion.input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Type your answer here...'}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full px-0 py-4 text-2xl font-medium text-gray-900 placeholder-gray-300 bg-transparent border-b-2 border-gray-200 focus:border-[var(--color-primary-default)] focus:outline-none transition-colors"
      autoFocus
    />
  );
}

function TextArea({ value, onChange, placeholder }: {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
}) {
  return (
    <motion.textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Type your answer here...'}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full min-h-[200px] px-0 py-4 text-lg text-gray-900 placeholder-gray-300 bg-transparent border-b-2 border-gray-200 focus:border-[var(--color-primary-default)] focus:outline-none transition-colors resize-none"
      autoFocus
    />
  );
}

// ============================================================================
// OUTRO STEP
// ============================================================================

function OutroStep({ step, onComplete }: { step: TypeformStep; onComplete: () => void }) {
  return (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      >
        <Check size={40} className="text-green-600" />
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-medium text-[var(--color-text-primary)] tracking-tight">
        {step.title}
      </h1>

      {step.description && (
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-xl mx-auto">
          {step.description}
        </p>
      )}

      <motion.button
        onClick={onComplete}
        className="mt-8 group inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-primary-default)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-primary-default)]/90 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="font-medium">View Results</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );
}