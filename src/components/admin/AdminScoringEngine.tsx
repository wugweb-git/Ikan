import { useState, useEffect } from 'react';
import {
  Calculator, Save, Plus, Trash2, CircleAlert, Info, ArrowUpDown,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { AdminStatusBadge } from './AdminStatusBadge';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { useMetadata } from '../../hooks/useMetadata';

// ── Types ─────────────────────────────────────────────────────
interface SeverityBand {
  id: string;
  label: string;
  color: string;
  min: number;
  max: number;
  description: string;
}

interface ScoringProfile {
  id: string;
  name: string;
  description: string;
  method: 'sum' | 'average' | 'weighted' | 'custom';
  severity_bands: SeverityBand[];
  normalize_to_100: boolean;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SEVERITY_COLORS: Record<string, string> = {
  minimal: 'var(--color-status-success)',
  mild: 'var(--color-status-info)',
  moderate: 'var(--color-status-warning)',
  'moderately-severe': '#E67E22',
  severe: 'var(--color-status-danger)',
};

// Remove hardcoded SCORING_METHODS - now from MetaManager
// Fallback used only if KV has no scoring_method entries
const FALLBACK_SCORING_METHODS = [
  { value: 'sum', label: 'Sum', description: 'Add up all scores' },
  { value: 'average', label: 'Average', description: 'Mean of all scores' },
  { value: 'weighted', label: 'Weighted', description: 'Weighted sum based on question importance' },
  { value: 'custom', label: 'Custom', description: 'Custom scoring logic per assessment' },
];

interface AdminScoringEngineProps {
  onBack?: () => void;
}

export function AdminScoringEngine({ onBack }: AdminScoringEngineProps) {
  const { showToast } = useNotifications();
  const { scoringMethods: kvScoringMethods, severityLevels: kvSeverityLevels } = useMetadata();
  const [profiles, setProfiles] = useState<ScoringProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Use MetaManager scoring methods, fallback to hardcoded
  const SCORING_METHODS = kvScoringMethods.length > 0
    ? kvScoringMethods.map(m => ({ value: m.value, label: m.label, description: m.description || '' }))
    : FALLBACK_SCORING_METHODS;

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await apiClient.request('/admin/scoring-profiles', { method: 'GET' }, true, 0).catch(() => null);
      if (data?.profiles && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
      } else {
        // Initialize with standard mental health scoring profiles
        setProfiles([]);
      }
    } catch (e) {
      console.error('Failed to load scoring profiles:', e);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfile = () => {
    const newProfile: ScoringProfile = {
      id: `scoring-${Date.now()}`,
      name: '',
      description: '',
      method: 'sum',
      normalize_to_100: false,
      severity_bands: [
        { id: `band-${Date.now()}-1`, label: 'Minimal', color: DEFAULT_SEVERITY_COLORS.minimal, min: 0, max: 4, description: 'No significant concerns' },
        { id: `band-${Date.now()}-2`, label: 'Mild', color: DEFAULT_SEVERITY_COLORS.mild, min: 5, max: 9, description: 'Mild symptoms present' },
        { id: `band-${Date.now()}-3`, label: 'Moderate', color: DEFAULT_SEVERITY_COLORS.moderate, min: 10, max: 14, description: 'Moderate symptoms — consider support' },
        { id: `band-${Date.now()}-4`, label: 'Severe', color: DEFAULT_SEVERITY_COLORS.severe, min: 15, max: 27, description: 'Significant symptoms — professional help recommended' },
      ],
    };
    setProfiles([...profiles, newProfile]);
    setExpandedId(newProfile.id);
  };

  const handleSaveProfile = async (profile: ScoringProfile) => {
    try {
      setSaving(true);
      await apiClient.request('/admin/scoring-profiles', {
        method: 'POST',
        body: JSON.stringify({ profile }),
      }, true, 0);
      showToast('success', 'Profile Saved', `Scoring profile "${profile.name}" saved successfully`);
    } catch (e: any) {
      console.error('Failed to save scoring profile:', e);
      showToast('error', 'Save Failed', `Could not save scoring profile: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Delete this scoring profile? This cannot be undone.')) return;
    try {
      await apiClient.request(`/admin/scoring-profiles/${id}`, { method: 'DELETE' }, true, 0);
      setProfiles(profiles.filter(p => p.id !== id));
      showToast('success', 'Profile Deleted');
    } catch (e: any) {
      console.error('Failed to delete scoring profile:', e);
      // Still remove locally for temp profiles
      setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  const updateProfile = (id: string, updates: Partial<ScoringProfile>) => {
    setProfiles(profiles.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addBand = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    const lastBand = profile.severity_bands[profile.severity_bands.length - 1];
    const newBand: SeverityBand = {
      id: `band-${Date.now()}`,
      label: '',
      color: 'var(--color-text-muted)',
      min: lastBand ? lastBand.max + 1 : 0,
      max: lastBand ? lastBand.max + 10 : 10,
      description: '',
    };
    updateProfile(profileId, { severity_bands: [...profile.severity_bands, newBand] });
  };

  const updateBand = (profileId: string, bandId: string, updates: Partial<SeverityBand>) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    updateProfile(profileId, {
      severity_bands: profile.severity_bands.map(b => b.id === bandId ? { ...b, ...updates } : b),
    });
  };

  const removeBand = (profileId: string, bandId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    updateProfile(profileId, {
      severity_bands: profile.severity_bands.filter(b => b.id !== bandId),
    });
  };

  // Stats
  const stats = [
    {
      label: 'Scoring Profiles',
      value: profiles.length,
      icon: <Calculator className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />,
    },
    {
      label: 'Scoring Methods',
      value: SCORING_METHODS.length,
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <AdminHeader
        title="Scoring Engine"
        description="Configure scoring methods and severity bands for assessments and check-ins"
        stats={stats}
        actions={
          <Button onClick={handleAddProfile} className="gap-2" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
            <Plus className="w-4 h-4" /> Add Profile
          </Button>
        }
      />

      {/* Info Banner */}
      <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-status-info)', backgroundColor: 'var(--color-status-info-light)' }}>
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-status-info)' }} />
          <div>
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
              How Scoring Works
            </p>
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              Each assessment can be linked to a scoring profile. When a user completes an assessment, their responses are scored using the profile's method (sum, average, etc.), then mapped to severity bands to determine the result. The Rules Engine uses these severity levels to recommend programs, resources, or assessments.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Methods Reference */}
      <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
        <CardHeader className="pb-2">
          <CardTitle style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-base)' }}>
            Available Scoring Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCORING_METHODS.map(m => (
              <div
                key={m.value}
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="w-3.5 h-3.5" style={{ color: 'var(--color-primary-default)' }} />
                  <span style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    {m.label}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Profiles */}
      {profiles.length === 0 ? (
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border-default)' }}>
          <CardContent className="p-8 text-center">
            <Calculator className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
              No Scoring Profiles Yet
            </p>
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
              Create your first scoring profile to define how assessment scores map to severity levels.
            </p>
            <Button onClick={handleAddProfile} className="gap-2" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
              <Plus className="w-4 h-4" /> Create Scoring Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => {
            const isExpanded = expandedId === profile.id;
            return (
              <Card key={profile.id} style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
                {/* Collapsed Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : profile.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                      <Calculator className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
                    </div>
                    <div className="min-w-0">
                      <h4 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                        {profile.name || 'Untitled Profile'}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <AdminStatusBadge status="neutral" label={profile.method} />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {profile.severity_bands.length} severity bands
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Severity band color preview */}
                    <div className="flex -space-x-1">
                      {profile.severity_bands.slice(0, 5).map(b => (
                        <div key={b.id} className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: b.color }} />
                      ))}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Editor */}
                {isExpanded && (
                  <CardContent className="pt-0 pb-4 px-4 space-y-4" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-1">
                        <Label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>Profile Name</Label>
                        <Input
                          value={profile.name}
                          onChange={(e) => updateProfile(profile.id, { name: e.target.value })}
                          placeholder="e.g. PHQ-9 Scoring, GAD-7 Scoring"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>Scoring Method</Label>
                        <Select value={profile.method} onValueChange={(val: any) => updateProfile(profile.id, { method: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SCORING_METHODS.map(m => (
                              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>Description</Label>
                      <Input
                        value={profile.description}
                        onChange={(e) => updateProfile(profile.id, { description: e.target.value })}
                        placeholder="Brief description of when this profile is used"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={profile.normalize_to_100}
                        onCheckedChange={(checked) => updateProfile(profile.id, { normalize_to_100: checked })}
                      />
                      <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)' }}>
                        Normalize scores to 0-100 scale
                      </Label>
                    </div>

                    {/* Severity Bands */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                          Severity Bands
                        </h5>
                        <Button variant="outline" size="sm" onClick={() => addBand(profile.id)} className="gap-1">
                          <Plus className="w-3 h-3" /> Add Band
                        </Button>
                      </div>

                      {/* Visual band preview */}
                      <div className="flex h-4 rounded-full overflow-hidden mb-3" style={{ border: '1px solid var(--color-border-default)' }}>
                        {profile.severity_bands.map((band, i) => {
                          const total = profile.severity_bands.reduce((a, b) => a + (b.max - b.min + 1), 0);
                          const width = ((band.max - band.min + 1) / total) * 100;
                          return (
                            <div
                              key={band.id}
                              style={{ width: `${width}%`, backgroundColor: band.color, opacity: 0.7 }}
                              title={`${band.label}: ${band.min}-${band.max}`}
                            />
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        {profile.severity_bands.map((band, index) => (
                          <div
                            key={band.id}
                            className="flex items-center gap-2 p-3 rounded-lg"
                            style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
                          >
                            {/* Color indicator */}
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: band.color }} />

                            {/* Label */}
                            <Input
                              className="w-28"
                              value={band.label}
                              onChange={(e) => updateBand(profile.id, band.id, { label: e.target.value })}
                              placeholder="Label"
                              style={{ fontSize: 'var(--text-xs)' }}
                            />

                            {/* Range */}
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                className="w-16"
                                value={band.min}
                                onChange={(e) => updateBand(profile.id, band.id, { min: parseInt(e.target.value) || 0 })}
                                style={{ fontSize: 'var(--text-xs)' }}
                              />
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>–</span>
                              <Input
                                type="number"
                                className="w-16"
                                value={band.max}
                                onChange={(e) => updateBand(profile.id, band.id, { max: parseInt(e.target.value) || 0 })}
                                style={{ fontSize: 'var(--text-xs)' }}
                              />
                            </div>

                            {/* Description */}
                            <Input
                              className="flex-1"
                              value={band.description}
                              onChange={(e) => updateBand(profile.id, band.id, { description: e.target.value })}
                              placeholder="Band description"
                              style={{ fontSize: 'var(--text-xs)' }}
                            />

                            {/* Color picker */}
                            <input
                              type="color"
                              value={band.color.startsWith('#') ? band.color : '#6b7280'}
                              onChange={(e) => updateBand(profile.id, band.id, { color: e.target.value })}
                              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                            />

                            {/* Remove */}
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeBand(profile.id, band.id)}>
                              <Trash2 className="w-3 h-3" style={{ color: 'var(--color-status-danger)' }} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="gap-1"
                        style={{ color: 'var(--color-status-danger)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Profile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveProfile(profile)}
                        disabled={saving || !profile.name}
                        className="gap-1"
                        style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}
                      >
                        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}