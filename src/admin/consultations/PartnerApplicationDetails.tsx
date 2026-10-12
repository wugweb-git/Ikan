import type React from 'react';
import { useState } from 'react';
import { ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../shared/api/api';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import type { ApplicationDetail, UploadedFileRef } from './useConsultationData';

/*
 * The partner application's answers in the admin preview — everything the
 * Notion v3 form collects beyond the directory's own fields. Verification is
 * shown first and marked as private: it lives on the tracker record, never on
 * the profile that approval publishes.
 */

const LINK = 'flex items-center gap-2 text-sm text-[var(--color-primary-default)] hover:underline text-left';
const MUTED = 'text-sm text-[var(--color-text-muted)]';

const COMM_POLES: Record<string, [string, string]> = {
  warmDirect: ['Warm', 'Direct'],
  structuredFlexible: ['Structured', 'Flexible'],
  reflectiveAction: ['Reflective', 'Action-oriented'],
  supportiveChallenging: ['Supportive', 'Challenging'],
  listenerInteractive: ['Listener', 'Interactive'],
};

const PROFILE_LABELS: Record<string, string> = {
  whyClientsEnjoy: 'Why clients enjoy working with me',
  idealClient: 'My ideal client',
  uniqueApproach: 'What makes my approach unique',
  firstSession: 'What happens in the first session?',
  clientExpectations: 'What do I expect from clients?',
  faqs: 'FAQs',
  testimonials: 'Testimonials',
};

const DAY_PARTS: [string, string][] = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening'], ['night', 'Night']];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-[0.05em] mb-2">{title}</h4>
      {children}
    </div>
  );
}

function Badges({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return <div className="flex flex-wrap gap-2">{items.map((x) => <AdminStatusBadge key={x} status="neutral" label={x} />)}</div>;
}

function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  const shown = rows.filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0));
  if (!shown.length) return null;
  return (
    <dl className="grid grid-cols-[minmax(0,12rem)_1fr] gap-x-4 gap-y-2 text-sm m-0">
      {shown.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-[var(--color-text-muted)]">{k}</dt>
          <dd className="m-0">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const yesNo = (v?: boolean | null) => (v === true ? 'Yes' : v === false ? 'No' : undefined);
const money = (v?: number | null) => (typeof v === 'number' ? `₹${v.toLocaleString('en-IN')}` : undefined);

/** The stored link expires after 24h, so open a freshly signed one. */
function StoredFile({ file, label }: { file: UploadedFileRef; label: string }) {
  const [busy, setBusy] = useState(false);
  const open = async () => {
    setBusy(true);
    try {
      const { url } = await apiClient.refreshUploadUrl(file.path);
      window.open(url || file.url, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(file.url, '_blank', 'noopener,noreferrer');
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" className={LINK} onClick={open} disabled={busy}>
      <FileText className="w-4 h-4 shrink-0" /> {busy ? 'Opening…' : label}
    </button>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  if (!rows.length) return null;
  return (
    <table className="w-full text-sm border-collapse">
      <thead><tr>{head.map((h) => <th key={h} className="text-left font-medium text-[var(--color-text-muted)] pb-1 pr-3">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-[var(--color-border-light)]">{r.map((c, j) => <td key={j} className="py-1.5 pr-3 align-top">{c}</td>)}</tr>)}</tbody>
    </table>
  );
}

export function PartnerApplicationDetails({ app }: { app: ApplicationDetail }) {
  const v = app.verification;
  const d = app.details;
  if (!v && !d) return null;

  return (
    <>
      {v ? (
        <div className="flex flex-col gap-4 p-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)]">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" /> Verification <span className={MUTED}>(private, never published)</span>
          </p>
          <Facts rows={[
            ['Highest qualification', v.highestQualification],
            ['Registration', v.registration],
            ['Registration number', v.registrationNumber],
            ["Master's in Psychology / Counselling", yesNo(v.hasMastersDegree)],
            ['Supervised clinical hours', v.supervisedHours ?? undefined],
            ['Currently under supervision', yesNo(v.underSupervision)],
          ]} />
          <Table head={['Degree', 'Institution', 'Year']} rows={(v.degrees || []).map((r) => [r.degree, r.institution, r.year])} />
          <Table head={['Certification', 'Issuer', 'Year']} rows={(v.certifications || []).map((r) => [r.certification, r.issuer, r.year])} />
          {v.documents?.length ? (
            <div className="flex flex-col gap-2">
              {v.documents.map((doc) => <StoredFile key={doc.path} file={doc} label={`${doc.kind ? `${doc.kind}: ` : ''}${doc.name}`} />)}
            </div>
          ) : <p className={MUTED}>No documents uploaded.</p>}
        </div>
      ) : null}

      {d ? (
        <>
          <Section title="Practice">
            <Facts rows={[
              ['Professional title', d.professionalTitle],
              ['Settings', d.practiceSettings?.join(', ')],
              ['Clients treated', d.clientsTreated],
              ['Session length', d.sessionDurationMinutes ? `${d.sessionDurationMinutes} min` : undefined],
              ['Weekend consultations', yesNo(d.weekendConsultations)],
              ['Emergency consultations', yesNo(d.emergencyConsultations)],
            ]} />
          </Section>

          {d.expertiseMatrix?.length ? (
            <Section title="Clinical expertise">
              <Table head={['Area', 'Level']} rows={d.expertiseMatrix.map((r) => [r.area, r.level])} />
            </Section>
          ) : null}

          {d.conditionsNotTreated?.length || d.outsideScope ? (
            <Section title="Does not treat">
              <Badges items={d.conditionsNotTreated} />
              {d.outsideScope ? <p className="text-sm mt-2 whitespace-pre-line">{d.outsideScope}</p> : null}
            </Section>
          ) : null}

          <Section title="Client preferences">
            <Facts rows={[
              ['Age groups', d.ageGroups?.join(', ')],
              ['Client types', d.clientTypes?.join(', ')],
              ['Therapy format', d.therapyFormats?.join(', ')],
              ['Case complexity', d.caseComplexity],
            ]} />
          </Section>

          <Section title="Therapy style">
            <Facts rows={[
              ['Homework', d.homeworkFrequency],
              ['Homework types', d.homeworkTypes?.join(', ')],
              ...Object.entries(d.communicationStyle || {}).map(([k, n]): [string, React.ReactNode] => {
                const [l, r] = COMM_POLES[k] || [k, ''];
                return [`${l} ↔ ${r}`, `${n} / 5`];
              }),
            ]} />
          </Section>

          {d.culturalExperience?.length ? <Section title="Experience working with"><Badges items={d.culturalExperience} /></Section> : null}

          <Section title="Availability & fees">
            <Table head={['Day', ...DAY_PARTS.map(([, l]) => l)]}
              rows={Object.entries(d.availability || {}).map(([day, parts]) => [day, ...DAY_PARTS.map(([k]) => (parts.includes(k) ? '✓' : ''))])} />
            <div className="mt-2">
              <Facts rows={[
                ['Individual', money(app.pricing?.individual)],
                ['Couple', money(app.pricing?.couple)],
                ['Family', money(app.pricing?.family)],
                ['Sliding scale', yesNo(d.slidingScale)],
              ]} />
            </div>
          </Section>

          {d.contributions?.length ? (
            <Section title="Contributions">
              <div className="flex flex-col gap-2">
                {d.contributions.map((c, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium">{c.type}</span> · {c.title}{c.year ? ` (${c.year})` : ''}
                    {c.link ? <a href={c.link} target="_blank" rel="noopener noreferrer" className={`${LINK} mt-0.5`}><ExternalLink className="w-3 h-3" /> {c.link}</a> : null}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {d.workspacePhotos?.length || d.mapsLink ? (
            <Section title="Workspace">
              <div className="flex flex-col gap-2">
                {(d.workspacePhotos || []).map((p, i) => <StoredFile key={p.path} file={p} label={`Workspace photo ${i + 1}`} />)}
                {d.mapsLink ? <a href={d.mapsLink} target="_blank" rel="noopener noreferrer" className={LINK}><ExternalLink className="w-4 h-4" /> Google Maps</a> : null}
              </div>
            </Section>
          ) : null}

          {Object.entries(d.profileAnswers || {}).filter(([k, text]) => k !== 'bio' && text).map(([k, text]) => (
            <Section key={k} title={PROFILE_LABELS[k] || k}>
              <p className="text-sm leading-[var(--line-height-lg)] whitespace-pre-line">{text}</p>
            </Section>
          ))}
        </>
      ) : null}
    </>
  );
}
