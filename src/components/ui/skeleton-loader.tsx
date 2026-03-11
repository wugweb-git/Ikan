import { cn } from './utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'button';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  count = 1
}: SkeletonProps) {
  const baseStyles: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-muted)',
    backgroundImage: 'linear-gradient(90deg, var(--color-bg-muted) 0%, var(--color-bg-card) 50%, var(--color-bg-muted) 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    borderRadius: variant === 'circular' ? '50%' : 'var(--radius-md)',
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%')
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    text: {
      height: '1em',
      borderRadius: 'var(--radius-sm)',
      marginBottom: 'var(--spacing-2)'
    },
    circular: {
      borderRadius: '50%',
      width: width || '48px',
      height: height || '48px'
    },
    rectangular: {
      borderRadius: 'var(--radius-md)'
    },
    card: {
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-4)',
      minHeight: '200px'
    },
    button: {
      borderRadius: 'var(--radius-sm)',
      height: 'var(--ikan-component-button-height)',
      width: width || '120px'
    }
  };

  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn('skeleton-loader', className)}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      aria-busy="true"
      aria-live="polite"
    />
  ));

  return count > 1 ? <>{elements}</> : elements[0];
}

// Predefined skeleton patterns
export function SkeletonCard() {
  return (
    <div 
      className="skeleton-card"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-4)',
        border: '1px solid var(--color-border-default)'
      }}
    >
      <Skeleton variant="rectangular" height="200px" className="mb-4" />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton variant="circular" width="48px" height="48px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="80%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Add shimmer animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}