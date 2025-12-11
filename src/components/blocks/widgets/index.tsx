import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Calendar } from '../../ui/calendar';
import { CheckCircleIcon, ErrorIcon } from '../../Icon';
import { cn } from '../../ui/utils';

interface WellbeingSnapshotWidgetProps {
  className?: string;
  interactions?: string[];
}

export function WellbeingSnapshotWidget({ className, interactions }: WellbeingSnapshotWidgetProps) {
  return (
    <Card className={cn("flex-1", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <CheckCircleIcon variant="filled" size={20} className="text-status-success" />
          Wellbeing Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Score</span>
            <Badge variant="secondary">Good</Badge>
          </div>
          <Progress value={75} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Mood</div>
            <div className="font-medium">😊 Good</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Sleep</div>
            <div className="font-medium">7.5 hrs</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NeedsAttentionWidgetProps {
  className?: string;
  interactions?: string[];
}

export function NeedsAttentionWidget({ className, interactions }: NeedsAttentionWidgetProps) {
  const needsAttention = [
    { title: "Anxiety Assessment", type: "assessment", urgent: true },
    { title: "Weekly Check-in", type: "check-in", urgent: false },
    { title: "Sleep Tracking", type: "tracking", urgent: false }
  ];

  return (
    <Card className={cn("flex-1", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ErrorIcon variant="outline" size={20} className="text-status-warning" />
          Needs Attention
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {needsAttention.map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="space-y-1">
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground capitalize">{item.type}</div>
              </div>
              {item.urgent && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface MoodJournalCalendarProps {
  className?: string;
  interactions?: string[];
  onSelectDate?: (date: Date) => void;
}

export function MoodJournalCalendar({ className, interactions, onSelectDate }: MoodJournalCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && onSelectDate) {
      onSelectDate(date);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Mood Journal</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          className="rounded-md border"
          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
        />
        <div className="mt-4 text-sm text-muted-foreground">
          Select a date to view or record your mood
        </div>
      </CardContent>
    </Card>
  );
}

export default {
  WellbeingSnapshotWidget,
  NeedsAttentionWidget,
  MoodJournalCalendar
};