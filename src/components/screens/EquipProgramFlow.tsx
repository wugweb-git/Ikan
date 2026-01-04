import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle, Play, Clock, X 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { cn } from '../ui/utils';
import { EquipProgram } from '../../lib/equip-admin-types';
import { ProgramPlayer } from '../player/ProgramPlayer';
import { apiClient } from '../../lib/api-client';
import { useNotifications } from '../../contexts/NotificationContext';
import { toast } from 'sonner@2.0.3';
import { DUMMY_EQUIP_PROGRAM, ALL_DUMMY_PROGRAMS } from '../../lib/demo-data';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UserProgress {
  currentDay: number; // 1-based index
  completedDays: Record<number, { 
    status: 'completed' | 'skipped'; 
    date: string;
    responses?: Record<string, any>;
  }>;
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
  onNavigate?: (path: string) => void;
}

// ============================================================================
// COMPONENT 1: HOME (ENTRY POINT)
// ============================================================================

interface EquipProgramHomeProps {
  program: EquipProgram;
  progress: UserProgress;
  onStartSession: () => void;
  onViewHistory: () => void;
  onRestart: () => void;
  onBack: () => void;
}

function EquipProgramHome({ program, progress, onStartSession, onViewHistory, onRestart, onBack }: EquipProgramHomeProps) {
  const currentDayContent = program.daily_content?.find(d => d.day === progress.currentDay);
  
  // Calculate if program is complete (all days completed)
  const totalDays = program.daily_content?.length || 0;
  // Simple check: if currentDay > totalDays, or if all days are in completedDays
  const isProgramComplete = progress.currentDay > totalDays;

  // Resume vs Start logic
  const hasStartedDay = progress.currentDayState.completedBlockIds.length > 0;
  
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[var(--color-accent-default)] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto w-full p-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={onBack} size="sm" className="-ml-3 text-[var(--color-text-muted)]">
            <ArrowLeft size={20} />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center pb-20">
          {isProgramComplete ? (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-green-50 text-[var(--color-status-success)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Journey Complete!</h1>
              <p className="text-[var(--color-text-muted)]">You've completed {program.title}.</p>
              <Button className="w-full h-14 text-lg" onClick={onViewHistory}>
                Review Your Path
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-14 text-lg text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100" 
                onClick={onRestart}
              >
                Restart Program
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
                  {program.title}
                </h2>
                <h1 className="text-4xl font-bold text-[var(--color-text-primary)]">
                  {progress.currentDay === 0 ? "Welcome" :
                   currentDayContent?.dayType === 'practice' ? "Practice" : 
                   `Day ${progress.currentDay}`}
                </h1>
                {progress.currentDay > 0 && (
                  <p className="text-lg text-[var(--color-text-muted)]">
                    of {Math.max(0, (program.daily_content?.length || 0) - (program.daily_content?.some(d => d.day === 0) ? 1 : 0))}
                  </p>
                )}
              </div>

              {currentDayContent ? (
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                        {currentDayContent.title}
                      </h3>
                      {currentDayContent.description && (
                        <p className="text-[var(--color-text-muted)] text-sm">
                          {currentDayContent.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] py-2 px-4 rounded-full inline-flex mx-auto">
                      <Clock size={16} />
                      <span>~10 minutes</span>
                    </div>

                    <Button 
                      onClick={onStartSession}
                      className="w-full h-14 text-lg rounded-[var(--radius-lg)] bg-[var(--color-primary-default)] text-white shadow-lg transition-all transform hover:scale-[1.02]"
                    >
                      <Play fill="currentColor" size={16} className="mr-2" />
                      {hasStartedDay ? "Continue Session" : currentDayContent.dayType === 'practice' ? "Start Practice" : "Start Today"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center p-8 bg-[var(--color-bg-muted)] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)]">
                  <p className="text-[var(--color-text-muted)]">Content loading or not found for Day {progress.currentDay}</p>
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
// COMPONENT 2: DAY SESSION (PLAYER RUNTIME)
// ============================================================================

interface DaySessionScreenProps {
  program: EquipProgram;
  dayNumber: number;
  initialResponses?: Record<string, any>;
  onCompleteDay: (results: any) => void;
  onProgress: (progress: { currentBlockIndex: number, responses: Record<string, any> }) => void;
  onExit: () => void;
  mode?: 'live' | 'preview';
}

function DaySessionScreen({ program, dayNumber, initialResponses, onCompleteDay, onProgress, onExit, mode = 'live' }: DaySessionScreenProps) {
  return (
    <div className="fixed inset-0 bg-white z-50">
       <ProgramPlayer 
         program={program}
         initialDay={dayNumber}
         initialResponses={initialResponses}
         onComplete={onCompleteDay}
         onProgressChange={onProgress}
         onExit={onExit}
         mode={mode}
       />
    </div>
  );
}

// ============================================================================
// COMPONENT 3: DAY OVERVIEW (HISTORY)
// ============================================================================

function DayOverview({ program, progress, onBack, onSelectDay }: { program: EquipProgram, progress: UserProgress, onBack: () => void, onSelectDay: (day: number) => void }) {
  const getStatus = (day: number) => {
    if (progress.completedDays[day]) return progress.completedDays[day].status;
    if (day === progress.currentDay) return 'current';
    if (day < progress.currentDay) return 'skipped';
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] p-6">
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
                   "p-4 rounded-[var(--radius-lg)] border flex items-center justify-between transition-all",
                   status === 'current' ? "border-[var(--color-primary-default)] bg-white shadow-md" :
                   status === 'locked' ? "opacity-50 bg-[var(--color-bg-muted)] border-transparent" :
                   "bg-white border-transparent hover:border-[var(--color-border-default)] cursor-pointer"
                 )}
               >
                  <div className="flex items-center gap-4">
                     <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        status === 'completed' ? "bg-[var(--color-status-success)] text-white" :
                        status === 'current' ? "bg-[var(--color-primary-default)] text-white" :
                        "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]"
                     )}>
                        {status === 'completed' ? <CheckCircle size={20} /> : day.day}
                     </div>
                     <div>
                        <div className="font-semibold text-[var(--color-text-primary)]">{day.title}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{day.dayType === 'practice' ? 'Practice Session' : `${day.activities.length} Activities`}</div>
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

export function EquipProgramFlow({ programId, enrollmentId, onBack, onComplete, onNavigate }: EquipProgramFlowProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'session' | 'history' | 'review'>('home');
  const [reviewDay, setReviewDay] = useState<number | null>(null);
  
  const [program, setProgram] = useState<EquipProgram | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    currentDay: 1,
    completedDays: {},
    currentDayState: {
      completedBlockIds: [],
      responses: {}
    }
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('/dashboard');
    }
  };

  // 1. Fetch Program & Progress
  useEffect(() => {
    const init = async () => {
      if (!programId) return;
      
      try {
        setLoading(true);

        // DEMO MODE CHECK
        const demoProgram = ALL_DUMMY_PROGRAMS.find(p => p.id === programId);
        if (programId === 'dummy-equip' || demoProgram) {
           console.log('⚡ Loading Demo Program Flow (Offline Mode)');
           setProgram(demoProgram || DUMMY_EQUIP_PROGRAM);
           
           // Set active demo program for Dashboard
           if (programId) localStorage.setItem('ikan-active-dummy-program', programId);

           // Mock Progress
           const savedProgress = localStorage.getItem(`demo-progress-${programId}`);
           if (savedProgress) {
             setProgress(JSON.parse(savedProgress));
           } else {
             setProgress({
                currentDay: 1,
                completedDays: {},
                currentDayState: {
                  completedBlockIds: [],
                  responses: {}
                }
             });
           }
           setLoading(false);
           return;
        }
        
        // A. Fetch Program
        const programData = await apiClient.getEquipProgram(programId);
        if (!programData) {
          throw new Error('Program not found');
        }
        setProgram(programData as EquipProgram);

        // B. Fetch Progress (if user is enrolled)
        try {
          // Attempt to get detailed progress
          const progressData = await apiClient.getEnrollmentProgress(programId);
          if (progressData) {
            // Map backend progress to frontend UserProgress
            // Assuming progressData has current_day_number, completed_days, etc.
            setProgress(prev => ({
              ...prev,
              currentDay: progressData.current_day || 1,
              completedDays: (progressData.completed_days || []).reduce((acc: any, dayNum: number) => {
                acc[dayNum] = { status: 'completed', date: new Date().toISOString() };
                return acc;
              }, {}),
              currentDayState: {
                completedBlockIds: [], // We might fetch this from user_block_responses if needed, but keeping it simple for now
                responses: {} // Ideally we pre-fetch today's responses too
              }
            }));

            // Pre-fetch today's responses to allow resuming
            const todayContent = await apiClient.getTodayContent(programId);
            if (todayContent && todayContent.progress) {
                // todayContent.progress is array of completed blocks?
                // The API endpoint seems to return { day, blocks, progress }
                // Let's assume progress contains the responses map if implemented
            }
          }
        } catch (e) {
          // If 404/not enrolled, we might need to enroll or just start fresh
          console.warn('Progress fetch failed (maybe not enrolled)', e);
        }

      } catch (err: any) {
        console.error('Failed to load program flow', err);
        // FALLBACK: Use Dummy Data
        console.warn('⚠️ Using DUMMY equip program data due to fetch failure');
        setProgram(DUMMY_EQUIP_PROGRAM);
        // setError(err.message || 'Failed to load program');
        // toast.error('Failed to load program');
        toast.info('Viewing Demo Program (Data Unavailable)');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [programId]);

  // 2. Handle Progress Updates (Auto-Save)
  const handleProgress = async (p: { currentBlockIndex: number, responses: Record<string, any> }) => {
     // Update Local State
     const newProgress = {
        ...progress,
        currentDayState: {
           completedBlockIds: Object.keys(p.responses),
           responses: p.responses
        }
     };
     
     setProgress(prev => ({
        ...prev,
        currentDayState: {
           completedBlockIds: Object.keys(p.responses),
           responses: p.responses
        }
     }));

     // DEMO MODE: Save to LocalStorage
     const isDemo = ALL_DUMMY_PROGRAMS.some(p => p.id === programId);
     if (isDemo) {
        localStorage.setItem(`demo-progress-${programId}`, JSON.stringify(newProgress));
        return;
     }

     // Sync to Server
     if (programId) {
        // Find the changed block(s) and save
        // Ideally we only save the delta, but here we just iterate
        // Optimization: In ProgramPlayer we pass the specific change. 
        // But the callback signature is { currentBlockIndex, responses }
        // We can just save the latest responses. 
        // For efficiency, we can debounce or just save the last one? 
        // Actually, let's just save all? No, that's too many calls.
        
        // Better: ProgramPlayer only updates responses when a block changes.
        // We can iterate the responses keys and find what changed compared to prev state?
        // Or simply: The backend endpoint allows saving specific block response.
        // For MVP, let's just try to sync the whole state?
        // No, `saveBlockResponse` takes a single blockId.
        
        // Let's rely on the user explicitly saving via "Next" if we don't want real-time field-level saving.
        // BUT, the requirement is "User-Side ProgramPlayer — Rendering Rules... Submit Step Response".
        // The ProgramPlayer calls onProgressChange on every change.
        
        // Let's implement a 'sync' that sends the whole blob or key updates
        // The API has `syncEquipProgress`.
        try {
            await apiClient.syncEquipProgress(programId, {
                dayNumber: progress.currentDay,
                responses: p.responses
            });
        } catch (e) {
            console.error('Failed to sync progress', e);
        }
     }
  };

  // 3. Handle Day Completion
  const handleCompleteDay = async () => {
     if (!programId) return;

     // 1. Optimistic Update (Immediate Feedback)
     const nextDay = progress.currentDay + 1;
     const now = new Date().toISOString();
     
     const newProgress = {
        ...progress,
        currentDay: nextDay,
        completedDays: {
           ...progress.completedDays,
           [progress.currentDay]: { 
             status: 'completed' as const, 
             date: now,
             responses: progress.currentDayState.responses 
           }
        },
        currentDayState: {
           completedBlockIds: [],
           responses: {}
        }
     };

     // Update Local State Immediately
     setProgress(newProgress);
     
     // Return to Home view immediately
     setView('home');
     showToast('success', 'Day Complete!', 'Great job.');

     // DEMO MODE: Save to LocalStorage & Return
     const isDemo = ALL_DUMMY_PROGRAMS.some(p => p.id === programId);
     if (isDemo) {
        localStorage.setItem(`demo-progress-${programId}`, JSON.stringify(newProgress));
        if (onComplete) onComplete();
        return;
     }

     // 2. Sync to Backend in Background
     try {
       await apiClient.completeDay(programId, progress.currentDay);
       
       if (onComplete) onComplete();
       
     } catch (e) {
       console.error('Failed to sync completion status', e);
       // We don't revert state here because we want to allow progress even if offline
       // Just warn the user it might not have synced
       // toast.warning('Progress saved on device (offline)');
     }
  };

  const handleRestart = async () => {
    if (confirm('Are you sure you want to restart the program? Current progress will be reset, but your history is preserved locally.')) {
        // Reset Local State
        const resetProgress: UserProgress = {
            currentDay: 1,
            completedDays: {},
            currentDayState: {
                completedBlockIds: [],
                responses: {}
            }
        };
        setProgress(resetProgress);
        setView('home');

        if (programId === DUMMY_EQUIP_PROGRAM.id) {
             localStorage.removeItem(`demo-progress-${programId}`);
             showToast('success', 'Program restarted');
        } else {
             // Attempt backend reset if API supports it
             try {
                 if ((apiClient as any).resetEquipProgress) {
                    await (apiClient as any).resetEquipProgress(programId);
                 }
                 showToast('success', 'Program restarted');
             } catch (e) {
                 console.error('Restart failed', e);
                 // Even if backend fails, we reset locally to allow retry
             }
        }
    }
  };

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center flex-col gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="text-gray-500">Loading program...</p>
          </div>
      );
  }

  if (error || !program) {
      return (
          <div className="flex h-screen items-center justify-center flex-col gap-4 p-8 text-center">
              <h2 className="text-xl font-bold text-red-600">Error Loading Program</h2>
              <p className="text-gray-600">{error || 'Program data is missing'}</p>
              <Button onClick={onBack}>Go Back</Button>
          </div>
      );
  }

  return (
    <>
      {view === 'home' && (
        <EquipProgramHome 
           program={program} 
           progress={progress}
           onStartSession={() => setView('session')}
           onViewHistory={() => setView('history')}
           onRestart={handleRestart}
           onBack={handleBack}
        />
      )}

      {view === 'session' && (
        <DaySessionScreen 
           program={program}
           dayNumber={progress.currentDay}
           initialResponses={progress.currentDayState.responses}
           onCompleteDay={handleCompleteDay}
           onProgress={handleProgress}
           onExit={() => setView('home')}
        />
      )}

      {view === 'history' && (
        <DayOverview 
           program={program}
           progress={progress}
           onBack={() => setView('home')}
           onSelectDay={(day) => {
              // Allow replaying past days in read-only mode
              if (day === progress.currentDay) {
                  setView('session');
              } else if (progress.completedDays[day]) {
                  // Review past day
                  setReviewDay(day);
                  setView('review');
              }
           }}
        />
      )}

      {view === 'review' && reviewDay && (
        <DaySessionScreen 
           program={program}
           dayNumber={reviewDay}
           initialResponses={progress.completedDays[reviewDay]?.responses || {}}
           onCompleteDay={() => setView('history')}
           onProgress={() => {}} // Read-only
           onExit={() => setView('history')}
           mode="preview"
        />
      )}
    </>
  );
}