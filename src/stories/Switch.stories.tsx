import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../product/site/ui/switch';

const meta: Meta<typeof Switch> = {
  title: 'iKAN/Kit/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: { checked: false },
};

export const Checked: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { checked: false, disabled: true },
};

export const CheckedDisabled: Story = {
  args: { checked: true, disabled: true },
};
