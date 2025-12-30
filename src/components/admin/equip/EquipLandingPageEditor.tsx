import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { FileUpload } from '../../ui/file-upload';

export function EquipLandingPageEditor({ program, onChange }: { program: any, onChange: (u: any) => void }) {
  
  // Helpers for array fields
  const updateArrayField = (field: string, index: number, value: string) => {
    const current = program[field] || [];
    const updated = [...current];
    updated[index] = value;
    onChange({ [field]: updated });
  };

  const addToArrayField = (field: string) => {
    const current = program[field] || [];
    onChange({ [field]: [...current, ''] });
  };

  const removeFromArrayField = (field: string, index: number) => {
    const current = program[field] || [];
    const updated = current.filter((_: any, i: number) => i !== index);
    onChange({ [field]: updated });
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Landing Page Builder</h2>
        <p className="text-gray-500">Configure how the program appears to potential enrollees.</p>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>The main banner and call to action.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label>Hero Image</Label>
            <FileUpload 
              value={program.hero_image || program.cover_image || ''}
              onChange={(url) => onChange({ hero_image: url })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>CTA Button Text</Label>
              <Input 
                value={program.cta_button_text || ''} 
                onChange={(e) => onChange({ cta_button_text: e.target.value })}
                placeholder="e.g. Start Program"
              />
            </div>
            <div className="grid gap-2">
              <Label>CTA Link Override (Optional)</Label>
              <Input 
                value={program.cta_button_link || ''} 
                onChange={(e) => onChange({ cta_button_link: e.target.value })}
                placeholder="Default: /equip-program-onboarding?id=..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle>Section 1: Is this for you?</CardTitle>
          <CardDescription>Help users decide if this program fits their needs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
             <Label>Section Title</Label>
             <Input 
               value={program.section1_title || ''} 
               onChange={(e) => onChange({ section1_title: e.target.value })}
               placeholder="Is this for you?"
             />
          </div>
          
          <div className="grid gap-2">
            <Label>Eligibility Points (Bulleted list)</Label>
            {(program.section1_eligibility_points || []).map((point: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input value={point} onChange={(e) => updateArrayField('section1_eligibility_points', i, e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => removeFromArrayField('section1_eligibility_points', i)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addToArrayField('section1_eligibility_points')} className="w-fit">
              <Plus className="w-4 h-4 mr-2" /> Add Point
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
               <Label>Who Title</Label>
               <Input 
                 value={program.section1_who_title || ''} 
                 onChange={(e) => onChange({ section1_who_title: e.target.value })}
                 placeholder="Who can participate"
               />
             </div>
             <div className="grid gap-2">
               <Label>Who Content</Label>
               <Input 
                 value={program.section1_who_content || ''} 
                 onChange={(e) => onChange({ section1_who_content: e.target.value })}
                 placeholder="Designed for adults..."
               />
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: About */}
      <Card>
        <CardHeader>
          <CardTitle>Section 2: About the Program</CardTitle>
          <CardDescription>Detailed overview and highlights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
               <Label>Title</Label>
               <Input 
                 value={program.section2_title || ''} 
                 onChange={(e) => onChange({ section2_title: e.target.value })}
                 placeholder="What is this program?"
               />
             </div>
             <div className="grid gap-2">
               <Label>Subtitle</Label>
               <Input 
                 value={program.section2_subtitle || ''} 
                 onChange={(e) => onChange({ section2_subtitle: e.target.value })}
                 placeholder="A guided path..."
               />
             </div>
          </div>

          <div className="grid gap-2">
            <Label>Content Description</Label>
            <Textarea 
              value={program.section2_content || ''} 
              onChange={(e) => onChange({ section2_content: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label>Feature Image</Label>
            <FileUpload 
              value={program.section2_image || ''}
              onChange={(url) => onChange({ section2_image: url })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Program Includes (Bullets)</Label>
            {(program.section2_bullets || []).map((point: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input value={point} onChange={(e) => updateArrayField('section2_bullets', i, e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => removeFromArrayField('section2_bullets', i)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addToArrayField('section2_bullets')} className="w-fit">
              <Plus className="w-4 h-4 mr-2" /> Add Feature
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>Section 3: How it Works</CardTitle>
          <CardDescription>Explain the process or steps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
               <Label>Title</Label>
               <Input 
                 value={program.section3_title || ''} 
                 onChange={(e) => onChange({ section3_title: e.target.value })}
                 placeholder="How it works"
               />
             </div>
             <div className="grid gap-2">
               <Label>Subtitle</Label>
               <Input 
                 value={program.section3_subtitle || ''} 
                 onChange={(e) => onChange({ section3_subtitle: e.target.value })}
                 placeholder="Simple steps"
               />
             </div>
          </div>

          <div className="grid gap-2">
            <Label>Steps</Label>
            {(program.section3_content || []).map((step: string, i: number) => (
              <div key={i} className="flex gap-2 items-start">
                 <div className="bg-neutral-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-1">
                   {i+1}
                 </div>
                <Textarea 
                  value={step} 
                  onChange={(e) => updateArrayField('section3_content', i, e.target.value)} 
                  rows={2}
                />
                <Button variant="ghost" size="icon" onClick={() => removeFromArrayField('section3_content', i)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addToArrayField('section3_content')} className="w-fit">
              <Plus className="w-4 h-4 mr-2" /> Add Step
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Benefits & Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Section 4: Benefits & Notes</CardTitle>
          <CardDescription>Final value proposition and important details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
             <Label>Benefits Title</Label>
             <Input 
               value={program.section4_benefits_title || ''} 
               onChange={(e) => onChange({ section4_benefits_title: e.target.value })}
               placeholder="What you'll gain"
             />
          </div>

          <div className="grid gap-2">
            <Label>Benefits (Format: "Title | Description")</Label>
            <p className="text-xs text-gray-500">Use the pipe character '|' to separate title from description.</p>
            {(program.section4_benefits || []).map((benefit: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input 
                   value={benefit} 
                   onChange={(e) => updateArrayField('section4_benefits', i, e.target.value)} 
                   placeholder="Title | Description"
                />
                <Button variant="ghost" size="icon" onClick={() => removeFromArrayField('section4_benefits', i)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addToArrayField('section4_benefits')} className="w-fit">
              <Plus className="w-4 h-4 mr-2" /> Add Benefit
            </Button>
          </div>

          <div className="border-t pt-4 mt-4">
             <div className="grid gap-2 mb-4">
               <Label>Notes Title</Label>
               <Input 
                 value={program.section4_notes_title || ''} 
                 onChange={(e) => onChange({ section4_notes_title: e.target.value })}
                 placeholder="Important Notes"
               />
             </div>
             
             <div className="grid gap-2">
                <Label>Notes Cards</Label>
                {(program.section4_notes || []).map((note: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                       value={note} 
                       onChange={(e) => updateArrayField('section4_notes', i, e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeFromArrayField('section4_notes', i)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addToArrayField('section4_notes')} className="w-fit">
                  <Plus className="w-4 h-4 mr-2" /> Add Note
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}