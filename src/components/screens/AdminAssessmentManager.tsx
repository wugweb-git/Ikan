import React, { useState, useEffect } from 'react';
import { ClipboardList, Download, Edit, Plus, Eye, MoreHorizontal, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { AssessmentEditPage, Assessment } from './AssessmentEditPage';
import { AdminDataTable, Column, FilterOption } from '../admin/AdminDataTable';
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
      const response = await apiClient.getAssessments();
      const data = Array.isArray(response) ? response : response.assessments || [];
      
      // Map API response to Component Assessment type
      const mappedAssessments = data.map((item: any) => ({
        ...item,
        id: item.assessment_id || item.id,
        // Ensure other fields
        category: item.category || 'General',
        published: item.published !== undefined ? item.published : true,
        questions: item.questions || [],
        duration: item.duration || 10,
        completionCount: item.completionCount || 0
      }));

      setAssessments(mappedAssessments);
      setLoading(false); 
    } catch (error: any) {
      console.error('Failed to load assessments:', error);
      console.error('Backend error - showing infinite loader to force proper backend setup');
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

  const stats = [
    {
      label: 'Total Assessments',
      value: assessments.length,
      icon: <ClipboardList className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Published',
      value: assessments.filter((a) => a.published).length,
      icon: <Eye className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
    },
    {
      label: 'Total Questions',
      value: assessments.reduce((acc, a) => acc + a.questions.length, 0),
      icon: <ClipboardList className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    },
    {
      label: 'Total Completions',
      value: assessments.reduce((acc, a) => acc + (a.completionCount || 0), 0),
      icon: <Eye className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />
    }
  ];

  const columns: Column<Assessment>[] = [
    {
      header: 'Assessment',
      accessorKey: 'title',
      sortable: true,
      className: 'min-w-[250px]',
      render: (assessment) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium truncate max-w-[200px]" title={assessment.title}>
              {assessment.title}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={assessment.description}>
              {assessment.description}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      render: (assessment) => (
        <Badge variant="outline" className="capitalize">
          {assessment.category}
        </Badge>
      )
    },
    {
      header: 'Status',
      accessorKey: 'published',
      sortable: true,
      render: (assessment) => (
        <div className="flex gap-1">
          {assessment.published ? (
            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
              Published
            </Badge>
          ) : (
            <Badge variant="outline">Draft</Badge>
          )}
          {assessment.featured && (
            <Badge variant="default" className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
              Featured
            </Badge>
          )}
        </div>
      )
    },
    {
      header: 'Info',
      render: (assessment) => (
        <div className="flex flex-col text-xs text-muted-foreground gap-1">
          <span>⏱️ {assessment.duration} min</span>
          <span>❓ {assessment.questions.length} questions</span>
        </div>
      )
    },
    {
      header: 'Completions',
      accessorKey: 'completionCount',
      sortable: true,
      render: (assessment) => (
        <span className="flex items-center gap-1 text-sm">
          <CheckCircle className="w-3 h-3 text-green-500" />
          {assessment.completionCount || 0}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (assessment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(assessment.id); }}>
              <Edit className="mr-2 h-4 w-4" /> Edit Assessment
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
      options: [
        { label: 'Anxiety', value: 'anxiety' },
        { label: 'Depression', value: 'depression' },
        { label: 'Stress', value: 'stress' },
        { label: 'Wellness', value: 'wellness' },
        { label: 'Other', value: 'other' },
      ]
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 mx-auto mb-4 w-12 h-12 border-muted border-t-primary" />
          <p className="text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen', className)} style={{ backgroundColor: 'var(--color-bg-page)', padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)' }}>
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
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              {!isMobile && 'Export'}
            </Button>
          }
        />
      </div>
    </div>
  );
}
