import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AccountPageHeader } from './AccountPageHeader';
import { Pencil, Save, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import svgPaths from '../../imports/svg-3uwxabhee1';
import { useIsMobile } from '../../hooks/useIsMobile';
import { validateName, validatePhone, validateBio, validateDateOfBirth, validateEmergencyContact } from '../../lib/validation';
import { apiClient } from '../../lib/api-client';

// Icons from Figma Import
const IconProfile = () => (
  <svg className="block" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 14 17">
    <path d={svgPaths.p1648d980} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d={svgPaths.p10f71ad0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

const IconConnected = () => (
  <svg className="block" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 19 19">
    <path d={svgPaths.p153df420} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d={svgPaths.p2492e780} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

const IconPersonal = () => (
  <svg className="block" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 19 19">
    <path d={svgPaths.p13f1f900} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d={svgPaths.p269e4d00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d={svgPaths.p1250efa0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

const IconEmergency = () => (
  <svg className="block" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 19 19">
    <path d={svgPaths.p3e9de980} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

const IconGoogle = () => (
  <svg className="block" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 18 19">
    {/* Google brand colors — mandated by brand guidelines, must remain as hex */}
    <path d={svgPaths.p188f0580} fill="#4285F4" />
    <path d={svgPaths.p35973300} fill="#34A853" />
    <path d={svgPaths.p217aec00} fill="#FBBC05" />
    <path d={svgPaths.p395080} fill="#EA4335" />
  </svg>
);

const IconLinkedIn = () => (
  <svg className="block" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 20 20">
    {/* LinkedIn brand color — mandated by brand guidelines, must remain as hex */}
    <path d={svgPaths.p72dbc10} fill="#0A66C2" />
  </svg>
);

interface UserAvatarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onAvatarChange?: (file: File) => void;
  onRemoveAvatar?: () => void;
  isEditing?: boolean;
  uploading?: boolean;
}

function UserAvatar({ user, onAvatarChange, isEditing = false, uploading = false }: UserAvatarProps) {
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
    <div className="flex items-center" style={{ gap: '16px' }}>
      <div className="relative shrink-0">
        <Avatar className="border" style={{ width: '80px', height: '80px', borderColor: 'var(--color-border-default)' }}>
          <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
          <AvatarFallback style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)' }}>
            {user?.name ? getInitials(user.name) : 'U'}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>
      
      {isEditing && (
        <div className="relative">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={uploading}
          />
          <button 
            className="flex items-center justify-center px-4 py-[6px] rounded-[40px] bg-transparent transition-colors disabled:opacity-50"
            style={{ border: '1px solid var(--color-text-primary)', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Update'}
          </button>
        </div>
      )}
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
  onDeleteProfile?: () => void;
  onSocialSync?: (provider: 'google' | 'linkedin', action: 'connect' | 'disconnect') => Promise<void>;
  editable?: boolean;
  loading?: boolean;
  className?: string;
  onBack?: () => void;
  isEditing?: boolean;
  setIsEditing?: (editing: boolean) => void;
}

export function AccountDetailsSection({
  user,
  onSave,
  onSocialSync,
  onDeleteProfile,
  loading = false,
  className,
  editable = true,
  onBack,
  isEditing: externalIsEditing,
  setIsEditing: externalSetIsEditing
}: AccountDetailsSectionProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsEditing = externalSetIsEditing || setInternalIsEditing;
  const isMobile = useIsMobile();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | undefined>(user?.avatar);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    location: user?.location || '',
    city: user?.location ? user.location.split(',')[0].trim() : '',
    zipCode: '', 
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      phone: user?.emergencyContact?.phone || '',
      relationship: user?.emergencyContact?.relationship || ''
    },
    preferences: user?.preferences
  });

  // Inline validation errors keyed by field name
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sync formData when user prop changes
  React.useEffect(() => {
    if (!isEditing && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        location: user.location || '',
        city: user.location ? user.location.split(',')[0].trim() : '',
        zipCode: '',
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          phone: user.emergencyContact?.phone || '',
          relationship: user.emergencyContact?.relationship || ''
        },
        preferences: user.preferences
      });
      setFieldErrors({});
    }
    if (user?.avatar) {
      setLocalAvatarUrl(user.avatar);
    }
  }, [user, isEditing]);

  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarUploading(true);
      const result = await apiClient.uploadAvatar(file);
      if (result.avatarUrl) {
        setLocalAvatarUrl(result.avatarUrl);
        console.log('Avatar uploaded successfully:', result.avatarUrl);
      }
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    const nameErr = validateName(formData.name);
    if (nameErr) errors.name = nameErr.message;
    
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errors.phone = phoneErr.message;
    
    const bioErr = validateBio(formData.bio);
    if (bioErr) errors.bio = bioErr.message;
    
    const dobErr = validateDateOfBirth(formData.dateOfBirth);
    if (dobErr) errors.dateOfBirth = dobErr.message;
    
    const ecErrors = validateEmergencyContact(formData.emergencyContact);
    ecErrors.forEach(e => { errors[e.field] = e.message; });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const updatedData = {
      ...formData,
      location: `${formData.city}${formData.zipCode ? `, ${formData.zipCode}` : ''}`
    };
    onSave?.(updatedData);
  };

  // Shared styles
  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 'var(--font-weight-medium)' as any,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-base)',
    lineHeight: '18px',
    display: 'block',
    marginBottom: '6px'
  };

  const inputStyle: React.CSSProperties = {
    height: '44px',
    borderRadius: '12px',
    border: '1px solid var(--color-border-default)',
    padding: '12px 16px 12px 40px',
    fontSize: '14px',
    fontFamily: 'var(--font-family-base)',
    fontWeight: 'var(--font-weight-regular)' as any,
    color: 'var(--color-text-primary)',
    backgroundColor: 'transparent',
    width: '100%',
    outline: 'none'
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: '16px',
    border: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-bg-card)',
    boxShadow: 'none',
    overflow: 'hidden'
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'var(--font-weight-medium)' as any,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-base)',
    lineHeight: '22px',
    margin: 0
  };

  // Helper for input icons
  const InputIcon = ({ path }: { path: string }) => (
    <div className="absolute flex items-center justify-center pointer-events-none z-10" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px' }}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 16 16">
        <path d={path} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
      </svg>
    </div>
  );

  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="m-0" style={{ fontSize: '12px', marginTop: '4px', color: 'var(--color-status-danger)', fontFamily: 'var(--font-family-base)' }}>{error}</p>;
  };

  // Desktop header
  const renderHeader = () => {
    if (isMobile) return null;
    return (
      <AccountPageHeader 
        title="My Profile" 
        subtitle="Track your journey and see how far have you come."
        onBack={onBack}
        actions={
          <>
            {isEditing ? (
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center h-auto"
                style={{ 
                  backgroundColor: 'var(--color-primary-default)', 
                  color: 'var(--color-text-inverse)', 
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-medium)' as any,
                  fontFamily: 'var(--font-family-base)',
                  gap: '8px',
                  border: 'none'
                }}
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                disabled={!editable}
                className="flex items-center h-auto"
                style={{ 
                  backgroundColor: 'var(--color-primary-default)', 
                  color: 'var(--color-text-inverse)', 
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-medium)' as any,
                  fontFamily: 'var(--font-family-base)',
                  gap: '8px',
                  border: 'none'
                }}
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
            <Button
              className="flex items-center h-auto"
              style={{ 
                backgroundColor: 'var(--color-status-danger)', 
                color: 'var(--color-text-inverse)', 
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-medium)' as any,
                fontFamily: 'var(--font-family-base)',
                gap: '8px',
                border: 'none'
              }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Profile
            </Button>
          </>
        }
      />
    );
  };

  const isGoogleConnected = user?.connectedAccounts?.google?.connected || false;
  const isLinkedInConnected = user?.connectedAccounts?.linkedin?.connected || false;

  return (
    <div className={cn("w-full", className)}>
      {renderHeader()}

      <div className="flex flex-col" style={{ gap: '24px' }}>
        {/* 1. Profile Information */}
        <Card className="shadow-none p-0" style={cardStyle}>
          <div className="flex items-center" style={{ padding: '24px 24px 0 24px', gap: '12px' }}>
            <IconProfile />
            <h2 style={cardTitleStyle}>Profile Information</h2>
          </div>
          <CardContent className="p-0" style={{ padding: '16px 24px 24px 24px' }}>
            <UserAvatar 
              user={{ ...user!, avatar: localAvatarUrl }}
              isEditing={isEditing}
              uploading={avatarUploading}
              onAvatarChange={handleAvatarUpload}
            />
            
            <div className="flex flex-col" style={{ gap: '16px', marginTop: '24px' }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <div className="relative">
                  <InputIcon path={svgPaths.p30a1bda0} />
                  <input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    style={inputStyle}
                    placeholder="Full Name"
                    disabled={!isEditing}
                  />
                </div>
                <FieldError error={fieldErrors.name} />
              </div>

              {/* Email Address */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <div className="relative">
                  <InputIcon path={svgPaths.p1db90b80} />
                  <input
                    value={formData.email}
                    style={{ ...inputStyle, color: 'var(--color-text-muted)' }}
                    placeholder="Email Address"
                    disabled={true}
                    title="Email cannot be changed here. Contact support if needed."
                  />
                </div>
                {isEditing && (
                  <p className="m-0" style={{ fontSize: '12px', marginTop: '4px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
                    To change your email, go to Security settings.
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label style={labelStyle}>Phone Number</label>
                <div className="relative">
                  <InputIcon path={svgPaths.p26187580} />
                  <input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={inputStyle}
                    placeholder="Phone Number"
                    disabled={!isEditing}
                  />
                </div>
                <FieldError error={fieldErrors.phone} />
              </div>

              {/* Bio */}
              <div>
                <label style={labelStyle}>Bio</label>
                <div className="relative">
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-transparent focus:ring-0 focus:outline-none"
                    style={{ 
                      borderRadius: '12px',
                      border: '1px solid var(--color-border-default)',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-regular)' as any,
                      minHeight: '44px',
                      resize: 'vertical'
                    }}
                    disabled={!isEditing}
                  />
                </div>
                <FieldError error={fieldErrors.bio} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Connected Accounts */}
        <Card className="shadow-none p-0" style={cardStyle}>
          <div className="flex items-center" style={{ padding: '24px 24px 0 24px', gap: '12px' }}>
            <IconConnected />
            <h2 style={cardTitleStyle}>Connected Accounts</h2>
          </div>
          <CardContent className="p-0" style={{ padding: '16px 24px 24px 24px' }}>
            <div className={cn("flex", isMobile ? "flex-col" : "flex-row")} style={{ gap: '16px' }}>
              {/* LinkedIn */}
              <div className="flex-1 flex items-center justify-between" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-border-default)' }}>
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <IconLinkedIn />
                  <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' as any, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
                    LinkedIn
                  </span>
                </div>
                <button
                  onClick={() => onSocialSync?.('linkedin', isLinkedInConnected ? 'disconnect' : 'connect')}
                  className="shrink-0"
                  style={{ 
                    fontSize: '13px',
                    fontWeight: 'var(--font-weight-medium)' as any,
                    color: isLinkedInConnected ? 'var(--color-status-danger)' : 'var(--color-primary-default)',
                    fontFamily: 'var(--font-family-base)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  {isLinkedInConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
              {/* Google */}
              <div className="flex-1 flex items-center justify-between" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-border-default)' }}>
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <IconGoogle />
                  <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' as any, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
                    Google
                  </span>
                </div>
                <button
                  onClick={() => onSocialSync?.('google', isGoogleConnected ? 'disconnect' : 'connect')}
                  className="shrink-0"
                  style={{ 
                    fontSize: '13px',
                    fontWeight: 'var(--font-weight-medium)' as any,
                    color: isGoogleConnected ? 'var(--color-status-danger)' : 'var(--color-primary-default)',
                    fontFamily: 'var(--font-family-base)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  {isGoogleConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Personal Details */}
        <Card className="shadow-none p-0" style={cardStyle}>
          <div className="flex items-center" style={{ padding: '24px 24px 0 24px', gap: '12px' }}>
            <IconPersonal />
            <h2 style={cardTitleStyle}>Personal Details</h2>
          </div>
          <CardContent className="p-0" style={{ padding: '16px 24px 24px 24px' }}>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              {/* Row 1: DOB | Gender */}
              <div className={cn("grid", isMobile ? "grid-cols-1" : "grid-cols-2")} style={{ gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <div className="relative">
                    <InputIcon path={svgPaths.p39ee6532} />
                    <input
                      type={isEditing ? "date" : "text"}
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      style={inputStyle}
                      placeholder="Date of Birth"
                      disabled={!isEditing}
                    />
                  </div>
                  <FieldError error={fieldErrors.dateOfBirth} />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger 
                      className="w-full"
                      style={{ 
                        height: '44px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border-default)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontFamily: 'var(--font-family-base)',
                        backgroundColor: 'transparent',
                        color: formData.gender ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
                      }}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: City | Zip Code */}
              <div className={cn("grid", isMobile ? "grid-cols-1" : "grid-cols-2")} style={{ gap: '16px' }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <div className="relative">
                    <InputIcon path={svgPaths.p14548f00} />
                    <input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      style={inputStyle}
                      placeholder="City"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Zip Code</label>
                  <div className="relative">
                    <InputIcon path={svgPaths.p14548f00} />
                    <input
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      style={inputStyle}
                      placeholder="Zip Code"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Emergency Contact */}
        <Card className="shadow-none p-0" style={cardStyle}>
          <div className="flex items-center" style={{ padding: '24px 24px 0 24px', gap: '12px' }}>
            <IconEmergency />
            <h2 style={cardTitleStyle}>Emergency Contact</h2>
          </div>
          <CardContent className="p-0" style={{ padding: '16px 24px 24px 24px' }}>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              {/* Row 1: Contact Name | Contact Phone */}
              <div className={cn("grid", isMobile ? "grid-cols-1" : "grid-cols-2")} style={{ gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Contact Name</label>
                  <div className="relative">
                    <InputIcon path={svgPaths.p30a1bda0} />
                    <input
                      value={formData.emergencyContact.name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, name: e.target.value } }));
                        if (fieldErrors.emergencyContactName) setFieldErrors(prev => { const n = { ...prev }; delete n.emergencyContactName; return n; });
                      }}
                      style={inputStyle}
                      placeholder="Full name"
                      disabled={!isEditing}
                    />
                  </div>
                  <FieldError error={fieldErrors.emergencyContactName} />
                </div>
                <div>
                  <label style={labelStyle}>Contact Phone</label>
                  <div className="relative">
                    <InputIcon path={svgPaths.p26187580} />
                    <input
                      value={formData.emergencyContact.phone}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, phone: e.target.value } }));
                        if (fieldErrors.emergencyContactPhone) setFieldErrors(prev => { const n = { ...prev }; delete n.emergencyContactPhone; return n; });
                      }}
                      style={inputStyle}
                      placeholder="Phone number"
                      disabled={!isEditing}
                    />
                  </div>
                  <FieldError error={fieldErrors.emergencyContactPhone} />
                </div>
              </div>

              {/* Row 2: Relationship (full width) */}
              <div>
                <label style={labelStyle}>Relationship</label>
                <div className="relative">
                  <InputIcon path={svgPaths.p1f890f80} />
                  <input
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, relationship: e.target.value } }));
                      if (fieldErrors.emergencyContactRelationship) setFieldErrors(prev => { const n = { ...prev }; delete n.emergencyContactRelationship; return n; });
                    }}
                    style={inputStyle}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    disabled={!isEditing}
                  />
                </div>
                <FieldError error={fieldErrors.emergencyContactRelationship} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-medium">Confirm Delete</h3>
            </div>
            <p className="text-sm text-gray-500">Are you sure you want to delete your profile? This action is irreversible.</p>
            <div className="flex justify-end mt-4">
              <Button
                className="mr-2"
                style={{ 
                  backgroundColor: 'var(--color-status-danger)', 
                  color: 'var(--color-text-inverse)', 
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-medium)' as any,
                  fontFamily: 'var(--font-family-base)',
                  gap: '8px',
                  border: 'none'
                }}
                onClick={() => {
                  onDeleteProfile?.();
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </Button>
              <Button
                style={{ 
                  backgroundColor: 'var(--color-bg-card)', 
                  color: 'var(--color-text-primary)', 
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-medium)' as any,
                  fontFamily: 'var(--font-family-base)',
                  gap: '8px',
                  border: 'none'
                }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}