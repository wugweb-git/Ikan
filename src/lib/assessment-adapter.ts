import { EquipProgram, DayContent, Activity, ExerciseConfig } from './equip-admin-types';

// Legacy Types
interface LegacyQuestion {
  id: string;
  text: string;
  type: 'scale' | 'single-choice' | 'multiple-choice' | 'text' | 'dropdown' | 'mcq-icons' | 'true-false';
  options?: any[]; // string[] or object[]
  scoring?: Record<string, number>; // Legacy scoring map
  scaleMin?: number;
  scaleMax?: number;
  required?: boolean;
  stepGroup?: string;
  autoAdvance?: boolean;
  optionIcons?: string[];
}

interface LegacyAssessment {
  id: string;
  title: string;
  description: string;
  questions: LegacyQuestion[];
  scoring?: any;
}

export function adaptAssessmentToProgram(assessment: LegacyAssessment): EquipProgram {
  const activities: Activity[] = assessment.questions.map((q, index) => {
    // Determine subtype and options
    let subtype: ExerciseConfig['subtype'] = 'mcq';
    let options: string[] = [];
    let weights: number[] | undefined = undefined;

    if (q.type === 'multiple-choice') {
      subtype = 'multi-select';
    } else if (q.type === 'text') {
      subtype = 'ephemeral-journal'; // or simple text
    } else if (q.type === 'scale') {
      subtype = 'mcq'; 
      const min = q.scaleMin || 0;
      const max = q.scaleMax || 10;
      options = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
      // For scale, usually the value is the score
      weights = options.map(opt => parseInt(opt));
    } else {
      subtype = 'mcq';
    }

    // Normalize options
    if (q.options) {
      options = q.options.map(opt => (typeof opt === 'string' ? opt : opt.label || opt.text || opt.value));
    }
    
    // Map legacy scoring (key -> value) to weights array (index matches options)
    if (q.scoring && options.length > 0) {
      weights = options.map(opt => q.scoring?.[opt] || 0);
    }

    // Create config
    const config: ExerciseConfig = {
      subtype,
      prompt: q.text,
      options,
      scoring: {
        enabled: true,
        weights
      }
    };

    return {
      id: q.id,
      title: q.text, // For single day assessments, title is often the question
      type: 'exercise',
      content: '', // Question text is in config.prompt or title
      duration: 1,
      required: q.required ?? true,
      order: index,
      exerciseConfig: config,
      stepGroup: q.stepGroup,
      autoAdvance: q.autoAdvance
    };
  });

  const dayContent: DayContent = {
    day: 1,
    title: assessment.title,
    description: assessment.description,
    activities,
    dayType: 'practice'
  };

  return {
    id: assessment.id,
    title: assessment.title,
    slug: assessment.id,
    description: assessment.description,
    thumbnail: '',
    cover_image: '',
    category: 'assessment',
    duration_days: 1,
    published: true,
    price: 0,
    currency: 'USD',
    onboarding_questions: [],
    daily_content: [dayContent],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
