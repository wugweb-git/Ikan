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
          <div className="space-y-6">
            <div>
              <h2 style={{ 
                fontSize: 'var(--text-3xl)', 
                fontWeight: 'var(--font-weight-medium)', 
                color: 'var(--color-text-primary)' 
              }}>
                Admin Dashboard
              </h2>
              <p style={{ 
                fontSize: 'var(--text-base)', 
                color: 'var(--color-text-muted)' 
              }}>
                Overview of system performance and recent activity.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow group border-l-4 border-l-[var(--color-primary-default)]"
                onClick={() => setCurrentView('users')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-[var(--color-text-primary)]">User Management</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage accounts and roles</p>
                  </div>
                  <div className="p-2 bg-[var(--color-primary-light)] text-[var(--color-primary-default)] rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow group border-l-4 border-l-[var(--color-accent-default)]"
                onClick={() => setCurrentView('equip')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Equip Programs</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage courses and content</p>
                  </div>
                  <div className="p-2 bg-[var(--color-accent-light)] text-[var(--color-accent-default)] rounded-lg group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow group border-l-4 border-l-[var(--color-status-success)]"
                onClick={() => setCurrentView('crud')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-[var(--color-text-primary)]">System Health</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Status: Operational</p>
                  </div>
                  <div className="p-2 bg-[var(--color-status-success-light)] text-[var(--color-status-success)] rounded-lg group-hover:scale-110 transition-transform">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
                 <AdminDashboardAnalytics onBack={() => {}} />
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
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[var(--color-border-light)] h-[var(--ikan-nav-height-desktop)] px-6 flex items-center justify-between sticky top-0 z-[60] shadow-sm w-full">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--color-primary-default)] rounded-lg p-1.5 text-white">
                <Logo showText={false} iconSize={20} />
              </div>
              <div>
                <span className="text-[var(--color-text-primary)] font-semibold text-lg tracking-tight block leading-none">iKan</span>
                <span className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">Admin Console</span>
              </div>
            </div>
         </div>

         <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                    placeholder="Search resources, users, or settings..." 
                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
         </div>

         <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('ui-kit')}
                className={cn(
                    "gap-2 text-gray-500 hover:text-[var(--color-primary-default)]", 
                    currentView === 'ui-kit' && "bg-primary/10 text-primary"
                )}
            >
                <Palette className="w-4 h-4" />
                <span className="hidden md:inline">UI Kit</span>
            </Button>

            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[var(--color-primary-default)] relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            
            <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">Admin User</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Super Admin</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary-default)] flex items-center justify-center border border-[var(--color-primary-light)]">
                    <User className="w-4 h-4" />
                </div>
            </div>
            
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('/')} 
                className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
            >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Exit</span>
            </Button>
         </div>
      </header>

      <div className="flex flex-1 relative">
        <aside className="w-64 fixed left-0 top-[var(--ikan-nav-height-desktop)] bottom-0 overflow-y-auto bg-white border-r border-[var(--color-border-default)] hidden md:block z-[50] custom-scrollbar">
          <div className="p-4">
            <SideNav 
              groups={navGroups} 
              className="bg-transparent shadow-none p-0 w-full"
              logoutLabel="Exit Admin"
              onLogout={() => onNavigate('/')}
            />
          </div>
          <div className="p-4 mt-auto border-t border-gray-100">
             <div className="text-xs text-center text-gray-400">
                v1.2.0 • Build 2405
             </div>
          </div>
        </aside>

        <main className="flex-1 md:ml-64 p-6 w-full max-w-[100vw] overflow-x-hidden bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}