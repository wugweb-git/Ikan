import React from 'react';
import { cn } from './utils';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHero({ 
  title, 
  subtitle, 
  backgroundImage, 
  className,
  children 
}: PageHeroProps) {
  return (
    <section 
      className={cn(
        "relative w-full bg-black flex flex-col items-center justify-center text-center overflow-hidden pt-[140px] pb-[60px] md:pt-[160px] md:pb-[80px]",
        className
      )}
    >
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={backgroundImage} 
            alt={title} 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
      )}
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center">
        <h1 
          className="font-medium text-white mb-4 max-w-4xl"
          style={{ 
            fontFamily: 'var(--font-family-base)',
            fontSize: '48px',
            lineHeight: '1.2'
          }}
        >
          {title}
        </h1>
        
        {subtitle && (
          <p 
            className="text-white max-w-2xl text-lg opacity-80"
            style={{ 
              fontFamily: 'var(--font-family-base)',
              fontSize: '18px',
              lineHeight: '28px'
            }}
          >
            {subtitle}
          </p>
        )}
        
        {children}
      </div>
    </section>
  );
}
