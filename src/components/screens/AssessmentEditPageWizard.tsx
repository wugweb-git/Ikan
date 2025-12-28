import React, { useState, useEffect } from 'react';
import { Save, Trash2, ClipboardList, HelpCircle, TrendingUp, Eye, Plus, GripVertical, X, FileText, Upload, EyeOff } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminPageLayout } from '../admin/AdminPageLayout';
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
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { AdminActionBar } from '../ui/admin-action-bar';

interface Question {
  id: string;
  text: string;
  richText?: string; // Rich text formatted question
  type: 'multiple-choice' | 'scale' | 'text' | 'true-false' | 'dropdown' | 'mcq-icons' | 'rich-text' | 'timed';
  options?: string[];
  optionIcons?: string[]; // Lucide icon names for mcq-icons type
  optionImages?: string[]; // Image URLs for options
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min?: string; max?: string; mid?: string }; // Labels for scale endpoints
  required: boolean;
  icon?: string; // Lucide icon name for the question
  placeholder?: string; // Placeholder text for text/rich-text inputs
  maxLength?: number; // Character limit for text answers
  timeLimit?: number; // Time limit in seconds for timed questions
  allowMultiple?: boolean; // Allow multiple selections for MCQ
  description?: string; // Additional help text
  
  // STYLING PROPERTIES
  styling?: {
    textColor?: string; // Question text color
    backgroundColor?: string; // Question background color
    fontSize?: 'sm' | 'base' | 'lg' | 'xl'; // Font size
    fontWeight?: 'normal' | 'medium'; // Font weight (only normal/medium per guidelines)
    backgroundImage?: string; // Background image URL
    iconColor?: string; // Icon tint color
    borderColor?: string; // Border color for question card
    borderRadius?: 'sm' | 'md' | 'lg'; // Border radius
  };
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
  published_at?: string;
  featured?: boolean;
  completionCount?: number;
  created_at?: string;
  updated_at?: string;
  
  // Images
  hero_image?: string;
  hero_image_url?: string;
  about_image?: string;
  about_image_url?: string;
  thumbnail?: string; // Computed field for display in admin tables
  
  // Pricing/Paywall
  is_paid?: boolean;
  price_amount?: number;
  price_currency?: string;
  
  // Landing Page Content
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
  
  // Bento Grid Specifics
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
    
    // Initial Bento Grid Defaults
    section1_title: 'Who is this test for?',
    section1_eligibility_title: 'This assessment may be helpful if you:',
    section1_eligibility_points: [],
    section1_who_title: 'Who can take this?',
    section1_who_content: 'This assessment is designed for adults 18+.',
    
    section2_title: 'About this test',
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
      console.log('📥 Loaded assessment data:', data);
      console.log('📥 Assessment ID:', assessmentId);
      
      // Ensure we're setting the actual assessment data, not a wrapped response
      if (data && typeof data === 'object') {
        setFormData(data);
        console.log('✅ Form data set successfully');
      } else {
        console.error('❌ Invalid data format received:', data);
        showToast('error', 'Error', 'Invalid assessment data format');
      }
    } catch (error) {
      console.error('❌ Failed to load assessment:', error);
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

    if ((formData.questions || []).length === 0) {
      showToast('error', 'Validation Error', 'Please add at least one question');
      return;
    }

    try {
      setSaving(true);

      const dataToSave = { ...formData };
      
      // 🐛 DEBUG: Log what we're saving
      console.log('📤 [ASSESSMENT SAVE] Starting save operation...');
      console.log('📤 [ASSESSMENT SAVE] Assessment ID:', assessmentId);
      console.log('📤 [ASSESSMENT SAVE] Should Publish:', shouldPublish);
      console.log('📤 [ASSESSMENT SAVE] Title:', dataToSave.title);
      console.log('📤 [ASSESSMENT SAVE] Questions count:', (dataToSave.questions || []).length);
      console.log('📤 [ASSESSMENT SAVE] Full Data:', JSON.stringify(dataToSave, null, 2));
      
      // Handle publish/unpublish
      if (shouldPublish !== undefined) {
        dataToSave.published = shouldPublish;
        if (shouldPublish) {
          dataToSave.published_at = new Date().toISOString();
        }
      }

      if (assessmentId) {
        console.log('📤 [ASSESSMENT SAVE] Calling updateAssessment...');
        await apiClient.updateAssessment(assessmentId, dataToSave);
        console.log('✅ [ASSESSMENT SAVE] Update successful!');
        showToast('success', 'Success', dataToSave.published ? 'Assessment published successfully' : 'Assessment saved as draft');
      } else {
        console.log('📤 [ASSESSMENT SAVE] Calling createAssessment...');
        await apiClient.createAssessment(dataToSave);
        console.log('✅ [ASSESSMENT SAVE] Create successful!');
        showToast('success', 'Success', dataToSave.published ? 'Assessment published successfully' : 'Assessment created as draft');
      }

      markAsSaved();
      onSave();
    } catch (error: any) {
      console.error('❌ [ASSESSMENT SAVE] Failed to save assessment:', error);
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

  const handleNext = () => {
    // Validate current step before moving forward
    if (currentStep === 0) {
      const isValid = validateForm(formData);
      if (!isValid) {
        showToast('error', 'Validation Error', 'Please complete all required fields');
        return;
      }
    }

    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = async () => {
    await handleSave();
  };

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
        subtitle="Follow the steps to create your assessment"
        status={
          formData.published
            ? { label: 'Published', variant: 'success' }
            : { label: 'Draft', variant: 'warning' }
        }
        primaryAction={{
          label: formData.published ? 'Unpublish' : 'Publish',
          icon: formData.published ? <EyeOff className="w-4 h-4" /> : <Upload className="w-4 h-4" />,
          onClick: () => handleSave(!formData.published),
          loading: saving
        }}
        secondaryActions={[
          // Button 1: Cancel
          {
            label: 'Cancel',
            icon: <X className="w-4 h-4" />,
            onClick: () => {
              if (hasUnsavedChanges) {
                setShowWarning(true);
              } else {
                onBack();
              }
            },
            variant: 'outline' as const
          },
          // Button 2: Delete (only show if editing existing assessment)
          ...(assessmentId
            ? [
                {
                  label: 'Delete',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => setIsDeleteDialogOpen(true),
                  variant: 'destructive' as const
                }
              ]
            : [
                {
                  label: 'Delete',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => {},
                  variant: 'ghost' as const,
                  disabled: true
                }
              ]),
          // Button 3: Save Draft
          {
            label: 'Save Draft',
            icon: <Save className="w-4 h-4" />,
            onClick: () => handleSave(false),
            variant: 'outline' as const
          }
        ]}
        toggleActions={[
          {
            label: 'Featured',
            checked: formData.featured || false,
            onChange: (checked) => setFormData({ ...formData, featured: checked })
          }
        ]}
        maxWidth="xl"
      >
        <WizardLayout
          steps={wizardSteps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onNext={handleNext}
          onFinish={handleFinish}
          isLoading={saving}
          finishButtonText={assessmentId ? 'Save Changes' : 'Create Assessment'}
        >
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-8">
              <div>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-base)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-2)'
                  }}
                >
                  Basic Information
                </h2>
                <p
                  style={{
                    fontSize: '15px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  Enter the core details for your assessment
                </p>
              </div>

              <div 
                className="space-y-6 p-6 rounded-xl"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB'
                }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <AdminFormField label="Title" required error={errors.title}>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Anxiety Self-Assessment"
                      style={{
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '15px'
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
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '15px'
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
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '15px'
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
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '15px'
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
                    className="min-h-[120px]"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      fontSize: '15px'
                    }}
                  />
                </AdminFormField>
              </div>

              <div 
                className="space-y-3 p-6 rounded-xl"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB'
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-base)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-2)'
                  }}
                >
                  Pricing & Paywall
                </h3>
                
                <div 
                  className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setFormData({ ...formData, is_paid: !formData.is_paid })}
                >
                  <Checkbox
                    id="is-paid"
                    checked={formData.is_paid}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked as boolean })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="is-paid" className="cursor-pointer" style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)' }}>
                      Enable Paywall
                    </Label>
                    <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>
                      Require payment to access this assessment
                    </p>
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
                        style={{
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '15px'
                        }}
                      />
                    </AdminFormField>

                    <AdminFormField label="Currency">
                      <Select
                        value={formData.price_currency || 'INR'}
                        onValueChange={(v: any) => setFormData({ ...formData, price_currency: v })}
                      >
                        <SelectTrigger
                          style={{
                            height: '48px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '15px'
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </AdminFormField>

                    <div className="md:col-span-2">
                      <Label style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', display: 'block' }}>
                        CTA Button Preview:
                      </Label>
                      <div 
                        className="p-3 bg-white border border-gray-200 rounded-md"
                        style={{
                          fontSize: '15px',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-primary-default)'
                        }}
                      >
                        {formData.price_currency === 'INR' && '₹'}
                        {formData.price_currency === 'USD' && '$'}
                        {formData.price_currency === 'EUR' && '€'}
                        {formData.price_currency === 'GBP' && '£'}
                        {formData.price_amount || '0'} - {formData.cta_button_text || 'Take Assessment'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Landing Page (Bento Grid Configuration) */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h2
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-base)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-2)'
                  }}
                >
                  Landing Page Content (Bento Grid)
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Configure the 5-tile layout. The grid automatically adapts for mobile/desktop.
                </p>
              </div>

              {/* Hero Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono">HERO</span>
                    <h3 className="text-lg font-medium text-gray-900">Hero Section</h3>
                </div>
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
              </div>

              {/* ROW 1: Tile 1 & Tile 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">ROW 1</span>
                    <h3 className="text-lg font-medium text-gray-900">Main Content & Visual</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* TILE 1: About (2/3 width) */}
                  <div className="lg:col-span-2 space-y-4 p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">TILE 1</span>
                        <h4 className="font-medium text-gray-900">About This Test</h4>
                    </div>
                    
                    <AdminFormField label="Title">
                      <Input
                        value={formData.section2_title || formData.about_title || ''}
                        onChange={(e) => setFormData({ ...formData, section2_title: e.target.value })}
                        placeholder="About this test"
                      />
                    </AdminFormField>
                    <AdminFormField label="Content (Rich Text)">
                      <RichTextEditor
                        value={formData.section2_content_html || formData.section2_content || ''}
                        onChange={(value) => setFormData({ 
                          ...formData, 
                          section2_content_html: value,
                          section2_content: value.replace(/<[^>]*>/g, '') 
                        })}
                        placeholder="Description of the assessment..."
                        minHeight="150px"
                      />
                    </AdminFormField>
                    <AdminFormField label="Key Details (Bullets)">
                      <Textarea
                        value={getArrayFieldString('section2_bullets')}
                        onChange={(e) => handleArrayFieldChange('section2_bullets', e.target.value)}
                        placeholder="Takes 5 minutes&#10;Clinically validated"
                        className="min-h-[80px]"
                      />
                    </AdminFormField>
                  </div>

                  {/* TILE 2: Visual (1/3 width) */}
                  <div className="space-y-4 p-5 rounded-xl border border-gray-200 bg-white shadow-sm h-fit">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">TILE 2</span>
                        <h4 className="font-medium text-gray-900">Visual Tile</h4>
                    </div>
                    
                    <AdminFormField label="Image (Decorative)">
                      <ImageUpload
                        value={formData.section2_image || formData.about_image || ''}
                        onChange={(url) => setFormData({ ...formData, section2_image: url })}
                        aspectRatio="video"
                      />
                    </AdminFormField>
                  </div>
                </div>
              </div>

              {/* ROW 2: Tile 3, 5, 4 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">ROW 2</span>
                    <h3 className="text-lg font-medium text-gray-900">Details & Notes</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* TILE 3: Who is this for */}
                  <div className="space-y-4 p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">TILE 3</span>
                        <h4 className="font-medium text-gray-900">Eligibility</h4>
                    </div>

                    <AdminFormField label="Title">
                      <Input
                        value={formData.section1_title || ''}
                        onChange={(e) => setFormData({ ...formData, section1_title: e.target.value })}
                        placeholder="Who is this test for?"
                      />
                    </AdminFormField>
                    <AdminFormField label="Subtitle">
                      <Input
                        value={formData.section1_eligibility_title || ''}
                        onChange={(e) => setFormData({ ...formData, section1_eligibility_title: e.target.value })}
                        placeholder="This may be helpful if you:"
                      />
                    </AdminFormField>
                    <AdminFormField label="Points (One per line)">
                      <Textarea
                        value={getArrayFieldString('section1_eligibility_points')}
                        onChange={(e) => handleArrayFieldChange('section1_eligibility_points', e.target.value)}
                        className="min-h-[100px]"
                        placeholder="Feel anxious often&#10;Have trouble sleeping"
                      />
                    </AdminFormField>
                    <AdminFormField label="Bottom Text (Optional)">
                      <Input
                        value={formData.section1_who_content || ''}
                        onChange={(e) => setFormData({ ...formData, section1_who_content: e.target.value })}
                        placeholder="Designed for adults 18+"
                      />
                    </AdminFormField>
                  </div>

                  {/* TILE 5: Things to Remember */}
                  <div className="space-y-4 p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">TILE 5</span>
                        <h4 className="font-medium text-gray-900">Important Notes</h4>
                    </div>

                    <AdminFormField label="Title">
                      <Input
                        value={formData.section4_notes_title || formData.notes_title || ''}
                        onChange={(e) => setFormData({ ...formData, section4_notes_title: e.target.value })}
                        placeholder="Things to remember"
                      />
                    </AdminFormField>
                    <AdminFormField label="Notes (One per line)">
                      <Textarea
                        value={getArrayFieldString('section4_notes')}
                        onChange={(e) => handleArrayFieldChange('section4_notes', e.target.value)}
                        className="min-h-[150px]"
                        placeholder="Not a diagnosis&#10;Confidential&#10;Free"
                      />
                    </AdminFormField>
                  </div>

                  {/* TILE 4: What You'll See */}
                  <div className="space-y-4 p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">TILE 4</span>
                        <h4 className="font-medium text-gray-900">Process</h4>
                    </div>

                    <AdminFormField label="Title">
                      <Input
                        value={formData.section3_title || formData.highlights_title || ''}
                        onChange={(e) => setFormData({ ...formData, section3_title: e.target.value })}
                        placeholder="What you'll see"
                      />
                    </AdminFormField>
                    <AdminFormField label="Subtitle">
                      <Input
                        value={formData.section3_subtitle || ''}
                        onChange={(e) => setFormData({ ...formData, section3_subtitle: e.target.value })}
                        placeholder="Understanding is step 1"
                      />
                    </AdminFormField>
                    <AdminFormField label="Steps/Points (One per line)">
                      <Textarea
                        value={getArrayFieldString('section3_content')}
                        onChange={(e) => handleArrayFieldChange('section3_content', e.target.value)}
                        className="min-h-[100px]"
                        placeholder="Answer 7 questions&#10;Get instant results"
                      />
                    </AdminFormField>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Step 3: Questions */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    style={{
                      fontSize: '24px',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-base)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-2)'
                    }}
                  >
                    Assessment Questions
                  </h2>
                  <p
                    style={{
                      fontSize: '15px',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-regular)',
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    Create questions that will help assess the user's mental health status
                  </p>
                </div>
                <Button
                  onClick={addQuestion}
                  style={{
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    gap: 'var(--spacing-2)',
                    paddingLeft: 'var(--spacing-5)',
                    paddingRight: 'var(--spacing-5)',
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'white',
                    fontWeight: 'var(--font-weight-medium)',
                    fontSize: '15px'
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-3">
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
                  <div
                    className="text-center py-16"
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 'var(--radius-lg)',
                      border: '2px dashed #E5E7EB'
                    }}
                  >
                    <div
                      className="mx-auto mb-4"
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--spacing-4)'
                      }}
                    >
                      <HelpCircle
                        className="w-8 h-8"
                        style={{ color: '#9CA3AF' }}
                      />
                    </div>
                    <p 
                      style={{ 
                        fontSize: '16px', 
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family-base)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--spacing-2)'
                      }}
                    >
                      No questions yet
                    </p>
                    <p 
                      style={{ 
                        fontSize: '14px',
                        fontFamily: 'var(--font-family-base)', 
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-4)'
                      }}
                    >
                      Start building your assessment by adding your first question
                    </p>
                    <Button
                      onClick={addQuestion}
                      style={{
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        gap: 'var(--spacing-2)',
                        paddingLeft: 'var(--spacing-5)',
                        paddingRight: 'var(--spacing-5)',
                        backgroundColor: 'var(--color-primary-default)',
                        color: 'white',
                        fontWeight: 'var(--font-weight-medium)'
                      }}
                    >
                      <Plus className="w-5 h-5" />
                      Add First Question
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Scoring & Results */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-base)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-2)'
                  }}
                >
                  Scoring & Results
                </h2>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-base)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  Define how responses are scored and interpreted
                </p>
              </div>

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
            </div>
          )}
        </WizardLayout>
        
        {/* WordPress-Style Action Bar */}
        <AdminActionBar
          onDelete={assessmentId ? handleDelete : undefined}
          onCancel={onBack}
          onSaveDraft={() => handleSave(false)}
          onPublish={() => handleSave(true)}
          isPublished={formData.published}
          isSaving={saving}
          showDelete={!!assessmentId}
          publishLabel={formData.published ? 'Update' : 'Save and Publish'}
        />
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