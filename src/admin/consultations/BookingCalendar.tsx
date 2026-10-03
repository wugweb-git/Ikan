import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { Card, CardContent } from '../ui/card';

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

interface BookingCalendarProps {
  professionalName?: string;
  onBookSlot?: (date: Date, time: string) => void;
}

export function BookingCalendar({ professionalName, onBookSlot }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate time slots for a day (9 AM to 6 PM)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      // Randomly mark some as booked for demo
      const booked = Math.random() > 0.7;
      slots.push({
        time,
        available: !booked,
        booked
      });
    }
    return slots;
  };

  const [timeSlots] = useState(generateTimeSlots());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    setSelectedTime(null);
  };

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime && onBookSlot) {
      onBookSlot(selectedDate, selectedTime);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)'
        }}>
          <Calendar className="w-5 h-5 inline mr-2" />
          Book Consultation with {professionalName}
        </h3>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)'
        }}>
          Select a date and time slot for your consultation
        </p>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h4 style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-muted)',
                  padding: 'var(--spacing-2)'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={day}
                  onClick={() => !isPast && handleDateClick(day)}
                  disabled={isPast}
                  style={{
                    padding: 'var(--spacing-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isSelected ? 'var(--font-weight-medium)' : 'inherit',
                    backgroundColor: isSelected
                      ? 'var(--color-primary-default)'
                      : isToday
                      ? 'var(--color-accent-default)'
                      : 'transparent',
                    color: isSelected
                      ? 'var(--color-primary-on)'
                      : isPast
                      ? 'var(--color-text-muted)'
                      : 'var(--color-text-primary)',
                    border: '1px solid',
                    borderColor: isSelected
                      ? 'var(--color-primary-default)'
                      : 'transparent',
                    cursor: isPast ? 'not-allowed' : 'pointer',
                    opacity: isPast ? 0.4 : 1
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h4 style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-1)'
              }}>
                <Clock className="w-4 h-4 inline mr-2" />
                Available Time Slots
              </h4>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)'
              }}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && handleTimeSlotClick(slot.time)}
                  disabled={!slot.available}
                  style={{
                    padding: 'var(--spacing-3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: selectedTime === slot.time ? 'var(--font-weight-medium)' : 'inherit',
                    backgroundColor: selectedTime === slot.time
                      ? 'var(--color-primary-default)'
                      : slot.available
                      ? 'var(--color-bg-muted)'
                      : 'var(--color-bg-page)',
                    color: selectedTime === slot.time
                      ? 'var(--color-primary-on)'
                      : slot.available
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                    border: '1px solid',
                    borderColor: selectedTime === slot.time
                      ? 'var(--color-primary-default)'
                      : 'var(--color-border-default)',
                    cursor: slot.available ? 'pointer' : 'not-allowed',
                    opacity: slot.available ? 1 : 0.5
                  }}
                >
                  {slot.time}
                  {slot.booked && (
                    <AdminStatusBadge status="pending" label="Booked" />
                  )}
                </button>
              ))}
            </div>

            {selectedTime && (
              <div className="mt-6 flex items-center justify-between p-4 rounded-lg" style={{
                backgroundColor: 'var(--color-success-subtle)',
                border: '1px solid var(--color-success-default)'
              }}>
                <div>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}>
                    Selected: {selectedDate.toLocaleDateString()} at {selectedTime}
                  </p>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)'
                  }}>
                    60 minute consultation session
                  </p>
                </div>
                <Button
                  onClick={handleConfirmBooking}
                  style={{
                    backgroundColor: 'var(--color-success-default)',
                    color: 'white'
                  }}
                >
                  Confirm Booking
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}