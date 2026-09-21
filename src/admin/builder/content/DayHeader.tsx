/**
 * The day, above its blocks: what it is called, what it holds, and the menu of
 * things you can do to it. §21 item 6.
 *
 * The day actions used to live on a row inside the block list labelled
 * "Metadata & Goals" — three icon buttons, one of them a delete with no confirm,
 * sitting in the same list as the blocks themselves. They are a menu on the day
 * now, which is where the mockup puts them and where they belong.
 *
 * "Day settings" is the fourth item because the day still has fields no menu can
 * hold — subtitle, description, and the template that seeds its policy and
 * layout. Those stay in the editor column, reached from here.
 */
import { MoreVertical, Settings, Repeat, Copy, Trash2, Clock, Layers } from 'lucide-react';
import { DayContent } from '../../../lib/blocks/block-model';
import { dayMeta } from '../../../lib/blocks/day-meta';
import { Button } from '../../ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '../../ui/dropdown-menu';

export interface DayHeaderProps {
  day: DayContent;
  /** The programme's last day number — what a repeat can reach. */
  lastDay: number;
  /** Replaces the day title when the record has no days of its own (assessments). */
  labelOverride?: string;
  onOpenDaySettings: () => void;
  onRepeatDay: () => void;
  onDuplicateDay: () => void;
  onDeleteDay: () => void;
  /** Assessments have one implicit day; none of the day actions apply. */
  showDayActions: boolean;
  readOnly: boolean;
}

export function DayHeader({
  day, lastDay, labelOverride, onOpenDaySettings, onRepeatDay, onDuplicateDay, onDeleteDay,
  showDayActions, readOnly,
}: DayHeaderProps) {
  const meta = dayMeta(day, lastDay);

  return (
    <div
      className="flex items-start gap-2 px-3 py-2 shrink-0"
      style={{ backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-default)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="truncate" style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
          {labelOverride || day.title || `Day ${day.day}`}
        </div>
        <div
          className="flex items-center gap-2.5 flex-wrap"
          style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}
        >
          {showDayActions && <span>Day {day.day}</span>}
          <span className="inline-flex items-center gap-1">
            <Layers size={10} /> {meta.blocks} {meta.blocks === 1 ? 'block' : 'blocks'}
          </span>
          {meta.minutes > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock size={10} /> {meta.minutes} min
            </span>
          )}
          {meta.repeatLabel && (
            <span
              className="inline-flex items-center gap-1"
              style={{ color: 'var(--color-primary-default)', fontWeight: 600 }}
              title="A block on this day is carried forward"
            >
              <Repeat size={10} /> {meta.repeatLabel}
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
            title="Day options"
          >
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onOpenDaySettings}>
            <Settings size={13} className="mr-2" /> Day settings
          </DropdownMenuItem>
          {showDayActions && !readOnly && (
            <>
              <DropdownMenuItem onClick={onRepeatDay}>
                <Repeat size={13} className="mr-2" /> Repeat this day
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicateDay}>
                <Copy size={13} className="mr-2" /> Duplicate day
              </DropdownMenuItem>
              {day.day !== 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDeleteDay} style={{ color: 'var(--color-status-danger)' }}>
                    <Trash2 size={13} className="mr-2" /> Delete day
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
