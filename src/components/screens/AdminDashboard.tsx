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
  Server, 
  FileText, 
  Monitor, 
  MessageSquare, 
  Shield, 
  Layers, 
  Map, 
  Compass, 
  Palette 
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card'; // Import Card component
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
import { RecommendationRulesManager } from '../admin/recommendations/RecommendationRulesManager';
import { SeedDailyTracker } from '../admin/SeedDailyTracker';
import { SeedEquipPrograms } from '../admin/SeedEquipPrograms';
import { AdminBackupManager } from '../admin/AdminBackupManager';

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
  | 'uikit'
  | 'seed-tracker'
  | 'seed-equip'
  | 'backup';

export function AdminDashboard({ onNavigate, initialView }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>((initialView as ViewType) || 'dashboard');

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
        { id: 'recommendations', label: 'Recommendations', icon: Activity },
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
        { id: 'seed-tracker', label: 'Seed Daily Tracker', icon: Database },
        { id: 'seed-equip', label: 'Seed Equip Programs', icon: Database },
        { id: 'backup', label: 'System Recovery', icon: Database },
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
                Welcome to the iKan system administration panel.
              </p>
            </div>
            
            <AdminDebugPanel />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Refactored Dashboard Cards to use <Card> component */}
              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView('users')}
                role="button"
                tabIndex={0}
                aria-label="Manage accounts"
                onKeyDown={(e) => e.key === 'Enter' && setCurrentView('users')}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-default)',
                      borderRadius: 'var(--radius-md)'
                    }}
                    aria-hidden="true"
                  >
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: 'var(--text-lg)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--color-text-primary)' 
                    }}>
                      Account Management
                    </h3>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)' 
                    }}>
                      Manage user access & roles
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView('equip')}
                role="button"
                tabIndex={0}
                aria-label="Manage equip programs"
                onKeyDown={(e) => e.key === 'Enter' && setCurrentView('equip')}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-accent-light)',
                      color: 'var(--color-accent-default)',
                      borderRadius: 'var(--radius-md)'
                    }}
                    aria-hidden="true"
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: 'var(--text-lg)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--color-text-primary)' 
                    }}>
                      Equip Programs
                    </h3>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)' 
                    }}>
                      Manage courses
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView('resources')}
                role="button"
                tabIndex={0}
                aria-label="Manage resources"
                onKeyDown={(e) => e.key === 'Enter' && setCurrentView('resources')}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-accent-light)',
                      color: 'var(--color-accent-default)',
                      borderRadius: 'var(--radius-md)'
                    }}
                    aria-hidden="true"
                  >
                    <Table className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: 'var(--text-lg)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--color-text-primary)' 
                    }}>
                      Resources
                    </h3>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)' 
                    }}>
                      Manage content library
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView('crud')}
                role="button"
                tabIndex={0}
                aria-label="View system health"
                onKeyDown={(e) => e.key === 'Enter' && setCurrentView('crud')}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-status-success-light)',
                      color: 'var(--color-status-success)',
                      borderRadius: 'var(--radius-md)'
                    }}
                    aria-hidden="true"
                  >
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: 'var(--text-lg)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--color-text-primary)' 
                    }}>
                      System Health
                    </h3>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)' 
                    }}>
                      Check status
                    </p>
                  </div>
                </div>
              </Card>
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
      case 'seed-tracker': return <SeedDailyTracker />;
      case 'seed-equip': return <SeedEquipPrograms />;
      case 'backup': return <AdminBackupManager />;
      case 'migration': return <AdminMigration />;
      case 'db-browser': return <AdminDatabaseBrowser />;
      case 'api-logs': return <AdminAPILogs />;
      case 'system-logs': return <AdminSystemLogs />;
      case 'performance': return <AdminPerformance />;
      case 'communication': return <AdminCommunication />;
      case 'communication-api': return <AdminCommunicationAPI />;
      case 'payment-gateway': return <AdminPaymentGateway />;
      case 'security': return <AdminSecurity />;
      case 'prototype': return <AdminPrototypeDemo onNavigate={(route) => onNavigate(route)} />;
      case 'sitemap': return <AdminSystemSitemap onNavigate={(route) => onNavigate(route)} />;
      case 'navigation': return <AdminNavigationGuide />;
      case 'specs': return <AdminComponentSpecs />;
      case 'uikit': return <AdminUIKitShowcase />;
      default: return <div>Not implemented yet</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col">
      <header className="bg-[var(--color-primary-default)] border-b border-[var(--color-border-light)] h-[var(--ikan-nav-height-mobile)] md:h-[var(--ikan-nav-height-desktop)] px-6 flex items-center justify-between sticky top-0 z-[60] shadow-md w-full text-[var(--color-primary-on)]">
         <div className="flex items-center gap-3">
            <div className="bg-[var(--color-bg-card)] rounded-full p-1 text-[var(--color-primary-default)]">
              <Logo showText={false} iconSize={24} />
            </div>
            <div className="h-6 w-px bg-[var(--color-border-light)] mx-2 hidden md:block opacity-20"></div>
            <span className="text-[var(--color-primary-on)] font-medium hidden md:block">Admin Console</span>
         </div>
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/')} className="text-[var(--color-primary-on)] hover:text-white hover:bg-white/10">Exit Admin</Button>
         </div>
      </header>

      <div className="flex flex-1 relative">
        <aside className="w-64 fixed left-0 top-[var(--ikan-nav-height-mobile)] md:top-[var(--ikan-nav-height-desktop)] bottom-0 overflow-y-auto bg-[var(--color-bg-page)] border-r border-[var(--color-border-default)] hidden md:block z-[50] custom-scrollbar">
          <div className="p-4">
            <SideNav 
              groups={navGroups} 
              className="bg-transparent shadow-none p-0 w-full"
              logoutLabel="Exit Admin"
              onLogout={() => onNavigate('/')}
            />
          </div>
        </aside>

        <main className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
