import { useState, useEffect, useRef } from 'react';
import { Save, Trash2, ClipboardList, CircleHelp, Eye, Plus, GripVertical, X, Upload, EyeOff } from 'lucide-react';
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
import { WizardLayout } from '../ui/wizard-layout';
import { WizardStep } from '../ui/wizard-stepper';
import { AssessmentLandingPageRichTextEditor } from './AssessmentLandingPageRichTextEditor';
import { UnifiedBasicInfoForm } from '../admin/UnifiedBasicInfoForm';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { validateUrl } from '../../lib/validation';
import { useMetadata } from '../../hooks/useMetadata';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DayEditor as DailyBuilder } from './DayEditor';
import { DayContent, Activity, resolveInteraction } from '../../lib/equip-admin-types';
import { AdminLoading } from '../admin/AdminLoading';

// Normalize options to plain strings so the scoring-map key lookup matches
// regardless of whether the option was authored as a string or an
// {label,value} object.
//
// This MUST be applied on both sides of the round-trip. The load path used to
// normalize while the save path read `exerciseConfig.options` raw, so an
// object-shaped option stringified to the single key "[object Object]" — every
// option on that question collapsing onto one entry and the rest scoring 0 via
// the adapter's `q.scoring?.[opt] || 0` fallback.
export const normalizeOptions = (raw: any): string[] =>
  Array.isArray(raw)
    ? raw.map((opt: any) =>
        typeof opt === 'string' ? opt : String(opt?.label ?? opt?.text ?? opt?.value ?? opt)
      )
    : [];

// Adapter to convert legacy Question[] to Block[] (Activity[])
const convertQuestionsToDay = (questions: any[]): DayContent => {
  return {
    day: 1,
    title: 'Assessment Content',
    dayType: 'assessment',
    activities: questions.map((q, idx) => {
      const options: string[] = normalizeOptions(q.options);

      // Determine interaction + subtype from legacy question type. 'mcq' and
      // 'single-select' only differ in whether scoring is on — decide from
      // whether the question actually carries scoring data instead of
      // defaulting every unrecognized type to 'mcq' (which silently relabeled
      // single-choice questions and made them look scored when they weren't).
      const hasScoring = !!q.scoring && Object.keys(q.scoring).length > 0;
      let subtype: string = 'single-select';
      let interaction: string = 'select-one';
      if (q.type === 'multiple-choice') { subtype = 'multi-select'; interaction = 'select-many'; }
      else if (q.type === 'scale') { subtype = 'rating_scale'; interaction = 'rate'; }
      else if (q.type === 'text' || q.type === 'textarea') { subtype = 'ephemeral-journal'; interaction = 'write'; }
      else if (hasScoring) { subtype = 'mcq'; }

      // Carry real per-option weights forward instead of wiping them. This
      // used to hardcode weights: [], which is why scoring vanished every
      // time an existing question was opened in the editor.
      const weights = hasScoring ? options.map((opt) => q.scoring?.[opt] ?? 0) : [];

      return {
        id: q.id || `block-${idx}`,
        title: q.text || 'Untitled Question',
        type: 'exercise' as const,
        interaction: interaction as any,
        duration: q.timeLimit || 2,
        required: q.required !== false,
        autoAdvance: q.autoAdvance,
        stepGroup: q.stepGroup,
        image_url: q.icon || q.imageUrl,
        content: '',
        order: idx,
        exerciseConfig: {
          subtype: subtype as any,
          prompt: q.text,
          options,
          scoring: {
            enabled: hasScoring,
            weights,
          }
        }
      };
    })
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
  scoring_profile_id?: string;
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

// REMOVED: No hardcoded categoryOptions — KV is the single source of truth via useMetadata
// REMOVED: No hardcoded difficultyOptions — KV is the single source of truth via useMetadata

export function AssessmentEditPageWizard({ assessmentId, onBack, onSave }: AssessmentEditPageWizardProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!assessmentId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [localAssessmentId, setLocalAssessmentId] = useState(assessmentId);

  // Categories and difficulty from KV via useMetadata (no hardcoded fallbacks)
  const { categories: metaCategories, difficultyLevels: metaDifficulty, scoringMethods: metaScoringMethods } = useMetadata();

  // Scoring profiles from backend
  const [scoringProfiles, setScoringProfiles] = useState<Array<{ id: string; name: string }>>([]);
  useEffect(() => {
    apiClient.request('/admin/scoring-profiles', { method: 'GET' }, true, 0)
      .then((data: any) => {
        if (data?.profiles && Array.isArray(data.profiles)) {
          setScoringProfiles(data.profiles.map((p: any) => ({ id: p.id, name: p.name || p.id })));
        }
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState<Partial<Assessment>>({
    title: '',
    description: '',
    category: '',
    filter_type: 'assessment',
    duration: 10,
    difficulty: '',
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

  const hasLoadedRef = useRef(false);

  // ── Ref to always have the latest formData for saves ──────────
  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const handleArrayFieldChange = (field: keyof Assessment, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split('\n').filter(line => line.trim() !== '')
    }));
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
    if (!hasLoadedRef.current) {
      if (!loading) hasLoadedRef.current = true;
      return;
    }
    markAsUnsaved();
  }, [formData]);

  useEffect(() => {
    if (localAssessmentId) {
      loadAssessment();
    }
  }, [localAssessmentId]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      // No cache fallback in the editor: whatever loads here is autosaved back,
      // so a stale copy would overwrite newer server state.
      const data = await apiClient.getAssessment(localAssessmentId!, { allowCache: false });
      if (data && typeof data === 'object') {
        // CONVERSION LOGIC: Legacy Questions -> Daily Content
        //
        // `questions[]` is the canonical field: the backend serves it and the
        // player reads it through assessment-adapter. `daily_content` is the
        // builder's cache of it. This used to regenerate the cache only when it
        // was ENTIRELY absent, while persistWizard unconditionally rewrote
        // questions[] from it — so any edit made to questions[] outside this
        // wizard was silently reverted on the next autosave. Reconcile the two
        // on load and rebuild the cache from questions[] whenever they disagree.
        const questions: any[] = Array.isArray(data.questions) ? data.questions : [];
        const cachedActivities = data.daily_content?.[0]?.activities;

        if (questions.length > 0) {
          const questionIds = questions.map((q: any, idx: number) => q.id || `block-${idx}`);
          const cachedIds = Array.isArray(cachedActivities)
            ? cachedActivities.map((a: Activity) => a.id)
            : null;
          // Matching ids are NOT sufficient. Sleep and Balance both hold stale
          // pre-2026-08-06 `daily_content` weights — Sleep inverted, Balance
          // 1-based — while their ids and length match perfectly. An id-only
          // check leaves that cache in place, and the next save pushes the wrong
          // weights back over the repaired questions[].scoring: the exact
          // round-trip that caused the original corruption.
          //
          // So compare the weights too, against those derived from
          // questions[].scoring — the repaired, presets-validated source of
          // truth. Any disagreement rebuilds the cache from questions[].
          const derived = convertQuestionsToDay(questions).activities;
          const weightsOf = (a: any): string =>
            JSON.stringify(a?.exerciseConfig?.scoring?.weights ?? null);

          const inSync =
            cachedIds !== null &&
            cachedIds.length === questionIds.length &&
            cachedIds.every((id, i) => id === questionIds[i]) &&
            cachedActivities.every(
              (a: Activity, i: number) => weightsOf(a) === weightsOf(derived[i])
            );

          if (!inSync) {
            // Only warn when a cache actually existed and diverged; a missing
            // cache is the ordinary first-open case, not a conflict.
            if (cachedIds !== null) {
              showToast(
                'warning',
                'Rebuilt from saved questions',
                'The builder view disagreed with this assessment\'s saved questions — in ids, count or per-option weights — and has been rebuilt from them, which is the scored source of truth. Unsaved builder-only changes were discarded.'
              );
            }
            data.daily_content = [convertQuestionsToDay(questions)];
          }
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
      // SYNC BACK: Map daily_content blocks -> legacy questions for backward compat
      const scoringErrors: string[] = [];
      if (currentData.daily_content && currentData.daily_content.length > 0) {
          currentData.questions = currentData.daily_content[0].activities.map(block => {
              const subtype = block.exerciseConfig?.subtype;
              const interaction = resolveInteraction(block);
              // Map back to legacy question type. Prefer subtype (finer-grained)
              // over interaction, which collapses mcq/single-select/clinical/etc.
              // into one 'select-one' bucket and was relabeling every single-select
              // question as generic 'single-choice' with no scoring distinction.
              const legacyType = subtype === 'multi-select' ? 'multiple-choice'
                : subtype === 'rating_scale' ? 'scale'
                : subtype === 'ephemeral-journal' ? 'text'
                : interaction === 'select-many' ? 'multiple-choice'
                : interaction === 'rate' ? 'scale'
                : interaction === 'write' ? 'text'
                : 'single-choice'; // mcq, single-select, clinical, etc.

              // Rebuild the legacy scoring map (option label -> weight) from the
              // block's weights array instead of dropping it. This used to write
              // questions back with no `scoring` field at all, which is why
              // saved scoring vanished even when it survived the load step.
              // Normalize on save exactly as on load, so the keys written here
              // are the same strings the player will look up.
              const options: string[] = normalizeOptions(block.exerciseConfig?.options);
              const weights = block.exerciseConfig?.scoring?.weights;

              // A partial weights array is worse than none. Writing a scoring
              // map flips the player from its safe 0-based-index fallback to a
              // trusted lookup (`q.scoring?.[opt] || 0`), so any option without
              // a key silently scores 0. Typing "0,1" into the free-text weights
              // field for a 5-option question previously passed the old
              // `weights.length > 0` check and zero-scored options 3-5.
              // Require a weight for every option, or write no map at all.
              let scoring: Record<string, number> | undefined = undefined;
              if (block.exerciseConfig?.scoring?.enabled && Array.isArray(weights) && weights.length > 0) {
                if (weights.length === options.length) {
                  scoring = options.reduce((acc: Record<string, number>, opt: string, i: number) => {
                    acc[opt] = weights[i] ?? 0;
                    return acc;
                  }, {} as Record<string, number>);
                } else {
                  scoringErrors.push(
                    `"${block.exerciseConfig?.prompt || block.title || block.id}" — ${options.length} option(s) but ${weights.length} weight(s)`
                  );
                }
              }

              return {
                id: block.id,
                text: block.exerciseConfig?.prompt || block.title,
                type: legacyType,
                options,
                scoring,
                required: block.required,
                timeLimit: block.duration
              };
          });
      }

      // Surface dropped scoring even on autosave — silently saving an
      // assessment whose scoring just stopped being written is the exact
      // failure mode this editor already caused once.
      if (scoringErrors.length > 0) {
        showToast(
          'error',
          'Scoring not saved',
          `${scoringErrors.length} question(s) have a weight count that does not match their options, so their scoring was left off: ${scoringErrors.slice(0, 3).join('; ')}${scoringErrors.length > 3 ? '; …' : ''}`
        );
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
        // Must be genuinely current — the whole object is spread into the
        // PUT payload below, so a 24-hour-old cache would revert live edits.
        const serverData = await apiClient.getAssessment(localAssessmentId, { allowCache: false });
        
        // Validation for Publish — check daily_content blocks (source of truth)
        if (!serverData.published) {
             const blockCount = serverData.daily_content?.[0]?.activities?.length || (serverData.questions || []).length;
             if (blockCount === 0) {
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

  // LEGACY QUESTION FUNCTIONS REMOVED — Assessment editing now uses DailyBuilder (daily_content)
  // addQuestion, updateQuestion, deleteQuestion are no longer needed.

  const addResultCategory = () => {
    setFormData(prev => ({
      ...prev,
      resultCategories: [
        ...(prev.resultCategories || []),
        { min: 0, max: 10, label: 'New Category', description: '' }
      ]
    }));
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
      subtitle: `${(formData.daily_content?.[0]?.activities || formData.questions || []).length} blocks`,
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
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <AdminLoading message="Loading assessment..." />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
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
        onSaveDraft={() => persistWizard(formDataRef.current)}
        onNext={async () => {
          if (validateForm(formDataRef.current)) {
             await persistWizard(formDataRef.current, true);
             setCurrentStep(s => Math.min(s + 1, 3));
          } else {
             showToast('error', 'Validation Error', 'Please complete required fields');
          }
        }}
        onPrevious={async () => {
           await persistWizard(formDataRef.current, true);
           setCurrentStep(s => Math.max(s - 1, 0));
        }}
        onFinish={async () => {
           await persistWizard(formDataRef.current);
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
              className="h-8 w-8 p-0 border-none shadow-none"
              style={{ backgroundColor: 'var(--color-status-danger-light)', color: 'var(--color-status-danger)' }}
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
              onClick={() => persistWizard(formDataRef.current)}
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
              category={formData.category || ''}
              difficulty={formData.difficulty || ''}
              duration={formData.duration || 5}
              isPremium={formData.is_premium || false}
              price={formData.price || 0}
              onTitleChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
              onDescriptionChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              onCategoryChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
              onDifficultyChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
              onDurationChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
              onIsPremiumChange={(value) => setFormData(prev => ({ ...prev, is_premium: value }))}
              onPriceChange={(value) => setFormData(prev => ({ ...prev, price: value }))}
              config={{
                titleLabel: 'Assessment Title',
                descriptionLabel: 'Description',
                categoryLabel: 'Topic Category',
                durationLabel: 'Duration',
                durationUnit: 'minutes',
                imageLabel: 'Assessment Image (Thumbnail)',
                subtitle: 'Configure assessment details',
                // No explicit categories — UnifiedBasicInfoForm uses useMetadata internally
                showAssessmentType: true,
                assessmentType: formData.filter_type || 'assessment',
                onAssessmentTypeChange: (value) => setFormData(prev => ({ ...prev, filter_type: value })),
                showPaywall: true
              }}
              renderImageSection={() => (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    <ImageUpload
                      value={formData.thumbnail || ''}
                      onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
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
              onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
            />
          </div>
        )}

        {/* Step 2: Questions (Unified Daily Builder) */}
        {currentStep === 2 && (
           <DailyBuilder
             program={formData}
             mode="assessment"
             singleDayMode={true}
             onProgramChange={(updates) => setFormData(prev => ({ ...prev, ...(typeof updates === 'function' ? updates(prev) : updates) }))}
           />
        )}

        {/* Step 3: Scoring & Results */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="p-6 rounded-xl space-y-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
              <h3 className="text-lg font-medium border-b pb-2">Scoring Configuration</h3>
              
              <AdminFormField label="Scoring Method">
                <Select
                  value={formData.scoringMethod || 'sum'}
                  onValueChange={(v: any) => setFormData(prev => ({ ...prev, scoringMethod: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {metaScoringMethods.length > 0 ? (
                      metaScoringMethods.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="sum">Sum of Values</SelectItem>
                        <SelectItem value="average">Average Score</SelectItem>
                        <SelectItem value="weighted">Weighted Sum</SelectItem>
                        <SelectItem value="custom">Custom Logic</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </AdminFormField>
              
              {scoringProfiles.length > 0 && (
                <AdminFormField label="Scoring Profile" description="Link to a scoring profile from the Scoring Engine for severity band mapping">
                  <Select
                    value={formData.scoring_profile_id || '_none'}
                    onValueChange={(v: any) => setFormData(prev => ({ ...prev, scoring_profile_id: v === '_none' ? undefined : v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select a scoring profile..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None (use default percentage bands)</SelectItem>
                      {scoringProfiles.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </AdminFormField>
              )}

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
                            className="h-6 w-6"
                            style={{ color: 'var(--color-text-muted)' }}
                            onClick={() => {
                              setFormData(prev => {
                                const newCats = [...(prev.resultCategories || [])];
                                newCats.splice(idx, 1);
                                return { ...prev, resultCategories: newCats };
                              });
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
                                setFormData(prev => {
                                  const newCats = [...(prev.resultCategories || [])];
                                  newCats[idx] = { ...newCats[idx], min: parseInt(e.target.value) || 0 };
                                  return { ...prev, resultCategories: newCats };
                                });
                              }}
                            />
                          </AdminFormField>
                          <AdminFormField label="Max Score">
                            <Input 
                              type="number" 
                              value={cat.max} 
                              onChange={(e) => {
                                setFormData(prev => {
                                  const newCats = [...(prev.resultCategories || [])];
                                  newCats[idx] = { ...newCats[idx], max: parseInt(e.target.value) || 0 };
                                  return { ...prev, resultCategories: newCats };
                                });
                              }}
                            />
                          </AdminFormField>
                        </div>
                        
                        <AdminFormField label="Label">
                          <Input 
                            value={cat.label} 
                            onChange={(e) => {
                              setFormData(prev => {
                                const newCats = [...(prev.resultCategories || [])];
                                newCats[idx] = { ...newCats[idx], label: e.target.value };
                                return { ...prev, resultCategories: newCats };
                              });
                            }}
                            placeholder="e.g. Mild Anxiety"
                          />
                        </AdminFormField>
                        
                        <AdminFormField label="Description">
                          <Textarea 
                            value={cat.description} 
                            onChange={(e) => {
                              setFormData(prev => {
                                const newCats = [...(prev.resultCategories || [])];
                                newCats[idx] = { ...newCats[idx], description: e.target.value };
                                return { ...prev, resultCategories: newCats };
                              });
                            }}
                            placeholder="Feedback shown to user..."
                          />
                        </AdminFormField>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {(formData.resultCategories || []).length === 0 && (
                    <div className="text-center p-6 border border-dashed rounded-lg" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
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
    </DndProvider>
  );
}