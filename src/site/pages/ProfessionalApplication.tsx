import { projectId } from '../../utils/supabase/info';
import { getAuthHeaders } from '../../shared/supabase-client';
import { useState, useRef, useEffect } from 'react';
import {
  User,
  Briefcase,
  Heart,
  Clock,
  FileText,
  Upload,
  Plus,
  X,
  Video,
  Phone,
  MessageSquare,
  CircleCheck,
  Sparkles,
  ArrowLeft,
  Send,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useMetadata } from '../../hooks/useMetadata';

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const inputStyle = {
  height: 'var(--ikan-component-button-height)',
  borderRadius: 'var(--ikan-component-border-radius)',
};

const sectionTitleStyle = {
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--text-lg)',
  fontWeight: 500 as const,
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--spacing-1)',
};

const sectionDescStyle = {
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--text-sm)',
  fontWeight: 400 as const,
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--spacing-4)',
};

interface ProfessionalApplicationProps {
  onNavigate?: (route: string) => void;
}

export function ProfessionalApplication({ onNavigate }: ProfessionalApplicationProps) {
  const isMobile = useIsMobile();
  const {
    consultantTypes,
    languages: kvLanguages,
    therapeuticApproaches: kvTherapeuticApproaches,
    demographicSpecialties: kvDemographicSpecialties,
    expertiseCategories: kvExpertiseCategories,
  } = useMetadata();

  const expertiseCategories = kvExpertiseCategories.map(e => e.label);
  const therapeuticApproachOptions = kvTherapeuticApproaches.map(e => e.label);
  const demographicSpecialtyOptions = kvDemographicSpecialties.map(e => e.label);
  const languageOptions = kvLanguages.map(e => e.label);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  // Ensure page scrolls to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log('📝 ProfessionalApplication mounted at', window.location.pathname);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    credentials: '',
    category: 'therapist' as string,
    yearsExperience: 0,
    location: '',
    bio: '',
    photo: '',
    languages: [] as string[],
    expertises: [] as string[],
    therapeuticApproaches: [] as string[],
    qualifications: [] as string[],
    clientFAQs: [] as { question: string; answer: string }[],
    demographicSpecialties: [] as string[],
    availabilityPreferences: { workingHours: '', daysAvailable: [] as string[], weekendAvailability: false },
    willingToShareArticles: false,
    therapeuticPhilosophy: '',
    testimonials: [] as { text: string; clientName: string }[],
    videoIntroUrl: '',
    certificates: [] as string[],
    sessionModes: [] as string[],
    pricing: { video: 0, call: 0, chat: 0 },
  });

  const toggleArray = (field: string, value: string) => {
    setFormData(prev => {
      const current = (prev as any)[field] || [];
      const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleFileUpload = async (file: File, category: string): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', category);
      fd.append('professionalId', 'application');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/upload/professional-file`,
        { method: 'POST', headers: await getAuthHeaders(), body: fd }
      );
      const result = await response.json();
      if (result.success) return result.url;
      console.error('Upload failed:', result.error);
      return null;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.credentials.trim() || !formData.bio.trim()) {
      setError('Please fill in at least your name, credentials, and a brief introduction.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/public/professional-application`,
        {
          method: 'POST',
          headers: { ...(await getAuthHeaders(true)) },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { label: 'Basic Info', icon: User },
    { label: 'Expertise', icon: Briefcase },
    { label: 'Approach', icon: Heart },
    { label: 'Availability', icon: Clock },
    { label: 'Extras', icon: FileText },
  ];

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)', padding: 'var(--spacing-4)' }}>
        <Card style={{ maxWidth: 520, width: '100%', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <CardContent style={{ padding: 'var(--spacing-8)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-status-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-4)' }}>
              <CircleCheck className="w-8 h-8" style={{ color: 'var(--color-status-success)' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-2xl)', fontWeight: 500, marginBottom: 'var(--spacing-3)' }}>
              Application Submitted!
            </h1>
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)', lineHeight: 'var(--line-height-lg)' }}>
              Thank you for your interest in joining the iKan platform. Our team will review your profile and get back to you within 3-5 business days.
            </p>
            {onNavigate && (
              <Button onClick={() => onNavigate('/')} style={{ borderRadius: 'var(--radius-md)' }}>
                Back to Home
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 4, display: 'block' }}>Full Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Dr. Jane Doe" style={inputStyle} />
            </div>
            <div>
              <Label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 4, display: 'block' }}>Credentials *</Label>
              <Input value={formData.credentials} onChange={(e) => setFormData(prev => ({ ...prev, credentials: e.target.value }))} placeholder="Ph.D., Clinical Psychologist" style={inputStyle} />
            </div>
            <div>
              <Label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 4, display: 'block' }}>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger style={inputStyle}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {consultantTypes.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 4, display: 'block' }}>Years of Experience</Label>
              <Input type="number" value={formData.yearsExperience} onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))} min="0" max="60" style={inputStyle} />
            </div>
            <div>
              <Label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 4, display: 'block' }}>Location</Label>
              <Input value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="Mumbai, India" style={inputStyle} />
            </div>
            <div>
              <Label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 4, display: 'block' }}>Photo URL</Label>
              <Input value={formData.photo} onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))} placeholder="https://..." style={inputStyle} />
              <input type="file" accept="image/*" className="hidden" id="photo-upload" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await handleFileUpload(file, 'photo');
                  if (url) setFormData(prev => ({ ...prev, photo: url }));
                }
              }} />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('photo-upload')?.click()} style={{ marginTop: 'var(--spacing-2)', gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}>
                <Upload className="w-3 h-3" /> Upload Photo
              </Button>
            </div>
          </div>
          <div>
            <Label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 4, display: 'block' }}>Brief Introduction *</Label>
            <Textarea value={formData.bio} onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell us about yourself, your background, and your approach to therapy..." className="min-h-[120px]" style={{ borderRadius: 'var(--radius-md)' }} />
          </div>
          <div>
            <Label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 8, display: 'block' }}>Languages Spoken</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {languageOptions.map(lang => (
                <div key={lang} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-bg-muted)]" style={{ cursor: 'pointer' }} onClick={() => toggleArray('languages', lang)}>
                  <Checkbox checked={formData.languages.includes(lang)} onCheckedChange={() => toggleArray('languages', lang)} />
                  <span style={{ fontSize: 'var(--text-sm)' }}>{lang}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      case 1: return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div>
            <h3 style={sectionTitleStyle}>Types of Issues You Address</h3>
            <p style={sectionDescStyle}>Select all that apply. You can also add custom items.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {expertiseCategories.map(exp => (
                <div key={exp} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-bg-muted)]" style={{ cursor: 'pointer' }} onClick={() => toggleArray('expertises', exp)}>
                  <Checkbox checked={formData.expertises.includes(exp)} onCheckedChange={() => toggleArray('expertises', exp)} />
                  <span style={{ fontSize: 'var(--text-sm)' }}>{exp}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={sectionTitleStyle}>Demographic Specialties</h3>
            <p style={sectionDescStyle}>Client groups you work with.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {demographicSpecialtyOptions.map(d => (
                <div key={d} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-bg-muted)]" style={{ cursor: 'pointer' }} onClick={() => toggleArray('demographicSpecialties', d)}>
                  <Checkbox checked={formData.demographicSpecialties.includes(d)} onCheckedChange={() => toggleArray('demographicSpecialties', d)} />
                  <span style={{ fontSize: 'var(--text-sm)' }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={sectionTitleStyle}>Qualifications</h3>
            <p style={sectionDescStyle}>Degrees, certifications, licenses, and additional training.</p>
            {formData.qualifications.map((q, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Input value={q} onChange={(e) => { const qs = [...formData.qualifications]; qs[i] = e.target.value; setFormData(prev => ({ ...prev, qualifications: qs })); }} placeholder="e.g., Ph.D. Clinical Psychology" style={inputStyle} className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, qualifications: prev.qualifications.filter((_, j) => j !== i) }))} style={{ color: 'var(--color-status-danger)' }}><X className="w-4 h-4" /></Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => setFormData(prev => ({ ...prev, qualifications: [...prev.qualifications, ''] }))} style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}><Plus className="w-4 h-4" /> Add Qualification</Button>
          </div>
        </div>
      );

      case 2: return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div>
            <h3 style={sectionTitleStyle}>Therapeutic Approaches</h3>
            <p style={sectionDescStyle}>Select the modalities you practice.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {therapeuticApproachOptions.map(a => (
                <div key={a} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-bg-muted)]" style={{ cursor: 'pointer' }} onClick={() => toggleArray('therapeuticApproaches', a)}>
                  <Checkbox checked={formData.therapeuticApproaches.includes(a)} onCheckedChange={() => toggleArray('therapeuticApproaches', a)} />
                  <span style={{ fontSize: 'var(--text-sm)' }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={sectionTitleStyle}>Therapeutic Philosophy</h3>
            <Textarea value={formData.therapeuticPhilosophy} onChange={(e) => setFormData(prev => ({ ...prev, therapeuticPhilosophy: e.target.value }))} placeholder="Describe your guiding philosophy..." className="min-h-[100px]" style={{ borderRadius: 'var(--radius-md)' }} />
          </div>
          <div>
            <h3 style={sectionTitleStyle}>Session Formats</h3>
            <div className="flex flex-wrap gap-3">
              {[{ key: 'online', label: 'Video Call', icon: Video }, { key: 'call', label: 'Phone Call', icon: Phone }, { key: 'chat', label: 'Chat', icon: MessageSquare }].map(({ key, label, icon: Ic }) => (
                <div key={key} className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer" onClick={() => toggleArray('sessionModes', key)}
                  style={{ borderColor: formData.sessionModes.includes(key) ? 'var(--color-primary-default)' : 'var(--color-border-default)', backgroundColor: formData.sessionModes.includes(key) ? 'var(--color-primary-subtle)' : 'var(--color-bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <Checkbox checked={formData.sessionModes.includes(key)} onCheckedChange={() => toggleArray('sessionModes', key)} />
                  <Ic className="w-4 h-4" /><span style={{ fontSize: 'var(--text-sm)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      case 3: return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div>
            <h3 style={sectionTitleStyle}>Working Hours</h3>
            <Input value={formData.availabilityPreferences.workingHours} onChange={(e) => setFormData(prev => ({ ...prev, availabilityPreferences: { ...prev.availabilityPreferences, workingHours: e.target.value } }))} placeholder="e.g., 10:00 AM - 6:00 PM IST" style={inputStyle} />
          </div>
          <div>
            <h3 style={sectionTitleStyle}>Days Available</h3>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => {
                const sel = formData.availabilityPreferences.daysAvailable.includes(day);
                return (
                  <button key={day} type="button" onClick={() => {
                    setFormData(prev => {
                      const days = prev.availabilityPreferences.daysAvailable.includes(day)
                        ? prev.availabilityPreferences.daysAvailable.filter(d => d !== day)
                        : [...prev.availabilityPreferences.daysAvailable, day];
                      return { ...prev, availabilityPreferences: { ...prev.availabilityPreferences, daysAvailable: days } };
                    });
                  }} style={{ padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', border: '1px solid', borderColor: sel ? 'var(--color-primary-default)' : 'var(--color-border-default)', backgroundColor: sel ? 'var(--color-primary-default)' : 'var(--color-bg-card)', color: sel ? 'var(--color-primary-on)' : 'var(--color-text-primary)', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer' }}>
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={formData.availabilityPreferences.weekendAvailability} onCheckedChange={(c) => setFormData(prev => ({ ...prev, availabilityPreferences: { ...prev.availabilityPreferences, weekendAvailability: c } }))} />
            <Label style={{ fontSize: 'var(--text-sm)' }}>Available on weekends</Label>
          </div>
          <div>
            <h3 style={sectionTitleStyle}>Common Client FAQs</h3>
            <p style={sectionDescStyle}>Help clients understand your practice better.</p>
            {formData.clientFAQs.map((faq, i) => (
              <div key={i} className="p-3 rounded-lg border mb-3" style={{ borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>FAQ #{i + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, clientFAQs: prev.clientFAQs.filter((_, j) => j !== i) }))} style={{ height: 24, width: 24, color: 'var(--color-status-danger)' }}><X className="w-3 h-3" /></Button>
                </div>
                <Input value={faq.question} onChange={(e) => { const faqs = [...formData.clientFAQs]; faqs[i] = { ...faqs[i], question: e.target.value }; setFormData(prev => ({ ...prev, clientFAQs: faqs })); }} placeholder="Question..." className="mb-2" style={inputStyle} />
                <Textarea value={faq.answer} onChange={(e) => { const faqs = [...formData.clientFAQs]; faqs[i] = { ...faqs[i], answer: e.target.value }; setFormData(prev => ({ ...prev, clientFAQs: faqs })); }} placeholder="Answer..." className="min-h-[60px]" style={{ borderRadius: 'var(--radius-md)' }} />
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFormData(prev => ({ ...prev, clientFAQs: [...prev.clientFAQs, { question: '', answer: '' }] }))} style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}><Plus className="w-4 h-4" /> Add FAQ</Button>
              {formData.clientFAQs.length === 0 && (
                <Button variant="outline" onClick={() => setFormData(prev => ({ ...prev, clientFAQs: [{ question: 'Do you see individuals, couples, or families?', answer: '' }, { question: 'How many sessions do clients typically need?', answer: '' }, { question: 'What is your general working style?', answer: '' }] }))} style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}><Sparkles className="w-4 h-4" /> Load Suggested</Button>
              )}
            </div>
          </div>
        </div>
      );

      case 4: return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div>
            <h3 style={sectionTitleStyle}>Video Introduction</h3>
            <p style={sectionDescStyle}>YouTube, Vimeo, or direct video link.</p>
            <Input value={formData.videoIntroUrl} onChange={(e) => setFormData(prev => ({ ...prev, videoIntroUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." style={inputStyle} />
          </div>
          <div>
            <h3 style={sectionTitleStyle}>Certificates for Verification</h3>
            {formData.certificates.map((c, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Input value={c} onChange={(e) => { const certs = [...formData.certificates]; certs[i] = e.target.value; setFormData(prev => ({ ...prev, certificates: certs })); }} placeholder="Certificate URL or upload below" style={inputStyle} className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, certificates: prev.certificates.filter((_, j) => j !== i) }))} style={{ color: 'var(--color-status-danger)' }}><X className="w-4 h-4" /></Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFormData(prev => ({ ...prev, certificates: [...prev.certificates, ''] }))} style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}><Plus className="w-4 h-4" /> Add Certificate</Button>
              <div>
                <input type="file" accept="image/*,.pdf" className="hidden" id="cert-upload" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await handleFileUpload(file, 'certificate');
                    if (url) setFormData(prev => ({ ...prev, certificates: [...prev.certificates, url] }));
                  }
                }} />
                <Button variant="outline" onClick={() => document.getElementById('cert-upload')?.click()} style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}><Upload className="w-4 h-4" /> Upload File</Button>
              </div>
            </div>
          </div>
          <div>
            <h3 style={sectionTitleStyle}>Testimonials</h3>
            <p style={sectionDescStyle}>Client testimonials you'd like displayed on your profile.</p>
            {formData.testimonials.map((t, i) => (
              <div key={i} className="p-3 rounded-lg border mb-3" style={{ borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Testimonial #{i + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, testimonials: prev.testimonials.filter((_, j) => j !== i) }))} style={{ height: 24, width: 24, color: 'var(--color-status-danger)' }}><X className="w-3 h-3" /></Button>
                </div>
                <Textarea value={t.text} onChange={(e) => { const ts = [...formData.testimonials]; ts[i] = { ...ts[i], text: e.target.value }; setFormData(prev => ({ ...prev, testimonials: ts })); }} placeholder="Testimonial text..." className="mb-2 min-h-[60px]" style={{ borderRadius: 'var(--radius-md)' }} />
                <Input value={t.clientName} onChange={(e) => { const ts = [...formData.testimonials]; ts[i] = { ...ts[i], clientName: e.target.value }; setFormData(prev => ({ ...prev, testimonials: ts })); }} placeholder="Client name (or anonymous)" style={inputStyle} />
              </div>
            ))}
            <Button variant="outline" onClick={() => setFormData(prev => ({ ...prev, testimonials: [...prev.testimonials, { text: '', clientName: '' }] }))} style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}><Plus className="w-4 h-4" /> Add Testimonial</Button>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)' }}>
            <Switch checked={formData.willingToShareArticles} onCheckedChange={(c) => setFormData(prev => ({ ...prev, willingToShareArticles: c }))} />
            <div>
              <Label style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>Willing to contribute articles</Label>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Share articles on our blog/resources section</p>
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)', padding: isMobile ? 'var(--spacing-6) var(--spacing-4)' : 'var(--spacing-8) var(--spacing-6)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {onNavigate && (
            <Button variant="ghost" onClick={() => onNavigate('/')} style={{ color: 'var(--color-primary-on)', marginBottom: 'var(--spacing-4)', gap: 'var(--spacing-2)' }}>
              <ArrowLeft className="w-4 h-4" /> Back to iKan
            </Button>
          )}
          <h1 style={{ fontFamily: 'var(--font-family-base)', fontSize: isMobile ? 'var(--text-2xl)' : 'var(--text-3xl)', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>
            Join iKan as a Professional
          </h1>
          <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)', opacity: 0.85, lineHeight: 'var(--line-height-lg)' }}>
            Complete this form to apply. Your profile will be reviewed by our team and go live once approved.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--spacing-4)' }}>
        <div className="flex items-center justify-between mb-6" style={{ overflowX: 'auto' }}>
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className="flex flex-col items-center gap-1"
                style={{ flex: 1, cursor: 'pointer', background: 'none', border: 'none', minWidth: 60 }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'var(--color-primary-default)' : isDone ? 'var(--color-status-success)' : 'var(--color-bg-muted)',
                  color: isActive || isDone ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {isDone ? <CircleCheck className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: isActive ? 500 : 400, color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <Card ref={formRef} style={{ borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-6)' }}>
          <CardContent style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--color-status-danger-light)', border: '1px solid var(--color-status-danger)', borderRadius: 'var(--radius-md)' }}>
            <X className="w-4 h-4" style={{ color: 'var(--color-status-danger)' }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-status-danger)' }}>{error}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between" style={{ paddingBottom: 'var(--spacing-8)' }}>
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)', minWidth: 180 }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}