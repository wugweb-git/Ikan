import React from 'react';
import { uiBlocksConfig, type BlockName, type BlockConfig } from '../../lib/ui-blocks';
import { ConstraintContainer, BlockLayout } from './BlockLayout';
import { cn } from '../ui/utils';

// Import block components
import { WellbeingSnapshotWidget, NeedsAttentionWidget, MoodJournalCalendar } from './widgets';
import { 
  ResourceCard, 
  UserAvatar, 
  TextInput, 
  SwitchToggle, 
  ButtonPrimary, 
  ButtonLink,
  ProgressBar,
  ConsultationDirectoryCard,
  MoodJournalEmojiSet,
  AssessmentCard,
  Stepper,
  ModalAssessmentIntro,
  ChatPreviewCard,
  ModalSupportChat,
  BlogCard 
} from './components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Component registry
const componentRegistry = {
  // Widgets
  WellbeingSnapshotWidget,
  NeedsAttentionWidget,
  MoodJournalCalendar,
  
  // Components
  ResourceCard,
  UserAvatar,
  TextInput,
  SwitchToggle,
  ButtonPrimary,
  ButtonLink,
  ProgressBar,
  ConsultationDirectoryCard,
  MoodJournalEmojiSet,
  AssessmentCard,
  Stepper,
  ModalAssessmentIntro,
  ChatPreviewCard,
  ModalSupportChat,
  BlogCard,
  Tabs: ({ tabs, ...props }: { tabs: string[] }) => (
    <Tabs defaultValue={tabs[0]?.toLowerCase()} {...props}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab.toLowerCase()}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab} value={tab.toLowerCase()}>
          {tab} content
        </TabsContent>
      ))}
    </Tabs>
  )
};

interface BlockItemProps {
  item: {
    widget?: string;
    component?: string;
    props?: Record<string, any>;
  };
  blockInteractions?: string[];
}

function BlockItem({ item, blockInteractions }: BlockItemProps) {
  const componentName = item.widget || item.component;
  if (!componentName) return null;

  const Component = componentRegistry[componentName as keyof typeof componentRegistry];
  if (!Component) {
    console.warn(`Component ${componentName} not found in registry`);
    return (
      <div className="p-4 border border-dashed border-muted-foreground/50 rounded-md">
        <span className="text-muted-foreground text-sm">
          {componentName} (not implemented)
        </span>
      </div>
    );
  }

  return <Component {...(item.props || {})} interactions={blockInteractions} />;
}

interface BlockRendererProps {
  blockName: BlockName;
  className?: string;
  overrides?: {
    items?: Array<{
      widget?: string;
      component?: string;
      props?: Record<string, any>;
    }>;
    className?: string;
  };
}

export function BlockRenderer({ blockName, className, overrides }: BlockRendererProps) {
  const blockConfig = uiBlocksConfig.blocks[blockName];
  
  if (!blockConfig) {
    console.warn(`Block ${blockName} not found in configuration`);
    return null;
  }

  const { constraints, layout, grid, items, interactions } = blockConfig;
  const finalItems = overrides?.items || items;

  const renderContent = () => {
    if (grid) {
      return (
        <BlockLayout
          type="grid"
          gap={grid.gap}
          columns={grid.columns}
          responsive={grid.responsive}
          className={overrides?.className}
        >
          {finalItems.map((item, index) => (
            <BlockItem 
              key={index} 
              item={item} 
              blockInteractions={interactions}
            />
          ))}
        </BlockLayout>
      );
    }

    if (layout) {
      return (
        <BlockLayout
          type={layout.type as 'row' | 'column' | 'grid'}
          gap={layout.gap}
          align={layout.align as 'start' | 'center' | 'end'}
          columns={layout.columns}
          responsive={layout.responsive}
          className={overrides?.className}
        >
          {finalItems.map((item, index) => (
            <BlockItem 
              key={index} 
              item={item} 
              blockInteractions={interactions}
            />
          ))}
        </BlockLayout>
      );
    }

    // Fallback layout
    return (
      <div className={cn("space-y-4", overrides?.className)}>
        {finalItems.map((item, index) => (
          <BlockItem 
            key={index} 
            item={item} 
            blockInteractions={interactions}
          />
        ))}
      </div>
    );
  };

  return (
    <ConstraintContainer
      minWidth={constraints?.minWidth}
      maxWidth={constraints?.maxWidth}
      className={className}
    >
      {renderContent()}
    </ConstraintContainer>
  );
}

// Convenience components for specific blocks
export function TopSectionUserPersonalized(props: Omit<BlockRendererProps, 'blockName'>) {
  return <BlockRenderer blockName="TopSectionUserPersonalized" {...props} />;
}

export function ResourceGridBlock(props: Omit<BlockRendererProps, 'blockName'>) {
  return <BlockRenderer blockName="ResourceGridBlock" {...props} />;
}

export function AccountDetailsSection(props: Omit<BlockRendererProps, 'blockName'>) {
  return <BlockRenderer blockName="AccountDetailsSection" {...props} />;
}

export function UserLoginBlock(props: Omit<BlockRendererProps, 'blockName'>) {
  return <BlockRenderer blockName="UserLoginBlock" {...props} />;
}

export function EquipCalendarBlock(props: Omit<BlockRendererProps, 'blockName'>) {
  return <BlockRenderer blockName="EquipCalendarBlock" {...props} />;
}

export function ConsultationDirectoryBlock(props: Omit<BlockRendererProps, 'blockName'>) {
  return <BlockRenderer blockName="ConsultationDirectoryBlock" {...props} />;
}

export function MoodJournalMonthBlock(props: Omit<BlockRendererProps, 'blockName'>) {
  return <BlockRenderer blockName="MoodJournalMonthBlock" {...props} />;
}

export function AssessmentFlowBlock(props: Omit<BlockRendererProps, 'blockName'>) {
  return <BlockRenderer blockName="AssessmentFlowBlock" {...props} />;
}

export function SupportChatBlock(props: Omit<BlockRendererProps, 'blockName'>) {
  return <BlockRenderer blockName="SupportChatBlock" {...props} />;
}

export function ResourceListBlock(props: Omit<BlockRendererProps, 'blockName'>) {
  return <BlockRenderer blockName="ResourceListBlock" {...props} />;
}

export default BlockRenderer;