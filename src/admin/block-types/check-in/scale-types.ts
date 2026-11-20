import type React from 'react';

export interface ScaleItem {
  id: string;
  emoji: string;
  label: string;
  value: number;
  order: number;
  severity?: string;
  is_active: boolean;
}

export interface ScaleType {
  /** Also the endpoint segment: `/scales/{key}`. */
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

// Per-severity colours are data (tinted per row), so they stay inline.
export const SEVERITY_OPTIONS = [
  { value: 'very-low', label: 'Very Low', color: '#EF4444' },
  { value: 'low', label: 'Low', color: '#F97316' },
  { value: 'neutral', label: 'Neutral', color: '#EAB308' },
  { value: 'high', label: 'High', color: '#22C55E' },
  { value: 'very-high', label: 'Very High', color: '#10B981' },
];

export const SCALE_EMOJI_PICKS = [
  '😴', '🥱', '😐', '🙂', '😊', '😃', '🔥',
  '😰', '😤', '😌', '🧘', '💤', '🌙', '⚡',
  '💪', '🏃', '🎯', '❤️', '💔', '😖', '🤕',
  '🏷️', '📌', '🏠', '💼', '🎵', '🍽️', '👥',
];
