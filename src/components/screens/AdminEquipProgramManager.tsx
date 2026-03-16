import { useState, useEffect } from 'react';
import { BookOpen, Plus, MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminStatusBadge } from '../admin/AdminStatusBadge';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { EquipProgramWizard } from './EquipProgramWizard';
import { EquipProgram } from '../../lib/equip-admin-types';
import { AdminDataTable, Column, FilterOption } from '../admin/AdminDataTable';
import { Skeleton } from '../ui/skeleton-loader';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useMetadata } from '../../hooks/useMetadata';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AdminEquipProgramManagerProps {
  onBack?: () => void;
  className?: string;
}

type ViewMode = 'list' | 'edit' | 'create';

export function AdminEquipProgramManager({ onBack, className }: AdminEquipProgramManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  const [programs, setPrograms] = useState<EquipProgram[]>([]);
  const [loading, setLoading] = useState(true);

  // All metadata from KV
  const { categories: metaCategories, difficultyLevels: metaDifficulty } = useMetadata();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>();

  useEffect(() => {
    if (viewMode === 'list') {
      loadPrograms();
    }
  }, [viewMode]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEquipPrograms();
      const data = Array.isArray(response) ? response : response.programs || [];
      
      const mappedPrograms = data.map((item: any, index: number) => ({
        ...item,
        id: item.equip_id || item.id || `equip-program-${index}-${Date.now()}`,
        duration: item.duration_days || item.duration,
        category: item.category || '',
        published: item.published !== undefined ? item.published : true,
        enrollmentCount: item.enrollmentCount || item.enrollment_count || 0,
        thumbnail: item.hero_image || item.thumbnail || item.image_url || item.thumbnail_url || ''
      }));

      // Remove duplicates by ID
      const uniquePrograms = mappedPrograms.reduce((acc: EquipProgram[], curr: EquipProgram) => {
        if (!acc.find(p => p.id === curr.id)) acc.push(curr);
        return acc;
      }, []);

      setPrograms(uniquePrograms);
    } catch (error: any) {
      console.error('Failed to load programs:', error);
      showToast('error', 'API Error', 'Failed to load programs');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedProgramId(undefined);
    setViewMode('create');
  };

  const handleEdit = (id: string) => {
    setSelectedProgramId(id);
    setViewMode('edit');
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    try {
      await apiClient.updateEquipProgram(id, { published });
      setPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, published } : p)));
      showToast('success', 'Program Updated', `Program ${published ? 'published' : 'unpublished'}`);
    } catch (error: any) {
      console.error('Failed to update program:', error);
      showToast('error', 'API Error', 'Failed to update program');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) return;
    try {
      await apiClient.deleteEquipProgram(id);
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      showToast('success', 'Program Deleted', 'Program deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete program:', error);
      showToast('error', 'API Error', 'Failed to delete program');
    }
  };

  // -- Stats --
  const stats = [
    {
      label: 'Total Programs',
      value: programs.length,
      icon: <BookOpen className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Published',
      value: programs.filter((p) => p.published).length,
      icon: <Eye className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />
    },
    {
      label: 'Total Enrollments',
      value: programs.reduce((acc, p) => acc + (p.enrollmentCount || 0), 0),
      icon: <Users className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    }
  ];

  // -- Columns --
  const columns: Column<EquipProgram>[] = [
    {
      header: 'Program',
      accessorKey: 'title',
      sortable: true,
      className: 'min-w-[280px]',
      render: (program) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
            <ImageWithFallback 
              src={program.thumbnail} 
              alt={program.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate" style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }} title={program.title}>
              {program.title}
            </span>
            <span className="truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
              {program.description?.substring(0, 60)}{(program.description?.length || 0) > 60 ? '...' : ''}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      className: 'w-[120px]',
      render: (program) => (
        <AdminStatusBadge status="neutral" label={program.category || '-'} />
      )
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      sortable: true,
      className: 'w-[100px]',
      render: (program) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
          {program.duration || 0} days
        </span>
      )
    },
    {
      header: 'Enrolled',
      accessorKey: 'enrollmentCount',
      sortable: true,
      className: 'w-[100px]',
      render: (program) => (
        <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
          <Users className="w-3.5 h-3.5" />
          {program.enrollmentCount || 0}
        </div>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      className: 'w-[120px]',
      render: (program) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
          {program.created_at ? new Date(program.created_at).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'published',
      sortable: true,
      className: 'w-[110px]',
      render: (program) => (
        <AdminStatusBadge 
          status={program.published ? 'published' : 'draft'} 
          label={program.published ? 'Published' : 'Draft'}
          dot
        />
      )
    },
    {
      header: 'Actions',
      className: 'w-[60px] text-right',
      render: (program) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(program.id); }}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Program
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTogglePublish(program.id, !program.published); }}>
              {program.published ? (
                <><EyeOff className="mr-2 h-4 w-4" /> Unpublish</>
              ) : (
                <><Eye className="mr-2 h-4 w-4" /> Publish</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); handleDelete(program.id); }}
              style={{ color: 'var(--color-status-danger)' }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  // -- Filters --
  const filters: FilterOption[] = [
    ...(metaCategories.length > 0 ? [{
      key: 'category',
      label: 'Category',
      options: metaCategories.map(c => ({ label: c.label, value: c.value }))
    }] : [])
  ];

  // -- Views --

  if (viewMode === 'edit' || viewMode === 'create') {
    return (
      <EquipProgramWizard 
        programId={selectedProgramId} 
        onBack={() => setViewMode('list')} 
        onSave={() => {
          setViewMode('list');
          loadPrograms();
        }} 
      />
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-4">
          <Skeleton height="32px" width="350px" />
          <Skeleton height="20px" width="450px" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
                <Skeleton height="16px" width="120px" className="mb-2" />
                <Skeleton height="24px" width="50px" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <Skeleton height="40px" width="100%" className="mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-3"><Skeleton height="60px" width="100%" /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Equip Program Manager"
        description="Manage wellness and therapeutic programs"
        stats={stats}
        actions={
          <Button onClick={handleCreateNew} style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
            <Plus className="w-4 h-4 mr-2" />
            {!isMobile && 'Add Program'}
          </Button>
        }
      />

      <AdminDataTable 
        columns={columns} 
        data={programs} 
        searchKeys={['title', 'description', 'category']}
        filters={filters}
        searchPlaceholder="Search programs..."
        onRowClick={(item) => handleEdit(item.id)}
      />
    </div>
  );
}