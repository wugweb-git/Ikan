import React, { useState, useEffect } from 'react';
import { AdminHeader } from './AdminHeader';

// ... other imports

// ... CategoryItem and AdminCategoryManagerProps definitions

const ICON_OPTIONS = [
  // ... options
];

const COLOR_PRESETS = [
  // ... presets
];

const DEFAULT_SEEDS = {
  // ... seeds
};

export function AdminCategoryManager({ onBack }: AdminCategoryManagerProps) {
  // ... state variables

  // ... useEffects

  // ... loadItems, handleSeedDefaults, handleCreate, handleUpdate, handleDelete, startEdit, resetForm

  // ... displayedItems, getTabLabel

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Metadata Manager"
        description="Manage categories, content types, and filters"
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Categories' }]}
        actions={
          <Button 
            variant="outline"
            onClick={handleSeedDefaults}
            style={{ gap: 'var(--spacing-2)' }}
            disabled={isLoading}
          >
            <Database className="w-4 h-4" />
            Seed Defaults
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        {/* ... existing TabsList and content ... */}
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
