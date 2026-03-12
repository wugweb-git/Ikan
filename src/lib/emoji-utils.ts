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

export interface ScaleOption {
  value: number;
  id: string;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}

export interface ContextTag {
  id: string;
  label: string;
  emoji: string;
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
 * Get all mood options — returns cached server data if loaded, else design-token defaults
 */
export function getMoodOptions(): MoodOption[] {
  if (_cachedMoods) return _cachedMoods;
  return [
    {
      emoji: tokens.emojiSet["1"].char,
      label: tokens.emojiSet["1"].label,
      value: 1,
      id: tokens.emojiSet["1"].id,
      color: 'var(--color-status-danger)', // Awful = danger
      twemoji: tokens.emojiSet["1"].twemoji
    },
    {
      emoji: tokens.emojiSet["2"].char,
      label: tokens.emojiSet["2"].label,
      value: 2,
      id: tokens.emojiSet["2"].id,
      color: 'var(--color-status-warning)', // Bad = warning
      twemoji: tokens.emojiSet["2"].twemoji
    },
    {
      emoji: tokens.emojiSet["3"].char,
      label: tokens.emojiSet["3"].label,
      value: 3,
      id: tokens.emojiSet["3"].id,
      color: 'var(--color-neutral-500)', // Meh = neutral
      twemoji: tokens.emojiSet["3"].twemoji
    },
    {
      emoji: tokens.emojiSet["4"].char,
      label: tokens.emojiSet["4"].label,
      value: 4,
      id: tokens.emojiSet["4"].id,
      color: 'var(--color-status-success)', // Good = success
      twemoji: tokens.emojiSet["4"].twemoji
    },
    {
      emoji: tokens.emojiSet["5"].char,
      label: tokens.emojiSet["5"].label,
      value: 5,
      id: tokens.emojiSet["5"].id,
      color: 'var(--color-status-success)', // Great = success
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
  return option?.color || 'var(--color-neutral-500)';
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
    '--mood-color-light': `color-mix(in srgb, ${color} 12%, transparent)`,
    '--mood-color-border': `color-mix(in srgb, ${color} 25%, transparent)`
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

/**
 * Resolve a severity keyword to actual color/bg tokens
 */
function resolveSeverityColors(severity: string): { color: string; bg: string } {
  switch (severity) {
    case 'danger':
      return { color: 'var(--color-status-danger)', bg: 'var(--color-status-danger-light)' };
    case 'warning':
      return { color: 'var(--color-status-warning)', bg: 'var(--color-status-warning-light)' };
    case 'info':
      return { color: 'var(--color-status-info)', bg: 'var(--color-status-info-light)' };
    case 'success':
      return { color: 'var(--color-status-success)', bg: 'var(--color-status-success-light)' };
    case 'neutral':
    default:
      return { color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-200)' };
  }
}

/**
 * Get energy emoji by value
 */
export function getEnergyEmoji(value: number): string {
  const opt = getEnergyOptions().find(o => o.value === value);
  return opt?.emoji || '⚡';
}

/**
 * Get energy label by value
 */
export function getEnergyLabel(value: number): string {
  const opt = getEnergyOptions().find(o => o.value === value);
  return opt?.label || 'Moderate';
}

/**
 * Get stress emoji by value
 */
export function getStressEmoji(value: number): string {
  const opt = getStressOptions().find(o => o.value === value);
  return opt?.emoji || '😤';
}

/**
 * Get stress label by value
 */
export function getStressLabel(value: number): string {
  const opt = getStressOptions().find(o => o.value === value);
  return opt?.label || 'Medium';
}

// ═══════════════════════════════════════════════════════════════════
// ASYNC SERVER LOADING — Fetches admin-managed overrides from the
// server and caches them. Falls back to design-token defaults.
// ══════════════════════════════════════════════════════════════════

let _cachedMoods: MoodOption[] | null = null;
let _cachedEnergy: ScaleOption[] | null = null;
let _cachedStress: ScaleOption[] | null = null;
let _cachedTags: ContextTag[] | null = null;
let _cachedSleep: ScaleOption[] | null = null;
let _cachedPain: ScaleOption[] | null = null;
let _loadPromise: Promise<void> | null = null;

/**
 * Load custom scales from server. Call this once at app/page mount.
 * Safe to call multiple times (deduplicates).
 */
export async function loadCustomScales(apiBase: string, anonKey: string): Promise<void> {
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    const headers = { Authorization: `Bearer ${anonKey}` };
    try {
      const [eRes, sRes, tRes, slRes, pRes, moodsRes] = await Promise.all([
        fetch(`${apiBase}/scales/energy`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${apiBase}/scales/stress`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${apiBase}/scales/context-tags`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${apiBase}/scales/sleep`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${apiBase}/scales/pain`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${apiBase}/moods`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      // Mood types from AdminMoodManager (KV mood_type:* via /moods)
      if (moodsRes?.moods && Array.isArray(moodsRes.moods) && moodsRes.moods.length > 0) {
        _cachedMoods = moodsRes.moods
          .filter((m: any) => m.is_active !== false)
          .sort((a: any, b: any) => (a.value || a.order || 0) - (b.value || b.order || 0))
          .map((m: any) => ({
            emoji: m.emoji || m.char || '😐',
            label: m.label || 'Unknown',
            value: m.value,
            id: m.id,
            color: m.color || 'var(--color-neutral-500)',
          }));
      }

      if (eRes?.items && Array.isArray(eRes.items) && eRes.items.length > 0) {
        _cachedEnergy = eRes.items
          .filter((i: any) => i.is_active !== false)
          .sort((a: any, b: any) => a.order - b.order)
          .map((i: any) => {
            const { color, bg } = resolveSeverityColors(i.severity || 'neutral');
            return { value: i.value, id: i.id, label: i.label, emoji: i.emoji || i.char, color, bg };
          });
      }

      if (sRes?.items && Array.isArray(sRes.items) && sRes.items.length > 0) {
        _cachedStress = sRes.items
          .filter((i: any) => i.is_active !== false)
          .sort((a: any, b: any) => a.order - b.order)
          .map((i: any) => {
            const { color, bg } = resolveSeverityColors(i.severity || 'neutral');
            return { value: i.value, id: i.id, label: i.label, emoji: i.emoji || i.char, color, bg };
          });
      }

      if (tRes?.items && Array.isArray(tRes.items) && tRes.items.length > 0) {
        _cachedTags = tRes.items
          .filter((i: any) => i.is_active !== false)
          .sort((a: any, b: any) => a.order - b.order)
          .map((i: any) => ({ id: i.id, label: i.label, emoji: i.emoji || i.char }));
      }

      if (slRes?.items && Array.isArray(slRes.items) && slRes.items.length > 0) {
        _cachedSleep = slRes.items
          .filter((i: any) => i.is_active !== false)
          .sort((a: any, b: any) => a.order - b.order)
          .map((i: any) => {
            const { color, bg } = resolveSeverityColors(i.severity || 'neutral');
            return { value: i.value, id: i.id, label: i.label, emoji: i.emoji || i.char, color, bg };
          });
      }

      if (pRes?.items && Array.isArray(pRes.items) && pRes.items.length > 0) {
        _cachedPain = pRes.items
          .filter((i: any) => i.is_active !== false)
          .sort((a: any, b: any) => a.order - b.order)
          .map((i: any) => {
            const { color, bg } = resolveSeverityColors(i.severity || 'neutral');
            return { value: i.value, id: i.id, label: i.label, emoji: i.emoji || i.char, color, bg };
          });
      }

      console.log('✅ Custom check-in scales loaded from server');
    } catch (e) {
      console.warn('⚠️ Could not load custom scales, using design-token defaults:', e);
    }
  })();

  return _loadPromise;
}

/**
 * Clear cached scales (e.g. after admin save)
 */
export function clearScaleCache(): void {
  _cachedMoods = null;
  _cachedEnergy = null;
  _cachedStress = null;
  _cachedTags = null;
  _cachedSleep = null;
  _cachedPain = null;
  _loadPromise = null;
}

/**
 * Get energy options — returns cached server data if loaded, else design-token defaults
 */
export function getEnergyOptions(): ScaleOption[] {
  if (_cachedEnergy) return _cachedEnergy;
  return [1, 2, 3, 4, 5].map(v => {
    const entry = (tokens as any).energyScale[v.toString()];
    const { color, bg } = resolveSeverityColors(entry.severity);
    return { value: v, id: entry.id, label: entry.label, emoji: entry.char, color, bg };
  });
}

/**
 * Get stress options — returns cached server data if loaded, else design-token defaults
 */
export function getStressOptions(): ScaleOption[] {
  if (_cachedStress) return _cachedStress;
  return [1, 2, 3, 4, 5].map(v => {
    const entry = (tokens as any).stressScale[v.toString()];
    const { color, bg } = resolveSeverityColors(entry.severity);
    return { value: v, id: entry.id, label: entry.label, emoji: entry.char, color, bg };
  });
}

/**
 * Get context tags — returns cached server data if loaded, else design-token defaults
 */
export function getContextTags(): ContextTag[] {
  if (_cachedTags) return _cachedTags;
  return ((tokens as any).contextTags || []).map((t: any) => ({
    id: t.id,
    label: t.label,
    emoji: t.char,
  }));
}

/**
 * Get sleep options — returns cached server data if loaded, else hardcoded defaults
 */
export function getSleepOptions(): ScaleOption[] {
  if (_cachedSleep) return _cachedSleep;
  // Hardcoded defaults matching scales-routes.ts DEFAULT_SLEEP
  return [
    { value: 1, id: 'terrible',  label: 'Terrible',  emoji: '😩', color: 'var(--color-status-danger)',  bg: 'var(--color-status-danger-light)' },
    { value: 2, id: 'poor',      label: 'Poor',      emoji: '😴', color: 'var(--color-status-warning)', bg: 'var(--color-status-warning-light)' },
    { value: 3, id: 'fair',      label: 'Fair',      emoji: '😶‍🌫️', color: 'var(--color-neutral-500)',    bg: 'var(--color-neutral-200)' },
    { value: 4, id: 'good',      label: 'Good',      emoji: '😌', color: 'var(--color-status-success)', bg: 'var(--color-status-success-light)' },
    { value: 5, id: 'excellent', label: 'Excellent', emoji: '🌟', color: 'var(--color-status-success)', bg: 'var(--color-status-success-light)' },
  ];
}

/**
 * Get pain options — returns cached server data if loaded, else hardcoded defaults
 */
export function getPainOptions(): ScaleOption[] {
  if (_cachedPain) return _cachedPain;
  return [
    { value: 1, id: 'none',     label: 'None',     emoji: '😊', color: 'var(--color-status-success)', bg: 'var(--color-status-success-light)' },
    { value: 2, id: 'mild',     label: 'Mild',     emoji: '😐', color: 'var(--color-status-info)',    bg: 'var(--color-status-info-light)' },
    { value: 3, id: 'moderate', label: 'Moderate', emoji: '😕', color: 'var(--color-status-warning)', bg: 'var(--color-status-warning-light)' },
    { value: 4, id: 'severe',   label: 'Severe',   emoji: '😧', color: 'var(--color-status-danger)',  bg: 'var(--color-status-danger-light)' },
    { value: 5, id: 'extreme',  label: 'Extreme',  emoji: '😭', color: 'var(--color-status-danger)',  bg: 'var(--color-status-danger-light)' },
  ];
}

/**
 * Generic scale getter by key name — used by the dynamic check-in renderer
 */
export function getScaleByKey(key: string): ScaleOption[] {
  switch (key) {
    case 'mood':    return getMoodOptions().map(m => ({ value: m.value, id: m.id, label: m.label, emoji: m.emoji, color: m.color, bg: `color-mix(in srgb, ${m.color} 10%, transparent)` }));
    case 'energy':  return getEnergyOptions();
    case 'stress':  return getStressOptions();
    case 'sleep':   return getSleepOptions();
    case 'pain':    return getPainOptions();
    default:        return [];
  }
}

/**
 * Get all available scale keys with metadata — used by the admin builder dropdown
 * Reads actual data from server cache so the list reflects what admins have configured
 */
export function getAvailableScaleKeys(): { value: string; label: string; emoji: string; count: number }[] {
  return [
    { value: 'mood',    label: 'Mood',    emoji: getMoodOptions()[0]?.emoji || '🤔', count: getMoodOptions().length },
    { value: 'energy',  label: 'Energy',  emoji: getEnergyOptions()[0]?.emoji || '⚡', count: getEnergyOptions().length },
    { value: 'stress',  label: 'Stress',  emoji: getStressOptions()[0]?.emoji || '😌', count: getStressOptions().length },
    { value: 'sleep',   label: 'Sleep',   emoji: getSleepOptions()[0]?.emoji || '🌙', count: getSleepOptions().length },
    { value: 'pain',    label: 'Pain',    emoji: getPainOptions()[0]?.emoji || '💊', count: getPainOptions().length },
  ];
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
  getMoodStats,
  getEnergyOptions,
  getStressOptions,
  getContextTags,
  getSleepOptions,
  getPainOptions,
  getScaleByKey,
  getAvailableScaleKeys,
  getEnergyEmoji,
  getEnergyLabel,
  getStressEmoji,
  getStressLabel,
  loadCustomScales,
  clearScaleCache,
};