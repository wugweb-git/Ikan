import React from 'react';
import { Button } from '../ui/button';

interface CTABannerProps {
  title: string;
  buttonText: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  backgroundImage?: string;
  backgroundColor?: string;
  className?: string;
}

export function CTABanner({
  title,
  buttonText,
  buttonLink,
  onButtonClick,
  backgroundImage,
  backgroundColor = 'var(--color-bg-muted)',
  className = ''
}: CTABannerProps) {
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      window.location.href = buttonLink;
    }
  };

  return (
    <section 
      className={`w-full ${className}`} 
      style={{ backgroundColor }}
    >
      <div 
        className="max-w-7xl mx-auto"
        style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}
      >
        <div 
          className="relative rounded-3xl md:rounded-[40px] overflow-hidden"
          style={{
            minHeight: 'clamp(300px, 40vh, 450px)',
            borderRadius: 'var(--radius-2xl)'
          }}
        >
          {/* Background Image */}
          {backgroundImage && (
            <img 
              src={backgroundImage} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}
          
          {/* Content Overlay */}
          <div 
            className="relative flex flex-col justify-center w-full h-full"
            style={{ minHeight: 'clamp(300px, 40vh, 450px)' }}
          >
            <div 
              style={{ 
                padding: 'clamp(var(--spacing-6), 4vw, var(--spacing-12))',
                gap: 'var(--spacing-6)',
                maxWidth: '36rem'
              }}
            >
              <h2 
                className="text-white drop-shadow-lg mb-6 md:mb-8"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-inverse)',
                  fontFamily: 'var(--font-family-base)',
                  lineHeight: 'var(--line-height-sm)',
                  marginBottom: 'var(--spacing-6)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {title}
              </h2>
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
      </div>
    </section>
  );
}