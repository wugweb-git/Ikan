import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';

interface OnboardingQuestion {
  id: string;
  order: number;
  question: string;
  helper_text?: string;
  type: 'single_select' | 'multi_select' | 'text' | 'textarea';
  options?: string[];
  required: boolean;
}

export function EquipOnboardingEditor({ program, onChange }: { program: any, onChange: (u: any) => void }) {
  
  const questions: OnboardingQuestion[] = program.onboarding_questions || [];

  const addQuestion = () => {
    const newQuestion: OnboardingQuestion = {
      id: `q_${Date.now()}`,
      order: questions.length + 1,
      question: '',
      type: 'single_select',
      required: true,
      options: ['Option 1', 'Option 2']
    };
    onChange({ onboarding_questions: [...questions, newQuestion] });
  };

  const updateQuestion = (index: number, updates: Partial<OnboardingQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    onChange({ onboarding_questions: updated });
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    onChange({ onboarding_questions: updated });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange({ onboarding_questions: updated });
  };

  // Helper for options array
  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const q = questions[qIndex];
    const newOptions = [...(q.options || [])];
    newOptions[optIndex] = value;
    updateQuestion(qIndex, { options: newOptions });
  };

  const addOption = (qIndex: number) => {
    const q = questions[qIndex];
    const newOptions = [...(q.options || []), 'New Option'];
    updateQuestion(qIndex, { options: newOptions });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex];
    const newOptions = (q.options || []).filter((_, i) => i !== optIndex);
    updateQuestion(qIndex, { options: newOptions });
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Onboarding Flow</h2>
        <p className="text-gray-500">Configure the questions users answer before starting the program.</p>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card key={q.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 pt-2">
                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveQuestion(index, 'up')} disabled={index === 0}>
                     <ChevronUp className="w-4 h-4" />
                   </Button>
                   <GripVertical className="w-4 h-4 text-gray-300 mx-auto" />
                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1}>
                     <ChevronDown className="w-4 h-4" />
                   </Button>
                </div>

                <div className="flex-1 space-y-4">
                   <div className="flex gap-4">
                     <div className="flex-1">
                       <Label>Question Text</Label>
                       <Input 
                         value={q.question} 
                         onChange={(e) => updateQuestion(index, { question: e.target.value })} 
                         placeholder="e.g. How are you feeling today?"
                       />
                     </div>
                     <div className="w-48">
                       <Label>Type</Label>
                       <Select 
                         value={q.type} 
                         onValueChange={(v: any) => updateQuestion(index, { type: v })}
                       >
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="single_select">Single Choice</SelectItem>
                           <SelectItem value="multi_select">Multiple Choice</SelectItem>
                           <SelectItem value="text">Short Text</SelectItem>
                           <SelectItem value="textarea">Long Text</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>

                   <div>
                     <Label>Helper Text (Optional)</Label>
                     <Input 
                       value={q.helper_text || ''} 
                       onChange={(e) => updateQuestion(index, { helper_text: e.target.value })} 
                       placeholder="e.g. Select all that apply"
                     />
                   </div>

                   {(q.type === 'single_select' || q.type === 'multi_select') && (
                     <div className="bg-neutral-50 p-4 rounded-lg">
                       <Label className="mb-2 block">Options</Label>
                       <div className="space-y-2">
                         {(q.options || []).map((opt, optIndex) => (
                           <div key={optIndex} className="flex gap-2">
                             <Input 
                               value={opt} 
                               onChange={(e) => updateOption(index, optIndex, e.target.value)}
                               className="bg-white"
                             />
                             <Button variant="ghost" size="icon" onClick={() => removeOption(index, optIndex)}>
                               <Trash2 className="w-4 h-4 text-red-500" />
                             </Button>
                           </div>
                         ))}
                         <Button variant="outline" size="sm" onClick={() => addOption(index)}>
                           <Plus className="w-3 h-3 mr-2" /> Add Option
                         </Button>
                       </div>
                     </div>
                   )}

                   <div className="flex items-center gap-2">
                     <Switch 
                       checked={q.required} 
                       onCheckedChange={(checked) => updateQuestion(index, { required: checked })}
                     />
                     <Label>Required</Label>
                   </div>
                </div>

                <div>
                   <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)}>
                     <Trash2 className="w-4 h-4 text-red-500" />
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={addQuestion} className="w-full py-8 border-dashed border-2 bg-transparent hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900">
         <Plus className="w-6 h-6 mr-2" /> Add Question
      </Button>
    </div>
  );
}