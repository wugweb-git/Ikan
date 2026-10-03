import { ClipboardCheck, BookOpen, NotebookPen, Library, Stethoscope, ArrowRight } from 'lucide-react';

/**
 * SERVICES, on the homepage.
 *
 * Replaces two separate strips: "Assessment Programs" (`AssessmentBlock`) and
 * the Equip intro (`EquipBlock`). Between them they listed three assessments
 * and three programmes by name, which meant the landing page carried a copy of
 * two catalogues that change without it knowing, and said nothing about the
 * other three things iKAN does.
 *
 * This names the five services and sends one link to `/service`, where each is
 * shown properly. Nothing here is a catalogue entry, so nothing here goes
 * stale.
 *
 * Built on iKAN 2's tokens: `--card` over `--border` at the radius scale, the
 * brand hues for the five tiles, and the type roles for every string.
 */

const SERVICES = [
  {
    icon: ClipboardCheck,
    name: 'Assessment',
    line: 'Short, private screenings that tell you where you are.',
    hue: 'var(--brand-teal)',
    ink: 'var(--brand-teal-ink)',
  },
  {
    icon: BookOpen,
    name: 'Equip',
    line: 'Guided programmes that run a day at a time.',
    hue: 'var(--brand-amber)',
    ink: 'var(--brand-amber-ink)',
    badge: 'Beta',
  },
  {
    icon: NotebookPen,
    name: 'Mood journal',
    line: 'Five taps a day, and a record only you read.',
    hue: 'var(--brand-coral)',
    ink: 'var(--brand-coral-ink)',
  },
  {
    icon: Library,
    name: 'Resources',
    line: 'Articles, audio and video worth your time.',
    hue: 'var(--brand-slate)',
    ink: 'var(--brand-slate-ink)',
  },
  {
    icon: Stethoscope,
    name: 'Consultation',
    line: 'Licensed professionals, when you want one.',
    hue: 'var(--brand-teal)',
    ink: 'var(--brand-teal-ink)',
    badge: 'Coming soon',
  },
];

export function ServicesSection({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <section className="home-services" aria-labelledby="home-services-title">
      <div className="home-services__inner">
        <header className="home-services__head">
          <p className="home-services__eyebrow">What iKAN offers</p>
          <h2 id="home-services-title">Five ways to work out where you are.</h2>
          <p className="home-services__lede">
            Start with a question. Carry on with a habit. Talk to someone when you want to.
          </p>
        </header>

        <ul className="home-services__grid">
          {SERVICES.map((s) => (
            <li key={s.name} className="home-service">
              <span className="home-service__icon" style={{ background: s.hue, color: s.ink }}>
                <s.icon aria-hidden="true" />
              </span>
              <p className="home-service__name">
                {s.name}
                {s.badge ? <span className="home-service__badge">{s.badge}</span> : null}
              </p>
              <p className="home-service__line">{s.line}</p>
            </li>
          ))}
        </ul>

        <button type="button" className="site-cta" onClick={() => onNavigate('/service')}>
          See what we offer
          <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
