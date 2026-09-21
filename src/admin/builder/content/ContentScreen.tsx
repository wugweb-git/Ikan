/**
 * The Content screen — days on the left, the block editor on the right. §21
 * layout port, phase 4.
 *
 * This is `DayEditor`'s body, moved out of `DayComposer.tsx` with its state and
 * every mutation unchanged. What changed is column 1: the day strip used to span
 * the whole builder above both columns, and the day's own actions sat on a row
 * inside the block list labelled "Metadata & Goals". Now the calendar, the day
 * header and the blocks are one column, and the editor gets the rest of the width
 * — which is the whole of §21 item 6.
 *
 * `DayComposer.tsx` stays as a thin adapter so `AssessmentEditPageWizard` and the
 * dev harness keep their prop contract exactly.
 */
import { useState, useEffect, useMemo } from 'react';
import { DayContent, Activity, activityOf, normalizeSubtype } from '../../block-builder/model/block-model';
import { useMetadata } from '../../ui/hooks/useMetadata';
import { validateDay, hasBlockingIssues } from '../../block-builder/model/block-validation';
import { seedDayFromTemplate, policyOf } from '../../block-builder/model/day-policy';
import type { ExerciseSubtype } from '../../block-builder/model/block-model';
import { cn } from '../../ui/utils';
import { DraggableBlock } from './BlockRow';
import { BlockPaletteMenu } from './AddBlockMenu';
import { DayCalendarStrip } from './DayCalendarStrip';
import { CalendarOverlay } from './CalendarOverlay';
import { DayHeader } from './DayHeader';
import { DayConfigPane } from '../editor/DayConfigPane';
import { generateBlockId } from './block-id';
import { DEFAULT_ACTIVITY_FOR_TYPE } from '../../block-builder/model/vocabulary';
import { BlockEditorPane } from '../editor/BlockEditorPane';

export interface ContentScreenProps {
  program: { daily_content?: DayContent[] } & Record<string, any>;
  mode: 'equip' | 'assessment' | 'onboarding';
  onProgramChange: (updates: Partial<{ daily_content: DayContent[] } & Record<string, any>>) => void;
  /** The day calendar. Absent for a record with no days — an assessment. */
  showCalendar: boolean;
  /** Reconcile the record to exactly one day. */
  enforceSingleDay: boolean;
  validationMode?: 'draft' | 'publish';
  readOnly?: boolean;
  /** `fill` takes its parent's height; `embedded` keeps the old fixed height. */
  heightMode?: 'fill' | 'embedded';
}

export function ContentScreen({
  program,
  mode,
  showCalendar,
  enforceSingleDay,
  onProgramChange,
  validationMode = 'draft',
  readOnly = false,
  heightMode = 'embedded',
}: ContentScreenProps) {
  /* `singleDayMode` meant two things — hide the day strip AND force the record
     to exactly one day. They are separate questions (an assessment answers yes
     to both; nothing yet answers yes to one), so they are separate props. This
     alias keeps the reconciliation effect below reading as it always has. */
  const singleDayMode = enforceSingleDay;

  /* Which face column 1 is showing: the day's blocks, or every day. */
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  /* Bumped by the row kebab's "Change block type" so the editor opens its type
     picker. A counter rather than a boolean: asking twice must open it twice. */
  const [openTypePickerAt, setOpenTypePickerAt] = useState(0);
  
  /* Memoised because `|| []` mints a new array on every render, and the row
     list's `otherDays` memo keys on it — without this the memoised block rows
     re-render on every keystroke in the editor. */
  const days = useMemo(() => program.daily_content || [], [program.daily_content]);
  /*
    `stageRows` was here — the list of day TEMPLATES that fed the "apply a
    template" picker, built from `DAY_TYPE_PRESETS`. Gone with the picker
    (2026-09-09, owner's call). The presets themselves are untouched and still
    seed a day's `policy` and `layout` when it is created.
  */

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

    /*
      APPLYING A TEMPLATE was here, and is gone — removed 2026-09-09 on the
      owner's instruction along with the day-template picker and the "this day's
      behaviour" table it explained.

      What it did: an `applyTemplate` sentinel arrived on the update, wrote that
      template's `policy` and `layout` onto the day via `seedDayFromTemplate`,
      seeded `preset.defaultBlocks` if the day had none, and was then discarded.

      What is left, and matters: **days still carry `policy` and `layout`, and
      still get them from a template — at CREATION.** `handleAddDay` seeds
      `learning`, and the single-day path seeds `assessment` / `practice`. So
      `policyOf` and `layoutOf` still resolve for every day, the player still
      reads them, and the block editor's Step control still obeys them. The only
      thing removed is the ability to re-apply a different template to an
      existing day after the fact.
    */
    handleDaysChange((currentDays) =>
      currentDays.map(d => (d.day === dayNum ? { ...d, ...updates } : d)),
    );
  };

  const addBlock = (type: string = 'lesson', subtype?: string) => {
    if (!activeDay || readOnly) return;
    
    /* A new block's defaults are its own. This used to read a preset off the
       day's type; a day has no type, the local was hardcoded `undefined` after
       §19 step 3, and the last reference to `getPresetForDayType` went with the
       template picker (2026-09-09). `autoAdvance` starts false, as it did. */
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
      autoAdvance: false,
      order: activeDay.activities.length,
      /*
        A NEW BLOCK CARRIES AN ACTIVITY. Under §26 the activity is what draws, so
        a block created with only a type renders nothing and `validateBlock`
        errors on it — which is exactly what happened to the three blocks added
        through this palette on 2026-09-09. The type's default is a starting
        point, not a constraint: every activity stays available on every type.
      */
      activity: subtype ?? DEFAULT_ACTIVITY_FOR_TYPE[type] ?? 'read',
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


  const lastDay = days.length ? days[days.length - 1].day : 0;

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden',
        heightMode === 'fill' ? 'h-full' : 'h-[calc(100vh-250px)] border shadow-sm ring-1',
      )}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-default)',
        ...(heightMode === 'embedded'
          ? { boxShadow: '0 0 0 1px var(--color-border-default)', borderRadius: 'var(--radius-xl, 24px)' }
          : {}),
      }}
    >
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ── COLUMN 1: the calendar, the day, its blocks ───────── */}
        <div
          className="relative flex flex-col border-r w-[34%] min-w-[288px]"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          {showCalendar && (
            <DayCalendarStrip
              days={days}
              selectedDay={selectedDayNum}
              expanded={calendarExpanded}
              onToggleExpanded={() => setCalendarExpanded(v => !v)}
              onSelectDay={(d) => { setSelectedDayNum(d); setSelectedBlockId(null); }}
              moveDay={moveDay}
              onAddDay={handleAddDay}
              readOnly={readOnly}
            />
          )}

          {activeDay ? (
            <>
              <DayHeader
                day={activeDay}
                lastDay={lastDay}
                labelOverride={showCalendar ? undefined : getDayLabel()}
                showDayActions={showCalendar}
                readOnly={readOnly}
                onOpenDaySettings={() => setSelectedBlockId(null)}
                onRepeatDay={() => handleRepeatDay(activeDay)}
                onDuplicateDay={() => handleDuplicateDay(activeDay)}
                onDeleteDay={() => handleDeleteDay(activeDay.day)}
              />

              <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                {(dayVerdict.dayIssues.length > 0 || dayVerdict.blockIssues.size > 0) && (
                  <div
                    className="px-2.5 py-2 space-y-1"
                    style={{
                      fontSize: 'var(--text-xs)',
                      backgroundColor: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `2px solid ${validationMode === 'publish' && dayBlocks
                        ? 'var(--color-status-danger)' : 'var(--color-status-warning)'}`,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
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
                    totalDays={lastDay || activeDay.day}
                    activityLabel={activityFor(block)?.label}
                    activityIcon={activityFor(block)?.icon}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onChangeType={() => { setSelectedBlockId(block.id); setOpenTypePickerAt(n => n + 1); }}
                    otherDays={otherDays}
                    onMoveToDay={(d) => moveBlockToDay(block.id, d)}
                    readOnly={readOnly}
                  />
                ))}

                {activeDay.activities.length === 0 && (
                  <div className="text-center py-6 px-4" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    No content blocks yet.
                  </div>
                )}
              </div>

              {!readOnly && (
                <div className="shrink-0 p-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                  <BlockPaletteMenu onSelect={addBlock} trigger="dashed" />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: 'var(--text-sm)' }}>No day selected</p>
              <p style={{ fontSize: 'var(--text-xs)' }}>Pick one from the calendar, or add the first.</p>
            </div>
          )}

          {calendarExpanded && showCalendar && (
            <CalendarOverlay
              days={days}
              selectedDay={selectedDayNum}
              onSelectDay={(d) => { setSelectedDayNum(d); setSelectedBlockId(null); }}
              onClose={() => setCalendarExpanded(false)}
              onAddDay={handleAddDay}
              readOnly={readOnly}
            />
          )}
        </div>

        {/* ── COLUMN 2: the editor ──────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          {selectedBlockId === null && !singleDayMode && activeDay ? (
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto">
                <DayConfigPane
                  day={activeDay}
                  onUpdate={(updates) => handleUpdateDay(activeDay.day, updates)}
                  readOnly={readOnly}
                />
              </div>
            </div>
          ) : activeBlock ? (
            <BlockEditorPane
              key={activeBlock.id}
              block={activeBlock}
              onChange={updates => updateBlock(activeBlock.id, updates)}
              onDelete={() => deleteBlock(activeBlock.id)}
              isAssessment={mode === 'assessment'}
              dayPolicy={activeDay ? policyOf(activeDay) : undefined}
              readOnly={readOnly}
              openTypePickerAt={openTypePickerAt}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: 'var(--text-sm)' }}>
                {singleDayMode ? 'Select a block to edit.' : 'Select a block, or open Day settings.'}
              </p>
              <p style={{ fontSize: 'var(--text-xs)' }}>{getModeLabel()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
