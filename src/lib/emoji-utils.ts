// emoji-utils.ts - iKan emoji system utilities
import tokens from './design-tokens';

export interface EmojiData {
  id: string;
  label: string;
  char: string;
  twemoji: string;
}

export interface MoodOption {
  emoji: string;
  label: string;
  value: number;
  id: string;
  color: string;
  twemoji?: string;
}

/**
 * Get emoji data from design tokens
 */
export function getEmojiData(rating: 1 | 2 | 3 | 4 | 5): EmojiData {
  const emojiData = tokens.emojiSet[rating.toString()];
  return {
    id: emojiData.id,
    label: emojiData.label,
    char: emojiData.char,
    twemoji: emojiData.twemoji
  };
}

/**
 * Get all mood options based on design tokens
 */
export function getMoodOptions(): MoodOption[] {
  return [
    {
      emoji: tokens.emojiSet["1"].char,
      label: tokens.emojiSet["1"].label,
      value: 1,
      id: tokens.emojiSet["1"].id,
      color: tokens.colors.status.danger, // Awful = danger
      twemoji: tokens.emojiSet["1"].twemoji
    },
    {
      emoji: tokens.emojiSet["2"].char,
      label: tokens.emojiSet["2"].label,
      value: 2,
      id: tokens.emojiSet["2"].id,
      color: tokens.colors.status.warning, // Bad = warning
      twemoji: tokens.emojiSet["2"].twemoji
    },
    {
      emoji: tokens.emojiSet["3"].char,
      label: tokens.emojiSet["3"].label,
      value: 3,
      id: tokens.emojiSet["3"].id,
      color: tokens.colors.neutral[500], // Meh = neutral
      twemoji: tokens.emojiSet["3"].twemoji
    },
    {
      emoji: tokens.emojiSet["4"].char,
      label: tokens.emojiSet["4"].label,
      value: 4,
      id: tokens.emojiSet["4"].id,
      color: tokens.colors.status.success, // Good = success
      twemoji: tokens.emojiSet["4"].twemoji
    },
    {
      emoji: tokens.emojiSet["5"].char,
      label: tokens.emojiSet["5"].label,
      value: 5,
      id: tokens.emojiSet["5"].id,
      color: tokens.colors.status.success, // Great = success (brighter)
      twemoji: tokens.emojiSet["5"].twemoji
    }
  ];
}

/**
 * Get mood option by rating value
 */
export function getMoodOptionByValue(rating: number): MoodOption | undefined {
  const options = getMoodOptions();
  return options.find(option => option.value === rating);
}

/**
 * Get mood color by rating value
 */
export function getMoodColor(rating: number): string {
  const option = getMoodOptionByValue(rating);
  return option?.color || tokens.colors.neutral[500];
}

/**
 * Get mood emoji by rating value
 */
export function getMoodEmoji(rating: number): string {
  const option = getMoodOptionByValue(rating);
  return option?.emoji || '😐';
}

/**
 * Get mood label by rating value
 */
export function getMoodLabel(rating: number): string {
  const option = getMoodOptionByValue(rating);
  return option?.label || 'Unknown';
}

/**
 * CSS custom properties for mood colors (for dynamic styling)
 */
export function getMoodCSSVars(rating: number): React.CSSProperties {
  const color = getMoodColor(rating);
  return {
    '--mood-color': color,
    '--mood-color-light': `${color}20`, // 20% opacity
    '--mood-color-border': `${color}40`  // 40% opacity
  } as React.CSSProperties;
}

/**
 * Validate mood rating
 */
export function isValidMoodRating(rating: any): rating is 1 | 2 | 3 | 4 | 5 {
  return typeof rating === 'number' && rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

/**
 * Get mood statistics helpers
 */
export function getMoodStats(ratings: number[]) {
  if (ratings.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: {},
      mostCommon: null,
      trend: 'neutral'
    };
  }

  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  const distribution = ratings.reduce((acc, rating) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const mostCommon = Object.entries(distribution)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  // Simple trend calculation (compare first half with second half)
  const midpoint = Math.floor(ratings.length / 2);
  const firstHalfAvg = ratings.slice(0, midpoint).reduce((sum, rating) => sum + rating, 0) / midpoint;
  const secondHalfAvg = ratings.slice(midpoint).reduce((sum, rating) => sum + rating, 0) / (ratings.length - midpoint);
  
  let trend = 'neutral';
  if (secondHalfAvg > firstHalfAvg + 0.3) trend = 'improving';
  else if (secondHalfAvg < firstHalfAvg - 0.3) trend = 'declining';

  return {
    average: Math.round(average * 10) / 10, // Round to 1 decimal place
    total: ratings.length,
    distribution,
    mostCommon: mostCommon ? parseInt(mostCommon) : null,
    trend
  };
}

export default {
  getEmojiData,
  getMoodOptions,
  getMoodOptionByValue,
  getMoodColor,
  getMoodEmoji,
  getMoodLabel,
  getMoodCSSVars,
  isValidMoodRating,
  getMoodStats
};