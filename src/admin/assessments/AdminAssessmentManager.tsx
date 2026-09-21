import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Eye, MoreHorizontal, EyeOff, Trash2, Pencil } from 'lucide-react';
import { useNotifications } from '../../shared/state/NotificationContext';
import { apiClient } from '../../shared/api/api';
import { AdminHeader } from '../shell/AdminHeader';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { AssessmentEditPageWizard as AssessmentEditPage, Assessment } from './AssessmentEditPageWizard';
import { AdminDataTable, Column, FilterOption } from '../ui/kit/AdminDataTable';
import { Skeleton } from '../ui/skeleton-loader';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { useMetadata } from '../ui/hooks/useMetadata';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AdminAssessmentManagerProps {
  onBack?: () => void;
  className?: string;
}

type ViewMode = 'list' | 'edit' | 'create';

export function AdminAssessmentManager({ onBack, className }: AdminAssessmentManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  // All metadata from KV
  const { assessmentTypes: metaAssessmentTypes, categories: metaCategories } = useMetadata();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | undefined>();

  useEffect(() => {
    if (viewMode === 'list') {
      loadAssessments();
    }
  }, [viewMode]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminAssessments();
      const data = Array.isArray(response) ? response : response.assessments || [];
      
      const mappedAssessments = data.map((item: any) => {
        const uniqueId = item.assessment_id || item.id || `assessment-${Date.now()}-${Math.random()}`;
        return {
          id: uniqueId,
          title: item.title || 'Untitled Assessment',
          description: item.description || '',
          category: item.category || '',
          published: item.published !== undefined ? item.published : true,
          questions: item.questions || [],
          duration: item.duration || 10,
          difficulty: item.difficulty || 'beginner',
          completionCount: item.completionCount || item.completion_count || 0,
          featured: item.featured || false,
          scoringMethod: item.scoringMethod || item.scoring_method,
          resultCategories: item.resultCategories || item.result_categories,
          created_at: item.created_at,
          updated_at: item.updated_at,
          thumbnail: item.thumbnail || item.hero_image || item.image_url || ''
        };
      });

      const uniqueAssessments = Array.from(
        new Map(mappedAssessments.map(item => [item.id, item])).values()
      );

      setAssessments(uniqueAssessments);
    } catch (error: any) {
      console.error('Failed to load assessments:', error);
      showToast('error', 'API Error', 'Failed to load assessments');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedAssessmentId(undefined);
    setViewMode('create');
  };

  const handleEdit = (id: string) => {
    setSelectedAssessmentId(id);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedAssessmentId(undefined);
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    try {
      await apiClient.updateAssessment(id, { published });
      setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, published } : a)));
      showToast('success', 'Assessment Updated', `Assessment ${published ? 'published' : 'unpublished'}`);
    } catch (error: any) {
      console.error('Failed to update assessment:', error);
      showToast('error', 'API Error', 'Failed to update assessment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) return;
    try {
      await apiClient.deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      showToast('success', 'Assessment Deleted', 'Assessment deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete assessment:', error);
      showToast('error', 'API Error', 'Failed to delete assessment');
    }
  };

  // -- Stats --
  const stats = [
    {
      label: 'Total Assessments',
      value: assessments.length,
      icon: <ClipboardList className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Published',
      value: assessments.filter((a) => a.published).length,
      icon: <Eye className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />
    },
    {
      label: 'Total Questions',
      value: assessments.reduce((acc, a) => acc + (a.questions?.length || 0), 0),
      icon: <ClipboardList className="w-4 h-4" style={{ color: 'var(--color-status-info)' }} />
    },
    {
      label: 'Total Completions',
      value: assessments.reduce((acc, a) => acc + (a.completionCount || 0), 0),
      icon: <Eye className="w-4 h-4" style={{ color: 'var(--color-status-warning)' }} />
    }
  ];

  // -- Columns --
  const columns: Column<Assessment>[] = [
    {
      header: 'Assessment',
      accessorKey: 'title',
      sortable: true,
      className: 'min-w-[280px]',
      render: (assessment) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
            <ImageWithFallback
              src={assessment.thumbnail || ''}
              alt={assessment.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate" style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }} title={assessment.title}>
              {assessment.title}
            </span>
            <span className="truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
              {assessment.description?.substring(0, 60)}{(assessment.description?.length || 0) > 60 ? '...' : ''}
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
      render: (assessment) => (
        <AdminStatusBadge status="neutral" label={assessment.category || '-'} />
      )
    },
    {
      header: 'Questions',
      className: 'w-[100px]',
      render: (assessment) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
          {(assessment.questions || []).length}
        </span>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      className: 'w-[120px]',
      render: (assessment) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
          {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'published',
      sortable: true,
      className: 'w-[110px]',
      render: (assessment) => (
        <AdminStatusBadge 
          status={assessment.published ? 'published' : 'draft'} 
          label={assessment.published ? 'Published' : 'Draft'} 
          dot 
        />
      )
    },
    {
      header: 'Actions',
      className: 'w-[60px] text-right',
      render: (assessment) => (
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(assessment.id); }}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleTogglePublish(assessment.id, !assessment.published); }}
            >
              {assessment.published ? (
                <><EyeOff className="mr-2 h-4 w-4" /> Unpublish</>
              ) : (
                <><Eye className="mr-2 h-4 w-4" /> Publish</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(assessment.id); }}
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
    }] : []),
    ...(metaAssessmentTypes.length > 0 ? [{
      key: 'filter_type',
      label: 'Type',
      options: metaAssessmentTypes.map(t => ({ label: t.label, value: t.value }))
    }] : [])
  ];

  // -- Views --

  if (viewMode === 'edit' || viewMode === 'create') {
    return (
      <AssessmentEditPage
        assessmentId={selectedAssessmentId}
        onBack={handleBackToList}
        onSave={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-4">
          <Skeleton height="32px" width="300px" />
          <Skeleton height="20px" width="500px" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
                <Skeleton height="16px" width="100px" className="mb-2" />
                <Skeleton height="24px" width="60px" />
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
        title="Assessment Manager"
        description="Manage mental health assessments and questionnaires"
        stats={stats}
        actions={
          <Button onClick={handleCreateNew} style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
            <Plus className="w-4 h-4 mr-2" />
            {!isMobile && 'Add Assessment'}
          </Button>
        }
      />

      <AdminDataTable 
        columns={columns} 
        data={assessments} 
        searchKeys={['title', 'description', 'category']}
        filters={filters}
        searchPlaceholder="Search assessments..."
        onRowClick={(item) => handleEdit(item.id)}
      />
    </div>
  );
}
