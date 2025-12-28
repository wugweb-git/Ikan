import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, FolderOpen, Tag, Palette 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  type: 'resource' | 'assessment' | 'equip' | 'general';
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminCategoryManagerProps {
  onBack?: () => void;
}

const ICON_OPTIONS = [
  { value: 'heart', label: '❤️ Heart', emoji: '❤️' },
  { value: 'brain', label: '🧠 Brain', emoji: '🧠' },
  { value: 'star', label: '⭐ Star', emoji: '⭐' },
  { value: 'lightbulb', label: '💡 Lightbulb', emoji: '💡' },
  { value: 'book', label: '📚 Book', emoji: '📚' },
  { value: 'target', label: '🎯 Target', emoji: '🎯' },
  { value: 'sparkles', label: '✨ Sparkles', emoji: '✨' },
  { value: 'flower', label: '🌸 Flower', emoji: '🌸' },
  { value: 'sun', label: '☀️ Sun', emoji: '☀️' },
  { value: 'moon', label: '🌙 Moon', emoji: '🌙' },
  { value: 'leaf', label: '🍃 Leaf', emoji: '🍃' },
  { value: 'wellness', label: '🧘 Wellness', emoji: '🧘' },
];

const COLOR_PRESETS = [
  { value: '#2A2A2A', label: 'Primary Dark' },
  { value: '#E9EBEF', label: 'Accent Light' },
  { value: '#EF4444', label: 'Red' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#10B981', label: 'Green' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
];

export function AdminCategoryManager({ onBack }: AdminCategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'heart',
    color: '#2A2A2A',
    description: '',
    type: 'general' as Category['type']
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/categories`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      
      if (!response.ok) throw new Error('Failed to load categories');
      
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...formData,
            slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
            order: categories.length,
            is_active: true
          })
        }
      );

      if (!response.ok) throw new Error('Failed to create category');

      toast.success('Category created successfully');
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/categories/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) throw new Error('Failed to update category');

      toast.success('Category updated successfully');
      setEditingId(null);
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/categories/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (!response.ok) throw new Error('Failed to delete category');

      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      color: category.color,
      description: category.description,
      type: category.type
    });
    setIsCreating(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon: 'heart',
      color: '#2A2A2A',
      description: '',
      type: 'general'
    });
    setIsCreating(false);
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p style={{ color: 'var(--color-text-muted)' }}>Loading categories...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
            style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}
          >
            Category Manager
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
            Manage categories for resources, assessments, and programs
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
          style={{ gap: 'var(--spacing-2)' }}
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{isCreating ? 'Create New Category' : 'Edit Category'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Anxiety, Self-Care"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}
                />
              </div>

              <div className="space-y-2">
                <Label>Slug (URL-friendly)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. anxiety, self-care"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger style={{ backgroundColor: 'var(--color-bg-input)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                    <SelectTrigger style={{ backgroundColor: 'var(--color-bg-input)' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_PRESETS.map(preset => (
                        <SelectItem key={preset.value} value={preset.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: preset.value }}
                            />
                            {preset.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                    style={{ border: '1px solid var(--color-border-default)' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value: Category['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger style={{ backgroundColor: 'var(--color-bg-input)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="equip">Equip Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}
                />
              </div>
            </div>

            {/* Preview */}
            <div 
              className="p-4 rounded-lg flex items-center gap-3"
              style={{ 
                backgroundColor: `${formData.color}10`,
                border: `2px solid ${formData.color}`
              }}
            >
              <span style={{ fontSize: '24px' }}>
                {ICON_OPTIONS.find(i => i.value === formData.icon)?.emoji || '❤️'}
              </span>
              <div>
                <p style={{ fontWeight: 'var(--font-weight-medium)', color: formData.color }}>
                  {formData.name || 'Category Name'}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {formData.description || 'Category description'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {editingId ? (
                <Button onClick={() => handleUpdate(editingId)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              ) : (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </Button>
              )}
              <Button variant="outline" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>
                No categories yet. Create your first category to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ 
                    backgroundColor: editingId === category.id 
                      ? 'var(--color-accent-default)' 
                      : 'var(--color-bg-muted)',
                    border: editingId === category.id 
                      ? '2px solid var(--color-primary-default)' 
                      : '1px solid var(--color-border-default)'
                  }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <span style={{ fontSize: '24px' }}>
                        {ICON_OPTIONS.find(i => i.value === category.icon)?.emoji || '❤️'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{category.name}</p>
                        <span 
                          className="px-2 py-1 rounded text-xs"
                          style={{ 
                            backgroundColor: category.color,
                            color: 'white'
                          }}
                        >
                          {category.type}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                        {category.description}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                        Slug: /{category.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(category)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger-default)' }} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}