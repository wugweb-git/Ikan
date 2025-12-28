import { OnboardingQuestionSet } from '../equip-onboarding-types';

export const SLEEP_TIGHT_ONBOARDING: OnboardingQuestionSet = {
  id: 'st-onboarding-v1',
  equip_id: 'sleep-tight-9',
  title: 'Before we begin',
  description: 'A few questions to help us tailor your experience.',
  is_required_before_start: true,
  version: '1.0.0',
  
  sections: [
    { id: 'sec-1', question_set_id: 'st-onboarding-v1', title: 'Background', order: 1 }
  ],

  questions: [
    // 1. Occupation
    {
      id: 'q-occupation',
      section_id: 'sec-1',
      question_text: 'What do you do for a living?',
      order: 1,
      input_type: 'single_select',
      required: false,
      allow_skip: true,
      options: [
        { id: 'opt-emp', label: 'Employed', value: 'Employed' },
        { id: 'opt-self', label: 'Self-employed', value: 'Self-employed' },
        { id: 'opt-home', label: 'Homemaker', value: 'Homemaker' },
        { id: 'opt-student', label: 'Student', value: 'Student' },
        { id: 'opt-between', label: 'Between jobs', value: 'Between jobs' },
        { id: 'opt-ret', label: 'Retired', value: 'Retired' }
      ],
      privacy: {
        privacy_level: 'general',
        storage_type: 'equip_only',
        editable_after_start: true
      }
    },

    // 2. Therapy Experience
    {
      id: 'q-therapy',
      section_id: 'sec-1',
      question_text: 'Have you ever taken therapy before?',
      order: 2,
      input_type: 'single_select',
      required: false,
      allow_skip: true,
      allow_prefer_not_to_say: true,
      options: [
        { id: 'opt-yes', label: 'Yes', value: 'Yes' },
        { id: 'opt-no', label: 'No', value: 'No' }
      ],
      privacy: {
        privacy_level: 'sensitive',
        storage_type: 'equip_only',
        editable_after_start: true
      }
    },

    // 3. Therapy Details (Conditional)
    {
      id: 'q-therapy-reason',
      section_id: 'sec-1',
      question_text: 'If yes, what for?',
      order: 3,
      input_type: 'multi_select',
      required: false,
      allow_skip: true,
      options: [
        { id: 'opt-anx', label: 'Anxiety', value: 'Anxiety' },
        { id: 'opt-dep', label: 'Depression', value: 'Depression' },
        { id: 'opt-stress', label: 'Stress', value: 'Stress' },
        { id: 'opt-sleep', label: 'Sleep', value: 'Sleep' },
        { id: 'opt-other', label: 'Other', value: 'Other' }
      ],
      conditional_logic: {
        trigger_question_id: 'q-therapy',
        condition: 'equals',
        value: 'Yes'
      },
      privacy: {
        privacy_level: 'sensitive',
        storage_type: 'equip_only',
        editable_after_start: true
      }
    },

    // 4. Pre-existing Conditions
    {
      id: 'q-conditions',
      section_id: 'sec-1',
      question_text: 'Do you have any pre-existing conditions you\'d like us to be aware of?',
      order: 4,
      input_type: 'single_select',
      required: false,
      allow_skip: true,
      allow_prefer_not_to_say: true,
      options: [
        { id: 'opt-yes', label: 'Yes', value: 'Yes' },
        { id: 'opt-no', label: 'No', value: 'No' }
      ],
      privacy: {
        privacy_level: 'health_related',
        storage_type: 'equip_only',
        editable_after_start: true
      }
    },

    // 5. Condition Details (Conditional)
    {
      id: 'q-condition-details',
      section_id: 'sec-1',
      question_text: 'If yes, what?',
      order: 5,
      input_type: 'text',
      required: false,
      allow_skip: true,
      conditional_logic: {
        trigger_question_id: 'q-conditions',
        condition: 'equals',
        value: 'Yes'
      },
      privacy: {
        privacy_level: 'health_related',
        storage_type: 'equip_only',
        editable_after_start: true
      }
    }
  ]
};
