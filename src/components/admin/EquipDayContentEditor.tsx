import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, AlertTriangle, AlertCircle, Check, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';
import { DayContent, Activity } from '../../lib/equip-admin-types';
import { DAY_TYPE_PRESETS, getPresetForDayType, validateBlockForDayType } from './day-presets';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface EquipDayContentEditorProps {
  days: DayContent[];
  onChange: (days: DayContent[]) => void;
  durationDays: number;
}

export function EquipDayContentEditor({ days, onChange, durationDays }: EquipDayContentEditorProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const handleAddDay = () => {
    const nextDayNumber = days.length > 0 
      ? Math.max(...days.map(d => d.day)) + 1 
      : 1;
    
    onChange([
      ...days,
      { 
        day: nextDayNumber, 
        title: '', 
        description: '', 
        activities: [],
        dayType: 'learning' // Default
      }
    ]);
    setExpandedDay(nextDayNumber);
  };

  const handleRemoveDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index);
    onChange(newDays);
  };

  const handleUpdateDay = (index: number, updates: Partial<DayContent>) => {
    const newDays = [...days];
    // If dayType changes, we might want to apply presets
    if (updates.dayType && updates.dayType !== newDays[index].dayType) {
       // Logic to apply preset defaults could go here, 
       // but strictly we should asking user confirmation if data exists.
       // For now, we will just update the type and let the UI show warnings/recommendations.
       
       // OPTIONAL: Auto-populate if empty
       if (newDays[index].activities.length === 0) {
          const preset = getPresetForDayType(updates.dayType);
          if (preset && preset.defaultBlocks) {
             // Generate IDs for default blocks
             updates.activities = preset.defaultBlocks.map((block, i) => ({
                ...block,
                id: `block-${Date.now()}-${i}`,
                order: i,
                required: block.required ?? false,
                title: block.title || 'Untitled Block'
             })) as Activity[];
          }
       }
    }

    newDays[index] = { ...newDays[index], ...updates };
    onChange(newDays);
  };

  const sortedDays = [...days].sort((a, b) => a.day - b.day);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Daily Content</h3>
          <p className="text-sm text-muted-foreground">
            Configure {durationDays} days of content.
          </p>
        </div>
        <Button onClick={handleAddDay} className="gap-2">
          <Plus size={16} />
          Add Day
        </Button>
      </div>

      <div className="space-y-4">
        {sortedDays.map((day, index) => {
          const actualIndex = days.findIndex(d => d.day === day.day);
          return (
             <DayEditorCard 
               key={day.day}
               day={day}
               index={actualIndex}
               onUpdate={(updates) => handleUpdateDay(actualIndex, updates)}
               onRemove={() => handleRemoveDay(actualIndex)}
               isExpanded={expandedDay === day.day}
               onToggleExpand={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
             />
          );
        })}
      </div>
      
      {sortedDays.length === 0 && (
         <div className="p-12 text-center bg-muted/20 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No days added yet.</p>
         </div>
      )}
    </div>
  );
}

// --- Sub-components ---

interface DayEditorCardProps {
  day: DayContent;
  index: number;
  onUpdate: (updates: Partial<DayContent>) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function DayEditorCard({ day, index, onUpdate, onRemove, isExpanded, onToggleExpand }: DayEditorCardProps) {
  const preset = getPresetForDayType(day.dayType || 'learning');

  const handleAddBlock = (type: string, subtype?: string) => {
    const newBlock: Activity = {
      id: `act-${Date.now()}`,
      title: '',
      type: type as any,
      content: '',
      duration: 5,
      required: false,
      order: day.activities.length,
      autoAdvance: preset?.autoConfig.autoAdvance,
      exerciseConfig: subtype ? { subtype: subtype as any } : undefined
    };
    onUpdate({ activities: [...day.activities, newBlock] });
  };

  const handleUpdateBlock = (blockIndex: number, updates: Partial<Activity>) => {
    const newActivities = [...day.activities];
    newActivities[blockIndex] = { ...newActivities[blockIndex], ...updates };
    onUpdate({ activities: newActivities });
  };

  const handleRemoveBlock = (blockIndex: number) => {
    const newActivities = day.activities.filter((_, i) => i !== blockIndex);
    onUpdate({ activities: newActivities });
  };

  return (
    <Card className={cn("transition-all", isExpanded ? "ring-2 ring-primary/5" : "")}>
      <CardHeader className="p-4 pb-2">
         <div className="flex items-center gap-4">
            <div className="cursor-move text-muted-foreground">
               <GripVertical size={20} />
            </div>
            <div className="flex-1 grid grid-cols-[80px_1fr_1fr] gap-4 items-center">
               <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Day</Label>
                  <Input 
                    type="number" 
                    value={day.day} 
                    onChange={(e) => onUpdate({ day: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
               </div>
               <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select 
                    value={day.dayType || 'learning'} 
                    onValueChange={(val: any) => onUpdate({ dayType: val })}
                  >
                    <SelectTrigger className="h-8">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       {Object.entries(DAY_TYPE_PRESETS).map(([key, p]) => (
                          <SelectItem key={key} value={key}>
                             {p.label}
                          </SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <Input 
                    value={day.title} 
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    className="h-8"
                    placeholder="Day Title"
                  />
               </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onToggleExpand}>
               {isExpanded ? 'Collapse' : 'Edit'}
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={onRemove}>
               <Trash2 size={16} />
            </Button>
         </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4 pt-0 space-y-6">
           {/* Description */}
           <div className="space-y-1">
              <Label>Description</Label>
              <Textarea 
                value={day.description} 
                onChange={(e) => onUpdate({ description: e.target.value })} 
                className="h-20"
                placeholder="Internal or public description..."
              />
           </div>

           {/* Warnings/Info based on Preset */}
           {preset && (
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-2">
                 <div className="flex items-start gap-2">
                    <Info size={16} className="mt-0.5 text-blue-500" />
                    <div>
                       <span className="font-medium">{preset.label}: </span>
                       <span className="text-muted-foreground">{preset.description}</span>
                    </div>
                 </div>
                 {preset.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-amber-600">
                       <AlertTriangle size={16} className="mt-0.5" />
                       <span>{w}</span>
                    </div>
                 ))}
                 {preset.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-red-600">
                       <AlertCircle size={16} className="mt-0.5" />
                       <span>{e}</span>
                    </div>
                 ))}
              </div>
           )}

           {/* Blocks Editor */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <Label className="text-base font-medium">Blocks & Activities</Label>
                 <BlockPaletteMenu onSelect={handleAddBlock} allowedBlocks={preset?.allowedBlocks || []} />
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-border/50">
                 {day.activities.map((activity, idx) => (
                    <BlockEditor 
                      key={activity.id} 
                      activity={activity} 
                      index={idx}
                      onChange={(updates) => handleUpdateBlock(idx, updates)}
                      onRemove={() => handleRemoveBlock(idx)}
                      dayType={day.dayType || 'learning'}
                    />
                 ))}
                 {day.activities.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-lg">
                       No blocks yet. Add one from the palette.
                    </div>
                 )}
              </div>
           </div>
        </CardContent>
      )}
    </Card>
  );
}

function BlockPaletteMenu({ onSelect, allowedBlocks }: { onSelect: (type: string, subtype?: string) => void, allowedBlocks: string[] }) {
   // Helper to check if item is allowed. Simple includes check for now.
   const isAllowed = (key: string) => allowedBlocks.includes(key) || allowedBlocks.length === 0;

   return (
      <Select onValueChange={(val) => {
         const [type, subtype] = val.split(':');
         onSelect(type, subtype);
      }}>
         <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Add Block..." />
         </SelectTrigger>
         <SelectContent>
            {isAllowed('lesson') && <SelectItem value="lesson">Lesson</SelectItem>}
            {isAllowed('mcq_single') && <SelectItem value="exercise:mcq">MCQ (Single)</SelectItem>}
            {isAllowed('mcq_multi') && <SelectItem value="exercise:multi-select">MCQ (Multi)</SelectItem>}
            {isAllowed('rating_scale') && <SelectItem value="exercise:rating_scale">Rating Scale</SelectItem>}
            {isAllowed('journal') && <SelectItem value="journal">Journal</SelectItem>}
            {isAllowed('checklist') && <SelectItem value="checklist">Checklist</SelectItem>}
            {isAllowed('short_text') && <SelectItem value="exercise:text">Short Text</SelectItem>}
            {isAllowed('media') && <SelectItem value="media">Media/Image</SelectItem>}
            {isAllowed('summary') && <SelectItem value="reflection">Reflection/Summary</SelectItem>}
            {isAllowed('conclude') && <SelectItem value="conclude">Conclude/CTA</SelectItem>}
            {/* Add more as needed */}
         </SelectContent>
      </Select>
   )
}

function BlockEditor({ activity, index, onChange, onRemove, dayType }: { 
   activity: Activity, 
   index: number, 
   onChange: (u: Partial<Activity>) => void,
   onRemove: () => void,
   dayType: string
}) {
   const [expanded, setExpanded] = useState(false);
   const validation = validateBlockForDayType(activity.type, activity.exerciseConfig?.subtype, dayType);

   return (
      <div className={cn(
         "border rounded-lg bg-card transition-all",
         !validation.allowed ? "border-red-300 bg-red-50" : "border-border"
      )}>
         <div className="flex items-center p-3 gap-3">
            <div className="bg-muted px-2 py-1 rounded text-xs font-mono text-muted-foreground">
               {index + 1}
            </div>
            <div className="flex-1 font-medium text-sm truncate">
               {activity.title || activity.content || 'Untitled Block'}
               <span className="ml-2 text-xs text-muted-foreground font-normal">
                  ({activity.type} {activity.exerciseConfig?.subtype ? `- ${activity.exerciseConfig.subtype}` : ''})
               </span>
            </div>
            {!validation.allowed && (
               <div className="text-red-500 flex items-center gap-1 text-xs">
                  <AlertCircle size={14} />
                  <span>Invalid</span>
               </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
               {expanded ? 'Done' : 'Edit'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-muted-foreground hover:text-destructive">
               <X size={16} />
            </Button>
         </div>

         {expanded && (
            <div className="p-3 pt-0 space-y-3 border-t bg-muted/10">
               {!validation.allowed && (
                  <p className="text-xs text-red-600 p-2 bg-red-50 rounded">
                     {validation.reason}
                  </p>
               )}
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <Label className="text-xs">Title/Prompt</Label>
                     <Input 
                        value={activity.title || ''} 
                        onChange={(e) => onChange({ title: e.target.value })}
                        className="h-8"
                     />
                  </div>
                  <div className="space-y-1">
                     <Label className="text-xs">Content/Description</Label>
                     <Input 
                        value={activity.content} 
                        onChange={(e) => onChange({ content: e.target.value })}
                        className="h-8"
                     />
                  </div>
               </div>

               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <Switch 
                        checked={activity.required} 
                        onCheckedChange={(c) => onChange({ required: c })} 
                        id={`req-${activity.id}`}
                     />
                     <Label htmlFor={`req-${activity.id}`} className="text-xs">Required</Label>
                  </div>
                  <div className="flex items-center gap-2">
                     <Switch 
                        checked={activity.autoAdvance} 
                        onCheckedChange={(c) => onChange({ autoAdvance: c })} 
                        id={`auto-${activity.id}`}
                     />
                     <Label htmlFor={`auto-${activity.id}`} className="text-xs">Auto-advance</Label>
                  </div>
               </div>

               {/* Step Group ID */}
               <div className="space-y-1">
                   <Label className="text-xs">Step Group (Wizard)</Label>
                   <Input 
                      value={activity.stepGroup || ''}
                      onChange={(e) => onChange({ stepGroup: e.target.value })}
                      placeholder="e.g. step-1"
                      className="h-8"
                   />
               </div>
               
               {/* Exercise Config if applicable */}
               {activity.type === 'exercise' && activity.exerciseConfig?.subtype === 'mcq' && (
                  <div className="space-y-1">
                     <Label className="text-xs">Options (comma separated)</Label>
                     <Input 
                        value={activity.exerciseConfig.options?.join(',') || ''}
                        onChange={(e) => onChange({ 
                           exerciseConfig: { 
                              ...activity.exerciseConfig, 
                              options: e.target.value.split(',').map(s => s.trim()) 
                           } 
                        })}
                        className="h-8"
                     />
                  </div>
               )}
            </div>
         )}
      </div>
   );
}

// Simple X icon
function X({ size, className, onClick }: any) {
   return (
      <svg 
         onClick={onClick}
         width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
         <path d="M18 6L6 18M6 6l12 12" />
      </svg>
   )
}
