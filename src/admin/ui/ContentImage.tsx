import React from 'react';
import { ImageWithFallback } from './ImageWithFallback';
import { ImageOff } from 'lucide-react';

interface ContentImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** When src is empty/missing, show a grey placeholder instead of broken image */
  placeholderIcon?: boolean;
}

/**
 * ContentImage — wraps ImageWithFallback with a clean grey placeholder
 * for missing/empty image URLs. Since images are mandatory in our CMS,
 * this only triggers when content hasn't been fully configured yet.
 */
export function ContentImage({ src, alt, className, style, placeholderIcon = true, ...rest }: ContentImageProps) {
  // If src is falsy (empty string, undefined, null), render grey placeholder
  if (!src || src.trim() === '') {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: 'var(--color-accent-default, #E9EBEF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="img"
        aria-label={alt || 'Image placeholder'}
      >
        {placeholderIcon && (
          <ImageOff 
            size={32} 
            style={{ color: 'var(--color-text-muted, #717182)', opacity: 0.4 }} 
          />
        )}
      </div>
    );
  }

  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
    />
  );
}
