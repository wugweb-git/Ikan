import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ErrorBoundary } from '../ErrorBoundary';
import { toast } from 'sonner@2.0.3';
import { logger } from '../../lib/logger';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Loader2 } from 'lucide-react';

interface NewsletterBlockProps {
  title?: string;
  benefits?: string[];
  imageUrl?: string;
  imageAlt?: string;
  privacyText?: string;
  ctaText?: string;
  onSubmit?: (data: { name: string; email: string }) => void;
  className?: string;
}

export function NewsletterBlock({
  title = "Sign up for our newsletter",
  privacyText = "Stay Informed About Mental Health", // Using privacyText prop for the subtext to maintain interface compatibility
  ctaText = "Subscribe",
  onSubmit,
  className
}: NewsletterBlockProps) {
  const [formData, setFormData] = React.useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // If custom onSubmit handler is provided
    if (onSubmit) {
      onSubmit(formData);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/newsletter/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            name: formData.name, // We send empty name as per design there is no name input
            email: formData.email
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.alreadySubscribed) {
          toast.info(data.message);
        } else {
          toast.success('Thank you for subscribing to our newsletter!');
          setFormData({ name: '', email: '' });
        }
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.');
        logger.error('Newsletter signup error:', data);
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.');
      logger.error('Newsletter signup exception:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <section className={`w-full px-4 md:px-6 py-8 md:py-12 ${className || ''}`}>
        <div 
          className="max-w-[1014px] mx-auto p-8 md:p-10 relative overflow-hidden"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            borderRadius: 'var(--radius-lg)', // Standardized to 16px
            border: '1px solid var(--color-border-default)'
          }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Left Side: Heading */}
            <div className="flex flex-col items-start lg:items-start text-left lg:text-left">
              <h2 
                className="font-bold leading-tight max-w-[400px]"
                style={{
                  fontSize: 'var(--text-3xl)', // Standardized font size
                  color: 'var(--color-primary-on)'
                }}
              >
                {/* Check if title contains "Sign up for our newsletter" to apply specific breaking if needed, otherwise just render title */}
                {title === "Sign up for our newsletter" ? (
                  <>
                    <span className="block">Sign up for</span>
                    <span className="block">our newsletter</span>
                  </>
                ) : (
                  title
                )}
              </h2>
            </div>

            {/* Right Side: Subtext & Form */}
            <div className="flex flex-col items-start lg:items-start gap-3 w-full max-w-[482px]">
              {/* Subtext */}
              <p 
                className="text-base font-regular w-full text-left lg:text-left pl-1"
                style={{
                  color: 'var(--color-primary-on)',
                  fontSize: 'var(--text-base)'
                }}
              >
                {privacyText}
              </p>

              {/* Input Row */}
              <div className="flex flex-col sm:flex-row gap-[6px] w-full">
                <div 
                  className="flex-grow relative"
                  style={{ height: 'var(--ikan-component-input-height)' }}
                >
                  <Input
                    type="email"
                    placeholder="jamie@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit();
                    }}
                    className="w-full h-full text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500"
                    style={{
                      backgroundColor: 'var(--color-bg-input)',
                      color: 'var(--color-text-primary)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      height: '100%'
                    }}
                  />
                </div>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="font-medium text-sm px-8 shrink-0"
                  style={{
                    backgroundColor: 'var(--color-status-warning)', // Keeping the yellow accent for CTA on dark bg
                    color: 'var(--color-text-primary)', // Dark text on yellow
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    ctaText
                  )}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}