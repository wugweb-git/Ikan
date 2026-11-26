import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '../product/site/ui/empty-state';

const meta: Meta<typeof EmptyState> = {
  title: 'iKAN/Kit/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'No Results Found',
    description: 'Try adjusting your search or filters to find what you are looking for.',
  },
};

export const Inbox: Story = {
  args: {
    variant: 'inbox',
    title: 'All Caught Up!',
    description: 'You don\'t have any new notifications.',
  },
};

export const WithAction: Story = {
  args: {
    title: 'No Items Found',
    description: 'There are no items to display at the moment.',
    actionLabel: 'Add Item',
    onAction: () => console.log('Action clicked'),
  },
};

export const Search: Story = {
  args: {
    variant: 'search',
    title: 'No Results Found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
  },
};