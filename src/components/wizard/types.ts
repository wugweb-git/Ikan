
export type WizardStepType = 'intro' | 'info' | 'input' | 'composite' | 'custom' | 'outro';

export type FieldType = 
  | 'boolean' 
  | 'single_select' 
  | 'multi_select' 
  | 'number' 
  | 'time' 
  | 'text' 
  | 'long_text' 
  | 'text_list' 
  | 'row_list' 
  | 'matrix'
  | 'info'; // For static content within a step

export interface WizardOption {
  id: string;
  label: string;
  value: any;
  icon?: string;
  description?: string;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  maxItems?: number; // For lists
  customMessage?: string;
}

export type UIHint = 'cards' | 'inline' | 'modal' | 'full-width' | 'compact';

export interface WizardFieldConfig {
  id: string; // Acts as the stable "key"
  type: FieldType; // Acts as "dataType"
  label?: string;
  helpText?: string;
  description?: string; // Rich text description
  placeholder?: string;
  
  options?: WizardOption[]; // For select types
  validation?: FieldValidation; // Acts as "constraints"
  
  defaultValue?: any;
  hidden?: boolean;
  autoAdvance?: boolean;
  uiHints?: UIHint[];
  
  // For row_list
  rowSchema?: WizardFieldConfig[];
  
  // For matrix
  rows?: WizardOption[];
  columns?: WizardOption[];
  
  // Conditional logic at field level
  dependsOn?: {
    fieldId: string;
    value: any;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
}

export interface StepRules {
  required?: boolean;
  skippable?: boolean;
  lighter_version?: boolean;
  resettable?: boolean;
}

export interface StepMedia {
  type: 'image' | 'icon' | 'illustration';
  url?: string;
  name?: string; // For icons
  alt?: string;
}

export interface WizardStepConfig {
  id: string;
  type: WizardStepType;
  title?: string;
  description?: string; // Markdown supported
  media?: StepMedia;
  
  fields?: WizardFieldConfig[]; // For input/composite types
  component?: string; // For custom types (registry key)
  
  // Rules & Behavior
  rules?: StepRules;
  skippable?: boolean; // Legacy/Shim for rules.skippable
  
  // Navigation Overrides
  nextLabel?: string;
  backLabel?: string;
  
  // Conditional Logic (Step Level)
  condition?: {
    fieldId: string;
    value: any;
    operator?: 'equals' | 'not_equals' | 'contains';
  };
  
  // Metadata
  metadata?: Record<string, any>;
}

export type WizardMode = 'assessment' | 'equip_onboarding' | 'equip_daily';
export type CompletionBehavior = 'score' | 'summary' | 'redirect';

export interface WizardConfig {
  id: string;
  title: string;
  description?: string;
  
  mode?: WizardMode;
  completionBehavior?: CompletionBehavior;
  
  steps: WizardStepConfig[];
  
  exitLabel?: string; // "Save & Exit" vs "Close"
  showProgress?: boolean;
  progressType?: 'bar' | 'dots' | 'count';
}

export interface WizardProps {
  config: WizardConfig;
  initialData?: Record<string, any>;
  initialStepIndex?: number;
  onComplete?: (results: Record<string, any>) => void;
  onSave?: (state: WizardState) => void;
  onExit?: () => void;
  className?: string;
}

export interface WizardState {
  currentStepIndex: number;
  answers: Record<string, any>;
  completedSteps: string[]; // Step IDs
  history: number[]; // Stack of visited step indices (for Back navigation)
  isSubmitting: boolean;
  hasError: boolean;
}

export interface WizardContextValue extends WizardState {
  config: WizardConfig;
  currentStep: WizardStepConfig;
  totalSteps: number;
  progress: number;
  
  // Actions
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (index: number) => void;
  setAnswer: (fieldId: string, value: any) => void;
  setAnswers: (values: Record<string, any>) => void;
  submit: () => Promise<void>;
  saveAndExit: () => void;
  
  // Helpers
  getAnswer: (fieldId: string) => any;
  canGoNext: boolean;
  canGoPrevious: boolean;
}
