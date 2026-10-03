import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { DEFAULT_CMS_CONTENT } from '../content/cms-defaults';
import { useSeo } from '../ui/hooks/useSeo';

/**
 * FAQ, rebuilt as iKAN 2's `/faq`.
 *
 * Replaced rather than adapted: the old page was a full-bleed `PageHero` over a
 * Radix accordion inside a bordered card, 383 lines of it. This is the app's
 * layout — title, search, a row of topic pills, grouped questions, and a
 * closing card that points at Contact.
 *
 * The questions open as native `<details>`, which is what the app's Disclosure
 * component amounts to here: it is keyboard-operable and announced correctly
 * with no library behind it. As in the app, a search term forces every match
 * open, because a closed list of hits is not an answer.
 *
 * Content is `page-faq` from cms-defaults, which is byte-identical to iKAN 2's
 * `faq` block — verified field by field, 0 differences — so there is nothing to
 * reconcile here, only the rendering.
 */

interface FAQProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

type FaqItem = { question: string; answer: string };
type FaqCategory = { id: string; title: string; items: FaqItem[] };

export function FAQ({ className, onNavigate }: FAQProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const f = useMemo(() => {
    const raw = DEFAULT_CMS_CONTENT['page-faq'];
    try {
      return raw?.content ? JSON.parse(raw.content) : null;
    } catch {
      return null;
    }
  }, []);

  useSeo({
    title: f?.heroTitle || 'FAQs & Help Center',
    description: f?.heroSubtitle,
    canonicalPath: '/faq',
    type: 'website',
  });

  const categories: FaqCategory[] = f?.categories ?? [];
  const q = query.trim().toLowerCase();

  const groups = categories
    .filter((c) => category === 'all' || c.id === category)
    .map((c) => ({
      ...c,
      items: c.items.filter(
        (i) =>
          !q || i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q),
      ),
    }))
    .filter((c) => c.items.length > 0);

  return (
    <div className={['ikan2-theme', 'info-page', 'site-page-below-nav', className].filter(Boolean).join(' ')}>
      <section className="info-band">
        <div className="info-band__inner">
          <p className="info-eyebrow">Help</p>
          <h1 className="info-title">{f?.heroTitle}</h1>
          {f?.heroSubtitle ? <p className="info-subtitle">{f.heroSubtitle}</p> : null}

          <div className="faq-search">
            <Search className="faq-search__icon" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={f?.searchPlaceholder || 'Search for answers...'}
              aria-label={f?.searchPlaceholder || 'Search for answers'}
            />
          </div>

          <div className="info-tabs faq-topics" role="tablist" aria-label="Topics">
            {[{ id: 'all', title: 'All' }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={c.id === category}
                aria-current={c.id === category ? 'page' : undefined}
                className="info-tab"
                onClick={() => setCategory(c.id)}
              >
                {c.title}
              </button>
            ))}
          </div>

          {groups.length === 0 ? (
            <p className="faq-empty">{f?.noResultsText || 'No results found.'}</p>
          ) : (
            groups.map((g) => (
              <section key={g.id} className="faq-group">
                <h2 className="faq-group__title">{g.title}</h2>
                <div className="faq-list">
                  {g.items.map((i) => (
                    /* `key` includes the query so a new search re-mounts the
                       row and the `open` default is reapplied. */
                    <details key={`${i.question}-${q}`} className="faq-item" open={Boolean(q)}>
                      <summary>{i.question}</summary>
                      <p>{i.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))
          )}

          <section className="faq-cta">
            <p className="faq-cta__title">{f?.ctaTitle}</p>
            <p className="faq-cta__body">{f?.ctaDescription}</p>
            <button
              type="button"
              className="info-button"
              onClick={() => onNavigate?.(f?.ctaButtonRoute || '/contact')}
            >
              {f?.ctaButtonText || 'Contact Support'}
            </button>
          </section>
        </div>
      </section>
    </div>
  );
}
