import type React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

interface UnifiedBasicInfoFormProps {
  // Common fields
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  isPremium?: boolean;
  price?: number;
  
  // Handlers
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onIsPremiumChange?: (value: boolean) => void;
  onPriceChange?: (value: number) => void;
  
  // Configuration
  config: {
    titleLabel?: string; // Default: "Title"
    descriptionLabel?: string; // Default: "Description"
    categoryLabel?: string; // Default: "Category"
    durationLabel?: string; // Default: "Duration"
    durationUnit?: string; // "minutes" or "days"
    imageLabel?: string; // "Cover Image" or "Assessment Image"
    subtitle?: string; // Description text below title
    categories?: Array<{ value: string; label: string }>;
    showAssessmentType?: boolean; // Assessment-specific
    assessmentType?: string;
    onAssessmentTypeChange?: (value: string) => void;
    showPaywall?: boolean; // Show paywall toggle
  };
  
  // Image upload section (render prop pattern)
  renderImageSection?: () => React.ReactNode;
}

export function UnifiedBasicInfoForm({
  title,
  description,
  category,
  difficulty,
  duration,
  isPremium = false,
  price = 0,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onDifficultyChange,
  onDurationChange,
  onIsPremiumChange,
  onPriceChange,
  config,
  renderImageSection
}: UnifiedBasicInfoFormProps) {
  const {
    titleLabel = 'Title',
    descriptionLabel = 'Description',
    categoryLabel = 'Category',
    durationLabel = 'Duration',
    durationUnit = 'minutes',
    imageLabel = 'Cover Image',
    subtitle = 'Configure basic details',
    categories = [
      { value: 'wellness', label: 'Wellness' },
      { value: 'mental-health', label: 'Mental Health' },
      { value: 'stress', label: 'Stress' },
      { value: 'anxiety', label: 'Anxiety' },
      { value: 'depression', label: 'Depression' },
      { value: 'sleep', label: 'Sleep' },
      { value: 'relationships', label: 'Relationships' }
    ],
    showAssessmentType = false,
    assessmentType = 'standard',
    onAssessmentTypeChange,
    showPaywall = false
  } = config;

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="space-y-8">
      {/* Title (Full Width) */}
      <div className="space-y-2">
        <Label>{titleLabel} *</Label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={`Enter ${titleLabel.toLowerCase()}...`}
        />
      </div>

      {/* Description (Full Width) */}
      <div className="space-y-2">
        <Label>{descriptionLabel} *</Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={`Enter ${descriptionLabel.toLowerCase()}...`}
          className="min-h-[120px] resize-none"
          style={{ 
            borderRadius: 'var(--ikan-component-border-radius)', 
            padding: '16px',
            border: '1px solid var(--color-border-default)'
          }}
        />
      </div>

      {/* Two Column Layout: Category + Difficulty */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label>{categoryLabel} *</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-[52px]" style={{ borderRadius: 'var(--radius-lg)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Difficulty Level</Label>
          <Select value={difficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger className="h-[52px]" style={{ borderRadius: 'var(--radius-lg)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficultyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Two Column Layout: Assessment Type (if needed) + Duration */}
      <div className="grid grid-cols-2 gap-8">
        {showAssessmentType && (
          <div className="space-y-2">
            <Label>Assessment Type</Label>
            <Select value={assessmentType} onValueChange={onAssessmentTypeChange}>
              <SelectTrigger className="h-[52px]" style={{ borderRadius: 'var(--radius-lg)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Assessment</SelectItem>
                <SelectItem value="clinical">Clinical Screening</SelectItem>
                <SelectItem value="self-reflection">Self Reflection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className={`space-y-2 ${showAssessmentType ? '' : 'col-span-2'}`}>
          <Label>
            {durationLabel} ({durationUnit}) *
          </Label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => onDurationChange(parseInt(e.target.value) || 0)}
            placeholder={`Enter ${durationUnit}...`}
            min="1"
          />
        </div>
      </div>

      {/* Image Section */}
      {renderImageSection && (
        <div className="space-y-2 pt-4">
          <Label>{imageLabel}</Label>
          {renderImageSection()}
        </div>
      )}

      {/* Paywall Section */}
      {showPaywall && (
        <div className="border p-6" style={{ backgroundColor: 'var(--color-bg-muted)', borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              id="premium-toggle"
              checked={isPremium}
              onCheckedChange={(value) => onIsPremiumChange?.(value as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="premium-toggle" className="cursor-pointer">
                <span style={{ fontWeight: 500, fontSize: 'var(--text-base)' }}>
                  Premium Content (Paywall)
                </span>
              </Label>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                Require subscription to access
              </p>
            </div>
          </div>
          
          {/* Price input */}
          {isPremium && (
            <div className="pl-8 flex items-center gap-4">
              <Label htmlFor="price-input" style={{ fontSize: 'var(--text-sm)', minWidth: '80px' }}>
                Price (INR)
              </Label>
              <div className="flex items-center gap-2 max-w-[200px]">
                <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)' }}>₹</span>
                <Input
                  id="price-input"
                  type="number"
                  value={price}
                  onChange={(e) => onPriceChange?.(parseInt(e.target.value) || 0)}
                  placeholder="299"
                  min="0"
                  step="1"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}