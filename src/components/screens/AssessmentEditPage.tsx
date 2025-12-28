import React, { useState, useEffect } from 'react';
import { Save, Trash2, ClipboardList, HelpCircle, TrendingUp, Eye, Plus, GripVertical, X, Image as ImageIcon } from 'lucide-react';
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
import { ImageUpload } from '../ui/image-upload';
import { WizardLayout } from '../ui/wizard-layout';
import { WizardStep } from '../ui/wizard-stepper';
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
  
  // Landing Page Content
  hero_image?: string;
  cta_button_text?: string;
  cta_button_link?: string;
  about_title?: string;
  about_content?: string;
  about_image?: string;
  video_caption?: string;
  main_title?: string;
  main_content?: string[];
  highlights_title?: string;
  highlights?: string[];
  notes_title?: string;
  notes?: string[];
  // Note: newsletter_image removed - handled by NewsletterBlock component
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
    featured: false,
    // Landing Page Defaults
    hero_image: '',
    cta_button_text: 'Take Assessment',
    cta_button_link: '',
    about_title: '',
    about_content: '',
    about_image: '',
    video_caption: '',
    main_title: '',
    main_content: [],
    highlights_title: 'Assessment Highlights',
    highlights: [],
    notes_title: 'Things to keep in mind',
    notes: []
    // Removed newsletter_image - it's managed by NewsletterBlock component
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

  const handleArrayFieldChange = (field: keyof Assessment, value: string) => {
    setFormData({
      ...formData,
      [field]: value.split('\n').filter(line => line.trim() !== '')
    });
  };

  const getArrayFieldString = (field: keyof Assessment) => {
    const val = formData[field];
    if (Array.isArray(val)) {
      return val.join('\n');
    }
    return '';
  };

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
      showToast('error', 'Error', 'Failed to load assessment data - Using mock data');
      
      // Fallback mock data for editing demo
      setFormData({
        title: 'Demo Assessment (Fallback)',
        description: 'This is a demo assessment loaded because the requested ID was not found.',
        category: 'wellness',
        duration: 15,
        difficulty: 'intermediate',
        questions: [
          {
            id: 'q1',
            text: 'How are you feeling today?',
            type: 'scale',
            options: [],
            required: true
          }
        ],
        published: true,
        featured: false
      });
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
        toggleActions={[
          {
            label: 'Featured',
            checked: formData.featured || false,
            onChange: (checked) => setFormData({ ...formData, featured: checked })
          }
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
        <WizardLayout>
          {/* Basic Information */}
          <WizardStep
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
          </WizardStep>

          {/* Landing Page Configuration */}
          <WizardStep
            title="Landing Page Configuration"
            description="Customize the assessment detail page content"
            icon={<Eye className="w-5 h-5" />}
          >
            {/* Hero Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium border-b pb-2">Hero Section</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <AdminFormField label="Hero Image" helpText="Banner image for the assessment landing page">
                  <ImageUpload
                    value={formData.hero_image || ''}
                    onChange={(url) => setFormData({ ...formData, hero_image: url })}
                    aspectRatio="wide"
                  />
                </AdminFormField>
                <div className="space-y-4">
                  <AdminFormField label="CTA Button Text">
                    <Input
                      value={formData.cta_button_text || ''}
                      onChange={(e) => setFormData({ ...formData, cta_button_text: e.target.value })}
                      placeholder="Take Assessment"
                    />
                  </AdminFormField>
                  <AdminFormField label="CTA Link (Optional)">
                    <Input
                      value={formData.cta_button_link || ''}
                      onChange={(e) => setFormData({ ...formData, cta_button_link: e.target.value })}
                      placeholder="/assessment-flow?type=..."
                    />
                  </AdminFormField>
                </div>
              </div>

              {/* About Section */}
              <h3 className="text-lg font-medium border-b pb-2 pt-4">Why Take This Assessment</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <AdminFormField label="Section Title">
                    <Input
                      value={formData.about_title || ''}
                      onChange={(e) => setFormData({ ...formData, about_title: e.target.value })}
                      placeholder="Why take this assessment?"
                    />
                  </AdminFormField>
                  <AdminFormField label="Content">
                    <Textarea
                      value={formData.about_content || ''}
                      onChange={(e) => setFormData({ ...formData, about_content: e.target.value })}
                      className="min-h-[120px]"
                      placeholder="Description of the assessment's purpose..."
                    />
                  </AdminFormField>
                </div>
                <div className="space-y-4">
                  <AdminFormField label="Image URL">
                    <ImageUpload
                      value={formData.about_image || ''}
                      onChange={(url) => setFormData({ ...formData, about_image: url })}
                      aspectRatio="video"
                    />
                  </AdminFormField>
                  <AdminFormField label="Video Caption (Optional)">
                    <Input
                      value={formData.video_caption || ''}
                      onChange={(e) => setFormData({ ...formData, video_caption: e.target.value })}
                      placeholder="Watch the introduction"
                    />
                  </AdminFormField>
                </div>
              </div>

              {/* Main Info Section */}
              <h3 className="text-lg font-medium border-b pb-2 pt-4">What To Expect</h3>
              <div className="space-y-4">
                <AdminFormField label="Section Title">
                  <Input
                    value={formData.main_title || ''}
                    onChange={(e) => setFormData({ ...formData, main_title: e.target.value })}
                    placeholder="What to expect"
                  />
                </AdminFormField>
                <AdminFormField label="Content Points (One item per line)">
                  <Textarea
                    value={getArrayFieldString('main_content')}
                    onChange={(e) => handleArrayFieldChange('main_content', e.target.value)}
                    className="min-h-[100px]"
                    placeholder="Item 1&#10;Item 2&#10;Item 3"
                  />
                </AdminFormField>
              </div>

              {/* Highlights & Notes */}
              <h3 className="text-lg font-medium border-b pb-2 pt-4">Key Benefits & Notes</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <AdminFormField label="Benefits Title">
                    <Input
                      value={formData.highlights_title || ''}
                      onChange={(e) => setFormData({ ...formData, highlights_title: e.target.value })}
                      placeholder="Key Benefits"
                    />
                  </AdminFormField>
                  <AdminFormField label="Benefits List (One item per line)">
                    <Textarea
                      value={getArrayFieldString('highlights')}
                      onChange={(e) => handleArrayFieldChange('highlights', e.target.value)}
                      className="min-h-[100px]"
                      placeholder="Benefit 1&#10;Benefit 2"
                    />
                  </AdminFormField>
                </div>
                <div className="space-y-4">
                  <AdminFormField label="Notes Title">
                    <Input
                      value={formData.notes_title || ''}
                      onChange={(e) => setFormData({ ...formData, notes_title: e.target.value })}
                      placeholder="Important Notes"
                    />
                  </AdminFormField>
                  <AdminFormField label="Notes (One item per line)">
                    <Textarea
                      value={getArrayFieldString('notes')}
                      onChange={(e) => handleArrayFieldChange('notes', e.target.value)}
                      className="min-h-[100px]"
                      placeholder="Note 1&#10;Note 2"
                    />
                  </AdminFormField>
                </div>
              </div>
            </div>
          </WizardStep>

          {/* Questions Management */}
          <WizardStep
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
          </WizardStep>

          {/* Scoring & Results */}
          <WizardStep
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
          </WizardStep>


        </WizardLayout>
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