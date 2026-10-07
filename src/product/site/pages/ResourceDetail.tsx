import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { apiClient } from '../../../shared/api/api';
import { resolveImageUrl } from '../../../shared/api/image-url';
import {
  articleTime,
  isPublished,
  resourceImage,
  prettyCategory,
  toResourcePost,
  type PresentedResource,
  type ResourceRecord,
} from '../../../shared/content/resource-presentation';
import { ContentImage } from '../ui/ContentImage';
import { SiteLink } from '../ui/SiteLink';
import { NewsletterBlock } from '../ui/blocks/NewsletterBlock';
import { useSeo } from '../ui/hooks/useSeo';
import { cleanAuthoredHtml } from '../ui/lib/authored-html';
import { NEWSLETTER_CONTENT } from '../content/content';
import { NotFound } from './NotFound';

/**
 * One library article, on the site surface.
 *
 * The app's version of this screen is ~1000 lines, and most of it is not about
 * reading an article: an offline cache, a reading-progress bar, engagement
 * analytics, `mark-read` writes, a retry/backoff ladder and a block parser that
 * splits the stored HTML into typed chunks. All of it is member machinery —
 * three of those calls need a signed-in user and simply fail for the visitor
 * this page is for.
 *
 * So this is the article, and the article only: header on the shared page
 * measure, hero, body, a rail of related reading, newsletter. What a logged-out
 * reader loses is a progress bar; what they gain is a page that matches the
 * rest of the site and does not fire four authenticated requests they cannot
 * satisfy.
 *
 * The body is authored in Google Docs and pasted into the admin editor, which
 * is why it goes through `cleanAuthoredHtml` — see that module for what the
 * export carries and why inline styles have to come off before `.prose-ikan`
 * can do anything at all.
 */

export interface ResourceDetailProps {
  resourceId?: string;
  onNavigate?: (route: string) => void;
}

type Status = 'loading' | 'ready' | 'missing';

export function ResourceDetail({ resourceId, onNavigate }: ResourceDetailProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [record, setRecord] = useState<ResourceRecord | null>(null);
  const [related, setRelated] = useState<PresentedResource[]>([]);

  useEffect(() => {
    if (!resourceId) {
      setStatus('missing');
      return;
    }
    let live = true;
    setStatus('loading');
    (async () => {
      try {
        const r = (await apiClient.getResource(resourceId)) as ResourceRecord | null;
        if (!live) return;
        if (!r || !isPublished(r)) {
          setStatus('missing');
          return;
        }
        setRecord(r);
        setStatus('ready');

        /* Related is not stored on the record, so it is derived: same topic,
           published, not this one, newest first. A failure here leaves the
           rail empty and the article intact — it is not worth an error state. */
        try {
          const all = (await apiClient.getResources()) as ResourceRecord[];
          if (!live) return;
          setRelated(
            (all || [])
              .filter((x) => isPublished(x) && x.id !== r.id && x.category === r.category)
              .sort((a, b) => articleTime(b) - articleTime(a))
              .slice(0, 4)
              .map(toResourcePost),
          );
        } catch {
          /* no rail */
        }
      } catch {
        if (live) setStatus('missing');
      }
    })();
    return () => {
      live = false;
    };
  }, [resourceId]);

  const post = useMemo(() => (record ? toResourcePost(record) : null), [record]);
  const body = useMemo(() => cleanAuthoredHtml(record?.content), [record]);
  const hero = resolveImageUrl(record ? resourceImage(record) : '');

  useSeo({
    enabled: status === 'ready' && !!post,
    title: post?.title,
    description: post?.description,
    image: hero,
    canonicalPath: resourceId ? `/resource-detail?id=${resourceId}` : undefined,
    type: 'article',
    jsonLd:
      status === 'ready' && post
        ? {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.description,
            image: hero,
            author: { '@type': 'Person', name: record?.author || 'iKAN' },
            datePublished: record?.published_at || record?.created_at,
            publisher: {
              '@type': 'Organization',
              name: 'iKAN Health',
              url: 'https://ikanhealth.in',
            },
          }
        : null,
  });

  if (status === 'missing') return <NotFound onNavigate={onNavigate} />;

  return (
    <div className="ikan2-theme info-page site-page-below-nav">
      <section className="info-band">
        <div className="info-band__inner">
          <SiteLink className="article-back" to="/resource" onNavigate={onNavigate}>
            <ArrowLeft aria-hidden="true" />
            All resources
          </SiteLink>

          {status === 'loading' || !post ? (
            <div className="article-skeleton" aria-live="polite" aria-busy="true">
              <span className="library-card__line library-card__line--short" />
              <span className="library-card__line" />
              <span className="library-card__media" />
            </div>
          ) : (
            <>
              {post.category && <p className="info-eyebrow">{prettyCategory(post.category)}</p>}
              <h1 className="info-title">{post.title}</h1>
              {post.description && <p className="info-subtitle">{post.description}</p>}

              {/* The date carries a calendar, the way every other meta row on
                  this site and in iKAN 2 does. */}
              <p className="article-meta">
                {record?.author && <span className="article-meta__author">{record.author}</span>}
                <span className="article-meta__date">
                  <CalendarDays aria-hidden="true" />
                  {post.date}
                </span>
                {post.readTime && <span>{post.readTime}</span>}
              </p>

              {hero && (
                <figure className="article-hero">
                  <ContentImage src={hero} alt="" />
                </figure>
              )}

              {body ? (
                <div
                  className="prose-ikan article-body"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              ) : (
                <p className="library-note">This article has no content yet.</p>
              )}
            </>
          )}

          {related.length > 0 && (
            <section className="article-related" aria-labelledby="related-heading">
              <h2 id="related-heading" className="article-related__title">
                More in {prettyCategory(post?.category) || 'the library'}
              </h2>
              <ul className="library-grid library-grid--compact">
                {related.map((p) => (
                  <li key={p.id}>
                    <SiteLink
                      className="library-card"
                      to={`/resource-detail?id=${encodeURIComponent(p.id)}`}
                      onNavigate={onNavigate}
                    >
                      <span className="library-card__media">
                        <ContentImage src={resolveImageUrl(p.image)} alt="" />
                      </span>
                      <strong className="library-card__title">{p.title}</strong>
                      <span className="library-card__meta">
                        <CalendarDays aria-hidden="true" />
                        {p.date}
                        {p.readTime ? ` · ${p.readTime}` : ''}
                      </span>
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </section>
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

export default ResourceDetail;
