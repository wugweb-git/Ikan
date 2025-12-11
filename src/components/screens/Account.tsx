import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { AuthForm } from '../AuthForm';
import { AccountDetailsSection } from '../blocks/AccountDetailsSection';
import { SideNavAccount } from '../navigation/SideNavAccount';
import { DatabaseSyncPanel } from '../DatabaseSyncPanel';
import { PaymentHistory } from './PaymentHistory';
import { cn } from '../ui/utils';
import { LogOut } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';

interface AccountProps {
  className?: string;
}



export function Account({ className }: AccountProps) {
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
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleAccountNavigate = (route: string) => {
    setCurrentAccountRoute(route);
    setIsEditingProfile(false); // Reset edit mode when changing routes
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (userData: any) => {
    try {
      setIsSavingProfile(true);
      
      // Call API to update profile
      await apiClient.updateProfile({
        name: userData.name,
        phone: userData.phone,
        preferences: userData.preferences
      });
      
      showToast('success', 'Profile Updated', 'Your profile has been saved successfully.');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      showToast('error', 'Save Failed', 'Failed to save your profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
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
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                App Settings
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Configure your app preferences and database synchronization.
              </p>
            </div>
            
            {/* Database Sync Panel */}
            <DatabaseSyncPanel
              onSyncComplete={(result) => {
                if (result.success) {
                  showToast('success', 'Database Synced', 'All assessments and programs are now complete!');
                } else {
                  showToast('error', 'Sync Failed', result.message);
                }
              }}
            />
            
            <Card>
              <CardContent className="p-6">
                <p>Additional app settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      case '/account/privacy':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Privacy Settings
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Manage your data and privacy controls.
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <p>Privacy settings content coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      case '/account/notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Notification Preferences
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Manage your notification settings and preferences.
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <p>Notification preferences content coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
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
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Security Settings
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Manage your security settings and account protection.
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <p>Security settings content coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      default: // '/account/profile'
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Profile Settings
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Manage your personal information and preferences.
              </p>
            </div>

            {/* Use AccountDetailsSection block */}
            <AccountDetailsSection
              user={{
                name: user.name,
                email: user.email,
                phone: user.phone,
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
            />

            {/* Sign Out Card */}
            <Card>
              <CardHeader>
                <CardTitle style={{ color: 'var(--color-status-danger)' }}>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Button 
                    variant="outline"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full gap-2"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    {isSigningOut ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        Signing Out...
                      </>
                    ) : (
                      <>
                        <LogOut size={16} />
                        Sign Out
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  // Mobile tab items configuration
  const mobileTabItems = [
    { id: 'profile', label: 'Profile', icon: 'user', route: '/account/profile' },
    { id: 'payments', label: 'Payments', icon: 'creditCard', route: '/account/payments' },
    { id: 'settings', label: 'Settings', icon: 'settings', route: '/account/settings' },
    { id: 'privacy', label: 'Privacy', icon: 'shield', route: '/account/privacy' },
    { id: 'notifications', label: 'Notifications', icon: 'bell', route: '/account/notifications' },
    { id: 'security', label: 'Security', icon: 'lock', route: '/account/security' }
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
      className={cn("flex ikan-stack-md", className)}
      style={{ 
        gap: 'var(--spacing-6)', 
        flexDirection: 'row',
        alignItems: 'flex-start'
      }}
    >
      {/* Left Column: SideNavAccount */}
      <div className="hidden md:block" style={{ minWidth: '240px', flex: '0 0 auto' }}>
        <SideNavAccount
          currentRoute={currentAccountRoute}
          onNavigate={handleAccountNavigate}
          className="sticky top-20"
        />
      </div>

      {/* Right Column: AccountDetailsSection and content */}
      <div className="flex-1 ikan-stack-lg" style={{ display: 'flex', flexDirection: 'column' }}>
        {renderAccountContent()}
      </div>
    </div>
  );
}

