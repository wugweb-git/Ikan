import React from 'react';
import { Plus, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
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
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  scoring: {
    type: 'sum' | 'average' | 'custom';
    ranges: Array<{ min: number; max: number; label: string; description: string }>;
  };
  metadata: {
    estimated_minutes: number;
    tags?: string[];
  };
  created_at?: string;
  updated_at?: string;
}

interface AssessmentDetailedEditorProps {
  formData: Partial<Assessment>;
  setFormData: (data: Partial<Assessment>) => void;
  activeTab: 'basic' | 'questions' | 'scoring';
  setActiveTab: (tab: 'basic' | 'questions' | 'scoring') => void;
  editingAssessment: Assessment | null;
}

export function AssessmentDetailedEditor({
  formData,
  setFormData,
  activeTab,
  setActiveTab,
  editingAssessment
}: AssessmentDetailedEditorProps) {
  
  // Question management
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: '',
      type: 'multiple-choice',
      options: ['', ''],
      scoring: {}
    };
    setFormData({
      ...formData,
      questions: [...(formData.questions || []), newQuestion]
    });
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const questions = [...(formData.questions || [])];
    questions[index] = { ...questions[index], ...updates };
    setFormData({ ...formData, questions });
  };

  const deleteQuestion = (index: number) => {
    const questions = [...(formData.questions || [])];
    questions.splice(index, 1);
    setFormData({ ...formData, questions });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const questions = [...(formData.questions || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
    setFormData({ ...formData, questions });
  };

  const addOptionToQuestion = (questionIndex: number) => {
    const questions = [...(formData.questions || [])];
    const question = questions[questionIndex];
    question.options = [...(question.options || []), ''];
    setFormData({ ...formData, questions });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const questions = [...(formData.questions || [])];
    const question = questions[questionIndex];
    const options = [...(question.options || [])];
    const oldValue = options[optionIndex];
    options[optionIndex] = value;
    question.options = options;
    
    // Update scoring key if it exists
    if (question.scoring && oldValue && question.scoring[oldValue] !== undefined) {
      const score = question.scoring[oldValue];
      delete question.scoring[oldValue];
      question.scoring[value] = score;
    }
    
    setFormData({ ...formData, questions });
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const questions = [...(formData.questions || [])];
    const question = questions[questionIndex];
    const options = [...(question.options || [])];
    const removedOption = options[optionIndex];
    options.splice(optionIndex, 1);
    question.options = options;
    
    // Remove scoring for this option
    if (question.scoring && removedOption) {
      delete question.scoring[removedOption];
    }
    
    setFormData({ ...formData, questions });
  };

  const updateQuestionScoring = (questionIndex: number, optionText: string, score: number) => {
    const questions = [...(formData.questions || [])];
    const question = questions[questionIndex];
    question.scoring = { ...(question.scoring || {}), [optionText]: score };
    setFormData({ ...formData, questions });
  };

  // Scoring range management
  const addScoringRange = () => {
    const ranges = [...(formData.scoring?.ranges || [])];
    ranges.push({ min: 0, max: 10, label: '', description: '' });
    setFormData({
      ...formData,
      scoring: { ...formData.scoring!, ranges }
    });
  };

  const updateScoringRange = (index: number, updates: Partial<{ min: number; max: number; label: string; description: string }>) => {
    const ranges = [...(formData.scoring?.ranges || [])];
    ranges[index] = { ...ranges[index], ...updates };
    setFormData({
      ...formData,
      scoring: { ...formData.scoring!, ranges }
    });
  };

  const deleteScoringRange = (index: number) => {
    const ranges = [...(formData.scoring?.ranges || [])];
    ranges.splice(index, 1);
    setFormData({
      ...formData,
      scoring: { ...formData.scoring!, ranges }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div 
        className="flex gap-2 p-1 rounded-lg"
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
      >
        <button
          onClick={() => setActiveTab('basic')}
          className="flex-1 px-4 py-2 rounded-md transition-colors"
          style={{
            backgroundColor: activeTab === 'basic' ? 'var(--color-bg-card)' : 'transparent',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)',
            color: activeTab === 'basic' ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
          }}
        >
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className="flex-1 px-4 py-2 rounded-md transition-colors"
          style={{
            backgroundColor: activeTab === 'questions' ? 'var(--color-bg-card)' : 'transparent',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)',
            color: activeTab === 'questions' ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
          }}
        >
          Questions ({formData.questions?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('scoring')}
          className="flex-1 px-4 py-2 rounded-md transition-colors"
          style={{
            backgroundColor: activeTab === 'scoring' ? 'var(--color-bg-card)' : 'transparent',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)',
            color: activeTab === 'scoring' ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
          }}
        >
          Scoring Ranges ({formData.scoring?.ranges?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input 
              value={formData.title || ''} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Depression Screening (PHQ-9)"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description || ''} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of what this assessment measures..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category || 'wellness'} 
                onValueChange={(v: any) => setFormData({...formData, category: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="mental-health">Mental Health</SelectItem>
                  <SelectItem value="stress">Stress</SelectItem>
                  <SelectItem value="anxiety">Anxiety</SelectItem>
                  <SelectItem value="depression">Depression</SelectItem>
                  <SelectItem value="sleep">Sleep</SelectItem>
                  <SelectItem value="relationships">Relationships</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estimated Time (minutes)</Label>
              <Input 
                type="number"
                value={formData.metadata?.estimated_minutes || 5}
                onChange={(e) => setFormData({
                  ...formData, 
                  metadata: {...(formData.metadata || {}), estimated_minutes: parseInt(e.target.value) || 5}
                })}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Scoring Type</Label>
            <Select 
              value={formData.scoring?.type || 'sum'} 
              onValueChange={(v: any) => setFormData({
                ...formData, 
                scoring: {...(formData.scoring || { ranges: [] }), type: v}
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum (Total Score)</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Add and configure questions for this assessment
            </p>
            <Button
              onClick={addQuestion}
              size="sm"
              style={{
                gap: 'var(--spacing-2)',
                backgroundColor: 'var(--color-primary-default)',
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </div>

          {(!formData.questions || formData.questions.length === 0) ? (
            <div 
              className="p-8 text-center rounded-lg"
              style={{ backgroundColor: 'var(--color-bg-muted)' }}
            >
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
                No questions added yet. Click "Add Question" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.questions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border-default)'
                  }}
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex flex-col gap-1 pt-2">
                      <button
                        onClick={() => moveQuestion(qIndex, 'up')}
                        disabled={qIndex === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <GripVertical className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                      <button
                        onClick={() => moveQuestion(qIndex, 'down')}
                        disabled={qIndex === (formData.questions?.length || 0) - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Question Number and Type */}
                      <div className="flex items-center gap-3">
                        <span 
                          style={{ 
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          Q{qIndex + 1}
                        </span>
                        <Select
                          value={question.type}
                          onValueChange={(v: any) => updateQuestion(qIndex, { type: v })}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="scale">Scale (1-5)</SelectItem>
                            <SelectItem value="text">Text Response</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Question Text */}
                      <Textarea
                        value={question.text}
                        onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                        placeholder="Enter your question here..."
                        className="min-h-[60px]"
                      />

                      {/* Options (for multiple-choice) */}
                      {question.type === 'multiple-choice' && (
                        <div className="space-y-2">
                          <Label>Answer Options & Scores</Label>
                          {question.options?.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                                className="flex-1"
                              />
                              <Input
                                type="number"
                                value={question.scoring?.[option] ?? 0}
                                onChange={(e) => updateQuestionScoring(qIndex, option, parseInt(e.target.value) || 0)}
                                placeholder="Score"
                                className="w-20"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteOption(qIndex, oIndex)}
                                disabled={(question.options?.length || 0) <= 2}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOptionToQuestion(qIndex)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}

                      {/* Scale type info */}
                      {question.type === 'scale' && (
                        <div 
                          className="p-3 rounded"
                          style={{ backgroundColor: 'var(--color-bg-muted)' }}
                        >
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                            Scale questions will display a 1-5 slider. Scores are automatically assigned (1-5).
                          </p>
                        </div>
                      )}

                      {/* Text type info */}
                      {question.type === 'text' && (
                        <div 
                          className="p-3 rounded"
                          style={{ backgroundColor: 'var(--color-bg-muted)' }}
                        >
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                            Text responses are qualitative and don't contribute to scoring.
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteQuestion(qIndex)}
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'scoring' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Define score ranges and their interpretations
            </p>
            <Button
              onClick={addScoringRange}
              size="sm"
              style={{
                gap: 'var(--spacing-2)',
                backgroundColor: 'var(--color-primary-default)',
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
              Add Range
            </Button>
          </div>

          {(!formData.scoring?.ranges || formData.scoring.ranges.length === 0) ? (
            <div 
              className="p-8 text-center rounded-lg"
              style={{ backgroundColor: 'var(--color-bg-muted)' }}
            >
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
                No scoring ranges defined. Click "Add Range" to configure score interpretations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.scoring.ranges.map((range, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border space-y-3"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border-default)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      style={{ 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      Range {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteScoringRange(index)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Min Score</Label>
                      <Input
                        type="number"
                        value={range.min}
                        onChange={(e) => updateScoringRange(index, { min: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Max Score</Label>
                      <Input
                        type="number"
                        value={range.max}
                        onChange={(e) => updateScoringRange(index, { max: parseInt(e.target.value) || 0 })}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Label (e.g., "Minimal", "Mild", "Moderate")</Label>
                    <Input
                      value={range.label}
                      onChange={(e) => updateScoringRange(index, { label: e.target.value })}
                      placeholder="e.g., Minimal Symptoms"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      value={range.description}
                      onChange={(e) => updateScoringRange(index, { description: e.target.value })}
                      placeholder="Describe what this score range means..."
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
