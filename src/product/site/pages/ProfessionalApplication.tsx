import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, CircleCheck, Plus, Trash2, Upload, X } from 'lucide-react';
import { projectId } from '../../../shared/api/supabase-info';
import { getAuthHeaders } from '../../../shared/api/supabase';
import {
  AGE_GROUPS, CASE_COMPLEXITY, CLIENT_TYPES, CLIENTS_TREATED, COMMUNICATION_STYLES,
  CONDITIONS_NOT_TREATED, CONTRIBUTION_TYPES, CULTURAL_EXPERIENCE, DAY_NAMES, DAY_PARTS,
  DOCUMENT_KINDS, EXPERTISE_AREAS, EXPERTISE_LEVELS, HIGHEST_QUALIFICATIONS, HOMEWORK_FREQUENCY,
  HOMEWORK_TYPES, INDIAN_STATES, LANGUAGES, PHILOSOPHY_WORD_LIMIT, PRACTICE_SETTINGS,
  PROFESSIONAL_TITLES, PROFILE_PROMPTS, PROFILE_WORD_LIMIT, REGISTRATIONS, SESSION_DURATIONS,
  SESSION_FORMATS, THERAPEUTIC_APPROACHES, THERAPY_FORMATS, WEEKDAYS,
  emptyPartnerForm, isOffline, needsRegistrationNumber, stepErrors, toPayload, wordCount,
  type ExpertiseLevel, type PartnerApplicationForm, type UploadedFile,
} from '../content/partner-application';

/*
 * /join/partner — the partner application.
 *
 * Built to "I-Kan Therapist Onboarding Form – Version 3" (Notion). Eleven steps,
 * chips and matrices over free text, conditional questions, and a draft that
 * saves itself to this device. Styled on iKAN 2's design system via the site's
 * `.ikan2-theme` page classes (`info-*`, `contact-field`, `info-tab`,
 * `info-button`); the controls the spec needs that the site had no class for
 * live under `.partner-*` in globals.css.
 */

const API = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
const DRAFT_KEY = 'ikan.partner-application.draft.v1';

const STEPS = [
  { title: 'Basic information', hint: 'Who you are and how we reach you.' },
  { title: 'Qualifications & verification', hint: 'Used to verify you. Never shown on your public profile.' },
  { title: 'Practice information', hint: 'How and where you practise.' },
  { title: 'Clinical expertise', hint: 'Rate only the areas you work in. Leave the rest blank.' },
  { title: 'Client preferences', hint: 'Who you work best with.' },
  { title: 'Therapy style', hint: 'Helps us match clients to the way you work.' },
  { title: 'Cultural competence', hint: 'Communities you have experience working with.' },
  { title: 'Availability & fees', hint: 'Tap the slots you usually take sessions in.' },
  { title: 'Publications & contributions', hint: 'Optional. Talks, writing, media and awards.' },
  { title: 'Media', hint: 'A short video helps clients choose you.' },
  { title: 'Public profile', hint: `What clients will read. Up to ${PROFILE_WORD_LIMIT} words each.` },
] as const;

type Form = PartnerApplicationForm;
type SetForm = (patch: Partial<Form>) => void;

function loadDraft(): { form: Form; step: number } | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return { form: { ...emptyPartnerForm(), ...saved.form }, step: Math.min(Math.max(0, saved.step | 0), STEPS.length - 1) };
  } catch {
    return null;
  }
}

function saveDraft(form: Form, step: number) {
  try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step })); } catch { /* private mode */ }
}

function clearDraft() {
  try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* private mode */ }
}

async function uploadFile(file: File, category: string): Promise<UploadedFile> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('category', category);
  fd.append('professionalId', 'application');
  const res = await fetch(`${API}/upload/professional-file`, { method: 'POST', headers: await getAuthHeaders(), body: fd });
  const result = await res.json().catch(() => ({}));
  if (!res.ok || !result.success) throw new Error(result.error || 'Upload failed');
  return { path: result.path, url: result.url, name: file.name };
}

// ── Controls ──────────────────────────────────────────────────────────────────

function Field({ label, required, wide, hint, children }: { label: string; required?: boolean; wide?: boolean; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className={`contact-field${wide ? ' contact-field--wide' : ''}`}>
      <span>{label}{required ? <em className="partner-required" aria-hidden="true"> *</em> : null}</span>
      {children}
      {hint ? <small className="partner-hint">{hint}</small> : null}
    </label>
  );
}

function Select({ value, onChange, options, placeholder = 'Choose…', required }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string; required?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/** A labelled group of pill buttons. `multi` toggles membership; single picks one (tap again to clear). */
function Chips({ label, required, options, value, onChange, hint }: {
  label: string; required?: boolean; options: readonly string[]; hint?: string;
  value: string[] | string; onChange: (v: string[] | string) => void;
}) {
  const id = useId();
  const multi = Array.isArray(value);
  const isOn = (o: string) => (multi ? (value as string[]).includes(o) : value === o);
  const toggle = (o: string) => {
    if (multi) {
      const v = value as string[];
      onChange(v.includes(o) ? v.filter((x) => x !== o) : [...v, o]);
    } else {
      onChange(value === o ? '' : o);
    }
  };
  return (
    <div className="partner-group contact-field--wide" role="group" aria-labelledby={id}>
      <p className="partner-group__label" id={id}>
        {label}{required ? <em className="partner-required" aria-hidden="true"> *</em> : null}
        {multi ? <span className="partner-group__note">Choose any</span> : null}
      </p>
      {hint ? <p className="partner-hint">{hint}</p> : null}
      <div className="partner-chips">
        {options.map((o) => (
          <button key={o} type="button" className="info-tab partner-chip" aria-pressed={isOn(o)} onClick={() => toggle(o)}>
            {isOn(o) ? <CircleCheck className="partner-chip__tick" aria-hidden="true" /> : null}
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: '' | 'yes' | 'no'; onChange: (v: '' | 'yes' | 'no') => void }) {
  return (
    <Chips label={label} options={['Yes', 'No']} value={value === 'yes' ? 'Yes' : value === 'no' ? 'No' : ''}
      onChange={(v) => onChange(v === 'Yes' ? 'yes' : v === 'No' ? 'no' : '')} />
  );
}

function OtherInput({ show, label, value, onChange }: { show: boolean; label: string; value: string; onChange: (v: string) => void }) {
  if (!show) return null;
  return <Field label={label} wide><input value={value} onChange={(e) => onChange(e.target.value)} /></Field>;
}

function LongAnswer({ label, required, value, onChange, limit, placeholder }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; limit?: number; placeholder?: string }) {
  const n = wordCount(value);
  const over = limit !== undefined && n > limit;
  return (
    <Field label={label} required={required} wide
      hint={limit !== undefined ? <span className={over ? 'partner-over' : undefined}>{n} / {limit} words</span> : undefined}>
      <textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-invalid={over || undefined} />
    </Field>
  );
}

/** A repeatable table: each row a set of inputs, with add and remove. */
function Rows<T extends Record<string, string>>({ label, rows, onChange, blank, columns, addLabel }: {
  label: string; rows: T[]; onChange: (rows: T[]) => void; blank: T; addLabel: string;
  columns: { key: keyof T & string; label: string; type?: string; options?: readonly string[]; narrow?: boolean }[];
}) {
  const id = useId();
  const set = (i: number, key: keyof T, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  return (
    <div className="partner-group contact-field--wide" role="group" aria-labelledby={id}>
      <p className="partner-group__label" id={id}>{label}</p>
      {rows.map((row, i) => (
        <div key={i} className="partner-row">
          {columns.map((c) => (
            <label key={c.key} className={`contact-field partner-row__cell${c.narrow ? ' partner-row__cell--narrow' : ''}`}>
              <span>{c.label}</span>
              {c.options
                ? <Select value={row[c.key]} onChange={(v) => set(i, c.key, v)} options={c.options} />
                : <input type={c.type || 'text'} value={row[c.key]} onChange={(e) => set(i, c.key, e.target.value)} inputMode={c.type === 'number' ? 'numeric' : undefined} />}
            </label>
          ))}
          <button type="button" className="partner-icon-button" aria-label={`Remove row ${i + 1}`} onClick={() => onChange(rows.filter((_, j) => j !== i))}>
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      ))}
      <button type="button" className="partner-add" onClick={() => onChange([...rows, { ...blank }])}>
        <Plus aria-hidden="true" /> {addLabel}
      </button>
    </div>
  );
}

function UploadButton({ label, accept, category, onUploaded, multiple }: { label: string; accept: string; category: string; onUploaded: (f: UploadedFile) => void; multiple?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) onUploaded(await uploadFile(file, category));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  return (
    <div className="partner-upload">
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => onFiles(e.target.files)} />
      <button type="button" className="partner-add" onClick={() => input.current?.click()} disabled={busy}>
        <Upload aria-hidden="true" /> {busy ? 'Uploading…' : label}
      </button>
      {error ? <p className="partner-error" role="alert">{error}</p> : null}
    </div>
  );
}

function FileList({ files, onRemove, label = (f: UploadedFile) => f.name }: { files: UploadedFile[]; onRemove: (i: number) => void; label?: (f: UploadedFile) => string }) {
  if (!files.length) return null;
  return (
    <ul className="partner-files">
      {files.map((f, i) => (
        <li key={f.path}>
          <span>{label(f)}</span>
          <button type="button" className="partner-icon-button" aria-label={`Remove ${f.name}`} onClick={() => onRemove(i)}><X aria-hidden="true" /></button>
        </li>
      ))}
    </ul>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function StepBasics({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      <Field label="Full name" required><input autoComplete="name" value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
      <Field label="Professional title" required>
        <Select value={f.professionalTitle} onChange={(v) => set({ professionalTitle: v })} options={PROFESSIONAL_TITLES} />
      </Field>
      <OtherInput show={f.professionalTitle === 'Other'} label="Your title" value={f.professionalTitleOther} onChange={(v) => set({ professionalTitleOther: v })} />
      <Field label="Email" required hint="For our team only. Not shown publicly.">
        <input type="email" autoComplete="email" value={f.email} onChange={(e) => set({ email: e.target.value })} />
      </Field>
      <Field label="Phone" required hint="For our team only. Not shown publicly.">
        <input type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
      </Field>
      <Chips label="Languages you conduct therapy in" required options={[...LANGUAGES, 'Other']} value={f.languages} onChange={(v) => set({ languages: v as string[] })} />
      <OtherInput show={f.languages.includes('Other')} label="Other languages" value={f.languagesOther} onChange={(v) => set({ languagesOther: v })} />
      <Field label="City" required><input autoComplete="address-level2" value={f.city} onChange={(e) => set({ city: e.target.value })} /></Field>
      <Field label="State / UT" required><Select value={f.state} onChange={(v) => set({ state: v })} options={INDIAN_STATES} /></Field>
      <div className="partner-group contact-field--wide">
        <p className="partner-group__label">Professional headshot</p>
        <p className="partner-hint">A clear, recent photo. JPG or PNG.</p>
        {f.headshot ? (
          <div className="partner-headshot">
            <img src={f.headshot.url} alt="Your headshot" />
            <button type="button" className="partner-add" onClick={() => set({ headshot: null })}><X aria-hidden="true" /> Remove</button>
          </div>
        ) : (
          <UploadButton label="Upload photo" accept="image/jpeg,image/png" category="photo" onUploaded={(file) => set({ headshot: file })} />
        )}
      </div>
    </>
  );
}

function StepVerification({ f, set }: { f: Form; set: SetForm }) {
  const [kind, setKind] = useState<string>(DOCUMENT_KINDS[0]);
  return (
    <>
      <Field label="Highest qualification" required>
        <Select value={f.highestQualification} onChange={(v) => set({ highestQualification: v })} options={HIGHEST_QUALIFICATIONS} />
      </Field>
      <OtherInput show={f.highestQualification === 'Other'} label="Your qualification" value={f.highestQualificationOther} onChange={(v) => set({ highestQualificationOther: v })} />
      <Rows label="Degrees" rows={f.degrees} onChange={(degrees) => set({ degrees })} addLabel="Add degree"
        blank={{ degree: '', institution: '', year: '' }}
        columns={[{ key: 'degree', label: 'Degree' }, { key: 'institution', label: 'Institution' }, { key: 'year', label: 'Year', type: 'number', narrow: true }]} />
      <Field label="Professional registration" required>
        <Select value={f.registration} onChange={(v) => set({ registration: v })} options={REGISTRATIONS} />
      </Field>
      <OtherInput show={f.registration === 'Other'} label="Registering body" value={f.registrationOther} onChange={(v) => set({ registrationOther: v })} />
      {needsRegistrationNumber(f.registration) ? (
        <Field label="Registration number" required><input value={f.registrationNumber} onChange={(e) => set({ registrationNumber: e.target.value })} /></Field>
      ) : null}
      <Rows label="Certifications" rows={f.certifications} onChange={(certifications) => set({ certifications })} addLabel="Add certification"
        blank={{ certification: '', issuer: '', year: '' }}
        columns={[{ key: 'certification', label: 'Certification' }, { key: 'issuer', label: 'Issuer' }, { key: 'year', label: 'Year', type: 'number', narrow: true }]} />
      <div className="partner-group contact-field--wide">
        <p className="partner-group__label">Upload documents</p>
        <p className="partner-hint">Degree, registration certificate and certifications. PDF, JPG or PNG, up to 10 MB each.</p>
        <FileList files={f.documents} label={(d) => `${(d as Form['documents'][number]).kind}: ${d.name}`}
          onRemove={(i) => set({ documents: f.documents.filter((_, j) => j !== i) })} />
        <div className="partner-upload-row">
          <label className="contact-field partner-row__cell">
            <span>Document type</span>
            <Select value={kind} onChange={(v) => setKind(v || DOCUMENT_KINDS[0])} options={DOCUMENT_KINDS} placeholder="Document type" />
          </label>
          <UploadButton label="Upload document" accept="application/pdf,image/jpeg,image/png" category="verification" multiple
            onUploaded={(file) => set({ documents: [...f.documents, { ...file, kind }] })} />
        </div>
      </div>
      <h3 className="partner-subhead contact-field--wide">A few verification questions</h3>
      <YesNo label="Do you hold a formal Master's degree (M.A./M.Sc.) in Psychology or Counselling from a recognised university?" value={f.hasMastersDegree} onChange={(v) => set({ hasMastersDegree: v })} />
      <Field label="How many hours of supervised clinical training have you completed?" wide>
        <input type="number" min={0} inputMode="numeric" value={f.supervisedHours} onChange={(e) => set({ supervisedHours: e.target.value })} />
      </Field>
      <YesNo label="Do you currently work under an experienced clinical supervisor?" value={f.underSupervision} onChange={(v) => set({ underSupervision: v })} />
    </>
  );
}

function StepPractice({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      <Chips label="Practice setting" options={PRACTICE_SETTINGS} value={f.practiceSettings} onChange={(v) => set({ practiceSettings: v as string[] })} />
      <OtherInput show={f.practiceSettings.includes('Other')} label="Other setting" value={f.practiceSettingOther} onChange={(v) => set({ practiceSettingOther: v })} />
      <Field label="Years in practice" required>
        <input type="number" min={0} max={70} inputMode="numeric" value={f.yearsInPractice} onChange={(e) => set({ yearsInPractice: e.target.value })} />
      </Field>
      <Chips label="Approximate clients treated" options={CLIENTS_TREATED} value={f.clientsTreated} onChange={(v) => set({ clientsTreated: v as string })} />
      <Chips label="Average session duration (minutes)" options={SESSION_DURATIONS} value={f.sessionDuration} onChange={(v) => set({ sessionDuration: v as string })} />
      <Chips label="Session formats" required options={SESSION_FORMATS} value={f.sessionFormats} onChange={(v) => set({ sessionFormats: v as string[] })} />
      <YesNo label="Weekend consultations" value={f.weekendConsultations} onChange={(v) => set({ weekendConsultations: v })} />
      <YesNo label="Emergency consultations" value={f.emergencyConsultations} onChange={(v) => set({ emergencyConsultations: v })} />
    </>
  );
}

function StepExpertise({ f, set }: { f: Form; set: SetForm }) {
  const [adding, setAdding] = useState('');
  const areas = [...EXPERTISE_AREAS, ...f.customExpertiseAreas];
  const rate = (area: string, level: ExpertiseLevel) =>
    set({ expertise: { ...f.expertise, [area]: f.expertise[area] === level ? '' : level } });
  const addArea = () => {
    const a = adding.trim();
    if (a && !areas.includes(a)) set({ customExpertiseAreas: [...f.customExpertiseAreas, a] });
    setAdding('');
  };
  return (
    <>
      <div className="partner-group contact-field--wide">
        <p className="partner-group__label">Clinical expertise</p>
        <div className="partner-matrix">
          {areas.map((area) => (
            <div key={area} className="partner-matrix__row" role="group" aria-label={area}>
              <span className="partner-matrix__area">{area}</span>
              <div className="partner-chips">
                {EXPERTISE_LEVELS.map((level) => (
                  <button key={level} type="button" className="info-tab partner-chip partner-chip--sm" aria-pressed={f.expertise[area] === level} onClick={() => rate(area, level)}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="partner-upload-row">
          <label className="contact-field partner-row__cell">
            <span>Add another area</span>
            <input value={adding} onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArea(); } }} />
          </label>
          <button type="button" className="partner-add" onClick={addArea}><Plus aria-hidden="true" /> Add</button>
        </div>
      </div>
      <Chips label="Conditions you do NOT treat" options={[...CONDITIONS_NOT_TREATED, 'Other']} value={f.conditionsNotTreated} onChange={(v) => set({ conditionsNotTreated: v as string[] })} />
      <OtherInput show={f.conditionsNotTreated.includes('Other')} label="Other conditions" value={f.conditionsNotTreatedOther} onChange={(v) => set({ conditionsNotTreatedOther: v })} />
      <LongAnswer label="Conditions outside your scope (optional)" value={f.outsideScope} onChange={(v) => set({ outsideScope: v })} />
    </>
  );
}

function StepClients({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      <Chips label="Preferred age groups" options={AGE_GROUPS} value={f.ageGroups} onChange={(v) => set({ ageGroups: v as string[] })} />
      <Chips label="Preferred client types" options={CLIENT_TYPES} value={f.clientTypes} onChange={(v) => set({ clientTypes: v as string[] })} />
      <OtherInput show={f.clientTypes.includes('Other')} label="Other client types" value={f.clientTypeOther} onChange={(v) => set({ clientTypeOther: v })} />
      <Chips label="Preferred therapy format" options={THERAPY_FORMATS} value={f.therapyFormats} onChange={(v) => set({ therapyFormats: v as string[] })} />
      <Chips label="Preferred case complexity" options={CASE_COMPLEXITY} value={f.caseComplexity} onChange={(v) => set({ caseComplexity: v as string })} />
    </>
  );
}

function StepStyle({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      <Chips label="Therapeutic approaches" options={THERAPEUTIC_APPROACHES} value={f.approaches} onChange={(v) => set({ approaches: v as string[] })} />
      <OtherInput show={f.approaches.includes('Other')} label="Other approaches" value={f.approachOther} onChange={(v) => set({ approachOther: v })} />
      <div className="partner-group contact-field--wide">
        <p className="partner-group__label">Communication style</p>
        <p className="partner-hint">Where do you usually sit between each pair?</p>
        {COMMUNICATION_STYLES.map((s) => (
          <label key={s.key} className="partner-slider">
            <span className="partner-slider__pole">{s.left}</span>
            <input type="range" min={1} max={5} step={1} value={f.communicationStyle[s.key]}
              aria-label={`${s.left} to ${s.right}`} aria-valuetext={`${f.communicationStyle[s.key]} of 5`}
              onChange={(e) => set({ communicationStyle: { ...f.communicationStyle, [s.key]: Number(e.target.value) } })} />
            <span className="partner-slider__pole partner-slider__pole--right">{s.right}</span>
          </label>
        ))}
      </div>
      <Chips label="Homework frequency" options={HOMEWORK_FREQUENCY} value={f.homeworkFrequency} onChange={(v) => set({ homeworkFrequency: v as string })} />
      {f.homeworkFrequency && f.homeworkFrequency !== 'Never' ? (
        <>
          <Chips label="Homework types" options={HOMEWORK_TYPES} value={f.homeworkTypes} onChange={(v) => set({ homeworkTypes: v as string[] })} />
          <OtherInput show={f.homeworkTypes.includes('Other')} label="Other homework" value={f.homeworkTypeOther} onChange={(v) => set({ homeworkTypeOther: v })} />
        </>
      ) : null}
      <LongAnswer label="Therapeutic philosophy" value={f.philosophy} onChange={(v) => set({ philosophy: v })} limit={PHILOSOPHY_WORD_LIMIT} />
    </>
  );
}

function StepCulture({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      <Chips label="Experience working with" options={CULTURAL_EXPERIENCE} value={f.culturalExperience} onChange={(v) => set({ culturalExperience: v as string[] })} />
      <OtherInput show={f.culturalExperience.includes('Others')} label="Other communities" value={f.culturalExperienceOther} onChange={(v) => set({ culturalExperienceOther: v })} />
    </>
  );
}

function StepAvailability({ f, set }: { f: Form; set: SetForm }) {
  const toggle = (day: string, part: string) => {
    const cur = f.availability[day] || [];
    set({ availability: { ...f.availability, [day]: cur.includes(part) ? cur.filter((p) => p !== part) : [...cur, part] } });
  };
  return (
    <>
      <div className="partner-group contact-field--wide">
        <p className="partner-group__label">Weekly availability</p>
        <div className="partner-week" role="grid" aria-label="Weekly availability">
          <div className="partner-week__row partner-week__head" role="row">
            <span role="columnheader" />
            {DAY_PARTS.map((p) => (
              <span key={p.key} role="columnheader" className="partner-week__part">{p.label}<small>{p.hours}</small></span>
            ))}
          </div>
          {WEEKDAYS.map((d) => (
            <div key={d} className="partner-week__row" role="row">
              <span role="rowheader" className="partner-week__day">{d}</span>
              {DAY_PARTS.map((p) => {
                const on = (f.availability[d] || []).includes(p.key);
                return (
                  <span key={p.key} role="gridcell">
                    <button type="button" className="partner-week__slot" aria-pressed={on}
                      aria-label={`${DAY_NAMES[d]} ${p.label.toLowerCase()}`} onClick={() => toggle(d, p.key)}>
                      {on ? <CircleCheck aria-hidden="true" /> : null}
                    </button>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <h3 className="partner-subhead contact-field--wide">Fees per session (₹)</h3>
      {([['feeIndividual', 'Individual'], ['feeCouple', 'Couple'], ['feeFamily', 'Family']] as const).map(([key, label]) => (
        <Field key={key} label={label}>
          <span className="partner-currency">
            <span aria-hidden="true">₹</span>
            <input type="number" min={0} step={100} inputMode="numeric" value={f[key]} onChange={(e) => set({ [key]: e.target.value } as Partial<Form>)} />
          </span>
        </Field>
      ))}
      <YesNo label="Do you offer a sliding scale?" value={f.slidingScale} onChange={(v) => set({ slidingScale: v })} />
    </>
  );
}

function StepContributions({ f, set }: { f: Form; set: SetForm }) {
  return (
    <Rows label="Professional contributions" rows={f.contributions} onChange={(contributions) => set({ contributions })} addLabel="Add contribution"
      blank={{ type: '', title: '', year: '', link: '' }}
      columns={[
        { key: 'type', label: 'Type', options: CONTRIBUTION_TYPES },
        { key: 'title', label: 'Title' },
        { key: 'year', label: 'Year', type: 'number', narrow: true },
        { key: 'link', label: 'Link', type: 'url' },
      ]} />
  );
}

function StepMedia({ f, set }: { f: Form; set: SetForm }) {
  const offline = isOffline(f.sessionFormats);
  return (
    <>
      <Field label="Introduction video link" wide hint="1–3 minutes introducing yourself and your approach. A YouTube, Vimeo or Google Drive link.">
        <input type="url" placeholder="https://youtube.com/…" value={f.introVideoUrl} onChange={(e) => set({ introVideoUrl: e.target.value })} />
      </Field>
      {offline ? (
        <>
          <div className="partner-group contact-field--wide">
            <p className="partner-group__label">Workspace photos</p>
            <p className="partner-hint">Where you see clients in person.</p>
            <FileList files={f.workspacePhotos} onRemove={(i) => set({ workspacePhotos: f.workspacePhotos.filter((_, j) => j !== i) })} />
            <UploadButton label="Upload photos" accept="image/jpeg,image/png,image/webp" category="workspace" multiple
              onUploaded={(file) => set({ workspacePhotos: [...f.workspacePhotos, file] })} />
          </div>
          <Field label="Google Maps link" wide>
            <input type="url" placeholder="https://maps.google.com/…" value={f.mapsLink} onChange={(e) => set({ mapsLink: e.target.value })} />
          </Field>
        </>
      ) : (
        <p className="partner-hint contact-field--wide">Workspace photos and a map link are asked for when you offer in-person or home-visit sessions (step 3).</p>
      )}
    </>
  );
}

function StepProfile({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      {PROFILE_PROMPTS.map((p) => (
        <LongAnswer key={p.key} label={p.label} required={'required' in p && p.required} value={f.profile[p.key]} limit={PROFILE_WORD_LIMIT}
          onChange={(v) => set({ profile: { ...f.profile, [p.key]: v } })} />
      ))}
    </>
  );
}

const STEP_BODIES = [StepBasics, StepVerification, StepPractice, StepExpertise, StepClients, StepStyle, StepCulture, StepAvailability, StepContributions, StepMedia, StepProfile];

// ── Page ──────────────────────────────────────────────────────────────────────

interface ProfessionalApplicationProps {
  onNavigate?: (page: string) => void;
}

export function ProfessionalApplication({ onNavigate }: ProfessionalApplicationProps) {
  const [form, setForm] = useState<Form>(() => loadDraft()?.form ?? emptyPartnerForm());
  const [step, setStep] = useState(() => loadDraft()?.step ?? 0);
  const [reached, setReached] = useState(step);
  const [missing, setMissing] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  const set: SetForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (submitted) return;
    const t = window.setTimeout(() => saveDraft(form, step), 400);
    return () => window.clearTimeout(t);
  }, [form, step, submitted]);

  const goTo = (next: number) => {
    setMissing([]);
    setStep(next);
    setReached((r) => Math.max(r, next));
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const next = () => {
    const errs = stepErrors(step, form);
    if (errs.length) { setMissing(errs); return; }
    goTo(step + 1);
  };

  const submit = async () => {
    // Every step, not just this one: a draft restored mid-way may have gaps behind it.
    for (let i = 0; i < STEPS.length; i++) {
      const errs = stepErrors(i, form);
      if (errs.length) { goTo(i); setMissing(errs); return; }
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API}/public/professional-application`, {
        method: 'POST',
        headers: await getAuthHeaders(true),
        body: JSON.stringify(toPayload(form)),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to submit application');
      clearDraft();
      setSubmitted(true);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="ikan2-theme info-page site-page-below-nav">
        <section className="info-band">
          <div className="info-band__inner partner-done">
            <CircleCheck className="partner-done__icon" aria-hidden="true" />
            <p className="info-eyebrow">Partner application</p>
            <h1 className="info-title">Application received</h1>
            <p className="info-subtitle">Thank you for applying to partner with iKAN. Our team will verify your details and reply to {form.email || 'you'} within 3–5 business days.</p>
            {onNavigate ? <button type="button" className="info-button" onClick={() => onNavigate('/')}>Back to iKAN</button> : null}
          </div>
        </section>
      </div>
    );
  }

  const Body = STEP_BODIES[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="ikan2-theme info-page site-page-below-nav">
      <section className="info-band">
        <div className="info-band__inner" ref={top}>
          <p className="info-eyebrow">Partner with iKAN</p>
          <h1 className="info-title">Become an iKAN Partner</h1>
          <p className="info-subtitle">For therapists, psychologists, psychiatrists and counsellors. Our team reviews every application, and your profile goes live once you're approved. Your progress saves on this device as you go.</p>

          <nav className="partner-progress" aria-label="Application steps">
            <p className="partner-progress__count">Step {step + 1} of {STEPS.length}</p>
            <div className="partner-progress__bar" aria-hidden="true"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
            <ol className="partner-steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <button type="button" className="partner-steps__item" aria-current={i === step ? 'step' : undefined}
                    disabled={i > reached} onClick={() => goTo(i)}>
                    <span className="partner-steps__num">{i < step ? <CircleCheck aria-hidden="true" /> : i + 1}</span>
                    <span className="partner-steps__label">{s.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <section className="contact-form-section" aria-labelledby="partner-step-title">
            <h2 className="contact-form__title" id="partner-step-title">{STEPS[step].title}</h2>
            <p className="contact-form__subtitle">{STEPS[step].hint}</p>

            <form className="contact-form partner-form" noValidate onSubmit={(e) => { e.preventDefault(); if (last) submit(); else next(); }}>
              <Body f={form} set={set} />

              {missing.length ? (
                <div className="partner-missing contact-field--wide" role="alert">
                  <p>Please add:</p>
                  <ul>{missing.map((m) => <li key={m}>{m}</li>)}</ul>
                </div>
              ) : null}
              {submitError ? <p className="partner-error contact-field--wide" role="alert">{submitError}</p> : null}

              <div className="partner-nav contact-field--wide">
                <button type="button" className="partner-add" onClick={() => goTo(step - 1)} disabled={step === 0}>
                  <ArrowLeft aria-hidden="true" /> Back
                </button>
                <button type="submit" className="info-button" disabled={submitting}>
                  {last ? (submitting ? 'Submitting…' : 'Submit application') : <>Next <ArrowRight className="partner-nav__arrow" aria-hidden="true" /></>}
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
}
