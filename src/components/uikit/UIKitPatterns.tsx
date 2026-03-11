import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminSection } from '../admin/AdminSection';
import { AdminEmptyState } from '../admin/AdminEmptyState';
import { AdminStatusBadge } from '../admin/AdminStatusBadge';
import { SectionHero } from '../blocks/SectionHero';
import { ResourceCard } from '../blocks/ResourceCard';
import { ConsultantCard } from '../blocks/ConsultantCard';
import { Check, AlertTriangle, Info, Settings, Activity, Database, Inbox, Plus } from 'lucide-react';

// ── Token helpers ──────────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontFamily: 'var(--font-family-base)',
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  color,
});

export function UIKitPatterns() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      {/* Kit Header */}
      <div>
        <h1 style={{ ...f('3xl', 500), marginBottom: 'var(--spacing-2)' }}>
          Admin UI Kit — Source of Truth
        </h1>
        <p style={f('base', 400, 'var(--color-text-muted)')}>
          All finalized components, tokens, and patterns governing the iKan Admin Console.
          Every screen must be built from these recycled instances.
        </p>
      </div>

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          <TabsTrigger value="primitives">Primitives</TabsTrigger>
          <TabsTrigger value="admin">Admin Components</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="states">State Handling</TabsTrigger>
        </TabsList>

        {/* ═══ TOKENS TAB ═══ */}
        <TabsContent value="tokens" style={{ marginTop: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>

            {/* Color Tokens */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>
                Color Tokens
              </h2>

              <div>
                <h3 style={{ ...f('sm', 500), marginBottom: 'var(--spacing-2)' }}>Core Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { name: '--color-primary-default', label: 'Primary', value: '#2A2A2A' },
                    { name: '--color-primary-on', label: 'Primary On', value: '#FFFFFF' },
                    { name: '--color-accent-default', label: 'Accent', value: '#E9EBEF' },
                    { name: '--color-bg-page', label: 'Page BG', value: '#F5F5F5' },
                    { name: '--color-bg-card', label: 'Card BG', value: '#FFFFFF' },
                  ].map(c => (
                    <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <div style={{ height: 80, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', backgroundColor: `var(${c.name.replace('--', '--')})` }} />
                      <span style={{ ...f('xs', 500), fontFamily: 'monospace' }}>{c.label}</span>
                      <span style={f('xs', 400, 'var(--color-text-muted)')}>{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ ...f('sm', 500), marginBottom: 'var(--spacing-2)' }}>Status Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Success', token: '--color-status-success', light: '--color-status-success-light' },
                    { name: 'Warning', token: '--color-status-warning', light: '--color-status-warning-light' },
                    { name: 'Danger', token: '--color-status-danger', light: '--color-status-danger-light' },
                    { name: 'Info', token: '--color-status-info', light: '--color-status-info-light' },
                  ].map(c => (
                    <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                        <div style={{ flex: 1, height: 48, borderRadius: 'var(--radius-sm)', backgroundColor: `var(${c.token})` }} />
                        <div style={{ flex: 1, height: 48, borderRadius: 'var(--radius-sm)', backgroundColor: `var(${c.light})`, border: `1px solid var(${c.token})` }} />
                      </div>
                      <span style={{ ...f('xs', 500), fontFamily: 'monospace' }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ ...f('sm', 500), marginBottom: 'var(--spacing-2)' }}>Text Colors</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Primary', token: '--color-text-primary', desc: '#151515 — headings, body' },
                    { label: 'Muted', token: '--color-text-muted', desc: '#717182 — secondary text' },
                    { label: 'Inverse', token: '--color-text-inverse', desc: '#FFFFFF — on dark bg' },
                  ].map(c => (
                    <div key={c.label} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
                      <span style={{ ...f('base', 500), color: `var(${c.token})` }}>{c.label}</span>
                      <p style={f('xs', 400, 'var(--color-text-muted)')}>{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Typography Tokens */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>
                Typography
              </h2>
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardContent className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  {[
                    { label: 'Heading 1', size: '3xl', weight: 500 },
                    { label: 'Heading 2', size: '2xl', weight: 500 },
                    { label: 'Heading 3', size: 'xl', weight: 500 },
                    { label: 'Heading 4', size: 'lg', weight: 500 },
                    { label: 'Body', size: 'base', weight: 400 },
                    { label: 'Small', size: 'sm', weight: 400 },
                    { label: 'Caption', size: 'xs', weight: 400 },
                  ].map(t => (
                    <div key={t.label} className="flex items-baseline justify-between">
                      <span style={f(t.size, t.weight)}>{t.label}</span>
                      <span style={{ ...f('xs', 400, 'var(--color-text-muted)'), fontFamily: 'monospace' }}>
                        --text-{t.size} / weight {t.weight}
                      </span>
                    </div>
                  ))}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Font Weight Rule</AlertTitle>
                    <AlertDescription>
                      Only 400 (body) and 500 (headings/labels). Never use 600 or 700.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Spacing & Radius */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>
                Spacing & Radius
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                  <CardHeader><CardTitle style={f('base', 500)}>Spacing Scale (4px grid)</CardTitle></CardHeader>
                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      {[1,2,3,4,5,6,8,10,12,16].map(n => (
                        <div key={n} className="flex items-center" style={{ gap: 'var(--spacing-3)' }}>
                          <div style={{ width: `var(--spacing-${n})`, height: 12, backgroundColor: 'var(--color-primary-default)', borderRadius: 2, flexShrink: 0 }} />
                          <span style={{ ...f('xs', 400, 'var(--color-text-muted)'), fontFamily: 'monospace', minWidth: 100 }}>
                            --spacing-{n} = {n * 4}px
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                  <CardHeader><CardTitle style={f('base', 500)}>Border Radius</CardTitle></CardHeader>
                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                      {[
                        { name: '--radius-sm', val: '8px', use: 'Tabs, pills' },
                        { name: '--radius-md', val: '12px', use: 'Buttons, inputs' },
                        { name: '--radius-lg', val: '16px', use: 'Cards, sections' },
                        { name: '--radius-pill', val: '9999px', use: 'Badges, nav bar' },
                      ].map(r => (
                        <div key={r.name} className="flex items-center" style={{ gap: 'var(--spacing-3)' }}>
                          <div style={{ width: 48, height: 48, border: '2px solid var(--color-primary-default)', borderRadius: r.val, flexShrink: 0 }} />
                          <div>
                            <span style={{ ...f('sm', 500), fontFamily: 'monospace', display: 'block' }}>{r.name}</span>
                            <span style={f('xs', 400, 'var(--color-text-muted)')}>{r.val} — {r.use}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </TabsContent>

        {/* ═══ PRIMITIVES TAB ═══ */}
        <TabsContent value="primitives" style={{ marginTop: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>

            {/* Buttons */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>Buttons</h2>
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4 items-center mb-4">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Button size="lg">Large Button</Button>
                    <Button size="default">Default Button</Button>
                    <Button size="sm">Small</Button>
                    <Button size="icon"><Settings size={16} /></Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Badges */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>Badges</h2>
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardContent className="p-6 flex flex-wrap gap-4">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge style={{ backgroundColor: 'var(--color-status-success)', color: 'var(--color-text-inverse)' }}>Success</Badge>
                  <Badge style={{ backgroundColor: 'var(--color-status-info)', color: 'var(--color-text-inverse)' }}>Info</Badge>
                  <Badge style={{ backgroundColor: 'var(--color-status-warning)', color: 'var(--color-text-inverse)' }}>Warning</Badge>
                </CardContent>
              </Card>
            </section>

            {/* Inputs */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>Inputs & Controls</h2>
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                        <Label htmlFor="kit-email" style={f('sm', 500)}>Email</Label>
                        <Input type="email" id="kit-email" placeholder="user@ikan.app" style={{ backgroundColor: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                        <Label htmlFor="kit-text" style={f('sm', 500)}>Text Area</Label>
                        <Textarea placeholder="Type your message here." style={{ backgroundColor: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
                      <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                        <Switch id="kit-switch" />
                        <Label htmlFor="kit-switch" style={f('sm', 400)}>Toggle setting</Label>
                      </div>
                      <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                        <Checkbox id="kit-check" />
                        <Label htmlFor="kit-check" style={f('sm', 400)}>Accept terms</Label>
                      </div>
                      <RadioGroup defaultValue="option-one">
                        <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                          <RadioGroupItem value="option-one" id="kit-r1" />
                          <Label htmlFor="kit-r1" style={f('sm', 400)}>Option One</Label>
                        </div>
                        <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                          <RadioGroupItem value="option-two" id="kit-r2" />
                          <Label htmlFor="kit-r2" style={f('sm', 400)}>Option Two</Label>
                        </div>
                      </RadioGroup>
                      <Select>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a">Option A</SelectItem>
                          <SelectItem value="b">Option B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Alerts */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>Alerts</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>This is a standard informational alert.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Something went wrong. Please try again.</AlertDescription>
                </Alert>
              </div>
            </section>

            {/* Overlays */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>Overlays</h2>
              <Dialog>
                <DialogTrigger asChild><Button variant="outline">Open Dialog</Button></DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>Make changes to your profile here.</DialogDescription>
                  </DialogHeader>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', padding: 'var(--spacing-4) 0' }}>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="kit-name" className="text-right" style={f('sm', 500)}>Name</Label>
                      <Input id="kit-name" defaultValue="Admin User" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter><Button type="submit">Save changes</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </section>
          </div>
        </TabsContent>

        {/* ═══ ADMIN COMPONENTS TAB ═══ */}
        <TabsContent value="admin" style={{ marginTop: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>

            {/* AdminStatusBadge */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>AdminStatusBadge</h2>
              <p style={f('sm', 400, 'var(--color-text-muted)')}>
                Unified status indicator for the entire admin ecosystem. Maps semantic status variants (e.g., 'published', 'active') to design tokens.
              </p>
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    <AdminStatusBadge status="success" label="Success" />
                    <AdminStatusBadge status="warning" label="Warning" />
                    <AdminStatusBadge status="danger" label="Danger" />
                    <AdminStatusBadge status="info" label="Info" />
                    <AdminStatusBadge status="neutral" label="Neutral" />
                    <AdminStatusBadge status="primary" label="Primary" />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[var(--color-border-default)]">
                    <AdminStatusBadge status="published" label="Published" dot />
                    <AdminStatusBadge status="draft" label="Draft" dot />
                    <AdminStatusBadge status="active" label="Active" dot />
                    <AdminStatusBadge status="inactive" label="Inactive" dot />
                    <AdminStatusBadge status="pending" label="Pending" dot />
                    <AdminStatusBadge status="completed" label="Completed" dot />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* AdminHeader */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>AdminHeader</h2>
              <p style={f('sm', 400, 'var(--color-text-muted)')}>
                Every admin module MUST use this component. It provides: title, description, onBack, breadcrumbs, actions, and stats row.
              </p>
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardContent className="p-6">
                  <AdminHeader
                    title="Module Title"
                    description="Descriptive subtitle explaining what this module manages."
                    stats={[
                      { label: 'Total Items', value: 1284, trend: 'up' },
                      { label: 'Active', value: 892, trend: 'up' },
                      { label: 'Draft', value: 34, trend: 'neutral' },
                      { label: 'Errors', value: 2, trend: 'down' },
                    ]}
                    actions={
                      <Button style={{ gap: 'var(--spacing-2)', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)', borderRadius: 'var(--radius-md)' }}>
                        <Plus size={14} /> Add New
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </section>

            {/* AdminSection */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>AdminSection</h2>
              <p style={f('sm', 400, 'var(--color-text-muted)')}>
                Card-wrapped content section with optional icon, description, badge, collapsible behavior, and action buttons.
              </p>
              <AdminSection
                title="Configuration Group"
                description="Settings that control module behavior."
                icon={<Settings size={20} />}
                badge={<Badge variant="secondary">3 items</Badge>}
                collapsible
                actions={<Button variant="outline" size="sm">Edit All</Button>}
              >
                <div className="grid grid-cols-3 gap-4">
                  {['Setting A', 'Setting B', 'Setting C'].map(s => (
                    <div key={s} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
                      <span style={f('sm', 500)}>{s}</span>
                    </div>
                  ))}
                </div>
              </AdminSection>
            </section>

            {/* AdminEmptyState */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>AdminEmptyState</h2>
              <p style={f('sm', 400, 'var(--color-text-muted)')}>
                Used when a table or list has no data. Provides icon, title, description, and optional CTA.
              </p>
              <AdminEmptyState
                icon={Inbox}
                title="No Items Found"
                description="This is the empty state. Add your first item to get started."
                actionLabel="Create First Item"
                onAction={() => {}}
              />
            </section>

            {/* Card Anatomy */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>Card Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                  <CardHeader>
                    <CardTitle style={f('base', 500)}>Standard Card</CardTitle>
                    <CardDescription style={f('sm', 400, 'var(--color-text-muted)')}>Card with header, content, footer.</CardDescription>
                  </CardHeader>
                  <CardContent><p style={f('sm', 400)}>Card body content goes here.</p></CardContent>
                  <CardFooter><span style={f('xs', 400, 'var(--color-text-muted)')}>Footer text</span></CardFooter>
                </Card>
                <Card style={{ borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-primary-default)' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={f('base', 500)}>
                      <Activity size={16} style={{ color: 'var(--color-primary-default)' }} />
                      Status Card
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={f('3xl', 500)}>98.5%</div>
                    <p style={f('xs', 400, 'var(--color-text-muted)')}>+2.5% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </TabsContent>

        {/* ═══ PATTERNS TAB ═══ */}
        <TabsContent value="patterns" style={{ marginTop: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>
                Module Layout Pattern
              </h2>
              <p style={f('sm', 400, 'var(--color-text-muted)')}>
                Every admin module follows this structure: AdminHeader → Stats Row → Filters/Actions → DataTable/Content → Pagination.
              </p>
              <Card style={{ borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border-default)' }}>
                <CardContent className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  {['AdminHeader (title + desc + actions)', 'Stats Row (4-col grid)', 'Search + Filters + Bulk Actions', 'AdminDataTable (sortable, paginated)', 'Pagination Controls'].map((step, i) => (
                    <div key={i} className="flex items-center" style={{ gap: 'var(--spacing-3)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...f('xs', 500) }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
                        <span style={f('sm', 500)}>{step}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>
                Accordion
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                  <CardContent className="p-4">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Is it accessible?</AccordionTrigger>
                      <AccordionContent>Yes. Adheres to WAI-ARIA design pattern.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Is it tokenized?</AccordionTrigger>
                      <AccordionContent>Every color, spacing, and radius value uses design tokens.</AccordionContent>
                    </AccordionItem>
                  </CardContent>
                </Card>
              </Accordion>
            </section>

            {/* ── User-Facing Canonical Components ── */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>
                User-Facing Canonical Components
              </h2>
              <p style={f('sm', 400, 'var(--color-text-muted)')}>
                Reusable production components used across the user-facing app. Always extend via props/variants instead of creating new files.
              </p>

              {/* SectionHero */}
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardHeader>
                  <CardTitle style={f('base', 500)}>SectionHero</CardTitle>
                  <CardDescription style={f('sm', 400, 'var(--color-text-muted)')}>
                    Unified hero component for landing pages. Replaces the formerly-duplicate AssessmentHero and EquipHero.
                    Props: title, description, buttonText, buttonLink, onButtonClick, backgroundImage, className.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
                  <SectionHero
                    title="Your Mental Health Journey"
                    description="Clinically backed assessments, guided programs, and professional support — all in one place."
                    buttonText="Get Started"
                    onButtonClick={() => {}}
                  />
                </CardContent>
              </Card>

              {/* ResourceCard */}
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardHeader>
                  <CardTitle style={f('base', 500)}>ResourceCard</CardTitle>
                  <CardDescription style={f('sm', 400, 'var(--color-text-muted)')}>
                    Used in Library/Resource listing pages. Supports article, video, and tool types. Responsive mobile/desktop layout.
                    Props: post (ResourcePost), onClick, variant ('default' | 'featured'), className.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: '1', title: 'Understanding Anxiety', description: 'Learn the science behind anxiety and evidence-based coping strategies.', date: 'Feb 20, 2026', image: '', type: 'article' as const, category: 'Mental Health', readTime: '5 min read' },
                      { id: '2', title: 'Guided Breathing Exercise', description: 'A 10-minute video to help calm your nervous system.', date: 'Feb 18, 2026', image: '', type: 'video' as const, category: 'Wellness', readTime: '10 min watch' },
                      { id: '3', title: 'Mood Tracker Template', description: 'Download our evidence-based mood tracking worksheet.', date: 'Feb 15, 2026', image: '', type: 'tool' as const, category: 'Tools', readTime: '2 min' },
                    ].map(post => (
                      <ResourceCard key={post.id} post={post} onClick={() => {}} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ConsultantCard */}
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardHeader>
                  <CardTitle style={f('base', 500)}>ConsultantCard</CardTitle>
                  <CardDescription style={f('sm', 400, 'var(--color-text-muted)')}>
                    Used in Consultation listing page. Displays therapist info, rating, specializations, pricing, and availability.
                    Props: consultant (Consultant), onClick, onBook, className.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div style={{ maxWidth: '600px' }}>
                    <ConsultantCard
                      consultant={{
                        id: 'demo-1',
                        name: 'Dr. Sarah Chen',
                        credentials: 'Ph.D., Licensed Clinical Psychologist',
                        category: 'therapist',
                        photo: '',
                        yearsExperience: 12,
                        languages: ['English', 'Mandarin'],
                        location: 'Singapore',
                        sessionModes: ['online', 'call', 'chat'],
                        expertises: ['Anxiety', 'Depression', 'CBT', 'Mindfulness'],
                        topExpertises: ['Anxiety', 'Depression', 'CBT'],
                        approaches: ['CBT', 'Mindfulness-Based'],
                        concernsICanHelp: ['Anxiety', 'Depression', 'Stress'],
                        pricing: { video: 120, call: 100, chat: 80 },
                        nextAvailableSlot: 'Tomorrow, 2pm',
                        rating: 4.8,
                        reviewCount: 142,
                        bio: 'Experienced clinical psychologist specializing in anxiety and mood disorders.',
                        qualifications: ['Ph.D. Clinical Psychology'],
                        available: true,
                      }}
                      onClick={() => {}}
                      onBook={() => {}}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* WellnessScoreCard note */}
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardHeader>
                  <CardTitle style={f('base', 500)}>WellnessScoreCard</CardTitle>
                  <CardDescription style={f('sm', 400, 'var(--color-text-muted)')}>
                    Apple Watch-style concentric rings gauge on the Dashboard. Calculates a composite wellness score from mood logs, 
                    assessment results, program enrollments, and fitness data. Features expandable dimension breakdown, 7-day trend sparkline, 
                    and contextual recommendations. Requires live user data — see Dashboard for integration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Data-Dependent Component</AlertTitle>
                    <AlertDescription>
                      WellnessScoreCard requires live engineResult, enrollments, and mood data from the user session.
                      It is rendered on the Dashboard screen (<code style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>/components/WellnessScoreCard.tsx</code>).
                      Props: hasLoggedMoodToday, activeEnrollment, activeProgram, completedEnrollments, engineResult, enrollments, recommendations, onNavigate, isFitnessConnected, fitnessData.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>
          </div>
        </TabsContent>

        {/* ═══ STATE HANDLING TAB ═══ */}
        <TabsContent value="states" style={{ marginTop: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>
                Data State Handling
              </h2>
              <p style={f('sm', 400, 'var(--color-text-muted)')}>
                Every data-driven component must handle these 4 states explicitly. No state may be left unhandled.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loading */}
                <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                  <CardHeader><CardTitle style={f('sm', 500)}>Loading State</CardTitle></CardHeader>
                  <CardContent className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary-default)' }} />
                  </CardContent>
                </Card>

                {/* Empty */}
                <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                  <CardHeader><CardTitle style={f('sm', 500)}>Empty State</CardTitle></CardHeader>
                  <CardContent className="text-center p-8">
                    <Database className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                    <p style={f('sm', 400, 'var(--color-text-muted)')}>No data available</p>
                  </CardContent>
                </Card>

                {/* Error */}
                <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-status-danger)' }}>
                  <CardHeader><CardTitle style={f('sm', 500)}>Error State</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3" style={{ padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-status-danger-light)' }}>
                      <AlertTriangle size={16} style={{ color: 'var(--color-status-danger)' }} />
                      <span style={f('sm', 400, 'var(--color-status-danger)')}>Failed to load data. Please try again.</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Success */}
                <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-status-success)' }}>
                  <CardHeader><CardTitle style={f('sm', 500)}>Success State</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3" style={{ padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-status-success-light)' }}>
                      <Check size={16} style={{ color: 'var(--color-status-success)' }} />
                      <span style={f('sm', 400, 'var(--color-status-success)')}>Operation completed successfully.</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Token Compliance Rules */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h2 style={{ ...f('xl', 500), borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-2)' }}>
                Token Compliance Rules
              </h2>
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <CardContent className="p-6">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                    {[
                      { rule: 'No Tailwind color classes', detail: 'Use var(--color-*) tokens. bg-green-50, text-gray-500 etc. are banned.' },
                      { rule: 'No hardcoded px for spacing', detail: 'Use var(--spacing-*) tokens. Based on 4px grid.' },
                      { rule: 'No hardcoded border-radius', detail: 'Use var(--radius-sm/md/lg/pill) tokens.' },
                      { rule: 'No font-weight 600/700', detail: 'Only 400 (body) and 500 (headings). Use var(--font-weight-medium).' },
                      { rule: 'No hardcoded RGBA colors', detail: 'Use var(--color-status-*-light) for translucent backgrounds.' },
                      { rule: 'Every module uses AdminHeader', detail: 'No raw <h1>/<h2> headers. Use the shared AdminHeader component.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start" style={{ gap: 'var(--spacing-3)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-muted)' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-status-danger)', color: 'var(--color-text-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 500 }}>!</div>
                        <div>
                          <span style={f('sm', 500)}>{item.rule}</span>
                          <p style={f('xs', 400, 'var(--color-text-muted)')}>{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}