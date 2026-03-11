// 1️⃣ Assessment → Severity → Recommendation Mapping
// (Backend / Admin-managed rules)

export type SeverityLevel = 'low' | 'moderate' | 'high';

export interface SeverityBand {
  key: SeverityLevel;
  min: number;
  max: number;
}

export const SEVERITY_BANDS: SeverityBand[] = [
  { key: 'low', min: 0, max: 30 },
  { key: 'moderate', min: 31, max: 60 },
  { key: 'high', min: 61, max: 100 }
];

export interface RecommendationRule {
  if: { severity: SeverityLevel };
  recommend: {
    primary: string[]; // e.g., ['equip_program']
    equipIds?: string[];
    secondary: string[]; // e.g., ['resources', 'trackers', 'professional_support']
    message: string;
  };
}

export const RECOMMENDATION_RULES: Record<SeverityLevel, RecommendationRule> = {
  low: {
    if: { severity: 'low' },
    recommend: {
      primary: [],
      secondary: ['resources', 'trackers'],
      message: "You're doing relatively well. A few small habits and regular check-ins can help you stay balanced."
    }
  },
  moderate: {
    if: { severity: 'moderate' },
    recommend: {
      primary: ['equip_program'],
      equipIds: ['stress', 'sleep-tight'], // Default fallback if no specific mapping
      secondary: ['trackers', 'journaling'],
      message: "Some areas need attention. A short guided program can help you regain balance."
    }
  },
  high: {
    if: { severity: 'high' },
    recommend: {
      primary: ['equip_program'],
      equipIds: ['burnout', 'stress'],
      secondary: ['professional_support'],
      message: "Your responses suggest significant distress. Structured support and professional help are strongly recommended."
    }
  }
};

// 2️⃣ Cross-Program Overlap Logic (Sleep ↔ Stress ↔ Burnout)

export const OVERLAP_MAP: Record<string, string[]> = {
  "sleep": ["stress"],
  "stress": ["sleep", "burnout"],
  "burnout": ["stress", "sleep"]
};

export interface EscalationRule {
  if: {
    assessment: string; // key match
    severity: SeverityLevel;
  };
  alsoRecommend: string[];
}

export const ESCALATION_RULES: EscalationRule[] = [
  {
    if: { assessment: 'sleep', severity: 'high' },
    alsoRecommend: ['stress']
  },
  {
    if: { assessment: 'stress', severity: 'high' },
    alsoRecommend: ['burnout', 'sleep']
  }
];

// Helper to determine severity
export function getSeverity(score: number, maxScore: number): SeverityLevel {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  
  if (percentage <= 30) return 'low';
  if (percentage <= 60) return 'moderate';
  return 'high';
}

// Result Interface
export interface EngineResult {
  severity: SeverityLevel;
  primaryAction: {
    type: 'equip_program' | 'none';
    programId?: string; // The specific program ID to recommend
    title: string;
    body: string;
    cta: string;
  };
  secondaryActions: {
    type: string; // 'resources', 'trackers', 'professional_support', 'related_program'
    title: string;
    label?: string;
    route?: string;
  }[];
  severityMessage: string;
  showProfessionalSupportNote: boolean;
}

// Main Evaluation Function
export function evaluateAssessment(assessmentSlug: string, score: number, maxScore: number): EngineResult {
  const severity = getSeverity(score, maxScore);
  const rule = RECOMMENDATION_RULES[severity];
  
  // Determine relevant program based on assessment slug
  // In a real app, this might be a DB lookup. For now, we map slug keywords.
  let targetProgramId = '';
  const lowerSlug = (assessmentSlug || '').toLowerCase();
  
  if (lowerSlug.includes('sleep')) targetProgramId = 'sleep-tight';
  else if (lowerSlug.includes('stress') || lowerSlug.includes('anxiety')) targetProgramId = 'stress'; // Assuming 'stress' program exists
  else if (lowerSlug.includes('burnout')) targetProgramId = 'burnout';
  
  // If specific program not found but rule suggests equip_program, pick from defaults
  if (!targetProgramId && rule.recommend.primary.includes('equip_program')) {
     targetProgramId = rule.recommend.equipIds?.[0] || 'stress';
  }

  // Cross-Program Overlap (Add to secondary)
  const relatedPrograms: string[] = [];
  // 1. Check strict escalation rules
  const escalation = ESCALATION_RULES.find(r => 
    (lowerSlug.includes(r.if.assessment)) && r.if.severity === severity
  );
  if (escalation) {
    relatedPrograms.push(...escalation.alsoRecommend);
  } else {
    // 2. Fallback to generic overlap map
    const genericOverlap = Object.entries(OVERLAP_MAP).find(([key]) => lowerSlug.includes(key));
    if (genericOverlap && severity !== 'low') {
       relatedPrograms.push(...genericOverlap[1]);
    }
  }

  // Build the result object
  const result: EngineResult = {
    severity,
    severityMessage: rule.recommend.message,
    primaryAction: {
      type: rule.recommend.primary.includes('equip_program') ? 'equip_program' : 'none',
      programId: targetProgramId,
      title: "A guided program that can help right now",
      body: "Based on your responses, this program focuses on skills that can help reduce what you're experiencing.",
      cta: "Start program"
    },
    secondaryActions: [],
    showProfessionalSupportNote: severity === 'high'
  };

  // Add Secondary Recommendations
  // 1. Related Programs (from Overlap)
  relatedPrograms.forEach(progId => {
      // Avoid recommending the same as primary
      if (progId !== targetProgramId) { 
          // Normalize 'sleep' to 'sleep-tight' for the ID if needed
          const normalizedId = progId === 'sleep' ? 'sleep-tight' : progId;
          
          result.secondaryActions.push({
            type: 'related_program',
            title: 'You may also find this helpful',
            label: `Explore ${progId.charAt(0).toUpperCase() + progId.slice(1).replace('-', ' ')}`, 
            route: `/equip-program-flow?id=${normalizedId}` 
          });
      }
  });
  
  // 2. Generic Secondaries (Resources, Trackers)
  rule.recommend.secondary.forEach(action => {
    if (action === 'professional_support') {
       // This is handled by showProfessionalSupportNote usually, but can be a card too
    } else if (action === 'resources') {
      result.secondaryActions.push({
        type: 'resources',
        title: 'You may also find this helpful',
        label: 'Explore Equip',
        route: '/equip'
      });
    } else if (action === 'trackers') {
      result.secondaryActions.push({
        type: 'trackers',
        title: 'Track your progress',
        label: 'Explore Assessment',
        route: '/assessment'
      });
    }
  });
  
  // Deduplicate secondary actions by route/label if needed
  // ...

  return result;
}