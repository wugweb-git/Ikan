import { ArrowRight } from 'lucide-react';
import { SiteLink } from '../SiteLink';
import { Container } from '../Container';
import { EquipProgramCard } from './EquipProgramCard';
import { equipUrl, programDuration, type SiteProgram } from '../../content/catalog';

/** A strip of programme cards with a "View all" link — homepage and programme pages. */
export interface EquipBlockProps {
  title?: string;
  footerText?: string;
  /** Small caps label on each card. */
  programLabel?: string;
  /** Drawn action on each card. */
  buttonText?: string;
  programs: SiteProgram[];
  onNavigate?: (route: string) => void;
}

export function EquipBlock({
  title = 'Equip Programs',
  footerText = 'Supported by leading healthcare providers',
  programLabel = 'PROGRAM',
  buttonText = 'LEARN MORE',
  programs,
  onNavigate,
}: EquipBlockProps) {
  // A blank CMS field arrives as "", which a default does not catch.
  const cta = buttonText?.trim() || 'LEARN MORE';

  if (programs.length === 0) return null;

  return (
    <section style={{ backgroundColor: 'var(--canvas)', paddingTop: '64px', paddingBottom: '64px' }}>
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          {title ? (
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: '500',
                color: 'var(--foreground)',
                lineHeight: '1.3',
                margin: 0,
              }}
            >
              {title}
            </h2>
          ) : <span />}
          <SiteLink
            to="/equip"
            onNavigate={onNavigate}
            className="no-underline"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--muted-foreground)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            View all
            <ArrowRight style={{ width: '14px', height: '14px' }} aria-hidden="true" />
          </SiteLink>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {programs.map((p) => (
            <EquipProgramCard
              key={p.equip_id || p.id}
              program={p}
              href={equipUrl(p)}
              onNavigate={onNavigate}
              durationLabel={programDuration(p)}
              eyebrow={programLabel}
              cta={cta}
            />
          ))}
        </div>

        {footerText && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: '400',
              color: 'var(--muted-foreground)',
              textAlign: 'center',
              margin: '32px 0 0 0',
            }}
          >
            {footerText}
          </p>
        )}
      </Container>
    </section>
  );
}
