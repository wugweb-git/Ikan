import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, CheckCircle, Lock, Play, Clock, 
  ChevronRight, ArrowRight, X, AlertCircle, RotateCcw,
  BookOpen, Edit3, List, Moon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Input } from '../ui/input';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { EquipProgram, Activity, DayContent } from '../../lib/equip-admin-types';

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
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto w-full p-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={onBack} size="sm" className="-ml-3 text-gray-500">
            <ArrowLeft size={20} />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center pb-20">
          {isProgramComplete ? (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Journey Complete!</h1>
              <p className="text-gray-600">You've completed {program.title}.</p>
              <Button className="w-full h-14 text-lg" onClick={onViewHistory}>
                Review Your Path
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-sm font-semibold tracking-widest text-indigo-600 uppercase">
                  {program.title}
                </h2>
                <h1 className="text-4xl font-bold text-gray-900">
                  {currentDayContent?.dayType === 'practice' ? "Practice" : `Day ${progress.currentDay}`}
                </h1>
                <p className="text-lg text-gray-500">
                  of {program.daily_content?.length || 18}
                </p>
              </div>

              {currentDayContent ? (
                <Card className="border-0 shadow-xl shadow-indigo-100/50 bg-white/90 backdrop-blur">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {currentDayContent.title}
                      </h3>
                      {currentDayContent.description && (
                        <p className="text-gray-500 text-sm">
                          {currentDayContent.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 py-2 px-4 rounded-full inline-flex mx-auto">
                      <Clock size={16} />
                      <span>~10 minutes</span>
                    </div>

                    <Button 
                      onClick={onStartSession}
                      className="w-full h-14 text-lg rounded-xl bg-[var(--color-primary-default)] text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02]"
                    >
                      <Play fill="currentColor" size={16} className="mr-2" />
                      {hasStartedDay ? "Continue Session" : currentDayContent.dayType === 'practice' ? "Start Practice" : "Start Today"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">Content loading or not found for Day {progress.currentDay}</p>
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
// COMPONENT 2: DAY SESSION (RUNTIME)
// ============================================================================

interface DaySessionScreenProps {
  dayContent: DayContent;
  progress: UserProgress;
  onCompleteBlock: (blockId: string, response?: any) => void;
  onCompleteDay: () => void;
  onExit: () => void;
}

function DaySessionScreen({ dayContent, progress, onCompleteBlock, onCompleteDay, onExit }: DaySessionScreenProps) {
  // Determine starting block index based on progress
  const initialIndex = Math.max(0, dayContent.activities.findIndex(
    a => !progress.currentDayState.completedBlockIds.includes(a.id)
  ));
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex === -1 ? 0 : initialIndex);

  const handleNext = () => {
    if (currentIndex < dayContent.activities.length - 1) {
      setCurrentIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      onCompleteDay();
    }
  };

  const currentBlock = dayContent.activities[currentIndex];

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col">
      <DayProgressHeader 
        dayNumber={dayContent.day} 
        title={currentBlock?.title || dayContent.title}
        currentBlock={currentIndex} 
        totalBlocks={dayContent.activities.length}
        onExit={onExit}
      />

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBlock?.id || 'end'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {currentBlock ? (
              <BlockRenderer 
                block={currentBlock}
                onComplete={(response) => onCompleteBlock(currentBlock.id, response)}
                onNext={handleNext}
                isLast={currentIndex === dayContent.activities.length - 1}
              />
            ) : (
              <div>Loading block...</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 3: PROGRESS HEADER
// ============================================================================

function DayProgressHeader({ dayNumber, title, currentBlock, totalBlocks, onExit }: any) {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4">
      <div className="max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Day {dayNumber}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExit} 
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <X size={18} />
          </Button>
        </div>
        
        <h2 className="text-sm font-medium text-gray-900 truncate mb-3 min-h-[20px]">
          {title}
        </h2>

        {/* Minimal Dot Progress */}
        <div className="flex gap-1.5 h-1.5 items-center">
          {Array.from({ length: totalBlocks }).map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "rounded-full transition-all duration-500 ease-out",
                idx === currentBlock ? "w-8 bg-indigo-600 h-1.5" : 
                idx < currentBlock ? "w-1.5 bg-indigo-200 h-1.5" : 
                "w-1.5 bg-gray-100 h-1.5"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 4: BLOCK RENDERER & TYPES
// ============================================================================

interface BlockProps {
  block: Activity;
  onComplete: (response?: any) => void;
  onNext: () => void;
  isLast: boolean;
}

function BlockRenderer(props: BlockProps) {
  const { block } = props;

  switch (block.type) {
    case 'lesson': return <LessonBlock {...props} />;
    case 'exercise': 
      if (block.exerciseConfig?.subtype === 'clinical_instrument') {
        return <ClinicalInstrumentBlock {...props} />;
      }
      return <ExerciseBlock {...props} />;
    case 'sleep_diary': return <TableTrackerBlock {...props} type="sleep" />;
    case 'checklist': return <ChecklistBlock {...props} />;
    case 'reflection': 
    case 'conclude': return <ReflectionBlock {...props} />;
    default: return <div className="p-4 bg-red-50 text-red-500 rounded">Unknown block type: {block.type}</div>;
  }
}

// ----------------------------------------------------------------------------
// 6. LESSON BLOCK
// ----------------------------------------------------------------------------
function LessonBlock({ block, onNext, isLast }: BlockProps) {
  return (
    <div className="flex-1 flex flex-col pb-24">
      <div className="space-y-6">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2 shadow-sm">
          <BookOpen size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{block.title}</h2>
        <div className="prose prose-lg text-gray-600 leading-relaxed">
          {block.content.split('\n').map((para, i) => (
            <p key={i} className="mb-4 text-[17px]">{para}</p>
          ))}
        </div>
      </div>
      <BlockFooter onNext={onNext} isLast={isLast} />
    </div>
  );
}

// ----------------------------------------------------------------------------
// 7. EXERCISE BLOCK
// ----------------------------------------------------------------------------
function ExerciseBlock({ block, onComplete, onNext, isLast }: BlockProps) {
  const config = block.exerciseConfig || {};
  const [value, setValue] = useState<any>(null);

  // Autosave simulation
  useEffect(() => {
    if (value) onComplete(value);
  }, [value]);

  return (
    <div className="flex-1 flex flex-col pb-24">
      <div className="space-y-6">
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-2 shadow-sm">
          <Edit3 size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{block.title}</h2>
        <div className="text-gray-600 text-lg">{block.content}</div>

        <div className="pt-2">
          {config.subtype === 'mcq' || config.subtype === 'single-select' ? (
            <RadioGroup value={value} onValueChange={setValue} className="space-y-3">
              {config.options?.map((opt, i) => (
                <div key={i} className="relative group">
                  <RadioGroupItem value={opt} id={`opt-${i}`} className="peer sr-only" />
                  <Label
                    htmlFor={`opt-${i}`}
                    className="flex items-center p-4 rounded-xl border-2 border-gray-100 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 peer-data-[state=checked]:text-purple-900 peer-data-[state=checked]:shadow-sm"
                  >
                    <span className="text-base font-medium">{opt}</span>
                    <div className="ml-auto w-4 h-4 rounded-full border border-gray-300 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-500" />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Textarea 
              placeholder="Type your answer here..."
              value={value || ''}
              onChange={e => setValue(e.target.value)}
              className="min-h-[180px] text-lg p-4 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 resize-none"
            />
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium px-1">
          <CheckCircle size={12} />
          Auto-saved
        </div>
      </div>
      <BlockFooter 
        onNext={onNext} 
        isLast={isLast} 
        disabled={block.required && !value} 
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// 8. TABLE / TRACKER BLOCK
// ----------------------------------------------------------------------------
function TableTrackerBlock({ block, onComplete, onNext, isLast, type }: BlockProps & { type?: 'sleep' | 'generic' }) {
  const [data, setData] = useState({ bedTime: '', wakeTime: '', quality: '3' });

  useEffect(() => { onComplete(data); }, [data]);

  return (
    <div className="flex-1 flex flex-col pb-24">
      <div className="space-y-6">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-sm">
          <Moon size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{block.title}</h2>
        <p className="text-gray-600 text-lg">Let's log last night's sleep to track your progress.</p>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Example Row (Greyed out) */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-gray-100 opacity-60 pointer-events-none select-none">
            <div>
              <Label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Bed Time</Label>
              <div className="text-sm text-gray-500 font-medium">10:30 PM</div>
            </div>
            <div>
              <Label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Wake Time</Label>
              <div className="text-sm text-gray-500 font-medium">07:00 AM</div>
            </div>
            <div>
              <Label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Quality</Label>
              <div className="text-sm text-gray-500 font-medium">Good</div>
            </div>
          </div>

          {/* User Input Row */}
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Bed Time</Label>
                <Input 
                  type="time" 
                  className="bg-gray-50 border-gray-200 h-11"
                  value={data.bedTime}
                  onChange={e => setData({...data, bedTime: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Wake Time</Label>
                <Input 
                  type="time" 
                  className="bg-gray-50 border-gray-200 h-11"
                  value={data.wakeTime}
                  onChange={e => setData({...data, wakeTime: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-gray-700">Sleep Quality</Label>
                <span className="text-sm font-medium text-indigo-600">
                  {['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'][parseInt(data.quality)-1]}
                </span>
              </div>
              <input 
                type="range" 
                min="1" max="5" 
                step="1"
                value={data.quality}
                onChange={e => setData({...data, quality: e.target.value})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BlockFooter onNext={onNext} isLast={isLast} />
    </div>
  );
}

// ----------------------------------------------------------------------------
// 10. CHECKLIST BLOCK
// ----------------------------------------------------------------------------
function ChecklistBlock({ block, onComplete, onNext, isLast }: BlockProps) {
  const items = block.exerciseConfig?.listItems || block.exerciseConfig?.options || ['No screens after 10pm', 'Breathing exercise'];
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => { onComplete(checked); }, [checked]);

  const toggle = (item: string) => {
    setChecked(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  return (
    <div className="flex-1 flex flex-col pb-24">
      <div className="space-y-6">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-2 shadow-sm">
          <List size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{block.title}</h2>
        
        <div className="space-y-3">
          {items.map((item, i) => (
            <div 
              key={i}
              onClick={() => toggle(item)}
              className={cn(
                "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                checked.includes(item) 
                  ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                  : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-300",
                checked.includes(item) 
                  ? "bg-emerald-500 border-emerald-500 scale-110" 
                  : "border-gray-300 bg-white"
              )}>
                {checked.includes(item) && <CheckCircle size={14} className="text-white" strokeWidth={3} />}
              </div>
              <span className={cn(
                "text-lg font-medium transition-colors",
                checked.includes(item) ? "text-emerald-900" : "text-gray-700"
              )}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
      <BlockFooter onNext={onNext} isLast={isLast} />
    </div>
  );
}

// ----------------------------------------------------------------------------
// 12. CLINICAL INSTRUMENT BLOCK
// ----------------------------------------------------------------------------
function ClinicalInstrumentBlock({ block, onComplete, onNext, isLast }: BlockProps) {
  const { questions = [], scale = [] } = block.exerciseConfig || {};
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const isComplete = questions.length > 0 && questions.every((_, i) => answers[i] !== undefined);
  
  useEffect(() => {
    if (isComplete) {
       const score = Object.values(answers).reduce((a, b) => a + b, 0);
       onComplete({ answers, score });
    }
  }, [answers, isComplete]);

  return (
    <div className="flex-1 flex flex-col pb-24">
      <div className="space-y-6">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-2 shadow-sm">
           <List size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{block.title}</h2>
        {block.content && <p className="text-gray-600">{block.content}</p>}

        <div className="space-y-8">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">{q}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scale.map((s, sIdx) => (
                   <button
                     key={sIdx}
                     onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: s.value }))}
                     className={cn(
                       "p-3 rounded-lg border text-sm font-medium transition-all text-left",
                       answers[qIdx] === s.value
                         ? "bg-rose-50 border-rose-500 text-rose-900 shadow-sm"
                         : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                     )}
                   >
                     {s.label}
                   </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BlockFooter onNext={onNext} isLast={isLast} disabled={block.required && !isComplete} />
    </div>
  );
}

// ----------------------------------------------------------------------------
// 11. REFLECTION / CONCLUDE BLOCK
// ----------------------------------------------------------------------------
function ReflectionBlock({ block, onNext, isLast }: BlockProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center pb-24 pt-10">
      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
        <CheckCircle size={40} />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{block.title}</h2>
      <p className="text-xl text-gray-600 leading-relaxed max-w-sm mx-auto">
        {block.content || "Thanks for showing up today. We'll continue tomorrow."}
      </p>
      <BlockFooter onNext={onNext} isLast={isLast} label="Done for today" />
    </div>
  );
}

// ----------------------------------------------------------------------------
// UTILS
// ----------------------------------------------------------------------------

function BlockFooter({ onNext, isLast, disabled, label }: { onNext: () => void, isLast: boolean, disabled?: boolean, label?: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-20">
      <div className="max-w-md mx-auto">
        <Button 
          onClick={onNext}
          disabled={disabled}
          className="w-full h-14 text-lg shadow-lg shadow-indigo-500/20 rounded-xl bg-[var(--color-primary-default)] text-white hover:bg-[var(--color-primary-dark)] transition-all"
        >
          {label || (isLast ? "Complete Session" : "Continue")}
        </Button>
      </div>
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
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      <div className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack} size="sm" className="-ml-3 text-gray-500">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Your Journey</h1>
        </div>

        <div className="space-y-3">
          {program.daily_content?.map((day) => {
            const status = getStatus(day.day);
            return (
              <div 
                key={day.day}
                onClick={() => {
                    if (status !== 'locked') onSelectDay(day.day);
                }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  status !== 'locked' && "cursor-pointer hover:border-indigo-200",
                  status === 'current' ? "bg-white border-indigo-200 shadow-md scale-[1.02]" : 
                  status === 'completed' ? "bg-white border-gray-100 opacity-80" :
                  status === 'skipped' ? "bg-gray-50 border-gray-100 opacity-50" :
                  "bg-gray-50 border-transparent opacity-40"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    status === 'completed' ? "bg-green-100 text-green-700" :
                    status === 'current' ? "bg-indigo-100 text-indigo-700" :
                    "bg-gray-200 text-gray-500"
                  )}>
                    {status === 'completed' ? <CheckCircle size={16} /> : day.day}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{day.title}</h4>
                    <p className="text-xs text-gray-500 capitalize">{status}</p>
                  </div>
                </div>
                {status === 'locked' && <Lock size={16} className="text-gray-300" />}
                {status === 'current' && <ArrowRight size={16} className="text-indigo-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CONTAINER
// ============================================================================

export function EquipProgramFlow(props: EquipProgramFlowProps) {
  const [view, setView] = useState<'home' | 'session' | 'history'>('home');
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<EquipProgram | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    currentDay: 1,
    completedDays: {},
    currentDayState: { completedBlockIds: [], responses: {} }
  });
  const [activeDay, setActiveDay] = useState<number>(1);

  const { showToast } = useNotifications();

  // Load Program & Progress
  useEffect(() => {
    const loadData = async () => {
      try {
        const id = props.programId || 'sleep-tight-9';
        const prog = await apiClient.getEquipProgram(id);
        setProgram(prog);
        
        // Priority: enrollmentId -> localStorage -> default
        let loaded = false;
        
        if (props.enrollmentId) {
            try {
                const enrollment = await apiClient.getEnrollmentProgress(props.enrollmentId);
                // Map enrollment to UserProgress
                if (enrollment && enrollment.enrollment) { // Check structure
                    const e = enrollment.enrollment;
                    const mappedProgress: UserProgress = {
                        currentDay: e.currentDay || 1,
                        completedDays: {},
                        currentDayState: e.state || { completedBlockIds: [], responses: {} }
                    };
                    if (e.completedDays) {
                        e.completedDays.forEach((d: number) => {
                            mappedProgress.completedDays[d] = { status: 'completed', date: new Date().toISOString() };
                        });
                    }
                    setProgress(mappedProgress);
                    setActiveDay(mappedProgress.currentDay);
                    loaded = true;
                }
            } catch (err) {
                console.warn("Failed to load enrollment progress from server", err);
            }
        } 
        
        if (!loaded) {
            const saved = localStorage.getItem(`equip_progress_${id}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                setProgress(parsed);
                setActiveDay(parsed.currentDay);
            }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [props.programId, props.enrollmentId]);

  // Sync Progress Effect
  useEffect(() => {
    if (!program) return;
    
    // Always save to local storage as backup
    localStorage.setItem(`equip_progress_${program.id || 'sleep-tight-9'}`, JSON.stringify(progress));

    // If online & enrolled, sync to backend
    if (props.enrollmentId) {
        // Debounced sync could be implemented here, but for now we trust the effect
        // We only sync block completion and responses here. Day completion is handled explicitly.
        const sync = async () => {
            try {
                await apiClient.syncEquipProgress(props.enrollmentId!, {
                    currentDay: progress.currentDay, // Note: backend uses this to update current pointer
                    completedBlockIds: progress.currentDayState.completedBlockIds,
                    responses: progress.currentDayState.responses
                });
            } catch (e) {
                console.error("Sync failed", e);
            }
        };
        sync();
    }
  }, [progress, program, props.enrollmentId]);

  if (loading || !program) return <div className="p-8 text-center text-gray-500">Loading experience...</div>;

  return (
    <AnimatePresence mode="wait">
      {view === 'history' && (
        <motion.div 
          key="history"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <DayOverview program={program} progress={progress} onBack={() => setView('home')} onSelectDay={(d) => { setActiveDay(d); setView('session'); }} />
        </motion.div>
      )}

      {view === 'session' && (
        <motion.div 
          key="session"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
           {(() => {
              const dayContent = program.daily_content?.find(d => d.day === activeDay);
              if (!dayContent) return <div>Error: Day content missing</div>;
              return (
                <DaySessionScreen 
                  dayContent={dayContent}
                  progress={activeDay === progress.currentDay ? progress : { ...progress, currentDayState: { completedBlockIds: [], responses: {} } }}
                  onCompleteBlock={(id, resp) => {
                    if (activeDay === progress.currentDay) {
                        setProgress(prev => ({
                          ...prev,
                          currentDayState: {
                            completedBlockIds: [...prev.currentDayState.completedBlockIds, id],
                            responses: { ...prev.currentDayState.responses, [id]: resp }
                          }
                        }));
                    }
                  }}
                  onCompleteDay={() => {
                     if (activeDay === progress.currentDay) {
                         const completedDayNum = progress.currentDay;
                         setProgress(prev => ({
                           ...prev,
                           currentDay: prev.currentDay + 1,
                           completedDays: { 
                             ...prev.completedDays, 
                             [completedDayNum]: { status: 'completed', date: new Date().toISOString() } 
                           },
                           currentDayState: { completedBlockIds: [], responses: {} }
                         }));
                         setActiveDay(progress.currentDay + 1);
                         if (props.enrollmentId) {
                           apiClient.updateEnrollmentProgress(props.enrollmentId, {
                             dayNumber: completedDayNum,
                             completed: true
                           }).catch(err => console.error("Failed to mark day complete on server", err));
                         }
                     } else {
                         setActiveDay(progress.currentDay);
                     }
                     setView('home');
                     showToast('success', 'Day Complete', 'Progress saved.');
                  }}
                  onExit={() => { setView('home'); setActiveDay(progress.currentDay); }}
                />
              );
           })()}
        </motion.div>
      )}

      {view === 'home' && (
        <motion.div 
          key="home"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <EquipProgramHome 
            program={program}
            progress={progress}
            onStartSession={() => { setActiveDay(progress.currentDay); setView('session'); }}
            onViewHistory={() => setView('history')}
            onBack={props.onBack || (() => {})}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
