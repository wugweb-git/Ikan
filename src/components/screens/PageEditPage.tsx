import { useState, useEffect } from 'react';
import { Save, Trash2, FileText, Pencil, Search, Image, Video, Upload, EyeOff, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminPageLayout } from '../admin/AdminPageLayout';
import { AdminSection } from '../admin/AdminSection';
import { AdminFormField } from '../admin/AdminFormField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { RichTextEditor } from '../ui/rich-text-editor';
import { AdminLoading } from '../admin/AdminLoading';

export interface Page {
  id: string;
  name: string;
  title: string;
  slug: string;
  content: string;
  // Hero Section Fields
  heroEnabled?: boolean;
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroVideoUrl?: string;
  heroOverlayOpacity?: number;
  // Media Fields
  featuredImage?: string;
  ogImage?: string;
  // SEO Fields
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  published: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  lastUpdated?: string;
}

interface PageEditPageProps {
  pageId?: string;
  onBack: () => void;
  onSave: () => void;
}

export function PageEditPage({ pageId, onBack, onSave }: PageEditPageProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!pageId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Page>>({
    name: '',
    title: '',
    slug: '',
    content: '',
    heroEnabled: false,
    heroImage: '',
    heroTitle: '',
    heroSubtitle: '',
    heroCtaText: '',
    heroCtaLink: '',
    heroVideoUrl: '',
    heroOverlayOpacity: 50,
    featuredImage: '',
    ogImage: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    published: false
  });

  const validationSchema: ValidationSchema = {
    name: { required: true, minLength: 2, message: 'Page name is required' },
    title: { required: true, minLength: 3, message: 'Page title is required' },
    slug: { required: true, minLength: 2, message: 'URL slug is required' },
    content: { required: true, minLength: 10, message: 'Page content is required' }
  };

  const { errors, validateForm } = useFormValidation(validationSchema);
  const { hasUnsavedChanges, markAsSaved, markAsUnsaved, setShowWarning, showWarning } = useUnsavedChanges();

  useEffect(() => {
    if (formData.name || formData.content) markAsUnsaved();
  }, [formData]);

  useEffect(() => {
    if (pageId) loadPage();
  }, [pageId]);

  const loadPage = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminPage(pageId!);
      setFormData(data);
    } catch (error) {
      console.error('Failed to load page:', error);
      showToast('error', 'Error', 'Failed to load page data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (shouldPublish?: boolean) => {
    if (!validateForm(formData)) {
      const missingFields: string[] = [];
      if (!formData.name || formData.name.trim().length < 2) missingFields.push('Page Name');
      if (!formData.title || formData.title.trim().length < 3) missingFields.push('Page Title');
      if (!formData.slug || formData.slug.trim().length < 2) missingFields.push('URL Slug');
      if (!formData.content || formData.content.trim().length < 10) missingFields.push('Content (min 10 chars)');
      showToast('error', 'Validation Error', `Please fix: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setSaving(true);

      const dataToSave = { ...formData };

      // Handle publish/unpublish
      if (shouldPublish !== undefined) {
        dataToSave.published = shouldPublish;
        if (shouldPublish) {
          dataToSave.published_at = new Date().toISOString();
        }
      }

      if (pageId) {
        await apiClient.updatePage(pageId, dataToSave);
        showToast('success', 'Success', dataToSave.published ? 'Page published successfully' : 'Page saved as draft');
      } else {
        await apiClient.createPage(dataToSave);
        showToast('success', 'Success', dataToSave.published ? 'Page published successfully' : 'Page created as draft');
      }
      markAsSaved();
      onSave();
    } catch (error: any) {
      console.error('Failed to save page:', error);
      showToast('error', 'Error', error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pageId) return;
    try {
      setSaving(true);
      await apiClient.deletePage(pageId);
      showToast('success', 'Success', 'Page deleted');
      onSave();
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to delete');
    } finally {
      setSaving(false);
      setIsDeleteDialogOpen(false);
    }
  };

  useKeyboardShortcuts(
    {
      'ctrl+s': (e) => { e.preventDefault(); handleSave(); },
      escape: () => { if (hasUnsavedChanges) setShowWarning(true); else onBack(); }
    },
    [formData, hasUnsavedChanges]
  );

  if (loading) {
    return (
      <AdminPageLayout title="Loading..." subtitle="Loading page data...">
        <div className="flex items-center justify-center py-12">
          <AdminLoading message="Loading page..." />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <>
      <AdminPageLayout
        title={pageId ? formData.name || 'Edit Page' : 'New Page'}
        subtitle={pageId ? 'Update page information' : 'Create a new content page'}
        status={formData.published ? { label: 'Published', variant: 'success' } : { label: 'Draft', variant: 'warning' }}
        primaryAction={{
          label: formData.published ? 'Unpublish' : 'Publish',
          icon: formData.published ? <EyeOff className="w-4 h-4" /> : <Upload className="w-4 h-4" />,
          onClick: () => handleSave(!formData.published),
          loading: saving
        }}
        secondaryActions={[
          {
            label: 'Cancel',
            icon: <X className="w-4 h-4" />,
            onClick: () => {
              if (hasUnsavedChanges) {
                setShowWarning(true);
              } else {
                onBack();
              }
            },
            variant: 'outline' as const
          },
          ...(pageId
            ? [{
                label: 'Delete',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => setIsDeleteDialogOpen(true),
                variant: 'destructive' as const
              }]
            : [{
                label: 'Delete',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => {},
                variant: 'ghost' as const,
                disabled: true
              }]),
          {
            label: 'Save Draft',
            icon: <Save className="w-4 h-4" />,
            onClick: () => handleSave(false),
            variant: 'outline' as const
          }
        ]}
        toggleActions={[]}
        maxWidth="xl"
      >
        {/* Section 1: Page Information */}
        <AdminSection title="Page Information" description="Basic page settings" icon={<FileText className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Page Name" required error={errors.name}>
              <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="About Us" />
            </AdminFormField>
            <AdminFormField label="Page Title" required error={errors.title}>
              <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="About Us - iKan" />
            </AdminFormField>
            <AdminFormField label="URL Slug" required error={errors.slug}>
              <Input value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="about-us" />
            </AdminFormField>
            <AdminFormField label="Featured Image URL" helpText="Thumbnail image for page listings (1200x630px)">
              <Input
                value={formData.featuredImage}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* Section 2: Hero Banner */}
        <AdminSection title="Hero Banner" description="Full-width hero section displayed at the top of the page" icon={<Image className="w-5 h-5" />}>
          <div
            className="flex items-center gap-3 p-4 rounded-lg mb-6"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          >
            <Checkbox
              id="heroEnabled"
              checked={formData.heroEnabled || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, heroEnabled: checked as boolean }))}
            />
            <Label htmlFor="heroEnabled" className="cursor-pointer" style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }}>
              Enable hero banner for this page
            </Label>
          </div>

          {formData.heroEnabled && (
            <div className="space-y-6">
              {/* Hero Preview */}
              {formData.heroImage && (
                <div
                  className="relative rounded-lg overflow-hidden"
                  style={{ height: '200px', border: '1px solid var(--color-border-default)' }}
                >
                  <img
                    src={formData.heroImage}
                    alt="Hero preview"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                    style={{ backgroundColor: `rgba(0,0,0,${(formData.heroOverlayOpacity || 50) / 100})` }}
                  >
                    {formData.heroTitle && (
                      <p style={{ color: 'white', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)', marginBottom: 'var(--spacing-2)' }}>
                        {formData.heroTitle}
                      </p>
                    )}
                    {formData.heroSubtitle && (
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-base)' }}>
                        {formData.heroSubtitle}
                      </p>
                    )}
                    {formData.heroCtaText && (
                      <div
                        className="mt-3 px-4 py-2 rounded-lg inline-block"
                        style={{ backgroundColor: 'var(--color-primary-default)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        {formData.heroCtaText}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <AdminFormField label="Hero Image URL" helpText="Background image for the hero section (1920x800px recommended)">
                  <Input
                    value={formData.heroImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                    placeholder="https://example.com/hero-banner.jpg"
                  />
                </AdminFormField>

                <AdminFormField label="Overlay Opacity" helpText="Dark overlay strength (0 = none, 100 = solid black)">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formData.heroOverlayOpacity || 50}
                      onChange={(e) => setFormData(prev => ({ ...prev, heroOverlayOpacity: parseInt(e.target.value) }))}
                      className="flex-1"
                      style={{ accentColor: 'var(--color-primary-default)' }}
                    />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)', minWidth: '36px', textAlign: 'right' }}>
                      {formData.heroOverlayOpacity || 50}%
                    </span>
                  </div>
                </AdminFormField>

                <AdminFormField label="Hero Title" helpText="Large heading displayed over the hero image">
                  <Input
                    value={formData.heroTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, heroTitle: e.target.value }))}
                    placeholder="Welcome to Our Story"
                  />
                </AdminFormField>

                <AdminFormField label="Hero Subtitle" helpText="Supporting text below the hero title">
                  <Input
                    value={formData.heroSubtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                    placeholder="Learn more about our mission and values"
                  />
                </AdminFormField>

                <AdminFormField label="CTA Button Text" helpText="Call-to-action button label (leave empty to hide)">
                  <Input
                    value={formData.heroCtaText}
                    onChange={(e) => setFormData(prev => ({ ...prev, heroCtaText: e.target.value }))}
                    placeholder="Get Started"
                  />
                </AdminFormField>

                <AdminFormField label="CTA Button Link" helpText="URL the button navigates to">
                  <Input
                    value={formData.heroCtaLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, heroCtaLink: e.target.value }))}
                    placeholder="/assessment"
                  />
                </AdminFormField>

                <AdminFormField
                  label="Hero Video URL (Optional)"
                  helpText="YouTube or Vimeo URL for background video instead of image"
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    <Input
                      value={formData.heroVideoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, heroVideoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </AdminFormField>
              </div>
            </div>
          )}
        </AdminSection>

        {/* Section 3: Content Editor */}
        <AdminSection title="Page Content" description="Rich text editor — supports headings, lists, links, images, and raw HTML" icon={<Pencil className="w-5 h-5" />}>
          <AdminFormField label="Content" required error={errors.content} helpText="Use the toolbar to format text. The editor outputs HTML which is rendered as-is on the page.">
            <RichTextEditor
              value={formData.content || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Start writing your page content..."
              minHeight="400px"
            />
          </AdminFormField>
        </AdminSection>

        {/* Section 4: SEO & Publishing */}
        <AdminSection title="SEO & Publishing" description="Meta tags, social share settings, and visibility" icon={<Search className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Meta Description">
              <Textarea value={formData.metaDescription} onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))} placeholder="Page description for search engines" className="min-h-[80px]" />
            </AdminFormField>
            <AdminFormField label="Meta Keywords">
              <Input value={formData.metaKeywords} onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))} placeholder="keyword1, keyword2, keyword3" />
            </AdminFormField>
            <AdminFormField label="OG Title" helpText="Title for social media shares">
              <Input value={formData.ogTitle} onChange={(e) => setFormData(prev => ({ ...prev, ogTitle: e.target.value }))} placeholder="Title for social media shares" />
            </AdminFormField>
            <AdminFormField label="OG Description" helpText="Description for social media shares">
              <Textarea value={formData.ogDescription} onChange={(e) => setFormData(prev => ({ ...prev, ogDescription: e.target.value }))} placeholder="Description for social media shares" className="min-h-[80px]" />
            </AdminFormField>
            <AdminFormField label="Social Share Image (OG:Image)" helpText="Image for social media previews (1200x630px)">
              <Input
                value={formData.ogImage}
                onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                placeholder="https://example.com/social.jpg"
              />
              {formData.ogImage && (
                <div className="mt-2 rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-default)' }}>
                  <img src={formData.ogImage} alt="Social preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </AdminFormField>
          </div>

          <div
            className="flex items-center gap-3 p-4 rounded-lg mt-6"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          >
            <Checkbox id="published" checked={formData.published} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked as boolean }))} />
            <Label htmlFor="published" className="cursor-pointer" style={{ fontFamily: 'var(--font-family-base)' }}>
              Published — Make this page visible to all users
            </Label>
          </div>
        </AdminSection>
      </AdminPageLayout>

      <UnsavedChangesDialog open={showWarning} onOpenChange={setShowWarning} onConfirm={() => { markAsSaved(); onBack(); }} />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{formData.name}"? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} style={{ backgroundColor: 'var(--color-danger-default)', color: 'white' }}>Delete Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}