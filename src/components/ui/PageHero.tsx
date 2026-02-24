import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from './utils';

// Default hero images for pages that don't provide their own
const DEFAULT_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1625591243862-9f475616ba64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwcGVvcGxlJTIwbWVudGFsJTIwaGVhbHRoJTIwd2VsbG5lc3MlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzE5MDc1NjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1758274539654-23fa349cc090?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG1lZGl0YXRpb24lMjBwZWFjZWZ1bCUyMGNhbG0lMjBtaW5kZnVsbmVzc3xlbnwxfHx8fDE3NzE5MDc1Njd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1703449481095-bb99a6928f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjB0aGVyYXB5JTIwc2Vzc2lvbiUyMHN1cHBvcnRpdmUlMjBjb3Vuc2VsaW5nfGVufDF8fHx8MTc3MTkwNzU2NXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1643290274113-1ff22efe2ce1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMHN1cHBvcnQlMjBjb21tdW5pdHklMjBkaXZlcnNlJTIwaGFwcHl8ZW58MXx8fHwxNzcxOTA3NTY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1623094719678-6be9d998f9de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBqb3VybmFsaW5nJTIwbmF0dXJlJTIwb3V0ZG9vciUyMHdlbGxuZXNzfGVufDF8fHx8MTc3MTkwNzU2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
];

const CAROUSEL_INTERVAL = 5000; // 5 seconds per slide

interface PageHeroProps {
  title: string;
  subtitle?: string;
  /** Single background image (legacy support) */
  backgroundImage?: string;
  /** Array of images for auto carousel */
  backgroundImages?: string[];
  /** Auto carousel interval in ms (default 5000) */
  carouselInterval?: number;
  className?: string;
  children?: React.ReactNode;
}

export function PageHero({ 
  title, 
  subtitle, 
  backgroundImage, 
  backgroundImages,
  carouselInterval = CAROUSEL_INTERVAL,
  className,
  children 
}: PageHeroProps) {
  // Resolve images: explicit array > single image > defaults
  const images = backgroundImages && backgroundImages.length > 0
    ? backgroundImages
    : backgroundImage
      ? [backgroundImage]
      : DEFAULT_HERO_IMAGES;

  const hasCarousel = images.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance carousel
  useEffect(() => {
    if (!hasCarousel) return;

    timerRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % images.length);
        // Small delay then fade back in
        setTimeout(() => setIsTransitioning(false), 60);
      }, 600); // matches CSS transition
    }, carouselInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasCarousel, images.length, carouselInterval]);

  // Inject carousel keyframes once
  useEffect(() => {
    const styleId = 'ikan-pagehero-carousel-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .ikan-hero-img-carousel {
          transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
        }
        .ikan-hero-img-carousel.transitioning {
          opacity: 0 !important;
          transform: scale(1.04);
        }
        .ikan-hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }
        .ikan-hero-dot.active {
          background: rgba(255,255,255,0.95);
          width: 24px;
          border-radius: 4px;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (index === activeIndex) return;
    // Reset timer
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setTimeout(() => setIsTransitioning(false), 60);
    }, 600);
    // Restart auto-advance
    timerRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % images.length);
        setTimeout(() => setIsTransitioning(false), 60);
      }, 600);
    }, carouselInterval);
  }, [activeIndex, images.length, carouselInterval]);

  return (
    <section 
      className={cn(
        "relative w-full flex flex-col items-center justify-center text-center overflow-hidden pt-[140px] pb-[60px] md:pt-[160px] md:pb-[80px]",
        className
      )}
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* Background images — full width, increased scale for wider human coverage */}
      <div className="absolute inset-0 z-0">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${title} background ${i + 1}`}
            className={cn(
              'absolute inset-0 w-full h-full object-cover ikan-hero-img-carousel',
              isTransitioning && i === activeIndex ? 'transitioning' : ''
            )}
            style={{
              opacity: i === activeIndex ? 0.55 : 0,
              // Wider framing: scale up and position to show more of the person
              objectPosition: '50% 30%',
              transform: i === activeIndex && !isTransitioning ? 'scale(1.08)' : 'scale(1.04)',
            }}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center">
        <h1
          style={{ 
            fontFamily: 'var(--font-family-base)',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: '1.2',
            color: '#FFFFFF',
            margin: '0 0 16px 0',
            maxWidth: '800px',
          }}
        >
          {title}
        </h1>
        
        {subtitle && (
          <p 
            style={{ 
              fontFamily: 'var(--font-family-base)',
              fontSize: 'clamp(15px, 2vw, 18px)',
              fontWeight: 'var(--font-weight-regular)',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.85)',
              margin: '0 0 8px 0',
              maxWidth: '600px',
            }}
          >
            {subtitle}
          </p>
        )}
        
        {children}
      </div>

      {/* Carousel dots */}
      {hasCarousel && (
        <div
          className="relative z-10 flex items-center justify-center"
          style={{ gap: '8px', marginTop: '24px' }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              className={cn('ikan-hero-dot', i === activeIndex ? 'active' : '')}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
