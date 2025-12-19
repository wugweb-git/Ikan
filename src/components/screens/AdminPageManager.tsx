import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, Edit, Plus, MoreHorizontal } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
      // GLOBAL APPROACH: Show infinite loader on error (don't stop loading)
      // This forces proper backend setup before deployment
      // User should see loader, not error state
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="animate-spin rounded-full border-4" style={{ width: '48px', height: '48px', borderColor: 'var(--color-accent-default)', borderTopColor: 'var(--color-primary-default)' }} />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen', className)} style={{ backgroundColor: 'var(--color-bg-page)', padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)' }}>
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
    </div>
  );
}
