import { WizardStepConfig, WizardLayout, WizardMode } from './types';
import { WizardField } from './WizardField';
import { motion } from 'motion/react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { ArrowRight, Check } from 'lucide-react';

interface WizardStepProps {
  step: WizardStepConfig;
  answers: Record<string, any>;
  context?: Record<string, any>; // NEW: Added context prop
  mode?: WizardMode; // NEW: Pass mode for defaults
  onAnswerChange: (fieldId: string, value: any) => void;
  onAutoAdvance?: () => void;
  onNext?: () => void;
  errors?: Record<string, string>;
  layout?: WizardLayout;
}

export function WizardStep({ step, answers, context = {}, mode, onAnswerChange, onAutoAdvance, onNext, errors = {}, layout = 'standard' }: WizardStepProps) {
  const { title, description, fields, type, media, nextLabel } = step;

  // Helper for variable substitution
  const substitute = (text?: string) => {
    if (!text) return text;
    return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const trimmedKey = key.trim();
      // Try finding value in answers first, then in context
      const val = answers[trimmedKey] ?? context[trimmedKey];
      return val !== undefined && val !== null ? String(val) : '';
    });
  };

  const processedDescription = substitute(description);
  const processedTitle = substitute(title);

  // Specialized layouts for Intro/Outro in Centered Mode
  if (layout === 'centered' && (type === 'intro' || type === 'outro')) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-center space-y-[var(--spacing-6)] max-w-xl mx-auto"
        >
          {/* Icon/Media */}
          <motion.div
            className={cn(
                "inline-flex items-center justify-center w-24 h-24 rounded-full mb-[var(--spacing-4)]",
                type === 'outro' ? "bg-[var(--color-status-success-light)]" : "bg-[var(--color-primary-default)]/10"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {type === 'outro' ? (
                <Check size={48} className="text-[var(--color-status-success)]" />
            ) : (
                <div className="text-5xl">✨</div>
            )}
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-medium text-[var(--color-text-primary)] tracking-tight">
            {processedTitle}
          </h1>

          {processedDescription && (
            <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
              {processedDescription}
            </p>
          )}

          {onNext && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Button
                    onClick={onNext}
                    size="lg"
                    className="mt-[var(--spacing-8)] h-14 px-8 text-lg rounded-[var(--radius-lg)] bg-[var(--color-primary-default)] text-white hover:bg-[var(--color-primary-default)]/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                    {nextLabel || (type === 'intro' ? "Let's Start" : "Complete")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </motion.div>
          )}
        </motion.div>
      );
  }

  // Standard or Input Layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn(
          "w-full space-y-[var(--spacing-6)]",
          layout === 'centered' ? "max-w-xl mx-auto" : "max-w-lg mx-auto"
      )}
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

      <div className={cn(
          "space-y-[var(--spacing-2)]",
          layout === 'centered' ? "text-center mb-[var(--spacing-8)]" : "text-center md:text-left"
      )}>
        {title && (
          <h2 className={cn(
              "text-[var(--color-text-primary)] tracking-tight",
              layout === 'centered' ? "text-3xl font-medium" : "text-2xl font-medium"
          )}>
            {processedTitle}
          </h2>
        )}
        {processedDescription && (
          <div className={cn(
              "text-[var(--color-text-muted)]",
              layout === 'centered' ? "text-lg" : "text-base"
          )}>
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
              wizardMode={mode}
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