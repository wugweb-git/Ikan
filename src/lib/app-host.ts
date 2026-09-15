/**
 * The marketing site and the signed-in app are the same Vercel deployment
 * served on two hosts: `ikanhealth.in` (marketing) and `app.ikanhealth.in`
 * (the app). Sign-in belongs on the app host.
 *
 * This matters beyond tidiness: Supabase keeps the session in localStorage,
 * which is per-origin. A user who signs in on the marketing host holds a
 * session that `app.ikanhealth.in` cannot see, so they would appear signed
 * out the moment they reach the app. Sending every sign-in to the app host
 * keeps the session where the app reads it.
 *
 * Only the exact marketing hosts redirect. localhost, Vercel preview URLs and
 * the app host itself keep in-app navigation, so development is unaffected.
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
