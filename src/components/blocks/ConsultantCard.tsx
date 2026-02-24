import React from 'react';
import { cn } from '../ui/utils';
import { MapPin, Star, Video, Phone, MessageCircle, Clock, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

// Define Consultant type locally
export interface Consultant {
  id: string;
  name: string;
  credentials: string;
  category: 'therapist' | 'psychiatrist' | 'counselor' | 'family-therapist';
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
  // Get minimum price for display - handle missing pricing data
  const minPrice = consultant.pricing ? Math.min(
    consultant.pricing.video || Infinity,
    consultant.pricing.call || Infinity,
    consultant.pricing.chat || Infinity,
    consultant.pricing.offline || Infinity
  ) : 0;

  // Get session mode icons
  const sessionIcons = {
    online: <Video className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    call: <Phone className="w-4 h-4" />,
    chat: <MessageCircle className="w-4 h-4" />,
    offline: <Home className="w-4 h-4" />
  };

  return (
    <div
      className={cn(
        "consultant-card cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Top Section: Photo and Main Info */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Photo - Using strict 16px radius for inner element */}
          <div className="shrink-0 w-full md:w-auto flex justify-center md:block">
            <Avatar 
              className="consultant-avatar"
            >
              <AvatarImage src={consultant.photo} alt={consultant.name} className="object-cover" />
              <AvatarFallback 
                style={{
                  backgroundColor: '#E9EBEF',
                  color: '#151515',
                  fontWeight: '500',
                }}
              >
                {consultant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                {/* Name */}
                <h3 
                  className="truncate text-[18px]"
                  style={{
                    color: '#151515',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  {consultant.name}
                </h3>

                {/* Credentials */}
                <p 
                  className="truncate text-[14px] mb-2"
                  style={{
                    color: '#757575', // Step 6
                  }}
                >
                  {consultant.credentials}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 bg-[#F5F5F5] px-2 py-1 rounded-[8px]">
                <Star 
                  className="w-3.5 h-3.5" 
                  style={{ fill: '#FFA500', color: '#FFA500' }}
                />
                <span className="text-[12px] font-bold text-[#1A1A1A]">
                  {consultant.rating ? consultant.rating.toFixed(1) : '0.0'}
                </span>
                <span className="text-[12px] text-[#757575]">
                  ({consultant.reviewCount || 0})
                </span>
              </div>
            </div>

            {/* Category & Experience */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[12px] font-medium text-[#1A1A1A] bg-[#F5F5F5] px-2 py-1 rounded-[8px] capitalize">
                {consultant.category ? consultant.category.replace('-', ' ') : 'General'}
              </span>
              <span className="text-[12px] text-[#757575] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {consultant.yearsExperience || 0}+ yrs exp
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-[13px] text-[#757575] mb-4">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{consultant.location}</span>
            </div>

            {/* Specialization Badges */}
            <div className="mb-4">
              <p className="text-[11px] font-medium text-[#9E9E9E] uppercase tracking-wider mb-2">Specializes In</p>
              <div className="flex flex-wrap gap-2">
                {(consultant.topExpertises || []).slice(0, 3).map((expertise) => (
                  <span key={expertise} className="expertise-tag">
                    {expertise}
                  </span>
                ))}
                {(consultant.topExpertises?.length || 0) > 3 && (
                  <span className="expertise-tag text-[#757575]">
                    +{consultant.topExpertises!.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#E4E4E4] w-full my-4" />

            {/* Bottom Actions */}
            <div className="flex items-center justify-between">
              {/* Session Modes */}
              <div className="flex gap-2">
                {(consultant.sessionModes || []).slice(0, 4).map((mode) => (
                  <div
                    key={mode}
                    className="p-2 rounded-[8px] bg-[#F5F5F5] text-[#757575]"
                    title={mode}
                  >
                    {sessionIcons[mode as keyof typeof sessionIcons]}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[11px] text-[#757575] uppercase">Starting at</p>
                  <p className="text-[16px] font-bold text-[#1A1A1A]">₹{minPrice}</p>
                </div>
                
                {/* Next Available Badge */}
                <div className="flex gap-2">
                  {consultant.nextAvailableSlot && consultant.available ? (
                    <div className="h-[32px] flex items-center px-3 bg-[#E8F5E9] text-[#1A1A1A] text-[12px] font-semibold rounded-[8px]">
                      Next: {consultant.nextAvailableSlot}
                    </div>
                  ) : (
                    <div className="h-[32px] flex items-center px-3 bg-[#F5F5F5] text-[#757575] text-[12px] font-medium rounded-[8px]">
                      Unavailable
                    </div>
                  )}
                  
                  {onBook && (
                    <Button 
                      size="sm" 
                      className="h-[32px] rounded-[16px] bg-[#1A1A1A] hover:bg-[#333333] text-white text-[12px] px-4"
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
      </div>
    </div>
  );
}

export default ConsultantCard;