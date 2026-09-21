/**
 * The public catalogue, frozen at build time.
 *
 * ikanhealth.in serves static pages only. The assessment, equip and
 * consultation pages read from the JSON under ../data/, which
 * `node scripts/snapshot-site-data.mjs` writes from the public API — trimmed
 * to exactly the fields declared below. Nothing here fetches.
 *
 * Adding a field: add it to the type here AND to the matching pick in the
 * snapshot script, then re-run the script.
 */
import assessmentsFile from './data/assessments.json';
import programsFile from './data/equip-programs.json';
import consultantsFile from './data/consultants.json';

type Html = string;

export interface SiteAssessment {
  id: string;
  assessment_id?: string;
  slug?: string;
  title: string;
  description?: string;
  category?: string;
  published?: boolean;
  /** Authored minutes. */
  duration?: number;
  difficulty?: string;
  cta_button_text?: string;
  thumbnail?: string;
  hero_image?: string;
  image_url?: string;
  thumbnail_url?: string;
  cover_image?: string;
  section1_title?: string;
  section1_eligibility_title?: string;
  section1_eligibility_points?: string[];
  section1_who_title?: string;
  section1_who_content?: string;
  section2_title?: string;
  about_title?: string;
  section2_content?: string;
  about_content?: string;
  section2_image?: string;
  about_image?: string;
  section2_bullets?: string[];
  section3_title?: string;
  highlights_title?: string;
  section3_subtitle?: string;
  section3_content?: string[];
  highlights?: string[];
  section4_notes_title?: string;
  notes_title?: string;
  section4_notes?: (string | { title: string; description?: string })[];
  notes?: (string | { title: string; description?: string })[];
  /** `questions.length` at snapshot time. The questions themselves stay in the app. */
  questionCount: number | null;
  metadata?: {
    category?: string;
    thumbnail?: string;
    hero_image?: string;
    image?: string;
    important_note_1?: string;
    important_note_2?: string;
    tile4_content?: Html;
    tile5_content?: Html;
  };
}

export interface SiteProgram {
  id: string;
  equip_id?: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  short_description?: string;
  summary?: string;
  category?: string;
  published?: boolean;
  is_paid?: boolean;
  /** Minor units (paise). */
  price?: number;
  currency?: string;
  cta_button_text?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  hero_image?: string;
  image_url?: string;
  cover_image?: string;
  image?: string;
  /** `daily_content.length` at snapshot time. The day content stays in the app. */
  dayCount: number | null;
  /** Activities across all days at snapshot time. */
  activityCount: number | null;
  metadata?: {
    hero_image?: string;
    cover_image?: string;
    image?: string;
    thumbnail?: string;
    tile1_content?: string;
    tile2_content?: string;
    tile3_content?: string;
    tile4_content?: string;
    eligibility_intro?: string;
    eligibility_point_1?: string;
    eligibility_point_2?: string;
    eligibility_point_3?: string;
    eligibility_point_4?: string;
    right_column_items?: string;
    how_it_works_subtitle?: string;
    how_it_works_footer?: string;
  };
}

export interface SiteConsultant {
  name: string;
  credentials: string;
  category: string;
  photo: string;
  yearsExperience: number;
  languages: string[];
  location: string;
  sessionModes: ('online' | 'offline' | 'call' | 'chat')[];
  expertises: string[];
  topExpertises: string[];
  pricing: { video: number; call: number; chat: number; offline?: number };
  nextAvailableSlot: string;
  rating: number;
  reviewCount: number;
  bio: string;
  available: boolean;
}

interface Snapshot<T> { snapshotAt: string; rows: T[] }

const assessments = (assessmentsFile as unknown as Snapshot<SiteAssessment>).rows;
const programs = (programsFile as unknown as Snapshot<SiteProgram>).rows;
const consultants = (consultantsFile as unknown as Snapshot<SiteConsultant>).rows;

/** When the catalogue was frozen (ISO). */
export const catalogSnapshotAt = (assessmentsFile as unknown as Snapshot<unknown>).snapshotAt;

export function getAssessments(): SiteAssessment[] {
  return assessments;
}

/** By id, assessment_id or slug — the route passes whichever the URL carried. */
export function getAssessment(idOrSlug: string | null | undefined): SiteAssessment | null {
  if (!idOrSlug) return null;
  return assessments.find(a => a.id === idOrSlug || a.assessment_id === idOrSlug || a.slug === idOrSlug) ?? null;
}

/** Published programmes only, the same safety net the app listing applies. */
export function getPrograms(): SiteProgram[] {
  return programs.filter(p => p.published === true);
}

export function getProgram(idOrSlug: string | null | undefined): SiteProgram | null {
  if (!idOrSlug) return null;
  return getPrograms().find(p => p.id === idOrSlug || p.equip_id === idOrSlug || p.slug === idOrSlug) ?? null;
}

export function getConsultants(): SiteConsultant[] {
  return consultants;
}
