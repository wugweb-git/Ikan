
import React from 'react';
import { Wizard } from '../wizard/Wizard';
import { WizardConfig } from '../wizard/types';
import { Card, CardContent } from '../ui/card';

const SLEEP_TIGHT_TEST_CONFIG: WizardConfig = {
  id: 'sleep-tight-test',
  title: 'Sleep Tight: Intake Wizard Test',
  description: 'Verifying complex field interactions and persistence.',
  showProgress: true,
  progressType: 'bar',
  steps: [
    {
      id: 'intro',
      type: 'intro',
      title: 'Welcome to Sleep Tight',
      description: 'This wizard tests the new Unified Engine capabilities. We will verify multi-field steps, validation, and complex inputs.',
      nextLabel: 'Start Test'
    },
    {
      id: 'mixed_inputs_1',
      type: 'input',
      title: 'Mixed Inputs (Part 1)',
      description: 'Testing Long Text + Boolean combination.',
      fields: [
        {
          id: 'journal_entry',
          type: 'long_text',
          label: 'How was your sleep?',
          placeholder: 'Describe your night...',
          validation: { required: true }
        },
        {
          id: 'had_dreams',
          type: 'boolean',
          label: 'Did you have vivid dreams?',
          options: [
            { id: 'yes', label: 'Yes', value: true },
            { id: 'no', label: 'No', value: false }
          ]
        }
      ]
    },
    {
      id: 'mixed_inputs_2',
      type: 'input',
      title: 'Mixed Inputs (Part 2)',
      description: 'Testing Time + Number + Boolean combination.',
      fields: [
        {
          id: 'bed_time',
          type: 'time',
          label: 'Bed Time',
          validation: { required: true }
        },
        {
          id: 'sleep_quality',
          type: 'number',
          label: 'Quality (1-10)',
          validation: { min: 1, max: 10 }
        },
        {
          id: 'took_meds',
          type: 'boolean',
          label: 'Took Medication?',
          options: [
            { id: 'y', label: 'Yes', value: true },
            { id: 'n', label: 'No', value: false }
          ]
        }
      ]
    },
    {
      id: 'conditional_step',
      type: 'input',
      title: 'Conditional Step',
      description: 'This step only appears if you took medication.',
      condition: {
        fieldId: 'took_meds',
        value: true,
        operator: 'equals'
      },
      fields: [
        {
          id: 'medication_name',
          type: 'text',
          label: 'What medication did you take?',
          validation: { required: true }
        }
      ]
    },
    {
      id: 'repeatable_list',
      type: 'input',
      title: 'Repeatable Lists',
      description: 'Testing text_list with max items.',
      fields: [
        {
          id: 'worry_list',
          type: 'text_list',
          label: 'List your current worries (Max 5)',
          placeholder: 'I am worried about...',
          validation: { maxItems: 5 }
        }
      ]
    },
    {
      id: 'complex_rows',
      type: 'input',
      title: 'Complex Row List',
      description: 'Testing row_list with nested schema.',
      fields: [
        {
          id: 'medication_log',
          type: 'row_list',
          label: 'Medication Log',
          rowSchema: [
            { id: 'name', type: 'text', label: 'Medication Name', placeholder: 'Name' },
            { id: 'dosage', type: 'text', label: 'Dosage', placeholder: 'e.g. 5mg' },
            { id: 'time', type: 'time', label: 'Time Taken' }
          ]
        }
      ]
    },
    {
      id: 'matrix_test',
      type: 'input',
      title: 'Matrix / Grid',
      description: 'Testing matrix field isolation.',
      fields: [
        {
          id: 'symptom_matrix',
          type: 'matrix',
          label: 'Symptom Severity',
          rows: [
            { id: 'fatigue', label: 'Fatigue', value: 'fatigue' },
            { id: 'anxiety', label: 'Anxiety', value: 'anxiety' },
            { id: 'insomnia', label: 'Insomnia', value: 'insomnia' }
          ],
          columns: [
            { id: 'none', label: 'None', value: 0 },
            { id: 'mild', label: 'Mild', value: 1 },
            { id: 'moderate', label: 'Moderate', value: 2 },
            { id: 'severe', label: 'Severe', value: 3 }
          ]
        }
      ]
    },
    {
      id: 'review',
      type: 'custom', // Or just composite, but we'll use a summary step if we had one. For now, standard outro.
      title: 'Review',
      description: 'Check console for JSON output on complete.',
      fields: []
    }
  ]
};

export function WizardTest() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Card className="max-w-4xl mx-auto shadow-xl border-slate-200">
        <CardContent className="p-0">
          <Wizard 
            config={SLEEP_TIGHT_TEST_CONFIG} 
            onComplete={(results) => {
              console.log('✅ Wizard Completed:', results);
              alert('Wizard Completed! Check console for results.');
            }}
            onSave={(state) => console.log('💾 Auto-saved:', state)}
            onExit={() => alert('Exit requested')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
