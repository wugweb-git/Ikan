import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function UIKitFoundations() {
  const colors = [
    { name: 'Primary', var: '--color-primary-default', hex: '#2A2A2A' },
    { name: 'Accent', var: '--color-accent-default', hex: '#E9EBEF' },
    { name: 'Page Background', var: '--color-bg-page', hex: '#F5F5F5' },
    { name: 'Card Background', var: '--color-bg-card', hex: '#FFFFFF' },
    { name: 'Input Background', var: '--color-bg-input', hex: '#F3F3F5' },
    { name: 'Success', var: '--color-status-success', hex: '#22C55E' },
    { name: 'Danger', var: '--color-status-danger', hex: '#D4183D' },
    { name: 'Warning', var: '--color-status-warning', hex: '#EAB308' },
    { name: 'Info', var: '--color-status-info', hex: '#8B5CF6' },
  ];

  const typography = [
    { name: 'Text 4xl', var: '--text-4xl', size: '48px', weight: 'Medium (500)' },
    { name: 'Text 3xl', var: '--text-3xl', size: '32px', weight: 'Medium (500)' },
    { name: 'Text 2xl', var: '--text-2xl', size: '24px', weight: 'Medium (500)' },
    { name: 'Text xl', var: '--text-xl', size: '20px', weight: 'Medium (500)' },
    { name: 'Text lg', var: '--text-lg', size: '18px', weight: 'Medium (500)' },
    { name: 'Text base', var: '--text-base', size: '16px', weight: 'Regular (400)' },
    { name: 'Text sm', var: '--text-sm', size: '14px', weight: 'Regular (400)' },
    { name: 'Text xs', var: '--text-xs', size: '12px', weight: 'Regular (400)' },
  ];

  return (
    <div className="space-y-8">
      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Color System</CardTitle>
          <CardDescription>
            Semantic color tokens defined in globals.css.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div 
                  className="h-20 w-full rounded-lg border border-border shadow-sm"
                  style={{ backgroundColor: `var(${color.var})` }}
                />
                <div>
                  <p className="font-medium text-sm">{color.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{color.var}</p>
                  <p className="text-xs text-muted-foreground opacity-70">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
          <CardDescription>
            Font Family: Ubuntu. Weights: Regular (400), Medium (500).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {typography.map((type) => (
              <div key={type.name} className="flex items-center gap-4 p-2 hover:bg-muted/50 rounded-lg">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-medium">{type.name}</p>
                  <p className="text-xs text-muted-foreground">{type.size}</p>
                </div>
                <div 
                  style={{ 
                    fontSize: `var(${type.var})`,
                    fontWeight: type.weight.includes('Medium') ? 500 : 400
                  }}
                  className="truncate"
                >
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spacing & Radius */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spacing & Radius</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>--radius-md</TableCell>
                    <TableCell>12px</TableCell>
                    <TableCell><div className="w-8 h-8 bg-primary rounded-[var(--radius-md)]"></div></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>--radius-lg</TableCell>
                    <TableCell>16px</TableCell>
                    <TableCell><div className="w-10 h-10 bg-primary rounded-[var(--radius-lg)]"></div></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>--spacing-4</TableCell>
                    <TableCell>16px</TableCell>
                    <TableCell><div className="w-4 h-4 bg-primary"></div></TableCell>
                  </TableRow>
                </TableBody>
             </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shadows & Elevation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 bg-white shadow-sm rounded-lg border">
                Shadow SM (--shadow-sm)
             </div>
             <div className="p-4 bg-white shadow-md rounded-lg border">
                Shadow MD (--shadow-md)
             </div>
             <div className="p-4 bg-white shadow-lg rounded-lg border">
                Shadow LG (--shadow-lg)
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Motion */}
      <Card>
        <CardHeader>
          <CardTitle>Motion & Animation</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                 <div className="w-16 h-16 bg-accent rounded-lg animate-pulse"></div>
                 <p className="text-xs">Pulse</p>
              </div>
              <div className="space-y-2">
                 <div className="w-16 h-16 bg-accent rounded-lg animate-bounce"></div>
                 <p className="text-xs">Bounce</p>
              </div>
              <div className="space-y-2">
                 <div className="w-16 h-16 bg-accent rounded-lg animate-spin"></div>
                 <p className="text-xs">Spin</p>
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
