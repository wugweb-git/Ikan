import React, { useState, useEffect } from 'react';
import { FileText, Download, Edit, Plus, Eye, Tag, MoreHorizontal, EyeOff, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminEmptyState } from '../admin/AdminEmptyState';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { ResourceEditPage, Resource } from './ResourceEditPage';
import { AdminDataTable, Column, FilterOption } from '../admin/AdminDataTable';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ErrorState } from '../ui/error-state';
import { EmptyState } from '../ui/empty-state';
import { SkeletonTable } from '../ui/skeleton-loader';
import { RESOURCE_CATEGORIES, RESOURCE_TYPES } from '../../lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AdminResourceManagerProps {
  onBack?: () => void;
  className?: string;
}

type ViewMode = 'list' | 'edit' | 'create';

export function AdminResourceManager({ onBack, className }: AdminResourceManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<{label: string, value: string}[]>([]);
  const [filterTypes, setFilterTypes] = useState<{label: string, value: string}[]>(RESOURCE_TYPES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>();

  useEffect(() => {
    if (viewMode === 'list') {
      loadData();
    }
  }, [viewMode]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadResources(), loadCategories()]);
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      const loadedCategories = Array.isArray(data) ? data : data.categories || [];
      
      if (loadedCategories.length > 0) {
        setCategories(loadedCategories.map((c: any) => ({
          label: c.name || c.label,
          value: c.slug || c.value || c.name.toLowerCase()
        })));
      } else {
        // Fallback defaults
        setCategories(RESOURCE_CATEGORIES);
      }
    } catch (error) {
      console.warn('Failed to load categories, using defaults', error);
      setCategories(RESOURCE_CATEGORIES);
    }
  };

  const loadResources = async () => {
    try {
      let data = await apiClient.getResources();
      data = Array.isArray(data) ? data : data.resources || [];
      
      // Map API response to Component Resource type
      const mappedResources = data.map((item: any) => ({
        ...item,
        id: item.resource_id || item.id,
        readTime: item.read_time_minutes || item.readTime,
        // Ensure required fields exist
        author: item.author || 'Unknown',
        published: item.published !== undefined ? item.published : true, 
        viewCount: item.viewCount || 0,
        likes: item.likes || 0,
        tags: item.tags || []
      }));

      // Ensure unique keys by filtering duplicates
      const uniqueResources = mappedResources.reduce((acc: Resource[], current: Resource) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      
      setResources(uniqueResources);
      // Loading state handled in loadData
    } catch (error: any) {
      console.error('Failed to load resources:', error);
      showToast('error', 'API Error', 'Failed to load resources');
      setResources([]);
      // Loading state handled in loadData
    }
  };

  const handleExport = () => {
    // Export all resources currently loaded
    const csv = [
      ['Title', 'Category', 'Author', 'Read Time', 'Published', 'Views', 'Likes'].join(','),
      ...resources.map((r) => [
        `"${r.title.replace(/"/g, '""')}"`,
        r.category,
        typeof r.author === 'string' ? r.author : (r.author as any)?.name || '',
        `${r.readTime} min`,
        r.published ? 'Yes' : 'No',
        r.viewCount || 0,
        r.likes || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resources-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('success', 'Export Complete', 'Resources exported to CSV');
  };

  const handleTestIntegrity = () => {
    let issues = 0;
    const report: string[] = [];

    resources.forEach(r => {
        const missingFields = [];
        if (!r.title) missingFields.push('Title');
        if (!r.category) missingFields.push('Category');
        if (!r.description) missingFields.push('Description');
        
        if (missingFields.length > 0) {
            issues++;
            report.push(`Resource "${r.title || 'Untitled'}": Missing ${missingFields.join(', ')}`);
        }
    });

    if (issues === 0) {
        showToast('success', 'Integrity Check Passed', 'All resources appear to be valid.');
    } else {
        console.warn('Integrity Issues:', report);
        showToast('warning', 'Integrity Issues Found', `Found ${issues} resources with missing data. Check console for details.`);
    }
  };

  const handleCreateNew = () => {
    setSelectedResourceId(undefined);
    setViewMode('create');
  };

  const handleEdit = (id: string) => {
    setSelectedResourceId(id);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedResourceId(undefined);
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    try {
      await apiClient.updateResource(id, { published });
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, published } : r)));
      showToast('success', 'Resource Updated', `Resource ${published ? 'published' : 'unpublished'}`);
      loadResources(); // Reload to get fresh data
    } catch (error: any) {
      console.error('Failed to update resource:', error);
      showToast('error', 'API Error', 'Failed to update resource');
    }
  };

  const handleDelete = async (id: string, resourceTitle: string) => {
    if (!confirm(`Are you sure you want to delete resource "${resourceTitle}"? This action cannot be undone.`)) return;
    
    try {
      await apiClient.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast('success', 'Resource Deleted', 'Resource has been permanently deleted');
    } catch (error: any) {
      console.error('Failed to delete resource:', error);
      showToast('error', 'API Error', 'Failed to delete resource');
    }
  };

  // -- Data Table Configuration --

  const columns: Column<Resource>[] = [
    {
      header: 'Title',
      accessorKey: 'title',
      sortable: true,
      className: 'min-w-[300px]',
      render: (resource) => (
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0 border border-gray-200">
              <ImageWithFallback 
                src={resource.thumbnail || ''} 
                alt={resource.title} 
                className="w-full h-full object-cover"
                fallbackText="📄"
              />
           </div>
          <div className="flex flex-col">
            <span className="font-medium truncate max-w-[250px]" title={resource.title}>
              {resource.title}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[250px]">
              {resource.description}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Format',
      accessorKey: 'filter_type',
      sortable: true,
      render: (resource: any) => (
        <Badge variant="secondary" className="capitalize">
          {resource.filter_type || 'Article'}
        </Badge>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      render: (resource) => (
        <Badge variant="outline" className="capitalize">
          {resource.category}
        </Badge>
      )
    },
    {
      header: 'Status',
      accessorKey: 'published',
      sortable: true,
      render: (resource) => (
        <Badge 
          className={resource.published ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
          variant="outline"
        >
          {resource.published ? 'Published' : 'Draft'}
        </Badge>
      )
    },
    {
      header: 'Author',
      accessorKey: 'author',
      render: (resource) => (
        <span className="text-sm">
          {typeof resource.author === 'string' ? resource.author : (resource.author as any)?.name || '-'}
        </span>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      render: (resource) => (
        <span className="text-sm text-muted-foreground">
          {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Stats',
      render: (resource) => (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {resource.viewCount || 0}</span>
          <span className="flex items-center gap-1">❤️ {resource.likes || 0}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (resource) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                handleEdit(resource.id); 
              }}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                handleTogglePublish(resource.id, !resource.published); 
              }}
            >
              {resource.published ? (
                <EyeOff className="mr-2 h-4 w-4" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {resource.published ? 'Unpublish' : 'Publish'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                handleDelete(resource.id, resource.title); 
              }}
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const filters: FilterOption[] = [
    {
      key: 'category',
      label: 'Category',
      options: categories.length > 0 ? categories : RESOURCE_CATEGORIES
    },
    {
      key: 'filter_type',
      label: 'Format',
      options: filterTypes
    }
  ];

  const stats = [
    {
      label: 'Total Resources',
      value: resources.length,
      icon: <FileText className="w-4 h-4 text-primary" />
    },
    {
      label: 'Published',
      value: resources.filter((r) => r.published).length,
      icon: <Eye className="w-4 h-4 text-green-500" />
    },
    {
      label: 'Featured',
      value: resources.filter((r) => r.featured).length,
      icon: <Tag className="w-4 h-4 text-orange-500" />
    },
    {
      label: 'Total Views',
      value: resources.reduce((acc, r) => acc + (r.viewCount || 0), 0),
      icon: <Eye className="w-4 h-4 text-blue-500" />
    }
  ];

  // Show edit/create page
  if (viewMode === 'edit' || viewMode === 'create') {
    return (
      <ResourceEditPage resourceId={selectedResourceId} onBack={handleBackToList} onSave={handleBackToList} />
    );
  }

  // Show list view
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Resource Manager"
          description="Loading resources..."
          onBack={onBack}
          breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Resource Manager' }]}
        />
        <SkeletonTable rows={8} columns={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Resource Manager"
          description="Manage educational content, articles, and guides"
          onBack={onBack}
          breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Resource Manager' }]}
        />
        <ErrorState
          variant="error"
          title="Failed to Load Resources"
          message="An error occurred while loading resources. Please try again."
          onRetry={loadResources}
          onGoBack={onBack}
        />
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Resource Manager"
          description="Manage educational content, articles, and guides"
          onBack={onBack}
          breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Resource Manager' }]}
        />
        <EmptyState
          variant="folder"
          title="No Resources Found"
          description="Get started by creating your first educational resource."
          actionLabel="Create First Resource"
          onAction={handleCreateNew}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Resource Manager"
        description="Manage educational content, articles, and guides"
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Resource Manager' }]}
        stats={stats}
        actions={
          <div className="flex gap-2">
             <Button variant="outline" onClick={handleTestIntegrity} title="Check data integrity">
                <ShieldCheck className="w-4 h-4 mr-2" />
                {!isMobile && 'Test Integrity'}
             </Button>
             <Button onClick={handleCreateNew} className="gap-2" aria-label="Create new resource">
                <Plus className="w-4 h-4" />
                {!isMobile && 'Add Resource'}
             </Button>
          </div>
        }
      />

      <AdminDataTable 
        columns={columns} 
        data={resources} 
        searchKeys={['title', 'description', 'category', 'tags']}
        filters={filters}
        searchPlaceholder="Search resources by title, category, tags..."
        onRowClick={(item) => handleEdit(item.id)}
        actions={
          <Button variant="outline" onClick={handleExport} className="gap-2" aria-label="Export resources to CSV">
            <Download className="w-4 h-4" />
            {!isMobile && 'Export CSV'}
          </Button>
        }
      />
    </div>
  );
}