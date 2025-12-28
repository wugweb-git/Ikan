import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Calendar, LayoutList, GripVertical, ChevronUp, ChevronDown, X, Info, Lightbulb } from 'lucide-react';
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

const dayTypeOptions = [
  { value: 'lesson', label: '📖 Lesson Day' },
  { value: 'practice', label: '🌙 Practice Mode' },
  { value: 'conclusion', label: '🏆 Conclusion' }
];

const questionTypeOptions = [
  { value: 'single_select', label: '⚪ Single Select' },
  { value: 'multi_select', label: '☑️ Multi-Select' },
  { value: 'text', label: '📝 Short Text' },
  { value: 'textarea', label: '📄 Long Text' }
];

export function EquipProgramEditPageWizard({ programId, onBack, onSave }: EquipProgramEditPageWizardProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!programId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<OnboardingQuestion | null>(null);
  
  // Track expanded state for individual blocks
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

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
    description: { required: true, minLength: 20, maxLength: 150, message: 'Description must be 20-150 characters' }
  };

  const { errors, validateForm } = useFormValidation(validationSchema);
  const { hasUnsavedChanges, markAsSaved, markAsUnsaved, setShowWarning, showWarning } = useUnsavedChanges();

  // Load Data
  useEffect(() => {
    if (programId) {
      loadProgram();
    } else {
      generateWeekStructure(18); // Default to 18 days for Sleep Tight
      generateDailyContent(18);
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

  // Helper Functions
  const generateWeekStructure = (days: number) => { /* ... implementation ... */ };
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

  // Data Manipulation Handlers
  const handleArrayFieldChange = (field: keyof EquipProgram, value: string) => {
    setFormData({ ...formData, [field]: value.split('\n').filter(line => line.trim() !== '') });
  };
  const getArrayFieldString = (field: keyof EquipProgram) => {
    const val = formData[field];
    return Array.isArray(val) ? val.join('\n') : '';
  };

  const updateDayContent = (day: number, updates: Partial<DayContent>) => {
    setFormData(prev => ({
      ...prev,
      daily_content: prev.daily_content?.map(d => d.day === day ? { ...d, ...updates } : d)
    }));
  };

  const addActivity = (day: number) => {
    const target = formData.daily_content?.find(d => d.day === day);
    if (!target) return;
    const newBlock: Activity = {
      id: `block_${Date.now()}`,
      title: '',
      type: 'lesson',
      content: '',
      duration: 5,
      required: true,
      order: target.activities.length
    };
    updateDayContent(day, { activities: [...target.activities, newBlock] });
    setExpandedBlocks(prev => ({ ...prev, [newBlock.id]: true }));
  };

  const updateActivity = (day: number, blockId: string, updates: Partial<Activity>) => {
    const target = formData.daily_content?.find(d => d.day === day);
    if (!target) return;
    const updatedActivities = target.activities.map(a => a.id === blockId ? { ...a, ...updates } : a);
    updateDayContent(day, { activities: updatedActivities });
  };

  const deleteActivity = (day: number, blockId: string) => {
    const target = formData.daily_content?.find(d => d.day === day);
    if (!target) return;
    updateDayContent(day, { activities: target.activities.filter(a => a.id !== blockId) });
  };

  const moveActivity = (day: number, index: number, direction: 'up' | 'down') => {
    const target = formData.daily_content?.find(d => d.day === day);
    if (!target) return;
    const activities = [...target.activities];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activities.length) return;
    
    [activities[index], activities[newIndex]] = [activities[newIndex], activities[index]];
    updateDayContent(day, { activities });
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

  // Secondary Content (Guidance)
  const renderSecondaryContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="flex items-center gap-2 font-medium text-blue-900 mb-2">
                <Lightbulb size={16} />
                Title Guidelines
              </h4>
              <p className="text-sm text-blue-800">
                Keep titles concise and action-oriented. Avoid jargon.
                <br /><br />
                <strong>Good:</strong> "Sleep Tight: 18 Days to Better Rest"
                <br />
                <strong>Bad:</strong> "CBT-I Protocol for Insomnia"
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Required Assets</h4>
              <ul className="text-sm space-y-2 text-gray-600 list-disc pl-4">
                <li>Cover Image (16:9 aspect ratio)</li>
                <li>Program Description (max 150 chars)</li>
                <li>Category tag</li>
              </ul>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <h4 className="flex items-center gap-2 font-medium text-indigo-900 mb-2">
                <Info size={16} />
                Structuring Days
              </h4>
              <p className="text-sm text-indigo-800">
                A typical day should take 10-15 minutes. Mix reading (Lessons) with interaction (Exercises).
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Block Types</h4>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <BookOpen size={16} className="text-blue-500 shrink-0" />
                  <span><strong>Lesson:</strong> Psychoeducation content. Use Markdown for formatting.</span>
                </div>
                <div className="flex gap-2">
                  <LayoutList size={16} className="text-purple-500 shrink-0" />
                  <span><strong>Exercise:</strong> Interactive elements like quizzes or checklists.</span>
                </div>
                <div className="flex gap-2">
                  <span>🌙</span>
                  <span><strong>Sleep Diary:</strong> Standardized clinical instrument (fixed format).</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-500">
            Configure this section carefully as it directly impacts the user experience.
          </div>
        );
    }
  };

  const handleSave = async (shouldPublish?: boolean) => {
    // ... Save Logic (Same as before) ...
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
        onStepChange={setCurrentStep}
        onExit={() => {
          if (hasUnsavedChanges) setShowWarning(true);
          else onBack();
        }}
        onSaveDraft={() => handleSave(false)}
        secondaryContent={renderSecondaryContent()}
        onNext={() => {
          if (validateForm(formData)) setCurrentStep(s => Math.min(s + 1, 3));
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
      >
        {/* STEP 0: BASIC INFO */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <AdminFormField label="Program Title" required error={errors.title}>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                placeholder="e.g. Sleep Tight"
              />
            </AdminFormField>
            
            <AdminFormField label="Description" required error={errors.description}>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Brief summary..."
                maxLength={150}
              />
            </AdminFormField>

            <div className="grid grid-cols-2 gap-4">
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
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button onClick={() => generateDailyContent(1)} variant="outline" className="gap-2">
                <Plus size={14} /> Add Day
              </Button>
            </div>

            {formData.daily_content?.length === 0 && (
              <div className="text-center p-12 border-2 border-dashed rounded-xl">
                <p className="text-gray-500">No days configured. Start by adding a day.</p>
              </div>
            )}

            <div className="space-y-4">
              {formData.daily_content?.map((day, dayIdx) => (
                <Card key={day.day} className="border-l-4 border-l-emerald-500 overflow-hidden">
                  <div 
                    className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold">
                        {day.day}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{day.title || `Day ${day.day}`}</h4>
                        <p className="text-xs text-gray-500">
                          {day.dayType === 'practice' ? '🌙 Practice Mode' : '📖 Lesson'} • {day.activities.length} blocks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedDay === day.day ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {expandedDay === day.day && (
                    <CardContent className="p-6 border-t bg-white">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <AdminFormField label="Day Title">
                          <Input 
                            value={day.title} 
                            onChange={e => updateDayContent(day.day, { title: e.target.value })}
                          />
                        </AdminFormField>
                        <AdminFormField label="Day Type">
                          <Select 
                            value={day.dayType || 'lesson'} 
                            onValueChange={(v: any) => updateDayContent(day.day, { dayType: v })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {dayTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </AdminFormField>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Block Sequence</h5>
                          <Button size="sm" variant="secondary" onClick={() => addActivity(day.day)} className="gap-2">
                            <Plus size={14} /> Add Block
                          </Button>
                        </div>

                        {day.activities.length === 0 ? (
                          <div className="p-8 text-center text-sm text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                            Empty day. Add a block to start.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {day.activities.map((block, idx) => (
                              <EquipBlockEditor
                                key={block.id}
                                block={block}
                                onChange={updates => updateActivity(day.day, block.id, updates)}
                                onDelete={() => deleteActivity(day.day, block.id)}
                                isExpanded={expandedBlocks[block.id] || false}
                                onToggleExpand={() => setExpandedBlocks(prev => ({ ...prev, [block.id]: !prev[block.id] }))}
                                isFirst={idx === 0}
                                isLast={idx === day.activities.length - 1}
                                moveUp={() => moveActivity(day.day, idx, 'up')}
                                moveDown={() => moveActivity(day.day, idx, 'down')}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </WizardLayout>

      <UnsavedChangesDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={() => { markAsSaved(); onBack(); }}
      />
    </>
  );
}
