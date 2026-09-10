import { useEffect, useState } from 'react';
import { equipMeta } from '../../lib/equip-meta';
import { apiClient } from '../../lib/api-client';
import { equipUrl } from '../../lib/slug';
import { PageHero } from '../ui/PageHero';
import { ContentImage } from '../ui/ContentImage';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { SkeletonCard } from '../ui/skeleton-loader';
import { EquipProgramCard } from '../page-blocks/EquipProgramCard';

interface EquipProgramsProps {
  onNavigate?: (path: string) => void;
}

export function EquipPrograms({ onNavigate }: EquipProgramsProps) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const { showToast } = useNotifications();

  useEffect(() => {
    let isMounted = true;
    loadPrograms(isMounted);
    return () => { isMounted = false; };
  }, []);

  const loadPrograms = async (isMounted: boolean = true) => {
    try {
      let data: any[] = [];
      try {
        data = await apiClient.getEquipPrograms();
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.warn('API load failed, no programs available');
      }

      // CRITICAL: Only show published programs to users
      // Server also filters, but this is a client-side safety net
      const published = data.filter((p: any) => p.published === true);
      if (isMounted) setPrograms(published);
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      console.error(error);
      showToast('error', 'Connection Issue', 'Could not load programs. Please try again later.');
      if (isMounted) setPrograms([]);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const handleViewProgram = async (program: any) => {
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
        {loading ? (
          /* Skeleton loading state */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '24px',
            }}
          >
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : programs.length === 0 ? (
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
              const thumbnail = program.thumbnail || program.hero_image || '';
              const title = program.title || program.name || 'Untitled Program';
              const description = program.description || program.short_description || '';
              // `total_days` and `duration` are null on all four live
              // programmes, so this rendered no badge at all — the listing has
              // never shown a duration. Resolved from the content instead.
              const equipDays = equipMeta(program).days;
              const duration = equipDays !== null ? `${equipDays} days` : '';

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