/**
 * First-run / onboarding gate — a per-device flag pair kept in localStorage.
 *
 * `onboarding_seen` gates the splash + onboarding flow for a signed-out first
 * visitor. `first_run_done` gates the post-auth "getting started" screen once,
 * after a user's first sign-in. Both are best-effort: a blocked or cleared
 * store simply means the visitor sees the flow again, which is safe.
 */
const ONBOARDING_SEEN = 'ikan_onboarding_seen';
const FIRST_RUN_DONE = 'ikan_first_run_done';

function read(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}
function write(key: string) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    /* private mode / blocked store — the flow just repeats, which is fine */
  }
}

export const hasSeenOnboarding = () => read(ONBOARDING_SEEN);
export const markOnboardingSeen = () => write(ONBOARDING_SEEN);
export const hasCompletedFirstRun = () => read(FIRST_RUN_DONE);
export const markFirstRunComplete = () => write(FIRST_RUN_DONE);
