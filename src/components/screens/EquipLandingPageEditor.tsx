import React from 'react';
import { 
  LayoutTemplate, Users, Target, CheckCircle, 
  HelpCircle, Star, Plus, Trash2, AlignLeft
} from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AdminFormField } from '../admin/AdminFormField';
import { EquipProgram } from '../../lib/equip-admin-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

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

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <LayoutTemplate className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-900">Landing Page Configuration</h4>
          <p className="text-sm text-blue-800">
            This content populates the "Bento Grid" on the user-facing program overview page.
            Focus on clarity and benefits.
          </p>
        </div>
      </div>

      <Tabs defaultValue="eligibility" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-gray-100/50 p-1">
          <TabsTrigger value="eligibility" className="gap-2">
            <Users size={16} /> Is This For You?
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2">
            <HelpCircle size={16} /> What Is It?
          </TabsTrigger>
          <TabsTrigger value="structure" className="gap-2">
            <AlignLeft size={16} /> How It Works
          </TabsTrigger>
          <TabsTrigger value="benefits" className="gap-2">
            <Target size={16} /> Benefits
          </TabsTrigger>
        </TabsList>

        {/* SECTION 1: ELIGIBILITY */}
        <TabsContent value="eligibility" className="space-y-6 pt-4 animate-in slide-in-from-left-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Section 1: Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AdminFormField label="Section Title">
                <Input 
                  value={data.section1_title || "Is this for you?"}
                  onChange={e => onChange({ section1_title: e.target.value })}
                  placeholder="e.g. Is Sleep Tight for you?"
                />
              </AdminFormField>

              <div className="space-y-3">
                <Label>Eligibility Checkpoints</Label>
                <p className="text-xs text-gray-500">Add 3-5 statements that describe the ideal user.</p>
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
        </TabsContent>

        {/* SECTION 2: ABOUT */}
        <TabsContent value="about" className="space-y-6 pt-4 animate-in slide-in-from-left-2 duration-300">
           <Card>
            <CardHeader>
              <CardTitle className="text-lg">Section 2: What is Sleep Tight?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AdminFormField label="Headline">
                <Input 
                  value={data.section2_title || ""}
                  onChange={e => onChange({ section2_title: e.target.value })}
                  placeholder="e.g. A science-backed path to rest"
                />
              </AdminFormField>

              <AdminFormField label="Main Description (Rich Text)" description="Use Markdown or HTML">
                <Textarea 
                  value={data.section2_content || ""}
                  onChange={e => onChange({ section2_content: e.target.value })}
                  className="min-h-[150px] font-mono text-sm"
                  placeholder="Enter the main program description here..."
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 3: STRUCTURE */}
        <TabsContent value="structure" className="space-y-6 pt-4 animate-in slide-in-from-left-2 duration-300">
           <Card>
            <CardHeader>
              <CardTitle className="text-lg">Section 3: How It Works</CardTitle>
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

        {/* SECTION 4: BENEFITS */}
        <TabsContent value="benefits" className="space-y-6 pt-4 animate-in slide-in-from-left-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Section 4: What You'll Gain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Benefit Cards</Label>
                 <p className="text-xs text-gray-500">Format: Title | Description</p>
                {(data.overview_benefits || []).map((benefit, i) => (
                  <div key={i} className="flex gap-2">
                    <CheckCircle size={16} className="mt-3 text-green-500 shrink-0" />
                    <Input 
                      value={benefit}
                      onChange={e => handleArrayChange('overview_benefits', i, e.target.value)}
                      placeholder="e.g. Better Rest | Fall asleep faster using proven techniques."
                    />
                     <Button 
                      variant="ghost" size="icon" 
                      onClick={() => removeArrayItem('overview_benefits', i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('overview_benefits')} className="w-full border-dashed">
                  <Plus size={14} className="mr-2" /> Add Benefit
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
