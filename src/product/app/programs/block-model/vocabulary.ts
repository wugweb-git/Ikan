/**
 * THE VOCABULARY — §26, settled 2026-09-09.
 *
 * Nine interactions, twenty-nine activities, seven labels. This file is the only
 * place any of them is written down; the catalog seed, the viewer, the editor and
 * the renderer all read it, so the panel and the store cannot disagree.
 *
 * **It replaces the previous vocabulary rather than extending it.** The 17
 * interaction names (`read`, `select-one`, `input-table`…) and the 20-activity
 * list are gone, not deprecated — two vocabularies side by side is the failure
 * this module has paid for six times.
 *
 * The three definitions, in the owner's words:
 *
 *   An ACTIVITY is the set of events a user performs in order to communicate.
 *   An INTERACTION is how they respond — cognitive, not device-bound.
 *   An activity carries ONE OR MORE interactions. It is a set of events, so it
 *   holds a set of responses.
 *
 * Everything device-bound is a LABEL: layout, display, format. A label never
 * creates a new activity — `grid` degrading to `list` on a narrow screen is the
 * same activity, the same interaction and the same stored answer.
 */

// ── Interactions — 9 ────────────────────────────────────────────────
export const INTERACTIONS = [
  'observe',
  'choose',
  'share',
  'locate',
  'confirm',
  'rate',
  'order',
  'measure',
  'submit',
] as const;

export type Interaction = typeof INTERACTIONS[number];

export const INTERACTION_META: Record<Interaction, { label: string; doing: string; icon: string }> = {
  observe: { label: 'Observe', doing: 'taking content in — reading, listening, watching', icon: 'eye' },
  choose:  { label: 'Choose',  doing: 'picking from what the app offers',                  icon: 'list-checks' },
  share:   { label: 'Share',   doing: 'giving their own words or figures',                 icon: 'pen-tool' },
  locate:  { label: 'Locate',  doing: 'naming a real-world point — when, where',           icon: 'map-pin' },
  confirm: { label: 'Confirm', doing: 'affirming — that something happened, or that they agree', icon: 'circle-check' },
  rate:    { label: 'Rate',    doing: 'placing a value on a range',                        icon: 'sliders-horizontal' },
  order:   { label: 'Order',   doing: 'putting things in sequence',                        icon: 'list' },
  measure: { label: 'Measure', doing: 'bracketing a span the app times',                   icon: 'timer' },
  submit:  { label: 'Submit',  doing: 'handing over an artefact — ownership changes',      icon: 'upload' },
};

// ── Labels — 7 ──────────────────────────────────────────────────────
/**
 * Device-bound. They change how something is drawn, never what it is.
 *
 * Seven rows, and the sixth carries two fields: `persist` and `length` travel
 * together on every `share` activity. §26 counts the rows, so the panel says 7.
 */
export const LABELS = [
  { key: 'layout',      values: ['single', 'list', 'grid'],                     appliesTo: 'any activity' },
  { key: 'display',     values: ['emoji', 'nps', 'dropdown', 'image'],          appliesTo: 'every choose activity and rating-scale' },
  { key: 'format',      values: ['email', 'phone', 'url'],                      appliesTo: 'text' },
  { key: 'cardinality', values: ['one', 'many'],                                appliesTo: 'choose activities' },
  { key: 'source',      values: ['pick', 'capture'],                            appliesTo: 'submit activities' },
  { key: 'persist',     values: [], fields: ['persist', 'length'],              appliesTo: 'share activities' },
  { key: 'mode',        values: ['up', 'down'],                                 appliesTo: 'timer' },
] as const;

export type LabelKey = typeof LABELS[number]['key'];

// ── Activities — 29 ─────────────────────────────────────────────────
export interface ActivitySpec {
  /** One or more. Six activities carry two — see `TWO_INTERACTIONS`. */
  interactions: readonly Interaction[];
  /** Config fields without which the activity cannot be drawn. */
  requires: readonly string[];
  /** What it stores. Empty means nothing is stored — the user still does something. */
  produces: string;
  /** Which labels apply. */
  labels: readonly string[];
}

export const ACTIVITY_SPECS = {
  read:                 { interactions: ['observe'],            requires: ['content'],                     produces: '',                 labels: ['layout'] },
  listen:               { interactions: ['observe'],            requires: ['media_ref'],                   produces: '',                 labels: [] },
  view:                 { interactions: ['observe'],            requires: ['media_ref'],                   produces: '',                 labels: [] },
  'table-review':       { interactions: ['observe', 'confirm'], requires: ['source_key'],                  produces: '',                 labels: ['layout:grid'] },
  complete:             { interactions: ['observe', 'confirm'], requires: ['content'],                     produces: '',                 labels: [] },
  'paced-breathing':    { interactions: ['observe', 'measure'], requires: ['pattern', 'cycles'],           produces: '',                 labels: [] },

  mcq:                  { interactions: ['choose'],             requires: ['scale_ref'],                   produces: 'option_id',        labels: ['cardinality', 'display'] },
  'single-select':      { interactions: ['choose'],             requires: ['scale_ref'],                   produces: 'option_id',        labels: ['display'] },
  'multi-select':       { interactions: ['choose'],             requires: ['scale_ref'],                   produces: 'option_id[]',      labels: ['display'] },
  boolean:              { interactions: ['choose', 'confirm'],  requires: ['prompt', 'labels'],            produces: 'bool',             labels: ['display'] },
  'clinical-instrument':{ interactions: ['choose', 'rate'],     requires: ['scale_ref', 'instrument_ref'], produces: 'option_id',        labels: ['layout:list'] },

  'rating-scale':       { interactions: ['rate'],               requires: ['scale_ref'],                   produces: 'option_id',        labels: ['display'] },
  slider:               { interactions: ['rate'],               requires: ['min', 'max', 'step'],          produces: 'number',           labels: [] },
  ranking:              { interactions: ['rate', 'order'],      requires: ['items'],                       produces: 'item_id[] ordered', labels: ['layout:list'] },

  'structured-list':    { interactions: ['confirm'],            requires: ['items'],                       produces: 'item_id[]',        labels: ['layout:list'] },
  'check-grid':         { interactions: ['confirm'],            requires: ['columns', 'rows'],             produces: 'boolean map',      labels: ['layout:grid'] },
  consent:              { interactions: ['confirm'],            requires: ['statement', 'required'],       produces: 'bool + timestamp + statement as shown', labels: [] },

  text:                 { interactions: ['share'],              requires: ['prompt'],                      produces: 'text',             labels: ['persist', 'length', 'format'] },
  'short-text':         { interactions: ['share'],              requires: ['prompt'],                      produces: 'text',             labels: [] },
  'ephemeral-journal':  { interactions: ['share'],              requires: ['prompt'],                      produces: 'text',             labels: ['persist: false'] },
  number:               { interactions: ['share'],              requires: ['prompt'],                      produces: 'number',           labels: [] },
  'input-table':        { interactions: ['share'],              requires: ['columns'],                     produces: 'cell map',         labels: ['layout:grid'] },

  date:                 { interactions: ['locate'],             requires: ['prompt'],                      produces: 'date',             labels: [] },
  time:                 { interactions: ['locate'],             requires: ['prompt'],                      produces: 'time',             labels: [] },
  'date-time':          { interactions: ['locate'],             requires: ['prompt'],                      produces: 'datetime',         labels: [] },
  location:             { interactions: ['locate'],             requires: ['prompt', 'precision'],         produces: 'place',            labels: [] },

  timer:                { interactions: ['measure'],            requires: ['mode', 'target'],              produces: 'duration',         labels: ['mode'] },

  upload:               { interactions: ['submit'],             requires: ['accepted_types'],              produces: 'file_ref',         labels: ['source: pick'] },
  record:               { interactions: ['submit'],             requires: ['prompt', 'max_duration'],      produces: 'audio_ref',        labels: ['source: capture'] },
} as const satisfies Record<string, ActivitySpec>;

export const ACTIVITIES = Object.keys(ACTIVITY_SPECS) as (keyof typeof ACTIVITY_SPECS)[];
export type ActivityName = keyof typeof ACTIVITY_SPECS;

/** The six that carry two interactions, and why. §26 names them explicitly. */
export const TWO_INTERACTIONS: Record<string, string> = {
  'paced-breathing': 'You follow the pacer (observe) for a bracketed span (measure). It is a stopwatch with something to watch',
  complete: 'You read the closing card (observe) and acknowledge the day is done (confirm)',
  'table-review': 'You read your own series back (observe) and affirm it is right (confirm)',
  boolean: 'choose when it answers a question, confirm when it reports something you did',
  'clinical-instrument': 'choose an option that carries a score — the choosing is also a rate',
  ranking: "You judge each item's value (rate) in order to sequence them (order)",
};

/** Every interaction an activity carries. The set, not a single value. */
export function interactionsOf(activity: string | undefined | null): readonly Interaction[] {
  const spec = activity ? ACTIVITY_SPECS[activity as ActivityName] : undefined;
  return spec ? spec.interactions : [];
}

export function requiresOf(activity: string | undefined | null): readonly string[] {
  const spec = activity ? ACTIVITY_SPECS[activity as ActivityName] : undefined;
  return spec ? spec.requires : [];
}

/** Activities carrying a given interaction, in declaration order. */
export function activitiesFor(interaction: Interaction): ActivityName[] {
  return ACTIVITIES.filter((a) => (ACTIVITY_SPECS[a].interactions as readonly string[]).includes(interaction));
}

/**
 * WHAT THE USER SEES — one line per activity, for the reference page's preview.
 *
 * These lived on the seventeen interactions as `previewHint`. They describe a
 * DRAWING, and the activity is what draws, so they belong here. Eleven have no
 * renderer yet and say so rather than describing something that does not exist.
 */
export const ACTIVITY_HINTS: Record<string, string> = {
  read:                  'Formatted prose, optionally above an image or video.',
  listen:                'An audio track with a play control. No renderer yet.',
  view:                  'An embedded video or image, above optional prose.',
  'table-review':        "An earlier day's table, read-only, with a confirm. No renderer yet.",
  complete:              'A closing card that ends the day.',
  'paced-breathing':     'A pacer to breathe along with, for a set number of cycles. No renderer yet.',

  mcq:                   'A list of options with a correct answer behind it; the user picks one.',
  'single-select':       'A vertical list of options; the user picks one.',
  'multi-select':        'A set of options; the user picks any number.',
  boolean:               'Two labelled sides of one question — yes or no. No renderer yet.',
  'clinical-instrument': 'A validated instrument: several items sharing one scored scale.',

  'rating-scale':        'A row of points between two labels; the user picks one.',
  slider:                'A continuous track between a minimum and a maximum. No renderer yet.',
  ranking:               'A list the user drags into order. No renderer yet.',

  'structured-list':     'A checklist of fixed items, each ticked or not.',
  'check-grid':          'A grid of items against columns, each cell ticked or not.',
  consent:               'A statement to agree to, stored with its wording as shown. No renderer yet.',

  text:                  'A prompt above a text box, saved with the response. No renderer yet.',
  'short-text':          'A prompt above a single-line box.',
  'ephemeral-journal':   'A prompt above a text box whose contents are not kept.',
  number:                'A prompt above a numeric field.',
  'input-table':         'A grid the user types into, one row per entry.',

  date:                  'A date picker. No renderer yet.',
  time:                  'A time picker. No renderer yet.',
  'date-time':           'A date and time picker.',
  location:              'A place picker at the precision the block asks for. No renderer yet.',

  timer:                 'A stopwatch counting up, or down to a target. No renderer yet.',

  upload:                'A file picker with the accepted types stated.',
  record:                'A record button with a maximum duration. No renderer yet.',
};

/*
  `RETIRED_TERMS` was here — thirty-nine old spellings and what each became.

  Deleted 2026-09-09. It was already inert (nothing resolved through it), but a
  list of dead terms on the reference page is still a list of dead terms: the
  Activities tab showed 29 live rows and 39 retired ones, and the tile beside it
  read "29 · 39 retired". Keeping a record inside the product made the product
  about its own history.

  The mapping is not lost — it is in the commit that removed it, and in this
  module's git history. Nothing in the store carries one of these terms: 840 of
  840 blocks resolve to one of the twenty-nine, verified before the deletion.
*/

/** Is this one of the twenty-nine? Nothing is rewritten — it either is or it is not. */
export function isActivity(raw: string | undefined | null): raw is ActivityName {
  return !!raw && raw in ACTIVITY_SPECS;
}

/**
 * What a newly added block of each TYPE starts as.
 *
 * A type does not draw — the activity does — so a block created with only a type
 * carries nothing that can be rendered, and `validateBlock` correctly calls that
 * an error. Three such blocks are live today, created through the palette on
 * 2026-09-09. The palette seeds an activity instead of leaving the author to
 * discover the gap.
 *
 * These are STARTING POINTS, not constraints: every activity remains available
 * on every type, which is what §19 step 3 settled.
 */
export const DEFAULT_ACTIVITY_FOR_TYPE: Record<string, ActivityName> = {
  lesson: 'read',
  exercise: 'mcq',
  journal: 'ephemeral-journal',
  conclude: 'complete',
  checklist: 'structured-list',
  'sleep-diary': 'input-table',
  reflection: 'text',
  quiz: 'mcq',
  'check-in': 'rating-scale',
  tracker: 'input-table',
  workshop: 'input-table',
  practice: 'input-table',
  learning: 'read',
  onboarding: 'single-select',
  assessment: 'mcq',
};
