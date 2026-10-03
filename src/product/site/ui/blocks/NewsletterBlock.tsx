import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { cn } from '../utils';
import { apiClient } from '../../../../shared/api/api';

/**
 * NEWSLETTER BLOCK
 *
 * A port of iKAN 2's `.services-newsletter` — the block at the foot of
 * `ikan2/src/routes/services.tsx`, styled by the rules of the same name in
 * `ikan2/src/styles.css`. Class names are kept so the two can be diffed.
 *
 * It replaces a dark rounded card whose problems were all structural:
 *
 *   The form sat in a `1fr` grid column but the input had no `min-width: 0`,
 *   so it collapsed to its intrinsic size and clipped the placeholder to
 *   "your@email.c" while the column around it stayed empty.
 *   iKAN 2 puts the input and the button in ONE pill with `width: 100%;
 *   min-width: 0` on the input and `flex: none` on the button, which is why
 *   its field fills the space it is given.
 *
 *   The two columns were vertically centred against a fixed card height, so a
 *   three-line heading left a large dead band under the form. iKAN 2 aligns
 *   the two columns to `end`, so the form always sits on the baseline of the
 *   copy beside it however many lines the heading runs to.
 *
 *   The heading had no `max-width`, so it broke wherever the column happened
 *   to end ("Stay Informed / About Mental / Health"). iKAN 2 caps it at 600px.
 *
 *   The dark ground was this site's invention. iKAN 2's is `--calm-soft`,
 *   which is why the section reads as part of the page rather than a banner
 *   dropped onto it.
 *
 * Carried over from the version this replaces: it keeps `ikan2-theme` on its
 * own root, because three of its four callers — the homepage, Assessment
 * detail and Equip detail — are not themed pages, and a visitor should meet
 * one newsletter across this site rather than a styled one on `/service` and
 * an unstyled one everywhere else.
 *
 * The submit path is unchanged: `apiClient.subscribeNewsletter` against this
 * repo's backend. iKAN 2 has no mailing-list service and opens a `mailto:`
 * instead; this site does have one, so it posts.
 */

interface NewsletterBlockProps {
  title?: string;
  benefits?: string[];
  /** Accepted and unused: the block has had no image since the redesign. */
  imageAlt?: string;
  ctaText?: string;
  privacyText?: string;
  onSubscribe?: (email: string) => void;
  className?: string;
}

export function NewsletterBlock({
  title,
  benefits,
  ctaText,
  privacyText,
  onSubscribe,
  className,
}: NewsletterBlockProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiClient.subscribeNewsletter(email.trim());
      if (response.success) {
        setSubmitted(true);
        onSubscribe?.(email);
      } else {
        setError(response.error || 'Subscription failed.');
      }
    } catch (err) {
      console.error('Newsletter signup error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* The lead line carries the section; the rest become the fine print under
     the form, which is where iKAN 2 puts its one qualifying sentence. */
  const [lead, ...rest] = benefits ?? [];

  return (
    <section
      className={cn('ikan2-theme', 'services-newsletter', className)}
      aria-labelledby="newsletter-heading"
    >
      <div className="services-container services-newsletter-inner">
        <div>
          <p className="services-eyebrow">STAY IN TOUCH</p>
          <h2 id="newsletter-heading">{title || 'A little help, when it is useful.'}</h2>
          <p>
            {lead ||
              'Thoughtful notes on feeling better, sent only when we have something worth sharing.'}
          </p>
        </div>

        <div>
          {submitted ? (
            <p className="services-newsletter-done" role="status">
              <Check aria-hidden="true" />
              Thank you for subscribing.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="services-action" disabled={isSubmitting}>
                {isSubmitting ? 'Subscribing…' : ctaText || 'Request updates'}
                <ArrowUpRight aria-hidden="true" />
              </button>
            </form>
          )}

          {error && (
            <p className="services-newsletter-fine" role="alert">
              {error}
            </p>
          )}

          {/* `privacyText` is authored as `PRIVACY_TEXT` and was, before this
              rewrite, rendered nowhere — on a form that collects an email. The
              remaining benefits share this slot rather than becoming a list of
              rules-and-dashes, which is what they looked like before. */}
          {(privacyText || rest.length > 0) && (
            <p className="services-newsletter-fine">{privacyText || rest.join(' · ')}</p>
          )}
        </div>
      </div>
    </section>
  );
}
