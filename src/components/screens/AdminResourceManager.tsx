import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ResourceContent {
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'tip';
  content: string;
  items?: string[];
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  contentType: string;
  readTimeMinutes: number;
  author?: string;
  authorImage?: string;
  publishedDate?: string;
  image?: string;
  content: ResourceContent[];
  tags: string[];
  relatedResources?: any[];
  created_at?: string;
  updated_at?: string;
}

interface AdminResourceManagerProps {
  onBack?: () => void;
  className?: string;
}

export function AdminResourceManager({ onBack, className }: AdminResourceManagerProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Resource>>({
    title: '',
    description: '',
    category: 'Mental Health',
    contentType: 'Article',
    readTimeMinutes: 5,
    author: '',
    authorImage: '',
    image: '',
    publishedDate: new Date().toISOString().split('T')[0],
    tags: [],
    content: []
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/resources');
      
      if (response.data?.resources) {
        setResources(response.data.resources);
      }
    } catch (error: any) {
      console.error('Failed to load resources:', error);
      showToast('error', 'Load Failed', error.message || 'Could not load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingResource(null);
    setFormData({
      title: '',
      description: '',
      category: 'Mental Health',
      contentType: 'Article',
      readTimeMinutes: 5,
      author: user?.user_metadata?.name || '',
      authorImage: '',
      image: '',
      publishedDate: new Date().toISOString().split('T')[0],
      tags: [],
      content: [{ type: 'paragraph', content: '' }]
    });
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setIsCreating(false);
    setFormData(resource);
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.description) {
        showToast('warning', 'Validation Error', 'Title and description are required');
        return;
      }

      if (editingResource) {
        // Update existing resource
        const response = await apiClient.put(`/admin/resources/${editingResource.id}`, formData);
        showToast('success', 'Resource Updated', 'Resource updated successfully');
        setResources(prev => prev.map(r => r.id === editingResource.id ? response.data.resource : r));
      } else {
        // Create new resource
        const response = await apiClient.post('/admin/resources', formData);
        showToast('success', 'Resource Created', 'New resource created successfully');
        setResources(prev => [response.data.resource, ...prev]);
      }

      setEditingResource(null);
      setIsCreating(false);
    } catch (error: any) {
      console.error('Save failed:', error);
      showToast('error', 'Save Failed', error.message || 'Could not save resource');
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/resources/${resourceId}`);
      showToast('success', 'Resource Deleted', 'Resource deleted successfully');
      setResources(prev => prev.filter(r => r.id !== resourceId));
      
      if (editingResource?.id === resourceId) {
        setEditingResource(null);
        setIsCreating(false);
      }
    } catch (error: any) {
      console.error('Delete failed:', error);
      showToast('error', 'Delete Failed', error.message || 'Could not delete resource');
    }
  };

  const handleCancel = () => {
    setEditingResource(null);
    setIsCreating(false);
  };

  const addContentBlock = (type: ResourceContent['type']) => {
    setFormData(prev => ({
      ...prev,
      content: [
        ...(prev.content || []),
        { type, content: '', items: type === 'list' ? [''] : undefined }
      ]
    }));
  };

  const updateContentBlock = (index: number, updates: Partial<ResourceContent>) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content?.map((block, i) => 
        i === index ? { ...block, ...updates } : block
      ) || []
    }));
  };

  const removeContentBlock = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content?.filter((_, i) => i !== index) || []
    }));
  };

  const addListItem = (blockIndex: number) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content?.map((block, i) => 
        i === blockIndex && block.type === 'list' 
          ? { ...block, items: [...(block.items || []), ''] }
          : block
      ) || []
    }));
  };

  const updateListItem = (blockIndex: number, itemIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content?.map((block, i) => 
        i === blockIndex && block.type === 'list'
          ? { ...block, items: block.items?.map((item, j) => j === itemIndex ? value : item) }
          : block
      ) || []
    }));
  };

  const removeListItem = (blockIndex: number, itemIndex: number) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content?.map((block, i) => 
        i === blockIndex && block.type === 'list'
          ? { ...block, items: block.items?.filter((_, j) => j !== itemIndex) }
          : block
      ) || []
    }));
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          backgroundColor: 'var(--color-bg-page)',
          padding: 'var(--spacing-4)'
        }}
      >
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
          <p style={{ 
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)'
          }}>
            Loading resources...
          </p>
        </div>
      </div>
    );
  }

  if (isCreating || editingResource) {
    return (
      <div 
        className={cn("min-h-screen", className)}
        style={{ 
          backgroundColor: 'var(--color-bg-page)',
          padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)'
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {editingResource ? 'Edit Resource' : 'Create New Resource'}
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  paddingLeft: 'var(--spacing-4)',
                  paddingRight: 'var(--spacing-4)'
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)',
                  fontWeight: 'var(--font-weight-medium)',
                  paddingLeft: 'var(--spacing-4)',
                  paddingRight: 'var(--spacing-4)'
                }}
              >
                Save Resource
              </Button>
            </div>
          </div>

          {/* Basic Info Form */}
          <div className="space-y-6">
            <div 
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-4)'
              }}>
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    display: 'block',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter resource title"
                    style={{
                      width: '100%',
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      backgroundColor: 'var(--color-bg-input)',
                      border: '1px solid var(--color-border-default)',
                      padding: '0 var(--spacing-3)',
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    display: 'block',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter resource description"
                    rows={3}
                    style={{
                      width: '100%',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      backgroundColor: 'var(--color-bg-input)',
                      border: '1px solid var(--color-border-default)',
                      padding: 'var(--spacing-3)',
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    display: 'block',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      backgroundColor: 'var(--color-bg-input)',
                      border: '1px solid var(--color-border-default)',
                      padding: '0 var(--spacing-3)',
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                  {formData.image && (
                    <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      display: 'block',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      style={{
                        width: '100%',
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        backgroundColor: 'var(--color-bg-input)',
                        border: '1px solid var(--color-border-default)',
                        padding: '0 var(--spacing-3)',
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      display: 'block',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      Author Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.authorImage || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, authorImage: e.target.value }))}
                      placeholder="https://..."
                      style={{
                        width: '100%',
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        backgroundColor: 'var(--color-bg-input)',
                        border: '1px solid var(--color-border-default)',
                        padding: '0 var(--spacing-3)',
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      display: 'block',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      style={{
                        width: '100%',
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        backgroundColor: 'var(--color-bg-input)',
                        border: '1px solid var(--color-border-default)',
                        padding: '0 var(--spacing-3)',
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      display: 'block',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      Content Type
                    </label>
                    <select
                      value={formData.contentType || 'Article'}
                      onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
                      style={{
                        width: '100%',
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        backgroundColor: 'var(--color-bg-input)',
                        border: '1px solid var(--color-border-default)',
                        padding: '0 var(--spacing-3)',
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <option value="Article">Article</option>
                      <option value="Video">Video</option>
                      <option value="Tool">Tool</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      display: 'block',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      Read Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.readTimeMinutes || 5}
                      onChange={(e) => setFormData(prev => ({ ...prev, readTimeMinutes: parseInt(e.target.value) || 5 }))}
                      min="1"
                      style={{
                        width: '100%',
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        backgroundColor: 'var(--color-bg-input)',
                        border: '1px solid var(--color-border-default)',
                        padding: '0 var(--spacing-3)',
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    display: 'block',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(formData.tags || []).join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                    }))}
                    placeholder="Mental Health, Wellness, Self-Care"
                    style={{
                      width: '100%',
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      backgroundColor: 'var(--color-bg-input)',
                      border: '1px solid var(--color-border-default)',
                      padding: '0 var(--spacing-3)',
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    display: 'block',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    Related Resource IDs (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(formData.relatedResources || []).join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      relatedResources: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                    }))}
                    placeholder="resource-1, resource-2"
                    style={{
                      width: '100%',
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      backgroundColor: 'var(--color-bg-input)',
                      border: '1px solid var(--color-border-default)',
                      padding: '0 var(--spacing-3)',
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the IDs of resources you want to appear in the "You might also like" section.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("min-h-screen", className)}
      style={{ 
        backgroundColor: 'var(--color-bg-page)',
        padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}>
            Resource Manager
          </h1>
          <Button
            onClick={handleCreateNew}
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              fontWeight: 'var(--font-weight-medium)',
              paddingLeft: 'var(--spacing-4)',
              paddingRight: 'var(--spacing-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)'
            }}
          >
            <Icon name="plus" size={20} />
            Create Resource
          </Button>
        </div>

        {/* Resource List */}
        {resources.length === 0 ? (
          <div 
            className="p-12 text-center rounded-lg"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Icon name="file-text" size={48} style={{ margin: '0 auto var(--spacing-4)', opacity: 0.3 }} />
            <h2 style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-2)'
            }}>
              No resources yet
            </h2>
            <p style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)'
            }}>
              Create your first resource to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map(resource => (
              <div 
                key={resource.id}
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                    {resource.image ? (
                      <img src={resource.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Icon name="image" size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      {resource.title}
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-3)',
                      lineHeight: 'var(--line-height-md)'
                    }}>
                      {resource.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        padding: 'var(--spacing-1) var(--spacing-2)',
                        backgroundColor: 'var(--color-bg-muted)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {resource.category}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        padding: 'var(--spacing-1) var(--spacing-2)',
                        backgroundColor: 'var(--color-bg-muted)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {resource.readTimeMinutes} min read
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(resource)}
                      style={{
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        fontWeight: 'var(--font-weight-medium)',
                        paddingLeft: 'var(--spacing-3)',
                        paddingRight: 'var(--spacing-3)'
                      }}
                    >
                      <Icon name="edit" size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(resource.id)}
                      style={{
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        fontWeight: 'var(--font-weight-medium)',
                        paddingLeft: 'var(--spacing-3)',
                        paddingRight: 'var(--spacing-3)',
                        color: 'var(--color-semantic-danger)',
                        borderColor: 'var(--color-semantic-danger)'
                      }}
                    >
                      <Icon name="trash-2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}