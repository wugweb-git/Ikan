import { useMemo } from 'react';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { PageHero } from '../ui/PageHero';
import { Container, PageShell } from '../ui/Container';
import { NavBadge } from '../ui/NavBadge';
import { NavIcon } from '../ui/NavIcon';
import { SiteLink } from '../ui/SiteLink';
import { DEFAULT_CMS_CONTENT } from '../content/cms-defaults';
import { SITEMAP_SECTIONS } from '../content/nav';

/**
 * Every page on the site, rendered from content/nav.ts — the same table the
 * footer and mobile menu read. It used to hold a third hand-written list
 * (overridden by a fourth in cms-defaults) with member-only screens and a
 * resources page the site does not have.
 */

interface SitemapProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

export function Sitemap({ className, onNavigate }: SitemapProps) {
  const isMobile = useIsMobile();

  const cmsContent = DEFAULT_CMS_CONTENT['page-sitemap'];
  const cms = useMemo(() => {
    if (!cmsContent?.content) return null;
    try { return JSON.parse(cmsContent.content); } catch { return null; }
  }, [cmsContent]);

  const heroTitle = cms?.heroTitle || 'Site Navigation';
  const heroSubtitle = cms?.heroSubtitle || 'Explore all pages and resources available on iKan.';

  return (
    <PageShell className={className}>
      <PageHero title={heroTitle} subtitle={heroSubtitle} />

      <Container className="py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SITEMAP_SECTIONS.map((group) => (
            <div
              key={group.title}
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: isMobile ? '20px' : '28px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '18px',
                  fontWeight: '500',
                  color: 'var(--foreground)',
                  margin: '0 0 16px 0',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {group.title}
              </h2>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'none', margin: 0, padding: 0 }}>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <SiteLink
                      to={link.to}
                      onNavigate={onNavigate}
                      className="flex items-start gap-3 p-3 w-full text-left no-underline transition-colors hover:bg-[var(--canvas)]"
                      style={{ borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)' }}
                    >
                      <span style={{ color: 'var(--muted-foreground)', marginTop: '2px', flexShrink: 0 }}>
                        <NavIcon name={link.icon} />
                      </span>
                      <span>
                        <span
                          className="block"
                          style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color: 'var(--foreground)',
                            margin: '0 0 2px 0',
                          }}
                        >
                          {link.label}
                          <NavBadge label={link.badge} />
                        </span>
                        <span
                          className="block"
                          style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: 'var(--muted-foreground)',
                            lineHeight: '1.5',
                          }}
                        >
                          {link.description}
                        </span>
                      </span>
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
