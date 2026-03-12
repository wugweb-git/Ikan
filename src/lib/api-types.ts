/**
 * Shared TypeScript types for the iKan API layer.
 * Replaces `any` usage in api-client.ts with strict interfaces.
 */

// ─── Request Options ─────────────────────────────────────────────

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

// ─── CMS / Pages ─────────────────────────────────────────────────

export interface PageData {
  title: string;
  slug: string;
  content: string;
  status?: 'draft' | 'published';
  meta_title?: string;
  meta_description?: string;
  [key: string]: unknown;
}

// ─── User / Profile ──────────────────────────────────────────────

export interface UserPreferences {
  notifications?: boolean;
  darkMode?: boolean;
  language?: string;
  [key: string]: unknown;
}

export interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  corporate_user: boolean;
  is_admin?: boolean;
  avatar_url?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  preferences?: UserPreferences;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  [key: string]: unknown;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  preferences?: UserPreferences;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  privacy_settings?: PrivacySettings;
  [key: string]: unknown;
}

export interface PrivacySettings {
  shareData?: boolean;
  analytics?: boolean;
  [key: string]: unknown;
}

// ─── Admin User Management ───────────────────────────────────────

export interface AdminUserData {
  email: string;
  name: string;
  phone?: string;
  role?: string;
  corporate_user?: boolean;
  [key: string]: unknown;
}

// ─── Professionals / Consultants ─────────────────────────────────

export interface ProfessionalData {
  name: string;
  specialization?: string;
  bio?: string;
  avatar_url?: string;
  available?: boolean;
  qualifications?: string[];
  languages?: string[];
  pricing?: number;
  [key: string]: unknown;
}

// ─── Equip Programs ──────────────────────────────────────────────

export interface EquipProgramBlock {
  id: string;
  title: string;
  block_type?: string;
  type?: string;
  content?: string;
  estimated_time_minutes?: number;
  is_required?: boolean;
  exercise_config?: ExerciseConfig;
  exerciseConfig?: ExerciseConfig;
  step_group_id?: string;
  stepGroup?: string;
  auto_advance?: boolean;
  autoAdvance?: boolean;
  image_url?: string;
  description?: string;
}

export interface EquipProgramDay {
  day_number: number;
  title: string;
  description?: string;
  image_url?: string;
  day_type?: string;
  dayType?: string;
  blocks?: EquipProgramBlock[];
}

export interface EquipProgramRaw {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  duration_days?: number;
  image_url?: string;
  status?: 'draft' | 'published';
  days?: EquipProgramDay[];
  [key: string]: unknown;
}

export interface EquipProgramData {
  title: string;
  name?: string;
  description?: string;
  category?: string;
  duration_days?: number;
  image_url?: string;
  status?: 'draft' | 'published';
  days?: EquipProgramDay[];
  [key: string]: unknown;
}

export interface ExerciseConfig {
  subtype?: string;
  prompt?: string;
  options?: string[];
  listItems?: string[];
  questions?: string[];
  columns?: string[];
  rows?: string[];
  scale?: Array<{ label: string; value: number }>;
  maxEntries?: number;
  allow_add_rows?: boolean;
  [key: string]: unknown;
}

export interface EnrollmentData {
  programId: string;
  onboardingData?: Record<string, unknown>;
}

export interface BlockResponse {
  [key: string]: unknown;
}

export interface ProgressSyncData {
  dayNumber?: number;
  completed?: boolean;
  blockResponses?: Record<string, BlockResponse>;
  [key: string]: unknown;
}

// ─── Resources ───────────────────────────────────────────────────

export interface ResourceData {
  title: string;
  description?: string;
  content?: string;
  category_id?: string;
  image_url?: string;
  type?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  [key: string]: unknown;
}

// ─── Categories ──────────────────────────────────────────────────

export interface CategoryData {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_id?: string;
  [key: string]: unknown;
}

// ─── Assessments ─────────────────────────────────────────────────

export interface AssessmentData {
  title: string;
  description?: string;
  type?: string;
  questions?: AssessmentQuestion[];
  scoring?: Record<string, unknown>;
  status?: 'draft' | 'published';
  [key: string]: unknown;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  options?: Array<{ label: string; value: number }>;
  type?: string;
  [key: string]: unknown;
}

export interface AssessmentResponses {
  [questionId: string]: number | string | unknown;
}

export interface AssessmentInterpretation {
  label: string;
  description: string;
  severity?: string;
  [key: string]: unknown;
}

// ─── Analytics ───────────────────────────────────────────────────

export interface AnalyticsData {
  activeUsers: number;
  newUsers: number;
  retention: number;
  engagement: number;
  revenue: number;
  userGrowth: Array<Record<string, unknown>>;
  programEngagement: Array<Record<string, unknown>>;
  moodTrends: Array<Record<string, unknown>>;
}

// ─── Generic API Response ───────────────────────────────��────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  [key: string]: unknown;
}