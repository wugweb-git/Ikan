import React, { useState } from 'react';
import { Card, CardContent } from '../card';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Button } from '../button';
import { cn } from '../utils';
import { Textarea } from '../textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { AccountPageHeader } from './AccountPageHeader';
import { Pencil, Save, Loader2, User, Mail, Phone, Calendar, MapPin, Hash, UserCheck, PhoneCall, Heart, Users } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import { validateName, validatePhone, validateBio, validateDateOfBirth, validateEmergencyContact } from '../lib/validation';
import { apiClient } from '../../../../shared/api';

// ─── Avatar ────────────────────────────────────────────────────
interface UserAvatarProps {
  user?: { name: string; email: string; avatar?: string };
  onAvatarChange?: (file: File) => void;
  isEditing?: boolean;
  uploading?: boolean;
}

function UserAvatar({ user, onAvatarChange, isEditing = false, uploading = false }: UserAvatarProps) {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const getInitials = (name: string) =>
    name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Please select a valid image (JPEG, PNG, WebP, or GIF).');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('Image must be under 5 MB.');
      return;
    }
    if (onAvatarChange) onAvatarChange(file);
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

// ─── Shared Styles ─────────────────────────────────────────────

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

// ─── Helpers ───────────────────────────────────────────────────

const LucideInputIcon = ({ icon: Icon }: { icon: React.ComponentType<any> }) => (
  <div className="absolute flex items-center justify-center pointer-events-none z-10" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-text-muted)' }}>
    <Icon size={16} />
  </div>
);

const FieldError = ({ error }: { error?: string }) => {
  if (!error) return null;
  return <p className="m-0" style={{ fontSize: '12px', marginTop: '4px', color: 'var(--color-status-danger)', fontFamily: 'var(--font-family-base)' }}>{error}</p>;
};

// ─── Section Card Wrapper with optional Edit button ────────────

function SectionCard({ icon, title, children, onEdit, isEditing, onSave, saving }: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  isEditing?: boolean;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <Card className="shadow-none p-0 gap-0" style={cardStyle}>
      <div className="flex items-center justify-between" style={{ padding: '20px 24px 16px 24px' }}>
        <div className="flex items-center" style={{ gap: '8px' }}>
          <div className="shrink-0 flex items-center justify-center" style={{ color: 'var(--color-text-primary)' }}>
            {icon}
          </div>
          <h2 style={cardTitleStyle}>{title}</h2>
        </div>
        {onEdit && (
          isEditing ? (
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center transition-colors disabled:opacity-50"
              style={{
                gap: '4px', padding: '6px 14px', borderRadius: '8px',
                backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)',
                border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-family-base)',
              }}
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          ) : (
            <button
              onClick={onEdit}
              className="flex items-center transition-colors hover:bg-[var(--color-bg-muted)]"
              style={{
                gap: '4px', padding: '6px 14px', borderRadius: '8px',
                backgroundColor: 'transparent', color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border-default)', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-family-base)',
              }}
            >
              <Pencil size={14} />
              Edit
            </button>
          )
        )}
      </div>
      <CardContent className="p-0" style={{ padding: '0 24px 24px 24px' }}>
        {children}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────

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
    emergencyContact?: { name: string; phone: string; relationship: string };
    connectedAccounts?: {
      google?: { connected: boolean; email?: string; connectedAt?: string };
      linkedin?: { connected: boolean; email?: string; connectedAt?: string };
    };
  };
  onSave?: (userData: any) => void;
  onEdit?: () => void;
  onAvatarUploaded?: (avatarUrl: string) => void;
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
  onAvatarUploaded,
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

  // Track which section is being edited
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    location: user?.location || '',
    city: user?.location ? user.location.split(',')[0].trim() : '',
    zipCode: user?.location && user.location.includes(',') ? user.location.split(',').slice(1).join(',').trim() : '',
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      phone: user?.emergencyContact?.phone || '',
      relationship: user?.emergencyContact?.relationship || ''
    }
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sync formData when user prop changes
  React.useEffect(() => {
    if (!isEditing && editingSection === null && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        location: user.location || '',
        city: user.location ? user.location.split(',')[0].trim() : '',
        zipCode: user.location && user.location.includes(',') ? user.location.split(',').slice(1).join(',').trim() : '',
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          phone: user.emergencyContact?.phone || '',
          relationship: user.emergencyContact?.relationship || ''
        }
      });
      setFieldErrors({});
    }
    if (user?.avatar) {
      setLocalAvatarUrl(user.avatar);
    }
  }, [user, isEditing, editingSection]);

  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarUploading(true);
      const result = await apiClient.uploadAvatar(file);
      if (result.avatarUrl) {
        setLocalAvatarUrl(result.avatarUrl);
        if (onAvatarUploaded) onAvatarUploaded(result.avatarUrl);
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
    setEditingSection(null);
    setIsEditing(false);
  };

  const startEditing = (section: string) => {
    setEditingSection(section);
    setIsEditing(true);
  };

  const isSectionEditing = (section: string) => editingSection === section || (isEditing && editingSection === null);

  // ─── Header (desktop only) ──
  const renderHeader = () => {
    if (isMobile) return null;
    return (
      <AccountPageHeader
        title="Profile"
      />
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {renderHeader()}

      <div className="flex flex-col" style={{ gap: '24px' }}>
        {/* ─── 1. Profile Information ───────────────────── */}
        <SectionCard
          icon={<User size={20} />}
          title="Profile Information"
          onEdit={editable ? () => startEditing('profile') : undefined}
          isEditing={isSectionEditing('profile')}
          onSave={handleSave}
          saving={loading}
        >
          <UserAvatar
            user={{ ...user!, avatar: localAvatarUrl }}
            isEditing={isSectionEditing('profile')}
            uploading={avatarUploading}
            onAvatarChange={handleAvatarUpload}
          />

          <div className="flex flex-col" style={{ gap: '16px', marginTop: '16px' }}>
            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <div className="relative">
                <LucideInputIcon icon={User} />
                <input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} style={inputStyle} placeholder="Full Name" disabled={!isSectionEditing('profile')} />
              </div>
              <FieldError error={fieldErrors.name} />
            </div>

            {/* Email Address */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <div className="relative">
                <LucideInputIcon icon={Mail} />
                <input value={formData.email} style={{ ...inputStyle, color: 'var(--color-text-muted)' }} placeholder="Email Address" disabled title="Email cannot be changed here. Contact support if needed." />
              </div>
              {isSectionEditing('profile') && (
                <p className="m-0" style={{ fontSize: '12px', marginTop: '4px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
                  To change your email, go to Security settings.
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label style={labelStyle}>Phone Number</label>
              <div className="relative">
                <LucideInputIcon icon={Phone} />
                <input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} style={inputStyle} placeholder="Phone Number" disabled={!isSectionEditing('profile')} />
              </div>
              <FieldError error={fieldErrors.phone} />
            </div>

            {/* Bio */}
            <div>
              <label style={labelStyle}>Bio</label>
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
                disabled={!isSectionEditing('profile')}
              />
              <FieldError error={fieldErrors.bio} />
            </div>
          </div>
        </SectionCard>

        {/* ─── 2. Personal Details ──────────────────────── */}
        <SectionCard
          icon={<Users size={20} />}
          title="Personal Details"
          onEdit={editable ? () => startEditing('personal') : undefined}
          isEditing={isSectionEditing('personal')}
          onSave={handleSave}
          saving={loading}
        >
          <div className="flex flex-col" style={{ gap: '16px' }}>
            {/* Row 1: DOB | Gender */}
            <div className={cn("grid", isMobile ? "grid-cols-1" : "grid-cols-2")} style={{ gap: '16px' }}>
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <div className="relative">
                  <LucideInputIcon icon={Calendar} />
                  <input
                    type={isSectionEditing('personal') ? "date" : "text"}
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    style={inputStyle}
                    placeholder="Date of Birth"
                    disabled={!isSectionEditing('personal')}
                  />
                </div>
                <FieldError error={fieldErrors.dateOfBirth} />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)} disabled={!isSectionEditing('personal')}>
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
                  <LucideInputIcon icon={MapPin} />
                  <input value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} style={inputStyle} placeholder="City" disabled={!isSectionEditing('personal')} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Zip Code</label>
                <div className="relative">
                  <LucideInputIcon icon={Hash} />
                  <input value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} style={inputStyle} placeholder="Zip Code" disabled={!isSectionEditing('personal')} />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── 3. Emergency Contact ─────────────────────── */}
        <SectionCard
          icon={<PhoneCall size={20} />}
          title="Emergency Contact"
          onEdit={editable ? () => startEditing('emergency') : undefined}
          isEditing={isSectionEditing('emergency')}
          onSave={handleSave}
          saving={loading}
        >
          <div className="flex flex-col" style={{ gap: '16px' }}>
            {/* Row 1: Contact Name | Contact Phone */}
            <div className={cn("grid", isMobile ? "grid-cols-1" : "grid-cols-2")} style={{ gap: '16px' }}>
              <div>
                <label style={labelStyle}>Contact Name</label>
                <div className="relative">
                  <LucideInputIcon icon={UserCheck} />
                  <input
                    value={formData.emergencyContact.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, name: e.target.value } }));
                      if (fieldErrors.emergencyContactName) setFieldErrors(prev => { const n = { ...prev }; delete n.emergencyContactName; return n; });
                    }}
                    style={inputStyle}
                    placeholder="Full name"
                    disabled={!isSectionEditing('emergency')}
                  />
                </div>
                <FieldError error={fieldErrors.emergencyContactName} />
              </div>
              <div>
                <label style={labelStyle}>Contact Phone</label>
                <div className="relative">
                  <LucideInputIcon icon={Phone} />
                  <input
                    value={formData.emergencyContact.phone}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, phone: e.target.value } }));
                      if (fieldErrors.emergencyContactPhone) setFieldErrors(prev => { const n = { ...prev }; delete n.emergencyContactPhone; return n; });
                    }}
                    style={inputStyle}
                    placeholder="Phone number"
                    disabled={!isSectionEditing('emergency')}
                  />
                </div>
                <FieldError error={fieldErrors.emergencyContactPhone} />
              </div>
            </div>

            {/* Row 2: Relationship */}
            <div>
              <label style={labelStyle}>Relationship</label>
              <div className="relative">
                <LucideInputIcon icon={Heart} />
                <input
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, relationship: e.target.value } }));
                    if (fieldErrors.emergencyContactRelationship) setFieldErrors(prev => { const n = { ...prev }; delete n.emergencyContactRelationship; return n; });
                  }}
                  style={inputStyle}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  disabled={!isSectionEditing('emergency')}
                />
              </div>
              <FieldError error={fieldErrors.emergencyContactRelationship} />
            </div>
          </div>
        </SectionCard>

        {/* Mobile-only: save button when editing */}
        {isMobile && isEditing && (
          <div className="flex flex-col" style={{ gap: '8px' }}>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full flex items-center justify-center h-auto"
              style={{
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-text-inverse)',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-medium)' as any,
                fontFamily: 'var(--font-family-base)',
                gap: '8px',
                border: 'none'
              }}
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}