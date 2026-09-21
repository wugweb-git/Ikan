import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Icon } from '../../../components/Icon';
import { apiClient } from '../../../shared/api-client';
import { useAuth } from '../../../contexts/AuthContext';
import { Building2, Mail, Phone, User, Calendar, Gift, Baby, ExternalLink, Globe, Briefcase, BadgeCheck } from 'lucide-react';

// ─── Font helper ──────────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

interface CorporateProgram {
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
}

interface CompanyResource {
  company_item_id: string;
  item_type: string;
  title: string;
  description: string;
  content_url?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  contact_info?: string;
  status?: string;
}

interface DaycareProvider {
  provider_id: string;
  name: string;
  description?: string;
  address?: string;
  contact_information?: string;
  hours_of_operation?: string;
  age_ranges_served?: string;
  special_programs?: string;
  pricing_summary?: string;
  employer_specific_notes?: string;
  availability_status_summary?: string;
}

export function Corporate() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [program, setProgram] = useState<CorporateProgram | null>(null);
  const [resources, setResources] = useState<CompanyResource[]>([]);
  const [daycare, setDaycare] = useState<DaycareProvider[]>([]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    apiClient.request('/corporate/my-program', { method: 'GET' }, true)
      .then((res: any) => {
        setEnrolled(res.enrolled || false);
        setProgram(res.program || null);
        setResources(res.resources || []);
        setDaycare(res.daycare || []);
      })
      .catch((err: Error) => {
        console.log('Corporate program fetch failed:', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="gap-0 shadow-none" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-center" style={{ padding: '48px 24px' }}>
            <div className="animate-pulse flex items-center" style={{ gap: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--color-bg-muted)' }} />
              <span style={f('sm', 400, 'var(--color-text-muted)')}>Loading organization details...</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Empty state (not enrolled) ──────────────────────────────────
  if (!enrolled || !program) {
    return (
      <div className="space-y-6">
        <Card className="gap-0 shadow-none" style={{ borderRadius: '16px' }}>
          <div className="flex items-center" style={{ padding: '20px 24px 16px 24px', gap: '8px' }}>
            <Icon name="briefcase" size={20} style={{ color: 'var(--color-text-primary)' }} />
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: '22px',
                margin: 0
              }}
            >
              Organization Details
            </h2>
          </div>
          <CardContent className="p-0" style={{ padding: '0 24px 24px 24px' }}>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-bg-muted)', marginBottom: '16px' }}
              >
                <Icon name="building" size={32} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)',
                  margin: '0 0 8px 0'
                }}
              >
                No Organization Connected
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-regular)',
                  maxWidth: '400px',
                  lineHeight: '20px',
                  margin: 0
                }}
              >
                You are not currently linked to any corporate organization. Please contact your administrator for an invite code.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Enrolled state ──────────────────────────────────────────────
  const hasContact = program.internal_contact_name || program.internal_contact_email || program.internal_contact_phone;
  const events = resources.filter(r => r.item_type === 'event');
  const nonEvents = resources.filter(r => r.item_type !== 'event');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* ── Your Company Details ── */}
      <Card className="gap-0 shadow-none" style={{ borderRadius: '16px' }}>
        <div className="flex items-center" style={{ padding: '20px 24px 16px 24px', gap: '8px' }}>
          <BadgeCheck size={20} style={{ color: 'var(--color-text-primary)' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)', lineHeight: '22px', margin: 0 }}>
            Your Company Profile
          </h2>
        </div>
        <CardContent className="p-0" style={{ padding: '0 24px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InfoRow icon={<Building2 size={16} />} label="Company Name" value={program.employer_name} />
            <InfoRow icon={<Briefcase size={16} />} label="Designation" value={(user as any)?.corporate_designation} />
            <InfoRow icon={<Mail size={16} />} label="Company Email" value={(user as any)?.corporate_email || (user as any)?.email} />
            <InfoRow icon={<Phone size={16} />} label="Company Phone" value={(user as any)?.corporate_phone} />
            <InfoRow icon={<Globe size={16} />} label="Department" value={(user as any)?.corporate_department} />
            <InfoRow icon={<User size={16} />} label="Employee ID" value={(user as any)?.corporate_employee_id} />
          </div>
        </CardContent>
      </Card>

      {/* ── Organization Info ── */}
      <Card className="gap-0 shadow-none" style={{ borderRadius: '16px' }}>
        <div className="flex items-center" style={{ padding: '20px 24px 16px 24px', gap: '8px' }}>
          <Icon name="briefcase" size={20} style={{ color: 'var(--color-text-primary)' }} />
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
              lineHeight: '22px',
              margin: 0,
              flex: 1,
            }}
          >
            Organization Details
          </h2>
          <span style={{
            fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-family-base)',
            color: 'var(--color-status-success)', backgroundColor: 'var(--color-status-success-light)',
            padding: '3px 10px', borderRadius: 'var(--radius-pill)',
          }}>
            Active
          </span>
        </div>
        <CardContent className="p-0" style={{ padding: '0 24px 24px 24px' }}>
          {/* Employer Header */}
          <div className="flex items-center" style={{ gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {program.employer_logo_url ? (
                <img
                  src={program.employer_logo_url}
                  alt={program.employer_name || 'Employer'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Building2 size={26} color="var(--color-text-inverse)" />
              )}
            </div>
            <div>
              <h3 style={{ ...f('lg', 500), margin: 0 }}>{program.employer_name || 'Your Organization'}</h3>
              {program.program_name && (
                <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: '2px 0 0' }}>{program.program_name}</p>
              )}
            </div>
          </div>

          {/* Program Description */}
          {program.program_description && (
            <p style={{ ...f('sm', 400), margin: '0 0 16px', lineHeight: 1.6 }}>
              {program.program_description}
            </p>
          )}

          {/* Welcome Message */}
          {program.welcome_message && (
            <div style={{
              padding: '14px 18px',
              backgroundColor: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-primary-default)',
              marginBottom: 16,
            }}>
              <p style={{ ...f('sm', 400), margin: 0, lineHeight: 1.6, fontStyle: 'italic' as const }}>
                &ldquo;{program.welcome_message}&rdquo;
              </p>
            </div>
          )}

          {/* Key Benefits */}
          {program.key_benefits_summary && (
            <div style={{ marginBottom: 16 }}>
              <span style={{
                ...f('xs', 500, 'var(--color-text-muted)'),
                textTransform: 'uppercase' as const,
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: 10,
              }}>
                Your Benefits
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {program.key_benefits_summary.split(',').map((benefit, i) => (
                  <div key={i} className="flex items-center" style={{ gap: 10 }}>
                    <Gift size={16} style={{ color: 'var(--color-status-success)', flexShrink: 0 }} />
                    <span style={f('sm', 400)}>{benefit.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last updated */}
          {program.last_updated && (
            <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '16px 0 0' }}>
              Last updated: {new Date(program.last_updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Wellness Contact ── */}
      {hasContact && (
        <Card className="gap-0 shadow-none" style={{ borderRadius: '16px' }}>
          <div className="flex items-center" style={{ padding: '20px 24px 16px 24px', gap: '8px' }}>
            <User size={20} style={{ color: 'var(--color-text-primary)' }} />
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: '22px',
                margin: 0,
              }}
            >
              Wellness Contact
            </h2>
          </div>
          <CardContent className="p-0" style={{ padding: '0 24px 24px 24px' }}>
            <div className="flex items-center" style={{ gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                backgroundColor: 'var(--color-accent-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User size={20} style={{ color: 'var(--color-text-primary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                {program.internal_contact_name && (
                  <span style={{ ...f('base', 500), display: 'block' }}>{program.internal_contact_name}</span>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {program.internal_contact_email && (
                    <a
                      href={`mailto:${program.internal_contact_email}`}
                      style={{ ...f('sm', 400, 'var(--color-text-muted)'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Mail size={14} /> {program.internal_contact_email}
                    </a>
                  )}
                  {program.internal_contact_phone && (
                    <a
                      href={`tel:${program.internal_contact_phone}`}
                      style={{ ...f('sm', 400, 'var(--color-text-muted)'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Phone size={14} /> {program.internal_contact_phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Company Resources ── */}
      {nonEvents.length > 0 && (
        <Card className="gap-0 shadow-none" style={{ borderRadius: '16px' }}>
          <div className="flex items-center" style={{ padding: '20px 24px 16px 24px', gap: '8px' }}>
            <Globe size={20} style={{ color: 'var(--color-text-primary)' }} />
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: '22px',
                margin: 0,
              }}
            >
              Company Resources
            </h2>
          </div>
          <CardContent className="p-0" style={{ padding: '0 24px 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {nonEvents.map((res) => (
                <div
                  key={res.company_item_id}
                  onClick={() => res.content_url ? window.open(res.content_url, '_blank') : null}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--color-bg-muted)',
                    borderRadius: 'var(--radius-md)',
                    cursor: res.content_url ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                >
                  <div className="flex items-start" style={{ gap: 12 }}>
                    <ExternalLink size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ ...f('sm', 500), display: 'block' }}>{res.title}</span>
                      {res.description && (
                        <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '4px 0 0', lineHeight: 1.5 }}>
                          {res.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Events ── */}
      {events.length > 0 && (
        <Card className="gap-0 shadow-none" style={{ borderRadius: '16px' }}>
          <div className="flex items-center" style={{ padding: '20px 24px 16px 24px', gap: '8px' }}>
            <Calendar size={20} style={{ color: 'var(--color-text-primary)' }} />
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: '22px',
                margin: 0,
              }}
            >
              Company Events
            </h2>
          </div>
          <CardContent className="p-0" style={{ padding: '0 24px 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events.map((event) => (
                <div
                  key={event.company_item_id}
                  onClick={() => event.content_url ? window.open(event.content_url, '_blank') : null}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--color-bg-muted)',
                    borderRadius: 'var(--radius-md)',
                    cursor: event.content_url ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                >
                  <div className="flex items-start" style={{ gap: 12 }}>
                    <Calendar size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ ...f('sm', 500), display: 'block' }}>{event.title}</span>
                      <div className="flex items-center flex-wrap" style={{ gap: 8, marginTop: 4 }}>
                        {event.start_date && (
                          <span style={f('xs', 400, 'var(--color-text-muted)')}>
                            {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        {event.location && (
                          <span style={f('xs', 400, 'var(--color-text-muted)')}>· {event.location}</span>
                        )}
                      </div>
                      {event.description && (
                        <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '4px 0 0', lineHeight: 1.5 }}>
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Daycare Partners ── */}
      {daycare.length > 0 && (
        <Card className="gap-0 shadow-none" style={{ borderRadius: '16px' }}>
          <div className="flex items-center" style={{ padding: '20px 24px 16px 24px', gap: '8px' }}>
            <Baby size={20} style={{ color: 'var(--color-text-primary)' }} />
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: '22px',
                margin: 0,
              }}
            >
              Daycare Partners
            </h2>
          </div>
          <CardContent className="p-0" style={{ padding: '0 24px 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {daycare.map((provider) => (
                <div
                  key={provider.provider_id}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--color-bg-muted)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div className="flex items-start" style={{ gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-accent-default)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Baby size={18} style={{ color: 'var(--color-text-primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ ...f('base', 500), display: 'block' }}>{provider.name}</span>
                      {provider.description && (
                        <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: '4px 0 0', lineHeight: 1.5 }}>
                          {provider.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                        {provider.address && (
                          <span style={{ ...f('xs', 400, 'var(--color-text-muted)'), display: 'flex', alignItems: 'center', gap: 6 }}>
                            📍 {provider.address}
                          </span>
                        )}
                        {provider.hours_of_operation && (
                          <span style={f('xs', 400, 'var(--color-text-muted)')}>
                            🕐 {provider.hours_of_operation}
                          </span>
                        )}
                        {provider.age_ranges_served && (
                          <span style={f('xs', 400, 'var(--color-text-muted)')}>
                            Ages: {provider.age_ranges_served}
                          </span>
                        )}
                        {provider.pricing_summary && (
                          <span style={f('xs', 400, 'var(--color-text-muted)')}>
                            Pricing: {provider.pricing_summary}
                          </span>
                        )}
                      </div>
                      {provider.employer_specific_notes && (
                        <div style={{
                          marginTop: 8, padding: '8px 12px',
                          backgroundColor: 'var(--color-status-success-light)',
                          borderRadius: 'var(--radius-sm)',
                        }}>
                          <span style={f('xs', 500, 'var(--color-status-success)')}>
                            {provider.employer_specific_notes}
                          </span>
                        </div>
                      )}
                      {provider.contact_information && (
                        <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '8px 0 0' }}>
                          Contact: {provider.contact_information}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Helper component for InfoRow ────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) {
  return (
    <div className="flex items-center" style={{ gap: 12 }}>
      {icon}
      <div style={{ flex: 1 }}>
        <span style={{ ...f('xs', 500, 'var(--color-text-muted)'), display: 'block' }}>{label}</span>
        {value && (
          <span style={{ ...f('sm', 400), display: 'block' }}>{value}</span>
        )}
      </div>
    </div>
  );
}