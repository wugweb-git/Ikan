import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../product/site/ui/checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'iKAN/Kit/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { defaultChecked: false },
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { defaultChecked: false, disabled: true },
};

export const CheckedDisabled: Story = {
  args: { defaultChecked: true, disabled: true },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Checkbox defaultChecked={false} />
      <label>I agree to the terms</label>
    </div>
  ),
};
