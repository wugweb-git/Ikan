import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Icon } from '../Icon';
import { TextArea } from '../inputs/TextArea';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../ui/utils';
import { Skeleton } from '../ui/skeleton-loader';
import { EmptyState } from '../ui/empty-state';
import { TouchFeedback } from '../ui/touch-feedback';

interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  note: string;
  emotions: string[];
  energy: number;
}

interface MoodType {
  id: string;
  emoji: string;
  label: string;
  value: number;
  color: string;
  description: string;
  is_active: boolean;
  order: number;
}

const defaultMoodLabels = [
  { value: 1, label: 'Angry', emoji: '😡', color: '#F97316' },
  { value: 2, label: 'Upset', emoji: '😢', color: '#3B82F6' },
  { value: 3, label: 'Sad', emoji: '😔', color: '#6B7280' },
  { value: 4, label: 'Good', emoji: '😊', color: '#EAB308' },
  { value: 5, label: 'Great', emoji: '😄', color: '#22C55E' }
];

const emotionOptions = [
  'Happy', 'Sad', 'Anxious', 'Calm', 'Excited', 'Tired', 
  'Frustrated', 'Grateful', 'Lonely', 'Confident', 'Stressed', 'Peaceful'
];

export function MoodJournal() {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [currentMood, setCurrentMood] = useState<number>(3);
  const [currentNote, setCurrentNote] = useState<string>('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [currentEnergy, setCurrentEnergy] = useState<number>(3);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [moodTypes, setMoodTypes] = useState<MoodType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'add'>('add');
  const [streakCount, setStreakCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedMoodAnimation, setSelectedMoodAnimation] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('9:30 PM');
  const [loading, setLoading] = useState(true);

  // Load mood types
  useEffect(() => {
    const fetchMoodTypes = async () => {
      try {
        const response: any = await apiClient.listMoods();
        const moods = response.moods || response || [];
        
        if (Array.isArray(moods) && moods.length > 0) {
          // Sort by order or value
          const sortedMoods = moods
            .filter((m: any) => m.is_active !== false)
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
            
          setMoodTypes(sortedMoods);
        }
      } catch (error) {
        console.warn('Failed to load mood types, using defaults', error);
      }
    };
    fetchMoodTypes();
  }, []);

  // Helper to parse API entry to local format
  const parseEntry = (apiEntry: any): MoodEntry => {
    let note = apiEntry.freehand_text_content || '';
    let emotions: string[] = apiEntry.emotions || [];
    let energy = apiEntry.energy !== undefined && apiEntry.energy !== null ? apiEntry.energy : 3;

    // Backward compatibility: Try to parse metadata stored in note if fields are missing
    if (emotions.length === 0 && energy === 3) {
      const separator = '\n\n:::METADATA:::';
      if (note.includes(separator)) {
        const parts = note.split(separator);
        note = parts[0]; // Use the content part as the note
        try {
          const metadata = JSON.parse(parts[1]);
          if (metadata.emotions) emotions = metadata.emotions;
          if (metadata.energy) energy = metadata.energy;
        } catch (e) {
          console.warn('Failed to parse mood metadata', e);
        }
      }
    } else {
      // If we have new fields, just clean the note if it has the separator (just in case)
      const separator = '\n\n:::METADATA:::';
      if (note.includes(separator)) {
        note = note.split(separator)[0];
      }
    }

    return {
      id: apiEntry.journal_entry_id || apiEntry.id,
      date: apiEntry.date,
      mood: apiEntry.mood_rating || 3,
      note: note,
      emotions: emotions,
      energy: energy
    };
  };

  // Load entries from API
  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getJournalEntries(undefined, undefined, 50);
        const apiEntries = response?.entries || [];
        const formattedEntries = apiEntries.map(parseEntry);
        setEntries(formattedEntries);
      } catch (error) {
        console.error('Failed to load journal entries:', error);
        showToast('error', 'Failed to load entries', 'Could not fetch your mood history.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user]);

  // When switching to add mode, set selected date to today
  useEffect(() => {
    if (viewMode === 'add') {
      setSelectedDate(new Date());
    }
  }, [viewMode]);

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  // Calculate streak count based on real data
  const calculateStreak = (entries: MoodEntry[]) => {
    if (entries.length === 0) return 0;

    // Sort entries by date descending
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Get unique dates
    const uniqueDates = Array.from(new Set(sortedEntries.map(e => e.date)));
    
    let streak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if streak is active (has entry today or yesterday)
    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      return 0;
    }

    // Calculate streak
    let currentDate = new Date(uniqueDates[0]); // Start with most recent entry
    
    // Normalize to midnight for comparison
    const normalizeDate = (d: Date) => new Date(d.toISOString().split('T')[0]);
    
    // Iterate and check continuity
    for (let i = 0; i < uniqueDates.length; i++) {
      const entryDate = new Date(uniqueDates[i]);
      const expectedDate = new Date(currentDate);
      if (i > 0) expectedDate.setDate(expectedDate.getDate() - 1); // Expect previous day
      
      const diff = Math.abs(normalizeDate(currentDate).getTime() - normalizeDate(entryDate).getTime());
      
      // Allow for today/yesterday start, then strict consecutive days
      if (i === 0) {
        streak++;
        currentDate = entryDate;
      } else {
         const oneDay = 24 * 60 * 60 * 1000;
         if (diff <= oneDay) {
           streak++;
           currentDate = entryDate;
         } else {
           break;
         }
      }
    }
    
    return streak;
  };

  // Update streak count when entries change
  useEffect(() => {
    const currentStreak = calculateStreak(entries);
    // Only show celebration if streak increased and is substantial
    if (currentStreak > streakCount && currentStreak >= 3 && streakCount !== 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    setStreakCount(currentStreak);
  }, [entries]);

  const handleSubmitEntry = async () => {
    if (!user) return;

    const noteText = currentNote || '';
    if (!noteText.trim()) {
      showToast('warning', 'Please add a note', 'A brief note helps track your mood patterns.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Send data as structured fields
      // Note: We no longer pack metadata into content, but backend supports it for legacy reasons
      await apiClient.createJournalEntry(
        dateStr, 
        currentMood, 
        noteText.trim(),
        selectedEmotions,
        currentEnergy
      );

      // Construct local entry to update state immediately
      const newEntry: MoodEntry = {
        id: `${user.id}-${dateStr}`,
        date: dateStr,
        mood: currentMood,
        note: noteText.trim(),
        emotions: selectedEmotions,
        energy: currentEnergy
      };

      // Update local state: remove existing entry for this date if any, then add new one
      setEntries(prev => {
        const filtered = prev.filter(e => e.date !== dateStr);
        return [newEntry, ...filtered];
      });
      
      // Reset form defaults
      setCurrentMood(3);
      setCurrentNote('');
      setSelectedEmotions([]);
      setCurrentEnergy(3);

      showToast('success', 'Mood logged!', 'Your daily mood entry has been saved.');
      
      // Switch back to calendar view
      setViewMode('calendar');
    } catch (error) {
      console.error('Error saving mood entry:', error);
      showToast('error', 'Failed to save', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get active mood list - prefer fetched types, fallback to defaults
  const activeMoods = moodTypes.length > 0 ? moodTypes : defaultMoodLabels;

  const getMoodColor = (mood: number) => {
    const moodData = activeMoods.find(m => m.value === mood);
    return moodData?.color || '#8B8B8B';
  };

  const getMoodLabel = (mood: number) => {
    const moodData = activeMoods.find(m => m.value === mood);
    return moodData ? `${moodData.emoji} ${moodData.label}` : '😐 Okay';
  };

  // Get current date and greeting
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  };

  // Generate week dates for calendar navigation
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const formatWeekDay = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    return { dayName, dayNumber };
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  if (loading && entries.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-bg-page)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading journal...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'add') {
    return (
      <div 
        className="min-h-screen w-full relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg-page)',
          paddingTop: isMobile ? 'var(--spacing-6)' : 'var(--spacing-8)',
          paddingRight: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)',
          paddingBottom: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)',
          paddingLeft: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)',
          maxWidth: isMobile ? '100%' : 'var(--constraint-content-max)',
          margin: isMobile ? '0' : '0 auto'
        }}
      >
        {/* Header Section */}
        <motion.div 
          className="text-center space-y-1 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Icon name="calendar" size={20} style={{ color: 'var(--color-text-muted)' }} />
            <span 
              style={{ 
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-normal)',
                color: 'var(--color-text-muted)'
              }}
            >
              {getCurrentDate()}
            </span>
          </div>
          <h1 
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              lineHeight: '1.2'
            }}
          >
            {getGreeting()}, {getUserName()}!
          </h1>
        </motion.div>

        {/* Week Calendar Navigation */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div 
            className="flex justify-between items-center gap-1 overflow-x-auto py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {getWeekDates().map((date, index) => {
              const { dayName, dayNumber } = formatWeekDay(date);
              const isSelected = isSelectedDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <motion.button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className="flex flex-col items-center justify-center min-w-[44px] px-2 py-3 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: isSelected 
                      ? 'var(--color-primary-default)' 
                      : 'transparent',
                    color: isSelected 
                      ? 'var(--color-primary-on)' 
                      : isToday 
                        ? 'var(--color-primary-default)'
                        : 'var(--color-text-muted)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span 
                    style={{ 
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-normal)'
                    }}
                  >
                    {dayName}
                  </span>
                  <span 
                    style={{ 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      marginTop: '2px'
                    }}
                  >
                    {dayNumber.toString().padStart(2, '0')}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Time Selector */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            className="flex items-center justify-between w-full max-w-[120px] mx-auto px-4 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <span 
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              {selectedTime}
            </span>
            <Icon name="chevron-down" size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </motion.div>

        {/* Main Character/Mascot */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div
            className="rounded-full flex items-center justify-center"
            style={{
              width: isMobile ? '128px' : '160px',
              height: isMobile ? '128px' : '160px',
              fontSize: isMobile ? '60px' : '80px',
              background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
            }}
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            👋
          </motion.div>
        </motion.div>

        {/* Mood Selection */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 
            className="text-center mb-6"
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}
          >
            How are you feeling today?
          </h2>
          
          <div 
            className={isMobile 
              ? "flex justify-between items-center gap-3 px-2 overflow-x-auto" 
              : "flex justify-center items-center gap-6 flex-wrap"
            }
            style={{
              paddingBottom: isMobile ? '10px' : '0'
            }}
          >
            {activeMoods.map((mood) => (
              <motion.button
                key={mood.id || mood.value}
                onClick={() => {
                  setCurrentMood(mood.value);
                  setSelectedMoodAnimation(mood.value);
                  setTimeout(() => setSelectedMoodAnimation(null), 500);
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 flex-shrink-0"
                style={{
                  backgroundColor: currentMood === mood.value 
                    ? mood.color + '20' 
                    : 'transparent',
                  borderWidth: currentMood === mood.value ? '2px' : '1px',
                  borderStyle: 'solid',
                  borderColor: currentMood === mood.value 
                    ? mood.color 
                    : 'var(--color-border-light)',
                  minWidth: isMobile ? '60px' : '80px',
                  minHeight: isMobile ? '80px' : '100px'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + (mood.value * 0.1) }}
              >
                <motion.span
                  style={{
                    fontSize: isMobile ? '24px' : '32px'
                  }}
                  animate={{
                    scale: selectedMoodAnimation === mood.value ? [1, 1.3, 1] : 1,
                    rotate: selectedMoodAnimation === mood.value ? [0, 10, -10, 0] : 0
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {mood.emoji}
                </motion.span>
                <span 
                  style={{
                    fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-normal)',
                    color: currentMood === mood.value ? mood.color : 'var(--color-text-muted)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {mood.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Journal Input */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            maxWidth: isMobile ? '100%' : '600px',
            margin: '0 auto'
          }}
        >
          <div className="relative">
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-4 pr-12 rounded-lg border resize-none transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-normal)',
                fontFamily: 'var(--font-family-base)',
                minHeight: isMobile ? '120px' : '140px',
                borderRadius: 'var(--radius-lg)',
                focusRingColor: 'var(--color-primary-default)',
                focusRingOpacity: '0.3'
              }}
              rows={isMobile ? 4 : 5}
            />
            <button 
              className="absolute bottom-4 right-4 p-2 rounded-full transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-muted)',
                color: 'var(--color-text-muted)'
              }}
            >
              <Icon name="mic" size={20} />
            </button>
          </div>
        </motion.div>

        {/* Set Mood Button */}
        <motion.div
          className="pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{
            maxWidth: isMobile ? '100%' : '400px',
            margin: '0 auto'
          }}
        >
          <Button
            onClick={handleSubmitEntry}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              backgroundColor: 'var(--semantic-button-primary-bg)',
              color: 'var(--semantic-button-primary-fg)',
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              border: 'none'
            }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin">
                  <Icon name="loader" size={20} />
                </div>
                Setting Mood...
              </>
            ) : (
              <>
                <Icon name="heart" size={20} />
                Set Mood
              </>
            )}
          </Button>
        </motion.div>

        {/* Calendar toggle for desktop view */}
        {!isMobile && (
          <motion.div
            className="fixed top-20 right-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Button
              onClick={() => setViewMode('calendar')}
              variant="ghost"
              size="sm"
              className="gap-2"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <Icon name="calendar" size={16} />
              Calendar View
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="space-y-6 w-full relative"
      style={{
        maxWidth: '1000px', // Reduced from constraint-content-max for tighter layout
        margin: '0 auto',
        // Mobile-first spacing
        padding: 'var(--spacing-4)',
      }}
    >
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-xl border border-yellow-200 flex flex-col items-center"
            >
              <span className="text-4xl mb-2">🔥</span>
              <h3 className="text-xl font-bold text-yellow-600">Streak Updated!</h3>
              <p className="text-gray-600">{streakCount} Days in a row!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mood Journal</h1>
          <p className="text-muted-foreground">Track your emotional well-being over time</p>
        </div>
        <Button onClick={() => setViewMode('add')}>
          <Icon name="plus" size={16} className="mr-2" />
          New Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                booked: (date) => entries.some(e => e.date === date.toISOString().split('T')[0])
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  color: 'var(--color-primary-default)'
                }
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Streak</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="text-4xl font-bold text-orange-500 flex items-center gap-2">
                <Icon name="flame" size={32} />
                {streakCount}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Moods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entries.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: getMoodColor(entry.mood) + '20', color: getMoodColor(entry.mood) }}
                  >
                    {activeMoods.find(m => m.value === entry.mood)?.emoji || '😐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.note || 'No note'}</p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                </div>
              ))}
              {entries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No entries yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}