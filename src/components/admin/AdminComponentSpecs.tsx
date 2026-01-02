import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PageHero } from '../ui/PageHero';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function AdminComponentSpecs() {
  const coreSpecs = [
    {
      component: 'Button',
      height: '48px',
      radius: '12px (--radius-md)',
      padding: '16px horizontal, 8px vertical',
      typography: 'Ubuntu Medium 16px',
      variants: 'Default, Secondary, Outline, Ghost, Destructive, Link'
    },
    {
      component: 'Input',
      height: '48px',
      radius: '12px (--radius-md)',
      padding: '12px horizontal',
      typography: 'Ubuntu Regular 16px',
      border: '1px solid --color-border-default',
      states: 'Default, Focus, Error, Disabled'
    },
    {
      component: 'Card',
      radius: '16px (--radius-lg)',
      padding: '16px (--spacing-4)',
      shadow: '--shadow-sm (default), --shadow-md (hover)',
      background: 'White (--color-bg-card)'
    },
    {
      component: 'Toast',
      radius: '16px (--radius-lg)',
      shadow: '--shadow-lg',
      position: 'Top Center',
      animation: 'Slide In / Fade Out'
    }
  ];

  const validationSpecs = [
    {
      state: 'Error',
      visuals: 'Red border (--color-status-danger), Red text label, Error icon',
      message: 'Explicit error message below input (12px)'
    },
    {
      state: 'Success',
      visuals: 'Green border (optional), Check icon',
      message: 'Usually not required for inputs, but used in Alerts'
    },
    {
      state: 'Warning',
      visuals: 'Yellow border/text',
      message: 'Non-blocking validation feedback'
    }
  ];

  const animationSpecs = [
    {
      name: 'Hover',
      duration: '150ms (--motion-duration-fast)',
      easing: 'ease-out',
      properties: 'background-color, border-color, shadow'
    },
    {
      name: 'Focus',
      duration: '150ms',
      visuals: 'Ring (3px) with alpha opacity',
      color: '--color-ring'
    },
    {
      name: 'Page Transition',
      duration: '300ms (--motion-duration-normal)',
      type: 'Fade In + Slide Up (4px)'
    },
    {
      name: 'Modal Open',
      duration: '300ms',
      type: 'Scale In (95% -> 100%) + Fade In'
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <PageHero 
        title="Component Specifications" 
        subtitle="Technical details, constraints, and tokens for the design system."
      />
      
      {/* Core Primitives */}
      <Card>
        <CardHeader>
          <CardTitle>Core Primitives</CardTitle>
          <CardDescription>
            These specifications are enforced via CSS variables in globals.css.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Height</TableHead>
                <TableHead>Radius</TableHead>
                <TableHead>Typography</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coreSpecs.map((spec) => (
                <TableRow key={spec.component}>
                  <TableCell className="font-medium">{spec.component}</TableCell>
                  <TableCell>{spec.height || 'N/A'}</TableCell>
                  <TableCell>{spec.radius}</TableCell>
                  <TableCell>{spec.typography || 'N/A'}</TableCell>
                  <TableCell>{spec.padding || spec.shadow || spec.variants}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Validation & States */}
      <Card>
        <CardHeader>
          <CardTitle>Validation & States</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>State</TableHead>
                <TableHead>Visual Indicators</TableHead>
                <TableHead>Message Pattern</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationSpecs.map((spec) => (
                <TableRow key={spec.state}>
                  <TableCell className="font-medium">{spec.state}</TableCell>
                  <TableCell>{spec.visuals}</TableCell>
                  <TableCell>{spec.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Animation & Motion */}
      <Card>
        <CardHeader>
          <CardTitle>Animation & Motion</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interaction</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Properties / Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {animationSpecs.map((spec) => (
                <TableRow key={spec.name}>
                  <TableCell className="font-medium">{spec.name}</TableCell>
                  <TableCell>{spec.duration}</TableCell>
                  <TableCell>{spec.properties || spec.type || spec.visuals}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Global Tokens Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Global Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--color-bg-muted)] rounded-lg">
                    <h4 className="font-medium mb-2">Spacing Scale</h4>
                    <p className="text-sm text-muted-foreground">Base unit: 4px</p>
                    <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                        <li>xs: 4px (--spacing-1)</li>
                        <li>sm: 8px (--spacing-2)</li>
                        <li>md: 16px (--spacing-4)</li>
                        <li>lg: 24px (--spacing-6)</li>
                        <li>xl: 32px (--spacing-8)</li>
                    </ul>
                </div>
                <div className="p-4 bg-[var(--color-bg-muted)] rounded-lg">
                    <h4 className="font-medium mb-2">Breakpoints</h4>
                    <p className="text-sm text-muted-foreground">Mobile-first approach</p>
                    <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                        <li>xs: 360px (Minimum support)</li>
                        <li>sm: 640px (Tablet/Large Phone)</li>
                        <li>md: 768px (Tablet Landscape)</li>
                        <li>lg: 1024px (Desktop)</li>
                    </ul>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
