import { useState, useEffect, lazy, Suspense, useMemo, useCallback, useRef } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
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
  MessageSquare, 
  Search,
  Bell,
  User,
  LogOut,
  Stethoscope,
  Image,
  Sparkles,
  CreditCard,
  HeartPulse,
  Palette,
  Zap,
  Inbox,
  Menu,
  X,
  Loader2,
  Blocks,
  Calculator,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { SideNav, SideNavGroup } from '../navigation/SideNav';
import { Logo } from '../Logo';
import { ErrorBoundary } from '../ErrorBoundary';

// ── ALL admin screens are lazy-loaded ──────────────────────────────
// Only the screen the user navigates to gets downloaded & parsed.
// This prevents the entire admin bundle (~20 heavy screens) from
// blocking the initial dashboard render, which was causing hangs.
const L = {
  UserManager: lazy(() => import('./AdminUserManager').then(m => ({ default: m.AdminUserManager }))),
  ConsultationManager: lazy(() => import('./AdminConsultationManager').then(m => ({ default: m.AdminConsultationManager }))),
  ResourceManager: lazy(() => import('./AdminResourceManager').then(m => ({ default: m.AdminResourceManager }))),
  AssessmentManager: lazy(() => import('./AdminAssessmentManager').then(m => ({ default: m.AdminAssessmentManager }))),
  EquipDashboard: lazy(() => import('./EquipAdminDashboard').then(m => ({ default: m.EquipAdminDashboard }))),
  PageManager: lazy(() => import('./AdminPageManager').then(m => ({ default: m.AdminPageManager }))),
  MediaManager: lazy(() => import('./AdminMediaManager').then(m => ({ default: m.AdminMediaManager }))),
  SettingsManager: lazy(() => import('./AdminSettingsManager').then(m => ({ default: m.AdminSettingsManager }))),
  Analytics: lazy(() => import('./AdminDashboardAnalytics').then(m => ({ default: m.AdminDashboardAnalytics }))),
  EquipAnalytics: lazy(() => import('./AdminEquipAnalytics').then(m => ({ default: m.AdminEquipAnalytics }))),
  Communication: lazy(() => import('../admin/AdminCommunication').then(m => ({ default: m.AdminCommunication }))),
  PaymentGateway: lazy(() => import('../admin/AdminPaymentGateway').then(m => ({ default: m.AdminPaymentGateway }))),
  CategoryManager: lazy(() => import('../admin/AdminCategoryManager').then(m => ({ default: m.AdminCategoryManager }))),
  CheckinScalesManager: lazy(() => import('../admin/AdminCheckinScalesManager').then(m => ({ default: m.AdminCheckinScalesManager }))),
  RecommendationRules: lazy(() => import('../admin/recommendations/RecommendationRulesManager').then(m => ({ default: m.RecommendationRulesManager }))),
  BackupManager: lazy(() => import('../admin/AdminBackupManager').then(m => ({ default: m.AdminBackupManager }))),
  CheckinBuilder: lazy(() => import('../admin/AdminCheckinTemplateBuilder').then(m => ({ default: m.AdminCheckinTemplateBuilder }))),
  HeroBannerManager: lazy(() => import('../admin/AdminHeroBannerManager').then(m => ({ default: m.AdminHeroBannerManager }))),
  KVAudit: lazy(() => import('../admin/AdminKVAudit').then(m => ({ default: m.AdminKVAudit }))),
  CRUDTesting: lazy(() => import('../admin/AdminCRUDTesting').then(m => ({ default: m.AdminCRUDTesting }))),
  ContactSubmissions: lazy(() => import('../admin/AdminContactSubmissions').then(m => ({ default: m.AdminContactSubmissions }))),
  BlockTypeViewer: lazy(() => import('../admin/AdminBlockTypeViewer').then(m => ({ default: m.AdminBlockTypeViewer }))),
  ScoringEngine: lazy(() => import('../admin/AdminScoringEngine').then(m => ({ default: m.AdminScoringEngine }))),
};

// Stable Suspense wrapper - defined OUTSIDE component to prevent remounting
function SuspenseScreen({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-8 gap-3" style={{ minHeight: 200 }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</span>
      </div>
    }>{children}</Suspense>
  );
}

// Mobile sidebar hook - with throttled resize
function useIsMobileAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isCompact, setIsCompact] = useState(window.innerWidth >= 1024 && window.innerWidth < 1280);
  const rafRef = useRef(0);
  useEffect(() => {
    const handler = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const w = window.innerWidth;
        setIsMobile(w < 1024);
        setIsCompact(w >= 1024 && w < 1280);
      });
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
      cancelAnimationFrame(rafRef.current);
    };
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
  | 'checkin-scales'
  | 'recommendations'
  | 'settings'
  | 'crud'
  | 'communication'
  | 'payment-gateway'
  | 'backup'
  | 'kv-audit'
  | 'contact-newsletter'
  | 'checkin-builder'
  | 'hero-banner'
  | 'block-type-viewer'
  | 'scoring-engine';

export function AdminDashboard({ onNavigate, initialView }: AdminDashboardProps) {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>((initialView as ViewType) || 'dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobile, isCompact } = useIsMobileAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ id: ViewType; label: string; group: string }[]>([]);

  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView as ViewType);
    }
  }, [initialView]);

  // Search through admin sections
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const allItems: { id: ViewType; label: string; group: string; keywords: string }[] = [
      { id: 'dashboard', label: 'Dashboard', group: 'Overview', keywords: 'home overview' },
      { id: 'analytics', label: 'Analytics', group: 'Overview', keywords: 'charts graphs stats metrics' },
      { id: 'users', label: 'Users & Accounts', group: 'Overview', keywords: 'user account member role admin' },
      { id: 'equip', label: 'Equip Programs', group: 'Content', keywords: 'program course equip module day block' },
      { id: 'assessments', label: 'Assessments', group: 'Content', keywords: 'assessment quiz test survey' },
      { id: 'resources', label: 'Resources', group: 'Content', keywords: 'resource article blog library' },
      { id: 'checkin-builder', label: 'Check-in Builder', group: 'Content', keywords: 'checkin check-in template builder mood' },
      { id: 'consultants', label: 'Consultants', group: 'Content', keywords: 'consultant therapist professional doctor' },
      { id: 'pages', label: 'Pages', group: 'Content', keywords: 'page cms content privacy terms faq' },
      { id: 'media', label: 'Media Library', group: 'Content', keywords: 'media image upload file photo' },
      { id: 'hero-banner', label: 'Hero Banners', group: 'Content', keywords: 'hero banner header image' },
      { id: 'categories', label: 'Meta Manager', group: 'Config', keywords: 'category tag label metadata type mood' },
      { id: 'checkin-scales', label: 'Check-in Scales', group: 'Config', keywords: 'scale checkin energy stress sleep' },
      { id: 'recommendations', label: 'Rules Engine', group: 'Config', keywords: 'recommendation rule engine severity' },
      { id: 'scoring-engine', label: 'Scoring Engine', group: 'Config', keywords: 'scoring engine' },
      { id: 'block-type-viewer', label: 'Block Types', group: 'Config', keywords: 'block type viewer' },
      { id: 'settings', label: 'Global Settings', group: 'Config', keywords: 'settings config configuration' },
      { id: 'communication', label: 'Communication', group: 'System', keywords: 'email notification message brevo' },
      { id: 'contact-newsletter', label: 'Contact & Newsletter', group: 'System', keywords: 'contact newsletter subscription' },
      { id: 'payment-gateway', label: 'Payments', group: 'System', keywords: 'payment razorpay gateway transaction' },
      { id: 'crud', label: 'System Health', group: 'System', keywords: 'health status api endpoint crud' },
      { id: 'backup', label: 'Backups', group: 'System', keywords: 'backup restore checkpoint' },
      { id: 'kv-audit', label: 'KV Audit', group: 'System', keywords: 'kv audit database key value prefix' },
    ];
    const matches = allItems.filter(item =>
      item.label.toLowerCase().includes(q) || item.keywords.includes(q) || item.group.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  }, [searchQuery]);

  const navGroups: SideNavGroup[] = useMemo(() => [
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
        { id: 'categories', label: 'Meta Manager', icon: Tag },
        { id: 'checkin-scales', label: 'Check-in Scales', icon: Zap },
        { id: 'recommendations', label: 'Rules Engine', icon: Sparkles },
        { id: 'scoring-engine', label: 'Scoring Engine', icon: Calculator },
        { id: 'block-type-viewer', label: 'Block Types', icon: Blocks },
        { id: 'settings', label: 'Global Settings', icon: Settings },
      ]
    },
    {
      id: 'system',
      title: 'System & Logs',
      items: [
        { id: 'communication', label: 'Communication', icon: MessageSquare },
        { id: 'contact-newsletter', label: 'Contact & Newsletter', icon: Inbox },
        { id: 'payment-gateway', label: 'Payments', icon: CreditCard },
        { id: 'crud', label: 'System Health', icon: HeartPulse },
        { id: 'backup', label: 'Backups', icon: Database },
        { id: 'kv-audit', label: 'KV Audit', icon: Search },
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
  })), [currentView, isMobile]);
  
  const goBack = useCallback(() => setCurrentView('dashboard'), []);
  
  const renderContent = () => {
    // Every screen is wrapped in Suspense so only the active one loads
    // IMPORTANT: Use SuspenseScreen directly instead of an inline wrapper 
    // to prevent remounting children when AdminDashboard re-renders.
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-8 admin-dashboard-header">
            <div>
              <h1 style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-2)'
              }}>
                Admin Dashboard
              </h1>
              <p style={{ 
                fontSize: 'var(--text-base)', 
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-family-base)'
              }}>
                Overview of system performance and recent activity.
              </p>
            </div>
            
            <div className="space-y-2">
                <h2 style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-4)'
                }}>
                    Overview
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card 
                    className="p-6 cursor-pointer hover:shadow-md group border border-[var(--color-border-default)] cbt-card-small"
                    style={{ borderRadius: 'var(--radius-lg)' }}
                    onClick={() => setCurrentView('users')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>User Management</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Manage accounts and roles</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-primary-default)' }}>
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className="p-6 cursor-pointer hover:shadow-md group border border-[var(--color-border-default)] cbt-card-small"
                    style={{ borderRadius: 'var(--radius-lg)' }}
                    onClick={() => setCurrentView('equip')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Equip Programs</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Manage courses and content</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-primary-default)' }}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className="p-6 cursor-pointer hover:shadow-md group border border-[var(--color-border-default)] cbt-card-small"
                    style={{ borderRadius: 'var(--radius-lg)' }}
                    onClick={() => setCurrentView('crud')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>System Health</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>Status: Operational</p>
                      </div>
                      <div className="p-2 rounded-lg relative" style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>
                        <HeartPulse className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>
                </div>
            </div>
            
            <div className="space-y-4">
                 <h2 style={{
                   fontFamily: 'var(--font-family-base)',
                   fontSize: 'var(--text-xl)',
                   fontWeight: 'var(--font-weight-medium)',
                   color: 'var(--color-text-primary)',
                   marginBottom: 'var(--spacing-4)'
                 }}>
                    Dashboard Analytics
                </h2>
                <SuspenseScreen><L.Analytics embedded /></SuspenseScreen>
            </div>
          </div>
        );
      case 'analytics': return <SuspenseScreen><L.Analytics onBack={goBack} /></SuspenseScreen>;
      case 'users': return <SuspenseScreen><L.UserManager onBack={goBack} /></SuspenseScreen>;
      case 'consultants': return <SuspenseScreen><L.ConsultationManager onBack={goBack} onNavigate={onNavigate} /></SuspenseScreen>;
      case 'resources': return <SuspenseScreen><L.ResourceManager onBack={goBack} /></SuspenseScreen>;
      case 'assessments': return <SuspenseScreen><L.AssessmentManager onBack={goBack} /></SuspenseScreen>;
      case 'equip': return <SuspenseScreen><L.EquipDashboard onBack={goBack} /></SuspenseScreen>;
      case 'equip-analytics': return <SuspenseScreen><L.EquipAnalytics onBack={goBack} /></SuspenseScreen>;
      case 'pages': return <SuspenseScreen><L.PageManager onBack={goBack} /></SuspenseScreen>;
      case 'media': return <SuspenseScreen><L.MediaManager onBack={goBack} /></SuspenseScreen>;
      case 'categories': return <SuspenseScreen><L.CategoryManager onBack={goBack} /></SuspenseScreen>;
      case 'checkin-scales': return <SuspenseScreen><L.CheckinScalesManager onBack={goBack} /></SuspenseScreen>;
      case 'recommendations': return <SuspenseScreen><L.RecommendationRules onBack={goBack} /></SuspenseScreen>;
      case 'settings': return <SuspenseScreen><L.SettingsManager onBack={goBack} /></SuspenseScreen>;
      case 'crud': return <SuspenseScreen><L.CRUDTesting onBack={goBack} /></SuspenseScreen>;
      case 'backup': return <SuspenseScreen><L.BackupManager onBack={goBack} /></SuspenseScreen>;
      case 'kv-audit': return <SuspenseScreen><L.KVAudit onBack={goBack} /></SuspenseScreen>;
      case 'communication': return <SuspenseScreen><L.Communication onBack={goBack} /></SuspenseScreen>;
      case 'payment-gateway': return <SuspenseScreen><L.PaymentGateway /></SuspenseScreen>;
      case 'contact-newsletter': return <SuspenseScreen><L.ContactSubmissions onBack={goBack} /></SuspenseScreen>;
      case 'checkin-builder': return <SuspenseScreen><L.CheckinBuilder onBack={goBack} /></SuspenseScreen>;
      case 'hero-banner': return <SuspenseScreen><L.HeroBannerManager onBack={goBack} /></SuspenseScreen>;
      case 'block-type-viewer': return <SuspenseScreen><L.BlockTypeViewer onBack={goBack} /></SuspenseScreen>;
      case 'scoring-engine': return <SuspenseScreen><L.ScoringEngine onBack={goBack} /></SuspenseScreen>;
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
      
      {/* 1. SIDEBAR -- fixed on desktop, slide-over on mobile */}
      <aside
        className={cn(
          "w-[260px] min-w-[260px] fixed inset-y-0 left-0 bg-[var(--grey-0)] border-r border-[var(--grey-2)] z-50 flex flex-col",
          isMobile ? "transition-transform duration-300" : "",
          isMobile && !sidebarOpen && "-translate-x-full",
          isMobile && sidebarOpen && "translate-x-0"
        )}
        style={{ willChange: isMobile ? 'transform' : 'auto' }}
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

      {/* 2. MAIN CONTENT AREA -- offset by sidebar on desktop, full-width on mobile */}
      <div className={cn("flex-1 flex flex-col min-h-screen min-w-0", !isMobile && "ml-[260px]")}>
        
        {/* Top Header */}
        <header
          className="sticky top-0 z-30 px-3 lg:px-4 flex items-center justify-between gap-2"
          style={{
            backgroundColor: 'var(--color-bg-card)',
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
                  {searchResults.length > 0 && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border overflow-hidden"
                      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-default)', boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,.1))' }}
                    >
                      {searchResults.slice(0, 8).map((item) => (
                        <button
                          key={item.id}
                          className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[var(--color-bg-muted)] transition-colors"
                          onClick={() => { setCurrentView(item.id); setSearchQuery(''); setSearchResults([]); }}
                        >
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{item.label}</span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{item.group}</span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
           </div>

           {/* Right Actions */}
           <div className="flex items-center gap-2 lg:gap-3 shrink-0">

              <Button variant="ghost" size="icon" className="bg-[var(--grey-2)] text-[var(--grey-9)] hover:bg-[var(--grey-3)] relative rounded-lg h-[44px] w-[44px] border border-[var(--grey-3)]" title="Notifications" onClick={() => { setCurrentView('communication'); window.scrollTo(0, 0); }}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute rounded-full border-2 border-[var(--grey-0)] pointer-events-none"
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

              {/* User avatar -- always visible, name only on wide desktop */}
              <div className="flex items-center gap-2 lg:gap-3 lg:ml-2 px-2 lg:px-3 py-1.5 bg-[var(--grey-1)] rounded-lg border border-[var(--grey-2)]">
                  {!isMobile && !isCompact && (
                    <div className="text-right">
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--grey-9)' }} className="leading-none">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--grey-5)', marginTop: '4px' }}>Administrator</p>
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-[var(--grey-3)] text-[var(--grey-7)] flex items-center justify-center overflow-hidden">
                      {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
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
        <main className={cn("flex-1 w-full max-w-[1600px] mx-auto overflow-x-hidden", isMobile ? "p-4" : "p-8")}>
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>

      </div>
    </div>
  );
}