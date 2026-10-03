import { useState } from 'react';
import { FileText, Download, Pencil, Plus, Eye, Tag, MoreHorizontal, EyeOff, Trash2, Star, FolderOpen } from 'lucide-react';
import { useNotifications } from '../../shared/state/NotificationContext';
import { apiClient } from '../../shared/api/api';
import type { ResourceData } from '../../shared/api/api-types';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { useAdminResource } from '../ui/hooks/useAdminResource';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { AdminEmptyState } from '../ui/kit/AdminEmptyState';
import { useConfirm } from '../ui/kit/ConfirmDialog';
import { ResourceEditPage, Resource } from './ResourceEditPage';
import { AdminDataTable, Column, FilterOption } from '../ui/kit/AdminDataTable';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { useMetadata } from '../ui/hooks/useMetadata';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type ViewMode = 'list' | 'edit' | 'create';

async function loadResources(): Promise<Resource[]> {
  let data = await apiClient.getResources();
  data = Array.isArray(data) ? data : data.resources || [];

  // Map API response to Component Resource type
  const mappedResources: Resource[] = data.map((item: any) => ({
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
  return mappedResources.reduce((acc: Resource[], current: Resource) =>
    acc.some(item => item.id === current.id) ? acc : acc.concat([current]), []);
}

export function AdminResourceManager() {
  const { showToast } = useNotifications();
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const { categories: kvCategories, filterTypes: kvFilterTypes } = useMetadata();

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>();

  const { data: resources, setData: setResources, loading, error, reload } = useAdminResource(loadResources, {
    initialData: [] as Resource[],
    enabled: viewMode === 'list',
    deps: [viewMode],
    errorTitle: 'API Error',
    errorMessage: 'Failed to load resources',
  });

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
      const patch: Partial<ResourceData> = { published };
      await apiClient.updateResource(id, patch as ResourceData);
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, published } : r)));
      showToast('success', 'Resource Updated', `Resource ${published ? 'published' : 'unpublished'}`);
    } catch (error: any) {
      console.error('Failed to update resource:', error);
      showToast('error', 'API Error', 'Failed to update resource');
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      const patch: Partial<ResourceData> = { featured };
      await apiClient.updateResource(id, patch as ResourceData);
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, featured } : r)));
      showToast('success', 'Resource Updated', `Resource ${featured ? 'marked as featured' : 'removed from featured'}`);
    } catch (error: any) {
      console.error('Failed to toggle featured:', error);
      showToast('error', 'API Error', 'Failed to update resource');
    }
  };

  const handleDelete = async (id: string, resourceTitle: string) => {
    const ok = await confirm({
      title: `Are you sure you want to delete resource "${resourceTitle}"?`,
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;

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
      className: 'min-w-[280px]',
      render: (resource) => (
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
              <ImageWithFallback 
                src={resource.thumbnail || ''} 
                alt={resource.title} 
                className="w-full h-full object-cover"
              />
           </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate" style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }} title={resource.title}>
                {resource.title}
              </span>
              {resource.featured && (
                <Star className="w-3.5 h-3.5 shrink-0" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
              )}
            </div>
            <span className="truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
              {resource.description?.substring(0, 60)}{(resource.description?.length || 0) > 60 ? '...' : ''}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Format',
      accessorKey: 'filter_type',
      sortable: true,
      className: 'w-[100px]',
      render: (resource: any) => (
        <AdminStatusBadge status="neutral" label={resource.filter_type || '-'} />
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      className: 'w-[120px]',
      render: (resource) => (
        <AdminStatusBadge status="neutral" label={resource.category || '-'} />
      )
    },
    {
      header: 'Status',
      accessorKey: 'published',
      sortable: true,
      className: 'w-[110px]',
      render: (resource) => (
        <AdminStatusBadge 
          status={resource.published ? 'published' : 'draft'} 
          label={resource.published ? 'Published' : 'Draft'} 
          dot
        />
      )
    },
    {
      header: 'Author',
      accessorKey: 'author',
      className: 'w-[100px]',
      render: (resource) => (
        <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-base)' }}>
          {typeof resource.author === 'string' ? resource.author : (resource.author as any)?.name || '-'}
        </span>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      className: 'w-[110px]',
      render: (resource) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
          {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Stats',
      className: 'w-[100px]',
      render: (resource) => (
        <div className="flex items-center gap-3" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {resource.viewCount || 0}</span>
          <span className="flex items-center gap-1">❤️ {resource.likes || 0}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'w-[60px] text-right',
      render: (resource) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
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
              <Pencil className="mr-2 h-4 w-4" /> Edit
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
            <DropdownMenuItem 
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                handleToggleFeatured(resource.id, !resource.featured); 
              }}
            >
              {resource.featured ? (
                <Star className="mr-2 h-4 w-4" />
              ) : (
                <Star className="mr-2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
              )}
              {resource.featured ? 'Remove from Featured' : 'Mark as Featured'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                handleDelete(resource.id, resource.title); 
              }}
              style={{ color: 'var(--color-status-danger)' }}
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
      options: kvCategories
    },
    {
      key: 'filter_type',
      label: 'Format',
      options: kvFilterTypes
    }
  ];

  const stats = [
    {
      label: 'Total Resources',
      value: resources.length,
      icon: <FileText className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Published',
      value: resources.filter((r) => r.published).length,
      icon: <Eye className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />
    },
    {
      label: 'Featured',
      value: resources.filter((r) => r.featured).length,
      icon: <Tag className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />
    },
    {
      label: 'Total Views',
      value: resources.reduce((acc, r) => acc + (r.viewCount || 0), 0),
      icon: <Eye className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    }
  ];

  // Show edit/create page
  if (viewMode === 'edit' || viewMode === 'create') {
    return (
      <ResourceEditPage resourceId={selectedResourceId} onBack={handleBackToList} onSave={handleBackToList} />
    );
  }

  const isEmpty = !loading && !error && resources.length === 0;

  return (
    <AdminPageLayout
      title="Resource Manager"
      description={loading ? 'Loading resources...' : 'Manage educational content, articles, and guides'}
      stats={isEmpty ? undefined : stats}
      actions={isEmpty || loading ? undefined : (
        <Button onClick={handleCreateNew} className="gap-2 bg-[var(--color-primary-default)] text-[var(--color-primary-on)]" aria-label="Create new resource">
          <Plus className="w-4 h-4" />
          {!isMobile && 'Add Resource'}
        </Button>
      )}
      loading={loading}
      error={error ? 'An error occurred while loading resources. Please try again.' : null}
      errorTitle="Failed to Load Resources"
      onRetry={reload}
      maxWidth="2xl"
    >
      {isEmpty ? (
        <AdminEmptyState
          icon={<FolderOpen className="w-8 h-8 text-[var(--color-text-muted)] opacity-50" />}
          title="No Resources Found"
          description="Get started by creating your first educational resource."
          actionLabel="Create First Resource"
          onAction={handleCreateNew}
        />
      ) : (
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
      )}
    </AdminPageLayout>
  );
}
