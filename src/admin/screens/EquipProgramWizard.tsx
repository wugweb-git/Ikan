import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminFormField } from '../components/AdminFormField';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ImageUpload } from '../ui/image-upload';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { validateUrl } from '../../lib/validation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { EquipProgram, OnboardingQuestion, Activity, DayContent, DEFAULT_CHECKIN_CONFIG } from '../../lib/blocks/block-model';
import { EquipLandingPageRichTextEditor } from './EquipLandingPageRichTextEditor';
import { DayEditor as DailyBuilder } from '../blocks/DayComposer';
import { UnifiedBasicInfoForm } from '../components/UnifiedBasicInfoForm';
import { useMetadata } from '../../hooks/useMetadata';
import { ProgramPlayer } from '../../app/features/player/ProgramPlayer';
import { seedDayFromTemplate } from '../../lib/blocks/day-policy';
/* §21 item 5 (2026-09-09): the wizard's stepper chrome became a two-screen
   builder shell. The record logic below — persistWizard, handlePublishToggle,
   the Day 0 reconciliation, the crash-recovery backup — is untouched. */
import { BuilderShell } from '../builder/BuilderShell';
import { BuilderTopBar } from '../builder/BuilderTopBar';
import { SetupScreen } from '../builder/setup/SetupScreen';
import { LandingPreviewCard } from '../builder/setup/LandingPreviewCard';
import type { BuilderScreen } from '../builder/builder-types';

interface EquipProgramWizardProps {
  programId?: string;
  onBack: () => void;
  onSave: () => void;
}

// Fallback category/difficulty options — used only while metadata hasn't loaded from KV
// REMOVED: No hardcoded fallbacks — KV is the single source of truth

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
    activityConfig: {
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
  const options = b.activityConfig?.options || [];

  if (b.type === 'journal') {
    type = 'textarea';
    questionText = b.title; // For journal, title is the question
  } else if (b.type === 'exercise') {
     const subtype = b.activityConfig?.subtype;
     if (subtype === 'multi-select') type = 'multi_select';
     else if (subtype === 'single-select') type = 'single_select';
     questionText = b.activityConfig?.prompt || b.title;
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [screen, setScreen] = useState<BuilderScreen>('setup');
  const [selectedQuestion, setSelectedQuestion] = useState<OnboardingQuestion | null>(null);
  const [showPlayerPreview, setShowPlayerPreview] = useState(false);

  // ── Metadata-driven categories & difficulty levels ──────────
  const { categories: metaCategories, difficultyLevels: metaDifficulty } = useMetadata();
  const categoryOptions = metaCategories.map(c => ({ label: c.label, value: c.value }));
  const difficultyOptions = metaDifficulty.map(d => ({ label: d.label, value: d.value }));

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
    description: { required: true, minLength: 10, maxLength: 500, message: 'Description must be 10-500 characters' },
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
  const hasLoadedRef = useRef(false);
  const LOCAL_STORAGE_KEY = `ikan_equip_draft_${programId || 'new'}`;

  // ── Ref to always have the latest formData for saves ──────────
  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  // ── localStorage crash recovery ──────────────────────────────
  // On mount: check if there's a localStorage backup
  useEffect(() => {
    if (programId) return; // Only restore for NEW programs (editing existing reloads from server)
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title) {
          setFormData(prev => ({ ...prev, ...parsed }));
          showToast('info', 'Draft Recovered', 'We restored your unsaved changes from a previous session.');
        }
      }
    } catch { /* ignore corrupt data */ }
  }, []);

  // On every form change: backup to localStorage (debounced)
  const backupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hasLoadedRef.current) return; // Don't backup initial load
    if (backupTimerRef.current) clearTimeout(backupTimerRef.current);
    backupTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
      } catch { /* quota exceeded — non-critical */ }
    }, 2000);
    return () => { if (backupTimerRef.current) clearTimeout(backupTimerRef.current); };
  }, [formData]);

  // Clear localStorage backup after successful save
  const clearLocalBackup = () => {
    try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch {}
  };

  // Load Data
  useEffect(() => {
    if (localProgramId) {
      loadProgram();
    } else {
      generateDailyContent(1); // Start with 1 day for new programs
    }
  }, [localProgramId]);

  // Mark unsaved only AFTER initial load — use ref to skip first load
  useEffect(() => {
    if (!hasLoadedRef.current) {
      // Skip the first cycle (initial load / API data load)
      if (!loading) hasLoadedRef.current = true;
      return;
    }
    markAsUnsaved();
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

  /*
    THE STEPPER IS GONE (§21 item 5, 2026-09-09). Three wizard steps — Basic Info,
    Landing Page, Content Builder — became two SCREENS: Setup (the first two,
    merged: both describe the record and neither needs the other finished) and
    Content. A stepper turns a pair of editable things into a sequence you have to
    walk, and the builder is not a sequence.

    The step metadata that was worth keeping did not vanish: the day count that
    read "N Days (incl. Day 0 Onboarding)" is now the calendar overlay's header,
    and the step titles are the Setup screen's section headings.
  */

  // Navigation saves progress. Save preserves state. Publish changes lifecycle.
  const persistWizard = async (currentData: any, isAutoSave = false) => {
    setSaving(true);
    setSaveError(null);
    // Suppress auth sign-out during save — don't lose state on token expiry
    apiClient.suppressSignOut(true);
    try {
      // UNIFIED SYSTEM: Day 0 is now edited directly in the Content Builder.
      // If Day 0 exists in daily_content, use it as-is.
      // If Day 0 is missing, create it from legacy onboarding_questions (backward compat).
      const dailyContent = currentData.daily_content || [];
      const hasDay0 = dailyContent.some((d: any) => d.day === 0);
      
      let unifiedDailyContent: DayContent[];
      if (hasDay0) {
        // Day 0 already exists — use daily_content directly
        unifiedDailyContent = dailyContent;
      } else {
        // Fallback: create Day 0 from legacy onboarding_questions
        const onboardingBlocks = (currentData.onboarding_questions || []).map(mapQuestionToBlock);
        const onboardingDay: DayContent = {
          day: 0, title: 'Onboarding', description: 'Initial assessment',
          // FIXED 2026-09-04. This wrote `lesson` — a BLOCK type used as a day
          // type. `getPresetForDayType('lesson')` finds nothing, so
          // `validateBlockForDayType` returns early and the day skips every
          // content check. The same defect was fixed in `DayEditor` and lived
          // on here, in the Day-0 save path. `onboarding` is the stage this is.
          ...seedDayFromTemplate('onboarding'), activities: onboardingBlocks
        };
        unifiedDailyContent = [onboardingDay, ...dailyContent];
      }
      
      const payload = {
         ...currentData,
         daily_content: unifiedDailyContent,
         // Keep onboarding_questions in payload for legacy safety
      };

      let result;
      if (localProgramId) {
        result = await apiClient.updateEquipProgram(localProgramId, payload);
      } else {
        result = await apiClient.createEquipProgram(payload);
        setLocalProgramId(result.id); 
      }
      
      markAsSaved();
      clearLocalBackup();
      if (!isAutoSave) showToast('success', 'Saved', 'Changes saved successfully');
      return true;
    } catch (e: any) {
      const errorMsg = e?.message || 'Unknown error';
      const isAuthError = errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('Unauthorized');
      
      if (isAutoSave) {
        // CRITICAL FIX: Show auto-save failures instead of silently swallowing them
        setSaveError(isAuthError ? 'Session expired — please save manually or re-login' : 'Auto-save failed');
        console.error('Auto-save failed:', errorMsg);
      } else {
        showToast('error', 'Save Failed', isAuthError
          ? 'Your session expired. Please log in again and retry.'
          : 'Failed to save progress. Your changes are backed up locally.');
      }
      return false;
    } finally {
      apiClient.suppressSignOut(false);
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
       
       // DO NOT call loadProgram() here — it would overwrite any unsaved local changes.
       // The published flag is already updated in local state above.
       
    } catch (e) {
       showToast('error', 'Error', 'Failed to update status');
    } finally {
       setSaving(false);
    }
  };

  // Helper to get or create Day 0 (Onboarding)
  const getOnboardingDay = useCallback((): DayContent => {
    // Try to find Day 0 in daily_content first
    const existingDay0 = formData.daily_content?.find(d => d.day === 0);
    if (existingDay0) return existingDay0;

    // Fallback: Create from onboarding_questions
    const onboardingBlocks = (formData.onboarding_questions || []).map(mapQuestionToBlock);
    return {
      day: 0,
      title: 'Onboarding',
      description: 'Initial assessment',
      /*
        This wrote `dayType: 'lesson'` — a BLOCK type used as a day type, which
        matched no preset and so skipped every check. The same defect was fixed
        in DayComposer months ago and lived on here. It cannot recur: a day has
        no type, and a template is named from the same closed union.
      */
      ...seedDayFromTemplate('learning'),
      activities: onboardingBlocks
    };
  }, [formData.daily_content, formData.onboarding_questions]);

  // Memoize program prop for DailyBuilder to prevent unnecessary re-renders
  const builderProgram = useMemo(() => {
    const dc = formData.daily_content || [];
    const hasDay0 = dc.some(d => d.day === 0);
    return {
      ...formData,
      daily_content: hasDay0 ? dc : [getOnboardingDay(), ...dc]
    };
  }, [formData, getOnboardingDay]);

  // Stable callback for DailyBuilder
  const handleBuilderChange = useCallback((updatesOrUpdater: any) => {
    setFormData(prev => {
      const updates = typeof updatesOrUpdater === 'function' ? updatesOrUpdater(prev) : updatesOrUpdater;
      
      // If daily_content wasn't updated, just return merged state
      if (!updates.daily_content) return { ...prev, ...updates };

      const day0 = updates.daily_content.find((d: DayContent) => d.day === 0);
      const newQuestions = day0?.activities?.map(mapBlockToQuestion) || prev.onboarding_questions || [];
      return { ...prev, ...updates, onboarding_questions: newQuestions };
    });
  }, []);


  return (
    <DndProvider backend={HTML5Backend}>
    <>
      <BuilderShell
        topBar={
          <BuilderTopBar
            record={{ id: localProgramId ?? undefined, name: formData.title || 'Untitled Program', published: !!formData.published }}
            backLabel="Programmes"
            screen={screen}
            /*
              Screen changes carry the autosave the wizard's `onNext`/`onPrevious`
              did — validate then save going forward, save going back. Neither
              `persistWizard` nor `handlePublishToggle` was touched.
            */
            onScreenChange={async (next) => {
              if (next === 'content') {
                if (!validateForm(formDataRef.current)) {
                  showToast('error', 'Validation Error', 'Please correct the errors before proceeding');
                  return;
                }
                const saved = await persistWizard(formDataRef.current, true);
                if (saved) setScreen('content');
                return;
              }
              const saved = await persistWizard(formDataRef.current, true);
              if (saved) setScreen('setup');
            }}
            saving={saving}
            canPreview={(formData.daily_content || []).some(d => d.activities?.length > 0)}
            onPreview={() => setShowPlayerPreview(true)}
            onSave={() => persistWizard(formDataRef.current)}
            onPublishToggle={handlePublishToggle}
            onSaveAndClose={async () => {
              const saved = await persistWizard(formDataRef.current);
              if (saved) onSave();
            }}
            saveAndCloseLabel={localProgramId ? 'Save & Close' : 'Create Program'}
            onDelete={localProgramId ? () => setIsDeleteDialogOpen(true) : undefined}
            onExit={() => {
              if (hasUnsavedChanges) setShowWarning(true);
              else onBack();
            }}
          />
        }
        banner={
          /* The save-error strip. Autosave failures set it instead of toasting,
             which is why it has to live somewhere permanent. */
          saveError ? (
          <div
            className="flex items-center gap-3"
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-status-danger-light)',
              border: '1px solid var(--color-status-danger)',
              marginBottom: 16,
              fontFamily: 'var(--font-family-base)',
            }}
            role="alert"
          >
            <AlertCircle size={16} style={{ color: 'var(--color-status-danger)', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--color-text-primary)', flex: 1 }}>
              {saveError}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSaveError(null); persistWizard(formDataRef.current); }}
              className="h-7 px-3 text-xs shrink-0"
              style={{ borderColor: 'var(--color-status-danger)', color: 'var(--color-status-danger)' }}
            >
              Retry Save
            </Button>
            <button onClick={() => setSaveError(null)} className="p-0 border-none bg-transparent cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
              <X size={14} />
            </button>
          </div>
          ) : undefined
        }
      >
        {screen === 'setup' ? (
          <SetupScreen preview={<LandingPreviewCard data={formData} />}>
          <div>
            <UnifiedBasicInfoForm
              title={formData.title || ''}
              description={formData.description || ''}
              category={formData.category || 'mindfulness'}
              difficulty={formData.difficulty || 'beginner'}
              duration={formData.duration_days || 28}
              isPremium={formData.is_paid || false}
              price={formData.price || 0}
              onTitleChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
              onDescriptionChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              onCategoryChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              onDifficultyChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              onDurationChange={(value) => setFormData(prev => ({ ...prev, duration_days: value }))}
              onIsPremiumChange={(value) => setFormData(prev => ({ ...prev, is_paid: value }))}
              onPriceChange={(value) => setFormData(prev => ({ ...prev, price: value }))}
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
                      onChange={v => setFormData(prev => ({ ...prev, cover_image: v, thumbnail: v }))}
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

            {/* ── MILESTONE CHECK-IN CONFIGURATION ── */}
            <Card className="mt-6" style={{ border: '1px solid var(--color-border-default)' }}>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}>
                      Milestone Check-ins
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', marginTop: 2, lineHeight: 1.5 }}>
                      A 4-step modal (perceived change, confidence, continuation intent, feedback) shown at key points during the program.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Checkbox
                      id="checkin-enabled"
                      checked={(formData.checkInConfig ?? DEFAULT_CHECKIN_CONFIG).enabled}
                      onCheckedChange={(c) => {
                        const current = formData.checkInConfig ?? { ...DEFAULT_CHECKIN_CONFIG };
                        setFormData(prev => {
                          return { ...prev, checkInConfig: { ...current, enabled: !!c } };
                        });
                      }}
                    />
                    <Label htmlFor="checkin-enabled" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, fontFamily: 'var(--font-family-base)', cursor: 'pointer' }}>
                      Enabled
                    </Label>
                  </div>
                </div>

                {(formData.checkInConfig ?? DEFAULT_CHECKIN_CONFIG).enabled && (
                  <div className="space-y-4 pt-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                    {/* Trigger Days */}
                    <AdminFormField label="Trigger Days" description="Day numbers that show the check-in modal (comma-separated)">
                      <Input
                        value={(formData.checkInConfig?.triggerDays ?? DEFAULT_CHECKIN_CONFIG.triggerDays).join(', ')}
                        onChange={(e) => {
                          const days = e.target.value
                            .split(',')
                            .map(s => parseInt(s.trim()))
                            .filter(n => !isNaN(n) && n > 0);
                          setFormData(prev => {
                            const current = prev.checkInConfig ?? { ...DEFAULT_CHECKIN_CONFIG };
                            return { ...prev, checkInConfig: { ...current, triggerDays: days } };
                          });
                        }}
                        placeholder="e.g. 7, 14, 30"
                      />
                    </AdminFormField>

                    {/* Trigger on Last Day */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="checkin-last-day"
                        checked={(formData.checkInConfig ?? DEFAULT_CHECKIN_CONFIG).triggerOnLastDay}
                        onCheckedChange={(c) => {
                          setFormData(prev => {
                            const current = prev.checkInConfig ?? { ...DEFAULT_CHECKIN_CONFIG };
                            return { ...prev, checkInConfig: { ...current, triggerOnLastDay: !!c } };
                          });
                        }}
                      />
                      <Label htmlFor="checkin-last-day" className="cursor-pointer" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-base)', fontWeight: 400 }}>
                        Also trigger on the last day of the program
                      </Label>
                    </div>

                    {/* Custom Title */}
                    <AdminFormField label="Custom Modal Title" description="Optional — overrides program title in the check-in header">
                      <Input
                        value={formData.checkInConfig?.customTitle || ''}
                        onChange={(e) => {
                          setFormData(prev => {
                            const current = prev.checkInConfig ?? { ...DEFAULT_CHECKIN_CONFIG };
                            return { ...prev, checkInConfig: { ...current, customTitle: e.target.value || undefined } };
                          });
                        }}
                        placeholder="Leave blank to use program title"
                      />
                    </AdminFormField>

                    {/* Preview */}
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
                      <p style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        <strong style={{ fontWeight: 500 }}>Preview:</strong> Check-in will appear on 
                        {' '}Day{(formData.checkInConfig?.triggerDays ?? DEFAULT_CHECKIN_CONFIG.triggerDays).length > 1 ? 's' : ''}{' '}
                        <strong style={{ fontWeight: 500 }}>
                          {(formData.checkInConfig?.triggerDays ?? DEFAULT_CHECKIN_CONFIG.triggerDays).join(', ')}
                        </strong>
                        {(formData.checkInConfig ?? DEFAULT_CHECKIN_CONFIG).triggerOnLastDay && (
                          <> and <strong style={{ fontWeight: 500 }}>the last day</strong></>
                        )}
                        .{' '}Title: "<em>{formData.checkInConfig?.customTitle || formData.title || 'Program Title'}</em>"
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* LANDING PAGE — the second half of Setup, unchanged. */}
          <EquipLandingPageRichTextEditor 
            data={formData}
            onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
          />
          </SetupScreen>
        ) : (
          /* CONTENT — Day 0 = Onboarding, Day 1+ = daily sessions. */
          <DailyBuilder
            program={builderProgram}
            mode="equip"
            singleDayMode={false}
            onProgramChange={handleBuilderChange}
            /*
              `validationMode` was a prop with a default that nobody passed. A
              published programme is what a user actually reaches, so its content
              is held to the publish standard; a draft is advised, not policed.
            */
            validationMode={formData.published ? 'publish' : 'draft'}
            heightMode="fill"
          />
        )}
      </BuilderShell>

      {/* ── Player Preview Dialog ── */}
      {showPlayerPreview && (
        <div className="fixed inset-0 z-[100]" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <div className="absolute top-3 right-3 z-[101] flex items-center gap-2">
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-inverse)', backgroundColor: 'var(--color-primary-default)', padding: '4px 12px', borderRadius: 'var(--radius-pill)' }}>
              Preview Mode
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlayerPreview(false)}
              className="h-8 px-3 gap-1.5 shadow-lg"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <X size={14} /> Close Preview
            </Button>
          </div>
          <ProgramPlayer
            program={formData as EquipProgram}
            initialDay={1}
            onComplete={() => setShowPlayerPreview(false)}
            onExit={() => setShowPlayerPreview(false)}
            mode="preview"
          />
        </div>
      )}

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
    </DndProvider>
  );
}
