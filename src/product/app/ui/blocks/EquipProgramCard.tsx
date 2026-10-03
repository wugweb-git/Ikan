/**
 * The programme card the Equip listing renders.
 *
 * Lifted verbatim out of `EquipPrograms.tsx`, where it was inline JSX inside a
 * `.map` and unreachable from anywhere else — which is why the result screen
 * drew a different card for the same programmes. Extracted, not re-authored.
 *
 * `durationLabel` is passed in rather than derived here: `total_days` and
 * `duration` are null on all four live programmes, so the caller resolves it
 * through `equipMeta` from the content instead.
 */
import { ContentImage } from '../ContentImage';

export interface EquipProgramCardProps {
  program: {
    title?: string;
    name?: string;
    description?: string;
    short_description?: string;
    thumbnail?: string;
    hero_image?: string;
    category?: string;
    is_paid?: boolean;
    price?: number;
    currency?: string;
  };
  /** e.g. "31 days". Empty renders no badge. */
  durationLabel?: string;
  onClick: () => void;
}

export function EquipProgramCard({ program, durationLabel = '', onClick }: EquipProgramCardProps) {
  const thumbnail = program.thumbnail || program.hero_image || '';
  const title = program.title || program.name || 'Untitled Program';
  const description = program.description || program.short_description || '';
  const duration = durationLabel;
  // `program` was untyped (`any`) at the original call site, so `price` needed
  // no guard there. Typing it optional makes the guard explicit; the rendered
  // result is unchanged.
  const price = program.price ?? 0;

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-card)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid var(--color-border-default)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
        <ContentImage
          src={thumbnail}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {duration && (
          <span
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'var(--grey-0)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 500,
              fontSize: 'var(--text-xs)',
            }}
          >
            {duration}
          </span>
        )}
        {/* Price badge for paid programs */}
        {program.is_paid && price > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 500,
              fontSize: 'var(--text-xs)',
              border: '1px solid #FDE68A',
            }}
          >
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: program.currency || 'INR', minimumFractionDigits: 0 }).format(price / 100)}
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: 16 }}>
        <h3
          style={{
            fontFamily: 'var(--font-family-base)',
            fontWeight: 500,
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            margin: '0 0 6px',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontWeight: 400,
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
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
              backgroundColor: 'var(--color-accent-default)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 500,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            {program.category}
          </span>
        )}
      </div>
    </div>
  );
}
