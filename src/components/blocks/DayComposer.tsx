import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Settings,
  Copy,
  ChevronRight,
  Calendar,
  Repeat,
} from 'lucide-react';
import { Button } from '../ui/button';
import { DayContent, Activity, activityOf, normalizeSubtype } from '../../lib/blocks/block-model';
import { useMetadata } from '../../hooks/useMetadata';
import { BlockEditor } from './BlockEditor';
import { getPresetForDayType, DAY_TYPE_PRESETS } from '../../lib/blocks/block-type-rules';
import { validateDay, hasBlockingIssues } from '../../lib/blocks/block-validation';
import { seedDayFromTemplate } from '../../lib/blocks/day-policy';
import type { DayType, ExerciseSubtype } from '../../lib/blocks/block-model';
import { cn } from '../ui/utils';
/* §21 layout port, phase 1 (2026-09-09): the day chip, the block row and the
   add-block palette moved to `components/builder/content/` unchanged. This file
   keeps the state, the mutations and the layout until phase 4 moves those too. */
import { DraggableDay } from '../builder/content/DayChip';
import { DraggableBlock } from '../builder/content/BlockRow';
import { BlockPaletteMenu } from '../builder/content/AddBlockMenu';
import { DayConfigPane } from '../builder/editor/DayConfigPane';

export interface DailyBuilderProps {
  program: { daily_content?: DayContent[] } & Record<string, any>;
  mode: 'equip' | 'assessment' | 'onboarding';
  singleDayMode: boolean;
  onProgramChange: (updates: Partial<{ daily_content: DayContent[] } & Record<string, any>>) => void;
  validationMode?: 'draft' | 'publish';
  readOnly?: boolean;
}

// --- HELPER: Collision-resistant block ID generator ---
let _blockIdCounter = 0;
function generateBlockId(): string {
  return `block-${Date.now()}-${++_blockIdCounter}-${Math.random().toString(36).substr(2, 6)}`;
}


// --- MAIN EDITOR COMPONENT ---
export function DayEditor({ 
  program, 
  mode, 
  singleDayMode, 
  onProgramChange, 
  validationMode = 'draft',
  readOnly = false 
}: DailyBuilderProps) {
  
  /* Memoised because `|| []` mints a new array on every render, and the row
     list's `otherDays` memo keys on it — without this the memoised block rows
     re-render on every keystroke in the editor. */
  const days = useMemo(() => program.daily_content || [], [program.daily_content]);
  // The stages a day may be. Container rows of the merged `block_type`
  /*
    The templates a day can be seeded from — the presets themselves, named from
    a closed union. This filtered catalog rows by `can_hold`, which no longer
    exists: a block type does not hold anything, and the list of TEMPLATES was
    never the same list as the block types anyway. They coincided only because
    the two vocabularies had been merged.
  */
  const stageRows = (Object.keys(DAY_TYPE_PRESETS) as DayType[]).map((slug) => ({
    value: slug,
    label: DAY_TYPE_PRESETS[slug].label,
    activities: DAY_TYPE_PRESETS[slug].allowedInteractions,
  }));

  /*
    The activity catalog, read once for the whole day list. Rows carry `icon`
    and `label`; the block row and the editor both draw from these, so an icon
    changed in Meta Manager changes everywhere at once. Aliases are resolved
    through `normalizeSubtype` first — a block storing `matrix` gets the
    `comparison-matrix` row rather than no row.
  */
  const { exerciseSubtypes: activityRows } = useMetadata();
  const activityMeta = useMemo(() => {
    const byValue: Record<string, { label: string; icon?: string }> = {};
    for (const row of activityRows) byValue[row.value] = { label: row.label, icon: row.icon };
    return byValue;
  }, [activityRows]);
  const activityFor = (block: Activity) => {
    const raw = activityOf(block);
    return activityMeta[normalizeSubtype(raw) ?? raw ?? ''] ?? undefined;
  };

  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(() => {
    if (days.length === 0) return null;
    // Prefer day 1 if it exists, otherwise first available day
    const day1 = days.find(d => d.day === 1);
    return day1 ? 1 : days[0].day;
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Helper to update days
  const handleDaysChange = (newDaysOrUpdater: DayContent[] | ((prevDays: DayContent[]) => DayContent[])) => {
    onProgramChange((prevProgram: any) => {
        const currentDays = prevProgram.daily_content || [];
        const resolvedNewDays = typeof newDaysOrUpdater === 'function' ? newDaysOrUpdater(currentDays) : newDaysOrUpdater;
        return { daily_content: resolvedNewDays };
    });
  };

  // Ensure selection validity & Single Day Mode Enforcement
  // Track day numbers as a stable string for dependency comparison
  const dayNumbers = days.map(d => d.day).join(',');
  
  useEffect(() => {
    if (singleDayMode) {
      if (days.length === 0) {
        // Create implicit day if missing
        const implicitDay: DayContent = {
          day: 1,
          title: mode === 'assessment' ? 'Assessment Content' : 'Content',
          description: '',
          activities: [],
          ...seedDayFromTemplate(mode === 'assessment' ? 'assessment' : 'practice')
        };
        handleDaysChange([implicitDay]);
      } else if (days.length > 1) {
        // Enforce single day
        handleDaysChange([days[0]]);
        setSelectedDayNum(days[0].day);
      } else if (selectedDayNum !== days[0].day) {
        setSelectedDayNum(days[0].day);
      }
    } else {
       // If no day selected OR selected day no longer exists, pick first available
       const selectedExists = selectedDayNum !== null && days.some(d => d.day === selectedDayNum);
       if (!selectedExists && days.length > 0) {
         const day1 = days.find(d => d.day === 1);
         setSelectedDayNum(day1 ? 1 : days[0].day);
       }
    }
    // `dayNumbers` is a joined string of day numbers, computed at :309 precisely
    // so this runs when the SET of days changes rather than on every render.
    // `days` is a fresh array each render, and this effect calls
    // `handleDaysChange`, so adding it as the linter suggests is an infinite
    // loop. Suppressed deliberately rather than silenced by habit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayNumbers, singleDayMode]);

  const activeDay = days.find(d => d.day === selectedDayNum);

  /**
   * `validationMode` was a prop with a default that no caller passed and no line
   * read — and `block-validation.ts`, which it selects the strictness of, was
   * imported by its own test and nothing else. Both are alive from 2026-09-08.
   *
   * `draft` reports; `publish` blocks. The wizard passes `publish` once a
   * programme is published, because at that point the content is what a user
   * reaches. Nothing here prevents a save — an author must be able to leave work
   * half-finished — it states plainly what a reader would hit.
   */
  const dayVerdict = useMemo(() => validateDay(activeDay?.activities), [activeDay]);
  const dayBlocks = hasBlockingIssues(dayVerdict);
  const activeBlock = activeDay?.activities.find(b => b.id === selectedBlockId);

  // If selected block no longer exists (deleted/changed), reset
  const activeBlockIds = activeDay?.activities.map(b => b.id).join(',') || '';
  useEffect(() => {
    if (selectedBlockId && activeDay && !activeDay.activities.some(b => b.id === selectedBlockId)) {
      setSelectedBlockId(null);
    }
    // Same reason: `activeBlockIds` is the stable joined-id string standing in
    // for `activeDay`, which is a new object every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlockId, activeBlockIds]);

  const moveDay = (dragIndex: number, hoverIndex: number) => {
    if (singleDayMode || readOnly) return;
    
    handleDaysChange((currentDays) => {
      // Protect Day 0 (onboarding) from reordering
      const day0 = currentDays.find(d => d.day === 0);
      const regularDays = currentDays.filter(d => d.day !== 0);
      
      // Only reorder among regular days (indices offset by 1 if Day 0 exists)
      const offset = day0 ? 1 : 0;
      const adjDragIdx = dragIndex - offset;
      const adjHoverIdx = hoverIndex - offset;
      
      if (adjDragIdx < 0 || adjHoverIdx < 0) return currentDays; // Can't move Day 0
      if (adjDragIdx >= regularDays.length || adjHoverIdx >= regularDays.length) return currentDays;
      
      const newRegular = [...regularDays];
      const [draggedDay] = newRegular.splice(adjDragIdx, 1);
      newRegular.splice(adjHoverIdx, 0, draggedDay);
      // Reassign day numbers (1-based for regular days)
      const reordered = newRegular.map((d, i) => ({ ...d, day: i + 1 }));
      
      if (selectedDayNum === draggedDay.day) {
        setSelectedDayNum(adjHoverIdx + 1);
      }
      
      return day0 ? [day0, ...reordered] : reordered;
    });
  };

  const moveBlock = (dragIndex: number, hoverIndex: number) => {
    if (!activeDay || readOnly) return;
    handleDaysChange((currentDays) => currentDays.map(d => {
      if (d.day === activeDay.day) {
        const newActivities = [...d.activities];
        const [draggedBlock] = newActivities.splice(dragIndex, 1);
        newActivities.splice(hoverIndex, 0, draggedBlock);
        return { ...d, activities: newActivities };
      }
      return d;
    }));
  };

  const handleAddDay = () => {
    if (singleDayMode || readOnly) return;
    
    handleDaysChange((currentDays) => {
      // Count only regular days (exclude Day 0)
      const regularDays = currentDays.filter(d => d.day !== 0);
      const newDayNum = regularDays.length + 1;
      const newDay: DayContent = {
        day: newDayNum,
        title: `Day ${newDayNum}`,
        description: '',
        activities: [],
        // Was 'lesson' — a BLOCK type used as a day type. It matches no preset,
        // so validateBlockForDayType() found none and returned early, and every
        // day created here skipped validation entirely. 8 such days are live.
        // 'learning' is the preset for concept introduction, which is what 93
        // of the 97 real days already use.
        ...seedDayFromTemplate('learning')
      };
      
      setSelectedDayNum(newDayNum);
      setSelectedBlockId(null);
      return [...currentDays, newDay];
    });
  };

  const handleDeleteDay = (dayNum: number) => {
    if (singleDayMode || readOnly) return;
    if (dayNum === 0) return; // Cannot delete onboarding day
    
    handleDaysChange((currentDays) => {
      const day0 = currentDays.find(d => d.day === 0);
      const regularDays = currentDays.filter(d => d.day !== 0 && d.day !== dayNum);
      // Renumber regular days
      const renumbered = regularDays.map((d, i) => ({ ...d, day: i + 1 }));
      
      if (selectedDayNum === dayNum) {
        setSelectedDayNum(renumbered.length > 0 ? renumbered[0].day : (day0 ? 0 : null));
      }
      
      return day0 ? [day0, ...renumbered] : renumbered;
    });
  };

  /**
   * Repeat a day, **keeping every block id**.
   *
   * The sibling of `handleDuplicateDay`, and the one that was missing. Because
   * ids are preserved, a response on day 20 and one on day 21 belong to the
   * same thread — which is what the authors of Sleep Tight 19-25 were reaching
   * for when they duplicated a day and renamed it "(Continued)". Duplicating
   * mints new ids, so each of those days produced an unrelated response set.
   *
   * This is the day-level affordance. The per-block equivalent is
   * `ActivityRepeat`, whose editor control exists and which no stored block
   * used because the reader was dropping the field (see block-normalise.ts).
   */
  const handleRepeatDay = (dayToRepeat: DayContent) => {
    if (singleDayMode || readOnly) return;
    handleDaysChange((currentDays) => {
      const newDayNum = currentDays.length + 1;
      const newDay: DayContent = {
        ...dayToRepeat,
        day: newDayNum,
        title: `${dayToRepeat.title} (Continued)`,
        activities: dayToRepeat.activities.map(a => ({ ...a })),  // SAME ids, deliberately
      };
      setSelectedDayNum(newDayNum);
      return [...currentDays, newDay];
    });
  };

  const handleDuplicateDay = (dayToDuplicate: DayContent) => {
    if (singleDayMode || readOnly) return;
    
    handleDaysChange((currentDays) => {
      const newDayNum = currentDays.length + 1;
      const newDay: DayContent = {
        ...dayToDuplicate,
        day: newDayNum,
        title: `${dayToDuplicate.title} (Copy)`,
        activities: dayToDuplicate.activities.map(a => ({ ...a, id: generateBlockId() }))
      };
      setSelectedDayNum(newDayNum);
      return [...currentDays, newDay];
    });
  };

  const handleUpdateDay = (dayNum: number, updates: Partial<DayContent>) => {
    if (readOnly) return;

    handleDaysChange((currentDays) => {
      // Check if dayType changed and auto-populate if empty
      const currentDay = currentDays.find(d => d.day === dayNum);
      const updatesToApply = { ...updates };
      
      /*
        APPLYING A TEMPLATE, not setting a type (§19 step 3).

        `applyTemplate` arrives on the update instead of `dayType`. It writes
        the template's policy and layout onto the day and seeds its blocks, and
        is then discarded — the day owns those values from that moment and
        editing the template never reaches it again. That is the difference
        between a template and a type, and it is the consequence most likely to
        surprise: changing `learning` no longer changes the 98 days that were
        made from it.
      */
      const template = (updatesToApply as { applyTemplate?: DayType }).applyTemplate;
      delete (updatesToApply as { applyTemplate?: DayType }).applyTemplate;
      if (template && currentDay) {
         Object.assign(updatesToApply, seedDayFromTemplate(template));
         if (currentDay.activities.length === 0) {
            const preset = getPresetForDayType(template);
            if (preset && preset.defaultBlocks) {
               const newBlocks = preset.defaultBlocks.map((b, i) => ({
                  ...b,
                  id: generateBlockId(),
                  order: i,
                  required: b.required ?? false,
                  title: b.title || 'Untitled Block'
               })) as Activity[];
               updatesToApply.activities = newBlocks;
               
               // Also update selected block to first one
               setTimeout(() => {
                  if (newBlocks.length > 0) setSelectedBlockId(newBlocks[0].id);
               }, 100);
            }
         }
      }

      return currentDays.map(d => 
        d.day === dayNum ? { ...d, ...updatesToApply } : d
      );
    });
  };

  const addBlock = (type: string = 'lesson', subtype?: string) => {
    if (!activeDay || readOnly) return;
    
    // Get preset config for auto-setting block properties
    // No day type to read a preset from; a block's defaults are its own.
    const preset = undefined as ReturnType<typeof getPresetForDayType>;
    
    const newBlock: Activity = {
      id: generateBlockId(),
      title: type === 'lesson' ? 'New Lesson' : 'New Activity',
      type: type as Activity['type'],
      content: '',
      duration: 5,
      // Was `preset?.autoConfig.scoringEnabled ? true : true` — identical
      // branches, so the condition never mattered. Found by the linter within
      // minutes of it existing, which is the argument for having one.
      required: true,
      autoAdvance: preset?.autoConfig.autoAdvance ?? false,
      order: activeDay.activities.length,
      activityConfig: subtype ? { subtype: subtype as ExerciseSubtype } : undefined
    };
    handleDaysChange((currentDays) => currentDays.map(d => 
      d.day === activeDay.day ? { ...d, activities: [...d.activities, { ...newBlock, order: d.activities.length }] } : d
    ));
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (blockId: string, updates: Partial<Activity>) => {
    if (!activeDay || readOnly) return;
    handleDaysChange((currentDays) => currentDays.map(d => 
      d.day === activeDay.day ? {
        ...d,
        activities: d.activities.map(b => b.id === blockId ? { ...b, ...updates } : b)
      } : d
    ));
  };

  const deleteBlock = (blockId: string) => {
    if (!activeDay || readOnly) return;
    handleDaysChange((currentDays) => currentDays.map(d => 
      d.day === activeDay.day ? {
        ...d,
        activities: d.activities.filter(b => b.id !== blockId)
      } : d
    ));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  /*
    DUPLICATE — §21 item 3.

    The copy keeps everything except its id, INCLUDING its response key. A key
    is the author's statement that two blocks are the same question; dropping it
    on a duplicate would quietly answer a question only they can. Two blocks
    sharing a key on ONE day do collide, so `validateDay` now reports that
    directly rather than leaving it to be discovered in the data.
  */
  const duplicateBlock = (blockId: string) => {
    if (!activeDay || readOnly) return;
    handleDaysChange((currentDays) => currentDays.map(d => {
      if (d.day !== activeDay.day) return d;
      const i = d.activities.findIndex(b => b.id === blockId);
      if (i === -1) return d;
      const copy: Activity = { ...d.activities[i], id: generateBlockId() };
      const next = [...d.activities];
      next.splice(i + 1, 0, copy);
      return { ...d, activities: next.map((b, n) => ({ ...b, order: n })) };
    }));
  };

  /*
    MOVE TO ANOTHER DAY — the block leaves this day and lands at the end of the
    target. Its id travels with it, so any stored response under that id follows
    the block rather than being stranded on the day it left.
  */
  const moveBlockToDay = (blockId: string, targetDayNum: number) => {
    if (!activeDay || readOnly || targetDayNum === activeDay.day) return;
    let moved: Activity | undefined;
    handleDaysChange((currentDays) => {
      const stripped = currentDays.map(d => {
        if (d.day !== activeDay.day) return d;
        moved = d.activities.find(b => b.id === blockId);
        return { ...d, activities: d.activities.filter(b => b.id !== blockId).map((b, n) => ({ ...b, order: n })) };
      });
      if (!moved) return currentDays;
      return stripped.map(d =>
        d.day === targetDayNum
          ? { ...d, activities: [...d.activities, { ...moved!, order: d.activities.length }] }
          : d
      );
    });
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  /* Stable across renders so the memoised rows do not all re-render on every
     keystroke in the editor. */
  const otherDays = useMemo(
    () => days.filter(d => d.day !== activeDay?.day).map(d => ({ day: d.day, title: d.title })),
    [days, activeDay?.day],
  );

  const getModeLabel = () => {
    switch (mode) {
      case 'assessment': return 'Assessment';
      case 'onboarding': return 'Onboarding';
      case 'equip': 
      default: return 'Equip';
    }
  };

  const getDayLabel = () => {
    switch (mode) {
      case 'assessment': return 'Assessment Content';
      case 'onboarding': return 'Onboarding Steps';
      default: return activeDay?.title || `Day ${activeDay?.day}`;
    }
  };

  return (
    <div className="h-[calc(100vh-250px)] flex flex-col border overflow-hidden shadow-sm ring-1" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-default)', boxShadow: '0 0 0 1px var(--color-border-default)', borderRadius: 'var(--radius-xl, 24px)' }}>
      {/* ROW 1: HORIZONTAL DAY STRIP — Hidden in Single Day Mode */}
      {!singleDayMode && (
      <div className="shrink-0 border-b" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
        <div className="px-4 py-2 flex items-center gap-3">
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Days ({days.length})</span>
          
          {/* Scrollable day chips */}
          <div className="flex-1 overflow-x-auto flex items-center gap-1.5 py-1 scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
            {days.length === 0 ? (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No days added yet</span>
            ) : (
              days.map((day, index) => (
                <DraggableDay
                  key={day.day}
                  day={day}
                  index={index}
                  isSelected={selectedDayNum === day.day}
                  onSelect={() => { setSelectedDayNum(day.day); setSelectedBlockId(null); }}
                  moveDay={moveDay}
                  onDuplicate={() => handleDuplicateDay(day)}
                  onDelete={() => handleDeleteDay(day.day)}
                />
              ))
            )}
          </div>

          {!readOnly && (
            <Button onClick={handleAddDay} size="sm" className="gap-1.5 shrink-0 shadow-sm" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)', borderRadius: 'var(--radius-lg)' }}>
              <Plus size={14} /> Add
            </Button>
          )}
        </div>
      </div>
      )}

      {/* ROW 2: TWO-COLUMN LAYOUT — Structure + Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: STRUCTURE (Content Blocks) */}
        <div className={cn(
          "flex flex-col border-r",
          singleDayMode ? "w-[35%] min-w-[300px]" : "w-[35%] min-w-[280px]"
        )} style={{ backgroundColor: 'var(--color-bg-card)' }}>
          {activeDay ? (
            <>
              <div className="p-4 border-b flex items-center justify-between sticky top-0 z-10 h-14" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div>
                   <h3 className="truncate max-w-[150px]" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)' }}>
                     {getDayLabel()}
                   </h3>
                   <p className="uppercase tracking-wide" style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                     Structure
                   </p>
                </div>
                {!readOnly && (
                  <BlockPaletteMenu onSelect={addBlock} />
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                {/* 1. Day Configuration Item - Only show in Multi-day mode */}
                {!singleDayMode && (
                <div 
                  onClick={() => setSelectedBlockId(null)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3"
                  )}
                  style={selectedBlockId === null 
                    ? { backgroundColor: 'var(--color-info-light)', borderColor: 'var(--color-info-default)', boxShadow: '0 0 0 1px var(--color-info-default)' }
                    : { backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-default)' }
                  }
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info-default)' }}>
                    <Settings size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Day Configuration</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Metadata & Goals</p>
                  </div>
                  {/* Day actions — Repeat / Duplicate / Delete.
                      These sit in a row labelled "Metadata & Goals" and act on
                      the WHOLE day. The prominent one used to be the
                      destructive pair with no confirm and no non-destructive
                      sibling; "Repeat" is that missing sibling. */}
                  <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      style={{ color: 'var(--color-text-muted)' }}
                      title="Repeat this day — same block ids, so responses continue one thread"
                      onClick={() => activeDay && handleRepeatDay(activeDay)}
                      disabled={readOnly}
                    >
                      <Repeat size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      style={{ color: 'var(--color-text-muted)' }}
                      title="Duplicate as a copy — new block ids, responses start fresh"
                      onClick={() => activeDay && handleDuplicateDay(activeDay)}
                      disabled={readOnly}
                    >
                      <Copy size={13} />
                    </Button>
                    {activeDay && activeDay.day !== 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        style={{ color: 'var(--color-status-danger)' }}
                        title="Delete Day"
                        onClick={() => activeDay && handleDeleteDay(activeDay.day)}
                        disabled={readOnly}
                      >
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>
                  {selectedBlockId === null && <div style={{ color: 'var(--color-info-default)' }}><ChevronRight size={14} /></div>}
                </div>
                )}

                {!singleDayMode && (
                <div className="my-2 border-t relative" style={{ borderColor: 'var(--color-border-default)' }}>
                  <span className="absolute left-1/2 -translate-x-1/2 -top-2 px-2" style={{ backgroundColor: 'var(--color-bg-muted)', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                    BLOCKS
                  </span>
                </div>
                )}

                {(dayVerdict.dayIssues.length > 0 || dayVerdict.blockIssues.size > 0) && (
                  <div className="mb-2 p-2 rounded-lg" style={{
                    backgroundColor: 'var(--color-bg-muted)',
                    borderLeft: `2px solid ${validationMode === 'publish' && dayBlocks ? 'var(--color-status-danger)' : 'var(--color-status-warning)'}`,
                    fontSize: 'var(--text-xs)',
                  }}>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>
                      {validationMode === 'publish' && dayBlocks
                        ? 'This day is published and would not pass a content check'
                        : 'Content check'}
                    </div>
                    {dayVerdict.dayIssues.map((i, n) => (
                      <div key={`d${n}`} style={{ color: i.level === 'error' && validationMode === 'publish' ? 'var(--color-status-danger)' : 'var(--color-text-muted)' }}>
                        {i.level === 'error' ? '✕' : '⚠'} {i.message}
                      </div>
                    ))}
                    {[...dayVerdict.blockIssues.entries()].map(([blockId, issues]) => {
                      const title = activeDay.activities.find(b => b.id === blockId)?.title || blockId;
                      return issues.map((i, n) => (
                        <div key={`${blockId}-${n}`} style={{ color: i.level === 'error' && validationMode === 'publish' ? 'var(--color-status-danger)' : 'var(--color-text-muted)' }}>
                          {i.level === 'error' ? '✕' : '⚠'} <strong>{title}</strong> — {i.message}
                        </div>
                      ));
                    })}
                  </div>
                )}

                {/* 2. Draggable Blocks */}
                {activeDay.activities.map((block, index) => (
                  <DraggableBlock
                    key={block.id}
                    block={block}
                    index={index}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => setSelectedBlockId(block.id)}
                    moveBlock={moveBlock}
                    onDelete={() => deleteBlock(block.id)}
                    dayNumber={activeDay.day}
                    totalDays={days.length > 0 ? days[days.length - 1].day : activeDay.day}
                    activityLabel={activityFor(block)?.label}
                    activityIcon={activityFor(block)?.icon}
                    onDuplicate={() => duplicateBlock(block.id)}
                    otherDays={otherDays}
                    onMoveToDay={(d) => moveBlockToDay(block.id, d)}
                    readOnly={readOnly}
                  />
                ))}

                {activeDay.activities.length === 0 && !readOnly && (
                  <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No content blocks yet.</p>
                    <Button variant="link" size="sm" onClick={() => addBlock()} className="h-auto p-0 mt-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-default)' }}>
                      Add your first block
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <Calendar size={20} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)' }}>No Day Selected</p>
              <p className="mt-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Select a day from the timeline to edit its structure.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CONTEXTUAL EDITOR (Flex-1) */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          {activeDay ? (
            <div className="flex-1 overflow-y-auto">
              {/* SCOPE HINT HEADER */}
              <div className="h-8 border-b px-4 flex items-center uppercase tracking-wider sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-card)', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                {singleDayMode ? `${getModeLabel()} Mode` : `Editing: Day ${activeDay.day}`} 
                <span className="mx-2" style={{ color: 'var(--color-border-default)' }}>•</span> 
                {selectedBlockId ? 'Block Editor' : 'Configuration'}
              </div>

              <div className="p-4">
                <div className="max-w-2xl mx-auto">
                  {selectedBlockId === null && !singleDayMode ? (
                    // --- DAY CONFIGURATION EDITOR (Multi-day only) ---
                    <DayConfigPane
                      day={activeDay}
                      templates={stageRows}
                      onUpdate={(updates) => handleUpdateDay(activeDay.day, updates as Partial<DayContent>)}
                      readOnly={readOnly}
                    />
                  ) : activeBlock ? (
                    // --- BLOCK EDITOR ---
                    <div className="animate-in fade-in duration-300">
                      <BlockEditor
                        key={activeBlock.id}
                        block={activeBlock}
                        onChange={updates => updateBlock(activeBlock.id, updates)}
                        onDelete={() => deleteBlock(activeBlock.id)}
                        isExpanded={true}
                        onToggleExpand={() => {}} 
                        moveUp={undefined}
                        moveDown={undefined}
                        hideHeader={true}
                        isAssessment={mode === 'assessment'}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64" style={{ color: 'var(--color-text-muted)' }}>
                      <p>
                        {singleDayMode
                          ? "Select a block to edit." 
                          : "Block not found."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-muted)' }}>
              <p>Select a day to view properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}