import { useState, useEffect } from 'react';
import { FileText, Pencil, Plus, MoreHorizontal, Eye, EyeOff, Trash2, ExternalLink, RefreshCw, Image } from 'lucide-react';
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
import { DEFAULT_CMS_CONTENT } from '../../utils/cms-defaults';
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
  const [syncing, setSyncing] = useState(false);

  // Default hero image used across all system pages (same as PageHero fallback)
  const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1650046825506-8901c4b837b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBhc3Nlc3NtZW50JTIwcXVlc3Rpb25uYWlyZSUyMHRoZXJhcHl8ZW58MXx8fHwxNzczMzIxNTcyfDA&ixlib=rb-4.1.0&q=80&w=1080';

  const systemPages = [
    { title: 'About iKan', slug: 'about', name: 'About Us',
      heroTitle: 'To us, mental health matters.', heroSubtitle: 'At iKan, we believe mental health is for everyone.' },
    { title: 'Privacy Policy', slug: 'privacy', name: 'Privacy Policy',
      heroTitle: 'Privacy Policy', heroSubtitle: 'Your privacy and data security are fundamental to our mission.' },
    { title: 'Terms of Service', slug: 'terms', name: 'Terms of Service',
      heroTitle: 'Terms of Service', heroSubtitle: "Important legal terms governing your use of iKan's mental health platform and services." },
    { title: 'Frequently Asked Questions', slug: 'faq', name: 'FAQ',
      heroTitle: 'FAQs & Help Center', heroSubtitle: 'Find answers to common questions about iKan, your account, programs, and more.' },
    { title: "We're Here to Help", slug: 'contact', name: "Contact Us",
      heroTitle: "We're Here to Help", heroSubtitle: 'Your mental health journey matters to us. Reach out for support, questions, or just to connect.' },
    { title: 'Return & Refund Policy', slug: 'return-policy', name: 'Return Policy',
      heroTitle: 'Return & Refund Policy', heroSubtitle: 'Understanding our refund and return policy for iKan services.' },
    { title: 'Cancellation Policy', slug: 'cancellation-policy', name: 'Cancellation Policy',
      heroTitle: 'Cancellation Policy', heroSubtitle: 'We understand plans change. Cancel anytime with no penalties or hidden fees.' },
    { title: 'Site Navigation', slug: 'sitemap', name: 'Sitemap',
      heroTitle: 'Site Navigation', heroSubtitle: 'Explore all pages and resources available on the iKan mental health platform.' },
    { title: "Let's Talk", slug: 'lets-talk', name: "Let's Talk",
      heroTitle: "Let's Talk", heroSubtitle: 'Taking the first step is often the hardest part. We\'re here to listen.' },
    { title: 'Page Not Found', slug: 'not-found', name: '404 Error Page',
      heroTitle: 'Page Not Found', heroSubtitle: "We couldn't find the page you're looking for." }
  ];

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
      const validPages = data.filter(p => p && p.id && p.slug).map(p => ({
        ...p,
        name: p.name || p.title || p.slug,
        title: p.title || p.name || p.slug,
        lastUpdated: p.lastUpdated || p.updated_at || '',
      }));
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

  // -- Sync System Pages: imports all legal/system pages from cms-defaults into KV --
  const handleSyncSystemPages = async () => {
    setSyncing(true);
    let created = 0;
    let skipped = 0;
    let updated = 0;
    const existingSlugs = new Set(pages.map(p => p.slug));

    for (const sp of systemPages) {
      const defaults = DEFAULT_CMS_CONTENT[sp.slug];
      const content = defaults?.content || '';
      const title = defaults?.title || sp.title;

      if (existingSlugs.has(sp.slug)) {
        // Page already exists — check if hero data needs updating
        const existingPage = pages.find(p => p.slug === sp.slug);
        if (existingPage && (!existingPage.heroEnabled || !existingPage.heroImage)) {
          try {
            await apiClient.updatePage(existingPage.id, {
              heroEnabled: true,
              heroImage: existingPage.heroImage || DEFAULT_HERO_IMAGE,
              heroTitle: existingPage.heroTitle || sp.heroTitle || title,
              heroSubtitle: existingPage.heroSubtitle || sp.heroSubtitle || '',
              heroOverlayOpacity: existingPage.heroOverlayOpacity ?? 40,
            });
            updated++;
          } catch (error: any) {
            console.error(`Failed to update hero for "${sp.slug}":`, error);
          }
        } else {
          skipped++;
        }
        continue;
      }

      try {
        await apiClient.createPage({
          slug: sp.slug,
          name: sp.name,
          title,
          content,
          published: true,
          // Hero banner fields — all system pages have hero enabled with the default image
          heroEnabled: true,
          heroImage: DEFAULT_HERO_IMAGE,
          heroTitle: sp.heroTitle || title,
          heroSubtitle: sp.heroSubtitle || '',
          heroOverlayOpacity: 40,
        });
        created++;
      } catch (error: any) {
        // 409 = already exists, treat as skip
        if (error?.message?.includes('already exists') || error?.message?.includes('409') || error?.status === 409) {
          skipped++;
        } else {
          console.error(`Failed to create system page "${sp.slug}":`, error);
          showToast('error', 'Sync Error', `Failed to create "${sp.name}": ${error.message || 'Unknown error'}`);
        }
      }
    }

    setSyncing(false);

    const parts: string[] = [];
    if (created > 0) parts.push(`${created} created`);
    if (updated > 0) parts.push(`${updated} updated with hero data`);
    if (skipped > 0) parts.push(`${skipped} unchanged`);

    if (created > 0 || updated > 0) {
      showToast('success', 'Sync Complete', parts.join(', '));
      await loadPages();
    } else if (skipped > 0) {
      showToast('info', 'Already Synced', `All ${skipped} system pages are up to date`);
      await loadPages();
    } else {
      showToast('info', 'Nothing to Sync', 'No system pages to create');
    }
  };

  // -- Data Table Configuration --
  const columns: Column<Page>[] = [
    {
      header: 'Thumbnail',
      accessorKey: 'heroImage',
      className: 'hidden md:table-cell w-16',
      render: (page) => {
        const imgSrc = page.heroImage || page.featuredImage || '';
        return imgSrc ? (
          <div
            className="w-10 h-10 rounded overflow-hidden flex-shrink-0"
            style={{ border: '1px solid var(--color-border-default)' }}
          >
            <img
              src={imgSrc}
              alt={page.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
          >
            <Image className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        );
      }
    },
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      render: (page) => (
        <div className="flex flex-col min-w-0">
          <span className="truncate" style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }}>{page.name}</span>
          <span className="truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>/{page.slug}</span>
        </div>
      )
    },
    {
      header: 'Title',
      accessorKey: 'title',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (page) => (
        <span className="truncate block max-w-[200px]" title={page.title}>{page.title}</span>
      )
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
      className: 'text-right w-16',
      render: (page) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={5}>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(page.id); }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Page
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
        </div>
      )
    }
  ];

  const headerActions = (
    <div className="flex gap-2">
      <Button 
        onClick={handleSyncSystemPages} 
        variant="outline"
        className="gap-2" 
        disabled={syncing}
        style={{
          height: 'var(--ikan-component-button-height)',
          borderRadius: 'var(--ikan-component-border-radius)',
          fontWeight: 'var(--font-weight-medium)',
        }}
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        {!isMobile && (syncing ? 'Syncing...' : 'Sync System Pages')}
      </Button>
      <Button 
        onClick={handleCreateNew} 
        className="gap-2"
        style={{
          height: 'var(--ikan-component-button-height)',
          borderRadius: 'var(--ikan-component-border-radius)',
          fontWeight: 'var(--font-weight-medium)',
          backgroundColor: 'var(--color-primary-default)',
          color: 'var(--color-primary-on)',
        }}
      >
        <Plus className="w-4 h-4" />
        {!isMobile && 'Add Page'}
      </Button>
    </div>
  );

  // The "Hero Banners" tab this file used to switch to is gone — the feature
  // is deleted (2026-09-10). Page Manager only ever had the one other tab, so
  // nothing replaces the switcher; it is itself slated for full removal once
  // its own work order lands.

  if (viewMode === 'edit' || viewMode === 'create') {
    return <PageEditPage pageId={selectedPageId} onBack={handleBackToList} onSave={handleBackToList} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Page Manager (CMS)"
          description="Loading pages..."
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