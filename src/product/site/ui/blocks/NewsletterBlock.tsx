import { useState } from 'react';
import { cn } from '../utils';
import { useIsMobile } from '../hooks/useIsMobile';
import { LayoutGrid } from 'lucide-react';
import { apiClient } from '../../../../shared/api';

interface NewsletterBlockProps {
  title?: string;
  benefits?: string[];
  imageAlt?: string;
  ctaText?: string;
  privacyText?: string;
  onSubscribe?: (email: string) => void;
  className?: string;
}

export function NewsletterBlock({
  title,
  benefits,
  imageAlt,
  ctaText,
  privacyText,
  onSubscribe,
  className,
}: NewsletterBlockProps) {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiClient.subscribeNewsletter(email.trim());
      if (response.success) {
        setSubmitted(true);
        onSubscribe?.(email);
      } else {
        setError(response.error || 'Subscription failed.');
      }
    } catch (err) {
      console.error('Newsletter signup error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={cn('w-full', className)}
      style={{ padding: isMobile ? '40px 16px' : '64px 24px' }}
    >
      <div
        style={{
          maxWidth: '980px',
          margin: '0 auto',
        }}
      >
        {/* Dark newsletter card */}
        <div
          style={{
            backgroundColor: 'var(--grey-10)',
            borderRadius: isMobile ? '24px' : '28px',
            padding: isMobile ? '36px 24px' : '48px 48px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '28px' : '40px',
          }}
        >
          {/* Left — heading + description */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: '1 1 0',
              maxWidth: isMobile ? '100%' : '420px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-family-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontSize: isMobile ? '28px' : '36px',
                lineHeight: '1.2',
                color: 'var(--color-text-inverse)',
                margin: 0,
              }}
            >
              {title || (
                <>
                  Sign up for
                  <br />
                  our newsletter
                </>
              )}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-family-base)',
                fontWeight: 'var(--font-weight-regular)',
                fontSize: isMobile ? '14px' : '15px',
                lineHeight: '1.65',
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                maxWidth: '380px',
              }}
            >
              {(benefits && benefits[0]) ||
                'Stay informed about mental health tips, new programs, and community updates.'}
            </p>

            {/* THE OTHER TWO BENEFITS. Three are authored in
                `NEWSLETTER_CONTENT.BENEFITS` and passed in by both detail
                screens; `benefits[0]` rendered one and dropped the rest. */}
            {Array.isArray(benefits) && benefits.length > 1 && (
              <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {benefits.slice(1).map((benefit, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-regular)',
                      fontSize: isMobile ? '13px' : '14px',
                      lineHeight: '1.6',
                      color: 'rgba(255,255,255,0.7)',
                      display: 'flex', alignItems: 'flex-start', gap: '8px',
                    }}
                  >
                    <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: '1.6' }}>—</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            )}

            {/* The privacy line. Authored as `PRIVACY_TEXT`, passed in, and
                rendered nowhere — on a form that collects an email address. */}
            {privacyText && (
              <p
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-regular)',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: 'rgba(255,255,255,0.55)',
                  margin: '14px 0 0',
                  maxWidth: '380px',
                }}
              >
                {privacyText}
              </p>
            )}
          </div>

          {/* Right — form */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flex: isMobile ? undefined : '1 1 0',
              maxWidth: isMobile ? '100%' : '420px',
              justifyContent: 'center',
              alignSelf: 'center',
              width: isMobile ? '100%' : undefined,
            }}
          >
            {submitted ? (
              <div
                style={{
                  backgroundColor: 'rgba(78,205,196,0.15)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontSize: '16px',
                    color: 'var(--color-status-success)',
                    margin: 0,
                  }}
                >
                  Thank you for subscribing!
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '10px',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--color-bg-input)',
                    borderRadius: '10px',
                    flex: 1,
                    height: 'var(--ikan-component-button-height)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                  }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontFamily: 'var(--font-family-base)',
                      fontSize: '14px',
                      color: 'var(--grey-8)',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? 'var(--color-status-warning)' : 'var(--color-status-warning-light)',
                    borderRadius: '10px',
                    border: 'none',
                    height: 'var(--ikan-component-button-height)',
                    padding: '0 24px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontSize: '14px',
                    color: 'var(--color-primary-default)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'filter 0.15s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.filter = 'brightness(1.05)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.filter = 'none')
                  }
                >
                  <LayoutGrid size={15} strokeWidth={2.5} />
                  {isSubmitting ? 'Subscribing...' : (ctaText || 'Subscribe')}
                </button>
              </form>
            )}
            {error && (
              <p style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: '13px',
                color: 'var(--color-status-danger)',
                margin: '4px 0 0',
                textAlign: 'center'
              }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}