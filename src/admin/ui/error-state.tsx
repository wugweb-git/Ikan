import { cn } from '../../components/ui/utils';
import { AlertTriangle, RefreshCw, House, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  className?: string;
  variant?: 'error' | 'not-found' | 'network' | 'permission';
}

export function ErrorState({
  title,
  message,
  onRetry,
  onGoBack,
  onGoHome,
  className,
  variant = 'error'
}: ErrorStateProps) {
  const variants = {
    error: {
      title: title || 'Something Went Wrong',
      message: message || 'We encountered an unexpected error. Please try again.',
      icon: AlertTriangle,
      iconColor: 'var(--color-danger-default)'
    },
    'not-found': {
      title: title || 'Page Not Found',
      message: message || 'The page you\'re looking for doesn\'t exist or has been moved.',
      icon: AlertTriangle,
      iconColor: 'var(--color-warning-default)'
    },
    network: {
      title: title || 'Connection Error',
      message: message || 'Unable to connect. Please check your internet connection and try again.',
      icon: RefreshCw,
      iconColor: 'var(--color-info-default)'
    },
    permission: {
      title: title || 'Access Denied',
      message: message || 'You don\'t have permission to view this content.',
      icon: AlertTriangle,
      iconColor: 'var(--color-danger-default)'
    }
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn('flex flex-col items-center justify-center text-center p-8', className)}
      style={{
        minHeight: '400px',
        backgroundColor: 'var(--color-bg-page)'
      }}
    >
      <div
        className="mb-6 p-4 rounded-full"
        style={{
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <Icon
          className="w-12 h-12"
          style={{ color: config.iconColor }}
        />
      </div>

      <h2
        className="mb-3"
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        {config.title}
      </h2>

      <p
        className="mb-8 max-w-md"
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--line-height-md)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        {config.message}
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        {onRetry && (
          <Button
            onClick={onRetry}
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              gap: 'var(--spacing-2)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)'
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}

        {onGoBack && (
          <Button
            onClick={onGoBack}
            variant="outline"
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              gap: 'var(--spacing-2)'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        )}

        {onGoHome && (
          <Button
            onClick={onGoHome}
            variant="outline"
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              gap: 'var(--spacing-2)'
            }}
          >
            <House className="w-4 h-4" />
            Home
          </Button>
        )}
      </div>
    </div>
  );
}

// Inline error component for smaller contexts
interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ message, onRetry, className }: InlineErrorProps) {
  return (
    <div
      className={cn('flex items-center justify-between p-4 rounded-lg', className)}
      style={{
        backgroundColor: 'var(--color-danger-bg)',
        border: '1px solid var(--color-danger-default)'
      }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          className="w-5 h-5 flex-shrink-0"
          style={{ color: 'var(--color-danger-default)' }}
        />
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-danger-default)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          {message}
        </p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          style={{
            color: 'var(--color-danger-default)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}