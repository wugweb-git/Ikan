/**
 * The calendar, expanded: the full day list, covering column 1 in place. §21
 * item 6.
 *
 * In place rather than in a dialog, because it is the same column doing the same
 * job at a different zoom — picking a day returns you to that day's blocks, and a
 * modal would make the return feel like a different screen.
 *
 * Each row states what the strip's 34px chip cannot: the day's title, whether
 * anything on it is carried forward, and how many blocks it holds. Day 0 is
 * tinted by its NUMBER, not by a type — days do not have types.
 */
import { X, Plus, Repeat } from 'lucide-react';
import { DayContent } from '../model/block-model';
import { dayMeta } from '../model/day-meta';
import { Button } from '../../ui/button';

export interface CalendarOverlayProps {
  days: DayContent[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  onClose: () => void;
  onAddDay: () => void;
  readOnly: boolean;
}

export function CalendarOverlay({ days, selectedDay, onSelectDay, onClose, onAddDay, readOnly }: CalendarOverlayProps) {
  const lastDay = days.length ? days[days.length - 1].day : 0;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <div
        className="flex items-center gap-2 px-2 py-1.5 shrink-0"
        style={{ backgroundColor: 'var(--color-bg-muted)', borderBottom: '1px solid var(--color-border-default)' }}
      >
        <button
          type="button"
          onClick={onClose}
          title="Back to blocks"
          className="shrink-0 flex items-center justify-center h-7 w-7"
          style={{
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)',
          }}
        >
          <X size={14} />
        </button>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>All days</span>
        <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>{days.length}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-1.5">
        {days.map((day) => {
          const meta = dayMeta(day, lastDay);
          const isSelected = selectedDay === day.day;
          const isZero = day.day === 0;
          return (
            <button
              type="button"
              key={day.day}
              onClick={() => { onSelectDay(day.day); onClose(); }}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 text-left transition-colors"
              style={{
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isSelected ? 'var(--color-primary-default)' : 'transparent'}`,
                backgroundColor: isSelected ? 'var(--color-bg-muted)' : 'transparent',
              }}
            >
              <span
                className="shrink-0 flex items-center justify-center tabular-nums"
                style={{
                  width: 24, height: 24, borderRadius: '50%', fontSize: '11px', fontWeight: 600,
                  backgroundColor: isSelected ? 'var(--color-primary-default)'
                    : isZero ? 'var(--color-status-warning-light)' : 'var(--color-bg-muted)',
                  color: isSelected ? 'var(--color-primary-on)'
                    : isZero ? 'var(--color-status-warning-text)' : 'var(--color-text-muted)',
                }}
              >
                {day.day}
              </span>
              <span
                className="flex-1 min-w-0 truncate"
                style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: isSelected ? 600 : 400 }}
              >
                {day.title || '(Untitled)'}
              </span>
              {meta.repeatsTo.length > 0 && (
                <span
                  className="shrink-0 inline-flex items-center gap-0.5"
                  title={meta.repeatLabel}
                  style={{
                    fontSize: '10px', fontWeight: 600, color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-xs)', padding: '1px 5px',
                  }}
                >
                  <Repeat size={9} /> {meta.repeatsTo.length}
                </span>
              )}
              <span className="shrink-0 tabular-nums" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {meta.blocks || ''}
              </span>
            </button>
          );
        })}
      </div>

      {!readOnly && (
        <div className="shrink-0 p-1.5" style={{ borderTop: '1px solid var(--color-border-default)' }}>
          <Button
            onClick={onAddDay}
            variant="outline"
            className="w-full gap-1.5 h-8"
            style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', borderStyle: 'dashed', color: 'var(--color-text-muted)' }}
          >
            <Plus size={13} /> Add day
          </Button>
        </div>
      )}
    </div>
  );
}
