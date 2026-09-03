import { EquipProgram, DayContent, Activity, ExerciseConfig, InteractionType } from './equip-admin-types';

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
  subtitle?: string;
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
    if (q.options && Array.isArray(q.options)) {
      options = q.options.map(opt => {
        if (typeof opt === 'string') return opt;
        if (typeof opt === 'number') return String(opt);
        return opt.label || opt.text || String(opt.value ?? '') || opt.name || JSON.stringify(opt);
      });
      
      // Extract weights from option objects that have numeric values
      const extractedWeights = q.options.map((opt: any, idx: number) => {
        if (typeof opt === 'number') return opt;
        if (typeof opt === 'object' && opt !== null && typeof opt.value === 'number') return opt.value;
        // Fallback: use index as weight for Likert-like scales (Never=0, Rarely=1, ...)
        return idx;
      });
      weights = extractedWeights as number[];
    }
    
    // Fallback: If MCQ but no options, switch to text input to prevent broken UI
    if ((subtype === 'mcq' || subtype === 'multi-select') && options.length === 0) {
       console.warn(`Question "${q.text}" has type ${q.type} but no options found. Falling back to text input.`);
       subtype = 'ephemeral-journal';
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

    // Determine the unified interaction type
    const interaction: InteractionType = 
      subtype === 'multi-select' ? 'select-many' :
      subtype === 'ephemeral-journal' ? 'write' :
      subtype === 'rating_scale' ? 'rate' :
      subtype === 'clinical_instrument' ? 'clinical' :
      'select-one'; // mcq, single-select, etc.

    return {
      id: q.id,
      title: q.text, // For single day assessments, title is often the question
      type: 'exercise',
      interaction,
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
    subtitle: assessment.subtitle || undefined,
    description: assessment.description,
    activities,
    /**
     * `'assessment'`, not `'practice'`.
     *
     * A purpose-built assessment config has existed in `DAY_TYPE_CONFIG` the
     * whole time and was never reached, so every assessment ran with the
     * practice affordances: `autoAdvance` off, so answering took two taps per
     * question; a back button; a percentage bar on a stepped flow; and a final
     * button reading "Done for Today" on a questionnaire.
     *
     * This could not be flipped on its own — two strings in ProgramPlayer read
     * `dayType === 'practice'` directly and would have changed meaning with
     * it. They are fields on the config now, so the three move together.
     */
    dayType: 'assessment'
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