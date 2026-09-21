import { PageHero } from '../ui/PageHero';
import { Container, PageShell } from '../ui/Container';
import { EquipProgramCard } from '../ui/blocks/EquipProgramCard';
import { equipUrl, getPrograms, programDuration } from '../content/catalog';

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

export function EquipPrograms({ onNavigate }: EquipProgramsProps) {
  const programs = getPrograms();

  return (
    <PageShell>
      <PageHero
        title="Equip Programs"
        subtitle="Evidence-based programs designed to support your mental health journey."
      />

      <Container className="py-6 md:py-10">
        {programs.length === 0 ? (
          <div className="text-center py-12 md:py-20">
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
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
            {programs.map((program) => (
              <EquipProgramCard
                key={program.equip_id || program.id}
                program={program}
                href={equipUrl(program)}
                onNavigate={onNavigate}
                durationLabel={programDuration(program)}
              />
            ))}
          </div>
        )}
      </Container>
    </PageShell>
  );
}

export default EquipPrograms;
