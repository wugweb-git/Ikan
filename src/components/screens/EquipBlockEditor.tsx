import React from 'react';
import { 
  BookOpen, 
  PenTool, 
  MessageCircle, 
  CheckSquare, 
  Target, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon,
  Table as TableIcon,
  Video,
  Layers,
  FastForward,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { ImageUpload } from '../ui/image-upload';
import { RichTextEditor } from '../ui/rich-text-editor';
import { Activity } from '../../lib/equip-admin-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface EquipBlockEditorProps {
  block: Activity;
  onChange: (updates: Partial<Activity>) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  hideHeader?: boolean;
  isAssessment?: boolean;
}

export function EquipBlockEditor({ 
  block, 
  onChange, 
  onDelete, 
  isExpanded, 
  onToggleExpand,
  moveUp,
  moveDown,
  isFirst,
  isLast,
  hideHeader,
  isAssessment
}: EquipBlockEditorProps) {
  
  const getIcon = () => {
    switch (block.type) {
      case 'lesson': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'exercise': return <PenTool className="w-4 h-4 text-purple-500" />;
      case 'journal': return <MessageCircle className="w-4 h-4 text-orange-500" />;
      case 'checklist': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'reflection': return <Target className="w-4 h-4 text-indigo-500" />;
      case 'conclude': return <Target className="w-4 h-4 text-red-500" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  // Determine active media tab based on current data
  const isVideo = block.image_url && (block.image_url.includes('youtube') || block.image_url.includes('vimeo') || block.image_url.endsWith('.mp4'));
  const mediaType = isVideo ? 'video' : 'image';

  return (
    <Card className={hideHeader ? "border-none shadow-none" : "border border-gray-200 shadow-sm mb-3"}>
      {!hideHeader && (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-t-lg border-b">
        <div className="cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="flex items-center gap-2 flex-1">
          {getIcon()}
          <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
            {block.type}
          </span>
          <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
            {block.title || '(Untitled Block)'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {moveUp && (
            <Button variant="ghost" size="sm" onClick={moveUp} disabled={isFirst} className="h-6 w-6 p-0">
              <ChevronUp className="w-3 h-3" />
            </Button>
          )}
          {moveDown && (
            <Button variant="ghost" size="sm" onClick={moveDown} disabled={isLast} className="h-6 w-6 p-0">
              <ChevronDown className="w-3 h-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete} className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleExpand} className="h-6 w-6 p-0">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      )}

      {(isExpanded || hideHeader) && (
        <CardContent className={hideHeader ? "p-0 space-y-4" : "p-4 space-y-4"}>
          
          {/* COMMON FIELDS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Block Title</Label>
              <Input 
                value={block.title} 
                onChange={(e) => onChange({ title: e.target.value })} 
                placeholder="e.g. Introduction to Sleep"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select 
                value={block.type} 
                onValueChange={(val: any) => onChange({ type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">📚 Lesson (Read)</SelectItem>
                  <SelectItem value="exercise">✏️ Exercise (Interact)</SelectItem>
                  <SelectItem value="journal">📝 Journal (Write)</SelectItem>
                  <SelectItem value="checklist">☑️ Checklist (Track)</SelectItem>
                  <SelectItem value="reflection">💭 Reflection (Think)</SelectItem>
                  <SelectItem value="conclude">🎯 Conclude (Finish)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DYNAMIC FIELDS BASED ON TYPE */}
          
          {/* 1. CONTENT / PROMPT SECTION (Lesson, Journal, Reflection, Conclude) */}
          {['lesson', 'journal', 'reflection', 'conclude'].includes(block.type) && (
            <div className="space-y-2">
              <Label className="text-xs">
                {block.type === 'lesson' || block.type === 'conclude' ? 'Content' : 'Prompt / Instructions'}
              </Label>
              <RichTextEditor
                value={block.content}
                onChange={(val) => onChange({ content: val })}
                placeholder={block.type === 'lesson' ? "Write educational content..." : "Write the prompt for the user..."}
                minHeight="150px"
              />
            </div>
          )}

          {/* 2. EXERCISE BLOCK */}
          {block.type === 'exercise' && (
            <div className="space-y-4 border-l-2 border-purple-100 pl-4">
              <div className="space-y-1">
                <Label className="text-xs">Interaction Type</Label>
                <Select 
                  value={block.exerciseConfig?.subtype || 'mcq'} 
                  onValueChange={(val: any) => onChange({ 
                    exerciseConfig: { ...block.exerciseConfig, subtype: val } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice Question</SelectItem>
                    <SelectItem value="single-select">Single Select List</SelectItem>
                    <SelectItem value="multi-select">Multi Select List</SelectItem>
                    <SelectItem value="table">Checklist Table (Yes/No)</SelectItem>
                    <SelectItem value="input-table">Input Table (Data Entry)</SelectItem>
                    <SelectItem value="structured-list">Structured List</SelectItem>
                    <SelectItem value="clinical_instrument">Clinical Instrument (GAD-7, PHQ-9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Prompt / Question</Label>
                <Input 
                  value={block.exerciseConfig?.prompt || ''} 
                  onChange={(e) => onChange({ 
                    exerciseConfig: { ...block.exerciseConfig, prompt: e.target.value } 
                  })}
                  placeholder="e.g. Which of these habits do you do?"
                />
              </div>

              {/* Options Editor for MCQ/Select/Structured List */}
              {['mcq', 'single-select', 'multi-select', 'structured-list'].includes(block.exerciseConfig?.subtype || '') && (
                <div className="space-y-1">
                  <Label className="text-xs">
                    {block.exerciseConfig?.subtype === 'structured-list' ? 'List Items' : 'Options'} (One per line)
                  </Label>
                  <Textarea 
                    value={(
                      block.exerciseConfig?.subtype === 'structured-list' 
                        ? (block.exerciseConfig?.listItems || []) 
                        : (block.exerciseConfig?.options || [])
                    ).join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').filter(l => l);
                      const isList = block.exerciseConfig?.subtype === 'structured-list';
                      onChange({ 
                        exerciseConfig: { 
                          ...block.exerciseConfig, 
                          options: isList ? undefined : lines,
                          listItems: isList ? lines : undefined
                        } 
                      });
                    }}
                    placeholder="Item 1&#10;Item 2&#10;Item 3"
                    rows={4}
                  />
                </div>
              )}

              {/* Clinical Instrument Config */}
              {block.exerciseConfig?.subtype === 'clinical_instrument' && (
                <div className="space-y-4 pt-2 border-t border-dashed">
                  <div className="space-y-1">
                    <Label className="text-xs">Questions (One per line)</Label>
                    <Textarea 
                      value={(block.exerciseConfig?.questions || []).join('\n')}
                      onChange={(e) => onChange({ 
                        exerciseConfig: { 
                          ...block.exerciseConfig, 
                          questions: e.target.value.split('\n').filter(l => l) 
                        } 
                      })}
                      placeholder="Feeling nervous?&#10;Not being able to stop worrying?"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-1">
                     <Label className="text-xs">Scale (Label : Value per line)</Label>
                     <Textarea
                       value={(block.exerciseConfig?.scale || []).map(s => `${s.label}:${s.value}`).join('\n')}
                       onChange={(e) => {
                         const scale = e.target.value.split('\n').map(line => {
                           const [label, val] = line.split(':');
                           return { label: label?.trim() || '', value: parseInt(val?.trim() || '0') };
                         }).filter(s => s.label);
                         onChange({ 
                           exerciseConfig: { ...block.exerciseConfig, scale } 
                         });
                       }}
                       placeholder="Not at all : 0&#10;Several days : 1&#10;More than half the days : 2&#10;Nearly every day : 3"
                       rows={4}
                     />
                  </div>
                </div>
              )}

              {/* Table Config */}
              {(block.exerciseConfig?.subtype === 'table' || block.exerciseConfig?.subtype === 'input-table') && (
                <div className="space-y-4 pt-2 border-t border-dashed">
                  <div className="space-y-1">
                    <Label className="text-xs">Column Headers (One per line)</Label>
                    <Textarea 
                      value={(block.exerciseConfig?.columns || []).join('\n')}
                      onChange={(e) => onChange({ 
                        exerciseConfig: { 
                          ...block.exerciseConfig, 
                          columns: e.target.value.split('\n').filter(l => l) 
                        } 
                      })}
                      placeholder="Situation&#10;Emotion&#10;Intensity (1-10)"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Row Headers (Optional - for Fixed Grid)</Label>
                    <Textarea 
                      value={(block.exerciseConfig?.rows || []).join('\n')}
                      onChange={(e) => onChange({ 
                        exerciseConfig: { 
                          ...block.exerciseConfig, 
                          rows: e.target.value.split('\n').filter(l => l) 
                        } 
                      })}
                      placeholder="Row 1&#10;Row 2&#10;Row 3"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                     <Checkbox 
                       id="allow_add_rows"
                       checked={block.exerciseConfig?.allow_add_rows}
                       onCheckedChange={(c) => onChange({
                          exerciseConfig: { ...block.exerciseConfig, allow_add_rows: !!c }
                       })}
                     />
                     <Label htmlFor="allow_add_rows" className="text-xs font-normal">Allow user to add rows</Label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. CHECKLIST BLOCK */}
          {block.type === 'checklist' && (
            <div className="space-y-2">
               <Label className="text-xs">Checklist Items (One per line)</Label>
               <Textarea
                 value={(block.exerciseConfig?.options || []).join('\n')}
                 onChange={(e) => onChange({ 
                    exerciseConfig: { 
                      ...block.exerciseConfig, 
                      subtype: 'multi-select', // Checklist is effectively multi-select
                      options: e.target.value.split('\n').filter(l => l) 
                    } 
                  })}
                 placeholder="Brush teeth&#10;Read book&#10;Turn off phone"
                 rows={4}
               />
            </div>
          )}

          {/* SCORING SECTION (Assessment Only) */}
          {(isAssessment || block.exerciseConfig?.scoring?.enabled) && block.type === 'exercise' && (
             <div className="pt-2 border-t border-amber-100 bg-amber-50/50 p-3 rounded-md">
               <div className="flex items-center justify-between mb-2">
                 <Label className="text-xs font-bold text-amber-800 flex items-center gap-1">
                   <Target size={12} /> Scoring Configuration
                 </Label>
                 <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={block.exerciseConfig?.scoring?.enabled}
                      onCheckedChange={(c) => onChange({
                        exerciseConfig: {
                          ...block.exerciseConfig,
                          scoring: { ...block.exerciseConfig?.scoring, enabled: !!c }
                        }
                      })}
                    />
                    <Label className="text-xs text-amber-800">Enable Scoring</Label>
                 </div>
               </div>

               {block.exerciseConfig?.scoring?.enabled && (
                 <div className="space-y-3">
                    {/* For MCQs: Weights per option */}
                    {['mcq', 'single-select', 'multi-select'].includes(block.exerciseConfig?.subtype || '') && (
                      <div className="space-y-1">
                        <Label className="text-xs text-amber-700">
                          Option Weights (Comma separated, order matches options)
                        </Label>
                        <Input 
                          value={(block.exerciseConfig?.scoring?.weights || []).join(', ')}
                          onChange={(e) => {
                            const weights = e.target.value.split(',').map(w => parseInt(w.trim()) || 0);
                            onChange({
                              exerciseConfig: {
                                ...block.exerciseConfig,
                                scoring: { ...block.exerciseConfig?.scoring, weights }
                              }
                            });
                          }}
                          placeholder="e.g. 0, 1, 0, 0 (Correct answer is 2nd option)"
                          className="h-8 text-xs border-amber-200"
                        />
                      </div>
                    )}
                    
                    {/* Default Weight */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-amber-700">Max Score</Label>
                      <Input 
                        type="number"
                        value={block.exerciseConfig?.scoring?.maxScore || 1}
                        onChange={(e) => onChange({
                          exerciseConfig: {
                            ...block.exerciseConfig,
                            scoring: { ...block.exerciseConfig?.scoring, maxScore: parseInt(e.target.value) }
                          }
                        })}
                        className="w-16 h-7 text-xs border-amber-200"
                      />
                    </div>
                 </div>
               )}
             </div>
          )}

          {/* WIZARD FLOW & INTERACTION SECTION (PROMOTED) */}
          <div className="pt-2 border-t mt-4">
             <div className="flex items-center gap-2 mb-2">
                <Layers size={14} className="text-indigo-600" />
                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Wizard Flow</Label>
             </div>
             
             <div className="bg-indigo-50/50 p-3 rounded-md border border-indigo-100 space-y-4">
               {/* Step Grouping */}
               <div className="space-y-1">
                  <div className="flex items-center justify-between">
                     <Label className="text-xs font-medium text-indigo-900">Step Group ID</Label>
                     <span className="text-[10px] text-indigo-400">Optional</span>
                  </div>
                  <div className="flex gap-2">
                     <div className="relative flex-1">
                        <Input 
                           value={block.stepGroup || ''}
                           onChange={(e) => onChange({ stepGroup: e.target.value })}
                           placeholder="e.g. step-1"
                           className="h-8 text-xs font-mono bg-white"
                        />
                     </div>
                  </div>
                  <p className="text-[10px] text-indigo-600/70">
                     Blocks with the same Step ID appear together on one screen.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  {/* Auto Advance */}
                  <div className="flex items-start gap-2 p-2 bg-white rounded border border-indigo-100">
                     <Checkbox 
                        id="auto-advance"
                        checked={block.autoAdvance}
                        onCheckedChange={(c) => onChange({ autoAdvance: c as boolean })}
                        className="mt-0.5"
                     />
                     <div>
                        <Label htmlFor="auto-advance" className="text-xs font-medium cursor-pointer block">Auto-Advance</Label>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                           Automatically move to next step when completed.
                        </p>
                     </div>
                  </div>
                  
                  {/* Required */}
                  <div className="flex items-start gap-2 p-2 bg-white rounded border border-indigo-100">
                     <Checkbox 
                        id="required"
                        checked={block.required}
                        onCheckedChange={(c) => onChange({ required: c as boolean })}
                        className="mt-0.5"
                     />
                     <div>
                        <Label htmlFor="required" className="text-xs font-medium cursor-pointer block">Required</Label>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                           User must complete this block to proceed.
                        </p>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 justify-end pt-1">
                  <Clock size={12} className="text-indigo-400" />
                  <Label className="text-xs text-indigo-900">Est. Duration (m)</Label>
                  <Input 
                    type="number" 
                    className="w-16 h-7 text-xs bg-white"
                    value={block.duration}
                    onChange={(e) => onChange({ duration: parseInt(e.target.value) || 0 })}
                  />
               </div>
             </div>
          </div>

          {/* MEDIA SECTION */}
          <div className="pt-2 border-t mt-2">
            <Label className="text-xs mb-2 block font-medium text-gray-700">Block Media</Label>
            
            <Tabs defaultValue={mediaType} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8 mb-2">
                <TabsTrigger value="image" className="text-xs">
                  <ImageIcon size={12} className="mr-2" /> Image
                </TabsTrigger>
                <TabsTrigger value="video" className="text-xs">
                  <Video size={12} className="mr-2" /> Video URL
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="image">
                <ImageUpload
                   value={!isVideo ? (block.image_url || '') : ''}
                   onChange={(url) => onChange({ image_url: url })}
                   bucket="equip-program-images"
                   placeholder="Upload block image (max 100px width)"
                   className="w-[100px] h-auto" // Constraint: Max 100px width
                   aspectRatio="square"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Preview restricted to 100px width.
                </p>
              </TabsContent>
              
              <TabsContent value="video">
                <div className="space-y-2">
                  <Input 
                    value={isVideo ? (block.image_url || '') : ''}
                    onChange={(e) => onChange({ image_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="text-xs"
                  />
                  <p className="text-[10px] text-gray-400">
                    Paste a YouTube, Vimeo, or MP4 URL. This will replace any uploaded image.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </CardContent>
      )}
    </Card>
  );
}