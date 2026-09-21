import { useState, useEffect } from 'react';
import {
  Save,
  Trash2,
  User,
  Briefcase,
  MapPin,
  Video,
  Phone,
  MessageSquare,
  Languages,
  GraduationCap,
  Heart,
  CircleHelp,
  Users,
  Clock,
  FileText,
  Upload,
  Plus,
  X,
  Quote,
  Sparkles,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminPageLayout } from '../components/AdminPageLayout';
import { AdminSection } from '../components/AdminSection';
import { AdminFormField } from '../components/AdminFormField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ImageUpload } from '../ui/image-upload';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { validateUrl } from '../../lib/validation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { AdminActionBar } from '../ui/admin-action-bar';
import { AdminLoading } from '../components/AdminLoading';
import { useMetadata } from '../../hooks/useMetadata';

// ── Consultant Interface ───────────────────────────────────────────
export interface Consultant {
  id: string;
  name: string;
  credentials: string;
  category: string;
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
  // ── New fields ──
  languages: string[];
  therapeuticApproaches: string[];
  qualifications: string[];
  clientFAQs: { question: string; answer: string }[];
  demographicSpecialties: string[];
  availabilityPreferences: {
    workingHours: string;
    daysAvailable: string[];
    weekendAvailability: boolean;
  };
  willingToShareArticles: boolean;
  therapeuticPhilosophy: string;
  testimonials: { text: string; clientName: string }[];
  videoIntroUrl: string;
  certificates: string[];
  published?: boolean;
  created_at?: string;
  [key: string]: any;
}

// ── Constants (static only – all metadata now from useMetadata hook) ──

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ── Component ──────────────────────────────────────────────────────
interface ConsultantEditPageProps {
  consultantId?: string;
  onBack: () => void;
  onSave: () => void;
}

// Shared input style
const inputStyle = {
  height: 'var(--ikan-component-button-height)',
  borderRadius: 'var(--ikan-component-border-radius)',
};

export function ConsultantEditPage({ consultantId, onBack, onSave }: ConsultantEditPageProps) {
  const { showToast } = useNotifications();
  const {
    consultantTypes,
    languages: kvLanguages,
    therapeuticApproaches: kvTherapeuticApproaches,
    demographicSpecialties: kvDemographicSpecialties,
    expertiseCategories: kvExpertiseCategories,
    sessionFormats: kvSessionFormats,
  } = useMetadata();

  // Derive string arrays for checkbox lists from KV metadata
  const expertiseCategories = kvExpertiseCategories.map(e => e.label);
  const therapeuticApproachOptions = kvTherapeuticApproaches.map(e => e.label);
  const demographicSpecialtyOptions = kvDemographicSpecialties.map(e => e.label);
  const languageOptions = kvLanguages.map(e => e.label);

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
    pricing: { video: 0, call: 0, chat: 0 },
    rating: 5.0,
    // New fields
    languages: [],
    therapeuticApproaches: [],
    qualifications: [],
    clientFAQs: [],
    demographicSpecialties: [],
    availabilityPreferences: {
      workingHours: '',
      daysAvailable: [],
      weekendAvailability: false,
    },
    willingToShareArticles: false,
    therapeuticPhilosophy: '',
    testimonials: [],
    videoIntroUrl: '',
    certificates: [],
  });

  // Form validation
  const validationSchema: ValidationSchema = {
    name: { required: true, minLength: 2, message: 'Name must be at least 2 characters' },
    credentials: { required: true, minLength: 2, message: 'Credentials are required' },
    location: { required: true, minLength: 2, message: 'Location is required' },
    yearsExperience: {
      required: true,
      validate: (value: any) => { const num = parseInt(value); return num >= 0 && num <= 60; },
      message: 'Years of experience must be between 0 and 60'
    },
    bio: { required: true, minLength: 20, message: 'Bio must be at least 20 characters' },
    photo: { validate: (value: any) => !value || !validateUrl(value), message: 'Photo must be a valid URL' }
  };

  const { errors, validateForm, clearErrors } = useFormValidation(validationSchema);
  const { hasUnsavedChanges, markAsSaved, markAsUnsaved, setShowWarning, showWarning } = useUnsavedChanges();

  useEffect(() => {
    if (formData.name || formData.bio || formData.credentials) {
      markAsUnsaved();
    }
  }, [formData]);

  useEffect(() => {
    if (consultantId) loadConsultant();
  }, [consultantId]);

  const loadConsultant = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProfessionalById(consultantId!);
      setFormData(prev => ({
        ...prev,
        ...data,
        languages: data.languages || [],
        therapeuticApproaches: data.therapeuticApproaches || [],
        qualifications: data.qualifications || [],
        clientFAQs: data.clientFAQs || [],
        demographicSpecialties: data.demographicSpecialties || [],
        availabilityPreferences: data.availabilityPreferences || { workingHours: '', daysAvailable: [], weekendAvailability: false },
        willingToShareArticles: data.willingToShareArticles || false,
        therapeuticPhilosophy: data.therapeuticPhilosophy || '',
        testimonials: data.testimonials || [],
        videoIntroUrl: data.videoIntroUrl || '',
        certificates: data.certificates || [],
      }));
    } catch (error) {
      console.error('Failed to load consultant:', error);
      showToast('error', 'Error', 'Failed to load consultant data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish?: boolean) => {
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
        available: formData.available || false,
        published: publish !== undefined ? publish : formData.published,
        // Map to field names expected by ConsultantCard and ConsultantDetail
        approaches: formData.therapeuticApproaches || [],
        concernsICanHelp: formData.expertises || [],
        faqs: (formData.clientFAQs || []).map(faq => ({ q: faq.question, a: faq.answer })),
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

  useKeyboardShortcuts({
    'ctrl+s': (e) => { e.preventDefault(); handleSave(); },
    'escape': () => { if (hasUnsavedChanges) setShowWarning(true); else onBack(); }
  }, [formData, hasUnsavedChanges]);

  // ── Helper: toggle in array ──
  const toggleArray = (field: keyof Consultant, value: string) => {
    setFormData(prev => {
      const current = (prev[field] as string[]) || [];
      const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  // ── Helper: add FAQ ──
  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      clientFAQs: [...(prev.clientFAQs || []), { question: '', answer: '' }]
    }));
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => {
      const faqs = [...(prev.clientFAQs || [])];
      faqs[index] = { ...faqs[index], [field]: value };
      return { ...prev, clientFAQs: faqs };
    });
  };

  const removeFAQ = (index: number) => {
    setFormData(prev => ({ ...prev, clientFAQs: (prev.clientFAQs || []).filter((_, i) => i !== index) }));
  };

  // ── Helper: add Testimonial ──
  const addTestimonial = () => {
    setFormData(prev => ({
      ...prev,
      testimonials: [...(prev.testimonials || []), { text: '', clientName: '' }]
    }));
  };

  const updateTestimonial = (index: number, field: 'text' | 'clientName', value: string) => {
    setFormData(prev => {
      const items = [...(prev.testimonials || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, testimonials: items };
    });
  };

  const removeTestimonial = (index: number) => {
    setFormData(prev => ({ ...prev, testimonials: (prev.testimonials || []).filter((_, i) => i !== index) }));
  };

  // ── Helper: add Qualification ──
  const addQualification = () => {
    setFormData(prev => ({ ...prev, qualifications: [...(prev.qualifications || []), ''] }));
  };

  const updateQualification = (index: number, value: string) => {
    setFormData(prev => {
      const items = [...(prev.qualifications || [])];
      items[index] = value;
      return { ...prev, qualifications: items };
    });
  };

  const removeQualification = (index: number) => {
    setFormData(prev => ({ ...prev, qualifications: (prev.qualifications || []).filter((_, i) => i !== index) }));
  };

  // ── Helper: add Certificate URL ──
  const addCertificate = () => {
    setFormData(prev => ({ ...prev, certificates: [...(prev.certificates || []), ''] }));
  };

  const updateCertificate = (index: number, value: string) => {
    setFormData(prev => {
      const items = [...(prev.certificates || [])];
      items[index] = value;
      return { ...prev, certificates: items };
    });
  };

  const removeCertificate = (index: number) => {
    setFormData(prev => ({ ...prev, certificates: (prev.certificates || []).filter((_, i) => i !== index) }));
  };

  // ── Loading ──
  if (loading) {
    return (
      <AdminPageLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <AdminLoading message="Loading consultant..." />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <>
      <AdminPageLayout
        title={consultantId ? formData.name || 'Edit Professional' : 'New Professional'}
        subtitle={consultantId ? 'Update professional information' : 'Add a new mental health professional'}
        status={formData.available ? { label: 'Available', variant: 'success' } : { label: 'Unavailable', variant: 'warning' }}
        primaryAction={{
          label: consultantId ? 'Save Changes' : 'Create Professional',
          icon: <Save className="w-4 h-4" />,
          onClick: () => handleSave(),
          loading: saving
        }}
        actions={undefined}
        secondaryActions={[
          ...(consultantId ? [{ label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => setIsDeleteDialogOpen(true), variant: 'destructive' as const }] : [])
        ]}
        maxWidth="xl"
      >

        {/* ═══════════ SECTION 1: Basic Information ═══════════ */}
        <AdminSection title="Basic Information" description="Core details about the mental health professional" icon={<User className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Full Name" required error={errors.name}>
              <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Dr. Jane Doe" style={inputStyle} />
            </AdminFormField>

            <AdminFormField label="Credentials" required error={errors.credentials} helpText="Primary credential or title">
              <Input value={formData.credentials} onChange={(e) => setFormData(prev => ({ ...prev, credentials: e.target.value }))} placeholder="Ph.D., Clinical Psychologist" style={inputStyle} />
            </AdminFormField>

            <AdminFormField label="Category" required>
              <Select value={formData.category} onValueChange={(v: any) => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger style={inputStyle}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {consultantTypes.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>

            <AdminFormField label="Years of Experience" required error={errors.yearsExperience} helpText="Total years practicing">
              <Input type="number" value={formData.yearsExperience} onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))} min="0" max="60" style={inputStyle} />
            </AdminFormField>

            <AdminFormField label="Location" required error={errors.location}>
              <Input value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="Mumbai, India" style={inputStyle} />
            </AdminFormField>

            <AdminFormField label="Photo" helpText="Professional headshot or avatar">
              <ImageUpload value={formData.photo} onChange={(url) => setFormData(prev => ({ ...prev, photo: url }))} placeholder="https://..." aspectRatio="square" />
            </AdminFormField>
          </div>

          <div style={{ marginTop: 'var(--spacing-6)' }}>
            <AdminFormField label="Brief Introduction" required error={errors.bio} description="Tell potential clients about the professional's background and approach">
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Write a compelling bio highlighting education, experience, and therapeutic approach..."
                className="min-h-[120px]"
                style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
              />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* ═══════════ SECTION 2: Languages Spoken ═══════════ */}
        <AdminSection title="Languages Spoken" description="Languages in which they can conduct therapy" icon={<Languages className="w-5 h-5" />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {languageOptions.map((lang) => (
              <div key={lang} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
                <Checkbox id={`lang-${lang}`} checked={formData.languages?.includes(lang)} onCheckedChange={() => toggleArray('languages', lang)} />
                <Label htmlFor={`lang-${lang}`} className="cursor-pointer flex-1" style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>{lang}</Label>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'var(--spacing-3)' }}>
            <AdminFormField label="Other Languages" helpText="Comma-separated if not in list above">
              <Input
                placeholder="e.g., French, Mandarin"
                style={inputStyle}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const extras = e.target.value.split(',').map(l => l.trim()).filter(Boolean);
                    const current = formData.languages || [];
                    setFormData(prev => ({ ...prev, languages: [...new Set([...current, ...extras])] }));
                    e.target.value = '';
                  }
                }}
              />
            </AdminFormField>
          </div>
          {(formData.languages?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-2" style={{ marginTop: 'var(--spacing-3)' }}>
              {formData.languages?.map(lang => (
                <Badge key={lang} variant="secondary" className="gap-1" style={{ backgroundColor: 'var(--color-accent-default)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                  {lang}
                  <button onClick={() => toggleArray('languages', lang)} style={{ marginLeft: 'var(--spacing-1)', cursor: 'pointer' }}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </AdminSection>

        {/* ═══════════ SECTION 3: Types of Issues Addressed ═══════════ */}
        <AdminSection title="Types of Issues Addressed" description="Select all areas this professional works with. Custom items can be added." icon={<Briefcase className="w-5 h-5" />}>
          <div className="grid md:grid-cols-3 gap-3">
            {expertiseCategories.map((exp) => (
              <div key={exp} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
                <Checkbox id={`exp-${exp}`} checked={formData.expertises?.includes(exp)} onCheckedChange={() => toggleArray('expertises', exp)} />
                <Label htmlFor={`exp-${exp}`} className="cursor-pointer flex-1" style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>{exp}</Label>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'var(--spacing-3)' }}>
            <AdminFormField label="Add Custom Issue" helpText="Press Enter or blur to add">
              <Input
                placeholder="e.g., Addiction Recovery"
                style={inputStyle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                    toggleArray('expertises', (e.target as HTMLInputElement).value.trim());
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    toggleArray('expertises', e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* ══════════ SECTION 4: Therapeutic Approaches ═══════════ */}
        <AdminSection title="Therapeutic Approaches Used" description="Modalities and therapeutic frameworks" icon={<Heart className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-3">
            {therapeuticApproachOptions.map((approach) => (
              <div key={approach} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
                <Checkbox id={`approach-${approach}`} checked={formData.therapeuticApproaches?.includes(approach)} onCheckedChange={() => toggleArray('therapeuticApproaches', approach)} />
                <Label htmlFor={`approach-${approach}`} className="cursor-pointer flex-1" style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>{approach}</Label>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'var(--spacing-3)' }}>
            <AdminFormField label="Add Custom Approach" helpText="Press Enter to add">
              <Input
                placeholder="e.g., Gestalt Therapy"
                style={inputStyle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                    toggleArray('therapeuticApproaches', (e.target as HTMLInputElement).value.trim());
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    toggleArray('therapeuticApproaches', e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* ═══════════ SECTION 5: Qualifications ═══════════ */}
        <AdminSection title="Qualifications" description="Degrees, certifications, licenses, and additional training" icon={<GraduationCap className="w-5 h-5" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {(formData.qualifications || []).map((qual, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  value={qual}
                  onChange={(e) => updateQualification(index, e.target.value)}
                  placeholder="e.g., Ph.D. Clinical Psychology, University of Mumbai"
                  style={inputStyle}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => removeQualification(index)} style={{ color: 'var(--color-status-danger)', flexShrink: 0 }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addQualification} className="self-start" style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--ikan-component-border-radius)' }}>
              <Plus className="w-4 h-4" /> Add Qualification
            </Button>
          </div>
        </AdminSection>

        {/* ═══════════ SECTION 6: Demographic Specialties ═══════════ */}
        <AdminSection title="Demographic Specialties" description="Client groups this professional works with" icon={<Users className="w-5 h-5" />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {demographicSpecialtyOptions.map((demo) => (
              <div key={demo} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
                <Checkbox id={`demo-${demo}`} checked={formData.demographicSpecialties?.includes(demo)} onCheckedChange={() => toggleArray('demographicSpecialties', demo)} />
                <Label htmlFor={`demo-${demo}`} className="cursor-pointer flex-1" style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>{demo}</Label>
              </div>
            ))}
          </div>
        </AdminSection>

        {/* ═══════════ SECTION 7: Session Modes & Pricing ═══════════ */}
        <AdminSection title="Session Format & Pricing" description="Available consultation methods and pricing" icon={<Video className="w-5 h-5" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div>
              <Label className="mb-3 block" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>Session Formats</Label>
              <div className="flex flex-wrap gap-4">
                {kvSessionFormats.map(sf => {
                  // Map KV session format values to icons
                  const iconMap: Record<string, any> = { video: Video, call: Phone, chat: MessageSquare, 'in-person': MapPin };
                  const Ic = iconMap[sf.value] || Video;
                  return (
                  <div
                    key={sf.value}
                    className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer"
                    style={{
                      borderColor: formData.sessionModes?.includes(sf.value) ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                      backgroundColor: formData.sessionModes?.includes(sf.value) ? 'var(--color-primary-subtle)' : 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-md)',
                    }}
                    onClick={() => toggleArray('sessionModes', sf.value)}
                  >
                    <Checkbox id={`mode-${sf.value}`} checked={formData.sessionModes?.includes(sf.value)} onCheckedChange={() => toggleArray('sessionModes', sf.value)} />
                    <Label htmlFor={`mode-${sf.value}`} className="cursor-pointer capitalize flex items-center gap-2">
                      <Ic className="w-4 h-4" /> {sf.label}
                    </Label>
                  </div>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="mb-3 block" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>Pricing (INR per session)</Label>
              <div className="grid md:grid-cols-3 gap-4">
                {([
                  { key: 'video' as const, label: 'Video Session', help: '60-minute video call' },
                  { key: 'call' as const, label: 'Call Session', help: '60-minute phone call' },
                  { key: 'chat' as const, label: 'Chat Session', help: '60-minute chat session' },
                ]).map(({ key, label, help }) => (
                  <AdminFormField key={key} label={label} helpText={help}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>₹</span>
                      <Input
                        type="number"
                        value={formData.pricing?.[key] || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...(prev.pricing || { video: 0, call: 0, chat: 0 }), [key]: parseInt(e.target.value) || 0 } }))}
                        style={{ ...inputStyle, paddingLeft: 'var(--spacing-8)' }}
                      />
                    </div>
                  </AdminFormField>
                ))}
              </div>
            </div>
          </div>
        </AdminSection>

        {/* ═══════════ SECTION 8: Availability & Time Preferences ═══════════ */}
        <AdminSection title="Availability & Time Preferences" description="Preferred working hours and schedule" icon={<Clock className="w-5 h-5" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div className="flex items-center gap-3">
              <Checkbox id="available" checked={formData.available} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked as boolean }))} />
              <Label htmlFor="available" className="cursor-pointer" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>
                Available for booking
              </Label>
            </div>

            <AdminFormField label="Working Hours" helpText="e.g., 10:00 AM - 6:00 PM IST">
              <Input
                value={formData.availabilityPreferences?.workingHours || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, availabilityPreferences: { ...(prev.availabilityPreferences || { workingHours: '', daysAvailable: [], weekendAvailability: false }), workingHours: e.target.value } }))}
                placeholder="10:00 AM - 6:00 PM IST"
                style={inputStyle}
              />
            </AdminFormField>

            <div>
              <Label className="mb-3 block" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>Days Available</Label>
              <div className="flex flex-wrap gap-3">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = formData.availabilityPreferences?.daysAvailable?.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const current = formData.availabilityPreferences?.daysAvailable || [];
                        const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
                        setFormData(prev => ({ ...prev, availabilityPreferences: { ...(prev.availabilityPreferences || { workingHours: '', daysAvailable: [], weekendAvailability: false }), daysAvailable: updated } }));
                      }}
                      className="px-4 py-2 rounded-lg border transition-all"
                      style={{
                        borderRadius: 'var(--radius-md)',
                        borderColor: isSelected ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                        backgroundColor: isSelected ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                        color: isSelected ? 'var(--color-primary-on)' : 'var(--color-text-primary)',
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        cursor: 'pointer',
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="weekend-avail"
                checked={formData.availabilityPreferences?.weekendAvailability || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, availabilityPreferences: { ...(prev.availabilityPreferences || { workingHours: '', daysAvailable: [], weekendAvailability: false }), weekendAvailability: checked } }))}
              />
              <Label htmlFor="weekend-avail" style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>Available on weekends</Label>
            </div>
          </div>
        </AdminSection>

        {/* ═══════════ SECTION 9: Therapeutic Philosophy ═══════════ */}
        <AdminSection title="Therapeutic Philosophy" description="Guiding principles or philosophies in their practice" icon={<Heart className="w-5 h-5" />}>
          <Textarea
            value={formData.therapeuticPhilosophy || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, therapeuticPhilosophy: e.target.value }))}
            placeholder="Describe the therapist's guiding philosophy, values, and core beliefs about therapy..."
            className="min-h-[100px]"
            style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
          />
        </AdminSection>

        {/* ═══════════ SECTION 10: Client FAQs ═══════════ */}
        <AdminSection
          title="Common Client FAQs"
          description="Questions and answers that will be displayed on the therapist's profile"
          icon={<CircleHelp className="w-5 h-5" />}
          badge={<Badge variant="secondary" style={{ backgroundColor: 'var(--color-accent-default)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>{formData.clientFAQs?.length || 0}</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {(formData.clientFAQs || []).map((faq, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border"
                style={{ borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-muted)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                    FAQ #{index + 1}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => removeFAQ(index)} style={{ color: 'var(--color-status-danger)', height: 28, width: 28 }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                    placeholder="e.g., Do you see individuals, couples, or families?"
                    style={inputStyle}
                  />
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                    placeholder="Answer to the question..."
                    className="min-h-[80px]"
                    style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" onClick={addFAQ} style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--ikan-component-border-radius)' }}>
                <Plus className="w-4 h-4" /> Add FAQ
              </Button>
              {(formData.clientFAQs?.length || 0) === 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      clientFAQs: [
                        { question: 'Do you see individuals, couples, or families?', answer: '' },
                        { question: 'How many sessions do clients typically need?', answer: '' },
                        { question: 'Do you give homework or structured exercises?', answer: '' },
                        { question: 'What is your general working style?', answer: '' },
                      ]
                    }));
                  }}
                  style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--ikan-component-border-radius)' }}
                >
                  <Sparkles className="w-4 h-4" /> Load Suggested FAQs
                </Button>
              )}
            </div>
          </div>
        </AdminSection>

        {/* ═══════════ SECTION 11: Testimonials ═══════════ */}
        <AdminSection
          title="Testimonials & Success Stories"
          description="Client testimonials to be displayed on the therapist's profile page"
          icon={<Quote className="w-5 h-5" />}
          badge={<Badge variant="secondary" style={{ backgroundColor: 'var(--color-accent-default)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>{formData.testimonials?.length || 0}</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {(formData.testimonials || []).map((testimonial, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border"
                style={{ borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-muted)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                    Testimonial #{index + 1}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => removeTestimonial(index)} style={{ color: 'var(--color-status-danger)', height: 28, width: 28 }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                  <Textarea
                    value={testimonial.text}
                    onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                    placeholder="Client testimonial text..."
                    className="min-h-[80px]"
                    style={{ borderRadius: 'var(--ikan-component-border-radius)' }}
                  />
                  <Input
                    value={testimonial.clientName}
                    onChange={(e) => updateTestimonial(index, 'clientName', e.target.value)}
                    placeholder="Client name (or anonymous)"
                    style={inputStyle}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addTestimonial} className="self-start" style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--ikan-component-border-radius)' }}>
              <Plus className="w-4 h-4" /> Add Testimonial
            </Button>
          </div>
        </AdminSection>

        {/* ═══════════ SECTION 12: Willingness to Share Articles ═══════════ */}
        <AdminSection title="Content Contribution" description="Therapist's willingness to contribute articles and resources" icon={<FileText className="w-5 h-5" />}>
          <div className="flex items-center gap-3">
            <Switch
              id="willing-articles"
              checked={formData.willingToShareArticles || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, willingToShareArticles: checked }))}
            />
            <Label htmlFor="willing-articles" style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>
              Willing to share articles to be published on our site
            </Label>
          </div>
        </AdminSection>

        {/* ═══════════ SECTION 13: Uploads ═══════════ */}
        <AdminSection title="Uploads & Verification" description="Photo, video introduction, and certificates for verification" icon={<Upload className="w-5 h-5" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <AdminFormField label="Video Introduction URL" helpText="YouTube, Vimeo, or direct video link">
              <Input
                value={formData.videoIntroUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, videoIntroUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                style={inputStyle}
              />
            </AdminFormField>

            <div>
              <Label className="mb-3 block" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>
                Certificates for Verification
              </Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                {(formData.certificates || []).map((cert, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      value={cert}
                      onChange={(e) => updateCertificate(index, e.target.value)}
                      placeholder="Certificate image/document URL"
                      style={inputStyle}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeCertificate(index)} style={{ color: 'var(--color-status-danger)', flexShrink: 0 }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addCertificate} className="self-start" style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--ikan-component-border-radius)' }}>
                  <Plus className="w-4 h-4" /> Add Certificate
                </Button>
              </div>
            </div>
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
        onConfirm={() => { markAsSaved(); onBack(); }}
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
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} style={{ backgroundColor: 'var(--color-status-danger)', color: 'white' }}>
              Delete Professional
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}