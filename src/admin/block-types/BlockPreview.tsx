import { ACTIVITY_HINTS, requiresOf } from '../block-builder/model/vocabulary';
import { cn } from '../ui/utils';

// ── Mini Preview Renderer ───────────────────────────────────────
/**
 * What each interaction actually draws.
 *
 * **Re-keyed from block type to interaction, 2026-09-08.** These mocks were
 * written against the legacy check-in and equip type strings — `emoji_scale`,
 * `free_text`, `single_choice`, `lesson`, `journal` — and the component that
 * rendered them was orphaned, so the only thing this page said about
 * appearance was one line of `previewHint` prose. The interaction is what
 * `BlockRenderer` switches on, so the drawing belongs to the interaction.
 *
 * Thirteen previews, one per interaction. Seven are the original mocks
 * re-keyed; six are new and were read off `BlockRenderer`, not invented — the
 * source line is named on each.
 *
 * Five legacy mocks did not survive the re-key, and the reason is in each case
 * that they drew something the renderer does not:
 *
 * | legacy mock | why it is gone |
 * |---|---|
 * | `emoji_scale` | `rate` draws `renderRatingScale` — a slider, not an emoji row |
 * | `yes_no` | a yes/no question is `select-one` with two options; the renderer draws radios |
 * | `exercise` | an MCQ with a correct-answer highlight — a variant of `select-one`, not its general shape |
 * | `journal` | a prompt above a textarea, which is `write` |
 * | `reflection` | centred prose, which is `read` |
 *
 * Keeping any of them would have shown an author a widget the player never
 * builds, which is worse than showing nothing.
 */
/*
  Keyed by ACTIVITY since §26. It was keyed by interaction, which worked only
  while an interaction was a widget name. The drawings are unchanged — each case
  below is the activity that used to resolve to the interaction it replaced.
*/

const PREVIEW = 'rounded-lg bg-[var(--color-bg-page)] p-4 border border-[var(--color-border-default)]';
const LABEL = 'block font-medium text-sm text-[var(--color-text-primary)] mb-2';
const HINT = 'text-xs text-[var(--color-text-muted)] italic mt-2';
const CELL = 'border border-[var(--color-border-default)] px-2 py-1 text-xs';
const MUTED = 'text-[var(--color-text-muted)]';
const PRIMARY_BG = 'bg-[var(--color-primary-default)]';

// The lesson view — `read` draws it, and so does `watch`, which has no
// renderer of its own (`BlockRenderer`: `case 'watch': return renderLesson()`).
const lessonBody = (
  <div className="space-y-2">
    <div className="w-full h-16 rounded-lg bg-[linear-gradient(135deg,var(--color-bg-muted),var(--color-accent-default))] flex items-center justify-center">
      <span className={cn('text-xs', MUTED)}>📷 Media Placeholder</span>
    </div>
    <div className="space-y-1">
      <div className="h-3 rounded w-3/4 bg-[var(--color-text-primary)] opacity-20" />
      <div className="h-2 rounded w-full bg-[var(--color-text-muted)] opacity-15" />
      <div className="h-2 rounded w-5/6 bg-[var(--color-text-muted)] opacity-15" />
      <div className="h-2 rounded w-2/3 bg-[var(--color-text-muted)] opacity-15" />
    </div>
  </div>
);

export function BlockPreview({ activity }: { activity: string | undefined }) {
  const hint = ACTIVITY_HINTS[activity ?? ''] ?? '';
  const hintLine = <p className={HINT}>{hint}</p>;

  switch (activity) {
    // was `lesson`
    case 'read':
      return <div className={PREVIEW}>{lessonBody}{hintLine}</div>;

    // No renderer of its own. Showing the same drawing is the point.
    case 'view':
      return (
        <div className={PREVIEW}>
          {lessonBody}
          <p className={cn(HINT, 'text-[var(--color-status-warning)]')}>
            Identical to the lesson view on purpose — `BlockRenderer` has no watch case and falls through to it.
          </p>
        </div>
      );

    // was `single_choice` — BlockRenderer: renderMCQ
    case 'mcq':
    case 'single-select':
      return (
        <div className={PREVIEW}>
          <span className={LABEL}>How did you sleep last night?</span>
          <div className="space-y-2">
            {['Very poorly', 'Poorly', 'Average', 'Well', 'Very well'].map((opt, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  i === 3
                    ? 'bg-[var(--color-bg-input)] border-2 border-[var(--color-primary-default)]'
                    : 'bg-[var(--color-bg-card)] border border-[var(--color-border-default)]',
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    i === 3 ? 'border-[var(--color-primary-default)]' : 'border-[var(--color-border-default)]',
                  )}
                >
                  {i === 3 && <div className={cn('w-2 h-2 rounded-full', PRIMARY_BG)} />}
                </div>
                <span className="text-sm">{opt}</span>
              </div>
            ))}
          </div>
          {hintLine}
        </div>
      );

    // was `multi_select` — BlockRenderer: renderMultiSelect
    case 'multi-select':
      return (
        <div className={PREVIEW}>
          <span className={LABEL}>What activities did you do today?</span>
          <div className="flex flex-wrap gap-2">
            {['🏃 Exercise', '📚 Reading', '🧘 Meditation', '🎵 Music', '👥 Social'].map((tag, i) => (
              <span
                key={i}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs border border-[var(--color-border-default)]',
                  [0, 2].includes(i)
                    ? cn(PRIMARY_BG, 'text-[var(--color-primary-on)]')
                    : 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)]',
                )}
              >
                {tag}
              </span>
            ))}
          </div>
          {hintLine}
        </div>
      );

    // was `free_text` — BlockRenderer: renderTextResponse
    case 'text':
    case 'short-text':
    case 'ephemeral-journal':
      return (
        <div className={PREVIEW}>
          <span className={LABEL}>What&apos;s on your mind?</span>
          <div className="w-full h-20 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border-default)] p-3">
            <span className={cn('text-sm', MUTED)}>Type your thoughts here...</span>
          </div>
          {hintLine}
        </div>
      );

    // was `slider` — BlockRenderer: renderRatingScale
    case 'rating-scale':
      return (
        <div className={PREVIEW}>
          <span className={LABEL}>Rate your stress level</span>
          <div className="space-y-2 py-2">
            <div className="relative h-2 rounded-full bg-[var(--color-bg-muted)]">
              <div className={cn('absolute left-0 top-0 h-2 rounded-full w-[60%]', PRIMARY_BG)} />
              <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 shadow left-[58%] bg-[var(--color-bg-card)] border-[var(--color-primary-default)]" />
            </div>
            <div className="flex justify-between">
              <span className={cn('text-[10px]', MUTED)}>0 (None)</span>
              <span className={cn('text-[10px] font-medium', MUTED)}>6</span>
              <span className={cn('text-[10px]', MUTED)}>10 (Extreme)</span>
            </div>
          </div>
          {hintLine}
        </div>
      );

    // was `checklist` — BlockRenderer: renderChecklist
    case 'structured-list':
      return (
        <div className={PREVIEW}>
          <span className={LABEL}>☑️ Today&apos;s Self-Care Tasks</span>
          <div className="space-y-2">
            {['Drink 8 glasses of water', '10 min mindful breathing', 'Go for a walk', 'Write 3 gratitudes'].map((item, i) => {
              const done = [0, 1].includes(i);
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 text-white text-[10px]',
                      done ? cn('border-[var(--color-primary-default)]', PRIMARY_BG) : 'border-[var(--color-border-default)] bg-transparent',
                    )}
                  >
                    {done ? '✓' : ''}
                  </div>
                  <span className={done ? cn('line-through', MUTED) : 'no-underline text-[var(--color-text-primary)]'}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
          {hintLine}
        </div>
      );

    // was `conclude` — BlockRenderer: the completion card
    case 'complete':
      return (
        <div className={PREVIEW}>
          <div className="text-center space-y-2 py-2">
            <span className="text-2xl">🎯</span>
            <span className={cn(LABEL, 'text-center')}>Day Complete!</span>
            <p className={cn('text-xs leading-[1.5]', MUTED)}>
              Great work today. Remember: progress over perfection.
            </p>
            <div className={cn('w-full py-2 rounded-lg text-xs text-[var(--color-primary-on)] font-medium', PRIMARY_BG)}>
              Continue Tomorrow →
            </div>
          </div>
          {hintLine}
        </div>
      );

    /*
      NEW — read off `BlockRenderer.renderInputTable` (:575). Columns come from
      `config.columns`; when `config.rows` is present the FIRST column becomes a
      read-only row heading and only the rest are editable. That is the shape of
      a sleep diary, and it is why 144 live blocks draw this.
    */
    case 'input-table':
      return (
        <div className={PREVIEW}>
          <span className={LABEL}>🌙 Sleep Diary</span>
          <div className="overflow-x-auto">
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  {['Question', 'Mon', 'Tue', 'Wed'].map((c) => (
                    <th key={c} className={cn(CELL, 'bg-[var(--color-bg-input)] font-medium text-left')}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Bedtime', 'Wake time', 'Times awake'].map((row, i) => (
                  <tr key={row}>
                    <td className={cn(CELL, 'bg-[var(--color-bg-muted)] font-medium')}>{row}</td>
                    {['10:30 PM', '6:45 AM', '2'].map((v, j) => (
                      <td
                        key={j}
                        className={cn(CELL, 'bg-[var(--color-bg-input)]', i === 0 && j === 0 ? 'text-[var(--color-text-primary)]' : MUTED)}
                      >
                        {i === 0 && j === 0 ? v : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hintLine}
        </div>
      );

    /*
      NEW — read off `BlockRenderer.renderTableChecklist` (:512). The first
      column is headed "Activity" by the renderer, not by config, and every
      other cell is a yes/no toggle.
    */
    case 'check-grid':
      return (
        <div className={PREVIEW}>
          <span className={LABEL}>Weekly Habit Tracker</span>
          <div className="overflow-x-auto">
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  {['Activity', 'Mon', 'Tue', 'Wed'].map((c) => (
                    <th key={c} className={cn(CELL, 'bg-[var(--color-bg-input)] font-medium', c === 'Activity' ? 'text-left' : 'text-center')}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Morning walk', 'No screens after 9'].map((row, i) => (
                  <tr key={row}>
                    <td className={cn(CELL, 'font-medium')}>{row}</td>
                    {[0, 1, 2].map((j) => (
                      <td key={j} className={cn(CELL, 'text-center')}>
                        <span className={(i + j) % 2 === 0 ? 'text-[var(--color-primary-default)]' : 'text-[var(--color-border-default)]'}>
                          {(i + j) % 2 === 0 ? '✓' : '○'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hintLine}
        </div>
      );

    /*
      NEW — read off `BlockRenderer.renderClinicalInstrument` (:451). One row per
      question, one shared scale, and the default scale when none is declared is
      the four PHQ/GAD steps written out here.
    */
    case 'clinical-instrument':
      return (
        <div className={PREVIEW}>
          <span className={LABEL}>Over the last 2 weeks, how often have you been bothered by…</span>
          <div className="space-y-3">
            {['Little interest or pleasure in doing things', 'Feeling down, hopeless'].map((q, qi) => (
              <div key={q}>
                <p className="text-xs text-[var(--color-text-primary)] mb-1">{q}</p>
                <div className="flex gap-1 flex-wrap">
                  {['Not at all', 'Several days', 'More than half', 'Nearly every day'].map((opt, oi) => (
                    <span
                      key={opt}
                      className={cn(
                        'px-2 py-1 rounded-md text-[10px] border border-[var(--color-border-default)]',
                        oi === qi + 1
                          ? cn(PRIMARY_BG, 'text-[var(--color-primary-on)]')
                          : cn('bg-[var(--color-bg-card)]', MUTED),
                      )}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {hintLine}
        </div>
      );

    /*
      NEW — read off `BlockRenderer.renderFileUpload` (:777). The accepted types
      shown are the renderer's own defaults when the block declares none, and
      10MB is its default cap.
    */
    case 'upload':
      return (
        <div className={PREVIEW}>
          <span className={LABEL}>Add a photo of your sleep log</span>
          <div className="w-full rounded-lg flex flex-col items-center justify-center gap-1 py-6 border-2 border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
            <span className="text-xl">📎</span>
            <span className="text-xs text-[var(--color-text-primary)]">Choose a file</span>
            <span className={cn('text-[10px]', MUTED)}>Images, PDF, documents, audio · up to 10MB</span>
          </div>
          {hintLine}
        </div>
      );

    /*
      NEW — read off `BlockRenderer.renderNumberResponse` (:429). One input, and
      the block's own prompt is used as the PLACEHOLDER, not as a label above
      it — which is why an unprompted number block shows an empty box.
    */
    case 'number':
      return (
        <div className={PREVIEW}>
          <div className="w-full rounded-[20px] px-4 py-4 bg-[var(--color-bg-card)] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <span className={cn('text-sm', MUTED)}>
              How many hours did you sleep?
            </span>
          </div>
          {hintLine}
        </div>
      );

    /*
      Declared, no renderer. `BlockRenderer` has no case for these four, so a
      block carrying one would draw reading content — the `view` defect exactly.
      They show a marked gap: inventing a mock for a widget the player cannot
      build is the one thing this page must not do, and a mock here would make
      the gap invisible to the person deciding whether to author one.
    */
    case 'listen':
    case 'ranking':
    case 'table-review':
    case 'date':
    case 'time':
    case 'date-time':
      return (
        <div className={cn(PREVIEW, 'border-dashed')}>
          <p className="text-sm text-[var(--color-status-warning)] m-0">
            No renderer yet — <code>{activity}</code> is declared so it can be authored the day
            one exists. It is kept out of every editor picker until then.
          </p>
          <p className={HINT}>
            Requires: {requiresOf(activity).join(', ') || 'nothing'}
          </p>
        </div>
      );

    default:
      // Reached by the eleven activities §26 declares ahead of their renderers,
      // and by anything carrying a retired term.
      return (
        <div className={PREVIEW}>
          <p className="text-sm text-[var(--color-status-warning)]">
            No renderer yet for “{activity ?? '(no activity)'}” — it is declared so it can be
            authored the day one exists, and kept out of every editor picker until then.
          </p>
        </div>
      );
  }
}
