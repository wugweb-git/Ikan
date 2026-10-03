import { ErrorBoundary } from '../ui/ErrorBoundary';

import { HeroSection } from './homepage/HeroSection';
import { AssessmentSection } from './homepage/AssessmentSection';
import { ServicesSection } from './homepage/ServicesSection';
import { MissionSection } from './homepage/MissionSection';
import { BenefitsSection } from './homepage/BenefitsSection';
import { TestimonialSection } from './homepage/TestimonialSection';
import { FAQSection } from './homepage/FAQSection';
import { HowItWorksSection } from './homepage/HowItWorksSection';
import { ReviewsSection } from './homepage/ReviewsSection';

import { NewsletterBlock } from '../ui/blocks/NewsletterBlock';

import { NEWSLETTER_CONTENT } from '../content/content';
import { DEFAULT_CMS_CONTENT } from '../content/cms-defaults';
import { useSeo } from '../ui/hooks/useSeo';

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


/*
 * The hero's own copy, read once here and once by HeroSection. The page had NO
 * `useSeo` call at all, so the document title was whatever the previously
 * visited route had set — land on `/` from `/contact` and the tab still read
 * "We're Here to Help". On a cold load it fell back to the static string in
 * index.html.
 *
 * Title and description come from `homepage-hero`, the same record the <h1>
 * and the standfirst render, so the tab and the page cannot drift apart.
 */
const hero = (() => {
  try {
    return JSON.parse(DEFAULT_CMS_CONTENT['homepage-hero'].content) as {
      title?: string;
      description?: string;
    };
  } catch {
    return {};
  }
})();

export function Homepage({ onNavigate, onGetStarted }: HomepageProps) {
  useSeo({
    title: hero.title,
    description: hero.description,
    canonicalPath: '/',
    type: 'website',
  });

  return (
    <ErrorBoundary>
      {/*
        `ikan2-theme` puts the whole landing page on the ported design system.
        The sections below still write the earlier token names inline; those
        names are aliased to iKAN 2's in `ikan2.css`, so the page picks up
        Manrope and Sora, the oklch ramp and the radius scale without ten
        component rewrites. The `@layer base` element mapping also takes over
        h1-h6, so headings get the display face.
      */}
      <div className="ikan2-theme w-full" style={{ backgroundColor: 'var(--canvas)', fontFamily: 'var(--font-sans)' }}>
        <HeroSection onGetStarted={onGetStarted} />

        <div id="assessment">
          <AssessmentSection onGetStarted={onGetStarted} />
        </div>

        <MissionSection />

        <HowItWorksSection onNavigate={onNavigate} />

        {/*
          One Services section in place of the Assessment Programs strip and
          the Equip intro. Those two listed three assessments and three
          programmes BY NAME, so the landing page carried a copy of two
          catalogues that change without it knowing, and still said nothing
          about Mood, Resources or Consultation.
        */}
        <div id="programs">
          <ServicesSection onNavigate={onNavigate} />
        </div>

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
