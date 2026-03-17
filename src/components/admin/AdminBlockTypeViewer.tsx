import React, { useState } from 'react';
import {
  BookOpen, PenTool, MessageCircle, CheckSquare, Lightbulb, Target,
  Smile, Type, Tag, List, SlidersHorizontal, ToggleLeft,
  Eye, Layers, Moon, Calendar, Beaker, GraduationCap, Wrench, BarChart3, Repeat,
  Monitor, Smartphone, Settings2, GripVertical, ChevronDown, Image as ImageIcon,
  Zap, PlayCircle, CircleDot, ListChecks, Star, Table2, Grid3x3, ClipboardList, Flag, PenLine, Upload,
} from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AdminStatusBadge } from './AdminStatusBadge';
import { INTERACTION_META, type InteractionType } from '../../lib/equip-admin-types';
import { useMetadata } from '../../hooks/useMetadata';
// Template building blocks shared with actual editors (EquipBlockEditor, CheckinTemplateBuilder)
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
} from './AdminBlockFormTemplate';

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
  allowedBlocks: string[];
  blockedComponents: string[];
  autoConfig: string;
  stepGroupRules: string;
  playerLayout: string;
  playerProgress: string;
  warnings: string[];
  errors?: string[];
}

const CHECKIN_BLOCK_TYPES: BlockTypeInfo[] = [
  {
    value: 'emoji_scale',
    label: 'Emoji Scale',
    icon: Smile,
    description: 'User picks from emoji options representing mood, energy, etc.',
    category: 'checkin',
    fields: ['question', 'subtitle', 'hero_emoji', 'scale_key', 'ema_category', 'save_as'],
    previewHint: 'Displays a row of emoji faces (e.g. 😢 😐 🙂 😊 🤩) with labels',
  },
  {
    value: 'free_text',
    label: 'Free Text',
    icon: Type,
    description: 'Open-ended text input for journaling or notes.',
    category: 'checkin',
    fields: ['question', 'subtitle', 'hero_emoji', 'ema_category', 'save_as'],
    previewHint: 'Multi-line textarea for free-form responses',
  },
  {
    value: 'multi_select',
    label: 'Multi Select',
    icon: Tag,
    description: 'User picks multiple tags/options from a set.',
    category: 'checkin',
    fields: ['question', 'subtitle', 'hero_emoji', 'options', 'ema_category', 'save_as'],
    previewHint: 'Chip/tag grid where multiple items can be selected',
  },
  {
    value: 'single_choice',
    label: 'Single Choice',
    icon: List,
    description: 'User picks one option from a list.',
    category: 'checkin',
    fields: ['question', 'subtitle', 'hero_emoji', 'options', 'ema_category', 'save_as'],
    previewHint: 'Radio button list — only one option can be selected',
  },
  {
    value: 'slider',
    label: 'Slider',
    icon: SlidersHorizontal,
    description: 'Numeric slider with min/max values and labels.',
    category: 'checkin',
    fields: ['question', 'subtitle', 'hero_emoji', 'slider_min', 'slider_max', 'slider_labels', 'ema_category', 'save_as'],
    previewHint: 'Horizontal slider with numeric range and endpoint labels',
  },
  {
    value: 'yes_no',
    label: 'Yes / No',
    icon: ToggleLeft,
    description: 'Simple binary question — yes or no.',
    category: 'checkin',
    fields: ['question', 'subtitle', 'hero_emoji', 'ema_category', 'save_as'],
    previewHint: 'Two large toggle buttons: Yes and No',
  },
];

const EQUIP_BLOCK_TYPES: BlockTypeInfo[] = [
  {
    value: 'lesson',
    label: 'Lesson (Read)',
    icon: BookOpen,
    description: 'Rich text content block for educational material, articles, and explanations.',
    category: 'equip',
    fields: ['title', 'subtitle', 'content (rich text)', 'image_url', 'video_url'],
    previewHint: 'Formatted prose with optional media — the primary learning block',
  },
  {
    value: 'exercise',
    label: 'Exercise (Interact)',
    icon: PenTool,
    description: 'Interactive block with MCQ, multi-select, text input, matching, or fill-in-the-blank.',
    category: 'equip',
    fields: ['title', 'subtitle', 'exerciseConfig (type, options, correctAnswer, scoring)'],
    previewHint: 'Quiz-style interaction with scoring support and feedback',
  },
  {
    value: 'journal',
    label: 'Journal (Write)',
    icon: MessageCircle,
    description: 'Guided journaling prompt for therapeutic reflection and self-expression.',
    category: 'equip',
    fields: ['title', 'subtitle', 'content (prompt)', 'image_url'],
    previewHint: 'Prompt text followed by a large textarea for writing',
  },
  {
    value: 'checklist',
    label: 'Checklist (Track)',
    icon: CheckSquare,
    description: 'Trackable list of items to complete — for habits, exercises, or daily tasks.',
    category: 'equip',
    fields: ['title', 'subtitle', 'exerciseConfig.options (checklist items)'],
    previewHint: 'List of checkboxes that users tick off as they complete',
  },
  {
    value: 'reflection',
    label: 'Reflection (Think)',
    icon: Lightbulb,
    description: 'Guided reflection with prompt text for deeper thinking and mindfulness.',
    category: 'equip',
    fields: ['title', 'subtitle', 'content (reflection prompt)', 'image_url'],
    previewHint: 'Meditative prompt with optional image and text response area',
  },
  {
    value: 'conclude',
    label: 'Conclude (Finish)',
    icon: Target,
    description: 'Day-ending summary block with takeaways, affirmations, or next steps.',
    category: 'equip',
    fields: ['title', 'subtitle', 'content (closing text)'],
    previewHint: 'Summary card with motivational closing content',
  },
  {
    value: 'sleep-diary',
    label: 'Sleep Diary (Track)',
    icon: Moon,
    description: 'Sleep tracking diary entry for recording bedtime, wake time, quality, and sleep hygiene notes.',
    category: 'equip',
    fields: ['title', 'subtitle', 'content (instructions)', 'image_url'],
    previewHint: 'Form-like entry capturing sleep metrics and quality data',
  },
];

interface AdminBlockTypeViewerProps {
  onBack?: () => void;
}

// ── Interaction icon map ────────────────────────────────────────
const INTERACTION_ICON_MAP: Record<InteractionType, any> = {
  'read': BookOpen, 'watch': PlayCircle, 'select-one': CircleDot, 'select-many': CheckSquare,
  'write': PenLine, 'rate': Star, 'check': ListChecks, 'track-table': Table2,
  'input-table': Grid3x3, 'clinical': ClipboardList, 'upload': Upload, 'complete': Flag,
};

// ── Legacy mapping table (for reference) ────────────────────────
const LEGACY_MAPPING: { legacy: string; interaction: InteractionType; note: string }[] = [
  { legacy: 'type: lesson', interaction: 'read', note: 'Direct map' },
  { legacy: 'type: conclude', interaction: 'complete', note: 'Direct map' },
  { legacy: 'type: journal / reflection', interaction: 'write', note: 'Unless has options → select-one' },
  { legacy: 'type: checklist', interaction: 'check', note: 'Direct map' },
  { legacy: 'type: sleep-diary', interaction: 'track-table', note: 'Specialized tracker' },
  { legacy: 'subtype: mcq / single-select', interaction: 'select-one', note: 'Pick one' },
  { legacy: 'subtype: multi-select', interaction: 'select-many', note: 'Pick many' },
  { legacy: 'subtype: table', interaction: 'track-table', note: 'Yes/No grid' },
  { legacy: 'subtype: input-table / comparison_matrix', interaction: 'input-table', note: 'Data entry grid' },
  { legacy: 'subtype: structured-list', interaction: 'check', note: 'Ordered checklist' },
  { legacy: 'subtype: rating_scale / likert', interaction: 'rate', note: 'Number scale' },
  { legacy: 'subtype: clinical_instrument', interaction: 'clinical', note: 'Scored Likert' },
  { legacy: 'subtype: ephemeral-journal', interaction: 'write', note: 'Unless has options → select-one' },
  { legacy: 'subtype: upload', interaction: 'upload', note: 'File upload block (new)' },
];

export function AdminBlockTypeViewer({ onBack }: AdminBlockTypeViewerProps) {
  const [activeTab, setActiveTab] = useState<'checkin' | 'equip' | 'subtypes' | 'dayconfig' | 'interactions'>('interactions');
  const [selectedBlock, setSelectedBlock] = useState<BlockTypeInfo | null>(null);
  const { blockTypes: kvBlockTypes, exerciseSubtypes: kvExerciseSubtypes, dayConfigTypes: kvDayConfigTypes, interactionTypes: kvInteractionTypes } = useMetadata();

  const blocks = activeTab === 'checkin' ? CHECKIN_BLOCK_TYPES : activeTab === 'equip' ? EQUIP_BLOCK_TYPES : [];

  // Exercise subtypes — source of truth: EquipBlockEditor.tsx dropdown (8 selectable)
  // + BlockRenderer.tsx (handles aliases) + day-presets.ts (ephemeral-journal via presets)
  const EXERCISE_SUBTYPES = [
    { value: 'mcq', label: 'Multiple Choice Question', description: 'Standard MCQ with single correct answer and scoring support. Selectable in editor.', selectable: true },
    { value: 'single-select', label: 'Single Select List', description: 'Pick one option from a vertical list (no scoring). Selectable in editor.', selectable: true },
    { value: 'multi-select', label: 'Multi Select List', description: 'Pick multiple options from a vertical list. Selectable in editor.', selectable: true },
    { value: 'table', label: 'Checklist Table (Yes/No)', description: 'Grid of items with yes/no toggle per row. Selectable in editor.', selectable: true },
    { value: 'input-table', label: 'Input Table (Data Entry)', description: 'Grid with text input cells for structured data capture. Selectable in editor.', selectable: true },
    { value: 'structured-list', label: 'Structured List', description: 'Ordered list items with user input. Selectable in editor.', selectable: true },
    { value: 'rating_scale', label: 'Rating Scale', description: 'Numeric rating scale (1–5, 1–10) used in assessment-lite, tracker, and reflection presets. Selectable in editor.', selectable: true },
    { value: 'clinical_instrument', label: 'Clinical Instrument (GAD-7, PHQ-9)', description: 'Validated instruments with scored Likert scales, questions array, and scale config. Selectable in editor.', selectable: true },
    { value: 'upload', label: 'File Upload', description: 'User uploads a file (document, image, audio). Configurable accepted types and max size. Stored in Supabase Storage. Selectable in editor.', selectable: true },
    { value: 'ephemeral-journal', label: 'Ephemeral Journal', description: 'Session-scoped journal not persisted long-term. Auto-set via "practice" day preset on journal blocks — not in editor dropdown.', selectable: false },
    { value: 'likert', label: 'Likert (alias)', description: 'BlockRenderer alias — rendered identically to rating_scale. Not in editor dropdown.', selectable: false },
    { value: 'comparison_matrix', label: 'Comparison Matrix (alias)', description: 'BlockRenderer alias — rendered identically to input-table. Referenced in workshop allowedBlocks. Not in editor dropdown.', selectable: false },
  ];

  // Day config presets — sourced from /components/admin/day-presets.ts (DAY_TYPE_PRESETS)
  // and /components/player/ProgramPlayer.tsx (DAY_TYPE_CONFIG for layout/progress)
  const DAY_CONFIG_PRESETS: DayConfigPresetInfo[] = [
    {
      value: 'assessment', label: 'Assessment',
      description: 'Baseline measurement, severity scoring, recommendations.',
      allowedBlocks: ['mcq_single', 'mcq_multi', 'rating_scale', 'likert', 'boolean', 'short_text'],
      blockedComponents: ['journal', 'table', 'checklist', 'rich_lesson'],
      autoConfig: 'autoAdvance: true, navigationBack: false, scoringEnabled: true',
      stepGroupRules: 'Not allowed; one block per step',
      playerLayout: 'centered', playerProgress: 'steps',
      warnings: ['Assessments should be fast. Long inputs reduce completion.'],
    },
    {
      value: 'assessment-lite', label: 'Assessment Lite',
      description: 'Awareness, reflection, non-scored check-ins.',
      allowedBlocks: ['mcq_single', 'mcq_multi', 'rating_scale', 'short_text', 'lesson'],
      blockedComponents: [],
      autoConfig: 'autoAdvance: true, navigationBack: true, scoringEnabled: false',
      stepGroupRules: 'Allowed, not required; max 2 blocks per step',
      playerLayout: 'card', playerProgress: 'percentage',
      warnings: [],
    },
    {
      value: 'learning', label: 'Learning',
      description: 'Concept introduction and understanding.',
      allowedBlocks: ['lesson', 'media', 'mcq_single', 'callout', 'short_text'],
      blockedComponents: [],
      autoConfig: 'autoAdvance: false, navigationBack: true',
      stepGroupRules: 'Allowed & required; one step per lesson',
      playerLayout: 'scrollable', playerProgress: 'percentage',
      warnings: ['Learning days must include at least one interaction.'],
    },
    {
      value: 'practice', label: 'Practice',
      description: 'User data capture, reflection, application.',
      allowedBlocks: ['journal', 'long_text', 'table_input', 'checklist', 'date_time', 'lesson'],
      blockedComponents: [],
      autoConfig: 'autoAdvance: false, navigationBack: true, saveOnExit: true',
      stepGroupRules: 'Allowed, not required',
      playerLayout: 'scrollable', playerProgress: 'percentage',
      warnings: ['Clearly state whether responses are stored or private.'],
    },
    {
      value: 'workshop', label: 'Workshop',
      description: 'Multi-step thinking (ideation, evaluation, rituals).',
      allowedBlocks: ['lesson', 'mcq_multi', 'rtf_list', 'table_input', 'comparison_matrix'],
      blockedComponents: [],
      autoConfig: 'autoAdvance: false, navigationBack: true',
      stepGroupRules: 'Allowed & required; max 3 blocks per step',
      playerLayout: 'step-focus', playerProgress: 'steps',
      warnings: [],
      errors: ['Workshop day without StepGroups', '>3 blocks in a StepGroup', 'Mixed intent blocks in same StepGroup'],
    },
    {
      value: 'tracker', label: 'Tracker',
      description: 'Daily repetition, habits, streaks.',
      allowedBlocks: ['checklist', 'rating_scale', 'boolean', 'journal_short'],
      blockedComponents: [],
      autoConfig: 'autoAdvance: false, saveOnToggle: true',
      stepGroupRules: 'Not allowed',
      playerLayout: 'compact (single page)', playerProgress: 'none',
      warnings: ['Trackers should stay identical across days.'],
    },
    {
      value: 'reflection', label: 'Reflection',
      description: 'Closure, sense-making, review.',
      allowedBlocks: ['summary', 'rating_scale', 'journal', 'table_review'],
      blockedComponents: [],
      autoConfig: 'autoAdvance: false, navigationBack: false',
      stepGroupRules: 'Not allowed',
      playerLayout: 'scrollable', playerProgress: 'none',
      warnings: [],
    },
  ];

  const interactionTypes = Object.keys(INTERACTION_META) as InteractionType[];

  const stats = [
    {
      label: 'Interaction Types',
      value: `${interactionTypes.length}${kvInteractionTypes.length ? ` / ${kvInteractionTypes.length} in KV` : ''}`,
      icon: <Zap className="w-4 h-4" style={{ color: 'var(--color-status-danger)' }} />,
    },
    {
      label: 'Equip Block Types',
      value: `${EQUIP_BLOCK_TYPES.length}${kvBlockTypes.length ? ` / ${kvBlockTypes.length} in KV` : ''}`,
      icon: <BookOpen className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />,
    },
    {
      label: 'Check-in Block Types',
      value: CHECKIN_BLOCK_TYPES.length,
      icon: <Smile className="w-4 h-4" style={{ color: 'var(--color-status-info)' }} />,
    },
    {
      label: 'Exercise Subtypes',
      value: `${EXERCISE_SUBTYPES.length}${kvExerciseSubtypes.length ? ` / ${kvExerciseSubtypes.length} in KV` : ''}`,
      icon: <PenTool className="w-4 h-4" style={{ color: 'var(--color-status-warning)' }} />,
    },
    {
      label: 'Day Config Presets',
      value: `${DAY_CONFIG_PRESETS.length}${kvDayConfigTypes.length ? ` / ${kvDayConfigTypes.length} in KV` : ''}`,
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

      {/* Tab Switcher */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === 'interactions' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('interactions'); setSelectedBlock(null); }}
          className="gap-2"
          style={activeTab === 'interactions' ? { backgroundColor: 'var(--color-status-danger)', color: 'var(--color-primary-on)' } : undefined}
        >
          <Zap className="w-4 h-4" /> Interactions ({interactionTypes.length})
        </Button>
        <Button
          variant={activeTab === 'equip' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('equip'); setSelectedBlock(null); }}
          className="gap-2"
          style={activeTab === 'equip' ? { backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' } : undefined}
        >
          <BookOpen className="w-4 h-4" /> Equip Blocks ({EQUIP_BLOCK_TYPES.length})
        </Button>
        <Button
          variant={activeTab === 'checkin' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('checkin'); setSelectedBlock(null); }}
          className="gap-2"
          style={activeTab === 'checkin' ? { backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' } : undefined}
        >
          <Smile className="w-4 h-4" /> Check-in Blocks ({CHECKIN_BLOCK_TYPES.length})
        </Button>
        <Button
          variant={activeTab === 'subtypes' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('subtypes'); setSelectedBlock(null); }}
          className="gap-2"
          style={activeTab === 'subtypes' ? { backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' } : undefined}
        >
          <PenTool className="w-4 h-4" /> Exercise Subtypes ({EXERCISE_SUBTYPES.length})
        </Button>
        <Button
          variant={activeTab === 'dayconfig' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('dayconfig'); setSelectedBlock(null); }}
          className="gap-2"
          style={activeTab === 'dayconfig' ? { backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' } : undefined}
        >
          <Calendar className="w-4 h-4" /> Day Config Presets ({DAY_CONFIG_PRESETS.length})
        </Button>
      </div>

      {/* Unified Interactions Tab */}
      {activeTab === 'interactions' && (
        <div className="space-y-6">
          <div style={{ padding: '16px 20px', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
            <h3 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 500, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', marginBottom: 8 }}>
              Unified Interaction Taxonomy
            </h3>
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 0 }}>
              Every block is an <span style={{ fontWeight: 'var(--font-weight-medium)' }}>interaction</span>. The <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: 4 }}>interaction</code> field on Activity replaces the split between <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: 4 }}>type</code> + <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: 4 }}>exerciseConfig.subtype</code>. Old programs are auto-mapped via <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: 4 }}>resolveInteraction()</code>.
            </p>
          </div>

          {/* Interaction type cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interactionTypes.map((key) => {
              const meta = INTERACTION_META[key];
              const IconComp = INTERACTION_ICON_MAP[key] || Zap;
              return (
                <Card key={key} style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                        <IconComp className="w-5 h-5" style={{ color: 'var(--color-primary-default)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 500, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                            {meta.label}
                          </h4>
                          <AdminStatusBadge status="neutral" label={key} />
                          <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-status-info)', backgroundColor: 'var(--color-status-info-light)', padding: '1px 6px', borderRadius: 'var(--radius-pill)' }}>
                            {meta.verb}
                          </span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                          {meta.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Legacy mapping table */}
          <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}>
              <h4 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 500, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: 0 }}>
                Legacy → Interaction Mapping
              </h4>
              <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                How old type + subtype values are resolved at runtime
              </p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Legacy Field</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>→ Interaction</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {LEGACY_MAPPING.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                      <td style={{ padding: '6px 12px' }}>
                        <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: 4 }}>{row.legacy}</code>
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <AdminStatusBadge status="published" label={row.interaction} />
                      </td>
                      <td style={{ padding: '6px 12px', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Subtypes Tab */}
      {activeTab === 'subtypes' && (
        <div className="space-y-3">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
            Exercise subtypes define the interaction style inside an Exercise block. Source of truth: <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: '4px' }}>EquipBlockEditor.tsx</code> dropdown (8 selectable), <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: '4px' }}>BlockRenderer.tsx</code> (aliases), <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: '4px' }}>day-presets.ts</code> (preset-only).
          </p>
          {EXERCISE_SUBTYPES.map((st) => (
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
      {activeTab === 'dayconfig' && (
        <div className="space-y-4">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
            Day config presets define the structure and rules for each day type in an Equip program. Source of truth: <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: '4px' }}>day-presets.ts</code> (DAY_TYPE_PRESETS) and <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 4px', borderRadius: '4px' }}>ProgramPlayer.tsx</code> (DAY_TYPE_CONFIG for player layout/progress).
          </p>
          {DAY_CONFIG_PRESETS.map((preset) => (
            <Card key={preset.value} style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <Calendar className="w-5 h-5" style={{ color: 'var(--color-status-success)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                        {preset.label}
                      </h4>
                      <AdminStatusBadge status="neutral" label={preset.value} />
                    </div>
                    <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                      {preset.description}
                    </p>
                  </div>
                </div>

                {/* Detail grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                  {/* Allowed Blocks */}
                  <div>
                    <span style={{ fontFamily: 'var(--font-family-base)', fontSize: '10px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                      Allowed Blocks
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {preset.allowedBlocks.map((b) => (
                        <span key={b} className="px-1.5 py-0.5 rounded" style={{ fontSize: '10px', fontFamily: 'monospace', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-default)' }}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Blocked Components */}
                  {preset.blockedComponents.length > 0 && (
                    <div>
                      <span style={{ fontFamily: 'var(--font-family-base)', fontSize: '10px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-status-danger)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                        Blocked
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {preset.blockedComponents.map((b) => (
                          <span key={b} className="px-1.5 py-0.5 rounded" style={{ fontSize: '10px', fontFamily: 'monospace', backgroundColor: 'var(--color-danger-light, #FEE2E2)', color: 'var(--color-status-danger)', border: '1px solid var(--color-status-danger)' }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Auto Config */}
                  <div>
                    <span style={{ fontFamily: 'var(--font-family-base)', fontSize: '10px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                      Auto Config
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                      {preset.autoConfig}
                    </span>
                  </div>

                  {/* Step Group Rules */}
                  <div>
                    <span style={{ fontFamily: 'var(--font-family-base)', fontSize: '10px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                      Step Groups
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {preset.stepGroupRules}
                    </span>
                  </div>

                  {/* Player Layout */}
                  <div>
                    <span style={{ fontFamily: 'var(--font-family-base)', fontSize: '10px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                      Player Layout
                    </span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: '10px', fontFamily: 'monospace', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)' }}>
                      {preset.playerLayout}
                    </span>
                    <span className="px-1.5 py-0.5 rounded ml-1" style={{ fontSize: '10px', fontFamily: 'monospace', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)' }}>
                      progress: {preset.playerProgress}
                    </span>
                  </div>
                </div>

                {/* Warnings & Errors */}
                {(preset.warnings.length > 0 || (preset.errors && preset.errors.length > 0)) && (
                  <div className="space-y-1 pt-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                    {preset.warnings.map((w, i) => (
                      <p key={`w-${i}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-status-warning)', fontFamily: 'var(--font-family-base)' }}>
                        ⚠ {w}
                      </p>
                    ))}
                    {preset.errors?.map((e, i) => (
                      <p key={`e-${i}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-status-danger)', fontFamily: 'var(--font-family-base)' }}>
                        ✕ {e}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Block Type Grid for equip/checkin tabs */}
      {(activeTab === 'equip' || activeTab === 'checkin') && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block Type List */}
        <div className="lg:col-span-2 space-y-3">
          {blocks.map((block) => {
            const Icon = block.icon;
            const isSelected = selectedBlock?.value === block.value;
            return (
              <Card
                key={block.value}
                className="cursor-pointer transition-all"
                style={{
                  border: isSelected ? '2px solid var(--color-primary-default)' : '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-lg)',
                }}
                onClick={() => setSelectedBlock(block)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--color-bg-muted)' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: 'var(--color-primary-default)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          style={{
                            fontFamily: 'var(--font-family-base)',
                            fontWeight: 'var(--font-weight-medium)',
                            fontSize: 'var(--text-base)',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {block.label}
                        </h4>
                        <AdminStatusBadge status="neutral" label={block.value} />
                      </div>
                      <p
                        style={{
                          fontFamily: 'var(--font-family-base)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-muted)',
                          lineHeight: '1.5',
                        }}
                      >
                        {block.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0 gap-1" onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); }}>
                      <Eye className="w-4 h-4" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detail / Preview Panel */}
        <div className="lg:col-span-1">
          {selectedBlock ? (
            <BlockDetailPanel block={selectedBlock} />
          ) : (
            <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border-default)' }}>
              <CardContent className="p-8 text-center">
                <Layers className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Select a block type to see its details, fields, and preview
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      )}
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
        {/* Equip editor header — matches EquipBlockEditor card header */}
        <BlockHeaderBar
          icon={<Icon size={12} style={{ color: 'var(--color-primary-default)' }} />}
          typeBadge={block.value}
          title={`Sample ${block.label}`}
        />
        <div style={blockFormStyles.body}>
          {/* Title + Type row — matches EquipBlockEditor grid */}
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

          {/* Content / Prompt — matches EquipBlockEditor content section */}
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

          {/* Exercise config — matches EquipBlockEditor exercise section */}
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

          {/* Checklist items — matches EquipBlockEditor checklist section */}
          {block.value === 'checklist' && (
            <div>
              <FieldLabel>Checklist Items (One per line)</FieldLabel>
              <MockTextarea>Brush teeth{'\n'}Read book{'\n'}Turn off phone</MockTextarea>
            </div>
          )}

          {/* Wizard Flow — matches EquipBlockEditor autoAdvance / required */}
          <SectionDivider label="Wizard Flow" icon={<Layers size={10} style={{ color: 'var(--color-primary-default)' }} />} />
          <FieldGrid>
            <MockCheckbox label="Auto-Advance" checked />
            <MockCheckbox label="Required" />
          </FieldGrid>

          {/* Media — matches EquipBlockEditor image_url section */}
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