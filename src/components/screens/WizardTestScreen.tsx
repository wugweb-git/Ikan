import { useState } from 'react';
import { Wizard } from '../wizard/Wizard';
import { WizardConfig } from '../wizard/types';
import { Button } from '../ui/button';

const TEST_CONFIG: WizardConfig = {
  id: 'test-wizard',
  title: 'Unified Wizard Test Suite',
  showProgress: true,
  progressType: 'bar',
  steps: [
    {
      id: 'intro',
      type: 'intro',
      title: 'Wizard Capability Test',
      description: 'This flow validates the 5 critical requirements: Global Keys, Multi-field Steps, Repeatable Structures, Matrix, and History.',
      nextLabel: 'Start Test'
    },
    {
      id: 'step-1-global',
      type: 'input',
      title: '1. Global Key Stability',
      description: 'Enter a value here. We will verify it appears in Step 3.',
      fields: [
        {
          id: 'user_name',
          type: 'text',
          label: 'What is your name?',
          placeholder: 'e.g. Alice',
          validation: { required: true }
        },
        {
            id: 'favorite_color',
            type: 'single_select',
            label: 'Pick a color',
            options: [
                { id: 'red', label: 'Red', value: 'red' },
                { id: 'blue', label: 'Blue', value: 'blue' }
            ]
        }
      ]
    },
    {
        id: 'step-2-multi',
        type: 'input',
        title: '2. Multi-Field Edge Cases',
        description: 'Testing mixed types and validation logic.',
        fields: [
            {
                id: 'notes',
                type: 'long_text',
                label: 'Detailed Notes',
                placeholder: 'Write something long...',
                validation: { required: true }
            },
            {
                id: 'is_urgent',
                type: 'boolean',
                label: 'Is this urgent?',
                options: [
                    { id: 'y', label: 'Yes', value: true },
                    { id: 'n', label: 'No', value: false }
                ]
            },
            {
                id: 'time_check',
                type: 'time',
                label: 'Time Check',
                description: 'Optional field'
            }
        ]
    },
    {
        id: 'step-3-surface',
        type: 'input', // Using input so we can see the info field
        title: '3. Data Surface & Logic',
        description: 'Hello {{user_name}}! You picked {{favorite_color}}.',
        fields: [
            {
                id: 'info_display',
                type: 'info',
                description: 'The text above should show your name and color from Step 1. This confirms Global Stable Keys.'
            },
            {
                id: 'skip_check',
                type: 'boolean',
                label: 'Skip the next step (Matrix)?',
                options: [
                    { id: 'y', label: 'Yes, skip it', value: true },
                    { id: 'n', label: 'No, show it', value: false }
                ]
            }
        ]
    },
    {
        id: 'step-4-matrix',
        type: 'input',
        title: '4. Matrix Isolation',
        condition: {
            fieldId: 'skip_check',
            value: false
        },
        fields: [
            {
                id: 'mood_matrix',
                type: 'matrix',
                label: 'Weekly Mood Check',
                columns: [
                    { id: '1', label: 'Low', value: 1 },
                    { id: '2', label: 'Medium', value: 2 },
                    { id: '3', label: 'High', value: 3 }
                ],
                rows: [
                    { id: 'mon', label: 'Monday', value: 'mon' },
                    { id: 'tue', label: 'Tuesday', value: 'tue' },
                    { id: 'wed', label: 'Wednesday', value: 'wed' }
                ]
            }
        ]
    },
    {
        id: 'step-5-repeatable',
        type: 'input',
        title: '5. Repeatable Structures',
        fields: [
            {
                id: 'shopping_list',
                type: 'text_list',
                label: 'Simple List (Max 3)',
                placeholder: 'Item name',
                validation: { maxItems: 3 }
            },
            {
                id: 'complex_list',
                type: 'row_list',
                label: 'Complex List',
                rowSchema: [
                    {
                        id: 'item_name',
                        type: 'text',
                        label: 'Item'
                    },
                    {
                        id: 'item_qty',
                        type: 'number',
                        label: 'Qty'
                    }
                ]
            }
        ]
    },
    {
        id: 'outro',
        type: 'outro',
        title: 'Test Complete',
        description: 'All systems operational. Check console for final JSON output.'
    }
  ]
};

export function WizardTestScreen({ onBack }: { onBack?: () => void }) {
  const [results, setResults] = useState<any>(null);

  const handleComplete = (data: any) => {
    console.log('Wizard Final Data:', data);
    setResults(data);
  };

  if (results) {
      return (
          <div className="p-8 max-w-2xl mx-auto space-y-4">
              <h1 className="text-2xl font-medium">Results JSON</h1>
              <pre className="bg-slate-100 p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(results, null, 2)}
              </pre>
              <Button onClick={() => window.location.reload()}>Restart</Button>
          </div>
      );
  }

  return (
    <Wizard 
      config={TEST_CONFIG}
      onComplete={handleComplete}
      onExit={onBack}
    />
  );
}