import type React from 'react';
import { Layers } from 'lucide-react';
import { hasContentField, contentLabelFor, contentPlaceholderFor } from '../block-builder/model/block-fields';
// Template building blocks shared with the editor mocks
import {
  blockFormClasses,
  BlockHeaderBar,
  FieldLabel,
  MockInput,
  MockTextarea,
  MockSelect,
  MockCheckbox,
  FieldGrid,
  SectionDivider,
  MockMediaUpload,
  IndentedSection,
} from './AdminBlockFormTemplate';

// ── Block type definitions ──────────────────────────────────────
// These are structural — they drive editor UI behavior and rendering logic.
export interface BlockTypeInfo {
  value: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  category: 'checkin' | 'equip';
  fields: string[];
  previewHint: string;
}

// ── Editor Preview Renderer (uses AdminBlockFormTemplate) ────────
export function EditorPreview({ block }: { block: BlockTypeInfo }) {
  const Icon = block.icon;
  const isEquip = block.category === 'equip';

  if (isEquip) {
    return (
      <div className={blockFormClasses.wrap}>
        {/* Equip editor header — matches BlockEditor card header */}
        <BlockHeaderBar
          icon={<Icon size={12} className="text-[var(--color-primary-default)]" />}
          typeBadge={block.value}
          title={`Sample ${block.label}`}
        />
        <div className={blockFormClasses.body}>
          {/* Title + Type row — matches BlockEditor grid */}
          <FieldGrid>
            <div>
              <FieldLabel>Block Title</FieldLabel>
              <MockInput>Introduction to Sleep</MockInput>
            </div>
            <div>
              <FieldLabel>Type</FieldLabel>
              <MockSelect>{block.label}</MockSelect>
            </div>
          </FieldGrid>

          {/* Subtitle */}
          <div>
            <FieldLabel>Block Subtitle</FieldLabel>
            <MockInput>Understanding your sleep patterns</MockInput>
          </div>

          {/* Content / Prompt — matches BlockEditor content section */}
          {hasContentField(block.value) && (
            <div>
              <FieldLabel>
                {contentLabelFor(block.value)}
              </FieldLabel>
              <MockTextarea height="56px">
                <span className="opacity-50">
                  {contentPlaceholderFor(block.value)}
                </span>
              </MockTextarea>
            </div>
          )}

          {/* Exercise config — matches BlockEditor exercise section */}
          {block.value === 'exercise' && (
            <IndentedSection>
              <div>
                <FieldLabel>Activity</FieldLabel>
                <MockSelect>Multiple Choice Question</MockSelect>
              </div>
              <div>
                <FieldLabel>Prompt / Question</FieldLabel>
                <MockInput>Which of these habits do you do?</MockInput>
              </div>
              <div>
                <FieldLabel>Options (One per line)</FieldLabel>
                <MockTextarea>Option 1{'\n'}Option 2{'\n'}Option 3</MockTextarea>
              </div>
            </IndentedSection>
          )}

          {/* Checklist items — matches BlockEditor checklist section */}
          {block.value === 'checklist' && (
            <div>
              <FieldLabel>Checklist Items (One per line)</FieldLabel>
              <MockTextarea>Brush teeth{'\n'}Read book{'\n'}Turn off phone</MockTextarea>
            </div>
          )}

          {/* Wizard Flow — matches BlockEditor autoAdvance / required */}
          <SectionDivider label="Wizard Flow" icon={<Layers size={10} className="text-[var(--color-primary-default)]" />} />
          <FieldGrid>
            <MockCheckbox label="Auto-Advance" checked />
            <MockCheckbox label="Required" />
          </FieldGrid>

          {/* Media — matches BlockEditor image_url section */}
          <MockMediaUpload />
        </div>
      </div>
    );
  }

  // Check-in editor preview — matches AdminCheckinTemplateBuilder step editor
  return (
    <div className={blockFormClasses.wrap}>
      <BlockHeaderBar
        emoji="🤔"
        typeBadge={block.value}
        title="Step 1"
      />
      <div className={blockFormClasses.body}>
        {/* Question — matches AdminCheckinTemplateBuilder question field */}
        <div>
          <FieldLabel>Question</FieldLabel>
          <MockInput>
            {block.value === 'emoji_scale' ? 'How are you feeling?'
              : block.value === 'free_text' ? "What's on your mind?"
              : block.value === 'slider' ? 'Rate your stress level'
              : block.value === 'yes_no' ? 'Did you take your medication?'
              : block.value === 'single_choice' ? 'How did you sleep?'
              : 'What activities did you do?'}
          </MockInput>
        </div>

        {/* Subtitle */}
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <MockInput>Select the option that best describes you</MockInput>
        </div>

        {/* Hero Emoji + Type — matches AdminCheckinTemplateBuilder grid */}
        <FieldGrid>
          <div>
            <FieldLabel>Hero Emoji</FieldLabel>
            <MockInput>🤔</MockInput>
          </div>
          <div>
            <FieldLabel>Type</FieldLabel>
            <MockSelect>{block.label}</MockSelect>
          </div>
        </FieldGrid>

        {/* Scale / Source — matches AdminCheckinTemplateBuilder (emoji_scale & multi_select) */}
        {['emoji_scale', 'multi_select'].includes(block.value) && (
          <div>
            <FieldLabel>Scale / Source</FieldLabel>
            <MockSelect>
              {block.value === 'emoji_scale' ? '😊 mood (5 items)' : 'Select scale...'}
            </MockSelect>
          </div>
        )}

        {/* Options — matches AdminCheckinTemplateBuilder options textarea */}
        {['multi_select', 'single_choice'].includes(block.value) && (
          <div>
            <FieldLabel>Options (One per line)</FieldLabel>
            <MockTextarea>Option 1{'\n'}Option 2{'\n'}Option 3</MockTextarea>
          </div>
        )}

        {/* Slider — matches AdminCheckinTemplateBuilder slider config */}
        {block.value === 'slider' && (
          <FieldGrid>
            <div>
              <FieldLabel>Min</FieldLabel>
              <MockInput>0</MockInput>
            </div>
            <div>
              <FieldLabel>Max</FieldLabel>
              <MockInput>10</MockInput>
            </div>
          </FieldGrid>
        )}

        {/* EMA Category + Save As — matches AdminCheckinTemplateBuilder */}
        <FieldGrid>
          <div>
            <FieldLabel>EMA Category</FieldLabel>
            <MockSelect><span className="opacity-50">Select...</span></MockSelect>
          </div>
          <div>
            <FieldLabel>Save As</FieldLabel>
            <MockInput mono>mood_score</MockInput>
          </div>
        </FieldGrid>

        {/* Required — matches AdminCheckinTemplateBuilder */}
        <MockCheckbox label="Required" />
      </div>
    </div>
  );
}
