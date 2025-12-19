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
  ClipboardList
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { AdminUserManager } from './AdminUserManager';
import { AdminConsultationManager } from './AdminConsultationManager';
import { AdminResourceManager } from './AdminResourceManager';
import { AdminAssessmentManager } from './AdminAssessmentManager';
import { AdminEquipProgramManager } from './AdminEquipProgramManager';
import { AdminPageManager } from './AdminPageManager';
import { AdminMediaManager } from './AdminMediaManager';
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

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

type ViewType = 
  | 'dashboard'
  | 'analytics'
  | 'users'
  | 'consultants'
  | 'resources'
  | 'assessments'
  | 'equip'
  | 'pages'
  | 'media'
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
  | 'specs'
  | 'uikit';

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const sidebarItems = [
    {
      section: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart },
        { id: 'users', label: 'User Manager', icon: Settings },
        { id: 'consultants', label: 'Consultant Manager', icon: ClipboardList },
        { id: 'resources', label: 'Resource Manager', icon: Table },
        { id: 'assessments', label: 'Assessments', icon: ClipboardList },
        { id: 'equip', label: 'Equip Programs', icon: BookOpen },
        { id: 'pages', label: 'Pages', icon: FileJson },
        { id: 'media', label: 'Media', icon: FileJson },
        { id: 'settings', label: 'Settings Manager', icon: Settings },
      ]
    },
    {
      section: 'Backend',
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
      section: 'System',
      items: [
        { id: 'communication', label: 'Communication', icon: MessageSquare },
        { id: 'security', label: 'Security', icon: Shield },
      ]
    },
    {
      section: 'API Integration',
      items: [
        { id: 'communication-api', label: 'Communication API', icon: MessageSquare },
        { id: 'payment-gateway', label: 'Payment Gateway', icon: Settings },
      ]
    },
    {
      section: 'Support & Demos',
      items: [
        { id: 'prototype', label: 'Prototype Demo', icon: Layers },
        { id: 'sitemap', label: 'System Sitemap', icon: Map },
        { id: 'navigation', label: 'Navigation Guide', icon: Compass },
        { id: 'specs', label: 'Component Specs', icon: FileJson },
        { id: 'uikit', label: 'UI Kit Showcase', icon: Palette },
      ]
    }
  ];

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
                    <h3 className="font-semibold text-lg">User Manager</h3>
                    <p className="text-sm text-muted-foreground">Manage system users</p>
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
      case 'equip': return <AdminEquipProgramManager onBack={() => setCurrentView('dashboard')} />;
      case 'pages': return <AdminPageManager onBack={() => setCurrentView('dashboard')} />;
      case 'media': return <AdminMediaManager onBack={() => setCurrentView('dashboard')} />;
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
      case 'uikit': return <AdminUIKitShowcase />;
      default: return <div>Not implemented yet</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r h-screen overflow-y-auto fixed left-0 top-0">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Admin Panel
          </h1>
        </div>
        <div className="p-4 space-y-6">
          {sidebarItems.map((section) => (
            <div key={section.section}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {section.section}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      currentView === item.id && "bg-secondary"
                    )}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        setCurrentView(item.id as ViewType);
                        window.scrollTo(0,0);
                      }
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}