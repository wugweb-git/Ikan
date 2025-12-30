export const CATEGORIES = [
  { label: 'General', value: 'general' },
  { label: 'Anxiety', value: 'anxiety' },
  { label: 'Depression', value: 'depression' },
  { label: 'Stress', value: 'stress' },
  { label: 'Burnout', value: 'burnout' },
  { label: 'Sleep', value: 'sleep' },
  { label: 'Balance', value: 'balance' },
  { label: 'Focus', value: 'focus' },
  { label: 'Resilience', value: 'resilience' },
  { label: 'Motivation', value: 'motivation' },
  { label: 'Habits', value: 'habits' },
  { label: 'Mindfulness', value: 'mindfulness' },
  { label: 'Energy', value: 'energy' },
  { label: 'Relationships', value: 'relationships' },
  { label: 'Confidence', value: 'confidence' }
];

export type CategoryValue = typeof CATEGORIES[number]['value'];
