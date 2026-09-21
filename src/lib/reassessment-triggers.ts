import { apiClient } from '../shared/api-client';

export type ReassessmentReason = 'time' | 'mood' | 'program' | 'manual';

interface ReassessmentCheckResult {
  shouldTrigger: boolean;
  reason: ReassessmentReason | null;
}

export async function checkReassessmentTriggers(userId: string): Promise<ReassessmentCheckResult> {
  try {
    // Parallel fetch for speed
    const [
      assessments,
      journalEntries,
      enrollments,
      // For check-ins, we query assessments with specific ID pattern or type, 
      // but strictly we can just look at enrollments for completion status 
      // or rely on the last assessment date primarily for MVP stability.
      // However, user specifically asked for "Mood-Based" and "Program-Based".
    ] = await Promise.all([
      apiClient.getUserAssessmentResponses(userId).catch(() => []),
      apiClient.getJournalEntries(undefined, undefined, 10).catch(() => ({ entries: [] })),
      apiClient.getUserEnrollments().catch(() => [])
    ]);

    const assessmentList = Array.isArray(assessments) ? assessments : (assessments as any).history || (assessments as any).responses || [];
    const recentMoods = (journalEntries as any).entries || [];
    const enrollmentList = enrollments || [];

    // 1. Time-Based Logic
    // "14 days after last assessment"
    const lastAssessment = assessmentList
        .filter((a: any) => a.assessment_id && !a.assessment_id.startsWith('checkin_')) // Exclude check-ins
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (lastAssessment) {
      const daysSince = (Date.now() - new Date(lastAssessment.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince >= 14) {
        return { shouldTrigger: true, reason: 'time' };
      }
    } else {
      // If never taken, dashboard usually handles onboarding, but strictly speaking this loop is for RE-taking.
      return { shouldTrigger: false, reason: null };
    }

    // 2. Mood-Based Logic
    // "5+ consecutive low mood / high stress logs"
    if (recentMoods.length >= 5) {
      const last5 = recentMoods.slice(0, 5);
      
      const consistentLowMood = last5.every((e: any) => (e.mood_rating || 3) <= 2);
      const consistentHighStress = last5.every((e: any) => (e.stress_level || 0) >= 4);

      if (consistentLowMood || consistentHighStress) {
        return { shouldTrigger: true, reason: 'mood' };
      }

      // "Sudden drop vs baseline"
      // Compare last entry vs avg of previous 4
      if (recentMoods.length >= 5) {
        const latest = recentMoods[0];
        const previous4 = recentMoods.slice(1, 5);
        const baselineMood = previous4.reduce((acc: number, e: any) => acc + (e.mood_rating || 3), 0) / 4;
        
        // Drop of 2 or more points
        if ((latest.mood_rating || 3) <= baselineMood - 2) {
           return { shouldTrigger: true, reason: 'mood' };
        }
      }
    }

    // 3. Program-Based Logic
    // "Program effectiveness = worse" or "Program completed"
    // We need to check if there's a recent "check-in" assessment with result 'worse'
    // Or if a program was completed RECENTLY (e.g., in the last 24h and we haven't reassessed since)
    
    // Check for recent negative check-in
    // We fetch check-ins by looking for assessment_id starting with 'checkin_' in the assessmentList we already have
    const lastCheckIn = assessmentList
      .filter((a: any) => a.assessment_id && a.assessment_id.startsWith('checkin_'))
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (lastCheckIn) {
      // Check freshness - only trigger if check-in was recent (e.g., < 2 days ago)
      // AND we haven't done a main assessment since then
      const checkInDate = new Date(lastCheckIn.created_at);
      const daysSinceCheckIn = (Date.now() - checkInDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceCheckIn < 3) {
        const lastMainAssessmentDate = lastAssessment ? new Date(lastAssessment.created_at) : new Date(0);
        
        if (checkInDate > lastMainAssessmentDate) {
          // Check content
          const responses = lastCheckIn.responses || {};
          if (responses.perceivedChange === 'worse' || responses.continuationIntent === 'stop') {
             return { shouldTrigger: true, reason: 'program' };
          }
        }
      }
    }

    // Check for recently completed program
    const recentlyCompleted = enrollmentList.find((e: any) => {
      if (e.status !== 'completed' || !e.completed_at) return false;
      const completedDate = new Date(e.completed_at);
      const daysSinceCompletion = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCompletion < 3; // Completed in last 3 days
    });

    if (recentlyCompleted) {
      const lastMainAssessmentDate = lastAssessment ? new Date(lastAssessment.created_at) : new Date(0);
      const completedDate = new Date(recentlyCompleted.completed_at);
      
      // If we haven't reassessed since completion
      if (completedDate > lastMainAssessmentDate) {
        return { shouldTrigger: true, reason: 'program' };
      }
    }

    return { shouldTrigger: false, reason: null };

  } catch (error) {
    console.warn('Error checking reassessment triggers', error);
    return { shouldTrigger: false, reason: null };
  }
}