import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, Zap, Brain, Tag,
  GripVertical, Moon, Flame, Heart, Smile, AlertCircle,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { toast } from 'sonner@2.0.3';
import { AdminHeader } from './AdminHeader';
import { AdminLoading } from './AdminLoading';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { supabase } from '../../lib/supabase-client';

// ── Types ──────────────────────────────────────────────────────────
interface ScaleItem {
  id: string;
  emoji: string;
  label: string;
  value: number;
  order: number;
  severity?: string;
  is_active: boolean;
}

interface ScaleType {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
  endpoint: string;
}

interface AdminCheckinScalesManagerProps {
  onBack?: () => void;
}

// ── Scale types config ─────────────────────────────────────────────
const SCALE_TYPES: ScaleType[] = [
  { key: 'energy', label: 'Energy', icon: Zap, description: 'Energy level assessment scale', endpoint: '/scales/energy' },
  { key: 'stress', label: 'Stress', icon: Flame, description: 'Stress level tracking scale', endpoint: '/scales/stress' },
  { key: 'sleep', label: 'Sleep', icon: Moon, description: 'Sleep quality assessment scale', endpoint: '/scales/sleep' },
  { key: 'pain', label: 'Pain', icon: Heart, description: 'Pain severity tracking scale', endpoint: '/scales/pain' },
  { key: 'context-tags', label: 'Context Tags', icon: Tag, description: 'Contextual tags for check-ins', endpoint: '/scales/context-tags' },
];

const SEVERITY_OPTIONS = [
  { value: 'very-low', label: 'Very Low', color: '#EF4444' },
  { value: 'low', label: 'Low', color: '#F97316' },
  { value: 'neutral', label: 'Neutral', color: '#EAB308' },
  { value: 'high', label: 'High', color: '#22C55E' },
  { value: 'very-high', label: 'Very High', color: '#10B981' },
];

const EMOJI_PICKS = [
  '😴', '🥱', '😐', '🙂', '😊', '😃', '🔥',
  '😰', '😤', '😌', '🧘', '💤', '🌙', '⚡',
  '💪', '🏃', '🎯', '❤️', '💔', '😖', '🤕',
  '🏷️', '📌', '🏠', '💼', '🎵', '🍽️', '👥',
];

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;

// ── Helpers ────────────────────────────────────────────────────────
const f = (size?: string, weight?: number | string, color?: string) => ({
  fontFamily: 'var(--font-family-base)',
  ...(size && { fontSize: `var(--text-${size})` }),
  ...(weight && { fontWeight: typeof weight === 'number' ? weight : `var(--font-weight-${weight})` }),
  ...(color && { color }),
});

const makeId = () => `scale-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// ── Helper to get auth token ─────────────────────────────────────
const getAuthToken = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || publicAnonKey;
};

// ════════════════════════════════════════════════════════════════════
export function AdminCheckinScalesManager({ onBack: _onBack }: AdminCheckinScalesManagerProps) {
  const [activeScale, setActiveScale] = useState<string>('energy');
  const [items, setItems] = useState<ScaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ScaleItem>>({
    emoji: '😐',
    label: '',
    value: 0,
    order: 0,
    severity: 'neutral',
    is_active: true,
  });

  const scaleConfig = SCALE_TYPES.find(s => s.key === activeScale)!;

  // ── Load scale data ─────────────────────────────────────────────
  const loadScale = async (scaleKey?: string) => {
    const config = SCALE_TYPES.find(s => s.key === (scaleKey || activeScale));
    if (!config) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}${config.endpoint}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const loaded = Array.isArray(data.items) ? data.items : [];
      setItems(loaded.sort((a: ScaleItem, b: ScaleItem) => a.order - b.order));
    } catch (err) {
      console.error(`Failed to load ${config.label} scale:`, err);
      toast.error(`Failed to load ${config.label} scale`);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScale();
  }, [activeScale]);

  // ── Save all items ──────────────────────────────────────────────
  const saveAll = async (newItems: ScaleItem[]) => {
    setIsSaving(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BASE_URL}${scaleConfig.endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: newItems }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(`${scaleConfig.label} scale saved`);
      setItems(newItems);
    } catch (err) {
      console.error(`Failed to save ${scaleConfig.label} scale:`, err);
      toast.error(`Failed to save ${scaleConfig.label} scale`);
    } finally {
      setIsSaving(false);
    }
  };

  // ── CRUD ────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({ emoji: '😐', label: '', value: 0, order: items.length, severity: 'neutral', is_active: true });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    if (!formData.label) { toast.error('Label is required'); return; }
    const newItem: ScaleItem = {
      id: makeId(),
      emoji: formData.emoji || '😐',
      label: formData.label || '',
      value: formData.value ?? items.length,
      order: formData.order ?? items.length,
      severity: formData.severity || 'neutral',
      is_active: formData.is_active !== false,
    };
    const updated = [...items, newItem];
    saveAll(updated);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    if (!formData.label) { toast.error('Label is required'); return; }
    const updated = items.map(item =>
      item.id === id ? { ...item, ...formData, id } : item
    );
    saveAll(updated);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this scale item?')) return;
    const updated = items.filter(item => item.id !== id)
      .map((item, idx) => ({ ...item, order: idx }));
    saveAll(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, is_active: !item.is_active } : item
    );
    saveAll(updated);
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    const updated = [...items];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    const reordered = updated.map((item, i) => ({ ...item, order: i }));
    saveAll(reordered);
  };

  const startEdit = (item: ScaleItem) => {
    setFormData(item);
    setEditingId(item.id);
    setIsCreating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const B = {
    primary: 'var(--color-text-primary)',
    muted: 'var(--color-text-muted)',
    card: 'var(--color-bg-card)',
    page: 'var(--color-bg-page)',
    input: 'var(--color-bg-input)',
    border: 'var(--color-border-default)',
    accent: 'var(--color-primary-default)',
  };

  // ════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Check-in Scales"
        description="Manage emoji scales for check-in assessments (energy, stress, sleep, pain, context tags)"
      />

      <div className="flex gap-6">
        {/* ── Left: Scale Tabs ── */}
        <div className="w-[220px] shrink-0 space-y-1">
          <p style={{ ...f('xs', 500, B.muted), textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px', marginBottom: 8 }}>
            Scale Types
          </p>
          {SCALE_TYPES.map(scale => {
            const isActive = activeScale === scale.key;
            const ScaleIcon = scale.icon;
            return (
              <button
                key={scale.key}
                onClick={() => { setActiveScale(scale.key); resetForm(); }}
                className="w-full text-left flex items-center gap-3 rounded-lg transition-colors"
                style={{
                  padding: '10px 12px',
                  backgroundColor: isActive ? B.accent : 'transparent',
                  color: isActive ? 'white' : B.primary,
                  ...f('sm', isActive ? 500 : 400),
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <ScaleIcon className="w-4 h-4 shrink-0" style={{ opacity: isActive ? 1 : 0.6 }} />
                <span className="truncate flex-1">{scale.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Right: Scale Editor ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {React.createElement(scaleConfig.icon, { className: 'w-5 h-5', style: { color: B.muted } })}
              <span style={{ ...f('base', 500, B.primary) }}>{scaleConfig.label} Scale</span>
              <span style={{ ...f('sm', 400, B.muted) }}>({items.length} items)</span>
            </div>
            <Button
              onClick={() => { resetForm(); setIsCreating(true); }}
              className="gap-2 shrink-0"
              style={{ borderRadius: 'var(--ikan-component-border-radius)', ...f(undefined, 500) }}
            >
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </div>

          {/* Create / Edit Form */}
          {(isCreating || editingId) && (
            <Card style={{ borderRadius: 'var(--radius-lg)' }}>
              <CardHeader>
                <CardTitle style={{ ...f('base', 500) }}>
                  {isCreating ? 'Add' : 'Edit'} Scale Item
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Emoji picker row */}
                <div className="space-y-2">
                  <Label style={{ ...f('sm', 500) }}>Emoji</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_PICKS.map(em => (
                      <button
                        key={em}
                        onClick={() => setFormData({ ...formData, emoji: em })}
                        className="w-10 h-10 flex items-center justify-center rounded-lg transition-all text-xl"
                        style={{
                          backgroundColor: formData.emoji === em ? B.accent : B.input,
                          border: formData.emoji === em ? `2px solid ${B.accent}` : `1px solid ${B.border}`,
                          borderRadius: 'var(--radius-md)',
                          transform: formData.emoji === em ? 'scale(1.15)' : 'scale(1)',
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label style={{ ...f('sm', 500) }}>Label *</Label>
                    <Input
                      value={formData.label || ''}
                      onChange={e => setFormData({ ...formData, label: e.target.value })}
                      placeholder="e.g. High Energy"
                      className="bg-[var(--color-bg-input)]"
                      style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ ...f('sm', 500) }}>Value (numeric)</Label>
                    <Input
                      type="number"
                      value={formData.value ?? 0}
                      onChange={e => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                      className="bg-[var(--color-bg-input)]"
                      style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ ...f('sm', 500) }}>Severity</Label>
                    <select
                      value={formData.severity || 'neutral'}
                      onChange={e => setFormData({ ...formData, severity: e.target.value })}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 'var(--ikan-component-border-radius)',
                        backgroundColor: B.input, border: `1px solid ${B.border}`, ...f('sm'),
                      }}
                    >
                      {SEVERITY_OPTIONS.map(sev => (
                        <option key={sev.value} value={sev.value}>{sev.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label style={{ ...f('sm', 500) }}>Order</Label>
                    <Input
                      type="number"
                      value={formData.order ?? 0}
                      onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="bg-[var(--color-bg-input)]"
                      style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_active !== false}
                    onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label style={{ ...f('sm', 400) }}>Active</Label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={resetForm} style={{ borderRadius: 'var(--ikan-component-border-radius)' }}>
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  {editingId ? (
                    <Button onClick={() => handleUpdate(editingId)} disabled={isSaving} style={{ borderRadius: 'var(--ikan-component-border-radius)' }}>
                      <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  ) : (
                    <Button onClick={handleCreate} disabled={isSaving} style={{ borderRadius: 'var(--ikan-component-border-radius)' }}>
                      <Plus className="w-4 h-4 mr-2" /> {isSaving ? 'Adding...' : 'Add'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items List */}
          <Card style={{ borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center" style={{ color: B.muted }}>
                  <AdminLoading message={`Loading ${scaleConfig.label} scale...`} />
                </div>
              ) : items.length === 0 ? (
                <div className="p-12 text-center">
                  <Smile className="w-12 h-12 mx-auto mb-4" style={{ color: B.muted }} />
                  <p style={{ ...f('base', 500, B.primary), marginBottom: 4 }}>No items yet</p>
                  <p style={{ ...f('sm', 400, B.muted) }}>
                    Click "Add Item" to create {scaleConfig.label.toLowerCase()} scale entries
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border-default)]">
                  {items.map((item, idx) => {
                    const isEditing = editingId === item.id;
                    const sev = SEVERITY_OPTIONS.find(s => s.value === item.severity);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 transition-colors ${
                          isEditing ? 'bg-[var(--color-accent-default)]' : 'hover:bg-[var(--color-bg-muted)]'
                        } ${!item.is_active ? 'opacity-50' : ''}`}
                      >
                        {/* Reorder controls */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => moveItem(item.id, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 rounded hover:bg-[var(--color-bg-muted)] disabled:opacity-30"
                          >
                            <ChevronUp className="w-3.5 h-3.5" style={{ color: B.muted }} />
                          </button>
                          <button
                            onClick={() => moveItem(item.id, 'down')}
                            disabled={idx === items.length - 1}
                            className="p-0.5 rounded hover:bg-[var(--color-bg-muted)] disabled:opacity-30"
                          >
                            <ChevronDown className="w-3.5 h-3.5" style={{ color: B.muted }} />
                          </button>
                        </div>

                        {/* Emoji */}
                        <div
                          className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl shrink-0"
                          style={{
                            backgroundColor: sev ? `${sev.color}18` : B.input,
                            border: `1px solid ${B.border}`,
                          }}
                        >
                          {item.emoji}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span style={{ ...f('base', 500, B.primary) }}>{item.label}</span>
                            {sev && (
                              <span
                                className="rounded-full"
                                style={{
                                  ...f('xs', 500),
                                  padding: '2px 8px',
                                  backgroundColor: `${sev.color}18`,
                                  color: sev.color,
                                }}
                              >
                                {sev.label}
                              </span>
                            )}
                            {!item.is_active && (
                              <span
                                className="rounded-full"
                                style={{
                                  ...f('xs', 500),
                                  padding: '2px 8px',
                                  backgroundColor: 'var(--color-bg-muted)',
                                  color: B.muted,
                                }}
                              >
                                Inactive
                              </span>
                            )}
                          </div>
                          <p style={{ ...f('xs', 400, B.muted), marginTop: 2 }}>
                            Value: {item.value} · Order: {item.order}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggleActive(item.id)}
                            className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                            title={item.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {item.is_active
                              ? <ToggleRight className="w-4 h-4" style={{ color: '#22C55E' }} />
                              : <ToggleLeft className="w-4 h-4" style={{ color: B.muted }} />
                            }
                          </button>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" style={{ color: B.muted }} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" style={{ color: 'var(--color-status-danger)' }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}