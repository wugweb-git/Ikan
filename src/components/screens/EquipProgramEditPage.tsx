import React, { useState, useEffect } from 'react';
import { Save, Trash2, Target, Calendar, BarChart, Rocket, Plus } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminPageLayout } from '../admin/AdminPageLayout';
import { AdminSection } from '../admin/AdminSection';
import { AdminFormField } from '../admin/AdminFormField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';

interface DayContent {
  day: number;
  title: string;
  content: string;
  activities: string[];
  reflection: string;
}

export interface EquipProgram {
  id: string;
  title: string;
  description: string;
  category: 'anxiety' | 'depression' | 'stress' | 'resilience' | 'mindfulness' | 'other';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  dailyContent: DayContent[];
  published: boolean;
  featured?: boolean;
  enrollmentCount?: number;
  completionRate?: number;
  created_at?: string;
  updated_at?: string;
}

interface EquipProgramEditPageProps {
  programId?: string;
  onBack: () => void;
  onSave: () => void;
}

const categoryOptions = [
  { value: 'anxiety', label: 'Anxiety Management' },
  { value: 'depression', label: 'Depression Support' },
  { value: 'stress', label: 'Stress Reduction' },
  { value: 'resilience', label: 'Building Resilience' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'other', label: 'Other' }
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export function EquipProgramEditPage({ programId, onBack, onSave }: EquipProgramEditPageProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!programId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<EquipProgram>>({
    title: '',
    description: '',
    category: 'mindfulness',
    duration: 7,
    difficulty: 'beginner',
    goal: '',
    dailyContent: [],
    published: false,
    featured: false
  });

  const validationSchema: ValidationSchema = {
    title: {
      required: true,
      minLength: 3,
      message: 'Title must be at least 3 characters'
    },
    description: {
      required: true,
      minLength: 20,
      message: 'Description must be at least 20 characters'
    },
    goal: {
      required: true,
      minLength: 10,
      message: 'Program goal is required'
    },
    duration: {
      validate: (value: any) => {
        const num = parseInt(value);
        return num > 0 && num <= 365;
      },
      message: 'Duration must be between 1 and 365 days'
    }
  };

  const { errors, validateForm } = useFormValidation(validationSchema);
  const { hasUnsavedChanges, markAsSaved, markAsUnsaved, setShowWarning, showWarning } = useUnsavedChanges();

  useEffect(() => {
    if (formData.title || formData.description) {
      markAsUnsaved();
    }
  }, [formData]);

  useEffect(() => {
    if (programId) {
      loadProgram();
    } else {
      // Initialize with empty days based on duration
      generateDays(7);
    }
  }, [programId]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEquipProgramById(programId!);
      setFormData(data);
    } catch (error) {
      console.error('Failed to load program:', error);
      showToast('error', 'Error', 'Failed to load program data');
    } finally {
      setLoading(false);
    }
  };

  const generateDays = (numDays: number) => {
    const days: DayContent[] = [];
    for (let i = 1; i <= numDays; i++) {
      days.push({
        day: i,
        title: `Day ${i}`,
        content: '',
        activities: [],
        reflection: ''
      });
    }
    setFormData((prev) => ({ ...prev, dailyContent: days }));
  };

  const handleDurationChange = (newDuration: number) => {
    const currentDays = formData.dailyContent || [];
    if (newDuration > currentDays.length) {
      // Add more days
      const additionalDays: DayContent[] = [];
      for (let i = currentDays.length + 1; i <= newDuration; i++) {
        additionalDays.push({
          day: i,
          title: `Day ${i}`,
          content: '',
          activities: [],
          reflection: ''
        });
      }
      setFormData({
        ...formData,
        duration: newDuration,
        dailyContent: [...currentDays, ...additionalDays]
      });
    } else if (newDuration < currentDays.length) {
      // Remove extra days
      setFormData({
        ...formData,
        duration: newDuration,
        dailyContent: currentDays.slice(0, newDuration)
      });
    } else {
      setFormData({ ...formData, duration: newDuration });
    }
  };

  const updateDayContent = (day: number, updates: Partial<DayContent>) => {
    setFormData({
      ...formData,
      dailyContent: (formData.dailyContent || []).map((d) => (d.day === day ? { ...d, ...updates } : d))
    });
  };

  const handleSave = async () => {
    const isValid = validateForm(formData);
    if (!isValid) {
      showToast('error', 'Validation Error', 'Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);

      if (programId) {
        await apiClient.updateEquipProgram(programId, formData);
        showToast('success', 'Success', 'Program updated successfully');
      } else {
        await apiClient.createEquipProgram(formData);
        showToast('success', 'Success', 'Program created successfully');
      }

      markAsSaved();
      onSave();
    } catch (error: any) {
      console.error('Failed to save program:', error);
      showToast('error', 'Error', error.message || 'Failed to save program');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!programId) return;

    try {
      setSaving(true);
      await apiClient.deleteEquipProgram(programId);
      showToast('success', 'Success', 'Program deleted successfully');
      onSave();
    } catch (error: any) {
      console.error('Failed to delete program:', error);
      showToast('error', 'Error', error.message || 'Failed to delete program');
    } finally {
      setSaving(false);
      setIsDeleteDialogOpen(false);
    }
  };

  useKeyboardShortcuts(
    {
      'ctrl+s': (e) => {
        e.preventDefault();
        handleSave();
      },
      escape: () => {
        if (hasUnsavedChanges) {
          setShowWarning(true);
        } else {
          onBack();
        }
      }
    },
    [formData, hasUnsavedChanges]
  );

  if (loading) {
    return (
      <AdminPageLayout
        title="Loading..."
        breadcrumbs={[
          { label: 'Admin', onClick: onBack },
          { label: 'Equip Programs', onClick: onBack },
          { label: 'Loading...' }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div
            className="animate-spin rounded-full border-4"
            style={{
              width: '48px',
              height: '48px',
              borderColor: 'var(--color-accent-default)',
              borderTopColor: 'var(--color-primary-default)'
            }}
          />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <>
      <AdminPageLayout
        title={programId ? formData.title || 'Edit Program' : 'New Program'}
        subtitle={programId ? 'Update program information' : 'Create a new Equip program'}
        breadcrumbs={[
          { label: 'Admin', onClick: onBack },
          { label: 'Equip Programs', onClick: onBack },
          { label: programId ? formData.title || 'Edit' : 'New Program' }
        ]}
        status={
          formData.published
            ? { label: 'Published', variant: 'success' }
            : { label: 'Draft', variant: 'warning' }
        }
        primaryAction={{
          label: programId ? 'Save Changes' : 'Create Program',
          icon: <Save className="w-4 h-4" />,
          onClick: handleSave,
          loading: saving
        }}
        secondaryActions={[
          ...(programId
            ? [
                {
                  label: 'Delete',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => setIsDeleteDialogOpen(true),
                  variant: 'destructive' as const
                }
              ]
            : [])
        ]}
        onBack={() => {
          if (hasUnsavedChanges) {
            setShowWarning(true);
          } else {
            onBack();
          }
        }}
        maxWidth="xl"
      >
        {/* Program Information */}
        <AdminSection
          title="Program Information"
          description="Core program details"
          icon={<Target className="w-5 h-5" />}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Title" required error={errors.title}>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="7-Day Mindfulness Challenge"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Category" required>
              <Select
                value={formData.category}
                onValueChange={(v: any) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>

            <AdminFormField label="Duration (days)" required error={errors.duration}>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                min="1"
                max="365"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Difficulty Level">
              <Select
                value={formData.difficulty}
                onValueChange={(v: any) => setFormData({ ...formData, difficulty: v })}
              >
                <SelectTrigger
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>
          </div>

          <AdminFormField label="Description" required error={errors.description}>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A comprehensive 7-day program to build mindfulness habits..."
              className="min-h-[100px]"
              style={{
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            />
          </AdminFormField>

          <AdminFormField label="Program Goal" required error={errors.goal}>
            <Textarea
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="By the end of this program, you will..."
              className="min-h-[80px]"
              style={{
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            />
          </AdminFormField>
        </AdminSection>

        {/* Daily Content */}
        <AdminSection
          title="Daily Content"
          description={`${(formData.dailyContent || []).length} days configured`}
          icon={<Calendar className="w-5 h-5" />}
        >
          <div className="space-y-4">
            {(formData.dailyContent || []).map((day) => (
              <div
                key={day.day}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: 'var(--color-border-default)',
                  backgroundColor: 'var(--color-bg-card)'
                }}
              >
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    marginBottom: 'var(--spacing-3)'
                  }}
                >
                  Day {day.day}
                </h4>

                <div className="space-y-3">
                  <Input
                    value={day.title}
                    onChange={(e) => updateDayContent(day.day, { title: e.target.value })}
                    placeholder="Day title"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)'
                    }}
                  />
                  <Textarea
                    value={day.content}
                    onChange={(e) => updateDayContent(day.day, { content: e.target.value })}
                    placeholder="Daily content and instructions..."
                    className="min-h-[80px]"
                  />
                  <Textarea
                    value={day.reflection}
                    onChange={(e) => updateDayContent(day.day, { reflection: e.target.value })}
                    placeholder="Reflection prompt..."
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminSection>

        {/* Publishing Options */}
        <AdminSection
          title="Publishing Options"
          description="Control visibility and enrollment"
          icon={<Rocket className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked as boolean })}
              />
              <div className="flex-1">
                <Label htmlFor="published" className="cursor-pointer">
                  Published
                </Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Make this program available for enrollment
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
              />
              <div className="flex-1">
                <Label htmlFor="featured" className="cursor-pointer">
                  Featured
                </Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Show in featured programs section
                </p>
              </div>
            </div>
          </div>

          {programId && (
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Enrollments
                </p>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
                  {formData.enrollmentCount || 0}
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Completion Rate
                </p>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
                  {formData.completionRate || 0}%
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Duration
                </p>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
                  {formData.duration} days
                </p>
              </div>
            </div>
          )}
        </AdminSection>
      </AdminPageLayout>

      <UnsavedChangesDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={() => {
          markAsSaved();
          onBack();
        }}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{formData.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              style={{ backgroundColor: 'var(--color-danger-default)', color: 'white' }}
            >
              Delete Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
