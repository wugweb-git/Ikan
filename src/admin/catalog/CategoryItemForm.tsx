import type { Dispatch, SetStateAction } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { METADATA_TYPE_ICONS, type MetadataType } from './metadata-catalog';
import { getIconComponent } from './catalog-icons';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: MetadataType;
  icon?: string;
  color?: string;
  description?: string;
  /** Display rank, low to high. Absent means "keep the existing position". */
  sort_order?: number;
}

/*
  The icon registry moved to `src/lib/catalog-icons.ts` (2026-09-08) so the
  Block Type Viewer can read the same map. It had been local to this file, which
  is why that screen grew its own thirteen-entry copy for interactions and drew
  nothing at all for block types and activities — every one of which carries an
  icon in the catalog.
*/
/** Resolves icon component: item.icon → ICON_MAP, falls back to type-default, then Tag */
export function catalogIcon(iconKey?: string, metadataType?: MetadataType) {
  return getIconComponent(iconKey, metadataType ? METADATA_TYPE_ICONS[metadataType] : undefined);
}

/** Default colour for a new row (the primary preset). */
export const DEFAULT_ITEM_COLOR = '#2A2A2A';

// Curated picker options (grouped for the dropdown)
const ICON_PICKER_OPTIONS = [
  { group: 'General', items: [
    { value: 'folder', label: 'Folder' }, { value: 'tag', label: 'Tag' }, { value: 'file-text', label: 'File Text' },
    { value: 'sparkles', label: 'Sparkles' }, { value: 'flag', label: 'Flag' }, { value: 'filter', label: 'Filter' },
  ]},
  { group: 'Health & Wellness', items: [
    { value: 'heart', label: 'Heart' }, { value: 'heart-handshake', label: 'Heart Handshake' }, { value: 'heart-pulse', label: 'Heart Pulse' },
    { value: 'brain', label: 'Brain' }, { value: 'activity', label: 'Activity' }, { value: 'stethoscope', label: 'Stethoscope' },
    { value: 'thermometer', label: 'Thermometer' }, { value: 'apple', label: 'Apple' },
  ]},
  { group: 'Emotions & Weather', items: [
    { value: 'smile', label: 'Smile' }, { value: 'frown', label: 'Frown' }, { value: 'meh', label: 'Meh' },
    { value: 'angry', label: 'Angry' }, { value: 'sun', label: 'Sun' }, { value: 'cloud', label: 'Cloud' },
    { value: 'cloud-lightning', label: 'Lightning' }, { value: 'moon', label: 'Moon' },
  ]},
  { group: 'People', items: [
    { value: 'user', label: 'User' }, { value: 'users', label: 'Users' }, { value: 'user-check', label: 'User Check' },
    { value: 'baby', label: 'Baby' }, { value: 'graduation-cap', label: 'Graduation' },
    { value: 'briefcase', label: 'Briefcase' },
  ]},
  { group: 'Communication', items: [
    { value: 'video', label: 'Video' }, { value: 'phone', label: 'Phone' }, { value: 'message-square', label: 'Message' },
    { value: 'message-circle', label: 'Chat' }, { value: 'globe', label: 'Globe' }, { value: 'map-pin', label: 'Map Pin' },
  ]},
  { group: 'Content & Media', items: [
    { value: 'book', label: 'Book' }, { value: 'book-open', label: 'Book Open' }, { value: 'notebook', label: 'Notebook' },
    { value: 'mic', label: 'Mic' }, { value: 'headphones', label: 'Headphones' }, { value: 'image', label: 'Image' },
    { value: 'film', label: 'Film' }, { value: 'palette', label: 'Palette' }, { value: 'pen-tool', label: 'Pen Tool' }, { value: 'calendar', label: 'Calendar' },
  ]},
  { group: 'Actions & Status', items: [
    { value: 'target', label: 'Target' }, { value: 'compass', label: 'Compass' }, { value: 'zap', label: 'Zap' },
    { value: 'flame', label: 'Flame' }, { value: 'shield', label: 'Shield' }, { value: 'shield-check', label: 'Shield Check' },
    { value: 'shield-alert', label: 'Shield Alert' }, { value: 'eye', label: 'Eye' }, { value: 'link', label: 'Link' },
  ]},
  { group: 'Controls & Lists', items: [
    { value: 'sliders-horizontal', label: 'Sliders' }, { value: 'toggle-left', label: 'Toggle' },
    { value: 'list-checks', label: 'List Checks' }, { value: 'circle-check', label: 'Circle Check' },
    { value: 'clipboard-list', label: 'Clipboard List' }, { value: 'clipboard-check', label: 'Clipboard Check' },
    { value: 'mouse-pointer-click', label: 'Click' },
  ]},
  { group: 'Charts & Layout', items: [
    { value: 'signal', label: 'Signal' }, { value: 'bar-chart', label: 'Bar Chart' }, { value: 'trending-up', label: 'Trending Up' },
    { value: 'layout-grid', label: 'Grid' }, { value: 'blocks', label: 'Blocks' },
    { value: 'repeat', label: 'Repeat' }, { value: 'scale', label: 'Scale' },
  ]},
];

// Stored colour VALUES for catalog rows (data, not styling).
const COLOR_PRESETS = [
  { value: '#2A2A2A', label: 'Primary' },
  { value: '#E9EBEF', label: 'Accent' },
  { value: '#22C55E', label: 'Green' },
  { value: '#D4183D', label: 'Red' },
  { value: '#EAB308', label: 'Yellow' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#F97316', label: 'Orange' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#6366F1', label: 'Indigo' },
];

const FIELD = 'bg-[var(--color-bg-input)] rounded-[var(--ikan-component-border-radius)]';
const ROUNDED = 'rounded-[var(--ikan-component-border-radius)]';

/** The create / edit card for one catalog row. */
export function CategoryItemForm({ formData, setFormData, isCreating, isEditing, itemLabel, onCancel, onSubmit }: {
  formData: Partial<CategoryItem>;
  setFormData: Dispatch<SetStateAction<Partial<CategoryItem>>>;
  isCreating: boolean;
  /** Editing an existing row: the slug no longer follows the name. */
  isEditing: boolean;
  /** Singular label of the active type, e.g. "Category". */
  itemLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const SelectedIcon = catalogIcon(formData.icon);
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="font-medium text-base">
          {isCreating ? 'Create New' : 'Edit'} {itemLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-medium">Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                setFormData(prev => ({ ...prev, name, slug: isEditing ? prev.slug : slug }));
              }}
              placeholder="Name"
              className={FIELD}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">Slug</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="url-friendly-slug"
              className={FIELD}
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label className="font-medium">Icon</Label>
            <Select value={formData.icon || 'tag'} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
              <SelectTrigger className={FIELD}>
                <SelectValue>
                  <div className="flex items-center gap-2"><SelectedIcon className="w-4 h-4" /><span>{formData.icon || 'tag'}</span></div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[320px]">
                {ICON_PICKER_OPTIONS.map(group => (
                  <div key={group.group}>
                    <div className="px-2 py-1.5 text-xs text-[var(--color-text-muted)] font-medium">
                      {group.group}
                    </div>
                    {group.items.map(item => {
                      const Ic = catalogIcon(item.value);
                      return (
                        <SelectItem key={item.value} value={item.value}>
                          <div className="flex items-center gap-2">
                            <Ic className="w-4 h-4" />
                            {item.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label className="font-medium">Color</Label>
            <div className="flex gap-2">
              <Select value={formData.color || DEFAULT_ITEM_COLOR} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                <SelectTrigger className={FIELD}>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: formData.color || DEFAULT_ITEM_COLOR }} />
                      <span>{COLOR_PRESETS.find(p => p.value === formData.color)?.label || formData.color}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {COLOR_PRESETS.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.value }} />
                        {preset.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="color"
                value={formData.color || DEFAULT_ITEM_COLOR}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-12 h-10 rounded cursor-pointer border border-[var(--color-border-default)]"
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <Label className="font-medium">Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description"
              className={FIELD}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">Display order</Label>
            <Input
              type="number"
              value={formData.sort_order ?? ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                sort_order: e.target.value === '' ? undefined : Number(e.target.value),
              }))}
              placeholder="e.g. 120 — lower comes first"
              className={FIELD}
            />
            <p className="text-xs text-[var(--color-text-muted)]">
              Lower sorts first. Rows without one keep their existing position, after the
              ordered ones — so leaving this blank changes nothing rather than sending the
              row to the top or the bottom. Catalog rows are seeded in tens, leaving room
              to insert.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} className={ROUNDED}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          {isEditing ? (
            <Button onClick={onSubmit} className={ROUNDED}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          ) : (
            <Button onClick={onSubmit} className={ROUNDED}>
              <Plus className="w-4 h-4 mr-2" /> Create
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
