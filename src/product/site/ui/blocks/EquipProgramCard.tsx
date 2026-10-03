/**
 * The one programme card: the Equip listing, the homepage strip and the
 * "More Equip Programs" block on a programme page all render this.
 *
 * `EquipBlock` used to draw a second, inline card for the same programmes.
 * The whole card is a link (see SiteLink). The duration is passed in so the
 * caller decides how it is counted (see `programDuration` in catalog.ts).
 */
import { ArrowRight } from 'lucide-react';
import { ContentImage } from '../ContentImage';
import { SiteLink } from '../SiteLink';
import type { SiteProgram } from '../../content/catalog';

export interface EquipProgramCardProps {
  program: Pick<SiteProgram, 'title' | 'name' | 'description' | 'short_description' | 'thumbnail' | 'hero_image' | 'category' | 'is_paid' | 'price' | 'currency'>;
  href: string;
  onNavigate?: (route: string) => void;
  /** e.g. "31 days". Empty renders no badge. */
  durationLabel?: string;
  /** Small caps label over the title, e.g. "PROGRAM". */
  eyebrow?: string;
  /** Drawn action under the body, e.g. "LEARN MORE". */
  cta?: string;
}

export function EquipProgramCard({ program, href, onNavigate, durationLabel = '', eyebrow, cta }: EquipProgramCardProps) {
  const thumbnail = program.thumbnail || program.hero_image || '';
  const title = program.title || program.name || 'Untitled Program';
  const description = program.description || program.short_description || '';
  const price = program.price ?? 0;

  return (
    <SiteLink
      to={href}
      onNavigate={onNavigate}
      className="block no-underline text-inherit transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: 'var(--card)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
        <ContentImage
          src={thumbnail}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {durationLabel && (
          <span
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'var(--background)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: '12px',
            }}
          >
            {durationLabel}
          </span>
        )}
        {/* Price for paid programmes — the warning-surface pair the programme
            page's pricing banner uses, in place of hand-rolled amber literals. */}
        {program.is_paid && price > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--rest-soft)',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: '12px',
              border: '1px solid var(--border)',
            }}
          >
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: program.currency || 'INR', minimumFractionDigits: 0 }).format(price / 100)}
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: 16 }}>
        {eyebrow && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: '500',
              color: 'var(--muted-foreground)',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              margin: '0 0 8px 0',
            }}
          >
            {eyebrow}
          </p>
        )}
        <h3
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: '16px',
            color: 'var(--foreground)',
            margin: '0 0 6px',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: '14px',
              color: 'var(--muted-foreground)',
              margin: 0,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}
        {program.category && (
          <span
            style={{
              display: 'inline-block',
              marginTop: 10,
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--secondary)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: '12px',
              color: 'var(--muted-foreground)',
            }}
          >
            {program.category}
          </span>
        )}
        {cta && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: '500',
              color: 'var(--foreground)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: 12,
            }}
          >
            {cta}
            <ArrowRight style={{ width: '14px', height: '14px' }} aria-hidden="true" />
          </span>
        )}
      </div>
    </SiteLink>
  );
}
