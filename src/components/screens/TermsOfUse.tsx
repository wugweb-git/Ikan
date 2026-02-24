import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePageContent } from '../../hooks/usePageContent';
import { PageHero } from '../ui/PageHero';
import { LoadingSpinner } from '../LoadingSpinner';

interface TermsOfUseProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

export function TermsOfUse({ className, onNavigate }: TermsOfUseProps) {
  const isMobile = useIsMobile();
  const { content, loading } = usePageContent('terms');

  return (
    <div 
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)'
      }}
    >
      <PageHero 
        title={content?.title || 'Terms of Service'}
        subtitle="Important legal terms governing your use of iKan's mental health platform and services."
      />

      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--banner-content-max, 1100px)',
          padding: isMobile ? '24px 16px' : '40px 24px',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner message="Loading..." size="sm" />
          </div>
        ) : (
          <div 
            dangerouslySetInnerHTML={{ __html: content?.content || '' }}
            className="prose max-w-none"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: isMobile ? '24px' : '40px',
              fontFamily: 'var(--font-family-base)',
            }}
          />
        )}
      </div>
    </div>
  );
}