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
  className?: string;
}

export function ConsultantCard({ consultant, onClick, className }: ConsultantCardProps) {
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
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        "bg-white",
        className
      )}
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Top Section: Photo and Main Info */}
          <div className="flex gap-4 p-4">
            {/* Profile Photo */}
            <Avatar 
              className="h-20 w-20 shrink-0"
              style={{
                borderRadius: 'var(--radius-md)',
              }}
            >
              <AvatarImage src={consultant.photo} alt={consultant.name} />
              <AvatarFallback 
                style={{
                  backgroundColor: 'var(--color-accent-default)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {consultant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              {/* Name */}
              <h3 
                className="truncate"
                style={{
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-1)',
                }}
              >
                {consultant.name}
              </h3>

              {/* Credentials */}
              <p 
                className="truncate text-sm mb-2"
                style={{
                  color: 'var(--color-text-muted)',
                }}
              >
                {consultant.credentials}
              </p>

              {/* Category Badge */}
              <Badge 
                variant="secondary"
                className="mb-2"
                style={{
                  textTransform: 'capitalize',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-regular)',
                }}
              >
                {consultant.category ? consultant.category.replace('-', ' ') : 'General'}
              </Badge>

              {/* Rating and Experience */}
              <div className="flex items-center gap-3 text-sm">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star 
                    className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                  />
                  <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {consultant.rating ? consultant.rating.toFixed(1) : '0.0'}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    ({consultant.reviewCount || 0})
                  </span>
                </div>

                {/* Experience */}
                <div 
                  className="flex items-center gap-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Clock className="w-4 h-4" />
                  <span>{consultant.yearsExperience || 0}+ yrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div 
            className="border-t mx-4"
            style={{ borderColor: 'var(--color-border-default)' }}
          />

          {/* Bottom Section: Details */}
          <div className="p-4 space-y-3">
            {/* Top Expertises */}
            <div>
              <p 
                className="text-xs mb-2"
                style={{
                  color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Specializes in
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(consultant.topExpertises || []).slice(0, 3).map((expertise) => (
                  <Badge
                    key={expertise}
                    variant="outline"
                    className="text-xs"
                    style={{
                      backgroundColor: 'var(--color-bg-muted)',
                      borderColor: 'var(--color-border-default)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 'var(--font-weight-regular)',
                    }}
                  >
                    {expertise}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location and Languages */}
            <div className="flex items-start gap-1 text-sm">
              <MapPin 
                className="w-4 h-4 mt-0.5 shrink-0" 
                style={{ color: 'var(--color-text-muted)' }}
              />
              <span 
                className="truncate"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {consultant.location}
              </span>
            </div>

            {/* Languages */}
            <div className="flex flex-wrap gap-1.5">
              {(consultant.languages || []).slice(0, 3).map((lang) => (
                <span
                  key={lang}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--color-bg-muted)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>

            {/* Session Modes and Pricing */}
            <div className="flex items-center justify-between pt-2">
              {/* Session Modes */}
              <div className="flex gap-2">
                {(consultant.sessionModes || []).slice(0, 4).map((mode) => (
                  <div
                    key={mode}
                    className="p-1.5 rounded"
                    style={{
                      backgroundColor: 'var(--color-bg-muted)',
                      color: 'var(--color-text-muted)',
                    }}
                    title={mode}
                  >
                    {sessionIcons[mode as keyof typeof sessionIcons]}
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="text-right">
                <p 
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Starting at
                </p>
                <p 
                  style={{
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-primary-default)',
                  }}
                >
                  ₹{minPrice}
                </p>
              </div>
            </div>

            {/* Next Available Slot */}
            {consultant.nextAvailableSlot && consultant.available && (
              <div 
                className="text-xs px-3 py-1.5 rounded text-center"
                style={{
                  backgroundColor: 'var(--color-success-light)',
                  color: 'var(--color-success-default)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Next available: {consultant.nextAvailableSlot}
              </div>
            )}

            {!consultant.available && (
              <div 
                className="text-xs px-3 py-1.5 rounded text-center"
                style={{
                  backgroundColor: 'var(--color-bg-muted)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Currently unavailable
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ConsultantCard;