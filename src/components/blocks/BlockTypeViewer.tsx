import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen, PenTool, Layers, Calendar, Smartphone, Settings2, Zap,
} from 'lucide-react';
import { AdminHeader } from '../admin/AdminHeader';
import { apiClient } from '../../lib/api-client';
import { getIconComponent, iconResolves } from '../../lib/catalog-icons';
import { AUTHORABLE_SUBTYPES } from '../../lib/blocks/block-model';
import { INTERACTION_REQUIREMENTS, missingRequirements, blockOf } from '../../lib/blocks/content-hierarchy';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../admin/AdminStatusBadge';
import {
  INTERACTION_META,
  LEAF_BLOCK_TYPES,
  resolveInteraction,
  EXERCISE_SUBTYPES as CANONICAL_SUBTYPES,
  SUBTYPE_ALIASES,
  normalizeSubtype,
  type InteractionType,
  type Activity,
} from '../../lib/blocks/block-model';
import { DAY_TYPE_PRESETS } from '../../lib/blocks/block-type-rules';
import { useMetadata, isContainerRow } from '../../hooks/useMetadata';
import { hasContentField, contentLabelFor, contentPlaceholderFor } from '../../lib/blocks/block-fields';
// Template building blocks shared with actual editors (BlockEditor, CheckinTemplateBuilder)
import {
  blockFormStyles,
  BlockHeaderBar,
  FieldLabel,
  MockInput,
  MockTextarea,
  MockSelect,
  MockCheckbox,
  FieldGrid,
  SectionDivider,
  MockMediaUpload,
  IndentedSection,
} from '../admin/AdminBlockFormTemplate';

// ── Block type definitions ──────────────────────────────────────
// These are structural — they drive editor UI behavior and rendering logic.
// This viewer provides admin visibility into what's available.

interface BlockTypeInfo {
  value: string;
  label: string;
  icon: any;
  description: string;
  category: 'checkin' | 'equip';
  fields: string[];
  previewHint: string;
}

interface DayConfigPresetInfo {
  value: string;
  label: string;
  description: string;
  autoConfig: string;
  stepGroupRules: string;
  playerLayout: string;
  playerProgress: string;
  warnings: string[];
  errors?: string[];
}



interface AdminBlockTypeViewerProps {
  onBack?: () => void;
}

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
function RowIcon({ icon }: { icon?: string }) {
  if (iconResolves(icon)) {
    const Ic = getIconComponent(icon);
    return <Ic className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} aria-hidden />;
  }
  return (
    <span
      title={icon ? `Catalog icon "${icon}" is not in the registry` : 'This catalog row declares no icon'}
      className="shrink-0 inline-flex items-center justify-center"
      style={{
        width: 16, height: 16, borderRadius: 4, fontSize: 10, lineHeight: 1,
        border: '1px dashed var(--color-status-warning)',
        color: 'var(--color-status-warning)',
      }}
    >
      ?
    </span>
  );
}

// ── Legacy mapping table ────────────────────────────────────────
// Derived by CALLING resolveInteraction, not transcribed from it. The previous
// version was a hand-written table that had gone stale: it listed
// `comparison_matrix`, `rating_scale` and `clinical_instrument` as the terms and
// had no row for `matrix`, `row_list`, `text_list`, `scale` or `number` — the
// five that were actually in live content.
const probe = (type: string, subtype?: string): InteractionType =>
  resolveInteraction({
    id: 'probe', title: '', type: type as Activity['type'], content: '',
    duration: 0, required: false, order: 0,
    ...(subtype ? { activityConfig: { subtype: subtype as never } } : {}),
  } as Activity);

const LEGACY_MAPPING: { legacy: string; interaction: InteractionType; note: string }[] = [
  ...['lesson', 'conclude', 'journal', 'reflection', 'checklist', 'sleep-diary'].map((t) => ({
    legacy: `type: ${t}`,
    interaction: probe(t),
    note: t === 'journal' || t === 'reflection' ? 'Unless it has options → select-one' : 'Direct map',
  })),
  ...CANONICAL_SUBTYPES.map((st) => ({
    legacy: `subtype: ${st}`,
    interaction: probe('exercise', st),
    note: 'Canonical',
  })),
  ...Object.entries(SUBTYPE_ALIASES).map(([alias, canonical]) => ({
    legacy: `subtype: ${alias}`,
    interaction: probe('exercise', alias),
    note: `Alias → ${canonical}`,
  })),
];

/**
 * The four states this page exists to separate.
 *
 * A reference count alone does not tell you whether a thing is displayed,
 * promised or specified — three things in this module were deleted as unused
 * and turned out to be load-bearing. So "nothing reads it" is a status shown
 * on the page, not a reason to remove something.
 *
 * Module scope, not component scope: the status vocabulary is a fact about the
 * page, and `ResponseIdentityPanel` needs it too.
 */
type TermStatus = 'live' | 'wired-unused' | 'declared-unread' | 'orphan';

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
const statusOf = (opts: { readByCode: boolean; declared: boolean; count: number | null }): TermStatus | null => {
  if (!opts.declared) return 'orphan';           // in the catalog, unknown to code
  if (!opts.readByCode) return 'declared-unread'; // declared, but nothing reads it
  if (opts.count === null) return null;           // the feed is down — say so
  return opts.count > 0 ? 'live' : 'wired-unused';
};
const STATUS_LABEL: Record<TermStatus, string> = {
  'live':            'Live',
  'wired-unused':    'Wired, unused',
  'declared-unread': 'Declared, unread',
  'orphan':          'Orphan',
};
const STATUS_COLOUR: Record<TermStatus, string> = {
  'live':            'var(--color-status-success)',
  'wired-unused':    'var(--color-text-muted)',
  'declared-unread': 'var(--color-status-warning)',
  'orphan':          'var(--color-status-danger)',
};

/**
 * What this interaction needs, and how much live content is short of it.
 *
 * `requires` is stated once, in `INTERACTION_REQUIREMENTS`. Printing it here is
 * how the reader learns that `select-one` wants a `scale_ref` — and that not one
 * live block has one, because every scale in this database is inlined per block.
 * A requirement nothing satisfies is a real finding, not a rendering bug.
 */
function RequirementLine({ interaction, gap, usageState }: {
  interaction: InteractionType;
  gap?: { blocks: number; fields: Record<string, number> };
  usageState: 'loading' | 'ok' | 'failed';
}) {
  const spec = INTERACTION_REQUIREMENTS[interaction];
  if (!spec) return null;
  const requires = spec.requires.length ? spec.requires.join(', ') : 'nothing';
  const fields = Object.entries(gap?.fields ?? {}).sort((a, b) => b[1] - a[1]);
  return (
    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
      <span>requires: <code>{requires}</code> · produces: <code>{spec.produces ?? 'no response'}</code></span>
      {usageState === 'ok' && (
        fields.length ? (
          <span style={{ color: 'var(--color-status-warning)' }}>
            {' '}· {gap?.blocks} live block{gap?.blocks === 1 ? '' : 's'} incomplete:{' '}
            {fields.map(([f, n]) => `${f} (${n})`).join(', ')}
          </span>
        ) : (
          <span style={{ color: 'var(--color-status-success)' }}> · live content complete</span>
        )
      )}
    </div>
  );
}

/**
 * A preview for a row whose answer is a SET of interactions, not one.
 *
 * `exercise` draws nine different widgets depending on its activity, and each
 * of the eleven holder types permits a handful. Showing one mock for either
 * would be a lie of exactly the kind this page exists to stop — it is why the
 * `exercise` row once claimed all 187 of its blocks draw a textarea.
 *
 * Nothing new is drawn. Each permitted activity is resolved through the real
 * resolver, the results are grouped, and one existing `BlockPreview` is shown
 * per DISTINCT interaction, captioned with the activities that produce it. So
 * `tracker` showing one input-table preview captioned "input-table,
 * comparison-matrix" is the honest statement that those two activities draw the
 * same thing.
 */
function CompositePreview({ activities, resolve, note }: {
  activities: string[];
  resolve: (activity: string) => InteractionType;
  note?: string;
}) {
  const groups = new Map<InteractionType, string[]>();
  for (const a of activities) {
    const i = resolve(a);
    if (!groups.has(i)) groups.set(i, []);
    groups.get(i)!.push(a);
  }

  if (!groups.size) {
    return (
      <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        Permits no activities, so there is nothing for it to draw.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {note && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{note}</p>
      )}
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        {activities.length} activit{activities.length === 1 ? 'y' : 'ies'} ·{' '}
        {groups.size} distinct interaction{groups.size === 1 ? '' : 's'}
      </p>
      {[...groups.entries()].map(([interaction, produced]) => (
        <div key={interaction}>
          <div className="flex items-baseline gap-2 flex-wrap" style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>
            <code style={{ color: 'var(--color-primary-default)' }}>{interaction}</code>
            <span style={{ color: 'var(--color-text-muted)' }}>← {produced.join(' · ')}</span>
          </div>
          <BlockPreview interaction={interaction} />
        </div>
      ))}
    </div>
  );
}

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
function ResponseIdentityPanel({ usage, usageState }: {
  usage: Awaited<ReturnType<typeof apiClient.getBlockUsage>>;
  usageState: 'loading' | 'ok' | 'failed';
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
    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <strong style={{ fontSize: 'var(--text-sm)' }}>Response identity</strong>
        <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>activityConfig.key</code>
        <span style={{ fontSize: 'var(--text-xs)', color: STATUS_COLOUR.live, fontWeight: 500 }}>
          {STATUS_LABEL.live}
        </span>
      </div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
        Answers are stored under a block <em>id</em>, so the same question asked on seven days is
        seven unrelated answers. A shared <code>key</code> is the author saying those blocks are one
        question; <code>responseKeyOf()</code> is now the single definition of that identity, and the
        player threads a keyed block&apos;s earlier days through it.
      </p>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {figures.map((f) => (
          <div key={f.label}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: f.alarm ? 'var(--color-status-warning)' : 'var(--color-text-primary)' }}>
              {f.value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>{f.label}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{f.note}</div>
          </div>
        ))}
      </div>
      {usageState === 'ok' && usage?.dayIntegrity && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
          Day integrity, by the same feed: <strong>{usage.dayIntegrity.emptyDays}</strong> live day
          {usage.dayIntegrity.emptyDays === 1 ? '' : 's'} hold no blocks and{' '}
          <strong>{usage.dayIntegrity.daysWithDuplicateBlockIds}</strong> carry a repeated block id.
          Both are errors under <code>validateDay()</code>, which the day composer now runs —
          reporting on a draft, blocking on a published programme (<code>validationMode</code>).
        </p>
      )}
      {usageState === 'ok' && (usage?.responseIdentity?.blocksWithRepeat ?? 0) === 0 && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-status-warning)', marginTop: '0.75rem' }}>
          No live block declares <code>repeat</code>, so <code>simple_repeat</code>,
          {' '}<code>column_addition</code> and <code>on_demand</code> — and{' '}
          <code>columnsByDay</code> with them — have never run on production content.
          Keys are how repetition is actually declared here.
        </p>
      )}
    </div>
  );
}

export function AdminBlockTypeViewer({ onBack }: AdminBlockTypeViewerProps) {
  // Five tabs became two (blocks.md §18 Phase 4.1). Retired: Interactions (it
  // IS the activity list), Check-in Blocks (its catalog bucket has no reader),
  // Day Config Presets (merged into block_type by Phase 1.1), and the
  // Legacy → Interaction mapping (kept only until the backfill; the retype
  // completed it, so the alias table is now history rather than a live map).
  // `interactions` is the landing view again. It was the default
  // (`useState<...>('interactions')`) before the five-tabs-to-two change
  // removed it, while its render code survived and went on printing
  // `block.previewHint` against a source that no longer existed.
  const [activeTab, setActiveTab] = useState<'interactions' | 'blocktypes' | 'activities'>('interactions');

  /**
   * Which row has its preview open. One at a time — the previews are large, and
   * the point of the page is comparison across rows, not a wall of mocks.
   */
  const [openPreview, setOpenPreview] = useState<string | null>(null);
  const previewToggle = (id: string, label = 'Preview') => (
    <button
      onClick={() => setOpenPreview(openPreview === id ? null : id)}
      style={{
        fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-base)',
        color: 'var(--color-primary-default)', background: 'none', border: 'none',
        cursor: 'pointer', padding: 0,
      }}
    >
      {openPreview === id ? `Hide ${label.toLowerCase()}` : label}
    </button>
  );

  // Live usage, counted over `equip:` server-side. `null` means the feed failed
  // — which must NOT read as "everything is unused", so every count renders as
  // "—" rather than 0 until it arrives.
  const [usage, setUsage] = useState<Awaited<ReturnType<typeof apiClient.getBlockUsage>>>(null);
  const [usageState, setUsageState] = useState<'loading' | 'ok' | 'failed'>('loading');
  useEffect(() => {
    let alive = true;
    apiClient.getBlockUsage().then((u) => {
      if (!alive) return;
      setUsage(u);
      setUsageState(u ? 'ok' : 'failed');
    });
    return () => { alive = false; };
  }, []);

  /** Live count for a term, or null when the feed has not arrived. */
  const countOf = (dim: 'interactions' | 'blockTypes' | 'activities' | 'dayTypes', term: string): number | null =>
    usage ? (usage[dim][term] ?? 0) : null;

  /**
   * What live content is missing, per interaction, judged by the one table that
   * says what each interaction needs.
   *
   * `INTERACTION_REQUIREMENTS` and `missingRequirements` were imported by their
   * own test and nothing else. They are the module's only written statement of
   * what a block of each kind requires — so rather than restate it in an
   * editor, this runs it over production content and reports the answer.
   *
   * The server sends FACTS (which config keys carry a value), never the target
   * field names; the mapping between the two is `blockOf`, and it exists once.
   * The probe block below is reconstituted from those facts: every present key
   * gets a truthy stand-in, except `subtype`, which needs its real value for
   * the resolver, and `key`, which must be a non-empty string.
   */
  const requirementGaps = useMemo(() => {
    const out: Record<string, { blocks: number; fields: Record<string, number> }> = {};
    for (const p of usage?.blockProbes ?? []) {
      const cfg: Record<string, unknown> = {};
      for (const k of p.c) cfg[k] = k === 'subtype' ? (p.s ?? true) : k === 'key' ? 'named' : true;
      const missing = missingRequirements(blockOf({
        id: 'probe',
        title: '',
        type: p.t as never,
        interaction: (p.i ?? undefined) as never,
        content: p.ct ? 'x' : '',
        duration: 0,
        required: false,
        order: 0,
        activityConfig: cfg,
        image_url: p.im ? 'x' : undefined,
      }));
      if (!missing.length) continue;
      const interaction = p.i ?? 'unknown';
      const bucket = (out[interaction] ??= { blocks: 0, fields: {} });
      bucket.blocks += p.n;
      for (const f of missing) bucket.fields[f] = (bucket.fields[f] ?? 0) + p.n;
    }
    return out;
  }, [usage]);

  /** The shared four-column row tail: live count, what it draws, status. */
  const RowMeta = ({ count, rendersAs, status }: {
    count: number | null; rendersAs: string; status: TermStatus | null;
  }) => (
    <div className="flex items-start gap-3 flex-wrap mt-2" style={{ fontSize: 'var(--text-xs)' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>
        live:{' '}
        <strong style={{ color: count && count > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
          {count === null ? '—' : count}
        </strong>
      </span>
      <span style={{ color: 'var(--color-text-muted)', flex: '1 1 240px' }}>{rendersAs}</span>
      <span
        title={status ? undefined : 'The usage feed is unavailable, so whether anything uses this is unknown — not zero'}
        style={{ color: status ? STATUS_COLOUR[status] : 'var(--color-text-muted)', fontWeight: 500 }}
      >
        {status ? STATUS_LABEL[status] : '—'}
      </span>
    </div>
  );
  const { blockTypes: kvBlockTypes, exerciseSubtypes: kvExerciseSubtypes, dayConfigTypes: kvDayConfigTypes, interactionTypes: kvInteractionTypes } = useMetadata();


  // ── Exercise subtypes — derived, not declared ──────────────────
  // This screen used to hardcode its own 12-entry list, a third copy alongside
  // the catalog and the code. It had drifted from both: it presented
  // `rating_scale`, `clinical_instrument` and `comparison_matrix` (aliases) as
  // the canonical terms, listed `likert` as a subtype, and had no entry for
  // `number` — while missing every term actually found in live content.
  // Canonical terms come from code, labels and descriptions from the catalog,
  // and aliases are listed as aliases.
  const exerciseSubtypes = useMemo(() => {
    const row = (v: string) => kvExerciseSubtypes.find((r) => r.value === v);
    const canonical = CANONICAL_SUBTYPES.map((value) => ({
      value,
      label: row(value)?.label ?? value,
      description: row(value)?.description ?? 'No catalog description.',
      // The row's own icon. Every activity row declares one; this screen drew
      // a hardcoded PenTool on all twelve.
      icon: row(value)?.icon,
      /*
        `selectable` is what the badge reads, so it must mean what BlockEditor
        does — not "is canonical". It said `true` for all twenty, which put "In
        Editor" on `listen`, `date-time`, `table-review` and `ranking`: the four
        the editor deliberately filters out because their interaction has no
        renderer. The page was contradicting the guard it exists to report on.

        One source: `AUTHORABLE_SUBTYPES` is the same list the editor filters by,
        so the badge cannot drift from the picker again.
      */
      selectable: (AUTHORABLE_SUBTYPES as readonly string[]).includes(value),
      inCatalog: !!row(value),
    }));
    const aliases = Object.entries(SUBTYPE_ALIASES).map(([value, canonicalTerm]) => ({
      value,
      label: value,
      description: `Alias — normalises to ${canonicalTerm} before the resolver sees it.`,
      // An alias resolves to its canonical term, so it wears that term's icon.
      icon: row(value)?.icon ?? row(canonicalTerm)?.icon,
      selectable: false,
      inCatalog: !!row(value),
    }));
    // Anything the catalog holds that code knows nothing about. Should be empty.
    const unknown = kvExerciseSubtypes
      .filter((r) => !(CANONICAL_SUBTYPES as readonly string[]).includes(r.value) && !(r.value in SUBTYPE_ALIASES))
      .map((r) => ({
        value: r.value,
        label: r.label,
        description: 'In the catalog, but in neither EXERCISE_SUBTYPES nor SUBTYPE_ALIASES — it will hit the resolver default.',
        icon: r.icon,
        selectable: false,
        inCatalog: true,
      }));
    return [...canonical, ...aliases, ...unknown];
  }, [kvExerciseSubtypes]);

  // ── Day config presets — derived, not declared ─────────────────
  // This held a hand-copied set of SEVEN presets against the real eleven, with
  // its own allowedBlocks and blockedComponents that had drifted from
  // block-type-rules.ts. Both halves now come from the real sources: composition and
  // rules from DAY_TYPE_PRESETS, player layout and progress from
  // ProgramPlayer's DAY_TYPE_CONFIG.

  const interactionTypes = Object.keys(INTERACTION_META) as InteractionType[];

  // The block-type vocabulary AS CODE KNOWS IT: the stages that have presets,
  // plus the leaf types a block may be. This is what the catalog is compared
  // against, so a row in one and not the other shows as DRIFT rather than
  // being silently absorbed.
  /** What an activity draws, via the real resolver rather than a second table. */
  /**
   * Most-used first, unused last, declaration order within a tie.
   *
   * The page listed every vocabulary in catalog order, which gave a term nobody
   * has ever used the same prominence as one carried by 187 blocks. Ranking is
   * the cheapest way to make the shape of the data visible: on every tab the
   * handful of real values now sit at the top and the long tail reads as a tail.
   *
   * With the feed down the order is left ALONE — `null` sorts as a tie, so the
   * list keeps catalog order rather than inventing a ranking out of unknowns.
   */
  const byLiveCount = <T,>(rows: T[], countFor: (row: T) => number | null): T[] =>
    rows
      .map((row, i) => ({ row, i, n: countFor(row) ?? 0 }))
      .sort((a, b) => (b.n - a.n) || (a.i - b.i))
      .map((x) => x.row);

  const resolveSubtypeInteraction = (subtype: string): InteractionType =>
    resolveInteraction({
      id: 'probe', title: '', type: 'exercise', content: '',
      duration: 0, required: false, order: 0,
      activityConfig: { subtype },
    } as never);

  /**
   * Leaf block types draw whatever their bare type resolves to.
   *
   * `exercise` is the exception and must be stated, not derived: a bare
   * `exercise` with no activity resolves to `write`, so deriving its hint made
   * the page claim all 187 exercise blocks draw a textarea. They draw nine
   * different widgets — the activity decides, which is the whole point of the
   * Activities tab.
   */
  const LEAF_HINTS: Record<string, string> = Object.fromEntries(
    LEAF_BLOCK_TYPES.map((t) => {
      if (t === 'exercise') {
        return [t, 'Depends entirely on its activity — see the Activities tab'];
      }
      const i = resolveInteraction({
        id: 'probe', title: '', type: t, content: '',
        duration: 0, required: false, order: 0,
      } as never);
      return [t, INTERACTION_META[i]?.previewHint ?? 'No preview description recorded'];
    }),
  );

  const BLOCK_TYPE_VOCABULARY = [
    ...Object.keys(DAY_TYPE_PRESETS),
    ...LEAF_BLOCK_TYPES,
  ].filter((v, i, a) => a.indexOf(v) === i);
  /*
    `pickableBlockTypes` — the leaf half — was removed 2026-09-08, and this is
    the reason rather than a silent delete.

    It existed to build the "Blocks — held by stages (6)" section of a split
    list. Flattening that list made leaf-vs-stage a BADGE on each row, so the
    one fact it carried is now stated seventeen times, once per row, from
    `isContainerRow` directly. It was not unrendered code that turned out to be
    load-bearing; it was a derivation whose only consumer was a page structure
    that no longer exists.

    `containerBlockTypes` stays: the "Stages with rules" tile needs the count,
    and that comparison is the one place the `can_hold` ⟺ preset invariant is
    checked mechanically.
  */
  /*
    `containerBlockTypes` is gone with the "Stages with rules" tile it fed, and
    this is the reason rather than a silent delete.

    Its only job was that tile's comparison — `DAY_TYPE_PRESETS` against the
    catalog rows whose `can_hold` is non-empty. That invariant is not lost: it
    is asserted at `block-type-rules.test.ts:125` ("can_hold non-empty <=> the
    row has a preset"), where a break fails the build instead of waiting to be
    noticed on a page. Per-row containment is still shown, from
    `isContainerRow(row)` directly, which is where a per-row fact belongs.
  */
  const aliasCount = exerciseSubtypes.length - CANONICAL_SUBTYPES.length;

  /**
   * Like-for-like, or it cries wolf.
   *
   * This row used to print `code count / raw KV row count`, comparing a DERIVED
   * number against a RAW one, so correct behaviour rendered exactly like drift.
   * Worse, it compared the catalog against a hardcoded 7-entry block-type array
   * this screen kept — after the quiz/reflection flip that read
   * `7 / 5 · DRIFT`, blaming the data for a stale constant. The array is gone.
   *
   * Counts expected to differ — stages, blocks, aliases — are their own figure,
   * never the denominator of a ratio. DRIFT means DRIFT.
   */
  const compare = (code: number, catalog: number, aside?: string) => {
    const suffix = aside ? ` · ${aside}` : '';
    if (catalog === 0) return `${code}${suffix}`;          // catalog not loaded
    if (code === catalog) return `${code}${suffix}`;
    return `${code} / ${catalog} in catalog · DRIFT${suffix}`;
  };

  const stats = [
    {
      // The stage/block split is the section headings below, so repeating it
      // here made this the only one of four tiles that could not report DRIFT —
      // it had no comparison to fail. Now it compares the code's leaf+container
      // vocabulary against the catalog's, like the other three.
      label: 'Block Types',
      value: compare(BLOCK_TYPE_VOCABULARY.length, kvBlockTypes.length),
      icon: <BookOpen className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />,
    },
    {
      label: 'Activities',
      value: compare(CANONICAL_SUBTYPES.length, kvExerciseSubtypes.length,
                     aliasCount > 0 ? `${aliasCount} aliases` : undefined),
      icon: <PenTool className="w-4 h-4" style={{ color: 'var(--color-status-warning)' }} />,
    },
    {
      label: 'Interaction Types',
      value: compare(interactionTypes.length, kvInteractionTypes.length),
      icon: <Zap className="w-4 h-4" style={{ color: 'var(--color-status-danger)' }} />,
    },
    {
      /*
        WAS "Stages with rules 11" — DAY_TYPE_PRESETS against catalog containers.
        Two facts made it the wrong tile to keep. It restated a per-row badge, and
        it presented containment as the page's headline structural fact when no
        block in production has ever been held by anything: all 11 holder types
        have zero blocks.

        What the page could not say, and now does: how much of each declared
        vocabulary anything actually uses. 4 of 17 block types, 9 of 13
        interactions, 11 of 12 activities — measured, not asserted, and "—" when
        the feed is down.

        The `can_hold` invariant is still checked, in `block-type-rules.test.ts`,
        where a broken invariant fails a build instead of being read off a tile.
      */
      label: 'In use',
      value: usageState !== 'ok'
        ? '—'
        : `${BLOCK_TYPE_VOCABULARY.filter((t) => (countOf('blockTypes', t) ?? 0) > 0 || (countOf('dayTypes', t) ?? 0) > 0).length}` +
          ` of ${kvBlockTypes.length} types · ` +
          `${interactionTypes.filter((i) => (countOf('interactions', i) ?? 0) > 0).length} of ${interactionTypes.length} interactions`,
      icon: <Calendar className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Block Type Viewer"
        description="Read-only reference of all available content block types used across check-ins and programs"
        stats={stats}
      />

      {/*
        Response identity — cross-cutting, so it sits above the tabs rather than
        inside one. Every figure here is live; the page exists so that a thing
        with no reader cannot look the same as a thing in daily use.
      */}
      <ResponseIdentityPanel usage={usage} usageState={usageState} />

      {/* Tab Switcher — two tabs. See the note on `activeTab` above. */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === 'interactions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('interactions')}
          className="gap-2"
          style={activeTab === 'interactions' ? { backgroundColor: 'var(--color-status-danger)', color: 'var(--color-primary-on)' } : undefined}
        >
          <Zap className="w-4 h-4" /> Interactions ({interactionTypes.length})
        </Button>
        <Button
          variant={activeTab === 'blocktypes' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('blocktypes'); }}
          className="gap-2"
          style={activeTab === 'blocktypes' ? { backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' } : undefined}
        >
          <BookOpen className="w-4 h-4" /> Block Types ({kvBlockTypes.length})
        </Button>
        <Button
          variant={activeTab === 'activities' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('activities'); }}
          className="gap-2"
          style={activeTab === 'activities' ? { backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' } : undefined}
        >
          {/* Counts what the tab RENDERS. It read the catalog row count (20) above
              a list of 49, because aliases are code-only and never in the catalog. */}
          <PenTool className="w-4 h-4" /> Activities ({exerciseSubtypes.length})
        </Button>
      </div>

      {/* ── BLOCK TYPES — one list, containers and leaves together ────── */}
      {/* ── INTERACTIONS — what a block DOES, and what it draws ───────── */}
      {activeTab === 'interactions' && (
        <div className="space-y-3">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Thirteen are declared. <strong>Nine have ever been done</strong> — no live block has
            ever been a <code style={{ fontSize: 'var(--text-xs)' }}>watch</code>,{' '}
            <code style={{ fontSize: 'var(--text-xs)' }}>track-table</code>,{' '}
            <code style={{ fontSize: 'var(--text-xs)' }}>clinical</code> or{' '}
            <code style={{ fontSize: 'var(--text-xs)' }}>upload</code>. Every block resolves to
            exactly one, and since the backfill each of the {usage?.totalBlocks ?? 407} live blocks
            carries its <code style={{ fontSize: 'var(--text-xs)' }}>interaction</code> explicitly
            rather than having it inferred from type + activity.
          </p>

          {usageState === 'failed' && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', borderLeft: '2px solid var(--color-status-warning)', fontSize: 'var(--text-xs)' }}>
              Usage feed unavailable — live counts show as “—”. They are not zero; this page just
              cannot tell you. A confident zero here would be indistinguishable from genuinely
              unused, which is the mistake this feed exists to prevent.
            </div>
          )}

          {byLiveCount(interactionTypes, (k) => countOf('interactions', k)).map((key) => {
            const meta = INTERACTION_META[key];
            const count = countOf('interactions', key);
            // The catalog row behind this interaction, for its icon. `key` is
            // the slug; the row is what declares how it is drawn.
            const catalogRow = kvInteractionTypes.find((r) => r.value === key);
            // Every interaction has a `case` in BlockRenderer's dispatch, so all
            // thirteen are read by code. None is "declared, unread".
            const status = statusOf({ readByCode: true, declared: true, count });
            return (
              <div key={key} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <RowIcon icon={catalogRow?.icon} />
                  <span style={{ fontWeight: 500 }}>{meta.label}</span>
                  <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{key}</code>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{meta.verb}</span>
                  {meta.hintSource === 'written' && (
                    <span title="Read off BlockRenderer — no recovered string described this one"
                          style={{ fontSize: '10px', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-default)', borderRadius: 4, padding: '0 4px' }}>
                      hint written
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>{meta.description}</p>
                <RowMeta count={count} rendersAs={meta.previewHint} status={status} />
                <RequirementLine interaction={key} gap={requirementGaps[key]} usageState={usageState} />
                <div className="mt-2">{previewToggle(`i:${key}`)}</div>
                {openPreview === `i:${key}` && <PreviewPanel interaction={key} />}
              </div>
            );
          })}

          {/*
            LEGACY -> INTERACTION (restored 2026-09-08).

            `LEGACY_MAPPING` was declared and read by nothing. It was retired
            from the page on the grounds that the backfill had completed, which
            confused two different things: the backfill settled what the DATA
            says, and this table is how a reader understands old data and old
            code. Every `equip_program_by_slug:` snapshot, every stored block
            written before the backfill, and every `type + subtype` still in the
            editor is read through exactly this map.

            It is derived, not written — each row runs the real
            `resolveInteraction`, so it cannot drift from the resolver the way a
            hand-kept table would.
          */}
          <details className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 500, fontSize: 'var(--text-sm)' }}>
              Legacy → interaction ({LEGACY_MAPPING.length} terms)
            </summary>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '6px 0 10px' }}>
              How a stored <code>type</code> or <code>activityConfig.subtype</code> resolves. Every
              row is computed by running <code>resolveInteraction()</code>, so this cannot drift
              from the resolver. The backfill wrote <code>interaction</code> onto live blocks; it did
              not make old records or the editor&apos;s own vocabulary readable without this.
            </p>
            <div className="space-y-1">
              {LEGACY_MAPPING.map((m) => (
                <div key={m.legacy} className="flex items-baseline gap-2 flex-wrap" style={{ fontSize: 'var(--text-xs)' }}>
                  <code style={{ minWidth: 210, color: 'var(--color-text-primary)' }}>{m.legacy}</code>
                  <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                  <code style={{ color: 'var(--color-primary-default)' }}>{m.interaction}</code>
                  <span style={{ color: 'var(--color-text-muted)' }}>{m.note}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {activeTab === 'blocktypes' && (
        <div className="space-y-3">
          {/*
            ONE FLAT LIST OF 17 (2026-09-08). This was split into
            "Stages — hold blocks (11)" and "Blocks — held by stages (6)" under a
            paragraph explaining `can_hold`. The split made the page argue for a
            distinction instead of showing a vocabulary: the stat tile says 17
            and the list said 11 and 6. Stage vs block is now a badge on the row,
            which is where a per-row fact belongs. `containerBlockTypes` and
            `pickableBlockTypes` still exist — the "Stages with rules" tile
            compares one of them against DAY_TYPE_PRESETS.
          */}
          {/*
            Flat and in CATALOG ORDER. This used to concatenate the two halves to
            get a stable order, because no catalog row carried a `sort_order` and
            the store's order was arbitrary. Rows now declare one and
            `useMetadata` sorts every bucket once, so ordering is a data
            decision editable in Meta Manager rather than a sort in this file.
          */}
          {[{ rows: byLiveCount(kvBlockTypes, (r) =>
              isContainerRow(r) ? countOf('dayTypes', r.value) : countOf('blockTypes', r.value)) }].map(({ rows }) => {
            return (
              <div className="space-y-2">
                {rows.map((row) => {
                  const preset = DAY_TYPE_PRESETS[row.value as keyof typeof DAY_TYPE_PRESETS];
                  return (
                    <div key={row.value} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <RowIcon icon={row.icon} />
                        <span style={{ fontWeight: 500 }}>{row.label}</span>
                        <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{row.value}</code>
                        {/* The whole stage/block distinction, as one word. */}
                        <span
                          title={isContainerRow(row)
                            ? 'can_hold is non-empty — it holds block types and carries preset rules'
                            : 'can_hold is empty — it holds nothing and is placed inside a stage'}
                          style={{
                            fontSize: '10px', borderRadius: 4, padding: '0 4px',
                            border: '1px solid var(--color-border-default)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {isContainerRow(row) ? 'stage' : 'block'}
                        </span>
                      </div>
                      {row.description && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>{row.description}</p>
                      )}
                      {(() => {
                        // A stage is never a block's type, so counting live
                        // blocks against it would always read zero and look
                        // unused. Stages are counted by the days that use them
                        // — which this feed does not carry — so they show "—"
                        // and say why, rather than a misleading 0.
                        const isStage = isContainerRow(row);
                        const known = (BLOCK_TYPE_VOCABULARY as string[]).includes(row.value);
                        // A stage is counted by the DAYS that carry it; a leaf by
                        // the blocks that are it. Counting blocks against a stage
                        // would always read zero and libel it as unused.
                        const count = isStage
                          ? countOf('dayTypes', row.value)
                          : countOf('blockTypes', row.value);
                        return (
                          <RowMeta
                            count={count}
                            rendersAs={isStage
                              ? `A stage — ${count ?? '—'} day${count === 1 ? '' : 's'} carry this type`
                              : (LEAF_HINTS[row.value] ?? 'No preview description recorded')}
                            status={statusOf({ readByCode: known, declared: true, count })}
                          />
                        );
                      })()}
                      {isContainerRow(row) && (
                        <div className="mt-2 space-y-1" style={{ fontSize: 'var(--text-xs)' }}>
                          <div><span style={{ color: 'var(--color-text-muted)' }}>holds: </span>{(row.can_hold ?? []).join(' · ') || '—'}</div>
                          <div><span style={{ color: 'var(--color-text-muted)' }}>activities ({(row.activities ?? []).length}): </span>{(row.activities ?? []).join(' · ') || '—'}</div>
                          {preset && (
                            <>
                              <div><span style={{ color: 'var(--color-text-muted)' }}>interactions: </span>{preset.allowedInteractions.join(' · ')}</div>
                              <div><span style={{ color: 'var(--color-text-muted)' }}>steps: </span>
                                {preset.stepGroupRules.allowed ? 'allowed' : 'not allowed'}
                                {preset.stepGroupRules.required ? ', required' : ''}
                                {preset.stepGroupRules.oneBlockPerStep ? ', one block per step' : ''}
                              </div>
                              {/*
                                `autoConfig` is the stage's nav and save policy.
                                `autoAdvance` was read; `saveOnExit` and
                                `saveOnToggle` were not, until the player began
                                flushing on exit for the stages that promise it.
                                Printed here with the day count above it, so a
                                policy governing nothing cannot look like one in
                                force.
                              */}
                              <div><span style={{ color: 'var(--color-text-muted)' }}>policy: </span>
                                {Object.entries(preset.autoConfig).length
                                  ? Object.entries(preset.autoConfig)
                                      .map(([k, v]) => `${k}: ${v}`).join(' · ')
                                  : 'none declared'}
                                {preset.autoConfig.saveOnExit && (
                                  <span style={{ color: 'var(--color-text-muted)' }}>
                                    {' '}— the player flushes before leaving a day of this type
                                  </span>
                                )}
                                {preset.autoConfig.saveOnToggle && (
                                  <span style={{ color: 'var(--color-text-muted)' }}>
                                    {' '}— every change is committed as it happens, so no exit flush
                                  </span>
                                )}
                              </div>
                              {preset.warnings.map((w, n) => (
                                <div key={n} style={{ color: 'var(--color-status-warning)' }}>⚠ {w}</div>
                              ))}
                              {preset.errors.map((e, n) => (
                                <div key={n} style={{ color: 'var(--color-status-danger)' }}>✕ {e}</div>
                              ))}
                            </>
                          )}
                          {!preset && (
                            <div style={{ color: 'var(--color-status-danger)' }}>
                              ✕ holds blocks but has no preset — nav, save and step rules have nothing to govern
                            </div>
                          )}
                        </div>
                      )}
                      {!isContainerRow(row) && preset && (
                        <div className="mt-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-status-danger)' }}>
                          ✕ has preset rules but holds nothing
                        </div>
                      )}
                      {/*
                        EVERY block type has a preview now.

                        The two exemptions here were both dishonest in the same
                        direction. A holder said "no preview — a stage is a day",
                        which was true while a stage WAS a day; under the settled
                        model a block type constrains what a block may DO, so its
                        preview is what its permitted activities draw. And
                        `exercise` showed a single mock through `probe()`, which
                        resolves a bare `exercise` to `write` — the claim that
                        all 187 of them draw a textarea.

                        Both are the same shape: a set of activities, resolved
                        through the real resolver, one existing preview per
                        distinct interaction. Nothing is invented.
                      */}
                      <div className="mt-2">{previewToggle(`b:${row.value}`)}</div>
                      {openPreview === `b:${row.value}` && (
                        isContainerRow(row) ? (
                          <CompositePreview
                            activities={row.activities ?? []}
                            resolve={resolveSubtypeInteraction}
                            note={`What this type permits, drawn. Its ${(row.activities ?? []).length} activities come from the catalog row.`}
                          />
                        ) : row.value === 'exercise' ? (
                          <CompositePreview
                            activities={[...CANONICAL_SUBTYPES]}
                            resolve={resolveSubtypeInteraction}
                            note={
                              'Derived, not declared: no `activities` list exists on `exercise` in the catalog. ' +
                              'Every activity in live use sits inside an exercise and nowhere else, so the canonical ' +
                              'twelve are what it can draw.'
                            }
                          />
                        ) : (
                          <PreviewPanel
                            interaction={probe(row.value)}
                            blockType={{
                              value: row.value,
                              label: row.label,
                              icon: BookOpen,
                              description: row.description ?? '',
                              category: 'equip',
                              fields: [],
                              previewHint: LEAF_HINTS[row.value] ?? '',
                            }}
                          />
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-3">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
            Exercise subtypes define the interaction style inside an Exercise block. This list is derived, not declared here: canonical terms from <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: '4px' }}>EXERCISE_SUBTYPES</code>, aliases from <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: '4px' }}>SUBTYPE_ALIASES</code> (both in block-model.ts), labels and descriptions from the live catalog.
          </p>
          {byLiveCount(exerciseSubtypes, (st) => countOf('activities', st.value)).map((st) => (
            <Card key={st.value} style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', opacity: st.selectable ? 1 : 0.75 }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <RowIcon icon={st.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                        {st.label}
                      </h4>
                      <AdminStatusBadge status="neutral" label={st.value} />
                      {/*
                        "Alias / Preset-only" read as "nothing uses this" on
                        three terms that ten live blocks carry — `matrix` (8),
                        `text_list` (1), `row_list` (1). An alias not offered in
                        the editor can still be the stored value, and saying so
                        is the difference between unselectable and unused.
                      */}
                      {(() => {
                        /*
                          Three reasons a term is not offered, and they are not
                          the same thing:
                            · canonical, but no renderer yet   -> awaiting a renderer
                            · an alias live content carries    -> in use
                            · an alias nothing is known to use -> preset-only
                          Collapsing them into "Alias / Preset-only" is what made
                          `matrix` (8 blocks) read as unused.
                        */
                        const n = countOf('activities', st.value) ?? 0;
                        const isCanonical = (CANONICAL_SUBTYPES as readonly string[]).includes(st.value);
                        if (st.selectable) return <AdminStatusBadge status="published" label="In Editor" />;
                        if (isCanonical) return <AdminStatusBadge status="draft" label="Declared — awaiting a renderer" />;
                        if (n > 0) return <AdminStatusBadge status="published" label={`Alias — in use (${n})`} />;
                        return <AdminStatusBadge status="draft" label="Alias / Preset-only" />;
                      })()}
                    </div>
                    <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                      {st.description}
                    </p>
                    {(() => {
                      const count = countOf('activities', st.value);
                      // `inCatalog` is false for an alias — aliases are code-only
                      // by design and normalise before the resolver sees them, so
                      // that is not drift. A term in the catalog that is in
                      // neither list IS an orphan, and `st.selectable` is false
                      // for exactly that case too, hence the explicit check.
                      const known = st.selectable || (SUBTYPE_ALIASES as Record<string, string>)[st.value] !== undefined;
                      const rendersAs = INTERACTION_META[resolveSubtypeInteraction(st.value)]?.previewHint
                        ?? 'Resolves to no interaction';
                      const interaction = resolveSubtypeInteraction(st.value);
                      return (
                        <>
                          <RowMeta
                            count={count}
                            rendersAs={rendersAs}
                            status={statusOf({ readByCode: known, declared: true, count })}
                          />
                          <div className="mt-2">{previewToggle(`a:${st.value}`)}</div>
                          {openPreview === `a:${st.value}` && (
                            <>
                              {!st.selectable && (
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 8 }}>
                                  An alias — it normalises to <code>{normalizeSubtype(st.value)}</code>{' '}
                                  before the resolver sees it, so this is that term&apos;s preview.
                                </p>
                              )}
                              <PreviewPanel interaction={interaction} />
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Day Config Presets Tab */}

      {/* Block Type Grid for equip/checkin tabs */}
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
function PreviewPanel({ interaction, blockType }: {
  interaction: InteractionType;
  blockType?: BlockTypeInfo;
}) {
  const [previewMode, setPreviewMode] = useState<'user' | 'editor'>('user');
  const mode = blockType ? previewMode : 'user';

  const tabStyle = (active: boolean) => ({
    fontSize: 'var(--text-xs)',
    fontFamily: 'var(--font-family-base)',
    fontWeight: 'var(--font-weight-medium)' as any,
    backgroundColor: active ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
    color: active ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
    border: 'none',
    cursor: 'pointer',
  });

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
          {mode === 'user' ? 'User-facing preview' : 'Editor / wizard preview'}
          {' · '}
          <code>{interaction}</code>
        </span>
        {blockType && (
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-default)' }}>
            <button
              onClick={() => setPreviewMode('user')}
              className="flex items-center gap-1 px-2.5 py-1 transition-colors"
              style={tabStyle(previewMode === 'user')}
            >
              <Smartphone size={12} /> User
            </button>
            <button
              onClick={() => setPreviewMode('editor')}
              className="flex items-center gap-1 px-2.5 py-1 transition-colors"
              style={{ ...tabStyle(previewMode === 'editor'), borderLeft: '1px solid var(--color-border-default)' }}
            >
              <Settings2 size={12} /> Editor
            </button>
          </div>
        )}
      </div>
      {mode === 'user' || !blockType
        ? <BlockPreview interaction={interaction} />
        : <EditorPreview block={blockType} />}
    </div>
  );
}

// ── Mini Preview Renderer ───────────────────────────────────────
/**
 * What each interaction actually draws.
 *
 * **Re-keyed from block type to interaction, 2026-09-08.** These mocks were
 * written against the legacy check-in and equip type strings — `emoji_scale`,
 * `free_text`, `single_choice`, `lesson`, `journal` — and the component that
 * rendered them was orphaned, so the only thing this page said about
 * appearance was one line of `previewHint` prose. The interaction is what
 * `BlockRenderer` switches on, so the drawing belongs to the interaction.
 *
 * Thirteen previews, one per interaction. Seven are the original mocks
 * re-keyed; six are new and were read off `BlockRenderer`, not invented — the
 * source line is named on each.
 *
 * Five legacy mocks did not survive the re-key, and the reason is in each case
 * that they drew something the renderer does not:
 *
 * | legacy mock | why it is gone |
 * |---|---|
 * | `emoji_scale` | `rate` draws `renderRatingScale` — a slider, not an emoji row |
 * | `yes_no` | a yes/no question is `select-one` with two options; the renderer draws radios |
 * | `exercise` | an MCQ with a correct-answer highlight — a variant of `select-one`, not its general shape |
 * | `journal` | a prompt above a textarea, which is `write` |
 * | `reflection` | centred prose, which is `read` |
 *
 * Keeping any of them would have shown an author a widget the player never
 * builds, which is worse than showing nothing.
 */
function BlockPreview({ interaction }: { interaction: InteractionType }) {
  const previewStyle = {
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--color-bg-page)',
    padding: 'var(--spacing-4)',
    border: '1px solid var(--color-border-default)',
  };

  const labelStyle = {
    fontFamily: 'var(--font-family-base)',
    fontWeight: 'var(--font-weight-medium)' as any,
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--spacing-2)',
    display: 'block' as const,
  };

  const hintStyle = {
    fontFamily: 'var(--font-family-base)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    fontStyle: 'italic' as const,
    marginTop: 'var(--spacing-2)',
  };

  const hint = INTERACTION_META[interaction]?.previewHint ?? '';
  const cellStyle = {
    border: '1px solid var(--color-border-default)',
    padding: '4px 8px',
    fontSize: 'var(--text-xs)',
    fontFamily: 'var(--font-family-base)',
  };

  // The lesson view — `read` draws it, and so does `watch`, which has no
  // renderer of its own (`BlockRenderer`: `case 'watch': return renderLesson()`).
  const lessonBody = (
    <div className="space-y-2">
      <div className="w-full h-16 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--color-bg-muted), var(--color-accent-default))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>📷 Media Placeholder</span>
      </div>
      <div className="space-y-1">
        <div className="h-3 rounded w-3/4" style={{ backgroundColor: 'var(--color-text-primary)', opacity: 0.2 }} />
        <div className="h-2 rounded w-full" style={{ backgroundColor: 'var(--color-text-muted)', opacity: 0.15 }} />
        <div className="h-2 rounded w-5/6" style={{ backgroundColor: 'var(--color-text-muted)', opacity: 0.15 }} />
        <div className="h-2 rounded w-2/3" style={{ backgroundColor: 'var(--color-text-muted)', opacity: 0.15 }} />
      </div>
    </div>
  );

  switch (interaction) {
    // was `lesson`
    case 'read':
      return <div style={previewStyle}>{lessonBody}<p style={hintStyle}>{hint}</p></div>;

    // No renderer of its own. Showing the same drawing is the point.
    case 'view':
      return (
        <div style={previewStyle}>
          {lessonBody}
          <p style={{ ...hintStyle, color: 'var(--color-status-warning)' }}>
            Identical to the lesson view on purpose — `BlockRenderer` has no watch case and falls through to it.
          </p>
        </div>
      );

    // was `single_choice` — BlockRenderer: renderMCQ
    case 'select-one':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>How did you sleep last night?</span>
          <div className="space-y-2">
            {['Very poorly', 'Poorly', 'Average', 'Well', 'Very well'].map((opt, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  backgroundColor: i === 3 ? 'var(--color-bg-input)' : 'var(--color-bg-card)',
                  border: i === 3 ? '2px solid var(--color-primary-default)' : '1px solid var(--color-border-default)',
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: i === 3 ? 'var(--color-primary-default)' : 'var(--color-border-default)' }}
                >
                  {i === 3 && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary-default)' }} />}
                </div>
                <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-base)' }}>{opt}</span>
              </div>
            ))}
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    // was `multi_select` — BlockRenderer: renderMultiSelect
    case 'select-many':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>What activities did you do today?</span>
          <div className="flex flex-wrap gap-2">
            {['🏃 Exercise', '📚 Reading', '🧘 Meditation', '🎵 Music', '👥 Social'].map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{
                  fontFamily: 'var(--font-family-base)',
                  backgroundColor: [0, 2].includes(i) ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                  color: [0, 2].includes(i) ? 'var(--color-primary-on)' : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-default)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    // was `free_text` — BlockRenderer: renderTextResponse
    case 'write':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>What&apos;s on your mind?</span>
          <div
            className="w-full h-20 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border-default)', padding: 'var(--spacing-3)' }}
          >
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Type your thoughts here...</span>
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    // was `slider` — BlockRenderer: renderRatingScale
    case 'rate':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>Rate your stress level</span>
          <div className="space-y-2 py-2">
            <div className="relative h-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
              <div className="absolute left-0 top-0 h-2 rounded-full" style={{ width: '60%', backgroundColor: 'var(--color-primary-default)' }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 shadow"
                style={{ left: '58%', backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-primary-default)' }}
              />
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>0 (None)</span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' as any }}>6</span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>10 (Extreme)</span>
            </div>
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    // was `checklist` — BlockRenderer: renderChecklist
    case 'check':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>☑️ Today&apos;s Self-Care Tasks</span>
          <div className="space-y-2">
            {['Drink 8 glasses of water', '10 min mindful breathing', 'Go for a walk', 'Write 3 gratitudes'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs" style={{ fontFamily: 'var(--font-family-base)' }}>
                <div
                  className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: [0, 1].includes(i) ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                    backgroundColor: [0, 1].includes(i) ? 'var(--color-primary-default)' : 'transparent',
                    color: 'white',
                    fontSize: '10px',
                  }}
                >
                  {[0, 1].includes(i) ? '✓' : ''}
                </div>
                <span style={{ textDecoration: [0, 1].includes(i) ? 'line-through' : 'none', color: [0, 1].includes(i) ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    // was `conclude` — BlockRenderer: the completion card
    case 'complete':
      return (
        <div style={previewStyle}>
          <div className="text-center space-y-2 py-2">
            <span className="text-2xl">🎯</span>
            <span style={{ ...labelStyle, textAlign: 'center' }}>Day Complete!</span>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              Great work today. Remember: progress over perfection.
            </p>
            <div className="w-full py-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)', fontWeight: 'var(--font-weight-medium)' as any }}>
              Continue Tomorrow →
            </div>
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    /*
      NEW — read off `BlockRenderer.renderInputTable` (:575). Columns come from
      `config.columns`; when `config.rows` is present the FIRST column becomes a
      read-only row heading and only the rest are editable. That is the shape of
      a sleep diary, and it is why 144 live blocks draw this.
    */
    case 'input-table':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>🌙 Sleep Diary</span>
          <div className="overflow-x-auto">
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {['Question', 'Mon', 'Tue', 'Wed'].map((c) => (
                    <th key={c} style={{ ...cellStyle, backgroundColor: 'var(--color-bg-input)', fontWeight: 500, textAlign: 'left' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Bedtime', 'Wake time', 'Times awake'].map((row, i) => (
                  <tr key={row}>
                    <td style={{ ...cellStyle, backgroundColor: 'var(--color-bg-muted)', fontWeight: 500 }}>{row}</td>
                    {['10:30 PM', '6:45 AM', '2'].map((v, j) => (
                      <td key={j} style={{ ...cellStyle, backgroundColor: 'var(--color-bg-input)', color: i === 0 && j === 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                        {i === 0 && j === 0 ? v : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    /*
      NEW — read off `BlockRenderer.renderTableChecklist` (:512). The first
      column is headed "Activity" by the renderer, not by config, and every
      other cell is a yes/no toggle.
    */
    case 'track-table':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>Weekly Habit Tracker</span>
          <div className="overflow-x-auto">
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {['Activity', 'Mon', 'Tue', 'Wed'].map((c) => (
                    <th key={c} style={{ ...cellStyle, backgroundColor: 'var(--color-bg-input)', fontWeight: 500, textAlign: c === 'Activity' ? 'left' : 'center' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Morning walk', 'No screens after 9'].map((row, i) => (
                  <tr key={row}>
                    <td style={{ ...cellStyle, fontWeight: 500 }}>{row}</td>
                    {[0, 1, 2].map((j) => (
                      <td key={j} style={{ ...cellStyle, textAlign: 'center' }}>
                        <span style={{ color: (i + j) % 2 === 0 ? 'var(--color-primary-default)' : 'var(--color-border-default)' }}>
                          {(i + j) % 2 === 0 ? '✓' : '○'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    /*
      NEW — read off `BlockRenderer.renderClinicalInstrument` (:451). One row per
      question, one shared scale, and the default scale when none is declared is
      the four PHQ/GAD steps written out here.
    */
    case 'clinical':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>Over the last 2 weeks, how often have you been bothered by…</span>
          <div className="space-y-3">
            {['Little interest or pleasure in doing things', 'Feeling down, hopeless'].map((q, qi) => (
              <div key={q}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', marginBottom: 4 }}>{q}</p>
                <div className="flex gap-1 flex-wrap">
                  {['Not at all', 'Several days', 'More than half', 'Nearly every day'].map((opt, oi) => (
                    <span
                      key={opt}
                      className="px-2 py-1 rounded-md"
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-family-base)',
                        backgroundColor: oi === qi + 1 ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                        color: oi === qi + 1 ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                        border: '1px solid var(--color-border-default)',
                      }}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    /*
      NEW — read off `BlockRenderer.renderFileUpload` (:777). The accepted types
      shown are the renderer's own defaults when the block declares none, and
      10MB is its default cap.
    */
    case 'upload':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>Add a photo of your sleep log</span>
          <div
            className="w-full rounded-lg flex flex-col items-center justify-center gap-1 py-6"
            style={{ border: '2px dashed var(--color-border-default)', backgroundColor: 'var(--color-bg-card)' }}
          >
            <span className="text-xl">📎</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>Choose a file</span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Images, PDF, documents, audio · up to 10MB</span>
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    /*
      NEW — read off `BlockRenderer.renderNumberResponse` (:429). One input, and
      the block's own prompt is used as the PLACEHOLDER, not as a label above
      it — which is why an unprompted number block shows an empty box.
    */
    case 'number':
      return (
        <div style={previewStyle}>
          <div
            className="w-full rounded-[20px] px-4 py-4"
            style={{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
          >
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
              How many hours did you sleep?
            </span>
          </div>
          <p style={hintStyle}>{hint}</p>
        </div>
      );

    /*
      Declared, no renderer. `BlockRenderer` has no case for these four, so a
      block carrying one would draw reading content — the `view` defect exactly.
      They show a marked gap: inventing a mock for a widget the player cannot
      build is the one thing this page must not do, and a mock here would make
      the gap invisible to the person deciding whether to author one.
    */
    case 'listen':
    case 'rank':
    case 'review-table':
    case 'pick-date':
      return (
        <div style={{ ...previewStyle, borderStyle: 'dashed' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-status-warning)', margin: 0 }}>
            No renderer yet — <code>{interaction}</code> is declared so it can be authored the day
            one exists. It is kept out of every editor picker until then.
          </p>
          <p style={hintStyle}>
            Requires: {INTERACTION_REQUIREMENTS[interaction]?.requires.join(', ') || 'nothing'}
          </p>
        </div>
      );

    default:
      // Unreachable while the switch covers InteractionType exhaustively — kept
      // so a new interaction shows a gap rather than a blank card.
      return (
        <div style={previewStyle}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-status-warning)' }}>
            No preview written for “{interaction}”. Add one from what BlockRenderer draws.
          </p>
        </div>
      );
  }
}

// ── Editor Preview Renderer (uses AdminBlockFormTemplate) ────────
function EditorPreview({ block }: { block: BlockTypeInfo }) {
  const Icon = block.icon;
  const isEquip = block.category === 'equip';

  if (isEquip) {
    return (
      <div style={blockFormStyles.wrap}>
        {/* Equip editor header — matches BlockEditor card header */}
        <BlockHeaderBar
          icon={<Icon size={12} style={{ color: 'var(--color-primary-default)' }} />}
          typeBadge={block.value}
          title={`Sample ${block.label}`}
        />
        <div style={blockFormStyles.body}>
          {/* Title + Type row — matches BlockEditor grid */}
          <FieldGrid>
            <div>
              <FieldLabel>Block Title</FieldLabel>
              <MockInput>Introduction to Sleep</MockInput>
            </div>
            <div>
              <FieldLabel>Type</FieldLabel>
              <MockSelect>{block.label}</MockSelect>
            </div>
          </FieldGrid>

          {/* Subtitle */}
          <div>
            <FieldLabel>Block Subtitle</FieldLabel>
            <MockInput>Understanding your sleep patterns</MockInput>
          </div>

          {/* Content / Prompt — matches BlockEditor content section */}
          {hasContentField(block.value) && (
            <div>
              <FieldLabel>
                {contentLabelFor(block.value)}
              </FieldLabel>
              <MockTextarea height="56px">
                <span style={{ opacity: 0.5 }}>
                  {contentPlaceholderFor(block.value)}
                </span>
              </MockTextarea>
            </div>
          )}

          {/* Exercise config — matches BlockEditor exercise section */}
          {block.value === 'exercise' && (
            <IndentedSection>
              <div>
                <FieldLabel>Activity</FieldLabel>
                <MockSelect>Multiple Choice Question</MockSelect>
              </div>
              <div>
                <FieldLabel>Prompt / Question</FieldLabel>
                <MockInput>Which of these habits do you do?</MockInput>
              </div>
              <div>
                <FieldLabel>Options (One per line)</FieldLabel>
                <MockTextarea>Option 1{'\n'}Option 2{'\n'}Option 3</MockTextarea>
              </div>
            </IndentedSection>
          )}

          {/* Checklist items — matches BlockEditor checklist section */}
          {block.value === 'checklist' && (
            <div>
              <FieldLabel>Checklist Items (One per line)</FieldLabel>
              <MockTextarea>Brush teeth{'\n'}Read book{'\n'}Turn off phone</MockTextarea>
            </div>
          )}

          {/* Wizard Flow — matches BlockEditor autoAdvance / required */}
          <SectionDivider label="Wizard Flow" icon={<Layers size={10} style={{ color: 'var(--color-primary-default)' }} />} />
          <FieldGrid>
            <MockCheckbox label="Auto-Advance" checked />
            <MockCheckbox label="Required" />
          </FieldGrid>

          {/* Media — matches BlockEditor image_url section */}
          <MockMediaUpload />
        </div>
      </div>
    );
  }

  // Check-in editor preview — matches AdminCheckinTemplateBuilder step editor
  return (
    <div style={blockFormStyles.wrap}>
      <BlockHeaderBar
        emoji="🤔"
        typeBadge={block.value}
        title="Step 1"
      />
      <div style={blockFormStyles.body}>
        {/* Question — matches AdminCheckinTemplateBuilder question field */}
        <div>
          <FieldLabel>Question</FieldLabel>
          <MockInput>
            {block.value === 'emoji_scale' ? 'How are you feeling?'
              : block.value === 'free_text' ? "What's on your mind?"
              : block.value === 'slider' ? 'Rate your stress level'
              : block.value === 'yes_no' ? 'Did you take your medication?'
              : block.value === 'single_choice' ? 'How did you sleep?'
              : 'What activities did you do?'}
          </MockInput>
        </div>

        {/* Subtitle */}
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <MockInput>Select the option that best describes you</MockInput>
        </div>

        {/* Hero Emoji + Type — matches AdminCheckinTemplateBuilder grid */}
        <FieldGrid>
          <div>
            <FieldLabel>Hero Emoji</FieldLabel>
            <MockInput>🤔</MockInput>
          </div>
          <div>
            <FieldLabel>Type</FieldLabel>
            <MockSelect>{block.label}</MockSelect>
          </div>
        </FieldGrid>

        {/* Scale / Source — matches AdminCheckinTemplateBuilder (emoji_scale & multi_select) */}
        {['emoji_scale', 'multi_select'].includes(block.value) && (
          <div>
            <FieldLabel>Scale / Source</FieldLabel>
            <MockSelect>
              {block.value === 'emoji_scale' ? '😊 mood (5 items)' : 'Select scale...'}
            </MockSelect>
          </div>
        )}

        {/* Options — matches AdminCheckinTemplateBuilder options textarea */}
        {['multi_select', 'single_choice'].includes(block.value) && (
          <div>
            <FieldLabel>Options (One per line)</FieldLabel>
            <MockTextarea>Option 1{'\n'}Option 2{'\n'}Option 3</MockTextarea>
          </div>
        )}

        {/* Slider — matches AdminCheckinTemplateBuilder slider config */}
        {block.value === 'slider' && (
          <FieldGrid>
            <div>
              <FieldLabel>Min</FieldLabel>
              <MockInput>0</MockInput>
            </div>
            <div>
              <FieldLabel>Max</FieldLabel>
              <MockInput>10</MockInput>
            </div>
          </FieldGrid>
        )}

        {/* EMA Category + Save As — matches AdminCheckinTemplateBuilder */}
        <FieldGrid>
          <div>
            <FieldLabel>EMA Category</FieldLabel>
            <MockSelect><span style={{ opacity: 0.5 }}>Select...</span></MockSelect>
          </div>
          <div>
            <FieldLabel>Save As</FieldLabel>
            <MockInput mono>mood_score</MockInput>
          </div>
        </FieldGrid>

        {/* Required — matches AdminCheckinTemplateBuilder */}
        <MockCheckbox label="Required" />
      </div>
    </div>
  );
}