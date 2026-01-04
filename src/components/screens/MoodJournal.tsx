import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../ui/utils';
import { Card, CardContent } from '../ui/card';

// ----------------------------------------------------------------------
// Types & Constants
// ----------------------------------------------------------------------

interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  stress?: number;
  note: string;
  context_tags?: string[];
  emotions?: string[]; // Legacy support
}

const MOOD_SCALE = [
  { value: 1, label: 'Very Low', emoji: '😫', color: '#EF4444' },
  { value: 2, label: 'Low', emoji: '😕', color: '#F97316' },
  { value: 3, label: 'Neutral', emoji: '😐', color: '#6B7280' },
  { value: 4, label: 'Good', emoji: '🙂', color: '#3B82F6' },
  { value: 5, label: 'Very Good', emoji: '😄', color: '#22C55E' }
];

const ENERGY_SCALE = [
  { value: 1, label: 'Exhausted', icon: 'battery' },
  { value: 2, label: 'Tired', icon: 'batteryLow' },
  { value: 3, label: 'Moderate', icon: 'batteryMedium' },
  { value: 4, label: 'Energetic', icon: 'batteryFull' },
  { value: 5, label: 'Charged', icon: 'zap' }
];

const STRESS_SCALE = [
  { value: 1, label: 'None', color: '#22C55E' },
  { value: 2, label: 'Low', color: '#3B82F6' },
  { value: 3, label: 'Moderate', color: '#EAB308' },
  { value: 4, label: 'High', color: '#F97316' },
  { value: 5, label: 'Extreme', color: '#EF4444' }
];

const CONTEXT_TAGS = [
  'Work', 'Sleep', 'Health', 'Relationships', 'Studies', 'Finances', 'Other'
];

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export function MoodJournal({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Data State
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Wizard State
  const [viewMode, setViewMode] = useState<'calendar' | 'wizard'>('calendar');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mood: null as number | null,
    energy: null as number | null,
    stress: null as number | null,
    note: '',
    tags: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // --------------------------------------------------------------------
  // Data Fetching
  // --------------------------------------------------------------------

  const fetchEntries = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await apiClient.getJournalEntries(undefined, undefined, 50);
      const apiEntries = response?.entries || [];
      
      const formattedEntries: MoodEntry[] = apiEntries.map((e: any) => ({
        id: e.journal_entry_id || e.id,
        date: e.date,
        mood: e.mood_rating || 3,
        energy: e.energy || 3,
        stress: e.stress_level,
        note: e.freehand_text_content || '',
        context_tags: e.context_tags || e.emotions || [], // Fallback to emotions for legacy
        emotions: e.emotions
      }));
      
      setEntries(formattedEntries);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
      showToast('error', 'Error', 'Could not load journal history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  // --------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const isToday = selectedDateStr === todayStr;
  const currentEntry = entries.find(e => e.date === selectedDateStr);

  const handleStartWizard = () => {
    if (currentEntry && isToday) {
      // Edit mode
      setFormData({
        mood: currentEntry.mood,
        energy: currentEntry.energy,
        stress: currentEntry.stress || 3,
        note: currentEntry.note,
        tags: currentEntry.context_tags || []
      });
    } else {
      // New entry
      setFormData({
        mood: null,
        energy: null,
        stress: null,
        note: '',
        tags: []
      });
    }
    setStep(1);
    setViewMode('wizard');
  };

  const handleSave = async () => {
    if (!user || !formData.mood) return;

    setIsSubmitting(true);
    try {
      await apiClient.createJournalEntry(
        selectedDateStr,
        formData.mood,
        formData.note,
        formData.tags, // Using tags as emotions legacy field if needed, but client handles new field
        formData.energy || 3,
        formData.stress || 3,
        formData.tags
      );

      showToast('success', 'Saved', 'Your daily check-in is saved.');
      await fetchEntries();
      setViewMode('calendar');
    } catch (error) {
      console.error(error);
      showToast('error', 'Error', 'Failed to save entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  // --------------------------------------------------------------------
  // Wizard Renderers
  // --------------------------------------------------------------------

  const renderWizard = () => {
    const progress = (step / 5) * 100;

    return (
      <div className="max-w-md mx-auto h-full flex flex-col relative">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100 w-full mb-6 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--color-primary-default)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Back / Close */}
        <div className="flex justify-between items-center mb-8">
           {step > 1 ? (
             <Button variant="ghost" onClick={prevStep} size="sm" className="-ml-3 text-[var(--color-text-muted)]">
               <Icon name="chevronLeft" size={20} /> Back
             </Button>
           ) : (
             <div />
           )}
           <Button variant="ghost" onClick={() => setViewMode('calendar')} size="sm" className="-mr-3 text-[var(--color-text-muted)]">
             <Icon name="x" size={20} />
           </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-1 pb-20">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <h2 className="text-2xl font-medium">How are you feeling right now?</h2>
                <div className="grid grid-cols-1 gap-4">
                  {MOOD_SCALE.slice().reverse().map((m) => (
                    <button
                      key={m.value}
                      onClick={() => {
                        setFormData({ ...formData, mood: m.value });
                        setTimeout(nextStep, 250);
                      }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-95",
                        formData.mood === m.value 
                          ? "border-[var(--color-primary-default)] bg-[var(--color-primary-light)]" 
                          : "border-[var(--color-border-default)] bg-white hover:bg-gray-50"
                      )}
                    >
                      <span className="text-4xl">{m.emoji}</span>
                      <span className="text-lg font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <h2 className="text-2xl font-medium">How is your energy level today?</h2>
                <div className="space-y-4">
                  {ENERGY_SCALE.slice().reverse().map((e) => (
                    <button
                      key={e.value}
                      onClick={() => {
                        setFormData({ ...formData, energy: e.value });
                        setTimeout(nextStep, 250);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-95",
                         formData.energy === e.value
                          ? "border-[var(--color-primary-default)] bg-[var(--color-primary-light)]"
                          : "border-[var(--color-border-default)] bg-white hover:bg-gray-50"
                      )}
                    >
                      <span className="text-lg font-medium">{e.label}</span>
                      {/* Icon placeholder - using generic icons for now */}
                      <Icon name={e.icon as any || "zap"} size={24} className="text-[var(--color-primary-default)]" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <h2 className="text-2xl font-medium">How stressed do you feel today?</h2>
                <div className="space-y-4">
                  {STRESS_SCALE.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => {
                        setFormData({ ...formData, stress: s.value });
                        setTimeout(nextStep, 250);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-95",
                        formData.stress === s.value
                          ? "border-current bg-opacity-10"
                          : "border-[var(--color-border-default)] bg-white hover:bg-gray-50"
                      )}
                      style={{
                        borderColor: formData.stress === s.value ? s.color : undefined,
                        backgroundColor: formData.stress === s.value ? `${s.color}15` : undefined
                      }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-lg font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="space-y-2">
                   <h2 className="text-2xl font-medium">Anything you’d like to note?</h2>
                   <p className="text-[var(--color-text-muted)]">One line is enough.</p>
                </div>
                
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="I felt..."
                  className="w-full h-40 p-4 rounded-xl border border-[var(--color-border-default)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-default)] resize-none"
                />
                
                <Button onClick={nextStep} className="w-full">
                  {formData.note ? 'Next' : 'Skip'}
                </Button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                 <h2 className="text-2xl font-medium">What influenced your mood?</h2>
                 
                 <div className="flex flex-wrap gap-3 justify-center">
                   {CONTEXT_TAGS.map(tag => {
                     const isSelected = formData.tags.includes(tag);
                     return (
                       <button
                         key={tag}
                         onClick={() => {
                           setFormData(prev => ({
                             ...prev,
                             tags: isSelected 
                               ? prev.tags.filter(t => t !== tag)
                               : [...prev.tags, tag]
                           }));
                         }}
                         className={cn(
                           "px-4 py-2 rounded-full border transition-all",
                           isSelected
                            ? "bg-[var(--color-primary-default)] text-white border-[var(--color-primary-default)]"
                            : "bg-white text-[var(--color-text-primary)] border-[var(--color-border-default)]"
                         )}
                       >
                         {tag}
                       </button>
                     );
                   })}
                 </div>

                 <div className="pt-8">
                   <Button 
                    onClick={handleSave} 
                    className="w-full h-12 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Finish Check-in'}
                   </Button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------
  // Calendar View
  // --------------------------------------------------------------------

  const renderCalendarView = () => {
    // Generate dates for current week or month. For simplicity, just showing today + navigation?
    // User asked for "Lightweight, Daily".
    // Let's reuse the week slider concept but cleaner.

    const weekDates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      weekDates.push(d);
    }

    return (
      <div className="max-w-md mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mood Journal</h1>
            <p className="text-[var(--color-text-muted)]">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          {/* Settings or Stats icon could go here */}
        </header>

        {/* Date Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {weekDates.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDateStr;
            const hasEntry = entries.some(e => e.date === dateStr);
            const isFuture = date > today;

            return (
              <button
                key={dateStr}
                disabled={isFuture}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative",
                  isSelected ? "bg-[var(--color-primary-default)] text-white" : "bg-white border border-gray-100 text-gray-500",
                  isFuture && "opacity-30 cursor-not-allowed"
                )}
              >
                <span className="text-xs font-medium uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="text-lg font-bold">{date.getDate()}</span>
                {hasEntry && !isSelected && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[var(--color-primary-default)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex justify-center py-12">
              <Icon name="loader" className="animate-spin text-gray-400" />
            </div>
          ) : currentEntry ? (
            <motion.div 
              key="entry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Mood Card */}
              <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <span className="text-6xl filter drop-shadow-sm">
                    {MOOD_SCALE.find(m => m.value === currentEntry.mood)?.emoji || '😐'}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {MOOD_SCALE.find(m => m.value === currentEntry.mood)?.label}
                    </h3>
                    <p className="text-sm text-gray-500">Recorded at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} (Est)</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                     <div className="p-3 bg-white rounded-lg border border-gray-100 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Energy</span>
                        <div className="flex items-center gap-1 font-medium">
                          <Icon name="zap" size={14} className="text-yellow-500" />
                          {ENERGY_SCALE.find(e => e.value === currentEntry.energy)?.label || '-'}
                        </div>
                     </div>
                     <div className="p-3 bg-white rounded-lg border border-gray-100 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Stress</span>
                        <div className="flex items-center gap-1 font-medium">
                           <Icon name="activity" size={14} className="text-red-500" />
                           {STRESS_SCALE.find(s => s.value === (currentEntry.stress || 3))?.label || '-'}
                        </div>
                     </div>
                  </div>
                </CardContent>
              </Card>

              {/* Note & Context */}
              <div className="space-y-4">
                 {currentEntry.note && (
                   <div className="bg-white p-4 rounded-xl border border-gray-100">
                     <p className="text-gray-700 italic">"{currentEntry.note}"</p>
                   </div>
                 )}
                 
                 {currentEntry.context_tags && currentEntry.context_tags.length > 0 && (
                   <div className="flex flex-wrap gap-2">
                     {currentEntry.context_tags.map(tag => (
                       <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                         #{tag}
                       </span>
                     ))}
                   </div>
                 )}
              </div>

              {isToday && (
                <Button 
                  onClick={handleStartWizard} 
                  variant="outline" 
                  className="w-full border-dashed border-gray-300 text-gray-500 hover:text-gray-900"
                >
                  Edit Check-in
                </Button>
              )}

            </motion.div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                 <Icon name="calendar" size={32} className="text-gray-300" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">No entry for this day</h3>
                <p className="text-gray-500">Track your mood to build your history.</p>
              </div>
              
              {isToday && (
                <Button onClick={handleStartWizard} className="w-full max-w-xs mx-auto">
                  Check-in Now
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "w-full bg-[var(--color-bg-page)]",
        isMobile ? "min-h-full p-4" : "min-h-screen py-8"
      )}
    >
      {viewMode === 'calendar' ? renderCalendarView() : renderWizard()}
    </div>
  );
}