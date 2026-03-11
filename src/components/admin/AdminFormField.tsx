import type React from 'react';
import { Label } from '../ui/label';
import { FormFieldError } from '../ui/form-field-error';
import { Info, AlertCircle } from 'lucide-react';

interface AdminFormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  warning?: string;
  children: React.ReactNode;
  layout?: 'vertical' | 'horizontal';
}

export function AdminFormField({
  label,
  description,
  error,
  required,
  helpText,
  warning,
  children,
  layout = 'vertical'
}: AdminFormFieldProps) {
  if (layout === 'horizontal') {
    return (
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <Label>
            {label}
            {required && <span style={{ color: 'var(--color-danger-default)' }}> *</span>}
          </Label>
          {description && (
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                marginTop: 'var(--spacing-1)'
              }}
            >
              {description}
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          {children}
          {error && <FormFieldError error={error} />}
          {warning && !error && (
            <div
              className="flex items-start gap-2 mt-2 p-2 rounded"
              style={{ backgroundColor: 'var(--color-warning-subtle)' }}
            >
              <AlertCircle
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-warning-default)' }}
              />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {warning}
              </span>
            </div>
          )}
          {helpText && !error && !warning && (
            <div className="flex items-start gap-2 mt-2">
              <Info
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {helpText}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Label className="mb-2 block">
        {label}
        {required && <span style={{ color: 'var(--color-danger-default)' }}> *</span>}
      </Label>
      {description && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--spacing-2)'
          }}
        >
          {description}
        </p>
      )}
      {children}
      {error && <FormFieldError error={error} />}
      {warning && !error && (
        <div
          className="flex items-start gap-2 mt-2 p-2 rounded"
          style={{ backgroundColor: 'var(--color-warning-subtle)' }}
        >
          <AlertCircle
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--color-warning-default)' }}
          />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {warning}
          </span>
        </div>
      )}
      {helpText && !error && !warning && (
        <div className="flex items-start gap-2 mt-2">
          <Info
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {helpText}
          </span>
        </div>
      )}
    </div>
  );
}