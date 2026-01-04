import React, { useState } from 'react';
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
import { Icon } from '../Icon';
import { BlockRenderer } from '../player/BlockRenderer';
import { BookOpen, Check, AlertTriangle, Info, Bell, Settings, User, Activity } from 'lucide-react';

export function UIKitPatterns() {
  const [mcqValue, setMcqValue] = useState<string>('');
  const [scaleValue, setScaleValue] = useState<number | null>(null);
  const [textValue, setTextValue] = useState<string>('');

  // --- MOCK BLOCKS FOR DEMO ---
  const mcqBlock = {
    id: 'demo-mcq',
    type: 'exercise',
    title: 'How often do you feel anxious?',
    content: '',
    exerciseConfig: {
      subtype: 'single-select',
      prompt: 'Select the option that best describes your experience over the last 2 weeks.',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    }
  };

  const scaleBlock = {
    id: 'demo-scale',
    type: 'exercise',
    title: 'Rate your energy level today',
    content: '',
    exerciseConfig: {
      subtype: 'clinical_instrument',
      prompt: 'Please rate from 1 (Low) to 5 (High)',
      questions: ['Energy Level'],
      scale: [
        { label: 'Very Low', value: 1 },
        { label: 'Low', value: 2 },
        { label: 'Neutral', value: 3 },
        { label: 'High', value: 4 },
        { label: 'Very High', value: 5 }
      ]
    }
  };

  const journalBlock = {
    id: 'demo-journal',
    type: 'journal',
    title: 'Daily Reflection',
    content: '',
    exerciseConfig: {
      prompt: 'What is one thing you are grateful for today?',
      maxEntries: 500
    }
  };

  const lessonBlock = {
    id: 'demo-lesson',
    type: 'lesson',
    title: 'Understanding Anxiety',
    content: '<p>Anxiety is a natural response to stress. It\'s a feeling of fear or apprehension about what\'s to come.</p>',
    image_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    exerciseConfig: {}
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin UI Kit</h1>
        <p className="text-gray-500">Comprehensive guide to iKan design system components, tokens, and patterns.</p>
      </div>

      <Tabs defaultValue="primitives" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="primitives">Primitives</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          <TabsTrigger value="blocks">Content Blocks</TabsTrigger>
        </TabsList>

        {/* --- PRIMITIVES TAB --- */}
        <TabsContent value="primitives" className="space-y-8 mt-6">
          
          {/* BUTTONS */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Buttons</h2>
            <div className="flex flex-wrap gap-4 items-center p-4 bg-white rounded-lg border">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center p-4 bg-white rounded-lg border">
               <Button size="lg">Large Button</Button>
               <Button size="default">Default Button</Button>
               <Button size="sm">Small</Button>
               <Button size="icon"><Settings size={16} /></Button>
            </div>
          </section>

          {/* BADGES */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Badges</h2>
            <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge className="bg-blue-500 hover:bg-blue-600">Custom Blue</Badge>
              <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
            </div>
          </section>

          {/* INPUTS & FORMS */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Inputs & Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-lg border">
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" placeholder="Email" />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="text">Text Area</Label>
                  <Textarea placeholder="Type your message here." />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <Label htmlFor="airplane-mode">Airplane Mode</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>

                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one">Option One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two">Option Two</Label>
                  </div>
                </RadioGroup>

                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* --- COMPONENTS TAB --- */}
        <TabsContent value="components" className="space-y-8 mt-6">
          
          {/* CARDS */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card Description goes here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content. This is a basic card component used throughout the admin dashboard.</p>
                </CardContent>
                <CardFooter>
                  <p>Card Footer</p>
                </CardFooter>
              </Card>

              <Card className="border-l-4 border-l-[var(--color-primary-default)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="text-primary" />
                    Status Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">98.5%</div>
                  <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ALERTS */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Alerts</h2>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  You can add components to your app using the cli.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Your session has expired. Please log in again.
                </AlertDescription>
              </Alert>
            </div>
          </section>

          {/* ACCORDION */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Accordion</h2>
            <Accordion type="single" collapsible className="w-full bg-white p-4 rounded-lg border">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles that matches the other components' aesthetic.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* DIALOGS */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Overlays</h2>
            <div className="flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" value="Pedro Duarte" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </section>
        </TabsContent>

        {/* --- TOKENS TAB --- */}
        <TabsContent value="tokens" className="space-y-8 mt-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Colors</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Primary Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                     { name: 'Primary', color: 'var(--color-primary-default)' },
                     { name: 'Primary Light', color: 'var(--color-primary-light)' },
                     { name: 'Primary Dark', color: 'var(--color-primary-dark)' },
                  ].map(c => (
                    <div key={c.name} className="flex flex-col gap-2">
                      <div className="h-20 w-full rounded-md shadow-sm" style={{ backgroundColor: c.color }} />
                      <span className="text-xs font-mono">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                     { name: 'Success', color: 'var(--color-status-success)' },
                     { name: 'Warning', color: 'var(--color-status-warning)' },
                     { name: 'Error', color: 'var(--color-status-error)' },
                     { name: 'Info', color: 'var(--color-status-info)' },
                  ].map(c => (
                    <div key={c.name} className="flex flex-col gap-2">
                      <div className="h-20 w-full rounded-md shadow-sm" style={{ backgroundColor: c.color }} />
                      <span className="text-xs font-mono">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Typography</h2>
            <div className="space-y-4 bg-white p-6 rounded-lg border">
              <div>
                <p className="text-4xl font-bold">Heading 1</p>
                <span className="text-xs text-gray-400">text-4xl font-bold</span>
              </div>
              <div>
                <p className="text-3xl font-semibold">Heading 2</p>
                <span className="text-xs text-gray-400">text-3xl font-semibold</span>
              </div>
              <div>
                <p className="text-2xl font-medium">Heading 3</p>
                <span className="text-xs text-gray-400">text-2xl font-medium</span>
              </div>
              <div>
                <p className="text-base">Body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <span className="text-xs text-gray-400">text-base</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Small text / Muted</p>
                <span className="text-xs text-gray-400">text-sm text-muted-foreground</span>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* --- BLOCKS TAB --- */}
        <TabsContent value="blocks" className="space-y-8 mt-6">
          <section className="space-y-6">
             <div>
                <h2 className="text-2xl font-bold">Content Blocks</h2>
                <p className="text-gray-500">
                  Components powered by `BlockRenderer` used in Equip Programs and Assessments.
                </p>
             </div>

             {/* MCQ Pattern */}
             <Card className="border-l-4 border-l-[var(--color-primary-default)]">
               <CardHeader>
                 <CardTitle>Multiple Choice Question</CardTitle>
                 <CardDescription>Standard pattern for assessments.</CardDescription>
               </CardHeader>
               <CardContent className="bg-gray-50 p-6 rounded-b-lg">
                  <BlockRenderer block={mcqBlock} value={mcqValue} onChange={setMcqValue} />
               </CardContent>
             </Card>

             {/* Clinical Instrument */}
             <Card className="border-l-4 border-l-[var(--color-secondary-default)]">
               <CardHeader>
                 <CardTitle>Clinical Scale</CardTitle>
               </CardHeader>
               <CardContent className="bg-gray-50 p-6 rounded-b-lg">
                  <BlockRenderer block={scaleBlock} value={scaleValue} onChange={setScaleValue} />
               </CardContent>
             </Card>

             {/* Journal */}
             <Card className="border-l-4 border-l-[var(--color-accent-default)]">
               <CardHeader>
                 <CardTitle>Journal Entry</CardTitle>
               </CardHeader>
               <CardContent className="bg-gray-50 p-6 rounded-b-lg">
                  <BlockRenderer block={journalBlock} value={textValue} onChange={setTextValue} />
               </CardContent>
             </Card>

             {/* Lesson */}
             <Card className="border-l-4 border-l-purple-500">
               <CardHeader>
                 <CardTitle>Lesson Content</CardTitle>
               </CardHeader>
               <CardContent className="bg-gray-50 p-6 rounded-b-lg">
                  <BlockRenderer block={lessonBlock} value={null} onChange={() => {}} />
               </CardContent>
             </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
