import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { PageHero } from '../ui/PageHero';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { SkeletonCard } from '../ui/skeleton-loader';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000';

interface HeroBanner {
  title: string;
  subtitle: string;
  image_url: string;
  cta_text?: string;
  cta_link?: string;
}

interface EquipProgramsProps {
  onNavigate?: (path: string) => void;
}

export function EquipPrograms({ onNavigate }: EquipProgramsProps) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroBanner, setHeroBanner] = useState<HeroBanner | null>(null);
  const isMobile = useIsMobile();
  const { showToast } = useNotifications();

  useEffect(() => {
    let isMounted = true;
    loadPrograms(isMounted);
    loadHeroBanner(isMounted);
    return () => { isMounted = false; };
  }, []);

  const loadHeroBanner = async (isMounted: boolean = true) => {
    try {
      const res = await apiClient.getHeroBanner('equip');
      if (isMounted && res?.banner) setHeroBanner(res.banner);
    } catch (_e) { /* use defaults */ }
  };

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
        title={heroBanner?.title || 'Equip Programs'}
        subtitle={heroBanner?.subtitle || 'Evidence-based programs designed to support your mental health journey.'}
        backgroundImage={heroBanner?.image_url}
        ctaText={heroBanner?.cta_text}
        ctaLink={heroBanner?.cta_link}
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
              const thumbnail = program.thumbnail || program.hero_image || FALLBACK_IMAGE;
              const title = program.title || program.name || 'Untitled Program';
              const description = program.description || program.short_description || '';
              const duration = program.duration || program.total_days
                ? `${program.total_days || program.duration} days`
                : '';

              return (
                <div
                  key={equipId}
                  onClick={() => handleViewProgram(equipId)}
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-bg-card)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '1px solid var(--color-border-default)',
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
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <ImageWithFallback
                      src={thumbnail}
                      alt={title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {duration && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 10,
                          right: 10,
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          fontFamily: 'var(--font-family-base)',
                          fontWeight: 500,
                          fontSize: 'var(--text-xs)',
                        }}
                      >
                        {duration}
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding: 16 }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-family-base)',
                        fontWeight: 500,
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-primary)',
                        margin: '0 0 6px',
                        lineHeight: 1.3,
                      }}
                    >
                      {title}
                    </h3>
                    {description && (
                      <p
                        style={{
                          fontFamily: 'var(--font-family-base)',
                          fontWeight: 400,
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-muted)',
                          margin: 0,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {description}
                      </p>
                    )}
                    {program.category && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: 10,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--color-accent-default)',
                          fontFamily: 'var(--font-family-base)',
                          fontWeight: 500,
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {program.category}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}