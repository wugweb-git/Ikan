import React, { useMemo } from 'react';
import { ErrorBoundary } from '../../ErrorBoundary';
import { cn } from '../../ui/utils';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { Play } from 'lucide-react';
import { Button } from '../../ui/button';
import { usePageContent } from '../../../hooks/usePageContent';

export function MissionSection() {
  const { content, loading } = usePageContent('homepage-mission');

  const missionData = useMemo(() => {
    if (!content?.content) return null;
    try {
      return JSON.parse(content.content);
    } catch (e) {
      console.error('Failed to parse mission content', e);
      return null;
    }
  }, [content]);

  if (loading || !missionData) {
     return null; // Or a skeleton
  }

  const { title, content: missionContent, videoCaption, image, imageAlt } = missionData;
  const onVideoClick = () => console.log('Play video');

  return (
    <ErrorBoundary>
      <section 
        className="w-full"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          paddingTop: 'var(--spacing-8)',
          paddingBottom: 'var(--spacing-8)'
        }}
      >
        <div 
          className="max-w-7xl mx-auto"
          style={{ padding: '0 var(--spacing-4)' }}
        >
          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-6">
            <div 
              className="relative rounded-xl overflow-hidden aspect-video"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <ImageWithFallback 
                src={image}
                alt={imageAlt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
              <div className="absolute bottom-4 left-4 right-4">
                <p 
                  className="text-center"
                  style={{
                    color: 'var(--color-text-inverse)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {videoCaption}
                </p>
              </div>
            </div>

            <div 
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--color-accent-default)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <h2 
                className="mb-4"
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {title}
              </h2>
              <p 
                className="leading-relaxed"
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {missionContent}
              </p>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div 
              className="flex gap-6 items-stretch"
              style={{ gap: 'var(--spacing-6)' }}
            >
              {/* Video/Image Section */}
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
                </div>
              </div>

              {/* Content Section */}
              <div 
                className="flex-1 p-12 rounded-xl flex flex-col justify-center"
                style={{
                  backgroundColor: 'var(--color-accent-default)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
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
                <p 
                  className="leading-relaxed"
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-md)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {missionContent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}