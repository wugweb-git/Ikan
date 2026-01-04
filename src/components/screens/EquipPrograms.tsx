import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { PageHero } from '../ui/PageHero';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { DUMMY_EQUIP_PROGRAM } from '../../lib/demo-data';

export function EquipPrograms({ className, onNavigate }: { className?: string, onNavigate?: (route: string) => void }) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      let data = [];
      try {
        data = await apiClient.getEquipPrograms();
      } catch (err) {
        console.warn('API load failed, using local fallback only');
      }
      
      // Ensure Demo Program is ALWAYS present
      const hasDemo = data.some((p: any) => p.id === DUMMY_EQUIP_PROGRAM.id);
      if (!hasDemo) {
        // Add to the beginning
        console.log('➕ Force Adding Demo Equip Program');
        data.unshift(DUMMY_EQUIP_PROGRAM);
      }
      
      setPrograms(data);
    } catch (error) {
      console.error(error);
      showToast('error', 'Using offline mode');
      setPrograms([DUMMY_EQUIP_PROGRAM]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProgram = async (equipId: string) => {
    // Navigate to detail page instead of immediate enrollment
    if (onNavigate) {
      onNavigate(`/equip-detail?id=${equipId}`);
    } else {
      window.location.href = `/equip-detail?id=${equipId}`;
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--color-text-muted)]">Loading programs...</div>;

  return (
    <div className={`w-full ${className}`}>
      <PageHero 
        title="Equip Programs" 
        subtitle="Structured programs to equip you with mental health tools." 
      />
      <div className="space-y-6 p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
            <Card 
              key={program.id} 
              className="overflow-hidden flex flex-col h-full border-[var(--color-border-default)] shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-[var(--color-bg-card)] rounded-[var(--radius-lg)]"
              onClick={() => handleViewProgram(program.id)}
            >
            <div className="relative h-48 bg-[var(--color-bg-muted)]">
               <ImageWithFallback
                 src={program.cover_image || program.thumbnail || `https://source.unsplash.com/random/800x600?${program.category}`}
                 alt={program.title || program.name}
                 className="w-full h-full object-cover"
               />
               <Badge className="absolute top-3 right-3 bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm backdrop-blur-sm border-none">
                 {program.category}
               </Badge>
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-[var(--text-xl)] text-[var(--color-text-primary)]">{program.title || program.name}</CardTitle>
              <CardDescription className="text-[var(--color-text-muted)]">{program.duration_days} Days • {(!program.price || program.price === 0) ? 'Free' : 'Premium'}</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1">
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-3">
                 {program.description || `Explore our ${program.title} program designed to help with ${program.category}.`}
              </p>
            </CardContent>
            
            <CardFooter className="pt-4 border-t border-[var(--color-border-default)]">
              <Button 
                className="w-full bg-[var(--color-primary-default)] hover:opacity-90 text-[var(--color-primary-on)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProgram(program.id);
                }}
              >
                View Program
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
    </div>
  );
}
