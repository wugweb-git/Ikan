import React, { useState } from 'react';
import { 
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp, 
  HelpCircle, Shield, Clock, FileText, List, Type, Calendar, CheckSquare
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleExpand = (id: string) => {
    const isExpanded = expandedId === id;
    setExpandedId(isExpanded ? null : id);
    const question = questions.find(q => q.id === id);
    onSelectQuestion(isExpanded ? null : (question || null));
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
    onChange([...questions, newQuestion]);
    setExpandedId(newQuestion.id);
    onSelectQuestion(newQuestion);
  };

  const updateQuestion = (id: string, updates: Partial<OnboardingQuestion>) => {
    const updated = questions.map(q => q.id === id ? { ...q, ...updates } : q);
    onChange(updated);
    // Also update selection if currently selected
    if (expandedId === id) {
      const q = updated.find(q => q.id === id);
      if (q) onSelectQuestion(q);
    }
  };

  const deleteQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
    if (expandedId === id) {
      setExpandedId(null);
      onSelectQuestion(null);
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

  // Calculate stats
  const totalTime = questions.length * 0.5; // Approx 30s per question
  const sensitivity = questions.some(q => q.privacy_level === 'health') ? 'High' : 
                      questions.some(q => q.privacy_level === 'sensitive') ? 'Medium' : 'Low';

  return (
    <div className="space-y-6">
      {/* SECTION 1: Intake Summary */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Questions</p>
              <p className="text-lg font-semibold text-slate-900">{questions.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Est. Time</p>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-lg font-semibold text-slate-900">{Math.ceil(totalTime)} min</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Privacy Level</p>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-slate-400" />
                <p className="text-lg font-semibold text-slate-900">{sensitivity}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Question List */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed rounded-lg bg-gray-50">
            <p className="text-gray-500 mb-2">No questions configured.</p>
            <Button variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-2" /> Add First Question
            </Button>
          </div>
        ) : (
          questions.map((q, index) => {
            const isExpanded = expandedId === q.id;
            
            return (
              <Card 
                key={q.id} 
                className={`transition-all duration-200 ${isExpanded ? 'ring-2 ring-primary/10 border-primary/20' : ''}`}
              >
                {/* Header / Summary */}
                <div 
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleExpand(q.id)}
                >
                  <div 
                    className="cursor-grab text-gray-400 hover:text-gray-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {q.question || '(New Question)'}
                      </span>
                      {q.required && <Badge variant="secondary" className="text-[10px] h-5">Required</Badge>}
                      {q.privacy_level !== 'general' && (
                        <Badge variant="outline" className="text-[10px] h-5 border-amber-200 bg-amber-50 text-amber-700">
                          {q.privacy_level}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        {getIconForType(q.type)}
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button 
                      variant="ghost" size="sm" 
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" size="sm" 
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" size="sm" 
                      onClick={() => deleteQuestion(q.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* SECTION 3: Question Editor */}
                {isExpanded && (
                  <CardContent className="p-6 border-t bg-white space-y-6">
                    {/* 1. Question Text */}
                    <AdminFormField label="Question Text" required>
                      <Input 
                        value={q.question}
                        onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                        placeholder="e.g. What is your primary goal?"
                        className="text-lg font-medium"
                      />
                    </AdminFormField>

                    {/* 2. Helper Text */}
                    <AdminFormField label="Helper Text (Optional)" description="Explain why we're asking this">
                      <Textarea 
                        value={q.helper_text || ''}
                        onChange={(e) => updateQuestion(q.id, { helper_text: e.target.value })}
                        placeholder="e.g. This helps us personalize your daily plan."
                        rows={2}
                      />
                    </AdminFormField>

                    {/* 3. Input Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <AdminFormField label="Input Type" required>
                        <Select 
                          value={q.type} 
                          onValueChange={(val: any) => updateQuestion(q.id, { type: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single_select">Single Select</SelectItem>
                            <SelectItem value="multi_select">Multi Select</SelectItem>
                            <SelectItem value="text">Free Text (Short)</SelectItem>
                            <SelectItem value="textarea">Free Text (Long)</SelectItem>
                            <SelectItem value="date">Date / Age</SelectItem>
                          </SelectContent>
                        </Select>
                      </AdminFormField>

                      {/* 5. User Options (Compact) */}
                      <div className="flex flex-col justify-end pb-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id={`req_${q.id}`} 
                              checked={q.required}
                              onCheckedChange={(c) => updateQuestion(q.id, { required: !!c })}
                            />
                            <Label htmlFor={`req_${q.id}`} className="text-sm">Required</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id={`skip_${q.id}`} 
                              checked={q.allow_skip}
                              onCheckedChange={(c) => updateQuestion(q.id, { allow_skip: !!c })}
                            />
                            <Label htmlFor={`skip_${q.id}`} className="text-sm">Allow Skip</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Answer Options */}
                    {(q.type === 'single_select' || q.type === 'multi_select') && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                        <AdminFormField label="Answer Options" description="One option per line">
                          <Textarea 
                            value={q.options?.join('\n') || ''}
                            onChange={(e) => updateQuestion(q.id, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                            rows={4}
                          />
                        </AdminFormField>
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                          <Checkbox 
                            id={`pnta_${q.id}`} 
                            checked={q.allow_prefer_not_to_answer}
                            onCheckedChange={(c) => updateQuestion(q.id, { allow_prefer_not_to_answer: !!c })}
                          />
                          <Label htmlFor={`pnta_${q.id}`} className="text-sm text-gray-600">
                            Include "Prefer not to answer" option
                          </Label>
                        </div>
                      </div>
                    )}

                    {/* 7. Privacy & Data Handling */}
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-900 mb-2">
                        <Shield className="w-4 h-4" />
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Privacy & Data Handling</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <AdminFormField label="Privacy Level">
                          <Select 
                            value={q.privacy_level} 
                            onValueChange={(val: any) => updateQuestion(q.id, { privacy_level: val })}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General (Low Sensitivity)</SelectItem>
                              <SelectItem value="sensitive">Sensitive (Personal)</SelectItem>
                              <SelectItem value="health">Health Data (HIPAA)</SelectItem>
                            </SelectContent>
                          </Select>
                        </AdminFormField>

                        <AdminFormField label="Storage Scope">
                          <Select 
                            value={q.storage_scope} 
                            onValueChange={(val: any) => updateQuestion(q.id, { storage_scope: val })}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equip-only">Equip Program Only</SelectItem>
                              <SelectItem value="profile">User Profile (Permanent)</SelectItem>
                            </SelectContent>
                          </Select>
                        </AdminFormField>
                      </div>
                      
                      <p className="text-xs text-indigo-700/80 italic">
                        Note: Health data will be automatically encrypted at rest and retention policies applied.
                      </p>
                    </div>

                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* SECTION 4: Add Question Button */}
      <Button onClick={addQuestion} className="w-full py-6 border-dashed border-2" variant="outline">
        <Plus className="w-4 h-4 mr-2" /> Add Question
      </Button>
    </div>
  );
}
