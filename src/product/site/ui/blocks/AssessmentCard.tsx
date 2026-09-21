import { motion, useReducedMotion } from 'framer-motion';
import { Clock, FileText, ArrowRight, Check } from 'lucide-react';
import { cn } from '../utils';
import { SiteLink } from '../SiteLink';

/**
 * One card for the seven assessments — and for the programs recommended off
 * the back of them.
 *
 * Four surfaces drew this same content four ways: the catalogue
 * (`Assessments`), the bento grid, `AssessmentBlock`, and a landing screen
 * whose card was a static object with `'10 questions'` typed into it. They
 * drifted in every direction that matters — different image ladders, different
 * duration defaults, different words on the button.
 *
 * The catalogue's card is the one users see first and the most complete, so it
 * is the one that survived. `compact` is the same card with the description
 * dropped and the image shrunk, which is what the narrow columns needed and is
 * why there is no second component.
 *
 * Content comes in already normalised (see `toCardItem` helpers at the call
 * sites) so this file never reaches into a record and never invents a fact:
 * a null chip renders nothing rather than a plausible number.
 */

export interface AssessmentCardItem {
  id: string;
  title: string;
  /** Rendered in `full` only. Absent is fine. */
  description?: string | null;
  /** Eyebrow over the title. A category slug or a program's own label. */
  eyebrow?: string | null;
  /** Authored image. Null renders the muted plate rather than a stock photo. */
  image?: string | null;
  /** Minutes, days — whatever the item measures itself in. Null renders nothing. */
  durationLabel?: string | null;
  /** Item count or activity count. Null renders nothing. */
  countLabel?: string | null;
  /** Words on the action. The card says what happens when it is used. */
  cta?: string;
  /** Shows the completed pip on the image. */
  completed?: boolean;
}

interface AssessmentCardProps {
  item: AssessmentCardItem;
  /** `full` for a catalogue grid, `compact` for a side-by-side pair. */
  variant?: 'full' | 'compact';
  /** Reveal order, for the staggered entrance. */
  index?: number;
  /** Where the card goes. The whole card is one link (see SiteLink). */
  href?: string;
  onNavigate?: (route: string) => void;
  className?: string;
}

const font = (size: string, weight = 400, color = 'var(--color-text-primary)') => ({
  fontFamily: 'var(--font-family-base)',
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  color,
});

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
      style={{ backgroundColor: 'var(--color-bg-muted)', ...font('xs', 500, 'var(--color-text-muted)') }}
    >
      <span style={{ color: 'var(--color-primary-default)', display: 'flex' }}>{icon}</span>
      {label}
    </span>
  );
}

export function AssessmentCard({ item, variant = 'full', index = 0, href, onNavigate, className }: AssessmentCardProps) {
  const reduce = useReducedMotion();
  const compact = variant === 'compact';

  const chips = (
    <>
      {item.durationLabel && <Chip icon={<Clock size={13} />} label={item.durationLabel} />}
      {item.countLabel && <Chip icon={<FileText size={13} />} label={item.countLabel} />}
    </>
  );

  // The whole card is the link, so the action below is drawn rather than
  // nested — an interactive element inside a link is not operable the way it
  // looks like it should be.
  const card = (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
      whileHover={reduce || !href ? undefined : { y: -4 }}
      whileTap={reduce || !href ? undefined : { scale: 0.985 }}
      className={cn(
        'group flex h-full flex-col overflow-hidden text-left',
        href && 'cursor-pointer',
        !href && className,
      )}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Image. A missing image is a muted plate — never a stock photo of
          someone else's condition standing in for this one. */}
      <div
        className={cn('relative w-full overflow-hidden', compact ? 'h-24' : 'h-40 sm:h-48')}
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
      >
        {item.image && (
          <img
            src={item.image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {!compact && item.image && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        )}

        {item.completed && (
          <span
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-1"
            style={{
              backgroundColor: 'var(--color-status-success)',
              ...font('xs', 500, 'var(--color-text-inverse)'),
            }}
          >
            <Check size={12} /> Completed
          </span>
        )}

        {/* At `full` the title sits on the image, which is the catalogue's
            signature. At `compact` the plate is too short to hold legible
            type, so the title drops below it. */}
        {!compact && (
          <div className="absolute inset-x-4 bottom-4">
            {item.eyebrow && (
              <p
                className="mb-1 uppercase"
                style={{ ...font('xs', 500, item.image ? 'rgb(255 255 255 / 0.9)' : 'var(--color-text-muted)'), letterSpacing: '0.08em' }}
              >
                {item.eyebrow}
              </p>
            )}
            <h3 style={{ ...font('xl', 500, item.image ? '#fff' : 'var(--color-text-primary)'), lineHeight: 1.2, margin: 0 }}>
              {item.title}
            </h3>
          </div>
        )}
      </div>

      <div className={cn('flex flex-grow flex-col', compact ? 'gap-2 p-3' : 'gap-4 p-5')}>
        {compact && (
          <div>
            {item.eyebrow && (
              <p className="mb-1 uppercase" style={{ ...font('xs', 500, 'var(--color-text-muted)'), letterSpacing: '0.08em' }}>
                {item.eyebrow}
              </p>
            )}
            <h3 style={{ ...font('base', 500), lineHeight: 1.3, margin: 0 }}>{item.title}</h3>
          </div>
        )}

        {!compact && item.description && (
          <p className="line-clamp-3 flex-grow" style={font('sm', 400, 'var(--color-text-muted)')}>
            {item.description}
          </p>
        )}

        {(item.durationLabel || item.countLabel) && (
          <div className={cn('flex flex-wrap items-center', compact ? 'gap-1.5' : 'gap-2')}>{chips}</div>
        )}

        {!compact && item.cta && (
          <span
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 py-3 transition-colors group-hover:bg-[var(--color-primary-default)] group-hover:text-[var(--color-text-inverse)]"
            style={{ backgroundColor: 'var(--color-bg-muted)', ...font('base', 500) }}
          >
            {item.cta}
            <ArrowRight size={16} />
          </span>
        )}
      </div>
    </motion.div>
  );

  if (!href) return card;
  return (
    <SiteLink
      to={href}
      onNavigate={onNavigate}
      className={cn(
        'block h-full no-underline text-inherit rounded-[var(--radius-lg)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-default)] focus-visible:ring-offset-2',
        className,
      )}
    >
      {card}
    </SiteLink>
  );
}
