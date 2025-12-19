import React, { useState, useEffect } from 'react';
import { Target, Search, Download, Edit, Plus, MoreHorizontal, Eye } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminEmptyState } from '../admin/AdminEmptyState';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { EquipProgramEditPage, EquipProgram } from './EquipProgramEditPage';
import { AdminDataTable, Column } from '../admin/AdminDataTable';
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
      const mappedPrograms = data.map((item: any) => ({
        ...item,
        id: item.equip_id || item.id,
        duration: item.duration_days || item.duration,
        // Ensure other fields
        category: item.category || 'General',
        published: item.published !== undefined ? item.published : true,
        enrollmentCount: item.enrollmentCount || 0
      }));

      setPrograms(mappedPrograms);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load programs:', error);
      // GLOBAL APPROACH: Show infinite loader on backend errors
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

  // -- Data Table Configuration --

  const columns: Column<EquipProgram>[] = [
    {
      header: 'Program',
      accessorKey: 'title',
      sortable: true,
      className: 'min-w-[300px]',
      render: (program) => (
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[300px]" title={program.title}>
            {program.title}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[300px]" title={program.description}>
            {program.description}
          </span>
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      render: (program) => (
        <Badge variant="outline" className="capitalize">
          {program.category}
        </Badge>
      )
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      sortable: true,
      render: (program) => (
        <span className="text-sm text-muted-foreground">
          {program.duration} days
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'published',
      sortable: true,
      render: (program) => (
        <Badge 
          className={program.published ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
          variant="outline"
        >
          {program.published ? 'Published' : 'Draft'}
        </Badge>
      )
    },
    {
      header: 'Enrollments',
      accessorKey: 'enrollmentCount',
      sortable: true,
      render: (program) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Target className="w-3 h-3" />
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
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const stats = [
    { label: 'Total Programs', value: programs.length, icon: <Target className="w-4 h-4 text-primary" /> },
    { label: 'Published', value: programs.filter((p) => p.published).length, icon: <Target className="w-4 h-4 text-green-500" /> },
    { label: 'Total Enrollments', value: programs.reduce((acc, p) => acc + (p.enrollmentCount || 0), 0), icon: <Target className="w-4 h-4 text-blue-500" /> }
  ];

  if (viewMode === 'edit' || viewMode === 'create') {
    return <EquipProgramEditPage programId={selectedProgramId} onBack={() => setViewMode('list')} onSave={() => setViewMode('list')} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 mx-auto mb-4 w-12 h-12 border-muted border-t-primary" />
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-background', className)} style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)' }}>
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
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {!isMobile && 'Export'}
            </Button>
          }
        />
      </div>
    </div>
  );
}