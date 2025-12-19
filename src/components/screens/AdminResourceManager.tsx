import React, { useState, useEffect } from 'react';
import { FileText, Download, Edit, Plus, Eye, Tag, MoreHorizontal } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>();

  useEffect(() => {
    if (viewMode === 'list') {
      loadResources();
    }
  }, [viewMode]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getResources();
      const data = Array.isArray(response) ? response : response.resources || [];
      
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
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load resources:', error);
      // Don't set loading to false to show infinite loader as per global policy for backend errors
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

  // -- Data Table Configuration --

  const columns: Column<Resource>[] = [
    {
      header: 'Title',
      accessorKey: 'title',
      sortable: true,
      className: 'min-w-[300px]',
      render: (resource) => (
        <div className="flex items-center gap-3">
           {resource.thumbnail ? (
            <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
              <img src={resource.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
          )}
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
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(resource.id); }}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            {/* Add more actions here if needed like Delete */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const filters: FilterOption[] = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Video', value: 'video' },
        { label: 'Podcast', value: 'podcast' },
        { label: 'Workbook', value: 'workbook' },
        { label: 'Guide', value: 'guide' },
      ]
    },
    // We can add a 'published' filter if we map boolean to string in the data or handle it in the table
    // For simplicity, let's just stick to category for now as it matches the mockup
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 mx-auto mb-4 w-12 h-12 border-muted border-t-primary" />
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-background', className)} style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Resource Manager"
          description="Manage educational content, articles, and guides"
          onBack={onBack}
          breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Resource Manager' }]}
          stats={stats}
          actions={
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              {!isMobile && 'Add Resource'}
            </Button>
          }
        />

        <AdminDataTable 
          columns={columns} 
          data={resources} 
          searchKeys={['title', 'description', 'category']}
          filters={filters}
          searchPlaceholder="Search resources by title, category..."
          onRowClick={(item) => handleEdit(item.id)}
          actions={
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              {!isMobile && 'Export CSV'}
            </Button>
          }
        />
      </div>
    </div>
  );
}