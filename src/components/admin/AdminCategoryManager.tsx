import React, { useState, useEffect } from 'react';
import { AdminHeader } from './AdminHeader';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, X, Save, FolderOpen, Edit2, Trash2, FileText, Tag, Filter, Type, Sparkles, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { toast } from 'sonner';

export interface AdminCategoryManagerProps {
  onBack: () => void;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: 'category' | 'content_type' | 'filter_type';
  icon?: string;
  color?: string;
  description?: string;
}

const ICON_OPTIONS = [
  { value: 'file-text', label: 'File Text', icon: FileText },
  { value: 'tag', label: 'Tag', icon: Tag },
  { value: 'filter', label: 'Filter', icon: Filter },
  { value: 'type', label: 'Type', icon: Type },
  { value: 'folder', label: 'Folder', icon: FolderOpen },
];

// Color picker presets — hex values required here as they are stored as data in KV
// and rendered dynamically as backgroundColor. CSS variables cannot be used for stored data.
const COLOR_PRESETS = [
  { value: '#2A2A2A', label: 'Primary' },
  { value: '#E9EBEF', label: 'Accent' },
  { value: '#22C55E', label: 'Green' },
  { value: '#D4183D', label: 'Red' },
  { value: '#EAB308', label: 'Yellow' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#3B82F6', label: 'Blue' },
];

export function AdminCategoryManager({ onBack }: AdminCategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<'category' | 'content_type' | 'filter_type'>('category');
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<CategoryItem>>({
    name: '',
    slug: '',
    type: 'category',
    icon: 'folder',
    color: '#2A2A2A',
    description: ''
  });

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const allCategories = await apiClient.getCategories();
      const filtered = allCategories.filter((item: CategoryItem) => item.type === activeTab);
      setItems(filtered);
    } catch (error) {
      toast.error('Failed to load items');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestIntegrity = () => {
    let issues = 0;
    const report: string[] = [];
    const slugs = new Set<string>();

    items.forEach(item => {
        const missingFields = [];
        if (!item.name) missingFields.push('Name');
        if (!item.slug) missingFields.push('Slug');
        
        if (missingFields.length > 0) {
            issues++;
            report.push(`Item "${item.name || 'Untitled'}": Missing ${missingFields.join(', ')}`);
        }

        // Check for duplicates
        if (slugs.has(item.slug)) {
            issues++;
            report.push(`Item "${item.name}": Duplicate slug "${item.slug}"`);
        }
        slugs.add(item.slug);
    });

    if (issues === 0) {
        toast.success('Integrity Check Passed: No issues found.');
    } else {
        console.warn('Integrity Issues:', report);
        toast.warning(`Found ${issues} integrity issues. Check console.`);
    }
  };

  const handleAutoFill = () => {
    setFormData(prev => ({
        ...prev,
        name: prev.name || 'New Category',
        slug: prev.slug || 'new-category',
        description: prev.description || 'Auto-generated description for this item.',
        color: prev.color || '#2A2A2A',
        icon: prev.icon || 'folder'
    }));
    toast.success('Auto-Filled with suggestions');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: activeTab,
      icon: 'folder',
      color: '#2A2A2A',
      description: ''
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and Slug are required');
      return;
    }

    try {
      await apiClient.createCategory({
        ...formData,
        type: activeTab
      });
      toast.success('Created successfully');
      loadItems();
      resetForm();
    } catch (error) {
      toast.error('Failed to create item');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and Slug are required');
      return;
    }

    try {
      await apiClient.updateCategory(id, {
        ...formData,
        type: activeTab
      });
      toast.success('Updated successfully');
      loadItems();
      resetForm();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await apiClient.deleteCategory(id);
      toast.success('Deleted successfully');
      loadItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const startEdit = (item: CategoryItem) => {
    setFormData(item);
    setEditingId(item.id);
    setIsCreating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'category': return 'Category';
      case 'content_type': return 'Content Type';
      case 'filter_type': return 'Filter Type';
      default: return 'Item';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Metadata Manager"
        description="Manage categories, content types, and filters"
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Categories' }]}
        actions={
          <div className="flex gap-2">
            <Button 
                variant="outline"
                onClick={handleTestIntegrity}
                className="gap-2"
            >
                <ShieldCheck className="w-4 h-4" />
                Test Integrity
            </Button>
          </div>
        }
      />

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
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {getTabLabel(activeTab)}
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Create New' : 'Edit'} {getTabLabel(activeTab)}
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
                    className="bg-[var(--color-bg-input)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-friendly-slug"
                    className="bg-[var(--color-bg-input)]"
                  />
                </div>

                {/* Fields specific to Filter Type */}
                {activeTab === 'filter_type' && (
                  <div className="space-y-2">
                    <Label>Icon *</Label>
                    <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                      <SelectTrigger className="bg-[var(--color-bg-input)]">
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
                        <SelectTrigger className="bg-[var(--color-bg-input)]">
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
                        className="w-12 h-10 rounded cursor-pointer border border-[var(--color-border-default)]"
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
                    className="bg-[var(--color-bg-input)]"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleAutoFill} title="Auto-fill empty fields">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Fill
                </Button>
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
              <CardTitle>{getTabLabel(activeTab)} List ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)]" />
                  <p className="text-[var(--color-text-muted)]">
                    No {getTabLabel(activeTab).toLowerCase()} found.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => {
                    // Find icon in options or default to FolderOpen
                    const iconOption = ICON_OPTIONS.find(i => i.value === item.icon);
                    const ItemIcon = iconOption?.icon || FolderOpen;
                    const isEditing = editingId === item.id;
                    
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors border ${
                           isEditing 
                           ? 'bg-[var(--color-accent-default)] border-[var(--color-primary-default)] ring-1 ring-[var(--color-primary-default)]' 
                           : 'bg-[var(--color-bg-muted)] border-[var(--color-border-default)]'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Show Icon ONLY for Filter Type */}
                          {activeTab === 'filter_type' && (
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
                            >
                              <ItemIcon className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                          )}
                          
                          {/* Show Color swatch ONLY for Category */}
                          {activeTab === 'category' && (
                            <div
                              className="w-4 h-10 rounded-lg shadow-sm border border-black/5"
                              style={{ backgroundColor: item.color || '#2A2A2A' }}
                            />
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }}>{item.name}</p>
                              <span 
                                style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-card)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-default)', fontFamily: 'monospace' }}
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
                            <Trash2 className="w-4 h-4" style={{ color: 'var(--color-status-danger)' }} />
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