import React from 'react';
import { 
  LayoutTemplate, Users, Target, CheckCircle, 
  HelpCircle, Star, Plus, Trash2, AlignLeft, Info
} from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AdminFormField } from '../admin/AdminFormField';
import { EquipProgram } from '../../lib/equip-admin-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { RichTextEditor } from '../ui/rich-text-editor';
import { ImageUpload } from '../ui/image-upload';

interface EquipLandingPageEditorProps {
  data: Partial<EquipProgram>;
  onChange: (updates: Partial<EquipProgram>) => void;
}

export function EquipLandingPageEditor({ data, onChange }: EquipLandingPageEditorProps) {
  
  const handleArrayChange = (field: keyof EquipProgram, index: number, value: string) => {
    const currentArray = (data[field] as string[]) || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    onChange({ [field]: newArray });
  };

  const addArrayItem = (field: keyof EquipProgram) => {
    const currentArray = (data[field] as string[]) || [];
    onChange({ [field]: [...currentArray, ''] });
  };

  const removeArrayItem = (field: keyof EquipProgram, index: number) => {
    const currentArray = (data[field] as string[]) || [];
    onChange({ [field]: currentArray.filter((_, i) => i !== index) });
  };

  // Helper for array of objects (e.g. Benefits)
  const handleObjectArrayChange = (field: keyof EquipProgram, index: number, key: string, value: string) => {
    const currentArray = (data[field] as any[]) || [];
    const newArray = [...currentArray];
    // If string, convert to object first (migration)
    if (typeof newArray[index] === 'string') {
        const [t, d] = (newArray[index] as string).split('|').map(s => s.trim());
        newArray[index] = { title: t || '', description: d || '' };
    }
    
    newArray[index] = { ...newArray[index], [key]: value };
    onChange({ [field]: newArray });
  };

  const addObjectArrayItem = (field: keyof EquipProgram, initial: any) => {
    const currentArray = (data[field] as any[]) || [];
    onChange({ [field]: [...currentArray, initial] });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <LayoutTemplate className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-900">Bento Grid Configuration</h4>
          <p className="text-sm text-blue-800">
            Configure the 6 main tiles displayed on the program landing page.
          </p>
        </div>
      </div>

      <Tabs defaultValue="section1" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-gray-100/50 p-1 overflow-x-auto">
          <TabsTrigger value="section1" className="gap-2 shrink-0">
            <Users size={16} /> Eligibility
          </TabsTrigger>
          <TabsTrigger value="section2" className="gap-2 shrink-0">
            <HelpCircle size={16} /> About & Highlights
          </TabsTrigger>
          <TabsTrigger value="section3" className="gap-2 shrink-0">
            <AlignLeft size={16} /> How It Works
          </TabsTrigger>
          <TabsTrigger value="section4" className="gap-2 shrink-0">
            <Target size={16} /> Benefits & Notes
          </TabsTrigger>
        </TabsList>

        {/* SECTION 1: ELIGIBILITY (Tile 1 & 2) */}
        <TabsContent value="section1" className="space-y-6 pt-4 animate-in slide-in-from-left-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tile 1: Eligibility Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AdminFormField label="Section Title">
                <Input 
                  value={data.section1_title || "Is this for you?"}
                  onChange={e => onChange({ section1_title: e.target.value })}
                  placeholder="e.g. Is Sleep Tight for you?"
                />
              </AdminFormField>
              
              <AdminFormField label="Subtitle">
                <Input 
                  value={(data as any).section1_eligibility_title || "This program is helpful if:"}
                  onChange={e => onChange({ section1_eligibility_title: e.target.value } as any)}
                />
              </AdminFormField>

              <div className="space-y-3">
                <Label>Checkpoints</Label>
                {(data.section1_eligibility_points || []).map((point, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <Input 
                      value={point}
                      onChange={e => handleArrayChange('section1_eligibility_points', i, e.target.value)}
                      placeholder="e.g. You struggle falling asleep..."
                    />
                    <Button 
                      variant="ghost" size="icon" 
                      onClick={() => removeArrayItem('section1_eligibility_points', i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('section1_eligibility_points')} className="w-full border-dashed">
                  <Plus size={14} className="mr-2" /> Add Checkpoint
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tile 2: Who Can Participate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AdminFormField label="Title">
                <Input 
                  value={(data as any).section1_who_title || "Who can participate"}
                  onChange={e => onChange({ section1_who_title: e.target.value } as any)}
                />
              </AdminFormField>
              <AdminFormField label="Content">
                <Textarea 
                  value={(data as any).section1_who_content || ""}
                  onChange={e => onChange({ section1_who_content: e.target.value } as any)}
                  rows={4}
                />
              </AdminFormField>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 2: ABOUT (Tile 3) */}
        <TabsContent value="section2" className="space-y-6 pt-4 animate-in slide-in-from-left-2 duration-300">
           <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tile 3: About the Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <AdminFormField label="Headline">
                    <Input 
                    value={data.section2_title || ""}
                    onChange={e => onChange({ section2_title: e.target.value })}
                    />
                </AdminFormField>
                <AdminFormField label="Subtitle">
                    <Input 
                    value={(data as any).section2_subtitle || ""}
                    onChange={e => onChange({ section2_subtitle: e.target.value } as any)}
                    />
                </AdminFormField>
              </div>

              <AdminFormField label="Primary Image">
                <ImageUpload 
                  value={data.section2_image || ""}
                  onChange={v => onChange({ section2_image: v })}
                  className="h-40"
                  aspectRatio="video"
                />
              </AdminFormField>

              <AdminFormField label="Main Description (Rich Text)" description="Use Markdown or HTML">
                <RichTextEditor 
                  value={data.section2_content || ""}
                  onChange={v => onChange({ section2_content: v })}
                  minHeight="200px"
                />
              </AdminFormField>

              <div className="space-y-3">
                <Label>Key Highlights (Bullets)</Label>
                {(data.section2_bullets || []).map((bullet, i) => (
                  <div key={i} className="flex gap-2">
                    <Star size={16} className="mt-3 text-amber-400 shrink-0" />
                    <Input 
                      value={bullet}
                      onChange={e => handleArrayChange('section2_bullets', i, e.target.value)}
                      placeholder="e.g. 10 minutes a day"
                    />
                     <Button 
                      variant="ghost" size="icon" 
                      onClick={() => removeArrayItem('section2_bullets', i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('section2_bullets')} className="w-full border-dashed">
                  <Plus size={14} className="mr-2" /> Add Highlight
                </Button>
              </div>

              <AdminFormField label="Secondary Image (Optional)">
                <ImageUpload 
                  value={(data as any).section2_image_secondary || ""}
                  onChange={v => onChange({ section2_image_secondary: v } as any)}
                  className="h-40"
                  aspectRatio="video"
                />
              </AdminFormField>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 3: STRUCTURE (Tile 4) */}
        <TabsContent value="section3" className="space-y-6 pt-4 animate-in slide-in-from-left-2 duration-300">
           <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tile 4: How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <AdminFormField label="Title">
                  <Input 
                    value={data.section3_title || "How it works"}
                    onChange={e => onChange({ section3_title: e.target.value })}
                  />
                </AdminFormField>
                <AdminFormField label="Subtitle">
                  <Input 
                    value={data.section3_subtitle || "Simple steps to better sleep"}
                    onChange={e => onChange({ section3_subtitle: e.target.value })}
                  />
                </AdminFormField>
              </div>

              <div className="space-y-3">
                <Label>Process Steps</Label>
                <p className="text-xs text-gray-500">Describe the daily flow (e.g., Read, Practice, Log).</p>
                {(data.section3_content || []).map((step, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <Input 
                      value={step}
                      onChange={e => handleArrayChange('section3_content', i, e.target.value)}
                      placeholder={`Step ${i+1} description...`}
                    />
                    <Button 
                      variant="ghost" size="icon" 
                      onClick={() => removeArrayItem('section3_content', i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('section3_content')} className="w-full border-dashed">
                  <Plus size={14} className="mr-2" /> Add Step
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 4: BENEFITS (Tile 5 & 6) */}
        <TabsContent value="section4" className="space-y-6 pt-4 animate-in slide-in-from-left-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tile 5: What You'll Gain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AdminFormField label="Title">
                <Input 
                  value={(data as any).section4_benefits_title || "What you'll gain"}
                  onChange={e => onChange({ section4_benefits_title: e.target.value } as any)}
                />
              </AdminFormField>

              <div className="space-y-3">
                <Label>Benefit Cards</Label>
                {/* We map overview_benefits for legacy reasons, but ideally use section4_benefits */}
                {((data.section4_benefits as any[]) || []).map((benefit: any, i) => (
                  <div key={i} className="flex gap-2 items-start p-2 border rounded-lg bg-gray-50">
                    <CheckCircle size={16} className="mt-3 text-green-500 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Input 
                          value={benefit.title}
                          onChange={e => handleObjectArrayChange('section4_benefits' as any, i, 'title', e.target.value)}
                          placeholder="Title"
                          className="font-medium"
                        />
                        <Textarea 
                          value={benefit.description}
                          onChange={e => handleObjectArrayChange('section4_benefits' as any, i, 'description', e.target.value)}
                          placeholder="Description"
                          rows={2}
                          className="text-sm"
                        />
                    </div>
                     <Button 
                      variant="ghost" size="icon" 
                      onClick={() => removeArrayItem('section4_benefits' as any, i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addObjectArrayItem('section4_benefits' as any, { title: '', description: '' })} className="w-full border-dashed">
                  <Plus size={14} className="mr-2" /> Add Benefit
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tile 6: Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AdminFormField label="Title">
                <Input 
                  value={(data as any).section4_notes_title || "Important notes"}
                  onChange={e => onChange({ section4_notes_title: e.target.value } as any)}
                />
              </AdminFormField>

              <div className="space-y-3">
                <Label>Note Cards</Label>
                {((data as any).section4_notes || []).map((note: any, i: number) => (
                  <div key={i} className="flex gap-2 items-start p-2 border rounded-lg bg-gray-50">
                    <Info size={16} className="mt-3 text-blue-500 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Input 
                          value={note.title}
                          onChange={e => handleObjectArrayChange('section4_notes' as any, i, 'title', e.target.value)}
                          placeholder="Title"
                          className="font-medium"
                        />
                        <Textarea 
                          value={note.description}
                          onChange={e => handleObjectArrayChange('section4_notes' as any, i, 'description', e.target.value)}
                          placeholder="Description"
                          rows={2}
                          className="text-sm"
                        />
                    </div>
                     <Button 
                      variant="ghost" size="icon" 
                      onClick={() => removeArrayItem('section4_notes' as any, i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addObjectArrayItem('section4_notes' as any, { title: '', description: '' })} className="w-full border-dashed">
                  <Plus size={14} className="mr-2" /> Add Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}