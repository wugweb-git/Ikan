
// EQUIP DATABASE SCHEMA (TypeScript Representation)
// Based on "Full-Stack, End-to-End Blueprint"

// ----------------------------------------------------------------------------
// 2. CORE DATABASE TABLES
// ----------------------------------------------------------------------------

// 2.1 programs
export interface DbProgram {
  id: string; // uuid
  name: string; // "Equip: Sleep Tight"
  total_days: number; // 18
  description?: string;
  is_active: boolean;
  created_at: string;
}

// 2.2 program_days
export type DayType = 'lesson_activity' | 'activity_only' | 'practice' | 'conclusion';
export type UnlockRule = 'sequential' | 'time_based';

export interface DbProgramDay {
  id: string; // uuid
  program_id: string; // FK -> programs.id
  day_number: number; // 1-18
  title: string;
  day_type: DayType;
  estimated_time: number; // minutes
  unlock_rule: UnlockRule;
  created_at: string;
}

// 2.3 day_blocks
export type DbBlockType = 
  | 'lesson' 
  | 'activity_mcq' 
  | 'activity_single_select' 
  | 'activity_multi_select' 
  | 'activity_table' 
  | 'journal_rtf' 
  | 'habit_builder' 
  | 'sleep_diary' 
  | 'reflection' 
  | 'media' 
  | 'completion';

export interface DbDayBlock {
  id: string; // uuid
  day_id: string; // FK -> program_days.id
  block_type: DbBlockType;
  order_index: number;
  content_ref?: string; // Points to CMS content content
  is_required: boolean;
  created_at: string;
  
  // Content payload (denormalized for NoSQL usage or joined)
  content?: any; 
}

// 2.4 activities (Defines input expectation)
export type ActivityType = 'mcq' | 'table' | 'rtf' | 'checklist';

export interface DbActivity {
  id: string; // uuid
  activity_code: string; // i04, i07+
  activity_type: ActivityType;
  instructions: string;
  validation_rules?: Record<string, any>;
  created_at: string;
}

// 2.5 activity_fields
export interface DbActivityField {
  id: string; // uuid
  activity_id: string; // FK -> activities.id
  field_key: string; // "thoughts", "feelings"
  field_type: 'text' | 'boolean' | 'enum' | 'number';
  is_required: boolean;
  options?: any[]; // JSON options
  max_entries?: number;
  created_at: string;
}

// 2.6 user_program_enrollments
export type EnrollmentStatus = 'active' | 'completed' | 'abandoned';

export interface DbUserEnrollment {
  id: string; // uuid
  user_id: string;
  program_id: string;
  start_date: string; // date
  current_day: number;
  status: EnrollmentStatus;
  created_at: string;
}

// 2.7 user_day_progress
export type CompletionStatus = 'not_started' | 'in_progress' | 'completed';

export interface DbUserDayProgress {
  id: string; // uuid
  enrollment_id: string;
  day_number: number;
  started_at: string;
  completed_at?: string;
  completion_status: CompletionStatus;
}

// 2.8 user_activity_responses
export interface DbUserActivityResponse {
  id: string; // uuid
  user_id: string;
  activity_id: string; // or block_id
  day_number: number;
  response_data: any; // typed payload
  created_at: string;
}

// ----------------------------------------------------------------------------
// 3. SLEEP-SPECIFIC DATA
// ----------------------------------------------------------------------------

// 3.1 sleep_diary_entries
export type SleepQuality = 'very_poor' | 'poor' | 'fair' | 'good' | 'very_good';

export interface DbSleepDiaryEntry {
  id: string;
  user_id: string;
  date: string; // yyyy-mm-dd
  bedtime: string; // HH:mm
  sleep_latency: number; // minutes
  awakenings: number; // count
  wake_time: string; // HH:mm
  sleep_quality: SleepQuality;
  notes?: string;
}

// 3.2 sleep_metrics (Derived)
export interface DerivedSleepMetrics {
  sleep_window: number; // minutes (out_of_bed - in_bed)
  time_awake: number; // minutes (latency + awakenings_duration?) -> Spec says "latency + awakenings". Awakenings is usually count. Assuming avg duration or if awakenings is duration. Spec says "awakenings int". Usually WAKE AFTER SLEEP ONSET (WASO) is needed. 
  // Assuming "awakenings" in spec implies duration or we just use count. 
  // User spec: "time_awake = latency + awakenings". This implies 'awakenings' is minutes here.
  time_asleep: number; // window - awake
  sleep_efficiency: number; // asleep / window
}
