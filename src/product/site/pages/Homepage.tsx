import { ErrorBoundary } from '../ui/ErrorBoundary';

import { HeroSection } from './homepage/HeroSection';
import { AssessmentSection } from './homepage/AssessmentSection';
import { MissionSection } from './homepage/MissionSection';
import { BenefitsSection } from './homepage/BenefitsSection';
import { TestimonialSection } from './homepage/TestimonialSection';
import { FAQSection } from './homepage/FAQSection';
import { HowItWorksSection } from './homepage/HowItWorksSection';
import { ReviewsSection } from './homepage/ReviewsSection';

import { AssessmentBlock } from '../ui/blocks/AssessmentBlock';
import { EquipBlock } from '../ui/blocks/EquipBlock';
import { NewsletterBlock } from '../ui/blocks/NewsletterBlock';

import { getListedAssessments, getPrograms } from '../content/catalog';
import { DEFAULT_CMS_CONTENT } from '../content/cms-defaults';
import { NEWSLETTER_CONTENT } from '../content/content';

/**
 * ikanhealth.in's landing page — static.
 *
 * The assessment and programme strips read the build-time snapshot
 * (content/catalog.ts); nothing on this page fetches. It used to request
 * `/assessments`, `/equip-programs` and `/library/resources` on every visit.
 * The resources strip is gone with the resources section of the site.
 *
 * One error boundary for the page: each section that can throw on its own
 * content already carries its own.
 */

interface HomepageProps {
  onNavigate: (route: string) => void;
  onGetStarted: () => void;
}

const equipIntro = DEFAULT_CMS_CONTENT['homepage-equip-intro'].content;

export function Homepage({ onNavigate, onGetStarted }: HomepageProps) {
  const assessments = getListedAssessments().slice(0, 3);
  const programs = getPrograms().slice(0, 3);

  return (
    <ErrorBoundary>
      <div className="w-full" style={{ backgroundColor: 'var(--color-bg-page)', fontFamily: 'var(--font-family-base)' }}>
        <HeroSection onGetStarted={onGetStarted} />

        <div id="assessment">
          <AssessmentSection onGetStarted={onGetStarted} />
        </div>

        <MissionSection />

        <HowItWorksSection onNavigate={onNavigate} />

        <div id="programs">
          <AssessmentBlock
            title="Assessment Programs"
            subtitle="PROGRAM"
            seeMoreText="SEE MORE"
            assessments={assessments}
            onNavigate={onNavigate}
          />
        </div>

        <EquipBlock
          title={equipIntro.title}
          programLabel={equipIntro.subtitle}
          buttonText={equipIntro.ctaText}
          footerText={equipIntro.footerText}
          programs={programs}
          onNavigate={onNavigate}
        />

        <BenefitsSection onNavigate={onNavigate} />

        <TestimonialSection />

        <div id="contact">
          <FAQSection onNavigate={onNavigate} />
        </div>

        <ReviewsSection />

        <NewsletterBlock
          title={NEWSLETTER_CONTENT.HOME.title}
          benefits={[...NEWSLETTER_CONTENT.HOME.benefits]}
          imageAlt={NEWSLETTER_CONTENT.HOME.imageAlt}
          ctaText={NEWSLETTER_CONTENT.HOME.ctaText}
          privacyText={NEWSLETTER_CONTENT.PRIVACY_TEXT}
        />
      </div>
    </ErrorBoundary>
  );
}
