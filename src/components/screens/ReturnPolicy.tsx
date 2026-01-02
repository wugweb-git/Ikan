import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { usePageContent } from '../../hooks/usePageContent';
import { PageHero } from '../ui/PageHero';

interface ReturnPolicyProps {
  className?: string;
  onBack?: () => void;
}

export function ReturnPolicy({ className, onBack }: ReturnPolicyProps) {
  const isMobile = useIsMobile();
  const { content, loading } = usePageContent('return-policy');

  return (
    <div 
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)'
      }}
    >
      {/* Hero Section */}
      <PageHero 
        title={content?.title || 'Return & Refund Policy'}
        subtitle="Understanding our refund and return policy for iKan services."
      />

      {/* Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--ikan-component-spacing-large) var(--spacing-12)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div 
            dangerouslySetInnerHTML={{ __html: content?.content || '' }}
            className="prose prose-lg max-w-none"
          />
        )}
      </div>
    </div>
  );
}
