import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Human-readable name of the screen, shown in the retry message */
  chunkName?: string;
  /**
   * Fallback for the second attempt only. The first tap always does a full
   * document reload, because that is the only thing that recovers a chunk
   * error; a re-render or a client-side navigation cannot.
   */
  onRetry?: () => void;
}

interface State {
  hasChunkError: boolean;
  error: Error | null;
}

/**
 * Specialised error boundary that catches chunk-load / dynamic-import
 * failures and shows a friendly "Tap to retry" card instead of a
 * generic crash screen. Falls through to the parent ErrorBoundary for
 * all other errors.
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasChunkError: false, error: null };

  static getDerivedStateFromError(error: Error): Partial<State> | null {
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed');

    if (isChunkError) {
      return { hasChunkError: true, error };
    }
    // Not a chunk error — let the parent ErrorBoundary handle it
    throw error;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(
      `[ChunkErrorBoundary] Chunk load failed for "${this.props.chunkName || 'unknown'}":`,
      error.message,
      info.componentStack,
    );
  }

  /**
   * Recover by reloading the document, not by re-rendering.
   *
   * This used to call `props.onRetry`, which on the one route that had a
   * boundary was `handleNavigate('/mood-journal')` — a client-side navigation
   * against the same stale module graph that just failed. It could not
   * possibly work: React would re-run the identical `import()`, the browser
   * would ask for the identical missing hash, and the same card would come
   * straight back.
   *
   * A chunk error means the page is running JavaScript from a build that no
   * longer exists on the origin. The only thing that fixes it is fetching a
   * fresh `index.html`, which needs a real document load.
   *
   * Guarded against a reload loop with a session flag: if a reload has already
   * been attempted for this route and the chunk still will not load, the
   * failure is not staleness and looping would leave the user staring at a
   * flashing page. The second press falls back to `onRetry`.
   */
  handleRetry = () => {
    const key = `ikan-chunk-reload:${typeof window !== 'undefined' ? window.location.pathname : ''}`;
    let alreadyReloaded = false;
    try { alreadyReloaded = sessionStorage.getItem(key) === '1'; } catch { /* private mode */ }

    if (!alreadyReloaded && typeof window !== 'undefined') {
      try { sessionStorage.setItem(key, '1'); } catch { /* private mode */ }
      window.location.reload();
      return;
    }

    this.setState({ hasChunkError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasChunkError) {
      const name = this.props.chunkName || 'this page';

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 320,
            padding: 'var(--spacing-6)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-status-warning-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--spacing-4)',
            }}
          >
            <WifiOff size={28} color="var(--color-status-warning)" />
          </div>

          <h3
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-primary)',
              margin: '0 0 var(--spacing-2)',
            }}
          >
            Couldn't load {name}
          </h3>

          <p
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 400,
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-muted)',
              margin: '0 0 var(--spacing-5)',
              maxWidth: 280,
              lineHeight: 'var(--line-height-md)',
            }}
          >
            This can happen on a slow connection or after an app update.
            Tap below to try again.
          </p>

          <button
            onClick={this.handleRetry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: 'var(--spacing-3) var(--spacing-5)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
              minHeight: 'var(--ikan-component-button-height, 44px)',
              transition: 'opacity 0.15s',
            }}
            aria-label={`Retry loading ${name}`}
          >
            <RefreshCw size={16} />
            Tap to retry
          </button>

          {/* Development-only error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              style={{
                marginTop: 'var(--spacing-4)',
                padding: 'var(--spacing-3)',
                backgroundColor: 'var(--color-bg-muted)',
                borderRadius: 'var(--radius-sm)',
                maxWidth: 360,
                width: '100%',
                textAlign: 'left',
              }}
            >
              <summary
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                Error details
              </summary>
              <pre
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 400,
                  color: 'var(--color-status-danger)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  marginTop: 'var(--spacing-2)',
                }}
              >
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
