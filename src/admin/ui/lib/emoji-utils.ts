// emoji-utils.ts - iKan emoji system utilities
// ALL scale data comes from server (KV). No hardcoded fallbacks.

import { apiClient } from '../../../shared/api/api';

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

// ═══════════════════════════════════════════════════════════════════
// SERVER-LOADED CACHE — populated by loadCustomScales() at app mount.
// No hardcoded fallbacks. If server hasn't been called yet, returns [].
// ═══════════════════════════════════════════════════════════════════

let _cachedMoods: MoodOption[] | null = null;
let _cachedEnergy: ScaleOption[] | null = null;
let _cachedStress: ScaleOption[] | null = null;
let _cachedTags: ContextTag[] | null = null;
let _cachedSleep: ScaleOption[] | null = null;
let _cachedPain: ScaleOption[] | null = null;
let _cachedCustomScales: Map<string, { name: string; emoji: string; count: number; items: ScaleOption[] }> = new Map();
let _loadPromise: Promise<void> | null = null;

/**
 * Load custom scales from server. Call this once at app/page mount.
 * Safe to call multiple times (deduplicates).
 * Server endpoints lazy-init defaults into KV on first read,
 * so this will always return data (never empty on a fresh tenant).
 */
export async function loadCustomScales(): Promise<void> {
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    // Public reads (anon key) through apiClient.
    const getPublic = (path: string) => apiClient.request(path, { method: 'GET' }, false);
    // Each scale falls back to its built-in default on failure, but the failure
    // is now logged instead of silently swallowed — a broken endpoint used to be
    // indistinguishable from "no custom scale configured".
    const fetchScale = (name: string) =>
      getPublic(`/scales/${name}`)
        .catch((err: unknown) => {
          console.warn(`[emoji-utils] /scales/${name} failed; using defaults`, err);
          return null;
        });
    try {
      const [eRes, sRes, tRes, slRes, pRes, moodsRes] = await Promise.all([
        fetchScale('energy'),
        fetchScale('stress'),
        fetchScale('context-tags'),
        fetchScale('sleep'),
        fetchScale('pain'),
        fetchScale('moods'),
      ]);

      // Mood types from /scales/moods (lazy-inited by server)
      const moodItems = moodsRes?.moods || moodsRes?.items;
      if (moodItems && Array.isArray(moodItems) && moodItems.length > 0) {
        _cachedMoods = moodItems
          .filter((m: any) => m.is_active !== false)
          .sort((a: any, b: any) => (a.value || a.order || 0) - (b.value || b.order || 0))
          .map((m: any) => ({
            emoji: m.emoji || m.char || '',
            label: m.label || '',
            value: m.value,
            id: m.id,
            color: m.color || 'var(--color-neutral-500)',
            twemoji: m.twemoji,
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

      // Load custom scales from /scales/list
      const listRes = await getPublic('/scales/list').catch(() => null);
      if (listRes?.scales && Array.isArray(listRes.scales)) {
        const customScaleMetas = listRes.scales.filter((s: any) => s.isCustom);
        // Fetch items for each custom scale in parallel
        const customFetches = await Promise.all(
          customScaleMetas.map((meta: any) =>
            getPublic(`/scales/custom/${meta.key}`).catch(() => null)
          )
        );
        _cachedCustomScales = new Map();
        customScaleMetas.forEach((meta: any, i: number) => {
          const data = customFetches[i];
          const items: ScaleOption[] = (data?.items || []).map((item: any, idx: number) => ({
            value: item.value ?? (idx + 1),
            id: item.id || `${meta.key}_${idx}`,
            label: item.label || '',
            emoji: item.emoji || '⭐',
            color: item.color || 'var(--color-neutral-500)',
            bg: item.bg || 'var(--color-neutral-100)',
          }));
          _cachedCustomScales.set(meta.key, { name: meta.name, emoji: meta.emoji || '⭐', count: items.length, items });
        });
      }

    } catch (e) {
      console.warn('Could not load custom scales from server:', e);
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
  _cachedCustomScales = new Map();
  _loadPromise = null;
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC GETTERS — return server-cached data or empty []
// ═══════════════════════════════════════════════════════════════════

/**
 * Get emoji data by numeric rating — uses server-cached moods
 */
export function getEmojiData(rating: 1 | 2 | 3 | 4 | 5): EmojiData {
  const moods = getMoodOptions();
  const match = moods.find(m => m.value === rating);
  if (match) {
    return { id: match.id, label: match.label, char: match.emoji, twemoji: match.twemoji || '' };
  }
  // Render-safety fallback (not data initialization — just prevents crash)
  return { id: `mood-${rating}`, label: `Level ${rating}`, char: '', twemoji: '' };
}

/**
 * Get all mood options — returns server-cached data
 */
export function getMoodOptions(): MoodOption[] {
  return _cachedMoods || [];
}

/**
 * Get mood option by rating value
 */
export function getMoodOptionByValue(rating: number): MoodOption | undefined {
  return getMoodOptions().find(option => option.value === rating);
}

/**
 * Get mood color by rating value
 */
export function getMoodColor(rating: number): string {
  return getMoodOptionByValue(rating)?.color || 'var(--color-neutral-500)';
}

/**
 * Get mood emoji by rating value
 */
export function getMoodEmoji(rating: number): string {
  return getMoodOptionByValue(rating)?.emoji || '';
}

/**
 * Get mood label by rating value
 */
export function getMoodLabel(rating: number): string {
  return getMoodOptionByValue(rating)?.label || '';
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

  const midpoint = Math.floor(ratings.length / 2);
  const firstHalfAvg = ratings.slice(0, midpoint).reduce((sum, rating) => sum + rating, 0) / midpoint;
  const secondHalfAvg = ratings.slice(midpoint).reduce((sum, rating) => sum + rating, 0) / (ratings.length - midpoint);
  
  let trend = 'neutral';
  if (secondHalfAvg > firstHalfAvg + 0.3) trend = 'improving';
  else if (secondHalfAvg < firstHalfAvg - 0.3) trend = 'declining';

  return {
    average: Math.round(average * 10) / 10,
    total: ratings.length,
    distribution,
    mostCommon: mostCommon ? parseInt(mostCommon) : null,
    trend
  };
}

/**
 * Get energy options — returns server-cached data
 */
export function getEnergyOptions(): ScaleOption[] {
  return _cachedEnergy || [];
}

/**
 * Get stress options — returns server-cached data
 */
export function getStressOptions(): ScaleOption[] {
  return _cachedStress || [];
}

/**
 * Get context tags — returns server-cached data
 */
export function getContextTags(): ContextTag[] {
  return _cachedTags || [];
}

/**
 * Get sleep options — returns server-cached data
 */
export function getSleepOptions(): ScaleOption[] {
  return _cachedSleep || [];
}

/**
 * Get pain options — returns server-cached data
 */
export function getPainOptions(): ScaleOption[] {
  return _cachedPain || [];
}

/**
 * Get energy emoji by value
 */
export function getEnergyEmoji(value: number): string {
  return getEnergyOptions().find(o => o.value === value)?.emoji || '';
}

/**
 * Get energy label by value
 */
export function getEnergyLabel(value: number): string {
  return getEnergyOptions().find(o => o.value === value)?.label || '';
}

/**
 * Get stress emoji by value
 */
export function getStressEmoji(value: number): string {
  return getStressOptions().find(o => o.value === value)?.emoji || '';
}

/**
 * Get stress label by value
 */
export function getStressLabel(value: number): string {
  return getStressOptions().find(o => o.value === value)?.label || '';
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
    default: {
      const custom = _cachedCustomScales.get(key);
      return custom?.items || [];
    }
  }
}

/**
 * Get all available scale keys with metadata — used by the admin builder dropdown
 */
export function getAvailableScaleKeys(): { value: string; label: string; emoji: string; count: number; isCustom?: boolean }[] {
  const builtIn = [
    { value: 'mood',    label: 'Mood',    emoji: getMoodOptions()[0]?.emoji || '🤔', count: getMoodOptions().length },
    { value: 'energy',  label: 'Energy',  emoji: getEnergyOptions()[0]?.emoji || '⚡', count: getEnergyOptions().length },
    { value: 'stress',  label: 'Stress',  emoji: getStressOptions()[0]?.emoji || '😌', count: getStressOptions().length },
    { value: 'sleep',   label: 'Sleep',   emoji: getSleepOptions()[0]?.emoji || '🌙', count: getSleepOptions().length },
    { value: 'pain',    label: 'Pain',    emoji: getPainOptions()[0]?.emoji || '💊', count: getPainOptions().length },
  ];
  const custom = Array.from(_cachedCustomScales.entries()).map(([key, meta]) => ({
    value: key,
    label: meta.name,
    emoji: meta.emoji,
    count: meta.count,
    isCustom: true,
  }));
  return [...builtIn, ...custom];
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