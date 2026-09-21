import { useState, useEffect } from 'react';
import {
  Save, Globe, Mail, Share2, Bell, Shield, Palette, Code, Send,
  Eye, EyeOff, Image as ImageIcon, Phone, BarChart3, Loader2, Award
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../components/AdminHeader';
import { AdminLoading } from '../components/AdminLoading';
import { AdminSection } from '../components/AdminSection';
import { AdminFormField } from '../components/AdminFormField';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { ImageField } from '../components/ImageField';

// ═══════════════════════════════════════════════════════════════
// Settings Interface — deduplicated, no overlaps
// ═══════════════════════════════════════════════════════════════
interface SiteSettings {
  // ── Site Identity ──
  siteName: string;
  siteDescription: string;
  companyDescription: string;

  // ── Logos & Brand Images ──  (single source of truth)
  logoUrl: string;         // Primary logo (used everywhere as default)
  logoIconUrl: string;     // Small square icon (favicon, mobile tab)
  logoFullLightUrl: string; // Full logo for dark backgrounds
  logoFullDarkUrl: string;  // Full logo for light backgrounds
  faviconUrl: string;       // Browser tab favicon

  // ── Contact ──
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactAddress: string;

  // ── Social Media ──
  facebookUrl: string;
  xUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;

  // ── Email (SMTP / Brevo) ──
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpProvider: string;

  // ── Newsletter ──
  newsletterEnabled: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterImageUrl: string;

  // ── SEO & Sharing ──  (ogImage is the single social share image)
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;

  // ── Certifications ──
  certifications: Array<{ imageUrl: string; alt: string }>;

  // ── Theme ──
  primaryColor: string;
  accentColor: string;

  // ── Dashboard Explore Cards ──
  exploreCardProgramsImage: string;
  exploreCardAssessmentsImage: string;

  // ── Feature Toggles ──
  enableUserRegistration: boolean;
  enableComments: boolean;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  maintenanceMode: boolean;

  // ── Analytics Integrations ──
  googleAnalyticsId: string;
  facebookPixelId: string;

  // ── Advanced ──
  customCss: string;
  customJs: string;
}

interface AdminSettingsManagerProps {
  onBack?: () => void;
  className?: string;
}

// ── Legacy field mapping (for backward compat when loading) ──
function normalizeLegacySettings(data: any): Partial<SiteSettings> {
  return {
    ...data,
    // Legacy renames
    xUrl: data.xUrl || data.twitterUrl || '',
    contactWhatsapp: data.contactWhatsapp || data.whatsappNumber || '',
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    // Merge duplicates: brandLogoUrl → logoUrl (prefer logoUrl if set)
    logoUrl: data.logoUrl || data.brandLogoUrl || '',
    // Merge duplicates: metaImageUrl → ogImage (prefer ogImage if set)
    ogImage: data.ogImage || data.metaImageUrl || '',
    // SEO defaults from site identity if blank
    seoTitle: data.seoTitle || data.siteName || '',
    seoDescription: data.seoDescription || data.siteDescription || '',
  };
}

export function AdminSettingsManager({ onBack, className }: AdminSettingsManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    siteDescription: '',
    companyDescription: '',
    logoUrl: '',
    faviconUrl: '',
    logoIconUrl: '',
    logoFullLightUrl: '',
    logoFullDarkUrl: '',
    contactEmail: '',
    contactPhone: '',
    contactWhatsapp: '',
    contactAddress: '',
    facebookUrl: '',
    xUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpFromEmail: '',
    smtpFromName: '',
    smtpProvider: 'brevo',
    newsletterEnabled: false,
    newsletterTitle: '',
    newsletterDescription: '',
    newsletterImageUrl: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: '',
    certifications: [],
    exploreCardProgramsImage: '',
    exploreCardAssessmentsImage: '',
    primaryColor: '#2A2A2A',
    accentColor: '#E9EBEF',
    enableUserRegistration: true,
    enableComments: false,
    enableNotifications: true,
    enableAnalytics: false,
    maintenanceMode: false,
    googleAnalyticsId: '',
    facebookPixelId: '',
    customCss: '',
    customJs: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSettings();
      const data = response.settings || response;
      const normalized = normalizeLegacySettings(data);
      setSettings(prev => ({ ...prev, ...normalized }));
    } catch (error: any) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // On save, also write the legacy duplicate fields so old consumers don't break
      const payload = {
        ...settings,
        brandLogoUrl: settings.logoUrl,       // keep legacy key in sync
        metaImageUrl: settings.ogImage,        // keep legacy key in sync
        twitterUrl: settings.xUrl,             // keep legacy key in sync
      };
      await apiClient.updateSettings(payload);
      showToast('success', 'Settings saved', 'All settings have been updated successfully.');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      showToast('error', 'Save failed', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      showToast('error', 'Missing email', 'Please enter a test email address');
      return;
    }
    try {
      setSendingTest(true);
      await apiClient.testBrevoChannel('email', testEmail);
      showToast('success', 'Test sent', `Test email sent to ${testEmail}`);
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      showToast('error', 'Test failed', error.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return <AdminLoading message="Loading settings..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdminHeader
        title="Global Settings"
        description="Site identity, branding, contact, email, and feature configuration"
        actions={
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium bg-[var(--color-primary-default)] text-[var(--color-primary-on)]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {!isMobile && 'Save Settings'}
              </>
            )}
          </Button>
        }
      />

      {/* ═══ 1. SITE IDENTITY ═══ */}
      <AdminSection
        title="Site Identity"
        description="Your site name and description"
        icon={<Globe className="w-5 h-5" />}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <AdminFormField label="Site Name" required>
            <Input
              value={settings.siteName}
              onChange={(e) => update('siteName', e.target.value)}
              placeholder="iKan Mental Health"
            />
          </AdminFormField>

          <AdminFormField label="Site Description" helpText="Brief tagline shown in headers and meta tags">
            <Input
              value={settings.siteDescription}
              onChange={(e) => update('siteDescription', e.target.value)}
              placeholder="Your companion for mental wellness"
            />
          </AdminFormField>
        </div>

        <AdminFormField label="Company Description" helpText="Longer description used in footer and about sections">
          <Textarea
            value={settings.companyDescription}
            onChange={(e) => update('companyDescription', e.target.value)}
            placeholder="iKan Health is dedicated to providing comprehensive mental health resources and support."
            className="min-h-[80px]"
          />
        </AdminFormField>
      </AdminSection>

      {/* ═══ 2. LOGOS & BRAND IMAGES ═══ */}
      <AdminSection
        title="Logos & Brand Images"
        description="Upload or pick from your Media Library. All uploads are saved to the library for reuse."
        icon={<ImageIcon className="w-5 h-5" />}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <ImageField
              label="Primary Logo"
              value={settings.logoUrl}
              onChange={(url) => update('logoUrl', url)}
              helpText="Main logo used across the site"
              previewHeight={36}
            />
          </div>

          <div>
            <ImageField
              label="Logo Icon (Square)"
              value={settings.logoIconUrl}
              onChange={(url) => update('logoIconUrl', url)}
              helpText="Small square icon (48x48) for tabs, mobile"
              previewHeight={32}
            />
          </div>

          <div>
            <ImageField
              label="Full Logo (Light)"
              value={settings.logoFullLightUrl}
              onChange={(url) => update('logoFullLightUrl', url)}
              helpText="For dark backgrounds (white/light version)"
              previewHeight={32}
              previewBg="dark"
            />
          </div>

          <div>
            <ImageField
              label="Full Logo (Dark)"
              value={settings.logoFullDarkUrl}
              onChange={(url) => update('logoFullDarkUrl', url)}
              helpText="For light backgrounds (dark version)"
              previewHeight={32}
            />
          </div>

          <div>
            <ImageField
              label="Favicon"
              value={settings.faviconUrl}
              onChange={(url) => update('faviconUrl', url)}
              helpText="Browser tab icon (.ico, .png)"
              previewHeight={24}
              accept="image/*,.ico"
            />
          </div>
        </div>
      </AdminSection>

      {/* ═══ 2b. DASHBOARD EXPLORE CARDS ═══ */}
      <AdminSection
        title="Dashboard Explore Cards"
        description="Hero images for the Explore section on the user dashboard. Leave empty for default gradient cards."
        icon={<ImageIcon className="w-5 h-5" />}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <ImageField
              label="Programs Card Image"
              value={settings.exploreCardProgramsImage}
              onChange={(url) => update('exploreCardProgramsImage', url)}
              helpText="Hero image for the Programs explore card (recommended: 600×400)"
              previewHeight={80}
            />
          </div>
          <div>
            <ImageField
              label="Assessments Card Image"
              value={settings.exploreCardAssessmentsImage}
              onChange={(url) => update('exploreCardAssessmentsImage', url)}
              helpText="Hero image for the Assessments explore card (recommended: 600×400)"
              previewHeight={80}
            />
          </div>
        </div>
      </AdminSection>

      {/* ═══ 3. CONTACT INFORMATION ═══ */}
      <AdminSection
        title="Contact Information"
        description="How users can reach you"
        icon={<Phone className="w-5 h-5" />}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <AdminFormField label="Contact Email" required>
            <Input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              placeholder="support@ikanhealth.in"
            />
          </AdminFormField>
          <AdminFormField label="Contact Phone">
            <Input
              type="tel"
              value={settings.contactPhone}
              onChange={(e) => update('contactPhone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </AdminFormField>
          <AdminFormField label="WhatsApp Number">
            <Input
              type="tel"
              value={settings.contactWhatsapp}
              onChange={(e) => update('contactWhatsapp', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </AdminFormField>
        </div>
        <AdminFormField label="Address">
          <Textarea
            value={settings.contactAddress}
            onChange={(e) => update('contactAddress', e.target.value)}
            placeholder="123 Main St, City, State ZIP"
            className="min-h-[60px]"
          />
        </AdminFormField>
      </AdminSection>

      {/* ═══ 4. SOCIAL MEDIA ═══ */}
      <AdminSection
        title="Social Media"
        description="Link your social profiles"
        icon={<Share2 className="w-5 h-5" />}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {([
            { key: 'facebookUrl' as const, label: 'Facebook', placeholder: 'https://facebook.com/...' },
            { key: 'xUrl' as const, label: 'X (Twitter)', placeholder: 'https://x.com/...' },
            { key: 'instagramUrl' as const, label: 'Instagram', placeholder: 'https://instagram.com/...' },
            { key: 'linkedinUrl' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
            { key: 'youtubeUrl' as const, label: 'YouTube', placeholder: 'https://youtube.com/...' },
          ] as const).map(({ key, label, placeholder }) => (
            <AdminFormField key={key} label={label}>
              <Input
                value={settings[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
              />
            </AdminFormField>
          ))}
        </div>
      </AdminSection>

      {/* ═══ 5. EMAIL CONFIGURATION ═══ */}
      <AdminSection
        title="Email Configuration"
        description="Brevo (Sendinblue) SMTP relay for transactional email"
        icon={<Mail className="w-5 h-5" />}
      >
        {/* Sender Identity Summary */}
        <div
          className="p-4 rounded-[var(--radius-md)]"
          style={{ background: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
        >
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 4, fontFamily: 'var(--font-family-base)' }}>
            Sender Identity
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
            {settings.smtpFromName && settings.smtpFromEmail
              ? `${settings.smtpFromName} <${settings.smtpFromEmail}>`
              : 'Not configured — set From Name and From Email below'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <AdminFormField label="SMTP Host" helpText="Brevo relay: smtp-relay.brevo.com">
            <Input value={settings.smtpHost} onChange={(e) => update('smtpHost', e.target.value)} placeholder="smtp-relay.brevo.com" />
          </AdminFormField>
          <AdminFormField label="SMTP Port" helpText="587 (TLS) or 465 (SSL)">
            <Input value={settings.smtpPort} onChange={(e) => update('smtpPort', e.target.value)} placeholder="587" />
          </AdminFormField>
          <AdminFormField label="SMTP Username" helpText="Brevo SMTP login">
            <Input value={settings.smtpUser} onChange={(e) => update('smtpUser', e.target.value)} placeholder="your-login@smtp-brevo.com" />
          </AdminFormField>
          <AdminFormField label="SMTP Password / Key" helpText="Brevo xsmtpsib-... master password">
            <div className="relative">
              <Input
                type={showSmtpPassword ? 'text' : 'password'}
                value={settings.smtpPassword}
                onChange={(e) => update('smtpPassword', e.target.value)}
                placeholder="xsmtpsib-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--color-bg-muted)] transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </AdminFormField>
          <AdminFormField label="From Email" helpText="Verified sender email in Brevo">
            <Input type="email" value={settings.smtpFromEmail} onChange={(e) => update('smtpFromEmail', e.target.value)} placeholder="support@ikanhealth.in" />
          </AdminFormField>
          <AdminFormField label="From Name" helpText="Display name for outgoing mail">
            <Input value={settings.smtpFromName} onChange={(e) => update('smtpFromName', e.target.value)} placeholder="iKan Health" />
          </AdminFormField>
        </div>

        {/* Test Email */}
        <div className="pt-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)', fontFamily: 'var(--font-family-base)' }}>
            Send Test Email
          </p>
          <div className="flex gap-3 items-start flex-col sm:flex-row">
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter recipient email address"
              className="flex-1"
              type="email"
            />
            <Button
              onClick={handleSendTestEmail}
              disabled={sendingTest || !testEmail}
              className="gap-2 h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium bg-[var(--color-primary-default)] text-[var(--color-primary-on)] px-5 whitespace-nowrap"
            >
              {sendingTest ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Test</>
              )}
            </Button>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)', fontFamily: 'var(--font-family-base)' }}>
            Uses the Brevo API (BREVO_API_KEY env var) to send a test email with the sender identity configured above.
          </p>
        </div>
      </AdminSection>

      {/* ═══ 6. NEWSLETTER ═══ */}
      <AdminSection
        title="Newsletter"
        description="Configure your newsletter signup"
        icon={<Bell className="w-5 h-5" />}
      >
        <div
          className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
          style={{ border: '1px solid var(--color-border-default)' }}
        >
          <Checkbox
            id="newsletterEnabled"
            checked={settings.newsletterEnabled}
            onCheckedChange={(checked) => update('newsletterEnabled', !!checked)}
          />
          <div className="flex-1">
            <Label htmlFor="newsletterEnabled" className="cursor-pointer">Enable Newsletter</Label>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'var(--font-family-base)' }}>
              Show newsletter signup and send regular updates to subscribers
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <AdminFormField label="Newsletter Title">
            <Input value={settings.newsletterTitle} onChange={(e) => update('newsletterTitle', e.target.value)} placeholder="Stay Updated" />
          </AdminFormField>
          <AdminFormField label="Newsletter Description">
            <Input value={settings.newsletterDescription} onChange={(e) => update('newsletterDescription', e.target.value)} placeholder="Get the latest news and updates" />
          </AdminFormField>
        </div>
        <ImageField
          label="Newsletter Header Image"
          value={settings.newsletterImageUrl}
          onChange={(url) => update('newsletterImageUrl', url)}
          helpText="Optional banner image for newsletter emails"
          previewHeight={48}
        />
      </AdminSection>

      {/* ═══ 7. SEO & SHARING ═══ */}
      <AdminSection
        title="SEO & Social Sharing"
        description="Search engine and social media metadata"
        icon={<Code className="w-5 h-5" />}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <AdminFormField label="SEO Title" helpText="Defaults to Site Name if blank">
            <Input
              value={settings.seoTitle}
              onChange={(e) => update('seoTitle', e.target.value)}
              placeholder={settings.siteName || 'iKan Mental Health'}
            />
          </AdminFormField>
          <AdminFormField label="SEO Keywords" helpText="Comma-separated keywords">
            <Input
              value={settings.seoKeywords}
              onChange={(e) => update('seoKeywords', e.target.value)}
              placeholder="mental health, wellness, support"
            />
          </AdminFormField>
        </div>

        <AdminFormField label="SEO Description" helpText="Defaults to Site Description if blank">
          <Textarea
            value={settings.seoDescription}
            onChange={(e) => update('seoDescription', e.target.value)}
            placeholder={settings.siteDescription || 'Your companion for mental wellness'}
            className="min-h-[60px]"
          />
        </AdminFormField>

        <ImageField
          label="Social Share Image (OG Image)"
          value={settings.ogImage}
          onChange={(url) => update('ogImage', url)}
          helpText="Image shown when your URL is shared on social media (1200x630 recommended)"
          previewHeight={80}
        />
      </AdminSection>

      {/* ═══ 8. CERTIFICATIONS ═══ */}
      <AdminSection
        title="Certifications & Compliance"
        description="Certification badges shown in the footer"
        icon={<Award className="w-5 h-5" />}
      >
        <div className="space-y-3">
          {(settings.certifications || []).map((cert, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}
            >
              <div className="flex-1 min-w-0 space-y-2">
                <ImageField
                  value={cert.imageUrl}
                  onChange={(url) => {
                    const updated = [...(settings.certifications || [])];
                    updated[idx] = { ...updated[idx], imageUrl: url };
                    update('certifications', updated);
                  }}
                  previewHeight={32}
                />
                <Input
                  value={cert.alt}
                  onChange={(e) => {
                    const updated = [...(settings.certifications || [])];
                    updated[idx] = { ...updated[idx], alt: e.target.value };
                    update('certifications', updated);
                  }}
                  placeholder="Alt text (e.g. ISO 27001)"
                  className="text-xs"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const updated = (settings.certifications || []).filter((_, i) => i !== idx);
                  update('certifications', updated);
                }}
                style={{ color: 'var(--color-danger-default)' }}
                className="shrink-0 mt-1"
              >
                &times;
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => update('certifications', [...(settings.certifications || []), { imageUrl: '', alt: '' }])}
            className="gap-2"
          >
            + Add Certification
          </Button>
        </div>
      </AdminSection>

      {/* ═══ 9. THEME ═══ */}
      <AdminSection
        title="Theme"
        description="Brand colors (changes may require design token updates to take full effect)"
        icon={<Palette className="w-5 h-5" />}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <AdminFormField label="Primary Color" helpText="Main brand color for buttons and accents">
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.primaryColor || '#2A2A2A'}
                onChange={(e) => update('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg border cursor-pointer"
                style={{ borderColor: 'var(--color-border-default)', padding: 2 }}
              />
              <Input
                value={settings.primaryColor}
                onChange={(e) => update('primaryColor', e.target.value)}
                placeholder="#2A2A2A"
                className="flex-1"
              />
            </div>
          </AdminFormField>
          <AdminFormField label="Accent Color" helpText="Secondary color for highlights">
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.accentColor || '#E9EBEF'}
                onChange={(e) => update('accentColor', e.target.value)}
                className="w-10 h-10 rounded-lg border cursor-pointer"
                style={{ borderColor: 'var(--color-border-default)', padding: 2 }}
              />
              <Input
                value={settings.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                placeholder="#E9EBEF"
                className="flex-1"
              />
            </div>
          </AdminFormField>
        </div>
      </AdminSection>

      {/* ═══ 10. FEATURE TOGGLES ═══ */}
      <AdminSection
        title="Feature Toggles"
        description="Enable or disable platform features"
        icon={<Shield className="w-5 h-5" />}
      >
        <div className="space-y-3">
          {([
            { key: 'enableUserRegistration' as const, label: 'User Registration', desc: 'Allow new users to register' },
            { key: 'enableComments' as const, label: 'Comments', desc: 'Enable comments on resources' },
            { key: 'enableNotifications' as const, label: 'Push Notifications', desc: 'Send push notifications to users' },
            { key: 'enableAnalytics' as const, label: 'Analytics Tracking', desc: 'Track user behavior with analytics' },
            { key: 'maintenanceMode' as const, label: 'Maintenance Mode', desc: 'Temporarily disable site access', danger: true },
          ] as const).map((feature) => (
            <div
              key={feature.key}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
              style={{ border: ('danger' in feature && feature.danger) ? '1px solid var(--color-danger-default)' : '1px solid var(--color-border-default)' }}
            >
              <Checkbox
                id={feature.key}
                checked={settings[feature.key] as boolean}
                onCheckedChange={(checked) => update(feature.key, !!checked)}
              />
              <div className="flex-1">
                <Label
                  htmlFor={feature.key}
                  className="cursor-pointer"
                  style={{ color: ('danger' in feature && feature.danger) ? 'var(--color-danger-default)' : undefined }}
                >
                  {feature.label}
                </Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'var(--font-family-base)' }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AdminSection>

      {/* ═══ 11. ANALYTICS INTEGRATIONS ═══ */}
      <AdminSection
        title="Analytics Integrations"
        description="Third-party tracking IDs"
        icon={<BarChart3 className="w-5 h-5" />}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <AdminFormField label="Google Analytics ID" helpText="e.g. G-XXXXXXXXX">
            <Input
              value={settings.googleAnalyticsId}
              onChange={(e) => update('googleAnalyticsId', e.target.value)}
              placeholder="G-XXXXXXXXX"
            />
          </AdminFormField>
          <AdminFormField label="Facebook Pixel ID" helpText="For Facebook advertising">
            <Input
              value={settings.facebookPixelId}
              onChange={(e) => update('facebookPixelId', e.target.value)}
              placeholder="XXXXXXXXXXXXXXX"
            />
          </AdminFormField>
        </div>
      </AdminSection>

      {/* ═══ 12. ADVANCED ═══ */}
      <AdminSection
        title="Advanced"
        description="Custom code injection (use with caution)"
        icon={<Code className="w-5 h-5" />}
      >
        <AdminFormField label="Custom CSS" helpText="Injected into the page <head>">
          <Textarea
            value={settings.customCss}
            onChange={(e) => update('customCss', e.target.value)}
            placeholder="/* Your custom CSS */&#10;.my-class { ... }"
            className="min-h-[120px] font-mono"
            style={{ fontSize: 'var(--text-sm)' }}
          />
        </AdminFormField>
        <AdminFormField label="Custom JavaScript" helpText="Injected before </body>">
          <Textarea
            value={settings.customJs}
            onChange={(e) => update('customJs', e.target.value)}
            placeholder="// Your custom JavaScript&#10;console.log('Hello');"
            className="min-h-[120px] font-mono"
            style={{ fontSize: 'var(--text-sm)' }}
          />
        </AdminFormField>
      </AdminSection>

      {/* ═══ BOTTOM SAVE ═══ */}
      <div className="flex justify-end pt-6 pb-8">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium bg-[var(--color-primary-default)] text-[var(--color-primary-on)] px-6"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save All Settings</>
          )}
        </Button>
      </div>
    </div>
  );
}