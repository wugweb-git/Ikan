import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { cn } from '../ui/utils';
import { Plus, ChevronLeft, TrendingUp, Check } from 'lucide-react';
import { CalendarStrip, type MarkedDate } from '../CalendarStrip';
import {
  getMoodOptions,
  getMoodOptionByValue,
  getMoodEmoji,
  getMoodColor,
  getEnergyOptions,
  getStressOptions,
  getContextTags,
  getEnergyEmoji,
  getStressEmoji,
  loadCustomScales,
} from '../../lib/emoji-utils';
import type { ScaleOption, ContextTag } from '../../lib/emoji-utils';
import tokens from '../../lib/design-tokens';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ─────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────

interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  stress?: number;
  note: string;
  context_tags?: string[];
  emotions?: string[];
  created_at?: string;
}

// Scales are read at render time (after loadCustomScales caches server data)
// These are module-level getters — they check cache first, fallback to design-tokens
const ENERGY_SCALE = () => getEnergyOptions();
const STRESS_SCALE = () => getStressOptions();
const CONTEXT_TAGS = () => getContextTags();

const B = {
  primary: tokens.colors.primary.default,
  primaryOn: tokens.colors.primary.on,
  yellow: tokens.colors.status.warning,
  yellowLight: tokens.colors.status['warning-light'],
  success: tokens.colors.status.success,
  successLight: tokens.colors.status['success-light'],
  danger: tokens.colors.status.danger,
  dangerLight: tokens.colors.status['danger-light'],
  info: tokens.colors.status.info,
  muted: tokens.colors.text.muted,
  textPrimary: tokens.colors.text.primary,
  bgPage: tokens.colors.background.page,
  bgCard: tokens.colors.background.card,
  bgMuted: tokens.colors.background.muted,
  border: tokens.colors.border.default,
};

const f = (size: string, weight: number = 400, color: string = B.textPrimary) => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string { return d.toISOString().split('T')[0]; }

function calculateStreak(entryDates: Set<string>): { current: number; longest: number } {
  const today = new Date();
  let current = 0;
  const d = new Date(today);
  if (!entryDates.has(toDateStr(d))) d.setDate(d.getDate() - 1);
  while (entryDates.has(toDateStr(d))) { current++; d.setDate(d.getDate() - 1); }
  const sorted = Array.from(entryDates).sort();
  let longest = 0, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
    if (diff === 1) run++; else { longest = Math.max(longest, run); run = 1; }
  }
  longest = Math.max(longest, run);
  if (sorted.length === 0) longest = 0;
  return { current, longest };
}

// ─── Animated Emoji Button ──────────────────────────────────────
function EmojiOption({
  emoji, label, selected, color, bg, onClick, delay = 0,
}: {
  emoji: string; label: string; selected: boolean; color: string; bg: string;
  onClick: () => void; delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring', stiffness: 280, damping: 18 }}
      whileHover={{ scale: 1.12, y: -6 }}
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 8, padding: '14px 8px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: selected ? bg : 'transparent',
        border: selected ? `2.5px solid ${color}` : '2.5px solid transparent',
        cursor: 'pointer',
        transition: 'background-color 0.2s, border-color 0.2s',
        flex: 1, minWidth: 0,
      }}
    >
      <motion.span
        style={{ fontSize: 42, lineHeight: 1, display: 'block' }}
        animate={selected
          ? { scale: [1, 1.35, 1.1, 1.2, 1], rotate: [0, -12, 12, -6, 0] }
          : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {emoji}
      </motion.span>
      <span style={{
        ...f('xs', selected ? 500 : 400, selected ? color : B.muted),
        lineHeight: 1.2, textAlign: 'center',
      }}>
        {label}
      </span>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function MoodJournal({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { isOnline, queueItem } = useOfflineSync();

  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(new Date()));
  const [scalesReady, setScalesReady] = useState(false);

  // Inline check-in state (replaces wizard overlay)
  const [checkinStep, setCheckinStep] = useState(0); // 0=mood, 1=energy, 2=stress, 3=note, 4=tags
  const [formData, setFormData] = useState({
    mood: null as number | null,
    energy: null as number | null,
    stress: null as number | null,
    note: '',
    tags: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const moodOptions = useMemo(() => getMoodOptions(), []);

  // ── Load custom scales from server (one-time) ──────────────────
  useEffect(() => {
    const apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
    loadCustomScales(apiBase, publicAnonKey).then(() => setScalesReady(true)).catch(() => setScalesReady(true));
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchEntries = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await apiClient.getJournalEntries(undefined, undefined, 200);
      const apiEntries = response?.entries || [];
      const formatted: MoodEntry[] = apiEntries.map((e: any) => ({
        id: e.journal_entry_id || e.id,
        date: e.date,
        mood: e.mood_rating || 3,
        energy: e.energy || 3,
        stress: e.stress_level,
        note: e.freehand_text_content || '',
        context_tags: e.context_tags || e.emotions || [],
        emotions: e.emotions,
        created_at: e.created_at || e.date,
      }));
      setEntries(formatted);
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      console.error('Failed to load journal entries:', error);
      showToast('error', 'Error', 'Could not load journal history.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, [user]);

  // ── Derived ────────────────────────────────────────────────────
  const todayStr = toDateStr(new Date());
  const entryDates = useMemo(() => new Set(entries.map(e => e.date)), [entries]);
  const streak = useMemo(() => calculateStreak(entryDates), [entryDates]);
  const isToday = selectedDate === todayStr;
  const todayHasEntry = entryDates.has(todayStr);

  const selectedEntries = useMemo(() =>
    entries
      .filter(e => e.date === selectedDate)
      .sort((a, b) => {
        const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tB - tA;
      }),
    [entries, selectedDate]
  );

  // Build markedDates map
  const markedDates = useMemo(() => {
    const map: Record<string, MarkedDate> = {};
    const today = new Date();
    const counts: Record<string, number> = {};
    entries.forEach(e => { counts[e.date] = (counts[e.date] || 0) + 1; });
    for (const ds of Object.keys(counts)) {
      const dayEntries = entries.filter(e => e.date === ds);
      const avgMood = Math.round(dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length);
      map[ds] = {
        status: 'done',
        count: counts[ds],
        emoji: getMoodEmoji(avgMood),
      };
    }
    for (let i = 30; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = toDateStr(d);
      if (!map[ds]) {
        map[ds] = { status: 'missed' };
      }
    }
    if (!map[todayStr]) {
      map[todayStr] = { status: 'pending' };
    }
    return map;
  }, [entries, todayStr]);

  // Sparkline data (14 days)
  const sparklineData = useMemo(() => {
    const points: { date: string; avg: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const ds = toDateStr(d);
      const dayEs = entries.filter(e => e.date === ds);
      points.push({ date: ds, avg: dayEs.length > 0 ? dayEs.reduce((s, e) => s + e.mood, 0) / dayEs.length : 0 });
    }
    return points;
  }, [entries]);

  // Selected date label
  const selectedDateLabel = useMemo(() => {
    if (selectedDate === todayStr) return 'Today';
    const d = new Date(selectedDate + 'T12:00:00');
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (selectedDate === toDateStr(yesterday)) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }, [selectedDate, todayStr]);

  // ── Reset check-in form when navigating to today ──
  useEffect(() => {
    if (isToday && !justSaved) {
      setCheckinStep(0);
      setFormData({ mood: null, energy: null, stress: null, note: '', tags: [] });
    }
  }, [selectedDate]);

  // ── Save handler ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !formData.mood) return;
    const payload = {
      date: todayStr, mood: formData.mood, note: formData.note,
      emotions: formData.tags, energy: formData.energy || 3,
      stress: formData.stress || 3, contextTags: formData.tags,
    };
    setIsSubmitting(true);
    try {
      if (isOnline) {
        await apiClient.createJournalEntry(
          payload.date, payload.mood, payload.note,
          payload.emotions, payload.energy, payload.stress, payload.contextTags
        );
        showToast('success', 'Saved!', 'Your mood check-in is saved.');
        await fetchEntries();
      } else {
        queueItem('mood_entry', payload);
        setEntries(prev => [{
          id: `local-${Date.now()}`, date: payload.date, mood: payload.mood,
          energy: payload.energy, stress: payload.stress, note: payload.note,
          context_tags: payload.contextTags, created_at: new Date().toISOString(),
        }, ...prev]);
        showToast('success', 'Saved Locally', 'Will sync when online.');
      }
      setJustSaved(true);
      setCheckinStep(0);
      setFormData({ mood: null, energy: null, stress: null, note: '', tags: [] });
    } catch (error) {
      console.error(error);
      queueItem('mood_entry', payload);
      showToast('warning', 'Queued', 'Saved locally.');
    } finally { setIsSubmitting(false); }
  };

  const TOTAL_STEPS = 5;
  const goNext = () => { if (checkinStep < TOTAL_STEPS - 1) setCheckinStep(s => s + 1); else handleSave(); };
  const goBack = () => { if (checkinStep > 0) setCheckinStep(s => s - 1); };

  // Start a new check-in (reset justSaved)
  const startNewCheckin = () => {
    setJustSaved(false);
    setCheckinStep(0);
    setFormData({ mood: null, energy: null, stress: null, note: '', tags: [] });
  };

  // ═══════════════════════════════════════════════════════════════
  // INLINE CHECK-IN (replaces wizard overlay)
  // ═══════════════════════════════════════════════════════════════

  const renderInlineCheckin = () => {
    // If just saved, show success + option to log again
    if (justSaved && todayHasEntry) {
      const entryCount = entries.filter(e => e.date === todayStr).length;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 250, damping: 20 }}
          style={{
            textAlign: 'center', padding: '36px 20px',
            backgroundColor: B.bgCard,
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${B.border}`,
            boxShadow: tokens.shadow.sm,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.1 }}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              backgroundColor: B.successLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Check size={28} style={{ color: B.success }} />
          </motion.div>
          <h3 style={{ ...f('lg', 500), margin: '0 0 4px' }}>Check-in saved!</h3>
          <p style={{ ...f('sm', 400, B.muted), margin: '0 0 8px' }}>
            {entryCount} {entryCount === 1 ? 'entry' : 'entries'} logged today
          </p>
          <p style={{ ...f('xs', 400, B.muted), margin: '0 0 20px' }}>
            Select a past date to view your entries
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={startNewCheckin}
            className="flex items-center justify-center mx-auto"
            style={{
              gap: 6, padding: '10px 20px',
              borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`,
              cursor: 'pointer', backgroundColor: B.bgCard,
              ...f('sm', 500),
            }}
          >
            <Plus size={14} /> Log Another
          </motion.button>
        </motion.div>
      );
    }

    // Step-by-step inline check-in
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundColor: B.bgCard,
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${B.border}`,
          boxShadow: tokens.shadow.sm,
          overflow: 'hidden',
        }}
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center" style={{ padding: '16px 20px 0', gap: 6 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === checkinStep ? 22 : 8,
                backgroundColor: i <= checkinStep ? B.yellow : B.bgMuted,
              }}
              style={{ height: 6, borderRadius: 3 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 22 }}
            />
          ))}
        </div>

        {/* Step content */}
        <div style={{ padding: '20px 20px 24px' }}>
          <AnimatePresence mode="wait">
            {/* Step 0: Mood */}
            {checkinStep === 0 && (
              <motion.div
                key="step-mood"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                style={{ textAlign: 'center' }}
              >
                <motion.span
                  style={{ fontSize: 52, display: 'block', marginBottom: 8 }}
                  animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, delay: 0.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
                >
                  {formData.mood ? getMoodEmoji(formData.mood) : '🤔'}
                </motion.span>
                <h2 style={{ ...f('lg', 500), margin: '0 0 4px' }}>How are you feeling?</h2>
                <p style={{ ...f('xs', 400, B.muted), margin: '0 0 20px' }}>
                  Tap the emoji that matches your vibe
                </p>
                <div className="flex items-stretch justify-center" style={{ gap: isMobile ? 2 : 6, maxWidth: 400, margin: '0 auto' }}>
                  {moodOptions.map((m, i) => (
                    <EmojiOption
                      key={m.value}
                      emoji={m.emoji}
                      label={m.label}
                      selected={formData.mood === m.value}
                      color={m.color}
                      bg={`color-mix(in srgb, ${m.color} 10%, transparent)`}
                      onClick={() => {
                        setFormData(p => ({ ...p, mood: m.value }));
                        setTimeout(goNext, 400);
                      }}
                      delay={0.06 + i * 0.06}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Energy */}
            {checkinStep === 1 && (
              <motion.div
                key="step-energy"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                style={{ textAlign: 'center' }}
              >
                <motion.span
                  style={{ fontSize: 52, display: 'block', marginBottom: 8 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.8, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {formData.energy ? ENERGY_SCALE().find(e => e.value === formData.energy)?.emoji : '⚡'}
                </motion.span>
                <h2 style={{ ...f('lg', 500), margin: '0 0 4px' }}>What's your energy like?</h2>
                <p style={{ ...f('xs', 400, B.muted), margin: '0 0 20px' }}>
                  From drained to fully charged
                </p>
                <div className="flex items-stretch justify-center" style={{ gap: isMobile ? 2 : 6, maxWidth: 400, margin: '0 auto' }}>
                  {ENERGY_SCALE().map((e, i) => (
                    <EmojiOption
                      key={e.value}
                      emoji={e.emoji}
                      label={e.label}
                      selected={formData.energy === e.value}
                      color={e.color}
                      bg={e.bg}
                      onClick={() => {
                        setFormData(p => ({ ...p, energy: e.value }));
                        setTimeout(goNext, 400);
                      }}
                      delay={0.06 + i * 0.06}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Stress */}
            {checkinStep === 2 && (
              <motion.div
                key="step-stress"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                style={{ textAlign: 'center' }}
              >
                <motion.span
                  style={{ fontSize: 52, display: 'block', marginBottom: 8 }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.2, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {formData.stress ? STRESS_SCALE().find(s => s.value === formData.stress)?.emoji : '😌'}
                </motion.span>
                <h2 style={{ ...f('lg', 500), margin: '0 0 4px' }}>Stress level?</h2>
                <p style={{ ...f('xs', 400, B.muted), margin: '0 0 20px' }}>
                  Be honest — there's no wrong answer
                </p>
                <div className="flex items-stretch justify-center" style={{ gap: isMobile ? 2 : 6, maxWidth: 400, margin: '0 auto' }}>
                  {STRESS_SCALE().map((s, i) => (
                    <EmojiOption
                      key={s.value}
                      emoji={s.emoji}
                      label={s.label}
                      selected={formData.stress === s.value}
                      color={s.color}
                      bg={s.bg}
                      onClick={() => {
                        setFormData(p => ({ ...p, stress: s.value }));
                        setTimeout(goNext, 400);
                      }}
                      delay={0.06 + i * 0.06}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Note */}
            {checkinStep === 3 && (
              <motion.div
                key="step-note"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                style={{ textAlign: 'center' }}
              >
                <motion.span
                  style={{ fontSize: 48, display: 'block', marginBottom: 8 }}
                  animate={{ rotate: [0, 6, -6, 0] }}
                  transition={{ duration: 2.5, delay: 0.3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ✏️
                </motion.span>
                <h2 style={{ ...f('lg', 500), margin: '0 0 4px' }}>Anything on your mind?</h2>
                <p style={{ ...f('xs', 400, B.muted), margin: '0 0 16px' }}>
                  A quick note to capture this moment
                </p>
                <motion.textarea
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  value={formData.note}
                  onChange={e => setFormData(p => ({ ...p, note: e.target.value }))}
                  placeholder="I felt…"
                  rows={3}
                  className="w-full resize-none focus:outline-none"
                  style={{
                    maxWidth: 400, margin: '0 auto', display: 'block',
                    padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${B.border}`,
                    backgroundColor: B.bgMuted,
                    ...f('sm'), lineHeight: 1.6,
                  }}
                />
                <div style={{ marginTop: 16, maxWidth: 400, margin: '16px auto 0' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={goNext}
                    style={{
                      width: '100%', padding: '12px 20px',
                      borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                      backgroundColor: B.primary,
                      ...f('sm', 500, B.primaryOn),
                      minHeight: 'var(--ikan-component-button-height)',
                    }}
                  >
                    {formData.note ? 'Next →' : 'Skip →'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Tags + Save */}
            {checkinStep === 4 && (
              <motion.div
                key="step-tags"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                style={{ textAlign: 'center' }}
              >
                <motion.span
                  style={{ fontSize: 48, display: 'block', marginBottom: 8 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.8, delay: 0.3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🏷️
                </motion.span>
                <h2 style={{ ...f('lg', 500), margin: '0 0 4px' }}>What shaped your day?</h2>
                <p style={{ ...f('xs', 400, B.muted), margin: '0 0 18px' }}>
                  Pick whatever applies — or skip to save
                </p>
                <div className="flex flex-wrap justify-center" style={{ gap: 8, maxWidth: 400, margin: '0 auto 20px' }}>
                  {CONTEXT_TAGS().map((tag, i) => {
                    const sel = formData.tags.includes(tag.label);
                    return (
                      <motion.button
                        key={tag.label}
                        initial={{ opacity: 0, scale: 0.8, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.06 + i * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() =>
                          setFormData(p => ({
                            ...p,
                            tags: sel ? p.tags.filter(t => t !== tag.label) : [...p.tags, tag.label],
                          }))
                        }
                        style={{
                          padding: '7px 14px', borderRadius: 'var(--radius-pill)',
                          backgroundColor: sel ? B.primary : B.bgCard,
                          color: sel ? B.primaryOn : B.textPrimary,
                          border: sel ? `1.5px solid ${B.primary}` : `1.5px solid ${B.border}`,
                          cursor: 'pointer', transition: 'background-color 0.2s, border-color 0.2s',
                          ...f('xs', 500, sel ? B.primaryOn : B.textPrimary),
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{tag.emoji}</span>
                        {tag.label}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Summary preview */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  style={{
                    maxWidth: 400, margin: '0 auto 16px',
                    padding: 12, borderRadius: 'var(--radius-md)',
                    backgroundColor: B.yellowLight,
                    border: `1.5px solid color-mix(in srgb, ${B.yellow} 25%, transparent)`,
                  }}
                >
                  <div className="flex items-center justify-center" style={{ gap: 8 }}>
                    <motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ fontSize: 24 }}>
                      {formData.mood ? getMoodEmoji(formData.mood) : '😐'}
                    </motion.span>
                    <span style={{ fontSize: 18 }}>{ENERGY_SCALE().find(e => e.value === formData.energy)?.emoji || '⚡'}</span>
                    <span style={{ fontSize: 18 }}>{STRESS_SCALE().find(s => s.value === formData.stress)?.emoji || '😌'}</span>
                  </div>
                  {formData.note && (
                    <p style={{ ...f('xs', 400, B.muted), margin: '4px 0 0', fontStyle: 'italic' }}>
                      "{formData.note.slice(0, 60)}{formData.note.length > 60 ? '…' : ''}"
                    </p>
                  )}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSave}
                  disabled={isSubmitting}
                  style={{
                    width: '100%', maxWidth: 400, padding: 'var(--spacing-3) var(--spacing-5)',
                    borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                    backgroundColor: B.yellow,
                    ...f('sm', 500, B.primary),
                    minHeight: 'var(--ikan-component-button-height)', opacity: isSubmitting ? 0.6 : 1,
                    boxShadow: `0 3px 12px color-mix(in srgb, ${B.yellow} 25%, transparent)`,
                  }}
                >
                  {isSubmitting ? 'Saving…' : 'Save Check-in ✨'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back button (steps > 0) */}
          {checkinStep > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={goBack}
              className="flex items-center mx-auto"
              style={{
                gap: 4, marginTop: 12,
                background: 'none', border: 'none', cursor: 'pointer',
                ...f('xs', 500, B.muted),
              }}
            >
              <ChevronLeft size={14} /> Back
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // ENTRY CARD (for past dates)
  // ═══════════════════════════════════════════════════════════════

  const renderEntryCard = (entry: MoodEntry, index: number) => {
    const moodOpt = getMoodOptionByValue(entry.mood);
    const moodEmoji = moodOpt?.emoji || '😐';
    const moodLabel = moodOpt?.label || 'Unknown';
    const moodColor = moodOpt?.color || B.muted;
    const energyInfo = ENERGY_SCALE().find(e => e.value === entry.energy);
    const stressInfo = STRESS_SCALE().find(s => s.value === (entry.stress || 3));
    const time = entry.created_at
      ? new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <motion.div
        key={entry.id}
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.07, duration: 0.4, type: 'spring', stiffness: 280, damping: 22 }}
        whileHover={{ y: -3, boxShadow: tokens.shadow.md }}
        style={{
          backgroundColor: B.bgCard,
          borderRadius: 'var(--radius-lg)',
          boxShadow: tokens.shadow.sm,
          overflow: 'hidden',
          border: `1px solid ${B.border}`,
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* Mood colour accent bar */}
        <div style={{ height: 3, backgroundColor: moodColor }} />

        <div style={{ padding: isMobile ? '14px 16px' : '16px 20px' }}>
          {/* Top row */}
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <div className="flex items-center" style={{ gap: 10 }}>
              <motion.span
                style={{ fontSize: 30 }}
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 16, delay: index * 0.07 + 0.1 }}
              >
                {moodEmoji}
              </motion.span>
              <div>
                <h3 style={{ ...f('sm', 500), margin: 0 }}>{moodLabel}</h3>
                {time && <span style={f('xs', 400, B.muted)}>{time}</span>}
              </div>
            </div>
            <span style={{
              padding: '3px 10px', borderRadius: 'var(--radius-pill)',
              backgroundColor: `color-mix(in srgb, ${moodColor} 10%, transparent)`, color: moodColor,
              ...f('xs', 500),
            }}>
              {entry.mood}/5
            </span>
          </div>

          {/* Metrics */}
          <div className="flex items-center flex-wrap" style={{ gap: 6, marginBottom: entry.note || (entry.context_tags?.length ?? 0) > 0 ? 10 : 0 }}>
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07 + 0.2 }}
              className="flex items-center"
              style={{
                gap: 4, padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                backgroundColor: B.bgMuted, ...f('xs', 400, B.muted),
              }}
            >
              {energyInfo?.emoji || '⚡'} {energyInfo?.label || '-'}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07 + 0.25 }}
              className="flex items-center"
              style={{
                gap: 4, padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                backgroundColor: B.bgMuted, ...f('xs', 400, stressInfo?.color || B.muted),
              }}
            >
              {stressInfo?.emoji || '😌'} {stressInfo?.label || '-'}
            </motion.span>
          </div>

          {/* Note */}
          {entry.note && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.07 + 0.3 }}
              style={{
                ...f('sm', 400), fontStyle: 'italic',
                margin: '0 0 8px', lineHeight: 1.5,
                padding: '8px 12px', backgroundColor: B.bgMuted,
                borderRadius: 'var(--radius-md)',
              }}
            >
              "{entry.note}"
            </motion.p>
          )}

          {/* Tags */}
          {entry.context_tags && entry.context_tags.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: 4 }}>
              {entry.context_tags.map(tag => {
                const tagInfo = CONTEXT_TAGS().find(t => t.label === tag);
                return (
                  <span key={tag} style={{
                    padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                    backgroundColor: B.bgMuted,
                    ...f('xs', 500, B.muted),
                  }}>
                    {tagInfo?.emoji || '✨'} {tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // SPARKLINE
  // ═══════════════════════════════════════════════════════════════

  const renderSparkline = () => {
    const validPoints = sparklineData.filter(p => p.avg > 0);
    if (validPoints.length < 2) return null;
    const W = isMobile ? 320 : 480;
    const H = 52;
    const PAD_X = 8, PAD_Y = 8;
    const pointsWithIdx = sparklineData.map((p, i) => ({ ...p, i })).filter(p => p.avg > 0);
    const xStep = (W - PAD_X * 2) / (sparklineData.length - 1);
    const mapY = (v: number) => PAD_Y + (1 - (v - 1) / 4) * (H - PAD_Y * 2);
    const coords = pointsWithIdx.map(p => ({ x: PAD_X + p.i * xStep, y: mapY(p.avg), avg: p.avg, date: p.date }));
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let ci = 1; ci < coords.length; ci++) {
      const cp1x = (coords[ci - 1].x + coords[ci].x) / 2;
      pathD += ` C ${cp1x} ${coords[ci - 1].y}, ${cp1x} ${coords[ci].y}, ${coords[ci].x} ${coords[ci].y}`;
    }
    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${H} L ${coords[0].x} ${H} Z`;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          backgroundColor: B.bgCard, borderRadius: 'var(--radius-lg)',
          boxShadow: tokens.shadow.sm, border: `1px solid ${B.border}`,
          padding: '12px 16px 8px', marginBottom: 20,
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <div className="flex items-center" style={{ gap: 6 }}>
            <TrendingUp size={14} style={{ color: B.yellow }} />
            <span style={{ ...f('xs', 500, B.muted), textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
              14-day mood
            </span>
          </div>
          <span style={f('xs', 400, B.muted)}>
            Avg {(validPoints.reduce((s, p) => s + p.avg, 0) / validPoints.length).toFixed(1)}/5
          </span>
        </div>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="sparkFillJ" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={B.yellow} stopOpacity={0.2} />
              <stop offset="100%" stopColor={B.yellow} stopOpacity={0} />
            </linearGradient>
          </defs>
          <motion.path d={areaD} fill="url(#sparkFillJ)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
          <motion.path d={pathD} fill="none" stroke={B.yellow} strokeWidth={2} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }} />
          {coords.map((pt, idx) => (
            <motion.circle key={pt.date} cx={pt.x} cy={pt.y} r={3}
              fill={getMoodColor(Math.round(pt.avg))}
              stroke={B.bgCard} strokeWidth={1.5}
              initial={{ opacity: 0, r: 0 }} animate={{ opacity: 1, r: 3 }}
              transition={{ delay: 0.6 + idx * 0.04, duration: 0.3 }}
            />
          ))}
        </svg>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div
      className={cn('w-full', isMobile ? 'min-h-full' : 'min-h-screen')}
      style={{
        backgroundColor: B.bgPage,
        padding: isMobile ? '16px 16px 112px' : '32px 32px 64px',
      }}
    >
      <div className={cn('w-full mx-auto', isMobile ? '' : 'max-w-4xl')}>
        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginBottom: 20 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ ...f(isMobile ? '2xl' : '3xl', 500), margin: 0 }}>
                Mood Journal
              </h1>
              <p style={{ ...f('sm', 400, B.muted), margin: '4px 0 0' }}>
                Track how you feel, one day at a time
              </p>
            </div>
          </div>
        </motion.header>

        {/* ── Streak bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center"
          style={{
            gap: 16, marginBottom: 16,
            padding: '12px 16px',
            backgroundColor: B.bgCard, borderRadius: 'var(--radius-lg)',
            boxShadow: tokens.shadow.sm, border: `1px solid ${B.border}`,
          }}
        >
          <motion.div
            className="flex items-center"
            style={{ gap: 8, flex: 1 }}
          >
            <motion.span
              animate={streak.current > 0 ? { rotate: [0, -10, 10, -5, 0], scale: [1, 1.15, 1] } : undefined}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ fontSize: 24 }}
            >
              {streak.current > 0 ? '🔥' : '💤'}
            </motion.span>
            <div>
              <span style={{ ...f('xs', 400, B.muted), display: 'block', lineHeight: 1.2 }}>Current streak</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ ...f('base', 500), display: 'block', lineHeight: 1.3 }}
              >
                {streak.current} {streak.current === 1 ? 'day' : 'days'}
              </motion.span>
            </div>
          </motion.div>

          <div style={{ width: 1, height: 32, backgroundColor: B.border }} />

          <motion.div
            className="flex items-center"
            style={{ gap: 8, flex: 1 }}
          >
            <span style={{ fontSize: 24 }}>🏆</span>
            <div>
              <span style={{ ...f('xs', 400, B.muted), display: 'block', lineHeight: 1.2 }}>Best streak</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ ...f('base', 500), display: 'block', lineHeight: 1.3 }}
              >
                {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
              </motion.span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Calendar Strip (adaptive pill design) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          style={{ marginBottom: 20 }}
        >
          <CalendarStrip
            selectedDate={selectedDate}
            onDateSelect={(ds) => {
              setSelectedDate(ds);
              if (ds === todayStr) {
                setJustSaved(false);
              }
            }}
            markedDates={markedDates}
            accentColor={B.yellow}
          />
        </motion.div>

        {/* ── Sparkline ── */}
        {renderSparkline()}

        {/* ── Content: Today = inline check-in, Past = entry cards ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {isToday ? (
              /* ── TODAY: Inline check-in ── */
              renderInlineCheckin()
            ) : (
              /* ── PAST DATE: Entry cards ── */
              <>
                {/* Date label */}
                <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span style={f('base', 500)}>{selectedDateLabel}</span>
                    {selectedEntries.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        style={{
                          padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                          backgroundColor: B.yellowLight, ...f('xs', 500, B.yellow),
                        }}
                      >
                        {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Entries or empty state */}
                {loading ? (
                  <div className="flex items-center justify-center" style={{ padding: '48px 0' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        border: `2.5px solid ${B.bgMuted}`,
                        borderTopColor: B.yellow,
                      }}
                    />
                  </div>
                ) : selectedEntries.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedEntries.map((entry, idx) => renderEntryCard(entry, idx))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, type: 'spring', stiffness: 250, damping: 20 }}
                    style={{
                      textAlign: 'center', padding: '40px 20px',
                      backgroundColor: B.bgCard,
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${B.border}`,
                      boxShadow: tokens.shadow.sm,
                    }}
                  >
                    <motion.span
                      style={{ fontSize: 52, display: 'block', marginBottom: 12 }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {new Date(selectedDate + 'T12:00:00') > new Date() ? '🔮' : '📭'}
                    </motion.span>
                    <h3 style={{ ...f('base', 500), margin: '0 0 4px' }}>
                      {new Date(selectedDate + 'T12:00:00') > new Date()
                        ? 'Future date'
                        : 'Nothing logged this day'}
                    </h3>
                    <p style={{ ...f('sm', 400, B.muted), margin: 0 }}>
                      {new Date(selectedDate + 'T12:00:00') > new Date()
                        ? "Can't peek into the future just yet!"
                        : "That's okay — every day is a fresh start"}
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}