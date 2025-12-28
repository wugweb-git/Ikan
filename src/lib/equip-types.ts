/**
 * Equip Program Type Definitions
 * 
 * This file defines the complete data structure for Equip mental health programs,
 * including 30-35 day schedules, daily content, and various task types.
 */

// ============================================================================
// TASK TYPES - Various interactive elements users can complete
// ============================================================================

export type TaskType = 
  | 'mcq'        // Multiple Choice Question
  | 'rtf'        // Rich Text Format (long answer)
  | 'type'       // Text input (short answer)
  | 'select'     // Dropdown/selection
  | 'table'      // Structured data entry
  | 'compare'    // Comparison task
  | 'slider'     // Rating/scale slider
  | 'checkbox'   // Multiple checkboxes
  | 'radio'      // Single selection radio
  | 'file'       // File upload
  | 'audio'      // Audio recording
  | 'video';     // Video recording

export interface TaskOption {
  id: string;
  label: string;
  value: string;
  isCorrect?: boolean; // For MCQ with validation
}

export interface TaskValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface BaseTask {
  id: string;
  type: TaskType;
  title: string;
  description?: string;
  instruction?: string;
  validation?: TaskValidation;
  points?: number;
  completed?: boolean;
  userResponse?: any;
}

export interface MCQTask extends BaseTask {
  type: 'mcq';
  options: TaskOption[];
  allowMultiple?: boolean;
}

export interface RTFTask extends BaseTask {
  type: 'rtf';
  placeholder?: string;
  minWords?: number;
  maxWords?: number;
}

export interface TypeTask extends BaseTask {
  type: 'type';
  placeholder?: string;
  inputType?: 'text' | 'email' | 'number' | 'tel';
}

export interface SelectTask extends BaseTask {
  type: 'select';
  options: TaskOption[];
  placeholder?: string;
}

export interface TableTask extends BaseTask {
  type: 'table';
  columns: Array<{
    id: string;
    label: string;
    type: 'text' | 'number' | 'select';
    options?: TaskOption[];
  }>;
  rows?: number;
}

export interface CompareTask extends BaseTask {
  type: 'compare';
  itemA: {
    label: string;
    content: string;
  };
  itemB: {
    label: string;
    content: string;
  };
  comparisonPoints: string[];
}

export interface SliderTask extends BaseTask {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  labels?: {
    min: string;
    max: string;
    current?: string;
  };
}

export type Task = 
  | MCQTask 
  | RTFTask 
  | TypeTask 
  | SelectTask 
  | TableTask 
  | CompareTask 
  | SliderTask 
  | BaseTask;

// ============================================================================
// CONTENT TYPES - Different types of content in daily lessons
// ============================================================================

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  content: string; // Rich text/markdown content
  type: 'reading' | 'video' | 'audio' | 'interactive';
  resources?: Array<{
    id: string;
    title: string;
    url: string;
    type: 'pdf' | 'link' | 'video' | 'audio';
  }>;
  completed?: boolean;
}

export interface Exercise {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  type: 'breathing' | 'meditation' | 'journaling' | 'physical' | 'creative';
  instructions: string[];
  tasks?: Task[];
  completed?: boolean;
}

export interface DayConclusion {
  summary: string;
  keyTakeaways: string[];
  reflectionPrompt?: string;
  nextDayPreview?: string;
}

// ============================================================================
// DAILY CONTENT - Complete structure for each day
// ============================================================================

export interface DailyContent {
  day: number; // 1-35
  title: string;
  theme?: string;
  description?: string;
  estimatedDuration: number; // Total minutes for the day
  lessons: Lesson[];
  tasks: Task[];
  exercises: Exercise[];
  conclusion: DayConclusion;
  isLocked?: boolean; // Whether user can access this day yet
  completed?: boolean;
  completedAt?: string; // ISO date string
  progress?: number; // 0-100
}

// ============================================================================
// SCHEDULE - 30-35 day program schedule
// ============================================================================

export interface WeekSummary {
  week: number;
  title: string;
  description: string;
  focus: string;
  days: number[]; // Array of day numbers in this week
}

export interface ProgramSchedule {
  totalDays: number; // 30-35
  currentDay: number;
  startDate?: string; // ISO date string
  expectedEndDate?: string; // ISO date string
  weeks: WeekSummary[];
  dailyContent: DailyContent[];
  canRepeat: boolean;
  repeatCount?: number; // How many times user has repeated this program
}

// ============================================================================
// PROGRAM INFO - Basic program information
// ============================================================================

export interface ProgramBasicInfo {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number | {
    currency: string;
    amount_cents: number;
    payment_provider: string;
    one_time: boolean;
  };
  currency?: string;
  thumbnail?: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// EQUIP DETAIL - Landing page information
// ============================================================================

export interface EquipDetail {
  basicInfo: ProgramBasicInfo;
  overview: {
    title: string;
    description: string;
    benefits: string[];
    whatYouWillLearn: string[];
  };
  programDetails: {
    duration: string; // e.g., "30 days", "5 weeks"
    totalDays: number;
    timeCommitment: string; // e.g., "15-30 mins/day"
    accessPeriod: string; // e.g., "6 months"
    modules: number;
    exercises: number;
    assessments: number;
  };
  structure: {
    weeks: Array<{
      week: number;
      title: string;
      focus: string;
      days: number[];
    }>;
  };
  instructor?: {
    name: string;
    credentials: string;
    bio: string;
    photo?: string;
  };
  reviews?: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

// ============================================================================
// ONBOARDING - User onboarding data
// ============================================================================

export interface OnboardingQuestion {
  id: string;
  type: 'text' | 'select' | 'multiselect' | 'scale' | 'textarea';
  question: string;
  description?: string;
  options?: string[];
  required?: boolean;
}

export interface OnboardingData {
  personalInfo: {
    name: string;
    preferredName?: string;
    age?: string;
    pronouns?: string;
  };
  programGoals: {
    what: string; // What they want to achieve
    why: string; // Why this is important
    when: string; // When they want to complete
    expectations: string; // What they expect from the program
  };
  currentState: {
    primaryConcern?: string;
    severityLevel?: number; // 1-10
    previousExperience?: string;
    currentSupport?: string[];
  };
  preferences: {
    reminderTime?: string;
    communicationStyle?: 'supportive' | 'direct' | 'balanced';
    privacyLevel?: 'high' | 'medium' | 'low';
  };
  consent: {
    dataProcessing: boolean;
    communications: boolean;
    research?: boolean;
  };
}

// ============================================================================
// PROGRESS TRACKING - User's progress through the program
// ============================================================================

export interface DayProgress {
  day: number;
  completed: boolean;
  completedAt?: string;
  lessonsCompleted: number;
  totalLessons: number;
  tasksCompleted: number;
  totalTasks: number;
  exercisesCompleted: number;
  totalExercises: number;
  timeSpent: number; // in minutes
  mood?: 'great' | 'good' | 'okay' | 'difficult' | 'struggling';
  notes?: string;
}

export interface ProgramProgress {
  programId: string;
  userId: string;
  enrollmentId: string;
  startDate: string;
  currentDay: number;
  totalDaysCompleted: number;
  totalDays: number;
  dailyProgress: DayProgress[];
  overallCompletion: number; // 0-100
  streak: number; // Days in a row
  longestStreak: number;
  totalTimeSpent: number; // in minutes
  isRepeating?: boolean;
  repeatNumber?: number;
}

// ============================================================================
// COMPLETION REPORT - "How did I do" comprehensive report
// ============================================================================

export interface SkillMastery {
  skill: string;
  level: 'beginner' | 'developing' | 'proficient' | 'advanced';
  progress: number; // 0-100
  insights: string[];
}

export interface CompletionMetrics {
  overall: {
    completion: number; // 0-100
    grade?: string; // A+, A, B+, etc.
    ranking?: string; // Top 10%, etc.
  };
  engagement: {
    daysActive: number;
    totalDays: number;
    streak: number;
    averageTimePerDay: number;
  };
  performance: {
    tasksCompleted: number;
    totalTasks: number;
    correctAnswers?: number; // For validated tasks
    totalQuestions?: number;
    averageScore?: number;
  };
  growth: {
    skillsMastered: SkillMastery[];
    improvementAreas: string[];
    strengths: string[];
  };
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    achievedAt: string;
    icon?: string;
  }>;
}

export interface CompletionReport {
  programId: string;
  userId: string;
  completedAt: string;
  metrics: CompletionMetrics;
  personalInsights: {
    topAchievements: string[];
    keyLearnings: string[];
    personalGrowth: string;
    nextSteps: string[];
  };
  certificateEarned: boolean;
  certificateId?: string;
  canRepeat: boolean;
  recommendedPrograms?: Array<{
    id: string;
    title: string;
    reason: string;
  }>;
}

// ============================================================================
// COMPLETE EQUIP PROGRAM - Full program structure
// ============================================================================

export interface EquipProgram {
  basicInfo: ProgramBasicInfo;
  detail: EquipDetail;
  schedule: ProgramSchedule;
  onboarding: {
    questions: OnboardingQuestion[];
    estimatedDuration: number; // in minutes
  };
  progress?: ProgramProgress; // User's progress (if enrolled)
  completionReport?: CompletionReport; // Final report (if completed)
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface EnrollmentResponse {
  success: boolean;
  enrollmentId: string;
  programId: string;
  startDate: string;
  progress: ProgramProgress;
}

export interface ProgressUpdateRequest {
  enrollmentId: string;
  day: number;
  updates: {
    lessonsCompleted?: string[]; // lesson IDs
    tasksCompleted?: Array<{
      taskId: string;
      response: any;
      isCorrect?: boolean;
    }>;
    exercisesCompleted?: string[]; // exercise IDs
    timeSpent?: number;
    mood?: string;
    notes?: string;
  };
}

export interface ProgressUpdateResponse {
  success: boolean;
  progress: ProgramProgress;
  dayCompleted?: boolean;
  milestoneUnlocked?: {
    id: string;
    title: string;
    description: string;
  };
}
