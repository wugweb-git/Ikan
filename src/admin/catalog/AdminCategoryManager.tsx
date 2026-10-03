import { useState, useEffect } from 'react';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { FolderOpen, Pencil, Trash2, RefreshCw, Download, Search, Plus } from 'lucide-react';
import { apiClient } from '../../shared/api/api';
import { useNotifications } from '../../shared/state/NotificationContext';
import { useAdminResource } from '../ui/hooks/useAdminResource';
import { useBlockUsage } from '../ui/hooks/useBlockUsage';
import { useConfirm } from '../ui/kit/ConfirmDialog';
import { cn } from '../ui/utils';
import { invalidateMetadataCache } from '../ui/hooks/useMetadata';
import { METADATA_CATALOG_ITEMS, METADATA_TYPE_LABELS, METADATA_TYPE_ICONS, METADATA_TYPE_GROUPS, type MetadataType } from './metadata-catalog';
import { Skeleton } from '../ui/skeleton-loader';
import { CategoryItemForm, catalogIcon, DEFAULT_ITEM_COLOR, type CategoryItem } from './CategoryItemForm';

export type { CategoryItem };

/** `getAdminCategories` resolves `null` when the store could not be read. */
class CatalogUnreadable extends Error {}

/*
  `ALL_TYPES` was here — a 21-entry list used in exactly ONE place, the header's
  denominator, while the sidebar rendered `METADATA_TYPE_GROUPS` (22 types). The
  page therefore said "21 types" above 22 tabs, and `response_tier` — 3 live
  rows, in the `MetadataType` union and in the groups — had no tab because it
  was absent from this list and nothing else consulted it.

  Deleted rather than corrected: a second list of the same thing is what let
  them disagree. `shownTypes` below derives from the groups, so the count and
  the tabs come from one source. Mood types remain out of scope — they are
  managed in Check-in Scales. (The sidebar's `mood_type` "emoji" badge branch
  was removed as dead code: the groups never yield that type.)
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

export function AdminCategoryManager() {
  const { showToast } = useNotifications();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState<MetadataType>('category');
  const [items, setItems] = useState<CategoryItem[]>([]);
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
  const { usage, usageState } = useBlockUsage();

  /** How many live blocks (or days) carry this term, or null if we cannot say. */
  const liveCountFor = (type: MetadataType, item: CategoryItem): number | null => {
    if (usageState !== 'ok' || !usage) return null;
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
    color: DEFAULT_ITEM_COLOR,
    description: ''
  });

  /*
    The whole catalog, read once and filtered per tab. On failure `allItems` is
    NOT replaced, so the last good data stays on screen rather than an empty
    list that looks authoritative.
  */
  const { data: allItems, loading: isLoading, reload: loadAllItems } = useAdminResource<CategoryItem[]>(
    async () => {
      const allCategories = await apiClient.getAdminCategories();
      // `null` is "could not read", distinct from an empty catalog.
      if (allCategories === null) throw new CatalogUnreadable();
      const raw = (allCategories as CategoryItem[]).filter((item) => item && item.id);
      // Dedup by type::slug to prevent repeated entries from multiple syncs
      const seen = new Set<string>();
      return raw.filter((item: CategoryItem) => {
        const key = `${item.type}::${item.slug}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    {
      initialData: [],
      toastOnError: false,
      errorTitle: 'Failed to load metadata items',
      onSuccess: () => setLoadState('ok'),
      onError: (err) => {
        setLoadState('failed');
        showToast('error', err instanceof CatalogUnreadable
          ? 'Could not read the catalog — counts and Sync are unavailable'
          : 'Failed to load metadata items');
      },
    },
  );

  useEffect(() => {
    const filtered = allItems.filter((item) => item.type === activeTab);
    setItems(filtered);
  }, [activeTab, allItems]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: activeTab,
      icon: METADATA_TYPE_ICONS[activeTab] || 'tag',
      color: DEFAULT_ITEM_COLOR,
      description: ''
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.slug) {
      showToast('error', 'Name and Slug are required');
      return;
    }
    try {
      await apiClient.createCategory({ ...formData, name: formData.name, type: activeTab });
      showToast('success', 'Created successfully');
      loadAllItems();
      resetForm();
      invalidateMetadataCache();
    } catch {
      showToast('error', 'Failed to create item');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name || !formData.slug) {
      showToast('error', 'Name and Slug are required');
      return;
    }
    try {
      await apiClient.updateCategory(id, { ...formData, name: formData.name, type: activeTab });
      showToast('success', 'Updated successfully');
      loadAllItems();
      resetForm();
      invalidateMetadataCache();
    } catch {
      showToast('error', 'Failed to update item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({
      title: 'Are you sure you want to delete this item?',
      destructive: true,
      confirmLabel: 'Delete',
    }))) return;
    try {
      await apiClient.deleteCategory(id);
      showToast('success', 'Deleted successfully');
      loadAllItems();
      invalidateMetadataCache();
    } catch {
      showToast('error', 'Failed to delete item');
    }
  };

  const startEdit = (item: CategoryItem) => {
    setFormData(item);
    setEditingId(item.id);
    setIsCreating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSyncAll = async () => {
    if (!(await confirm({
      title: `This will sync ${METADATA_CATALOG_ITEMS.length} catalog items to KV.`,
      description: (
        <div className="space-y-2">
          <p>
            New items are created. Existing items keep their id, can_hold and activities,
            but have their icon, colour, description and display order OVERWRITTEN from the
            catalog file — any edit made here to those four fields is lost.
          </p>
          <p>Nothing is deleted.</p>
          <p>Proceed?</p>
        </div>
      ),
      confirmLabel: 'Proceed',
    }))) return;

    setIsSyncing(true);
    try {
      const response = await apiClient.request('/categories/sync', {
        method: 'POST',
        body: JSON.stringify({ items: METADATA_CATALOG_ITEMS, updateExisting: true }),
      }, true);

      const msg = response.updated
        ? `Sync complete: ${response.created} created, ${response.updated} updated, ${response.skipped} unchanged`
        : `Sync complete: ${response.created} created, ${response.skipped} already existed`;
      showToast('success', msg);
      invalidateMetadataCache();
      loadAllItems();
    } catch (error) {
      console.error('Metadata sync failed:', error);
      showToast('error', 'Failed to sync metadata');
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

  const deprecated = DEPRECATED_TYPES[activeTab];
  const ROUNDED = 'rounded-[var(--ikan-component-border-radius)]';
  const WARN_NOTE = 'p-3 rounded-lg bg-[var(--color-bg-muted)] border-l-2 border-[var(--color-status-warning)] text-xs';

  return (
    <AdminPageLayout
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
            className={cn('gap-2 font-medium', ROUNDED)}
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
      maxWidth="2xl"
    >
      <div className="flex gap-6">
        {/* ── Left Sidebar: Type Navigation ── */}
        <div className="w-[260px] shrink-0 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {METADATA_TYPE_GROUPS.map((group) => {
            const GroupIcon = catalogIcon(group.icon);
            return (
              <div key={group.key} className="mb-3">
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-[0.05em] px-3 py-1 mb-1">
                  <GroupIcon className="w-3 h-3 opacity-60" />
                  {group.label}
                </div>
                {group.types.map((type) => {
                  const isActive = activeTab === type;
                  const count = countByType(type);
                  const SidebarIcon = catalogIcon(METADATA_TYPE_ICONS[type], type);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setActiveTab(type);
                        resetForm();
                        setSearchQuery('');
                      }}
                      className={cn(
                        'w-full text-left flex items-center gap-3 rounded-md transition-colors px-3 py-2 text-sm',
                        isActive
                          ? 'bg-[var(--color-primary-default)] text-white font-medium'
                          : 'bg-transparent text-[var(--color-text-primary)] font-normal',
                      )}
                    >
                      <SidebarIcon className={cn('w-4 h-4 shrink-0', isActive ? 'opacity-100' : 'opacity-60')} />
                      <span className="truncate flex-1">{METADATA_TYPE_LABELS[type]}</span>
                      <span
                        className={cn(
                          'shrink-0 rounded-full min-w-[24px] text-center text-xs px-2 py-0.5',
                          isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]',
                        )}
                      >
                        {count === null ? '—' : count}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── Right Content ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${getTabLabel(activeTab).toLowerCase()}...`}
                className={cn('pl-9 bg-[var(--color-bg-input)]', ROUNDED)}
              />
            </div>
            <Button
              onClick={() => { resetForm(); setIsCreating(true); }}
              disabled={!!deprecated}
              title={deprecated ? 'This vocabulary has no reader — adding a row would change nothing' : undefined}
              className={cn('gap-2 shrink-0 font-medium', ROUNDED)}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingId) && (
            <CategoryItemForm
              formData={formData}
              setFormData={setFormData}
              isCreating={isCreating}
              isEditing={!!editingId}
              itemLabel={getTabLabel(activeTab).replace(/s$/, '')}
              onCancel={resetForm}
              onSubmit={() => (editingId ? handleUpdate(editingId) : handleCreate())}
            />
          )}

          {/* Items List */}
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="font-medium text-base">
                {getTabLabel(activeTab)} ({filteredItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-[var(--color-bg-muted)]">
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
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)]" />
                  <p className="text-[var(--color-text-muted)]">
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
                  {deprecated && (
                    <div className={WARN_NOTE}>
                      <div className="font-medium mb-1">
                        Deprecated — {deprecated.rows} rows, no reader.
                        Editing one changes nothing in the product.
                      </div>
                      <div className="text-[var(--color-text-muted)]">
                        {deprecated.why}
                      </div>
                      <div className="text-[var(--color-text-muted)] mt-1">
                        Use instead: <strong>{deprecated.instead}</strong>
                      </div>
                    </div>
                  )}
                  {usageState === 'failed' && USAGE_DIMENSION[activeTab] && (
                    <div className={WARN_NOTE}>
                      Usage feed unavailable — live counts read “—”. They are not zero.
                    </div>
                  )}
                  {filteredItems.map(item => {
                    const ItemIcon = catalogIcon(item.icon, activeTab);
                    const isEditing = editingId === item.id;
                    const liveCount = liveCountFor(activeTab, item);
                    const status = statusFor(activeTab, item);

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg transition-colors border',
                          isEditing
                            ? 'bg-[var(--color-accent-default)] border-[var(--color-primary-default)] ring-1 ring-[var(--color-primary-default)]'
                            : 'bg-[var(--color-bg-muted)] border-[var(--color-border-default)]',
                        )}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Icon + color badge — the row's own stored colour, so it stays inline */}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-[var(--color-border-default)]"
                            style={{ backgroundColor: item.color ? `${item.color}18` : 'var(--color-bg-card)' }}
                          >
                            <ItemIcon className="w-5 h-5" style={{ color: item.color || 'var(--color-text-muted)' }} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="truncate font-medium">{item.name}</p>
                              <span className="shrink-0 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-card)] px-2 py-0.5 rounded-sm border border-[var(--color-border-default)] font-mono">
                                {item.slug}
                              </span>
                            </div>
                            {item.description && (
                              <p className="truncate text-sm text-[var(--color-text-muted)] mt-1">
                                {item.description}
                              </p>
                            )}
                            {/* Same four-status model as the Block Type Viewer, same feed. */}
                            {status && (
                              <div className="flex items-center gap-3 flex-wrap text-xs mt-1">
                                {USAGE_DIMENSION[activeTab] && (
                                  <span className="text-[var(--color-text-muted)]">
                                    live:{' '}
                                    <strong className={(liveCount ?? 0) > 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}>
                                      {liveCount === null ? '—' : liveCount}
                                    </strong>
                                  </span>
                                )}
                                <span className="font-medium" style={{ color: STATUS_COLOUR[status] }}>
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
                          <Button variant="outline" size="sm" disabled={!!deprecated}
                                  title={deprecated ? 'Read-only — nothing reads this vocabulary' : undefined}
                                  onClick={() => startEdit(item)} className="rounded-md">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled={!!deprecated}
                                  title={deprecated ? 'Read-only — deprecated, but kept rather than deleted' : undefined}
                                  onClick={() => handleDelete(item.id)} className="rounded-md">
                            <Trash2 className="w-4 h-4 text-[var(--color-status-danger)]" />
                          </Button>
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
