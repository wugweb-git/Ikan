import { PageHero } from '../ui/PageHero';
import { PageShell } from '../ui/Container';
import { EquipBentoGrid } from '../ui/blocks/EquipBentoGrid';
import { EquipBlock } from '../ui/blocks/EquipBlock';
import { NewsletterBlock } from '../ui/blocks/NewsletterBlock';
import { MobileHeader } from '../ui/MobileHeader';
import { useSeo } from '../ui/hooks/useSeo';
import { recordImage, cmsLines } from '../content/cms-content';
import { EmptyState } from '../ui/empty-state';
import { NEWSLETTER_CONTENT, LEGACY_PROGRAM_IDS } from '../content/content';
import { getProgram, getPrograms, type SiteProgram } from '../content/catalog';
import { APP_LOGIN_URL } from '../content/app-origin';

/**
 * An Equip programme's public landing page — static.
 *
 * The logged-out view of src/product/app/screens/EquipDetail.tsx, rendered
 * from the build-time snapshot. The programme's day-by-day content is NOT in
 * the snapshot (only its day/activity counts), and enrolling or paying is an
 * account action: the hero CTA is a full-page link to the member app's
 * sign-in. Related resources are out of scope for the static site.
 */

interface EquipDetailProps {
  equipId?: string;
  onNavigate?: (path: string) => void;
}

export function EquipDetail({ equipId, onNavigate }: EquipDetailProps) {
  const equipData = getProgram(equipId);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  useSeo({
    enabled: !!equipData,
    title: equipData?.title,
    description: equipData?.description,
    image: equipData ? recordImage(equipData as unknown as Record<string, unknown>) : undefined,
    canonicalPath: equipData ? `/equip/${equipData.slug || equipId}` : undefined,
    type: 'article',
    jsonLd: equipData ? {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: equipData.title,
      description: equipData.description,
      provider: { '@type': 'Organization', name: 'iKan Health', url: 'https://ikanhealth.in' },
      url: `https://ikanhealth.in/equip/${equipData.slug || equipId}`,
    } : null,
  });

  // Error/Empty state
  if (!equipData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[var(--color-bg-page)] p-4">
        <EmptyState
          variant="search"
          title="Program Not Found"
          description="The program you are looking for does not exist or has been removed."
          actionLabel="View All Programs"
          onAction={() => handleNavigate('/equip')}
        />
      </div>
    );
  }

  // Paid program helpers
  const isPaid = !!(equipData.is_paid && (equipData.price ?? 0) > 0);
  const priceDisplay = isPaid
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: equipData.currency || 'INR', minimumFractionDigits: 0 }).format((equipData.price ?? 0) / 100)
    : null;

  // Starting (or paying for) a programme happens in the member app.
  const ctaButtonText = isPaid ? `Pay ${priceDisplay} to Start` : (equipData.cta_button_text || 'Start Program');

  /*
    EXCLUDE THIS PROGRAMME — by id AND slug, compared against what the loaded
    record says it is, not against how it was addressed.
  */
  const selfKeys = [equipId, equipData.id, equipData.slug].filter(Boolean) as string[];
  const isSelf = (p: SiteProgram) =>
    selfKeys.includes(p.id ?? '') || selfKeys.includes(p.equip_id ?? '') || selfKeys.includes(p.slug ?? '');
  const related = getPrograms()
    .filter(p => !isSelf(p))
    .filter(p => !(LEGACY_PROGRAM_IDS as readonly string[]).includes(p.id || p.equip_id || '')) // Exclude legacy programs
    .slice(0, 3);

  return (
    <PageShell>
      <MobileHeader title={equipData.title} onBack={() => handleNavigate('/equip')} />

      <div className="w-full">
        {/* HERO SECTION — a full-page link to the member app's sign-in. */}
        <PageHero
          variant="split"
          title={equipData.title || ''}
          subtitle={equipData.description || ''}
          cta={{ label: ctaButtonText, to: APP_LOGIN_URL }}
          backgroundImage={recordImage(equipData as unknown as Record<string, unknown>)}
        />

        {/* PRICING BANNER (for paid programs) */}
        {isPaid && (
          <div style={{
            maxWidth: 800, margin: '0 auto', padding: '0 var(--spacing-4)',
          }}>
            {/* Tokens in place of the app screen's amber gradient literals
                (#FFF7ED → #FEF3C7, border #FDE68A): the nearest surface tokens,
                the same pair the assessment bento's warning tile uses. */}
            <div style={{
              background: 'var(--color-status-warning-light)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-5) var(--spacing-6)',
              border: '1px solid var(--color-border-default)',
              marginTop: 'var(--spacing-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap' as const,
              gap: 'var(--spacing-3)',
            }}>
              <div>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  fontFamily: 'var(--font-family-base)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}>
                  Premium Program
                </p>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 400,
                  fontFamily: 'var(--font-family-base)',
                  color: 'var(--color-text-muted)',
                  margin: '4px 0 0',
                }}>
                  {`One-time payment of ${priceDisplay} for full access`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MIDDLE SECTION: BENTO GRID (Replaces Sections 1-4) */}
        <EquipBentoGrid
          /* The store holds these as newline-delimited strings; the grid runs
             them through `cmsLines` anyway, so splitting here only gives them
             the array type the grid declares. */
          tile1Content={cmsLines(equipData.metadata?.tile1_content)}
          tile2Content={cmsLines(equipData.metadata?.tile2_content)}
          tile3Content={cmsLines(equipData.metadata?.tile3_content)}
          tile4Content={cmsLines(equipData.metadata?.tile4_content)}
          eligibilityIntro={equipData.metadata?.eligibility_intro}
          eligibilityPoint1={equipData.metadata?.eligibility_point_1}
          eligibilityPoint2={equipData.metadata?.eligibility_point_2}
          eligibilityPoint3={equipData.metadata?.eligibility_point_3}
          eligibilityPoint4={equipData.metadata?.eligibility_point_4}
          rightColumnItems={cmsLines(equipData.metadata?.right_column_items).map(text => ({ text }))}
          howItWorksSubtitle={equipData.metadata?.how_it_works_subtitle}
          howItWorksFooter={equipData.metadata?.how_it_works_footer}
        />

        {/* BOTTOM SECTION: EQUIP BLOCK - Related Programs */}
        <EquipBlock
          title="More Equip Programs"
          footerText="Explore other programs to support your mental wellness journey"
          programs={related}
          onNavigate={handleNavigate}
        />

        {/* BOTTOM SECTION: NEWSLETTER BLOCK */}
        <NewsletterBlock
          title={NEWSLETTER_CONTENT.EQUIP.title}
          benefits={[...NEWSLETTER_CONTENT.EQUIP.benefits]}
          imageAlt={NEWSLETTER_CONTENT.EQUIP.imageAlt}
          ctaText={NEWSLETTER_CONTENT.EQUIP.ctaText}
          privacyText={NEWSLETTER_CONTENT.PRIVACY_TEXT}
        />
      </div>
    </PageShell>
  );
}

export default EquipDetail;
