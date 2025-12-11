import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { EmojiWidget } from '../atoms/EmojiWidget';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface TrackerJournalTileProps {
  date?: Date;
  initialMood?: number;
  initialJournalText?: string;
  onMoodChange?: (mood: number) => void;
  onJournalChange?: (text: string) => void;
  onSave?: (data: { mood: number; journalText: string; date: Date }) => void;
  onDelete?: () => void;
  readonly?: boolean;
  className?: string;
}

export function TrackerJournalTile({
  date = new Date(),
  initialMood,
  initialJournalText = '',
  onMoodChange,
  onJournalChange,
  onSave,
  onDelete,
  readonly = false,
  className
}: TrackerJournalTileProps) {
  const [mood, setMood] = useState<number | undefined>(initialMood);
  const [journalText, setJournalText] = useState(initialJournalText);
  const [isEditing, setIsEditing] = useState(!readonly && !initialMood && !initialJournalText);
  const [isSaving, setIsSaving] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleMoodChange = (newMood: number) => {
    setMood(newMood);
    onMoodChange?.(newMood);
  };

  const handleJournalChange = (newText: string) => {
    setJournalText(newText);
    onJournalChange?.(newText);
  };

  const handleSave = async () => {
    if (!mood && !journalText.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave?.({
        mood: mood || 3,
        journalText: journalText.trim(),
        date
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    if (!readonly) {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setMood(initialMood);
    setJournalText(initialJournalText);
    setIsEditing(false);
  };

  const hasContent = mood || journalText.trim();

  return (
    <Card 
      className={cn(
        "transition-all duration-200 ease-out",
        "hover:shadow-md",
        className
      )}
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)'
      }}
    >
      <CardContent 
        className="p-4"
        style={{ padding: 'var(--spacing-4)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Left: Mood Selector */}
          <div className="flex-shrink-0">
            <div className="space-y-2">
              <h3 
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}
              >
                How are you feeling?
              </h3>
              <EmojiWidget
                moodValue={mood}
                onMoodChange={handleMoodChange}
                disabled={readonly || (!isEditing && hasContent)}
                size="md"
                animation="bounce"
              />
            </div>
          </div>

          {/* Center: Journal Text */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {formatDate(date)}
              </h3>
              {hasContent && !isEditing && !readonly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="gap-1"
                >
                  <Icon name="edit" size={14} />
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <Textarea
                value={journalText}
                onChange={(e) => handleJournalChange(e.target.value)}
                placeholder="Write about your day, feelings, or anything on your mind..."
                className="min-h-[120px] resize-none"
                style={{
                  backgroundColor: 'var(--color-bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--line-height-md)'
                }}
              />
            ) : (
              <div 
                className={cn(
                  "min-h-[120px] p-3 rounded-md",
                  !journalText.trim() && "flex items-center justify-center"
                )}
                style={{
                  backgroundColor: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--line-height-md)',
                  color: journalText.trim() ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
                }}
              >
                {journalText.trim() || (
                  <span className="italic">
                    Click edit to add your thoughts for today
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex-shrink-0">
            <div className="flex flex-row lg:flex-col gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || (!mood && !journalText.trim())}
                    size="sm"
                    className="gap-1"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={14} />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                    className="gap-1"
                  >
                    <Icon name="close" size={14} />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  {onDelete && hasContent && (
                    <Button
                      onClick={onDelete}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon name="delete" size={14} />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TrackerJournalTile;