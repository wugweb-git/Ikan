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
  List
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
  isLast
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

  return (
    <Card className="border border-gray-200 shadow-sm mb-3">
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

      {isExpanded && (
        <CardContent className="p-4 space-y-4">
          
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
          
          {/* 1. LESSON BLOCK */}
          {block.type === 'lesson' && (
            <div className="space-y-2">
              <Label className="text-xs">Content (Markdown / Rich Text)</Label>
              <RichTextEditor
                value={block.content}
                onChange={(val) => onChange({ content: val })}
                placeholder="Write your educational content here..."
                minHeight="200px"
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
                    <SelectItem value="table">Data Table</SelectItem>
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

              {/* Options Editor for MCQ/Select */}
              {['mcq', 'single-select', 'multi-select'].includes(block.exerciseConfig?.subtype || '') && (
                <div className="space-y-1">
                  <Label className="text-xs">Options (One per line)</Label>
                  <Textarea 
                    value={(block.exerciseConfig?.options || []).join('\n')}
                    onChange={(e) => onChange({ 
                      exerciseConfig: { 
                        ...block.exerciseConfig, 
                        options: e.target.value.split('\n').filter(l => l) 
                      } 
                    })}
                    placeholder="Option A&#10;Option B&#10;Option C"
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
              {block.exerciseConfig?.subtype === 'table' && (
                <div className="p-3 bg-gray-50 rounded text-sm text-gray-500">
                  <TableIcon className="w-4 h-4 inline mr-2" />
                  Table configuration is advanced. Define columns in JSON format.
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

          {/* SHARED SETTINGS */}
          <div className="flex items-center gap-4 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={block.required}
                onCheckedChange={(c) => onChange({ required: c as boolean })}
              />
              <Label className="text-xs">Required to proceed</Label>
            </div>
            
            <div className="flex-1">
               <div className="flex items-center gap-2">
                  <Label className="text-xs w-20">Duration (m)</Label>
                  <Input 
                    type="number" 
                    className="w-20 h-8"
                    value={block.duration}
                    onChange={(e) => onChange({ duration: parseInt(e.target.value) || 0 })}
                  />
               </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <Label className="text-xs mb-1 block">Block Image (Optional)</Label>
            <ImageUpload
               value={block.image_url || ''}
               onChange={(url) => onChange({ image_url: url })}
               bucket="equip-program-images"
               placeholder="Add image"
               className="h-32"
            />
          </div>

        </CardContent>
      )}
    </Card>
  );
}
