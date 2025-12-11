import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '../ui/button';

interface AdminWidgetProps {
  onNavigate?: (path: string) => void;
}

export function AdminWidget({ onNavigate }: AdminWidgetProps) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate('/admin');
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 print:hidden">
      <Button 
        variant="default" 
        size="icon" 
        className="h-12 w-12 rounded-full shadow-lg bg-gray-900 hover:bg-gray-800 text-white border-2 border-white/20 transition-transform hover:scale-105"
        aria-label="Open Admin Console"
        onClick={handleClick}
      >
        <Settings className="h-6 w-6" />
      </Button>
    </div>
  );
}
