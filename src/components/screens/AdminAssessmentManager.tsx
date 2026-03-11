import { useState, useEffect } from 'react';
import { ClipboardList, Download, Edit, Plus, Eye, MoreHorizontal, CheckCircle, EyeOff, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { cmsUtils } from '../admin/cms-utils';
import { AdminHeader } from '../admin/AdminHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { AdminStatusBadge } from '../admin/AdminStatusBadge';
import { AssessmentEditPageWizard as AssessmentEditPage, Assessment } from './AssessmentEditPageWizard';
import { AdminDataTable, Column, FilterOption } from '../admin/AdminDataTable';
import { Skeleton } from '../ui/skeleton-loader';
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
  const [categories, setCategories] = useState<{label: string, value: string}[]>([]);
  const [filterTypes, setFilterTypes] = useState<{label: string, value: string}[]>([
    { label: 'All', value: 'all' },
    { label: 'Assessment', value: 'assessment' },
    { label: 'Quiz', value: 'quiz' },
    { label: 'Survey', value: 'survey' },
    { label: 'Checklist', value: 'checklist' }
  ]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | undefined>();

  useEffect(() => {
    if (viewMode === 'list') {
      loadData();
    }
  }, [viewMode]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadAssessments(), loadCategories()]);
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      if (Array.isArray(data) && data.length > 0) {
        // Deduplicate categories based on value (slug)
        const uniqueCategories = Array.from(
          new Map(
            data.map((c: any) => [c.slug, { label: c.name, value: c.slug }])
          ).values()
        );
        setCategories(uniqueCategories);
      } else {
        setCategories([
          { label: 'Anxiety', value: 'anxiety' },
          { label: 'Depression', value: 'depression' },
          { label: 'Stress', value: 'stress' },
          { label: 'Sleep', value: 'sleep' },
          { label: 'Wellness', value: 'wellness' },
          { label: 'Other', value: 'other' },
        ]);
      }
    } catch (error) {
      console.warn('Failed to load categories', error);
      setCategories([
        { label: 'Anxiety', value: 'anxiety' },
        { label: 'Depression', value: 'depression' },
        { label: 'Stress', value: 'stress' },
        { label: 'Sleep', value: 'sleep' },
        { label: 'Wellness', value: 'wellness' },
        { label: 'Other', value: 'other' },
      ]);
    }
  };

  const loadAssessments = async () => {
    try {
      const response = await apiClient.getAssessments();
      const data = Array.isArray(response) ? response : response.assessments || [];
      
      const mappedAssessments = data.map((item: any) => {
        const uniqueId = item.assessment_id || item.id || `assessment-${Date.now()}-${Math.random()}`;
        return {
          id: uniqueId,
          title: item.title || 'Untitled Assessment',
          description: item.description || '',
          category: item.category || 'General',
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
          thumbnail: item.hero_image || item.image_url || item.thumbnail || ''
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
    } catch (e: any) {
        showToast('error', 'Error', e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Title', 'Category', 'Duration', 'Questions', 'Published', 'Completions'].join(','),
      ...assessments.map((a) => [
        a.title,
        a.category,
        `${a.duration} min`,
        a.questions.length,
        a.published ? 'Yes' : 'No',
        a.completionCount || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('success', 'Export Complete', 'Assessments exported to CSV');
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
      const response = await apiClient.updateAssessment(id, { published });
      const updatedAssessment = response as Assessment;
      setAssessments((prev) => prev.map((a) => (a.id === id ? updatedAssessment : a)));
      showToast('success', 'Assessment Updated', `Assessment ${published ? 'published' : 'unpublished'}`);
    } catch (error: any) {
      console.error('Failed to update assessment:', error);
      showToast('error', 'API Error', 'Failed to update assessment');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      showToast('success', 'Assessment Deleted', 'Assessment deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete assessment:', error);
      showToast('error', 'API Error', 'Failed to delete assessment');
    }
  };

  const stats = [
    {
      label: 'Total Assessments',
      value: assessments.length,
      icon: <ClipboardList className="w-4 h-4 text-[var(--color-primary-default)]" />
    },
    {
      label: 'Published',
      value: assessments.filter((a) => a.published).length,
      icon: <Eye className="w-4 h-4 text-[var(--color-status-success)]" />
    },
    {
      label: 'Total Questions',
      value: assessments.reduce((acc, a) => acc + a.questions.length, 0),
      icon: <ClipboardList className="w-4 h-4 text-[var(--color-status-info)]" />
    },
    {
      label: 'Total Completions',
      value: assessments.reduce((acc, a) => acc + (a.completionCount || 0), 0),
      icon: <Eye className="w-4 h-4 text-[var(--color-status-warning)]" />
    }
  ];

  const columns: Column<Assessment>[] = [
    {
      header: 'Assessment',
      accessorKey: 'title',
      sortable: true,
      className: 'min-w-[250px]',
      render: (assessment) => (
        <div className="flex items-start gap-3">
          {assessment.thumbnail && (
            <img 
              src={assessment.thumbnail} 
              alt={assessment.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              style={{ backgroundColor: 'var(--color-bg-muted)' }}
            />
          )}
          <div className="flex-1">
            <h4 style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
              {assessment.title}
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
              {assessment.description?.substring(0, 80)}...
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      render: (assessment) => (
        <AdminStatusBadge status="neutral" label={assessment.category} />
      )
    },
    {
      header: 'Questions',
      render: (assessment) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {(assessment.questions || []).length}
        </span>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      render: (assessment) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'published',
      sortable: true,
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
      className: 'text-right',
      render: (assessment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                handleEdit(assessment.id); 
              }}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                handleTogglePublish(assessment.id, !assessment.published); 
              }}
            >
              {assessment.published ? (
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
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                handleDelete(assessment.id); 
              }}
              className=""
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
      options: categories.length > 0 ? categories : [
        { label: 'Anxiety', value: 'anxiety' },
        { label: 'Depression', value: 'depression' },
        { label: 'Stress', value: 'stress' },
        { label: 'Sleep', value: 'sleep' },
        { label: 'Wellness', value: 'wellness' },
        { label: 'Other', value: 'other' },
      ]
    },
    {
      key: 'filter_type',
      label: 'Type',
      options: filterTypes
    }
  ];

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
        {/* Header skeleton */}
        <div className="space-y-4">
          <Skeleton height="32px" width="300px" />
          <Skeleton height="20px" width="500px" />
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-[var(--color-bg-card)]">
                <Skeleton height="16px" width="100px" className="mb-2" />
                <Skeleton height="24px" width="60px" />
              </div>
            ))}
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-lg p-4 bg-[var(--color-bg-card)]">
          <Skeleton height="40px" width="100%" className="mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-3">
              <Skeleton height="60px" width="100%" />
            </div>
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
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Assessment Manager' }]}
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
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleVerify} className="gap-2" disabled={loading}>
                <CheckCircle className="w-4 h-4" />
                {!isMobile && 'Verify'}
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                {!isMobile && 'Export'}
            </Button>
          </div>
        }
      />
    </div>
  );
}