/**
 * Which fields a block type shows, and what they are called.
 *
 * This lived twice: once in `BlockEditor` (the real form) and once in
 * `BlockTypeViewer` (the mock preview that documents the form). The two were
 * near-verbatim copies including the label ternaries and the placeholder
 * strings, so every field change needed editing in two files — and the viewer,
 * whose whole job is to describe the editor accurately, was the copy that
 * silently fell behind.
 *
 * It is pure and dependency-free so both can use it and it can be tested.
 */

/** Block types that author prose rather than configure an interaction. */
export const CONTENT_BLOCK_TYPES = ['lesson', 'journal', 'conclude', 'sleep-diary'] as const;

/**
 * Note `reflection` is NOT here. It used to be, in both copies — but the
 * quiz/reflection flip made it a CONTAINER, so it can no longer be a block type
 * at all. Both lists kept it until this was extracted.
 */
export function hasContentField(blockType: string): boolean {
  return (CONTENT_BLOCK_TYPES as readonly string[]).includes(blockType);
}

/** What the prose field is called for this block type. */
export function contentLabelFor(blockType: string): string {
  if (blockType === 'lesson' || blockType === 'conclude') return 'Content';
  if (blockType === 'sleep-diary') return 'Sleep Diary Instructions';
  return 'Prompt / Instructions';
}

/** The placeholder shown in that field. */
export function contentPlaceholderFor(blockType: string): string {
  if (blockType === 'lesson') return 'Write educational content...';
  if (blockType === 'sleep-diary') return 'Instructions for the sleep diary entry...';
  return 'Write the prompt for the user...';
}

/**
 * Day-type accent colours.
 *
 * These were a ten-branch ternary of RAW HEX inside `DayComposer`, the only
 * hardcoded colours in a file where every other style uses a `var(--color-*)`
 * token. Two further problems: it covered 9 of the 11 stage types, so
 * `learning` — the type 93 of 98 days actually use — fell through to the
 * default; and the catalog row for each stage already has a `color` field,
 * which is where this belongs.
 *
 * So: the catalog wins when it carries a colour that is not the seeded default,
 * and this map is the fallback. Moving these into the catalog later is then a
 * data change with no code change.
 */
const STAGE_COLOURS: Record<string, string> = {
  onboarding:        '#E5A100',
  assessment:        '#7C3AED',
  'assessment-lite': '#8B5CF6',
  practice:          '#059669',
  reflection:        '#0284C7',
  rest:              '#64748B',
  quiz:              '#D97706',
  'check-in':        '#EC4899',
  tracker:           '#10B981',
  workshop:          '#6366F1',
  learning:          'var(--color-primary-default)',
};

/** The seeded placeholder every catalog row carries; not a real choice. */
const SEEDED_DEFAULT = '#2A2A2A';

export function stageColour(dayType: string | undefined, catalogColour?: string): string {
  if (catalogColour && catalogColour !== SEEDED_DEFAULT) return catalogColour;
  return STAGE_COLOURS[dayType ?? ''] ?? 'var(--color-primary-default)';
}
