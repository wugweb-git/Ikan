import '../ui/styles/index.css'; // admin's own stylesheet — loads with the admin chunk
import { useState, useEffect, Suspense, useMemo, useCallback, useRef, startTransition, useDeferredValue } from 'react';
import { useNotifications } from '../../shared/state/NotificationContext';
import { useAuth } from '../../shared/state/AuthContext';
import { Search, Bell, LogOut, Menu, X, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { SideNav, SideNavGroup } from './SideNav';
import { LogoIcon } from '../ui/Logo';
import { usePublicSettings } from '../ui/hooks/usePublicSettings';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { ConfirmProvider } from '../ui/kit/ConfirmDialog';
import {
  ADMIN_SECTIONS,
  ADMIN_SECTION_GROUPS,
  getAdminSection,
  isAdminSectionId,
  type AdminSectionGroup,
  type AdminSectionId,
} from './sections';

// Delayed fallback to prevent flash on fast loads
function AdminLazyFallback() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 250);
    return () => clearTimeout(t);
  }, []);
  if (!show) return <div className="min-h-[200px]" />;
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 min-h-[200px]">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-muted)]" />
      <span className="text-sm text-[var(--color-text-muted)]">Loading…</span>
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

const GROUP_ORDER: AdminSectionGroup[] = ['overview', 'content', 'configuration', 'system'];
const NAV_GROUP_IDS: Record<AdminSectionGroup, string> = {
  overview: 'main',
  content: 'content',
  configuration: 'configuration',
  system: 'system',
};

export function AdminDashboard({ onNavigate, initialView }: AdminDashboardProps) {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const { settings: siteSettings } = usePublicSettings();
  const [currentView, setCurrentView] = useState<AdminSectionId>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobile, isCompact } = useIsMobileAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Defer the view so context-driven re-renders don't cause synchronous suspension
  const deferredView = useDeferredValue(currentView);
  // Track mount to avoid rendering lazy components during initial synchronous render
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (initialView && initialView !== 'dashboard' && isAdminSectionId(initialView)) {
      startTransition(() => setCurrentView(initialView));
    }
  }, [initialView]);

  /** Open a section: local view + URL, always together. */
  const go = useCallback((id: AdminSectionId) => {
    startTransition(() => setCurrentView(id));
    onNavigate(getAdminSection(id)!.path);
    window.scrollTo(0, 0);
  }, [onNavigate]);

  // Search through admin sections
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ADMIN_SECTIONS.filter((s) => !('hidden' in s && s.hidden)).map((s) => ({
      id: s.id as AdminSectionId,
      label: ('searchLabel' in s && s.searchLabel) || s.label,
      group: ADMIN_SECTION_GROUPS[s.group].searchLabel,
      keywords: s.keywords,
    })).filter((item) =>
      item.label.toLowerCase().includes(q) || item.keywords.includes(q) || item.group.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const navGroups: SideNavGroup[] = useMemo(() => GROUP_ORDER.map((group) => ({
    id: NAV_GROUP_IDS[group],
    title: ADMIN_SECTION_GROUPS[group].title,
    collapsible: true,
    defaultExpanded: true,
    items: ADMIN_SECTIONS
      .filter((s) => s.group === group && !('hidden' in s && s.hidden))
      .map((s) => ({
        id: s.id,
        label: s.label,
        icon: s.icon,
        isActive: currentView === s.id,
        onClick: () => {
          go(s.id);
          if (isMobile) setSidebarOpen(false);
        },
      })),
  })), [currentView, isMobile, go]);

  const renderContent = () => {
    // Don't render lazy components until after mount to avoid synchronous suspension
    if (!mounted) return <AdminLazyFallback />;
    const section = getAdminSection(deferredView);
    if (!section) return <div>View not found</div>;
    const Screen = section.component;
    // Every screen is wrapped in Suspense so only the active one loads
    return (
      <Suspense fallback={<AdminLazyFallback />}>
        <Screen onNavigate={onNavigate} />
      </Suspense>
    );
  };

  const compact = isMobile || isCompact;

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
          isMobile ? "transition-transform duration-300 will-change-transform" : "",
          isMobile && !sidebarOpen && "-translate-x-full",
          isMobile && sidebarOpen && "translate-x-0"
        )}
      >
          {/* Sidebar Logo Area */}
          <div className="h-[64px] lg:h-[72px] flex items-center px-4 border-b border-[var(--grey-2)] justify-between">
              <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => go('dashboard')}>
                <div className={cn("shrink-0 flex items-center justify-center", isMobile ? "w-9 h-9" : "w-10 h-10")}>
                  {siteSettings.logoIconUrl ? (
                    <img src={siteSettings.logoIconUrl} alt={siteSettings.siteName || 'iKan'} className="w-full h-full object-contain" />
                  ) : (
                    <LogoIcon size={isMobile ? 36 : 40} />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="block leading-tight truncate text-base font-medium text-[var(--color-text-primary)]">{siteSettings.siteName || 'iKan Mental Health'}</span>
                  <span className="block leading-tight text-[10px] font-medium text-[var(--color-text-muted)] tracking-[0.08em] uppercase">Admin Console</span>
                </div>
              </div>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </Button>
              )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
             <SideNav groups={navGroups} className="w-full space-y-1" />
          </div>
      </aside>

      {/* 2. MAIN CONTENT AREA -- offset by sidebar on desktop, full-width on mobile */}
      <div className={cn("flex-1 flex flex-col min-h-screen min-w-0", !isMobile && "ml-[260px]")}>

        {/* Top Header */}
        <header
          className={cn(
            "sticky top-0 z-30 flex items-center justify-between gap-4 bg-[var(--color-bg-card)] border-b border-[var(--color-border-default)]",
            isMobile ? "h-14 px-3" : "h-[72px] px-6",
          )}
        >
           {/* Mobile hamburger */}
           {isMobile && (
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setSidebarOpen(true)}
               aria-label="Open menu"
               className="shrink-0 h-10 w-10 rounded-[var(--radius-md)] bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]"
             >
               <Menu className="w-5 h-5" />
             </Button>
           )}

           {/* Search Area */}
           <div className="flex-1 min-w-0 max-w-xl">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <Input
                      placeholder={isMobile ? "Search..." : "Search resources, users, or settings..."}
                      className="pl-10 border-none w-full bg-[var(--color-bg-muted)] h-10 rounded-[var(--radius-md)] text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg,0_10px_15px_-3px_rgba(0,0,0,.1))]">
                      {searchResults.slice(0, 8).map((item) => (
                        <button
                          key={item.id}
                          className="w-full text-left px-4 py-3 flex items-center justify-between transition-colors hover:bg-[var(--color-bg-muted)]"
                          onClick={() => { go(item.id); setSearchQuery(''); }}
                        >
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">{item.label}</span>
                          <span className="text-xs text-[var(--color-text-muted)]">{item.group}</span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
           </div>

           {/* Right Actions */}
           <div className="flex items-center gap-2 shrink-0">

              {/* Notifications — opens Communication, URL kept in sync */}
              <button
                onClick={() => go('communication')}
                title="Notifications"
                aria-label="Notifications"
                className="relative flex items-center justify-center transition-colors w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] border-none cursor-pointer hover:bg-[var(--color-border-default)]"
              >
                  <Bell className="w-[18px] h-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute pointer-events-none flex items-center justify-center bg-[var(--color-status-danger)] min-w-4 h-4 -top-0.5 -right-0.5 rounded-full border-2 border-[var(--color-bg-card)] text-[10px] text-[var(--color-text-inverse)] font-medium px-[3px] leading-none">
                      {unreadCount}
                    </span>
                  )}
              </button>

              {/* User Avatar + Info */}
              <div className={cn("flex items-center gap-2 cursor-default rounded-[var(--radius-md)] bg-[var(--color-bg-muted)]", compact ? "p-1" : "py-1 pl-1 pr-3")}>
                  <div className="flex items-center justify-center overflow-hidden shrink-0 w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary-default)] text-[var(--color-text-inverse)] text-sm font-medium">
                      {user?.avatar_url ? (
                        <img src={String(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{(user?.name || user?.email || 'A').charAt(0).toUpperCase()}</span>
                      )}
                  </div>
                  {!compact && (
                    <div className="text-left min-w-0">
                        <p className="leading-tight truncate text-sm font-medium text-[var(--color-text-primary)]">{user?.name || user?.email?.split('@')[0] || 'Admin'}</p>
                    </div>
                  )}
              </div>

              {/* Exit Admin */}
              <button
                onClick={() => onNavigate('/')}
                title="Exit Admin Console"
                aria-label="Exit Admin Console"
                className={cn(
                  "flex items-center justify-center gap-1.5 transition-colors h-10 min-w-10 rounded-[var(--radius-md)] bg-[var(--color-status-danger-light)] text-[var(--color-status-danger)] border-none cursor-pointer font-medium text-sm hover:opacity-80",
                  compact ? "w-10 px-0" : "w-auto px-3",
                )}
              >
                  <LogOut className="w-4 h-4" />
                  {!compact && <span>Exit</span>}
              </button>
           </div>
        </header>

        {/* Scrollable Main Content */}
        <main className={cn("flex-1 w-full max-w-[1600px] mx-auto overflow-x-hidden", isMobile ? "p-4" : "p-8")}>
          <ErrorBoundary>
            <ConfirmProvider>
              {renderContent()}
            </ConfirmProvider>
          </ErrorBoundary>
        </main>

      </div>
    </div>
  );
}
