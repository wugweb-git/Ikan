import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { apiClient } from '../../lib/api-client';
import { useNotifications } from '../../contexts/NotificationContext';
import { Loader2, Check, Database, RefreshCw } from 'lucide-react';
import { EquipProgram, DayContent, Activity } from '../../lib/equip-admin-types';

export function SeedDailyTracker() {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resultMessage, setResultMessage] = useState('');

  const seedDailyTracker = async () => {
    setLoading(true);
    setStatus('idle');
    
    try {
      // 1. Check if Daily Tracker already exists
      const programs = await apiClient.getEquipPrograms();
      const existingTracker = (Array.isArray(programs) ? programs : (programs as any).programs || [])
        .find((p: any) => p.slug === 'daily-tracker' || p.title === 'Daily Tracker');

      if (existingTracker) {
        setResultMessage(`Daily Tracker already exists (ID: ${existingTracker.id || existingTracker.equip_id}).`);
        setStatus('success');
        setLoading(false);
        return;
      }

      // 2. Define Daily Tracker Content
      // Create a 7-day repeating structure
      const dailyContent: DayContent[] = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1}`,
        description: 'Daily check-in and reflection.',
        dayType: 'practice',
        activities: [
          {
            id: `dt-day-${i + 1}-mood`,
            title: 'Mood Check-in',
            type: 'exercise',
            content: 'How are you feeling today?',
            duration: 1,
            required: true,
            order: 0,
            autoAdvance: true,
            exerciseConfig: {
              subtype: 'single-select',
              prompt: 'How are you feeling right now?',
              options: ['Great', 'Good', 'Okay', 'Low', 'Bad'],
              scoring: { enabled: true, maxScore: 5 }
            }
          },
          {
            id: `dt-day-${i + 1}-journal`,
            title: 'Daily Journal',
            type: 'journal',
            content: 'What is one thing you are grateful for today?',
            duration: 3,
            required: false,
            order: 1,
            autoAdvance: false
          }
        ]
      }));

      // Add Onboarding (Day 0)
      const onboardingDay: DayContent = {
        day: 0,
        title: 'Welcome to Daily Tracking',
        description: 'Set up your tracking preferences.',
        dayType: 'lesson',
        activities: [
          {
            id: 'dt-onboarding-1',
            title: 'Welcome',
            type: 'lesson',
            content: 'Welcome to your Daily Tracker. This tool helps you monitor your well-being over time.',
            duration: 1,
            required: true,
            order: 0,
            autoAdvance: true
          },
          {
            id: 'dt-onboarding-2',
            title: 'Goal Setting',
            type: 'journal',
            content: 'What do you hope to achieve by tracking your daily mood?',
            duration: 2,
            required: true,
            order: 1,
            autoAdvance: false
          }
        ]
      };

      const fullContent = [onboardingDay, ...dailyContent];

      const newProgram: Partial<EquipProgram> = {
        title: 'Daily Tracker',
        slug: 'daily-tracker',
        description: 'A daily program to track your mood, gratitude, and well-being.',
        category: 'wellness',
        difficulty: 'beginner',
        duration_days: 7,
        is_paid: false,
        price: 0,
        currency: 'USD',
        published: true,
        can_repeat: true, // Custom metadata field often used for daily trackers
        thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1000&auto=format&fit=crop',
        cover_image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&auto=format&fit=crop',
        daily_content: fullContent,
        metadata: {
          type: 'daily_tracker',
          repeatable: true
        }
      };

      // 3. Create the Program
      await apiClient.createEquipProgram(newProgram);
      
      setResultMessage('Daily Tracker content seeded successfully!');
      setStatus('success');
      showToast('success', 'Seeding Complete', 'Daily Tracker program has been created.');

    } catch (error: any) {
      console.error('Seeding failed:', error);
      setResultMessage(`Failed to seed: ${error.message || 'Unknown error'}`);
      setStatus('error');
      showToast('error', 'Seeding Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Seed Daily Tracker Content
        </CardTitle>
        <CardDescription>
          Initialize the database with the standard Daily Tracker program structure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            This will create a "Daily Tracker" program with 7 days of repeatable content if it doesn't already exist.
          </p>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={seedDailyTracker} 
              disabled={loading}
              className="w-full sm:w-auto"
              style={{
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Seed Daily Tracker
                </>
              )}
            </Button>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">{resultMessage}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200 text-sm">
                {resultMessage}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
