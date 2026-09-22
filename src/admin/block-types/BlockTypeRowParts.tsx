/**
 * Row-level pieces shared by the Block Type Viewer's tabs: the term-status
 * model, the row icon, the live-count / renders-as / status tail, and the
 * `requires` line.
 */
import { getIconComponent, iconResolves } from '../catalog/catalog-icons';
import { ACTIVITY_SPECS, type ActivityName } from '../block-builder/model/vocabulary';
import type { UsageState } from './useBlockTypeViewerData';

/*
  `INTERACTION_ICON_MAP` was here — thirteen interaction → lucide-component
  entries, hardcoded. Deleted 2026-09-08: all 60 catalog rows already carry an
  `icon`, so this was a second copy of catalog data kept by hand, and the same
  pattern this module has now removed three times (the 12-entry subtype list,
  the 7-entry block-type array, the legacy mapping table). Worse, it covered
  only interactions — block types and activities rendered no icon at all while
  every one of their rows declared one.

  Icons now come from the row, resolved through the one registry in
  `src/lib/catalog-icons.ts`. A name the registry does not know renders a
  visible hole, not a silent `Tag`.
*/

/** One row's icon, or a marked gap. Never a plausible-looking substitute. */
export function RowIcon({ icon }: { icon?: string }) {
  if (iconResolves(icon)) {
    const Ic = getIconComponent(icon);
    return <Ic className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />;
  }
  return (
    <span
      title={icon ? `Catalog icon "${icon}" is not in the registry` : 'This catalog row declares no icon'}
      className="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-[4px] text-[10px] leading-none border border-dashed border-[var(--color-status-warning)] text-[var(--color-status-warning)]"
    >
      ?
    </span>
  );
}

/*
  A "Legacy → interaction" table lived here, then a "Retired terms" record after
  the aliases were deleted. Both are gone (2026-09-09).

  This page states what the vocabulary IS. A list of what it used to be belongs
  in the history, not on the reference: the Activities tab was showing 29 live
  terms and 39 dead ones, and the tile beside it read "29 · 39 retired", which is
  a page mostly about its own past. Nothing in the store carries a retired term —
  840 of 840 blocks resolve to one of the twenty-nine.
*/

export type TermStatus = 'live' | 'wired-unused' | 'declared-unread' | 'orphan';

/**
 * `null` means UNKNOWN, and unknown is not unused.
 *
 * This returned `(opts.count ?? 0) > 0 ? 'live' : 'wired-unused'`, so with the
 * usage feed down every row printed "Wired, unused" — a confident claim of
 * non-use derived from a count the page had just declared it did not have. The
 * banner one column to the left says exactly that ("they are not zero; this
 * page just cannot tell you"), which is what makes it the worse error: the page
 * stated the caveat and then ignored it.
 *
 * Note which branches survive a dead feed. `orphan` and `declared-unread` are
 * facts about CODE — is the term declared, does anything read it — and are
 * knowable with no live data at all, so they must keep rendering. Only the
 * live-vs-unused split needs a count, and only that split goes unknown.
 */
export const statusOf = (opts: { readByCode: boolean; declared: boolean; count: number | null }): TermStatus | null => {
  if (!opts.declared) return 'orphan';           // in the catalog, unknown to code
  if (!opts.readByCode) return 'declared-unread'; // declared, but nothing reads it
  if (opts.count === null) return null;           // the feed is down — say so
  return opts.count > 0 ? 'live' : 'wired-unused';
};
export const STATUS_LABEL: Record<TermStatus, string> = {
  'live':            'Live',
  'wired-unused':    'Wired, unused',
  'declared-unread': 'Declared, unread',
  'orphan':          'Orphan',
};
export const STATUS_COLOUR: Record<TermStatus, string> = {
  'live':            'var(--color-status-success)',
  'wired-unused':    'var(--color-text-muted)',
  'declared-unread': 'var(--color-status-warning)',
  'orphan':          'var(--color-status-danger)',
};

/** The shared four-column row tail: live count, what it draws, status. */
export function RowMeta({ count, rendersAs, status }: {
  count: number | null; rendersAs: string; status: TermStatus | null;
}) {
  return (
    <div className="flex items-start gap-3 flex-wrap mt-2 text-xs">
      <span className="text-[var(--color-text-muted)]">
        live:{' '}
        <strong className={count && count > 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}>
          {count === null ? '—' : count}
        </strong>
      </span>
      <span className="text-[var(--color-text-muted)] flex-[1_1_240px]">{rendersAs}</span>
      <span
        title={status ? undefined : 'The usage feed is unavailable, so whether anything uses this is unknown — not zero'}
        className="font-medium"
        style={{ color: status ? STATUS_COLOUR[status] : 'var(--color-text-muted)' }}
      >
        {status ? STATUS_LABEL[status] : '—'}
      </span>
    </div>
  );
}

/**
 * What this interaction needs, and how much live content is short of it.
 *
 * `requires` is stated once, in `INTERACTION_REQUIREMENTS`. Printing it here is
 * how the reader learns that `select-one` wants a `scale_ref` — and that not one
 * live block has one, because every scale in this database is inlined per block.
 * A requirement nothing satisfies is a real finding, not a rendering bug.
 */
export function RequirementLine({ activity, gap, usageState }: {
  activity: ActivityName;
  gap?: { blocks: number; fields: Record<string, number> };
  usageState: UsageState;
}) {
  const spec = ACTIVITY_SPECS[activity];
  if (!spec) return null;
  const requires = spec.requires.length ? spec.requires.join(', ') : 'nothing';
  const fields = Object.entries(gap?.fields ?? {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className="text-xs text-[var(--color-text-muted)] mt-1">
      <span>requires: <code>{requires}</code> · produces: <code>{spec.produces || 'no response'}</code></span>
      {usageState === 'ok' && (
        fields.length ? (
          <span className="text-[var(--color-status-warning)]">
            {' '}· {gap?.blocks} live block{gap?.blocks === 1 ? '' : 's'} incomplete:{' '}
            {fields.map(([f, n]) => `${f} (${n})`).join(', ')}
          </span>
        ) : (
          <span className="text-[var(--color-status-success)]"> · live content complete</span>
        )
      )}
    </div>
  );
}
