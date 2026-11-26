import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../product/site/ui/input';

const meta: Meta<typeof Input> = {
  title: 'iKAN/Kit/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      options: ['text', 'email', 'password', 'number', 'tel'],
      control: { type: 'select' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Enter text', type: 'text' },
};

export const Email: Story = {
  args: { placeholder: 'name@email.com', type: 'email' },
};

export const Password: Story = {
  args: { placeholder: '••••••••', type: 'password' },
};

export const Disabled: Story = {
  args: { placeholder: 'Disabled input', type: 'text', disabled: true },
};
