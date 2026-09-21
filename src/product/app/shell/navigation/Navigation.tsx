import { useIsMobile } from '../../ui/hooks/useIsMobile';
import { LogoFull } from '../../ui/Logo';
import { cn } from '../../ui/utils';
import { MessageCircle, LogIn, User } from 'lucide-react';

interface NavigationProps {
  user: any;
  onNavigate: (route: string) => void;
  onGetStarted: () => void;
  currentRoute?: string;
}

export function Navigation({ user, onNavigate, onGetStarted, currentRoute }: NavigationProps) {
  const isMobile = useIsMobile();
  return (
    <header className="nav-fixed-wrapper" role="banner">
      <nav 
        className="ikan-capsule-nav px-[16px] py-[24px] m-[0px]"
        style={{
          borderRadius: '9999px', // Force pill shape
        }}
        aria-label="Primary navigation"
      >
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
           <LogoFull height={48} />
        </div>

        {/* Center: Content stays exactly the same for Public/Private */}
        <div className="hidden lg:flex items-center gap-2">
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
              <button 
                onClick={() => onNavigate('/')} 
                className={cn("nav-link", currentRoute === '/' && "active")}
              >
                Home
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
              <button 
                onClick={() => onNavigate('/about')} 
                className={cn("nav-link", currentRoute === '/about' && "active")}
              >
                About Us
              </button>
            </>
          )}
        </div>

        {/* Right: Profile or CTA */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('/contact')} 
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-accent-default)] text-[var(--color-text-primary)] font-medium hover:brightness-95 transition-all"
              >
                <MessageCircle size={18} />
                Let's Talk
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
                onClick={() => onNavigate('/contact')} 
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-accent-default)] text-[var(--color-text-primary)] font-medium hover:brightness-95 transition-all"
              >
                <MessageCircle size={18} />
                Let's Talk
              </button>
              <button onClick={onGetStarted} className="btn-nav-primary gap-2">
                <LogIn size={18} />
                Sign in
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}