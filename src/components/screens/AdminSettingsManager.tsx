import React, { useState, useEffect } from 'react';
import { Settings, Save, Globe, Mail, Share2, Bell, Shield, Palette, Code, Search } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminSection } from '../admin/AdminSection';
import { AdminFormField } from '../admin/AdminFormField';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';

interface SiteSettings {
  // General
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  
  // Contact
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  
  // Social Media
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  
  // Email (SMTP)
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  
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
  twitterCard: string;
  
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
  
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'iKan Mental Health',
    siteDescription: 'Your companion for mental wellness',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: 'support@ikan.health',
    contactPhone: '',
    contactAddress: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpFromEmail: '',
    smtpFromName: 'iKan Health',
    newsletterEnabled: false,
    newsletterTitle: 'Stay Updated',
    newsletterDescription: 'Get the latest news and updates from iKan Health',
    newsletterImageUrl: '',
    seoTitle: 'iKan Mental Health',
    seoDescription: 'Your companion for mental wellness',
    seoKeywords: 'mental health, wellness, support, iKan Health',
    ogImage: '',
    twitterCard: 'summary_large_image',
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
      setSettings(prev => ({ ...prev, ...data }));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="animate-spin rounded-full border-4 mx-auto mb-4"
            style={{
              width: '48px',
              height: '48px',
              borderColor: 'var(--color-accent-default)',
              borderTopColor: 'var(--color-primary-default)'
            }}
          />
          <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdminHeader
        title="Settings"
        description="Configure your site settings and preferences"
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Settings' }]}
        actions={
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              gap: 'var(--spacing-2)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)'
            }}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full border-2 w-4 h-4" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
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
              <Input value={settings.logoUrl} onChange={(e) => updateSetting('logoUrl', e.target.value)} placeholder="https://..." />
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

        {/* Contact Information */}
        <AdminSection title="Contact Information" description="How users can reach you" icon={<Mail className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Contact Email" required>
              <Input type="email" value={settings.contactEmail} onChange={(e) => updateSetting('contactEmail', e.target.value)} placeholder="support@ikan.health" />
            </AdminFormField>

            <AdminFormField label="Contact Phone">
              <Input type="tel" value={settings.contactPhone} onChange={(e) => updateSetting('contactPhone', e.target.value)} placeholder="+1 (555) 123-4567" />
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

            <AdminFormField label="Twitter URL">
              <Input value={settings.twitterUrl} onChange={(e) => updateSetting('twitterUrl', e.target.value)} placeholder="https://twitter.com/..." />
            </AdminFormField>

            <AdminFormField label="Instagram URL">
              <Input value={settings.instagramUrl} onChange={(e) => updateSetting('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
            </AdminFormField>

            <AdminFormField label="LinkedIn URL">
              <Input value={settings.linkedinUrl} onChange={(e) => updateSetting('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/..." />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* Email (SMTP) Settings */}
        <AdminSection title="Email (SMTP) Configuration" description="Configure email sending" icon={<Mail className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="SMTP Host" helpText="e.g., smtp.gmail.com">
              <Input value={settings.smtpHost} onChange={(e) => updateSetting('smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
            </AdminFormField>

            <AdminFormField label="SMTP Port" helpText="Usually 587 or 465">
              <Input value={settings.smtpPort} onChange={(e) => updateSetting('smtpPort', e.target.value)} placeholder="587" />
            </AdminFormField>

            <AdminFormField label="SMTP Username">
              <Input value={settings.smtpUser} onChange={(e) => updateSetting('smtpUser', e.target.value)} placeholder="your-email@gmail.com" />
            </AdminFormField>

            <AdminFormField label="SMTP Password">
              <Input type="password" value={settings.smtpPassword} onChange={(e) => updateSetting('smtpPassword', e.target.value)} placeholder="••••••••" />
            </AdminFormField>

            <AdminFormField label="From Email">
              <Input type="email" value={settings.smtpFromEmail} onChange={(e) => updateSetting('smtpFromEmail', e.target.value)} placeholder="noreply@ikan.health" />
            </AdminFormField>

            <AdminFormField label="From Name">
              <Input value={settings.smtpFromName} onChange={(e) => updateSetting('smtpFromName', e.target.value)} placeholder="iKan Health" />
            </AdminFormField>
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

            <AdminFormField label="Twitter Card Type">
              <Input value={settings.twitterCard} onChange={(e) => updateSetting('twitterCard', e.target.value)} placeholder="summary_large_image" />
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
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              gap: 'var(--spacing-2)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              padding: '0 var(--spacing-6)'
            }}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full border-2 w-4 h-4" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
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
    </div>
  );
}