import { apiClient } from '../../../shared/api/api';
import { useAdminResource } from './useAdminResource';

export type BlockUsage = Awaited<ReturnType<typeof apiClient.getBlockUsage>>;

/**
 * Live block usage, counted over `equip:` server-side (`/blocks/usage`).
 * Shared by the Block Type Viewer and the Meta Manager.
 *
 * `usage === null` means the feed failed — which must NOT read as "everything
 * is unused", so callers render every count as "—" rather than 0 until
 * `usageState === 'ok'`.
 */
export function useBlockUsage() {
  const { data, loading } = useAdminResource<BlockUsage>(
    () => apiClient.getBlockUsage(),
    { initialData: null, toastOnError: false, errorTitle: 'Block usage unavailable' },
  );
  const usageState: 'loading' | 'ok' | 'failed' = loading ? 'loading' : data ? 'ok' : 'failed';
  return { usage: data, usageState };
}
