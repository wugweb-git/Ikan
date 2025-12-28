
// EQUIP STEP 3: ONBOARDING SCHEMA
// Based on "Canonical CMS-First Structure"

// ----------------------------------------------------------------------------
// 1. CORE ENTITIES
// ----------------------------------------------------------------------------

export type OnboardingInputType = 
  | 'text' 
  | 'single_select' 
  | 'multi_select' 
  | 'date' 
  | 'phone' 
  | 'email'
  | 'textarea'; // Added for longer text if needed

export type PrivacyLevel = 'general' | 'sensitive' | 'health_related';
export type StorageType = 'profile' | 'equip_only';

export interface PrivacyMetadata {
  privacy_level: PrivacyLevel;
  storage_type: StorageType;
  editable_after_start: boolean;
}

export interface ConditionalLogic {
  trigger_question_id: string;
  condition: 'equals' | 'contains' | 'not_equals';
  value: any;
  // implied: if condition met, show this question
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface OnboardingQuestion {
  // Core Fields
  id: string;
  section_id?: string; // Optional linking to section
  question_text: string;
  helper_text?: string;
  order: number;

  // Input Definition
  input_type: OnboardingInputType;
  options?: QuestionOption[]; // For select types
  allow_prefer_not_to_say?: boolean;
  allow_skip?: boolean;

  // Validation Rules
  required?: boolean;
  min_selections?: number;
  max_selections?: number;
  character_limit?: number;

  // Logic & Privacy
  conditional_logic?: ConditionalLogic;
  privacy: PrivacyMetadata;
}

export interface OnboardingSection {
  id: string;
  question_set_id: string;
  title: string;
  order: number;
}

export interface OnboardingQuestionSet {
  id: string;
  equip_id: string;
  title: string; // e.g., "Before we begin"
  description?: string;
  is_required_before_start: boolean;
  version: string;
  
  sections?: OnboardingSection[]; // For admin organization only
  questions: OnboardingQuestion[];
}
