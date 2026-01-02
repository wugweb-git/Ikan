import React, { useState, useEffect, useMemo } from 'react';
import { EquipProgram, DayContent, Activity } from '../../lib/equip-admin-types';
import { BlockRenderer } from './BlockRenderer';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { ChevronLeft, ChevronRight, Check, X, Menu } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';

interface ProgramPlayerProps {
  program: EquipProgram;
  initialDay?: number; // 1-based day number
  initialResponses?: Record<string, any>; // For resuming
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

const groupBlocksIntoSteps = (activities: Activity[]): Step[] => {
  const steps: Step[] = [];
  
  activities.forEach(block => {
    const lastStep = steps[steps.length - 1];
    
    // Check if block belongs to same group as last step
    if (block.stepGroup && lastStep && lastStep.blocks[0]?.stepGroup === block.stepGroup) {
      lastStep.blocks.push(block);
    } else {
      // Create new step
      steps.push({
        id: block.stepGroup || block.id,
        blocks: [block]
      });
    }
  });
  
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

  // --- DERIVED STATE ---
  const activeDay = useMemo(() => 
    program.daily_content.find(d => d.day === currentDayNum), 
  [program.daily_content, currentDayNum]);

  // Group blocks into steps
  const steps = useMemo(() => 
    activeDay ? groupBlocksIntoSteps(activeDay.activities) : [], 
  [activeDay]);

  const activeStep = steps[currentStepIndex];

  // Calculate progress based on Steps
  const progress = steps.length > 0 ? ((currentStepIndex) / steps.length) * 100 : 0;

  // Validation: Are all required blocks in current step answered?
  const isStepValid = useMemo(() => {
    if (!activeStep) return false;
    return activeStep.blocks.every(block => {
      if (!block.required) return true;
      const value = responses[block.id];
      // Basic empty check (adjust based on type if needed)
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
    // Note: We might want to pass step index instead of block index now, but sticking to prop contract
    // We map step index roughly to block index for compatibility if needed, or just pass 0
    onProgressChange?.({ 
      currentBlockIndex: currentStepIndex, 
      responses: newResponses 
    });

    // Auto-advance logic
    // Rule: If ANY block in step has autoAdvance=true, auto-advance when step is VALID
    // We check validity with the NEW value immediately
    const targetBlock = activeStep?.blocks.find(b => b.id === blockId);
    if (targetBlock?.autoAdvance) {
      // Re-validate with new value
      const stepValidWithNewValue = activeStep?.blocks.every(block => {
        if (!block.required) return true;
        const val = block.id === blockId ? value : responses[block.id];
        return val !== undefined && val !== null && val !== '';
      });

      if (stepValidWithNewValue) {
        setTimeout(() => handleNext(), 400); // Small delay for UX
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
           // Basic scoring logic implementation
           // 1. MCQ with correct answer
           if (config.correctAnswer && answer === config.correctAnswer) {
             const points = config.scoring.maxScore || 1;
             scores[block.id] = points;
             totalScore += points;
           }
           // 2. MCQ with weights (answer mapped to index or value)
           else if (config.scoring.weights && config.options) {
             // Handle array answers (multi-select)
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
               // Handle single answer
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <Check size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeDay.dayType === 'practice' ? 'Session Complete' : 'Day Complete!'}
            </h2>
            <p className="text-gray-500 mt-2">
              You've completed {activeDay.title}. Great job taking time for yourself today.
            </p>
          </div>
          
          <Button onClick={handleFinishDay} size="lg" className="w-full">
            {program.daily_content.length === 1 ? 'View Results' : 'Continue'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onExit} className="-ml-2">
            <X size={20} className="text-gray-500" />
          </Button>
          
          <div className="flex-1 mx-8 max-w-xs">
            <div className="flex justify-between text-xs font-medium text-gray-400 mb-1.5">
               <span>
                 {activeDay.day === 0 ? 'Onboarding' : 
                  activeDay.dayType === 'practice' ? 'Assessment' : 
                  `Day ${currentDayNum}`}
               </span>
               <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* BODY */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {activeStep && activeStep.blocks.map(block => (
          <BlockRenderer 
            key={block.id}
            block={block}
            value={responses[block.id]}
            onChange={(val) => handleBlockChange(block.id, val)}
            readOnly={mode === 'preview'}
          />
        ))}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t p-4 pb-8 md:pb-6 sticky bottom-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={currentStepIndex === 0 ? 'invisible' : ''}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button 
            onClick={handleNext}
            className={cn(
              "min-w-[120px]",
              // Hide Next button on mobile (except for Finish step) as requested
              currentStepIndex < steps.length - 1 ? "hidden md:flex" : ""
            )}
            disabled={!isStepValid}
          >
            {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
            {currentStepIndex !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}