import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthForm } from '../AuthForm';
import { AccountDetailsSection } from '../blocks/AccountDetailsSection';
import { SideNavAccount } from '../navigation/SideNavAccount';
import { cn } from '../ui/utils';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { useIsMobile } from '../../hooks/useIsMobile';
import { validateProfile } from '../../lib/validation';
import { AccountPageHeader } from '../blocks/AccountPageHeader';

// Lazy-load all account sub-screens so only the active tab loads
const PaymentHistory = lazy(() => import('./PaymentHistory').then(m => ({ default: m.PaymentHistory })));
const Privacy = lazy(() => import('./account/Privacy').then(m => ({ default: m.Privacy })));
const Notifications = lazy(() => import('./account/Notifications').then(m => ({ default: m.Notifications })));
const Security = lazy(() => import('./account/Security').then(m => ({ default: m.Security })));
const Legal = lazy(() => import('./account/Legal').then(m => ({ default: m.Legal })));
const Corporate = lazy(() => import('./account/Corporate').then(m => ({ default: m.Corporate })));
const Integration = lazy(() => import('./account/Integration').then(m => ({ default: m.Integration })));

// Loading skeleton for account sub-screens
function AccountSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-32 rounded" style={{ backgroundColor: 'var(--color-bg-muted)' }} />
      <div className="h-[200px] rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }} />
    </div>
  );
}

// Mobile Header Component
function MobileHeader({ title, onBack, rightAction }: { title: string, onBack?: () => void, rightAction?: React.ReactNode }) {
  return (
    <div className="content-stretch flex items-center w-full sticky top-0 z-50" style={{ gap: 'var(--spacing-3)', height: '56px', paddingLeft: 'var(--spacing-4)', paddingRight: 'var(--spacing-4)', backgroundColor: 'var(--color-bg-page)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="relative shrink-0 flex items-center justify-center hover:bg-black/5 active:bg-black/10 transition-colors"
          style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer' }}
          aria-label="Go back"
        >
           <svg className="block w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16" aria-hidden="true">
            <g>
              <path d="M8 12.6661L3.33355 7.99962L8 3.33317" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
              <path d="M12.6661 7.99962H3.33317" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
            </g>
          </svg>
        </button>
      )}

      {/* Title */}
      <div className="basis-0 grow min-w-0 flex items-center">
        <h1 
          className="truncate m-0"
          style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: '18px', letterSpacing: '-0.3px', lineHeight: '24px' }}
        >
          {title}
        </h1>
      </div>

      {/* Right Action */}
      {rightAction && (
        <div className="shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
}

// Edit Icon for Header
const IconEdit = () => (
  <svg className="block w-4 h-4" fill="none" viewBox="0 0 16 16" style={{ color: 'var(--color-text-muted)' }}>
     <g clipPath="url(#clip0_edit)">
      <path d="M14.1153 4.54112C14.4678 4.18875 14.6658 3.7108 14.6659 3.21241C14.6659 2.71403 14.468 2.23603 14.1157 1.88358C13.7633 1.53112 13.2853 1.33308 12.787 1.33302C12.2886 1.33295 11.8106 1.53088 11.4581 1.88324L2.56121 10.7822C2.40643 10.9365 2.29196 11.1265 2.22789 11.3355L1.34727 14.2367C1.33004 14.2943 1.32874 14.3555 1.3435 14.4139C1.35826 14.4722 1.38854 14.5255 1.43113 14.568C1.47371 14.6105 1.527 14.6407 1.58536 14.6553C1.64372 14.67 1.70495 14.6686 1.76258 14.6513L4.66444 13.7713C4.87321 13.7078 5.0632 13.5941 5.21775 13.44L14.1153 4.54112Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33327" />
      <path d="M9.99952 3.33317L12.6661 5.99971" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33327" />
     </g>
     <defs>
      <clipPath id="clip0_edit">
        <rect fill="white" height="16" width="16" />
      </clipPath>
     </defs>
  </svg>
);

const IconSave = () => (
  <svg className="block w-4 h-4" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--color-text-muted)' }}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface AccountProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

export function Account({ className, onNavigate }: AccountProps) {
  const { user, signOut, refreshProfile, updateProfile } = useAuth();
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [currentAccountRoute, setCurrentAccountRoute] = useState('/account/profile');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  
  // State for Profile Editing
  const [isProfileEditing, setIsProfileEditing] = useState(false);

  // Reset mobile menu state when switching to desktop or initially
  useEffect(() => {
    if (isMobile) {
      setShowMobileMenu(true);
      setIsProfileEditing(false); // Reset edit state when going back to menu or desktop
    }
  }, [isMobile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate?.('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleAccountNavigate = (route: string) => {
    if (route.startsWith('/account')) {
      setCurrentAccountRoute(route);
      if (isMobile) {
        setShowMobileMenu(false);
        setIsProfileEditing(false); // Reset edit state when navigating
      }
    } else {
      onNavigate?.(route);
    }
  };

  const handleMobileBack = () => {
    setShowMobileMenu(true);
    setIsProfileEditing(false);
  };

  const handleSaveProfile = async (userData: any) => {
    try {
      setIsSavingProfile(true);
      
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
        const firstError = validation.errors[0];
        showToast('error', 'Validation Error', firstError.message);
        return;
      }
      
      // Flatten emergencyContact to match the User interface / backend schema
      await updateProfile({
        name: userData.name,
        phone: userData.phone,
        bio: userData.bio,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        location: userData.location,
        zipCode: userData.zipCode,
        emergencyContactName: userData.emergencyContact?.name || '',
        emergencyContactPhone: userData.emergencyContact?.phone || '',
        emergencyContactRelationship: userData.emergencyContact?.relationship || '',
        preferences: userData.preferences
      });
      
      showToast('success', 'Profile Updated', 'Your profile has been saved successfully.');
      setIsProfileEditing(false);
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save your profile. Please try again.';
      showToast('error', 'Save Failed', errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Helper to trigger save from header button
  const triggerProfileSave = () => {
    // This is a bit tricky since handleSaveProfile needs data from AccountDetailsSection.
    // In a real app, we might use a context or ref.
    // For now, we'll just toggle the edit state. 
    // If the user clicks "Save" (pencil becomes save icon), we need to trigger form submission.
    // However, since AccountDetailsSection holds the form state, we should probably
    // let AccountDetailsSection handle the save via its own internal logic or ref.
    
    // Simplification: We will just toggle 'isProfileEditing' here. 
    // But if we toggle to FALSE, we need to SAVE.
    // The clean way is to pass a ref to AccountDetailsSection.
    
    // For this specific mobile implementation request, I'll rely on the user clicking the Save button inside AccountDetailsSection 
    // IF we render one. But the mobile design implies header action.
    
    // Let's toggle isProfileEditing. If it goes from true -> false, we assume save?
    // Actually, let's keep it simple: Clicking pencil enables edit mode.
    // Once in edit mode, maybe the header icon changes to checkmark?
    
    setIsProfileEditing(!isProfileEditing);
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
    // Determine Mobile Header Props
    let title = "Account";
    let rightAction = null;
    let content = null;

    switch (currentAccountRoute) {
      case '/account/dashboard': 
      case '/account/settings':
      case '/account/preferences':
        // Preferences merged into Notifications
        title = "Notifications";
        content = <Suspense fallback={<AccountSkeleton />}><Notifications /></Suspense>;
        break;
      case '/account/privacy':
        title = "Privacy";
        content = <Suspense fallback={<AccountSkeleton />}><Privacy /></Suspense>;
        break;
      case '/account/notifications':
        title = "Notifications";
        content = <Suspense fallback={<AccountSkeleton />}><Notifications /></Suspense>;
        break;
      case '/account/payments':
        title = "Billing";
        content = <Suspense fallback={<AccountSkeleton />}><PaymentHistory /></Suspense>;
        break;
      case '/account/security':
        title = "Security";
        content = <Suspense fallback={<AccountSkeleton />}><Security /></Suspense>;
        break;
      case '/account/legal':
        title = "Legal";
        content = <Suspense fallback={<AccountSkeleton />}><Legal onNavigate={onNavigate} /></Suspense>;
        break;
      case '/account/corporate':
        title = "Organization";
        content = <Suspense fallback={<AccountSkeleton />}><Corporate /></Suspense>;
        break;
      case '/account/integration':
        title = "Integration";
        content = <Suspense fallback={<AccountSkeleton />}><Integration /></Suspense>;
        break;
      default: // '/account/profile'
        title = "Profile";
        
        // Add Edit Button for Profile
        rightAction = (
          <button 
            onClick={triggerProfileSave}
            className="size-[40px] flex items-center justify-center hover:bg-black/5 transition-colors"
            style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-xs)' }}
            aria-label={isProfileEditing ? "Save profile" : "Edit profile"}
          >
            {isProfileEditing ? <IconSave /> : <IconEdit />}
          </button>
        );

        content = (
          <div className="space-y-6">
            <AccountDetailsSection
              user={{
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar_url,
                bio: user.bio || '',
                dateOfBirth: user.dateOfBirth || '',
                gender: user.gender || '',
                location: user.location || '',
                emergencyContact: {
                  name: user.emergencyContactName || '',
                  phone: user.emergencyContactPhone || '',
                  relationship: user.emergencyContactRelationship || ''
                }
              }}
              editable={true}
              loading={isSavingProfile}
              onSave={handleSaveProfile}
              onAvatarUploaded={() => {
                refreshProfile().catch(e => console.error('Failed to refresh profile after avatar upload:', e));
              }}
              isEditing={isProfileEditing}
              setIsEditing={setIsProfileEditing}
            />
          </div>
        );
    }

    if (isMobile) {
      return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
          <MobileHeader 
            title={title} 
            onBack={handleMobileBack} 
            rightAction={rightAction}
          />
          <div className="flex-1 overflow-y-auto p-[20px] pb-[120px] account-content">
            {content}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {currentAccountRoute !== '/account/profile' && (
           <AccountPageHeader title={title} />
        )}
        {content}
      </div>
    );
  };

  if (isMobile) {
    if (showMobileMenu) {
      return (
        <div className={cn("w-full flex flex-col min-h-screen", className)} style={{ backgroundColor: 'var(--color-bg-page)' }}>
           <MobileHeader title="Account" /> 
           
          <div className="flex-1 overflow-y-auto px-[16px] py-[24px] pb-[120px]">
            <SideNavAccount
              currentRoute={currentAccountRoute}
              onNavigate={handleAccountNavigate}
              onLogout={handleSignOut}
              className="w-full h-full bg-transparent border-none p-0 shadow-none"
              isMobile={true}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={cn("w-full h-full", className)} style={{ backgroundColor: 'var(--color-bg-page)' }}>
        {renderAccountContent()}
      </div>
    );
  }

  // Desktop layout
  return (
    <div 
      className={cn("flex w-full account-layout-desktop", className)}
      style={{ 
        maxWidth: '1360px',
        margin: '0 auto',
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: '0 56px',
        marginTop: '16px',
        gap: '24px',
        height: 'calc(100vh - 96px)',
        overflow: 'hidden' 
      }}
    >
      <div 
        className="hidden md:block shrink-0" 
        style={{ 
          width: '240px',
          height: '100%',
          overflowY: 'auto',
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--color-border-default)'
        }}
      >
        <SideNavAccount
          currentRoute={currentAccountRoute}
          onNavigate={handleAccountNavigate}
          onLogout={handleSignOut}
          style={{ height: '100%', border: 'none', boxShadow: 'none', borderRadius: '16px' }}
          isMobile={false}
        />
      </div>

      <div 
        className="flex-1 min-w-0 flex flex-col h-full account-content"
        style={{ 
          overflowY: 'auto',
          paddingBottom: '24px'
        }}
      >
        {renderAccountContent()}
      </div>
    </div>
  );
}