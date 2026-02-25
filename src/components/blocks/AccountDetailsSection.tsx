import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AccountPageHeader } from './AccountPageHeader';
import { Pencil, Save, Trash2, Loader2 } from 'lucide-react';
import svgPaths from '../../imports/svg-3uwxabhee1';
import { useIsMobile } from '../../hooks/useIsMobile';
import { validateName, validatePhone, validateBio, validateDateOfBirth, validateEmergencyContact } from '../../lib/validation';
import { apiClient } from '../../lib/api-client';

// Icons from Figma Import
const IconProfile = () => (
  <svg className="block w-5 h-5" fill="none" viewBox="0 0 14 17">
    <path d={svgPaths.p1648d980} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d={svgPaths.p10f71ad0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

const IconConnected = () => (
  <svg className="block w-5 h-5" fill="none" viewBox="0 0 19 19">
    <path d={svgPaths.p153df420} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d={svgPaths.p2492e780} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

const IconPersonal = () => (
  <svg className="block w-5 h-5" fill="none" viewBox="0 0 19 19">
    <path d={svgPaths.p13f1f900} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d={svgPaths.p269e4d00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d={svgPaths.p1250efa0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

const IconEmergency = () => (
  <svg className="block w-5 h-5" fill="none" viewBox="0 0 19 19">
    <path d={svgPaths.p3e9de980} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

const IconGoogle = () => (
  <svg className="block w-5 h-5" fill="none" viewBox="0 0 18 19">
    <path d={svgPaths.p188f0580} fill="#4285F4" />
    <path d={svgPaths.p35973300} fill="#34A853" />
    <path d={svgPaths.p217aec00} fill="#FBBC05" />
    <path d={svgPaths.p395080} fill="#EA4335" />
  </svg>
);

const IconLinkedIn = () => (
  <svg className="block w-5 h-5" fill="none" viewBox="0 0 20 20">
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

function UserAvatar({ user, onAvatarChange, onRemoveAvatar, isEditing = false, uploading = false }: UserAvatarProps) {
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
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <Avatar className="w-[89px] h-[89px] border" style={{ borderColor: 'var(--color-border-default)' }}>
          <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
          <AvatarFallback className="text-[20px] font-medium tracking-[-0.45px]" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)' }}>
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
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={uploading}
            />
            <button 
              className="flex items-center justify-center px-4 py-[6px] rounded-[40px] bg-transparent text-sm font-medium transition-colors disabled:opacity-50"
              style={{ border: '1px solid var(--color-text-primary)', color: 'var(--color-text-primary)' }}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Update'}
            </button>
          </div>
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

  // Sync formData when user prop changes (e.g., after background profile fetch)
  // Only sync when NOT in edit mode to avoid overwriting user's in-progress edits
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
      // Clear any stale validation errors when exiting edit mode
      setFieldErrors({});
    }
    // Also keep avatar URL in sync
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
    // Clear error for this field on change
    if (fieldErrors[field]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  // Validate all fields and return true if valid
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
    // Don't setIsEditing(false) here — let the parent handle it after successful save
  };

  // Only render headers on Desktop, Mobile has sticky header
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
                className="px-[20px] py-[10px] text-[14px] font-medium h-auto flex items-center gap-2"
                style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-xs)' }}
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                disabled={!editable}
                className="px-[20px] py-[10px] text-[14px] font-medium h-auto flex items-center gap-2"
                style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-xs)' }}
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
            <Button
              variant="destructive"
              className="px-[20px] py-[10px] text-[14px] font-medium h-auto flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)', borderRadius: 'var(--radius-xs)' }}
            >
              <Trash2 className="w-4 h-4" />
              Delete Profile
            </Button>
          </>
        }
      />
    );
  };

  // Common Input Styles for Mobile consistency
  const inputContainerClass = "h-[56px] w-full relative";
  const inputClass = "bg-transparent border-none h-full w-full pl-[40px] pr-[12px] py-[12px] text-[16px] tracking-[-0.31px] focus:ring-0 focus:outline-none";
  const labelClass = "text-[16px] font-medium tracking-[-0.3px] mb-[4px]";
  const cardClass = "shadow-none p-0 overflow-hidden border";
  const cardStyle = { borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-lg)' } as React.CSSProperties;
  const cardHeaderClass = "h-[68px] px-[24px] flex items-center gap-[12px]";
  const cardTitleClass = "text-[16px] font-normal tracking-[-0.62px]";
  const inputBorderClass = "absolute inset-0 border pointer-events-none" ;
  const inputBorderStyle = { borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-md)' } as React.CSSProperties;

  // Helper for input icons
  const InputIcon = ({ path }: { path: string }) => (
    <div className="absolute left-[12px] top-[50%] -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center pointer-events-none z-10">
      <svg className="w-full h-full" fill="none" viewBox="0 0 16 16">
        <path d={path} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
      </svg>
    </div>
  );

  return (
    <div className={cn("w-full", !isMobile && "max-w-[867px]", className)}>
      {renderHeader()}

      <div className={cn("flex flex-col", isMobile ? "gap-[20px] pb-6" : "gap-[24px]")}>
        {/* Profile Information */}
        <Card className={cardClass} style={cardStyle}>
          <div className={cardHeaderClass}>
            <IconProfile />
            <h2 className={cardTitleClass}>Profile Information</h2>
          </div>
          <CardContent className="px-[16px] pb-[24px] pt-0 flex flex-col gap-[24px]">
            <UserAvatar 
              user={{ ...user!, avatar: localAvatarUrl }}
              isEditing={isEditing}
              uploading={avatarUploading}
              onAvatarChange={handleAvatarUpload}
              onRemoveAvatar={() => console.log('Remove avatar')}
            />
            
            <div className="space-y-[16px]">
              <div>
                <label className={labelClass}>Full Name</label>
                <div className={inputContainerClass}>
                  <div className={inputBorderClass} style={inputBorderStyle} />
                  <InputIcon path={svgPaths.p30a1bda0} /> {/* User Icon */}
                  <input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={inputClass}
                    placeholder="Full Name"
                    disabled={!isEditing}
                  />
                </div>
                {fieldErrors.name && <p className="text-[12px] mt-[4px] tracking-[-0.2px]" style={{ color: 'var(--color-status-danger)' }}>{fieldErrors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <div className={inputContainerClass}>
                  <div className={inputBorderClass} style={inputBorderStyle} />
                  <InputIcon path={svgPaths.p1db90b80} /> {/* Mail Icon */}
                  <input
                    value={formData.email}
                    className={inputClass}
                    placeholder="Email Address"
                    disabled={true}
                    title="Email cannot be changed here. Contact support if needed."
                  />
                </div>
                {isEditing && (
                  <p className="text-[12px] mt-[4px] tracking-[-0.2px]" style={{ color: 'var(--color-text-muted)' }}>
                    To change your email, go to Security settings.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <div className={inputContainerClass}>
                  <div className={inputBorderClass} style={inputBorderStyle} />
                  <InputIcon path={svgPaths.p26187580} /> {/* Phone Icon */}
                  <input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={inputClass}
                    placeholder="Phone Number"
                    disabled={!isEditing}
                  />
                </div>
                {fieldErrors.phone && <p className="text-[12px] mt-[4px] tracking-[-0.2px]" style={{ color: 'var(--color-status-danger)' }}>{fieldErrors.phone}</p>}
              </div>

              <div>
                <label className={labelClass}>Bio</label>
                <div className="relative w-full">
                  <div className={inputBorderClass} style={inputBorderStyle} />
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-transparent border-none min-h-[48px] tracking-[-0.31px] text-[16px]"
                    style={{ borderRadius: 'var(--radius-md)' }}
                  />
                </div>
                {fieldErrors.bio && <p className="text-[12px] mt-[4px] tracking-[-0.2px]" style={{ color: 'var(--color-status-danger)' }}>{fieldErrors.bio}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card className={cardClass} style={cardStyle}>
          <div className={cardHeaderClass}>
            <IconConnected />
            <h2 className={cardTitleClass}>Connected Accounts</h2>
          </div>
          <CardContent className="px-[16px] pb-[24px] pt-0">
             <div className="flex gap-[16px] w-full">
                {/* LinkedIn */}
                <button 
                  className="flex-1 h-[56px] flex items-center justify-center gap-[8px]"
                  style={{ borderRadius: 'var(--radius-md)' }}
                  onClick={() => onSocialSync?.('linkedin', 'connect')}
                  disabled={!isEditing}
                >
                  <IconLinkedIn />
                  <span className="text-[16px] font-medium tracking-[-0.31px]" style={{ color: 'var(--color-primary-default)' }}>Connect</span>
                </button>
                {/* Google */}
                <button 
                  className="flex-1 h-[56px] flex items-center justify-center gap-[8px]"
                  style={{ borderRadius: 'var(--radius-md)' }}
                  onClick={() => onSocialSync?.('google', 'connect')}
                  disabled={!isEditing}
                >
                  <IconGoogle />
                  <span className="text-[16px] font-medium tracking-[-0.31px]" style={{ color: 'var(--color-primary-default)' }}>Connect</span>
                </button>
             </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card className={cardClass} style={cardStyle}>
          <div className={cardHeaderClass}>
            <IconPersonal />
            <h2 className={cardTitleClass}>Personal Details</h2>
          </div>
          <CardContent className="px-[16px] pb-[24px] pt-0 flex flex-col gap-[16px]">
            <div className="flex gap-[16px]">
              <div className="flex-1">
                <label className={labelClass}>Date of Birth</label>
                <div className={inputContainerClass}>
                  <div className={inputBorderClass} style={inputBorderStyle} />
                  <InputIcon path={svgPaths.p39ee6532} /> {/* Calendar Icon */}
                   {/* Using text input type for now to match visual placeholder behavior better than date input which varies by browser */}
                  <input
                    type={isEditing ? "date" : "text"}
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={inputClass}
                    placeholder="Date of Birth"
                    disabled={!isEditing}
                  />
                </div>
                {fieldErrors.dateOfBirth && <p className="text-[12px] mt-[4px] tracking-[-0.2px]" style={{ color: 'var(--color-status-danger)' }}>{fieldErrors.dateOfBirth}</p>}
              </div>
              <div className="flex-1">
                <label className={labelClass}>Gender</label>
                <div className="relative h-[56px] w-full">
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="w-full h-[56px] px-[12px]" style={{ backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-[16px]">
              <div className="flex-1">
                <label className={labelClass}>City</label>
                <div className={inputContainerClass}>
                  <div className={inputBorderClass} style={inputBorderStyle} />
                  <InputIcon path={svgPaths.p14548f00} /> {/* Location Icon */}
                  <input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={inputClass}
                    placeholder="City"
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className={labelClass}>Zip Code</label>
                <div className={inputContainerClass}>
                  <div className={inputBorderClass} style={inputBorderStyle} />
                  <InputIcon path={svgPaths.p14548f00} /> {/* Location Icon */}
                  <input
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={inputClass}
                    placeholder="Zip Code"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className={cardClass} style={cardStyle}>
          <div className={cardHeaderClass}>
            <IconEmergency />
            <h2 className={cardTitleClass}>Emergency Contact</h2>
          </div>
          <CardContent className="px-[16px] pb-[24px] pt-0 flex flex-col gap-[16px]">
            <div>
              <label className={labelClass}>Contact Name</label>
              <div className={inputContainerClass}>
                <div className={inputBorderClass} style={inputBorderStyle} />
                <InputIcon path={svgPaths.p30a1bda0} />
                <input
                  value={formData.emergencyContact.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, name: e.target.value } }));
                    if (fieldErrors.emergencyContactName) setFieldErrors(prev => { const n = { ...prev }; delete n.emergencyContactName; return n; });
                  }}
                  className={inputClass}
                  placeholder="Full name"
                  disabled={!isEditing}
                />
              </div>
              {fieldErrors.emergencyContactName && <p className="text-[12px] mt-[4px] tracking-[-0.2px]" style={{ color: 'var(--color-status-danger)' }}>{fieldErrors.emergencyContactName}</p>}
            </div>

            <div>
              <label className={labelClass}>Contact Phone</label>
              <div className={inputContainerClass}>
                <div className={inputBorderClass} style={inputBorderStyle} />
                <InputIcon path={svgPaths.p26187580} />
                <input
                  value={formData.emergencyContact.phone}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, phone: e.target.value } }));
                    if (fieldErrors.emergencyContactPhone) setFieldErrors(prev => { const n = { ...prev }; delete n.emergencyContactPhone; return n; });
                  }}
                  className={inputClass}
                  placeholder="Phone number"
                  disabled={!isEditing}
                />
              </div>
              {fieldErrors.emergencyContactPhone && <p className="text-[12px] mt-[4px] tracking-[-0.2px]" style={{ color: 'var(--color-status-danger)' }}>{fieldErrors.emergencyContactPhone}</p>}
            </div>

            <div>
              <label className={labelClass}>Relationship</label>
              <div className={inputContainerClass}>
                <div className={inputBorderClass} style={inputBorderStyle} />
                <InputIcon path={svgPaths.p1f890f80} /> {/* Users/Relationship Icon */}
                <input
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, relationship: e.target.value } }));
                    if (fieldErrors.emergencyContactRelationship) setFieldErrors(prev => { const n = { ...prev }; delete n.emergencyContactRelationship; return n; });
                  }}
                  className={inputClass}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  disabled={!isEditing}
                />
              </div>
              {fieldErrors.emergencyContactRelationship && <p className="text-[12px] mt-[4px] tracking-[-0.2px]" style={{ color: 'var(--color-status-danger)' }}>{fieldErrors.emergencyContactRelationship}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}