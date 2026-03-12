import { useState, useEffect } from 'react';
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
  Inbox,
  Menu,
  X,
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
import { AdminCommunicationAPI } from '../admin/AdminCommunicationAPI';
import { AdminPaymentGateway } from '../admin/AdminPaymentGateway';
import { AdminSecurity } from '../admin/AdminSecurity';
import { AdminCategoryManager } from '../admin/AdminCategoryManager';
import { AdminMoodManager } from '../admin/AdminMoodManager';
import { AdminCheckinScalesManager } from '../admin/AdminCheckinScalesManager';
import { RecommendationRulesManager } from '../admin/recommendations/RecommendationRulesManager';
import { AdminBackupManager } from '../admin/AdminBackupManager';
import { UIKitPatterns } from '../uikit/UIKitPatterns';
import { AdminKVAudit } from '../admin/AdminKVAudit';
import { AdminContactSubmissions } from '../admin/AdminContactSubmissions';
import { AdminCheckinTemplateBuilder } from '../admin/AdminCheckinTemplateBuilder';
import { AdminHeroBannerManager } from '../admin/AdminHeroBannerManager';

// Mobile sidebar hook
function useIsMobileAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isCompact, setIsCompact] = useState(window.innerWidth >= 1024 && window.innerWidth < 1280);
  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth;
      setIsMobile(w < 1024);
      setIsCompact(w >= 1024 && w < 1280);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return { isMobile, isCompact };
}

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
  | 'communication-api'
  | 'payment-gateway'
  | 'security'
  | 'backup'
  | 'ui-kit'
  | 'kv-audit'
  | 'contact-newsletter'
  | 'checkin-builder'
  | 'hero-banner';

export function AdminDashboard({ onNavigate, initialView }: AdminDashboardProps) {
  const { unreadCount } = useNotifications();
  const [currentView, setCurrentView] = useState<ViewType>((initialView as ViewType) || 'dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobile, isCompact } = useIsMobileAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
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
        { id: 'checkin-builder', label: 'Check-in Builder', icon: Smile },
        { id: 'consultants', label: 'Consultants', icon: Stethoscope },
        { id: 'pages', label: 'Pages', icon: FileText },
        { id: 'media', label: 'Media Library', icon: Image },
        { id: 'hero-banner', label: 'Hero Banners', icon: Palette },
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
        { id: 'contact-newsletter', label: 'Contact & Newsletter', icon: Inbox },
        { id: 'payment-gateway', label: 'Payments', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'crud', label: 'System Health', icon: HeartPulse },
        { id: 'backup', label: 'Backups', icon: Database },
        { id: 'kv-audit', label: 'KV Audit', icon: Search },
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
        if (isMobile) setSidebarOpen(false);
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
                <AdminDashboardAnalytics embedded />
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
      case 'kv-audit': return <AdminKVAudit onBack={() => setCurrentView('dashboard')} />;
      case 'system-logs': return <AdminSystemLogs onBack={() => setCurrentView('dashboard')} />;
      case 'communication': return <AdminCommunication onBack={() => setCurrentView('dashboard')} onNavigateToAPI={() => setCurrentView('communication-api')} />;
      case 'communication-api': return <AdminCommunicationAPI />;
      case 'payment-gateway': return <AdminPaymentGateway onBack={() => setCurrentView('dashboard')} />;
      case 'security': return <AdminSecurity onBack={() => setCurrentView('dashboard')} />;
      case 'ui-kit': return <UIKitPatterns />;
      case 'contact-newsletter': return <AdminContactSubmissions onBack={() => setCurrentView('dashboard')} />;
      case 'checkin-builder': return <AdminCheckinTemplateBuilder onBack={() => setCurrentView('dashboard')} />;
      case 'hero-banner': return <AdminHeroBannerManager onBack={() => setCurrentView('dashboard')} />;
      default: return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--grey-1)] flex font-sans overflow-x-hidden">

      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* 1. SIDEBAR — fixed on desktop, slide-over on mobile */}
      <aside
        className={cn(
          "w-[260px] min-w-[260px] fixed inset-y-0 left-0 bg-[var(--grey-0)] border-r border-[var(--grey-2)] z-50 flex flex-col transition-transform duration-300",
          isMobile && !sidebarOpen && "-translate-x-full",
          isMobile && sidebarOpen && "translate-x-0"
        )}
      >
          {/* Header Area in Sidebar */}
          <div className="h-[64px] lg:h-[96px] flex items-center px-4 border-b border-[var(--grey-2)] justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--primary)] rounded-lg p-1.5 lg:p-2 flex items-center justify-center" style={{ color: 'var(--color-text-inverse)' }}>
                  <Logo showText={false} iconSize={isMobile ? 28 : 40} style={{ color: 'var(--color-text-inverse)' }} />
                </div>
                <div>
                  <span className="text-[var(--grey-9)] text-lg lg:text-xl tracking-tight block leading-none" style={{ fontWeight: 'var(--font-weight-medium)' }}>iKan</span>
                  <span className="text-[var(--grey-5)] text-xs uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-medium)' }}>Admin Console</span>
                </div>
              </div>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8">
                  <X className="w-5 h-5" />
                </Button>
              )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
             <SideNav 
               groups={navGroups} 
               className="w-full space-y-1"
             />
          </div>
      </aside>

      {/* 2. MAIN CONTENT AREA — offset by sidebar on desktop, full-width on mobile */}
      <div className={cn("flex-1 flex flex-col min-h-screen min-w-0", !isMobile && "ml-[260px]")}>
        
        {/* Top Header */}
        <header
          className="sticky top-0 z-30 backdrop-blur-md px-3 lg:px-4 flex items-center justify-between gap-2"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            opacity: 0.95,
            borderBottom: '1px solid var(--color-border-default)',
            height: isMobile ? '56px' : '96px',
          }}
        >
           {/* Mobile hamburger */}
           {isMobile && (
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setSidebarOpen(true)}
               className="shrink-0 h-[44px] w-[44px] rounded-lg bg-[var(--grey-2)] text-[var(--grey-9)] border border-[var(--grey-3)]"
             >
               <Menu className="w-5 h-5" />
             </Button>
           )}

           {/* Search Area */}
           <div className="flex-1 min-w-0 max-w-xl">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--grey-5)]" />
                  <Input 
                      placeholder={isMobile ? "Search..." : "Search resources, users, or settings..."} 
                      className="pl-10 border-transparent transition-all h-[44px] rounded-lg w-full"
                      style={{ backgroundColor: 'var(--color-bg-muted)' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
           </div>

           {/* Right Actions */}
           <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              {/* Desktop-only buttons — icon-only in compact mode (1024–1280px) */}
              {!isMobile && (
                <>
                  <Button 
                      variant="ghost" 
                      size={isCompact ? "icon" : "sm"}
                      onClick={() => onNavigate('/dashboard')}
                      className={cn(
                        "bg-[var(--grey-2)] text-[var(--grey-9)] hover:bg-[var(--grey-3)] h-[44px] rounded-lg border border-[var(--grey-3)]",
                        isCompact ? "w-[44px]" : "gap-2 px-4"
                      )}
                      title="Go to Dashboard"
                  >
                      <LayoutDashboard className="w-4 h-4" />
                      {!isCompact && <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Dashboard</span>}
                  </Button>

                  <Button 
                      variant="ghost" 
                      size={isCompact ? "icon" : "sm"}
                      onClick={() => setCurrentView('ui-kit')}
                      className={cn(
                          "bg-[var(--grey-2)] text-[var(--grey-9)] hover:bg-[var(--grey-3)] h-[44px] rounded-lg border border-[var(--grey-3)]",
                          isCompact ? "w-[44px]" : "gap-2 px-4",
                          currentView === 'ui-kit' && "bg-[var(--color-primary-default)] text-[var(--color-primary-on)] border-[var(--color-primary-default)]"
                      )}
                      title="UI Kit"
                  >
                      <Palette className="w-4 h-4" />
                      {!isCompact && <span style={{ fontWeight: 'var(--font-weight-medium)' }}>UI Kit</span>}
                  </Button>
                </>
              )}

              <Button variant="ghost" size="icon" className="bg-[var(--grey-2)] text-[var(--grey-9)] hover:bg-[var(--grey-3)] relative rounded-lg h-[44px] w-[44px] border border-[var(--grey-3)]">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute rounded-full border-2 border-[var(--grey-0)]"
                      style={{ 
                        backgroundColor: 'var(--color-status-danger)',
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
                       }}
                    >
                      {unreadCount}
                    </span>
                  )}
              </Button>

              {/* User avatar — always visible, name only on wide desktop */}
              <div className="flex items-center gap-2 lg:gap-3 lg:ml-2 px-2 lg:px-3 py-1.5 bg-[var(--grey-1)] rounded-lg border border-[var(--grey-2)]">
                  {!isMobile && !isCompact && (
                    <div className="text-right">
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--grey-9)' }} className="leading-none">Admin User</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--grey-5)', marginTop: '4px' }}>Super Admin</p>
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-[var(--grey-3)] text-[var(--grey-7)] flex items-center justify-center">
                      <User className="w-4 h-4" />
                  </div>
              </div>
              
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onNavigate('/')} 
                  style={{ backgroundColor: 'var(--color-status-danger-light)', color: 'var(--color-status-danger)', borderColor: 'var(--color-status-danger-light)' }}
                  className={cn("gap-2 h-[44px] rounded-lg border hover:opacity-80", (isMobile || isCompact) ? "px-2 w-[44px]" : "px-4 ml-1")}
                  title="Exit Admin"
              >
                  <LogOut className="w-4 h-4" />
                  {!isMobile && !isCompact && <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Exit</span>}
              </Button>
           </div>
        </header>

        {/* Scrollable Main Content */}
        <main className={cn("flex-1 w-full max-w-[1600px] mx-auto", isMobile ? "p-4" : "p-8")}>
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>

      </div>
    </div>
  );
}