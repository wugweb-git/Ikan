import React, { useState } from 'react';
import { 
  Palette, Type, Layout, Grid, Package, Layers, 
  FileText, MousePointer, List, Database, Shield,
  Settings, Bell, Users, Calendar, ChevronRight,
  Check, X, Info, AlertTriangle, Loader2, Search,
  Plus, Edit, Trash2, Download, Upload, Eye, Heart,
  Star, Share2, MessageSquare, Mail, Phone, Map
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { RadioGroup } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { AdminPageLayout } from '../admin/AdminPageLayout';
import { AdminFormField } from '../admin/AdminFormField';
import { AdminActionBar } from '../ui/admin-action-bar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton';
import { WizardLayout } from '../ui/wizard-layout';
import { WizardStep } from '../ui/wizard-stepper';

interface UIKitShowcasePageProps {
  onBack: () => void;
}

export function UIKitShowcasePage({ onBack }: UIKitShowcasePageProps) {
  const [activeCategory, setActiveCategory] = useState('foundations');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'foundations', name: 'Foundations', icon: Palette, count: 8 },
    { id: 'forms', name: 'Form Elements', icon: FileText, count: 12 },
    { id: 'navigation', name: 'Navigation', icon: MousePointer, count: 9 },
    { id: 'feedback', name: 'Feedback', icon: Bell, count: 10 },
    { id: 'data', name: 'Data Display', icon: Database, count: 11 },
    { id: 'layouts', name: 'Layouts', icon: Layout, count: 7 }
  ];

  return (
    <AdminPageLayout
      title="iKan UI Kit"
      subtitle="Complete component library and design system reference"
      maxWidth="full"
      onBack={onBack}
    >
      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div 
          className="w-64 flex-shrink-0"
          style={{
            position: 'sticky',
            top: 'var(--spacing-6)',
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
          }}
        >
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="mb-4">
                <Input
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <Separator />

              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActive ? '#F3F4F6' : 'transparent',
                      fontWeight: isActive ? 'var(--font-weight-medium)' : '400'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" style={{ color: isActive ? '#2A2A2A' : '#6B7280' }} />
                      <span style={{ fontSize: '14px', color: isActive ? '#2A2A2A' : '#6B7280' }}>
                        {category.name}
                      </span>
                    </div>
                    <Badge variant="secondary" style={{ fontSize: '11px' }}>
                      {category.count}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {activeCategory === 'foundations' && <FoundationsSection />}
          {activeCategory === 'forms' && <FormsSection />}
          {activeCategory === 'navigation' && <NavigationSection />}
          {activeCategory === 'feedback' && <FeedbackSection />}
          {activeCategory === 'data' && <DataDisplaySection />}
          {activeCategory === 'layouts' && <LayoutsSection />}
        </div>
      </div>
    </AdminPageLayout>
  );
}

function ComponentShowcaseCard({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description?: string; 
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)' }}>
          {title}
        </CardTitle>
        {description && (
          <CardDescription style={{ fontSize: '14px' }}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

function FoundationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
          Design Foundations
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Core design tokens, colors, typography, and spacing system
        </p>
      </div>

      {/* Colors */}
      <ComponentShowcaseCard 
        title="Color Palette" 
        description="iKan design system color tokens"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Primary" color="#2A2A2A" />
          <ColorSwatch name="Accent" color="#E9EBEF" />
          <ColorSwatch name="Background" color="#F5F5F5" />
          <ColorSwatch name="Card" color="#FFFFFF" />
          <ColorSwatch name="Success" color="#10B981" />
          <ColorSwatch name="Danger" color="#EF4444" />
          <ColorSwatch name="Warning" color="#F59E0B" />
          <ColorSwatch name="Info" color="#3B82F6" />
        </div>
      </ComponentShowcaseCard>

      {/* Typography */}
      <ComponentShowcaseCard 
        title="Typography" 
        description="Ubuntu font family with defined sizes and weights"
      >
        <div className="space-y-4">
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'var(--font-weight-medium)' }}>
              Heading 1 - Ubuntu Medium
            </h1>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>32px / Medium (500)</p>
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)' }}>
              Heading 2 - Ubuntu Medium
            </h2>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>24px / Medium (500)</p>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)' }}>
              Heading 3 - Ubuntu Medium
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>18px / Medium (500)</p>
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: '400' }}>
              Body Text - Ubuntu Regular
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>16px / Regular (400)</p>
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              Secondary Text - Muted
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>14px / Regular (400)</p>
          </div>
        </div>
      </ComponentShowcaseCard>

      {/* Spacing */}
      <ComponentShowcaseCard 
        title="Spacing System" 
        description="4px grid system with consistent spacing tokens"
      >
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((unit) => (
            <div key={unit} className="flex items-center gap-4">
              <div 
                style={{ 
                  width: `${unit * 4}px`, 
                  height: '24px', 
                  backgroundColor: '#3B82F6',
                  borderRadius: '4px'
                }} 
              />
              <span style={{ fontSize: '14px' }}>
                --spacing-{unit} = {unit * 4}px
              </span>
            </div>
          ))}
        </div>
      </ComponentShowcaseCard>

      {/* Border Radius */}
      <ComponentShowcaseCard 
        title="Border Radius" 
        description="Consistent corner rounding values"
      >
        <div className="grid grid-cols-4 gap-4">
          <RadiusSwatch name="SM" value="8px" />
          <RadiusSwatch name="MD" value="12px" />
          <RadiusSwatch name="LG" value="16px" />
          <RadiusSwatch name="XL" value="24px" />
        </div>
      </ComponentShowcaseCard>
    </div>
  );
}

function FormsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
          Form Elements
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Input fields, selectors, and form controls
        </p>
      </div>

      {/* Buttons */}
      <ComponentShowcaseCard title="Buttons" description="Primary, secondary, outline, and ghost variants">
        <div className="flex flex-wrap gap-3">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        
        <Separator />
        
        <div className="flex flex-wrap gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
        
        <Separator />
        
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled</Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            With Icon
          </Button>
          <Button>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading
          </Button>
        </div>
      </ComponentShowcaseCard>

      {/* Input Fields */}
      <ComponentShowcaseCard title="Input Fields" description="Text inputs with various states">
        <div className="space-y-4 max-w-md">
          <div>
            <Label>Default Input</Label>
            <Input placeholder="Enter text..." />
          </div>
          
          <div>
            <Label>With Value</Label>
            <Input value="Example value" readOnly />
          </div>
          
          <div>
            <Label>Disabled</Label>
            <Input placeholder="Disabled input" disabled />
          </div>
          
          <div>
            <Label>With Icon</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
          </div>
        </div>
      </ComponentShowcaseCard>

      {/* Textarea */}
      <ComponentShowcaseCard title="Textarea" description="Multi-line text input">
        <div className="space-y-4 max-w-md">
          <Textarea placeholder="Enter long text..." rows={4} />
          <Textarea placeholder="Disabled textarea" disabled rows={3} />
        </div>
      </ComponentShowcaseCard>

      {/* Select */}
      <ComponentShowcaseCard title="Select Dropdown" description="Single selection dropdown">
        <div className="max-w-md">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Choose an option..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ComponentShowcaseCard>

      {/* Checkbox & Radio */}
      <ComponentShowcaseCard title="Checkbox & Radio" description="Selection controls">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>Checkboxes</p>
            <div className="flex items-center gap-2">
              <Checkbox id="check1" />
              <Label htmlFor="check1">Option 1</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="check2" defaultChecked />
              <Label htmlFor="check2">Option 2 (Checked)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="check3" disabled />
              <Label htmlFor="check3">Option 3 (Disabled)</Label>
            </div>
          </div>
          
          <div className="space-y-3">
            <p style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>Switches</p>
            <div className="flex items-center gap-2">
              <Switch id="switch1" />
              <Label htmlFor="switch1">Enable feature</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="switch2" defaultChecked />
              <Label htmlFor="switch2">Enabled by default</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="switch3" disabled />
              <Label htmlFor="switch3">Disabled</Label>
            </div>
          </div>
        </div>
      </ComponentShowcaseCard>

      {/* Slider */}
      <ComponentShowcaseCard title="Slider" description="Range input control">
        <div className="space-y-4 max-w-md">
          <div>
            <Label>Volume</Label>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
          <div>
            <Label>Disabled</Label>
            <Slider defaultValue={[30]} max={100} disabled />
          </div>
        </div>
      </ComponentShowcaseCard>
    </div>
  );
}

function NavigationSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
          Navigation Components
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Tabs, breadcrumbs, pagination, and navigation elements
        </p>
      </div>

      {/* Tabs */}
      <ComponentShowcaseCard title="Tabs" description="Content organization with tab navigation">
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Overview</TabsTrigger>
            <TabsTrigger value="tab2">Details</TabsTrigger>
            <TabsTrigger value="tab3">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p style={{ fontSize: '14px', padding: '16px 0' }}>Overview content goes here...</p>
          </TabsContent>
          <TabsContent value="tab2">
            <p style={{ fontSize: '14px', padding: '16px 0' }}>Details content goes here...</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p style={{ fontSize: '14px', padding: '16px 0' }}>Settings content goes here...</p>
          </TabsContent>
        </Tabs>
      </ComponentShowcaseCard>

      {/* Accordion */}
      <ComponentShowcaseCard title="Accordion" description="Collapsible content sections">
        <Accordion type="single" collapsible>
          <AccordionItem value="item1">
            <AccordionTrigger>What is iKan?</AccordionTrigger>
            <AccordionContent>
              iKan is a comprehensive mental health platform designed to support your wellbeing journey.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item2">
            <AccordionTrigger>How does it work?</AccordionTrigger>
            <AccordionContent>
              Our platform combines assessments, equip programs, and resources to provide personalized support.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item3">
            <AccordionTrigger>Is it free?</AccordionTrigger>
            <AccordionContent>
              We offer both free and premium features to support everyone's mental health journey.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ComponentShowcaseCard>

      {/* Badges */}
      <ComponentShowcaseCard title="Badges" description="Status indicators and labels">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge style={{ backgroundColor: '#10B981', color: 'white' }}>Success</Badge>
          <Badge style={{ backgroundColor: '#F59E0B', color: 'white' }}>Warning</Badge>
          <Badge style={{ backgroundColor: '#3B82F6', color: 'white' }}>Info</Badge>
        </div>
      </ComponentShowcaseCard>
    </div>
  );
}

function FeedbackSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
          Feedback Components
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Alerts, notifications, progress indicators, and loading states
        </p>
      </div>

      {/* Alerts */}
      <ComponentShowcaseCard title="Alerts" description="System messages and notifications">
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is an informational alert message.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again.
            </AlertDescription>
          </Alert>

          <Alert style={{ backgroundColor: '#D1FAE5', borderColor: '#10B981' }}>
            <Check className="h-4 w-4" style={{ color: '#065F46' }} />
            <AlertTitle style={{ color: '#065F46' }}>Success</AlertTitle>
            <AlertDescription style={{ color: '#047857' }}>
              Operation completed successfully!
            </AlertDescription>
          </Alert>

          <Alert style={{ backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }}>
            <AlertTriangle className="h-4 w-4" style={{ color: '#92400E' }} />
            <AlertTitle style={{ color: '#92400E' }}>Warning</AlertTitle>
            <AlertDescription style={{ color: '#B45309' }}>
              Please review this information carefully.
            </AlertDescription>
          </Alert>
        </div>
      </ComponentShowcaseCard>

      {/* Progress */}
      <ComponentShowcaseCard title="Progress Indicators" description="Loading and completion states">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <Label>Progress: 25%</Label>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>1/4 complete</span>
            </div>
            <Progress value={25} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Progress: 60%</Label>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>3/5 complete</span>
            </div>
            <Progress value={60} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Progress: 100%</Label>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>Complete!</span>
            </div>
            <Progress value={100} />
          </div>
        </div>
      </ComponentShowcaseCard>

      {/* Skeleton Loaders */}
      <ComponentShowcaseCard title="Skeleton Loaders" description="Loading state placeholders">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </ComponentShowcaseCard>

      {/* Empty States */}
      <ComponentShowcaseCard title="Empty States" description="No data or no results states">
        <EmptyState
          icon={<Package className="w-12 h-12" />}
          title="No items found"
          description="There are no items to display. Try creating one to get started."
          action={{
            label: 'Create Item',
            onClick: () => {}
          }}
        />
      </ComponentShowcaseCard>
    </div>
  );
}

function DataDisplaySection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
          Data Display Components
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Cards, avatars, tables, and data visualization
        </p>
      </div>

      {/* Cards */}
      <ComponentShowcaseCard title="Cards" description="Content containers with various layouts">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>Basic card with header and content</CardDescription>
            </CardHeader>
            <CardContent>
              <p style={{ fontSize: '14px' }}>
                This is a simple card component with a header and content area.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Card with Actions</CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p style={{ fontSize: '14px' }}>
                Cards can include action buttons in the header.
              </p>
            </CardContent>
          </Card>
        </div>
      </ComponentShowcaseCard>

      {/* Avatars */}
      <ComponentShowcaseCard title="Avatars" description="User profile pictures and initials">
        <div className="flex items-center gap-4">
          <Avatar>
            <img src="https://ui-avatars.com/api/?name=John+Doe&background=2A2A2A&color=fff" alt="Avatar" />
          </Avatar>
          <Avatar>
            <img src="https://ui-avatars.com/api/?name=Jane+Smith&background=3B82F6&color=fff" alt="Avatar" />
          </Avatar>
          <Avatar>
            <img src="https://ui-avatars.com/api/?name=Alice+Johnson&background=10B981&color=fff" alt="Avatar" />
          </Avatar>
          <Avatar>
            <img src="https://ui-avatars.com/api/?name=Bob+Wilson&background=F59E0B&color=fff" alt="Avatar" />
          </Avatar>
        </div>
      </ComponentShowcaseCard>

      {/* Stats Cards */}
      <ComponentShowcaseCard title="Stats Cards" description="Metrics and statistics display">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Total Users" value="1,234" trend="+12%" trendUp />
          <StatsCard title="Active Programs" value="45" trend="+5%" trendUp />
          <StatsCard title="Completions" value="890" trend="-3%" trendUp={false} />
          <StatsCard title="Avg. Rating" value="4.8" trend="+0.2" trendUp />
        </div>
      </ComponentShowcaseCard>
    </div>
  );
}

function LayoutsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
          Layout Components
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Page layouts, sections, and structural components
        </p>
      </div>

      {/* Admin Page Layout */}
      <ComponentShowcaseCard title="Admin Page Layout" description="Standard admin page structure with header and actions">
        <div 
          className="p-6 rounded-lg border-2 border-dashed"
          style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)' }}>Page Title</h3>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>Page subtitle or description</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </div>
            </div>
            <div className="h-40 bg-white rounded-lg flex items-center justify-center">
              <p style={{ fontSize: '14px', color: '#6B7280' }}>Page content area</p>
            </div>
          </div>
        </div>
      </ComponentShowcaseCard>

      {/* Admin Form Field */}
      <ComponentShowcaseCard title="Admin Form Field" description="Consistent form field layout with label and description">
        <div className="max-w-md space-y-4">
          <AdminFormField
            label="Field Label"
            description="Helper text explaining what this field is for"
            required
          >
            <Input placeholder="Enter value..." />
          </AdminFormField>

          <AdminFormField
            label="Another Field"
            description="Optional field with description"
          >
            <Textarea placeholder="Enter text..." rows={3} />
          </AdminFormField>
        </div>
      </ComponentShowcaseCard>

      {/* Separator */}
      <ComponentShowcaseCard title="Separator" description="Visual divider between sections">
        <div className="space-y-4">
          <p style={{ fontSize: '14px' }}>Content above separator</p>
          <Separator />
          <p style={{ fontSize: '14px' }}>Content below separator</p>
        </div>
      </ComponentShowcaseCard>

      {/* Admin Action Bar */}
      <ComponentShowcaseCard title="Admin Action Bar" description="WordPress-style sticky action bar for edit pages">
        <div 
          className="relative h-64 overflow-hidden rounded-lg border"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="p-6 bg-white h-full">
            <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', paddingTop: '80px' }}>
              Scroll down to see the action bar (sticky at bottom)
            </p>
          </div>
          <AdminActionBar
            onDelete={() => {}}
            onCancel={() => {}}
            onSaveDraft={() => {}}
            onPublish={() => {}}
            isPublished={false}
            isSaving={false}
            showDelete={true}
          />
        </div>
      </ComponentShowcaseCard>
    </div>
  );
}

// Helper Components

function ColorSwatch({ name, color }: { name: string; color: string }) {
  return (
    <div className="space-y-2">
      <div 
        className="w-full h-20 rounded-lg"
        style={{ backgroundColor: color }}
      />
      <div>
        <p style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}>{name}</p>
        <p style={{ fontSize: '11px', color: '#6B7280' }}>{color}</p>
      </div>
    </div>
  );
}

function RadiusSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="space-y-2">
      <div 
        className="w-full h-20 bg-gradient-to-br from-blue-400 to-purple-500"
        style={{ borderRadius: value }}
      />
      <div>
        <p style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}>{name}</p>
        <p style={{ fontSize: '11px', color: '#6B7280' }}>{value}</p>
      </div>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  trend, 
  trendUp 
}: { 
  title: string; 
  value: string; 
  trend: string; 
  trendUp: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p style={{ fontSize: '12px', color: '#6B7280' }}>{title}</p>
        <p style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)', marginTop: '4px' }}>
          {value}
        </p>
        <p 
          style={{ 
            fontSize: '12px', 
            color: trendUp ? '#10B981' : '#EF4444',
            marginTop: '4px'
          }}
        >
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
