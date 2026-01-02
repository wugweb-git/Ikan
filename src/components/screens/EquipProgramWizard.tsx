import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, BookOpen, Calendar, LayoutList, GripVertical, 
  ChevronUp, ChevronDown, X, Info, Lightbulb, Save, Upload,
  Settings, Copy, Search, MoreHorizontal, Clock
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
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
import { validateUrl } from '../../lib/validation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '../ui/utils';
import { 
  EquipProgram, 
  OnboardingQuestion, 
  DayContent, 
  Activity, 
  WeekStructure 
} from '../../lib/equip-admin-types';
import { EquipBlockEditor } from './EquipBlockEditor';
import { EquipOnboardingEditor } from './EquipOnboardingEditor';
import { EquipLandingPageRichTextEditor } from './EquipLandingPageRichTextEditor';
import { EquipDailyEditor as DailyBuilder } from './EquipDailyEditor';
import { UnifiedBasicInfoForm } from '../admin/UnifiedBasicInfoForm';

interface EquipProgramWizardProps {
  programId?: string;
  onBack: () => void;
  onSave: () => void;
}

const defaultCategoryOptions = [
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

// --- MAPPING HELPERS FOR UNIFIED CONTENT SYSTEM ---
// Converts Legacy Onboarding Questions <-> Unified Block Schema (Day 0)

const mapQuestionToBlock = (q: OnboardingQuestion): Activity => {
  const isText = q.type === 'text' || q.type === 'textarea';
  
  if (isText) {
    // Map Text/Textarea to Journal Block
    return {
      id: q.id,
      title: q.question, // Use question as title
      type: 'journal',
      content: q.helper_text || '', // Helper text as content/description
      duration: 2,
      required: q.required,
      order: q.order,
      autoAdvance: false,
      stepGroup: undefined // Default to one per screen
    };
  }
  
  // Map Selects to Exercise Block
  return {
    id: q.id,
    title: 'Question', 
    type: 'exercise',
    content: q.helper_text || '',
    duration: 1,
    required: q.required,
    order: q.order,
    autoAdvance: false, 
    stepGroup: undefined,
    exerciseConfig: {
      // Map legacy types to exercise subtypes
      subtype: q.type === 'single_select' ? 'single-select' : 
               q.type === 'multi_select' ? 'multi-select' : 
               'single-select', // Fallback
      prompt: q.question,
      options: q.options || []
    }
  };
};

const mapBlockToQuestion = (b: Activity): OnboardingQuestion => {
  // Determine type
  let type: OnboardingQuestion['type'] = 'single_select';
  let questionText = b.title;
  let options = b.exerciseConfig?.options || [];

  if (b.type === 'journal') {
    type = 'textarea';
    questionText = b.title; // For journal, title is the question
  } else if (b.type === 'exercise') {
     const subtype = b.exerciseConfig?.subtype;
     if (subtype === 'multi-select') type = 'multi_select';
     else if (subtype === 'single-select') type = 'single_select';
     questionText = b.exerciseConfig?.prompt || b.title;
  }

  return {
    id: b.id,
    order: b.order,
    question: questionText,
    helper_text: b.content,
    type,
    options,
    allow_skip: !b.required,
    allow_prefer_not_to_answer: false, // Not preserved in Block schema strictly, defaulting
    required: b.required,
    privacy_level: 'general', // Default
    storage_scope: 'equip-only', // Default
    editable_later: true
  };
};


export function EquipProgramWizard({ programId, onBack, onSave }: EquipProgramWizardProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!programId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<OnboardingQuestion | null>(null);
  const [categoryOptions, setCategoryOptions] = useState(defaultCategoryOptions);
  
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      if (Array.isArray(data) && data.length > 0) {
        setCategoryOptions(data.map((c: any) => ({
          label: c.name,
          value: c.slug
        })));
      }
    } catch (error) {
      console.warn('Failed to load categories', error);
    }
  };

  const [formData, setFormData] = useState<Partial<EquipProgram>>({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    category: 'mindfulness',
    difficulty: 'beginner',
    duration_days: 28,
    is_paid: false,
    price: 0,
    currency: 'INR',
    tags: [],
    thumbnail: '',
    cover_image: '',
    // ... default values
    week_structure: [],
    daily_content: [],
    onboarding_questions: [],
    can_repeat: true,
    published: false,
    featured: false,
    metadata: {}
  });

  const validationSchema: ValidationSchema = {
    title: { required: true, minLength: 3, message: 'Title is required' },
    description: { required: true, minLength: 20, maxLength: 150, message: 'Description must be 20-150 characters' },
    thumbnail: { 
      validate: (value: any) => !value || !validateUrl(value),
      message: 'Thumbnail must be a valid URL'
    },
    cover_image: {
      validate: (value: any) => !value || !validateUrl(value),
      message: 'Cover image must be a valid URL'
    }
  };

  const { errors, validateForm } = useFormValidation(validationSchema);
  const { hasUnsavedChanges, markAsSaved, markAsUnsaved, setShowWarning, showWarning } = useUnsavedChanges();

  const [localProgramId, setLocalProgramId] = useState(programId);

  // Load Data
  useEffect(() => {
    if (localProgramId) {
      loadProgram();
    } else {
      generateDailyContent(1); // Start with 1 day for new programs
    }
  }, [localProgramId]);

  useEffect(() => {
    if (formData.title) markAsUnsaved();
  }, [formData]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEquipProgram(localProgramId!);
      
      // UNIFIED SYSTEM ADAPTER:
      // Check if Day 0 exists (Onboarding Blocks)
      const onboardingDay = data.daily_content?.find((d: any) => d.day === 0);
      let onboardingQuestions = data.onboarding_questions || [];
      
      if (onboardingDay && onboardingDay.activities && onboardingDay.activities.length > 0) {
         // Prefer Day 0 blocks as the source of truth for One Content System
         onboardingQuestions = onboardingDay.activities.map(mapBlockToQuestion);
      }

      setFormData(prev => ({ 
        ...prev, 
        ...data,
        onboarding_questions: onboardingQuestions
      }));
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to load', 'Could not load program data');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyContent = (count: number) => {
    if ((formData.daily_content || []).length > 0) return;
    const days: DayContent[] = Array.from({ length: count }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}`,
      description: '',
      activities: [],
      dayType: 'lesson'
    }));
    setFormData(prev => ({ ...prev, daily_content: days }));
  };

  // Steps Configuration
  const wizardSteps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Info',
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'upcoming',
      metadata: 'Metadata & Cover'
    },
    {
      id: 'landing',
      title: 'Landing Page',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming',
      metadata: '6 Bento Tiles'
    },
    {
      id: 'onboarding',
      title: 'Onboarding',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming',
      metadata: `${(formData.onboarding_questions || []).length} Questions`
    },
    {
      id: 'daily',
      title: 'Daily Builder',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'upcoming',
      metadata: `${(formData.daily_content || []).filter(d => d.day > 0).length} Days`
    }
  ];

  // Navigation saves progress. Save preserves state. Publish changes lifecycle.
  const persistWizard = async (currentData: Partial<EquipProgram>, isAutoSave = false) => {
    setSaving(true);
    try {
      // UNIFIED SYSTEM ADAPTER:
      // Convert Onboarding Questions to Blocks (Day 0)
      const onboardingBlocks = (currentData.onboarding_questions || []).map(mapQuestionToBlock);
      
      const onboardingDay: DayContent = {
         day: 0,
         title: 'Onboarding',
         description: 'Initial assessment',
         dayType: 'lesson', // or 'assessment'
         activities: onboardingBlocks
      };
      
      // Merge Day 0 into daily_content
      const existingDaily = currentData.daily_content?.filter(d => d.day !== 0) || [];
      const unifiedDailyContent = [onboardingDay, ...existingDaily];
      
      const payload = {
         ...currentData,
         daily_content: unifiedDailyContent,
         // We keep onboarding_questions in payload too for legacy safety/Editor compatibility 
         // but backend should ideally prioritize daily_content
      };

      let result;
      if (localProgramId) {
        result = await apiClient.updateEquipProgram(localProgramId, payload);
      } else {
        result = await apiClient.createEquipProgram(payload);
        setLocalProgramId(result.id); 
      }
      
      markAsSaved();
      if (!isAutoSave) showToast('success', 'Saved', 'Changes saved successfully');
      return true;
    } catch (e) {
      if (!isAutoSave) showToast('error', 'Error', 'Failed to save progress');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!localProgramId) {
       showToast('error', 'Error', 'You must save the program before publishing.');
       return;
    }
    
    setSaving(true);
    try {
       // 1. Fetch latest server state (Rely on persisted state)
       const serverData = await apiClient.getEquipProgram(localProgramId);
       
       // 2. Determine new status
       const newStatus = !serverData.published;
       
       // 3. Update ONLY the lifecycle status
       // Note: We send the whole object because the API might require it, 
       // but we base it on serverData to avoid implicit saving of local changes.
       const payload = { 
           ...serverData, 
           published: newStatus,
           published_at: newStatus ? new Date().toISOString() : undefined
       };
       
       await apiClient.updateEquipProgram(localProgramId, payload);
       
       // 4. Update local state to match lifecycle change only
       setFormData(prev => ({ ...prev, published: newStatus }));
       
       showToast('success', newStatus ? 'Published' : 'Unpublished', 'Program status updated based on last saved version.');
       
       // Refresh local data to ensure we have the unified blocks if any server-side logic ran
       loadProgram();
       
    } catch (e) {
       showToast('error', 'Error', 'Failed to update status');
    } finally {
       setSaving(false);
    }
  };


  return (
    <>
      <WizardLayout
        title={formData.title || 'Untitled Program'}
        status={formData.published ? 'published' : 'draft'}
        steps={wizardSteps}
        currentStep={currentStep}
        fullWidth={currentStep === 2 || currentStep === 3} // Use full width for builders
        onStepChange={(newStep) => {
          if (newStep > currentStep) {
            if (validateForm(formData)) setCurrentStep(newStep);
            else showToast('error', 'Validation Error', 'Please correct the errors before proceeding');
          } else {
            setCurrentStep(newStep);
          }
        }}
        onExit={() => {
          if (hasUnsavedChanges) setShowWarning(true);
          else onBack();
        }}
        onSaveDraft={() => persistWizard(formData)}
        onNext={async () => {
          if (validateForm(formData)) {
            await persistWizard(formData, true); // Auto-save on continue
            setCurrentStep(s => Math.min(s + 1, 3));
          } else {
            showToast('error', 'Validation Error', 'Please correct the errors before proceeding');
          }
        }}
        onPrevious={async () => {
           await persistWizard(formData, true); // Auto-save on back
           setCurrentStep(s => Math.max(s - 1, 0));
        }}
        onFinish={async () => {
           await persistWizard(formData);
           onSave();
        }}
        isLoading={saving}
        finishButtonText={localProgramId ? 'Save & Close' : 'Create Program'}
        stepTitle={wizardSteps[currentStep].title}
        stepDescription={
          currentStep === 3 
            ? "Build your daily syllabus by stacking content blocks." 
            : "Configure program details."
        }
        footerLeftContent={
          localProgramId ? (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-8 w-8 p-0 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none shadow-none"
              title="Delete Program"
            >
              <Trash2 size={16} />
            </Button>
          ) : null
        }
        footerRightContent={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => persistWizard(formData)}
              disabled={saving}
              className="h-8 w-8 p-0"
              title="Save Progress"
            >
              <Save size={16} />
            </Button>
            <Button
              onClick={handlePublishToggle}
              disabled={saving || !localProgramId}
              className={`h-8 px-3 gap-2 ${formData.published ? 'bg-amber-600 hover:bg-amber-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
              title={formData.published ? 'Unpublish' : 'Publish'}
            >
              <Upload size={16} />
              <span className="text-xs font-medium">{formData.published ? 'Unpublish' : 'Publish'}</span>
            </Button>
          </div>
        }
      >
        {/* STEP 0: BASIC INFO */}
        {currentStep === 0 && (
          <div>
            <UnifiedBasicInfoForm
              title={formData.title || ''}
              description={formData.description || ''}
              category={formData.category || 'mindfulness'}
              difficulty={formData.difficulty || 'beginner'}
              duration={formData.duration_days || 28}
              isPremium={formData.is_paid || false}
              price={formData.price || 0}
              onTitleChange={(value) => setFormData({ ...formData, title: value })}
              onDescriptionChange={(value) => setFormData({ ...formData, description: value })}
              onCategoryChange={(value) => setFormData({ ...formData, category: value })}
              onDifficultyChange={(value) => setFormData({ ...formData, difficulty: value })}
              onDurationChange={(value) => setFormData({ ...formData, duration_days: value })}
              onIsPremiumChange={(value) => setFormData({ ...formData, is_paid: value })}
              onPriceChange={(value) => setFormData({ ...formData, price: value })}
              config={{
                titleLabel: 'Program Title',
                descriptionLabel: 'Description',
                categoryLabel: 'Category',
                durationLabel: 'Duration',
                durationUnit: 'days',
                imageLabel: 'Cover Image',
                subtitle: 'Configure program details',
                categories: categoryOptions,
                showAssessmentType: false,
                showPaywall: true
              }}
              renderImageSection={() => (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    <ImageUpload 
                      value={formData.cover_image || formData.thumbnail || ''}
                      onChange={v => setFormData({ ...formData, cover_image: v, thumbnail: v })}
                      placeholder="Select Image"
                      aspectRatio="square"
                    />
                  </div>
                  {(formData.cover_image || formData.thumbnail) && (
                    <div className="flex-1">
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        Hover thumbnail to change or remove
                      </p>
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        )}

        {/* STEP 1: LANDING PAGE (Bento) */}
        {currentStep === 1 && (
          <EquipLandingPageRichTextEditor 
            data={formData}
            onChange={(updates) => setFormData({ ...formData, ...updates })}
          />
        )}

        {/* STEP 2: ONBOARDING */}
        {currentStep === 2 && (
          <EquipOnboardingEditor
            questions={formData.onboarding_questions || []}
            onChange={(questions) => setFormData({ ...formData, onboarding_questions: questions })}
            onSelectQuestion={setSelectedQuestion}
          />
        )}

        {/* STEP 3: DAILY BUILDER */}
        {currentStep === 3 && (
          <DndProvider backend={HTML5Backend}>
            <DailyBuilder
              program={formData}
              mode="equip"
              singleDayMode={false}
              onProgramChange={(updates) => setFormData({ ...formData, ...updates })}
            />
          </DndProvider>
        )}
      </WizardLayout>

      <UnsavedChangesDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={() => { markAsSaved(); onBack(); }}
      />
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
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
              onClick={async () => {
                 try {
                   if (programId) {
                     await apiClient.deleteEquipProgram(programId);
                     showToast('success', 'Deleted', 'Program deleted successfully');
                     onSave(); // or onBack()
                   }
                 } catch (e) {
                   showToast('error', 'Error', 'Failed to delete');
                 }
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