import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { PageHero } from '../ui/PageHero';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { SkeletonCard } from '../ui/skeleton-loader';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000';

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

      if (isMounted) setPrograms(data);
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      console.error(error);
      showToast('error', 'Connection Issue', 'Could not load programs. Please try again later.');
      if (isMounted) setPrograms([]);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const handleViewProgram = async (equipId: string) => {
    if (onNavigate) {
      onNavigate(`/equip-detail?id=${equipId}`);
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
              padding: isMobile ? '48px 24px' : '64px 24px',
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-light)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-lg)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              margin: '0 0 8px',
            }}>
              0 current programs
            </p>
            <p style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-sm)',
              fontWeight: 400,
              color: 'var(--color-text-muted)',
              margin: 0,
            }}>
              New programs will appear here when available.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : programs.length < 3 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '24px',
            }}
          >
            {programs.map((program) => (
              <div
                key={program.id}
                onClick={() => handleViewProgram(program.id)}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                  <ImageWithFallback
                    src={program.image_url || program.cover_image || FALLBACK_IMAGE}
                    alt={program.title || 'Equip Program'}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    margin: '0 0 8px',
                    lineHeight: 'var(--line-height-sm)',
                  }}>
                    {program.title || program.name || 'Untitled Program'}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 400,
                    color: 'var(--color-text-muted)',
                    margin: 0,
                    lineHeight: 'var(--line-height-sm)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {program.description || program.subtitle || 'Discover this program'}
                  </p>
                  {program.duration_days && (
                    <p style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 400,
                      color: 'var(--color-text-muted)',
                      margin: '8px 0 0',
                    }}>
                      {program.duration_days} days
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}