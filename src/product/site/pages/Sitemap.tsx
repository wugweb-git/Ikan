import React, { useMemo } from 'react';
import { useIsMobile } from '../../../shared/hooks/useIsMobile';
import { PageHero } from '../ui/PageHero';
import { NavBadge } from '../ui/NavBadge';
import { DEFAULT_CMS_CONTENT } from '../lib/cms-defaults';
import { House, Info, Mail, ClipboardCheck, BookOpen, Stethoscope, Users, UserCircle, Heart, CircleHelp, Shield, FileText, Ban, RotateCcw } from 'lucide-react';

interface SitemapProps {
  className?: string;
  onNavigate?: (route: string) => void;
  onBack?: () => void;
}

// Icon map for rendering from CMS icon names
const ICON_MAP: Record<string, React.ReactNode> = {
  house: <House size={18} />,
  info: <Info size={18} />,
  mail: <Mail size={18} />,
  'clipboard-check': <ClipboardCheck size={18} />,
  'book-open': <BookOpen size={18} />,
  stethoscope: <Stethoscope size={18} />,
  users: <Users size={18} />,
  'user-circle': <UserCircle size={18} />,
  heart: <Heart size={18} />,
  'circle-help': <CircleHelp size={18} />,
  shield: <Shield size={18} />,
  'file-text': <FileText size={18} />,
  ban: <Ban size={18} />,
  'rotate-ccw': <RotateCcw size={18} />,
};

const DEFAULT_GROUPS = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home', route: '/', icon: 'house', description: 'Landing page with resources, assessments, and programs' },
      { label: 'About Us', route: '/about', icon: 'info', description: 'Our mission, values, and what iKan offers' },
      { label: 'Contact Us', route: '/contact', icon: 'mail', description: 'Get in touch with the iKan team' },
    ],
  },
  {
    title: 'Mental Health Services',
    links: [
      { label: 'Assessments', route: '/assessment', icon: 'clipboard-check', description: 'Clinically validated mental health screenings' },
      { label: 'Equip Programs', route: '/equip', icon: 'book-open', description: 'Self-paced CBT-based wellness programs', badge: 'beta' },
      { label: 'Consultation', route: '/consultation', icon: 'stethoscope', description: 'Book sessions with licensed professionals', badge: 'coming soon' },
      { label: 'Resources', route: '/resource', icon: 'users', description: 'Articles, guides, and mental health tools' },
      { label: 'Join as a Professional', route: '/join/professional', icon: 'stethoscope', description: 'Apply to join iKan as a consultant' },
    ],
  },
  {
    title: 'Your Account',
    links: [
      { label: 'Dashboard', route: '/dashboard', icon: 'house', description: 'Your personalized home after signing in' },
      { label: 'My Account', route: '/account', icon: 'user-circle', description: 'Profile, settings, and payment history' },
      { label: 'Mood Journal', route: '/mood-journal', icon: 'heart', description: 'Track your daily mood and emotions' },
      { label: 'Timeline', route: '/timeline', icon: 'house', description: 'Your activity and progress over time' },
      { label: 'Learning Diary', route: '/learning-diary', icon: 'book-open', description: 'Notes and reflections from your programs' },
    ],
  },
  {
    title: 'Legal & Help',
    links: [
      { label: 'FAQ', route: '/faq', icon: 'circle-help', description: 'Frequently asked questions and help center' },
      { label: 'Privacy Policy', route: '/privacy-policy', icon: 'shield', description: 'How we handle and protect your data' },
      { label: 'Terms of Service', route: '/terms', icon: 'file-text', description: 'Legal terms governing use of iKan' },
      { label: 'Cancellation Policy', route: '/cancellation-policy', icon: 'ban', description: 'How to cancel subscriptions and services' },
      { label: 'Return Policy', route: '/return-policy', icon: 'rotate-ccw', description: 'Our refund and return policy' },
    ],
  },
];

export function Sitemap({ className, onNavigate, onBack }: SitemapProps) {
  const isMobile = useIsMobile();

  const cmsContent = DEFAULT_CMS_CONTENT['page-sitemap'];
  const cms = useMemo(() => {
    if (!cmsContent?.content) return null;
    try { return JSON.parse(cmsContent.content); } catch { return null; }
  }, [cmsContent]);

  const heroTitle = cmsContent?.heroTitle || cms?.heroTitle || 'Site Navigation';
  const heroSubtitle = cmsContent?.heroSubtitle || cms?.heroSubtitle || 'Explore all pages and resources available on iKan.';
  const groups = cms?.groups || DEFAULT_GROUPS;

  return (
    <div
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      <PageHero title={heroTitle} subtitle={heroSubtitle} backgroundImage={cmsContent?.heroImage} />

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
          {groups.map((group: any) => (
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
                {group.links.map((link: any) => (
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
                      {ICON_MAP[link.icon] || <FileText size={18} />}
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
                        <NavBadge label={(link as any).badge} />
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