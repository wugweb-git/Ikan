import { useState, useEffect, lazy, Suspense, useMemo, useCallback, useRef, startTransition, useDeferredValue } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Table,
  BookOpen,
  Tag,
  Smile,
  Settings,
  MessageSquare,
  Search,
  Bell,
  User,
  LogOut,
  Stethoscope,
  Image,
  Sparkles,
  CreditCard,
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
import { Input } from '../ui/input';
import { SideNav, SideNavGroup } from '../components/SideNav';
import { LogoIcon } from '../../components/Logo';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { ErrorBoundary } from '../../components/ErrorBoundary';

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
  MediaManager: lazy(() => import('./AdminMediaManager').then(m => ({ default: m.AdminMediaManager }))),
  SettingsManager: lazy(() => import('./AdminSettingsManager').then(m => ({ default: m.AdminSettingsManager }))),
  Analytics: lazy(() => import('./AdminDashboardAnalytics').then(m => ({ default: m.AdminDashboardAnalytics }))),
  EquipAnalytics: lazy(() => import('./AdminEquipAnalytics').then(m => ({ default: m.AdminEquipAnalytics }))),
  Communication: lazy(() => import('../components/AdminCommunication').then(m => ({ default: m.AdminCommunication }))),
  PaymentGateway: lazy(() => import('../components/AdminPaymentGateway').then(m => ({ default: m.AdminPaymentGateway }))),
  CategoryManager: lazy(() => import('../components/AdminCategoryManager').then(m => ({ default: m.AdminCategoryManager }))),
  CheckinScalesManager: lazy(() => import('../components/AdminCheckinScalesManager').then(m => ({ default: m.AdminCheckinScalesManager }))),
  RecommendationRules: lazy(() => import('../components/recommendations/RecommendationRulesManager').then(m => ({ default: m.RecommendationRulesManager }))),
  CheckinBuilder: lazy(() => import('../components/AdminCheckinTemplateBuilder').then(m => ({ default: m.AdminCheckinTemplateBuilder }))),
  KVAudit: lazy(() => import('../components/AdminKVAudit').then(m => ({ default: m.AdminKVAudit }))),
  ContactSubmissions: lazy(() => import('../components/AdminContactSubmissions').then(m => ({ default: m.AdminContactSubmissions }))),
  BlockTypeViewer: lazy(() => import('../blocks/BlockTypeViewer').then(m => ({ default: m.AdminBlockTypeViewer }))),
  BlockGallery: lazy(() => import('../blocks/BlockGallery').then(m => ({ default: m.AdminBlockGallery }))),
  ScoringEngine: lazy(() => import('../components/AdminScoringEngine').then(m => ({ default: m.AdminScoringEngine }))),
};

// Stable Suspense wrapper - defined OUTSIDE component to prevent remounting
function SuspenseScreen({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLazyFallback />}>{children}</Suspense>
  );
}

// Delayed fallback to prevent flash on fast loads
function AdminLazyFallback() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 250);
    return () => clearTimeout(t);
  }, []);
  if (!show) return <div style={{ minHeight: 200 }} />;
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3" style={{ minHeight: 200 }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</span>
    </div>
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
  | 'users'
  | 'consultants'
  | 'resources'
  | 'assessments'
  | 'equip'
  | 'equip-analytics'
  | 'media'
  | 'categories'
  | 'checkin-scales'
  | 'recommendations'
  | 'settings'
  | 'communication'
  | 'payment-gateway'
  | 'kv-audit'
  | 'contact-newsletter'
  | 'checkin-builder'
  | 'block-type-viewer'
  | 'block-gallery'
  | 'scoring-engine';

export function AdminDashboard({ onNavigate, initialView }: AdminDashboardProps) {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const { settings: siteSettings } = usePublicSettings();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobile, isCompact } = useIsMobileAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ id: ViewType; label: string; group: string }[]>([]);
  // Defer the view so context-driven re-renders don't cause synchronous suspension
  const deferredView = useDeferredValue(currentView);
  // Track mount to avoid rendering lazy components during initial synchronous render
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (initialView && initialView !== 'dashboard') {
      startTransition(() => setCurrentView(initialView as ViewType));
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
      { id: 'dashboard', label: 'Reporting', group: 'Overview', keywords: 'home overview reporting analytics charts graphs stats metrics' },
      { id: 'users', label: 'Users & Accounts', group: 'Overview', keywords: 'user account member role admin' },
      { id: 'equip', label: 'Equip Programs', group: 'Content', keywords: 'program course equip module day block' },
      { id: 'assessments', label: 'Assessments', group: 'Content', keywords: 'assessment quiz test survey' },
      { id: 'resources', label: 'Resources', group: 'Content', keywords: 'resource article blog library' },
      { id: 'checkin-builder', label: 'Check-in Builder', group: 'Content', keywords: 'checkin check-in template builder mood' },
      { id: 'consultants', label: 'Consultants', group: 'Content', keywords: 'consultant therapist professional doctor' },
      { id: 'media', label: 'Media Library', group: 'Content', keywords: 'media image upload file photo' },
      { id: 'categories', label: 'Meta Manager', group: 'Config', keywords: 'category tag label metadata type mood' },
      { id: 'checkin-scales', label: 'Check-in Scales', group: 'Config', keywords: 'scale checkin energy stress sleep' },
      { id: 'recommendations', label: 'Recommendations', group: 'Config', keywords: 'recommendation rule engine severity rules' },
      { id: 'scoring-engine', label: 'Scoring Engine', group: 'Config', keywords: 'scoring engine' },
      { id: 'block-type-viewer', label: 'Block Types', group: 'Config', keywords: 'block type viewer' },
      { id: 'block-gallery', label: 'Block Gallery', group: 'Config', keywords: 'block gallery preview render every activity' },
      { id: 'settings', label: 'Global Settings', group: 'Config', keywords: 'settings config configuration' },
      { id: 'communication', label: 'Communication', group: 'System', keywords: 'email notification message brevo' },
      { id: 'contact-newsletter', label: 'Contact & Newsletter', group: 'System', keywords: 'contact newsletter subscription' },
      { id: 'payment-gateway', label: 'Payments', group: 'System', keywords: 'payment razorpay gateway transaction' },
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
        { id: 'dashboard', label: 'Reporting', icon: LayoutDashboard },
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
        { id: 'media', label: 'Media Library', icon: Image },
      ]
    },
    {
      id: 'configuration',
      title: 'Configuration',
      items: [
        { id: 'categories', label: 'Meta Manager', icon: Tag },
        { id: 'checkin-scales', label: 'Check-in Scales', icon: Zap },
        { id: 'recommendations', label: 'Recommendation Rules', icon: Sparkles },
        { id: 'scoring-engine', label: 'Scoring Engine', icon: Calculator },
        { id: 'block-type-viewer', label: 'Block Types', icon: Blocks },
        { id: 'block-gallery', label: 'Block Gallery', icon: Blocks },
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
        startTransition(() => setCurrentView(item.id as ViewType));
        onNavigate(item.id === 'dashboard' ? '/admin/reporting' : `/admin/${item.id}`);
        window.scrollTo(0,0);
        if (isMobile) setSidebarOpen(false);
      }
    }))
  })), [currentView, isMobile, onNavigate]);
  
  const goBack = useCallback(() => { startTransition(() => setCurrentView('dashboard')); onNavigate('/admin/reporting'); }, [onNavigate]);
  
  const renderContent = () => {
    // Don't render lazy components until after mount to avoid synchronous suspension
    if (!mounted) {
      return <AdminLazyFallback />;
    }
    // Every screen is wrapped in Suspense so only the active one loads
    // IMPORTANT: Use SuspenseScreen directly instead of an inline wrapper 
    // to prevent remounting children when AdminDashboard re-renders.
    switch (deferredView) {
      case 'dashboard':
        return (
          <div className="space-y-6 admin-dashboard-header">
            <div>
              <h1 style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-2)'
              }}>
                Reporting
              </h1>
              <p style={{ 
                fontSize: 'var(--text-base)', 
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-family-base)'
              }}>
                Platform metrics at a glance.
              </p>
            </div>
            
            <SuspenseScreen><L.Analytics embedded /></SuspenseScreen>
          </div>
        );
      case 'users': return <SuspenseScreen><L.UserManager onBack={goBack} /></SuspenseScreen>;
      case 'consultants': return <SuspenseScreen><L.ConsultationManager onBack={goBack} onNavigate={onNavigate} /></SuspenseScreen>;
      case 'resources': return <SuspenseScreen><L.ResourceManager onBack={goBack} /></SuspenseScreen>;
      case 'assessments': return <SuspenseScreen><L.AssessmentManager onBack={goBack} /></SuspenseScreen>;
      case 'equip': return <SuspenseScreen><L.EquipDashboard onBack={goBack} /></SuspenseScreen>;
      case 'equip-analytics': return <SuspenseScreen><L.EquipAnalytics onBack={goBack} /></SuspenseScreen>;
      case 'media': return <SuspenseScreen><L.MediaManager onBack={goBack} /></SuspenseScreen>;
      case 'categories': return <SuspenseScreen><L.CategoryManager onBack={goBack} /></SuspenseScreen>;
      case 'checkin-scales': return <SuspenseScreen><L.CheckinScalesManager onBack={goBack} /></SuspenseScreen>;
      case 'recommendations': return <SuspenseScreen><L.RecommendationRules onBack={goBack} /></SuspenseScreen>;
      case 'settings': return <SuspenseScreen><L.SettingsManager onBack={goBack} /></SuspenseScreen>;
      case 'kv-audit': return <SuspenseScreen><L.KVAudit onBack={goBack} /></SuspenseScreen>;
      case 'communication': return <SuspenseScreen><L.Communication onBack={goBack} /></SuspenseScreen>;
      case 'payment-gateway': return <SuspenseScreen><L.PaymentGateway /></SuspenseScreen>;
      case 'contact-newsletter': return <SuspenseScreen><L.ContactSubmissions onBack={goBack} /></SuspenseScreen>;
      case 'checkin-builder': return <SuspenseScreen><L.CheckinBuilder onBack={goBack} /></SuspenseScreen>;
      case 'block-type-viewer': return <SuspenseScreen><L.BlockTypeViewer onBack={goBack} /></SuspenseScreen>;
      case 'block-gallery': return <SuspenseScreen><L.BlockGallery onBack={goBack} /></SuspenseScreen>;
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
          {/* Sidebar Logo Area */}
          <div className="h-[64px] lg:h-[72px] flex items-center px-4 border-b border-[var(--grey-2)] justify-between">
              <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => { startTransition(() => setCurrentView('dashboard')); onNavigate('/admin/reporting'); }}>
                <div className="shrink-0 flex items-center justify-center" style={{ width: isMobile ? 36 : 40, height: isMobile ? 36 : 40 }}>
                  {siteSettings.logoIconUrl ? (
                    <img src={siteSettings.logoIconUrl} alt={siteSettings.siteName || 'iKan'} className="w-full h-full object-contain" />
                  ) : (
                    <LogoIcon size={isMobile ? 36 : 40} />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="block leading-tight truncate" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>{siteSettings.siteName || 'iKan Mental Health'}</span>
                  <span className="block leading-tight" style={{ fontSize: '10px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-family-base)' }}>Admin Console</span>
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
          className="sticky top-0 z-30 flex items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderBottom: '1px solid var(--color-border-default)',
            height: isMobile ? '56px' : '72px',
            padding: isMobile ? '0 12px' : '0 24px',
          }}
        >
           {/* Mobile hamburger */}
           {isMobile && (
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setSidebarOpen(true)}
               className="shrink-0"
               style={{
                 height: 40,
                 width: 40,
                 borderRadius: 'var(--radius-md)',
                 backgroundColor: 'var(--color-bg-muted)',
                 color: 'var(--color-text-primary)',
               }}
             >
               <Menu className="w-5 h-5" />
             </Button>
           )}

           {/* Search Area */}
           <div className="flex-1 min-w-0 max-w-xl">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <Input 
                      placeholder={isMobile ? "Search..." : "Search resources, users, or settings..."} 
                      className="pl-10 border-none w-full"
                      style={{ 
                        backgroundColor: 'var(--color-bg-muted)', 
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family-base)',
                      }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden"
                      style={{ 
                        backgroundColor: 'var(--color-bg-card)', 
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 'var(--radius-md)', 
                        boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,.1))',
                      }}
                    >
                      {searchResults.slice(0, 8).map((item) => (
                        <button
                          key={item.id}
                          className="w-full text-left px-4 py-3 flex items-center justify-between transition-colors"
                          style={{ fontFamily: 'var(--font-family-base)' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          onClick={() => { startTransition(() => setCurrentView(item.id)); onNavigate(item.id === 'dashboard' ? '/admin/reporting' : `/admin/${item.id}`); setSearchQuery(''); setSearchResults([]); }}
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
           <div className="flex items-center gap-2 shrink-0">

              {/* Notifications */}
              <button
                onClick={() => { startTransition(() => setCurrentView('communication')); window.scrollTo(0, 0); }}
                title="Notifications"
                className="relative flex items-center justify-center transition-colors"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-muted)',
                  color: 'var(--color-text-primary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-default)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
              >
                  <Bell className="w-[18px] h-[18px]" />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute pointer-events-none flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'var(--color-status-danger)',
                        minWidth: 16,
                        height: 16,
                        top: -2,
                        right: -2,
                        borderRadius: '999px',
                        border: '2px solid var(--color-bg-card)',
                        fontSize: '10px',
                        color: 'var(--color-text-inverse)',
                        fontWeight: 'var(--font-weight-medium)',
                        padding: '0 3px',
                        lineHeight: 1,
                       }}
                    >
                      {unreadCount}
                    </span>
                  )}
              </button>

              {/* User Avatar + Info */}
              <div 
                className="flex items-center gap-2 cursor-default"
                style={{
                  padding: isMobile || isCompact ? '4px' : '4px 12px 4px 4px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-muted)',
                }}
              >
                  <div 
                    className="flex items-center justify-center overflow-hidden shrink-0"
                    style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-primary-default)',
                      color: 'var(--color-text-inverse)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                      {user?.avatar_url ? (
                        <img src={String(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{(user?.name || user?.email || 'A').charAt(0).toUpperCase()}</span>
                      )}
                  </div>
                  {!isMobile && !isCompact && (
                    <div className="text-left min-w-0">
                        <p className="leading-tight truncate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>{user?.name || user?.email?.split('@')[0] || 'Admin'}</p>
                    </div>
                  )}
              </div>
              
              {/* Exit Admin */}
              <button
                onClick={() => onNavigate('/')} 
                title="Exit Admin Console"
                className="flex items-center justify-center gap-1.5 transition-colors"
                style={{
                  height: 40,
                  minWidth: 40,
                  paddingLeft: isMobile || isCompact ? 0 : 12,
                  paddingRight: isMobile || isCompact ? 0 : 12,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-status-danger-light)',
                  color: 'var(--color-status-danger)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-base)',
                  width: isMobile || isCompact ? 40 : 'auto',
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                  <LogOut className="w-4 h-4" />
                  {!isMobile && !isCompact && <span>Exit</span>}
              </button>
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