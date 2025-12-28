
// REPORT CARD — DATA & LOGIC (BACKEND SPEC)
// ----------------------------------------------------------------------------
// Based on "Report Card — Data & Logic" Spec
// Implements computed metrics from raw interaction data.

// ----------------------------------------------------------------------------
// 1. DATA INPUT SOURCES (RAW TABLES SCHEMAS)
// ----------------------------------------------------------------------------

import { BlockType } from './equip-block-types';

export interface EquipDayCompletion {
  id: string;
  user_id: string;
  equip_id: string;
  day_number: number; // 1–18
  completed_at: string; // ISO timestamp
}

export interface EquipBlockCompletion {
  id: string;
  user_id: string;
  equip_id: string;
  day_number: number;
  block_id: string;
  block_type: BlockType;
  completed_at: string;
}

export interface ExerciseResponse {
  id: string;
  user_id: string;
  equip_id: string;
  day_number: number;
  data_id: string; // i02, i04, i07, etc
  response_json: any;
  created_at: string;
}

export interface HabitTrackerEntry {
  id: string;
  user_id: string;
  equip_id: string;
  date: string; // yyyy-mm-dd
  habit_id: string; // sleep_hygiene / ritual / journaling
  completed: boolean;
}

export interface SleepImpactFlag {
  id: string;
  user_id: string;
  equip_id: string;
  date: string;
  affected_sleep: 'yes' | 'no' | 'na';
}

// Container for all raw data needed for calculation
export interface EquipRawData {
  dayCompletions: EquipDayCompletion[];
  blockCompletions: EquipBlockCompletion[];
  exerciseResponses: ExerciseResponse[];
  habitEntries: HabitTrackerEntry[];
  sleepImpactFlags: SleepImpactFlag[];
}

// ----------------------------------------------------------------------------
// 2. RESULT OBJECT (API RESPONSE SHAPE)
// ----------------------------------------------------------------------------

export interface EquipResult {
  equip_id: string;
  user_id: string;

  summary: {
    completed_days: number;
    engagement_ratio: number; // 0-1
    routine_score: number; // 0-1
  };

  breakdown: {
    cognitive_awareness: {
      days_logged: number;
      ratio: number;
    };

    sleep_disruption_awareness: {
      yes_count: number;
      no_count: number;
    };

    habits: Array<{
      habit_id: string;
      completed_days: number;
      total_possible: number;
      adherence_ratio: number;
    }>;
  };

  narrative_flags: {
    high_consistency: boolean;
    improving_awareness: boolean;
    habit_forming: boolean;
  };
}

// ----------------------------------------------------------------------------
// 3. LOGIC (COMPUTED METRICS)
// ----------------------------------------------------------------------------

export function generateEquipResult(
  data: EquipRawData,
  config: { 
    userId: string; 
    equipId: string; 
    totalProgramDays: number; // usually 18
  }
): EquipResult {
  
  // 4.1 Programme Completion
  const completedDaysCount = data.dayCompletions.length;
  // const completionRatio = completedDaysCount / config.totalProgramDays;

  // 4.2 Engagement Consistency
  // active_days = count(distinct day_number from equip_block_completion)
  const activeDaysSet = new Set(data.blockCompletions.map(b => b.day_number));
  const activeDays = activeDaysSet.size;
  const engagementRatio = activeDays / config.totalProgramDays;

  // 4.3 Cognitive Awareness Index
  // thought_tracking_days = count(distinct day_number where data_id in ('i04', 'i04+'))
  const thoughtTrackingDaysSet = new Set(
    data.exerciseResponses
      .filter(r => ['i04', 'i04+', 'i04++'].includes(r.data_id))
      .map(r => r.day_number)
  );
  const thoughtTrackingDays = thoughtTrackingDaysSet.size;
  // Assuming expected days for thought tracking is roughly proportional to progress or fixed
  // For this formula, let's use totalProgramDays as denominator or a fixed "expected" count if known
  // The spec says "number_of_days_expected". Let's assume 10 for Sleep Tight.
  const EXPECTED_THOUGHT_DAYS = 10; 
  const cognitiveAwarenessRatio = Math.min(1, thoughtTrackingDays / EXPECTED_THOUGHT_DAYS);

  // 4.4 Sleep Disruption Awareness
  const yesCount = data.sleepImpactFlags.filter(f => f.affected_sleep === 'yes').length;
  const noCount = data.sleepImpactFlags.filter(f => f.affected_sleep === 'no').length;
  // const totalFlags = data.sleepImpactFlags.length;

  // 4.5 Habit Adoption & 4.6 Routine Stability
  // Group by habit_id
  const habitsMap = new Map<string, { completed: number; total: number }>();
  
  data.habitEntries.forEach(entry => {
    if (!habitsMap.has(entry.habit_id)) {
      habitsMap.set(entry.habit_id, { completed: 0, total: 0 });
    }
    const h = habitsMap.get(entry.habit_id)!;
    h.total += 1; // Assuming entry exists = possible opportunity? 
                  // Or should we infer total from days 9-18?
                  // Spec: "completed_entries / total_possible_entries"
    if (entry.completed) h.completed += 1;
  });

  const habitsBreakdown = Array.from(habitsMap.entries()).map(([habit_id, stats]) => ({
    habit_id,
    completed_days: stats.completed,
    total_possible: stats.total,
    adherence_ratio: stats.total > 0 ? stats.completed / stats.total : 0
  }));

  // routine_score = average(habit_adherence across all habits)
  const totalAdherence = habitsBreakdown.reduce((sum, h) => sum + h.adherence_ratio, 0);
  const routineScore = habitsBreakdown.length > 0 ? totalAdherence / habitsBreakdown.length : 0;

  // 7. NARRATIVE FLAGS
  const highConsistency = engagementRatio >= 0.6;
  const improvingAwareness = cognitiveAwarenessRatio >= 0.5;
  const habitForming = routineScore >= 0.5;

  return {
    equip_id: config.equipId,
    user_id: config.userId,

    summary: {
      completed_days: completedDaysCount,
      engagement_ratio: engagementRatio,
      routine_score: routineScore
    },

    breakdown: {
      cognitive_awareness: {
        days_logged: thoughtTrackingDays,
        ratio: cognitiveAwarenessRatio
      },
      sleep_disruption_awareness: {
        yes_count: yesCount,
        no_count: noCount
      },
      habits: habitsBreakdown
    },

    narrative_flags: {
      high_consistency: highConsistency,
      improving_awareness: improvingAwareness,
      habit_forming: habitForming
    }
  };
}
