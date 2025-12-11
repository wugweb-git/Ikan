import { projectId, publicAnonKey } from '../utils/supabase/info';

/**
 * Database Sync Utility
 * Checks current database state and ensures complete data is seeded
 */

export interface DatabaseSyncResult {
  success: boolean;
  message: string;
  assessments_found: number;
  assessments_expected: number;
  equip_programs_found: number;
  missing_data: string[];
  sync_actions: string[];
}

// Complete PHQ-9 Assessment with ALL 9 questions
const createCompletePhq9Assessment = () => ({
  assessment_id: "assess-depression-phq9",
  id: "00000000-0000-0000-0000-000000000003",
  slug: "depression",
  title: "Patient Health Questionnaire (PHQ-9)",
  description: "9-item depression screening tool measuring severity of depressive symptoms over the past two weeks.",
  version: "1.0",
  metadata: {
    estimated_minutes: 3,
    category: "depression",
    allow_repeat_days: 30,
    created_at: "2025-09-18T00:00:00Z",
    scoring: {
      method: "sum",
      type: "sum",
      range: [0, 27],
      interpretation: {
        "0-4": "Minimal - No depression; encourage healthy lifestyle.",
        "5-9": "Mild - Monitor; suggest self-care and re-screen in 2 weeks.",
        "10-14": "Moderate - Offer self-help + professional support.",
        "15-19": "Moderately severe - Strongly consider active treatment.",
        "20-27": "Severe - Immediate treatment and professional evaluation."
      }
    }
  },
  questions: [
    {
      question_id: "q1",
      order: 1,
      text: "Little interest or pleasure in doing things",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q2",
      order: 2,
      text: "Feeling down, depressed, or hopeless",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q3",
      order: 3,
      text: "Trouble falling or staying asleep, or sleeping too much",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q4",
      order: 4,
      text: "Feeling tired or having little energy",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q5",
      order: 5,
      text: "Poor appetite or overeating",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q6",
      order: 6,
      text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q7",
      order: 7,
      text: "Trouble concentrating on things, such as reading the newspaper or watching television",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading the newspaper or watching television?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q8",
      order: 8,
      text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q9",
      order: 9,
      text: "Thoughts that you would be better off dead, or of hurting yourself in some way",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead, or of hurting yourself in some way?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    }
  ]
});

// Complete GAD-7 Assessment with ALL 7 questions
const createCompleteGad7Assessment = () => ({
  assessment_id: "assess-anxiety-gad7",
  id: "00000000-0000-0000-0000-000000000004",
  slug: "gad7",
  title: "Generalized Anxiety Disorder (GAD-7)",
  description: "7-item anxiety screening tool measuring generalized anxiety disorder symptoms over the past two weeks.",
  version: "1.0",
  metadata: {
    estimated_minutes: 2,
    category: "anxiety",
    allow_repeat_days: 30,
    created_at: "2025-09-18T00:00:00Z",
    scoring: {
      method: "sum",
      type: "sum",
      range: [0, 21],
      interpretation: {
        "0-4": "Minimal anxiety - No intervention needed.",
        "5-9": "Mild anxiety - Monitor symptoms; suggest self-help resources.",
        "10-14": "Moderate anxiety - Consider counseling or therapy.",
        "15-21": "Severe anxiety - Recommend immediate professional treatment."
      }
    }
  },
  questions: [
    {
      question_id: "q1",
      order: 1,
      text: "Feeling nervous, anxious, or on edge",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q2",
      order: 2,
      text: "Not being able to stop or control worrying",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q3",
      order: 3,
      text: "Worrying too much about different things",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by worrying too much about different things?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q4",
      order: 4,
      text: "Trouble relaxing",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by trouble relaxing?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q5",
      order: 5,
      text: "Being so restless that it is hard to sit still",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by being so restless that it is hard to sit still?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q6",
      order: 6,
      text: "Becoming easily annoyed or irritable",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    },
    {
      question_id: "q7",
      order: 7,
      text: "Feeling afraid, as if something awful might happen",
      type: "scale",
      prompt: "Over the last 2 weeks, how often have you been bothered by feeling afraid, as if something awful might happen?",
      required: true,
      options: [
        { id: "0", label: "Not at all", value: 0, score: 0 },
        { id: "1", label: "Several days", value: 1, score: 1 },
        { id: "2", label: "More than half the days", value: 2, score: 2 },
        { id: "3", label: "Nearly every day", value: 3, score: 3 }
      ]
    }
  ]
});

// Complete Burnout Recovery Program with ALL 32 days
const createCompleteBurnoutProgram = () => ({
  equip_id: "equip-burnout-32",
  id: "00000000-0000-0000-0000-000000000010",
  slug: "burnout-recovery-32",
  title: "Burnout Recovery Program",
  description: "A comprehensive 32-day guided program to recover from burnout, build resilience, and restore energy. Each day unlocks sequentially with structured lessons, practices, and reflections.",
  price: {
    currency: "INR",
    amount_cents: 49900,
    payment_provider: "razorpay",
    one_time: true
  },
  duration_days: 32,
  expiry_days_after_purchase: 180,
  onboarding: {
    required_fields: [
      {key: "current_burnout_level", type: "select", options: ["low","moderate","high"], required: true},
      {key: "work_hours_per_week", type: "number", required: true},
      {key: "sleep_hours_avg", type: "number", required: true},
      {key: "stress_triggers", type: "text", required: false}
    ]
  },
  structure: {
    unlock_rule: "sequential_previous_completed",
    daily_check_in_time: "20:00",
    reminder_rules: [
      {id: "remind_daily", offset: "20:00", channels: ["push","email"], active: true}
    ]
  },
  days: Array.from({length: 32}, (_, i) => {
    const day = i + 1;
    const weekNumber = Math.ceil(day / 7);
    
    // Week-specific content themes
    const weekThemes = {
      1: "Foundation & Awareness",
      2: "Energy & Boundaries", 
      3: "Stress Management",
      4: "Resilience Building",
      5: "Integration & Future"
    };
    
    const weekTheme = weekThemes[weekNumber as keyof typeof weekThemes] || "Integration";
    
    return {
      day,
      title: getDayTitle(day),
      type: getDayType(day),
      content: getDayContent(day),
      required: true,
      estimated_min: getDayDuration(day),
      week: weekNumber,
      theme: weekTheme
    };
  }),
  meta: {
    created_by: "ikan_system",
    created_at: "2025-09-18T00:00:00Z",
    version: "1.0",
    category: "recovery",
    tags: ["burnout", "recovery", "resilience", "workplace", "stress-management"]
  }
});

function getDayTitle(day: number): string {
  const titles = {
    1: "Understanding Burnout",
    2: "Sleep Foundation",
    3: "Micro-Recovery Breaks",
    4: "Breathing Reset",
    5: "Setting Boundaries",
    6: "Movement & Energy",
    7: "Week 1 Reflection",
    8: "Nutrition Basics",
    9: "Gratitude Practice", 
    10: "Mindful Breaks",
    11: "Digital Detox",
    12: "Delegation Skills",
    13: "Positive Self-Talk",
    14: "Week 2 Progress Review",
    15: "Deep Work Principles",
    16: "Stress Response Reset",
    17: "Social Connections",
    18: "Energy Management",
    19: "Workplace Communication", 
    20: "Progressive Muscle Relaxation",
    21: "Week 3 Integration",
    22: "Resilience Building",
    23: "Time Blocking",
    24: "Creative Expression",
    25: "Values Clarification",
    26: "Mindful Eating",
    27: "Nature Connection",
    28: "Week 4 Synthesis",
    29: "Sustainable Self-Care",
    30: "Future Stress Prevention",
    31: "Building Support Systems",
    32: "Integration & Next Steps"
  };
  return titles[day as keyof typeof titles] || `Day ${day} Content`;
}

function getDayType(day: number): string {
  if (day % 7 === 0) return "wrapup";
  if ([4, 10, 16, 20].includes(day)) return "exercise";
  if ([2, 8, 11, 17, 24, 26, 27].includes(day)) return "practice";
  if ([3, 9, 13, 19, 23, 29].includes(day)) return "challenge";
  return "lesson";
}

function getDayContent(day: number): any[] {
  // Basic content structure for each day
  return [
    {
      kind: "text", 
      body: `Day ${day} content: ${getDayTitle(day)}. Learn and practice key concepts for burnout recovery.`
    },
    {
      kind: "activity",
      id: `d${day}_activity`,
      title: `Day ${day} Practice`,
      instructions: `Complete today's recovery practice and reflect on your progress.`
    }
  ];
}

function getDayDuration(day: number): number {
  if (day % 7 === 0) return 20; // Reflection days are longer
  if ([4, 10, 16, 20].includes(day)) return 15; // Exercises
  return 12; // Standard duration
}

/**
 * Check current database state with timeout protection
 */
export async function checkDatabaseState(timeoutMs: number = 10000): Promise<DatabaseSyncResult> {
  try {
    console.log('🔍 Checking current database state...');
    
    const missing_data: string[] = [];
    const sync_actions: string[] = [];
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Database state check timeout')), timeoutMs)
    );
    
    // Check assessments with timeout
    const assessmentsRequest = fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout ? AbortSignal.timeout(timeoutMs / 2) : undefined
      }
    );
    
    const assessmentsResponse = await Promise.race([assessmentsRequest, timeoutPromise]);
    const assessments = assessmentsResponse.ok ? (await assessmentsResponse.json()).assessments || [] : [];
    
    // Check PHQ-9 completeness
    const phq9 = assessments.find((a: any) => a.slug === 'phq9');
    if (!phq9) {
      missing_data.push('PHQ-9 assessment missing');
    } else if (!phq9.questions || phq9.questions.length < 9) {
      missing_data.push(`PHQ-9 incomplete: ${phq9.questions?.length || 0}/9 questions`);
    }
    
    // Check GAD-7 completeness
    const gad7 = assessments.find((a: any) => a.slug === 'gad7');
    if (!gad7) {
      missing_data.push('GAD-7 assessment missing');
    } else if (!gad7.questions || gad7.questions.length < 7) {
      missing_data.push(`GAD-7 incomplete: ${gad7.questions?.length || 0}/7 questions`);
    }
    
    // Check equip programs with timeout
    const programsRequest = fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/equip/programs`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout ? AbortSignal.timeout(timeoutMs / 2) : undefined
      }
    );
    
    const programsResponse = await Promise.race([programsRequest, timeoutPromise]);
    const programs = programsResponse.ok ? (await programsResponse.json()).programs || [] : [];
    
    // Check burnout program completeness
    const burnoutProgram = programs.find((p: any) => p.slug === 'burnout-recovery-32');
    if (!burnoutProgram) {
      missing_data.push('Burnout Recovery Program missing');
    } else if (!burnoutProgram.days || burnoutProgram.days.length < 32) {
      missing_data.push(`Burnout program incomplete: ${burnoutProgram.days?.length || 0}/32 days`);
    }
    
    return {
      success: true,
      message: missing_data.length === 0 ? 'Database is fully synchronized' : 'Missing data detected',
      assessments_found: assessments.length,
      assessments_expected: 2,
      equip_programs_found: programs.length,
      missing_data,
      sync_actions
    };
    
  } catch (error) {
    console.error('Database state check failed:', error);
    return {
      success: false,
      message: 'Failed to check database state: ' + (error as Error).message,
      assessments_found: 0,
      assessments_expected: 2,
      equip_programs_found: 0,
      missing_data: ['Database connection failed'],
      sync_actions: []
    };
  }
}

/**
 * Sync complete data to database with timeout protection
 */
export async function syncCompleteDatabase(timeoutMs: number = 15000): Promise<DatabaseSyncResult> {
  try {
    console.log('🔄 Starting complete database sync...');
    
    const sync_actions: string[] = [];
    
    // Prepare complete data
    const phq9Assessment = createCompletePhq9Assessment();
    const gad7Assessment = createCompleteGad7Assessment();
    const burnoutProgram = createCompleteBurnoutProgram();
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Database sync timeout')), timeoutMs)
    );
    
    // Send complete sync request with timeout
    const syncRequest = fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/seed/complete-data`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessments: [phq9Assessment, gad7Assessment],
          equip_programs: [burnoutProgram],
          force_update: true
        }),
        signal: AbortSignal.timeout ? AbortSignal.timeout(timeoutMs - 1000) : undefined
      }
    );
    
    const syncResponse = await Promise.race([syncRequest, timeoutPromise]);
    
    if (!syncResponse.ok) {
      const errorText = await syncResponse.text().catch(() => 'Unknown error');
      throw new Error(`Sync failed (${syncResponse.status}): ${errorText}`);
    }
    
    const result = await syncResponse.json();
    
    sync_actions.push('Seeded complete PHQ-9 (9 questions)');
    sync_actions.push('Seeded complete GAD-7 (7 questions)');
    sync_actions.push('Seeded complete Burnout Program (32 days)');
    
    console.log('✅ Database sync completed successfully');
    
    return {
      success: true,
      message: 'Database fully synchronized with complete data',
      assessments_found: 2,
      assessments_expected: 2,
      equip_programs_found: 1,
      missing_data: [],
      sync_actions
    };
    
  } catch (error) {
    console.error('Database sync failed:', error);
    return {
      success: false,
      message: 'Failed to sync database: ' + (error as Error).message,
      assessments_found: 0,
      assessments_expected: 2,
      equip_programs_found: 0,
      missing_data: ['Sync operation failed'],
      sync_actions: []
    };
  }
}

/**
 * Quick database health check with timeout protection
 */
export async function quickHealthCheck(timeoutMs: number = 5000): Promise<boolean> {
  try {
    console.log(`🔍 Running health check with ${timeoutMs}ms timeout...`);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Health check timeout')), timeoutMs)
    );
    
    // Create the health check request
    const healthRequest = fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/health`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        // Add signal for request timeout
        signal: AbortSignal.timeout ? AbortSignal.timeout(timeoutMs - 500) : undefined
      }
    );
    
    // Race the health check against the timeout
    const response = await Promise.race([healthRequest, timeoutPromise]);
    
    const isHealthy = response.ok;
    console.log(isHealthy ? '✅ Health check passed' : '⚠️ Health check failed - server returned error');
    
    return isHealthy;
  } catch (error) {
    console.log('🔌 Health check failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/**
 * Robust health check with multiple timeout strategies
 */
export async function robustHealthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    console.log('🏥 Running robust health check...');
    
    // Try quick check first (3 seconds)
    const quickResult = await quickHealthCheck(3000);
    const latency = Date.now() - startTime;
    
    if (quickResult) {
      console.log(`✅ Server healthy (${latency}ms)`);
      return { healthy: true, latency };
    }
    
    // If quick check fails, try a longer timeout (8 seconds)
    console.log('⏳ Quick check failed, trying extended check...');
    const extendedResult = await quickHealthCheck(8000);
    const extendedLatency = Date.now() - startTime;
    
    if (extendedResult) {
      console.log(`✅ Server healthy on extended check (${extendedLatency}ms)`);
      return { healthy: true, latency: extendedLatency };
    }
    
    console.log('❌ All health checks failed');
    return { healthy: false, error: 'Server not responding' };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('❌ Robust health check error:', errorMessage);
    return { healthy: false, error: errorMessage };
  }
}