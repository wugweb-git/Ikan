import React from "react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

/**
 * SectionHero - Unified hero component for landing pages.
 * Replaces the formerly-duplicate AssessmentHero and EquipHero components.
 * Both old names are re-exported from their original files for backward-compat.
 */
export interface SectionHeroProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  backgroundImage?: string;
  backgroundAlt?: string;
  className?: string;
}

export function SectionHero({
  title,
  description,
  buttonText,
  buttonLink,
  onButtonClick,
  backgroundImage,
  backgroundAlt = "Hero background",
  className = ""
}: SectionHeroProps) {
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      window.location.href = buttonLink;
    }
  };

  return (
    <section 
      className={cn(
        "relative w-full overflow-hidden flex flex-col justify-center min-h-[500px] lg:min-h-[600px]",
        className
      )}
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            alt={backgroundAlt}
            className="w-full h-full object-cover object-center"
            src={backgroundImage}
          />
          {/* Gradient overlay for text readability */}
          <div 
            className="absolute inset-0 z-10 lg:w-2/3"
            style={{
              background: 'linear-gradient(to right, var(--color-bg-page), color-mix(in srgb, var(--color-bg-page) 80%, transparent), transparent)',
            }}
          />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-0">
        <div className="max-w-[500px] flex flex-col items-start" style={{ gap: 'var(--spacing-6)' }}>
          {/* Title */}
          <h1 
            style={{
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--text-3xl)',
              lineHeight: 'var(--line-height-xs)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p 
            style={{
              fontWeight: 'var(--font-weight-regular)',
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--line-height-md)',
              color: 'var(--color-text-primary)',
              opacity: 0.9,
              fontFamily: 'var(--font-family-base)',
            }}
          >
            {description}
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleClick}
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              paddingLeft: 'var(--spacing-8)',
              paddingRight: 'var(--spacing-8)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
