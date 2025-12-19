import React, { useState, useEffect } from 'react';
import { Save, Trash2, ClipboardList, HelpCircle, TrendingUp, Eye, Plus, GripVertical, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminPageLayout } from '../admin/AdminPageLayout';
import { AdminSection } from '../admin/AdminSection';
import { AdminFormField } from '../admin/AdminFormField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'scale' | 'text';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  required: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: 'anxiety' | 'depression' | 'stress' | 'wellness' | 'other';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
  scoringMethod?: 'sum' | 'average' | 'custom';
  resultCategories?: Array<{ min: number; max: number; label: string; description: string }>;
  published: boolean;
  featured?: boolean;
  completionCount?: number;
  created_at?: string;
  updated_at?: string;
}

interface AssessmentEditPageProps {
  assessmentId?: string;
  onBack: () => void;
  onSave: () => void;
}

const categoryOptions = [
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'stress', label: 'Stress' },
  { value: 'wellness', label: 'General Wellness' },
  { value: 'other', label: 'Other' }
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export function AssessmentEditPage({ assessmentId, onBack, onSave }: AssessmentEditPageProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!assessmentId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Assessment>>({
    title: '',
    description: '',
    category: 'wellness',
    duration: 10,
    difficulty: 'beginner',
    questions: [],
    scoringMethod: 'sum',
    resultCategories: [],
    published: false,
    featured: false
  });

  const validationSchema: ValidationSchema = {
    title: {
      required: true,
      minLength: 3,
      message: 'Title must be at least 3 characters'
    },
    description: {
      required: true,
      minLength: 20,
      message: 'Description must be at least 20 characters'
    },
    duration: {
      validate: (value: any) => {
        const num = parseInt(value);
        return num > 0 && num <= 180;
      },
      message: 'Duration must be between 1 and 180 minutes'
    }
  };

  const { errors, validateForm } = useFormValidation(validationSchema);
  const { hasUnsavedChanges, markAsSaved, markAsUnsaved, setShowWarning, showWarning } = useUnsavedChanges();

  useEffect(() => {
    if (formData.title || formData.description) {
      markAsUnsaved();
    }
  }, [formData]);

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAssessment(assessmentId!);
      setFormData(data);
    } catch (error) {
      console.error('Failed to load assessment:', error);
      showToast('error', 'Error', 'Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const isValid = validateForm(formData);
    if (!isValid) {
      showToast('error', 'Validation Error', 'Please fix the errors before saving');
      return;
    }

    if ((formData.questions || []).length === 0) {
      showToast('error', 'Validation Error', 'Please add at least one question');
      return;
    }

    try {
      setSaving(true);

      if (assessmentId) {
        await apiClient.updateAssessment(assessmentId, formData);
        showToast('success', 'Success', 'Assessment updated successfully');
      } else {
        await apiClient.createAssessment(formData);
        showToast('success', 'Success', 'Assessment created successfully');
      }

      markAsSaved();
      onSave();
    } catch (error: any) {
      console.error('Failed to save assessment:', error);
      showToast('error', 'Error', error.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!assessmentId) return;

    try {
      setSaving(true);
      await apiClient.deleteAssessment(assessmentId);
      showToast('success', 'Success', 'Assessment deleted successfully');
      onSave();
    } catch (error: any) {
      console.error('Failed to delete assessment:', error);
      showToast('error', 'Error', error.message || 'Failed to delete assessment');
    } finally {
      setSaving(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: '',
      type: 'multiple-choice',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: true
    };
    setFormData({
      ...formData,
      questions: [...(formData.questions || []), newQuestion]
    });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setFormData({
      ...formData,
      questions: (formData.questions || []).map((q) => (q.id === id ? { ...q, ...updates } : q))
    });
  };

  const deleteQuestion = (id: string) => {
    setFormData({
      ...formData,
      questions: (formData.questions || []).filter((q) => q.id !== id)
    });
  };

  const addResultCategory = () => {
    setFormData({
      ...formData,
      resultCategories: [
        ...(formData.resultCategories || []),
        { min: 0, max: 10, label: 'New Category', description: '' }
      ]
    });
  };

  useKeyboardShortcuts(
    {
      'ctrl+s': (e) => {
        e.preventDefault();
        handleSave();
      },
      escape: () => {
        if (hasUnsavedChanges) {
          setShowWarning(true);
        } else {
          onBack();
        }
      }
    },
    [formData, hasUnsavedChanges]
  );

  if (loading) {
    return (
      <AdminPageLayout
        title="Loading..."
        breadcrumbs={[
          { label: 'Admin', onClick: onBack },
          { label: 'Assessments', onClick: onBack },
          { label: 'Loading...' }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div
            className="animate-spin rounded-full border-4"
            style={{
              width: '48px',
              height: '48px',
              borderColor: 'var(--color-accent-default)',
              borderTopColor: 'var(--color-primary-default)'
            }}
          />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <>
      <AdminPageLayout
        title={assessmentId ? formData.title || 'Edit Assessment' : 'New Assessment'}
        subtitle={assessmentId ? 'Update assessment information' : 'Create a new mental health assessment'}
        breadcrumbs={[
          { label: 'Admin', onClick: onBack },
          { label: 'Assessments', onClick: onBack },
          { label: assessmentId ? formData.title || 'Edit' : 'New Assessment' }
        ]}
        status={
          formData.published
            ? { label: 'Published', variant: 'success' }
            : { label: 'Draft', variant: 'warning' }
        }
        primaryAction={{
          label: assessmentId ? 'Save Changes' : 'Create Assessment',
          icon: <Save className="w-4 h-4" />,
          onClick: handleSave,
          loading: saving
        }}
        secondaryActions={[
          ...(assessmentId
            ? [
                {
                  label: 'Delete',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => setIsDeleteDialogOpen(true),
                  variant: 'destructive' as const
                }
              ]
            : [])
        ]}
        onBack={() => {
          if (hasUnsavedChanges) {
            setShowWarning(true);
          } else {
            onBack();
          }
        }}
        maxWidth="xl"
      >
        {/* Basic Information */}
        <AdminSection
          title="Basic Information"
          description="Core assessment details"
          icon={<ClipboardList className="w-5 h-5" />}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Title" required error={errors.title}>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Anxiety Self-Assessment"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Category" required>
              <Select
                value={formData.category}
                onValueChange={(v: any) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>

            <AdminFormField label="Duration (minutes)" required error={errors.duration}>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                min="1"
                max="180"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Difficulty Level">
              <Select
                value={formData.difficulty}
                onValueChange={(v: any) => setFormData({ ...formData, difficulty: v })}
              >
                <SelectTrigger
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>
          </div>

          <AdminFormField label="Description" required error={errors.description}>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="This assessment helps identify anxiety levels..."
              className="min-h-[100px]"
              style={{
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            />
          </AdminFormField>
        </AdminSection>

        {/* Questions Management */}
        <AdminSection
          title="Questions"
          description={`${(formData.questions || []).length} question(s)`}
          icon={<HelpCircle className="w-5 h-5" />}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={addQuestion}
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                gap: 'var(--spacing-2)'
              }}
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          }
        >
          <div className="space-y-4">
            {(formData.questions || []).map((question, index) => (
              <Card
                key={question.id}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                      <Badge variant="outline">Q{index + 1}</Badge>
                    </div>
                    <div className="flex-1 space-y-3">
                      <Input
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                        placeholder="Enter your question here..."
                        style={{
                          height: 'var(--ikan-component-button-height)',
                          borderRadius: 'var(--ikan-component-border-radius)'
                        }}
                      />

                      <div className="flex items-center gap-3">
                        <Select
                          value={question.type}
                          onValueChange={(v: any) => updateQuestion(question.id, { type: v })}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="scale">Scale (1-10)</SelectItem>
                            <SelectItem value="text">Text Answer</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`required-${question.id}`}
                            checked={question.required}
                            onCheckedChange={(checked) =>
                              updateQuestion(question.id, { required: checked as boolean })
                            }
                          />
                          <Label htmlFor={`required-${question.id}`} className="cursor-pointer">
                            Required
                          </Label>
                        </div>
                      </div>

                      {question.type === 'multiple-choice' && (
                        <div className="space-y-2">
                          {(question.options || []).map((opt, i) => (
                            <Input
                              key={i}
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [...(question.options || [])];
                                newOptions[i] = e.target.value;
                                updateQuestion(question.id, { options: newOptions });
                              }}
                              placeholder={`Option ${i + 1}`}
                              style={{
                                height: 'var(--ikan-component-button-height)',
                                borderRadius: 'var(--ikan-component-border-radius)'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                      style={{ color: 'var(--color-danger-default)' }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(formData.questions || []).length === 0 && (
              <div
                className="text-center py-12"
                style={{
                  backgroundColor: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <HelpCircle
                  className="w-12 h-12 mx-auto mb-3"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
                  No questions added yet
                </p>
                <Button
                  variant="outline"
                  onClick={addQuestion}
                  className="mt-4"
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            )}
          </div>
        </AdminSection>

        {/* Scoring & Results */}
        <AdminSection
          title="Scoring & Results"
          description="Configure scoring methodology and result interpretation"
          icon={<TrendingUp className="w-5 h-5" />}
        >
          <AdminFormField label="Scoring Method">
            <Select
              value={formData.scoringMethod}
              onValueChange={(v: any) => setFormData({ ...formData, scoringMethod: v })}
            >
              <SelectTrigger
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum of all answers</SelectItem>
                <SelectItem value="average">Average of all answers</SelectItem>
                <SelectItem value="custom">Custom scoring</SelectItem>
              </SelectContent>
            </Select>
          </AdminFormField>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Result Categories</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addResultCategory}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {(formData.resultCategories || []).map((cat, i) => (
              <Card key={i} style={{ borderRadius: 'var(--radius-md)' }}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={cat.label}
                      onChange={(e) => {
                        const cats = [...(formData.resultCategories || [])];
                        cats[i].label = e.target.value;
                        setFormData({ ...formData, resultCategories: cats });
                      }}
                      placeholder="Category name"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={cat.min}
                        onChange={(e) => {
                          const cats = [...(formData.resultCategories || [])];
                          cats[i].min = parseInt(e.target.value);
                          setFormData({ ...formData, resultCategories: cats });
                        }}
                        placeholder="Min"
                      />
                      <Input
                        type="number"
                        value={cat.max}
                        onChange={(e) => {
                          const cats = [...(formData.resultCategories || [])];
                          cats[i].max = parseInt(e.target.value);
                          setFormData({ ...formData, resultCategories: cats });
                        }}
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AdminSection>

        {/* Publishing Options */}
        <AdminSection
          title="Publishing Options"
          description="Control visibility and featured status"
          icon={<Eye className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked as boolean })}
              />
              <div className="flex-1">
                <Label htmlFor="published" className="cursor-pointer">
                  Published
                </Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Make this assessment available to users
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
              />
              <div className="flex-1">
                <Label htmlFor="featured" className="cursor-pointer">
                  Featured
                </Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Show in featured assessments section
                </p>
              </div>
            </div>
          </div>

          {assessmentId && formData.completionCount !== undefined && (
            <div className="p-4 rounded-lg mt-4" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Total Completions
              </p>
              <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
                {formData.completionCount}
              </p>
            </div>
          )}
        </AdminSection>
      </AdminPageLayout>

      <UnsavedChangesDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={() => {
          markAsSaved();
          onBack();
        }}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{formData.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              style={{ backgroundColor: 'var(--color-danger-default)', color: 'white' }}
            >
              Delete Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}