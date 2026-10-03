import { useState } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  Zap,
  Tag,
  Moon,
  Flame,
  Heart,
  Smile,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { AdminLoading } from '../ui/kit/AdminLoading';
import { useConfirm } from '../ui/kit/ConfirmDialog';
import { useAdminResource } from '../ui/hooks/useAdminResource';
import { apiClient } from '../../shared/api/api';
import { useNotifications } from '../../shared/state/NotificationContext';
import { ScaleItemForm } from './ScaleItemForm';
import { SEVERITY_OPTIONS, type ScaleItem, type ScaleType } from './scale-types';

// ── Scale types config ─────────────────────────────────────────────
// Each scale is served by `/scales/{key}` (public GET, admin PUT).
const SCALE_TYPES: ScaleType[] = [
  { key: 'moods', label: 'Mood', icon: Smile, description: 'Overall mood scale — used by the Mood Journal and every check-in flow\'s "mood" step' },
  { key: 'energy', label: 'Energy', icon: Zap, description: 'Energy level assessment scale' },
  { key: 'stress', label: 'Stress', icon: Flame, description: 'Stress level tracking scale' },
  { key: 'sleep', label: 'Sleep', icon: Moon, description: 'Sleep quality assessment scale' },
  { key: 'pain', label: 'Pain', icon: Heart, description: 'Pain severity tracking scale' },
  { key: 'context-tags', label: 'Context Tags', icon: Tag, description: 'Contextual tags for check-ins' },
];

const EMPTY_FORM: Partial<ScaleItem> = {
  emoji: '😐',
  label: '',
  value: 0,
  order: 0,
  severity: 'neutral',
  is_active: true,
};

const MUTED = 'text-[var(--color-text-muted)]';
const ROW_ACTION = 'p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors';

const makeId = () => `scale-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// ════════════════════════════════════════════════════════════════════
export function AdminCheckinScalesManager() {
  const { showToast } = useNotifications();
  const confirm = useConfirm();
  const [activeScale, setActiveScale] = useState<string>('energy');
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<ScaleItem>>(EMPTY_FORM);

  const scaleConfig = SCALE_TYPES.find(s => s.key === activeScale)!;

  // ── Load scale data ─────────────────────────────────────────────
  const scale = useAdminResource<ScaleItem[]>(
    async () => {
      const data = await apiClient.getScale(scaleConfig.key);
      const loaded: ScaleItem[] = Array.isArray(data?.items) ? data.items : [];
      return loaded.sort((a, b) => a.order - b.order);
    },
    {
      deps: [activeScale],
      initialData: [],
      errorTitle: `Failed to load ${scaleConfig.label} scale`,
      // A failed load shows an empty list, not the previous scale's items.
      onError: () => scale.setData([]),
    },
  );
  const { data: items, setData: setItems, loading: isLoading } = scale;

  // ── Save all items ──────────────────────────────────────────────
  const saveAll = async (newItems: ScaleItem[]) => {
    setIsSaving(true);
    try {
      await apiClient.updateScale(scaleConfig.key, newItems);
      showToast('success', `${scaleConfig.label} scale saved`);
      setItems(newItems);
    } catch (err) {
      console.error(`Failed to save ${scaleConfig.label} scale:`, err);
      showToast('error', `Failed to save ${scaleConfig.label} scale`);
    } finally {
      setIsSaving(false);
    }
  };

  // ── CRUD ────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({ ...EMPTY_FORM, order: items.length });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    if (!formData.label) { showToast('error', 'Label is required'); return; }
    const newItem: ScaleItem = {
      id: makeId(),
      emoji: formData.emoji || '😐',
      label: formData.label || '',
      value: formData.value ?? items.length,
      order: formData.order ?? items.length,
      severity: formData.severity || 'neutral',
      is_active: formData.is_active !== false,
    };
    saveAll([...items, newItem]);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    if (!formData.label) { showToast('error', 'Label is required'); return; }
    const updated = items.map(item =>
      item.id === id ? { ...item, ...formData, id } : item
    );
    saveAll(updated);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ title: 'Delete this scale item?', confirmLabel: 'Delete', destructive: true }))) return;
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
    saveAll(updated.map((item, i) => ({ ...item, order: i })));
  };

  const startEdit = (item: ScaleItem) => {
    setFormData(item);
    setEditingId(item.id);
    setIsCreating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ScaleIcon = scaleConfig.icon;

  // ════════════════════════════════════════════════════════════════
  return (
    <AdminPageLayout
      title="Check-in Scales"
      description="Manage emoji scales for check-in assessments (energy, stress, sleep, pain, context tags)"
    >
      <div className="flex gap-6">
        {/* ── Left: Scale Tabs ── */}
        <div className="w-[220px] shrink-0 space-y-1">
          <p className={cn('mb-2 px-3 text-xs font-medium tracking-[0.05em] uppercase', MUTED)}>
            Scale Types
          </p>
          {SCALE_TYPES.map(s => {
            const isActive = activeScale === s.key;
            const TabIcon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => { setActiveScale(s.key); resetForm(); }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--color-primary-default)] font-medium text-white'
                    : 'bg-transparent font-normal text-[var(--color-text-primary)]',
                )}
              >
                <TabIcon className={cn('h-4 w-4 shrink-0', isActive ? 'opacity-100' : 'opacity-60')} />
                <span className="flex-1 truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Right: Scale Editor ── */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ScaleIcon className={cn('h-5 w-5', MUTED)} />
              <span className="text-base font-medium text-[var(--color-text-primary)]">{scaleConfig.label} Scale</span>
              <span className={cn('text-sm', MUTED)}>({items.length} items)</span>
            </div>
            <Button onClick={() => { resetForm(); setIsCreating(true); }} className="shrink-0 gap-2">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>

          {/* Create / Edit Form */}
          {(isCreating || editingId) && (
            <ScaleItemForm
              isCreating={isCreating}
              editingId={editingId}
              formData={formData}
              setFormData={setFormData}
              isSaving={isSaving}
              onCancel={resetForm}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
            />
          )}

          {/* Items List */}
          <Card className="rounded-lg">
            <CardContent className="p-0">
              {isLoading ? (
                <div className={cn('p-8 text-center', MUTED)}>
                  <AdminLoading message={`Loading ${scaleConfig.label} scale...`} />
                </div>
              ) : items.length === 0 ? (
                <div className="p-12 text-center">
                  <Smile className={cn('mx-auto mb-4 h-12 w-12', MUTED)} />
                  <p className="mb-1 text-base font-medium text-[var(--color-text-primary)]">No items yet</p>
                  <p className={cn('text-sm', MUTED)}>
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
                        className={cn(
                          'flex items-center gap-4 p-4 transition-colors',
                          isEditing ? 'bg-[var(--color-accent-default)]' : 'hover:bg-[var(--color-bg-muted)]',
                          !item.is_active && 'opacity-50',
                        )}
                      >
                        {/* Reorder controls */}
                        <div className="flex shrink-0 flex-col gap-1">
                          <button
                            onClick={() => moveItem(item.id, 'up')}
                            disabled={idx === 0}
                            className="rounded p-0.5 hover:bg-[var(--color-bg-muted)] disabled:opacity-30"
                          >
                            <ChevronUp className={cn('h-3.5 w-3.5', MUTED)} />
                          </button>
                          <button
                            onClick={() => moveItem(item.id, 'down')}
                            disabled={idx === items.length - 1}
                            className="rounded p-0.5 hover:bg-[var(--color-bg-muted)] disabled:opacity-30"
                          >
                            <ChevronDown className={cn('h-3.5 w-3.5', MUTED)} />
                          </button>
                        </div>

                        {/* Emoji */}
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-default)] text-2xl',
                            !sev && 'bg-[var(--color-bg-input)]',
                          )}
                          style={sev ? { backgroundColor: `${sev.color}18` } : undefined}
                        >
                          {item.emoji}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-medium text-[var(--color-text-primary)]">{item.label}</span>
                            {sev && (
                              <span
                                className="rounded-full px-2 py-0.5 text-xs font-medium"
                                style={{ backgroundColor: `${sev.color}18`, color: sev.color }}
                              >
                                {sev.label}
                              </span>
                            )}
                            {!item.is_active && (
                              <span className={cn('rounded-full bg-[var(--color-bg-muted)] px-2 py-0.5 text-xs font-medium', MUTED)}>
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className={cn('mt-0.5 text-xs', MUTED)}>
                            Value: {item.value} · Order: {item.order}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => handleToggleActive(item.id)}
                            className={ROW_ACTION}
                            title={item.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {item.is_active
                              ? <ToggleRight className="h-4 w-4" style={{ color: '#22C55E' }} />
                              : <ToggleLeft className={cn('h-4 w-4', MUTED)} />
                            }
                          </button>
                          <button onClick={() => startEdit(item)} className={ROW_ACTION}>
                            <Pencil className={cn('h-4 w-4', MUTED)} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className={ROW_ACTION}>
                            <Trash2 className="h-4 w-4 text-[var(--color-status-danger)]" />
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
    </AdminPageLayout>
  );
}
