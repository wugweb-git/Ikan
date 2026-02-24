import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart, 
  Users, 
  ClipboardList, 
  Table, 
  Activity, 
  BookOpen, 
  FileJson, 
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
  LogOut
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
import { RecommendationRulesManager } from '../admin/recommendations/RecommendationRulesManager';
import { AdminBackupManager } from '../admin/AdminBackupManager';
import { UIKitPatterns } from '../uikit/UIKitPatterns';
import { Palette } from 'lucide-react';

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
        { id: 'consultants', label: 'Consultants', icon: ClipboardList },
        { id: 'pages', label: 'Pages', icon: FileJson },
        { id: 'media', label: 'Media Library', icon: FileJson },
      ]
    },
    {
      id: 'configuration',
      title: 'Configuration',
      items: [
        { id: 'categories', label: 'Categories', icon: Tag },
        { id: 'moods', label: 'Mood Types', icon: Smile },
        { id: 'recommendations', label: 'Rules Engine', icon: Activity },
        { id: 'settings', label: 'Global Settings', icon: Settings },
      ]
    },
    {
      id: 'system',
      title: 'System & Logs',
      items: [
        { id: 'user-data', label: 'User Activity', icon: Activity },
        { id: 'communication', label: 'Communication', icon: MessageSquare },
        { id: 'payment-gateway', label: 'Payments', icon: Settings },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'crud', label: 'System Health', icon: Activity },
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
                    style={{ borderRadius: '20px' }}
                    onClick={() => setCurrentView('users')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">User Management</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage accounts and roles</p>
                      </div>
                      <div className="p-2 bg-[var(--grey-2)] text-[var(--color-primary-default)] rounded-lg group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className="p-6 cursor-pointer hover:shadow-md transition-all group border border-[var(--color-border-default)] cbt-card-small"
                    style={{ borderRadius: '20px' }}
                    onClick={() => setCurrentView('equip')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Equip Programs</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage courses and content</p>
                      </div>
                      <div className="p-2 bg-[var(--grey-2)] text-[var(--color-accent-default)] rounded-lg group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className="p-6 cursor-pointer hover:shadow-md transition-all group border border-[var(--color-border-default)] cbt-card-small"
                    style={{ borderRadius: '20px' }}
                    onClick={() => setCurrentView('crud')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">System Health</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">Status: Operational</p>
                      </div>
                      <div className="p-2 bg-green-50 text-[var(--color-status-success)] rounded-lg group-hover:scale-110 transition-transform relative">
                        <Activity className="w-5 h-5 animate-pulse" />
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
      case 'recommendations': return <RecommendationRulesManager onBack={() => setCurrentView('dashboard')} />;
      case 'user-data': return <AdminUserDataManager onBack={() => setCurrentView('dashboard')} />;
      case 'settings': return <AdminSettingsManager onBack={() => setCurrentView('dashboard')} />;
      case 'crud': return <AdminCRUDTesting />;
      case 'backup': return <AdminBackupManager />;
      case 'system-logs': return <AdminSystemLogs />;
      case 'communication': return <AdminCommunication />;
      case 'payment-gateway': return <AdminPaymentGateway />;
      case 'security': return <AdminSecurity />;
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
                <div className="bg-[var(--primary)] rounded-lg p-2 text-white">
                  <Logo showText={false} iconSize={40} />
                </div>
                <div>
                  <span className="text-[var(--grey-9)] font-bold text-xl tracking-tight block leading-none">iKan</span>
                  <span className="text-[var(--grey-5)] text-xs font-medium uppercase tracking-wider">Admin Console</span>
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
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[var(--grey-2)] h-[96px] px-4 flex items-center justify-between">
           
           {/* Search Area */}
           <div className="flex-1 max-w-xl">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--grey-5)]" />
                  <Input 
                      placeholder="Search resources, users, or settings..." 
                      className="pl-10 bg-[var(--grey-1)] border-transparent focus:bg-white focus:border-[var(--grey-3)] transition-all h-[44px] rounded-lg w-full"
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
                      currentView === 'ui-kit' && "bg-[var(--primary)] text-white border-[var(--primary)]"
                  )}
              >
                  <Palette className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">UI Kit</span>
              </Button>

              <Button variant="ghost" size="icon" className="bg-[var(--grey-2)] text-[var(--grey-9)] hover:bg-[var(--grey-3)] relative rounded-lg h-[44px] w-[44px] border border-[var(--grey-3)]">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-3 right-3 w-2 h-2 bg-[var(--danger)] rounded-full border-2 border-[var(--grey-0)]"></span>
              </Button>

              <div className="flex items-center gap-3 ml-2 px-3 py-1.5 bg-[var(--grey-1)] rounded-lg border border-[var(--grey-2)]">
                  <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-[var(--grey-9)] leading-none">Admin User</p>
                      <p className="text-xs text-[var(--grey-5)] mt-1">Super Admin</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--grey-3)] text-[var(--grey-7)] flex items-center justify-center">
                      <User className="w-4 h-4" />
                  </div>
              </div>
              
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onNavigate('/')} 
                  className="text-[var(--danger)] bg-red-50 hover:bg-red-100 hover:text-[var(--danger)] gap-2 h-[44px] px-4 rounded-lg ml-1 border border-red-100"
              >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Exit</span>
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