import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EquipProgram, DayContent, Activity, ExerciseConfig } from '../../lib/equip-admin-types';
import { BlockRenderer } from './BlockRenderer';
import { ProgramCheckIn } from '../equip/ProgramCheckIn';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { ChevronLeft, Check, X, Settings } from 'lucide-react';
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
  responses: Record<string, any>; // blockId -> value
  scores?: Record<string, number>;
  totalScore?: number;
  completedAt: string;
}

// Helper to group blocks into steps
interface Step {
  id: string; // stepGroupId or blockId
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
    bgColor: 'bg-[#F2F2F7]' // Neutral
  },
  'assessment-lite': {
    layout: 'card',
    showBack: true,
    autoAdvance: true,
    progressStyle: 'percentage',
    primaryButtonText: (last) => last ? 'Complete' : 'Next',
    bgColor: 'bg-white' // Friendly
  },
  'learning': {
    layout: 'scrollable',
    showBack: true,
    autoAdvance: false,
    progressStyle: 'percentage',
    primaryButtonText: (last) => 'Continue',
    bgColor: 'bg-[#F9FAFB]' // Clean
  },
  'practice': {
    layout: 'scrollable',
    showBack: true,
    autoAdvance: false,
    progressStyle: 'percentage',
    primaryButtonText: (last) => last ? 'Done for Today' : 'Next',
    bgColor: 'bg-stone-50' // Warm/Safe
  },
  'workshop': {
    layout: 'step-focus',
    showBack: true,
    autoAdvance: false,
    progressStyle: 'steps',
    primaryButtonText: (last) => last ? 'Finish' : 'Continue',
    bgColor: 'bg-white'
  },
  'tracker': {
    layout: 'compact',
    showBack: false,
    autoAdvance: false,
    progressStyle: 'none',
    primaryButtonText: (last) => 'Save',
    singlePage: true,
    bgColor: 'bg-[#F2F2F7]'
  },
  'reflection': {
    layout: 'scrollable',
    showBack: true,
    autoAdvance: false,
    progressStyle: 'none',
    primaryButtonText: (last) => 'Complete Reflection',
    bgColor: 'bg-indigo-50/30' // Calm
  }
};

const DEFAULT_CONFIG = DAY_TYPE_CONFIG['learning'];

const groupBlocksIntoSteps = (activities: Activity[], dayType: string = 'learning'): Step[] => {
  const config = DAY_TYPE_CONFIG[dayType] || DEFAULT_CONFIG;
  
  // 1. Tracker/Single Page Mode: All blocks in one step
  if (config.singlePage) {
    return [{ id: 'single-page', blocks: activities }];
  }

  // 2. Group by stepGroup
  const steps: Step[] = [];
  let currentStep: Step | null = null;

  activities.forEach((block, index) => {
    // If block has a stepGroup, try to merge with current if same group
    if (block.stepGroup) {
      if (currentStep && currentStep.id === block.stepGroup) {
         currentStep.blocks.push(block);
      } else {
         // Start new group step
         if (currentStep) steps.push(currentStep);
         currentStep = { id: block.stepGroup, blocks: [block] };
      }
    } else {
      // No step group -> acts as individual step (One per frame rule)
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

  // --- STATE ---
  const [currentDayNum, setCurrentDayNum] = useState(initialDay);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Tracking Steps, not Blocks
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [isDayComplete, setIsDayComplete] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  // --- DERIVED STATE ---
  const activeDay = useMemo(() => 
    program.daily_content.find(d => d.day === currentDayNum), 
  [program.daily_content, currentDayNum]);

  const dayConfig = useMemo(() => {
    if (!activeDay) return DEFAULT_CONFIG;
    return DAY_TYPE_CONFIG[activeDay.dayType || 'learning'] || DEFAULT_CONFIG;
  }, [activeDay]);

  // Group blocks into steps
  const steps = useMemo(() => 
    activeDay ? groupBlocksIntoSteps(activeDay.activities, activeDay.dayType) : [], 
  [activeDay]);

  const activeStep = steps[currentStepIndex];

  // Calculate progress
  const progressPercent = steps.length > 0 ? ((currentStepIndex) / steps.length) * 100 : 0;
  const progressText = `${currentStepIndex + 1} of ${steps.length}`;

  // Validation: Are all required blocks in current step answered?
  const isStepValid = useMemo(() => {
    if (!activeStep) return false;
    return activeStep.blocks.every(block => {
      // 1. Non-interactive blocks are always valid
      if (['lesson', 'content', 'conclude', 'video', 'media', 'info'].includes(block.type)) {
         return true;
      }
      
      // 2. Interactive blocks check
      if (!block.required) return true;
      const value = responses[block.id];
      // Basic empty check
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    });
  }, [activeStep, responses]);

  // --- ACTIONS ---

  const handleBlockChange = (blockId: string, value: any) => {
    const newResponses = {
      ...responses,
      [blockId]: value
    };
    setResponses(newResponses);
    
    // Notify parent
    onProgressChange?.({ 
      currentBlockIndex: currentStepIndex, 
      responses: newResponses 
    });

    // Auto-advance logic
    // Only if allowed by DayType AND Block/Config allows it
    if (dayConfig.autoAdvance) {
      const targetBlock = activeStep?.blocks.find(b => b.id === blockId);
      
      const shouldAutoAdvance = targetBlock?.autoAdvance || 
        (targetBlock?.exerciseConfig?.subtype === 'mcq') ||
        (targetBlock?.exerciseConfig?.subtype === 'single-select');

      if (shouldAutoAdvance) {
        // Re-validate with new value
        const stepValidWithNewValue = activeStep?.blocks.every(block => {
          if (!block.required) return true;
          const val = block.id === blockId ? value : responses[block.id];
          if (Array.isArray(val)) return val.length > 0;
          return val !== undefined && val !== null && val !== '';
        });

        if (stepValidWithNewValue) {
          setTimeout(() => handleNext(), 300); // Small delay for UX
        }
      }
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // End of Day
      // Check if this day triggers a program effectiveness check-in
      const checkInDays = [7, 14, 30];
      const isCheckInDay = checkInDays.includes(currentDayNum);
      const isLastDay = program.daily_content.length === currentDayNum;

      if ((isCheckInDay || isLastDay) && !showCheckIn) {
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
    if (isDayComplete) { 
        // Already marked complete
    }

    // Calculate results
    const results: PlayerResults = {
      programId: program.id,
      completedDays: [currentDayNum], 
      responses,
      completedAt: new Date().toISOString()
    };

    // If assessment (single day) or scoring enabled, calculate score
    if (program.daily_content.length === 1 && activeDay?.activities.some(b => b.exerciseConfig?.scoring?.enabled)) {
      let totalScore = 0;
      const scores: Record<string, number> = {};
      
      activeDay.activities.forEach(block => {
        const config = block.exerciseConfig;
        const answer = responses[block.id];
        
        if (config?.scoring?.enabled && answer) {
           // Scoring logic
           if (config.correctAnswer && answer === config.correctAnswer) {
             const points = config.scoring.maxScore || 1;
             scores[block.id] = points;
             totalScore += points;
           }
           else if (config.scoring.weights && config.options) {
             if (Array.isArray(answer)) {
               answer.forEach(ans => {
                 const idx = config.options!.indexOf(ans);
                 if (idx !== -1 && config.scoring!.weights![idx]) {
                   const points = config.scoring!.weights![idx];
                   scores[block.id] = (scores[block.id] || 0) + points;
                   totalScore += points;
                 }
               });
             } else {
               const optionIndex = config.options.indexOf(answer);
               if (optionIndex !== -1 && config.scoring.weights[optionIndex]) {
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
        <h2 className="text-xl font-semibold mb-2">Day {currentDayNum} Not Found</h2>
        <Button onClick={onExit} variant="outline">Back to Home</Button>
      </div>
    );
  }

  // Completed Day Screen
  if (isDayComplete) {
    return (
      <div className="fixed inset-0 bg-[#F5F5F5] z-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm bg-white rounded-[32px] shadow-xl shadow-black/5 p-10 text-center relative overflow-hidden"
        >
          {/* Decorative Gradient Blob */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            {/* Success Icon Animation */}
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="w-24 h-24 mx-auto bg-[#F0FDF4] rounded-full flex items-center justify-center shadow-inner"
            >
               <Check size={40} className="text-[#16A34A]" strokeWidth={3.5} />
            </motion.div>

            <div className="space-y-3">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[28px] font-bold text-[#151515] font-['Ubuntu'] tracking-tight"
              >
                {activeDay.dayType === 'practice' ? 'All Done!' : 'Session Complete'}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[#717182] text-[16px] leading-relaxed font-normal"
              >
                Great job taking a moment for yourself. Your results are ready.
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                onClick={handleFinishDay} 
                className="w-full h-14 text-[17px] font-medium rounded-[20px] bg-[#2A2A2A] text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
              >
                {program.daily_content.length === 1 ? 'View Results' : 'Continue Journey'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Determine title to display
  const displayTitle = program.title || activeDay.title || (activeDay.dayType === 'practice' ? 'Assessment' : `Day ${currentDayNum}`);

  return (
    <>
      <div className={cn("fixed inset-0 flex flex-col font-['Ubuntu'] text-[#1C1C1E]", dayConfig.bgColor || 'bg-[#F2F2F7]')}>
        {/* HEADER */}
        <header className="flex-none bg-white/80 backdrop-blur-xl border-b border-black/[0.05] h-[60px] px-4 md:px-6 flex items-center justify-between z-50 relative">
          {/* Left: Close */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onExit} 
            className="text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-black/5 rounded-full w-10 h-10 transition-colors"
          >
            <X size={22} strokeWidth={2.5} />
          </Button>
          
          {/* Center: Title */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[60%] text-center">
            <h1 className="text-[15px] font-semibold text-[#1C1C1E] truncate tracking-tight">
               {displayTitle}
            </h1>
          </div>

          {/* Right: Progress Pill */}
          {dayConfig.progressStyle !== 'none' && (
            <div className="flex items-center gap-3">
              <div className="bg-black/[0.05] h-8 px-3 rounded-full flex items-center gap-2">
                 {dayConfig.progressStyle === 'percentage' && (
                   <div className="w-12 h-1 bg-black/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#151515] rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ ease: "easeOut", duration: 0.5 }}
                      />
                   </div>
                 )}
                 <span className="text-[12px] font-semibold text-[#8E8E93] tabular-nums">
                    {dayConfig.progressStyle === 'percentage' 
                      ? `${Math.round(progressPercent)}%` 
                      : progressText}
                 </span>
              </div>
            </div>
          )}
        </header>

        {/* BODY */}
        <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col relative overflow-hidden">
          {/* Content Container */}
          <div className={cn(
             "flex-1 w-full flex flex-col px-4 md:px-8 overflow-y-auto scrollbar-hide py-6",
             // Layout Adjustments based on dayConfig
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
                     dayConfig.layout === 'card' && "bg-white p-6 rounded-3xl shadow-sm border border-black/5"
                   )}
                 >
                   {activeStep && activeStep.blocks.map(block => (
                     <BlockRenderer 
                       key={block.id}
                       block={block}
                       value={responses[block.id]}
                       onChange={(val) => handleBlockChange(block.id, val)}
                       readOnly={mode === 'preview'}
                     />
                   ))}
                 </motion.div>
               </AnimatePresence>
             </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="flex-none bg-white border-t border-black/[0.05] px-6 py-6 pb-8 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <div className="max-w-2xl mx-auto w-full space-y-4">
            
            {/* Primary Action */}
            <Button 
              onClick={handleNext}
              className={cn(
                "w-full h-[56px] rounded-[18px] text-[17px] font-semibold transition-all shadow-sm",
                "bg-[#151515] text-white hover:bg-black hover:shadow-md active:scale-[0.98]",
                !isStepValid && "opacity-50 cursor-not-allowed bg-[#E5E5EA] text-[#8E8E93] shadow-none hover:bg-[#E5E5EA] active:scale-100"
              )}
              disabled={!isStepValid}
            >
              {dayConfig.primaryButtonText(currentStepIndex === steps.length - 1)}
            </Button>

            {/* Secondary Actions Row */}
            <div className="flex items-center justify-between px-2 h-6">
               {/* Back Button */}
               <div className="flex-1 text-left">
                  {dayConfig.showBack && currentStepIndex > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="text-[#8E8E93] hover:text-[#1C1C1E] font-medium text-[15px] transition-colors flex items-center gap-1.5 pl-1 py-2"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>
                  )}
               </div>
               
               {/* Skip Button (Conditional) */}
               <div className="flex-1 text-right">
                  {!activeStep?.blocks.every(b => b.required) && (
                    <button
                      onClick={handleNext}
                      className="text-[#8E8E93] hover:text-[#1C1C1E] font-medium text-[15px] transition-colors pr-1 py-2"
                    >
                      Skip
                    </button>
                  )}
               </div>
            </div>

          </div>
        </footer>
      </div>

      <ProgramCheckIn
        programId={program.id}
        programTitle={program.title}
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