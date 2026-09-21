import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EquipProgram, Activity, renderActivityOf, interactionsOfBlock, repeatTargetDays, responseKeyOf, type DayContent } from '../../programs/block-model/block-model';
import { ErrorBoundary } from '../../ui/ErrorBoundary';
import { BlockRenderer } from '../../blocks/BlockRenderer';
import { Button } from '../../ui/button';
import { ChevronLeft, Check, X } from 'lucide-react';
import { useNotifications } from '../../../../shared/contexts/NotificationContext';
import { cn } from '../../ui/utils';
import { DEFAULT_DAY_LAYOUT, layoutOf, primaryButtonFor, fallbackTitleFor, type DayLayout } from '../../programs/block-model/day-layout';
import { policyOf } from '../../programs/block-model/day-policy';

interface ProgramPlayerProps {
  program: EquipProgram;
  initialDay?: number;
  initialResponses?: Record<string, any>;
  onComplete: (results: PlayerResults) => void;
  /** May be async — `handleExit` awaits it when the stage promises a save on exit. */
  onProgressChange?: (progress: { currentBlockIndex: number, responses: Record<string, any> }) => void | Promise<void>;
  onExit: () => void;
  mode?: 'preview' | 'live';
  /** Carry-forward: responses from earlier days, keyed day → blockId → response. */
  priorDayResponses?: Record<number, Record<string, any>>;
}

export interface PlayerResults {
  programId: string;
  completedDays: number[];
  responses: Record<string, any>;
  scores?: Record<string, number>;
  totalScore?: number;
  completedAt: string;
}

interface Step {
  id: string;
  blocks: Activity[];
}

// --- AFFORDANCE CONFIGURATION ---

/*
  `DAY_TYPE_CONFIG` and `DayTypeConfig` lived here and are now
  `DAY_TYPE_LAYOUTS` / `DayLayout` in `src/lib/blocks/day-layout.ts`.

  Two reasons, both §19 step 1. Its `primaryButtonText` and `fallbackTitle` were
  FUNCTIONS, which cannot be written to KV — denormalising the map as written
  would have stored `undefined` for both and left every day without a primary
  button label. And it lived in a `.tsx`, which Node's type stripper cannot
  load, so the migration script that has to read these values could never have
  imported them.

  Values are unchanged; `day-layout.test.ts` asserts all eleven against the
  originals. The player now asks the DAY for its layout — `layoutOf(day)` —
  which falls back to the type lookup while no day carries one of its own.
*/

// ── Font helper ─────────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

/**
 * A day's layout. Its own, or the learning default.
 *
 * The `dayType` warning that lived here is gone with §19 step 3: a day cannot
 * carry an unknown type any more, because it carries no type at all.
 */
export const getDayLayout = (day: DayContent | undefined): DayLayout => layoutOf(day);

const groupBlocksIntoSteps = (activities: Activity[], layout: DayLayout = DEFAULT_DAY_LAYOUT): Step[] => {
  const config = layout;
  
  if (config.singlePage) {
    return [{ id: 'single-page', blocks: activities }];
  }

  const steps: Step[] = [];
  let currentStep: Step | null = null;

  activities.forEach((block, index) => {
    if (block.stepGroup) {
      if (currentStep && currentStep.id === block.stepGroup) {
         currentStep.blocks.push(block);
      } else {
         if (currentStep) steps.push(currentStep);
         currentStep = { id: block.stepGroup, blocks: [block] };
      }
    } else {
      if (currentStep) {
        steps.push(currentStep);
        currentStep = null;
      }
      steps.push({ id: block.id || `block-${index}`, blocks: [block] });
    }
  });

  if (currentStep) {
    steps.push(currentStep);
  }

  return steps;
};

export function ProgramPlayer({ 
  program, 
  initialDay = 1, 
  initialResponses = {},
  onComplete,
  onProgressChange,
  onExit,
  mode = 'live',
  priorDayResponses,
}: ProgramPlayerProps) {
  const { showToast } = useNotifications();

  const [currentDayNum, setCurrentDayNum] = useState(initialDay);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [isDayComplete, setIsDayComplete] = useState(false);

  const activeDay = useMemo(() =>
    program.daily_content.find(d => d.day === currentDayNum),
  [program.daily_content, currentDayNum]);

  const dayConfig = useMemo(() => {
    if (!activeDay) return DEFAULT_DAY_LAYOUT;
    return getDayLayout(activeDay);
  }, [activeDay]);

  // Carry-forward: a day's blocks = its native blocks PLUS blocks authored on
  // other days whose `repeat` config targets the current day. The repeated block
  // keeps its original id, so its response is stored per-day under that id.
  const activeDayActivities = useMemo<Activity[]>(() => {
    if (!activeDay) return [];
    const totalDays = program.daily_content.length;
    // Blocks carried forward from other days onto this one.
    //
    // DE-DUPLICATED BY ID (2026-09-04). This used to push every match, and
    // `handleRepeatDay` deliberately preserves block ids across days — so a
    // repeated day whose block also carried a `repeat` pushed the SAME id more
    // than once. Two renderers then bound to `responses[block.id]`, React saw a
    // duplicate `key`, and `groupBlocksIntoSteps` emitted two steps with the
    // same id. A block appears at most once on a day.
    const seen = new Set(activeDay.activities.map(a => a.id));
    const repeated: Activity[] = [];
    for (const d of program.daily_content) {
      if (d.day === currentDayNum) continue;
      for (const a of d.activities) {
        if (!a.repeat || seen.has(a.id)) continue;
        if (repeatTargetDays(a, d.day, totalDays).includes(currentDayNum)) {
          seen.add(a.id);
          repeated.push(a);
        }
      }
    }
    if (!repeated.length) return activeDay.activities;

    // ORDER IS HONOURED (2026-09-04). Carried blocks used to be appended, so a
    // daily tracker always landed at the bottom of the day whatever its `order`
    // said. Sort the merged list by `order`, keeping the authored sequence for
    // blocks that declare none.
    const merged = [...activeDay.activities, ...repeated];
    return merged.every(a => typeof a.order === 'number')
      ? [...merged].sort((x, y) => (x.order ?? 0) - (y.order ?? 0))
      : merged;
  }, [activeDay, program.daily_content, currentDayNum]);

  const steps = useMemo(() =>
    activeDay ? groupBlocksIntoSteps(activeDayActivities, dayConfig) : [],
  [activeDay, activeDayActivities, dayConfig]);

  const activeStep = steps[currentStepIndex];

  // Every block id in the programme, mapped to its response identity, so a
  // stored response (filed under a block id) can be matched to the question it
  // answered rather than to the occurrence that asked it.
  const identityByBlockId = useMemo(() => {
    const m: Record<string, string> = {};
    for (const d of program.daily_content) {
      for (const a of d.activities ?? []) m[a.id] = responseKeyOf(a);
    }
    return m;
  }, [program.daily_content]);

  /**
   * The stage's save policy, declared in `DAY_TYPE_PRESETS[...].autoConfig` and
   * read by nothing until 2026-09-08.
   *
   * `saveOnToggle` (tracker) says every change is committed as it happens —
   * which is what `handleBlockChange` does for every stage, so such a stage
   * needs nothing on the way out. `saveOnExit` (reflection, check-in) is a
   * promise that leaving the day does not lose work, and there was no flush on
   * exit at all: `onExit` set the view and returned, so a sync still in flight
   * or one that had failed took the last answer with it.
   *
   * Neither governs a live day today — no programme types a day `reflection`,
   * `tracker` or `check-in` — which the Block Type Viewer now says out loud.
   */
  const savePolicy = policyOf(activeDay);

  const handleExit = async () => {
    if (savePolicy.saveOnExit && !savePolicy.saveOnToggle) {
      try {
        await onProgressChange?.({ currentBlockIndex: currentStepIndex, responses });
      } catch (e) {
        // Leaving is the user's decision; a failed flush must not trap them.
        console.error('[player] save-on-exit flush failed', e);
      }
    }
    onExit();
  };

  // Carry-forward: collect a block's responses to the SAME QUESTION on earlier
  // days.
  //
  // This used to require `block.repeat` and match on `block.id`. Nothing in
  // production carries `repeat` — not one block of 407 — so the whole path was
  // unreachable, while 98 blocks declared repetition the other way, by giving
  // each occurrence the same `activityConfig.key`. Sleep Tight asks the same
  // sleep-quality table on days 1-7 under seven ids and one key; every night's
  // entry was invisible to the next.
  //
  // A key therefore stands in for `repeat` as a declaration of a series. A
  // block with no key resolves to its own id and still needs `repeat`, which
  // is exactly the previous behaviour for all 309 of them.
  const priorEntriesFor = (block: Activity): { day: number; response: any }[] => {
    if (!priorDayResponses) return [];
    const identity = responseKeyOf(block);
    const declaredSeries = identity !== block.id;
    if (!declaredSeries && !block.repeat) return [];
    const out: { day: number; response: any }[] = [];
    for (const [dayStr, byBlock] of Object.entries(priorDayResponses)) {
      const day = Number(dayStr);
      if (!Number.isFinite(day) || day >= currentDayNum) continue;
      for (const [blockId, r] of Object.entries(byBlock ?? {})) {
        if ((identityByBlockId[blockId] ?? blockId) !== identity) continue;
        if (r !== undefined && r !== null && r !== '') out.push({ day, response: r });
      }
    }
    return out.sort((a, b) => a.day - b.day);
  };

  // Both readings describe the same thing: which step you are on. They used
  // to disagree by one — the bar divided by `currentStepIndex` while the text
  // added 1 — so the last step of eight read "8 of 8" beside a bar at 87.5%.
  const progressPercent = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;
  const progressText = `${currentStepIndex + 1} of ${steps.length}`;

  const isStepValid = useMemo(() => {
    if (!activeStep) return false;
    return activeStep.blocks.every(block => {
      /*
        A block that stores nothing cannot be answered, so it cannot be invalid.
        This listed three interaction names; §26 makes it a property of the
        activity — the six that produce nothing all carry `observe`, and asking
        the vocabulary is what stops the list going stale the next time one is
        added.
      */
      if (interactionsOfBlock(block).includes('observe')) return true;
      if (!block.required) return true;
      const value = responses[block.id];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    });
  }, [activeStep, responses]);

  // --- ACTIONS ---

  const handleBlockChange = (blockId: string, value: any) => {
    setResponses(prev => {
      const newResponses = {
        ...prev,
        [blockId]: value
      };

      onProgressChange?.({ 
        currentBlockIndex: currentStepIndex, 
        responses: newResponses 
      });

      if (dayConfig.autoAdvance) {
        const targetBlock = activeStep?.blocks.find(b => b.id === blockId);
        
        /*
          Picking ONE option advances; picking several cannot, because the user
          is not finished until they say so. That is a property of the activity,
          not of `choose` — `multi-select` carries the same interaction.
        */
        const activity = targetBlock ? renderActivityOf(targetBlock) : null;
        const shouldAutoAdvance = targetBlock?.autoAdvance ||
          activity === 'mcq' || activity === 'single-select';

        if (shouldAutoAdvance) {
          const stepValidWithNewValue = activeStep?.blocks.every(block => {
            if (!block.required) return true;
            const val = block.id === blockId ? value : newResponses[block.id];
            if (Array.isArray(val)) return val.length > 0;
            return val !== undefined && val !== null && val !== '';
          });

          if (stepValidWithNewValue) {
            setTimeout(() => handleNext(), 300);
          }
        }
      }

      return newResponses;
    });
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // The milestone check-in popup (`ProgramCheckIn`) was deleted 2026-09-04.
      // It had four questions hardcoded in JSX, no store and no authoring
      // surface, and wrote score-0 rows into `assessment_result:` under a
      // synthetic `checkin_{programId}_day_{n}` id that polluted every
      // assessment query. It was unreachable — `enabled` was false on every
      // live programme and false by default — so this is a no-op in practice.
      // `program.checkInConfig` is retained on the record but no longer read
      // here; see blocks.md §18 5.3.
      setIsDayComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinishDay = () => {
    const results: PlayerResults = {
      programId: program.id,
      completedDays: [currentDayNum], 
      responses,
      completedAt: new Date().toISOString()
    };

    /**
     * Removed 2026-09-03: a second scorer.
     *
     * It summed `config.scoring.weights[config.options.indexOf(answer)]` over
     * the day's blocks, gated on `daily_content.length === 1` — which is only
     * ever true for an assessment, since the adapter builds a one-day program.
     * So the player was scoring assessments in parallel with the real engine.
     *
     * It was not dead code. `AssessmentFlow` preferred its output over
     * everything else:
     *
     *     if (typeof playerResults.totalScore === 'number') score = ...
     *
     * and `0` is a number. An assessment whose questions carry no legacy
     * `scoring` map produces all-zero weights, so a complete set of answers
     * scored **0**, and that zero silently beat the fallback path that reads
     * each option's declared `value` correctly. Two scorers, and the weaker
     * one won on a type check.
     *
     * `results.scores` / `results.totalScore` are now never set here, so
     * AssessmentFlow falls through to the declared option values — the same
     * source `resolveAnswerValue` and the scoring specs use.
     */
    onComplete(results);
  };

  // --- RENDER ---

  if (!activeDay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h2 style={{ ...f('xl', 500), marginBottom: 8 }}>Day {currentDayNum} Not Found</h2>
        <Button onClick={handleExit} variant="outline">Back to Home</Button>
      </div>
    );
  }

  // Completed Day Screen
  if (isDayComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm p-10 text-center relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 28, boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="relative z-10 space-y-8">
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-status-success-light)' }}
            >
               <Check size={40} style={{ color: 'var(--color-status-success)' }} strokeWidth={3.5} />
            </motion.div>

            <div className="space-y-3">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ ...f('2xl', 500), letterSpacing: '-0.01em' }}
              >
                {dayConfig.completionTitle}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ ...f('base', 400, 'var(--color-text-muted)'), lineHeight: 1.6 }}
              >
                Great job taking a moment for yourself. Your results are ready.
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button 
                onClick={handleFinishDay} 
                style={{
                  width: '100%', height: 56, borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)',
                  border: 'none', cursor: 'pointer',
                  ...f('base', 500, 'var(--color-text-inverse)'),
                  boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s',
                }}
              >
                {program.daily_content.length === 1 ? 'View Results' : 'Continue Journey'}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Determine title
  const displayTitle = program.title || activeDay.title || fallbackTitleFor(dayConfig, currentDayNum);
  const displaySubtitle = activeDay.subtitle || null;
  const canGoBack = dayConfig.showBack && currentStepIndex > 0;

  return (
    <>
      <div className={cn("fixed inset-0 flex flex-col", dayConfig.bgColor || 'bg-[var(--color-bg-page)]')} style={{ color: 'var(--color-text-primary)' }}>

        {/* ═══════════════════════════════════════════════════════════
            HEADER — standardised: [Back/Close] [Title] [Progress]
            ═══════════════════════════════════════════════════════════ */}
        <header
          className="flex-none flex items-center justify-between relative"
          style={{
            height: 60,
            paddingLeft: 8,
            paddingRight: 16,
            paddingTop: 'env(safe-area-inset-top, 0px)',
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--color-border-default)',
            zIndex: 50,
          }}
        >
          {/* Left: Back (if mid-step) or Close (if first step) */}
          <div style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {canGoBack ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevious}
                className="flex items-center justify-center"
                style={{
                  width: 44, height: 44, borderRadius: 22,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                }}
              >
                <ChevronLeft size={22} strokeWidth={2} />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleExit}
                className="flex items-center justify-center"
                style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: 'var(--color-bg-muted)',
                  border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                }}
              >
                <X size={18} strokeWidth={2.5} />
              </motion.button>
            )}
          </div>

          {/* Left-aligned Title */}
          <div className="flex-1 min-w-0 ml-1">
            <h1 className="truncate" style={{ ...f('sm', 500), letterSpacing: '-0.01em' }}>
               {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="truncate" style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 1 }}>
                {displaySubtitle}
              </p>
            )}
          </div>

          {/* Right: Progress indicator */}
          <div style={{ minWidth: 72, display: 'flex', justifyContent: 'flex-end' }}>
            {dayConfig.progressStyle !== 'none' && (
              <div
                className="flex items-center gap-2"
                style={{
                  height: 32, padding: '0 12px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-bg-muted)',
                }}
              >
                {dayConfig.progressStyle === 'percentage' && (
                  <div className="overflow-hidden" style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'var(--color-border-default)' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 2, backgroundColor: 'var(--color-primary-default)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ ease: "easeOut", duration: 0.5 }}
                    />
                  </div>
                )}
                <span className="tabular-nums" style={{ ...f('xs', 500, 'var(--color-text-muted)') }}>
                  {dayConfig.progressStyle === 'percentage'
                    ? `${Math.round(progressPercent)}%`
                    : progressText}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════
            BODY — scrollable content area
            ═══════════════════════════════════════════════════════════ */}
        <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col relative overflow-hidden">
          <div className={cn(
             "flex-1 w-full flex flex-col px-4 md:px-8 overflow-y-auto scrollbar-hide py-6",
             dayConfig.layout === 'centered' && "justify-center",
             dayConfig.layout === 'step-focus' && "justify-center",
             dayConfig.layout === 'scrollable' && "justify-start",
             dayConfig.layout === 'compact' && "justify-start px-4",
          )}>
             <div className="flex-1 flex flex-col min-h-0 pb-8">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={currentStepIndex}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.3, ease: "easeInOut" }}
                   className={cn(
                     "w-full space-y-6",
                     dayConfig.layout === 'card' && "p-6 rounded-3xl shadow-sm"
                   )}
                   style={dayConfig.layout === 'card' ? { backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' } : undefined}
                 >
                   {/* Per-block boundary. Without it the nearest boundary is the
                       ROUTE (App.tsx:512), so one malformed block — a clinical
                       item with no scale_ref, an input-table with no columns —
                       unmounted the whole player and discarded every response
                       the user had typed on the day. The rest of the app is
                       already this granular; Homepage wraps each section
                       individually. The player, the only surface where a user
                       does real work, was the least granular. */}
                   {activeStep && activeStep.blocks.map(block => (
                     <ErrorBoundary
                       key={block.id}
                       fallback={
                         <div
                           className="p-4 rounded-xl"
                           style={{
                             backgroundColor: 'var(--color-bg-card)',
                             border: '1px dashed var(--color-status-danger)',
                           }}
                         >
                           <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                             This step couldn’t be displayed
                           </p>
                           <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                             The rest of the day still works, and anything you’ve already
                             entered has been kept. You can continue past this one.
                           </p>
                         </div>
                       }
                     >
                       <BlockRenderer 
                         block={block}
                         value={responses[block.id]}
                         onChange={(val) => handleBlockChange(block.id, val)}
                         readOnly={mode === 'preview'}
                         equipId={program.id}
                         dayNum={activeDay?.day}
                         priorEntries={priorEntriesFor(block)}
                       />
                     </ErrorBoundary>
                   ))}
                 </motion.div>
               </AnimatePresence>
             </div>
          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════════
            FOOTER — Primary CTA
            ═══════════════════════════════════════════════════════════ */}
        <footer
          className="flex-none"
          style={{
            padding: '16px 24px',
            paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
            backgroundColor: 'var(--color-bg-card)',
            borderTop: '1px solid var(--color-border-default)',
            zIndex: 50,
          }}
        >
          <div className="max-w-2xl mx-auto w-full" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Primary Action */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!isStepValid}
              style={{
                width: '100%', height: 52, borderRadius: 'var(--radius-lg)',
                backgroundColor: isStepValid ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
                color: isStepValid ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                border: 'none', cursor: isStepValid ? 'pointer' : 'not-allowed',
                ...f('base', 500, isStepValid ? 'var(--color-text-inverse)' : 'var(--color-text-muted)'),
                boxShadow: isStepValid ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
                opacity: isStepValid ? 1 : 0.6,
              }}
            >
              {primaryButtonFor(dayConfig, currentStepIndex === steps.length - 1)}
            </motion.button>
          </div>
        </footer>
      </div>
    </>
  );
}