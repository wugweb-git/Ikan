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
        "relative w-full h-[400px] flex items-center justify-center bg-black overflow-hidden",
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
          className="text-white mb-4 max-w-4xl"
          style={{ 
            fontSize: 'var(--text-4xl)', 
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          {title}
        </h1>
        
        {subtitle && (
          <p 
            className="text-white/90 max-w-2xl text-lg"
            style={{ fontFamily: 'var(--font-family-base)' }}
          >
            {subtitle}
          </p>
        )}
        
        {children}
      </div>
    </section>
  );
}
