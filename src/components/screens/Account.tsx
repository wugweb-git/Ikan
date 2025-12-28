import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { AuthForm } from '../AuthForm';
import { AccountDetailsSection } from '../blocks/AccountDetailsSection';
import { SideNavAccount } from '../navigation/SideNavAccount';
import { PaymentHistory } from './PaymentHistory';
import { AppSettings } from './account/AppSettings';
import { Preferences } from './account/Preferences';
import { Privacy } from './account/Privacy';
import { Notifications } from './account/Notifications';
import { Security } from './account/Security';
import { cn } from '../ui/utils';
import { LogOut } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { validateProfile } from '../../lib/validation';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';

interface AccountProps {
  className?: string;
  onNavigate?: (route: string) => void;
}



export function Account({ className, onNavigate }: AccountProps) {
  const { user, signOut } = useAuth();
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentAccountRoute, setCurrentAccountRoute] = useState('/account/profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      onNavigate?.('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleAccountNavigate = (route: string) => {
    if (route.startsWith('/account')) {
      setCurrentAccountRoute(route);
      setIsEditingProfile(false); // Reset edit mode when changing routes
    } else {
      onNavigate?.(route);
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (userData: any) => {
    try {
      setIsSavingProfile(true);
      
      // Validate profile data
      const validation = validateProfile({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        bio: userData.bio,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        location: userData.location,
        emergencyContact: userData.emergencyContact
      });
      
      if (!validation.isValid) {
        // Show first error
        const firstError = validation.errors[0];
        showToast('error', 'Validation Error', firstError.message);
        return;
      }
      
      // Call API to update profile
      const response = await apiClient.updateProfile({
        name: userData.name,
        phone: userData.phone,
        bio: userData.bio,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        location: userData.location,
        emergencyContact: userData.emergencyContact,
        preferences: userData.preferences
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      showToast('success', 'Profile Updated', 'Your profile has been saved successfully.');
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save your profile. Please try again.';
      showToast('error', 'Save Failed', errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSocialSync = async (provider: 'google' | 'linkedin', action: 'connect' | 'disconnect') => {
    try {
      if (action === 'connect') {
        showToast('info', 'Connecting...', `Connecting to ${provider === 'google' ? 'Google' : 'LinkedIn'}...`);
        // TODO: Implement OAuth flow for social login
        // This would typically redirect to provider's OAuth page
        await apiClient.connectSocialAccount(provider);
        showToast('success', 'Connected', `Successfully connected to ${provider === 'google' ? 'Google' : 'LinkedIn'}`);
      } else {
        await apiClient.disconnectSocialAccount(provider);
        showToast('success', 'Disconnected', `Successfully disconnected from ${provider === 'google' ? 'Google' : 'LinkedIn'}`);
      }
    } catch (error) {
      console.error(`Failed to ${action} ${provider}:`, error);
      showToast('error', `${action === 'connect' ? 'Connection' : 'Disconnection'} Failed`, 
        `Failed to ${action} ${provider === 'google' ? 'Google' : 'LinkedIn'}. Please try again.`);
    }
  };

  if (!user) {
    return (
      <div className={cn("space-y-6 pb-20 md:pb-6", className)}>
        <div className="flex items-center justify-center min-h-[400px]">
          <AuthForm onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  const renderAccountContent = () => {
    switch (currentAccountRoute) {
      case '/account/dashboard':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Account Dashboard
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Overview of your account activity and quick stats.
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <p>Account dashboard content coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      case '/account/settings':
        return <AppSettings />;
      case '/account/privacy':
        return <Privacy />;
      case '/account/preferences':
        return <Preferences />;
      case '/account/notifications':
        return <Notifications />;
      case '/account/payments':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Payment History
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                View your purchase history and manage payments.
              </p>
            </div>
            <PaymentHistory />
          </div>
        );
      case '/account/security':
        return <Security />;
      case '/account/corporate':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Corporate
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Manage your corporate account settings.
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <p>Corporate settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      default: // '/account/profile'
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 style={{ 
                fontSize: 'var(--text-4xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                My Profile
              </h1>
              <p style={{ 
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-primary)' 
              }}>
                Track your journey and see how far have you come.
              </p>
            </div>

            {/* Use AccountDetailsSection block */}
            <AccountDetailsSection
              user={{
                name: user.name,
                email: user.email,
                phone: user.phone,
                bio: user.bio || '',
                dateOfBirth: user.dateOfBirth || '',
                gender: user.gender || '',
                location: user.location || '',
                emergencyContact: {
                  name: user.emergencyContactName || '',
                  phone: user.emergencyContactPhone || '',
                  relationship: user.emergencyContactRelationship || ''
                },
                connectedAccounts: {
                  google: {
                    connected: user.googleConnected || false,
                    email: user.googleEmail || '',
                    connectedAt: user.googleConnectedAt || ''
                  },
                  linkedin: {
                    connected: user.linkedinConnected || false,
                    email: user.linkedinEmail || '',
                    connectedAt: user.linkedinConnectedAt || ''
                  }
                },
                preferences: {
                  emailNotifications: true,
                  pushNotifications: true,
                  weeklyReports: false,
                  moodReminders: true,
                }
              }}
              editable={isEditingProfile}
              loading={isSavingProfile}
              onSave={handleSaveProfile}
              onEdit={handleEditProfile}
              onSocialSync={handleSocialSync}
            />

            {/* Sign Out functionality moved to /account page navigation */}
          </div>
        );
    }
  };

  // Mobile tab items configuration
  const mobileTabItems = [
    { id: 'profile', label: 'Profile', icon: 'user', route: '/account/profile' },
    { id: 'payments', label: 'Payments', icon: 'creditCard', route: '/account/payments' },
    { id: 'notifications', label: 'Notifications', icon: 'bell', route: '/account/notifications' },
    { id: 'security', label: 'Security', icon: 'lock', route: '/account/security' },
    { id: 'preferences', label: 'Preferences', icon: 'sliders', route: '/account/preferences' },
    { id: 'corporate', label: 'Corporate', icon: 'briefcase', route: '/account/corporate' }
  ];

  const getCurrentTabId = () => {
    const route = currentAccountRoute;
    const item = mobileTabItems.find(item => item.route === route);
    return item?.id || 'profile';
  };

  const handleMobileTabChange = (tabId: string) => {
    const item = mobileTabItems.find(item => item.id === tabId);
    if (item) {
      handleAccountNavigate(item.route);
    }
  };

  if (isMobile) {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <Tabs value={getCurrentTabId()} onValueChange={handleMobileTabChange}>
          <TabsList 
            className="grid w-full grid-cols-3 md:grid-cols-6"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--ikan-component-border-radius)',
              padding: 'var(--spacing-1)',
              gap: 'var(--spacing-1)'
            }}
          >
            {mobileTabItems.map((item) => (
              <TabsTrigger 
                key={item.id}
                value={item.id}
                className="flex flex-col items-center gap-1 py-2"
                style={{
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  minHeight: 'var(--ikan-touch-target-min)'
                }}
              >
                <Icon name={item.icon} size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="mt-6">
            {mobileTabItems.map((item) => (
              <TabsContent key={item.id} value={item.id} className="mt-0">
                {renderAccountContent()}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    );
  }

  // Desktop layout
  return (
    <div 
      className={cn("flex ikan-stack-md mx-5", className)}
      style={{ 
        gap: 'var(--spacing-6)', 
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: '20px' 
      }}
    >
      {/* Left Column: SideNavAccount */}
      <div className="hidden md:block" style={{ minWidth: '240px', flex: '0 0 auto' }}>
        <SideNavAccount
          currentRoute={currentAccountRoute}
          onNavigate={handleAccountNavigate}
          onLogout={handleSignOut}
          className="sticky"
          style={{ top: '128px' }} // 20px (nav top) + 88px (nav height) + 20px (gap)
        />
      </div>

      {/* Right Column: AccountDetailsSection and content */}
      <div className="flex-1 ikan-stack-lg" style={{ display: 'flex', flexDirection: 'column' }}>
        {renderAccountContent()}
      </div>
    </div>
  );
}