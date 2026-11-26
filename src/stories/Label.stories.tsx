import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../product/site/ui/label';

const meta: Meta<typeof Label> = {
  title: 'iKAN/Kit/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { children: 'Email address' },
};

export const Required: Story = {
  args: { children: 'Email address *' },
};

export const Disabled: Story = {
  args: { children: 'Disabled label', disabled: true },
};
