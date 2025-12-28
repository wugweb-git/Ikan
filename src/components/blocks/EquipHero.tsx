import React from "react";
import { Button } from "../ui/button";

interface EquipHeroProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  backgroundImage?: string;
  backgroundAlt?: string;
  className?: string;
}

export function EquipHero({
  title,
  description,
  buttonText,
  buttonLink,
  onButtonClick,
  backgroundImage,
  backgroundAlt = "Hero background",
  className = ""
}: EquipHeroProps) {
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      window.location.href = buttonLink;
    }
  };

  return (
    <section 
      className={`relative w-full ${className}`}
      style={{
        minHeight: 'clamp(500px, 60vh, 700px)',
        margin: 0,
        padding: 0,
        position: 'relative',
        zIndex: 0, // Behind navbar (navbar should have higher z-index)
      }}
    >
      {/* Full-bleed Background Image - Edge to Edge */}
      {backgroundImage && (
        <div 
          className="absolute inset-0"
          style={{ 
            width: '100vw',
            height: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            overflow: 'hidden',
          }}
        >
          <img
            alt={backgroundAlt}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            src={backgroundImage}
          />
        </div>
      )}

      {/* Content Container - Constrained with Padding */}
      <div 
        className="relative h-full flex items-center"
        style={{ 
          minHeight: 'clamp(500px, 60vh, 700px)',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(var(--spacing-6), 5vw, var(--spacing-12)) var(--spacing-4)',
          zIndex: 1,
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
    </section>
  );
}