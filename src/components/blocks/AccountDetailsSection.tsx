import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { TextInput } from '../inputs/TextInput';
import { Switch } from '../ui/switch';
import { ButtonPrimary } from '../buttons/ButtonPrimary';
import { ButtonSecondary } from '../buttons/ButtonSecondary';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface UserAvatarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onAvatarChange?: (file: File) => void;
  editable?: boolean;
}

function UserAvatar({ user, onAvatarChange, editable = false }: UserAvatarProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Avatar className="w-24 h-24">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback 
            style={{ 
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            {user?.name ? getInitials(user.name) : 'U'}
          </AvatarFallback>
        </Avatar>
        
        {editable && (
          <>
            <div 
              className={cn(
                "absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center transition-opacity",
                isHovering ? "opacity-100" : "opacity-0"
              )}
            >
              <Icon name="camera" size={24} style={{ color: 'white' }} />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
            />
          </>
        )}
      </div>
      
      <div className="text-center">
        <h3 
          style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}
        >
          {user?.name || 'User Name'}
        </h3>
        <p style={{ 
          fontSize: 'var(--text-sm)', 
          color: 'var(--color-text-muted)'
        }}>
          {user?.email || 'user@example.com'}
        </p>
      </div>
    </div>
  );
}

interface SwitchToggleProps {
  label: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

function SwitchToggle({ 
  label, 
  description, 
  checked = false, 
  onChange, 
  disabled = false 
}: SwitchToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 space-y-1">
        <label 
          style={{ 
            fontSize: 'var(--text-sm)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}
        >
          {label}
        </label>
        {description && (
          <p style={{ 
            fontSize: 'var(--text-xs)', 
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-md)'
          }}>
            {description}
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

interface AccountDetailsSectionProps {
  user?: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    preferences?: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      weeklyReports: boolean;
      moodReminders: boolean;
    };
  };
  onSave?: (userData: any) => void;
  onEdit?: () => void;
  editable?: boolean;
  loading?: boolean;
  className?: string;
}

export function AccountDetailsSection({
  user,
  onSave,
  onEdit,
  editable = false,
  loading = false,
  className
}: AccountDetailsSectionProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    preferences: {
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      pushNotifications: user?.preferences?.pushNotifications ?? true,
      weeklyReports: user?.preferences?.weeklyReports ?? false,
      moodReminders: user?.preferences?.moodReminders ?? true,
    }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState(false);

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        break;
      case 'phone':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) return 'Please enter a valid phone number';
        break;
      default:
        break;
    }
    return null;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePreferenceChange = (preference: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: checked
      }
    }));
    setHasChanges(true);
  };

  const handleInputBlur = (field: string) => {
    const error = validateField(field, formData[field as keyof typeof formData] as string);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSave = () => {
    // Validate all fields
    const newErrors: { [key: string]: string } = {};
    ['name', 'email', 'phone'].forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData] as string);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    // If no errors, save
    if (Object.keys(newErrors).length === 0) {
      onSave?.(formData);
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      preferences: {
        emailNotifications: user?.preferences?.emailNotifications ?? true,
        pushNotifications: user?.preferences?.pushNotifications ?? true,
        weeklyReports: user?.preferences?.weeklyReports ?? false,
        moodReminders: user?.preferences?.moodReminders ?? true,
      }
    });
    setErrors({});
    setHasChanges(false);
  };

  return (
    <div 
      className={cn("w-full space-y-6", className)}
      style={{
        minWidth: 'var(--constraint-content-min)',
        maxWidth: 'var(--constraint-content-max)',
        gap: 'var(--spacing-3)'
      }}
    >
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="user" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6" style={{ gap: 'var(--spacing-3)' }}>
          <UserAvatar 
            user={user}
            editable={editable}
            onAvatarChange={(file) => console.log('Avatar changed:', file)}
          />
          
          <div className="space-y-4">
            <TextInput
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleInputBlur('name')}
              error={errors.name}
              disabled={!editable || loading}
              fullWidth
              style={{
                height: 'var(--ikan-component-input-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontSize: '16px', // Prevents iOS zoom
                fontWeight: 'var(--font-weight-regular)'
              }}
            />

            <TextInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleInputBlur('email')}
              error={errors.email}
              disabled={!editable || loading}
              fullWidth
              style={{
                height: 'var(--ikan-component-input-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontSize: '16px', // Prevents iOS zoom
                fontWeight: 'var(--font-weight-regular)'
              }}
            />

            <TextInput
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onBlur={() => handleInputBlur('phone')}
              error={errors.phone}
              disabled={!editable || loading}
              fullWidth
              placeholder="Optional"
              style={{
                height: 'var(--ikan-component-input-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontSize: '16px', // Prevents iOS zoom
                fontWeight: 'var(--font-weight-regular)'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="settings" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchToggle
            label="Email Notifications"
            description="Receive updates and reminders via email"
            checked={formData.preferences.emailNotifications}
            onChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
            disabled={!editable || loading}
          />

          <SwitchToggle
            label="Push Notifications"
            description="Get mobile notifications for important updates"
            checked={formData.preferences.pushNotifications}
            onChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
            disabled={!editable || loading}
          />

          <SwitchToggle
            label="Weekly Reports"
            description="Receive weekly summaries of your progress"
            checked={formData.preferences.weeklyReports}
            onChange={(checked) => handlePreferenceChange('weeklyReports', checked)}
            disabled={!editable || loading}
          />

          <SwitchToggle
            label="Mood Reminders"
            description="Daily reminders to log your mood"
            checked={formData.preferences.moodReminders}
            onChange={(checked) => handlePreferenceChange('moodReminders', checked)}
            disabled={!editable || loading}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {editable && (
        <div className="flex gap-4 justify-end">
          <ButtonSecondary
            onClick={handleCancel}
            disabled={!hasChanges || loading}
          >
            Cancel
          </ButtonSecondary>
          <ButtonPrimary
            onClick={handleSave}
            disabled={!hasChanges || loading}
            loading={loading}
            leadingIcon="check"
          >
            Save Changes
          </ButtonPrimary>
        </div>
      )}

      {!editable && (
        <div className="flex justify-end">
          <ButtonPrimary
            onClick={onEdit}
            leadingIcon="edit"
          >
            Edit Profile
          </ButtonPrimary>
        </div>
      )}
    </div>
  );
}