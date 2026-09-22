import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { getScaleByKey, getContextTags } from '../ui/lib/emoji-utils';
import type { CheckinTemplate } from './checkin-template-types';

const MUTED = 'text-[var(--color-text-muted)]';
const EMPTY_NOTE = cn('rounded-[var(--radius-md)] bg-[var(--color-bg-muted)] px-5 py-4 text-center text-xs', MUTED);
const OPTION_BOX = 'rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]';

/** Simulates the user-facing check-in flow for a template. */
export function StepPreview({ template }: { template: CheckinTemplate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = template.steps;
  const step = steps[currentStep];

  if (!step) {
    return (
      <Card className="rounded-lg p-10 text-center">
        <p className={cn('text-sm', MUTED)}>No steps to preview. Add some steps first.</p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-[440px] overflow-hidden rounded-lg border border-[var(--color-border-default)]">
      {/* Preview header */}
      <div className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className={cn('text-xs font-medium', MUTED)}>Preview: {template.name}</span>
          <span className={cn('text-xs', MUTED)}>Step {currentStep + 1} of {steps.length}</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 px-5 pt-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-[3px] transition-[width,background-color] duration-300',
              i === currentStep ? 'w-[22px]' : 'w-2',
              i <= currentStep ? 'bg-[var(--color-status-warning)]' : 'bg-[var(--color-bg-muted)]',
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="px-5 pt-6 pb-7 text-center">
        <div key={step.id}>
          {step.hero_emoji && (
            <span className="mb-2 block text-[48px]">{step.hero_emoji}</span>
          )}
          <h2 className="m-0 mb-1 text-lg font-medium text-[var(--color-text-primary)]">{step.question || 'Question...'}</h2>
          {step.subtitle && <p className={cn('m-0 mb-4 text-xs', MUTED)}>{step.subtitle}</p>}

          {/* Type-specific preview */}
          {step.type === 'emoji_scale' && (() => {
            const scaleItems = getScaleByKey(step.scale_key || '');
            if (scaleItems.length === 0) {
              return (
                <div className={EMPTY_NOTE}>
                  {step.scale_key
                    ? `No data loaded for scale "${step.scale_key}". Check Admin > Scales.`
                    : 'No scale selected. Choose a scale in the step editor.'}
                </div>
              );
            }
            return (
              <div className="flex items-center justify-center gap-2">
                {scaleItems.map(opt => (
                  <div
                    key={opt.value}
                    className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-muted)] text-2xl"
                  >
                    {opt.emoji}
                  </div>
                ))}
              </div>
            );
          })()}

          {step.type === 'free_text' && (
            <div className={cn('rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-3.5 py-3 text-left text-sm', MUTED)}>
              I felt...
            </div>
          )}

          {step.type === 'single_choice' && (
            <div className="mx-auto max-w-[300px] space-y-2">
              {(step.options || []).map((opt, i) => (
                <div key={i} className={cn(OPTION_BOX, 'px-3.5 py-2.5 text-sm')}>
                  {opt}
                </div>
              ))}
            </div>
          )}

          {step.type === 'multi_select' && (() => {
            const tags: { label: string; emoji?: string }[] = step.scale_key === 'context_tags'
              ? getContextTags().slice(0, 6)
              : (step.options || []).map(o => ({ label: o, emoji: '✨' }));
            if (tags.length === 0) {
              return (
                <div className={EMPTY_NOTE}>
                  {step.scale_key === 'context_tags'
                    ? 'No context tags loaded. Check Admin > Scales.'
                    : 'No options defined. Add options in the step editor.'}
                </div>
              );
            }
            return (
              <div className="flex flex-wrap justify-center gap-2">
                {tags.map(tag => (
                  <span
                    key={tag.label}
                    className="rounded-full border-[1.5px] border-[var(--color-border-default)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-text-primary)]"
                  >
                    {tag.emoji} {tag.label}
                  </span>
                ))}
              </div>
            );
          })()}

          {step.type === 'slider' && (
            <div className="mx-auto max-w-[300px]">
              <input type="range" min={step.slider_min ?? 0} max={step.slider_max ?? 10} className="w-full" disabled />
              <div className="mt-1 flex justify-between">
                {(step.slider_labels || []).map((l, i) => (
                  <span key={i} className={cn('text-xs', MUTED)}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {step.type === 'yes_no' && (
            <div className="flex items-center justify-center gap-3">
              {['Yes', 'No'].map(opt => (
                <div key={opt} className={cn(OPTION_BOX, 'cursor-pointer px-7 py-2.5 text-sm font-medium')}>
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(s => s - 1)}
            className="rounded-[var(--radius-md)]! text-xs! text-[var(--color-text-primary)] disabled:opacity-40"
          >
            Back
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentStep(s => Math.min(s + 1, steps.length - 1))}
            disabled={currentStep === steps.length - 1}
            className="rounded-[var(--radius-md)]! bg-[var(--color-primary-default)] text-xs! text-[var(--color-primary-on)] disabled:opacity-40"
          >
            {currentStep === steps.length - 1 ? 'Done' : 'Next'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
