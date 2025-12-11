import React from 'react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

export interface TestimonialData {
  id: string;
  name: string;
  quote: string;
  image: string;
  imageAlt?: string;
  course?: string;
  stats?: {
    value: string;
    label: string;
  };
  videoCaption?: string;
  videoUrl?: string;
}

interface TestimonialBlockProps {
  testimonial: TestimonialData;
  onVideoPlay?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export function TestimonialBlock({
  testimonial,
  onVideoPlay,
  onPrevious,
  onNext,
  showNavigation = false,
  variant = 'default',
  className
}: TestimonialBlockProps) {
  const handleVideoPlay = () => {
    if (onVideoPlay) {
      onVideoPlay();
    } else if (testimonial.videoUrl) {
      window.open(testimonial.videoUrl, '_blank');
    }
  };

  return (
    <div className={className}>
      {/* Mobile Layout */}
      <div className="block lg:hidden space-y-6">
        <div 
          className="relative rounded-xl overflow-hidden aspect-video"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <ImageWithFallback 
            src={testimonial.image}
            alt={testimonial.imageAlt || `${testimonial.name}'s testimonial`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button 
              size="lg" 
              className="rounded-full w-16 h-16 p-0"
              onClick={handleVideoPlay}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-pill)',
                height: '48px',
                width: '48px'
              }}
            >
              <Play className="w-6 h-6 ml-1" />
            </Button>
          </div>
          {testimonial.videoCaption && (
            <div className="absolute bottom-4 left-4 right-4">
              <p 
                className="text-center"
                style={{
                  color: 'var(--color-text-inverse)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {testimonial.videoCaption}
              </p>
            </div>
          )}
        </div>

        <div 
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p 
                className="font-medium"
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {testimonial.name}
              </p>
            </div>
            {testimonial.course && (
              <div>
                <p 
                  className="text-sm"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  Course: {testimonial.course}
                </p>
              </div>
            )}
          </div>
          
          <blockquote 
            className="mb-4"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-md)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            {testimonial.quote}
          </blockquote>

          {testimonial.stats && (
            <div 
              className="flex items-center space-x-2"
              style={{ gap: 'var(--spacing-2)' }}
            >
              <div>
                <p 
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {testimonial.stats.value}
                </p>
                <p 
                  className="text-sm"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {testimonial.stats.label}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div 
          className="relative rounded-2xl border overflow-hidden"
          style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)'
          }}
        >
          <div 
            className="flex items-stretch"
            style={{ gap: 'var(--spacing-8)' }}
          >
            {/* Video Section */}
            <div className="w-96 relative">
              <div className="h-80 relative">
                <ImageWithFallback 
                  src={testimonial.image}
                  alt={testimonial.imageAlt || `${testimonial.name}'s testimonial`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    size="lg" 
                    className="rounded-full w-16 h-16 p-0"
                    onClick={handleVideoPlay}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--color-text-primary)',
                      borderRadius: 'var(--radius-pill)',
                      height: '48px',
                      width: '48px'
                    }}
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>
                {testimonial.videoCaption && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <p 
                      style={{
                        color: 'var(--color-text-inverse)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    >
                      {testimonial.videoCaption}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Testimonial Content */}
            <div 
              className="flex-1 p-8 flex flex-col justify-center"
              style={{ padding: 'var(--spacing-8)' }}
            >
              <div 
                className="space-y-6"
                style={{ gap: 'var(--spacing-6)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-medium"
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    >
                      {testimonial.name}
                    </p>
                  </div>
                  {testimonial.course && (
                    <div>
                      <p 
                        className="text-sm"
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      >
                        Course: {testimonial.course}
                      </p>
                    </div>
                  )}
                </div>
                
                <blockquote 
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--line-height-md)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {testimonial.quote}
                </blockquote>

                {testimonial.stats && (
                  <div 
                    className="flex items-center space-x-2"
                    style={{ gap: 'var(--spacing-2)' }}
                  >
                    <div>
                      <p 
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-regular)',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      >
                        {testimonial.stats.value}
                      </p>
                      <p 
                        className="text-sm"
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      >
                        {testimonial.stats.label}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {showNavigation && (
            <div 
              className="absolute bottom-6 right-6 flex gap-4"
              style={{ gap: 'var(--spacing-4)' }}
            >
              <Button 
                variant="secondary"
                size="icon"
                className="rounded-full w-12 h-12 opacity-50"
                onClick={onPrevious}
                disabled={!onPrevious}
                style={{
                  backgroundColor: 'var(--color-neutral-200)',
                  borderRadius: 'var(--radius-pill)',
                  height: '48px',
                  width: '48px'
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                variant="secondary"
                size="icon"
                className="rounded-full w-12 h-12 opacity-50"
                onClick={onNext}
                disabled={!onNext}
                style={{
                  backgroundColor: 'var(--color-neutral-200)',
                  borderRadius: 'var(--radius-pill)',
                  height: '48px',
                  width: '48px'
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
