import { projectId, publicAnonKey } from '../utils/supabase/info';

/**
 * Seeds all 8 clinical assessments into the backend KV store
 * Includes: PHQ-9, GAD-7, Burnout Risk, Sleep Quality, Resilience, 
 * Work Engagement, Well-being Index, and Mindfulness assessments
 */
export async function seedAssessments() {
  try {
    console.log('🌱 Seeding all 8 clinical assessments...');
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/seed/data`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to seed assessments: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ All clinical assessments seeded successfully:');
    console.log('📊 Seeded assessments:', result.assessments?.map(a => `${a.title} (${a.id})`));
    
    // Skip verification to speed up seeding process
    
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Seeding request timed out');
    } else {
      console.error('❌ Failed to seed assessments:', error);
    }
    // Don't throw error - app should continue working even if seeding fails
    return null;
  }
}

/**
 * Retrieves assessments from the backend
 */
export async function getAssessments() {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch assessments: ${response.status}`);
    }

    const result = await response.json();
    return result.assessments || [];
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Assessment fetch request timed out');
    } else {
      console.error('❌ Failed to fetch assessments:', error);
    }
    return [];
  }
}

/**
 * Gets a specific assessment by ID or slug
 */
export async function getAssessment(assessmentId: string) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments/${assessmentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch assessment: ${response.status}`);
    }

    const result = await response.json();
    return result.assessment;
  } catch (error) {
    console.error('❌ Failed to fetch assessment:', error);
    return null;
  }
}

/**
 * Force seed assessments immediately - useful for manual database updates
 * This bypasses the health check and immediately attempts to seed
 */
export async function forceSeedAssessments() {
  console.log('🚀 Force seeding assessments to database...');
  
  try {
    // First check if backend is available
    const healthResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/health`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!healthResponse.ok) {
      throw new Error('Backend not available - cannot seed assessments');
    }

    console.log('✅ Backend is available, proceeding with seeding...');
    
    // Now seed the assessments
    const result = await seedAssessments();
    
    if (result) {
      console.log('🎉 Force seeding completed successfully!');
      return true;
    } else {
      console.error('❌ Force seeding failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Force seeding error:', error);
    return false;
  }
}

/**
 * Check if assessments are already seeded in the database
 */
export async function checkAssessmentsSeeded() {
  try {
    const assessments = await getAssessments();
    const expectedAssessments = [
      'anxiety', 'depression', 'burnout', 'sleep-quality', 
      'resilience', 'work-engagement', 'wellbeing-index', 'mindfulness'
    ];
    
    const seededSlugs = assessments.map(a => a.slug);
    const allSeeded = expectedAssessments.every(slug => seededSlugs.includes(slug));
    
    console.log(`📊 Assessment status: ${seededSlugs.length}/${expectedAssessments.length} seeded`);
    console.log('📋 Seeded assessments:', seededSlugs);
    
    return {
      allSeeded,
      seededCount: seededSlugs.length,
      expectedCount: expectedAssessments.length,
      seededSlugs,
      expectedSlugs: expectedAssessments
    };
  } catch (error) {
    console.error('❌ Failed to check seeded assessments:', error);
    return {
      allSeeded: false,
      seededCount: 0,
      expectedCount: 8,
      seededSlugs: [],
      expectedSlugs: []
    };
  }
}