import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useIsMobile } from '../hooks/useIsMobile';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { PageHero } from './ui/PageHero';

interface NotFoundProps {
  onNavigate?: (route: string) => void;
}

export function NotFound({ onNavigate }: NotFoundProps) {
  const isMobile = useIsMobile();

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <PageHero 
        title="Page Not Found"
        subtitle="We couldn't find the page you're looking for."
      />

      <div 
        className="flex-1 w-full mx-auto flex items-center justify-center p-6"
        style={{
          maxWidth: 'var(--constraint-content-max)',
        }}
      >
        <Card className="w-full max-w-md text-center border-none shadow-none bg-transparent md:bg-white md:shadow-sm md:border md:border-border">
          <CardContent className="pt-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <Search size={40} className="text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-gray-900">
                Lost your way?
              </h2>
              <p className="text-gray-600">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => onNavigate?.('/dashboard')} 
                className="w-full"
              >
                <Home size={18} className="mr-2" />
                Return Home
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()} 
                className="w-full"
              >
                <ArrowLeft size={18} className="mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
