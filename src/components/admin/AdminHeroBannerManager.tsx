import { useState, useEffect } from 'react';
import { Save, RotateCcw, ExternalLink, Check, Upload, Link2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { apiClient } from '../../lib/api-client';
import tokens from '../../lib/design-tokens';
import { AdminHeader } from './AdminHeader';
import { AdminLoading } from './AdminLoading';
import { FileUpload } from '../ui/file-upload';
import { useIsMobile } from '../../hooks/useIsMobile';

// ── Types ───────────────────────────────────────────────────────
interface HeroBanner {
  page_key: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  updated_at: string;
}

// ── Design token helpers ────────────────────────────────────────
const B = {
  primary: tokens.colors.primary.default,
  primaryOn: tokens.colors.primary.on,
  accent: tokens.colors.accent.default,
  success: tokens.colors.status.success,
  successLight: tokens.colors.status['success-light'],
  warning: tokens.colors.status.warning,
  warningLight: tokens.colors.status['warning-light'],
  danger: tokens.colors.status.danger,
  muted: tokens.colors.text.muted,
  textPrimary: tokens.colors.text.primary,
  bgPage: tokens.colors.background.page,
  bgCard: tokens.colors.background.card,
  bgMuted: tokens.colors.background.muted,
  bgInput: tokens.colors.background.input,
  border: tokens.colors.border.default,
};

const f = (size: string, weight: number = 400, color: string = B.textPrimary) => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// Page metadata for display
const PAGE_META: Record<string, { label: string; emoji: string; description: string }> = {
  assessments: {
    label: 'Assessments',
    emoji: '📋',
    description: 'Hero banner shown on the Health Assessments listing page',
  },
  equip: {
    label: 'Equip Programs',
    emoji: '🧘',
    description: 'Hero banner shown on the Equip Programs listing page',
  },
  consultation: {
    label: 'Consultation',
    emoji: '💬',
    description: 'Hero banner shown on the Find Your Consultant page',
  },
};

interface AdminHeroBannerManagerProps {
  onBack?: () => void;
}

export function AdminHeroBannerManager({ onBack }: AdminHeroBannerManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedBanners, setEditedBanners] = useState<Record<string, HeroBanner>>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [imageInputMode, setImageInputMode] = useState<Record<string, 'upload' | 'url'>>({});
  const isMobile = useIsMobile();

  // ── Fetch all banners ─────────────────────────────────────────
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getHeroBanners();
      const list: HeroBanner[] = res?.banners || [];
      const map: Record<string, HeroBanner> = {};
      for (const b of list) map[b.page_key] = { ...b };
      setEditedBanners(map);
      setDirtyKeys(new Set());
    } catch (error) {
      console.error('Failed to load hero banners:', error);
      toast.error('Failed to load hero banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // ── Update local state ────────────────────────────────────────
  const updateField = (pageKey: string, field: keyof HeroBanner, value: string) => {
    setEditedBanners(prev => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], [field]: value },
    }));
    setDirtyKeys(prev => new Set(prev).add(pageKey));
  };

  // ── Save a single banner ─────────────────────────────────────
  const handleSave = async (pageKey: string) => {
    const banner = editedBanners[pageKey];
    if (!banner) return;
    setSaving(pageKey);
    try {
      await apiClient.updateHeroBanner(pageKey, {
        title: banner.title,
        subtitle: banner.subtitle,
        image_url: banner.image_url,
        cta_text: banner.cta_text,
        cta_link: banner.cta_link,
      });
      toast.success(`${PAGE_META[pageKey]?.label || pageKey} banner saved`);
      setDirtyKeys(prev => {
        const next = new Set(prev);
        next.delete(pageKey);
        return next;
      });
      await fetchBanners();
    } catch (error) {
      console.error('Save banner error:', error);
      toast.error('Failed to save banner');
    } finally {
      setSaving(null);
    }
  };

  // ── Reset to default ──────────────────────────────────────────
  const handleReset = async (pageKey: string) => {
    if (!confirm(`Reset the ${PAGE_META[pageKey]?.label || pageKey} hero banner to defaults?`)) return;
    try {
      await apiClient.resetHeroBanner(pageKey);
      toast.success('Banner reset to defaults');
      await fetchBanners();
    } catch (error) {
      console.error('Reset banner error:', error);
      toast.error('Failed to reset banner');
    }
  };

  // ── Render ────────────────────────────────────────────────────
  if (loading) return <AdminLoading />;

  return (
    <div>
      <AdminHeader
        title="Hero Banners"
        description="Manage the hero banner image, title, subtitle, and CTA for each main page. Changes are reflected immediately."
        onBack={onBack}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
        <div>
          {['assessments', 'equip', 'consultation'].map((pageKey, i) => {
            const meta = PAGE_META[pageKey];
            const banner = editedBanners[pageKey];
            const isDirty = dirtyKeys.has(pageKey);
            const isSaving = saving === pageKey;
            const inputMode = imageInputMode[pageKey] || 'upload';

            if (!banner) return null;

            return (
              <div
                key={pageKey}
              >
                <Card
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    border: `1.5px solid ${isDirty ? B.warning : B.border}`,
                    overflow: 'hidden',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Live preview */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: isMobile ? 160 : 220,
                      overflow: 'hidden',
                      backgroundColor: '#1a1a1a',
                    }}
                  >
                    {banner.image_url && (
                      <img
                        src={banner.image_url}
                        alt={`${meta.label} hero preview`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: '50% 30%',
                          opacity: 0.55,
                        }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: isMobile ? '16px' : '20px 24px',
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: isMobile ? 24 : 32, marginBottom: 4 }}>{meta.emoji}</span>
                      <h3 style={{ ...f(isMobile ? 'base' : 'lg', 500, '#FFFFFF'), margin: '0 0 2px', lineHeight: 1.2 }}>
                        {banner.title || 'Page Title'}
                      </h3>
                      <p style={{ ...f('xs', 400, 'rgba(255,255,255,0.8)'), margin: 0, maxWidth: 400, lineHeight: 1.4 }}>
                        {banner.subtitle || 'Subtitle text...'}
                      </p>
                      {banner.cta_text && (
                        <span style={{
                          marginTop: 8,
                          padding: '6px 20px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#FFFFFF',
                          ...f('xs', 500, B.primary),
                        }}>
                          {banner.cta_text}
                        </span>
                      )}
                    </div>
                    {/* Page badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        ...f('xs', 500, '#FFFFFF'),
                      }}
                    >
                      {meta.label}
                    </div>
                    {isDirty && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: B.warningLight,
                          ...f('xs', 500, B.warning),
                        }}
                      >
                        Unsaved
                      </div>
                    )}
                  </div>

                  {/* Editor fields */}
                  <CardContent style={{ padding: isMobile ? 16 : 20 }}>
                    <p style={{ ...f('xs', 400, B.muted), marginBottom: 16 }}>
                      {meta.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Title */}
                      <div>
                        <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Title</Label>
                        <Input
                          value={banner.title}
                          onChange={e => updateField(pageKey, 'title', e.target.value)}
                          placeholder="Page title..."
                          style={{
                            borderRadius: 'var(--radius-md)',
                            border: `1.5px solid ${B.border}`,
                            backgroundColor: B.bgInput,
                            ...f('sm'),
                          }}
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Subtitle</Label>
                        <Input
                          value={banner.subtitle}
                          onChange={e => updateField(pageKey, 'subtitle', e.target.value)}
                          placeholder="A short description..."
                          style={{
                            borderRadius: 'var(--radius-md)',
                            border: `1.5px solid ${B.border}`,
                            backgroundColor: B.bgInput,
                            ...f('sm'),
                          }}
                        />
                      </div>

                      {/* Image — toggle between upload and URL */}
                      <div>
                        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                          <Label style={{ ...f('xs', 500, B.muted), display: 'block' }}>Hero Image</Label>
                          <div className="flex" style={{ gap: 2, backgroundColor: B.bgMuted, borderRadius: 'var(--radius-sm)', padding: 2 }}>
                            <button
                              onClick={() => setImageInputMode(prev => ({ ...prev, [pageKey]: 'upload' }))}
                              style={{
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: inputMode === 'upload' ? B.bgCard : 'transparent',
                                boxShadow: inputMode === 'upload' ? tokens.shadow.sm : 'none',
                                ...f('xs', 500, inputMode === 'upload' ? B.textPrimary : B.muted),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Upload size={11} /> Upload
                            </button>
                            <button
                              onClick={() => setImageInputMode(prev => ({ ...prev, [pageKey]: 'url' }))}
                              style={{
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: inputMode === 'url' ? B.bgCard : 'transparent',
                                boxShadow: inputMode === 'url' ? tokens.shadow.sm : 'none',
                                ...f('xs', 500, inputMode === 'url' ? B.textPrimary : B.muted),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Link2 size={11} /> URL
                            </button>
                          </div>
                        </div>

                        {inputMode === 'upload' ? (
                          <FileUpload
                            value={banner.image_url}
                            onChange={(url) => updateField(pageKey, 'image_url', url)}
                            onRemove={() => updateField(pageKey, 'image_url', '')}
                            accept="image/*"
                            maxSize={10}
                            preview={true}
                            helpText="1920x1080 recommended. JPG, PNG, WebP."
                          />
                        ) : (
                          <div>
                            <div className="flex" style={{ gap: 8 }}>
                              <Input
                                value={banner.image_url}
                                onChange={e => updateField(pageKey, 'image_url', e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                style={{
                                  flex: 1,
                                  borderRadius: 'var(--radius-md)',
                                  border: `1.5px solid ${B.border}`,
                                  backgroundColor: B.bgInput,
                                  ...f('xs'),
                                  fontFamily: 'monospace',
                                }}
                              />
                              {banner.image_url && (
                                <a
                                  href={banner.image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 40,
                                    height: 40,
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${B.border}`,
                                    backgroundColor: B.bgMuted,
                                    color: B.muted,
                                    flexShrink: 0,
                                  }}
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                            <p style={{ ...f('xs', 400, B.muted), marginTop: 4 }}>
                              Paste a direct image URL (Unsplash, Supabase Storage, etc.)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <div>
                        <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>
                          CTA Button (optional)
                        </Label>
                        <div className={isMobile ? 'flex flex-col' : 'flex'} style={{ gap: 8 }}>
                          <Input
                            value={banner.cta_text || ''}
                            onChange={e => updateField(pageKey, 'cta_text', e.target.value)}
                            placeholder="Button text (e.g. Get Started)"
                            style={{
                              flex: isMobile ? undefined : 1,
                              borderRadius: 'var(--radius-md)',
                              border: `1.5px solid ${B.border}`,
                              backgroundColor: B.bgInput,
                              ...f('sm'),
                            }}
                          />
                          <Input
                            value={banner.cta_link || ''}
                            onChange={e => updateField(pageKey, 'cta_link', e.target.value)}
                            placeholder="Link (e.g. /assessments)"
                            style={{
                              flex: isMobile ? undefined : 1,
                              borderRadius: 'var(--radius-md)',
                              border: `1.5px solid ${B.border}`,
                              backgroundColor: B.bgInput,
                              ...f('sm'),
                            }}
                          />
                        </div>
                        <p style={{ ...f('xs', 400, B.muted), marginTop: 4 }}>
                          Leave blank to hide the CTA button. Link can be an internal path or full URL.
                        </p>
                      </div>

                      {/* Actions */}
                      <div
                        className={isMobile ? 'flex flex-col' : 'flex items-center justify-between'}
                        style={{ paddingTop: 12, borderTop: `1px solid ${B.border}`, gap: isMobile ? 8 : 0 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReset(pageKey)}
                          style={{ gap: 6, borderRadius: 'var(--radius-md)', ...f('xs', 400, B.muted) }}
                        >
                          <RotateCcw size={13} /> Reset to Default
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(pageKey)}
                          disabled={!isDirty || isSaving}
                          style={{
                            gap: 6,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isDirty ? B.primary : B.bgMuted,
                            color: isDirty ? B.primaryOn : B.muted,
                            ...f('xs', 500, isDirty ? B.primaryOn : B.muted),
                            opacity: (!isDirty || isSaving) ? 0.5 : 1,
                          }}
                        >
                          {isSaving ? (
                            <><Save size={13} /> Saving...</>
                          ) : isDirty ? (
                            <><Save size={13} /> Save Changes</>
                          ) : (
                            <><Check size={13} /> Up to Date</>
                          )}
                        </Button>
                      </div>

                      {/* Last updated */}
                      {banner.updated_at && (
                        <p style={{ ...f('xs', 400, B.muted), textAlign: 'right', marginTop: 4 }}>
                          Last updated: {new Date(banner.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}