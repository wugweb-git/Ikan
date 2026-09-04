import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  Plus, Trash2, GripVertical, Settings, MoreHorizontal, 
  Copy, ChevronRight, BookOpen, Clock, Calendar, FastForward,
  PenTool, MessageCircle, Target, AlertTriangle, Info, Layers, Zap,
  RotateCcw, Repeat
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { AdminFormField } from '../admin/AdminFormField';
import { DayContent, Activity } from '../../lib/blocks/block-model';
import { BlockEditor } from './BlockEditor';
import { DAY_TYPE_PRESETS, PALETTE_BLOCK_TYPES, getPresetForDayType } from '../../lib/blocks/block-type-rules';
import { METADATA_CATALOG_ITEMS } from '../../lib/metadata-catalog';
import { useMetadata, isContainerRow } from '../../hooks/useMetadata';
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
  // Color-code by day type
  const typeColor = isOnboarding ? '#E5A100'
    : day.dayType === 'assessment' ? '#7C3AED'
    : day.dayType === 'assessment-lite' ? '#8B5CF6'
    : day.dayType === 'practice' ? '#059669'
    : day.dayType === 'reflection' ? '#0284C7'
    : day.dayType === 'rest' ? '#64748B'
    : day.dayType === 'quiz' ? '#D97706'
    : day.dayType === 'check-in' ? '#EC4899'
    : day.dayType === 'tracker' ? '#10B981'
    : day.dayType === 'workshop' ? '#6366F1'
    : 'var(--color-primary-default)';

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
}

const DraggableBlock = memo(function DraggableBlock({ block, index, isSelected, onSelect, moveBlock, onDelete }: DraggableBlockProps) {
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[9px] px-1 py-0 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontFamily: 'var(--font-family-base)' }}>
            {safeType}
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
      </div>
      <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', opacity: 0.5, whiteSpace: 'nowrap' }}>
        {block.duration || 5}m
      </span>
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
  return prev.block === next.block && prev.index === next.index && prev.isSelected === next.isSelected;
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
function BlockPaletteMenu({ onSelect, dayType }: { onSelect: (type: string, subtype?: string) => void; dayType?: string }) {
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
   const canHold = dayType
     ? METADATA_CATALOG_ITEMS.find(r => r.type === 'block_type' && r.slug === dayType)?.can_hold
     : undefined;
   const filtered = canHold?.length
     ? blockTypes.filter(bt => canHold.includes(bt.type))
     : blockTypes;

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
  // vocabulary — `can_hold` non-empty — read from the catalog rather than from
  // a code enum, so adding a stage is a data change.
  const { blockTypes: kvBlockTypes } = useMetadata();
  const stageRows = kvBlockTypes.filter(isContainerRow);

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
          dayType: mode === 'assessment' ? 'assessment' : 'practice'
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
  }, [dayNumbers, singleDayMode]);

  const activeDay = days.find(d => d.day === selectedDayNum);
  const activeBlock = activeDay?.activities.find(b => b.id === selectedBlockId);

  // If selected block no longer exists (deleted/changed), reset
  const activeBlockIds = activeDay?.activities.map(b => b.id).join(',') || '';
  useEffect(() => {
    if (selectedBlockId && activeDay && !activeDay.activities.some(b => b.id === selectedBlockId)) {
      setSelectedBlockId(null);
    }
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
        dayType: 'learning'
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
      
      if (updatesToApply.dayType && currentDay && updatesToApply.dayType !== currentDay.dayType) {
         if (currentDay.activities.length === 0) {
            const preset = getPresetForDayType(updatesToApply.dayType);
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
    const preset = activeDay.dayType ? getPresetForDayType(activeDay.dayType) : undefined;
    
    const newBlock: Activity = {
      id: generateBlockId(),
      title: type === 'lesson' ? 'New Lesson' : 'New Activity',
      type: type as any,
      content: '',
      duration: 5,
      // Was `preset?.autoConfig.scoringEnabled ? true : true` — identical
      // branches, so the condition never mattered. Found by the linter within
      // minutes of it existing, which is the argument for having one.
      required: true,
      autoAdvance: preset?.autoConfig.autoAdvance ?? false,
      order: activeDay.activities.length,
      activityConfig: subtype ? { subtype: subtype as any } : undefined
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
                  <BlockPaletteMenu onSelect={addBlock} dayType={activeDay.dayType} />
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
                            {/* Day type is a BLOCK TYPE that holds blocks — the two
                                vocabularies merged in Phase 1.1, so this list is the
                                catalog's container rows, not a separate enum.
                                Defaulted rather than required: live, 93 of 97 days sit
                                on the default and all 4 manual picks were wrong — one of
                                them `lesson`, a leaf type, which matched no preset and so
                                skipped validation entirely. */}
                            <label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>
                              Day Type <span style={{ fontWeight: 400 }}>— defaults to Learning</span>
                            </label>
                            <Select 
                              value={activeDay.dayType || 'learning'} 
                              onValueChange={(v: any) => handleUpdateDay(activeDay.day, { dayType: v })}
                              disabled={readOnly}
                            >
                              <SelectTrigger className="h-9" style={{ fontSize: '12px', borderRadius: 'var(--radius-md)' }}><SelectValue /></SelectTrigger>
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
                            {activeDay.dayType && !stageRows.some(r => r.value === activeDay.dayType) && (
                              <p style={{ fontSize: '10px', color: 'var(--color-status-warning)', marginTop: 3 }}>
                                “{activeDay.dayType}” is not a stage, so this day matches no preset
                                and skips every content check. Pick one above.
                              </p>
                            )}
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

                      {/* ── DAY TYPE PRESET DETAILS ── */}
                      {(() => {
                        const preset = getPresetForDayType(activeDay.dayType || 'learning');
                        if (!preset) return null;
                        return (
                          <Card style={{ border: '1px solid var(--color-border-default)' }}>
                            <CardContent className="p-0">
                              {/* Preset header */}
                              <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-default)', opacity: 0.1 }}>
                                  <Zap size={14} style={{ color: 'var(--color-primary-default)' }} />
                                </div>
                                <div className="flex-1">
                                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}>
                                    {preset.label} Preset
                                  </p>
                                  <p style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>
                                    {preset.description}
                                  </p>
                                </div>
                                {/* Reset to preset defaults */}
                                {!readOnly && activeDay.activities.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 h-7 px-2 shrink-0"
                                    style={{ fontSize: '10px', color: 'var(--color-status-warning)', fontWeight: 500 }}
                                    title="Replace all blocks with preset defaults"
                                    onClick={() => {
                                      if (!confirm(`Reset Day ${activeDay.day} blocks to ${preset.label} defaults? This will replace all existing blocks.`)) return;
                                      const newBlocks = preset.defaultBlocks.map((b, i) => ({
                                        ...b,
                                        id: generateBlockId(),
                                        order: i,
                                        required: b.required ?? false,
                                        title: b.title || 'Untitled Block'
                                      })) as Activity[];
                                      handleUpdateDay(activeDay.day, { activities: newBlocks });
                                      setSelectedBlockId(null);
                                      setTimeout(() => {
                                        if (newBlocks.length > 0) setSelectedBlockId(newBlocks[0].id);
                                      }, 100);
                                    }}
                                  >
                                    <RotateCcw size={11} /> Reset blocks
                                  </Button>
                                )}
                              </div>

                              <div className="p-5 space-y-4">
                                {/* Auto-config grid */}
                                <div>
                                  <p className="uppercase tracking-wider mb-2" style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>
                                    Player Behavior
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {Object.entries(preset.autoConfig).map(([key, val]) => (
                                      <div key={key} className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
                                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ 
                                          backgroundColor: val ? 'var(--color-status-success-light)' : 'var(--color-bg-muted)',
                                          border: val ? 'none' : '1px solid var(--color-border-default)'
                                        }}>
                                          {val && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-status-success)' }} />}
                                        </div>
                                        <span style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: val ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Step Group Rules */}
                                <div>
                                  <p className="uppercase tracking-wider mb-2" style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>
                                    Step Groups
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    <span style={{
                                      fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)',
                                      padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                                      backgroundColor: preset.stepGroupRules.allowed ? 'var(--color-status-success-light)' : 'var(--color-status-danger-light)',
                                      color: preset.stepGroupRules.allowed ? 'var(--color-status-success)' : 'var(--color-status-danger)',
                                    }}>
                                      {preset.stepGroupRules.allowed ? 'Allowed' : 'Not Allowed'}
                                    </span>
                                    {preset.stepGroupRules.required && (
                                      <span style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' }}>
                                        Required
                                      </span>
                                    )}
                                    {preset.stepGroupRules.maxBlocksPerStep && (
                                      <span style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-default)' }}>
                                        Max {preset.stepGroupRules.maxBlocksPerStep}/step
                                      </span>
                                    )}
                                    {preset.stepGroupRules.oneBlockPerStep && (
                                      <span style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-default)' }}>
                                        1 block/step
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Allowed Blocks */}
                                <div>
                                  <p className="uppercase tracking-wider mb-2" style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>
                                    Allowed Block Types
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {(METADATA_CATALOG_ITEMS.find(r => r.type === 'block_type' && r.slug === activeDay.dayType)?.can_hold ?? []).map(b => (
                                      <span key={b} style={{ fontSize: '10px', fontFamily: 'monospace', padding: '1px 6px', borderRadius: 4, backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-default)' }}>
                                        {b}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Warnings */}
                                {preset.warnings.length > 0 && (
                                  <div className="space-y-1">
                                    {preset.warnings.map((w, i) => (
                                      <div key={i} className="flex items-start gap-2 p-2 rounded-md" style={{ backgroundColor: 'var(--color-status-warning-light)' }}>
                                        <AlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--color-status-warning)' }} />
                                        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-base)', color: 'var(--color-status-warning)', lineHeight: 1.4 }}>{w}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Errors / Validation rules */}
                                {preset.errors.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="uppercase tracking-wider mb-1" style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-status-danger)' }}>
                                      Validation Rules
                                    </p>
                                    {preset.errors.map((e, i) => (
                                      <div key={i} className="flex items-start gap-2 p-2 rounded-md" style={{ backgroundColor: 'var(--color-status-danger-light)' }}>
                                        <Info size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--color-status-danger)' }} />
                                        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-base)', color: 'var(--color-status-danger)', lineHeight: 1.4 }}>{e}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
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
                        dayType={activeDay?.dayType}
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