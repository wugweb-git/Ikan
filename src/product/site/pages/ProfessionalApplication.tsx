import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, ChevronDown, CircleCheck, FileText, IdCard, Plus, Trash2, Upload, X } from 'lucide-react';
import { projectId } from '../../../shared/api/supabase-info';
import { getAuthHeaders } from '../../../shared/api/supabase';
import {
  AGE_GROUPS, CASE_COMPLEXITY, CLIENT_TYPES, CLIENTS_TREATED, COMMUNICATION_STYLES,
  CONDITIONS_NOT_TREATED, CONTRIBUTION_TYPES, COUNTRIES, CULTURAL_EXPERIENCE, DAY_NAMES, DAY_PARTS,
  DOCUMENT_KINDS, EXPERTISE_AREAS, EXPERTISE_LEVELS, HIGHEST_QUALIFICATIONS, HOMEWORK_FREQUENCY,
  HOMEWORK_TYPES, INDIAN_STATES, LANGUAGES, PHILOSOPHY_WORD_LIMIT, PIN_PATTERN, PRACTICE_SETTINGS,
  PROFESSIONAL_TITLES, PROFILE_PROMPTS, PROFILE_WORD_LIMIT, REGISTRATIONS, SESSION_DURATIONS,
  SESSION_FORMATS, THERAPEUTIC_APPROACHES, THERAPY_FORMATS, WEEKDAYS,
  emptyPartnerForm, formatPhone, isOffline, lookupPin, needsRegistrationNumber, parsePhone,
  stepErrors, toPayload, wordCount,
  type ExpertiseLevel, type PartnerApplicationForm, type UploadedFile,
} from '../content/partner-application';

/*
 * /join/partner — the partner application.
 *
 * Built to "I-Kan Therapist Onboarding Form – Version 3" (Notion). Eleven steps,
 * chips and matrices over free text, conditional questions, and a draft that
 * saves itself to this device.
 *
 * Every control is an iKAN 2 component ported into `ikan2.css` — Field,
 * PhoneField, Chip, Button, FormError, Progress, the M3 state layer — and the
 * headings take iKAN 2's h1–h6 map via `ikan2-type`. `.partner-*` in
 * globals.css is layout only: grids and rows, no colours or states.
 */

const API = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
const DRAFT_KEY = 'ikan.partner-application.draft.v1';

/** Step titles verbatim from the spec. Only step 2 carries a note: the spec's
 *  "keep verification fields separate from the public profile", said to the applicant. */
const STEPS = [
  { title: 'Basic Information' },
  { title: 'Qualifications & Verification', hint: 'Used to verify you. Kept separate from your public profile.' },
  { title: 'Practice Information' },
  { title: 'Clinical Expertise' },
  { title: 'Client Preferences' },
  { title: 'Therapy Style' },
  { title: 'Cultural Competence' },
  { title: 'Availability & Fees' },
  { title: 'Publications & Professional Contributions' },
  { title: 'Media' },
  { title: 'Public Profile' },
] as { title: string; hint?: string }[];

/* Every step has its own URL, /join/partner/<step>, named from the spec's
   step title ("Availability & Fees" → availability-and-fees). /join/partner is
   the intro and /join/partner/submitted the confirmation. Back and Forward walk
   the steps; a link to a step not reached yet lands on the furthest reached. */
const BASE_PATH = '/join/partner';
const stepSlug = (title: string) =>
  title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const STEP_SLUGS = STEPS.map((s) => stepSlug(s.title));
const stepPath = (i: number) => `${BASE_PATH}/${STEP_SLUGS[i]}`;

/** The step a path names: a step index, 'intro', or 'submitted'. Unknown slugs read as the intro. */
function stepFromPath(pathname: string): number | 'intro' | 'submitted' {
  const rest = pathname.replace(/\/+$/, '').slice(BASE_PATH.length).replace(/^\//, '');
  if (!rest) return 'intro';
  if (rest === 'submitted') return 'submitted';
  const i = STEP_SLUGS.indexOf(rest);
  return i === -1 ? 'intro' : i;
}

function setUrl(path: string, mode: 'push' | 'replace') {
  if (window.location.pathname === path) return;
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', path);
}

type Form = PartnerApplicationForm;
type SetForm = (patch: Partial<Form>) => void;

function loadDraft(): { form: Form; step: number; reached: number } | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const clamp = (n: unknown) => Math.min(Math.max(0, Number(n) | 0), STEPS.length - 1);
    return { form: { ...emptyPartnerForm(), ...saved.form }, step: clamp(saved.step), reached: clamp(saved.reached ?? saved.step) };
  } catch {
    return null;
  }
}

function saveDraft(form: Form, step: number, reached: number) {
  try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step, reached })); } catch { /* private mode */ }
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

// ── Controls (iKAN 2 components, see ikan2.css "COMPONENTS, ported") ─────────

function Required() {
  return <span aria-hidden="true"> *</span>;
}

/** iKAN 2 `Field`: label above, the box, then an error or a hint. */
function Field({ label, required, wide, hint, error, multiline, prefix, messageId, children }: {
  label: string; required?: boolean; wide?: boolean; hint?: ReactNode; error?: string;
  multiline?: boolean; prefix?: ReactNode; messageId?: string; children: ReactNode;
}) {
  return (
    <label className={`field${wide ? ' partner-wide' : ''}`}>
      <span className="field__label">{label}{required ? <Required /> : null}</span>
      <span className={`field__box${multiline ? ' field__box--multiline' : ''}`} data-invalid={error ? 'true' : undefined}>
        {prefix ? <span className="field__prefix" aria-hidden="true">{prefix}</span> : null}
        {children}
      </span>
      {error ? <span id={messageId} className="field__message field__message--error" role="alert">{error}</span>
        : hint ? <span id={messageId} className="field__message">{hint}</span> : null}
    </label>
  );
}

function Select({ value, onChange, options, placeholder = 'Choose…' }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string }) {
  return (
    <select className="field__control" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/** iKAN 2 `PhoneField` (auth variant): flag and dial code over a native select, then ten digits. */
function PhoneField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { country, number } = parsePhone(value);
  return (
    <Field label="Phone" required hint="For our team only. Not shown publicly.">
      <span className="phone-field__country">
        <span aria-hidden="true">
          <span className="phone-field__flag">{country.flag}</span>
          {country.dial}
          <ChevronDown />
        </span>
        <select aria-label="Country code" value={`${country.code}${country.dial}`}
          onChange={(e) => {
            const next = COUNTRIES.find((c) => `${c.code}${c.dial}` === e.target.value) ?? COUNTRIES[0];
            onChange(formatPhone(next, number) || `${next.dial} `);
          }}>
          {COUNTRIES.map((c) => <option key={c.code} value={`${c.code}${c.dial}`}>{c.flag} {c.name} ({c.dial})</option>)}
        </select>
      </span>
      <input className="field__control phone-field__number" aria-label="Phone number" type="tel" inputMode="numeric" autoComplete="tel-national"
        maxLength={10} placeholder="98765 43210" value={number}
        onChange={(e) => onChange(formatPhone(country, e.target.value.replace(/\D/g, '').slice(0, 10)))} />
    </Field>
  );
}

type ChipOption = string | { value: string; label: ReactNode; lang?: string; dir?: string };
const optValue = (o: ChipOption) => (typeof o === 'string' ? o : o.value);

/** A labelled group of iKAN 2 `Chip`s. `multi` toggles membership; single picks one (tap again to clear). */
function Chips({ label, required, options, value, onChange, hint, size }: {
  label: string; required?: boolean; options: readonly ChipOption[]; hint?: string; size?: 'sm' | 'lg';
  value: string[] | string; onChange: (v: string[] | string) => void;
}) {
  const multi = Array.isArray(value);
  const isOn = (v: string) => (multi ? (value as string[]).includes(v) : value === v);
  const toggle = (v: string) => {
    if (multi) {
      const cur = value as string[];
      onChange(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
    } else {
      onChange(value === v ? '' : v);
    }
  };
  return (
    <fieldset className="partner-wide partner-fieldset">
      <legend className="field__label">
        {label}{required ? <Required /> : null}{multi ? <span className="partner-note"> · choose any</span> : null}
      </legend>
      {hint ? <p className="field__message partner-group-hint">{hint}</p> : null}
      <div className="partner-chips">
        {options.map((o) => {
          const v = optValue(o);
          const on = isOn(v);
          return (
            <button key={v} type="button" aria-pressed={on} onClick={() => toggle(v)}
              lang={typeof o === 'string' ? undefined : o.lang} dir={typeof o === 'string' ? undefined : o.dir}
              aria-label={typeof o === 'string' || o.label === v ? undefined : v}
              className={`chip${size ? ` chip--${size}` : ' chip--lg'} state-layer motion-press`}>
              {on ? <CircleCheck aria-hidden="true" /> : null}
              {typeof o === 'string' ? o : o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** iKAN 2 `Segmented`: a radio group of equal 48px options, the chosen one in the accent. */
function YesNo({ label, value, onChange }: { label: string; value: '' | 'yes' | 'no'; onChange: (v: '' | 'yes' | 'no') => void }) {
  const id = useId();
  return (
    <fieldset className="partner-wide partner-fieldset">
      <legend className="field__label" id={id}>{label}</legend>
      <div className="segmented partner-segmented" role="radiogroup" aria-labelledby={id}>
        {(['yes', 'no'] as const).map((v) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
            className="segmented__option state-layer">
            {value === v ? <Check aria-hidden="true" strokeWidth={3} /> : null}
            {v === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function OtherInput({ show, label, value, onChange }: { show: boolean; label: string; value: string; onChange: (v: string) => void }) {
  if (!show) return null;
  return <Field label={label} wide><input className="field__control" value={value} onChange={(e) => onChange(e.target.value)} /></Field>;
}

/** `limit` is a guide by default (the spec's "Recommended maximum 250–300 words"):
 *  going over warns but does not block. `hard` makes it a rule ("300 words max"). */
function LongAnswer({ label, required, value, onChange, limit, hard, hint }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; limit?: number; hard?: boolean; hint?: string }) {
  const messageId = useId();
  const n = wordCount(value);
  const over = limit !== undefined && n > limit;
  const count = limit !== undefined ? `${n} / ${limit} words` : undefined;
  return (
    <Field label={label} required={required} wide multiline messageId={messageId}
      error={over && hard ? `${count}. Please shorten it.` : undefined}
      hint={over ? `${count}. Recommended maximum is 250–300 words.` : [hint, count].filter(Boolean).join(' · ') || undefined}>
      <textarea className="field__control" rows={5} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={(over && hard) || undefined} aria-describedby={messageId} />
    </Field>
  );
}

/** A repeatable table: each row a set of Fields, with add and remove. */
function Rows<T extends Record<string, string>>({ label, rows, onChange, blank, columns, addLabel }: {
  label: string; rows: T[]; onChange: (rows: T[]) => void; blank: T; addLabel: string;
  columns: { key: keyof T & string; label: string; type?: string; options?: readonly string[]; narrow?: boolean }[];
}) {
  const id = useId();
  const set = (i: number, key: keyof T, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  return (
    <div className="partner-wide" role="group" aria-labelledby={id}>
      <h3 id={id} className="partner-group-title">{label}</h3>
      {rows.map((row, i) => (
        <div key={i} className="partner-row">
          {columns.map((c) => (
            <div key={c.key} className={`partner-row__cell${c.narrow ? ' partner-row__cell--narrow' : ''}`}>
              <Field label={c.label}>
                {c.options
                  ? <Select value={row[c.key]} onChange={(v) => set(i, c.key, v)} options={c.options} />
                  : <input className="field__control" type={c.type || 'text'} value={row[c.key]} onChange={(e) => set(i, c.key, e.target.value)} inputMode={c.type === 'number' ? 'numeric' : undefined} />}
              </Field>
            </div>
          ))}
          <button type="button" className="btn btn--text btn--icon btn--md state-layer" aria-label={`Remove row ${i + 1}`} onClick={() => onChange(rows.filter((_, j) => j !== i))}>
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn--outlined btn--md state-layer motion-press" onClick={() => onChange([...rows, { ...blank }])}>
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
    <div>
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => onFiles(e.target.files)} />
      <button type="button" className="btn btn--outlined btn--md state-layer motion-press" onClick={() => input.current?.click()} disabled={busy} aria-busy={busy || undefined}>
        {busy ? <span className="btn__spinner" aria-hidden="true" /> : <Upload aria-hidden="true" />} {busy ? 'Uploading…' : label}
      </button>
      {error ? <p className="field__message field__message--error" role="alert">{error}</p> : null}
    </div>
  );
}

function FileList({ files, onRemove, label = (f: UploadedFile) => f.name }: { files: UploadedFile[]; onRemove: (i: number) => void; label?: (f: UploadedFile) => string }) {
  if (!files.length) return null;
  return (
    <ul className="partner-files">
      {files.map((f, i) => (
        <li key={f.path} className="field__box">
          <span className="partner-files__name">{label(f)}</span>
          <button type="button" className="btn btn--text btn--icon btn--md state-layer" aria-label={`Remove ${f.name}`} onClick={() => onRemove(i)}><X aria-hidden="true" /></button>
        </li>
      ))}
    </ul>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

/** PIN first: India Post fills city and state, and an unknown PIN is flagged. */
function PinField({ f, set }: { f: Form; set: SetForm }) {
  const [status, setStatus] = useState<{ kind: 'idle' | 'busy' | 'found' | 'unknown' | 'offline'; text?: string }>({ kind: 'idle' });
  const pin = f.pincode;
  useEffect(() => {
    if (!PIN_PATTERN.test(pin)) { setStatus({ kind: 'idle' }); return; }
    const ctrl = new AbortController();
    setStatus({ kind: 'busy' });
    lookupPin(pin, ctrl.signal)
      .then((hit) => {
        if (!hit) { setStatus({ kind: 'unknown' }); return; }
        set({ city: hit.district, ...(hit.state ? { state: hit.state } : {}) });
        setStatus({ kind: 'found', text: `${hit.district}, ${hit.state || 'India'}` });
      })
      .catch((e) => { if (e?.name !== 'AbortError') setStatus({ kind: 'offline' }); });
    return () => ctrl.abort();
    // `set` is a fresh closure each render; the lookup depends only on the PIN.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const typedBadly = pin.length > 0 && pin.length === 6 && !PIN_PATTERN.test(pin);
  return (
    <Field label="PIN code" required
      error={typedBadly ? 'A PIN code is 6 digits and does not start with 0.' : status.kind === 'unknown' ? 'India Post does not know this PIN code. Please check it.' : undefined}
      hint={status.kind === 'busy' ? 'Looking up…' : status.kind === 'found' ? `Found: ${status.text}` : status.kind === 'offline' ? 'Could not check the PIN right now. Please fill city and state yourself.' : 'Fills in your city and state.'}>
      <input className="field__control" inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="411001"
        value={pin} onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
    </Field>
  );
}

function StepBasics({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      <Field label="Full Name" required><input className="field__control" autoComplete="name" value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
      <Field label="Professional Title" required>
        <Select value={f.professionalTitle} onChange={(v) => set({ professionalTitle: v })} options={PROFESSIONAL_TITLES} />
      </Field>
      <OtherInput show={f.professionalTitle === 'Other'} label="Your title" value={f.professionalTitleOther} onChange={(v) => set({ professionalTitleOther: v })} />
      <Field label="Email" required hint="For our team only. Not shown publicly.">
        <input className="field__control" type="email" autoComplete="email" value={f.email} onChange={(e) => set({ email: e.target.value })} />
      </Field>
      <PhoneField value={f.phone} onChange={(phone) => set({ phone })} />
      <Chips label="Language(s) in which you conduct therapy" required hint="Example: English, Hindi, Marathi."
        options={[...LANGUAGES.map((l) => ({ value: l.value, label: l.native, lang: l.lang, dir: 'dir' in l ? l.dir : undefined })), { value: 'Other', label: 'Other', lang: 'en' }]}
        value={f.languages} onChange={(v) => set({ languages: v as string[] })} />
      <OtherInput show={f.languages.includes('Other')} label="Other languages" value={f.languagesOther} onChange={(v) => set({ languagesOther: v })} />
      <PinField f={f} set={set} />
      <Field label="City" required><input className="field__control" autoComplete="address-level2" value={f.city} onChange={(e) => set({ city: e.target.value })} /></Field>
      <Field label="State" required><Select value={f.state} onChange={(v) => set({ state: v })} options={INDIAN_STATES} /></Field>
      <div className="partner-wide">
        <h3 className="partner-group-title">Professional Headshot</h3>
        <p className="field__message partner-group-hint">JPG/PNG</p>
        {f.headshot ? (
          <div className="partner-headshot">
            <img src={f.headshot.url} alt="Your headshot" />
            <button type="button" className="btn btn--outlined btn--md state-layer motion-press" onClick={() => set({ headshot: null })}><X aria-hidden="true" /> Remove</button>
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
      <Field label="Highest Qualification" required>
        <Select value={f.highestQualification} onChange={(v) => set({ highestQualification: v })} options={HIGHEST_QUALIFICATIONS} />
      </Field>
      <OtherInput show={f.highestQualification === 'Other'} label="Your qualification" value={f.highestQualificationOther} onChange={(v) => set({ highestQualificationOther: v })} />
      <Rows label="Degrees" rows={f.degrees} onChange={(degrees) => set({ degrees })} addLabel="Add degree"
        blank={{ degree: '', institution: '', year: '' }}
        columns={[{ key: 'degree', label: 'Degree' }, { key: 'institution', label: 'Institution' }, { key: 'year', label: 'Year', type: 'number', narrow: true }]} />
      <Field label="Professional Registration" required>
        <Select value={f.registration} onChange={(v) => set({ registration: v })} options={REGISTRATIONS} />
      </Field>
      <OtherInput show={f.registration === 'Other'} label="Registering body" value={f.registrationOther} onChange={(v) => set({ registrationOther: v })} />
      {needsRegistrationNumber(f.registration) ? (
        <Field label="Registration Number" required><input className="field__control" value={f.registrationNumber} onChange={(e) => set({ registrationNumber: e.target.value })} /></Field>
      ) : null}
      <Rows label="Certifications" rows={f.certifications} onChange={(certifications) => set({ certifications })} addLabel="Add certification"
        blank={{ certification: '', issuer: '', year: '' }}
        columns={[{ key: 'certification', label: 'Certification' }, { key: 'issuer', label: 'Issuer' }, { key: 'year', label: 'Year', type: 'number', narrow: true }]} />
      <div className="partner-wide">
        <h3 className="partner-group-title">Upload Documents</h3>
        <p className="field__message partner-group-hint">Degree, Registration Certificate, Certifications. PDF, JPG or PNG, up to 10 MB each.</p>
        <FileList files={f.documents} label={(d) => `${(d as Form['documents'][number]).kind}: ${d.name}`}
          onRemove={(i) => set({ documents: f.documents.filter((_, j) => j !== i) })} />
        <div className="partner-row">
          <div className="partner-row__cell">
            <Field label="Document type">
              <Select value={kind} onChange={(v) => setKind(v || DOCUMENT_KINDS[0])} options={DOCUMENT_KINDS} placeholder="Document type" />
            </Field>
          </div>
          <UploadButton label="Upload document" accept="application/pdf,image/jpeg,image/png" category="verification" multiple
            onUploaded={(file) => set({ documents: [...f.documents, { ...file, kind }] })} />
        </div>
      </div>
      <h3 className="partner-wide partner-group-title">Additional Verification Questions (Recommended)</h3>
      <YesNo label="Do you hold a formal Master's degree (M.A./M.Sc.) in Psychology or Counselling from a recognized university?" value={f.hasMastersDegree} onChange={(v) => set({ hasMastersDegree: v })} />
      <Field label="How many hours of supervised clinical training have you completed?" wide>
        <input className="field__control" type="number" min={0} inputMode="numeric" value={f.supervisedHours} onChange={(e) => set({ supervisedHours: e.target.value })} />
      </Field>
      <YesNo label="Do you currently work under an experienced clinical supervisor?" value={f.underSupervision} onChange={(v) => set({ underSupervision: v })} />
    </>
  );
}

function StepPractice({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      <Chips label="Practice Setting" options={PRACTICE_SETTINGS} value={f.practiceSettings} onChange={(v) => set({ practiceSettings: v as string[] })} />
      <OtherInput show={f.practiceSettings.includes('Other')} label="Other setting" value={f.practiceSettingOther} onChange={(v) => set({ practiceSettingOther: v })} />
      <Field label="Years in Practice" required>
        <input className="field__control" type="number" min={0} max={70} inputMode="numeric" value={f.yearsInPractice} onChange={(e) => set({ yearsInPractice: e.target.value })} />
      </Field>
      <Chips label="Approximate Clients Treated" options={CLIENTS_TREATED} value={f.clientsTreated} onChange={(v) => set({ clientsTreated: v as string })} />
      <Chips label="Average Session Duration" options={SESSION_DURATIONS.map((m) => ({ value: m, label: `${m} mins` }))} value={f.sessionDuration} onChange={(v) => set({ sessionDuration: v as string })} />
      <Chips label="Session Formats" required options={SESSION_FORMATS} value={f.sessionFormats} onChange={(v) => set({ sessionFormats: v as string[] })} />
      <YesNo label="Weekend Consultations" value={f.weekendConsultations} onChange={(v) => set({ weekendConsultations: v })} />
      <YesNo label="Emergency Consultations" value={f.emergencyConsultations} onChange={(v) => set({ emergencyConsultations: v })} />
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
      <div className="partner-wide">
        <h3 className="partner-group-title">Clinical Expertise Matrix</h3>
        <div className="partner-matrix">
          {areas.map((area) => (
            <div key={area} className="partner-matrix__row" role="group" aria-label={area}>
              <span className="partner-matrix__area">{area}</span>
              <div className="partner-chips">
                {EXPERTISE_LEVELS.map((level) => (
                  <button key={level} type="button" className="chip chip--outline state-layer motion-press" aria-pressed={f.expertise[area] === level} onClick={() => rate(area, level)}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="partner-row partner-row--spaced">
          <div className="partner-row__cell">
            <Field label="Add another area">
              <input className="field__control" value={adding} onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArea(); } }} />
            </Field>
          </div>
          <button type="button" className="btn btn--outlined btn--md state-layer motion-press" onClick={addArea}><Plus aria-hidden="true" /> Add</button>
        </div>
      </div>
      <Chips label="Conditions You Do NOT Treat" options={[...CONDITIONS_NOT_TREATED, 'Other']} value={f.conditionsNotTreated} onChange={(v) => set({ conditionsNotTreated: v as string[] })} />
      <OtherInput show={f.conditionsNotTreated.includes('Other')} label="Other conditions" value={f.conditionsNotTreatedOther} onChange={(v) => set({ conditionsNotTreatedOther: v })} />
      <LongAnswer label="Conditions Outside Your Scope" hint="Optional" value={f.outsideScope} onChange={(v) => set({ outsideScope: v })} />
    </>
  );
}

function StepClients({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      <Chips label="Preferred Age Groups" options={AGE_GROUPS} value={f.ageGroups} onChange={(v) => set({ ageGroups: v as string[] })} />
      <Chips label="Preferred Client Types" options={CLIENT_TYPES} value={f.clientTypes} onChange={(v) => set({ clientTypes: v as string[] })} />
      <OtherInput show={f.clientTypes.includes('Other')} label="Other client types" value={f.clientTypeOther} onChange={(v) => set({ clientTypeOther: v })} />
      <Chips label="Preferred Therapy Format" options={THERAPY_FORMATS} value={f.therapyFormats} onChange={(v) => set({ therapyFormats: v as string[] })} />
      <Chips label="Preferred Case Complexity" options={CASE_COMPLEXITY} value={f.caseComplexity} onChange={(v) => set({ caseComplexity: v as string })} />
    </>
  );
}

function StepStyle({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      <Chips label="Therapeutic Approaches" options={THERAPEUTIC_APPROACHES} value={f.approaches} onChange={(v) => set({ approaches: v as string[] })} />
      <OtherInput show={f.approaches.includes('Other')} label="Other approaches" value={f.approachOther} onChange={(v) => set({ approachOther: v })} />
      <div className="partner-wide">
        <h3 className="partner-group-title">Communication Style</h3>
                {COMMUNICATION_STYLES.map((s) => (
          <label key={s.key} className="partner-slider">
            <span>{s.left}</span>
            <input type="range" min={1} max={5} step={1} value={f.communicationStyle[s.key]}
              aria-label={`${s.left} to ${s.right}`} aria-valuetext={`${f.communicationStyle[s.key]} of 5`}
              onChange={(e) => set({ communicationStyle: { ...f.communicationStyle, [s.key]: Number(e.target.value) } })} />
            <span className="partner-slider__right">{s.right}</span>
          </label>
        ))}
      </div>
      <Chips label="Homework Frequency" options={HOMEWORK_FREQUENCY} value={f.homeworkFrequency} onChange={(v) => set({ homeworkFrequency: v as string })} />
      {f.homeworkFrequency && f.homeworkFrequency !== 'Never' ? (
        <>
          <Chips label="Homework Types" options={HOMEWORK_TYPES} value={f.homeworkTypes} onChange={(v) => set({ homeworkTypes: v as string[] })} />
          <OtherInput show={f.homeworkTypes.includes('Other')} label="Other homework" value={f.homeworkTypeOther} onChange={(v) => set({ homeworkTypeOther: v })} />
        </>
      ) : null}
      <LongAnswer label="Therapeutic Philosophy" value={f.philosophy} onChange={(v) => set({ philosophy: v })} limit={PHILOSOPHY_WORD_LIMIT} hard />
    </>
  );
}

function StepCulture({ f, set }: { f: Form; set: SetForm }) {
  return (
    <>
      <Chips label="Experience Working With" options={CULTURAL_EXPERIENCE} value={f.culturalExperience} onChange={(v) => set({ culturalExperience: v as string[] })} />
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
      <div className="partner-wide">
        <h3 className="partner-group-title">Availability</h3>
        <div className="partner-week" role="grid" aria-label="Weekly availability">
          <div className="partner-week__row" role="row">
            <span role="columnheader" />
            {DAY_PARTS.map((p) => (
              <span key={p.key} role="columnheader" className="partner-week__part">{p.label}<small>{p.hours}</small></span>
            ))}
          </div>
          {WEEKDAYS.map((d) => (
            <div key={d} className="partner-week__row" role="row">
              <span role="rowheader" className="field__label partner-week__day">{d}</span>
              {DAY_PARTS.map((p) => {
                const on = (f.availability[d] || []).includes(p.key);
                return (
                  <span key={p.key} role="gridcell">
                    <button type="button" className="chip chip--lg state-layer motion-press partner-week__slot" aria-pressed={on}
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
      <h3 className="partner-wide partner-group-title">Fees</h3>
      {([['feeIndividual', 'Individual'], ['feeCouple', 'Couple'], ['feeFamily', 'Family']] as const).map(([key, label]) => (
        <Field key={key} label={label} prefix="₹">
          <input className="field__control" type="number" min={0} step={100} inputMode="numeric" value={f[key]} onChange={(e) => set({ [key]: e.target.value } as Partial<Form>)} />
        </Field>
      ))}
      <YesNo label="Sliding Scale" value={f.slidingScale} onChange={(v) => set({ slidingScale: v })} />
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
      <Field label="Introduction Video" wide hint="1–3 minutes introducing yourself and your therapeutic approach. Paste a YouTube, Vimeo or Google Drive link.">
        <input className="field__control" type="url" placeholder="https://youtube.com/…" value={f.introVideoUrl} onChange={(e) => set({ introVideoUrl: e.target.value })} />
      </Field>
      {offline ? (
        <>
          <div className="partner-wide">
            <h3 className="partner-group-title">Workspace Photos</h3>
            <p className="field__message partner-group-hint">Only for offline therapists.</p>
            <FileList files={f.workspacePhotos} onRemove={(i) => set({ workspacePhotos: f.workspacePhotos.filter((_, j) => j !== i) })} />
            <UploadButton label="Upload photos" accept="image/jpeg,image/png,image/webp" category="workspace" multiple
              onUploaded={(file) => set({ workspacePhotos: [...f.workspacePhotos, file] })} />
          </div>
          <Field label="Google Maps Link" wide hint="Only for offline therapists.">
            <input className="field__control" type="url" placeholder="https://maps.google.com/…" value={f.mapsLink} onChange={(e) => set({ mapsLink: e.target.value })} />
          </Field>
        </>
      ) : (
        <p className="field__message partner-wide">Workspace photos and a map link are asked for when you offer in-person or home-visit sessions (step 3).</p>
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

/** iKAN 2 `BottomSheet`: a scrim and a panel in the app column. Escape and the scrim close it. */
function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="sheet__scrim" aria-label="Close" onClick={onClose} />
      <div className="sheet__panel">
        <div className="sheet__handle" aria-hidden="true" />
        <p className="sheet__title">{title}</p>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}

/** "Full Name, Email and 3 more" — what the footer hint can fit on a line or two. */
function summarise(items: string[]): string {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, 2).join(', ')} and ${items.length - 2} more`;
}

interface ProfessionalApplicationProps {
  onNavigate?: (page: string) => void;
}

export function ProfessionalApplication({ onNavigate }: ProfessionalApplicationProps) {
  const [draft] = useState(loadDraft);
  const initialReached = Math.max(draft?.reached ?? 0, draft?.step ?? 0);
  // A step in the URL opens that step, capped at the furthest one reached.
  const [initialStep] = useState(() => stepFromPath(window.location.pathname));
  const [form, setForm] = useState<Form>(() => draft?.form ?? emptyPartnerForm());
  const [step, setStep] = useState(() => (typeof initialStep === 'number' ? Math.min(initialStep, initialReached) : draft?.step ?? 0));
  const [reached, setReached] = useState(initialReached);
  const [started, setStarted] = useState(() => typeof initialStep === 'number');
  const [stepsOpen, setStepsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const top = useRef<HTMLDivElement>(null);
  const set: SetForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const home = () => onNavigate?.('/');

  useEffect(() => {
    if (submitted || !started) return;
    const t = window.setTimeout(() => saveDraft(form, step, reached), 400);
    return () => window.clearTimeout(t);
  }, [form, step, reached, started, submitted]);

  // Correct the URL on arrival: an unknown slug, a step not reached yet, or a
  // stale /submitted (a confirmation does not survive a reload) all settle on
  // what is actually shown, without adding a history entry.
  useEffect(() => {
    setUrl(started ? stepPath(step) : BASE_PATH, 'replace');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back and Forward walk the steps. `reached` via a ref: the listener is bound once.
  const reachedRef = useRef(reached);
  reachedRef.current = reached;
  useEffect(() => {
    const onPop = () => {
      const at = stepFromPath(window.location.pathname);
      if (at === 'submitted') return;
      setStepsOpen(false);
      if (at === 'intro') { setStarted(false); return; }
      const next = Math.min(at, reachedRef.current);
      setStarted(true);
      setStep(next);
      if (next !== at) setUrl(stepPath(next), 'replace');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // The tab names the step, so history and bookmarks read as the wizard does.
  useEffect(() => {
    document.title = submitted ? 'Application received · iKAN Health'
      : started ? `${STEPS[step].title} · Partner application · iKAN Health`
      : 'Become an iKAN Partner · iKAN Health';
  }, [step, started, submitted]);

  const start = () => {
    setStarted(true);
    setUrl(stepPath(step), 'push');
  };

  const goTo = (next: number) => {
    setSubmitError(null);
    setStep(next);
    setReached((r) => Math.max(r, next));
    setStepsOpen(false);
    setUrl(stepPath(next), 'push');
    // Back to the top of the wizard, not the page: the site header stays put.
    const y = (top.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 96;
    if (window.scrollY > y) window.scrollTo({ top: Math.max(0, y) });
  };

  const errors = stepErrors(step, form);
  const last = step === STEPS.length - 1;
  const firstIncomplete = STEPS.findIndex((_, i) => stepErrors(i, form).length > 0);

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Its own route, not the old `/public/professional-application`: a server
      // that predates this form would accept the old path and store contact and
      // verification where the public directory reads. An old server 404s here.
      const res = await fetch(`${API}/public/partner-application`, {
        method: 'POST',
        headers: await getAuthHeaders(true),
        body: JSON.stringify(toPayload(form)),
      });
      if (res.status === 404) throw new Error("We can't receive applications just yet. Your answers are saved on this device, so please try again later.");
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to submit application');
      clearDraft();
      setSubmitted(true);
      setUrl(`${BASE_PATH}/submitted`, 'replace');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // The footer's one action. On the last step it submits, unless an earlier
  // step has gaps, in which case it takes you there (as iKAN 2's assessment
  // does with its first unanswered question).
  const primary = !last
    ? { label: 'Next', onClick: () => goTo(step + 1), disabled: errors.length > 0 }
    : firstIncomplete !== -1 && firstIncomplete !== step
      ? { label: `Finish step ${firstIncomplete + 1}`, onClick: () => goTo(firstIncomplete), disabled: false }
      : { label: submitting ? 'Submitting…' : 'Submit application', onClick: submit, disabled: errors.length > 0 || submitting };

  const root = 'ikan2-theme ikan2-type accent-calm info-page site-page-below-nav wizard';

  /* One list of steps, shown two ways: a bottom sheet behind "n of 11" below
     1024px, and a sticky rail beside the card at 1024px and up. */
  const stepList = (interactive: boolean) => (
    <ol className="select-list">
      {STEPS.map((s, i) => {
        const gaps = stepErrors(i, form).length > 0;
        const done = interactive && i < reached && !gaps;
        return (
          <li key={s.title}>
            <button type="button" className="select-row state-layer" aria-current={interactive && i === step ? 'step' : undefined}
              disabled={!interactive || i > reached} onClick={() => goTo(i)}>
              <span className={`select-row__glyph${done ? ' select-row__glyph--done' : ''}`} aria-hidden="true">
                {done ? <Check strokeWidth={3} /> : i + 1}
              </span>
              <span>{s.title}</span>
              {interactive && i <= reached && i !== step && gaps ? <span className="select-row__meta">Needs info</span> : null}
            </button>
          </li>
        );
      })}
    </ol>
  );

  // The site page's own header, as on Contact and FAQ.
  const pageHeader = (
    <section className="info-band">
      <div className="info-band__inner">
        <p className="info-eyebrow">Partner with iKAN</p>
        <h1>Become an iKAN Partner</h1>
        <p className="info-subtitle">For therapists, psychologists, psychiatrists and counsellors. Our team reviews every application, and your profile goes live once you're approved.</p>
      </div>
    </section>
  );

  if (submitted) {
    return (
      <div className={root}>
        {pageHeader}
        <div className="wizard__body wizard__body--single">
          <section className="wizard__card partner-done" aria-labelledby="partner-done-title">
            <CircleCheck className="partner-done__icon" aria-hidden="true" />
            <h2 id="partner-done-title" className="wizard__title">Application received</h2>
            <p className="partner-lede">Thank you for applying to partner with iKAN. Our team will verify your details and reply to {form.email || 'you'} within 3–5 business days.</p>
            <button type="button" className="btn btn--filled state-layer motion-press partner-done__cta" onClick={home}>Back to iKAN</button>
          </section>
        </div>
      </div>
    );
  }

  if (!started) {
    // The intro: what to have ready, what happens after, and the one action.
    // No step rail here — the steps are not yet something to navigate.
    const needs = [
      { icon: <IdCard aria-hidden="true" />, title: 'Registration details', body: 'Your degree, and your RCI, NMC or State Medical Council number' },
      { icon: <FileText aria-hidden="true" />, title: 'Scans of certificates', body: 'Your degree and registration certificate, as PDF, JPG or PNG' },
      { icon: <Camera aria-hidden="true" />, title: 'A recent headshot', body: 'Clear and well lit. It goes on your public profile' },
    ];
    const after = [
      { title: 'Apply', meta: `${STEPS.length} steps`, body: 'Tell us about your training, practice and the way you work. Only a few questions are required.' },
      { title: 'We verify', meta: '3–5 business days', body: 'Our team checks your qualifications and registration, and may call you to confirm details.' },
      { title: 'You go live', meta: 'After approval', body: 'Your profile appears to iKAN members looking for support, and they can book with you.' },
    ];
    return (
      <div className={root}>
        {pageHeader}
        <div className="wizard__body wizard__body--single">
          <section className="wizard__card partner-intro" aria-labelledby="partner-intro-title">
            {draft ? <p className="notice">Picking up where you left off, at step {draft.step + 1} of {STEPS.length}.</p> : null}

            <h2 id="partner-intro-title" className="wizard__title">Before you start</h2>
            <p className="partner-lede">Keep these to hand. You can also add documents later, before you submit.</p>
            <ul className="partner-needs">
              {needs.map((n) => (
                <li key={n.title}>
                  <span className="icon-tile">{n.icon}</span>
                  <span className="partner-needs__title">{n.title}</span>
                  <span className="field__message">{n.body}</span>
                </li>
              ))}
            </ul>

            <section className="partner-how-section" aria-labelledby="partner-how-title">
              {/* Unsplash, free licence: photo-1714976694867-bc0e012fab70 */}
              <img className="partner-how__photo" loading="lazy" decoding="async"
                src="https://images.unsplash.com/photo-1714976694867-bc0e012fab70?auto=format&fit=crop&w=900&q=80"
                srcSet="https://images.unsplash.com/photo-1714976694867-bc0e012fab70?auto=format&fit=crop&w=600&q=80 600w, https://images.unsplash.com/photo-1714976694867-bc0e012fab70?auto=format&fit=crop&w=900&q=80 900w, https://images.unsplash.com/photo-1714976694867-bc0e012fab70?auto=format&fit=crop&w=1200&q=80 1200w"
                sizes="(min-width: 640px) 18rem, 100vw"
                alt="A counsellor in conversation with a client on a sofa, in a bright consulting room" />
              <div>
                <h3 id="partner-how-title" className="partner-how-title">How it works</h3>
                <ol className="partner-how">
                  {after.map((a, i) => (
                    <li key={a.title}>
                      <span className="partner-how__num" aria-hidden="true">{i + 1}</span>
                      <div className="partner-how__text">
                        <p className="partner-how__title">{a.title} <span className="partner-how__meta">{a.meta}</span></p>
                        <p className="field__message">{a.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <div className="wizard__footer">
              <div className="flow-footer__actions partner-intro__actions">
                <p className="field__message">Your answers save on this device as you go.</p>
                <button type="button" className="btn btn--filled state-layer motion-press" onClick={start}>
                  {draft ? 'Continue application' : 'Start application'}
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const Body = STEP_BODIES[step];

  return (
    <div className={root}>
      {pageHeader}

      <div className="wizard__body" ref={top}>
        <aside className="wizard__rail">
          <nav aria-label="Application steps">
            <p className="field__label">Step {step + 1} of {STEPS.length}</p>
            {stepList(true)}
          </nav>
        </aside>

        <section className="wizard__card" aria-labelledby="partner-step-title">
          <div className="wizard__progress">
            <button type="button" className="btn btn--text btn--md state-layer wizard__count" aria-haspopup="dialog"
              aria-label={`Step ${step + 1} of ${STEPS.length}. Show all steps`} onClick={() => setStepsOpen(true)}>
              <span aria-live="polite">Step {step + 1} of {STEPS.length}</span>
              <ChevronDown aria-hidden="true" />
            </button>
            <div className="linear-progress" role="progressbar" aria-label="Application progress"
              aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(((step + 1) / STEPS.length) * 100)}>
              <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>

          <form key={step} className="partner-form animate-step" noValidate onSubmit={(e) => { e.preventDefault(); if (!primary.disabled) primary.onClick(); }}>
            <div className="partner-wide">
              <h2 id="partner-step-title" className="wizard__title">{STEPS[step].title}</h2>
              {STEPS[step].hint ? <p className="field__message">{STEPS[step].hint}</p> : null}
            </div>
            <Body f={form} set={set} />
            {submitError ? <p className="form-error partner-wide" role="alert">{submitError}</p> : null}
            {/* Enter in a field moves on, as in iKAN 2's flows. */}
            <button type="submit" hidden tabIndex={-1} aria-label={primary.label} />
          </form>

          <div className="wizard__footer">
            {primary.disabled && errors.length ? (
              <p className="flow-footer__hint" role="status">Still needed: {summarise(errors)}</p>
            ) : null}
            <div className="flow-footer__actions">
              <button type="button" className="btn btn--outlined btn--icon state-layer motion-press partner-back"
                aria-label="Previous step" disabled={step === 0} onClick={() => goTo(step - 1)}>
                <ArrowLeft aria-hidden="true" />
              </button>
              <button type="button" className="btn btn--filled state-layer motion-press" disabled={primary.disabled}
                aria-busy={submitting || undefined} onClick={primary.onClick}>
                {submitting ? <span className="btn__spinner" aria-hidden="true" /> : null}
                {primary.label}
                {!last ? <ArrowRight aria-hidden="true" /> : null}
              </button>
            </div>
          </div>
        </section>
      </div>

      <Sheet open={stepsOpen} onClose={() => setStepsOpen(false)} title="All steps">
        {stepList(true)}
      </Sheet>
    </div>
  );
}
