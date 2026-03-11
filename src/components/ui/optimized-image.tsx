import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from './utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
  blurhash?: string;
  placeholder?: 'blur' | 'shimmer' | 'none';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  lazy = true,
  blurhash,
  placeholder = 'shimmer',
  objectFit = 'cover',
  priority = false,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || !imageRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );

    observer.observe(imageRef.current);

    return () => observer.disconnect();
  }, [lazy, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={imageRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        aspectRatio: width && height ? `${width} / ${height}` : undefined
      }}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && placeholder !== 'none' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            backgroundImage: placeholder === 'shimmer' 
              ? 'linear-gradient(90deg, var(--color-bg-muted) 0%, var(--color-bg-card) 50%, var(--color-bg-muted) 100%)'
              : undefined,
            backgroundSize: placeholder === 'shimmer' ? '200% 100%' : undefined,
            animation: placeholder === 'shimmer' ? 'shimmer 1.5s ease-in-out infinite' : undefined
          }}
        />
      )}

      {/* Actual Image */}
      {isInView && !hasError && (
        <ImageWithFallback
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            width: '100%',
            height: '100%',
            objectFit
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-bg-muted)'
          }}
        >
          <div className="text-center p-4">
            <svg
              className="mx-auto mb-2"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-family-base)'
              }}
            >
              Failed to load image
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Image gallery with lazy loading
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: number;
  gap?: number;
  className?: string;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 16,
  className
}: ImageGalleryProps) {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <div key={index} className="relative">
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            lazy={index > 6} // First 6 images load immediately
            className="rounded-lg"
          />
          {image.caption && (
            <p
              className="mt-2"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-family-base)'
              }}
            >
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}