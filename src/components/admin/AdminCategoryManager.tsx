import { useState, useEffect } from 'react';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Plus, X, Save, FolderOpen, Pencil, Trash2, FileText, Tag, Filter, Type, Sparkles, ShieldCheck,
  RefreshCw, Download, Search, Folder,
  Heart, HeartHandshake, HeartPulse,
  Brain, Activity, Zap, Flame, Sun, Moon, Cloud, CloudLightning,
  Target, Compass, Scale,
  Smile, Frown, Meh, Angry,
  Eye,
  User, Users, UserCheck, Baby, GraduationCap,
  Briefcase,
  Stethoscope, Thermometer,
  Globe, MapPin,
  Video, Phone, MessageSquare, MessageCircle,
  Mic, Headphones,
  Book, BookOpen, Notebook, Library,
  Image, Film,
  Clipboard, ClipboardList, ClipboardCheck,
  List, ListChecks, CircleCheck,
  SlidersHorizontal, ToggleLeft,
  MousePointerClick,
  LayoutGrid, Blocks,
  Signal, BarChart, TrendingUp,
  Link,
  AlertTriangle, CircleAlert,
  Repeat,
  Wrench, Settings,
  Palette, PenTool, Calendar,
  FileCheck, Flag, Tags,
  ShieldAlert, Shield,
  Apple,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { toast } from 'sonner@2.0.3';
import { invalidateMetadataCache } from '../../hooks/useMetadata';
import { SEED_DATA, METADATA_TYPE_LABELS, METADATA_TYPE_ICONS, METADATA_TYPE_GROUPS, type MetadataType } from '../../lib/metadata-seed';
import { Skeleton } from '../ui/skeleton-loader';
import { AdminMoodManager } from './AdminMoodManager';

export interface AdminCategoryManagerProps {
  onBack: () => void;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: MetadataType;
  icon?: string;
  color?: string;
  description?: string;
}

// ── Icon Registry ──────────────────────────────────────────────────
const ICON_MAP: Record<string, any> = {
  'folder': Folder, 'folder-open': FolderOpen, 'file-text': FileText, 'file': FileText, 'file-check': FileCheck,
  'tag': Tag, 'tags': Tags, 'filter': Filter, 'type': Type, 'sparkles': Sparkles,
  'shield': Shield, 'shield-check': ShieldCheck, 'shield-alert': ShieldAlert,
  'heart': Heart, 'heart-handshake': HeartHandshake, 'heart-pulse': HeartPulse,
  'brain': Brain, 'activity': Activity, 'zap': Zap, 'flame': Flame, 'sun': Sun, 'moon': Moon, 'cloud': Cloud, 'cloud-lightning': CloudLightning,
  'target': Target, 'compass': Compass, 'scale': Scale,
  'smile': Smile, 'frown': Frown, 'meh': Meh, 'angry': Angry,
  'eye': Eye,
  'user': User, 'users': Users, 'user-check': UserCheck, 'baby': Baby, 'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'stethoscope': Stethoscope, 'thermometer': Thermometer,
  'globe': Globe, 'map-pin': MapPin,
  'video': Video, 'phone': Phone, 'message-square': MessageSquare, 'message-circle': MessageCircle,
  'mic': Mic, 'headphones': Headphones,
  'book': Book, 'book-open': BookOpen, 'notebook': Notebook, 'library': Library,
  'image': Image, 'film': Film,
  'clipboard': Clipboard, 'clipboard-list': ClipboardList, 'clipboard-check': ClipboardCheck,
  'list': List, 'list-checks': ListChecks, 'circle-check': CircleCheck,
  'sliders-horizontal': SlidersHorizontal, 'toggle-left': ToggleLeft,
  'mouse-pointer-click': MousePointerClick,
  'layout-grid': LayoutGrid, 'blocks': Blocks,
  'signal': Signal, 'bar-chart': BarChart, 'trending-up': TrendingUp,
  'link': Link,
  'alert-triangle': AlertTriangle, 'alert-circle': CircleAlert,
  'refresh-cw': RefreshCw, 'repeat': Repeat,
  'tool': Wrench, 'wrench': Wrench, 'settings': Settings,
  'palette': Palette, 'pen-tool': PenTool, 'calendar': Calendar,
  'flag': Flag,
  'apple': Apple,
};

/** Resolves icon component: item.icon → ICON_MAP, falls back to type-default, then Tag */
function getIconComponent(iconKey?: string, metadataType?: MetadataType): any {
  if (iconKey && ICON_MAP[iconKey]) return ICON_MAP[iconKey];
  // Type-specific fallback
  if (metadataType) {
    const typeDefault = METADATA_TYPE_ICONS[metadataType];
    if (typeDefault && ICON_MAP[typeDefault]) return ICON_MAP[typeDefault];
  }
  return Tag;
}

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

// All metadata types — mood_type embeds AdminMoodManager inline
const ALL_TYPES: MetadataType[] = [
  'category',
  'content_type',
  'filter_type',
  'media_type',
  'block_type',
  'interaction_type',
  'exercise_subtype',
  'day_config_type',
  'difficulty_level',
  'assessment_type',
  'scoring_method',
  'severity_level',
  'ema_category',
  'consultant_type',
  'language',
  'therapeutic_approach',
  'demographic_specialty',
  'expertise_category',
  'session_format',
  'account_type',
  'mood_type',
  'checkin_block_type',
];

export function AdminCategoryManager({ onBack }: AdminCategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<MetadataType>('category');
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [allItems, setAllItems] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<Partial<CategoryItem>>({
    name: '',
    slug: '',
    type: 'category',
    icon: 'folder',
    color: '#2A2A2A',
    description: ''
  });

  useEffect(() => {
    loadAllItems();
  }, []);

  useEffect(() => {
    const filtered = allItems.filter((item) => item.type === activeTab);
    setItems(filtered);
  }, [activeTab, allItems]);

  const loadAllItems = async () => {
    setIsLoading(true);
    try {
      const allCategories = await apiClient.getAdminCategories();
      const raw = (Array.isArray(allCategories) ? allCategories : allCategories.categories || []).filter(
        (item: CategoryItem) => item && item.id
      );
      // Dedup by type::slug to prevent repeated entries from multiple syncs
      const seen = new Set<string>();
      const valid = raw.filter((item: CategoryItem) => {
        const key = `${item.type}::${item.slug}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setAllItems(valid);
    } catch (error) {
      toast.error('Failed to load metadata items');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: activeTab,
      icon: METADATA_TYPE_ICONS[activeTab] || 'tag',
      color: '#2A2A2A',
      description: ''
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and Slug are required');
      return;
    }
    try {
      await apiClient.createCategory({ ...formData, type: activeTab });
      toast.success('Created successfully');
      loadAllItems();
      resetForm();
      invalidateMetadataCache();
    } catch (error) {
      toast.error('Failed to create item');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and Slug are required');
      return;
    }
    try {
      await apiClient.updateCategory(id, { ...formData, type: activeTab });
      toast.success('Updated successfully');
      loadAllItems();
      resetForm();
      invalidateMetadataCache();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiClient.deleteCategory(id);
      toast.success('Deleted successfully');
      loadAllItems();
      invalidateMetadataCache();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const startEdit = (item: CategoryItem) => {
    setFormData(item);
    setEditingId(item.id);
    setIsCreating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSyncAll = async () => {
    if (!confirm(
      `This will sync ${SEED_DATA.length} metadata items to KV.\n\nNew items will be created and existing items will have their icons/colors updated.\n\nProceed?`
    )) return;

    setIsSyncing(true);
    try {
      const response = await apiClient.request('/categories/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: SEED_DATA, updateExisting: true }),
      }, true);
      
      const msg = response.updated
        ? `Sync complete: ${response.created} created, ${response.updated} updated, ${response.skipped} unchanged`
        : `Sync complete: ${response.created} created, ${response.skipped} already existed`;
      toast.success(msg);
      invalidateMetadataCache();
      loadAllItems();
    } catch (error) {
      console.error('Metadata sync failed:', error);
      toast.error('Failed to sync metadata');
    } finally {
      setIsSyncing(false);
    }
  };

  const getTabLabel = (tab: MetadataType) => METADATA_TYPE_LABELS[tab] || tab;
  const countByType = (type: MetadataType) => allItems.filter(i => i.type === type).length;

  const filteredItems = searchQuery
    ? items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.slug.includes(searchQuery.toLowerCase()))
    : items;

  // Check if mood_type tab is active — render AdminMoodManager inline
  const isMoodTab = activeTab === 'mood_type';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Meta Manager"
        description={`Manage all metadata types (${allItems.length} total items across ${ALL_TYPES.length} types)`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="gap-2"
              style={{
                borderRadius: 'var(--ikan-component-border-radius)',
                fontFamily: 'var(--font-family-base)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync All Metadata'}
            </Button>
          </div>
        }
      />

      <div className="flex gap-6">
        {/* ── Left Sidebar: Type Navigation ── */}
        <div className="w-[260px] shrink-0 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {METADATA_TYPE_GROUPS.map((group) => {
            const GroupIcon = getIconComponent(group.icon);
            return (
              <div key={group.key} className="mb-3">
                <div
                  className="flex items-center gap-2"
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-base)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '4px 12px 4px',
                    marginBottom: '4px',
                  }}
                >
                  <GroupIcon className="w-3 h-3" style={{ opacity: 0.6 }} />
                  {group.label}
                </div>
                {group.types.map((type) => {
                  const isActive = activeTab === type;
                  const count = countByType(type);
                  const SidebarIcon = getIconComponent(METADATA_TYPE_ICONS[type], type);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setActiveTab(type);
                        resetForm();
                        setSearchQuery('');
                      }}
                      className="w-full text-left flex items-center gap-3 rounded-lg transition-colors"
                      style={{
                        padding: '8px 12px',
                        backgroundColor: isActive ? 'var(--color-primary-default)' : 'transparent',
                        color: isActive ? 'white' : 'var(--color-text-primary)',
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <SidebarIcon className="w-4 h-4 shrink-0" style={{ opacity: isActive ? 1 : 0.6 }} />
                      <span className="truncate flex-1">{METADATA_TYPE_LABELS[type]}</span>
                      {type !== 'mood_type' && (
                        <span
                          className="shrink-0 rounded-full min-w-[24px] text-center"
                          style={{
                            fontSize: 'var(--text-xs)',
                            padding: '2px 8px',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-muted)',
                            color: isActive ? 'white' : 'var(--color-text-muted)',
                          }}
                        >
                          {count}
                        </span>
                      )}
                      {type === 'mood_type' && (
                        <span
                          className="shrink-0 rounded-full"
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-muted)',
                            color: isActive ? 'white' : 'var(--color-text-muted)',
                            fontFamily: 'var(--font-family-base)',
                          }}
                        >
                          emoji
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── Right Content ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {isMoodTab ? (
            /* ── Mood Types: Embed AdminMoodManager ── */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)' }}>
                    Mood Types
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
                    Emoji-based mood types used in journal check-ins. Managed separately with emoji picker, numeric values, and active/inactive states.
                  </p>
                </div>
              </div>
              <AdminMoodManager embedded />
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${getTabLabel(activeTab).toLowerCase()}...`}
                    className="pl-9 bg-[var(--color-bg-input)]"
                    style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
                  />
                </div>
                <Button
                  onClick={() => { resetForm(); setIsCreating(true); }}
                  className="gap-2 shrink-0"
                  style={{
                    borderRadius: 'var(--ikan-component-border-radius)',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {/* Create/Edit Form */}
              {(isCreating || editingId) && (
                <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-base)' }}>
                      {isCreating ? 'Create New' : 'Edit'} {getTabLabel(activeTab).replace(/s$/, '')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            setFormData(prev => ({ ...prev, name, slug: editingId ? prev.slug : slug }));
                          }}
                          placeholder="Name"
                          className="bg-[var(--color-bg-input)]"
                          style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>Slug</Label>
                        <Input
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="url-friendly-slug"
                          className="bg-[var(--color-bg-input)]"
                          style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
                        />
                      </div>

                      {/* Icon Picker */}
                      <div className="space-y-2">
                        <Label style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>Icon</Label>
                        <Select value={formData.icon || 'tag'} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                          <SelectTrigger className="bg-[var(--color-bg-input)]" style={{ borderRadius: 'var(--ikan-component-border-radius)' }}>
                            <SelectValue>
                              {(() => { const Ic = getIconComponent(formData.icon); return <div className="flex items-center gap-2"><Ic className="w-4 h-4" /><span>{formData.icon || 'tag'}</span></div>; })()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-[320px]">
                            {ICON_PICKER_OPTIONS.map(group => (
                              <div key={group.group}>
                                <div className="px-2 py-1.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                                  {group.group}
                                </div>
                                {group.items.map(item => {
                                  const Ic = getIconComponent(item.value);
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
                        <Label style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>Color</Label>
                        <div className="flex gap-2">
                          <Select value={formData.color || '#2A2A2A'} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                            <SelectTrigger className="bg-[var(--color-bg-input)]" style={{ borderRadius: 'var(--ikan-component-border-radius)' }}>
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded" style={{ backgroundColor: formData.color || '#2A2A2A' }} />
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
                            value={formData.color || '#2A2A2A'}
                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                            className="w-12 h-10 rounded cursor-pointer border border-[var(--color-border-default)]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>Description</Label>
                        <Input
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description"
                          className="bg-[var(--color-bg-input)]"
                          style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={resetForm} style={{ borderRadius: 'var(--ikan-component-border-radius)' }}>
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                      {editingId ? (
                        <Button onClick={() => handleUpdate(editingId)} style={{ borderRadius: 'var(--ikan-component-border-radius)' }}>
                          <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                      ) : (
                        <Button onClick={handleCreate} style={{ borderRadius: 'var(--ikan-component-border-radius)' }}>
                          <Plus className="w-4 h-4 mr-2" /> Create
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items List */}
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardHeader>
                  <CardTitle style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-base)' }}>
                    {getTabLabel(activeTab)} ({filteredItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32 rounded" />
                            <Skeleton className="h-3 w-48 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <FolderOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                      <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : `No ${getTabLabel(activeTab).toLowerCase()} found. Click "Add" to create one, or use "Sync All Metadata" to populate.`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredItems.map(item => {
                        const ItemIcon = getIconComponent(item.icon, activeTab);
                        const isEditing = editingId === item.id;
                        
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-4 rounded-lg transition-colors border ${
                               isEditing 
                               ? 'bg-[var(--color-accent-default)] border-[var(--color-primary-default)] ring-1 ring-[var(--color-primary-default)]' 
                               : 'bg-[var(--color-bg-muted)] border-[var(--color-border-default)]'
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {/* Icon + color badge */}
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: item.color ? `${item.color}18` : 'var(--color-bg-card)',
                                  border: '1px solid var(--color-border-default)',
                                }}
                              >
                                <ItemIcon className="w-5 h-5" style={{ color: item.color || 'var(--color-text-muted)' }} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <p className="truncate" style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }}>{item.name}</p>
                                  <span 
                                    className="shrink-0"
                                    style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-card)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-default)', fontFamily: 'monospace' }}
                                  >
                                    {item.slug}
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="truncate" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <Button variant="outline" size="sm" onClick={() => startEdit(item)} style={{ borderRadius: 'var(--radius-md)' }}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} style={{ borderRadius: 'var(--radius-md)' }}>
                                <Trash2 className="w-4 h-4" style={{ color: 'var(--color-status-danger)' }} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}