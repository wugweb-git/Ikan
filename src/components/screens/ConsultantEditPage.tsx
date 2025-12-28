import React, { useState, useEffect } from 'react';
import { Save, Trash2, Eye, User, Briefcase, MapPin, DollarSign, Star, Video, Phone, MessageSquare } from 'lucide-react';
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
import { ImageUpload } from '../ui/image-upload';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AdminActionBar } from '../ui/admin-action-bar';

export interface Consultant {
  id: string;
  name: string;
  credentials: string;
  category: 'therapist' | 'psychiatrist' | 'counselor' | 'family-therapist';
  expertises: string[];
  available: boolean;
  location: string;
  yearsExperience: number;
  photo: string;
  bio: string;
  sessionModes: ('online' | 'call' | 'chat')[];
  pricing: {
    video: number;
    call: number;
    chat: number;
  };
  rating: number;
}

export const expertiseCategories = [
  "Anxiety Disorders", "Depressive Disorders", "Relationship Skills",
  "Stress Management", "Anger Management", "Grief and Loss",
  "LGBTQIA+ Concerns", "Trauma", "PTSD", "Sleep Disorder"
];

interface ConsultantEditPageProps {
  consultantId?: string;
  onBack: () => void;
  onSave: () => void;
}

export function ConsultantEditPage({ consultantId, onBack, onSave }: ConsultantEditPageProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!consultantId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Consultant>>({
    name: '',
    credentials: '',
    category: 'therapist',
    expertises: [],
    available: true,
    location: '',
    yearsExperience: 0,
    photo: '',
    bio: '',
    sessionModes: [],
    pricing: {
      video: 0,
      call: 0,
      chat: 0
    },
    rating: 5.0
  });

  // Form validation
  const validationSchema: ValidationSchema = {
    name: {
      required: true,
      minLength: 2,
      message: 'Name must be at least 2 characters'
    },
    credentials: {
      required: true,
      minLength: 2,
      message: 'Credentials are required'
    },
    location: {
      required: true,
      minLength: 2,
      message: 'Location is required'
    },
    yearsExperience: {
      required: true,
      validate: (value: any) => {
        const num = parseInt(value);
        return num >= 0 && num <= 60;
      },
      message: 'Years of experience must be between 0 and 60'
    },
    bio: {
      required: true,
      minLength: 20,
      message: 'Bio must be at least 20 characters'
    }
  };

  const { errors, validateForm, clearErrors } = useFormValidation(validationSchema);
  const { hasUnsavedChanges, markAsSaved, markAsUnsaved, setShowWarning, showWarning } = useUnsavedChanges();

  // Track form changes
  useEffect(() => {
    if (formData.name || formData.bio || formData.credentials) {
      markAsUnsaved();
    }
  }, [formData]);

  // Load consultant data
  useEffect(() => {
    if (consultantId) {
      loadConsultant();
    }
  }, [consultantId]);

  const loadConsultant = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProfessionalById(consultantId!);
      setFormData(data);
    } catch (error) {
      console.error('Failed to load consultant:', error);
      showToast('error', 'Error', 'Failed to load consultant data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate form
    const isValid = validateForm(formData);
    if (!isValid) {
      showToast('error', 'Validation Error', 'Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);

      const professionalData = {
        ...formData,
        expertises: formData.expertises || [],
        topExpertises: (formData.expertises || []).slice(0, 3),
        available: formData.available || false
      };

      if (consultantId) {
        await apiClient.updateProfessional(consultantId, professionalData);
        showToast('success', 'Success', 'Professional updated successfully');
      } else {
        await apiClient.createProfessional(professionalData);
        showToast('success', 'Success', 'Professional created successfully');
      }

      markAsSaved();
      onSave();
    } catch (error) {
      console.error('Failed to save professional:', error);
      showToast('error', 'Error', 'Failed to save professional');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!consultantId) return;

    try {
      setSaving(true);
      await apiClient.deleteProfessional(consultantId);
      showToast('success', 'Success', 'Professional deleted successfully');
      onSave();
    } catch (error) {
      console.error('Failed to delete professional:', error);
      showToast('error', 'Error', 'Failed to delete professional');
    } finally {
      setSaving(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+s': (e) => {
      e.preventDefault();
      handleSave();
    },
    'escape': () => {
      if (hasUnsavedChanges) {
        setShowWarning(true);
      } else {
        onBack();
      }
    }
  }, [formData, hasUnsavedChanges]);

  if (loading) {
    return (
      <AdminPageLayout
        title="Loading..."
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
        title={consultantId ? formData.name || 'Edit Professional' : 'New Professional'}
        subtitle={consultantId ? 'Update professional information' : 'Add a new mental health professional'}
        status={
          formData.available
            ? { label: 'Available', variant: 'success' }
            : { label: 'Unavailable', variant: 'warning' }
        }
        primaryAction={{
          label: consultantId ? 'Save Changes' : 'Create Professional',
          icon: <Save className="w-4 h-4" />,
          onClick: handleSave,
          loading: saving
        }}
        secondaryActions={[
          ...(consultantId
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
        maxWidth="xl"
      >
        {/* Basic Information */}
        <AdminSection
          title="Basic Information"
          description="Core details about the mental health professional"
          icon={<User className="w-5 h-5" />}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Full Name" required error={errors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Jane Doe"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Credentials" required error={errors.credentials}>
              <Input
                value={formData.credentials}
                onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                placeholder="Ph.D., Clinical Psychologist"
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
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
                  <SelectItem value="counselor">Counselor</SelectItem>
                  <SelectItem value="family-therapist">Family Therapist</SelectItem>
                </SelectContent>
              </Select>
            </AdminFormField>

            <AdminFormField
              label="Years of Experience"
              required
              error={errors.yearsExperience}
              helpText="Total years practicing"
            >
              <Input
                type="number"
                value={formData.yearsExperience}
                onChange={(e) =>
                  setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })
                }
                min="0"
                max="60"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Location" required error={errors.location}>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Mumbai, India"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Photo URL" helpText="Professional headshot or avatar">
              <ImageUpload
                value={formData.photo}
                onChange={(url) => setFormData({ ...formData, photo: url })}
                placeholder="https://..."
              />
            </AdminFormField>
          </div>

          <AdminFormField
            label="Professional Bio"
            required
            error={errors.bio}
            description="Tell potential clients about the professional's background and approach"
          >
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Write a compelling bio highlighting education, experience, and therapeutic approach..."
              className="min-h-[120px]"
              style={{
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            />
          </AdminFormField>
        </AdminSection>

        {/* Expertise Areas */}
        <AdminSection
          title="Expertise & Specializations"
          description="Select areas of specialization"
          icon={<Briefcase className="w-5 h-5" />}
        >
          <div className="grid md:grid-cols-2 gap-3">
            {expertiseCategories.map((exp) => (
              <div key={exp} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
                <Checkbox
                  id={`exp-${exp}`}
                  checked={formData.expertises?.includes(exp)}
                  onCheckedChange={(checked) => {
                    const current = formData.expertises || [];
                    if (checked) {
                      setFormData({ ...formData, expertises: [...current, exp] });
                    } else {
                      setFormData({ ...formData, expertises: current.filter((e) => e !== exp) });
                    }
                  }}
                />
                <Label htmlFor={`exp-${exp}`} className="cursor-pointer flex-1">
                  {exp}
                </Label>
              </div>
            ))}
          </div>
        </AdminSection>

        {/* Session Options */}
        <AdminSection
          title="Session Modes & Pricing"
          description="Available consultation methods and pricing"
          icon={<Video className="w-5 h-5" />}
        >
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">Available Session Modes</Label>
              <div className="flex flex-wrap gap-4">
                {(['online', 'call', 'chat'] as const).map((mode) => (
                  <div
                    key={mode}
                    className="flex items-center gap-3 p-4 rounded-lg border"
                    style={{
                      borderColor: formData.sessionModes?.includes(mode)
                        ? 'var(--color-primary-default)'
                        : 'var(--color-border-default)',
                      backgroundColor: formData.sessionModes?.includes(mode)
                        ? 'var(--color-primary-subtle)'
                        : 'var(--color-bg-card)'
                    }}
                  >
                    <Checkbox
                      id={`mode-${mode}`}
                      checked={formData.sessionModes?.includes(mode)}
                      onCheckedChange={(checked) => {
                        const current = formData.sessionModes || [];
                        if (checked) {
                          setFormData({ ...formData, sessionModes: [...current, mode] });
                        } else {
                          setFormData({
                            ...formData,
                            sessionModes: current.filter((m) => m !== mode)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`mode-${mode}`} className="cursor-pointer capitalize flex items-center gap-2">
                      {mode === 'online' && <Video className="w-4 h-4" />}
                      {mode === 'call' && <Phone className="w-4 h-4" />}
                      {mode === 'chat' && <MessageSquare className="w-4 h-4" />}
                      {mode}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Pricing (INR per session)</Label>
              <div className="grid md:grid-cols-3 gap-4">
                <AdminFormField label="Video Session" helpText="60-minute video call">
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      ₹
                    </span>
                    <Input
                      type="number"
                      value={formData.pricing?.video || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...(formData.pricing || {}), video: parseInt(e.target.value) || 0 }
                        })
                      }
                      style={{
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        paddingLeft: 'var(--spacing-8)'
                      }}
                    />
                  </div>
                </AdminFormField>

                <AdminFormField label="Call Session" helpText="60-minute phone call">
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      ₹
                    </span>
                    <Input
                      type="number"
                      value={formData.pricing?.call || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...(formData.pricing || {}), call: parseInt(e.target.value) || 0 }
                        })
                      }
                      style={{
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        paddingLeft: 'var(--spacing-8)'
                      }}
                    />
                  </div>
                </AdminFormField>

                <AdminFormField label="Chat Session" helpText="60-minute chat session">
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      ₹
                    </span>
                    <Input
                      type="number"
                      value={formData.pricing?.chat || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...(formData.pricing || {}), chat: parseInt(e.target.value) || 0 }
                        })
                      }
                      style={{
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        paddingLeft: 'var(--spacing-8)'
                      }}
                    />
                  </div>
                </AdminFormField>
              </div>
            </div>
          </div>
        </AdminSection>

        {/* Availability */}
        <AdminSection
          title="Availability Status"
          description="Control whether this professional is accepting new clients"
          icon={<Star className="w-5 h-5" />}
        >
          <div className="flex items-center gap-3">
            <Checkbox
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => setFormData({ ...formData, available: checked as boolean })}
            />
            <Label htmlFor="available" className="cursor-pointer">
              Available for booking
            </Label>
          </div>
        </AdminSection>
        
        {/* WordPress-Style Action Bar */}
        <AdminActionBar
          onDelete={consultantId ? () => setIsDeleteDialogOpen(true) : undefined}
          onCancel={onBack}
          onSaveDraft={() => handleSave(false)}
          onPublish={() => handleSave(true)}
          isPublished={formData.published || false}
          isSaving={saving}
          showDelete={!!consultantId}
          publishLabel={formData.published ? 'Update' : 'Save and Publish'}
        />
      </AdminPageLayout>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={() => {
          markAsSaved();
          onBack();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Professional</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {formData.name}? This action cannot be undone.
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
              Delete Professional
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}