import type { Preview } from '@storybook/react';
import React from 'react';

// Import the theme's Tailwind v4 stylesheet so stories share the same tokens
// (colors, type scale, radius, shadows) as the live site.
import '../src/product/site/ui/styles/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      component: false, // disable automatic a11y panel for now; enable per-story if needed
    },
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background text-foreground p-4">
        <Story />
      </div>
    ),
  ],
};

export default preview;
