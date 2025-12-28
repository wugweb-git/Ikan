import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, GripVertical, X, FileText, BookOpen, Calendar, LayoutList, Award, ChevronUp, ChevronDown, Image as ImageIcon, Upload, EyeOff } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminPageLayout } from '../admin/AdminPageLayout';
import { AdminFormField } from '../admin/AdminFormField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ImageUpload } from '../ui/image-upload';
import { RichTextEditor } from '../ui/rich-text-editor';
import { WizardLayout } from '../ui/wizard-layout';
import { WizardStep } from '../ui/wizard-stepper';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { AdminActionBar } from '../ui/admin-action-bar';

interface ConditionalLogic {
  show_if_question_id: string; // Which question triggers this
  show_if_answer: string | string[]; // Answer(s) that trigger display
}

interface OnboardingQuestion {
  id: string;
  order: number; // For drag-and-drop ordering
  question: string;
  helper_text?: string; // Reassurance text below question
  
  // Input Configuration
  type: 'single_select' | 'multi_select' | 'text' | 'textarea';
  options?: string[]; // For select types
  
  // User Options
  allow_skip: boolean; // Show "Skip" button
  allow_prefer_not_to_answer: boolean; // Show "Prefer not to answer" option
  
  // Validation
  required: boolean; // Block continuation if not answered
  max_selections?: number; // For multi_select only
  character_limit?: number; // For text/textarea
  
  // Conditional Logic
  conditional?: ConditionalLogic; // Show only if another question matches
  
  // Privacy & Data Classification
  privacy_level: 'general' | 'sensitive' | 'health'; // Data sensitivity
  storage_scope: 'equip-only' | 'profile'; // Where data lives
  editable_later: boolean; // Can user change this after submission?
  
  // UI
  placeholder?: string;
}

interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'boolean' | 'rtf' | 'date';
  editable?: boolean;
}

interface TableRow {
  id: string;
  values: Record<string, any>;
  readonly?: boolean;
}

interface ExerciseConfig {
  subtype?: 'multi-select' | 'single-select' | 'mcq' | 'table' | 'ephemeral-journal' | 'structured-list';
  prompt?: string;
  options?: string[]; // For multi-select, single-select, MCQ
  correctAnswer?: string | string[]; // For MCQ
  allCorrect?: boolean; // For "all options are valid" MCQs
  tableColumns?: TableColumn[]; // For structured tables
  tableRows?: TableRow[]; // Pre-filled rows
  maxEntries?: number; // Max rows/items
  autoDelete?: number; // Hours until auto-delete (for ephemeral journals)
  progressive?: boolean; // If this continues from a previous data_id
  listItems?: string[]; // For structured lists
  editable?: boolean; // If preset items can be edited
}

interface Activity {
  id: string;
  title: string;
  type: 'lesson' | 'exercise' | 'journal' | 'checklist' | 'reflection' | 'conclude';
  content: string;
  duration: number; // in minutes
  required: boolean;
  data_id?: string; // i01-i12 for data mapping (can include + for progressive)
  order: number; // explicit ordering
  exerciseConfig?: ExerciseConfig; // Configuration for exercise blocks
  image_url?: string; // Block-level image (optional)
}

interface DayContent {
  day: number;
  title: string;
  description: string;
  activities: Activity[];
  image_url?: string; // Day-level hero image (optional)
}

interface WeekStructure {
  week: number;
  title: string;
  description: string;
  focus: string;
  days: number[]; // Array of day numbers in this week
}

export interface EquipProgram {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  category: 'anxiety' | 'depression' | 'stress' | 'resilience' | 'mindfulness' | 'other';
  tags?: string[];
  duration?: number; // total days (system-generated based on content)
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // system-generated
  
  // Step 1: Basic Info (with image upload/URL)
  thumbnail?: string;
  cover_image?: string;
  thumbnail_url?: string; // URL alternative
  cover_image_url?: string; // URL alternative
  hero_image?: string; // Cover image for hero (Step 1)
  cta_button_text?: string; // CTA button text (Step 1)
  cta_button_link?: string; // CTA button link (Step 1)
  
  // Step 2: NEW 4-Section Landing Page Structure
  // Section 1: Is This For You?
  section1_title?: string;
  section1_eligibility_title?: string;
  section1_eligibility_points?: string[];
  section1_who_title?: string;
  section1_who_content?: string;
  
  // Section 2: What is Sleep Tight?
  section2_title?: string;
  section2_content?: string; // Multi-paragraph (split by \n)
  section2_content_html?: string; // NEW: HTML content
  section2_bullets?: string[];
  section2_image?: string;
  
  // Section 3: How It Works
  section3_title?: string;
  section3_subtitle?: string;
  section3_content?: string[];
  section3_content_html?: string; // NEW: HTML content
  
  // Section 4: What You'll Gain & Important Notes
  section4_benefits_title?: string;
  section4_benefits?: Array<{ title: string; description: string }>;
  section4_notes_title?: string;
  section4_notes?: Array<{ title: string; description: string }>;
  
  // DEPRECATED: Old Step 2 fields (keeping for backward compatibility)
  overview_title?: string;
  overview_description?: string;
  overview_benefits?: string[];
  what_youll_learn?: string[];
  hero_title?: string;
  hero_subtitle?: string;
  what_title?: string;
  what_content?: string;
  why_title?: string;
  why_content?: string;
  why_points?: string[];
  benefits_title?: string;
  benefits_list?: string[];
  remember_title?: string;
  remember_points?: string[];
  
  // Program Details
  time_commitment?: string; // e.g., "15-30 mins/day"
  access_period?: string; // e.g., "6 months"
  total_modules?: number;
  total_exercises?: number;
  total_assessments?: number;
  
  // Instructor Info
  instructor_name?: string;
  instructor_credentials?: string;
  instructor_bio?: string;
  instructor_photo?: string;
  
  // FAQ
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  
  // Step 3: Onboarding (User Intake)
  onboarding_questions?: OnboardingQuestion[];
  onboarding_estimated_duration?: number; // in minutes
  
  // Step 4: Daily Program Builder
  week_structure?: WeekStructure[]; // Keep for backward compatibility
  daily_content?: DayContent[];
  can_repeat?: boolean;
  
  // Pricing
  price_amount?: string;
  price_currency?: string;
  price_description?: string;
  is_paid?: boolean;
  
  // Publishing
  published: boolean;
  published_at?: string;
  featured?: boolean;
  enrollment_count?: number;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
}

interface EquipProgramEditPageWizardProps {
  programId?: string;
  onBack: () => void;
  onSave: () => void;
}

const categoryOptions = [
  { value: 'anxiety', label: 'Anxiety Management' },
  { value: 'depression', label: 'Depression Support' },
  { value: 'stress', label: 'Stress Reduction' },
  { value: 'resilience', label: 'Building Resilience' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'other', label: 'Other' }
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const activityTypeOptions = [
  { value: 'lesson', label: '📚 Lesson - Psychoeducation' },
  { value: 'exercise', label: '✏️ Exercise - Structured Interaction' },
  { value: 'journal', label: '📝 Journal - Free Writing (Ephemeral)' },
  { value: 'checklist', label: '☑️ Checklist - Habits Tracking' },
  { value: 'reflection', label: '💭 Reflection - Wrap-up' },
  { value: 'conclude', label: '🎯 Conclude - Closure Message' }
];

const questionTypeOptions = [
  { value: 'single_select', label: '⚪ Single Select - One answer only' },
  { value: 'multi_select', label: '☑️ Multi-Select - Multiple answers allowed' },
  { value: 'text', label: '📝 Short Text - Brief response' },
  { value: 'textarea', label: '📄 Long Text - Detailed response' }
];

export function EquipProgramEditPageWizard({ programId, onBack, onSave }: EquipProgramEditPageWizardProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!programId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0); // For Step 4 day navigator

  const [formData, setFormData] = useState<Partial<EquipProgram>>({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    category: 'mindfulness',
    tags: [],
    duration: undefined, // System-generated
    difficulty: undefined, // System-generated
    thumbnail: '',
    cover_image: '',
    thumbnail_url: '',
    cover_image_url: '',
    overview_title: 'Program Overview',
    overview_description: '',
    overview_benefits: [],
    what_youll_learn: [],
    time_commitment: '15-30 mins/day',
    access_period: '6 months',
    total_modules: 0,
    total_exercises: 0,
    total_assessments: 0,
    instructor_name: '',
    instructor_credentials: '',
    instructor_bio: '',
    instructor_photo: '',
    faq: [],
    onboarding_questions: [],
    onboarding_estimated_duration: 10,
    week_structure: [],
    daily_content: [],
    can_repeat: true,
    price_amount: '',
    price_currency: 'INR',
    price_description: '',
    is_paid: false,
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
      maxLength: 150,
      message: 'Description must be between 20 and 150 characters'
    }
  };

  const { errors, validateForm } = useFormValidation(validationSchema);
  const { hasUnsavedChanges, markAsSaved, markAsUnsaved, setShowWarning, showWarning } = useUnsavedChanges();

  const handleArrayFieldChange = (field: keyof EquipProgram, value: string) => {
    setFormData({
      ...formData,
      [field]: value.split('\n').filter(line => line.trim() !== '')
    });
  };

  const getArrayFieldString = (field: keyof EquipProgram) => {
    const val = formData[field];
    return Array.isArray(val) ? val.join('\n') : '';
  };

  useEffect(() => {
    if (formData.title || formData.description) {
      markAsUnsaved();
    }
  }, [formData]);

  useEffect(() => {
    if (programId) {
      loadProgram();
    } else {
      // Initialize with empty structure
      generateWeekStructure(30);
      generateDailyContent(30);
    }
  }, [programId]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEquipProgram(programId!);
      
      // 🐛 FIX: Merge with default structure instead of replacing
      // This prevents data loss when reloading
      console.log('📥 [LOAD] Program data from server:', data);
      
      setFormData(prev => ({
        ...prev, // Keep the default structure
        ...data, // Merge with server data
        // Ensure arrays are preserved
        onboarding_questions: data.onboarding_questions || prev.onboarding_questions || [],
        week_structure: data.week_structure || prev.week_structure || [],
        daily_content: data.daily_content || prev.daily_content || [],
        faq: data.faq || prev.faq || [],
        tags: data.tags || prev.tags || [],
        
        // Ensure Step 2 arrays are preserved correctly
        section1_eligibility_points: data.section1_eligibility_points || prev.section1_eligibility_points || [],
        section2_bullets: data.section2_bullets || prev.section2_bullets || [],
        section2_content_html: data.section2_content_html || prev.section2_content_html,
        section3_content: data.section3_content || prev.section3_content || [],
        section3_content_html: data.section3_content_html || prev.section3_content_html,
        section4_benefits: data.section4_benefits || prev.section4_benefits || [],
        section4_notes: data.section4_notes || prev.section4_notes || [],
        
        // DEPRECATED but kept for safety
        overview_benefits: data.overview_benefits || prev.overview_benefits || [],
        what_youll_learn: data.what_youll_learn || prev.what_youll_learn || []
      }));
      
      console.log('✅ [LOAD] Program loaded successfully');
    } catch (error) {
      console.error('Failed to load program:', error);
      showToast({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Failed to load program',
        message: 'Could not load program data',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWeekStructure = (totalDays: number) => {
    const weeks: WeekStructure[] = [];
    const totalWeeks = Math.ceil(totalDays / 7);
    
    for (let i = 0; i < totalWeeks; i++) {
      const startDay = i * 7 + 1;
      const endDay = Math.min((i + 1) * 7, totalDays);
      const days = Array.from({ length: endDay - startDay + 1 }, (_, idx) => startDay + idx);
      
      weeks.push({
        week: i + 1,
        title: `Week ${i + 1}`,
        description: '',
        focus: '',
        days
      });
    }
    
    setFormData(prev => ({ ...prev, week_structure: weeks }));
  };

  const generateDailyContent = (totalDays: number) => {
    const days: DayContent[] = [];
    
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        title: `Day ${i}`,
        description: '',
        activities: []
      });
    }
    
    setFormData(prev => ({ ...prev, daily_content: days }));
  };

  const updateDuration = (newDuration: number) => {
    if (newDuration >= 30 && newDuration <= 35) {
      setFormData(prev => ({ ...prev, duration: newDuration }));
      generateWeekStructure(newDuration);
      generateDailyContent(newDuration);
    }
  };

  const addOnboardingQuestion = () => {
    const existingQuestions = formData.onboarding_questions || [];
    const newQuestion: OnboardingQuestion = {
      id: `q-${Date.now()}`,
      order: existingQuestions.length,
      question: '',
      helper_text: '',
      type: 'single_select',
      options: [],
      allow_skip: true,
      allow_prefer_not_to_answer: true,
      required: false,
      privacy_level: 'general',
      storage_scope: 'equip-only',
      editable_later: true,
      placeholder: ''
    };
    setFormData({
      ...formData,
      onboarding_questions: [...existingQuestions, newQuestion]
    });
  };

  const updateOnboardingQuestion = (id: string, updates: Partial<OnboardingQuestion>) => {
    setFormData({
      ...formData,
      onboarding_questions: (formData.onboarding_questions || []).map((q) =>
        q.id === id ? { ...q, ...updates } : q
      )
    });
  };

  const deleteOnboardingQuestion = (id: string) => {
    setFormData({
      ...formData,
      onboarding_questions: (formData.onboarding_questions || []).filter((q) => q.id !== id)
    });
  };

  const updateWeekStructure = (week: number, updates: Partial<WeekStructure>) => {
    setFormData({
      ...formData,
      week_structure: (formData.week_structure || []).map((w) =>
        w.week === week ? { ...w, ...updates } : w
      )
    });
  };

  const addActivity = (day: number) => {
    const targetDay = (formData.daily_content || []).find(d => d.day === day);
    const nextOrder = targetDay ? targetDay.activities.length : 0;
    
    const newActivity: Activity = {
      id: `block_${Date.now()}`,
      title: '',
      type: 'lesson', // Default to lesson block
      content: '',
      duration: 10,
      required: true,
      order: nextOrder,
      data_id: '' // Can be assigned i01-i12
    };
    
    setFormData({
      ...formData,
      daily_content: (formData.daily_content || []).map((d) =>
        d.day === day ? { ...d, activities: [...d.activities, newActivity] } : d
      )
    });
  };

  const updateActivity = (day: number, activityId: string, updates: Partial<Activity>) => {
    setFormData({
      ...formData,
      daily_content: (formData.daily_content || []).map((d) =>
        d.day === day
          ? {
              ...d,
              activities: d.activities.map((a) => (a.id === activityId ? { ...a, ...updates } : a))
            }
          : d
      )
    });
  };

  const deleteActivity = (day: number, activityId: string) => {
    setFormData({
      ...formData,
      daily_content: (formData.daily_content || []).map((d) =>
        d.day === day ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) } : d
      )
    });
  };

  const updateDayContent = (day: number, updates: Partial<DayContent>) => {
    setFormData({
      ...formData,
      daily_content: (formData.daily_content || []).map((d) =>
        d.day === day ? { ...d, ...updates } : d
      )
    });
  };

  const addFAQ = () => {
    setFormData({
      ...formData,
      faq: [...(formData.faq || []), { question: '', answer: '' }]
    });
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaq = [...(formData.faq || [])];
    updatedFaq[index][field] = value;
    setFormData({ ...formData, faq: updatedFaq });
  };

  const deleteFAQ = (index: number) => {
    setFormData({
      ...formData,
      faq: (formData.faq || []).filter((_, i) => i !== index)
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
      id: 'detail',
      title: 'Equip Details',
      subtitle: currentStep === 1 ? 'In progress' : currentStep > 1 ? 'Finished' : 'Waiting',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming'
    },
    {
      id: 'onboarding',
      title: 'Onboarding (User Intake)',
      subtitle: `${(formData.onboarding_questions || []).length} questions`,
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming'
    },
    {
      id: 'daily',
      title: 'Daily Program Builder',
      subtitle: `${(formData.daily_content || []).length} days configured`,
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'upcoming'
    }
  ];

  const handleNext = () => {
    if (currentStep === 0) {
      const isValid = validateForm(formData);
      if (!isValid) {
        showToast({
          id: `validation-${Date.now()}`,
          type: 'error',
          title: 'Validation Error',
          message: 'Please complete all required fields before continuing',
          duration: 5000
        });
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

  const handleSave = async (shouldPublish?: boolean) => {
    const isValid = validateForm(formData);
    if (!isValid) {
      showToast({
        id: `validation-${Date.now()}`,
        type: 'error',
        title: 'Validation Error',
        message: 'Please complete all required fields before saving',
        duration: 5000
      });
      return;
    }

    try {
      setSaving(true);

      const dataToSave = { ...formData };
      
      // 🐛 DEBUG: Log what we're saving
      console.log('📤 [EQUIP SAVE] Starting save operation...');
      console.log('📤 [EQUIP SAVE] Program ID:', programId);
      console.log('📤 [EQUIP SAVE] Should Publish:', shouldPublish);
      console.log('📤 [EQUIP SAVE] Title:', dataToSave.title);
      console.log('📤 [EQUIP SAVE] Thumbnail:', dataToSave.thumbnail);
      console.log('📤 [EQUIP SAVE] Description:', dataToSave.description);
      console.log('📤 [EQUIP SAVE] Full Data:', JSON.stringify(dataToSave, null, 2));
      
      // Handle publish/unpublish
      if (shouldPublish !== undefined) {
        dataToSave.published = shouldPublish;
        if (shouldPublish) {
          dataToSave.published_at = new Date().toISOString();
        }
      }
      
      if (programId) {
        console.log('📤 [EQUIP SAVE] Calling updateEquipProgram...');
        await apiClient.updateEquipProgram(programId, dataToSave);
        console.log('✅ [EQUIP SAVE] Update successful!');
        showToast({
          id: `save-${Date.now()}`,
          type: 'success',
          title: 'Program Updated',
          message: dataToSave.published ? 'Program published successfully' : 'Program saved as draft',
          duration: 3000
        });
      } else {
        console.log('📤 [EQUIP SAVE] Calling createEquipProgram...');
        await apiClient.createEquipProgram(dataToSave);
        console.log('✅ [EQUIP SAVE] Create successful!');
        showToast({
          id: `create-${Date.now()}`,
          type: 'success',
          title: 'Program Created',
          message: dataToSave.published ? 'Program published successfully' : 'Program created as draft',
          duration: 3000
        });
      }
      
      markAsSaved();
      onSave();
    } catch (error) {
      console.error('❌ [EQUIP SAVE] Failed to save program:', error);
      showToast({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save program. Please try again.',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!programId) return;
    
    try {
      await apiClient.deleteEquipProgram(programId);
      showToast({
        id: `delete-${Date.now()}`,
        type: 'success',
        title: 'Program Deleted',
        message: 'Equip program has been deleted',
        duration: 3000
      });
      onSave();
    } catch (error) {
      console.error('Failed to delete program:', error);
      showToast({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not delete program',
        duration: 5000
      });
    }
  };

  if (loading) {
    return (
      <AdminPageLayout
        title="Loading..."
        actions={[]}
        onBack={onBack}
      >
        <div className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <>
      <AdminPageLayout
        title={programId ? formData.title || 'Edit Equip Program' : 'New Equip Program'}
        subtitle="Follow the steps to create your program"
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
          // Button 2: Delete (only show if editing existing program)
          ...(programId
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
            icon: <FileText className="w-4 h-4" />,
            onClick: () => handleSave(false),
            variant: 'outline' as const
          }
        ]}
        toggleActions={[
          {
            label: 'Featured',
            checked: formData.featured || false,
            onChange: (checked) => setFormData({ ...formData, featured: checked })
          },
          {
            label: 'Can Repeat',
            checked: formData.can_repeat || false,
            onChange: (checked) => setFormData({ ...formData, can_repeat: checked })
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
          finishButtonText={programId ? 'Save Changes' : 'Create Program'}
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
                    marginBottom: 'var(--spacing-6)'
                  }}
                >
                  Basic Information
                </h2>

                <div className="space-y-6">
                  <AdminFormField
                    label="Program Title"
                    description="This title will appear in cards and the hero section"
                    required
                    error={errors.title}
                  >
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., 30-Day Anxiety Relief Program"
                    />
                  </AdminFormField>

                  <AdminFormField
                    label="Description"
                    description="Brief description (max 150 characters) - appears in cards and hero section"
                    required
                    error={errors.description}
                  >
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what this program offers..."
                      rows={3}
                      maxLength={150}
                    />
                    <div className="text-right mt-1">
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>
                        {formData.description?.length || 0}/150 characters
                      </span>
                    </div>
                  </AdminFormField>

                  <AdminFormField
                    label="Category / Prefix"
                    description="This will be used as the program prefix"
                    required
                  >
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AdminFormField>

                  {/* Single merged image field */}
                  <div className="space-y-4">
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family-base)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      Cover Image
                    </h3>

                    <AdminFormField
                      label="Program Cover Image"
                      description="This image will be used as both the card thumbnail and hero cover image"
                    >
                      <ImageUpload
                        value={formData.cover_image || formData.thumbnail || ''}
                        onChange={(value) => setFormData({ 
                          ...formData, 
                          cover_image: value, 
                          thumbnail: value // Keep both in sync
                        })}
                        placeholder="Upload cover image"
                      />
                      <div className="mt-2">
                        <Input
                          value={formData.cover_image_url || formData.thumbnail_url || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            cover_image_url: e.target.value,
                            thumbnail_url: e.target.value // Keep both in sync
                          })}
                          placeholder="Or enter image URL"
                        />
                      </div>
                    </AdminFormField>

                    <div 
                      className="p-3 rounded-lg"
                      style={{ 
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE'
                      }}
                    >
                      <p style={{ fontSize: '13px', color: '#1E40AF' }}>
                        💡 <strong>Note:</strong> Duration (minutes) and difficulty level are auto-generated based on program content.
                      </p>
                    </div>
                  </div>

                  {/* CTA Button Configuration - REMOVED as not needed */}
                  
                  {/* Pricing & Paywall section */}
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
                          Require payment to access this program
                        </p>
                      </div>
                    </div>

                    {formData.is_paid && (
                      <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <AdminFormField label="Price Amount" required>
                          <Input
                            type="number"
                            value={formData.price_amount || ''}
                            onChange={(e) => setFormData({ ...formData, price_amount: e.target.value })}
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
                            {formData.price_amount || '0'} - Start Program
                          </div>
                        </div>
                      </div>
                    )}
                  </div>


                </div>
              </div>
            </div>
          )}

          {/* Step 2: Equip Detail (Landing Page) */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-base)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-6)'
                  }}
                >
                  Landing Page Details
                </h2>

                <div className="space-y-6">
                  {/* SECTION 1: IS THIS FOR YOU? */}
                  <div className="space-y-4"
                    style={{
                      padding: 'var(--spacing-6)',
                      borderRadius: 'var(--radius-lg)',
                      border: '2px solid #E5E7EB',
                      backgroundColor: '#F0F9FF'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '18px' }}>👤</span>
                      </div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-family-base)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        Section 1: Is This For You?
                      </h3>
                    </div>

                    <AdminFormField
                      label="Section Title"
                      description="Main section heading"
                    >
                      <Input
                        value={formData.section1_title || ''}
                        onChange={(e) => setFormData({ ...formData, section1_title: e.target.value })}
                        placeholder="Is This For You?"
                      />
                    </AdminFormField>

                    <AdminFormField
                      label="Eligibility Title"
                      description="Intro text for eligibility list"
                    >
                      <Input
                        value={formData.section1_eligibility_title || ''}
                        onChange={(e) => setFormData({ ...formData, section1_eligibility_title: e.target.value })}
                        placeholder="Sleep Tight may be right for you if:"
                      />
                    </AdminFormField>

                    <AdminFormField
                      label="Eligibility Points"
                      description="List eligibility criteria (one per line)"
                    >
                      <Textarea
                        value={getArrayFieldString('section1_eligibility_points')}
                        onChange={(e) => handleArrayFieldChange('section1_eligibility_points', e.target.value)}
                        placeholder="You have trouble falling asleep or staying asleep&#10;You wake up too early and struggle to fall back asleep&#10;You find yourself constantly worrying about your sleep&#10;Your sleep troubles are starting to interfere with your day-to-day life"
                        rows={6}
                      />
                    </AdminFormField>

                    <AdminFormField
                      label="Who Can Participate Title"
                      description="Title for who can participate section"
                    >
                      <Input
                        value={formData.section1_who_title || ''}
                        onChange={(e) => setFormData({ ...formData, section1_who_title: e.target.value })}
                        placeholder="Who can participate"
                      />
                    </AdminFormField>

                    <AdminFormField
                      label="Who Can Participate Content"
                      description="Description of who should participate"
                    >
                      <Textarea
                        value={formData.section1_who_content || ''}
                        onChange={(e) => setFormData({ ...formData, section1_who_content: e.target.value })}
                        placeholder="This program is designed for adults who want to improve their sleep.&#10;If you're currently managing other mental health concerns, we recommend checking in with a qualified healthcare professional before starting."
                        rows={3}
                      />
                    </AdminFormField>
                  </div>

                  {/* SECTION 2: WHAT IS [PROGRAM]? */}
                  <div className="space-y-4"
                    style={{
                      padding: 'var(--spacing-6)',
                      borderRadius: 'var(--radius-lg)',
                      border: '2px solid #E5E7EB',
                      backgroundColor: '#F9FAFB'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '18px' }}>📖</span>
                      </div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-family-base)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        Section 2: What Is Sleep Tight? (ContextBlock)
                      </h3>
                    </div>
                    
                    <AdminFormField label="Section Title" description="Main heading for this section">
                      <Input
                        value={formData.section2_title || ''}
                        onChange={(e) => setFormData({ ...formData, section2_title: e.target.value })}
                        placeholder="Sleep Tight: The road to restful sleep"
                      />
                    </AdminFormField>

                    <AdminFormField label="Content" description="Description (Rich text supported)">
                      <RichTextEditor
                        value={formData.section2_content_html || formData.section2_content || ''}
                        onChange={(value) => setFormData({ 
                          ...formData, 
                          section2_content_html: value,
                          section2_content: value.replace(/<[^>]*>/g, '') // Keep plain text sync for backward compat if needed, or just relying on HTML
                        })}
                        placeholder="Having trouble sleeping? Sleep Tight by I-Kan Equip is a guided, self-help program designed to help you understand and improve your sleep."
                        minHeight="200px"
                      />
                    </AdminFormField>

                    <AdminFormField label="Program Includes (Bullets)" description="List what the program includes (one per line)">
                      <Textarea
                        value={getArrayFieldString('section2_bullets')}
                        onChange={(e) => handleArrayFieldChange('section2_bullets', e.target.value)}
                        placeholder="A structured 18-day journey that fits into your daily routine&#10;Sleep, mood, and habit trackers to help you notice patterns and triggers&#10;Science-backed techniques, including CBT (Cognitive Behavioral Therapy) and other clinically proven approaches"
                        rows={5}
                      />
                    </AdminFormField>

                    <AdminFormField label="Image URL" description="Image to display alongside content (Left Side)">
                      <Input
                        value={formData.section2_image || ''}
                        onChange={(e) => setFormData({ ...formData, section2_image: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                    </AdminFormField>
                  </div>

                  {/* SECTION 3: HOW IT WORKS */}
                  <div className="space-y-4"
                    style={{
                      padding: 'var(--spacing-6)',
                      borderRadius: 'var(--radius-lg)',
                      border: '2px solid #E5E7EB',
                      backgroundColor: '#F0FDF4'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '18px' }}>⚙️</span>
                      </div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-family-base)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        Section 3: How It Works
                      </h3>
                    </div>
                    
                    <AdminFormField label="Section Title" description="Main heading">
                      <Input
                        value={formData.section3_title || ''}
                        onChange={(e) => setFormData({ ...formData, section3_title: e.target.value })}
                        placeholder="How It Works"
                      />
                    </AdminFormField>

                    <AdminFormField label="Subtitle" description="Optional subtitle">
                      <Input
                        value={formData.section3_subtitle || ''}
                        onChange={(e) => setFormData({ ...formData, section3_subtitle: e.target.value })}
                        placeholder="What to expect"
                      />
                    </AdminFormField>

                    <AdminFormField label="Content" description="Explanation (Rich text supported)">
                      <RichTextEditor
                        value={formData.section3_content_html || (Array.isArray(formData.section3_content) ? formData.section3_content.join('\n') : '')}
                        onChange={(value) => setFormData({ 
                          ...formData, 
                          section3_content_html: value,
                          // Don't sync back to array as it's hard to parse HTML back to clean paragraphs
                        })}
                        placeholder="We'll approach sleep in two simple stages..."
                        minHeight="200px"
                      />
                    </AdminFormField>
                  </div>

                  {/* SECTION 4: WHAT YOU'LL GAIN & IMPORTANT NOTES */}
                  <div className="space-y-4"
                    style={{
                      padding: 'var(--spacing-6)',
                      borderRadius: 'var(--radius-lg)',
                      border: '2px solid #E5E7EB',
                      backgroundColor: '#FEF3C7'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '18px' }}>🎁</span>
                      </div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-family-base)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        Section 4: What You'll Gain (Benefits Grid & Important Notes)
                      </h3>
                    </div>
                    
                    <AdminFormField label="Benefits Title" description="Heading for benefits section">
                      <Input
                        value={formData.section4_benefits_title || ''}
                        onChange={(e) => setFormData({ ...formData, section4_benefits_title: e.target.value })}
                        placeholder="What You'll Gain"
                      />
                    </AdminFormField>

                    <AdminFormField 
                      label="Benefits Grid (4 cards)" 
                      description="Add benefit cards (format: 'Title | Description' one per line)"
                    >
                      <Textarea
                        value={(formData.section4_benefits || []).map((b: any) => `${b.title} | ${b.description}`).join('\n')}
                        onChange={(e) => {
                          const benefits = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                            const [title, description] = line.split('|').map(s => s.trim());
                            return { title: title || '', description: description || '' };
                          });
                          setFormData({ ...formData, section4_benefits: benefits });
                        }}
                        placeholder="Understand your sleep better | Identify patterns and root causes behind your sleep difficulties.&#10;Manage the thoughts keeping you awake | Learn how to respond to worries and racing thoughts at bedtime.&#10;Build sleep-friendly habits | Create routines that naturally support better sleep.&#10;Develop tools you can reuse | Practice strategies you can return to whenever sleep feels difficult."
                        rows={6}
                      />
                    </AdminFormField>

                    <AdminFormField label="Notes Title" description="Heading for important notes">
                      <Input
                        value={formData.section4_notes_title || ''}
                        onChange={(e) => setFormData({ ...formData, section4_notes_title: e.target.value })}
                        placeholder="Important Notes"
                      />
                    </AdminFormField>

                    <AdminFormField 
                      label="Important Notes Panel (3 cards)" 
                      description="Add note cards (format: 'Title | Description' one per line)"
                    >
                      <Textarea
                        value={(formData.section4_notes || []).map((b: any) => `${b.title} | ${b.description}`).join('\n')}
                        onChange={(e) => {
                          const notes = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                            const [title, description] = line.split('|').map(s => s.trim());
                            return { title: title || '', description: description || '' };
                          });
                          setFormData({ ...formData, section4_notes: notes });
                        }}
                        placeholder="Consistency matters | This is an 18-day program. Spending a few minutes each day — before bed or after waking — helps you get the most out of it.&#10;This is a self-help tool | I-Kan Equip focuses on building skills to manage distress. It does not claim to cure mental health conditions.&#10;Support is always okay | If you feel overwhelmed at any point, we strongly encourage speaking with a mental health professional."
                        rows={6}
                      />
                    </AdminFormField>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Onboarding Questions */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2
                    style={{
                      fontSize: '24px',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-base)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    Onboarding Questions
                  </h2>
                  <Button onClick={addOnboardingQuestion} variant="outline" className="gap-2">
                    <Plus size={16} />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-6">
                  <AdminFormField
                    label="Estimated Duration"
                    description="How long onboarding should take (in minutes)"
                  >
                    <Input
                      type="number"
                      value={formData.onboarding_estimated_duration || ''}
                      onChange={(e) => setFormData({ ...formData, onboarding_estimated_duration: parseInt(e.target.value) })}
                      placeholder="10"
                    />
                  </AdminFormField>

                  {(formData.onboarding_questions || []).length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
                      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                        No questions yet
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                        Add questions to collect information during onboarding
                      </p>
                      <Button onClick={addOnboardingQuestion} variant="outline" className="gap-2">
                        <Plus size={16} />
                        Add First Question
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(formData.onboarding_questions || []).map((question, index) => (
                        <Card key={question.id}>
                          <CardContent className="pt-6 space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}
                                >
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
                                    Question {index + 1}
                                  </h4>
                                  {question.conditional && (
                                    <span style={{ fontSize: '12px', color: '#8B5CF6' }}>
                                      ⚡ Conditional
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={() => deleteOnboardingQuestion(question.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <X size={14} />
                              </Button>
                            </div>

                            {/* Question Text */}
                            <AdminFormField label="Question Text" required>
                              <Input
                                value={question.question}
                                onChange={(e) => updateOnboardingQuestion(question.id, { question: e.target.value })}
                                placeholder="e.g., What do you do for a living?"
                              />
                            </AdminFormField>

                            {/* Helper Text */}
                            <AdminFormField label="Helper Text (Optional)" description="Reassurance text shown below the question">
                              <Input
                                value={question.helper_text || ''}
                                onChange={(e) => updateOnboardingQuestion(question.id, { helper_text: e.target.value })}
                                placeholder="e.g., This helps us tailor the program to your schedule"
                              />
                            </AdminFormField>

                            {/* Input Type */}
                            <AdminFormField label="Input Type" required>
                              <Select
                                value={question.type}
                                onValueChange={(value: any) => updateOnboardingQuestion(question.id, { type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {questionTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </AdminFormField>

                            {/* Options (for select types) */}
                            {(question.type === 'single_select' || question.type === 'multi_select') && (
                              <AdminFormField label="Answer Options" description="One option per line" required>
                                <Textarea
                                  value={(question.options || []).join('\n')}
                                  onChange={(e) => updateOnboardingQuestion(question.id, { 
                                    options: e.target.value.split('\n').filter(o => o.trim() !== '') 
                                  })}
                                  placeholder="Office worker&#10;Student&#10;Self-employed&#10;Retired&#10;Prefer not to answer"
                                  rows={5}
                                />
                              </AdminFormField>
                            )}

                            {/* Placeholder (for text types) */}
                            {(question.type === 'text' || question.type === 'textarea') && (
                              <AdminFormField label="Placeholder Text">
                                <Input
                                  value={question.placeholder || ''}
                                  onChange={(e) => updateOnboardingQuestion(question.id, { placeholder: e.target.value })}
                                  placeholder="e.g., Type here..."
                                />
                              </AdminFormField>
                            )}

                            {/* Validation & Limits */}
                            <div className="grid grid-cols-2 gap-4">
                              {question.type === 'multi_select' && (
                                <AdminFormField label="Max Selections">
                                  <Input
                                    type="number"
                                    value={question.max_selections || ''}
                                    onChange={(e) => updateOnboardingQuestion(question.id, { max_selections: parseInt(e.target.value) || undefined })}
                                    placeholder="Unlimited"
                                  />
                                </AdminFormField>
                              )}

                              {(question.type === 'text' || question.type === 'textarea') && (
                                <AdminFormField label="Character Limit">
                                  <Input
                                    type="number"
                                    value={question.character_limit || ''}
                                    onChange={(e) => updateOnboardingQuestion(question.id, { character_limit: parseInt(e.target.value) || undefined })}
                                    placeholder="No limit"
                                  />
                                </AdminFormField>
                              )}
                            </div>

                            {/* User Options */}
                            <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF', border: '1px solid #BFDBFE' }}>
                              <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: '#1E40AF' }}>
                                USER OPTIONS
                              </span>

                              <div className="grid grid-cols-3 gap-3">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`required-${question.id}`}
                                    checked={question.required}
                                    onCheckedChange={(checked) => updateOnboardingQuestion(question.id, { required: checked as boolean })}
                                  />
                                  <Label htmlFor={`required-${question.id}`} style={{ fontSize: '13px' }}>
                                    Required
                                  </Label>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`skip-${question.id}`}
                                    checked={question.allow_skip}
                                    onCheckedChange={(checked) => updateOnboardingQuestion(question.id, { allow_skip: checked as boolean })}
                                  />
                                  <Label htmlFor={`skip-${question.id}`} style={{ fontSize: '13px' }}>
                                    Allow Skip
                                  </Label>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`pnta-${question.id}`}
                                    checked={question.allow_prefer_not_to_answer}
                                    onCheckedChange={(checked) => updateOnboardingQuestion(question.id, { allow_prefer_not_to_answer: checked as boolean })}
                                  />
                                  <Label htmlFor={`pnta-${question.id}`} style={{ fontSize: '13px' }}>
                                    "Prefer not to answer"
                                  </Label>
                                </div>
                              </div>
                            </div>

                            {/* Conditional Logic */}
                            <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`conditional-${question.id}`}
                                  checked={!!question.conditional}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      updateOnboardingQuestion(question.id, { 
                                        conditional: { show_if_question_id: '', show_if_answer: '' } 
                                      });
                                    } else {
                                      updateOnboardingQuestion(question.id, { conditional: undefined });
                                    }
                                  }}
                                />
                                <Label htmlFor={`conditional-${question.id}`} style={{ fontSize: '13px', fontWeight: 'var(--font-weight-medium)' }}>
                                  ⚡ This is a conditional question
                                </Label>
                              </div>

                              {question.conditional && (
                                <div className="space-y-3 mt-3">
                                  <AdminFormField label="Show if question..." description="Select the question that triggers this">
                                    <Select
                                      value={question.conditional.show_if_question_id || ''}
                                      onValueChange={(value) => updateOnboardingQuestion(question.id, { 
                                        conditional: { ...question.conditional!, show_if_question_id: value } 
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select question..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(formData.onboarding_questions || [])
                                          .filter(q => q.id !== question.id && q.order < question.order)
                                          .map(q => (
                                            <SelectItem key={q.id} value={q.id}>
                                              Q{q.order + 1}: {q.question || 'Untitled'}
                                            </SelectItem>
                                          ))
                                        }
                                      </SelectContent>
                                    </Select>
                                  </AdminFormField>

                                  <AdminFormField label="...equals answer" description="Exact answer that triggers this question">
                                    <Input
                                      value={typeof question.conditional.show_if_answer === 'string' ? question.conditional.show_if_answer : ''}
                                      onChange={(e) => updateOnboardingQuestion(question.id, { 
                                        conditional: { ...question.conditional!, show_if_answer: e.target.value } 
                                      })}
                                      placeholder="e.g., Yes"
                                    />
                                  </AdminFormField>
                                </div>
                              )}
                            </div>

                            {/* Privacy & Data Classification */}
                            <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                              <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: '#991B1B' }}>
                                🔐 PRIVACY & DATA
                              </span>

                              <div className="grid grid-cols-3 gap-3">
                                <AdminFormField label="Privacy Level">
                                  <Select
                                    value={question.privacy_level}
                                    onValueChange={(value: any) => updateOnboardingQuestion(question.id, { privacy_level: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="general">General</SelectItem>
                                      <SelectItem value="sensitive">Sensitive</SelectItem>
                                      <SelectItem value="health">Health</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </AdminFormField>

                                <AdminFormField label="Storage Scope">
                                  <Select
                                    value={question.storage_scope}
                                    onValueChange={(value: any) => updateOnboardingQuestion(question.id, { storage_scope: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="equip-only">Equip Only</SelectItem>
                                      <SelectItem value="profile">Profile</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </AdminFormField>

                                <div className="flex items-center gap-2 pt-6">
                                  <Checkbox
                                    id={`editable-${question.id}`}
                                    checked={question.editable_later}
                                    onCheckedChange={(checked) => updateOnboardingQuestion(question.id, { editable_later: checked as boolean })}
                                  />
                                  <Label htmlFor={`editable-${question.id}`} style={{ fontSize: '13px' }}>
                                    Editable Later
                                  </Label>
                                </div>
                              </div>
                            </div>

                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Daily Program Builder */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2
                      style={{
                        fontSize: '24px',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family-base)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      Daily Program Builder
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                      Compose daily experiences using ordered blocks (Lesson, Exercise, Journal, Checklist, Reflection, Conclude)
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      const nextDay = (formData.daily_content || []).length + 1;
                      setFormData({
                        ...formData,
                        daily_content: [
                          ...(formData.daily_content || []),
                          {
                            day: nextDay,
                            title: `Day ${nextDay}`,
                            description: '',
                            activities: []
                          }
                        ]
                      });
                    }}
                    style={{
                      height: '44px',
                      gap: 'var(--spacing-2)',
                      paddingLeft: 'var(--spacing-5)',
                      paddingRight: 'var(--spacing-5)'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Day
                  </Button>
                </div>

                {(formData.daily_content || []).length === 0 ? (
                  <Card className="p-12 text-center" style={{ backgroundColor: '#F9FAFB' }}>
                    <LayoutList className="w-12 h-12 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
                    <p style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
                      No daily content yet
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                      Click "Add Day" to start creating lessons
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {(formData.daily_content || []).map((day, dayIndex) => (
                      <Card key={day.day} style={{ borderLeft: '4px solid #10B981' }}>
                        <CardContent className="pt-6">
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: '#D1FAE5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'var(--font-weight-medium)',
                                  fontSize: '18px',
                                  color: '#065F46'
                                }}
                              >
                                {day.day}
                              </div>
                              <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>
                                  {day.title || `Day ${day.day}`}
                                </h3>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                  {day.activities.length} blocks • {day.activities.reduce((sum, a) => sum + (a.duration || 0), 0)} min
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData({
                                    ...formData,
                                    daily_content: formData.daily_content?.filter((_, i) => i !== dayIndex)
                                  });
                                }}
                                style={{ color: '#EF4444' }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {expandedDay === day.day ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>

                        {expandedDay === day.day && (
                          <div className="mt-6 space-y-4">
                            <Input
                              value={day.title}
                              onChange={(e) => updateDayContent(day.day, { title: e.target.value })}
                              placeholder="Day title..."
                            />

                            <Textarea
                              value={day.description}
                              onChange={(e) => updateDayContent(day.day, { description: e.target.value })}
                              placeholder="Day description..."
                              rows={2}
                            />

                            <AdminFormField label="Day Hero Image (Optional)" description="Featured image shown at the top of this day">
                              <ImageUpload
                                value={day.image_url || ''}
                                onChange={(url) => updateDayContent(day.day, { image_url: url })}
                                bucket="equip-program-images"
                                path={`day-${day.day}`}
                              />
                            </AdminFormField>

                            <div className="flex items-center justify-between pt-4">
                              <h4 style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
                                Block Stack (Ordered)
                              </h4>
                              <Button
                                onClick={() => addActivity(day.day)}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <Plus size={14} />
                                Add Block
                              </Button>
                            </div>

                            {day.activities.length === 0 ? (
                              <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                                <p style={{ fontSize: '14px', color: '#6B7280' }}>
                                  No blocks yet. Add blocks to compose this day's experience.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {day.activities.map((activity) => (
                                  <Card key={activity.id} className="bg-gray-50">
                                    <CardContent className="pt-4 space-y-3">
                                      <div className="flex items-start justify-between">
                                        <Select
                                          value={activity.type}
                                          onValueChange={(value: any) => updateActivity(day.day, activity.id, { type: value })}
                                        >
                                          <SelectTrigger className="w-48">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {activityTypeOptions.map((option) => (
                                              <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          onClick={() => deleteActivity(day.day, activity.id)}
                                          variant="ghost"
                                          size="sm"
                                        >
                                          <X size={14} />
                                        </Button>
                                      </div>

                                      <Input
                                        value={activity.title}
                                        onChange={(e) => updateActivity(day.day, activity.id, { title: e.target.value })}
                                        placeholder="Block title (e.g., 'Understanding Sleep Cycles')..."
                                      />

                                      <Textarea
                                        value={activity.content}
                                        onChange={(e) => updateActivity(day.day, activity.id, { content: e.target.value })}
                                        placeholder="Block content, instructions, or prompt..."
                                        rows={3}
                                      />

                                      {/* Exercise Configuration (for Exercise blocks) */}
                                      {activity.type === 'exercise' && (
                                        <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF', border: '1px solid #BFDBFE' }}>
                                          <div className="flex items-center gap-2 mb-2">
                                            <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: '#1E40AF' }}>
                                              ✏️ EXERCISE CONFIGURATION
                                            </span>
                                          </div>

                                          {/* Exercise Subtype */}
                                          <AdminFormField label="Exercise Type" required>
                                            <Select
                                              value={activity.exerciseConfig?.subtype || 'multi-select'}
                                              onValueChange={(value) => updateActivity(day.day, activity.id, { 
                                                exerciseConfig: { ...activity.exerciseConfig, subtype: value as any } 
                                              })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="multi-select">Multi-Select (Multiple answers)</SelectItem>
                                                <SelectItem value="single-select">Single-Select (One answer)</SelectItem>
                                                <SelectItem value="mcq">MCQ (Multiple choice quiz)</SelectItem>
                                                <SelectItem value="table">Structured Table</SelectItem>
                                                <SelectItem value="ephemeral-journal">Ephemeral Journal (Auto-delete)</SelectItem>
                                                <SelectItem value="structured-list">Structured List</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </AdminFormField>

                                          {/* Prompt (for multi-select, single-select, MCQ) */}
                                          {['multi-select', 'single-select', 'mcq'].includes(activity.exerciseConfig?.subtype || '') && (
                                            <AdminFormField label="Question/Prompt" description="Question shown to the user">
                                              <Input
                                                value={activity.exerciseConfig?.prompt || ''}
                                                onChange={(e) => updateActivity(day.day, activity.id, { 
                                                  exerciseConfig: { ...activity.exerciseConfig, prompt: e.target.value } 
                                                })}
                                                placeholder="e.g., 'Pick statements that resonate with you...'"
                                              />
                                            </AdminFormField>
                                          )}

                                          {/* Options (for multi-select, single-select, MCQ) */}
                                          {['multi-select', 'single-select', 'mcq'].includes(activity.exerciseConfig?.subtype || '') && (
                                            <AdminFormField label="Answer Options" description="One option per line">
                                              <Textarea
                                                value={(activity.exerciseConfig?.options || []).join('\n')}
                                                onChange={(e) => updateActivity(day.day, activity.id, { 
                                                  exerciseConfig: { 
                                                    ...activity.exerciseConfig, 
                                                    options: e.target.value.split('\n').filter(o => o.trim()) 
                                                  } 
                                                })}
                                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                rows={5}
                                              />
                                            </AdminFormField>
                                          )}

                                          {/* MCQ Settings */}
                                          {activity.exerciseConfig?.subtype === 'mcq' && (
                                            <>
                                              <div className="flex items-center gap-2">
                                                <Checkbox
                                                  id={`all-correct-${activity.id}`}
                                                  checked={activity.exerciseConfig?.allCorrect || false}
                                                  onCheckedChange={(checked) => updateActivity(day.day, activity.id, { 
                                                    exerciseConfig: { ...activity.exerciseConfig, allCorrect: checked as boolean } 
                                                  })}
                                                />
                                                <Label htmlFor={`all-correct-${activity.id}`} style={{ fontSize: '13px' }}>
                                                  All options are correct (no wrong answers)
                                                </Label>
                                              </div>

                                              {!activity.exerciseConfig?.allCorrect && (
                                                <AdminFormField label="Correct Answer" description="Enter the correct option exactly">
                                                  <Input
                                                    value={activity.exerciseConfig?.correctAnswer as string || ''}
                                                    onChange={(e) => updateActivity(day.day, activity.id, { 
                                                      exerciseConfig: { ...activity.exerciseConfig, correctAnswer: e.target.value } 
                                                    })}
                                                    placeholder="Type the correct answer"
                                                  />
                                                </AdminFormField>
                                              )}
                                            </>
                                          )}

                                          {/* Table Configuration */}
                                          {activity.exerciseConfig?.subtype === 'table' && (
                                            <>
                                              <AdminFormField label="Table Columns" description="Define columns (format: Label|Type|Editable)">
                                                <Textarea
                                                  value={(activity.exerciseConfig?.tableColumns || [])
                                                    .map(col => `${col.label}|${col.type}|${col.editable ? 'yes' : 'no'}`)
                                                    .join('\n')}
                                                  onChange={(e) => {
                                                    const columns = e.target.value.split('\n')
                                                      .filter(line => line.trim())
                                                      .map((line, idx) => {
                                                        const [label, type, editable] = line.split('|');
                                                        return {
                                                          id: `col_${idx}`,
                                                          label: label || `Column ${idx + 1}`,
                                                          type: (type as any) || 'text',
                                                          editable: editable?.toLowerCase() === 'yes'
                                                        };
                                                      });
                                                    updateActivity(day.day, activity.id, { 
                                                      exerciseConfig: { ...activity.exerciseConfig, tableColumns: columns } 
                                                    });
                                                  }}
                                                  placeholder="Time|text|yes&#10;Situation|text|yes&#10;In my control|boolean|yes"
                                                  rows={4}
                                                />
                                              </AdminFormField>

                                              <AdminFormField label="Pre-filled Rows (Optional)" description="Add read-only example rows">
                                                <Input
                                                  type="number"
                                                  value={activity.exerciseConfig?.tableRows?.length || 0}
                                                  onChange={(e) => {
                                                    const count = parseInt(e.target.value) || 0;
                                                    const rows = Array.from({ length: count }, (_, i) => ({
                                                      id: `row_${i}`,
                                                      values: {},
                                                      readonly: true
                                                    }));
                                                    updateActivity(day.day, activity.id, { 
                                                      exerciseConfig: { ...activity.exerciseConfig, tableRows: rows } 
                                                    });
                                                  }}
                                                  placeholder="Number of example rows"
                                                />
                                              </AdminFormField>

                                              <AdminFormField label="Max User Entries" description="Maximum rows users can add">
                                                <Input
                                                  type="number"
                                                  value={activity.exerciseConfig?.maxEntries || ''}
                                                  onChange={(e) => updateActivity(day.day, activity.id, { 
                                                    exerciseConfig: { ...activity.exerciseConfig, maxEntries: parseInt(e.target.value) || undefined } 
                                                  })}
                                                  placeholder="e.g., 10 (unlimited if empty)"
                                                />
                                              </AdminFormField>

                                              <div className="flex items-center gap-2">
                                                <Checkbox
                                                  id={`progressive-${activity.id}`}
                                                  checked={activity.exerciseConfig?.progressive || false}
                                                  onCheckedChange={(checked) => updateActivity(day.day, activity.id, { 
                                                    exerciseConfig: { ...activity.exerciseConfig, progressive: checked as boolean } 
                                                  })}
                                                />
                                                <Label htmlFor={`progressive-${activity.id}`} style={{ fontSize: '13px' }}>
                                                  Progressive (Continues from previous day's table)
                                                </Label>
                                              </div>
                                            </>
                                          )}

                                          {/* Ephemeral Journal Configuration */}
                                          {activity.exerciseConfig?.subtype === 'ephemeral-journal' && (
                                            <AdminFormField label="Auto-Delete After (Hours)" description="Journal entry deletes automatically">
                                              <Input
                                                type="number"
                                                value={activity.exerciseConfig?.autoDelete || 48}
                                                onChange={(e) => updateActivity(day.day, activity.id, { 
                                                  exerciseConfig: { ...activity.exerciseConfig, autoDelete: parseInt(e.target.value) || 48 } 
                                                })}
                                                placeholder="48"
                                              />
                                            </AdminFormField>
                                          )}

                                          {/* Structured List Configuration */}
                                          {activity.exerciseConfig?.subtype === 'structured-list' && (
                                            <>
                                              <AdminFormField label="Preset Items" description="Pre-filled list items (one per line)">
                                                <Textarea
                                                  value={(activity.exerciseConfig?.listItems || []).join('\n')}
                                                  onChange={(e) => updateActivity(day.day, activity.id, { 
                                                    exerciseConfig: { 
                                                      ...activity.exerciseConfig, 
                                                      listItems: e.target.value.split('\n').filter(i => i.trim()) 
                                                    } 
                                                  })}
                                                  placeholder="Item 1&#10;Item 2&#10;Item 3"
                                                  rows={4}
                                                />
                                              </AdminFormField>

                                              <div className="flex items-center gap-2">
                                                <Checkbox
                                                  id={`editable-${activity.id}`}
                                                  checked={activity.exerciseConfig?.editable || false}
                                                  onCheckedChange={(checked) => updateActivity(day.day, activity.id, { 
                                                    exerciseConfig: { ...activity.exerciseConfig, editable: checked as boolean } 
                                                  })}
                                                />
                                                <Label htmlFor={`editable-${activity.id}`} style={{ fontSize: '13px' }}>
                                                  Users can edit preset items
                                                </Label>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}

                                      {/* Block Image Upload (Optional) */}
                                      <AdminFormField label="Block Image (Optional)" description="Image for this specific block">
                                        <ImageUpload
                                          value={activity.image_url || ''}
                                          onChange={(url) => updateActivity(day.day, activity.id, { image_url: url })}
                                          bucket="equip-program-images"
                                          path={`day-${day.day}/block-${activity.id}`}
                                        />
                                      </AdminFormField>

                                      <div className="grid grid-cols-3 gap-3">
                                        <Input
                                          type="number"
                                          value={activity.duration}
                                          onChange={(e) => updateActivity(day.day, activity.id, { duration: parseInt(e.target.value) })}
                                          placeholder="Duration (mins)"
                                        />
                                        <Input
                                          value={activity.data_id || ''}
                                          onChange={(e) => updateActivity(day.day, activity.id, { data_id: e.target.value })}
                                          placeholder="Data ID (i01-i12)"
                                        />
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            id={`req-${activity.id}`}
                                            checked={activity.required}
                                            onCheckedChange={(checked) => updateActivity(day.day, activity.id, { required: checked as boolean })}
                                          />
                                          <Label htmlFor={`req-${activity.id}`}>Required</Label>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </WizardLayout>
        
        {/* 4 Square Icon Action Buttons - REMOVED as redundant with top action bar */}
        {/* 
        <div 
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 p-4"
          style={{
             ...
          }}
        >
           ... buttons ...
        </div> 
        */}
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
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this program? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                handleDelete();
              }}
            >
              Delete Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
