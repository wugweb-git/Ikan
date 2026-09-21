/**
 * Active time on task, for assessment runs.
 *
 * Wall-clock would have been one subtraction, and it would have been a lie the
 * moment anyone left the tab open over lunch — or resumed a saved draft the
 * next day, where the honest answer is "four minutes across two sittings" and
 * wall-clock says nineteen hours. This accumulates only foregrounded time.
 *
 * ## What counts
 *
 * The timer runs while the document is visible AND the window has focus, and
 * freezes otherwise. Switching tabs, minimising, or clicking into another
 * window stops the clock; coming back restarts it. A run resumed from a draft
 * seeds from the seconds already banked, so `duration_seconds` is the total
 * across every sitting rather than the last one.
 *
 * ## What it still cannot see
 *
 * Someone who walks away leaving the tab focused. Detecting that needs an
 * idle threshold, and any threshold is a guess about how long a person is
 * allowed to think about "I feel emotionally drained at work" before it stops
 * counting as answering. So this deliberately over-counts that case rather
 * than inventing a cutoff — and the field is named `duration_seconds`, not
 * `time_on_task`, because it is a duration and not a claim about attention.
 *
 * Absent means absent. A run that produced no timer writes no field, and the
 * UI must render nothing rather than a zero.
 */

export interface ActiveTimer {
  /** ISO timestamp of the first sitting, carried across resumes. */
  startedAt(): string;
  /** Whole seconds of foregrounded time, including any seeded from a draft. */
  elapsedSeconds(): number;
  /** Detach the listeners. Safe to call twice. */
  stop(): void;
}

interface ActiveTimerOptions {
  /** Seconds already banked by earlier sittings, from the draft. */
  seedSeconds?: number;
  /** ISO start of the first sitting, from the draft. Defaults to now. */
  seedStartedAt?: string;
  /** Injected for tests. */
  now?: () => number;
}

/**
 * Start accumulating. Call once per run, when the first question mounts.
 *
 * In a non-browser context (SSR, tests without a DOM) it degrades to a timer
 * that simply never pauses, which is correct: there are no visibility events
 * to tell it otherwise, and reporting nothing at all would lose the run.
 */
export function createActiveTimer(options: ActiveTimerOptions = {}): ActiveTimer {
  const now = options.now ?? (() => Date.now());
  const startedAt = options.seedStartedAt ?? new Date(now()).toISOString();

  let bankedMs = Math.max(0, Math.round((options.seedSeconds ?? 0) * 1000));
  let runningSince: number | null = null;
  let stopped = false;

  const isForeground = () => {
    if (typeof document === 'undefined') return true;
    if (document.visibilityState === 'hidden') return false;
    // `hasFocus` is false while another window is in front even though the
    // document is technically visible — the case a visibility listener alone
    // misses.
    return typeof document.hasFocus === 'function' ? document.hasFocus() : true;
  };

  const resume = () => {
    if (stopped || runningSince !== null) return;
    runningSince = now();
  };

  const pause = () => {
    if (runningSince === null) return;
    bankedMs += now() - runningSince;
    runningSince = null;
  };

  const sync = () => (isForeground() ? resume() : pause());

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', sync);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', sync);
    window.addEventListener('blur', sync);
    // A closed tab never fires visibilitychange in every browser; banking on
    // pagehide means an abandoned run still has an honest partial figure if it
    // is ever recovered from a draft.
    window.addEventListener('pagehide', pause);
  }

  sync();

  return {
    startedAt: () => startedAt,
    elapsedSeconds: () => {
      const live = runningSince === null ? 0 : now() - runningSince;
      return Math.round((bankedMs + live) / 1000);
    },
    stop: () => {
      if (stopped) return;
      pause();
      stopped = true;
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', sync);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', sync);
        window.removeEventListener('blur', sync);
        window.removeEventListener('pagehide', pause);
      }
    },
  };
}
