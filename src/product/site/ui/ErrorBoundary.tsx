import { Component, ErrorInfo, ReactNode } from 'react';
import { CircleAlert, RefreshCw, House } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showResetButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Suspense-related errors should not trigger the error boundary UI —
    // they are transient and React will recover via Suspense fallbacks.
    const msg = error?.message || '';
    if (
      msg.includes('suspended while responding to synchronous input') ||
      msg.includes('A component suspended')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Skip logging/handling for Suspense-related transient errors
    const msg = error?.message || '';
    if (
      msg.includes('suspended while responding to synchronous input') ||
      msg.includes('A component suspended')
    ) {
      // Reset state so children re-render normally
      this.setState({ hasError: false, error: null, errorInfo: null });
      return;
    }

    console.error('🔴 ErrorBoundary caught error:', error);
    console.error('📍 Component stack:', errorInfo.componentStack);
    
    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details
    this.logErrorDetails(error, errorInfo);
  }

  private logErrorDetails(error: Error, errorInfo: ErrorInfo) {
    try {
      console.log('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--canvas)' }}>
          <div className="text-center space-y-4 max-w-md px-4">
            <div className="flex items-center justify-center mb-4">
              <CircleAlert size={48} color="var(--error)" />
            </div>
            
            <div className="space-y-4">
              <h2 style={{ 
                color: 'var(--foreground)',
                fontSize: '20px',
                fontWeight: '500'
              }}>
                Something went wrong
              </h2>
              
              <p style={{ 
                color: 'var(--muted-foreground)',
                fontSize: '16px',
                fontWeight: '400',
                lineHeight: 'var(--line-height-md)'
              }}>
                {/* Was: "This has been logged and we'll look into it." Nothing
                    logged it — componentDidCatch writes to console.error and
                    there is no sink (no Sentry, no analytics event, no
                    security_event write). Telling a user their problem has been
                    reported when it has not is a correctness bug, not copy.
                    Restore the original sentence once a sink exists. */}
                We encountered an unexpected error. Reloading usually fixes it — if it
                keeps happening, please tell us what you were doing at the time.
              </p>
              
              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left" style={{
                  padding: '12px',
                  backgroundColor: 'var(--secondary)',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '16px'
                }}>
                  <summary style={{ 
                    color: 'var(--foreground)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Error Details (Development Only)
                  </summary>
                  <pre style={{ 
                    color: 'var(--error)',
                    fontSize: '12px',
                    fontWeight: '400',
                    marginTop: 'var(--spacing-2)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflow: 'auto'
                  }}>
                    {this.state.error.toString()}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginTop: '24px'
              }}>
                {(this.props.showResetButton !== false) && (
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      color: 'var(--foreground)',
                      fontSize: '16px',
                      fontWeight: '500',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={16} />
                    Try Again
                  </button>
                )}
                
                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--foreground)',
                    color: 'var(--background)',
                    fontSize: '16px',
                    fontWeight: '500',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <House size={16} />
                  Go to Homepage
                </button>
              </div>

              {this.state.errorCount > 1 && (
                <p style={{
                  marginTop: '16px',
                  fontSize: '14px',
                  fontWeight: '400',
                  color: 'var(--muted-foreground)'
                }}>
                  This error has occurred {this.state.errorCount} times
                </p>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p style={{ 
                color: 'var(--muted-foreground)',
                fontSize: '12px',
                fontWeight: '400',
                lineHeight: 'var(--line-height-md)'
              }}>
                <strong style={{ fontWeight: '500' }}>Crisis Resources:</strong><br />
                US: Call or text 988 for immediate help<br />
                International: Visit findahelpline.com
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}