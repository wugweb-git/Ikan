import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, GripVertical, Settings, MoreHorizontal, 
  Copy, ChevronRight, BookOpen, Clock, Calendar, FastForward,
  PenTool, MessageCircle, Target
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { AdminFormField } from '../admin/AdminFormField';
import { DayContent, Activity } from '../../lib/equip-admin-types';
import { EquipBlockEditor } from './EquipBlockEditor';
import { DAY_TYPE_PRESETS, getPresetForDayType } from '../admin/day-presets';
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

const DraggableDay = ({ day, index, isSelected, onSelect, moveDay, onDuplicate, onDelete }: DraggableDayProps) => {
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

  return (
    <div 
      ref={ref}
      onClick={onSelect}
      data-handler-id={handlerId}
      className={cn(
        "group flex items-center gap-3 p-3 cursor-pointer transition-all border mb-1",
        isSelected 
          ? "border-2 shadow-sm ring-1" 
          : "bg-transparent border-transparent",
        isSelected && "bg-[var(--color-bg-card)] border-[var(--color-primary-default)] ring-[var(--color-primary-default)]/10",
        !isSelected && "hover:bg-[var(--color-bg-card)] hover:border-[var(--color-border-default)]",
        isDragging && "opacity-50"
      )}
    >
      <div className="cursor-grab" style={{ color: 'var(--color-text-muted)' }}>
        <GripVertical size={14} />
      </div>

      <div 
        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
        style={{ 
          fontSize: 'var(--text-xs)', 
          fontWeight: 'var(--font-weight-medium)',
          backgroundColor: isSelected ? 'var(--color-info-light)' : 'var(--color-bg-muted)', 
          color: isSelected ? 'var(--color-info-default)' : 'var(--color-text-muted)' 
        }}
      >
        {day.day}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="truncate" style={{ 
          fontSize: 'var(--text-sm)', 
          fontWeight: 'var(--font-weight-medium)',
          color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)' 
        }}>
          {day.title || `Day ${day.day}`}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 uppercase" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border-default)', fontWeight: 'var(--font-weight-medium)' }}>
            {day.dayType || 'lesson'}
          </Badge>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
            {day.activities.length} blocks
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
            <Copy className="w-4 h-4 mr-2" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ color: 'var(--color-status-danger)' }}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// --- DRAGGABLE BLOCK COMPONENT ---
interface DraggableBlockProps {
  block: Activity;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  onDelete: () => void;
}

const DraggableBlock = ({ block, index, isSelected, onSelect, moveBlock, onDelete }: DraggableBlockProps) => {
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

  return (
    <div 
      ref={ref}
      onClick={onSelect}
      data-handler-id={handlerId}
      className={cn(
        "group p-3 border cursor-pointer transition-all hover:shadow-sm flex items-start gap-3",
        isSelected 
          ? "border-2 shadow-sm ring-1" 
          : "border-[1px]",
        isSelected && "bg-[var(--color-bg-card)] border-[var(--color-primary-default)] ring-[var(--color-primary-default)]/10",
        !isSelected && "bg-[var(--color-bg-card)] border-[var(--color-border-default)] hover:border-[var(--color-primary-default)]",
        isDragging && "opacity-50"
      )}
    >
      <div className="mt-1 cursor-grab" style={{ color: 'var(--color-text-muted)' }}>
        <GripVertical size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-accent-default)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>
              {block.type}
            </Badge>
            {block.stepGroup && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 ml-1" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border-default)', fontWeight: 'var(--font-weight-medium)' }}>
                Step: {block.stepGroup}
              </Badge>
            )}
            {block.autoAdvance && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 ml-1" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info-default)', borderColor: 'var(--color-info-default)' }} title="Auto-advance enabled">
                <FastForward size={8} className="mr-0.5" /> Auto
              </Badge>
            )}
          </div>
        </div>
        <p className="truncate" style={{ 
          fontSize: 'var(--text-sm)', 
          fontWeight: 'var(--font-weight-medium)', 
          color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)' 
        }}>
          {block.title || '(Untitled Block)'}
        </p>
        <p className="mt-0.5 truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {block.duration || 5} min • {block.required ? 'Required' : 'Optional'}
        </p>
      </div>
      <Button 
        variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--color-text-muted)' }}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        <Trash2 size={12} />
      </Button>
    </div>
  );
};

export interface DailyBuilderProps {
  program: { daily_content?: DayContent[] } & Record<string, any>;
  mode: 'equip' | 'assessment' | 'onboarding';
  singleDayMode: boolean;
  onProgramChange: (updates: Partial<{ daily_content: DayContent[] } & Record<string, any>>) => void;
  validationMode?: 'draft' | 'publish';
  readOnly?: boolean;
}

// --- HELPER COMPONENTS ---
function BlockPaletteMenu({ onSelect }: { onSelect: (type: string, subtype?: string) => void }) {
   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5 px-4 shadow-sm" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)', height: 'var(--ikan-component-button-height)', borderRadius: 'var(--radius-lg)' }}>
               <Plus size={16} /> Add Block
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSelect('lesson')}>
               <BookOpen size={14} className="mr-2" /> Lesson
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelect('exercise')}>
               <PenTool size={14} className="mr-2" /> Exercise
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelect('journal')}>
               <MessageCircle size={14} className="mr-2" /> Journal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelect('conclude')}>
               <Target size={14} className="mr-2" /> Conclusion
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}

// --- MAIN EDITOR COMPONENT ---
export function EquipDailyEditor({ 
  program, 
  mode, 
  singleDayMode, 
  onProgramChange, 
  validationMode = 'draft',
  readOnly = false 
}: DailyBuilderProps) {
  
  const days = program.daily_content || [];
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(days.length > 0 ? 1 : null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Helper to update days
  const handleDaysChange = (newDays: DayContent[]) => {
    onProgramChange({ daily_content: newDays });
  };

  // Ensure selection validity & Single Day Mode Enforcement
  useEffect(() => {
    if (singleDayMode) {
      if (days.length === 0) {
        // Create implicit day if missing
        const implicitDay: DayContent = {
          day: 1,
          title: 'Assessment Content',
          description: '',
          activities: [],
          dayType: 'practice'
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
       if (selectedDayNum === null && days.length > 0) {
         setSelectedDayNum(days[0].day);
       }
    }
  }, [days.length, singleDayMode]);

  const activeDay = days.find(d => d.day === selectedDayNum);
  const activeBlock = activeDay?.activities.find(b => b.id === selectedBlockId);

  const moveDay = (dragIndex: number, hoverIndex: number) => {
    if (singleDayMode || readOnly) return;
    const newDays = [...days];
    const [draggedDay] = newDays.splice(dragIndex, 1);
    newDays.splice(hoverIndex, 0, draggedDay);
    // Reassign day numbers
    const reordered = newDays.map((d, i) => ({ ...d, day: i + 1 }));
    handleDaysChange(reordered);
    if (selectedDayNum === draggedDay.day) {
      setSelectedDayNum(hoverIndex + 1);
    }
  };

  const moveBlock = (dragIndex: number, hoverIndex: number) => {
    if (!activeDay || readOnly) return;
    const newActivities = [...activeDay.activities];
    const [draggedBlock] = newActivities.splice(dragIndex, 1);
    newActivities.splice(hoverIndex, 0, draggedBlock);
    
    const newDays = days.map(d => 
      d.day === activeDay.day ? { ...d, activities: newActivities } : d
    );
    handleDaysChange(newDays);
  };

  const handleAddDay = () => {
    if (singleDayMode || readOnly) return;
    const newDayNum = days.length + 1;
    const newDay: DayContent = {
      day: newDayNum,
      title: `Day ${newDayNum}`,
      description: '',
      activities: [],
      dayType: 'lesson'
    };
    handleDaysChange([...days, newDay]);
    setSelectedDayNum(newDayNum);
    setSelectedBlockId(null);
  };

  const handleDeleteDay = (dayNum: number) => {
    if (singleDayMode || readOnly) return;
    const newDays = days.filter(d => d.day !== dayNum).map((d, i) => ({
      ...d,
      day: i + 1
    }));
    handleDaysChange(newDays);
    if (selectedDayNum === dayNum) {
      setSelectedDayNum(newDays.length > 0 ? newDays[0].day : null);
    }
  };

  const handleDuplicateDay = (dayToDuplicate: DayContent) => {
    if (singleDayMode || readOnly) return;
    const newDayNum = days.length + 1;
    const newDay: DayContent = {
      ...dayToDuplicate,
      day: newDayNum,
      title: `${dayToDuplicate.title} (Copy)`,
      activities: dayToDuplicate.activities.map(a => ({ ...a, id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }))
    };
    handleDaysChange([...days, newDay]);
    setSelectedDayNum(newDayNum);
  };

  const handleUpdateDay = (dayNum: number, updates: Partial<DayContent>) => {
    if (readOnly) return;

    // Check if dayType changed and auto-populate if empty
    const currentDay = days.find(d => d.day === dayNum);
    if (updates.dayType && currentDay && updates.dayType !== currentDay.dayType) {
       if (currentDay.activities.length === 0) {
          const preset = getPresetForDayType(updates.dayType);
          if (preset && preset.defaultBlocks) {
             const newBlocks = preset.defaultBlocks.map((b, i) => ({
                ...b,
                id: `block-${Date.now()}-${i}`,
                order: i,
                required: b.required ?? false,
                title: b.title || 'Untitled Block'
             })) as Activity[];
             updates.activities = newBlocks;
             
             // Also update selected block to first one
             setTimeout(() => {
                if (newBlocks.length > 0) setSelectedBlockId(newBlocks[0].id);
             }, 100);
          }
       }
    }

    const newDays = days.map(d => 
      d.day === dayNum ? { ...d, ...updates } : d
    );
    handleDaysChange(newDays);
  };

  const addBlock = (type: string = 'lesson', subtype?: string) => {
    if (!activeDay || readOnly) return;
    const newBlock: Activity = {
      id: `block-${Date.now()}`,
      title: type === 'lesson' ? 'New Lesson' : 'New Activity',
      type: type as any,
      content: '',
      duration: 5,
      required: true,
      order: activeDay.activities.length,
      exerciseConfig: subtype ? { subtype: subtype as any } : undefined
    };
    const newDays = days.map(d => 
      d.day === activeDay.day ? { ...d, activities: [...d.activities, newBlock] } : d
    );
    handleDaysChange(newDays);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (blockId: string, updates: Partial<Activity>) => {
    if (!activeDay || readOnly) return;
    const newDays = days.map(d => 
      d.day === activeDay.day ? {
        ...d,
        activities: d.activities.map(b => b.id === blockId ? { ...b, ...updates } : b)
      } : d
    );
    handleDaysChange(newDays);
  };

  const deleteBlock = (blockId: string) => {
    if (!activeDay || readOnly) return;
    const newDays = days.map(d => 
      d.day === activeDay.day ? {
        ...d,
        activities: d.activities.filter(b => b.id !== blockId)
      } : d
    );
    handleDaysChange(newDays);
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
    <div className="h-[calc(100vh-250px)] flex border overflow-hidden shadow-sm ring-1" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-default)', boxShadow: '0 0 0 1px var(--color-border-default)', borderRadius: 'var(--radius-xl, 24px)' }}>
      {/* COLUMN 1: DAY LIST (Timeline) - Hidden in Single Day Mode */}
      {!singleDayMode && (
      <div className="w-[20%] min-w-[200px] flex flex-col border-r" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
        <div className="p-4 border-b flex items-center justify-between sticky top-0 z-10 h-14" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)' }}>Days ({days.length})</span>
          {!readOnly && (
            <Button onClick={handleAddDay} size="sm" variant="outline" className="h-8 gap-1.5">
              <Plus size={14} /> Add
            </Button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {days.length === 0 ? (
            <div className="text-center py-12 px-4" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
              No days added. Click "Add" to start.
            </div>
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
      </div>
      )}

      {/* COLUMN 2: STRUCTURE (Content Blocks) */}
      <div className={cn(
        "flex flex-col border-r",
        singleDayMode ? "w-[35%] min-w-[300px]" : "w-[30%] min-w-[300px]"
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
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Day Configuration</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Metadata & Goals</p>
                </div>
                {selectedBlockId === null && <div className="ml-auto" style={{ color: 'var(--color-info-default)' }}><ChevronRight size={14} /></div>}
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
                  <Button variant="link" size="sm" onClick={addBlock} className="h-auto p-0 mt-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-default)' }}>
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

      {/* COLUMN 3: CONTEXTUAL EDITOR (Flex-1) */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
        {activeDay ? (
          <div className="flex-1 overflow-y-auto">
            {/* SCOPE HINT HEADER */}
            <div className="h-8 border-b px-4 flex items-center uppercase tracking-wider sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-card)', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
              {singleDayMode ? `${getModeLabel()} Mode` : `Editing: Day ${activeDay.day}`} 
              <span className="mx-2" style={{ color: 'var(--color-border-default)' }}>•</span> 
              {selectedBlockId ? 'Block Editor' : 'Configuration'}
            </div>

            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                {selectedBlockId === null && !singleDayMode ? (
                  // --- DAY CONFIGURATION EDITOR (Multi-day only) ---
                  <div className="animate-in fade-in duration-300 space-y-6">
                    <div>
                      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Day Configuration</h2>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Define the identity and goals for Day {activeDay.day}.</p>
                    </div>

                    <Card>
                      <CardContent className="p-6 space-y-6">
                        <AdminFormField label="Day Title">
                          <Input 
                            value={activeDay.title} 
                            onChange={e => handleUpdateDay(activeDay.day, { title: e.target.value })}
                            placeholder="e.g. Introduction to Mindfulness"
                            style={{ fontWeight: 'var(--font-weight-medium)' }}
                            disabled={readOnly}
                          />
                        </AdminFormField>

                        <div className="grid grid-cols-2 gap-4">
                          <AdminFormField label="Day Type">
                            <Select 
                              value={activeDay.dayType || 'lesson'} 
                              onValueChange={(v: any) => handleUpdateDay(activeDay.day, { dayType: v })}
                              disabled={readOnly}
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {Object.entries(DAY_TYPE_PRESETS).map(([key, preset]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      <span>{preset.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </AdminFormField>

                          <AdminFormField label="Order">
                            <Input value={activeDay.day} disabled style={{ backgroundColor: 'var(--color-bg-muted)' }} />
                          </AdminFormField>
                        </div>

                        <AdminFormField label="Description">
                          <Textarea 
                            value={activeDay.description || ''} 
                            onChange={e => handleUpdateDay(activeDay.day, { description: e.target.value })}
                            placeholder="Brief summary of what the user will achieve today..."
                            rows={3}
                            disabled={readOnly}
                          />
                        </AdminFormField>
                      </CardContent>
                    </Card>
                  </div>
                ) : activeBlock ? (
                  // --- BLOCK EDITOR ---
                  <div className="animate-in fade-in duration-300">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="uppercase tracking-wider text-[10px]" style={{ backgroundColor: 'var(--color-accent-default)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                          {activeBlock.type} Block
                        </Badge>
                      </div>
                      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                        {activeBlock.title || 'Untitled Block'}
                      </h2>
                    </div>

                    <EquipBlockEditor
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
  );
}