export const BLOCK_TYPES = [
  { label: 'Content', value: 'content', description: 'Read-only text content (Markdown)' },
  { label: 'Reflection', value: 'reflection', description: 'User text input for journaling' },
  { label: 'Exercise', value: 'exercise', description: 'Interactive dataset-driven exercise' },
  { label: 'Quiz', value: 'quiz', description: 'Multiple choice or rating question' }
];

export type BlockType = typeof BLOCK_TYPES[number]['value'];
