// Comprehensive seed function for all iKan data
import * as kv from "./kv_store.tsx";

// ============================================================================
// CONSULTANTS DATA
// ============================================================================

const consultantsData = [
  {
    id: "00000000-0000-0000-0000-000000000300",
    name: "Dr. Sarah Johnson",
    credentials: "M.Phil (Clinical Psychology), M.Sc",
    category: "therapist",
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    yearsExperience: 15,
    languages: ["English", "Hindi"],
    location: "Mumbai, India",
    sessionModes: ["online", "offline", "call", "chat"],
    expertises: [
      "Anxiety Disorders",
      "Depressive Disorders",
      "Trauma",
      "PTSD",
      "Stress Management",
      "Cognitive Behavioral Therapy"
    ],
    topExpertises: ["Anxiety Disorders", "Trauma", "CBT"],
    approaches: ["Cognitive Behavioral Therapy (CBT)", "Trauma-Informed Care", "Mindfulness-Based Therapy"],
    concernsICanHelp: [
      "I feel anxious all the time",
      "I can't stop worrying",
      "Past trauma is affecting my present",
      "I'm constantly stressed"
    ],
    pricing: {
      video: 1500,
      call: 1200,
      chat: 800,
      offline: 2000
    },
    nextAvailableSlot: "Today, 4:00 PM",
    availability: [
      {
        date: "2025-10-17",
        slots: [
          { time: "09:00", available: false },
          { time: "10:00", available: true },
          { time: "11:00", available: true },
          { time: "14:00", available: false },
          { time: "15:00", available: true },
          { time: "16:00", available: true },
          { time: "17:00", available: false }
        ]
      }
    ],
    rating: 4.8,
    reviewCount: 142,
    reviews: [
      {
        id: "r1",
        patientName: "Anonymous",
        rating: 5,
        date: "2025-10-10",
        comment: "Dr. Johnson helped me overcome my anxiety. Her CBT techniques really work. Highly recommended!",
        verified: true,
        helpful: 23
      }
    ],
    bio: "Dr. Johnson has over 15 years of experience helping individuals overcome anxiety, depression, and trauma. She specializes in cognitive behavioral therapy and trauma-informed care, creating a safe and supportive environment for healing.",
    qualifications: [
      "M.Phil in Clinical Psychology, NIMHANS",
      "M.Sc in Psychology, Delhi University",
      "Certified CBT Practitioner",
      "Trauma-Informed Care Specialist"
    ],
    faqs: [
      {
        question: "What is your approach to therapy?",
        answer: "I primarily use Cognitive Behavioral Therapy (CBT) combined with trauma-informed care principles. I believe in creating a collaborative, supportive environment where you feel safe to explore your thoughts and feelings."
      }
    ],
    qas: [],
    articles: [],
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000301",
    name: "Dr. Michael Chen",
    credentials: "M.Phil, LCSW",
    category: "counselor",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    yearsExperience: 10,
    languages: ["English", "Mandarin"],
    location: "Bangalore, India",
    sessionModes: ["online", "call"],
    expertises: [
      "Stress Management",
      "Work-Related Concerns",
      "Communication Skills",
      "Relationship Skills",
      "Mindfulness"
    ],
    topExpertises: ["Stress Management", "Work Burnout", "Mindfulness"],
    approaches: ["Mindfulness-Based Stress Reduction", "Solution-Focused Therapy", "Positive Psychology"],
    concernsICanHelp: [
      "I'm burned out at work",
      "I can't manage my stress",
      "Work-life balance is difficult",
      "I need better coping strategies"
    ],
    pricing: {
      video: 1200,
      call: 1000,
      chat: 700
    },
    nextAvailableSlot: "Tomorrow, 10:00 AM",
    availability: [],
    rating: 4.6,
    reviewCount: 89,
    reviews: [],
    bio: "Dr. Chen focuses on helping professionals manage stress and prevent burnout through evidence-based interventions and mindfulness practices. He has extensive experience in workplace mental health and corporate wellness programs.",
    qualifications: [
      "M.Phil in Clinical Social Work",
      "Licensed Clinical Social Worker (LCSW)",
      "Certified Mindfulness Teacher",
      "Corporate Wellness Consultant"
    ],
    faqs: [],
    qas: [],
    articles: [],
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000302",
    name: "Dr. Emily Rodriguez",
    credentials: "Ph.D., LMFT",
    category: "family-therapist",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    yearsExperience: 12,
    languages: ["English", "Spanish", "Hindi"],
    location: "Delhi NCR, India",
    sessionModes: ["online", "offline", "video"],
    expertises: [
      "Relationship Skills",
      "Communication Skills",
      "Parenting Concerns",
      "Life Transitions",
      "Couples Therapy"
    ],
    topExpertises: ["Couples Therapy", "Family Counseling", "Communication"],
    approaches: ["Emotionally Focused Therapy (EFT)", "Gottman Method", "Attachment-Based Therapy"],
    concernsICanHelp: [
      "My relationship is struggling",
      "We can't communicate effectively",
      "Family conflicts are overwhelming",
      "Parenting challenges are stressful"
    ],
    pricing: {
      video: 2000,
      call: 1500,
      offline: 2500
    },
    nextAvailableSlot: "Oct 19, 2:00 PM",
    availability: [],
    rating: 4.9,
    reviewCount: 156,
    reviews: [],
    bio: "Dr. Rodriguez specializes in helping couples and families improve their relationships and communication. She uses evidence-based approaches like EFT and Gottman Method to address attachment issues and relationship challenges.",
    qualifications: [
      "Ph.D. in Marriage and Family Therapy",
      "Licensed Marriage and Family Therapist (LMFT)",
      "Certified EFT Therapist",
      "Gottman Level 3 Trained"
    ],
    faqs: [],
    qas: [],
    articles: [],
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000303",
    name: "Dr. James Thompson",
    credentials: "MD, Psychiatrist",
    category: "psychiatrist",
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    yearsExperience: 18,
    languages: ["English"],
    location: "Chennai, India",
    sessionModes: ["online", "offline"],
    expertises: [
      "Bipolar Disorder",
      "Schizophrenia",
      "Depressive Disorders",
      "Anxiety Disorders",
      "Medication Management"
    ],
    topExpertises: ["Bipolar Disorder", "Medication Management", "Mood Disorders"],
    approaches: ["Medication Management", "Psychopharmacology", "Integrated Care"],
    concernsICanHelp: [
      "I need medication evaluation",
      "My mood swings are severe",
      "I have a complex diagnosis",
      "Current medication isn't working"
    ],
    pricing: {
      video: 2500,
      offline: 3000
    },
    nextAvailableSlot: "Oct 20, 11:00 AM",
    availability: [],
    rating: 4.7,
    reviewCount: 203,
    reviews: [],
    bio: "Dr. Thompson is a board-certified psychiatrist with expertise in medication management for complex mental health conditions. He takes a collaborative approach to treatment planning, working closely with patients to find the right medication and dosage.",
    qualifications: [
      "MD, Psychiatry, AIIMS Delhi",
      "Board Certified Psychiatrist",
      "Fellowship in Mood Disorders",
      "20+ research publications"
    ],
    faqs: [],
    qas: [],
    articles: [],
    available: true
  },
  {
    id: "00000000-0000-0000-0000-000000000304",
    name: "Dr. Priya Sharma",
    credentials: "M.Phil, RCI Registered",
    category: "therapist",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    yearsExperience: 8,
    languages: ["English", "Hindi", "Marathi"],
    location: "Pune, India",
    sessionModes: ["online", "chat", "call"],
    expertises: [
      "LGBTQIA+ Concerns",
      "Identity Issues",
      "Anxiety Disorders",
      "Self-Esteem",
      "Young Adults"
    ],
    topExpertises: ["LGBTQIA+ Concerns", "Identity", "Young Adults"],
    approaches: ["Affirmative Therapy", "Person-Centered Therapy", "ACT"],
    concernsICanHelp: [
      "I'm struggling with my identity",
      "Coming out is difficult",
      "I need a safe, affirming space",
      "LGBTQ+ specific challenges"
    ],
    pricing: {
      video: 1300,
      call: 1100,
      chat: 900
    },
    nextAvailableSlot: "Today, 6:00 PM",
    availability: [],
    rating: 4.9,
    reviewCount: 67,
    reviews: [],
    bio: "Dr. Sharma provides LGBTQIA+ affirmative therapy, helping individuals with identity exploration, coming out processes, and dealing with discrimination. She creates a safe, affirming space for all clients and is passionate about queer mental health.",
    qualifications: [
      "M.Phil in Clinical Psychology",
      "RCI Registered Psychologist",
      "LGBTQ+ Affirmative Therapy Certification",
      "ACT Practitioner"
    ],
    faqs: [],
    qas: [],
    articles: [],
    available: true
  }
];

// ============================================================================
// EQUIP PROGRAMS DATA
// ============================================================================

const equipProgramsData = [
  {
    equip_id: "equip-sleep-well-28",
    id: "00000000-0000-0000-0000-000000000013",
    slug: "sleep-well",
    title: "Online Sleep Program",
    summary: "Enroll in our sleep training to finally put an end to restless nights and wake up feeling consistently refreshed.",
    description: "Enroll in our sleep training to finally put an end to restless nights and wake up feeling consistently refreshed. Based on cognitive behavioral therapy for insomnia (CBT-I) principles, this 28-day program helps you optimize your sleep environment, develop healthy sleep routines, and address racing thoughts.",
    price: {
      currency: "INR",
      amount_cents: 500000,
      payment_provider: "razorpay",
      one_time: true
    },
    duration_days: 28,
    expiry_days_after_purchase: 120,
    meta: {
      created_by: "seed_v1",
      created_at: "2025-09-18T00:00:00Z",
      version: "1.0",
      category: "sleep",
      tags: ["Sleep", "insomnia", "rest", "sleep hygiene", "CBT-I"]
    },
    tags: ["Sleep", "insomnia", "rest", "mental health"],
    created_at: "2025-09-18T00:00:00Z"
  },
  {
    equip_id: "equip-stress-30",
    id: "00000000-0000-0000-0000-000000000011",
    slug: "stress",
    title: "Practical Stress Relief",
    summary: "Defend your inner peace: implement practical stress reduction strategies for an overwhelmed or anxious mind.",
    description: "Defend your inner peace: implement practical stress reduction strategies for an overwhelmed or anxious mind. Learn evidence-based stress management strategies including mindfulness, cognitive reframing, and relaxation techniques.",
    price: {
      currency: "INR",
      amount_cents: 500000,
      payment_provider: "razorpay",
      one_time: true
    },
    duration_days: 30,
    expiry_days_after_purchase: 180,
    meta: {
      created_by: "seed_v1",
      created_at: "2025-09-18T00:00:00Z",
      version: "1.0",
      category: "stress",
      tags: ["Stress", "management", "mindfulness", "resilience", "coping"]
    },
    tags: ["Stress", "management", "mental health", "mindfulness"],
    created_at: "2025-09-18T00:00:00Z"
  },
  {
    equip_id: "equip-unburn-32",
    id: "00000000-0000-0000-0000-000000000010",
    slug: "unburn",
    title: "Defeat Burnout Now",
    summary: "The constant pressure has led to exhaustion. Rebuild your lost motivation and restore your life balance with Unburn.",
    description: "The constant pressure has led to exhaustion. Rebuild your lost motivation and restore your life balance with Unburn. This evidence-based 32-day program combines cognitive behavioral techniques with mindfulness practices.",
    price: {
      currency: "INR",
      amount_cents: 500000,
      payment_provider: "razorpay",
      one_time: true
    },
    duration_days: 32,
    expiry_days_after_purchase: 180,
    meta: {
      created_by: "seed_v1",
      created_at: "2025-09-18T00:00:00Z",
      version: "1.0",
      category: "burnout",
      tags: ["Burnout", "recovery", "wellness", "balance", "CBT"]
    },
    tags: ["Burnout", "recovery", "mental health", "wellness"],
    created_at: "2025-09-18T00:00:00Z"
  },
  {
    equip_id: "equip-mindfulness-21",
    id: "00000000-0000-0000-0000-000000000012",
    slug: "mindfulness",
    title: "21-Day Mindfulness Journey",
    summary: "Discover inner calm and build resilience through daily mindfulness practices.",
    description: "Discover inner calm and build resilience through daily mindfulness practices. This 21-day program introduces you to meditation, breathing exercises, and mindful living techniques to reduce stress and enhance well-being.",
    price: {
      currency: "INR",
      amount_cents: 400000,
      payment_provider: "razorpay",
      one_time: true
    },
    duration_days: 21,
    expiry_days_after_purchase: 90,
    meta: {
      created_by: "seed_v1",
      created_at: "2025-09-18T00:00:00Z",
      version: "1.0",
      category: "mindfulness",
      tags: ["Mindfulness", "meditation", "stress relief", "awareness", "calm"]
    },
    tags: ["Mindfulness", "meditation", "mental health", "wellness"],
    created_at: "2025-09-18T00:00:00Z"
  }
];

// ============================================================================
// PAGES DATA
// ============================================================================

const pagesData = [
  {
    id: "page-about",
    name: "About Us",
    title: "About iKan",
    slug: "about",
    content: "Learn about our mission to make mental health support accessible to everyone.",
    published: true,
    featured: false,
    order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "page-faq",
    name: "FAQ",
    title: "Frequently Asked Questions",
    slug: "faq",
    content: "Find answers to common questions about our services and platform.",
    published: true,
    featured: false,
    order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "page-privacy",
    name: "Privacy Policy",
    title: "Privacy Policy",
    slug: "privacy",
    content: "Your privacy is important to us. Learn how we protect and handle your data.",
    published: true,
    featured: false,
    order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "page-terms",
    name: "Terms of Use",
    title: "Terms of Use",
    slug: "terms",
    content: "Read our terms and conditions for using iKan services.",
    published: true,
    featured: false,
    order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "page-contact",
    name: "Contact Us",
    title: "Contact Us",
    slug: "contact",
    content: "Get in touch with our support team. We're here to help!",
    published: true,
    featured: true,
    order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "page-return",
    name: "Return Policy",
    title: "Return Policy",
    slug: "return-policy",
    content: "Information about refunds and returns for our services.",
    published: true,
    featured: false,
    order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "page-cancellation",
    name: "Cancellation Policy",
    title: "Cancellation Policy",
    slug: "cancellation-policy",
    content: "Learn about our cancellation policy for appointments and subscriptions.",
    published: true,
    featured: false,
    order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

export async function handleComprehensiveSeed() {
  try {
    console.log('🌱 Starting comprehensive iKan data seeding...');
    
    const results = {
      consultants: { seeded: 0, skipped: 0 },
      equipPrograms: { seeded: 0, skipped: 0 },
      resources: { seeded: 0, skipped: 0 },
      pages: { seeded: 0, skipped: 0 }
    };

    // ========================================
    // 1. SEED CONSULTANTS
    // ========================================
    console.log('👨‍⚕️ Seeding consultants...');
    for (const consultant of consultantsData) {
      const key = `consultant:${consultant.id}`;
      const existing = await kv.get(key);
      
      if (existing) {
        console.log(`  ⏭️  Skipping ${consultant.name} (already exists)`);
        results.consultants.skipped++;
      } else {
        await kv.set(key, consultant);
        console.log(`  ✅ Seeded ${consultant.name}`);
        results.consultants.seeded++;
      }
    }

    // ========================================
    // 2. SEED EQUIP PROGRAMS
    // ========================================
    console.log('💪 Seeding equip programs...');
    for (const program of equipProgramsData) {
      const key = `equip_program:${program.slug}`;
      const existing = await kv.get(key);
      
      if (existing) {
        console.log(`  ⏭️  Skipping ${program.title} (already exists)`);
        results.equipPrograms.skipped++;
      } else {
        await kv.set(key, program);
        console.log(`  ✅ Seeded ${program.title}`);
        results.equipPrograms.seeded++;
      }
    }

    // ========================================
    // 3. EXTEND EXISTING RESOURCES
    // ========================================
    console.log('📚 Checking additional resources...');
    
    const additionalResources = [
      {
        id: "resource-mindfulness-meditation",
        title: "Mindfulness Meditation for Beginners",
        excerpt: "Start your mindfulness journey with practical techniques you can use anywhere, anytime to find calm in the chaos.",
        content: "Mindfulness meditation is one of the most accessible and evidence-based practices for reducing stress and improving mental well-being. This guide will walk you through the fundamentals of mindfulness practice, from basic breathing exercises to more advanced techniques.\n\nWhat is Mindfulness?\n\nMindfulness is the practice of bringing your attention to the present moment without judgment. It's about observing your thoughts, feelings, and sensations as they arise, without getting caught up in them.\n\nGetting Started:\n\n1. Find a quiet space where you won't be disturbed\n2. Sit comfortably with your back straight\n3. Close your eyes or maintain a soft gaze\n4. Focus on your breath as it flows in and out\n5. When your mind wanders (and it will), gently bring it back to your breath\n\nBenefits of Regular Practice:\n\n- Reduced stress and anxiety\n- Improved focus and concentration\n- Better emotional regulation\n- Enhanced self-awareness\n- Improved sleep quality\n\nRemember, mindfulness is a skill that develops with practice. Start with just 5 minutes a day and gradually increase as you become more comfortable.",
        category: "Wellness",
        type: "article",
        image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        author: "Dr. Maya Patel",
        read_time_minutes: 5,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        published: true,
        tags: ["mindfulness", "meditation", "stress relief", "beginner"],
        metadata: {
          difficulty: "beginner",
          featured: false
        }
      },
      {
        id: "resource-sleep-hygiene",
        title: "Sleep Hygiene: Better Rest for Better Mental Health",
        excerpt: "Discover evidence-based strategies to improve your sleep quality and wake up feeling refreshed and recharged.",
        content: "Quality sleep is essential for mental health, yet many people struggle with getting adequate rest. This comprehensive guide explores the science of sleep hygiene and provides practical strategies you can implement tonight.\n\nWhat is Sleep Hygiene?\n\nSleep hygiene refers to the habits and practices that promote consistent, uninterrupted sleep. Good sleep hygiene can dramatically improve both the quality and quantity of your sleep.\n\nKey Principles:\n\n1. Maintain a Consistent Schedule\n- Go to bed and wake up at the same time every day, even on weekends\n- This helps regulate your body's internal clock\n\n2. Create a Bedtime Routine\n- Wind down 30-60 minutes before bed\n- Dim the lights\n- Avoid screens (blue light interferes with melatonin production)\n- Try reading, gentle stretching, or meditation\n\n3. Optimize Your Sleep Environment\n- Keep your bedroom cool (60-67°F is ideal)\n- Ensure it's dark and quiet\n- Invest in a comfortable mattress and pillows\n\n4. Watch What You Consume\n- Avoid caffeine after 2 PM\n- Limit alcohol (it may help you fall asleep but disrupts sleep quality)\n- Don't eat heavy meals close to bedtime\n\n5. Manage Stress and Worry\n- If racing thoughts keep you awake, try journaling before bed\n- Practice progressive muscle relaxation\n- Consider cognitive behavioral therapy for insomnia (CBT-I)\n\nThe Sleep-Mental Health Connection:\n\nPoor sleep doesn't just make you tired—it can worsen anxiety, depression, and other mental health conditions. Conversely, good sleep supports emotional regulation, cognitive function, and resilience.\n\nWhen to Seek Help:\n\nIf you've tried improving your sleep hygiene and still struggle with insomnia or poor sleep quality for more than a few weeks, consult a healthcare provider. You may benefit from professional assessment and treatment.",
        category: "Self-Care",
        type: "article",
        image_url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800",
        author: "Dr. James Wilson",
        read_time_minutes: 6,
        created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        published: true,
        tags: ["sleep", "insomnia", "rest", "sleep hygiene", "mental health"],
        metadata: {
          difficulty: "beginner",
          featured: false
        }
      },
      {
        id: "resource-cbt-anxiety",
        title: "Cognitive Behavioral Therapy for Anxiety: A Self-Help Guide",
        excerpt: "Learn how CBT techniques can help you challenge anxious thoughts and develop healthier thinking patterns.",
        content: "Cognitive Behavioral Therapy (CBT) is one of the most effective treatments for anxiety disorders. While working with a therapist is ideal, you can also learn and practice CBT techniques on your own.\n\nUnderstanding the CBT Model:\n\nCBT is based on the idea that our thoughts, feelings, and behaviors are interconnected. Anxious thoughts lead to anxious feelings, which lead to avoidance behaviors, which reinforce the anxious thoughts—creating a vicious cycle.\n\nThe good news? By changing how we think, we can change how we feel and behave.\n\nCore CBT Techniques for Anxiety:\n\n1. Cognitive Restructuring (Thought Challenging)\n\nWhen you notice anxious thoughts, ask yourself:\n- What's the evidence for and against this thought?\n- Am I catastrophizing or jumping to conclusions?\n- What would I tell a friend who had this thought?\n- What's a more balanced way to think about this situation?\n\nExample:\nAnxious thought: \"I'm going to fail this presentation and everyone will think I'm incompetent.\"\nBalanced thought: \"Presentations make me nervous, but I've prepared well. Even if it's not perfect, one presentation doesn't define my competence.\"\n\n2. Exposure Therapy\n\nGradually facing feared situations (rather than avoiding them) is one of the most powerful ways to overcome anxiety. Start with situations that cause mild anxiety and work your way up.\n\nCreate an exposure hierarchy:\n- Least anxiety-provoking → Most anxiety-provoking\n- Start at the bottom and work your way up\n- Stay in each situation until your anxiety decreases by at least 50%\n\n3. Behavioral Experiments\n\nTest your anxious predictions to see if they come true:\n- Predict what will happen\n- Do the feared activity\n- Observe what actually happens\n- Reflect on what you learned\n\n4. Worry Time\n\nIf you struggle with constant worrying:\n- Schedule 15-20 minutes of \"worry time\" each day\n- When worries arise outside this time, note them down and save them for worry time\n- During worry time, actively engage with your worries or problem-solve\n\n5. Relaxation Techniques\n\nWhile not a cure for anxiety, relaxation can help manage symptoms:\n- Deep breathing (4-7-8 technique)\n- Progressive muscle relaxation\n- Visualization exercises\n\nPutting It All Together:\n\nCBT is a skill that improves with practice. Be patient with yourself and celebrate small victories. If anxiety significantly interferes with your life, consider working with a CBT-trained therapist who can provide personalized guidance and support.\n\nRemember: You don't have to be a prisoner to anxious thoughts. With practice, you can learn to recognize, challenge, and change the thinking patterns that fuel anxiety.",
        category: "Mental Health",
        type: "guide",
        image_url: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=800",
        author: "Dr. Sarah Johnson",
        read_time_minutes: 10,
        created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        published: true,
        tags: ["anxiety", "CBT", "cognitive behavioral therapy", "self-help", "mental health"],
        metadata: {
          difficulty: "intermediate",
          featured: true
        }
      },
      {
        id: "resource-burnout-recovery",
        title: "Recovering from Burnout: A Step-by-Step Guide",
        excerpt: "Recognize the signs of burnout and learn practical strategies to reclaim your energy, motivation, and joy.",
        content: "Burnout isn't just feeling tired—it's emotional, physical, and mental exhaustion caused by prolonged stress. If you're experiencing burnout, recovery is possible, but it requires intentional action.\n\nRecognizing Burnout:\n\nBurnout typically involves three main components:\n1. Exhaustion - Feeling drained and unable to cope\n2. Cynicism - Feeling detached or negative about work/life\n3. Inefficacy - Feeling incompetent or unproductive\n\nOther signs include:\n- Chronic fatigue\n- Insomnia\n- Physical symptoms (headaches, digestive issues)\n- Increased illness\n- Irritability\n- Difficulty concentrating\n- Loss of enjoyment in activities you once loved\n\nThe Path to Recovery:\n\n1. Acknowledge the Problem\nBurnout won't improve on its own. The first step is admitting you're experiencing it and that change is needed.\n\n2. Identify the Root Causes\n- Workload too high?\n- Lack of control or autonomy?\n- Unclear expectations?\n- Lack of support?\n- Work-life imbalance?\n- Values misalignment?\n\n3. Set Boundaries\n- Learn to say no\n- Establish clear work hours\n- Take breaks (real breaks, without checking email)\n- Protect your time off\n\n4. Prioritize Self-Care\nThis isn't optional—it's essential:\n- Sleep 7-9 hours per night\n- Exercise regularly (even 20-30 minutes makes a difference)\n- Eat nutritious meals\n- Connect with loved ones\n- Engage in hobbies\n\n5. Practice Stress Management\n- Mindfulness meditation\n- Deep breathing exercises\n- Progressive muscle relaxation\n- Journaling\n\n6. Seek Support\n- Talk to trusted friends or family\n- Consider therapy or counseling\n- Join a support group\n- Consult with your doctor if symptoms are severe\n\n7. Make Necessary Changes\n\nSometimes recovery requires bigger changes:\n- Renegotiating your workload\n- Changing roles or departments\n- Setting different career goals\n- In some cases, changing jobs\n\n8. Rebuild Gradually\n\nDon't rush back into the same patterns:\n- Start small\n- Build sustainable habits\n- Regularly check in with yourself\n- Adjust as needed\n\nPreventing Future Burnout:\n\n- Regularly assess your stress levels\n- Maintain boundaries\n- Keep up with self-care (even when you're busy)\n- Build a support network\n- Align your work with your values\n- Take vacations and actually disconnect\n\nRemember: Recovery from burnout takes time. Be patient and compassionate with yourself. You didn't burn out overnight, and you won't recover overnight either—but with consistent effort, you can rebuild your energy and rediscover your passion.\n\nIf burnout symptoms persist or worsen, please seek professional help. Burnout can lead to more serious mental and physical health issues if left unaddressed.",
        category: "Workplace Wellness",
        type: "guide",
        image_url: "https://images.unsplash.com/photo-1499209974431-2771e86d0be3?w=800",
        author: "Dr. Michael Chen",
        read_time_minutes: 12,
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        published: true,
        tags: ["burnout", "stress", "work-life balance", "recovery", "mental health"],
        metadata: {
          difficulty: "beginner",
          featured: true
        }
      }
    ];

    for (const resource of additionalResources) {
      const key = `library:resource:${resource.id}`;
      const existing = await kv.get(key);
      
      if (existing) {
        console.log(`  ⏭️  Skipping ${resource.title} (already exists)`);
        results.resources.skipped++;
      } else {
        await kv.set(key, resource);
        console.log(`  ✅ Seeded ${resource.title}`);
        results.resources.seeded++;
      }
    }

    // ========================================
    // 4. SEED PAGES
    // ========================================
    console.log('📝 Seeding pages...');
    for (const page of pagesData) {
      const key = `cms_page:${page.slug}`; // Use slug, not id, to match backend pattern
      const existing = await kv.get(key);
      
      if (existing) {
        console.log(`  ⏭️  Skipping ${page.title} (already exists)`);
        results.pages.skipped++;
      } else {
        await kv.set(key, page);
        console.log(`  ✅ Seeded ${page.title}`);
        results.pages.seeded++;
      }
    }

    console.log('\n✅ Comprehensive seeding complete!');
    console.log('📊 Summary:');
    console.log(`   Consultants: ${results.consultants.seeded} seeded, ${results.consultants.skipped} skipped`);
    console.log(`   Equip Programs: ${results.equipPrograms.seeded} seeded, ${results.equipPrograms.skipped} skipped`);
    console.log(`   Resources: ${results.resources.seeded} seeded, ${results.resources.skipped} skipped`);
    console.log(`   Pages: ${results.pages.seeded} seeded, ${results.pages.skipped} skipped`);

    return {
      success: true,
      message: 'Comprehensive data seeded successfully',
      results
    };

  } catch (error) {
    console.error('❌ Comprehensive seeding error:', error);
    return {
      success: false,
      error: 'Failed to seed comprehensive data: ' + error.message
    };
  }
}