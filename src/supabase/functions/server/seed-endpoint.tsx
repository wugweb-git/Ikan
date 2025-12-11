// Optimized seeding endpoint - lighter memory footprint
import * as kv from "./kv_store.tsx";

export async function handleSeedData() {
  try {
    console.log('🌱 Seeding iKan sample data (optimized)...');
    
    // Quick status check to prevent duplicate work
    const existingAssessments = await kv.getByPrefix('assessment:');
    if (existingAssessments.length >= 2) {
      console.log('✅ Assessments already seeded - skipping full seed');
      return {
        success: true,
        message: 'Data already seeded',
        assessments: existingAssessments.map(a => ({ id: a.slug, title: a.title }))
      };
    }

    // Seed canonical assessments
    const assessmentsToSeed = [
      {
        assessment_id: "assess-anxiety-gad7",
        id: "00000000-0000-0000-0000-000000000002",
        slug: "anxiety",
        title: "Generalized Anxiety Disorder Scale (GAD-7)",
        description: "7-item scale widely used to measure severity of anxiety symptoms",
        version: "1.0",
        metadata: {
          estimated_minutes: 2,
          category: "anxiety",
          allow_repeat_days: 30,
          created_at: "2025-09-18T00:00:00Z"
        },
        questions: [
          {
            question_id: "q1",
            id: "q1",
            order: 1,
            text: "Feeling nervous, anxious, or on edge",
            type: "scale",
            required: true,
            options: [
              { id: "0", label: "Not at all", value: 0, score: 0 },
              { id: "1", label: "Several days", value: 1, score: 1 },
              { id: "2", label: "More than half the days", value: 2, score: 2 },
              { id: "3", label: "Nearly every day", value: 3, score: 3 }
            ]
          }
        ]
      },
      {
        assessment_id: "assess-depression-phq9",
        id: "00000000-0000-0000-0000-000000000003",
        slug: "depression",
        title: "Patient Health Questionnaire (PHQ-9)",
        description: "9-item depression screening tool",
        version: "1.0",
        metadata: {
          estimated_minutes: 3,
          category: "depression",
          allow_repeat_days: 30,
          created_at: "2025-09-18T00:00:00Z"
        },
        questions: [
          {
            question_id: "q1",
            id: "q1",
            order: 1,
            text: "Little interest or pleasure in doing things",
            type: "scale",
            required: true,
            options: [
              { id: "0", label: "Not at all", value: 0, score: 0 },
              { id: "1", label: "Several days", value: 1, score: 1 },
              { id: "2", label: "More than half the days", value: 2, score: 2 },
              { id: "3", label: "Nearly every day", value: 3, score: 3 }
            ]
          }
        ]
      },
      {
        assessment_id: "assess-burnout-risk",
        id: "00000000-0000-0000-0000-000000000004",
        slug: "burnout",
        title: "Burnout Risk Assessment",
        description: "Comprehensive assessment to identify signs of burnout",
        version: "1.0",
        metadata: {
          estimated_minutes: 4,
          category: "burnout",
          allow_repeat_days: 30,
          created_at: "2025-09-18T00:00:00Z"
        },
        questions: [
          {
            question_id: "b1",
            id: "b1",
            order: 1,
            text: "I feel emotionally drained by my work",
            type: "scale",
            required: true,
            options: [
              { id: "0", label: "Never", value: 0, score: 0 },
              { id: "1", label: "Rarely", value: 1, score: 1 },
              { id: "2", label: "Sometimes", value: 2, score: 2 },
              { id: "3", label: "Often", value: 3, score: 3 },
              { id: "4", label: "Always", value: 4, score: 4 }
            ]
          }
        ]
      }
    ];

    console.log('📊 Seeding essential assessments...');
    
    // Seed assessments quickly
    for (const assessment of assessmentsToSeed) {
      await kv.set(`assessment:${assessment.assessment_id}`, assessment);
      await kv.set(`assessment:${assessment.slug}`, assessment);
      console.log(`✅ Seeded: ${assessment.title}`);
    }

    // Add canonical burnout program
    const burnoutProgram = {
      equip_id: "equip-burnout-recovery-32",
      id: "00000000-0000-0000-0000-000000000010",
      slug: "burnout-recovery-32",
      title: "Burnout Recovery (32-day)",
      description: "A comprehensive 32-day guided program to recover from burnout",
      price: {
        currency: "INR",
        amount_cents: 49900,
        payment_provider: "razorpay",
        one_time: true
      },
      duration_days: 32,
      expiry_days_after_purchase: 180,
      days: [
        {
          day: 1,
          title: "Introduction to Burnout",
          type: "lesson",
          content: [
            {kind: "text", body: "Learn what burnout is, its signs, and how this program will guide recovery."}
          ],
          required: true,
          estimated_min: 10
        }
      ]
    };

    await kv.set(`equip_program:burnout-recovery-32`, burnoutProgram);
    await kv.set(`equip_program:equip-burnout-recovery-32`, burnoutProgram);
    console.log('✅ Seeded: Burnout Recovery Program');

    // Add other canonical equip programs
    const stressProgram = {
      equip_id: "equip-stress-management-30",
      id: "00000000-0000-0000-0000-000000000011",
      slug: "stress-management-30",
      title: "Stress Management (30-day)",
      description: "A 30-day comprehensive program to develop effective stress management techniques",
      price: {
        currency: "INR",
        amount_cents: 39900,
        payment_provider: "razorpay",
        one_time: true
      },
      duration_days: 30,
      expiry_days_after_purchase: 180,
      days: [
        {
          day: 1,
          title: "Understanding Your Stress",
          type: "lesson",
          content: [
            {kind: "text", body: "Identify your unique stress patterns and triggers."}
          ],
          required: true,
          estimated_min: 15
        }
      ]
    };

    const sleepProgram = {
      equip_id: "equip-better-sleep-21",
      id: "00000000-0000-0000-0000-000000000013",
      slug: "better-sleep-21",
      title: "Better Sleep (21-day)",
      description: "A focused 21-day program to improve sleep quality through evidence-based practices",
      price: {
        currency: "INR",
        amount_cents: 29900,
        payment_provider: "razorpay",
        one_time: true
      },
      duration_days: 21,
      expiry_days_after_purchase: 120,
      days: [
        {
          day: 1,
          title: "Sleep Science Basics",
          type: "lesson",
          content: [
            {kind: "text", body: "Learn about sleep cycles, circadian rhythms, and sleep's role in mental health."}
          ],
          required: true,
          estimated_min: 15
        }
      ]
    };

    const productivityProgram = {
      equip_id: "equip-productivity-challenge-7",
      id: "00000000-0000-0000-0000-000000000014",
      slug: "productivity-challenge-7",
      title: "Productivity Challenge (7-day)",
      description: "A quick 7-day intensive challenge to boost productivity and improve focus",
      price: {
        currency: "INR",
        amount_cents: 19900,
        payment_provider: "razorpay",
        one_time: true
      },
      duration_days: 7,
      expiry_days_after_purchase: 90,
      days: [
        {
          day: 1,
          title: "Productivity Assessment",
          type: "lesson",
          content: [
            {kind: "text", body: "Assess your current productivity patterns and identify improvement areas."}
          ],
          required: true,
          estimated_min: 20
        }
      ]
    };

    // Store all canonical equip programs
    await kv.set(`equip_program:stress-management-30`, stressProgram);
    await kv.set(`equip_program:equip-stress-management-30`, stressProgram);
    console.log('✅ Seeded: Stress Management Program');

    await kv.set(`equip_program:better-sleep-21`, sleepProgram);
    await kv.set(`equip_program:equip-better-sleep-21`, sleepProgram);
    console.log('✅ Seeded: Better Sleep Program');

    await kv.set(`equip_program:productivity-challenge-7`, productivityProgram);
    await kv.set(`equip_program:equip-productivity-challenge-7`, productivityProgram);
    console.log('✅ Seeded: Productivity Challenge Program');

    console.log('🎉 Essential data seeded successfully');
    
    return {
      success: true,
      message: 'Essential assessment data seeded successfully',
      assessments: [
        { id: 'anxiety', title: 'GAD-7 Anxiety Screening' },
        { id: 'depression', title: 'PHQ-9 Depression Screening' },
        { id: 'burnout', title: 'Burnout Risk Assessment' }
      ],
      equip_programs: [
        { id: 'burnout-recovery-32', title: 'Burnout Recovery (32-day)' },
        { id: 'stress-management-30', title: 'Stress Management (30-day)' },
        { id: 'better-sleep-21', title: 'Better Sleep (21-day)' },
        { id: 'productivity-challenge-7', title: 'Productivity Challenge (7-day)' }
      ]
    };

  } catch (error) {
    console.error('❌ Seeding error:', error);
    return {
      success: false,
      error: 'Failed to seed data: ' + error.message
    };
  }
}

export async function handleSeedUsers() {
  try {
    console.log('👥 Seeding demo users...');
    
    // Quick check to prevent duplicate seeding
    const existingUser = await kv.get('user:demo1@ikan.com');
    if (existingUser) {
      console.log('✅ Demo users already seeded - skipping');
      return {
        success: true,
        message: 'Demo users already exist',
        users: [
          { email: 'demo1@ikan.com', name: 'Alex Johnson', status: 'existing' },
          { email: 'demo2@ikan.com', name: 'Sam Rivera', status: 'existing' },
          { email: 'demo3@ikan.com', name: 'Jordan Chen', status: 'existing' }
        ]
      };
    }
    
    // Helper function to generate dates
    const getDaysAgo = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString();
    };

    // Helper function to generate journal entries
    const generateJournalEntries = (userId: string, startDays: number, count: number) => {
      const moods = ['happy', 'content', 'calm', 'motivated', 'grateful', 'excited', 'hopeful', 'creative', 'accomplished', 'determined', 'neutral', 'tired', 'stressed', 'anxious', 'frustrated', 'overwhelmed', 'sad', 'lonely'];
      const entries = [];
      
      for (let i = 0; i < count; i++) {
        const dayOffset = startDays - i;
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const moodScore = mood === 'happy' || mood === 'excited' || mood === 'grateful' ? Math.floor(Math.random() * 3) + 8 :
                         mood === 'content' || mood === 'calm' || mood === 'motivated' ? Math.floor(Math.random() * 2) + 7 :
                         mood === 'neutral' || mood === 'tired' ? Math.floor(Math.random() * 3) + 5 :
                         Math.floor(Math.random() * 3) + 3;
        
        entries.push({
          id: `journal-${userId}-${i}`,
          user_id: userId,
          entry_date: getDaysAgo(dayOffset).split('T')[0],
          mood,
          mood_score: moodScore,
          content: `Day ${count - i} journal entry for ${mood} mood.`,
          timestamp: getDaysAgo(dayOffset),
          status: 'present'
        });
      }
      return entries;
    };

    // User 1: demo1@ikan.com - New user
    const user1 = {
      user_id: "demo-user-001",
      email: "demo1@ikan.com",
      name: "Alex Johnson",
      phone: "+1 (555) 100-0001",
      avatar_url: null,
      corporate_user: false,
      created_at: getDaysAgo(3),
      updated_at: getDaysAgo(3),
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: false,
        moodReminders: true,
        reminderTime: "19:00",
        timezone: "America/New_York"
      },
      profile: {
        age_range: "25-34",
        occupation: "Software Engineer",
        goals: ["stress management", "better work-life balance"],
        onboarding_completed: true
      }
    };

    // User 2: demo2@ikan.com - Active user with moderate engagement
    const user2 = {
      user_id: "demo-user-002",
      email: "demo2@ikan.com",
      name: "Sam Rivera",
      phone: "+1 (555) 200-0002",
      avatar_url: null,
      corporate_user: false,
      created_at: getDaysAgo(45),
      updated_at: getDaysAgo(1),
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        moodReminders: true,
        reminderTime: "20:00",
        timezone: "America/Los_Angeles"
      },
      profile: {
        age_range: "30-39",
        occupation: "Marketing Manager",
        goals: ["anxiety management", "burnout prevention", "better sleep"],
        onboarding_completed: true
      }
    };

    // User 3: demo3@ikan.com - Power user with extensive engagement
    const user3 = {
      user_id: "demo-user-003",
      email: "demo3@ikan.com",
      name: "Jordan Chen",
      phone: "+1 (555) 300-0003",
      avatar_url: null,
      corporate_user: false,
      created_at: getDaysAgo(120),
      updated_at: getDaysAgo(0),
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        moodReminders: true,
        reminderTime: "18:30",
        timezone: "America/Chicago"
      },
      profile: {
        age_range: "28-35",
        occupation: "Clinical Psychologist",
        goals: ["personal development", "stress management", "mindfulness", "work-life balance"],
        onboarding_completed: true
      }
    };

    // Store users
    await kv.set(`user:demo1@ikan.com`, user1);
    await kv.set(`user:demo2@ikan.com`, user2);
    await kv.set(`user:demo3@ikan.com`, user3);

    // Generate journal entries
    const user1Journals = generateJournalEntries(user1.user_id, 3, 3); // 3 days worth
    const user2Journals = generateJournalEntries(user2.user_id, 45, 25); // 25 entries over 45 days
    const user3Journals = generateJournalEntries(user3.user_id, 100, 100); // 100 days of entries

    // Store journal entries
    for (const entry of [...user1Journals, ...user2Journals, ...user3Journals]) {
      await kv.set(`journal_entry:${entry.id}`, entry);
    }

    // Assessment responses for User 2 (2 completed, 1 in progress)
    const user2Assessments = [
      {
        id: "response-u2-phq9-1",
        user_id: user2.user_id,
        assessment_id: "assess-depression-phq9",
        started_at: getDaysAgo(30),
        completed_at: getDaysAgo(30),
        responses: [
          { question_id: "q1", value: 1, score: 1 },
          { question_id: "q2", value: 2, score: 2 },
          { question_id: "q3", value: 1, score: 1 },
          { question_id: "q4", value: 2, score: 2 },
          { question_id: "q5", value: 1, score: 1 },
          { question_id: "q6", value: 0, score: 0 },
          { question_id: "q7", value: 1, score: 1 },
          { question_id: "q8", value: 0, score: 0 },
          { question_id: "q9", value: 0, score: 0 }
        ],
        total_score: 8,
        interpretation: "Mild",
        status: "completed"
      },
      {
        id: "response-u2-gad7-1",
        user_id: user2.user_id,
        assessment_id: "assess-anxiety-gad7",
        started_at: getDaysAgo(20),
        completed_at: getDaysAgo(20),
        responses: [
          { question_id: "q1", value: 2, score: 2 },
          { question_id: "q2", value: 1, score: 1 },
          { question_id: "q3", value: 2, score: 2 },
          { question_id: "q4", value: 1, score: 1 },
          { question_id: "q5", value: 0, score: 0 },
          { question_id: "q6", value: 1, score: 1 },
          { question_id: "q7", value: 1, score: 1 }
        ],
        total_score: 8,
        interpretation: "Mild",
        status: "completed"
      },
      {
        id: "response-u2-burnout-1",
        user_id: user2.user_id,
        assessment_id: "assess-burnout-risk-1",
        started_at: getDaysAgo(1),
        completed_at: null,
        responses: [
          { question_id: "bq1", value: 3, score: 3 },
          { question_id: "bq2", value: 2, score: 2 }
        ],
        total_score: null,
        interpretation: null,
        status: "in_progress"
      }
    ];

    // Assessment responses for User 3 (all completed)
    const user3Assessments = [
      {
        id: "response-u3-phq9-1",
        user_id: user3.user_id,
        assessment_id: "assess-depression-phq9",
        started_at: getDaysAgo(90),
        completed_at: getDaysAgo(90),
        responses: [
          { question_id: "q1", value: 0, score: 0 },
          { question_id: "q2", value: 1, score: 1 },
          { question_id: "q3", value: 0, score: 0 },
          { question_id: "q4", value: 1, score: 1 },
          { question_id: "q5", value: 0, score: 0 },
          { question_id: "q6", value: 0, score: 0 },
          { question_id: "q7", value: 0, score: 0 },
          { question_id: "q8", value: 0, score: 0 },
          { question_id: "q9", value: 0, score: 0 }
        ],
        total_score: 2,
        interpretation: "Minimal",
        status: "completed"
      },
      {
        id: "response-u3-gad7-1",
        user_id: user3.user_id,
        assessment_id: "assess-anxiety-gad7",
        started_at: getDaysAgo(80),
        completed_at: getDaysAgo(80),
        responses: [
          { question_id: "q1", value: 1, score: 1 },
          { question_id: "q2", value: 0, score: 0 },
          { question_id: "q3", value: 1, score: 1 },
          { question_id: "q4", value: 0, score: 0 },
          { question_id: "q5", value: 0, score: 0 },
          { question_id: "q6", value: 0, score: 0 },
          { question_id: "q7", value: 0, score: 0 }
        ],
        total_score: 2,
        interpretation: "Minimal",
        status: "completed"
      },
      {
        id: "response-u3-burnout-1",
        user_id: user3.user_id,
        assessment_id: "assess-burnout-risk-1",
        started_at: getDaysAgo(70),
        completed_at: getDaysAgo(70),
        responses: [
          { question_id: "bq1", value: 1, score: 1 },
          { question_id: "bq2", value: 0, score: 0 },
          { question_id: "bq3", value: 1, score: 1 },
          { question_id: "bq4", value: 0, score: 0 },
          { question_id: "bq5", value: 1, score: 1 },
          { question_id: "bq6", value: 0, score: 0 }
        ],
        total_score: 3,
        interpretation: "Low burnout risk",
        status: "completed"
      }
    ];

    // Store assessment responses
    for (const response of [...user2Assessments, ...user3Assessments]) {
      await kv.set(`assessment_response:${response.id}`, response);
    }

    // Equip program enrollments
    // User 2: 1 completed, 1 ongoing
    const user2EquipEnrollments = [
      {
        id: "enrollment-u2-burnout-1",
        user_id: user2.user_id,
        equip_id: "equip-burnout-recovery-32",
        enrolled_at: getDaysAgo(40),
        completed_at: getDaysAgo(8),
        current_day: 32,
        status: "completed",
        progress: {
          days_completed: 32,
          total_days: 32,
          completion_percentage: 100
        }
      },
      {
        id: "enrollment-u2-stress-1",
        user_id: user2.user_id,
        equip_id: "equip-stress-management-30",
        enrolled_at: getDaysAgo(20),
        completed_at: null,
        current_day: 15,
        status: "active",
        progress: {
          days_completed: 15,
          total_days: 30,
          completion_percentage: 50
        }
      }
    ];

    // User 3: All programs completed
    const user3EquipEnrollments = [
      {
        id: "enrollment-u3-burnout-1",
        user_id: user3.user_id,
        equip_id: "equip-burnout-recovery-32",
        enrolled_at: getDaysAgo(110),
        completed_at: getDaysAgo(78),
        current_day: 32,
        status: "completed",
        progress: {
          days_completed: 32,
          total_days: 32,
          completion_percentage: 100
        }
      },
      {
        id: "enrollment-u3-sleep-1",
        user_id: user3.user_id,
        equip_id: "equip-better-sleep-21",
        enrolled_at: getDaysAgo(90),
        completed_at: getDaysAgo(69),
        current_day: 21,
        status: "completed",
        progress: {
          days_completed: 21,
          total_days: 21,
          completion_percentage: 100
        }
      },
      {
        id: "enrollment-u3-productivity-1",
        user_id: user3.user_id,
        equip_id: "equip-productivity-challenge-7",
        enrolled_at: getDaysAgo(60),
        completed_at: getDaysAgo(53),
        current_day: 7,
        status: "completed",
        progress: {
          days_completed: 7,
          total_days: 7,
          completion_percentage: 100
        }
      }
    ];

    // Store equip enrollments
    for (const enrollment of [...user2EquipEnrollments, ...user3EquipEnrollments]) {
      await kv.set(`equip_enrollment:${enrollment.id}`, enrollment);
    }

    // Resource read tracking
    const resourceIds = [
      "00000000-0000-0000-0000-000000000200",
      "00000000-0000-0000-0000-000000000201",
      "00000000-0000-0000-0000-000000000202",
      "00000000-0000-0000-0000-000000000203",
      "00000000-0000-0000-0000-000000000204",
      "00000000-0000-0000-0000-000000000205",
      "00000000-0000-0000-0000-000000000206",
      "00000000-0000-0000-0000-000000000207",
      "00000000-0000-0000-0000-000000000208",
      "00000000-0000-0000-0000-000000000209",
      "00000000-0000-0000-0000-000000000210",
      "00000000-0000-0000-0000-000000000211",
      "00000000-0000-0000-0000-000000000212",
      "00000000-0000-0000-0000-000000000213",
      "00000000-0000-0000-0000-000000000214",
      "00000000-0000-0000-0000-000000000215"
    ];

    // User 2 has read some resources
    for (let i = 0; i < 6; i++) {
      const readRecord = {
        id: `read-u2-${i}`,
        user_id: user2.user_id,
        resource_id: resourceIds[i],
        read_at: getDaysAgo(Math.floor(Math.random() * 30) + 10),
        completed: true
      };
      await kv.set(`resource_read:${readRecord.id}`, readRecord);
    }

    // User 3 has read most resources
    for (let i = 0; i < 12; i++) {
      const readRecord = {
        id: `read-u3-${i}`,
        user_id: user3.user_id,
        resource_id: resourceIds[i],
        read_at: getDaysAgo(Math.floor(Math.random() * 80) + 20),
        completed: true
      };
      await kv.set(`resource_read:${readRecord.id}`, readRecord);
    }

    // Consultations for User 3
    const user3Consultations = [
      {
        id: "consult-u3-1",
        user_id: user3.user_id,
        professional_id: "00000000-0000-0000-0000-000000000300",
        scheduled_at: getDaysAgo(60),
        completed_at: getDaysAgo(60),
        type: "initial_consultation",
        duration_minutes: 50,
        status: "completed",
        notes: "Initial assessment and treatment planning"
      },
      {
        id: "consult-u3-2",
        user_id: user3.user_id,
        professional_id: "00000000-0000-0000-0000-000000000301",
        scheduled_at: getDaysAgo(30),
        completed_at: getDaysAgo(30),
        type: "follow_up",
        duration_minutes: 45,
        status: "completed",
        notes: "Progress review and strategy adjustment"
      }
    ];

    // Store consultations
    for (const consultation of user3Consultations) {
      await kv.set(`consultation:${consultation.id}`, consultation);
    }

    console.log('✅ Demo users seeded successfully');
    
    return {
      success: true,
      message: 'Demo users seeded successfully',
      users: [
        { email: 'demo1@ikan.com', name: 'Alex Johnson', status: 'new user' },
        { email: 'demo2@ikan.com', name: 'Sam Rivera', status: 'active user' },
        { email: 'demo3@ikan.com', name: 'Jordan Chen', status: 'power user' }
      ]
    };

  } catch (error) {
    console.error('❌ User seeding error:', error);
    return {
      success: false,
      error: 'Failed to seed users: ' + error.message
    };
  }
}