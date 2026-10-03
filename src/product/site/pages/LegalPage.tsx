import { LEGAL_PAGES } from '../content/legal';
import { useMemo } from 'react';
import { useSeo } from '../ui/hooks/useSeo';
import { sanitizeHtml } from '../ui/lib/sanitize';

/**
 * One policy page, four routes — Privacy, Terms, Return and Cancellation.
 *
 * Rebuilt on iKAN 2's `/legal/$slug`: the app's theme, its `.prose-ikan` body,
 * and the device the site was missing entirely — a switcher across the four.
 * Until now a reader on the privacy page who wanted the refund terms had to go
 * back out through the footer to find them.
 *
 * Content comes from `../content/legal`, which is the fuller copy — iKAN 2's
 * own policy text is abridged and has no "Deleting your account" section at
 * all, so that file is the source and the app syncs from it.
 *
 * The old version was a full-bleed `PageHero` over one bordered card, which
 * matched neither the app nor the rest of this site.
 */

export type LegalSlug = keyof typeof LEGAL_PAGES;

/** The order they appear in the switcher: what people look for, most first. */
export const LEGAL_ORDER = [
  'privacy-policy',
  'terms',
  'cancellation-policy',
  'return-policy',
] as const;

/** The route each slug lives at on this site, which is not the iKAN 2 path. */
const ROUTE: Record<string, string> = {
  'privacy-policy': '/privacy',
  terms: '/terms',
  'cancellation-policy': '/cancellation-policy',
  'return-policy': '/return-policy',
};

export interface LegalPageProps {
  /** Accepts the site's historic key as well as the iKAN 2 slug. */
  cmsKey: 'privacy' | 'terms' | 'return-policy' | 'cancellation-policy';
  title: string;
  subtitle?: string;
  onNavigate?: (route: string) => void;
  className?: string;
}

export function LegalPage({ cmsKey, title, subtitle, onNavigate, className }: LegalPageProps) {
  const slug = cmsKey === 'privacy' ? 'privacy-policy' : cmsKey;
  const page = LEGAL_PAGES[slug];

  /*
   * The policy HTML was authored inside a Tailwind-classed container and still
   * carries those utilities — `bg-white p-6 rounded-lg shadow-sm border`,
   * `text-xl`, `text-gray-700`. Tailwind compiles them into the utilities
   * layer, which outranks `.prose-ikan` in base, so every heading size and
   * every card border in the markup beat the type scale.
   *
   * Dropping the attribute is better than fighting it rule by rule: the
   * document becomes plain semantic HTML and `.prose-ikan` is the only thing
   * styling it, which is the point of having a prose role at all.
   */
  const html = useMemo(
    () => (page?.html ?? '').replace(/\sclass="[^"]*"/g, ''),
    [page?.html],
  );

  useSeo({
    title: page?.title || title,
    description: page?.subtitle || subtitle,
    canonicalPath: ROUTE[slug],
    type: 'website',
  });

  return (
    <div className={['ikan2-theme', 'info-page', 'site-page-below-nav', className].filter(Boolean).join(' ')}>
      <section className="info-band">
        <div className="info-band__inner">
          <p className="info-eyebrow">Legal</p>
          <h1 className="info-title">{page?.title || title}</h1>
          {page?.subtitle || subtitle ? (
            <p className="info-subtitle">{page?.subtitle || subtitle}</p>
          ) : null}

          {/* The switcher sits BELOW the header, not above it. Above, it
              pushed the title 60px down the page, so the policies were the one
              set of pages whose heading did not line up with every other. */}
          <nav className="info-tabs" aria-label="Policies">
            {LEGAL_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                className="info-tab"
                aria-current={s === slug ? 'page' : undefined}
                onClick={() => onNavigate?.(ROUTE[s])}
              >
                {LEGAL_PAGES[s].title}
              </button>
            ))}
          </nav>

          <div
            className="prose-ikan info-prose"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
          />
        </div>
      </section>
    </div>
  );
}
