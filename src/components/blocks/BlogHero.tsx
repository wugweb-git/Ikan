import React from 'react';

interface BlogHeroProps {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  className?: string;
}

export function BlogHero({ 
  title, 
  description, 
  image, 
  imageAlt = 'Blog hero image',
  className = '' 
}: BlogHeroProps) {
  return (
    <div 
      className={`box-border content-stretch flex flex-col gap-[10px] items-start justify-center relative shrink-0 w-full ${className}`}
      style={{
        height: 'clamp(400px, 50vh, 650px)',
        padding: 'var(--spacing-6)',
        borderBottomLeftRadius: 'var(--radius-lg)',
        borderBottomRightRadius: 'var(--radius-lg)'
      }}
    >
      {/* Background Image with Gradient Overlay */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          borderBottomLeftRadius: 'var(--radius-lg)',
          borderBottomRightRadius: 'var(--radius-lg)'
        }}
      >
        <img 
          alt={imageAlt}
          className="absolute w-full h-full object-center object-cover" 
          src={image} 
        />
        <div 
          className="absolute bg-gradient-to-l inset-0" 
          style={{
            background: 'linear-gradient(to left, rgba(0,0,0,0) 4.931%, rgba(0,0,0,0.8) 78.924%)',
            borderBottomLeftRadius: 'var(--radius-lg)',
            borderBottomRightRadius: 'var(--radius-lg)'
          }}
        />
      </div>
      
      {/* Content */}
      <div className="content-stretch flex flex-col items-start relative shrink-0 text-white w-full z-10" style={{ gap: 'var(--spacing-4)' }}>
        <h1 
          className="relative shrink-0 w-full m-0"
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'clamp(var(--text-2xl), 5vw, var(--text-4xl))',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: '1.2',
            color: 'white'
          }}
        >
          {title}
        </h1>
        <p 
          className="relative shrink-0 w-full m-0"
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)',
            lineHeight: 'var(--line-height-md)',
            color: 'white',
            maxWidth: '600px'
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
