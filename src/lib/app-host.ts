/**
 * Sign-in on the marketing site goes to the iKAN 2 app.
 *
 * `ikanhealth.in` is this Vite app on Vercel. `app.ikanhealth.in` is NOT —
 * its DNS is a CNAME to `ikan2.lovable.app`, a separate Lovable-built app that
 * shares this Supabase project (it owns the `ikan2-push` edge function and the
 * `ikan2_push_subscriptions` table). Vercel also lists `app.ikanhealth.in` as
 * an alias on this project, but DNS decides, and DNS points at Lovable.
 *
 * So this is a hand-off between two apps, not a hop between hosts of one app:
 * - the destination's routes belong to iKAN 2. `/login` is verified to exist
 *   there ("Sign in — iKAN"), but it is not ours to guarantee — if iKAN 2
 *   renames it, this link breaks without any change in this repo.
 * - Supabase sessions live in per-origin localStorage, so a session held on
 *   ikanhealth.in does not carry across; the user signs in on iKAN 2.
 *
 * Only the exact marketing hosts redirect. localhost and Vercel preview URLs
 * keep in-app navigation, so development is unaffected.
 */
export const APP_ORIGIN = 'https://app.ikanhealth.in';

const MARKETING_HOSTS = new Set(['ikanhealth.in', 'www.ikanhealth.in']);

export function isMarketingHost(hostname: string): boolean {
  return MARKETING_HOSTS.has(hostname.toLowerCase());
}

/**
 * The absolute URL to send a sign-in to, or null when sign-in should stay in
 * this app instance.
 */
export function crossHostSignInUrl(hostname: string, path = '/login'): string | null {
  return isMarketingHost(hostname) ? `${APP_ORIGIN}${path}` : null;
}
