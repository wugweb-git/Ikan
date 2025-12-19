import React from 'react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Play } from 'lucide-react';

interface ContextBlockProps {
  title?: string;
  content?: string;
  image?: string;
  imageAlt?: string;
  videoCaption?: string;
  onVideoClick?: () => void;
  showPlayButton?: boolean;
}

export function ContextBlock({
  title = "Our Mission",
  content = "",
  image,
  imageAlt = "Context image",
  videoCaption = "Watch the full interview",
  onVideoClick,
  showPlayButton = true,
}: ContextBlockProps) {
  return (
    <section 
      className="w-full"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        paddingTop: 'clamp(var(--spacing-8), 6vw, var(--spacing-12))',
        paddingBottom: 'clamp(var(--spacing-8), 6vw, var(--spacing-12))'
      }}
    >
      <div 
        className="max-w-7xl mx-auto"
        style={{ padding: '0 var(--spacing-4)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Video/Image Section */}
          {image && (
            <div className="flex-shrink-0 w-96">
              <div 
                className="relative rounded-xl overflow-hidden h-80"
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                <ImageWithFallback 
                  src={image}
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {showPlayButton && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button 
                      onClick={onVideoClick}
                      size="lg" 
                      className="rounded-full w-16 h-16 p-0"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: 'var(--color-text-primary)',
                        borderRadius: 'var(--radius-pill)'
                      }}
                    >
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                  </div>
                )}
                {videoCaption && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <p 
                      className="text-center"
                      style={{
                        color: 'var(--color-text-inverse)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    >
                      {videoCaption.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < videoCaption.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Section */}
          <div 
            className="flex-1 p-12 rounded-xl flex flex-col justify-center"
            style={{
              backgroundColor: 'var(--color-accent-default)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            {title && (
              <h2 
                className="mb-6"
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {title}
              </h2>
            )}
            {content && (
              <p 
                className="leading-relaxed"
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {content}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}