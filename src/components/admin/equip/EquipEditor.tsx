import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { EquipMetaEditor } from './EquipMetaEditor';
import { EquipLandingPageEditor } from './EquipLandingPageEditor';
import { EquipOnboardingEditor } from './EquipOnboardingEditor';
import { EquipDaysManager } from './EquipDaysManager';
import { useNotifications } from '../../../contexts/NotificationContext';
import { apiClient } from '../../../lib/api-client';
import { WizardLayout } from '../../ui/wizard-layout';
import { WizardStep } from '../../ui/wizard-stepper';

interface EquipEditorProps {
  programId?: string | null;
  onBack: () => void;
}

export function EquipEditor({ programId, onBack }: EquipEditorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(!!programId);
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotifications();

  useEffect(() => {
    if (programId) {
      loadProgram();
    } else {
      // New program shell
      setProgram({
        title: 'New Program',
        name: 'New Program',
        description: '',
        category: 'general',
        duration_days: 7,
        price_cents: 0,
        status: 'draft',
        slug: `program-${Date.now()}`,
        onboarding_questions: [],
        section1_eligibility_points: [],
        section2_bullets: [],
        section3_content: [],
        section4_benefits: [],
        section4_notes: []
      });
    }
  }, [programId]);

  const loadProgram = async () => {
    try {
      const data = await apiClient.getEquipProgram(programId!);
      if (!data.name && data.title) data.name = data.title;
      if (!data.title && data.name) data.title = data.name;
      setProgram(data);
    } catch (error) {
      showToast('error', 'Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (shouldExit = false) => {
    try {
      setSaving(true);
      const payload = { ...program };
      if (payload.name && !payload.title) payload.title = payload.name;
      
      let savedProgram;
      if (programId || (program.id && program.id.length > 10)) {
        const id = programId || program.id;
        savedProgram = await apiClient.updateEquipProgram(id, payload);
        showToast('success', 'Changes saved');
      } else {
        savedProgram = await apiClient.createEquipProgram(payload);
        showToast('success', 'Program created');
        // Update local state with new ID so subsequent saves work
        setProgram(savedProgram);
      }

      if (shouldExit) {
        onBack();
      }
      return savedProgram;
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to save');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const steps: WizardStep[] = [
    {
      id: 'meta',
      title: 'Program Basics',
      subtitle: 'Set up the core details of your program',
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'upcoming'
    },
    {
      id: 'landing',
      title: 'Landing Page',
      subtitle: 'Design the marketing page for this program',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming'
    },
    {
      id: 'onboarding',
      title: 'Onboarding Flow',
      subtitle: 'Configure questions for new enrollees',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming'
    },
    {
      id: 'curriculum',
      title: 'Curriculum',
      subtitle: 'Manage daily content and exercises',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'upcoming'
    }
  ];

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!program) return <div>Error loading program.</div>;

  return (
    <WizardLayout
      title={program.title || program.name}
      status={program.status === 'published' ? 'published' : 'draft'}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onExit={onBack}
      onSaveDraft={() => handleSave(false)}
      isLoading={saving}
      finishButtonText="Save & Finish"
      footerLeftContent={
        <Button 
          variant="ghost" 
          onClick={() => handleSave(true)}
          disabled={saving}
          className="text-gray-500 hover:text-gray-900 gap-2"
        >
          <Save size={16} />
          Save Draft
        </Button>
      }
      onNext={async () => {
        // Auto-save between steps if it's a new program to ensure ID exists
        if (!program.id && currentStep === 0) {
           await handleSave(false);
        } else {
           // Optional: Auto-save on every step change
           // await handleSave(false);
        }
        setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
      }}
      onPrevious={() => setCurrentStep(Math.max(currentStep - 1, 0))}
      onFinish={() => handleSave(true)}
    >
      {currentStep === 0 && (
        <EquipMetaEditor 
          program={program} 
          onChange={(updates: any) => setProgram({ ...program, ...updates })} 
        />
      )}
      {currentStep === 1 && (
        <EquipLandingPageEditor 
          program={program} 
          onChange={(updates: any) => setProgram({ ...program, ...updates })} 
        />
      )}
      {currentStep === 2 && (
        <EquipOnboardingEditor 
          program={program} 
          onChange={(updates: any) => setProgram({ ...program, ...updates })} 
        />
      )}
      {currentStep === 3 && (
        <EquipDaysManager 
          programId={program.id || programId} 
          durationDays={program.duration_days}
        />
      )}
    </WizardLayout>
  );
}
