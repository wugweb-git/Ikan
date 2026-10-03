import {
  Smile,
  Type,
  Tag,
  List,
  SlidersHorizontal,
  ToggleLeft,
  CircleAlert,
  type LucideIcon,
} from 'lucide-react';

// ── Types (matching backend) ────────────────────────────────────
export interface CheckinStep {
  id: string;
  order: number;
  type: 'emoji_scale' | 'free_text' | 'multi_select' | 'single_choice' | 'slider' | 'yes_no';
  question: string;
  subtitle?: string;
  hero_emoji?: string;
  scale_key?: string;
  options?: string[];
  slider_min?: number;
  slider_max?: number;
  slider_labels?: string[];
  required: boolean;
  ema_category?: string;
  save_as?: string;
}

export interface CheckinTemplate {
  id: string;
  name: string;
  description?: string;
  steps: CheckinStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type StepType = CheckinStep['type'];

// ── Block type metadata ─────────────────────────────────────────
export const BLOCK_TYPES: { value: StepType; label: string; icon: LucideIcon; description: string }[] = [
  { value: 'emoji_scale', label: 'Emoji Scale', icon: Smile, description: 'Pick from emoji options (mood, energy, etc.)' },
  { value: 'free_text', label: 'Free Text', icon: Type, description: 'Open-ended text input' },
  { value: 'multi_select', label: 'Multi Select', icon: Tag, description: 'Pick multiple tags/options' },
  { value: 'single_choice', label: 'Single Choice', icon: List, description: 'Pick one from a list' },
  { value: 'slider', label: 'Slider', icon: SlidersHorizontal, description: 'Numeric slider with labels' },
  { value: 'yes_no', label: 'Yes / No', icon: ToggleLeft, description: 'Simple binary question' },
];

// EMA categories come from KV via useMetadata().emaCategories — no fallback,
// KV is the single source of truth.
export const EMOJI_PICKS = [
  '🤔', '⚡', '😌', '🌙', '💊', '🏃', '✏️', '🏷️', '😊', '🧠', '❤️',
  '🔥', '💪', '🌟', '🎯', '📊', '💭', '🍽️', '🧘', '👥', '🎵',
  '😴', '😰', '😔', '😡', '🥰', '🙂', '😢', '🥱', '💚', '🌿',
  '☀️', '🌧️', '🫁', '🚶', '🧘‍♀️', '📝', '⏰', '🎧', '📖', '🤝',
];

export function getBlockIcon(type: StepType): LucideIcon {
  const found = BLOCK_TYPES.find(b => b.value === type);
  return found ? found.icon : CircleAlert;
}

export function getBlockLabel(type: StepType): string {
  return BLOCK_TYPES.find(b => b.value === type)?.label || type;
}

export const stepCountLabel = (n: number) => `${n} step${n !== 1 ? 's' : ''}`;

// ── Shared field classes ────────────────────────────────────────
// `Input` / `Button` set radius, font-size and border inline, so overriding
// them needs Tailwind's important modifier.
export const FIELD_INPUT = 'rounded-[var(--radius-md)]! border-[1.5px]! text-sm!';
export const FIELD_SELECT =
  'w-full px-2.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border-default)] bg-[var(--color-bg-input)] text-sm text-[var(--color-text-primary)] cursor-pointer';
export const FIELD_LABEL = 'block mb-1 text-xs font-medium text-[var(--color-text-muted)]';
