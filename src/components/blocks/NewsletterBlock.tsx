import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ErrorBoundary } from '../ErrorBoundary';

interface NewsletterBlockProps {
  title?: string;
  benefits?: string[];
  imageUrl?: string;
  imageAlt?: string;
  privacyText?: string;
  ctaText?: string;
  onSubmit?: (data: { name: string; email: string }) => void;
}

export function NewsletterBlock({
  title = "Newsletter Signup",
  benefits = [
    "Get weekly mental health tips and insights",
    "Early access to new features and programs",
    "Exclusive resources and guided exercises"
  ],
  imageUrl = "https://images.unsplash.com/photo-1758273240360-76b908e7582a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB3ZWxsbmVzcyUyMHN1cHBvcnR8ZW58MXx8fHwxNzY0OTUxMDY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  imageAlt = "Mental health and wellness support",
  privacyText = "Privacy: We store and process your personal data based on our privacy policy. You can unsubscribe at any time.",
  ctaText = "Sign up now!",
  onSubmit
}: NewsletterBlockProps) {
  const [formData, setFormData] = React.useState({ name: '', email: '' });

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <ErrorBoundary>
      <section 
        className="w-full"
        style={{
          backgroundColor: 'var(--color-bg-page)',
          paddingTop: 'var(--spacing-8)',
          paddingBottom: 'var(--spacing-8)'
        }}
      >
        <div 
          className="max-w-7xl mx-auto"
          style={{ padding: '0 var(--spacing-4)' }}
        >
          {/* Mobile Layout */}
          <div className="flex flex-col lg:hidden gap-6">
            <div className="max-w-xl">
              <h2 
                className="mb-4"
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
                className="mb-6"
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {benefits[0]}
              </p>

              {/* Email input with inline button */}
              <div 
                className="flex flex-col gap-3 mb-3"
                style={{ gap: 'var(--spacing-3)' }}
              >
                <div className="flex-1">
                  <label htmlFor="newsletter-email-mobile" className="sr-only">Email Address</label>
                  <Input
                    id="newsletter-email-mobile"
                    type="email"
                    placeholder="Your email address..."
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="ikan-input w-full"
                    aria-label="Email address for newsletter subscription"
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid var(--color-border-default)',
                      height: '48px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSubmit}
                  className="ikan-button w-full"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-primary-on)',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {ctaText}
                </Button>
              </div>

              {/* Privacy text */}
              <p 
                className="text-sm"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {privacyText}
              </p>
            </div>

            {/* Image on mobile */}
            <div 
              className="relative rounded-xl overflow-hidden aspect-video"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <ImageWithFallback 
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center gap-12">
            {/* Content on left - 50% */}
            <div className="flex-1 max-w-xl">
              <h2 
                className="mb-4"
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
                className="mb-6"
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {benefits[0]}
              </p>

              {/* Email input with inline button */}
              <div 
                className="flex gap-3 mb-3"
                style={{ gap: 'var(--spacing-3)' }}
              >
                <div className="flex-1">
                  <label htmlFor="newsletter-email-desktop" className="sr-only">Email Address</label>
                  <Input
                    id="newsletter-email-desktop"
                    type="email"
                    placeholder="Your email address..."
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="ikan-input w-full"
                    aria-label="Email address for newsletter subscription"
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid var(--color-border-default)',
                      height: '48px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSubmit}
                  className="ikan-button"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-primary-on)',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)',
                    paddingLeft: 'var(--spacing-6)',
                    paddingRight: 'var(--spacing-6)'
                  }}
                >
                  {ctaText}
                </Button>
              </div>

              {/* Privacy text */}
              <p 
                className="text-sm"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {privacyText}
              </p>
            </div>

            {/* Image on right - 50% */}
            <div 
              className="flex-1 relative rounded-xl overflow-hidden"
              style={{ 
                borderRadius: 'var(--radius-lg)',
                height: '400px'
              }}
            >
              <ImageWithFallback 
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}