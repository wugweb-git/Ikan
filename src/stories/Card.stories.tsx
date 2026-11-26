import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../product/site/ui/card';

const meta: Meta<typeof Card> = {
  title: 'iKAN/Kit/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card style={{ width: '320px' }}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content is where the primary information lives. It can contain text, images, or other components.</p>
      </CardContent>
      <CardFooter>
        <button>Action</button>
      </CardFooter>
    </Card>
  ),
};

export const Bordered: Story = {
  render: () => (
    <Card className="border" style={{ width: '320px' }}>
      <CardHeader>
        <CardTitle>Bordered Card</CardTitle>
        <CardDescription>A card with a visible border</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has an explicit border class.</p>
      </CardContent>
    </Card>
  ),
};

export const WithoutActions: Story = {
  render: () => (
    <Card style={{ width: '320px' }}>
      <CardContent>
        <p>Simple card content without header or footer.</p>
      </CardContent>
    </Card>
  ),
};
