import React from 'react';
import { Plus, X, ChevronDown, ChevronUp, GripVertical, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'scale' | 'text';
  options?: string[];
  scoring?: { [key: string]: number };
  stepGroup?: string;
  autoAdvance?: boolean;
}

interface AssessmentQuestionsPanelProps {
  questions: Question[];
  onUpdate: (questions: Question[]) => void;
}

export function AssessmentQuestionsPanel({ questions, onUpdate }: AssessmentQuestionsPanelProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(
    questions.length > 0 ? 0 : null
  );

  const selectedQuestion = selectedIndex !== null ? questions[selectedIndex] : null;

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: '',
      type: 'multiple-choice',
      options: ['', ''],
      scoring: {}
    };
    const newQuestions = [...questions, newQuestion];
    onUpdate(newQuestions);
    setSelectedIndex(newQuestions.length - 1);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    onUpdate(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    onUpdate(newQuestions);
    if (selectedIndex === index) {
      setSelectedIndex(newQuestions.length > 0 ? 0 : null);
    } else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    onUpdate(newQuestions);
    setSelectedIndex(newIndex);
  };

  const addOption = () => {
    if (selectedIndex === null || !selectedQuestion) return;
    const newOptions = [...(selectedQuestion.options || []), ''];
    updateQuestion(selectedIndex, { options: newOptions });
  };

  const updateOption = (optionIndex: number, value: string) => {
    if (selectedIndex === null || !selectedQuestion) return;
    const newOptions = [...(selectedQuestion.options || [])];
    const oldValue = newOptions[optionIndex];
    newOptions[optionIndex] = value;
    
    const newScoring = { ...(selectedQuestion.scoring || {}) };
    if (oldValue && newScoring[oldValue] !== undefined) {
      const score = newScoring[oldValue];
      delete newScoring[oldValue];
      newScoring[value] = score;
    }
    
    updateQuestion(selectedIndex, { options: newOptions, scoring: newScoring });
  };

  const deleteOption = (optionIndex: number) => {
    if (selectedIndex === null || !selectedQuestion) return;
    const newOptions = [...(selectedQuestion.options || [])];
    const removedOption = newOptions[optionIndex];
    newOptions.splice(optionIndex, 1);
    
    const newScoring = { ...(selectedQuestion.scoring || {}) };
    if (removedOption) {
      delete newScoring[removedOption];
    }
    
    updateQuestion(selectedIndex, { options: newOptions, scoring: newScoring });
  };

  const updateScoring = (optionText: string, score: number) => {
    if (selectedIndex === null || !selectedQuestion) return;
    const newScoring = { ...(selectedQuestion.scoring || {}), [optionText]: score };
    updateQuestion(selectedIndex, { scoring: newScoring });
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice': return 'Multiple Choice';
      case 'scale': return 'Scale';
      case 'text': return 'Text';
      default: return type;
    }
  };

  return (
    <div className="h-[calc(100vh-250px)] flex border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* LEFT SIDEBAR: QUESTION LIST */}
      <div className="w-80 flex flex-col border-r" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="p-3">
          <Button
            onClick={addQuestion}
            className="w-full"
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'white'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {questions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                No questions yet
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                Click "Add Question" to start
              </p>
            </div>
          ) : (
            questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setSelectedIndex(index)}
                className="w-full text-left p-3 rounded-lg transition-all"
                style={{
                  backgroundColor: selectedIndex === index 
                    ? 'white' 
                    : 'transparent',
                  border: selectedIndex === index 
                    ? '2px solid var(--color-primary-default)' 
                    : '2px solid transparent',
                  boxShadow: selectedIndex === index ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <div className="flex items-start gap-2">
                  <Menu className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  <div className="flex-1 min-w-0">
                    <p 
                      className="truncate"
                      style={{ 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--text-sm)'
                      }}
                    >
                      {question.text || `Question ${index + 1}`}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {getQuestionTypeLabel(question.type)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-3 bg-gray-100 border-t text-xs text-gray-500 text-center">
          {questions.length} questions • ~{Math.ceil(questions.length * 0.5)} min
        </div>
      </div>

      {/* RIGHT PANEL: QUESTION EDITOR */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30 p-8">{selectedQuestion && selectedIndex !== null ? (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            
            {/* Header / Type Selector */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Question Configuration</h3>
                <p className="text-sm text-gray-500">Configure how this question appears to users</p>
              </div>
              <Select
                value={selectedQuestion.type}
                onValueChange={(v: any) => updateQuestion(selectedIndex, { type: v })}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="scale">Scale (1-5)</SelectItem>
                  <SelectItem value="text">Text Response</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {/* Question Text Card */}
              <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <div className="space-y-2">
                  <Label>Question Text *</Label>
                  <Input
                    value={selectedQuestion.text}
                    onChange={(e) => updateQuestion(selectedIndex, { text: e.target.value })}
                    placeholder="Enter your question here..."
                    className="text-lg font-medium"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label>Help Text (Optional)</Label>
                  <Input
                    placeholder="Additional context or instructions..."
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Answer Options (Multiple Choice) */}
              {selectedQuestion.type === 'multiple-choice' && (
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Answer Options</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-3 h-3"
                      />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        Allow multiple selections
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedQuestion.options?.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-bg-muted)' }}
                        >
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                        </div>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={selectedQuestion.scoring?.[option] ?? 0}
                          onChange={(e) => updateScoring(option, parseInt(e.target.value) || 0)}
                          placeholder="Score"
                          className="w-20"
                          title="Score value"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteOption(idx)}
                          disabled={(selectedQuestion.options?.length || 0) <= 2}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              )}

              {/* Scale Info */}
              {selectedQuestion.type === 'scale' && (
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    <strong>Scale questions</strong> will display a 1-5 slider. Scores are automatically assigned (1-5).
                  </p>
                </div>
              )}

              {/* Text Info */}
              {selectedQuestion.type === 'text' && (
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    <strong>Text responses</strong> are qualitative and don't contribute to scoring.
                  </p>
                </div>
              )}

              {/* Advanced Settings Card */}
              <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <h4 className="font-medium text-sm text-gray-700">Advanced Settings</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Step Group ID (Optional)</Label>
                    <Input
                      value={selectedQuestion.stepGroup || ''}
                      onChange={(e) => updateQuestion(selectedIndex, { stepGroup: e.target.value || undefined })}
                      placeholder="e.g., step-1"
                    />
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      Questions with the same ID will appear on the same screen.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Auto-advance</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        checked={selectedQuestion.autoAdvance || false}
                        onChange={(e) => updateQuestion(selectedIndex, { autoAdvance: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        Auto-advance on selection
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveQuestion(selectedIndex, 'up')}
                  disabled={selectedIndex === 0}
                  className="gap-2"
                >
                  <ChevronUp className="w-4 h-4" />
                  Move Up
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteQuestion(selectedIndex)}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Delete Question
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveQuestion(selectedIndex, 'down')}
                  disabled={selectedIndex === questions.length - 1}
                  className="gap-2"
                >
                  Move Down
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p className="text-lg font-medium">Select a question to edit</p>
            <p className="text-sm" style={{ marginTop: 'var(--spacing-2)' }}>
              Or click "Add Question" to create a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}