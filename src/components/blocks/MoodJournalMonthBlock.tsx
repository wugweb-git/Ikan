import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

interface MoodEntry {
  date: Date;
  mood: string;
  emoji: string;
  note?: string;
}

interface MoodJournalCalendarProps {
  selectedDate?: Date;
  moodEntries?: MoodEntry[];
  onSelectDate?: (date: Date) => void;
}

function MoodJournalCalendar({ selectedDate, moodEntries = [], onSelectDate }: MoodJournalCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getMoodForDate = (date: Date) => {
    return moodEntries.find(entry => isSameDay(entry.date, date));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle 
            style={{ 
              fontSize: 'var(--text-lg)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="p-2"
            >
              <Icon name="chevronLeft" size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="p-2"
            >
              <Icon name="chevronRight" size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div 
              key={day}
              className="p-2 text-center text-xs font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date) => {
            const moodEntry = getMoodForDate(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => onSelectDate?.(date)}
                className={cn(
                  "p-2 h-12 rounded-md transition-all duration-200 relative",
                  "hover:bg-opacity-80 focus:outline-none focus:ring-2",
                  isSelected && "ring-2",
                  isTodayDate && "font-semibold"
                )}
                style={{
                  backgroundColor: isSelected ? 'var(--color-primary-default)' : 
                                   isTodayDate ? 'var(--color-accent-default)' : 'transparent',
                  color: isSelected ? 'var(--color-primary-on)' : 
                         isTodayDate ? 'var(--color-accent-on)' : 'var(--color-text-primary)',
                  borderRadius: 'var(--radius-md)',
                  ringColor: 'var(--color-primary-default)',
                  fontSize: 'var(--text-sm)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = isTodayDate ? 'var(--color-accent-default)' : 'transparent';
                  }
                }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span>{format(date, 'd')}</span>
                  {moodEntry && (
                    <span className="text-xs mt-1">{moodEntry.emoji}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface MoodJournalEmojiSetProps {
  selectedMood?: string;
  onSelectMood?: (mood: string, emoji: string) => void;
}

function MoodJournalEmojiSet({ selectedMood, onSelectMood }: MoodJournalEmojiSetProps) {
  const moodOptions = [
    { mood: 'terrible', emoji: '😔', label: 'Terrible', color: '#D4183D' },
    { mood: 'bad', emoji: '😞', label: 'Bad', color: '#EAB308' },
    { mood: 'okay', emoji: '😐', label: 'Okay', color: '#8B5CF6' },
    { mood: 'good', emoji: '😊', label: 'Good', color: '#22C55E' },
    { mood: 'amazing', emoji: '😄', label: 'Amazing', color: '#10B981' }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle 
          style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}
        >
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-2">
          {moodOptions.map((option) => {
            const isSelected = selectedMood === option.mood;
            
            return (
              <button
                key={option.mood}
                onClick={() => onSelectMood?.(option.mood, option.emoji)}
                className={cn(
                  "flex-1 flex flex-col items-center p-4 rounded-lg transition-all duration-200",
                  "hover:scale-105 focus:outline-none focus:ring-2 animate-scaleIn",
                  isSelected && "ring-2"
                )}
                style={{
                  backgroundColor: isSelected ? option.color + '20' : 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  ringColor: option.color,
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.backgroundColor = option.color + '10';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                  }
                }}
              >
                <span className="text-2xl mb-2">{option.emoji}</span>
                <span 
                  style={{ 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: isSelected ? option.color : 'var(--color-text-muted)'
                  }}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface MoodJournalMonthBlockProps {
  selectedDate?: Date;
  selectedMood?: string;
  moodEntries?: MoodEntry[];
  onSelectDate?: (date: Date) => void;
  onSelectMood?: (mood: string, emoji: string) => void;
  className?: string;
}

export function MoodJournalMonthBlock({
  selectedDate,
  selectedMood,
  moodEntries,
  onSelectDate,
  onSelectMood,
  className
}: MoodJournalMonthBlockProps) {
  // Sample mood entries for demonstration
  const defaultMoodEntries: MoodEntry[] = [
    { date: new Date(2024, 0, 15), mood: 'good', emoji: '😊', note: 'Had a great therapy session' },
    { date: new Date(2024, 0, 14), mood: 'okay', emoji: '😐', note: 'Neutral day, did some meditation' },
    { date: new Date(2024, 0, 13), mood: 'amazing', emoji: '😄', note: 'Completed a challenging workout' },
    { date: new Date(2024, 0, 12), mood: 'bad', emoji: '😞', note: 'Feeling anxious about work' },
    { date: new Date(2024, 0, 11), mood: 'good', emoji: '😊', note: 'Spent quality time with family' }
  ];

  const displayMoodEntries = moodEntries || defaultMoodEntries;

  return (
    <div 
      className={cn("w-full space-y-6", className)}
      style={{
        minWidth: 'var(--constraint-content-min)',
        maxWidth: 'var(--constraint-content-max)',
        gap: 'var(--spacing-3)'
      }}
    >
      <MoodJournalCalendar
        selectedDate={selectedDate}
        moodEntries={displayMoodEntries}
        onSelectDate={onSelectDate}
      />
      
      <MoodJournalEmojiSet
        selectedMood={selectedMood}
        onSelectMood={onSelectMood}
      />

      {selectedDate && (
        <Card className="animate-fadeIn">
          <CardHeader className="pb-3">
            <CardTitle 
              style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const moodEntry = displayMoodEntries.find(entry => 
                isSameDay(entry.date, selectedDate)
              );
              
              if (moodEntry) {
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{moodEntry.emoji}</span>
                      <span 
                        style={{ 
                          fontSize: 'var(--text-base)', 
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {moodEntry.mood}
                      </span>
                    </div>
                    {moodEntry.note && (
                      <p style={{ 
                        fontSize: 'var(--text-sm)', 
                        color: 'var(--color-text-muted)',
                        lineHeight: 'var(--line-height-md)'
                      }}>
                        {moodEntry.note}
                      </p>
                    )}
                  </div>
                );
              } else {
                return (
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-muted)'
                  }}>
                    No mood entry for this date. Select a mood above to record how you're feeling.
                  </p>
                );
              }
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}