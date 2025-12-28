import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, Calendar, ChevronDown, ChevronRight, 
  CalendarDays, Clock, FileText, Video, Headphones, CheckSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DailyContent {
  id: string;
  day_number: number;
  title: string;
  description: string;
  content_type: 'reading' | 'video' | 'audio' | 'exercise' | 'reflection' | 'quiz';
  content_url?: string;
  content_text?: string;
  estimated_minutes: number;
  is_required: boolean;
  order: number;
}

interface WeekStructure {
  id: string;
  program_id: string;
  week_number: number;
  title: string;
  description: string;
  theme: string;
  learning_objectives: string[];
  daily_content: DailyContent[];
  is_published: boolean;
  order: number;
}

interface AdminWeekStructureManagerProps {
  programId?: string;
}

const CONTENT_TYPE_OPTIONS = [
  { value: 'reading', label: 'Reading', icon: <FileText className="w-4 h-4" /> },
  { value: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
  { value: 'audio', label: 'Audio', icon: <Headphones className="w-4 h-4" /> },
  { value: 'exercise', label: 'Exercise', icon: <CheckSquare className="w-4 h-4" /> },
  { value: 'reflection', label: 'Reflection', icon: <FileText className="w-4 h-4" /> },
  { value: 'quiz', label: 'Quiz', icon: <CheckSquare className="w-4 h-4" /> },
];

export function AdminWeekStructureManager({ programId }: AdminWeekStructureManagerProps) {
  const [weeks, setWeeks] = useState<WeekStructure[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingWeekId, setEditingWeekId] = useState<string | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [isCreatingWeek, setIsCreatingWeek] = useState(false);
  const [isCreatingDay, setIsCreatingDay] = useState<string | null>(null);
  
  const [weekFormData, setWeekFormData] = useState({
    week_number: 1,
    title: '',
    description: '',
    theme: '',
    learning_objectives: [''],
    is_published: false
  });

  const [dayFormData, setDayFormData] = useState({
    day_number: 1,
    title: '',
    description: '',
    content_type: 'reading' as DailyContent['content_type'],
    content_url: '',
    content_text: '',
    estimated_minutes: 15,
    is_required: true
  });

  useEffect(() => {
    if (programId) {
      loadWeeks();
    }
  }, [programId]);

  const loadWeeks = async () => {
    if (!programId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/equip-programs/${programId}/weeks`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      
      if (!response.ok) throw new Error('Failed to load weeks');
      
      const data = await response.json();
      setWeeks(data.weeks || []);
    } catch (error) {
      console.error('Error loading weeks:', error);
      toast.error('Failed to load week structure');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWeek = async () => {
    if (!programId || !weekFormData.title.trim()) {
      toast.error('Week title is required');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/equip-programs/${programId}/weeks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...weekFormData,
            learning_objectives: weekFormData.learning_objectives.filter(o => o.trim()),
            order: weeks.length
          })
        }
      );

      if (!response.ok) throw new Error('Failed to create week');

      toast.success('Week created successfully');
      resetWeekForm();
      loadWeeks();
    } catch (error) {
      console.error('Error creating week:', error);
      toast.error('Failed to create week');
    }
  };

  const handleUpdateWeek = async (weekId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/weeks/${weekId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...weekFormData,
            learning_objectives: weekFormData.learning_objectives.filter(o => o.trim())
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update week');

      toast.success('Week updated successfully');
      setEditingWeekId(null);
      resetWeekForm();
      loadWeeks();
    } catch (error) {
      console.error('Error updating week:', error);
      toast.error('Failed to update week');
    }
  };

  const handleDeleteWeek = async (weekId: string) => {
    if (!confirm('Are you sure you want to delete this week? All daily content will be deleted.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/weeks/${weekId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (!response.ok) throw new Error('Failed to delete week');

      toast.success('Week deleted successfully');
      loadWeeks();
    } catch (error) {
      console.error('Error deleting week:', error);
      toast.error('Failed to delete week');
    }
  };

  const handleCreateDay = async (weekId: string) => {
    if (!dayFormData.title.trim()) {
      toast.error('Day title is required');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/weeks/${weekId}/days`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...dayFormData,
            order: weeks.find(w => w.id === weekId)?.daily_content.length || 0
          })
        }
      );

      if (!response.ok) throw new Error('Failed to create daily content');

      toast.success('Daily content created successfully');
      resetDayForm();
      setIsCreatingDay(null);
      loadWeeks();
    } catch (error) {
      console.error('Error creating daily content:', error);
      toast.error('Failed to create daily content');
    }
  };

  const handleUpdateDay = async (dayId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/days/${dayId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(dayFormData)
        }
      );

      if (!response.ok) throw new Error('Failed to update daily content');

      toast.success('Daily content updated successfully');
      setEditingDayId(null);
      resetDayForm();
      loadWeeks();
    } catch (error) {
      console.error('Error updating daily content:', error);
      toast.error('Failed to update daily content');
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm('Are you sure you want to delete this daily content?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/days/${dayId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (!response.ok) throw new Error('Failed to delete daily content');

      toast.success('Daily content deleted successfully');
      loadWeeks();
    } catch (error) {
      console.error('Error deleting daily content:', error);
      toast.error('Failed to delete daily content');
    }
  };

  const startEditWeek = (week: WeekStructure) => {
    setEditingWeekId(week.id);
    setWeekFormData({
      week_number: week.week_number,
      title: week.title,
      description: week.description,
      theme: week.theme,
      learning_objectives: week.learning_objectives.length > 0 ? week.learning_objectives : [''],
      is_published: week.is_published
    });
    setIsCreatingWeek(false);
  };

  const startEditDay = (day: DailyContent) => {
    setEditingDayId(day.id);
    setDayFormData({
      day_number: day.day_number,
      title: day.title,
      description: day.description,
      content_type: day.content_type,
      content_url: day.content_url || '',
      content_text: day.content_text || '',
      estimated_minutes: day.estimated_minutes,
      is_required: day.is_required
    });
  };

  const resetWeekForm = () => {
    setWeekFormData({
      week_number: weeks.length + 1,
      title: '',
      description: '',
      theme: '',
      learning_objectives: [''],
      is_published: false
    });
    setIsCreatingWeek(false);
    setEditingWeekId(null);
  };

  const resetDayForm = () => {
    setDayFormData({
      day_number: 1,
      title: '',
      description: '',
      content_type: 'reading',
      content_url: '',
      content_text: '',
      estimated_minutes: 15,
      is_required: true
    });
    setEditingDayId(null);
  };

  const addObjective = () => {
    setWeekFormData({
      ...weekFormData,
      learning_objectives: [...weekFormData.learning_objectives, '']
    });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...weekFormData.learning_objectives];
    newObjectives[index] = value;
    setWeekFormData({ ...weekFormData, learning_objectives: newObjectives });
  };

  const removeObjective = (index: number) => {
    setWeekFormData({
      ...weekFormData,
      learning_objectives: weekFormData.learning_objectives.filter((_, i) => i !== index)
    });
  };

  if (!programId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>
            Select an Equip Program to manage its week and daily structure
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p style={{ color: 'var(--color-text-muted)' }}>Loading week structure...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 
            style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}
          >
            Week & Daily Structure
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
            Organize program content into weeks and daily lessons
          </p>
        </div>
        <Button 
          onClick={() => {
            resetWeekForm();
            setIsCreatingWeek(true);
          }}
          style={{ gap: 'var(--spacing-2)' }}
        >
          <Plus className="w-4 h-4" />
          Add Week
        </Button>
      </div>

      {/* Create/Edit Week Form */}
      {(isCreatingWeek || editingWeekId) && (
        <Card>
          <CardHeader>
            <CardTitle>{isCreatingWeek ? 'Create New Week' : 'Edit Week'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Week Number *</Label>
                <Input
                  type="number"
                  min="1"
                  value={weekFormData.week_number}
                  onChange={(e) => setWeekFormData({ ...weekFormData, week_number: parseInt(e.target.value) || 1 })}
                  style={{ backgroundColor: 'var(--color-bg-input)' }}
                />
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <Input
                  value={weekFormData.theme}
                  onChange={(e) => setWeekFormData({ ...weekFormData, theme: e.target.value })}
                  placeholder="e.g. Building Resilience"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Week Title *</Label>
                <Input
                  value={weekFormData.title}
                  onChange={(e) => setWeekFormData({ ...weekFormData, title: e.target.value })}
                  placeholder="e.g. Introduction to CBT"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={weekFormData.description}
                  onChange={(e) => setWeekFormData({ ...weekFormData, description: e.target.value })}
                  placeholder="Overview of this week's content..."
                  className="min-h-[80px]"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Learning Objectives</Label>
                  <Button variant="outline" size="sm" onClick={addObjective}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Objective
                  </Button>
                </div>
                <div className="space-y-2">
                  {weekFormData.learning_objectives.map((objective, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={objective}
                        onChange={(e) => updateObjective(index, e.target.value)}
                        placeholder="Learning objective..."
                        style={{ backgroundColor: 'var(--color-bg-input)' }}
                      />
                      {weekFormData.learning_objectives.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeObjective(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2">
                <Switch
                  checked={weekFormData.is_published}
                  onCheckedChange={(checked) => setWeekFormData({ ...weekFormData, is_published: checked })}
                />
                <Label>Published (visible to users)</Label>
              </div>
            </div>

            <div className="flex gap-2">
              {editingWeekId ? (
                <Button onClick={() => handleUpdateWeek(editingWeekId)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              ) : (
                <Button onClick={handleCreateWeek}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Week
                </Button>
              )}
              <Button variant="outline" onClick={resetWeekForm}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weeks List */}
      {weeks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarDays className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>
              No weeks yet. Create your first week to structure the program content.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {weeks.sort((a, b) => a.week_number - b.week_number).map(week => (
            <Card key={week.id}>
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedWeek(expandedWeek === week.id ? null : week.id)}
                style={{ 
                  backgroundColor: expandedWeek === week.id 
                    ? 'var(--color-accent-default)' 
                    : 'var(--color-bg-card)'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {expandedWeek === week.id ? (
                      <ChevronDown className="w-5 h-5 mt-1" />
                    ) : (
                      <ChevronRight className="w-5 h-5 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          Week {week.week_number}: {week.title}
                        </p>
                        {week.theme && (
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: 'var(--color-primary-default)',
                              color: 'white'
                            }}
                          >
                            {week.theme}
                          </span>
                        )}
                        {!week.is_published && (
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: 'var(--color-text-muted)',
                              color: 'white'
                            }}
                          >
                            Draft
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                        {week.description}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                        {week.daily_content.length} day{week.daily_content.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditWeek(week)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWeek(week.id)}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger-default)' }} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Daily Content */}
              {expandedWeek === week.id && (
                <CardContent className="pt-0 pb-4">
                  <div className="ml-9 space-y-4">
                    {/* Learning Objectives */}
                    {week.learning_objectives.length > 0 && (
                      <div className="space-y-2">
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          Learning Objectives:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {week.learning_objectives.map((obj, idx) => (
                            <li key={idx} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Daily Content List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          Daily Content:
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            resetDayForm();
                            setIsCreatingDay(week.id);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Day
                        </Button>
                      </div>

                      {/* Create Day Form */}
                      {isCreatingDay === week.id && (
                        <div 
                          className="p-4 rounded-lg space-y-3"
                          style={{ 
                            backgroundColor: 'var(--color-bg-muted)',
                            border: '2px solid var(--color-primary-default)'
                          }}
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Day Number</Label>
                              <Input
                                type="number"
                                min="1"
                                value={dayFormData.day_number}
                                onChange={(e) => setDayFormData({ ...dayFormData, day_number: parseInt(e.target.value) || 1 })}
                                style={{ backgroundColor: 'var(--color-bg-input)' }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Content Type</Label>
                              <Select 
                                value={dayFormData.content_type} 
                                onValueChange={(value: DailyContent['content_type']) => setDayFormData({ ...dayFormData, content_type: value })}
                              >
                                <SelectTrigger style={{ backgroundColor: 'var(--color-bg-input)' }}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CONTENT_TYPE_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        {option.icon}
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2 col-span-2">
                              <Label>Title *</Label>
                              <Input
                                value={dayFormData.title}
                                onChange={(e) => setDayFormData({ ...dayFormData, title: e.target.value })}
                                placeholder="e.g. Understanding Your Thoughts"
                                style={{ backgroundColor: 'var(--color-bg-input)' }}
                              />
                            </div>

                            <div className="space-y-2 col-span-2">
                              <Label>Description</Label>
                              <Textarea
                                value={dayFormData.description}
                                onChange={(e) => setDayFormData({ ...dayFormData, description: e.target.value })}
                                placeholder="Brief description..."
                                className="min-h-[60px]"
                                style={{ backgroundColor: 'var(--color-bg-input)' }}
                              />
                            </div>

                            {(dayFormData.content_type === 'video' || dayFormData.content_type === 'audio') && (
                              <div className="space-y-2 col-span-2">
                                <Label>Content URL</Label>
                                <Input
                                  value={dayFormData.content_url}
                                  onChange={(e) => setDayFormData({ ...dayFormData, content_url: e.target.value })}
                                  placeholder="https://..."
                                  style={{ backgroundColor: 'var(--color-bg-input)' }}
                                />
                              </div>
                            )}

                            {(dayFormData.content_type === 'reading' || dayFormData.content_type === 'reflection') && (
                              <div className="space-y-2 col-span-2">
                                <Label>Content Text</Label>
                                <Textarea
                                  value={dayFormData.content_text}
                                  onChange={(e) => setDayFormData({ ...dayFormData, content_text: e.target.value })}
                                  placeholder="Content goes here..."
                                  className="min-h-[100px]"
                                  style={{ backgroundColor: 'var(--color-bg-input)' }}
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>Estimated Minutes</Label>
                              <Input
                                type="number"
                                min="1"
                                value={dayFormData.estimated_minutes}
                                onChange={(e) => setDayFormData({ ...dayFormData, estimated_minutes: parseInt(e.target.value) || 15 })}
                                style={{ backgroundColor: 'var(--color-bg-input)' }}
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <Switch
                                checked={dayFormData.is_required}
                                onCheckedChange={(checked) => setDayFormData({ ...dayFormData, is_required: checked })}
                              />
                              <Label>Required</Label>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={() => handleCreateDay(week.id)} size="sm">
                              <Plus className="w-3 h-3 mr-1" />
                              Create Day
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setIsCreatingDay(null);
                                resetDayForm();
                              }}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Daily Content Items */}
                      {week.daily_content.length === 0 ? (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', padding: 'var(--spacing-3)' }}>
                          No daily content yet. Add your first day to get started.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {week.daily_content
                            .sort((a, b) => a.day_number - b.day_number)
                            .map(day => (
                              <div
                                key={day.id}
                                className="p-3 rounded-lg"
                                style={{ 
                                  backgroundColor: editingDayId === day.id 
                                    ? 'var(--color-accent-default)' 
                                    : 'var(--color-bg-card)',
                                  border: '1px solid var(--color-border-default)'
                                }}
                              >
                                {editingDayId === day.id ? (
                                  <div className="space-y-3">
                                    {/* Edit Day Form - Similar to Create Day Form */}
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <Label>Day Number</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={dayFormData.day_number}
                                          onChange={(e) => setDayFormData({ ...dayFormData, day_number: parseInt(e.target.value) || 1 })}
                                          style={{ backgroundColor: 'var(--color-bg-input)' }}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Content Type</Label>
                                        <Select 
                                          value={dayFormData.content_type} 
                                          onValueChange={(value: DailyContent['content_type']) => setDayFormData({ ...dayFormData, content_type: value })}
                                        >
                                          <SelectTrigger style={{ backgroundColor: 'var(--color-bg-input)' }}>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {CONTENT_TYPE_OPTIONS.map(option => (
                                              <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="space-y-2 col-span-2">
                                        <Label>Title *</Label>
                                        <Input
                                          value={dayFormData.title}
                                          onChange={(e) => setDayFormData({ ...dayFormData, title: e.target.value })}
                                          style={{ backgroundColor: 'var(--color-bg-input)' }}
                                        />
                                      </div>

                                      <div className="space-y-2 col-span-2">
                                        <Label>Description</Label>
                                        <Textarea
                                          value={dayFormData.description}
                                          onChange={(e) => setDayFormData({ ...dayFormData, description: e.target.value })}
                                          className="min-h-[60px]"
                                          style={{ backgroundColor: 'var(--color-bg-input)' }}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Estimated Minutes</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={dayFormData.estimated_minutes}
                                          onChange={(e) => setDayFormData({ ...dayFormData, estimated_minutes: parseInt(e.target.value) || 15 })}
                                          style={{ backgroundColor: 'var(--color-bg-input)' }}
                                        />
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <Switch
                                          checked={dayFormData.is_required}
                                          onCheckedChange={(checked) => setDayFormData({ ...dayFormData, is_required: checked })}
                                        />
                                        <Label>Required</Label>
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button onClick={() => handleUpdateDay(day.id)} size="sm">
                                        <Save className="w-3 h-3 mr-1" />
                                        Save
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => {
                                          setEditingDayId(null);
                                          resetDayForm();
                                        }}
                                      >
                                        <X className="w-3 h-3 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: 'var(--color-primary-default)', color: 'white' }}
                                      >
                                        {CONTENT_TYPE_OPTIONS.find(o => o.value === day.content_type)?.icon}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <p style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                            Day {day.day_number}: {day.title}
                                          </p>
                                          <span 
                                            className="px-2 py-0.5 rounded text-xs"
                                            style={{ 
                                              backgroundColor: 'var(--color-accent-default)',
                                              color: 'var(--color-text-primary)'
                                            }}
                                          >
                                            {CONTENT_TYPE_OPTIONS.find(o => o.value === day.content_type)?.label}
                                          </span>
                                          {day.is_required && (
                                            <span 
                                              className="px-2 py-0.5 rounded text-xs"
                                              style={{ 
                                                backgroundColor: 'var(--color-primary-default)',
                                                color: 'white'
                                              }}
                                            >
                                              Required
                                            </span>
                                          )}
                                        </div>
                                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                                          {day.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Clock className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                                            {day.estimated_minutes} min
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startEditDay(day)}
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteDay(day.id)}
                                      >
                                        <Trash2 className="w-3 h-3" style={{ color: 'var(--color-danger-default)' }} />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
