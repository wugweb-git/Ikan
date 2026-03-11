import { useState, useEffect } from 'react';
import { BookOpen, Download, Plus, MoreHorizontal, Eye, EyeOff, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { cmsUtils } from '../admin/cms-utils';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminEmptyState } from '../admin/AdminEmptyState';
import { AdminStatusBadge } from '../admin/AdminStatusBadge';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { EquipProgramWizard } from './EquipProgramWizard';
import { EquipProgram } from '../../lib/equip-admin-types';
import { AdminDataTable, Column } from '../admin/AdminDataTable';
import { Skeleton } from '../ui/skeleton-loader';
import { ImageWithFallback } from '../figma/ImageWithFallback';
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
      
      // Map API response to Component EquipProgram type
      const mappedPrograms = data.map((item: any, index: number) => ({
        ...item,
        id: item.equip_id || item.id || `equip-program-${index}-${Date.now()}`,
        duration: item.duration_days || item.duration,
        // Ensure other fields
        category: item.category || 'General',
        published: item.published !== undefined ? item.published : true,
        enrollmentCount: item.enrollmentCount || 0,
        thumbnail: item.hero_image || item.thumbnail || item.image_url || item.thumbnail_url || ''
      }));

      // Remove duplicates by ID - keep the first occurrence
      const uniquePrograms = mappedPrograms.reduce((acc: EquipProgram[], curr: EquipProgram) => {
        if (!acc.find(p => p.id === curr.id)) {
          acc.push(curr);
        }
        return acc;
      }, []);

      setPrograms(uniquePrograms);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load programs:', error);
      showToast('error', 'API Error', 'Failed to load programs');
      setPrograms([]);
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
        const { logs, results } = await cmsUtils.verifyAssessments();
        logs.forEach(log => console.log(log));
        
        const issues = results.filter(r => r.status !== 'Perfect');
        if (issues.length > 0) {
             showToast('warning', 'Integrity Issues', `Found ${issues.length} issues. Check console.`);
             console.table(results);
        } else {
             showToast('success', 'Integrity Verified', 'All assessments match source.');
        }
        setLoading(false);
    } catch (e: any) {
        showToast('error', 'Error', e.message);
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
      loadPrograms(); // Reload to get fresh data
    } catch (error: any) {
      console.error('Failed to update program:', error);
      showToast('error', 'API Error', 'Failed to update program');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    
    try {
      await apiClient.deleteEquipProgram(id);
      showToast('success', 'Program Deleted', 'Program deleted successfully');
      loadPrograms(); // ✅ FIX: Reload from backend to confirm deletion
    } catch (error: any) {
      console.error('Failed to delete program:', error);
      showToast('error', 'API Error', 'Failed to delete program');
    }
  };

  // -- Data Table Configuration --

  const columns: Column<EquipProgram>[] = [
    {
      header: 'Program',
      accessorKey: 'title',
      sortable: true,
      className: 'min-w-[300px]',
      render: (program) => (
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
             <ImageWithFallback 
               src={program.thumbnail} 
               alt={program.title}
               className="w-full h-full object-cover"
             />
          </div>
          <div className="flex-1">
            <span className="truncate max-w-[300px]" style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }} title={program.title}>
              {program.title}
            </span>
            <span className="truncate max-w-[300px] block" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }} title={program.description}>
              {program.description}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      render: (program) => (
        <AdminStatusBadge status="neutral" label={program.category} />
      )
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      sortable: true,
      render: (program) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {program.duration} days
        </span>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      render: (program) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {program.created_at ? new Date(program.created_at).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'published',
      sortable: true,
      render: (program) => (
        <AdminStatusBadge status={program.published ? 'published' : 'draft'} />
      )
    },
    {
      header: 'Enrollments',
      accessorKey: 'enrollmentCount',
      sortable: true,
      render: (program) => (
        <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          <BookOpen className="w-3 h-3" />
          {program.enrollmentCount || 0}
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (program) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(program.id); }}>
              <Edit className="mr-2 h-4 w-4" /> Edit Program
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTogglePublish(program.id, !program.published); }}>
              {program.published ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" /> Unpublish
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" /> Publish
                </>
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

  const stats = [
    { label: 'Total Programs', value: programs.length, icon: <BookOpen className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} /> },
    { label: 'Published', value: programs.filter((p) => p.published).length, icon: <BookOpen className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} /> },
    { label: 'Total Enrollments', value: programs.reduce((acc, p) => acc + (p.enrollmentCount || 0), 0), icon: <BookOpen className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} /> }
  ];

  if (viewMode === 'edit' || viewMode === 'create') {
    return (
      <EquipProgramWizard 
        programId={selectedProgramId} 
        onBack={() => setViewMode('list')} 
        onSave={() => {
          // Force refresh programs list after save
          setViewMode('list');
          loadPrograms();
        }} 
      />
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="space-y-4">
          <Skeleton height="32px" width="350px" />
          <Skeleton height="20px" width="450px" />
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <Skeleton height="16px" width="120px" className="mb-2" />
                <Skeleton height="24px" width="50px" />
              </div>
            ))}
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <Skeleton height="40px" width="100%" className="mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-3">
              <Skeleton height="70px" width="100%" />
            </div>
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
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Equip Programs' }]}
        stats={stats}
        actions={
            <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            {!isMobile && 'Add Program'}
          </Button>
        }
      />

      <AdminDataTable 
        columns={columns} 
        data={programs} 
        searchKeys={['title', 'description', 'category']}
        searchPlaceholder="Search programs..."
        onRowClick={(item) => handleEdit(item.id)}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleVerify} className="gap-2" disabled={loading}>
                <CheckCircle className="w-4 h-4" />
                {!isMobile && 'Verify'}
            </Button>
            <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                {!isMobile && 'Export'}
            </Button>
          </div>
        }
      />
    </div>
  );
}