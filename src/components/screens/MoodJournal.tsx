import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Icon } from '../Icon';
import { TextArea } from '../inputs/TextArea';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../ui/utils';

interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  note: string;
  emotions: string[];
  energy: number;
}

const moodLabels = [
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'add'>('add');
  const [streakCount, setStreakCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedMoodAnimation, setSelectedMoodAnimation] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('9:30 PM');

  // Load sample entries for demo - generate entries for the past 30 days
  useEffect(() => {
    const sampleEntries: MoodEntry[] = [];
    const today = new Date();
    
    // Generate sample entries for the past 30 days (not every day)
    const sampleDates = [
      { daysAgo: 0, mood: 4, note: 'Had a great therapy session today. Feeling more hopeful about things.', emotions: ['Happy', 'Grateful', 'Calm'], energy: 4 },
      { daysAgo: 1, mood: 3, note: 'Work was challenging but manageable. Taking it one day at a time.', emotions: ['Calm', 'Focused'], energy: 3 },
      { daysAgo: 3, mood: 2, note: 'Struggling with work stress. Need to practice more self-care.', emotions: ['Stressed', 'Tired', 'Frustrated'], energy: 2 },
      { daysAgo: 5, mood: 5, note: 'Amazing weekend with friends! Feeling so grateful for the people in my life.', emotions: ['Happy', 'Grateful', 'Excited'], energy: 5 },
      { daysAgo: 7, mood: 3, note: 'Average day. Did some meditation which helped center me.', emotions: ['Calm', 'Peaceful'], energy: 3 },
      { daysAgo: 10, mood: 1, note: 'Really tough day. Everything felt overwhelming. Reached out to my therapist.', emotions: ['Sad', 'Anxious', 'Lonely'], energy: 1 },
      { daysAgo: 12, mood: 4, note: 'Went for a long walk in nature. Fresh air always helps my mood.', emotions: ['Peaceful', 'Grateful', 'Calm'], energy: 4 },
      { daysAgo: 15, mood: 3, note: 'Routine day at work. Practiced some breathing exercises during breaks.', emotions: ['Calm', 'Focused'], energy: 3 },
      { daysAgo: 18, mood: 2, note: 'Feeling a bit down today. Weather is gloomy and it\'s affecting my energy.', emotions: ['Sad', 'Tired'], energy: 2 },
      { daysAgo: 20, mood: 4, note: 'Good progress in therapy today. Learning new coping strategies.', emotions: ['Hopeful', 'Grateful', 'Confident'], energy: 4 },
      { daysAgo: 22, mood: 5, note: 'Celebrated a small win at work today! Feeling proud of my progress.', emotions: ['Happy', 'Proud', 'Confident'], energy: 5 },
      { daysAgo: 25, mood: 3, note: 'Steady day. Practiced mindfulness and it helped keep me grounded.', emotions: ['Calm', 'Peaceful'], energy: 3 },
      { daysAgo: 28, mood: 2, note: 'Had an argument with a friend. Feeling upset but trying to process it healthily.', emotions: ['Frustrated', 'Sad'], energy: 2 },
    ];

    sampleDates.forEach((sample, index) => {
      const entryDate = new Date(today);
      entryDate.setDate(today.getDate() - sample.daysAgo);
      
      sampleEntries.push({
        id: (index + 1).toString(),
        date: entryDate.toISOString().split('T')[0],
        mood: sample.mood,
        note: sample.note,
        emotions: sample.emotions,
        energy: sample.energy
      });
    });

    setEntries(sampleEntries);
  }, []);

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

  // Calculate streak count
  const calculateStreak = (entries: MoodEntry[]) => {
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Update streak count when entries change
  useEffect(() => {
    const currentStreak = calculateStreak(entries);
    if (currentStreak > streakCount && currentStreak >= 3) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    setStreakCount(currentStreak);
  }, [entries]);

  const handleSubmitEntry = async () => {
    const noteText = currentNote || '';
    if (!noteText.trim()) {
      showToast('warning', 'Please add a note', 'A brief note helps track your mood patterns.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        date: selectedDate.toISOString().split('T')[0],
        mood: currentMood,
        note: noteText.trim(),
        emotions: selectedEmotions,
        energy: currentEnergy
      };

      // In demo mode, just add to local state
      setEntries(prev => [newEntry, ...prev]);
      
      // Reset form
      setCurrentMood(3);
      setCurrentNote('');
      setSelectedEmotions([]);
      setCurrentEnergy(3);

      const newStreak = calculateStreak([newEntry, ...entries]);
      if (newStreak > streakCount && newStreak >= 3) {
        showToast('success', `${newStreak} day streak! 🎉`, 'Great job staying consistent with your mood tracking!');
      } else {
        showToast('success', 'Mood logged!', 'Your daily mood entry has been saved.');
      }
      
      // Switch back to calendar view and select today
      setViewMode('calendar');
      setSelectedDate(new Date());
    } catch (error) {
      console.error('Error saving mood entry:', error);
      showToast('error', 'Failed to save', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodColor = (mood: number) => {
    const moodData = moodLabels.find(m => m.value === mood);
    return moodData?.color || '#8B8B8B';
  };

  const getMoodLabel = (mood: number) => {
    const moodData = moodLabels.find(m => m.value === mood);
    return moodData ? `${moodData.emoji} ${moodData.label}` : '😐 Okay';
  };

  // Get entries for a specific date
  const getEntriesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return entries.filter(entry => entry.date === dateString);
  };

  // Get dates that have entries for calendar highlighting
  const getDatesWithEntries = () => {
    return entries.map(entry => new Date(entry.date));
  };

  // Format date for display
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if selected date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
              ? "flex justify-between items-center gap-3 px-2" 
              : "flex justify-center items-center gap-6"
            }
          >
            {moodLabels.map((mood) => (
              <motion.button
                key={mood.value}
                onClick={() => {
                  setCurrentMood(mood.value);
                  setSelectedMoodAnimation(mood.value);
                  setTimeout(() => setSelectedMoodAnimation(null), 500);
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200"
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
                    color: currentMood === mood.value ? mood.color : 'var(--color-text-muted)'
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
        maxWidth: 'var(--constraint-content-max)',
        margin: '0 auto',
        // Mobile-first spacing
        padding: 'var(--spacing-4)',
        gap: 'var(--spacing-6)'
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
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: 1,
                ease: "easeInOut"
              }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <motion.div 
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h1 
          className="flex items-center justify-center gap-3"
          style={{ 
            fontSize: 'var(--text-2xl)', 
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)'
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          >
            <Icon name="heart" size={28} variant="roundedFilled" />
          </motion.div>
          Mood Journal
        </motion.h1>
        <motion.p 
          style={{ color: 'var(--color-text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Track your daily mood and emotional well-being
        </motion.p>
        
        {/* Streak Indicator */}
        <AnimatePresence>
          {streakCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--color-status-success-light)',
                color: 'var(--color-status-success)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🔥
              </motion.span>
              {streakCount} day streak
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* View Toggle */}
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div 
          className="flex rounded-lg p-1 relative"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            gap: 'var(--spacing-1)'
          }}
        >
          <motion.div
            className="absolute top-1 bottom-1 rounded-sm"
            style={{
              backgroundColor: 'var(--color-primary-default)',
              left: viewMode === 'calendar' ? '4px' : 'calc(50% + 2px)',
              right: viewMode === 'calendar' ? 'calc(50% + 2px)' : '4px'
            }}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <Button
            onClick={() => setViewMode('calendar')}
            variant="ghost"
            size="sm"
            className="gap-2 relative z-10"
            style={{
              color: viewMode === 'calendar' ? 'var(--color-primary-on)' : 'var(--color-text-primary)',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent'
            }}
          >
            <motion.div
              animate={{ scale: viewMode === 'calendar' ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon name="calendar" size={16} />
            </motion.div>
            Calendar View
          </Button>
          <Button
            onClick={() => setViewMode('add')}
            variant="ghost"
            size="sm"
            className="gap-2 relative z-10"
            style={{
              color: viewMode === 'add' ? 'var(--color-primary-on)' : 'var(--color-text-primary)',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent'
            }}
          >
            <motion.div
              animate={{ 
                scale: viewMode === 'add' ? 1.1 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon name="heart" size={16} />
            </motion.div>
            Mood Journal
          </Button>
        </div>
      </motion.div>

      {viewMode === 'calendar' ? (
        <>
          {/* Calendar View */}
          <Card 
            className="motion-safe:animate-fade-in motion-reduce:animate-none"
            style={{
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <CardHeader>
              <CardTitle 
                className="flex items-center gap-2"
                style={{ 
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <Icon name="calendar" size={20} />
                Select a Date
              </CardTitle>
            </CardHeader>
            <CardContent 
              style={{
                padding: 'var(--spacing-4)',
              }}
            >
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  modifiers={{
                    hasEntry: getDatesWithEntries()
                  }}
                  modifiersStyles={{
                    hasEntry: {
                      backgroundColor: 'var(--color-primary-default)',
                      color: 'var(--color-primary-on)',
                      borderRadius: 'var(--radius-sm)'
                    }
                  }}
                  className="rounded-md border-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Entries */}
          <Card 
            className="motion-safe:animate-fade-in motion-reduce:animate-none"
            style={{
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <CardHeader>
              <CardTitle 
                className="flex items-center justify-between"
                style={{ 
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <span>{formatDateForDisplay(selectedDate)}</span>
                {isToday(selectedDate) && (
                  <Button
                    onClick={() => setViewMode('add')}
                    size="sm"
                    className="gap-2"
                    style={{
                      backgroundColor: 'var(--color-primary-default)',
                      color: 'var(--color-primary-on)',
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)'
                    }}
                  >
                    <Icon name="plus" size={14} />
                    Add Entry
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent 
              style={{
                padding: 'var(--spacing-4)',
              }}
            >
              {(() => {
                const dayEntries = getEntriesForDate(selectedDate);
                
                if (dayEntries.length === 0) {
                  return (
                    <div className="text-center py-8 space-y-3">
                      <Icon 
                        name="calendar-x" 
                        size={48} 
                        style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} 
                      />
                      <p style={{ color: 'var(--color-text-muted)' }}>
                        No entries for this date
                      </p>
                      {isToday(selectedDate) && (
                        <Button
                          onClick={() => setViewMode('add')}
                          className="gap-2"
                          style={{
                            backgroundColor: 'var(--color-primary-default)',
                            color: 'var(--color-primary-on)',
                            borderRadius: 'var(--ikan-component-border-radius)'
                          }}
                        >
                          <Icon name="plus" size={16} />
                          Add Today's Entry
                        </Button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {dayEntries.map((entry, index) => (
                      <motion.div 
                        key={entry.id}
                        className="p-4 rounded-lg border"
                        style={{ 
                          backgroundColor: 'var(--color-bg-muted)',
                          borderColor: 'var(--color-border-default)'
                        }}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: 'var(--shadow-md)',
                          transition: { duration: 0.2 }
                        }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div 
                              className="flex items-center gap-2 px-3 py-1 rounded-full"
                              style={{ 
                                backgroundColor: getMoodColor(entry.mood) + '20',
                                color: getMoodColor(entry.mood)
                              }}
                            >
                              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                {getMoodLabel(entry.mood)}
                              </span>
                            </div>
                            <div 
                              className="flex items-center gap-1"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              <Icon name="zap" size={14} />
                              <span style={{ fontSize: 'var(--text-sm)' }}>
                                Energy: {entry.energy}/5
                              </span>
                            </div>
                          </div>
                          
                          {entry.emotions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {entry.emotions.map((emotion) => (
                                <span
                                  key={emotion}
                                  className="px-2 py-1 rounded-full"
                                  style={{
                                    backgroundColor: 'var(--color-bg-card)',
                                    color: 'var(--color-text-muted)',
                                    fontSize: 'var(--text-xs)'
                                  }}
                                >
                                  {emotion}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <p 
                            style={{ 
                              fontSize: 'var(--text-sm)',
                              color: 'var(--color-text-primary)',
                              lineHeight: 'var(--line-height-md)'
                            }}
                          >
                            {entry.note}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Add Entry Form */
        <Card 
          className="motion-safe:animate-fade-in motion-reduce:animate-none"
          style={{
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-default)',
            // Mobile-responsive spacing
            padding: 0
          }}
        >
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-2"
            style={{ 
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-primary)'
            }}
          >
            <Icon name="plus" size={20} />
            {isToday(selectedDate) ? 'How are you feeling today?' : `Add entry for ${formatDateForDisplay(selectedDate)}`}
          </CardTitle>
        </CardHeader>
        <CardContent 
          style={{
            padding: 'var(--spacing-4)',
            gap: 'var(--spacing-6)'
          }}
          className="space-y-6"
        >
          {/* Mood Scale */}
          <div className="space-y-4">
            <label 
              className="block"
              style={{ 
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              Overall Mood
            </label>
            <div 
              className="grid grid-cols-5 gap-2 sm:flex sm:items-center sm:justify-between"
              style={{
                gap: 'var(--spacing-2)'
              }}
            >
              {moodLabels.map((mood, index) => (
                <motion.button
                  key={mood.value}
                  onClick={() => {
                    setCurrentMood(mood.value);
                    setSelectedMoodAnimation(mood.value);
                    setTimeout(() => setSelectedMoodAnimation(null), 500);
                  }}
                  className={cn(
                    // Mobile-responsive layout
                    "flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 touch-manipulation",
                    // Better focus states for accessibility
                    "focus:outline-none focus:ring-2 focus:ring-offset-2"
                  )}
                  style={{
                    backgroundColor: currentMood === mood.value 
                      ? mood.color + '20' 
                      : 'var(--color-bg-muted)',
                    borderColor: currentMood === mood.value 
                      ? mood.color 
                      : 'transparent',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: 'var(--radius-lg)',
                    // Mobile-first sizing with proper touch targets
                    minHeight: '60px',
                    minWidth: '60px',
                    padding: 'var(--spacing-2)',
                    // Focus ring color
                    ringColor: mood.color,
                    ringOpacity: 0.3
                  }}
                  aria-label={`Select mood: ${mood.label}`}
                  aria-pressed={currentMood === mood.value}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                >
                  <motion.span 
                    style={{ 
                      fontSize: '20px',
                      lineHeight: '1',
                      display: 'block'
                    }}
                    animate={{
                      scale: selectedMoodAnimation === mood.value ? [1, 1.5, 1] : 1,
                      rotate: selectedMoodAnimation === mood.value ? [0, 15, -15, 0] : 0
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut"
                    }}
                  >
                    {mood.emoji}
                  </motion.span>
                  <span 
                    className="text-center leading-none"
                    style={{ 
                      fontSize: 'var(--text-xs)',
                      color: currentMood === mood.value 
                        ? mood.color 
                        : 'var(--color-text-muted)',
                      fontWeight: currentMood === mood.value 
                        ? 'var(--font-weight-medium)' 
                        : 'var(--font-weight-regular)',
                      fontFamily: 'var(--font-family-base)',
                      lineHeight: 'var(--line-height-xs)'
                    }}
                  >
                    {mood.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Emotions */}
          <div className="space-y-4">
            <label 
              style={{ 
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              What emotions are you experiencing? (Select all that apply)
            </label>
            <div 
              className="flex flex-wrap gap-2"
              style={{
                gap: 'var(--spacing-2)'
              }}
            >
              {emotionOptions.map((emotion, index) => (
                <motion.button
                  key={emotion}
                  onClick={() => handleEmotionToggle(emotion)}
                  className={cn(
                    // Mobile-friendly button styling
                    "rounded-full touch-manipulation",
                    // Focus states for accessibility
                    "focus:outline-none focus:ring-2 focus:ring-offset-2"
                  )}
                  style={{
                    backgroundColor: selectedEmotions.includes(emotion)
                      ? 'var(--color-primary-default)'
                      : 'var(--color-bg-muted)',
                    color: selectedEmotions.includes(emotion)
                      ? 'var(--color-primary-on)'
                      : 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: selectedEmotions.includes(emotion)
                      ? 'var(--font-weight-medium)'
                      : 'var(--font-weight-regular)',
                    fontFamily: 'var(--font-family-base)',
                    // Mobile-first padding with proper touch targets
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    minHeight: '36px', // Adequate touch target
                    borderRadius: 'var(--radius-pill)',
                    // Focus ring
                    ringColor: 'var(--color-primary-default)',
                    ringOpacity: 0.3
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.15 }
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                  layout
                >
                  {emotion}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-4">
            <label 
              style={{ 
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              Energy Level: {currentEnergy}/5
            </label>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Low
              </span>
              <input
                type="range"
                min="1"
                max="5"
                value={currentEnergy}
                onChange={(e) => setCurrentEnergy(parseInt(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{ 
                  background: `linear-gradient(to right, var(--color-primary-default) 0%, var(--color-primary-default) ${(currentEnergy - 1) * 25}%, var(--color-bg-muted) ${(currentEnergy - 1) * 25}%, var(--color-bg-muted) 100%)`
                }}
              />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                High
              </span>
            </div>
          </div>

          {/* Journal Note */}
          <div className="space-y-4">
            <label 
              style={{ 
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              Journal Entry
            </label>
            <TextArea
              value={currentNote || ''}
              onChange={(e) => setCurrentNote(e.target.value || '')}
              placeholder="Write about your day, thoughts, or feelings..."
              rows={4}
              maxLength={500}
            />
            <div className="text-right">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {(currentNote || '').length}/500 characters
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitEntry}
            disabled={isSubmitting || !(currentNote || '').trim()}
            className="w-full gap-2"
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-base)',
              // Proper mobile touch target
              minHeight: '48px',
              padding: 'var(--spacing-3) var(--spacing-4)'
            }}
          >
            {isSubmitting ? (
              <>
                <Icon name="loader" size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="check" size={16} />
                {isToday(selectedDate) ? 'Log Today\'s Mood' : 'Save Entry'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      )}
    </div>
  );
}