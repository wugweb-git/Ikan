import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { PageHero } from '../ui/PageHero';
import { usePageContent } from '../../hooks/usePageContent';

interface SitemapProps {
  className?: string;
  onNavigate?: (route: string) => void;
  onBack?: () => void;
}

interface SitemapLink {
  label: string;
  route: string;
  icon: React.ReactNode;
  description: string;
}

interface SitemapGroup {
  title: string;
  links: SitemapLink[];
}

const sitemapGroups: SitemapGroup[] = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home', route: '/', icon: <Home size={18} />, description: 'Landing page with resources, assessments, and programs' },
      { label: 'About Us', route: '/about', icon: <Info size={18} />, description: 'Our mission, values, and what iKan offers' },
      { label: 'Contact Us', route: '/contact', icon: <Mail size={18} />, description: 'Get in touch with the iKan team' },
    ],
  },
  {
    title: 'Mental Health Services',
    links: [
      { label: 'Assessments', route: '/assessment', icon: <ClipboardCheck size={18} />, description: 'Clinically validated mental health screenings' },
      { label: 'Equip Programs', route: '/equip', icon: <BookOpen size={18} />, description: 'Self-paced CBT-based wellness programs' },
      { label: 'Consultation', route: '/consultation', icon: <Stethoscope size={18} />, description: 'Book sessions with licensed professionals' },
      { label: 'Resources', route: '/resource', icon: <Users size={18} />, description: 'Articles, guides, and mental health tools' },
    ],
  },
  {
    title: 'Your Account',
    links: [
      { label: 'My Account', route: '/account', icon: <UserCircle size={18} />, description: 'Profile, settings, and payment history' },
      { label: 'Mood Journal', route: '/mood-journal', icon: <Heart size={18} />, description: 'Track your daily mood and emotions' },
    ],
  },
  {
    title: 'Legal & Help',
    links: [
      { label: 'FAQ', route: '/faq', icon: <HelpCircle size={18} />, description: 'Frequently asked questions and help center' },
      { label: 'Privacy Policy', route: '/privacy-policy', icon: <Shield size={18} />, description: 'How we handle and protect your data' },
      { label: 'Terms of Service', route: '/terms', icon: <FileText size={18} />, description: 'Legal terms governing use of iKan' },
      { label: 'Cancellation Policy', route: '/cancellation-policy', icon: <Ban size={18} />, description: 'How to cancel subscriptions and services' },
      { label: 'Return Policy', route: '/return-policy', icon: <RotateCcw size={18} />, description: 'Our refund and return policy' },
    ],
  },
];

export function Sitemap({ className, onNavigate, onBack }: SitemapProps) {
  const isMobile = useIsMobile();
  const { content } = usePageContent('sitemap');

  return (
    <div
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      {/* Hero Section */}
      <PageHero
        title={content?.heroTitle || 'Site Navigation'}
        subtitle={content?.heroSubtitle || 'Explore all pages and resources available on iKan.'}
      />

      {/* Content */}
      <div
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile
            ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)'
            : 'var(--ikan-component-spacing-large) var(--spacing-12)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '24px',
          }}
        >
          {sitemapGroups.map((group) => (
            <div
              key={group.title}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-light)',
                padding: isMobile ? '20px' : '28px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  margin: '0 0 16px 0',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--color-border-default)',
                }}
              >
                {group.title}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.links.map((link) => (
                  <button
                    key={link.route}
                    onClick={() => onNavigate?.(link.route)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background-color 0.15s ease',
                      fontFamily: 'var(--font-family-base)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = 'var(--color-bg-page)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <div
                      style={{
                        color: 'var(--color-text-muted)',
                        marginTop: '2px',
                        flexShrink: 0,
                      }}
                    >
                      {link.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          margin: '0 0 2px 0',
                        }}
                      >
                        {link.label}
                      </p>
                      <p
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-regular)',
                          color: 'var(--color-text-muted)',
                          margin: '0',
                          lineHeight: '1.5',
                        }}
                      >
                        {link.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}