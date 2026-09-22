/**
 * BLOCK GALLERY — every permitted (block type × activity) pair, drawn by the
 * real renderer.
 *
 * `BlockTypeViewer`'s `BlockPreview` draws a hand-made mock — grey bars and a
 * "📷 Media Placeholder" — so the one screen that claimed to preview blocks has
 * never shown what a block actually looks like. A mock cannot go stale loudly:
 * it just quietly stops matching. This mounts `BlockRenderer` itself, so what
 * you see here is what the player draws, and it cannot drift.
 *
 * Sample content is declared per activity. It is illustrative, not live.
 */
import { useMemo, useState } from 'react';
import { BlockRenderer } from '../../product/app/programs/BlockRenderer';
import {
  type Activity, type ActivityConfig, type BlockType,
} from '../block-builder/model/block-model';
import { ACTIVITIES, interactionsOf, type ActivityName } from '../block-builder/model/vocabulary';
import { LEAF_BLOCK_TYPES } from '../block-builder/model/block-model';
import { DAY_TYPE_PRESETS } from '../block-builder/model/block-type-rules';
import { AdminPageLayout } from '../shell/AdminPageLayout';

/**
 * Permitted activities per block type.
 *
 * `DAY_TYPE_PRESETS[t].allowedActivities` is the store of record where a preset
 * exists, but presets are keyed by DAY type and eleven block types have no
 * preset at all. Where there is none, fall back to the module document's list
 * so the gallery still shows the pair rather than silently dropping it.
 */
const FALLBACK_ACTIVITIES: Record<string, ActivityName[]> = {
  lesson: ['read'],
  exercise: ['mcq', 'single-select', 'multi-select', 'boolean', 'rating-scale', 'slider',
    'input-table', 'check-grid', 'structured-list', 'number', 'timer', 'date', 'time',
    'date-time', 'location', 'ranking', 'upload'],
  journal: ['text', 'short-text', 'ephemeral-journal', 'record'],
  checklist: ['structured-list'],
  conclude: ['complete'],
  'sleep-diary': ['input-table', 'date', 'time', 'date-time', 'table-review'],
  onboarding: ['mcq', 'single-select', 'multi-select', 'boolean', 'text', 'short-text', 'date', 'consent'],
  assessment: ['mcq', 'single-select', 'clinical-instrument'],
  learning: ['mcq', 'single-select'],
  practice: ['multi-select', 'input-table', 'structured-list', 'number', 'timer', 'text',
    'short-text', 'record', 'location', 'upload'],
  reflection: ['mcq', 'single-select', 'rating-scale', 'text', 'ephemeral-journal', 'record'],
  quiz: ['mcq', 'single-select', 'multi-select', 'boolean', 'rating-scale'],
  workshop: ['multi-select', 'input-table', 'text', 'ephemeral-journal', 'ranking', 'upload'],
  tracker: ['check-grid', 'input-table', 'structured-list', 'rating-scale', 'slider',
    'boolean', 'number', 'timer'],
  'check-in': ['mcq', 'single-select', 'multi-select', 'boolean', 'rating-scale', 'slider',
    'text', 'short-text'],
};

function activitiesForType(t: string): ActivityName[] {
  const preset = (DAY_TYPE_PRESETS as Record<string, { allowedActivities?: ActivityName[] }>)[t];
  return preset?.allowedActivities ?? FALLBACK_ACTIVITIES[t] ?? [];
}

/** Sample config per activity. Enough to make each control real. */
const SAMPLE: Record<string, { title: string; subtitle?: string; content?: string; cfg: ActivityConfig }> = {
  'read': { title: 'Reducing Disruptions', content: '<p>Not every solution is feasible, because situations are rarely simple. Write the pros and cons for each one you came up with.</p>', cfg: {} },
  'listen': { title: 'Guided body scan', subtitle: 'Eight minutes, somewhere you will not be interrupted.', cfg: { transcript: 'Settle into the chair…' } },
  'view': { title: 'What burnout does to attention', content: '<p>Three minutes on why focus goes first and returns last.</p>', cfg: {} },
  'complete': { title: 'That is day 12 done', content: '<p>You logged four thoughts today.</p>', cfg: {} },
  'table-review': { title: 'Your week of sleep', subtitle: 'Read it back, then confirm it looks right.', cfg: { source_key: 'sleep_quality', columns: ['Slept', 'Quality'] } },
  'paced-breathing': { title: 'Four, seven, eight', subtitle: 'Follow the circle.', cfg: { pattern: '4-7-8', cycles: 6 } },
  'mcq': { title: '“It makes me furious!”', cfg: { prompt: 'Thought, or feeling?', options: ['Thought', 'Feeling'] } },
  'single-select': { title: 'Do you have any pre-existing conditions?', cfg: { options: ['Yes', 'No', 'I’d prefer not to answer'] } },
  'multi-select': { title: 'Which of these did you follow last night?', cfg: { options: ['Room is too hot', 'The room is too bright', 'I had a coffee before bed', 'Too many thoughts in my mind'] } },
  'boolean': { title: 'Did you take a full lunch break today?', subtitle: 'Away from your desk.', cfg: { items: ['Yes', 'No'] } },
  'clinical-instrument': { title: 'Over the last two weeks…', cfg: { questions: ['Little interest or pleasure in doing things', 'Feeling down, depressed, or hopeless'] } },
  'text': { title: 'What was going through your mind?', cfg: { prompt: 'Start anywhere…' } },
  'short-text': { title: 'Name the feeling in one word', cfg: { prompt: 'One word' } },
  'ephemeral-journal': { title: 'Get it out of your head', cfg: { prompt: 'Type whatever is loudest…', persist: false } },
  'number': { title: 'How many focus sessions did you complete?', cfg: { prompt: '0', constraints: { min: 0, max: 10 } } },
  'input-table': { title: 'Motivation Table', subtitle: 'Plan today’s tasks.', cfg: { columns: ['Task', 'Roadblock', 'Reward', 'Urgency'] } },
  'date': { title: 'When did you first notice this?', cfg: { prompt: 'A rough date is fine.' } },
  'time': { title: 'What time did you get into bed?', cfg: { prompt: 'Approximations are fine.', time: true } },
  'date-time': { title: 'When did it start?', cfg: { time: true } },
  'location': { title: 'Where were you?', cfg: { prompt: 'Search a place…', precision: 'coarse' } },
  'structured-list': { title: 'Your wind-down tonight', cfg: { listItems: ['Screens off', 'Lights down', 'Tomorrow’s list written', 'In bed by 11'] } },
  'check-grid': { title: 'This week’s habits', cfg: { rows: ['Walk 20 min', 'No screens after 10', 'Journalled'], columns: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] } },
  'consent': { title: 'Before we begin', cfg: { statement: 'iKan stores what you write so it can show you your own patterns over time. Your entries are visible only to you, and you can delete everything from Settings at any point.', prompt: 'I understand and agree' } },
  'rating-scale': { title: 'How rested do you feel?', cfg: { scale: [{ label: 'Not at all', value: 1 }, { label: 'A little', value: 2 }, { label: 'Somewhat', value: 3 }, { label: 'Mostly', value: 4 }, { label: 'Completely', value: 5 }] } },
  'slider': { title: 'On a scale of 0 to 9, how angry do you feel?', cfg: { min: 0, max: 9, step: 1, slider_labels: ['Calm', 'Barely there', 'Mildly irritated', 'Slightly annoyed', 'Annoyed', 'Frustrated', 'Angry', 'Very angry', 'Furious', 'Enraged'] } },
  'ranking': { title: 'Put these in order', subtitle: 'Heaviest at the top.', cfg: { listItems: ['Money', 'Work deadlines', 'Sleep', 'Family', 'Health'] } },
  'timer': { title: 'Sit with it for two minutes', cfg: { target: 120, mode: 'down' } },
  'upload': { title: 'Add a photo of your worry sheet', cfg: { acceptedFileTypes: ['image/*'] } },
  'record': { title: 'Say it out loud instead', cfg: { prompt: 'Up to two minutes.', max_duration: 120 } },
};

function sampleBlock(type: BlockType, activity: string): Activity {
  const s = SAMPLE[activity] ?? { title: activity, cfg: {} };
  return {
    id: `gallery-${type}-${activity}`,
    title: s.title,
    subtitle: s.subtitle,
    type,
    activity,
    content: s.content ?? '',
    duration: 2,
    required: false,
    order: 0,
    activityConfig: { ...s.cfg, subtype: activity },
  } as Activity;
}

const SELECT = 'text-sm px-3.5 py-2.5 min-h-11 rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]';

export function AdminBlockGallery() {
  const [fType, setFType] = useState('');
  const [fAct, setFAct] = useState('');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  const pairs = useMemo(() => {
    const out: Array<{ type: BlockType; activity: string }> = [];
    for (const t of LEAF_BLOCK_TYPES) {
      for (const a of activitiesForType(t)) out.push({ type: t as BlockType, activity: a });
    }
    return out;
  }, []);

  const shown = pairs.filter(p => (!fType || p.type === fType) && (!fAct || p.activity === fAct));

  return (
    <AdminPageLayout
      title="Block gallery"
      description={
        `Every permitted block type × activity pair, drawn by BlockRenderer itself — not a mock. ` +
        `${shown.length} of ${pairs.length} pairs shown. Controls are live; nothing is saved.`
      }
      maxWidth="none"
    >
      <nav aria-label="Filters" className="flex gap-3 flex-wrap">
        <select aria-label="Block type" className={SELECT} value={fType} onChange={e => setFType(e.target.value)}>
          <option value="">All block types</option>
          {LEAF_BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select aria-label="Activity" className={SELECT} value={fAct} onChange={e => setFAct(e.target.value)}>
          <option value="">All activities</option>
          {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </nav>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(390px,390px))] gap-7 justify-center">
        {shown.map(({ type, activity }) => {
          const key = `${type}/${activity}`;
          const block = sampleBlock(type, activity);
          return (
            <figure key={key} className="m-0">
              <figcaption className="flex gap-2 items-baseline mb-2 flex-wrap">
                <strong className="text-[15px] font-medium">{type}</strong>
                <span className="font-mono text-[12px] text-[var(--color-text-muted)]">
                  {activity} · {interactionsOf(activity as never).join(' · ')}
                </span>
              </figcaption>
              <div className="w-[390px] max-w-full h-[700px] overflow-y-auto bg-[var(--color-bg-page)] rounded-[24px] border border-[var(--color-border-default)] p-6 shadow-[var(--shadow-sm)]">
                <BlockRenderer
                  block={block}
                  value={answers[key]}
                  onChange={(v) => setAnswers(a => ({ ...a, [key]: v }))}
                />
              </div>
            </figure>
          );
        })}
      </div>
    </AdminPageLayout>
  );
}
