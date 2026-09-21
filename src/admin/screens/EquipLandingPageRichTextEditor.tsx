import { EquipProgram } from '../block-builder/model/block-model';
import { Textarea } from '../ui/textarea';
import { AdminFormField } from '../components/AdminFormField';

interface EquipLandingPageRichTextEditorProps {
  data: Partial<EquipProgram>;
  onChange: (updates: Partial<EquipProgram>) => void;
}

export function EquipLandingPageRichTextEditor({ data, onChange }: EquipLandingPageRichTextEditorProps) {
  
  const updateMetadata = (key: string, value: any) => {
    const currentMetadata = data.metadata || {};
    onChange({
      metadata: {
        ...currentMetadata,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
        <h3 className="text-lg font-medium border-b pb-2">What is this program about?</h3>
        
        <AdminFormField label="Description" required helpText="Describe the program, its purpose, duration, and what participants will work on.">
          <Textarea
            value={data.metadata?.tile1_content || ''}
            onChange={(e) => updateMetadata('tile1_content', e.target.value)}
            placeholder="Example: Sleep Tight is a guided, self-help program designed to help you understand and improve your sleep. Over the next 18 days, you'll identify factors that disrupt your sleep and gradually build healthier sleep patterns..."
            className="min-h-[120px] resize-none"
            rows={6}
          />
        </AdminFormField>

        <AdminFormField 
          label="Is this for you? (5 lines)" 
          required
          helpText="Enter intro line and 4 eligibility points (one per line, 5 lines total)."
        >
          <Textarea
            value={[
              data.metadata?.eligibility_intro || '',
              data.metadata?.eligibility_point_1 || '',
              data.metadata?.eligibility_point_2 || '',
              data.metadata?.eligibility_point_3 || '',
              data.metadata?.eligibility_point_4 || ''
            ].join('\n')}
            onChange={(e) => {
              const lines = e.target.value.split('\n');
              const updates = {
                metadata: {
                  ...data.metadata,
                  eligibility_intro: lines[0] || '',
                  eligibility_point_1: lines[1] || '',
                  eligibility_point_2: lines[2] || '',
                  eligibility_point_3: lines[3] || '',
                  eligibility_point_4: lines[4] || ''
                }
              };
              onChange(updates);
            }}
            placeholder="Sleep Tight may be helpful if:&#10;You have trouble falling asleep or staying asleep&#10;You find yourself worrying about your sleep&#10;You wake up too early and struggle to fall back asleep&#10;Poor sleep is starting to affect your day-to-day life"
            rows={5}
            className="resize-none font-mono text-sm"
          />
        </AdminFormField>
      </div>

      <div className="space-y-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
        <h3 className="text-lg font-medium border-b pb-2">The program includes:</h3>
        
        <AdminFormField 
          label="Program components (4-6 items - one per line)" 
          required
          helpText="Enter key program components, one per line."
        >
          <Textarea
            value={data.metadata?.tile2_content || ''}
            onChange={(e) => updateMetadata('tile2_content', e.target.value)}
            placeholder="Daily micro-lessons (5-10 minutes)&#10;Evidence-based CBT techniques&#10;Progress tracking &amp; insights&#10;Personalized sleep plan"
            className="min-h-[120px] resize-none"
            rows={6}
          />
        </AdminFormField>
      </div>

      <div className="space-y-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
        <h3 className="text-lg font-medium border-b pb-2">How it works</h3>
        
        <AdminFormField 
          label="Process steps (3-4 items - one per line)" 
          required
          helpText="Describe the step-by-step process, one step per line."
        >
          <Textarea
            value={data.metadata?.tile3_content || ''}
            onChange={(e) => updateMetadata('tile3_content', e.target.value)}
            placeholder="Complete your daily lesson at your own pace&#10;Track your sleep patterns and progress&#10;Practice new techniques each day&#10;Review your insights and adjust your plan"
            className="min-h-[100px] resize-none"
            rows={5}
          />
        </AdminFormField>
      </div>

      <div className="space-y-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
        <h3 className="text-lg font-medium border-b pb-2">What you'll gain</h3>
        
        <AdminFormField 
          label="Benefits (4 items with descriptions)" 
          required
          helpText="Format: Title - Description (one per line). Example: Better Sleep - Fall asleep faster and wake up refreshed"
        >
          <Textarea
            value={data.metadata?.tile4_content || ''}
            onChange={(e) => updateMetadata('tile4_content', e.target.value)}
            placeholder="Better Sleep Quality - Fall asleep faster and wake up refreshed&#10;Reduced Sleep Anxiety - Stop worrying about sleep and feel more in control&#10;Sustainable Habits - Build routines that last beyond the program&#10;Improved Daily Energy - Feel more alert and energized during the day"
            className="min-h-[120px] resize-none"
            rows={6}
          />
        </AdminFormField>
      </div>
    </div>
  );
}