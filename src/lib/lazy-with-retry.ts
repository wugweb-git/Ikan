/**
 * Utility to wrap dynamic imports with retry logic.
 * If a chunk fails to load (e.g. due to a network hiccup or a deploy
 * that invalidated old hashes), this retries up to `maxRetries` times
 * with an exponential back-off before giving up.
 *
 * Usage:
 *   const MyScreen = lazy(() => lazyRetry(() => import('./screens/MyScreen'), 'MyScreen'));
 */

export function lazyRetry<T>(
  importFn: () => Promise<T>,
  chunkName: string,
  maxRetries = 3,
  baseDelayMs = 1000,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const attempt = (retryCount: number) => {
      importFn()
        .then(resolve)
        .catch((error: Error) => {
          const isChunkError =
            error?.name === 'ChunkLoadError' ||
            error?.message?.includes('Loading chunk') ||
            error?.message?.includes('Failed to fetch dynamically imported module') ||
            error?.message?.includes('Importing a module script failed');

          if (isChunkError && retryCount < maxRetries) {
            const delay = baseDelayMs * Math.pow(2, retryCount);
            console.warn(
              `[lazyRetry] Chunk "${chunkName}" failed to load (attempt ${retryCount + 1}/${maxRetries}). Retrying in ${delay}ms...`,
              error.message,
            );
            setTimeout(() => attempt(retryCount + 1), delay);
          } else {
            console.error(
              `[lazyRetry] Chunk "${chunkName}" failed after ${retryCount + 1} attempt(s).`,
              error,
            );
            reject(error);
          }
        });
    };

    attempt(0);
  });
}

/**
 * Preload a dynamic chunk without rendering it. This warms the
 * browser cache so that the actual lazy() call resolves instantly.
 *
 * Call this on hover / touchstart of the navigation element that
 * leads to the lazy-loaded screen.
 *
 * Usage:
 *   preloadChunk(() => import('./screens/MoodJournal'));
 */
export function preloadChunk(importFn: () => Promise<unknown>): void {
  importFn().catch(() => {
    // Silently ignore — the real lazy() call will handle errors
  });
}

// ── Screen-specific preloaders ──────────────────────────────────
// These are stable references that can be imported without circular deps.

let _moodJournalPreloaded = false;

export function preloadMoodJournal(): void {
  if (_moodJournalPreloaded) return;
  _moodJournalPreloaded = true;
  preloadChunk(() => import('../components/screens/MoodJournal'));
}