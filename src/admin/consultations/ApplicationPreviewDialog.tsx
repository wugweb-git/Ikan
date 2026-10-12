import type React from 'react';
import { MapPin, CircleCheck, CircleX, ExternalLink, FileText, Mail, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import type { ApplicationDetail } from './useConsultationData';
import { PartnerApplicationDetails } from './PartnerApplicationDetails';

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-[0.05em] mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function BadgeList({ items, label = (x) => x, className = 'flex flex-wrap gap-2' }: { items: string[]; label?: (x: string) => string; className?: string }) {
  return <div className={className}>{items.map(x => <AdminStatusBadge key={x} status="neutral" label={label(x)} />)}</div>;
}

const LINK = 'flex items-center gap-2 text-sm text-[var(--color-primary-default)]';
const QUOTE_BOX = 'p-3 bg-[var(--color-bg-muted)] rounded-sm';

interface ApplicationPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: ApplicationDetail | null;
  processing: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApplicationPreviewDialog({ open, onOpenChange, application: app, processing, onApprove, onReject }: ApplicationPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {app && (
          <>
            <DialogHeader>
              <DialogTitle className="font-medium">Application: {app.name}</DialogTitle>
              <DialogDescription>Submitted {new Date(app.submitted_at).toLocaleDateString()}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5">
              {/* Photo + Basic Info */}
              <div className="flex items-start gap-4">
                {app.photo && (
                  <img src={app.photo} alt={app.name} className="w-20 h-20 rounded-[var(--radius-md)] object-cover" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{app.name}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{app.credentials}</p>
                  {(app.email || app.phone) ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                      {app.email && <a href={`mailto:${app.email}`} className="flex items-center gap-1 hover:underline"><Mail className="w-3 h-3" /> {app.email}</a>}
                      {app.phone && <a href={`tel:${app.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1 hover:underline"><Phone className="w-3 h-3" /> {app.phone}</a>}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">No contact details: submitted before the form asked for them.</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <AdminStatusBadge status="neutral" label={app.category} />
                    <AdminStatusBadge status="neutral" label={`${app.yearsExperience || 0}+ yrs experience`} />
                    {app.location && (
                      <AdminStatusBadge status="neutral">
                        <MapPin className="w-3 h-3 mr-1 inline-block" />{app.location}
                      </AdminStatusBadge>
                    )}
                  </div>
                </div>
              </div>

              <PreviewSection title="Brief Introduction">
                <p className="text-sm leading-[var(--line-height-lg)] whitespace-pre-line">{app.bio}</p>
              </PreviewSection>

              <PartnerApplicationDetails app={app} />

              {(app.languages || []).length > 0 && (
                <PreviewSection title="Languages"><BadgeList items={app.languages} /></PreviewSection>
              )}

              {(app.expertises || []).length > 0 && (
                <PreviewSection title="Issues Addressed"><BadgeList items={app.expertises} /></PreviewSection>
              )}

              {(app.therapeuticApproaches || []).length > 0 && (
                <PreviewSection title="Therapeutic Approaches"><BadgeList items={app.therapeuticApproaches} /></PreviewSection>
              )}

              {(app.qualifications || []).length > 0 && (
                <PreviewSection title="Qualifications">
                  <ul className="list-none p-0 m-0 flex flex-col gap-2">
                    {app.qualifications.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CircleCheck className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-primary-default)]" />
                        <span className="text-sm">{q}</span>
                      </li>
                    ))}
                  </ul>
                </PreviewSection>
              )}

              {(app.demographicSpecialties || []).length > 0 && (
                <PreviewSection title="Works With"><BadgeList items={app.demographicSpecialties} /></PreviewSection>
              )}

              {app.therapeuticPhilosophy && (
                <PreviewSection title="Therapeutic Philosophy">
                  <p className="text-sm italic leading-[var(--line-height-lg)]">"{app.therapeuticPhilosophy}"</p>
                </PreviewSection>
              )}

              {(app.sessionModes || []).length > 0 && (
                <PreviewSection title="Session Formats">
                  <BadgeList
                    items={app.sessionModes}
                    className="flex gap-2"
                    label={m => (m === 'online' ? 'Video Call' : m === 'call' ? 'Phone Call' : m)}
                  />
                </PreviewSection>
              )}

              {app.availabilityPreferences && (
                <PreviewSection title="Availability">
                  {app.availabilityPreferences.workingHours && (
                    <p className="text-sm mb-2">Working Hours: {app.availabilityPreferences.workingHours}</p>
                  )}
                  {(app.availabilityPreferences.daysAvailable || []).length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {app.availabilityPreferences.daysAvailable.map(d => (
                        <span key={d} className="px-2.5 py-0.5 rounded-[var(--radius-md)] bg-[var(--color-primary-default)] text-[var(--color-primary-on)] text-xs font-medium">{d.slice(0, 3)}</span>
                      ))}
                    </div>
                  )}
                  {app.availabilityPreferences.weekendAvailability && (
                    <p className="flex items-center gap-1 mt-2 text-sm text-[var(--color-status-success)]">
                      <CircleCheck className="w-3 h-3" /> Available on weekends
                    </p>
                  )}
                </PreviewSection>
              )}

              {(app.clientFAQs || []).length > 0 && (
                <PreviewSection title={`FAQs (${app.clientFAQs!.length})`}>
                  <div className="flex flex-col gap-3">
                    {app.clientFAQs!.map((faq, i) => (
                      <div key={i} className={QUOTE_BOX}>
                        <p className="text-sm font-medium mb-1">Q: {faq.question}</p>
                        {faq.answer && <p className="text-sm text-[var(--color-text-muted)]">A: {faq.answer}</p>}
                      </div>
                    ))}
                  </div>
                </PreviewSection>
              )}

              {(app.testimonials || []).length > 0 && (
                <PreviewSection title={`Testimonials (${app.testimonials!.length})`}>
                  {app.testimonials!.map((t, i) => (
                    <div key={i} className={`${QUOTE_BOX} border-l-[3px] border-[var(--color-accent-default)] mb-2`}>
                      <p className="text-sm italic">"{t.text}"</p>
                      {t.clientName && <p className="text-xs text-[var(--color-text-muted)] mt-1">— {t.clientName}</p>}
                    </div>
                  ))}
                </PreviewSection>
              )}

              {app.videoIntroUrl && (
                <PreviewSection title="Video Introduction">
                  <a href={app.videoIntroUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
                    <ExternalLink className="w-4 h-4" /> {app.videoIntroUrl}
                  </a>
                </PreviewSection>
              )}

              {(app.certificates || []).length > 0 && (
                <PreviewSection title={`Certificates (${app.certificates!.length})`}>
                  <div className="flex flex-col gap-2">
                    {app.certificates!.map((cert, i) => (
                      <a key={i} href={cert} target="_blank" rel="noopener noreferrer" className={LINK}>
                        <FileText className="w-4 h-4" /> Certificate {i + 1}
                      </a>
                    ))}
                  </div>
                </PreviewSection>
              )}

              {app.willingToShareArticles !== undefined && (
              <PreviewSection title="Content Contribution">
                <p className="text-sm">
                  {app.willingToShareArticles ? '✓ Willing to share articles on iKan' : '✗ Not interested in sharing articles'}
                </p>
              </PreviewSection>
              )}
            </div>

            {app.status === 'pending_review' && (
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => onReject(app.id)} disabled={processing}
                  className="gap-2 text-[var(--color-status-danger)] border-[var(--color-status-danger)]">
                  <CircleX className="w-4 h-4" /> Reject
                </Button>
                <Button onClick={() => onApprove(app.id)} disabled={processing}
                  className="gap-2 bg-[var(--color-status-success)] text-[var(--color-text-inverse)]">
                  <CircleCheck className="w-4 h-4" /> Approve & Publish
                </Button>
              </DialogFooter>
            )}
            {app.status === 'approved' && (
              <div className="mt-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-success-light)]">
                <p className="flex items-center gap-2 text-sm text-[var(--color-status-success)] font-medium">
                  <CircleCheck className="w-4 h-4" /> This application has been approved
                </p>
              </div>
            )}
            {app.status === 'rejected' && (
              <div className="mt-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-danger-light)]">
                <p className="flex items-center gap-2 text-sm text-[var(--color-status-danger)] font-medium">
                  <CircleX className="w-4 h-4" /> This application has been rejected
                </p>
                {app.rejection_reason && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Reason: {app.rejection_reason}</p>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
