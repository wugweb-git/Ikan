import React, { useState } from 'react';
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
            <h2 className="text-[24px] font-semibold text-[#1A1A1A] mb-1">Book Consultation</h2>
            <p className="text-[16px] text-[#757575]">with {consultantName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
          >
            <X size={24} color="#1A1A1A" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-[14px] font-medium text-[#1A1A1A] mb-3">Select a Time</p>
          <div className="time-slot-grid">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.id)}
                className={cn(
                  "time-slot",
                  selectedSlot === slot.id && "selected",
                  !slot.available && "opacity-50 cursor-not-allowed bg-[#F5F5F5] border-transparent"
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
