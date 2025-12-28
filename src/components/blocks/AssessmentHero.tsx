import React from "react";
import { Button } from "../ui/button";

interface AssessmentHeroProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  backgroundImage?: string;
  backgroundAlt?: string;
  className?: string;
}

export function AssessmentHero({
  title,
  description,
  buttonText,
  buttonLink,
  onButtonClick,
  backgroundImage,
  backgroundAlt = "Hero background",
  className = ""
}: AssessmentHeroProps) {
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      window.location.href = buttonLink;
    }
  };

  return (
    <section 
      className={`relative w-full pt-[var(--ikan-nav-clearance-mobile)] md:pt-[var(--ikan-nav-clearance-desktop)] ${className}`}
      style={{
        minHeight: 'clamp(500px, 60vh, 650px)',
        backgroundColor: 'var(--color-bg-page)'
      }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ 
            overflow: 'hidden'
          }}
        >
          <img
            alt={backgroundAlt}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            src={backgroundImage}
          />
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        </div>
      )}

      <div className="relative h-full w-full max-w-7xl mx-auto">
        {/* Content */}
        <div 
          className="relative h-full flex items-center"
          style={{ 
            padding: 'clamp(var(--spacing-4), 4vw, var(--spacing-12))',
            minHeight: 'clamp(500px, 60vh, 650px)'
          }}
        >
          <div 
            className="max-w-2xl"
            style={{ gap: 'var(--spacing-6)' }}
          >
            {/* Title */}
            <h1 
              className="mb-4"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.625rem)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: 'var(--line-height-sm)'
              }}
            >
              {title}
            </h1>

            {/* Description */}
            <p 
              className="mb-6 md:mb-8"
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: 'var(--line-height-md)',
                maxWidth: '600px'
              }}
            >
              {description}
            </p>

            {/* CTA Button */}
            <Button
              onClick={handleClick}
              className="ikan-button touch-target"
              style={{
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)',
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                paddingLeft: 'var(--spacing-5)',
                paddingRight: 'var(--spacing-5)'
              }}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
