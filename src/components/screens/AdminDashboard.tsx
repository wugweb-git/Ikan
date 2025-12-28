import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  FileJson, 
  Activity, 
  Table, 
  BookOpen, 
  Shield, 
  MessageSquare, 
  Monitor, 
  Layers, 
  Map, 
  Compass, 
  Palette,
  LayoutDashboard,
  Server,
  FileText,
  BarChart,
  ClipboardList,
  Users,
  Tag,
  Smile
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { SideNav, SideNavGroup } from '../navigation/SideNav';
import { Logo } from '../Logo';
import { AdminUserManager } from './AdminUserManager';
import { AdminConsultationManager } from './AdminConsultationManager';
import { AdminResourceManager } from './AdminResourceManager';
import { AdminAssessmentManager } from './AdminAssessmentManager';
import { EquipAdminDashboard } from './EquipAdminDashboard';
import { AdminEquipAnalytics } from './AdminEquipAnalytics';
import { AdminPageManager } from './AdminPageManager';
import { AdminMediaManager } from './AdminMediaManager';
import { AdminUserDataManager } from './AdminUserDataManager';
import { AdminNewsletterManager } from './AdminNewsletterManager';
import { AdminSettingsManager } from './AdminSettingsManager';
import { AdminDashboardAnalytics } from './AdminDashboardAnalytics';
import { AdminCRUDTesting } from '../admin/AdminCRUDTesting';
import { AdminDatabaseBrowser } from '../admin/AdminDatabaseBrowser';
import { AdminAPILogs } from '../admin/AdminAPILogs';
import { AdminSystemLogs } from '../admin/AdminSystemLogs';
import { AdminPerformance } from '../admin/AdminPerformance';
import { AdminCommunication } from '../admin/AdminCommunication';
import { AdminCommunicationAPI } from '../admin/AdminCommunicationAPI';
import { AdminPaymentGateway } from '../admin/AdminPaymentGateway';
import { AdminSecurity } from '../admin/AdminSecurity';
import { AdminPrototypeDemo } from '../admin/AdminPrototypeDemo';
import { AdminSystemSitemap } from '../admin/AdminSystemSitemap';
import { AdminNavigationGuide } from '../admin/AdminNavigationGuide';
import { AdminComponentSpecs } from '../admin/AdminComponentSpecs';
import { AdminUIKitShowcase } from '../admin/AdminUIKitShowcase';
import { AdminMigration } from '../admin/AdminMigration';
import { AdminDebugPanel } from '../admin/AdminDebugPanel';
import { AdminCategoryManager } from '../admin/AdminCategoryManager';
import { AdminMoodManager } from '../admin/AdminMoodManager';

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
  | 'user-data'
  | 'settings'
  | 'crud'
  | 'migration'
  | 'db-browser'
  | 'api-logs'
  | 'system-logs'
  | 'performance'
  | 'communication'
  | 'communication-api'
  | 'payment-gateway'
  | 'security'
  | 'prototype'
  | 'sitemap'
  | 'navigation'
  | 'specs';

export function AdminDashboard({ onNavigate, initialView }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>((initialView as ViewType) || 'dashboard');

  // Update view when initialView prop changes
  React.useEffect(() => {
    if (initialView) {
      setCurrentView(initialView as ViewType);
    }
  }, [initialView]);

  const navGroups: SideNavGroup[] = [
    {
      id: 'main',
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart },
        { id: 'users', label: 'Account Management', icon: Settings },
        { id: 'consultants', label: 'Consultant Manager', icon: ClipboardList },
        { id: 'resources', label: 'Resource Manager', icon: Table },
        { id: 'assessments', label: 'Assessments', icon: ClipboardList },
        { id: 'equip', label: 'Equip Programs', icon: BookOpen },
        { id: 'equip-analytics', label: 'Equip Analytics', icon: BarChart },
        { id: 'pages', label: 'Pages', icon: FileJson },
        { id: 'media', label: 'Media', icon: FileJson },
        { id: 'categories', label: 'Categories', icon: Tag },
        { id: 'moods', label: 'Mood Types', icon: Smile },
        { id: 'user-data', label: 'Care Seeker Activity', icon: Users },
        { id: 'settings', label: 'Settings Manager', icon: Settings },
      ]
    },
    {
      id: 'backend',
      title: 'Backend',
      items: [
        { id: 'crud', label: 'CRUD Testing', icon: Activity },
        { id: 'migration', label: 'Migration', icon: Database },
        { id: 'db-browser', label: 'Database Browser', icon: Server },
        { id: 'api-logs', label: 'API Logs', icon: FileText },
        { id: 'system-logs', label: 'System Logs', icon: Monitor },
        { id: 'performance', label: 'Performance', icon: BarChart },
      ]
    },
    {
      id: 'system',
      title: 'System',
      items: [
        { id: 'communication', label: 'Communication', icon: MessageSquare },
        { id: 'security', label: 'Security', icon: Shield },
      ]
    },
    {
      id: 'api-integration',
      title: 'API Integration',
      items: [
        { id: 'communication-api', label: 'Communication API', icon: MessageSquare },
        { id: 'payment-gateway', label: 'Payment Gateway', icon: Settings },
      ]
    },
    {
      id: 'support-demos',
      title: 'Support & Demos',
      items: [
        { id: 'prototype', label: 'Prototype Demo', icon: Layers },
        { id: 'sitemap', label: 'System Sitemap', icon: Map },
        { id: 'navigation', label: 'Navigation Guide', icon: Compass },
        { id: 'specs', label: 'Component Specs', icon: FileJson },
        { id: 'uikit', label: 'UI Kit Showcase', icon: Palette },
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
              <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
              <p className="text-muted-foreground">Welcome to the iKan system administration panel.</p>
            </div>
            
            {/* Debug Panel */}
            <AdminDebugPanel />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div 
                className="p-6 bg-white border rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setCurrentView('users')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Account Management</h3>
                    <p className="text-sm text-muted-foreground">Manage user access & roles</p>
                  </div>
                </div>
              </div>

              <div 
                className="p-6 bg-white border rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setCurrentView('resources')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <Table className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Resources</h3>
                    <p className="text-sm text-muted-foreground">Manage content library</p>
                  </div>
                </div>
              </div>

              <div 
                className="p-6 bg-white border rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setCurrentView('crud')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">System Health</h3>
                    <p className="text-sm text-muted-foreground">Check status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analytics': return <AdminDashboardAnalytics onBack={() => setCurrentView('dashboard')} />;
      case 'users': return <AdminUserManager onBack={() => setCurrentView('dashboard')} />;
      case 'consultants': return <AdminConsultationManager onBack={() => setCurrentView('dashboard')} />;
      case 'resources': return <AdminResourceManager onBack={() => setCurrentView('dashboard')} />;
      case 'assessments': return <AdminAssessmentManager onBack={() => setCurrentView('dashboard')} />;
      case 'equip': return <EquipAdminDashboard />;
      case 'equip-analytics': return <AdminEquipAnalytics onBack={() => setCurrentView('dashboard')} />;
      case 'pages': return <AdminPageManager onBack={() => setCurrentView('dashboard')} />;
      case 'media': return <AdminMediaManager onBack={() => setCurrentView('dashboard')} />;
      case 'categories': return <AdminCategoryManager onBack={() => setCurrentView('dashboard')} />;
      case 'moods': return <AdminMoodManager onBack={() => setCurrentView('dashboard')} />;
      case 'user-data': return <AdminUserDataManager onBack={() => setCurrentView('dashboard')} />;
      case 'settings': return <AdminSettingsManager onBack={() => setCurrentView('dashboard')} />;
      case 'crud': return <AdminCRUDTesting />;
      case 'migration': return <AdminMigration />;
      case 'db-browser': return <AdminDatabaseBrowser />;
      case 'api-logs': return <AdminAPILogs />;
      case 'system-logs': return <AdminSystemLogs />;
      case 'performance': return <AdminPerformance />;
      case 'communication': return <AdminCommunication />;
      case 'communication-api': return <AdminCommunicationAPI />;
      case 'payment-gateway': return <AdminPaymentGateway />;
      case 'security': return <AdminSecurity />;
      case 'prototype': return <AdminPrototypeDemo />;
      case 'sitemap': return <AdminSystemSitemap />;
      case 'navigation': return <AdminNavigationGuide />;
      case 'specs': return <AdminComponentSpecs />;
      default: return <div>Not implemented yet</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-gray-900 border-b border-gray-800 h-[var(--ikan-nav-height-mobile)] md:h-[var(--ikan-nav-height-desktop)] px-6 flex items-center justify-between sticky top-0 z-20 shadow-md w-full text-white">
         <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1">
              <Logo showText={false} iconSize={24} />
            </div>
            <div className="h-6 w-px bg-gray-700 mx-2 hidden md:block"></div>
            <span className="text-gray-200 font-medium hidden md:block">Admin Console</span>
         </div>
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/')} className="text-gray-300 hover:text-white hover:bg-gray-800">Exit Admin</Button>
         </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside className="w-64 fixed left-0 top-[var(--ikan-nav-height-mobile)] md:top-[var(--ikan-nav-height-desktop)] bottom-0 overflow-y-auto bg-gray-50 border-r hidden md:block z-10 custom-scrollbar">
          <div className="p-4">
            <SideNav 
              groups={navGroups} 
              className="bg-transparent shadow-none p-0 w-full"
              logoutLabel="Exit Admin"
              onLogout={() => onNavigate('/')}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
