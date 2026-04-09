import { AlertCircle } from 'lucide-react';
import { cn } from './utils';

interface FormFieldErrorProps {
  error?: string;
  className?: string;
}

export function FormFieldError({ error, className }: FormFieldErrorProps) {
  if (!error) return null;

  return (
    <div 
      className={cn("flex items-center gap-1 mt-1", className)}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle 
        size={14} 
        style={{ color: 'var(--color-status-danger)' }}
      />
      <span style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-status-danger)',
        fontFamily: 'var(--font-family-base)',
        fontWeight: 'var(--font-weight-regular)'
      }}>
        {error}
      </span>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({ 
  label, 
  error, 
  required, 
  children, 
  className,
  htmlFor
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={htmlFor}
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)',
          display: 'block'
        }}
      >
        {label}
        {required && (
          <span style={{ color: 'var(--color-status-danger)', marginLeft: 'var(--spacing-1)' }}>
            *
          </span>
        )}
      </label>
      {children}
      <FormFieldError error={error} />
    </div>
  );
}