import React from 'react';
import { Plus, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'exercise' | 'reflection';
  content: string;
  duration_minutes?: number;
  required?: boolean;
}

interface Day {
  id: string;
  day_number: number;
  title: string;
  description?: string;
  lessons: Lesson[];
  exercises?: string[];
  check_in_prompts?: string[];
}

interface EquipProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_days: number;
  price: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  days: Day[];
  metadata: {
    total_lessons?: number;
    tags?: string[];
  };
  created_at?: string;
  updated_at?: string;
}

interface EquipProgramDetailedEditorProps {
  formData: Partial<EquipProgram>;
  setFormData: (data: Partial<EquipProgram>) => void;
  activeTab: 'basic' | 'content';
  setActiveTab: (tab: 'basic' | 'content') => void;
  editingProgram: EquipProgram | null;
}

export function EquipProgramDetailedEditor({
  formData,
  setFormData,
  activeTab,
  setActiveTab,
  editingProgram
}: EquipProgramDetailedEditorProps) {
  
  // Day management
  const addDay = () => {
    const newDay: Day = {
      id: `day-${Date.now()}`,
      day_number: (formData.days?.length || 0) + 1,
      title: '',
      description: '',
      lessons: [],
      exercises: [],
      check_in_prompts: []
    };
    setFormData({
      ...formData,
      days: [...(formData.days || []), newDay]
    });
  };

  const updateDay = (index: number, updates: Partial<Day>) => {
    const days = [...(formData.days || [])];
    days[index] = { ...days[index], ...updates };
    setFormData({ ...formData, days });
  };

  const deleteDay = (index: number) => {
    const days = [...(formData.days || [])];
    days.splice(index, 1);
    // Renumber remaining days
    days.forEach((day, i) => {
      day.day_number = i + 1;
    });
    setFormData({ ...formData, days });
  };

  const moveDay = (index: number, direction: 'up' | 'down') => {
    const days = [...(formData.days || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= days.length) return;
    [days[index], days[newIndex]] = [days[newIndex], days[index]];
    // Renumber
    days.forEach((day, i) => {
      day.day_number = i + 1;
    });
    setFormData({ ...formData, days });
  };

  // Lesson management
  const addLesson = (dayIndex: number) => {
    const days = [...(formData.days || [])];
    const day = days[dayIndex];
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      type: 'reading',
      content: '',
      duration_minutes: 10,
      required: true
    };
    day.lessons = [...(day.lessons || []), newLesson];
    setFormData({ ...formData, days });
  };

  const updateLesson = (dayIndex: number, lessonIndex: number, updates: Partial<Lesson>) => {
    const days = [...(formData.days || [])];
    const lessons = [...(days[dayIndex].lessons || [])];
    lessons[lessonIndex] = { ...lessons[lessonIndex], ...updates };
    days[dayIndex].lessons = lessons;
    setFormData({ ...formData, days });
  };

  const deleteLesson = (dayIndex: number, lessonIndex: number) => {
    const days = [...(formData.days || [])];
    const lessons = [...(days[dayIndex].lessons || [])];
    lessons.splice(lessonIndex, 1);
    days[dayIndex].lessons = lessons;
    setFormData({ ...formData, days });
  };

  // Exercise management
  const addExercise = (dayIndex: number) => {
    const days = [...(formData.days || [])];
    const day = days[dayIndex];
    day.exercises = [...(day.exercises || []), ''];
    setFormData({ ...formData, days });
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, value: string) => {
    const days = [...(formData.days || [])];
    const exercises = [...(days[dayIndex].exercises || [])];
    exercises[exerciseIndex] = value;
    days[dayIndex].exercises = exercises;
    setFormData({ ...formData, days });
  };

  const deleteExercise = (dayIndex: number, exerciseIndex: number) => {
    const days = [...(formData.days || [])];
    const exercises = [...(days[dayIndex].exercises || [])];
    exercises.splice(exerciseIndex, 1);
    days[dayIndex].exercises = exercises;
    setFormData({ ...formData, days });
  };

  // Check-in prompt management
  const addCheckIn = (dayIndex: number) => {
    const days = [...(formData.days || [])];
    const day = days[dayIndex];
    day.check_in_prompts = [...(day.check_in_prompts || []), ''];
    setFormData({ ...formData, days });
  };

  const updateCheckIn = (dayIndex: number, promptIndex: number, value: string) => {
    const days = [...(formData.days || [])];
    const prompts = [...(days[dayIndex].check_in_prompts || [])];
    prompts[promptIndex] = value;
    days[dayIndex].check_in_prompts = prompts;
    setFormData({ ...formData, days });
  };

  const deleteCheckIn = (dayIndex: number, promptIndex: number) => {
    const days = [...(formData.days || [])];
    const prompts = [...(days[dayIndex].check_in_prompts || [])];
    prompts.splice(promptIndex, 1);
    days[dayIndex].check_in_prompts = prompts;
    setFormData({ ...formData, days });
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
          onClick={() => setActiveTab('content')}
          className="flex-1 px-4 py-2 rounded-md transition-colors"
          style={{
            backgroundColor: activeTab === 'content' ? 'var(--color-bg-card)' : 'transparent',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)',
            color: activeTab === 'content' ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
          }}
        >
          Daily Content ({formData.days?.length || 0} days)
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
              placeholder="e.g., 30-Day Anxiety Management Program"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description || ''} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of the program..."
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
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="stress">Stress Management</SelectItem>
                  <SelectItem value="anxiety">Anxiety</SelectItem>
                  <SelectItem value="depression">Depression</SelectItem>
                  <SelectItem value="sleep">Sleep</SelectItem>
                  <SelectItem value="relationships">Relationships</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select 
                value={formData.difficulty_level || 'beginner'} 
                onValueChange={(v: any) => setFormData({...formData, difficulty_level: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input 
                type="number"
                value={formData.duration_days || 7}
                onChange={(e) => setFormData({
                  ...formData, 
                  duration_days: parseInt(e.target.value) || 7
                })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input 
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({
                  ...formData, 
                  price: parseFloat(e.target.value) || 0
                })}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Build your day-by-day program content
            </p>
            <Button
              onClick={addDay}
              size="sm"
              style={{
                gap: 'var(--spacing-2)',
                backgroundColor: 'var(--color-primary-default)',
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
              Add Day
            </Button>
          </div>

          {(!formData.days || formData.days.length === 0) ? (
            <div 
              className="p-8 text-center rounded-lg"
              style={{ backgroundColor: 'var(--color-bg-muted)' }}
            >
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
                No days added yet. Click "Add Day" to start building your program.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.days.map((day, dayIndex) => (
                <div
                  key={day.id}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border-default)'
                  }}
                >
                  {/* Day Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex flex-col gap-1 pt-2">
                      <button
                        onClick={() => moveDay(dayIndex, 'up')}
                        disabled={dayIndex === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <GripVertical className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                      <button
                        onClick={() => moveDay(dayIndex, 'down')}
                        disabled={dayIndex === (formData.days?.length || 0) - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span 
                          style={{ 
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-text-primary)',
                            fontSize: 'var(--text-base)'
                          }}
                        >
                          Day {day.day_number}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteDay(dayIndex)}
                        >
                          <X className="w-5 h-5 text-red-500" />
                        </Button>
                      </div>

                      {/* Day Title & Description */}
                      <div className="space-y-2">
                        <Input
                          value={day.title}
                          onChange={(e) => updateDay(dayIndex, { title: e.target.value })}
                          placeholder="Day title (e.g., 'Introduction to Mindfulness')"
                        />
                        <Textarea
                          value={day.description || ''}
                          onChange={(e) => updateDay(dayIndex, { description: e.target.value })}
                          placeholder="Brief description of this day's focus..."
                          className="min-h-[60px]"
                        />
                      </div>

                      {/* Lessons Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Lessons</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addLesson(dayIndex)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Lesson
                          </Button>
                        </div>

                        {day.lessons && day.lessons.length > 0 && (
                          <div className="space-y-2 pl-4 border-l-2" style={{ borderColor: 'var(--color-border-default)' }}>
                            {day.lessons.map((lesson, lessonIndex) => (
                              <div 
                                key={lesson.id} 
                                className="p-3 rounded border"
                                style={{ 
                                  backgroundColor: 'var(--color-bg-muted)',
                                  borderColor: 'var(--color-border-default)'
                                }}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={lesson.title}
                                      onChange={(e) => updateLesson(dayIndex, lessonIndex, { title: e.target.value })}
                                      placeholder="Lesson title"
                                      className="flex-1"
                                    />
                                    <Select
                                      value={lesson.type}
                                      onValueChange={(v: any) => updateLesson(dayIndex, lessonIndex, { type: v })}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="reading">Reading</SelectItem>
                                        <SelectItem value="exercise">Exercise</SelectItem>
                                        <SelectItem value="reflection">Reflection</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteLesson(dayIndex, lessonIndex)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <Textarea
                                    value={lesson.content}
                                    onChange={(e) => updateLesson(dayIndex, lessonIndex, { content: e.target.value })}
                                    placeholder="Lesson content, instructions, or video URL..."
                                    className="min-h-[60px]"
                                  />
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <Label className="text-xs">Duration (min)</Label>
                                      <Input
                                        type="number"
                                        value={lesson.duration_minutes || 10}
                                        onChange={(e) => updateLesson(dayIndex, lessonIndex, { duration_minutes: parseInt(e.target.value) || 10 })}
                                        className="w-16"
                                        min="1"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={lesson.required}
                                        onCheckedChange={(checked) => updateLesson(dayIndex, lessonIndex, { required: !!checked })}
                                      />
                                      <Label className="text-xs">Required</Label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Exercises Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Practice Exercises</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addExercise(dayIndex)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Exercise
                          </Button>
                        </div>

                        {day.exercises && day.exercises.length > 0 && (
                          <div className="space-y-2">
                            {day.exercises.map((exercise, exIndex) => (
                              <div key={exIndex} className="flex items-center gap-2">
                                <Input
                                  value={exercise}
                                  onChange={(e) => updateExercise(dayIndex, exIndex, e.target.value)}
                                  placeholder="Exercise description..."
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteExercise(dayIndex, exIndex)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Check-in Prompts Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Check-in Prompts</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addCheckIn(dayIndex)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Prompt
                          </Button>
                        </div>

                        {day.check_in_prompts && day.check_in_prompts.length > 0 && (
                          <div className="space-y-2">
                            {day.check_in_prompts.map((prompt, pIndex) => (
                              <div key={pIndex} className="flex items-center gap-2">
                                <Input
                                  value={prompt}
                                  onChange={(e) => updateCheckIn(dayIndex, pIndex, e.target.value)}
                                  placeholder="Check-in question..."
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteCheckIn(dayIndex, pIndex)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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
