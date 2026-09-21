/**
 * Collision-resistant block ids.
 *
 * Moved out of `DayComposer.tsx` 2026-09-09 so the content screen and the
 * adapter cannot end up with two counters. The counter is the reason it is a
 * module and not an inline `Date.now()`: two blocks added inside the same
 * millisecond would otherwise share an id, and `validateDay` reports that as
 * "they would write to the same answer".
 */
let _blockIdCounter = 0;

export function generateBlockId(): string {
  return `block-${Date.now()}-${++_blockIdCounter}-${Math.random().toString(36).substr(2, 6)}`;
}
