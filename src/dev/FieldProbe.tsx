/**
 * Field probe — DEV ONLY, not part of the build.
 *
 * `BlockEditorPane`'s field sections are gated by ~20 nested conditions on
 * `block.type` and `activityConfig.subtype`. Phase 2 of the §21 port moves them
 * into their own module, and the risk is silently dropping one: a missing branch
 * type-checks perfectly and simply never renders.
 *
 * The test runner is Node's `--test` with TS stripping and cannot load `.tsx`,
 * so this cannot be a component test. Instead this page renders ONE editor at a
 * time for a (type, activity, isAssessment) triple, driven from the console, so
 * the complete set of visible field labels can be captured before the move and
 * compared with the set after it.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BlockEditorPane } from '../admin/builder/editor/BlockEditorPane';
import type { Activity } from '../lib/blocks/block-model';
import '../index.css';

interface ProbeSpec {
  type: string;
  activity?: string;
  /** Where the activity is written: `both` also sets `activityConfig.subtype`. */
  where?: 'both' | 'block-only';
  isAssessment?: boolean;
  scoringEnabled?: boolean;
}

const TYPES = [
  'lesson', 'exercise', 'journal', 'checklist', 'conclude', 'sleep-diary',
  'onboarding', 'assessment', 'assessment-lite', 'learning', 'practice',
  'reflection', 'rest', 'quiz', 'workshop', 'tracker', 'check-in',
];
const ACTIVITIES = [
  'mcq', 'single-select', 'multi-select', 'table', 'input-table', 'structured-list',
  'rating-scale', 'clinical-instrument', 'upload', 'ephemeral-journal',
  'comparison-matrix', 'number', 'read', 'listen', 'view', 'complete',
  'date-time', 'table-review', 'ranking', 'short-text',
];

/* The matrix. Every block TYPE once (the type-gated sections), every ACTIVITY
   against `exercise` in both storage shapes (the activity-gated sections, and
   the 220-block case where the activity is only at block level), the assessment
   scoring section both ways, and the remaining type-specific sections. */
const SPECS: ProbeSpec[] = [
  ...TYPES.map((type) => ({ type, activity: 'mcq', where: 'both' as const })),
  ...ACTIVITIES.flatMap((activity) => ([
    { type: 'exercise', activity, where: 'both' as const },
    { type: 'exercise', activity, where: 'block-only' as const },
  ])),
  ...['mcq', 'single-select', 'multi-select', 'rating-scale', 'input-table'].map((activity) => ({
    type: 'exercise', activity, where: 'both' as const, isAssessment: true,
  })),
  { type: 'exercise', activity: 'mcq', where: 'both' as const, scoringEnabled: true },
  ...['checklist', 'journal', 'sleep-diary', 'conclude', 'lesson'].flatMap((type) =>
    ['multi-select', 'input-table', 'read'].map((activity) => ({ type, activity, where: 'both' as const }))),
];

const keyOf = (s: ProbeSpec) =>
  `${s.type}|${s.activity}|${s.where}|${s.isAssessment ? 'A' : s.scoringEnabled ? 'S' : '0'}`;

function blockFrom(spec: ProbeSpec): Activity {
  const cfg: Record<string, unknown> = {};
  if (spec.where !== 'block-only' && spec.activity) cfg.subtype = spec.activity;
  if (spec.scoringEnabled) cfg.scoring = { enabled: true };
  return {
    id: 'probe', title: 'Probe', type: spec.type, activity: spec.activity,
    content: '', duration: 5, required: true, order: 0,
    activityConfig: cfg,
  } as unknown as Activity;
}

function Probe() {
  return (
    <div id="probe">
      {SPECS.map((spec) => (
        <div key={keyOf(spec)} data-fp={keyOf(spec)}>
          <BlockEditorPane
            block={blockFrom(spec)}
            onChange={() => {}}
            onDelete={() => {}}
            isAssessment={!!spec.isAssessment}
          />
        </div>
      ))}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><Probe /></StrictMode>);
