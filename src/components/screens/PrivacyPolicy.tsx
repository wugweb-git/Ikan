import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Button } from '../ui/button';
import { usePageContent } from '../../hooks/usePageContent';
import { PageHero } from '../ui/PageHero';

interface PrivacyPolicyProps {
  className?: string;
  onBack?: () => void;
}

export function PrivacyPolicy({ className, onBack }: PrivacyPolicyProps) {
  const isMobile = useIsMobile();
  const { content, loading } = usePageContent('privacy');

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
        title={content?.title || 'Privacy Policy'}
        subtitle="Your privacy and data security are fundamental to our mission."
      />

      {/* Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: '900px',
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
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-10 prose max-w-none"
          />
        )}
      </div>
    </div>
  );
}
