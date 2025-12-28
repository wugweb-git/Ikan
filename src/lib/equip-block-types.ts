
// EQUIP BLOCK ARCHITECTURE TYPES
// "Day = Container of Blocks" Model

export type BlockType = 
  | 'lesson' 
  | 'exercise' 
  | 'journal' 
  | 'checklist' 
  | 'reflection' 
  | 'conclude';

export interface BaseBlock {
  id: string;
  type: BlockType;
  title?: string;
  required: boolean;
  estimatedTime?: number; // Minutes
}

// 1. LESSON BLOCK (Psychoeducation)
export interface LessonBlock extends BaseBlock {
  type: 'lesson';
  contentType: 'text' | 'video' | 'audio';
  content: string; // Markdown or URL
  topic?: string;
}

// 2. EXERCISE BLOCK (Structured Interaction)
export type ExerciseType = 
  | 'mcq' 
  | 'multi_select' 
  | 'table' 
  | 'list';

export interface ExerciseOption {
  id: string;
  label: string;
  value: string;
  isCorrect?: boolean; // For MCQ
}

export interface TableColumn {
  id: string;
  header: string;
  type: 'text' | 'boolean' | 'select';
  options?: string[]; // For select type
}

export interface ExerciseBlock extends BaseBlock {
  type: 'exercise';
  exerciseType: ExerciseType;
  dataId: string; // Key for analytics (i01, i02, etc.)
  prompt: string;
  options?: ExerciseOption[]; // For MCQ/Multi-select
  columns?: TableColumn[]; // For Table
  rows?: any[]; // Pre-filled rows for examples
  config?: {
    allowMultiple?: boolean;
    maxSelections?: number;
    editable?: boolean;
    autoAddRow?: boolean;
  };
}

// 3. JOURNAL BLOCK (Free / Ephemeral)
export interface JournalBlock extends BaseBlock {
  type: 'journal';
  prompt: string;
  isEphemeral: boolean; // Auto-delete after 48h
  dataId: string;
}

// 4. CHECKLIST BLOCK (Habits)
export interface ChecklistBlock extends BaseBlock {
  type: 'checklist';
  items: Array<{
    id: string;
    text: string;
  }>;
}

// 5. REFLECTION BLOCK (Wrap-up)
export interface ReflectionBlock extends BaseBlock {
  type: 'reflection';
  prompt: string;
}

// 6. CONCLUDE BLOCK (Closure)
export interface ConcludeBlock extends BaseBlock {
  type: 'conclude';
  message: string;
}

export type ProgramBlock = 
  | LessonBlock 
  | ExerciseBlock 
  | JournalBlock 
  | ChecklistBlock 
  | ReflectionBlock 
  | ConcludeBlock;

// DAY DEFINITION
export interface DayDefinition {
  dayNumber: number;
  title: string;
  intent: string; // Meta intent (e.g., "Awareness")
  dayType?: 'lesson_activity' | 'activity_only' | 'practice' | 'conclusion';
  estimatedTime: number; // Minutes
  blocks: ProgramBlock[];
}

export interface SleepDiaryBlock extends BaseBlock {
  type: 'sleep_diary';
  dataId: string;
}

// Add SleepDiaryBlock to ProgramBlock union
export type ProgramBlock = 
  | LessonBlock 
  | ExerciseBlock 
  | JournalBlock 
  | ChecklistBlock 
  | ReflectionBlock 
  | ConcludeBlock
  | SleepDiaryBlock;
export interface ReportMetrics {
  consistencyScore: number; // Completed Days / Total Days
  habitAdherence: number; // Rolling avg of completed habits
  cognitiveAwareness: number; // Days with completed thought tracking
  sleepHygieneAdoption: number; // % of nights with rituals
  engagementDays: number; // Active participation days
}
