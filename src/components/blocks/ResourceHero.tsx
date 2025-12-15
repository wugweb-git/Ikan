import React from 'react';
import { cn } from '../ui/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ResourceHeroProps {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  className?: string;
}

export function ResourceHero({ 
  title, 
  description, 
  image, 
  imageAlt = 'Resource hero image',
  className = '' 
}: ResourceHeroProps) {
  return (
    <div 
      className={cn("relative w-full overflow-hidden rounded-b-3xl", className)}
      style={{
        height: 'clamp(400px, 50vh, 650px)',
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback 
          src={image} 
          alt={imageAlt}
          className="w-full h-full object-cover" 
        />
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        />
      </div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto z-10 text-white space-y-4">
        <h1 
          className="text-3xl md:text-5xl font-medium leading-tight max-w-4xl"
          style={{ fontFamily: 'var(--font-family-base)' }}
        >
          {title}
        </h1>
        <p 
          className="text-base md:text-lg opacity-90 leading-relaxed max-w-2xl"
          style={{ fontFamily: 'var(--font-family-base)' }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
