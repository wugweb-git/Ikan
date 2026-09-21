/**
 * The article card the Library renders.
 *
 * Lifted verbatim out of `Library.tsx`, where it was a local `BlogCard` that
 * nothing else could reach — so the result screen drew its own, larger card
 * for the same records and the two disagreed about how an article looks.
 * Extracted rather than re-authored: the markup below is unchanged, and
 * `Library` now imports what it used to declare.
 */
import { ContentImage } from '../ContentImage';
import { resolveImageUrl } from '../../../shared/lib/image-utils';

/**
 * Only the five fields the card renders.
 *
 * Deliberately structural rather than `ResourcePost`: the Library's own
 * `Resource` widens `type` to `string` where `ResourcePost` narrows it to a
 * union, so requiring the full shape rejects the very records this card was
 * lifted out of. A card should ask for what it draws.
 */
export interface LibraryResourceCardProps {
  resource: {
    title: string;
    image: string;
    date: string;
    readTime?: string;
    category?: string;
  };
  onClick: () => void;
  /** `small` is the denser variant the Library already uses for its sidebar. */
  size?: 'default' | 'small';
  /**
   * Image box aspect. Default `4/3` is the Library's own catalogue density,
   * where the article IS the page. Beside programme cards — which are `16/9` —
   * that extra height makes an article read as the more important of the two,
   * so the result screen passes `16/9` to put them at the same weight.
   * Image geometry only: nothing else about the card changes.
   */
  imageAspect?: string;
}

export function LibraryResourceCard({ resource, onClick, size = 'default', imageAspect }: LibraryResourceCardProps) {
  const isSmall = size === 'small';
  return (
    <div
      className="group cursor-pointer flex flex-col overflow-hidden"
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Image with category pill overlay */}
      <div
        className="relative overflow-hidden w-full"
        style={{
          aspectRatio: imageAspect ?? (isSmall ? '16/10' : '4/3'),
          backgroundColor: 'var(--color-bg-muted)',
        }}
      >
        <ContentImage
          src={resolveImageUrl(resource.image)}
          alt={resource.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Category pill overlay */}
        {resource.category && (
          <div
            className="absolute top-3 left-3"
            style={{
              backgroundColor: 'rgba(0,0,0,0.65)',
              borderRadius: 'var(--radius-pill, 999px)',
              padding: '4px 12px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-base)',
                color: 'var(--grey-0)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              {resource.category}
            </span>
          </div>
        )}
      </div>

      {/* Text content */}
      <div style={{ padding: isSmall ? '12px 14px 14px' : 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Date + Read time */}
        <div className="flex items-center" style={{ gap: '6px' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 400, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>
            {resource.date}
          </span>
          {resource.readTime && (
            <>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>•</span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 400, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>
                {resource.readTime}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3
          className="line-clamp-2"
          style={{
            fontSize: isSmall ? 'var(--text-sm)' : 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-base)',
            color: 'var(--color-text-primary)',
            lineHeight: '1.4',
            margin: 0,
          }}
        >
          {resource.title}
        </h3>
      </div>
    </div>
  );
}
