import React from 'react';
import { WizardStepConfig, WizardFieldConfig } from './types';
import { WizardField } from './WizardField';
import { motion } from 'motion/react';
import { cn } from '../ui/utils';

interface WizardStepProps {
  step: WizardStepConfig;
  answers: Record<string, any>;
  onAnswerChange: (fieldId: string, value: any) => void;
  onAutoAdvance?: () => void;
  errors?: Record<string, string>;
}

export function WizardStep({ step, answers, onAnswerChange, onAutoAdvance, errors = {} }: WizardStepProps) {
  const { title, description, fields, type, media } = step;

  // Helper for variable substitution
  const substitute = (text?: string) => {
    if (!text) return text;
    return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const val = answers[key.trim()];
      return val !== undefined && val !== null ? String(val) : '';
    });
  };

  const processedDescription = substitute(description);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto space-y-[var(--spacing-6)]"
    >
      {/* Media Section */}
      {media && (
        <div className="flex justify-center mb-[var(--spacing-6)]">
          {media.type === 'icon' && media.name ? (
             <div className="w-16 h-16 rounded-[var(--radius-pill)] bg-[var(--color-primary-default)]/10 flex items-center justify-center">
                <div className="text-2xl">✨</div> 
             </div>
          ) : media.url ? (
             <img src={media.url} alt={media.alt || 'Step illustration'} className="max-h-48 rounded-[var(--radius-lg)] object-contain" />
          ) : null}
        </div>
      )}

      <div className="space-y-[var(--spacing-2)] text-center md:text-left">
        {title && (
          <h2 className="text-[var(--color-text-primary)] tracking-tight">
            {substitute(title)}
          </h2>
        )}
        {processedDescription && (
          <div className="text-[var(--color-text-muted)]">
            {processedDescription}
          </div>
        )}
      </div>

      <div className="space-y-[var(--spacing-6)]">
        {fields?.map((field) => {
          // Check visibility if dependsOn is present
          if (field.dependsOn) {
             const { fieldId, value, operator = 'equals' } = field.dependsOn;
             const dependentValue = answers[fieldId];
             let isVisible = false;
             
             switch (operator) {
               case 'equals': isVisible = dependentValue === value; break;
               case 'not_equals': isVisible = dependentValue !== value; break;
               case 'contains': isVisible = Array.isArray(dependentValue) && dependentValue.includes(value); break;
               // Add more if needed
               default: isVisible = dependentValue === value;
             }
             
             if (!isVisible) return null;
          }

          // Substitute label/desc
          const processedField = {
             ...field,
             label: substitute(field.label),
             description: substitute(field.description)
          };

          return (
            <WizardField
              key={field.id}
              field={processedField}
              value={answers[field.id]}
              onChange={(val) => onAnswerChange(field.id, val)}
              onAutoAdvance={field.autoAdvance ? onAutoAdvance : undefined}
              error={errors[field.id]}
            />
          );
        })}
      </div>
    </motion.div>
  );
}