import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../ui/utils';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultantName: string;
  timeSlots?: TimeSlot[];
  onBook: (slotId: string) => void;
}

const defaultTimeSlots: TimeSlot[] = [
  { id: '1', time: '9:00 AM', available: true },
  { id: '2', time: '10:00 AM', available: true },
  { id: '3', time: '11:00 AM', available: false },
  { id: '4', time: '1:00 PM', available: true },
  { id: '5', time: '2:30 PM', available: true },
  { id: '6', time: '4:00 PM', available: true },
];

export function BookingModal({ 
  isOpen, 
  onClose, 
  consultantName, 
  timeSlots = defaultTimeSlots,
  onBook 
}: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex justify-between items-center">
          <div>
            <h2 className="text-[24px] font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Book Consultation</h2>
            <p className="text-[16px]" style={{ color: 'var(--color-text-muted)' }}>with {consultantName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-[14px] font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>Select a Time</p>
          <div className="time-slot-grid">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.id)}
                className={cn(
                  "time-slot",
                  selectedSlot === slot.id && "selected",
                  !slot.available && "opacity-50 cursor-not-allowed border-transparent"
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        <button 
          className="modal-action-btn"
          disabled={!selectedSlot}
          style={{ opacity: !selectedSlot ? 0.5 : 1, cursor: !selectedSlot ? 'not-allowed' : 'pointer' }}
          onClick={() => selectedSlot && onBook(selectedSlot)}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}