import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Save,
  X,
  GripVertical,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Check,
  Smile,
  Type,
  Tag,
  List,
  SlidersHorizontal,
  ToggleLeft,
  CircleAlert,
  ArrowUp,
  ArrowDown,
  Pencil,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { apiClient } from '../../shared/api/api';
import tokens from '../ui/lib/design-tokens';
import { getScaleByKey, getAvailableScaleKeys, getContextTags, loadCustomScales, clearScaleCache } from '../ui/lib/emoji-utils';
import { AdminHeader } from '../shell/AdminHeader';
import { AdminLoading } from '../ui/kit/AdminLoading';
import { useMetadata } from '../ui/hooks/useMetadata';
import { projectId, publicAnonKey } from '../../shared/api/supabase-info';

// ── Types (matching backend) ────────────────────────────────────
interface CheckinStep {
  id: string;
  order: number;
  type: 'emoji_scale' | 'free_text' | 'multi_select' | 'single_choice' | 'slider' | 'yes_no';
  question: string;
  subtitle?: string;
  hero_emoji?: string;
  scale_key?: string;
  options?: string[];
  slider_min?: number;
  slider_max?: number;
  slider_labels?: string[];
  required: boolean;
  ema_category?: string;
  save_as?: string;
}

interface CheckinTemplate {
  id: string;
  name: string;
  description?: string;
  steps: CheckinStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ── Design token helpers ────────────────────────────────────────
const B = {
  primary: tokens.colors.primary.default,
  primaryOn: tokens.colors.primary.on,
  accent: tokens.colors.accent.default,
  success: tokens.colors.status.success,
  successLight: tokens.colors.status['success-light'],
  warning: tokens.colors.status.warning,
  warningLight: tokens.colors.status['warning-light'],
  danger: tokens.colors.status.danger,
  dangerLight: tokens.colors.status['danger-light'],
  info: tokens.colors.status.info,
  infoLight: tokens.colors.status['info-light'],
  muted: tokens.colors.text.muted,
  textPrimary: tokens.colors.text.primary,
  bgPage: tokens.colors.background.page,
  bgCard: tokens.colors.background.card,
  bgMuted: tokens.colors.background.muted,
  bgInput: tokens.colors.background.input,
  border: tokens.colors.border.default,
};

const f = (size: string, weight: number = 400, color: string = B.textPrimary) => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ── Block type metadata ─────────────────────────────────────────
const BLOCK_TYPES: { value: CheckinStep['type']; label: string; icon: any; description: string }[] = [
  { value: 'emoji_scale', label: 'Emoji Scale', icon: Smile, description: 'Pick from emoji options (mood, energy, etc.)' },
  { value: 'free_text', label: 'Free Text', icon: Type, description: 'Open-ended text input' },
  { value: 'multi_select', label: 'Multi Select', icon: Tag, description: 'Pick multiple tags/options' },
  { value: 'single_choice', label: 'Single Choice', icon: List, description: 'Pick one from a list' },
  { value: 'slider', label: 'Slider', icon: SlidersHorizontal, description: 'Numeric slider with labels' },
  { value: 'yes_no', label: 'Yes / No', icon: ToggleLeft, description: 'Simple binary question' },
];

// EMA_CATEGORIES removed — now fetched from KV via useMetadata().emaCategories
// No fallback — KV is the single source of truth
const EMOJI_PICKS = [
  '🤔', '⚡', '😌', '🌙', '💊', '🏃', '✏️', '🏷️', '😊', '🧠', '❤️',
  '🔥', '💪', '🌟', '🎯', '📊', '💭', '🍽️', '🧘', '👥', '🎵',
  '😴', '😰', '😔', '😡', '🥰', '🙂', '😢', '🥱', '💚', '🌿',
  '☀️', '🌧️', '🫁', '🚶', '🧘‍♀️', '📝', '⏰', '🎧', '📖', '🤝',
];

// ═══════════════════════════════════════════════════════════════════
// ADD NEW SCALE MODAL
// ═══════════════════════════════════════════════════════════════════
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

const DEFAULT_SCALE_ITEMS = [
  { value: 1, id: '', emoji: '😢', label: 'Very Low' },
  { value: 2, id: '', emoji: '😟', label: 'Low' },
  { value: 3, id: '', emoji: '😐', label: 'Moderate' },
  { value: 4, id: '', emoji: '😊', label: 'High' },
  { value: 5, id: '', emoji: '😄', label: 'Very High' },
];

function AddNewScaleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (key: string) => void;
}) {
  const [name, setName] = useState('');
  const [items, setItems] = useState(DEFAULT_SCALE_ITEMS.map(i => ({ ...i })));
  const [saving, setSaving] = useState(false);

  const key = slugify(name);

  const updateItem = (idx: number, field: 'emoji' | 'label', value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleCreate = async () => {
    if (!name.trim() || !key) { toast.error('Scale name is required'); return; }
    if (items.some(i => !i.label.trim())) { toast.error('All 5 labels are required'); return; }
    setSaving(true);
    try {
      const payload = items.map((item, idx) => ({
        id: `${key}_${idx + 1}`,
        value: item.value,
        order: item.value,
        emoji: item.emoji,
        label: item.label.trim(),
        is_active: true,
        color: 'var(--color-neutral-500)',
        bg: 'var(--color-neutral-100)',
      }));
      await apiClient.createCustomScale(key, name.trim(), payload);
      toast.success(`Scale "${name}" created`);
      onCreated(key);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create scale');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: B.bgCard, borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${B.border}`,
        }}>
          <span style={{ ...f('base', 600) }}>Add New Scale</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} style={{ color: B.muted }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Scale Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Motivation, Appetite"
              style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm') }}
              autoFocus
            />
            {key && (
              <span style={{ ...f('xs', 400, B.muted), marginTop: 4, display: 'block' }}>
                Key: <code style={{ fontFamily: 'monospace' }}>{key}</code>
              </span>
            )}
          </div>

          {/* 5 items */}
          <div>
            <Label style={{ ...f('xs', 500, B.muted), marginBottom: 8, display: 'block' }}>5-Point Scale (low → high)</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...f('xs', 400, B.muted), minWidth: 16, textAlign: 'center' }}>{item.value}</span>
                  <Input
                    value={item.emoji}
                    onChange={e => updateItem(idx, 'emoji', e.target.value)}
                    style={{
                      width: 52, textAlign: 'center',
                      borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`,
                      backgroundColor: B.bgInput, fontSize: '1.2rem', padding: '4px 8px',
                    }}
                  />
                  <Input
                    value={item.label}
                    onChange={e => updateItem(idx, 'label', e.target.value)}
                    placeholder={`Label for ${item.value}`}
                    style={{ flex: 1, borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm') }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: `1px solid ${B.border}`,
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <Button variant="outline" onClick={onClose} style={{ borderRadius: 'var(--radius-md)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            style={{ borderRadius: 'var(--radius-md)', backgroundColor: B.primary, color: B.primaryOn }}
          >
            {saving ? 'Creating…' : 'Create Scale'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getBlockIcon(type: CheckinStep['type']) {
  const found = BLOCK_TYPES.find(b => b.value === type);
  return found ? found.icon : CircleAlert;
}

function getBlockLabel(type: CheckinStep['type']) {
  return BLOCK_TYPES.find(b => b.value === type)?.label || type;
}

// ═══════════════════════════════════════════════════════════════════
// STEP EDITOR CARD
// ═══════════════════════════════════════════════════════════════════
function StepEditorCard({
  step,
  index,
  totalSteps,
  expanded,
  onToggleExpand,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  emaCategories,
  onAddScale,
}: {
  step: CheckinStep;
  index: number;
  totalSteps: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (updates: Partial<CheckinStep>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  emaCategories: string[];
  onAddScale?: (newKey: string) => void;
}) {
  const Icon = getBlockIcon(step.type);
  const [showAddScaleModal, setShowAddScaleModal] = useState(false);

  return (
    <div>
      <Card
        style={{
          borderRadius: 'var(--radius-lg)',
          border: `1.5px solid ${expanded ? B.primary : B.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Collapsed Header */}
        <div
          onClick={onToggleExpand}
          className="flex items-center gap-3 cursor-pointer"
          style={{ padding: '14px 16px', backgroundColor: expanded ? `color-mix(in srgb, ${B.primary} 4%, ${B.bgCard})` : B.bgCard }}
        >
          <div className="flex items-center gap-1" style={{ color: B.muted }}>
            <GripVertical size={16} />
            <span style={{ ...f('xs', 500, B.muted), minWidth: 18, textAlign: 'center' }}>{index + 1}</span>
          </div>

          <div
            className="flex items-center justify-center"
            style={{
              width: 32, height: 32, borderRadius: 'var(--radius-md)',
              backgroundColor: B.bgMuted,
            }}
          >
            {step.hero_emoji ? (
              <span style={{ fontSize: 18 }}>{step.hero_emoji}</span>
            ) : (
              <Icon size={16} style={{ color: B.muted }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span style={{ ...f('sm', 500), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {step.question || 'Untitled Step'}
              </span>
              {step.required && (
                <span style={{
                  ...f('xs', 500, B.danger),
                  padding: '1px 6px', borderRadius: 'var(--radius-pill)',
                  backgroundColor: B.dangerLight, lineHeight: 1.4,
                }}>
                  Required
                </span>
              )}
            </div>
            <span style={{ ...f('xs', 400, B.muted) }}>
              {getBlockLabel(step.type)}
              {step.scale_key ? ` · ${step.scale_key}` : ''}
              {step.ema_category ? ` · ${step.ema_category}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={e => { e.stopPropagation(); onMoveUp(); }}
              disabled={index === 0}
              style={{ padding: 4, background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}
            >
              <ArrowUp size={14} style={{ color: B.muted }} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onMoveDown(); }}
              disabled={index === totalSteps - 1}
              style={{ padding: 4, background: 'none', border: 'none', cursor: index === totalSteps - 1 ? 'default' : 'pointer', opacity: index === totalSteps - 1 ? 0.3 : 1 }}
            >
              <ArrowDown size={14} style={{ color: B.muted }} />
            </button>
            {expanded ? <ChevronUp size={16} style={{ color: B.muted }} /> : <ChevronDown size={16} style={{ color: B.muted }} />}
          </div>
        </div>

        {/* Expanded Editor */}
        {expanded && (
          <div style={{ overflow: 'hidden' }}>
            <CardContent style={{ padding: '0 16px 16px', borderTop: `1px solid ${B.border}` }}>
              <div className="space-y-4" style={{ paddingTop: 16 }}>
                {/* Row 1: Type + Scale Key */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Block Type</Label>
                    <select
                      value={step.type}
                      onChange={e => onChange({ type: e.target.value as CheckinStep['type'] })}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput,
                        ...f('sm'), cursor: 'pointer',
                      }}
                    >
                      {BLOCK_TYPES.map(bt => (
                        <option key={bt.value} value={bt.value}>{bt.label}</option>
                      ))}
                    </select>
                  </div>

                  {(step.type === 'emoji_scale' || step.type === 'multi_select') && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Label style={{ ...f('xs', 500, B.muted) }}>Scale / Source</Label>
                        {step.type === 'emoji_scale' && (
                          <button
                            onClick={() => setShowAddScaleModal(true)}
                            title="Add new scale"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              background: 'none', border: `1px solid ${B.border}`,
                              borderRadius: 'var(--radius-pill)',
                              padding: '2px 8px', cursor: 'pointer',
                              ...f('xs', 500, B.primary),
                            }}
                          >
                            <Plus size={11} />
                            New
                          </button>
                        )}
                      </div>
                      <select
                        value={step.scale_key || ''}
                        onChange={e => onChange({ scale_key: e.target.value || undefined })}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput,
                          ...f('sm'), cursor: 'pointer',
                        }}
                      >
                        <option value="">Select scale...</option>
                        {step.type === 'emoji_scale' ? (
                          getAvailableScaleKeys().map(sk => (
                            <option key={sk.value} value={sk.value}>
                              {sk.emoji} {sk.label} ({sk.count}){sk.isCustom ? ' ✦' : ''}
                            </option>
                          ))
                        ) : (
                          <option value="context_tags">Context Tags</option>
                        )}
                      </select>
                    </div>
                  )}
                  {showAddScaleModal && (
                    <AddNewScaleModal
                      onClose={() => setShowAddScaleModal(false)}
                      onCreated={(newKey) => {
                        setShowAddScaleModal(false);
                        if (onAddScale) onAddScale(newKey);
                        onChange({ scale_key: newKey });
                      }}
                    />
                  )}
                </div>

                {/* Question */}
                <div>
                  <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Question</Label>
                  <Input
                    value={step.question}
                    onChange={e => onChange({ question: e.target.value })}
                    placeholder="How are you feeling?"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${B.border}`,
                      backgroundColor: B.bgInput,
                      ...f('sm'),
                    }}
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Subtitle (optional)</Label>
                  <Input
                    value={step.subtitle || ''}
                    onChange={e => onChange({ subtitle: e.target.value || undefined })}
                    placeholder="Tap the emoji that matches your vibe"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${B.border}`,
                      backgroundColor: B.bgInput,
                      ...f('sm'),
                    }}
                  />
                </div>

                {/* Row: Emoji + EMA Category + Save As */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Hero Emoji</Label>
                    <div className="flex flex-wrap gap-1" style={{ padding: 4, borderRadius: 'var(--radius-md)', border: `1px solid ${B.border}`, backgroundColor: B.bgInput, maxHeight: 80, overflowY: 'auto' }}>
                      {EMOJI_PICKS.map(em => (
                        <button
                          key={em}
                          onClick={() => onChange({ hero_emoji: em })}
                          style={{
                            width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                            border: step.hero_emoji === em ? `2px solid ${B.primary}` : '2px solid transparent',
                            backgroundColor: step.hero_emoji === em ? B.bgMuted : 'transparent',
                            cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                    {/* Custom emoji: paste/type any emoji not in the curated list above */}
                    <Input
                      value={step.hero_emoji && !EMOJI_PICKS.includes(step.hero_emoji) ? step.hero_emoji : ''}
                      onChange={e => {
                        // Take only the first grapheme so a pasted sentence doesn't overwrite it
                        const v = Array.from(e.target.value.trim())[0] || '';
                        onChange({ hero_emoji: v || undefined });
                      }}
                      placeholder="Or paste a custom emoji"
                      maxLength={8}
                      style={{
                        marginTop: 4, borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput,
                        ...f('sm'),
                      }}
                    />
                  </div>
                  <div>
                    <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>EMA Category</Label>
                    <select
                      value={step.ema_category || ''}
                      onChange={e => onChange({ ema_category: e.target.value || undefined })}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput,
                        ...f('sm'), cursor: 'pointer',
                      }}
                    >
                      <option value="">None</option>
                      {emaCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Save As (field key)</Label>
                    <Input
                      value={step.save_as || ''}
                      onChange={e => onChange({ save_as: e.target.value || undefined })}
                      placeholder="e.g. mood_rating"
                      style={{
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${B.border}`,
                        backgroundColor: B.bgInput,
                        ...f('xs'),
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>

                {/* Single Choice options */}
                {step.type === 'single_choice' && (
                  <div>
                    <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Options (one per line)</Label>
                    <textarea
                      value={(step.options || []).join('\n')}
                      onChange={e => onChange({ options: e.target.value.split('\n').filter(Boolean) })}
                      rows={4}
                      placeholder="Not at all&#10;A little bit&#10;Moderately&#10;Quite a bit&#10;Extremely"
                      className="w-full resize-none focus:outline-none"
                      style={{
                        padding: '10px 12px', borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput,
                        ...f('sm'), lineHeight: 1.6,
                      }}
                    />
                  </div>
                )}

                {/* Slider config */}
                {step.type === 'slider' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Min</Label>
                      <Input
                        type="number"
                        value={step.slider_min ?? 0}
                        onChange={e => onChange({ slider_min: Number(e.target.value) })}
                        style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm') }}
                      />
                    </div>
                    <div>
                      <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Max</Label>
                      <Input
                        type="number"
                        value={step.slider_max ?? 10}
                        onChange={e => onChange({ slider_max: Number(e.target.value) })}
                        style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm') }}
                      />
                    </div>
                    <div>
                      <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Labels (comma-sep)</Label>
                      <Input
                        value={(step.slider_labels || []).join(', ')}
                        onChange={e => onChange({ slider_labels: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Not at all, Extremely"
                        style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('xs') }}
                      />
                    </div>
                  </div>
                )}

                {/* Required + actions */}
                <div className="flex items-center justify-between" style={{ paddingTop: 8, borderTop: `1px solid ${B.border}` }}>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={step.required}
                      onCheckedChange={v => onChange({ required: v })}
                    />
                    <span style={f('xs', 400, B.muted)}>Required</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDuplicate}
                      style={{ gap: 4, ...f('xs', 400, B.muted) }}
                    >
                      <Copy size={13} /> Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDelete}
                      style={{ gap: 4, ...f('xs', 400, B.danger) }}
                    >
                      <Trash2 size={13} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
interface AdminCheckinTemplateBuilderProps {
  onBack?: () => void;
}

export function AdminCheckinTemplateBuilder({ onBack }: AdminCheckinTemplateBuilderProps) {
  const [templates, setTemplates] = useState<CheckinTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<CheckinTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // EMA categories from KV metadata, with fallback while loading
  const { emaCategories: emaMeta } = useMetadata();
  const emaCategoryLabels = emaMeta.length > 0
    ? emaMeta.map(c => c.label)
    : [];

  // ── Fetch templates ───────────────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.getCheckinTemplates();
      const list: CheckinTemplate[] = res?.templates || [];
      setTemplates(list);
      const active = list.find(t => t.is_active) || list[0] || null;
      setActiveTemplate(active);
    } catch (error) {
      console.error('Failed to load check-in templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // Load custom scales from KV so the Scale/Source dropdown reflects
  // admin-managed overrides (not just design-token defaults)
  const [scalesLoaded, setScalesLoaded] = useState(false);
  const [scalesVersion, setScalesVersion] = useState(0);
  useEffect(() => {
    const apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
    loadCustomScales(apiBase, publicAnonKey).then(() => setScalesLoaded(true)).catch(() => setScalesLoaded(true));
  }, [scalesVersion]);

  const handleScaleCreated = useCallback((_newKey: string) => {
    const apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
    clearScaleCache();
    setScalesLoaded(false);
    loadCustomScales(apiBase, publicAnonKey).then(() => setScalesVersion(v => v + 1)).catch(() => {});
  }, []);

  // ── Template mutations ────────────────────────────────────────
  const handleSave = async () => {
    if (!activeTemplate) return;
    setSaving(true);
    try {
      // Re-order steps
      const ordered = activeTemplate.steps.map((s, i) => ({ ...s, order: i }));
      const payload = { ...activeTemplate, steps: ordered };

      if (templates.find(t => t.id === activeTemplate.id)) {
        await apiClient.updateCheckinTemplate(activeTemplate.id, payload);
      } else {
        await apiClient.createCheckinTemplate(payload);
      }
      toast.success('Template saved');
      setDirty(false);
      await fetchTemplates();
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await apiClient.activateCheckinTemplate(id);
      toast.success('Template activated');
      await fetchTemplates();
    } catch (error) {
      console.error('Activate error:', error);
      toast.error('Failed to activate template');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'default') { toast.error('Cannot delete default template'); return; }
    if (!confirm('Delete this template? This cannot be undone.')) return;
    try {
      await apiClient.deleteCheckinTemplate(id);
      toast.success('Template deleted');
      await fetchTemplates();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete template');
    }
  };

  // handleSeedDefault removed — no seed functions per project rules

  const handleNewTemplate = async () => {
    const name = prompt('Template name:', 'New Check-in');
    if (!name) return;
    try {
      const res = await apiClient.createCheckinTemplate({
        name,
        description: '',
        steps: [],
        is_active: false,
      });
      toast.success('Template created');
      await fetchTemplates();
      if (res?.template) setActiveTemplate(res.template);
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create template');
    }
  };

  // ── Step mutations ────────────────────────────────────────────
  const updateStep = (stepId: string, updates: Partial<CheckinStep>) => {
    if (!activeTemplate) return;
    setActiveTemplate({
      ...activeTemplate,
      steps: activeTemplate.steps.map(s => s.id === stepId ? { ...s, ...updates } : s),
    });
    setDirty(true);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    if (!activeTemplate) return;
    const steps = [...activeTemplate.steps];
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    [steps[index], steps[target]] = [steps[target], steps[index]];
    setActiveTemplate({ ...activeTemplate, steps: steps.map((s, i) => ({ ...s, order: i })) });
    setDirty(true);
  };

  const duplicateStep = (index: number) => {
    if (!activeTemplate) return;
    const orig = activeTemplate.steps[index];
    const dup: CheckinStep = {
      ...orig,
      id: crypto.randomUUID(),
      question: `${orig.question} (copy)`,
      order: activeTemplate.steps.length,
    };
    const steps = [...activeTemplate.steps];
    steps.splice(index + 1, 0, dup);
    setActiveTemplate({ ...activeTemplate, steps: steps.map((s, i) => ({ ...s, order: i })) });
    setDirty(true);
    setExpandedStepId(dup.id);
  };

  const deleteStep = (index: number) => {
    if (!activeTemplate) return;
    const steps = activeTemplate.steps.filter((_, i) => i !== index);
    setActiveTemplate({ ...activeTemplate, steps: steps.map((s, i) => ({ ...s, order: i })) });
    setDirty(true);
    setExpandedStepId(null);
  };

  const addStep = (type: CheckinStep['type']) => {
    if (!activeTemplate) return;
    const newStep: CheckinStep = {
      id: crypto.randomUUID(),
      order: activeTemplate.steps.length,
      type,
      question: '',
      subtitle: '',
      hero_emoji: BLOCK_TYPES.find(b => b.value === type)?.value === 'emoji_scale' ? '🤔' : '✏️',
      required: false,
      save_as: '',
    };
    if (type === 'single_choice') newStep.options = ['Option 1', 'Option 2', 'Option 3'];
    if (type === 'slider') { newStep.slider_min = 0; newStep.slider_max = 10; newStep.slider_labels = ['Low', 'High']; }
    setActiveTemplate({ ...activeTemplate, steps: [...activeTemplate.steps, newStep] });
    setDirty(true);
    setShowAddPicker(false);
    setExpandedStepId(newStep.id);
  };

  // ── Render ────────────────────────────────────────────────────
  if (loading) return <AdminLoading />;

  return (
    <div>
      <AdminHeader
        title="Check-in Builder"
        description="Configure the steps users see when logging a mood journal entry. Drag to reorder, add or remove steps."
        actions={
          <div className="flex items-center gap-2">
            {dirty && (
              <span
                style={{ ...f('xs', 500, B.warning), padding: '3px 10px', borderRadius: 'var(--radius-pill)', backgroundColor: B.warningLight }}
              >
                Unsaved changes
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              style={{ gap: 4, borderRadius: 'var(--radius-md)', ...f('xs', 500) }}
            >
              {previewMode ? <EyeOff size={14} /> : <Eye size={14} />}
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!dirty || saving}
              style={{
                gap: 4, borderRadius: 'var(--radius-md)',
                backgroundColor: B.primary, color: B.primaryOn,
                ...f('xs', 500, B.primaryOn),
                opacity: (!dirty || saving) ? 0.5 : 1,
              }}
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6" style={{ marginTop: 24 }}>
        {/* LEFT: Template selector */}
        <div className="space-y-3">
          <Card style={{ borderRadius: 'var(--radius-lg)', border: `1px solid ${B.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${B.border}`, backgroundColor: B.bgMuted }}>
              <span style={f('xs', 500, B.muted)}>Templates</span>
            </div>
            <div style={{ padding: 8 }}>
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTemplate(t); setDirty(false); setExpandedStepId(null); }}
                  className="w-full text-left flex items-center gap-2"
                  style={{
                    padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                    backgroundColor: activeTemplate?.id === t.id ? B.bgMuted : 'transparent',
                    transition: 'background-color 0.15s',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div style={{ ...f('sm', 500), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.name}
                    </div>
                    <div style={f('xs', 400, B.muted)}>
                      {t.steps.length} step{t.steps.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {t.is_active && (
                    <span style={{
                      ...f('xs', 500, B.success), padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)', backgroundColor: B.successLight,
                    }}>
                      Active
                    </span>
                  )}
                </button>
              ))}

              {templates.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center' }}>
                  <p style={f('sm', 400, B.muted)}>No templates yet</p>
                  <Button
                    size="sm"
                    onClick={handleNewTemplate}
                    style={{ marginTop: 8, gap: 4, borderRadius: 'var(--radius-md)', ...f('xs', 500) }}
                  >
                    <Plus size={13} /> Create Template
                  </Button>
                </div>
              )}
            </div>
            <div style={{ padding: '8px 8px 12px', borderTop: `1px solid ${B.border}` }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewTemplate}
                className="w-full"
                style={{ gap: 4, borderRadius: 'var(--radius-md)', ...f('xs', 500) }}
              >
                <Plus size={14} /> New Template
              </Button>
            </div>
          </Card>

          {/* Active template actions */}
          {activeTemplate && (
            <Card style={{ borderRadius: 'var(--radius-lg)', border: `1px solid ${B.border}`, padding: 12 }}>
              <div className="space-y-2">
                {!activeTemplate.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleActivate(activeTemplate.id)}
                    style={{ gap: 4, borderRadius: 'var(--radius-md)', ...f('xs', 500, B.success) }}
                  >
                    <Check size={13} /> Set as Active
                  </Button>
                )}
                {activeTemplate.id !== 'default' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDelete(activeTemplate.id)}
                    style={{ gap: 4, borderRadius: 'var(--radius-md)', ...f('xs', 500, B.danger) }}
                  >
                    <Trash2 size={13} /> Delete Template
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT: Step builder or preview */}
        <div>
          {!activeTemplate ? (
            <Card style={{ borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center' }}>
              <p style={f('base', 400, B.muted)}>Select or create a template to get started</p>
            </Card>
          ) : previewMode ? (
            <StepPreview template={activeTemplate} />
          ) : (
            <div className="space-y-4">
              {/* Template header */}
              <Card style={{ borderRadius: 'var(--radius-lg)', border: `1px solid ${B.border}`, padding: '16px 20px' }}>
                <div className="flex items-center justify-between">
                  {editingName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        autoFocus
                        value={activeTemplate.name}
                        onChange={e => { setActiveTemplate({ ...activeTemplate, name: e.target.value }); setDirty(true); }}
                        onBlur={() => setEditingName(false)}
                        onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                        style={{ ...f('lg', 500), borderRadius: 'var(--radius-md)', maxWidth: 320 }}
                      />
                      <Button variant="ghost" size="sm" onClick={() => setEditingName(false)}>
                        <Check size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditingName(true)}>
                      <h2 style={{ ...f('lg', 500), margin: 0 }}>{activeTemplate.name}</h2>
                      <Pencil size={14} style={{ color: B.muted }} />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span style={f('xs', 400, B.muted)}>
                      {activeTemplate.steps.length} step{activeTemplate.steps.length !== 1 ? 's' : ''}
                    </span>
                    {activeTemplate.is_active && (
                      <span style={{
                        ...f('xs', 500, B.success), padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)', backgroundColor: B.successLight,
                      }}>
                        Active
                      </span>
                    )}
                  </div>
                </div>
                {/* Description */}
                <Input
                  value={activeTemplate.description || ''}
                  onChange={e => { setActiveTemplate({ ...activeTemplate, description: e.target.value }); setDirty(true); }}
                  placeholder="Template description..."
                  style={{ marginTop: 8, ...f('sm', 400, B.muted), borderRadius: 'var(--radius-md)', border: `1px solid ${B.border}`, backgroundColor: B.bgInput }}
                />
              </Card>

              {/* Steps list */}
                {activeTemplate.steps.map((step, index) => (
                  <StepEditorCard
                    key={step.id}
                    step={step}
                    index={index}
                    totalSteps={activeTemplate.steps.length}
                    expanded={expandedStepId === step.id}
                    onToggleExpand={() => setExpandedStepId(expandedStepId === step.id ? null : step.id)}
                    onChange={updates => updateStep(step.id, updates)}
                    onMoveUp={() => moveStep(index, -1)}
                    onMoveDown={() => moveStep(index, 1)}
                    onDuplicate={() => duplicateStep(index)}
                    onDelete={() => deleteStep(index)}
                    emaCategories={emaCategoryLabels}
                    onAddScale={handleScaleCreated}
                  />
                ))}

              {/* Add step */}
              {showAddPicker ? (
                <div>
                  <Card style={{ borderRadius: 'var(--radius-lg)', border: `2px dashed ${B.primary}`, padding: 16 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                      <span style={f('sm', 500)}>Add a Step</span>
                      <button onClick={() => setShowAddPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={16} style={{ color: B.muted }} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BLOCK_TYPES.map(bt => {
                        const BIcon = bt.icon;
                        return (
                          <button
                            key={bt.value}
                            onClick={() => addStep(bt.value)}
                            className="flex flex-col items-center gap-2 text-center"
                            style={{
                              padding: '14px 8px', borderRadius: 'var(--radius-md)',
                              border: `1.5px solid ${B.border}`, backgroundColor: B.bgCard,
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: B.bgMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BIcon size={18} style={{ color: B.primary }} />
                            </div>
                            <span style={f('xs', 500)}>{bt.label}</span>
                            <span style={{ ...f('xs', 400, B.muted), lineHeight: 1.3 }}>{bt.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddPicker(true)}
                  className="w-full flex items-center justify-center gap-2"
                  style={{
                    padding: 16, borderRadius: 'var(--radius-lg)',
                    border: `2px dashed ${B.border}`, backgroundColor: 'transparent',
                    cursor: 'pointer',
                    ...f('sm', 500, B.muted),
                  }}
                >
                  <Plus size={16} /> Add Step
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP PREVIEW (simulates the user-facing check-in flow)
// ═══════════════════════════════════════════════════════════════════
function StepPreview({ template }: { template: CheckinTemplate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = template.steps;
  const step = steps[currentStep];

  if (!step) {
    return (
      <Card style={{ borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: B.muted }}>No steps to preview. Add some steps first.</p>
      </Card>
    );
  }

  return (
    <Card style={{ borderRadius: 'var(--radius-lg)', border: `1px solid ${B.border}`, overflow: 'hidden', maxWidth: 440, margin: '0 auto' }}>
      {/* Preview header */}
      <div style={{ padding: '12px 16px', backgroundColor: B.bgMuted, borderBottom: `1px solid ${B.border}` }}>
        <div className="flex items-center justify-between">
          <span style={{ ...f('xs', 500, B.muted) }}>Preview: {template.name}</span>
          <span style={{ ...f('xs', 400, B.muted) }}>Step {currentStep + 1} of {steps.length}</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center" style={{ padding: '16px 20px 0', gap: 6 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === currentStep ? 22 : 8,
              backgroundColor: i <= currentStep ? B.warning : B.bgMuted,
              height: 6,
              borderRadius: 3,
              transition: 'width 0.3s, background-color 0.3s',
            }}
          />
        ))}
      </div>

      {/* Step content */}
      <div style={{ padding: '24px 20px 28px', textAlign: 'center' }}>
          <div key={step.id}>
            {step.hero_emoji && (
              <span
                style={{ fontSize: 48, display: 'block', marginBottom: 8 }}
              >
                {step.hero_emoji}
              </span>
            )}
            <h2 style={{ ...f('lg', 500), margin: '0 0 4px' }}>{step.question || 'Question...'}</h2>
            {step.subtitle && <p style={{ ...f('xs', 400, B.muted), margin: '0 0 16px' }}>{step.subtitle}</p>}

            {/* Type-specific preview */}
            {step.type === 'emoji_scale' && (() => {
              const scaleItems = getScaleByKey(step.scale_key || '');
              if (scaleItems.length === 0) {
                return (
                  <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', backgroundColor: B.bgMuted, ...f('xs', 400, B.muted), textAlign: 'center' }}>
                    {step.scale_key
                      ? `No data loaded for scale "${step.scale_key}". Check Admin > Scales.`
                      : 'No scale selected. Choose a scale in the step editor.'}
                  </div>
                );
              }
              return (
                <div className="flex items-center justify-center" style={{ gap: 8 }}>
                  {scaleItems.map(opt => (
                    <div key={opt.value} style={{
                      width: 48, height: 48, borderRadius: 'var(--radius-md)',
                      backgroundColor: B.bgMuted, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24,
                    }}>
                      {opt.emoji}
                    </div>
                  ))}
                </div>
              );
            })()}

            {step.type === 'free_text' && (
              <div style={{
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${B.border}`, backgroundColor: B.bgMuted,
                textAlign: 'left', ...f('sm', 400, B.muted),
              }}>
                I felt...
              </div>
            )}

            {step.type === 'single_choice' && (
              <div className="space-y-2" style={{ maxWidth: 300, margin: '0 auto' }}>
                {(step.options || []).map((opt, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${B.border}`, backgroundColor: B.bgCard,
                    ...f('sm'),
                  }}>
                    {opt}
                  </div>
                ))}
              </div>
            )}

            {step.type === 'multi_select' && (() => {
              const tags = step.scale_key === 'context_tags'
                ? getContextTags().slice(0, 6)
                : (step.options || []).map(o => ({ label: o, emoji: '✨' }));
              if (tags.length === 0) {
                return (
                  <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', backgroundColor: B.bgMuted, ...f('xs', 400, B.muted), textAlign: 'center' }}>
                    {step.scale_key === 'context_tags'
                      ? 'No context tags loaded. Check Admin > Scales.'
                      : 'No options defined. Add options in the step editor.'}
                  </div>
                );
              }
              return (
                <div className="flex flex-wrap justify-center" style={{ gap: 8 }}>
                  {tags.map((tag: any) => (
                    <span key={tag.label} style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                      border: `1.5px solid ${B.border}`, ...f('xs', 500),
                    }}>
                      {tag.emoji} {tag.label}
                    </span>
                  ))}
                </div>
              );
            })()}

            {step.type === 'slider' && (
              <div style={{ maxWidth: 300, margin: '0 auto' }}>
                <input type="range" min={step.slider_min ?? 0} max={step.slider_max ?? 10} className="w-full" disabled />
                <div className="flex justify-between" style={{ marginTop: 4 }}>
                  {(step.slider_labels || []).map((l, i) => (
                    <span key={i} style={f('xs', 400, B.muted)}>{l}</span>
                  ))}
                </div>
              </div>
            )}

            {step.type === 'yes_no' && (
              <div className="flex items-center justify-center" style={{ gap: 12 }}>
                {['Yes', 'No'].map(opt => (
                  <div key={opt} style={{
                    padding: '10px 28px', borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${B.border}`, backgroundColor: B.bgCard,
                    ...f('sm', 500), cursor: 'pointer',
                  }}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-center gap-3" style={{ marginTop: 24 }}>
          <Button
            variant="outline"
            size="sm"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(s => s - 1)}
            style={{ borderRadius: 'var(--radius-md)', ...f('xs', 500), opacity: currentStep === 0 ? 0.4 : 1 }}
          >
            Back
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentStep(s => Math.min(s + 1, steps.length - 1))}
            disabled={currentStep === steps.length - 1}
            style={{
              borderRadius: 'var(--radius-md)', backgroundColor: B.primary,
              color: B.primaryOn, ...f('xs', 500, B.primaryOn),
              opacity: currentStep === steps.length - 1 ? 0.4 : 1,
            }}
          >
            {currentStep === steps.length - 1 ? 'Done' : 'Next'}
          </Button>
        </div>
      </div>
    </Card>
  );
}