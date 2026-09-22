import { useState } from 'react';
import { Smartphone, Settings2 } from 'lucide-react';
import { normalizeSubtype } from '../block-builder/model/block-model';
import { ACTIVITY_HINTS } from '../block-builder/model/vocabulary';
import { cn } from '../ui/utils';
import { BlockPreview } from './BlockPreview';
import { EditorPreview, type BlockTypeInfo } from './EditorPreview';

const NOTE = 'text-xs text-[var(--color-text-muted)]';

/**
 * A block type draws whatever its permitted ACTIVITIES draw.
 *
 * `exercise` draws nine different widgets depending on its activity, and each
 * of the eleven holder types permits a handful. Showing one mock for either
 * would be a lie of exactly the kind this page exists to stop — it is why the
 * `exercise` row once claimed all 187 of its blocks draw a textarea.
 *
 * Nothing new is drawn. Each permitted activity is resolved through the real
 * resolver, the results are grouped, and one existing `BlockPreview` is shown
 * per DISTINCT drawing, captioned with the activities that produce it.
 *
 * Grouped by the drawing, not by the interaction: under §26 `mcq`,
 * `multi-select` and `boolean` all carry `choose` and draw three different
 * things, so grouping by interaction would show one preview for three.
 */
export function CompositePreview({ activities, note }: {
  activities: string[];
  note?: string;
}) {
  const groups = new Map<string, string[]>();
  for (const a of activities) {
    const canonical = normalizeSubtype(a) ?? a;
    const hint = ACTIVITY_HINTS[canonical] ?? '(no preview)';
    if (!groups.has(hint)) groups.set(hint, []);
    groups.get(hint)!.push(canonical);
  }

  if (!groups.size) {
    return (
      <div className={cn('mt-3 p-3 rounded-lg bg-[var(--color-bg-muted)]', NOTE)}>
        Permits no activities, so there is nothing for it to draw.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {note && <p className={NOTE}>{note}</p>}
      <p className={NOTE}>
        {activities.length} activit{activities.length === 1 ? 'y' : 'ies'} ·{' '}
        {groups.size} distinct drawing{groups.size === 1 ? '' : 's'}
      </p>
      {[...groups.entries()].map(([hint, produced]) => (
        <div key={hint}>
          <div className="flex items-baseline gap-2 flex-wrap text-xs mb-1">
            <code className="text-[var(--color-primary-default)]">{produced[0]}</code>
            {produced.length > 1 && (
              <span className="text-[var(--color-text-muted)]">← also {produced.slice(1).join(' · ')}</span>
            )}
          </div>
          <BlockPreview activity={produced[0]} />
        </div>
      ))}
    </div>
  );
}

// ── Detail Panel ────────────────────────────────────────────────
/**
 * The preview panel a row opens.
 *
 * This was `BlockDetailPanel`, a sticky right-hand pane of a master/detail
 * layout that no longer exists — so nothing rendered it, and with it went the
 * User/Editor toggle and every mock behind it. What the page could say about
 * appearance was one line of prose per row.
 *
 * Restored as a per-row panel rather than a sidebar. Its duplicate info card is
 * gone: the row above already carries the label, the code, the description and
 * the live count, and repeating them was what made this a whole second column.
 *
 * The toggle appears only where both halves exist. `BlockPreview` is keyed on
 * INTERACTION — what the player draws — and `EditorPreview` on BLOCK TYPE —
 * what the author fills in. An interaction row has no block type, so it shows
 * the user-facing half alone rather than an empty editor.
 */
export function PreviewPanel({ activity, blockType }: {
  activity: string | undefined;
  blockType?: BlockTypeInfo;
}) {
  const [previewMode, setPreviewMode] = useState<'user' | 'editor'>('user');
  const mode = blockType ? previewMode : 'user';

  const tabClass = (active: boolean) => cn(
    'flex items-center gap-1 px-2.5 py-1 transition-colors text-xs font-medium border-none cursor-pointer',
    active
      ? 'bg-[var(--color-primary-default)] text-[var(--color-primary-on)]'
      : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)]',
  );

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className={NOTE}>
          {mode === 'user' ? 'User-facing preview' : 'Editor / wizard preview'}
          {' · '}
          <code>{activity ?? '—'}</code>
        </span>
        {blockType && (
          <div className="flex rounded-lg overflow-hidden border border-[var(--color-border-default)]">
            <button onClick={() => setPreviewMode('user')} className={tabClass(previewMode === 'user')}>
              <Smartphone size={12} /> User
            </button>
            <button
              onClick={() => setPreviewMode('editor')}
              className={cn(tabClass(previewMode === 'editor'), 'border-l border-solid border-[var(--color-border-default)]')}
            >
              <Settings2 size={12} /> Editor
            </button>
          </div>
        )}
      </div>
      {mode === 'user' || !blockType
        ? <BlockPreview activity={activity} />
        : <EditorPreview block={blockType} />}
    </div>
  );
}
