import { ArrowRight, ArrowUpRight, Check, Clock3 } from 'lucide-react';
import { ContentImage } from '../ui/ContentImage';
import { Reveal } from '../ui/Reveal';
import { NewsletterBlock } from '../ui/blocks/NewsletterBlock';
import { NEWSLETTER_CONTENT } from '../content/content';
import { APP_ORIGIN } from '../content/app-origin';
import { useSeo } from '../ui/hooks/useSeo';

import assessmentsData from '../content/data/assessments.json';
import programsData from '../content/data/equip-programs.json';
import consultantsData from '../content/data/consultants.json';

/**
 * SERVICES
 *
 * A port of iKAN 2's own `/services` — `ikan2/src/routes/services.tsx` plus the
 * `.services-*` block at the end of `ikan2/src/styles.css`. The page already
 * existed there; the `svc-*` system this replaces was a second answer to a
 * question that had one, and the two would have drifted from the first edit.
 *
 * Structure, class names, section order, numbering and copy are iKAN 2's. The
 * differences are these, and they are all forced by this being the marketing
 * host rather than the app:
 *
 *   LINKS GO TO THE APP. iKAN 2 routes internally with `<Link to="/program">`
 *   because it IS the app. Here every call to action is an absolute jump to
 *   `app.ikanhealth.in`, since nothing on this page is usable without an
 *   account and the account lives there.
 *
 *   NO HEADER OR FOOTER. iKAN 2's page ships its own `PublicHeader` and
 *   `Footer` because it is otherwise a logged-in shell. This site already has
 *   both, and a second set would be two navigations on one page.
 *
 *   THE NEWSLETTER IS THE SHARED BLOCK, not iKAN 2's services-only one, so a
 *   visitor meets one newsletter across this site rather than three.
 *
 *   GENERIC LABELS. The previews describe what a thing IS, not which one it is.
 *   A programme name or assessment title here is a promise about a catalogue
 *   that changes without this page knowing, and the reader is still deciding
 *   whether any of it is for them. The supporting copy is recycled from this
 *   site's own `/assessment` and `/equip` pages, which is where that wording
 *   was already approved.
 *
 * Counts come from the frozen catalogue snapshots at build time, so the figures
 * on the page cannot drift from the product.
 */

const ASSESSMENT_COUNT = assessmentsData.rows.length;
const PROGRAMME_COUNT = programsData.rows.length;
const PROGRAMME_COVER = programsData.rows[0]?.cover_image;
const CONSULTANT_PHOTO = consultantsData.rows[0]?.photo;

/** The mood scale as the app defines it, five points, lowest first. */
const MOOD_SCALE = [
  { label: 'Awful', emoji: '\u{1F62B}' },
  { label: 'Bad', emoji: '\u{1F615}' },
  { label: 'Meh', emoji: '\u{1F610}' },
  { label: 'Good', emoji: '\u{1F642}' },
  { label: 'Great', emoji: '\u{1F604}' },
];

/** The subject shelves the library is filed under. */
const CATEGORIES = ['Sleep', 'Stress', 'Anxiety', 'Burnout', 'Work-Life', 'Wellness'];

interface ServicesProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

/** iKAN 2's `Eyebrow`. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="services-eyebrow">{children}</p>;
}

/**
 * The section marker — "01 / ASSESSMENT".
 *
 * iKAN 2 renders these with the same `.services-eyebrow` as the page header,
 * which on this site put them in the identical teal as the header's "Services"
 * and made each section look like it was re-announcing the page. They are a
 * different kind of thing: the header names the page, these count position
 * within it. So the numeral keeps the brand teal and the display face, the
 * label drops to muted, and a hairline separates them.
 */
function Marker({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="services-mark">
      <b>{n}</b>
      <i aria-hidden="true" />
      {children}
    </p>
  );
}

export function Services({ className }: ServicesProps) {
  useSeo({
    title: 'Services',
    description:
      'Explore iKan assessments, guided programmes, a private mood journal, useful resources and upcoming consultations.',
    canonicalPath: '/service',
    type: 'website',
  });

  /*
   * `assign`, not a new tab: this is the same product, so following a call to
   * action should feel like going further in rather than opening something
   * else. The routes are the app's own, which is why they do not match this
   * site's `/assessment` and `/equip`.
   */
  const toApp = (path: string) => () => {
    window.location.assign(`${APP_ORIGIN}${path}`);
  };

  /** iKAN 2's `Action`, as a button because it leaves the single-page app. */
  const Action = ({
    to,
    children,
    light = false,
  }: {
    to: string;
    children: React.ReactNode;
    light?: boolean;
  }) => (
    <button
      type="button"
      onClick={toApp(to)}
      className={['services-action', light ? 'is-light' : ''].filter(Boolean).join(' ')}
    >
      {children}
      <ArrowUpRight aria-hidden="true" />
    </button>
  );

  return (
    <div
      className={['ikan2-theme', 'services-page', 'site-page-below-nav', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="services-hero-band">
        <div className="services-hero services-container">
        <Eyebrow>Services</Eyebrow>
        <h1>
          Five ways to work out
          <br className="services-desktop-break" /> where you are, and <em>what helps.</em>
        </h1>
        <p>
          Start with a question. Carry on with a habit.
            <br className="services-desktop-break" /> Talk to someone when you want to.
          </p>
        </div>
      </div>

      {/* The five sections are one grid so they come out the same height; see
          `.services-sections` in globals.css for why a min-height was not it. */}
      <div className="services-sections">
      {/* 01 — Assessment */}
      <section className="services-assessment services-section" aria-labelledby="assessment-title">
        <div className="services-container services-split">
          <Reveal className="services-copy">
            <Marker n="01">Assessment</Marker>
            <h2 id="assessment-title">Assessment</h2>
            <h3>Most people know something is off before they can name it.</h3>
            <p>
              Quick, evidence-based screenings to help you understand your mental well-being. A few
              short questions, answered privately, and a result that explains what it measured
              rather than handing you a number to interpret alone.
            </p>
            <div className="services-fact">
              <strong>{String(ASSESSMENT_COUNT).padStart(2, '0')}</strong>
              <span>screenings to help you find a starting point</span>
            </div>
            <Action to="/assessments">Take an assessment</Action>
          </Reveal>

          <Reveal className="services-visual" delay={100}>
            <div className="services-phone-scene" aria-hidden="true">
              <div className="services-phone">
                <div className="services-phone-notch" />
                <div className="services-phone-top">
                  <span>Assessment</span>
                  <span>•••</span>
                </div>
                <div className="services-phone-body">
                  <p className="services-phone-kicker">PRIVATE CHECK-IN</p>
                  <h3>How well have you been sleeping?</h3>
                  <p className="services-phone-intro">
                    A closer look at your nights, and how they carry into your days.
                  </p>
                  <div className="services-phone-meta">
                    <span>8 questions</span>
                    <span>
                      <Clock3 className="h-3 w-3" /> 10 min
                    </span>
                  </div>
                  <div className="services-phone-progress">
                    <span>YOUR PROGRESS</span>
                    <strong>5 of 8 answered</strong>
                    <div className="services-track">
                      <span />
                    </div>
                  </div>
                  <div className="services-phone-result">
                    <span>YOUR RESULT</span>
                    <strong>A clearer picture of your sleep.</strong>
                    <p>What this measured, and what it does not</p>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <span className="services-phone-privacy">Your answers stay yours.</span>
                </div>
                <div className="services-phone-home" />
              </div>
              <div className="services-phone-note">
                <span className="services-note-dot" /> Not a diagnosis. A place to begin.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 02 — Equip */}
      <section className="services-equip services-section" aria-labelledby="equip-title">
        <div className="services-container services-split">
          <Reveal className="services-visual">
            <div className="services-equip-preview" aria-hidden="true">
              <div className="services-programme-card">
                <ContentImage src={PROGRAMME_COVER} alt="" />
                <span className="services-programme-overlay">
                  <span className="services-programme-tag">PROGRAMME</span>
                  <strong>Small steps, one day at a time.</strong>
                  <span>
                    21 days · guided activities <ArrowUpRight className="h-5 w-5" />
                  </span>
                </span>
              </div>
              <div className="services-day-strip">
                <span className="services-day-number">
                  04 <small>/ 21</small>
                </span>
                <div>
                  <strong>A day at a time</strong>
                  <span>
                    Read <i /> Practise <i /> Reflect
                  </span>
                </div>
                <span className="services-day-check">
                  <Check className="h-5 w-5" />
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal className="services-copy" delay={100}>
            <Marker n="02">Daily practice</Marker>
            <div className="services-heading-row">
              <h2 id="equip-title">Equip</h2>
              <span className="services-badge">BETA</span>
            </div>
            <h3>Knowing is not the same as changing.</h3>
            <p>
              Evidence-based programmes designed to support your mental health journey, built on CBT
              practice and run a day at a time. Short enough to keep up with on a bad week,
              structured enough to add up over a good month.
            </p>
            <div className="services-fact">
              <strong>{String(PROGRAMME_COUNT).padStart(2, '0')}</strong>
              <span>guided programmes available now</span>
            </div>
            <Action to="/program">See the programmes</Action>
          </Reveal>
        </div>
      </section>

      {/* 03 — Mood journal */}
      <section className="services-mood services-section" aria-labelledby="mood-title">
        <div className="services-container services-split">
          <Reveal className="services-copy">
            <Marker n="03">Everyday reflection</Marker>
            <h2 id="mood-title">Mood Journal</h2>
            <h3>
              One result is a snapshot. A few weeks of notes is the thing a single score can never
              show you.
            </h3>
            <p>
              Five taps is enough. Write as much or as little as you want on top of it. Nobody reads
              it but you.
            </p>
            <Action to="/journal">Open the journal</Action>
          </Reveal>

          <Reveal className="services-visual" delay={100}>
            <div className="services-mood-preview" aria-hidden="true">
              <div className="services-mood-scale">
                <div className="services-ui-top">
                  <span>YOUR DAILY CHECK-IN</span>
                  <span>01 / 05</span>
                </div>
                <h3>How are you feeling?</h3>
                <p>There is no right answer.</p>
                <div className="services-mood-options">
                  {MOOD_SCALE.map((point, i) => (
                    <span
                      key={point.label}
                      className={
                        i === 3 ? 'services-mood-option is-selected' : 'services-mood-option'
                      }
                    >
                      <span>{point.emoji}</span>
                      <small>{point.label}</small>
                    </span>
                  ))}
                </div>
              </div>

              <div className="services-entry-preview">
                <div className="services-ui-top">
                  <span>YOUR JOURNAL</span>
                  <span>TUESDAY</span>
                </div>
                <article>
                  <span className="services-entry-face">{MOOD_SCALE[3].emoji}</span>
                  <strong>Good</strong>
                </article>
                <div className="services-journal-detail">
                  <span>
                    Sleep <b>Good</b>
                  </span>
                  <span>
                    Stress <b>Chill</b>
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 04 — Resources */}
      <section className="services-resources services-section" aria-labelledby="resources-title">
        <div className="services-container services-split">
          <Reveal className="services-copy">
            <Marker n="04">The library</Marker>
            <h2 id="resources-title">Resources</h2>
            <h3>Good information can be its own kind of relief.</h3>
            <p>
              Articles, audio and video that help you understand what you are experiencing, and what
              you might try next.
            </p>
            <div className="services-categories" aria-label="Library topics">
              {CATEGORIES.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <Action to="/resources">Read the library</Action>
          </Reveal>

          <Reveal className="services-resource-grid services-visual" delay={100}>
            {RESOURCE_SHOWCASE.map((r, i) => (
              <div
                key={r.title}
                className={`services-resource-card ${i === 0 ? 'is-prominent' : ''}`}
                aria-hidden="true"
              >
                <div className="services-resource-image">
                  <ContentImage src={r.image} alt="" />
                  <span>{r.medium}</span>
                </div>
                <div className="services-resource-copy">
                  <p>
                    {r.category} <span>·</span> {r.length}
                  </p>
                  <h3>{r.title}</h3>
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 05 — Consultation */}
      <section className="services-consultation services-section" aria-labelledby="consult-title">
        <div className="services-container services-split">
          <Reveal className="services-copy">
            <Marker n="05">Human support</Marker>
            <div className="services-heading-row">
              <h2 id="consult-title">Consultation</h2>
              <span className="services-badge">COMING SOON</span>
            </div>
            <h3>Self-guided tools take you a long way. Not all the way.</h3>
            <p>
              Therapists, psychiatrists and counsellors, with your choice of language and session
              mode.
            </p>
            <Action to="/consult" light>
              See what is coming
            </Action>
          </Reveal>

          <Reveal className="services-visual" delay={100}>
            <div className="services-consultant-card" aria-hidden="true">
              <div className="services-consultant-photo">
                <ContentImage src={CONSULTANT_PHOTO} alt="" />
                <span>MEET THE PEOPLE BEHIND THE CARE</span>
              </div>
              <div className="services-consultant-details">
                <div>
                  <p>Counselling psychologist · M.Phil, RCI registered</p>
                  <h3>Licensed professionals</h3>
                </div>
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div className="services-consultant-facts">
                <span>12 years experience</span>
                <span>English · Hindi</span>
                <span>Video · In person</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      </div>

      <NewsletterBlock
        title={NEWSLETTER_CONTENT.HOME.title}
        benefits={[...NEWSLETTER_CONTENT.HOME.benefits]}
        imageAlt={NEWSLETTER_CONTENT.HOME.imageAlt}
        ctaText={NEWSLETTER_CONTENT.HOME.ctaText}
      />
    </div>
  );
}

/**
 * Three shelves of the library, described by kind rather than by title.
 *
 * iKAN 2 picks three real `resources` rows here. This site's resource snapshot
 * is not the app's, so rather than show a stale title the cards describe what
 * each medium is for — which is the thing someone deciding whether to click
 * actually wants to know.
 */
const RESOURCE_SHOWCASE = [
  {
    category: 'Sleep',
    medium: 'Read',
    length: '6 min read',
    title: 'What a screening score can, and cannot, tell you',
    image:
      'https://images.unsplash.com/photo-1758272422634-e8ed8e252a14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  },
  {
    category: 'Stress',
    medium: 'Watch',
    length: '8 min',
    title: 'Why the body reacts before the mind catches up',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
  {
    category: 'Wellness',
    medium: 'Listen',
    length: '12 min',
    title: 'A short practice for the end of a long day',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
];
