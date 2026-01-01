import React, { useState } from 'react';
import { GripVertical, ChevronDown, ChevronUp, X, Plus, Image, Clock, AlignLeft, CheckSquare } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { Button } from './button';
import { RichTextEditor } from './rich-text-editor';

interface Question {
  id: string;
  text: string;
  richText?: string;
  type: 'multiple-choice' | 'scale' | 'text' | 'true-false' | 'dropdown' | 'mcq-icons' | 'rich-text' | 'timed';
  options?: string[];
  optionIcons?: string[];
  optionImages?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min?: string; max?: string; mid?: string };
  required: boolean;
  icon?: string;
  placeholder?: string;
  maxLength?: number;
  timeLimit?: number;
  allowMultiple?: boolean;
  description?: string;
  stepGroup?: string;
  autoAdvance?: boolean;
  
  // STYLING PROPERTIES
  styling?: {
    textColor?: string;
    backgroundColor?: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl';
    fontWeight?: 'normal' | 'medium';
    backgroundImage?: string;
    iconColor?: string;
    borderColor?: string;
    borderRadius?: 'sm' | 'md' | 'lg';
  };
}

interface QuestionCardProps {
  question: Question;
  index: number;
  onUpdate: (id: string, updates: Partial<Question>) => void;
  onDelete: (id: string) => void;
}

// Popular icons for MCQ options
const popularIcons = [
  'Heart', 'Star', 'ThumbsUp', 'ThumbsDown', 'Smile', 'Frown', 'Meh',
  'CheckCircle', 'XCircle', 'AlertCircle', 'Info', 'Zap', 'Sun', 'Moon',
  'Cloud', 'CloudRain', 'User', 'Users', 'Home', 'Briefcase', 'Activity'
];

export function QuestionCard({ question, index, onUpdate, onDelete }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRichTextEditor, setShowRichTextEditor] = useState(false);

  // Check if question type needs expanded options
  const needsExpansion = ['multiple-choice', 'dropdown', 'mcq-icons', 'scale', 'timed', 'rich-text'].includes(question.type);

  return (
    <div
      className="group"
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1.5px solid #E5E7EB',
        padding: '16px',
        transition: 'all 0.2s'
      }}
    >
      {/* Compact Header - Always Visible */}
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing" style={{ color: '#9CA3AF' }}>
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Question Number */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#F3F4F6',
            fontSize: '14px',
            fontWeight: '500',
            color: '#6B7280'
          }}
        >
          {index + 1}
        </div>

        {/* Question Text Input */}
        <div className="flex-1">
          <Input
            value={question.text}
            onChange={(e) => onUpdate(question.id, { text: e.target.value })}
            placeholder="Enter your question here..."
            style={{
              height: '40px',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-regular)'
            }}
          />
        </div>

        {/* Type Dropdown */}
        <div style={{ width: '180px' }}>
          <Select
            value={question.type}
            onValueChange={(v: any) => {
              const updates: Partial<Question> = { type: v };
              // Set defaults for each type
              if (v === 'true-false') {
                updates.options = ['True', 'False'];
              } else if (v === 'multiple-choice' || v === 'dropdown') {
                updates.options = ['Option 1', 'Option 2', 'Option 3'];
              } else if (v === 'mcq-icons') {
                updates.options = ['Option 1', 'Option 2', 'Option 3'];
                updates.optionIcons = ['Heart', 'Star', 'ThumbsUp'];
              } else if (v === 'scale') {
                updates.scaleMin = 1;
                updates.scaleMax = 10;
              } else if (v === 'timed') {
                updates.timeLimit = 60;
              }
              onUpdate(question.id, updates);
            }}
          >
            <SelectTrigger
              style={{
                height: '40px',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              <SelectItem value="true-false">True/False</SelectItem>
              <SelectItem value="scale">Scale (1-10)</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
              <SelectItem value="mcq-icons">MCQ with Icons</SelectItem>
              <SelectItem value="text">Text Answer</SelectItem>
              <SelectItem value="rich-text">Rich Text</SelectItem>
              <SelectItem value="timed">Timed Question</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Required Checkbox */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onUpdate(question.id, { required: !question.required })}
          style={{ minWidth: '100px' }}
        >
          <Checkbox
            id={`required-${question.id}`}
            checked={question.required}
            onCheckedChange={(checked) => onUpdate(question.id, { required: checked as boolean })}
          />
          <Label
            htmlFor={`required-${question.id}`}
            className="cursor-pointer"
            style={{
              fontSize: '14px',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-regular)'
            }}
          >
            Required
          </Label>
        </div>

        {/* Expand/Collapse Button */}
        {needsExpansion && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              color: '#6B7280'
            }}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        )}

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(question.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            color: '#EF4444'
          }}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Expanded Options Section */}
      {isExpanded && (
        <div className="mt-4 pl-12 space-y-4">
          {/* Description/Help Text */}
          <div>
            <label
              style={{
                fontSize: '13px',
                fontFamily: 'var(--font-family-base)',
                fontWeight: '500',
                color: '#6B7280',
                display: 'block',
                marginBottom: '6px'
              }}
            >
              Help Text (Optional)
            </label>
            <Input
              value={question.description || ''}
              onChange={(e) => onUpdate(question.id, { description: e.target.value })}
              placeholder="Additional context or instructions..."
              style={{
                height: '36px',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Advanced Configuration Row */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 mt-2">
             <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Step Group ID (Optional)
                </label>
                <Input 
                   value={question.stepGroup || ''} 
                   onChange={e => onUpdate(question.id, { stepGroup: e.target.value })}
                   placeholder="e.g. step-1"
                   style={{ height: '36px', borderRadius: '8px', fontSize: '13px' }}
                />
                <p className="text-[10px] text-gray-500 mt-1">Questions with the same ID will appear on the same screen.</p>
             </div>
             
             <div className="flex items-center pt-6">
                {['multiple-choice', 'true-false', 'mcq-icons', 'scale', 'dropdown'].includes(question.type) && !question.allowMultiple && (
                   <div className="flex items-center gap-2 cursor-pointer" onClick={() => onUpdate(question.id, { autoAdvance: !question.autoAdvance })}>
                      <Checkbox 
                         id={`auto-advance-${question.id}`}
                         checked={question.autoAdvance}
                         onCheckedChange={(c) => onUpdate(question.id, { autoAdvance: c as boolean })}
                      />
                      <label 
                        htmlFor={`auto-advance-${question.id}`}
                        className="cursor-pointer"
                        style={{ fontSize: '13px', color: '#374151' }}
                      >
                        Auto-advance on selection
                      </label>
                   </div>
                )}
             </div>
          </div>

          {/* Rich Text Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={showRichTextEditor ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowRichTextEditor(!showRichTextEditor)}
              style={{
                height: '32px',
                fontSize: '12px',
                gap: '6px'
              }}
            >
              <AlignLeft className="w-3 h-3" />
              {showRichTextEditor ? 'Show Plain Text' : 'Use Rich Text'}
            </Button>
          </div>

          {/* Rich Text Editor for Question */}
          {showRichTextEditor && (
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: '500',
                  color: '#6B7280',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                Rich Text Question
              </label>
              <RichTextEditor
                value={question.richText || ''}
                onChange={(value) => onUpdate(question.id, { richText: value })}
                placeholder="Format your question with bold, italic, lists, etc..."
                minHeight="120px"
              />
            </div>
          )}

          {/* Multiple Choice Options */}
          {question.type === 'multiple-choice' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280'
                  }}
                >
                  Answer Options
                </label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`allow-multiple-${question.id}`}
                    checked={question.allowMultiple}
                    onCheckedChange={(checked) => onUpdate(question.id, { allowMultiple: checked as boolean })}
                  />
                  <Label
                    htmlFor={`allow-multiple-${question.id}`}
                    style={{ fontSize: '12px', cursor: 'pointer' }}
                  >
                    Allow multiple selections
                  </Label>
                </div>
              </div>
              <div className="space-y-2">
                {(question.options || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid #E5E7EB',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#9CA3AF'
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])];
                        newOptions[i] = e.target.value;
                        onUpdate(question.id, { options: newOptions });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      style={{
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}
                    />
                    {(question.options || []).length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newOptions = (question.options || []).filter((_, idx) => idx !== i);
                          onUpdate(question.id, { options: newOptions });
                        }}
                        style={{
                          width: '28px',
                          height: '28px',
                          padding: 0,
                          color: '#9CA3AF'
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(question.options || []), `Option ${(question.options || []).length + 1}`];
                    onUpdate(question.id, { options: newOptions });
                  }}
                  style={{
                    height: '32px',
                    fontSize: '12px',
                    marginTop: '8px'
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* True/False (non-editable) */}
          {question.type === 'true-false' && (
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: '500',
                  color: '#6B7280',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Answer Options
              </label>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB'
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" style={{ color: '#22C55E' }} />
                    <span style={{ fontSize: '14px' }}>True</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4" style={{ color: '#EF4444' }} />
                    <span style={{ fontSize: '14px' }}>False</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dropdown Options */}
          {question.type === 'dropdown' && (
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: '500',
                  color: '#6B7280',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Dropdown Options
              </label>
              <div className="space-y-2">
                {(question.options || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: '20px',
                        height: '20px',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#9CA3AF'
                      }}
                    >
                      {i + 1}.
                    </div>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])];
                        newOptions[i] = e.target.value;
                        onUpdate(question.id, { options: newOptions });
                      }}
                      placeholder={`Option ${i + 1}`}
                      style={{
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}
                    />
                    {(question.options || []).length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newOptions = (question.options || []).filter((_, idx) => idx !== i);
                          onUpdate(question.id, { options: newOptions });
                        }}
                        style={{
                          width: '28px',
                          height: '28px',
                          padding: 0,
                          color: '#9CA3AF'
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(question.options || []), `Option ${(question.options || []).length + 1}`];
                    onUpdate(question.id, { options: newOptions });
                  }}
                  style={{
                    height: '32px',
                    fontSize: '12px',
                    marginTop: '8px'
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* MCQ with Icons */}
          {question.type === 'mcq-icons' && (
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: '500',
                  color: '#6B7280',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Options with Icons
              </label>
              <div className="space-y-3">
                {(question.options || []).map((opt, i) => {
                  const IconComponent = question.optionIcons?.[i] ? (LucideIcons as any)[question.optionIcons[i]] : null;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      {/* Icon Selector */}
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#F3F4F6',
                          border: '1px solid #E5E7EB'
                        }}
                      >
                        {IconComponent ? <IconComponent className="w-5 h-5" style={{ color: '#6B7280' }} /> : <Image className="w-5 h-5" style={{ color: '#D1D5DB' }} />}
                      </div>
                      
                      {/* Icon Dropdown */}
                      <Select
                        value={question.optionIcons?.[i] || ''}
                        onValueChange={(v: string) => {
                          const newIcons = [...(question.optionIcons || [])];
                          newIcons[i] = v;
                          onUpdate(question.id, { optionIcons: newIcons });
                        }}
                      >
                        <SelectTrigger style={{ width: '140px', height: '36px', fontSize: '12px' }}>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {popularIcons.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              {icon}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[i] = e.target.value;
                          onUpdate(question.id, { options: newOptions });
                        }}
                        placeholder={`Option ${i + 1}`}
                        style={{
                          height: '36px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          flex: 1
                        }}
                      />
                      {(question.options || []).length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newOptions = (question.options || []).filter((_, idx) => idx !== i);
                            const newIcons = (question.optionIcons || []).filter((_, idx) => idx !== i);
                            onUpdate(question.id, { options: newOptions, optionIcons: newIcons });
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            padding: 0,
                            color: '#9CA3AF'
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(question.options || []), `Option ${(question.options || []).length + 1}`];
                    const newIcons = [...(question.optionIcons || []), 'Star'];
                    onUpdate(question.id, { options: newOptions, optionIcons: newIcons });
                  }}
                  style={{
                    height: '32px',
                    fontSize: '12px',
                    marginTop: '8px'
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Scale Configuration */}
          {question.type === 'scale' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    style={{
                      fontSize: '13px',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: '500',
                      color: '#6B7280',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    Minimum Value
                  </label>
                  <Input
                    type="number"
                    value={question.scaleMin || 1}
                    onChange={(e) => onUpdate(question.id, { scaleMin: parseInt(e.target.value) })}
                    style={{ height: '36px', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: '13px',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: '500',
                      color: '#6B7280',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    Maximum Value
                  </label>
                  <Input
                    type="number"
                    value={question.scaleMax || 10}
                    onChange={(e) => onUpdate(question.id, { scaleMax: parseInt(e.target.value) })}
                    style={{ height: '36px', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Scale Labels (Optional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={question.scaleLabels?.min || ''}
                    onChange={(e) => onUpdate(question.id, { scaleLabels: { ...question.scaleLabels, min: e.target.value } })}
                    placeholder="Min label"
                    style={{ height: '36px', fontSize: '12px' }}
                  />
                  <Input
                    value={question.scaleLabels?.mid || ''}
                    onChange={(e) => onUpdate(question.id, { scaleLabels: { ...question.scaleLabels, mid: e.target.value } })}
                    placeholder="Mid label"
                    style={{ height: '36px', fontSize: '12px' }}
                  />
                  <Input
                    value={question.scaleLabels?.max || ''}
                    onChange={(e) => onUpdate(question.id, { scaleLabels: { ...question.scaleLabels, max: e.target.value } })}
                    placeholder="Max label"
                    style={{ height: '36px', fontSize: '12px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text Answer Configuration */}
          {question.type === 'text' && (
            <div className="space-y-3">
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Placeholder Text
                </label>
                <Input
                  value={question.placeholder || ''}
                  onChange={(e) => onUpdate(question.id, { placeholder: e.target.value })}
                  placeholder="Enter placeholder text..."
                  style={{ height: '36px', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Max Length (characters)
                </label>
                <Input
                  type="number"
                  value={question.maxLength || ''}
                  onChange={(e) => onUpdate(question.id, { maxLength: parseInt(e.target.value) || undefined })}
                  placeholder="No limit"
                  style={{ height: '36px', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>
            </div>
          )}

          {/* Rich Text Answer Configuration */}
          {question.type === 'rich-text' && (
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB'
              }}
            >
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Users will be able to format their answers with bold, italic, lists, and other rich text features.
              </p>
            </div>
          )}

          {/* Timed Question Configuration */}
          {question.type === 'timed' && (
            <div className="space-y-3">
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Time Limit (seconds)
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <Input
                    type="number"
                    value={question.timeLimit || 60}
                    onChange={(e) => onUpdate(question.id, { timeLimit: parseInt(e.target.value) })}
                    min="5"
                    max="600"
                    style={{ height: '36px', borderRadius: '8px', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>seconds</span>
                </div>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FED7AA'
                }}
              >
                <p style={{ fontSize: '12px', color: '#9A3412' }}>
                  ⏱️ A countdown timer will be shown to the user. The question will auto-submit when time runs out.
                </p>
              </div>
            </div>
          )}

          {/* STYLING CONTROLS */}
          <div
            className="mt-6 pt-6 space-y-4"
            style={{
              borderTop: '2px solid #E5E7EB'
            }}
          >
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '18px' }}>🎨</span>
              </div>
              <div>
                <h4
                  style={{
                    fontSize: '15px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#374151'
                  }}
                >
                  Question Styling
                </h4>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Customize the appearance of this question
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Text Color */}
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Text Color
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={question.styling?.textColor || '#151515'}
                    onChange={(e) => onUpdate(question.id, { 
                      styling: { ...question.styling, textColor: e.target.value }
                    })}
                    style={{
                      width: '48px',
                      height: '36px',
                      padding: '4px',
                      cursor: 'pointer',
                      borderRadius: '8px'
                    }}
                  />
                  <Input
                    value={question.styling?.textColor || '#151515'}
                    onChange={(e) => onUpdate(question.id, { 
                      styling: { ...question.styling, textColor: e.target.value }
                    })}
                    placeholder="#151515"
                    style={{ flex: 1, height: '36px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Background Color
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={question.styling?.backgroundColor || '#FFFFFF'}
                    onChange={(e) => onUpdate(question.id, { 
                      styling: { ...question.styling, backgroundColor: e.target.value }
                    })}
                    style={{
                      width: '48px',
                      height: '36px',
                      padding: '4px',
                      cursor: 'pointer',
                      borderRadius: '8px'
                    }}
                  />
                  <Input
                    value={question.styling?.backgroundColor || '#FFFFFF'}
                    onChange={(e) => onUpdate(question.id, { 
                      styling: { ...question.styling, backgroundColor: e.target.value }
                    })}
                    placeholder="#FFFFFF"
                    style={{ flex: 1, height: '36px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Border Color */}
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Border Color
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={question.styling?.borderColor || '#E5E7EB'}
                    onChange={(e) => onUpdate(question.id, { 
                      styling: { ...question.styling, borderColor: e.target.value }
                    })}
                    style={{
                      width: '48px',
                      height: '36px',
                      padding: '4px',
                      cursor: 'pointer',
                      borderRadius: '8px'
                    }}
                  />
                  <Input
                    value={question.styling?.borderColor || '#E5E7EB'}
                    onChange={(e) => onUpdate(question.id, { 
                      styling: { ...question.styling, borderColor: e.target.value }
                    })}
                    placeholder="#E5E7EB"
                    style={{ flex: 1, height: '36px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Icon Color */}
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Icon Color
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={question.styling?.iconColor || '#2A2A2A'}
                    onChange={(e) => onUpdate(question.id, { 
                      styling: { ...question.styling, iconColor: e.target.value }
                    })}
                    style={{
                      width: '48px',
                      height: '36px',
                      padding: '4px',
                      cursor: 'pointer',
                      borderRadius: '8px'
                    }}
                  />
                  <Input
                    value={question.styling?.iconColor || '#2A2A2A'}
                    onChange={(e) => onUpdate(question.id, { 
                      styling: { ...question.styling, iconColor: e.target.value }
                    })}
                    placeholder="#2A2A2A"
                    style={{ flex: 1, height: '36px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Font Size
                </label>
                <Select
                  value={question.styling?.fontSize || 'base'}
                  onValueChange={(v: any) => onUpdate(question.id, { 
                    styling: { ...question.styling, fontSize: v }
                  })}
                >
                  <SelectTrigger style={{ height: '36px', fontSize: '13px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Weight */}
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Font Weight
                </label>
                <Select
                  value={question.styling?.fontWeight || 'normal'}
                  onValueChange={(v: any) => onUpdate(question.id, { 
                    styling: { ...question.styling, fontWeight: v }
                  })}
                >
                  <SelectTrigger style={{ height: '36px', fontSize: '13px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal (400)</SelectItem>
                    <SelectItem value="medium">Medium (500)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Border Radius */}
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Border Radius
                </label>
                <Select
                  value={question.styling?.borderRadius || 'md'}
                  onValueChange={(v: any) => onUpdate(question.id, { 
                    styling: { ...question.styling, borderRadius: v }
                  })}
                >
                  <SelectTrigger style={{ height: '36px', fontSize: '13px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Background Image */}
              <div className="col-span-2">
                <label
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: '500',
                    color: '#6B7280',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Background Image URL (Optional)
                </label>
                <Input
                  value={question.styling?.backgroundImage || ''}
                  onChange={(e) => onUpdate(question.id, { 
                    styling: { ...question.styling, backgroundImage: e.target.value }
                  })}
                  placeholder="https://example.com/image.jpg"
                  style={{ height: '36px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Styling Preview */}
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: '500',
                  color: '#6B7280',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Preview
              </label>
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: question.styling?.backgroundColor || '#FFFFFF',
                  border: `2px solid ${question.styling?.borderColor || '#E5E7EB'}`,
                  borderRadius: question.styling?.borderRadius === 'sm' ? '8px' : question.styling?.borderRadius === 'lg' ? '16px' : '12px',
                  backgroundImage: question.styling?.backgroundImage ? `url(${question.styling.backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <p
                  style={{
                    fontSize: question.styling?.fontSize === 'sm' ? '14px' : question.styling?.fontSize === 'lg' ? '18px' : question.styling?.fontSize === 'xl' ? '20px' : '16px',
                    fontWeight: question.styling?.fontWeight === 'medium' ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                    color: question.styling?.textColor || '#151515',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {question.text || 'Your question text will appear here'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}