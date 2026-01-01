export interface ConditionalLogic {
  show_if_question_id: string;
  show_if_answer: string | string[];
}

export interface OnboardingQuestion {
  id: string;
  order: number;
  question: string;
  helper_text?: string;
  type: 'single_select' | 'multi_select' | 'text' | 'textarea';
  options?: string[];
  allow_skip: boolean;
  allow_prefer_not_to_answer: boolean;
  required: boolean;
  max_selections?: number;
  character_limit?: number;
  conditional?: ConditionalLogic;
  privacy_level: 'general' | 'sensitive' | 'health';
  storage_scope: 'equip-only' | 'profile';
  editable_later: boolean;
  placeholder?: string;
}

export interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'boolean' | 'rtf' | 'date';
  editable?: boolean;
}

export interface TableRow {
  id: string;
  values: Record<string, any>;
  readonly?: boolean;
}

export interface ExerciseConfig {
  subtype?: 'multi-select' | 'single-select' | 'mcq' | 'table' | 'ephemeral-journal' | 'structured-list' | 'clinical_instrument';
  prompt?: string;
  options?: string[];
  questions?: string[]; // For clinical instruments
  scale?: { label: string; value: number }[]; // For clinical instruments
  correctAnswer?: string | string[];
  allCorrect?: boolean;
  tableColumns?: TableColumn[];
  tableRows?: TableRow[];
  maxEntries?: number;
  autoDelete?: number;
  progressive?: boolean;
  listItems?: string[];
  editable?: boolean;
}

export interface Activity {
  id: string;
  title: string;
  type: 'lesson' | 'exercise' | 'journal' | 'checklist' | 'reflection' | 'conclude' | 'sleep_diary';
  content: string;
  duration: number; // in minutes
  required: boolean;
  data_id?: string;
  order: number;
  exerciseConfig?: ExerciseConfig;
  image_url?: string;
  stepGroup?: string;
  autoAdvance?: boolean;
}

export interface DayContent {
  day: number;
  title: string;
  description: string;
  activities: Activity[];
  image_url?: string;
  dayType?: 'lesson' | 'practice';
}

export interface WeekStructure {
  week: number;
  title: string;
  description: string;
  focus: string;
  days: number[];
}

export interface EquipProgram {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  cover_image: string;
  category: string;
  duration_days: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_paid?: boolean;
  published: boolean;
  price: number;
  currency: string;
  
  // Landing Page (Bento) Fields
  section1_title?: string;
  section1_eligibility_points?: string[];
  
  section2_title?: string;
  section2_content?: string;
  section2_bullets?: string[];
  section2_image?: string;
  
  section3_title?: string;
  section3_subtitle?: string;
  section3_content?: string[]; // Steps
  
  overview_benefits?: string[]; // "Title | Description" strings
  
  // Structure
  onboarding_questions: OnboardingQuestion[];
  daily_content: DayContent[];
  
  metadata?: Record<string, any>;

  created_at: string;
  updated_at: string;
}
