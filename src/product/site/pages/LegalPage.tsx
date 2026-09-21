import { useIsMobile } from '../ui/hooks/useIsMobile';
import { DEFAULT_CMS_CONTENT } from '../content/cms-defaults';
import { PageHero } from '../ui/PageHero';
import { Container, PageShell } from '../ui/Container';
import { sanitizeHtml } from '../ui/lib/sanitize';

/**
 * One policy page, four routes: Privacy, Terms, Return and Cancellation were
 * four identical files differing only in which cms-defaults entry they read.
 * The entry's own title and subtitle win; the props are the fallbacks.
 */
export interface LegalPageProps {
  cmsKey: 'privacy' | 'terms' | 'return-policy' | 'cancellation-policy';
  title: string;
  subtitle?: string;
  className?: string;
}

export function LegalPage({ cmsKey, title, subtitle, className }: LegalPageProps) {
  const isMobile = useIsMobile();
  const content = DEFAULT_CMS_CONTENT[cmsKey];

  return (
    <PageShell className={className}>
      <PageHero
        title={content?.heroTitle || content?.title || title}
        subtitle={content?.heroSubtitle || content?.subtitle || subtitle}
        backgroundImage={content?.heroImage}
      />

      <Container className="py-6 md:py-10">
        <div
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content?.content) }}
          className="prose max-w-none"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: isMobile ? '24px' : '40px',
            fontFamily: 'var(--font-family-base)',
          }}
        />
      </Container>
    </PageShell>
  );
}
