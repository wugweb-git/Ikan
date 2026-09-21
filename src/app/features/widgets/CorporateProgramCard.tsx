import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Mail, Phone, User, Calendar, Gift, Baby, ExternalLink } from 'lucide-react';
import { apiClient } from '../../../shared/api-client';
import { useAuth } from '../../../shared/contexts/AuthContext';

interface CorporateProgramData {
  enrolled: boolean;
  employer_id?: string;
  program?: {
    employer_name?: string;
    employer_logo_url?: string;
    program_name?: string;
    program_description?: string;
    key_benefits_summary?: string;
    welcome_message?: string;
    internal_contact_name?: string;
    internal_contact_email?: string;
    internal_contact_phone?: string;
    last_updated?: string;
  };
  resources?: Array<{
    company_item_id: string;
    item_type: string;
    title: string;
    description: string;
    content_url?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    status?: string;
  }>;
  daycare?: Array<{
    provider_id: string;
    name: string;
    description?: string;
    address?: string;
    employer_specific_notes?: string;
  }>;
}

interface CorporateProgramCardProps {
  onNavigate?: (route: string) => void;
}

// ─── Font helper ──────────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

export function CorporateProgramCard({ onNavigate }: CorporateProgramCardProps) {
  const { user } = useAuth();
  const [data, setData] = useState<CorporateProgramData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const CACHE_KEY = `corporate_program_${user.user_id}`;
    // Try cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.enrolled) { setData(parsed); setLoading(false); }
      }
    } catch { /* ignore */ }

    // Fetch fresh
    apiClient.request('/corporate/my-program', { method: 'GET' }, true)
      .then((res: CorporateProgramData) => {
        setData(res);
        localStorage.setItem(CACHE_KEY, JSON.stringify(res));
      })
      .catch((err: Error) => {
        console.log('Corporate program fetch failed (non-critical):', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Don't render if not enrolled or loading
  if (loading || !data?.enrolled) return null;

  const { program, resources, daycare } = data;
  const hasContact = program?.internal_contact_name || program?.internal_contact_email || program?.internal_contact_phone;
  const upcomingEvents = (resources || []).filter(r => r.item_type === 'event' && r.start_date && new Date(r.start_date) >= new Date());
  const activeResources = (resources || []).filter(r => r.item_type !== 'event');

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-default)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header: Employer + Program Name ── */}
      <div style={{ padding: '20px 20px 0 20px' }}>
        <div className="flex items-start" style={{ gap: 14 }}>
          {/* Employer Logo or Icon */}
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {program?.employer_logo_url ? (
              <img
                src={program.employer_logo_url}
                alt={program.employer_name || 'Employer'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Building2 size={22} color="var(--color-text-inverse)" />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <h3 style={{ ...f('base', 500), margin: 0, lineHeight: 1.3 }}>
                {program?.employer_name || 'Your Organization'}
              </h3>
              <span style={{
                fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-family-base)',
                color: 'var(--color-status-info)', backgroundColor: 'var(--color-status-info-light)',
                padding: '2px 8px', borderRadius: 'var(--radius-pill)',
              }}>
                Corporate
              </span>
            </div>
            {program?.program_name && (
              <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0', lineHeight: 1.4 }}>
                {program.program_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Welcome Message ── */}
      {program?.welcome_message && (
        <div style={{ padding: '12px 20px 0 20px' }}>
          <p style={{
            ...f('sm', 400, 'var(--color-text-primary)'),
            margin: 0, lineHeight: 1.6,
            padding: '12px 16px',
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--color-primary-default)',
          }}>
            {program.welcome_message}
          </p>
        </div>
      )}

      {/* ── Key Benefits ── */}
      {program?.key_benefits_summary && (
        <div style={{ padding: '14px 20px 0 20px' }}>
          <span style={{
            ...f('xs', 500, 'var(--color-text-muted)'),
            textTransform: 'uppercase' as const,
            letterSpacing: '0.04em',
            display: 'block',
            marginBottom: 8,
          }}>
            Your Benefits
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
            {program.key_benefits_summary.split(',').map((benefit, i) => (
              <span
                key={i}
                style={{
                  ...f('xs', 400, 'var(--color-text-primary)'),
                  backgroundColor: 'var(--color-bg-muted)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Gift size={12} style={{ color: 'var(--color-status-success)', flexShrink: 0 }} />
                {benefit.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Info Row: Contact + Resources + Daycare ── */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column' as const, gap: 1 }}>
        {/* Internal Contact */}
        {hasContact && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 8,
            }}
          >
            <span style={{
              ...f('xs', 500, 'var(--color-text-muted)'),
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: 8,
            }}>
              Wellness Contact
            </span>
            <div className="flex items-center" style={{ gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: 'var(--color-accent-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User size={16} style={{ color: 'var(--color-text-primary)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {program?.internal_contact_name && (
                  <span style={{ ...f('sm', 500), display: 'block' }}>{program.internal_contact_name}</span>
                )}
                <div className="flex items-center flex-wrap" style={{ gap: 12, marginTop: 2 }}>
                  {program?.internal_contact_email && (
                    <a
                      href={`mailto:${program.internal_contact_email}`}
                      style={{ ...f('xs', 400, 'var(--color-text-muted)'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Mail size={12} /> {program.internal_contact_email}
                    </a>
                  )}
                  {program?.internal_contact_phone && (
                    <a
                      href={`tel:${program.internal_contact_phone}`}
                      style={{ ...f('xs', 400, 'var(--color-text-muted)'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Phone size={12} /> {program.internal_contact_phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <span style={{
              ...f('xs', 500, 'var(--color-text-muted)'),
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: 8,
            }}>
              Upcoming Events
            </span>
            {upcomingEvents.slice(0, 2).map((event) => (
              <div
                key={event.company_item_id}
                onClick={() => event.content_url ? window.open(event.content_url, '_blank') : null}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  cursor: event.content_url ? 'pointer' : 'default',
                  marginBottom: 6,
                  transition: 'background 0.15s',
                }}
              >
                <div className="flex items-center" style={{ gap: 10 }}>
                  <Calendar size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ ...f('sm', 500), display: 'block' }}>{event.title}</span>
                    <span style={{ ...f('xs', 400, 'var(--color-text-muted)') }}>
                      {event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      {event.location ? ` · ${event.location}` : ''}
                    </span>
                  </div>
                  {event.content_url && <ExternalLink size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Company Resources */}
        {activeResources.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <span style={{
              ...f('xs', 500, 'var(--color-text-muted)'),
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: 8,
            }}>
              Company Resources
            </span>
            {activeResources.slice(0, 3).map((res) => (
              <div
                key={res.company_item_id}
                onClick={() => res.content_url ? window.open(res.content_url, '_blank') : null}
                className="flex items-center"
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  cursor: res.content_url ? 'pointer' : 'default',
                  marginBottom: 6,
                  gap: 10,
                  transition: 'background 0.15s',
                }}
              >
                <ExternalLink size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <span style={{ ...f('sm', 400), flex: 1 }}>{res.title}</span>
                <ArrowRight size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}

        {/* Daycare Providers */}
        {(daycare || []).length > 0 && (
          <div>
            <span style={{
              ...f('xs', 500, 'var(--color-text-muted)'),
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: 8,
            }}>
              Daycare Partners
            </span>
            {(daycare || []).slice(0, 2).map((provider) => (
              <div
                key={provider.provider_id}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 6,
                }}
              >
                <div className="flex items-center" style={{ gap: 10 }}>
                  <Baby size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ ...f('sm', 500), display: 'block' }}>{provider.name}</span>
                    {provider.address && (
                      <span style={{ ...f('xs', 400, 'var(--color-text-muted)') }}>{provider.address}</span>
                    )}
                    {provider.employer_specific_notes && (
                      <span style={{
                        ...f('xs', 400, 'var(--color-status-success)'),
                        display: 'block', marginTop: 2,
                      }}>
                        {provider.employer_specific_notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer: View Full Details ── */}
      <div
        onClick={() => onNavigate?.('/account/corporate')}
        style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--color-border-default)',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        <div className="flex items-center justify-center" style={{ gap: 8 }}>
          <Building2 size={16} style={{ color: 'var(--color-text-muted)' }} />
          <span style={f('sm', 500, 'var(--color-text-muted)')}>View Organization Details</span>
          <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>
    </motion.div>
  );
}