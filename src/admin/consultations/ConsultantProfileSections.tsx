import type React from 'react';
import { User, Briefcase, Languages, GraduationCap, Heart, Users, Plus, X } from 'lucide-react';
import { AdminSection } from '../shell/AdminSection';
import { AdminFormField } from '../ui/kit/AdminFormField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ImageUpload } from '../ui/image-upload';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useMetadata } from '../ui/hooks/useMetadata';
import {
  type Consultant,
  type ConsultantSectionProps,
  FIELD,
  AREA,
  CHECK_LABEL,
  COUNT_BADGE,
} from './consultant-form';

/** A grid of checkboxes bound to one string-array field. */
function CheckboxGrid({ idPrefix, field, options, gridClass, formData, toggleArray }: {
  idPrefix: string;
  field: keyof Consultant;
  options: string[];
  gridClass: string;
} & Pick<ConsultantSectionProps, 'formData' | 'toggleArray'>) {
  const selected = (formData[field] as string[] | undefined) || [];
  return (
    <div className={gridClass}>
      {options.map((opt) => (
        <div key={opt} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
          <Checkbox id={`${idPrefix}-${opt}`} checked={selected.includes(opt)} onCheckedChange={() => toggleArray(field, opt)} />
          <Label htmlFor={`${idPrefix}-${opt}`} className={CHECK_LABEL}>{opt}</Label>
        </div>
      ))}
    </div>
  );
}

/** Text input that adds its value to a list on Enter and/or blur. */
function AddCustomInput({ placeholder, onAdd, onEnter = true }: { placeholder: string; onAdd: (value: string) => void; onEnter?: boolean }) {
  return (
    <Input
      placeholder={placeholder}
      className={FIELD}
      onKeyDown={onEnter ? (e: React.KeyboardEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        if (e.key === 'Enter' && input.value.trim()) {
          onAdd(input.value.trim());
          input.value = '';
        }
      } : undefined}
      onBlur={(e) => {
        if (e.target.value.trim()) {
          onAdd(e.target.value.trim());
          e.target.value = '';
        }
      }}
    />
  );
}

/** Sections 1-6: who the professional is and what they work on. */
export function ConsultantProfileSections({ formData, setFormData, errors, toggleArray }: ConsultantSectionProps) {
  const {
    consultantTypes,
    languages: kvLanguages,
    therapeuticApproaches: kvTherapeuticApproaches,
    demographicSpecialties: kvDemographicSpecialties,
    expertiseCategories: kvExpertiseCategories,
  } = useMetadata();

  const set = <K extends keyof Consultant>(key: K, value: Consultant[K]) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const qualifications = formData.qualifications || [];
  const setQualifications = (next: string[]) => set('qualifications', next);

  return (
    <>
      {/* ═══════════ SECTION 1: Basic Information ═══════════ */}
      <AdminSection title="Basic Information" description="Core details about the mental health professional" icon={<User className="w-5 h-5" />}>
        <div className="grid md:grid-cols-2 gap-6">
          <AdminFormField label="Full Name" required error={errors.name}>
            <Input value={formData.name} onChange={(e) => set('name', e.target.value)} placeholder="Dr. Jane Doe" className={FIELD} />
          </AdminFormField>

          <AdminFormField label="Credentials" required error={errors.credentials} helpText="Primary credential or title">
            <Input value={formData.credentials} onChange={(e) => set('credentials', e.target.value)} placeholder="Ph.D., Clinical Psychologist" className={FIELD} />
          </AdminFormField>

          <AdminFormField label="Category" required>
            <Select value={formData.category} onValueChange={(v: string) => set('category', v)}>
              <SelectTrigger className={FIELD}><SelectValue /></SelectTrigger>
              <SelectContent>
                {consultantTypes.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminFormField>

          <AdminFormField label="Years of Experience" required error={errors.yearsExperience} helpText="Total years practicing">
            <Input type="number" value={formData.yearsExperience} onChange={(e) => set('yearsExperience', parseInt(e.target.value) || 0)} min="0" max="60" className={FIELD} />
          </AdminFormField>

          <AdminFormField label="Location" required error={errors.location}>
            <Input value={formData.location} onChange={(e) => set('location', e.target.value)} placeholder="Mumbai, India" className={FIELD} />
          </AdminFormField>

          <AdminFormField label="Photo" helpText="Professional headshot or avatar">
            <ImageUpload value={formData.photo} onChange={(url) => set('photo', url)} placeholder="https://..." aspectRatio="square" />
          </AdminFormField>
        </div>

        <div className="mt-6">
          <AdminFormField label="Brief Introduction" required error={errors.bio} description="Tell potential clients about the professional's background and approach">
            <Textarea
              value={formData.bio}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Write a compelling bio highlighting education, experience, and therapeutic approach..."
              className={`min-h-[120px] ${AREA}`}
            />
          </AdminFormField>
        </div>
      </AdminSection>

      {/* ═══════════ SECTION 2: Languages Spoken ═══════════ */}
      <AdminSection title="Languages Spoken" description="Languages in which they can conduct therapy" icon={<Languages className="w-5 h-5" />}>
        <CheckboxGrid idPrefix="lang" field="languages" options={kvLanguages.map(e => e.label)} gridClass="grid grid-cols-2 md:grid-cols-4 gap-3" formData={formData} toggleArray={toggleArray} />
        <div className="mt-3">
          <AdminFormField label="Other Languages" helpText="Comma-separated if not in list above">
            <AddCustomInput
              placeholder="e.g., French, Mandarin"
              onEnter={false}
              onAdd={(value) => {
                const extras = value.split(',').map(l => l.trim()).filter(Boolean);
                const current = formData.languages || [];
                set('languages', [...new Set([...current, ...extras])]);
              }}
            />
          </AdminFormField>
        </div>
        {(formData.languages?.length || 0) > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.languages?.map(lang => (
              <Badge key={lang} variant="secondary" className={`gap-1 ${COUNT_BADGE}`}>
                {lang}
                <button onClick={() => toggleArray('languages', lang)} className="ml-1 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </AdminSection>

      {/* ═══════════ SECTION 3: Types of Issues Addressed ═══════════ */}
      <AdminSection title="Types of Issues Addressed" description="Select all areas this professional works with. Custom items can be added." icon={<Briefcase className="w-5 h-5" />}>
        <CheckboxGrid idPrefix="exp" field="expertises" options={kvExpertiseCategories.map(e => e.label)} gridClass="grid md:grid-cols-3 gap-3" formData={formData} toggleArray={toggleArray} />
        <div className="mt-3">
          <AdminFormField label="Add Custom Issue" helpText="Press Enter or blur to add">
            <AddCustomInput placeholder="e.g., Addiction Recovery" onAdd={(v) => toggleArray('expertises', v)} />
          </AdminFormField>
        </div>
      </AdminSection>

      {/* ══════════ SECTION 4: Therapeutic Approaches ═══════════ */}
      <AdminSection title="Therapeutic Approaches Used" description="Modalities and therapeutic frameworks" icon={<Heart className="w-5 h-5" />}>
        <CheckboxGrid idPrefix="approach" field="therapeuticApproaches" options={kvTherapeuticApproaches.map(e => e.label)} gridClass="grid md:grid-cols-2 gap-3" formData={formData} toggleArray={toggleArray} />
        <div className="mt-3">
          <AdminFormField label="Add Custom Approach" helpText="Press Enter to add">
            <AddCustomInput placeholder="e.g., Gestalt Therapy" onAdd={(v) => toggleArray('therapeuticApproaches', v)} />
          </AdminFormField>
        </div>
      </AdminSection>

      {/* ═══════════ SECTION 5: Qualifications ═══════════ */}
      <AdminSection title="Qualifications" description="Degrees, certifications, licenses, and additional training" icon={<GraduationCap className="w-5 h-5" />}>
        <div className="flex flex-col gap-3">
          {qualifications.map((qual, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                value={qual}
                onChange={(e) => setQualifications(qualifications.map((q, i) => (i === index ? e.target.value : q)))}
                placeholder="e.g., Ph.D. Clinical Psychology, University of Mumbai"
                className={`flex-1 ${FIELD}`}
              />
              <Button variant="ghost" size="icon" onClick={() => setQualifications(qualifications.filter((_, i) => i !== index))} className="shrink-0 text-[var(--color-status-danger)]">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setQualifications([...qualifications, ''])} className={`self-start gap-2 ${AREA}`}>
            <Plus className="w-4 h-4" /> Add Qualification
          </Button>
        </div>
      </AdminSection>

      {/* ═══════════ SECTION 6: Demographic Specialties ═══════════ */}
      <AdminSection title="Demographic Specialties" description="Client groups this professional works with" icon={<Users className="w-5 h-5" />}>
        <CheckboxGrid idPrefix="demo" field="demographicSpecialties" options={kvDemographicSpecialties.map(e => e.label)} gridClass="grid grid-cols-2 md:grid-cols-4 gap-3" formData={formData} toggleArray={toggleArray} />
      </AdminSection>
    </>
  );
}
