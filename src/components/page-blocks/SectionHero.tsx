import { cn } from '../ui/utils';
import { Button } from "../ui/button";
import { ContentImage } from '../ui/ContentImage';

/*
 * There is deliberately no fallback image any more.
 *
 * This used to swap in a hardcoded Unsplash photo on any load error. Every
 * hero in the store is a SIGNED Supabase URL with an expiry — the seven
 * `assessment_def:` heroes all expire on the same day — so on that day the
 * heroes would not have broken, they would all silently have become one
 * stock photo of somebody else's, with nothing in the UI or the logs saying
 * so. `ContentImage` renders its neutral local placeholder instead, and the
 * failure is logged so it can be seen.
 */

/**
 * SectionHero - Unified hero component for landing pages.
 * Replaces the formerly-duplicate AssessmentHero and EquipHero components.
 * Both old names are re-exported from their original files for backward-compat.
 */
export interface SectionHeroProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  backgroundImage?: string;
  backgroundAlt?: string;
  className?: string;
}

export function SectionHero({
  title,
  description,
  buttonText,
  buttonLink,
  onButtonClick,
  backgroundImage,
  backgroundAlt = "Hero background",
  className = ""
}: SectionHeroProps) {
  /*
   * `window.location.href` was a full document reload inside the SPA —
   * every route, every context and the whole bundle re-fetched to move one
   * screen. The anchor below carries the real href so the link is a link;
   * this handler keeps the in-app navigation for a plain left click.
   */
  const handleClick = (e?: React.MouseEvent) => {
    if (onButtonClick) {
      e?.preventDefault();
      onButtonClick();
    }
    // With no handler the anchor's own href does the work.
  };

  return (
    <section 
      className={cn(
        "relative w-full overflow-hidden flex flex-col justify-center min-h-[500px] lg:min-h-[600px]",
        className
      )}
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full z-0">
          {/* The LCP element. `ContentImage` is the primitive ResourceHero
              already uses; `fetchPriority` and eager loading stop the browser
              deprioritising the one image that decides the paint. It is
              decorative — the headline beside it carries the meaning — so it
              is hidden from assistive tech rather than described. */}
          <ContentImage
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            sizes="100vw"
            onError={() => {
              console.warn('[SectionHero] hero image failed to load:', backgroundImage);
            }}
          />
          {/*
            One scrim geometry at every width.
            It used to be `inset-0 lg:w-2/3`: below `lg` it covered the whole
            image and washed it out, and the text is near-black with no shadow,
            so legibility depended on the photo happening to be light on the
            left. Now the gradient runs the same direction everywhere and the
            left third is opaque page colour, which guarantees contrast under
            the headline whatever the image is.
          */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(to right, var(--color-bg-page) 0%, var(--color-bg-page) 30%, color-mix(in srgb, var(--color-bg-page) 70%, transparent) 55%, transparent 85%)',
            }}
          />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-0">
        <div className="max-w-[500px] flex flex-col items-start" style={{ gap: 'var(--spacing-6)' }}>
          {/* Title */}
          <h1 
            style={{
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--text-3xl)',
              lineHeight: 'var(--line-height-xs)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p 
            style={{
              fontWeight: 'var(--font-weight-regular)',
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--line-height-md)',
              color: 'var(--color-text-primary)',
              opacity: 0.9,
              fontFamily: 'var(--font-family-base)',
            }}
          >
            {description}
          </p>

          {/* CTA — a real link when it goes to a URL.
              `asChild` renders the Button's styling onto the anchor, so this
              keeps open-in-new-tab, middle-click, copy-link-address, keyboard
              focus and the internal link graph, while the click handler still
              does the in-app navigation. Nothing about the appearance changes.
              With no `buttonLink` there is nowhere to go, so it stays a
              button. */}
          <Button
            {...(buttonLink ? { asChild: true } : {})}
            onClick={buttonLink ? undefined : handleClick}
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              paddingLeft: 'var(--spacing-8)',
              paddingRight: 'var(--spacing-8)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {buttonLink
              ? <a href={buttonLink} onClick={handleClick}>{buttonText}</a>
              : buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}