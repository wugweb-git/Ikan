import { useState, useEffect } from 'react';
import { FileText, Download, Edit, Plus, MoreHorizontal, Eye, EyeOff, Trash2, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../admin/AdminStatusBadge';
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

import { DEFAULT_CMS_CONTENT } from '../../utils/cms-defaults';

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
  const [syncing, setSyncing] = useState(false);

  const systemPages = [
    { title: 'Privacy Policy', slug: 'privacy', name: 'Privacy Policy' },
    { title: 'Terms of Service', slug: 'terms', name: 'Terms of Service' },
    { title: 'Frequently Asked Questions', slug: 'faq', name: 'FAQ' },
    { title: 'Contact Us', slug: 'contact', name: 'Let\'s Talk' },
    { title: 'Return Policy', slug: 'return-policy', name: 'Return Policy' },
    { title: 'Cancellation Policy', slug: 'cancellation-policy', name: 'Cancellation Policy' },
    { title: 'Sitemap', slug: 'sitemap', name: 'Sitemap' }
  ];

  useEffect(() => {
    if (viewMode === 'list') loadPages();
  }, [viewMode]);

  const handleTestIntegrity = () => {
    let issues = 0;
    const report: string[] = [];

    pages.forEach(p => {
        const missingFields = [];
        if (!p.title) missingFields.push('Title');
        if (!p.slug) missingFields.push('Slug');
        if (!p.content || p.content.length < 10) missingFields.push('Content');
        
        if (missingFields.length > 0) {
            issues++;
            report.push(`Page "${p.title || p.name || 'Untitled'}": Missing ${missingFields.join(', ')}`);
        }
    });

    if (issues === 0) {
        showToast('success', 'Integrity Check Passed', 'All pages appear to be valid.');
    } else {
        console.warn('Integrity Issues:', report);
        showToast('warning', 'Integrity Issues Found', `Found ${issues} pages with potential issues. Check console.`);
    }
  };

  const handleSyncSystemPages = async () => {
    try {
      setSyncing(true);
      const existingSlugs = pages.map(p => p.slug);
      const missingPages = systemPages.filter(p => !existingSlugs.includes(p.slug));

      if (missingPages.length === 0) {
        showToast('info', 'System Pages', 'All system pages already exist.');
        setSyncing(false);
        return;
      }

      let createdCount = 0;
      for (const page of missingPages) {
        try {
          const defaultData = DEFAULT_CMS_CONTENT[page.slug];
          const content = defaultData ? defaultData.content : `<h1>${page.title}</h1><p>Content for ${page.title} goes here.</p>`;
          
          await apiClient.createPage({
            title: page.title,
            name: page.name,
            slug: page.slug,
            content: content,
            published: true
          });
          createdCount++;
        } catch (err) {
          console.error(`Failed to create page ${page.slug}`, err);
        }
      }

      if (createdCount > 0) {
        showToast('success', 'Sync Complete', `Created ${createdCount} system pages.`);
        loadPages();
      } else {
        showToast('error', 'Sync Failed', 'Could not create missing pages.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      showToast('error', 'Sync Error', 'An error occurred while syncing pages.');
    } finally {
      setSyncing(false);
    }
  };

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
          <span style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }}>{page.name}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>/{page.slug}</span>
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
        <AdminStatusBadge 
          status={page.published ? 'published' : 'draft'} 
          label={page.published ? 'Published' : 'Draft'} 
        />
      )
    },
    {
      header: 'Last Updated',
      accessorKey: 'lastUpdated',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (page) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
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
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
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
              style={{ color: 'var(--color-status-danger)' }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const headerActions = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleTestIntegrity} title="Check integrity">
        <ShieldCheck className="w-4 h-4 mr-2" />
        {!isMobile && 'Test Integrity'}
      </Button>
      <Button 
        variant="outline" 
        onClick={handleSyncSystemPages} 
        disabled={syncing}
        title="Create missing system pages (FAQ, Privacy, etc.)"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
        {!isMobile && 'Sync System Pages'}
      </Button>
      <Button variant="outline" onClick={() => {}}><Download className="w-4 h-4" />{!isMobile && 'Export'}</Button>
      <Button onClick={handleCreateNew} className="gap-2 bg-[var(--color-primary-default)] text-[var(--color-primary-on)] hover:opacity-90"><Plus className="w-4 h-4" />{!isMobile && 'Add Page'}</Button>
    </div>
  );

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
          actions={headerActions}
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
          actions={headerActions}
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
          actions={headerActions}
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
        actions={headerActions}
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