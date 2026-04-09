import type React from 'react';
import { cn } from '../ui/utils';
import { MapPin, Star, Video, Phone, MessageCircle, Clock, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// Define Consultant type locally
export interface Consultant {
  id: string;
  name: string;
  credentials: string;
  category: string;
  photo: string;
  yearsExperience: number;
  languages: string[];
  location: string;
  sessionModes: ('online' | 'offline' | 'call' | 'chat')[];
  expertises: string[];
  topExpertises: string[];
  approaches: string[];
  concernsICanHelp: string[];
  pricing: {
    video: number;
    call: number;
    chat: number;
    offline?: number;
  };
  nextAvailableSlot: string;
  rating: number;
  reviewCount: number;
  bio: string;
  qualifications: string[];
  available: boolean;
}

interface ConsultantCardProps {
  consultant: Consultant;
  onClick?: () => void;
  onBook?: (e: React.MouseEvent) => void;
  className?: string;
}

export function ConsultantCard({ consultant, onClick, onBook, className }: ConsultantCardProps) {
  const minPrice = consultant.pricing ? Math.min(
    consultant.pricing.video || Infinity,
    consultant.pricing.call || Infinity,
    consultant.pricing.chat || Infinity,
    consultant.pricing.offline || Infinity
  ) : 0;

  const sessionIcons: Record<string, React.ReactNode> = {
    online: <Video className="w-[18px] h-[18px]" />,
    video: <Video className="w-[18px] h-[18px]" />,
    call: <Phone className="w-[18px] h-[18px]" />,
    chat: <MessageCircle className="w-[18px] h-[18px]" />,
    offline: <Home className="w-[18px] h-[18px]" />,
  };

  return (
    <div
      className={cn("consultant-card cursor-pointer", className)}
      onClick={onClick}
      style={{
        padding: '20px',
        gap: '0',
      }}
    >
      <div className="flex gap-4 w-full">
        {/* Photo */}
        <div className="shrink-0">
          <Avatar
            className="consultant-avatar"
            style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)' }}
          >
            <AvatarImage src={consultant.photo} alt={consultant.name} className="object-cover" />
            <AvatarFallback
              style={{
                backgroundColor: 'var(--color-accent-default)',
                color: 'var(--color-text-primary)',
                fontWeight: '500',
                fontSize: '18px',
              }}
            >
              {consultant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + Rating */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className="truncate"
                style={{
                  fontSize: '16px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  lineHeight: '1.3',
                  margin: 0,
                }}
              >
                {consultant.name}
              </h3>
              <p
                className="truncate"
                style={{
                  fontSize: '13px',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--grey-6)',
                  margin: '2px 0 0 0',
                  lineHeight: '1.3',
                }}
              >
                {consultant.credentials}
              </p>
            </div>

            {/* Rating pill */}
            <div
              className="shrink-0 flex items-center gap-1"
              style={{
                padding: '4px 8px',
                borderRadius: '8px',
                border: '1px solid var(--grey-2)',
                background: 'white',
              }}
            >
              <Star className="w-3 h-3" style={{ fill: 'var(--color-status-warning)', color: 'var(--color-status-warning)' }} />
              <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--grey-9)' }}>
                {consultant.rating ? consultant.rating.toFixed(1) : '0.0'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--grey-6)' }}>
                ({consultant.reviewCount || 0})
              </span>
            </div>
          </div>

          {/* Row 2: Category + Experience */}
          <div className="flex items-center gap-2" style={{ marginTop: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--grey-9)',
                background: 'var(--grey-1)',
                padding: '3px 8px',
                borderRadius: '6px',
                textTransform: 'capitalize',
              }}
            >
              {consultant.category ? consultant.category.replace('-', ' ') : 'General'}
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: '11px', color: 'var(--grey-6)' }}>
              <Clock className="w-3 h-3" />
              {consultant.yearsExperience || 0}+ yrs exp
            </span>
          </div>

          {/* Row 3: Location */}
          <div className="flex items-center gap-1" style={{ marginTop: '6px' }}>
            <MapPin className="w-3 h-3" style={{ color: 'var(--grey-6)', flexShrink: 0 }} />
            <span className="truncate" style={{ fontSize: '12px', color: 'var(--grey-6)' }}>
              {consultant.location}
            </span>
          </div>

          {/* Row 4: Specializations */}
          <div style={{ marginTop: '10px' }}>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--grey-5)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 6px 0',
              }}
            >
              Specializes In
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(consultant.topExpertises || []).slice(0, 3).map((expertise) => (
                <span
                  key={expertise}
                  style={{
                    fontSize: '11px',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--grey-8)',
                    background: 'var(--grey-1)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  {expertise}
                </span>
              ))}
              {(consultant.topExpertises?.length || 0) > 3 && (
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--grey-6)',
                    background: 'var(--grey-1)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                  }}
                >
                  +{consultant.topExpertises!.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--color-border-default)', margin: '12px 0' }} />

          {/* Row 5: Bottom bar */}
          <div className="flex items-center justify-between">
            {/* Session mode icons */}
            <div className="flex gap-1.5">
              {(consultant.sessionModes || []).slice(0, 4).map((mode) => (
                <div
                  key={mode}
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    background: 'var(--grey-1)',
                    color: 'var(--grey-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={mode}
                >
                  {sessionIcons[mode]}
                </div>
              ))}
            </div>

            {/* Price + Availability + Book */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p style={{ fontSize: '10px', color: 'var(--grey-5)', textTransform: 'uppercase', margin: 0, letterSpacing: '0.03em' }}>
                  Starting at
                </p>
                <p style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', color: 'var(--grey-9)', margin: 0 }}>
                  ₹{minPrice === Infinity ? '—' : minPrice}
                </p>
              </div>

              {consultant.nextAvailableSlot && consultant.available ? (
                <div
                  style={{
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    background: 'var(--color-status-success-light)',
                    color: 'var(--grey-9)',
                    fontSize: '11px',
                    fontWeight: 'var(--font-weight-medium)',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Next: {consultant.nextAvailableSlot}
                </div>
              ) : (
                <div
                  style={{
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    background: 'var(--grey-1)',
                    color: 'var(--grey-6)',
                    fontSize: '11px',
                    fontWeight: 'var(--font-weight-medium)',
                    borderRadius: '8px',
                  }}
                >
                  Unavailable
                </div>
              )}

              {onBook && (
                <Button
                  size="sm"
                  style={{
                    height: '36px',
                    minWidth: '44px',
                    borderRadius: '10px',
                    background: 'var(--color-primary-default)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'var(--font-weight-medium)',
                    padding: '0 16px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook(e);
                  }}
                >
                  Book
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultantCard;