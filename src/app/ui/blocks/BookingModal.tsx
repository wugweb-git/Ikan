import { useState, useEffect } from 'react';
import { X, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils';
import { apiClient } from '../../../shared/api-client';
import { useNotifications } from '../../../shared/contexts/NotificationContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultantId?: string;
  consultantName: string;
  sessionModes?: string[];
  pricing?: { video?: number; call?: number; chat?: number; offline?: number };
  onBook: (bookingData: { date: string; time: string; mode: string }) => void;
}

export function BookingModal({ 
  isOpen, 
  onClose, 
  consultantId,
  consultantName, 
  sessionModes = ['video', 'call'],
  pricing,
  onBook 
}: BookingModalProps) {
  const { showToast } = useNotifications();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>(sessionModes[0] || 'video');
  const [submitting, setSubmitting] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate next 7 days starting from today + weekOffset
  const getAvailableDates = () => {
    const dates: { date: string; label: string; dayName: string; isToday: boolean }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + (weekOffset * 7) + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push({ date: dateStr, label, dayName, isToday: i === 0 && weekOffset === 0 });
    }
    return dates;
  };

  // Generate time slots (9am–7pm, 30min intervals)
  const getTimeSlots = () => {
    const slots: string[] = [];
    for (let h = 9; h <= 19; h++) {
      slots.push(`${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`);
      if (h < 19) {
        slots.push(`${h > 12 ? h - 12 : h}:30 ${h >= 12 ? 'PM' : 'AM'}`);
      }
    }
    return slots;
  };

  const dates = getAvailableDates();
  const timeSlots = getTimeSlots();

  // True when the slot's start time is already in the past — only applies to
  // today's date; future dates keep all slots available.
  const isSlotInPast = (slot: string): boolean => {
    if (!selectedDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayStr) return false;
    const match = slot.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return false;
    let hour = parseInt(match[1], 10);
    const min = parseInt(match[2], 10);
    if (match[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (match[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
    const slotDate = new Date();
    slotDate.setHours(hour, min, 0, 0);
    return slotDate.getTime() <= Date.now();
  };

  // Auto-select today on open
  useEffect(() => {
    if (isOpen && !selectedDate) {
      setSelectedDate(dates[0]?.date || '');
      setSelectedMode(sessionModes[0] || 'video');
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate('');
      setSelectedTime('');
      setWeekOffset(0);
      setSubmitting(false);
    }
  }, [isOpen]);

  const getModePrice = (mode: string) => {
    if (!pricing) return null;
    const p = (pricing as any)[mode];
    return p ? `₹${p}` : null;
  };

  const modeLabels: Record<string, string> = {
    video: 'Video Call',
    online: 'Video Call',
    call: 'Phone Call',
    chat: 'Chat',
    offline: 'In-Person'
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      // Save booking to KV via API
      if (consultantId) {
        await apiClient.request('/bookings', {
          method: 'POST',
          body: JSON.stringify({
            consultant_id: consultantId,
            consultant_name: consultantName,
            date: selectedDate,
            time: selectedTime,
            mode: selectedMode,
            status: 'pending'
          })
        }, true);
      }
      onBook({ date: selectedDate, time: selectedTime, mode: selectedMode });
      showToast('success', 'Booking Requested', `Session with ${consultantName} on ${selectedDate} at ${selectedTime}`);
      onClose();
    } catch (err) {
      console.error('Booking error:', err);
      showToast('error', 'Booking Failed', 'Could not complete your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden"
        style={{ 
          backgroundColor: 'var(--color-bg-card)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border-default)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', margin: 0 }}>
              Book Session
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
              with {consultantName}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '16px 20px' }}>

          {/* Session Mode */}
          {sessionModes.length > 1 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Session Type
              </p>
              <div className="flex flex-wrap gap-2">
                {sessionModes.map(mode => {
                  const price = getModePrice(mode);
                  return (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={cn("transition-all")}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        border: selectedMode === mode ? '2px solid var(--color-primary-default)' : '1px solid var(--color-border-default)',
                        backgroundColor: selectedMode === mode ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                        color: selectedMode === mode ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                      }}
                    >
                      {modeLabels[mode] || mode}
                      {price && <span style={{ fontSize: 'var(--text-xs)', marginLeft: '6px', opacity: 0.8 }}>{price}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div style={{ marginBottom: '20px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                <Calendar className="inline w-3.5 h-3.5 mr-1" style={{ verticalAlign: '-2px' }} />
                Select Date
              </p>
              <div className="flex gap-1">
                <button 
                  onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                  disabled={weekOffset === 0}
                  className="p-1.5 rounded-md disabled:opacity-30"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  disabled={weekOffset >= 3}
                  className="p-1.5 rounded-md disabled:opacity-30"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {dates.map(d => (
                <button
                  key={d.date}
                  onClick={() => { setSelectedDate(d.date); setSelectedTime(''); }}
                  className="flex flex-col items-center py-2.5 rounded-xl transition-all"
                  style={{
                    backgroundColor: selectedDate === d.date ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
                    color: selectedDate === d.date ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                    border: d.isToday && selectedDate !== d.date ? '2px solid var(--color-primary-default)' : '2px solid transparent',
                    minHeight: '60px',
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 'var(--font-weight-medium)', opacity: 0.7, textTransform: 'uppercase' }}>{d.dayName}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', marginTop: '2px' }}>{d.label.split(' ')[1]}</span>
                  <span style={{ fontSize: '9px', opacity: 0.6, marginTop: '1px' }}>{d.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                <Clock className="inline w-3.5 h-3.5 mr-1" style={{ verticalAlign: '-2px' }} />
                Select Time
              </p>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(slot => {
                  const past = isSlotInPast(slot);
                  return (
                  <button
                    key={slot}
                    onClick={() => !past && setSelectedTime(slot)}
                    disabled={past}
                    className="transition-all"
                    style={{
                      padding: '10px 4px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                      border: selectedTime === slot ? '2px solid var(--color-primary-default)' : '1px solid var(--color-border-default)',
                      backgroundColor: selectedTime === slot ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                      color: selectedTime === slot ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      opacity: past ? 0.4 : 1,
                      cursor: past ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {slot}
                  </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', borderTop: '1px solid var(--color-border-default)' }}>
          <button
            disabled={!selectedDate || !selectedTime || submitting}
            onClick={handleConfirm}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: (!selectedDate || !selectedTime) ? 'var(--color-bg-muted)' : 'var(--color-primary-default)',
              color: (!selectedDate || !selectedTime) ? 'var(--color-text-muted)' : 'var(--color-text-inverse)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              border: 'none',
              cursor: (!selectedDate || !selectedTime || submitting) ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {submitting ? 'Booking...' : selectedTime ? `Confirm ${selectedTime} Booking` : 'Select a time to continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
