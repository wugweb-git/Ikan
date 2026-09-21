/**
 * The block-type picker in the editor header.
 *
 * **It states what a retype drops before it commits** (§21 item 4). Choosing a
 * type does not change the block; it shows a sentence — "Switching to Lesson
 * keeps title, subtitle and content. It drops 3 columns, because Lesson has
 * nowhere to put them." — and waits. The sentence comes from `block-retype.ts`,
 * derived from what each activity actually reads, so it cannot promise something
 * the write then breaks.
 *
 * A searchable list rather than a `Select`, because the vocabulary is 17 types
 * and the mockup asks for "Search 17 block types". It is built on
 * `components/ui/command.tsx` (cmdk), which has been in the repo unused since it
 * was added.
 *
 * A type carries a default ACTIVITY (§26: the activity is what draws), so
 * picking one offers that activity too — otherwise `Exercise → Conclude` leaves
 * the block reading "Conclude — input table", which is what it did before this.
 */
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '../../ui/command';
import { getIconComponent, iconResolves } from '../../catalog/catalog-icons';
import { retypeEffect, retypeSentence } from '../model/block-retype';
import { DEFAULT_ACTIVITY_FOR_TYPE, type ActivityName } from '../model/vocabulary';
import { Button } from '../../ui/button';
import type { Activity } from '../model/block-model';

export interface BlockTypeOption {
  value: string;
  label: string;
  icon?: string;
  /** The activities this type's catalog row permits, for the sub-line. */
  activities?: string[];
}

export interface BlockTypePickerProps {
  /** The block itself — the retype statement is about ITS fields, not the type's. */
  block: Activity;
  type: string;
  /** The activity it carries now. */
  activity?: ActivityName;
  /** The activity's catalog label, shown after the type name. */
  activityLabel?: string;
  /** The activity's catalog icon name — the tile is the ACTIVITY's, not the type's. */
  activityIcon?: string;
  options: BlockTypeOption[];
  /** Commits the retype: the new type and the activity it will carry. */
  onPick: (type: string, activity: ActivityName) => void;
  /** True when the catalog could not be read. The picker says so rather than offering a short list. */
  vocabularyUnavailable?: boolean;
  disabled?: boolean;
  /** A changing number opens the picker — the row kebab's route in. */
  openAt?: number;
}

export function BlockTypePicker({
  block, type, activity, activityLabel, activityIcon, options, onPick, vocabularyUnavailable, disabled, openAt,
}: BlockTypePickerProps) {
  const [open, setOpen] = useState(false);
  /* The type chosen but NOT yet applied. This is the whole of item 4: a picker
     that commits on click cannot tell you what it is about to cost. */
  const [pending, setPending] = useState<BlockTypeOption | null>(null);

  /* Opened from the row kebab. The first render is not a request — only a CHANGE
     is, which is why this compares against the previous value rather than
     firing on mount. */
  const lastOpenAt = useRef(openAt);
  useEffect(() => {
    if (openAt !== undefined && openAt !== lastOpenAt.current) {
      lastOpenAt.current = openAt;
      setPending(null);
      setOpen(true);
    }
  }, [openAt]);

  const pendingActivity = pending
    ? (DEFAULT_ACTIVITY_FOR_TYPE[pending.value] ?? activity ?? 'read')
    : undefined;
  const effect = pending && pendingActivity
    ? retypeEffect(block, activity, pendingActivity)
    : undefined;
  const Icon = getIconComponent(activityIcon);
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          title="Change block type"
          className="flex items-center gap-2 pl-1 pr-2 py-1 min-w-0"
          style={{
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-card)',
          }}
        >
          <span
            className="shrink-0 flex items-center justify-center"
            style={{ width: 26, height: 26, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-primary-default)' }}
          >
            {iconResolves(activityIcon) ? <Icon size={14} /> : <span style={{ fontSize: 12, opacity: 0.6 }}>—</span>}
          </span>
          <span className="truncate" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {label}
            {activityLabel && (
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}> — {activityLabel.toLowerCase()}</span>
            )}
          </span>
          <ChevronDown size={14} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px]" align="start">
        {pending && effect ? (
          /* THE STATEMENT. Nothing has been written yet. */
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2" style={{ fontSize: '13px', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>{type}</span>
              <ArrowRight size={13} style={{ color: 'var(--color-text-muted)' }} />
              <span>{pending.label}</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
              {retypeSentence(effect, pending.label)}
            </p>
            {effect.dropped.length > 0 && (
              <p style={{ fontSize: '11.5px', color: 'var(--color-status-warning-text)', margin: 0 }}>
                Dropped for good — the block keeps no copy.
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm" className="flex-1"
                onClick={() => { onPick(pending.value, pendingActivity!); setPending(null); setOpen(false); }}
                style={{ fontSize: '12.5px' }}
              >
                {effect.unchanged ? 'Close' : `Change to ${pending.label}`}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPending(null)} style={{ fontSize: '12.5px' }}>
                Back
              </Button>
            </div>
          </div>
        ) : vocabularyUnavailable ? (
          <div className="p-3" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            The block-type catalog could not be read, so there is nothing to choose
            from. This is not an empty vocabulary — it is a failed load.
          </div>
        ) : (
          <Command>
            <CommandInput placeholder={`Search ${options.length} block types`} />
            <CommandList>
              <CommandEmpty>No block type by that name.</CommandEmpty>
              <CommandGroup>
                {options.map((o) => {
                  const RowIcon = getIconComponent(o.icon);
                  return (
                    <CommandItem
                      key={o.value}
                      value={o.label}
                      onSelect={() => setPending(o)}
                    >
                      <span className="flex items-start gap-2 min-w-0">
                        <span className="shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {iconResolves(o.icon) ? <RowIcon size={14} /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate" style={{ fontWeight: o.value === type ? 600 : 400 }}>
                            {o.label}{o.value === type ? ' · current' : ''}
                          </span>
                          {o.activities && o.activities.length > 0 && (
                            <span className="block truncate" style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                              {o.activities.slice(0, 3).join(' · ')}
                              {o.activities.length > 3 ? ` +${o.activities.length - 3}` : ''}
                            </span>
                          )}
                        </span>
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
