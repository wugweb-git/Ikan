import React from 'react';
import { Plus, X, ChevronDown, ChevronUp, GripVertical, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { AssessmentQuestionsPanel } from './AssessmentQuestionsPanel';
import { UnifiedBasicInfoForm } from './UnifiedBasicInfoForm';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'scale' | 'text';
  options?: string[];
  scoring?: { [key: string]: number };
  stepGroup?: string; // For grouping multiple questions into one step
  autoAdvance?: boolean; // For automatic advancement after selection
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
  const [selectedQuestionIndex, setSelectedQuestionIndex] = React.useState<number | null>(null);

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
        <UnifiedBasicInfoForm
          title={formData.title || ''}
          description={formData.description || ''}
          category={formData.category || 'wellness'}
          difficulty="beginner"
          duration={formData.metadata?.estimated_minutes || 5}
          onTitleChange={(value) => setFormData({ ...formData, title: value })}
          onDescriptionChange={(value) => setFormData({ ...formData, description: value })}
          onCategoryChange={(value) => setFormData({ ...formData, category: value })}
          onDifficultyChange={() => {}}
          onDurationChange={(value) => setFormData({ 
            ...formData, 
            metadata: { ...(formData.metadata || {}), estimated_minutes: value }
          })}
          config={{
            titleLabel: 'Assessment Title',
            descriptionLabel: 'Description',
            categoryLabel: 'Topic Category',
            durationLabel: 'Duration',
            durationUnit: 'minutes',
            imageLabel: 'Assessment Image (Thumbnail)',
            subtitle: 'Configure assessment details',
            showAssessmentType: true,
            assessmentType: 'standard',
            onAssessmentTypeChange: () => {}
          }}
        />
      )}

      {activeTab === 'questions' && (
        <AssessmentQuestionsPanel
          questions={formData.questions || []}
          onUpdate={(questions) => setFormData({ ...formData, questions })}
        />
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