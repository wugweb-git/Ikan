import React, { useState, useMemo } from 'react';
import {
  BookOpen, PenTool, MessageCircle, CheckSquare, Lightbulb, Target,
  Smile, Type, Tag, List, SlidersHorizontal, ToggleLeft,
  Eye, Layers, Moon, Calendar, Beaker, GraduationCap, Wrench, BarChart3, Repeat,
  Monitor, Smartphone, Settings2, GripVertical, ChevronDown, Image as ImageIcon,
  Zap, PlayCircle, CircleDot, ListChecks, Star, Table2, Grid3x3, ClipboardList, Flag, PenLine, Upload,
  Hash,
} from 'lucide-react';
import { AdminHeader } from '../admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../admin/AdminStatusBadge';
import {
  INTERACTION_META, resolveInteraction,
  EXERCISE_SUBTYPES as CANONICAL_SUBTYPES, SUBTYPE_ALIASES,
  type InteractionType, type Activity, type DayType,
} from '../../lib/blocks/block-model';
import { DAY_TYPE_PRESETS } from '../../lib/blocks/block-type-rules';
import { DAY_TYPE_CONFIG } from '../player/ProgramPlayer';
import { useMetadata, isContainerRow } from '../../hooks/useMetadata';
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
    ...(subtype ? { exerciseConfig: { subtype: subtype as never } } : {}),
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

export function AdminBlockTypeViewer({ onBack }: AdminBlockTypeViewerProps) {
  // Five tabs became two (blocks.md §18 Phase 4.1). Retired: Interactions (it
  // IS the activity list), Check-in Blocks (its catalog bucket has no reader),
  // Day Config Presets (merged into block_type by Phase 1.1), and the
  // Legacy → Interaction mapping (kept only until the backfill; the retype
  // completed it, so the alias table is now history rather than a live map).
  const [activeTab, setActiveTab] = useState<'blocktypes' | 'activities'>('blocktypes');
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
      label: 'Block Types',
      value: `${kvBlockTypes.length} · ${containerBlockTypes.length} stages · ${pickableBlockTypes.length} blocks`,
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

      {/* Tab Switcher — two tabs. See the note on `activeTab` above. */}
      <div className="flex gap-2 flex-wrap">
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
      {activeTab === 'blocktypes' && (
        <div className="space-y-3">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            One merged vocabulary. A row that <strong>holds</strong> block types is a stage and
            carries preset rules; a row that holds nothing is a block. That is the whole distinction —
            <code style={{ fontSize: 'var(--text-xs)' }}> can_hold </code> non-empty ⟺ it has a preset.
          </p>
          {['container', 'leaf'].map((kind) => {
            const rows = kvBlockTypes.filter((r) => (kind === 'container') === isContainerRow(r));
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
          {['lesson', 'journal', 'reflection', 'conclude', 'sleep-diary'].includes(block.value) && (
            <div>
              <FieldLabel>
                {block.value === 'lesson' || block.value === 'conclude' ? 'Content'
                  : block.value === 'sleep-diary' ? 'Sleep Diary Instructions'
                  : 'Prompt / Instructions'}
              </FieldLabel>
              <MockTextarea height="56px">
                <span style={{ opacity: 0.5 }}>
                  {block.value === 'lesson' ? 'Write educational content...'
                    : block.value === 'sleep-diary' ? 'Instructions for the sleep diary entry...'
                    : 'Write the prompt for the user...'}
                </span>
              </MockTextarea>
            </div>
          )}

          {/* Exercise config — matches BlockEditor exercise section */}
          {block.value === 'exercise' && (
            <IndentedSection>
              <div>
                <FieldLabel>Interaction Type</FieldLabel>
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