import { LayoutTemplate } from 'lucide-react';
import { Assessment } from './AssessmentEditPageWizard';
import { AdminFormField } from '../ui/kit/AdminFormField';
import { Textarea } from '../ui/textarea';

interface AssessmentLandingPageRichTextEditorProps {
  data: Partial<Assessment>;
  onChange: (updates: Partial<Assessment>) => void;
}

export function AssessmentLandingPageRichTextEditor({ data, onChange }: AssessmentLandingPageRichTextEditorProps) {
  
  const updateField = (key: keyof Assessment, value: any) => {
    onChange({ [key]: value });
  };

  const updateBullet = (index: number, value: string) => {
    const bullets = [...(data.section2_bullets || [])];
    bullets[index] = value;
    onChange({ section2_bullets: bullets });
  };

  const addBullet = () => {
    const bullets = [...(data.section2_bullets || []), ''];
    onChange({ section2_bullets: bullets });
  };

  const removeBullet = (index: number) => {
    const bullets = [...(data.section2_bullets || [])];
    bullets.splice(index, 1);
    onChange({ section2_bullets: bullets });
  };

  const updateNote = (index: number, value: string) => {
    const notes = [...(data.section4_notes || [])];
    notes[index] = { title: value, description: '' };
    onChange({ section4_notes: notes });
  };

  const addNote = () => {
    const notes = [...(data.section4_notes || []), { title: '', description: '' }];
    onChange({ section4_notes: notes });
  };

  const removeNote = (index: number) => {
    const notes = [...(data.section4_notes || [])];
    notes.splice(index, 1);
    onChange({ section4_notes: notes });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-4 flex items-start gap-3" style={{ backgroundColor: 'var(--color-info-light)', border: '1px solid var(--color-info-default)' }}>
        <LayoutTemplate className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-info-default)' }} />
        <div>
          <h4 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-info-default)' }}>Section 2: Landing Page Content</h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-info-default)' }}>
            Configure the main assessment information displayed in the bento grid. Section titles are fixed.
          </p>
        </div>
      </div>

      <div className="space-y-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
        <h3 className="text-lg font-medium border-b pb-2">What is this assessment?</h3>
        
        <AdminFormField label="Description (2-3 paragraphs)" required>
          <Textarea
            value={data.section2_content || ''}
            onChange={(e) => updateField('section2_content', e.target.value)}
            placeholder="Enter 2-3 paragraphs describing what this assessment measures...&#10;&#10;Example:&#10;This assessment helps you understand how stressed or overwhelmed you've been feeling lately, and whether life has felt manageable or out of control.&#10;&#10;It focuses on how you've been responding to everyday pressures—at work, at home, or in your personal life—and how often stress has affected your thoughts and emotions."
            rows={6}
          />
        </AdminFormField>

        <AdminFormField 
          label="What it measures (3 items - one per line)" 
          required
          help="Enter exactly 3 items, one per line. Each will display with a checkmark icon."
        >
          <Textarea
            value={(data.section2_bullets || []).join('\n')}
            onChange={(e) => {
              const lines = e.target.value.split('\n').slice(0, 3);
              updateField('section2_bullets', lines);
            }}
            placeholder="Perceived stress and overwhelm&#10;Sense of control vs pressure&#10;How unpredictable or demanding life has felt"
            rows={3}
          />
        </AdminFormField>
      </div>

      <div className="space-y-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
        <h3 className="text-lg font-medium border-b pb-2">Things to Remember Before You Start</h3>
        
        <AdminFormField 
          label="4 reminder items (one per line)" 
          required
          help="Enter exactly 4 items, one per line."
        >
          <Textarea
            value={(data.section4_notes || []).map(n => typeof n === 'string' ? n : n.title).join('\n')}
            onChange={(e) => {
              const lines = e.target.value.split('\n').slice(0, 4);
              const notes = lines.map(line => ({ title: line, description: '' }));
              updateField('section4_notes', notes);
            }}
            placeholder="Answer based on how you've felt over the &lt;strong&gt;past month&lt;/strong&gt;&#10;Choose the option that best reflects your experience&#10;There are no right or wrong answers&#10;Results are shown immediately after completion"
            rows={4}
          />
        </AdminFormField>
      </div>

      <div className="space-y-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
        <h3 className="text-lg font-medium border-b pb-2">Important</h3>
        
        <AdminFormField 
          label="Important notes (2 items - one per line)" 
          required
          help="Enter exactly 2 important safety notes, one per line."
        >
          <Textarea
            value={[
              (data.metadata as any)?.important_note_1 || '',
              (data.metadata as any)?.important_note_2 || ''
            ].join('\n')}
            onChange={(e) => {
              const lines = e.target.value.split('\n');
              onChange({ 
                metadata: { 
                  ...data.metadata, 
                  important_note_1: lines[0] || '',
                  important_note_2: lines[1] || ''
                }
              });
            }}
            placeholder="This is a self-help and awareness tool, not a medical diagnosis&#10;Not intended for emergency or crisis situations"
            rows={2}
          />
        </AdminFormField>
      </div>
    </div>
  );
}