import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { FileUpload } from '../../ui/file-upload';

export function EquipMetaEditor({ program, onChange }: { program: any, onChange: (u: any) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Program Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label>Program Title</Label>
            <Input 
              value={program.title || program.name || ''} 
              onChange={(e) => onChange({ title: e.target.value, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="grid gap-2">
               <Label>Category</Label>
               <Select 
                 value={program.category} 
                 onValueChange={(val) => onChange({ category: val })}
               >
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="anxiety">Anxiety</SelectItem>
                   <SelectItem value="depression">Depression</SelectItem>
                   <SelectItem value="sleep">Sleep</SelectItem>
                   <SelectItem value="mindfulness">Mindfulness</SelectItem>
                   <SelectItem value="wellness">Wellness</SelectItem>
                   <SelectItem value="relationships">Relationships</SelectItem>
                   <SelectItem value="general">General</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             
             <div className="grid gap-2">
               <Label>Status</Label>
               <Select 
                 value={program.status} 
                 onValueChange={(val) => onChange({ status: val })}
               >
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="draft">Draft</SelectItem>
                   <SelectItem value="published">Published</SelectItem>
                   <SelectItem value="archived">Archived</SelectItem>
                 </SelectContent>
               </Select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="grid gap-2">
               <Label>Duration (Days)</Label>
               <Input 
                 type="number"
                 value={program.duration_days} 
                 onChange={(e) => onChange({ duration_days: parseInt(e.target.value) })}
               />
             </div>
             <div className="grid gap-2">
               <Label>Price (Cents)</Label>
               <Input 
                 type="number"
                 value={program.price_cents} 
                 onChange={(e) => onChange({ price_cents: parseInt(e.target.value) })}
               />
             </div>
          </div>

          <div className="grid gap-2">
             <Label>Short Description</Label>
             <Textarea 
               value={program.description} 
               onChange={(e) => onChange({ description: e.target.value })}
               rows={4}
             />
          </div>
          
          <div className="grid gap-2">
             <Label>Thumbnail Image</Label>
             <FileUpload 
               value={program.thumbnail || program.cover_image_url || ''} 
               onChange={(url) => onChange({ thumbnail: url, cover_image_url: url })}
             />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
