import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { BookingCalendar } from '../admin/BookingCalendar';
import { Calendar } from '../ui/calendar';
import { addDays } from 'date-fns';

export function UIKitComplexForms() {
  // Mood Journal Calendar State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const bookedDates = [new Date(), addDays(new Date(), -1), addDays(new Date(), -3)];

  const handleBookSlot = (date: Date, time: string) => {
    alert(`Booked ${date.toLocaleDateString()} at ${time}`);
  };

  return (
    <div className="space-y-8">
      {/* Consultation Booking Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Calendar</CardTitle>
          <CardDescription>
            Complex component used in `AdminConsultationManager` for scheduling. 
            Includes slot generation and booking logic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto border rounded-xl p-4 bg-[var(--color-bg-page)]">
            <BookingCalendar 
              professionalName="Dr. Sarah Smith"
              onBookSlot={handleBookSlot}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mood Journal Calendar Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Journal Calendar</CardTitle>
          <CardDescription>
            Specific configuration of the Calendar component used in `MoodJournal.tsx`.
            Highlights days with entries using custom modifiers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm mx-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                booked: (date) => bookedDates.some(d => d.toDateString() === date.toDateString())
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  color: 'var(--color-primary-default)'
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              * Underlined dates indicate logged mood entries.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}