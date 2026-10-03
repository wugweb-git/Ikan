import { useState, useEffect } from 'react';
import { FileText, BookOpen, Download, Globe } from 'lucide-react';
import { useNotifications } from '../../shared/state/NotificationContext';
import { apiClient } from '../../shared/api/api';
import type { ResourceData } from '../../shared/api/api-types';
import { AdminSection } from '../shell/AdminSection';
import { AdminFormField } from '../ui/kit/AdminFormField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageUpload } from '../ui/image-upload';
import { TagInput } from '../ui/tag-input';
import { RichTextEditor } from '../ui/rich-text-editor';
import type { ValidationSchema } from '../ui/hooks/useFormValidation';
import { validateUrl } from '../ui/lib/validation';
import { useMetadata } from '../ui/hooks/useMetadata';
import { useAdminResource } from '../ui/hooks/useAdminResource';
import { AdminActionBar } from '../ui/admin-action-bar';
import { EntityEditPage, useEntityEdit } from '../ui/kit/EntityEditPage';
import { useConfirm } from '../ui/kit/ConfirmDialog';

export interface Resource {
  id: string;
  title: string;
  category: string; // Dynamic type
  filter_type?: string; // Format type
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
  published_at?: string;
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
    validate: (value: unknown) => {
      const num = parseInt(String(value));
      return num > 0 && num <= 120;
    },
    message: 'Read time must be between 1 and 120 minutes'
  },
  thumbnail: {
    validate: (value: unknown) => !value || !validateUrl(String(value)),
    message: 'Thumbnail must be a valid URL'
  },
  pdfUrl: {
    validate: (value: unknown) => !value || !validateUrl(String(value)),
    message: 'PDF URL must be a valid URL'
  },
  videoUrl: {
    validate: (value: unknown) => !value || !validateUrl(String(value)),
    message: 'Video URL must be a valid URL'
  },
  externalLink: {
    validate: (value: unknown) => !value || !validateUrl(String(value)),
    message: 'External Link must be a valid URL'
  }
};

export function ResourceEditPage({ resourceId, onBack, onSave }: ResourceEditPageProps) {
  const { showToast } = useNotifications();
  const { categories: kvCategories, filterTypes: kvFilterTypes, difficultyLevels: kvDifficultyLevels } = useMetadata();

  /**
   * An article's category IS an assessment category — it is the whole join
   * between an article and the result screen it appears on. A tag outside this
   * list means the article can never surface anywhere.
   *
   * The `category:` catalog holds 19 rows, only seven of which name an
   * assessment: `confidence`, `energy`, `focus`, `habits`, `mental-health` and
   * others are content labels that match nothing. Two articles were tagged
   * `mental-health` and were invisible until a mapping layer was added for
   * them; they were retagged `general` on 2026-09-08 and the layer deleted.
   * Constraining the picker is what stops that recurring.
   *
   * Filtered like `RecommendationRulesManager` filters its severity list, and
   * for the same reason: the catalog is admin-editable, so constraining only
   * the fallback would leave the hole open one edit away.
   */
  const ASSESSMENT_CATEGORIES = [
    'anxiety', 'balance', 'burnout', 'depression', 'general', 'sleep', 'stress',
  ];

  const FALLBACK_CATEGORIES = ASSESSMENT_CATEGORIES.map(v => ({
    value: v, label: v.charAt(0).toUpperCase() + v.slice(1),
  }));

  const categoryOptions = (kvCategories.length > 0
    ? kvCategories.map(c => ({ value: c.value, label: c.label }))
    : FALLBACK_CATEGORIES
  ).filter(c => ASSESSMENT_CATEGORIES.includes(c.value));
  const confirm = useConfirm();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Resource>>({
    title: '',
    category: 'general',
    filter_type: 'article',
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

  const edit = useEntityEdit(validationSchema);
  const { errors, validateForm, markAsSaved, markAsUnsaved } = edit;

  useEffect(() => {
    if (formData.title || formData.description) {
      markAsUnsaved();
    }
  }, [formData, markAsUnsaved]);

  // Load the resource (only when editing an existing one)
  const { loading } = useAdminResource<Partial<Resource>>(
    async () => {
      const data = await apiClient.getResource(resourceId!);
      // Extract resource from response wrapper if needed
      const resourceData = data?.resource || data;
      if (!resourceData) {
        throw new Error('Resource not found');
      }
      return resourceData;
    },
    {
      enabled: !!resourceId,
      deps: [resourceId],
      errorTitle: 'Error',
      errorMessage: 'Failed to load resource data',
      onSuccess: setFormData,
      onError: () => onBack(),
    }
  );

  const handleSave = async (shouldPublish?: boolean) => {
    const isValid = validateForm(formData);
    if (!isValid) {
      showToast('error', 'Validation Error', 'Please fix the errors before saving');
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

      if (resourceId) {
        try {
          await apiClient.updateResource(resourceId, dataToSave as ResourceData);
          showToast('success', 'Success', dataToSave.published ? 'Resource published successfully' : 'Resource saved as draft');
        } catch (error: any) {
          // If resource is not found on server (404), try to recreate it (upsert)
          if (error.message && error.message.includes('Resource not found')) {
            console.warn('[RESOURCE SAVE] Resource not found during update, attempting to recreate/upsert...');
            await apiClient.createResource({ ...dataToSave, id: resourceId } as ResourceData);
            showToast('success', 'Success', 'Resource restored and updated');
          } else {
            throw error;
          }
        }
      } else {
        await apiClient.createResource(dataToSave as ResourceData);
        showToast('success', 'Success', dataToSave.published ? 'Resource published successfully' : 'Resource created as draft');
      }

      markAsSaved();
      onSave();
    } catch (error: any) {
      console.error('[RESOURCE SAVE] Failed to save resource:', error);
      showToast('error', 'Error', error.message || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!resourceId) return;

    const ok = await confirm({
      title: 'Delete Resource',
      description: `Are you sure you want to delete "${formData.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete Resource',
      destructive: true,
    });
    if (!ok) return;

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
    }
  };

  /**
   * The header's primary square toggles Publish/Unpublish, but Ctrl/⌘-S (which
   * EntityEditPage routes to the same `onSave`) must only save, keeping the
   * current status — as it always has. The button hands us its click event;
   * the shortcut calls with no arguments.
   */
  const handlePrimary = (event?: unknown) => {
    const isClick = typeof event === 'object' && event !== null && 'nativeEvent' in event;
    void handleSave(isClick ? !formData.published : undefined);
  };

  return (
    <EntityEditPage
      edit={edit}
      title={resourceId ? formData.title || 'Edit Resource' : 'New Resource'}
      subtitle={resourceId ? 'Update resource information' : 'Create a new educational resource'}
      status={
        formData.published
          ? { label: 'Published', variant: 'success' }
          : { label: 'Draft', variant: 'warning' }
      }
      onBack={onBack}
      onSave={handlePrimary}
      saveLabel={formData.published ? 'Unpublish' : 'Publish'}
      saving={saving}
      onDelete={resourceId ? handleDelete : undefined}
      onSaveDraft={() => handleSave(false)}
      toggleActions={[
        {
          label: 'Featured',
          checked: formData.featured || false,
          onChange: (checked) => setFormData(prev => ({ ...prev, featured: checked }))
        }
      ]}
      loading={loading}
      loadingMessage="Loading resource..."
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
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Dr. Jane Smith"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            />
          </AdminFormField>

          <AdminFormField label="Topic Category" required>
            <Select
              value={formData.category || 'general'}
              onValueChange={(v: any) => setFormData(prev => ({ ...prev, category: v }))}
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

          <AdminFormField label="Content Format" required>
            <Select
              value={formData.filter_type || 'article'}
              onValueChange={(v: any) => setFormData(prev => ({ ...prev, filter_type: v }))}
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
                {kvFilterTypes.map((opt) => (
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
              onValueChange={(v: any) => setFormData(prev => ({ ...prev, difficulty: v }))}
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
                {kvDifficultyLevels.map((opt) => (
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
              onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 0 }))}
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
              onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
            onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
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
            onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, externalLink: e.target.value }))}
              placeholder="https://external-resource.com"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            />
          </AdminFormField>
        </div>
      </AdminSection>

      {/* Analytics */}
      {resourceId && (
        <AdminSection
          title="Analytics"
          description="Resource performance metrics"
          icon={<Globe className="w-5 h-5" />}
        >
          <div className="grid md:grid-cols-2 gap-4">
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
        </AdminSection>
      )}
      
      {/* WordPress-Style Action Bar */}
      <AdminActionBar
        onDelete={resourceId ? handleDelete : undefined}
        onCancel={onBack}
        onSaveDraft={() => handleSave(false)}
        onPublish={() => handleSave(true)}
        isPublished={formData.published || false}
        isSaving={saving}
        showDelete={!!resourceId}
        publishLabel={formData.published ? 'Update' : 'Save and Publish'}
      />
    </EntityEditPage>
  );
}
