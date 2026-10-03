/**
 * Per-user browser storage cleanup. Lives in shared/api (not shared/state) so
 * `signOutLocal` in ./supabase can call it without importing React state.
 */

/**
 * Keys that deliberately outlive a sign-out. Everything else the app stores is
 * treated as belonging to the session that just ended.
 *
 * These three are device-level preferences that reveal nothing about who was
 * signed in: the two remember-my-email values (the whole point of which is to
 * survive sign-out) and the push-prompt dismissal.
 */
const SIGN_OUT_KEEP_KEYS = new Set([
  'ikan_remembered_email',
  'ikan_admin_remembered_email',
  'ikan-push-permission-dismissed',
]);

/** Prefixes covering everything the app writes for a signed-in person. */
const USER_SCOPED_PREFIXES = [
  'ikan-', 'ikan_',
  'dashboard_data_', 'corporate_program_', 'reassessment_dismissed_',
];

/**
 * Clear per-user browser storage on sign-out.
 *
 * Before 2026-09-01 sign-out removed exactly one key — the cached is_admin flag
 * — and left everything else behind: the mood journal with its free-text notes,
 * cached assessments, equip drafts and onboarding answers, read-resource
 * history, and `lastAssessmentResults` in sessionStorage. None of it is
 * namespaced by user, so on a shared device the next person to sign in saw the
 * previous person's data.
 *
 * Two things this deliberately does, both worth knowing:
 *
 * 1. It sweeps by PREFIX rather than enumerating known keys. An explicit list
 *    goes stale the moment someone adds a key and forgets this function; a
 *    sweep with a small keep-list fails safe in the other direction.
 *
 * 2. It clears the offline sync queue (`ikan-offline-sync-queue`). That queue is
 *    NOT namespaced by user, so leaving it meant pending entries written by one
 *    person would upload under whoever signed in next — their journal saved to
 *    someone else's account. Clearing costs the departing user any entry that
 *    never synced; attributing it to a stranger is worse. The real fix is to
 *    namespace the queue by user id, which is a larger change.
 *
 * Called from EVERY sign-out path, not just the sign-out button: from
 * `signOutLocal` (which all defensive sign-outs — broken refresh token, expired
 * session, failed recovery — go through) and from AuthContext's SIGNED_OUT
 * listener (which also catches a sign-out in another tab). Idempotent.
 */
export function clearUserScopedStorage(): void {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || SIGN_OUT_KEEP_KEYS.has(key)) continue;
      if (USER_SCOPED_PREFIXES.some((prefix) => key.startsWith(prefix))) doomed.push(key);
    }
    doomed.forEach((key) => { try { localStorage.removeItem(key); } catch { /* quota/private mode */ } });
  } catch { /* storage unavailable — nothing to clear */ }

  try {
    const doomed: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      if (key === 'lastAssessmentResults' || USER_SCOPED_PREFIXES.some((p) => key.startsWith(p))) {
        doomed.push(key);
      }
    }
    doomed.forEach((key) => { try { sessionStorage.removeItem(key); } catch { /* ignore */ } });
  } catch { /* ignore */ }
}
