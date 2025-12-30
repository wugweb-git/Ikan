import React, { useState, useEffect } from 'react';
import { Save, Trash2, ClipboardList, HelpCircle, Eye, Plus, GripVertical, X, Upload, EyeOff, Lightbulb } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
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
import { RichTextEditor } from '../ui/rich-text-editor';
import { WizardLayout } from '../ui/wizard-layout';
import { WizardStep } from '../ui/wizard-stepper';
import { QuestionCard } from '../ui/question-card';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { validateUrl } from '../../lib/validation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';

export interface Question {
  id: string;
  text: string;
  richText?: string;
  type: 'multiple-choice' | 'scale' | 'text' | 'true-false' | 'dropdown' | 'mcq-icons' | 'rich-text' | 'timed';
  options?: string[];
  optionIcons?: string[];
  optionImages?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min?: string; max?: string; mid?: string };
  required: boolean;
  icon?: string;
  placeholder?: string;
  maxLength?: number;
  timeLimit?: number;
  allowMultiple?: boolean;
  description?: string;
  styling?: {
    textColor?: string;
    backgroundColor?: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl';
    fontWeight?: 'normal' | 'medium';
    backgroundImage?: string;
    iconColor?: string;
    borderColor?: string;
    borderRadius?: 'sm' | 'md' | 'lg';
  };
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string; // Dynamic
  filter_type?: string; // e.g. quiz, survey, assessment
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
  scoringMethod?: 'sum' | 'average' | 'custom';
  resultCategories?: Array<{ min: number; max: number; label: string; description: string }>;
  published: boolean;
  published_at?: string;
  featured?: boolean;
  completionCount?: number;
  created_at?: string;
  updated_at?: string;
  hero_image?: string;
  hero_image_url?: string;
  about_image?: string;
  about_image_url?: string;
  thumbnail?: string;
  is_paid?: boolean;
  price_amount?: number;
  price_currency?: string;
  cta_button_text?: string;
  cta_button_link?: string;
  about_title?: string;
  about_content?: string;
  video_caption?: string;
  main_title?: string;
  main_content?: string[];
  highlights_title?: string;
  highlights?: string[];
  notes_title?: string;
  notes?: string[];
  section1_title?: string;
  section1_eligibility_title?: string;
  section1_eligibility_points?: string[];
  section1_who_title?: string;
  section1_who_content?: string;
  section2_title?: string;
  section2_content?: string;
  section2_content_html?: string;
  section2_image?: string;
  section2_bullets?: string[];
  section3_title?: string;
  section3_subtitle?: string;
  section3_content?: string[];
  section4_notes_title?: string;
  section4_notes?: string[];
}

interface AssessmentEditPageWizardProps {
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

export function AssessmentEditPageWizard({ assessmentId, onBack, onSave }: AssessmentEditPageWizardProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!assessmentId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dynamicCategoryOptions, setDynamicCategoryOptions] = useState(categoryOptions);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      if (Array.isArray(data) && data.length > 0) {
        setDynamicCategoryOptions(data.map((c: any) => ({
          label: c.name,
          value: c.slug
        })));
      }
    } catch (error) {
      console.warn('Failed to load categories', error);
    }
  };

  const [formData, setFormData] = useState<Partial<Assessment>>({
    title: '',
    description: '',
    category: 'wellness',
    filter_type: 'assessment',
    duration: 10,
    difficulty: 'beginner',
    questions: [],
    scoringMethod: 'sum',
    resultCategories: [],
    published: false,
    featured: false,
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
    notes: [],
    section1_title: 'How it works',
    section1_eligibility_title: 'What to expect:',
    section1_eligibility_points: [],
    section1_who_title: 'Who can take this?',
    section1_who_content: 'This assessment is designed for adults 18+.',
    section2_title: 'What is this assessment?',
    section2_content: '',
    section2_image: '',
    section2_bullets: [],
    section3_title: 'What you\'ll see',
    section3_subtitle: 'Understanding your mental health is the first step.',
    section3_content: [],
    section4_notes_title: 'Things to remember',
    section4_notes: []
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
    },
    hero_image: {
      validate: (value: any) => !value || !validateUrl(value),
      message: 'Hero image must be a valid URL'
    },
    thumbnail: {
      validate: (value: any) => !value || !validateUrl(value),
      message: 'Thumbnail must be a valid URL'
    },
    cta_button_link: {
      validate: (value: any) => !value || (value.startsWith('/') || !validateUrl(value)),
      message: 'CTA Link must be a valid URL or internal path'
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
      if (data && typeof data === 'object') {
        setFormData(data);
      } else {
        showToast('error', 'Error', 'Invalid assessment data format');
      }
    } catch (error) {
      console.error('Failed to load assessment:', error);
      showToast('error', 'Error', 'Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (shouldPublish?: boolean) => {
    const isValid = validateForm(formData);
    if (!isValid) {
      showToast('error', 'Validation Error', 'Please fix the errors before saving');
      return;
    }

    // Only enforce question requirement when publishing
    const willBePublished = shouldPublish === true || (shouldPublish === undefined && formData.published);

    if (willBePublished && (formData.questions || []).length === 0) {
      showToast('error', 'Validation Error', 'Please add at least one question to publish');
      return;
    }

    try {
      setSaving(true);
      const dataToSave = { ...formData };
      
      if (shouldPublish !== undefined) {
        dataToSave.published = shouldPublish;
        if (shouldPublish) {
          dataToSave.published_at = new Date().toISOString();
        }
      }

      if (assessmentId) {
        await apiClient.updateAssessment(assessmentId, dataToSave);
        showToast('success', 'Success', dataToSave.published ? 'Assessment published successfully' : 'Assessment saved as draft');
      } else {
        await apiClient.createAssessment(dataToSave);
        showToast('success', 'Success', dataToSave.published ? 'Assessment published successfully' : 'Assessment created as draft');
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

  const wizardSteps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Info',
      subtitle: errors.title || errors.description ? 'Complete required fields' : 'Finished',
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'upcoming'
    },
    {
      id: 'landing',
      title: 'Landing Page',
      subtitle: currentStep === 1 ? 'In progress' : currentStep > 1 ? 'Finished' : 'Waiting',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming'
    },
    {
      id: 'questions',
      title: 'Questions',
      subtitle: `${(formData.questions || []).length} added`,
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming'
    },
    {
      id: 'scoring',
      title: 'Scoring & Results',
      subtitle: currentStep === 3 ? 'Final step' : currentStep > 3 ? 'Finished' : 'Waiting',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'upcoming'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg-page)]">
        <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-12 w-12" />
      </div>
    );
  }

  return (
    <>
      <WizardLayout
        title={formData.title || 'Untitled Assessment'}
        status={formData.published ? 'published' : 'draft'}
        steps={wizardSteps}
        currentStep={currentStep}
        onStepChange={(newStep) => {
          if (newStep > currentStep) {
            if (validateForm(formData)) setCurrentStep(newStep);
            else showToast('error', 'Validation Error', 'Please complete required fields');
          } else {
            setCurrentStep(newStep);
          }
        }}
        onExit={() => {
          if (hasUnsavedChanges) setShowWarning(true);
          else onBack();
        }}
        onSaveDraft={() => handleSave(false)}
        onNext={() => {
          if (validateForm(formData)) setCurrentStep(s => Math.min(s + 1, 3));
          else showToast('error', 'Validation Error', 'Please complete required fields');
        }}
        onPrevious={() => setCurrentStep(s => Math.max(s - 1, 0))}
        onFinish={() => handleSave()}
        isLoading={saving}
        finishButtonText={assessmentId ? 'Save Changes' : 'Create Assessment'}
        stepTitle={wizardSteps[currentStep].title}
        stepDescription={wizardSteps[currentStep].subtitle}
        
        footerLeftContent={
          assessmentId ? (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 size={16} /> Delete
            </Button>
          ) : null
        }
        footerRightContent={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="gap-2"
            >
              <Save size={16} /> Save Draft
            </Button>
            <Button
              onClick={() => handleSave(!formData.published)}
              disabled={saving}
              className={`gap-2 ${formData.published ? 'bg-amber-600 hover:bg-amber-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
            >
              <Upload size={16} /> {formData.published ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        }
      >
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="space-y-8">
            <div className="p-6 bg-white rounded-xl border border-gray-200 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <AdminFormField label="Title" required error={errors.title}>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Anxiety Self-Assessment"
                  />
                </AdminFormField>

                <AdminFormField label="Topic Category" required>
                  <Select
                    value={formData.category}
                    onValueChange={(v: any) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {dynamicCategoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </AdminFormField>

                <AdminFormField label="Assessment Type">
                  <Select
                    value={formData.filter_type || 'assessment'}
                    onValueChange={(v: any) => setFormData({ ...formData, filter_type: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessment">Standard Assessment</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="survey">Survey</SelectItem>
                      <SelectItem value="checklist">Checklist</SelectItem>
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
                  />
                </AdminFormField>

                <AdminFormField label="Difficulty Level">
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v: any) => setFormData({ ...formData, difficulty: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </AdminFormField>
              </div>

              <AdminFormField label="Description" required error={errors.description}>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="This assessment helps identify..."
                  className="min-h-[120px]"
                />
              </AdminFormField>

              <AdminFormField label="Assessment Image (Thumbnail)">
                <ImageUpload
                  value={formData.thumbnail || ''}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                  aspectRatio="square"
                />
              </AdminFormField>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-200 space-y-4">
              <h3 className="text-base font-medium">Pricing & Paywall</h3>
              <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => setFormData({ ...formData, is_paid: !formData.is_paid })}>
                <Checkbox
                  id="is-paid"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked as boolean })}
                />
                <div className="flex-1">
                  <Label htmlFor="is-paid" className="cursor-pointer font-medium">Enable Paywall</Label>
                  <p className="text-sm text-gray-500 mt-1">Require payment to access this assessment</p>
                </div>
              </div>

              {formData.is_paid && (
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <AdminFormField label="Price Amount" required>
                    <Input
                      type="number"
                      value={formData.price_amount || ''}
                      onChange={(e) => setFormData({ ...formData, price_amount: parseFloat(e.target.value) })}
                      placeholder="99.00"
                    />
                  </AdminFormField>
                  <AdminFormField label="Currency">
                    <Select
                      value={formData.price_currency || 'INR'}
                      onValueChange={(v: any) => setFormData({ ...formData, price_currency: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </AdminFormField>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Landing Page */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-medium border-b pb-2">Hero Section</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <AdminFormField label="Hero Image">
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
            </div>
            
            {/* Bento Grid Config - Simplified for wizard */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium border-b pb-2">Content Sections (Bento Grid)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <AdminFormField label="Section 1 Title (Process / How it works)">
                  <Input
                    value={formData.section1_title || ''}
                    onChange={(e) => setFormData({ ...formData, section1_title: e.target.value })}
                  />
                </AdminFormField>
                <AdminFormField label="Process Steps (One per line)">
                  <Textarea
                    value={getArrayFieldString('section1_eligibility_points')}
                    onChange={(e) => handleArrayFieldChange('section1_eligibility_points', e.target.value)}
                    className="min-h-[100px]"
                    placeholder="e.g. Answer 10 questions"
                  />
                </AdminFormField>
                <AdminFormField label="Section 2 Title (What is this?)">
                  <Input
                    value={formData.section2_title || formData.about_title || ''}
                    onChange={(e) => setFormData({ ...formData, section2_title: e.target.value })}
                  />
                </AdminFormField>
                <AdminFormField label="Content (What is this?)">
                  <Textarea
                    value={formData.section2_content || formData.about_content || ''}
                    onChange={(e) => setFormData({ ...formData, section2_content: e.target.value })}
                    className="min-h-[100px]"
                  />
                </AdminFormField>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Questions */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Questions ({formData.questions?.length || 0})</h3>
              <Button onClick={addQuestion} className="gap-2">
                <Plus size={16} /> Add Question
              </Button>
            </div>
            
            <div className="space-y-4">
              {(formData.questions || []).map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onUpdate={updateQuestion}
                  onDelete={deleteQuestion}
                />
              ))}
              {(formData.questions || []).length === 0 && (
                <div className="text-center p-12 bg-gray-50 border-2 border-dashed rounded-xl">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No questions yet. Add your first question to start.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Scoring */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-xl border border-gray-200 space-y-6">
              <AdminFormField label="Scoring Method">
                <Select
                  value={formData.scoringMethod}
                  onValueChange={(v: any) => setFormData({ ...formData, scoringMethod: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum of all answers</SelectItem>
                    <SelectItem value="average">Average of all answers</SelectItem>
                    <SelectItem value="custom">Custom scoring</SelectItem>
                  </SelectContent>
                </Select>
              </AdminFormField>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Result Categories</Label>
                  <Button variant="outline" size="sm" onClick={addResultCategory} className="gap-2">
                    <Plus size={14} /> Add Category
                  </Button>
                </div>
                {(formData.resultCategories || []).map((cat, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 grid grid-cols-2 gap-4">
                      <Input
                        value={cat.label}
                        onChange={(e) => {
                          const cats = [...(formData.resultCategories || [])];
                          cats[i].label = e.target.value;
                          setFormData({ ...formData, resultCategories: cats });
                        }}
                        placeholder="Category Name (e.g. Low Anxiety)"
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </WizardLayout>

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
              Are you sure you want to delete this assessment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}