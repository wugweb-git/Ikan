import React from 'react';
import { LogoFull } from '../Logo';
import { cn } from '../ui/utils';
import { MessageCircle, LogIn } from 'lucide-react';

interface NavigationProps {
  user: any;
  onNavigate: (route: string) => void;
  onGetStarted: () => void;
  currentRoute?: string;
}

export function Navigation({ user, onNavigate, onGetStarted, currentRoute }: NavigationProps) {
  return (
    <header className="nav-fixed-wrapper">
      <div 
        className="ikan-capsule-nav"
        style={{
          borderRadius: '9999px', // Force pill shape
        }}
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
                 <img src={user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64"} alt="User" />
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
              <button onClick={() => onNavigate('/login')} className="btn-nav-primary gap-2">
                <LogIn size={18} />
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
