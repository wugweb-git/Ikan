import { useState, useEffect } from 'react';
import { Save, Trash2, FileText, Edit, Search, Image, Video, Upload, EyeOff, X, Sparkles } from 'lucide-react';
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
import { AdminActionBar } from '../ui/admin-action-bar';
import { AdminLoading } from '../admin/AdminLoading';

export interface Page {
  id: string;
  name: string;
  title: string;
  slug: string;
  content: string;
  // New Media Fields
  featuredImage?: string;
  heroImage?: string;
  heroVideoUrl?: string;
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
    featuredImage: '',
    heroImage: '',
    heroVideoUrl: '',
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

  const handleAutoFill = () => {
    setFormData(prev => ({
        ...prev,
        title: prev.title || 'New Page Title',
        slug: prev.slug || 'new-page-slug',
        content: prev.content || `<h1>Welcome to ${prev.title || 'this page'}</h1><p>This is a placeholder content block. You can edit this text.</p><h2>Section 1</h2><p>Add more details here.</p>`,
        metaDescription: prev.metaDescription || `Learn more about ${prev.title || 'this topic'} on iKan.`,
        metaKeywords: prev.metaKeywords || 'wellness, mental health, guide',
        ogTitle: prev.ogTitle || prev.title,
        ogDescription: prev.ogDescription || prev.metaDescription,
        featuredImage: prev.featuredImage || 'https://source.unsplash.com/1200x630/?wellness,calm',
        heroImage: prev.heroImage || 'https://source.unsplash.com/1920x1080/?nature,peace',
        published: false
    }));
    showToast('success', 'Auto-Filled', 'Form populated with suggestions.');
    markAsUnsaved();
  };

  const handleSave = async (shouldPublish?: boolean) => {
    if (!validateForm(formData)) {
      showToast('error', 'Validation Error', 'Please fix the errors');
      return;
    }

    try {
      setSaving(true);

      const dataToSave = { ...formData };
      
      // 🐛 DEBUG: Log what we're saving
      console.log('📤 [PAGE SAVE] Starting save operation...');
      console.log('📤 [PAGE SAVE] Page ID:', pageId);
      console.log('📤 [PAGE SAVE] Should Publish:', shouldPublish);
      console.log('📤 [PAGE SAVE] Name:', dataToSave.name);
      console.log('📤 [PAGE SAVE] Title:', dataToSave.title);
      console.log('📤 [PAGE SAVE] Full Data:', JSON.stringify(dataToSave, null, 2));
      
      // Handle publish/unpublish
      if (shouldPublish !== undefined) {
        dataToSave.published = shouldPublish;
        if (shouldPublish) {
          dataToSave.published_at = new Date().toISOString();
        }
      }

      if (pageId) {
        console.log('📤 [PAGE SAVE] Calling updatePage...');
        await apiClient.updatePage(pageId, dataToSave);
        console.log('✅ [PAGE SAVE] Update successful!');
        showToast('success', 'Success', dataToSave.published ? 'Page published successfully' : 'Page saved as draft');
      } else {
        console.log('📤 [PAGE SAVE] Calling createPage...');
        await apiClient.createPage(dataToSave);
        console.log('✅ [PAGE SAVE] Create successful!');
        showToast('success', 'Success', dataToSave.published ? 'Page published successfully' : 'Page created as draft');
      }
      markAsSaved();
      onSave();
    } catch (error: any) {
      console.error('❌ [PAGE SAVE] Failed to save page:', error);
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
      escape: () => { hasUnsavedChanges ? setShowWarning(true) : onBack(); }
    },
    [formData, hasUnsavedChanges]
  );

  if (loading) {
    return (
      <AdminPageLayout title="Loading..." breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Pages', onClick: onBack }, { label: 'Loading...' }]}>
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
        actions={
            <Button variant="outline" onClick={handleAutoFill} title="Auto-fill empty fields">
                <Sparkles className="w-4 h-4 mr-2" />
                Auto-Fill
            </Button>
        }
        secondaryActions={[
          // Button 1: Cancel
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
          // Button 2: Delete
          ...(pageId
            ? [
                {
                  label: 'Delete',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => setIsDeleteDialogOpen(true),
                  variant: 'destructive' as const
                }
              ]
            : [
                {
                  label: 'Delete',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => {},
                  variant: 'ghost' as const,
                  disabled: true
                }
              ]),
          // Button 3: Save Draft
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
        <AdminSection title="Page Information" description="Basic page settings" icon={<FileText className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Page Name" required error={errors.name}>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="About Us" />
            </AdminFormField>
            <AdminFormField label="Page Title" required error={errors.title}>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="About Us - iKan" />
            </AdminFormField>
            <AdminFormField label="URL Slug" required error={errors.slug}>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="about-us" />
            </AdminFormField>
          </div>
        </AdminSection>

        <AdminSection title="Content Editor" description="Page content (Markdown supported)" icon={<Edit className="w-5 h-5" />}>
          <AdminFormField label="Content" required error={errors.content}>
            <RichTextEditor 
              value={formData.content || ''} 
              onChange={(value) => setFormData({ ...formData, content: value })} 
              placeholder="Start writing your page content..."
              minHeight="400px"
            />
          </AdminFormField>
        </AdminSection>

        <AdminSection 
          title="Media & Hero Section" 
          description="Featured images and hero video" 
          icon={<Image className="w-5 h-5" />}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField 
              label="Featured Image URL" 
              helpText="Main image for the page (1200x630px recommended)"
            >
              <Input 
                value={formData.featuredImage} 
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })} 
                placeholder="https://example.com/image.jpg" 
              />
              {formData.featuredImage && (
                <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-default)' }}>
                  <img src={formData.featuredImage} alt="Featured preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </AdminFormField>

            <AdminFormField 
              label="Hero Image URL" 
              helpText="Large hero section image (1920x1080px recommended)"
            >
              <Input 
                value={formData.heroImage} 
                onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })} 
                placeholder="https://example.com/hero.jpg" 
              />
              {formData.heroImage && (
                <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-default)' }}>
                  <img src={formData.heroImage} alt="Hero preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </AdminFormField>

            <AdminFormField 
              label="Hero Video URL" 
              helpText="YouTube or Vimeo URL for hero section background video"
            >
              <div className="flex gap-2">
                <Video className="w-5 h-5 text-[var(--color-text-muted)] mt-2" />
                <Input 
                  value={formData.heroVideoUrl} 
                  onChange={(e) => setFormData({ ...formData, heroVideoUrl: e.target.value })} 
                  placeholder="https://youtube.com/watch?v=..." 
                />
              </div>
              {formData.heroVideoUrl && (
                <div className="mt-2 p-3 rounded-lg bg-[var(--color-bg-muted)]" style={{ fontSize: 'var(--text-sm)' }}>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    Video URL: <span style={{ color: 'var(--color-text-primary)' }}>{formData.heroVideoUrl}</span>
                  </p>
                </div>
              )}
            </AdminFormField>

            <AdminFormField 
              label="Social Share Image (OG:Image)" 
              helpText="Image for social media previews (1200x630px)"
            >
              <Input 
                value={formData.ogImage} 
                onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })} 
                placeholder="https://example.com/social.jpg" 
              />
              {formData.ogImage && (
                <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-default)' }}>
                  <img src={formData.ogImage} alt="Social preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </AdminFormField>
          </div>
        </AdminSection>

        <AdminSection title="SEO & Publishing" description="Meta tags and visibility" icon={<Search className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Meta Description">
              <Textarea value={formData.metaDescription} onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })} placeholder="Page description for search engines" className="min-h-[80px]" />
            </AdminFormField>
            <AdminFormField label="Meta Keywords">
              <Input value={formData.metaKeywords} onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })} placeholder="keyword1, keyword2, keyword3" />
            </AdminFormField>
            <AdminFormField label="OG Title">
              <Input value={formData.ogTitle} onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })} placeholder="Title for social media shares" />
            </AdminFormField>
            <AdminFormField label="OG Description">
              <Textarea value={formData.ogDescription} onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })} placeholder="Description for social media shares" className="min-h-[80px]" />
            </AdminFormField>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors mt-4">
            <Checkbox id="published" checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: checked as boolean })} />
            <Label htmlFor="published" className="cursor-pointer">Published - Make this page visible to all users</Label>
          </div>
        </AdminSection>
        
        {/* WordPress-Style Action Bar */}
        <AdminActionBar
          onDelete={pageId ? () => setIsDeleteDialogOpen(true) : undefined}
          onCancel={onBack}
          onSaveDraft={() => handleSave(false)}
          onPublish={() => handleSave(true)}
          isPublished={formData.published}
          isSaving={saving}
          showDelete={!!pageId}
          publishLabel={formData.published ? 'Update' : 'Save and Publish'}
        />
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