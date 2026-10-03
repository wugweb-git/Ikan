import { useState, type ReactNode } from 'react';
import { BookOpen, PenTool, Calendar, Settings2, Zap } from 'lucide-react';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { ACTIVITIES as CANONICAL_SUBTYPES } from '../block-builder/model/vocabulary';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { useBlockTypeViewerData, INTERACTION_TYPES } from './useBlockTypeViewerData';
import { ResponseIdentityPanel } from './ResponseIdentityPanel';
import { InteractionsTab, BlockTypesTab, ActivitiesTab, type PreviewState } from './BlockTypeViewerTabs';

/**
 * Block Type Viewer — read-only reference of the block vocabulary, with live
 * usage. This file is layout and tab state only:
 *   - `useBlockTypeViewerData` — usage feed, catalog, everything derived
 *   - `BlockTypeViewerTabs`    — the three lists
 *   - `ResponseIdentityPanel`  — the cross-cutting `activityConfig.key` figures
 *   - `PreviewPanels` / `BlockPreview` / `EditorPreview` — the row previews
 */

type Tab = 'interactions' | 'blocktypes' | 'activities';

const TAB_ACTIVE: Record<Tab, string> = {
  interactions: 'bg-[var(--color-status-danger)] hover:bg-[var(--color-status-danger)] text-[var(--color-primary-on)]',
  blocktypes: 'bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-default)] text-[var(--color-primary-on)]',
  activities: 'bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-default)] text-[var(--color-primary-on)]',
};

export function AdminBlockTypeViewer() {
  // Five tabs became two (blocks.md §18 Phase 4.1). Retired: Interactions (it
  // IS the activity list), Check-in Blocks (its catalog bucket has no reader),
  // Day Config Presets (merged into block_type by Phase 1.1), and the
  // Legacy → Interaction mapping (kept only until the backfill; the retype
  // completed it, so the alias table is now history rather than a live map).
  // `interactions` is the landing view again. It was the default
  // (`useState<...>('interactions')`) before the five-tabs-to-two change
  // removed it, while its render code survived and went on printing
  // `block.previewHint` against a source that no longer existed.
  const [activeTab, setActiveTab] = useState<Tab>('interactions');

  /**
   * Which row has its preview open. One at a time — the previews are large, and
   * the point of the page is comparison across rows, not a wall of mocks.
   */
  const [openPreview, setOpenPreview] = useState<string | null>(null);
  const preview: PreviewState = {
    openPreview,
    togglePreview: (id) => setOpenPreview(openPreview === id ? null : id),
  };

  const data = useBlockTypeViewerData();
  const { usage, usageState, kvBlockTypes, statValues } = data;

  const stats = [
    {
      label: 'Block Types',
      value: statValues.blockTypes,
      icon: <BookOpen className="w-4 h-4 text-[var(--color-primary-default)]" />,
    },
    {
      label: 'Activities',
      value: statValues.activities,
      icon: <PenTool className="w-4 h-4 text-[var(--color-status-warning)]" />,
    },
    {
      label: 'Interaction Types',
      value: statValues.interactions,
      icon: <Zap className="w-4 h-4 text-[var(--color-status-danger)]" />,
    },
    {
      label: 'In use',
      value: statValues.inUse,
      icon: <Calendar className="w-4 h-4 text-[var(--color-status-success)]" />,
    },
    {
      label: 'Labels',
      value: statValues.labels,
      icon: <Settings2 className="w-4 h-4 text-[var(--color-text-muted)]" />,
    },
  ];

  const tabButton = (tab: Tab, content: ReactNode) => (
    <Button
      variant={activeTab === tab ? 'default' : 'outline'}
      onClick={() => setActiveTab(tab)}
      className={cn('gap-2', activeTab === tab && TAB_ACTIVE[tab])}
    >
      {content}
    </Button>
  );

  return (
    <AdminPageLayout
      title="Block Type Viewer"
      description="Read-only reference of all available content block types used across check-ins and programs"
      stats={stats}
      maxWidth="2xl"
    >
      {/*
        Response identity — cross-cutting, so it sits above the tabs rather than
        inside one. Every figure here is live; the page exists so that a thing
        with no reader cannot look the same as a thing in daily use.
      */}
      <ResponseIdentityPanel usage={usage} usageState={usageState} />

      <div className="flex gap-2 flex-wrap">
        {tabButton('interactions', <><Zap className="w-4 h-4" /> Interactions ({INTERACTION_TYPES.length})</>)}
        {tabButton('blocktypes', <><BookOpen className="w-4 h-4" /> Block Types ({kvBlockTypes.length})</>)}
        {/* The VOCABULARY's count, not the row count. The tab listed 68 —
            twenty-nine activities plus the retired list — which made the page
            contradict its own tile. */}
        {tabButton('activities', <><PenTool className="w-4 h-4" /> Activities ({CANONICAL_SUBTYPES.length})</>)}
      </div>

      {activeTab === 'interactions' && <InteractionsTab data={data} />}
      {activeTab === 'blocktypes' && <BlockTypesTab data={data} preview={preview} />}
      {activeTab === 'activities' && <ActivitiesTab data={data} preview={preview} />}
    </AdminPageLayout>
  );
}
