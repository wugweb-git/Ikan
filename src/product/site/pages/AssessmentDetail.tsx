import { PageHero } from '../ui/PageHero';
import { PageShell } from '../ui/Container';
import { AssessmentBentoGrid } from '../ui/blocks/AssessmentBentoGrid';
import { AssessmentBlock } from '../ui/blocks/AssessmentBlock';
import { NewsletterBlock } from '../ui/blocks/NewsletterBlock';
import { MobileHeader } from '../ui/MobileHeader';
import { useSeo } from '../ui/hooks/useSeo';
import { ASSESSMENT_CONTENT, NEWSLETTER_CONTENT } from '../content/content';
import { assessmentImage } from '../content/assessment-meta';
import { assessmentMinutes, getAssessment, getListedAssessments, type SiteAssessment } from '../content/catalog';
import { APP_LOGIN_URL } from '../content/app-origin';
import { NotFound } from './NotFound';

/**
 * An assessment's public landing page — static.
 *
 * The logged-out view of src/product/app/screens/AssessmentDetail.tsx,
 * rendered from the build-time snapshot. Taking the assessment is an account
 * action, so the hero CTA is a full-page link to the member app's sign-in.
 * Related resources are out of scope for the static site and not rendered.
 */

interface AssessmentDetailProps {
  /** id or slug. No default — no id renders Not Found, not some other assessment. */
  assessmentId?: string;
  onNavigate?: (path: string) => void;
}

// Resolved by Vite at build time, same file the app screen imports.
const defaultBentoImage = new URL('../content/assets/8ce2a19aab5abaf51a83cb99ea2d61447f96d8b2.png', import.meta.url).href;

const toNote = (n: string | { title: string; description?: string }) =>
  typeof n === 'string' ? { title: n, description: '' } : { title: n.title, description: n.description ?? '' };

export function AssessmentDetail({ assessmentId, onNavigate }: AssessmentDetailProps) {
  const raw = getAssessment(assessmentId);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const assessmentData = raw ? {
    title: raw.title || "",
    slug: raw.slug || "",
    description: raw.description || "",
    hero_image: raw.hero_image || raw.image_url || raw.thumbnail_url || raw.thumbnail || "",
    cta_button_text: raw.cta_button_text || "Start Assessment",

    // Authored or absent. A default here is a number the user reads
    // as a promise about their own time.
    questionCount: raw.questionCount,
    duration: assessmentMinutes(raw),
    difficulty: raw.difficulty ? raw.difficulty.charAt(0).toUpperCase() + raw.difficulty.slice(1) : 'Beginner',
    metadata: raw.metadata || {},

    // Section 1: How it works (Tile 3)
    section1_title: raw.section1_title || "How it works",
    section1_eligibility_title: raw.section1_eligibility_title || "Simple process:",
    section1_eligibility_points: raw.section1_eligibility_points || [],
    section1_who_title: raw.section1_who_title || "Who can take this?",
    section1_who_content: raw.section1_who_content || "",

    // Section 2: What is this assessment? (Tile 1 & 2)
    section2_title: raw.section2_title || raw.about_title || "What is this assessment?",
    section2_content: raw.section2_content || raw.about_content || "",
    section2_image: raw.section2_image || raw.about_image || raw.image_url || raw.thumbnail_url || raw.thumbnail || defaultBentoImage,
    section2_bullets: raw.section2_bullets || [],

    // Section 3: What you'll see (Tile 4)
    section3_title: raw.section3_title || raw.highlights_title || "What you'll see",
    section3_subtitle: raw.section3_subtitle || "",
    section3_content: raw.section3_content || raw.highlights || [],

    // Section 4: Things to remember (Tile 3)
    section4_notes_title: raw.section4_notes_title || raw.notes_title || "Things to remember",
    section4_notes: (raw.section4_notes || raw.notes || []).map(toNote),
  } : null;

  useSeo({
    enabled: !!assessmentData,
    title: assessmentData?.title,
    description: assessmentData?.description,
    image: assessmentData?.hero_image,
    canonicalPath: assessmentData ? `/assessment/${assessmentData.slug || assessmentId}` : undefined,
    type: 'article',
    jsonLd: assessmentData ? {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: assessmentData.title,
      description: assessmentData.description,
      url: `https://ikanhealth.in/assessment/${assessmentData.slug || assessmentId}`,
      isPartOf: { '@type': 'WebSite', name: 'iKAN Health', url: 'https://ikanhealth.in' },
    } : null,
  });

  if (!raw || !assessmentData) {
    return <NotFound onNavigate={onNavigate} />;
  }

  /**
   * Exclude the assessment being viewed — by the loaded record's id AND slug,
   * since the route may carry either.
   */
  const related: SiteAssessment[] = getListedAssessments()
    .filter(a => a.id !== raw.id && (!raw.slug || a.slug !== raw.slug))
    .slice(0, 3);

  return (
    <PageShell>
      <MobileHeader title={assessmentData.title} onBack={() => handleNavigate('/assessment')} />

      <div className="w-full">
        {/* HERO SECTION — starting is an account action: a full-page link to the member app. */}
        <PageHero
          variant="split"
          title={assessmentData.title}
          subtitle={assessmentData.description}
          cta={{ label: assessmentData.cta_button_text, to: APP_LOGIN_URL }}
          backgroundImage={assessmentImage(raw) ?? undefined}
        />

        {/* BENTO GRID (Replaces Sections 1-4) */}
        <AssessmentBentoGrid
          section1={{
             title: assessmentData.section1_title,
             eligibilityTitle: assessmentData.section1_eligibility_title,
             eligibilityPoints: assessmentData.section1_eligibility_points,
             whoTitle: assessmentData.section1_who_title,
             whoContent: assessmentData.section1_who_content
          }}
          section2={{
             title: assessmentData.section2_title,
             content: assessmentData.section2_content,
             image: assessmentData.section2_image,
             bullets: assessmentData.section2_bullets
          }}
          section3={{
             title: assessmentData.section3_title,
             subtitle: assessmentData.section3_subtitle,
             content: assessmentData.section3_content
          }}
          section4={{
             notesTitle: assessmentData.section4_notes_title,
             notes: assessmentData.section4_notes
          }}
          questionCount={assessmentData.questionCount}
          duration={assessmentData.duration}
          difficulty={assessmentData.difficulty || 'Beginner'}
          importantNote1={assessmentData.metadata.important_note_1}
          importantNote2={assessmentData.metadata.important_note_2}
          whatYoullSeeHtml={assessmentData.metadata.tile4_content}
          importantNotesHtml={assessmentData.metadata.tile5_content}
        />

        {/* RELATED ASSESSMENTS */}
        <AssessmentBlock
          title={ASSESSMENT_CONTENT.BLOCK_TITLE}
          seeMoreText={ASSESSMENT_CONTENT.BLOCK_SEE_ALL}
          assessments={related}
          onNavigate={handleNavigate}
        />

        {/* NEWSLETTER */}
        <NewsletterBlock
          title={NEWSLETTER_CONTENT.ASSESSMENT.title}
          benefits={[...NEWSLETTER_CONTENT.ASSESSMENT.benefits]}
          imageAlt={NEWSLETTER_CONTENT.ASSESSMENT.imageAlt}
          ctaText={NEWSLETTER_CONTENT.ASSESSMENT.ctaText}
          privacyText={NEWSLETTER_CONTENT.PRIVACY_TEXT}
        />
      </div>
    </PageShell>
  );
}

export default AssessmentDetail;
