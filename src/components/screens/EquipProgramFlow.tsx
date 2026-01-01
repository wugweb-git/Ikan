import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle, Play, Clock, X 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { cn } from '../ui/utils';
import { EquipProgram, Activity, DayContent } from '../../lib/equip-admin-types';
import { Wizard } from '../wizard/Wizard';
import { mapEquipDayToWizard } from '../wizard/migration-utils';
import { WizardState } from '../wizard/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UserProgress {
  currentDay: number; // 1-based index
  completedDays: Record<number, { status: 'completed' | 'skipped'; date: string }>;
  currentDayState: {
    completedBlockIds: string[];
    responses: Record<string, any>;
  };
}

interface EquipProgramFlowProps {
  programId?: string;
  enrollmentId?: string;
  onBack?: () => void;
  onComplete?: () => void;
}

// ============================================================================
// COMPONENT 1: HOME (ENTRY POINT)
// ============================================================================

interface EquipProgramHomeProps {
  program: EquipProgram;
  progress: UserProgress;
  onStartSession: () => void;
  onViewHistory: () => void;
  onBack: () => void;
}

function EquipProgramHome({ program, progress, onStartSession, onViewHistory, onBack }: EquipProgramHomeProps) {
  const currentDayContent = program.daily_content?.find(d => d.day === progress.currentDay);
  const isProgramComplete = progress.currentDay > (program.daily_content?.length || 0);

  // Resume vs Start logic
  const hasStartedDay = progress.currentDayState.completedBlockIds.length > 0;
  
  return (
    <div className="min-h-screen bg-[var(--ikan-color-bg-page)] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[var(--ikan-color-accent-default)] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto w-full p-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={onBack} size="sm" className="-ml-3 text-[var(--ikan-color-text-muted)]">
            <ArrowLeft size={20} />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center pb-20">
          {isProgramComplete ? (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-green-50 text-[var(--ikan-color-status-success)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--ikan-color-text-primary)]">Journey Complete!</h1>
              <p className="text-[var(--ikan-color-text-muted)]">You've completed {program.title}.</p>
              <Button className="w-full h-14 text-lg" onClick={onViewHistory}>
                Review Your Path
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-sm font-semibold tracking-widest text-[var(--ikan-color-text-muted)] uppercase">
                  {program.title}
                </h2>
                <h1 className="text-4xl font-bold text-[var(--ikan-color-text-primary)]">
                  {currentDayContent?.dayType === 'practice' ? "Practice" : `Day ${progress.currentDay}`}
                </h1>
                <p className="text-lg text-[var(--ikan-color-text-muted)]">
                  of {program.daily_content?.length || 18}
                </p>
              </div>

              {currentDayContent ? (
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-[var(--ikan-color-text-primary)]">
                        {currentDayContent.title}
                      </h3>
                      {currentDayContent.description && (
                        <p className="text-[var(--ikan-color-text-muted)] text-sm">
                          {currentDayContent.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-[var(--ikan-color-text-muted)] bg-[var(--ikan-color-bg-muted)] py-2 px-4 rounded-full inline-flex mx-auto">
                      <Clock size={16} />
                      <span>~10 minutes</span>
                    </div>

                    <Button 
                      onClick={onStartSession}
                      className="w-full h-14 text-lg rounded-xl bg-[var(--ikan-color-primary-default)] text-white shadow-lg transition-all transform hover:scale-[1.02]"
                    >
                      <Play fill="currentColor" size={16} className="mr-2" />
                      {hasStartedDay ? "Continue Session" : currentDayContent.dayType === 'practice' ? "Start Practice" : "Start Today"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center p-8 bg-[var(--ikan-color-bg-muted)] rounded-xl border border-dashed border-[var(--ikan-color-border-default)]">
                  <p className="text-[var(--ikan-color-text-muted)]">Content loading or not found for Day {progress.currentDay}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={onViewHistory}
            className="text-gray-500 hover:text-gray-900 hover:bg-transparent"
          >
            View past days
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 2: DAY SESSION (WIZARD RUNTIME)
// ============================================================================

interface DaySessionScreenProps {
  dayContent: DayContent;
  progress: UserProgress;
  onCompleteBlock: (blockId: string, response?: any) => void;
  onCompleteDay: () => void;
  onExit: () => void;
}

function DaySessionScreen({ dayContent, progress, onCompleteBlock, onCompleteDay, onExit }: DaySessionScreenProps) {
  const wizardConfig = mapEquipDayToWizard(dayContent);

  // Sync Wizard progress with parent state
  const handleStepChange = (state: WizardState) => {
    // Check for newly completed steps
    state.completedSteps.forEach(stepId => {
       if (stepId === 'intro') return; // Skip intro
       
       // If not already marked complete in parent
       if (!progress.currentDayState.completedBlockIds.includes(stepId)) {
           // Find the answer for this step/block
           // Note: In our mapping, field IDs are often prefixed or just the stepId if it was simple
           // But complex steps have fields like `${stepId}_answer`.
           // We need to extract the relevant answer.
           
           // Simple approach: Pass all answers related to this step
           const stepAnswers: Record<string, any> = {};
           Object.keys(state.answers).forEach(key => {
               if (key.startsWith(stepId)) {
                   stepAnswers[key] = state.answers[key];
               }
           });
           
           // If single answer (e.g. text/mcq), pass value directly to match old behavior if possible
           // or just pass the object. The backend should handle structured data.
           // For backward compatibility, let's try to pass the "main" value if it exists.
           const mainValue = state.answers[`${stepId}_answer`] || state.answers[stepId];
           
           onCompleteBlock(stepId, mainValue || stepAnswers);
       }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col">
       <Wizard 
         config={wizardConfig}
         initialData={progress.currentDayState.responses}
         // Map initial step based on progress?
         // Wizard uses index, we have block IDs.
         // We can find the first uncompleted block index in dayContent.activities
         initialStepIndex={Math.max(0, dayContent.activities.findIndex(a => !progress.currentDayState.completedBlockIds.includes(a.id))) + 1} // +1 for intro
         onStepChange={handleStepChange}
         onComplete={() => onCompleteDay()}
         onExit={onExit}
         className="bg-transparent"
       />
    </div>
  );
}

// ============================================================================
// COMPONENT 14: DAY OVERVIEW (HISTORY)
// ============================================================================

function DayOverview({ program, progress, onBack, onSelectDay }: { program: EquipProgram, progress: UserProgress, onBack: () => void, onSelectDay: (day: number) => void }) {
  const getStatus = (day: number) => {
    if (progress.completedDays[day]) return progress.completedDays[day].status;
    if (day === progress.currentDay) return 'current';
    if (day < progress.currentDay) return 'skipped';
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-[var(--ikan-color-bg-page)] p-6">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex items-center gap-4">
           <Button variant="ghost" onClick={onBack} className="-ml-3"><ArrowLeft /></Button>
           <h1 className="text-2xl font-bold">Your Journey</h1>
        </div>

        <div className="space-y-4">
          {program.daily_content?.map((day) => {
             const status = getStatus(day.day);
             return (
               <div 
                 key={day.day}
                 onClick={() => status !== 'locked' && onSelectDay(day.day)}
                 className={cn(
                   "p-4 rounded-xl border flex items-center justify-between transition-all",
                   status === 'current' ? "border-[var(--ikan-color-primary-default)] bg-white shadow-md" :
                   status === 'locked' ? "opacity-50 bg-[var(--ikan-color-bg-muted)] border-transparent" :
                   "bg-white border-transparent hover:border-[var(--ikan-color-border-default)] cursor-pointer"
                 )}
               >
                  <div className="flex items-center gap-4">
                     <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        status === 'completed' ? "bg-[var(--ikan-color-status-success)] text-white" :
                        status === 'current' ? "bg-[var(--ikan-color-primary-default)] text-white" :
                        "bg-[var(--ikan-color-bg-muted)] text-[var(--ikan-color-text-muted)]"
                     )}>
                        {status === 'completed' ? <CheckCircle size={20} /> : day.day}
                     </div>
                     <div>
                        <div className="font-semibold text-[var(--ikan-color-text-primary)]">{day.title}</div>
                        <div className="text-xs text-[var(--ikan-color-text-muted)]">{day.dayType === 'practice' ? 'Practice Session' : `${day.activities.length} Activities`}</div>
                     </div>
                  </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: EQUIP PROGRAM FLOW
// ============================================================================

export function EquipProgramFlow({ programId, enrollmentId, onBack, onComplete }: EquipProgramFlowProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'session' | 'history'>('home');
  
  // Dummy data for now - in real app would fetch from API based on enrollmentId
  const [program, setProgram] = useState<EquipProgram | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    currentDay: 1,
    completedDays: {},
    currentDayState: {
      completedBlockIds: [],
      responses: {}
    }
  });

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
       // Mock Program
       setProgram({
         id: 'sleep-tight-9',
         slug: 'sleep-tight-9',
         title: 'Sleep Tight',
         description: 'A 9-day program to improve your sleep.',
         daily_content: [
           { day: 1, title: 'Understanding Sleep', dayType: 'lesson', activities: [
             { id: 'l1', type: 'lesson', title: 'Why we sleep', content: 'Sleep is essential...' },
             { id: 'e1', type: 'exercise', title: 'Sleep Quiz', content: 'How many hours?', exerciseConfig: { subtype: 'mcq', options: ['<6', '6-8', '8+'] } }
           ]},
           { day: 2, title: 'Sleep Hygiene', dayType: 'lesson', activities: [
             { id: 'l2', type: 'lesson', title: 'Clean your room', content: 'Remove distractions.' },
             { id: 'sd2', type: 'sleep_diary', title: 'Last Night Log', content: '' }
           ]}
         ]
       } as any);
       setLoading(false);
    }, 1000);
  }, [programId]);

  if (loading || !program) return <div className="flex h-screen items-center justify-center">Loading program...</div>;

  const currentDayContent = program.daily_content?.find(d => d.day === progress.currentDay);

  const handleCompleteBlock = (blockId: string, response: any) => {
     setProgress(prev => ({
        ...prev,
        currentDayState: {
           completedBlockIds: [...prev.currentDayState.completedBlockIds, blockId],
           responses: { ...prev.currentDayState.responses, [blockId]: response }
        }
     }));
  };

  const handleCompleteDay = () => {
     showToast('success', 'Day Complete!', 'Great job.');
     setProgress(prev => ({
        ...prev,
        currentDay: prev.currentDay + 1,
        completedDays: {
           ...prev.completedDays,
           [prev.currentDay]: { status: 'completed', date: new Date().toISOString() }
        },
        currentDayState: {
           completedBlockIds: [],
           responses: {}
        }
     }));
     setView('home');
  };

  return (
    <>
      {view === 'home' && (
        <EquipProgramHome 
           program={program} 
           progress={progress}
           onStartSession={() => setView('session')}
           onViewHistory={() => setView('history')}
           onBack={onBack || (() => {})}
        />
      )}

      {view === 'session' && currentDayContent && (
        <DaySessionScreen 
           dayContent={currentDayContent}
           progress={progress}
           onCompleteBlock={handleCompleteBlock}
           onCompleteDay={handleCompleteDay}
           onExit={() => setView('home')}
        />
      )}

      {view === 'history' && (
        <DayOverview 
           program={program}
           progress={progress}
           onBack={() => setView('home')}
           onSelectDay={(day) => {
              // Allow replaying old days? For now just log
              console.log('Selected day', day);
           }}
        />
      )}
    </>
  );
}
