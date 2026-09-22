import type { Dispatch, SetStateAction } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';
import { SCALE_EMOJI_PICKS, SEVERITY_OPTIONS, type ScaleItem } from './scale-types';

/** Add / edit form for one scale item. */
export function ScaleItemForm({
  isCreating,
  editingId,
  formData,
  setFormData,
  isSaving,
  onCancel,
  onCreate,
  onUpdate,
}: {
  isCreating: boolean;
  editingId: string | null;
  formData: Partial<ScaleItem>;
  setFormData: Dispatch<SetStateAction<Partial<ScaleItem>>>;
  isSaving: boolean;
  onCancel: () => void;
  onCreate: () => void;
  onUpdate: (id: string) => void;
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-base font-medium">
          {isCreating ? 'Add' : 'Edit'} Scale Item
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emoji picker row */}
        <div className="space-y-2">
          <Label>Emoji</Label>
          <div className="flex flex-wrap gap-2">
            {SCALE_EMOJI_PICKS.map(em => (
              <button
                key={em}
                onClick={() => setFormData(prev => ({ ...prev, emoji: em }))}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-xl transition-all',
                  formData.emoji === em
                    ? 'scale-[1.15] border-2 border-[var(--color-primary-default)] bg-[var(--color-primary-default)]'
                    : 'scale-100 border border-[var(--color-border-default)] bg-[var(--color-bg-input)]',
                )}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Label *</Label>
            <Input
              value={formData.label || ''}
              onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g. High Energy"
              className="bg-[var(--color-bg-input)]"
            />
          </div>
          <div className="space-y-2">
            <Label>Value (numeric)</Label>
            <Input
              type="number"
              value={formData.value ?? 0}
              onChange={e => setFormData(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
              className="bg-[var(--color-bg-input)]"
            />
          </div>
          <div className="space-y-2">
            <Label>Severity</Label>
            <select
              value={formData.severity || 'neutral'}
              onChange={e => setFormData(prev => ({ ...prev, severity: e.target.value }))}
              className="w-full rounded-[var(--ikan-component-border-radius)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-2.5 py-2 text-sm"
            >
              {SEVERITY_OPTIONS.map(sev => (
                <option key={sev.value} value={sev.value}>{sev.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Order</Label>
            <Input
              type="number"
              value={formData.order ?? 0}
              onChange={e => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              className="bg-[var(--color-bg-input)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={formData.is_active !== false}
            onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label className="font-normal">Active</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          {editingId ? (
            <Button onClick={() => onUpdate(editingId)} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save'}
            </Button>
          ) : (
            <Button onClick={onCreate} disabled={isSaving}>
              <Plus className="mr-2 h-4 w-4" /> {isSaving ? 'Adding...' : 'Add'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
