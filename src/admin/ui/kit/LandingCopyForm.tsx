import type React from 'react';
import { AdminFormField } from './AdminFormField';
import { Textarea } from '../textarea';
import { cn } from '../utils';

/**
 * Config-driven form for a landing page's fixed copy slots (assessment and
 * Equip programme landing pages). Plain textareas: a field is either one free
 * text value, or N values edited one-per-line.
 *
 * A config is data, so the two landing pages share one component and differ
 * only in which slots they have and where each is stored on the record.
 */

export interface LandingCopyField<T> {
  label: string;
  required?: boolean;
  help?: string;
  placeholder?: string;
  rows: number;
  className?: string;
  /** Current textarea value. */
  get: (data: T) => string;
  /** Updates to merge into the record for a new textarea value. */
  set: (value: string, data: T) => Partial<T>;
}

export interface LandingCopySection<T> {
  title: string;
  fields: LandingCopyField<T>[];
}

export interface LandingCopyConfig<T> {
  /** Optional banner above the sections. */
  intro?: { icon?: React.ReactNode; title: string; body: string };
  sections: LandingCopySection<T>[];
}

/** A field whose textarea holds one value per line (optionally capped). */
export function linesField<T>(opts: Omit<LandingCopyField<T>, 'get' | 'set'> & {
  maxLines?: number;
  get: (data: T) => string[];
  set: (lines: string[], data: T) => Partial<T>;
}): LandingCopyField<T> {
  const { maxLines, get, set, ...rest } = opts;
  return {
    ...rest,
    get: (data) => get(data).join('\n'),
    set: (value, data) => {
      const lines = value.split('\n');
      return set(maxLines ? lines.slice(0, maxLines) : lines, data);
    },
  };
}

interface LandingCopyFormProps<T> {
  config: LandingCopyConfig<T>;
  data: T;
  onChange: (updates: Partial<T>) => void;
}

export function LandingCopyForm<T>({ config, data, onChange }: LandingCopyFormProps<T>) {
  return (
    <div className="space-y-6">
      {config.intro && (
        <div className="rounded-lg p-4 flex items-start gap-3 bg-[var(--color-info-light)] border border-[var(--color-info-default)]">
          {config.intro.icon}
          <div>
            <h4 className="font-medium text-[var(--color-info-default)]">{config.intro.title}</h4>
            <p className="text-sm text-[var(--color-info-default)]">{config.intro.body}</p>
          </div>
        </div>
      )}

      {config.sections.map((section) => (
        <div key={section.title} className="space-y-6 p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-default)]">
          <h3 className="text-lg font-medium border-b pb-2">{section.title}</h3>
          {section.fields.map((field) => (
            <AdminFormField key={field.label} label={field.label} required={field.required} helpText={field.help}>
              <Textarea
                value={field.get(data)}
                onChange={(e) => onChange(field.set(e.target.value, data))}
                placeholder={field.placeholder}
                rows={field.rows}
                className={cn(field.className)}
              />
            </AdminFormField>
          ))}
        </div>
      ))}
    </div>
  );
}
