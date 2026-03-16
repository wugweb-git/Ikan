import { MapPin, House, ArrowLeft, Search, CircleHelp, BookOpen, MessageCircle } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { PageHero } from '../ui/PageHero';

interface NotFoundProps {
  onNavigate?: (route: string) => void;
}

export function NotFound({ onNavigate }: NotFoundProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg-page)', fontFamily: 'var(--font-family-base)' }}
    >
      <PageHero
        title="Page Not Found"
        subtitle="We couldn't find the page you're looking for."
      />

      <div
        className="flex-1 w-full mx-auto flex items-center justify-center"
        style={{
          maxWidth: 'var(--banner-content-max, 1100px)',
          padding: isMobile ? '24px 16px' : '48px 24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            textAlign: 'center',
            backgroundColor: isMobile ? 'transparent' : 'var(--color-bg-card)',
            borderRadius: isMobile ? '0' : 'var(--radius-lg)',
            border: isMobile ? 'none' : '1px solid var(--color-border-light)',
            boxShadow: isMobile ? 'none' : 'var(--shadow-sm)',
            padding: isMobile ? '24px 0' : '40px 32px',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <Search size={36} style={{ color: 'var(--color-text-muted)' }} />
          </div>

          {/* Text */}
          <h2
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              margin: '0 0 8px 0',
            }}
          >
            Lost your way?
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-muted)',
              lineHeight: '1.6',
              margin: '0 0 32px 0',
            }}
          >
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => onNavigate?.('/')}
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-primary-on)',
                backgroundColor: 'var(--color-primary-default)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '14px 24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <House size={18} />
              Return Home
            </button>

            <button
              onClick={() => window.history.back()}
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}