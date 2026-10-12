/**
 * The partner application, as data.
 *
 * Source: "I-Kan Therapist Onboarding Form – Version 3 (Developer Draft)" in
 * the iKAN Notion space (Sachin Vaishampayan, 2026-07-29). Option lists are the
 * spec's own, in its order. Two things are added that the spec lacks:
 *
 *   - email and phone. Without them an admin cannot reply to an applicant.
 *   - an "Add another" row on the expertise matrix, because the spec's row list
 *     ends in "etc."
 *
 * "Partner" is the umbrella word; a therapist is one type of partner. Internal
 * names (`professional_application:`, the admin routes) predate that and stay.
 *
 * The spec's developer note "keep verification fields separate from the public
 * profile" is the shape of `PartnerApplicationPayload`: contact and verification
 * travel in their own objects and the server never copies them onto the record
 * that becomes the public profile.
 */

export const PROFESSIONAL_TITLES = [
  'Clinical Psychologist',
  'Counselling Psychologist',
  'Psychiatrist',
  'Psychotherapist',
  'Counsellor',
  'Other',
] as const;

/** The directory's existing `category` vocabulary (consultant: rows use these). */
export function categoryForTitle(title: string): string {
  if (title === 'Psychiatrist') return 'psychiatrist';
  if (title === 'Counsellor') return 'counselor';
  return 'therapist';
}

/**
 * Each language is shown in its own script, which is how a speaker looks for
 * it. `value` is the English name that is stored, so the directory's language
 * filter keeps one spelling; `lang` and `dir` let a screen reader pronounce
 * the label and lay Urdu out right to left.
 */
export const LANGUAGES = [
  { value: 'English', native: 'English', lang: 'en' },
  { value: 'Hindi', native: 'हिन्दी', lang: 'hi' },
  { value: 'Marathi', native: 'मराठी', lang: 'mr' },
  { value: 'Gujarati', native: 'ગુજરાતી', lang: 'gu' },
  { value: 'Bengali', native: 'বাংলা', lang: 'bn' },
  { value: 'Tamil', native: 'தமிழ்', lang: 'ta' },
  { value: 'Telugu', native: 'తెలుగు', lang: 'te' },
  { value: 'Kannada', native: 'ಕನ್ನಡ', lang: 'kn' },
  { value: 'Malayalam', native: 'മലയാളം', lang: 'ml' },
  { value: 'Punjabi', native: 'ਪੰਜਾਬੀ', lang: 'pa' },
  { value: 'Urdu', native: 'اردو', lang: 'ur', dir: 'rtl' },
  { value: 'Odia', native: 'ଓଡ଼ିଆ', lang: 'or' },
] as const;

/**
 * Country codes, from iKAN 2's `components/phone-field.tsx`. A phone is stored
 * as "+91 9876543210": the dial code, a space, the last ten digits.
 */
export const COUNTRIES = [
  { code: 'IN', flag: '🇮🇳', dial: '+91', name: 'India' },
  { code: 'AE', flag: '🇦🇪', dial: '+971', name: 'United Arab Emirates' },
  { code: 'US', flag: '🇺🇸', dial: '+1', name: 'United States' },
  { code: 'GB', flag: '🇬🇧', dial: '+44', name: 'United Kingdom' },
  { code: 'CA', flag: '🇨🇦', dial: '+1', name: 'Canada' },
  { code: 'AU', flag: '🇦🇺', dial: '+61', name: 'Australia' },
  { code: 'SG', flag: '🇸🇬', dial: '+65', name: 'Singapore' },
  { code: 'SA', flag: '🇸🇦', dial: '+966', name: 'Saudi Arabia' },
  { code: 'QA', flag: '🇶🇦', dial: '+974', name: 'Qatar' },
  { code: 'DE', flag: '🇩🇪', dial: '+49', name: 'Germany' },
  { code: 'NP', flag: '🇳🇵', dial: '+977', name: 'Nepal' },
  { code: 'BD', flag: '🇧🇩', dial: '+880', name: 'Bangladesh' },
  { code: 'LK', flag: '🇱🇰', dial: '+94', name: 'Sri Lanka' },
] as const;
export type Country = (typeof COUNTRIES)[number];

/** "+91 98765 43210", "9876543210" → the country and the last ten digits. */
export function parsePhone(value: string): { country: Country; number: string } {
  const v = value.replace(/\s/g, '');
  const byDial = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => v.startsWith(c.dial));
  const digits = (byDial ? v.slice(byDial.dial.length) : v).replace(/\D/g, '');
  return { country: byDial ?? COUNTRIES[0], number: digits.slice(-10) };
}

export const formatPhone = (country: Country, number: string) => (number ? `${country.dial} ${number}` : '');

// ── PIN code ──────────────────────────────────────────────────────────────────

/** An Indian PIN: six digits, never starting with 0. */
export const PIN_PATTERN = /^[1-9][0-9]{5}$/;

export interface PinLookup { district: string; state: string; localities: string[] }

/** The state name as our list spells it ("&" → "and", case-insensitive), or ''. */
export function matchState(name: string): string {
  const norm = (x: string) => x.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ').trim();
  return INDIAN_STATES.find((s) => norm(s) === norm(name)) ?? '';
}

/**
 * India Post's public PIN directory (api.postalpincode.in): free, no key, CORS
 * open. Returns null for a PIN it does not know; throws when it cannot be
 * reached, so the caller can tell "wrong PIN" from "lookup down".
 */
export async function lookupPin(pin: string, signal?: AbortSignal): Promise<PinLookup | null> {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal });
  if (!res.ok) throw new Error(`PIN lookup failed (${res.status})`);
  const [result] = await res.json();
  const offices: { Name: string; District: string; State: string }[] = result?.PostOffice ?? [];
  if (result?.Status !== 'Success' || offices.length === 0) return null;
  return {
    district: offices[0].District,
    state: matchState(offices[0].State),
    localities: offices.map((o) => o.Name),
  };
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

export const HIGHEST_QUALIFICATIONS = [
  'M.A. / M.Sc. Psychology',
  'M.Phil. Clinical Psychology',
  'PsyD',
  'PhD',
  'MD Psychiatry',
  'Diploma',
  'Other',
] as const;

export const REGISTRATIONS = [
  'RCI',
  'NMC',
  'State Medical Council',
  'Other',
  'Not Applicable',
] as const;

export const DOCUMENT_KINDS = ['Degree', 'Registration Certificate', 'Certification'] as const;

export const PRACTICE_SETTINGS = [
  'Private Practice', 'Hospital', 'Clinic', 'NGO', 'Telehealth', 'Research', 'Trainee', 'Other',
] as const;

export const CLIENTS_TREATED = ['0–50', '51–200', '201–500', '501–1000', '1000+'] as const;

export const SESSION_DURATIONS = ['45', '50', '60', '75', '90'] as const;

export const SESSION_FORMATS = ['Online', 'In-person', 'Home Visit'] as const;

/** Formats that mean the partner sees clients somewhere physical. */
export function isOffline(formats: string[]): boolean {
  return formats.includes('In-person') || formats.includes('Home Visit');
}

export const EXPERTISE_AREAS = [
  'Anxiety', 'Depression', 'OCD', 'PTSD', 'Trauma', 'ADHD', 'Autism', 'Addiction',
  'Relationships', 'Parenting', 'Sleep', 'Burnout', 'Grief',
] as const;

export const EXPERTISE_LEVELS = ['Expert', 'Advanced', 'Comfortable', 'Limited'] as const;
export type ExpertiseLevel = (typeof EXPERTISE_LEVELS)[number];

export const CONDITIONS_NOT_TREATED = [
  'Psychosis / Schizophrenia', 'Bipolar Disorder', 'Eating Disorders',
  'Personality Disorders', 'Substance Dependence', 'Active Suicidality',
  'Severe Self-harm', 'Forensic / Court-mandated', 'Dementia',
] as const;

export const AGE_GROUPS = ['Children', 'Adolescents', 'Young Adults', 'Adults', 'Older Adults'] as const;

export const CLIENT_TYPES = [
  'Students', 'Professionals', 'Couples', 'Parents', 'Caregivers', 'Senior Citizens', 'Entrepreneurs', 'Other',
] as const;

export const THERAPY_FORMATS = ['Individual', 'Couple', 'Family', 'Group'] as const;

export const CASE_COMPLEXITY = ['Mild', 'Moderate', 'Severe (Non-crisis)'] as const;

export const THERAPEUTIC_APPROACHES = [
  'CBT', 'REBT', 'ACT', 'DBT', 'Psychodynamic', 'Humanistic', 'Narrative',
  'Solution Focused', 'Mindfulness', 'EMDR', 'Integrative', 'Other',
] as const;

/** Five-point sliders. 1 = the left pole, 5 = the right. */
export const COMMUNICATION_STYLES = [
  { key: 'warmDirect', left: 'Warm', right: 'Direct' },
  { key: 'structuredFlexible', left: 'Structured', right: 'Flexible' },
  { key: 'reflectiveAction', left: 'Reflective', right: 'Action-oriented' },
  { key: 'supportiveChallenging', left: 'Supportive', right: 'Challenging' },
  { key: 'listenerInteractive', left: 'Listener', right: 'Interactive' },
] as const;
export type CommunicationStyleKey = (typeof COMMUNICATION_STYLES)[number]['key'];

export const HOMEWORK_FREQUENCY = ['Every Session', 'Frequently', 'Occasionally', 'Rarely', 'Never'] as const;

export const HOMEWORK_TYPES = [
  'Worksheets', 'Journaling', 'Reading', 'Behavioural Experiments', 'Meditation',
  'Goal Setting', 'Habit Tracking', 'Other',
] as const;

export const CULTURAL_EXPERIENCE = [
  'LGBTQIA+', 'Neurodivergent Clients', 'Disabilities', 'Chronic Illness',
  'Corporate Professionals', 'Students', 'Caregivers', 'Elderly',
  'Rural Communities', 'Interfaith Families', 'Others',
] as const;

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const DAY_NAMES: Record<(typeof WEEKDAYS)[number], string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};
export const DAY_PARTS = [
  { key: 'morning', label: 'Morning', hours: '8am–12pm' },
  { key: 'afternoon', label: 'Afternoon', hours: '12–4pm' },
  { key: 'evening', label: 'Evening', hours: '4–8pm' },
  { key: 'night', label: 'Night', hours: '8–10pm' },
] as const;

export const CONTRIBUTION_TYPES = [
  'Publication', 'Book', 'Workshop', 'Seminar', 'Conference', 'Guest Lecture',
  'Podcast', 'Blog', 'Media', 'YouTube', 'Social Media', 'Award',
] as const;

/** Step 11's prompts. Each is a long answer, 250–300 words recommended. */
export const PROFILE_PROMPTS = [
  { key: 'bio', label: 'Professional Bio', required: true },
  { key: 'whyClientsEnjoy', label: 'Why clients enjoy working with me' },
  { key: 'idealClient', label: 'My ideal client' },
  { key: 'uniqueApproach', label: 'What makes my approach unique' },
  { key: 'firstSession', label: 'What happens in the first session?' },
  { key: 'clientExpectations', label: 'What do I expect from clients?' },
  { key: 'faqs', label: 'FAQs' },
  { key: 'testimonials', label: 'Testimonials (Optional)' },
] as const;
export type ProfilePromptKey = (typeof PROFILE_PROMPTS)[number]['key'];

export const PROFILE_WORD_LIMIT = 300;
export const PHILOSOPHY_WORD_LIMIT = 300;

// ── State ─────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  /** Storage path in the private bucket. The URL below expires in 24h; this does not. */
  path: string;
  url: string;
  name: string;
}

export interface DegreeRow { degree: string; institution: string; year: string }
export interface CertificationRow { certification: string; issuer: string; year: string }
export interface DocumentRow extends UploadedFile { kind: string }
export interface ContributionRow { type: string; title: string; year: string; link: string }

export interface PartnerApplicationForm {
  // 1 — basic information
  name: string;
  email: string;
  phone: string;
  professionalTitle: string;
  professionalTitleOther: string;
  languages: string[];
  languagesOther: string;
  pincode: string;
  city: string;
  state: string;
  headshot: UploadedFile | null;
  // 2 — qualifications & verification
  highestQualification: string;
  highestQualificationOther: string;
  degrees: DegreeRow[];
  registration: string;
  registrationOther: string;
  registrationNumber: string;
  certifications: CertificationRow[];
  documents: DocumentRow[];
  hasMastersDegree: '' | 'yes' | 'no';
  supervisedHours: string;
  underSupervision: '' | 'yes' | 'no';
  // 3 — practice information
  practiceSettings: string[];
  practiceSettingOther: string;
  yearsInPractice: string;
  clientsTreated: string;
  sessionDuration: string;
  sessionFormats: string[];
  weekendConsultations: '' | 'yes' | 'no';
  emergencyConsultations: '' | 'yes' | 'no';
  // 4 — clinical expertise
  expertise: Record<string, ExpertiseLevel | ''>;
  customExpertiseAreas: string[];
  conditionsNotTreated: string[];
  conditionsNotTreatedOther: string;
  outsideScope: string;
  // 5 — client preferences
  ageGroups: string[];
  clientTypes: string[];
  clientTypeOther: string;
  therapyFormats: string[];
  caseComplexity: string;
  // 6 — therapy style
  approaches: string[];
  approachOther: string;
  communicationStyle: Record<CommunicationStyleKey, number>;
  homeworkFrequency: string;
  homeworkTypes: string[];
  homeworkTypeOther: string;
  philosophy: string;
  // 7 — cultural competence
  culturalExperience: string[];
  culturalExperienceOther: string;
  // 8 — availability & fees
  availability: Record<string, string[]>; // day → day-part keys
  feeIndividual: string;
  feeCouple: string;
  feeFamily: string;
  slidingScale: '' | 'yes' | 'no';
  // 9 — contributions
  contributions: ContributionRow[];
  // 10 — media
  introVideoUrl: string;
  workspacePhotos: UploadedFile[];
  mapsLink: string;
  // 11 — public profile
  profile: Record<ProfilePromptKey, string>;
}

export function emptyPartnerForm(): PartnerApplicationForm {
  return {
    name: '', email: '', phone: '', professionalTitle: '', professionalTitleOther: '',
    languages: [], languagesOther: '', pincode: '', city: '', state: '', headshot: null,
    highestQualification: '', highestQualificationOther: '',
    degrees: [{ degree: '', institution: '', year: '' }],
    registration: '', registrationOther: '', registrationNumber: '',
    certifications: [], documents: [],
    hasMastersDegree: '', supervisedHours: '', underSupervision: '',
    practiceSettings: [], practiceSettingOther: '', yearsInPractice: '', clientsTreated: '',
    sessionDuration: '', sessionFormats: [], weekendConsultations: '', emergencyConsultations: '',
    expertise: {}, customExpertiseAreas: [], conditionsNotTreated: [], conditionsNotTreatedOther: '', outsideScope: '',
    ageGroups: [], clientTypes: [], clientTypeOther: '', therapyFormats: [], caseComplexity: '',
    approaches: [], approachOther: '',
    communicationStyle: { warmDirect: 3, structuredFlexible: 3, reflectiveAction: 3, supportiveChallenging: 3, listenerInteractive: 3 },
    homeworkFrequency: '', homeworkTypes: [], homeworkTypeOther: '', philosophy: '',
    culturalExperience: [], culturalExperienceOther: '',
    availability: {}, feeIndividual: '', feeCouple: '', feeFamily: '', slidingScale: '',
    contributions: [],
    introVideoUrl: '', workspacePhotos: [], mapsLink: '',
    profile: {
      bio: '', whyClientsEnjoy: '', idealClient: '', uniqueApproach: '',
      firstSession: '', clientExpectations: '', faqs: '', testimonials: '',
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** A list of chosen options, with the "Other" option replaced by what was typed. */
export function withOther(chosen: string[], otherLabel: string, typed: string): string[] {
  const rest = chosen.filter((c) => c !== otherLabel);
  return chosen.includes(otherLabel) && typed.trim() ? [...rest, typed.trim()] : rest;
}

function pick(value: string, other: string): string {
  return value === 'Other' ? other.trim() || 'Other' : value;
}

export function needsRegistrationNumber(registration: string): boolean {
  return !!registration && registration !== 'Not Applicable';
}

const LEVEL_RANK: Record<ExpertiseLevel, number> = { Expert: 0, Advanced: 1, Comfortable: 2, Limited: 3 };

// ── Validation ────────────────────────────────────────────────────────────────

/** Required fields per step. Everything else is optional: the spec asks for low effort. */
export function stepErrors(step: number, f: PartnerApplicationForm): string[] {
  const e: string[] = [];
  if (step === 0) {
    if (!f.name.trim()) e.push('Full Name');
    if (!EMAIL_PATTERN.test(f.email.trim())) e.push('Email');
    if (parsePhone(f.phone).number.length < 10) e.push('Phone (10 digits)');
    if (!f.professionalTitle) e.push('Professional Title');
    if (withOther(f.languages, 'Other', f.languagesOther).length === 0) e.push('Language(s)');
    if (!PIN_PATTERN.test(f.pincode)) e.push('PIN code');
    if (!f.city.trim()) e.push('City');
    if (!f.state) e.push('State');
  }
  if (step === 1) {
    if (!f.highestQualification) e.push('Highest Qualification');
    if (!f.registration) e.push('Professional Registration');
    if (needsRegistrationNumber(f.registration) && !f.registrationNumber.trim()) e.push('Registration Number');
  }
  if (step === 2) {
    if (f.yearsInPractice === '') e.push('Years in Practice');
    if (f.sessionFormats.length === 0) e.push('Session Formats');
  }
  if (step === 10) {
    if (!f.profile.bio.trim()) e.push('Professional Bio');
  }
  if (step === 5 && wordCount(f.philosophy) > PHILOSOPHY_WORD_LIMIT) e.push(`Therapeutic Philosophy within ${PHILOSOPHY_WORD_LIMIT} words`);
  return e;
}

// ── Payload ───────────────────────────────────────────────────────────────────

/**
 * Three objects, never merged:
 *   contact      — admin only. How to reach the applicant.
 *   verification — admin only. Registration, documents, the screening answers.
 *   profile      — what becomes the public listing once approved. Carries the
 *                  directory's existing field names so approval and the
 *                  directory keep working unchanged, plus `details` for the rest.
 */
export function toPayload(f: PartnerApplicationForm) {
  const title = pick(f.professionalTitle, f.professionalTitleOther);
  const qualification = pick(f.highestQualification, f.highestQualificationOther);
  const offline = isOffline(f.sessionFormats);
  const areas = [...EXPERTISE_AREAS, ...f.customExpertiseAreas.filter((a) => a.trim())];
  const rated = areas
    .filter((a) => f.expertise[a])
    .map((a) => ({ area: a, level: f.expertise[a] as ExpertiseLevel }));
  const languages = withOther(f.languages, 'Other', f.languagesOther);
  const approaches = withOther(f.approaches, 'Other', f.approachOther);
  const days = WEEKDAYS.filter((d) => (f.availability[d] || []).length > 0);
  const degrees = f.degrees.filter((d) => d.degree.trim());
  const yes = (v: string) => (v === '' ? null : v === 'yes');
  const fee = (v: string) => (v === '' ? null : Math.max(0, Number(v) || 0));

  return {
    contact: {
      email: f.email.trim().toLowerCase(),
      phone: f.phone.trim(),
    },
    verification: {
      highestQualification: qualification,
      degrees,
      registration: pick(f.registration, f.registrationOther),
      registrationNumber: needsRegistrationNumber(f.registration) ? f.registrationNumber.trim() : '',
      certifications: f.certifications.filter((c) => c.certification.trim()),
      documents: f.documents,
      hasMastersDegree: yes(f.hasMastersDegree),
      supervisedHours: f.supervisedHours === '' ? null : Number(f.supervisedHours) || 0,
      underSupervision: yes(f.underSupervision),
    },
    profile: {
      name: f.name.trim(),
      credentials: [title, qualification].filter(Boolean).join(', '),
      category: categoryForTitle(f.professionalTitle),
      yearsExperience: Number(f.yearsInPractice) || 0,
      location: [f.city.trim(), f.state].filter(Boolean).join(', '),
      bio: f.profile.bio.trim(),
      photo: f.headshot?.url || '',
      photoPath: f.headshot?.path || '',
      languages,
      expertises: rated
        .filter((r) => r.level !== 'Limited')
        .sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level])
        .map((r) => r.area),
      therapeuticApproaches: approaches,
      qualifications: degrees.map((d) => [d.degree, d.institution, d.year].filter((x) => x.trim()).join(', ')),
      demographicSpecialties: f.ageGroups,
      therapeuticPhilosophy: f.philosophy.trim(),
      sessionModes: f.sessionFormats,
      videoIntroUrl: f.introVideoUrl.trim(),
      availabilityPreferences: {
        daysAvailable: days.map((d) => DAY_NAMES[d]),
        weekendAvailability: f.weekendConsultations === 'yes',
        workingHours: '',
      },
      pricing: { individual: fee(f.feeIndividual), couple: fee(f.feeCouple), family: fee(f.feeFamily) },
      details: {
        professionalTitle: title,
        city: f.city.trim(),
        state: f.state,
        pincode: f.pincode,
        practiceSettings: withOther(f.practiceSettings, 'Other', f.practiceSettingOther),
        clientsTreated: f.clientsTreated,
        sessionDurationMinutes: f.sessionDuration ? Number(f.sessionDuration) : null,
        weekendConsultations: yes(f.weekendConsultations),
        emergencyConsultations: yes(f.emergencyConsultations),
        expertiseMatrix: rated,
        conditionsNotTreated: withOther(f.conditionsNotTreated, 'Other', f.conditionsNotTreatedOther),
        outsideScope: f.outsideScope.trim(),
        ageGroups: f.ageGroups,
        clientTypes: withOther(f.clientTypes, 'Other', f.clientTypeOther),
        therapyFormats: f.therapyFormats,
        caseComplexity: f.caseComplexity,
        communicationStyle: f.communicationStyle,
        homeworkFrequency: f.homeworkFrequency,
        homeworkTypes: withOther(f.homeworkTypes, 'Other', f.homeworkTypeOther),
        culturalExperience: withOther(f.culturalExperience, 'Others', f.culturalExperienceOther),
        availability: Object.fromEntries(days.map((d) => [d, f.availability[d]])),
        slidingScale: yes(f.slidingScale),
        contributions: f.contributions.filter((c) => c.title.trim()),
        workspacePhotos: offline ? f.workspacePhotos : [],
        mapsLink: offline ? f.mapsLink.trim() : '',
        profileAnswers: Object.fromEntries(PROFILE_PROMPTS.map((p) => [p.key, f.profile[p.key].trim()])),
      },
    },
  };
}

export type PartnerApplicationPayload = ReturnType<typeof toPayload>;
