import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

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
      const data = await apiClient.getEquipPrograms();
      setPrograms(data);
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to load programs');
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

  if (loading) return <div className="p-8 text-center">Loading programs...</div>;

  return (
    <div className={`space-y-6 p-4 max-w-7xl mx-auto ${className}`}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium font-ubuntu text-neutral-900">Equip Programs</h1>
        <p className="text-neutral-500">Structured programs to equip you with mental health tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
            <Card 
              key={program.id} 
              className="overflow-hidden flex flex-col h-full border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewProgram(program.id)}
            >
            <div className="relative h-48 bg-neutral-100">
               <ImageWithFallback
                 src={program.cover_image || program.thumbnail || `https://source.unsplash.com/random/800x600?${program.category}`}
                 alt={program.title || program.name}
                 className="w-full h-full object-cover"
               />
               <Badge className="absolute top-3 right-3 bg-white/90 text-neutral-900 shadow-sm backdrop-blur-sm">
                 {program.category}
               </Badge>
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{program.title || program.name}</CardTitle>
              <CardDescription>{program.duration_days} Days • {(!program.price || program.price === 0) ? 'Free' : 'Premium'}</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1">
              <p className="text-sm text-neutral-600 line-clamp-3">
                 {program.description || `Explore our ${program.title} program designed to help with ${program.category}.`}
              </p>
            </CardContent>
            
            <CardFooter className="pt-4 border-t border-neutral-100">
              <Button 
                className="w-full bg-[#2A2A2A] hover:bg-[#1a1a1a] text-white"
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
  );
}
