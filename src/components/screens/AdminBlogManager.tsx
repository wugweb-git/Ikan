import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { useIsMobile } from '../../hooks/useIsMobile';

interface BlogContent {
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'tip';
  content: string;
  items?: string[];
}

interface Blog {
  id: string;
  title: string;
  description: string;
  category: string;
  contentType: string;
  readTimeMinutes: number;
  author?: string;
  publishedDate?: string;
  content: BlogContent[];
  tags: string[];
  relatedResources?: any[];
  created_at?: string;
  updated_at?: string;
}

interface AdminBlogManagerProps {
  onNavigate?: (path: string) => void;
  className?: string;
}

export function AdminBlogManager({ onNavigate, className }: AdminBlogManagerProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    description: '',
    category: 'Mental Health',
    contentType: 'Article',
    readTimeMinutes: 5,
    author: '',
    publishedDate: new Date().toISOString().split('T')[0],
    tags: [],
    content: []
  });

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/blogs');
      
      if (response.data?.blogs) {
        setBlogs(response.data.blogs);
      }
    } catch (error: any) {
      console.error('Failed to load blogs:', error);
      showToast('error', 'Load Failed', error.message || 'Could not load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingBlog(null);
    setFormData({
      title: '',
      description: '',
      category: 'Mental Health',
      contentType: 'Article',
      readTimeMinutes: 5,
      author: user?.user_metadata?.name || '',
      publishedDate: new Date().toISOString().split('T')[0],
      tags: [],
      content: [{ type: 'paragraph', content: '' }]
    });
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setIsCreating(false);
    setFormData(blog);
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.description) {
        showToast('warning', 'Validation Error', 'Title and description are required');
        return;
      }

      if (editingBlog) {
        // Update existing blog
        const response = await apiClient.put(`/admin/blogs/${editingBlog.id}`, formData);
        showToast('success', 'Blog Updated', 'Blog post updated successfully');
        setBlogs(prev => prev.map(b => b.id === editingBlog.id ? response.data.blog : b));
      } else {
        // Create new blog
        const response = await apiClient.post('/admin/blogs', formData);
        showToast('success', 'Blog Created', 'New blog post created successfully');
        setBlogs(prev => [response.data.blog, ...prev]);
      }

      setEditingBlog(null);
      setIsCreating(false);
    } catch (error: any) {
      console.error('Save failed:', error);
      showToast('error', 'Save Failed', error.message || 'Could not save blog');
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/blogs/${blogId}`);
      showToast('success', 'Blog Deleted', 'Blog post deleted successfully');
      setBlogs(prev => prev.filter(b => b.id !== blogId));
      
      if (editingBlog?.id === blogId) {
        setEditingBlog(null);
        setIsCreating(false);
      }
    } catch (error: any) {
      console.error('Delete failed:', error);
      showToast('error', 'Delete Failed', error.message || 'Could not delete blog');
    }
  };

  const handleCancel = () => {
    setEditingBlog(null);
    setIsCreating(false);
  };

  const addContentBlock = (type: BlogContent['type']) => {
    setFormData(prev => ({
      ...prev,
      content: [
        ...(prev.content || []),
        { type, content: '', items: type === 'list' ? [''] : undefined }
      ]
    }));
  };

  const updateContentBlock = (index: number, updates: Partial<BlogContent>) => {
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
            Loading blogs...
          </p>
        </div>
      </div>
    );
  }

  if (isCreating || editingBlog) {
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
              {editingBlog ? 'Edit Blog' : 'Create New Blog'}
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
                Save Blog
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Basic Info */}
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
                    placeholder="Enter blog title"
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
                    placeholder="Enter blog description"
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
                      Author
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
                      Published Date
                    </label>
                    <input
                      type="date"
                      value={formData.publishedDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishedDate: e.target.value }))}
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
                    placeholder="UI Design, Marketing, AI Driven"
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
            </div>

            {/* Content Blocks */}
            <div 
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Content Blocks
                </h2>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentBlock('paragraph')}
                    style={{
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    + Paragraph
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentBlock('heading')}
                    style={{
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    + Heading
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentBlock('list')}
                    style={{
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    + List
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentBlock('quote')}
                    style={{
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    + Quote
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {formData.content?.map((block, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-bg-muted)',
                      borderColor: 'var(--color-border-default)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase'
                      }}>
                        {block.type}
                      </span>
                      <button
                        onClick={() => removeContentBlock(index)}
                        style={{
                          padding: 'var(--spacing-1)',
                          color: 'var(--color-semantic-danger)',
                          cursor: 'pointer',
                          background: 'none',
                          border: 'none'
                        }}
                      >
                        <Icon name="trash-2" size={16} />
                      </button>
                    </div>

                    {block.type === 'list' ? (
                      <div className="space-y-2">
                        {block.items?.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateListItem(index, itemIndex, e.target.value)}
                              placeholder="List item"
                              style={{
                                flex: 1,
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
                            <button
                              onClick={() => removeListItem(index, itemIndex)}
                              style={{
                                width: 'var(--ikan-component-button-height)',
                                height: 'var(--ikan-component-button-height)',
                                borderRadius: 'var(--ikan-component-border-radius)',
                                border: '1px solid var(--color-border-default)',
                                backgroundColor: 'var(--color-bg-card)',
                                color: 'var(--color-semantic-danger)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Icon name="x" size={16} />
                            </button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addListItem(index)}
                          style={{
                            height: '36px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 'var(--font-weight-medium)',
                            fontSize: 'var(--text-sm)'
                          }}
                        >
                          + Add Item
                        </Button>
                      </div>
                    ) : (
                      <textarea
                        value={block.content}
                        onChange={(e) => updateContentBlock(index, { content: e.target.value })}
                        placeholder={`Enter ${block.type} content`}
                        rows={block.type === 'paragraph' ? 4 : 2}
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
                    )}
                  </div>
                ))}

                {(!formData.content || formData.content.length === 0) && (
                  <p style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                    padding: 'var(--spacing-8) 0'
                  }}>
                    No content blocks yet. Click the buttons above to add content.
                  </p>
                )}
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
            Blog Manager
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
            Create Blog
          </Button>
        </div>

        {/* Blog List */}
        {blogs.length === 0 ? (
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
              No blogs yet
            </h2>
            <p style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)'
            }}>
              Create your first blog post to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map(blog => (
              <div 
                key={blog.id}
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      {blog.title}
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-3)',
                      lineHeight: 'var(--line-height-md)'
                    }}>
                      {blog.description}
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
                        {blog.category}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        padding: 'var(--spacing-1) var(--spacing-2)',
                        backgroundColor: 'var(--color-bg-muted)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {blog.readTimeMinutes} min read
                      </span>
                      {blog.publishedDate && (
                        <span style={{
                          fontFamily: 'var(--font-family-base)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          padding: 'var(--spacing-1) var(--spacing-2)',
                          backgroundColor: 'var(--color-bg-muted)',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {new Date(blog.publishedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(blog)}
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
                      onClick={() => handleDelete(blog.id)}
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
