import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EquipProgram, DayContent, Activity, DEFAULT_CHECKIN_CONFIG, resolveInteraction } from '../../lib/equip-admin-types';
import { BlockRenderer } from './BlockRenderer';
import { ProgramCheckIn } from '../equip/ProgramCheckIn';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { ChevronLeft, Check, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';

interface ProgramPlayerProps {
  program: EquipProgram;
  initialDay?: number;
  initialResponses?: Record<string, any>;
  onComplete: (results: PlayerResults) => void;
  onProgressChange?: (progress: { currentBlockIndex: number, responses: Record<string, any> }) => void;
  onExit: () => void;
  mode?: 'preview' | 'live';
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
interface DayTypeConfig {
  layout: 'centered' | 'card' | 'scrollable' | 'compact' | 'step-focus';
  showBack: boolean;
  autoAdvance: boolean;
  progressStyle: 'percentage' | 'steps' | 'none';
  primaryButtonText: (isLast: boolean) => string;
  singlePage?: boolean;
  bgColor?: string;
}

const DAY_TYPE_CONFIG: Record<string, DayTypeConfig> = {
  'assessment': {
    layout: 'centered',
    showBack: false,
    autoAdvance: true,
    progressStyle: 'steps',
    primaryButtonText: (last) => last ? 'Complete' : 'Continue',
    bgColor: 'bg-[var(--color-bg-page)]'
  },
  'assessment-lite': {
    layout: 'card',
    showBack: true,
    autoAdvance: true,
    progressStyle: 'percentage',
    primaryButtonText: (last) => last ? 'Complete' : 'Next',
    bgColor: 'bg-[var(--color-bg-card)]'
  },
  'learning': {
    layout: 'scrollable',
    showBack: true,
    autoAdvance: false,
    progressStyle: 'percentage',
    primaryButtonText: (last) => 'Continue',
    bgColor: 'bg-[var(--color-bg-page)]'
  },
  'practice': {
    layout: 'scrollable',
    showBack: true,
    autoAdvance: false,
    progressStyle: 'percentage',
    primaryButtonText: (last) => last ? 'Done for Today' : 'Next',
    bgColor: 'bg-[var(--color-bg-page)]'
  },
  'workshop': {
    layout: 'step-focus',
    showBack: true,
    autoAdvance: false,
    progressStyle: 'steps',
    primaryButtonText: (last) => last ? 'Finish' : 'Continue',
    bgColor: 'bg-[var(--color-bg-card)]'
  },
  'tracker': {
    layout: 'compact',
    showBack: false,
    autoAdvance: false,
    progressStyle: 'none',
    primaryButtonText: (last) => 'Save',
    singlePage: true,
    bgColor: 'bg-[var(--color-bg-page)]'
  },
  'reflection': {
    layout: 'scrollable',
    showBack: true,
    autoAdvance: false,
    progressStyle: 'none',
    primaryButtonText: (last) => 'Complete Reflection',
    bgColor: 'bg-[var(--color-bg-page)]'
  }
};

const DEFAULT_CONFIG = DAY_TYPE_CONFIG['learning'];

// ── Font helper ─────────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

const groupBlocksIntoSteps = (activities: Activity[], dayType: string = 'learning'): Step[] => {
  const config = DAY_TYPE_CONFIG[dayType] || DEFAULT_CONFIG;
  
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
  mode = 'live' 
}: ProgramPlayerProps) {
  const { showToast } = useNotifications();

  const [currentDayNum, setCurrentDayNum] = useState(initialDay);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [isDayComplete, setIsDayComplete] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const activeDay = useMemo(() => 
    program.daily_content.find(d => d.day === currentDayNum), 
  [program.daily_content, currentDayNum]);

  const dayConfig = useMemo(() => {
    if (!activeDay) return DEFAULT_CONFIG;
    return DAY_TYPE_CONFIG[activeDay.dayType || 'learning'] || DEFAULT_CONFIG;
  }, [activeDay]);

  const steps = useMemo(() => 
    activeDay ? groupBlocksIntoSteps(activeDay.activities, activeDay.dayType) : [], 
  [activeDay]);

  const activeStep = steps[currentStepIndex];

  const progressPercent = steps.length > 0 ? ((currentStepIndex) / steps.length) * 100 : 0;
  const progressText = `${currentStepIndex + 1} of ${steps.length}`;

  const isStepValid = useMemo(() => {
    if (!activeStep) return false;
    return activeStep.blocks.every(block => {
      const interaction = resolveInteraction(block);
      // Content/read blocks are always valid (no user input needed)
      if (['read', 'complete', 'watch'].includes(interaction)) {
        return true;
      }
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
        
        // Use interaction taxonomy for auto-advance decisions
        const interaction = targetBlock ? resolveInteraction(targetBlock) : null;
        const shouldAutoAdvance = targetBlock?.autoAdvance || 
          interaction === 'select-one';  // single-selection interactions auto-advance

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
      // Determine check-in trigger from program config (or legacy defaults)
      const config = program.checkInConfig ?? DEFAULT_CHECKIN_CONFIG;
      const isLastDay = program.daily_content.length === currentDayNum;

      const shouldCheckIn = config.enabled && (
        config.triggerDays.includes(currentDayNum) ||
        (config.triggerOnLastDay && isLastDay)
      );

      if (shouldCheckIn && !showCheckIn) {
        setShowCheckIn(true);
      } else {
        setIsDayComplete(true);
      }
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

    if (program.daily_content.length === 1 && activeDay?.activities.some(b => b.exerciseConfig?.scoring?.enabled)) {
      let totalScore = 0;
      const scores: Record<string, number> = {};
      
      activeDay.activities.forEach(block => {
        const config = block.exerciseConfig;
        const answer = responses[block.id];
        
        if (config?.scoring?.enabled && answer) {
           if (config.correctAnswer && answer === config.correctAnswer) {
             const points = config.scoring.maxScore || 1;
             scores[block.id] = points;
             totalScore += points;
           }
           else if (config.scoring.weights && config.options) {
             if (Array.isArray(answer)) {
               answer.forEach((ans: string) => {
                 const idx = config.options!.indexOf(ans);
                 if (idx !== -1 && typeof config.scoring!.weights![idx] === 'number') {
                   const points = config.scoring!.weights![idx];
                   scores[block.id] = (scores[block.id] || 0) + points;
                   totalScore += points;
                 }
               });
             } else {
               const optionIndex = config.options.indexOf(answer);
               if (optionIndex !== -1 && typeof config.scoring.weights[optionIndex] === 'number') {
                 const points = config.scoring.weights[optionIndex];
                 scores[block.id] = points;
                 totalScore += points;
               }
             }
           }
        }
      });
      results.scores = scores;
      results.totalScore = totalScore;
    }

    onComplete(results);
  };

  // --- RENDER ---

  if (!activeDay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h2 style={{ ...f('xl', 500), marginBottom: 8 }}>Day {currentDayNum} Not Found</h2>
        <Button onClick={onExit} variant="outline">Back to Home</Button>
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
                {activeDay.dayType === 'practice' ? 'All Done!' : 'Session Complete'}
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
  const displayTitle = program.title || activeDay.title || (activeDay.dayType === 'practice' ? 'Assessment' : `Day ${currentDayNum}`);
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
                  width: 40, height: 40, borderRadius: 20,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                }}
              >
                <ChevronLeft size={22} strokeWidth={2} />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onExit}
                className="flex items-center justify-center"
                style={{
                  width: 36, height: 36, borderRadius: 18,
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
                   {activeStep && activeStep.blocks.map(block => (
                     <BlockRenderer 
                       key={block.id}
                       block={block}
                       value={responses[block.id]}
                       onChange={(val) => handleBlockChange(block.id, val)}
                       readOnly={mode === 'preview'}
                       equipId={program.id}
                       dayNum={activeDay?.day}
                     />
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
              {dayConfig.primaryButtonText(currentStepIndex === steps.length - 1)}
            </motion.button>
          </div>
        </footer>
      </div>

      <ProgramCheckIn
        programId={program.id}
        programTitle={program.checkInConfig?.customTitle || program.title}
        currentDay={currentDayNum}
        isOpen={showCheckIn}
        onClose={() => {
          setShowCheckIn(false);
          setIsDayComplete(true);
        }}
      />
    </>
  );
}