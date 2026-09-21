/**
 * The drag-and-drop item types, shared by the day chips and the block rows.
 *
 * Moved out of `DayComposer.tsx` 2026-09-09 so the chip and the row can live in
 * their own files without two copies of the strings drifting apart — a drop
 * target that disagrees with its source by one letter simply never fires, and
 * says nothing about why.
 */
export const ItemTypes = {
  DAY: 'day',
  BLOCK: 'block',
} as const;
