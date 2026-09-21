/**
 * A block, as a row in the day's list. Moved verbatim from `DayComposer.tsx`
 * 2026-09-09 (§21 layout port, phase 1) — body unchanged, only the imports are
 * new, so a drag regression after this commit is bisectable to one line.
 */
import { memo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, FastForward, Clock, Hash, Repeat, MoreVertical, ArrowRightLeft, Copy, Trash2 } from 'lucide-react';
import { Activity, repeatSummary } from '../model/block-model';
import { getIconComponent, iconResolves } from '../../catalog/catalog-icons';
import { Button } from '../../ui/button';
import { cn } from '../../ui/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator,
} from '../../ui/dropdown-menu';
import { ItemTypes } from './dnd';

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
  onDuplicate: () => void;
  /** Selects this block and opens the editor's type picker. §21 item 4. */
  onChangeType: () => void;
  /** Every other day this block could move to, in day order. */
  otherDays: { day: number; title: string }[];
  onMoveToDay: (day: number) => void;
  readOnly?: boolean;
}

export const DraggableBlock = memo(function DraggableBlock({ block, index, isSelected, onSelect, moveBlock, onDelete, dayNumber, totalDays, activityLabel, activityIcon, onDuplicate, onChangeType, otherDays, onMoveToDay, readOnly }: DraggableBlockProps) {
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
      {/* Row menu — §21 items 3 and 4. The row used to carry a bare trash icon:
          the only correction available on a block was to destroy it. "Change
          block type" waited for item 4 rather than shipping early, because a
          retype that does not say what it costs is worse than no retype. */}
      {!readOnly && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost" size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity shrink-0 self-start"
              style={{ color: 'var(--color-text-muted)', marginTop: 1 }}
              title="Block options"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onChangeType}>
              <Repeat size={13} className="mr-2" /> Change block type
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy size={13} className="mr-2" /> Duplicate
            </DropdownMenuItem>
            {otherDays.length > 0 ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ArrowRightLeft size={13} className="mr-2" /> Move to another day
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-[280px] overflow-auto">
                  {otherDays.map(d => (
                    <DropdownMenuItem key={d.day} onClick={() => onMoveToDay(d.day)}>
                      <span className="tabular-nums" style={{ minWidth: 22, color: 'var(--color-text-muted)' }}>{d.day}</span>
                      <span className="truncate" style={{ maxWidth: 180 }}>{d.title || '(Untitled)'}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              <DropdownMenuItem disabled>
                <ArrowRightLeft size={13} className="mr-2" /> No other day to move to
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} style={{ color: 'var(--color-status-danger)' }}>
              <Trash2 size={13} className="mr-2" /> Delete block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}, (prev, next) => {
  return prev.block === next.block && prev.index === next.index && prev.isSelected === next.isSelected
    && prev.dayNumber === next.dayNumber && prev.totalDays === next.totalDays
    && prev.activityLabel === next.activityLabel && prev.activityIcon === next.activityIcon
    && prev.otherDays === next.otherDays && prev.readOnly === next.readOnly;
});

export { DraggableBlock as BlockRow };
