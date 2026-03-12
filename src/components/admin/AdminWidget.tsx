import { Settings } from 'lucide-react';
import { Button } from '../ui/button';
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

  return (
    <div className="fixed bottom-4 left-4 z-50 print:hidden max-md:bottom-[100px] max-md:left-3">
      <Button 
        variant="default" 
        size="icon" 
        className="h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-105 max-md:h-10 max-md:w-10"
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