import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Pencil, Save, X, Smile, GripVertical, ShieldCheck, Sparkles 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from './AdminHeader';
import { AdminLoading } from './AdminLoading';
import { AdminStatusBadge } from './AdminStatusBadge';

interface MoodType {
  id: string;
  emoji: string;
  label: string;
  value: number;
  color: string;
  description: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

interface AdminMoodManagerProps {
  onBack?: () => void;
  /** When true, hides outer padding and AdminHeader (used when embedded in Meta Manager) */
  embedded?: boolean;
}

const EMOJI_SUGGESTIONS = [
  '😢', '😔', '😐', '🙂', '😊', '😃', '🥳',
  '😰', '😡', '😴', '🤗', '😖', '😌', '😇',
  '🥺', '😭', '😞', '😕', '😑', '😏', '😁'
];

// Color picker presets — hex values required here as they are stored as data in KV
// and rendered dynamically as backgroundColor. CSS variables cannot be used for stored data.
const COLOR_PRESETS = [
  { value: '#EF4444', label: 'Red' },
  { value: '#F97316', label: 'Orange' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EAB308', label: 'Yellow' },
  { value: '#84CC16', label: 'Lime' },
  { value: '#22C55E', label: 'Green' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#6B7280', label: 'Gray' },
];

export function AdminMoodManager({ onBack: _onBack, embedded }: AdminMoodManagerProps) {
  const [moods, setMoods] = useState<MoodType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    emoji: '😊',
    label: '',
    value: 5,
    color: '#22C55E',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    setIsLoading(true);
    try {
      const moodList = await apiClient.listMoods();
      setMoods(moodList);
    } catch (error) {
      console.error('Failed to load moods:', error);
      toast.error('Failed to load mood types');
      setMoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.label.trim() || !formData.emoji) {
      toast.error('Emoji and label are required');
      return;
    }

    try {
      await apiClient.post('/moods', { ...formData, order: moods.length });
      toast.success('Mood type created successfully');
      resetForm();
      loadMoods();
    } catch (error) {
      console.error('Error creating mood type:', error);
      toast.error('Failed to create mood type');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await apiClient.request(`/moods/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      }, true);
      toast.success('Mood type updated successfully');
      setEditingId(null);
      resetForm();
      loadMoods();
    } catch (error) {
      console.error('Error updating mood type:', error);
      toast.error('Failed to update mood type');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mood type? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.request(`/moods/${id}`, { method: 'DELETE' }, true);
      toast.success('Mood type deleted successfully');
      loadMoods();
    } catch (error) {
      console.error('Error deleting mood type:', error);
      toast.error('Failed to delete mood type');
    }
  };

  const handleToggleActive = async (id: string, is_active: boolean) => {
    try {
      await apiClient.request(`/moods/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !is_active })
      }, true);
      toast.success(is_active ? 'Mood type disabled' : 'Mood type enabled');
      loadMoods();
    } catch (error) {
      console.error('Error toggling mood type:', error);
      toast.error('Failed to toggle mood type');
    }
  };

  const startEdit = (mood: MoodType) => {
    setEditingId(mood.id);
    setFormData({
      emoji: mood.emoji,
      label: mood.label,
      value: mood.value,
      color: mood.color,
      description: mood.description,
      is_active: mood.is_active
    });
    setIsCreating(false);
  };

  const resetForm = () => {
    setFormData({
      emoji: '😊',
      label: '',
      value: 5,
      color: '#22C55E',
      description: '',
      is_active: true
    });
    setIsCreating(false);
    setEditingId(null);
  };

  if (isLoading) {
    return <AdminLoading message="Loading mood types..." />;
  }

  return (
    <div className={embedded ? 'space-y-6' : 'p-8 space-y-6'}>
      {/* Header */}
      {!embedded && (
        <AdminHeader
          title="Mood Type Manager"
          description="Customize mood tracking options for journal entries"
          actions={
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  resetForm();
                  setIsCreating(true);
                }}
                style={{ gap: 'var(--spacing-2)' }}
              >
                <Plus className="w-4 h-4" />
                Add Mood Type
              </Button>
            </div>
          }
          stats={[
            { label: 'Total Types', value: moods.length },
            { label: 'Active', value: moods.filter(m => m.is_active).length },
            { label: 'Inactive', value: moods.filter(m => !m.is_active).length },
          ]}
        />
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{isCreating ? 'Create New Mood Type' : 'Edit Mood Type'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Emoji *</Label>
                <div className="space-y-2">
                  <Input
                    value={formData.emoji}
                    onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                    placeholder="😊"
                    className="text-center text-4xl h-20"
                    maxLength={2}
                    style={{ backgroundColor: 'var(--color-bg-input)' }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_SUGGESTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                        className="w-10 h-10 rounded transition-colors text-2xl"
                        style={{ 
                          backgroundColor: formData.emoji === emoji 
                            ? 'var(--color-accent-default)' 
                            : 'transparent',
                          border: '1px solid var(--color-border-default)',
                          cursor: 'pointer'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Label *</Label>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g. Happy, Sad, Anxious"
                    style={{ backgroundColor: 'var(--color-bg-input)' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Numeric Value (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseInt(e.target.value) || 1 }))}
                    style={{ backgroundColor: 'var(--color-bg-input)' }}
                  />
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Used for tracking and analytics (1 = lowest, 10 = highest)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 h-10 px-3 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--color-bg-input)',
                      border: '1px solid var(--color-border-default)'
                    }}
                  >
                    {COLOR_PRESETS.map(preset => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer"
                    style={{ border: '1px solid var(--color-border-default)' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}
                />
              </div>

              <div className="flex items-center gap-3 col-span-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active (visible to users)</Label>
              </div>
            </div>

            {/* Preview */}
            <div 
              className="p-6 rounded-lg flex flex-col items-center gap-3"
              style={{ 
                backgroundColor: `${formData.color}10`,
                border: `2px solid ${formData.color}`
              }}
            >
              <span style={{ fontSize: '48px' }}>{formData.emoji || '😊'}</span>
              <p style={{ fontWeight: 'var(--font-weight-medium)', color: formData.color }}>
                {formData.label || 'Mood Label'}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Value: {formData.value} / 10
              </p>
            </div>

            <div className="flex gap-2">
              {editingId ? (
                <Button onClick={() => handleUpdate(editingId)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              ) : (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Mood Type
                </Button>
              )}
              <Button variant="outline" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moods List */}
      <Card>
        <CardHeader>
          <CardTitle>All Mood Types ({moods.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {moods.length === 0 ? (
            <div className="text-center py-12">
              <Smile className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>
                No mood types yet. Create your first mood type to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {moods
                .sort((a, b) => a.order - b.order)
                .map(mood => (
                  <div
                    key={mood.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ 
                      backgroundColor: editingId === mood.id 
                        ? 'var(--color-accent-default)' 
                        : 'var(--color-bg-muted)',
                      border: editingId === mood.id 
                        ? '2px solid var(--color-primary-default)' 
                        : '1px solid var(--color-border-default)',
                      opacity: mood.is_active ? 1 : 0.5
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <GripVertical 
                        className="w-4 h-4 cursor-move" 
                        style={{ color: 'var(--color-text-muted)' }} 
                      />
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${mood.color}20` }}
                      >
                        <span style={{ fontSize: '32px' }}>{mood.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{mood.label}</p>
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: mood.color,
                              color: 'white'
                            }}
                          >
                            {mood.value}/10
                          </span>
                          {!mood.is_active && (
                            <AdminStatusBadge status="inactive" />
                          )}
                        </div>
                        {mood.description && (
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                            {mood.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={mood.is_active}
                        onCheckedChange={() => handleToggleActive(mood.id, mood.is_active)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(mood)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(mood.id)}
                      >
                        <Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger-default)' }} />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Mood Types Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <span style={{ fontSize: '24px' }}>📊</span>
            <div>
              <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Numeric Values</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Assign values 1-10 to track mood over time. Lower numbers = negative moods, higher = positive moods.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span style={{ fontSize: '24px' }}>🎨</span>
            <div>
              <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Colors & Emojis</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Use colors and emojis to make mood tracking intuitive and engaging for users.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span style={{ fontSize: '24px' }}>🔄</span>
            <div>
              <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Reorder Moods</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Drag and drop (coming soon) to reorder mood options. Typically arranged from lowest to highest value.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}