/**
 * The real sink for `warnFallback`, wired once from the app entry.
 *
 * Kept out of `block-model.ts` deliberately: that file is the block model
 * and must stay dependency-free so it can be unit-tested under `node --test`
 * with no app config, no bundler and no network.
 *
 * Best-effort by construction — fire-and-forget, failures swallowed, `keepalive`
 * so a report survives the navigation that often follows a bad render.
 * `warnFallback` already dedupes by key, so a render loop cannot become a
 * request loop.
 */
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { setFallbackReporter } from './block-model';

export function installBlocksFallbackReporter(): void {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return;
  setFallbackReporter(({ site, detail, term }) => {
    void fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/blocks/fallback`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ site, detail, term, url: window.location?.href }),
        keepalive: true,
      },
    ).catch(() => { /* a diagnostic must not surface as an error */ });
  });
}
