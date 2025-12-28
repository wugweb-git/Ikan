import React from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ContextBlockProps {
  title?: string;
  content?: string;
  contentHtml?: string;
  image?: string;
  imageAlt?: string;
  bullets?: string[];
  bulletsTitle?: string; // NEW: Configurable title for bullets
  // Legacy props ignored in strict mode but kept for interface compatibility
  videoCaption?: string;
  onVideoClick?: () => void;
  showPlayButton?: boolean;
}

export function ContextBlock({
  title = "What is Sleep Tight?",
  content,
  contentHtml,
  image,
  imageAlt = "Context image",
  bullets = [],
  bulletsTitle = "The program includes:" // Default
}: ContextBlockProps) {
  
  // Enforce "Exactly 2 paragraphs" logic if using raw content string
  // If contentHtml is provided, we assume the backend/transformer handled it,
  // but for the raw string, we'll split and take max 2.
  const paragraphs = content 
    ? content.split('\n').filter(p => p.trim().length > 0).slice(0, 2)
    : [];

  return (
    <section 
      className="w-full py-12 md:py-16"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Image (4:3 or 1:1) */}
          <div className="w-full order-2 lg:order-1">
            <div 
              className="relative rounded-2xl overflow-hidden bg-[var(--color-neutral-100)]"
              style={{ aspectRatio: '4/3' }}
            >
              {image ? (
                <ImageWithFallback 
                  src={image}
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                  Image Placeholder
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Content Card */}
          <div className="flex flex-col justify-center order-1 lg:order-2 h-full">
            <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-default)] p-8 lg:p-10 shadow-sm h-full">
              
              {/* Section Title */}
              {title && (
                <h2 className="mb-6 text-3xl font-medium text-[var(--color-text-primary)]">
                  {title}
                </h2>
              )}

              {/* Body Paragraphs (Max 2) */}
              <div className="space-y-4 mb-8">
                {contentHtml ? (
                  <div 
                    className="rich-text-content space-y-4 text-base text-[var(--color-text-muted)] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                ) : (
                  paragraphs.map((para, idx) => (
                    <p key={idx} className="text-base text-[var(--color-text-muted)] leading-relaxed">
                      {para}
                    </p>
                  ))
                )}
              </div>

              {/* "The program includes" List */}
              {bullets.length > 0 && (
                <div className="pt-6 border-t border-[var(--color-border-default)]">
                  {/* Render title only if provided and not empty */}
                  {bulletsTitle && (
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                      {bulletsTitle}
                    </h3>
                  )}
                  <ul className="space-y-3">
                    {bullets.slice(0, 3).map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[var(--color-text-primary)] text-base">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary-default)] shrink-0" />
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
