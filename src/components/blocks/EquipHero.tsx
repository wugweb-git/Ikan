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
        minHeight: 'clamp(500px, 60vh, 900px)',
        paddingTop: 'var(--ikan-nav-clearance-mobile)',
        backgroundColor: 'var(--color-bg-page)'
      }}
    >
      <div className="relative h-full w-full max-w-7xl mx-auto">
        {/* Background Image */}
        {backgroundImage && (
          <div 
            className="absolute inset-0"
            style={{ 
              borderRadius: 'clamp(var(--radius-lg), 2vw, 80px)',
              overflow: 'hidden'
            }}
          >
            <img
              alt={backgroundAlt}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              src={backgroundImage}
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="relative h-full flex items-center"
          style={{ 
            padding: 'clamp(var(--spacing-4), 4vw, var(--spacing-12))',
            minHeight: 'clamp(500px, 60vh, 900px)'
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
