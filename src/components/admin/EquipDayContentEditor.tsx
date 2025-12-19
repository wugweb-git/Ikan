import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';

interface Day {
  day: number;
  title: string;
  content: string;
}

interface EquipDayContentEditorProps {
  days: Day[];
  onChange: (days: Day[]) => void;
  durationDays: number;
}

export function EquipDayContentEditor({ days, onChange, durationDays }: EquipDayContentEditorProps) {
  
  const handleAddDay = () => {
    const nextDayNumber = days.length > 0 
      ? Math.max(...days.map(d => d.day)) + 1 
      : 1;
    
    onChange([
      ...days,
      { day: nextDayNumber, title: '', content: '' }
    ]);
  };

  const handleRemoveDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index);
    onChange(newDays);
  };

  const handleUpdateDay = (index: number, field: keyof Day, value: string | number) => {
    const newDays = [...days];
    newDays[index] = { ...newDays[index], [field]: value };
    onChange(newDays);
  };

  const sortedDays = [...days].sort((a, b) => a.day - b.day);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
            Daily Content
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
            Build day-by-day content for your {durationDays}-day program
          </p>
        </div>
        <Button onClick={handleAddDay} className="gap-2">
          <Plus size={16} />
          Add Day
        </Button>
      </div>

      {/* Empty State */}
      {sortedDays.length === 0 && (
        <div 
          className="p-12 text-center rounded-lg"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        >
          <BookOpen size={48} style={{ margin: '0 auto var(--spacing-4)', color: 'var(--color-text-muted)', opacity: 0.5 }} />
          <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
            No content yet
          </h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
            Start by adding daily content for your program
          </p>
          <Button onClick={handleAddDay} className="gap-2">
            <Plus size={16} />
            Add First Day
          </Button>
        </div>
      )}

      {/* Day Cards */}
      <div className="space-y-4">
        {sortedDays.map((day, index) => {
          const actualIndex = days.findIndex(d => d.day === day.day);
          
          return (
            <Card 
              key={actualIndex}
              style={{ borderColor: 'var(--color-border-default)' }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Grip Icon */}
                  <div className="pt-2">
                    <GripVertical size={20} style={{ color: 'var(--color-text-muted)' }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    {/* Day Number */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label>Day Number</Label>
                        <Input
                          type="number"
                          min="1"
                          max={durationDays}
                          value={day.day}
                          onChange={(e) => handleUpdateDay(actualIndex, 'day', parseInt(e.target.value) || 1)}
                          placeholder="1"
                        />
                      </div>
                      <div className="pt-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDay(actualIndex)}
                          className="gap-2"
                          style={{ color: 'var(--color-status-danger)' }}
                        >
                          <Trash2 size={16} />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <Label>Day Title</Label>
                      <Input
                        value={day.title}
                        onChange={(e) => handleUpdateDay(actualIndex, 'title', e.target.value)}
                        placeholder="e.g., Understanding Anxiety"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={day.content}
                        onChange={(e) => handleUpdateDay(actualIndex, 'content', e.target.value)}
                        placeholder="Write the detailed content for this day. You can use markdown formatting if needed..."
                        rows={8}
                        style={{ fontFamily: 'var(--font-family-base)' }}
                      />
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                        {day.content.length} characters
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      {sortedDays.length > 0 && (
        <div 
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Total days created: {sortedDays.length} / {durationDays}
            </span>
            {sortedDays.length < durationDays && (
              <Button variant="outline" onClick={handleAddDay} className="gap-2">
                <Plus size={16} />
                Add Another Day
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// BookOpen icon import
function BookOpen({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
