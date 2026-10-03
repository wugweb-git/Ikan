import { Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/state/AuthContext';

interface AdminWidgetProps {
  onNavigate?: (path: string) => void;
}

export function AdminWidget({ onNavigate }: AdminWidgetProps) {
  const { verifiedIsAdmin } = useAuth();

  /*
   * EVERY HOOK RUNS BEFORE THE EARLY RETURN.
   *
   * The `if (!user?.is_admin) return null` used to sit above the `useState`
   * and `useEffect` below, so this component ran ONE hook for a non-admin and
   * THREE for an admin. React counts hooks per render and compares: the moment
   * `is_admin` changed in a mounted session it threw "Rendered more hooks than
   * during the previous render" and took the page down.
   *
   * That is not a rare path. It fires on sign-in, and again whenever auth
   * resolves from `undefined` to a profile — which is every first load for an
   * admin. Introduced by the footer fix in 842de494, which added the two hooks
   * beneath a return that had been harmless while there were none.
   *
   * The guard is now a render-time branch (`isAdmin` below), not a control-flow
   * one. Hooks are unconditional; only the output is conditional.
   */
  // Server-verified only — the cached localStorage hint must not show admin UI.
  const isAdmin = verifiedIsAdmin === true;

  const handleClick = () => {
    if (onNavigate) {
      onNavigate('/admin');
    } else {
      window.location.href = '/admin';
    }
  };

  /*
   * The button is fixed at the bottom of the viewport, so at the end of a
   * page it sits on top of the footer and covers its links. Hidden once the
   * footer is in view rather than nudged upward, because any fixed offset
   * large enough to clear the footer wastes that space on every other screen.
   */
  const [overFooter, setOverFooter] = useState(false);
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setOverFooter(entry.isIntersecting),
      { rootMargin: '0px 0px -8px 0px' },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  // Only show the admin widget if the user has admin privileges. AFTER the
  // hooks, never before — see the note above.
  if (!isAdmin) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 print:hidden max-md:bottom-[100px] max-md:left-3"
      style={{
        opacity: overFooter ? 0 : 1,
        pointerEvents: overFooter ? 'none' : 'auto',
        transition: 'opacity 160ms ease',
      }}
    >
      <Button 
        variant="default" 
        size="icon" 
        className="h-12 w-12 rounded-full shadow-lg max-md:h-10 max-md:w-10"
        style={{
          backgroundColor: 'var(--color-primary-default)',
          color: 'var(--color-primary-on)',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
        aria-label="Open Admin Console"
        onClick={handleClick}
      >
        <Settings className="h-6 w-6 max-md:h-5 max-md:w-5" />
      </Button>
    </div>
  );
}