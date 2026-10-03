/**
 * The calendar, collapsed: a button that opens the full day list, and a
 * horizontal scroller of day chips. §21 item 6.
 *
 * It replaces a strip that sat ABOVE both columns and spanned the whole builder.
 * Putting it inside column 1 is the point of the item — the days and the blocks
 * of the selected day are one column, and the editor gets the rest of the width.
 */
import { CalendarDays, Plus } from 'lucide-react';
import { DayContent } from '../model/block-model';
import { Button } from '../../ui/button';
import { DraggableDay } from './DayChip';

export interface DayCalendarStripProps {
  days: DayContent[];
  selectedDay: number | null;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelectDay: (day: number) => void;
  moveDay: (dragIndex: number, hoverIndex: number) => void;
  onAddDay: () => void;
  readOnly: boolean;
}

export function DayCalendarStrip({
  days, selectedDay, expanded, onToggleExpanded, onSelectDay, moveDay, onAddDay, readOnly,
}: DayCalendarStripProps) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 shrink-0"
      style={{ backgroundColor: 'var(--color-bg-muted)', borderBottom: '1px solid var(--color-border-default)' }}
    >
      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        title={expanded ? 'Hide the day list' : 'All days'}
        className="shrink-0 flex items-center justify-center h-7 w-7 transition-colors"
        style={{
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border-default)',
          backgroundColor: expanded ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
          color: expanded ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
        }}
      >
        <CalendarDays size={14} />
      </button>

      <div className="flex-1 min-w-0 overflow-x-auto flex items-center gap-1.5 py-0.5 scrollbar-thin">
        {days.length === 0 ? (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No days yet</span>
        ) : days.map((day, index) => (
          <DraggableDay
            key={day.day}
            day={day}
            index={index}
            isSelected={selectedDay === day.day}
            onSelect={() => onSelectDay(day.day)}
            moveDay={moveDay}
          />
        ))}
      </div>

      {!readOnly && (
        <Button
          onClick={onAddDay}
          size="sm"
          variant="outline"
          className="gap-1 shrink-0 h-7 px-2"
          style={{ fontSize: '11px', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)' }}
          title="Add a day"
        >
          <Plus size={12} /> Day
        </Button>
      )}
    </div>
  );
}
