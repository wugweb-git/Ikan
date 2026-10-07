import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Search } from 'lucide-react';
import { apiClient } from '../../../shared/api/api';
import { resolveImageUrl } from '../../../shared/api/image-url';
import {
  articleTime,
  isPublished,
  prettyCategory,
  toResourcePost,
  type PresentedResource,
  type ResourceRecord,
} from '../../../shared/content/resource-presentation';
import { ContentImage } from '../ui/ContentImage';
import { SiteLink } from '../ui/SiteLink';
import { NewsletterBlock } from '../ui/blocks/NewsletterBlock';
import { useSeo } from '../ui/hooks/useSeo';
import { NEWSLETTER_CONTENT } from '../content/content';

/**
 * The public library index, on the site surface.
 *
 * It was `app/resources/Library.tsx` until 2026-10-07 — an app screen on a
 * marketing host, with the app's dark photo hero, its own `PageHero`, a
 * pull-to-refresh gesture and a Categories/Content-Type tab pair. That page
 * predates the iKAN 2 migration, so it was the one public page whose header
 * landed nowhere near every other page's.
 *
 * This is the same data through the site's own vocabulary: `info-band` header
 * at the shared x and y, the page measure, and cards built from the tokens the
 * rest of the site uses.
 *
 * The content is live, not a build-time snapshot. Articles are authored in the
 * admin console and read back through `GET /library/resources` on the edge
 * function, which answers to the anon key — so a signed-out visitor sees the
 * same library a member does.
 */

/** Filters are built from the data, so an empty category never gets a chip. */
const ALL = 'All';

export interface ResourcesProps {
  onNavigate?: (route: string) => void;
}

type Status = 'loading' | 'ready' | 'error';

export function Resources({ onNavigate }: ResourcesProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [records, setRecords] = useState<ResourceRecord[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);

  useSeo({
    title: 'Resources',
    description:
      'Articles, videos and audio on sleep, stress, burnout and balance — free to read, written for India.',
    canonicalPath: '/resource',
    type: 'website',
  });

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const all = (await apiClient.getResources()) as ResourceRecord[];
        if (!live) return;
        setRecords((all || []).filter(isPublished).sort((a, b) => articleTime(b) - articleTime(a)));
        setStatus('ready');
      } catch {
        if (live) setStatus('error');
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const posts: PresentedResource[] = useMemo(() => records.map(toResourcePost), [records]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const p of posts) if (p.category) seen.add(p.category);
    return [ALL, ...Array.from(seen).sort()];
  }, [posts]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== ALL && p.category !== category) return false;
      if (!q) return true;
      return `${p.title} ${p.description} ${p.category ?? ''}`.toLowerCase().includes(q);
    });
  }, [posts, query, category]);

  return (
    <div className="ikan2-theme info-page site-page-below-nav">
      <section className="info-band">
        <div className="info-band__inner">
          <p className="info-eyebrow">Library</p>
          <h1 className="info-title">Resources</h1>
          <p className="info-subtitle">
            Articles on sleep, stress, burnout and balance — what the measures actually mean, and
            what to do next. Free to read, no account needed.
          </p>

          <div className="library-controls">
            <div className="library-search">
              <Search className="library-search__icon" aria-hidden="true" />
              <label className="sr-only" htmlFor="library-search">
                Search resources
              </label>
              <input
                id="library-search"
                type="search"
                placeholder="Search resources"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* One chip row, and only when the data has more than one topic —
                a filter offering a single choice is a control that cannot do
                anything. */}
            {categories.length > 2 && (
              <div className="library-filters" role="group" aria-label="Filter by topic">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="library-chip"
                    aria-pressed={c === category}
                    onClick={() => setCategory(c)}
                  >
                    {c === ALL ? c : prettyCategory(c)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {status === 'loading' && (
            /* Shaped like the grid it becomes, so the page does not jump when
               the articles land. */
            <ul className="library-grid" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="library-card library-card--skeleton">
                  <span className="library-card__media" />
                  <span className="library-card__line" />
                  <span className="library-card__line library-card__line--short" />
                </li>
              ))}
            </ul>
          )}

          {status === 'error' && (
            <p className="library-note" role="alert">
              The library could not be loaded just now. Please refresh, or{' '}
              <SiteLink to="/contact" onNavigate={onNavigate}>
                tell us
              </SiteLink>{' '}
              if it keeps happening.
            </p>
          )}

          {status === 'ready' && (
            <>
              <p className="library-note" role="status">
                {shown.length === posts.length
                  ? `${posts.length} ${posts.length === 1 ? 'resource' : 'resources'}`
                  : `${shown.length} of ${posts.length} resources`}
              </p>

              {shown.length === 0 ? (
                <p className="library-empty">
                  Nothing matches that yet. Try a different word, or clear the filters.
                </p>
              ) : (
                <ul className="library-grid">
                  {shown.map((p) => (
                    <li key={p.id}>
                      <SiteLink
                        className="library-card"
                        to={`/resource-detail?id=${encodeURIComponent(p.id)}`}
                        onNavigate={onNavigate}
                      >
                        <span className="library-card__media">
                          <ContentImage src={resolveImageUrl(p.image)} alt="" />
                          {p.category && (
                            <span className="library-card__tag">{prettyCategory(p.category)}</span>
                          )}
                        </span>
                        <strong className="library-card__title">{p.title}</strong>
                        {p.description && (
                          <span className="library-card__desc">{p.description}</span>
                        )}
                        <span className="library-card__meta">
                          <CalendarDays aria-hidden="true" />
                          {p.date}
                          {p.readTime ? ` · ${p.readTime}` : ''}
                        </span>
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>

      <NewsletterBlock
        title={NEWSLETTER_CONTENT.HOME.title}
        benefits={[...NEWSLETTER_CONTENT.HOME.benefits]}
        ctaText={NEWSLETTER_CONTENT.HOME.ctaText}
        privacyText={NEWSLETTER_CONTENT.PRIVACY_TEXT}
      />
    </div>
  );
}

export default Resources;
