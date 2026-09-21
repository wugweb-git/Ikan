import { PageHero } from '../ui/PageHero';
import { useIsMobile } from '../../../shared/hooks/useIsMobile';
import { EquipProgramCard } from '../ui/blocks/EquipProgramCard';
import { getPrograms, type SiteProgram } from '../lib/catalog';

/**
 * The public Equip listing — static.
 *
 * The logged-out view of src/product/app/screens/EquipPrograms.tsx, rendered
 * from the build-time snapshot (published programmes only). A card opens this
 * site's own programme landing page.
 */

interface EquipProgramsProps {
  onNavigate?: (path: string) => void;
}

/** Same rule as the app's `equipUrl`. */
const equipUrl = (p: SiteProgram) => (p.slug ? `/equip/${p.slug}` : `/equip-detail?id=${p.equip_id ?? p.id ?? ''}`);

export function EquipPrograms({ onNavigate }: EquipProgramsProps) {
  const programs = getPrograms();
  const isMobile = useIsMobile();

  const handleViewProgram = (program: SiteProgram) => {
    if (onNavigate) {
      onNavigate(equipUrl(program));
    }
  };

  return (
    <div>
      <PageHero
        title="Equip Programs"
        subtitle="Evidence-based programs designed to support your mental health journey."
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '24px 16px' : '40px 24px',
        }}
      >
        {programs.length === 0 ? (
          /* Empty state */
          <div
            style={{
              textAlign: 'center',
              padding: isMobile ? '48px 24px' : '80px 24px',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧘</div>
            <h2
              style={{
                fontFamily: 'var(--font-family-base)',
                fontWeight: 500,
                fontSize: 'var(--text-xl)',
                color: 'var(--color-text-primary)',
                margin: '0 0 8px',
              }}
            >
              Programs Coming Soon
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-family-base)',
                fontWeight: 400,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                maxWidth: 400,
                margin: '0 auto',
              }}
            >
              We're preparing evidence-based programs to support your mental health journey. Check back soon.
            </p>
          </div>
        ) : (
          /* Program cards grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {programs.map((program) => {
              const equipId = program.equip_id || program.id;
              // Day count comes from the programme's content, counted at snapshot time.
              const duration = program.dayCount !== null ? `${program.dayCount} days` : '';

              return (
                <EquipProgramCard
                  key={equipId}
                  program={program}
                  durationLabel={duration}
                  onClick={() => handleViewProgram(program)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EquipPrograms;
