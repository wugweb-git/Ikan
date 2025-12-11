// Enhanced consultant data structure with comprehensive details
export interface ConsultantAvailability {
  date: string; // YYYY-MM-DD
  slots: {
    time: string; // HH:MM format
    available: boolean;
  }[];
}

export interface ConsultantReview {
  id: string;
  patientName: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  verified: boolean;
  helpful: number;
}

export interface ConsultantFAQ {
  question: string;
  answer: string;
}

export interface ConsultantQA {
  id: string;
  question: string;
  askedBy: string;
  askedDate: string;
  answer?: string;
  answeredDate?: string;
}

export interface ConsultantArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image?: string;
}

export interface Consultant {
  id: string;
  name: string;
  credentials: string; // M.Phil, M.Sc, etc.
  category: 'therapist' | 'psychiatrist' | 'counselor' | 'family-therapist';
  photo: string;
  yearsExperience: number;
  languages: string[];
  location: string;
  sessionModes: ('online' | 'offline' | 'call' | 'chat')[];
  expertises: string[]; // Full list
  topExpertises: string[]; // Top 3
  approaches: string[]; // CBT, ACT, DBT, etc.
  concernsICanHelp: string[]; // Exemplar phrases
  pricing: {
    video: number;
    call: number;
    chat: number;
    offline?: number;
  };
  nextAvailableSlot: string; // Human readable
  availability: ConsultantAvailability[];
  rating: number;
  reviewCount: number;
  reviews: ConsultantReview[];
  bio: string;
  qualifications: string[];
  faqs: ConsultantFAQ[];
  qas: ConsultantQA[];
  articles: ConsultantArticle[];
  available: boolean;
}

// Expertises from client feedback
export const expertiseCategories = [
  "Anxiety Disorders",
  "Depressive Disorders",
  "Relationship Skills",
  "Stress Management",
  "Anger Management",
  "Grief and Loss",
  "Loneliness",
  "Lack of Motivation",
  "Negative Thinking",
  "Overthinking",
  "Self-Improvement",
  "Sleep Disorder",
  "Bipolar Disorder",
  "Obsessive-Compulsive Disorder (OCD)",
  "Schizophrenia",
  "Sexual Dysfunction",
  "General Well-Being",
  "LGBTQIA+ Concerns",
  "Adult ADHD",
  "Personality Disorder",
  "Trauma",
  "Child Specialist / Child Therapy",
  "Eating Disorders",
  "Trauma-Related Disorders",
  "Adult Autism / Neurodiversity",
  "Geriatric Mental Health",
  "Fertility and Pregnancy Concerns",
  "Work-Related Concerns",
  "Parenting Concerns",
  "Life Transitions",
  "Academic Concerns",
  "Communication Skills",
  "PTSD",
  "Addiction Recovery",
  "Body Image",
  "Self-Esteem"
];

// Sample consultants data
export const consultantsData: Consultant[] = [
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
      },
      {
        date: "2025-10-18",
        slots: [
          { time: "09:00", available: true },
          { time: "10:00", available: true },
          { time: "11:00", available: false },
          { time: "14:00", available: true },
          { time: "15:00", available: false },
          { time: "16:00", available: true }
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
      },
      {
        id: "r2",
        patientName: "Priya M.",
        rating: 4,
        date: "2025-10-05",
        comment: "Very professional and empathetic. Creates a safe space to discuss difficult topics.",
        verified: true,
        helpful: 18
      }
    ],
    bio: "Dr. Johnson has over 15 years of experience helping individuals overcome anxiety, depression, and trauma. She specializes in cognitive behavioral therapy and trauma-informed care, creating a safe and supportive environment for healing. She has worked with diverse populations and is passionate about making mental health care accessible to all.",
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
      },
      {
        question: "How long are the sessions?",
        answer: "Standard sessions are 50 minutes. However, we can arrange extended sessions if needed, especially for trauma work."
      },
      {
        question: "Do you take insurance?",
        answer: "Yes, I accept most major insurance providers. Please contact my office to verify your specific plan."
      }
    ],
    qas: [
      {
        id: "qa1",
        question: "Do you work with clients who have social anxiety?",
        askedBy: "Raj K.",
        askedDate: "2025-10-12",
        answer: "Yes, social anxiety is one of my primary areas of expertise. I use a combination of CBT and exposure therapy to help clients gradually build confidence in social situations.",
        answeredDate: "2025-10-13"
      }
    ],
    articles: [
      {
        id: "a1",
        title: "Understanding Anxiety: It's Not Just Worry",
        excerpt: "Anxiety disorders are more than just feeling worried. Learn about the different types and how therapy can help...",
        date: "2025-10-01",
        readTime: "5 min read"
      }
    ],
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
    availability: [
      {
        date: "2025-10-18",
        slots: [
          { time: "10:00", available: true },
          { time: "11:00", available: true },
          { time: "15:00", available: true },
          { time: "16:00", available: false }
        ]
      }
    ],
    rating: 4.6,
    reviewCount: 89,
    reviews: [
      {
        id: "r3",
        patientName: "Amit S.",
        rating: 5,
        date: "2025-10-08",
        comment: "Helped me manage workplace stress effectively. Practical techniques that actually work!",
        verified: true,
        helpful: 15
      }
    ],
    bio: "Dr. Chen focuses on helping professionals manage stress and prevent burnout through evidence-based interventions and mindfulness practices. He has extensive experience in workplace mental health and corporate wellness programs.",
    qualifications: [
      "M.Phil in Clinical Social Work",
      "Licensed Clinical Social Worker (LCSW)",
      "Certified Mindfulness Teacher",
      "Corporate Wellness Consultant"
    ],
    faqs: [
      {
        question: "Do you offer corporate workshops?",
        answer: "Yes, I conduct workshops on stress management, resilience, and mindfulness for corporate teams. Please reach out for customized programs."
      }
    ],
    qas: [],
    articles: [
      {
        id: "a2",
        title: "5 Mindfulness Techniques for Busy Professionals",
        excerpt: "Discover simple mindfulness practices you can do at your desk to reduce stress and improve focus...",
        date: "2025-09-28",
        readTime: "4 min read"
      }
    ],
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
    availability: [
      {
        date: "2025-10-19",
        slots: [
          { time: "14:00", available: true },
          { time: "15:00", available: true },
          { time: "16:00", available: false }
        ]
      }
    ],
    rating: 4.9,
    reviewCount: 156,
    reviews: [
      {
        id: "r4",
        patientName: "Couple from Delhi",
        rating: 5,
        date: "2025-10-11",
        comment: "Dr. Rodriguez saved our marriage. Her approach is compassionate and effective. We learned to communicate better.",
        verified: true,
        helpful: 32
      }
    ],
    bio: "Dr. Rodriguez specializes in helping couples and families improve their relationships and communication. She uses evidence-based approaches like EFT and Gottman Method to address attachment issues and relationship challenges. She has helped hundreds of couples build stronger, healthier relationships.",
    qualifications: [
      "Ph.D. in Marriage and Family Therapy",
      "Licensed Marriage and Family Therapist (LMFT)",
      "Certified EFT Therapist",
      "Gottman Level 3 Trained"
    ],
    faqs: [
      {
        question: "Do you see couples only or individuals too?",
        answer: "I work with both couples and individuals. For relationship concerns, I often recommend couples therapy, but individual therapy can also be very helpful."
      },
      {
        question: "How many sessions do couples typically need?",
        answer: "It varies, but most couples see significant improvement in 12-16 sessions. We'll reassess regularly and adjust as needed."
      }
    ],
    qas: [
      {
        id: "qa2",
        question: "Can therapy help if only one partner wants to attend?",
        askedBy: "Anonymous",
        askedDate: "2025-10-10",
        answer: "Yes! Individual therapy can help you work on your part of the relationship dynamic. Often, when one partner makes changes, it positively affects the relationship. I also offer strategies to encourage your partner to join later.",
        answeredDate: "2025-10-11"
      }
    ],
    articles: [
      {
        id: "a3",
        title: "The 5 Love Languages: What They Really Mean",
        excerpt: "Understanding how you and your partner give and receive love can transform your relationship...",
        date: "2025-10-05",
        readTime: "6 min read"
      }
    ],
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
    availability: [
      {
        date: "2025-10-20",
        slots: [
          { time: "11:00", available: true },
          { time: "12:00", available: false },
          { time: "15:00", available: true }
        ]
      }
    ],
    rating: 4.7,
    reviewCount: 203,
    reviews: [
      {
        id: "r5",
        patientName: "Patient from Chennai",
        rating: 5,
        date: "2025-10-09",
        comment: "Dr. Thompson is thorough and knowledgeable. He explains everything clearly and adjusts medication based on my feedback.",
        verified: true,
        helpful: 28
      }
    ],
    bio: "Dr. Thompson is a board-certified psychiatrist with expertise in medication management for complex mental health conditions. He takes a collaborative approach to treatment planning, working closely with patients to find the right medication and dosage while minimizing side effects.",
    qualifications: [
      "MD, Psychiatry, AIIMS Delhi",
      "Board Certified Psychiatrist",
      "Fellowship in Mood Disorders",
      "20+ research publications"
    ],
    faqs: [
      {
        question: "Do I need a referral to see you?",
        answer: "No, you can book directly. However, if you're currently seeing a therapist, coordinating care can be beneficial."
      },
      {
        question: "How long is the first appointment?",
        answer: "Initial psychiatric evaluations are typically 60 minutes. Follow-up appointments are 30 minutes."
      }
    ],
    qas: [],
    articles: [
      {
        id: "a4",
        title: "Understanding Bipolar Disorder: More Than Mood Swings",
        excerpt: "Bipolar disorder is a complex condition that requires proper diagnosis and treatment. Learn about the different types...",
        date: "2025-09-25",
        readTime: "7 min read"
      }
    ],
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
    availability: [
      {
        date: "2025-10-17",
        slots: [
          { time: "18:00", available: true },
          { time: "19:00", available: true },
          { time: "20:00", available: false }
        ]
      }
    ],
    rating: 4.9,
    reviewCount: 67,
    reviews: [
      {
        id: "r6",
        patientName: "Anonymous",
        rating: 5,
        date: "2025-10-14",
        comment: "Dr. Sharma creates such a safe, affirming space. She truly understands LGBTQ+ concerns and helped me through a difficult coming out process.",
        verified: true,
        helpful: 41
      }
    ],
    bio: "Dr. Sharma provides LGBTQIA+ affirmative therapy, helping individuals with identity exploration, coming out processes, and dealing with discrimination. She creates a safe, affirming space for all clients and is passionate about queer mental health.",
    qualifications: [
      "M.Phil in Clinical Psychology",
      "RCI Registered Psychologist",
      "LGBTQ+ Affirmative Therapy Certification",
      "ACT Practitioner"
    ],
    faqs: [
      {
        question: "Is therapy confidential for LGBTQ+ clients?",
        answer: "Absolutely. Your identity and all session content is completely confidential unless there's a risk of harm. I create a safe, judgment-free space."
      }
    ],
    qas: [
      {
        id: "qa3",
        question: "Do you help with coming out to family?",
        askedBy: "Young Adult",
        askedDate: "2025-10-12",
        answer: "Yes, I work with many clients on coming out processes. We can explore if/when/how to come out, practice conversations, and process the emotions that come up.",
        answeredDate: "2025-10-13"
      }
    ],
    articles: [],
    available: true
  }
];

export default consultantsData;
