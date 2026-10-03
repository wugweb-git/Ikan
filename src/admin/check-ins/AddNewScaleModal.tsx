import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';
import { apiClient } from '../../shared/api/api';
import { useNotifications } from '../../shared/state/NotificationContext';
import { errorMessageOf } from '../ui/hooks/useAdminResource';
import { FIELD_INPUT, FIELD_LABEL } from './checkin-template-types';

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

/** Create a custom 5-point emoji scale from inside a step editor. */
export function AddNewScaleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (key: string) => void;
}) {
  const { showToast } = useNotifications();
  const [name, setName] = useState('');
  const [items, setItems] = useState(DEFAULT_SCALE_ITEMS.map(i => ({ ...i })));
  const [saving, setSaving] = useState(false);

  const key = slugify(name);

  const updateItem = (idx: number, field: 'emoji' | 'label', value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleCreate = async () => {
    if (!name.trim() || !key) { showToast('error', 'Scale name is required'); return; }
    if (items.some(i => !i.label.trim())) { showToast('error', 'All 5 labels are required'); return; }
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
      showToast('success', `Scale "${name}" created`);
      onCreated(key);
    } catch (e) {
      showToast('error', errorMessageOf(e, 'Failed to create scale'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[440px] overflow-hidden rounded-xl bg-[var(--color-bg-card)] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-5 py-4">
          <span className="text-base font-semibold text-[var(--color-text-primary)]">Add New Scale</span>
          <button onClick={onClose} className="cursor-pointer border-none bg-transparent p-1">
            <X size={18} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          {/* Name */}
          <div>
            <Label className={FIELD_LABEL}>Scale Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Motivation, Appetite"
              className={FIELD_INPUT}
              autoFocus
            />
            {key && (
              <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                Key: <code className="font-mono">{key}</code>
              </span>
            )}
          </div>

          {/* 5 items */}
          <div>
            <Label className={cn(FIELD_LABEL, 'mb-2')}>5-Point Scale (low → high)</Label>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="min-w-4 text-center text-xs text-[var(--color-text-muted)]">{item.value}</span>
                  <Input
                    value={item.emoji}
                    onChange={e => updateItem(idx, 'emoji', e.target.value)}
                    className="w-[52px] rounded-[var(--radius-md)]! border-[1.5px]! px-2 py-1 text-center text-[1.2rem]!"
                  />
                  <Input
                    value={item.label}
                    onChange={e => updateItem(idx, 'label', e.target.value)}
                    placeholder={`Label for ${item.value}`}
                    className={cn(FIELD_INPUT, 'flex-1')}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-[var(--color-border-default)] px-5 py-3">
          <Button variant="outline" onClick={onClose} className="rounded-[var(--radius-md)]!">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="rounded-[var(--radius-md)]! bg-[var(--color-primary-default)] text-[var(--color-primary-on)]"
          >
            {saving ? 'Creating…' : 'Create Scale'}
          </Button>
        </div>
      </div>
    </div>
  );
}
