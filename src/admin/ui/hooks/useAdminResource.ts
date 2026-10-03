import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useNotifications } from '../../../shared/state/NotificationContext';

/**
 * The one way an admin screen loads and saves data.
 *
 * `useAdminResource` owns the load lifecycle every manager screen used to
 * hand-roll (`setLoading(true)` → try/catch → toast → `setLoading(false)`):
 * loading + error state, retry, a toast on failure, and an unmount / stale
 * response guard so a slow reply never writes into an unmounted screen or
 * overwrites a newer one.
 *
 * `useAdminAction` is the save/delete half: a busy flag, success + error
 * toasts, and the same unmount guard.
 */

export function errorMessageOf(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  return fallback;
}

export interface AdminResourceOptions<T> {
  /** Reload whenever any of these change (like an effect's deps). */
  deps?: readonly unknown[];
  /** Value `data` holds before the first load resolves. */
  initialData?: T;
  /** When false the loader does not run (and `loading` is false). Default true. */
  enabled?: boolean;
  /** Toast title shown when the load fails. Default "Failed to load". */
  errorTitle?: string;
  /** Message stored in `error` (and toasted). Defaults to the error's own message. */
  errorMessage?: string | ((err: unknown) => string);
  /** Set false to keep the error inline only (no toast). Default true. */
  toastOnError?: boolean;
  /** Called after every successful load. */
  onSuccess?: (data: T) => void;
  /** Called after every failed load (after state + toast). */
  onError?: (err: unknown) => void;
}

export interface AdminResource<T> {
  data: T;
  setData: Dispatch<SetStateAction<T>>;
  loading: boolean;
  error: string | null;
  /** Re-run the loader. Resolves once state has settled. */
  reload: () => Promise<void>;
}

export function useAdminResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  options: AdminResourceOptions<T> & { initialData: T },
): AdminResource<T>;
export function useAdminResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  options?: AdminResourceOptions<T>,
): AdminResource<T | undefined>;
export function useAdminResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  options: AdminResourceOptions<T> = {},
): AdminResource<T | undefined> {
  const { deps = [], initialData, enabled = true } = options;
  const { showToast } = useNotifications();

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  // Latest loader/options without making them effect deps.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const optsRef = useRef(options);
  optsRef.current = options;
  const toastRef = useRef(showToast);
  toastRef.current = showToast;

  const mounted = useRef(true);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current(ctrl.signal);
      if (!mounted.current || id !== requestId.current) return;
      setData(result);
      setLoading(false);
      optsRef.current.onSuccess?.(result);
    } catch (err) {
      if (!mounted.current || id !== requestId.current) return;
      const o = optsRef.current;
      const message = typeof o.errorMessage === 'function'
        ? o.errorMessage(err)
        : o.errorMessage ?? errorMessageOf(err, 'Failed to load data');
      console.error(`[admin] ${o.errorTitle ?? 'load failed'}:`, err);
      setError(message);
      setLoading(false);
      if (o.toastOnError !== false) toastRef.current('error', o.errorTitle ?? 'Failed to load', message);
      o.onError?.(err);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload, ...deps]);

  return { data, setData, loading, error, reload };
}

export interface AdminActionOptions<R> {
  /** Success toast: a title, or [title, message]. Omit for no success toast. */
  success?: string | [string, string] | ((result: R) => string | [string, string] | undefined);
  /** Error toast title. Default "Something went wrong". */
  errorTitle?: string;
  /** Error toast message. Defaults to the error's own message. */
  errorMessage?: string | ((err: unknown) => string);
  /** Set false to suppress the error toast (the error is still returned). */
  toastOnError?: boolean;
}

export type AdminActionResult<R> = { ok: true; result: R } | { ok: false; error: unknown };

/**
 * Save/delete runner. `run(fn, opts)` sets `busy`, awaits `fn`, toasts, and
 * never touches state after unmount. It never throws — check `ok`.
 */
export function useAdminAction() {
  const { showToast } = useNotifications();
  const toastRef = useRef(showToast);
  toastRef.current = showToast;
  const [busy, setBusy] = useState(false);
  const pending = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const run = useCallback(async <R,>(
    fn: () => Promise<R>,
    opts: AdminActionOptions<R> = {},
  ): Promise<AdminActionResult<R>> => {
    pending.current += 1;
    setBusy(true);
    try {
      const result = await fn();
      const s = typeof opts.success === 'function' ? opts.success(result) : opts.success;
      if (s) {
        const [title, message] = Array.isArray(s) ? s : [s, undefined];
        toastRef.current('success', title, message);
      }
      return { ok: true, result };
    } catch (err) {
      console.error(`[admin] ${opts.errorTitle ?? 'action failed'}:`, err);
      if (opts.toastOnError !== false) {
        const message = typeof opts.errorMessage === 'function'
          ? opts.errorMessage(err)
          : opts.errorMessage ?? errorMessageOf(err);
        toastRef.current('error', opts.errorTitle ?? 'Something went wrong', message);
      }
      return { ok: false, error: err };
    } finally {
      pending.current -= 1;
      if (mounted.current && pending.current === 0) setBusy(false);
    }
  }, []);

  return { run, busy };
}
