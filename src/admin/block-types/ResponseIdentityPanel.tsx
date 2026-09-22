import { cn } from '../ui/utils';
import { STATUS_COLOUR, STATUS_LABEL } from './BlockTypeRowParts';
import type { BlockUsage, UsageState } from './useBlockTypeViewerData';

const NOTE = 'text-xs text-[var(--color-text-muted)]';

/**
 * Response identity, as live counts.
 *
 * `activityConfig.key` sat on 98 live blocks with no declaration on the type
 * and no reader anywhere in the codebase. It is the author saying "this block
 * and that block are the same question" — the only expression of a repeated
 * question that exists in production content, since `repeat` is on zero blocks
 * of 407. Until it was read, every declared series was split into unrelated
 * per-day answers.
 *
 * It is on this page because a field with no reader must not be able to look
 * like a field in use.
 */
export function ResponseIdentityPanel({ usage, usageState }: {
  usage: BlockUsage;
  usageState: UsageState;
}) {
  const ri = usage?.responseIdentity;
  const num = (n: number | undefined) => (usageState !== 'ok' || n === undefined ? '—' : String(n));

  const figures: { label: string; value: string; note: string; alarm?: boolean }[] = [
    {
      label: 'Blocks declaring a key',
      value: num(ri?.blocksWithKey),
      note: `of ${usage?.totalBlocks ?? '—'} live blocks`,
    },
    {
      label: 'Distinct keys',
      value: num(ri?.distinctKeys),
      note: 'one per logical question',
    },
    {
      label: 'Keys used more than once',
      value: num(ri?.sharedKeys),
      note: ri ? `${ri.blocksInSharedKeys} blocks — a series the author declared` : 'a series the author declared',
    },
    {
      label: 'Blocks declaring repeat',
      value: num(ri?.blocksWithRepeat),
      note: 'the other way to declare a series',
      alarm: usageState === 'ok' && (ri?.blocksWithRepeat ?? 0) === 0,
    },
  ];

  return (
    <div className="p-4 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-default)]">
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <strong className="text-sm">Response identity</strong>
        <code className={NOTE}>activityConfig.key</code>
        <span className="text-xs font-medium" style={{ color: STATUS_COLOUR.live }}>
          {STATUS_LABEL.live}
        </span>
      </div>
      <p className={cn(NOTE, 'mb-3')}>
        Answers are stored under a block <em>id</em>, so the same question asked on seven days is
        seven unrelated answers. A shared <code>key</code> is the author saying those blocks are one
        question; <code>responseKeyOf()</code> is now the single definition of that identity, and the
        player threads a keyed block&apos;s earlier days through it.
      </p>
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
        {figures.map((f) => (
          <div key={f.label}>
            <div className={cn('text-lg font-semibold', f.alarm ? 'text-[var(--color-status-warning)]' : 'text-[var(--color-text-primary)]')}>
              {f.value}
            </div>
            <div className="text-xs text-[var(--color-text-primary)]">{f.label}</div>
            <div className={NOTE}>{f.note}</div>
          </div>
        ))}
      </div>
      {usageState === 'ok' && usage?.dayIntegrity && (
        <p className={cn(NOTE, 'mt-3')}>
          Day integrity, by the same feed: <strong>{usage.dayIntegrity.emptyDays}</strong> live day
          {usage.dayIntegrity.emptyDays === 1 ? '' : 's'} hold no blocks and{' '}
          <strong>{usage.dayIntegrity.daysWithDuplicateBlockIds}</strong> carry a repeated block id.
          Both are errors under <code>validateDay()</code>, which the day composer now runs —
          reporting on a draft, blocking on a published programme (<code>validationMode</code>).
        </p>
      )}
      {usageState === 'ok' && (usage?.responseIdentity?.blocksWithRepeat ?? 0) === 0 && (
        <p className="text-xs text-[var(--color-status-warning)] mt-3">
          No live block declares <code>repeat</code>, so <code>simple_repeat</code>,
          {' '}<code>column_addition</code> and <code>on_demand</code> — and{' '}
          <code>columnsByDay</code> with them — have never run on production content.
          Keys are how repetition is actually declared here.
        </p>
      )}
    </div>
  );
}
