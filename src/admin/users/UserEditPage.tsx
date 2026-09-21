import { useState, useEffect } from 'react';
import { Save, Trash2, User, Shield, Building, Mail, Phone, Calendar, Link as LinkIcon } from 'lucide-react';
import { useNotifications } from '../../shared/state/NotificationContext';
import { apiClient } from '../../shared/api/api';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { AdminSection } from '../shell/AdminSection';
import { AdminFormField } from '../ui/kit/AdminFormField';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { useFormValidation, ValidationSchema } from '../ui/hooks/useFormValidation';
import { useUnsavedChanges } from '../ui/hooks/useUnsavedChanges';
import { useKeyboardShortcuts } from '../ui/hooks/useKeyboardShortcuts';
import { UnsavedChangesDialog } from '../ui/unsaved-changes-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { AdminLoading } from '../ui/kit/AdminLoading';

interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  phone?: string | null;
  corporate_user?: boolean;
  is_admin?: boolean;
  avatar_url?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  location?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
  googleConnected?: boolean;
  googleEmail?: string | null;
  googleConnectedAt?: string | null;
  linkedinConnected?: boolean;
  linkedinEmail?: string | null;
  linkedinConnectedAt?: string | null;
  created_at: string;
  updated_at?: string;
}

interface UserEditPageProps {
  userId?: string;
  onBack: () => void;
  onSave: () => void;
}

export function UserEditPage({ userId, onBack, onSave }: UserEditPageProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(!!userId);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    gender: '',
    is_admin: false,
    corporate_user: false,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });
  
  const [password, setPassword] = useState('');

  // Form validation
  const validationSchema: ValidationSchema = {
    name: {
      required: true,
      minLength: 2,
      message: 'Name must be at least 2 characters'
    },
    email: {
      required: true,
      validate: (value: any) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: 'Please enter a valid email address'
    }
  };

  const { errors, validateForm, clearErrors } = useFormValidation(validationSchema);
  const { hasUnsavedChanges, markAsSaved, markAsUnsaved, setShowWarning, showWarning } = useUnsavedChanges();

  // Track form changes
  useEffect(() => {
    if (formData.name || formData.email) {
      markAsUnsaved();
    }
  }, [formData]);

  // Load user data
  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUser(userId!);
      setFormData(response);
    } catch (error) {
      console.error('Failed to load user:', error);
      showToast('error', 'Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate form
    const isValid = validateForm(formData);
    if (!isValid) {
      showToast('error', 'Validation Error', 'Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);

      if (userId) {
        await apiClient.updateUserAdmin(userId, formData);
        showToast('success', 'Success', 'User updated successfully');
      } else {
        if (!password || password.length < 8) {
          showToast('error', 'Validation Error', 'Password is required and must be at least 8 characters');
          return;
        }
        await apiClient.createUserAdmin({ ...formData, password });
        showToast('success', 'Success', 'User created successfully');
      }

      markAsSaved();
      onSave();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      showToast('error', 'Error', error.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      await apiClient.deleteUser(userId);
      showToast('success', 'Success', 'User deleted successfully');
      onSave();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      showToast('error', 'Error', error.message || 'Failed to delete user');
    } finally {
      setSaving(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(
    {
      'ctrl+s': (e) => {
        e.preventDefault();
        handleSave();
      },
      escape: () => {
        if (hasUnsavedChanges) {
          setShowWarning(true);
        } else {
          onBack();
        }
      }
    },
    [formData, hasUnsavedChanges]
  );

  if (loading) {
    return (
      <AdminPageLayout
        title="Loading..."
      >
        <div className="flex items-center justify-center py-12">
          <AdminLoading message="Loading user..." />
        </div>
      </AdminPageLayout>
    );
  }

  const getUserStatus = () => {
    if (formData.is_admin) return { label: 'Admin', variant: 'warning' as const };
    if (formData.corporate_user) return { label: 'Corporate', variant: 'info' as const };
    return { label: 'User', variant: 'default' as const };
  };

  return (
    <>
      <AdminPageLayout
        title={userId ? formData.name || 'Edit User' : 'New User'}
        subtitle={userId ? formData.email || 'Update user information' : 'Create a new user account'}
        status={getUserStatus()}
        primaryAction={{
          label: userId ? 'Save Changes' : 'Create User',
          icon: <Save className="w-4 h-4" />,
          onClick: handleSave,
          loading: saving
        }}
        secondaryActions={[
          ...(userId
            ? [
                {
                  label: 'Delete',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => setIsDeleteDialogOpen(true),
                  variant: 'destructive' as const
                }
              ]
            : [])
        ]}
        onBack={() => {
          if (hasUnsavedChanges) {
            setShowWarning(true);
          } else {
            onBack();
          }
        }}
        maxWidth="xl"
      >
        {/* Basic Information */}
        <AdminSection title="Basic Information" description="Core user profile details" icon={<User className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <AdminFormField label="Full Name" required error={errors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Email Address" required error={errors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            {!userId && (
              <AdminFormField label="Password" required helpText="Min 8 characters">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                />
              </AdminFormField>
            )}

            <AdminFormField label="Phone Number" helpText="Optional contact number">
              <Input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Location" helpText="City, Country">
              <Input
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Mumbai, India"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Date of Birth" helpText="Optional">
              <Input
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Gender" helpText="Optional">
              <Input
                value={formData.gender || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                placeholder="Male, Female, Other"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>
          </div>

          <AdminFormField label="Bio" description="Optional personal description" helpText="Tell us about yourself">
            <Textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Brief biography or personal note..."
              className="min-h-[100px]"
              style={{
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            />
          </AdminFormField>
        </AdminSection>

        {/* Roles & Permissions */}
        <AdminSection
          title="Roles & Permissions"
          description="User access level and permissions"
          icon={<Shield className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
              <Checkbox
                id="is_admin"
                checked={formData.is_admin}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_admin: checked as boolean }))}
              />
              <div className="flex-1">
                <Label htmlFor="is_admin" className="cursor-pointer flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />
                  Administrator
                </Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                  Full access to all admin features and settings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
              <Checkbox
                id="corporate_user"
                checked={formData.corporate_user}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, corporate_user: checked as boolean }))}
              />
              <div className="flex-1">
                <Label htmlFor="corporate_user" className="cursor-pointer flex items-center gap-2">
                  <Building className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
                  Corporate User
                </Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                  Part of a corporate wellness program
                </p>
              </div>
            </div>
          </div>
        </AdminSection>

        {/* Emergency Contact */}
        <AdminSection
          title="Emergency Contact"
          description="Emergency contact information"
          icon={<Phone className="w-5 h-5" />}
        >
          <div className="grid md:grid-cols-3 gap-6">
            <AdminFormField label="Contact Name" helpText="Emergency contact person">
              <Input
                value={formData.emergencyContactName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                placeholder="Jane Doe"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Contact Phone" helpText="Emergency contact number">
              <Input
                type="tel"
                value={formData.emergencyContactPhone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                placeholder="+91 98765 43210"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>

            <AdminFormField label="Relationship" helpText="Relation to user">
              <Input
                value={formData.emergencyContactRelationship || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                placeholder="Spouse, Parent, Sibling"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </AdminFormField>
          </div>
        </AdminSection>

        {/* Social Connections */}
        {userId && (
          <AdminSection
            title="Social Connections"
            description="Connected social accounts"
            icon={<LinkIcon className="w-5 h-5" />}
          >
            <div className="space-y-3">
              {formData.googleConnected && (
                <div
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-danger-default)' }}
                    >
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Google</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {formData.googleEmail}
                      </p>
                    </div>
                  </div>
                  <AdminStatusBadge status="Connected" variant="success" />
                </div>
              )}

              {formData.linkedinConnected && (
                <div
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-info-default)' }}
                    >
                      <LinkIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>LinkedIn</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {formData.linkedinEmail}
                      </p>
                    </div>
                  </div>
                  <AdminStatusBadge status="Connected" variant="success" />
                </div>
              )}

              {!formData.googleConnected && !formData.linkedinConnected && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--spacing-8)' }}>
                  No social accounts connected
                </p>
              )}
            </div>
          </AdminSection>
        )}

        {/* Account Meta */}
        {userId && formData.created_at && (
          <AdminSection title="Account Information" description="Account metadata" icon={<Calendar className="w-5 h-5" />}>
            <div className="grid md:grid-cols-2 gap-4">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
                  Account Created
                </p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {new Date(formData.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {formData.updated_at && (
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }}>
                    Last Updated
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    {new Date(formData.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </AdminSection>
        )}
      </AdminPageLayout>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={() => {
          markAsSaved();
          onBack();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {formData.name}? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              style={{ backgroundColor: 'var(--color-danger-default)', color: 'white' }}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}