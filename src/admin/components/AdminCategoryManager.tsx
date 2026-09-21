import { useState, useEffect } from 'react';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Plus, X, Save, FolderOpen, Pencil, Trash2, RefreshCw, Download, Search,
} from 'lucide-react';
import { apiClient } from '../../shared/api-client';
import { toast } from 'sonner';
import { invalidateMetadataCache } from '../../shared/hooks/useMetadata';
import { METADATA_CATALOG_ITEMS, METADATA_TYPE_LABELS, METADATA_TYPE_ICONS, METADATA_TYPE_GROUPS, type MetadataType } from '../../shared/lib/metadata-catalog';
import { Skeleton } from '../ui/skeleton-loader';
import { getIconComponent as sharedGetIconComponent } from '../lib/catalog-icons';

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
  /**
   * `block_type` rows only: which block types this row can contain. Non-empty
   * means it is a STAGE, which changes how its live count must be read — a
   * stage is counted by the days that carry it, never by blocks.
   */
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
function getIconComponent(iconKey?: string, metadataType?: MetadataType): any {
  return sharedGetIconComponent(iconKey, metadataType ? METADATA_TYPE_ICONS[metadataType] : undefined);
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

/*
  `ALL_TYPES` was here — a 21-entry list used in exactly ONE place, the header's
  denominator, while the sidebar rendered `METADATA_TYPE_GROUPS` (22 types). The
  page therefore said "21 types" above 22 tabs, and `response_tier` — 3 live
  rows, in the `MetadataType` union and in the groups — had no tab because it
  was absent from this list and nothing else consulted it.

  Deleted rather than corrected: a second list of the same thing is what let
  them disagree. `shownTypes` below derives from the groups, so the count and
  the tabs come from one source. Mood types remain out of scope — they are
  managed in Check-in Scales, and the `mood_type` branches further down are dead
  because the groups never yield it.
*/

/**
 * Vocabularies this screen still edits that nothing reads. Audited 2026-09-08.
 *
 * Neither is deleted — a row that is editable but dead must SAY so, which is
 * the whole standing rule. Both keep their tab, their rows and their edit
 * buttons; the page states what an edit will and will not affect.
 */
const DEPRECATED_TYPES: Partial<Record<MetadataType, { rows: number; why: string; instead: string }>> = {
  day_config_type: {
    rows: 11,
    why: 'Day types merged into `block_type` (blocks.md §18 Phase 1.1). The eleven stages now live '
       + 'there with the preset rules, and that is what DayComposer and the player read. The only '
       + 'remaining consumer of this bucket is `useMetadata` filling it.',
    instead: 'block_type — and the day templates in DAY_TYPE_PRESETS',
  },
  checkin_block_type: {
    rows: 7,
    why: 'The Check-in Builder is live, but it reads its own hardcoded `BLOCK_TYPES` array '
       + '(AdminCheckinTemplateBuilder.tsx:98) — six SNAKE_case values. These rows are seven '
       + 'KEBAB-case ones, so the two could never match even by accident, and `context-tags` exists '
       + 'here and nowhere else. Editing a row here changes nothing the builder offers.',
    instead: 'AdminCheckinTemplateBuilder.tsx:98, until that array is replaced by this bucket',
  },
};

/**
 * Which live-usage dimension answers "is this term actually used?".
 *
 * Only four of the twenty-one vocabularies have an answer, because
 * `/blocks/usage` counts block content. A type absent from this map shows no
 * count rather than a zero — the same rule the Block Type Viewer follows, for
 * the same reason: a confident zero is indistinguishable from genuinely unused.
 */
const USAGE_DIMENSION: Partial<Record<MetadataType, 'interactions' | 'blockTypes' | 'activities' | 'dayTypes'>> = {
  interaction_type: 'interactions',
  activity: 'activities',
  // A stage is never a block's type; its usage is the DAYS that carry it, so a
  // block_type row is counted one way if it is a stage and another if it is a
  // block. Resolved per row below.
  block_type: 'blockTypes',
  day_config_type: 'dayTypes',
};

type TermStatus = 'live' | 'wired-unused' | 'declared-unread' | 'orphan';
const STATUS_LABEL: Record<TermStatus, string> = {
  'live': 'Live', 'wired-unused': 'Wired, unused',
  'declared-unread': 'Declared, unread', 'orphan': 'Orphan',
};
const STATUS_COLOUR: Record<TermStatus, string> = {
  'live': 'var(--color-status-success)', 'wired-unused': 'var(--color-text-muted)',
  'declared-unread': 'var(--color-status-warning)', 'orphan': 'var(--color-status-danger)',
};

export function AdminCategoryManager({ onBack }: AdminCategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<MetadataType>('category');
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [allItems, setAllItems] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  /**
   * Whether the catalog was actually READ.
   *
   * `isLoading` alone cannot express this: a failed fetch and an empty store
   * both ended as `isLoading: false` with `allItems: []`, so the page rendered
   * a failure as a successful empty catalog and invited a reseed to fix it.
   */
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'failed'>('loading');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Live usage, from the same `/blocks/usage` feed the Block Type Viewer reads.
   * `null` means the feed failed — every count then renders as "—", never 0,
   * because a confident zero beside an editable row is indistinguishable from
   * genuinely unused and would invite exactly the deletion this page exists to
   * prevent.
   */
  const [usage, setUsage] = useState<Awaited<ReturnType<typeof apiClient.getBlockUsage>>>(null);
  const [usageState, setUsageState] = useState<'loading' | 'ok' | 'failed'>('loading');
  useEffect(() => {
    let alive = true;
    apiClient.getBlockUsage().then((u) => {
      if (!alive) return;
      setUsage(u);
      setUsageState(u ? 'ok' : 'failed');
    });
    return () => { alive = false; };
  }, []);

  /** How many live blocks (or days) carry this term, or null if we cannot say. */
  const liveCountFor = (type: MetadataType, item: CategoryItem): number | null => {
    if (usageState !== 'ok' || !usage) return null;
    // A block_type row that HOLDS blocks is a stage: counted by the days that
    // carry it, never by blocks, which would always read zero.
    // Counted by the blocks that ARE it. The stage branch is gone: no block
    // holds another, and a day no longer has a type for `dayTypes` to count.
    if (type === 'block_type') return usage.blockTypes[item.slug] ?? 0;
    const dim = USAGE_DIMENSION[type];
    return dim ? (usage[dim][item.slug] ?? 0) : null;
  };

  const statusFor = (type: MetadataType, item: CategoryItem): TermStatus | null => {
    // A vocabulary nothing reads: every row in it is declared and unread,
    // however many blocks happen to carry the string.
    if (DEPRECATED_TYPES[type]) return 'declared-unread';
    const count = liveCountFor(type, item);
    if (count === null) return null;
    return count > 0 ? 'live' : 'wired-unused';
  };
  
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
      // `null` is "could not read", distinct from an empty catalog. Bail before
      // touching `allItems`, so the last good data stays on screen rather than
      // being replaced by an empty list that looks authoritative.
      if (allCategories === null) {
        setLoadState('failed');
        toast.error('Could not read the catalog — counts and Sync are unavailable');
        return;
      }
      const raw = (allCategories as CategoryItem[]).filter((item) => item && item.id);
      // Dedup by type::slug to prevent repeated entries from multiple syncs
      const seen = new Set<string>();
      const valid = raw.filter((item: CategoryItem) => {
        const key = `${item.type}::${item.slug}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setAllItems(valid);
      setLoadState('ok');
    } catch (error) {
      setLoadState('failed');
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
      `This will sync ${METADATA_CATALOG_ITEMS.length} catalog items to KV.\n\n` +
      `New items are created. Existing items keep their id, can_hold and activities, ` +
      `but have their icon, colour, description and display order OVERWRITTEN from the ` +
      `catalog file — any edit made here to those four fields is lost.\n\nNothing is deleted.\n\nProceed?`
    )) return;

    setIsSyncing(true);
    try {
      const response = await apiClient.request('/categories/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: METADATA_CATALOG_ITEMS, updateExisting: true }),
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
  /**
   * `null` when the catalog could not be read. Rendered as "—", never 0 — a
   * confident zero here is what made a failed load look like an empty store
   * and put a reseed button beside it.
   */
  const countByType = (type: MetadataType): number | null =>
    loadState === 'failed' ? null : allItems.filter(i => i.type === type).length;

  /**
   * Every type the page actually shows, derived from the groups the sidebar
   * iterates rather than from a second hand-kept list.
   *
   * `ALL_TYPES` was a 21-entry array used in exactly one place — this header —
   * while the sidebar rendered `METADATA_TYPE_GROUPS`, which totals 22. So the
   * page said "21 types" above 22 tabs, and `response_tier` (3 live rows, in
   * the union, in the groups) had no tab at all. One source now, so they cannot
   * disagree again.
   */
  const shownTypes = METADATA_TYPE_GROUPS.flatMap((g) => g.types);

  const filteredItems = searchQuery
    ? items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.slug.includes(searchQuery.toLowerCase()))
    : items;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Meta Manager"
        description={loadState === 'failed'
          ? `Catalog unavailable — could not read the store. Counts show “—”; they are not zero.`
          : `Manage all metadata types (${allItems.length} total items across ${shownTypes.length} types)`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSyncAll}
              /*
                Sync posts all catalog items with `updateExisting: true`. It is
                not destructive — the server merges over the existing row and
                never deletes — but it overwrites icon, colour, description and
                sort_order on every matched row. Offering that while the page
                has not read the store is offering a write against data nobody
                has seen.
              */
              disabled={isSyncing || loadState !== 'ok'}
              title={loadState !== 'ok'
                ? 'Unavailable until the catalog has been read — Sync writes against the live store'
                : undefined}
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
                          {count === null ? '—' : count}
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
                  disabled={!!DEPRECATED_TYPES[activeTab]}
                  title={DEPRECATED_TYPES[activeTab] ? 'This vocabulary has no reader — adding a row would change nothing' : undefined}
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
                      <div className="space-y-2">
                        <Label style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>Display order</Label>
                        <Input
                          type="number"
                          value={formData.sort_order ?? ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            sort_order: e.target.value === '' ? undefined : Number(e.target.value),
                          }))}
                          placeholder="e.g. 120 — lower comes first"
                          className="bg-[var(--color-bg-input)]"
                          style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
                        />
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          Lower sorts first. Rows without one keep their existing position, after the
                          ordered ones — so leaving this blank changes nothing rather than sending the
                          row to the top or the bottom. Catalog rows are seeded in tens, leaving room
                          to insert.
                        </p>
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
                          : loadState === 'failed'
                            /*
                              The old copy said "…or use Sync All Metadata to
                              populate" in BOTH cases, so a failed read told the
                              operator the fix was a 200-row write against a
                              store the page had never opened.
                            */
                            ? 'The catalog could not be read, so this list is unknown rather than empty. Reload, or check that you are still signed in — do not sync.'
                            : `No ${getTabLabel(activeTab).toLowerCase()} found. Click "Add" to create one, or use "Sync All Metadata" to populate.`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/*
                        A vocabulary that is editable but unread says so, rather
                        than looking like every other tab. Not deleted — three
                        things in this codebase were deleted as unused and turned
                        out to be load-bearing.
                      */}
                      {DEPRECATED_TYPES[activeTab] && (
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-bg-muted)',
                            borderLeft: '2px solid var(--color-status-warning)',
                            fontSize: 'var(--text-xs)',
                            fontFamily: 'var(--font-family-base)',
                          }}
                        >
                          <div style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 4 }}>
                            Deprecated — {DEPRECATED_TYPES[activeTab]!.rows} rows, no reader.
                            Editing one changes nothing in the product.
                          </div>
                          <div style={{ color: 'var(--color-text-muted)' }}>
                            {DEPRECATED_TYPES[activeTab]!.why}
                          </div>
                          <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
                            Use instead: <strong>{DEPRECATED_TYPES[activeTab]!.instead}</strong>
                          </div>
                        </div>
                      )}
                      {usageState === 'failed' && USAGE_DIMENSION[activeTab] && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', borderLeft: '2px solid var(--color-status-warning)', fontSize: 'var(--text-xs)' }}>
                          Usage feed unavailable — live counts read “—”. They are not zero.
                        </div>
                      )}
                      {filteredItems.map(item => {
                        const ItemIcon = getIconComponent(item.icon, activeTab);
                        const isEditing = editingId === item.id;
                        const liveCount = liveCountFor(activeTab, item);
                        const status = statusFor(activeTab, item);

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
                                {/* Same four-status model as the Block Type Viewer, same feed. */}
                                {status && (
                                  <div className="flex items-center gap-3 flex-wrap" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--spacing-1)' }}>
                                    {USAGE_DIMENSION[activeTab] && (
                                      <span style={{ color: 'var(--color-text-muted)' }}>
                                        live:{' '}
                                        <strong style={{ color: (liveCount ?? 0) > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                                          {liveCount === null ? '—' : liveCount}
                                        </strong>
                                      </span>
                                    )}
                                    <span style={{ color: STATUS_COLOUR[status], fontWeight: 'var(--font-weight-medium)' }}>
                                      {STATUS_LABEL[status]}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {/*
                                A deprecated vocabulary stays visible and
                                readable — the standing rule — but is not
                                offered for editing, because an edit here has no
                                effect anywhere in the product and pretending
                                otherwise is the same lie as a confident zero.
                              */}
                              <Button variant="outline" size="sm" disabled={!!DEPRECATED_TYPES[activeTab]}
                                      title={DEPRECATED_TYPES[activeTab] ? 'Read-only — nothing reads this vocabulary' : undefined}
                                      onClick={() => startEdit(item)} style={{ borderRadius: 'var(--radius-md)' }}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" disabled={!!DEPRECATED_TYPES[activeTab]}
                                      title={DEPRECATED_TYPES[activeTab] ? 'Read-only — deprecated, but kept rather than deleted' : undefined}
                                      onClick={() => handleDelete(item.id)} style={{ borderRadius: 'var(--radius-md)' }}>
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
        </div>
      </div>
    </div>
  );
}