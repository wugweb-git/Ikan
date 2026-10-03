import { ArrowRight } from 'lucide-react';
import { cn } from '../utils';
import { SiteLink } from '../SiteLink';
import { CONTENT_MAX } from '../Container';
import { AssessmentCard } from './AssessmentCard';
import { assessmentImage } from '../../content/assessment-meta';
import { assessmentMinutes, assessmentUrl, type SiteAssessment } from '../../content/catalog';

/**
 * A strip of assessment cards on the primary band, with a "see all" link.
 *
 * Renders the catalogue's AssessmentCard. It used to draw two cards of its own
 * (a mobile row and a desktop tile) for the same content, and to link its
 * trailing action to `/assessments`, a route that does not exist.
 */
export interface AssessmentBlockProps {
  title?: string;
  subtitle?: string;
  /** Words on the block's own trailing action. */
  seeMoreText?: string;
  /** Where that trailing action goes. */
  seeMoreRoute?: string;
  assessments: SiteAssessment[];
  onNavigate?: (route: string) => void;
  className?: string;
}

export function AssessmentBlock({
  title = 'More assessments',
  subtitle,
  seeMoreText = 'View All Assessments',
  seeMoreRoute = '/assessment',
  assessments,
  onNavigate,
  className,
}: AssessmentBlockProps) {
  if (assessments.length === 0) return null;

  return (
    <div className={cn('py-[24px] lg:py-[48px] px-[20px] relative w-full', className)} style={{ backgroundColor: 'var(--foreground)' }}>
      <div className="flex flex-col items-center justify-center size-full gap-[32px] mx-auto" style={{ maxWidth: CONTENT_MAX }}>
        {title?.trim() && (
          <h2 className="font-medium leading-[48px] text-center w-full" style={{ color: 'var(--background)', fontSize: '32px' }}>
            {title}
          </h2>
        )}
        {subtitle?.trim() && (
          <p className="text-center w-full" style={{ color: 'var(--background)', opacity: 0.85, marginTop: -16 }}>
            {subtitle}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] md:gap-[24px] w-full">
          {assessments.map((a, index) => {
            const minutes = assessmentMinutes(a);
            return (
              <AssessmentCard
                key={a.id}
                index={index}
                href={assessmentUrl(a)}
                onNavigate={onNavigate}
                item={{
                  id: a.id,
                  title: a.title,
                  description: a.description,
                  eyebrow: a.category || 'Assessment',
                  image: assessmentImage(a),
                  // No defaults: a fact the record does not carry renders nothing.
                  countLabel: a.questionCount !== null ? `${a.questionCount} Questions` : null,
                  durationLabel: minutes !== null ? `${minutes} min` : null,
                }}
              />
            );
          })}
        </div>

        <SiteLink
          to={seeMoreRoute}
          onNavigate={onNavigate}
          className="flex items-center justify-center cursor-pointer border-none transition-all hover:opacity-90 no-underline"
          style={{
            gap: '8px',
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 32px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '500',
            fontSize: '16px',
          }}
        >
          {seeMoreText}
          <ArrowRight size={18} />
        </SiteLink>
      </div>
    </div>
  );
}
