import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Calendar, LayoutList, GripVertical, ChevronUp, ChevronDown, X, Info, Lightbulb, Save, Upload } from 'lucide-react';
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
import { 
  EquipProgram, 
  OnboardingQuestion, 
  DayContent, 
  Activity, 
  WeekStructure 
} from '../../lib/equip-admin-types';
import { EquipBlockEditor } from './EquipBlockEditor';
import { EquipOnboardingEditor } from './EquipOnboardingEditor';
import { EquipLandingPageEditor } from './EquipLandingPageEditor';
import { EquipDailyEditor } from './EquipDailyEditor';

interface EquipProgramEditPageWizardProps {
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

export function EquipProgramEditPageWizard({ programId, onBack, onSave }: EquipProgramEditPageWizardProps) {
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
    tags: [],
    thumbnail: '',
    cover_image: '',
    // ... default values
    week_structure: [],
    daily_content: [],
    onboarding_questions: [],
    can_repeat: true,
    published: false,
    featured: false
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

  // Load Data
  useEffect(() => {
    if (programId) {
      loadProgram();
    } else {
      generateDailyContent(1); // Start with 1 day for new programs
    }
  }, [programId]);

  useEffect(() => {
    if (formData.title) markAsUnsaved();
  }, [formData]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEquipProgram(programId!);
      setFormData(prev => ({ ...prev, ...data }));
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
      metadata: `${(formData.daily_content || []).length} Days`
    }
  ];

  const handleSave = async (shouldPublish?: boolean) => {
    try {
      setSaving(true);
      const payload = { ...formData };
      if (shouldPublish !== undefined) {
        payload.published = shouldPublish;
        payload.published_at = shouldPublish ? new Date().toISOString() : undefined;
      }
      
      if (programId) {
        await apiClient.updateEquipProgram(programId, payload);
      } else {
        await apiClient.createEquipProgram(payload);
      }
      
      showToast('success', 'Saved', 'Program saved successfully');
      markAsSaved();
      onSave();
    } catch (e) {
      showToast('error', 'Error', 'Failed to save');
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
        onSaveDraft={() => handleSave(false)}
        onNext={() => {
          if (validateForm(formData)) setCurrentStep(s => Math.min(s + 1, 3));
          else showToast('error', 'Validation Error', 'Please correct the errors before proceeding');
        }}
        onPrevious={() => setCurrentStep(s => Math.max(s - 1, 0))}
        onFinish={() => handleSave()}
        isLoading={saving}
        finishButtonText={programId ? 'Save Changes' : 'Create Program'}
        stepTitle={wizardSteps[currentStep].title}
        stepDescription={
          currentStep === 3 
            ? "Build your daily syllabus by stacking content blocks." 
            : "Configure program details."
        }
        footerLeftContent={
          programId ? (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none shadow-none"
            >
              <Trash2 size={16} /> Delete
            </Button>
          ) : null
        }
        footerRightContent={
          <div className="flex items-center gap-2">
            {currentStep === 3 && (
              <Button
                onClick={() => handleSave(!formData.published)}
                disabled={saving}
                variant="outline"
                className={`gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 ${formData.published ? 'bg-emerald-50' : ''}`}
              >
                <Upload size={16} /> {formData.published ? 'Unpublish' : 'Publish'}
              </Button>
            )}
          </div>
        }
      >
        {/* STEP 0: BASIC INFO */}
        {currentStep === 0 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <AdminFormField label="Program Title" required error={errors.title}>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                placeholder="e.g. Sleep Tight"
                className="text-lg font-medium"
              />
            </AdminFormField>
            
            <AdminFormField label="Description" required error={errors.description}>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Brief summary..."
                maxLength={150}
                rows={3}
              />
            </AdminFormField>

            <div className="grid grid-cols-2 gap-6">
              <AdminFormField label="Category">
                <Select 
                  value={formData.category} 
                  onValueChange={(v: any) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </AdminFormField>

              <AdminFormField label="Cover Image">
                <ImageUpload 
                  value={formData.cover_image || formData.thumbnail || ''}
                  onChange={v => setFormData({ ...formData, cover_image: v, thumbnail: v })}
                  placeholder="Select Image"
                  aspectRatio="video"
                  className="h-40"
                />
              </AdminFormField>
            </div>
          </div>
        )}

        {/* STEP 1: LANDING PAGE (Bento) */}
        {currentStep === 1 && (
          <EquipLandingPageEditor 
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
          <EquipDailyEditor
            days={formData.daily_content || []}
            onChange={(days) => setFormData({ ...formData, daily_content: days })}
          />
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