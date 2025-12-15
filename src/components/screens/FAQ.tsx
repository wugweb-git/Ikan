import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { usePageContent } from '../../hooks/usePageContent';

interface FAQProps {
  className?: string;
  onBack?: () => void;
}

export function FAQ({ className, onBack }: FAQProps) {
  const isMobile = useIsMobile();
  const { content, loading } = usePageContent('faq');

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
          marginTop: isMobile ? 0 : 'calc(-1 * var(--ikan-nav-clearance-desktop, 128px))',
          padding: isMobile 
            ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' 
            : 'calc(var(--ikan-nav-clearance-desktop, 128px) + var(--spacing-12)) var(--ikan-component-spacing-large) var(--spacing-12)'
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
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-6 touch-target hover:opacity-80 transition-all duration-200"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-regular)',
                color: 'rgba(255, 255, 255, 0.8)',
                background: 'none',
                border: 'none',
                padding: '0',
                cursor: 'pointer',
                marginBottom: 'var(--ikan-component-spacing-large)'
              }}
            >
              <Icon name="arrow-left" size={16} />
              Back
            </button>
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
                <Icon name="help-circle" size={32} style={{ color: 'var(--color-text-inverse)' }} />
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
              {content?.title || 'Frequently Asked Questions'}
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
              Find quick answers to common questions about iKan's mental health platform, assessments, and programs.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--ikan-component-spacing-large) var(--spacing-12)',
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
            className="prose prose-lg max-w-none"
          />
        )}
      </div>
    </div>
  );
}
