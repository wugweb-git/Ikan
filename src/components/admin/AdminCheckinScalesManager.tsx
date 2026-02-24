import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Edit2, Save, X, Zap, Brain, Tag,
  RotateCcw, ShieldCheck, GripVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import tokens from '../../lib/design-tokens';
import { AdminHeader } from './AdminHeader';
import { AdminLoading } from './AdminLoading';

// ── Types ──────────────────────────────────────────────────────────
interface ScaleItem {
  id: string;
  value: number;
  label: string;
  emoji: string;
  severity: string;
  is_active: boolean;
  order: number;
}

interface TagItem {
  id: string;
  label: string;
  emoji: string;
  is_active: boolean;
  order: number;
}

type TabKey = 'energy' | 'stress' | 'tags';

interface AdminCheckinScalesManagerProps {
  onBack?: () => void;
}

// ── Design token helpers ───────────────────────────────────────────
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

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
const headers = { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };

const SEVERITY_OPTIONS = [
  { value: 'success', label: 'Success (Green)', color: B.success },
  { value: 'info', label: 'Info (Blue)', color: B.info },
  { value: 'warning', label: 'Warning (Amber)', color: B.warning },
  { value: 'danger', label: 'Danger (Red)', color: B.danger },
  { value: 'neutral', label: 'Neutral (Gray)', color: tokens.colors.neutral[500] },
];

const EMOJI_PICKS = {
  energy: ['🪫', '😴', '⚡', '💪', '🔥', '🚀', '🏃', '🧘', '💤', '🌟', '⭐', '✨'],
  stress: ['😌', '🤔', '😤', '😰', '🤯', '😓', '😖', '😩', '🧊', '🌊', '🍃', '💆'],
  tags:   ['💼', '😴', '🏃', '❤️', '📚', '💰', '🎉', '✨', '🎮', '🎵', '🍽️', '🏠', '🧠', '🙏', '🌿', '☕', '👶', '🐾', '✈️', '🎯'],
};

function getSeverityColor(severity: string): string {
  const opt = SEVERITY_OPTIONS.find(s => s.value === severity);
  return opt?.color || tokens.colors.neutral[500];
}

function getSeverityBg(severity: string): string {
  switch (severity) {
    case 'success': return B.successLight;
    case 'warning': return B.warningLight;
    case 'danger': return B.dangerLight;
    case 'info': return B.infoLight;
    default: return tokens.colors.neutral[200];
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export function AdminCheckinScalesManager({ onBack }: AdminCheckinScalesManagerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('energy');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data
  const [energyItems, setEnergyItems] = useState<ScaleItem[]>([]);
  const [stressItems, setStressItems] = useState<ScaleItem[]>([]);
  const [tagItems, setTagItems] = useState<TagItem[]>([]);

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Scale form
  const [scaleForm, setScaleForm] = useState<Partial<ScaleItem>>({
    emoji: '⚡', label: '', value: 3, severity: 'neutral', is_active: true,
  });

  // Tag form
  const [tagForm, setTagForm] = useState<Partial<TagItem>>({
    emoji: '✨', label: '', is_active: true,
  });

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [eRes, sRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/scales/energy`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/scales/stress`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/scales/context-tags`, { headers }).then(r => r.json()),
      ]);
      setEnergyItems((eRes.items || []).sort((a: ScaleItem, b: ScaleItem) => a.order - b.order));
      setStressItems((sRes.items || []).sort((a: ScaleItem, b: ScaleItem) => a.order - b.order));
      setTagItems((tRes.items || []).sort((a: TagItem, b: TagItem) => a.order - b.order));
    } catch (e) {
      console.error('Failed to fetch scales:', e);
      toast.error('Failed to load check-in scales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Save ───────────────────────────────────────────────────────
  const saveScale = async (type: 'energy' | 'stress', items: ScaleItem[]) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/scales/${type}`, {
        method: 'PUT', headers, body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`${type === 'energy' ? 'Energy' : 'Stress'} scale saved`);
      await fetchAll();
    } catch (e) {
      console.error(`Failed to save ${type} scale:`, e);
      toast.error(`Failed to save ${type} scale`);
    } finally { setSaving(false); }
  };

  const saveTags = async (items: TagItem[]) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/scales/context-tags`, {
        method: 'PUT', headers, body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Context tags saved');
      await fetchAll();
    } catch (e) {
      console.error('Failed to save context tags:', e);
      toast.error('Failed to save context tags');
    } finally { setSaving(false); }
  };

  const handleReset = async (type: TabKey) => {
    const label = type === 'energy' ? 'Energy Scale' : type === 'stress' ? 'Stress Scale' : 'Context Tags';
    if (!confirm(`Reset ${label} to design-token defaults? This will overwrite your custom changes.`)) return;
    try {
      const resetType = type === 'tags' ? 'context-tags' : type;
      const res = await fetch(`${API_BASE}/scales/reset`, {
        method: 'POST', headers, body: JSON.stringify({ type: resetType }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`${label} reset to defaults`);
      await fetchAll();
    } catch (e) {
      console.error('Reset failed:', e);
      toast.error('Failed to reset');
    }
  };

  // ── Scale CRUD helpers ─────────────────────────────────────────
  const getCurrentScaleItems = () => activeTab === 'energy' ? energyItems : stressItems;
  const setCurrentScaleItems = (items: ScaleItem[]) => {
    if (activeTab === 'energy') setEnergyItems(items);
    else setStressItems(items);
  };

  const addScaleItem = () => {
    if (!scaleForm.label?.trim() || !scaleForm.emoji) {
      toast.error('Emoji and label are required'); return;
    }
    const items = getCurrentScaleItems();
    const newItem: ScaleItem = {
      id: scaleForm.label!.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      value: scaleForm.value || items.length + 1,
      label: scaleForm.label!.trim(),
      emoji: scaleForm.emoji!,
      severity: scaleForm.severity || 'neutral',
      is_active: scaleForm.is_active !== false,
      order: items.length,
    };
    const updated = [...items, newItem];
    setCurrentScaleItems(updated);
    saveScale(activeTab as 'energy' | 'stress', updated);
    resetForms();
  };

  const updateScaleItem = (id: string) => {
    const items = getCurrentScaleItems();
    const updated = items.map(item =>
      item.id === id ? { ...item, ...scaleForm, id } as ScaleItem : item
    );
    setCurrentScaleItems(updated);
    saveScale(activeTab as 'energy' | 'stress', updated);
    resetForms();
  };

  const deleteScaleItem = (id: string) => {
    if (!confirm('Delete this scale item?')) return;
    const items = getCurrentScaleItems().filter(i => i.id !== id);
    // Re-order
    items.forEach((item, idx) => { item.order = idx; item.value = idx + 1; });
    setCurrentScaleItems(items);
    saveScale(activeTab as 'energy' | 'stress', items);
  };

  const toggleScaleActive = (id: string) => {
    const items = getCurrentScaleItems().map(i =>
      i.id === id ? { ...i, is_active: !i.is_active } : i
    );
    setCurrentScaleItems(items);
    saveScale(activeTab as 'energy' | 'stress', items);
  };

  // ── Tag CRUD helpers ───────────────────────────────────────────
  const addTagItem = () => {
    if (!tagForm.label?.trim() || !tagForm.emoji) {
      toast.error('Emoji and label are required'); return;
    }
    const newTag: TagItem = {
      id: tagForm.label!.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      label: tagForm.label!.trim(),
      emoji: tagForm.emoji!,
      is_active: tagForm.is_active !== false,
      order: tagItems.length,
    };
    const updated = [...tagItems, newTag];
    setTagItems(updated);
    saveTags(updated);
    resetForms();
  };

  const updateTagItem = (id: string) => {
    const updated = tagItems.map(item =>
      item.id === id ? { ...item, ...tagForm, id } as TagItem : item
    );
    setTagItems(updated);
    saveTags(updated);
    resetForms();
  };

  const deleteTagItem = (id: string) => {
    if (!confirm('Delete this tag?')) return;
    const items = tagItems.filter(i => i.id !== id);
    items.forEach((item, idx) => { item.order = idx; });
    setTagItems(items);
    saveTags(items);
  };

  const toggleTagActive = (id: string) => {
    const items = tagItems.map(i =>
      i.id === id ? { ...i, is_active: !i.is_active } : i
    );
    setTagItems(items);
    saveTags(items);
  };

  // ── Form helpers ───────────────────────────────────────────────
  const resetForms = () => {
    setScaleForm({ emoji: '⚡', label: '', value: 3, severity: 'neutral', is_active: true });
    setTagForm({ emoji: '✨', label: '', is_active: true });
    setEditingId(null);
    setIsCreating(false);
  };

  const startEditScale = (item: ScaleItem) => {
    setEditingId(item.id);
    setScaleForm({ emoji: item.emoji, label: item.label, value: item.value, severity: item.severity, is_active: item.is_active });
    setIsCreating(false);
  };

  const startEditTag = (item: TagItem) => {
    setEditingId(item.id);
    setTagForm({ emoji: item.emoji, label: item.label, is_active: item.is_active });
    setIsCreating(false);
  };

  // ── Integrity check ───────────────────────────────────────────
  const checkIntegrity = () => {
    let issues = 0;
    const items = activeTab === 'tags' ? tagItems : getCurrentScaleItems();
    items.forEach((item: any) => {
      if (!item.label) issues++;
      if (!item.emoji) issues++;
      if (activeTab !== 'tags' && (item.value < 1 || item.value > 10)) issues++;
    });
    if (issues === 0) toast.success('Integrity check passed!');
    else toast.warning(`Found ${issues} issue(s). Fix missing labels, emojis, or out-of-range values.`);
  };

  // ── Tab config ─────────────────────────────────────────────────
  const TABS: { key: TabKey; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'energy', label: 'Energy Scale', icon: <Zap size={16} />, desc: 'How energetic users feel' },
    { key: 'stress', label: 'Stress Scale', icon: <Brain size={16} />, desc: 'User stress levels' },
    { key: 'tags', label: 'Context Tags', icon: <Tag size={16} />, desc: 'What shaped the day' },
  ];

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div style={{ padding: 'var(--spacing-8)' }}>
        <AdminLoading message="Loading check-in scales..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-8)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

        {/* Header */}
        <AdminHeader
          title="Check-in Scale Manager"
          description="Customize the Energy, Stress, and Context Tag options shown in the Mood Journal check-in wizard"
          actions={
            <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
              <Button variant="outline" onClick={checkIntegrity} style={{ gap: 'var(--spacing-2)' }}>
                <ShieldCheck size={14} /> Integrity Check
              </Button>
              <Button variant="outline" onClick={() => handleReset(activeTab)} style={{ gap: 'var(--spacing-2)', color: B.danger, borderColor: `${B.danger}40` }}>
                <RotateCcw size={14} /> Reset to Defaults
              </Button>
              <Button onClick={() => { resetForms(); setIsCreating(true); }} style={{ gap: 'var(--spacing-2)' }}>
                <Plus size={14} /> Add Item
              </Button>
            </div>
          }
          stats={[
            { label: 'Energy Items', value: energyItems.length },
            { label: 'Stress Items', value: stressItems.length },
            { label: 'Context Tags', value: tagItems.length },
          ]}
        />

        {/* Tabs */}
        <div className="flex items-center" style={{ gap: 'var(--spacing-1)', backgroundColor: B.bgMuted, borderRadius: 'var(--radius-md)', padding: 'var(--spacing-1)' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); resetForms(); }}
                className="flex items-center justify-center"
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? B.bgCard : 'transparent',
                  boxShadow: isActive ? tokens.shadow.sm : 'none',
                  border: 'none', cursor: 'pointer',
                  ...f('sm', isActive ? 500 : 400, isActive ? B.textPrimary : B.muted),
                  display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
                }}
              >
                {tab.icon}
                {tab.label}
                <span style={{
                  padding: '1px 6px', borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? B.accent : 'transparent',
                  ...f('xs', 500, B.muted),
                }}>
                  {tab.key === 'energy' ? energyItems.length : tab.key === 'stress' ? stressItems.length : tagItems.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {(isCreating || editingId) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{isCreating ? 'Add New Item' : 'Edit Item'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeTab === 'tags' ? (
                    /* Tag Form */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                          <Label style={f('sm', 500)}>Emoji</Label>
                          <Input
                            value={tagForm.emoji || ''}
                            onChange={e => setTagForm(p => ({ ...p, emoji: e.target.value }))}
                            placeholder="✨"
                            className="text-center text-3xl h-16"
                            maxLength={2}
                            style={{ backgroundColor: B.bgInput }}
                          />
                          <div className="flex flex-wrap" style={{ gap: 'var(--spacing-1)' }}>
                            {EMOJI_PICKS.tags.map(e => (
                              <button key={e} onClick={() => setTagForm(p => ({ ...p, emoji: e }))}
                                style={{
                                  width: 32, height: 32, borderRadius: 6, fontSize: 18,
                                  border: tagForm.emoji === e ? `2px solid ${B.primary}` : `1px solid ${B.border}`,
                                  backgroundColor: tagForm.emoji === e ? B.accent : 'transparent',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >{e}</button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                          <Label style={f('sm', 500)}>Label</Label>
                          <Input
                            value={tagForm.label || ''}
                            onChange={e => setTagForm(p => ({ ...p, label: e.target.value }))}
                            placeholder="e.g. Work, Sleep, Health"
                            style={{ backgroundColor: B.bgInput }}
                          />
                          <div className="flex items-center" style={{ gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
                            <Switch checked={tagForm.is_active !== false} onCheckedChange={c => setTagForm(p => ({ ...p, is_active: c }))} />
                            <Label style={f('sm', 400, B.muted)}>Active (visible to users)</Label>
                          </div>
                        </div>
                      </div>
                      {/* Preview */}
                      <div className="flex items-center justify-center" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', backgroundColor: B.bgMuted, gap: 'var(--spacing-2)' }}>
                        <span style={{ fontSize: 20 }}>{tagForm.emoji || '✨'}</span>
                        <span style={f('sm', 500)}>{tagForm.label || 'Tag Label'}</span>
                      </div>
                      <div className="flex" style={{ gap: 'var(--spacing-2)' }}>
                        {editingId ? (
                          <Button onClick={() => updateTagItem(editingId)}><Save size={14} className="mr-2" /> Save</Button>
                        ) : (
                          <Button onClick={addTagItem}><Plus size={14} className="mr-2" /> Add Tag</Button>
                        )}
                        <Button variant="outline" onClick={resetForms}><X size={14} className="mr-2" /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    /* Scale Form (Energy / Stress) */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                          <Label style={f('sm', 500)}>Emoji</Label>
                          <Input
                            value={scaleForm.emoji || ''}
                            onChange={e => setScaleForm(p => ({ ...p, emoji: e.target.value }))}
                            placeholder="⚡"
                            className="text-center text-3xl h-16"
                            maxLength={2}
                            style={{ backgroundColor: B.bgInput }}
                          />
                          <div className="flex flex-wrap" style={{ gap: 'var(--spacing-1)' }}>
                            {EMOJI_PICKS[activeTab === 'energy' ? 'energy' : 'stress'].map(e => (
                              <button key={e} onClick={() => setScaleForm(p => ({ ...p, emoji: e }))}
                                style={{
                                  width: 32, height: 32, borderRadius: 6, fontSize: 18,
                                  border: scaleForm.emoji === e ? `2px solid ${B.primary}` : `1px solid ${B.border}`,
                                  backgroundColor: scaleForm.emoji === e ? B.accent : 'transparent',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >{e}</button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                          <div>
                            <Label style={f('sm', 500)}>Label</Label>
                            <Input
                              value={scaleForm.label || ''}
                              onChange={e => setScaleForm(p => ({ ...p, label: e.target.value }))}
                              placeholder="e.g. Exhausted, Energetic"
                              style={{ backgroundColor: B.bgInput }}
                            />
                          </div>
                          <div>
                            <Label style={f('sm', 500)}>Numeric Value (1-10)</Label>
                            <Input
                              type="number" min={1} max={10}
                              value={scaleForm.value || 3}
                              onChange={e => setScaleForm(p => ({ ...p, value: parseInt(e.target.value) || 1 }))}
                              style={{ backgroundColor: B.bgInput }}
                            />
                          </div>
                          <div>
                            <Label style={f('sm', 500)}>Severity (Color)</Label>
                            <div className="flex flex-wrap" style={{ gap: 'var(--spacing-1)', marginTop: 'var(--spacing-1)' }}>
                              {SEVERITY_OPTIONS.map(s => (
                                <button
                                  key={s.value}
                                  onClick={() => setScaleForm(p => ({ ...p, severity: s.value }))}
                                  className="flex items-center"
                                  style={{
                                    padding: '4px 10px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                                    border: scaleForm.severity === s.value ? `2px solid ${s.color}` : `1px solid ${B.border}`,
                                    backgroundColor: scaleForm.severity === s.value ? `${s.color}18` : 'transparent',
                                    ...f('xs', 500, scaleForm.severity === s.value ? s.color : B.muted),
                                    gap: 'var(--spacing-1)',
                                  }}
                                >
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color }} />
                                  {s.label.split(' ')[0]}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                            <Switch checked={scaleForm.is_active !== false} onCheckedChange={c => setScaleForm(p => ({ ...p, is_active: c }))} />
                            <Label style={f('sm', 400, B.muted)}>Active</Label>
                          </div>
                        </div>
                      </div>
                      {/* Preview */}
                      <div
                        className="flex flex-col items-center justify-center"
                        style={{
                          padding: 'var(--spacing-4) var(--spacing-5)', borderRadius: 'var(--radius-md)',
                          backgroundColor: getSeverityBg(scaleForm.severity || 'neutral'),
                          border: `2px solid ${getSeverityColor(scaleForm.severity || 'neutral')}`,
                          gap: 'var(--spacing-2)',
                        }}
                      >
                        <span style={{ fontSize: 36 }}>{scaleForm.emoji || '⚡'}</span>
                        <span style={{ ...f('sm', 500, getSeverityColor(scaleForm.severity || 'neutral')) }}>
                          {scaleForm.label || 'Scale Label'}
                        </span>
                        <span style={f('xs', 400, B.muted)}>Value: {scaleForm.value || 3}</span>
                      </div>
                      <div className="flex" style={{ gap: 'var(--spacing-2)' }}>
                        {editingId ? (
                          <Button onClick={() => updateScaleItem(editingId)}><Save size={14} className="mr-2" /> Save</Button>
                        ) : (
                          <Button onClick={addScaleItem}><Plus size={14} className="mr-2" /> Add Item</Button>
                        )}
                        <Button variant="outline" onClick={resetForms}><X size={14} className="mr-2" /> Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {TABS.find(t => t.key === activeTab)?.label} ({activeTab === 'tags' ? tagItems.length : getCurrentScaleItems().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === 'tags' ? (
              /* Tags list */
              tagItems.length === 0 ? (
                <div className="text-center" style={{ padding: 'var(--spacing-12)' }}>
                  <Tag size={36} className="mx-auto mb-4" style={{ color: B.muted }} />
                  <p style={f('sm', 400, B.muted)}>No context tags yet. Add one to get started.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                  {tagItems.map(tag => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between"
                      style={{
                        padding: 'var(--spacing-3) var(--spacing-4)', borderRadius: 'var(--radius-md)',
                        backgroundColor: editingId === tag.id ? B.accent : B.bgMuted,
                        border: editingId === tag.id ? `2px solid ${B.primary}` : `1px solid ${B.border}`,
                        opacity: tag.is_active ? 1 : 0.5,
                      }}
                    >
                      <div className="flex items-center" style={{ gap: 'var(--spacing-3)' }}>
                        <GripVertical size={14} style={{ color: B.muted, cursor: 'grab' }} />
                        <span style={{ fontSize: 28 }}>{tag.emoji}</span>
                        <div>
                          <span style={f('sm', 500)}>{tag.label}</span>
                          {!tag.is_active && (
                            <span style={{ ...f('xs', 500, B.muted), marginLeft: 'var(--spacing-2)', padding: '1px 6px', borderRadius: 'var(--radius-pill)', backgroundColor: B.bgMuted }}>
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                        <Switch checked={tag.is_active} onCheckedChange={() => toggleTagActive(tag.id)} />
                        <Button variant="outline" size="sm" onClick={() => startEditTag(tag)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteTagItem(tag.id)}>
                          <Trash2 size={14} style={{ color: B.danger }} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Scale list (Energy or Stress) */
              getCurrentScaleItems().length === 0 ? (
                <div className="text-center" style={{ padding: 'var(--spacing-12)' }}>
                  {activeTab === 'energy' ? <Zap size={36} className="mx-auto mb-4" style={{ color: B.muted }} /> : <Brain size={36} className="mx-auto mb-4" style={{ color: B.muted }} />}
                  <p style={f('sm', 400, B.muted)}>No scale items yet. Add one to get started.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                  {getCurrentScaleItems().map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                      style={{
                        padding: 'var(--spacing-3) var(--spacing-4)', borderRadius: 'var(--radius-md)',
                        backgroundColor: editingId === item.id ? B.accent : B.bgMuted,
                        border: editingId === item.id ? `2px solid ${B.primary}` : `1px solid ${B.border}`,
                        opacity: item.is_active ? 1 : 0.5,
                      }}
                    >
                      <div className="flex items-center" style={{ gap: 'var(--spacing-3)' }}>
                        <GripVertical size={14} style={{ color: B.muted, cursor: 'grab' }} />
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 48, height: 48, borderRadius: 'var(--radius-md)',
                            backgroundColor: getSeverityBg(item.severity),
                          }}
                        >
                          <span style={{ fontSize: 26 }}>{item.emoji}</span>
                        </div>
                        <div>
                          <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                            <span style={f('sm', 500)}>{item.label}</span>
                            <span style={{
                              padding: '1px 6px', borderRadius: 'var(--radius-pill)',
                              backgroundColor: getSeverityColor(item.severity),
                              ...f('xs', 500, B.primaryOn),
                            }}>
                              {item.value}
                            </span>
                            {!item.is_active && (
                              <span style={{ ...f('xs', 500, B.muted), padding: '1px 6px', borderRadius: 'var(--radius-pill)', backgroundColor: B.bgMuted }}>
                                Hidden
                              </span>
                            )}
                          </div>
                          <span style={{ ...f('xs', 400, B.muted), textTransform: 'capitalize' as const }}>
                            {item.severity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                        <Switch checked={item.is_active} onCheckedChange={() => toggleScaleActive(item.id)} />
                        <Button variant="outline" size="sm" onClick={() => startEditScale(item)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteScaleItem(item.id)}>
                          <Trash2 size={14} style={{ color: B.danger }} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle>How Check-in Scales Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div className="flex" style={{ gap: 'var(--spacing-3)' }}>
                <span style={{ fontSize: 24 }}>🔄</span>
                <div>
                  <p style={f('sm', 500)}>Design Token Defaults</p>
                  <p style={f('xs', 400, B.muted)}>
                    Scales start from values defined in design-tokens.ts. Custom overrides are stored in the server KV store and take priority.
                  </p>
                </div>
              </div>
              <div className="flex" style={{ gap: 'var(--spacing-3)' }}>
                <span style={{ fontSize: 24 }}>📱</span>
                <div>
                  <p style={f('sm', 500)}>Used in Mood Journal</p>
                  <p style={f('xs', 400, B.muted)}>
                    The check-in wizard (How are you feeling? → Energy → Stress → Note → Tags) reads these scales at mount time. Changes appear immediately.
                  </p>
                </div>
              </div>
              <div className="flex" style={{ gap: 'var(--spacing-3)' }}>
                <span style={{ fontSize: 24 }}>⚡</span>
                <div>
                  <p style={f('sm', 500)}>Severity Colors</p>
                  <p style={f('xs', 400, B.muted)}>
                    Each scale item maps to a severity (success/info/warning/danger/neutral) which determines the color shown in the journal UI.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}