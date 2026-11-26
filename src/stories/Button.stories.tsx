import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../product/site/ui/button';

const meta: Meta<typeof Button> = {
  title: 'iKAN/Kit/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      control: { type: 'select' },
    },
    size: {
      options: ['default', 'sm', 'lg', 'icon'],
      control: { type: 'select' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Primary button', variant: 'default' },
};

export const Destructive: Story = {
  args: { children: 'Delete', variant: 'destructive' },
};

export const Outline: Story = {
  args: { children: 'Outline button', variant: 'outline' },
};

export const Secondary: Story = {
  args: { children: 'Secondary button', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { children: 'Ghost button', variant: 'ghost' },
};

export const Link: Story = {
  args: { children: 'Link button', variant: 'link', asChild: false },
};

export const Small: Story = {
  args: { children: 'Small button', size: 'sm' },
};

export const Large: Story = {
  args: { children: 'Large button', size: 'lg' },
};

export const WithIcon: Story = {
  args: {
    children: 'Save',
    variant: 'default',
  },
  parameters: {
    design: { type: 'figma', url: '' },
  },
};
