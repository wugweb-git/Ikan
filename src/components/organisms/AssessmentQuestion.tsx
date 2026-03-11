import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { cn } from '../ui/utils';
import { Icon } from '../Icon';

interface AssessmentQuestionProps {
  question: {
    id: string;
    text: string;
    type: 'scale' | 'single-choice' | 'multiple-choice';
    options?: Array<{ id: string; text: string; value: number | string }>;
    scaleMin?: number;
    scaleMax?: number;
    scaleLabels?: { min: string; max: string };
    required?: boolean;
  };
  value?: any;
  onAnswer: (questionId: string, answer: any) => void;
  showNext?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  questionNumber?: number;
  totalQuestions?: number;
  className?: string;
}

export function AssessmentQuestion({
  question,
  value,
  onAnswer,
  showNext = true,
  onNext,
  onPrevious,
  questionNumber,
  totalQuestions,
  className
}: AssessmentQuestionProps) {
  const [currentValue, setCurrentValue] = useState(value);

  const handleAnswer = (answer: any) => {
    setCurrentValue(answer);
    onAnswer(question.id, answer);
  };

  const handleScaleChange = (values: number[]) => {
    const newValue = values[0];
    handleAnswer(newValue);
  };

  const handleSingleChoice = (optionId: string) => {
    const selectedOption = question.options?.find(opt => opt.id === optionId);
    if (selectedOption) {
      handleAnswer(selectedOption.value);
    }
  };

  const handleMultipleChoice = (optionId: string, checked: boolean) => {
    const currentAnswers = Array.isArray(currentValue) ? currentValue : [];
    const selectedOption = question.options?.find(opt => opt.id === optionId);
    
    if (!selectedOption) return;

    let newAnswers;
    if (checked) {
      newAnswers = [...currentAnswers, selectedOption.value];
    } else {
      newAnswers = currentAnswers.filter((val: any) => val !== selectedOption.value);
    }
    
    handleAnswer(newAnswers);
  };

  const isAnswered = () => {
    if (question.type === 'scale') {
      return currentValue !== undefined && currentValue !== null;
    }
    if (question.type === 'multiple-choice') {
      return Array.isArray(currentValue) && currentValue.length > 0;
    }
    return currentValue !== undefined && currentValue !== null && currentValue !== '';
  };

  const renderScaleQuestion = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span 
            style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)'
            }}
          >
            {question.scaleLabels?.min || `${question.scaleMin || 0}`}
          </span>
          <span 
            style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)'
            }}
          >
            {question.scaleLabels?.max || `${question.scaleMax || 10}`}
          </span>
        </div>
        
        <Slider
          value={[currentValue || question.scaleMin || 0]}
          onValueChange={handleScaleChange}
          min={question.scaleMin || 0}
          max={question.scaleMax || 10}
          step={1}
          className="w-full"
        />
        
        <div className="text-center">
          <span 
            style={{ 
              fontSize: 'var(--text-lg)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary-default)'
            }}
          >
            {currentValue !== undefined ? currentValue : question.scaleMin || 0}
          </span>
        </div>
      </div>
    </div>
  );

  const renderSingleChoice = () => (
    <RadioGroup
      value={question.options?.find(opt => opt.value === currentValue)?.id || ""}
      onValueChange={handleSingleChoice}
      className="space-y-3"
    >
      {question.options?.map((option) => (
        <div key={option.id} className="relative">
          <RadioGroupItem 
            value={option.id} 
            id={option.id}
            className="peer sr-only"
          />
          <Label 
            htmlFor={option.id}
            className="flex items-center p-4 rounded-xl border-2 border-transparent bg-[var(--ikan-color-bg-input)] cursor-pointer transition-all hover:bg-[var(--ikan-color-bg-muted)] peer-data-[state=checked]:border-[var(--ikan-color-primary-default)] peer-data-[state=checked]:bg-[var(--ikan-color-accent-default)] peer-data-[state=checked]:text-[var(--ikan-color-primary-default)]"
            style={{
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--line-height-md)'
            }}
          >
            <div className="flex-1 font-medium text-[var(--ikan-color-text-primary)]">
              {option.text}
            </div>
            <div className="w-5 h-5 rounded-full border border-[var(--ikan-color-border-default)] peer-data-[state=checked]:border-[var(--ikan-color-primary-default)] peer-data-[state=checked]:bg-[var(--ikan-color-primary-default)] flex items-center justify-center">
              {question.options?.find(opt => opt.value === currentValue)?.id === option.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              )}
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options?.map((option) => {
        const isChecked = Array.isArray(currentValue) && 
          currentValue.includes(option.value);
        
        return (
          <div key={option.id} className="relative">
             <input
              type="checkbox"
              id={option.id}
              checked={isChecked}
              onChange={(e) => handleMultipleChoice(option.id, e.target.checked)}
              className="peer sr-only"
            />
            <Label 
              htmlFor={option.id}
              className="flex items-center p-4 rounded-xl border-2 border-transparent bg-[var(--ikan-color-bg-input)] cursor-pointer transition-all hover:bg-[var(--ikan-color-bg-muted)] peer-checked:border-[var(--ikan-color-primary-default)] peer-checked:bg-[var(--ikan-color-accent-default)]"
              style={{
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--line-height-md)'
              }}
            >
              <div className="flex-1 font-medium text-[var(--ikan-color-text-primary)]">
                {option.text}
              </div>
               <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-[var(--ikan-color-primary-default)] border-[var(--ikan-color-primary-default)]' : 'border-[var(--ikan-color-border-default)] bg-white'}`}>
                  {isChecked && <Icon name="check" size={12} className="text-white" />}
               </div>
            </Label>
          </div>
        );
      })}
    </div>
  );

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'scale':
        return renderScaleQuestion();
      case 'single-choice':
        return renderSingleChoice();
      case 'multiple-choice':
        return renderMultipleChoice();
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn("w-full max-w-2xl mx-auto", className)}
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)'
      }}
    >
      <CardContent 
        className="space-y-6"
        style={{ padding: 'var(--spacing-6)' }}
      >
        {/* Progress indicator */}
        {questionNumber && totalQuestions && (
          <div className="flex items-center justify-between">
            <span 
              style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)'
              }}
            >
              Question {questionNumber} of {totalQuestions}
            </span>
            <div 
              className="h-2 rounded-full"
              style={{ backgroundColor: 'var(--color-bg-muted)' }}
            >
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(questionNumber / totalQuestions) * 100}%`,
                  backgroundColor: 'var(--color-primary-default)',
                  borderRadius: 'var(--radius-pill)'
                }}
              />
            </div>
          </div>
        )}

        {/* Question */}
        <div className="space-y-4">
          <h2 
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-sm)'
            }}
          >
            {question.text}
            {question.required && (
              <span 
                style={{ color: 'var(--color-status-danger)' }}
                aria-label="Required question"
              >
                *
              </span>
            )}
          </h2>

          {renderQuestionContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            onClick={onPrevious}
            variant="outline"
            disabled={!onPrevious}
            className="gap-2"
          >
            ← Previous
          </Button>

          {showNext && (
            <Button
              onClick={onNext}
              disabled={question.required && !isAnswered()}
              className="gap-2"
            >
              Next →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AssessmentQuestion;