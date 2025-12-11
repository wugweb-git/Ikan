import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { EmojiWidget } from './atoms/EmojiWidget';
import { apiClient, JournalEntry } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { format, isToday } from '../lib/date-utils';
import { CheckCircle, Calendar, Heart } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const moodOptions = [
  { emoji: '😢', label: 'Very Sad', value: 1, color: '#ef4444' },
  { emoji: '😔', label: 'Sad', value: 2, color: '#f97316' },
  { emoji: '😐', label: 'Neutral', value: 3, color: '#eab308' },
  { emoji: '🙂', label: 'Good', value: 4, color: '#22c55e' },
  { emoji: '😊', label: 'Great', value: 5, color: '#16a34a' }
];

interface MoodTrackerProps {
  selectedDate?: string;
  onEntryCreated?: (entry: JournalEntry) => void;
}

export function MoodTracker({ selectedDate, onEntryCreated }: MoodTrackerProps) {
  const { user } = useAuth();
  const { canMakeApiCalls, isAuthenticated } = useAuthGuard();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journalText, setJournalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEntry, setExistingEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const dateToUse = selectedDate || format(new Date(), 'yyyy-MM-dd');
  const isCurrentDate = isToday(new Date(dateToUse));

  useEffect(() => {
    if (user && canMakeApiCalls) {
      loadExistingEntry();
    }
  }, [user, dateToUse, canMakeApiCalls]); // Wait for authentication before loading

  const loadExistingEntry = async () => {
    try {
      setLoading(true);
      
      const { entry } = await apiClient.getJournalEntryByDate(dateToUse);
      
      if (entry) {
        setExistingEntry(entry);
        setSelectedMood(entry.mood_rating);
        setJournalText(entry.freehand_text_content || '');
      } else {
        setExistingEntry(null);
        setSelectedMood(null);
        setJournalText('');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('Failed to load existing entry:', errorMessage);
      
      // Handle different types of errors
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Authentication failed')) {
        console.log('📦 Authentication issue, journal entry will use local state only');
      } else {
        console.log('📦 API issue, falling back to local storage');
      }
      
      // Try to fallback to offline mode if API fails
      try {
        const offlineKey = `mood-${user?.user_id}-${dateToUse}`;
        const savedEntry = localStorage.getItem(offlineKey);
        
        if (savedEntry) {
          const entry = JSON.parse(savedEntry);
          setExistingEntry(entry);
          setSelectedMood(entry.mood_rating);
          setJournalText(entry.freehand_text_content || '');
          console.log('✅ Loaded mood entry from local storage');
        } else {
          // Reset state on error - this is normal for new entries
          setExistingEntry(null);
          setSelectedMood(null);
          setJournalText('');
          console.log('📝 No existing entry found, starting fresh');
        }
      } catch (localError) {
        console.warn('Local storage access failed:', localError);
        // Reset state on error
        setExistingEntry(null);
        setSelectedMood(null);
        setJournalText('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
  };

  const handleSubmit = async () => {
    if (!user || !selectedMood) {
      toast.error('Please select a mood before saving');
      return;
    }

    if (!canMakeApiCalls) {
      toast.error('Authentication in progress, please wait a moment');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { entry } = await apiClient.createJournalEntry(
        dateToUse,
        selectedMood,
        journalText.trim() || undefined
      );

      setExistingEntry(entry);
      onEntryCreated?.(entry);
      
      toast.success(
        existingEntry ? 'Mood entry updated!' : 'Mood entry saved!',
        {
          description: isCurrentDate ? 
            `Your mood for today has been recorded` : 
            `Your mood for ${format(new Date(dateToUse), 'MMM d')} has been recorded`,
        }
      );
    } catch (error) {
      console.error('Failed to save mood entry:', error);
      toast.error('Failed to save mood entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMoodOption = moodOptions.find(option => option.value === selectedMood);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p style={{ color: 'var(--color-text-muted)' }}>
            Please sign in to track your mood
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" 
                 style={{ borderColor: 'var(--color-primary-default)' }}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Heart size={20} style={{ color: 'var(--color-primary-default)' }} />
          Daily Mood Check-in
          {existingEntry && (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle size={12} className="mr-1" />
              Completed
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <Calendar size={14} />
          {isCurrentDate ? 'Today' : format(new Date(dateToUse), 'MMMM d, yyyy')}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="space-y-4">
          <label 
            className="block font-medium"
            style={{ 
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            How are you feeling {isCurrentDate ? 'today' : 'on this day'}?
          </label>
          
          <div className="flex justify-center">
            <EmojiWidget
              moodValue={selectedMood || undefined}
              onMoodChange={handleMoodSelect}
              disabled={isSubmitting}
              size="lg"
              animation="bounce"
            />
          </div>
        </div>

        {/* Selected mood display */}
        {selectedMoodOption && (
          <div 
            className="p-3 rounded-lg flex items-center gap-3"
            style={{ 
              backgroundColor: `${selectedMoodOption.color}10`,
              border: `1px solid ${selectedMoodOption.color}30`,
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span className="text-xl">{selectedMoodOption.emoji}</span>
            <div>
              <p 
                className="font-medium"
                style={{ 
                  color: selectedMoodOption.color,
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                {selectedMoodOption.label}
              </p>
              <p 
                style={{ 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--color-text-muted)'
                }}
              >
                Mood selected for {isCurrentDate ? 'today' : format(new Date(dateToUse), 'MMM d')}
              </p>
            </div>
          </div>
        )}

        {/* Journal Text (Optional) */}
        <div className="space-y-3">
          <label 
            className="block font-medium"
            style={{ 
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            What's on your mind? (Optional)
          </label>
          
          <Textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Write about your day, thoughts, or feelings..."
            className="min-h-[100px] resize-y"
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--color-bg-input)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)'
            }}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMood || isSubmitting}
          className="w-full gap-2"
          style={{
            backgroundColor: selectedMoodOption?.color || 'var(--color-primary-default)',
            color: 'white',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              {existingEntry ? 'Update Entry' : 'Save Entry'}
            </>
          )}
        </Button>

        {/* Entry saved confirmation */}
        {existingEntry && (
          <div 
            className="text-center p-3 rounded-lg"
            style={{ 
              backgroundColor: 'var(--color-status-success-light)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <p 
              style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-status-success)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              ✓ Entry saved for {isCurrentDate ? 'today' : format(new Date(dateToUse), 'MMM d, yyyy')}
            </p>
            <p 
              style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                marginTop: '4px'
              }}
            >
              Saved at {format(new Date(existingEntry.timestamp), 'h:mm a')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}