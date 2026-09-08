import { Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminWidgetProps {
  onNavigate?: (path: string) => void;
}

export function AdminWidget({ onNavigate }: AdminWidgetProps) {
  const { user } = useAuth();

  // Only show the admin widget if the user has admin privileges
  if (!user || !user.is_admin) {
    return null;
  }

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