/**
 * The block-type picker in the editor header — `[icon] Exercise — input table ▾`.
 *
 * A searchable list rather than a `Select`, because the vocabulary is 17 types
 * and the mockup asks for "Search 17 block types". It is built on
 * `components/ui/command.tsx` (cmdk), which has been in the repo unused since it
 * was added.
 *
 * It changes `block.type` and nothing else — the same write the old header's
 * `Select` made. What a retype *drops* is §21 item 4 and lands in phase 6; until
 * that exists the picker must not pretend to know, so it says nothing about
 * consequences rather than saying something reassuring.
 */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '../../ui/command';
import { getIconComponent, iconResolves } from '../../../lib/catalog-icons';

export interface BlockTypeOption {
  value: string;
  label: string;
  icon?: string;
  /** The activities this type's catalog row permits, for the sub-line. */
  activities?: string[];
}

export interface BlockTypePickerProps {
  type: string;
  /** The activity's catalog label, shown after the type name. */
  activityLabel?: string;
  /** The activity's catalog icon name — the tile is the ACTIVITY's, not the type's. */
  activityIcon?: string;
  options: BlockTypeOption[];
  onPick: (type: string) => void;
  /** True when the catalog could not be read. The picker says so rather than offering a short list. */
  vocabularyUnavailable?: boolean;
  disabled?: boolean;
}

export function BlockTypePicker({
  type, activityLabel, activityIcon, options, onPick, vocabularyUnavailable, disabled,
}: BlockTypePickerProps) {
  const [open, setOpen] = useState(false);
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
      <PopoverContent className="p-0 w-[280px]" align="start">
        {vocabularyUnavailable ? (
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
                      onSelect={() => { onPick(o.value); setOpen(false); }}
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
