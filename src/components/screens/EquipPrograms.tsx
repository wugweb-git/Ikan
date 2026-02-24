import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { PageHero } from '../ui/PageHero';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { DUMMY_EQUIP_PROGRAM } from '../../lib/demo-data';
import { SkeletonCard } from '../ui/skeleton-loader';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000';

export function EquipPrograms({ className, onNavigate }: { className?: string, onNavigate?: (route: string) => void }) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    let isMounted = true;
    loadPrograms(isMounted);
    return () => { isMounted = false; };
  }, []);

  const loadPrograms = async (isMounted: boolean = true) => {
    try {
      let data = [];
      try {
        data = await apiClient.getEquipPrograms();
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.warn('API load failed, using local fallback only');
      }
      
      // Ensure Demo Program is ALWAYS present
      const hasDemo = data.some((p: any) => p.id === DUMMY_EQUIP_PROGRAM.id);
      if (!hasDemo) {
        data.unshift(DUMMY_EQUIP_PROGRAM);
      }
      
      if (isMounted) setPrograms(data);
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      console.error(error);
      showToast('error', 'Connection Issue', 'Using offline mode. Some data may not be current.');
      if (isMounted) setPrograms([DUMMY_EQUIP_PROGRAM]);
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
    <div
      className={`w-full ${className || ''}`}
      style={{ fontFamily: 'var(--font-family-base)' }}
    >
      <PageHero 
        title="Equip Programs" 
        subtitle="Structured programs to equip you with mental health tools." 
      />

      <div
        style={{
          maxWidth: 'var(--banner-content-max, 1100px)',
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
                  border: '1px solid var(--color-border-light)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', height: '190px', backgroundColor: 'var(--color-bg-muted)' }}>
                  <ImageWithFallback
                    src={program.cover_image || program.thumbnail || FALLBACK_IMAGE}
                    alt={program.title || program.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {program.category && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '999px',
                        padding: '4px 12px',
                      }}
                    >
                      {program.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      margin: '0',
                      lineHeight: '1.3',
                    }}
                  >
                    {program.title || program.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-regular)',
                      color: 'var(--color-text-muted)',
                      margin: '0',
                    }}
                  >
                    {program.duration_days} Days • {(!program.price || program.price === 0) ? 'Free' : 'Premium'}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-regular)',
                      color: 'var(--color-text-muted)',
                      lineHeight: '1.6',
                      margin: '0',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    {program.description || `Explore our ${program.title} program designed to help with ${program.category}.`}
                  </p>
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--color-border-light)',
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProgram(program.id);
                    }}
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-primary-on)',
                      backgroundColor: 'var(--color-primary-default)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    View Program
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}