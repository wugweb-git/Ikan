import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { TextInput } from '../inputs/TextInput';
import { Switch } from '../ui/switch';
import { ButtonPrimary } from '../buttons/ButtonPrimary';
import { ButtonSecondary } from '../buttons/ButtonSecondary';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
            className="bg-[var(--color-primary-default)] text-[var(--color-primary-on)] text-lg font-medium"
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
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
          {user?.name || 'User Name'}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          {user?.email || 'user@example.com'}
        </p>
      </div>
    </div>
  );
}

interface AccountDetailsSectionProps {
  user?: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: string;
    location?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    connectedAccounts?: {
      google?: {
        connected: boolean;
        email?: string;
        connectedAt?: string;
      };
      linkedin?: {
        connected: boolean;
        email?: string;
        connectedAt?: string;
      };
    };
    preferences?: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      weeklyReports: boolean;
      moodReminders: boolean;
    };
  };
  onSave?: (userData: any) => void;
  onEdit?: () => void;
  onSocialSync?: (provider: 'google' | 'linkedin', action: 'connect' | 'disconnect') => Promise<void>;
  editable?: boolean;
  loading?: boolean;
  className?: string;
}

export function AccountDetailsSection({
  user,
  onSave,
  onEdit,
  onSocialSync,
  editable = false,
  loading = false,
  className
}: AccountDetailsSectionProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    location: user?.location || '',
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      phone: user?.emergencyContact?.phone || '',
      relationship: user?.emergencyContact?.relationship || ''
    },
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
      bio: user?.bio || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      location: user?.location || '',
      emergencyContact: {
        name: user?.emergencyContact?.name || '',
        phone: user?.emergencyContact?.phone || '',
        relationship: user?.emergencyContact?.relationship || ''
      },
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
        <CardContent className="space-y-6">
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
              leadingIcon="user"
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
              leadingIcon="messageCircle" // best approximation for mail
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
              leadingIcon="phone"
            />

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!editable || loading}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full bg-[var(--color-bg-input)] border-[var(--color-border-default)]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="userCircle" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Date of Birth
              </label>
              <TextInput
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={!editable || loading}
                fullWidth
                leadingIcon="calendar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Gender
              </label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                disabled={!editable || loading}
              >
                <SelectTrigger className="w-full bg-[var(--color-bg-input)] border-[var(--color-border-default)]">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TextInput
            label="Location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            disabled={!editable || loading}
            fullWidth
            placeholder="City, Country"
            leadingIcon="map"
          />
        </CardContent>
      </Card>

      {/* Emergency Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="phone" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextInput
            label="Contact Name"
            value={formData.emergencyContact.name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              emergencyContact: { ...prev.emergencyContact, name: e.target.value }
            }))}
            disabled={!editable || loading}
            fullWidth
            placeholder="Full name"
            leadingIcon="user"
          />

          <TextInput
            label="Contact Phone"
            type="tel"
            value={formData.emergencyContact.phone}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
            }))}
            disabled={!editable || loading}
            fullWidth
            placeholder="Phone number"
            leadingIcon="phone"
          />

          <TextInput
            label="Relationship"
            value={formData.emergencyContact.relationship}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
            }))}
            disabled={!editable || loading}
            fullWidth
            placeholder="e.g., Spouse, Parent, Sibling"
            leadingIcon="users"
          />
        </CardContent>
      </Card>

      {/* Connected Accounts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="link" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Account */}
          <div className="flex items-center justify-between py-3 border-b border-[var(--color-border-default)]">
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-bg-muted)]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Google
                </p>
                {user?.connectedAccounts?.google?.connected ? (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {user.connectedAccounts.google.email}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Not connected
                  </p>
                )}
              </div>
            </div>
            <ButtonSecondary
              onClick={() => onSocialSync?.('google', user?.connectedAccounts?.google?.connected ? 'disconnect' : 'connect')}
              disabled={loading}
              className="h-[var(--ikan-component-button-height)] px-4"
            >
              {user?.connectedAccounts?.google?.connected ? 'Disconnect' : 'Connect'}
            </ButtonSecondary>
          </div>

          {/* LinkedIn Account */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-bg-muted)]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  LinkedIn
                </p>
                {user?.connectedAccounts?.linkedin?.connected ? (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {user.connectedAccounts.linkedin.email}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Not connected
                  </p>
                )}
              </div>
            </div>
            <ButtonSecondary
              onClick={() => onSocialSync?.('linkedin', user?.connectedAccounts?.linkedin?.connected ? 'disconnect' : 'connect')}
              disabled={loading}
              className="h-[var(--ikan-component-button-height)] px-4"
            >
              {user?.connectedAccounts?.linkedin?.connected ? 'Disconnect' : 'Connect'}
            </ButtonSecondary>
          </div>
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