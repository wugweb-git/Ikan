import { useState, useEffect, useCallback, useRef } from 'react';
import { Wizard } from './Wizard';
import { WizardConfig, WizardStepConfig, WizardFieldConfig } from './types';

interface TypeformStep {
  id: string;
  type: 'intro' | 'question' | 'outro';
  title?: string;
  description?: string;
  question?: {
    id: string;
    text: string;
    type: string;
    options?: any[];
    placeholder?: string;
    required?: boolean;
    scaleMin?: number;
    scaleMax?: number;
    scaleLabels?: { min: string; max: string };
  };
}

interface TypeformWizardProps {
  steps: TypeformStep[];
  onComplete?: (results: any) => void;
  onExit?: () => void;
  className?: string;
}

export function TypeformWizard({ steps, onComplete, onExit, className }: TypeformWizardProps) {
  // Map simple Typeform steps to robust Wizard configuration
  const wizardConfig: WizardConfig = {
    id: 'typeform-wizard',
    title: 'Onboarding',
    mode: 'equip_onboarding',
    layout: 'centered',
    showProgress: true,
    progressType: 'bar',
    steps: steps.map(step => {
      // Base config
      const config: WizardStepConfig = {
        id: step.id,
        type: step.type === 'question' ? 'input' : (step.type as any),
        title: step.title,
        description: step.description,
        fields: [],
        rules: {
            // Default rules
            required: step.question?.required !== false
        }
      };

      // Map question to field if present
      if (step.type === 'question' && step.question) {
        // Map simplified type to FieldType
        let fieldType: any = 'text';
        if (step.question.type === 'single_select') fieldType = 'single_select';
        if (step.question.type === 'multi_select') fieldType = 'multi_select';
        if (step.question.type === 'scale') fieldType = 'scale';
        if (step.question.type === 'long_text') fieldType = 'long_text';

        const field: WizardFieldConfig = {
          id: step.question.id,
          type: fieldType,
          label: step.question.text, // Question text becomes field label
          placeholder: step.question.placeholder,
          options: step.question.options,
          validation: {
            required: step.question.required !== false,
            min: step.question.scaleMin,
            max: step.question.scaleMax
          },
          // Auto-advance for single choice and scale
          autoAdvance: fieldType === 'single_select' || fieldType === 'scale'
        };
        
        config.fields = [field];
      }

      return config;
    })
  };

  return (
    <Wizard 
      config={wizardConfig}
      onComplete={onComplete}
      onExit={onExit}
      className={className}
    />
  );
}