import React, { useState } from 'react';
import { 
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp, 
  HelpCircle, Shield, Clock, FileText, List, Type, Calendar, CheckSquare, Search
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { AdminFormField } from '../admin/AdminFormField';
import { OnboardingQuestion } from '../../lib/equip-admin-types';

interface EquipOnboardingEditorProps {
  questions: OnboardingQuestion[];
  onChange: (questions: OnboardingQuestion[]) => void;
  onSelectQuestion: (question: OnboardingQuestion | null) => void;
}

export function EquipOnboardingEditor({ questions, onChange, onSelectQuestion }: EquipOnboardingEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const question = questions.find(q => q.id === id);
    onSelectQuestion(question || null);
  };

  const addQuestion = () => {
    const newQuestion: OnboardingQuestion = {
      id: `q_${Date.now()}`,
      order: questions.length,
      question: '',
      type: 'single_select',
      options: [],
      allow_skip: true,
      allow_prefer_not_to_answer: true,
      required: false,
      privacy_level: 'general',
      storage_scope: 'equip-only',
      editable_later: true
    };
    const newQuestions = [...questions, newQuestion];
    onChange(newQuestions);
    handleSelect(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<OnboardingQuestion>) => {
    const updated = questions.map(q => q.id === id ? { ...q, ...updates } : q);
    onChange(updated);
    if (selectedId === id) {
       onSelectQuestion(updated.find(q => q.id === id) || null);
    }
  };

  const deleteQuestion = (id: string) => {
    const newQuestions = questions.filter(q => q.id !== id);
    onChange(newQuestions);
    if (selectedId === id) {
      if (newQuestions.length > 0) {
        handleSelect(newQuestions[0].id);
      } else {
        setSelectedId(null);
        onSelectQuestion(null);
      }
    }
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    
    // Update order properties
    newQuestions.forEach((q, i) => q.order = i);
    onChange(newQuestions);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'single_select': return <List className="w-4 h-4" />;
      case 'multi_select': return <CheckSquare className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'textarea': return <FileText className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  // Selected question object
  const activeQuestion = questions.find(q => q.id === selectedId);

  return (
    <div className="h-[calc(100vh-220px)] flex border rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-gray-200">
      {/* LEFT SIDEBAR: QUESTION LIST */}
      <div className="w-[35%] min-w-[300px] flex flex-col border-r bg-gray-50/50">
        <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-10">
           <span className="text-sm font-semibold text-gray-700">Questions ({questions.length})</span>
           <Button onClick={addQuestion} size="icon" variant="outline" className="h-8 w-8">
            <Plus size={16} />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {questions.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-400 text-sm">
              No questions yet. Click "Add Question" to start.
            </div>
          ) : (
            questions.map((q, index) => (
              <div 
                key={q.id}
                onClick={() => handleSelect(q.id)}
                className={`
                  group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border
                  ${selectedId === q.id 
                    ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/10' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }
                `}
              >
                <div className="mt-1 text-gray-400">
                  {getIconForType(q.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${selectedId === q.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {q.question || `Question ${index + 1}`}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 capitalize">
                    {q.type.replace('_', ' ')}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1">
                   <Button 
                      variant="ghost" size="icon" 
                      className="h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                   >
                     <Trash2 size={12} className="text-red-400" />
                   </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 bg-gray-100 border-t text-xs text-gray-500 text-center">
          {questions.length} questions • ~{Math.ceil(questions.length * 0.5)} min
        </div>
      </div>

      {/* RIGHT PANEL: EDITOR */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30 p-8">
        {activeQuestion ? (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            
            {/* Header / Type Selector */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Question Configuration</h3>
                <p className="text-sm text-gray-500">Configure how this question appears to users</p>
              </div>
              <Select 
                value={activeQuestion.type} 
                onValueChange={(val: any) => updateQuestion(activeQuestion.id, { type: val })}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_select">Single Select</SelectItem>
                  <SelectItem value="multi_select">Multi Select</SelectItem>
                  <SelectItem value="text">Short Text</SelectItem>
                  <SelectItem value="textarea">Long Text</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6 space-y-4">
                  <AdminFormField label="Question Text" required>
                    <Input 
                      value={activeQuestion.question}
                      onChange={(e) => updateQuestion(activeQuestion.id, { question: e.target.value })}
                      placeholder="e.g. What is your primary sleep goal?"
                      className="text-lg font-medium"
                      autoFocus
                    />
                  </AdminFormField>

                  <AdminFormField label="Helper Text" description="Provide context or instructions">
                    <Textarea 
                      value={activeQuestion.helper_text || ''}
                      onChange={(e) => updateQuestion(activeQuestion.id, { helper_text: e.target.value })}
                      placeholder="Optional description..."
                      rows={2}
                      className="resize-none"
                    />
                  </AdminFormField>
                </CardContent>
              </Card>

              {/* DYNAMIC SETTINGS BASED ON TYPE */}
              {(activeQuestion.type === 'single_select' || activeQuestion.type === 'multi_select') && (
                <Card className="shadow-sm border-gray-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Answer Options</Label>
                      <span className="text-xs text-gray-500">One option per line</span>
                    </div>
                    <Textarea 
                      value={activeQuestion.options?.join('\n') || ''}
                      onChange={(e) => updateQuestion(activeQuestion.id, { options: e.target.value.split('\n') })}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <div className="flex items-center gap-2 pt-2">
                       <Checkbox 
                        id="pnta" 
                        checked={activeQuestion.allow_prefer_not_to_answer}
                        onCheckedChange={(c) => updateQuestion(activeQuestion.id, { allow_prefer_not_to_answer: !!c })}
                       />
                       <Label htmlFor="pnta" className="text-sm font-normal text-gray-600">Include "Prefer not to answer"</Label>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SETTINGS CARD */}
              <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-3">
                      <Label>Validation</Label>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="req" 
                          checked={activeQuestion.required}
                          onCheckedChange={(c) => updateQuestion(activeQuestion.id, { required: !!c })}
                        />
                        <Label htmlFor="req" className="text-sm font-normal">Required field</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="skip" 
                          checked={activeQuestion.allow_skip}
                          onCheckedChange={(c) => updateQuestion(activeQuestion.id, { allow_skip: !!c })}
                        />
                        <Label htmlFor="skip" className="text-sm font-normal">Allow skipping</Label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Data Privacy</Label>
                      <Select 
                        value={activeQuestion.privacy_level} 
                        onValueChange={(val: any) => updateQuestion(activeQuestion.id, { privacy_level: val })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="sensitive">Sensitive</SelectItem>
                          <SelectItem value="health">Health Data (HIPAA)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-gray-500 leading-tight">
                        Select "Health Data" for medical information to apply strict encryption.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a question to edit</p>
            <p className="text-sm">Or click "Add Question" to create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}