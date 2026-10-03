/**
 * HTTP status carried by an apiClient error. apiClient attaches `status`; older
 * errors only have it in the message ("API Error: 422 ...").
 */
export function apiErrorStatus(error: unknown): number | null {
  const e = error as { status?: unknown; message?: unknown } | null;
  if (e && typeof e.status === 'number') return e.status;
  const match = /API Error: (\d{3})/.exec(typeof e?.message === 'string' ? e.message : '');
  return match ? Number(match[1]) : null;
}

/**
 * True when the server definitively rejected the request (a 4xx other than
 * 408 Request Timeout / 429 Too Many Requests). Replaying it from the offline
 * queue would fail the same way every time, so it must be surfaced to the
 * user rather than queued.
 */
export function isPermanentClientError(error: unknown): boolean {
  const status = apiErrorStatus(error);
  return status !== null && status >= 400 && status < 500 && status !== 408 && status !== 429;
}
