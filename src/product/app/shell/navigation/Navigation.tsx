import { useIsMobile } from '../../ui/hooks/useIsMobile';
import { MENU, MENU_APP_ORIGIN, MENU_TALK } from '../../../../shared/navigation/menu';
import { cn } from '../../ui/utils';
import { MessageCircle, LogIn, User } from 'lucide-react';

interface NavigationProps {
  user: any;
  onNavigate: (route: string) => void;
  currentRoute?: string;
}


/** Everything that now lives under Services; the nav item lights up for all of them. */
const SERVICE_ROUTES = ['/service', '/services', '/assessment', '/equip', '/mood-journal', '/consultation'];

const isServicesRoute = (route?: string) =>
  !!route && SERVICE_ROUTES.some((r) => route === r || route.startsWith(`${r}-`) || route.startsWith(`${r}/`));

export function Navigation({ user, onNavigate, currentRoute }: NavigationProps) {
  const isMobile = useIsMobile();
  return (
    /* Opted into the ported design system, as the footer is. The band runs
       above every page; left on Inter while the pages below moved to Manrope
       and Sora, the seam showed on every route. */
    <header className="ikan2-theme nav-fixed-wrapper" role="banner">
      <nav 
        className="ikan-capsule-nav px-[16px] py-[24px] m-[0px]"
        style={{
          borderRadius: '9999px', // Force pill shape
        }}
        aria-label="Primary navigation"
      >
        
        {/*
          Left: brand lockup, taken from app.ikanhealth.in/login so the two
          products open with the same mark:

            <img class="h-7 w-7 rounded-[9px]" src="/favicon.svg">
            <span class="type-subhead">iKAN</span>

          The mark is a 28px SQUIRCLE at 9px radius, not a circle and not a
          square, and the wordmark is `type-subhead` (Sora 18/600) with the
          brand's own casing. The site had `LogoFull` at 48px, which was both a
          different lockup and nearly twice the height.
        */}
        <button
          type="button"
          className="nav-brand"
          onClick={() => onNavigate('/')}
          aria-label="iKAN home"
        >
          <img src="/favicon.svg" alt="" width={40} height={40} />
          <span className="type-subhead">iKAN</span>
        </button>

        {/* Center: Content stays exactly the same for Public/Private */}
        {/*
          `md`, not `lg`. The capsule renders from 768px up, but its links only
          appeared from 1024px, so every width in between showed a logo and two
          unlabelled round buttons with no navigation at all.
        */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <button 
                onClick={() => onNavigate('/dashboard')} 
                className={cn("nav-link", currentRoute === '/dashboard' && "active")}
              >
                Dashboard
              </button>
              <button 
                onClick={() => onNavigate('/mood-journal')} 
                className={cn("nav-link", currentRoute === '/mood-journal' && "active")}
              >
                Mood Journal
              </button>
              <button 
                onClick={() => onNavigate('/assessment')} 
                className={cn("nav-link", (currentRoute === '/assessment' || currentRoute?.startsWith('/assessment-')) && "active")}
              >
                Assessment
              </button>
              <button 
                onClick={() => onNavigate('/equip')} 
                className={cn("nav-link", (currentRoute === '/equip' || currentRoute?.startsWith('/equip-')) && "active")}
              >
                Equip
                <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1, padding: '2px 5px', borderRadius: '4px', marginLeft: '5px', color: 'var(--grey-0)', backgroundColor: 'var(--color-primary-default, #6941C6)', verticalAlign: 'middle' }}>beta</span>
              </button>
              <button 
                onClick={() => onNavigate('/resource')} 
                className={cn("nav-link", (currentRoute === '/resource' || currentRoute?.startsWith('/resource-')) && "active")}
              >
                Resource
              </button>
              <button 
                onClick={() => onNavigate('/consultation')} 
                className={cn("nav-link", (currentRoute === '/consultation' || currentRoute?.startsWith('/consultation-')) && "active")}
              >
                Consultation
                <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1, padding: '2px 5px', borderRadius: '4px', marginLeft: '5px', color: 'var(--grey-0)', backgroundColor: 'var(--color-text-muted, #888)', verticalAlign: 'middle' }}>coming soon</span>
              </button>
            </>
          ) : (
            <>
              {/* One list with the mobile drawer; see MENU_NAV in content/nav.ts. */}
              {MENU.map((item) => {
                const active =
                  item.to === '/service' ? isServicesRoute(currentRoute) : currentRoute === item.to;
                const className = cn('nav-link no-underline', active && 'active');
                /* An absolute entry ("Open the app") leaves this origin, so it
                   is a real anchor rather than an in-app route change. */
                return item.to.startsWith('/') ? (
                  <button key={item.to} onClick={() => onNavigate(item.to)} className={className}>
                    {item.label}
                  </button>
                ) : (
                  <a key={item.to} href={item.to} className={className}>
                    {item.label}
                  </a>
                );
              })}
            </>
          )}
        </div>

        {/* Right: Profile or CTA */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate(MENU_TALK.to)}
                className="btn-nav-secondary gap-2"
              >
                <MessageCircle size={18} />
                {MENU_TALK.label}
              </button>
              <div 
                className="w-10 h-10 rounded-full border-2 border-[var(--grey-2)] overflow-hidden cursor-pointer"
                onClick={() => onNavigate('/account')}
              >
                 {user.avatar_url ? (
                   <img src={user.avatar_url as string} alt="User" className="w-full h-full object-cover" />
                 ) : (
                   <div
                     className="w-full h-full flex items-center justify-center"
                     style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}
                   >
                     {user.name
                       ? String(user.name).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                       : <User size={18} />}
                   </div>
                 )}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => onNavigate(MENU_TALK.to)}
                className="btn-nav-secondary gap-2"
              >
                <MessageCircle size={18} />
                {MENU_TALK.label}
              </button>
              {/* Sign in leaves for the member app; the account lives there,
                  so an internal route would only be a stop on the way. */}
              <a href={`${MENU_APP_ORIGIN}/login`} className="btn-nav-primary gap-2 no-underline">
                <LogIn size={18} />
                Sign in
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}