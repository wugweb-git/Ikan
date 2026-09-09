/**
 * Render harness for the day/block builder — DEV ONLY, not part of the build.
 *
 * `DayEditor` normally sits behind the admin login, which makes a visual change
 * to the block row unverifiable without credentials. This mounts the real
 * component on a fixture programme so the row can be looked at.
 *
 * Untracked on purpose: it is scaffolding, not product. Served at
 * /builder-harness.html by `vite` only; `vite build` has one entry (index.html).
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DayEditor } from '../components/blocks/DayComposer';
import type { DayContent } from '../lib/blocks/block-model';
import '../index.css';

const program: { id: string; title: string; daily_content: DayContent[] } = {
  id: 'harness',
  title: 'Harness',
  daily_content: [
    {
      day: 19,
      title: 'Journalling (Continued)',
      description: '',
      activities: [
        { id: 'b1', title: 'Welcome Back!', type: 'lesson', activity: 'read', content: '', duration: 4, required: true, order: 0, stepGroup: 'daily_reflection' },
        { id: 'b2', title: 'What journalling does to a loop', type: 'lesson', activity: 'view', content: '', duration: 3, required: true, order: 1, stepGroup: 'daily_reflection' },
        { id: 'b3', title: 'Emptying the mind', type: 'exercise', activity: 'input-table', content: '', duration: 6, required: true, order: 2, stepGroup: 'tf_identification', repeat: { type: 'simple_repeat', everyDay: true } },
        { id: 'b4', title: 'What did you notice?', type: 'journal', activity: 'ephemeral-journal', content: '', duration: 4, required: true, order: 3 },
        { id: 'b5', title: 'Energy today', type: 'check-in', activity: 'rating-scale', content: '', duration: 2, required: true, order: 4, repeat: { type: 'simple_repeat', onDays: [20, 21, 22] } },
        { id: 'b6', title: 'A repeat nobody finished', type: 'exercise', activity: 'multi-select', content: '', duration: 5, required: true, order: 5, repeat: { type: 'simple_repeat', onDays: [] } },
        { id: 'b7', title: 'Conclusion', type: 'conclude', activity: 'complete', content: '', duration: 5, required: true, order: 6, stepGroup: 'a_very_long_step_group_name' },
      ],
    },
    { day: 20, title: 'Day 20', description: '', activities: [] },
    { day: 21, title: 'Day 21', description: '', activities: [] },
    { day: 22, title: 'Day 22', description: '', activities: [] },
  ],
};

function Harness() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <DayEditor
          program={program}
          mode="equip"
          singleDayMode={false}
          onProgramChange={() => {}}
          validationMode="draft"
        />
      </div>
    </DndProvider>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><Harness /></StrictMode>);
