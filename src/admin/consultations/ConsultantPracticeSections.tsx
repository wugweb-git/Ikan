import type React from 'react';
import { Video, Phone, MessageSquare, MapPin, Clock, Heart, CircleHelp, Quote, FileText, Upload, Plus, X, Sparkles } from 'lucide-react';
import { AdminSection } from '../shell/AdminSection';
import { AdminFormField } from '../ui/kit/AdminFormField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';
import { useMetadata } from '../ui/hooks/useMetadata';
import {
  type Consultant,
  type ConsultantSectionProps,
  DAYS_OF_WEEK,
  EMPTY_AVAILABILITY,
  FIELD,
  AREA,
  GROUP_LABEL,
  COUNT_BADGE,
} from './consultant-form';

const SESSION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Video, call: Phone, chat: MessageSquare, 'in-person': MapPin,
};

const PRICING_FIELDS = [
  { key: 'video' as const, label: 'Video Session', help: '60-minute video call' },
  { key: 'call' as const, label: 'Call Session', help: '60-minute phone call' },
  { key: 'chat' as const, label: 'Chat Session', help: '60-minute chat session' },
];

const SUGGESTED_FAQS = [
  { question: 'Do you see individuals, couples, or families?', answer: '' },
  { question: 'How many sessions do clients typically need?', answer: '' },
  { question: 'Do you give homework or structured exercises?', answer: '' },
  { question: 'What is your general working style?', answer: '' },
];

const ADD_BUTTON = `gap-2 ${AREA}`;
const REMOVE_ICON = 'h-7 w-7 text-[var(--color-status-danger)]';
const CARD = 'p-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-muted)]';
const CARD_LABEL = 'text-xs text-[var(--color-text-muted)] font-medium';

/** Replace / remove one element of a list without mutating it. */
function replaceAt<T>(list: T[], index: number, value: T) {
  return list.map((item, i) => (i === index ? value : item));
}
function removeAt<T>(list: T[], index: number) {
  return list.filter((_, i) => i !== index);
}

/** Sections 7-13: how they work, availability, profile content, uploads. */
export function ConsultantPracticeSections({ formData, setFormData, toggleArray }: ConsultantSectionProps) {
  const { sessionFormats: kvSessionFormats } = useMetadata();

  const set = <K extends keyof Consultant>(key: K, value: Consultant[K]) =>
    setFormData(prev => ({ ...prev, [key]: value }));
  const setAvailability = (patch: Partial<Consultant['availabilityPreferences']>) =>
    setFormData(prev => ({ ...prev, availabilityPreferences: { ...(prev.availabilityPreferences || EMPTY_AVAILABILITY), ...patch } }));

  const sessionModes = (formData.sessionModes || []) as string[];
  const faqs = formData.clientFAQs || [];
  const testimonials = formData.testimonials || [];
  const certificates = formData.certificates || [];

  return (
    <>
      {/* ═══════════ SECTION 7: Session Modes & Pricing ═══════════ */}
      <AdminSection title="Session Format & Pricing" description="Available consultation methods and pricing" icon={<Video className="w-5 h-5" />}>
        <div className="flex flex-col gap-6">
          <div>
            <Label className={GROUP_LABEL}>Session Formats</Label>
            <div className="flex flex-wrap gap-4">
              {kvSessionFormats.map(sf => {
                const Ic = SESSION_ICONS[sf.value] || Video;
                const on = sessionModes.includes(sf.value);
                return (
                  <div
                    key={sf.value}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-[var(--radius-md)] border cursor-pointer',
                      on ? 'border-[var(--color-primary-default)] bg-[var(--color-primary-subtle)]' : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]',
                    )}
                    onClick={() => toggleArray('sessionModes', sf.value)}
                  >
                    <Checkbox id={`mode-${sf.value}`} checked={on} onCheckedChange={() => toggleArray('sessionModes', sf.value)} />
                    <Label htmlFor={`mode-${sf.value}`} className="cursor-pointer capitalize flex items-center gap-2">
                      <Ic className="w-4 h-4" /> {sf.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label className={GROUP_LABEL}>Pricing (INR per session)</Label>
            <div className="grid md:grid-cols-3 gap-4">
              {PRICING_FIELDS.map(({ key, label, help }) => (
                <AdminFormField key={key} label={label} helpText={help}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">₹</span>
                    <Input
                      type="number"
                      value={formData.pricing?.[key] || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...(prev.pricing || { video: 0, call: 0, chat: 0 }), [key]: parseInt(e.target.value) || 0 } }))}
                      className={`${FIELD} pl-8`}
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
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Checkbox id="available" checked={formData.available} onCheckedChange={(checked) => set('available', checked as boolean)} />
            <Label htmlFor="available" className="cursor-pointer font-medium">
              Available for booking
            </Label>
          </div>

          <AdminFormField label="Working Hours" helpText="e.g., 10:00 AM - 6:00 PM IST">
            <Input
              value={formData.availabilityPreferences?.workingHours || ''}
              onChange={(e) => setAvailability({ workingHours: e.target.value })}
              placeholder="10:00 AM - 6:00 PM IST"
              className={FIELD}
            />
          </AdminFormField>

          <div>
            <Label className={GROUP_LABEL}>Days Available</Label>
            <div className="flex flex-wrap gap-3">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = formData.availabilityPreferences?.daysAvailable?.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const current = formData.availabilityPreferences?.daysAvailable || [];
                      setAvailability({ daysAvailable: current.includes(day) ? current.filter(d => d !== day) : [...current, day] });
                    }}
                    className={cn(
                      'px-4 py-2 rounded-[var(--radius-md)] border transition-all text-sm font-medium cursor-pointer',
                      isSelected
                        ? 'border-[var(--color-primary-default)] bg-[var(--color-primary-default)] text-[var(--color-primary-on)]'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]',
                    )}
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
              onCheckedChange={(checked) => setAvailability({ weekendAvailability: checked })}
            />
            <Label htmlFor="weekend-avail" className="text-sm">Available on weekends</Label>
          </div>
        </div>
      </AdminSection>

      {/* ═══════════ SECTION 9: Therapeutic Philosophy ═══════════ */}
      <AdminSection title="Therapeutic Philosophy" description="Guiding principles or philosophies in their practice" icon={<Heart className="w-5 h-5" />}>
        <Textarea
          value={formData.therapeuticPhilosophy || ''}
          onChange={(e) => set('therapeuticPhilosophy', e.target.value)}
          placeholder="Describe the therapist's guiding philosophy, values, and core beliefs about therapy..."
          className={`min-h-[100px] ${AREA}`}
        />
      </AdminSection>

      {/* ═══════════ SECTION 10: Client FAQs ═══════════ */}
      <AdminSection
        title="Common Client FAQs"
        description="Questions and answers that will be displayed on the therapist's profile"
        icon={<CircleHelp className="w-5 h-5" />}
        badge={<Badge variant="secondary" className={COUNT_BADGE}>{faqs.length}</Badge>}
      >
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div key={index} className={CARD}>
              <div className="flex items-start justify-between mb-3">
                <span className={CARD_LABEL}>FAQ #{index + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => set('clientFAQs', removeAt(faqs, index))} className={REMOVE_ICON}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                <Input
                  value={faq.question}
                  onChange={(e) => set('clientFAQs', replaceAt(faqs, index, { ...faq, question: e.target.value }))}
                  placeholder="e.g., Do you see individuals, couples, or families?"
                  className={FIELD}
                />
                <Textarea
                  value={faq.answer}
                  onChange={(e) => set('clientFAQs', replaceAt(faqs, index, { ...faq, answer: e.target.value }))}
                  placeholder="Answer to the question..."
                  className={`min-h-[80px] ${AREA}`}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => set('clientFAQs', [...faqs, { question: '', answer: '' }])} className={ADD_BUTTON}>
              <Plus className="w-4 h-4" /> Add FAQ
            </Button>
            {faqs.length === 0 && (
              <Button variant="outline" onClick={() => set('clientFAQs', SUGGESTED_FAQS.map(f => ({ ...f })))} className={ADD_BUTTON}>
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
        badge={<Badge variant="secondary" className={COUNT_BADGE}>{testimonials.length}</Badge>}
      >
        <div className="flex flex-col gap-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={CARD}>
              <div className="flex items-start justify-between mb-3">
                <span className={CARD_LABEL}>Testimonial #{index + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => set('testimonials', removeAt(testimonials, index))} className={REMOVE_ICON}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                <Textarea
                  value={testimonial.text}
                  onChange={(e) => set('testimonials', replaceAt(testimonials, index, { ...testimonial, text: e.target.value }))}
                  placeholder="Client testimonial text..."
                  className={`min-h-[80px] ${AREA}`}
                />
                <Input
                  value={testimonial.clientName}
                  onChange={(e) => set('testimonials', replaceAt(testimonials, index, { ...testimonial, clientName: e.target.value }))}
                  placeholder="Client name (or anonymous)"
                  className={FIELD}
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={() => set('testimonials', [...testimonials, { text: '', clientName: '' }])} className={`self-start ${ADD_BUTTON}`}>
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
            onCheckedChange={(checked) => set('willingToShareArticles', checked)}
          />
          <Label htmlFor="willing-articles" className="text-sm">
            Willing to share articles to be published on our site
          </Label>
        </div>
      </AdminSection>

      {/* ═══════════ SECTION 13: Uploads ═══════════ */}
      <AdminSection title="Uploads & Verification" description="Photo, video introduction, and certificates for verification" icon={<Upload className="w-5 h-5" />}>
        <div className="flex flex-col gap-6">
          <AdminFormField label="Video Introduction URL" helpText="YouTube, Vimeo, or direct video link">
            <Input
              value={formData.videoIntroUrl || ''}
              onChange={(e) => set('videoIntroUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={FIELD}
            />
          </AdminFormField>

          <div>
            <Label className={GROUP_LABEL}>Certificates for Verification</Label>
            <div className="flex flex-col gap-3">
              {certificates.map((cert, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    value={cert}
                    onChange={(e) => set('certificates', replaceAt(certificates, index, e.target.value))}
                    placeholder="Certificate image/document URL"
                    className={`flex-1 ${FIELD}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => set('certificates', removeAt(certificates, index))} className="shrink-0 text-[var(--color-status-danger)]">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => set('certificates', [...certificates, ''])} className={`self-start ${ADD_BUTTON}`}>
                <Plus className="w-4 h-4" /> Add Certificate
              </Button>
            </div>
          </div>
        </div>
      </AdminSection>
    </>
  );
}
