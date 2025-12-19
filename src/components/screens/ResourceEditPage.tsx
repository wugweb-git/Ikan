import React, { useState, useEffect } from 'react';
import { Save, Trash2, FileText, BookOpen, Download, Globe, Eye, Tag, Link as LinkIcon } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminPageLayout } from '../admin/AdminPageLayout';
import { AdminSection } from '../admin/AdminSection';
import { AdminFormField } from '../admin/AdminFormField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { ImageUpload } from '../ui/image-upload';
import { TagInput } from '../ui/tag-input';
import { RichTextEditor } from '../ui/rich-text-editor';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

export interface Resource {
  id: string;
  title: string;
  category: 'article' | 'video' | 'podcast' | 'workbook' | 'guide';
  description: string;
  content?: string;
  author: string;
  thumbnail?: string;
  tags: string[];
  readTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  pdfUrl?: string;
  videoUrl?: string;
  externalLink?: string;
  published: boolean;
  featured?: boolean;
  viewCount?: number;
  likes?: number;
  created_at?: string;
  updated_at?: string;
}

interface ResourceEditPageProps {
  resourceId?: string;
  onBack: () => void;
  onSave: () => void;
}

const categoryOptions = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'workbook', label: 'Workbook' },
  { value: 'guide', label: 'Guide' }
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export function ResourceEditPage({ resourceId, onBack, onSave }: ResourceEditPageProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!resourceId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Resource>>({
    title: '',
    category: 'article',
    description: '',
    content: '',
    author: '',
    thumbnail: '',
    tags: [],
    readTime: 5,
    difficulty: 'beginner',
    pdfUrl: '',
    videoUrl: '',
    externalLink: '',
    published: false,
    featured: false
  });

  // Form validation
  const validationSchema: ValidationSchema = {
    title: {
      required: true,
      minLength: 3,
      message: 'Title must be at least 3 characters'
    },
    description: {
      required: true,
      minLength: 20,
      message: 'Description must be at least 20 characters'
    },
    author: {
      required: true,
      minLength: 2,
      message: 'Author name is required'
    },
    readTime: {
      validate: (value: any) => {
        const num = parseInt(value);
        return num > 0 && num <= 120;
      },
      message: 'Read time must be between 1 and 120 minutes'
    }
  };

  const { errors, validateForm } = useFormValidation(validationSchema);
  const { hasUnsavedChanges, markAsSaved, markAsUnsaved, setShowWarning, showWarning } = useUnsavedChanges();

  useEffect(() => {
    if (formData.title || formData.description) {
      markAsUnsaved();
    }
  }, [formData]);

  useEffect(() => {
    if (resourceId) {
      loadResource();
    }
  }, [resourceId]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getResource(resourceId!);
      // Extract resource from response wrapper if needed
      const resourceData = data.resource || data;
      
      if (!resourceData) {
        throw new Error('Resource not found');
      }
      
      setFormData(resourceData);
    } catch (error) {
      console.error('Failed to load resource:', error);
      showToast('error', 'Error', 'Failed to load resource data');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const isValid = validateForm(formData);
    if (!isValid) {
      showToast('error', 'Validation Error', 'Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);

      if (resourceId) {
        try {
          await apiClient.updateResource(resourceId, formData);
          showToast('success', 'Success', 'Resource updated successfully');
        } catch (error: any) {
          // If resource is not found on server (404), try to recreate it (upsert)
          if (error.message && error.message.includes('Resource not found')) {
            console.warn('Resource not found during update, attempting to recreate/upsert...');
            await apiClient.createResource({ ...formData, id: resourceId });
            showToast('success', 'Success', 'Resource restored and updated');
          } else {
            throw error;
          }
        }
      } else {
        await apiClient.createResource(formData);
        showToast('success', 'Success', 'Resource created successfully');
      }

      markAsSaved();
      onSave();
    } catch (error: any) {
      console.error('Failed to save resource:', error);
      showToast('error', 'Error', error.message || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!resourceId) return;

    try {
      setSaving(true);
      await apiClient.deleteResource(resourceId);
      showToast('success', 'Success', 'Resource deleted successfully');
      onSave();
    } catch (error: any) {
      console.error('Failed to delete resource:', error);
      showToast('error', 'Error', error.message || 'Failed to delete resource');
    } finally {
      setSaving(false);
      setIsDeleteDialogOpen(false);
    }
  };

  useKeyboardShortcuts(
    {
      'ctrl+s': (e) => {
        e.preventDefault();
        handleSave();
      },
      escape: () => {
        if (hasUnsavedChanges) {
          setShowWarning(true);
        } else {
          onBack();
        }
      }
    },
    [formData, hasUnsavedChanges]
  );

  if (loading) {
    return (
      <AdminPageLayout
        title="Loading..."
        breadcrumbs={[
          { label: 'Admin', onClick: onBack },
          { label: 'Resources', onClick: onBack },
          { label: 'Loading...' }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div
            className="animate-spin rounded-full border-4"
            style={{
              width: '48px',
              height: '48px',
              borderColor: 'var(--color-accent-default)',
              borderTopColor: 'var(--color-primary-default)'
            }}
          />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <>
      <AdminPageLayout
        title={resourceId ? formData.title || 'Edit Resource' : 'New Resource'}
        subtitle={resourceId ? 'Update resource information' : 'Create a new educational resource'}
        breadcrumbs={[
          { label: 'Admin', onClick: onBack },
          { label: 'Resources', onClick: onBack },
          { label: resourceId ? formData.title || 'Edit' : 'New Resource' }
        ]}
        status={
          formData.published
            ? { label: 'Published', variant: 'success' }
            : { label: 'Draft', variant: 'warning' }
        }
        primaryAction={{
          label: resourceId ? 'Save Changes' : 'Create Resource',
          icon: <Save className="w-4 h-4" />,
          onClick: handleSave,
          loading: saving
        }}
        secondaryActions={[
          ...(resourceId
            ? [
                {
                  label: 'Delete',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => setIsDeleteDialogOpen(true),
                  variant: 'destructive' as const
                }
              ]
            : [])
        ]}
        onBack={() => {
          if (hasUnsavedChanges) {
            setShowWarning(true);
          } else {
            onBack();
          }
        }}
        maxWidth="xl"
      >
        {/* Basic Information */}
        <AdminSection
          title="Basic Information"
          description="Core resource details and metadata"
          icon={<FileText className="w-5 h-5" />}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Title" required error={errors.title}>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Understanding Anxiety: A Complete Guide"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Author" required error={errors.author}>
              <Input
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Dr. Jane Smith"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Category" required>
              <Select
                value={formData.category || 'article'}
                onValueChange={(v: any) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>

            <AdminFormField label="Difficulty Level">
              <Select
                value={formData.difficulty || 'beginner'}
                onValueChange={(v: any) => setFormData({ ...formData, difficulty: v })}
              >
                <SelectTrigger
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>

            <AdminFormField label="Read Time (minutes)" required error={errors.readTime}>
              <Input
                type="number"
                value={formData.readTime || 0}
                onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 0 })}
                min="1"
                max="120"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Thumbnail URL" helpText="Preview image for the resource">
              <ImageUpload
                value={formData.thumbnail || ''}
                onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                placeholder="https://..."
              />
            </AdminFormField>
          </div>

          <AdminFormField
            label="Description"
            required
            error={errors.description}
            description="Brief summary of the resource"
          >
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A comprehensive guide to understanding and managing anxiety..."
              className="min-h-[100px]"
              style={{
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            />
          </AdminFormField>

          <AdminFormField label="Tags" description="Keywords for categorization and search">
            <TagInput
              value={formData.tags || []}
              onChange={(tags) => setFormData({ ...formData, tags })}
              placeholder="Add tags..."
            />
          </AdminFormField>
        </AdminSection>

        {/* Content Details */}
        <AdminSection
          title="Content Details"
          description="Full content and body text"
          icon={<BookOpen className="w-5 h-5" />}
        >
          <AdminFormField
            label="Full Content"
            description="Complete article content (supports Markdown)"
            helpText="Use the editor below for rich text formatting"
          >
            <RichTextEditor
              value={formData.content || ''}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Start writing your resource content..."
              minHeight="300px"
            />
          </AdminFormField>
        </AdminSection>

        {/* Media & Downloads */}
        <AdminSection
          title="Media & Downloads"
          description="Attached files and external links"
          icon={<Download className="w-5 h-5" />}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="PDF URL" helpText="Link to downloadable PDF">
              <Input
                value={formData.pdfUrl || ''}
                onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                placeholder="https://example.com/guide.pdf"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Video URL" helpText="YouTube or Vimeo link">
              <Input
                value={formData.videoUrl || ''}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="External Link" helpText="Link to external resource">
              <Input
                value={formData.externalLink || ''}
                onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                placeholder="https://external-resource.com"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* Publishing Options */}
        <AdminSection
          title="Publishing Options"
          description="Control visibility and featured status"
          icon={<Globe className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
              <Checkbox
                id="published"
                checked={formData.published || false}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked as boolean })}
              />
              <div className="flex-1">
                <Label htmlFor="published" className="cursor-pointer flex items-center gap-2">
                  <Eye className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
                  Published
                </Label>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    marginTop: 'var(--spacing-1)'
                  }}
                >
                  Make this resource visible to all users
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
              <Checkbox
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
              />
              <div className="flex-1">
                <Label htmlFor="featured" className="cursor-pointer flex items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />
                  Featured
                </Label>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    marginTop: 'var(--spacing-1)'
                  }}
                >
                  Show in featured resources section
                </p>
              </div>
            </div>
          </div>

          {resourceId && (
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-1)'
                  }}
                >
                  View Count
                </p>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
                  {formData.viewCount || 0}
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-1)'
                  }}
                >
                  Likes
                </p>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
                  {formData.likes || 0}
                </p>
              </div>
            </div>
          )}
        </AdminSection>
      </AdminPageLayout>

      <UnsavedChangesDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={() => {
          markAsSaved();
          onBack();
        }}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{formData.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              style={{ backgroundColor: 'var(--color-danger-default)', color: 'white' }}
            >
              Delete Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}