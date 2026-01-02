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
import { WizardLayout } from '../ui/wizard-layout';
import { WizardStep } from '../ui/wizard-stepper';
import { AssessmentResultsManager } from './AssessmentResultsManager';
import { AssessmentLandingPageRichTextEditor } from './AssessmentLandingPageRichTextEditor';
import { UnifiedBasicInfoForm } from '../admin/UnifiedBasicInfoForm';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { validateUrl } from '../../lib/validation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EquipDailyEditor as DailyBuilder } from './EquipDailyEditor';
import { DayContent, Activity } from '../../lib/equip-admin-types';

// Adapter to convert legacy Question[] to Block[] (Activity[])
const convertQuestionsToDay = (questions: any[]): DayContent => {
  return {
    day: 1,
    title: 'Assessment Content',
    dayType: 'lesson', // Default, doesn't matter much for assessment mode
    activities: questions.map((q, idx) => ({
      id: q.id || `block-${idx}`,
      title: q.text || 'Untitled Question',
      type: 'exercise', // Assessments are mostly exercises
      duration: q.timeLimit || 2,
      required: q.required !== false,
      autoAdvance: q.autoAdvance,
      stepGroup: q.stepGroup,
      image_url: q.icon || q.imageUrl, // Map icon to image_url for now
      content: '', // Not used for exercise usually
      exerciseConfig: {
        subtype: q.type === 'multiple-choice' ? 'mcq' : 
                 q.type === 'scale' ? 'single-select' : 
                 q.type === 'text' ? 'text' : 'mcq',
        prompt: q.text,
        options: q.options || [],
        scoring: {
           enabled: true, // Auto-enable scoring for imported questions
           weights: [], // Legacy questions might not have weights
        }
      }
    }))
  };
};

// Adapter to convert Block[] back to legacy Question[] if needed
// Or ideally we start saving as daily_content if backend allows. 
// For this refactor, we will maintain the internal state as DayContent[] 
// but mapped back to 'questions' for the 'formData' state to keep compatible with the rest of the file.

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string; 
  filter_type?: string; 
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: any[]; // relaxed type
  daily_content?: DayContent[]; // New unified field
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
  metadata?: Record<string, any>;
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
  const [localAssessmentId, setLocalAssessmentId] = useState(assessmentId);
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
    section4_notes: [],
    metadata: {}
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

  const updateMetadata = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...(prev.metadata || {}),
        [key]: value
      }
    }));
  };

  useEffect(() => {
    if (formData.title || formData.description) {
      markAsUnsaved();
    }
  }, [formData]);

  useEffect(() => {
    if (localAssessmentId) {
      loadAssessment();
    }
  }, [localAssessmentId]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAssessment(localAssessmentId!);
      if (data && typeof data === 'object') {
        // CONVERSION LOGIC: Legacy Questions -> Daily Content
        if (!data.daily_content && data.questions && data.questions.length > 0) {
            data.daily_content = [convertQuestionsToDay(data.questions)];
        } else if (!data.daily_content) {
            data.daily_content = [{
                day: 1, 
                title: 'Assessment', 
                description: 'Generated Day', 
                dayType: 'lesson', 
                activities: []
            }];
        }
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

  // Navigation saves progress. Save preserves state. Publish changes lifecycle.
  const persistWizard = async (currentData: Partial<Assessment>, isAutoSave = false) => {
    setSaving(true);
    try {
      // SYNC BACK: Ensure questions field is populated for legacy compatibility if needed
      // Map daily_content[0].activities -> questions
      // Ideally backend should accept daily_content.
      // But we'll sync it just in case.
      if (currentData.daily_content && currentData.daily_content.length > 0) {
          // This is a rough mapping back to Question format to satisfy TypeScript/Legacy
          // Note: This might be lossy if Question schema is stricter than Block.
          // But since we are moving to Blocks, we prioritize preserving Block data (daily_content).
          currentData.questions = currentData.daily_content[0].activities.map(block => ({
              id: block.id,
              text: block.exerciseConfig?.prompt || block.title,
              type: block.exerciseConfig?.subtype === 'mcq' ? 'multiple-choice' : 'text', // simplified
              options: block.exerciseConfig?.options || [],
              required: block.required,
              timeLimit: block.duration
          }));
      }

      let result;
      if (localAssessmentId) {
        result = await apiClient.updateAssessment(localAssessmentId, currentData);
      } else {
        result = await apiClient.createAssessment(currentData);
        setLocalAssessmentId(result.id);
      }
      
      markAsSaved();
      if (!isAutoSave) showToast('success', 'Saved', 'Changes saved successfully');
      return true;
    } catch (e: any) {
      if (!isAutoSave) showToast('error', 'Error', e.message || 'Failed to save progress');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!localAssessmentId) {
       showToast('error', 'Error', 'You must save the assessment before publishing.');
       return;
    }

    setSaving(true);
    try {
        // 1. Fetch latest server state (Rely on persisted state)
        const serverData = await apiClient.getAssessment(localAssessmentId);
        
        // Validation for Publish (on SERVER data)
        if (!serverData.published) {
             if ((serverData.questions || []).length === 0) {
                 showToast('error', 'Validation Error', 'Please add at least one question to publish');
                 setSaving(false);
                 return;
             }
        }

        // 2. Determine new status
        const newStatus = !serverData.published;
        
        // 3. Update ONLY the lifecycle status
        const payload = { 
            ...serverData, 
            published: newStatus,
            published_at: newStatus ? new Date().toISOString() : undefined
        };

        await apiClient.updateAssessment(localAssessmentId, payload);
        
        // 4. Update local state to match lifecycle change only
        setFormData(prev => ({ ...prev, published: newStatus }));
        showToast('success', newStatus ? 'Published' : 'Unpublished', 'Assessment status updated based on last saved version.');
    } catch (e: any) {
        showToast('error', 'Error', e.message || 'Failed to update status');
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!localAssessmentId) return;
    try {
      setSaving(true);
      await apiClient.deleteAssessment(localAssessmentId);
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
        fullWidth={currentStep === 2} // Full width for Questions editor
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
        onSaveDraft={() => persistWizard(formData)}
        onNext={async () => {
          if (validateForm(formData)) {
             await persistWizard(formData, true);
             setCurrentStep(s => Math.min(s + 1, 3));
          } else {
             showToast('error', 'Validation Error', 'Please complete required fields');
          }
        }}
        onPrevious={async () => {
           await persistWizard(formData, true);
           setCurrentStep(s => Math.max(s - 1, 0));
        }}
        onFinish={async () => {
           await persistWizard(formData);
           onSave();
        }}
        isLoading={saving}
        finishButtonText={localAssessmentId ? 'Save & Close' : 'Create Assessment'}
        stepTitle={wizardSteps[currentStep].title}
        stepDescription={wizardSteps[currentStep].subtitle}
        
        footerLeftContent={
          localAssessmentId ? (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-8 w-8 p-0 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none shadow-none"
              title="Delete Assessment"
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
              disabled={saving || !localAssessmentId}
              className={`h-8 px-3 gap-2 ${formData.published ? 'bg-amber-600 hover:bg-amber-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
              title={formData.published ? 'Unpublish' : 'Publish'}
            >
              <Upload size={16} /> 
              <span className="text-xs font-medium">{formData.published ? 'Unpublish' : 'Publish'}</span>
            </Button>
          </div>
        }
      >
        {/* Step 0: Basic Info */}
        {currentStep === 0 && (
          <div>
            <UnifiedBasicInfoForm
              title={formData.title || ''}
              description={formData.description || ''}
              category={formData.category || 'wellness'}
              difficulty={formData.difficulty || 'beginner'}
              duration={formData.duration || 5}
              isPremium={formData.is_premium || false}
              price={formData.price || 0}
              onTitleChange={(value) => setFormData({ ...formData, title: value })}
              onDescriptionChange={(value) => setFormData({ ...formData, description: value })}
              onCategoryChange={(value: any) => setFormData({ ...formData, category: value })}
              onDifficultyChange={(value: any) => setFormData({ ...formData, difficulty: value })}
              onDurationChange={(value) => setFormData({ ...formData, duration: value })}
              onIsPremiumChange={(value) => setFormData({ ...formData, is_premium: value })}
              onPriceChange={(value) => setFormData({ ...formData, price: value })}
              config={{
                titleLabel: 'Assessment Title',
                descriptionLabel: 'Description',
                categoryLabel: 'Topic Category',
                durationLabel: 'Duration',
                durationUnit: 'minutes',
                imageLabel: 'Assessment Image (Thumbnail)',
                subtitle: 'Configure assessment details',
                categories: dynamicCategoryOptions,
                showAssessmentType: true,
                assessmentType: formData.filter_type || 'assessment',
                onAssessmentTypeChange: (value) => setFormData({ ...formData, filter_type: value }),
                showPaywall: true
              }}
              renderImageSection={() => (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    <ImageUpload
                      value={formData.thumbnail || ''}
                      onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                      aspectRatio="square"
                    />
                  </div>
                  {formData.thumbnail && (
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

        {/* Step 1: Landing Page */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <AssessmentLandingPageRichTextEditor
              data={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
            />
          </div>
        )}

        {/* Step 2: Questions (Unified Daily Builder) */}
        {currentStep === 2 && (
           <DndProvider backend={HTML5Backend}>
             <DailyBuilder
               program={formData}
               mode="assessment"
               singleDayMode={true}
               onProgramChange={(updates) => setFormData({ ...formData, ...updates })}
             />
           </DndProvider>
        )}

        {/* Step 3: Scoring & Results */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="p-6 bg-white rounded-xl border border-gray-200 space-y-6">
              <h3 className="text-lg font-medium border-b pb-2">Scoring Configuration</h3>
              
              <AdminFormField label="Scoring Method">
                <Select
                  value={formData.scoringMethod || 'sum'}
                  onValueChange={(v: any) => setFormData({ ...formData, scoringMethod: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum of Values (0-5 scale)</SelectItem>
                    <SelectItem value="average">Average Score</SelectItem>
                    <SelectItem value="custom">Custom Logic</SelectItem>
                  </SelectContent>
                </Select>
              </AdminFormField>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Result Categories</Label>
                  <Button onClick={addResultCategory} size="sm" variant="outline" className="gap-1">
                    <Plus size={14} /> Add Category
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {(formData.resultCategories || []).map((cat, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-sm">Category {idx + 1}</h4>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                            onClick={() => {
                              const newCats = [...(formData.resultCategories || [])];
                              newCats.splice(idx, 1);
                              setFormData({ ...formData, resultCategories: newCats });
                            }}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <AdminFormField label="Min Score">
                            <Input 
                              type="number" 
                              value={cat.min} 
                              onChange={(e) => {
                                const newCats = [...(formData.resultCategories || [])];
                                newCats[idx].min = parseInt(e.target.value) || 0;
                                setFormData({ ...formData, resultCategories: newCats });
                              }}
                            />
                          </AdminFormField>
                          <AdminFormField label="Max Score">
                            <Input 
                              type="number" 
                              value={cat.max} 
                              onChange={(e) => {
                                const newCats = [...(formData.resultCategories || [])];
                                newCats[idx].max = parseInt(e.target.value) || 0;
                                setFormData({ ...formData, resultCategories: newCats });
                              }}
                            />
                          </AdminFormField>
                        </div>
                        
                        <AdminFormField label="Label">
                          <Input 
                            value={cat.label} 
                            onChange={(e) => {
                              const newCats = [...(formData.resultCategories || [])];
                              newCats[idx].label = e.target.value;
                              setFormData({ ...formData, resultCategories: newCats });
                            }}
                            placeholder="e.g. Mild Anxiety"
                          />
                        </AdminFormField>
                        
                        <AdminFormField label="Description">
                          <Textarea 
                            value={cat.description} 
                            onChange={(e) => {
                              const newCats = [...(formData.resultCategories || [])];
                              newCats[idx].description = e.target.value;
                              setFormData({ ...formData, resultCategories: newCats });
                            }}
                            placeholder="Feedback shown to user..."
                          />
                        </AdminFormField>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {(formData.resultCategories || []).length === 0 && (
                    <div className="text-center p-6 border border-dashed rounded-lg text-gray-500 text-sm">
                      No result categories defined. Users will just see their raw score.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
            >
              Delete Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}