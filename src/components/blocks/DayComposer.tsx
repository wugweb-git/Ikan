import { useState, useEffect, useMemo, useRef, memo } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Copy,
  ChevronRight,
  BookOpen,
  Calendar,
  FastForward,
  PenTool,
  MessageCircle,
  Target,
  AlertTriangle,
  Zap,
  RotateCcw,
  Repeat,
  Clock,
  Hash,
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { DayContent, Activity, repeatSummary, activityOf, normalizeSubtype } from '../../lib/blocks/block-model';
import { getIconComponent, iconResolves } from '../../lib/catalog-icons';
import { useMetadata } from '../../hooks/useMetadata';
import { BlockEditor } from './BlockEditor';
import { PALETTE_BLOCK_TYPES, getPresetForDayType, DAY_TYPE_PRESETS } from '../../lib/blocks/block-type-rules';
import { validateDay, hasBlockingIssues } from '../../lib/blocks/block-validation';
import { stageColour } from '../../lib/blocks/block-fields';
/* `useMetadata` is no longer needed here: the composer's only catalog read was
   the container rows behind the day-type picker, and the picker now lists the
   TEMPLATES from DAY_TYPE_PRESETS. Block types are the BlockEditor's business. */
import { seedDayFromTemplate, policyOf } from '../../lib/blocks/day-policy';
import { layoutOf } from '../../lib/blocks/day-layout';
import type { DayType, ExerciseSubtype } from '../../lib/blocks/block-model';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '../ui/utils';
import { Textarea } from '../ui/textarea';

const ItemTypes = {
  DAY: 'day',
  BLOCK: 'block',
};

// --- DRAGGABLE DAY COMPONENT ---
interface DraggableDayProps {
  day: DayContent;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  moveDay: (dragIndex: number, hoverIndex: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const DraggableDay = memo(function DraggableDay({ day, index, isSelected, onSelect, moveDay, onDuplicate, onDelete }: DraggableDayProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.DAY,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveDay(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.DAY,
    item: () => ({ id: day.day, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const isOnboarding = day.day === 0;
  // Colour comes from `block-fields.ts`, which prefers the stage's catalog
  // `color` and falls back to a code map. This was a ten-branch ternary of raw
  // hex — the only hardcoded colours in a file that otherwise uses tokens — and
  // it covered 9 of 11 stage types, so `learning`, the type 93 of 98 days use,
  // fell through to the default.
  // A day has no type to colour by since §19 step 3. Day 0 keeps its onboarding
  // tint because it is identified by its NUMBER, not by a type string.
  const typeColor = isOnboarding ? stageColour('onboarding') : stageColour(undefined);

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className="shrink-0"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <div
        onClick={onSelect}
        className="flex items-center justify-center cursor-pointer transition-all"
        style={{
          width: 34,
          height: 34,
          borderRadius: 'var(--radius-md)',
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'var(--font-family-base)',
          backgroundColor: isSelected ? typeColor : 'var(--color-bg-card)',
          color: isSelected ? '#fff' : typeColor,
          border: isSelected ? 'none' : `1.5px solid ${typeColor}40`,
          boxShadow: isSelected ? `0 2px 8px ${typeColor}30` : 'none',
        }}
      >
        {day.day}
      </div>
    </div>
  );
}, (prev, next) => {
  return prev.day === next.day && prev.index === next.index && prev.isSelected === next.isSelected;
});

// --- DRAGGABLE BLOCK COMPONENT ---
interface DraggableBlockProps {
  block: Activity;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  onDelete: () => void;
  /** The day this row sits on, and the programme's length — both needed to say
      where a repeat actually lands. */
  dayNumber: number;
  totalDays: number;
  /** The activity's catalog row, resolved once by the day and passed down as
      plain strings so the row stays memoisable. */
  activityLabel?: string;
  activityIcon?: string;
}

const DraggableBlock = memo(function DraggableBlock({ block, index, isSelected, onSelect, moveBlock, onDelete, dayNumber, totalDays, activityLabel, activityIcon }: DraggableBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.BLOCK,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: () => ({ id: block.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  // Safety guard: block.type might be corrupted (e.g., event object stored as type)
  const safeType = typeof block.type === 'string' ? block.type : 'lesson';

  // Row meta — step, duration, repeat. Display only; nothing here writes.
  const repeat = repeatSummary(block, dayNumber, totalDays);
  /* The step is the block's own `stepGroup` slug, not a synthesised `s1`.
     392 of 420 live blocks carry none and the 28 that do carry authored names
     (`daily_reflection`, `tf_identification`). Numbering them would print a
     label the store does not hold, on rows whose group is the one thing the
     author already named. */
  const step = typeof block.stepGroup === 'string' && block.stepGroup.trim() ? block.stepGroup.trim() : null;

  /* THE ACTIVITY'S OWN ICON, not the block type's — §21 item 2. All 20 activity
     catalog rows already carry one; nothing read it, so two Lessons that do
     completely different things (read, view) drew the same tile. */
  const ActivityIcon = getIconComponent(activityIcon);
  const hasActivityIcon = iconResolves(activityIcon);

  return (
    <div 
      ref={ref}
      onClick={onSelect}
      data-handler-id={handlerId}
      className={cn(
        "group px-2 py-1.5 border cursor-pointer transition-all hover:shadow-sm flex items-center gap-2",
        isSelected 
          ? "border-[1.5px] shadow-sm" 
          : "border-[1px]",
        isSelected && "bg-[var(--color-bg-card)] border-[var(--color-primary-default)]",
        !isSelected && "bg-[var(--color-bg-card)] border-[var(--color-border-default)] hover:border-[var(--color-primary-default)]",
        isDragging && "opacity-50"
      )}
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      <div className="cursor-grab" style={{ color: 'var(--color-text-muted)', opacity: 0.4 }}>
        <GripVertical size={12} />
      </div>
      <div
        className="shrink-0 flex items-center justify-center self-start"
        title={activityLabel ? `${safeType} · ${activityLabel}` : safeType}
        style={{
          width: 24, height: 24, marginTop: 1, borderRadius: 'var(--radius-sm)',
          backgroundColor: isSelected ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
          color: isSelected ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
        }}
      >
        {hasActivityIcon
          ? <ActivityIcon size={13} />
          /* An activity the catalog does not name gets a dash, not a stand-in
             icon — a wrong icon reads as a deliberate choice. */
          : <span style={{ fontSize: '11px', opacity: 0.6 }}>—</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {/* `Lesson · read`, not `LESSON · READ`: all-caps with letter-spacing
              cost about a third of the line, and the activity is the half that
              was being truncated away. */}
          <span className="truncate" style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600, fontFamily: 'var(--font-family-base)' }}>
            {safeType.charAt(0).toUpperCase() + safeType.slice(1)}
            {activityLabel ? ` · ${activityLabel.toLowerCase()}` : ''}
          </span>
          {/* stepGroup is internal authoring metadata — not surfaced in the block list.
              It remains editable in the block detail editor. */}
          {block.autoAdvance && (
            <FastForward size={8} style={{ color: 'var(--color-info-default)', opacity: 0.6 }} />
          )}
        </div>
        <p className="truncate" style={{ 
          fontSize: '12px', 
          fontWeight: 500,
          fontFamily: 'var(--font-family-base)',
          color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          lineHeight: 1.3,
        }}>
          {block.title || '(Untitled)'}
        </p>
        <div className="flex items-center gap-2 mt-0.5" style={{ fontSize: '9.5px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          {step && (
            <span className="inline-flex items-center gap-0.5 min-w-0 flex-1" title={`Step group: ${step}`}>
              <Hash size={8} className="shrink-0" />
              {/* The step takes whatever room is left and truncates first; duration
                  and repeat are `shrink-0` because a row that hides a repeat is a
                  row that lies about where the block appears. */}
              <span className="truncate" style={{ fontFamily: 'var(--font-family-mono)' }}>{step}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-0.5 shrink-0" title="Duration">
            <Clock size={8} />
            {block.duration || 5}m
          </span>
          {repeat && (
            <span
              className="inline-flex items-center gap-0.5 shrink-0"
              style={{
                color: repeat.targetsNone ? 'var(--color-status-warning-text)' : 'var(--color-primary-default)',
                fontWeight: 500,
              }}
              title={repeat.targetsNone
                ? 'Carry forward is on but no day was chosen — this block appears on its own day only'
                : `Carry forward: ${repeat.label}`}
            >
              <Repeat size={8} />
              {repeat.label}
            </span>
          )}
        </div>
      </div>
      <Button 
        variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        style={{ color: 'var(--color-text-muted)' }}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        <Trash2 size={10} />
      </Button>
    </div>
  );
}, (prev, next) => {
  return prev.block === next.block && prev.index === next.index && prev.isSelected === next.isSelected
    && prev.dayNumber === next.dayNumber && prev.totalDays === next.totalDays
    && prev.activityLabel === next.activityLabel && prev.activityIcon === next.activityIcon;
});

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

// --- HELPER COMPONENTS ---
function BlockPaletteMenu({ onSelect }: { onSelect: (type: string, subtype?: string) => void }) {
   // Block type definitions with their allowed-block keys for matching
   // Definition lives in block-type-rules.ts so it can be asserted against `can_hold`
   // — see PALETTE_BLOCK_TYPES. Icons stay here; they are presentation.
   const ICONS: Record<string, JSX.Element> = {
     lesson:   <BookOpen size={14} className="mr-2" />,
     exercise: <PenTool size={14} className="mr-2" />,
     journal:  <MessageCircle size={14} className="mr-2" />,
     conclude: <Target size={14} className="mr-2" />,
   };
   const blockTypes = PALETTE_BLOCK_TYPES.map(b => ({ ...b, icon: ICONS[b.type] }));
   
   // Filter by what the stage can actually hold (2026-09-04).
   //
   // This used to reason over `allowedBlocks` — a 23-string snake_case palette
   // that existed in no store and no type union, matched by substring, and
   // whose entries granted nothing on 8 of 19. `can_hold` on the stage's
   // catalog row is the real rule and says exactly which block types belong.
   /*
     UNFILTERED (§19 step 3). This narrowed the palette to the stage's
     `can_hold` list. A day has no type to look one up from, and the settled
     model drops composition constraint anyway — a template seeds a day, it does
     not police what may go on it afterwards. Every block type, anywhere.

     Worth recording what was given up: nothing. All 11 holder types had zero
     blocks, so `can_hold` described a containment relationship no content has
     ever used.
   */
   const filtered = blockTypes;

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 px-2.5 h-7" style={{ fontSize: '11px', color: 'var(--color-text-muted)', borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
               <Plus size={12} /> Add
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
            {filtered.map(bt => (
              <DropdownMenuItem key={bt.type} onClick={() => onSelect(bt.type)}>
                {bt.icon} {bt.label}
              </DropdownMenuItem>
            ))}
            {filtered.length === 0 && (
              <DropdownMenuItem disabled>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No blocks allowed for this day type</span>
              </DropdownMenuItem>
            )}
         </DropdownMenuContent>
      </DropdownMenu>
   )
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
  
  const days = program.daily_content || [];
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
                    <div className="animate-in fade-in duration-300 space-y-3">
                      <div>
                        <h2 style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}>Day Configuration</h2>
                        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>Define the identity and goals for Day {activeDay.day}.</p>
                      </div>

                      {/* Compact 2-column grid form */}
                      <div className="space-y-2">
                        {/* Title + Type row */}
                        <div className="grid grid-cols-[1fr_140px] gap-2">
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Day Title</label>
                            <Input 
                              value={activeDay.title} 
                              onChange={e => handleUpdateDay(activeDay.day, { title: e.target.value })}
                              placeholder="e.g. Introduction to Mindfulness"
                              className="h-9"
                              style={{ fontWeight: 500, fontSize: '13px', borderRadius: 'var(--radius-md)' }}
                              disabled={readOnly}
                            />
                          </div>
                          <div>
                            {/*
                              APPLY A TEMPLATE — not set a type (§19 step 3).

                              This was a Day Type select whose value was stored on
                              the day and everything else derived from. A day now
                              carries its own `policy` and `layout`; picking here
                              WRITES them and seeds the blocks, once. The control
                              therefore has no current value to show — nothing to
                              select, because the day is not "a learning day", it is
                              a day that was made from the learning template and has
                              been its own thing since.
                            */}
                            <label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>
                              Apply a template <span style={{ fontWeight: 400 }}>— writes this day&apos;s behaviour and appearance, once</span>
                            </label>
                            <Select
                              value=""
                              onValueChange={(v: string) => handleUpdateDay(activeDay.day, { applyTemplate: v as DayType } as Partial<DayContent>)}
                              disabled={readOnly}
                            >
                              <SelectTrigger className="h-9" style={{ fontSize: '12px', borderRadius: 'var(--radius-md)' }}>
                                <SelectValue placeholder="Choose a template…" />
                              </SelectTrigger>
                              <SelectContent>
                                {stageRows.map((row) => (
                                  <SelectItem key={row.value} value={row.value}>
                                    <div className="flex items-center gap-2">
                                      <span>{row.label}</span>
                                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                        {(row.activities ?? []).length} activities
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: 3 }}>
                              Applying one overwrites this day&apos;s policy and layout, and seeds
                              blocks if it has none. Editing the template later will not change
                              this day.
                            </p>
                          </div>
                        </div>

                        {/* Subtitle */}
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Subtitle</label>
                          <Input 
                            value={activeDay.subtitle || ''} 
                            onChange={e => handleUpdateDay(activeDay.day, { subtitle: e.target.value })}
                            placeholder="e.g. Learn the basics of breathing exercises"
                            className="h-8"
                            style={{ fontSize: '12px', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)' }}
                            disabled={readOnly}
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Description</label>
                          <Textarea 
                            value={activeDay.description || ''} 
                            onChange={e => handleUpdateDay(activeDay.day, { description: e.target.value })}
                            placeholder="Brief summary..."
                            rows={2}
                            style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', minHeight: '52px' }}
                            disabled={readOnly}
                          />
                        </div>
                      </div>

                      {/* ── THIS DAY'S OWN POLICY AND LAYOUT ── */}
                      {/*
                        Was "DAY TYPE PRESET DETAILS" — a read-only view of the
                        preset the day's type pointed at, including its
                        `can_hold` allow-list. All of that described a template,
                        not this day. Since §19 step 3 the day carries its own
                        policy and layout, so this shows what THIS day actually
                        obeys, and the provenance stamp saying which template
                        wrote it and when.
                      */}
                      {(() => {
                        const policy = policyOf(activeDay);
                        const layout = layoutOf(activeDay);
                        const source = (activeDay as { policy_source?: string }).policy_source;
                        const rows: [string, string][] = [
                          ['Auto-advance', String(policy.autoAdvance ?? false)],
                          ['Navigation back', String(policy.navigationBack ?? false)],
                          ['Scoring', String(policy.scoringEnabled ?? false)],
                          ['Save on exit', String(policy.saveOnExit ?? false)],
                          ['Save on toggle', String(policy.saveOnToggle ?? false)],
                          ['Steps', policy.stepGroupRules.allowed
                            ? (policy.stepGroupRules.required ? 'allowed, required' : 'allowed')
                            : 'not allowed'],
                          ['Layout', layout.layout],
                          ['Progress', layout.progressStyle],
                          ['Primary button', layout.primaryButtonText.last === layout.primaryButtonText.otherwise
                            ? layout.primaryButtonText.last
                            : `${layout.primaryButtonText.otherwise} / ${layout.primaryButtonText.last} on the last step`],
                          ['Completion title', layout.completionTitle],
                        ];
                        return (
                          <Card style={{ border: '1px solid var(--color-border-default)' }}>
                            <CardContent className="p-3 space-y-1">
                              <p className="uppercase tracking-wider mb-1" style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>
                                This day&apos;s behaviour
                              </p>
                              {rows.map(([k, v]) => (
                                <div key={k} className="flex items-baseline justify-between gap-2" style={{ fontSize: '11px', fontFamily: 'var(--font-family-base)' }}>
                                  <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                                  <span style={{ color: 'var(--color-text-primary)' }}>{v}</span>
                                </div>
                              ))}
                              <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: 6 }}>
                                {source
                                  ? `Seeded from ${source}. Editing that template will not change this day.`
                                  : 'This day owns these values; no template has been applied to it.'}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })()}
                    </div>
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