import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  LayoutDashboard, 
  BarChart, 
  Users, 
  ClipboardList, 
  Table, 
  BookOpen, 
  Tag, 
  Smile, 
  Settings, 
  Database, 
  FileText, 
  Monitor, 
  MessageSquare, 
  Shield, 
  Search,
  Bell,
  User,
  LogOut,
  Stethoscope,
  Image,
  Sparkles,
  CreditCard,
  MousePointerClick,
  HeartPulse,
  Palette,
  Zap,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { SideNav, SideNavGroup } from '../navigation/SideNav';
import { Logo } from '../Logo';
import { ErrorBoundary } from '../ErrorBoundary';
import { AdminUserManager } from './AdminUserManager';
import { AdminConsultationManager } from './AdminConsultationManager';
import { AdminResourceManager } from './AdminResourceManager';
import { AdminAssessmentManager } from './AdminAssessmentManager';
import { EquipAdminDashboard } from './EquipAdminDashboard';
import { AdminEquipAnalytics } from './AdminEquipAnalytics';
import { AdminPageManager } from './AdminPageManager';
import { AdminMediaManager } from './AdminMediaManager';
import { AdminUserDataManager } from './AdminUserDataManager';
import { AdminSettingsManager } from './AdminSettingsManager';
import { AdminDashboardAnalytics } from './AdminDashboardAnalytics';
import { AdminCRUDTesting } from '../admin/AdminCRUDTesting';
import { AdminSystemLogs } from '../admin/AdminSystemLogs';
import { AdminCommunication } from '../admin/AdminCommunication';
import { AdminPaymentGateway } from '../admin/AdminPaymentGateway';
import { AdminSecurity } from '../admin/AdminSecurity';
import { AdminCategoryManager } from '../admin/AdminCategoryManager';
import { AdminMoodManager } from '../admin/AdminMoodManager';
import { AdminCheckinScalesManager } from '../admin/AdminCheckinScalesManager';
import { RecommendationRulesManager } from '../admin/recommendations/RecommendationRulesManager';
import { AdminBackupManager } from '../admin/AdminBackupManager';
import { UIKitPatterns } from '../uikit/UIKitPatterns';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
  initialView?: string;
}

type ViewType = 
  | 'dashboard'
  | 'analytics'
  | 'users'
  | 'consultants'
  | 'resources'
  | 'assessments'
  | 'equip'
  | 'equip-analytics'
  | 'pages'
  | 'media'
  | 'categories'
  | 'moods'
  | 'checkin-scales'
  | 'recommendations'
  | 'user-data'
  | 'settings'
  | 'crud'
  | 'system-logs'
  | 'communication'
  | 'payment-gateway'
  | 'security'
  | 'backup'
  | 'ui-kit';

export function AdminDashboard({ onNavigate, initialView }: AdminDashboardProps) {
  const { unreadCount } = useNotifications();
  const [currentView, setCurrentView] = useState<ViewType>((initialView as ViewType) || 'dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (initialView) {
      setCurrentView(initialView as ViewType);
    }
  }, [initialView]);

  const navGroups: SideNavGroup[] = [
    {
      id: 'main',
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart },
        { id: 'users', label: 'Users & Accounts', icon: Users },
      ]
    },
    {
      id: 'content',
      title: 'Content Management',
      items: [
        { id: 'equip', label: 'Equip Programs', icon: BookOpen },
        { id: 'assessments', label: 'Assessments', icon: ClipboardList },
        { id: 'resources', label: 'Resources', icon: Table },
        { id: 'consultants', label: 'Consultants', icon: Stethoscope },
        { id: 'pages', label: 'Pages', icon: FileText },
        { id: 'media', label: 'Media Library', icon: Image },
      ]
    },
    {
      id: 'configuration',
      title: 'Configuration',
      items: [
        { id: 'categories', label: 'Categories', icon: Tag },
        { id: 'moods', label: 'Mood Types', icon: Smile },
        { id: 'checkin-scales', label: 'Check-in Scales', icon: Zap },
        { id: 'recommendations', label: 'Rules Engine', icon: Sparkles },
        { id: 'settings', label: 'Global Settings', icon: Settings },
      ]
    },
    {
      id: 'system',
      title: 'System & Logs',
      items: [
        { id: 'user-data', label: 'User Activity', icon: MousePointerClick },
        { id: 'communication', label: 'Communication', icon: MessageSquare },
        { id: 'payment-gateway', label: 'Payments', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'crud', label: 'System Health', icon: HeartPulse },
        { id: 'backup', label: 'Backups', icon: Database },
        { id: 'system-logs', label: 'System Logs', icon: Monitor },
      ]
    }
  ].map(group => ({
    ...group,
    collapsible: true,
    defaultExpanded: true,
    items: group.items.map(item => ({
      ...item,
      isActive: currentView === item.id,
      onClick: () => {
        setCurrentView(item.id as ViewType);
        window.scrollTo(0,0);
      }
    }))
  }));

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-8 admin-dashboard-header">
            <div>
              <h1 className="mb-2">
                Admin Dashboard
              </h1>
              <p style={{ 
                fontSize: 'var(--text-base)', 
                color: 'var(--color-text-muted)' 
              }}>
                Overview of system performance and recent activity.
              </p>
            </div>
            
            <div className="space-y-2">
                <h2 className="mb-4">
                    Overview
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card 
                    className="p-6 cursor-pointer hover:shadow-md transition-all group border border-[var(--color-border-default)] cbt-card-small"
                    style={{ borderRadius: 'var(--radius-lg)' }}
                    onClick={() => setCurrentView('users')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>User Management</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Manage accounts and roles</p>
                      </div>
                      <div className="p-2 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-primary-default)' }}>
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className="p-6 cursor-pointer hover:shadow-md transition-all group border border-[var(--color-border-default)] cbt-card-small"
                    style={{ borderRadius: 'var(--radius-lg)' }}
                    onClick={() => setCurrentView('equip')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Equip Programs</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Manage courses and content</p>
                      </div>
                      <div className="p-2 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-primary-default)' }}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className="p-6 cursor-pointer hover:shadow-md transition-all group border border-[var(--color-border-default)] cbt-card-small"
                    style={{ borderRadius: 'var(--radius-lg)' }}
                    onClick={() => setCurrentView('crud')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>System Health</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Status: Operational</p>
                      </div>
                      <div className="p-2 rounded-lg group-hover:scale-110 transition-transform relative" style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>
                        <HeartPulse className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>
                  </Card>
                </div>
            </div>
            
            <div className="space-y-4">
                 <h2 className="mb-4">
                    Dashboard Analytics
                </h2>
                <div className="grid gap-6 lg:grid-cols-2">
                     <AdminDashboardAnalytics onBack={() => {}} />
                </div>
            </div>
          </div>
        );
      case 'analytics': return <AdminDashboardAnalytics onBack={() => setCurrentView('dashboard')} />;
      case 'users': return <AdminUserManager onBack={() => setCurrentView('dashboard')} />;
      case 'consultants': return <AdminConsultationManager onBack={() => setCurrentView('dashboard')} />;
      case 'resources': return <AdminResourceManager onBack={() => setCurrentView('dashboard')} />;
      case 'assessments': return <AdminAssessmentManager onBack={() => setCurrentView('dashboard')} />;
      case 'equip': return <EquipAdminDashboard onBack={() => setCurrentView('dashboard')} />;
      case 'equip-analytics': return <AdminEquipAnalytics onBack={() => setCurrentView('dashboard')} />;
      case 'pages': return <AdminPageManager onBack={() => setCurrentView('dashboard')} />;
      case 'media': return <AdminMediaManager onBack={() => setCurrentView('dashboard')} />;
      case 'categories': return <AdminCategoryManager onBack={() => setCurrentView('dashboard')} />;
      case 'moods': return <AdminMoodManager onBack={() => setCurrentView('dashboard')} />;
      case 'checkin-scales': return <AdminCheckinScalesManager onBack={() => setCurrentView('dashboard')} />;
      case 'recommendations': return <RecommendationRulesManager onBack={() => setCurrentView('dashboard')} />;
      case 'user-data': return <AdminUserDataManager onBack={() => setCurrentView('dashboard')} />;
      case 'settings': return <AdminSettingsManager onBack={() => setCurrentView('dashboard')} />;
      case 'crud': return <AdminCRUDTesting onBack={() => setCurrentView('dashboard')} />;
      case 'backup': return <AdminBackupManager onBack={() => setCurrentView('dashboard')} />;
      case 'system-logs': return <AdminSystemLogs onBack={() => setCurrentView('dashboard')} />;
      case 'communication': return <AdminCommunication onBack={() => setCurrentView('dashboard')} />;
      case 'payment-gateway': return <AdminPaymentGateway onBack={() => setCurrentView('dashboard')} />;
      case 'security': return <AdminSecurity onBack={() => setCurrentView('dashboard')} />;
      case 'ui-kit': return <UIKitPatterns />;
      default: return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--grey-1)] flex font-sans">
      
      {/* 1. FIXED SIDEBAR (Left, No Rounding, Full Height) */}
      <aside className="w-[20vw] fixed inset-y-0 left-0 bg-[var(--grey-0)] border-r border-[var(--grey-2)] z-50 flex flex-col">
          {/* Header Area in Sidebar */}
          <div className="h-[96px] flex items-center px-4 border-b border-[var(--grey-2)]">
              <div className="flex items-center gap-4">
                <div className="bg-[var(--primary)] rounded-lg p-2" style={{ color: 'var(--color-primary-on)' }}>
                  <Logo showText={false} iconSize={40} />
                </div>
                <div>
                  <span className="text-[var(--grey-9)] text-xl tracking-tight block leading-none" style={{ fontWeight: 'var(--font-weight-medium)' }}>iKan</span>
                  <span className="text-[var(--grey-5)] text-xs uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-medium)' }}>Admin Console</span>
                </div>
              </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-8">
             <SideNav 
               groups={navGroups} 
               className="w-full space-y-1"
             />
          </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (Offset by Sidebar Width) */}
      <div className="flex-1 ml-[20vw] flex flex-col min-h-screen">
        
        {/* Top Header (Full Width, Square) */}
        <header className="sticky top-0 z-40 backdrop-blur-md h-[96px] px-4 flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)', opacity: 0.95, borderBottom: '1px solid var(--color-border-default)' }}>
           
           {/* Search Area */}
           <div className="flex-1 max-w-xl">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--grey-5)]" />
                  <Input 
                      placeholder="Search resources, users, or settings..." 
                      className="pl-10 border-transparent transition-all h-[44px] rounded-lg w-full"
                      style={{ backgroundColor: 'var(--color-bg-muted)' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
           </div>

           {/* Right Actions */}
           <div className="flex items-center gap-3 pl-4">
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onNavigate('/dashboard')}
                  className="gap-2 bg-[var(--grey-2)] text-[var(--grey-9)] hover:bg-[var(--grey-3)] h-[44px] px-4 rounded-lg border border-[var(--grey-3)]"
              >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-medium">Dashboard</span>
              </Button>

              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCurrentView('ui-kit')}
                  className={cn(
                      "gap-2 bg-[var(--grey-2)] text-[var(--grey-9)] hover:bg-[var(--grey-3)] h-[44px] px-4 rounded-lg border border-[var(--grey-3)]", 
                      currentView === 'ui-kit' && "bg-[var(--color-primary-default)] text-[var(--color-primary-on)] border-[var(--color-primary-default)]"
                  )}
              >
                  <Palette className="w-4 h-4" />
                  <span className="hidden md:inline" style={{ fontWeight: 'var(--font-weight-medium)' }}>UI Kit</span>
              </Button>

              <Button variant="ghost" size="icon" className="bg-[var(--grey-2)] text-[var(--grey-9)] hover:bg-[var(--grey-3)] relative rounded-lg h-[44px] w-[44px] border border-[var(--grey-3)]">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute top-2 right-2 min-w-[8px] h-[8px] rounded-full border-2 border-[var(--grey-0)]"
                      style={{ 
                        backgroundColor: 'var(--color-status-danger)',
                        ...(unreadCount > 0 ? {
                          minWidth: '18px',
                          height: '18px',
                          top: '-4px',
                          right: '-4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-inverse)',
                          fontWeight: 'var(--font-weight-medium)',
                          padding: '0 var(--spacing-1)'
                        } : {})
                       }}
                    >
                      {unreadCount}
                    </span>
                  )}
              </Button>

              <div className="flex items-center gap-3 ml-2 px-3 py-1.5 bg-[var(--grey-1)] rounded-lg border border-[var(--grey-2)]">
                  <div className="text-right hidden md:block">
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--grey-9)' }} className="leading-none">Admin User</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--grey-5)', marginTop: '4px' }}>Super Admin</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--grey-3)] text-[var(--grey-7)] flex items-center justify-center">
                      <User className="w-4 h-4" />
                  </div>
              </div>
              
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onNavigate('/')} 
                  style={{ backgroundColor: 'var(--color-status-danger-light)', color: 'var(--color-status-danger)', borderColor: 'var(--color-status-danger-light)' }}
                  className="gap-2 h-[44px] px-4 rounded-lg ml-1 border hover:opacity-80"
              >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline" style={{ fontWeight: 'var(--font-weight-medium)' }}>Exit</span>
              </Button>
           </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 p-8 w-full max-w-[1600px] mx-auto">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>

      </div>
    </div>
  );
}