/**
 * The new editor pane, on its own — DEV ONLY, not part of the build.
 *
 * Phase 3 of the §21 port ships `BlockEditorPane` unreferenced by product code,
 * so it can be looked at and driven before phase 4 puts it in front of an author.
 * Pick a block on the left; the pane on the right is the real component with
 * real catalog data.
 */
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BlockEditorPane } from '../src/admin/builder/editor/BlockEditorPane';
import type { Activity } from '../src/shared/blocks/block-model';
import { DAY_TYPE_POLICIES } from '../src/shared/blocks/day-policy';
import '../src/product/styles/index.css';
import '../src/admin/styles/index.css';

const FIXTURES: Activity[] = [
  { id: 'b1', title: 'Welcome Back!', type: 'lesson', activity: 'read', content: '<p>Some prose.</p>', duration: 4, required: true, order: 0, stepGroup: 'daily_reflection' },
  { id: 'b2', title: 'Emptying the mind', type: 'exercise', activity: 'input-table', content: '', duration: 6, required: true, order: 1, stepGroup: 'tf_identification', repeat: { type: 'simple_repeat', everyDay: true }, activityConfig: { subtype: 'input-table', columns: ['Mon', 'Tue'], key: 'emptying' } },
  { id: 'b3', title: 'Which of these do you do?', type: 'exercise', activity: 'multi-select', content: '', duration: 3, required: true, order: 2, activityConfig: { subtype: 'multi-select', options: ['Walk', 'Read'] } },
  { id: 'b4', title: 'What did you notice?', type: 'journal', activity: 'ephemeral-journal', content: 'Write freely.', duration: 4, required: true, order: 3 },
  { id: 'b5', title: 'Energy today', type: 'check-in', activity: 'rating-scale', content: '', duration: 2, required: true, order: 4 },
  { id: 'b6', title: 'Conclusion', type: 'conclude', activity: 'complete', content: 'Done for today.', duration: 5, required: true, order: 5 },
] as unknown as Activity[];

function Preview() {
  const [blocks, setBlocks] = useState(FIXTURES);
  const [i, setI] = useState(1);
  const block = blocks[i];
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-bg-muted)' }}>
      <div style={{ width: 240, borderRight: '1px solid var(--color-border-default)', background: 'var(--color-bg-card)', padding: 8 }}>
        {blocks.map((b, n) => (
          <button
            key={b.id}
            onClick={() => setI(n)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '7px 9px', marginBottom: 4,
              borderRadius: 'var(--radius-md)', fontSize: 12,
              background: n === i ? 'var(--color-bg-muted)' : 'transparent',
              fontWeight: n === i ? 600 : 400,
            }}
          >
            {b.type} · {b.title}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <BlockEditorPane
          key={block.id}
          block={block}
          onChange={(u) => setBlocks(prev => prev.map((b, n) => (n === i ? { ...b, ...u } : b)))}
          onDelete={() => {}}
          dayPolicy={DAY_TYPE_POLICIES['learning']}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><Preview /></StrictMode>);
