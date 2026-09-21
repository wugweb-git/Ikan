/**
 * CHANGING WHAT A BLOCK IS — §21 item 4.
 *
 * Retyping was always possible: the editor's type dropdown wrote `block.type`
 * and said nothing. What was missing is the sentence the mockup asks for —
 * *"Switching to Lesson keeps title, subtitle and content. It drops the 3 table
 * columns, because a Lesson has nowhere to put them."* — said BEFORE it commits.
 *
 * The map is derived from what each activity actually uses, so it cannot drift
 * from the editor: a field is carried when the destination reads it, and dropped
 * when nothing there does. Nothing is deleted from the stored block either way —
 * `retype()` returns the new block with the dropped fields removed, so the caller
 * can show the loss and the author can decide.
 *
 * Under §26 the ACTIVITY decides what is drawn, so the activity decides what
 * survives. The block TYPE is a category and carries nothing of its own.
 */
import { ACTIVITY_SPECS, type ActivityName } from './vocabulary.ts';
import type { Activity } from './block-model.ts';

/**
 * The config fields each activity reads — its `requires`, plus what the editor
 * offers and the renderer honours beyond them.
 *
 * Stored spellings are listed alongside the §26 names (`acceptedFileTypes` and
 * `accepted_types`, `columns` and `tableColumns`) because a block carries
 * whichever one it was authored under, and a retype must not lose a field for
 * being spelled the older way.
 */
export const ACTIVITY_FIELDS: Record<ActivityName, readonly string[]> = {
  read:                 [],
  listen:               ['transcript'],
  view:                 [],
  'table-review':       ['source_key'],
  complete:             [],
  'paced-breathing':    ['pattern', 'cycles'],

  mcq:                  ['prompt', 'options', 'scale_ref', 'correctAnswer', 'allCorrect', 'scoring', 'cardinality', 'display'],
  'single-select':      ['prompt', 'options', 'scale_ref', 'scoring', 'display'],
  'multi-select':       ['prompt', 'options', 'scale_ref', 'scoring', 'display'],
  boolean:              ['prompt', 'display'],
  'clinical-instrument':['prompt', 'questions', 'scale', 'scale_ref', 'instrument_ref'],

  'rating-scale':       ['prompt', 'scale', 'scale_ref', 'slider_min', 'slider_max', 'slider_labels', 'display'],
  slider:               ['prompt', 'min', 'max', 'step', 'constraints'],
  ranking:              ['prompt', 'items', 'listItems', 'options'],

  'structured-list':    ['prompt', 'listItems', 'options', 'items'],
  'check-grid':         ['columns', 'rows', 'tableColumns', 'tableRows', 'allow_add_rows'],
  consent:              ['statement'],

  text:                 ['prompt', 'persist', 'length', 'format'],
  'short-text':         ['prompt'],
  'ephemeral-journal':  ['prompt'],
  number:               ['prompt', 'min', 'max'],
  'input-table':        ['columns', 'rows', 'tableColumns', 'tableRows', 'allow_add_rows', 'column_types'],

  date:                 ['prompt', 'min', 'max'],
  time:                 ['prompt', 'min', 'max'],
  'date-time':          ['prompt', 'min', 'max', 'time'],
  location:             ['prompt', 'precision'],

  timer:                ['mode', 'target'],

  upload:               ['acceptedFileTypes', 'accepted_types', 'maxFileSize', 'max_size'],
  record:               ['prompt', 'max_duration'],
};

/**
 * Fields no retype touches, whatever it is.
 *
 * `key` is here deliberately: it is the block's response identity, and losing it
 * on a retype would silently break a series the author declared across days —
 * the thing `responseKeyOf` exists to hold together. `repeat` likewise: where a
 * block appears is not a property of what it draws.
 */
export const ALWAYS_CARRIED = ['key', 'repeat', 'stepGroup', 'autoAdvance', 'duration', 'required'] as const;

export interface RetypeEffect {
  /** Config fields the destination reads and this block has a value for. */
  carried: string[];
  /** Config fields with a value that nothing at the destination reads. */
  dropped: { field: string; detail: string }[];
  /** Block-level prose — carried unless the destination draws no content. */
  contentCarried: boolean;
  /** True when the change is a no-op. */
  unchanged: boolean;
}

const has = (v: unknown): boolean =>
  Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== '';

const describe = (field: string, value: unknown): string => {
  if (Array.isArray(value)) return `${value.length} ${field === 'columns' || field === 'tableColumns' ? 'column' : 'entr'}${value.length === 1 ? (field.includes('column') ? '' : 'y') : (field.includes('column') ? 's' : 'ies')}`;
  if (typeof value === 'object' && value !== null) return field;
  return String(value).slice(0, 40);
};

/**
 * What changing this block's activity would keep and what it would lose.
 *
 * Only fields with a VALUE are reported: an empty `options` array is not a loss,
 * and telling an author they are about to lose nothing is how a warning stops
 * being read.
 */
export function retypeEffect(
  block: Pick<Activity, 'activityConfig' | 'exerciseConfig' | 'content'>,
  from: ActivityName | undefined,
  to: ActivityName,
): RetypeEffect {
  const cfg = (block.activityConfig ?? block.exerciseConfig ?? {}) as Record<string, unknown>;
  const destination = new Set<string>([...ACTIVITY_FIELDS[to], ...ALWAYS_CARRIED]);

  const carried: string[] = [];
  const dropped: { field: string; detail: string }[] = [];
  for (const [field, value] of Object.entries(cfg)) {
    if (field === 'subtype') continue;           // the activity itself, not a field
    if (!has(value)) continue;
    if (destination.has(field)) carried.push(field);
    else dropped.push({ field, detail: describe(field, value) });
  }

  /* Prose survives unless the destination has nowhere to put it. Only the six
     `observe` activities draw content, and `complete` and `read` require it. */
  const drawsContent = (ACTIVITY_SPECS[to].requires as readonly string[]).includes('content')
    || to === 'listen' || to === 'view' || to === 'table-review';

  return {
    carried: carried.sort(),
    dropped: dropped.sort((a, b) => a.field.localeCompare(b.field)),
    contentCarried: drawsContent || !has(block.content),
    unchanged: from === to,
  };
}

/** One sentence, for the picker. Says what carries first, then what does not. */
export function retypeSentence(effect: RetypeEffect, toLabel: string): string {
  if (effect.unchanged) return 'This is what it already is.';
  const keeps = ['title', 'subtitle', ...(effect.contentCarried ? ['content'] : []), ...effect.carried];
  const keepList = keeps.length > 3 ? `${keeps.slice(0, 3).join(', ')} and ${keeps.length - 3} more` : keeps.join(', ');
  const head = `Switching to ${toLabel} keeps ${keepList}.`;
  const losses = [
    ...(effect.contentCarried ? [] : ['its content']),
    ...effect.dropped.map(d => `${d.detail}${d.detail === d.field ? '' : ` (${d.field})`}`),
  ];
  if (!losses.length) return `${head} Nothing is dropped.`;
  const lossList = losses.length > 1
    ? `${losses.slice(0, -1).join(', ')} and ${losses[losses.length - 1]}`
    : losses[0];
  return `${head} It drops ${lossList}, because ${toLabel} has nowhere to put ${losses.length > 1 ? 'them' : 'it'}.`;
}

/** The retyped block. Dropped fields are removed; everything else is untouched. */
export function retype(block: Activity, to: ActivityName, toType?: string): Activity {
  const effect = retypeEffect(block, undefined, to);
  const cfg = { ...((block.activityConfig ?? block.exerciseConfig ?? {}) as Record<string, unknown>) };
  for (const { field } of effect.dropped) delete cfg[field];
  if (cfg.subtype) cfg.subtype = to;

  return {
    ...block,
    ...(toType ? { type: toType as Activity['type'] } : {}),
    activity: to,
    activityConfig: cfg,
    ...(effect.contentCarried ? {} : { content: '' }),
    retyped_from: {
      activity: block.activity ?? (block.activityConfig ?? block.exerciseConfig)?.subtype,
      type: block.type,
      at: new Date().toISOString(),
    },
  } as Activity;
}
