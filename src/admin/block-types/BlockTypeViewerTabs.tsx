/**
 * The Block Type Viewer's three lists: interactions, block types, activities.
 * Pure rendering — every figure comes from `useBlockTypeViewerData`.
 */
import { normalizeSubtype } from '../block-builder/model/block-model';
import {
  INTERACTION_META, ACTIVITIES as CANONICAL_SUBTYPES, ACTIVITY_HINTS,
  TWO_INTERACTIONS, interactionsOf, activitiesFor, type Interaction,
} from '../block-builder/model/vocabulary';
import { DAY_TYPE_PRESETS } from '../block-builder/model/block-type-rules';
import { Card, CardContent } from '../ui/card';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { cn } from '../ui/utils';
import { RowIcon, RowMeta, RequirementLine, statusOf } from './BlockTypeRowParts';
import { CompositePreview, PreviewPanel } from './PreviewPanels';
import {
  BLOCK_TYPE_VOCABULARY, INTERACTION_TYPES, LEAF_HINTS, byLiveCount,
  type useBlockTypeViewerData,
} from './useBlockTypeViewerData';

type ViewerData = ReturnType<typeof useBlockTypeViewerData>;

export interface PreviewState {
  openPreview: string | null;
  togglePreview: (id: string) => void;
}

const ROW = 'p-3 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-default)]';
const NOTE = 'text-xs text-[var(--color-text-muted)]';
const MUTED = 'text-[var(--color-text-muted)]';
const INLINE_CODE = 'text-xs';

function PreviewToggle({ id, openPreview, togglePreview, label = 'Preview' }: PreviewState & { id: string; label?: string }) {
  return (
    <button
      onClick={() => togglePreview(id)}
      className="text-xs text-[var(--color-primary-default)] bg-transparent border-none cursor-pointer p-0"
    >
      {openPreview === id ? `Hide ${label.toLowerCase()}` : label}
    </button>
  );
}

// ── INTERACTIONS — what a block DOES, and what it draws ───────────
export function InteractionsTab({ data }: { data: ViewerData }) {
  const { countOf, usageState, kvInteractionTypes } = data;
  return (
    <div className="space-y-3">
      <p className={cn('text-sm', MUTED)}>
        <strong>Nine.</strong> An interaction is how a user responds — cognitive, not
        device-bound. It replaced seventeen names that were widgets in disguise
        (<code className={INLINE_CODE}>select-one</code>,{' '}
        <code className={INLINE_CODE}>input-table</code>,{' '}
        <code className={INLINE_CODE}>track-table</code>), which is why that
        list kept growing: every new way of drawing something became a new interaction.
      </p>
      <p className={cn('text-sm', MUTED)}>
        <strong>An activity carries one or more.</strong> Six carry two — a{' '}
        <code className={INLINE_CODE}>ranking</code> is a{' '}
        <code className={INLINE_CODE}>rate</code> in order to{' '}
        <code className={INLINE_CODE}>order</code> — so this is no longer a
        one-to-one map, and nothing here draws anything. What an interaction has is the set of
        activities that carry it, listed on each row.
      </p>

      {usageState === 'failed' && (
        <div className="p-3 rounded-lg bg-[var(--color-bg-muted)] border-l-2 border-[var(--color-status-warning)] text-xs">
          Usage feed unavailable — live counts show as “—”. They are not zero; this page just
          cannot tell you. A confident zero here would be indistinguishable from genuinely
          unused, which is the mistake this feed exists to prevent.
        </div>
      )}

      {byLiveCount(INTERACTION_TYPES, (k) => countOf('interactions', k)).map((key) => {
        const meta = INTERACTION_META[key];
        const count = countOf('interactions', key);
        // The catalog row behind this interaction, for its icon. `key` is
        // the slug; the row is what declares how it is drawn.
        const catalogRow = kvInteractionTypes.find((r) => r.value === key);
        /* Every one of the nine is carried by at least one activity and is
           therefore read by code — `vocabulary.test.ts` asserts it. None is
           "declared, unread". */
        const status = statusOf({ readByCode: true, declared: true, count });
        const carriedBy = activitiesFor(key);
        return (
          <div key={key} className={ROW}>
            <div className="flex items-center gap-2 flex-wrap">
              <RowIcon icon={catalogRow?.icon} />
              <span className="font-medium">{meta.label}</span>
              <code className={NOTE}>{key}</code>
            </div>
            <p className={cn(NOTE, 'mt-1')}>
              The user is {meta.doing}.
            </p>
            <RowMeta
              count={count}
              rendersAs={`carried by ${carriedBy.length} activit${carriedBy.length === 1 ? 'y' : 'ies'}`}
              status={status}
            />
            {/*
              An interaction draws nothing, so there is no preview and no
              `requires` line — both belong to the activity. What an
              interaction HAS is the set of activities that carry it, which is
              the useful thing to show and was impossible to show before,
              when the mapping was one-to-one.
            */}
            <div className="mt-2 flex flex-wrap gap-1">
              {carriedBy.map((a) => (
                <code key={a} className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] px-[5px] py-px rounded-[4px]">
                  {a}
                </code>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── BLOCK TYPES — one list, containers and leaves together ──────
export function BlockTypesTab({ data, preview }: { data: ViewerData; preview: PreviewState }) {
  const { countOf, kvBlockTypes } = data;
  /*
    ONE FLAT LIST (2026-09-08). This was split into "Stages — hold blocks (11)"
    and "Blocks — held by stages (6)" under a paragraph explaining `can_hold`.
    The split made the page argue for a distinction instead of showing a
    vocabulary. Rows declare a `sort_order` and `useMetadata` sorts every bucket
    once, so ordering is a data decision editable in Meta Manager; within that,
    rows are ranked by live count.
  */
  const rows = byLiveCount(kvBlockTypes, (r) => countOf('blockTypes', r.value));
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {rows.map((row) => {
          const preset = DAY_TYPE_PRESETS[row.value as keyof typeof DAY_TYPE_PRESETS];
          // Counted by the blocks that ARE it. The stage branch is gone: a day
          // has no type, so `dayTypes` counts nothing.
          const known = BLOCK_TYPE_VOCABULARY.includes(row.value);
          const count = countOf('blockTypes', row.value);
          const activities = row.activities ?? [];
          return (
            <div key={row.value} className={ROW}>
              <div className="flex items-center gap-2 flex-wrap">
                <RowIcon icon={row.icon} />
                <span className="font-medium">{row.label}</span>
                <code className={NOTE}>{row.value}</code>
                {/* The stage/block badge was here. No block holds
                    another, so there is no distinction left to badge. */}
              </div>
              {row.description && (
                <p className={cn(NOTE, 'mt-1')}>{row.description}</p>
              )}
              <RowMeta
                count={count}
                rendersAs={LEAF_HINTS[row.value] ?? 'No preview description recorded'}
                status={statusOf({ readByCode: known, declared: true, count })}
              />
              {/* `holds:` was the first line here. No block holds another,
                  so what a type permits — `activities` — is the whole story. */}
              <div className="mt-2 space-y-1 text-xs">
                <div><span className={MUTED}>activities ({activities.length}): </span>{activities.join(' · ') || '—'}</div>
                {preset && (
                  <>
                    <div><span className={MUTED}>template permits: </span>{preset.allowedActivities.join(' · ')}</div>
                    <div><span className={MUTED}>steps: </span>
                      {preset.stepGroupRules.allowed ? 'allowed' : 'not allowed'}
                      {preset.stepGroupRules.required ? ', required' : ''}
                      {preset.stepGroupRules.oneBlockPerStep ? ', one block per step' : ''}
                    </div>
                    <div><span className={MUTED}>policy: </span>
                      {Object.entries(preset.autoConfig).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'none declared'}
                    </div>
                    {preset.warnings.map((w, n) => (
                      <div key={n} className="text-[var(--color-status-warning)]">⚠ {w}</div>
                    ))}
                    {preset.errors.map((e, n) => (
                      <div key={n} className="text-[var(--color-status-danger)]">✕ {e}</div>
                    ))}
                  </>
                )}
              </div>
              {/*
                EVERY block type has a preview: a block type constrains what a
                block may DO, so its preview is what its permitted activities
                draw — resolved through the real resolver, one existing preview
                per distinct drawing. Nothing is invented.
              */}
              <div className="mt-2"><PreviewToggle id={`b:${row.value}`} {...preview} /></div>
              {preview.openPreview === `b:${row.value}` && (
                <CompositePreview
                  activities={activities}
                  note={`What this type permits, drawn — its ${activities.length} activities, from its own catalog row.`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** What an activity carries — one or more of the nine. */
const interactionsForActivity = (activity: string): readonly Interaction[] =>
  interactionsOf(normalizeSubtype(activity));

// ── ACTIVITIES ──────────────────────────────────────────────────
export function ActivitiesTab({ data, preview }: { data: ViewerData; preview: PreviewState }) {
  const { countOf, exerciseSubtypes, requirementGaps, usageState } = data;
  const codeChip = 'text-xs bg-[var(--color-bg-muted)] px-1 py-px rounded-[4px]';
  return (
    <div className="space-y-3">
      <p className={cn('text-sm', MUTED)}>
        Exercise subtypes define the interaction style inside an Exercise block. This list is derived, not declared here: canonical terms from <code className={codeChip}>EXERCISE_SUBTYPES</code>, aliases from <code className={codeChip}>SUBTYPE_ALIASES</code> (both in block-model.ts), labels and descriptions from the live catalog.
      </p>
      {byLiveCount(exerciseSubtypes, (st) => countOf('activities', st.value)).map((st) => {
        const count = countOf('activities', st.value);
        /*
          Three reasons a term is not offered, and they are not the same thing:
            · canonical, but no renderer yet   -> awaiting a renderer
            · an alias live content carries    -> in use
            · an alias nothing is known to use -> preset-only
          Collapsing them into "Alias / Preset-only" is what made `matrix`
          (8 blocks) read as unused.
        */
        const n = count ?? 0;
        const isCanonical = (CANONICAL_SUBTYPES as readonly string[]).includes(st.value);
        const badge = st.selectable ? <AdminStatusBadge status="published" label="In Editor" />
          : isCanonical ? <AdminStatusBadge status="draft" label="Declared — awaiting a renderer" />
          : n > 0 ? <AdminStatusBadge status="published" label={`Alias — in use (${n})`} />
          : <AdminStatusBadge status="draft" label="Alias / Preset-only" />;
        const canonical = normalizeSubtype(st.value);
        const rendersAs = canonical
          ? (ACTIVITY_HINTS[canonical] ?? 'No preview recorded')
          : 'Not one of the twenty-nine — nothing draws it';
        const carries = interactionsForActivity(st.value);
        return (
          <Card
            key={st.value}
            className={cn('border border-[var(--color-border-default)] rounded-lg', st.selectable ? 'opacity-100' : 'opacity-75')}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-bg-muted)]">
                  <RowIcon icon={st.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-medium text-base text-[var(--color-text-primary)]">
                      {st.label}
                    </h4>
                    <AdminStatusBadge status="neutral" label={st.value} />
                    {badge}
                  </div>
                  <p className={cn('text-sm leading-[1.5]', MUTED)}>
                    {st.description}
                  </p>
                  <RowMeta
                    count={count}
                    rendersAs={rendersAs}
                    status={statusOf({ readByCode: st.selectable, declared: true, count })}
                  />
                  {/*
                    The activity is where `requires`, `produces` and the
                    interactions all live under §26 — an interaction row can
                    show none of them, because an interaction is cognitive and
                    has no fields and no answer.
                  */}
                  {canonical && (
                    <>
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                        <span className={MUTED}>carries:</span>
                        {carries.map((i) => (
                          <code key={i} className="text-[var(--color-primary-default)]">{i}</code>
                        ))}
                        {carries.length === 2 && (
                          <span className={MUTED} title={TWO_INTERACTIONS[canonical]}>
                            — two, deliberately
                          </span>
                        )}
                      </div>
                      <RequirementLine
                        activity={canonical}
                        gap={requirementGaps[canonical]}
                        usageState={usageState}
                      />
                    </>
                  )}
                  <div className="mt-2"><PreviewToggle id={`a:${st.value}`} {...preview} /></div>
                  {preview.openPreview === `a:${st.value}` && <PreviewPanel activity={canonical} />}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
