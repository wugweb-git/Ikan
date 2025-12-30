import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, FolderOpen, Tag, Palette, Database,
  FileText, PenTool, Activity, Video, Mic, Book, GraduationCap, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { apiClient } from '../../lib/api-client';
import { toast } from 'sonner@2.0.3';
import { RESOURCE_CATEGORIES, RESOURCE_TYPES, CONTENT_TYPES } from '../../lib/constants';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description: string;
  group: 'category' | 'content_type' | 'filter_type';
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminCategoryManagerProps {
  onBack?: () => void;
}

const ICON_OPTIONS = [
  { value: 'file-text', label: 'File/Article', emoji: '📄', icon: FileText },
  { value: 'tool', label: 'Tool', emoji: '🛠️', icon: PenTool },
  { value: 'activity', label: 'Activity/Exercise', emoji: '⚡', icon: Activity },
  { value: 'video', label: 'Video', emoji: '🎥', icon: Video },
  { value: 'mic', label: 'Audio', emoji: '🎤', icon: Mic },
  { value: 'book', label: 'Workbook', emoji: '📚', icon: Book },
  { value: 'graduation-cap', label: 'Course', emoji: '🎓', icon: GraduationCap },
  { value: 'layout', label: 'Layout', emoji: '⚏', icon: Layers },
  { value: 'heart', label: 'Heart', emoji: '❤️' },
  { value: 'brain', label: 'Brain', emoji: '🧠' },
  { value: 'star', label: 'Star', emoji: '⭐' },
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
  { value: '#6366F1', label: 'Indigo' },
  { value: '#14B8A6', label: 'Teal' },
];

const DEFAULT_SEEDS = {
  categories: RESOURCE_CATEGORIES.map(c => c.label),
  content_types: CONTENT_TYPES,
  filter_types: RESOURCE_TYPES.map(t => ({ name: t.label, icon: t.icon }))
};

export function AdminCategoryManager({ onBack }: AdminCategoryManagerProps) {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'category' | 'content_type' | 'filter_type'>('category');
  
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    icon: string;
    color: string;
    description: string;
    group: 'category' | 'content_type' | 'filter_type';
  }>({
    name: '',
    slug: '',
    icon: 'file-text',
    color: '#2A2A2A',
    description: '',
    group: 'category'
  });

  useEffect(() => {
    loadItems();
  }, []);

  // Update form group when tab changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, group: activeTab }));
    setIsCreating(false);
    setEditingId(null);
  }, [activeTab]);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getCategories();
      // Map legacy data if necessary, or just use as is
      const mappedData = data.map((item: any) => ({
        ...item,
        // Default to 'category' if group is missing
        group: item.group || (item.filter_type && item.filter_type !== 'all' ? 'filter_type' : 'category')
      }));
      setItems(mappedData);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm('This will add any missing default items. Continue?')) return;
    
    setIsLoading(true);
    try {
      let addedCount = 0;
      
      // Seed Categories
      for (const name of DEFAULT_SEEDS.categories) {
        if (!items.some(i => i.group === 'category' && i.name.toLowerCase() === name.toLowerCase())) {
           await apiClient.createCategory({
             name,
             slug: name.toLowerCase().replace(/\s+/g, '-'),
             color: '#2A2A2A',
             description: `Category for ${name}`,
             group: 'category',
             order: items.length + addedCount,
             is_active: true
           });
           addedCount++;
        }
      }

      // Seed Content Types
      for (const name of DEFAULT_SEEDS.content_types) {
        if (!items.some(i => i.group === 'content_type' && i.name.toLowerCase() === name.toLowerCase())) {
           await apiClient.createCategory({
             name,
             slug: name.toLowerCase().replace(/\s+/g, '-'),
             description: `${name} content type`,
             group: 'content_type',
             order: items.length + addedCount,
             is_active: true
           });
           addedCount++;
        }
      }

      // Seed Filter Types
      for (const type of DEFAULT_SEEDS.filter_types) {
        if (!items.some(i => i.group === 'filter_type' && i.name.toLowerCase() === type.name.toLowerCase())) {
           await apiClient.createCategory({
             name: type.name,
             slug: type.name.toLowerCase().replace(/\s+/g, '-'),
             icon: type.icon,
             description: `${type.name} format`,
             group: 'filter_type',
             order: items.length + addedCount,
             is_active: true
           });
           addedCount++;
        }
      }
      
      if (addedCount > 0) {
        toast.success(`Added ${addedCount} default items`);
        loadItems();
      } else {
        toast.info('All defaults already exist');
      }
    } catch (error) {
      console.error('Error seeding defaults:', error);
      toast.error('Failed to seed defaults');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      await apiClient.createCategory({
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        order: items.length,
        is_active: true
      });

      toast.success('Item created successfully');
      resetForm();
      loadItems();
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await apiClient.updateCategory(id, formData);

      toast.success('Item updated successfully');
      setEditingId(null);
      resetForm();
      loadItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteCategory(id);

      toast.success('Item deleted successfully');
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const startEdit = (item: CategoryItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      slug: item.slug,
      icon: item.icon || 'file-text',
      color: item.color || '#2A2A2A',
      description: item.description || '',
      group: item.group
    });
    setIsCreating(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon: 'file-text',
      color: '#2A2A2A',
      description: '',
      group: activeTab
    });
    setIsCreating(false);
    setEditingId(null);
  };

  // Filter items based on active tab
  const displayedItems = items.filter(item => item.group === activeTab);

  const getTabLabel = (tab: string) => {
    switch(tab) {
      case 'category': return 'Categories';
      case 'content_type': return 'Content Types';
      case 'filter_type': return 'Filter Types';
      default: return tab;
    }
  };

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
            Metadata Manager
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
            Manage categories, content types, and filters
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleSeedDefaults}
            style={{ gap: 'var(--spacing-2)' }}
            disabled={isLoading}
          >
            <Database className="w-4 h-4" />
            Seed Defaults
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="category">Categories</TabsTrigger>
          <TabsTrigger value="content_type">Content Types</TabsTrigger>
          <TabsTrigger value="filter_type">Filter Types</TabsTrigger>
        </TabsList>

        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            style={{ gap: 'var(--spacing-2)' }}
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'category' ? 'Category' : activeTab === 'content_type' ? 'Content Type' : 'Filter Type'}
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Create New' : 'Edit'} {activeTab === 'category' ? 'Category' : activeTab === 'content_type' ? 'Content Type' : 'Filter Type'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Name"
                    style={{ backgroundColor: 'var(--color-bg-input)' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-friendly-slug"
                    style={{ backgroundColor: 'var(--color-bg-input)' }}
                  />
                </div>

                {/* Fields specific to Filter Type */}
                {activeTab === 'filter_type' && (
                  <div className="space-y-2">
                    <Label>Icon *</Label>
                    <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                      <SelectTrigger style={{ backgroundColor: 'var(--color-bg-input)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map(option => {
                          const IconComp = option.icon || FileText;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <IconComp className="w-4 h-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Fields specific to Category (Color) */}
                {activeTab === 'category' && (
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
                )}

                <div className="space-y-2 col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description"
                    style={{ backgroundColor: 'var(--color-bg-input)' }}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                {editingId ? (
                  <Button onClick={() => handleUpdate(editingId)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                ) : (
                  <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{getTabLabel(activeTab)} List ({displayedItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {displayedItems.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    No {getTabLabel(activeTab).toLowerCase()} found.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedItems.map(item => {
                    const ItemIcon = ICON_OPTIONS.find(i => i.value === item.icon)?.icon || FolderOpen;
                    
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-lg"
                        style={{ 
                          backgroundColor: editingId === item.id 
                            ? 'var(--color-accent-default)' 
                            : 'var(--color-bg-muted)',
                          border: editingId === item.id 
                            ? '2px solid var(--color-primary-default)' 
                            : '1px solid var(--color-border-default)'
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Show Icon ONLY for Filter Type */}
                          {activeTab === 'filter_type' && (
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-gray-200"
                            >
                              <ItemIcon className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                          
                          {/* Show Color swatch ONLY for Category */}
                          {activeTab === 'category' && (
                            <div
                              className="w-4 h-10 rounded-lg"
                              style={{ backgroundColor: item.color || '#2A2A2A' }}
                            />
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{item.name}</p>
                              <span 
                                className="text-xs text-muted-foreground bg-white px-2 py-0.5 rounded border"
                              >
                                /{item.slug}
                              </span>
                            </div>
                            {item.description && (
                              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(item)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger-default)' }} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
