export interface AssessmentLandingContent {
  slug: string;
  title: string;
  description: string;
  whatIsIt: {
    title: string;
    description: string;
    bulletPoints: string[];
  };
  whatHappens: {
    title: string;
    bulletPoints: string[];
    additionalInfo: string;
  };
  about?: {
    title: string;
    description: string;
  };
  supportingInfo?: {
    title: string;
    description: string;
  };
  privacy: {
    title: string;
    description: string;
  };
  estimatedTime: string;
  questionCount: number;
}

export const assessmentLandingContent: Record<string, AssessmentLandingContent> = {
  'anxiety': {
    slug: 'anxiety',
    title: 'Anxiety Assessment (GAD-7)',
    description: 'We\'re glad you\'re taking the time to check-in on your mental health. This short screening helps identify symptoms of generalized anxiety disorder and measure their severity.',
    whatIsIt: {
      title: 'What is the GAD-7 anxiety assessment?',
      description: 'It\'s a 7-question test that asks about anxiety symptoms you\'ve experienced over the past 2 weeks.',
      bulletPoints: [
        'measure your level of anxiety symptoms',
        'help identify if you might benefit from professional support',
        'track changes in your anxiety over time'
      ]
    },
    whatHappens: {
      title: 'What will happen after the assessment?',
      bulletPoints: [
        'Find out your anxiety severity level, ranging from minimal to severe',
        'Learn what your results mean for your wellbeing',
        'Get personalized recommendations for next steps',
        'Access resources and tools to support your mental health'
      ],
      additionalInfo: 'Your responses are completely confidential and will help create a personalized mental health plan.'
    },
    privacy: {
      title: 'Your privacy is protected',
      description: 'Your responses are encrypted and stored securely. Only you can see your individual results.'
    },
    estimatedTime: '2 minutes',
    questionCount: 7
  },
  'depression': {
    slug: 'depression',
    title: 'Depression Assessment (PHQ-9)',
    description: 'Take a moment to check in on your mental wellbeing. This clinically validated screening helps identify symptoms of depression and their severity.',
    whatIsIt: {
      title: 'What is the PHQ-9 depression assessment?',
      description: 'It\'s a 9-question screening that evaluates depression symptoms you\'ve experienced over the past 2 weeks.',
      bulletPoints: [
        'assess the severity of depressive symptoms',
        'help determine if professional support would be beneficial',
        'monitor changes in your mood over time'
      ]
    },
    whatHappens: {
      title: 'What will happen after the assessment?',
      bulletPoints: [
        'Receive your depression severity score from minimal to severe',
        'Understand what your results mean for your mental health',
        'Get tailored recommendations for support and resources',
        'Access evidence-based tools for mood improvement'
      ],
      additionalInfo: 'This assessment is a starting point for understanding your mental health, not a diagnosis.'
    },
    privacy: {
      title: 'Your privacy is protected',
      description: 'All responses are confidential and securely stored. Your results are private to you.'
    },
    estimatedTime: '3 minutes',
    questionCount: 9
  },
  'anxiety-depression': {
    slug: 'anxiety-depression',
    title: 'Anxiety and Depression Test (K10)',
    description: 'We\'re glad you\'re taking the time to check-in on your mental health. Whatever you\'re going through, you\'re not alone – support is available. Completing the K10 test will help you understand what kind of support you might need right now.',
    whatIsIt: {
      title: 'What is the K10 assessment?',
      description: 'The K10 is a clinically validated 10-question screening tool that measures psychological distress including anxiety and depression symptoms.',
      bulletPoints: [
        'assess your current level of psychological distress',
        'identify if you might benefit from professional support',
        'understand your mental health status over the past 4 weeks'
      ]
    },
    whatHappens: {
      title: 'What will happen after the assessment?',
      bulletPoints: [
        'Receive your distress level score from low to very high',
        'Understand what your results mean for your wellbeing',
        'Get personalized recommendations for support and resources',
        'Access professional mental health services if needed'
      ],
      additionalInfo: 'This assessment is a starting point for understanding your mental health, not a diagnosis. Whatever you\'re going through, support is available.'
    },
    about: {
      title: 'About the K10',
      description: 'Professor Ronald C Kessler of the Department of Health Care Policy, Harvard Medical School is thanked for the use of research on the K10 funded by US Public Health Service Grants. The K10 is widely used by healthcare professionals and is recognized as a reliable screening tool for psychological distress.'
    },
    privacy: {
      title: 'Your privacy is protected',
      description: 'Your responses are completely confidential and stored securely. Only you can see your results.'
    },
    estimatedTime: '3 minutes',
    questionCount: 10
  },
  'burnout': {
    slug: 'burnout',
    title: 'Burnout Risk Assessment',
    description: 'Assess your risk of burnout and emotional exhaustion in work and personal life. Understanding burnout early can help prevent more serious mental health impacts.',
    whatIsIt: {
      title: 'What is the burnout risk assessment?',
      description: 'This comprehensive assessment evaluates signs of burnout across multiple dimensions of your life.',
      bulletPoints: [
        'identify early warning signs of burnout',
        'assess emotional exhaustion and engagement levels',
        'evaluate work-life balance and stress factors'
      ]
    },
    whatHappens: {
      title: 'What will happen after the assessment?',
      bulletPoints: [
        'Learn your burnout risk level from low to high',
        'Understand the factors contributing to your stress',
        'Receive personalized strategies for prevention and recovery',
        'Access burnout recovery programs and resources'
      ],
      additionalInfo: 'Early identification of burnout can help you take proactive steps to protect your wellbeing.'
    },
    privacy: {
      title: 'Your privacy is protected',
      description: 'Your burnout assessment results are confidential and stored securely.'
    },
    estimatedTime: '4 minutes',
    questionCount: 10
  },
  'wellbeing-index': {
    slug: 'wellbeing-index',
    title: 'Well-being Index (WHO-5)',
    description: 'The WHO-5 Well-Being Index measures your general wellbeing and positive mood. This internationally recognized tool provides insight into your overall mental health.',
    whatIsIt: {
      title: 'What is the WHO-5 wellbeing assessment?',
      description: 'It\'s a 5-question assessment measuring positive mood, vitality, and general interest in life.',
      bulletPoints: [
        'assess overall psychological wellbeing',
        'measure positive mood and life satisfaction',
        'track general mental health status'
      ]
    },
    whatHappens: {
      title: 'What will happen after the assessment?',
      bulletPoints: [
        'Receive your wellbeing score and interpretation',
        'Understand your current mental health status',
        'Get recommendations for maintaining or improving wellbeing',
        'Access resources for positive mental health'
      ],
      additionalInfo: 'This assessment focuses on positive aspects of mental health and overall life satisfaction.'
    },
    privacy: {
      title: 'Your privacy is protected',
      description: 'Your wellbeing assessment results are confidential and secure.'
    },
    estimatedTime: '2 minutes',
    questionCount: 5
  }
};

// Function to get assessment content by slug
export function getAssessmentContent(slug: string): AssessmentLandingContent | null {
  return assessmentLandingContent[slug] || null;
}

// Function to get stored assessment
export const getStoredAssessment = () => {
  try {
    const stored = localStorage.getItem('ikan-selected-assessment');
    if (!stored) return null;
    
    // Try to parse as JSON first (for object format)
    try {
      const parsed = JSON.parse(stored);
      return parsed;
    } catch {
      // If JSON.parse fails, treat it as a plain string (slug)
      return { slug: stored };
    }
  } catch {
    return null;
  }
};

// Default content for when no specific assessment is selected
export const getDefaultAssessmentContent = (): AssessmentLandingContent => ({
  slug: 'default',
  title: 'Anxiety and Depression Test (K10)',
  description: 'We\'re glad you\'re taking the time to check-in on your mental health. Whatever you\'re going through, you\'re not alone – support is available. Completing the K10 test will help you understand what kind of support you might need right now.',
  whatIsIt: {
    title: 'What is the K10 assessment?',
    description: 'The K10 is a clinically validated 10-question screening tool that measures psychological distress including anxiety and depression symptoms.',
    bulletPoints: [
      'assess your current level of psychological distress',
      'identify if you might benefit from professional support',
      'understand your mental health status over the past 4 weeks'
    ]
  },
  whatHappens: {
    title: 'What will happen after the assessment?',
    bulletPoints: [
      'Receive your distress level score from low to very high',
      'Understand what your results mean for your wellbeing',
      'Get personalized recommendations for support and resources',
      'Access professional mental health services if needed'
    ],
    additionalInfo: 'This assessment is a starting point for understanding your mental health, not a diagnosis. Whatever you\'re going through, support is available.'
  },
  about: {
    title: 'About the K10',
    description: 'Professor Ronald C Kessler of the Department of Health Care Policy, Harvard Medical School is thanked for the use of research on the K10 funded by US Public Health Service Grants. The K10 is widely used by healthcare professionals and is recognized as a reliable screening tool for psychological distress.'
  },
  privacy: {
    title: 'Your privacy is protected',
    description: 'Your responses are completely confidential and stored securely. Only you can see your results.'
  },
  estimatedTime: '3 minutes',
  questionCount: 10
});