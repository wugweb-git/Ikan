import React, { useEffect, useRef } from 'react';
import {
  Heart,
  Shield,
  FlaskConical,
  Handshake,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ContentImage } from '../ui/ContentImage';
import { useSeo } from '../ui/hooks/useSeo';
import { ABOUT_PAGE as a, marked, unmark } from '../content/about';

/**
 * ABOUT — the app's page, given a website's widths.
 *
 * The design is app.ikanhealth.in/about: soft cards, stacked sections, the
 * dark Mission card against the teal Vision one, a connected run of steps. The
 * app is Capacitor, so that page has ONE layout, a ~420px phone column, and no
 * breakpoints at all. A website cannot ship that — it reads as a ribbon of text
 * stranded in an empty viewport.
 *
 * So the rhythm is the app's and the grid is this page's own. Every rule lives
 * in `globals.css` under ABOUT PAGE, because breakpoints cannot be expressed in
 * the inline styles this file used to carry:
 *
 *   mobile   < 768    one column
 *   tablet   >= 768   760px sheet, Mission beside Vision, Who-is-it-for 2-up
 *   desktop  >= 1024  1080px sheet, story beside its picture, values 4-up
 *
 * The page sits inside the site's nav and footer, and `site-page-below-nav`
 * clears the fixed band — this page opens on a heading rather than a bleed
 * hero, so without it the h1 renders underneath the navigation.
 *
 * Content comes from `../content/about`, which is also what feeds
 * `scripts/sync-about.mjs` for iKAN 2. Do not retype any of this copy here.
 */

interface AboutUsProps {
  onNavigate?: (route: string) => void;
  className?: string;
}

const VALUE_ICON: Record<string, LucideIcon> = {
  heart: Heart,
  shield: Shield,
  'flask-conical': FlaskConical,
  handshake: Handshake,
};

/**
 * The step photographs, carried over from the homepage's `HowItWorksSection`,
 * which this page used to render. iKAN 2's steps are icon-only because a phone
 * column has no room beside the text; a website does, so the pictures stay.
 *
 * They live here rather than in `../content/about` on purpose: like
 * `VALUE_ICON`, they are this surface's presentation, not shared content, and
 * putting them in the content object would make `sync-about.mjs --check`
 * report drift against iKAN 2 for fields iKAN 2 has no use for.
 *
 * Shown from 768px up — see `.about-step-photo` in globals.css.
 */
/** Who-is-it-for photographs, from the homepage's `BenefitsSection`. Same
 *  reasoning as STEP_PHOTO: presentation, not shared content. */
const WHO_PHOTO: { src: string; alt: string }[] = [
  {
    src: 'https://images.unsplash.com/photo-1726377240070-19b747fc9f19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=640',
    alt: 'Person journaling for self care',
  },
  {
    src: 'https://images.unsplash.com/photo-1758691737182-d42aefd6dee8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=640',
    alt: 'Workplace wellness team meeting',
  },
  {
    src: 'https://images.unsplash.com/photo-1758691463610-3c2ecf5fb3fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=640',
    alt: 'Healthcare professional smiling',
  },
];

const STEP_PHOTO: { src: string; alt: string }[] = [
  {
    src: 'https://images.unsplash.com/photo-1650046825506-8901c4b837b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=640',
    alt: 'Mental health assessment on tablet',
  },
  {
    src: 'https://images.unsplash.com/photo-1758273241078-8eec353836be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=640',
    alt: 'Therapy counseling session',
  },
  {
    src: 'https://images.unsplash.com/photo-1758272422634-e8ed8e252a14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=640',
    alt: 'Mindfulness and daily wellness',
  },
];

function StoryText() {
  return (
    <div>
      <p className="about-eyebrow">{a.story.label}</p>
      <h2 className="about-story-heading">
        {marked(a.story.heading).map((run, i) =>
          run.mark ? (
            <span key={i} style={{ color: a.story.headingHighlightColor }}>
              {run.text}
            </span>
          ) : (
            <React.Fragment key={i}>{run.text}</React.Fragment>
          ),
        )}
      </h2>
      <div className="about-prose">
        {a.story.paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{unmark(p)}</p>
        ))}
      </div>
    </div>
  );
}

function StoryArt() {
  return (
    <div className="about-art">
      <ContentImage src={a.story.image} alt={a.story.imageAlt} />
    </div>
  );
}


/**
 * Reveal each band as it comes into view. IntersectionObserver rather than a
 * scroll listener so nothing runs on the main thread between intersections,
 * and `is-in` is only ever added — a band that has appeared stays visible if
 * the reader scrolls back up.
 *
 * If the observer is unavailable the class is applied immediately, so the page
 * can never be left invisible by a missing API.
 */
function useReveal() {
  const root = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const targets = Array.from(host.querySelectorAll<HTMLElement>('.about-reveal'));
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return root;
}

/**
 * SIX PEOPLE, ONE LIST.
 *
 * The founders and the engineers were two arrays rendered as two tiers. They
 * are one team of six, and "six people built this" is a stronger, more specific
 * claim than an org chart — so the structure stops ranking them. Three of the
 * six carry a bio; the other three do not, and the layout has to be fine with
 * that rather than hiding it.
 */
type Person = { name: string; role: string; image: string; bio?: string };
const PEOPLE: Person[] = [...a.founders, ...a.team];

export function AboutUs({ onNavigate, className }: AboutUsProps) {
  /* The document title was the site-wide "iKan Health" on every route, so a
     shared or bookmarked /about carried no page name and no description. */
  useSeo({
    title: 'About iKan',
    description: a.hero.subtitle,
    canonicalPath: '/about',
    image: a.story.image,
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About iKan',
      description: a.hero.subtitle,
      url: 'https://ikanhealth.in/about',
      isPartOf: { '@type': 'WebSite', name: 'iKan Health', url: 'https://ikanhealth.in' },
    },
  });

  const root = useReveal();

  return (
    <div
      ref={root}
      className={['ikan2-theme', 'about-page', 'site-page-below-nav', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Hero ── */}
      <section className="about-band about-band--canvas">
        <div className="about-band__inner">
          <p className="about-eyebrow">About Us</p>
          <h1 className="about-title">{a.hero.title}</h1>
          <p className="about-subtitle">{a.hero.subtitle}</p>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="about-band about-band--white about-reveal">
        <div className="about-band__inner">
          <div className="about-story-split">
            <StoryText />
            <div className="about-art-desktop">
              <StoryArt />
            </div>
          </div>
          <div className="about-art-mobile">
            <StoryArt />
          </div>
        </div>
      </section>

      {/* ── Mission / Vision ── */}
      <section className="about-band about-band--canvas about-reveal">
        <div className="about-band__inner">
          <div className="about-mv">
            {[a.mission, a.vision].map((m, i) => (
              <div
                key={m.label}
                className={`about-mv-card about-lift ${
                  i === 0 ? 'about-mv-card--dark' : 'about-mv-card--calm'
                }`}
              >
                <p className="about-mv-label">{m.label}</p>
                <p className="about-mv-title">{m.title}</p>
                <p className="about-mv-body">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why you'll love iKan ── */}
      <section className="about-band about-band--white about-reveal">
        <div className="about-band__inner">
          <h2 className="about-h2">{a.valuesHeading}</h2>
          <div className="about-values">
            {a.values.map((v) => {
              const Icon = VALUE_ICON[v.iconName] ?? Heart;
              return (
                <div key={v.title} className="about-value about-lift">
                  <span className="about-value-icon" style={{ color: v.color }}>
                    <Icon style={{ width: 22, height: 22 }} aria-hidden="true" />
                  </span>
                  <h3 className="about-value-title type-title-lg">{v.title}</h3>
                  <p className="about-value-body">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      {/* The one inverted band: this is the reader's journey, not iKan's story. */}
      <section className="about-band about-band--invert about-reveal">
        <div className="about-band__inner">
          <h2 className="about-h2">{a.howItWorks.heading}</h2>
          <ol className="about-steps">
            {a.howItWorks.steps.map((s, i) => (
              <li key={s.title} className="about-step">
                <span className="about-step-marker" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {STEP_PHOTO[i] ? (
                  <span className="about-step-photo">
                    <ContentImage src={STEP_PHOTO[i].src} alt={STEP_PHOTO[i].alt} />
                  </span>
                ) : null}
                <h3 className="about-step-title type-title-lg">{s.title}</h3>
                <span className="about-step-tagline">{s.tagline}</span>
                <span className="about-step-body">{s.description}</span>
              </li>
            ))}
          </ol>
          <button type="button" className="about-cta" onClick={() => onNavigate?.('/assessment')}>
            Get started
          </button>
        </div>
      </section>

      {/* ── Who is it for ── */}
      <section className="about-band about-band--white about-reveal">
        <div className="about-band__inner">
          <h2 className="about-h2">{a.whoFor.heading}</h2>
          <div className="about-who">
            {a.whoFor.groups.map((g, i) => (
              <div key={g.title} className="about-who-card about-lift">
                {WHO_PHOTO[i] ? (
                  <span className="about-who-photo">
                    <ContentImage src={WHO_PHOTO[i].src} alt={WHO_PHOTO[i].alt} />
                  </span>
                ) : null}
                <h3 className="about-who-title type-title-lg">{g.title}</h3>
                <p className="about-who-tagline">{g.tagline}</p>
                <p className="about-who-body">{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Team ── */}
      <section className="about-band about-band--canvas about-reveal">
        <div className="about-band__inner">
          <h2 className="about-h2">{a.teamHeading}</h2>
          <p className="about-team-intro">{a.teamDescription}</p>

          <ul className="about-team">
            {PEOPLE.map((m) => (
              <li key={m.name} className="about-person">
                <span className="about-person-portrait">
                  <ContentImage src={m.image} alt={m.name} />
                </span>
                <h3 className="about-person-name type-title-lg">{m.name}</h3>
                <p className="about-person-role">{m.role}</p>
                {m.bio ? <p className="about-person-bio">{m.bio}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
