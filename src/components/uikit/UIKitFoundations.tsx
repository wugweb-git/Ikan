import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function UIKitFoundations() {
  const greyScale = [
    { name: 'Grey 0 (Surface)', var: '--grey-0', hex: '#FFFFFF' },
    { name: 'Grey 1 (App Bg)', var: '--grey-1', hex: '#F5F5F5' },
    { name: 'Grey 2 (Hero Bg)', var: '--grey-2', hex: '#E4E4E4' },
    { name: 'Grey 3 (Border)', var: '--grey-3', hex: '#D9D9D9' },
    { name: 'Grey 4 (Disabled)', var: '--grey-4', hex: '#BDBDBD' },
    { name: 'Grey 5 (Placeholder)', var: '--grey-5', hex: '#9E9E9E' },
    { name: 'Grey 6 (Secondary)', var: '--grey-6', hex: '#757575' },
    { name: 'Grey 7 (Muted)', var: '--grey-7', hex: '#545454' },
    { name: 'Grey 8 (Body)', var: '--grey-8', hex: '#333333' },
    { name: 'Grey 9 (Headings)', var: '--grey-9', hex: '#1A1A1A' },
    { name: 'Grey 10 (Off-Black)', var: '--grey-10', hex: '#0D0D0D' },
  ];

  const typographyPrimitives = [
    { name: 'Hero Title', class: 'hero-title', desc: '48px Bold (Grey 9)' },
    { name: 'Section Heading', class: 'section-heading', desc: '32px Semibold (Grey 9)' },
    { name: 'Card Title', class: 'card-title', desc: '24px Semibold (Grey 8)' },
    { name: 'Body Text', class: 'body-text', desc: '18px Regular (Grey 8, 1.6 LH)' },
    { name: 'Caption Text', class: 'caption-text', desc: '14px Regular (Grey 6)' },
  ];

  const gridBreakpoints = [
    { name: 'Mobile', range: '< 600px', grid: '4-Column', notes: '16px Gutters. Full-width cards.' },
    { name: 'Tablet', range: '600px – 1024px', grid: '8-Column', notes: '24px Gutters. 2-column card layouts.' },
    { name: 'Desktop', range: '1025px – 1440px', grid: '12-Column', notes: '1280px Max-Width. 80px–100px Margins.' },
    { name: 'Ultra-Wide', range: '> 1440px', grid: '12-Column', notes: 'Centered 1280px Container. Margins grow.' },
  ];

  const layoutModes = [
    { name: 'Website / Marketing', density: 'Low', gap: '80px – 120px', padding: '40px (Radius 32px)', purpose: 'Hero sections, Landing pages.' },
    { name: 'Web App / Dashboard', density: 'Medium', gap: '32px – 48px', padding: '24px – 32px (Radius 24px)', purpose: 'Dashboard, History cards.' },
    { name: 'Admin Panel', density: 'High', gap: '16px – 24px', padding: '16px (Radius 16px)', purpose: 'User management, Data tables.' },
  ];

  return (
    <div className="space-y-8">
      {/* Grey Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Grey Scale System (0-10)</CardTitle>
          <CardDescription>
            The comprehensive neutral scale for the CBT design system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {greyScale.map((color) => (
              <div key={color.name} className="space-y-2">
                <div 
                  className="h-20 w-full rounded-lg border border-border shadow-sm flex items-end p-2"
                  style={{ backgroundColor: `var(${color.var})` }}
                >
                    <span className={`text-xs font-mono ${parseInt(color.var.split('-')[2]) > 4 ? 'text-white' : 'text-black'}`}>
                        {color.hex}
                    </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{color.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{color.var}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid & Breakpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Grid System & Breakpoints</CardTitle>
          <CardDescription>
            Responsive scale logic for Mobile, Tablet, and Desktop.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Breakpoint</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Grid</TableHead>
                    <TableHead>Logic & Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {gridBreakpoints.map((bp) => (
                        <TableRow key={bp.name}>
                            <TableCell className="font-medium">{bp.name}</TableCell>
                            <TableCell className="font-mono text-xs">{bp.range}</TableCell>
                            <TableCell>{bp.grid}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{bp.notes}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
        </CardContent>
      </Card>

      {/* Layout Modes (Density) */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Modes (Density Rules)</CardTitle>
          <CardDescription>
            Adjusting gaps and padding based on context (Website vs App vs Admin).
          </CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Context</TableHead>
                    <TableHead>Density</TableHead>
                    <TableHead>Vertical Gap</TableHead>
                    <TableHead>Internal Padding (Radius)</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {layoutModes.map((mode) => (
                        <TableRow key={mode.name}>
                            <TableCell className="font-medium">{mode.name}</TableCell>
                            <TableCell>{mode.density}</TableCell>
                            <TableCell className="font-mono text-xs">{mode.gap}</TableCell>
                            <TableCell className="font-mono text-xs">{mode.padding}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{mode.purpose}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
        </CardContent>
      </Card>

      {/* Typography Primitives */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Primitives</CardTitle>
          <CardDescription>
            Standardized text styles for consistent hierarchy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {typographyPrimitives.map((type) => (
              <div key={type.name} className="space-y-2 border-b pb-4 last:border-0">
                <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{type.name}</span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">.{type.class}</span>
                </div>
                <div className={type.class}>
                  The quick brown fox jumps over the lazy dog
                </div>
                <p className="text-xs text-muted-foreground">{type.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spacing & Radius */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Corner Scale (Radius)</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">--radius-sm</TableCell>
                    <TableCell>16px</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Buttons, Inputs</TableCell>
                    <TableCell><div className="w-12 h-12 bg-primary rounded-[var(--radius-sm)]"></div></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">--radius-md</TableCell>
                    <TableCell>20px</TableCell>
                    <TableCell className="text-xs text-muted-foreground">History Cards</TableCell>
                    <TableCell><div className="w-12 h-12 bg-primary rounded-[var(--radius-md)]"></div></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">--radius-lg</TableCell>
                    <TableCell>24px</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Main Containers</TableCell>
                    <TableCell><div className="w-12 h-12 bg-primary rounded-[var(--radius-lg)]"></div></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">--radius-xl</TableCell>
                    <TableCell>32px</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Hero Sections</TableCell>
                    <TableCell><div className="w-12 h-12 bg-primary rounded-[var(--radius-xl)]"></div></TableCell>
                  </TableRow>
                </TableBody>
             </Table>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Layout & Spacing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Max Content Width</span>
                        <span className="font-mono">1280px (--max-content)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Desktop Padding</span>
                        <span className="font-mono">100px (--desktop-padding)</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span>Button Height</span>
                        <span className="font-mono">52px</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span>Input Height</span>
                        <span className="font-mono">56px</span>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
