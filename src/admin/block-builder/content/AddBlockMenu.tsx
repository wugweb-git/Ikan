/**
 * The "add a block" palette. Moved verbatim from `DayComposer.tsx` 2026-09-09
 * (§21 layout port, phase 1) — body unchanged, only the imports are new.
 */
import type { JSX } from 'react';
import { Plus, BookOpen, PenTool, MessageCircle, Target } from 'lucide-react';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { PALETTE_BLOCK_TYPES } from '../model/block-type-rules';

// --- HELPER COMPONENTS ---
export function BlockPaletteMenu({ onSelect, trigger = 'compact' }: {
  onSelect: (type: string, subtype?: string) => void;
  /** `dashed` is the mockup's full-width "Add block" button under the list. */
  trigger?: 'compact' | 'dashed';
}) {
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
            {trigger === 'dashed' ? (
              <Button
                variant="outline"
                className="w-full gap-1.5 h-9"
                style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', borderColor: 'var(--color-border-default)', borderStyle: 'dashed', borderRadius: 'var(--radius-md)', backgroundColor: 'transparent' }}
              >
                 <Plus size={13} /> Add block
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="gap-1 px-2.5 h-7" style={{ fontSize: '11px', color: 'var(--color-text-muted)', borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
                 <Plus size={12} /> Add
              </Button>
            )}
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

export { BlockPaletteMenu as AddBlockMenu };
