import React, { useState, useEffect } from 'react';
import { FileText, Download, Edit, Plus, MoreHorizontal, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminEmptyState } from '../admin/AdminEmptyState';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { PageEditPage, Page } from './PageEditPage';
import { AdminDataTable, Column } from '../admin/AdminDataTable';
import { SkeletonTable } from '../ui/skeleton-loader';
import { ErrorState } from '../ui/error-state';
import { EmptyState } from '../ui/empty-state';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AdminPageManagerProps {
  onBack?: () => void;
  className?: string;
}

type ViewMode = 'list' | 'edit' | 'create';

export function AdminPageManager({ onBack, className }: AdminPageManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>();

  useEffect(() => {
    if (viewMode === 'list') loadPages();
  }, [viewMode]);

  const loadPages = async () => {
    try {
      setLoading(true);
      console.log('📄 Loading pages from API...');
      const response = await apiClient.getPages();
      console.log('📄 API Response:', response);
      const data = Array.isArray(response) ? response : response.pages || [];
      console.log('📄 Raw data count:', data.length);
      // Filter out null/invalid entries and ensure all required properties exist
      const validPages = data.filter(p => p && p.id && p.name && p.title && p.slug);
      console.log('📄 Valid pages count:', validPages.length);
      setPages(validPages);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load pages:', error);
      showToast('error', 'API Error', 'Failed to load pages');
      setPages([]);
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Pages', value: pages.length, icon: <FileText className="w-4 h-4" /> },
    { label: 'Published', value: pages.filter((p) => p?.published).length, icon: <FileText className="w-4 h-4" /> }
  ];

  const handleCreateNew = () => {
    setSelectedPageId(undefined);
    setViewMode('create');
  };

  const handleEdit = (id: string) => {
    setSelectedPageId(id);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPageId(undefined);
  };

  const handlePreview = (slug: string) => {
    window.open(`/${slug}`, '_blank');
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    try {
      await apiClient.updatePage(id, { published });
      setPages((prev) => prev.map((p) => (p.id === id ? { ...p, published } : p)));
      showToast('success', 'Page Updated', `Page ${published ? 'published' : 'unpublished'}`);
      loadPages(); // Reload to get fresh data
    } catch (error: any) {
      console.error('Failed to update page:', error);
      showToast('error', 'API Error', 'Failed to update page');
    }
  };

  const handleDelete = async (id: string, pageName: string) => {
    if (!confirm(`Are you sure you want to delete page "${pageName}"? This action cannot be undone.`)) return;
    
    try {
      await apiClient.deletePage(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
      showToast('success', 'Page Deleted', 'Page has been permanently deleted');
    } catch (error: any) {
      console.error('Failed to delete page:', error);
      showToast('error', 'API Error', 'Failed to delete page');
    }
  };

  // -- Data Table Configuration --
  const columns: Column<Page>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      render: (page) => (
        <div className="flex flex-col">
          <span className="font-medium">{page.name}</span>
          <span className="text-xs text-muted-foreground">/{page.slug}</span>
        </div>
      )
    },
    {
      header: 'Title',
      accessorKey: 'title',
      sortable: true,
      className: 'hidden md:table-cell' // Hide title on mobile if needed
    },
    {
      header: 'Status',
      accessorKey: 'published',
      sortable: true,
      render: (page) => (
        <Badge 
          variant="outline" 
          className={page.published ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
        >
          {page.published ? 'Published' : 'Draft'}
        </Badge>
      )
    },
    {
      header: 'Last Updated',
      accessorKey: 'lastUpdated',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (page) => (
        <span className="text-sm text-muted-foreground">
          {page.lastUpdated ? new Date(page.lastUpdated).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (page) => (
        <span className="text-sm text-muted-foreground">
          {page.created_at ? new Date(page.created_at).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (page) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(page.id); }}>
              <Edit className="mr-2 h-4 w-4" /> Edit Page
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTogglePublish(page.id, !page.published); }}>
              {page.published ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />} {page.published ? 'Unpublish' : 'Publish'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePreview(page.slug); }}>
              <ExternalLink className="mr-2 h-4 w-4" /> Preview
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); handleDelete(page.id, page.name); }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  if (viewMode === 'edit' || viewMode === 'create') {
    return <PageEditPage pageId={selectedPageId} onBack={handleBackToList} onSave={handleBackToList} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Page Manager (CMS)"
          description="Loading pages..."
          onBack={onBack}
          breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Pages' }]}
        />
        <SkeletonTable rows={8} columns={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Page Manager (CMS)"
          description="Manage website content pages"
          onBack={onBack}
          breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Pages' }]}
        />
        <ErrorState
          variant="error"
          title="Failed to Load Pages"
          message="There was an error loading the pages. Please try again."
          onRetry={loadPages}
          onGoBack={onBack}
        />
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Page Manager (CMS)"
          description="Manage website content pages"
          onBack={onBack}
          breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Pages' }]}
        />
        <EmptyState
          variant="folder"
          title="No Pages Found"
          description="Get started by creating your first content page."
          actionLabel="Create First Page"
          onAction={handleCreateNew}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Page Manager (CMS)"
        description="Manage website content pages"
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Pages' }]}
        stats={stats}
        actions={
          <>
            <Button variant="outline" onClick={() => {}}><Download className="w-4 h-4" />{!isMobile && 'Export'}</Button>
            <Button onClick={handleCreateNew} style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}><Plus className="w-4 h-4" />{!isMobile && 'Add Page'}</Button>
          </>
        }
      />

      <AdminDataTable
        columns={columns}
        data={pages}
        searchKeys={['name', 'title', 'slug']}
        searchPlaceholder="Search pages..."
        onRowClick={(item) => handleEdit(item.id)}
      />
    </div>
  );
}