// Enhanced iKan UI Blocks System - Implementation of JSON block specifications

export interface BlockConstraints {
  minWidth: string;
  maxWidth: string;
}

export interface ResponsiveColumns {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

export interface BlockLayout {
  type: 'row' | 'column' | 'grid';
  gap: string;
  align?: 'start' | 'center' | 'end';
  columns?: number;
  responsive?: ResponsiveColumns;
}

export interface BlockItem {
  component?: string;
  widget?: string;
  props?: Record<string, any>;
}

export interface UIBlock {
  name: string;
  constraints: BlockConstraints;
  layout: BlockLayout;
  items: BlockItem[];
  interactions: string[];
}

// Block configurations from the JSON specification
export const uiBlocks: { [key: string]: UIBlock } = {
  TopSectionUserPersonalized: {
    name: 'TopSectionUserPersonalized',
    constraints: {
      minWidth: 'var(--constraint-content-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    layout: {
      type: 'row',
      gap: 'var(--spacing-4)'
    },
    items: [
      { widget: 'WellbeingSnapshotWidget' },
      { widget: 'NeedsAttentionWidget' }
    ],
    interactions: []
  },

  ResourceGridBlock: {
    name: 'ResourceGridBlock',
    constraints: {
      minWidth: 'var(--constraint-content-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    layout: {
      type: 'grid',
      gap: 'var(--spacing-3)',
      columns: 12,
      responsive: {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4
      }
    },
    items: [
      { component: 'ResourceCard' },
      { component: 'ResourceCard' },
      { component: 'ResourceCard' }
    ],
    interactions: ['filter', 'sort']
  },

  AccountDetailsSection: {
    name: 'AccountDetailsSection',
    constraints: {
      minWidth: 'var(--constraint-content-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    layout: {
      type: 'column',
      gap: 'var(--spacing-3)'
    },
    items: [
      { component: 'UserAvatar' },
      { component: 'TextInput', props: { label: 'Full name' } },
      { component: 'TextInput', props: { label: 'Email' } },
      { component: 'SwitchToggle', props: { label: 'Receive emails' } }
    ],
    interactions: ['edit', 'save']
  },

  UserLoginBlock: {
    name: 'UserLoginBlock',
    constraints: {
      minWidth: 'var(--constraint-input-min)',
      maxWidth: 'var(--constraint-input-max)'
    },
    layout: {
      type: 'column',
      gap: 'var(--spacing-3)',
      align: 'center'
    },
    items: [
      { component: 'TextInput', props: { placeholder: 'Email' } },
      { component: 'TextInput', props: { placeholder: 'Password', type: 'password' } },
      { component: 'ButtonPrimary', props: { label: 'Sign in', icons: { trailing: 'arrowRight' } } },
      { component: 'ButtonLink', props: { label: 'Forgot password?' } }
    ],
    interactions: ['onSubmit', 'onValidate']
  },

  EquipCalendarBlock: {
    name: 'EquipCalendarBlock',
    constraints: {
      minWidth: 'var(--constraint-content-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    layout: {
      type: 'column',
      gap: 'var(--spacing-3)'
    },
    items: [
      { component: 'Tabs', props: { tabs: ['Week', 'Month'] } },
      { component: 'MoodJournalCalendar' },
      { component: 'ProgressBar' }
    ],
    interactions: ['onSelectDate', 'onTabChange']
  },

  ConsultationDirectoryBlock: {
    name: 'ConsultationDirectoryBlock',
    constraints: {
      minWidth: 'var(--constraint-content-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    layout: {
      type: 'grid',
      gap: 'var(--spacing-3)',
      columns: 3,
      responsive: {
        xs: 1,
        sm: 2,
        md: 3
      }
    },
    items: [
      { component: 'ConsultationDirectoryCard' },
      { component: 'ConsultationDirectoryCard' },
      { component: 'ConsultationDirectoryCard' }
    ],
    interactions: ['filter', 'book']
  },

  MoodJournalMonthBlock: {
    name: 'MoodJournalMonthBlock',
    constraints: {
      minWidth: 'var(--constraint-content-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    layout: {
      type: 'column',
      gap: 'var(--spacing-3)'
    },
    items: [
      { widget: 'MoodJournalCalendar' },
      { component: 'MoodJournalEmojiSet' }
    ],
    interactions: ['selectDay', 'recordMood']
  },

  AssessmentFlowBlock: {
    name: 'AssessmentFlowBlock',
    constraints: {
      minWidth: 'var(--constraint-content-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    layout: {
      type: 'column',
      gap: 'var(--spacing-3)'
    },
    items: [
      { component: 'AssessmentCard' },
      { component: 'Stepper' },
      { component: 'ModalAssessmentIntro' }
    ],
    interactions: ['start', 'next', 'submit']
  },

  SupportChatBlock: {
    name: 'SupportChatBlock',
    constraints: {
      minWidth: 'var(--constraint-component-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    layout: {
      type: 'column',
      gap: 'var(--spacing-2)'
    },
    items: [
      { component: 'ChatPreviewCard' },
      { component: 'ModalSupportChat' }
    ],
    interactions: ['open', 'send']
  },

  ResourceListBlock: {
    name: 'ResourceListBlock',
    constraints: {
      minWidth: 'var(--constraint-content-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    layout: {
      type: 'column',
      gap: 'var(--spacing-2)'
    },
    items: [
      { component: 'BlogCard' },
      { component: 'BlogCard' },
      { component: 'BlogCard' }
    ],
    interactions: ['filter', 'bookmark']
  }
};

// Helper functions for working with blocks
export function getBlock(blockName: string): UIBlock | undefined {
  return uiBlocks[blockName];
}

export function getBlockConstraints(blockName: string): BlockConstraints | undefined {
  const block = getBlock(blockName);
  return block?.constraints;
}

export function getBlockLayout(blockName: string): BlockLayout | undefined {
  const block = getBlock(blockName);
  return block?.layout;
}

export function getBlockItems(blockName: string): BlockItem[] | undefined {
  const block = getBlock(blockName);
  return block?.items;
}

export function getBlockInteractions(blockName: string): string[] | undefined {
  const block = getBlock(blockName);
  return block?.interactions;
}

// CSS class generators for responsive grid layouts
export function generateGridClasses(layout: BlockLayout): string {
  if (layout.type !== 'grid' || !layout.responsive) {
    return '';
  }

  const breakpoints = layout.responsive;
  let classes = 'grid ';

  // Generate responsive grid classes
  if (breakpoints.xs) classes += `grid-cols-${breakpoints.xs} `;
  if (breakpoints.sm) classes += `sm:grid-cols-${breakpoints.sm} `;
  if (breakpoints.md) classes += `md:grid-cols-${breakpoints.md} `;
  if (breakpoints.lg) classes += `lg:grid-cols-${breakpoints.lg} `;

  return classes.trim();
}

// Layout style generator for dynamic styling
export function generateLayoutStyles(layout: BlockLayout): React.CSSProperties {
  const styles: React.CSSProperties = {
    gap: layout.gap
  };

  switch (layout.type) {
    case 'row':
      styles.display = 'flex';
      styles.flexDirection = 'row';
      if (layout.align) {
        styles.alignItems = layout.align === 'start' ? 'flex-start' : 
                           layout.align === 'end' ? 'flex-end' : 'center';
      }
      break;
    case 'column':
      styles.display = 'flex';
      styles.flexDirection = 'column';
      if (layout.align) {
        styles.alignItems = layout.align === 'start' ? 'flex-start' : 
                           layout.align === 'end' ? 'flex-end' : 'center';
      }
      break;
    case 'grid':
      styles.display = 'grid';
      if (layout.columns) {
        styles.gridTemplateColumns = `repeat(${layout.columns}, 1fr)`;
      }
      break;
  }

  return styles;
}

// Constraint style generator
export function generateConstraintStyles(constraints: BlockConstraints): React.CSSProperties {
  return {
    minWidth: constraints.minWidth,
    maxWidth: constraints.maxWidth,
    width: '100%'
  };
}

export default uiBlocks;