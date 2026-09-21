import { useState, useEffect, useMemo } from 'react';
import {
  Calculator, Save, Plus, Trash2, CircleAlert, Info, ArrowUpDown,
  ChevronDown, ChevronUp, Lock, LockOpen, TriangleAlert, Check,
} from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { AdminStatusBadge } from './AdminStatusBadge';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { useMetadata } from '../../hooks/useMetadata';
import {
  SEVERITY_LEVELS, tierFor, validateBandTiling, formatBandInterval,
  type ScoringProfile, type ScoringBand, type SeverityLevel, type ScoreCalc,
} from '../../lib/scoring-engine';

/**
 * Scoring profile authoring (v2).
 *
 * Three things here are deliberate and easy to undo by accident:
 *
 *  - **Bands are half-open**, `[min, max)`, with the last closed. The interval
 *    is rendered as `5 ≤ score < 10`, never as `5–10`: a bare dash is how the
 *    off-by-one comes back through the UI after the data model removed it.
 *    Band width in the preview bar is `max − min`, not `max − min + 1`, for
 *    the same reason — the `+1` was a closed-interval step assumption.
 *
 *  - **A band's `label` and its `severity_ref` are separate fields.** "Poor
 *    Sleep" is copy the user reads; `moderate` is what the system reasons on.
 *    The colour comes from the severity term, so the swatch cannot disagree
 *    with the clinical meaning.
 *
 *  - **Direction is restated directly above the band list.** Bands are always
 *    stated in score space, ascending — direction never flips them. For a
 *    `higher_is_better` instrument the *lowest* band carries the worst
 *    severity, which is the single easiest thing here to get backwards and is
 *    the exact inversion that already shipped once in Balance scoring.
 *
 * The achievable range is a property of the assessment (its items and their
 * scales), not of the profile — a profile never names a question, which is
 * what lets one profile serve Burnout's 6-item and 5-item sub-scales. So
 * floor/ceiling coverage is checked by the coverage meter on the assessment;
 * here we can only check the band set's internal consistency, plus full 0-100
 * tiling when the basis is percent.
 */

const CALC_OPTIONS: { value: ScoreCalc; label: string; description: string }[] = [
  { value: 'sum', label: 'Sum', description: 'Add the item values' },
  { value: 'mean', label: 'Mean', description: 'Average of the item values — names its own denominator' },
  { value: 'sum_times_k', label: 'Sum × k', description: 'Sum then scale. WHO-5 uses k = 4 to express 0-25 as 0-100' },
  { value: 'from_scores', label: 'From other scores', description: 'Compose an overall from named sub-scores' },
];

/**
 * A **seed** for a band that has no tone yet, not a derivation.
 *
 * Tone is authored on the band, and every live band carries one, so this map
 * only ever fills a blank. It previously ran on every `severity_ref` change
 * with the lookup taking precedence over the stored value, which silently
 * discarded an authored tone the moment an editor adjusted the severity
 * beside it: the author's choice replaced by a table, with nothing on screen
 * saying so. The order is reversed now — an existing tone wins.
 */
const TONE_SEED_FOR_SEVERITY: Record<SeverityLevel, ScoringBand['tone']> = {
  minimal: 'success',
  mild: 'success',
  moderate: 'warning',
  'moderately-severe': 'warning',
  severe: 'error',
};

/**
 * Seed colours for the severity pickers, resolved from the design tokens.
 *
 * A colour input needs a literal hex, which is why five were typed in here —
 * the last hardcoded palette in the admin tree, and one that had already
 * drifted from the tokens the app renders with. Reading the tokens at runtime
 * keeps the picker working and removes the second copy: change a token and the
 * admin default follows.
 *
 * The literals remain as the last resort only. `getComputedStyle` returns ''
 * for an undefined property, and in a non-browser context there is no
 * document at all.
 */
const SEVERITY_COLOR_TOKENS: Record<SeverityLevel, string> = {
  minimal: '--color-status-success',
  mild: '--color-status-info',
  moderate: '--color-status-warning',
  'moderately-severe': '--color-status-warning',
  severe: '--color-status-danger',
};

const SEVERITY_COLOR_LAST_RESORT: Record<SeverityLevel, string> = {
  minimal: '#22C55E',
  mild: '#3B82F6',
  moderate: '#EAB308',
  'moderately-severe': '#F97316',
  severe: '#D4183D',
};

function resolveTokenColor(level: SeverityLevel): string {
  if (typeof document === 'undefined') return SEVERITY_COLOR_LAST_RESORT[level];
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(SEVERITY_COLOR_TOKENS[level]).trim();
  return v || SEVERITY_COLOR_LAST_RESORT[level];
}

const FALLBACK_SEVERITY_COLORS: Record<SeverityLevel, string> = {
  minimal: resolveTokenColor('minimal'),
  mild: resolveTokenColor('mild'),
  moderate: resolveTokenColor('moderate'),
  'moderately-severe': resolveTokenColor('moderately-severe'),
  severe: resolveTokenColor('severe'),
};

/** A row saved under the v1 schema, which the server validator now rejects. */
function isLegacyProfile(p: any): boolean {
  return !!p && (p.severity_bands !== undefined || p.normalize_to_100 !== undefined || p.method !== undefined);
}

interface AdminScoringEngineProps {
  onBack?: () => void;
}

export function AdminScoringEngine({ onBack }: AdminScoringEngineProps) {
  const { showToast } = useNotifications();
  const { severityLevels: kvSeverityLevels } = useMetadata();
  const [profiles, setProfiles] = useState<ScoringProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /**
   * severity slug → tier, read from the catalog. This is the authoritative
   * map; DEFAULT_TIER_MAP is only the fallback for before the catalog loads.
   */
  const catalogTierMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of kvSeverityLevels) {
      if (s.tier) map[s.value] = s.tier;
    }
    return map;
  }, [kvSeverityLevels]);

  const severityColor = useMemo(() => {
    const map: Record<string, string> = { ...FALLBACK_SEVERITY_COLORS };
    for (const s of kvSeverityLevels) {
      if (s.color) map[s.value] = s.color;
    }
    return map;
  }, [kvSeverityLevels]);

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await apiClient.request('/admin/scoring-profiles', { method: 'GET' }, true, 0).catch(() => null);
      setProfiles(Array.isArray(data?.profiles) ? data.profiles : []);
    } catch (e) {
      console.error('Failed to load scoring profiles:', e);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfile = () => {
    const stamp = Date.now();
    const newProfile: ScoringProfile = {
      id: `scoring-${stamp}`,
      version: 0, // server owns this; 0 marks "never saved"
      name: '',
      description: '',
      calc: 'sum',
      direction: 'higher_is_distress',
      band_basis: 'absolute',
      // Half-open and contiguous from the start, so a new profile is never
      // born with the gaps the old +1 defaults produced (0-4, 5-9, 10-14…).
      bands: [
        // No min/max, and no label. `min: 0, max: 5` was an invented range
        // presented as a starting point, and a range that looks authored is the
        // one an editor is least likely to check. The author sets both.
        // A3 deferred, deliberately. `min: 0, max: 5` IS an invented range
        // presented as a starting point. Removing it means making ScoringBand's
        // min/max optional, which was measured on 2026-09-03 at 28 new type
        // errors across scoring-engine, AdminScoringEngine and
        // AssessmentScoresEditor — every one a real decision about what an
        // unbounded edge means for tiling, validation and band lookup. That is
        // its own change, not a seed tweak. The label is left blank so at least
        // one field visibly demands authoring.
        { id: `band-${stamp}-1`, label: '', severity_ref: 'minimal', min: 0, max: 5, tone: 'success', interpretation: '' },
        { id: `band-${stamp}-2`, label: 'Mild', severity_ref: 'mild', min: 5, max: 10, tone: 'success', interpretation: '' },
        { id: `band-${stamp}-3`, label: 'Moderate', severity_ref: 'moderate', min: 10, max: 15, tone: 'warning', interpretation: '' },
        { id: `band-${stamp}-4`, label: 'Severe', severity_ref: 'severe', min: 15, max: 27, tone: 'error', interpretation: '' },
      ],
      missing: { min_answered: 0, on_missing: 'invalidate' },
      locked: false,
      created_at: '',
      updated_at: '',
    };
    setProfiles([...profiles, newProfile]);
    setExpandedId(newProfile.id);
  };

  const handleSaveProfile = async (profile: ScoringProfile) => {
    try {
      setSaving(profile.id);
      const res = await apiClient.request('/admin/scoring-profiles', {
        method: 'POST',
        body: JSON.stringify({ profile }),
      }, true, 0);
      if (res?.profile) {
        setProfiles(ps => ps.map(p => (p.id === profile.id ? res.profile : p)));
      }
      const warnings: string[] = Array.isArray(res?.warnings) ? res.warnings : [];
      if (warnings.length > 0) {
        showToast('warning', 'Saved with warnings', warnings.join(' '));
      } else {
        showToast('success', 'Profile saved', `"${profile.name}" saved.`);
      }
    } catch (e: any) {
      // The server returns the specific issues; surfacing the first few is far
      // more useful than "save failed".
      const issues: string[] = e?.body?.issues || e?.issues || [];
      showToast(
        'error',
        'Save rejected',
        issues.length > 0 ? issues.slice(0, 3).join(' ') : `Could not save: ${e?.message ?? e}`,
      );
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (!confirm(`Delete "${profile?.name || id}"? This cannot be undone.`)) return;
    // An unsaved draft (version 0) exists only locally — nothing to call.
    if (!profile || profile.version === 0) {
      setProfiles(ps => ps.filter(p => p.id !== id));
      return;
    }
    try {
      await apiClient.request(`/admin/scoring-profiles/${id}`, { method: 'DELETE' }, true, 0);
      setProfiles(ps => ps.filter(p => p.id !== id));
      showToast('success', 'Profile deleted');
    } catch (e: any) {
      // Refusals are meaningful here (profile still referenced) — do NOT drop
      // it from the list, or the UI will disagree with the server.
      showToast('error', 'Delete refused', e?.message ?? String(e));
    }
  };

  const updateProfile = (id: string, updates: Partial<ScoringProfile>) => {
    setProfiles(ps => ps.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const updateBand = (profileId: string, bandId: string, updates: Partial<ScoringBand>) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    updateProfile(profileId, {
      bands: profile.bands.map(b => (b.id === bandId ? { ...b, ...updates } : b)),
    });
  };

  const addBand = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    const sorted = [...profile.bands].sort((a, b) => a.min - b.min);
    const last = sorted[sorted.length - 1];
    // Start where the previous band ends — half-open bands abut exactly, so
    // there is no step to add and no gap to introduce.
    const min = last ? last.max : 0;
    updateProfile(profileId, {
      bands: [...profile.bands, {
        id: `band-${Date.now()}`,
        label: '',
        severity_ref: 'moderate',
        min,
        max: min + 5,
        tone: 'warning',
        interpretation: '',
      }],
    });
  };

  const removeBand = (profileId: string, bandId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    updateProfile(profileId, { bands: profile.bands.filter(b => b.id !== bandId) });
  };

  const stats = [
    {
      label: 'Scoring Profiles',
      value: profiles.length,
      icon: <Calculator className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />,
    },
    {
      label: 'Severity Levels',
      value: kvSeverityLevels.length || SEVERITY_LEVELS.length,
      icon: <ArrowUpDown className="w-4 h-4" style={{ color: 'var(--color-status-info)' }} />,
    },
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <AdminHeader title="Scoring Engine" description="Loading scoring profiles..." />
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} style={{ borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-6">
                <div className="h-6 w-48 rounded" style={{ backgroundColor: 'var(--color-bg-muted)' }} />
                <div className="h-4 w-96 rounded mt-2" style={{ backgroundColor: 'var(--color-bg-muted)', opacity: 0.6 }} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const labelStyle = { fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' } as const;
  const mutedText = {
    fontFamily: 'var(--font-family-base)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    lineHeight: '1.5',
  } as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <AdminHeader
        title="Scoring Engine"
        description="Scoring profiles: how a score is calculated and which severity band it lands in"
        stats={stats}
        actions={
          <Button onClick={handleAddProfile} className="gap-2" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
            <Plus className="w-4 h-4" /> Add Profile
          </Button>
        }
      />

      <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-status-info)', backgroundColor: 'var(--color-status-info-light)' }}>
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-status-info)' }} />
          <div className="space-y-1">
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
              How scoring works
            </p>
            <p style={mutedText}>
              A profile describes <strong>one</strong> score: how to calculate it, which way is
              worse, and which bands it falls into. It never names a question — that is why one
              profile can serve sub-scales of different lengths. Questions are attached to a
              score on the assessment itself, and the achievable range is computed there.
            </p>
            <p style={mutedText}>
              Bands are <strong>half-open</strong>: a band written <code>5 ≤ score &lt; 10</code>{' '}
              includes 5 and excludes 10, so the next band starts at exactly 10 with no gap and
              no step to guess. A band's <strong>label</strong> is copy the user reads
              ("Poor Sleep"); its <strong>severity</strong> is what the system reasons on.
            </p>
          </div>
        </CardContent>
      </Card>

      {profiles.length === 0 && (
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border-default)' }}>
          <CardContent className="p-8 text-center space-y-2">
            <Calculator className="w-8 h-8 mx-auto" style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
              No scoring profiles yet
            </p>
            <p style={{ ...mutedText, maxWidth: '32rem', margin: '0 auto' }}>
              Create one to define how an assessment's score maps to severity bands.
            </p>
          </CardContent>
        </Card>
      )}

      {profiles.map(profile => {
        const legacy = isLegacyProfile(profile);
        const sortedBands = [...(profile.bands ?? [])].sort((a, b) => a.min - b.min);
        const span = sortedBands.length > 0
          ? { min: sortedBands[0].min, max: sortedBands[sortedBands.length - 1].max }
          : { min: 0, max: 0 };
        // Percent bands must tile 0-100 fully. Absolute bands are checked
        // against their own span, so only gaps/overlaps surface here — the
        // floor and ceiling belong to the assessment's achievable range.
        const checkRange = profile.band_basis === 'percent' ? { min: 0, max: 100 } : span;
        const tiling = validateBandTiling(profile.bands ?? [], checkRange, 'absolute');
        const totalSpan = span.max - span.min;

        return (
          <Card key={profile.id} style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedId(expandedId === profile.id ? null : profile.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle style={{ fontSize: 'var(--text-base)' }}>
                    {profile.name || <span style={{ color: 'var(--color-text-muted)' }}>Untitled profile</span>}
                  </CardTitle>
                  <p style={{ ...mutedText, marginTop: 'var(--spacing-1)' }}>
                    {profile.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {profile.locked && (
                    <AdminStatusBadge status="warning" label="Locked" />
                  )}
                  {profile.version === 0
                    ? <AdminStatusBadge status="info" label="Unsaved" />
                    : <AdminStatusBadge status="neutral" label={`v${profile.version}`} />}
                  <AdminStatusBadge
                    status={tiling.status === 'green' ? 'success' : tiling.status === 'amber' ? 'warning' : 'danger'}
                    label={tiling.status === 'green' ? 'Bands tile' : `${tiling.issues.length} band issue${tiling.issues.length === 1 ? '' : 's'}`}
                  />
                  {expandedId === profile.id
                    ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </div>
              </div>
            </CardHeader>

            {expandedId === profile.id && (
              <CardContent className="space-y-5 pt-0">
                {legacy && (
                  <div
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ border: '1px solid var(--color-status-danger)', backgroundColor: 'var(--color-status-danger-light)' }}
                  >
                    <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-status-danger)' }} />
                    <p style={mutedText}>
                      This profile was saved under the old schema (<code>method</code>,{' '}
                      <code>severity_bands</code>, <code>normalize_to_100</code>) and the server
                      will reject it. Its bands carry no <code>severity_ref</code>, so the clinical
                      term cannot be recovered from the label automatically — re-author it rather
                      than converting it, and check each band's severity by hand.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label style={labelStyle}>Profile name</Label>
                    <Input
                      value={profile.name}
                      onChange={e => updateProfile(profile.id, { name: e.target.value })}
                      placeholder="e.g. PHQ-9, WHO-5 wellbeing"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label style={labelStyle}>Calculation</Label>
                    <Select value={profile.calc} onValueChange={(v: any) => updateProfile(profile.id, { calc: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CALC_OPTIONS.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p style={mutedText}>{CALC_OPTIONS.find(c => c.value === profile.calc)?.description}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label style={labelStyle}>Description</Label>
                  <Input
                    value={profile.description}
                    onChange={e => updateProfile(profile.id, { description: e.target.value })}
                    placeholder="When this profile is used"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.calc === 'sum_times_k' && (
                    <div className="space-y-1">
                      <Label style={labelStyle}>k (multiplier)</Label>
                      <Input
                        type="number"
                        value={profile.k ?? ''}
                        onChange={e => updateProfile(profile.id, { k: e.target.value === '' ? undefined : Number(e.target.value) })}
                        placeholder="4"
                      />
                      <p style={mutedText}>Required for Sum × k.</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label style={labelStyle}>Direction</Label>
                    <Select value={profile.direction} onValueChange={(v: any) => updateProfile(profile.id, { direction: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="higher_is_distress">Higher score = more distress</SelectItem>
                        <SelectItem value="higher_is_better">Higher score = better</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label style={labelStyle}>Band basis</Label>
                    <Select value={profile.band_basis} onValueChange={(v: any) => updateProfile(profile.id, { band_basis: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="absolute">Absolute score</SelectItem>
                        <SelectItem value="percent">Percent of achievable range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label style={labelStyle}>Minimum answered items</Label>
                    <Input
                      type="number"
                      value={profile.missing?.min_answered ?? 0}
                      onChange={e => updateProfile(profile.id, {
                        missing: { ...profile.missing, min_answered: Number(e.target.value) || 0 },
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label style={labelStyle}>When items are missing</Label>
                    <Select
                      value={profile.missing?.on_missing ?? 'invalidate'}
                      onValueChange={(v: any) => updateProfile(profile.id, { missing: { ...profile.missing, on_missing: v } })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invalidate">Invalidate the score</SelectItem>
                        <SelectItem value="prorate">Prorate to the answered items</SelectItem>
                        <SelectItem value="zero">Treat missing as zero</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label style={labelStyle}>Lock</Label>
                    <div className="flex items-center gap-2 h-9">
                      <Switch
                        checked={!!profile.locked}
                        onCheckedChange={checked => updateProfile(profile.id, { locked: checked })}
                      />
                      {profile.locked
                        ? <Lock className="w-3.5 h-3.5" style={{ color: 'var(--color-status-warning)' }} />
                        : <LockOpen className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />}
                      <span style={mutedText}>In use — block edits</span>
                    </div>
                  </div>
                </div>

                {/* ── Bands ─────────────────────────────────────────────── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                      Bands
                    </h5>
                    <Button variant="outline" size="sm" onClick={() => addBand(profile.id)} className="gap-1">
                      <Plus className="w-3 h-3" /> Add band
                    </Button>
                  </div>

                  {/*
                    Direction restated immediately above the bands. Bands are
                    always ascending in score space; direction does not flip
                    them. Saying so here is the cheapest possible guard against
                    the inversion that shipped in Balance.
                  */}
                  <p style={{ ...mutedText, marginBottom: 'var(--spacing-2)' }}>
                    {profile.direction === 'higher_is_better'
                      ? '↑ Higher score = better. The lowest band should carry the most severe rating.'
                      : '↑ Higher score = more distress. The highest band should carry the most severe rating.'}
                    {profile.band_basis === 'percent' && ' Edges are percentages of the achievable range.'}
                  </p>

                  {/* Preview bar. Width is max − min: half-open intervals have no +1. */}
                  {totalSpan > 0 && (
                    <div className="flex h-4 rounded-full overflow-hidden mb-3" style={{ border: '1px solid var(--color-border-default)' }}>
                      {sortedBands.map(band => (
                        <div
                          key={band.id}
                          style={{
                            width: `${((band.max - band.min) / totalSpan) * 100}%`,
                            backgroundColor: severityColor[band.severity_ref] ?? 'var(--color-text-muted)',
                            opacity: 0.75,
                          }}
                          title={`${band.label}: ${formatBandInterval(band, band.id === sortedBands[sortedBands.length - 1].id)}`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {sortedBands.map((band, index) => {
                      const isLast = index === sortedBands.length - 1;
                      const tier = tierFor(band.severity_ref, profile.tier_map, catalogTierMap);
                      return (
                        <div
                          key={band.id}
                          className="p-3 rounded-lg space-y-2"
                          style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: severityColor[band.severity_ref] ?? 'var(--color-text-muted)' }}
                            />
                            <Input
                              className="w-40"
                              value={band.label}
                              onChange={e => updateBand(profile.id, band.id, { label: e.target.value })}
                              placeholder="Label the user sees"
                              style={{ fontSize: 'var(--text-xs)' }}
                            />

                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                className="w-20"
                                value={band.min}
                                onChange={e => updateBand(profile.id, band.id, { min: Number(e.target.value) || 0 })}
                                style={{ fontSize: 'var(--text-xs)' }}
                              />
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                ≤ score {isLast ? '≤' : '<'}
                              </span>
                              <Input
                                type="number"
                                className="w-20"
                                value={band.max}
                                onChange={e => updateBand(profile.id, band.id, { max: Number(e.target.value) || 0 })}
                                style={{ fontSize: 'var(--text-xs)' }}
                              />
                              {profile.band_basis === 'percent' && (
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>%</span>
                              )}
                            </div>

                            <Select
                              value={band.severity_ref}
                              onValueChange={(v: any) => updateBand(profile.id, band.id, {
                                severity_ref: v,
                                tone: band.tone ?? TONE_SEED_FOR_SEVERITY[v as SeverityLevel],
                              })}
                            >
                              <SelectTrigger className="w-44" style={{ fontSize: 'var(--text-xs)' }}>
                                <SelectValue placeholder="Severity" />
                              </SelectTrigger>
                              <SelectContent>
                                {(kvSeverityLevels.length > 0
                                  ? kvSeverityLevels.map(s => ({ value: s.value, label: s.label }))
                                  : SEVERITY_LEVELS.map(s => ({ value: s, label: s }))
                                ).map(s => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <span style={{ ...mutedText, whiteSpace: 'nowrap' }} title="Response tier, from the severity → tier map">
                              → {tier}
                            </span>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBand(profile.id, band.id)}
                              className="ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--color-status-danger)' }} />
                            </Button>
                          </div>

                          <Input
                            value={band.interpretation ?? ''}
                            onChange={e => updateBand(profile.id, band.id, { interpretation: e.target.value })}
                            placeholder="Interpretation shown with the result (optional)"
                            style={{ fontSize: 'var(--text-xs)' }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Tiling verdict */}
                  <div
                    className="mt-3 p-3 rounded-lg flex items-start gap-2"
                    style={{
                      border: `1px solid ${tiling.status === 'green' ? 'var(--color-status-success)' : tiling.status === 'amber' ? 'var(--color-status-warning)' : 'var(--color-status-danger)'}`,
                      backgroundColor: tiling.status === 'green' ? 'var(--color-status-success-light)' : tiling.status === 'amber' ? 'var(--color-status-warning-light)' : 'var(--color-status-danger-light)',
                    }}
                  >
                    {tiling.status === 'green'
                      ? <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-status-success)' }} />
                      : <CircleAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: tiling.status === 'amber' ? 'var(--color-status-warning)' : 'var(--color-status-danger)' }} />}
                    <div className="space-y-1">
                      {tiling.status === 'green' ? (
                        <p style={mutedText}>
                          Bands tile {span.min} to {span.max} with no gap and no overlap.
                          {profile.band_basis === 'absolute' &&
                            ' The floor and ceiling are checked against the achievable range on the assessment.'}
                        </p>
                      ) : (
                        tiling.issues.map((issue, i) => (
                          <p key={i} style={mutedText}>
                            <strong>{issue.severity === 'red' ? 'Error' : 'Warning'}:</strong> {issue.message}
                          </p>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="gap-1"
                    style={{ color: 'var(--color-status-danger)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                  <Button
                    onClick={() => handleSaveProfile(profile)}
                    disabled={saving === profile.id || tiling.status === 'red'}
                    className="gap-2"
                    style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}
                  >
                    <Save className="w-4 h-4" />
                    {saving === profile.id ? 'Saving…' : 'Save profile'}
                  </Button>
                </div>
                {tiling.status === 'red' && (
                  <p style={{ ...mutedText, textAlign: 'right' }}>
                    Saving is blocked while bands overlap or collapse — the server rejects these too.
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
