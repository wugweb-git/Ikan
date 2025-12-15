import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Button } from '../ui/button';
import { usePageContent } from '../../hooks/usePageContent';

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
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-default) 0%, #1a1a1a 100%)',
          color: 'var(--color-text-inverse)',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--spacing-12) var(--ikan-component-spacing-large)'
        }}
      >
        <div 
          className="w-full mx-auto"
          style={{
            maxWidth: 'var(--constraint-content-max)'
          }}
        >
          {/* Back Navigation */}
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-6"
              style={{
                height: '48px',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'rgba(255, 255, 255, 0.9)',
                padding: '0 var(--spacing-3)'
              }}
            >
              <Icon name="arrow-left" size={16} className="mr-2" />
              Back
            </Button>
          )}

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--ikan-component-spacing-default)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Icon name="shield-check" size={32} style={{ color: 'var(--color-text-inverse)' }} />
              </div>
            </div>
            
            <h1 
              style={{
                fontSize: isMobile ? 'var(--text-3xl)' : 'var(--text-4xl)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: 'var(--line-height-sm)',
                margin: '0',
                marginBottom: 'var(--ikan-component-spacing-default)'
              }}
            >
              {content?.title || 'Privacy Policy'}
            </h1>
            
            <p 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-regular)',
                lineHeight: 'var(--line-height-md)',
                opacity: 0.9,
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              Your privacy and data security are fundamental to our mission.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: '900px',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--spacing-12) var(--ikan-component-spacing-large)',
          marginTop: '-var(--ikan-component-spacing-large)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div 
            dangerouslySetInnerHTML={{ __html: content?.content || '' }}
            className="bg-white rounded-lg shadow-sm border border-gray-100"
          />
        )}
      </div>
    </div>
  );
}
