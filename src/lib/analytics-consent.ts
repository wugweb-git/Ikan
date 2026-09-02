/**
 * Analytics consent (DPDP §6 — specific, revocable consent).
 *
 * The Privacy screen's "Usage Analytics" toggle wrote `privacy_settings.analytics`
 * to the user's profile and NOTHING read it. Engagement events fired regardless
 * of what the user had chosen, which makes the control decorative and the
 * consent invalid.
 *
 * The default is OFF. That is deliberate and it is the whole point: consent
 * under DPDP is opt-in, so an absent or unreadable setting must mean "no", not
 * "yes". Signed-out visitors also count as no consent.
 */
export function hasAnalyticsConsent(
  user: { privacy_settings?: { analytics?: boolean } | null; [key: string]: unknown } | null | undefined
): boolean {
  return user?.privacy_settings?.analytics === true;
}
