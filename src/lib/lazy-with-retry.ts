/**
 * Wrap a dynamic import so a transient failure gets one more chance.
 *
 * **One retry, not three.** The original retried the identical import three
 * times with exponential backoff — 1s, 2s, 4s. A dynamic import resolves to a
 * bundler-fixed URL, so there is nothing to vary between attempts: if the
 * chunk hash no longer exists on the origin, every retry asks for the same
 * missing file and the only effect is seven seconds of spinner before the
 * error screen. That is the *common* case after a deploy, not the rare one.
 *
 * A genuine network blip is real too, so one short retry stays. Past that the
 * failure is structural and the recovery is a full document reload, which the
 * error boundary does — not another fetch of a URL that is gone.
 *
 * Usage:
 *   const MyScreen = lazy(() => lazyRetry(() => import('./screens/MyScreen'), 'MyScreen'));
 */

export function lazyRetry<T>(
  importFn: () => Promise<T>,
  chunkName: string,
  maxRetries = 1,
  baseDelayMs = 400,
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
  preloadChunk(() => import('../app/screens/MoodJournal'));
}