import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  PenTool,
  CheckSquare,
  Layers,
  Calendar,
  Smartphone,
  Settings2,
  Image as ImageIcon,
  Zap,
  PlayCircle,
  CircleDot,
  ListChecks,
  Star,
  Table2,
  Grid3x3,
  ClipboardList,
  Flag,
  PenLine,
  Upload,
  Hash,
} from 'lucide-react';
import { AdminHeader } from '../admin/AdminHeader';
import { apiClient } from '../../lib/api-client';
import { INTERACTION_REQUIREMENTS, missingRequirements, blockOf } from '../../lib/blocks/content-hierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../admin/AdminStatusBadge';
import {
  INTERACTION_META,
  LEAF_BLOCK_TYPES,
  resolveInteraction,
  EXERCISE_SUBTYPES as CANONICAL_SUBTYPES,
  SUBTYPE_ALIASES,
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

// ── Interaction icon map ────────────────────────────────────────
const INTERACTION_ICON_MAP: Record<InteractionType, any> = {
  'read': BookOpen, 'watch': PlayCircle, 'select-one': CircleDot, 'select-many': CheckSquare,
  'write': PenLine, 'rate': Star, 'check': ListChecks, 'track-table': Table2,
  'input-table': Grid3x3, 'clinical': ClipboardList, 'upload': Upload, 'complete': Flag,
  'number': Hash,
};

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
const statusOf = (opts: { readByCode: boolean; declared: boolean; count: number | null }): TermStatus => {
  if (!opts.declared) return 'orphan';           // in the catalog, unknown to code
  if (!opts.readByCode) return 'declared-unread'; // declared, but nothing reads it
  return (opts.count ?? 0) > 0 ? 'live' : 'wired-unused';
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
    count: number | null; rendersAs: string; status: TermStatus;
  }) => (
    <div className="flex items-start gap-3 flex-wrap mt-2" style={{ fontSize: 'var(--text-xs)' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>
        live:{' '}
        <strong style={{ color: count && count > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
          {count === null ? '—' : count}
        </strong>
      </span>
      <span style={{ color: 'var(--color-text-muted)', flex: '1 1 240px' }}>{rendersAs}</span>
      <span style={{ color: STATUS_COLOUR[status], fontWeight: 500 }}>{STATUS_LABEL[status]}</span>
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
      selectable: true,
      inCatalog: !!row(value),
    }));
    const aliases = Object.entries(SUBTYPE_ALIASES).map(([value, canonicalTerm]) => ({
      value,
      label: value,
      description: `Alias — normalises to ${canonicalTerm} before the resolver sees it.`,
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
  const pickableBlockTypes  = kvBlockTypes.filter((t) => !isContainerRow(t));
  const containerBlockTypes = kvBlockTypes.filter((t) => isContainerRow(t));
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
      // The invariant as a number: `can_hold` non-empty <=> a preset exists.
      label: 'Stages with rules',
      value: compare(Object.keys(DAY_TYPE_PRESETS).length, containerBlockTypes.length),
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
          <PenTool className="w-4 h-4" /> Activities ({kvExerciseSubtypes.length})
        </Button>
      </div>

      {/* ── BLOCK TYPES — one list, containers and leaves together ────── */}
      {/* ── INTERACTIONS — what a block DOES, and what it draws ───────── */}
      {activeTab === 'interactions' && (
        <div className="space-y-3">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            The thirteen things a user can do. Every block resolves to exactly one — since the
            backfill, each of the {usage?.totalBlocks ?? 407} live blocks carries its
            <code style={{ fontSize: 'var(--text-xs)' }}> interaction </code> explicitly rather
            than having it inferred from type + activity.
          </p>

          {usageState === 'failed' && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', borderLeft: '2px solid var(--color-status-warning)', fontSize: 'var(--text-xs)' }}>
              Usage feed unavailable — live counts show as “—”. They are not zero; this page just
              cannot tell you. A confident zero here would be indistinguishable from genuinely
              unused, which is the mistake this feed exists to prevent.
            </div>
          )}

          {interactionTypes.map((key) => {
            const meta = INTERACTION_META[key];
            const count = countOf('interactions', key);
            // Every interaction has a `case` in BlockRenderer's dispatch, so all
            // thirteen are read by code. None is "declared, unread".
            const status = statusOf({ readByCode: true, declared: true, count });
            return (
              <div key={key} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
                <div className="flex items-baseline gap-2 flex-wrap">
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
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'blocktypes' && (
        <div className="space-y-3">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            One merged vocabulary. A row that <strong>holds</strong> block types is a stage and
            carries preset rules; a row that holds nothing is a block. That is the whole distinction —
            <code style={{ fontSize: 'var(--text-xs)' }}> can_hold </code> non-empty ⟺ it has a preset.
          </p>
          {['container', 'leaf'].map((kind) => {
            const rows = kind === 'container' ? containerBlockTypes : pickableBlockTypes;
            if (!rows.length) return null;
            return (
              <div key={kind} className="space-y-2">
                <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {kind === 'container' ? `Stages — hold blocks (${rows.length})` : `Blocks — held by stages (${rows.length})`}
                </div>
                {rows.map((row) => {
                  const preset = DAY_TYPE_PRESETS[row.value as keyof typeof DAY_TYPE_PRESETS];
                  return (
                    <div key={row.value} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span style={{ fontWeight: 500 }}>{row.label}</span>
                        <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{row.value}</code>
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
          {exerciseSubtypes.map((st) => (
            <Card key={st.value} style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', opacity: st.selectable ? 1 : 0.75 }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <PenTool className="w-5 h-5" style={{ color: st.selectable ? 'var(--color-status-warning)' : 'var(--color-text-muted)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                        {st.label}
                      </h4>
                      <AdminStatusBadge status="neutral" label={st.value} />
                      <AdminStatusBadge
                        status={st.selectable ? 'published' : 'draft'}
                        label={st.selectable ? 'In Editor' : 'Alias / Preset-only'}
                      />
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
                      return (
                        <RowMeta
                          count={count}
                          rendersAs={rendersAs}
                          status={statusOf({ readByCode: known, declared: true, count })}
                        />
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
function BlockDetailPanel({ block }: { block: BlockTypeInfo }) {
  const Icon = block.icon;
  const [previewMode, setPreviewMode] = useState<'user' | 'editor'>('user');

  return (
    <div className="space-y-4 sticky top-4">
      {/* Info Card */}
      <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
              <Icon className="w-5 h-5" style={{ color: 'var(--color-primary-default)' }} />
            </div>
            <div>
              <CardTitle style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-lg)' }}>
                {block.label}
              </CardTitle>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                type: "{block.value}"
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
            {block.description}
          </p>

          {/* Fields */}
          <div>
            <h5 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
              Available Fields
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {block.fields.map((field) => (
                <span
                  key={field}
                  className="px-2 py-0.5 rounded-md"
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'monospace',
                    backgroundColor: 'var(--color-bg-muted)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  {field}
                </span>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>Used in:</span>
            <AdminStatusBadge
              status={block.category === 'equip' ? 'published' : 'info'}
              label={block.category === 'equip' ? 'Equip Programs' : 'Daily Check-ins'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Card with Mode Toggle */}
      <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
              {previewMode === 'user' ? 'User-Facing Preview' : 'Editor / Wizard Preview'}
            </CardTitle>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-default)' }}>
              <button
                onClick={() => setPreviewMode('user')}
                className="flex items-center gap-1 px-2.5 py-1 transition-colors"
                style={{
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-medium)' as any,
                  backgroundColor: previewMode === 'user' ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                  color: previewMode === 'user' ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Smartphone size={12} /> User
              </button>
              <button
                onClick={() => setPreviewMode('editor')}
                className="flex items-center gap-1 px-2.5 py-1 transition-colors"
                style={{
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-medium)' as any,
                  backgroundColor: previewMode === 'editor' ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                  color: previewMode === 'editor' ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  borderLeft: '1px solid var(--color-border-default)',
                }}
              >
                <Settings2 size={12} /> Editor
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {previewMode === 'user' ? (
            <BlockPreview block={block} />
          ) : (
            <EditorPreview block={block} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Mini Preview Renderer ───────────────────────────────────────
function BlockPreview({ block }: { block: BlockTypeInfo }) {
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

  // Render different previews based on block type
  switch (block.value) {
    case 'emoji_scale':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>How are you feeling today?</span>
          <div className="flex justify-between gap-1">
            {['😢', '😐', '🙂', '😊', '🤩'].map((emoji, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 flex-1 py-2 rounded-lg cursor-pointer transition-all hover:scale-105"
                style={{
                  backgroundColor: i === 3 ? 'var(--color-bg-input)' : 'var(--color-bg-card)',
                  border: i === 3 ? '2px solid var(--color-primary-default)' : '1px solid var(--color-border-default)',
                }}
              >
                <span className="text-xl">{emoji}</span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{['Bad', 'Low', 'OK', 'Good', 'Great'][i]}</span>
              </div>
            ))}
          </div>
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'free_text':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>What's on your mind?</span>
          <div
            className="w-full h-20 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border-default)', padding: 'var(--spacing-3)' }}
          >
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Type your thoughts here...</span>
          </div>
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'multi_select':
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
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'single_choice':
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
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'slider':
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
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'yes_no':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>Did you take your medication today?</span>
          <div className="flex gap-3">
            <div
              className="flex-1 py-3 rounded-lg text-center text-sm"
              style={{
                fontFamily: 'var(--font-family-base)',
                fontWeight: 'var(--font-weight-medium)' as any,
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)',
              }}
            >
              ✓ Yes
            </div>
            <div
              className="flex-1 py-3 rounded-lg text-center text-sm"
              style={{
                fontFamily: 'var(--font-family-base)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-default)',
              }}
            >
              ✗ No
            </div>
          </div>
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    // Equip block previews
    case 'lesson':
      return (
        <div style={previewStyle}>
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
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'exercise':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>What is cognitive restructuring?</span>
          <div className="space-y-2">
            {['Changing thoughts', 'Physical therapy', 'Meditation only'].map((opt, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-lg text-xs"
                style={{
                  fontFamily: 'var(--font-family-base)',
                  backgroundColor: i === 0 ? 'var(--color-status-success-light)' : 'var(--color-bg-card)',
                  border: i === 0 ? '2px solid var(--color-status-success)' : '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {i === 0 ? '✓' : '○'} {opt}
              </div>
            ))}
          </div>
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'journal':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>📝 Reflect on today's lesson</span>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
            Write about a situation where you noticed automatic thoughts...
          </p>
          <div className="w-full h-16 rounded-lg" style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border-default)', padding: 'var(--spacing-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', opacity: 0.5 }}>Start writing...</span>
          </div>
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'checklist':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>☑️ Today's Self-Care Tasks</span>
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
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'reflection':
      return (
        <div style={previewStyle}>
          <div className="text-center space-y-2 py-2">
            <span className="text-2xl">💭</span>
            <span style={{ ...labelStyle, textAlign: 'center' }}>Take a moment to reflect</span>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              Think about what you've learned today. How does it relate to your own experiences?
            </p>
          </div>
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'conclude':
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
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    case 'sleep-diary':
      return (
        <div style={previewStyle}>
          <span style={labelStyle}>🌙 Sleep Diary Entry</span>
          <div className="space-y-2">
            {[
              { label: 'Bedtime', value: '10:30 PM' },
              { label: 'Wake time', value: '6:45 AM' },
              { label: 'Quality', value: '⭐⭐⭐⭐' },
            ].map((field, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{field.label}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' as any }}>{field.value}</span>
              </div>
            ))}
            <div className="w-full h-10 rounded-lg" style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border-default)', padding: 'var(--spacing-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', opacity: 0.5 }}>Notes about sleep...</span>
            </div>
          </div>
          <p style={hintStyle}>{block.previewHint}</p>
        </div>
      );

    default:
      return (
        <div style={previewStyle}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No preview available for this block type.</p>
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