import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

// Block Components
import { TopSectionUserPersonalized } from './blocks/TopSectionUserPersonalized';
import { ResourceGridBlock } from './blocks/ResourceGridBlock';
import { AccountDetailsSection } from './blocks/AccountDetailsSection';
import { UserLoginBlock } from './blocks/UserLoginBlock';
import { MoodJournalMonthBlock } from './blocks/MoodJournalMonthBlock';

import { cn } from './ui/utils';

export function BlocksShowcase() {
  const [selectedUser] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    avatar: undefined,
    moodScore: 7.8,
    daysActive: 42,
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: false,
      moodReminders: true,
    }
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [accountEditable, setAccountEditable] = useState(false);

  return (
    <div className="min-h-screen p-4 space-y-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 mb-8">
          <h1 
            style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}
          >
            iKan Blocks Showcase
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>
            Complete implementation of the iKan blocks system with layouts, interactions, and responsive design.
          </p>
          <Badge variant="secondary" className="w-fit">
            Blocks JSON Implementation
          </Badge>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="mood">Mood Journal</TabsTrigger>
          </TabsList>

          {/* Dashboard Blocks */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Blocks</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Personalized dashboard components with user data and attention widgets.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    TopSectionUserPersonalized
                  </h3>
                  <TopSectionUserPersonalized user={selectedUser} />
                  <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Layout:</strong> Row layout with responsive flex columns</p>
                    <p><strong>Components:</strong> WellbeingSnapshotWidget, NeedsAttentionWidget</p>
                    <p><strong>Features:</strong> Personalized greeting, mood score, activity tracking, action items</p>
                  </div>
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Login Block</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Complete authentication form with validation and proper mental health branding.
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <UserLoginBlock
                    onSubmit={(credentials) => console.log('Login:', credentials)}
                    onForgotPassword={() => console.log('Forgot password')}
                    onValidate={(field, value) => {
                      if (field === 'email' && !value.includes('@')) return 'Invalid email';
                      return null;
                    }}
                  />
                </div>
                <div className="text-sm mt-6 space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                  <p><strong>Layout:</strong> Column layout with center alignment</p>
                  <p><strong>Features:</strong> Real-time validation, loading states, forgot password link</p>
                  <p><strong>Interactions:</strong> onSubmit, onValidate with custom validation support</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Blocks */}
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Grid Block</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Responsive grid system for displaying mental health resources with filtering and sorting.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                <ResourceGridBlock
                  onResourceSelect={(id) => console.log('Selected resource:', id)}
                  onFilter={(category) => console.log('Filtered by:', category)}
                  onSort={(sortBy) => console.log('Sorted by:', sortBy)}
                />
                
                <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                  <p><strong>Grid System:</strong> 12-column grid with responsive breakpoints (xs: 1, sm: 2, md: 3, lg: 4)</p>
                  <p><strong>Interactions:</strong> Filter by category, sort by date/title/read time</p>
                  <p><strong>Features:</strong> Resource cards with metadata, category badges, read time indicators</p>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Blocks */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Account Details Section</CardTitle>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                      Complete user profile management with avatar, preferences, and notification settings.
                    </p>
                  </div>
                  <Button
                    variant={accountEditable ? "outline" : "default"}
                    onClick={() => setAccountEditable(!accountEditable)}
                  >
                    {accountEditable ? 'View Mode' : 'Edit Mode'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                
                <AccountDetailsSection
                  user={selectedUser}
                  editable={accountEditable}
                  onSave={(userData) => {
                    console.log('Saved user data:', userData);
                    setAccountEditable(false);
                  }}
                  onEdit={() => setAccountEditable(true)}
                />
                
                <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                  <p><strong>Layout:</strong> Column layout with card sections</p>
                  <p><strong>Components:</strong> UserAvatar, TextInput fields, SwitchToggle preferences</p>
                  <p><strong>Features:</strong> Editable avatar, form validation, notification preferences</p>
                  <p><strong>Interactions:</strong> Edit/save modes, preference toggles, file upload</p>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Mood Journal Blocks */}
          <TabsContent value="mood" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mood Journal Month Block</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Interactive calendar for mood tracking with emoji selection and journal entries.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                <MoodJournalMonthBlock
                  selectedDate={selectedDate}
                  selectedMood={selectedMood}
                  onSelectDate={setSelectedDate}
                  onSelectMood={(mood, emoji) => {
                    setSelectedMood(mood);
                    console.log('Selected mood:', mood, emoji);
                  }}
                />
                
                <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                  <p><strong>Layout:</strong> Column layout with calendar and mood selection</p>
                  <p><strong>Components:</strong> MoodJournalCalendar, MoodJournalEmojiSet</p>
                  <p><strong>Features:</strong> Monthly calendar view, mood emoji visualization, date selection</p>
                  <p><strong>Interactions:</strong> selectDay, recordMood with visual feedback</p>
                </div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Implementation Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Blocks Implementation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Layout System
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• Row, column, and grid layouts</li>
                  <li>• Responsive breakpoints</li>
                  <li>• Constraint-based sizing</li>
                  <li>• Gap and alignment control</li>
                  <li>• 12-column grid system</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Block Features
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• Interactive components</li>
                  <li>• Data binding and state</li>
                  <li>• Event handling</li>
                  <li>• Form validation</li>
                  <li>• Real-time updates</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Design Compliance
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• iKan design tokens</li>
                  <li>• Consistent spacing</li>
                  <li>• Responsive design</li>
                  <li>• Accessibility features</li>
                  <li>• Animation system</li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>
                JSON Configuration Mapping
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <p><strong>Constraints:</strong> minWidth/maxWidth → CSS custom properties</p>
                  <p><strong>Layout:</strong> type/gap/responsive → Flexbox/Grid classes</p>
                </div>
                <div>
                  <p><strong>Items:</strong> component/widget → React components</p>
                  <p><strong>Interactions:</strong> Event handlers and callbacks</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                All blocks implement the JSON specifications with proper constraints, layouts, components, 
                and interactions. They're fully integrated with the iKan design system and ready for 
                production use in the mental health PWA.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}