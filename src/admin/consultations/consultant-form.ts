import type { Dispatch, SetStateAction } from 'react';
import type { ValidationSchema } from '../ui/hooks/useFormValidation';
import { validateUrl } from '../ui/lib/validation';

// ── Consultant Interface ───────────────────────────────────────────
export interface Consultant {
  id: string;
  name: string;
  credentials: string;
  category: string;
  expertises: string[];
  available: boolean;
  location: string;
  yearsExperience: number;
  photo: string;
  bio: string;
  sessionModes: ('online' | 'call' | 'chat')[];
  pricing: {
    video: number;
    call: number;
    chat: number;
  };
  rating: number;
  languages: string[];
  therapeuticApproaches: string[];
  qualifications: string[];
  clientFAQs: { question: string; answer: string }[];
  demographicSpecialties: string[];
  availabilityPreferences: {
    workingHours: string;
    daysAvailable: string[];
    weekendAvailability: boolean;
  };
  willingToShareArticles: boolean;
  therapeuticPhilosophy: string;
  testimonials: { text: string; clientName: string }[];
  videoIntroUrl: string;
  certificates: string[];
  published?: boolean;
  created_at?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type ConsultantForm = Partial<Consultant>;

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const EMPTY_AVAILABILITY: Consultant['availabilityPreferences'] = {
  workingHours: '',
  daysAvailable: [],
  weekendAvailability: false,
};

export const EMPTY_CONSULTANT: ConsultantForm = {
  name: '',
  credentials: '',
  category: 'therapist',
  expertises: [],
  available: true,
  location: '',
  yearsExperience: 0,
  photo: '',
  bio: '',
  sessionModes: [],
  pricing: { video: 0, call: 0, chat: 0 },
  rating: 5.0,
  languages: [],
  therapeuticApproaches: [],
  qualifications: [],
  clientFAQs: [],
  demographicSpecialties: [],
  availabilityPreferences: EMPTY_AVAILABILITY,
  willingToShareArticles: false,
  therapeuticPhilosophy: '',
  testimonials: [],
  videoIntroUrl: '',
  certificates: [],
};

export const CONSULTANT_SCHEMA: ValidationSchema = {
  name: { required: true, minLength: 2, message: 'Name must be at least 2 characters' },
  credentials: { required: true, minLength: 2, message: 'Credentials are required' },
  location: { required: true, minLength: 2, message: 'Location is required' },
  yearsExperience: {
    required: true,
    validate: (value: unknown) => { const num = parseInt(String(value)); return num >= 0 && num <= 60; },
    message: 'Years of experience must be between 0 and 60',
  },
  bio: { required: true, minLength: 20, message: 'Bio must be at least 20 characters' },
  photo: { validate: (value: unknown) => !value || !validateUrl(String(value)), message: 'Photo must be a valid URL' },
};

/** Fill the list/object fields a stored record may be missing. */
export function withConsultantDefaults(prev: ConsultantForm, data: ConsultantForm): ConsultantForm {
  return {
    ...prev,
    ...data,
    languages: data.languages || [],
    therapeuticApproaches: data.therapeuticApproaches || [],
    qualifications: data.qualifications || [],
    clientFAQs: data.clientFAQs || [],
    demographicSpecialties: data.demographicSpecialties || [],
    availabilityPreferences: data.availabilityPreferences || EMPTY_AVAILABILITY,
    willingToShareArticles: data.willingToShareArticles || false,
    therapeuticPhilosophy: data.therapeuticPhilosophy || '',
    testimonials: data.testimonials || [],
    videoIntroUrl: data.videoIntroUrl || '',
    certificates: data.certificates || [],
  };
}

/** What the API stores, incl. the field names ConsultantCard / ConsultantDetail read. */
export function toProfessionalPayload(formData: ConsultantForm, publish?: boolean) {
  return {
    ...formData,
    expertises: formData.expertises || [],
    topExpertises: (formData.expertises || []).slice(0, 3),
    available: formData.available || false,
    published: publish !== undefined ? publish : formData.published,
    approaches: formData.therapeuticApproaches || [],
    concernsICanHelp: formData.expertises || [],
    faqs: (formData.clientFAQs || []).map(faq => ({ q: faq.question, a: faq.answer })),
  };
}

export interface ConsultantSectionProps {
  formData: ConsultantForm;
  setFormData: Dispatch<SetStateAction<ConsultantForm>>;
  errors: Record<string, string | undefined>;
  toggleArray: (field: keyof Consultant, value: string) => void;
}

/** Input height/radius shared by every text field on the form. */
export const FIELD = 'h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)]';
export const AREA = 'rounded-[var(--ikan-component-border-radius)]';
export const CHECK_LABEL = 'cursor-pointer flex-1 text-sm';
export const GROUP_LABEL = 'mb-3 block font-medium';
export const COUNT_BADGE = 'bg-[var(--color-accent-default)] text-[var(--color-text-primary)] font-medium';
