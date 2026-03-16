import { cn } from './utils';
import { CircleCheck, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
  variant?: 'dots' | 'line' | 'numbered';
}

export function ProgressIndicator({ 
  steps, 
  currentStep, 
  className,
  variant = 'line'
}: ProgressIndicatorProps) {
  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        {steps.map((_, index) => (
          <div
            key={index}
            className="transition-all duration-300"
            style={{
              width: index === currentStep ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: index <= currentStep 
                ? 'var(--color-primary-default)' 
                : 'var(--color-bg-muted)'
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'numbered') {
    return (
      <div className={cn('flex items-center', className)}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className="flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: index <= currentStep 
                    ? 'var(--color-primary-default)' 
                    : 'var(--color-bg-muted)',
                  color: index <= currentStep 
                    ? 'var(--color-primary-on)' 
                    : 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: 'var(--text-base)'
                }}
              >
                {index < currentStep ? (
                  <CircleCheck className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <p
                className="mt-2 text-center"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: index === currentStep 
                    ? 'var(--color-primary-default)' 
                    : 'var(--color-text-muted)',
                  fontWeight: index === currentStep 
                    ? 'var(--font-weight-medium)' 
                    : 'var(--font-weight-regular)',
                  maxWidth: '100px'
                }}
              >
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-1 mx-4"
                style={{
                  backgroundColor: index < currentStep 
                    ? 'var(--color-primary-default)' 
                    : 'var(--color-bg-muted)',
                  transition: 'background-color 0.3s ease'
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Default line variant
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <p
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          {steps[currentStep]}
        </p>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          {currentStep + 1} of {steps.length}
        </p>
      </div>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: '8px',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            backgroundColor: 'var(--color-primary-default)'
          }}
        />
      </div>
    </div>
  );
}

// Circular progress variant
interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  size = 100,
  strokeWidth = 8,
  label,
  className
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-bg-muted)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-primary-default)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          {Math.round(value)}%
        </span>
        {label && (
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}