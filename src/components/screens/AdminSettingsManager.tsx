import { useState, useEffect } from 'react';
import { Settings, Save, Globe, Mail, Share2, Bell, Shield, Palette, Code, Send, CheckCircle, AlertCircle, Eye, EyeOff, Image as ImageIcon, Phone, MessageCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminLoading } from '../admin/AdminLoading';
import { AdminSection } from '../admin/AdminSection';
import { AdminFormField } from '../admin/AdminFormField';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface SiteSettings {
  // General
  siteName: string;
  siteDescription: string;
  companyDescription: string;
  logoUrl: string;
  faviconUrl: string;
  
  // Logo Variants
  logoIconUrl: string;
  logoFullLightUrl: string;
  logoFullDarkUrl: string;
  metaImageUrl: string;
  
  // Contact
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactAddress: string;
  
  // Social Media
  facebookUrl: string;
  xUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  
  // Email (SMTP)
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpProvider: string;
  
  // Newsletter
  newsletterEnabled: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterImageUrl: string;
  
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  
  // Certifications
  certifications: Array<{ imageUrl: string; alt: string }>;
  
  // Theme Customization
  primaryColor: string;
  accentColor: string;
  brandLogoUrl: string;
  
  // Feature Toggles
  enableUserRegistration: boolean;
  enableComments: boolean;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  maintenanceMode: boolean;
  
  // Analytics
  googleAnalyticsId: string;
  facebookPixelId: string;
  
  // Advanced
  customCss: string;
  customJs: string;
}

interface AdminSettingsManagerProps {
  onBack?: () => void;
  className?: string;
}

export function AdminSettingsManager({ onBack, className }: AdminSettingsManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [mediaPickerField, setMediaPickerField] = useState<keyof SiteSettings | null>(null);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'iKan Mental Health',
    siteDescription: 'Your companion for mental wellness',
    companyDescription: 'iKan Health is dedicated to providing comprehensive mental health resources and support.',
    logoUrl: '',
    faviconUrl: '',
    logoIconUrl: '',
    logoFullLightUrl: '',
    logoFullDarkUrl: '',
    metaImageUrl: '',
    contactEmail: 'support@ikan.health',
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
    smtpFromName: 'iKan Health',
    smtpProvider: 'brevo',
    newsletterEnabled: false,
    newsletterTitle: 'Stay Updated',
    newsletterDescription: 'Get the latest news and updates from iKan Health',
    newsletterImageUrl: '',
    seoTitle: 'iKan Mental Health',
    seoDescription: 'Your companion for mental wellness',
    seoKeywords: 'mental health, wellness, support, iKan Health',
    ogImage: '',
    certifications: [],
    primaryColor: '#007bff',
    accentColor: '#ff6347',
    brandLogoUrl: '',
    enableUserRegistration: true,
    enableComments: false,
    enableNotifications: true,
    enableAnalytics: false,
    maintenanceMode: false,
    googleAnalyticsId: '',
    facebookPixelId: '',
    customCss: '',
    customJs: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSettings();
      const data = response.settings || response;
      // Backward compat: map legacy twitterUrl → xUrl, contactWhatsapp fallback
      const normalized = {
        ...data,
        xUrl: data.xUrl || data.twitterUrl || '',
        contactWhatsapp: data.contactWhatsapp || data.whatsappNumber || '',
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
      };
      setSettings(prev => ({ ...prev, ...normalized }));
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      // Use default settings if none exist
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.updateSettings(settings);
      showToast('success', 'Success', 'Settings saved successfully');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      showToast('error', 'Error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      showToast('error', 'Error', 'Please enter a test email address');
      return;
    }
    try {
      setSendingTest(true);
      await apiClient.testBrevoChannel('email', testEmail);
      showToast('success', 'Test Email Sent', `Test email sent to ${testEmail}`);
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      showToast('error', 'Test Failed', error.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const openMediaPicker = async (field: keyof SiteSettings) => {
    setMediaPickerField(field);
    setMediaLoading(true);
    try {
      const data = await apiClient.request('/admin/media', { method: 'GET' }, true, 0).catch(() => ({ media: [] }));
      setMediaItems(Array.isArray(data) ? data : data.media || data.items || []);
    } catch {
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerField) {
      updateSetting(mediaPickerField, url as any);
      setMediaPickerField(null);
    }
  };

  if (loading) {
    return <AdminLoading message="Loading settings..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdminHeader
        title="Settings"
        description="Configure your site settings and preferences"
        actions={
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium bg-[var(--color-primary-default)] text-[var(--color-primary-on)]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full border-2 w-4 h-4" style={{ borderColor: 'var(--color-text-inverse)', borderTopColor: 'transparent' }} />
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

      {/* General Settings */}
      <AdminSection title="General Settings" description="Basic site information" icon={<Globe className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Site Name" required>
              <Input value={settings.siteName} onChange={(e) => updateSetting('siteName', e.target.value)} placeholder="iKan Mental Health" />
            </AdminFormField>

            <AdminFormField label="Logo URL" helpText="Link to your site logo">
              <div className="flex gap-2">
                <Input value={settings.logoUrl} onChange={(e) => updateSetting('logoUrl', e.target.value)} placeholder="https://..." className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => openMediaPicker('logoUrl')} className="shrink-0 gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Media
                </Button>
              </div>
              {settings.logoUrl && (
                <div className="mt-2 h-8 rounded-lg overflow-hidden">
                  <img src={settings.logoUrl} alt="Logo preview" className="h-full object-contain" />
                </div>
              )}
            </AdminFormField>

            <AdminFormField label="Favicon URL" helpText="Browser tab icon">
              <Input value={settings.faviconUrl} onChange={(e) => updateSetting('faviconUrl', e.target.value)} placeholder="https://..." />
            </AdminFormField>
          </div>

          <AdminFormField label="Site Description" helpText="Brief description of your site">
            <Textarea
              value={settings.siteDescription}
              onChange={(e) => updateSetting('siteDescription', e.target.value)}
              placeholder="Your companion for mental wellness"
              className="min-h-[80px]"
            />
          </AdminFormField>
        </AdminSection>

        {/* Brand & Logos */}
        <AdminSection title="Brand & Logos" description="Logo variants and brand identity assets (use Media Library URLs)" icon={<ImageIcon className="w-5 h-5" />}>
          <AdminFormField label="Company Description" helpText="Used in the footer and about sections">
            <Textarea
              value={settings.companyDescription}
              onChange={(e) => updateSetting('companyDescription', e.target.value)}
              placeholder="Ikan is your trusted partner in mental health and wellness..."
              className="min-h-[80px]"
            />
          </AdminFormField>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Logo Icon" helpText="Small square icon (e.g. 48x48) for tabs, mobile">
              <div className="flex gap-2">
                <Input value={settings.logoIconUrl} onChange={(e) => updateSetting('logoIconUrl', e.target.value)} placeholder="https://... (from Media Library)" className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => openMediaPicker('logoIconUrl')} className="shrink-0 gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Media
                </Button>
              </div>
              {settings.logoIconUrl && (
                <div className="mt-2 w-10 h-10 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-default)' }}>
                  <img src={settings.logoIconUrl} alt="Icon preview" className="w-full h-full object-contain" />
                </div>
              )}
            </AdminFormField>

            <AdminFormField label="Full Logo (Light)" helpText="Full logo for dark backgrounds (white/light version)">
              <div className="flex gap-2">
                <Input value={settings.logoFullLightUrl} onChange={(e) => updateSetting('logoFullLightUrl', e.target.value)} placeholder="https://... (from Media Library)" className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => openMediaPicker('logoFullLightUrl')} className="shrink-0 gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Media
                </Button>
              </div>
              {settings.logoFullLightUrl && (
                <div className="mt-2 h-8 px-3 py-1 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-primary-default)' }}>
                  <img src={settings.logoFullLightUrl} alt="Light logo preview" className="h-full object-contain" />
                </div>
              )}
            </AdminFormField>

            <AdminFormField label="Full Logo (Dark)" helpText="Full logo for light backgrounds (dark version)">
              <div className="flex gap-2">
                <Input value={settings.logoFullDarkUrl} onChange={(e) => updateSetting('logoFullDarkUrl', e.target.value)} placeholder="https://... (from Media Library)" className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => openMediaPicker('logoFullDarkUrl')} className="shrink-0 gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Media
                </Button>
              </div>
              {settings.logoFullDarkUrl && (
                <div className="mt-2 h-8 px-3 py-1 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                  <img src={settings.logoFullDarkUrl} alt="Dark logo preview" className="h-full object-contain" />
                </div>
              )}
            </AdminFormField>

            <AdminFormField label="Meta Image (OG/Share)" helpText="Image shown when URL is shared on social media (1200x630 recommended)">
              <div className="flex gap-2">
                <Input value={settings.metaImageUrl} onChange={(e) => updateSetting('metaImageUrl', e.target.value)} placeholder="https://... (from Media Library)" className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => openMediaPicker('metaImageUrl')} className="shrink-0 gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Media
                </Button>
              </div>
              {settings.metaImageUrl && (
                <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-default)' }}>
                  <img src={settings.metaImageUrl} alt="Meta image preview" className="w-full h-full object-cover" />
                </div>
              )}
            </AdminFormField>
          </div>
        </AdminSection>

        {/* Certifications */}
        <AdminSection title="Certifications & Compliance" description="Upload certification badges shown in the footer" icon={<Shield className="w-5 h-5" />}>
          <div className="space-y-3">
            {(settings.certifications || []).map((cert, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}>
                {cert.imageUrl && (
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 border" style={{ borderColor: 'var(--color-border-default)' }}>
                    <img src={cert.imageUrl} alt={cert.alt} className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={cert.imageUrl}
                    onChange={(e) => {
                      const updated = [...(settings.certifications || [])];
                      updated[idx] = { ...updated[idx], imageUrl: e.target.value };
                      updateSetting('certifications', updated);
                    }}
                    placeholder="Image URL (from Media Library)"
                    className="text-xs"
                  />
                  <Input
                    value={cert.alt}
                    onChange={(e) => {
                      const updated = [...(settings.certifications || [])];
                      updated[idx] = { ...updated[idx], alt: e.target.value };
                      updateSetting('certifications', updated);
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
                    updateSetting('certifications', updated);
                  }}
                  style={{ color: 'var(--color-danger-default)' }}
                >
                  &times;
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateSetting('certifications', [...(settings.certifications || []), { imageUrl: '', alt: '' }]);
              }}
              className="gap-2"
            >
              + Add Certification
            </Button>
          </div>
        </AdminSection>

        {/* Contact Information */}
        <AdminSection title="Contact Information" description="How users can reach you" icon={<Mail className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Contact Email" required>
              <Input type="email" value={settings.contactEmail} onChange={(e) => updateSetting('contactEmail', e.target.value)} placeholder="support@ikan.health" />
            </AdminFormField>

            <AdminFormField label="Contact Phone">
              <Input type="tel" value={settings.contactPhone} onChange={(e) => updateSetting('contactPhone', e.target.value)} placeholder="+1 (555) 123-4567" />
            </AdminFormField>

            <AdminFormField label="Contact WhatsApp">
              <Input type="tel" value={settings.contactWhatsapp} onChange={(e) => updateSetting('contactWhatsapp', e.target.value)} placeholder="+1 (555) 123-4567" />
            </AdminFormField>
          </div>

          <AdminFormField label="Contact Address">
            <Textarea value={settings.contactAddress} onChange={(e) => updateSetting('contactAddress', e.target.value)} placeholder="123 Main St, City, State ZIP" className="min-h-[80px]" />
          </AdminFormField>
        </AdminSection>

        {/* Social Media */}
        <AdminSection title="Social Media Links" description="Connect your social profiles" icon={<Share2 className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Facebook URL">
              <Input value={settings.facebookUrl} onChange={(e) => updateSetting('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." />
            </AdminFormField>

            <AdminFormField label="X URL">
              <Input value={settings.xUrl} onChange={(e) => updateSetting('xUrl', e.target.value)} placeholder="https://x.com/..." />
            </AdminFormField>

            <AdminFormField label="Instagram URL">
              <Input value={settings.instagramUrl} onChange={(e) => updateSetting('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
            </AdminFormField>

            <AdminFormField label="LinkedIn URL">
              <Input value={settings.linkedinUrl} onChange={(e) => updateSetting('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/..." />
            </AdminFormField>

            <AdminFormField label="YouTube URL">
              <Input value={settings.youtubeUrl} onChange={(e) => updateSetting('youtubeUrl', e.target.value)} placeholder="https://youtube.com/..." />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* Email (SMTP) Settings — Brevo */}
        <AdminSection title="Email (SMTP) Configuration" description="Brevo (Sendinblue) SMTP relay settings for transactional email" icon={<Mail className="w-5 h-5" />}>
          {/* Sender Identity */}
          <div className="p-4 rounded-[var(--radius-md)]" style={{ background: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
              Sender Identity
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              {settings.smtpFromName && settings.smtpFromEmail
                ? `${settings.smtpFromName} <${settings.smtpFromEmail}>`
                : 'Not configured — set From Name and From Email below'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="SMTP Host" helpText="Brevo relay: smtp-relay.brevo.com">
              <Input value={settings.smtpHost} onChange={(e) => updateSetting('smtpHost', e.target.value)} placeholder="smtp-relay.brevo.com" />
            </AdminFormField>

            <AdminFormField label="SMTP Port" helpText="587 (TLS) or 465 (SSL)">
              <Input value={settings.smtpPort} onChange={(e) => updateSetting('smtpPort', e.target.value)} placeholder="587" />
            </AdminFormField>

            <AdminFormField label="SMTP Username" helpText="Brevo SMTP login (e.g. abc@smtp-brevo.com)">
              <Input value={settings.smtpUser} onChange={(e) => updateSetting('smtpUser', e.target.value)} placeholder="your-login@smtp-brevo.com" />
            </AdminFormField>

            <AdminFormField label="SMTP Password / Key" helpText="Brevo xsmtpsib-… master password">
              <div className="relative">
                <Input
                  type={showSmtpPassword ? 'text' : 'password'}
                  value={settings.smtpPassword}
                  onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                  placeholder="xsmtpsib-…"
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
              <Input type="email" value={settings.smtpFromEmail} onChange={(e) => updateSetting('smtpFromEmail', e.target.value)} placeholder="support@ikan.health" />
            </AdminFormField>

            <AdminFormField label="From Name" helpText="Display name for outgoing mail">
              <Input value={settings.smtpFromName} onChange={(e) => updateSetting('smtpFromName', e.target.value)} placeholder="Ikan Support" />
            </AdminFormField>

            <AdminFormField label="Provider" helpText="Email service provider identifier">
              <Input value={settings.smtpProvider} onChange={(e) => updateSetting('smtpProvider', e.target.value)} placeholder="brevo" disabled />
            </AdminFormField>
          </div>

          {/* Test Email */}
          <div className="pt-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
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
                  <>
                    <div className="animate-spin rounded-full border-2 w-4 h-4" style={{ borderColor: 'var(--color-text-inverse)', borderTopColor: 'transparent' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
              Uses the Brevo API (BREVO_API_KEY env var) to send a test email with the sender identity configured above.
            </p>
          </div>
        </AdminSection>

        {/* Newsletter Settings */}
        <AdminSection title="Newsletter Settings" description="Configure your newsletter" icon={<Bell className="w-5 h-5" />}>
          <div className="space-y-4">
            <div
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
              style={{ border: '1px solid var(--color-accent-default)' }}
            >
              <Checkbox
                id="newsletterEnabled"
                checked={settings.newsletterEnabled}
                onCheckedChange={(checked) => updateSetting('newsletterEnabled', checked as any)}
              />
              <div className="flex-1">
                <Label htmlFor="newsletterEnabled" className="cursor-pointer" style={{ color: 'var(--color-accent-default)' }}>
                  Enable Newsletter
                </Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                  Send regular updates to your subscribers
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Newsletter Title">
              <Input value={settings.newsletterTitle} onChange={(e) => updateSetting('newsletterTitle', e.target.value)} placeholder="Stay Updated" />
            </AdminFormField>

            <AdminFormField label="Newsletter Description">
              <Textarea
                value={settings.newsletterDescription}
                onChange={(e) => updateSetting('newsletterDescription', e.target.value)}
                placeholder="Get the latest news and updates from iKan Health"
                className="min-h-[80px]"
              />
            </AdminFormField>

            <AdminFormField label="Newsletter Image URL">
              <Input value={settings.newsletterImageUrl} onChange={(e) => updateSetting('newsletterImageUrl', e.target.value)} placeholder="https://..." />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* SEO Settings */}
        <AdminSection title="SEO Settings" description="Optimize your site for search engines" icon={<Code className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="SEO Title">
              <Input value={settings.seoTitle} onChange={(e) => updateSetting('seoTitle', e.target.value)} placeholder="iKan Mental Health" />
            </AdminFormField>

            <AdminFormField label="SEO Description">
              <Textarea
                value={settings.seoDescription}
                onChange={(e) => updateSetting('seoDescription', e.target.value)}
                placeholder="Your companion for mental wellness"
                className="min-h-[80px]"
              />
            </AdminFormField>

            <AdminFormField label="SEO Keywords">
              <Input value={settings.seoKeywords} onChange={(e) => updateSetting('seoKeywords', e.target.value)} placeholder="mental health, wellness, support, iKan Health" />
            </AdminFormField>

            <AdminFormField label="Open Graph Image URL">
              <Input value={settings.ogImage} onChange={(e) => updateSetting('ogImage', e.target.value)} placeholder="https://..." />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* Theme Customization */}
        <AdminSection title="Theme Customization" description="Customize your site's appearance" icon={<Palette className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Primary Color">
              <Input value={settings.primaryColor} onChange={(e) => updateSetting('primaryColor', e.target.value)} placeholder="#007bff" />
            </AdminFormField>

            <AdminFormField label="Accent Color">
              <Input value={settings.accentColor} onChange={(e) => updateSetting('accentColor', e.target.value)} placeholder="#ff6347" />
            </AdminFormField>

            <AdminFormField label="Brand Logo URL">
              <Input value={settings.brandLogoUrl} onChange={(e) => updateSetting('brandLogoUrl', e.target.value)} placeholder="https://..." />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* Feature Toggles */}
        <AdminSection title="Feature Toggles" description="Enable or disable features" icon={<Shield className="w-5 h-5" />}>
          <div className="space-y-4">
            {[
              { key: 'enableUserRegistration', label: 'User Registration', desc: 'Allow new users to register' },
              { key: 'enableComments', label: 'Comments', desc: 'Enable comments on resources' },
              { key: 'enableNotifications', label: 'Push Notifications', desc: 'Send push notifications to users' },
              { key: 'enableAnalytics', label: 'Analytics Tracking', desc: 'Track user behavior with analytics' },
              { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable site access', danger: true }
            ].map((feature) => (
              <div
                key={feature.key}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                style={{ border: feature.danger ? '1px solid var(--color-danger-default)' : undefined }}
              >
                <Checkbox
                  id={feature.key}
                  checked={settings[feature.key as keyof SiteSettings] as boolean}
                  onCheckedChange={(checked) => updateSetting(feature.key as keyof SiteSettings, checked as any)}
                />
                <div className="flex-1">
                  <Label htmlFor={feature.key} className="cursor-pointer" style={{ color: feature.danger ? 'var(--color-danger-default)' : undefined }}>
                    {feature.label}
                  </Label>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AdminSection>

        {/* Analytics */}
        <AdminSection title="Analytics & Tracking" description="Third-party analytics integrations" icon={<Palette className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Google Analytics ID" helpText="e.g., GA-XXXXXXXXX">
              <Input value={settings.googleAnalyticsId} onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)} placeholder="GA-XXXXXXXXX" />
            </AdminFormField>

            <AdminFormField label="Facebook Pixel ID" helpText="For Facebook advertising">
              <Input value={settings.facebookPixelId} onChange={(e) => updateSetting('facebookPixelId', e.target.value)} placeholder="XXXXXXXXXXXXXXX" />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* Advanced */}
        <AdminSection title="Advanced Settings" description="Custom code and styling" icon={<Code className="w-5 h-5" />}>
          <AdminFormField label="Custom CSS" helpText="Additional CSS styles (use with caution)">
            <Textarea
              value={settings.customCss}
              onChange={(e) => updateSetting('customCss', e.target.value)}
              placeholder="/* Your custom CSS */\n.my-class { ... }"
              className="min-h-[150px] font-mono"
              style={{ fontSize: 'var(--text-sm)' }}
            />
          </AdminFormField>

          <AdminFormField label="Custom JavaScript" helpText="Additional JavaScript code (use with caution)">
            <Textarea
              value={settings.customJs}
              onChange={(e) => updateSetting('customJs', e.target.value)}
              placeholder="// Your custom JavaScript\nconsole.log('Hello');"
              className="min-h-[150px] font-mono"
              style={{ fontSize: 'var(--text-sm)' }}
            />
          </AdminFormField>
        </AdminSection>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium bg-[var(--color-primary-default)] text-[var(--color-primary-on)] px-6"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full border-2 w-4 h-4" style={{ borderColor: 'var(--color-text-inverse)', borderTopColor: 'transparent' }} />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Settings
              </>
            )}
          </Button>
        </div>

        {/* Media Library Picker Dialog */}
        <Dialog open={!!mediaPickerField} onOpenChange={(open) => !open && setMediaPickerField(null)}>
          <DialogContent className="max-w-2xl" style={{ maxHeight: '80vh', overflow: 'auto' }}>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'var(--font-family-base)', fontWeight: 500 }}>
                Select from Media Library
              </DialogTitle>
            </DialogHeader>
            {mediaLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full border-2 w-8 h-8" style={{ borderColor: 'var(--color-primary-default)', borderTopColor: 'transparent' }} />
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="text-center p-8">
                <ImageIcon className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  No media items found. Upload images via the Media Manager first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {mediaItems.map((item: any, idx: number) => {
                  const url = item.signed_url || item.url || item.public_url || '';
                  const name = item.name || item.filename || `Item ${idx + 1}`;
                  return (
                    <button
                      key={item.id || idx}
                      onClick={() => handleMediaSelect(url)}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 hover:border-[var(--color-primary-default)] transition-colors"
                      style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}
                    >
                      <img src={url} alt={name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-white truncate w-full" style={{ fontSize: 'var(--text-xs)' }}>{name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
}