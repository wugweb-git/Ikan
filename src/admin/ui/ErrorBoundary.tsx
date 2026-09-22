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
      console.error('Error details:', {
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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
          <div className="text-center space-y-4 max-w-md px-4">
            <div className="flex items-center justify-center mb-4">
              <CircleAlert size={48} color="var(--color-status-danger)" />
            </div>
            
            <div className="space-y-4">
              <h2 style={{ 
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-weight-medium)'
              }}>
                Something went wrong
              </h2>
              
              <p style={{ 
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-regular)',
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
                  backgroundColor: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '16px'
                }}>
                  <summary style={{ 
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    cursor: 'pointer'
                  }}>
                    Error Details (Development Only)
                  </summary>
                  <pre style={{ 
                    color: 'var(--color-status-danger)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-regular)',
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
                      backgroundColor: 'var(--color-accent-default)',
                      color: 'var(--color-accent-on)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-medium)',
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
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-primary-on)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
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
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-text-muted)'
                }}>
                  This error has occurred {this.state.errorCount} times
                </p>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
              <p style={{ 
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-regular)',
                lineHeight: 'var(--line-height-md)'
              }}>
                <strong style={{ fontWeight: 'var(--font-weight-medium)' }}>Crisis Resources:</strong><br />
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